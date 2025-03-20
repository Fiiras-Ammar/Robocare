from decimal import Decimal
from rasterio.io import MemoryFile
from pyproj.crs import CRS
from .functions import cordinates_swapped, cordinates_to_polygon, create_polygon, transform_coords
import datetime
from .formulas import algos
from . import params as service_account
import ee
import requests
from django.core.files.base import ContentFile
from .models import Histogram, HistogramBins, TerrainModel, IndexDifference
from .serializers import HistogramSerializer, HistogramBinsSerializer, TerrainModelSerializer, IndexDifferenceSerializer
import os
# GDAL library for histogram calculations
from osgeo import gdal, gdalconst, osr
import tempfile  # For creating temporary files
from scipy.stats import scoreatpercentile
import numpy as np
from PIL import Image
from django.conf import settings
import rasterio as rio
from rasterio.warp import calculate_default_transform, reproject, Resampling
from pyproj.crs import CRS
import time
import subprocess
from osgeo import ogr
import matplotlib.pyplot as plt
import calendar
from dateutil.relativedelta import relativedelta
from pandas._libs.tslibs.conversion import timezone
import matplotlib.colors as colors
import json

import datetime

credentials = ee.ServiceAccountCredentials(
    service_account.private_key, service_account.private_key
)
ee.Initialize(credentials)


def create_main_tif(task, date, provider="S2"):


    try:
        colormap = generate_color_palette(256)
        histogram = Histogram.objects.get(task=task.id, date=date)
        serializer = HistogramSerializer(histogram)
        try:
            histogram_bins = HistogramBins.objects.filter(
                histogram=histogram.id, index="NDVI").first()
            serializer_bins = HistogramBinsSerializer(histogram_bins)
            res = {
                "histogram": serializer.data,
                "index_ndvi": serializer_bins.data,
                "colormap": colormap
            }
            return res
        except HistogramBins.DoesNotExist:
            ndvi_calc = create_index_tif(task, date, True)
            colormap = generate_color_palette(256)

            res = {
                "histogram": serializer.data,
                "index_ndvi": ndvi_calc,
                "colormap": colormap
            }
            return res

    except Histogram.DoesNotExist:
        try:

            if provider not in algos:
                return {"error": "Provider not found"}

            ind = algos[provider]
            print("ind", ind)
            poly = cordinates_to_polygon(task.area_of_interest[0])
            bbox = poly.bounds().getInfo()
            polygon = ee.Geometry.Polygon(bbox["coordinates"][0])
            start_date = date
            start_date_datetime = datetime.datetime.strptime(
                start_date, "%Y-%m-%d")
            end_date = start_date_datetime + datetime.timedelta(days=1)

            imgs_collection = ee.ImageCollection(ind['collection']).filterDate(start_date, end_date).filterBounds(polygon)

            full_coverage_collection = imgs_collection.filter(ee.Filter.contains(
                leftField='.geo',  # obtained image geometry
                rightValue=polygon
            ))

            image = full_coverage_collection.first().clip(polygon)

            url = image.getDownloadUrl({
                'bands': ind['bands'],
                'scale': ind['scale'],
                'format': 'GEO_TIFF'
            })

            print(url)
            # Download the image using requests
            response = requests.get(url, verify=False)
            if response.status_code == 200:
                # Create a ContentFile from the response content
                tif_content = ContentFile(response.content, name=f"{date}.tif")

                # Save the TIFF file temporarily
                output_directory = os.path.join(
                    settings.MEDIA_ROOT, f'tasks/tiff/{task.id}/{date}/')
                os.makedirs(output_directory, exist_ok=True)
                tif_file_path = os.path.join(output_directory, f"{date}.tif")
                with open(tif_file_path, 'wb') as temp_tif:
                    temp_tif.write(tif_content.read())

                ds = rio.open(tif_file_path)
                crs = CRS.from_user_input(ds.crs).to_epsg()
                ds.close()
                # Prepare for shapefile creation
                poly_swaped = cordinates_swapped(task.area_of_interest[0])
                poly_projected = transform_coords(poly_swaped,crs)
                poly = create_polygon(poly_projected)
                shapefile_path = os.path.join(output_directory, f'{date}.shp')
                write_shapefile(poly, shapefile_path, tif_file_path)

                # Create a ContentFile for the shapefile
                with open(shapefile_path, 'rb') as shapefile:
                    shapefile_content = ContentFile(
                        shapefile.read(), name=f"{date}.shp")

                # Prepare serialized data
                serialized_data = {
                    "task": task.id,
                    "date": start_date_datetime.date(),
                    "tif_file": tif_content,
                    "shapefile_file": shapefile_content,
                    "provider": provider
                }

                # Serialize and save the data
                serializer = HistogramSerializer(data=serialized_data)
                if serializer.is_valid():
                    serializer.save()
                    ndvi_calc = create_index_tif(task, date, True)
                    colormap = generate_color_palette(256)
                    res = {
                        "histogram": serializer.data,
                        "index_ndvi": ndvi_calc,
                        "colormap": colormap

                    }
                    return res
                else:
                    return serializer.errors
            else:
                return {"error": "Failed to download image"}
        except Exception as e:
            print(e)


