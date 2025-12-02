
/**
 * Robust fetch wrapper for API calls.
 * Throws on non-OK responses and parses JSON or text based on content-type.
 *
 * Usage:
 *   const data = await fetchData('/api/v1/menu')
 *
 * @param {string} url - The resource URL to fetch.
 * @param {RequestInit} [options={}] - Optional fetch options (method, headers, body, etc.).
 * @returns {Promise<any>} Parsed JSON response body, or text if not JSON.
 * @throws {Error} If the network request fails or the HTTP status is not ok (2xx).
 *
 * Error Handling:
 *   - If response is not OK, tries to parse error details from JSON if available.
 *   - If not JSON, falls back to plain text error message.
 *   - Always includes HTTP status in thrown error.
 *
 * Response Parsing:
 *   - If content-type is JSON, returns parsed JSON.
 *   - Otherwise, returns response as text.
 */
const fetchData = async (url, options = {}) => {
    const response = await fetch(url, options);
    const contentType = response.headers.get("content-type") || "";
    if (!response.ok) {
        // Parse error details from JSON if possible, else fallback to text
        let errorMessage;
        if (contentType.includes("application/json")) {
            const errorData = await response.json();
            errorMessage = errorData.message || JSON.stringify(errorData);
        } else {
            errorMessage = await response.text();
        }
        throw new Error(`Error ${response.status}: ${errorMessage}`);
    }
    // Return JSON if possible, else fallback to text
    if (contentType.includes("application/json")) {
        return response.json();
    }
    return response.text();
};
export default fetchData;
