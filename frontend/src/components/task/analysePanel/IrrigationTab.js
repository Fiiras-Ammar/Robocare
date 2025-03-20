import React, { useState, useEffect, useRef } from "react";
import "../../../assets/scss/weather.scss";
import {
    getSensorData,
    // getTaskWeather,
    // Detail_Task_Map,
    // getTaskForecast,
} from "../../../actions/sensorData.js";

import { submitIrrigationCalendarRequest, checkIrrigationCalendarGenerated, checkIrrigationCalendarRequest } from "../../../actions/irrigationCalendar.js"
import IrrigationCalendarRequestForm from "./irrigationCalendar/irrigationCalendarRequestPopup.js"

import StickyHeadTable from "./irrigationCalendarTable.js"

import { loadingBegin, loadingEnd } from "../../../actions/map.js";
import { useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import descriptions from '../../../utils/wetherDescription.json';


import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import IconButton from '@mui/material/IconButton';

import ListAltOutlinedIcon from '@mui/icons-material/ListAltOutlined';
import { showSnackbar } from "../../../actions/snackbar.js";

import { useTranslation } from "react-i18next";
import dayjs from 'dayjs';

import Graph from "./sensorGraph";

import { IoIosAdd, IoIosSearch } from 'react-icons/io';
import { MdOutlineCancel } from 'react-icons/md';
import Card from 'react-bootstrap/Card';
import { TiWeatherWindy } from "react-icons/ti";
import { VscCompass } from "react-icons/vsc";
import { WiHumidity } from "react-icons/wi";
import evapoIcon from '../../../assets/images/evapo.png'
import blurred_irrigation_table_img from '../../../assets/images/blurred_irrigation_table.jpeg'
import "owl.carousel/dist/assets/owl.carousel.css";
import "owl.carousel/dist/assets/owl.theme.default.css";
import OwlCarousel from "react-owl-carousel";
import LoadingButton from "@mui/lab/LoadingButton";

import { Line } from 'react-chartjs-2';
import { Container, Typography } from "@mui/material";

import { Button, Col, Row } from "react-bootstrap";
import Et0Graph from "./Et0Graph.js"
import { json } from "d3";
function formatDay(date) {
    const dayArray = date.getDay();
    const days = [
        "Sunday",
        "Monday",
        "Tuesday",
        "Wednesday",
        "Thursday",
        "Friday",
        "Saturday"
    ];
    const day = days[dayArray];
    return day;
}
const dateOptions = {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: 'numeric',
    hour12: true,
};



const IrrigationTab = () => {

    const task_id = useSelector((state) => state.mapReducer.taskIdDetails);
    const taskName = useSelector((state) => state.mapReducer.taskNameDetails);
    const country = useSelector((state) => state.mapReducer.countryFrDetails);
    const state = useSelector((state) => state.mapReducer.stateFrDetails);

    const [openCalendarRequestModal, setOpenCalendarRequestModal] = useState(false);

    const stateDistrict = useSelector(
        (state) => state.mapReducer.stateDistrictFrDetails
    );
    const county = useSelector((state) => state.mapReducer.countyFrDetails);
    const postcode = useSelector((state) => state.mapReducer.postcodeFrDetails);
    // const irrigationCalendarGenerated = useSelector((state) => state.irrigationCalendarReducer.irrigationCalendarGenerated);

    // const [irrigationCalendarGenerated, setirrigationCalendarGenerated] = useState(false);

    const [taskid, settaskid] = useState(null)
    const dispatch = useDispatch();
    const [lat, setLat] = useState(0);
    const [lng, setLng] = useState(0);
    const [currentWeather, setCurrentWeather] = useState(null);
    const [windForecast, setwindForecast] = useState(null)
    const [data, setData] = useState({});
    const [date, setDate] = useState(new Date());
    const [hasSensor, sethasSensor] = useState(false)
    const [irrigationCalendarGenerated, setirrigationCalendarGenerated] = useState(false)
    const [irrigationCalendarRequestSubmitted, setirrigationCalendarRequestSubmitted] = useState(false)

    const [MVsData, setMVsData] = useState({});
    const [MV1Max, setMV1Max] = useState(0);
    const [et0Data, setEt0Data] = useState([]);

    const [loading, setLoading] = useState(false);
    const [checkingCalendar, setCheckingCalendar] = useState(true);
    const refreshGraph = (minTemp, maxTemp, rain, labels) => { }

    // const generateCalendar = ()  =>{
    //     dispatch(

    const handleCloseIrrigationCalendarRequest = () => {
        setOpenCalendarRequestModal(false);
    };

    const handleOpenIrrigationCalendarRequest = () => {
        setOpenCalendarRequestModal(true);
    };

    const getCalendar = (formData) => {
        handleCloseIrrigationCalendarRequest()
        setLoading(true)
        setCheckingCalendar(true)
        dispatch(submitIrrigationCalendarRequest(task_id, formData)).then(res => {
            if (res.status == 200) {
                // setEt0Data(res.data.data)
                setirrigationCalendarRequestSubmitted(true)

                dispatch(showSnackbar("success", undefined, "Irrigation calendar request successfully submitted", "top", "right"))
            } else {
                setirrigationCalendarRequestSubmitted(false)
                setLoading(false)
                setCheckingCalendar(false)


                dispatch(showSnackbar("warning", undefined, "Irrigation calendar request failed", "top", "right"))
                // setloadingBtn(false)
            }


        })
    }
    // }
    const getMvsCSV = () => {
        let csv = "time,mv1,mv2,mv3\n"


        for (let i = 0; i < MVsData.mv1.length; i++) {
            csv += MVsData.mv1[i].date.split(".")[0].replace("T", " at ")
            csv += "," + MVsData.mv1[i].value
            csv += "," + MVsData.mv2[i].value
            csv += "," + MVsData.mv3[i].value
            csv += "\n"
        }

        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        let filename = taskName ? taskName + "__MV_1_2_3.csv" : "MV_1_2_3.csv";

        const link = document.createElement('a');
        if (link.download !== undefined) {
            const url = URL.createObjectURL(blob);
            link.setAttribute('href', url);
            link.setAttribute('download', filename);
            link.style.visibility = 'hidden';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        }
    }



    const handleGetSensorData = () => {

        dispatch(getSensorData(task_id)).then((response) => {

            if(response.data){
            let mvs_data = { "mv1": [], "mv2": [], "mv3": [] }
            let mvs_max = 0;

            response.data.data.forEach((item) => {
                const mv1 = parseFloat(item["mv1"])
                const mv2 = parseFloat(item["mv2"])
                const mv3 = parseFloat(item["mv3"])

                mvs_data.mv1.push({ "date": item["time"], "value": mv1.toFixed(2) })
                mvs_data.mv2.push({ "date": item["time"], "value": mv2.toFixed(2) })
                mvs_data.mv3.push({ "date": item["time"], "value": mv3.toFixed(2) })

                mvs_max = Math.max(mv1, mv2, mv3, mvs_max)

            })

            setMVsData(mvs_data);
            setMV1Max(mvs_max);}


        });

    }

    const { t } = useTranslation();

    useEffect(() => {
        if (!task_id) return
        settaskid(task_id)
        dispatch(getSensorData(task_id)).then((res) => {
            if (res.status === 200) {
                sethasSensor(true)
            }
        })
        handleGetSensorData()

    }, [task_id])


    useEffect(() => {
        if (!task_id) return
        setCheckingCalendar(true)

        dispatch(checkIrrigationCalendarGenerated(task_id)).then(res => {
            if (res.status == 200) {
                setirrigationCalendarGenerated(true)
                setEt0Data(res.data.data);
                // alert(JSON.stringify(setEt0Data))

            } else {
                setirrigationCalendarGenerated(false)
                setCheckingCalendar(false)

            }

        })
        setirrigationCalendarRequestSubmitted(true)

        dispatch(checkIrrigationCalendarRequest(task_id)).then(res => {
            if (res.status != 200) {
                setirrigationCalendarRequestSubmitted(false)
                // setLoading(false)
            }


        })

        
    }, [])

    return (
        <Container maxWidth="xl">

            <IrrigationCalendarRequestForm open={openCalendarRequestModal} handleClose={handleCloseIrrigationCalendarRequest} handleSubmit={getCalendar} />

            {/* id_project={projectId} project_name={projectName} */}

            {hasSensor && MVsData &&
                <Row className="mt-4 mb-4">
                    <div className="row" style={{ marginLeft: "10px" }}>
                        <Typography variant="h6">{t("Humidity sensor data")}</Typography>

                        <Col xs={12} sm={3} md={3} lg={3} className="d-flex justify-content-center align-items-center mb-2">

                            <LoadingButton
                                size="small"
                                color="primary"
                                loading={loading}
                                loadingPosition="start"
                                startIcon={<ListAltOutlinedIcon />}
                                variant="outlined"
                                onClick={getMvsCSV}>
                                <span>{t("CSV")}</span>
                            </LoadingButton>
                        </Col>

                        <Graph data={MVsData} data_max={MV1Max} />
                    </div>
                </Row>
            }

            <Row className="mt-4 mb-4">
                <div>
                    <Typography variant="h6">{t("Irrigation calendar")}</Typography>
                </div>

            </Row>
            {!irrigationCalendarGenerated && irrigationCalendarRequestSubmitted && task_id &&
                <Row className="mt-5 mb-5">


                    <div>
                        <Typography>{t("We've got your request! Your irrigation calendar will be displayed here once processed...")}</Typography>
                    </div>

                </Row>
            }
            {task_id && !checkingCalendar && !irrigationCalendarRequestSubmitted && !irrigationCalendarGenerated &&
                <Row className="mt-4 mb-5">
                    <div>
                        <Button disabled={loading} className="btn btn-login"
                            onClick={() => handleOpenIrrigationCalendarRequest()}>{t("Generate my irrigation calendar")}</Button>
                        <img width={"100%"} src={blurred_irrigation_table_img}/>
                    </div>

                </Row>
            }

            {irrigationCalendarGenerated && task_id &&
                <Row className="mt-4 mb-5">


                    <div>
                        <Typography>{t("Evapotranspiration levels (last 10 years)")}</Typography>
                        <Et0Graph data={et0Data} monthly_max={18} />

                    </div>


                </Row>
            }

            {irrigationCalendarGenerated && task_id &&
                <Row className="mt-5 mb-5">


                    <div>
                        <Typography>{t("2024 irrigation calendar for your plot")}</Typography>
                        <br/>

                        <StickyHeadTable data={et0Data}></StickyHeadTable>

                    </div>

                </Row>
            }

        </Container>
    )
}
export default IrrigationTab;
