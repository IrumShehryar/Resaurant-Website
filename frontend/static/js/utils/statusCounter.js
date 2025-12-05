// utils/statusCounter.js
// Generic status and date-based counter for admin dashboards
// Use this for orders, reservations, users, etc.

/**
 * Counts the number of items for each possible status.
 * @param {Array} items - Array of objects (orders, reservations, users, etc.)
 * @param {string} statusField - The field name in each object that holds the status (e.g., 'status', 'role').
 * @param {Array<string>} possibleStatuses - Array of possible status values to count (e.g., ['pending', 'completed']).
 * @returns {Object} - An object with status as keys and counts as values.
 *
 * Example:
 *   countStatuses(orders, 'status', ['pending', 'completed'])
 *   => { pending: 3, completed: 5 }
 */

/**
 *  countStatuses.
 */
export const countStatuses = (items, statusField, possibleStatuses) => {
    const counts = {};
    possibleStatuses.forEach(status => counts[status] = 0);
    items.forEach(item => {
        const status = item[statusField];
        if (counts.hasOwnProperty(status)) {
            counts[status]++;
        }
    });
    return counts;
};

/**
 * Counts the number of items created today (e.g., new users, new reservations).
 * @param {Array} items - Array of objects.
 * @param {string} dateField - The field name in each object that holds the creation date (ISO string or 'YYYY-MM-DD').
 * @returns {number} - The count of items created today.
 *
 * Example:
 *   countCreatedToday(users, 'created_at')
 *   => 2
 */

/**
 *  countCreatedToday.
 */
export const countCreatedToday = (items, dateField) => {
    const today = new Date().toISOString().slice(0, 10); // 'YYYY-MM-DD'
    return items.filter(item => item[dateField] && item[dateField].slice(0, 10) === today).length;
};
