import React from "react";
import Modal from '@mui/material/Modal';
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from 'react-redux';
import "../../../assets/scss/mainPanel.scss"
import { Container } from "@mui/material";
import { Col, Row } from "react-bootstrap";
import GraphPage from "../graph/GraphPage";
import WetherTab from "./WetherTab";
import TaskCalendar from "../calendar/Calendar.js";
import IrrigationTab from "./IrrigationTab";
import Backdrop from "@mui/material/Backdrop";
import Fade from "@mui/material/Fade";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import { blue, grey, red } from "@mui/material/colors";
import { getSensorData } from './../../../actions/sensorData';
import { useTranslation } from "react-i18next";
import {ACTIVE_PANE_STATE_SUCCESS} from "../../../utils/types";



const MainModal = ({ open, handleClose, idTask }) => {
    const taskName = useSelector((state) => state.mapReducer.taskNameDetails);
    const activePanelReducer = useSelector((state) => state.activePanelReducer.activePanel);
    const activePane = useSelector((state) => state.activePanelReducer.activePane);
    const [name, setname] = useState(null)
    const [activePanel, setactivePanel] = useState(activePanelReducer)
    const dispatch = useDispatch();
    const [hasSensor, sethasSensor] = useState(false)
    const [isFarmingPracticesActive, setIsFarmingPracticesActive] = useState(false);
    const isMobile = window.matchMedia("(max-width: 768px)").matches;
    useEffect(() => {
        if (activePane === 2) {
            setIsFarmingPracticesActive(true);
        } else {
            setIsFarmingPracticesActive(false);
        }
    }, [activePane]);
    useEffect(() => {
        if (!idTask) return
        dispatch(getSensorData(idTask)).then((res) => {
            if (res.status === 200) {
                sethasSensor(true)
            }
        })
    }, [idTask])
    useEffect(() => {

    }, [hasSensor])
    useEffect(() => {
        if (!taskName) return
        setname(taskName)
    }, [taskName])

    useEffect(() => {
        //if (!activePane) return
        setactivePanel(activePane)
    }, [activePane])

    const handleActivePane = (act) => {
        dispatch({
            type: ACTIVE_PANE_STATE_SUCCESS,
            payload: act,
        });
        setactivePanel(act);
        setIsFarmingPracticesActive(act === 2);
    };
    const { t } = useTranslation();

    const style = {
        position: "absolute",
        width: "100%",
        maxHeight: "100vh",
        minHeight: "100vh",
        bgcolor: "background.paper",
        borderRadius: "5px",
        boxShadow: 24,

        overflowY: "scroll",
        pt: 0
    };
    const theme = createTheme({
        palette: {
            primary: {
                main: blue[700],
            },
            secondary: {
                light: red[400],
                main: red[500],
                dark: red[600],
                contrastText: "#fff",
            },
            grey: {
                main: grey[700],
                contrastText: "#fff",
                dark: grey[800],
            },
            white: {
                main: "#ffffff",
                contrastText: "#ffffff",
                dark: "#ffffff",
            },
            IconColor: {
                main: "#6f9d2f",
                contrastText: "#fff",
            },
            success: {
                main: "#43a047",
                contrastText: "#fff",
            },
        },
    });
    return (
        <ThemeProvider theme={theme}>
            <Modal
                className="modal-analyse-panel"
                open={open}
                onClose={handleClose}
                closeAfterTransition
                slots={{ backdrop: Backdrop }}
                slotProps={{
                    backdrop: {
                        timeout: 500,
                    },
                }} aria-labelledby="modal-modal-title"
                aria-describedby="modal-modal-description">
                <Fade in={open}>
                    <Box sx={style}>
                        <Box
                            component="container"
                            className={`${isFarmingPracticesActive && isMobile ? "modal-header-box-mobile" : "modal-header-box"}   mb-4 d-flex justify-content-between align-items-center `}>
                            <Typography
                                id="transition-modal-title"
                                variant="h5"
                                component="h2"
                                className="text-center"
                                sx={{ color: "#ffffff" }}
                            >
                                {name}
                            </Typography>
                            <button type="button" class="btn-close btn-close-white" aria-label="Close" onClick={handleClose}></button>
                        </Box>
                        {/* </div> */}
                        <Container maxWidth="xl" className={isFarmingPracticesActive && isMobile  ? "farming-practices-active" : ""}>
                            <Row>
                                <Col xs={12}>
                                    <ul
                                        className="nav nav-tabs nav-tabs-custom nav-justified"
                                        role="tablist"
                                    >
                                        <li className="nav-item" onClick={() => handleActivePane(0)}>
                                            <a
                                                className={activePane === 0 ? "nav-link  sidebar-navlink active" : "nav-link  sidebar-navlink"}
                                                data-bs-toggle="tab"
                                                href="#courbe"
                                                role="tab"
                                            >
                                                <span className="d-sm-block">{t("Temporal map")}</span>
                                            </a>
                                        </li>
                                        <li className="nav-item" onClick={() => handleActivePane(2)}>
                                            <a
                                                className={activePane === 2 ? "nav-link  sidebar-navlink active" : "nav-link  sidebar-navlink"}
                                                data-bs-toggle="tab"
                                                href="#calendar"
                                                role="tab"
                                            >
                                                <span className="d-sm-block">{t("Farming practices")}</span>
                                            </a>
                                        </li>
                                        <li className="nav-item" onClick={() => handleActivePane(1)}>
                                            <a
                                                className={activePane === 1 ? "nav-link  sidebar-navlink active" : "nav-link  sidebar-navlink"}
                                                data-bs-toggle="tab"
                                                href="#meteo"
                                                role="tab"
                                            >
                                                <span className="d-sm-block">{t("Meteo")}</span>
                                            </a>
                                        </li>

                                        {/* {hasSensor === true && <li className="nav-item" onClick={() => handleActivePane(3)}> */}
                                        <li className="nav-item" onClick={() => handleActivePane(3)}>
                                            <a
                                                className={activePane === 3 ? "nav-link  sidebar-navlink active" : "nav-link  sidebar-navlink"}
                                                data-bs-toggle="tab"
                                                href="#sensor"
                                                role="tab"
                                            >
                                                <span className="d-sm-block">{t("Irrigation calendar")}</span>
                                            </a>

                                        </li>
                                    </ul>
                                    <div className="tab-content">
                                        <div className={activePanel === 0 ? "tab-pane active" : "tab-pane"} id="courbe" role="tabpanel">
                                            {activePanel === 0 ? <GraphPage /> : ""}
                                        </div>
                                        <div className={activePanel === 2 ? "tab-pane active" : "tab-pane"} id="calendar" role="tabpane3">
                                            {activePanel === 2 ? <TaskCalendar /> : ""}
                                        </div>
                                        <div className={activePanel === 1 ? "tab-pane active" : "tab-pane"} id="meteo" role="tabpane2">
                                            {activePanel === 1 ? <WetherTab /> : ""}
                                        </div>
                                        <div className={activePanel === 3 ? "tab-pane active" : "tab-pane"} id="{Irrigation calendar}" role="tabpane4">
                                            {activePanel === 3 ? <IrrigationTab /> : ""}
                                        </div>
                                    </div>
                                </Col>
                            </Row>
                        </Container>
                    </Box>
                </Fade>
            </Modal>

        </ThemeProvider>)
}
export default MainModal
