import {
    SNACKBAR_SHOW,
    SNACKBAR_HIDE,

} from '../utils/types';


const initialState = {
    alert: null,
    open: null,
    message: null,
    vertical: null,
    horizental: null,
    autohide: null
};

export default function (state = initialState, action) {
    const { type, payload } = action;
    switch (type) {
        case SNACKBAR_SHOW:
            return {
                ...state,
                alert: payload.alert,
                open: payload.open,
                message: payload.message,
                vertical: payload.vertical,
                horizental: payload.horizental,
                autohide: payload.autohide,
            }
        case SNACKBAR_HIDE:
            return {
                ...state,
                open: false,
            }
        default:
            return {
                ...state
            }
    }
}