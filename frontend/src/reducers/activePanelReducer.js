import {
    ACTIVE_PANE_STATE_FAIL,
    ACTIVE_PANE_STATE_SUCCESS
} from "../utils/types";

const initialState = {
    activePane:0,
    activePanel:0

};

export default function (state = initialState, action) {
    const { type, payload } = action;
    switch (type) {
        case ACTIVE_PANE_STATE_SUCCESS:
            return {
                ...state,
                activePane: payload,
                activePanel: payload,
            };
        case ACTIVE_PANE_STATE_FAIL:
            return {
                ...state,
                activePane: 0,
                activePanel: 0,
            };

        default:
            return {
                ...state,
            };
    }
}
