import axios from 'axios';
import {
    TASKS_GRAPH_DATA_COMPARE_SUCCESS,
    TASKS_GRAPH_DATA_COMPARE_FAIL, TASKS_GRAPH_DATA_SELF_SUCCESS, TASKS_GRAPH_DATA_SELF_FAIL
} from "../utils/types.js";

export const getFiltredTasks = (culture, variety, density, age,intensification_variety) => async dispatch => {

    const config = {
        headers: {
            'Content-Type': 'application/json'
        }
    }
    const body = JSON.stringify({ culture, variety, density, age,intensification_variety });
    try {
        const res = await axios.post(`${process.env.REACT_APP_API_URL}/api/user/tasks/filter/`, body, config);
        return res.data.data
    } catch (err) {

        return err
    }
}

export const getFiltredTasksGraphData = (tasks, index) => async dispatch => {

    const config = {
        headers: {
            'Content-Type': 'application/json'
        }
    }
    const body = JSON.stringify({ tasks, index });
    try {
        const res = await axios.post(`${process.env.REACT_APP_API_URL}/api/user/tasks/graphdata/compare/`, body, config);
        if (res.status === 200) {
            dispatch({
                type: TASKS_GRAPH_DATA_COMPARE_SUCCESS,
                payload: res.data.data
            })
        } else {
            dispatch({
                type: TASKS_GRAPH_DATA_COMPARE_FAIL
            })
        }
        return res
    } catch (err) {
        dispatch({
            type: TASKS_GRAPH_DATA_COMPARE_FAIL
        })
        console.error('err', err); // Log the error details for debugging
        return err.response
    }

}


export const clearTaskDataGraph = () => async dispatch => {
    dispatch({
        type: TASKS_GRAPH_DATA_COMPARE_FAIL
    })

}

export const saveComparePattern = (formData) => async dispatch => {

    const config = {
        headers: {
            'Content-Type': 'application/json'
        }
    }

    const body = JSON.stringify({ formData });
    try {
        const res = await axios.post(`${process.env.REACT_APP_API_URL}/api/task/graph_data/pattern/add/`, body, config);
        if (res.status === 200) {
            dispatch({
                type: TASKS_GRAPH_DATA_COMPARE_SUCCESS,
                payload: res.data.data
            })
        } else {
            dispatch({
                type: TASKS_GRAPH_DATA_COMPARE_FAIL
            })
        }
        return res
    } catch (err) {
        dispatch({
            type: TASKS_GRAPH_DATA_COMPARE_FAIL
        })
        console.error('err', err); // Log the error details for debugging
        return err.response
    }

}

export const saveSelfPattern = (formData) => async dispatch => {
    const config = {
        headers: {
            'Content-Type': 'application/json'
        }
    }

    const body = JSON.stringify({
        formData: {
            task: formData.task,
            StartSelfDateP: formData.StartSelfDateP.toISOString(),
            EndSelfDateP: formData.EndSelfDateP.toISOString()
        }
    });

    try {
        const res = await axios.post(`${process.env.REACT_APP_API_URL}/api/task/self/graph_data/pattern/add/`, body, config);
        if (res.status === 200) {
            dispatch({
                type: TASKS_GRAPH_DATA_SELF_SUCCESS,
                payload: res.data.data
            })
        } else {
            dispatch({
                type: TASKS_GRAPH_DATA_SELF_FAIL
            })
        }
        return res
    } catch (err) {
        dispatch({
            type: TASKS_GRAPH_DATA_SELF_FAIL
        })
        console.error('err', err);
        return err.response
    }
}

export const saveComparePatternReference = (formData) => async dispatch => {

    const config = {
        headers: {
            'Content-Type': 'application/json'
        }
    }

    const body = JSON.stringify({ formData });
    try {
        const res = await axios.post(`${process.env.REACT_APP_API_URL}/api/task/reference/comparison/add/`, body, config);
        return res
    } catch (err) {

        console.error('err', err);
        return err.response
    }

}


export const ListComparePatternReference = () => async dispatch => {
    const config = {
        headers: {
            'Content-Type': 'application/json'
        }
    };

    try {
        const res = await axios.get(`${process.env.REACT_APP_API_URL}/api/task/reference/comparison/list/`, config);


        return res;
    } catch (err) {

        console.error('err', err);
        return err.response;
    }
};

export const deleteComparePatternReference = (id) => async dispatch => {

    const config = {
        headers: {
            'Content-Type': 'application/json'
        }
    }

    const body = JSON.stringify({ id });
    try {
        const res = await axios.post(`${process.env.REACT_APP_API_URL}/api/task/reference/comparison/delete/`, body, config);

        return res
    } catch (err) {
        console.error('err', err);
        return err.response
    }

}

export const getComparePatternReferenceDetails = (id) => async dispatch => {
    const config = {
        headers: {
            'Content-Type': 'application/json'
        }
    };

    try {
        const res = await axios.get(`${process.env.REACT_APP_API_URL}/api/task/reference/comparison/detail/${id}/`, config);
        return res.data;
    } catch (err) {
        console.error('Error fetching details:', err);
        return err.response;
    }
};

export const updateComparePatternReference = (id,startage,endage) => async dispatch => {

    const config = {
        headers: {
            'Content-Type': 'application/json'
        }
    }

    const body = JSON.stringify({ id,startage,endage });
    try {
        const res = await axios.post(`${process.env.REACT_APP_API_URL}/api/task/reference/comparison/update/`, body, config);
        return res
    } catch (err) {

        console.error('err', err);
        return err.response
    }

}
