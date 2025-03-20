algos = {
    "S2": {
        'NDVI': {
            'expr': '(B8 - B4) / (B8 + B4)',
            'range': (-1, 1),
            'scale': 10,
            'bands': {'B4': 3, 'B8': 5},
            'bands_extracted': {'B4': 1, 'B8': 2},
        },
        'NDRE': {
            'expr': '(B8 - B5) / (B8 + B5)',
            'range': (-1, 1),
            'scale': 10,
            'bands': {'B5': 4, 'B8': 5},

        },
        'NDWI': {
            'expr': '(B8 - B3) / (B8 + B3)',
            'range': (-1, 1),
            'scale': 10,
            'bands': {'B3': 2, 'B8': 5},
        },
        'GCI': {
            'expr': '((B8 / B3) - 1) / ((B8 / B3) + 1)',
            'range': (-1, 1),
            'scale': 10,
            'bands': {'B3': 2, 'B8': 5},
        },
        'PSRI': {
            'expr': '((B11 - B4) / B3) / ((B11 + B4) / B3)',
            'range': (-1, 1),
            'scale': 10,
            'bands': {'B3': 2, 'B4': 3, 'B11': 6},

        },
        'NDMI': {
            'expr': '(B8 - B11) / (B8 + B11)',
            'range': (-1, 1),
            'scale': 10,
            'bands': {'B8': 5, 'B11': 6},

        },
        'RGB': {
            'expr': 'B4 + B3 + B2',
            'range': (0, 255),
            'scale': 10,
            'bands': {'B2': 1, 'B3': 2, 'B4': 3},
        },
        'collection': 'COPERNICUS/S2_SR_HARMONIZED',
        'scale': 10,
        'bands': ["B2", "B3", "B4", "B5", "B8", "B11"]
    },
    "L8": {
        'NDVI': {
            'expr': '(B5 - B4) / (B5 + B4)',
            'range': (-1, 1),
            'scale': 30,
            'bands': {'B4': 3, 'B5': 4},
        },
        'NDWI': {
            'expr': '(B5 - B3) / (B5 + B3)',
            'range': (-1, 1),
            'scale': 30,
            'bands': {'B3': 2, 'B5': 4},
        },
        'GCI': {
            'expr': 'float((((B5) / (B3)) - 1) / (((B5) / (B3)) - 1))',
            'range': (-1, 1),
            'scale': 30,
            'bands': {'B3': 2, 'B5': 4},
        },
        'PSRI': {
            'expr': '((B6 - B4) / B3) / ((B6 + B4) / B3)',
            'range': (-1, 1),
            'scale': 30,
            'bands': {'B3': 2, 'B4': 3, 'B6': 5},
        },

        'NDMI': {
            'expr': '(B5 - B6) / (B5 + B6)',
            'range': (-1, 1),
            'scale': 30,
            'bands': {'B5': 4, 'B6': 5},
        },
        'TrueColor': {
            'expr': 'B4 + B3 + B2',
            'range': (0, 255),
            'scale': 30,
            'bands': {'B2': 1, 'B3': 2, 'B4': 3},
        },
        'collection': 'LANDSAT/LC08/C02/T1_L2',
        'scale': 30,
        'bands': ["SR_B2", "SR_B3", "SR_B4", "SR_B5", "SR_B6"]
    },
    "L9": {
        'NDVI': {
            'expr': '(B5 - B4) / (B5 + B4)',
            'range': (-1, 1),
            'scale': 30,
            'bands': {'B4': 3, 'B5': 4},
        },
        'NDWI': {
            'expr': '(B5 - B3) / (B5 + B3)',
            'range': (-1, 1),
            'scale': 30,
            'bands': {'B3': 2, 'B5': 4},
        },
        'GCI': {
            'expr': 'float((((B5) / (B3)) - 1) / (((B5) / (B3)) - 1))',
            'range': (-1, 1),
            'scale': 30,
            'bands': {'B3': 2, 'B5': 4},
        },
        'PSRI': {
            'expr': '((B6 - B4) / B3) / ((B6 + B4) / B3)',
            'range': (-1, 1),
            'scale': 30,
            'bands': {'B3': 2, 'B4': 3, 'B6': 5},
        },
        'TrueColor': {
            'expr': 'B4 + B3 + B2',
            'range': (0, 255),
            'scale': 30,
            'bands': {'B2': 1, 'B3': 2, 'B4': 3},
        },
        'collection': 'LANDSAT/LC09/C02/T1_L2',
        'scale': 30,
        'bands': ["SR_B2", "SR_B3", "SR_B4", "SR_B5", "SR_B6"]
    },

}
