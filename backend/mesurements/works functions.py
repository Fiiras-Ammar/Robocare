
from rasterio.io import MemoryFile
from pyproj.crs import CRS
from .functions import get_available_dates, cordinates_to_polygon
import datetime
from .formulas import algos
from . import params as service_account
import ee
import requests
from django.core.files.base import ContentFile
from .models import Histogram, HistogramBins
from .serializers import HistogramSerializer, HistogramBinsSerializer
import rasterio
import os
from osgeo import gdal, osr  # GDAL library for histogram calculations
import tempfile  # For creating temporary files
from scipy.stats import scoreatpercentile
import numpy as np
from PIL import Image
from django.conf import settings
import rasterio as rio
from rasterio.warp import calculate_default_transform, reproject, Resampling
from pyproj.crs import CRS

credentials = ee.ServiceAccountCredentials(
    service_account.private_key, service_account.private_key
)
ee.Initialize(credentials)


def create_main_tif(task, date, provider="S2"):
    try:
        histogram = Histogram.objects.get(task=task.id, date=date)
        serializer = HistogramSerializer(histogram)
        return serializer
    except Histogram.DoesNotExist:
        if provider not in algos:
            return {"error": "Provider not found"}

        ind = algos[provider]
        polygon = cordinates_to_polygon(task.area_of_interest[0])
        start_date = date
        start_date_datetime = datetime.datetime.strptime(
            start_date, "%Y-%m-%d")
        end_date = start_date_datetime + datetime.timedelta(days=1)

        # Convert Django polygon to Earth Engine geometry
        ee_polygon = ee.Geometry.Polygon(list(polygon.exterior.coords))

        # Query and clip the image using Earth Engine
        image = (
            ee.ImageCollection(ind['collection'])
            .filterDate(start_date, end_date)
            .filterBounds(ee_polygon)
            .first()
            .clip(ee_polygon)
        )

        # Get download URL for the clipped image
        url = image.getDownloadUrl({
            'scale': 10,
            'crs': 'EPSG:4326',
            'format': 'GEO_TIFF'
        })

        # Download the image using requests
        response = requests.get(url)

        if response.status_code == 200:
            # Create a ContentFile from the response content
            tif_content = ContentFile(response.content, name=f"{date}.tif")
            serialized_data = {
                "task": task.id,
                "date": start_date_datetime.date(),
                "tif_file": tif_content,
                "provider": provider
            }
            serializer = HistogramSerializer(data=serialized_data)

            if serializer.is_valid():
                serializer.save()
                return serializer
            else:
                return serializer.errors
        else:
            return {"error": "Failed to download image"}


def reproject_raster(in_path, out_path, new_crs):
    """
    Reprojects a raster to a new CRS.

    Parameters:
    - in_path: str, path to the input raster file
    - out_path: str, path to the output raster file
    - new_crs: str, new CRS (e.g., 'EPSG:4326')
    """
    dst_crs = CRS.from_string(new_crs)

    with rio.open(in_path) as src:
        transform, width, height = calculate_default_transform(
            src.crs, dst_crs, src.width, src.height, *src.bounds)

        kwargs = src.meta.copy()
        kwargs.update({
            'crs': dst_crs,
            'transform': transform,
            'width': width,
            'height': height
        })

        with rio.open(out_path, 'w', **kwargs) as dst:
            for i in range(1, src.count + 1):
                reproject(
                    source=rio.band(src, i),
                    destination=rio.band(dst, i),
                    src_transform=src.transform,
                    src_crs=src.crs,
                    dst_transform=transform,
                    dst_crs=dst_crs,
                    resampling=Resampling.nearest
                )


