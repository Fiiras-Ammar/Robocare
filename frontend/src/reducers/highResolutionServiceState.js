import {
    HIGH_RES_SERVICE_AVAILABLE,
    HIGH_RES_SERVICE_NOT_AVAILABLE

} from '../utils/types';

const initialState = {
    high_res_available: false,
};

export default function (state = initialState, action) {
    const { type, payload } = action;
    switch (type) {
        case HIGH_RES_SERVICE_AVAILABLE:
            return {
                ...state,
                high_res_available: true,
            }
        case HIGH_RES_SERVICE_NOT_AVAILABLE:
            return {
                ...state,
                high_res_available: false,
            }
        default:
            return {
                ...state,

            }
    }

}