def create_terrain_model_tif(task, provider="DEM/GLO30"):
    try:
        task = task
        shape_file_path = Histogram.objects.filter(task=task.id).first().shapefile_file.path
        terrain_model = TerrainModel.objects.filter(task=task.id).first()
        data = TerrainModelSerializer(terrain_model).data
        terrain_color_map = generate_color_palette(256, "terrain")
        data['colormap'] = terrain_color_map
        
        if terrain_model:
            print('terrain model already created returning')
            return data  

        poly = cordinates_to_polygon(task.area_of_interest[0])
        bbox = poly.bounds().getInfo()
        polygon = ee.Geometry.Polygon(bbox["coordinates"][0])
        
        if(provider == "DEM/GLO30"):
            dem_collection = ee.ImageCollection("COPERNICUS/DEM/GLO30").select("DEM")
            # .mosaic().clip(polygon)
            latest_acquisition_date = ee.Date(dem_collection.aggregate_max('system:time_start'))
            latest_date_str = latest_acquisition_date.format('YYYY-MM-DD').getInfo()
            
            filtered_dem = dem_collection.filterDate(latest_acquisition_date, latest_acquisition_date.advance(1, 'day'))
            dem = filtered_dem.mosaic().clip(poly)
            
            terrain_model_directory= os.path.join(settings.MEDIA_ROOT, f"tasks/terrain_model/{task.id}")
            
            os.makedirs(terrain_model_directory, exist_ok=True)
            
            temp_dem_output_path = os.path.join(terrain_model_directory, "temp_dem.tiff")
            cut_dem_output_path = os.path.join(terrain_model_directory, "cut_dem.tiff")

            dem_tif_url = dem.getDownloadURL({
                'scale': 30,
                'region': polygon,
                'format': 'GeoTIFF'
            })
            
            response = requests.get(dem_tif_url)
            
            if(response.status_code == 200):
                
                with open(temp_dem_output_path, "wb") as file:
                    file.write(response.content)
                
                dem_ds = gdal.Open(temp_dem_output_path)

                gdal.Warp(cut_dem_output_path,dem_ds,
                        cutlineDSName=shape_file_path,
                        cropToCutline=True,dstNodata='NaN',
                        format='GTiff')

                dem_ds = None
                # shapefile_ds = None
                
                with rio.open(cut_dem_output_path) as src:
                    altitude_values = src.read(1)
                    min = Decimal(float(np.nanmin(altitude_values)))
                    max = Decimal(float(np.nanmax(altitude_values)))
                    
                with open(cut_dem_output_path, "rb") as file:
                    terrain_model = TerrainModel.objects.create(
                        task =task,
                        provider =provider,
                        type = "DEM",
                        resolution = 30,
                        date_acquired = latest_date_str,
                        tif_file = ContentFile(file.read(), name="DEM.tiff"),
                        min = min,
                        max = max,
                    )
                data = TerrainModelSerializer(terrain_model).data
                
                terrain_color_map = generate_color_palette(256, "terrain")
                
                data['colormap'] = terrain_color_map
                clean_temp_file([temp_dem_output_path, cut_dem_output_path])
                
                return data                            
            
    except Exception as e:
        print(e)
        return {}
    
def create_shapefile(task, date, raster):
    poly_swaped = cordinates_swapped(task.area_of_interest[0])
    poly_projected = transform_coords(poly_swaped)
    poly = create_polygon(poly_projected)
    output_directory = os.path.join(
        settings.MEDIA_ROOT, f'tasks/tiff/{task.id}/{date}/')
    os.makedirs(output_directory, exist_ok=True)
    shapefile_path = os.path.join(
        output_directory, f'{date}.shp')
    write_shapefile(poly, shapefile_path, raster)


# def reproject_raster(in_path, out_path, new_crs):
#     """
#     Reprojects a raster to a new CRS.

#     Parameters:
#     - in_path: str, path to the input raster file
#     - out_path: str, path to the output raster file
#     - new_crs: str, new CRS (e.g., 'EPSG:4326')
#     """
#     dst_crs = CRS.from_string(new_crs)

