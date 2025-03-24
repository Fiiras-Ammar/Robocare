
import axiosInstance from "../utils/axiosConfig.js";
import {
    DETAIL_TASK_FAIL,
    ADD_EVENT_SUCCESS,
    ADD_EVENT_FAIL,
    INSECT_LIST_FAIL,
    INSECT_LIST_SUCESS,
    PRODUCT_LIST_FAIL,
    PRODUCT_LIST_SUCCESS,
    DELETE_EVENT_SUCCESS,
    DELETE_EVENT_FAIL,
} from "../utils/types.js";

export const Detail_Task_Simple = (id) => async dispatch => {

    const config = {
        headers: {
            'Content-Type': 'application/json'
        }
    }
    try {
        const res = await axiosInstance.get(`${process.env.REACT_APP_API_URL}/api/task/details-simple/${id}/`, config);

        return res.data.data
    } catch (err) {
        dispatch({
            type: DETAIL_TASK_FAIL
        })
        return err
    }
}

export const Task_Events = (id) => async dispatch => {

    const config = {
        headers: {
            'Content-Type': 'application/json'
        }
    }
    try {
        const res = await axiosInstance.get(`${process.env.REACT_APP_API_URL}/api/events/${id}/`, config);


        return res.data.data
    } catch (err) {
        dispatch({
            type: DETAIL_TASK_FAIL
        })
        return err
    }
}
export const Task_User_Events = (id) => async dispatch => {

    const config = {
        headers: {
            'Content-Type': 'application/json'
        }
    }
    try {
        const res = await axiosInstance.get(`${process.env.REACT_APP_API_URL}/api/events/user/${id}/`, config);


        return res.data.data
    } catch (err) {
        dispatch({
            type: DETAIL_TASK_FAIL
        })
        return err
    }
}


export const Add_Task_Event = (object) => async dispatch => {

    const config = {
        headers: {
            'Content-Type': 'application/json'
        }
    }
    try {
        const body = JSON.stringify(object);
        const res = await axiosInstance.post(`${process.env.REACT_APP_API_URL}/api/event/add/`, body, config);
        dispatch({
            type: ADD_EVENT_SUCCESS,
            payload: res.data.data
        })

        return res.data.data
    } catch (err) {
        dispatch({
            type: ADD_EVENT_FAIL
        })
        return err
    }
}
export const Add_Tasks_Events = (object) => async dispatch => {

    const config = {
        headers: {
            'Content-Type': 'application/json'
        }
    }
    try {
        const body = JSON.stringify(object);
        const res = await axiosInstance.post(`${process.env.REACT_APP_API_URL}/api/event/adds/`, body, config);

        dispatch({
            type: ADD_EVENT_SUCCESS,
            payload: res.data.data.data
        })
        return res.data.data
    } catch (err) {
        dispatch({
            type: ADD_EVENT_FAIL
        })
        return err
    }
}

export const Update_Task_Event = (object) => async dispatch => {

    const config = {
        headers: {
            'Content-Type': 'application/json'
        }
    }
    try {
        const body = JSON.stringify(object);
        const res = await axiosInstance.post(`${process.env.REACT_APP_API_URL}/api/event/edit/${object.id}/`, body, config);

        dispatch({
            type: ADD_EVENT_SUCCESS,
            payload: res.data.data.data
        })
        return res.data.data
    } catch (err) {
        dispatch({
            type: ADD_EVENT_FAIL
        })
        return err
    }
}

export const Disease_List = () => async dispatch => {

    const config = {
        headers: {
            'Content-Type': 'application/json'
        }
    }
    try {
        const res = await axiosInstance.get(`${process.env.REACT_APP_API_URL}/api/disease/all/`, config);
        dispatch({
            type: INSECT_LIST_SUCESS,
            payload: res.data.data.data
        })
        return res.data.data
    } catch (err) {
        dispatch({
            type: INSECT_LIST_FAIL
        })
        return err
    }
}
export const DiseaseActor_List = (disease) => async dispatch => {

    const config = {
        headers: {
            'Content-Type': 'application/json'
        }
    }

    try {
        const res = await axiosInstance.get(`${process.env.REACT_APP_API_URL}/api/disease/actors/${disease}/`, config);
        return res.data.data
    } catch (err) {
        return err
    }
}
export const Products_type_List = () => async dispatch => {

    const config = {
        headers: {
            'Content-Type': 'application/json'
        }
    }

    try {
        const res = await axiosInstance.get(`${process.env.REACT_APP_API_URL}/api/products/type/all/`, config);
        return res.data.data
    } catch (err) {
        return err
    }
}
export const Products_by_type = (type) => async dispatch => {

    const config = {
        headers: {
            'Content-Type': 'application/json'
        }
    }

    try {
        const res = await axiosInstance.get(`${process.env.REACT_APP_API_URL}/api/products/type/${type}/`, config);
        return res.data.data
    } catch (err) {
        return err
    }
}

