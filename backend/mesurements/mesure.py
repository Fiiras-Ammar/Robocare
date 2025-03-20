import ee
from django.http import JsonResponse
import matplotlib.cm as cm
import matplotlib.colors as colors
import json
from matplotlib import colors
import matplotlib.colors as colors
from . import params as service_account
from datetime import date, datetime, timedelta
from dateutil.relativedelta import relativedelta
from decimal import Decimal
import numpy as np

from .formulas import algos

credentials = ee.ServiceAccountCredentials(
    service_account.private_key, service_account.private_key
)
ee.Initialize(credentials)


def ndvi_layer(coords_swapped, start_date, end_date):
    polygon = ee.Geometry.Polygon(coords_swapped)
    # Load Sentinel 2 surface reflectance imagery
    image = (
        ee.ImageCollection("COPERNICUS/S2_SR_HARMONIZED")
        .filterDate(start_date, end_date)
        .filterBounds(polygon)
        .sort("CLOUD_COVERAGE_ASSESSMENT")
        .first()
        .clip(polygon)
    )
    # Calculate the NDVI
    ndvi = image.normalizedDifference(["B8", "B4"])
    ndvi_list = ndvi.reduceRegion(ee.Reducer.toList(), polygon).get("nd")
    ndvi_json = json.dumps(ndvi_list.serialize())
    # print("ndv_list",ndvi_list)
    # min_ndvi = ndvi.reduceRegion(**{
    #     'reducer': ee.Reducer.min(),
    #     'geometry': polygon,
    #     'scale': 10
    # }).get('nd')

    # max_ndvi = ndvi.reduceRegion(**{
    #     'reducer': ee.Reducer.max(),
    #     'geometry': polygon,
    #     'scale': 10
    # }).get('nd')
    # palette = ['FFFFFF', 'CE7E45', 'DF923D', 'F1B555', 'FCD163', '99B718',
    #            '74A901', '66A000', '529400', '3E8601', '207401', '056201',
    #            '004C00', '023B01', '012E01', '011D01', '011301']

    # min = min_ndvi.getInfo()
    # max = max_ndvi.getInfo()

    # colormap = cm.get_cmap('RdYlGn')
    # # print(interval)
    # color_list = [colors.rgb2hex(colormap(i)[:3]) for i in range(colormap.N)]
    # # color_list = [colors.rgb2hex(colormap(i)[:3]) for i in np.linspace(0, 1, num_steps)]
    # visualization = {
    #     'min': min,
    #     'max': max,
    #     'palette': color_list,
    #     'opacity': 1.0,
    #     'bands': ['nd'],
    # }
    # mapid = ndvi.getMapId(visualization)
    # tile_url = "https://earthengine.googleapis.com/v1alpha/{}/tiles/{{z}}/{{x}}/{{y}}".format(
    #     mapid['mapid'])
    res = {
        # "url": tile_url,
        # "cords": coords_swapped,
        # "designation": "Vegetation index",
        "list": ndvi_json
    }
    return res


