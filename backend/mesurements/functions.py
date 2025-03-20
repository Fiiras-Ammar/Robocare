from .mesure import (
    ndvi_map,
    ndre_map,
    gci_map,
    ndwi_map,
    rgb_map,
    ndmi_map,
    maskS2clouds2,
    service_ndvi_map,
    service_ndre_map,
    service_ndwi_map,
    service_gci_map,
    psri_map,
    get_bands_samples,
    calculate_no_data_percentage
)
import concurrent.futures
import math

# from datetime import date, datetime, timedelta
from dateutil.relativedelta import relativedelta
import ee
import json
from .models import Task, GraphData, DataForecast, AlertPredict, ForecastYearsParams
import matplotlib.cm as cm
import matplotlib.colors as colors
import datetime
import urllib.request
import os
import requests
from django.core.files.base import ContentFile
from django.core.files.storage import default_storage
from .serializers import (
    AddTaskImageSerializer,
    GraphDataSerializer,
    AlertPredictSerializer,
    DataForecastSerializer,
    AlertPredictAddSerializer,
)
import concurrent.futures
from concurrent import futures
from osgeo import ogr

from PIL import Image
import io
from PIL import Image, ImageDraw
import requests
import io
from shapely.geometry import Polygon
import mercantile
from django.core.files.base import ContentFile
from ipyleaflet import TileLayer
from django.db import transaction
from .serializers import TaskSerializer
import numpy as np
from django.conf import settings
import rasterio
from rasterio.transform import from_bounds
from rasterio.mask import mask
import uuid
from django.db import IntegrityError
from rest_framework.response import Response
from rest_framework import status
from PIL import ImageOps
import pyproj
# from rasterio.crs import CRS
from pyproj.crs import CRS
from pyproj import Transformer
from io import BytesIO
from functools import partial
import pandas as pd
from rest_framework.serializers import ValidationError
import statsmodels.api as sm
import matplotlib.pyplot as plt
from sklearn.model_selection import train_test_split
from sklearn.metrics import mean_squared_error
import itertools


def calculate_ndvi(coords_swapped, start_date, end_date, index, provider):
    # Perform the ndvi calculation
    res = ndvi_map(coords_swapped, start_date, end_date, index, provider)
    return res


def service_calculate_ndvi(polygon):
    # Perform the ndvi calculation
    res = service_ndvi_map(polygon)
    return res


def calculate_ndre(coords_swapped, start_date, end_date, index):
    # Perform the ndre calculation
    res = ndre_map(coords_swapped, start_date, end_date, index)
    return res


def service_calculate_ndre(polygon):
    # Perform the ndvi calculation
    res = service_ndre_map(polygon)
    return res


def calculate_ndwi(coords_swapped, start_date, end_date, index, provider):
    # Perform the ndwi calculation
    res = ndwi_map(coords_swapped, start_date, end_date, index, provider)
    return res


def service_calculate_ndwi(polygon):
    # Perform the ndvi calculation
    res = service_ndwi_map(polygon)
    return res


def calculate_gci(coords_swapped, start_date, end_date, index, provider):
    # Perform the gci calculation
    res = gci_map(coords_swapped, start_date, end_date, index, provider)
    return res


def calculate_psri(coords_swapped, start_date, end_date, index, provider):
    # Perform the gci calculation
    res = psri_map(coords_swapped, start_date, end_date, index)
    return res


def service_calculate_gci(polygon):
    # Perform the ndvi calculation
    res = service_gci_map(polygon)
    return res


def calculate_rgb(coords_swapped, start_date, end_date, provider):
    # Perform the gci calculation
    res = rgb_map(coords_swapped, start_date, end_date, provider)
    return res


def calculate_psri(coords_swapped, start_date, end_date):
    # Perform the gci calculation
    res = psri_map(coords_swapped, start_date, end_date)
    return res


def calculate_ndmi(coords_swapped, start_date, end_date):
    # Perform the ndvi calculation
    res = ndmi_map(coords_swapped, start_date, end_date)
    return res


def zoomBySurface(surface):
    surface = float(surface)
    if surface <= 5.000:
        return 18
    elif 5.000 < surface <= 10.000:
        return 17
    elif 10.000 < surface <= 40.000:
        return 16
    elif 40.000 < surface <= 100.000:
        return 15
    elif 100.000 < surface <= 500.000:
        return 14
    elif 500.000 < surface <= 1000.000:
        return 13
    elif 1000.000 < surface <= 10000.000:
        return 12
    elif 10000.000 < surface <= 100000.000:
        return 11
    else:
        return 10


def get_last_year_dates():
    current_date = datetime.datetime.now().date()  # Get the current date
    current_date2 = current_date.strftime("%Y-%m-%d")
    # Subtract three months from the current date
    previous_date = current_date - relativedelta(months=14)
    previous_date = previous_date.strftime("%Y-%m-%d")
    res = {
        "start_date": current_date2,
        "end_date": previous_date,
    }
    return res


def getStartEndDate():
    current_date = datetime.datetime.now().date()
    current_date_str = current_date.strftime("%Y-%m-%d")
    previous_date = current_date - relativedelta(months=12)
    previous_date_str = previous_date.strftime("%Y-%m-%d")

    ee_current_date = ee.Date(current_date_str).format("YYYY-MM-dd").getInfo()
    ee_previous_date = ee.Date(
        previous_date_str).format("YYYY-MM-dd").getInfo()

    res = {
        "start_date": ee_previous_date,
        "end_date": ee_current_date,
    }
    return res


# def get_sentinel2_dates(polygon, start_date, end_date):
#     sentinel_collection = (
#         ee.ImageCollection("COPERNICUS/S2_SR_HARMONIZED")
#         .filterBounds(polygon)
#         .filterDate(start_date, end_date)
#         .filterMetadata("CLOUD_COVERAGE_ASSESSMENT", "less_than", 100)
#         .sort("CLOUD_COVERAGE_ASSESSMENT")
#     )
#     sentinel_dates = sentinel_collection.aggregate_array("system:time_start").map(
#         lambda time: ee.Date(time).format("YYYY-MM-dd")
#     )


#     print("sentinel_dates", sentinel_dates)
#     sentinel_dates_list = sentinel_dates.distinct().sort().getInfo()
#     # print("date_list", dates_list)
#     sentinel_formatted_dates = [
#         {"date": date, "provider": "S2"} for date in sentinel_dates_list
#     ]
#     filtred_dates_array = []
#     for date in sentinel_dates_list:
#         print(date)
#         iamge_per_date = sentinel_collection.filterDate(
#             date, ee.Date(date).advance(1, "day").format("yyyy-MM-dd")
#         ).mean()
#         try:
#             cloud_percentage_mean = (
#                 iamge_per_date.select("MSK_CLDPRB")
#                 .reduceRegion(reducer=ee.Reducer.mean(), geometry=polygon, scale=10)
#                 .get("MSK_CLDPRB")
#                 .getInfo()
#             )
#             print("cloud %", cloud_percentage_mean)
#             if cloud_percentage_mean <= 10:
#                 filtred_dates_array.append(
#                     {
#                         "date": date,
#                         "provider": "S2",
#                         "cloud_coverage": cloud_percentage_mean,
#                     }
#                 )
#         except Exception as e:
#             print(f"Error getting cloud percentage for {date}: {e}")
#         continue
#     dates_json = {
#         "dates": filtred_dates_array,
#         "last_date": sentinel_dates_list[-1],
#         "date_list": sentinel_dates_list,
#     }
#     return dates_json


# def get_sentinel2_dates(polygon, start_date, end_date):
#     sentinel_collection = (
#         ee.ImageCollection("COPERNICUS/S2_SR_HARMONIZED")
#         .filterBounds(polygon)
#         .filterDate(start_date, end_date)
#         .filterMetadata("CLOUD_COVERAGE_ASSESSMENT", "less_than", 100)
#         .sort("CLOUD_COVERAGE_ASSESSMENT")
#     )
#     sentinel_dates = sentinel_collection.aggregate_array("system:time_start").map(
#         lambda time: ee.Date(time).format("YYYY-MM-dd")
#     )

#     print("sentinel_dates", sentinel_dates)
#     sentinel_dates_list = sentinel_dates.distinct().sort().getInfo()
#     # print("date_list", dates_list)
#     sentinel_formatted_dates = [
#         {"date": date, "provider": "S2"} for date in sentinel_dates_list
#     ]
#     filtred_dates_array = []
#     for date in sentinel_dates_list:
#         print(date)
#         iamge_per_date = sentinel_collection.filterDate(
#             date, ee.Date(date).advance(1, "day").format("yyyy-MM-dd")
#         ).mean()
#         try:
#             cloud_percentage_mean = (
#                 iamge_per_date.select("MSK_CLDPRB")
#                 .reduceRegion(reducer=ee.Reducer.mean(), geometry=polygon, scale=10)
#                 .get("MSK_CLDPRB")
#                 .getInfo()
#             )
#             print("cloud %", cloud_percentage_mean)
#             if cloud_percentage_mean <= 10:
#                 filtred_dates_array.append(
#                     {
#                         "date": date,
#                         "provider": "S2",
#                         "cloud_coverage": cloud_percentage_mean,
#                     }
#                 )
#         except Exception as e:
#             print(f"Error getting cloud percentage for {date}: {e}")
#         continue
#     dates_json = {
#         "dates": filtred_dates_array,
#         "last_date": sentinel_dates_list[-1],
#         "date_list": sentinel_dates_list,
#     }
#     return dates_json


