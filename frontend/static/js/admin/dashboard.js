import { apiUrl } from "../utils/config.js";
import fetchData from "../utils/fetchData.js";

/**
 * Admin Dashboard Stats Updater
 * Updates statistics for orders, reservations, menu items, and users in the admin dashboard.
 *
 * @module dashboard
 */

/**
 * Fetches and updates admin statistics in the dashboard.
 *
 * @async
 * @function updateAdminStats
 * @returns {Promise<void>}
 */
async function updateAdminStats() {
    try {
        const stats = await fetchData(apiUrl("admin/stats"));
        document.getElementById("dashboard-orders").textContent = stats.orders;
        document.getElementById("dashboard-reservations").textContent = stats.reservations;
        document.getElementById("dashboard-menu").textContent = stats.menu_items;
        document.getElementById("dashboard-users").textContent = stats.users;
    } catch (err) {
        // Optionally show a notification or log error
        console.error("Failed to load admin stats", err);
    }
}

/**
 * Fetches and updates menu statistics in the dashboard.
 *
 * @async
 * @function updateMenuStats
 * @returns {Promise<void>}
 */
async function updateMenuStats() {
    try {
        const stats = await fetchData(apiUrl("menu/stats"));
        // Update category counts
        for (const [cat, count] of Object.entries(stats.category_counts)) {
            const el = document.getElementById(`menu-stat-${cat.toLowerCase()}`);
            if (el) el.textContent = count;
        }
        // Update dietary counts
        for (const [diet, count] of Object.entries(stats.dietary_counts)) {
            const el = document.getElementById(`menu-stat-${diet.toLowerCase().replace(/ /g, '-')}`);
            if (el) el.textContent = count;
        }
        // Update hot selling item
        const hotEl = document.getElementById("menu-stat-hot");
        if (hotEl && stats.hot_selling_item.item) {
            hotEl.textContent = `${stats.hot_selling_item.item} (${stats.hot_selling_item.count})`;
        }
    } catch (err) {
        console.error("Failed to load menu stats", err);
    }
}

/**
 * Event listener to update menu stats on DOMContentLoaded.
 * @event DOMContentLoaded
 */
document.addEventListener("DOMContentLoaded", updateMenuStats);

/**
 * Event listener to update admin stats on DOMContentLoaded.
 * @event DOMContentLoaded
 */
document.addEventListener("DOMContentLoaded", updateAdminStats);