def ndvi_map(coords_swapped, start_date, end_date, indice, provider):
    polygon = ee.Geometry.Polygon(coords_swapped)
    print("provider", provider)
    if provider == "S2":
        image = (
            ee.ImageCollection("COPERNICUS/S2_SR_HARMONIZED")
            .filterDate(start_date, end_date)
            .filterBounds(polygon)
            .sort("CLOUD_COVERAGE_ASSESSMENT")
            .first()
            .clip(polygon)
        )
        ndvi = image.normalizedDifference(["B8", "B4"]).rename("NDVI")
    elif provider == "L8":
        image = (
            ee.ImageCollection("LANDSAT/LC08/C02/T1_TOA")
            .filterDate(start_date, end_date)
            .filterBounds(polygon)
            .sort("CLOUD_COVERAGE_ASSESSMENT")
            .first()
            .clip(polygon)
        )
        ndvi = image.normalizedDifference(["B5", "B4"]).rename("NDVI")
    else:
        image = (
            ee.ImageCollection("LANDSAT/LC09/C02/T1_TOA")
            .filterDate(start_date, end_date)
            .filterBounds(polygon)
            .sort("CLOUD_COVERAGE_ASSESSMENT")
            .first()
            .clip(polygon)
        )
        ndvi = image.normalizedDifference(["B5", "B4"]).rename("NDVI")

    resampled = ndvi.resample("bicubic")

    # Calculate the minimum value
    if provider == "S2":
        min_ndvi = ndvi.reduceRegion(
            **{"reducer": ee.Reducer.min(), "geometry": polygon, "scale": 10}
        )

        max_ndvi = ndvi.reduceRegion(
            **{"reducer": ee.Reducer.max(), "geometry": polygon, "scale": 10}
        )
        mean_ndvi = ndvi.reduceRegion(
            **{"reducer": ee.Reducer.mean(), "geometry": polygon, "scale": 10}
        )
    else:
        min_ndvi = ndvi.reduceRegion(
            **{"reducer": ee.Reducer.min(), "geometry": polygon, "scale": 30}
        )

        max_ndvi = ndvi.reduceRegion(
            **{"reducer": ee.Reducer.max(), "geometry": polygon, "scale": 30}
        )
        mean_ndvi = ndvi.reduceRegion(
            **{"reducer": ee.Reducer.mean(), "geometry": polygon, "scale": 10}
        )

    min = min_ndvi.getInfo()
    max = max_ndvi.getInfo()
    mean = mean_ndvi.getInfo()
    min = min["NDVI"]
    max = max["NDVI"]
    mean = mean["NDVI"]
    print("min ndvi", min)
    print("max ndvi", max)
    print("meain ndvi", mean)

    minByType = min
    maxByType = max
    indicemin = 0
    indicemax = 0
    if indice["min"] is not None:
        indicemin = Decimal(indice["min"])

    if indice["max"] is not None:
        indicemax = Decimal(indice["max"])

    if indicemin != 0:
        minByType = indicemin
    if indicemax != 0:
        maxByType = indicemax

    print("max ndvi : ", minByType)
    print("max ndvi : ", maxByType)
    colormap = cm.get_cmap("RdYlGn")
    color_list = [colors.rgb2hex(colormap(i)[:3]) for i in range(colormap.N)]
    visualization = {
        "min": str(minByType),
        "max": str(maxByType),
        "palette": color_list,
        "opacity": 1.0,
        "bands": ["NDVI"],
    }
    mapid = resampled.getMapId(visualization)
    tile_url = (
        "https://earthengine.googleapis.com/v1alpha/{}/tiles/{{z}}/{{x}}/{{y}}".format(
            mapid["mapid"]
        )
    )
    res = {
        "url": tile_url,
        # "cords": coords_swapped,
        "designation": "Vegetation index",
        "min": min,
        "max": max,
    }
    return res


def service_ndvi_map(coords_swapped):
    polygon = ee.Geometry.Polygon(coords_swapped)
    image = (
        ee.ImageCollection("COPERNICUS/S2_SR_HARMONIZED")
        .filterBounds(polygon)
        .filterMetadata("CLOUD_COVERAGE_ASSESSMENT", "less_than", 10)
        .map(maskS2clouds2)
        .first()
        .clip(polygon)
    )
    # Calculate the NDVI
    ndvi = image.normalizedDifference(["B8", "B4"]).rename("NDVI")
    resampled = ndvi.resample("bicubic")

    # Calculate the minimum value
    min_ndvi = ndvi.reduceRegion(
        **{"reducer": ee.Reducer.min(), "geometry": polygon, "scale": 10}
    )

    max_ndvi = ndvi.reduceRegion(
        **{"reducer": ee.Reducer.max(), "geometry": polygon, "scale": 10}
    )
    min = min_ndvi.getInfo()
    max = max_ndvi.getInfo()
    min = min["NDVI"]
    max = max["NDVI"]
    print("min ndvi", min)
    print("max ndvi", max)

    colormap = cm.get_cmap("RdYlGn")
    color_list = [colors.rgb2hex(colormap(i)[:3]) for i in range(colormap.N)]
    visualization = {
        "min": min,
        "max": max,
        "palette": color_list,
        "opacity": 1.0,
        "bands": ["NDVI"],
    }
    mapid = resampled.getMapId(visualization)
    tile_url = (
        "https://earthengine.googleapis.com/v1alpha/{}/tiles/{{z}}/{{x}}/{{y}}".format(
            mapid["mapid"]
        )
    )
    res = {
        "url": tile_url,
        # "cords": coords_swapped,
        "designation": "Vegetation index",
        "min": min,
        "max": max,
    }
    return res


