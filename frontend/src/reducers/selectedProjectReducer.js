import {
    SELECTED_PROJECT_SUCCESS,
    SELECTED_PROJECT_FAIL
} from '../utils/types';


const initialState = {
    projectIndex: -1,

};

export default function (state = initialState, action) {
    const { type, payload } = action;
    switch (type) {
        case SELECTED_PROJECT_SUCCESS:
            return {
                ...state,
                projectIndex: payload
            }
        case SELECTED_PROJECT_FAIL:
            return {
                ...state,
                projectIndex: -1
            }
        default:
            return {
                ...state
            }
    }

}