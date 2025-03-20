import { Container } from '@mui/material'
import React, { useEffect, useState } from 'react'
import { Card, Col, Row } from 'react-bootstrap'
import { useDispatch, useSelector } from 'react-redux';
import { Detail_Task_Map, getTaskForecast, getTaskWeather } from '../../../actions/wether';
import { TiWeatherWindy } from "react-icons/ti";
import { WiHumidity } from "react-icons/wi";
import { VscCompass } from "react-icons/vsc";
import WeatherCodeList from '../../../utils/WeatherCode.json'
import { setClickEventFail, setClickEventSucess } from '../../../actions/map';
import { isMobile } from "react-device-detect";
import ThermometeerCelsuisIcon from '../../../assets/images/icons/weather/thermometer-celsius.svg'
import barometerIcon from '../../../assets/images/icons/weather/barometer.svg'
import raindMesureIcon from '../../../assets/images/icons/weather/raindrop-measure.svg'
import humidityIcon from '../../../assets/images/icons/weather/humidity.svg'
import uvIcon from '../../../assets/images/icons/weather/uv-index.svg'
import windsvgIcon from '../../../assets/images/icons/weather/wind.svg'
import raindropIcon from '../../../assets/images/icons/weather/raindrop.svg'
import tideHighIcon from '../../../assets/images/icons/weather/tide-high.svg'