def ndre_map(coords_swapped, start_date, end_date, indice):
    polygon = ee.Geometry.Polygon(coords_swapped)
    # Load Sentinel 2 surface reflectance imagery
    image = (
        ee.ImageCollection("COPERNICUS/S2_SR_HARMONIZED")
        .filterDate(start_date, end_date)
        .filterBounds(polygon)
        .sort("CLOUD_COVERAGE_ASSESSMENT")
        .first()
        .clip(polygon)
    )
    # Calculate the NDRE

    ndre = image.normalizedDifference(["B8", "B5"]).rename("NDRE")
    resampled = ndre.resample("bicubic")

    min_ndre = ndre.reduceRegion(
        **{"reducer": ee.Reducer.min(), "geometry": polygon, "scale": 10}
    )

    max_ndre = ndre.reduceRegion(
        **{"reducer": ee.Reducer.max(), "geometry": polygon, "scale": 10}
    )
    min = min_ndre.getInfo()
    max = max_ndre.getInfo()
    min = min["NDRE"]
    max = max["NDRE"]
    print("ndre", min)
    print("ndre", max)

    minByType = min
    maxByType = max
    indicemin = 0
    indicemax = 0
    if indice["min"] is not None:
        indicemin = Decimal(indice["min"])

    if indice["max"] is not None:
        indicemax = Decimal(indice["max"])

    if indicemin != 0:
        minByType = indicemin
    if indicemax != 0:
        maxByType = indicemax

    colormap = cm.get_cmap("RdYlGn")
    # # print(interval)
    color_list = [colors.rgb2hex(colormap(i)[:3]) for i in range(colormap.N)]
    # # color_list = [colors.rgb2hex(colormap(i)[:3]) for i in np.linspace(0, 1, num_steps)]
    visualization = {
        "min": str(minByType),
        "max": str(maxByType),
        "palette": color_list,
        "opacity": 1.0,
        "bands": ["NDRE"],
        # 'class_intervals': interval
    }
    mapid = resampled.getMapId(visualization)
    tile_url = (
        "https://earthengine.googleapis.com/v1alpha/{}/tiles/{{z}}/{{x}}/{{y}}".format(
            mapid["mapid"]
        )
    )
    res = {"url": tile_url, "designation": "Nitrogen Map", "min": min, "max": max}
    return res


def service_ndre_map(coords_swapped):
    polygon = ee.Geometry.Polygon(coords_swapped)
    # Load Sentinel 2 surface reflectance imagery
    image = (
        ee.ImageCollection("COPERNICUS/S2_SR_HARMONIZED")
        .filterBounds(polygon)
        .filterMetadata("CLOUD_COVERAGE_ASSESSMENT", "less_than", 10)
        .map(maskS2clouds2)
        .first()
        .clip(polygon)
    )

    ndre = image.normalizedDifference(["B8", "B5"]).rename("NDRE")
    resampled = ndre.resample("bicubic")

    min_ndre = ndre.reduceRegion(
        **{"reducer": ee.Reducer.min(), "geometry": polygon, "scale": 10}
    )

    max_ndre = ndre.reduceRegion(
        **{"reducer": ee.Reducer.max(), "geometry": polygon, "scale": 10}
    )
    min = min_ndre.getInfo()
    max = max_ndre.getInfo()
    min = min["NDRE"]
    max = max["NDRE"]
    print("ndre", min)
    print("ndre", max)

    colormap = cm.get_cmap("RdYlGn")
    color_list = [colors.rgb2hex(colormap(i)[:3]) for i in range(colormap.N)]
    visualization = {
        "min": min,
        "max": max,
        "palette": color_list,
        "opacity": 1.0,
        "bands": ["NDRE"],
        # 'class_intervals': interval
    }
    mapid = resampled.getMapId(visualization)
    tile_url = (
        "https://earthengine.googleapis.com/v1alpha/{}/tiles/{{z}}/{{x}}/{{y}}".format(
            mapid["mapid"]
        )
    )
    res = {"url": tile_url, "designation": "Nitrogen Map", "min": min, "max": max}
    return res


