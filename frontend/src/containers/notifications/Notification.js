import React, {useState, useEffect} from "react";
import Grid from "@mui/material/Grid";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import Paper from "@mui/material/Paper";
import {styled} from "@mui/material/styles";
import {useDispatch, useSelector} from "react-redux";
import {
    get_user_notifications,
    getUserForcastNotifications,
    getUserPatternNotifications,
    getUserSensorHumidityNotifications,
    alterNotificationState
} from "../../actions/notification.js";
import loadingImg from "../../assets/images/loading_small.svg";
import Typography from "@mui/material/Typography";
import ReportProblemIcon from "@mui/icons-material/ReportProblem";
import {useNavigate} from "react-router-dom";
import WaterDropIcon from '@mui/icons-material/Opacity';
import TimelineIcon from '@mui/icons-material/Timeline';
import AutoGraphIcon from '@mui/icons-material/AutoGraph';
import AirIcon from '@mui/icons-material/Air';
import {useTranslation} from "react-i18next";

const Notification = () => {
    const {t} = useTranslation();
    const user = useSelector((state) => state.auth.user);
    const userId = user?.id;

    const [loading, setLoading] = useState(true);
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const [notificationBlocks, setNotificationBlocks] = useState({
        forecast: [],
        autoPattern: [],
        pattern: [],
        humidity: []
    });

    const Item = styled(Paper)(({theme}) => ({
        backgroundColor: theme.palette.mode === "dark" ? "#1A2027" : "#fff",
        ...theme.typography.body2,
        color: theme.palette.text.secondary,
        overflowY: "auto",
        marginBottom: "20px",
        maxHeight: "300px"
    }));

    useEffect(() => {
        if (!user || !userId) return;

        const fetchAlerts = async () => {
            const humidityRes = await dispatch(getUserSensorHumidityNotifications(userId, 0));
            const forecastRes = await dispatch(getUserForcastNotifications(userId, 0));
            const patternRes = await dispatch(getUserPatternNotifications(userId, 0));

            setNotificationBlocks({
                forecast: sortAlertsByDate(flattenAlerts(forecastRes.data?.alerts || [])),
                autoPattern: sortAlertsByDate(flattenAlerts(patternRes.data?.pattern_self_alerts || [])),
                pattern: sortAlertsByDate(flattenAlerts(patternRes.data?.alerts || [])),
                humidity: sortAlertsByDate(flattenAlerts(humidityRes.data?.alerts || []))
            });

            setLoading(false);
        };

        fetchAlerts();
    }, [user, userId, dispatch]);

    const flattenAlerts = (alerts) => {
        return alerts.flatMap(item =>
            item.alerts.map(alert => ({
                ...alert,
                task_name: item.task_name,
                task_id: item.task_id || item.id
            }))
        );
    };

    const sortAlertsByDate = (alerts) => {
        return alerts.sort((a, b) => new Date(b.time || b.date) - new Date(a.time || a.date));
    };

    const redirectToTask = (task_id, alert_id) => {
        if (!userId) return;
        dispatch(alterNotificationState([alert_id], userId))
        navigate(`/task/detail/${task_id}`);
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleString('en-CA', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            hour12: false,
            timeZone: 'UTC'
        }).replace(', ', ' at ');
    };

    const renderAlertContent = (alert, type) => {
        if (type === 'vegetation') {
            return parseFloat(alert.abs_difference) > 0.2 ? (
                <>
                    Task <strong>{alert.task_name}</strong> {t("experienced a notable difference in the vegetation on")}{" "}
                    <strong>{formatDate(alert.date)}</strong>. {t("Please investigate")}.
                </>
            ) : (
                <>
                    {t("An alert has been raised for task")} <strong>{alert.task_name}</strong> on{" "}
                    <strong>{formatDate(alert.date)}</strong> {t("because the vegetation diverged from the predicted value")}.
                </>
            );
        } else {
            return (
                <>
                    <span style={{
                        color: "#909090",
                        padding: "2px",
                        borderRadius: "4px"
                    }}>{alert.description}</span> {t("detected for your plot")}{" "}
                    <span style={{
                        color: "#000000",
                        padding: "2px",
                        borderRadius: "4px",
                        fontWeight: "bold",
                    }}>{alert.task_name}</span> {t("on")}{" "}
                    <span style={{color: "#000000", padding: "2px", borderRadius: "4px", fontWeight: "bold"}}>
                    {formatDate(alert.time || alert.date)}
                    </span>{" "}
                    {t("level")} {type === 'humidity' ? 'Humidity' : 'NDVI'} : <span style={{
                    border: "1px #909090 solid",
                    color: "#909090",
                    padding: "0.3rem",
                    borderRadius: "4px"
                }}>{parseFloat(alert.measured_value)}</span>
                </>
            );
        }
    };

    const renderNotificationBlock = (title, alerts, icon) => (
        <>
            <Typography variant="h6" gutterBottom>
                {title} Alert Notifications
            </Typography>
            <Item>
                <List style={{borderBottom: '1px #909090 solid'}}>
                    {alerts.length > 0 ? alerts.map((alert, index) => (
                        <ListItem
                            disablePadding
                            key={index}
                            onClick={() => redirectToTask(alert.task_id, alert.id)}
                            style={{paddingBottom: "8px"}}
                        >
                            <ListItemButton>
                                <ListItemIcon>
                                    {React.createElement(icon, {
                                        color: alert.viewed ? "grey" : "primary",
                                        style: {opacity: alert.viewed ? ".5" : "1"}
                                    })}
                                </ListItemIcon>
                                <ListItemText
                                    style={{opacity: alert.viewed ? ".5" : "1"}}
                                    primary={renderAlertContent(alert, title.toLowerCase())}
                                />
                            </ListItemButton>
                        </ListItem>
                    )) : (
                        <Grid item xs={12} sx={{display: "flex", justifyContent: "center", p: 5}}>
                            <Typography variant="body2" gutterBottom>
                                {t("No")} {title.toLowerCase()} {t("notifications at the moment")}.
                            </Typography>
                        </Grid>
                    )}
                </List>
            </Item>
        </>
    );

    return (
        <Grid container spacing={2} sx={{p: 2, flex: 1}}>
            <Grid item xs={12}>
                <div className="intro-text">
                    <h2>Notifications</h2>
                </div>
            </Grid>
            <Grid item xs={12}>
                {loading ? (
                    <Item sx={{display: "flex", justifyContent: "center", alignItems: "center", height: "10vh"}}>
                        <img src={loadingImg} alt="Loading"/>
                    </Item>
                ) : (
                    <>
                        {renderNotificationBlock(t("Forecast"), notificationBlocks.forecast, TimelineIcon)}
                        {renderNotificationBlock(t("Auto Pattern"), notificationBlocks.autoPattern, TimelineIcon)}
                        {userId !== 154 && renderNotificationBlock(t("Pattern"), notificationBlocks.pattern, TimelineIcon)}
                        {renderNotificationBlock(t("Humidity"), notificationBlocks.humidity, WaterDropIcon)}
                    </>
                )}
            </Grid>
        </Grid>
    );
};

export default Notification;
