/**
 * Formats an ISO date string to a readable Finnish format: 'DD.MM.YYYY HH:mm'.
 * @param {string} isoString - The ISO date string.
 * @returns {string} Formatted date string.
 */
export function formatDateTime(isoString) {
    if (!isoString) return '';
    const date = new Date(isoString);
    return date.toLocaleString('en-US', {
        year: 'numeric', month: '2-digit', day: '2-digit',
        hour: '2-digit', minute: '2-digit'
    }).replace(',', '');
}
