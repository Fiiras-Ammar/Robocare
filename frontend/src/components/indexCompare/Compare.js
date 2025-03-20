import React, { useState, useEffect, useRef } from "react";
import {
    Grid,
    Box,
    Select,
    MenuItem,
    TextField,
    FormControl,
    InputLabel,
    Stack,
    Chip,
    Slider,
    Typography,
    Checkbox,
    ListItemText,
} from "@mui/material";
import { useDispatch, useSelector } from "react-redux";
import { useTranslation } from "react-i18next";
import cookies from "js-cookie";
import {
    getCulture,
    getDensity,
    getVariety,
    getCultureByCategory,
} from "../../actions/project.js";
import { getFiltredTasks, saveSelfPattern } from "../../actions/compare.js";
import CancelIcon from "@mui/icons-material/Cancel";
import CheckIcon from "@mui/icons-material/Check";
import BasicDatePicker from "../../utils/BasicDatePicker.js";
import dayjs from "dayjs";
import LoadingButton from "@mui/lab/LoadingButton";
import SaveIcon from "@mui/icons-material/Save";
import {
    getFiltredTasksGraphData,
    clearTaskDataGraph,
} from "../../actions/compare.js";
import { showSnackbar } from "../../actions/snackbar";
import Graph from "./graph.js";
import {
    handleFilterData,
    handleFilterDataByCloudPercentage,
    findMinMaxValues,
} from "../../utils/graphDataFilter.js";
import { saveComparePattern } from "../../actions/compare.js";
import ListSubheader from "@mui/material/ListSubheader";

