import React, { useState, useEffect, useRef } from "react";
import "../../../assets/scss/weather.scss";
import {
    getTaskWeather,
    Detail_Task_Map,
    getTaskForecast,
    getTaskHistory
} from "../../../actions/wether";
import { loadingBegin, loadingEnd } from "../../../actions/map";
import { useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import descriptions from '../../../utils/wetherDescription.json';


import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import IconButton from '@mui/material/IconButton';

import ListAltOutlinedIcon from '@mui/icons-material/ListAltOutlined';
import { showSnackbar } from "../../../actions/snackbar";
import { Typography } from "@mui/material";

import { useTranslation } from "react-i18next";
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import dayjs from 'dayjs';

import Graph from "./monthlyRainGraph.js";
import { IoIosAdd, IoIosSearch } from 'react-icons/io';
import { MdOutlineCancel } from 'react-icons/md';
import Card from 'react-bootstrap/Card';
import { TiWeatherWindy } from "react-icons/ti";
import { VscCompass } from "react-icons/vsc";
import { WiHumidity } from "react-icons/wi";
import tempIcon from '../../../assets/images/thermometer.png'
import windIcon from '../../../assets/images/wind.png'
import rainIcon from '../../../assets/images/rain.png'
import evapoIcon from '../../../assets/images/evapo.png'
import "owl.carousel/dist/assets/owl.carousel.css";
import "owl.carousel/dist/assets/owl.theme.default.css";
import OwlCarousel from "react-owl-carousel";
import LoadingButton from "@mui/lab/LoadingButton";
import WeatherCodeList from '../../../utils/WeatherCode.json'
import ThermometeerCelsuisIcon from '../../../assets/images/icons/weather/thermometer-celsius.svg'
import barometerIcon from '../../../assets/images/icons/weather/barometer.svg'
import raindMesureIcon from '../../../assets/images/icons/weather/raindrop-measure.svg'
import humidityIcon from '../../../assets/images/icons/weather/humidity.svg'
import uvIcon from '../../../assets/images/icons/weather/uv-index.svg'
import windsvgIcon from '../../../assets/images/icons/weather/wind.svg'
import raindropIcon from '../../../assets/images/icons/weather/raindrop.svg'
import tideHighIcon from '../../../assets/images/icons/weather/tide-high.svg'

import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
} from 'chart.js';
import DailyEt0Graph from "./dailyEt0Graph.js"


import { Line } from 'react-chartjs-2';
import { Container } from "@mui/material";
import { Col, Row } from "react-bootstrap";
import TemperatureRainGraph from "./TemperatureRainGraph";



ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend
);


const dateOptions = {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: 'numeric',
    hour12: true,
};



