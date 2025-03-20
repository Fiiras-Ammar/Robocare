import React, {useEffect, useState, useCallback, useMemo} from 'react';
import {useDispatch, useSelector} from "react-redux";
import {useTranslation} from "react-i18next";
import {listProject} from "../../actions/project";
import {showSnackbar} from "../../actions/snackbar";
import {FormControl, IconButton, MenuItem, Select} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import {MdDashboard} from "react-icons/md";
import FolderOpenIcon from "@mui/icons-material/FolderOpen";
import {isMobile} from "react-device-detect";
import Language from "../../utils/Language";

const CompareSpatialTaskTopBar = () => {
    const userId = useSelector((state) => state.auth.user.id);
    const taskIdDetailsSpatialRight = useSelector((state) => state.mapReducer.taskIdDetailsSpatialRight);
    const [allTasks, setAllTasks] = useState([]);
    const [selectedTask, setSelectedTask] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const {t} = useTranslation();
    const dispatch = useDispatch();
    const fetchProjects = useCallback(async () => {
        if (!userId) return;
        setIsLoading(true);
        try {
            const response = await dispatch(listProject(userId));
            if (response.status === 200) {
                const modifiedData = response.data.data.map((item) => ({
                    ...item,
                    defaultExpanded: item.tasks.length > 0,
                }));
                const objects = modifiedData.flatMap((project) =>
                    project.tasks.map(task => ({
                        ...task,
                        project_name: project.project_name
                    }))
                );
                setAllTasks(objects);
                setSelectedTask(taskIdDetailsSpatialRight);
            } else {
                dispatch(showSnackbar("error", undefined, t("An error occurred when trying to fetch data, please try again!"), "top", "right"));
            }
        } catch (error) {
            console.error("Error fetching projects:", error);
            dispatch(showSnackbar("error", undefined, t("An error occurred when trying to fetch data, please try again!"), "top", "right"));
        } finally {
            setIsLoading(false);
        }
    }, [userId, dispatch, t, taskIdDetailsSpatialRight]);

    useEffect(() => {
        fetchProjects();
    }, [fetchProjects]);

    const handleTaskChange = useCallback((event) => {
        const newTaskId = event.target.value;
        setSelectedTask(newTaskId);
        window.location.href = `/task/detail/${newTaskId}/comparison/task/spatial`;
    }, []);

    const navigateTo = useCallback((path) => () => {
        window.location.href = path;
    }, []);

    const renderNavigationItem = useCallback((icon, label, path) => (
        <div
            style={{
                textDecoration: 'none',
                color: '#000',
                marginLeft: '15px',
                marginRight: '15px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center'
            }}
            onClick={navigateTo(path)}
            onMouseEnter={e => e.target.style.color = '#6f9d2f'}
            onMouseLeave={e => e.target.style.color = '#000'}
        >
            {icon}
            {label}
        </div>
    ), [navigateTo]);

    const navigationItems = useMemo(() => [
        {
            icon: <MdDashboard
                style={{marginRight: '8px', fontSize: isMobile ? '12px' : '', fontWeight: isMobile ? 'bold' : ''}}/>,
            label: <span
                style={{fontSize: isMobile ? '12px' : '', fontWeight: isMobile ? 'bold' : ''}}>{t('Dashboard')}</span>,
            path: '/dashboard'
        },
        {
            icon: <FolderOpenIcon
                style={{marginRight: '8px', fontSize: isMobile ? '14px' : '', fontWeight: isMobile ? 'bold' : ''}}/>,
            label: <span style={{fontSize: isMobile ? '12px' : '', fontWeight: isMobile ? 'bold' : ''}}>{t('Field')}</span>,
            path: '/dashboard/projects/list'
        }
    ], []);

    const renderDivider = useMemo(() => (
        <div style={{
            width: '1px',
            height: '50px',
            backgroundColor: '#d3d3d3',
            marginLeft: isMobile ? '0px' : '10px',
            marginRight: isMobile ? '0px' : '10px'
        }}/>
    ), []);

    return (
        <div style={{
            backgroundColor: '#ffffff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            width: '100%'
        }}>
            <div style={{display: 'flex', alignItems: 'center'}}>
                <IconButton
                    onClick={navigateTo(window.location.pathname.replace('/comparison/task/spatial', ''))}
                    sx={{
                        fontSize: '24px',
                        color: '#000',
                        '&:hover': {
                            color: '#6f9d2f',
                        },
                    }}
                >
                    <ArrowBackIcon/>
                </IconButton>
                {renderDivider}
                {isLoading ? (
                    <div className="d-flex align-items-center justify-content-center"
                         style={{
                             height: '56px',
                             paddingBottom: isMobile ? '0px' : '5px',
                             paddingLeft: isMobile ? '0px' : '5px'
                         }}>
                        <div className="text-center">
                            <div className="mt-2">
                                <span style={{
                                    fontSize: '15px',
                                    fontWeight: isMobile ? 'bold' : '',
                                    marginLeft: '5px',
                                    marginRight: '5px',
                                }}>{t('Loading ...')}</span>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div style={{display: 'flex', alignItems: 'center'}}>
                        <FormControl sx={{minWidth: isMobile ? '' : 300}}>
                            <Select
                                value={selectedTask}
                                onChange={handleTaskChange}
                                displayEmpty
                                inputProps={{'aria-label': 'Select task'}}
                                MenuProps={{
                                    PaperProps: {
                                        style: {
                                            maxHeight: 200,
                                        },
                                    },
                                }}
                                sx={{
                                    '& .MuiOutlinedInput-notchedOutline': {border: 'none'},
                                    '&:hover .MuiOutlinedInput-notchedOutline': {border: 'none'},
                                    '&.Mui-focused .MuiOutlinedInput-notchedOutline': {border: 'none'},
                                }}
                            >
                                {allTasks.map((task) => (
                                    <MenuItem key={task.id} value={task.id}>
                                        <div style={{
                                            display: 'flex',
                                            justifyContent: 'space-between',
                                            width: isMobile ? '10%' : "100%"
                                        }}>
                                            {!isMobile ? (
                                                <>
                                                    <span style={{
                                                        fontSize: 'inherit',
                                                        fontWeight: isMobile ? 'bold' : '',
                                                    }}>{task.task_name}</span>
                                                    <span style={{
                                                        color: '#666',
                                                        marginLeft: '10px'
                                                    }}>({task.project_name})</span>
                                                </>
                                            ) : (
                                                <span style={{fontSize: '12px', fontWeight: 'bold'}}>
                                                    {task.task_name.length > 15 ? `${task.task_name.slice(0, 15)}...` : task.task_name}
                                                </span>
                                            )}
                                        </div>
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                    </div>
                )}
                <div style={{display: 'flex', alignItems: 'center'}}>
                    {navigationItems.map((item, index) => (
                        <React.Fragment key={item.label}>
                            {renderDivider}
                            {renderNavigationItem(item.icon, item.label, item.path)}
                        </React.Fragment>
                    ))}
                </div>
            </div>
            {!isMobile && (
                <Language color="#6f9d2f" />
            )}

        </div>
    );
};

export default CompareSpatialTaskTopBar;
