// static/js/services/reservationService.js

import fetchData from '../utils/fetchData.js'
import { apiUrl } from '../utils/config.js'

// GET /api/v1/reservations
export const getAllReservations = () => fetchData(apiUrl('reservation'));

// Optional, if you need per-id later
export const getReservationById = (id) => fetchData(apiUrl(`reservation/${id}`));



