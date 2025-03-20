import React, { useState, useEffect, useRef } from "react";
import "leaflet/dist/leaflet.css";
import "leaflet-draw/dist/leaflet.draw.css";
import "../../assets/css/map.css";
import L from "leaflet";
import {
    MapContainer,
    ZoomControl,
} from "react-leaflet";
import { useParams } from "react-router-dom";
import * as esri from "esri-leaflet";
import { useDispatch, useSelector } from "react-redux";
import "leaflet-geosearch/dist/geosearch.css";

import {
    change_selected_date_initial_right,
    Detail_Task_right,
    Set_detail_from_data_right,
    Task_Center
} from "../../actions/task";
import SidebarComparisionRight from "./SidebarComparisionRight";
import SidebarBottomComparisonTaskRight from "./SidebarBottomComparisonTaskRight";
import MapViewComparisionRight from "./MapViewComparisionRight";
import { loadingBegin, loadingEnd } from "../../actions/map";
import { HISTOGRAM_FAIL_RIGHT, HISTOGRAM_SUCCESS_RIGHT } from "../../utils/types";

const style = { height: "100%", width: "100wh", zIndex: "9" };
const mapParams = {
    center: [34.809, 9.515],
    zoom: 7,
    maxZoom: 18,
};

const apiKey = "AAPK1635806c5df74566bc9567f76c056850HTDo7PM4rZ-SwiEnzxmvAFNfj0zMBrP93MtbHy3q5YarvngZzkftSX-J_31R98B5";
const satelliteLayer = new esri.BasemapLayer("Imagery", {
    apikey: apiKey,
    portalUrl: "https://www.arcgis.com",
    maxZoom: 18,
    attribution: "",
});

const overlays = {
    Satellite: satelliteLayer,
};

const DetailsComparisonRight = () => {
    const [Map, setMap] = useState(null);
    const [isInitialLoad, setIsInitialLoad] = useState(true);
    const baseLayer = useRef(null);
    const baseMaps = {};
    const [flyToCenter, setflyToCenter] = useState(null);
    const [floToZoom, setfloToZoom] = useState(null);
    const markerRef = useRef(null);
    const dispatch = useDispatch();
    const selected_date_right = useSelector((state) => state.mapReducer.SelectedDateRight);
    const selected_date_left = useSelector((state) => state.mapReducer.SelectedDateLeft);
    const clickEventState = useSelector((state) => state.mapReducer.clickEventCheckRight);
    const user = useSelector((state) => state.auth.user);

    let { id_task } = useParams();
    const navMarkerRef = useRef(null);
    const [selectedDateRight, setSelectedDateRight] = useState(null);
    const [selectedDateLeft, setSelectedDateLeft] = useState(null);

    // Update local state when Redux state changes
    useEffect(() => {
        if (selected_date_right) {
            setSelectedDateRight(selected_date_right);
        }
    }, [selected_date_right]);

    useEffect(() => {
        if (selected_date_left) {
            setSelectedDateLeft(selected_date_left);
        }
    }, [selected_date_left]);

    const handleOrientation = (event) => {
        setTimeout(() => {
            if (navMarkerRef.current) {
                navMarkerRef.current._icon.style.transformOrigin = "center center";
                let old = navMarkerRef.current._icon.style.transform.split(")")[0];
                let nevv = old + `) rotate(${180 - event.alpha}deg)`;
                navMarkerRef.current._icon.style.transform = nevv;
            }
        }, 50);
    };

    // Initial setup
    useEffect(() => {
        dispatch(loadingBegin(2));
        if (window.DeviceOrientationEvent) {
            window.addEventListener("deviceorientation", handleOrientation);
            return () => {
                window.removeEventListener("deviceorientation", handleOrientation);
            };
        } else {
            console.error("DeviceOrientationEvent is not supported by this browser.");
        }
    }, []);

    // Map initialization
    useEffect(() => {
        if (!Map) return;
        baseMaps["Base Map"] = baseLayer.current;
        overlays["Satellite"].addTo(Map);
    }, [Map]);

    // Handle map center changes
    useEffect(() => {
        if (!Map || !flyToCenter) return;
        Map.flyTo(flyToCenter, floToZoom, {
            duration: 4,
        });
    }, [flyToCenter]);

    // Handle click events
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
                        .setContent('<div className="sensor-popup">' + popupContent + "</div>")
                        .addTo(Map);
                    navigator.clipboard.writeText(popupContent).catch((error) => {});
                    setTimeout(function () {
                        Map.removeLayer(popup);
                    }, 2000);
                }
            });
        } else {
            Map.removeEventListener("click");
        }
    }, [clickEventState]);

    // Initial data load
    useEffect(() => {
        dispatch(Task_Center(id_task, user.id)).then((res) => {
            if (res.status && res.status === 200) {
                const center = [
                    res.data.data.center[1].toFixed(3),
                    res.data.data.center[0].toFixed(3),
                ];
                setfloToZoom(res.data.data.zoom);
                setflyToCenter(center);
                dispatch(Detail_Task_right(id_task, "S2")).then((res) => {
                    dispatch({
                        type: HISTOGRAM_SUCCESS_RIGHT,
                        payload: res.index,
                    });
                    dispatch(Set_detail_from_data_right(res.task));
                    dispatch(change_selected_date_initial_right(res.date));
                    setIsInitialLoad(false);
                });
            }
        });
    }, []);

    // Handle date changes
    useEffect(() => {
        // Skip if it's the initial load or either date is not yet set
        if (isInitialLoad || !selectedDateRight || !selectedDateLeft) return;

        dispatch(loadingBegin(2));

        dispatch(
            Detail_Task_right(
                id_task,
                selectedDateRight.provider,
                selectedDateLeft.date,
                selectedDateRight.date
            )
        ).then((res) => {
            dispatch({
                type: HISTOGRAM_SUCCESS_RIGHT,
                payload: res.index,
            });
            dispatch(loadingEnd(0));
        });

        return () => {
            dispatch({
                type: HISTOGRAM_FAIL_RIGHT,
            });
        };
    }, [selectedDateRight, selectedDateLeft, isInitialLoad]);

    return (
        <div style={{ height: "100%", width: "100%", position: "relative" }}>
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
                <ZoomControl position="topright" />
                <SidebarComparisionRight />
                <SidebarBottomComparisonTaskRight />
                {Map && <MapViewComparisionRight Map={Map} />}
            </MapContainer>
        </div>
    );
};

export default DetailsComparisonRight;