#     with rio.open(in_path) as src:
#         transform, width, height = calculate_default_transform(
#             src.crs, dst_crs, src.width, src.height, *src.bounds)

#         kwargs = src.meta.copy()
#         kwargs.update({
#             'crs': dst_crs,
#             'transform': transform,
#             'width': width,
#             'height': height
#         })

#         with rio.open(out_path, 'w', **kwargs) as dst:
#             for i in range(1, src.count + 1):
#                 reproject(
#                     source=rio.band(src, i),
#                     destination=rio.band(dst, i),
#                     src_transform=src.transform,
#                     src_crs=src.crs,
#                     dst_transform=transform,
#                     dst_crs=dst_crs,
#                     resampling=Resampling.nearest
#                 )


def write_shapefile(poly, out_shp, raster_path):
    # Get the spatial reference from the raster
    print("raster path", raster_path)
    raster = gdal.Open(raster_path)
    raster_srs = osr.SpatialReference()
    raster_srs.ImportFromWkt(raster.GetProjection())

    # Now convert it to a shapefile with OGR
    driver = ogr.GetDriverByName('Esri Shapefile')
    ds = driver.CreateDataSource(out_shp)
    layer = ds.CreateLayer('', raster_srs, ogr.wkbPolygon)
    # Add one attribute
    layer.CreateField(ogr.FieldDefn('id', ogr.OFTInteger))
    defn = layer.GetLayerDefn()

    # Create a new feature (attribute and geometry)
    feat = ogr.Feature(defn)
    feat.SetField('id', 123)

    # Make a geometry, from Shapely object
    geom = ogr.CreateGeometryFromWkt(poly)
    feat.SetGeometry(geom)

    layer.CreateFeature(feat)
    feat = geom = None  # destroy these

    # Save and close everything
    ds = layer = feat = geom = None


def extract_bands(src_path, dst_path, bands):
    """
    Extract specific bands from a raster and save them to a new file.

    Parameters:
    - src_path: str, path to the input raster file
    - dst_path: str, path to the output raster file
    - bands: dict, dictionary of band names and their indices
    """
    with rio.open(src_path) as src:
        meta = src.meta.copy()
        meta.update(count=len(bands))

        with rio.open(dst_path, 'w', **meta) as dst:
            for i, (band_name, band_index) in enumerate(bands.items(), start=1):
                band_data = src.read(band_index)
                dst.write(band_data, i)

                # Set band description
                dst.set_band_description(i, band_name)
                
def histogram_stretch(band, lower_percentile=2, upper_percentile=98):
    lower = np.percentile(band, lower_percentile)
    upper = np.percentile(band, upper_percentile)
    stretched = (band - lower) / (upper - lower) * 255
    stretched = np.clip(stretched, 1, 254)
    return stretched.astype(np.uint8)
def create_rgb_tif(task,histogram,date,provider):
    try:
        
        tif_path = histogram.tif_file.path
        shapefile_path = histogram.shapefile_file.path
        
        rgb_path = None
        
                    # Serialize and return the data
        # serializer = HistogramBinsSerializer(histogrambins)
        
        rgb_directory = os.path.join(settings.MEDIA_ROOT, f'tasks/tiff/{task.id}/{date}/index')
        os.makedirs(rgb_directory, exist_ok=True)
        
        temp_rgb_output_path = os.path.join(rgb_directory, "temp_rgb.tiff")
        cut_rgb_output_path = os.path.join(rgb_directory, "cut_rgb.tiff")
            
        with rio.open(tif_path) as ds:
        
            profile = ds.profile
            red = ds.read(3) / 10000
            green = ds.read(2) / 10000
            blue = ds.read(1) / 10000

            red = np.clip(red * 255, 0, 255).astype(np.uint8)
            green = np.clip(green * 255, 0, 255).astype(np.uint8)
            blue = np.clip(blue * 255, 0, 255).astype(np.uint8)

            red = histogram_stretch(red)
            green = histogram_stretch(green)
            blue = histogram_stretch(blue)

            rgb_image = np.stack((red, green, blue), axis=-1)

            profile.update(count=3, dtype='uint8')
            
            with rio.open(temp_rgb_output_path, 'w', **profile) as dst:
                for i in range(3):
                    dst.write(rgb_image[:, :, i], i + 1)
            
                    
                    
        rgb_ds = gdal.Open(temp_rgb_output_path)

        gdal.Warp(cut_rgb_output_path,rgb_ds,cutlineDSName=shapefile_path,cropToCutline=True,dstNodata=0, dstAlpha=True, format='GTiff')

        
        with open(cut_rgb_output_path, "rb") as file:
            rgb_instance = HistogramBins.objects.create(
                histogram =histogram,
                index = "RGB",
                tif_file =ContentFile(file.read(), name="RGB.tif"),
            )
        data = HistogramBinsSerializer(rgb_instance).data
        
        rgb_ds = None
        clean_temp_file([temp_rgb_output_path, cut_rgb_output_path])
        
        return data
    except Exception as e:
        print(e)
        return None

