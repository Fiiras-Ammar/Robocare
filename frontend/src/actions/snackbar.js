import {
    SNACKBAR_SHOW,
    SNACKBAR_HIDE
} from "../utils/types.js";

export const showSnackbar = (alert = "error", open = true, message, vertical = "top", horizontal = "right", autohide = 3000) => async dispatch => {
    const payloadData = {
        "alert": alert,
        "open": Boolean(open), // Ensure open is a boolean
        "message": message,
        "vertical": vertical,
        "horizontal": horizontal,
        "autohide": autohide,
    }
    dispatch({
        type: SNACKBAR_SHOW,
        payload: payloadData
    })
}
export const hideSnackbar = () => async dispatch => {
    dispatch({
        type: SNACKBAR_HIDE,
    })
}
