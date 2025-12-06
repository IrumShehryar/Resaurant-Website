// static/js/services/reservationService.js

import fetchData from '../utils/fetchData.js'
import { apiUrl } from '../utils/config.js'

/**
 * Fetch all reservations from the backend API.
 * @returns {Promise<Array<Object>>} Promise that resolves to an array of reservation objects.
 */
export const getAllReservations = () => fetchData(apiUrl('reservation'));

/**
 * Fetch a single reservation by id.
 * @param {number|string} id - Reservation id to fetch.
 * @returns {Promise<Object>} Promise that resolves to the reservation object.
 */
export const getReservationById = (id) => fetchData(apiUrl(`reservation/${id}`));



