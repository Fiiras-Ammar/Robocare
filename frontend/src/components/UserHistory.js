import { Container } from "@mui/material";
import '../../src/assets/scss/user.scss';
import dashBackground from '../../src/assets/images/dash-background.png'

import { FormControl, TextField } from "@mui/material";
import React, { useEffect, useState } from "react";
import CustomButton from './CustomButton';
import { GetUserHistory, GetUserHistoryStatistics, GetSingleUser } from '../actions/user';
import { useDispatch } from 'react-redux';
import { useNavigate } from "react-router-dom";
import { showSnackbar } from "../actions/snackbar";
import { useTranslation } from 'react-i18next';
import { useParams } from "react-router-dom";
import LoadingData from '../utils/loadingdata';
import DataTable from 'react-data-table-component'
import DataTableExtensions from "react-data-table-component-extensions";
import { FaClock, FaLock, FaHandPointUp } from "react-icons/fa";
import Moment from 'moment';
import dayjs from 'dayjs';
import { getPieRandomColor } from "../utils/backgroundColors";
import { Pie } from 'react-chartjs-2';



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


import { Line } from 'react-chartjs-2';
const UserHistory = () => {

    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { t } = useTranslation();
    const [allHistory, setAllHistory] = useState([])
    const [historyStats, setHistoryStats] = useState({})
    let { id_user } = useParams();
    const [pending, setPending] = useState(true)

    const [actionsPerDay, setActionsPerDay] = useState({})
    const [loginPerDay, setLoginPerDay] = useState({})
    const [data, setData] = useState({})
    const [tasks, setTasks] = useState({})


    const [user, setUser] = useState({})


    const columns = [
        {
            name: 'Time',
            selector: row => row.date_of_request,
        },
        {
            name: 'Label',
            selector: row => row.label,
        },
        {
            name: 'Duration',
            selector: row => row.duration,
        },
    ]

    const tableData = {
        columns,
        data: allHistory,
        print: false,
        exportHeaders: true,
    };

    useEffect(() => {

        console.clear();

        dispatch(GetSingleUser(id_user)).then(response => {
            if (response.status === 200) {
                setUser(response.data.data)
            }
        }
        );

        dispatch(GetUserHistory(id_user)).then(response => {
            if (response.status === 200) {
                setPending(false)
                setAllHistory(response.data.data)
            }
        });

        dispatch(GetUserHistoryStatistics(id_user)).then(response => {
            if (response.status === 200) {
                setHistoryStats(response.data)

                let actionsPerDayLabels = []
                let actionsPerDayValues = []
                let actions_count = response.data.actions_per_day.length;

                for (let i = 0; i < actions_count; ++i) {
                    actionsPerDayLabels.push(dayjs(response.data.actions_per_day[i].day).format("DD-MM-YYYY"));
                    actionsPerDayValues.push(response.data.actions_per_day[i].count);
                }

                const actions = {
                    labels: actionsPerDayLabels,
                    datasets: [
                        {
                            label: 'Actions per day',
                            data: actionsPerDayValues,
                            borderColor: 'rgb(53, 162, 235)',
                            fill: false,
                            cubicInterpolationMode: 'monotone',
                            tension: 0.4
                        },
                    ]
                };


                setActionsPerDay(actions);

                let loginPerDayLabels = []
                let loginPerDayValues = []
                let login_count = response.data.sign_in_per_day.length;


                for (let i = 0; i < login_count; ++i) {

                    loginPerDayLabels.push(dayjs(response.data.sign_in_per_day[i].day).format("DD-MM-YYYY"));
                    loginPerDayValues.push(response.data.sign_in_per_day[i].sum);
                }

                const logins = {
                    labels: loginPerDayLabels,
                    datasets: [
                        {
                            label: 'Logins duration per day',
                            data: loginPerDayValues,
                            borderColor: 'rgb(53, 162, 235)',
                            fill: false,
                            cubicInterpolationMode: 'monotone',
                            tension: 0.4
                        },
                    ]
                };

                setLoginPerDay(logins);


                let countActionsPerDayLabels = []
                let countActionsPerDayValues = []
                let data_count = response.data.data.length;
                let usedColors = [];
                let colors = []
                for (let i = 0; i < data_count; ++i) {
                    countActionsPerDayLabels.push(response.data.data[i].label)
                    countActionsPerDayValues.push(response.data.data[i].sum);
                    colors.push(getPieRandomColor(usedColors))
                }
                const data = {
                    labels: countActionsPerDayLabels,
                    datasets: [
                        {
                            data: countActionsPerDayValues,
                            backgroundColor: colors
                        }]
                }

                setData(data);


                let tasksLabels = []
                let tasksValues = []
                let tasks_count = response.data.task_stats.length;
                let tasksUsedColors = [];
                let tasksColors = []
                for (let i = 0; i < tasks_count; ++i) {
                    tasksLabels.push(response.data.task_stats[i].name)
                    tasksValues.push(response.data.task_stats[i].sum);
                    tasksColors.push(getPieRandomColor(tasksUsedColors))
                }
                const taskData = {
                    labels: tasksLabels,
                    datasets: [
                        {
                            data: tasksValues,
                            backgroundColor: tasksColors
                        }]
                }

                setTasks(taskData);

            }
        });
    }, []);

    return (
        <Container>
            <div className="mod-user-history">
                <div className="m-wrapper">


                    <div className="m-content row">

                        <div className="m-left col-12 col-lg-4">

                            <div className="m-image col-12">
                                <img src={dashBackground} className="w-100" />


                                <div className="m-headline">
                                    <h2>User History</h2><br />
                                    {user.firstname ? (
                                        <h3>{user.firstname + ' ' + user.lastname}</h3>
                                    ) : ''}
                                </div>

                            </div>


                            <div className="m-element col-12 card card-stats mb-4 mb-xl-0">
                                <div className="card-body">
                                    <div className="row">
                                        <div className="col">
                                            <h5 className="card-title text-uppercase text-muted mb-0">
                                                Last Login
                                            </h5>
                                            <span className="h5 font-weight-bold mb-0">

                                            </span>
                                        </div>
                                        <div className="col-auto">
                                            <div className="icon icon-shape bg-danger text-white rounded-circle shadow">
                                                <FaClock className="stat-icon" />
                                            </div>
                                        </div>
                                    </div>
                                    <p className="mt-3 mb-0 text-muted text-sm">
                                        <span className="text-success mr-2">
                                            <i className="fa fa-time"></i>
                                            {historyStats.last_login_date}
                                        </span>
                                        <span className="text-nowrap">
                                            {historyStats.duration}

                                        </span>
                                    </p>
                                </div>
                            </div>


                            <div className="m-element col-12 card card-stats mb-4 mb-xl-0">
                                <div className="card-body">
                                    <div className="row">
                                        <div className="col">
                                            <h5 className="card-title text-uppercase text-muted mb-0">
                                                Last Session Duration
                                            </h5>
                                            <span className="h5 font-weight-bold mb-0">

                                            </span>
                                        </div>
                                        <div className="col-auto">
                                            <div className="icon icon-shape bg-danger text-white rounded-circle shadow">
                                                <FaLock className="stat-icon" />
                                            </div>
                                        </div>
                                    </div>
                                    <p className="mt-3 mb-0 text-muted text-sm">
                                        <span className="text-success mr-2">
                                            <i className="fa fa-time"></i>
                                            {historyStats.last_login_duration}
                                        </span>
                                        <span className="text-nowrap">
                                            minutes
                                        </span>
                                    </p>
                                </div>
                            </div>

                            <div className="m-element col-12 card card-stats mb-4 mb-xl-0">
                                <div className="card-body">
                                    <div className="row">
                                        <div className="col">
                                            <h5 className="card-title text-uppercase text-muted mb-0">
                                                Total tracked Action
                                            </h5>
                                            <span className="h5 font-weight-bold mb-0">

                                            </span>
                                        </div>
                                        <div className="col-auto">
                                            <div className="icon icon-shape bg-danger text-white rounded-circle shadow">
                                                <FaHandPointUp className="stat-icon" />
                                            </div>
                                        </div>
                                    </div>
                                    <p className="mt-3 mb-0 text-muted text-sm">
                                        <span className="text-success mr-2">
                                            <i className="fa fa-time"></i>
                                            {allHistory.length}
                                        </span>
                                        <span className="text-nowrap">
                                            action
                                        </span>
                                    </p>
                                </div>
                            </div>


                        </div>
                        <div className="m-right col-12 col-lg-8">


                            <h3>All Actions</h3>
                            <DataTableExtensions {...tableData}>
                                <DataTable
                                    columns={columns}
                                    data={allHistory}
                                    pagination
                                    paginationPerPage="10"
                                    paginationRowsPerPageOptions={[10, 15, 20, 30, 50, 100]}
                                    progressPending={pending}
                                    highlightOnHover
                                    progressComponent={<LoadingData />}

                                />
                            </DataTableExtensions>

                        </div>

                        <div className="m-line row gap-2 justify-content-between">

                            <div className="m-element col-12 col-lg-5">

                                {actionsPerDay.labels && actionsPerDay.labels.length > 0 ? (
                                    <Line data={actionsPerDay} />
                                ) : ''}

                            </div>

                            <div className="m-element col-12 col-lg-5 ">

                                {loginPerDay.labels && loginPerDay.labels.length > 0 ? (
                                    <Line data={loginPerDay} />
                                ) : ''}

                            </div>

                        </div>

                        <div className="m-line row gap-1 justify-content-between">

                            <div className="m-element col-12 col-lg-4">

                                <p><b>All Actions </b></p>
                                {data.labels && data.labels.length > 0 ? (
                                    <Pie data={data} />
                                ) : ''}

                            </div>

                            <div className="m-element col-12 col-lg-4">

                                <p><b>All Tasks Actions </b></p>
                                {tasks.labels && tasks.labels.length > 0 ? (
                                    <Pie data={tasks} />
                                ) : ''}

                            </div>

                        </div>
                    </div>
                </div>
            </div>
        </Container >
    );

}


export default UserHistory