def create_index_tif(task, date, initial=False, index="NDVI", provider="S2"):
    index = index.upper()

    try:

        histogram = Histogram.objects.get(task=task.id, date=date)

        # colormap = generate_color_palette(256)

        histogrambins = HistogramBins.objects.get(
            histogram=histogram.id, index=index)

        serializer_histogram = HistogramSerializer(histogram)


        # Return existing data if it already exists
        serializer = HistogramBinsSerializer(histogrambins)
        
        colormap = None
        
        if(index != "RGB"):
            colormap = generate_color_palette(256)
            
        if initial:
            print("inside initial")
            return serializer.data
        else:
            res = {
                "histogram": serializer_histogram.data,
                "index": serializer.data,
                "colormap": colormap
            }
            return res
    except HistogramBins.DoesNotExist:

        serializer_histogram = HistogramSerializer(histogram)
        colormap = generate_color_palette(256)

        tif_path = histogram.tif_file.path

        if(index == "RGB" and provider != "PS"):
            
            index = create_rgb_tif(task=task, histogram=histogram, date=date, provider=provider)
            res = {
                "histogram": serializer_histogram.data,
                "index": index,
                "colormap": None

            }
            return res
        
        ind = algos[provider][index]

        # Prepare the output directory and file names
        output_directory = os.path.join(
            settings.MEDIA_ROOT, f'tasks/tiff/{task.id}/{date}/index')
        os.makedirs(output_directory, exist_ok=True)
        temp_file_path = os.path.join(output_directory, f'{index}_temp.tif')

        with rio.open(tif_path) as src:

            bands = {key: src.read(band_num, masked=True).astype(
                float) for key, band_num in ind['bands'].items()}

            # Calculate the index dynamically
            expr = ind['expr']
            for key, band in bands.items():
                expr = expr.replace(key, f'bands["{key}"]')
            result = eval(expr)
            # Update metadata for the output NDVI file
            kwargs = src.meta.copy()
            kwargs.update({
                'count': 1,  # Number of bands in the output file
                'dtype': rio.float32,  # Data type of the output file
            })

            # Create the output NDVI file
            with rio.open(temp_file_path, 'w', **kwargs) as dst:
                dst.write(result.astype(rio.float32), 1)

        output_directory_resampled = os.path.join(
            settings.MEDIA_ROOT, f'tasks/tiff/{task.id}/{date}/index_resampled')

        # Check if the output directory exists, if not, create it with appropriate permissions
        if not os.path.exists(output_directory_resampled):
            try:
                os.makedirs(output_directory_resampled, exist_ok=True)
                # Set directory permissions
                os.chmod(output_directory_resampled, 0o777)
                print(
                    f"Created output_directory_resampled: {output_directory_resampled}")
            except Exception as e:
                print(f"Failed to create output_directory_resampled: {e}")
                return {"error": str(e)}
        resampled_path = os.path.join(
            output_directory_resampled, f'{index}_resampled.tif')

        if provider == "S2":
            xres = 1
            yres = 1
        else:
            xres = 5
            yres = 5

        gdal.Warp(resampled_path, temp_file_path, format='GTiff',
                  xRes=xres, yRes=yres, resampleAlg='lanczos', dstNodata=np.nan)
        # Open the cutline shapefile

        output_directory_cutline = os.path.join(
            settings.MEDIA_ROOT, f'tasks/tiff/{task.id}/{date}/')

        os.makedirs(output_directory_cutline, exist_ok=True)
        shapefile_path = os.path.join(
            output_directory_cutline, f'{date}.shp')
        cuted_path = os.path.join(
            output_directory, f'{index}_cuted.tif')
        cutline_ds = gdal.OpenEx(shapefile_path, gdal.OF_VECTOR)

        # Get the layer from the shapefile
        layer = cutline_ds.GetLayer()


        # Warp the input file using the cutline

        gdal.Warp(cuted_path, resampled_path, format='GTiff', cutlineDSName=shapefile_path,
                  cropToCutline=True, resampleAlg='lanczos', dstNodata=np.nan,
                  creationOptions=['COMPRESS=LZW', 'PREDICTOR=3'])

        # Close the datasets
        cutline_ds = None
        # ds = gdal.Open(resampled_path)
        # # coordinates = [(lon, lat) for lon, lat in task.area_of_interest[0]]
        # coordinates = cordinates_swapped(task.area_of_interest[0])
        # polygon = create_polygon(coordinates)
        # print("cordinates", coordinates)

        # output_directory_shapefile = os.path.join(
        #     settings.MEDIA_ROOT, f'tasks/tiff/{task.id}/{date}/shapefile')
        # # Check if the output directory exists, if not, create it with appropriate permissions
        # if not os.path.exists(output_directory_shapefile):
        #     try:
        #         os.makedirs(output_directory_shapefile, exist_ok=True)
        #         # Set directory permissions
        #         os.chmod(output_directory_shapefile, 0o777)
        #     except Exception as e:
        #         print(f"Failed to create output_directory_resampled: {e}")
        #         return {"error": str(e)}
        # shapefile_path = os.path.join(
        #     output_directory_shapefile, f'shapefile.shp')
        # # Perform the cutline operation using the shapefile
        # write_shapefile(polygon, shapefile_path)
        # try:
        #     gdal.Warp(cutline_path, ds, format='GTiff',
        #               cutlineDSName=shapefile_path, cropToCutline=True)
        #     print(f"Cutline operation complete: {cutline_path}")
        # except Exception as e:
        #     print(f"Cutline operation failed: {e}")
        #     return {"error": str(e)}

        output_file_name = f'{index}.tif'
        with rio.open(cuted_path, 'r') as f:
            # Calculate percentiles, bins, and histogram
            data = f.read()
            flat_data = data.flatten()
            valid_data = flat_data[np.isfinite(flat_data)]
            print("valid data", valid_data)
            # Calculate the first and third quartiles
            Q1 = np.percentile(valid_data, 25)
            Q3 = np.percentile(valid_data, 75)

            # Calculate the IQR
            IQR = Q3 - Q1

            # Define bounds for outliers
            lower_bound = Q1 - 1.5 * IQR
            upper_bound = Q3 + 1.5 * IQR

            # Filter out the outliers
            filtered_data = valid_data[(valid_data >= lower_bound) & (
                    valid_data <= upper_bound)]
            min_value = np.min(filtered_data)
            max_value = np.max(filtered_data)
            hist, bins = np.histogram(filtered_data, bins=256, range=(
                min_value, max_value))
            hist_static, bins_static = np.histogram(filtered_data, bins=256, range=(
                -1, 1))
            lower_percentile = np.percentile(filtered_data, 0)
            upper_percentile = np.percentile(filtered_data, 95)

        with open(cuted_path, 'rb') as f:
            histogrambins = HistogramBins.objects.create(
                histogram=histogram,
                index=index,
                bins=hist.tolist(),
                bins_static=hist_static.tolist(),
                bins_values=bins.tolist(),
                bins_values_static=bins_static.tolist(),
                percentile=[lower_percentile, upper_percentile],
                tif_file=ContentFile(f.read(), name=output_file_name),
                min=Decimal(str(min_value)),
                max=Decimal(str(max_value))
            )

            # Serialize and return the data
        serializer = HistogramBinsSerializer(histogrambins)
        temp_paths = [temp_file_path, resampled_path,
                      cuted_path]
        clean_temp_file(temp_paths)
        if initial:
            print("inside initial")
            return serializer.data
        else:
            res = {
                "histogram": serializer_histogram.data,
                "index": serializer.data,
                "colormap": colormap

            }
            return res


