from django.core.files.storage import default_storage
from django.core.exceptions import ObjectDoesNotExist
from pandas._libs.tslibs.conversion import timezone
from rest_framework.permissions import AllowAny
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from django.forms.models import model_to_dict
from dateutil.relativedelta import relativedelta
import math
from openpyxl import Workbook
from django.db.models import F
from django.db.models import Q

import ee
from authentification.models import UserAccount

from authentification.serializers import UserAccountSerializer
import requests
from .serializers import (
    AddProjectSerializer,
    ProjectSerializer,
    UpdateProjectByDeletedTaskSerializer,
    SensorSerializer,
    TaskSerializer,
    ListProjectSerializer,
    AddTaskSerializer,
    UpdateProjectByTaskSerializer,
    CultureSerializer,
    TextureSerializer,
    IrrigationSerializer,
    TaskImageSerializer,
    VarietySerializer,
    DensitySerializer,
    HighResolutionRequestSerializer,
    ListSubscriptionSerializer,
    SubscriptionSerializer,
    SensorDataSerializer,
    NoteSerializer,
    PlantCountSerializer,
    PdfReportSerializer,
    ProductTypeSerializer,
    ProductSerializer,
    DiseaseSerializer,
    DiseaseActorSerializer,
    FertilisationProductSerializer,
    EventSerializer,
    UpdateEventSerializer,
    AddEventSerializer,
    ProjectsEventsSerializer,
    EventTaskSerializer,
    TaskByProjectEventsSerializer,
    GraphDataSerializer,
    GraphDataTaskSerializer,
    UserHistorySerializer,
    StadesPhenologiqueSerializer,
    TaskAlertsSerializer,
    TaskGenericAlertsSerializer,
    TaskAlertsHeadSerializer,
    TaskGenericAlertsHeadSerializer,
    ForecastYearsParamsSerializer,
    FieldVisitSerializer,
    VisitFileSerializer,
    PatternSerializer,
    AddQuoteSerializer,
    HistogramStaticSerializer,
    AnomalyTypeSerializer,
    AnomalySerializer,
    AnomalyFileSerializer,
    AnomalyDetailSerializer,
    PatternSelfSerializer,
    TaskReferenceComparisonSerializer,
    TaskReferenceComparisonListSerializer,
    HistogramSerializer,
    AddTaskImageSerializer,
    PdfInvoiceSerializer, ShowNotificationsTaskSerializer, CultureCategoriesSerializer,
)
from django.db.models.functions import TruncDay
from django.db.models import Count

from .models import (
    Histogram,
    Project,
    Task,
    Sensor,
    Culture,
    Texture,
    Irrigation,
    TaskImage,
    Variety,
    Density,
    Subscription,
    SensorData,
    Note,
    PlantCount,
    PdfReport,
    Product,
    Disease,
    DiseaseActor,
    FertilisationProduct,
    Event,
    ProductType,
    GraphData,
    UserHistory,
    DataForecast,
    StadesPhenologique,
    AlertPredict,
    ForecastYearsParams,
    Pattern,
    FieldVisit,
    VisitFile, HistogramStatic,
    Alert,
    PatternAlert, AnomalyType, Anomaly, AnomalyFile,
    IndexForecast,
    ForecastAlert,
    SensorHumidityAlert,
    SensorBatteryLevelAlert,
    PatternSelf,
    PatternSelfAlert,
    TaskReferenceComparison,
    HistogramBins,
    PdfInvoice, ShowNotificationsTask, CultureCategories,
)
from functools import partial
import pandas as pd
import numpy as np
import rasterio as rio
from decimal import Decimal
from osgeo import gdal

from django.contrib.gis.geos import Polygon
import datetime
from django.http import HttpResponse
from django.utils.encoding import smart_str
from .functions import (
    calculate_gci,
    calculate_ndre,
    calculate_ndvi,
    calculate_ndwi,
    calculate_psri,
    calculate_rgb,
    zoomBySurface,
    get_available_dates,
    process_image,
    service_calculate_ndvi,
    service_calculate_ndre,
    service_calculate_ndwi,
    service_calculate_gci,
    get_last_year_dates,
    getStartEndDate,
    generateTaskImage,
    generateTaskImageSidebar,
    get_region_info,
    calculateIndexHistory,
    updateIndexHistory,
    sarimax_forecast,
    sarimax_forecast_predict,
    create_dates,
    createAlerts,
    cordinates_to_polygon,
    cordinates_swapped
)
from .calculations import create_main_tif, create_index_tif, getStaticHistogram, create_index_productivity, \
    create_index_tif_comparator, check_available_dates, create_terrain_model_tif, calculate_index_difference
import concurrent.futures
import os
from django.conf import settings
from rest_framework import status
import json
from django.http import JsonResponse
from django.core.mail import EmailMultiAlternatives
from django.template.loader import render_to_string
from django.utils.html import strip_tags
from django.db.models import Sum
from django.utils import timezone
from concurrent.futures import ThreadPoolExecutor
import threading
from django.shortcuts import get_object_or_404
import base64
from django.core.files.base import ContentFile, File
from django.core.files.uploadedfile import InMemoryUploadedFile
import io

from .models import User

from django.db import models
from django.http import HttpResponse
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
import openpyxl
from openpyxl.styles import PatternFill
from datetime import datetime
import re
planet_ms_url = "https://planet.ms.robocare.tn"


# planet_ms_url = "http://localhost:8008"


@api_view(["POST"])
@permission_classes([AllowAny])
def Details_Task(request):
    id_task = request.data.get("id")
    try:
        task = Task.objects.get(id=id_task)
        taskSerializer = TaskSerializer(task)
        project = task.project
        projectSerializer = ProjectSerializer(project)
        density = task.density
        densityserializer = DensitySerializer(density)
        ndvi = {
            "min": densityserializer.data["ndvi_min"],
            "max": densityserializer.data["ndvi_max"],
        }
        ndre = {
            "min": densityserializer.data["ndre_min"],
            "max": densityserializer.data["ndre_max"],
        }
        ndwi = {
            "min": densityserializer.data["ndwi_min"],
            "max": densityserializer.data["ndwi_max"],
        }
        gci = {
            "min": densityserializer.data["gci_min"],
            "max": densityserializer.data["gci_max"],
        }

    except Task.DoesNotExist:
        return Response({"message": "Task not found"}, status=status.HTTP_404_NOT_FOUND)
    except Project.DoesNotExist:
        return Response(
            {"message": "Related project not found"}, status=status.HTTP_404_NOT_FOUND
        )

    coordinates = list(task.area_of_interest[0])
    coordinates = [list(coord) for coord in coordinates[:-1]]
    coords_swapped = [[coordinate[1], coordinate[0]]
                      for coordinate in coordinates]
    # start_date = task.start_date.strftime('%Y-%m-%d')
    # end_date = task.end_date.strftime('%Y-%m-%d')
    start_date = request.data.get("date")
    provider = request.data.get("provider")
    print("date_from react", start_date)
    start_date = datetime.datetime.strptime(start_date, "%Y-%m-%d")
    end_date = start_date + datetime.timedelta(days=1)
    print(start_date)
    num_workers = 7  # Number of parallel workers
    executor = concurrent.futures.ThreadPoolExecutor(max_workers=num_workers)

    # resndvi = ndvi_map(coords_swapped, start_date, end_date)
    # resndre = ndre_map(coords_swapped, start_date, end_date)
    # resndwi = ndwi_map(coords_swapped, start_date, end_date)
    # resgci = gci_map(coords_swapped, start_date, end_date)

    # Submit the tasks to the executor for parallel execution
    future_ndvi = executor.submit(
        calculate_ndvi, coords_swapped, start_date, end_date, ndvi, provider
    )
    if provider == "S2":
        future_ndre = executor.submit(
            calculate_ndre, coords_swapped, start_date, end_date, ndre
        )
        future_psri = executor.submit(
            calculate_psri, coords_swapped, start_date, end_date
        )
    else:
        future_ndre = None
        future_psri = None
    future_ndwi = executor.submit(
        calculate_ndwi, coords_swapped, start_date, end_date, ndwi, provider
    )
    future_gci = executor.submit(
        calculate_gci, coords_swapped, start_date, end_date, gci, provider
    )
    future_rgb = executor.submit(
        calculate_rgb, coords_swapped, start_date, end_date, provider
    )

    resndvi = future_ndvi.result()
    resndre = future_ndre.result() if future_ndre else None
    respsri = future_psri.result() if future_psri else None
    resndwi = future_ndwi.result()
    resgci = future_gci.result()
    resrgb = future_rgb.result()

    num_points = len(coords_swapped)
    center_x = sum(point[0] for point in coords_swapped) / num_points
    center_y = sum(point[1] for point in coords_swapped) / num_points
    zoomLevel = zoomBySurface(taskSerializer.data["surface"])
    center = [center_x, center_y]
    res = {
        "data": {
            "ndvi": resndvi,
            "ndwi": resndwi,
            "ndre": resndre,
            "gci": resgci,
            "psri": respsri,
            "rgb": resrgb,
        },
        "task": taskSerializer.data,
        "project": projectSerializer.data,
        "center": center,
        "zoom": zoomLevel,
    }

    # getting sensors if exist
    try:
        sensors = Sensor.objects.filter(task=id_task)
        sensorSerializer = SensorSerializer(sensors, many=True)
    except Task.DoesNotExist:
        return Response({"message": "Task detail successfuly", "data": res}, status=200)
    print(sensorSerializer.data)
    res["sensors"] = sensorSerializer.data
    return Response({"message": "Task detail successfuly", "data": res}, status=200)


@api_view(["POST"])
@permission_classes([AllowAny])
def Service_Details_Task(request):
    AOI = request.data.get("polygon")
    if AOI is None:
        return Response({"message": "no area of interest passed !"}, status=500)
    # coordinates = list(task.area_of_interest[0])
    # coordinates = [list(coord) for coord in coordinates[:-1]]
    # coords_swapped = [[coordinate[1], coordinate[0]]
    #                   for coordinate in coordinates]

    num_workers = 4  # Number of parallel workers
    executor = concurrent.futures.ThreadPoolExecutor(max_workers=num_workers)

    future_ndvi = executor.submit(service_calculate_ndvi, AOI)
    future_ndre = executor.submit(service_calculate_ndre, AOI)
    future_ndwi = executor.submit(service_calculate_ndwi, AOI)
    future_gci = executor.submit(service_calculate_gci, AOI)
    # future_rgb = executor.submit(
    #     calculate_rgb, coords_swapped)
    # future_ndmi = executor.submit(
    #     calculate_ndmi, coords_swapped)

    # Wait for all tasks to complete and get the results
    resndvi = future_ndvi.result()
    resndre = future_ndre.result()
    resndwi = future_ndwi.result()
    resgci = future_gci.result()
    # resrgb = future_rgb.result()
    # resndmi = future_ndmi.result()

    res = {
        "data": {
            # "rgb": resrgb,
            "ndvi": resndvi,
            "ndwi": resndwi,
            "ndre": resndre,
            "gci": resgci,
            # "ndmi": resndmi
        }
    }

    # getting sensors if exist

    return Response({"message": "Task detail successfuly", "data": res}, status=200)


@api_view(["GET"])
@permission_classes([AllowAny])
def getAreaByTaskId(request, id_task):
    try:
        task = Task.objects.get(id=id_task)
    except Task.DoesNotExist:
        return JsonResponse(
            {"message": "Task not found"}, status=status.HTTP_404_NOT_FOUND
        )
    except Project.DoesNotExist:
        return JsonResponse(
            {"message": "Related project not found"}, status=status.HTTP_404_NOT_FOUND
        )

    coordinates = list(task.area_of_interest[0])
    coordinates = [list(coord) for coord in coordinates[:-1]]
    coords_swapped = [[coordinate[1], coordinate[0]]
                      for coordinate in coordinates]
    return JsonResponse(coords_swapped, safe=False)


@api_view(["GET"])
@permission_classes([AllowAny])
def Details_Task_initial(request, id_task):
    try:
        task = Task.objects.get(id=id_task)
        taskSerializer = TaskSerializer(task)
        project = task.project
        projectSerializer = ProjectSerializer(project)
        density = task.density
        densityserializer = DensitySerializer(density)
        ndvi = {
            "min": densityserializer.data["ndvi_min"],
            "max": densityserializer.data["ndvi_max"],
        }
        ndre = {
            "min": densityserializer.data["ndre_min"],
            "max": densityserializer.data["ndre_max"],
        }
        ndwi = {
            "min": densityserializer.data["ndwi_min"],
            "max": densityserializer.data["ndwi_max"],
        }
        gci = {
            "min": densityserializer.data["gci_min"],
            "max": densityserializer.data["gci_max"],
        }

    except Task.DoesNotExist:
        return Response({"message": "Task not found"}, status=status.HTTP_404_NOT_FOUND)
    except Project.DoesNotExist:
        return Response(
            {"message": "Related project not found"}, status=status.HTTP_404_NOT_FOUND
        )

    coordinates = list(task.area_of_interest[0])
    coordinates = [list(coord) for coord in coordinates[:-1]]
    coords_swapped = [[coordinate[1], coordinate[0]]
                      for coordinate in coordinates]
    polygon = ee.Geometry.Polygon(coords_swapped)
    list_date = get_available_dates(polygon)
    start_date = list_date["last_date"]
    start_date_datetime = datetime.datetime.strptime(start_date, "%Y-%m-%d")
    end_date = start_date_datetime + datetime.timedelta(days=1)
    start_date_formatted = start_date_datetime.strftime("%Y-%m-%d")
    print("start_date", start_date)
    print("end_date", end_date)
    num_workers = 7  # Number of parallel workers
    executor = concurrent.futures.ThreadPoolExecutor(max_workers=num_workers)

    # Submit the tasks to the executor for parallel execution
    future_ndvi = executor.submit(
        calculate_ndvi, coords_swapped, start_date, end_date, ndvi, "S2"
    )
    future_ndre = executor.submit(
        calculate_ndre, coords_swapped, start_date, end_date, ndre
    )
    future_ndwi = executor.submit(
        calculate_ndwi, coords_swapped, start_date, end_date, ndwi, "S2"
    )
    future_gci = executor.submit(
        calculate_gci, coords_swapped, start_date, end_date, gci, "S2"
    )

    future_psri = executor.submit(
        calculate_psri, coords_swapped, start_date, end_date)
    future_rgb = executor.submit(
        calculate_rgb, coords_swapped, start_date, end_date, "S2"
    )
    if float(task.surface) < 150.000:

        if not bool(task.image_sidebar):
            print("inside if image sidebar")
            # Make an asynchronous call to the second API using a separate thread
            thread = threading.Thread(
                target=generateTaskImageSidebar,
                args=(task,),
            )
            thread.start()
    # try:
    #     graph_data = GraphData.objects.filter(task=task.id)
    #     if not graph_data:
    #         print("No graph data found for task:", task.id)
    #         index_names = ["ndvi", "ndwi", "ndre", "gci", "psri"]
    #         # Create and start threads for each index
    #         for index_name in index_names:
    #             thread = threading.Thread(
    #                 target=calculateIndexHistory,
    #                 args=(task.id, index_name),
    #                 daemon=True,  # Set the thread as daemon
    #             )
    #             thread.start()
    # except GraphData.DoesNotExist:
    #     print("This block will not be executed as filter won't raise DoesNotExist.")

    # Wait for all tasks to complete and get the results
    resndvi = future_ndvi.result()
    resndre = future_ndre.result()
    resndwi = future_ndwi.result()
    resgci = future_gci.result()
    respsri = future_psri.result()
    resrgb = future_rgb.result()

    num_points = len(coords_swapped)
    center_x = sum(point[0] for point in coords_swapped) / num_points
    center_y = sum(point[1] for point in coords_swapped) / num_points
    center = [center_x, center_y]

    # def calculate_distance(point1, point2):
    #     return sqrt((point2[0] - point1[0]) ** 2 + (point2[1] - point1[1]) ** 2)

    # from math import radians, sin, cos, sqrt, atan2

    # def haversine_distance(point1, point2):
    #     lat1, lon1 = radians(point1[0]), radians(point1[1])
    #     lat2, lon2 = radians(point2[0]), radians(point2[1])
    #     dlat = lat2 - lat1
    #     dlon = lon2 - lon1
    #     a = sin(dlat / 2) ** 2 + cos(lat1) * cos(lat2) * sin(dlon / 2) ** 2
    #     c = 2 * atan2(sqrt(a), sqrt(1 - a))
    #     radius = 6371  # Radius of the Earth in kilometers
    #     distance = radius * c

    #     return distance

    # radius_around_aoi = 0
    # for vert in coords_swapped:
    #     distance = haversine_distance(center, vert)
    #     if (distance > radius_around_aoi):
    #         radius_around_aoi = distance

    if task.country_fr is None or task.country_fr == "":
        get_region_info(task, center_y, center_x,
                        "3c5039876d354d40b69d0535d79c89e2")

    zoomLevel = zoomBySurface(taskSerializer.data["surface"])
    res = {
        "data": {
            "ndvi": resndvi,
            "ndwi": resndwi,
            "ndre": resndre,
            "gci": resgci,
            "psri": respsri,
            "rgb": resrgb,
        },
        "task": taskSerializer.data,
        "project": projectSerializer.data,
        "center": center,
        "radius_around_aoi": radius_around_aoi,
        "zoom": zoomLevel,
        "last_date": {"date": start_date_formatted, "provider": "S2"},
    }

    # getting sensors if exist
    try:
        sensors = Sensor.objects.filter(task=id_task)
        sensorSerializer = SensorSerializer(sensors, many=True)
    except Task.DoesNotExist:
        return Response({"message": "Task detail successfuly", "data": res}, status=200)
    print(sensorSerializer.data)
    res["sensors"] = sensorSerializer.data
    return Response(
        {"message": "Task initial detail successfuly", "data": res}, status=200
    )


def date_diff(date1, date2):
    return date1.difference(date2, "day")


def date_to_timestamp(date_str):
    date_obj = datetime.datetime.strptime(date_str, "%Y-%m-%d")
    timestamp = (date_obj - datetime.datetime(1970, 1, 1)).total_seconds()
    return int(timestamp)


@api_view(["GET"])
@permission_classes([AllowAny])
def Get_dates(request, id):
    id_task = id
    try:
        task = Task.objects.get(id=id_task)
        coordinates = list(task.area_of_interest[0])
        coordinates = [list(coord) for coord in coordinates[:-1]]
        coords_swapped = [[coordinate[1], coordinate[0]]
                          for coordinate in coordinates]
        taskImages = TaskImage.objects.filter(task=task).order_by("-date")
        if taskImages.exists():
            last_image = taskImages.first()
            last_date = last_image.date
            # add a day to last date so the last date from database won't be included
            # last_date_datetime = datetime.datetime.strptime(last_date, "%Y-%m-%d")
            last_date = (last_date + datetime.timedelta(days=1)
                         ).strftime("%Y-%m-%d")
            # Set end_date to today's date
            end_date = (datetime.datetime.now() + datetime.timedelta(days=1)).strftime(
                "%Y-%m-%d"
            )
            print("last_date", last_date)
            print("end_date", end_date)

            polygon = ee.Geometry.Polygon(coords_swapped)
            collection = (
                ee.ImageCollection("COPERNICUS/S2_SR_HARMONIZED")
                .filterBounds(polygon)
                .filterMetadata("CLOUD_COVERAGE_ASSESSMENT", "less_than", 10)
                .filterDate(last_date, end_date)
            )
            # Extract dates from the Image Collection
            info = collection.getInfo()
            dates = [
                ee.Date(x["properties"]["system:time_start"])
                .format("YYYY-MM-dd")
                .getInfo()
                for x in info["features"]
            ]
            print("dates", dates)
            if not dates:
                taskImagesSerializer = TaskImageSerializer(
                    taskImages, many=True)
                first_task_image = taskImages[0]
                data = {
                    "last_date": first_task_image.date.strftime("%Y-%m-%d"),
                    "dates": taskImagesSerializer.data,
                }
                return Response(
                    {"message": "dates list successfully", "data": data}, status=200
                )
            else:
                create_dates(coords_swapped, last_date, end_date, task)
                try:
                    taskImages = TaskImage.objects.filter(
                        task=task).order_by("-date")
                    taskImagesSerializer = TaskImageSerializer(
                        taskImages, many=True)
                    # return Response(serializer.data)
                    first_task_image = taskImages[0]

                    data = {
                        "last_date": first_task_image.date.strftime("%Y-%m-%d"),
                        "dates": taskImagesSerializer.data,
                    }
                    return Response(
                        {"message": "dates list successfully", "data": data}, status=200
                    )
                except TaskImage.DoesNotExist:
                    return Response(
                        {"message": "Related dates and images not found"},
                        status=status.HTTP_404_NOT_FOUND,
                    )
        else:
            res = get_last_year_dates()
            formatted_start_date = str(res["end_date"])
            formatted_end_date = str(res["start_date"])
            # coordinates = list(task.area_of_interest[0])
            create_dates(coords_swapped, formatted_start_date,
                         formatted_end_date, task)
            try:
                taskImages = TaskImage.objects.filter(
                    task=task).order_by("-date")
                taskImagesSerializer = TaskImageSerializer(
                    taskImages, many=True)
                # return Response(serializer.data)
                first_task_image = taskImages[0]

                data = {
                    "last_date": first_task_image.date.strftime("%Y-%m-%d"),
                    "dates": taskImagesSerializer.data,
                }
                # for image in taskImagesSerializer.data:
                #     print("image", image["image"])

                return Response(
                    {"message": "dates list successfully", "data": data}, status=200
                )
            except TaskImage.DoesNotExist:
                return Response(
                    {"message": "Related dates and images not found"},
                    status=status.HTTP_404_NOT_FOUND,
                )
    except TaskImage.DoesNotExist:
        return Response(
            {"message": "Related dates and images not found"},
            status=status.HTTP_404_NOT_FOUND,
        )
    except Task.DoesNotExist:
        return Response({"message": "Task not found"}, status=status.HTTP_404_NOT_FOUND)
    except Project.DoesNotExist:
        return Response(
            {"message": "Related project not found"}, status=status.HTTP_404_NOT_FOUND
        )


@api_view(["GET"])
@permission_classes([AllowAny])
def Get_dates_sentinel(request, id):
    id_task = id
    try:
        task = Task.objects.get(id=id_task)
        coordinates = list(task.area_of_interest[0])
        coordinates = [list(coord) for coord in coordinates[:-1]]
        coords_swapped = [[coordinate[1], coordinate[0]] for coordinate in coordinates]
        taskImages = TaskImage.objects.filter(task=task).order_by("-date")

        if taskImages.exists():
            last_image = taskImages.first()
            last_date = (last_image.date + datetime.timedelta(days=1)).strftime("%Y-%m-%d")
            end_date = (datetime.datetime.now() + datetime.timedelta(days=1)).strftime("%Y-%m-%d")
            polygon = ee.Geometry.Polygon(coords_swapped)

            collection = (
                ee.ImageCollection("COPERNICUS/S2_SR_HARMONIZED")
                .filterBounds(polygon)
                .filterMetadata("CLOUD_COVERAGE_ASSESSMENT", "less_than", 10)
                .filterDate(last_date, end_date)
            )
            info = collection.getInfo()
            dates = [
                ee.Date(x["properties"]["system:time_start"]).format("YYYY-MM-dd").getInfo()
                for x in info["features"]
            ]

            if not dates:
                taskImagesSerializer = TaskImageSerializer(taskImages, many=True)
                first_task_image = taskImages[0]

                # Filter out images with provider "L8"
                filtered_dates = [
                    img for img in taskImagesSerializer.data if img["provider"] not in ["L8", "L9"]
                ]

                data = {
                    "last_date": first_task_image.date.strftime("%Y-%m-%d"),
                    "dates": filtered_dates,
                }
                return Response(
                    {"message": "dates list successfully", "data": data}, status=200
                )
            else:
                create_dates(coords_swapped, last_date, end_date, task)
                try:
                    taskImages = TaskImage.objects.filter(task=task).order_by("-date")
                    taskImagesSerializer = TaskImageSerializer(taskImages, many=True)
                    first_task_image = taskImages[0]

                    # Filter out images with provider "L8"
                    filtered_dates = [
                        img for img in taskImagesSerializer.data if img["provider"] not in ["L8", "L9"]
                    ]

                    data = {
                        "last_date": first_task_image.date.strftime("%Y-%m-%d"),
                        "dates": filtered_dates,
                    }
                    return Response(
                        {"message": "dates list successfully", "data": data}, status=200
                    )
                except TaskImage.DoesNotExist:
                    return Response(
                        {"message": "Related dates and images not found"},
                        status=status.HTTP_404_NOT_FOUND,
                    )
        else:
            res = get_last_year_dates()
            formatted_start_date = str(res["end_date"])
            formatted_end_date = str(res["start_date"])
            create_dates(coords_swapped, formatted_start_date, formatted_end_date, task)
            try:
                taskImages = TaskImage.objects.filter(task=task).order_by("-date")
                taskImagesSerializer = TaskImageSerializer(taskImages, many=True)
                first_task_image = taskImages[0]

                # Filter out images with provider "L8"
                filtered_dates = [
                    img for img in taskImagesSerializer.data if img["provider"] not in ["L8", "L9"]
                ]

                data = {
                    "last_date": first_task_image.date.strftime("%Y-%m-%d"),
                    "dates": filtered_dates,
                }
                return Response(
                    {"message": "dates list successfully", "data": data}, status=200
                )
            except TaskImage.DoesNotExist:
                return Response(
                    {"message": "Related dates and images not found"},
                    status=status.HTTP_404_NOT_FOUND,
                )
    except TaskImage.DoesNotExist:
        return Response(
            {"message": "Related dates and images not found"},
            status=status.HTTP_404_NOT_FOUND,
        )
    except Task.DoesNotExist:
        return Response({"message": "Task not found"}, status=status.HTTP_404_NOT_FOUND)
    except Project.DoesNotExist:
        return Response(
            {"message": "Related project not found"}, status=status.HTTP_404_NOT_FOUND
        )


# @api_view(["GET"])
# @permission_classes([AllowAny])
# def Get_dates(request, id):
#     id_task = id
#     try:
#         task = Task.objects.get(id=id_task)
#         # taskSerializer = TaskSerializer(task)
#         project = task.project
#         # projectSerializer = ProjectSerializer(project)
#         # taskImage = TaskImage.objects.filter(task=task).delete()
#         # media_folder_path = os.path.join(settings.MEDIA_ROOT, f"task_images/{task.id}")
#         # # Delete the media folder and its contents recursively
#         # if os.path.exists(media_folder_path):
#         #     shutil.rmtree(media_folder_path)
#         taskImages = TaskImage.objects.filter(task=task).order_by("-date")
#         taskImagesSerializer = TaskImageSerializer(taskImages, many=True)
#         # return Response(serializer.data)
#         first_task_image = taskImages[0]
#         data = {"last_date": first_task_image.date, "dates": taskImagesSerializer.data}
#         # for image in taskImagesSerializer.data:
#         #     print("image", image["image"])

#         return Response(
#             {"message": "dates list successfully", "data": data}, status=200
#         )
#     except TaskImage.DoesNotExist:
#         return Response(
#             {"message": "Related dates and images not found"},
#             status=status.HTTP_404_NOT_FOUND,
#         )
#     except Task.DoesNotExist:radius_around_aoi
#         return Response({"message": "Task not found"}, status=status.HTTP_404_NOT_FOUND)
#     except Project.DoesNotExist:
#         return Response(
#             {"message": "Related project not found"}, status=status.HTTP_404_NOT_FOUND
#         )
#     coordinates = list(task.area_of_interest[0])
#     coordinates = [list(coord) for coord in coordinates[:-1]]
#     coords_swapped = [[coordinate[1], coordinate[0]] for coordinate in coordinates]
#     polygon = ee.Geometry.Polygon(coords_swapped)
#     res = get_last_year_dates()
#     formatted_start_date = str(res["end_date"])
#     formatted_end_date = str(res["start_date"])

#     ee_start_date = ee.Date(formatted_start_date)
#     ee_end_date = ee.Date(formatted_end_date)
#     # Concurrently retrieve dates from different satellites
#     with concurrent.futures.ThreadPoolExecutor() as executor:
#         sentinel_future = executor.submit(
#             get_sentinel2_dates, polygon, ee_start_date, ee_end_date
#         )
#         landsat8_future = executor.submit(
#             get_landsat8_dates, polygon, ee_start_date, ee_end_date
#         )
#         landsat9_future = executor.submit(
#             get_landsat9_dates, polygon, ee_start_date, ee_end_date
#         )

