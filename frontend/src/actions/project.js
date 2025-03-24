import axiosInstance from '../utils/axiosConfig.js';
import {
SELECTED_PROJECT_SUCCESS,
SELECTED_PROJECT_FAIL
} from '../utils/types.js';

export const addProject = (user, project_name ) => async dispatch => {
    const config = {
        headers: {
            'Content-Type': 'application/json'
        }
    }
    const body = JSON.stringify({ user, project_name });
    try {
        const res = await axiosInstance.post(`${process.env.REACT_APP_API_URL}/api/project/add/`, body, config);
        return res
    } catch (err) {
        return err
    }
}

export const check_staff = (user) => async dispatch => {
    const config = {
        headers: {
            'Content-Type': 'application/json',
            'Authorization': 'JWT ' + localStorage.getItem('access')
        }
    }
    try {
        const res = await axiosInstance.get(`${process.env.REACT_APP_API_URL}/auth/user/check-staff/${user}/`, config);
        return res
    } catch (err) {
        return err
    }
}

export const sum_clients = () => async dispatch => {
    const config = {
        headers: {
            'Content-Type': 'application/json',
            'Authorization': 'JWT ' + localStorage.getItem('access')
        }
    }
    try {
        const res = await axiosInstance.get(`${process.env.REACT_APP_API_URL}/auth/user/sum/`, config);
        return res
    } catch (err) {
        return err
    }
}

export const sum_area = () => async dispatch => {
    const config = {
        headers: {
            'Content-Type': 'application/json',
            'Authorization': 'JWT ' + localStorage.getItem('access')
        }
    }
    try {
        const res = await axiosInstance.get(`${process.env.REACT_APP_API_URL}/api/task/surface/sum/`, config);
        return res
    } catch (err) {
        return err
    }
}

export const sum_tasks = () => async dispatch => {
    const config = {
        headers: {
            'Content-Type': 'application/json',
            'Authorization': 'JWT ' + localStorage.getItem('access')
        }
    }
    try {
        const res = await axiosInstance.get(`${process.env.REACT_APP_API_URL}/api/task/sum/`, config);
        return res
    } catch (err) {
        return err
    }
}

export const getSensorList = () => async dispatch => {
    const config = {
        headers: {
            'Content-Type': 'application/json',
            'Authorization': 'JWT ' + localStorage.getItem('access')
        }
    }
    try {
        const res = await axiosInstance.get(`${process.env.REACT_APP_API_URL}/api/sensor/list/`, config);
        return res
    } catch (err) {
        return err
    }
}

export const sum_sensors = () => async dispatch => {
    const config = {
        headers: {
            'Content-Type': 'application/json',
            'Authorization': 'JWT ' + localStorage.getItem('access')
        }
    }
    try {
        const res = await axiosInstance.get(`${process.env.REACT_APP_API_URL}/api/sensor/sum/`, config);
        return res
    } catch (err) {
        return err
    }
}

export const listProject = (user) => async dispatch => {
    const config = {
        headers: {
            'Content-Type': 'application/json',
            'Authorization': 'JWT ' + localStorage.getItem('access')
        }
    }
    try {
        const res = await axiosInstance.get(`${process.env.REACT_APP_API_URL}/api/project/list/${user}/`, config);
        return res
    } catch (err) {
        return err
    }
}

export const listSensorData = () => async dispatch => {
    const config = {
        headers: {
            'Content-Type': 'application/json',
            'Authorization': 'JWT ' + localStorage.getItem('access')
        }
    }
    try {
        const res = await axiosInstance.get(`${process.env.REACT_APP_API_URL}/api/sensor-data/list`, config);
        return res
    } catch (err) {
        return err
    }
}

