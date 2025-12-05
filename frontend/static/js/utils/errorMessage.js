// utils/errorMessage.js
// Generic function to extract backend error messages for notifications
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