def ndwi_map(coords_swapped, start_date, end_date, indice, provider):
    polygon = ee.Geometry.Polygon(coords_swapped)
    # Load Sentinel 2 surface reflectance imagery
    if provider == "S2":
        image = (
            ee.ImageCollection("COPERNICUS/S2_SR_HARMONIZED")
            .filterDate(start_date, end_date)
            .filterBounds(polygon)
            .sort("CLOUD_COVERAGE_ASSESSMENT")
            .first()
            .clip(polygon)
        )
        # Calculate the NDRE
        ndwi = image.normalizedDifference(["B8", "B3"]).rename("NDWI")
    elif provider == "L8":
        image = (
            ee.ImageCollection("LANDSAT/LC08/C02/T1_TOA")
            .filterDate(start_date, end_date)
            .filterBounds(polygon)
            .sort("CLOUD_COVERAGE_ASSESSMENT")
            .first()
            .clip(polygon)
        )
        # Calculate the NDRE
        ndwi = image.normalizedDifference(["B5", "B3"]).rename("NDWI")
    else:
        image = (
            ee.ImageCollection("LANDSAT/LC09/C02/T1_TOA")
            .filterDate(start_date, end_date)
            .filterBounds(polygon)
            .sort("CLOUD_COVERAGE_ASSESSMENT")
            .first()
            .clip(polygon)
        )
        # Calculate the NDRE
        ndwi = image.normalizedDifference(["B5", "B3"]).rename("NDWI")
    resampled = ndwi.resample("bicubic")

    min_ndwi = ndwi.reduceRegion(
        **{"reducer": ee.Reducer.min(), "geometry": polygon, "scale": 10}
    )
    # print("min_ndwi",min_ndwi)
    max_ndwi = ndwi.reduceRegion(
        **{"reducer": ee.Reducer.max(), "geometry": polygon, "scale": 10}
    )
    min = min_ndwi.getInfo()
    max = max_ndwi.getInfo()
    min = min["NDWI"]
    max = max["NDWI"]

    minByType = min
    maxByType = max
    indicemin = 0
    indicemax = 0
    if indice["min"] is not None:
        indicemin = Decimal(indice["min"])

    if indice["max"] is not None:
        indicemax = Decimal(indice["max"])

    if indicemin != 0:
        minByType = indicemin
    if indicemax != 0:
        maxByType = indicemax

    colormap = cm.get_cmap("RdYlGn")
    # print(interval)
    color_list = [colors.rgb2hex(colormap(i)[:3]) for i in range(colormap.N)]
    # color_list = [colors.rgb2hex(colormap(i)[:3]) for i in np.linspace(0, 1, num_steps)]
    visualization = {
        "min": str(minByType),
        "max": str(maxByType),
        "palette": color_list,
        "opacity": 1.0,
        "bands": ["NDWI"],
        # 'class_intervals': interval
    }
    mapid = resampled.getMapId(visualization)
    tile_url = (
        "https://earthengine.googleapis.com/v1alpha/{}/tiles/{{z}}/{{x}}/{{y}}".format(
            mapid["mapid"]
        )
    )
    res = {"url": tile_url, "designation": "Irrigation index", "min": min, "max": max}
    return res


def service_ndwi_map(coords_swapped):
    polygon = ee.Geometry.Polygon(coords_swapped)
    # Load Sentinel 2 surface reflectance imagery
    image = (
        ee.ImageCollection("COPERNICUS/S2_SR_HARMONIZED")
        .filterBounds(polygon)
        .filterMetadata("CLOUD_COVERAGE_ASSESSMENT", "less_than", 10)
        .map(maskS2clouds2)
        .first()
        .clip(polygon)
    )

    ndwi = image.normalizedDifference(["B8", "B3"]).rename("NDWI")

    resampled = ndwi.resample("bicubic")

    min_ndwi = ndwi.reduceRegion(
        **{"reducer": ee.Reducer.min(), "geometry": polygon, "scale": 10}
    )
    # print("min_ndwi",min_ndwi)
    max_ndwi = ndwi.reduceRegion(
        **{"reducer": ee.Reducer.max(), "geometry": polygon, "scale": 10}
    )
    min = min_ndwi.getInfo()
    max = max_ndwi.getInfo()
    min = min["NDWI"]
    max = max["NDWI"]

    colormap = cm.get_cmap("RdYlGn")
    color_list = [colors.rgb2hex(colormap(i)[:3]) for i in range(colormap.N)]
    visualization = {
        "min": min,
        "max": max,
        "palette": color_list,
        "opacity": 1.0,
        "bands": ["NDWI"],
        # 'class_intervals': interval
    }
    mapid = resampled.getMapId(visualization)
    tile_url = (
        "https://earthengine.googleapis.com/v1alpha/{}/tiles/{{z}}/{{x}}/{{y}}".format(
            mapid["mapid"]
        )
    )
    res = {"url": tile_url, "designation": "Irrigation index", "min": min, "max": max}
    return res


