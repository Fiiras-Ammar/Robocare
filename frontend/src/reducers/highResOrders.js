import axios from 'axios';
import {
    HIGH_RES_ORDERS,
} from '../utils/types';

const initialState = {
    highResOrders: [],
};



export default function (state = initialState, action) {
    switch (action.type) {
        case HIGH_RES_ORDERS:
            return { ...state, highResOrders: action.payload };
        default:
            return state;
    }
};