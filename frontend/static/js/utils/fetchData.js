/**
 * A tiny fetch wrapper that throws on non-OK responses and returns parsed JSON.
 *
 * Usage:
 *   const data = await fetchData('/api/v1/menu')
 *
 * @param {string} url - The resource URL to fetch.
 * @param {RequestInit} [options={}] - Optional fetch options (method, headers, body, etc.).
 * @returns {Promise<any>} Parsed JSON response body.
 * @throws {Error} If the network request fails or the HTTP status is not ok (2xx).
 */
const fetchData = async (url, options = {}) => {
    const response = await fetch(url, options);
    if (!response.ok) {
        throw new Error(`Error from the server: ${response.status} when fetching ${url}`);
    }
    const data = await response.json();
    return data;
};
export default fetchData;
