import React, {useState, useEffect, useRef} from "react";
import {useDispatch, useSelector} from "react-redux";
import {
    Disease_List,
    Update_Task_Event,
    Delete_Event,
    Products_type_List,
    Products_by_type,
    Fertilisation_products,
    Add_Tasks_Events,
    Task_User_Events,
    Stade_phenologiques,
    Delete_File_visit_field,
    Visit_Field_Download_File,
    DeleteMultipleEvents,
    Delete_File_anomaly,
    Anomaly_Download_File,
    Anomaly_type,


}
    from "../../../actions/calendar.js";
import FullCalendar from '@fullcalendar/react'
import dayGridPlugin from '@fullcalendar/daygrid'
import timeGridPlugin from '@fullcalendar/timegrid'
import interactionPlugin from '@fullcalendar/interaction'
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import TextField from '@mui/material/TextField';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import Form from "react-bootstrap/Form";
import {Chip, Container, FormControl, Stack, Drawer, Input, FormControlLabel, Checkbox} from "@mui/material";
import InputLabel from '@mui/material/InputLabel';
import dayjs from 'dayjs';
import "../../../assets/scss/calendar.scss";
import CustomButton from '../../CustomButton';
import {MdOutlineCancel} from 'react-icons/md';
import {MdDeleteOutline} from 'react-icons/md';
import {useTranslation} from 'react-i18next';
import BasicDateTimePicker from "../../../utils/BasicDateTimePicker.js";
import {Col, Row} from "react-bootstrap";
import {DiseaseActor_List} from "../../../actions/calendar.js";
import {List_Projects_Tasks} from "../../../actions/calendar.js";
import CancelIcon from "@mui/icons-material/Cancel";
import CheckIcon from "@mui/icons-material/Check";
import ListSubheader from '@mui/material/ListSubheader';
import LoadingButton from "@mui/lab/LoadingButton";
import EditIcon from "@mui/icons-material/Edit";
import AddIcon from "@mui/icons-material/Add";
import {showSnackbar} from "../../../actions/snackbar";
import Button from "@mui/material/Button";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import FileIcon from "../../../utils/FileIcon";
import IconButton from "@mui/material/IconButton";
import CloudDownloadIcon from "@mui/icons-material/CloudDownload";
import DeleteIcon from "@mui/icons-material/Delete";
import Tooltip from "@mui/material/Tooltip";
import frLocale from "@fullcalendar/core/locales/fr";
import arLocale from "@fullcalendar/core/locales/ar";
import Backdrop from "@mui/material/Backdrop";
import Box from "@mui/material/Box";
import CloseIcon from '@mui/icons-material/Close';
import { AudioRecorder } from "react-audio-voice-recorder";
import CameraAltIcon from "@mui/icons-material/CameraAlt";

import Camera from "react-html5-camera-photo";
import "react-html5-camera-photo/build/css/index.css";

import Typography from '@mui/material/Typography';
import multiMonthPlugin from '@fullcalendar/multimonth'

