import {

    USER_NOTIFICATIONS_SUCCESS,
    USER_NOTIFICATIONS_FAIL,
    USER_NOTIFICATIONS_HEAD_SUCCESS,
    USER_NOTIFICATIONS_HEAD_FAIL
} from "../utils/types.js";

const initialState = {
    notifications: null,
    notificationsHead: null,
}

export default function (state = initialState, action) {
    const { type, payload } = action;
    switch (type) {
        case USER_NOTIFICATIONS_SUCCESS:
            return {
                ...state,
                notifications: payload,
            };
        case USER_NOTIFICATIONS_FAIL:
            return {
                ...state,
                notifications: null,
            };
        case USER_NOTIFICATIONS_HEAD_SUCCESS:
            return {
                ...state,
                notificationsHead: payload,
            };
        case USER_NOTIFICATIONS_HEAD_FAIL:
            return {
                ...state,
                notificationsHead: null,
            };
        default:
            return {
                ...state,
            };
    }
}