import React, { useState, useEffect, useRef } from "react";
import "leaflet/dist/leaflet.css";
import "leaflet-draw/dist/leaflet.draw.css";
import "../../assets/css/map.css";
import L from "leaflet";
import { MapContainer, TileLayer, ZoomControl } from "react-leaflet";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import * as esri from "esri-leaflet";
import { EditControl } from "react-leaflet-draw";
import {
  AreaOfInterestizialize,
  AreaSurface,
  loadingBegin,
  loadingEnd,
} from "../../actions/map";
import { useDispatch, useSelector } from "react-redux";
import { OpenStreetMapProvider, GeoSearchControl } from "leaflet-geosearch";
import "../../../node_modules/leaflet-geosearch/dist/geosearch.css";
import Loading from "../../utils/loading";
import NavBar from "../../components/NavBar";
import { ScaleControl } from "react-leaflet";
import FullscreenControl from "../mapUtils/FullscreenControl";
import SideBarAdd from "./----SideBarAdd";
import SnackBarCopieToClipboard from "../../utils/SnackBarCopieToClipboard";
import $ from "jquery";
import { useTranslation } from "react-i18next";
import SidebarAdd from "./sidebars/SidebarAdd";
import SidebarToggleButton from "./sidebars/SidebarToggleButton";
import { Button, duration } from "@mui/material";
import { AiOutlineCheck } from "react-icons/ai";
import { isMobile } from "react-device-detect";
import { add_task } from "../../actions/task";
import FormControl from '@mui/material/FormControl';
import { Checkbox, FormControlLabel } from '@mui/material';
import CustomAddressSearch from './geolocate/customAddressSearch'
import zIndex from "@mui/material/styles/zIndex";
const location_marker = require("../../assets/images/location_marker.png");



const style = { height: "100%", width: "100wh", zIndex: "9" };

const mapParams = {
  center: [34.809, 9.515],
  // center: [35.0484, 10.325],

  zoom: 7,
  maxZoom: 19,
};

const apiKey =
  "AAPK1635806c5df74566bc9567f76c056850HTDo7PM4rZ-SwiEnzxmvAFNfj0zMBrP93MtbHy3q5YarvngZzkftSX-J_31R98B5";
const satelliteLayer = new esri.BasemapLayer("Imagery", {
  apikey: apiKey,
  portalUrl: "https://www.arcgis.com",
  maxZoom: 19,
  attribution: "",
});

const overlays = {
  Satellite: satelliteLayer,
};
const drawnItems = new L.FeatureGroup();

const drawPluginOptions = {
  position: "topright",
  draw: {
    polygon: {
      allowIntersection: false, // Restricts shapes to simple polygons
      //         allowIntersection: false,
      repeatMode: false,
      showArea: true,
      showLength: true,
      drawError: {
        color: "#e1e100", // Color the shape will turn when intersects
        message: "<strong>Polygon draw does not allow intersections!<strong>", // Message that will show when intersect
      },
      shapeOptions: {
        // color: '#bada55'
      },
    },
    polyline: false,
    circle: false, // Turns off this drawing tool
    rectangle: false,
    marker: false,
    circlemarker: false,
  },
  edit: {
    featureGroup: drawnItems, //REQUIRED!!
    remove: true,
  },
};

const drawControl = new L.Control.Draw(drawPluginOptions);

