import React, { useState, useEffect, useRef } from "react";
import "leaflet/dist/leaflet.css";
import "leaflet-draw/dist/leaflet.draw.css";
import "../../assets/css/map.css";
import L from "leaflet";
import {
  CircleMarker,
  LayerGroup,
  LayersControl,
  MapContainer,
  Popup,
  TileLayer,
  ZoomControl,
} from "react-leaflet";
import {useNavigate, useParams} from "react-router-dom";
import { EditControl } from "react-leaflet-draw";

import * as esri from "esri-leaflet";
// import SideBar from "./SideBarEdit";
import {
  loadingBegin,
  loadingEnd,
  setCheckboxLayerState,
} from "../../actions/map";
import { useDispatch, useSelector } from "react-redux";
import { OpenStreetMapProvider, GeoSearchControl } from "leaflet-geosearch";
import "../../../node_modules/leaflet-geosearch/dist/geosearch.css";
import Loading from "../../utils/loading";
import NavBar from "../NavBar";
import { ScaleControl } from "react-leaflet";
import FullscreenControl from "../mapUtils/FullscreenControl";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import {
  Detail_Task,
  Sensor_data,
  Set_detail_from_data,
  Task_Center,
  change_selected_date_initial,
  get_task_sensor,
  get_task_tree_count,
  getOrders,
} from "../../actions/task";
import SnackBarCopieToClipboard from "../../utils/SnackBarCopieToClipboard";
import { showSnackbar } from "../../actions/snackbar";

import $ from "jquery";
import NoteBtn from "./note/noteBtn";
import NoteModal from "./note/noteModal";
import PopupContent from "./count/PopupContent";
import { renderToString } from "react-dom/server";
import NoteListModal from "./note/noteListModal";
import Sidebar from "./sidebars/Sidebar";
import SidebarToggleButton from "./sidebars/SidebarToggleButton";
import SidebarBottom from "./sidebars/SidebarBottom";
import MainModal from "./analysePanel/MainModal";
import WeatherBlock from "./sidebars/WeatherBlock";
import { getHistogram } from "../../actions/histogram";
import MapView from "./mapView/mapView";
import {
  HISTOGRAM_INITIAL_SUCCESS,
  HISTOGRAM_INITIAL_FAIL,
  SET_ACTIVE_TAB_SUCCESS,
  LOADING_END, ACTIVE_PANE_STATE_FAIL, ACTIVE_PANE_STATE_SUCCESS
} from "../../utils/types";

import getLocation from "./geolocate/gpslocator.js";
import LocateBtn from "./geolocate/locateBtn";
import CustomAddressSearch from "./geolocate/customAddressSearch";
import {useTranslation} from "react-i18next";

import PersonPinCircleIcon from "@mui/icons-material/PersonPinCircle";
import CompareTaskButton from "../mapUtils/CompareTaskButton";

import {getHighResOrders} from "../../actions/highResOrders.js"
import CompareTaskSpacialButton from "../mapUtils/CompareTaskSpacialButton";
import WeatherToggleButton from "./sidebars/WeatherToggleButton";

const { Overlay } = LayersControl;

const style = { height: "100%", width: "100wh", zIndex: "9" };

const mapParams = {
  center: [34.809, 9.515],
  // center: [35.0484, 10.325],

  zoom: 7,
  maxZoom: 18,
};

const apiKey =
    "AAPK1635806c5df74566bc9567f76c056850HTDo7PM4rZ-SwiEnzxmvAFNfj0zMBrP93MtbHy3q5YarvngZzkftSX-J_31R98B5";
const satelliteLayer = new esri.BasemapLayer("Imagery", {
  apikey: apiKey,
  portalUrl: "https://www.arcgis.com",
  maxZoom: 18,
  attribution: "",
});

const overlays = {
  Satellite: satelliteLayer,
};

