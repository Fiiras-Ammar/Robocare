import React, {useState} from "react";
import BasicDatePicker from "../../../utils/BasicDatePicker";
import MonthRangePicker from "../../../utils/MonthRangePicker";
import {useEffect} from "react";
import {useDispatch, useSelector} from "react-redux";
import {
    getIndexArray,
    addForecastParams,
    getPattern, getSelfPattern, get_date_self_pattern, get_anomaly_tasks,
} from "../../../actions/graph";

import {
    Detail_Task_Map, getTaskForecastWithPeriod,
} from "../../../actions/wether"

import dayjs from "dayjs";
import FormControl from "@mui/material/FormControl";
import Select from "@mui/material/Select";
import InputLabel from "@mui/material/InputLabel";
import MenuItem from "@mui/material/MenuItem";
import Form from "react-bootstrap/Form";
import { Container, Slider, Typography} from "@mui/material";
import SaveIcon from "@mui/icons-material/Save";
import Stack from "@mui/material/Stack";
import LoadingButton from "@mui/lab/LoadingButton";
import Graph from "./graph";
import {getTaskHistory} from "../../../actions/wether.js";
import {showSnackbar} from "../../../actions/snackbar";
import {useTranslation} from "react-i18next";
import {Row} from "react-bootstrap";
import {
    handleFilterData,
    handleFilterDataByCloudPercentage,
    findMinMaxValues,
} from "../../../utils/graphDataFilter.js";
import GraphYear from "./graphYear.js";
import {getForecastPredict, getIndexForecast} from "../../../actions/graph.js";
import {
    get_task_notifications,
    getTaskPatternAlerts,
    getTaskNdviForecastAlerts, getSelfTaskPatternAlerts
} from "../../../actions/notification.js";
import Accordion from "@mui/material/Accordion";
import AccordionSummary from "@mui/material/AccordionSummary";
import AccordionDetails from "@mui/material/AccordionDetails";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import {Chip} from "@mui/material";
import CancelIcon from "@mui/icons-material/Cancel";
import CheckIcon from "@mui/icons-material/Check";
import {getForecastParams} from "../../../actions/graph.js";
import {ForecastTrain} from "../../../actions/graph.js"
import {ForecastPredict} from "./../../../actions/graph";
import {saveSelfPattern} from "../../../actions/compare";
import thresholds from './GDD_temperature_reference.json';
const GraphPage = () => {
    const dispatch = useDispatch();
    const start_end_dates = useSelector(
        (state) => state.graphReducer.graph_dates
    );

    const taskId = useSelector((state) => state.mapReducer.taskIdDetails);
    const user = useSelector((state) => state.auth.user);
    const cultureId = useSelector((state) => state.mapReducer.cultureDetails);

    const [data, setdata] = useState([]);
    const [dataPerYear, setdataPerYear] = useState([]);
    const [loading, setLoading] = useState(true);
    const [loadingForecast, setloadingForecast] = useState(false);
    const {t} = useTranslation();
    const [indexText, setindexText] = useState("vegetation");
    const [currentIndex, setCurrentIndex] = useState("vegetation");
    const data_graph = useSelector((state) => state.graphReducer.graph_data);
    const today = dayjs();
    const [attemptCount, setAttemptCount] = useState(0);
    const [graphDataReady, setgraphDataReady] = useState(false);
    const [dataPredict, setdataPredict] = useState([]);
    const [IndexForecast, setIndexForecast] = useState([]);


    const [dataPredictIndex, setdataPredictIndex] = useState([]);
    const [notifications, setnotifications] = useState([]);
    const [patternAlertsDates, setPatternAlertsDates] = useState({"ordinaryAlerts": [], "severeAlerts": []});
    const [ndviForecastAlertsDates, setNdviForecastAlertsDates] = useState({"ordinaryAlerts": [], "severeAlerts": []});

    const [years, setyears] = useState([]);
    const [yearsRemoveList, setyearsRemoveList] = useState([]);
    const [bestYear, setbestYear] = useState(null);
    const [lat, setLat] = useState(null);
    const [lng, setLng] = useState(null);

    const [dailyRain, setDailyRain] = useState([]);
    const [rainMax, setRainMax] = useState(0);
    const [rainMin, setRainMin] = useState(0);
    const [yearGraphMonth, setYearGraphMonth] = useState([0, 11]);

    const [patternData, setpatternData] = useState([]);

    const [dailyTemp, setDailyTemp] = useState([]);
    const [tempMax, setTempMax] = useState(0);
    const [tempMin, setTempMin] = useState(0);
    const [loadingSelfPatter, setLoadingSelfPatter] = useState(false);
    const [dailyTempMin, setDailyTempMin] = useState([]);
    const [dailyTempMax, setDailyTempMax] = useState([]);

    const [dailyGdd, setDailyGdd] = useState([]);
    const [gddMax, setGddMax] = useState(0);
    const [gddMin, setGddMin] = useState(0);
    const [patternSelfData, setpatternSelfData] = useState([]);
    const [autoPatternAlertsDates, setAutoPatternAlertsDates] = useState({"ordinaryAlerts": [], "severeAlerts": []});
    const [formSelfDataPattern, setFormSelfDataPattern] = useState({
        task: taskId,
        StartSelfDateP: today.subtract(1, "year"),
        EndSelfDateP: today,
    });
    const {StartSelfDateP, EndSelfDateP} = formSelfDataPattern;
    const [anomaly, setAnomaly] = useState([]);

    const highResOrders = useSelector((state) => state.highResOrdersReducer.highResOrders);

    const intensificationDate = useState(data_graph[0].task.intensification_date);
    const [task] = useState(data_graph[0].task);

    useEffect(() => {
        if (taskId) {
            dispatch(get_date_self_pattern(taskId)).then((res) => {
                if (res.status === 200) {
                    const {startdate, enddate} = res.data.data;
                    setFormSelfDataPattern(prevState => ({
                        ...prevState,
                        StartSelfDateP: dayjs(startdate),
                        EndSelfDateP: dayjs(enddate)
                    }));
                }
            });
            dispatch(get_anomaly_tasks(taskId)).then((res) => {
                if (res.status === 200) {
                    const anomalyDataArray = res.data.data.map(item => ({
                        open_hour: item.open_hour,
                        close_hour: item.close_hour,
                        anomaly_type_name: item.anomaly_type_name,
                        note: item.note
                    }));
                    setAnomaly(anomalyDataArray);
                }
            });
        }
    }, [taskId]);

    const [formData, setFormData] = useState({
        StartDate: today.subtract(1, "year"),
        EndDate: today,
        index: "ndvi",
    });
    const marks = [
        {
            value: 10,
            label: "10 %",
        },
        {
            value: 20,
            label: "20 %",
        },
        {
            value: 30,
            label: "30 %",
        },
        {
            value: 40,
            label: "40 %",
        },
    ]
    const getGddData = () => {
        const baseTemperature = thresholds[cultureId] || thresholds.default;
        const enddate_str = new Date().toISOString().split('T')[0];

        const wheatCultures = [
            "e0af04c8-b518-460a-902f-1f42e4b8a449",
            "047088cd-3647-4ae5-b37f-19b19af42aaf"
        ];
        const start_date = wheatCultures.includes(cultureId)
            ? "2020-11-01"
            : "2022-12-01";

        dispatch(getTaskHistory(lat, lng, start_date, enddate_str)).then((response) => {
            let gdd_data = [];
            let cumulative_gdd = 0;
            let gdd_max = Math.max(...response.daily.temperature_2m_max);
            let gdd_min = Math.min(...response.daily.temperature_2m_min);

            const isWheatCulture = wheatCultures.includes(cultureId);

            for (let i = 0; i < response.daily.temperature_2m_max.length; i++) {
                if (response.daily.temperature_2m_max[i] !== null && response.daily.temperature_2m_min[i] !== null) {
                    const t_max = response.daily.temperature_2m_max[i];
                    const t_min = response.daily.temperature_2m_min[i];
                    let daily_gdd = 0;
                    const currentDate = new Date(response.daily.time[i]);

                    if (isWheatCulture) {
                        if (currentDate.getMonth() === 6 && currentDate.getDate() === 31) {
                            cumulative_gdd = 0;
                            continue;
                        }
                        if (currentDate.getMonth() >= 7 && currentDate.getMonth() <= 9) {
                            cumulative_gdd = 0;
                        }
                    } else {
                        if (currentDate.getMonth() === 11 && currentDate.getDate() === 4) {
                            cumulative_gdd = 0;
                        }
                    }

                    if (t_min > baseTemperature) {
                        daily_gdd = (((t_max + t_min) / 2) - baseTemperature).toFixed(3);
                        daily_gdd = Math.max(0, daily_gdd);
                        if ( isWheatCulture && currentDate.getMonth() >= 7 && currentDate.getMonth() <= 9) {
                            cumulative_gdd = 0;
                        }
                        else{
                            cumulative_gdd += parseFloat(daily_gdd);

                        }
                    }

                    const obj = {
                        "date": response.daily.time[i],
                        "t_min": t_min,
                        "t_max": t_max,
                        "daily_gdd": daily_gdd,
                        "value": cumulative_gdd,
                    };
                    gdd_data.push(obj);
                }
            }



            setDailyGdd(gdd_data);
            setGddMax(gdd_max);
            setGddMin(gdd_min);
        });
    };
    const getTemperatureData = () => {
        let startdate_str = formData.StartDate.format('YYYY-MM-DD')
        let enddate_str = formData.EndDate.format('YYYY-MM-DD')
        dispatch(getTaskHistory(lat, lng, startdate_str, enddate_str)).then((response) => {
            let temp_data = []
            let temp_max = Math.max(...response.daily.temperature_2m_mean);
            let temp_min = Math.min(...response.daily.temperature_2m_mean);
            for (let i = 0; i < response.daily.temperature_2m_mean.length; i++) {
                if (response.daily.temperature_2m_mean[i] !== null) {
                    const obj = {"date": response.daily.time[i], "value": response.daily.temperature_2m_mean[i]}
                    temp_data.push(obj)
                }
            }

            setDailyTemp(temp_data)
            setTempMax(temp_max)
            setTempMin(temp_min)

        })
    };
    const getTemperatureDataMin = () => {
        let startdate_str = formData.StartDate.format('YYYY-MM-DD')
        let enddate_str = formData.EndDate.format('YYYY-MM-DD')
        dispatch(getTaskHistory(lat, lng, startdate_str, enddate_str)).then((response) => {
            let temp_data = []
            for (let i = 0; i < response.daily.temperature_2m_min.length - 2; i++) {
                if (response.daily.temperature_2m_min[i] !== null) {
                    const obj = {"date": response.daily.time[i], "value": response.daily.temperature_2m_min[i]}
                    temp_data.push(obj)
                }
            }
            let predictionsDate = new Date(new Date().setDate(new Date().getDate() + 15)).toISOString().split('T')[0];
            let newStartDate = formData.EndDate.subtract(1, 'days').format('YYYY-MM-DD');

            dispatch(getTaskForecastWithPeriod(lat, lng, newStartDate, predictionsDate)).then((res) => {
                for (let i = 0; i < res.daily.temperature_2m_min.length; i++) {
                    if (res.daily.temperature_2m_min[i] !== null) {
                        const obj = {"date": res.daily.time[i], "value": res.daily.temperature_2m_min[i]}
                        temp_data.push(obj)
                    }
                }
                setDailyTempMin(temp_data)
            })
        })
    };
    const getTemperatureDataMax = () => {
        let startdate_str = formData.StartDate.format('YYYY-MM-DD')
        let enddate_str = formData.EndDate.format('YYYY-MM-DD')
        dispatch(getTaskHistory(lat, lng, startdate_str, enddate_str)).then((response) => {
            let temp_data = []
            for (let i = 0; i < response.daily.temperature_2m_max.length - 2; i++) {
                if (response.daily.temperature_2m_max[i] !== null) {
                    const obj = {"date": response.daily.time[i], "value": response.daily.temperature_2m_max[i]}
                    temp_data.push(obj)
                }
            }
            let newStartDate = formData.EndDate.subtract(1, 'days').format('YYYY-MM-DD');
            let predictionsDate = new Date(new Date().setDate(new Date().getDate() + 15)).toISOString().split('T')[0];
            dispatch(getTaskForecastWithPeriod(lat, lng, newStartDate, predictionsDate)).then((res) => {
                for (let i = 0; i < res.daily.temperature_2m_max.length; i++) {
                    if (res.daily.temperature_2m_max[i] !== null) {
                        const obj = {"date": res.daily.time[i], "value": res.daily.temperature_2m_max[i]}
                        temp_data.push(obj)
                    }
                }
                setDailyTempMax(temp_data)

            })
        })
    };

    const getRainfallData = () => {
        let startdate_str = formData.StartDate.format('YYYY-MM-DD')
        let enddate_str = formData.EndDate.format('YYYY-MM-DD')
        dispatch(getTaskHistory(lat, lng, startdate_str, enddate_str)).then((response) => {
            let rain_data = []
            let rain_max = Math.max(...response.daily.rain_sum);
            let rain_min = Math.min(...response.daily.rain_sum);
            for (let i = 0; i < response.daily.rain_sum.length; i++) {
                const obj = {"date": response.daily.time[i], "value": response.daily.rain_sum[i]}
                rain_data.push(obj)
            }
            setDailyRain(rain_data)
            setRainMax(rain_max)
            setRainMin(rain_min)

        })
    };

    // Function to extract unique years from the data
    function extractUniqueYears(data) {
        const yearsSet = new Set();
        data.forEach((item) => {
            const year = item.date.split("-")[0];
            yearsSet.add(year);
        });
        return Array.from(yearsSet);
    }

    // Function to extract data for each year
    function extractDataForYear(data, year) {
        return data.filter((item) => item.date.startsWith(year));
    }

    useEffect(() => {
        if (!taskId) return
        dispatch(Detail_Task_Map(taskId)).then((res) => {
            setLat(res.data.lat);
            setLng(res.data.lng);
        })
    }, [taskId])

    useEffect(() => {
        if (!taskId) return;
        dispatch(getForecastPredict(taskId)).then((response) => {
            if (response.status === 200) {
                setdataPredict(response.data.results);
            } else {
                setdataPredict([]);
            }
        });

        dispatch(getIndexForecast(taskId)).then((response) => {
            if (response.status === 200) {
                setIndexForecast(response.data.results);
            } else {
                setIndexForecast([]);
            }
        });

        dispatch(getPattern(taskId)).then((res) => {
            if (res.status === 200 && res.data) {
                try {

                    let originalYearFirst = res.data.data[0].date.split('-')[0]
                    let originalYearSecond = res.data.data[res.data.data.length - 1].date.split('-')[0]
                    let currentYear = new Date().getFullYear()
                    setpatternData(res.data);
                    if (originalYearFirst === originalYearSecond) {
                        let altered_year_data = res.data.data.map(obj => {
                            return {
                                "date": obj.date.replace(originalYearFirst, currentYear-1),
                                "value": obj.value,
                                "NDVI_rolling_mean": obj.NDVI_rolling_mean,
                                "cloud_percentage": obj.cloud_percentage

                            }
                        })
                        setpatternData(altered_year_data);

                    } else {
                        let altered_year_data = res.data.data.map(obj => {

                            return {
                                "date": obj.date.replace(originalYearSecond, currentYear ).replace(originalYearFirst, currentYear-1),
                                "value": obj.value,
                                "NDVI_rolling_mean": obj.NDVI_rolling_mean,
                                "cloud_percentage": obj.cloud_percentage

                            }
                        })
                        setpatternData(altered_year_data);
                    }
                } catch (err) {

                }
            }
        });

        dispatch(getSelfPattern(taskId)).then((res) => {
            if (res.status === 200 && res.data) {
                try {
                    let originalYearFirst = res.data.data[0].date.split('-')[0]
                    let originalYearSecond = res.data.data[res.data.data.length - 1].date.split('-')[0]
                    let currentYear = new Date().getFullYear()
                    setpatternSelfData(res.data);
                    const now = new Date();
                    const firstDate = new Date(res.data.data[0].date);
                    //Comparision if now is greater than the first element date he start from the previous year else the current year
                    if (originalYearFirst === originalYearSecond) {
                        let altered_year_data
                        if (
                            firstDate.getMonth() + 1 > now.getMonth() + 1 ||
                            (firstDate.getMonth() + 1 === now.getMonth() + 1 && firstDate.getDate() > now.getDate())
                        ) {
                            altered_year_data = res.data.data.map(obj => {
                                return {
                                    "date": obj.date.replace(originalYearFirst, currentYear-1),
                                    "value": obj.value,
                                    "NDVI_rolling_mean": obj.NDVI_rolling_mean,
                                    "cloud_percentage": obj.cloud_percentage

                                }
                            })
                        } else {
                            altered_year_data = res.data.data.map(obj => {
                                return {
                                    "date": obj.date.replace(originalYearFirst, currentYear),
                                    "value": obj.value,
                                    "NDVI_rolling_mean": obj.NDVI_rolling_mean,
                                    "cloud_percentage": obj.cloud_percentage

                                }
                            })
                        }


                        setpatternSelfData(altered_year_data);

                    } else {
                        let altered_year_data
                        if (
                            firstDate.getMonth() + 1 > now.getMonth() + 1 ||
                            (firstDate.getMonth() + 1 === now.getMonth() + 1 && firstDate.getDate() > now.getDate())
                        ) {
                            altered_year_data = res.data.data.map(obj => {
                                return {
                                    "date": obj.date.replace(originalYearSecond, currentYear ).replace(originalYearFirst, currentYear -1),
                                    "value": obj.value,
                                    "NDVI_rolling_mean": obj.NDVI_rolling_mean,
                                    "cloud_percentage": obj.cloud_percentage

                                }
                            })
                        } else {
                            altered_year_data = res.data.data.map(obj => {
                                return {
                                    "date": obj.date.replace(originalYearSecond, currentYear + 1).replace(originalYearFirst, currentYear),
                                    "value": obj.value,
                                    "NDVI_rolling_mean": obj.NDVI_rolling_mean,
                                    "cloud_percentage": obj.cloud_percentage

                                }
                            })
                        }


                        setpatternSelfData(altered_year_data);
                    }


                } catch (err) {
                }

            }
        });

    }, [taskId]);

    useEffect(() => {
        if (!lat) return

        getRainfallData()
        getTemperatureData()
        getTemperatureDataMin()
        getTemperatureDataMax()
        getGddData()

    }, [lat])

    useEffect(() => {
        setFormData({
            ...formData,
            StartDate: today.subtract(1, "year"),
            EndDate: today,
            cloud_percentage: 40,
        });
    }, []);
    const {StartDate, EndDate, index, cloud_percentage} = formData;
    const onChange = (e) =>
        setFormData({...formData, [e.target.name]: e.target.value});
    const onChangeIndex = (e) => {
        setFormData({...formData, index: e.target.value});
        switch (e.target.value) {
            case "ndvi":
                setindexText("vegetation");
                break;
            case "ndre":
                setindexText("Nitrogen Index");
                break;
            case "ndwi":
                setindexText("Water content");
                break;
            case "gci":
                setindexText("Plant Health Index");
                break;
            case "psri":
                setindexText("Plant Senescence Index");
                break;
            case "ndmi":
                setindexText("Soil moisture index");
                break;
            default:
                setindexText("vegetation");
        }
    };
    const onChangeReferenceYear = (e) => {
        setbestYear(e.target.value);
    };
    const onChangeBadYears = (e) => {
        setyearsRemoveList(e.target.value);
    };
    const onChangeSlider = (e, value) => {
        setFormData({...formData, cloud_percentage: value});
    };

    function valuetext(value) {
        return `${value} %`;
    }

    useEffect(() => {
        if (!taskId) return;
        dispatch(get_task_notifications(taskId)).then((res) => {
            if (res.status === 200) {
                setnotifications(res.data.data);

            } else {
                setnotifications([]);
            }
        });

        dispatch(getTaskPatternAlerts(user.id, taskId, 0)).then((res) => {
            if (res.status === 200) {
                let alertsDates = {"ordinaryAlerts": [], "severeAlerts": []}
                res.data.alerts.map(alert => {
                    if (alert.difference >= 0.16 || alert.difference <= -0.16) {
                        alertsDates.severeAlerts.push(alert.time.split('T')[0])
                    } else {
                        alertsDates.ordinaryAlerts.push(alert.time.split('T')[0])
                    }
                })

                setPatternAlertsDates(alertsDates);
            } else {
                setPatternAlertsDates({"ordinaryAlerts": [], "severeAlerts": []});
            }
        });
        dispatch(getSelfTaskPatternAlerts(user.id, taskId, 0)).then((res) => {
            if (res.status === 200) {
                let alertsData = {
                    ordinaryAlerts: [],
                    severeAlerts: []
                };

                res.data.alerts.forEach(alert => {
                    const alertDate = alert.time.split('T')[0];
                    const referenceValue = alert.reference_value;
                    const alertInfo = {
                        date: alertDate,
                        reference_value: referenceValue
                    };

                    if (alert.difference >= 0.16 || alert.difference <= -0.16) {
                        alertsData.severeAlerts.push(alertInfo);
                    } else {
                        alertsData.ordinaryAlerts.push(alertInfo);
                    }
                });

                setAutoPatternAlertsDates(alertsData);
            } else {
                setAutoPatternAlertsDates({ordinaryAlerts: [], severeAlerts: []});
            }
        });
        dispatch(getTaskNdviForecastAlerts(user.id, taskId, 0)).then((res) => {
            if (res.status === 200) {
                let alertsDates = {"ordinaryAlerts": [], "severeAlerts": []}
                res.data.alerts.map(alert => {
                    if (alert.difference >= 0.16 || alert.difference <= -0.16) {
                        alertsDates.severeAlerts.push(alert.time.split('T')[0])
                    } else {
                        alertsDates.ordinaryAlerts.push(alert.time.split('T')[0])
                    }
                })
                setNdviForecastAlertsDates(alertsDates);
            } else {
                setNdviForecastAlertsDates({"ordinaryAlerts": [], "severeAlerts": []});
            }
        });

        dispatch(getForecastParams(taskId)).then((res) => {
            if (res.status === 200) {
                setbestYear(res.data.data.bestYear);
                setyearsRemoveList(res.data.data.BadYears);
            }
        });
    }, [taskId]);
    useEffect(() => {
        if (!taskId) return;
        if (data_graph) {
            setLoading(false);
            return;
        }
        let intervalId;
        const checkGraphData = () => {
            if (!graphDataReady) {
                if (attemptCount < 36) {
                    dispatch(getIndexArray(taskId)).then((res) => {
                        if (res.status === 200) {
                            setgraphDataReady(true);
                            setLoading(false);
                            clearInterval(intervalId);
                        }
                    });
                    setAttemptCount(attemptCount + 1);
                } else {
                    // Stop the interval after reaching maxAttempts wichh is 3 min
                    clearInterval(intervalId);
                }
            } else {
                clearInterval(intervalId);
                setLoading(false);
            }
        };
        intervalId = setInterval(checkGraphData, 5000);
        // Initial check
        checkGraphData();
        // Cleanup the interval when the component unmounts
        return () => clearInterval(intervalId);
    }, [taskId, data_graph]);

    useEffect(() => {
        if (!data_graph) return;
        const ndviElement = data_graph.find((item) => item.index === "ndvi");
        let dataFiltred = [];
        let dataSmoothedFiltred = [];
        dataFiltred = handleFilterData(ndviElement.data, StartDate, EndDate);
        dataSmoothedFiltred = handleFilterData(
            ndviElement.data_smoothed,
            StartDate,
            EndDate
        );
        const {minValue, maxValue} = findMinMaxValues(
            dataFiltred,
            dataSmoothedFiltred
        );
        const arr = {
            data: dataFiltred,
            data_smoothed: dataSmoothedFiltred,
            min: minValue,
            max: maxValue,
        };
        setdata(arr);
        if (dataPredict.length !== 0) {
            const ElementPredict = dataPredict["ndvi"];
            setdataPredictIndex(ElementPredict.data_predict_fortnite);
        } else {
            setdataPredictIndex([]);
        }
        // Extract unique years
        const uniqueYears = extractUniqueYears(ndviElement.data);
        setyears(uniqueYears);
        // const dataWithCloudMask = handleFilterDataByCloudPercentage(ndviElement.data, cloud_percentage)
        const dataByYear = {};
        uniqueYears.forEach((year) => {
            dataByYear[year] = extractDataForYear(ndviElement.data, year);
        });
        // const { minValueAllYears, maxValueAllYears } = findMinMaxValues(ndviElement.data, ndviElement.data);
        const valuesArray = ndviElement.data.map((item) => parseFloat(item.value));
        // Find min and max values
        const minValueAllYears = Math.min(...valuesArray);
        const maxValueAllYears = Math.max(...valuesArray);
        const arr2 = [
            {
                data: dataByYear,
                min: minValueAllYears,
                max: maxValueAllYears,
                years: uniqueYears,
            },
        ];
        setdataPerYear(arr2);
    }, [data_graph, dataPredict]);
    const renderSelectGroup = (year) => {
        return (
            <MenuItem
                key={year}
                value={year}
                sx={{justifyContent: "space-between"}}
            >
                {year}
                {Array.isArray(yearsRemoveList) && yearsRemoveList.includes(year) ? (
                    <CheckIcon color="info"/>
                ) : null}
            </MenuItem>
        );
    };

    const onSubmit = (e) => {
        setLoading(true);
        e.preventDefault();
        // Validation: Check if StartDate, EndtDate, and index are not empty
        if (
            !StartDate ||
            !EndDate ||
            !index ||
            !StartDate.isValid() ||
            !EndDate.isValid()
        ) {
            dispatch(
                showSnackbar(
                    "error",
                    undefined,
                    t("Please checkout all fields !"),
                    "top",
                    "right"
                )
            );
            setLoading(false);
        } else if (!StartDate.isBefore(EndDate)) {
            dispatch(
                showSnackbar(
                    "error",
                    undefined,
                    t("Start date must be before end date !"),
                    "top",
                    "right"
                )
            );
        } else {
            const indexElement = data_graph.find((item) => item.index === index);
            // Function to handle filtering based on start and end dates
            let dataFiltred = [];
            let dataSmoothedFiltred = [];
            let dataFiltredByCloudPercentage = [];
            let dataSmoothedFiltredByCloudPercentage = [];
            dataFiltred = handleFilterData(indexElement.data, StartDate, EndDate);
            dataSmoothedFiltred = handleFilterData(
                indexElement.data_smoothed,
                StartDate,
                EndDate
            );
            dataFiltredByCloudPercentage = handleFilterDataByCloudPercentage(
                dataFiltred,
                cloud_percentage
            );
            dataSmoothedFiltredByCloudPercentage = handleFilterDataByCloudPercentage(
                dataSmoothedFiltred,
                cloud_percentage
            );
            const {minValue, maxValue} = findMinMaxValues(
                dataFiltred,
                dataSmoothedFiltred
            );
            const arr1 = {
                data: dataFiltredByCloudPercentage,
                data_smoothed: dataSmoothedFiltredByCloudPercentage,
                min: minValue,
                max: maxValue,
            };
            setdata(arr1);
            if (dataPredict.length > 0) {
                const ElementPredict = dataPredict[index];
                setdataPredictIndex(ElementPredict.data_predict_fortnite);
            }
            const uniqueYears = extractUniqueYears(indexElement.data);
            // Extract data for each year
            const dataWithCloudMask = handleFilterDataByCloudPercentage(
                indexElement.data,
                cloud_percentage
            );
            const dataByYear = {};
            uniqueYears.forEach((year) => {
                dataByYear[year] = extractDataForYear(dataWithCloudMask, year);
            });
            // const { minValueAllYears, maxValueAllYears } = findMinMaxValues(indexElement.data, indexElement.data);
            const valuesArray = indexElement.data.map((item) =>
                parseFloat(item.value)
            );
            // Find min and max values
            const minValueAllYears = Math.min(...valuesArray);
            const maxValueAllYears = Math.max(...valuesArray);
            const arr2 = [
                {
                    data: dataByYear,
                    min: minValueAllYears,
                    max: maxValueAllYears,
                    years: uniqueYears,
                },
            ];

            getRainfallData(StartDate, EndDate)
            getTemperatureDataMin(StartDate, EndDate)
            getTemperatureDataMax(StartDate, EndDate)
            getGddData(StartDate, EndDate)


            setdataPerYear(arr2);
            setLoading(false);
        }


        setLoading(false);
        setCurrentIndex(indexText)
    };
    const onSubmitParams = (e) => {
        e.preventDefault();
        setloadingForecast(true);
        dispatch(addForecastParams(taskId, bestYear, yearsRemoveList)).then(
            (res) => {
                if (res.status === 200) {
                    dispatch(ForecastTrain(taskId)).then((response) => {
                        if (response.status === 200) {
                            dispatch(ForecastPredict(taskId)).then((res2) => {
                                if (res2.status === 200) {
                                    dispatch(getForecastPredict(taskId)).then((response) => {
                                        if (response.status === 200) {
                                            setdataPredict(response.data.results);
                                            dispatch(
                                                showSnackbar(
                                                    "success",
                                                    undefined,
                                                    t(res.data.message),
                                                    "top",
                                                    "right",
                                                    "10000"
                                                )
                                            );
                                            setloadingForecast(false);
                                        } else {
                                            setdataPredict([]);
                                            dispatch(
                                                showSnackbar(
                                                    "error",
                                                    "something went wrong !",
                                                    t(res.data.message),
                                                    "top",
                                                    "right",
                                                    "3000"
                                                )
                                            );
                                            setloadingForecast(false);
                                        }
                                    });
                                }
                            });
                        }
                    });

                    dispatch(get_task_notifications(taskId)).then((res) => {
                        if (res.status === 200) {
                            setnotifications(res.data.data);
                        } else {

                            setnotifications([]);
                        }
                    });
                }
                // setloadingForecast(false)
            }
        );
    };
    const applyMonthRange = (range) => {
        setYearGraphMonth(range)
    }
    const onSubmitSelfPattern = (e) => {
        setLoadingSelfPatter(true);

        e.preventDefault();
        dispatch(saveSelfPattern(formSelfDataPattern)).then((res) => {
            dispatch(
                showSnackbar(
                    "success",
                    undefined,
                    t(res.data.message),
                    "top",
                    "right",
                    "10000"
                )
            );
            setLoadingSelfPatter(false);

        });

    };
    const onChangeSelfPattern = (e) => {
        const { name, value } = e.target;

        setFormSelfDataPattern((prevState) => {
            if (name === "StartSelfDateP") {
                const newStartDate = dayjs(value);
                const today = dayjs(); // La date d'aujourd'hui
                const tentativeEndDate = newStartDate.add(1, "year");

                return {
                    ...prevState,
                    [name]: newStartDate,
                    EndSelfDateP: tentativeEndDate.isAfter(today) ? today : tentativeEndDate,
                };
            }

            return {
                ...prevState,
                [name]: value,
            };
        });
    };
    const getNDVIValueForDate = (data, targetDate) => {
        if (!targetDate) return null;

        const exactMatch = data.data_smoothed.find(item => item.date === targetDate);
        if (exactMatch) {
            return exactMatch.NDVI_rolling_mean;
        }

        const dates = data.data_smoothed.map(item => new Date(item.date).getTime());
        const targetTime = new Date(targetDate).getTime();

        let beforeIndex = -1;
        let afterIndex = -1;

        for (let i = 0; i < dates.length; i++) {
            if (dates[i] <= targetTime) {
                beforeIndex = i;
            }
            if (dates[i] >= targetTime && afterIndex === -1) {
                afterIndex = i;
            }
        }

        if (beforeIndex === -1) {
            return data.data_smoothed[0].NDVI_rolling_mean;
        }
        if (afterIndex === -1) {
            return data.data_smoothed[data.data_smoothed.length - 1].NDVI_rolling_mean;
        }

        const beforeDate = dates[beforeIndex];
        const afterDate = dates[afterIndex];
        const beforeValue = data.data_smoothed[beforeIndex].NDVI_rolling_mean;
        const afterValue = data.data_smoothed[afterIndex].NDVI_rolling_mean;

        const ratio = (targetTime - beforeDate) / (afterDate - beforeDate);
        const interpolatedValue = beforeValue + (afterValue - beforeValue) * ratio;

        return Number(interpolatedValue.toFixed(4));
    };
    return (
        <Container maxWidth="xl">
            <Row className="pt-4 pb-4">
                <Accordion defaultExpanded>
                    <AccordionSummary
                        expandIcon={<ExpandMoreIcon/>}
                        aria-controls="panel2-content"
                        id="panel2-header"
                    >
                        <Typography variant="h6">{t("Graph Data Filters")}</Typography>
                    </AccordionSummary>
                    <AccordionDetails>
                        <Form onSubmit={(e) => onSubmit(e)}>
                            <div className="row">
                                <div className="col-md-4">
                                    {start_end_dates ? (
                                        <BasicDatePicker
                                            disabled={loading}
                                            className="graph_date_input"
                                            label={t("start date")}
                                            value={StartDate}
                                            name={"StartDate"}
                                            minDate={dayjs("2017-04-01")}
                                            maxDate={today}
                                            onChange={(e) => onChange(e)}
                                        />
                                    ) : (
                                        ""
                                    )}

                                </div>
                                <div className="col-md-4">
                                    {start_end_dates ? (
                                        <BasicDatePicker
                                            disabled={loading}
                                            className="graph_date_input"
                                            label={t("end date")}
                                            value={EndDate}
                                            name={"EndDate"}
                                            onChange={(e) => onChange(e)}
                                            minDate={dayjs("2017-04-01")}
                                            maxDate={today}
                                        />
                                    ) : (
                                        ""
                                    )}
                                </div>
                                <div className="col-md-4">
                                    <FormControl
                                        sx={{mt: 1, mb: 1}}
                                        size="small"
                                        className="m-select col-sm-12 "
                                    >
                                        <InputLabel id="demo-select-index-label">
                                            {t("Index")}
                                        </InputLabel>
                                        <Select
                                            disabled={loading}
                                            labelId="demo-select-index-label"
                                            id="demo-select-index"
                                            label="Index"
                                            fullWidth
                                            onChange={(e) => onChangeIndex(e)}
                                            name="Index"
                                            defaultValue={"ndvi"}
                                            value={index}
                                        >
                                            <MenuItem value="ndvi">{t("vegetation")}</MenuItem>
                                            <MenuItem value="ndwi">{t("Water content")}</MenuItem>
                                            <MenuItem value="ndre">{t("Nitrogen Index")}</MenuItem>
                                            <MenuItem value="gci">{t("Plant Health Index")}</MenuItem>
                                            <MenuItem value="psri">
                                                {t("Plant Senescence Index")}
                                            </MenuItem>
                                            <MenuItem value="ndmi">
                                                {t("Soil moisture index")}
                                            </MenuItem>
                                        </Select>
                                    </FormControl>
                                </div>
                            </div>
                            <div className="row mt-2">
                                <div className="col-md-12">
                                    <Typography id="input-slider" gutterBottom>
                                        {t('Cloud percentage')}
                                    </Typography>
                                </div>
                            </div>
                            <div className="row justify-content-center">
                                <div className="col-md-11">
                                    <Slider
                                        aria-label="Temperature"
                                        defaultValue={40}
                                        getAriaValueText={valuetext}
                                        valueLabelDisplay="on"
                                        marks={marks}
                                        min={10}
                                        max={40}
                                        step={10}
                                        disabled={loading}
                                        name="cloud_percentage"
                                        value={cloud_percentage}
                                        onChange={onChangeSlider}
                                    />
                                </div>
                            </div>
                            <div className="row">
                                <div className="col-md-12 d-flex justify-content-center">
                                    <LoadingButton
                                        size="small"
                                        color="primary"
                                        type="submit"
                                        loading={loading}
                                        loadingPosition="start"
                                        startIcon={<SaveIcon/>}
                                        variant="contained"
                                    >
                                        <span>{t("Process")}</span>
                                    </LoadingButton>
                                </div>
                            </div>
                        </Form>
                    </AccordionDetails>
                </Accordion>
                <Accordion>
                    <AccordionSummary
                        expandIcon={<ExpandMoreIcon/>}
                        aria-controls="panel2-content"
                        id="panel2-header"
                    >
                        <Typography variant="h6">{t("Forecast Data Settings")}</Typography>
                    </AccordionSummary>
                    <AccordionDetails>
                        <Typography>
                            {t(
                                "Select the 'Reference Year' that exhibited optimal production levels with minimal disease and nutrient deficiencies."
                            )}
                            <br></br>
                            {t(
                                "For 'Low-Performance Years' choose years that faced challenges such as pest attacks, low production, or poor management."
                            )}{" "}
                            <br></br>
                            {t(
                                "These selections will help analyze and compare forecast data to assess trends and potential improvements."
                            )}
                            <Form onSubmit={(e) => onSubmitParams(e)}>
                                <div className="row mt-3"
                                >
                                    <div className="col-md-4"
                                    >

                                        <FormControl
                                            sx={{
                                                mt: 1,
                                                mb: 1,
                                                "@media (max-width: 768px)": {
                                                    width: "100%",
                                                },
                                            }}
                                            size="small"
                                            className="m-select col-sm-12 "
                                            required

                                        >
                                            <InputLabel id="demo-select-best-year">
                                                {t("Reference Year")}
                                            </InputLabel>
                                            <Select
                                                disabled={loadingForecast}
                                                labelId="demo-select-best-year"
                                                id="demo-select-best-year"
                                                label={t("Reference Year")}
                                                fullWidth
                                                required
                                                onChange={(e) => onChangeReferenceYear(e)}
                                                name="bestYear"
                                                value={bestYear}
                                            >
                                                {years && years.length > 0 ? (
                                                    years.map((year, index) => (
                                                        <MenuItem
                                                            value={year}
                                                            key={index}
                                                            selected={bestYear === year}
                                                        >
                                                            {year}
                                                        </MenuItem>
                                                    ))
                                                ) : (
                                                    <MenuItem disabled>
                                                        {t("No years available")}
                                                    </MenuItem>
                                                )}
                                            </Select>
                                        </FormControl>
                                    </div>
                                    <div className="col-md-4">
                                        <FormControl
                                            sx={{
                                                mt: 1,
                                                mb: 1,
                                                "@media (max-width: 768px)": {
                                                    width: "100%",
                                                },
                                            }}
                                            size="small"
                                            className="m-select col-sm-12"
                                            required
                                        >
                                            <InputLabel id="demo-select-bad-year">
                                                {t("Low-Performance Years")}
                                            </InputLabel>
                                            <Select
                                                disabled={loadingForecast}
                                                labelId="demo-select-bad-label"
                                                id="demo-select-bad-year"
                                                label={t("Low-Performance Years")}
                                                fullWidth
                                                multiple
                                                required
                                                onChange={(e) => onChangeBadYears(e)}
                                                name="bestYear"
                                                value={yearsRemoveList}
                                                renderValue={(selected) => (
                                                    <Stack gap={1} direction="row" flexWrap="wrap">
                                                        {selected.map((value) => {
                                                            const foundYear = years.find(
                                                                (year) => year === value
                                                            );

                                                            return (
                                                                <Chip
                                                                    key={value}
                                                                    label={foundYear ? foundYear : ""}
                                                                    onDelete={() =>
                                                                        setyearsRemoveList(
                                                                            yearsRemoveList.filter(
                                                                                (item) => item !== value
                                                                            )
                                                                        )
                                                                    }
                                                                    deleteIcon={
                                                                        <CancelIcon
                                                                            onMouseDown={(event) =>
                                                                                event.stopPropagation()
                                                                            }
                                                                        />
                                                                    }
                                                                />
                                                            );
                                                        })}
                                                    </Stack>
                                                )}
                                            >
                                                {years &&
                                                    years.length > 0 &&
                                                    years.map((item) => renderSelectGroup(item))}
                                            </Select>
                                        </FormControl>
                                    </div>
                                    <div className="col-md-4 d-flex justify-content-center align-items-center">
                                        <LoadingButton
                                            size="small"
                                            color="success"
                                            type="submit"
                                            loading={loadingForecast}
                                            loadingPosition="start"
                                            startIcon={<SaveIcon/>}
                                            variant="contained"
                                        >
                                            <span>{t("Save")}</span>
                                        </LoadingButton>
                                    </div>
                                </div>
                            </Form>
                        </Typography>
                    </AccordionDetails>
                </Accordion>


                <Accordion>
                    <AccordionSummary
                        expandIcon={<ExpandMoreIcon/>}
                        aria-controls="panel3-content"
                        id="panel3-header"
                    >
                        <Typography variant="h6">{t("Auto Pattern")}</Typography>
                    </AccordionSummary>
                    <AccordionDetails>
                        <Typography>
                            {t(
                                "Select the 'reference year' that showed ideal production levels to generate a comparison pattern."
                            )}
                            <Form onSubmit={(e) => onSubmitSelfPattern(e)}>
                                <div className="row mt-3">
                                    <div className="col-md-4">
                                        <FormControl
                                            sx={{ mt: 1, mb: 1 }}
                                            size="small"
                                            className="m-select col-sm-12"
                                            required
                                        >
                                            <BasicDatePicker
                                                disabled={loadingSelfPatter}
                                                className="graph_date_input"
                                                label={t("start date")}
                                                value={StartSelfDateP}
                                                name={"StartSelfDateP"}
                                                maxDate={today}
                                                minDate={dayjs("2017-04-01")}
                                                onChange={(e) => onChangeSelfPattern(e)}
                                            />
                                        </FormControl>
                                    </div>
                                    <div className="col-md-4">
                                        <FormControl
                                            sx={{ mt: 1, mb: 1 }}
                                            size="small"
                                            className="m-select col-sm-12"
                                            required
                                        >
                                            <BasicDatePicker
                                                disabled={loadingSelfPatter}
                                                className="graph_date_input"
                                                label={t("end date")}
                                                maxDate={
                                                    StartSelfDateP
                                                        ? dayjs(StartSelfDateP).add(1, 'year').isAfter(dayjs())
                                                            ? dayjs()
                                                            : dayjs(StartSelfDateP).add(1, 'year')
                                                        : dayjs()
                                                }
                                                value={EndSelfDateP}
                                                name={"EndSelfDateP"}
                                                minDate={dayjs(StartSelfDateP).add(1, 'day')}
                                                onChange={(e) => onChangeSelfPattern(e)}
                                            />
                                        </FormControl>
                                    </div>

                                    <div className="col-md-4 d-flex justify-content-center align-items-center">
                                        <LoadingButton
                                            size="small"
                                            color="success"
                                            type="submit"
                                            loading={loadingSelfPatter}
                                            loadingPosition="start"
                                            startIcon={<SaveIcon/>}
                                            variant="contained"
                                        >
                                            <span>{t("Save")}</span>
                                        </LoadingButton>
                                    </div>
                                </div>
                            </Form>
                        </Typography>
                    </AccordionDetails>
                </Accordion>

                <div className="row mt-5">
                    <div className="col-md-12 d-flex justify-content-center">
                        <Typography variant="h5" component="h2" style={{textAlign:"center"}}>
                            {t('Historical')} {t(`${currentIndex}`)} {t('Data')}
                        </Typography>
                    </div>
                </div>

                {indexText && data && (
                    <div
                        className="col-md-12"
                        style={{}}>
                        <Graph
                            vegetationIndex={currentIndex}
                            data={data}
                            datapredict={dataPredictIndex}
                            indexForecast={IndexForecast}
                            notifications={notifications}
                            pattern={patternData}
                            rainData={dailyRain}
                            rain_max={rainMax}
                            rain_min={rainMin}
                            tempData={dailyTemp}
                            tempDataMin={dailyTempMin}
                            tempDataMax={dailyTempMax}
                            temp_max={tempMax}
                            temp_min={tempMin}
                            gddData={dailyGdd}
                            gdd_max={gddMax}
                            gdd_min={gddMin}
                            cultureId={cultureId}
                            patternAlertsDates={patternAlertsDates}
                            ndviForecastAlertsDates={ndviForecastAlertsDates}
                            patternSelf={patternSelfData}
                            selfPatternAlertsDates={autoPatternAlertsDates}
                            anomaly={anomaly}
                            highResOrders={highResOrders}
                            intensificationPlant={[intensificationDate[0], getNDVIValueForDate(data_graph[0], intensificationDate)]}
                            startendDate={[dayjs(StartDate).format('YYYY-MM-DD'),dayjs(EndDate).format('YYYY-MM-DD')]}
                            task={task}

                        />
                    </div>
                )}
                <div className="col-md-12 mt-5">

                    <div className="col-md-12 d-flex justify-content-center">
                        <Typography variant="h5" component="h2" style={{textAlign:"center"}}>
                            {t('Yearly Comparison of')} {t(`${currentIndex}`)}
                        </Typography>
                    </div>
                </div>
                <div className="mt-3" style={{maxWidth: "80%", margin: "0 auto"}}>
                    <MonthRangePicker handleMonthRange={applyMonthRange}/>
                </div>

                {indexText && dataPerYear.length > 0 && (
                    <div
                        className="mt-3 mb-10"
                        style={{marginBottom: "60px"}}
                    >
                        <GraphYear vegetationIndex={currentIndex} data={dataPerYear[0]} rain_data={dailyRain}
                                   monthRange={yearGraphMonth}/>
                    </div>
                )}
            </Row>
        </Container>
    );
};

export default GraphPage;
