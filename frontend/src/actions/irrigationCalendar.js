import axiosInstance from '../utils/axiosConfig';
import {
    LOADING_BEGIN,
    REQUEST_EMPTY,
    REQUEST_EXIST,
    IRRIGATION_CALENDAR_SUCESS,
    IRRIGATION_CALENDAR_FAIL
} from '../utils/types';

export const submitIrrigationCalendarRequest = (task_id,formData) => async dispatch => {
    // dispatch({
    //     type: LOADING_BEGIN
    // })
    const config = {
        headers: {
            'Content-Type': 'application/json'
        }
    }
    const body = JSON.stringify({ task_id , "formData":formData});

    try {
        const res = await axiosInstance.post(`${process.env.REACT_APP_API_URL}/irrigation/calendar/add`, body, config);
        // if (res.status == 200) {
        //     dispatch({
        //         type: IRRIGATION_CALENDAR_SUCESS,
        //     })

        // }
        return res
    } catch (err) {
        // dispatch({
        //     type: IRRIGATION_CALENDAR_FAIL,
        // })
        return err
    }
}

export const checkIrrigationCalendarGenerated = (task_id,formData) => async dispatch => {
    // dispatch({
    //     type: LOADING_BEGIN
    // })
    const config = {
        headers: {
            'Content-Type': 'application/json'
        }
    }
    const body = JSON.stringify({ task_id });

    try {
        const res = await axiosInstance.get(`${process.env.REACT_APP_API_URL}/irrigation/calendar/get/${task_id}/`);
     
        return res
    } catch (err) {
       
        return err
    }
}

export const checkIrrigationCalendarRequest = (task_id) => async dispatch => {
    const config = {
        headers: {
            'Content-Type': 'application/json'
        }
    }
    const body = JSON.stringify({ task_id });

    try {
        const res = await axiosInstance.get(`${process.env.REACT_APP_API_URL}/irrigation/calendar/check_request/${task_id}/`);
     
        return res
    } catch (err) {
       
        return err
    }
}