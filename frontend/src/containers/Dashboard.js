import * as React from "react";
import {styled, createTheme, ThemeProvider} from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import MuiDrawer from "@mui/material/Drawer";
import Box from "@mui/material/Box";
import MuiAppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import List from "@mui/material/List";
import Typography from "@mui/material/Typography";
import Divider from "@mui/material/Divider";
import IconButton from "@mui/material/IconButton";

import Link from "@mui/material/Link";
import MenuIcon from "@mui/icons-material/Menu";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";

import MainListItems from "../components/MainListItem";
import {blue, grey} from "@mui/material/colors";
import AccountCircle from "@mui/icons-material/AccountCircle";
import MenuItem from "@mui/material/MenuItem";
import Menu from "@mui/material/Menu";
import logo from "../assets/images/logo.png";
import UserHistory from "../components/UserHistory";

import {useDispatch, useSelector} from "react-redux";
import {Route, Routes} from "react-router-dom";
import Home from "../components/Home";
import {logout} from "../actions/auth";
import Loading from "../utils/loading";
import {useEffect, useState} from "react";
import {red} from "@mui/material/colors";
import {useTranslation} from "react-i18next";
import {useNavigate} from "react-router-dom";
import Cards from "../components/project/Cards";
import Profile from "../components/Profile";
import "../assets/css/style1.css";
import "../assets/css/dashboard.css";
import {HiOutlineLogout} from "react-icons/hi";
import {FaUser} from "react-icons/fa";
import TaskCalendar from "../components/task/calendar/Calendar";
import Compare from "../components/indexCompare/Compare.js";
import Users from "../components/Users.js";
import NotificationsIcon from "@mui/icons-material/Notifications";
import Badge from "@mui/material/Badge";
import Notification from "./notifications/Notification.js";
import {
    getUserSensorHumidityNotifications,
    alterNotificationState,
    getUserSensorBatteryNotifications,
    getUserForcastNotifications, getUserPatternNotifications
} from "../actions/notification.js";
import WaterDropIcon from '@mui/icons-material/Opacity';
import ListItem from "@mui/material/ListItem";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import NotificationsNoneIcon from '@mui/icons-material/NotificationsNone';
import Sensor from "../components/sensors/Sensor"
import CalendarDashboard from "../components/task/calendar/CalendarDashboard"
import {Dialog, DialogTitle, DialogContent, DialogActions, Button} from '@mui/material';
import Battery50Icon from '@mui/icons-material/Battery50';
import Battery20Icon from '@mui/icons-material/Battery20';
import Language from "../utils/Language";
import TimelineIcon from '@mui/icons-material/Timeline';
import TaskReference from "../components/TaskReference/TaskReference";

function Copyright(props) {
    return (
        <footer>
            <Typography
                variant="body2"
                color="text.secondary"
                align="center"
                {...props}
            >
                {"Copyright © "}
                <Link color="inherit" href="https://robocare.tn" target="_blank">
                    Robocare
                </Link>{" "}
                {new Date().getFullYear()}
                {"."}
            </Typography>
        </footer>
    );
}


const drawerWidth = 240;

const AppBar = styled(MuiAppBar, {
    shouldForwardProp: (prop) => prop !== "open",
})(({theme, open}) => ({
    zIndex: theme.zIndex.drawer + 1,
    transition: theme.transitions.create(["width", "margin"], {
        easing: theme.transitions.easing.sharp,
        duration: theme.transitions.duration.leavingScreen,
    }),
    ...(open && {
        marginLeft: drawerWidth,
        width: `calc(100% - ${drawerWidth}px)`,
        transition: theme.transitions.create(["width", "margin"], {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.enteringScreen,
        }),
    }),
}));

const Drawer = styled(MuiDrawer, {
    shouldForwardProp: (prop) => prop !== "open",
})(({theme, open}) => ({
    "& .MuiDrawer-paper": {
        position: "relative",
        whiteSpace: "nowrap",
        width: drawerWidth,
        transition: theme.transitions.create("width", {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.enteringScreen,
        }),
        boxSizing: "border-box",
        ...(!open && {
            overflowX: "hidden",
            transition: theme.transitions.create("width", {
                easing: theme.transitions.easing.sharp,
                duration: theme.transitions.duration.leavingScreen,
            }),
            width: theme.spacing(7),
            [theme.breakpoints.up("sm")]: {
                width: theme.spacing(9),
            },
        }),
    },
}));

