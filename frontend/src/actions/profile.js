import axios from 'axios';
import {
    LOAD_USER_FAIL, UPDATE_USER_INFORMATIONS_FAIL, UPDATE_USER_PASSWORD_FAIL,
    UPDATE_USER_INFORMATIONS_SUCCESS, UPDATE_USER_PASSWORD_SUCCESS, LOAD_USER_SUCCESS
} from '../utils/types';


export const getCurrentUser = () => async dispatch => {

    if (localStorage.getItem('access')) {
        const config = {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('access')}`,
                'Accept': 'application/json'
            }
        };
        try {
            const result = await axios.get(`${process.env.REACT_APP_API_URL}/auth/users/me/`, config);

            dispatch({
                type: LOAD_USER_SUCCESS,
                payload: result.data
            });

            return result;
        } catch (err) {
            dispatch({
                type: LOAD_USER_FAIL
            })
        }
    } else {
        dispatch({
            type: LOAD_USER_FAIL
        })
    }
}

export const updateCurrentUserInformations = (user) => async dispatch => {
    if (localStorage.getItem('access')) {
        const config = {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('access')}`,
                'Accept': 'application/json'
            }
        };
        try {
            const result = await axios.put(`${process.env.REACT_APP_API_URL}/auth/users/me/`, user, config);

            dispatch({
                type: UPDATE_USER_INFORMATIONS_SUCCESS,
                payload: result.data
            });

            return result;
        } catch (err) {
            dispatch({
                type: UPDATE_USER_INFORMATIONS_FAIL
            });
        }
    } else {
        dispatch({
            type: LOAD_USER_FAIL
        });
    }
}

export const updateCurrentUserPassword = (data) => async dispatch => {
    if (localStorage.getItem('access')) {
        const config = {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('access')}`,
                'Accept': 'application/json'
            }
        };
        try {
            const result = await axios.post(`${process.env.REACT_APP_API_URL}/auth/users/set_password/`, data, config);

            dispatch({
                type: UPDATE_USER_PASSWORD_SUCCESS,
                payload: {}
            });

            return result;
        } catch (error) {
            dispatch({
                type: UPDATE_USER_PASSWORD_FAIL
            });
            return error;
        }
    } else {
        dispatch({
            type: LOAD_USER_FAIL
        });
    }
}
export const addProject = (user, project_name, type) => async dispatch => {
    const config = {
        headers: {
            'Content-Type': 'application/json'
        }
    }
    const body = JSON.stringify({ user, project_name, type });
    try {
        const res = await axios.post(`${process.env.REACT_APP_API_URL}/api/project/add/`, body, config);
        return res
    } catch (err) {
        return err
    }
}

export const listProject = (user) => async dispatch => {
    const config = {
        headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + localStorage.getItem('access')
        }
    }
    try {
        const res = await axios.get(`${process.env.REACT_APP_API_URL}/api/project/list/${user}/`, config);
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
        const res = await axios.get(`${process.env.REACT_APP_API_URL}/api/type/list/`, config);
        return res.data
    } catch (err) {
        return err
    }
}


export const getCulture = () => async dispatch => {
    const config = {
        headers: {
            'Content-Type': 'application/json'
        }
    }
    try {
        const res = await axios.get(`${process.env.REACT_APP_API_URL}/api/culture/list/`, config);
        return res.data
    } catch (err) {
        return err
    }
}
export const getTexture = () => async dispatch => {
    const config = {
        headers: {
            'Content-Type': 'application/json'
        }
    }
    try {
        const res = await axios.get(`${process.env.REACT_APP_API_URL}/api/texture/list/`, config);
        return res.data
    } catch (err) {
        return err
    }
}
export const getIrrigation = () => async dispatch => {
    const config = {
        headers: {
            'Content-Type': 'application/json'
        }
    }
    try {
        const res = await axios.get(`${process.env.REACT_APP_API_URL}/api/irrigation/list/`, config);
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
        const res = await axios.get(`${process.env.REACT_APP_API_URL}/api/variety/list/${id}/`, config);
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
        const res = await axios.get(`${process.env.REACT_APP_API_URL}/api/variety/list/`, config);
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
        const res = await axios.get(`${process.env.REACT_APP_API_URL}/api/density/list/${id}/`, config);
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
        const res = await axios.get(`${process.env.REACT_APP_API_URL}/api/density/list/`, config);
        return res.data
    } catch (err) {
        return err
    }
}

export const getStatistics = (user) => async dispatch => {
    const config = {
        headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + localStorage.getItem('access')
        }
    }
    try {
        const res = await axios.get(`${process.env.REACT_APP_API_URL}/api/statistics/`, config);
        return res
    } catch (err) {
        return err
    }
}

export const update_language = (data) => async dispatch => {
    if (localStorage.getItem('access')) {
        const config = {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': ` Bearer${localStorage.getItem('access')}`,
                'Accept': 'application/json'
            }
        };
        try {
            const result = await axios.post(`${process.env.REACT_APP_API_URL}/api/language/change/`, data, config);
            return result;
        } catch (error) {
            return error;
        }
    }
}

export const get_user_language = (userId) => async dispatch => {
    if (localStorage.getItem('access')) {
        const config = {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('access')}`,
                'Accept': 'application/json'
            }
        };

        try {
            const result = await axios.get(`${process.env.REACT_APP_API_URL}/api/get/language/user/${userId}/`, config);
            return result;
        } catch (error) {
            console.error("Error fetching user language:", error);
            return { status: 'error', data: { language: 'en' } };
        }
    } else {
        return { status: 'error', data: { language: 'en' } };
    }
}
export const getPDFInvoiceList = (id_user) => async (dispatch) => {
    const config = {
        headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + localStorage.getItem('access'),
        },
    };
    try {
        const res = await axios.get(`${process.env.REACT_APP_API_URL}/api/invoice/list/${id_user}/`, config);
        //const res = await axios.get(`${process.env.REACT_APP_API_URL}/api/invoice/list/260/`, config);
        return res;
    } catch (err) {
        return err;
    }
};