const DetailsTask = () => {

  const {t} = useTranslation();

  const [Map, setMap] = useState(null);
  const baseLayer = useRef(null);
  const baseMaps = {};
  const user = useSelector((state) => state.auth.user);

  // const [layerControl, setLayerControl] = useState(null);
  const [labelsLayer, setlabelsLayer] = useState(null);
  const [flyToCenter, setflyToCenter] = useState(null);
  const [aoiCenter, setAoiCenter] = useState(null);
  const [radiusAroundAoi, setRadiusAroundAoi] = useState(null);

  const [floToZoom, setfloToZoom] = useState(null);
  const [projectName, setprojectName] = useState(null);
  const [opensnack, setopensnack] = useState(false);
  const [message, setmessage] = useState(null);
  const [vertical, setvertical] = useState(null);
  const [horizontal, sethorizontal] = useState(null);
  const markerRef = useRef(null);

  const dispatch = useDispatch();
  const VegetationLayersState = useSelector(
      (state) => state.mapReducer.DetailVegetationLayers
  );
  const checkedLayer = useSelector((state) => state.mapReducer.checkboxLayers);
  const selected_date = useSelector((state) => state.mapReducer.SelectedDate);
  const clickEventState = useSelector(
      (state) => state.mapReducer.clickEventCheck
  );
  const [SensorUrl, setSensorUrl] = useState(null);
  const [SensorName, setSensorName] = useState(null);
  const [modalOpenListNoteTask, setmodalOpenListNoteTask] = useState(false);
  const [modalOpenNoteTask, setmodalOpenNoteTask] = useState(false);
  const [modalOpenAnalysePanel, setmodalOpenAnalysePanel] = useState(false);
  const [activePaneAnalysePanel, setactivePaneAnalysePanel] = useState(0);
  let { id_task } = useParams();
  const taskId = useSelector((state) => state.mapReducer.taskIdDetails);
  const taskName = useSelector((state) => state.mapReducer.taskNameDetails);
  const isCheckedCountCheckbox = useSelector(
      (state) => state.mapReducer.isCheckedCountCheckbox
  );
  const treeCountArray = useSelector(
      (state) => state.mapReducer.treeCountLocalIndicesArray
  );


  //count state

  const [detectedPlants, setDetectedPlants] = useState([]);
  const [LocalIndices, setLocalIndices] = useState([]);
  const [countValue, setCountValue] = useState(0);

  const [myLocation, setmyLocation] = useState([]);
  const [myOrientation, setmyOrientation] = useState(0);
  const navMarkerRef = useRef(null);
  const newLocMarkerRef = useRef(null);

  //
  const person_pin = require("../../assets/images/person_pin.png");
  const location_marker = require("../../assets/images/location_marker.png");

  let navMarker = null;
  const NavIcon = L.icon({
    iconUrl: person_pin,
    iconSize: [40, 40],
    iconAnchor: [20, 20],
  });
  const LocIcon = L.icon({
    iconUrl: location_marker,
    iconSize: [60, 60],
    iconAnchor: [30, 60],
  });

  const handleLocateMe = async () => {
    try {
      let location_res = await getLocation(aoiCenter, radiusAroundAoi);

      console.clear()
      if (location_res.success) {
        // dispatch(
        //   showSnackbar("warning", true, location_res.message, "top", "right")
        // );

        let coords = location_res.coordinates;
        setmyLocation([coords.latitude, coords.longitude]);

        Map.flyTo([coords.latitude, coords.longitude], 18, {
          duration: 3,
        });
        if (!navMarkerRef.current) {
          navMarker = L.marker([coords.latitude, coords.longitude], {
            icon: NavIcon,
            riseOnHover: true,
          }).addTo(Map);
          navMarkerRef.current = navMarker;
        } else {
        }
      } else {
        dispatch(
            showSnackbar("warning", true, location_res.message, "top", "right")
        );
      }
    } catch (error) {
      let message = error.code === 1 ? t("Device location is inaccessible. Please enable location services and grant permission.") : t("Could not access device location");
      dispatch(
          showSnackbar(
              "error",
              true,
              message,
              "top",
              "right"
          )
      );
    }
  };

  const handleOrientation = (event) => {
    setmyOrientation(event.alpha);
    setTimeout(() => {
      if (navMarkerRef.current) {
        navMarkerRef.current._icon.style.transformOrigin = "center center";

        let old = navMarkerRef.current._icon.style.transform.split(")")[0];
        let nevv = old + `) rotate(${180 - event.alpha}deg)`;

        navMarkerRef.current._icon.style.transform = old + ")";
        navMarkerRef.current._icon.style.transform = nevv;
      }
    }, 50);

    // navMarker._icon.style.transform = navMarker._icon.style.transform + `rotate(${event.alpha}deg)`;
  };

  const isMobileDevice = () => {
    return /Mobi|Android|iPhone|iPad/i.test(window.navigator.userAgent);
  };
  useEffect(() => {
    dispatch(loadingBegin(2));
    if (isMobileDevice) {
    }

    if (window.DeviceOrientationEvent) {
      window.addEventListener("deviceorientation", handleOrientation);

      return () => {
        window.removeEventListener("deviceorientation", handleOrientation);
      };
    } else {
      console.error("DeviceOrientationEvent is not supported by this browser.");
    }
  }, []);

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
    if (!taskId) return;
    dispatch(getOrders(taskId)).then((res) => {
      if (res.status == 200) {
        dispatch(
            getHighResOrders(res.data)
        )
      }

    });
  }, [taskId]);

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
  }, [Map]);

  useEffect(() => {
    if (!treeCountArray || !Map) return;
    if (isCheckedCountCheckbox === 1) {
      const group = L.layerGroup();
      treeCountArray.map((item) => {
        const treeMarker = L.circleMarker([item.lat, item.lon], {
          key: item.maxx,
          radius: (item.maxx - item.minx) / 2,
          color: item.mean_ndvi > 0.3 ? "team" : "orange",
          name: "countMarkers",
        }).bindPopup(renderToString(<PopupContent data={item} />));
        treeMarker.addTo(group);
      });
      group.addTo(Map);
    } else {
      Map.eachLayer((layer) => {
        if (layer.options.name === "countMarkers") {
          Map.removeLayer(layer);
        }
      });
    }
  }, [treeCountArray, isCheckedCountCheckbox]);

  useEffect(() => {
    if (!Map || !flyToCenter) return;
    Map.flyTo(flyToCenter, floToZoom, {
      duration: 4,
    });
  }, [flyToCenter]);

  // copie cordonnées gps to clipboard
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
    if (clickEventState) {
      Map.addEventListener("click", (e) => {
        const { lat, lng } = e.latlng;
        if (lat && lng) {
          if (markerRef.current) {
            Map.removeLayer(markerRef.current);
          }
          const position = L.latLng(lat, lng);
          const popupContent = `${lat.toFixed(4)},${lng.toFixed(4)}`;
          marker.setLatLng(position).addTo(Map);
          markerRef.current = marker;
          popup
              .setLatLng(position)
              .setContent(
                  '<div className="sensor-popup">' + popupContent + "</div>"
              )
              .addTo(Map);
          navigator.clipboard
              .writeText(popupContent)
              .then(() => {
                handleOpenSnackBar("copied to clipboard !", "bottom", "center");
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
  }, [clickEventState]);

  // end
  useEffect(() => {
    const fetchTaskData = async () => {
      try {
        const taskCenterRes = await dispatch(Task_Center(id_task, user.id));
        if (taskCenterRes.status === 200) {
          const center = [
            taskCenterRes.data.data.center[1].toFixed(3),
            taskCenterRes.data.data.center[0].toFixed(3),
          ];
          setAoiCenter([center[1], center[0]]);
          setRadiusAroundAoi(taskCenterRes.data.data.radius_around_aoi);
          setfloToZoom(taskCenterRes.data.data.zoom);
          setflyToCenter(center);
          const detailTaskRes = await dispatch(Detail_Task(id_task, "S2"));
          dispatch({
            type: HISTOGRAM_INITIAL_SUCCESS,
            payload: detailTaskRes,
          });
          dispatch({
            type: SET_ACTIVE_TAB_SUCCESS,
            payload: 1,
          });
          setprojectName(detailTaskRes.project.project_name);
          dispatch(Set_detail_from_data(detailTaskRes.task));
          dispatch(change_selected_date_initial(detailTaskRes.date));

          const sensorRes = await dispatch(get_task_sensor(id_task));
          if (sensorRes.status === 200) {
            setSensorName(sensorRes.data.data.sensor_name);
            setSensorUrl(sensorRes.data.data.url);
          }
          const treeCountRes = await dispatch(get_task_tree_count(id_task));
          if (treeCountRes && treeCountRes.status === 200) {
            setLocalIndices(treeCountRes.data.data.local_index.result);
            setCountValue(treeCountRes.data.data.region_count["count"]);
          }
        }
      } catch (error) {
        console.error('Error fetching task data:', error);
      }
    };

    fetchTaskData();
  }, []);

  useEffect(() => {
    if (!Map || !SensorName || !SensorUrl) return;
    getSonsorData(SensorUrl, SensorName);
  }, [Map, SensorName]);

  useEffect(() => {
    if (!selected_date) return;
    dispatch(loadingBegin(2));
    dispatch(
        Detail_Task(id_task, selected_date.provider, selected_date.date)
    ).then((res) => {
      dispatch({
        type: HISTOGRAM_INITIAL_SUCCESS,
        payload: res,
      });
      dispatch({
        type: SET_ACTIVE_TAB_SUCCESS,
        payload: 1,
      });
      dispatch(setCheckboxLayerState("NDVI"));
      dispatch(loadingEnd(0));
    });

    return () => {
      dispatch({
        type: HISTOGRAM_INITIAL_FAIL,
      });
    };
  }, [selected_date]);

  useEffect(() => {
    if (!Map) return;
    Map.on("enterFullscreen", function () {
      $(".area-div").css("top", "0px");
      $(".leaflet-control-geosearch.leaflet-geosearch-bar").css("top", "0px");
      $(".leaflet-top.leaflet-right").css("top", "50px");
      //   $(".leaflet-top .leaflet-control").css("top", "30px");
      $(".sidebar").css("top", "1%");
      $(".sidebar").css("max-height", "98%");
      $("#sidebar-toogle-button-wrapper").css("top", "10px");
      $(".Btn-note").css("top", "50px");
    });

    Map.on("exitFullscreen", function () {
      $(".area-div").css("top", "90px");
      $(".leaflet-control-geosearch.leaflet-geosearch-bar").css("top", "60px");
      $(".leaflet-top.leaflet-right").css("top", "110px");
      $(".sidebar").css("top", "70px");
      $(".sidebar").css("max-height", "calc(100vh - 17vh)");
      $("#sidebar-toogle-button-wrapper").css("top", "70px");
      $(".Btn-note").css("top", "110px");
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

  const sensorImage = require("../../assets/images/sensor.png");
  const Sensor = L.icon({
    iconUrl: sensorImage,
    iconSize: [37, 50],
  });

  const getSonsorData = (url, sensor_name) => {
    dispatch(Sensor_data(url)).then((res) => {
      if (res.status && res.status == 201) {
        const response = res.data.allDataSensor[0];

        if (id_task === "0470c399-4d09-4e5d-8912-92018c495d9b") {
          L.marker([34.995, 10.6873], {
            icon: Sensor,
          })
              .addTo(Map)
              .bindPopup(
                  '<div className="sensor-popup"><div className="col-md-12"><b>' +
                  sensor_name +
                  "</b></div><br>" +
                  `<div className="col-md-12">${t("Time")}: <b>` +
                  response["time"] +
                  "</b></div>" +
                  `<div className="col-md-12">${t("Temperature")}: <b>` +
                  response["temperature"] +
                  " °C</b></div>" +
                  `<div className="col-md-12">${t("Humidity")}: <b>` +
                  response["humidity"] +
                  " %</b></div>" +
                  `<div className="col-md-12">${t("Pressure")}: <b>` +
                  response["pressure"] +
                  " kPa</b></div>" +
                  `<div className="col-md-12">${t("Altitude")}: <b>` +
                  response["altitude"] +
                  " M</b></div>" +
                  `<div className="col-md-12">${t("Ground temperature")}: <b>` +
                  response["ts"] +
                  " °C</b></div>" +
                  `<div className="col-md-12">${t("Humidity (20 cm depth)")}: <b>` +
                  response["mv1"] +
                  " %</b></div>" +
                  `<div className="col-md-12">${t("Humidity (40 cm depth)")}: <b>` +
                  response["mv2"] +
                  " %</b></div>" +
                  `<div className="col-md-12">${t("Humidity (60 cm depth)")}: <b>` +
                  response["mv3"] +
                  " %</b></div>" +
                  `<div className="col-md-12">${t("Evapotranspiration")}: <b>` +
                  response["et0"] +
                  "</b></div>" +
                  `<div className="col-md-12">${t("Rain")}: <b>` +
                  response["rain"] +
                  "</b></div>" +
                  `<div className="col-md-12">${t("Solar radiation")}: <b>` +
                  response["radiation"] +
                  " W/m²</b></div>" +
                  "</div>"
              );
        } else {
          L.marker([response.latitude, response.longitude], {
            icon: Sensor,
            name: "sensor Marker",
          })
              .addTo(Map)
              .bindPopup(
                  '<div className="sensor-popup"><div className="col-md-12"><b>' +
                  sensor_name +
                  "</b></div><br>" +
                  '<div className="col-md-12">Time: <b>' +
                  response.time +
                  "</b></div>" +
                  '<div className="col-md-12">Temperature: <b>' +
                  response.temperature +
                  " °C</b></div>" +
                  '<div className="col-md-12">Humidity: <b>' +
                  response.humidity +
                  " %</b></div>" +
                  '<div className="col-md-12">Pressure: <b>' +
                  response.pressure +
                  " kPa</b></div>" +
                  '<div className="col-md-12">Altitude: <b>' +
                  response.altitude +
                  " M</b></div>" +
                  '<div className="col-md-12">Ground temperature: <b>' +
                  response.ts +
                  " °C</b></div>" +
                  '<div className="col-md-12">Humidity (20 cm depth): <b>' +
                  response.mv1 +
                  " %</b></div>" +
                  '<div className="col-md-12">Humidity (40 cm depth): <b>' +
                  response.mv2 +
                  " %</b></div>" +
                  '<div className="col-md-12">Humidity (60 cm depth): <b>' +
                  response.mv3 +
                  " %</b></div>" +
                  '<div className="col-md-12">Evapotranspiration: <b>' +
                  response.et0 +
                  "</b></div>" +
                  '<div className="col-md-12">Rain: <b>' +
                  response.rain +
                  "</b></div>" +
                  '<div className="col-md-12">Solar radiation: <b>' +
                  response.radiation +
                  " W/m²</b></div>" +
                  "</div>"
              );
        }
      }
    });
  };
  const handleOpenListNotekModal = () => {
    setmodalOpenListNoteTask(true);
  };
  const handleCloseListNoteModal = () => {
    setmodalOpenListNoteTask(false);
  };

  const handleOpenNotekModal = () => {
    handleCloseListNoteModal();
    setmodalOpenNoteTask(true);
  };
  const handleCloseNoteModal = () => {

    setmodalOpenNoteTask(false);

  };
  const handleOpenAnalysePanel = (activePane) => {
    dispatch({
      type: ACTIVE_PANE_STATE_SUCCESS,
      payload: activePane,
    });
    handleCloseListNoteModal();
    setmodalOpenAnalysePanel(true);
    setactivePaneAnalysePanel(activePane);
  };
  const handleCloseAnalysePanel = () => {
    dispatch({
      type: ACTIVE_PANE_STATE_FAIL,
    });
    setmodalOpenAnalysePanel(false);
  };
  const handleAddressFound = (coords) => {
    const { current: LocMarker } = newLocMarkerRef;

    if (LocMarker) {
      Map.removeLayer(LocMarker);
    }
    Map.flyTo(coords, 17, { duration: 5 });
    let newLocMarker = L.marker(coords, {
      icon: LocIcon,
      riseOnHover: true,
    }).addTo(Map);
    newLocMarkerRef.current = newLocMarker;
  };

  let customAdressRef = useRef(null);
  useEffect(() => {
    if (customAdressRef.current) {
      L.DomEvent.disableClickPropagation(customAdressRef.current);
    }
  }, [Map]);
  const navigate = useNavigate();

  const handleCreateCompare = () => {
    navigate(`${window.location.pathname}/comparison/task`);
  };
  const handleCreateCompareSpacial = () => {
    navigate(`${window.location.pathname}/comparison/task/spatial`);
  };
  return (
      <div
          className="col-md-12"
          style={{ height: "calc(100vh)", padding: "0px" }}
      >

        <NavBar />
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
              id="mapContainer"
          >
            <CustomAddressSearch onCoordsFound={handleAddressFound} ref={customAdressRef} />
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
            <FullscreenControl position="bottomright" />
            <CompareTaskButton position="bottomright" onClick={handleCreateCompare} />
            <CompareTaskSpacialButton position="bottomright" onClick={handleCreateCompareSpacial} />

            {/* <Surface surface={surface} name={taskName} /> */}
            {/* {<DatesSlider id_task={id_task} />} */}
            <SnackBarCopieToClipboard
                open={opensnack}
                message={message}
                autoHide={1000}
                vertical={vertical}
                horizontal={horizontal}
                handleClose={handleCloseSnackBar}
            />
            {/* <NoteBtn openModal={handleOpenListNotekModal} /> */}
            {isMobileDevice() && <LocateBtn getlocation={handleLocateMe} />}

            <NoteListModal
                open={modalOpenListNoteTask}
                handleClose={handleCloseListNoteModal}
                handleNoteModal={handleOpenNotekModal}
                idTask={id_task}
            />
            <NoteModal
                open={modalOpenNoteTask}
                handleClose={handleCloseNoteModal}
                idTask={id_task}
            />
            <MainModal
                open={modalOpenAnalysePanel}
                handleClose={handleCloseAnalysePanel}
                idTask={id_task}
                //activePane={activePaneAnalysePanel}
            />
            {/* <SideBar vegetation={VegetationLayersState} treeCount={countValue} /> */}
            <Sidebar openModal={handleOpenAnalysePanel} />
            <SidebarBottom />
            <SidebarToggleButton />
            <>
            <WeatherToggleButton />

              <div
                  className="weather-card"
                  style={{ marginTop: window.innerHeight < 900 ? "33px" : "0px" }}
              >
                <WeatherBlock openModal={handleOpenAnalysePanel} />
            </div>
            </>
            {/* {taskName === "nizar" ?
                        <LayersControl>
                            <Overlay checked name="Tree markers">
                                <LayerGroup>
                                    {detectedPlants.map(plant => (
                                        <CircleMarker
                                            key={plant.maxx}
                                            center={[plant.lat, plant.lon]}
                                            radius={(plant.maxx - plant.minx) / 2}
                                            color="gray"
                                        >
                                            <Popup>
                                                <span><b>Plant NDVI:</b> calculating...</span><br />
                                                <span><b>Plant NDRE:</b> calculating...</span><br />
                                                <span><b>Plant GCI:</b> calculating...</span><br />
                                                <span><b>Plant NDWI:</b> calculating...</span>
                                            </Popup>
                                        </CircleMarker>
                                    ))
                                    }

                                    {localIndices.map(localIndex => (
                                        <CircleMarker
                                            key={localIndex.maxx}
                                            center={[localIndex.lat, localIndex.lon]}
                                            radius={(localIndex.maxx - localIndex.minx) / 2}
                                            color={localIndex.mean_ndvi > 0.3 ? "teal" : "orange"}
                                        >
                                            <Popup>
                                                <span><b>Plant NDVI:</b></span> {localIndex.mean_ndvi.toFixed(2)}<br />
                                                <span><b>Plant NDRE:</b></span> {localIndex.mean_ndre.toFixed(2)}<br />
                                                <span><b>Plant GCI:</b></span> {localIndex.mean_gci.toFixed(2)}<br />
                                                <span><b>Plant NDWI:</b></span> {localIndex.mean_ndwi.toFixed(2)}
                                            </Popup>
                                        </CircleMarker>

                                    ))
                                    }
                                </LayerGroup>
                            </Overlay>
                        </LayersControl>
                        : ""
                    } */}
          </MapContainer>
          {Map && <MapView Map={Map} />}
        </div>
      </div>
  );
};
export default DetailsTask;