def create_index_tif_comparator(task, date, index="NDVI", provider="S2"):
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

        # Prepare the output directory and file names
        output_directory = os.path.join(
            settings.MEDIA_ROOT, f'tasks/tiff/{task.id}/{date}/index')
        os.makedirs(output_directory, exist_ok=True)
        temp_file_path = os.path.join(output_directory, f'{index}_temp.tif')

        with rio.open(tif_path) as src:

            bands = {key: src.read(band_num, masked=True).astype(
                float) for key, band_num in ind['bands'].items()}

            # Calculate the index dynamically
            expr = ind['expr']
            for key, band in bands.items():
                expr = expr.replace(key, f'bands["{key}"]')
            result = eval(expr)
            # Update metadata for the output NDVI file
            kwargs = src.meta.copy()
            kwargs.update({
                'count': 1,  # Number of bands in the output file
                'dtype': rio.float32,  # Data type of the output file
            })

            # Create the output NDVI file
            with rio.open(temp_file_path, 'w', **kwargs) as dst:
                dst.write(result.astype(rio.float32), 1)

        output_directory_resampled = os.path.join(
            settings.MEDIA_ROOT, f'tasks/tiff/{task.id}/{date}/index_resampled')
        # Check if the output directory exists, if not, create it with appropriate permissions
        if not os.path.exists(output_directory_resampled):
            try:
                os.makedirs(output_directory_resampled, exist_ok=True)
                # Set directory permissions
                os.chmod(output_directory_resampled, 0o777)
                print(
                    f"Created output_directory_resampled: {output_directory_resampled}")
            except Exception as e:
                print(f"Failed to create output_directory_resampled: {e}")
                return {"error": str(e)}
        resampled_path = os.path.join(
            output_directory_resampled, f'{index}_resampled.tif')

        if provider == "S2":
            xres = 1
            yres = 1
        else:
            xres = 5
            yres = 5

        gdal.Warp(resampled_path, temp_file_path, format='GTiff',
                  xRes=xres, yRes=yres, resampleAlg='lanczos', dstNodata=np.nan)
        # Open the cutline shapefile

        output_directory_cutline = os.path.join(
            settings.MEDIA_ROOT, f'tasks/tiff/{task.id}/{date}/')
        os.makedirs(output_directory_cutline, exist_ok=True)
        shapefile_path = os.path.join(
            output_directory_cutline, f'{date}.shp')
        cuted_path = os.path.join(
            output_directory, f'{index}_cuted.tif')
        cutline_ds = gdal.OpenEx(shapefile_path, gdal.OF_VECTOR)

        # Get the layer from the shapefile
        layer = cutline_ds.GetLayer()

        # Warp the input file using the cutline

        gdal.Warp(cuted_path, resampled_path, format='GTiff', cutlineDSName=shapefile_path,
                  cropToCutline=True, resampleAlg='lanczos', dstNodata=np.nan,
                  creationOptions=['COMPRESS=LZW', 'PREDICTOR=3'])

        # Close the datasets
        cutline_ds = None
        # ds = gdal.Open(resampled_path)
        # # coordinates = [(lon, lat) for lon, lat in task.area_of_interest[0]]
        # coordinates = cordinates_swapped(task.area_of_interest[0])
        # polygon = create_polygon(coordinates)
        # print("cordinates", coordinates)

        # output_directory_shapefile = os.path.join(
        #     settings.MEDIA_ROOT, f'tasks/tiff/{task.id}/{date}/shapefile')
        # # Check if the output directory exists, if not, create it with appropriate permissions
        # if not os.path.exists(output_directory_shapefile):
        #     try:
        #         os.makedirs(output_directory_shapefile, exist_ok=True)
        #         # Set directory permissions
        #         os.chmod(output_directory_shapefile, 0o777)
        #     except Exception as e:
        #         print(f"Failed to create output_directory_resampled: {e}")
        #         return {"error": str(e)}
        # shapefile_path = os.path.join(
        #     output_directory_shapefile, f'shapefile.shp')
        # # Perform the cutline operation using the shapefile
        # write_shapefile(polygon, shapefile_path)
        # try:
        #     gdal.Warp(cutline_path, ds, format='GTiff',
        #               cutlineDSName=shapefile_path, cropToCutline=True)
        #     print(f"Cutline operation complete: {cutline_path}")
        # except Exception as e:
        #     print(f"Cutline operation failed: {e}")
        #     return {"error": str(e)}

        output_file_name = f'{index}.tif'
        with rio.open(cuted_path, 'r') as f:
            # Calculate percentiles, bins, and histogram
            data = f.read()
            flat_data = data.flatten()
            valid_data = flat_data[np.isfinite(flat_data)]
            print("valid data", valid_data)
            # Calculate the first and third quartiles
            Q1 = np.percentile(valid_data, 25)
            Q3 = np.percentile(valid_data, 75)

            # Calculate the IQR
            IQR = Q3 - Q1

            # Define bounds for outliers
            lower_bound = Q1 - 1.5 * IQR
            upper_bound = Q3 + 1.5 * IQR

            # Filter out the outliers
            filtered_data = valid_data[(valid_data >= lower_bound) & (
                    valid_data <= upper_bound)]
            min_value = np.min(filtered_data)
            max_value = np.max(filtered_data)
            hist, bins = np.histogram(filtered_data, bins=256, range=(
                min_value, max_value))
            hist_static, bins_static = np.histogram(filtered_data, bins=256, range=(
                -1, 1))
            lower_percentile = np.percentile(filtered_data, 0)
            upper_percentile = np.percentile(filtered_data, 95)

        with open(cuted_path, 'rb') as f:
            histogrambins = HistogramBins.objects.create(
                histogram=histogram,
                index=index,
                bins=hist.tolist(),
                bins_static=hist_static.tolist(),
                bins_values=bins.tolist(),
                bins_values_static=bins_static.tolist(),
                percentile=[lower_percentile, upper_percentile],
                tif_file=ContentFile(f.read(), name=output_file_name),
                min=Decimal(float(min_value)),
                max=Decimal(float(max_value))
            )

            # Serialize and return the data
        serializer = HistogramBinsSerializer(histogrambins)
        temp_paths = [temp_file_path, resampled_path,
                      cuted_path]
        clean_temp_file(temp_paths)
        return serializer.data