const WetherTab = () => {

    const task_id = useSelector((state) => state.mapReducer.taskIdDetails);
    const taskName = useSelector((state) => state.mapReducer.taskNameDetails);
    const country = useSelector((state) => state.mapReducer.countryFrDetails);
    const state = useSelector((state) => state.mapReducer.stateFrDetails);
    const stateDistrict = useSelector(
        (state) => state.mapReducer.stateDistrictFrDetails
    );
    const postcode = useSelector((state) => state.mapReducer.postcodeFrDetails);


    const [taskid, settaskid] = useState(null)
    const dispatch = useDispatch();
    const [lat, setLat] = useState(0);
    const [lng, setLng] = useState(0);
    const [currentWeather, setCurrentWeather] = useState(null);
    const [windForecast, setwindForecast] = useState(null)
    const [data, setData] = useState({});

    const [forecasts, setForecasts] = useState([]);

    const [rain, setRain] = useState([]);
    const [evapo, setevapo] = useState([])
    const [time, setTime] = useState([]);
    const [wind, setWind] = useState([]);
    const [currentdate, setcurrentdate] = useState(null)
    const [minTemp, setMinTemp] = useState([]);
    const [maxTemp, setMaxTemp] = useState([]);
    const [code, setCode] = useState([]);
    const [weatherIconCode, setweatherIconCode] = useState(null)
    const [carouselIconCode, setcarouselIconCode] = useState([])

    const [searchRain, setSearchRain] = useState([]);
    const [searchTime, setSearchTime] = useState([]);
    const [searchWind, setSearchWind] = useState([]);
    const [searchMinTemp, setSearchMinTemp] = useState([]);
    const [searchMaxTemp, setSearchMaxTemp] = useState([]);
    const [searchCode, setSearchCode] = useState([]);
    const [searchEt0, setSearchEt0] = useState([]);

    const [loading, setLoading] = useState(false);

    let today = new Date()
    let previous_year = new Date(today.getTime() - 365 * 24 * 60 * 60 * 1000)

    const [startDate, setStartDate] = useState(previous_year.toISOString().split('T')[0]);
    const [endDate, setEndDate] = useState(today.toISOString().split('T')[0]);

    const [rainData, setRainData] = useState([]);
    const [monthlyRainData, setMonthlyRainData] = useState([]);
    const [maxMonthlyRain, setMaxMonthlyRain] = useState(0);
    const [maxEt0, setMaxEt0] = useState(0);


    const refreshGraph = (minTemp, maxTemp, rain, labels) => {

        const local = {
            labels: labels,
            datasets: [
                {
                    label: t('Min TempSearch.'),
                    data: minTemp,
                    borderColor: 'rgb(53, 162, 235)',
                    fill: false,
                    cubicInterpolationMode: 'monotone',
                    tension: 0.4
                }, {
                    label: t('Max Temp.'),
                    data: maxTemp,
                    borderColor: 'rgb(255, 99, 132)',
                    fill: false,
                    tension: 0.4
                }, {
                    label: t('Rain'),
                    data: rain,
                    borderColor: 'rgb(111, 157, 47)',
                    fill: false
                }
            ]
        };
        setData(local);
    }
    const windCode = ["N", "N/NE", "NE", "E/NE", "E", "E/SE", "SE", "S/SE", "S", "S/SW", "SW", "W/SW", "W", "W/NW", "NW", "N/NW"]
    const optionsCarousel = {
        0: {
            items: 1,
        },
        330: {
            items: 1,
        },
        417: {
            items: 1,
        },
        460: {
            items: 2,
        },
        673: {
            items: 2,
        },
        700: {
            items: 2,
        },
        1000: {
            items: 3,
        },
        1200: {
            items: 3,
        },
        1224: {
            items: 4,
        },
    };
    const getMonthlyRainCSV = () => {
        let monthly_data = monthlyRainData
        let csv = "Month,rainfall\n"
        csv += monthly_data.map(obj => Object.values(obj).join(',')).join('\n');
        csv = csv.replace(/-01,/g, ",")

        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        let filename = taskName ? taskName + "__Monthly_Rainfall.csv" : "Monthly_Rainfall.csv";

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

    const handleReset = () => {
        setStartDate(previous_year.toISOString().split('T')[0]);
        setEndDate(today.toISOString().split('T')[0]);

        setSearchRain(rain);
        setSearchWind(wind);
        setSearchTime(time);
        setSearchMinTemp(minTemp);
        setSearchMaxTemp(maxTemp);
        setSearchCode(code);

        const DATA_COUNT = rain.length;
        const labels = [];
        for (let i = 0; i < DATA_COUNT; ++i) {
            labels.push(getDayName(new Date(time[i])));
        }

        refreshGraph(minTemp, maxTemp, rain, labels);
    };

    const handleSearch = () => {
        if (startDate > endDate) {
            dispatch(showSnackbar("error", undefined, "end date must be after start date ", "top", "right"))
            return;
        }

        if (endDate > today.toISOString().split('T')[0]) {
            dispatch(showSnackbar("error", undefined, "end date must be before today's date ", "top", "right"))
            return;
        }

        dispatch(getTaskHistory(lat, lng, startDate, endDate)).then((response) => {


            setSearchRain(response.daily.rain_sum);


            setSearchWind(response.daily.wind_speed_10m_max);
            setSearchTime(response.daily.time);
            setSearchMinTemp(response.daily.temperature_2m_min);
            setSearchMaxTemp(response.daily.temperature_2m_max);
            setSearchCode(response.daily.weather_code);


            let rain_data = []
            for (let i = 0; i < response.daily.rain_sum.length; i++) {
                const obj = { "date": response.daily.time[i], "value": response.daily.rain_sum[i] }
                rain_data.push(obj)
            }

            let et0_data = []
            for (let i = 0; i < response.daily.et0_fao_evapotranspiration.length; i++) {
                const obj = { "date": response.daily.time[i], "value": response.daily.et0_fao_evapotranspiration[i] }
                et0_data.push(obj)
            }

            setSearchEt0(et0_data);
            setMaxEt0(Math.max(...response.daily.et0_fao_evapotranspiration))

            let monthly_obj = {}
            let monthly_rain_data = []

            rain_data.forEach(item => {
                const date = new Date(item.date);
                const month = date.getMonth() + 1;
                const year = date.getFullYear();
                const key = `${year}-${month}-01`;
                if (!monthly_obj[key]) {
                    monthly_obj[key] = 0

                }
                monthly_obj[key] += item.value

            });

            let rain_max = 0;
            Object.keys(monthly_obj).map((key) => {
                let dict = { "date": key, "value": monthly_obj[key].toFixed(2) }
                monthly_rain_data.push(dict)
                if (monthly_obj[key] > rain_max) {
                    rain_max = monthly_obj[key]
                }
            })
            setMonthlyRainData(monthly_rain_data);
            setRainData(rain_data);
            setMaxMonthlyRain(rain_max)

            const DATA_COUNT = response.daily.rain_sum.length;
            const labels = [];
            for (let i = 0; i < DATA_COUNT; ++i) {
                labels.push(response.daily.time[i]);
            }
            refreshGraph(response.daily.temperature_2m_min, response.daily.temperature_2m_max, response.daily.rain_sum, labels);


        });

    }

    const { t } = useTranslation();
    const onChange = (e, status) => {
        const date = new Date(e).toISOString().split('T')[0];
        if (status == 'start_date') {
            setStartDate(date);
        } else {
            setEndDate(date);
        }
    }


    const getDayName = (inputDate) => {
        const dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
        const dayIndex = inputDate.getDay();
        return dayNames[dayIndex];
    };
    const getDayFormat = (inputDate) => {
        const formattedDate = new Date(inputDate).toLocaleDateString('en-US', dateOptions);
        return formattedDate
    }
    useEffect(() => {
        if (!task_id) return
        settaskid(task_id)
    }, [task_id])

    useEffect(() => {
        if (!taskid) return
        dispatch(loadingBegin(1));
        dispatch(Detail_Task_Map(taskid)).then((res) => {
            setLat(res.data.lat);
            setLng(res.data.lng);
            dispatch(loadingEnd(0));

        })
    }, [taskid, taskName])
    useEffect(() => {

        if (!lat) return

        dispatch(getTaskWeather(lat, lng)).then((response) => {
            setCurrentWeather(response);
            const humanDate = new Date(response.current.dt * 1000).toLocaleString('en-US', dateOptions);
            setcurrentdate(humanDate)
        })

        dispatch(getTaskForecast(lat, lng)).then((response) => {
            setForecasts(response);
            setRain(response.daily.rain_sum);
            setevapo(response.daily.et0_fao_evapotranspiration);
            setWind(response.daily.wind_speed_10m_max);
            setTime(response.daily.time);
            setMinTemp(response.daily.temperature_2m_min);
            setMaxTemp(response.daily.temperature_2m_max);
            setCode(response.daily.weather_code);
            setSearchRain(response.daily.rain_sum);
            setSearchWind(response.daily.wind_speed_10m_max);
            setSearchTime(response.daily.time);
            setSearchMinTemp(response.daily.temperature_2m_min);
            setSearchMaxTemp(response.daily.temperature_2m_max);
            setSearchCode(response.daily.weather_code);
            const DATA_COUNT = response.daily.rain_sum.length;
            const labels = [];
            for (let i = 0; i < DATA_COUNT; ++i) {
                labels.push(getDayName(new Date(response.daily.time[i])));
            }
            refreshGraph(response.daily.temperature_2m_min, response.daily.temperature_2m_max, response.daily.rain_sum, labels);
        })

        handleSearch()
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

    }, [carouselIconCode])
    return (
        <Container maxWidth="xl">
            {currentWeather != null ?
                <>
                    <Row className="mt-4 mb-4">
                        <Col xs={12} md={12} lg={12} xl={4} className="mb-2">
                            <Card>
                                <Card.Header className="d-flex justify-content-center">
                                    <Container>
                                        <Row>
                                            <Col xs={12} className="d-flex justify-content-center align-items-center">
                                                <span className="card-wether-header">{country ? country : ""}{state ? ", " + state : ""}{stateDistrict ? ", " + stateDistrict : ""}{postcode ? ", " + postcode : ""}</span>
                                                <span className="card-wether-date">{currentdate}</span>

                                            </Col>
                                        </Row>

                                    </Container>
                                </Card.Header>
                                <Card.Body>
                                    <Container maxWidth="lg" className="px-2 pr-2">
                                        <Row>
                                            <Col xs={12} className="d-flex justify-content-center align-items-center">
                                                <span class="temp-title"> {currentWeather.current.temp}°c</span> <img src={weatherIconCode} width='100px' />
                                            </Col>
                                        </Row>
                                        <Row className="mb-3">
                                            <Col xs={12} className="d-flex justify-content-center align-items-center">
                                                <span id="current-day">Feels like {currentWeather.current.feels_like}°C. {currentWeather.current.weather[0].main}, {currentWeather.current.weather[0].description} </span>
                                            </Col>
                                        </Row>
                                        <Row className="justify-content-center align-items-center">
                                            <Col xs={6} className="text-center">
                                                <Col xs={12}><span className="card-wether-body-span d-flex align-items-center"><img src={windsvgIcon} style={{ height: "40px" }} /> {currentWeather.current.wind_speed}m/s {windForecast}</span></Col>
                                                <Col xs={12}><span className="card-wether-body-span d-flex align-items-center"><img src={humidityIcon} style={{ height: "40px" }} /> Humidity: {currentWeather.current.humidity}%</span></Col>
                                                <Col xs={12}><span className="card-wether-body-span d-flex align-items-center"><img src={raindropIcon} style={{ height: "40px" }} /> Dew: {currentWeather.current.dew_point}°C</span></Col>
                                            </Col>
                                            <Col xs={6} className="text-center">
                                                <Col xs={12}><span className="card-wether-body-span d-flex align-items-center"><img src={barometerIcon} style={{ height: "40px" }} />  {currentWeather.current.pressure}hPa</span></Col>
                                                <Col xs={12}><span className="card-wether-body-span d-flex align-items-center"><img src={uvIcon} style={{ height: "40px" }} /> UV: {currentWeather.current.uvi}</span></Col>
                                                <Col xs={12}><span className="card-wether-body-span d-flex align-items-center" style={{ height: "40px" }}>Visiblity: {(currentWeather.current.visibility / 1000).toFixed(1)}km</span></Col>
                                            </Col>

                                        </Row>
                                    </Container>
                                </Card.Body>
                            </Card>

                        </Col>
                        <Col xs={12} md={12} lg={12} xl={8} className="mb-2">

                            <OwlCarousel
                                className="owl-theme w-100"
                                loop
                                margin={10}
                                nav
                                items={3}
                                mouseDrag={true}
                                dots={false}
                                responsive={optionsCarousel}
                                rewind={false}
                            >
                                {[...Array(rain.length)].map((x, i) =>
                                    <div className="item">
                                        <Card>
                                            <Card.Header>
                                                <Container maxWidth="lg">
                                                    <Row>

                                                        <Col xs={12}>
                                                            <span className="card-wether-date">{getDayFormat(time[i])}</span>
                                                        </Col>
                                                        <Col xs={12}>
                                                            <span className="card-wether-header"> {getDayName(new Date(time[i]))}</span>
                                                        </Col>
                                                    </Row>
                                                </Container>
                                            </Card.Header>
                                            <Card.Body>
                                                <Container maxWidth="lg" style={{ paddingLeft: "12px", paddingRight: "12px" }}>
                                                    <Row>
                                                        <Col xs={12} className="d-flex justify-content-center align-items-center no-padding">
                                                            {descriptions[code[i]].day.description}
                                                        </Col>
                                                        <Col xs={12} className="d-flex justify-content-center align-items-center">
                                                            <img
                                                                src={carouselIconCode[i]}
                                                                className="card-wether-img" />
                                                        </Col>
                                                    </Row>
                                                    <Row>
                                                        <Col xs={12} className="d-flex align-items-center no-padding">
                                                            <img src={ThermometeerCelsuisIcon} alt="tempurature" style={{ width: "40px", marginRight: "2px" }} />T°:<span className="temp-span-max">  {maxTemp[i]}</span>/<span className="temp-span-min">{minTemp[i]}</span>°C
                                                        </Col>
                                                    </Row>
                                                    <Row>
                                                        <Col xs={12} className="d-flex align-items-center no-padding">
                                                            <img src={windsvgIcon} alt="wind" style={{ width: "40px", marginRight: "2px" }} /><span>W: {wind[i]} km/h</span>
                                                        </Col>
                                                    </Row>
                                                    <Row>
                                                        <Col xs={12} className="d-flex align-items-center no-padding">
                                                            <img src={raindMesureIcon} alt="rain" style={{ width: "40px", marginRight: "4px" }} /><span>R: {rain[i]} mm</span>
                                                        </Col>
                                                    </Row>
                                                    <Row>
                                                        <Col xs={12} className="d-flex align-items-center no-padding">
                                                            <img src={tideHighIcon} alt="rain" style={{ width: "40px", marginRight: "4px" }} /><span>ET0: {evapo[i]} mm</span>
                                                        </Col>
                                                    </Row>
                                                </Container>
                                            </Card.Body>
                                        </Card>
                                    </div>
                                )}
                            </OwlCarousel>

                        </Col>
                    </Row>

                    <hr />
                </>
                : ''}
            <Row className="mt-4 mb-4">
                <LocalizationProvider dateAdapter={AdapterDayjs}>
                    <Col xs={12} sm={3} md={3} lg={3} className="d-flex justify-content-center align-items-center mb-2">
                        <DatePicker defaultValue={dayjs(startDate)}
                            disabled={loading}
                            className="graph_date_input"
                            label={t("start date")}
                            name={"StartDate"}
                            onChange={(e) => onChange(e, 'start_date')} />
                    </Col>

                    <Col xs={12} sm={3} md={3} lg={3} className="d-flex justify-content-center align-items-center mb-2">
                        <DatePicker defaultValue={dayjs(endDate)}
                            disabled={loading}
                            className="graph_date_input"
                            label={t("end date")}
                            name={"EndDate"}
                            onChange={(e) => onChange(e, 'end_date')} />
                    </Col>

                    <Col xs={12} sm={3} md={3} lg={3} className="d-flex justify-content-center align-items-center mb-2">

                        <LoadingButton
                            size="small"
                            color="success"
                            type="submit"
                            onClick={handleSearch}
                            loading={loading}
                            loadingPosition="start"
                            startIcon={<IoIosSearch />}
                            variant="contained"
                        >
                            <span>{t("Search")}</span>
                        </LoadingButton>
                    </Col>
                    <Col xs={12} sm={3} md={3} lg={3} className="d-flex justify-content-center align-items-center mb-2">                            {/* <CustomButton startIcon={<MdOutlineCancel />} onClick={handleReset}>{t("Cancel")}</CustomButton> */}
                        <LoadingButton
                            size="small"
                            color="primary"
                            type="submit"
                            onClick={handleReset}
                            loading={loading}
                            loadingPosition="start"
                            startIcon={<MdOutlineCancel />}
                            variant="outlined"
                        >
                            <span>{t("Cancel")}</span>
                        </LoadingButton>
                    </Col>


                </LocalizationProvider>
            </Row>
            <Row>
                <Col xs={12} sm={3} md={3} lg={3} className="d-flex justify-content-center align-items-center mb-2">                            {/* <CustomButton startIcon={<MdOutlineCancel />} onClick={handleReset}>{t("Cancel")}</CustomButton> */}
                    {monthlyRainData &&

                        <LoadingButton
                            size="small"
                            color="primary"
                            loading={loading}
                            loadingPosition="start"
                            startIcon={<ListAltOutlinedIcon />}
                            variant="outlined"
                            onClick={getMonthlyRainCSV}>
                            <span>{t("CSV")}</span>
                        </LoadingButton>
                    }
                </Col>

            </Row>
            {rainData &&
                <Row className="mt-4 mb-5">
                    <div>
                    <Typography style={{textAlign:"center"}}>{t("Monthly rainfall levels")}</Typography>
                        <Graph data={monthlyRainData} monthly={monthlyRainData} data_freq="month" data_max={maxMonthlyRain} title={t("Monthly rainfall")} dot_name="Rainfall" line_color="#3a93f2" />
                    </div>
                </Row>
            }

            {searchEt0 && task_id &&
                <Row className="mt-4 mb-5">


                    <div>
                        <Typography style={{textAlign:"center"}}>{t("Evapotranspiration levels")}</Typography>
                        <DailyEt0Graph data={searchEt0} data_freq="day" data_max={maxEt0} title="ET0" dot_name="ET0" line_color="#f2a23a" />

                    </div>
                </Row>
            }

            <div className="row justify-content-center pt-5">

                <div className="col-12 col-md-12">
                    {data.labels && data.labels.length > 0 ? (
                        <TemperatureRainGraph data={data} />
                    ) : ''}
                </div>
            </div>
        </Container>
    )
}
export default WetherTab;
