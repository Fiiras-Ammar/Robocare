import axios from 'axios';
import {
    USER_NOTIFICATIONS_SUCCESS,
    USER_NOTIFICATIONS_FAIL,
    USER_NOTIFICATIONS_HEAD_SUCCESS,
    USER_NOTIFICATIONS_HEAD_FAIL
} from "../utils/types.js";

export const get_user_notifications_head = (id) => async dispatch => {

    const config = {
        headers: {
            'Content-Type': 'application/json'
        }
    }
    try {
        const res = await axios.get(`${process.env.REACT_APP_API_URL}/api/user/notifications/get/head/${id}/`, config);

        dispatch({
            type: USER_NOTIFICATIONS_HEAD_SUCCESS,
            payload: res.data
        })
        return res.data
    } catch (err) {
        dispatch({
            type: USER_NOTIFICATIONS_HEAD_FAIL
        })
        return err
    }
}
export const get_user_notifications = (id) => async dispatch => {

    const config = {
        headers: {
            'Content-Type': 'application/json'
        }
    }
    try {
        const res = await axios.get(`${process.env.REACT_APP_API_URL}/api/user/notifications/get/${id}/`, config);

        dispatch({
            type: USER_NOTIFICATIONS_SUCCESS,
            payload: res.data.tasks
        })
        return res
    } catch (err) {
        dispatch({
            type: USER_NOTIFICATIONS_FAIL
        })
        return err
    }
}

export const get_task_notifications = (id) => async dispatch => {

    const config = {
        headers: {
            'Content-Type': 'application/json'
        }
    }
    try {
        const res = await axios.get(`${process.env.REACT_APP_API_URL}/api/task/notifications/get/${id}/`, config);

        // dispatch({
        //     type: USER_NOTIFICATIONS_SUCCESS,
        //     payload: res.data.tasks
        // })
        return res
    } catch (err) {
        // dispatch({
        //     type: USER_NOTIFICATIONS_FAIL
        // })
        return err
    }
}


export const getTaskPatternAlerts = (user_id, task_id, limit) => async dispatch => {

    const config = {
        headers: {
            'Content-Type': 'application/json'
        }
    }
    try {
        const res = await axios.get(`${process.env.REACT_APP_API_URL}/api/task/pattern/alerts/list/${user_id}/${task_id}/${limit}/`, config);

        // dispatch({
        //     type: USER_NOTIFICATIONS_SUCCESS,
        //     payload: res.data.tasks
        // })
        return res
    } catch (err) {
        // dispatch({
        //     type: USER_NOTIFICATIONS_FAIL
        // })
        return err
    }
}


export const getTaskNdviForecastAlerts = (user_id, task_id, limit) => async dispatch => {

    const config = {
        headers: {
            'Content-Type': 'application/json'
        }
    }
    try {
        const res = await axios.get(`${process.env.REACT_APP_API_URL}/api/task/indexforecast/alerts/list/${user_id}/${task_id}/${limit}/`, config);

        // dispatch({
        //     type: USER_NOTIFICATIONS_SUCCESS,
        //     payload: res.data.tasks
        // })
        return res
    } catch (err) {
        // dispatch({
        //     type: USER_NOTIFICATIONS_FAIL
        // })
        return err
    }
}






export const getUserSensorHumidityNotifications = (id,limit) => async dispatch => {
    const config = {
        headers: {
            'Content-Type': 'application/json'
        }
    }
    try {
        const res = await axios.get(`${process.env.REACT_APP_API_URL}/api/user/notifications/humidity/${id}/${limit}/`, config);

        return res
    } catch (err) {
    }
}
export const getUserForcastNotifications = (id,limit) => async dispatch => {
    const config = {
        headers: {
            'Content-Type': 'application/json'
        }
    }
    try {
        const res = await axios.get(`${process.env.REACT_APP_API_URL}/api/user/indexforecast/alerts/list/${id}/${limit}/`, config);

        return res
    } catch (err) {
    }
}

export const getUserSensorBatteryNotifications = (id,limit) => async dispatch => {
    const config = {
        headers: {
            'Content-Type': 'application/json'
        }
    }
    try {
        const res = await axios.get(`${process.env.REACT_APP_API_URL}/api/user/notifications/sensor/battery/${id}/${limit}/`, config);
        return res
    } catch (err) {
        // dispatch({
        //     type: USER_NOTIFICATIONS_HEAD_FAIL
        // })
        return err
    }
}



export const alterNotificationState = (notifications_ids,user_id) => async dispatch => {
    const config = {
        headers: {
            'Content-Type': 'application/json'
        }
    }
    const body = JSON.stringify({
        notifications_ids,user_id
    })
    try {
        const res = await axios.patch(`${process.env.REACT_APP_API_URL}/api/user/notifications/humidity/state/`,body, config);

        
        return res
    } catch (err) {
        dispatch({
            type: USER_NOTIFICATIONS_HEAD_FAIL
        })
        return err
    }
    return 0
}


export const getUserPatternNotifications = (id,limit) => async dispatch => {
    const config = {
        headers: {
            'Content-Type': 'application/json'
        }
    }
    try {
        const res = await axios.get(`${process.env.REACT_APP_API_URL}/api/user/pattern/alerts/list/${id}/${limit}/`, config);

        return res
    } catch (err) {
    }
}

export const getSelfTaskPatternAlerts = (user_id, task_id, limit) => async dispatch => {

    const config = {
        headers: {
            'Content-Type': 'application/json'
        }
    }
    try {
        const res = await axios.get(`${process.env.REACT_APP_API_URL}/api/task/self/pattern/alerts/list/${user_id}/${task_id}/${limit}/`, config);

        // dispatch({
        //     type: USER_NOTIFICATIONS_SUCCESS,
        //     payload: res.data.tasks
        // })
        return res
    } catch (err) {
        // dispatch({
        //     type: USER_NOTIFICATIONS_FAIL
        // })
        return err
    }
}