def gci_map(coords_swapped, start_date, end_date, indice, provider):
    polygon = ee.Geometry.Polygon(coords_swapped)
    # Load Sentinel 2 surface reflectance imagery
    if provider == "S2":
        image = (
            ee.ImageCollection("COPERNICUS/S2_SR_HARMONIZED")
            .filterDate(start_date, end_date)
            .filterBounds(polygon)
            .sort("CLOUD_COVERAGE_ASSESSMENT")
            .first()
            .clip(polygon)
        )
        # Calculate the NDRE
        GCI = image.expression(
            "(float ((NIR) / (GREEN)) - 1)",
            {"NIR": image.select("B8"), "GREEN": image.select("B3")},
        ).rename("GCI")
    elif provider == "L8":
        image = (
            ee.ImageCollection("LANDSAT/LC08/C02/T1_TOA")
            .filterDate(start_date, end_date)
            .filterBounds(polygon)
            .sort("CLOUD_COVERAGE_ASSESSMENT")
            .first()
            .clip(polygon)
        )
        # Calculate the NDRE
        GCI = image.expression(
            "(float ((NIR) / (GREEN)) - 1)",
            {"NIR": image.select("B5"), "GREEN": image.select("B3")},
        ).rename("GCI")
    else:
        image = (
            ee.ImageCollection("LANDSAT/LC09/C02/T1_TOA")
            .filterDate(start_date, end_date)
            .filterBounds(polygon)
            .sort("CLOUD_COVERAGE_ASSESSMENT")
            .first()
            .clip(polygon)
        )
        GCI = image.expression(
            "(float ((NIR) / (GREEN)) - 1)",
            {"NIR": image.select("B5"), "GREEN": image.select("B3")},
        ).rename("GCI")
    image = image.addBands(GCI)
    resampled = image.resample("bicubic")
    mean_gci = GCI.reduceRegion(
        **{"reducer": ee.Reducer.mean(), "geometry": polygon, "scale": 10}
    )

    min_gci = GCI.reduceRegion(
        **{"reducer": ee.Reducer.min(), "geometry": polygon, "scale": 10}
    )

    max_gci = GCI.reduceRegion(
        **{"reducer": ee.Reducer.max(), "geometry": polygon, "scale": 10}
    )

    min = min_gci.getInfo()
    max = max_gci.getInfo()
    min = min["GCI"]
    max = max["GCI"]
    print("min_gci", min)
    print("max_gci", max)
    minByType = min
    maxByType = max

    indicemin = 0
    indicemax = 0
    if indice["min"] is not None:
        indicemin = Decimal(indice["min"])

    if indice["max"] is not None:
        indicemax = Decimal(indice["max"])

    if indicemin != 0:
        minByType = indicemin
    if indicemax != 0:
        maxByType = indicemax

    colormap = cm.get_cmap("RdYlGn")
    # print(interval)
    color_list = [colors.rgb2hex(colormap(i)[:3]) for i in range(colormap.N)]
    # color_list = [colors.rgb2hex(colormap(i)[:3]) for i in np.linspace(0, 1, num_steps)]
    visualization = {
        "min": str(minByType),
        "max": str(maxByType),
        "palette": color_list,
        "opacity": 1.0,
        "bands": ["GCI"],
        # 'class_intervals': interval
    }
    mapid = resampled.getMapId(visualization)
    tile_url = (
        "https://earthengine.googleapis.com/v1alpha/{}/tiles/{{z}}/{{x}}/{{y}}".format(
            mapid["mapid"]
        )
    )
    res = {"url": tile_url, "designation": "Plant Health", "min": min, "max": max}
    return res


