// static/js/services/orderService.js

import fetchData from '../utils/fetchData.js'
import { apiUrl } from '../utils/config.js'

/**
 * Fetch all orders from the backend API.
 * @returns {Promise<Array<Object>>} Promise that resolves to an array of order objects.
 */
export const getAllOrders = () => fetchData(apiUrl('orders'));

/**
 * Fetch a single order by id.
 * @param {number|string} id - Order id to fetch.
 * @returns {Promise<Object>} Promise that resolves to the order object.
 */
export const getOrderById = (id) => fetchData(apiUrl(`orders/${id}`));