def create_index_productivity(task, date, zoneNbr, index="NDVI", provider="S2"):
    try:
        histogram = Histogram.objects.get(task=task.id, date=date)
        colormap = generate_color_palette(zoneNbr)
        histogrambins = HistogramBins.objects.get(
            histogram=histogram.id, index=index)
        serializer_histogram = HistogramSerializer(histogram)
        # Return existing data if it already exists
        serializer = HistogramBinsSerializer(histogrambins)

        full_path = os.path.join(
            settings.MEDIA_ROOT, histogrambins.tif_file.path)
        print(full_path)
        with rio.open(full_path, 'r') as f:
            # Calculate percentiles, bins, and histogram
            data = f.read()
            flat_data = data.flatten()
            valid_data = flat_data[np.isfinite(flat_data)]
            min_value = np.min(valid_data)
            max_value = np.max(valid_data)
            hist, bins = np.histogram(valid_data, bins=zoneNbr, range=(
                min_value, max_value))
            res = {
                "bins": hist.tolist(),
                "bins_values": bins.tolist(),
                "cmap": colormap,
                "min": min_value,
                "max": max_value,
            }
            return res
    except HistogramBins.DoesNotExist:
        return False


def clean_temp_file(paths):
    for temp_file in paths:
        if os.path.exists(temp_file):
            os.remove(temp_file)