const WeatherBlock = ({ CalledFrom, openModal }) => {

    //redux selector
    const stateDistrict = useSelector(
        (state) => state.mapReducer.stateDistrictFrDetails
    );
    const task_id = useSelector((state) => state.mapReducer.taskIdDetails);
    ///////////////////////
    // useState declaration
    const [currentdate, setcurrentdate] = useState(null)
    const [lat, setLat] = useState(0);
    const [lng, setLng] = useState(0);
    const [taskid, settaskid] = useState(null)
    const dispatch = useDispatch();
    const [currentWeather, setCurrentWeather] = useState(null);
    const [windForecast, setwindForecast] = useState(null)
    const [weatherIconCode, setweatherIconCode] = useState(null)
    const [blockRef, setblockRef] = useState(null);

    ///////////////////////////////
    //const variables
    const dateOptions = {
        month: 'short',  // Display the month as a three-letter abbreviation (e.g., "Feb")
        day: 'numeric',   // Display the day of the month
        hour: 'numeric',  // Display the hours
        minute: 'numeric', // Display the minutes
        hour12: true,     // Use 12-hour clock format
    };
    const windCode = ["N", "N/NE", "NE", "E/NE", "E", "E/SE", "SE", "S/SE", "S", "S/SW", "SW", "W/SW", "W", "W/NW", "NW", "N/NW"]
    ///////////////////////////////
    // use Effects block
    useEffect(() => {
        if (!task_id) return
        settaskid(task_id)
    }, [task_id])
    useEffect(() => {
        if (!taskid) return
        dispatch(Detail_Task_Map(taskid)).then((res) => {
            setLat(res.data.lat);
            setLng(res.data.lng);
        })
    }, [taskid])

    useEffect(() => {
        if (!lat) return
        dispatch(getTaskWeather(lat, lng)).then((response) => {
            setCurrentWeather(response);
            // const humanDate = new Date(response.dt * 1000).toLocaleString();
            const humanDate = new Date(response.current.dt * 1000).toLocaleString('en-US', dateOptions);

            setcurrentdate(humanDate)
        })
    }, [lat]);
    useEffect(() => {
        if (!currentWeather) return
        const w = currentWeather.current.wind_deg
        const i = Math.floor(w / 22.5);
        setwindForecast(windCode[i])
        const WeatherIcon = WeatherCodeList[currentWeather.current.weather[0].icon]
        const IconFile = require(`../../../assets/images/icons/weather/${WeatherIcon}.svg`);

        setweatherIconCode(IconFile)
    }, [currentWeather])
    useEffect(() => {
        if (!blockRef) return;

        if (isMobile) {
            blockRef.addEventListener("touchstart", disableMapInteractions); // On touchstart
            blockRef.addEventListener("touchmove", disableMapInteractions); // On touchmove
        }
        blockRef.addEventListener("mouseenter", disableMapInteractions);
        blockRef.addEventListener("mouseleave", enableMapInteractions);
        return () => {
            blockRef.removeEventListener("mouseenter", disableMapInteractions);
            blockRef.removeEventListener("mouseleave", enableMapInteractions);
            blockRef.removeEventListener("touchstart", disableMapInteractions);
            blockRef.removeEventListener("touchend", enableMapInteractions);
            blockRef.removeEventListener("touchmove", enableMapInteractions);
        };
    }, [blockRef]);
    const disableMapInteractions = () => {
        dispatch(setClickEventFail());
    };
    const enableMapInteractions = () => {
        dispatch(setClickEventSucess());
    };
    ///////////////////////

    return (
        <>
            {currentWeather != null ?
                <Container className='no-padding block-task-weather' onClick={() => openModal && openModal(1)}>
                    <Col xs={12} md={12} lg={12} xl={12} className="mb-2">
                        {CalledFrom === "Sidebar" ?
                            <>
                                {/* <Container className='px-1'>
                                <Row>
                                    <Col xs={12} className="d-flex justify-content-center align-items-center no-padding">
                                        <Col xs="auto" className='mr-1'><span className="card-wether-header">{stateDistrict ? stateDistrict : ""}</span></Col>
                                        <Col xs="auto"><span className="card-wether-date">{currentdate}</span></Col>
                                    </Col>
                                </Row>
                            </Container> */}
                                <Container className="px-2 pr-2 ">
                                    <Row>
                                        <Col xs={12} className="d-flex justify-content-around align-items-center">

                                            <span class="temp-title"> {currentWeather.current.temp}°c</span>


                                            <img src={weatherIconCode} width="80px" />

                                            {/* <span class="temp-title"> {currentWeather.current.temp}°c</span> <img src={"https://openweathermap.org/img/wn/" + currentWeather.current.weather[0].icon + "\@2x.png"} width='100px' /> */}

                                        </Col>
                                    </Row>
                                    <Row className="mb-3">
                                        <Col xs={12} className="d-flex justify-content-center align-items-center">
                                            <span id="current-day ">Feels like {currentWeather.current.feels_like}°C. {currentWeather.current.weather[0].main}, {currentWeather.current.weather[0].description} </span>
                                        </Col>
                                    </Row>
                                    <Row className="justify-content-center align-items-center">
                                        <Col xs={6} className="text-center no-padding-left">
                                            <Col xs={12}><span className="card-wether-body-span d-flex align-items-center"><img src={windsvgIcon} style={{ height: "40px" }} /> {currentWeather.current.wind_speed}m/s {windForecast}</span></Col>
                                            <Col xs={12}><span className="card-wether-body-span d-flex align-items-center"><img src={humidityIcon} style={{ height: "40px" }} /> Humidity: {currentWeather.current.humidity}%</span></Col>
                                            <Col xs={12}><span className="card-wether-body-span d-flex align-items-center"><img src={raindropIcon} style={{ height: "40px" }} /> point: {currentWeather.current.dew_point}°C</span></Col>
                                        </Col>
                                        <Col xs={6} className="text-center no-padding-right">
                                            <Col xs={12}><span className="card-wether-body-span d-flex align-items-center"><img src={barometerIcon} style={{ height: "40px" }} />  {currentWeather.current.pressure}hPa</span></Col>
                                            <Col xs={12}><span className="card-wether-body-span d-flex align-items-center"><img src={uvIcon} style={{ height: "40px" }} /> UV: {currentWeather.current.uvi}</span></Col>
                                            <Col xs={12}><span className="card-wether-body-span d-flex align-items-center" style={{ height: "40px" }}>Visiblity: {(currentWeather.current.visibility / 1000).toFixed(1)}km</span></Col>
                                        </Col>
                                    </Row>
                                </Container>
                            </>
                            :
                            <Card ref={setblockRef} className='block-task-weather' onClick={() => openModal && openModal(1)}>
                                <Card.Header className="d-flex justify-content-center">
                                    <Container className='px-1'>
                                        <Row>
                                            <Col xs={12} className="d-flex justify-content-center align-items-center no-padding">
                                                <Col xs="auto" className='mr-1'><span className="card-wether-header">{stateDistrict ? stateDistrict : ""}</span></Col>
                                                <Col xs="auto"><span className="card-wether-date">{currentdate}</span></Col>
                                            </Col>
                                        </Row>
                                    </Container>
                                </Card.Header>
                                <Card.Body className='pt-0'>
                                    <Container maxWidth="lg" className="px-2 pr-2">
                                        <Row>
                                            <Col xs={12} className="d-flex justify-content-center align-items-center no-padding">

                                                <span class="temp-title"> {currentWeather.current.temp}°c</span>


                                                <img src={weatherIconCode} width="80px" />

                                                {/* <span class="temp-title"> {currentWeather.current.temp}°c</span> <img src={"https://openweathermap.org/img/wn/" + currentWeather.current.weather[0].icon + "\@2x.png"} width='100px' /> */}
                                            </Col>
                                        </Row>
                                        <Row className="mb-3">
                                            <Col xs={12} className="d-flex justify-content-center align-items-center">
                                                <span id="current-day">Feels like {currentWeather.current.feels_like}°C. {currentWeather.current.weather[0].main}, {currentWeather.current.weather[0].description} </span>
                                            </Col>
                                        </Row>
                                        <Row className="justify-content-center align-items-center">
                                            <Col xs={6} className="text-center no-padding">
                                                <Col xs={12}><span className="card-wether-body-span d-flex align-items-center"><img src={windsvgIcon} style={{ height: "40px" }} /> {currentWeather.current.wind_speed}m/s {windForecast}</span></Col>
                                                <Col xs={12}><span className="card-wether-body-span d-flex align-items-center"><img src={humidityIcon} style={{ height: "40px" }} /> Humidity: {currentWeather.current.humidity}%</span></Col>
                                                <Col xs={12}><span className="card-wether-body-span d-flex align-items-center"><img src={raindropIcon} style={{ height: "40px" }} /> point: {currentWeather.current.dew_point}°C</span></Col>
                                            </Col>
                                            <Col xs={6} className="text-center no-padding-right">
                                                <Col xs={12}><span className="card-wether-body-span d-flex align-items-center"><img src={barometerIcon} style={{ height: "40px" }} />  {currentWeather.current.pressure}hPa</span></Col>
                                                <Col xs={12}><span className="card-wether-body-span d-flex align-items-center"><img src={uvIcon} style={{ height: "40px" }} /> UV: {currentWeather.current.uvi}</span></Col>
                                                <Col xs={12}><span className="card-wether-body-span d-flex align-items-center" style={{ height: "40px" }}>Visiblity: {(currentWeather.current.visibility / 1000).toFixed(1)}km</span></Col>
                                            </Col>
                                        </Row>
                                    </Container>
                                </Card.Body>
                            </Card>

                        }

                    </Col>
                </Container> : ""}
        </>
    )
}

export default WeatherBlock



