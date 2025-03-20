import {

    CLICK_EVENT_STATE_SUCCESS,
    CLICK_EVENT_STATE_FAIL,
    OPEN_DRAWER_SUCCESS,
    OPEN_DRAWER_FAIL
} from "../utils/types";

const initialState = {
    clickEventCheck: true,
    openDrawer:false,
    typeOrder:null,
    startDate:null,
    endDate:null,
}

export default function (state = initialState, action) {
    const { type, payload } = action;
    switch (type) {
        case CLICK_EVENT_STATE_SUCCESS:
            return {
                ...state,
                clickEventCheck: true,
            };
        case CLICK_EVENT_STATE_FAIL:
            return {
                ...state,
                clickEventCheck: false,
            };
        case OPEN_DRAWER_SUCCESS:
            return {
                ...state,
                openDrawer: action.payload.isOpen,
                typeOrder: action.payload.drawerType,
                startDate: action.payload.startDate,
                endDate: action.payload.endDate,
            };
        case OPEN_DRAWER_FAIL:
            return {
                ...state,
                openDrawer: false,
                typeOrder:null,
                startDate:null,
                endDate:null,
            };
        default:
            return {
                ...state,
            };
    }
}
