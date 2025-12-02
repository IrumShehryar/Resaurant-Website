/**
 * Generic CRUD Service Factory
 * 
 * Creates reusable CRUD managers for any API endpoint.
 * Eliminates code duplication across admin.js, orders.js, reservations.js, etc.
 * Handles all HTTP operations: GET, POST, PUT, DELETE with proper headers.
 * 
 * Architecture Pattern: Factory function returns an object with 5 methods
 * This allows each page to create its own manager for its endpoint.
 * 
 * Usage Examples:
 * 
 * In admin.js:
 */
export const createCrudManager = (endpoint) => {
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
    const getAll = async () => fetchData(apiUrl(endpoint));
    const getById = async (id) => fetchData(apiUrl(`${endpoint}/${id}`));
    const create = async (data) => fetchData(apiUrl(endpoint), {
        method: 'POST',
        headers: getAuthHeaders(true),
        body: JSON.stringify(data)
    });
    const update = async (id, data) => fetchData(apiUrl(`${endpoint}/${id}`), {
        method: 'PUT',
        headers: getAuthHeaders(true),
        body: JSON.stringify(data)
    });
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
