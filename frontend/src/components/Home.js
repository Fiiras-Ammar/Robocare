import React, {useEffect, useState} from "react";
import {loadingBegin, loadingEnd} from "../actions/map";
import {useDispatch} from "react-redux";
import {useTranslation} from "react-i18next";
import "../assets/scss/dashboard.scss";
import {getPDFInvoiceList, getStatistics} from "../actions/profile";
import {get_tasks_last_images_date, getHighResOrdersForUser} from "../actions/task";

import {Chart as ChartJS, ArcElement, Tooltip, Legend} from "chart.js";
import {Pie} from "react-chartjs-2";
import earthImg from "../assets/images/earth.png";
import timeImg from "../assets/images/time.png";
import Avatar from "react-avatar";
import {getRandomColor} from "../utils/backgroundColors";
import {getPieRandomColor} from "../utils/backgroundColors";
import dashBackground from "../assets/images/dash-background.png";
import loading from '../assets/images/loading_small.svg'
import {BsFillCloudArrowDownFill} from "react-icons/bs";

import {useSelector} from 'react-redux';
import cookies from "js-cookie";
import {Box, Grid} from "@mui/material";
import pdfIcon from "../assets/images/icons/pdf.svg";

import {addSubscription, downloadOrderReport} from '../actions/task';
import DonutChart from "../Element/Chart/Doughnut";
import RadialChart from "../Element/Chart/Doughnut";
import Doughnut from "../Element/Chart/Doughnut";
import {
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    CircularProgress, // Import CircularProgress for loading indicator
} from '@mui/material';
import { useNavigate } from 'react-router-dom';

ChartJS.register(ArcElement, Tooltip, Legend);

