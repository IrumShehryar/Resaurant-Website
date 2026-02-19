import { apiUrl } from "./utils/config.js";
import fetchData from "./utils/fetchData.js";

/**
 * Guards admin pages by verifying authentication and role.
 * Redirects to login if not authenticated or not admin.
 * @event DOMContentLoaded
 */
document.addEventListener("DOMContentLoaded", async () => {
    const token = localStorage.getItem("authToken");

    // Not logged in at all → send to admin login
    if (!token) {
        window.location.href = "/admin-login";
        return;
    }

    try {
        // Call protected /users/me endpoint
        const data = await fetchData(
            apiUrl("users/me"),
            {
                method: "GET",
                headers: {
                    "Authorization": `Bearer ${token}`
                }
            }
        );

        const isAdmin = data.role === "admin";

        if (!isAdmin) {
            // Logged in but not admin → send to normal login/home
            window.location.href = "/login";
        }
        // If admin, do nothing – page stays visible
    } catch (err) {
        console.error("Failed to verify admin token", err);
        // Token invalid/expired → go to admin login
        window.location.href = "/admin-login";
    }
});
