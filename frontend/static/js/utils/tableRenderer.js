import { formatDateTime} from './dateUtils.js';


/**
 * Generic Table Renderer Utility
 * 
 * Dynamically renders table rows from any data array.
 * Highly reusable across admin.js, order-management.js, reservations.js, etc.
 * 
 * @param {Array} items - Array of objects to display (e.g., menu items, orders, reservations)
 * @param {Array} columns - Array of field names to show (e.g., ['name', 'price', 'category'])
 * @param {HTMLElement} tbody - Target tbody element to populate
 * @param {Object} [t={}] - Optional translation object for button labels
 * 
 * How it works:
 * - Takes configurable columns instead of hardcoding fields
 * - Adds data-id attribute to each row for fast item lookup (no API calls needed)
 * - Auto-generates Edit/Delete buttons for each row
 * - Formats created_at and similar date columns automatically
 * - Handles empty state gracefully
 * 
 * Example usage in admin.js:
 *   renderTable(menuItems, ['name', 'category', 'price', 'dietary'], menuTbody)
 *   
 * Example usage in orders.js:
 *   renderTable(orders, ['id', 'customer', 'total', 'status'], ordersTbody)
 */
export const renderTable = (items, columns, tbody, t = {}) => {
    const editLabel = t.edit || t.edit_button || 'Edit';
    const deleteLabel = t.delete || t.delete_button || 'Delete';
    if (items.length === 0) {
        tbody.innerHTML = `<tr><td colspan="${columns.length + 1}">${t.no_items_yet || 'No items yet'}</td></tr>`;
        return;
    }
    tbody.innerHTML = items.map(item => `
        <tr data-id="${item.id}">
            ${columns.map(col => {
                const value = item[col];
                // Format created_at and similar date fields
                if (col === 'created_at' || col === 'updated_at') {
                    return `<td>${formatDateTime(value)}</td>`;
                }
                return `<td>${value}</td>`;
            }).join('')}
            <td>
                <button class="btn-edit">${editLabel}</button>
                <button class="btn-delete">${deleteLabel}</button>
            </td>
        </tr>
    `).join('');
};