def generate_color_palette(num_colors, colormap="RdYlGn"):
    # Use matplotlib to get the colormap
    cmap = plt.get_cmap(colormap, num_colors)

    # Generate evenly spaced colors
    selected_colors = [cmap(i) for i in range(num_colors)]

    # Convert to normalized RGBA format (0-255 scale)
    normalized_colors = [(int(r * 255), int(g * 255), int(b * 255), int(a * 255))
                         for r, g, b, a in selected_colors]

    return normalized_colors


def getStaticHistogram(task, date, index="NDVI"):
    try:
        histogram = Histogram.objects.get(task=task.id, date=date)
        histogrambins = HistogramBins.objects.get(
            histogram=histogram.id, index=index)
        with rio.open(histogrambins.tif_file, 'r') as f:
            # Calculate percentiles, bins, and histogram
            data = f.read()
            flat_data = data.flatten()
            valid_data = flat_data[np.isfinite(flat_data)]
            print("valid data", valid_data)
            # Calculate the first and third quartiles
            Q1 = np.percentile(valid_data, 25)
            Q3 = np.percentile(valid_data, 75)

            # Calculate the IQR
            IQR = Q3 - Q1

            # Define bounds for outliers
            lower_bound = Q1 - 1.5 * IQR
            upper_bound = Q3 + 1.5 * IQR

            # Filter out the outliers
            filtered_data = valid_data[(valid_data >= lower_bound) & (
                    valid_data <= upper_bound)]
            hist, bins = np.histogram(filtered_data, bins=256, range=(
                -1, 1))
            res = {
                "bins": hist,
                "values": bins,
            }
            return res
    except HistogramBins.DoesNotExist:
        return False


def check_available_dates(task, year_month, provider="S2", max_cloud_cover=10, extend_weeks=0):

    if provider not in algos:
        return {"error": "Provider not found"}

    try:
        start_date = datetime.datetime.strptime(year_month, "%Y-%m-%d").date()
        end_date = (start_date + relativedelta(months=1)).replace(day=1)


        if extend_weeks > 0:
            start_date = start_date - datetime.timedelta(weeks=extend_weeks)
            end_date = end_date + datetime.timedelta(weeks=extend_weeks)

        ind = algos[provider]
        poly = cordinates_to_polygon(task.area_of_interest[0])
        bbox = poly.bounds().getInfo()
        polygon = ee.Geometry.Polygon(bbox["coordinates"][0])

        image_collection = (
            ee.ImageCollection(ind['collection'])
            .filterDate(start_date.strftime("%Y-%m-%d"),
                        end_date.strftime("%Y-%m-%d"))
            .filterBounds(polygon)
            .filter(ee.Filter.lt('CLOUDY_PIXEL_PERCENTAGE', max_cloud_cover))
        )

        images_info = image_collection.getInfo()

        available_dates = []
        for image in images_info['features']:
            timestamp = image['properties']['system:time_start']
            cloud_cover = image['properties'].get('CLOUDY_PIXEL_PERCENTAGE', 0)
            date = datetime.datetime.fromtimestamp(timestamp / 1000).strftime('%Y-%m-%d')
            available_dates.append({
                'date': date,
                'cloud_cover': round(cloud_cover, 2),
                'extended_weeks': extend_weeks
            })

        if not available_dates and extend_weeks < 10:
            return check_available_dates(
                task,
                year_month,
                provider=provider,
                max_cloud_cover=max_cloud_cover,
                extend_weeks=extend_weeks + 1
            )

        return {
            "month": year_month,
            "available_dates": sorted(available_dates, key=lambda x: x['date']),
            "extended_weeks": extend_weeks,
            "search_start_date": start_date.strftime("%Y-%m-%d"),
            "search_end_date": end_date.strftime("%Y-%m-%d")
        }

    except Exception as e:
        return {"error": str(e)}


