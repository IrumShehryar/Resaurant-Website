// utils/errorMessage.js
/**
 * Extracts backend error messages for notifications.
 * @param {Error} error - Error object thrown by fetch or API call.
 * @param {string} [fallback='Error occurred'] - Fallback message if extraction fails.
 * @returns {string} Extracted error message or fallback.
 */
export function extractErrorMessage(error, fallback = 'Error occurred') {
    try {
        const errorObj = JSON.parse(error.message.match(/\{.*\}/)?.[0] || '{}');
        if (errorObj.errors?.length) return errorObj.errors[0];
        if (errorObj.error) return errorObj.error;
        if (errorObj.message) return errorObj.message;
        return error.message;
    } catch {
        return error.message || fallback;
    }
}