#     # Get results from the futures
#     sentinel_dates = sentinel_future.result()
#     landsat8_dates = landsat8_future.result()
#     landsat9_dates = landsat9_future.result()
#     print("sentinel array", sentinel_dates["dates"])
#     print("--------------------------------------------------------------------------")
#     # print("lansat 8 array", landsat8_dates["dates"])
#     # print("--------------------------------------------------------------------------")
#     # print("lansat 9 array", landsat9_dates["dates"])
#     # print("--------------------------------------------------------------------------")
#     sentinel_dates_array = sentinel_dates["dates"]
#     landsat8_dates_array = landsat8_dates["dates"]
#     landsat9_dates_array = landsat9_dates["dates"]
#     all_dates = list(sentinel_dates["dates"])
#     last_date = sentinel_dates["last_date"]
#     for i in range(len(sentinel_dates_array) - 1):
#         current_date = datetime.datetime.strptime(
#             sentinel_dates_array[i]["date"], "%Y-%m-%d"
#         )
#         next_date = datetime.datetime.strptime(
#             sentinel_dates_array[i + 1]["date"], "%Y-%m-%d"
#         )

#         if (next_date - current_date).days >= 6:
#             print(
#                 f"Dates {sentinel_dates_array[i]['date']} and {sentinel_dates_array[i + 1]['date']} have a difference of 6 days."
#             )
#             gap_start = current_date + datetime.timedelta(days=1)
#             gap_end = next_date - datetime.timedelta(days=1)
#             # Look in landsat8_dates_array
#             filler_dates = [
#                 entry
#                 for entry in landsat8_dates_array
#                 if gap_start
#                 <= datetime.datetime.strptime(entry["date"], "%Y-%m-%d")
#                 <= gap_end
#             ]

#             # If no suitable dates found in landsat8_dates_array, look in third_array
#             if not filler_dates:
#                 filler_dates = [
#                     entry
#                     for entry in landsat9_dates_array
#                     if gap_start
#                     <= datetime.datetime.strptime(entry["date"], "%Y-%m-%d")
#                     <= gap_end
#                 ]
#             all_dates.extend(filler_dates)
#     all_dates = sorted(
#         all_dates, key=lambda x: datetime.datetime.strptime(x["date"], "%Y-%m-%d")
#     )
#     print("all dates", all_dates)

#     # sorted_dates_list = sorted(dates_list, key=lambda date: datetime.datetime.strptime(
#     #     date, '%Y-%m-%d'), reverse=True)

#     MAX_WORKERS = 20
#     with futures.ThreadPoolExecutor(max_workers=MAX_WORKERS) as executor:
#         arguments = [
#             (entry["date"], entry["provider"], entry["cloud_percentage"], polygon, task)
#             for entry in all_dates
#         ]
#         # Submit tasks to the executor and gather the results
#         results = list(executor.map(fetch_image, arguments))

#     # print(dates)
#     for result in results:
#         if isinstance(result, dict):
#             # Handle errors
#             return Response(result, status=status.HTTP_400_BAD_REQUEST)
#         else:
#             # Handle success
#             pass
#     try:
#         taskImages = TaskImage.objects.filter(task=task).order_by("-date")
#         taskImagesSerializer = TaskImageSerializer(taskImages, many=True)
#         # return Response(serializer.data)

#         data = {"last_date": last_date, "dates": taskImagesSerializer.data}
#         # for image in taskImagesSerializer.data:
#         #     print("image", image["image"])

#         return Response(
#             {"message": "dates list successfully", "data": data}, status=200
#         )
#     except TaskImage.DoesNotExist:
#         return Response(
#             {"message": "Related dates and images not found"},
#             status=status.HTTP_404_NOT_FOUND,
#         )

@api_view(["GET"])
@permission_classes([AllowAny])
def List_Project(request, pk):
    data = UserAccount.objects.get(id=pk)
    userSerializer = UserAccountSerializer(data)
    if userSerializer.data["is_staff"]:
        projects = Project.objects.all().order_by("project_name")
    else:
        projects = Project.objects.filter(user=pk).order_by("project_name")
    serializer = ListProjectSerializer(projects, many=True)
    for project_data in serializer.data:
        project_data["tasks"] = sorted(
            project_data["tasks"], key=lambda x: x["task_name"].lower()
        )

    return Response(
        {
            "message": "Project list retrieved successfully",
            "data": serializer.data,
            "user": userSerializer.data,
        },
        status=200,
    )


@api_view(["GET"])
@permission_classes([AllowAny])
def Detail_Project(request, pk):
    projects = Project.objects.get(id=pk)
    serializer = ListProjectSerializer(projects, many=False)
    return Response(serializer.data)


@api_view(["POST"])
@permission_classes([AllowAny])
def Add_Project(request):
    serializer = AddProjectSerializer(data=request.data)
    if serializer.is_valid():
        serializer.save()
    else:
        errors = serializer.errors
        return Response(errors, status=status.HTTP_400_BAD_REQUEST)

    return Response(
        {"message": "Project added successfully", "data": serializer.data}, status=200
    )


@api_view(["GET"])
@permission_classes([AllowAny])
def ListTasks(request, pk):
    projects = Project.objects.filter(user=pk)
    serializer = ListProjectSerializer(projects, many=True)
    return Response(
        {"message": "Project list successfully", "data": serializer.data}, status=200
    )


