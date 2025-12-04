import { apiUrl } from "../utils/config.js";
import fetchData from "../utils/fetchData.js";

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

document.addEventListener("DOMContentLoaded", updateAdminStats);