const Compare = () => {
    const [listCulture, setlistCulture] = useState(null);
    const [listVariety, setlistVariety] = useState(null);
    const [listDensity, setlistDensity] = useState(null);
    const [listVarietyP, setlistVarietyP] = useState(null);
    const [listDensityP, setlistDensityP] = useState(null);
    const [culture, setculture] = useState(null);
    const [variety, setvariety] = useState(null);
    const [density, setdensity] = useState(null);
    const [taskPattern, settaskPattern] = useState(null);
    const [age, setage] = useState(null);
    const [listSelectedTasks, setlistSelectedTasks] = useState([]);
    const [listSelectedDensity, setlistSelectedDensity] = useState([]);
    const [listSelectedVariety, setlistSelectedVariety] = useState([]);
    const [listTasks, setlistTasks] = useState([]);
    const [indexText, setindexText] = useState("vegetation");
    const [loading, setloading] = useState(false);
    const [loadingP, setloadingP] = useState(false);
    const user = useSelector((state) => state.auth.user);
    const graphdata = useSelector(
        (state) => state.graphReducer.graph_data_compare
    );
    const [datagraph, setdatagraph] = useState(null);
    const today = dayjs();
    const langue = cookies.get("i18next") || "en";

    const [formData, setFormData] = useState({
        index: "ndvi",
        StartDate: today.subtract(1, "year"),
        EndDate: today,
        cloud_percentage: 40,
    });
    const [formDataPattern, setFormDataPattern] = useState({
        task: null,
        densitys: [],
        varietys: [],
        StartDateP: today.subtract(1, "year"),
        EndDateP: today,
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
    ];
    const onChangeIndex = (e) => {
        setFormData({ ...formData, index: e.target.value });
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
                setindexText(" Soil moisture index");
                break;
            default:
                setindexText("vegetation");
        }
    };
    const onChangeSlider = (e, value) => {
        setFormData({ ...formData, cloud_percentage: value });
    };
    const onChangeCulture = (e) => {
        setculture(e.target.value);
        setlistSelectedTasks([]);
    };

    const onChangeVariety = (e) => {
        setvariety(e.target.value);
        setlistSelectedTasks([]);
    };
    const onChangeTaskPattern = (e) => {
        settaskPattern(e.target.value);
        setFormDataPattern({ ...formDataPattern, task: e.target.value });
    };
    const onChangeDensity = (e) => {
        setdensity(e.target.value);
    };
    const onChangeDensityP = (e) => {
        const value = e.target.value;

        if (value.includes("select-all")) {
            handleSelectAllDensity();
        } else {
            setlistSelectedDensity(value);
            setFormDataPattern({ ...formDataPattern, densitys: value });
        }
    };
    const onChangeVarietyP = (e) => {
        const value = e.target.value;
        if (value.includes("select-all")) {
            handleSelectAllVariety();
        } else {
            setlistSelectedVariety(value);
            setFormDataPattern({ ...formDataPattern, varietys: value });
        }
    };
    const handleSelectAllVariety = () => {
        if (listSelectedVariety.length === listVarietyP.length) {
            setlistSelectedVariety([]);
            setFormDataPattern({ ...formDataPattern, varietys: [] });
        } else {
            const allIds = listVarietyP.map((variety) => variety.id);
            setlistSelectedVariety(allIds);
            setFormDataPattern({ ...formDataPattern, varietys: allIds });
        }
    };
    const handleSelectAllDensity = () => {
        if (listSelectedDensity.length === listDensityP.length) {
            setlistSelectedDensity([]);
            setFormDataPattern({ ...formDataPattern, densitys: [] });
        } else {
            const allIds = listDensityP.map((density) => density.id);
            setlistSelectedDensity(allIds);
            setFormDataPattern({ ...formDataPattern, densitys: allIds });
        }
    };
    const onChangeAge = (e) => {
        setage(e.target.value);
        setlistSelectedTasks([]);
    };
    const { StartDate, EndDate, index, cloud_percentage } = formData;
    const { task, densitys, varietys, StartDateP, EndDateP } = formDataPattern;
    const onChange = (e) =>
        setFormData({ ...formData, [e.target.name]: e.target.value });
    const onChangePattern = (e) =>
        setFormDataPattern({ ...formDataPattern, [e.target.name]: e.target.value });
    const { t } = useTranslation();
    const currentLanguageCode = cookies.get("i18next") || "en";

    const dispatch = useDispatch();

    useEffect(() => {
        if (!graphdata) {
            setdatagraph(null);
            return;
        }
        let dataFiltred = [];
        let dataFiltredByCloudPercentage = [];
        setdatagraph(null);
        dataFiltred = graphdata.map((element) => {
            if (element.hasOwnProperty("data")) {
                const filteredData = handleFilterData(element.data, StartDate, EndDate);

                return {
                    ...element,
                    data: filteredData,
                };
            }
        });
        dataFiltredByCloudPercentage = dataFiltred.map((element) => {
            if (element.hasOwnProperty("data")) {
                const filteredData = handleFilterDataByCloudPercentage(
                    element.data,
                    cloud_percentage
                );

                return {
                    ...element,
                    data: filteredData,
                };
            }
        });
        setdatagraph(dataFiltredByCloudPercentage);
    }, [graphdata]);

    useEffect(() => {
        setFormData({
            ...formData,
            StartDate: today.subtract(1, "year"),
            EndDate: today,
            cloud_percentage: 40,
        });
        setFormDataPattern({
            ...formDataPattern,
            task: null,
            densitys: [],
            varietys: [],
            StartDateP: today.subtract(1, "year"),
            EndDateP: today,
        });
    }, []);

    const onSubmit = (e) => {
        e.preventDefault();

        dispatch(getFiltredTasksGraphData(listSelectedTasks, index)).then((res) => {
            if (res.status !== 200) {
                res.data.tasks_without_graph_data.map((item) => {
                    dispatch(
                        showSnackbar(
                            "error",
                            undefined,
                            res.data.message + ": " + item,
                            "top",
                            "right"
                        )
                    );
                });
                dispatch(clearTaskDataGraph()).then((res) => {});
            }
        });
    };
    const onSubmitPattern = (e) => {
        e.preventDefault();
        dispatch(saveComparePattern(formDataPattern)).then((res) => {});
    };
    useEffect(() => {
        dispatch(getCultureByCategory(langue)).then((res) => {
            setlistCulture(res.data);
        });
    }, []);

    useEffect(() => {
        if (!culture) {
            setlistVariety(null);
            setlistDensity(null);
            setlistDensityP(null);
            setlistVarietyP(null);
            return;
        }
        dispatch(getVariety(culture)).then((res) => {
            setlistVariety(res.data);
            setlistVarietyP(res.data);
        });
        dispatch(getDensity(culture)).then((res) => {
            setlistDensity(res.data);
            setlistDensityP(res.data);
        });
    }, [culture]);

    useEffect(() => {
        if (!culture) return;
        dispatch(getFiltredTasks(culture, variety, density, age)).then((res) => {
            setlistTasks(res);
        });
    }, [culture, variety, density, age, user]);

    const handleChangeTaskSelect = (e) => {
        const val = e.target.value;
        setlistSelectedTasks(val);
    };

    const renderSelectGroup = (task) => {
        return (
            <MenuItem key={task.id} value={task.id}>
                <Checkbox checked={listSelectedTasks.indexOf(task.id) > -1} />
                <ListItemText primary={task.task_name} />
            </MenuItem>
        );
    };

    const renderSelectGroupDensity = (density) => {
        return (
            <MenuItem
                key={density.id}
                value={density.id}
                sx={{ justifyContent: "space-between" }}
            >
                {density[`name_${currentLanguageCode.toLowerCase()}`]}
                {listSelectedDensity.includes(density.id) ? (
                    <CheckIcon color="info" />
                ) : null}
            </MenuItem>
        );
    };
    const renderSelectGroupVariety = (variety) => {
        return (
            <MenuItem
                key={variety.id}
                value={variety.id}
                sx={{ justifyContent: "space-between" }}
            >
                {variety[`name_${currentLanguageCode.toLowerCase()}`]}
                {listSelectedVariety.includes(variety.id) ? (
                    <CheckIcon color="info" />
                ) : null}
            </MenuItem>
        );
    };
    function valuetext(value) {
        return `${value} %`;
    }
    const renderGroupedCultures = () => {
        if (!listCulture || listCulture.length === 0) return null;

        return listCulture
            .map((category) => [
                <ListSubheader
                    key={`category-${category.id}`}
                    sx={{
                        fontWeight: "bold",
                        fontSize: "16px",
                        color: "black",
                        backgroundColor: "#f0f0f0",
                    }}
                >
                    {category.name}
                </ListSubheader>,
                ...category.cultures.map((culture) => (
                    <MenuItem
                        key={culture.id}
                        value={culture.id}
                        sx={{ pl: 3, color: "gray" }}
                    >
                        {culture[`name_${currentLanguageCode.toLowerCase()}`] ||
                            culture.name}
                    </MenuItem>
                )),
            ])
            .flat();
    };

    const handleSelectAllTasks = (event) => {
        if (event.target.checked) {
            const allIds = listTasks.map((task) => task.id);
            setlistSelectedTasks(allIds);
        } else {
            setlistSelectedTasks([]);
        }
    };

    return (
        <Box sx={{ flexGrow: 1, bgcolor: "AppBarBackground.main", mt: 3, p: 5 }}>
            <Grid container spacing={2} sx={{ marginBottom: "20px" }}>
                <Grid item xs={12}>
                    <Typography variant="h5" component="h2">
                        {t("Compare field")}
                    </Typography>
                </Grid>
            </Grid>
            <form onSubmit={(e) => onSubmit(e)}>
                <Grid container spacing={2}>
                    <Grid item xs={6}>
                        <FormControl required sx={{ minWidth: "100%" }} size="small">
                            <InputLabel id="culture-select-label">{t("Culture")}</InputLabel>
                            <Select
                                labelId="culture-select-label"
                                id="culture-select"
                                value={culture}
                                label={t("Culture")}
                                fullWidth
                                onChange={(e) => onChangeCulture(e)}
                                name="culture"
                                required
                            >
                                {renderGroupedCultures()}
                            </Select>
                        </FormControl>
                    </Grid>
                    <Grid item xs={6}>
                        <FormControl sx={{ minWidth: "100%" }} size="small">
                            <InputLabel id="demo-select-small-label">
                                {t("Variety")}
                            </InputLabel>
                            <Select
                                labelId="demo-select-small-label"
                                id="demo-select-small"
                                value={variety}
                                label="Variety"
                                fullWidth
                                onChange={(e) => onChangeVariety(e)}
                                name="variety"
                            >
                                <MenuItem value="">
                                    <em>None</em>
                                </MenuItem>
                                {listVariety &&
                                    listVariety.length > 0 &&
                                    listVariety.map((item) => (
                                        <MenuItem key={item.id} value={item.id}>
                                            {item[`name_${currentLanguageCode.toLowerCase()}`]}
                                        </MenuItem>
                                    ))}
                            </Select>
                        </FormControl>
                    </Grid>
                    <Grid item xs={6}>
                        <FormControl sx={{ minWidth: "100%" }} size="small">
                            <InputLabel id="demo-select-small-label">
                                {t("Density")}
                            </InputLabel>
                            <Select
                                labelId="demo-select-small-label"
                                id="demo-select-small"
                                value={density}
                                label="density"
                                fullWidth
                                onChange={(e) => onChangeDensity(e)}
                                name="density"
                            >
                                <MenuItem value="">
                                    <em>None</em>
                                </MenuItem>
                                {listDensity &&
                                    listDensity.length > 0 &&
                                    listDensity.map((item) => (
                                        <MenuItem key={item.id} value={item.id}>
                                            {item[`name_${currentLanguageCode.toLowerCase()}`]}
                                        </MenuItem>
                                    ))}
                            </Select>
                        </FormControl>
                    </Grid>
                    <Grid item xs={6}>
                        <FormControl sx={{ minWidth: "100%" }} size="small">
                            <TextField
                                fullWidth
                                id="outlined-name-input"
                                label={t("Age")}
                                type="number"
                                name="age"
                                size="small"
                                value={age}
                                onChange={(e) => onChangeAge(e)}
                            />
                        </FormControl>
                    </Grid>
                    <Grid item xs={12}>
                        <FormControl
                            fullWidth
                            variant="outlined"
                            sx={{ minWidth: "100%" }}
                            size="small"
                        >
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
                                renderValue={(selected) => (
                                    <Stack gap={1} direction="row" flexWrap="wrap">
                                        {selected.map((value) => {
                                            let foundTask = null;
                                            listTasks.forEach((task) => {
                                                const selectedTask = listTasks.find(
                                                    (task) => task.id === String(value)
                                                );
                                                if (selectedTask) {
                                                    foundTask = selectedTask;
                                                }
                                            });
                                            return (
                                                <Chip
                                                    key={value}
                                                    label={foundTask ? foundTask.task_name : ""}
                                                    onDelete={() =>
                                                        setlistSelectedTasks(
                                                            listSelectedTasks.filter((item) => item !== value)
                                                        )
                                                    }
                                                    deleteIcon={
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
                                <MenuItem>
                                    <Checkbox
                                        checked={listSelectedTasks.length === listTasks.length}
                                        onChange={handleSelectAllTasks}
                                    />
                                    <ListItemText primary={t("Select All")} />
                                </MenuItem>
                                {listTasks && listTasks.map((item) => renderSelectGroup(item))}
                            </Select>
                        </FormControl>
                    </Grid>
                    <Grid item xs={6}>
                        <BasicDatePicker
                            disabled={loading}
                            className="graph_date_input"
                            label={t("start date")}
                            value={StartDate}
                            name={"StartDate"}
                            maxDate={today}
                            minDate={dayjs("2017-04-01")}
                            onChange={(e) => onChange(e)}
                        />
                    </Grid>
                    <Grid item xs={6}>
                        <BasicDatePicker
                            disabled={loading}
                            className="graph_date_input"
                            label={t("end date")}
                            maxDate={today}
                            value={EndDate}
                            name={"EndDate"}
                            minDate={dayjs("2017-04-01")}
                            onChange={(e) => onChange(e)}
                        />
                    </Grid>
                    <Grid item xs={6}>
                        <FormControl
                            sx={{ mt: 1, mb: 1 }}
                            size="small"
                            className="m-select col-sm-12 "
                        >
                            <InputLabel id="demo-select-index-label">{t("Index")}</InputLabel>
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
                                <MenuItem value="psri">{t("Plant Senescence Index")}</MenuItem>
                                <MenuItem value="ndmi">{t("Soil moisture index")}</MenuItem>
                            </Select>
                        </FormControl>
                    </Grid>
                    <Grid item container xs={6} spacing={2}>
                        <Grid item xs={3} container sx={{ alignItems: "center" }}>
                            <Typography id="input-slider" gutterBottom>
                                {t("Cloud percentage")}
                            </Typography>
                        </Grid>
                        <Grid item xs={9}>
                            <FormControl
                                sx={{ mt: 1, mb: 1 }}
                                size="small"
                                className="m-select col-sm-12 "
                            >
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
                            </FormControl>
                        </Grid>
                    </Grid>
                    <Grid item xs={12} container sx={{ justifyContent: "center" }}>
                        <LoadingButton
                            size="small"
                            color="primary"
                            type="submit"
                            loading={loading}
                            loadingPosition="start"
                            startIcon={<SaveIcon />}
                            variant="contained"
                        >
                            <span>{t("Process")}</span>
                        </LoadingButton>
                    </Grid>
                </Grid>
            </form>

            {datagraph && datagraph.length > 0 ? (
                <Grid item xs={12} sx={{ mb: "70px" }}>
                    <Graph vegetationIndex={index} data={datagraph} />
                </Grid>
            ) : (
                ""
            )}
            <Grid container spacing={2} sx={{ marginBottom: "20px" }}>
                <Grid item xs={12}>
                    <Typography variant="h5" component="h2">
                        {t("Pattern adding")}
                    </Typography>
                </Grid>
            </Grid>
            <form onSubmit={(e) => onSubmitPattern(e)}>
                <Grid container spacing={2}>
                    <Grid item xs={6}>
                        <FormControl sx={{ minWidth: "100%" }} size="small">
                            <InputLabel id="densitys-label">{t("Density")}</InputLabel>
                            <Select
                                label={t("Density")}
                                name={t("Density")}
                                labelId="densitys-label"
                                multiple
                                required
                                id="task-select-helper"
                                value={listSelectedDensity}
                                onChange={(e) => onChangeDensityP(e)}
                                renderValue={(selected) => (
                                    <Stack gap={1} direction="row" flexWrap="wrap">
                                        {selected.map((value) => {
                                            let foundDensity = null;
                                            listDensityP.forEach((density) => {
                                                const selectedDensity = listDensityP.find(
                                                    (density) => density.id === String(value)
                                                );
                                                if (selectedDensity) {
                                                    foundDensity = selectedDensity;
                                                }
                                            });
                                            return (
                                                <Chip
                                                    key={value}
                                                    label={
                                                        foundDensity
                                                            ? foundDensity[
                                                                `name_${currentLanguageCode.toLowerCase()}`
                                                                ]
                                                            : ""
                                                    }
                                                    onDelete={() =>
                                                        setlistSelectedDensity(
                                                            listSelectedDensity.filter(
                                                                (item) => item !== value
                                                            )
                                                        )
                                                    }
                                                    deleteIcon={
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
                                {listSelectedDensity && listDensityP ? (
                                    <MenuItem
                                        value="select-all"
                                        onClick={handleSelectAllDensity}
                                        sx={{ justifyContent: "space-between" }}
                                    >
                                        {listSelectedDensity.length === listDensityP.length
                                            ? t("Deselect All")
                                            : t("Select All")}
                                    </MenuItem>
                                ) : (
                                    ""
                                )}
                                {listDensityP &&
                                    listDensityP.map((item) => renderSelectGroupDensity(item))}
                            </Select>
                        </FormControl>
                    </Grid>
                    <Grid item xs={6}>
                        <FormControl sx={{ minWidth: "100%" }} size="small">
                            <InputLabel id="densitys-label">{t("Variety")}</InputLabel>
                            <Select
                                label={t("Variety")}
                                name={t("Variety")}
                                labelId="varietys-label"
                                multiple
                                required
                                id="task-select-helper"
                                value={listSelectedVariety}
                                onChange={(e) => onChangeVarietyP(e)}
                                renderValue={(selected) => (
                                    <Stack gap={1} direction="row" flexWrap="wrap">
                                        {selected.map((value) => {
                                            let foundVariety = null;
                                            listVarietyP.forEach((variety) => {
                                                const selectedVariety = listVarietyP.find(
                                                    (variety) => variety.id === String(value)
                                                );
                                                if (selectedVariety) {
                                                    foundVariety = selectedVariety;
                                                }
                                            });
                                            return (
                                                <Chip
                                                    key={value}
                                                    label={
                                                        foundVariety
                                                            ? foundVariety[
                                                                `name_${currentLanguageCode.toLowerCase()}`
                                                                ]
                                                            : ""
                                                    }
                                                    onDelete={() =>
                                                        setlistSelectedVariety(
                                                            listSelectedVariety.filter(
                                                                (item) => item !== value
                                                            )
                                                        )
                                                    }
                                                    deleteIcon={
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
                                {listSelectedVariety && listVarietyP ? (
                                    <MenuItem
                                        value="select-all"
                                        onClick={handleSelectAllVariety}
                                        sx={{ justifyContent: "space-between" }}
                                    >
                                        {listSelectedVariety.length === listVarietyP.length
                                            ? t("Deselect All")
                                            : t("Select All")}
                                    </MenuItem>
                                ) : (
                                    ""
                                )}
                                {listVarietyP &&
                                    listVarietyP.map((item) => renderSelectGroupVariety(item))}
                            </Select>
                        </FormControl>
                    </Grid>
                    <Grid item xs={6}>
                        <FormControl required sx={{ minWidth: "100%" }} size="small">
                            <InputLabel id="demo-select-small-label">{t("Field ")}</InputLabel>
                            <Select
                                labelId="demo-select-small-label"
                                id="demo-select-small"
                                value={taskPattern}
                                label="Task"
                                fullWidth
                                onChange={(e) => onChangeTaskPattern(e)}
                                name="taskPattern"
                                required
                            >
                                {listTasks &&
                                    listTasks.length > 0 &&
                                    listTasks.map((item) => (
                                        <MenuItem key={item.id} value={item.id}>
                                            {item.task_name}
                                        </MenuItem>
                                    ))}
                            </Select>
                        </FormControl>
                    </Grid>
                    <Grid item xs={6}>
                        <BasicDatePicker
                            disabled={loading}
                            className="graph_date_input"
                            label={t("start date")}
                            value={StartDateP}
                            name={"StartDateP"}
                            maxDate={today}
                            minDate={dayjs("2017-04-01")}
                            onChange={(e) => onChangePattern(e)}
                        />
                    </Grid>
                    <Grid item xs={6}>
                        <BasicDatePicker
                            disabled={loading}
                            className="graph_date_input"
                            label={t("end date")}
                            maxDate={today}
                            value={EndDateP}
                            name={"EndDateP"}
                            minDate={dayjs("2017-04-01")}
                            onChange={(e) => onChangePattern(e)}
                        />
                    </Grid>
                    <Grid item xs={12} container sx={{ justifyContent: "center" }}>
                        <LoadingButton
                            size="small"
                            color="primary"
                            type="submit"
                            loading={loadingP}
                            loadingPosition="start"
                            startIcon={<SaveIcon />}
                            variant="contained"
                        >
                            <span>{t("Save")}</span>
                        </LoadingButton>
                    </Grid>
                </Grid>
            </form>
        </Box>
    );
};

export default Compare;
