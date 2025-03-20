import {
    IRRIGATION_CALENDAR_SUCESS,
    IRRIGATION_CALENDAR_FAIL
} from "../utils/types";

const initialState = {
    irrigationCalendarGenerated: false,
}

export default function (state = initialState, action) {
    const { type, payload } = action;
    switch (type) {
        case IRRIGATION_CALENDAR_SUCESS:
            return {
                ...state,
                irrigationCalendarGenerated: true,
            };
        case IRRIGATION_CALENDAR_FAIL:
            return {
                ...state,
                irrigationCalendarGenerated: false,
            };
        default:
            return {
                ...state,
            };
    }
}