def calculate_index_difference(task, dates, index):
    try:
            
        index = index.upper()
        dates = sorted(dates)
        
        colors_list = ['red', 'orange', 'lightgray', 'lightgray', 'lightgreen', 'green']

        cmap = colors.ListedColormap(colors_list)
        rgba_colors = [colors.to_rgba(c) for c in cmap.colors]
        scaled_colors = [list(map(lambda c: c * 255, arr)) for arr in rgba_colors]
        colormap = json.dumps(scaled_colors)
            
        for date in dates:
            #assuring every date has its index created
            index_create_result = create_index_tif(task, date, initial=False, index=index)
        
        #querying indices together to avoid querying DB twice for intermediate dates if more than 2 dates are compared
        indices_query_set = HistogramBins.objects.filter(histogram__date__in=dates, histogram__task=task, index=index).order_by("histogram__date")
        # indices_query_list = [{"date":a.histogram.date, "inst":a.id} for a in indices_query_set]


        diff_results = []
        
        for i in range(len(indices_query_set)-1):
                    
            date1 = indices_query_set[i].histogram.date
            date2 = indices_query_set[i+1].histogram.date
            
            first_index_db_instance = indices_query_set[i]
            second_index_db_instance = indices_query_set[i+1]
            
            existing_instance = IndexDifference.objects.filter(first_index=first_index_db_instance, second_index=second_index_db_instance)
            
            if existing_instance:
                
                instance_data = IndexDifferenceSerializer(existing_instance.first()).data
                
                preset_bounds = [instance_data["min"], -0.16, -0.08, 0.0, 0.08, 0.16, instance_data["max"]]
                diff_results.append({"difference":instance_data, "colormap": colormap, "bounds": preset_bounds})
                
            else:
                
                with rio.open(first_index_db_instance.tif_file.path) as first_tif, rio.open(second_index_db_instance.tif_file.path) as second_tif:
                    
                    first_index = first_tif.read(1)
                    second_index = second_tif.read(1)
                    metadata = first_tif.meta.copy()
                    
                    diff = second_index - first_index
                    diff_min = np.nanmin(diff)
                    diff_max = np.nanmax(diff)
                    
                    output_folder = os.path.join(settings.MEDIA_ROOT, f"tasks/tiff/{task.id}/index_difference/temp/{index}/")
                    os.makedirs(output_folder,exist_ok=True)
                    
                    output_path = os.path.join(output_folder, f"{index}_{date1}_{date2}_difference.tif")
                    
                    #writing to temporary file,should ideally be updated later to use ByteIO => read into buffer and write directly to S3
                    with rio.open(output_path, "w", **metadata) as dest:
                        dest.write(diff,1)
                        
                    # saving index difference to DB
                    with open(output_path, 'rb') as f:
                        
                        index_difference_instance = IndexDifference.objects.create(
                        date1 = date1,
                        date2 = date2,
                        first_index = first_index_db_instance,
                        second_index = second_index_db_instance,
                        index = index,
                        tif_file = ContentFile(f.read(), name=f"{date1}_{date2}_difference.tif"),
                        # f"tasks/tiff/{task.id}/index_difference/{index}/{date1}_{date2}_difference.tif",
                        min = Decimal(str(diff_min)),
                        max = Decimal(str(diff_max)),
                        )
                    
                    instance_data = IndexDifferenceSerializer(index_difference_instance).data
                    
                    preset_bounds = [diff_min, -0.16, -0.08, 0.0, 0.08, 0.16, diff_max]
                    
                    diff_results.append({"difference":instance_data, "colormap": colormap, "bounds": preset_bounds})
                    
                    clean_temp_file([output_path])
                    
        return diff_results
    except Exception as e:
        raise e