def psri_map(coords_swapped, start_date, end_date, indice=None):
    polygon = ee.Geometry.Polygon(coords_swapped)
    # Load Sentinel 2 surface reflectance imagery
    image = (
        ee.ImageCollection("COPERNICUS/S2_SR_HARMONIZED")
        .filterDate(start_date, end_date)
        .filterBounds(polygon)
        .sort("CLOUD_COVERAGE_ASSESSMENT")
        .first()
        .clip(polygon)
    )
    # Calculate the NDRE

    psri = image.expression(
        "((R531 - R570) / R470) / ((R531 + R570) / R470)",
        {
            "R531": image.select("B11"),  # 531nm band (near-infrared)
            "R570": image.select("B4"),  # 570nm band (red)
            "R470": image.select("B3"),  # 470nm band (blue)
        },
    ).rename("PSRI")
    resampled = psri.resample("bicubic")

    min_psri = psri.reduceRegion(
        **{"reducer": ee.Reducer.min(), "geometry": polygon, "scale": 10}
    )

    max_psri = psri.reduceRegion(
        **{"reducer": ee.Reducer.max(), "geometry": polygon, "scale": 10}
    )
    min = min_psri.getInfo()
    max = max_psri.getInfo()
    min = min["PSRI"]
    max = max["PSRI"]
    print("PSRI min", min)
    print("PSRI max", max)

    minByType = min
    maxByType = max
    # indicemin = 0
    # indicemax = 0
    # if indice["min"] is not None:
    #     indicemin = Decimal(indice["min"])

    # if indice["max"] is not None:
    #     indicemax = Decimal(indice["max"])

    # if indicemin != 0:
    #     minByType = indicemin
    # if indicemax != 0:
    #     maxByType = indicemax

    colormap = cm.get_cmap("RdYlGn")
    # # print(interval)
    color_list = [colors.rgb2hex(colormap(i)[:3]) for i in range(colormap.N)]
    # # color_list = [colors.rgb2hex(colormap(i)[:3]) for i in np.linspace(0, 1, num_steps)]
    visualization = {
        "min": str(minByType),
        "max": str(maxByType),
        "palette": color_list,
        "opacity": 1.0,
        "bands": ["PSRI"],
        # 'class_intervals': interval
    }
    mapid = resampled.getMapId(visualization)
    tile_url = (
        "https://earthengine.googleapis.com/v1alpha/{}/tiles/{{z}}/{{x}}/{{y}}".format(
            mapid["mapid"]
        )
    )
    res = {"url": tile_url, "designation": "Plant Senescence", "min": min, "max": max}
    return res


def service_gci_map(coords_swapped):
    polygon = ee.Geometry.Polygon(coords_swapped)
    # Load Sentinel 2 surface reflectance imagery
    image = (
        ee.ImageCollection("COPERNICUS/S2_SR_HARMONIZED")
        .filterBounds(polygon)
        .filterMetadata("CLOUD_COVERAGE_ASSESSMENT", "less_than", 10)
        .map(maskS2clouds2)
        .first()
        .clip(polygon)
    )

    GCI = image.expression(
        "(float ((NIR) / (GREEN)) - 1)",
        {"NIR": image.select("B8"), "GREEN": image.select("B3")},
    ).rename("GCI")
    image = image.addBands(GCI)
    resampled = image.resample("bicubic")
    mean_gci = GCI.reduceRegion(
        **{"reducer": ee.Reducer.mean(), "geometry": polygon, "scale": 10}
    )

    min_gci = GCI.reduceRegion(
        **{"reducer": ee.Reducer.min(), "geometry": polygon, "scale": 10}
    )

    max_gci = GCI.reduceRegion(
        **{"reducer": ee.Reducer.max(), "geometry": polygon, "scale": 10}
    )

    min = min_gci.getInfo()
    max = max_gci.getInfo()
    min = min["GCI"]
    max = max["GCI"]

    colormap = cm.get_cmap("RdYlGn")
    color_list = [colors.rgb2hex(colormap(i)[:3]) for i in range(colormap.N)]
    visualization = {
        "min": min,
        "max": max,
        "palette": color_list,
        "opacity": 1.0,
        "bands": ["GCI"],
    }
    mapid = resampled.getMapId(visualization)
    tile_url = (
        "https://earthengine.googleapis.com/v1alpha/{}/tiles/{{z}}/{{x}}/{{y}}".format(
            mapid["mapid"]
        )
    )
    res = {"url": tile_url, "designation": "Plant Health", "min": min, "max": max}
    return res


