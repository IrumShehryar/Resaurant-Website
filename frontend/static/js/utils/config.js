/**
 * Base API URL used by frontend services to build absolute endpoints.
 * @constant {string}
 */
export const BASE_API_URL = "/revontulet/api/v1"

/**
 * Build a full API URL for a given endpoint path.
 * @param {string} endpoint - Path relative to the API root (no leading slash).
 * @returns {string} Full URL to fetch.
 */
export const apiUrl = (endpoint) => `${BASE_API_URL}/${endpoint}`