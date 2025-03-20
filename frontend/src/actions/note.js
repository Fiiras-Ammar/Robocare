import axios from 'axios';
import {
    NOTE_SUCCESS,
    NOTE_FAIL,
    NOTE_NAMES_SUCCESS,
    NOTE_NAMES_FAIL,
    SET_NOTE_NAME_SUCCESS,
    SET_NOTE_NAME_FAIL,

} from '../utils/types';

export const save_note = (task, datasheet, label) => async dispatch => {
    const config = {
        headers: {
            'Content-Type': 'application/json'
        }
    }
    const body = JSON.stringify({ task, datasheet, label });

    try {
        const res = await axios.post(`${process.env.REACT_APP_API_URL}/api/task/note/save/`, body, config);
        return res
    } catch (err) {
        return err
    }
}

export const get_note = (task, name) => async dispatch => {
    const config = {
        headers: {
            'Content-Type': 'application/json'
        }
    }
    try {
        const res = await axios.get(`${process.env.REACT_APP_API_URL}/api/task/note/get/${task}/${name}/`, config);
        dispatch({
            type: NOTE_SUCCESS,
            payload: res.data.data
        })
        return res
    } catch (err) {
        dispatch({
            type: NOTE_FAIL
        })
        return err
    }
}


export const get_filenames = (task) => async dispatch => {
    const config = {
        headers: {
            'Content-Type': 'application/json'
        }
    }
    try {
        const res = await axios.get(`${process.env.REACT_APP_API_URL}/api/task/note/get-spreadsheet-names/${task}/`, config);
        dispatch({
            type: NOTE_NAMES_SUCCESS,
            payload: res.data.data
        })
        return res
    } catch (err) {
        dispatch({
            type: NOTE_NAMES_FAIL
        })
        return err
    }
}

export const setSheetName = (name) => dispatch => {

    dispatch({
        type: SET_NOTE_NAME_SUCCESS,
        payload: name
    })
}

export const unSetSheetName = () => dispatch => {

    dispatch({
        type: SET_NOTE_NAME_FAIL,
        payload: null
    })
}