def rgb_map(coords_swapped, start_date, end_date, provider):
    polygon = ee.Geometry.Polygon(coords_swapped)
    print("providder", provider)
    if provider == "S2":
        image = (
            ee.ImageCollection("COPERNICUS/S2_SR_HARMONIZED")
            .filterBounds(polygon)
            .filterDate(start_date, end_date)
            .select(["B4", "B3", "B2"])
            .first()
            .clip(polygon)
        )
        visualization = {"min": 0.0, "max": 5000, "bands": ["B4", "B3", "B2"]}
    elif provider == "L8":
        image = (
            ee.ImageCollection("LANDSAT/LC08/C02/T1_TOA")
            .filterDate(start_date, end_date)
            .filterBounds(polygon)
            .select(["B4", "B3", "B2"])
            .first()
            .clip(polygon)
        )
        
    else:
        image = (
            ee.ImageCollection("LANDSAT/LC09/C02/T1_TOA")
            .filterDate(start_date, end_date)
            .filterBounds(polygon)
            .select(["B4", "B3", "B2"])
            .first()
            .clip(polygon)
        )
        visualization = {"min": 0.0, "max": 0.4}

    resampled = image.resample("bicubic")
    # visualization = {"min": 0.0, "max": 5000, "bands": ["B4", "B3", "B2"]}
    mapid = resampled.getMapId(visualization)
    tile_url = (
        "https://earthengine.googleapis.com/v1alpha/{}/tiles/{{z}}/{{x}}/{{y}}".format(
            mapid["mapid"]
        )
    )
    res = {"url": tile_url, "designation": "True Color", "min": 0, "max": 0}
    return res


# def psri_map(coords_swapped, start_date, end_date):
#     polygon = ee.Geometry.Polygon(coords_swapped)
#     # Load Sentinel 2 surface reflectance imagery
#     image = (
#         ee.ImageCollection("COPERNICUS/S2_SR_HARMONIZED")
#         .filterBounds(polygon)
#         .filterMetadata("CLOUD_COVERAGE_ASSESSMENT", "less_than", 10)
#         .map(maskS2clouds2)
#         .first()
#         .clip(polygon)
#     )

#     psri = image.expression(
#         "((R531 - R570) / R470)",
#         {
#             "R531": image.select("B11"),  # 531nm band (near-infrared)
#             "R570": image.select("B4"),  # 570nm band (red)
#             "R470": image.select("B3"),  # 470nm band (blue)
#         },
#     ).rename("PSRI")
#     image = image.addBands(psri)
#     resampled = image.resample("bicubic")
#     mean_psri = psri.reduceRegion(
#         **{"reducer": ee.Reducer.mean(), "geometry": polygon, "scale": 10}
#     )

#     min_psri = psri.reduceRegion(
#         **{"reducer": ee.Reducer.min(), "geometry": polygon, "scale": 10}
#     )

#     max_psri = psri.reduceRegion(
#         **{"reducer": ee.Reducer.max(), "geometry": polygon, "scale": 10}
#     )

#     min = min_psri.getInfo()
#     max = max_psri.getInfo()
#     min = min["PSRI"]
#     max = max["PSRI"]

#     colormap = cm.get_cmap("RdYlGn")
#     color_list = [colors.rgb2hex(colormap(i)[:3]) for i in range(colormap.N)]
#     visualization = {
#         "min": min,
#         "max": max,
#         "palette": color_list,
#         "opacity": 1.0,
#         "bands": ["PSRI"],
#     }
#     mapid = resampled.getMapId(visualization)
#     tile_url = (
#         "https://earthengine.googleapis.com/v1alpha/{}/tiles/{{z}}/{{x}}/{{y}}".format(
#             mapid["mapid"]
#         )
#     )
#     res = {"url": tile_url, "designation": "PSRI", "min": min, "max": max}
#     return res


