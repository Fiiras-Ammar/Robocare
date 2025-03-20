    mean_ndvi = ndvi.reduceRegion(**{
        'reducer': ee.Reducer.mean(),
        'geometry': polygon,
        'scale': 10
    }).get('nd')

    # Print the mean NDVI value
    print('Mean NDVI:', mean_ndvi.getInfo())

    min_ndvi = ndvi.reduceRegion(**{
        'reducer': ee.Reducer.min(),
        'geometry': polygon,
        'scale': 10
    }).get('nd')

    max_ndvi = ndvi.reduceRegion(**{
        'reducer': ee.Reducer.max(),
        'geometry': polygon,
        'scale': 10
    }).get('nd')
    palette = ['#a50026', '#d73027', '#f46d43', '#fdae61', '#fee08b',
               '#ffffbf', '#d9ef8b', '#a6d96a', '#66bd63', '#1a9850', '#006837']
    min = min_ndvi.getInfo()
    max = max_ndvi.getInfo()
    num_steps = 10
    step = (max - min) / (num_steps - 1)

    interval = []
    legend_dict = {}
    for i in range(num_steps):
        value = min + i * step
        interval.append(round(value, 2))
        start_value = min + i * step
        end_value = min + (i + 1) * step

    for i in range(10):
        start = min + i * step
        end = min + (i + 1) * step
        key = '{:.2f} - {:.2f}'.format(start, end)
        legend_dict[key] = palette[i]

    ndvi_palette = {'palette': palette, 'min': min,
                    'max': max, 'interval': interval}

    # Convert to an ee.Array and then to a Python list
    ndvi_array = ndvi.toArray().getInfo()
    # print(ndvi_array)

    # ndvi_list = ndvi_array[0]

    # ndvi_layer = {'ndvi': ndvi_list, 'palette': palette,
    #   'min': min, 'max': max, 'interval': interval}
    ndvi_array = ndvi.toArray().getInfo()
    # print(ndvi_array)
    # Convert ndvi to a PNG image
    ndvi_dict = ndvi.toDictionary()
    # print('ndvi.toList',ndvi_arr = ndvi.toList())
# Export the FeatureCollection as GeoJSON
# ndvi_list = np.array(ndvi_array[0]).tolist()
    print(type(ndvi))
    ndvi_ser = ee.Image.serialize(ndvi)
    print(type(ndvi_ser))




@api_view(['POST'])
@permission_classes([AllowAny])
def EE_connection(request):
    poly = request.data.get('polygonCoords')
    
    credentials = ee.ServiceAccountCredentials(
        gee_account.private_key, gee_account.private_key)
    ee.Initialize(credentials)
    polygon = ee.Geometry.Polygon(poly)
    # Load Sentinel 2 surface reflectance imagery
    image = ee.ImageCollection("COPERNICUS/S2_SR_HARMONIZED").filterDate('2023-03-01',
                                                                         '2023-03-07').filterBounds(polygon).sort("CLOUD_COVERAGE_ASSESSMENT").first().clip(polygon)
    # Calculate the NDVI
    # ndvi = image.normalizedDifference(['B8', 'B4'])
    ndvi_image = image.select(
        ['B8', 'B4']).normalizedDifference().rename('NDVI').clip(polygon)
    # token = ee.data.authenticateViaPrivateKey(gee_account.private_key)
    mapid = image.getMapId({'min': 0, 'max': 1})
    print(mapid)
    png = ndvi_image.getDownloadURL()
    print("png",png)
    url = ee.data.getTileUrl(mapid,0,0,0)
    print(url)

    # response_data = {
    #     'ndviMapID': ndvi_image.getMapId({'min': -1, 'max': 1}),
    #     'ndviToken': token
    # }

    data = {
        "url" : url
    }
    return JsonResponse(data)
# Convert the NDVI to a GeoJSON feature collection
# ndvi_fc = ee.Image(ndvi) \
#     .byte() \
#     .addBands(ee.Image(ndvi.gt(0.2)).byte()) \
#     .rename(['ndvi', 'mask']) \
#     .reduceToVectors(**{
#         'geometry': polygon,
#         'scale': 10,
#         'crs': 'EPSG:3857',
#         'geometryType': 'polygon',
#         'eightConnected': False,
#         'labelProperty': 'ndvi',
#         'reducer': ee.Reducer.mean(),
#         'maxPixels': 1e13,
#         'tileScale': 4
#     }) \
#     .filter(ee.Filter.gt('ndvi', 0.2)) \
#     .filter(ee.Filter.neq('label', 1)) \
#     .map(lambda feature: feature.setGeometry(feature.geometry().simplify(10)))


# Convert the GeoJSON feature collection to a JSON string
# ndvi_geojson_str = ndvi_fc.getInfo()
# ndvi_geojson_json = json.dumps(ndvi_geojson_str)
# fc = ee.FeatureCollection(ndvi)

# Return the GeoJSON feature collection as a JSON response
# return HttpResponse(fc)