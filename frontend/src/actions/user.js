
import axios from 'axios';
import {
    USER_HISTORY_SUCCESS,
    USER_HISTORY_FAIL,
    USER_HISTORY_STATISTICS_SUCCESS,
    USER_HISTORY_STATISTICS_FAIL,
    USER_LIST_SUCCESS,
    USER_LIST_FAIL,
    USER_DETAILS_SUCCESS,
    USER_DETAILS_FAIL,
} from '../utils/types'



export const GetUserHistory = (id) => async dispatch => {

    const config = {
        headers: {
            'Content-Type': 'application/json'
        }
    }
    try {
        const res = await axios.get(`${process.env.REACT_APP_API_URL}/api/user/history/all/${id}/`, config);

        dispatch({
            type: USER_HISTORY_SUCCESS,
            payload: res.data.data
        })
        return res
    } catch (err) {
        dispatch({
            type: USER_HISTORY_FAIL
        })
        return err
    }
}

export const GetUserHistoryStatistics = (id) => async dispatch => {

    const config = {
        headers: {
            'Content-Type': 'application/json'
        }
    }
    try {
        const res = await axios.get(`${process.env.REACT_APP_API_URL}/api/user/history/statistics/${id}/`, config);

        dispatch({
            type: USER_HISTORY_STATISTICS_SUCCESS,
            payload: res.data.data
        })
        return res
    } catch (err) {
        dispatch({
            type: USER_HISTORY_STATISTICS_FAIL
        })
        return err
    }
}

export const GetAllUsers = () => async dispatch => {

    const config = {
        headers: {
            'Content-Type': 'application/json'
        }
    }
    try {
        const res = await axios.get(`${process.env.REACT_APP_API_URL}/api/users/all/`, config);

        dispatch({
            type: USER_LIST_SUCCESS,
            payload: res.data.data
        })
        return res
    } catch (err) {
        dispatch({
            type: USER_LIST_FAIL
        })
        return err
    }
}

export const GetSingleUser = (id) => async dispatch => {

    const config = {
        headers: {
            'Content-Type': 'application/json'
        }
    }
    try {
        const res = await axios.get(`${process.env.REACT_APP_API_URL}/api/user/${id}/`, config);

        dispatch({
            type: USER_DETAILS_SUCCESS,
            payload: res.data.data
        })
        return res
    } catch (err) {
        dispatch({
            type: USER_DETAILS_FAIL
        })
        return err
    }
}
