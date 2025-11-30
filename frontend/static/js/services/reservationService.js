// static/js/services/reservationService.js

import fetchData from '../utils/fetchData.js'
import { apiUrl } from '../utils/config.js'

// GET /api/v1/reservations
export function getAllReservations() {
    return  fetchData(apiUrl('reservation'))
}

// Optional, if you need per-id later
export function getReservationById(id) {
    return fetchData(apiUrl(`reservation/${id}`))
}