const pieOptions = {
    plugins: {
        tooltip: {
            callbacks: {
                label: (context) => `${context.label || ""}: ${context.formattedValue || ""} Ha`,
            },
        },
    },
};
const Home = ({}) => {
    const dispatch = useDispatch();
    const {t} = useTranslation();
    const taskId = useSelector(state => state.mapReducer.taskIdDetails)
    const user = useSelector((state) => state.auth.user);

    const [statistics, setStatistics] = useState({});
    const [highResOrders, setHighResOrders] = useState([]);
    const [data, setData] = useState({});
    const [gradientColor, setgradientColor] = useState(null);
    const currentLanguageCode = cookies.get("i18next") || "en";
    const [cultureData, setCultureData] = useState({});
    const [invoicePdf, setInvoicePdf] = useState({});
    const [taskData, setTaskData] = useState([]);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    // Add null checks before data access
useEffect(() => {
    const fetchData = async () => {
        try {
            const res = await dispatch(getStatistics());
            if (res?.status === 200 && res?.data?.data) {
                setStatistics(res.data.data);
                // Safely format data
                const varieties = res.data.data.varieties || [];
                const cultures = res.data.data.cultures || [];
                setData(formatData(varieties, "variety_name_"));
                setCultureData(formatData(cultures, "culture_name_"));
            }
        } catch (error) {
            console.error("Statistics fetch failed:", error);
        }
    };
    fetchData();
}, [dispatch, currentLanguageCode]);

    useEffect(() => {
        const fetchInvoices = async () => {
            if (!user?.id) return;

            dispatch(loadingBegin());
            try {
                const res = await dispatch(getPDFInvoiceList(user.id));
                if (res.status === 200 && res.data.data) {
                    setInvoicePdf(res.data.data);
                } else {
                    setInvoicePdf({});
                }
            } catch (error) {
                console.error('Error fetching invoices:', error);
                setInvoicePdf({});
            } finally {
                dispatch(loadingEnd());
            }
        };

        fetchInvoices();
    }, [dispatch, currentLanguageCode, user?.id]);

    const formatData = (items, keyPrefix) => {
        const labels = [];
        const dataset = [];
        const colors = [];
        const usedColors = [];
        const key = keyPrefix + currentLanguageCode;
        items.forEach((item) => {
            labels.push(item[key]);
            dataset.push(item.surface || item.cultureSurface);
            colors.push(getPieRandomColor(usedColors));
        });
        return {
            labels,
            datasets: [
                {
                    data: dataset,
                    backgroundColor: colors,
                },
            ],
        };
    };
    useEffect(() => {
        if (!user) return;
        dispatch(getHighResOrdersForUser(user.id))
            .then((res) => {
                if (res.status === 200) {
                    setHighResOrders(res.data);
                } else {
                }
            })
            .catch((error) => {
            });

        dispatch(loadingEnd());
    }, [user]);
    useEffect(() => {
        if (!user) return;

        dispatch(get_tasks_last_images_date(user.id))
            .then((res) => {
                if (res && res.data) {
                    setTaskData(res.data);
                } else {
                    console.warn("Unexpected response format:", res);
                    setTaskData([]);
                }
            })
            .catch((error) => {
                console.error("Error fetching task data:", error);
                setTaskData([]);
            });
    }, [user]);

    const handleRowClick = (taskId) => {
        navigate(`/task/detail/${taskId}`);
    };
    return (
        <Grid container sx={{flex: 1}}>
            <Grid container spacing={2} sx={{p: 2}}>
                <Grid item xs={12} sm={6}>  {/* Column for the existing component */}
                    <Grid container spacing={2} className="mb-3">
                        <Grid item xs={12} className="m-profile">
                            <div className="m-header">
                                <div className="m-text">
                                    <h5 className="m-headline">
                                        {t("Welcome Back !")}
                                    </h5>
                                    <p className="m-headline">
                                        {statistics.full_name}
                                    </p>
                                </div>
                                <div className="m-image">
                                    <img
                                        src={dashBackground}
                                        alt="Dashboard background"
                                    />
                                </div>
                            </div>
                            <div className="m-content d-none d-md-block">
                                <div className="m-profile-image">
                                    <Avatar
                                        color={getRandomColor()}
                                        name={statistics.full_name}
                                        round
                                    />
                                </div>
                            </div>
                        </Grid>
                    </Grid>
                    <Grid container spacing={2} className="mb-2">
                        <Grid item xs={12} sm={6}>
                            <div className="m-card">
                                <div className="m-text">
                                    <p className="m-title">{t("Surface")}</p>
                                    <p className="m-value">{statistics.surface} Ha</p>
                                </div>
                                <div className="m-icon">
                                    <img
                                        className="m-image"
                                        src={earthImg}
                                        alt="Earth icon"
                                    />
                                </div>
                            </div>
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <div className="m-card">
                                <div className="m-text">
                                    <p className="m-title">{t("Last login")}</p>
                                    <p className="m-value">{statistics.last_login}</p>
                                </div>
                                <div className="m-icon">
                                    <img
                                        className="m-image"
                                        src={timeImg}
                                        alt="Time icon"
                                    />
                                </div>
                            </div>
                        </Grid>
                    </Grid>
                </Grid>

            </Grid>
            <Grid container spacing={2} sx={{p: 2}} >
                <Grid item xs={12}>
                    <h2> {t("Last Images")}</h2>

                    {loading ? (
                        <CircularProgress />
                    ) : taskData.length > 0 ? (
                        <Grid container spacing={2}>
                            {taskData.map((task) => (
                                <Grid item xs={12} sm={6} md={4} key={task.id}>
                                    <div
                                        className="m-card"
                                        style={{
                                            display: 'flex',
                                            justifyContent: 'space-between',
                                            padding: '16px',
                                            borderRadius: '8px',
                                            boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                                            cursor: 'pointer',
                                            margin: '8px 0',
                                            backgroundColor: '#fff'
                                        }}
                                        onClick={() => handleRowClick(task.id)}
                                    >
                                        <div className="m-text">
                                            <p className="m-title" style={{ fontWeight: 'bold', margin: '0 0 8px 0' }}>
                                                {task.task_name}
                                            </p>
                                            <p className="m-value" style={{ margin: 0 }}>
                                                {task.most_recent_date}
                                            </p>
                                        </div>
                                        <div className="m-icon">
                                            <img
                                                className="m-image"
                                                src={`${process.env.REACT_APP_API_URL}/media/covers/${task.id}-300x300.png`}
                                                alt="Image icon"
                                                style={{ width: '60px', height: '60px' ,marginRight:'30px'}}
                                            />
                                        </div>
                                    </div>
                                </Grid>
                            ))}
                        </Grid>
                    ) : (
                        <p>No images are available.</p>
                    )}
                </Grid>
            </Grid>
            <Grid container spacing={2} sx={{p: 2}}>
                <Grid item xs={12} sm={12}>
                    <Grid container spacing={2} className="mb-2">
                        <Grid item xs={12} sm={6}>
                            <Grid container spacing={2} className="mb-2">
                                <Grid item xs={12} sx={{justifyContent: "center"}}>
                                    <h3 className="m-title text-center">
                                        {t("Distribution of plantations in hectares")}
                                    </h3>
                                </Grid>
                                <Grid
                                    item
                                    xs={12}
                                    sx={{justifyContent: "center"}}
                                >
                                    {cultureData.labels &&
                                        cultureData.labels.length > 0 && (
                                            // <Pie data={cultureData} options={pieOptions} style={{ maxHeight: "300px" }} />
                                            <Doughnut data={cultureData}/>
                                        )}
                                </Grid>
                            </Grid>
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <Grid container spacing={2} className="mb-2">
                                <Grid item xs={12} sx={{justifyContent: "center"}}>
                                    <h3 className="m-title text-center">
                                        {t(
                                            "Agricultural distribution in hectares"
                                        )}
                                    </h3>
                                </Grid>
                                <Grid
                                    item
                                    xs={12}
                                    sx={{justifyContent: "center"}}
                                >
                                    {data.labels && data.labels.length > 0 && (
                                        //<Pie data={data} options={pieOptions} style={{ maxHeight: "300px" }} />
                                        <Doughnut data={data}/>
                                    )}
                                </Grid>
                            </Grid>
                        </Grid>
                    </Grid>
                </Grid>
            </Grid>

            {/*
{highResOrders && highResOrders.length > 0 && ( // Vérifie si highResOrders existe et contient des éléments
    <Grid container spacing={2} sx={{ p: 2 }}> // Container principal avec espacement et padding
        <Grid item xs={12}>
            <h4 className="header-title m-b-30">{t("High resolution imagery reports")}</h4> // Titre de la section
        </Grid>
        <Grid item xs={12}>
            <Grid spacing={2}>
                <Box
                    sx={{ width: "100%", borderRadius: 1, bgcolor: "#fff", p: 2 }} // Style du conteneur principal
                    className="m-files-list"
                >
                    {highResOrders.map((item) => { // Itération sur chaque élément de highResOrders
                        if (item.orders.length != 0) { // Vérifie si l'élément contient des commandes
                            return (
                                <Grid container spacing={2}>
                                    <Grid item xs={12}>
                                        <h6 style={{ background: "#909090", borderRadius: "2px", width: "fit-content", color: "white", padding: "2px" }}>
                                            {item.task_name} // Affiche le nom de la tâche
                                        </h6>
                                    </Grid>
                                    {item.orders.map((order) => ( // Itération sur les commandes de l'élément
                                        <Grid
                                            item
                                            xs={12} sm={2}
                                            onClick={item.order_status != "running" // Condition pour télécharger le rapport
                                                ? () => dispatch(downloadOrderReport(order.order_id, taskId, `${order.task_name}_${order.acquisition_date}`))
                                                : null}
                                        >
                                            <div className="file-man-box">
                                                {item.order_status === "running"
                                                    ? <img src={loading} width={"30px"} /> // Affiche un indicateur de chargement si la commande est en cours
                                                    : <BsFillCloudArrowDownFill color='#6f9d2f' />} // Icône de téléchargement
                                                <div className="file-img-box" style={{ height: "inherit" }}>
                                                    <img src={pdfIcon} alt="icon" height={50} /> // Affiche une icône PDF
                                                </div>
                                                <div className="file-man-title text-center">
                                                    <span className="mb-0 text-overflow">
                                                        <h6 className="mb-0 text-overflow">{order.acquisition_date}</h6> // Affiche la date d'acquisition
                                                    </span>
                                                </div>
                                            </div>
                                        </Grid>
                                    ))}
                                </Grid>
                            )
                        }
                    })}
                </Box>
            </Grid>
        </Grid>
    </Grid>
)}
*/}


            <Grid container spacing={2} sx={{p: 2}}>
                <Grid item xs={12}>
                    <h4 className="header-title m-b-30">{t("Monitoring reports")}</h4>
                </Grid>
                <Grid item xs={12}>
                    <Box sx={{width: "100%", borderRadius: 1, bgcolor: "#fff", p: 2}} className="m-files-list">
                        <Grid container spacing={2}>
                            {statistics.reports && statistics.reports.length > 0 ? (
                                statistics.reports.map((item, index) => (
                                    <Grid item xs={12} sm={2} key={index}>
                                        <a
                                            href={`${process.env.REACT_APP_API_URL}${item.file}`}
                                            className="mb-0 text-overflow"
                                            target="_blank"
                                            rel="noopener noreferrer"
                                        >
                                            <div className="file-man-box">
                                                <div className="file-img-box">
                                                    <img src={pdfIcon} alt="icon"/>
                                                </div>
                                                <div className="file-man-title text-center">
                                                    <h5 className="mb-0 text-overflow">{item.name}</h5>
                                                </div>
                                            </div>
                                        </a>
                                    </Grid>
                                ))
                            ) : (
                                <Grid item xs={12}>
                                    <span>{t("No available reports for the moment !")}</span>
                                </Grid>
                            )}
                        </Grid>
                    </Box>
                </Grid>
            </Grid>
            <Grid container spacing={2} sx={{p: 2}}>
                <Grid item xs={12}>
                    <h4 className="header-title m-b-30">{t("Invoices")}</h4>
                </Grid>
                <Grid item xs={12}>
                    <Box sx={{width: "100%", borderRadius: 1, bgcolor: "#fff", p: 2}} className="m-files-list">
                        <Grid container spacing={2}>
                            {invoicePdf && invoicePdf.length > 0 ? (
                                invoicePdf.map((item, index) => (
                                    <Grid item xs={12} sm={2} key={index}>
                                        <a
                                            href={`${process.env.REACT_APP_API_URL}${item.file}`}
                                            className="mb-0 text-overflow"
                                            target="_blank"
                                            rel="noopener noreferrer"
                                        >
                                            <div className="file-man-box">
                                                <div className="file-img-box">
                                                    <img src={pdfIcon} alt="icon"/>
                                                </div>
                                                <div className="file-man-title text-center">
                                                    <h5 className="mb-0 text-overflow">{item.name}</h5>
                                                </div>

                                            </div>
                                        </a>
                                        {/*<div className="file-man-title text-center">
                                            <h5 className="mb-0 text-overflow" >
                                                <span style={{ fontWeight: 'bold' }}>{t("Start date Invoice :")}</span> {item.startDate.split('T')[0].split('-').reverse().join('/')}
                                            </h5>
                                        </div>
                                        <div className="file-man-title text-center">
                                            <h5 className="mb-0 text-overflow" >
                                                <span style={{ fontWeight: 'bold' }}>{t("End date Invoice :")}</span> {item.endDate.split('T')[0].split('-').reverse().join('/')}
                                            </h5>
                                        </div>*/}
                                    </Grid>
                                ))
                            ) : (
                                <Grid item xs={12}>
                                    <span>{t("No available invoice for the moment !")}</span>
                                </Grid>
                            )}
                        </Grid>
                    </Box>
                </Grid>
            </Grid>

        </Grid>
    );
};

export default Home;