def create_index_tif(task, date, index="NDVI", provider="S2"):
    try:
        histogram = Histogram.objects.get(task=task.id, date=date)
        histogrambins = HistogramBins.objects.get(
            histogram=histogram.id, index=index)

        # Return existing data if it already exists
        serializer = HistogramBinsSerializer(histogrambins)
        return serializer.data
    except HistogramBins.DoesNotExist:
        tif_path = histogram.tif_file.path
        ind = algos[provider][index]

        with rio.open(tif_path) as src:
            bands = {key: src.read(band)
                     for key, band in ind.get('bands', {}).items()}
            expr_context = {key: band for key, band in bands.items()}
            index_result = eval(ind['expr'], {}, expr_context)

        # Prepare the output directory and file names
        output_directory = os.path.join(
            settings.MEDIA_ROOT, f'tasks/tiff/{task.id}/{date}/index')
        os.makedirs(output_directory, exist_ok=True)
        output_file_name = f'{index}.tif'
        temp_file_path = os.path.join(output_directory, f'{index}_temp.tif')

        try:
            # Reproject the raster to EPSG:4326 directly to the temp file
            reproject_raster(tif_path, temp_file_path, 'EPSG:4326')

            # Calculate NDVI and write it to the temp file
            with rio.open(temp_file_path, 'r+') as reprojected_src:
                new_ndvi_raster = np.zeros_like(index_result)
                new_ndvi_raster[index_result !=
                                np.nan] = index_result[index_result != np.nan]
                reprojected_src.write(new_ndvi_raster, 1)

            # Calculate percentiles, bins, and histogram
            flat_data = index_result.flatten()
            valid_data = flat_data[np.isfinite(flat_data)]
            hist, bins = np.histogram(valid_data, bins=256, range=(
                valid_data.min(), valid_data.max()))
            lower_percentile = np.percentile(valid_data, 2)
            upper_percentile = np.percentile(valid_data, 98)

            # Now save it to the model's FileField
            with open(temp_file_path, 'rb') as f:
                histogrambins = HistogramBins.objects.create(
                    histogram=histogram,
                    index=index,
                    bins=hist.tolist(),
                    bins_values=bins.tolist(),
                    percentile=[lower_percentile, upper_percentile],
                    tif_file=ContentFile(f.read(), name=output_file_name)
                )

            # Clean up the temporary file
            os.remove(temp_file_path)

            # Serialize and return the data
            serializer = HistogramBinsSerializer(histogrambins)
            return serializer.data

        except Exception as e:
            print(str(e))
            return {"error": str(e)}

    #     dataset = gdal.Open(tif_path, gdal.GA_ReadOnly)
    #     if not dataset:
    #         return {"error": "Failed to open TIFF file with GDAL"}

    #     # Get necessary information from the dataset
    #     num_bands = dataset.RasterCount
    #     bands = [dataset.GetRasterBand(i+1).ReadAsArray()
    #              for i in range(num_bands)]

    #     # Create the expression context with the bands
    #     expr_context = {f'B{i+1}': bands[i] for i in range(num_bands)}

    #     # Evaluate the index expression
    #     index_result = eval(ind['expr'], {}, expr_context)

    #     # Ensure the index result is in float32 format
    #     index_result = index_result.astype(np.float32)

    #     # Create a PIL image from the index result
    #     img = Image.fromarray(index_result)

    #     # Prepare a temporary file to save the PIL image
    #     with tempfile.NamedTemporaryFile(delete=False, suffix='.tif') as tmpfile:
    #         tmpfile_path = tmpfile.name
    #         img.save(tmpfile_path, format='TIFF')

    #         # Create a ContentFile with the temp TIFF file content and name
    #         tif_content = ContentFile(
    #             open(tmpfile_path, 'rb').read(), name=f"{task.id}_{date}_{index}.tif")

    #     # Create a new GeoTIFF file with GDAL
    #     out_driver = gdal.GetDriverByName('GTiff')
    #     if not out_driver:
    #         return {"error": "Failed to create GeoTIFF driver with GDAL"}

    #     out_dataset = out_driver.Create(
    #         f"{task.id}_{date}_{index}.tif",
    #         img.width,
    #         img.height,
    #         1,  # Number of bands
    #         gdal.GDT_Float32
    #     )
    #     if not out_dataset:
    #         return {"error": "Failed to create output GeoTIFF dataset with GDAL"}

    #     # Write data to the new GeoTIFF dataset
    #     out_band = out_dataset.GetRasterBand(1)
    #     out_band.WriteArray(index_result)

    #     # Set the projection and geotransform
    #     out_dataset.SetProjection(dataset.GetProjection())
    #     out_dataset.SetGeoTransform(dataset.GetGeoTransform())

    #     # Compute statistics (optional)
    #     out_band.ComputeStatistics(False)

    #     # Close the datasets
    #     out_band = None
    #     out_dataset = None
    #     dataset = None

    #     # Compute histogram, bins, and percentiles
    #     flat_data = index_result.flatten()
    #     valid_data = flat_data[np.isfinite(flat_data)]
    #     hist, bins = np.histogram(valid_data, bins=256, range=(
    #         valid_data.min(), valid_data.max()))
    #     lower_percentile = np.percentile(valid_data, 2)
    #     upper_percentile = np.percentile(valid_data, 98)

    #     # Serialize and save the new TIF file using the HistogramBinsSerializer
    #     serialized_data = {
    #         "histogram": histogram.id,
    #         "index": index,
    #         "tif_file": tif_content,  # Use the ContentFile with valid name
    #         "bins": hist.tolist(),
    #         "bins_values": bins.tolist(),
    #         "percentile": [lower_percentile, upper_percentile]
    #     }
    #     serializer = HistogramBinsSerializer(data=serialized_data)
    #     if serializer.is_valid():
    #         serializer.save()
    #         return serializer.data
    #     else:
    #         return {"error": "Serialization error", "details": serializer.errors}

    # except Exception as e:
    #     print(str(e))
    #     return {"error": str(e)}
