import { Container, FormControl, TextField } from "@mui/material";
import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import Col from "react-bootstrap/esm/Col";
import Row from "react-bootstrap/esm/Row";
import "../../assets/css/icons.css"
import { PiPolygonLight } from "react-icons/pi";
import Button from "react-bootstrap/Button";
import { add_task } from "../../actions/task";
import { AiOutlineCheck } from "react-icons/ai";
import { useNavigate } from "react-router-dom";
import $ from 'jquery'
import { isMobile } from 'react-device-detect';
import { IoMdArrowDropleft } from "react-icons/io";
import { IoMdArrowDropright } from "react-icons/io";
import ButtonBootstrap from 'react-bootstrap/Button'
import { setClickEventFail, setClickEventSucess } from "../../actions/map";
import { getCulture, getDensityAll, getIrrigation, getTexture, getVarietyAll } from "../../actions/project";
import { TbMapSearch } from "react-icons/tb";
import { useTranslation } from 'react-i18next';
import cookies from "js-cookie";


const SideBarAdd = ({ id_project, state }) => {
    const { name, age, culture, texture, salinity, density, irrigation, efficiency, variety } = state;
    const AreaSurface = useSelector(state => state.mapReducer.AreaSurface)
    const AreaOfIntrest = useSelector(state => state.mapReducer.AreaOfIntrest)
    const [sidebarRef, setsidebarRef] = useState(null)
    const [sidebarToogle, setsidebarToogle] = useState(true)
    const [listCulture, setlistCulture] = useState(null)
    const [listTexture, setlistTexture] = useState(null)
    const [listIrrigation, setlistIrrigation] = useState(null)
    const [selectedVariety, setselectedVariety] = useState(null)
    const [selectedDensity, setselectedDensity] = useState(null)
    const [listVariety, setlistVariety] = useState(null)
    const [listDensty, setlistDensty] = useState(null)
    const langue = cookies.get("i18next") || "en";

    const dispatch = useDispatch()
    const navigate = useNavigate()
    const { t } = useTranslation();

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

    useEffect(() => {
        dispatch(getCulture(langue)).then((res) => {
            setlistCulture(res.data)
        })
        dispatch(getTexture(langue)).then((res) => {
            setlistTexture(res.data)
        })
        dispatch(getIrrigation(langue)).then((res) => {
            setlistIrrigation(res.data)
        })
        dispatch(getVarietyAll()).then((res) => {
            setlistVariety(res.data)
        })
        dispatch(getDensityAll()).then((res) => {
            setlistDensty(res.data)
        })
    }, [])

    useEffect(() => {
        if (!listVariety) return
        const selectedItem = listVariety.find(item => item.id === variety);
        if (selectedItem) {
            setselectedVariety(selectedItem)
        } else {
            setselectedVariety(null)
        }
    }, [listVariety, variety])

    useEffect(() => {
        if (!listDensty) return
        const selectedItem = listDensty.find(item => item.id === density);
        if (selectedItem) {
            setselectedDensity(selectedItem)
        } else {
            setselectedDensity(null)
        }
    }, [listDensty, density])
    const AddTask = () => {
        dispatch(add_task(id_project, AreaOfIntrest, AreaSurface, name, age, culture, texture, salinity, density, irrigation, efficiency, variety)).then((res) => {
            navigate(`/task/detail/${res.task.id}`)
        })
    }

    return (
        <div className={sidebarToogle ? 'sidebar sidebar-open' : 'sidebar sidebar-closed'} ref={setsidebarRef} style={{ height: "420px" }}>
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
                                        <h4 style={{ margin: "0px" }}>{name}</h4>
                                    </div>
                                </Col>
                            </Row>

                            <Row className="row-sidebar">
                                <Col xs={4} className="d-flex">
                                    <span className="area-label">{t("Area :")}</span>
                                    <span className="area-value">{AreaSurface} Ha</span>
                                </Col>
                                <Col xs={8} className="d-flex justify-content-end">
                                    {AreaOfIntrest ?
                                        <Button
                                            variant="contained"
                                            style={{
                                                backgroundColor: "#6f9d2f",
                                                color: "#fff",
                                            }}
                                            size="small" startIcon={<AiOutlineCheck />}
                                            onClick={AddTask}
                                        >
                                            {t("Confirm & continue")}
                                        </Button>
                                        :
                                        <Button disabled
                                            variant="contained"
                                            style={{
                                                backgroundColor: "#7f7f7f",
                                                color: "#fff"
                                            }}
                                            size="small" startIcon={<AiOutlineCheck />}
                                        >
                                            {t("You have to draw your field !")}
                                        </Button>
                                    }
                                </Col>
                            </Row>
                        </Container>
                        <Container className="area-container">
                            <Row className="row-sidebar">
                                <Col xs={12} className="d-flex" style={{ paddingRight: "20px", paddingLeft: "20px" }}>
                                    <div className="icon-wrapper">
                                        <TbMapSearch style={{ color: "#fff", fontSize: "30px" }} />
                                    </div>
                                    <div className="area-title align-items-center d-flex">
                                        <h4 style={{ margin: "0px" }}>{t("Field Details")}</h4>
                                    </div>
                                </Col>
                            </Row>
                            <Row className="row-sidebar">
                                <Col xs={6} className="d-flex" style={{ paddingRight: "20px", paddingLeft: "20px" }}>
                                    <FormControl required sx={{ m: 1, minWidth: "100%" }} size="small">
                                        {listCulture && listCulture.length > 0 && listCulture.map((item) => (
                                            < React.Fragment key={item.id} >
                                                {
                                                    item.id === culture && (
                                                        <TextField
                                                            key={item.id}
                                                            id="outlined-read-only-input"
                                                            label={t("Culture")}
                                                            value={item.name_fr}
                                                            InputProps={{
                                                                readOnly: true,
                                                            }}
                                                            InputLabelProps={{ shrink: true }}
                                                            size="small"
                                                        />
                                                    )
                                                }
                                            </React.Fragment>
                                        ))}
                                    </FormControl>
                                </Col>
                                <Col xs={6} className="d-flex" style={{ paddingRight: "20px", paddingLeft: "20px" }}>
                                    <FormControl required sx={{ m: 1, minWidth: "100%" }} size="small">
                                        {selectedVariety ?
                                            < React.Fragment key={selectedVariety.id} >
                                                {
                                                    <TextField
                                                        key={selectedVariety.id}
                                                        id="outlined-read-only-input"
                                                        label={t("Variety")}
                                                        value={selectedVariety.name_fr}
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
                                        {selectedDensity ?
                                            < React.Fragment key={selectedDensity.id} >
                                                {
                                                    <TextField
                                                        key={selectedDensity.id}
                                                        id="outlined-read-only-input"
                                                        label={t("Density")}
                                                        value={selectedDensity.name_fr}
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
                                            id="outlined-read-only-input"
                                            label={t("Age")}
                                            value={age}
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
                                        {listTexture && listTexture.length > 0 && listTexture.map((item) => (
                                            < React.Fragment key={item.id} >
                                                {

                                                    item.id === texture && (
                                                        <TextField
                                                            key={item.id}
                                                            id="outlined-read-only-input"
                                                            label={t("Texture")}
                                                            value={item.name_fr}
                                                            InputProps={{
                                                                readOnly: true,
                                                            }}
                                                            InputLabelProps={{ shrink: true }}
                                                            size="small"
                                                        />
                                                    )
                                                }
                                            </React.Fragment>
                                        ))}
                                    </FormControl>
                                </Col>
                                <Col xs={6} className="d-flex" style={{ paddingRight: "20px", paddingLeft: "20px" }}>
                                    <FormControl sx={{ m: 1, minWidth: "100%" }} size="small">
                                        <TextField
                                            id="outlined-read-only-input"
                                            label={t("Water Salinity")}
                                            value={salinity}
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
                                        {listIrrigation && listIrrigation.length > 0 && listIrrigation.map((item) => (
                                            < React.Fragment key={item.id} >
                                                {
                                                    item.id === irrigation && (
                                                        <TextField
                                                            key={item.id}
                                                            id="outlined-read-only-input"
                                                            label={t("Irrigation Type")}
                                                            value={item.name_fr}
                                                            InputProps={{
                                                                readOnly: true,
                                                            }}
                                                            InputLabelProps={{ shrink: true }}
                                                            size="small"
                                                        />
                                                    )
                                                }
                                            </React.Fragment>
                                        ))}
                                    </FormControl>
                                </Col>
                                <Col xs={6} className="d-flex" style={{ paddingRight: "20px", paddingLeft: "20px" }}>
                                    <FormControl sx={{ m: 1, minWidth: "100%" }} size="small">
                                        <TextField
                                            id="outlined-read-only-input"
                                            label={t("Efficiency (1-100)%")}
                                            value={efficiency}
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

        </div>
    )
}

export default SideBarAdd
