import React, { useEffect, useState, useRef } from "react";
import GeoRasterLayer from "georaster-layer-for-leaflet";
import { useSelector } from "react-redux";
import {colormap} from "../../utils/colorMap";

const MapViewComparisionRight = ({ Map }) => {
    var parse_georaster = require("georaster");

    const tif_path = useSelector((state) => state.histogramReducer.tif_path_right);
    const min = useSelector((state) => state.histogramReducer.min_right);
    const max = useSelector((state) => state.histogramReducer.max_right);
    const loading = useSelector((state) => state.histogramReducer.loading_right);
    const [georaster, setGeoraster] = useState(null);
    const newLayerRef = useRef(null);
    const selected_date_right = useSelector((state) => state.mapReducer.SelectedDateRight);
    const selected_date_left = useSelector((state) => state.mapReducer.SelectedDateLeft);
    const [selectedDateRight, setSelectedDateRight] = useState(selected_date_right);
    const [selectedDateLeft, setSelectedDateLeft] = useState(selected_date_left);
    useEffect(() => {
        setSelectedDateRight(selected_date_right)
    }, [selected_date_right]);
    useEffect(() => {
        setSelectedDateLeft(selected_date_left)
    }, [selected_date_left]);
    useEffect(() => {
        if (!tif_path || !Map || loading) return;

        const fetchAndSetLayer = async () => {
            try {
                const fullpath = `${process.env.REACT_APP_API_URL}${tif_path}`;
                const response = await fetch(fullpath);
                const arrayBuffer = await response.arrayBuffer();
                const parsedGeoraster = await parse_georaster(arrayBuffer);

                setGeoraster(parsedGeoraster);

                const newLayer = createGeoRasterLayer(parsedGeoraster, min, max);
                newLayerRef.current = newLayer;

                addNewLayer();
            } catch (error) {
                console.error("Error fetching or parsing GeoTIFF:", error);
            }
        };

        fetchAndSetLayer();
    }, [tif_path, loading,min,max,selectedDateLeft,selectedDateRight]);

    useEffect(() => {
        if (!georaster || !Map || !min || !max || loading) return;

        if (newLayerRef.current) {
            removeCurrentLayer(() => {
                addNewLayer();
            });
        }
    }, [min, max, georaster, loading,selectedDateLeft,selectedDateRight]);

    const addNewLayer = () => {
        if (newLayerRef.current) {
            Map.addLayer(newLayerRef.current);
            setTimeout(() => {
                newLayerRef.current = null;
            }, 0);
        }
    };

    const removeCurrentLayer = (callback) => {
        Map.eachLayer((layer) => {
            if (layer.options.name === "geoRaster") {
                Map.removeLayer(layer);
            }
        });
        if (callback) callback();
    };

    const createGeoRasterLayer = (georaster, min, max) => {
        return new GeoRasterLayer({
            georaster: georaster,
            opacity: 1,
            name: "geoRaster",
            pixelValuesToColorFn: (values) => {
                const ndviValue = values[0];

                if (isNaN(ndviValue)) {
                    return "";
                }
                const clampedValue = Math.min(Math.max(ndviValue, min), max);
                const normalizedValue = (clampedValue - min) / (max - min);
                const colormapIndex = Math.floor(
                    normalizedValue * (colormap.rdylgn.length - 1)
                );
                const color = colormap.rdylgn[colormapIndex];
                if (!color) {
                    return "rgb(165, 0, 38, 255)";
                }
                return `rgb(${color[0]}, ${color[1]}, ${color[2]})`;
            },
            resolution: 128,
            debugLevel: 1,
        });
    };

    return null;
};

export default MapViewComparisionRight;
