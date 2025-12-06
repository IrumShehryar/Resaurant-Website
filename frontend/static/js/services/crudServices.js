import fetchData from '../utils/fetchData.js';
import { apiUrl } from '../utils/config.js';

/**
 * Generic CRUD Service Factory
 * Creates reusable CRUD managers for any API endpoint.
 * Eliminates code duplication across admin.js, orders.js, reservations.js, etc.
 * Handles all HTTP operations: GET, POST, PUT, DELETE with proper headers.
 *
 * @param {string} endpoint - The API endpoint to manage (e.g., 'menu', 'orders').
 * @returns {Object} CRUD manager with methods: getAll, getById, create, update, deleteItem.
 */
export const createCrudManager = (endpoint) => {
    /**
     * Get authorization headers for requests.
     * @param {boolean} [includeJson=false] - Whether to include JSON content-type header.
     * @returns {Object} Headers object.
     */
    const getAuthHeaders = (includeJson = false) => {
        const headers = {};
        if (includeJson) {
            headers['Content-Type'] = 'application/json';
        }
        const token = localStorage.getItem('authToken');
        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }
        return headers;
    };
    /**
     * Fetch all items from the endpoint.
     * @returns {Promise<Array<Object>>}
     */
    const getAll = async () => fetchData(apiUrl(endpoint));
    /**
     * Fetch a single item by id from the endpoint.
     * @param {number|string} id - Item id to fetch.
     * @returns {Promise<Object>}
     */
    const getById = async (id) => fetchData(apiUrl(`${endpoint}/${id}`));
    /**
     * Create a new item at the endpoint.
     * @param {Object} data - Data for the new item.
     * @returns {Promise<Object>} Created item object.
     */
    const create = async (data) => fetchData(apiUrl(endpoint), {
        method: 'POST',
        headers: getAuthHeaders(true),
        body: JSON.stringify(data)
    });
    /**
     * Update an item at the endpoint.
     * @param {number|string} id - Item id to update.
     * @param {Object} data - Updated data.
     * @returns {Promise<Object>} Updated item object.
     */
    const update = async (id, data) => fetchData(apiUrl(`${endpoint}/${id}`), {
        method: 'PUT',
        headers: getAuthHeaders(true),
        body: JSON.stringify(data)
    });
    /**
     * Delete an item at the endpoint.
     * @param {number|string} id - Item id to delete.
     * @returns {Promise<Object>} Deleted item response.
     */
    const deleteItem = async (id) => fetchData(apiUrl(`${endpoint}/${id}`), {
        method: 'DELETE',
        headers: getAuthHeaders(),
    });
    return {
        getAll,
        getById,
        create,
        update,
        deleteItem
    };
};
