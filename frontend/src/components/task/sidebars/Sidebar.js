import {Checkbox, Container, Switch} from "@mui/material";
import React, { useState, useEffect } from "react";
import { Button, Col, Row } from "react-bootstrap";
import "../../../../node_modules/font-gis/css/font-gis.css";
import "../../../assets/scss/sidebars.scss";
import { IoLocationOutline } from "react-icons/io5";
import { useTranslation } from "react-i18next";
import SurveyEdit from "./SurveyEdit";
import TaskImage from "./TaskImage";
import SurveyHeader from "./SurveyHeader";
import { isMobile } from "react-device-detect";
import {
  removeCheckboxLayerState,
  setCheckboxLayerState,
  setClickEventFail,
  setClickEventSucess,
} from "../../../actions/map";
import { useDispatch, useSelector } from "react-redux";
import $ from "jquery";
import IndexCheckbox from "./IndexCheckbox";
import indexes from "../../../utils/indexes.json";
import GraphLayout from "../sidebarGraph/graphLayout";
import RequestHighResolutionPopup from "../requests/requestHighResolutionPopup";
import HighResolutionPopup from "../requests/HighResolutionPopup";
import BlockHeader from "./BlockHeader";
import TreeCountCheckbox from "./TreeCountCheckbox";
import { GiPencilRuler } from "react-icons/gi";
import { RiRemoteControlLine } from "react-icons/ri";
import {
  set_smart_control_command,
  get_smart_control_command_status,
  getOrders,
  setHasHighResOrdersState, get_task_sensor, set_smart_control_connect,
} from "../../../actions/task";
import { showSnackbar } from "../../../actions/snackbar";
import { BsCloudSun } from "react-icons/bs";
import WeatherBlock from "./WeatherBlock";
import { FaRegCalendarAlt } from "react-icons/fa";
import CalendarBlock from "./CalendarBlock.js";