export const listSensorDataByTask = (taskId) => async dispatch => {
    const config = {
        headers: {
            'Content-Type': 'application/json',
            'Authorization': 'JWT ' + localStorage.getItem('access')
        }
    }
    try {
        const res = await axiosInstance.get(`${process.env.REACT_APP_API_URL}/api/sensor-data/list/${taskId}`, config);
        return res
    } catch (err) {
        return err
    }
}

export const getType = () => async dispatch => {
    const config = {
        headers: {
            'Content-Type': 'application/json'
        }
    }
    try {
        const res = await axiosInstance.get(`${process.env.REACT_APP_API_URL}/api/type/list/`, config);
        return res.data
    } catch (err) {
        return err
    }
}

export const getCulture = (lang='en') => async dispatch => {
    const config = {
        headers: {
            'Content-Type': 'application/json'
        }
    }
    try {
        const res = await axiosInstance.get(`${process.env.REACT_APP_API_URL}/api/culture/list/?lang=${lang}`, config);
        return res.data
    } catch (err) {
        return err
    }
}

export const getTexture = (lang='en') => async dispatch => {
    const config = {
        headers: {
            'Content-Type': 'application/json'
        }
    }
    try {
        const res = await axiosInstance.get(`${process.env.REACT_APP_API_URL}/api/texture/list/?lang=${lang}`, config);
        return res.data
    } catch (err) {
        return err
    }
}

export const getIrrigation = (lang='en') => async dispatch => {
    const config = {
        headers: {
            'Content-Type': 'application/json'
        }
    }
    try {
        const res = await axiosInstance.get(`${process.env.REACT_APP_API_URL}/api/irrigation/list/?lang=${lang}`, config);
        return res.data
    } catch (err) {
        return err
    }
}

export const getVariety = (id) => async dispatch => {
    const config = {
        headers: {
            'Content-Type': 'application/json'
        }
    }
    try {
        const res = await axiosInstance.get(`${process.env.REACT_APP_API_URL}/api/variety/list/${id}/`, config);
        return res.data
    } catch (err) {
        return err
    }
}

export const getVarietyAll = () => async dispatch => {
    const config = {
        headers: {
            'Content-Type': 'application/json'
        }
    }
    try {
        const res = await axiosInstance.get(`${process.env.REACT_APP_API_URL}/api/variety/list/`, config);
        return res.data
    } catch (err) {
        return err
    }
}

export const getDensity = (id) => async dispatch => {
    const config = {
        headers: {
            'Content-Type': 'application/json'
        }
    }
    try {
        const res = await axiosInstance.get(`${process.env.REACT_APP_API_URL}/api/density/list/${id}/`, config);
        return res.data
    } catch (err) {
        return err
    }
}

export const getDensityAll = () => async dispatch => {
    const config = {
        headers: {
            'Content-Type': 'application/json'
        }
    }
    try {
        const res = await axiosInstance.get(`${process.env.REACT_APP_API_URL}/api/density/list/`, config);
        return res.data
    } catch (err) {
        return err
    }
}

export const getTaskAge = (id_task) => async dispatch => {
    const config = {
        headers: {
            'Content-Type': 'application/json'
        }
    }
    try {
        const res = await axiosInstance.get(`${process.env.REACT_APP_API_URL}/api/task/age/get/${id_task}/`, config);
        return res.data
    } catch (err) {
        return err
    }
}
export const getCultureByCategory = (lang='en') => async dispatch => {
    const config = {
        headers: {
            'Content-Type': 'application/json'
        }
    }
    try {
        const res = await axiosInstance.get(`${process.env.REACT_APP_API_URL}/api/culture/list/with-categorie/?lang=${lang}`, config);

        return res.data
    } catch (err) {
        return err
    }
}


export const getNonTreeCultureIds = () => async dispatch => {
    const config = {
        headers: {
            'Content-Type': 'application/json'
        }
    }
    try {
        const res = await axiosInstance.get(`${process.env.REACT_APP_API_URL}/api/non-tree-cultures-ids/list`, config);
        return res.data
    } catch (err) {
        return err
    }
}