def get_sentinel2_dates(polygon, start_date, end_date,no_data_pixels_threshold=5):
    sentinel_collection = (
        ee.ImageCollection("COPERNICUS/S2_SR_HARMONIZED")
        .filterBounds(polygon)
        .filterDate(start_date, end_date)
        .filterMetadata("CLOUD_COVERAGE_ASSESSMENT", "less_than", 10)
        .sort("CLOUD_COVERAGE_ASSESSMENT")
    )
    cloud_collection = (
        ee.ImageCollection("COPERNICUS/S2_CLOUD_PROBABILITY")
        .filterBounds(polygon)
        .filterDate(start_date, end_date)
    )
    # Extract dates and cloud percentages from the filtered collection
    
    sentinel_collection = sentinel_collection.map(lambda image: get_bands_samples(image, polygon, "S2"))
    filtered_features = sentinel_collection.getInfo()["features"]
    
    no_data_pixels_eval = [{"date":datetime.datetime.utcfromtimestamp(i['properties']["system:time_start"] / 1000).strftime('%Y-%m-%d'),
        # "nodata": i['properties']["NODATA_PIXEL_PERCENTAGE"],
        "no_data_percentage":calculate_no_data_percentage(i['properties']['bands_samples'],"S2")} for i in filtered_features]
    
    
    
    
    
    dates = [{"date":i["date"]} for i in no_data_pixels_eval if i["no_data_percentage"] < no_data_pixels_threshold]
 
    dates = sorted(dates, key=lambda x: x["date"])

    def process_date(item):
        start_date = datetime.datetime.strptime(item["date"], "%Y-%m-%d")
        end_date = start_date + datetime.timedelta(days=1)
        ee_start_date = ee.Date(start_date.strftime("%Y-%m-%d"))
        ee_end_date = ee.Date(end_date.strftime("%Y-%m-%d"))

        # Filter the cloud collection based on the image date
        cloud_image = cloud_collection.filterDate(ee_start_date, ee_end_date)

        if cloud_image.size().getInfo() > 0:
            # Select the first image from the filtered collection
            image_with_cloud = cloud_image.first()

            # Get the cloud probability for the image
            cloud_probability = (
                image_with_cloud.select(["probability"])
                .reduceRegion(
                    reducer=ee.Reducer.mean(),
                    geometry=polygon,
                    scale=10,  # Set an appropriate scale value based on Sentinel-2 resolution
                )
                .get("probability")
                .getInfo()
            )
            # Check if cloud_probability is not None before rounding
            if cloud_probability is not None:
                rounded_cloud_probability = round(cloud_probability, 2)
                print("cloud", rounded_cloud_probability,
                      "image_date", item["date"])
                print("--------------------------")
            else:
                rounded_cloud_probability = -1
                print("cloud", rounded_cloud_probability,
                      "image_date", item["date"])
                print("--------------------------")
        else:
            print("No image available for the specified date:", item["date"])
            rounded_cloud_probability = -1
        arr = {
            "date": item["date"],
            "cloud_percentage": rounded_cloud_probability,
            "provider": "S2",
        }
        return arr

    # Use ThreadPoolExecutor for concurrent processing
    with concurrent.futures.ThreadPoolExecutor() as executor:
        results = list(executor.map(process_date, dates))
    # Filter the results based on cloud_percentage < 40
    filtered_dates = [
        item for item in results if item["cloud_percentage"] < 40]
    # Sort the filtered_dates array based on the date
    sorted_filtered_dates = sorted(filtered_dates, key=lambda x: x["date"])
    dates_json = {
        "dates": sorted_filtered_dates,
        "last_date": (
            sorted_filtered_dates[-1]["date"] if sorted_filtered_dates else None
        ),
        "date_list": [item["date"] for item in sorted_filtered_dates],
    }
    return dates_json

def get_landsat8_dates(polygon, start_date, end_date,no_data_pixels_threshold=5):
    landsat8_collection = (
        ee.ImageCollection("LANDSAT/LC08/C02/T1_TOA")
        .filterBounds(polygon)
        .filterDate(start_date, end_date)
        .filterMetadata("CLOUD_COVER", "less_than", 1)
    )
    
    landsat8_collection = landsat8_collection.map(lambda image: get_bands_samples(image, polygon, "L8"))
    filtered_features = landsat8_collection.getInfo()["features"]
    
    no_data_pixels_eval = [{"date":datetime.datetime.utcfromtimestamp(i['properties']["system:time_start"] / 1000).strftime('%Y-%m-%d'),
        # "nodata": i['properties']["NODATA_PIXEL_PERCENTAGE"],
        "no_data_percentage":calculate_no_data_percentage(i['properties']['bands_samples'], "L8")} for i in filtered_features]
    
    landsat8_dates_list = [{"date":i["date"]} for i in no_data_pixels_eval if i["no_data_percentage"] < no_data_pixels_threshold]
    
    landsat8_dates_list = sorted(landsat8_dates_list, key=lambda x: x["date"])
    
    landsat8_formatted_dates = [
        {"date": date, "provider": "L8", "cloud_percentage": -1}
        for date in landsat8_dates_list
    ]
    dates_json = {
        "dates": landsat8_formatted_dates,
        "date_list": landsat8_dates_list,
    }
    return dates_json


def get_landsat9_dates(polygon, start_date, end_date, no_data_pixels_threshold=5):
    landsat9_collection = (
        ee.ImageCollection("LANDSAT/LC09/C02/T1_TOA")
        .filterBounds(polygon)
        .filterDate(start_date, end_date)
        .filterMetadata("CLOUD_COVER", "less_than", 1)
    )
    
    landsat9_collection = landsat9_collection.map(lambda image: get_bands_samples(image, polygon, "L9"))
    filtered_features = landsat9_collection.getInfo()["features"]
    
    no_data_pixels_eval = [{"date":datetime.datetime.utcfromtimestamp(i['properties']["system:time_start"] / 1000).strftime('%Y-%m-%d'),
        # "nodata": i['properties']["NODATA_PIXEL_PERCENTAGE"],
        "no_data_percentage":calculate_no_data_percentage(i['properties']['bands_samples'],"L9")} for i in filtered_features]
    
    
    
    landsat9_dates_list = [{"date":i["date"]} for i in no_data_pixels_eval if i["no_data_percentage"] < no_data_pixels_threshold]
    
    landsat9_dates_list = sorted(landsat9_dates_list, key=lambda x: x["date"])
    
    landsat9_formatted_dates = [
        {"date": date, "provider": "L9", "cloud_percentage": -1}
        for date in landsat9_dates_list
    ]
    dates_json = {
        "dates": landsat9_formatted_dates,
        "date_list": landsat9_dates_list,
    }
    return dates_json


def get_available_dates(polygon,no_data_pixels_threshold=5):
    
    end_date = datetime.datetime.now().date() + relativedelta(days=1)
    start_date = end_date - relativedelta(months=2)
    
    end_date = end_date.strftime("%Y-%m-%d")
    start_date = start_date.strftime("%Y-%m-%d")

    filtered_collection = (
        ee.ImageCollection("COPERNICUS/S2_SR_HARMONIZED")
        .filterBounds(polygon)
        .filterDate(start_date, end_date)
        .filterMetadata("CLOUD_COVERAGE_ASSESSMENT", "less_than", 10)
        .map(maskS2clouds2)
    )
   
        
    filtered_collection = filtered_collection.map(lambda image: get_bands_samples(image, polygon, "S2"))
    
    filtered_features = filtered_collection.getInfo()["features"]
    
    no_data_pixels_eval = [{"date":datetime.datetime.utcfromtimestamp(i['properties']["system:time_start"] / 1000).strftime('%Y-%m-%d'),
        # "nodata": i['properties']["NODATA_PIXEL_PERCENTAGE"],
        "no_data_percentage":calculate_no_data_percentage(i['properties']['bands_samples'], "S2")} for i in filtered_features]
    
    dates_list = [i["date"] for i in no_data_pixels_eval if i["no_data_percentage"] < no_data_pixels_threshold]

    # dates = filtered_collection.aggregate_array("system:time_start").map(
    #     lambda time: ee.Date(time).format("YYYY-MM-dd")
    # )
    
    # dates_list = dates.distinct().sort().getInfo()
    
    formatted_dates = [{"date": date, "provider": "S2"} for date in dates_list]

    dates_json = {
        "dates": formatted_dates,
        "last_date": dates_list[-1],
        "date_list": dates_list,
    }
    return dates_json