export const Fertilisation_products = () => async dispatch => {

    const config = {
        headers: {
            'Content-Type': 'application/json'
        }
    }
    try {
        const res = await axiosInstance.get(`${process.env.REACT_APP_API_URL}/api/fertilisation/product/all/`, config);
        return res.data.data
    } catch (err) {
        return err
    }
}
export const Stade_phenologiques = () => async dispatch => {

    const config = {
        headers: {
            'Content-Type': 'application/json'
        }
    }
    try {
        const res = await axiosInstance.get(`${process.env.REACT_APP_API_URL}/api/stades/all/`, config);
        return res.data.data
    } catch (err) {
        return err
    }
}
export const DeleteMultipleEvents = (eventIds) => async dispatch => {
    const config = {
        headers: {
            'Content-Type': 'application/json'
        }
    }

    const body = JSON.stringify({ event_ids: eventIds });

    try {
        const res = await axiosInstance.post(`${process.env.REACT_APP_API_URL}/api/delete-multiple-event/`, body, config);
        return res.data;
    } catch (err) {
        throw err;
    }
}
export const Delete_Event = (id) => async dispatch => {

    const config = {
        headers: {
            'Content-Type': 'application/json'
        }
    }
    try {
        const res = await axiosInstance.get(`${process.env.REACT_APP_API_URL}/api/event/delete/${id}/`, config);

        dispatch({
            type: DELETE_EVENT_SUCCESS,
            payload: res.data.data.message
        })
        return res.data.data
    } catch (err) {
        dispatch({
            type: DELETE_EVENT_FAIL
        })
        return err
    }
}
export const List_Projects_Tasks = (id) => async dispatch => {

    const config = {
        headers: {
            'Content-Type': 'application/json'
        }
    }
    try {
        const res = await axiosInstance.get(`${process.env.REACT_APP_API_URL}/api/user/task/list/${id}/`, config);

        return res.data.data
    } catch (err) {
        return err
    }
}

export const Products_List = (type = '') => async dispatch => {

    const config = {
        headers: {
            'Content-Type': 'application/json'
        }
    }
    try {
        let url = `${process.env.REACT_APP_API_URL}/api/products/`;
        if ((type === '')) {
            url += 'all/';
        } else {
            url += `type/${type}/`;
        }
        const res = await axiosInstance.get(url, config);

        dispatch({
            type: PRODUCT_LIST_SUCCESS,
            payload: res.data.data.data
        })
        return res.data.data
    } catch (err) {
        dispatch({
            type: PRODUCT_LIST_FAIL
        })
        return err
    }
}

export const Delete_File_visit_field = (id) => async dispatch => {

    const config = {
        headers: {
            'Content-Type': 'application/json'
        }
    }
    try {
        const res = await axiosInstance.get(`${process.env.REACT_APP_API_URL}/api/visit/field/delete/file/${id}/`, config);

        return res.data.data
    } catch (err) {
        return err
    }
}
export const Visit_Field_Download_File = (fileId) => async (dispatch) => {
    try {
        const downloadUrl = `${process.env.REACT_APP_API_URL}/api/visit/field/download/file/${fileId}/`;
        window.open(downloadUrl, '_blank');

    } catch (error) {
        console.error('Error initiating file download:', error);
    }
};

export const Anomaly_type = () => async dispatch => {

    const config = {
        headers: {
            'Content-Type': 'application/json'
        }
    }
    try {
        const res = await axiosInstance.get(`${process.env.REACT_APP_API_URL}/api/anomaly/type/all/`, config);
        return res.data.data
    } catch (err) {
        return err
    }
}
export const Delete_File_anomaly = (id) => async dispatch => {
    const config = {
        headers: {
            'Content-Type': 'application/json'
        }
    }
    try {
        const res = await axiosInstance.get(`${process.env.REACT_APP_API_URL}/api/anomaly/delete/file/${id}/`, config);
        if (res.status == 200 || res.data.data) {
            return { success: true };
        } else {
            throw new Error('Unexpected response from server');
        }
    } catch (err) {
        console.error('Error deleting file:', err);
        throw err;
    }
}
export const Anomaly_Download_File = (fileId) => async (dispatch) => {
    try {
        const downloadUrl = `${process.env.REACT_APP_API_URL}/api/anomaly/download/file/${fileId}/`;
        window.open(downloadUrl, '_blank');

    } catch (error) {
        console.error('Error initiating file download:', error);
    }
};

export const TasksList = () => async dispatch => {

    const config = {
        headers: {
            'Content-Type': 'application/json'
        }
    }

    try {
        const res = await axiosInstance.get(`${process.env.REACT_APP_API_URL}/api/task/list/`, config);
        return res.data.data
    } catch (err) {
        return err
    }
}