def ndmi_map(coords_swapped, start_date, end_date):
    polygon = ee.Geometry.Polygon(coords_swapped)
    # Load Sentinel 2 surface reflectance imagery
    image = (
        ee.ImageCollection("COPERNICUS/S2_SR_HARMONIZED")
        .filterDate(start_date, end_date)
        .filterBounds(polygon)
        .sort("CLOUD_COVERAGE_ASSESSMENT")
        .first()
        .clip(polygon)
    )
    # Calculate the NDRE

    # Get the projection and scale of the B8 band (10 meters resolution)
    b8_projection = image.select("B8").projection()
    b8_scale = b8_projection.nominalScale()
    # Resample B11 to approximate 10 meters resolution using bilinear interpolation
    resampled_b11 = image.select("B11").resample("bilinear").reproject(b8_projection)
    # Calculate NDMI approximation
    ndmi = image.expression(
        "(nir - swir) / (nir + swir)",
        {"nir": image.select("B8"), "swir": resampled_b11},
    ).rename("NDMI")

    resampled = ndmi.resample("bicubic")

    min_ndmi = ndmi.reduceRegion(
        **{"reducer": ee.Reducer.min(), "geometry": polygon, "scale": 10}
    )
    # print("min_ndwi",min_ndwi)
    max_ndmi = ndmi.reduceRegion(
        **{"reducer": ee.Reducer.max(), "geometry": polygon, "scale": 10}
    )
    min = min_ndmi.getInfo()
    max = max_ndmi.getInfo()
    min = min["NDMI"]
    max = max["NDMI"]

    # minByType = min-0.1
    # maxByType = max*0.9
    # if (max > 0.45):
    #     maxByType = max
    # # if (cultureLabel == "Olive - Fruit"):
    # #     minByType = -1
    # #     maxByType = 1
    # if (cultureLabel == "Olive - huile"):
    #     minByType = 0.15
    #     maxByType = 0.45

    # if (typeLabel == "Agrumes"):
    #     minByType = 0.3
    #     maxByType = 0.7
    # # elif (cultureLabel == "Agrumes - Citron" or cultureLabel == "Agrumes - Pamplemousse" or cultureLabel == "Agrumes - Facile à éplucher" or cultureLabel == "Agrumes - Orange"):
    # #     minByType = 0.464
    # #     maxByType = 0.8659
    # print("culture ndwi : ", cultureLabel)
    minByType = min
    maxByType = max

    colormap = cm.get_cmap("RdYlGn")
    # print(interval)
    color_list = [colors.rgb2hex(colormap(i)[:3]) for i in range(colormap.N)]
    # color_list = [colors.rgb2hex(colormap(i)[:3]) for i in np.linspace(0, 1, num_steps)]
    visualization = {
        "min": str(minByType),
        "max": str(maxByType),
        "palette": color_list,
        "opacity": 1.0,
        "bands": ["NDMI"],
        # 'class_intervals': interval
    }
    mapid = resampled.getMapId(visualization)
    tile_url = (
        "https://earthengine.googleapis.com/v1alpha/{}/tiles/{{z}}/{{x}}/{{y}}".format(
            mapid["mapid"]
        )
    )
    res = {"url": tile_url, "designation": "Soil Moisture", "min": min, "max": max}
    return res


# def maskS2clouds(image):
#     qa = image.select("QA60")
#     # Bits 10 and 11 are clouds and cirrus, respectively.
#     cloudBitMask = 1 << 10
#     cirrusBitMask = 1 << 11
#     # Both flags should be set to zero, indicating clear conditions.
#     mask = qa.bitwiseAnd(cloudBitMask).eq(0).And(qa.bitwiseAnd(cirrusBitMask).eq(0))
#     return image.updateMask(mask).divide(10000)
def maskS2clouds(image):
    """Masks clouds in a Sentinel-2 image using the QA band.

    Args:
        image (ee.Image): A Sentinel-2 image.

    Returns:
        ee.Image: A cloud-masked Sentinel-2 image.
    """
    qa = image.select("QA60")

    # Bits 10 and 11 are clouds and cirrus, respectively.
    cloud_bit_mask = 1 << 10
    cirrus_bit_mask = 1 << 11

    # Both flags should be set to zero, indicating clear conditions.
    mask = qa.bitwiseAnd(cloud_bit_mask).eq(0).And(qa.bitwiseAnd(cirrus_bit_mask).eq(0))

    return image.updateMask(mask).divide(10000)


def maskS2clouds2(image):
    qa = image.select("QA60")
    cloudBitMask = 1 << 10
    cirrusBitMask = 1 << 11
    mask = qa.bitwiseAnd(cloudBitMask).eq(0).And(qa.bitwiseAnd(cirrusBitMask).eq(0))

    return (
        image.updateMask(mask)
        .divide(10000)
        .select("B.*")
        .copyProperties(image, ["system:time_start"])
    )

def get_bands_samples(image, zone, provider):
  test_bands = algos[provider]["bands"]

  sample = image.sampleRectangle(region=zone, defaultValue=0)
  obj = {band : sample.get(band) for band in test_bands}
  return image.set({"bands_samples":ee.Dictionary(obj)})

def calculate_no_data_percentage(samples, provider):
  test_bands = algos[provider]["bands"]
  invalid_ratios = []
  for b in test_bands:
    band_arr = samples[b]
    band = np.array(band_arr)
    size = band.size
    invalid_pixels_count = ((size - np.count_nonzero(band))/ size) * 100
    
    invalid_ratios.append(invalid_pixels_count)
  return(max(invalid_ratios))