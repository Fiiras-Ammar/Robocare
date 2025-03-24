import axiosInstance from '../utils/axiosConfig';
import {
    HIGH_RES_ORDERS,
} from '../utils/types';


export const getHighResOrders = (orders) =>({
    type: HIGH_RES_ORDERS,
    payload: orders,
})