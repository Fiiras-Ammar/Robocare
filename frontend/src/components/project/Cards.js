import React, { useEffect, useMemo, useState } from "react";

import { CardContent, Box, Grid, Pagination } from "@mui/material";
import InputLabel from "@mui/material/InputLabel";
import MenuItem from "@mui/material/MenuItem";
import FormControl from "@mui/material/FormControl";
import Select from "@mui/material/Select";
import Typography from "@mui/material/Typography";
import "../../assets/scss/cards.scss";
import "../../assets/css/card.css";

import ImgMediaCard from "./ImgMediaCard";
import CustomButton from "../CustomButton";
import { useTranslation } from "react-i18next";
import { useDispatch, useSelector } from "react-redux";
import { IoIosAdd } from "react-icons/io";
import AddProject from "./add";
import AddTaskPopup from "../task/addPopup";
import { showSnackbar } from "../../actions/snackbar";
import { FaUsers } from "react-icons/fa";
import { PiPolygonDuotone } from "react-icons/pi";
import { MdSensors } from "react-icons/md";
import { VscGraph } from "react-icons/vsc";
import CountUp from "react-countup";
import "react-data-table-component-extensions/dist/index.css";
import { Card } from "react-bootstrap";
import { SELECTED_PROJECT_SUCCESS } from "../../utils/types";

import {
    check_staff,
    listProject,
    sum_area,
    sum_clients,
    sum_sensors,
    sum_tasks,
} from "../../actions/project";
import {TasksList} from "../../actions/calendar";
import {useNavigate} from "react-router-dom";

