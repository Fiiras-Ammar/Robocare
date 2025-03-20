import React, { useEffect, useState } from "react";
import "../../assets/css/Sidebar.css"
import $ from "jquery";
import { change_accusation_dates, change_selected_date, get_dates } from "../../actions/task";
import { useSelector } from 'react-redux';
import Button from "react-bootstrap/Button";

import ButtonBootstrap from 'react-bootstrap/Button'
import { useDispatch } from "react-redux";

import { IoMdArrowDropleft } from "react-icons/io";
import { IoMdArrowDropright } from "react-icons/io";
import { Container, FormControl } from '@mui/material';

import { TextField } from "@mui/material";
import { useNavigate } from "react-router-dom";
import Col from "react-bootstrap/esm/Col";
import { PiPolygonLight } from "react-icons/pi";
import Row from "react-bootstrap/esm/Row";
import { MdSatelliteAlt } from "react-icons/md";
import { FaChartBar } from "react-icons/fa";

import OwlCarousel from 'react-owl-carousel';
import 'owl.carousel/dist/assets/owl.carousel.css';
import 'owl.carousel/dist/assets/owl.theme.default.css';
import { TbMapSearch } from "react-icons/tb";
import { getCulture, getDensityAll, getIrrigation, getTexture, getVarietyAll } from "../../actions/project";
import EditTaskPopup from './sidebars/EditTaskPopup';
import { useLeafletContext } from '@react-leaflet/core'
import { setClickEventFail, setClickEventSucess } from "../../actions/map";
import { isMobile } from 'react-device-detect';
import loading_spinner from '../../assets/images/Spinner-mini.svg'
import RequestHighResolutionPopup from "./requests/requestHighResolutionPopup";
import { get_request_high_resolution } from "../../actions/requestHighResolution";
import HighResolutionPopup from "./requests/HighResolutionPopup"
import GraphLayout from "./graphs/graphLayout";
import { useTranslation } from 'react-i18next';
import cookies from 'js-cookie';

