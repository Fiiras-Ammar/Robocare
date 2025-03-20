import axios from 'axios';
import {
    REQUEST_EMPTY,
    REQUEST_EXIST
} from '../utils/types';

export const get_request_high_resolution = (task) => async dispatch => {
    const config = {
        headers: {
            'Content-Type': 'application/json'
        }
    }
    try {
        const res = await axios.get(`${process.env.REACT_APP_API_URL}/api/task/subscription/check_exist/${task}/`, config);
        dispatch({
            type: REQUEST_EXIST,
            payload: res.data.data
        })
        return res
    } catch (err) {
        dispatch({
            
            type: REQUEST_EMPTY
        })
        return err
    }
}

export const add_request = (date_of_request, subscription) => async dispatch => {
    const config = {
        headers: {
            'Content-Type': 'application/json'
        }
    }
    const body = JSON.stringify({ date_of_request, subscription });
    try {
        const res = await axios.post(`${process.env.REACT_APP_API_URL}/api/task/subscription/request/add/`, body, config);
        return res
    } catch (err) {
        return err
    }
}

