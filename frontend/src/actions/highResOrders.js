import axios from 'axios';
import {
    HIGH_RES_ORDERS,
} from '../utils/types';


export const getHighResOrders = (orders) =>({
    type: HIGH_RES_ORDERS,
    payload: orders,
})