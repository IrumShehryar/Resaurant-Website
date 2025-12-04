// static/js/services/orderService.js

import fetchData from '../utils/fetchData.js'
import { apiUrl } from '../utils/config.js'

// GET /api/v1/reservations
export const getAllOrders = () => fetchData(apiUrl('orders'));

// Optional, if you need per-id later
export const getOrderById = (id) => fetchData(apiUrl(`orders/${id}`));



