import React, { useEffect, useState, useRef } from "react";
import GeoRasterLayer from "georaster-layer-for-leaflet";
import { useSelector } from "react-redux";
import L from "leaflet";

const MapView = ({ Map }) => {
  var parse_georaster = require("georaster");

  const tif_path = useSelector((state) => state.histogramReducer.tif_path);
  const checkboxLayers = useSelector((state) => state.mapReducer.checkboxLayers);
  const demCheckboxState = useSelector((state) => state.mapReducer.demCheckboxState);
  const DetailVegetationLayers = useSelector((state) => state.mapReducer.DetailVegetationLayers);
  const min = useSelector((state) => state.histogramReducer.min);
  const max = useSelector((state) => state.histogramReducer.max);
  const loading = useSelector((state) => state.histogramReducer.loading);
  const cmap = useSelector((state) => state.histogramReducer.cmap);
  const cmapProductivity = useSelector(
      (state) => state.histogramReducer.cmapProductivity
  );

  const activeTab = useSelector((state) => state.histogramReducer.activeTab);
  const [georaster, setGeoraster] = useState(null);
  const newLayerRef = useRef(null);
  const [terrainModel, setTerrainModel] = useState(null);
  const [isDEMChecked, setIsDEMChecked] = useState(false);

  useEffect(() => {
    setTerrainModel(DetailVegetationLayers?.terrain_model || null);
    setIsDEMChecked(demCheckboxState)
  }, [demCheckboxState, DetailVegetationLayers]);

  useEffect(() => {
    if (!tif_path || !checkboxLayers) {
      removeCurrentLayer();
      return;
    }
    if (!Map || loading) return;

    const fetchAndSetLayer = async () => {
      try {
        const fullpath = isDEMChecked
            ? `${process.env.REACT_APP_API_URL}${terrainModel.tif_file}`
            : `${process.env.REACT_APP_API_URL}${tif_path}`;
        const response = await fetch(fullpath);

        const arrayBuffer = await response.arrayBuffer();

        const parsedGeoraster = await parse_georaster(arrayBuffer);

        setGeoraster(parsedGeoraster);

        const newLayer = createGeoRasterLayer(parsedGeoraster);

        newLayerRef.current = newLayer;

        if (newLayer.getElement() && newLayer.getElement().complete) {
          addNewLayer();
        } else {
          newLayer.once("load", addNewLayer);
        }
      } catch (error) {
        console.error("Error fetching or parsing GeoTIFF:", error);
      }
    };

    fetchAndSetLayer();
  }, [tif_path, loading, checkboxLayers, min, max, cmap, cmapProductivity,isDEMChecked]);

  useEffect(() => {
    if (!georaster || !Map || loading) return;

    if (newLayerRef.current) {
      removeCurrentLayer(() => {
        addNewLayer();
      });
    }
  }, [georaster, loading, checkboxLayers]);

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


  const createGeoRasterLayer = (georaster) => {
    return new GeoRasterLayer({
      georaster: georaster,
      opacity: 1,
      name: "geoRaster",
      pixelValuesToColorFn: (values) => {

        if (isDEMChecked) {
          try {
            const ndviValue = values.length > 0 ? values[0] : NaN;

            if (ndviValue == null || isNaN(ndviValue)) {
              console.warn('Invalid NDVI value - skipping coloration');
              return 'transparent';
            }

            const colmap = terrainModel?.colormap;
            if (!colmap || colmap.length === 0) {
              console.error('Invalid or empty colormap');
              return 'transparent';
            }

            const minVal =terrainModel.min;
            const maxVal = terrainModel.max;
            const clampedValue = Math.min(Math.max(ndviValue, minVal), maxVal);
            const normalizedValue = (clampedValue - minVal) / (maxVal - minVal);
            const colormapIndex = Math.max(
                0,
                Math.min(
                    Math.floor(normalizedValue * (colmap.length - 1)),
                    colmap.length - 1
                )
            );

            const color = colmap[colormapIndex];

            if (!color) {
              console.warn(`No color found for index ${colormapIndex}`);
              return 'transparent';
            }

            return `rgb(${color[0]}, ${color[1]}, ${color[2]})`;

          } catch (error) {
            console.error('Error in DEM color mapping:', error);
            return 'transparent';
          }
        }

        if (checkboxLayers === "RGB") {
          if (values.length === 4) {
            const r = values[0];
            const g = values[1];
            const b = values[2];
            const a = values[3];
            return `rgba(${r}, ${g}, ${b}, ${a/255})`;
          } else if (values.length === 3) {
            const r = values[0];
            const g = values[1];
            const b = values[2];
            if (r === 0 && g === 0 && b === 0) {
              return "";
            }
            return `rgb(${r}, ${g}, ${b})`;
          }
        }

        const ndviValue = values[0];

        if (isNaN(ndviValue)) {
          return "";
        }

        let colormapIndex;
        const clampedValue = Math.min(Math.max(ndviValue, min), max);
        const normalizedValue = (clampedValue - min) / (max - min);

        if (activeTab === 3) {
          colormapIndex = Math.floor(
              normalizedValue * (cmapProductivity.length - 1)
          );
          const color = cmapProductivity[colormapIndex];
          if (!color) {
            return "rgb(165, 0, 38, 255)";
          }
          return `rgb(${color[0]}, ${color[1]}, ${color[2]})`;
        } else {
          colormapIndex = Math.floor(normalizedValue * (cmap.length - 1));
          const color = cmap[colormapIndex];

          if (!color) {
            return "rgb(165, 0, 38, 255)";
          }
          return `rgb(${color[0]}, ${color[1]}, ${color[2]})`;
        }
      },
      resolution: 128,
      debugLevel: 1,
    });
  };
  return null;
};

export default MapView;