const CalendarDashboard = () => {
    const {i18n} = useTranslation();
    const isMobile = window.matchMedia("(max-width: 768px)").matches;
    const {t} = useTranslation();
    const dispatch = useDispatch();
    const locales = [frLocale, arLocale];
    const user = useSelector((state) => state.auth.user);
    const btnSX = {
        backgroundColor: "#ffffff",
        color: "#6f9d2f",
        paddingTop: "5px",
        paddingBottom: "5px",
        paddingRight: "20px",
        paddingLeft: "20px",
        borderRadius: "4px",
        border: "1px solid #6f9d2f",
        textTransform: "uppercase",
        transition: "background-color 0.3s, color 0.3s",
        display: "inline-flex",
        alignItems: "center",

        "&:hover": {
            backgroundColor: "#6f9d2f",
            color: "#ffffff",
        },

        "& .MuiButton-label": {
            color: "#6f9d2f",
            "&:hover": {
                color: "#ffffff",
            },
        },

        "& .MuiLoadingButton-loadingIndicator": {
            left: "16px",
        },

        "& .MuiButton-startIcon": {
            marginRight: "6px",
        },
    };
    const [task, setTask] = useState({});
    const [event, setEvent] = useState({});
    const [events, setEvents] = useState([]);
    const [diseases, setDiseases] = useState([]);
    const [diseaseActors, setdiseaseActors] = useState([])
    const [diseaseActLabel, setdiseaseActLabel] = useState(null)
    const [typeProducts, settypeProducts] = useState([])
    const [fertilisationProducts, setfertilisationProducts] = useState([])
    const [products, setProducts] = useState([]);
    const [periodFormated, setPeriodFormated] = useState("");
    const [duration, setduration] = useState(null)
    const [selectedEvent, setselectedEvent] = useState('50')
    const [listTasks, setlistTasks] = useState([])
    const [listSelectedTasks, setListSelectedTasks] = useState([])
    const [stadePhenologiques, setstadePhenologiques] = useState([])
    const [calendarEvents, setCalendarEvents] = useState([]);
    const [isEditing, setIsEditing] = useState(false);
    const [loadingbtn, setLoadingbtn] = useState(false);
    const [fileToDelete, setFileToDelete] = useState(null);
    const [note, setNote] = useState('')
    const [files, setFiles] = useState([]);
    const [openDeleteConfirmDialog, setOpenDeleteConfirmDialog] = useState(false);
    const MAX_FILES = 10;
    const MAX_FILE_SIZE = 4 * 1024 * 1024;
    const [selectedEvents, setSelectedEvents] = useState([]);
    const [allMonthEventsSelected, setAllMonthEventsSelected] = useState(false);
    const calendarRef = useRef(null);
    const [openDrawer, setOpenDrawer] = useState(false);
    const [showCamera, setShowCamera] = useState(false);

    const [repeat, setRepeat] = useState(false);
    const [frequency, setFrequency] = useState(0);
    const [repeatDateOpen, setRepeatDateOpen] = useState(new Date());
    const [repeatDateClose, setRepeatDateClose] = useState(new Date());
    const [isDone, setIsDone] = useState(true);
    const [currentView, setCurrentView] = useState('dayGridMonth');
    const [anomalyType, setAnomalyType] = useState([]);

    const types = {
        10: t('Fertilization'),
        20: t('Phytosanitary treatments'),
        30: t('Agricultural practices'),
        40: t('Harvest'),
        50: t('Irrigation'),
        60: t('Visit field'),
        70: t("Problem"),

    };
    const typesOrder = {
        10: 2,
        20: 3,
        30: 4,
        40: 5,
        50: 1,
        60: 6,
        70: 7,

    };
    const colors = {
        10: 'warning',
        20: 'error',
        30: 'grey',
        40: 'success',
        50: 'primary',
        60: 'info',
        70: "error",

    };
    const diseaseActorLabel = {
        "Insects and pests": t('Insects'),
        "Fungal and bacterial diseases": t('Fungi'),
        "Viral and viral diseases": t('Viruses and viroids'),
        "Nematodes": t('Nematodes'),
        "Weeds": t('Weeds'),
        "Rodents": t('Rodents')
    };
    const dates = {
        10: {start: t("Fertilization start time"), end: t("Fertilization end time")},
        20: {start: t("Start time of Phytosanitary treatments"), end: t("End time of Phytosanitary treatments")},
        30: {start: t("Start time of Cultivation Practices"), end: t("End time of Cultivation Practices")},
        40: {start: t("Harvest start time"), end: t("Harvest end time")},
        50: {start: t("Valve opening time"), end: t("Valve closing time")},
        60: {start: t("Visit start time"), end: t("Visit end time")},
        70: {start: t("Problem start time"), end: t("Problem end time")},

    };

    useEffect(() => {
        if (openDrawer) {
            setRepeatDateClose(event.close_hour);
            setRepeatDateOpen(event.open_hour);
        }
    }, [openDrawer]);

    useEffect(() => {
        if (!user) return;
        dispatch(Task_User_Events(user.id)).then((res) => {
            setEvents(res);
            handleEvents(res);
        });

        dispatch(Disease_List()).then((res) => {
            setDiseases(res);
        });
        dispatch(Products_type_List()).then((res) => {
            settypeProducts(res);
        });
        dispatch(Fertilisation_products()).then((res) => {
            setfertilisationProducts(res);
        });
        dispatch(Stade_phenologiques()).then((res) => {
            setstadePhenologiques(res);
        });
        dispatch(List_Projects_Tasks(user.id)).then((res) => {
            setlistTasks(res)
        })
        dispatch(Anomaly_type()).then((res) => {
            setAnomalyType(res);
        });
    }, [user]);

    function handleDiseaseChange(e) {
        const selected = e.target.value
        const selectedDisease = diseases.find(disease => disease.id === selected);
        const diseaseName = selectedDisease.name
        setEvent({...event, disease: selected});
        const actorLabel = diseaseActorLabel[diseaseName]
        setdiseaseActLabel(actorLabel)
        dispatch(DiseaseActor_List(selected)).then((res) => {
            setdiseaseActors(res);
        })
    }

    function handleDiseaseActorChange(e) {
        const selected = e.target.value
        setEvent({...event, disease_actor: selected});
    }

    function handleFertilisationProductChange(e) {
        const selected = e.target.value
        setEvent({...event, fertilisationproduct: selected});
    }

    function handleProductTypeChange(e) {
        const selected = e.target.value
        setEvent({...event, producttype: selected});
        dispatch(Products_by_type(selected)).then((res) => {
            setProducts(res);
        })
    }

    function handleProductChange(e) {
        const product_id = e.target.value
        setEvent({...event, product: product_id});
    }

    const handleEventSelect = (eventId) => {
        setSelectedEvents(prev => {
            const newSelection = prev.includes(eventId)
                ? prev.filter(id => id !== eventId)
                : [...prev, eventId];
            const currentDate = new Date();
            const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
            const lastDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
            const eventsInMonth = events.filter(event => {
                const eventDate = new Date(event.open_hour);
                return eventDate >= firstDayOfMonth && eventDate <= lastDayOfMonth;
            });
            const allSelected = eventsInMonth.every(event => newSelection.includes(event.id));
            setAllMonthEventsSelected(allSelected);

            return newSelection;
        });
    };

    const handleDeleteSelected = async () => {
        try {
            await dispatch(DeleteMultipleEvents(selectedEvents));
            const updatedEvents = events.filter(event => !selectedEvents.includes(event.id));
            setEvents(updatedEvents);
            handleEvents(updatedEvents);
            setSelectedEvents([]);
            setAllMonthEventsSelected(false);
            dispatch(showSnackbar("success", undefined, "Selected events deleted successfully", "top", "right"));
        } catch (error) {
            dispatch(showSnackbar("error", undefined, "Error deleting events", "top", "right"));
        }
    };
    const handleCloseDrawer = () => {
        setOpenDrawer(false);
        setFrequency(0);
        setRepeat(false);
        setselectedEvent("50");
        setFiles([]);
        setNote("");
        setIsEditing(false);
        setduration(null);
        setPeriodFormated("");
        setListSelectedTasks([])
        setShowCamera(false);

    };
    const handleOnChange = (event) => {
        const isChecked = event.target.checked;
        setRepeat(isChecked);
    }
    const onFrequencyChange = e => {
        setFrequency(e.target.value);
    }

    function onRepeatDateCloseChange(e) {
        const date = new Date(e.target.value.$d);
        setRepeatDateClose(date);
    }

    function onDateOpenChange(e) {
        const date = new Date(e.target.value.$d);
        setEvent(prevEvent => {
            let updatedEvent = {...prevEvent};
            updatedEvent.open_hour = date;
            if (updatedEvent.type === "50") {
                const startDate = new Date(updatedEvent.open_hour);
                const endDate = new Date(updatedEvent.close_hour);
                const diffTime = Math.abs(endDate - startDate);
                const diffMinutes = Math.ceil(diffTime / (1000 * 60));
                const duration = formatDuration(diffMinutes)
                setduration(diffMinutes);
                setPeriodFormated(duration);
            }
            return updatedEvent;
        });
    }

    function onDateCloseChange(e) {
        const date = new Date(e.target.value.$d);
        setEvent(prevEvent => {
            let updatedEvent = {...prevEvent};
            updatedEvent.close_hour = date;
            if (updatedEvent.type === "50") {
                const startDate = new Date(updatedEvent.open_hour);
                const endDate = new Date(updatedEvent.close_hour);
                const diffTime = Math.abs(endDate - startDate);
                const diffMinutes = Math.ceil(diffTime / (1000 * 60));
                const duration = formatDuration(diffMinutes)
                setduration(diffMinutes);
                setPeriodFormated(duration);
            }
            return updatedEvent;
        });
    }

    function handleDateSelect(selectInfo) {
        let copy = {};
        copy.open_hour = selectInfo.start;
        copy.close_hour = selectInfo.end;
        const startDate = new Date(selectInfo.start);
        const endDate = new Date(selectInfo.end);
        const diffTime = Math.abs(endDate - startDate);
        const diffMinutes = Math.ceil(diffTime / (1000 * 60));
        const duration = formatDuration(diffMinutes)
        setduration(diffMinutes);
        setPeriodFormated(duration);
        copy.type = '50'
        setEvent(copy)
        setOpenDrawer(true);
        setIsDone(true);

    }

    const fileToBase64 = (file) => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = () => resolve(reader.result.split(',')[1]);
            reader.onerror = (error) => reject(error);
        });
    };
    const handleFileChange = (e) => {
        const newSelectedFiles = Array.from(e.target.files);
        const allowedExtensions = ['jpg', 'jpeg', 'png', 'gif', 'pdf', 'doc', 'docx', 'txt',
            'xls', 'xlsx', 'csv', 'ppt', 'pptx', 'zip', 'rar'];

        if (files.length + newSelectedFiles.length > MAX_FILES) {
            showError(dispatch, t(`You can upload a maximum of ${MAX_FILES} files.`));
            return;
        }

        const validNewFiles = newSelectedFiles.filter(file => {
            const fileExtension = file.name.split('.').pop().toLowerCase();
            const isValidExtension = allowedExtensions.includes(fileExtension);
            const isValidSize = file.size <= MAX_FILE_SIZE;
            const isDuplicate = files.some(existingFile => existingFile.name === file.name);

            if (!isValidExtension) {
                showError(dispatch, `Invalid file type: ${file.name}`);
            } else if (!isValidSize) {
                showError(dispatch, `File too large (max 4MB): ${file.name}`);
            } else if (isDuplicate) {
                showError(dispatch, `File already uploaded: ${file.name}`);
            }

            return isValidExtension && isValidSize && !isDuplicate;
        });

        setFiles(prevFiles => [...prevFiles, ...validNewFiles].slice(0, MAX_FILES));
    };

    const handleFileDownload = (fileId) => {
        if (fileId) {
            if (event.type == 60) {
                dispatch(Visit_Field_Download_File(fileId));
            } else if (event.type == 70) {
                dispatch(Anomaly_Download_File(fileId));
            }
        } else {
            dispatch(
                showSnackbar(
                    "error",
                    undefined,
                    "Unable to download this file. Please submit your form first.",
                    "top",
                    "right"
                )
            );
        }
    };

    const handleFileDelete = (fileIdentifier) => {
        setFileToDelete(fileIdentifier);
        setOpenDeleteConfirmDialog(true);
    };
    const confirmFileDeletion = () => {
        if (fileToDelete) {
            let deleteAction;
            let updatedFiles;

            if (event.type == 60) {
                if (files.find((file) => file.id === fileToDelete)) {
                    deleteAction = Delete_File_visit_field(fileToDelete);
                } else {
                    updatedFiles = files.filter((file) => file.name !== fileToDelete);
                    setFiles(updatedFiles);
                    return;
                }
            } else if (event.type == 70) {
                if (files.find((file) => file.id === fileToDelete)) {
                    deleteAction = Delete_File_anomaly(fileToDelete);
                } else {
                    updatedFiles = files.filter((file) => file.name !== fileToDelete);
                    setFiles(updatedFiles);
                    return;
                }
            }

            dispatch(deleteAction)
                .then((res) => {
                    let updatedEvents = events.map((evt) => {
                        if (evt.id == event.id) {
                            if (event.type == 60) {
                                return {
                                    ...evt,
                                    field_visit: {
                                        ...evt.field_visit,
                                        files: evt.field_visit.files.filter((file) => file.id !== fileToDelete),
                                    },
                                };
                            } else if (event.type == 70) {
                                return {
                                    ...evt,
                                    anomaly: {
                                        ...evt.anomaly,
                                        files: evt.anomaly.files.filter((file) => file.id !== fileToDelete),
                                    },
                                };
                            }
                        }
                        return evt;
                    });

                    setEvents(updatedEvents);
                    handleEvents(updatedEvents);
                    dispatch(
                        showSnackbar(
                            "success",
                            undefined,
                            "File deleted successfully",
                            "top",
                            "right"
                        )
                    );
                })
                .catch((error) => {
                    dispatch(
                        showSnackbar(
                            "error",
                            undefined,
                            "Failed to delete file. Please try again.",
                            "top",
                            "right"
                        )
                    );
                });
        }
        setOpenDeleteConfirmDialog(false);
        setFileToDelete(null);
    };

    function handleVisits(e) {
        const {value} = e.target;
        setNote(value);
    }


    const handleChangeTaskSelect = (e) => {
        const val = e.target.value;
        setListSelectedTasks(val);
        setEvent(prevEvent => ({
            ...prevEvent,
            tasks: val
        }));
    }

    function handleEventChange(selectInfo) {
        const currentElement = events.filter((event) => event.id == selectInfo.event.id)[0];
        currentElement.open_hour = selectInfo.event.start;
        currentElement.close_hour = selectInfo.event.end;
        setEvent(currentElement);
        setOpenDrawer(true)

    }

    function handleEventClick(clickInfo) {
        const currentElement = events.filter((event) => event.id == clickInfo.event.id)[0];
        setIsDone(currentElement.isDone !== undefined ? currentElement.isDone : true);

        if (currentElement.type == 60) {
            setNote(currentElement.field_visit.notes || '');
            if (currentElement.field_visit && currentElement.field_visit.files) {
                const transformedFiles = currentElement.field_visit.files
                    .filter(fileObj => fileObj && fileObj.file)
                    .map(fileObj => ({
                        id: fileObj.id,
                        name: fileObj.file.split('/').pop(),
                        path: fileObj.file
                    }));
                setFiles(transformedFiles);
            } else {
                setFiles([]);
            }
        }
        if (currentElement.type == 70) {
            setNote(currentElement.anomaly.notes || "");
            if (currentElement.anomaly && currentElement.anomaly.files) {
                const transformedFiles = currentElement.anomaly.files
                    .filter((fileObj) => fileObj && fileObj.file)
                    .map((fileObj) => ({
                        id: fileObj.id,
                        name: fileObj.file.split("/").pop(),
                        path: fileObj.file,
                    }));
                setFiles(transformedFiles);
            } else {
                setFiles([]);
            }
        }

        setEvent(currentElement);
        setOpenDrawer(true);
        setIsEditing(true);

        setselectedEvent(currentElement.type);
        const duration = formatDuration(currentElement.duration);
        setPeriodFormated(duration);

        if (currentElement.tasks && currentElement.tasks.length > 0) {
            setListSelectedTasks(currentElement.tasks.map(task => task.id));
        } else if (currentElement.task && currentElement.task.id) {
            setListSelectedTasks([currentElement.task.id]);
        } else {
            setListSelectedTasks([]);
        }

        if (currentElement["type"] === "20") {
            const selectedDisease = diseases.find(disease => disease.id === currentElement["disease"]);
            const diseaseName = selectedDisease.name
            const actorLabel = diseaseActorLabel[diseaseName]
            setdiseaseActLabel(actorLabel)
            dispatch(DiseaseActor_List(currentElement["disease"])).then((res) => {
                setdiseaseActors(res);
            })
            dispatch(Products_by_type(currentElement["producttype"])).then((res) => {
                setProducts(res);
            })
        }
    }

    function handleEvents(array) {
        let currentEvents = [];

        array.forEach(event => {
            let element = {
                id: event.id,
                start: event.open_hour,
                end: event.close_hour,
                title: (event.task && event.task.task_name) ? `${event.task.task_name} - ${types[event.type]}` : types[event.type],
                groupId: event.type,
                fertilisationproduct_name: event.fertilisationproduct_name,
                producttype_name: event.producttype_name,
                mode: event.mode,
                dose: event.dose,
                unit: event.unit,
                stade_name: event.stade_name,
                passes_count: event.passes_count,
                product_name: event.product_name,
                disease_name: event.disease_name,
                diseaseActor_name: event.diseaseActor_name,
                size: event.size,
                quantity: event.quantity,
                duration: formatDuration(event.duration),
                isDone: event.isDone,

            }
            if (event.type == 60) {
                element.note = event.field_visit ? event.field_visit.notes : "";
                element.files = event.field_visit && event.field_visit.files ? event.field_visit.files : [];
            }
            if (event.type == 70) {
                element.note = event.anomaly ? event.anomaly.notes : "";
                element.files = event.anomaly && event.anomaly.files ? event.anomaly.files : [];
                element.anomaly_type_name = event.anomaly ? event.anomaly.anomaly_type.name : "";

            }
            currentEvents.push(element);
        });
        setCalendarEvents(currentEvents);
    }
    function handleAnomalyTypeChange(e) {
        const selectedAnomalyTypeId = e.target.value;
        const selectedAnomalyType = anomalyType.find(type => type.id === selectedAnomalyTypeId);

        setEvent(prevEvent => ({
            ...prevEvent,
            anomaly: {
                ...prevEvent.anomaly,
                anomaly_type: {
                    id: selectedAnomalyTypeId,
                    name: selectedAnomalyType?.anomaly_type || "",
                },
            },
        }));
    }

    function renderEventContent(eventInfo) {
        const {event} = eventInfo;
        const color = colors[event.groupId];
        const titleMap = {
            '10': `${event.title.split(' - ')[0]} - ${parseFloat(event.extendedProps.dose).toFixed(2)} ${event.extendedProps.unit.substring(0, 2)} ${event.extendedProps.fertilisationproduct_name}`,
            '20': `${event.title.split(' - ')[0]} - ${event.extendedProps.producttype_name}`,
            '30': `${event.title.split(' - ')[0]} -${event.extendedProps.mode}`,
            '50': `${event.title} :${parseFloat(event.extendedProps.dose).toFixed(2)} ${event.extendedProps.unit.substring(0, 2)}`,
            "70": event.extendedProps.note
                ? `${event.title.split(' - ')[0]} - ${event.extendedProps.anomaly_type_name} - ${event.extendedProps.note}`
                : `${event.title.split(' - ')[0]} - ${event.extendedProps.anomaly_type_name}`
        };
        const detailMap = {
            '10': [
                {label: t('Dose'), value: `${event.extendedProps.dose}`},
                {label: t('Unit'), value: ` ${event.extendedProps.unit}`},
                ...(event.extendedProps.mode ? [{
                    label: t('Method of use'),
                    value: event.extendedProps.mode == 10 ? t('Foliar fertigation') : t('Fertigation')
                }] : []),
                {label: t('Period'), value: `${event.extendedProps.stade_name}`},
                {label: t('"Fertigation product'), value: `${event.extendedProps.fertilisationproduct_name}`},
                {label: t('Number of passes'), value: `${event.extendedProps.passes_count}`},
            ],
            '20': [
                {label: t('Disease'), value: `${event.extendedProps.disease_name}`},
                ...(event.extendedProps.diseaseActor_name ? [{
                    label: t('Disease actor'),
                    value: `${event.extendedProps.diseaseActor_name}`
                }] : []),
                {label: t('Product type'), value: `${event.extendedProps.producttype_name}`},
                {label: t('Product'), value: `${event.extendedProps.product_name}`},
            ],
            '30': [
                {label: t('Protector'), value: `${event.extendedProps.mode}`},
                ...(event.extendedProps.size != undefined && event.extendedProps.size != '' ? [{
                    label: t('Size'),
                    value: event.extendedProps.size == 30 ? t('In green') : t('In dry')
                }] : []),
                ...(event.extendedProps.quantity != undefined && event.extendedProps.quantity != 0 ? [{
                    label: t('Quantity'),
                    value: `${event.extendedProps.quantity}`
                }] : []),
            ],

            '40': [
                {label: t('Yield'), value: `${parseInt(event.extendedProps.quantity, 10)}`},
                {label: t('Variety'), value: ` ${event.extendedProps.mode}`},
            ],
            '50': [
                {label: t('Dose'), value: `${event.extendedProps.dose}`},
                {label: t('Unit'), value: ` ${event.extendedProps.unit}`},
            ],
            '60': [
                ...(event.extendedProps.note ? [{label: t("Note"), value: `${event.extendedProps.note}`}]: []),
                ...(event.extendedProps.files ? event.extendedProps.files.map(file => file && file.file ? ({
                    label: t('File'),
                    value: `${file.file.split('/').pop()}`
                }) : []) : []),
            ],
            "70": [
                {label: t("Problem Type"), value: `${event.extendedProps.anomaly_type_name}`},
                ...(event.extendedProps.note ? [{label: t("Note"), value: `${event.extendedProps.note}`}]: []),
                ...(event.extendedProps.files
                    ? event.extendedProps.files.map((file) =>
                        file && file.file
                            ? {
                                label: t("File"),
                                value: `${file.file.split("/").pop()}`,
                            }
                            : []
                    )
                    : []),
            ],

        };
        const eventStyle = {
            display: "flex",
            alignItems: "center",
            width: "100%",
            opacity: event.extendedProps.isDone ? 1 : 0.7,
            textDecoration: event.extendedProps.isDone ? "none" : "line-through",
        };
        const title = titleMap[event.groupId] || event.title;
        const details = detailMap[event.groupId] || [];
        return (
            <div style={eventStyle}>
                <input
                    type="checkbox"
                    checked={selectedEvents.includes(eventInfo.event.id)}
                    onChange={() => handleEventSelect(eventInfo.event.id)}
                    onClick={(e) => e.stopPropagation()}
                    style={{ marginRight: "5px" }}
                />
                <Tooltip
                    title={
                        <div>
                            <div>{t("Event type:")} {types[event.groupId]}</div>
                            {details.map((detail, index) => (
                                <div key={index}>
                                    <div>{detail.label}: {detail.value}</div>
                                </div>
                            ))}
                            <div>{t("Status")}: {event.extendedProps.isDone ? t("Done") : t("Not Done")}</div>
                        </div>
                    }
                    PopperProps={{
                        sx: {
                            "& .MuiTooltip-tooltip": {
                                backgroundColor: "#ffffff",
                                color: "#000000",
                                padding: "10px",
                                width: "max-content",
                                display: "inline-block",
                                borderRadius: "4px",
                                border: "solid #000000 1px",
                            },
                            "& .MuiTooltip-arrow": {
                                color: "#ffffff",
                                "&:before": {
                                    border: "solid #000000 1px",
                                },
                            },
                        },
                    }}
                    arrow
                >
                    <Chip
                        color={color}
                        className="text-truncate w-100"
                        variant="filled"
                        label={title}
                        size="small"
                        style={{ textDecoration: event.extendedProps.isDone ? "none" : "line-through",color:"white" }}
                    />
                </Tooltip>
            </div>
        );
    }

    const handleSelectAllMonthEvents = () => {
        const currentDate = new Date();
        const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
        const lastDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);

        const eventsInMonth = events.filter(event => {
            const eventDate = new Date(event.open_hour);
            return eventDate >= firstDayOfMonth && eventDate <= lastDayOfMonth;
        });

        if (allMonthEventsSelected) {
            setSelectedEvents([]);
            setAllMonthEventsSelected(false);
        } else {
            setSelectedEvents(eventsInMonth.map(event => event.id));
            setAllMonthEventsSelected(true);
        }
    };

    function handleEventDelete() {
        dispatch(Delete_Event(event.id)).then((res) => {
            let copy = events.filter((element) => element.id != event.id);
            setEvents(copy);
            handleEvents(copy);
            setSelectedEvents(prevSelected => prevSelected.filter(id => id !== event.id));
            handleCloseDrawer()

            dispatch(Task_User_Events(user.id)).then((res) => {
                setEvents(res);
                handleEvents(res);
            });
            dispatch(
                showSnackbar(
                    "success",
                    undefined,
                    "Event deleted successfully",
                    "top",
                    "right"
                )
            );
        })
    }

    const formatDuration = (minutes) => {
        const days = Math.floor(minutes / (24 * 60));
        const hours = Math.floor((minutes % (24 * 60)) / 60);
        const remainingMinutes = minutes % 60;
        let result = '';
        if (days > 0) {
            result += `${days} day${days > 1 ? 's' : ''} `;
        }
        if (hours > 0) {
            result += `${hours} hour${hours > 1 ? 's' : ''} `;
        }
        if (remainingMinutes > 0) {
            result += `${remainingMinutes} minute${remainingMinutes > 1 ? 's' : ''}`;
        }
        return result.trim();
    };
    const showError = (dispatch, message) => {
        dispatch(
            showSnackbar(
                "error",
                undefined,
                message,
                "top",
                "right"
            )
        );
    };

    const validateForm = (event, repeat, frequency, dispatch) => {
        if (!listSelectedTasks || listSelectedTasks.length === 0) {
            setLoadingbtn(false);
            showError(dispatch, t('Please select at least one task.'));
            return false;
        }
        if (repeat && !frequency) {
            showError(dispatch, t("Frequency required! Please fill in the frequency field."));
            return false;
        }

        const fields = requiredFields[event.type];
        if (fields) {
            for (const { field, message } of fields) {
                const fieldValue = getFieldValue(event, field);
                if (!fieldValue || (typeof fieldValue === "string" ? fieldValue.trim() === "" : false)) {
                    setLoadingbtn(false);
                    showError(dispatch, message);
                    return false;
                }
            }
            if (event.type == "70" &&
                event.anomaly?.anomaly_type?.id == 'ed1beb04-7ed3-41ed-97bd-5c89032646f7' ) {
                if (!note || note.trim() == '') {
                    setLoadingbtn(false);
                    showError(dispatch, t('Note is required for this problem type!'));
                    return false;
                }
            }
        }

        return true;
    };

    const getFieldValue = (obj, field) => {
        return field.split('.').reduce((o, i) => (o ? o[i] : undefined), obj);
    };

    const requiredFields = {
        10: [
            {field: 'dose', message: t('Dose required! Please fill out the dose field.')},
            {field: 'unit', message: t('Unity required! Please fill in the unit field.')},
            {field: 'mode', message: t('Method of use required! Please complete the method of use field.')},
            {
                field: 'fertilisationproduct',
                message: t('Fertigation required! Please complete the fertigation product field.')
            },
            {
                field: 'passes_count',
                message: t('Number of passes required! Please fill in the number of passes field.')
            }
        ],
        20: [
            {field: 'disease', message: t('Disease required! Please fill in the disease field.')},
            {field: 'producttype', message: t('Product type required! Please fill in the product type field.')},
            {field: 'product', message: t('Product required! Please fill in the product field.')}
        ],
        30: [
            {field: 'mode', message: t('Protector required! Please fill in the protector field.')}
        ],
        40: [
            {field: 'quantity', message: t('Yield required! Please fill in the yield field.')},
            {field: 'mode', message: t('Variety required! Please fill in the variety field.')}
        ],
        50: [
            {field: 'dose', message: t('Dose required! Please fill in the dose field.')},
            {field: 'unit', message: t('Unit required! Please fill in the unit field.')}
        ],
        70: [
            {
                field: "anomaly.anomaly_type.id",
                message: t("Problem type is required!"),
            },
        ],
    };
    const sortedEventTypes = Object.entries(types).sort((a, b) => {
        return typesOrder[a[0]] - typesOrder[b[0]];
    });


    function handleStadeChange(e) {
        const selected = e.target.value
        setEvent({...event, stade: selected});
    }

    const handleClick = (ev, event) => {
        if (!isEditing) {
            setselectedEvent(ev)
            event.type = ev
        }
    }
    const renderSelectGroup = project => {
        const items = project.tasks.map(task => {
            return (
                <MenuItem key={task.id} value={task.id} sx={{justifyContent: "space-between"}}>
                    {task.task_name}
                    {listSelectedTasks.includes(task.id) ? <CheckIcon color="info"/> : null}
                </MenuItem>
            );
        });
        return [<ListSubheader>{project.project_name}</ListSubheader>, items];
    };
    const onChange = e => {
        const {name, value} = e.target;
        setEvent(prevEvent => {
            const newEvent = {...prevEvent, [name]: value};
            if (name === "mode") {
                if (prevEvent.type !== "40") {
                    if (value !== t("Size")) {
                        newEvent.size = '';
                    }
                    if (value !== t("Thinning")) {
                        newEvent.quantity = '';
                    }
                }
            }
            return newEvent;
        });
    };
    const onSubmit = async e => {
        setLoadingbtn(true);
        if (!validateForm(event, repeat, frequency, dispatch)) {
            return;
        }
        let eventToSubmit = {...event,isDone };
        eventToSubmit.tasks = listSelectedTasks;
        if (eventToSubmit.id) {
            if (eventToSubmit.task && eventToSubmit.task.id) {
                eventToSubmit.task = eventToSubmit.task.id;
            }
        } else {
            if ((typeof eventToSubmit.task === "undefined")) {
                eventToSubmit.task = task.id;
                eventToSubmit.variety = task.variety;
            }
        }

        if (eventToSubmit.type == 50) {
            eventToSubmit.duration = duration;
        }
        if (event.type == 60) {
            eventToSubmit.notes = note;
            const uniqueFiles = new Map();
            for (const file of files) {

                if (file.id) {
                    uniqueFiles.set(file.name, {
                        id: file.id,
                        name: file.name,
                        file: file.path,
                    });
                } else {
                    if (!uniqueFiles.has(file.name)) {
                        const base64Content = await fileToBase64(file);
                        uniqueFiles.set(file.name, {
                            name: file.name,
                            file: base64Content,
                        });
                    }
                }
            }
            eventToSubmit.files = Array.from(uniqueFiles.values());
        }
        if (event.type == 70) {
            eventToSubmit.notes = note;
            eventToSubmit.anomaly_type = event.anomaly_type;
            const uniqueFiles = new Map();
            for (const file of files) {
                if (file.id) {
                    uniqueFiles.set(file.name, {
                        id: file.id,
                        name: file.name,
                        file: file.path,
                    });
                } else {
                    if (!uniqueFiles.has(file.name)) {
                        const base64Content = await fileToBase64(file);
                        uniqueFiles.set(file.name, {
                            name: file.name,
                            file: base64Content,
                        });
                    }
                }
            }
            eventToSubmit.files = Array.from(uniqueFiles.values());
        }

        if (repeat === true) {
            let array;
            let elements = [];
            array = getDaysArray(repeatDateOpen, repeatDateClose, parseInt(frequency, 10));
            if (array) {
                elements = array.map((element) => {
                    let item = JSON.parse(JSON.stringify(eventToSubmit));
                    let openHour = new Date(element);
                    openHour.setHours(eventToSubmit.open_hour.getHours());
                    openHour.setMinutes(eventToSubmit.open_hour.getMinutes());
                    item.open_hour = openHour.toISOString();
                    let closeHour = new Date(element);
                    closeHour.setHours(eventToSubmit.close_hour.getHours());
                    closeHour.setMinutes(eventToSubmit.close_hour.getMinutes());
                    item.close_hour = closeHour.toISOString();
                    return item;
                });
            }
            if (eventToSubmit.id) {
                dispatch(Update_Task_Event(elements)).then((res) => {
                    setLoadingbtn(false);
                    let copy = events.filter((element) => element.id != eventToSubmit.id);
                    copy.push(...res);
                    setEvents(copy);
                    handleEvents(copy);
                    handleCloseDrawer()

                    dispatch(Task_User_Events(user.id)).then((res) => {
                        setEvents(res);
                        handleEvents(res);
                    });
                    dispatch(
                        showSnackbar(
                            "success",
                            undefined,
                            "Event added successfully",
                            "top",
                            "right"
                        )
                    );
                })
            } else {
                dispatch(Add_Tasks_Events(elements)).then((res) => {
                    setLoadingbtn(false);
                    events.push(...res);
                    handleEvents(events);
                    handleCloseDrawer()

                    dispatch(Task_User_Events(user.id)).then((res) => {
                        setEvents(res);
                        handleEvents(res);
                    });
                    dispatch(
                        showSnackbar(
                            "success",
                            undefined,
                            "Event modified successfully",
                            "top",
                            "right"
                        )
                    );
                })
            }
        } else {
            if (eventToSubmit.id) {
                dispatch(Update_Task_Event(eventToSubmit)).then((res) => {
                    setLoadingbtn(false);
                    let copy = events.filter((element) => element.id != eventToSubmit.id);
                    copy.push(res);
                    setEvents(copy);
                    handleEvents(copy);
                    handleCloseDrawer()

                    dispatch(Task_User_Events(user.id)).then((res) => {
                        setEvents(res);
                        handleEvents(res);
                    });
                    dispatch(
                        showSnackbar(
                            "success",
                            undefined,
                            "Event added successfully",
                            "top",
                            "right"
                        )
                    );
                })
            } else {
                dispatch(Add_Tasks_Events([eventToSubmit])).then((res) => {
                    setLoadingbtn(false);
                    events.push(res[0]);
                    handleEvents(events);
                    handleCloseDrawer()

                    dispatch(Task_User_Events(user.id)).then((res) => {
                        setEvents(res);
                        handleEvents(res);
                    });
                    dispatch(
                        showSnackbar(
                            "success",
                            undefined,
                            "Event modified successfully",
                            "top",
                            "right"
                        )
                    );
                })
            }
        }
    }
    const getDaysArray = function (start, end, frequency) {
        for (var arr = [], dt = new Date(start); dt <= end; dt.setDate(dt.getDate() + frequency)) {
            arr.push(new Date(dt));
        }
        return arr;
    };

    function onRepeatDateOpenChange(e) {
        const date = new Date(e.target.value.$d);
        setRepeatDateOpen(date);
    }

    const handleDateClick = (info) => {
        let copy = {};
        copy.open_hour = info.date;
        copy.close_hour = new Date(info.date.getTime() + 24*60 * 60 * 1000);
        const diffMinutes = 60;
        const duration = formatDuration(diffMinutes);
        setduration(diffMinutes);
        setPeriodFormated(duration);
        copy.type = '50';
        setEvent(copy);
        setOpenDrawer(true);
        setIsDone(true);

    };
    const handleCameraClick = () => {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = 'image/*';
        input.capture = 'environment';
        input.onchange = (e) => {
            const file = e.target.files[0];
            if (file) {
                setFiles(prevFiles => [...prevFiles, file]);
            }
        };
        input.click();
    };
    const handleTakePhoto = (dataUri) => {
        const file = dataURItoFile(dataUri, "captured_image.jpg");
        setFiles((prevFiles) => [...prevFiles, file]);
        setShowCamera(false);
    };

    const dataURItoFile = (dataURI, fileName) => {
        const arr = dataURI.split(",");
        const mime = arr[0].match(/:(.*?);/)[1];
        const bstr = atob(arr[1]);
        let n = bstr.length;
        const u8arr = new Uint8Array(n);
        while (n--) {
            u8arr[n] = bstr.charCodeAt(n);
        }
        return new File([u8arr], fileName, { type: mime });
    };
    const truncateFileName = (fileName, maxLength = 20) => {
        if (fileName.length <= maxLength) return fileName;
        const extension = fileName.split('.').pop();
        const nameWithoutExtension = fileName.slice(0, -(extension.length + 1));
        const truncatedName = nameWithoutExtension.slice(0, maxLength - 3 - extension.length) + '...';
        return `${truncatedName}.${extension}`;
    };
    const addAudioElement = (blob) => {
        const file = new File([blob], `audio_${Date.now()}.wav`, { type: "audio/wav" });
        setFiles((prevFiles) => [...prevFiles, file]);
    };
    return (
        <Container maxWidth="xl" className="mod-calendar mt-4">

            {events &&
                <div className="custom-calendar">
                    <FullCalendar
                        plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin, multiMonthPlugin]}
                        firstDay={1}
                        headerToolbar={{
                            left: currentView === 'dayGridMonth'
                                ? "prev,next today selectAllMonth"
                                : "prev,next today",
                            center: "title",
                            right: currentView === 'dayGridMonth' && selectedEvents.length > 0
                                ? `deleteSelected ${!isMobile ? "multiMonthYear," : ""}dayGridMonth,timeGridWeek,timeGridDay`
                                : `${!isMobile ? "multiMonthYear," : ""}dayGridMonth,timeGridWeek,timeGridDay`,
                        }}

                        customButtons={{
                            selectAllMonth: {
                                text: allMonthEventsSelected
                                    ? t("Unselect All for This Month")
                                    : t("Select All for This Month"),
                                click: handleSelectAllMonthEvents,
                            },
                            deleteSelected: {
                                text: t("Delete Selected Events"),
                                click: handleDeleteSelected,
                            },
                        }}
                        viewDidMount={(info) => setCurrentView(info.view.type)}

                        initialView={'dayGridMonth'}

                        editable={false}
                        selectable={true}
                        selectMirror={true}
                        dayMaxEvents={true}
                        weekends={true}
                        events={calendarEvents}
                        eventContent={renderEventContent}
                        eventClick={handleEventClick}
                        select={handleDateSelect}
                        eventChange={handleEventChange}
                        locale={i18n.language}
                        locales={locales}
                        ref={calendarRef}
                        dateClick={handleDateClick}
                    />
                </div>
            }

            <Drawer
                anchor="right"
                open={openDrawer}
                onClose={handleCloseDrawer}
                slots={{backdrop: Backdrop}}
                slotProps={{
                    backdrop: {
                        timeout: 500,
                    },
                }}
                sx={{
                    zIndex: 1300,
                    '& .MuiDrawer-paper': {
                        width: '100%',
                        maxWidth: {
                            xs: '400px',
                            sm: '800px',
                        },
                        boxSizing: 'border-box',
                        overflowX: 'hidden !important',
                    },
                }}

            >
                <Box sx={{padding: 3}}>
                    <IconButton
                        aria-label="close"
                        onClick={handleCloseDrawer}
                        sx={{
                            position: 'absolute',
                            right: 8,
                            top: 8,
                            color: (theme) => theme.palette.grey[500],
                        }}
                    >
                        <CloseIcon/>
                    </IconButton>

                    <h2 style={{textAlign: 'center'}}>
                        {isEditing ? t('Edit Event Information') : t('Add Event Information')}</h2>
                    <DialogContent style={{height: 'calc(100% - 64px)', overflowY: 'auto', overflowX: 'hidden'}}>
                        <Form onSubmit={e => onSubmit(e)} className="text-center h-100 d-flex flex-column">
                            <Container>
                                <Row className="mb-3">
                                    <Col xs={12}>
                                        <FormControl fullWidth variant="outlined" sx={{minWidth: "100%"}} size="small">
                                            <InputLabel id="task-label">{t("Select Tasks")}</InputLabel>
                                            <Select
                                                label="Select Tasks"
                                                name="tasks"
                                                labelId="task-label"
                                                multiple
                                                required
                                                id="task-select-helper"
                                                value={listSelectedTasks}
                                                onChange={(e) => handleChangeTaskSelect(e)}
                                                disabled={event.id ? true : false}
                                                renderValue={(selected) => (
                                                    <Stack gap={1} direction="row" flexWrap="wrap">
                                                        {selected.map((value) => {
                                                            let foundTask = null;
                                                            listTasks.forEach((project) => {
                                                                const task = project.tasks.find((task) => task.id === String(value));
                                                                if (task) {
                                                                    foundTask = task;
                                                                }
                                                            });
                                                            return (
                                                                <Chip
                                                                    key={value}
                                                                    label={foundTask ? foundTask.task_name : ''}
                                                                    onDelete={event.id ? undefined : () =>
                                                                        setListSelectedTasks(
                                                                            listSelectedTasks.filter((item) => item !== value)
                                                                        )
                                                                    }
                                                                    deleteIcon={
                                                                        event.id ? undefined :
                                                                            <CancelIcon
                                                                                onMouseDown={(event) => event.stopPropagation()}
                                                                            />
                                                                    }
                                                                />
                                                            );
                                                        })}
                                                    </Stack>
                                                )}
                                            >
                                                {listTasks && listTasks.map(item => renderSelectGroup(item))}
                                            </Select>
                                        </FormControl>
                                    </Col>
                                </Row>
                                <Row className="mb-3">
                                    <Col xs={12}>
                                        <Stack direction="row" spacing={1} className="flex-wrap ">
                                            {sortedEventTypes.map(([typeId, typeName]) => (
                                                <Chip
                                                    key={typeId}
                                                    label={typeName}
                                                    color={colors[typeId]}
                                                    className="mt-1 mb-1"
                                                    variant={selectedEvent === typeId ? "filled" : "outlined"}
                                                    onClick={() => handleClick(typeId, event)}
                                                    disabled={isEditing}
                                                />
                                            ))}
                                        </Stack>
                                    </Col>
                                </Row>
                                {!repeat ? (
                                    <Row>
                                        <Col xs={6}>
                                            <FormControl fullWidth variant="outlined" className="pt-2"
                                                         sx={{minWidth: "100%"}}
                                                         size="small">
                                                <BasicDateTimePicker
                                                    className="graph_date_input"
                                                    label={event.type && dates[event.type].start}
                                                    initialDate={dayjs(new Date(event.open_hour))}
                                                    name={"starttDate"}
                                                    onChange={(e) => onDateOpenChange(e)}
                                                />
                                            </FormControl>
                                        </Col>
                                        <Col xs={6}>
                                            <FormControl fullWidth variant="outlined" className="pt-2"
                                                         sx={{minWidth: "100%"}}
                                                         size="small">
                                                <BasicDateTimePicker
                                                    className="graph_date_input"
                                                    label={event.type && dates[event.type].end}
                                                    initialDate={dayjs(new Date(event.close_hour))}
                                                    name={"EndtDate"}
                                                    onChange={(e) => onDateCloseChange(e)}
                                                />
                                            </FormControl>
                                        </Col>
                                    </Row>
                                ) : ""}

                                {(typeof event.id === "undefined") ? (
                                    <Row className="pt-3">
                                        <Col xs={6} className="d-flex align-items-center  justify-content-between">
                                            {t("Repeat this event?")}
                                            <div className="d-flex align-items-center">
                                                <input
                                                    type="checkbox"
                                                    id="index-checkbox"
                                                    name="layer"
                                                    className="index-checkbox"
                                                    onChange={handleOnChange}
                                                />
                                                <label htmlFor="index-checkbox"></label>
                                            </div>
                                        </Col>
                                        {repeat ? (
                                            <Col xs={6}>
                                                <FormControl fullWidth variant="outlined" className="text-start"
                                                             sx={{minWidth: "100%"}} size="small">
                                                    <TextField
                                                        id="outlined-size-small"
                                                        type="number"
                                                        label={t("Frequency (per day).")}
                                                        name="frequency"
                                                        onChange={e => onFrequencyChange(e)}
                                                        required
                                                        size="small"
                                                        inputProps={{min: 1}}
                                                    />
                                                </FormControl>
                                            </Col>
                                        ) : ""}
                                    </Row>
                                ) : ""}
                                {repeat ? (
                                    <Row>
                                        <Col xs={6}>
                                            <FormControl fullWidth variant="outlined" className="pt-2"
                                                         sx={{minWidth: "100%"}}
                                                         size="small">
                                                <BasicDateTimePicker
                                                    className="graph_date_input"
                                                    label={t("start date")}
                                                    initialDate={dayjs(new Date(repeatDateOpen))}
                                                    name={"starttDate"}
                                                    onChange={(e) => onRepeatDateOpenChange(e)}
                                                />
                                            </FormControl>
                                        </Col>
                                        <Col xs={6}>
                                            <FormControl fullWidth variant="outlined" className="pt-2"
                                                         sx={{minWidth: "100%"}}
                                                         size="small">
                                                <BasicDateTimePicker
                                                    className="graph_date_input"
                                                    label={t("end date")}
                                                    initialDate={dayjs(new Date(repeatDateClose))}
                                                    name={"EndtDate"}
                                                    onChange={(e) => onRepeatDateCloseChange(e)}
                                                />
                                            </FormControl>
                                        </Col>
                                    </Row>
                                ) : ""}
                                {event.type == 10 || event.type == 50 ? (
                                    <Row className="pt-3">
                                        <Col xs={8}>
                                            <FormControl fullWidth variant="outlined" sx={{minWidth: "100%"}}
                                                         size="small">
                                                <TextField
                                                    id="outlined-size-small"
                                                    type="number"
                                                    label={t("Dose")}
                                                    name="dose"
                                                    value={event.dose}
                                                    onChange={e => onChange(e)}
                                                    required
                                                    size="small"
                                                    inputProps={{min: 1}}
                                                />
                                            </FormControl>

                                        </Col>
                                        <Col xs={4}>
                                            <FormControl fullWidth variant="outlined" className="text-start"
                                                         sx={{minWidth: "100%"}} size="small">
                                                <InputLabel id="unit-label">{t("Unit")}*</InputLabel>
                                                {event.type == 10 ?
                                                    <Select
                                                        labelId="unit-label"
                                                        id="unit-select-helper"
                                                        value={event.unit}
                                                        label={t("Unit")}
                                                        name="unit"
                                                        onChange={e => onChange(e)}
                                                    >
                                                        <MenuItem value="kg/ha" key="kg/ha">kg/ha</MenuItem>
                                                        <MenuItem value="L/ha" key="L/ha"> L/ha</MenuItem>
                                                        <MenuItem value="T/ha" key="T/ha">T/ha</MenuItem>
                                                    </Select>
                                                    :
                                                    <Select
                                                        labelId="unit-label"
                                                        id="unit-select-helper"
                                                        value={event.unit}
                                                        label={t("Unit")}
                                                        name="unit"
                                                        onChange={e => onChange(e)}
                                                    >
                                                        <MenuItem value="mm/j/ha" key="mm/j/ha">mm/j/ha</MenuItem>
                                                        <MenuItem value="m³/j/ha" key="m³/j/ha">m³/j/ha</MenuItem>
                                                        <MenuItem value="L/j/ha" key="L/j/ha">L/j/ha</MenuItem>
                                                    </Select>
                                                }
                                            </FormControl>
                                        </Col>
                                    </Row>
                                ) : ""}
                                {event.type == 10 ? (
                                    <Row className="pt-3">
                                        <Col xs={12}>
                                            <FormControl fullWidth variant="outlined" className="text-start"
                                                         sx={{minWidth: "100%"}} size="small">
                                                <InputLabel id="mod-label">{t("Method of use")}*</InputLabel>
                                                <Select
                                                    labelId="mod-label"
                                                    id="method-select-helper"
                                                    defaultValue={event.mode ? String(event.mode) : ''}
                                                    value={event.mode ? String(event.mode) : ''}
                                                    label={t("Method of use")}
                                                    name="mode"
                                                    onChange={e => onChange(e)}
                                                >
                                                    <MenuItem value={'10'}>{t("Foliar fertigation.")}</MenuItem>
                                                    <MenuItem value={'20'}>{t("Fertigation.")}</MenuItem>
                                                </Select>

                                            </FormControl>
                                        </Col>
                                    </Row>
                                ) : ""}
                                {event.type == 50 ? (
                                    <Row className="pt-3">
                                        <Col xs={12}>
                                            <FormControl fullWidth variant="outlined">
                                                <TextField
                                                    id="outlined-size-small"
                                                    type="text"
                                                    label={t("Duration")}

                                                    name="duration"
                                                    value={periodFormated}
                                                    disabled={true}
                                                    size="small"
                                                />
                                            </FormControl>
                                        </Col>
                                    </Row>
                                ) : ""}
                                {event.type == 10 ? (
                                    <Row className="mt-3">
                                        <Col xs={12}>
                                            <FormControl fullWidth variant="outlined" className="text-start"
                                                         sx={{minWidth: "100%"}} size="small">

                                                <InputLabel
                                                    id="stade-label">{t('Period (phenological stages)')}</InputLabel>
                                                <Select
                                                    labelId="stade-label"
                                                    id="stade-select-helper"
                                                    defaultValue={event.stade}
                                                    value={event.stade}
                                                    label={t('Period (phenological stages)')}
                                                    onChange={e => handleStadeChange(e)}
                                                >
                                                    <MenuItem value="">None</MenuItem>
                                                    {stadePhenologiques.map((stade) => (
                                                        <MenuItem value={stade.id}>{stade.name}</MenuItem>
                                                    ))}
                                                </Select>
                                            </FormControl>
                                        </Col>
                                    </Row>) : ""}
                                {event.type == 10 ? (
                                    <Row className="mt-3">
                                        <Col xs={12}>
                                            <FormControl fullWidth variant="outlined" className="text-start"
                                                         sx={{minWidth: "100%"}} size="small">

                                                <InputLabel
                                                    id="fertlisation-label">{t("Fertigation product")}</InputLabel>
                                                <Select
                                                    labelId="fertlisation-label"
                                                    id="fertlisation-select-helper"
                                                    defaultValue={event.fertilisationproduct}
                                                    value={event.fertilisationproduct}
                                                    label={t("Fertilisation product")}
                                                    onChange={e => handleFertilisationProductChange(e)}
                                                >
                                                    {fertilisationProducts.map((product) => (
                                                        <MenuItem value={product.id}>{product.name}</MenuItem>
                                                    ))}
                                                </Select>
                                            </FormControl>
                                        </Col>
                                    </Row>
                                ) : ""}

                                {event.type == 10 ? (
                                    <Row className="">
                                        <Col xs={12}>
                                            <FormControl fullWidth variant="outlined" className="pt-3">
                                                <TextField
                                                    id="outlined-size-small"
                                                    type="number"
                                                    label={t("Number of passes")}
                                                    name="passes_count"
                                                    value={event.passes_count}
                                                    onChange={e => onChange(e)}
                                                    required
                                                    size="small"
                                                />
                                            </FormControl>
                                        </Col>
                                    </Row>
                                ) : ""}
                                {event.type == 20 ? (
                                    <Row className="pt-3">
                                        <Col xs={12}>
                                            <FormControl fullWidth variant="outlined" className="text-start"
                                                         sx={{minWidth: "100%"}} size="small">
                                                <InputLabel id="disease-label">t{("Disease")}</InputLabel>
                                                <Select
                                                    labelId="disease-label"
                                                    id="insect-select-helper"
                                                    defaultValue={event.disease}
                                                    value={event.disease}
                                                    label={t("Disease")}
                                                    onChange={e => handleDiseaseChange(e)}
                                                >
                                                    {diseases.map((disease) => (
                                                        <MenuItem value={disease.id}>{disease.name}</MenuItem>
                                                    ))}
                                                </Select>
                                            </FormControl>
                                        </Col>
                                    </Row>
                                ) : ""}
                                {event.type == 20 && diseaseActLabel !== null && diseaseActors && diseaseActors.length !== 0 ? (
                                    <Row className="pt-3">
                                        <Col xs={12}>
                                            <FormControl fullWidth variant="outlined" className="text-start"
                                                         sx={{minWidth: "100%"}} size="small">
                                                <InputLabel id="insect-label">{diseaseActLabel}</InputLabel>
                                                <Select
                                                    labelId="insect-label"
                                                    id="insect-select-helper"
                                                    defaultValue={event.disease_actor}
                                                    value={event.disease_actor}
                                                    label={diseaseActLabel}
                                                    onChange={e => handleDiseaseActorChange(e)}
                                                >
                                                    {diseaseActors && diseaseActors.map((actor) => (
                                                        <MenuItem value={actor.id}>{actor.name}</MenuItem>
                                                    ))}
                                                </Select>
                                            </FormControl>
                                        </Col>
                                    </Row>
                                ) : ""}
                                {event.type == 20 ? (
                                    <Row className="pt-3">
                                        <Col xs={12}>
                                            <FormControl fullWidth variant="outlined" className="text-start"
                                                         sx={{minWidth: "100%"}} size="small">
                                                <InputLabel id="insect-label">{t("Product type")}</InputLabel>
                                                <Select
                                                    labelId="insect-label"
                                                    id="insect-select-helper"
                                                    defaultValue={event.producttype}
                                                    value={event.producttype}
                                                    label={t("Product type")}
                                                    onChange={e => handleProductTypeChange(e)}
                                                >

                                                    {typeProducts && typeProducts.map((type) => (
                                                        <MenuItem value={type.id}>{type.name}</MenuItem>
                                                    ))}
                                                </Select>
                                            </FormControl>
                                        </Col>
                                    </Row>
                                ) : ""}
                                {event.type == 20 ? (
                                    <Row className="pt-3">
                                        <Col xs={12}>
                                            <FormControl fullWidth variant="outlined" className="text-start"
                                                         sx={{minWidth: "100%"}} size="small">
                                                <InputLabel id="product-label">{t('Product')}</InputLabel>
                                                <Select
                                                    labelId="product-label"
                                                    id="product-select-helper"
                                                    defaultValue={event.product}
                                                    value={event.product}
                                                    label={t("Product")}
                                                    onChange={e => handleProductChange(e)}
                                                >

                                                    {products && products.map((product) => (
                                                        <MenuItem value={product.id}>{product.name}</MenuItem>
                                                    ))}

                                                </Select>
                                            </FormControl>
                                        </Col>
                                    </Row>
                                ) : ""}
                                {event.type == 30 ? (
                                    <Row className="pt-3">
                                        <Col xs={12}>
                                            <FormControl fullWidth variant="outlined" className="text-start"
                                                         sx={{minWidth: "100%"}} size="small">
                                                <InputLabel id="mode-label">{t("Protector (sunburn)")}</InputLabel>
                                                <Select
                                                    labelId="mode-label"
                                                    id="mode-select-helper"
                                                    value={event.mode}
                                                    label={t("Protector (sunburn)")}
                                                    name="mode"
                                                    onChange={e => onChange(e)}
                                                >
                                                    <MenuItem value={t("Size")}>{t("Size")}</MenuItem>
                                                    <MenuItem value={t("Thinning")}>{t("Thinning")}</MenuItem>
                                                    <MenuItem value={t("Soil tillage")}>{t("Soil tillage")} </MenuItem>
                                                    <MenuItem value={t("Girdling")}>{t("Girdling")}</MenuItem>
                                                    <MenuItem value={t("Weeding")}>{t("Weeding")}</MenuItem>
                                                    <MenuItem value={t("Drainage")}>{t("Drainage")}</MenuItem>
                                                    <MenuItem value={t("Mulching")}>{t("Mulching")}</MenuItem>
                                                    <MenuItem value={t("Liming")}>{t("Liming")}</MenuItem>
                                                    <MenuItem value={t("Defoliation")}>{t("Defoliation")}</MenuItem>
                                                    <MenuItem value={t("Staining protocol")}>{t("Staining protocol")}</MenuItem>
                                                </Select>
                                            </FormControl>
                                        </Col>
                                    </Row>
                                ) : ""}
                                {event.type == 30 && event.mode == 'Size' ? (
                                    <Row className="pt-3">
                                        <Col xs={12}>
                                            <FormControl fullWidth variant="outlined" className="text-start"
                                                         sx={{minWidth: "100%"}} size="small">
                                                <InputLabel id="size-label">{t("Size")}</InputLabel>

                                                <Select
                                                    labelId="size-label"
                                                    id="size-select-helper"
                                                    defaultValue={event.size}
                                                    value={event.size}
                                                    label="Size"
                                                    name={t("size")}
                                                    onChange={e => onChange(e)}
                                                >
                                                    <MenuItem value={30}>en vert</MenuItem>
                                                    <MenuItem value={40}>en sec</MenuItem>
                                                </Select>
                                            </FormControl>
                                        </Col>
                                    </Row>
                                ) : ""}
                                {event.type == 30 && event.mode == t("Thinning") ? (
                                    <Row className="pt-3">
                                        <Col xs={12}>
                                            <FormControl fullWidth variant="outlined" className="">
                                                <TextField
                                                    id="outlined-size-small"
                                                    type="number"
                                                    label={t("Quantity")}
                                                    name="quantity"
                                                    value={event.quantity}
                                                    onChange={e => onChange(e)}
                                                    required
                                                    size="small"
                                                />
                                            </FormControl>
                                        </Col>
                                    </Row>
                                ) : ""}
                                {event.type == 40 ? (
                                    <Row className="pt-3">
                                        <Col xs={12}>
                                            <FormControl fullWidth variant="outlined">
                                                <TextField
                                                    id="outlined-size-small"
                                                    type="number"
                                                    label={t("Yield")}
                                                    name="quantity"
                                                    value={event.quantity}
                                                    onChange={e => onChange(e)}
                                                    required
                                                    size="small"
                                                />
                                            </FormControl>
                                        </Col>
                                    </Row>
                                ) : ""}
                                {event.type == 40 ? (
                                    <Row className="pt-3">
                                        <Col xs={12}>
                                            <FormControl fullWidth variant="outlined" className="text-start"
                                                         sx={{minWidth: "100%"}} size="small">
                                                <InputLabel id="Variete-label">{t("Variety")}*</InputLabel>
                                                <Select
                                                    labelId="Variete-label"
                                                    id="Variete-select-helper"
                                                    defaultValue={event.mode}
                                                    value={event.mode}
                                                    label={t("Variety")}
                                                    name="mode"
                                                    onChange={e => onChange(e)}
                                                >
                                                    <MenuItem value="tardive">tardive</MenuItem>
                                                    <MenuItem value="precoce">precoce</MenuItem>
                                                </Select>
                                            </FormControl>
                                        </Col>
                                    </Row>
                                ) : ""}
                                {(event.type == 70) ? (
                                    <Row className="mt-3">
                                        <Col xs={12}>
                                            <FormControl
                                                fullWidth
                                                variant="outlined"
                                                className="text-start"
                                                sx={{ minWidth: "100%" }}
                                                size="small"
                                            >
                                                <InputLabel id="anomaly-type-label">{t("Problem type")}</InputLabel>
                                                <Select
                                                    labelId="anomaly-type-label"
                                                    id="anomaly-type-select"
                                                    value={event.anomaly?.anomaly_type?.id || ""}
                                                    label={t("Problem type")}
                                                    onChange={handleAnomalyTypeChange}
                                                >
                                                    {anomalyType.map((type) => (
                                                        <MenuItem key={type.id} value={type.id}>
                                                            {type.anomaly_type}
                                                        </MenuItem>
                                                    ))}
                                                </Select>
                                            </FormControl>
                                        </Col>
                                    </Row>
                                ) : (
                                    ""
                                )}
                                {(event.type == 60 || event.type == 70) ? (
                                    <Row className="pt-3">
                                        <Col xs={12}>
                                            <FormControl fullWidth variant="outlined" className="text-start"
                                                         sx={{minWidth: "100%"}} size="small">
                                                <InputLabel htmlFor="notes-input">{t("Notes")}</InputLabel>
                                                <Input
                                                    id="notes-input"
                                                    type="text"
                                                    name="notes"
                                                    defaultValue={note}
                                                    value={note}
                                                    onChange={handleVisits}
                                                />
                                            </FormControl>
                                        </Col>
                                        <Col xs={12} className="mb-3" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-center', gap: '20px' }}>
                                                <div style={{ display: 'flex', flexDirection: 'column' }}>
                                                    <Tooltip title={`${t("Upload Files")} (${files.length}/${MAX_FILES})`}>
                                                        <IconButton
                                                            component="label"
                                                            color="primary"
                                                            disabled={files.length >= MAX_FILES}
                                                        >
                                                            <input
                                                                type="file"
                                                                multiple
                                                                style={{ display: "none" }}
                                                                onChange={handleFileChange}
                                                                disabled={files.length >= MAX_FILES}
                                                            />
                                                            <CloudUploadIcon />
                                                        </IconButton>
                                                    </Tooltip>
                                                    <Typography variant="caption">{t("Upload files")}</Typography>
                                                </div>
                                                {isMobile ? (

                                                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                                                        <Tooltip title={t("Take Picture")}>
                                                            <IconButton
                                                                color="primary"
                                                                onClick={handleCameraClick}
                                                                disabled={files.length >= MAX_FILES}
                                                            >
                                                                <CameraAltIcon />
                                                            </IconButton>
                                                        </Tooltip>
                                                        <Typography variant="caption">{t("Camera")}</Typography>
                                                    </div>
                                                ) : null}

                                                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                                                    <AudioRecorder
                                                        onRecordingComplete={addAudioElement}
                                                        style={{ width: isMobile ? '150px' : '200px', height: isMobile ? '150px' : '200px' }}
                                                    />
                                                    <Typography variant="caption">{t("Record Audio")}</Typography>
                                                </div>
                                            </div>
                                        </Col>
                                        {showCamera && (
                                            <Col xs={12} style={{
                                                display: 'flex',
                                                justifyContent: 'center',
                                                alignItems: 'center'
                                            }}>
                                                <Camera
                                                    onTakePhoto={(dataUri) => handleTakePhoto(dataUri)}
                                                    isFullscreen={false}
                                                    idealFacingMode="environment"
                                                />
                                            </Col>
                                        )}
                                        <Col xs={12}>
                                            {files.map((file, index) => (
                                                <div key={file.id || file.name}
                                                     style={{
                                                         marginBottom: '10px',
                                                         display: 'flex',
                                                         alignItems: 'center'
                                                     }}>
                                                    <div style={{marginRight: '10px'}}>
                                                        {FileIcon(file.name)}
                                                    </div>
                                                    {truncateFileName(file.name)}
                                                    <IconButton
                                                        aria-label="Download"
                                                        onClick={() => handleFileDownload(file.id)}
                                                        size="small"
                                                    >
                                                        <CloudDownloadIcon/>
                                                    </IconButton>

                                                    <IconButton
                                                        aria-label="Delete"
                                                        onClick={() => handleFileDelete(file.id || file.name)}
                                                        size="small"
                                                    >
                                                        <DeleteIcon/>
                                                    </IconButton>
                                                    <Dialog
                                                        open={openDeleteConfirmDialog}
                                                        onClose={() => setOpenDeleteConfirmDialog(false)}
                                                        aria-labelledby="alert-dialog-title"
                                                        aria-describedby="alert-dialog-description"
                                                    >
                                                        <DialogTitle id="alert-dialog-title">
                                                            {t("Confirm Deletion")}
                                                        </DialogTitle>
                                                        <DialogContent>
                                                            <DialogContentText id="alert-dialog-description">
                                                                {t("Are you sure you want to delete this file?")}
                                                            </DialogContentText>
                                                        </DialogContent>
                                                        <DialogActions>
                                                            <Button onClick={() => setOpenDeleteConfirmDialog(false)}
                                                                    color="primary">
                                                                {t("Cancel")}
                                                            </Button>
                                                            <Button onClick={confirmFileDeletion} color="primary"
                                                                    autoFocus>
                                                                {t("Confirm")}
                                                            </Button>
                                                        </DialogActions>
                                                    </Dialog>
                                                </div>
                                            ))}
                                        </Col>

                                    </Row>
                                ) : ""}
                                <Row className="mb-3">
                                    <Col xs={12} className="d-flex align-items-start">
                                        <FormControlLabel
                                            control={
                                                <Checkbox
                                                    checked={isDone}
                                                    onChange={(e) => setIsDone(e.target.checked)}
                                                    name="isDone"
                                                    color="primary"
                                                />
                                            }
                                            label={t("Is Done")}
                                            style={{ marginLeft: 0 }}
                                        />
                                    </Col>
                                </Row>
                            </Container>
                        </Form>
                    </DialogContent>

                    <DialogActions className="p-4 d-flex justify-content-center"
                                   style={{position: 'sticky', bottom: 0, backgroundColor: 'white'}}>
                        <CustomButton
                            startIcon={<MdOutlineCancel/>}
                            color="error"
                            onClick={handleCloseDrawer}
                        >
                            {t("Cancel")}
                        </CustomButton>

                        <LoadingButton
                            sx={{
                                ...btnSX,
                                backgroundColor: "#6f9d2f",
                                color: "#ffffff",
                                "&:hover": {
                                    backgroundColor: "#5c8326",
                                },
                            }}
                            size="small"
                            type="submit"
                            loading={loadingbtn}
                            loadingPosition="start"
                            variant="contained"
                            onClick={onSubmit}
                            startIcon={isEditing ? <EditIcon/> : <AddIcon/>}

                        >
                            <span>{isEditing ? t("Update") : t("Submit")}</span>
                        </LoadingButton>
                        {event.id && (
                            <CustomButton
                                startIcon={<MdDeleteOutline/>}
                                color="error"
                                onClick={handleEventDelete}
                            >
                                {t("delete")}
                            </CustomButton>
                        )}


                    </DialogActions>
                </Box>

            </Drawer>

        </Container>
    );
};
export default CalendarDashboard;
