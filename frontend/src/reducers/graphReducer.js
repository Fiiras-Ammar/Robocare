import {
    GRAPH_START_END_DATE_END_FAIL,
    GRAPH_START_END_DATE_SUCCESS,
    GRAPH_DATA_ARRAY_SUCCESS,
    GRAPH_DATA_ARRAY_FAIL,
    TASKS_GRAPH_DATA_COMPARE_SUCCESS,
    TASKS_GRAPH_DATA_COMPARE_FAIL,
    TASKS_GRAPH_DATA_SELF_SUCCESS,
    TASKS_GRAPH_DATA_SELF_FAIL
} from '../utils/types';

const initialState = {
    fetch_dates: false,
    graph_dates: [],
    graph_data: null,
    graph_data_compare: [],
    graph_data_self: []

}

// eslint-disable-next-line import/no-anonymous-default-export
export default function (state = initialState, action) {
    const { type, payload } = action;
    switch (type) {
        case GRAPH_START_END_DATE_SUCCESS:
            return {
                ...state,
                fetch_dates: true,
                graph_dates: payload,
            }
        case GRAPH_START_END_DATE_END_FAIL:
            return {
                ...state,
                fetch_dates: false,
                graph_dates: null,
            }
        case GRAPH_DATA_ARRAY_SUCCESS:
            return {
                ...state,
                graph_data: payload.data,
            }
        case GRAPH_DATA_ARRAY_FAIL:
            return {
                ...state,
                graph_data: null,
            }
        case TASKS_GRAPH_DATA_COMPARE_SUCCESS:
            return {
                ...state,
                graph_data_compare: payload,
            }
        case TASKS_GRAPH_DATA_COMPARE_FAIL:
            return {
                ...state,
                graph_data_compare: null,
            }
        case TASKS_GRAPH_DATA_SELF_SUCCESS:
            return {
                ...state,
                graph_data_self: payload,
            }
        case TASKS_GRAPH_DATA_SELF_FAIL:
            return {
                ...state,
                graph_data_self: null,
            }

        default:
            return {
                ...state
            }
    }
}