const AddTask = () => {
  const location = useLocation();
  const { state } = location;

  const [Map, setMap] = useState(null);
  const baseLayer = useRef(null);

  const baseMaps = {};
  const [oldLayer, setoldLayer] = useState(null);
  const [layerControl, setLayerControl] = useState(null);
  const [labelsLayer, setlabelsLayer] = useState(null);
  const [opensnack, setopensnack] = useState(false);
  const [message, setmessage] = useState(null);
  const [vertical, setvertical] = useState(null);
  const [horizontal, sethorizontal] = useState(null);
  const [checkDrawing, setcheckDrawing] = useState(false);
  const newLocMarkerRef = useRef(null);


  const clickEventState = useSelector(
    (state) => state.mapReducer.clickEventCheck
  );
  const AreaOfIntrest = useSelector((state) => state.mapReducer.AreaOfIntrest);
  const AreaSurfaceValue = useSelector((state) => state.mapReducer.AreaSurface);
  // useEffect(() => {
  //   if (!AreaSurface) return;
  // }, [AreaSurface]);
  const { t } = useTranslation();
  const [isMobileState, setisMobileState] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  useEffect(() => {
    dispatch(loadingBegin(1));
  }, []);
  useEffect(() => {
    setTimeout(() => dispatch(loadingEnd(0)), 1000);
  }, []);
  useEffect(() => {
    if (isMobile) {
      setisMobileState(true);
    } else {
      setisMobileState(false);
    }
    return () => {
      setisMobileState(false);
    };
  }, []);
  const VegetationLayersState = useSelector(
    (state) => state.mapReducer.VegetationLayers
  );
  let { id_project } = useParams();
  let { project_name } = useParams();

  useEffect(() => {
    if (!Map) return;
    const MarkerImage = require("../../assets/images/marker.png");
    const MarkerIcon = L.icon({
      iconUrl: MarkerImage,
      iconSize: [27, 40],
      iconAnchor: [13.5, 40],
    });
    const popupOptions = {
      closeButton: false,
      autoClose: true,
      className: "cord-popup-copie",
    };
    // const popup = L.popup(popupOptions);
    const marker = L.marker();
    const popup = L.popup(popupOptions);

    marker.setIcon(MarkerIcon);
    if (clickEventState && !checkDrawing) {
      Map.addEventListener("click", (e) => {
        const { lat, lng } = e.latlng;
        if (lat && lng) {
          const position = L.latLng(lat, lng);
          const popupContent = `${lat.toFixed(4)},${lng.toFixed(4)}`;

          marker.setLatLng(position).addTo(Map);
          popup
            .setLatLng(position)
            .setContent(
              '<div className="sensor-popup">' + popupContent + "</div>"
            )
            .addTo(Map);
          navigator.clipboard
            .writeText(popupContent)
            .then(() => {
              handleOpenSnackBar(
                t("copied to clipboard !"),
                "bottom",
                "center"
              );
            })
            .catch((error) => { });
          setTimeout(function () {
            Map.removeLayer(popup);
          }, 2000);
        }
      });
    } else {
      Map.removeEventListener("click");
    }

    return () => {
      Map.removeEventListener("click");
      Map.removeLayer(marker);
      Map.removeLayer(popup);
    };
  }, [Map, clickEventState, checkDrawing]);

  const LocaltionImage = require("../../assets/images/marker.png");
  const locationIcon = L.icon({
    iconUrl: LocaltionImage,
    iconSize: [37, 50],
  });

  const handleCloseSnackBar = () => {
    setopensnack(false);
  };
  const handleOpenSnackBar = (msg, vert, horiz) => {
    setopensnack(true);
    setmessage(msg);
    setvertical(vert);
    sethorizontal(horiz);
  };
  useEffect(() => {
    if (!Map) return;
    Map.locate().on("locationfound", function (e) {
      Map.flyTo(e.latlng, 19);
      const radius = e.accuracy;
      const popupOptions = {
        closeButton: false,
        autoClose: true,
        className: "cord-popup",
      };
      const popup = L.popup(popupOptions);
      const popupContent = "this is your localisation";
      popup.setContent(popupContent);
      const circle = L.circle(e.latlng, 5).bindPopup(popup);
      Map.on("moveend", function () {
        circle.addTo(Map);
      });
    });
  }, [Map]);

  // useEffect(() => {
  //   if (!Map) return;
  //   const search = new GeoSearchControl({
  //     provider: new OpenStreetMapProvider(),
  //     style: "bar",
  //     showMarker: true,
  //     marker: {
  //       icon: locationIcon,
  //       draggable: false,
  //     },
  //     showPopup: true,
  //     retainZoomLevel: false,
  //     animateZoom: true,
  //     autoClose: true,
  //     searchLabel: t("Enter address"),
  //     keepResult: true,
  //     popupFormat: ({ query, result }) => result.label,
  //     position: "topright",
  //     notFoundMessage: "Sorry, that address could not be found.",
  //   });
  //   Map.addControl(search);
  // }, [Map]);

  useEffect(() => {
    if (!Map) return;
    baseMaps["Base Map"] = baseLayer.current;
    // add baseMap ans sattelite to the LayerControl

    // add labels layer to the map without adding it to the layercontrol
    const ImageryLabels = new esri.BasemapLayer("ImageryLabels", {
      apikey: apiKey,
      portalUrl: "https://www.arcgis.com",
    }).addTo(Map);
    overlays["Satellite"].addTo(Map);
    setlabelsLayer(ImageryLabels);
    // const LayerControls = L.control.layers(baseMaps, overlays, { position: 'topright', collapsed: false }).addTo(Map)
    // setLayerControl(LayerControls);
    // adding esri work imagery to the map and the layerControl
    Map.addControl(drawControl);
    Map.addLayer(drawnItems);
    Map.on(L.Draw.Event.DRAWVERTEX, function (e) { });
  }, [Map]);

  useEffect(() => {
    if (!Map) return;
    Map.on("draw:created", function (e) {
      const newLayer = e.layer;
      // var latlngs = newLayer.getLatLngs();
      if (oldLayer != null) {
        drawnItems.removeLayer(oldLayer);
      }
      drawnItems.addLayer(newLayer);
      setoldLayer(newLayer);
      // Add the new layer to the map and the layers state
      var seeArea = L.GeometryUtil.geodesicArea(newLayer.getLatLngs()[0]);
      const areaInHectares = (seeArea / 10000).toFixed(3);
      dispatch(AreaSurface(areaInHectares));
      if (newLayer) {
        const polygonCoords = newLayer
          .getLatLngs()[0]
          .map((coord) => [coord.lat, coord.lng]);
        dispatch(AreaOfInterestizialize(polygonCoords));
      }
    });
  }, [oldLayer, Map]);

  useEffect(() => {
    if (!Map) return;
    Map.on(L.Draw.Event.DRAWSTART, function (e) {
      setcheckDrawing(true);
    });
    Map.on(L.Draw.Event.DRAWSTOP, function (e) {
      setcheckDrawing(false);
    });
  }, [Map]);
  function layersToMap(layerName, layerData) {
    const layer = L.tileLayer(layerData.url, {
      zoom: 7,
      center: [34.809, 9.515],
    })
      .addTo(Map)
      .bringToFront();
    if (layerControl) {
      layerControl.addOverlay(layer, layerData.designation);
    }
  }
  useEffect(() => {
    if (VegetationLayersState != null) {
      const layers_values = Object.values(VegetationLayersState);
      const layers_keys = Object.keys(VegetationLayersState);
      Object.keys(VegetationLayersState).map((item) => {
        layersToMap(item, VegetationLayersState[item]);
      });
      drawnItems.removeLayer(oldLayer);
    }
  }, [VegetationLayersState]);

  useEffect(() => {
    if (!Map) return;
    $(".leaflet-draw.leaflet-control").css("top", "40px");

    Map.on("enterFullscreen", function () {
      $(".area-div").css("top", "0px");
      $(".leaflet-control-geosearch.leaflet-geosearch-bar").css("top", "0px");
      $(".leaflet-top.leaflet-right").css("top", "50px");
      //   $(".leaflet-top .leaflet-control").css("top", "30px");
      $(".sidebar").css("top", "10px");
      $("#sidebar-toogle-button-wrapper").css("top", "10px");
    });

    Map.on("exitFullscreen", function () {
      $(".area-div").css("top", "90px");
      $(".leaflet-control-geosearch.leaflet-geosearch-bar").css("top", "60px");
      $(".leaflet-top.leaflet-right").css("top", "110px");
      $(".sidebar").css("top", "70px");
      $("#sidebar-toogle-button-wrapper").css("top", "70px");
    });
  }, [Map]);
  useEffect(() => {
    if (!Map) return;
    if (clickEventState === false) {
      Map.scrollWheelZoom.disable();
      Map.dragging.disable();
      Map.touchZoom.disable();
      Map.doubleClickZoom.disable();
      Map.boxZoom.disable();
      Map.keyboard.disable();
      if (Map.tap) Map.tap.disable();
    } else {
      Map.scrollWheelZoom.enable();
      Map.dragging.enable();
      Map.touchZoom.enable();
      Map.doubleClickZoom.enable();
      Map.boxZoom.enable();
      Map.keyboard.enable();
      if (Map.tap) Map.tap.enable();
    }
  }, [Map, clickEventState]);
  const AddTaskButton = () => {
    dispatch(
      add_task(
        id_project,
        AreaOfIntrest,
        AreaSurfaceValue,
        state.name,
        state.culture,
        state.texture,
        state.salinity,
        state.irrigation,
        state.efficiency,
        state.variety,
        state.plantationDate,
        state.intensificationDate,
        state.inter_line,
        state.intra_line,
        state.seeding_density,
        state.intensification_culture,
        state.intensification_variety,
        state.intensification_density,
      )
    )
      .then((res) => {
        navigate(`/task/detail/${res.task.id}`);
      });
  };

  const LocIcon = L.icon({
    iconUrl: location_marker,
    iconSize: [60, 60],
    iconAnchor: [30, 60],
  });

  const handleAddressFound = (coords)=>{
    const { current: LocMarker } = newLocMarkerRef;

    if (LocMarker) {
      Map.removeLayer(LocMarker);
    }
    Map.flyTo(coords, 17, { duration: 5 })
       let newLocMarker = L.marker(coords, {
         icon: LocIcon,
         riseOnHover: true,
        }).addTo(Map);
        newLocMarkerRef.current = newLocMarker;
  }

  
  let customAdressRef = useRef(null);
  useEffect(() => {
    if (customAdressRef.current) {
      L.DomEvent.disableClickPropagation(customAdressRef.current);
    }
  }, [Map]);

  return (
    <div
      className="col-md-12"
      style={{ height: "calc(100vh)", padding: "0px" }}
    >
      <NavBar style={{zIndex:"1000"}} />
      <Loading />
      <div style={{ height: "100%", padding: "0px", position: "relative" }}>
        <MapContainer
          ref={setMap}
          style={style}
          center={mapParams.center}
          zoom={mapParams.zoom}
          minZoom={0}
          zoomControl={false}
          maxZoom={mapParams.maxZoom}
        >
          <CustomAddressSearch onCoordsFound={handleAddressFound} ref={customAdressRef}/>
          <TileLayer
            ref={baseLayer}
            attribution='&copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            minZoom={0}
            maxZoom={22}
          />
          <TileLayer
            ref={baseLayer}
            attribution='&copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors'
            url="https://www.arcgis.com"
            minZoom={0}
            maxZoom={22}
          />
          <ZoomControl position="bottomright" />
          <ScaleControl position="bottomleft" />
          <FullscreenControl position="bottomleft" />
          {/* <SideBarAdd id_project={id_project} state={state} /> */}
          <SidebarAdd id_project={id_project} state={state} />
          {AreaOfIntrest && isMobileState ? (
            <Button
              variant="contained"
              style={{
                backgroundColor: "#6f9d2f",
                color: "#fff",
                zIndex: 999,
                top: "100px",
                left: "46%",
                transform: "translateX(-50%)",
              }}
              size="small"
              startIcon={<AiOutlineCheck />}
              onClick={AddTaskButton}
            >
              {t("Confirm & continue")}
            </Button>
          ) : (
            ""
          )}
          <SidebarToggleButton />
          <SnackBarCopieToClipboard
            open={opensnack}
            message={message}
            autoHide={1000}
            vertical={vertical}
            horizontal={horizontal}
            handleClose={handleCloseSnackBar}
          />
        </MapContainer>
        {/* <SideBar project_name={project_name} id_project={id_project} /> */}
      </div>
    </div>
  );
};
export default AddTask;
