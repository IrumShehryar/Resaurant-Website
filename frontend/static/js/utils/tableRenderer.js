/**
 * Generic Table Renderer Utility
 * 
 * Dynamically renders table rows from any data array.
 * Highly reusable across admin.js, order-management.js, reservations.js, etc.
 * 
 * @param {Array} items - Array of objects to display (e.g., menu items, orders, reservations)
 * @param {Array} columns - Array of field names to show (e.g., ['name', 'price', 'category'])
 * @param {HTMLElement} tbody - Target tbody element to populate
 * 
 * How it works:
 * - Takes configurable columns instead of hardcoding fields
 * - Adds data-id attribute to each row for fast item lookup (no API calls needed)
 * - Auto-generates Edit/Delete buttons for each row
 * - Handles empty state gracefully
 * 
 * Example usage in admin.js:
 *   renderTable(menuItems, ['name', 'category', 'price', 'dietary'], menuTbody)
 *   
 * Example usage in orders.js:
 *   renderTable(orders, ['id', 'customer', 'total', 'status'], ordersTbody)
 */
export function renderTable(items,columns,tbody){

    if(items.length === 0)
    {
         tbody.innerHTML = '<tr><td colspan="' + (columns.length+1) + '">No items yet</td></tr>';
        return;
    }
    
    // Map each item to a table row with dynamic columns
    // data-id="${item.id}" stored in HTML for fast lookup - see getItemFromRow() in admin.js
    tbody.innerHTML = items.map(item =>`
        <tr data-id="${item.id}">
            ${columns.map(col => `<td>${item[col]}</td>`).join('')}
            
            <td>
                <button class="btn-edit">Edit</button>
                <button class="btn-delete">Delete</button>
            </td>
        </tr>
    `).join('');
}