const SideBarEdit = ({ vegetation, treeCount }) => {

  const dispatch = useDispatch()
  const [sidebarToogle, setsidebarToogle] = useState(true)
  const selected_date_btn = useSelector(state => state.mapReducer.SelectedDate)
  const selected_date_initial = useSelector(state => state.mapReducer.SelectedDateInitial)
  const dates = useSelector(state => state.mapReducer.AccusationDates)

  const taskIdDetailsEdit = useSelector(state => state.mapReducer.taskIdDetails)
  const taskNameDetailsEdit = useSelector(state => state.mapReducer.taskNameDetails)
  const surfaceDetailsEdit = useSelector(state => state.mapReducer.surfaceDetails)
  const ageDetailsEdit = useSelector(state => state.mapReducer.ageDetails)
  const plantation_dateEdit = useSelector(state => state.mapReducer.plantationDate)
  const cultureDetailsEdit = useSelector(state => state.mapReducer.cultureDetails)
  const textureDetailsEdit = useSelector(state => state.mapReducer.textureDetails)
  const densityDetailsEdit = useSelector(state => state.mapReducer.densityDetails)
  const varietyDetailsEdit = useSelector(state => state.mapReducer.varietyDetails)
  const irrigationTypeDetailsEdit = useSelector(state => state.mapReducer.irrigationTypeDetails)
  const salinityDetailsEdit = useSelector(state => state.mapReducer.salinityDetails)
  const efficiencyDetailsEdit = useSelector(state => state.mapReducer.efficiencyDetails)
  const has_requestEdit = useSelector(state => state.requestReducer.has_request)

  const [selectedDate, setselectedDate] = useState(null)
  const [selectedDateInitialstate, setselectedDateInitialstate] = useState(null)
  const [accusationDates, setaccusationDates] = useState(null)
  const [listCultureEdit, setlistCultureEdit] = useState(null)
  const [listTextureEdit, setlistTextureEdit] = useState(null)
  const [listIrrigationEdit, setlistIrrigationEdit] = useState(null)
  const [listVarietyEdit, setlistVarietyEdit] = useState(null)
  const [listDenstyEdit, setlistDenstyEdit] = useState(null)
  const [selectedVarietyEdit, setselectedVarietyEdit] = useState(null)
  const [selectedDensityEdit, setselectedDensityEdit] = useState(null)
  const [selectedCultureEdit, setselectedCultureEdit] = useState(null)
  const [selectedTextureEdit, setselectedTextureEdit] = useState(null)
  const [selectedIrrigationEdit, setselectedIrrigationEdit] = useState(null)
  const [modalOpenEditTask, setmodalOpenEditTask] = useState(false);

  const [selectedIndex, setselectedIndex] = useState(0)
  const [sidebarRef, setsidebarRef] = useState(null)

  const context = useLeafletContext();
  const [modalOpenRequestHighResolution, setmodalOpenRequestHighResolution] = useState(false)
  const [modalOpenHighResolution, setmodalOpenHighResolution] = useState(false)
  const { t } = useTranslation();
  const currentLanguageCode = cookies.get('i18next') || 'en';
  const langue = cookies.get("i18next") || "en";

  useEffect(() => {
  }, [has_requestEdit])
  useEffect(() => {
    if (isMobile) {
      if (sidebarToogle) {
        dispatch(setClickEventFail())
      } else {
        dispatch(setClickEventSucess())
      }
    }
  }, [sidebarToogle])

  useEffect(() => {
    if (!sidebarRef) return

    if (isMobile) {
      sidebarRef.addEventListener('touchstart', disableMapInteractions); // On touchstart
      sidebarRef.addEventListener('touchmove', disableMapInteractions); // On touchmove
    }
    sidebarRef.addEventListener('mouseenter', disableMapInteractions);
    sidebarRef.addEventListener('mouseleave', enableMapInteractions);
    return () => {
      sidebarRef.removeEventListener('mouseenter', disableMapInteractions);
      sidebarRef.removeEventListener('mouseleave', enableMapInteractions);
      sidebarRef.removeEventListener('touchstart', disableMapInteractions);
      sidebarRef.removeEventListener('touchend', enableMapInteractions);
      sidebarRef.removeEventListener('touchmove', enableMapInteractions);
    };
  }, [sidebarRef]);

  const disableMapInteractions = () => {
    dispatch(setClickEventFail())
  };
  const enableMapInteractions = () => {
    dispatch(setClickEventSucess())
  };

  const handleSideBar = () => {
    if (sidebarToogle == true) {
      setsidebarToogle(false)
      $(".sidebar").addClass("sidebar-closed")
      $(".sidebar").removeClass("sidebar-open")
      $(".sidebar-toogle").addClass("sidebar-toggle-closed")
      $(".sidebar-toogle").removeClass("sidebar-toogle-open")
    } else {
      setsidebarToogle(true)
      $(".sidebar").addClass("sidebar-open")
      $(".sidebar").removeClass("sidebar-closed")
      $(".sidebar-toogle").addClass("sidebar-toogle-open")
      $(".sidebar-toogle").removeClass("sidebar-toggle-closed")
    };
  }

  const handleOpenEditTaskModal = () => {
    setmodalOpenEditTask(true)
  }
  const handleCloseEditTaskModal = () => {
    setmodalOpenEditTask(false);
  };

  const handleOpenDroneApp = () => {
    if (taskNameDetailsEdit === "Safsaf") {
      window.open("https://app.drone.robocare.tn/login/?username=Bouassida&&password=ps8uWFjH2f696eZ4T", "_blank");

    } else if (taskNameDetailsEdit === "Taous") {
      window.open("https://app.drone.robocare.tn/login/?username=fruitflynet2&&password=H0127JB4369MsbROs", "_blank");
    }
  }
  // alert(polygonCoords)
  const AreaSurface = useSelector(state => state.mapReducer.AreaSurface)


  useEffect(() => {
    if (!taskIdDetailsEdit) return
    dispatch(get_dates(taskIdDetailsEdit)).then((res_date) => {
      dispatch(change_accusation_dates(res_date.data.data["dates"]))
    })
  }, [taskIdDetailsEdit])

  const changeSelectedDate = (date, index) => {
    setselectedIndex(index)
    dispatch(change_selected_date(date))
  }

  useEffect(() => {
    dispatch(getCulture(langue)).then((res) => {
      setlistCultureEdit(res.data)
    })
    dispatch(getTexture(langue)).then((res) => {
      setlistTextureEdit(res.data)
    })
    dispatch(getIrrigation(langue)).then((res) => {
      setlistIrrigationEdit(res.data)
    })
    dispatch(getVarietyAll()).then((res) => {
      setlistVarietyEdit(res.data)
    })
    dispatch(getDensityAll()).then((res) => {
      setlistDenstyEdit(res.data)
    })
  }, [])


  useEffect(() => {
    if (!taskIdDetailsEdit) return
    dispatch(get_request_high_resolution(taskIdDetailsEdit)).then((res) => {
    })
  }, [taskIdDetailsEdit])

  useEffect(() => {
    if (!listVarietyEdit) return
    const selectedItem = listVarietyEdit.find(item => item.id === varietyDetailsEdit);
    if (selectedItem) {
      setselectedVarietyEdit(selectedItem)
    } else {
      setselectedVarietyEdit(null)
    }
  }, [listVarietyEdit, varietyDetailsEdit])

  useEffect(() => {
    if (!listCultureEdit) return
    const selectedItem = listCultureEdit.find(item => item.id === cultureDetailsEdit);
    if (selectedItem) {
      setselectedCultureEdit(selectedItem)
    }
  }, [listCultureEdit, cultureDetailsEdit])

  useEffect(() => {
    if (!listTextureEdit) return
    const selectedItem = listTextureEdit.find(item => item.id === textureDetailsEdit);
    if (selectedItem) {
      setselectedTextureEdit(selectedItem)
    } else {
      setselectedTextureEdit(null)
    }
  }, [listTextureEdit, textureDetailsEdit])

  useEffect(() => {
    if (!listIrrigationEdit) return
    const selectedItem = listIrrigationEdit.find(item => item.id === irrigationTypeDetailsEdit);
    if (selectedItem) {
      setselectedIrrigationEdit(selectedItem)
    } else {
      setselectedIrrigationEdit(null)
    }
  }, [listIrrigationEdit, irrigationTypeDetailsEdit])

  useEffect(() => {
    if (!listDenstyEdit) return
    const selectedItem = listDenstyEdit.find(item => item.id === densityDetailsEdit);
    if (selectedItem) {
      setselectedDensityEdit(selectedItem)
    } else {
      setselectedDensityEdit(null)
    }
  }, [listDenstyEdit, densityDetailsEdit])



  useEffect(() => {
    setselectedDate(selected_date_btn)
  }, [selected_date_btn])

  useEffect(() => {
    setselectedDateInitialstate(selected_date_initial)
  }, [selected_date_initial])


  useEffect(() => {
    setaccusationDates(dates)
  }, [dates])


  const options = {
    0: {
      items: 2,
    },
    330: {
      items: 3,
    },
    417: {
      items: 4,
    },
    600: {
      items: 4,
    },
    700: {
      items: 4,
    },
    1000: {
      items: 4,
    },
    1200: {
      items: 4,
    }
  };
  // if (accusationDates === null) {
  //   return <div>Loading...</div>; // or any other loading indicator
  // }
  const handleOpenRequestHighResolutionModal = () => {
    handleCloseHighResolutionModal();
    setmodalOpenRequestHighResolution(true);
  }
  const handleCloseRequestHighResolutionModal = () => {
    setmodalOpenRequestHighResolution(false);
  };

  const handleOpenHighResolutionModal = () => {
    handleCloseRequestHighResolutionModal()
    setmodalOpenHighResolution(true);
  }
  const handleCloseHighResolutionModal = () => {
    setmodalOpenHighResolution(false);
  };

  return (
    <div className={sidebarToogle ? 'sidebar sidebar-open' : 'sidebar sidebar-closed'} ref={setsidebarRef}>
      {listCultureEdit && listDenstyEdit && listVarietyEdit && listIrrigationEdit && listTextureEdit && <EditTaskPopup open={modalOpenEditTask} handleClose={handleCloseEditTaskModal} id_task={taskIdDetailsEdit} Ename={taskNameDetailsEdit} Eage={ageDetailsEdit} Eculture={cultureDetailsEdit} Etexture={textureDetailsEdit} Edensity={densityDetailsEdit} Eirrigation={irrigationTypeDetailsEdit} Esalinity={salinityDetailsEdit} Eefficiency={efficiencyDetailsEdit} Evariety={varietyDetailsEdit} listCultureP={listCultureEdit} listDensityP={listDenstyEdit} listIrrigationP={listIrrigationEdit} listTextureP={listTextureEdit} listVarietyP={listVarietyEdit} Eplantation_date={plantation_dateEdit} />}
      <RequestHighResolutionPopup open={modalOpenRequestHighResolution} handleClose={handleCloseRequestHighResolutionModal} />
      <HighResolutionPopup open={modalOpenHighResolution} handleClose={handleCloseHighResolutionModal} openrequestmodal={handleOpenRequestHighResolutionModal} />
      {sidebarToogle ?
        <div className="container no-padding">
          <ButtonBootstrap className={sidebarToogle ? 'sidebar-toogle-open sidebar-toogle' : 'sidebar-toggle-closed sidebar-toogle'} onClick={handleSideBar}><IoMdArrowDropleft />  </ButtonBootstrap>
          <div className="inner-sidebar">
            <Container className="area-container">
              <Row className="row-sidebar">
                <Col xs={12} className="d-flex" style={{ paddingRight: "20px", paddingLeft: "20px" }}>
                  <div className="icon-wrapper">
                    <PiPolygonLight style={{ color: "#fff", fontSize: "30px" }} />
                  </div>
                  <div className="area-title align-items-center d-flex">
                    <h4 style={{ margin: "0px" }}>{taskNameDetailsEdit}</h4>
                  </div>
                </Col>
              </Row>

              <Row className="row-sidebar">
                <Col xs={5} className="d-flex">
                  <span className="area-label">{t("Area :")}</span>
                  <span className="area-value">{surfaceDetailsEdit ? surfaceDetailsEdit : AreaSurface} Ha</span>
                </Col>
                <Col xs={7} className="d-flex justify-content-end">
                  {has_requestEdit === false ?
                    <Button className="btn btn-login" onClick={handleOpenRequestHighResolutionModal}>{t("Request high resolution data")}</Button>
                    :
                    <Button className="btn btn-login" onClick={handleOpenHighResolutionModal}>{t("High resolution data")}</Button>
                  }
                </Col>
              </Row>
              {treeCount ?
                <Row className="row-sidebar">
                  <Col xs={12} className="d-flex">
                    <span className="area-label">{t("Total tree number :")}</span>
                    <span className="area-value">{treeCount}</span>
                  </Col>
                </Row>
                : ""}


              {/* <Row className="row-sidebar">

                {vegetation ? (Object.keys(vegetation).map((key) => {
                  const item = vegetation[key];
                  if ("min" in item) {
                    return (
                      <Col xs={6} key={key}>
                        {key} : min : {item.min}
                      </Col>
                    );
                  }
                  return null;
                })) : ""}

              </Row>
              <Row className="row-sidebar">

                {vegetation ? (Object.keys(vegetation).map((key) => {
                  const item = vegetation[key];
                  if ("max" in item) {
                    return (
                      <Col xs={6} key={key}>
                        {key} : max : {item.max}
                      </Col>
                    );
                  }
                  return null;
                })) : ""}

              </Row> */}

            </Container>
            <Container className="area-container">
              <Row className="row-sidebar">
                <Col xs={12} className="d-flex" style={{ paddingRight: "20px", paddingLeft: "20px" }}>
                  <div className="icon-wrapper">
                    <FaChartBar style={{ color: "#fff", fontSize: "30px", padding: "3px" }} />
                  </div>
                  <div className="area-title align-items-center d-flex">
                    <h4 style={{ margin: "0px" }}>{t("Indexs Curve over time")}</h4>
                  </div>
                </Col>
              </Row>
              <Row className="row-sidebar">
                <GraphLayout />
              </Row>
              <Row className="row-sidebar">
                <Col xs={12} className="d-flex" style={{ paddingRight: "20px", paddingLeft: "20px" }}>
                  <div className="icon-wrapper">
                    <MdSatelliteAlt style={{ color: "#fff", fontSize: "30px" }} />
                  </div>
                  <div className="area-title align-items-center d-flex">
                    <h4 style={{ margin: "0px" }}>{t("Available satellite Imagery")}</h4>
                  </div>
                </Col>
              </Row>
              <Row className="row-sidebar">
                <div className="owl-carousel-container" >
                  {accusationDates && selectedDateInitialstate ?
                    <OwlCarousel className='owl-theme' loop margin={10} nav items={3} mouseDrag={true} dots={false} responsive={options} startPosition={selectedIndex} rewind={false} >
                      {accusationDates.map((item, index) => (
                        <div className={selectedDate === item.date || selectedDateInitialstate === item.date ? "item owl-item-container active" : "item owl-item-container"} key={index} onClick={() => changeSelectedDate(item.date, index)} >
                          <div className="item-inner-content">
                            <img src={`${process.env.REACT_APP_API_URL}${item.image}`} alt={item.date} className="owl-item-img" />
                            <div className="owl-item-date">{item.date}</div>
                          </div>
                        </div>
                      ))}
                    </OwlCarousel>
                    : <div className="row">
                      <div className="col-12 text-center justify-content-center d-flex">
                        <div className="loading-div" >
                        </div>
                      </div>
                      <div className="col-12 text-center">
                        <span style={{ fontSize: "15px", fontWeight: "600" }}>{t("Loading ...")}</span>
                      </div>
                    </div>
                  }
                </div>
              </Row>
            </Container >
            <Container className="area-container">
              <Row className="row-sidebar">
                <Col xs={12} className="d-flex" style={{ paddingRight: "20px", paddingLeft: "20px" }}>
                  <div className="icon-wrapper">
                    <TbMapSearch style={{ color: "#fff", fontSize: "30px" }} />
                  </div>
                  <div className="area-title align-items-center d-flex">
                    <h4 style={{ margin: "0px" }}>{t("Field Details")}</h4>
                    <div className="edit-enquete">
                      <Button className="btn btn-login" onClick={() => handleOpenEditTaskModal(taskIdDetailsEdit)}>{t("Edit survey")}</Button>
                    </div>
                    {taskNameDetailsEdit === "Safsaf" || taskNameDetailsEdit === "Taous" ?
                      <div className="edit-enquete">
                        <Button className="btn btn-login" onClick={() => handleOpenDroneApp()}>{t("Drone data")}</Button>
                      </div> : ''}
                  </div>
                </Col>
              </Row>
              <Row className="row-sidebar">
                <Col xs={6} className="d-flex" style={{ paddingRight: "20px", paddingLeft: "20px" }}>
                  <FormControl required sx={{ m: 1, minWidth: "100%" }} size="small">
                    {selectedCultureEdit ?
                      < React.Fragment key={selectedCultureEdit.id} >
                        {
                          <TextField
                            label={t("Culture")}
                            value={selectedCultureEdit[`name_${currentLanguageCode.toLowerCase()}`]}

                            InputProps={{
                              readOnly: true,
                            }}
                            InputLabelProps={{ shrink: true }}
                            size="small"
                          />
                        }
                      </React.Fragment>
                      :
                      < React.Fragment  >
                        {
                          <TextField
                            label={t("Culture")}
                            value=""
                            InputProps={{
                              readOnly: true,
                            }}
                            InputLabelProps={{ shrink: true }}
                            size="small"
                          />
                        }
                      </React.Fragment>
                    }



                  </FormControl>
                </Col>
                <Col xs={6} className="d-flex" style={{ paddingRight: "20px", paddingLeft: "20px" }}>
                  <FormControl required sx={{ m: 1, minWidth: "100%" }} size="small">
                    {selectedVarietyEdit ?
                      < React.Fragment key={selectedVarietyEdit.id} >
                        {
                          <TextField
                            label={t("Variety")}
                            value={selectedVarietyEdit[`name_${currentLanguageCode.toLowerCase()}`]}

                            InputProps={{
                              readOnly: true,
                            }}
                            InputLabelProps={{ shrink: true }}
                            size="small"
                          />
                        }
                      </React.Fragment>
                      :
                      < React.Fragment  >
                        {
                          <TextField
                            label={t("Variety")}
                            value=""
                            InputProps={{
                              readOnly: true,
                            }}
                            InputLabelProps={{ shrink: true }}
                            size="small"
                          />
                        }
                      </React.Fragment>
                    }

                  </FormControl>
                </Col>
                <Col xs={6} className="d-flex" style={{ paddingRight: "20px", paddingLeft: "20px" }}>
                  <FormControl required sx={{ m: 1, minWidth: "100%" }} size="small">

                    {selectedDensityEdit ?
                      < React.Fragment key={selectedDensityEdit.id} >
                        {
                          <TextField
                            label={t("Density")}
                            value={selectedDensityEdit[`name_${currentLanguageCode.toLowerCase()}`]}

                            InputProps={{
                              readOnly: true,
                            }}
                            InputLabelProps={{ shrink: true }}
                            size="small"
                          />
                        }
                      </React.Fragment>
                      :
                      < React.Fragment  >
                        {
                          <TextField
                            id="outlined-read-only-input"
                            label={t("Density")}
                            value=""
                            InputProps={{
                              readOnly: true,
                            }}
                            InputLabelProps={{ shrink: true }}
                            size="small"
                          />
                        }
                      </React.Fragment>
                    }
                  </FormControl>
                </Col>
                <Col xs={6} className="d-flex" style={{ paddingRight: "20px", paddingLeft: "20px" }}>
                  <FormControl sx={{ m: 1, minWidth: "100%" }} size="small">
                    <TextField
                      label={t("Age")}
                      value={ageDetailsEdit}
                      InputProps={{
                        readOnly: true,
                      }}
                      InputLabelProps={{ shrink: true }}
                      size="small"
                    />
                  </FormControl>
                </Col>
                <Col xs={6} className="d-flex" style={{ paddingRight: "20px", paddingLeft: "20px" }}>
                  <FormControl sx={{ m: 1, minWidth: "100%" }} size="small">
                    <TextField
                      label={t("Plantation age")}
                      value={plantation_dateEdit}
                      InputProps={{
                        readOnly: true,
                      }}
                      InputLabelProps={{ shrink: true }}
                      size="small"
                    />
                  </FormControl>
                </Col>
                <Col xs={6} className="d-flex" style={{ paddingRight: "20px", paddingLeft: "20px" }}>
                  <FormControl required sx={{ m: 1, minWidth: "100%" }} size="small">
                    {selectedTextureEdit ?
                      < React.Fragment key={selectedTextureEdit.id} >
                        {
                          <TextField
                            label={t("Texture")}
                            value={selectedTextureEdit[`name_${currentLanguageCode.toLowerCase()}`]}

                            InputProps={{
                              readOnly: true,
                            }}
                            InputLabelProps={{ shrink: true }}
                            size="small"
                          />
                        }
                      </React.Fragment>
                      :
                      < React.Fragment  >
                        {
                          <TextField
                            label={t("Texture")}
                            value=""
                            InputProps={{
                              readOnly: true,
                            }}
                            InputLabelProps={{ shrink: true }}
                            size="small"
                          />
                        }
                      </React.Fragment>
                    }
                  </FormControl>
                </Col>
                <Col xs={6} className="d-flex" style={{ paddingRight: "20px", paddingLeft: "20px" }}>
                  <FormControl sx={{ m: 1, minWidth: "100%" }} size="small">
                    <TextField
                      label={t("Water Salinity")}
                      value={salinityDetailsEdit}
                      InputProps={{
                        readOnly: true,
                      }}
                      InputLabelProps={{ shrink: true }}
                      size="small"
                    />
                  </FormControl>
                </Col>
                <Col xs={6} className="d-flex" style={{ paddingRight: "20px", paddingLeft: "20px" }}>
                  <FormControl required sx={{ m: 1, minWidth: "100%" }} size="small">
                    {selectedIrrigationEdit ?
                      < React.Fragment key={selectedIrrigationEdit.id} >
                        {
                          <TextField
                            label={t("Irrigation Type")}
                            value={selectedIrrigationEdit[`name_${currentLanguageCode.toLowerCase()}`]}

                            InputProps={{
                              readOnly: true,
                            }}
                            InputLabelProps={{ shrink: true }}
                            size="small"
                          />
                        }
                      </React.Fragment>
                      :
                      < React.Fragment  >
                        {
                          <TextField
                            label={t("Irrigation Type")}
                            value=""
                            InputProps={{
                              readOnly: true,
                            }}
                            InputLabelProps={{ shrink: true }}
                            size="small"
                          />
                        }
                      </React.Fragment>
                    }
                  </FormControl>
                </Col>
                <Col xs={6} className="d-flex" style={{ paddingRight: "20px", paddingLeft: "20px" }}>
                  <FormControl sx={{ m: 1, minWidth: "100%" }} size="small">
                    <TextField
                      label={t("Efficiency")}
                      value={efficiencyDetailsEdit}
                      InputProps={{
                        readOnly: true,
                      }}
                      InputLabelProps={{ shrink: true }}
                      size="small"
                    />
                  </FormControl>
                </Col>

              </Row>
            </Container>
          </div>
        </div>
        : <ButtonBootstrap className={sidebarToogle ? 'sidebar-toogle-open sidebar-toogle' : 'sidebar-toggle-closed sidebar-toogle'} onClick={handleSideBar}>{sidebarToogle ? <IoMdArrowDropleft style={{ fontSize: "30px", color: "#000" }} /> : <IoMdArrowDropright style={{ fontSize: "20px", color: "#000" }} />}</ButtonBootstrap>
      }

    </div >
  )

}

export default SideBarEdit