export default function Dashboard() {
    const navigate = useNavigate();
    const [open, setOpen] = useState(true);
    const [auth, setAuth] = useState(true);
    const [anchorEl, setAnchorEl] = useState(null);
    const [anchorEl2, setAnchorEl2] = useState(null);
    const dispatch = useDispatch();

    const user = useSelector((state) => state.auth.user);
    const notifications = useSelector(
        (state) => state.notificationReducer.notificationsHead
    );
    const [notificationCount, setnotificationCount] = useState(0);
    const [notificationsState, setnotificationsState] = useState(null);

    const [sensorBatteryAlertNotifications, setSensorBatteryAlertNotifications] = useState(null);
    const [showBatteryAlert, setShowBatteryAlert] = useState(true);
    const [Username, setUsername] = useState(null);

    const [sortedAlerts, setSortedAlerts] = useState({
        forecast: [],
        autoPattern: [],
        pattern: [],
        humidity: [],
        vegetation: []

    });
    const sortAlerts = (alerts) => {
        return alerts
            .flatMap(item => item.alerts.map(alert => ({...alert, task_name: item.task_name, task_id: item.task_id})))
            .filter(alert => !alert.viewed)
            .sort((a, b) => new Date(b.time) - new Date(a.time));
    };
    const sortVegetationAlerts = (alerts) => {
        if (!alerts || !Array.isArray(alerts)) {
            return [];
        }
        return alerts
            .flatMap(item => (item.alerts && Array.isArray(item.alerts))
                ? item.alerts.map(alert => ({...alert, task_name: item.task_name, task_id: item.id}))
                : []
            )
            .sort((a, b) => new Date(b.date) - new Date(a.date));
    };

    useEffect(() => {
        if (!user) return;

        const fetchAlerts = async () => {
            const forecastRes = await dispatch(getUserForcastNotifications(user.id, 0));
            const patternRes = await dispatch(getUserPatternNotifications(user.id, 0));
            const humidityRes = await dispatch(getUserSensorHumidityNotifications(user.id, 0));

            setSortedAlerts({
                forecast: sortAlerts(forecastRes.data.alerts),
                autoPattern: sortAlerts(patternRes.data.pattern_self_alerts),
                pattern: sortAlerts(patternRes.data.alerts),
                humidity: sortAlerts(humidityRes.data.alerts),

            });
            const totalCount =
                forecastRes.data.new_count +
                patternRes.data.new_count +
                patternRes.data.new_self_count +
                humidityRes.data.new_count


            setnotificationCount(totalCount);
        };

        fetchAlerts();
    }, [user, dispatch]);
    useEffect(() => {
        if (!user) return;
        const username = user.firstname + " " + user.lastname;
        setUsername(username);

        dispatch(getUserSensorBatteryNotifications(user.id, 0)).then((res) => {
            if (res.status == 200) {

                if (res.data.alert && !res.data.alert.details.viewed) {
                    setShowBatteryAlert(true)
                    setSensorBatteryAlertNotifications(res.data.alert)
                }

            }
        });
    }, [user]);

    // useEffect(() => {
    //   if (!humidityAlertNotifications) return;
    //   // setHumidityAlertNotificationsCount(humidityAlertNotifications.length);
    //   setnotificationCount(notificationCount + humidityAlertNotificationsCount);
    // }, [humidityAlertNotifications, notifications]);

    useEffect(() => {
        if (!notifications) return;
        setnotificationCount(notifications.alert_count);
        setnotificationsState(notifications.data);
    }, [notifications]);


    const {t} = useTranslation();


    const mediaQuery = window.matchMedia("(max-width: 600px)");

    useEffect(() => {
        setOpen(!mediaQuery.matches);
    }, []);


    const handleMenu = (event) => {
        setAnchorEl(event.currentTarget);
    };
    const handleMenuNotification = (event) => {
        setAnchorEl2(event.currentTarget);
    };

    const handleClose = () => {
        setAnchorEl(null);
    };
    const handleCloseNotification = () => {
        setAnchorEl2(null);
    };
    const toggleDrawer = () => {
        setOpen(!open);
    };
    const handleLogout = () => {
        dispatch(logout());
        handleClose();
    };
    const theme = createTheme({
        palette: {
            primary: {
                main: blue[700],
            },
            secondary: {
                light: "#ff7961",
                main: "#f44336",
                dark: "#ba000d",
                contrastText: "#000",
            },
            grey: {
                main: grey[700],
                contrastText: "#fff",
                dark: grey[800],
            },
            AppBarBackground: {
                main: "#ffffff",
            },
            IconColor: {
                main: "#6f9d2f",
                contrastText: "#fff",
            },
            ViewTask: {
                main: "#03a9f4",
                contrastText: "#fff",
            },
            DeleteTask: {
                main: red[500],
                contrastText: "#fff",
            },
            DownloadReport: {
                main: "#ff9800",
                contrastText: "#fff",
            },
        },
    });

    const handleNavigateToProfile = () => {
        setAnchorEl(null);
        navigate("/dashboard/profile");
    };


    const formatTime = (dateString) => {
        const time = new Date(dateString);
        // const year = date.getFullYear();
        // const month = String(date.getMonth() + 1).padStart(2, "0"); // Add 1 to the month and pad with leading zero
        // const day = String(date.getDate()).padStart(2, "0"); // Pad with leading zero

        // return `${year}-${month}-${day}`;
        const formattedTime = time.toLocaleString('en-CA', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            hour12: false,
            timeZone: 'UTC'
        }).replace(', ', ' at ')

        return formattedTime;
    };

    const redirectToTask = (task_id, alert_id) => {
        dispatch(alterNotificationState([alert_id], user.id))
        navigate(`/task/detail/${task_id}`);
    };

    const renderAlerts = (alerts, icon, emptyMessage, isVegetation = false) => (
        <List style={{borderBottom: '1px #909090 solid'}}>
            {alerts.length > 0 ? (
                alerts.map((alert, index) => (
                    <ListItem
                        disablePadding
                        key={index}
                        onClick={() => redirectToTask(alert.task_id, alert.id)}
                        style={{paddingBottom: "8px"}}
                    >
                        <ListItemButton>
                            <ListItemIcon>
                                {icon}
                            </ListItemIcon>
                            <ListItemText
                                primary={
                                    isVegetation ? (
                                        <>
                                            {parseFloat(alert.abs_difference) > 0.2 ? (
                                                <>
                                                    {t("Task")} <strong>{alert.task_name}</strong>{" "}
                                                    {t("experienced a notable difference in the vegetation on")}{" "}
                                                    <strong>{formatTime(alert.date)}</strong>. {t("Please investigate")}.
                                                </>
                                            ) : (
                                                <>
                                                    {t("An alert has been raised for task")}{" "}
                                                    <strong>{alert.task_name}</strong> {t("on")}{" "}
                                                    <strong>{formatTime(alert.date)}</strong>{" "}
                                                    {t("because the vegetation diverged from the predicted value")}.
                                                </>
                                            )}
                                        </>
                                    ) : (
                                        <>
                                        <span style={{color: "#909090", padding: "2px", borderRadius: "4px"}}>
                                            {t(alert.description)}
                                        </span>{" "}
                                            {t("detected for your plot")}{" "}
                                            <span style={{
                                                color: "#909090",
                                                padding: "2px",
                                                borderRadius: "4px",
                                                fontWeight: "bold"
                                            }}>
                                            {alert.task_name}
                                            </span> {t("on")}{" "}
                                            <span style={{color: "#909090", padding: "2px", borderRadius: "4px"}}>
                                                {formatTime(alert.time || alert.date)}
                                            </span>{" "}
                                            {alert.measured_value && (
                                                <>
                                                    {t("NDVI level")}: <span style={{
                                                    border: "1px #909090 solid",
                                                    color: "#909090",
                                                    padding: "0.3rem",
                                                    borderRadius: "4px"
                                                }}>
                                                {parseFloat(alert.measured_value)}
                                                </span>
                                                </>
                                            )}
                                        </>
                                    )
                                }
                            />
                        </ListItemButton>
                    </ListItem>
                ))
            ) : (
                <ListItem disablePadding>
                    <ListItemButton>
                        <ListItemIcon>
                            <NotificationsNoneIcon color="grey"/>
                        </ListItemIcon>
                        <ListItemText primary={t(emptyMessage)}/>
                    </ListItemButton>
                </ListItem>
            )}
        </List>
    );
    return (
        <ThemeProvider theme={theme}>
            <Loading/>
            <Box sx={{display: "flex"}}>
                <CssBaseline/>

                <Drawer
                    variant="permanent"
                    open={open}
                    className={open ? "drawer-open" : ""}
                >
                    <Toolbar
                        sx={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "flex-end",
                            px: [1],
                        }}
                    >
                        <IconButton onClick={toggleDrawer}>
                            <ChevronLeftIcon/>
                        </IconButton>
                    </Toolbar>
                    <Divider/>
                    <List component="nav" color="AppBarBackground">
                        <MainListItems/>
                        <Divider sx={{my: 1}}/>
                        {/* {secondaryListItems} */}
                    </List>
                </Drawer>

                {showBatteryAlert && sensorBatteryAlertNotifications &&
                    <Dialog open={showBatteryAlert}>
                        <DialogTitle>
                            {sensorBatteryAlertNotifications.details.is_critical ?
                                <Battery20Icon sx={{fontSize: 30, color: 'error.main', display: "inline"}}/> :
                                <Battery50Icon sx={{fontSize: 40, color: 'error.main', display: "inline"}}/>
                            }

                            {t(sensorBatteryAlertNotifications.details.is_critical ? "Critical Battery Level" : "Low Battery Level")}</DialogTitle>
                        <DialogContent>
                            <Typography
                                variant="body2"><b>{Math.round(sensorBatteryAlertNotifications.details.level)}%</b> {t("battery remaining")}
                            </Typography>
                            <Typography
                                variant="body2">Sensor: <b>{sensorBatteryAlertNotifications.sensor_name}</b></Typography>
                            <Typography
                                variant="body2">Field: <b>{sensorBatteryAlertNotifications.task_name}</b></Typography>
                        </DialogContent>
                        <DialogActions>
                            <Button
                                className="btn btn-login"
                                style={{
                                    backgroundColor: "#6f9d2f",
                                    border: "#6f9d2f",
                                    color: "#ffffff",

                                }}
                                onClick={() => setShowBatteryAlert(false)}
                            >
                                {t("Confirm")}
                            </Button>
                        </DialogActions>
                    </Dialog>
                }


                <Box
                    component="main"
                    sx={{
                        backgroundColor: (theme) =>
                            theme.palette.mode === "light"
                                ? theme.palette.grey[100]
                                : theme.palette.grey[900],
                        flexGrow: 1,
                        minHeight: "100vh",
                        // overflow: 'auto',
                    }}
                >

                    {/* {sensorBatteryAlertNotifications && showBatteryAlert && ( */}

                    <AppBar
                        position="fixed"
                        open={open}
                        color={"AppBarBackground"}
                        className={open ? "header-open" : ""}
                    >
                        <Toolbar
                            sx={{
                                pr: "24px", // keep right padding when drawer closed
                            }}
                        >
                            <IconButton
                                edge="start"
                                color="IconColor"
                                aria-label="open drawer"
                                onClick={toggleDrawer}
                                sx={{
                                    marginRight: "36px",
                                    ...(open && {display: "none"}),
                                }}
                            >
                                <MenuIcon/>
                            </IconButton>
                            <Typography
                                component="h1"
                                variant="h6"
                                color="inherit"
                                noWrap
                                sx={{flexGrow: 1}}
                            >
                                <img src={logo} className="dashboard-logo" style={{}}/>
                            </Typography>
                            <div className="language-select">
                                <div
                                    className="d-flex justify-content-end align-items-center language-select-root"></div>
                                <Language color="#6f9d2f"/>
                            </div>
                            <div style={{paddingRight: "1.5%"}}>
                                <IconButton
                                    size="large"
                                    aria-label="show new notifications"
                                    color="inherit"
                                    aria-controls="menu-appbar-notification"
                                    aria-haspopup="true"
                                    onClick={handleMenuNotification}
                                >
                                    <Badge badgeContent={notificationCount} color="error">
                                        <NotificationsIcon color="IconColor"/>
                                    </Badge>
                                </IconButton>
                                <Menu
                                    style={{top: "60px"}}
                                    id="menu-appbar-notification"
                                    anchorEl={anchorEl2}
                                    anchorOrigin={{
                                        vertical: "top",
                                        horizontal: "right",
                                    }}
                                    keepMounted
                                    transformOrigin={{
                                        vertical: "top",
                                        horizontal: "right",
                                    }}
                                    open={Boolean(anchorEl2)}
                                    onClose={handleCloseNotification}
                                >

                                    {renderAlerts(sortedAlerts.forecast, <TimelineIcon
                                        color="primary"/>,     t("No notifications for forecast at the moment."))}

                                    {renderAlerts(sortedAlerts.autoPattern, <TimelineIcon
                                        color="primary"/>,  t("No notifications for auto pattern at the moment."))}

                                    {renderAlerts(sortedAlerts.pattern, <TimelineIcon
                                        color="primary"/>,  t("No notifications for pattern at the moment."))}

                                    {renderAlerts(sortedAlerts.humidity, <WaterDropIcon
                                        color="primary"/>,  t("No notifications for soil humidity levels at the moment."))}

                                </Menu>
                            </div>

                            {auth && (
                                <div
                                    className="m-account"
                                    style={{display: "flex", alignItems: "center"}}
                                    sx={{marginLeft: 2}}
                                >
                                    <span className="d-none d-md-block ">{Username}</span>
                                    <IconButton
                                        size="large"
                                        aria-label="account of current user"
                                        aria-controls="menu-appbar"
                                        aria-haspopup="true"
                                        onClick={handleMenu}
                                        color="IconColor"
                                    >
                                        <AccountCircle/>
                                    </IconButton>

                                    <Menu
                                        style={{top: "60px"}}
                                        id="menu-appbar"
                                        anchorEl={anchorEl}
                                        anchorOrigin={{
                                            vertical: "top",
                                            horizontal: "right",
                                        }}
                                        keepMounted
                                        transformOrigin={{
                                            vertical: "top",
                                            horizontal: "right",
                                        }}
                                        open={Boolean(anchorEl)}
                                        onClose={handleClose}
                                    >
                                        {/* <MenuItem onClick={handleClose}>Profile</MenuItem>
                                    <MenuItem onClick={handleClose}>My account</MenuItem> */}
                                        <MenuItem
                                            className="text-center"
                                            onClick={handleNavigateToProfile}
                                        >
                                            <FaUser style={{marginRight: "5px", width: "20px"}}/>{" "}
                                            {t("Profile")}
                                        </MenuItem>
                                        <MenuItem onClick={handleLogout}>
                                            {" "}
                                            <HiOutlineLogout
                                                style={{marginRight: "5px", width: "20px"}}
                                            />
                                            {t("Logout")}
                                        </MenuItem>
                                    </Menu>
                                </div>
                            )}
                        </Toolbar>
                    </AppBar>
                    {/* <Toolbar /> */}
                    <Box sx={{flexGrow: 1}} className="home-background">
                        {/* <Container
              maxWidth="xl"
              sx={{ display: "flex", flexDirection: "column" }}
            > */}
                        <Routes>
                            <Route path="/" element={<Home/>}/>
                            <Route
                                path="/task/events/:id_task"
                                element={<TaskCalendar/>}
                            />
                            <Route path="/projects/list" element={<Cards/>}/>
                            <Route path="/profile" element={<Profile/>}/>
                            <Route path="/compare/index" element={<Compare/>}/>
                            <Route path="/user/:id_user" element={<UserHistory/>}/>
                            <Route path="/users" element={<Users/>}/>
                            <Route path="/notifications" element={<Notification/>}/>
                            <Route path="/sensor" element={<Sensor/>}/>
                            <Route path="/calendar" element={<CalendarDashboard/>}/>
                            <Route path="/compare/reference" element={<TaskReference/>}/>

                            {/* <Route path="/signup" element={<Signup />} /> */}
                        </Routes>
                        <Copyright sx={{pt: 4, flexShrink: 0}} className="footer"/>
                        {/* </Container> */}
                    </Box>
                </Box>
            </Box>
        </ThemeProvider>
    );
}