import {
  REQUEST_EMPTY,
  REQUEST_EXIST,
  HIGH_RES_SERVICE_AVAILABLE,
  HIGH_RES_SERVICE_NOT_AVAILABLE, CHECKBOX_DEM_STATE_SUCCESS, CHECKBOX_STATE_SUCCESS_RIGHT,
} from "../../../../src/utils/types";
import Histogram from "../histogram/histogram.js";
import HistogramTab from "../histogram/histogramTab.js";
import FormControlLabel from "@mui/material/FormControlLabel";
import {FormGroup} from "reactstrap";
import DEMLegend from "./DEMLegend";
import {
  Card,
  CardBody,
  CardHeader,
  CardText,
  CardTitle
} from "reactstrap";
const Sidebar = ({ openModal }) => {
  const { t } = useTranslation();
  const [sidebarRef, setsidebarRef] = useState(null);
  const dispatch = useDispatch();
  const [sidebarToogle, setsidebarToogle] = useState(true);
  const taskName = useSelector((state) => state.mapReducer.taskNameDetails);
  const task_id = useSelector((state) => state.mapReducer.taskIdDetails);
  const AreaSurface = useSelector((state) => state.mapReducer.surfaceDetails);
  const country = useSelector((state) => state.mapReducer.countryFrDetails);
  const state = useSelector((state) => state.mapReducer.stateFrDetails);
  const stateDistrict = useSelector(
      (state) => state.mapReducer.stateDistrictFrDetails
  );
  const checkboxLayers = useSelector((state) => state.mapReducer.checkboxLayers);

  const county = useSelector((state) => state.mapReducer.countyFrDetails);
  const postcode = useSelector((state) => state.mapReducer.postcodeFrDetails);
  const has_requestEdit = useSelector(
      (state) => state.requestReducer.has_request
  );
  const high_res_service_available = useSelector(
      (state) => state.highResServiceReducer.high_res_available
  );
  const [modalOpenRequestHighResolution, setmodalOpenRequestHighResolution] =
      useState(false);
  const [modalOpenHighResolution, setmodalOpenHighResolution] = useState(false);
  const [selectedCheckboxId, setSelectedCheckboxId] = useState("NDVI");
  const treeCount = useSelector((state) => state.mapReducer.treeCountValue);
  const [isCheckedIOT, setisCheckedIOT] = useState(false);
  const [isCheckedIOTMode, setisCheckedIOTMode] = useState(true);
  // const [orders, setOrders] = useState([]);
  const highResOrders = useSelector((state) => state.highResOrdersReducer.highResOrders);
  const taskId = useSelector((state) => state.mapReducer.taskIdDetails);
  const subscriptionData = useSelector(
      (state) => state.requestReducer.requests
  );
  const [Subscription, setSubscription] = useState(0);
  const selected_date = useSelector((state) => state.mapReducer.SelectedDate);
  const [providerIndexList, setproviderIndexList] = useState(null);
  const activeTab = useSelector((state) => state.histogramReducer.activeTab);
  const [sensorStatus, setSensorStatus] = useState('lost connect');
  const [isActionPending, setIsActionPending] = useState(false);


  const handleCheckboxChange = (id) => {
    setSelectedCheckboxId((prevId) => (prevId === id ? null : id));
  };
  const [isDEMChecked, setIsDEMChecked] = useState(false);

  useEffect(() => {
    if (!selected_date) return;
    setproviderIndexList(indexes[selected_date.provider]);
  }, [selected_date]);

  useEffect(() => {
    if (selectedCheckboxId !== null) {
      dispatch(setCheckboxLayerState(selectedCheckboxId));
    } else {
      dispatch(removeCheckboxLayerState());
    }
  }, [selectedCheckboxId]);

  useEffect(() => {
    if (!sidebarRef) return;

    if (isMobile) {
      sidebarRef.addEventListener("touchstart", disableMapInteractions);
      sidebarRef.addEventListener("touchmove", disableMapInteractions);
    }
    sidebarRef.addEventListener("mouseenter", disableMapInteractions);
    sidebarRef.addEventListener("mouseleave", enableMapInteractions);
    return () => {
      sidebarRef.removeEventListener("mouseenter", disableMapInteractions);
      sidebarRef.removeEventListener("mouseleave", enableMapInteractions);
      sidebarRef.removeEventListener("touchstart", disableMapInteractions);
      sidebarRef.removeEventListener("touchend", enableMapInteractions);
      sidebarRef.removeEventListener("touchmove", enableMapInteractions);
    };
  }, [sidebarRef]);
  const disableMapInteractions = () => {
    dispatch(setClickEventFail());
  };
  const enableMapInteractions = () => {
    dispatch(setClickEventSucess());
  };
  const handleOpenRequestHighResolutionModal = () => {
    handleCloseHighResolutionModal();
    setmodalOpenRequestHighResolution(true);
  };
  const handleCloseRequestHighResolutionModal = () => {
    setmodalOpenRequestHighResolution(false);
  };

  const checkOrders = (e) => {
    dispatch(getOrders(taskId, Subscription)).then((res) => {
      if (res.status == 200) {
        dispatch({
          type: HIGH_RES_SERVICE_AVAILABLE,
        });
        if (res.data.length != 0) {
          dispatch({
            type: REQUEST_EXIST,
          });
        } else {
          dispatch({
            type: REQUEST_EMPTY,
          });
        }
      } else {
        dispatch({
          type: HIGH_RES_SERVICE_NOT_AVAILABLE,
        });
      }

    });
  };

  useEffect(() => {
    if (!taskId) return;
    dispatch(getOrders(taskId)).then((res) => {
      if (res.status == 200) {
        dispatch({
          type: HIGH_RES_SERVICE_AVAILABLE,
        });
        // alert(res.data)
        // setOrders(res.data);
        if (res.data.length != 0) {
          dispatch({
            type: REQUEST_EXIST,
          });
        } else {
          dispatch({
            type: REQUEST_EMPTY,
          });
        }
      } else {
        dispatch({
          type: HIGH_RES_SERVICE_NOT_AVAILABLE,
        });
      }

    });
  }, [taskId]);



  useEffect(() => {
    const fetchInitialStatus = async () => {
      try {
        if ((taskId && taskId === "c6b8111f-ded5-4b03-ba99-408eea603be1") ||
            (taskId && taskId === "0470c399-4d09-4e5d-8912-92018c495d9b")){
          const connectRes = await dispatch(set_smart_control_connect());
          const statusRes = await dispatch(get_smart_control_command_status(""));

          setSensorStatus(connectRes.data.status);
          if (!isActionPending) {
            setisCheckedIOT(statusRes.data.LastState === 'ON');
            setisCheckedIOTMode(statusRes.data.LastMode === 'AUTO');
          }
        }

      } catch (error) {
        console.error("Error fetching initial status:", error);
      }
    };
    if ((taskId && taskId === "c6b8111f-ded5-4b03-ba99-408eea603be1") ||
        (taskId && taskId === "0470c399-4d09-4e5d-8912-92018c495d9b")){
      fetchInitialStatus();

    }
  }, []);
  useEffect(() => {
    if (!taskId ||
        !(taskId === "c6b8111f-ded5-4b03-ba99-408eea603be1" || taskId === "0470c399-4d09-4e5d-8912-92018c495d9b")) {
      return;
    }
    let isActive = true;
    const pollInterval = 1000;

    const pollStatus = async () => {
      if (!isActive || isActionPending) return;

      try {

        const connectRes = await dispatch(set_smart_control_connect());
        const statusRes = await dispatch(get_smart_control_command_status(""));

        if (isActive && !isActionPending) {
          setSensorStatus(connectRes.data.status);
          setisCheckedIOT(statusRes.data.LastState === 'ON');
          setisCheckedIOTMode(statusRes.data.LastMode === 'AUTO');
        }
      } catch (error) {
        console.error("Error polling status:", error);
      }

      if (isActive) {
        setTimeout(pollStatus, pollInterval);
      }
    };

    pollStatus();
    return () => {
      isActive = false;
    };
  }, [taskId, isActionPending]);

  const handleOpenHighResolutionModal = () => {
    handleCloseRequestHighResolutionModal();
    setmodalOpenHighResolution(true);
  };
  const handleCloseHighResolutionModal = () => {
    setmodalOpenHighResolution(false);
  };



  const handleIotChange = async () => {

    const newState = !isCheckedIOT;
    setisCheckedIOT(newState);
    setIsActionPending(true);
    try {
      const res = await dispatch(set_smart_control_command(newState ? "ON" : "OFF"));
      if (res.status === 200) {
        dispatch(
            showSnackbar(
                newState ? "success" : "warning",
                undefined,
                res.data.message,
                "top",
                "right"
            )
        );
      } else {
        setisCheckedIOT(!newState);
        dispatch(
            showSnackbar(
                "error",
                undefined,
                t("something went wrong !"),
                "top",
                "right"
            )
        );
      }
    } catch (error) {
      setisCheckedIOT(!newState);
      dispatch(
          showSnackbar(
              "error",
              undefined,
              t("something went wrong !"),
              "top",
              "right"
          )
      );
    } finally {
      setTimeout(() => {
        setIsActionPending(false);
      }, 1000);
    }
  };
  const handleIotModeChange = async () => {
    const newMode = !isCheckedIOTMode;
    setisCheckedIOTMode(newMode);
    setIsActionPending(true);

    try {
      const res = await dispatch(set_smart_control_command(newMode ? "AUTO" : "MANUAL"));
      if (res.status === 200) {
        dispatch(
            showSnackbar(
                "success",
                undefined,
                res.data.message,
                "top",
                "right"
            )
        );
      } else {
        setisCheckedIOTMode(!newMode);
        dispatch(
            showSnackbar(
                "error",
                undefined,
                t("something went wrong !"),
                "top",
                "right"
            )
        );
      }
    } catch (error) {
      setisCheckedIOTMode(!newMode);
      dispatch(
          showSnackbar(
              "error",
              undefined,
              t("something went wrong !"),
              "top",
              "right"
          )
      );
    } finally {
      setTimeout(() => {
        setIsActionPending(false);
      }, 1000);
    }
  };

  const handleDEMChange = (event) => {
    dispatch({
      type: CHECKBOX_DEM_STATE_SUCCESS,
      payload: event.target.checked,
    });
    setIsDEMChecked(event.target.checked);
  };

  return (
      <div className="sidebar" ref={setsidebarRef}>
        <Container maxWidth="md" className="container-sidebar container-border">
          <Row className="">
            <Col
                xs="12"
                className="d-flex task-title-container align-items-center"
            >
              <div className="icon-wrapper d-flex justify-content-center align-item-center">
                <i className="fg-lg fg-location-poi-o task-title-icon"></i>
              </div>
              <span className="task-title">{taskName}</span>
            </Col>
          </Row>
        </Container>
        <Container maxWidth="md" className="container-sidebar">
          <Row className="">
            <Col xs="12" className="task-sidebar-navs-container">
              <ul
                  className="nav nav-tabs nav-tabs-custom nav-justified"
                  role="tablist"
              >
                <li className="nav-item">
                  <a
                      className="nav-link  sidebar-navlink "
                      data-bs-toggle="tab"
                      href="#home1"
                      role="tab"
                  >
                  <span className="d-flex imagery-icon justify-content-center">
                    <svg
                        viewBox="0 0 64 64"
                        fill="currentColor"
                        height="1em"
                        width="1em"
                    >
                      <path
                          fill="none"
                          stroke="currentColor"
                          strokeMiterlimit={10}
                          strokeWidth={2}
                          d="M18 26.066L2 33l30 12 30-12-16-6.933"
                      />
                      <path
                          fill="none"
                          stroke="currentColor"
                          strokeMiterlimit={10}
                          strokeWidth={2}
                          d="M18 39.066L2 46l30 12 30-12-16-6.933M32 32l30-12L32 7 2 20z"
                      />
                    </svg>
                  </span>
                    <span className="d-none d-sm-block">{t("FIELD DETAILS")}</span>
                  </a>
                </li>
                <li className="nav-item">
                  <a
                      className="nav-link sidebar-navlink active"
                      data-bs-toggle="tab"
                      href="#profile1"
                      role="tab"
                  >
                  <span className="d-flex imagery-icon justify-content-center">
                    {/* <i className="fg-lg fg-layers-poi Imagery-icon"></i>
                     */}
                    <svg
                        fill="none"
                        stroke="currentColor"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        viewBox="0 0 24 24"
                        height="1em"
                        width="1em"
                    >
                      <path stroke="none" d="M0 0h24v24H0z" />
                      <path d="M11 18l-2-1-6 3V7l6-3 6 3 6-3v10M9 4v13M15 7v5" />
                      <path d="M19 17.5 A2.5 2.5 0 0 1 16.5 20 A2.5 2.5 0 0 1 14 17.5 A2.5 2.5 0 0 1 19 17.5 z" />
                      <path d="M18.5 19.5L21 22" />
                    </svg>
                  </span>
                    <span className="d-none d-sm-block">{t("ANALYSIS")}</span>
                  </a>
                </li>
                {/* <li className="nav-item">
                <a
                  className="nav-link sidebar-navlink"
                  data-bs-toggle="tab"
                  href="#messages1"
                  role="tab"
                >
                  <span className="d-block imagery-icon">
                    <svg
                      viewBox="0 0 24 24"
                      fill="currentColor"
                      height="1em"
                      width="1em"
                    >
                      <path d="M11 16h2V7h3l-4-5-4 5h3z" />
                      <path d="M5 22h14c1.103 0 2-.897 2-2v-9c0-1.103-.897-2-2-2h-4v2h4v9H5v-9h4V9H5c-1.103 0-2 .897-2 2v9c0 1.103.897 2 2 2z" />
                    </svg>
                  </span>
                  <span className="d-none d-sm-block">EXPORT</span>
                </a>
              </li> */}
              </ul>
            </Col>
          </Row>
        </Container>
        <div className="tab-content">
          <div className="tab-pane" id="home1" role="tabpanel">
            <Container
                maxWidth="md"
                className="tab-content container-sidebar container-border"
            >
              <Row className="pt-2 pb-2 d-flex align-items-center ">
                <Col
                    xs="6"
                    className="d-flex align-items-center justify-content-center"
                >
                  {task_id && <TaskImage taskId={task_id} />}
                </Col>
                <Col xs={6} className="d-flex align-items-center">
                  <div>
                  <span
                      style={{ fontSize: "17px" }}
                      className="d-flex align-items-center"
                  >
                    <p>
                      <IoLocationOutline
                          color="#6f9d2f"
                          style={{ marginRight: "2px" }}
                      />
                      {country ? country : ""}
                      {state ? ", " + state : ""}
                      {stateDistrict ? ", " + stateDistrict : ""}
                      {county ? ", " + county : ""}
                      {postcode ? ", " + postcode : ""}
                    </p>
                  </span>
                    <p>
                    <span
                        style={{ fontSize: "17px" }}
                        className="d-flex align-items-center"
                    >
                      <GiPencilRuler
                          color="#6f9d2f"
                          style={{ marginRight: "2px" }}
                      />
                      <b>{t("Area : ")}</b>
                      {AreaSurface} Ha
                    </span>
                    </p>
                  </div>
                </Col>
              </Row>
            </Container>
            <div className="d-block d-md-none">
              <Container
                  maxWidth="md"
                  className="tab-content container-sidebar container-border "
              >
                <BlockHeader title={"Weather Insights"} CustomIcon={BsCloudSun} />
              </Container>
            </div>
            <div className="d-block d-md-none">
              <Container
                  maxWidth="md"
                  className="tab-content container-sidebar container-border"
              >
                <Row className="pt-2 pb-2">
                  <Col xs={12} className="">
                    {/* <span className="high-resolution-span">
                  {t("Dive into the world of weather with our Meteorological Insights. Gain a comprehensive understanding of current weather conditions, forecasts, and historical data.Explore the dynamic nature of weather patterns and stay ahead with our advanced meteorological features.")}
                </span> */}
                    <WeatherBlock CalledFrom={"Sidebar"} openModal={openModal} />
                  </Col>
                </Row>
                {/* <Row className="pb-2">
              <Col xs={12} className="d-flex justify-content-center">
                <Button className="btn btn-login" onClick={() => openModal(1)}>{t("Show details")}</Button>
              </Col>
            </Row> */}
              </Container>
            </div>
            {/* <Container
            maxWidth="md"
            className="tab-content container-sidebar container-border"
          >
            <BlockHeader title={"Available satellite Imagery"} icon={"fg-photogrammetry"} />
          </Container>
          <Container
            maxWidth="md"
            className="tab-content container-sidebar container-border"
          >
            <DatesCarousel />
          </Container> */}
            <Container
                maxWidth="md"
                className="tab-content container-sidebar container-border"
            >
              <SurveyHeader editSurvey={1} />
            </Container>
            <Container className="container-border">
              <SurveyEdit />
            </Container>

            <Container
                maxWidth="md"
                className="tab-content container-sidebar container-border"
            >
              <BlockHeader
                  title={t("Events Calendar")}
                  CustomIcon={FaRegCalendarAlt}
                  openModal={() => openModal(2)}
              />
            </Container>
            <Container
                maxWidth="md"
                className="tab-content container-sidebar container-border"
            >
              <CalendarBlock openModal={() => openModal(2)} />
            </Container>

          </div>
          <div className="tab-pane active" id="profile1" role="tabpanel">
            <>
              {parseFloat(AreaSurface) > 20 && (
                  <Row className="pt-2 pb-2">
                    <Col xs="12">
                      <Row className="align-items-center">
                        <Col xs="9" className="d-flex align-items-center gap-2">
                          <div className="d-flex align-items-center gap-2">
                            <span   style={{
                              marginLeft: '10px',
                              fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
                              fontWeight: 'bold',
                              fontSize: '14px',
                              lineHeight: '1.5',
                              letterSpacing: '0.00938em',
                              marginRight: '5px'
                            }}
                            >
                                {t("Topographic Map")}
                            </span>
                            <input
                                type="checkbox"
                                id="dem-checkbox"
                                className="index-checkbox"
                                name="layer"
                                checked={isDEMChecked}
                                onChange={handleDEMChange}
                            />
                            <label htmlFor="dem-checkbox"></label>
                          </div>
                        </Col>
                      </Row>
                    </Col>
                  </Row>
              )}
              {isDEMChecked && parseFloat(AreaSurface) > 20 && <DEMLegend />}
            </>

            <Container maxWidth="md" className="tab-content container-sidebar">
              {!isDEMChecked && checkboxLayers !== "RGB" && checkboxLayers !== null && <HistogramTab />}
            </Container>


            {/* <Container
            maxWidth="md"
            className="tab-content container-sidebar container-border"
          >
            <Histogram />
          </Container>
            {!isDEMChecked && providerIndexList &&
                providerIndexList.map((item, index) => (
                    <Container
                        maxWidth="md"
                        className="tab-content container-sidebar container-border"
                        key={index}
                    >
                      <IndexCheckbox
                          index={item}
                          isChecked={item.id === selectedCheckboxId}
                          onCheckboxChange={handleCheckboxChange}
                      />
                    </Container>
                ))}*/}
            {!isDEMChecked && providerIndexList && (
                activeTab === 2
                    ? (
                        <Container
                            maxWidth="md"
                            className="tab-content container-sidebar container-border"
                            key={1}

                        >
                          <IndexCheckbox
                              index={providerIndexList[1]}
                              isChecked={providerIndexList[1]?.id === selectedCheckboxId}
                              onCheckboxChange={handleCheckboxChange}
                              showCheckbox={false}
                          />
                        </Container>
                    )
                    : providerIndexList.map((item, index) => (
                        <Container
                            maxWidth="md"
                            className="tab-content container-sidebar container-border"
                            key={index}
                        >
                          <IndexCheckbox
                              index={item}
                              isChecked={item.id === selectedCheckboxId}
                              onCheckboxChange={handleCheckboxChange}
                              showCheckbox={true}
                          />
                        </Container>
                    ))
            )}

            {treeCount ? (
                <Container
                    maxWidth="md"
                    className="tab-content container-sidebar container-border"
                >
                  <TreeCountCheckbox />
                </Container>
            ) : (
                ""
            )}
            <Container
                maxWidth="md"
                className="tab-content container-sidebar container-border"
            >
              <BlockHeader
                  title={"Indexs Curve over time"}
                  icon={"fg-profile-o"}
                  openModal={() => openModal(0)}
              />
            </Container>
            <Container
                maxWidth="md"
                className="tab-content container-sidebar container-border"
            >
              <GraphLayout clickEvent={() => openModal(0)} />
            </Container>
            {(taskId && taskId === "c6b8111f-ded5-4b03-ba99-408eea603be1") ||
            (taskId && taskId === "0470c399-4d09-4e5d-8912-92018c495d9b") ? (
                <Container
                    maxWidth="md"
                    className="tab-content container-sidebar container-border"
                >
                  <Row className="pt-2 pb-2">
                    <Col xs={12} className="d-flex align-items-center">
                      <div className="icon-wrapper d-flex justify-content-center align-item-center">
                        <RiRemoteControlLine className="task-title-icon" />
                      </div>
                      <div className="area-title align-items-center d-flex">
                    <span className="task-title">
                      {t("Smart irrigation commands")}
                    </span>
                      </div>
                    </Col>
                  </Row>
                  <Row className="pt-2 pb-2">

                    <Col xs={6} className="d-flex justify-content-center">
                      <div class="checkbox-on-off">
                        <input
                            class="tgl tgl-ios"
                            id="toggle-34"
                            type="checkbox"
                            checked={isCheckedIOT}
                            onChange={handleIotChange}
                            disabled={isCheckedIOTMode}
                        />
                        <label class="tgl-btn" for="toggle-34"></label>
                      </div>
                    </Col>
                    <Col xs={6} className="d-flex justify-content-center">
                      <div className="checkbox-man-auto">
                        <input
                            className="tgl tgl-ios"
                            id="toggle-35"
                            type="checkbox"
                            checked={isCheckedIOTMode}
                            onChange={handleIotModeChange}
                        />
                        <label className="tgl-btn" htmlFor="toggle-35"></label>
                      </div>
                    </Col>

                  </Row>
                  <br/>
                  <Row className="d-flex justify-content-center">
                    <Col xs={12} sm={8} md={6} lg={4}>
                      <Card>
                        <CardHeader className="h5 bg-transparent border-bottom text-uppercase text-center">
                          <strong>Status</strong>
                        </CardHeader>
                        <CardBody className="text-center">
                          <CardText
                              style={{
                                color:
                                    sensorStatus === "lost connect"
                                        ? "#ff0000"
                                        : sensorStatus === "connected"
                                            ? "#60b92e"
                                            : "#808080",
                              }}
                          >
                            {sensorStatus.charAt(0).toUpperCase() + sensorStatus.slice(1)}
                          </CardText>
                        </CardBody>
                      </Card>
                    </Col>
                  </Row>


                  <br/>
                </Container>
            ) : (
                ""
            )}
            <Container
                maxWidth="md"
                className="tab-content container-sidebar container-border"
            >
              <BlockHeader
                  title={"High Resolution Imagery"}
                  icon={"fg-satellite-earth"}
              />
            </Container>
            <Container
                maxWidth="md"
                className="tab-content container-sidebar container-border"
            >
              <Row className="pt-2 pb-2">
                <Col xs={12} className="">
                <span className="high-resolution-span">
                  {t(
                      "Unlock the full potential of our satellite imagery with our High-Resolution Subscription service. Immerse yourself in unparalleled detail and clarity as you subscribe to access cutting-edge, high-definition satellite images."
                  )}
                </span>
                </Col>
              </Row>
              <Row className="pb-2">
                <Col xs={12} className="d-flex justify-content-center">
                  {has_requestEdit === false ? (
                      <Button
                          className="btn btn-login"
                          disabled={!high_res_service_available}
                          onClick={handleOpenRequestHighResolutionModal}
                      >
                        {t("Request high resolution data")}
                        {!high_res_service_available
                            ? "(temporarly unavailable)"
                            : ""}
                      </Button>
                  ) : (
                      <Button
                          className="btn btn-login"
                          disabled={!high_res_service_available}
                          onClick={handleOpenHighResolutionModal}
                      >
                        {t("High resolution data")}
                        {!high_res_service_available
                            ? "(temporarly unavailable)"
                            : ""}
                      </Button>
                  )}
                  <RequestHighResolutionPopup
                      open={modalOpenRequestHighResolution}
                      handleClose={handleCloseRequestHighResolutionModal}
                  />
                  <HighResolutionPopup
                      data={highResOrders}
                      open={modalOpenHighResolution}
                      handleClose={handleCloseHighResolutionModal}
                      openrequestmodal={handleOpenRequestHighResolutionModal}
                  />
                </Col>
              </Row>
            </Container>
          </div>
        </div>
      </div>
  );
};

export default Sidebar;