def redimentionImage(image_content, date):
    desired_size = 512
    background_color = (0, 0, 0)
    im = Image.open(image_content)
    old_size = im.size
    im.name = f"{date}.png"
    ratio = float(desired_size) / max(old_size)
    new_size = tuple([int(x * ratio) for x in old_size])

    im = im.resize(new_size, Image.ANTIALIAS)

    new_im = Image.new("RGBA", (desired_size, desired_size))
    new_im.paste(
        im, ((desired_size - new_size[0]) // 2,
             (desired_size - new_size[1]) // 2)
    )

    return new_im


def fetch_image(args):
    date, provider, cloud_percentage, polygon, task = args
    start_date = datetime.datetime.strptime(date, "%Y-%m-%d")
    end_date = start_date + datetime.timedelta(days=1)
    if provider == "S2":
        image_collection = ee.ImageCollection("COPERNICUS/S2_SR_HARMONIZED")
    elif provider == "L8":
        image_collection = ee.ImageCollection("LANDSAT/LC08/C02/T1_TOA")
    else:
        image_collection = ee.ImageCollection("LANDSAT/LC09/C02/T1_TOA")

    filtered_collection = image_collection.filterDate(
        ee.DateRange(start_date, end_date)
    ).filterBounds(polygon)
    
    
    full_coverage_collection = filtered_collection.filter(ee.Filter.contains(
        leftField='.geo',  # obtained image geometry
        rightValue=polygon
    ))
            
    clipped_image = full_coverage_collection.first().clip(polygon)
    
    if provider == "S2":
        image_url = clipped_image.getThumbURL(
            {
                "region": polygon,
                "dimensions": 512,
                "format": "png",
                "crs": "EPSG:4326",
                "min": 0.0,
                "max": 5000,
                "bands": ["B4", "B3", "B2"],
            }
        )
    else:
        image_url = clipped_image.getThumbURL(
            {
                "region": polygon,
                "dimensions": 512,
                "format": "png",
                "crs": "EPSG:4326",
                "min": 0.0,
                "max": 0.4,
                "bands": ["B4", "B3", "B2"],
            }
        )

    response = requests.get(image_url)

    if response.status_code == 200:

        # Open the image using PIL
        img = Image.open(io.BytesIO(response.content))

        padding_size = max(img.size)  # Get the maximum dimension of the image
        padded_img = Image.new(
            "RGBA", (padding_size, padding_size), (0, 0, 0, 0))
        # Convert the image to WebP format
        # img_webp_io = io.BytesIO()
        # padded_img.convert("RGBA").save(img_webp_io, format="WebP", lossless=True)
        padded_img.paste(
            img, ((padding_size - img.size[0]) //
                  2, (padding_size - img.size[1]) // 2)
        )
        # Convert the padded image to WebP format
        img_webp_io = io.BytesIO()
        padded_img.save(img_webp_io, format="WebP", lossless=True)
        # img.convert("RGBA").save(img_webp_io, format="WebP", lossless=True)

        new_image_name = f"{date}.webp"
        # Create a ContentFile from the in-memory file-like object
        new_image_content = ContentFile(
            img_webp_io.getvalue(), name=new_image_name)

        # print(new_image_content)
        serialized_data = {
            "image": new_image_content,
            "date": date,
            "task": task.id,
            "provider": provider,
            "cloud_percentage": cloud_percentage,
        }
        serializer = AddTaskImageSerializer(data=serialized_data)
        if serializer.is_valid():
            serializer.save()
            # print(serializer.data["image"])
        else:
            return serializer.errors

    else:
        error_message = f"Failed to fetch image for date: {date}"
        return {"error": error_message}


def generateTaskImage(task):

    gmaps_satellite_layer = TileLayer(
        url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
    )
    print(task.task_name)
    coordinates = list(task.area_of_interest[0])
    coordinates = [list(coord) for coord in coordinates[:-1]]
    coords_swapped = [[coordinate[1], coordinate[0]]
                      for coordinate in coordinates]
    polygon = Polygon(coords_swapped)

    # Initial zoom level
    initial_zoom = 21
    current_zoom = initial_zoom

    # Try a maximum of 5 times to adjust the zoom level
    max_attempts = 6
    attempt_count = 0

    while attempt_count < max_attempts:
        left, bottom, right, top = polygon.bounds

        all_tiles = list(mercantile.tiles(
            left, bottom, right, top, current_zoom))
        # Get the URL for the first tile
        first_tile_url = esri_satellite_layer.url.format(
            x=all_tiles[0].x, y=all_tiles[0].y, z=current_zoom
        )
        session = requests.Session()
        response = session.get(first_tile_url)

        # Check if the first tile image is valid
        if response.status_code == 200:
            first_tile_image = Image.open(io.BytesIO(response.content))

            # Check the percentage of grey color in the first tile
            grey_percentage = calculate_color_percentage_in_image(
                first_tile_image, (204, 204, 204), tolerance=10
            )

            if grey_percentage > 60:
                # Adjust the zoom level
                current_zoom -= 1
                print("grey percentage", grey_percentage)
                print("Adjusted zoom level to", current_zoom)
            else:
                image_width = 256 * (all_tiles[-1].x - all_tiles[0].x + 1)
                image_height = 256 * (all_tiles[-1].y - all_tiles[0].y + 1)

                image = Image.new("RGB", (image_width, image_height))
                try:
                    for tl in all_tiles:
                        tile_url = gmaps_satellite_layer.url.format(
                            x=tl.x, y=tl.y, z=current_zoom
                        )
                        session = requests.Session()
                        response = session.get(tile_url)
                        tile_image = Image.open(io.BytesIO(response.content))

                        x_offset = (tl.x - all_tiles[0].x) * 256
                        y_offset = (all_tiles[-1].y - tl.y) * 256
                        Corr_y_offset = image_height - y_offset - 256
                        image.paste(tile_image, (x_offset, Corr_y_offset))

                    resized_image = image.resize((500, 500), Image.ANTIALIAS)
                    image_io = BytesIO()
                    resized_image.save(image_io, format="PNG")
                    image_io.seek(0)
                    image_name = f"{task.id}.png"

                    # Use transaction.atomic to ensure atomicity when updating the task
                    with transaction.atomic():
                        new_image_content = ContentFile(
                            image_io.read(), name=image_name
                        )

                        serialized_data = {
                            "image": new_image_content,
                        }
                        serializer = TaskSerializer(
                            task, data=serialized_data, partial=True
                        )
                        if serializer.is_valid():
                            serializer.save()
                            print(
                                f"Image saved successfully for task {task.id}")
                        else:
                            print(
                                f"Serializer error for task {task.id}: {serializer.errors}"
                            )
                except Exception as e:
                    print(
                        f"Error during image processing for task {task.id}: {e}")
                break
            attempt_count += 1
    if attempt_count == max_attempts:
        # Handle the case where valid images cannot be obtained even after multiple attempts
        print("Unable to obtain valid images for the specified region.")
    else:
        print("Image successfully generated with adjusted zoom level:", current_zoom)


if settings.MEDIA_ROOT:
    images_dir = os.path.join(settings.MEDIA_ROOT, "covers")
else:
    images_dir = "."
print(images_dir)

zoom = 18

#
esri_satellite_layer = TileLayer(
    url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
)

gmaps_satellite_layer = TileLayer(
    url="https://mt1.google.com/vt/lyrs=s&x={x}&y={y}&z={z}"
)

# PNG to Geotiff


def convert_tif(input, output, bounds):
    crs = CRS.from_epsg(4326)
    resolution = 1
    with rasterio.open(input) as src:
        transform = from_bounds(*bounds, width=src.width, height=src.height)

        kwargs = src.meta.copy()
        kwargs.update({"crs": crs, "transform": transform, "driver": "GTiff"})
        with rasterio.open(output, "w", **kwargs) as dst:
            dst.write(src.read())


def calculate_color_percentage_in_image(image_path, target_color, tolerance=0):
    # Open the image

    # Convert the image to RGB mode (if it's not already)
    image = image_path.convert("RGB")

    # Get the image size
    width, height = image.size

    # Initialize counters
    total_pixels = width * height
    matching_pixels = 0

    # Iterate through each pixel in the image
    for x in range(width):
        for y in range(height):
            # Get the RGB values of the current pixel
            pixel_color = image.getpixel((x, y))

            # Check if the pixel color matches the target color within the specified tolerance
            if all(abs(a - b) <= tolerance for a, b in zip(pixel_color, target_color)):
                matching_pixels += 1

    # Calculate the percentage of matching pixels
    percentage = (matching_pixels / total_pixels) * 100

    return percentage


def generateTaskImageSidebar(task):
    print("inside generate sidebar image")
    area = task.area_of_interest
    coordinates = [list(coord) for coord in area.coords[0]]
    coords_swapped = [[coordinate[1], coordinate[0]]
                      for coordinate in coordinates]
    print("data[0]", coords_swapped)
    img_path = os.path.join(images_dir, str(task.id) + "-300x300.png")
    gtif_path = os.path.join(images_dir, str(task.id) + ".tif")
    img_name = str(task.id) + "-300x300.png"
    polygon = Polygon(coords_swapped)
    # original_epsg = CRS.from_epsg(4326)
    # target_epsg = CRS.from_epsg(4326)

    # Initial zoom level
    initial_zoom = 21
    current_zoom = initial_zoom

    # Try a maximum of 5 times to adjust the zoom level
    max_attempts = 5
    attempt_count = 0

    while attempt_count < max_attempts:
        left, bottom, right, top = polygon.bounds

        all_tiles = list(mercantile.tiles(
            left, bottom, right, top, current_zoom))

        image_width = 256 * (all_tiles[-1].x - all_tiles[0].x + 1)
        image_height = 256 * (all_tiles[-1].y - all_tiles[0].y + 1)

        image = Image.new("RGBA", (image_width, image_height))

        # Get the URL for the first tile
        first_tile_url = esri_satellite_layer.url.format(
            x=all_tiles[0].x, y=all_tiles[0].y, z=current_zoom
        )
        session = requests.Session()
        response = session.get(first_tile_url)

        # Check if the first tile image is valid
        if response.status_code == 200:
            first_tile_image = Image.open(io.BytesIO(response.content))

            # Check the percentage of grey color in the first tile
            grey_percentage = calculate_color_percentage_in_image(
                first_tile_image, (204, 204, 204), tolerance=10
            )

            if grey_percentage > 60:
                # Adjust the zoom level
                current_zoom -= 1
                print("grey percentage", grey_percentage)
                print("Adjusted zoom level to", current_zoom)
            else:
                for tl in all_tiles:
                    tile_url = esri_satellite_layer.url.format(
                        x=tl.x, y=tl.y, z=current_zoom
                    )
                    session = requests.Session()
                    response = session.get(tile_url)

                    tile_image = Image.open(io.BytesIO(response.content))

                    x_offset = (tl.x - all_tiles[0].x) * 256
                    y_offset = (all_tiles[-1].y - tl.y) * 256
                    Corr_y_offset = image_height - y_offset - 256
                    image.paste(tile_image, (x_offset, Corr_y_offset))

                # Save the final image after pasting all the tiles
                image.save(img_path)

                # Image bounds
                bounds = mercantile.bounds(mercantile.Tile(*all_tiles[0]))
                i_west, i_south, i_east, i_north = bounds
                i_bounds = (i_west, i_north, i_east, i_south)
                break
            attempt_count += 1

    if attempt_count == max_attempts:
        # Handle the case where valid images cannot be obtained even after multiple attempts
        print("Unable to obtain valid images for the specified region.")
    else:
        print("Image successfully generated with adjusted zoom level:", current_zoom)
    # Image bounds
    bounds = None
    for tile in all_tiles:
        tile_bounds = mercantile.bounds(mercantile.Tile(*tile))
        if bounds is None:
            bounds = tile_bounds
        else:
            bounds = (
                min(bounds[0], tile_bounds[0]),
                min(bounds[1], tile_bounds[1]),
                max(bounds[2], tile_bounds[2]),
                max(bounds[3], tile_bounds[3]),
            )

    i_west = bounds[0]
    i_east = bounds[2]
    i_north = bounds[1]
    i_south = bounds[3]

    i_bounds = (i_west, i_north, i_east, i_south)

    convert_tif(img_path, gtif_path, i_bounds)

    with rasterio.open(gtif_path) as src:
        out_image, out_transform = mask(src, [polygon], crop=True)
        out_meta = src.meta
    out_meta.update(
        {
            "driver": "GTiff",
            "height": out_image.shape[1],
            "width": out_image.shape[2],
            "transform": out_transform,
            "nodata": None,
            "dtype": out_image.dtype,
        }
    )

    with rasterio.open(gtif_path, "w", **out_meta) as dest:
        dest.write(out_image)
    os.remove(img_path)
    image = Image.open(gtif_path)
    image_final = image.convert("RGBA")
    os.remove(gtif_path)

    with transaction.atomic():
        image_bytes = BytesIO()
        image_final.save(image_bytes, format="PNG")
        new_image_content = ContentFile(image_bytes.getvalue(), name=img_name)
        serialized_data = {
            "image_sidebar": new_image_content,
        }
        serializer = TaskSerializer(task, data=serialized_data, partial=True)
        if serializer.is_valid():
            serializer.save()
            print(f"Image sidebar saved successfully for task {task.id}")
        else:
            print(f"Serializer error for task {task.id}: {serializer.errors}")


def get_region_info(task, lat, lon, api_key):
    print("inside generate region ")
    api_url = "https://api.geoapify.com/v1/geocode/reverse"

    # Set up the request parameters
    params_fr = {"lat": lat, "lon": lon, "api_key": api_key, "lang": "fr"}
    params_ar = {"lat": lat, "lon": lon, "api_key": api_key, "lang": "ar"}

    try:
        # Make the HTTP GET request
        response_fr = requests.get(api_url, params=params_fr)
        response_ar = requests.get(api_url, params=params_ar)
        # Check if the request was successful (status code 200)
        if response_fr.status_code == 200 and response_ar.status_code == 200:
            # Parse the JSON response
            region_info_fr = response_fr.json()
            region_info_ar = response_ar.json()
            # return region_info["features"][0]["properties"]
            serialized_data = {}

            # Check and add information if available for the "fr" language
            location_fr = region_info_fr["features"][0]["properties"]
            if "state" in location_fr:
                serialized_data["state_fr"] = location_fr["state"]
            if "state_district" in location_fr:
                serialized_data["state_district_fr"] = location_fr["state_district"]
            if "country" in location_fr:
                serialized_data["country_fr"] = location_fr["country"]
            if "county" in location_fr:
                serialized_data["county_fr"] = location_fr["county"]
            if "postcode" in location_fr:
                serialized_data["postcode_fr"] = location_fr["postcode"]

            # Check and add information if available for the "ar" language
            location_ar = region_info_ar["features"][0]["properties"]
            if "state" in location_ar:
                serialized_data["state_ar"] = location_ar["state"]
            if "state_district" in location_ar:
                serialized_data["state_district_ar"] = location_ar["state_district"]
            if "country" in location_ar:
                serialized_data["country_ar"] = location_ar["country"]
            if "county" in location_ar:
                serialized_data["county_ar"] = location_ar["county"]
            if "postcode" in location_ar:
                serialized_data["postcode_ar"] = location_ar["postcode"]

            with transaction.atomic():
                serializer = TaskSerializer(
                    task, data=serialized_data, partial=True)
                if serializer.is_valid():
                    serializer.save()
                    print(f"Image saved successfully for task {task.id}")
                else:
                    print(
                        f"Serializer error for task {task.id}: {serializer.errors}")
        else:
            # Print an error message if the request was not successful
            return f"Error: {response_fr.status_code} - {response_fr.text}"
    except Exception as e:
        # Handle any exceptions that may occur during the request
        print(f"Error: {e}")


def process_image(args, polygon, cloud_collection, index=None, with_mask=False):
    # print("with mask inside proccess_image",with_mask)
    image, _ = args
    image_date = datetime.datetime.fromtimestamp(
        image["properties"]["system:time_start"] / 1000
    ).date()
    end_date = image_date + datetime.timedelta(days=1)

    ee_image_date = ee.Date(image_date.strftime("%Y-%m-%d"))
    ee_end_date = ee.Date(end_date.strftime("%Y-%m-%d"))
    # Filter the cloud collection based on the image date
    image_collection = cloud_collection.filterDate(ee_image_date, ee_end_date)
    # Check if there is at least one image in the collection
    if image_collection.size().getInfo() > 0:
        # Select the first image from the filtered collection
        image_with_cloud = image_collection.first()

        # Check if the 'probability' property exists in the image

        # Get the cloud probability for the image
        # cloud_probability = (
        #     image_with_cloud.select(["probability"])
        #     .reduceRegion(
        #         reducer=ee.Reducer.mean(),
        #         geometry=polygon,
        #         scale=10,  # Set an appropriate scale value based on Sentinel-2 resolution
        #     )
        #     .get("probability")
        #     .getInfo()
        # )
        cloud_probability = get_cloud_probability(
            image_with_cloud, polygon, 85)
        # Check if cloud_probability is not None before rounding
        if cloud_probability is not None:
            rounded_cloud_probability = round(cloud_probability, 2)
            print("cloud", rounded_cloud_probability, "image_date", image_date)
            print("--------------------------")
        else:
            rounded_cloud_probability = -1
            print("cloud", rounded_cloud_probability, "image_date", image_date)
            print("--------------------------")
    else:
        print("No image available for the specified date:", image_date)
        rounded_cloud_probability = -1
    image_index = ee.Image(image["id"]).clip(polygon)
    if index == "ndvi":
        ndvi = image_index.normalizedDifference(["B8", "B4"])
        if with_mask:
            # Add a threshold to create a soil mask
            soil_mask = ndvi.lt(0.1)
            # Clip NDVI image to the polygon to apply the mask
            ndvi_masked = ndvi.clip(polygon)
            # Mask the NDVI with the soil mask
            index_calc = ndvi_masked.updateMask(soil_mask.Not())
            mean = index_calc.reduceRegion(
                reducer=ee.Reducer.mean(), geometry=polygon, scale=10
            ).get("nd")
        else:
            mean = ndvi.reduceRegion(
                reducer=ee.Reducer.mean(), geometry=polygon, scale=10
            ).get("nd")
    elif index == "ndre":
        ndre = image_index.normalizedDifference(["B8", "B5"])
        if with_mask:
            soil_mask = ndre.lt(0.1)
            # Clip NDVI image to the polygon to apply the mask
            ndre_masked = ndre.clip(polygon)
            # Mask the NDVI with the soil mask
            index_calc = ndre_masked.updateMask(soil_mask.Not())
            mean = index_calc.reduceRegion(
                reducer=ee.Reducer.mean(), geometry=polygon, scale=10
            ).get("nd")
        else:
            mean = ndre.reduceRegion(
                reducer=ee.Reducer.mean(), geometry=polygon, scale=10
            ).get("nd")
    elif index == "ndwi":
        ndwi = image_index.normalizedDifference(["B8", "B3"]).rename("NDWI")
        if with_mask:
            soil_mask = ndwi.lt(0.1)
            # Clip NDVI image to the polygon to apply the mask
            ndwi_masked = ndwi.clip(polygon)
            # Mask the NDVI with the soil mask
            index_calc = ndwi_masked.updateMask(soil_mask.Not())
            mean = index_calc.reduceRegion(
                reducer=ee.Reducer.mean(), geometry=polygon, scale=10
            ).get("NDWI")
        else:
            mean = ndwi.reduceRegion(
                reducer=ee.Reducer.mean(), geometry=polygon, scale=10
            ).get("NDWI")
    elif index == "gci":
        gci = image_index.expression(
            "(float ((NIR) / (GREEN)) - 1)/ (float ((NIR) / (GREEN)) + 1)",
            {"NIR": image_index.select(
                "B8"), "GREEN": image_index.select("B3")},
        ).rename("GCI")
        if with_mask:
            soil_mask = gci.lt(0.1)
            # Clip NDVI image to the polygon to apply the mask
            gci_masked = gci.clip(polygon)
            # Mask the NDVI with the soil mask
            index_calc = gci_masked.updateMask(soil_mask.Not())
            mean = index_calc.reduceRegion(
                reducer=ee.Reducer.mean(), geometry=polygon, scale=10
            ).get("GCI")
        else:
            mean = gci.reduceRegion(
                reducer=ee.Reducer.mean(), geometry=polygon, scale=10
            ).get("GCI")
    else:
        psri = image_index.expression(
            "((R531 - R570) / R470) / ((R531 + R570) / R470)",
            {
                # 531nm band (near-infrared)
                "R531": image_index.select("B11"),
                "R570": image_index.select("B4"),  # 570nm band (red)
                "R470": image_index.select("B3"),  # 470nm band (blue)
            },
        ).rename("PSRI")
        if with_mask:
            soil_mask = psri.lt(0.1)
            # Clip NDVI image to the polygon to apply the mask
            psri_masked = psri.clip(polygon)
            # Mask the NDVI with the soil mask
            index_calc = psri_masked.updateMask(soil_mask.Not())
            mean = index_calc.reduceRegion(
                reducer=ee.Reducer.mean(), geometry=polygon, scale=10
            ).get("PSRI")
        else:
            mean = psri.reduceRegion(
                reducer=ee.Reducer.mean(), geometry=polygon, scale=10
            ).get("PSRI")
    value = None
    if mean is not None:
        if mean.getInfo() is not None:
            value = round(mean.getInfo(), 2)

        # Check and apply overall min and max values
        # if overall_min is not None and value < overall_min:
        #     value = overall_min
        # if overall_max is not None and value > overall_max:
        #     value = overall_max
        if value is not None:
            result = (
                image_date,
                {
                    "date": image_date,
                    "value": value,
                    "cloud_percentage": rounded_cloud_probability,
                },
            )
            return result
        else:
            raise Exception("Terminating process_image due to None value")
    else:
        raise Exception("Terminating process_image due to None value")


# Custom JSON encoder to handle datetime objects
class DateTimeEncoder(json.JSONEncoder):
    def default(self, obj):
        if isinstance(obj, (datetime.datetime, datetime.date)):
            return obj.strftime("%Y-%m-%d")
        return super().default(obj)


def calculateIndexHistory(task_id, index, with_mask=False):
    array = []
    # start_date = request.data.get("start_date")
    start_date = "2017-04-01"
    # end_date = request.data.get("end_date")
    end_date = datetime.datetime.today().strftime("%Y-%m-%d")

    # index = request.data.get("index")
    # cloud_percent = request.data.get("cloud_percentage")
    #print("start_date", start_date)
    #print("end_date", end_date)
    try:
        task = Task.objects.get(id=task_id)
    except Task.DoesNotExist:
        print("Task not found")
        return
    coordinates = list(task.area_of_interest[0])
    coordinates = [list(coord) for coord in coordinates[:-1]]
    coords_swapped = [[coordinate[1], coordinate[0]]
                      for coordinate in coordinates]

    polygon = ee.Geometry.Polygon(coords_swapped)
    collection = (
        ee.ImageCollection("COPERNICUS/S2_SR_HARMONIZED")
        .filterBounds(polygon)
        .filterMetadata("CLOUD_COVERAGE_ASSESSMENT", "less_than", 10)
        .filterDate(start_date, end_date)
    )

    def calculate_ndvi(image):
        ndvi = image.normalizedDifference(['B8', 'B4']).rename('NDVI')
        return image.addBands(ndvi)

    ndvi_collection = collection.map(calculate_ndvi)

    max_ndvi = ndvi_collection.select('NDVI').max()

    region_reducer = max_ndvi.reduceRegion(
        reducer=ee.Reducer.max(),
        geometry=polygon,
        scale=10,
        maxPixels=1e9
    )

    max_ndvi_value = region_reducer.getInfo().get('NDVI')
    #print("Max NDVI value:", max_ndvi_value)

    cloud_collection = (
        ee.ImageCollection("COPERNICUS/S2_CLOUD_PROBABILITY")
        .filterBounds(polygon)
        .filterDate(start_date, end_date)
    )
    with concurrent.futures.ThreadPoolExecutor() as executor:
        partial_process_image = partial(
            process_image,
            index=index,
            polygon=polygon,
            cloud_collection=cloud_collection,
            with_mask=with_mask
        )

        # Update the function call to use tuples with image and parameters
        args_list = [(image, None)
                     for image in collection.getInfo()["features"]]
        results = []
        try:
            # Use as_completed to get the results as they complete
            futures = {
                executor.submit(partial_process_image, args): args for args in args_list
            }
            for future in concurrent.futures.as_completed(futures):
                try:
                    result = future.result()
                    if result is not None:
                        results.append(result)
                except Exception as e:
                    # Handle exceptions raised by the process_image function
                    print(f"Error in process_image: {e}")
        except Exception as e:
            # Handle exceptions raised during the ThreadPoolExecutor execution
            print(f"Error in ThreadPoolExecutor: {e}")
    # Extract sorted_array from the filtered results
    # print("passed percentage :", cloud_percent)
    sorted_array = sorted(
        (
            result[1]
            for result in results
            if result[1]["cloud_percentage"] <= 40
            and result[1]["cloud_percentage"] != -1
        ),
        key=lambda x: x["date"],
    )
    unique_dates = set()
    final_results = []

    for result in sorted_array:
        date = result["date"]
        if date not in unique_dates:
            unique_dates.add(date)
            final_results.append(result)
    # print("sorted_array",sorted_array)
    # Extract NDVI mean values from the sorted_array
    means = [item["value"]
             for item in final_results if item["value"] is not None]

    # Find overall min and max values
    overall_min = min(means) if means else None
    overall_max = max(means) if means else None

    df = pd.DataFrame(final_results)
    df["date"] = pd.to_datetime(df["date"])

    # Resample the data to fortnightly time-steps using the fortnightly median
    df_resampled = df.set_index("date").resample("5D").median()
    # Adjust the index by subtracting one day
    df_resampled.index = df_resampled.index - pd.Timedelta(days=1)
    # Interpolate to fill missing values and create a continuous curve
    df_resampled_continuous = df_resampled.interpolate(method="linear")
    df_resampled_continuous["NDVI_rolling_mean"] = (
        df_resampled_continuous["value"].rolling(window=4, center=True).mean()
    )
    df_resampled_continuous["NDVI_rolling_mean"].fillna(
        df_resampled_continuous["value"], inplace=True
    )
    # Convert the DataFrame back to a list of dictionaries
    resampled_list = df_resampled_continuous.reset_index().to_dict(orient="records")

    # Convert 'date' column back to original format
    for entry in resampled_list:
        entry["date"] = entry["date"].strftime("%Y-%m-%d")
        entry["value"] = round(entry["value"], 2)
        entry["cloud_percentage"] = round(entry["cloud_percentage"], 0)
        entry["NDVI_rolling_mean"] = round(entry["NDVI_rolling_mean"], 3)

    # Find the minimum and maximum values of NDVI_rolling_mean
    min_ndvi_rolling_mean = min(entry["NDVI_rolling_mean"]
                                for entry in resampled_list)
    max_ndvi_rolling_mean = max(entry["NDVI_rolling_mean"]
                                for entry in resampled_list)

    if min_ndvi_rolling_mean < overall_min:
        overall_min = min_ndvi_rolling_mean
    if max_ndvi_rolling_mean > overall_max:
        overall_max = max_ndvi_rolling_mean
    #print("final_results", final_results)
    #print(len(final_results))
    print("------------------------------")
    print("Resampled success ")
    #print("resampled_list", resampled_list)
    #print(len(resampled_list))
    final_results_json = []
    for item in final_results:
        final_results_json.append({
            "date": str(item["date"]),
            "value": item["value"],
            "cloud_percentage": item["cloud_percentage"],
        })
    resampled_list_json = [
        {
            "date": str(item["date"]),
            "value": item["value"],
            "cloud_percentage": item["cloud_percentage"],
            "NDVI_rolling_mean": item["NDVI_rolling_mean"],
        }
        for item in resampled_list
    ]
    # Convert lists to JSON strings
    # final_results_json_str = json.dumps(final_results_json, cls=DateTimeEncoder)
    # resampled_list_json_str = json.dumps(resampled_list_json, cls=DateTimeEncoder)
    # print("final_results_json_str", final_results_json_str)
    graphSerializer = GraphDataSerializer(
        data={
            "task": task_id,
            "data": final_results_json,
            "data_smoothed": resampled_list_json,
            "min": overall_min,
            "max": overall_max,
            "index": index,
        }
    )

    if graphSerializer.is_valid():
        try:
            # Try to get an existing record with the same task_id and index
            existing_record = GraphData.objects.get(task=task_id, index=index)

            # If a record exists, update its fields
            existing_record.data = final_results_json
            existing_record.data_smoothed = resampled_list_json
            existing_record.min = overall_min
            existing_record.max = overall_max
            existing_record.save()

        except GraphData.DoesNotExist:
            # If no record exists, create a new one
            graphSerializer.save()

        except IntegrityError as e:
            # Handle any potential IntegrityError
            print(f"Error: {e}")
    else:
        errors = graphSerializer.errors
        print(errors)


def updateIndexHistory(task, collection, last_date, end_date, datagraph, polygon, with_mask=False):
    #print("with mask inside updateIndexHistory", with_mask)

    array = []
    cloud_collection = (
        ee.ImageCollection("COPERNICUS/S2_CLOUD_PROBABILITY")
        .filterBounds(polygon)
        .filterDate(last_date, end_date)
    )
    with concurrent.futures.ThreadPoolExecutor() as executor:
        partial_process_image = partial(
            process_image,
            index=datagraph.index,
            polygon=polygon,
            cloud_collection=cloud_collection,
            with_mask=with_mask
        )

        # Update the function call to use tuples with image and parameters
        args_list = [(image, None)
                     for image in collection.getInfo()["features"]]
        results = []
        try:
            # Use as_completed to get the results as they complete
            futures = {
                executor.submit(partial_process_image, args): args for args in args_list
            }
            for future in concurrent.futures.as_completed(futures):
                try:
                    result = future.result()
                    if result is not None:
                        results.append(result)
                except Exception as e:
                    # Handle exceptions raised by the process_image function
                    print(f"Error in process_image: {e}")
        except Exception as e:
            # Handle exceptions raised during the ThreadPoolExecutor execution
            print(f"Error in ThreadPoolExecutor: {e}")
    # Extract sorted_array from the filtered results
    # print("passed percentage :", cloud_percent)
    sorted_array = sorted(
        (
            result[1]
            for result in results
            if result[1]["cloud_percentage"] <= 40
            and result[1]["cloud_percentage"] != -1
        ),
        key=lambda x: x["date"],
    )
    unique_dates = set()
    final_results = []

    for result in sorted_array:
        date = result["date"]
        if date not in unique_dates:
            unique_dates.add(date)
            final_results.append(result)
    # print("sorted_array",sorted_array)

    #print("final results", final_results)
    final_results_json = [
        {
            "date": str(item["date"]),
            "value": item["value"],
            "cloud_percentage": item["cloud_percentage"],
        }
        for item in final_results
    ]
    datagraph.data.extend(final_results_json)
    unique_dates_set = set()
    datagraph.data = [
        result
        for result in datagraph.data
        if result["date"] not in unique_dates_set
        and not unique_dates_set.add(result["date"])
    ]
    #print(datagraph.data)

    # Extract NDVI mean values from the sorted_array
    means = [item["value"]
             for item in datagraph.data if item["value"] is not None]
    # Find overall min and max values
    overall_min = min(means) if means else None
    overall_max = max(means) if means else None

    df = pd.DataFrame(datagraph.data)
    df["date"] = pd.to_datetime(df["date"])

    # Resample the data to fortnightly time-steps using the fortnightly median
    df_resampled = df.set_index("date").resample("2W").median()
    # Adjust the index by subtracting one day
    df_resampled.index = df_resampled.index - pd.Timedelta(days=1)
    # Interpolate to fill missing values and create a continuous curve
    df_resampled_continuous = df_resampled.interpolate(method="linear")
    df_resampled_continuous["NDVI_rolling_mean"] = (
        df_resampled_continuous["value"].rolling(window=4, center=True).mean()
    )
    df_resampled_continuous["NDVI_rolling_mean"].fillna(
        df_resampled_continuous["value"], inplace=True
    )
    # Convert the DataFrame back to a list of dictionaries
    resampled_list = df_resampled_continuous.reset_index().to_dict(orient="records")

    # Convert 'date' column back to original format
    for entry in resampled_list:
        entry["date"] = entry["date"].strftime("%Y-%m-%d")
        entry["value"] = round(entry["value"], 2)
        entry["cloud_percentage"] = round(entry["cloud_percentage"], 0)
        entry["NDVI_rolling_mean"] = round(entry["NDVI_rolling_mean"], 3)

    # Find the minimum and maximum values of NDVI_rolling_mean
    min_ndvi_rolling_mean = min(entry["NDVI_rolling_mean"]
                                for entry in resampled_list)
    max_ndvi_rolling_mean = max(entry["NDVI_rolling_mean"]
                                for entry in resampled_list)

    if min_ndvi_rolling_mean < overall_min:
        overall_min = min_ndvi_rolling_mean
    if max_ndvi_rolling_mean > overall_max:
        overall_max = max_ndvi_rolling_mean
    #print("final_results", final_results)
    #print(len(final_results))
    print('update Graph data')
    print("------------------------------")
    #print("resampled_list", resampled_list)
    #print(len(resampled_list))

    resampled_list_json = [
        {
            "date": str(item["date"]),
            "value": item["value"],
            "cloud_percentage": item["cloud_percentage"],
            "NDVI_rolling_mean": item["NDVI_rolling_mean"],
        }
        for item in resampled_list
    ]
    datagraph.data_smoothed = resampled_list_json
    datagraph.min = overall_min
    datagraph.max = overall_max
    for item in datagraph.data:
        if isinstance(item.get('cloud_percentage'), float) and math.isnan(item['cloud_percentage']):
            item['cloud_percentage'] = -1

    for item in datagraph.data_smoothed:
        if isinstance(item.get('cloud_percentage'), float) and math.isnan(item['cloud_percentage']):
            item['cloud_percentage'] = -1
    graphSerializer = GraphDataSerializer(
        instance=datagraph, data={}, partial=True)
    # Validate and save the project serializer
    try:
        graphSerializer.is_valid(raise_exception=True)
        graphSerializer.save()
    except ValidationError as e:
        # Handle validation errors
        return Response({"message": f"Validation error: {e}", "errors": e.detail})

    # Return a response indicating success
    return


def optimize_SARIMA(parameters_list, train_data, test_data, d, D, s):
    """
    Return a DataFrame with parameters, corresponding AIC, and RMSE.

    parameters_list - list with (p, q, P, Q) tuples
    train_data - training dataset
    test_data - test dataset
    d - integration order
    D - seasonal integration order
    s - length of season
    """
    results = []
    best_rmse = float("inf")

    for param in parameters_list:
        try:
            model = sm.tsa.SARIMAX(
                train_data,
                order=(param[0], d, param[1]),
                seasonal_order=(param[2], D, param[3], s),
            )
            fitted_model = model.fit(disp=False)

            # Make predictions
            pred = fitted_model.forecast(steps=len(test_data))
            error = np.sqrt(mean_squared_error(test_data, pred))

        except sm.tools.sm_exceptions.HessianInversionWarning as warn:
            continue

        except Exception as e:
            continue

        aic = fitted_model.aic

        # Save best model, AIC, and parameters
        if error < best_rmse:
            best_model = fitted_model
            best_rmse = error
            best_param = param
        results.append([param, aic, error])

    result_table = pd.DataFrame(results, columns=["parameters", "aic", "rmse"])
    # Sort in ascending order, lower RMSE is better
    result_table = result_table.sort_values(by="rmse", ascending=True).reset_index(
        drop=True
    )

    return result_table, best_model


pd.set_option("display.max_rows", None)


def sarimax_forecast(task_id, index):
    is_dataforecast = DataForecast.objects.filter(task_id=task_id, index=index)
    if is_dataforecast.exists():
        print(f"data forecast already calculated for {task_id} index {index}")
        return
    graphdata = GraphData.objects.filter(task_id=task_id, index=index).first()
    # print(graphdata.data)
    df = pd.DataFrame(graphdata.data)
    # print(df)
    # Convert 'date' column to datetime
    df = df[df["date"] >= "2018-01-01"]
    df = df[df["cloud_percentage"] < 20]
    df["date"] = pd.to_datetime(df["date"])

    # Now set 'date' as the DataFrame index
    df.set_index("date", inplace=True)

    # After setting 'date' as the index, the column no longer exists in df.columns
    forecast_year_params = ForecastYearsParams.objects.filter(
        task=task_id).first()
    if forecast_year_params:
        years_to_replace = forecast_year_params.BadYears
        replace_with = int(forecast_year_params.bestYear)
        for yr in years_to_replace:
            yr = int(yr)
            print(f"yr: {yr}, type: {type(yr)}")

            # year_data = edited_df[edited_df['Date'].dt.year == yr]
            replacement_year_data = df[df.index.year == replace_with]
            # print("replacement_year_data",replacement_year_data)
            df = df[df.index.year != yr]
            replacement_year_data.index = replacement_year_data.index.map(
                lambda x: x.replace(year=yr)
            )
            df = pd.concat([df, replacement_year_data])
            df.sort_index(inplace=True)

    # print("df after replace", df)

    # return null
    # Resample the data to fortnightly time-steps using the fortnightly median
    df_resampled = df.resample("2W").median()
    # print("df_resampled", df_resampled)
    # Interpolate to fill missing values and create a continuous curve
    df_resampled_continuous = df_resampled.interpolate(method="linear")
    ndvi_one_dimension = df_resampled_continuous.groupby(df_resampled_continuous.index)[
        "value"
    ].mean()
    test_size = 0.2
    train_data, test_data = train_test_split(
        ndvi_one_dimension, test_size=test_size, shuffle=False
    )

    p = range(0, 3)
    d = 1
    q = range(0, 3)
    P = range(0, 3)
    D = 1
    Q = range(0, 3)
    s = 6
    # Create a list with all possible combinations of parameters
    parameters = itertools.product(p, q, P, Q)
    parameters_list = list(parameters)
    print("Number of iterations to run:", len(parameters_list))

    # Assuming train_data and test_data are your training and test datasets
    # Run model selection
    best_models_table, best_model = optimize_SARIMA(
        parameters_list, train_data, test_data, d, D, s
    )

    # Print the best models and their RMSE scores
    print("Best models:")
    print(best_models_table)

    # You can access the best model using the 'best_model' variable
    print("Best model parameters:")
    # selected model index
    model_sel_index = 0

    # store parameters from selected model
    p, q, P, Q = best_models_table.iloc[model_sel_index].parameters
    print(best_models_table.iloc[model_sel_index])

    # fit the model with the parameters identified above
    best_model = sm.tsa.SARIMAX(
        train_data, order=(p, d, q), seasonal_order=(P, D, Q, s)
    ).fit()
    # Convert parameters to JSON
    params_json = {
        "p": p,
        "d": d,
        "q": q,
        "P": P,
        "D": D,
        "Q": Q,
        "s": s,
    }
    # Save the SARIMAX parameters to the DataForecast model

    dataserializer = DataForecastSerializer(
        data={
            "task": task_id,
            "params": params_json,
            "season_months": s,  # Assuming 's' represents the seasonal period
            "index": index,
        }
    )
    # Check if the data is valid
    if dataserializer.is_valid():
        # Save the DataForecast instance
        dataserializer.save()
    else:
        # Handle invalid data case
        print("Error: Invalid data provided for DataForecast.")

    # pred_test = best_model.predict(
    #     start=len(train_data), end=(len(test_data) + len(train_data) - 1)
    # )

    # Get the forecast and confidence intervals for specific points within each month
    # forecast_dates = pd.date_range(
    #     start="2024-01-01", end="2024-08-01", freq="MS"
    # )  # First day of each month
    # forecast_index = forecast_dates + pd.DateOffset(
    #     months=-1
    # )  # Shift the index by 1 month
    # forecast = best_model.get_forecast(steps=len(forecast_dates), index=forecast_index)
    return True


def sarimax_forecast_predict(task_id, index, params):
    D = params["D"]
    P = params["P"]
    Q = params["Q"]
    d = params["d"]
    p = params["p"]
    q = params["q"]
    s = params["s"]
    graphdata = GraphData.objects.filter(task_id=task_id, index=index).first()
    dataforecast = DataForecast.objects.filter(
        task_id=task_id, index=index).first()
    df = pd.DataFrame(graphdata.data)

    df["date"] = pd.to_datetime(df["date"])
    df_resampled = df.set_index("date").resample("M").median()
    # Interpolate to fill missing values and create a continuous curve
    df_resampled_continuous = df_resampled.interpolate(method="linear")
    ndvi_one_dimension = df_resampled_continuous.groupby(df_resampled_continuous.index)[
        "value"
    ].mean()
    test_size = 0.2
    train_data, test_data = train_test_split(
        ndvi_one_dimension, test_size=test_size, shuffle=False
    )
    best_model = sm.tsa.SARIMAX(
        train_data, order=(p, d, q), seasonal_order=(P, D, Q, s)
    ).fit()
    data = graphdata.data
    last_date = data[-1]["date"]
    print("last_date", last_date)
    start_date = datetime.datetime.strptime(last_date, "%Y-%m-%d").date()
    print("start_date", start_date)

    year = start_date.year
    print("year", year)
    first_date_of_year = datetime.date(year, 1, 1)
    last_date_of_year = datetime.date(year, 12, 31)
    print("first_date_of_year", first_date_of_year)
    print("last_date_of_year", last_date_of_year)
    # one_month_earlier = start_date - relativedelta(months=1)
    # print("one_month_earlier", one_month_earlier)
    # Add 6 months to the last date
    # end_date = start_date + pd.DateOffset(months=6)
    # print("end_date", end_date)

    # Create a DataFrame with date range
    forecast_dates = pd.date_range(
        start=first_date_of_year, end=last_date_of_year, freq="MS"
    )
    # forecast_index = forecast_dates + pd.DateOffset(
    #     months=-1
    # )  # Shift the index by 1 month
    # forecast = best_model.get_forecast(steps=len(forecast_dates), index=forecast_index)
    forecast = best_model.get_forecast(steps=len(forecast_dates))
    # forecast = best_model.get_forecast(steps=len(test_data))
    # Extract forecasted values from the PredictionResultsWrapper object
    forecast_values = forecast.predicted_mean.shift(-1)
    # Handle NaN values by replacing them with the last available value from y_train
    print("forecast_values", forecast_values)
    nan_mask = np.isnan(forecast_values)
    print("nan_mask", nan_mask)
    forecast_values.drop(forecast_values.tail(1).index, inplace=True)
    forecast_values = forecast_values.tolist()
    # Generate the list of forecast dates
    forecast_dates = (
        pd.date_range(start=first_date_of_year,
                      end=last_date_of_year, freq="MS")
        .strftime("%Y-%m-%d")
        .tolist()
    )
    forecast_dates = pd.to_datetime(forecast_dates)
    # print("forecast_values", forecast_values)

    # Create a list of dictionaries with the desired format
    forecast_list = [
        {"date": date.strftime("%Y-%m-%d"), "value": round(value, 3)}
        for date, value in zip(forecast_dates, forecast_values)
    ]

    df_predict = pd.DataFrame(forecast_list)
    df_predict["date"] = pd.to_datetime(df_predict["date"])

    # Resample the data to fortnightly time-steps using the fortnightly median
    df_resampled = df_predict.set_index("date").resample("1D").median()
    # Adjust the index by subtracting one day
    df_resampled.index = df_resampled.index - pd.Timedelta(days=1)
    # Interpolate to fill missing values and create a continuous curve
    df_resampled_continuous = df_resampled.interpolate(method="linear")
    print("forecast_list", forecast_list)
    # print("df_resampled_continuous", df_resampled_continuous)

    forecast_dict = [
        {"date": index.strftime("%Y-%m-%d"), "value": round(row["value"], 3)}
        for index, row in df_resampled_continuous.iterrows()
    ]

    print("fortnite", forecast_dict)
    # Convert forecast_list and forecast_dict to JSON strings
    # forecast_list_json = json.dumps(forecast_list)
    # forecast_dict_json = json.dumps(forecast_dict)

    dataforecast_data = {
        "data_predict": forecast_list,
        "data_predict_fortnite": forecast_dict,
    }

    data_forecast_serializer = DataForecastSerializer(
        dataforecast, data=dataforecast_data, partial=True, many=False
    )
    if data_forecast_serializer.is_valid():
        data_forecast_serializer.save()
    else:
        # Handle serializer validation errors
        print(data_forecast_serializer.errors)
    return forecast_list

    # df_resampled_continuous["date"] = pd.to_datetime(df_resampled_continuous["date"])

    # # Convert the DataFrame to a list of dictionaries
    # data = df_resampled_continuous.to_dict(orient="records")

    # # Convert each timestamp to ISO format in the 'date' field
    # for entry in data:
    #     entry["date"] = entry["date"].isoformat()

    # # Convert the list of dictionaries to JSON
    # fortnite_json = json.dumps(data)
    # graphdata.data_predict = forecast_list
    # graphdata.data_predict_fortnite = df_resampled_continuous
    # Plot actual vs forecast
    # plt.figure(figsize=(12, 6))
    # plt.plot(train_data.index, train_data, label="Train Data")
    # plt.plot(test_data.index, test_data, label="Test Data")
    # plt.plot(test_data.index, forecast_values, label="Forecast")
    # plt.title("Actual vs Forecast")
    # plt.xlabel("Date")
    # plt.ylabel("NDVI")
    # plt.xticks(rotation=45, ha="right")
    # plt.legend()
    # plt.grid(True)
    # plt.tight_layout()
    # plt.show()

    # forecast = best_model.predict(start=first_date_of_year, end=last_date_of_year)
    # actual_data = df_resampled_continuous[first_date_of_year:last_date_of_year]["value"]
    # # Plot actual vs forecast
    # plt.figure(figsize=(12, 6))
    # plt.plot(actual_data.index, actual_data, label="Actual Data", color="blue")
    # plt.plot(forecast.index, forecast, label="Forecast", color="red")
    # plt.title("Actual vs Forecast")
    # plt.xlabel("Date")
    # plt.ylabel("NDVI")
    # plt.xticks(rotation=45, ha="right")
    # plt.legend()
    # plt.grid(True)
    # plt.tight_layout()
    # plt.show()


def create_dates(coords_swapped, start_date, end_date, task):
    # coordinates = [list(coord) for coord in cord[:-1]]
    # coords_swapped = [[coordinate[1], coordinate[0]] for coordinate in coordinates]
    polygon = ee.Geometry.Polygon(coords_swapped)
    ee_start_date = ee.Date(start_date)
    ee_end_date = ee.Date(end_date)
    with concurrent.futures.ThreadPoolExecutor() as executor:
        sentinel_future = executor.submit(
            get_sentinel2_dates, polygon, ee_start_date, ee_end_date
        )
        landsat8_future = executor.submit(
            get_landsat8_dates, polygon, ee_start_date, ee_end_date
        )
        landsat9_future = executor.submit(
            get_landsat9_dates, polygon, ee_start_date, ee_end_date
        )
    # Get results from the futures
    sentinel_dates = sentinel_future.result()
    landsat8_dates = landsat8_future.result()
    landsat9_dates = landsat9_future.result()
    sentinel_dates_array = sentinel_dates["dates"]
    landsat8_dates_array = landsat8_dates["dates"]
    landsat9_dates_array = landsat9_dates["dates"]
    all_dates = list(sentinel_dates["dates"])
    for i in range(len(sentinel_dates_array) - 1):
        current_date = datetime.datetime.strptime(
            sentinel_dates_array[i]["date"], "%Y-%m-%d"
        )
        next_date = datetime.datetime.strptime(
            sentinel_dates_array[i + 1]["date"], "%Y-%m-%d"
        )

        if (next_date - current_date).days >= 6:
            print(
                f"Dates {sentinel_dates_array[i]['date']} and {sentinel_dates_array[i + 1]['date']} have a difference of 6 days."
            )
            gap_start = current_date + datetime.timedelta(days=1)
            gap_end = next_date - datetime.timedelta(days=1)
            # Look in landsat8_dates_array
            filler_dates = [
                entry
                for entry in landsat8_dates_array
                if gap_start
                <= datetime.datetime.strptime(entry["date"], "%Y-%m-%d")
                <= gap_end
            ]

            # If no suitable dates found in landsat8_dates_array, look in third_array
            if not filler_dates:
                filler_dates = [
                    entry
                    for entry in landsat9_dates_array
                    if gap_start
                    <= datetime.datetime.strptime(entry["date"], "%Y-%m-%d")
                    <= gap_end
                ]
            all_dates.extend(filler_dates)
    all_dates = sorted(
        all_dates, key=lambda x: datetime.datetime.strptime(
            x["date"], "%Y-%m-%d")
    )
    MAX_WORKERS = 20
    with futures.ThreadPoolExecutor(max_workers=MAX_WORKERS) as executor:
        arguments = [
            (entry["date"], entry["provider"],
             entry["cloud_percentage"], polygon, task)
            for entry in all_dates
        ]
        # Submit tasks to the executor and gather the results
        results = list(executor.map(fetch_image, arguments))

    # print(dates)
    for result in results:
        if isinstance(result, dict):
            # Handle errors
            return Response(result, status=status.HTTP_400_BAD_REQUEST)
        else:
            # Handle success
            pass


def createAlerts(task, dates, selected_record, predictdata):
    print("inside create alerts")
    print("selected_record", selected_record)
    print("dates", dates)
    # print("predictdata", predictdata.data_predict_fortnite)
    # print("graphdata", selected_record.data)
    # print("predictdata", predictdata)
    # print()
    forecast_data = pd.DataFrame(predictdata.data_predict_fortnite)
    real_data = pd.DataFrame(selected_record.data)
    forecast_data = forecast_data.set_index("date")
    real_data = real_data.set_index("date")
    # pd.set_option("display.max_rows", None)
    # pd.set_option("display.max_columns", None)
    # print("real_data before", real_data)
    real_data = real_data[real_data["cloud_percentage"] < 20]
    # print("real_data", real_data)
    from_date = forecast_data.iloc[0].name
    real_data = real_data[real_data.index > from_date]
    comb_data = pd.DataFrame()
    comb_data["real_val"] = real_data["value"]
    comb_data["pred_val"] = forecast_data["value"]
    comb_data.index = real_data.index
    comb_data
    # residuals = comb_data["real_val"] - comb_data["pred_val"]
    # residuals_mean = residuals.mean()
    # residuals_stddev = residuals.std()
    # z_scores = (residuals - residuals_mean) / residuals_stddev
    # comb_data["zscore"] = z_scores
    # threshold = 0.4

    for date, row in comb_data.iterrows():
        print("date inside loop", date)
        diff = abs(row["real_val"] - row["pred_val"])
        print("diff",diff)
        if diff >= 0.1:

            # if abs(row["zscore"]) > threshold:
            #     print(f"anomaly alert for date {date}, z-score: {row['zscore']}")
            # comb_data.loc[date, "anomaly"] = True
            state = True
            if date in dates:
                state = False
            data = {
                "task": task.id,
                "index": "ndvi",
                "date": date,
                "abs_difference": round(diff, 3),
                "state": state,
            }
            print("data :", data)
            serializer = AlertPredictAddSerializer(data=data)
            try:
                if serializer.is_valid():
                    serializer.save()
                    # print(serializer.data["image"])
            except Exception as e:
                print("An error occurred: %s", str(e))
                print(serializer.errors)


def get_cloud_probability(image_with_cloud, polygon, cloud_prob_thresh):
    cloud_prob_band = image_with_cloud.select("probability")

    projection = image_with_cloud.select(0).projection()

    cloud_mask = cloud_prob_band.gte(cloud_prob_thresh)

    pix_tot = cloud_prob_band.reduceRegion(
        reducer=ee.Reducer.count(), geometry=polygon, scale=projection.nominalScale()
    ).get("probability")

    cl_count = cloud_mask.reduceRegion(
        reducer=ee.Reducer.sum(), geometry=polygon, scale=projection.nominalScale()
    ).get("probability")

    cloud_percent = ee.Number(cl_count).divide(pix_tot).multiply(100)

    return cloud_percent.getInfo()


def cordinates_to_polygon(area):
    coordinates = list(area)
    coordinates = [list(coord) for coord in coordinates[:-1]]
    coords_swapped = [[coordinate[1], coordinate[0]]
                      for coordinate in coordinates]
    return ee.Geometry.Polygon(coords_swapped)


def cordinates_swapped(area):
    coordinates = list(area)
    coordinates = [list(coord) for coord in coordinates[:-1]]
    coords_swapped = [[coordinate[1], coordinate[0]]
                      for coordinate in coordinates]
    return coords_swapped


def create_polygon(coords):
    ring = ogr.Geometry(ogr.wkbLinearRing)
    for coord in coords:
        ring.AddPoint(coord[0], coord[1])
    # Check if the ring is closed; if not, close it
    if coords[0] != coords[-1]:
        ring.AddPoint(coords[0][0], coords[0][1])
    ring.CloseRings()

    # Create polygon
    poly = ogr.Geometry(ogr.wkbPolygon)
    poly.AddGeometry(ring)
    return poly.ExportToWkt()

# Transform geographic coordinates to projected coordinates (UTM zone 32N)


def transform_coords(coords, dst_epsg, src_epsg=4326):
    transformer = Transformer.from_crs(
        f'epsg:{src_epsg}', f'epsg:{dst_epsg}', always_xy=True)
    transformed_coords = [transformer.transform(
        coord[0], coord[1]) for coord in coords]
    return transformed_coords