@api_view(["POST"])
@permission_classes([AllowAny])
def Add_Task(request):
    polys = request.data.get("area_of_interest")
    print("Polys:", polys)  # Debug statement
    coords_swapped = [[poly[1], poly[0]] for poly in polys]
    polys.append(polys[0])
    polygon = Polygon(polys)
    wkt = polygon.wkt
    # Update the request data with the converted area_of_interest

    seeding_density = request.data['seeding_density']
    inter_line = request.data['inter_line']
    intra_line = request.data['intra_line']

    plantation_date_str = f"{request.data['plantation_date']}-01"
    if (request.data['intensification_date'] != None):
        intensification_date_str = f"{request.data['intensification_date']}-01"
        request.data["intensification_date"] = intensification_date_str

    plantation_date = datetime.datetime.strptime(
        plantation_date_str, "%Y-%m-%d")


    today = datetime.datetime.today()
    age_in_years = today.year - plantation_date.year

    culture_id = request.data['culture']
    culture = Culture.objects.get(id=culture_id)

    if (seeding_density != ""):
        try:
            density, created = Density.objects.get_or_create(culture=culture, name_en=f"{seeding_density}kg/ha",
                                                             name_fr=f"{seeding_density}kg/ha",
                                                             name_ar=f"كغ/هكتار {seeding_density}",
                                                             seeding_kg_per_hectare=seeding_density, inter_line=None,
                                                             intra_line=None)
            request.data["density"] = str(density.id)

        except Exception as e:
            print(e)
            return Response(
                {"message": "Could not create task"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
    elif (inter_line != "" and intra_line != ""):
        try:
            density, created = Density.objects.get_or_create(culture=culture, name_en=f"{inter_line}x{intra_line}",
                                                             name_fr=f"{inter_line}x{intra_line}",
                                                             name_ar=f"{inter_line}x{intra_line}",
                                                             seeding_kg_per_hectare=None, inter_line=inter_line,
                                                             intra_line=intra_line)
            request.data["density"] = str(density.id)

        except Exception as e:
            print(e)
            return Response(
                {"message": "Could not create task"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    request.data["area_of_interest"] = wkt
    request.data["plantation_date"] = plantation_date_str
    request.data["age"] = age_in_years

    non_tree_culture_ids = Culture.objects.exclude(categorie_id="3693ad25-cec5-4e66-8906-04568a21ebf8").values_list(
        "id", flat=True)
    plants_ids = list(non_tree_culture_ids)
    if culture_id not in plants_ids and inter_line and intra_line:
        request.data["nbTree"] = math.floor(float(request.data.get("surface")) * 10000 / (float(inter_line) * float(intra_line)))
        request.data["nbTreesPerHectare"] = math.floor(10000 / (float(inter_line) * float(intra_line)))

    serializer = AddTaskSerializer(data=request.data)

    if serializer.is_valid():
        task = serializer.save()
        print("task id ", serializer.data["id"])
        #### generate png image and tif in conccurent #######
        coordinates = list(task.area_of_interest[0])
        coordinates = [list(coord) for coord in coordinates[:-1]]
        coords_swapped = [[coordinate[1], coordinate[0]]
                          for coordinate in coordinates]
        num_points = len(coords_swapped)
        center_x = sum(point[0] for point in coords_swapped) / num_points
        center_y = sum(point[1] for point in coords_swapped) / num_points
        surface = request.data.get("surface")
        if float(surface) < 150.000:
            thread = threading.Thread(
                target=generateTaskImage,
                args=(task,),
            )
            thread.start()
        with ThreadPoolExecutor(max_workers=3) as executor:
            # Run the two functions concurrently
            # future_image = executor.submit(generateTaskImage, task)
            # future_sidebar = executor.submit(generateTaskImageSidebar, task)
            future_region_info = executor.submit(
                get_region_info,
                task,
                center_y,
                center_x,
                "3c5039876d354d40b69d0535d79c89e2",
            )
            # Wait for both functions to complete
            # future_image.result()
            # future_sidebar.result()
            future_region_info.result()
            # index_names = ["ndvi", "ndwi", "ndre", "gci", "psri"]
            # # Create and start threads for each index
            # for index_name in index_names:
            #     thread = threading.Thread(
            #         target=calculateIndexHistory,
            #         args=(task.id, index_name),
            #         daemon=True,  # Set the thread as daemon
            #     )
            #     thread.start()
        # creation de  show task notification lorsque la creationde task
        ShowNotificationsTask.objects.create(
            task=task,
            showForcastNotification=True,
            showPatternNotification=True,
            showAutoPatternNotification=True,
            showSoilHumidityNotification=True,
        )
    else:
        errors = serializer.errors
        return Response(errors, status=status.HTTP_400_BAD_REQUEST)

    try:
        project = Project.objects.get(id=request.data.get("project"))
    except Project.DoesNotExist:
        return Response(
            {"message": "Project not found"}, status=status.HTTP_404_NOT_FOUND
        )

    projectSerializer = UpdateProjectByTaskSerializer(
        project, data=request.data, partial=True, many=False
    )

    if projectSerializer.is_valid():
        projectSerializer.save()
    else:
        errors = serializer.errors
        return Response(errors, status=status.HTTP_400_BAD_REQUEST)
    res = {"task": serializer.data}
    return Response({"message": "Task added successfully", "data": res}, status=200)


@api_view(["POST"])
@permission_classes([AllowAny])
def Edit_Task(request):
    try:
        task_id = request.data.get("id", None)

        task = Task.objects.get(pk=task_id)
        serializer = AddTaskSerializer(task, data=request.data, partial=True)
        if serializer.is_valid():

            plantation_date = serializer.validated_data.get('plantation_date')
            if plantation_date:
                today = timezone.now().date()
                age_years = relativedelta(today, plantation_date).years
                serializer.validated_data['age'] = f"{age_years}"

            serializer.save()
            updateTreeCountAndTreeCountPerHectar(task_id)

            return Response({"status": "success", "data": serializer.data})
        else:
            return Response({"status": "error", "data": serializer.errors})
    except Task.DoesNotExist:
        return Response(
            {"status": "error", "data": "Task not found"},
            status=status.HTTP_404_NOT_FOUND,
        )


@api_view(["GET"])
@permission_classes([AllowAny])
def List_Culture(request):
    lang = request.GET.get('lang', 'en')

    priority_ids = [
        "7bd57d1b-428f-4f09-b7c0-45ef023eb110",
        "0c838d48-b13c-4a8e-be50-ba10d25b595c",
        "1310a36d-fdb9-4136-812e-187b659cccde",
        "044fd8d9-cf55-401c-b725-b9be64315189",
        "11667744-3f77-461c-9491-03b0eafdf1c1",
        "047088cd-3647-4ae5-b37f-19b19af42aaf",
        "e0af04c8-b518-460a-902f-1f42e4b8a449",
        "5e8b58af-d478-46e1-83c6-a6b2407766a0",
    ]
    other_culture_id = "b4a97e64-b78d-45ba-8cc4-a9e1bef219a0"

    if lang == 'fr':
        cultures = Culture.objects.all().annotate(name=F('name_fr'))
    else:
        cultures = Culture.objects.all().annotate(name=F('name_en'))
    culture_list = list(cultures)
    def sort_key(culture):
        if str(culture.id) in priority_ids:
            return (0, priority_ids.index(str(culture.id)))
        if str(culture.id) == other_culture_id:
            return (2, culture.name.lower())
        return (1, culture.name.lower())
    culture_list.sort(key=sort_key)
    serializer = CultureSerializer(culture_list, many=True)
    return Response(
        {"message": "cultures list successfully", "data": serializer.data}, status=200
    )


@api_view(["GET"])
@permission_classes([AllowAny])
def List_Texture(request):
    lang = request.GET.get('lang', 'en')
    if lang == 'fr':
        textures = Texture.objects.all().order_by('name_fr')
    else:
        textures = Texture.objects.all().order_by('name_en')

    serializer = TextureSerializer(textures, many=True)
    return Response(
        {"message": "textures list successfully", "data": serializer.data}, status=200
    )


@api_view(["GET"])
@permission_classes([AllowAny])
def List_Irrigation(request):
    lang = request.GET.get('lang', 'en')
    if lang == 'fr':
        irrigations = Irrigation.objects.all().order_by('name_fr')
    else:
        irrigations = Irrigation.objects.all().order_by('name_en')

    serializer = IrrigationSerializer(irrigations, many=True)
    return Response(
        {"message": "irrigations list successfully", "data": serializer.data},
        status=200,
    )


@api_view(["GET"])
@permission_classes([AllowAny])
def Delete_Task(request, id_task):
    try:
        task = Task.objects.get(id=id_task)
        project = task.project

        # Serialize the project data to be updated
        data = {"surface": task.surface}
        project_serializer = UpdateProjectByDeletedTaskSerializer(
            project, data=data, partial=True, many=False
        )

        # Validate and save the project serializer
        if project_serializer.is_valid():
            project_serializer.save()
        else:
            errors = project_serializer.errors
            return Response(errors, status=status.HTTP_400_BAD_REQUEST)

    except Task.DoesNotExist:
        return Response({"message": "Task not found"}, status=status.HTTP_404_NOT_FOUND)

    # Delete the associated image
    if task.image:
        image_path = os.path.join(settings.MEDIA_ROOT, str(task.image))
        os.remove(image_path)

    # Delete the task
    task.delete()

    return Response({"message": "Task deleted successfully"}, status=status.HTTP_200_OK)


@api_view(["GET"])
@permission_classes([AllowAny])
def Variety_By_Culture(request, pk):
    varietys = Variety.objects.filter(culture=pk).order_by('name_en')
    if not varietys:
        return Response(
            {"message": "No data available for the specified culture ID.", "data": []},
            status=status.HTTP_200_OK,
        )
    else:
        serializer = VarietySerializer(varietys, many=True)
        return Response(
            {"message": "Variety list successfully", "data": serializer.data},
            status=status.HTTP_200_OK,
        )


@api_view(["GET"])
@permission_classes([AllowAny])
def List_Variety(request):
    varietys = Variety.objects.all()
    if not varietys:
        return Response(
            {"message": "No data available !", "data": []}, status=status.HTTP_200_OK
        )
    else:
        serializer = VarietySerializer(varietys, many=True)
        return Response(
            {"message": "Variety list successfully", "data": serializer.data},
            status=status.HTTP_200_OK,
        )


@api_view(["GET"])
@permission_classes([AllowAny])
def Density_By_Culture(request, pk):
    densitys = Density.objects.filter(culture=pk).order_by('name_fr')
    if not densitys:
        return Response(
            {"message": "No data available for the specified culture ID.", "data": []},
            status=status.HTTP_200_OK,
        )
    else:
        serializer = DensitySerializer(densitys, many=True)
        return Response(
            {"message": "Density list successfully", "data": serializer.data},
            status=status.HTTP_200_OK,
        )


@api_view(["GET"])
@permission_classes([AllowAny])
def List_Density(request):
    densitys = Density.objects.all()
    if not densitys:
        return Response(
            {"message": "No data available !", "data": []}, status=status.HTTP_200_OK
        )
    else:
        serializer = DensitySerializer(densitys, many=True)
        return Response(
            {"message": "Density list successfully", "data": serializer.data},
            status=status.HTTP_200_OK,
        )


@api_view(["POST"])
@permission_classes([AllowAny])
def Add_Subscription(request):
    # Adjust this according to your data structure
    task_id = request.data.get("task")
    # Check if there's an existing subscription with the same task_id
    existing_subscription = Subscription.objects.filter(task=task_id).first()
    if existing_subscription:
        listSubscriptionserializer = SubscriptionSerializer(
            existing_subscription)
        print(listSubscriptionserializer.data["subscription"])
        print(request.data.get("subscription"))
        if str(listSubscriptionserializer.data["subscription"]) == str(
                request.data.get("subscription")
        ):
            print("ss")
            return Response({"message": "nothing to change !"}, status=201)
            # Check for HighResolutionRequests with empty "file" field
        high_resolution_requests = (
            existing_subscription.highresolutionrequest_set.filter(file="")
        )

        if high_resolution_requests.exists():
            return Response(
                {
                    "message": "You can't change subscription until all requests are finished !"
                },
                status=203,
            )
        editSubscription = SubscriptionSerializer(
            existing_subscription, data=request.data, partial=True
        )
        if editSubscription.is_valid():
            editSubscription.save()
            return Response(
                {"message": "subscription updated successfuly !"}, status=200
            )

    Subscriptionserializer = SubscriptionSerializer(data=request.data)
    if Subscriptionserializer.is_valid():
        Subscriptionserializer.save()
        print(Subscriptionserializer.data)
        user_demand = UserAccount.objects.get(id=request.data.get("user"))
        userDemandSerializer = UserAccountSerializer(user_demand)
        task = Task.objects.get(id=task_id)
        taskSerializer = TaskSerializer(task)
        context_email = {
            "user": userDemandSerializer.data["firstname"]
                    + " "
                    + userDemandSerializer.data["lastname"],
            "task": taskSerializer.data["task_name"],
        }
        email_array = []
        data = UserAccount.objects.filter(is_staff=True)
        # staff = data.exclude(is_superuser=False)
        userSerializer = UserAccountSerializer(data, many=True)
        serialized_users = userSerializer.data
        for user_data in serialized_users:
            email = user_data.get("email")
            email_array.append(email)
        print(email_array)

        html_message = render_to_string(
            "emails/notifRequest.html", context=context_email
        )
        plain_message = strip_tags(html_message)
        message = EmailMultiAlternatives(
            subject="New subscription for high resolution satellite images",
            body=plain_message,
            from_email=settings.EMAIL_HOST_USER,
            to=email_array,
        )
        message.attach_alternative(html_message, "text/html")
        message.send()

        request_data = {
            "subscription": Subscriptionserializer.data["id"],
            "date_of_request": Subscriptionserializer.data["date_of_request"],
        }
        HighResolutionRequestserializer = HighResolutionRequestSerializer(
            data=request_data
        )
        if HighResolutionRequestserializer.is_valid():
            HighResolutionRequestserializer.save()
        else:
            errors = HighResolutionRequestserializer.errors
            return Response(errors, status=status.HTTP_400_BAD_REQUEST)
        return Response(
            {
                "message": "Request high resolution added successfully",
                "data": Subscriptionserializer.data,
            },
            status=200,
        )
    else:
        errors = Subscriptionserializer.errors
        return Response(errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(["GET"])
@permission_classes([AllowAny])
def check_exist_subscription(request, pk):
    try:
        # Use filter instead of get to handle the case where no subscription exists
        subscription = Subscription.objects.filter(task=pk).first()

        if not subscription:
            return Response({"message": "No request for this task!"}, status=404)

        # Retrieve the related HighResolutionRequests and order them by created_at
        high_resolution_requests = subscription.highresolutionrequest_set.order_by(
            "created"
        )

        listSubscriptionserializer = ListSubscriptionSerializer(subscription)
        # Add the ordered HighResolutionRequests to the serialized data
        serialized_data = listSubscriptionserializer.data
        serialized_data["HighResolutionRequests"] = HighResolutionRequestSerializer(
            high_resolution_requests, many=True
        ).data

        return Response(
            {"message": "List request successfully!", "data": serialized_data},
            status=200,
        )

    except Exception as e:
        # Handle any other exceptions if necessary
        return Response({"message": "An error occurred: " + str(e)}, status=500)


@api_view(["POST"])
@permission_classes([AllowAny])
def add_Request(request):
    serializer = HighResolutionRequestSerializer(data=request.data)
    if serializer.is_valid():
        serializer.save()
    else:
        errors = serializer.errors
        return Response(errors, status=status.HTTP_400_BAD_REQUEST)

    return Response(
        {"message": "Request for Imagery added successfuly", "data": serializer.data},
        status=200,
    )


""""
@api_view(["GET"])
@permission_classes([AllowAny])
def fetchSensorDataForTask(request, task_id):
    print(f"fetching sensor data for {task_id}")

    data = SensorData.objects.filter(task_id=task_id)

    if (task_id == "33b9be83-7a63-4adb-bc89-98ec8196c123"):
        calibration_date = timezone.datetime(2024, 4, 24, tzinfo=timezone.utc)
        data = data.filter(time__gte=calibration_date)

    data.order_by("-time")

    if not data:
        return Response(
            {"message": "No data available !", "data": []},
            status=status.HTTP_404_NOT_FOUND,
        )
    else:
        serializer = SensorDataSerializer(data, many=True)
        return Response(
            {"message": "Sensors Data list successfully", "data": serializer.data},
            status=status.HTTP_200_OK,
        )
"""


@api_view(["GET"])
@permission_classes([AllowAny])
def fetchSensorDataForTask(request, task_id):
    print(f"fetching sensor data for {task_id}")

    data = SensorData.objects.filter(task_id=task_id).order_by('time')

    #if task_id == "33b9be83-7a63-4adb-bc89-98ec8196c123":
    # calibration_date = timezone.datetime(2024, 4, 24, tzinfo=timezone.utc)
    #data = data.filter(time__gte=calibration_date)

    if not data.exists():
        return Response(
            {"message": "No data available !", "data": []},
            status=status.HTTP_404_NOT_FOUND,
        )

    serializer = SensorDataSerializer(data, many=True)
    return Response(
        {"message": "Sensors Data list successfully", "data": serializer.data},
        status=status.HTTP_200_OK,
    )


@api_view(["GET"])
@permission_classes([AllowAny])
def fetchSensorDataById(request, sensor_id):
    data = SensorData.objects.filter(task_id=task_id).order_by("-time")

    if not data:
        return Response(
            {"message": "No data available !", "data": []}, status=status.HTTP_200_OK
        )
    else:
        serializer = SensorDataSerializer(data, many=True)
        return Response(
            {"message": "Sensors Data list successfully", "data": serializer.data},
            status=status.HTTP_200_OK,
        )


@api_view(["GET"])
@permission_classes([AllowAny])
def fetchAllSensorData(request):
    data = SensorData.objects.all()

    if not data:
        return Response(
            {"message": "No data available !", "data": []}, status=status.HTTP_200_OK
        )
    else:
        serializer = SensorDataSerializer(data, many=True)
        return Response(
            {"message": "Sensors Data list successfully", "data": serializer.data},
            status=status.HTTP_200_OK,
        )


@api_view(["POST"])
@permission_classes([AllowAny])
def save_note(request):
    task = request.data.get("task")
    label = request.data.get("label")

    note = Note.objects.filter(task=task, label=label).first()
    if note:
        serializer = NoteSerializer(
            note, data=request.data, partial=True, many=False)
        if serializer.is_valid():
            serializer.save()
            return Response(
                {"message": "Note updated successfully", "data": serializer.data},
                status=200,
            )
        else:
            errors = serializer.errors
            return Response(errors, status=status.HTTP_400_BAD_REQUEST)
    else:
        serializer = NoteSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(
                {"message": "Note saved successfully", "data": serializer.data},
                status=200,
            )
        else:
            errors = serializer.errors
            return Response(errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(["GET"])
@permission_classes([AllowAny])
def get_note(request, pk, label):
    predefined_labels = {
        "Mise en place": [
            [
                "Mois",
                "Janvier",
                "Février",
                "Mars",
                "Avril",
                "Mai",
                "Juin",
                "Juillet",
                "Août",
                "Septembre",
                "Octobre",
                "Novembre",
                "Décembre",
            ],
            ["Plantation", "", "", "", "", "", "", "", "", "", "", "", ""],
            ["Toile hors sol", "", "", "", "", "", "", "", "", "", "", "", ""],
        ],
        "Fertilisation": [
            [
                "Mois",
                "Janvier",
                "Février",
                "Mars",
                "Avril",
                "Mai",
                "Juin",
                "Juillet",
                "Août",
                "Septembre",
                "Octobre",
                "Novembre",
                "Décembre",
            ],
            ["Fumier", "", "", "", "", "", "", "", "", "", "", "", ""],
            ["NPK", "", "", "", "", "", "", "", "", "", "", "", ""],
            ["Microélément", "", "", "", "", "", "", "", "", "", "", "", ""],
            ["Macroéléments", "", "", "", "", "", "", "", "", "", "", "", ""],
            ["Autres", "", "", "", "", "", "", "", "", "", "", "", ""],
        ],
        "Irrigation": [
            [
                "Mois",
                "Janvier",
                "Février",
                "Mars",
                "Avril",
                "Mai",
                "Juin",
                "Juillet",
                "Août",
                "Septembre",
                "Octobre",
                "Novembre",
                "Décembre",
            ],
            ["Dose d'irrigation", "", "", "", "", "", "", "", "", "", "", "", ""],
        ],
        "Interventions phytosanitaires": [
            [
                "Mois",
                "Janvier",
                "Février",
                "Mars",
                "Avril",
                "Mai",
                "Juin",
                "Juillet",
                "Août",
                "Septembre",
                "Octobre",
                "Novembre",
                "Décembre",
            ],
            ["Fongicides", "", "", "", "", "", "", "", "", "", "", "", ""],
            ["Insecticides-Acaricide", "", "", "",
             "", "", "", "", "", "", "", "", ""],
            ["Herbicides", "", "", "", "", "", "", "", "", "", "", "", ""],
            ["Nématicide", "", "", "", "", "", "", "", "", "", "", "", ""],
            ["Lâcher d’auxiliaires", "", "", "",
             "", "", "", "", "", "", "", "", ""],
            ["Piégeage massif", "", "", "", "", "", "", "", "", "", "", "", ""],
            [
                "Traitement des coups de soleil",
                "",
                "",
                "",
                "",
                "",
                "",
                "",
                "",
                "",
                "",
                "",
                "",
            ],
        ],
        "Techniques culturales": [
            [
                "Mois",
                "Janvier",
                "Février",
                "Mars",
                "Avril",
                "Mai",
                "Juin",
                "Juillet",
                "Août",
                "Septembre",
                "Octobre",
                "Novembre",
                "Décembre",
            ],
            ["Taille", "", "", "", "", "", "", "", "", "", "", "", ""],
            ["Éclaircissage fruits", "", "", "",
             "", "", "", "", "", "", "", "", ""],
            ["Labour", "", "", "", "", "", "", "", "", "", "", "", ""],
        ],
        "Récolte": [
            [
                "Mois",
                "Janvier",
                "Février",
                "Mars",
                "Avril",
                "Mai",
                "Juin",
                "Juillet",
                "Août",
                "Septembre",
                "Octobre",
                "Novembre",
                "Décembre",
            ],
            ["Début", "", "", "", "", "", "", "", "", "", "", "", ""],
            ["Fin de récolte", "", "", "", "", "", "", "", "", "", "", "", ""],
        ],
    }

    note = Note.objects.filter(task=pk, label=label).first()

    if note:
        noteserializer = NoteSerializer(note, many=False)
        return Response(
            {"message": "get Note successfully !", "data": noteserializer.data},
            status=200,
        )
    elif not note and label in predefined_labels:
        return Response(
            {
                "message": "get Note successfully !",
                "data": {"label": label, "datasheet": predefined_labels.get(label)},
            },
            status=200,
        )
    else:
        return Response({"message": "not found !"}, status=status.HTTP_404_NOT_FOUND)


@api_view(["GET"])
@permission_classes([AllowAny])
def getSpreadsheetNames(request, pk):
    # Predefined list of note labels
    predefined_labels = [
        "Mise en place",
        "Fertilisation",
        "Irrigation",
        "Interventions phytosanitaires",
        "Techniques culturales",
        "Récolte",
    ]

    # Get all notes for the specified task
    notes = Note.objects.filter(task=pk)

    # Extract note labels from the database
    database_labels = set(note.label for note in notes)

    # Exclude database labels that already exist in predefined_labels
    unique_database_labels = list(database_labels - set(predefined_labels))

    # Combine predefined and unique database labels
    all_labels = predefined_labels + unique_database_labels

    return Response(
        {"message": "Get task notes labels successfully!", "data": all_labels},
        status=200,
    )


@api_view(["GET"])
@permission_classes([AllowAny])
def total_surface(request):
    total_surface_sum = Task.objects.aggregate(
        total_surface_sum=Sum("surface")).get("total_surface_sum")
    if total_surface_sum is None:
        total_surface_sum = 0

    last_month_start = timezone.now() - timezone.timedelta(days=30)
    last_month_surface_sum = Task.objects.filter(
        created__range=(last_month_start, timezone.now())
    ).aggregate(last_month_surface_sum=Sum("surface")).get("last_month_surface_sum")
    if last_month_surface_sum is None:
        last_month_surface_sum = 0

    if total_surface_sum > 0:
        percentage_last_month_surface = (
                                                last_month_surface_sum / total_surface_sum) * 100
    else:
        percentage_last_month_surface = 0

    data = {
        "total_surface": total_surface_sum,
        "last_month_surface": round(percentage_last_month_surface, 3),
    }

    return Response({"message": "success", "data": data}, status=200)


@api_view(["GET"])
@permission_classes([AllowAny])
def total_sensor(request):
    total_sensor_sum = Sensor.objects.count()

    # Calculate the number of sensors created this month
    last_month_start = timezone.now() - timezone.timedelta(days=30)
    last_month_sensor_count = Sensor.objects.filter(
        created__range=(last_month_start, timezone.now())
    ).count()

    # Calculate the percentage
    if total_sensor_sum > 0:
        percentage_last_month_sensor = (
                                               last_month_sensor_count / total_sensor_sum
                                       ) * 100
    else:
        percentage_last_month_sensor = 0

    data = {
        "total_sensor": total_sensor_sum,
        "last_month_sensor": round(percentage_last_month_sensor, 3),
    }

    return Response({"message": "success", "data": data}, status=200)


@api_view(["GET"])
def total_task(request):
    total_task_sum = Task.objects.count()

    # Calculate the number of tasks created last month
    last_month_start = timezone.now() - timezone.timedelta(days=30)
    last_month_task_count = Task.objects.filter(
        created__range=(last_month_start, timezone.now())
    ).count()

    # Calculate the percentage
    if total_task_sum > 0:
        percentage_last_month = (last_month_task_count / total_task_sum) * 100
    else:
        percentage_last_month = 0

    data = {"total_task": total_task_sum,
            "last_month": round(percentage_last_month, 3)}

    return Response({"message": "success", "data": data}, status=200)


@api_view(["GET"])
@permission_classes([AllowAny])
def count_tree(request, task_id):
    count = PlantCount.objects.filter(task_id=task_id).first()
    if count:
        serializer = PlantCountSerializer(count)
        return Response(
            {"message": "count tree data successfully", "data": serializer.data},
            status=status.HTTP_200_OK,
        )
    else:
        return Response(
            {"message": "data does not exist for this task"},
            status=status.HTTP_404_NOT_FOUND,
        )


@api_view(["GET"])
def getSensorList(request):
    sensors = Sensor.objects.all()
    if not sensors:
        return Response(
            {"message": "No data available !", "data": []}, status=status.HTTP_200_OK
        )
    else:
        serializer = SensorSerializer(sensors, many=True)
        return Response(
            {"message": "Sensors list successfully", "data": serializer.data},
            status=status.HTTP_200_OK,
        )


@api_view(["GET"])
@permission_classes([AllowAny])
def getIndexDates(request):
    res = getStartEndDate()
    return Response(
        {"message": "get index date successfully", "data": res},
        status=status.HTTP_200_OK,
    )


@api_view(["POST"])
@permission_classes([AllowAny])
def getIndexMean(request, task_id):
    array = []
    # start_date = request.data.get("start_date")
    start_date = "2017-04-01"
    # end_date = request.data.get("end_date")
    end_date = datetime.today().strftime("%Y-%m-%d")

    index = request.data.get("index")
    # cloud_percent = request.data.get("cloud_percentage")
    print("start_date", start_date)
    print("end_date", end_date)
    try:
        task = Task.objects.get(id=task_id)
    except Task.DoesNotExist:
        return Response({"message": "Task not found"}, status=status.HTTP_404_NOT_FOUND)
    coordinates = list(task.area_of_interest[0])
    coordinates = [list(coord) for coord in coordinates[:-1]]
    coords_swapped = [[coordinate[1], coordinate[0]]
                      for coordinate in coordinates]

    polygon = ee.Geometry.Polygon(coords_swapped)
    collection = (
        ee.ImageCollection("COPERNICUS/S2_SR_HARMONIZED").filterBounds(polygon)
        # .filterMetadata("CLOUD_COVERAGE_ASSESSMENT", "less_than", 100)
        .filterDate(start_date, end_date)
    )
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
        (result[1]
         for result in results if result[1]["cloud_percentage"] <= 40),
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
    print("final_results", final_results)
    print(len(final_results))
    print("------------------------------")
    print("resampled_list", resampled_list)
    print(len(resampled_list))
    graphSerializer = GraphDataSerializer(
        data={
            "task": task_id,  # Replace with the actual Task ID
            "data": final_results,
            "data_smoothed": resampled_list,
            "min": overall_min,
            "max": overall_max,
        }
    )
    if graphSerializer.is_valid():
        graphSerializer.save()

    return JsonResponse(
        {
            "message": "get index mean successfully",
            "data": final_results,
            "data_smooth": resampled_list,
            "min": overall_min,
            "max": overall_max,
        },
        status=status.HTTP_200_OK,
    )


@api_view(["GET"])
@permission_classes([AllowAny])
def generaatepng(request, offset):
    offset = int(offset)
    batch_size = 20
    tasks = Task.objects.all()[offset: offset + batch_size]
    # Use a ThreadPoolExecutor for concurrent processing
    with ThreadPoolExecutor() as executor:
        # Submit tasks to the executor
        futures = {executor.submit(
            generateTaskImage, task): task for task in tasks}

        # Wait for all tasks to complete
        concurrent.futures.wait(futures)

    return JsonResponse({"message": "Image processing completed."})


# Function to process an individual task


@api_view(["GET"])
@permission_classes([AllowAny])
def getPng(request, taskid):
    task = Task.objects.get(pk=taskid)
    # Use a ThreadPoolExecutor for concurrent processing
    generateTaskImage(task)
    return JsonResponse({"message": "Image processing completed."})


# Function to process an individual task


@api_view(["GET"])
@permission_classes([AllowAny])
def getClientStatistics(request):
    if request.user.is_authenticated:
        fields = [f.name for f in Task._meta.fields]
        fields.remove("area_of_interest")

        allTasks = Task.objects.filter(project__user__email=request.user.email)
        allReports = PdfReport.objects.filter(user=request.user)
        serializer = PdfReportSerializer(allReports, many=True)

        # Dictionnaires pour regrouper les variétés et cultures
        varieties_dict = {}
        cultures_dict = {}

        totalSurface = 0

        for task in allTasks:
            totalSurface += task.surface

            # Regroupement des variétés
            variety_id = task.variety.id
            if variety_id not in varieties_dict:
                varieties_dict[variety_id] = {
                    "variety_id": variety_id,
                    "variety_name_en": task.variety.name_en,
                    "variety_name_fr": task.variety.name_fr,
                    "variety_name_ar": task.variety.name_ar,
                    "surface": task.surface
                }
            else:
                varieties_dict[variety_id]["surface"] += task.surface

            # Regroupement des cultures
            culture_id = task.culture.id
            if culture_id not in cultures_dict:
                cultures_dict[culture_id] = {
                    "culture_id": culture_id,
                    "culture_name_en": task.culture.name_en,
                    "culture_name_fr": task.culture.name_fr,
                    "culture_name_ar": task.culture.name_ar,
                    "cultureSurface": task.surface
                }
            else:
                cultures_dict[culture_id]["cultureSurface"] += task.surface

        # Convertir les dictionnaires en listes
        varieties = list(varieties_dict.values())
        cultures = list(cultures_dict.values())

        data = {
            "last_login": request.user.last_login.strftime("%b %d, %Y %H:%M"),
            "full_name": f"{request.user.firstname} {request.user.lastname}",
            "surface": totalSurface,
            "varieties": varieties,
            "cultures": cultures,
            "reports": serializer.data
        }

        return Response(
            {
                "message": "get statistics successfully",
                "data": data,
            },
            status=status.HTTP_200_OK,
        )
    else:
        return Response(
            {
                "message": "you need to login first",
                "data": {},
            },
            status=status.HTTP_401_UNAUTHORIZED,
        )


@api_view(["GET"])
@permission_classes([AllowAny])
def getPngside(request, taskid):
    task = Task.objects.get(pk=taskid)
    generateTaskImageSidebar(task)
    return JsonResponse({"message": "Image processing completed."})


@api_view(["GET"])
@permission_classes([AllowAny])
def getPngsideAll(request, offset):
    offset = int(offset)
    batch_size = 20
    tasks = Task.objects.all()[offset: offset + batch_size]
    with ThreadPoolExecutor() as executor:
        futures = {
            executor.submit(generateTaskImageSidebar, task): task for task in tasks
        }
        concurrent.futures.wait(futures)
    return JsonResponse({"message": "Image processing completed."})


@api_view(["GET"])
@permission_classes([AllowAny])
def getImageSidebar(request, id_task):
    task = Task.objects.get(pk=id_task)
    if task.image_sidebar and os.path.exists(task.image_sidebar.path):
        return JsonResponse(
            {
                "message": "image for task:" + id_task + " is ready !",
                "data": {"url": task.image_sidebar.url},
            },
            status=status.HTTP_200_OK,
        )
    else:
        return JsonResponse(
            {
                "message": "image for task:" + id_task + " is not ready yet !",
            },
            status=status.HTTP_204_NO_CONTENT,
        )


@api_view(["GET"])
@permission_classes([AllowAny])
def Details_Task_Map(request, id_task):
    # id_task = request.data.get("id_task")
    try:
        task = Task.objects.get(id=id_task)
        taskSerializer = TaskSerializer(task)
        coordinates = list(task.area_of_interest[0])
        coordinates = [list(coord) for coord in coordinates[:-1]]
        coords_swapped = [[coordinate[1], coordinate[0]]
                          for coordinate in coordinates]
        num_points = len(coords_swapped)
        center_x = sum(point[0] for point in coords_swapped) / num_points
        center_y = sum(point[1] for point in coords_swapped) / num_points

        return Response(
            {
                "message": "Task details",
                "task": taskSerializer.data,
                "lng": center_x,
                "lat": center_y,
            },
            status=status.HTTP_200_OK,
        )
    except Task.DoesNotExist:
        return Response({"message": "Task not found"}, status=status.HTTP_404_NOT_FOUND)


@api_view(["GET"])
@permission_classes([AllowAny])
def Details_Task_Simple(request, id_task):
    try:
        task = Task.objects.get(id=id_task)
        taskSerializer = TaskSerializer(task)
        return Response(
            {"message": "Task retived successfully", "data": taskSerializer.data},
            status=200,
        )
    except Task.DoesNotExist:
        return Response({"message": "Task not found"}, status=status.HTTP_404_NOT_FOUND)


@api_view(["GET"])
@permission_classes([AllowAny])
def getRelatedEvents(request, id_task):
    events = Event.objects.filter(task=id_task)
    serializer = EventSerializer(events, many=True)

    return Response(
        {
            "message": "get related events succeed !",
            "data": serializer.data,
        },
        status=status.HTTP_200_OK,
    )


@api_view(["GET"])
@permission_classes([AllowAny])
def getUserRelatedEvents(request, id_user):
    try:
        tasks = Task.objects.filter(project__user_id=id_user)
        events = Event.objects.filter(task__in=tasks)
        serializer = EventTaskSerializer(events, many=True)
        return Response(
            {
                "message": "Get related events succeed!",
                "data": serializer.data,
            },
            status=status.HTTP_200_OK,
        )
    except Task.DoesNotExist:
        return Response(
            {"error": "User does not have any related tasks or events"},
            status=status.HTTP_404_NOT_FOUND,
        )


@api_view(["GET"])
@permission_classes([AllowAny])
def getAllProductsTypes(request):
    productstypes = ProductType.objects.all()
    serializer = ProductTypeSerializer(productstypes, many=True)
    return Response(
        {
            "message": "get products types succeed !",
            "data": serializer.data,
        },
        status=status.HTTP_200_OK,
    )


@api_view(["GET"])
@permission_classes([AllowAny])
def getAllFertilisationProducts(request):
    products = FertilisationProduct.objects.all()
    serializer = FertilisationProductSerializer(products, many=True)
    return Response(
        {
            "message": "get fertilisation products succeed !",
            "data": serializer.data,
        },
        status=status.HTTP_200_OK,
    )


@api_view(["GET"])
@permission_classes([AllowAny])
def getAllStadesPhenologique(request):
    stades = StadesPhenologique.objects.all()
    serializer = StadesPhenologiqueSerializer(stades, many=True)
    return Response(
        {
            "message": "get stades phenologiques succeed !",
            "data": serializer.data,
        },
        status=status.HTTP_200_OK,
    )


@api_view(["GET"])
@permission_classes([AllowAny])
def getProductsByType(request, id_type):
    products = Product.objects.filter(productType=id_type)
    serializer = ProductSerializer(products, many=True)
    return Response(
        {
            "message": "get products succeed !",
            "data": serializer.data,
        },
        status=status.HTTP_200_OK,
    )


@api_view(["GET"])
@permission_classes([AllowAny])
def getAllDiseases(request):
    diseases = Disease.objects.all()
    serializer = DiseaseSerializer(diseases, many=True)
    return Response(
        {
            "message": "get disease succeed !",
            "data": serializer.data,
        },
        status=status.HTTP_200_OK,
    )


@api_view(["GET"])
@permission_classes([AllowAny])
def getDiseasesActorById(request, disease_id):
    # diseases = Disease.objects.all()
    # serializer = DiseaseSerializer(diseases, many=True)

    diseaseActors = DiseaseActor.objects.filter(
        disease=disease_id).order_by("-created")
    diseaseActorsSerializer = DiseaseActorSerializer(diseaseActors, many=True)
    return Response(
        {
            "message": "get disease actors succeed !",
            "data": diseaseActorsSerializer.data,
        },
        status=status.HTTP_200_OK,
    )


@api_view(["POST"])
@permission_classes([AllowAny])
def Add_Event(request):
    events_data = request.data
    errors = []
    added_events = []
    allowed_extensions = ['jpg', 'jpeg', 'png', 'gif', 'pdf', 'doc', 'docx', 'txt',
                          'xls', 'xlsx', 'csv', 'ppt', 'pptx', 'zip', 'rar', 'wav']
    max_file_size = 4 * 1024 * 1024

    for event_data in events_data:
        field_visit_data = None
        anomaly_data = None
        if event_data.get('type') == "60":
            data = event_data.copy()
            files_data = event_data.pop('files', [])
            visit_serializer = FieldVisitSerializer(data=data)
            if not visit_serializer.is_valid():
                errors.append({"field_visit_errors": visit_serializer.errors})
                continue
            field_visit = visit_serializer.save()
            event_data['field_visit'] = field_visit.id
            invalid_files = []
            oversized_files = []
            saved_files = []
            for file_data in files_data:
                file_name = file_data.get('name')
                file_content = file_data.get('file')
                file_extension = os.path.splitext(
                    file_name)[1].lstrip('.').lower()
                if file_extension not in allowed_extensions:
                    invalid_files.append(file_name)
                    continue
                try:
                    file_content = base64.b64decode(file_content)
                    if len(file_content) > max_file_size:
                        oversized_files.append(file_name)
                        continue
                    ContentFile(file_content, name=file_name)
                    if file_extension == 'wav':
                        content_type = 'audio/wav'
                    else:
                        content_type = f'application/{file_extension}'

                    file = InMemoryUploadedFile(
                        file=io.BytesIO(file_content),
                        field_name=None,
                        name=file_name,
                        content_type=content_type,
                        size=len(file_content),
                        charset=None
                    )
                    file_serializer = VisitFileSerializer(
                        data={'field_visit': field_visit.id, 'file': file})
                    if file_serializer.is_valid():
                        file_instance = file_serializer.save()
                        saved_files.append({
                            "id": str(file_instance.id),
                            "file": file_instance.file.url
                        })
                    else:
                        errors.append(
                            {"file_serializer_errors": file_serializer.errors})
                except Exception as e:
                    errors.append(
                        {"file_error": f"Error processing file {file_name}: {str(e)}"})
            if invalid_files:
                errors.append(
                    {"invalid_files": f"Files with extensions '{', '.join(invalid_files)}' are not allowed"})
            if oversized_files:
                errors.append(
                    {"oversized_files": f"Files '{', '.join(oversized_files)}' exceed the maximum size of 4MB"})
            field_visit_data = {
                "id": field_visit.id,
                "notes": field_visit.notes,
                "files": saved_files,
            }

        ###########################################
        if event_data.get('type') == "70":
            data = event_data.copy()
            files_data = event_data.pop('files', [])

            # Extract the anomaly_type from the nested object
            anomaly_type_data = event_data.get(
                'anomaly', {}).get('anomaly_type')
            if anomaly_type_data:
                data['anomaly_type'] = anomaly_type_data.get('id')

            anomaly_serializer = AnomalySerializer(data=data)
            if not anomaly_serializer.is_valid():
                errors.append({"anomaly_errors": anomaly_serializer.errors})
                continue
            anomaly = anomaly_serializer.save()
            event_data['anomaly'] = anomaly.id
            invalid_files = []
            oversized_files = []
            saved_files = []
            for file_data in files_data:
                file_name = file_data.get('name')
                file_content = file_data.get('file')
                file_extension = os.path.splitext(
                    file_name)[1].lstrip('.').lower()
                if file_extension not in allowed_extensions:
                    invalid_files.append(file_name)
                    continue
                try:
                    file_content = base64.b64decode(file_content)
                    if len(file_content) > max_file_size:
                        oversized_files.append(file_name)
                        continue
                    ContentFile(file_content, name=file_name)
                    if file_extension == 'wav':
                        content_type = 'audio/wav'
                    else:
                        content_type = f'application/{file_extension}'

                    file = InMemoryUploadedFile(
                        file=io.BytesIO(file_content),
                        field_name=None,
                        name=file_name,
                        content_type=content_type,
                        size=len(file_content),
                        charset=None
                    )
                    file_serializer = AnomalyFileSerializer(
                        data={'anomaly': anomaly.id, 'file': file})
                    if file_serializer.is_valid():
                        file_instance = file_serializer.save()
                        saved_files.append({
                            "id": str(file_instance.id),
                            "file": file_instance.file.url
                        })
                    else:
                        errors.append(
                            {"file_serializer_errors": file_serializer.errors})
                except Exception as e:
                    errors.append(
                        {"file_error": f"Error processing file {file_name}: {str(e)}"})
            if invalid_files:
                errors.append(
                    {"invalid_files": f"Files with extensions '{', '.join(invalid_files)}' are not allowed"})
            if oversized_files:
                errors.append(
                    {"oversized_files": f"Files '{', '.join(oversized_files)}' exceed the maximum size of 4MB"})

            anomaly_type_data = None
            if anomaly.anomaly_type:
                anomaly_type_data = {
                    "id": anomaly.anomaly_type.id,
                    "name": anomaly.anomaly_type.anomaly_type
                }

            anomaly_data = {
                "id": anomaly.id,
                "notes": anomaly.notes,
                "files": saved_files,
                "anomaly_type": anomaly_type_data
            }

        ###########################################

        serializer = AddEventSerializer(data=event_data)
        if serializer.is_valid():
            serializer.save()
            event_data_serialized = serializer.data
            if field_visit_data:
                event_data_serialized['field_visit'] = field_visit_data
            if anomaly_data:
                event_data_serialized['anomaly'] = anomaly_data
            added_events.append(event_data_serialized)
        else:
            errors.append({"event_serializer_errors": serializer.errors})
    if errors:
        return Response({"errors": errors}, status=status.HTTP_400_BAD_REQUEST)

    return Response({
        "data": added_events,
    }, status=status.HTTP_200_OK)


@api_view(["POST"])
@permission_classes([AllowAny])
def Add_Events(request):
    events_data = request.data
    errors = []
    added_events = []
    allowed_extensions = ['jpg', 'jpeg', 'png', 'gif', 'pdf', 'doc', 'docx', 'txt',
                          'xls', 'xlsx', 'csv', 'ppt', 'pptx', 'zip', 'rar', 'wav']
    max_file_size = 4 * 1024 * 1024

    for event_data in events_data:
        task_ids = event_data.get("tasks", [])
        if not task_ids:
            errors.append({"error": "No tasks provided for an event"})
            continue

        for task_id in task_ids:
            current_event_data = event_data.copy()
            current_event_data['task'] = task_id
            field_visit_data = None

            if current_event_data.get('type') == "60":
                data = current_event_data.copy()
                files_data = current_event_data.pop('files', [])
                visit_serializer = FieldVisitSerializer(data=data)
                if not visit_serializer.is_valid():
                    errors.append(
                        {"field_visit_errors": visit_serializer.errors})
                    continue
                field_visit = visit_serializer.save()
                current_event_data['field_visit'] = field_visit.id
                invalid_files = []
                oversized_files = []
                saved_files = []
                for file_data in files_data:
                    file_name = file_data.get('name')
                    file_content = file_data.get('file')
                    file_extension = os.path.splitext(
                        file_name)[1].lstrip('.').lower()
                    if file_extension not in allowed_extensions:
                        invalid_files.append(file_name)
                        continue
                    try:
                        file_content = base64.b64decode(file_content)
                        if len(file_content) > max_file_size:
                            oversized_files.append(file_name)
                            continue
                        django_file = ContentFile(file_content, name=file_name)
                        file = InMemoryUploadedFile(
                            file=io.BytesIO(file_content),
                            field_name=None,
                            name=file_name,
                            content_type=f'application/{file_extension}',
                            size=len(file_content),
                            charset=None
                        )
                        file_serializer = VisitFileSerializer(
                            data={'field_visit': field_visit.id, 'file': file})
                        if file_serializer.is_valid():
                            file_instance = file_serializer.save()
                            saved_files.append({
                                "id": str(file_instance.id),
                                "file": file_instance.file.url
                            })
                        else:
                            errors.append(
                                {"file_serializer_errors": file_serializer.errors})
                    except Exception as e:
                        errors.append(
                            {"file_error": f"Error processing file {file_name}: {str(e)}"})
                if invalid_files:
                    errors.append(
                        {"invalid_files": f"Files with extensions '{', '.join(invalid_files)}' are not allowed"})
                if oversized_files:
                    errors.append(
                        {"oversized_files": f"Files '{', '.join(oversized_files)}' exceed the maximum size of 4MB"})
                field_visit_data = {
                    "id": field_visit.id,
                    "notes": field_visit.notes,
                    "files": saved_files,
                }

            if current_event_data.get('type') == "70":
                data = current_event_data.copy()
                files_data = current_event_data.pop('files', [])

                # Extract the anomaly_type from the nested object
                anomaly_type_data = current_event_data.get(
                    'anomaly', {}).get('anomaly_type')
                if anomaly_type_data:
                    data['anomaly_type'] = anomaly_type_data.get('id')

                # Ensure 'task' is included in the data
                if 'task' not in data:
                    data['task'] = task_id  # Add the 'task' field here

                anomaly_serializer = AnomalySerializer(data=data)
                if not anomaly_serializer.is_valid():
                    errors.append(
                        {"anomaly_errors": anomaly_serializer.errors})
                    continue
                anomaly = anomaly_serializer.save()
                current_event_data['anomaly'] = anomaly.id
                invalid_files = []
                oversized_files = []
                saved_files = []
                for file_data in files_data:
                    file_name = file_data.get('name')
                    file_content = file_data.get('file')
                    file_extension = os.path.splitext(
                        file_name)[1].lstrip('.').lower()
                    if file_extension not in allowed_extensions:
                        invalid_files.append(file_name)
                        continue
                    try:
                        file_content = base64.b64decode(file_content)
                        if len(file_content) > max_file_size:
                            oversized_files.append(file_name)
                            continue
                        ContentFile(file_content, name=file_name)
                        if file_extension == 'wav':
                            content_type = 'audio/wav'
                        else:
                            content_type = f'application/{file_extension}'

                        file = InMemoryUploadedFile(
                            file=io.BytesIO(file_content),
                            field_name=None,
                            name=file_name,
                            content_type=content_type,
                            size=len(file_content),
                            charset=None
                        )
                        file_serializer = AnomalyFileSerializer(
                            data={'anomaly': anomaly.id, 'file': file})
                        if file_serializer.is_valid():
                            file_instance = file_serializer.save()
                            saved_files.append({
                                "id": str(file_instance.id),
                                "file": file_instance.file.url
                            })
                        else:
                            errors.append(
                                {"file_serializer_errors": file_serializer.errors})
                    except Exception as e:
                        errors.append(
                            {"file_error": f"Error processing file {file_name}: {str(e)}"})
                if invalid_files:
                    errors.append(
                        {"invalid_files": f"Files with extensions '{', '.join(invalid_files)}' are not allowed"})
                if oversized_files:
                    errors.append(
                        {"oversized_files": f"Files '{', '.join(oversized_files)}' exceed the maximum size of 4MB"})

                anomaly_type_data = None
                if anomaly.anomaly_type:
                    anomaly_type_data = {
                        "id": anomaly.anomaly_type.id,
                        "name": anomaly.anomaly_type.anomaly_type
                    }

                anomaly_data = {
                    "id": anomaly.id,
                    "notes": anomaly.notes,
                    "files": saved_files,
                    "anomaly_type": anomaly_type_data
                }

            serializer = AddEventSerializer(data=current_event_data)
            if serializer.is_valid():
                serializer.save()
                event_data_serialized = serializer.data
                if field_visit_data:
                    event_data_serialized['field_visit'] = field_visit_data
                if event_data.get('type') == "70":
                    event_data_serialized['anomaly'] = anomaly_data
                added_events.append(event_data_serialized)
            else:
                errors.append({"event_serializer_errors": serializer.errors})

    if errors:
        return Response({"errors": errors}, status=status.HTTP_400_BAD_REQUEST)

    return Response({
        "data": added_events,
    }, status=status.HTTP_200_OK)


@api_view(["POST"])
@permission_classes([AllowAny])
def Edit_Event(request, id_event):
    allowed_extensions = ['jpg', 'jpeg', 'png', 'gif', 'pdf', 'doc', 'docx', 'txt',
                          'xls', 'xlsx', 'csv', 'ppt', 'pptx', 'zip', 'rar', 'wav']
    max_file_size = 4 * 1024 * 1024
    saved_files = []
    try:
        event = Event.objects.get(id=id_event)
    except Event.DoesNotExist:
        return Response({"error": "Event not found"}, status=status.HTTP_404_NOT_FOUND)

    data = UpdateEventSerializer(
        instance=event, data=request.data, partial=True)
    if data.is_valid():
        updated_event = data.save()

        if updated_event.type == '60':
            notes = request.data.get("notes")
            if not updated_event.field_visit:
                field_visit = FieldVisit.objects.create(
                    task=updated_event.task, notes=notes)
                updated_event.field_visit = field_visit
            else:
                updated_event.field_visit.notes = notes
                updated_event.field_visit.save()

            files_data = request.data.get("files")
            if files_data:
                saved_files = handle_files(files_data, VisitFile, 'field_visit', updated_event.field_visit,
                                           allowed_extensions, max_file_size)

        elif updated_event.type == '70':
            anomaly_type_id = request.data['anomaly']['anomaly_type']['id']
            notes = request.data.get("notes")

            if not updated_event.anomaly:
                anomaly_type = AnomalyType.objects.get(id=anomaly_type_id)
                anomaly = Anomaly.objects.create(
                    task=updated_event.task, notes=notes, anomaly_type=anomaly_type)
                updated_event.anomaly = anomaly
            else:
                updated_event.anomaly.notes = notes
                if anomaly_type_id:
                    try:
                        anomaly_type = AnomalyType.objects.get(
                            id=anomaly_type_id)
                        updated_event.anomaly.anomaly_type = anomaly_type
                    except AnomalyType.DoesNotExist:
                        return Response({"error": "Anomaly type not found"}, status=status.HTTP_404_NOT_FOUND)
                updated_event.anomaly.save()

            files_data = request.data.get("files")
            if files_data:
                saved_files = handle_files(files_data, AnomalyFile, 'anomaly', updated_event.anomaly,
                                           allowed_extensions, max_file_size)

        updated_event.save()

        return Response(
            {"message": "Event updated successfully",
             "data": data.data, "saved_files": saved_files},
            status=status.HTTP_200_OK,
        )
    else:
        errors = data.errors
        return Response(errors, status=status.HTTP_400_BAD_REQUEST)


def handle_files(files_data, FileModel, foreign_key_name, foreign_key_object, allowed_extensions, max_file_size):
    saved_files = []
    invalid_files = []
    oversized_files = []
    for file_data in files_data:
        file_id = file_data.get("id")
        file_name = file_data.get("name")
        file_content = file_data.get("file")
        file_extension = os.path.splitext(file_name)[1].lstrip(".").lower()

        if file_extension not in allowed_extensions:
            invalid_files.append(file_name)
            continue

        if file_id:
            existing_file = FileModel.objects.filter(
                id=file_id, **{foreign_key_name: foreign_key_object}).first()
            if existing_file:
                saved_files.append({
                    "id": str(existing_file.id),
                    "file": existing_file.file.url
                })
                continue

        try:
            new_file_content = base64.b64decode(file_content)
        except Exception as e:
            return Response(
                {"error": f"Failed to decode file {file_name}: {str(e)}"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        if len(new_file_content) > max_file_size:
            oversized_files.append(file_name)
            continue

        try:
            django_file = ContentFile(new_file_content, name=file_name)
            file_serializer = FileModel.objects.create(
                **{foreign_key_name: foreign_key_object, "file": django_file})
            saved_files.append({
                "id": str(file_serializer.id),
                "file": file_serializer.file.url
            })
        except Exception as e:
            return Response(
                {"error": f"Failed to process file {file_name}: {str(e)}"},
                status=status.HTTP_400_BAD_REQUEST,
            )

    if invalid_files or oversized_files:
        error_message = ""
        if invalid_files:
            error_message += f"Files with extensions '{', '.join(invalid_files)}' are not allowed. "
        if oversized_files:
            error_message += f"Files '{', '.join(oversized_files)}' exceed the maximum size of 4 MB."
        return Response(
            {"error": error_message.strip()},
            status=status.HTTP_400_BAD_REQUEST,
        )

    return saved_files


@api_view(["GET"])
@permission_classes([AllowAny])
def Delete_Event(request, id_event):
    try:
        event = Event.objects.get(id=id_event)
    except Event.DoesNotExist:
        return Response(
            {"message": "Event not found"}, status=status.HTTP_404_NOT_FOUND
        )

    if event.field_visit:
        try:
            field_visit = FieldVisit.objects.get(id=event.field_visit.id)
        except FieldVisit.DoesNotExist:
            return Response(
                {"message": "Visit not found"}, status=status.HTTP_404_NOT_FOUND
            )

        visit_files = VisitFile.objects.filter(field_visit=field_visit)
        for visit_file in visit_files:
            default_storage.delete(visit_file.file.path)
            visit_file.delete()

        field_visit.delete()
    if event.anomaly:
        try:
            anomaly = Anomaly.objects.get(id=event.anomaly.id)
        except Anomaly.DoesNotExist:
            return Response(
                {"message": "Anomaly not found"}, status=status.HTTP_404_NOT_FOUND
            )

        # Corrected line here
        anomaly_files = AnomalyFile.objects.filter(anomaly=anomaly)

        for anomaly_file in anomaly_files:
            default_storage.delete(anomaly_file.file.path)
            anomaly_file.delete()
        anomaly.delete()

    event.delete()
    return Response(
        {"message": "Event deleted successfully"}, status=status.HTTP_200_OK
    )


@api_view(["POST"])
@permission_classes([AllowAny])
def Destroy_events(request):
    event_ids = request.data.get('event_ids', [])
    if not event_ids:
        return Response(
            {"message": "No event IDs provided"},
            status=status.HTTP_400_BAD_REQUEST
        )
    deleted_count = 0
    errors = []
    for event_id in event_ids:
        try:
            event = Event.objects.get(id=event_id)
            if event.field_visit:
                try:
                    field_visit = FieldVisit.objects.get(
                        id=event.field_visit.id)
                    visit_files = VisitFile.objects.filter(
                        field_visit=field_visit)
                    for visit_file in visit_files:
                        default_storage.delete(visit_file.file.path)
                        visit_file.delete()
                    field_visit.delete()
                except FieldVisit.DoesNotExist:
                    errors.append(f"Visit not found for event {event_id}")

            ##############
            if event.anomaly:
                try:
                    anomaly = Anomaly.objects.get(
                        id=event.anomaly.id)
                    anomaly_files = AnomalyFile.objects.filter(
                        anomaly=anomaly)
                    for anomaly_file in anomaly_files:
                        default_storage.delete(anomaly_file.file.path)
                        anomaly_file.delete()
                    anomaly.delete()
                except Anomaly.DoesNotExist:
                    errors.append(f"anomaly not found for event {event_id}")

            #################
            event.delete()
            deleted_count += 1
        except Event.DoesNotExist:
            errors.append(f"Event not found: {event_id}")
    response_data = {
        "message": f"{deleted_count} event(s) deleted successfully",
        "deleted_count": deleted_count
    }
    if errors:
        response_data["errors"] = errors
    status_code = status.HTTP_200_OK if deleted_count > 0 else status.HTTP_404_NOT_FOUND
    return Response(response_data, status=status_code)


@api_view(["GET"])
@permission_classes([AllowAny])
def getRelatedEventsByType(request, id_task, id_type):
    events = Event.objects.filter(task=id_task, type=id_type)
    serializer = EventSerializer(events, many=True)

    return Response(
        {
            "message": "get related events succeed !",
            "data": serializer.data,
        },
        status=status.HTTP_200_OK,
    )


@api_view(["GET"])
@permission_classes([AllowAny])
def listTaskByUser(request, id_user):
    try:
        user = UserAccount.objects.get(pk=id_user)
    except UserAccount.DoesNotExist:
        return Response({"message": "User not found"}, status=status.HTTP_404_NOT_FOUND)

    projects = Project.objects.filter(user=user)
    serializer = ProjectsEventsSerializer(projects, many=True)
    return Response(
        {
            "message": "Get user tasks succeed!",
            "data": serializer.data,
        },
        status=status.HTTP_200_OK,
    )


@api_view(["POST"])
@permission_classes([AllowAny])
def getFiltredTasks(request):
    # Retrieve parameters from query parameters
    culture = request.data.get("culture", None)
    # print(request.data)
    # Optional parameters
    variety = request.data.get("variety", None)
    density = request.data.get("density", None)
    age = request.data.get("age", None)

    if culture is None:
        return Response({"error": "Culture is required"}, status=400)

    # Retrieve Project based on user_id
    print("variety", variety)
    print("density", density)
    print("age", age)
    # Start building the query
    tasks = Task.objects.filter(culture=culture).order_by('task_name')
    # Add optional filters if provided
    if variety:
        print("in variety")
        tasks = tasks.filter(
            Q(variety=variety, intensification_variety__isnull=True) |
            Q(intensification_variety=variety)
        )
    if density:
        tasks = tasks.filter(
            Q(density=density, intensification_density__isnull=True) |
            Q(intensification_density=density)
        )

        print("in density")
    if age:
        tasks = tasks.filter(age=age)
        print("in age")

    taskSerializer = TaskByProjectEventsSerializer(tasks, many=True)
    return Response(
        {
            "message": "Get filtred tasks succeed!",
            "data": taskSerializer.data,
        },
        status=status.HTTP_200_OK,
    )


@api_view(["GET"])
@permission_classes([AllowAny])
def getTaskGraphData(request, id_task):
    graphdata = GraphData.objects.filter(task=id_task)
    serializer = GraphDataTaskSerializer(graphdata, many=True)
    # check if data exist and all 5 index where calculated

    if graphdata.exists() and graphdata.count() >= 5:

        # Select any record from the queryset
        selected_record = graphdata.get(index="ndvi")
        data = selected_record.data

        print("record type index", selected_record.index)
        last_date = data[-1]["date"]
        print("last_date", last_date)
        # add a day to last date so the last date from database won't be included
        last_date_datetime = datetime.datetime.strptime(last_date, "%Y-%m-%d")
        last_date = (last_date_datetime + datetime.timedelta(days=1)).strftime(
            "%Y-%m-%d"
        )
        # Set end_date to today's date
        end_date = (datetime.datetime.now() + datetime.timedelta(days=1)).strftime(
            "%Y-%m-%d"
        )
        try:
            task = Task.objects.get(id=id_task)
        except Task.DoesNotExist:
            return Response(
                {"message": "Task not found"}, status=status.HTTP_404_NOT_FOUND
            )
        coordinates = list(task.area_of_interest[0])
        coordinates = [list(coord) for coord in coordinates[:-1]]
        coords_swapped = [[coordinate[1], coordinate[0]]
                          for coordinate in coordinates]
        polygon = ee.Geometry.Polygon(coords_swapped)
        collection = (
            ee.ImageCollection("COPERNICUS/S2_SR_HARMONIZED")
            .filterBounds(polygon)
            .filterMetadata("CLOUD_COVERAGE_ASSESSMENT", "less_than", 10)
            .filterDate(last_date, end_date)
        )
        print("lastdate", last_date)
        print("end_date", end_date)
        # Extract dates from the Image Collection
        info = collection.getInfo()
        dates = [
            ee.Date(x["properties"]["system:time_start"]
                    ).format("YYYY-MM-dd").getInfo()
            for x in info["features"]
        ]
        print(dates)
        if not dates:
            # if their is not new dates then our data is updated to available dates
            return Response(
                {
                    "message": f"Get graph data for task: {id_task} succeed!",
                    "data": serializer.data,
                },
                status=status.HTTP_200_OK,
            )
        else:
            return Response(
                {
                    "message": f"Get graph data for task: {id_task} succeed!",
                    "data": serializer.data,
                },
                status=status.HTTP_200_OK,
            )
            # for item in graphdata:
            #     updateIndexHistory(task, collection, last_date,
            #                        end_date, item, polygon)

            # return Response(
            #     {
            #         "message": f"Get graph data for task: {id_task} succeed!",
            #         "data": serializer.data,
            #     },
            #     status=status.HTTP_200_OK,
            # )
    else:
        return Response(
            {
                "message": f"No graph data found for task: {id_task}.",
                "data": None,
            },
            status=status.HTTP_404_NOT_FOUND,
        )


@api_view(["GET"])
@permission_classes([AllowAny])
def runTaskGraphData(request, id_task):
    start_date_graph = "2017-04-01"
    end_date_graph = datetime.datetime.today().strftime("%Y-%m-%d")
    try:
        task = Task.objects.get(id=id_task)
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
        .filterDate(start_date_graph, end_date_graph)
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
    graphdata = GraphData.objects.filter(task=id_task)
    serializer = GraphDataTaskSerializer(graphdata, many=True)
    # check if data exist and all 5 index where calculated
    if graphdata.exists() and graphdata.count() == 5:
        # Select any record from the queryset
        selected_record = graphdata.get(index="ndvi")
        data = selected_record.data

        print("record type index", selected_record.index)
        last_date = data[-1]["date"]
        print("last_date", last_date)
        # add a day to last date so the last date from database won't be included
        last_date_datetime = datetime.datetime.strptime(last_date, "%Y-%m-%d")
        last_date = (last_date_datetime + datetime.timedelta(days=1)).strftime(
            "%Y-%m-%d"
        )
        # Set end_date to today's date
        end_date = (datetime.datetime.now() + datetime.timedelta(days=1)).strftime(
            "%Y-%m-%d"
        )
        try:
            task = Task.objects.get(id=id_task)
        except Task.DoesNotExist:
            return Response(
                {"message": "Task not found"}, status=status.HTTP_404_NOT_FOUND
            )
        coordinates = list(task.area_of_interest[0])
        coordinates = [list(coord) for coord in coordinates[:-1]]
        coords_swapped = [[coordinate[1], coordinate[0]]
                          for coordinate in coordinates]
        polygon = ee.Geometry.Polygon(coords_swapped)
        collection = (
            ee.ImageCollection("COPERNICUS/S2_SR_HARMONIZED")
            .filterBounds(polygon)
            .filterMetadata("CLOUD_COVERAGE_ASSESSMENT", "less_than", 10)
            .filterDate(last_date, end_date)
        )
        print("lastdate", last_date)
        print("end_date", end_date)
        # Extract dates from the Image Collection
        info = collection.getInfo()
        dates = [
            ee.Date(x["properties"]["system:time_start"]
                    ).format("YYYY-MM-dd").getInfo()
            for x in info["features"]
        ]
        print(dates)
        if not dates:
            # if their is not new dates then our data is updated to available dates
            return Response(
                {
                    "message": f"Get graph data for task: {id_task} succeed!",
                    "data": serializer.data,
                },
                status=status.HTTP_200_OK,
            )
        else:

            with_mask = False
            if max_ndvi_value >= 0.6:
                with_mask = True
            for item in graphdata:
                updateIndexHistory(task, collection, last_date,
                                   end_date, item, polygon, with_mask)

            return Response(
                {
                    "message": f"Get graph data for task: {id_task} succeed!",
                    "data": serializer.data,
                },
                status=status.HTTP_200_OK,
            )
    else:
        print("No graph data found for task:", id_task)
        index_names = ["ndvi", "ndwi", "ndre", "gci", "psri"]
        # Create and start threads for each index
        with_mask = False
        if max_ndvi_value >= 0.6:
            with_mask = True
        # Create and start threads for each index
        with ThreadPoolExecutor(max_workers=5) as executor:
            for index_name in index_names:
                thread = threading.Thread(
                    target=calculateIndexHistory,
                    args=(id_task, index_name, with_mask),
                    daemon=True,  # Set the thread as daemon
                )
                thread.start()
        return Response(
            {
                "message": f"Get graph data for task: {id_task} succeed!",
                "data": serializer.data,
            },
            status=status.HTTP_200_OK,
        )


@api_view(["POST"])
@permission_classes([AllowAny])
def getTasksGraphDataCompare(request):
    tasks = request.data.get("tasks", None)
    index = request.data.get("index", None)
    # Ensure tasks and index are provided in the request
    if tasks is None or index is None:
        return Response(
            {
                "message": "Invalid request. Both 'tasks' and 'index' parameters are required.",
                "data": None,
            },
            status=status.HTTP_400_BAD_REQUEST,
        )
    # Convert tasks to a list of UUIDs (assuming GraphData's task ID is a UUID field)
    task_ids = [
        str(task_id) for task_id in tasks if isinstance(task_id, (str, int))
    ]  # Convert to strings
    print("task_ids", task_ids)
    # Query the GraphData model
    graphdata = GraphData.objects.filter(task_id__in=task_ids, index=index)
    serializer = GraphDataTaskSerializer(graphdata, many=True)
    # Extract task IDs from the serialized data
    serialized_task_ids = [str(item["task"]["id"]) for item in serializer.data]
    # Get the task IDs that don't have a corresponding GraphData element
    tasks_without_graph_data = list(set(task_ids) - set(serialized_task_ids))
    print("tasks_without_graph_data", tasks_without_graph_data)
    print("****************************")
    print(serializer.data)
    print("****************************")
    print("tasks", tasks)
    print("****************************")
    print("index", index)
    print("****************************")
    if tasks_without_graph_data:
        return Response(
            {
                "message": f"Some tasks do not have corresponding GraphData elements.",
                "tasks_without_graph_data": tasks_without_graph_data,
            },
            status=status.HTTP_400_BAD_REQUEST,
        )

    return Response(
        {
            "message": f"graph data for tasks sucessfully",
            "data": serializer.data,
        },
        status=status.HTTP_200_OK,
    )


@api_view(["GET"])
@permission_classes([AllowAny])
def checkGraphData(request):
    tasks = Task.objects.all()
    taskserializer = TaskSerializer(tasks, many=True)
    arr = []
    for task in taskserializer.data:
        graphdata = GraphData.objects.filter(task=task["id"])
        if not graphdata or graphdata.count() != 5:
            el = {
                "task_id": task["id"],
                "task_name": task["task_name"],
                "count": graphdata.count(),
            }
            arr.append(el)
    return Response(
        {
            "message": f"graph data check list",
            "data": arr,
        },
        status=status.HTTP_200_OK,
    )


@api_view(["GET"])
@permission_classes([AllowAny])
def Logout(request):
    elements = lastLogin = UserHistory.objects.filter(
        user__email=request.user.email, label="Sign In"
    ).order_by("-id")
    length = len(elements)
    if length > 0:
        lastOne = elements[0]
        lastOne.modified = datetime.datetime.now(timezone.utc)
        tdelta = datetime.datetime.now(timezone.utc) - lastOne.date_of_request
        lastOne.duration = tdelta.seconds
        lastOne.save()
    return Response(
        {"message": "logged out successfully"},
        status=200,
    )


@api_view(["GET"])
@permission_classes([AllowAny])
def GetAllUserHistory(request, id):
    elements = lastLogin = UserHistory.objects.filter(user__id=id).order_by(
        "-date_of_request"
    )
    serializer = UserHistorySerializer(elements, many=True)
    return Response(
        {"message": "success", "data": serializer.data},
        status=200,
    )


@api_view(["GET"])
@permission_classes([AllowAny])
def GetAllUserHistoryStatistics(request, id):
    # get totals actions per label
    elements = (
        UserHistory.objects.values("label", "user_id")
        .filter(user__id=id)
        .order_by("label", "user_id")
        .annotate(sum=Sum("duration"))
    )

    # get actions count per day
    actions = (
        UserHistory.objects.filter(user__id=id)
        .annotate(day=TruncDay("date_of_request"))
        .values("day")
        .annotate(count=Count("id"))
        .values("day", "count")
    )

    # get sessions duration per day
    signIns = (
        UserHistory.objects.filter(user__id=id, label="Sign In")
        .annotate(day=TruncDay("date_of_request"))
        .values("day")
        .annotate(sum=Sum("duration"))
        .values("day", "sum")
    )

    lastLogin = UserHistory.objects.filter(user__id=id, label="Sign In").order_by(
        "-date_of_request"
    )

    if len(lastLogin) > 1:
        lastLogin = lastLogin[1]
    else:
        lastLogin = lastLogin[0]

    lastLoginDate = lastLogin.date_of_request
    lastLoginDuration = lastLogin.duration

    # get duration on each task
    tasks = (
        UserHistory.objects.filter(user__id=id, label="Visualize Task Details")
        .values("request_from")
        .annotate(sum=Sum("duration"))
    )

    ids = [t["request_from"] for t in tasks]

    taskStats = []
    for element in tasks:
        task = Task.objects.get(id=element["request_from"])
        element["name"] = task.task_name
        taskStats.append(element)

    return Response(
        {
            "message": "success",
            "task_stats": taskStats,
            "tasks": tasks,
            "last_login_date": lastLoginDate,
            "last_login_duration": lastLoginDuration,
            "actions_per_day": actions,
            "sign_in_per_day": signIns,
            "data": elements,
        },
        status=200,
    )


@api_view(["GET"])
@permission_classes([AllowAny])
def GetAllUsers(request):
    # Get today's date
    today = timezone.now()
    # Calculate the date one month ago from today
    one_month_ago = today - datetime.timedelta(days=30)
    data = UserAccount.objects.filter(last_login__gte=one_month_ago).values(
        "id", "firstname", "lastname", "email", "last_login", "is_not_demo")
    return Response({"message": "success", "data": data})


@api_view(["GET"])
@permission_classes([AllowAny])
def GetSingleUser(request, id):
    data = UserAccount.objects.get(id=id)

    return Response(
        {
            "message": "success",
            "data": {
                "id": data.id,
                "firstname": data.firstname,
                "lastname": data.lastname,
                "email": data.email,
            },
        }
    )


#### planet ms ####


@api_view(["GET"])
@permission_classes([AllowAny])
def list_planet_orders(request, task_id):
    try:
        task = Task.objects.get(id=task_id)
        taskSerializer = TaskSerializer(task)
        project = task.project
        task_name = task.task_name

    except Task.DoesNotExist:
        return Response({"message": "Task not found"}, status=status.HTTP_404_NOT_FOUND)
    except Project.DoesNotExist:
        return Response(
            {"message": "Related project not found"}, status=status.HTTP_404_NOT_FOUND
        )

    try:
        orders = Histogram.objects.filter(task=task, provider="PlanetScope")
        orders_values = orders.values("date")
        orders_list = [{"acquisition_date" : i['date'], "order_status":"success"} for i in list(orders_values)]
        return JsonResponse(orders_list, safe=False, status=status.HTTP_200_OK)
    except Exception as e:
        return Response(status=status.HTTP_204_NO_CONTENT)


@api_view(["GET"])
@permission_classes([AllowAny])
def list_planet_orders_for_user(request, user_id):
    # user_id = params["task"]

    fields = ['created', 'id', 'time', 'alert_type__name',
              'alert_type__description', 'alert_type__index', 'viewed', 'abs_difference']

    try:
        user = UserAccount.objects.get(id=user_id)
        user_tasks = Task.objects.filter(project__user=user_id)

        # task = Task.objects.get(id=user_id)
        # taskSerializer = TaskSerializer(task)
        # project = task.project
        # task_name = task.task_name

    except Task.DoesNotExist:
        return Response({"message": "Task not found"}, status=status.HTTP_404_NOT_FOUND)
    except UserAccount.DoesNotExist:
        return Response({"message": "User not found."}, status=status.HTTP_404_NOT_FOUND)
    except Project.DoesNotExist:
        return Response(
            {"message": "Related project not found"}, status=status.HTTP_404_NOT_FOUND
        )

    try:
        planet_orders = []

        for task in user_tasks:
            response = requests.get(url=f"{planet_ms_url}/orders/{task.id}")
            dicto = {'task_id': task.id,
                     'task_name': task.task_name,
                     'orders': response.json()}
            planet_orders.append(dicto)

        if response.status_code == 200:
            return JsonResponse(planet_orders, safe=False, status=status.HTTP_200_OK)
        else:
            return Response(status=status.HTTP_204_NO_CONTENT)

    except Exception as e:
        return Response(str(e), status=status.HTTP_204_NO_CONTENT)


@api_view(["POST"])
@permission_classes([AllowAny])
def submit_planet_order(request):
    params = json.loads(request.body)
    task_id = params["task"]
    user_id = params["user"]
    max_cloud = params["max_cloud"]
    date = params["order_date"]
    try:
        task = Task.objects.get(id=task_id)
        taskSerializer = TaskSerializer(task)
        project = task.project
        task_name = task.task_name

    except Task.DoesNotExist:
        return Response({"message": "Task not found"}, status=status.HTTP_404_NOT_FOUND)
    except Project.DoesNotExist:
        return Response(
            {"message": "Related project not found"}, status=status.HTTP_404_NOT_FOUND
        )

    coordinates = list(task.area_of_interest[0])
    coordinates = [list(coord) for coord in coordinates]
    coords_swapped = [[coordinate[1], coordinate[0]]
                      for coordinate in coordinates]
    print("coords_swapped", coords_swapped)
    print("project", task_name)

    response = requests.post(
        url=planet_ms_url,
        json={
            "taskid": task_id,
            "project": task_name,
            "aoi": coords_swapped,
            "date": date,
            "max-cloud-percentage": int(max_cloud),
        },
    )
    print(response)

    if response.status_code == 400:
        return Response(
            {"message": response.json()["detail"]}, status=status.HTTP_204_NO_CONTENT
        )

    time_acquired = response.json()["properties"]["acquired"]

    time_acquired = time_acquired.split(".")[0].split("T")[0]
    cloud_cover = response.json()["properties"]["cloud_cover"]
    print("order date:", time_acquired)
    print("order cloud_cover:", cloud_cover)
    # replace("T", " at ")
    return Response(
        {
            "message": f"Order submitted with date:{time_acquired} and cloud cover: {cloud_cover}%"
        },
        status=status.HTTP_200_OK,
    )


@api_view(["POST"])
@permission_classes([AllowAny])
def retrieve_planet_report(request):
    params = json.loads(request.body)
    order_id = params["order_id"]
    task_id = params["task"]

    # user_id = params["user"]
    # order_date = params["date_of_request"]
    try:
        task = Task.objects.get(id=task_id)
        taskSerializer = TaskSerializer(task)
        project = task.project
        print("task in db", task)

    except Task.DoesNotExist:
        # return Response({"message": "Task not found"}, status=status.HTTP_404_NOT_FOUND)
        pass
    except Project.DoesNotExist:
        # return Response({"message": "Related project not found"}, status=status.HTTP_404_NOT_FOUND)
        pass

    # print("getting order for on", planet_ms_url)

    response = requests.post(
        url=planet_ms_url + "/report_pdf", json={"order_id": order_id}
    )

    if response.status_code == 200:
        pdf_content = response.content

        response_f = HttpResponse(
            pdf_content,
            content_type="application/pdf",
        )

        response_f["Content-Disposition"] = (
            'attachment; filename="file_report_backend.pdf"'
        )

        return response_f

    # try:
    #     task = Task.objects.get(id=id_task)
    #     taskSerializer = TaskSerializer(task)
    #     project = task.project

    # except Task.DoesNotExist:
    #     return Response({"message": "Task not found"}, status=status.HTTP_404_NOT_FOUND)
    # except Project.DoesNotExist:
    #     return Response(
    #         {"message": "Related project not found"}, status=status.HTTP_404_NOT_FOUND
    #     )


@api_view(["POST"])
@permission_classes([AllowAny])
def receive_planet_order_files(request):
    try:
        main_tif_file = request.FILES.getlist('main_tif')[0]
        indices_tifs = request.FILES.getlist('indices_tiffs')
        task_image = request.FILES.getlist('task_image')[0]
        
        task_id = request.data.get("task_id")
        image_acquisition_date = request.data.get("acquisition_date")
        
        cloud_cover = request.data.get("cloud_cover")
        indices_stats = json.loads(request.data.get("indices_stats"))
        order_id = request.data.get("order_id")
        
        image_acquisition_date_obj = datetime.datetime.strptime(image_acquisition_date, "%Y-%m-%d")
        
        try:
            task = Task.objects.get(id=task_id)
            
        except Task.DoesNotExist:
            return Response({"message": "Task not found"}, status=status.HTTP_404_NOT_FOUND)
        except Project.DoesNotExist:
            return Response({"message": "Related project not found"}, status=status.HTTP_404_NOT_FOUND)
        
        if not main_tif_file:
            return Response({"error": "Main tif file not found"}, status=status.HTTP_400_BAD_REQUEST)
        
        
        histogram= None
        
        if("AnalyticMS_SR_8b" in main_tif_file.name):
            serialized_data = {
            "task": task.id,
            "date": image_acquisition_date_obj.date(),
            "tif_file": main_tif_file,
            # "shapefile_file": shapefile_content,
            "provider": "PlanetScope"
            }
            
        # try:
        serializer = HistogramSerializer(data=serialized_data)
    
        if serializer.is_valid():
            histogram = serializer.save()  

        if(len(indices_tifs)<6):
            print(f"Missing indices tiffs for task {task.id} {len(indices_tifs)} file {main_tif_file.name} ")
            return Response({"message": f"Missing indices tiffs for task {task.id} file {main_tif_file.name}"}
                                ,status=status.HTTP_200_OK)
       
        for tif in indices_tifs:
            index_output_dir = os.path.join(settings.MEDIA_ROOT, f"tasks/tiff/{task.id}/{image_acquisition_date}/index/")
            temp_output_path = os.path.join(index_output_dir, f'temp_{tif.name}')
            output_path = os.path.join(index_output_dir, f'resamp_{tif.name}')
            
            if not os.path.exists(index_output_dir):
                os.makedirs(index_output_dir, exist_ok=True)
                
            if("RGB" in tif.name):
                with open(temp_output_path, 'wb') as temp_file:
                    for chunk in tif.chunks():
                        temp_file.write(chunk)
                        
                with open(temp_output_path, 'rb') as f:
                    rgb_instance = HistogramBins.objects.create(
                        histogram=histogram,
                        index="RGB",
                        tif_file=ContentFile(f.read(), name=tif.name),
                    )
                    
            else:        
                with open(temp_output_path, 'wb') as temp_file:
                    for chunk in tif.chunks():
                        temp_file.write(chunk)
                        
                xres = 1
                yres = 1
                gdal.Warp(output_path, temp_output_path, format='GTiff',xRes=xres, yRes=yres, resampleAlg='lanczos', dstNodata=np.nan)
                os.remove(temp_output_path)
                
                index = tif.name.split('.')[0].upper()
                
                with rio.open(output_path, 'r') as f:
                    data = f.read()
                    flat_data = data.flatten()
                    valid_data = flat_data[np.isfinite(flat_data)]
                    print("valid data", valid_data)
                    
                    Q1 = np.percentile(valid_data, 25)
                    Q3 = np.percentile(valid_data, 75)

                    IQR = Q3 - Q1

                    lower_bound = Q1 - 1.5 * IQR
                    upper_bound = Q3 + 1.5 * IQR

                    filtered_data = valid_data[(valid_data >= lower_bound) & (
                            valid_data <= upper_bound)]
                    min_value = np.min(filtered_data)
                    max_value = np.max(filtered_data)
                    hist, bins = np.histogram(filtered_data, bins=256, range=(min_value, max_value))
                    hist_static, bins_static = np.histogram(filtered_data, bins=256, range=(-1, 1))
                    lower_percentile = np.percentile(filtered_data, 0)
                    upper_percentile = np.percentile(filtered_data, 95)
                    
                    
                with open(output_path, 'rb') as f:
                    histogrambins = HistogramBins.objects.create(
                        histogram=histogram,
                        index=index,
                        bins=hist.tolist(),
                        bins_static=hist_static.tolist(),
                        bins_values=bins.tolist(),
                        bins_values_static=bins_static.tolist(),
                        percentile=[lower_percentile, upper_percentile],
                        tif_file=ContentFile(f.read(), name=tif.name),
                        min=Decimal(float(min_value)),
                        max=Decimal(float(max_value))
                        )
                
                os.remove(output_path)
            
        serializer = None      
        serialized_img_data = {
                "image": task_image,
                "date": image_acquisition_date,
                "task": task_id,
                "provider": "PS",
                "cloud_percentage": cloud_cover,
            }
        
        
        img_serializer = AddTaskImageSerializer(data=serialized_img_data)
        if img_serializer.is_valid():
            task_image_instance = img_serializer.save()
        else:
            print('task image not created', serializer)
            
            
        
        #graph data insert
        existing_graph_data = GraphData.objects.filter(task=task_id)
        if existing_graph_data:
            print(existing_graph_data)
        print(indices_stats)
        ndvi_stats = indices_stats["ndvi"]
        ndre_stats = indices_stats["ndre"]
        ndwi_stats = indices_stats["ndwi"]
        psri_stats = indices_stats["psri"]
        gci_stats = indices_stats["gci"]
        
        
        for data_instance in existing_graph_data:
            print("data_instance", data_instance)
            
            index_name = data_instance.index
            if(index_name in indices_stats):
                raw_index_data = data_instance.data
                smoothed_index_data = data_instance.data_smoothed
                index_min = data_instance.min
                index_max = data_instance.max
                
                added_data_pt = {'date': image_acquisition_date, 'value':indices_stats[index_name]['mean'], "cloud_percentage":cloud_cover }
                # raw_index_data.append(added_data_pt)
                
                index_data_df = pd.DataFrame(raw_index_data)
                index_data_df = pd.concat([index_data_df, pd.DataFrame([added_data_pt])], ignore_index=True)
                
                
                index_data_df['date'] = pd.to_datetime(index_data_df['date'])
                index_data_df = index_data_df.sort_values(by='date')
                
                
                
                index_data_df["NDVI_rolling_mean"] = index_data_df["value"].rolling(window=4, center=True).mean()
                index_data_df["NDVI_rolling_mean"].fillna(index_data_df["value"], inplace=True)
                
                index_data_df.reset_index()
                               
                rolling_min = min(index_data_df["NDVI_rolling_mean"])
                rolling_max = max(index_data_df["NDVI_rolling_mean"])
                
                
                index_data_df["date"] = index_data_df["date"].dt.strftime("%Y-%m-%d")
                
                
                data_instance.data = index_data_df[["date", "value", "cloud_percentage"]].to_dict(orient="records")
                
                data_instance.data_smoothed = index_data_df[["date", "NDVI_rolling_mean", "cloud_percentage"]].to_dict(orient="records")
                
                
                # data_instance.data = index_data_df[[['date', 'value']]].to_dict(orient='records')
                
                
                if rolling_min < index_min :
                    data_instance.min = rolling_min 
                if rolling_max > index_max:
                    data_instance.max = rolling_max
                
                data_instance.save()

        return Response({"message": f"Planet successfully registered for task {task.id} at {image_acquisition_date}"}
                        ,status=status.HTTP_200_OK)
    except Exception as e:
        print(f"Error registering planetscope order for task {task_id} file {main_tif_file.name}, {e}")
        return Response({"message": f"Error creating histogram  for task {task_id} file {main_tif_file.name}, {e}"}
                        ,status=status.HTTP_400_BAD_REQUEST)
    

@api_view(["GET"])
@permission_classes([AllowAny])
def TaskdataForecastTrain(request, task_id):
    task = Task.objects.get(pk=task_id)
    # index_names = ["ndvi", "ndwi", "ndre", "gci", "psri"]
    index_names = ["ndvi"]
    graph_data = GraphData.objects.filter(task=task_id)
    print("coun", graph_data.count())
    if not graph_data or graph_data.count() < 1:
        return Response(
            {"message": "task should have all index data to perform the forecasting"},
            status=status.HTTP_404_NOT_FOUND,
        )
    else:
        print('training for task')
        threads = []

        # Create and start threads for each index
        for index_name in index_names:
            thread = threading.Thread(
                target=sarimax_forecast,
                args=(task.id, index_name),
                daemon=True,  # Set the thread as daemon
            )
            threads.append(thread)  # Add the thread to the list
            thread.start()

        # Join the threads to wait for all of them to finish
        for thread in threads:
            thread.join()

        # All threads have finished at this point
        return Response(
            {"message": "forecast processed successfully!"},
            status=status.HTTP_200_OK,
        )


allowed_user_ids = {"1", "242", "96", "95", "139", "154", "233", "278"}


@api_view(["GET"])
@permission_classes([AllowAny])
def UserTaskdataForecastTrain(request, user_id):
    if user_id in allowed_user_ids:
        tasks = Task.objects.filter(project__user__id=user_id)
        for task in tasks:
            task = Task.objects.get(pk=task.id)
            # index_names = ["ndvi", "ndwi", "ndre", "gci", "psri"]
            index_names = ["ndvi"]
            graph_data = GraphData.objects.filter(task=task.id)
            print("coun", graph_data.count())
            if not graph_data or graph_data.count() < 1:
                print(f'graph data not available for task {task.id}')
            else:
                print('training for task')
                threads = []

                # Create and start threads for each index
                for index_name in index_names:
                    thread = threading.Thread(
                        target=sarimax_forecast,
                        args=(task.id, index_name),
                        daemon=True,  # Set the thread as daemon
                    )
                    threads.append(thread)  # Add the thread to the list
                    thread.start()

                # Join the threads to wait for all of them to finish
                for thread in threads:
                    thread.join()
                # All threads have finished at this point
        return Response(
            {"message": "forecast for user tasks processed successfully!"},
            status=status.HTTP_200_OK,
        )
    else:
        return Response(
            {"message": "user not allowed !"},
            status=status.HTTP_200_OK,
        )


@api_view(["GET"])
@permission_classes([AllowAny])
def TaskdataForecastPredict(request, task_id):
    forecast_params = DataForecast.objects.filter(task=task_id)
    # index_names = ["ndvi", "ndwi", "ndre", "gci", "psri"]
    index_names = ["ndvi"]
    # Check if forecast_params exist and if there are exactly 5 records
    if len(forecast_params) > 0:
        # Check if the JsonField fields are not empty
        non_empty_fields = [
            fp for fp in forecast_params if fp.data_predict and fp.data_predict_fortnite
        ]
        print(len(non_empty_fields))
        if len(non_empty_fields) > 0:
            # Your code here
            index_data_array = {}
            for fp in non_empty_fields:
                index_data_array[fp.index] = {
                    "data_predict": fp.data_predict,
                    "data_predict_fortnite": fp.data_predict_fortnite,
                }
            return Response(
                {"message": "Forecasting completed", "results": index_data_array},
                status=status.HTTP_200_OK,
            )

        else:
            num_workers = 5  # Number of parallel workers, one for each index
            executor = ThreadPoolExecutor(max_workers=num_workers)
            futures = []

            # Iterate over each index name and its corresponding parameters
            for index_name in index_names:
                # Get the corresponding params field value
                params = getattr(forecast_params.get(
                    index=index_name), "params", None)
                print("params", params)
                future = executor.submit(
                    sarimax_forecast_predict, task_id, index_name, params
                )
                futures.append(future)

            # Wait for all threads to complete and gather results
            results = {}
            for index_name, future in zip(index_names, futures):
                try:
                    result = future.result()
                    results[index_name] = result
                except Exception as e:
                    results[index_name] = str(e)
            forecast_params = DataForecast.objects.filter(task=task_id)
            index_data_array = {}
            for fp in non_empty_fields:
                index_data_array[fp.index] = {
                    "data_predict": fp.data_predict,
                    "data_predict_fortnite": fp.data_predict_fortnite,
                }
            return Response(
                {"message": "Forecasting completed", "results": index_data_array},
                status=status.HTTP_200_OK,
            )
    else:
        return Response(
            {"message": "task should have all indexs params to predict forecast"},
            status=status.HTTP_404_NOT_FOUND,
        )


@api_view(["GET"])
@permission_classes([AllowAny])
def UserTaskdataForecastPredict(request, user_id):
    if user_id in allowed_user_ids:
        tasks = Task.objects.filter(project__user__id=user_id)
        for task in tasks:
            forecast_params = DataForecast.objects.filter(task=task.id)
            # index_names = ["ndvi", "ndwi", "ndre", "gci", "psri"]
            index_names = ["ndvi"]
            # Check if forecast_params exist and if there are exactly 5 records
            if len(forecast_params) > 0:
                # Check if the JsonField fields are not empty
                non_empty_fields = [
                    fp for fp in forecast_params if fp.data_predict and fp.data_predict_fortnite
                ]
                print(len(non_empty_fields))
                if len(non_empty_fields) > 0:
                    # Your code here
                    index_data_array = {}
                    for fp in non_empty_fields:
                        index_data_array[fp.index] = {
                            "data_predict": fp.data_predict,
                            "data_predict_fortnite": fp.data_predict_fortnite,
                        }
                    print(f"Forecasting completed for task {task.id}")
                else:
                    num_workers = 5  # Number of parallel workers, one for each index
                    executor = ThreadPoolExecutor(max_workers=num_workers)
                    futures = []

                    # Iterate over each index name and its corresponding parameters
                    for index_name in index_names:
                        # Get the corresponding params field value
                        params = getattr(forecast_params.get(
                            index=index_name), "params", None)
                        print("params", params)
                        future = executor.submit(
                            sarimax_forecast_predict, task.id, index_name, params
                        )
                        futures.append(future)

                    # Wait for all threads to complete and gather results
                    results = {}
                    for index_name, future in zip(index_names, futures):
                        try:
                            result = future.result()
                            results[index_name] = result
                        except Exception as e:
                            results[index_name] = str(e)
                    forecast_params = DataForecast.objects.filter(task=task.id)
                    index_data_array = {}
                    for fp in non_empty_fields:
                        index_data_array[fp.index] = {
                            "data_predict": fp.data_predict,
                            "data_predict_fortnite": fp.data_predict_fortnite,
                        }
                    print(f"Forecasting completed for task {task.id}")

            else:
                print(
                    f"task {task.id} should have all indexs params to predict forecast ")
        return Response(
            {"message": f"forecast for user {user_id} tasks processed successfully!"},
            status=status.HTTP_200_OK,
        )
    else:
        return Response(
            {"message": f"user {user_id} is not in the allowed user list ! "},
            status=status.HTTP_200_OK,
        )


@api_view(["GET"])
@permission_classes([AllowAny])
def TaskdataForecastPredictGet(request, task_id):
    forecast_params = DataForecast.objects.filter(task=task_id)
    # index_names = ["ndvi", "ndwi", "ndre", "gci", "psri"]
    index_names = ["ndvi"]
    # Check if forecast_params exist
    if len(forecast_params) > 0:
        # Check if the JsonField fields are not empty
        non_empty_fields = [
            fp for fp in forecast_params if fp.data_predict and fp.data_predict_fortnite
        ]
        print("non_empty_fields", len(non_empty_fields))
        if len(non_empty_fields) > 0:
            # Your code here
            index_data_array = {}
            for fp in non_empty_fields:
                index_data_array[fp.index] = {
                    "data_predict": fp.data_predict,
                    "data_predict_fortnite": fp.data_predict_fortnite,
                }
            return Response(
                {"message": "Forecasting completed", "results": index_data_array},
                status=status.HTTP_200_OK,
            )

        else:
            return Response(
                {"message": "task predict forecast is not calculated"},
                status=status.HTTP_404_NOT_FOUND,
            )
    else:
        return Response(
            {"message": "task should have all indexs params to predict forecast"},
            status=status.HTTP_404_NOT_FOUND,
        )


###### index forecast get ####


@api_view(["GET"])
@permission_classes([AllowAny])
def TaskIndexForecastGet(request, task_id):
    try:
        task_forecast = IndexForecast.objects.get(task=task_id)
        neural_meta_forecast = task_forecast.neural_meta_predict
        return Response(

            {"message": "index forecast retrieved", "results": neural_meta_forecast},

            status=status.HTTP_200_OK,
        )
    except Task.DoesNotExist:
        return Response({"detail": "Task not found."}, status=status.HTTP_404_NOT_FOUND)
    except UserAccount.DoesNotExist:
        return Response({"detail": "User not found."}, status=status.HTTP_404_NOT_FOUND)
    except IndexForecast.DoesNotExist:
        return Response({"detail": "Forecast not found."}, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        print(e)


@api_view(["GET"])
@permission_classes([AllowAny])
def TaskdataForecastAlerts(request, user_id):
    print(type(user_id))
    if user_id in allowed_user_ids:
        tasks = Task.objects.filter(project__user__id=user_id)
        for task in tasks:
            print(f"task {task.id} - {task.task_name}")
            graphdata = GraphData.objects.filter(task=task.id)
            predictdata = DataForecast.objects.filter(
                task=task.id, index="ndvi"
            ).first()
            # serializer = GraphDataTaskSerializer(graphdata, many=True)
            # check if data exist and all 5 index where calculated
            if predictdata:
                if (
                        graphdata.exists()
                        and graphdata.count() == 5
                        and predictdata.data_predict
                        and predictdata.data_predict_fortnite
                ):
                    # Select any record from the queryset
                    selected_record = graphdata.get(index="ndvi")
                    data = selected_record.data
                    # print("record type index", selected_record.index)
                    last_date = data[-1]["date"]
                    print("last_date", last_date)
                    # add a day to last date so the last date from database won't be included
                    last_date_datetime = datetime.datetime.strptime(
                        last_date, "%Y-%m-%d"
                    )
                    last_date = (
                            last_date_datetime + datetime.timedelta(days=1)
                    ).strftime("%Y-%m-%d")
                    # Set end_date to today's date
                    end_date = (
                            datetime.datetime.now() + datetime.timedelta(days=1)
                    ).strftime("%Y-%m-%d")
                    coordinates = list(task.area_of_interest[0])
                    coordinates = [list(coord) for coord in coordinates[:-1]]
                    coords_swapped = [
                        [coordinate[1], coordinate[0]] for coordinate in coordinates
                    ]
                    polygon = ee.Geometry.Polygon(coords_swapped)
                    collection = (
                        ee.ImageCollection("COPERNICUS/S2_SR_HARMONIZED")
                        .filterBounds(polygon)
                        .filterMetadata("CLOUD_COVERAGE_ASSESSMENT", "less_than", 10)
                        .filterDate(last_date, end_date)
                    )
                    # Extract dates from the Image Collection
                    info = collection.getInfo()
                    dates = [
                        ee.Date(x["properties"]["system:time_start"])
                        .format("YYYY-MM-dd")
                        .getInfo()
                        for x in info["features"]
                    ]
                    if not dates:
                        # if their is not new dates then our data is updated to available dates
                        print(f"no new satellite image for the task {task.id}")
                    else:
                        print("dates", dates)
                        for item in graphdata:
                            updateIndexHistory(
                                task, collection, last_date, end_date, item, polygon
                            )
                        ndvi_data = GraphData.objects.filter(
                            task=task.id, index="ndvi"
                        ).first()

                        createAlerts(task, dates, ndvi_data, predictdata)
                else:
                    print(f"task {task.id, task.task_name} has no graphdata")
            else:
                print(f"task {task.id, task.task_name} has no dataforecast")
        return Response(
            {"message": "allowed"},
            status=status.HTTP_200_OK,
        )
    return Response(
        {"message": "not allowed"},
        status=status.HTTP_404_NOT_FOUND,
    )


@api_view(["GET"])
@permission_classes([AllowAny])
def UserNotificationGet(request, user_id):
    if user_id:
        # in allowed_user_ids:
        try:
            # Get the user object based on the provided user_id
            user = UserAccount.objects.get(id=user_id)
        except UserAccount.DoesNotExist:
            return Response({"error": "User not found"}, status=404)

        # print("allowed")
        tasks_with_alerts = (
            Task.objects.filter(project__user=user, alertpredict__isnull=False)
            .distinct()
            .prefetch_related("alertpredict_set")
        )
        # print("tasks_with_alerts", tasks_with_alerts)
        serializer = TaskAlertsSerializer(tasks_with_alerts, many=True)
        print("!!!!!!!!!!!!!!!!!!!!!!!!!!!!!")
        print("!!!!!!!!!!!!!!!!!!!!!!!!!!!!!")
        print(serializer.data)
        return Response(
            {"tasks": serializer.data},
            status=status.HTTP_200_OK,
        )
    else:
        # print("not allowed")
        return Response(
            {"message": "forbidden"},
            status=status.HTTP_403_FORBIDDEN,
        )


@api_view(["GET"])
@permission_classes([AllowAny])
def UserNotificationGetHead(request, user_id):
    if user_id:
        # in allowed_user_ids:
        try:
            # Get the user object based on the provided user_id
            user = UserAccount.objects.get(id=user_id)
        except UserAccount.DoesNotExist:
            return Response({"error": "User not found"}, status=404)
        # print("allowed")
        # Query the top 5 alerts across all tasks, ordered by date
        alert_count = AlertPredict.objects.filter(
            task__project__user=user,  # Filter by user
            state=False,  # Filter alerts where state is false
        ).count()

        mv_alert_count = Alert.objects.filter(
            task__project__user=user,  # Filter by user
            viewed=False,  # Filter alerts where state is false
        ).count()

        # Step 1: Retrieve the top 5 alerts ordered by date for the specified user
        top_5_alerts = AlertPredict.objects.filter(task__project__user=user).order_by(
            "-date"
        )[:5]

        top_5_mv_alerts = Alert.objects.filter(task__project__user=user).order_by(
            "-time"
        )[:5]

        # Step 2: Group the top 5 alerts by task
        grouped_alerts_by_task = {}
        for alert in top_5_alerts:
            task_id = alert.task_id
            if task_id not in grouped_alerts_by_task:
                grouped_alerts_by_task[task_id] = {
                    "task": alert.task, "alerts": []}
            grouped_alerts_by_task[task_id]["alerts"].append(alert)

        grouped_mv_alerts_by_task = {}
        for alert in top_5_mv_alerts:
            task_id = alert.task_id
            if task_id not in grouped_mv_alerts_by_task:
                grouped_mv_alerts_by_task[task_id] = {
                    "task": alert.task, "alerts": []}
            grouped_mv_alerts_by_task[task_id]["alerts"].append(alert)

        # Step 3: Serialize the grouped alerts and prepare the response
        data = []
        for task_id, task_data in grouped_alerts_by_task.items():
            # Optional: You can sort each task's alerts by date in ascending order if needed
            # task_data["alerts"].sort(key=lambda x: x.date)

            # Serialize the task and the associated alerts
            task_data["task"].alerts = task_data["alerts"]
            print("task_data[task].alerts", task_data["task"].alerts)
            serializer = TaskAlertsHeadSerializer(task_data["task"])
            # Inspect the serialized data and compare the alerts count
            serialized_data = serializer.data
            # print("After serialization - Serialized data:", serialized_data)
            data.append(serializer.data)

        for task_id, task_data in grouped_mv_alerts_by_task.items():
            # Optional: You can sort each task's alerts by date in ascending order if needed
            # task_data["alerts"].sort(key=lambda x: x.date)

            # Serialize the task and the associated alerts
            task_data["task"].alerts = task_data["alerts"]
            # print("task_data[task].alerts", task_data["task"].alerts)
            serializer = TaskGenericAlertsHeadSerializer(task_data["task"])
            # Inspect the serialized data and compare the alerts count
            serialized_data = serializer.data
            # print("After serialization - Serialized data:", serialized_data)
            data.append(serializer.data)

        # Step 4: Prepare the response with the data and the count of alerts
        alert_count = top_5_alerts.count()
        return Response(
            {"data": data, "alert_count": mv_alert_count},
            status=status.HTTP_200_OK,
        )
    else:
        # print("not allowed")
        return Response(
            {"message": "forbidden"},
            status=status.HTTP_403_FORBIDDEN,
        )


@api_view(["GET"])
@permission_classes([AllowAny])
def TaskNotificationGet(request, task_id):
    try:
        alerts = AlertPredict.objects.filter(task=task_id).order_by("date")
        if not alerts.exists():
            return Response(
                {"error": "task has no alerts found"}, status=status.HTTP_404_NOT_FOUND
            )
        dataforecast = DataForecast.objects.get(task=task_id, index="ndvi")
    except DataForecast.DoesNotExist:
        return Response(
            {"error": "task has no data forecast not found"},
            status=status.HTTP_404_NOT_FOUND,
        )
    data = dataforecast.data_predict_fortnite
    # Convert data to dictionary for faster lookup
    data_dict = {item["date"]: item["value"] for item in data}
    array = []
    for alert in alerts:
        alert_date = alert.date.strftime("%Y-%m-%d")
        if alert_date in data_dict:
            item = {
                "date": alert.date.strftime("%Y-%m-%d"),
                "value": data_dict[alert_date],
                "abs": alert.abs_difference,
            }
            array.append(item)
    return Response({"data": array}, status=status.HTTP_200_OK)


##### pattern alerts ######
@api_view(["GET"])
@permission_classes([AllowAny])
def getSelfPatternAlertNotificationsByTask(request, user_id, task_id, limit):
    try:
        user = UserAccount.objects.get(id=user_id)
        task = Task.objects.get(id=task_id)
        show_task_notification = ShowNotificationsTask.objects.filter(task_id=task.id).first()
        show_task_notification_serializer = ShowNotificationsTaskSerializer(show_task_notification)


        if not show_task_notification_serializer.data.get('showAutoPatternNotification', False):
            return JsonResponse({"alerts_count": 0, "alerts": []}, safe=False,
                                status=status.HTTP_200_OK)

        if (task.project.user.id != user.id and not user.is_staff):
            return Response({"Not allowed for current user."}, status=status.HTTP_401_UNAUTHORIZED)

        if (limit != 0):

            pattern_alerts = PatternSelfAlert.objects.filter(
                task=task_id,
            ).order_by("-time")[:limit]
        else:
            pattern_alerts = PatternSelfAlert.objects.filter(
                task=task_id,
            ).order_by('-time')

        pattern_alerts_count = pattern_alerts.count()
        fields = ['created', 'id', 'time', 'viewed', 'difference', 'reference_value']
        alerts = list(pattern_alerts.values(*fields))

        return JsonResponse({"alerts_count": pattern_alerts_count, "alerts": alerts}, safe=False,
                            status=status.HTTP_200_OK)

    except Task.DoesNotExist:
        return Response({"detail": "Task not found."}, status=status.HTTP_404_NOT_FOUND)
    except UserAccount.DoesNotExist:
        return Response({"detail": "User not found."}, status=status.HTTP_404_NOT_FOUND)
    except Alert.DoesNotExist:
        return Response({"detail": "Alert not found."}, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        print(e)
        return JsonResponse({"exception": e}, status=status.HTTP_404_NOT_FOUND)


@api_view(["GET"])
@permission_classes([AllowAny])
def getPatternAlertNotificationsByTask(request, user_id, task_id, limit):
    # alert_types = ['ndvi_higher_than_pattern', 'ndvi_lower_than_pattern']
    try:
        user = UserAccount.objects.get(id=user_id)
        task = Task.objects.get(id=task_id)

        show_task_notification = ShowNotificationsTask.objects.filter(task_id=task.id).first()
        show_task_notification_serializer = ShowNotificationsTaskSerializer(show_task_notification)
        if not show_task_notification_serializer.data.get('showPatternNotification', False):
            return JsonResponse({"alerts_count": 0, "alerts": []}, safe=False,
                                status=status.HTTP_200_OK)
        if (task.project.user.id != user.id and not user.is_staff):
            return Response({"Not allowed for current user."}, status=status.HTTP_401_UNAUTHORIZED)

        if (limit != 0):

            pattern_alerts = PatternAlert.objects.filter(
                task=task_id,
            ).order_by("-time")[:limit]
        else:
            pattern_alerts = PatternAlert.objects.filter(
                task=task_id,
            ).order_by('-time')

        pattern_alerts_count = pattern_alerts.count()
        fields = ['created', 'id', 'time', 'viewed', 'difference']
        alerts = list(pattern_alerts.values(*fields))

        return JsonResponse({"alerts_count": pattern_alerts_count, "alerts": alerts}, safe=False,
                            status=status.HTTP_200_OK)

    except Task.DoesNotExist:
        return Response({"detail": "Task not found."}, status=status.HTTP_404_NOT_FOUND)
    except UserAccount.DoesNotExist:
        return Response({"detail": "User not found."}, status=status.HTTP_404_NOT_FOUND)
    except Alert.DoesNotExist:
        return Response({"detail": "Alert not found."}, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        print(e)
        return JsonResponse({"exception": e}, status=status.HTTP_404_NOT_FOUND)


@api_view(["GET"])
@permission_classes([AllowAny])
def getPatternAlertNotificationsByUser(request, user_id, limit):
    fields = ['created', 'id', 'time', 'viewed', 'difference', "description", "measured_value"]

    try:
        user = UserAccount.objects.get(id=user_id)

        if user.is_staff:
            user_tasks = Task.objects.all()
        else:
            user_tasks = Task.objects.filter(project__user=user_id)

        pattern_alerts = []
        pattern_self_alerts = []
        total_count = 0
        non_viewed_count = 0
        non_viewed_self_count = 0

        for task in user_tasks:
            show_task_notification = ShowNotificationsTask.objects.filter(task_id=task.id).first()
            show_task_notification_serializer = ShowNotificationsTaskSerializer(show_task_notification)

            if show_task_notification_serializer.data.get('showPatternNotification', False):
                task_alerts = PatternAlert.objects.filter(task_id=task.id).order_by('-created')
                if task_alerts.count() != 0:
                    dicto = {'task_id': task.id,
                             'task_name': task.task_name,
                             'alerts': list(task_alerts.values(*fields))}
                    if user.id != 154:
                        pattern_alerts.append(dicto)
                        total_count += len(dicto['alerts'])
                        non_viewed_count += len([a for a in dicto['alerts'] if a['viewed'] == False])

        for task in user_tasks:
            show_task_notification = ShowNotificationsTask.objects.filter(task_id=task.id).first()
            show_task_notification_serializer = ShowNotificationsTaskSerializer(show_task_notification)

            if show_task_notification_serializer.data.get('showAutoPatternNotification', False):
                task_alerts = PatternSelfAlert.objects.filter(task_id=task.id).order_by('-created')
                if task_alerts.count() != 0:
                    dicto = {'task_id': task.id,
                             'task_name': task.task_name,
                             'alerts': list(task_alerts.values(*fields))}
                    pattern_self_alerts.append(dicto)
                    total_count += len(dicto['alerts'])
                    non_viewed_self_count += len([a for a in dicto['alerts'] if a['viewed'] == False])

        return JsonResponse(
            {"new_count": non_viewed_count, "new_self_count": non_viewed_self_count, "count": total_count,
             "alerts": pattern_alerts, "pattern_self_alerts": pattern_self_alerts}, safe=False,
            status=status.HTTP_200_OK)

    except Task.DoesNotExist:
        return Response({"detail": "Task not found."}, status=status.HTTP_404_NOT_FOUND)
    except UserAccount.DoesNotExist:
        return Response({"detail": "User not found."}, status=status.HTTP_404_NOT_FOUND)
    except Alert.DoesNotExist:
        return Response({"detail": "Alert not found."}, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        print(e)
        return JsonResponse({"exception": str(e)}, status=status.HTTP_404_NOT_FOUND)


########### index forecast alerts #########


@api_view(["GET"])
@permission_classes([AllowAny])
def getIndexForecastAlertNotificationsByTask(request, user_id, task_id, limit):
    try:
        user = UserAccount.objects.get(id=user_id)
        task = Task.objects.get(id=task_id)
        show_task_notification = ShowNotificationsTask.objects.filter(task_id=task.id).first()
        show_task_notification_serializer = ShowNotificationsTaskSerializer(show_task_notification)


        if not show_task_notification_serializer.data.get('showForcastNotification', False):
            return JsonResponse({"alerts_count": 0, "alerts": []}, safe=False,
                                status=status.HTTP_200_OK)

        if (task.project.user.id != user.id and not user.is_superuser):
            return Response({"Not allowed for current user."}, status=status.HTTP_401_UNAUTHORIZED)

        if (limit != 0):

            forecast_alerts = ForecastAlert.objects.filter(
                task=task_id,
            ).order_by("-time")[:limit]
        else:
            forecast_alerts = ForecastAlert.objects.filter(
                task=task_id,
            ).order_by('-time')

        forecast_alerts_count = forecast_alerts.count()
        fields = ['created', 'id', 'time', 'viewed', 'difference']
        alerts = list(forecast_alerts.values(*fields))

        return JsonResponse({"alerts_count": forecast_alerts_count, "alerts": alerts}, safe=False,
                            status=status.HTTP_200_OK)

    except Task.DoesNotExist:
        return Response({"detail": "Task not found."}, status=status.HTTP_404_NOT_FOUND)
    except UserAccount.DoesNotExist:
        return Response({"detail": "User not found."}, status=status.HTTP_404_NOT_FOUND)
    except Alert.DoesNotExist:
        return Response({"detail": "Alert not found."}, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        print(e)
        return JsonResponse({"exception": e}, status=status.HTTP_404_NOT_FOUND)


@api_view(["GET"])
@permission_classes([AllowAny])
def getIndexForecastAlertNotificationsByUser(request, user_id, limit):
    fields = ["id", "context", "index", "measured_value", "reference_value", "difference", "viewed", "description",
              "time"]

    try:
        user = UserAccount.objects.get(id=user_id)

        if user.is_staff:
            user_tasks = Task.objects.all()
        else:
            user_tasks = Task.objects.filter(project__user=user_id)

        forecast_alerts = []
        total_count = 0
        non_viewed_count = 0

        for task in user_tasks:
            show_task_notification = ShowNotificationsTask.objects.filter(task_id=task.id).first()
            show_task_notification_serializer = ShowNotificationsTaskSerializer(show_task_notification)

            if show_task_notification_serializer.data.get('showForcastNotification', False):
                task_alerts = ForecastAlert.objects.filter(task_id=task.id).order_by('-created')
                if task_alerts.count() != 0:
                    dicto = {'task_id': task.id,
                             'task_name': task.task_name,
                             'alerts': list(task_alerts.values(*fields))}
                    forecast_alerts.append(dicto)
                    total_count += len(dicto['alerts'])
                    non_viewed_count += len([a for a in dicto['alerts'] if a['viewed'] == False])

        return JsonResponse({"new_count": non_viewed_count, "count": total_count, "alerts": forecast_alerts},
                            safe=False, status=status.HTTP_200_OK)

    except Task.DoesNotExist:
        return Response({"detail": "Task not found."}, status=status.HTTP_404_NOT_FOUND)
    except UserAccount.DoesNotExist:
        return Response({"detail": "User not found."}, status=status.HTTP_404_NOT_FOUND)
    except Alert.DoesNotExist:
        return Response({"detail": "Alert not found."}, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        print(e)
        return JsonResponse({"exception": str(e)}, status=status.HTTP_404_NOT_FOUND)


#### Humidity levels notifications #######

@api_view(["GET"])
@permission_classes([AllowAny])
def getHumidityAlertNotificationsByTask(request, user_id, task_id, limit):
    alert_types = ['low_mv3_level', 'low_mv2_level', 'low_mv1_level']
    try:
        user = UserAccount.objects.get(id=user_id)
        task = Task.objects.get(id=task_id)

        if task.project.user.id != user.id:
            return Response({"Not allowed for current user."}, status=status.HTTP_401_UNAUTHORIZED)

        if (limit != 0):

            mv_alerts = Alert.objects.filter(
                # task__project__user=user
                task=task_id,
                alert_type__name__in=alert_types,
            ).order_by("-time")[:limit]
        else:
            mv_alerts = Alert.objects.filter(
                # task__project__user=user
                task=task_id,
                alert_type__name__in=alert_types,
            ).order_by('-time')

        mv_alerts_count = mv_alerts.count()
        fields = ['created', 'id', 'time', 'alert_type__name', 'viewed', 'abs_difference']
        alerts = list(mv_alerts.values(*fields))
        for alert in alerts:
            alert['type'] = alert.pop('alert_type__name')

        return JsonResponse({"alerts_count": mv_alerts_count, "alerts": alerts}, safe=False, status=status.HTTP_200_OK)

    except Task.DoesNotExist:
        return Response({"detail": "Task not found."}, status=status.HTTP_404_NOT_FOUND)
    except UserAccount.DoesNotExist:
        return Response({"detail": "User not found."}, status=status.HTTP_404_NOT_FOUND)
    except Alert.DoesNotExist:
        return Response({"detail": "Alert not found."}, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        print(e)
        return JsonResponse({"exception": e}, status=status.HTTP_404_NOT_FOUND)


@api_view(["GET"])
@permission_classes([AllowAny])
def getSensorHumidityNotificationsByUser(request, user_id, limit):
    fields = ['created', 'id', 'time', 'description', 'index', 'viewed', 'measured_value', 'difference']

    try:
        user = UserAccount.objects.get(id=user_id)
        if user.is_staff:
            user_tasks = Task.objects.all()
        else:
            user_tasks = Task.objects.filter(project__user=user_id)

        mv_levels_alerts = []
        total_count = 0
        non_viewed_count = 0
        for task in user_tasks:
            show_task_notification = ShowNotificationsTask.objects.filter(task_id=task.id).first()
            show_task_notification_serializer = ShowNotificationsTaskSerializer(show_task_notification)

            if show_task_notification_serializer.data.get('showSoilHumidityNotification', False):
                task_alerts = SensorHumidityAlert.objects.filter(task_id=task.id).order_by('-created')
                if task_alerts.count() != 0:
                    dicto = {'task_id': task.id,
                             'task_name': task.task_name,
                             'alerts': list(task_alerts.values(*fields))}
                    mv_levels_alerts.append(dicto)
                    total_count += len(dicto['alerts'])
                    non_viewed_count += len([a for a in dicto['alerts'] if a['viewed'] == False])

        return JsonResponse({"new_count": non_viewed_count, "count": total_count, "alerts": mv_levels_alerts},
                            safe=False, status=status.HTTP_200_OK)

    except Task.DoesNotExist:
        return Response({"detail": "Task not found."}, status=status.HTTP_404_NOT_FOUND)
    except UserAccount.DoesNotExist:
        return Response({"detail": "User not found."}, status=status.HTTP_404_NOT_FOUND)
    except Alert.DoesNotExist:
        return Response({"detail": "Alert not found."}, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        print(e)
        return JsonResponse({"exception": str(e)}, status=status.HTTP_404_NOT_FOUND)


@api_view(["GET"])
@permission_classes([AllowAny])
def getSensorBatteryNotificationsByUser(request, user_id, limit):
    fields = ['id', 'time', 'description', 'index', 'viewed', 'level', 'is_critical']
    try:

        user = UserAccount.objects.get(id=user_id)

        print("staff", user.is_staff)
        if (user.is_staff):
            user_tasks = Task.objects.all()
        else:
            user_tasks = Task.objects.filter(project__user=user_id)

        print("user_tasks", user_tasks)

        latest_alert = None

        for task in user_tasks:
            sensors = Sensor.objects.filter(task=task)
            if (sensors):
                for sensor in sensors:
                    alert = SensorBatteryLevelAlert.objects.filter(sensor__task=sensor.task).first()
                    if (alert):
                        dicto = {'task_id': task.id,
                                 'task_name': task.task_name,
                                 'sensor_name': sensor.sensor_name,
                                 'details': model_to_dict(alert, fields)}
                        latest_alert = dicto

        return JsonResponse({"alert": latest_alert}, safe=False, status=status.HTTP_200_OK)
        # {'created':"abc",'id':"123",'time':"2020", 'description': "dzcritption", 'index':"level",'viewed':False,"sensor__sensore_name":"ground", 'level':30, 'is_critical':True, 'last_updated':"2020"}

    except Task.DoesNotExist:
        return Response({"detail": "Task not found."}, status=status.HTTP_404_NOT_FOUND)
    except UserAccount.DoesNotExist:
        return Response({"detail": "User not found."}, status=status.HTTP_404_NOT_FOUND)
    except Alert.DoesNotExist:
        return Response({"detail": "Alert not found."}, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        print(e)
        return JsonResponse({"exception": e}, status=status.HTTP_404_NOT_FOUND)


@api_view(["PATCH"])
@permission_classes([AllowAny])
def alterNotificationState(request):
    ## !!!!!!!! Currentluy used for only setting viewed field to True not to alter it
    # user_id = json.loads(request.body).get("user_id")
    notifications_ids = json.loads(request.body)["notifications_ids"]
    for id in notifications_ids:
        alert = Alert.objects.filter(id=id).first()
        user_id = alert.task.project.user.id
        if user_id == json.loads(request.body).get("user_id"):
            alert.viewed = True
            alert.save()
        else:
            return Response({"detail": "You are not authorized to update the notification state"},
                            status=status.HTTP_403_FORBIDDEN)
    return JsonResponse({"success": "True", "updated_notification": alert.id}, status=status.HTTP_200_OK)


@api_view(["GET"])
@permission_classes([AllowAny])
def deletePredict(request):
    for user_id in allowed_user_ids:
        tasks = Task.objects.filter(project__user__id=user_id)
        for task in tasks:
            print(f"task {task.id} - {task.task_name}")
            predictdata = DataForecast.objects.filter(task=task.id)
            # Delete the filtered records
            deleted_count, _ = predictdata.delete()

            # You can print the number of records deleted for each task if you want
            print(f"Deleted {deleted_count} records for task {task.id}")

    # Return a response indicating success
    return Response({"message": "Predict data records deleted successfully."})


@api_view(["POST"])
@permission_classes([AllowAny])
def forecastParamsAdd(request):
    try:
        task = request.data.get("task")
        params = ForecastYearsParams.objects.filter(task=task).first()
        if params:
            serializer = ForecastYearsParamsSerializer(
                params, data=request.data)
        else:
            serializer = ForecastYearsParamsSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            forecast = DataForecast.objects.filter(task=task).delete()
            alerts = AlertPredict.objects.filter(task=task).delete()
            return Response(
                {
                    "message": "Forecast parameters have been successfully added or updated. Your new forecast will be available within 24 hours",
                    "data": serializer.data,
                },
                status=status.HTTP_200_OK,
            )
        else:
            errors = serializer.errors
            return Response(errors, status=status.HTTP_400_BAD_REQUEST)
    except Exception as e:
        return Response(
            {
                "message": "An error occurred while processing the request",
                "error": str(e),
            },
            status=status.HTTP_500_INTERNAL_SERVER_ERROR,
        )


@api_view(["GET"])
@permission_classes([AllowAny])
def forecastParamsGet(request, task_id):
    params = ForecastYearsParams.objects.filter(task=task_id).first()
    serializer = ForecastYearsParamsSerializer(params)
    if params:
        return Response(
            {"message": "get Forecast params successfuly", "data": serializer.data},
            status=200,
        )
    return Response(
        {"message": "no forecast params for this task"},
        status=status.HTTP_404_NOT_FOUND,
    )


@api_view(["GET"])
@permission_classes([AllowAny])
def filterTasksByCulture(request, culture_id):
    print(f"fetching sensor data for {culture_id}")
    task_list = Task.objects.filter(culture=culture_id)
    if not task_list:
        return Response(
            {"message": "No data available !", "data": []}, status=status.HTTP_200_OK
        )
    else:
        for task in task_list:
            deleted_data = GraphData.objects.filter(task=task.id).delete()
            print(deleted_data)

        return Response(
            {},
            # {"message": "Sensors Data list successfully", "data": serializer.data},
            status=status.HTTP_200_OK,
        )


@api_view(["GET"])
@permission_classes([AllowAny])
def deleteForecastByUser(request, user_id):
    tasks = Task.objects.filter(project__user__id=user_id)
    if not tasks:
        return Response(
            {"message": "No data available !", "data": []}, status=status.HTTP_200_OK
        )
    else:
        for task in tasks:
            deleted_data = DataForecast.objects.filter(task=task.id).delete()
            deleted_alert = AlertPredict.objects.filter(task=task.id).delete()
            print(deleted_data)
            print(deleted_alert)

        return Response(
            {},
            # {"message": "Sensors Data list successfully", "data": serializer.data},
            status=status.HTTP_200_OK,
        )


@api_view(["POST"])
@permission_classes([AllowAny])
def addDataPattern(request):
    data = request.data.get("formData")
    task = data["task"]
    densitys = data["densitys"]
    varietys = data["varietys"]
    startDate = data["StartDateP"]
    endDate = data["EndDateP"]

    # Iterate over all combinations of density and variety
    for density in densitys:
        for variety in varietys:
            # Check if the combination already exists
            existing_pattern = Pattern.objects.filter(
                density=density, variety=variety)
            if existing_pattern.exists():
                existing_pattern.delete()

            # Insert the new combination
            insert_data = {
                "task": task,
                "density": density,
                "variety": variety,
                "startdate": startDate,
                "enddate": endDate,
            }
            serializer = PatternSerializer(data=insert_data)
            if serializer.is_valid():
                serializer.save()
            else:
                errors = serializer.errors
                return Response(errors, status=status.HTTP_400_BAD_REQUEST)

    return Response(
        {"message": "Pattern saved successfully"},
        status=status.HTTP_200_OK,
    )


def retrieve_pattern_data(task_id, pattern_type):
    try:

        task = Task.objects.get(pk=task_id)
        if not task:
            return Response({"detail": "Task is empty."}, status=status.HTTP_404_NOT_FOUND)

        if (pattern_type == "auto_pattern"):
            pattern = PatternSelf.objects.get(task=task)
        else:
            task_density = task.intensification_density if task.intensification_density is not None else task.density
            task_variety = task.intensification_variety if task.intensification_variety is not None else task.variety

            pattern = Pattern.objects.get(density=task_density, variety=task_variety)

        if not pattern:
            return Response({"pattern does not exist for this task density"}, status=status.HTTP_404_NOT_FOUND)
        task_pattern = GraphData.objects.get(task=pattern.task, index="ndvi")
        if not task_pattern:
            return Response({"graph data does not exist for this pattern."}, status=status.HTTP_404_NOT_FOUND)
        data = task_pattern.data
        smoothed_data = task_pattern.data_smoothed
        start_date = pattern.startdate.strftime('%Y-%m-%d')
        end_date = pattern.enddate.strftime('%Y-%m-%d')
        print("startdate", start_date)
        print("enddate", end_date)
        df = pd.DataFrame(data)
        smoothed_df = pd.DataFrame(smoothed_data)
        df["date"] = pd.to_datetime(df["date"])
        smoothed_df["date"] = pd.to_datetime(smoothed_df["date"])
        # Convert 'date' column to datetime
        df = df[(df['date'] >= start_date) & (df['date'] <= end_date)]
        smoothed_df = smoothed_df[(smoothed_df['date'] >= start_date) & (smoothed_df['date'] <= end_date)]

        df.set_index("date", inplace=True)
        smoothed_df.set_index("date", inplace=True)

        return df, pattern, smoothed_df
    except Exception as e:
        print(e)


@api_view(["GET"])
@permission_classes([AllowAny])
def getDataPattern(request, task_id):
    try:
        df, pattern_instance, smoothed_df = retrieve_pattern_data(task_id, "default_pattern")
        dataf = smoothed_df.reset_index()

        dataf['value'] = dataf['NDVI_rolling_mean'].round(4)
        dataf['date'] = dataf['date'].dt.strftime('%Y-%m-%d')
        dataf = dataf.to_dict(orient="records")

    except Task.DoesNotExist:
        return Response({"detail": "Task not found."}, status=status.HTTP_404_NOT_FOUND)
    except Pattern.DoesNotExist:
        return Response({"detail": "Pattern not found."}, status=status.HTTP_404_NOT_FOUND)
    except GraphData.DoesNotExist:
        return Response({"detail": "Graph data not found."}, status=status.HTTP_404_NOT_FOUND)
    return Response(
        {"message": "pattern retrieved successfuly", "data": dataf},
        status=status.HTTP_200_OK,
    )


@api_view(["POST"])
@permission_classes([AllowAny])
def insertStaticForecastData(request):
    try:
        static_data = request.data.get("forecastData")
        for obj in static_data:
            df = pd.DataFrame(obj['n_meta_preds'])

            df["date"] = pd.to_datetime(df["date"])
            df = df.set_index("date").resample('D').interpolate('linear')
            df.reset_index(inplace=True)
            df['date'] = df['date'].dt.strftime('%Y-%m-%d')
            preds = df.to_dict(orient="records")

            task = Task.objects.get(id=obj['task_id'])

            task_ndvi_forecast, created = IndexForecast.objects.get_or_create(task=obj['task_id'], index='ndvi',
                                                                              defaults={'task': task, 'index': 'ndvi'})

            # if not created:
            #     ForecastAlert.objects.filter(
            #         context=task_ndvi_forecast).delete()
            task_ndvi_forecast.neural_meta_predict = preds
            task_ndvi_forecast.save()

    except Exception as e:
        print(e)
        return Response(
            {"message": "error inserting forecast", "error": str(e)},
            status=status.HTTP_501_NOT_IMPLEMENTED,
        )

    return Response(
        {"message": "forecast data saved successfuly", "data": static_data},
        status=status.HTTP_200_OK,
    )


@api_view(["POST"])
@permission_classes([AllowAny])
def createMainTif(request):
    task_id = request.data.get("id")
    provider = request.data.get("provider", "S2")
    date = request.data.get("date")

    if not date:
        date = get_task_dates(task_id)

    try:
        task = Task.objects.get(id=task_id)
        taskSerializer = TaskSerializer(task)
        project = task.project
        projectSerializer = ProjectSerializer(project)
    except Task.DoesNotExist:
        return Response({"message": "Task not found"}, status=status.HTTP_404_NOT_FOUND)
    except Project.DoesNotExist:
        return Response(
            {"message": "Related project not found"}, status=status.HTTP_404_NOT_FOUND
        )
    if not date:
        polygon = cordinates_to_polygon(task.area_of_interest[0])
        list_date = get_available_dates(polygon)
        date = list_date["last_date"]

    index = create_main_tif(task, date, provider) 
    terrain_model = create_terrain_model_tif(task)

    coords_swapped = cordinates_swapped(task.area_of_interest[0])

    if float(task.surface) < 150.000:

        if not bool(task.image_sidebar):
            print("inside if image sidebar")
            # Make an asynchronous call to the second API using a separate thread
            thread = threading.Thread(
                target=generateTaskImageSidebar,
                args=(task,),
            )
            thread.start()

    num_points = len(coords_swapped)
    center_x = sum(point[0] for point in coords_swapped) / num_points
    center_y = sum(point[1] for point in coords_swapped) / num_points

    if task.country_fr is None or task.country_fr == "":
        get_region_info(task, center_y, center_x,
                        "3c5039876d354d40b69d0535d79c89e2")

    zoomLevel = zoomBySurface(taskSerializer.data["surface"])
    center = [center_x, center_y]
    print("index", index)
    if "error" in index:
        return Response({"error": index["error"], "details": index.get("details", "")}, status=400)

    res = {
        "task": taskSerializer.data,
        "project": projectSerializer.data,
        "center": center,
        "zoom": zoomLevel,
        "histogram": index["histogram"],
        "index": index["index_ndvi"],
        "colormap": index["colormap"],
        "date": {
            "date": date,
            "provider": provider
        },
        "terrain_model": terrain_model
    }
    return Response(
        {"message": "Task initial detail successfuly", "data": res}, status=200
    )
    # return Response({"message": index.data}, status=status.HTTP_200_OK)


@api_view(["POST"])
@permission_classes([AllowAny])
def createIndexTif(request):
    task_id = request.data.get("id")
    provider = request.data.get("provider", "S2")
    index = request.data.get("index", "NDVI")
    date = request.data.get("date")
    try:
        task = Task.objects.get(id=task_id)
    except Task.DoesNotExist:
        return Response({"message": "Task not found"}, status=status.HTTP_404_NOT_FOUND)
    # if(index == "RGB"):
        
    index = create_index_tif(task, date, False, index, provider)
    return Response({"message": "Histogram created successfully", "data": index}, status=status.HTTP_200_OK)


from math import radians, sin, cos, sqrt, atan2


# def calculate_distance(point1, point2):
#     return sqrt((point2[0] - point1[0])**2 + (point2[1] - point1[1])**2)

def haversine_distance(point1, point2):
    lat1, lon1 = radians(point1[0]), radians(point1[1])
    lat2, lon2 = radians(point2[0]), radians(point2[1])
    dlat = lat2 - lat1
    dlon = lon2 - lon1
    a = sin(dlat / 2) ** 2 + cos(lat1) * cos(lat2) * sin(dlon / 2) ** 2
    c = 2 * atan2(sqrt(a), sqrt(1 - a))
    radius = 6371  # Radius of the Earth in kilometers
    distance = radius * c

    return distance


@api_view(["GET"])
@permission_classes([AllowAny])
def getTaskCenter(request, task_id, user_id):
    try:
        user = UserAccount.objects.get(id=user_id)
        task = Task.objects.get(id=task_id)
        taskSerializer = TaskSerializer(task)
        coords_swapped = cordinates_swapped(task.area_of_interest[0])
        num_points = len(coords_swapped)
        center_x = sum(point[0] for point in coords_swapped) / num_points
        center_y = sum(point[1] for point in coords_swapped) / num_points

        if task.country_fr is None or task.country_fr == "":
            get_region_info(task, center_y, center_x,
                            "3c5039876d354d40b69d0535d79c89e2")

        zoomLevel = zoomBySurface(taskSerializer.data["surface"])
        center = [center_x, center_y]

        radius_around_aoi = 0
        for vert in coords_swapped:
            distance = haversine_distance(center, vert)
            if (distance > radius_around_aoi):
                radius_around_aoi = distance

        if user.is_staff:
            radius_around_aoi = -1
        res = {
            "id": task.id,
            "center": center,
            "zoom": zoomLevel,
            "radius_around_aoi": radius_around_aoi,
        }
        return Response({"message": "get task center and zoom successfully", "data": res}, status=status.HTTP_200_OK)
    except Task.DoesNotExist:
        return Response({"message": "Task not found"}, status=status.HTTP_404_NOT_FOUND)


@api_view(['GET'])
@permission_classes([AllowAny])
def delete_visit_file(request, file_id):
    try:
        visit_file = VisitFile.objects.get(id=file_id)
    except VisitFile.DoesNotExist:
        return Response({"message": "Visit file not found"}, status=status.HTTP_404_NOT_FOUND)
    if default_storage.exists(visit_file.file.path):
        default_storage.delete(visit_file.file.path)
    visit_file.delete()
    return Response({"message": "Visit file deleted successfully"}, status=status.HTTP_204_NO_CONTENT)


@api_view(['GET'])
@permission_classes([AllowAny])
def visit_field_download_file(request, file_id):
    try:
        visit_file = VisitFile.objects.get(id=file_id)
        file_path = visit_file.file.path
        with open(file_path, 'rb') as file:
            response = HttpResponse(
                file.read(), content_type='application/octet-stream')
            response['Content-Disposition'] = f'attachment; filename="{smart_str(visit_file.file.name)}"'
            response['X-Sendfile'] = smart_str(file_path)
            return response
    except VisitFile.DoesNotExist:
        return Response({"error": "File not found"}, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


def send_email(serialized_data):
    context_email = {
        "user": f"{serialized_data['firstname']} {serialized_data['lastname']}",
        "company": serialized_data["company"],
        "phone": serialized_data["phone"],
        "email": serialized_data["email"],
        "nb_hectares": str(serialized_data["nb_hectares"]),
    }
    html_message = render_to_string(
        "emails/quote_demande.html", context=context_email)
    plain_message = strip_tags(html_message)
    message = EmailMultiAlternatives(
        subject=f"Quote demand from {serialized_data['firstname']} {serialized_data['lastname']}",
        body=plain_message,
        from_email=settings.EMAIL_HOST_USER,
        to=["contact@robocare.tn"],
    )
    message.attach_alternative(html_message, "text/html")
    message.send()


def handle_request(data, demo_account):
    serialized_data = {
        "email": data["email"],
        "firstname": data["firstname"],
        "lastname": data["lastname"],
        "company": data["company"],
        "phone": data["phone"],
        "nb_hectares": data["nb_hectares"],
        "demo_account": demo_account,
    }
    serializer = AddQuoteSerializer(data=serialized_data)
    if serializer.is_valid():
        serializer.save()
        send_email(serialized_data)
        return Response({"message": "Quote saved successfully"}, status=status.HTTP_200_OK)
    else:
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(["POST"])
@permission_classes([AllowAny])
def Add_Quote(request):
    try:
        UserAccount.objects.get(email=request.data["email"])
        return handle_request(request.data, demo_account=True)
    except ObjectDoesNotExist:
        return handle_request(request.data, demo_account=False)
    except Exception as e:
        return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(["GET"])
@permission_classes([AllowAny])
def getTaskSensor(request, task_id):
    try:
        sensors = Sensor.objects.get(task=task_id)
        sensorSerializer = SensorSerializer(sensors)
        return Response(
            {"message": "Task initial detail successfuly", "data": sensorSerializer.data}, status=status.HTTP_200_OK
        )
    except Sensor.DoesNotExist:
        return Response({"message": "Task  doesn't have sonsor"}, status=status.HTTP_404_NOT_FOUND)


@api_view(["POST"])
@permission_classes([AllowAny])
def setHistogramStatic(request):
    task_id = request.data.get("task")
    index = request.data.get("index", "NDVI")

    try:
        range_instance = HistogramStatic.objects.get(task=task_id, index=index)
        rangeSerializer = HistogramStaticSerializer(
            range_instance, data=request.data, partial=True, many=False
        )
        if rangeSerializer.is_valid():
            rangeSerializer.save()
            return Response(
                {"message": "Task histogram range edited successfully",
                 "data": rangeSerializer.data},
                status=status.HTTP_200_OK
            )
        else:
            errors = rangeSerializer.errors
            return Response(errors, status=status.HTTP_400_BAD_REQUEST)
    except HistogramStatic.DoesNotExist:
        rangeSerializer = HistogramStaticSerializer(data=request.data)
        if rangeSerializer.is_valid():
            rangeSerializer.save()
            return Response(
                {"message": "Task histogram range created successfully",
                 "data": rangeSerializer.data},
                status=status.HTTP_200_OK
            )
        else:
            errors = rangeSerializer.errors
            return Response(errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(["POST"])
@permission_classes([AllowAny])
def getHistogramProductivity(request):
    task_id = request.data.get("id")
    provider = request.data.get("provider", "S2")
    index = request.data.get("index", "NDVI")
    date = request.data.get("date")
    zoneNbr = request.data.get("zoneNbr")
    try:
        task = Task.objects.get(id=task_id)
    except Task.DoesNotExist:
        return Response({"message": "Task not found"}, status=status.HTTP_404_NOT_FOUND)
    index = create_index_productivity(task, date, zoneNbr, index, provider)
    return Response({"message": "Histogram created successfully", "data": index}, status=status.HTTP_200_OK)


@api_view(["POST"])
@permission_classes([AllowAny])
def getHistogramStatic(request):
    index = request.data.get("index")
    density = request.data.get("density")
    index = request.data.get("index")

    try:
        static = HistogramStatic.objects.get(index=index, density=density)
        Serializer = HistogramStaticSerializer(static)

        return Response(
            {"message": "Task histogram static seted successfuly", "data": Serializer.data}, status=status.HTTP_200_OK
        )
    except HistogramStatic.DoesNotExist:
        return Response({"message": "Task  doesn't have histogram static values"}, status=status.HTTP_404_NOT_FOUND)


@api_view(["GET"])
@permission_classes([AllowAny])
def createTaskNotifications(request, task_id):
    task = Task.objects.get(id=task_id)
    graphdata = GraphData.objects.filter(task=task_id)
    predictdata = DataForecast.objects.filter(
        task=task.id, index="ndvi"
    ).first()
    forecast_dates = [entry['date']
                      for entry in predictdata.data_predict_fortnite]
    print("forecast_dates", forecast_dates)
    # serializer = GraphDataTaskSerializer(graphdata, many=True)
    # check if data exist and all 5 index where calculated
    if predictdata:
        if (
                graphdata.exists()
                and graphdata.count() == 5
                and predictdata.data_predict
                and predictdata.data_predict_fortnite
        ):
            # Select any record from the queryset
            selected_record = graphdata.get(index="ndvi")
            data = selected_record.data
            # print("record type index", selected_record.index)
            last_date = data[-1]["date"]
            # add a day to last date so the last date from database won't be included
            last_date_datetime = datetime.datetime.strptime(
                last_date, "%Y-%m-%d"
            )
            last_date = (
                    last_date_datetime + datetime.timedelta(days=1)
            ).strftime("%Y-%m-%d")
            # Set end_date to today's date
            end_date = (
                    datetime.datetime.now() + datetime.timedelta(days=1)
            ).strftime("%Y-%m-%d")
            coordinates = list(task.area_of_interest[0])
            coordinates = [list(coord)
                           for coord in coordinates[:-1]]
            coords_swapped = [
                [coordinate[1], coordinate[0]] for coordinate in coordinates
            ]
            polygon = ee.Geometry.Polygon(coords_swapped)
            collection = (
                ee.ImageCollection("COPERNICUS/S2_SR_HARMONIZED")
                .filterBounds(polygon)
                .filterMetadata(
                    "CLOUD_COVERAGE_ASSESSMENT", "less_than", 10
                )
                .filterDate(last_date, end_date)
            )
            # Extract dates from the Image Collection
            info = collection.getInfo()
            dates = [
                ee.Date(x["properties"]["system:time_start"])
                .format("YYYY-MM-dd")
                .getInfo()
                for x in info["features"]
            ]
            if not dates:
                # if their is not new dates then our data is updated to available dates
                print(
                    f"no new satellite image for the task {task.id}")
                # return Response(
                #     {
                #         "message": f"Get graph data for task: {id_task} succeed!",
                #         "data": serializer.data,
                #     },
                #     status=status.HTTP_200_OK,
                # )
            else:
                print("dates", dates)

                for item in graphdata:
                    updateIndexHistory(
                        task, collection, last_date, end_date, item, polygon
                    )
            ndvi_data = GraphData.objects.filter(
                task=task.id, index="ndvi").first()
            createAlerts(task, forecast_dates, ndvi_data, predictdata)
        else:
            print(
                f"task {task.id, task.task_name} has no graphdata")
    else:
        print(
            f"task {task.id, task.task_name} has no dataforecast")
    return Response(
        {"message": "Task notification created successfuly"}, status=status.HTTP_200_OK
    )


@api_view(["POST"])
@permission_classes([AllowAny])
def Anomaly_Type_Add(request):
    serializer = AnomalyTypeSerializer(data=request.data)
    if serializer.is_valid():
        serializer.save()
    else:
        errors = serializer.errors
        return Response(errors, status=status.HTTP_400_BAD_REQUEST)

    return Response(
        {"message": "Request for Anomaly Type added successfuly",
         "data": serializer.data},
        status=200,
    )


@api_view(["GET"])
@permission_classes([AllowAny])
def GetAllAnomalyTypes(request):
    anomalytypes = AnomalyType.objects.all()
    serializer = AnomalyTypeSerializer(anomalytypes, many=True)
    return Response(
        {
            "message": "get anomaly types succeed !",
            "data": serializer.data,
        },
        status=status.HTTP_200_OK,
    )


@api_view(['GET'])
@permission_classes([AllowAny])
def delete_anomaly_file(request, file_id):
    try:
        anomaly_file = AnomalyFile.objects.get(id=file_id)
    except AnomalyFile.DoesNotExist:
        return Response({"message": "Anomaly file not found"}, status=status.HTTP_404_NOT_FOUND)
    if default_storage.exists(anomaly_file.file.path):
        default_storage.delete(anomaly_file.file.path)
    anomaly_file.delete()
    return Response({"message": "Anomaly file deleted successfully"}, status=status.HTTP_200_OK)


@api_view(['GET'])
@permission_classes([AllowAny])
def anomaly_download_file(request, file_id):
    try:
        anomaly_file = AnomalyFile.objects.get(id=file_id)
        file_path = anomaly_file.file.path
        with open(file_path, 'rb') as file:
            response = HttpResponse(
                file.read(), content_type='application/octet-stream')
            response['Content-Disposition'] = f'attachment; filename="{smart_str(anomaly_file.file.name)}"'
            response['X-Sendfile'] = smart_str(file_path)
            return response
    except AnomalyFile.DoesNotExist:
        return Response({"error": "File not found"}, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(["POST"])
@permission_classes([AllowAny])
def createIndexTifComparator(request):
    task_id = request.data.get("id")
    provider = request.data.get("provider", "S2")
    index_name = request.data.get("index", "NDVI")
    date = request.data.get("date")

    try:
        task = Task.objects.get(id=task_id)
    except Task.DoesNotExist:
        return Response({"message": "Task not found"}, status=status.HTTP_404_NOT_FOUND)

    index = create_index_tif_comparator(task, date, index_name, provider)
    if not date:
        date= timezone.now().date()
    else:
        date = datetime.datetime.strptime(date, "%Y-%m-%d").date()
    task = Task.objects.get(id=task_id)
    age_of_task = relativedelta(date, task.plantation_date).years
    reference_comparison = TaskReferenceComparison.objects.filter(
        density=task.density,
        culture=task.culture,
        variety=task.variety,
        startage__lte=age_of_task,
        endage__gte=age_of_task
    ).values('task_id').first()
    if reference_comparison and str(task_id) != str(reference_comparison['task_id']):
        reference_task = Task.objects.get(id=reference_comparison['task_id'])
        year = reference_task.plantation_date.year + age_of_task
        month = date.month
        if reference_task.plantation_date.month == date.month and reference_task.plantation_date.year == year:
            day = reference_task.plantation_date.day
        else:
            day = 1
        formatted_date = timezone.datetime(year, month, day).strftime("%Y-%m-%d")
        date_checked = check_available_dates(reference_task, formatted_date, provider, 10)

        if date_checked['available_dates']:
            min_month = float('inf')
            max_month = -float('inf')
            for date_info in date_checked['available_dates']:
                histogram_exist = Histogram.objects.filter(task=reference_task.id, date=date_info['date'])

                if not histogram_exist.exists():
                    create_main_tif(reference_task, date_info['date'], provider)

                index_tif = create_index_tif(reference_task, date_info['date'], True, index_name, provider)
                if index_name.lower() !='rgb':
                    if index_tif['percentile'][0] < min_month:
                        min_month = index_tif['percentile'][0]
                    if index_tif['percentile'][1] > max_month:
                        max_month = index_tif['percentile'][1]
            if index_name.lower() != 'rgb':
                index['min'] = min_month
                index['max'] = max_month
                index['percentile'] = [min_month, max_month]

    return Response({"message": "Histogram created successfully", "data": index}, status=status.HTTP_200_OK)


@api_view(["POST"])
@permission_classes([AllowAny])
def createMainTifCompare(request):
    task_id = request.data.get("id")
    provider = request.data.get("provider", "S2")
    date = request.data.get("date")
    try:
        task = Task.objects.get(id=task_id)
        taskSerializer = TaskSerializer(task)
        project = task.project
        projectSerializer = ProjectSerializer(project)
    except Task.DoesNotExist:
        return Response({"message": "Task not found"}, status=status.HTTP_404_NOT_FOUND)
    except Project.DoesNotExist:
        return Response(
            {"message": "Related project not found"}, status=status.HTTP_404_NOT_FOUND
        )
    if not date:
        polygon = cordinates_to_polygon(task.area_of_interest[0])
        list_date = get_available_dates(polygon)
        date = list_date["last_date"]

    index = create_main_tif(task, date, provider)
    coords_swapped = cordinates_swapped(task.area_of_interest[0])
    serialized_task = TaskSerializer(task).data
    #histograms = HistogramStatic.objects.filter(density=serialized_task.get('density'), index="NDVI")
    #serialized_histograms = HistogramStaticSerializer(histograms, many=True).data
    if not date:
        date= timezone.now().date()
    else:
        date = datetime.datetime.strptime(date, "%Y-%m-%d").date()
    task = Task.objects.get(id=task_id)
    age_of_task = relativedelta(date, task.plantation_date).years
    reference_comparison = TaskReferenceComparison.objects.filter(
        density=task.density,
        culture=task.culture,
        variety=task.variety,
        startage__lte=age_of_task,
        endage__gte=age_of_task
    ).values('task_id').first()

    if reference_comparison and str(task_id) != str(reference_comparison['task_id']):
        reference_task = Task.objects.get(id=reference_comparison['task_id'])
        year = reference_task.plantation_date.year + age_of_task
        month = date.month
        if reference_task.plantation_date.month == date.month and reference_task.plantation_date.year == year:
            day = reference_task.plantation_date.day
        else:
            day = 1
        formatted_date = timezone.datetime(year, month, day).strftime("%Y-%m-%d")
        date_checked = check_available_dates(reference_task, formatted_date, provider, 10)

        if date_checked['available_dates']:

            min_month = float('inf')
            max_month = -float('inf')

            for date_info in date_checked['available_dates']:

                histogram_exist = Histogram.objects.filter(task=reference_task.id, date=date_info['date'])

                if not histogram_exist.exists():
                    create_main_tif(reference_task, date_info['date'], provider)

                index_tif = create_index_tif(reference_task, date_info['date'], True, "NDVI", provider)
                if index_tif['percentile'][0] < min_month:
                    min_month = index_tif['percentile'][0]
                if index_tif['percentile'][1] > max_month:
                    max_month = index_tif['percentile'][1]

            index['index_ndvi']['min'] = min_month
            index['index_ndvi']['max'] = max_month
            index['index_ndvi']['percentile'] = [min_month, max_month]

    #if serialized_histograms:
        #index['index_ndvi']['min'] = float(serialized_histograms[0]['min'])
        #index['index_ndvi']['max'] = float(serialized_histograms[0]['max'])
        #index['index_ndvi']['percentile'] = [float(serialized_histograms[0]['min']),
         #                                    float(serialized_histograms[0]['max'])]

    if float(task.surface) < 150.000:

        if not bool(task.image_sidebar):
            print("inside if image sidebar")
            thread = threading.Thread(
                target=generateTaskImageSidebar,
                args=(task,),
            )
            thread.start()

    num_points = len(coords_swapped)
    center_x = sum(point[0] for point in coords_swapped) / num_points
    center_y = sum(point[1] for point in coords_swapped) / num_points

    if task.country_fr is None or task.country_fr == "":
        get_region_info(task, center_y, center_x,
                        "3c5039876d354d40b69d0535d79c89e2")

    zoomLevel = zoomBySurface(taskSerializer.data["surface"])
    center = [center_x, center_y]
    print("index", index)
    if "error" in index:
        return Response({"error": index["error"], "details": index.get("details", "")}, status=400)

    res = {
        "task": taskSerializer.data,
        "project": projectSerializer.data,
        "center": center,
        "zoom": zoomLevel,
        "histogram": index["histogram"],
        "index": index["index_ndvi"],
        "date": {
            "date": date,
            "provider": provider
        },
    }
    return Response(
        {"message": "Task initial detail successfuly", "data": res}, status=200
    )
    # return Response({"message": index.data}, status=status.HTTP_200_OK)




@api_view(["POST"])
@permission_classes([AllowAny])
def set_user_language(request):
    user_id = request.data.get('id')
    language = request.data.get('language')
    if not user_id or not language:
        return Response({"error": "user_id and language are required."}, status=400)
    user = get_object_or_404(UserAccount, id=user_id)
    try:
        user.language = language
        user.save()
        return Response({"message": "Language updated successfully."}, status=200)
    except ValueError as e:
        return Response({"error": str(e)}, status=400)


@api_view(["GET"])
@permission_classes([AllowAny])
def get_user_language(request, user_id):
    try:
        user = UserAccount.objects.get(id=user_id)
        return JsonResponse({"language": user.language}, status=status.HTTP_200_OK)
    except UserAccount.DoesNotExist:
        return JsonResponse({"error": "User not found"}, status=status.HTTP_404_NOT_FOUND)


@api_view(["POST"])
@permission_classes([AllowAny])
def addSelfDataPattern(request):
    data = request.data.get("formData")
    task = data["task"]
    startDate = data["StartSelfDateP"]
    endDate = data["EndSelfDateP"]
    existing_pattern = PatternSelf.objects.filter(
        task=task)
    if existing_pattern.exists():
        existing_pattern.delete()
    insert_data = {
        "task": task,
        "startdate": startDate,
        "enddate": endDate,
    }
    serializer = PatternSelfSerializer(data=insert_data)
    if serializer.is_valid():
        serializer.save()
    else:
        errors = serializer.errors
        return Response(errors, status=status.HTTP_400_BAD_REQUEST)
    return Response(
        {"message": "Pattern saved successfully"},
        status=status.HTTP_200_OK,
    )


@api_view(["GET"])
@permission_classes([AllowAny])
def getSelfDataPattern(request, task_id):

    try:
        df, pattern_instance, smoothed_df = retrieve_pattern_data(task_id,"auto_pattern")
        dataf = smoothed_df.reset_index()
        dataf['value'] = dataf['NDVI_rolling_mean'].round(4)
        dataf['date'] = dataf['date'].dt.strftime('%Y-%m-%d')
        dataf = dataf.to_dict(orient="records")

    except Task.DoesNotExist:
        return Response({"detail": "Task not found."}, status=status.HTTP_404_NOT_FOUND)
    except Pattern.DoesNotExist:
        return Response({"detail": "Pattern not found."}, status=status.HTTP_404_NOT_FOUND)
    except GraphData.DoesNotExist:
        return Response({"detail": "Graph data not found."}, status=status.HTTP_404_NOT_FOUND)
    return Response(
        {"message": "pattern retrieved successfuly", "data": dataf},
        status=status.HTTP_200_OK,
    )




@api_view(["GET"])
@permission_classes([AllowAny])
def getSelfPatternDate(request, task_id):
    try:
        task = Task.objects.get(id=task_id)
    except Task.DoesNotExist:
        return Response({"detail": "Task not found."}, status=status.HTTP_404_NOT_FOUND)

    try:
        pattern = PatternSelf.objects.get(task=task.id)
    except PatternSelf.DoesNotExist:
        return Response({"detail": "Pattern does not exist for this task."}, status=status.HTTP_404_NOT_FOUND)
    pattern_serializer = PatternSelfSerializer(pattern)
    return Response(
        {"message": "Pattern retrieved successfully", "data": pattern_serializer.data},
        status=status.HTTP_200_OK,
    )


@api_view(["GET"])
@permission_classes([AllowAny])
def getAnomalyByTask(request, task_id):
    try:
        task = Task.objects.get(id=task_id)
    except Task.DoesNotExist:
        return Response({"detail": "Task not found."}, status=status.HTTP_404_NOT_FOUND)

    event_anomalies = Event.objects.filter(task=task, anomaly__isnull=False)
    if not event_anomalies.exists():
        return Response({"detail": "No anomalies exist for this task."}, status=status.HTTP_404_NOT_FOUND)

    anomalies_data = []
    for event in event_anomalies:
        anomaly = event.anomaly
        anomaly_type = AnomalyType.objects.get(id=anomaly.anomaly_type_id)

        anomaly_data = {
            "open_hour": event.open_hour,
            "close_hour": event.close_hour,
            "anomaly_type_name": anomaly_type.anomaly_type,
            "note": anomaly.notes,
        }
        anomalies_data.append(anomaly_data)

    return Response(
        {"message": "Anomalies retrieved successfully", "data": anomalies_data},
        status=status.HTTP_200_OK,
    )


from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework import status
from django.utils import timezone
import datetime
from .models import Task, TerrainModel # Adjust the import based on your project structure


@api_view(["GET"])
@permission_classes([AllowAny])
def updatePlantationDate(request):
    tasks = Task.objects.all()
    current_date = timezone.now().date()

    for task in tasks:
        if task.plantation_date is None:
            diff_years = current_date.year - task.created.year

            try:
                age = int(task.age) if task.age is not None else 0
            except ValueError:
                return Response(
                    {"error": f"Invalid age for task ID {task.id}"},
                    status=status.HTTP_400_BAD_REQUEST,
                )

            task.plantation_date = current_date - datetime.timedelta(days=365 * diff_years + 365 * age)
            task.age = age + diff_years
            task.save()

    return Response(
        {"message": "Tasks updated successfully", "data": "Updated plantation dates and ages"},
        status=status.HTTP_200_OK,
    )


@api_view(["POST"])
@permission_classes([AllowAny])
def addTaskReferenceComparison(request):
    data = request.data.get("formData")
    task = data["task"]
    density = data["density"]
    variety = data["variety"]
    culture = data["culture"]
    startage = data["startage"]
    endage = data["endage"]

    if not endage:
        task_object = Task.objects.get(id=task)
        endage = datetime.datetime.now().year - task_object.plantation_date.year

    exact_duplicate = TaskReferenceComparison.objects.filter(
        density=density,
        variety=variety,
        culture=culture,
        startage=startage,
        endage=endage
    )
    if exact_duplicate.exists():
        return Response(
            {"error": "An identical task reference comparison already exists"},
            status=status.HTTP_400_BAD_REQUEST
        )

    existing_task_reference = TaskReferenceComparison.objects.filter(
        density=density, variety=variety, culture=culture
    )
    if existing_task_reference.exists():
        conflicting_ranges = []
        for reference in existing_task_reference:
            if (reference.startage < endage and reference.endage > startage):
                conflicting_ranges.append((reference.startage, reference.endage))
        if conflicting_ranges:
            error_message = "Conflict found with existing task references in the following ranges: " + \
                            ", ".join([f"({start}, {end})" for start, end in conflicting_ranges])
            return Response({"error": error_message}, status=status.HTTP_400_BAD_REQUEST)

    insert_data = {
        "task": task,
        "density": density,
        "variety": variety,
        "culture": culture,
        "startage": startage,
        "endage": endage,
    }

    serializer = TaskReferenceComparisonSerializer(data=insert_data)
    if serializer.is_valid():
        serializer.save()
    else:
        errors = serializer.errors
        return Response(errors, status=status.HTTP_400_BAD_REQUEST)

    return Response(
        {"message": "Task reference comparison saved successfully", "data": serializer.data},
        status=status.HTTP_200_OK,
    )


@api_view(["GET"])
@permission_classes([AllowAny])
def ListTaskReferenceComparison(request):
    reference_task = TaskReferenceComparison.objects.all()
    if not reference_task:
        return Response(
            {"message": "No data available !", "data": []}, status=status.HTTP_200_OK
        )
    else:
        serializer = TaskReferenceComparisonListSerializer(reference_task, many=True)
        return Response(
            {"message": "reference tasks  list successfully", "data": serializer.data},
            status=status.HTTP_200_OK,
        )


@api_view(["POST"])
@permission_classes([AllowAny])
def DeleteTaskReferenceComparison(request):
    try:
        id_task = request.data.get("id")
        if id_task is None:
            return Response({"error": "ID task is required"}, status=status.HTTP_400_BAD_REQUEST)
        reference_task = TaskReferenceComparison.objects.get(id=id_task)
        reference_task.delete()
        return Response({"message": "Task reference deleted successfully"}, status=status.HTTP_200_OK)
    except TaskReferenceComparison.DoesNotExist:
        return Response({"error": "Task  reference not found"}, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(["GET"])
@permission_classes([AllowAny])
def DetailsTaskReferenceComparison(request, id_task_reference):
    task_reference = get_object_or_404(TaskReferenceComparison, id=id_task_reference)
    response_data = {
        "id": task_reference.id,
        "task": {
            "id": task_reference.task.id,
            "name": task_reference.task.task_name
        },
        "culture": {
            "id": task_reference.culture.id if task_reference.culture else None,
            "name": task_reference.culture.name_en if task_reference.culture else None
        },
        "density": {
            "id": task_reference.density.id if task_reference.density else None,
            "name": task_reference.density.name_en if task_reference.density else None
        },
        "variety": {
            "id": task_reference.variety.id if task_reference.variety else None,
            "name": task_reference.variety.name_en if task_reference.variety else None
        },
        "startage": task_reference.startage,
        "endage": task_reference.endage,
    }

    return JsonResponse(response_data)


@api_view(["POST"])
@permission_classes([AllowAny])
def updateTaskReferenceComparison(request):
    try:
        task_ref_id = request.data.get("id")
        startage = int(request.data.get("startage"))
        endage = int(request.data.get("endage"))
        task_ref = get_object_or_404(TaskReferenceComparison, id=task_ref_id)
        culture = task_ref.culture
        variety = task_ref.variety
        density = task_ref.density
        existing_task_reference = TaskReferenceComparison.objects.filter(
            density=density, variety=variety, culture=culture
        ).exclude(id=task_ref_id)
        if existing_task_reference.exists():
            conflicting_ranges = []
            for reference in existing_task_reference:
                if reference.startage < endage and reference.endage > startage:
                    conflicting_ranges.append((reference.startage, reference.endage))
            if conflicting_ranges:
                error_message = "Conflict found with existing task references in the following ranges: " + \
                                ", ".join([f"({start}, {end})" for start, end in conflicting_ranges])
                return Response({"error": error_message}, status=status.HTTP_400_BAD_REQUEST)
        if startage is not None:
            task_ref.startage = int(startage)
        if endage is not None:
            task_ref.endage = int(endage)
        task_ref.save()
        return Response({
            "message": "TaskReferenceComparison updated successfully",
            "startage": task_ref.startage,
            "endage": task_ref.endage
        })
    except Exception as e:
        return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)


@api_view(["GET"])
@permission_classes([AllowAny])
def getTaskGraphDataComparison(request, id_task, date=None):
    task = get_object_or_404(Task, id=id_task)

    if not date:
        date = timezone.now().date()
    else:
        date = timezone.datetime.strptime(date, "%Y-%m-%d")

    age_of_task = relativedelta(date, task.plantation_date).years
    if task.intensification_density is not None:
        density=task.intensification_density
    else :
        density=task.density
    if task.intensification_variety is not None:
        variety=task.intensification_variety
    else :
        variety=task.variety
    exist_pattern = Pattern.objects.filter(density=density, variety=variety).first()

    if age_of_task > 15 and exist_pattern:
        Pattern.objects.get(density=density, variety=variety)
        df, pattern_instance, smoothed_df = retrieve_pattern_data(id_task, "default_pattern")
        dataf = smoothed_df.reset_index()

        dataf['value'] = dataf['NDVI_rolling_mean'].round(4)
        dataf['date'] = dataf['date'].dt.strftime('%Y-%m-%d')
        dataf = dataf.to_dict(orient="records")

        date_value_cloud_list = [
            {"date": entry["date"], "value": entry["value"], "cloud_percentage": entry["cloud_percentage"]}
            for entry in dataf
        ]
        ndvi_rolling_mean_list = [
            {
                "date": entry["date"],
                "value": entry["value"],
                "cloud_percentage": entry["cloud_percentage"],
                "NDVI_rolling_mean": entry["NDVI_rolling_mean"]
            }
            for entry in dataf
        ]
        data = {
            "data": date_value_cloud_list,
            "data_smoothed": ndvi_rolling_mean_list,
            "index": "ndvi"
        }
        return Response(
            {
                "message": "Get graph data for task: succeed!",
                "data": [data],
            },
            status=status.HTTP_200_OK,
        )
    reference_comparison = TaskReferenceComparison.objects.filter(
        density=density,
        culture=task.culture,
        variety=variety,
        startage__lte=age_of_task,
        endage__gte=age_of_task
    ).values('task_id').first()

    if not reference_comparison:
        return Response(
            {"message": "No matching reference comparison found"},
            status=status.HTTP_404_NOT_FOUND
        )


    if id_task == str(reference_comparison['task_id']):
        return Response(
            {"message": "There are the same task no data to return"},
            status=status.HTTP_404_NOT_FOUND
        )
    graph_data = GraphData.objects.filter(task=reference_comparison['task_id'])
    serializer = GraphDataTaskSerializer(graph_data, many=True)

    if graph_data.exists():
        task_reference = get_object_or_404(Task, id=reference_comparison['task_id'])

        start_filter_date = task_reference.plantation_date + relativedelta(years=age_of_task)
        end_filter_date = start_filter_date + relativedelta(years=1)

        filtered_data = []

        for item in serializer.data:
            data_filtered = [
                entry for entry in item['data']
                if start_filter_date <= timezone.datetime.strptime(entry['date'], '%Y-%m-%d').date() < end_filter_date
                and not (timezone.datetime.strptime(entry['date'], '%Y-%m-%d').date().year == end_filter_date.year
                         and timezone.datetime.strptime(entry['date'], '%Y-%m-%d').date().month == end_filter_date.month)
            ]

            data_smoothed_filtered = [
                entry for entry in item['data_smoothed']
                if start_filter_date <= timezone.datetime.strptime(entry['date'], '%Y-%m-%d').date() < end_filter_date
                and not (timezone.datetime.strptime(entry['date'], '%Y-%m-%d').date().year == end_filter_date.year
                         and timezone.datetime.strptime(entry['date'], '%Y-%m-%d').date().month == end_filter_date.month)
            ]

            item_filtered = item.copy()
            item_filtered['data'] = data_filtered
            item_filtered['data_smoothed'] = data_smoothed_filtered

            filtered_data.append(item_filtered)

        return Response(
            {
                "message": f"Get graph data for task: {reference_comparison['task_id']} from {start_filter_date} to {end_filter_date} succeed!",
                "data": filtered_data,
            },
            status=status.HTTP_200_OK,
        )
    else:
        return Response(
            {
                "message": f"No graph data found for task: {reference_comparison['task_id']}.",
                "data": None,
            },
            status=status.HTTP_404_NOT_FOUND,
        )


@api_view(["GET"])
@permission_classes([AllowAny])
def getTaskGraphDataDate(request, id_task):
    task = get_object_or_404(Task, id=id_task)
    graph_data = GraphData.objects.filter(task=task)

    if graph_data.exists():
        serializer = GraphDataTaskSerializer(graph_data, many=True)
        current_year = timezone.now().year
        current_month = timezone.now().month
        start_of_year = timezone.datetime(current_year - 1, current_month, 1).date().isoformat()

        filtered_data = []
        for item in serializer.data:
            item['data'] = [entry for entry in item['data'] if entry['date'] >= start_of_year]
            item['data_smoothed'] = [entry for entry in item['data_smoothed'] if entry['date'] >= start_of_year]
            filtered_data.append(item)

        return Response(
            {
                "message": f"Get graph data for task: {id_task} succeed!",
                "data": filtered_data,
            },
            status=status.HTTP_200_OK,
        )
    else:
        return Response(
            {
                "message": f"No graph data found for task: {id_task}.",
                "data": None,
            },
            status=status.HTTP_404_NOT_FOUND,
        )


@api_view(["POST"])
@permission_classes([AllowAny])
def getTaskGraphDataComparisonBorns(request):
    data = request.data
    index = data.get('index').lower()
    provider = request.data.get("provider", "S2")
    date = request.data.get("date")

    if not date:
        date= timezone.now().date()
    else:
        date = datetime.datetime.strptime(date, "%Y-%m-%d").date()

    if index is None:
        return Response(
            {"message": "Index parameter is required"},
            status=status.HTTP_400_BAD_REQUEST
        )
    task = get_object_or_404(Task, id=request.data.get('id_task'))
    culture_id = str(task.culture.id)
    age_of_task = relativedelta(date, task.plantation_date).years

    reference_comparison = TaskReferenceComparison.objects.filter(
        density=task.density,
        culture=task.culture,
        variety=task.variety,
        startage__lte=age_of_task,
        endage__gte=age_of_task
    ).values('task_id').first()
    if not reference_comparison:
        return Response(
            {"message": "No matching reference comparison found"},
            status=status.HTTP_404_NOT_FOUND
        )
    reference_task = get_object_or_404(Task, id=reference_comparison['task_id'])
    if str(request.data.get('id_task')) == str(reference_comparison['task_id']):
        return Response(
            {
                "error": "Task  and task reference  cannot be the same."
            },
            status=status.HTTP_400_BAD_REQUEST
        )


    year = reference_task.plantation_date.year+age_of_task

    month = date.month
    if reference_task.plantation_date.month == date.month and reference_task.plantation_date.year ==year:
        day = reference_task.plantation_date.day
    else:
        day= 1
    formatted_date = timezone.datetime(year, month, day).strftime("%Y-%m-%d")

    date_checked = check_available_dates(reference_task, formatted_date, provider, 10)

    min_month = float('inf')
    max_month = -float('inf')

    for date_info in date_checked['available_dates']:
        histogram_exist=Histogram.objects.filter(task=reference_task.id, date=date_info['date'])

        if not histogram_exist.exists():
            create_main_tif(reference_task,date_info['date'],provider)


        index_tif = create_index_tif(reference_task, date_info['date'], True, index, provider)


        if index_tif['percentile'][0] < min_month:
            min_month = index_tif['percentile'][0]
        if index_tif['percentile'][1] > max_month:
            max_month = index_tif['percentile'][1]
    return Response(
        {
            "data": {
                "min_month": min_month,
                "max_month": max_month
            }
        },
        status=status.HTTP_200_OK
    )


@api_view(["GET"])
@permission_classes([AllowAny])
def getTaskAge(request, id_task):
    task = get_object_or_404(Task, id=id_task)
    today = timezone.now().date()
    age_years = today.year - task.plantation_date.year - (
            (today.month, today.day) < (task.plantation_date.month, task.plantation_date.day)
    )

    return Response(
        {
            "plantation_date": task.plantation_date,
            "age_years": age_years
        },
        status=status.HTTP_200_OK
    )
def get_task_dates(task_id):
    try:
        task = Task.objects.get(id=task_id)
        taskImages = TaskImage.objects.filter(task=task).order_by("-date")
        if taskImages.exists():
            return taskImages.first().date.strftime("%Y-%m-%d")
        return None
    except Task.DoesNotExist:
        return None





@api_view(["GET"])
@permission_classes([AllowAny])
def update_user_authorized(request, user_id):
    try:
        user = User.objects.get(id=user_id)
        user.is_authorized = True
        user.save()

        return Response(
            {"message": f"L'utilisateur avec l'ID {user_id} a été mis à jour avec succès."},
            status=status.HTTP_200_OK,
        )
    except User.DoesNotExist:
        return Response(
            {"error": f"Aucun utilisateur trouvé avec l'ID {user_id}."},
            status=status.HTTP_404_NOT_FOUND,
        )

@api_view(['GET'])
@permission_classes([AllowAny])
def export_users_excel(request):
    wb = openpyxl.Workbook()
    ws = wb.active
    ws.title = "Users List"
    headers = ['First Name', 'Last Name', 'Phone', 'Email', 'Date Created', 'Authorized', 'Total Surface (ha)']
    header_fill = PatternFill(start_color='CCE5FF', end_color='CCE5FF', fill_type='solid')
    for col, header in enumerate(headers, 1):
        cell = ws.cell(row=1, column=col)
        cell.value = header
        cell.fill = header_fill

    users = User.objects.all().order_by('-created')

    for row, user in enumerate(users, 2):
        total_surface = Task.objects.filter(
            project__user=user
        ).aggregate(
            total_surface=models.Sum('surface')
        )['total_surface'] or 0

        ws.cell(row=row, column=1, value=user.firstname)
        ws.cell(row=row, column=2, value=user.lastname)
        ws.cell(row=row, column=3, value=user.phone)
        ws.cell(row=row, column=4, value=user.email)
        ws.cell(row=row, column=5, value=user.created.strftime('%Y-%m-%d'))
        ws.cell(row=row, column=6, value=user.is_authorized)
        ws.cell(row=row, column=7, value=float(total_surface))

    for column in ws.columns:
        max_length = 0
        column_letter = openpyxl.utils.get_column_letter(column[0].column)
        for cell in column:
            try:
                if len(str(cell.value)) > max_length:
                    max_length = len(str(cell.value))
            except:
                pass
        adjusted_width = (max_length + 2)
        ws.column_dimensions[column_letter].width = adjusted_width
    for row in range(2, ws.max_row + 1):
        surface_cell = ws.cell(row=row, column=7)
        surface_cell.number_format = '0.000'

    excel_file = io.BytesIO()
    wb.save(excel_file)
    excel_file.seek(0)

    filename = f'users_export_{timezone.datetime.now().strftime("%Y%m%d_%H%M%S")}.xlsx'
    response = HttpResponse(
        excel_file.read(),
        content_type='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    )
    response['Content-Disposition'] = f'attachment; filename="{filename}"'
    return response

@api_view(['GET'])
@permission_classes([AllowAny])
def export_paying_users_excel(request):
    wb = openpyxl.Workbook()
    ws = wb.active
    ws.title = "Users List"
    headers = ['First Name', 'Last Name', 'Phone', 'Email', 'Date Created', 'Authorized', 'Total Surface (ha)']
    header_fill = PatternFill(start_color='CCE5FF', end_color='CCE5FF', fill_type='solid')
    for col, header in enumerate(headers, 1):
        cell = ws.cell(row=1, column=col)
        cell.value = header
        cell.fill = header_fill

    users = User.objects.filter(is_authorized=True,is_not_demo=True,is_active=True,is_staff=False).order_by('-created')

    for row, user in enumerate(users, 2):
        total_surface = Task.objects.filter(
            project__user=user
        ).aggregate(
            total_surface=models.Sum('surface')
        )['total_surface'] or 0

        ws.cell(row=row, column=1, value=user.firstname)
        ws.cell(row=row, column=2, value=user.lastname)
        ws.cell(row=row, column=3, value=user.phone)
        ws.cell(row=row, column=4, value=user.email)
        ws.cell(row=row, column=5, value=user.created.strftime('%Y-%m-%d'))
        ws.cell(row=row, column=6, value=user.is_authorized)
        ws.cell(row=row, column=7, value=float(total_surface))

    for column in ws.columns:
        max_length = 0
        column_letter = openpyxl.utils.get_column_letter(column[0].column)
        for cell in column:
            try:
                if len(str(cell.value)) > max_length:
                    max_length = len(str(cell.value))
            except:
                pass
        adjusted_width = (max_length + 2)
        ws.column_dimensions[column_letter].width = adjusted_width
    for row in range(2, ws.max_row + 1):
        surface_cell = ws.cell(row=row, column=7)
        surface_cell.number_format = '0.000'

    excel_file = io.BytesIO()
    wb.save(excel_file)
    excel_file.seek(0)

    filename = f'paying_users_export_{timezone.datetime.now().strftime("%Y%m%d_%H%M%S")}.xlsx'
    response = HttpResponse(
        excel_file.read(),
        content_type='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    )
    response['Content-Disposition'] = f'attachment; filename="{filename}"'
    return response

@api_view(['GET'])
@permission_classes([AllowAny])
def export_demo_expired_users_excel(request):
    wb = openpyxl.Workbook()
    ws = wb.active
    ws.title = "Users List"
    headers = ['First Name', 'Last Name', 'Phone', 'Email', 'Date Created', 'Authorized', 'Total Surface (ha)']
    header_fill = PatternFill(start_color='CCE5FF', end_color='CCE5FF', fill_type='solid')
    for col, header in enumerate(headers, 1):
        cell = ws.cell(row=1, column=col)
        cell.value = header
        cell.fill = header_fill

    users = User.objects.filter(is_authorized=False, is_not_demo=False, is_active=False,is_staff=False).order_by('-created')

    for row, user in enumerate(users, 2):
        total_surface = Task.objects.filter(
            project__user=user
        ).aggregate(
            total_surface=models.Sum('surface')
        )['total_surface'] or 0

        ws.cell(row=row, column=1, value=user.firstname)
        ws.cell(row=row, column=2, value=user.lastname)
        ws.cell(row=row, column=3, value=user.phone)
        ws.cell(row=row, column=4, value=user.email)
        ws.cell(row=row, column=5, value=user.created.strftime('%Y-%m-%d'))
        ws.cell(row=row, column=6, value=user.is_authorized)
        ws.cell(row=row, column=7, value=float(total_surface))

    for column in ws.columns:
        max_length = 0
        column_letter = openpyxl.utils.get_column_letter(column[0].column)
        for cell in column:
            try:
                if len(str(cell.value)) > max_length:
                    max_length = len(str(cell.value))
            except:
                pass
        adjusted_width = (max_length + 2)
        ws.column_dimensions[column_letter].width = adjusted_width
    for row in range(2, ws.max_row + 1):
        surface_cell = ws.cell(row=row, column=7)
        surface_cell.number_format = '0.000'

    excel_file = io.BytesIO()
    wb.save(excel_file)
    excel_file.seek(0)

    filename = f'expired_users_demo_export_{timezone.datetime.now().strftime("%Y%m%d_%H%M%S")}.xlsx'
    response = HttpResponse(
        excel_file.read(),
        content_type='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    )
    response['Content-Disposition'] = f'attachment; filename="{filename}"'
    return response

@api_view(['GET'])
@permission_classes([AllowAny])
def export_demo_not_expired_users_excel(request):
    wb = openpyxl.Workbook()
    ws = wb.active
    ws.title = "Users List"
    headers = ['First Name', 'Last Name', 'Phone', 'Email', 'Date Created', 'Authorized', 'Total Surface (ha)']
    header_fill = PatternFill(start_color='CCE5FF', end_color='CCE5FF', fill_type='solid')
    for col, header in enumerate(headers, 1):
        cell = ws.cell(row=1, column=col)
        cell.value = header
        cell.fill = header_fill

    users = User.objects.filter(is_authorized=True,is_not_demo=False,is_active=True,is_staff=False).order_by('-created')

    for row, user in enumerate(users, 2):
        total_surface = Task.objects.filter(
            project__user=user
        ).aggregate(
            total_surface=models.Sum('surface')
        )['total_surface'] or 0

        ws.cell(row=row, column=1, value=user.firstname)
        ws.cell(row=row, column=2, value=user.lastname)
        ws.cell(row=row, column=3, value=user.phone)
        ws.cell(row=row, column=4, value=user.email)
        ws.cell(row=row, column=5, value=user.created.strftime('%Y-%m-%d'))
        ws.cell(row=row, column=6, value=user.is_authorized)
        ws.cell(row=row, column=7, value=float(total_surface))

    for column in ws.columns:
        max_length = 0
        column_letter = openpyxl.utils.get_column_letter(column[0].column)
        for cell in column:
            try:
                if len(str(cell.value)) > max_length:
                    max_length = len(str(cell.value))
            except:
                pass
        adjusted_width = (max_length + 2)
        ws.column_dimensions[column_letter].width = adjusted_width
    for row in range(2, ws.max_row + 1):
        surface_cell = ws.cell(row=row, column=7)
        surface_cell.number_format = '0.000'

    excel_file = io.BytesIO()
    wb.save(excel_file)
    excel_file.seek(0)

    filename = f'not_expired_users_demo_export_{timezone.datetime.now().strftime("%Y%m%d_%H%M%S")}.xlsx'
    response = HttpResponse(
        excel_file.read(),
        content_type='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    )
    response['Content-Disposition'] = f'attachment; filename="{filename}"'
    return response



@api_view(["POST"])
@permission_classes([AllowAny])
def getCompaisonMemeTaskLeft(request):
    task_id = request.data.get("id")
    provider = request.data.get("provider", "S2")
    date_right = request.data.get("date_right")
    date_left = request.data.get("date_left")
    task = Task.objects.get(id=task_id)
    taskSerializer = TaskSerializer(task)
    project = task.project
    projectSerializer = ProjectSerializer(project)
    if not date_left:
        polygon = cordinates_to_polygon(task.area_of_interest[0])
        list_date = get_available_dates(polygon)
        date_left = list_date["last_date"]
    if not date_right:
        polygon = cordinates_to_polygon(task.area_of_interest[0])
        list_date = get_available_dates(polygon)
        date_right = list_date["last_date"]


    index_tif_left = create_main_tif(task, date_left, provider)
    index_tif_right = create_main_tif(task, date_right, provider)
    index_max = max(index_tif_right["index_ndvi"]['max'],index_tif_left["index_ndvi"]['max'])
    index_min = min(index_tif_right["index_ndvi"]['min'],index_tif_left["index_ndvi"]['min'])
    culture_id = task.culture.id if task.culture else None

    olives_ids = ["a17a408e-d234-4aad-bf28-fe5c25e2eeb8", "7bd57d1b-428f-4f09-b7c0-45ef023eb110", "0c838d48-b13c-4a8e-be50-ba10d25b595c"]

    culture_categorie_id = None
    if str(culture_id) not in olives_ids:
        culture_categorie_id = str(Culture.objects.get(id=task.culture_id).categorie_id)

    index_min_value = 0 if str(culture_id) in olives_ids else (
        index_min if culture_categorie_id == '772ca459-b7a1-4ea8-93ca-2938f45014e2' else index_min / 2)
    index_max_value = index_max * 0.9 if str(culture_id) in olives_ids else index_max

    for key in ["index_tif_left", "index_tif_right"]:
        index = locals()[key]["index_ndvi"]
        index["max"] = index_max_value
        index["percentile"][1] = index_max_value
        index["min"] = index_min_value
        index["percentile"][0] = index_min_value

    coords_swapped = cordinates_swapped(task.area_of_interest[0])

    num_points = len(coords_swapped)

    center_x = sum(point[0] for point in coords_swapped) / num_points
    center_y = sum(point[1] for point in coords_swapped) / num_points
    center = [center_x, center_y]
    zoomLevel = zoomBySurface(taskSerializer.data["surface"])

    res = {
        "task": taskSerializer.data,
        "project": projectSerializer.data,
        "center": center,
        "zoom": zoomLevel,
        "histogram": index_tif_left["histogram"],
        "index": index_tif_left["index_ndvi"],
        "date": {
            "date": date_left,
            "provider": provider
        },
    }
    return Response(
        {"message": "Task initial detail successfuly", "data": res}, status=200
    )

    # return Response({"message": index.data}, status=status.HTTP_200_OK)


@api_view(["POST"])
@permission_classes([AllowAny])
def getCompaisonMemeTaskRight(request):
    task_id = request.data.get("id")
    provider = request.data.get("provider", "S2")
    date_right = request.data.get("date_right")
    date_left = request.data.get("date_left")
    task = Task.objects.get(id=task_id)
    taskSerializer = TaskSerializer(task)
    project = task.project
    projectSerializer = ProjectSerializer(project)
    if not date_left:
        polygon = cordinates_to_polygon(task.area_of_interest[0])
        list_date = get_available_dates(polygon)
        date_left = list_date["last_date"]
    if not date_right:
        polygon = cordinates_to_polygon(task.area_of_interest[0])
        list_date = get_available_dates(polygon)
        date_right = list_date["last_date"]
    index_tif_left = create_main_tif(task, date_left, provider)
    index_tif_right = create_main_tif(task, date_right, provider)
    index_max = max(index_tif_right["index_ndvi"]['max'],index_tif_left["index_ndvi"]['max'])
    index_min = min(index_tif_right["index_ndvi"]['min'],index_tif_left["index_ndvi"]['min'])
    culture_id = task.culture.id if task.culture else None
    olives_ids = ["a17a408e-d234-4aad-bf28-fe5c25e2eeb8", "7bd57d1b-428f-4f09-b7c0-45ef023eb110", "0c838d48-b13c-4a8e-be50-ba10d25b595c"]
    culture_categorie_id = None
    if str(culture_id) not in olives_ids:
        culture_categorie_id = str(Culture.objects.get(id=task.culture_id).categorie_id)

    index_min_value = 0 if str(culture_id) in olives_ids else (
        index_min if culture_categorie_id == '772ca459-b7a1-4ea8-93ca-2938f45014e2' else index_min / 2)
    index_max_value = index_max * 0.9 if str(culture_id) in olives_ids else index_max

    for key in ["index_tif_left", "index_tif_right"]:
        index = locals()[key]["index_ndvi"]
        index["max"] = index_max_value
        index["percentile"][1] = index_max_value
        index["min"] = index_min_value
        index["percentile"][0] = index_min_value

    coords_swapped = cordinates_swapped(task.area_of_interest[0])

    num_points = len(coords_swapped)

    center_x = sum(point[0] for point in coords_swapped) / num_points
    center_y = sum(point[1] for point in coords_swapped) / num_points
    center = [center_x, center_y]
    zoomLevel = zoomBySurface(taskSerializer.data["surface"])

    res = {
        "task": taskSerializer.data,
        "project": projectSerializer.data,
        "center": center,
        "zoom": zoomLevel,
        "histogram": index_tif_right["histogram"],
        "index": index_tif_right["index_ndvi"],
        "date": {
            "date": date_right,
            "provider": provider
        },
    }
    return Response(
        {"message": "Task initial detail successfuly", "data": res}, status=200
    )


@api_view(["POST"])
@permission_classes([AllowAny])
def getIndexCompaisonMemeTaskRight(request):
    try:
        task_id = request.data.get("id")
        provider = request.data.get("provider", "S2")
        index_name = request.data.get("index", "NDVI")

        task = Task.objects.get(id=task_id)

        def get_date_or_last_available(date):
            if date:
                return date
            polygon = cordinates_to_polygon(task.area_of_interest[0])
            return get_available_dates(polygon)["last_date"]

        date_left = get_date_or_last_available(request.data.get("date_left"))
        date_right = get_date_or_last_available(request.data.get("date_right"))

        index_left = create_index_tif_comparator(task, date_left, index_name, provider)
        index_right = create_index_tif_comparator(task, date_right, index_name, provider)

        index_max = max(index_left['max'], index_right['max'])
        index_min = min(index_left['min'], index_right['min'])

        culture_id = str(task.culture.id) if task.culture else None
        olives_ids = {
            "a17a408e-d234-4aad-bf28-fe5c25e2eeb8",
            "7bd57d1b-428f-4f09-b7c0-45ef023eb110",
            "0c838d48-b13c-4a8e-be50-ba10d25b595c"
        }

        culture_categorie_id = None
        if culture_id and culture_id not in olives_ids:
            culture_categorie_id = str(Culture.objects.get(id=task.culture_id).categorie_id)

        index_min_value = 0 if culture_id in olives_ids else (
            index_min if culture_categorie_id == '772ca459-b7a1-4ea8-93ca-2938f45014e2' else index_min / 2)
        index_max_value = index_max * 0.9 if culture_id in olives_ids else index_max

        for index in (index_left, index_right):
            index.update({
                "max": index_max_value,
                "min": index_min_value,
                "percentile": [index_min_value, index_max_value]
            })

        return Response({
            "message": "Histogram created successfully",
            "data": index_right
        }, status=status.HTTP_200_OK)

    except ObjectDoesNotExist:
        return Response({"error": "Task not found"}, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(["POST"])
@permission_classes([AllowAny])
def getIndexCompaisonMemeTaskLeft(request):
    try:
        task_id = request.data.get("id")
        provider = request.data.get("provider", "S2")
        index_name = request.data.get("index", "NDVI")

        task = Task.objects.get(id=task_id)

        def get_date_or_last_available(date):
            if date:
                return date
            polygon = cordinates_to_polygon(task.area_of_interest[0])
            return get_available_dates(polygon)["last_date"]

        date_left = get_date_or_last_available(request.data.get("date_left"))
        date_right = get_date_or_last_available(request.data.get("date_right"))

        index_left = create_index_tif_comparator(task, date_left, index_name, provider)
        index_right = create_index_tif_comparator(task, date_right, index_name, provider)

        index_max = max(index_left['max'], index_right['max'])
        index_min = min(index_left['min'], index_right['min'])

        culture_id = str(task.culture.id) if task.culture else None
        olives_ids = {
            "a17a408e-d234-4aad-bf28-fe5c25e2eeb8",
            "7bd57d1b-428f-4f09-b7c0-45ef023eb110",
            "0c838d48-b13c-4a8e-be50-ba10d25b595c"
        }

        culture_categorie_id = None
        if culture_id and culture_id not in olives_ids:
            culture_categorie_id = str(Culture.objects.get(id=task.culture_id).categorie_id)

        index_min_value = 0 if culture_id in olives_ids else (
            index_min if culture_categorie_id == '772ca459-b7a1-4ea8-93ca-2938f45014e2' else index_min / 2)
        index_max_value = index_max * 0.9 if culture_id in olives_ids else index_max

        for index in (index_left, index_right):
            index.update({
                "max": index_max_value,
                "min": index_min_value,
                "percentile": [index_min_value, index_max_value]
            })

        return Response({
            "message": "Histogram created successfully",
            "data": index_left
        }, status=status.HTTP_200_OK)

    except ObjectDoesNotExist:
        return Response({"error": "Task not found"}, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(["GET"])
@permission_classes([AllowAny])
def ListInvoice(request, id_user):
    data = UserAccount.objects.get(id=id_user)
    invoices = PdfInvoice.objects.filter(user=id_user).order_by("startDate")
    serializer = PdfInvoiceSerializer(invoices, many=True)

    return Response(
        {
            "message": "Project list invoices successfully",
            "data": serializer.data,
        },
        status=200,
    )

@api_view(["GET"])
@permission_classes([AllowAny])
def getAllTasks(request):
    tasks = Task.objects.all().order_by('task_name')
    serializer = TaskSerializer(tasks, many=True)
    return Response(
        {
            "message": "get tasks types succeed !",
            "data": serializer.data,
        },
        status=status.HTTP_200_OK,
    )




@api_view(['GET'])
@permission_classes([AllowAny])
def export_users_fields_excel(request):
    wb = Workbook()
    ws = wb.active
    ws.title = "Users Fields List"

    headers = ['User Name','User Email', 'Task ID', 'Task Name_fr', 'Density Name',"Variety Name", 'Age','Nombre d\'arbre par hectar','Nombre d\'arbre totale'  ]
    header_fill = PatternFill(start_color='CCE5FF', end_color='CCE5FF', fill_type='solid')

    for col, header in enumerate(headers, 1):
        cell = ws.cell(row=1, column=col)
        cell.value = header
        cell.fill = header_fill

    users = User.objects.filter(is_authorized=True).order_by('-created')

    row = 2

    for user in users:


        projects = Project.objects.filter(user=user)

        for project in projects:
            tasks = Task.objects.filter(project=project)

            for task in tasks:
                task_name_fr = task.task_name

                density_name = task.density.name_fr if task.density else None
                variety_name = task.variety.name_fr if task.variety else None

                ws.cell(row=row, column=1, value=f'{user.firstname} {user.lastname}')
                ws.cell(row=row, column=2, value=user.email)
                ws.cell(row=row, column=3, value=str(task.id))
                ws.cell(row=row, column=4, value=task_name_fr)
                ws.cell(row=row, column=5, value=density_name)
                ws.cell(row=row, column=6, value=variety_name)
                ws.cell(row=row, column=7, value=task.age)
                ws.cell(row=row, column=8, value=task.nbTreesPerHectare)
                ws.cell(row=row, column=9, value=task.nbTree)

                row += 1

    for column in ws.columns:
        max_length = 0
        column_letter = openpyxl.utils.get_column_letter(column[0].column)
        for cell in column:
            try:
                if len(str(cell.value)) > max_length:
                    max_length = len(str(cell.value))
            except:
                pass
        adjusted_width = (max_length + 2)
        ws.column_dimensions[column_letter].width = adjusted_width

    excel_file = io.BytesIO()
    wb.save(excel_file)
    excel_file.seek(0)

    filename = f'users_fields_{timezone.datetime.now().strftime("%Y%m%d_%H%M%S")}.xlsx'

    response = HttpResponse(
        excel_file.read(),
        content_type='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    )
    response['Content-Disposition'] = f'attachment; filename="{filename}"'
    return response

@api_view(["GET"])
@permission_classes([AllowAny])
def TaskUpdateNbTreePerHectar(request):
    non_tree_culture_ids = Culture.objects.exclude(categorie_id="3693ad25-cec5-4e66-8906-04568a21ebf8").values_list(
        "id", flat=True)
    cultures_ids_exclude=list[non_tree_culture_ids]
    densitys = Density.objects.exclude(culture__id__in=cultures_ids_exclude).values('id', 'name_ar')

    split_densitys = []
    for density in densitys:
        name_ar_lower = density["name_ar"].lower()
        if 'x' in name_ar_lower:
            first_part, second_part = name_ar_lower.split('x', 1)
        else:
            first_part, second_part = name_ar_lower, ""

        first_part = first_part.replace(',', '.')
        second_part = second_part.replace(',', '.')

        inter_ligne_match = re.search(r'\d+(\.\d+)?', first_part)
        intrat_ligne_match = re.search(r'\d+(\.\d+)?', second_part)

        inter_ligne = float(inter_ligne_match.group(0)) if inter_ligne_match else None
        intra_ligne = float(intrat_ligne_match.group(0)) if intrat_ligne_match else None
        if inter_ligne is not None and intra_ligne is not None:
            tasks = Task.objects.filter(density=density['id'])
            for task in tasks:
                task.nbTree = math.floor(float(task.surface)*10000 / (float(inter_ligne) * float(intra_ligne)))
                task.nbTreesPerHectare = math.floor(10000 / (float(inter_ligne) * float(intra_ligne)))
                task.save()
    return Response(
        {
            "message": "NB Tree update succesful",
            #"data": tasks,
        },
        status=status.HTTP_200_OK,
    )

def updateTreeCountAndTreeCountPerHectar(task_id):
    non_tree_culture_ids = Culture.objects.exclude(categorie_id="3693ad25-cec5-4e66-8906-04568a21ebf8").values_list(
        "id", flat=True)
    cultures_ids_exclude=list[non_tree_culture_ids]
    task = Task.objects.get(id=task_id)
    culture=Culture.objects.get(id=task.culture.id)
    density=Density.objects.get(id=task.density.id)
    density_serializer = CultureSerializer(density)

    if str(culture.id) not in cultures_ids_exclude:
        name_fr_lower = density.name_fr.lower() if hasattr(density, 'name_fr') else ""
        if 'x' in name_fr_lower:
            first_part, second_part = name_fr_lower.split('x', 1)
        else:
            first_part, second_part = name_fr_lower, ""

        first_part = first_part.replace(',', '.')
        second_part = second_part.replace(',', '.')

        inter_ligne_match = re.search(r'\d+(\.\d+)?', first_part)
        intrat_ligne_match = re.search(r'\d+(\.\d+)?', second_part)

        inter_ligne = float(inter_ligne_match.group(0)) if inter_ligne_match else None
        intra_ligne = float(intrat_ligne_match.group(0)) if intrat_ligne_match else None
        if inter_ligne is not None and intra_ligne is not None:
            task.nbTree = math.floor(float(task.surface) * 10000 / (float(inter_ligne) * float(intra_ligne)))
            task.nbTreesPerHectare = math.floor(10000 / (float(inter_ligne) * float(intra_ligne)))
            task.save()
    return None




@api_view(["POST"])
@permission_classes([AllowAny])
def GetIndexDifference(request):
    try:
        task_id = request.data.get("id")
        dates = request.data.get("dates")
        index = request.data.get("index")
        
        task = Task.objects.get(id=task_id)
        
        diff_results = calculate_index_difference(task, dates, index)
        
        return Response({"message":"success", "data":diff_results})
        
        # return dates_indices
    
    except Task.DoesNotExist:
        return Response({"message": "Task not found"}, status=status.HTTP_404_NOT_FOUND)
        
        
    except Exception as e:
        print(e)
        return Response({"error":"Index difference processing failed"})



@api_view(["GET"])
@permission_classes([AllowAny])
def AddShowNotificationTask(request):
    tasks = Task.objects.all()
    created_notifications = []
    for task in tasks:
        if not ShowNotificationsTask.objects.filter(task=task).exists():
            notification = ShowNotificationsTask.objects.create(
                task=task,
                showForcastNotification=True,
                showPatternNotification=True,
                showAutoPatternNotification=True,
                showSoilHumidityNotification=True,
            )
            created_notifications.append(notification)

    serializer = ShowNotificationsTaskSerializer(created_notifications, many=True)

    return Response({"message": "success", "data": serializer.data})


@api_view(["GET"])
@permission_classes([AllowAny])
def List_Culture_By_Category(request):
    lang = request.GET.get('lang', 'en')

    priority_ids = [
        "7bd57d1b-428f-4f09-b7c0-45ef023eb110",
        "0c838d48-b13c-4a8e-be50-ba10d25b595c",
        "1310a36d-fdb9-4136-812e-187b659cccde",
        "044fd8d9-cf55-401c-b725-b9be64315189",
        "11667744-3f77-461c-9491-03b0eafdf1c1",
        "047088cd-3647-4ae5-b37f-19b19af49aaf",
        "e0af04c8-b518-460a-902f-1f42e4b8a449",
        "5e8b58af-d478-46e1-83c6-a6b2407766a0",
    ]
    other_culture_id = "b4a97e64-b78d-45ba-8cc4-a9e1bef219a0"

    def sort_cultures(cultures):
        def sort_key(culture):
            if str(culture.id) in priority_ids:
                return (0, priority_ids.index(str(culture.id)))
            if str(culture.id) == other_culture_id:
                return (2, culture.name.lower())
            return (1, culture.name.lower())

        return sorted(cultures, key=sort_key)

    name_field = f'name_{lang}'
    categories = CultureCategories.objects.all().annotate(
        name=F(name_field)
    )

    result = []
    for category in categories:
        category_cultures = Culture.objects.filter(categorie=category).annotate(
            name=F(name_field)
        )

        sorted_cultures = sort_cultures(category_cultures)

        serialized_cultures = [
            {
                'id': str(culture.id),
                'name': culture.name,
                'created': culture.created,
                'modified': culture.modified
            }
            for culture in sorted_cultures
        ]

        # Add category with its sorted cultures
        result.append({
            'id': str(category.id),
            'name': category.name,
            'created': category.created,
            'modified': category.modified,
            'cultures': serialized_cultures
        })

    return Response(
        {
            "message": "Categories with cultures retrieved successfully",
            "data": result
        },
        status=200
    )


@api_view(["GET"])
@permission_classes([AllowAny])
def getNonTreeCulturesIds(request):
    non_tree_culture_ids = Culture.objects.exclude(categorie_id="3693ad25-cec5-4e66-8906-04568a21ebf8").values_list(
        "id", flat=True)


    return Response(
        {
            "message": "Non tree culture render  successfully",
            "data": list(non_tree_culture_ids)
        },
        status=200
    )


@api_view(["GET"])
@permission_classes([AllowAny])
def getLastDateImages(request, id_user):
    tasks = Task.objects.filter(project__user_id=id_user).values('id', 'task_name', 'area_of_interest')
    result = []

    for task in tasks:
        polygon = cordinates_to_polygon(task['area_of_interest'][0])
        last_date = get_available_dates(polygon)["last_date"]
        last_histogram = Histogram.objects.filter(task_id=task['id']).order_by('-date').first()
        last_histogram_date = last_histogram.date if last_histogram else None

        if last_date and last_histogram_date:
            if isinstance(last_date, str):
                from datetime import datetime
                last_date_obj = datetime.strptime(last_date, '%Y-%m-%d').date()
            else:
                last_date_obj = last_date

            most_recent_date = max(last_date_obj, last_histogram_date)
            most_recent_date = most_recent_date.strftime('%Y-%m-%d') if isinstance(last_date, str) else most_recent_date
        elif last_date:
            most_recent_date = last_date
        else:
            most_recent_date = last_histogram_date

        result.append({
            "id": task['id'],
            "task_name": task['task_name'],
            "most_recent_date": most_recent_date
        })

    result.sort(key=lambda item: (
        datetime.min if not item.get('most_recent_date') else
        datetime.strptime(item['most_recent_date'], '%Y-%m-%d') if isinstance(item.get('most_recent_date'), str) else
        item['most_recent_date']
    ), reverse=True)

    return Response(
        {
            "message": "Non tree culture render successfully",
            "data": result
        },
        status=200
    )