const Cards = ({}) => {
    const [projects, setProjects] = useState([]);
    const [allTasksList, setAllTasksList] = useState([]);
    const navigate = useNavigate();

    const [tasks, setTasks] = useState([]);
    const [allTasks, setAllTasks] = useState([]);

    const [loading, setLoading] = useState(true);

    const dispatch = useDispatch();

    const { t } = useTranslation();

    const user = useSelector((state) => state.auth.user);
    const userId = user?.id;
    const selectedProject = useSelector(
        (state) => state.selectedProjectReducer.projectIndex
    );

    const [isStaff, setisStaff] = useState(0);

    const [sumClients, setsumClients] = useState(null);
    const [sumClientsPercent, setsumClientsPercent] = useState(null);

    const [sumArea, setsumArea] = useState(null);
    const [sumAreaPercent, setsumAreaPercent] = useState(null);

    const [sumSernsor, setsumSernsor] = useState(null);
    const [sumSernsorPercent, setsumSernsorPercent] = useState(null);

    const [sumTask, setsumTask] = useState(null);
    const [sumTaskPercent, setsumTaskPercent] = useState(null);

    const [addModalOpen, setAddModalOpen] = useState(false);
    const [modalOpenAddTask, setmodalOpenAddTask] = useState(false);

    const [projectPagination, setProjectPagination] = useState({});
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(5);

    useEffect(() => {
        if (!user || !userId) return;
        
        dispatch(check_staff(userId)).then((response) => {
            if (response.status == 200) {
                setisStaff(response.data["staff"]);
            }
        });
        dispatch(listProject(userId)).then((response) => {
            if (response.status === 200) {
                const modifiedData = response.data.data.map((item, index) => ({
                    ...item,
                    defaultExpanded: item.tasks.length > 0,
                }));
                const timeout = setTimeout(() => {
                    setProjects(modifiedData);

                    let objects = [];

                    modifiedData.forEach((element) => {
                        if (element.tasks.length > 0) {
                            objects = [...objects, ...element.tasks];
                        }
                    });
                    setAllTasks(objects);
                    setTasks(objects);
                    setLoading(false);
                }, 3000);

                return () => clearTimeout(timeout);
            } else {
                dispatch(
                    showSnackbar(
                        "error",
                        undefined,
                        t(
                            "An error was occured when trying to fetch data, please try again !"
                        ),
                        "top",
                        "right"
                    )
                );
            }
        });
        dispatch(TasksList()).then((response) => {
            setAllTasksList(response)
        });

    }, [user, userId, dispatch, t]);

    useEffect(() => {
        if (!isStaff) return;
        dispatch(sum_clients()).then((response) => {
            setsumClients(response.data.data["users"]);
            setsumClientsPercent(response.data.data["last_month"]);
        });
    }, [isStaff, dispatch]);

    useEffect(() => {
        if (!isStaff) return;
        dispatch(sum_area()).then((response) => {
            setsumArea(response.data.data["total_surface"]);
            setsumAreaPercent(response.data.data["last_month_surface"]);
        });
    }, [isStaff, dispatch]);

    useEffect(() => {
        if (!isStaff) return;
        dispatch(sum_sensors()).then((response) => {
            setsumSernsor(response.data.data["total_sensor"]);
            setsumSernsorPercent(response.data.data["last_month_sensor"]);
        });
    }, [isStaff, dispatch]);

    useEffect(() => {
        if (!isStaff) return;
        dispatch(sum_tasks()).then((response) => {
            setsumTask(response.data.data["total_task"]);
            setsumTaskPercent(response.data.data["last_month"]);
        });
    }, [isStaff, dispatch]);

    useEffect(() => {
        if (projects.length === 0) return;
        if (selectedProject >= 0) {
            const project = projects[selectedProject];
            setTasks(project.tasks);
        } else {
            setTasks(allTasks);
        }
    }, [projects, selectedProject, allTasks]);

    useEffect(() => {
        const initialPagination = {};
        projects.forEach((project) => {
            initialPagination[project.id] = { currentPage: 1, itemsPerPage: 5 };
        });
        setProjectPagination(initialPagination);
    }, [projects]);

    const handleOpenAddModal = () => {
        setAddModalOpen(true);
    };

    const handleCloseAddModal = () => {
        setAddModalOpen(false);
    };

    const handleOpenAddTaskModal = () => {
        setmodalOpenAddTask(true);
    };

    const handleCloseAddTaskModal = () => {
        setmodalOpenAddTask(false);
    };

    const handleChange = (e) => {
        const value = parseInt(e.target.value);
        if (value >= 0) {
            const project = projects[value];
            setTasks(project.tasks);
        } else {
            setTasks(allTasks);
        }
        dispatch({
            type: SELECTED_PROJECT_SUCCESS,
            payload: e.target.value,
        });
    };

    const handleSelectField = (e) => {
        const selectedId = e.target.value;
        if (selectedId !== "-1") {
            navigate(`/task/detail/${selectedId}`);
        } else {
            console.log("No project selected");
        }
    };

    const handleTasksToShowChange = (e) => {
        const value = parseInt(e.target.value);
        setItemsPerPage(value);
        setCurrentPage(1);
    };

    const handleProjectTaskPageChange = (projectId, newPage) => {
        setProjectPagination((prev) => ({
            ...prev,
            [projectId]: { ...prev[projectId], currentPage: newPage },
        }));
    };

    const handlePageChange = (event, value) => {
        setCurrentPage(value);
    };

    const projectsToShow = useMemo(() => {
        return selectedProject >= 0
            ? [projects[selectedProject]]
            : projects.filter(
                (project) => project && project.tasks && project.tasks.length > 0
            );
    }, [projects, selectedProject]);

    const memoizedProjects = useMemo(() => {
        const filteredProjects =
            selectedProject >= 0 ? [projects[selectedProject]] : projects;

        return filteredProjects
            .filter((project) => project && project.tasks && project.tasks.length > 0)
            .slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)
            .map((project) => {
                const { currentPage } = projectPagination[project.id] || {
                    currentPage: 1,
                };
                return {
                    ...project,
                    currentPage,
                };
            });
    }, [projects, selectedProject, currentPage, itemsPerPage, projectPagination]);

    return (
        <Box sx={{ flexGrow: 1, m: 2 }}>
            {isStaff ? (
                <>
                    <Grid container spacing={2}>
                        <Grid item xs={12} sm={3}>
                            <div className="card card-stats mb-4 mb-xl-0">
                                <div className="card-body">
                                    <div className="row">
                                        <div className="col">
                                            <h5
                                                className="card-title text-uppercase text-muted mb-0"
                                                style={{ fontSize: "14px", fontWeight: "bold" }}
                                            >
                                                {t("Customers")}
                                            </h5>
                                            <span className="h5 font-weight-bold mb-0">
                        <CountUp end={sumClients} />
                      </span>
                                        </div>
                                        <div className="col-auto">
                                            <div className="icon icon-shape bg-danger text-white rounded-circle shadow">
                                                <FaUsers className="stat-icon" />
                                            </div>
                                        </div>
                                    </div>
                                    <p className="mt-3 mb-0 text-muted text-sm">
                    <span className="text-success mr-2">
                      <i className="fa fa-arrow-up"></i>
                      <CountUp decimals={3} end={sumClientsPercent} />%
                    </span>
                                        <span className="text-nowrap">{t("Since last month")}</span>
                                    </p>
                                </div>
                            </div>
                        </Grid>
                        <Grid item xs={12} sm={3}>
                            <div className="card card-stats mb-4 mb-xl-0">
                                <div className="card-body">
                                    <div className="row">
                                        <div className="col">
                                            <h5
                                                className="card-title text-uppercase text-muted mb-0"
                                                style={{ fontSize: "14px", fontWeight: "bold" }}
                                            >
                                                {t("Inspected area")}
                                            </h5>
                                            <span className="h5 font-weight-bold mb-0">
                        <CountUp end={sumArea} decimals={3} /> Ha
                      </span>
                                        </div>
                                        <div className="col-auto">
                                            <div className="icon icon-shape bg-warning text-white rounded-circle shadow">
                                                <PiPolygonDuotone className="stat-icon" />
                                            </div>
                                        </div>
                                    </div>
                                    <p className="mt-3 mb-0 text-muted text-sm">
                    <span className="text-danger mr-2">
                      <i className="fas fa-arrow-down"></i>
                      <CountUp decimals={3} end={sumAreaPercent} />%
                    </span>
                                        <span className="text-nowrap">{t("Since last month")}</span>
                                    </p>
                                </div>
                            </div>
                        </Grid>
                        <Grid item xs={12} sm={3}>
                            <div className="card card-stats mb-4 mb-xl-0">
                                <div className="card-body">
                                    <div className="row">
                                        <div className="col">
                                            <h5
                                                className="card-title text-uppercase text-muted mb-0"
                                                style={{ fontSize: "14px", fontWeight: "bold" }}
                                            >
                                                {t("Tasks")}
                                            </h5>
                                            <span className="h5 font-weight-bold mb-0">
                        <CountUp end={sumTask} />
                      </span>
                                        </div>
                                        <div className="col-auto">
                                            <div className="icon icon-shape bg-yellow text-white rounded-circle shadow">
                                                <VscGraph className="stat-icon" />
                                            </div>
                                        </div>
                                    </div>
                                    <p className="mt-3 mb-0 text-muted text-sm">
                    <span className="text-warning mr-2">
                      <i className="fas fa-arrow-down"></i>{" "}
                        <CountUp decimals={3} end={sumTaskPercent} />%
                    </span>
                                        <span className="text-nowrap">{t("Since last month")}</span>
                                    </p>
                                </div>
                            </div>
                        </Grid>
                        <Grid item xs={12} sm={3}>
                            <div className="card card-stats mb-4 mb-xl-0">
                                <div className="card-body">
                                    <div className="row">
                                        <div className="col">
                                            <h6
                                                className="card-title text-uppercase text-muted mb-0"
                                                style={{ fontSize: "14px", fontWeight: "bold" }}
                                            >
                                                {t("Sensors")}
                                            </h6>
                                            <span className="h5 font-weight-bold mb-0">
                        <CountUp end={sumSernsor} />
                      </span>
                                        </div>
                                        <div className="col-auto">
                                            <div className="icon icon-shape bg-info text-white rounded-circle shadow">
                                                <MdSensors className="stat-icon" />
                                            </div>
                                        </div>
                                    </div>
                                    <p className="mt-3 mb-0 text-muted text-sm">
                    <span className="text-success mr-2">
                      <i className="fas fa-arrow-up"></i>{" "}
                        <CountUp decimals={3} end={sumSernsorPercent} />%
                    </span>
                                        <span className="text-nowrap">{t("Since last month")}</span>
                                    </p>
                                </div>
                            </div>
                        </Grid>
                    </Grid>
                </>
            ) : (
                ""
            )}
            <Grid container spacing={2} sx={{ pt: 2 }}>
                <Grid item xs={12}>
                    <div className="intro-text">
                        <h2>{t("Projects and Fields Management")}</h2>
                    </div>
                </Grid>
                <Grid item container spacing={2} xs={12}>
                    <Grid item xs={12} sm={2}>
                        <FormControl
                            required
                            size="small"
                            color="IconColor"
                            fullWidth={true}
                        >
                            <InputLabel id="demo-select-project-label">
                                {t("Project")}
                            </InputLabel>
                            <Select
                                labelId="demo-select-project-label"
                                id="demo-select-project"
                                label="Project"
                                value={selectedProject.toString()}
                                fullWidth
                                onChange={handleChange}
                                name="project"
                                required
                            >
                                <MenuItem value="-1">
                                    <em>{t("All Projects")}</em>
                                </MenuItem>
                                {projects.map((item, index) => (
                                    <MenuItem key={item.id} value={index.toString()}>
                                        {item.project_name} ({item.tasks.length} {t("tasks")})
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                    </Grid>
                    {isStaff ? (
                        <Grid item xs={12} sm={2}>
                            <FormControl
                                required
                                size="small"
                                color="IconColor"
                                fullWidth={true}
                            >
                                <InputLabel id="demo-select-field-label">
                                    {t("Fields")}
                                </InputLabel>
                                <Select
                                    labelId="demo-select-field-label"
                                    id="demo-select-field"
                                    label="Field"
                                    value={""}
                                    fullWidth
                                    name="field"
                                    required
                                    onChange={handleSelectField}
                                >
                                    <MenuItem value="-1">
                                        <em>{t("Select Field")}</em>
                                    </MenuItem>
                                    {allTasksList.map((item) => (
                                        <MenuItem key={item.id} value={item.id.toString()}>
                                            {item.task_name} ({item.project.project_name})
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        </Grid>
                    ) : ""}


                    <Grid item xs={12} sm={3}>
                        <CustomButton
                            fullWidth={true}
                            color="IconColor"
                            size="small"
                            startIcon={<IoIosAdd />}
                            onClick={handleOpenAddModal}
                        >
                            {t("Create project")}
                        </CustomButton>
                    </Grid>
                    <Grid item xs={12} sm={3}>
                        <CustomButton
                            fullWidth={true}
                            color="IconColor"
                            size="small"
                            startIcon={<IoIosAdd />}
                            onClick={handleOpenAddTaskModal}
                        >
                            {t("Create Field")}
                        </CustomButton>
                    </Grid>
                </Grid>


                {selectedProject === -1 && (
                    <Grid
                        item
                        container
                        spacing={2}
                        xs={12}
                        justifyContent="space-between"
                        alignItems="center"
                    >
                        <Grid item xs={12} sm={2}>
                            <FormControl
                                required
                                size="small"
                                color="IconColor"
                                fullWidth={true}
                            >
                                <InputLabel id="tasks-to-show-label">
                                    {t("Projects to show")}
                                </InputLabel>
                                <Select
                                    labelId="tasks-to-show-label"
                                    id="tasks-to-show"
                                    value={itemsPerPage}
                                    label={t("Projects to show")}
                                    onChange={handleTasksToShowChange}
                                >
                                    <MenuItem value={5}>5</MenuItem>
                                    <MenuItem value={10}>10</MenuItem>
                                    <MenuItem value={15}>15</MenuItem>
                                    <MenuItem value={20}>20</MenuItem>
                                    <MenuItem value={25}>25</MenuItem>
                                    <MenuItem value={-1}>{t("All")}</MenuItem>
                                </Select>
                            </FormControl>
                        </Grid>

                        {selectedProject === -1 && itemsPerPage !== -1 && (
                            <Grid item>
                                <Pagination
                                    count={Math.ceil(
                                        projects.filter((project) => project.tasks.length > 0)
                                            .length / itemsPerPage
                                    )}
                                    page={currentPage}
                                    onChange={handlePageChange}
                                    showFirstButton
                                    showLastButton
                                    color="primary"
                                    sx={{ mt: 2, display: "flex", justifyContent: "right" }}
                                />
                            </Grid>
                        )}
                    </Grid>
                )}
            </Grid>
            <Grid container spacing={2} sx={{ pt: 2, flexGrow: 1 }}>
                {loading ? (
                    <Grid item xs={12}>
                        {t("Loading...")}

                    </Grid>
                ) : projectsToShow.length > 0 ? (
                    <>
                        {memoizedProjects.map((project) => (
                            <Grid item xs={12} key={`project-container-${project.id}`}>
                                <Card>
                                    <CardContent>
                                        <Typography variant="h5" component="div">
                                            {project.project_name} ({project.tasks.length} {t("tasks")} / {project.surface} {t("Ha")})
                                        </Typography>
                                        <Grid container spacing={2}>
                                            {project.tasks.slice(
                                                (project.currentPage - 1) * 8,
                                                project.currentPage * 8
                                            ).map((task) => (
                                                <Grid
                                                    item
                                                    xs={12}
                                                    sm={6}
                                                    md={3}
                                                    key={`task-container-${project.id}-${task.id}`}
                                                >
                                                    <ImgMediaCard
                                                        element={task}
                                                        key={`task-${project.id}-${task.id}`}
                                                    />
                                                </Grid>
                                            ))}
                                        </Grid>

                                        <Pagination
                                            count={Math.ceil(project.tasks.length / 8)}
                                            page={project.currentPage}
                                            onChange={(event, value) =>
                                                handleProjectTaskPageChange(project.id, value)
                                            }
                                            sx={{ mt: 2, display: "flex", justifyContent: "center" }}
                                        />
                                    </CardContent>
                                </Card>
                            </Grid>
                        ))}
                        {selectedProject === -1 && itemsPerPage !== -1 && (
                            <Grid item xs={12}>
                                <Pagination
                                    count={Math.ceil(
                                        projects.filter((project) => project.tasks.length > 0)
                                            .length / itemsPerPage
                                    )}
                                    page={currentPage}
                                    onChange={handlePageChange}
                                    showFirstButton
                                    showLastButton
                                    color="primary"
                                    sx={{ mt: 2, display: "flex", justifyContent: "right" }}
                                />
                            </Grid>
                        )}
                    </>
                ) : (
                    <Grid item xs={12}>
                        <Typography variant="body1">
                            No projects with tasks to display.
                        </Typography>
                    </Grid>
                )}
            </Grid>
            <AddProject open={addModalOpen} handleClose={handleCloseAddModal} />
            <AddTaskPopup
                open={modalOpenAddTask}
                projects={projects}
                handleClose={handleCloseAddTaskModal}
            />
        </Box>
    );
};
export default Cards;
