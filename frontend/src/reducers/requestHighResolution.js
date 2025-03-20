import {
    REQUEST_EMPTY,
    REQUEST_EXIST,

} from '../utils/types';

const initialState = {
    has_request: false,
    requests: null,
};

export default function (state = initialState, action) {
    const { type, payload } = action;
    switch (type) {
        case REQUEST_EXIST:
            return {
                ...state,
                has_request: true,
                // requests: payload
            }
        case REQUEST_EMPTY:
            return {
                ...state,
                has_request: false,
                // requests: null
            }
        default:
            return {
                ...state
            }
    }

}