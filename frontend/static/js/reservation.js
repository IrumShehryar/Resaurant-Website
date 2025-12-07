// frontend/static/js/reservation.js

import { apiUrl } from "./utils/config.js";
import fetchData from "./utils/fetchData.js";
import { validateReservationFormFields } from "./utils/validation.js";
import { extractErrorMessage } from "./utils/errorMessage.js";
import { showNotification } from "./utils/tableManager.js";

/**
 * Handles reservation form submission and validation.
 * Adds event listeners to the reservation form and displays messages.
 *
 * @event DOMContentLoaded
 */
document.addEventListener("DOMContentLoaded", () => {
    /**
     * @type {HTMLFormElement}
     */
    const form = document.getElementById("reservation-form");
    /**
     * @type {HTMLElement}
     */
    const messageBox = document.getElementById("reservation-message");
    // Use or create a notification element for toast
    let notificationElement = document.getElementById("notification");
    if (!notificationElement) {
        notificationElement = document.createElement("div");
        notificationElement.id = "notification";
        document.body.appendChild(notificationElement);
    }

    if (!form) {
        console.warn("reservation-form not found in DOM");
        return;
    }

    /**
     * Handles the reservation form submit event.
     *
     * @param {Event} event - The submit event object.
     */
    form.addEventListener("submit", async (event) => {
        event.preventDefault();

        /**
         * @type {FormData}
         */
        const formData = new FormData(form);

        /**
         * @typedef {Object} ReservationPayload
         * @property {string} name
         * @property {string} email
         * @property {string} phone
         * @property {number} no_of_people
         * @property {string} reservation_date - Format YYYY-MM-DD
         * @property {string} reservation_time - Format HH:MM
         */
        const payload = {
            name: formData.get("name"),
            email: formData.get("email"),
            phone: formData.get("phone"),
            no_of_people: Number(formData.get("guests")),
            reservation_date: formData.get("date"),  // "YYYY-MM-DD"
            reservation_time: formData.get("time"),  // "HH:MM"
        };

        // Frontend validation
        /**
         * @type {{valid: boolean, message: string}}
         */
        const validation = validateReservationFormFields(payload);
        if (!validation.valid) {
            messageBox.textContent = validation.message;
            messageBox.style.color = "red";
            return;
        }

        try {
            /**
             * @type {Object}
             * @description Response data from reservation API
             */
            const data = await fetchData(apiUrl("reservation"), {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(payload),
            });

            console.log("Reservation created:", data);
            alert("Your table has been reserved!");

           /* showNotification((window.t && window.t.reservation_success) ? window.t.reservation_success : "Reservation created successfully!", "success", notificationElement);
            messageBox.textContent = "";
            messageBox.style.color = "";*/
            form.reset();
        } catch (error) {
            console.error("Reservation error:", error);
            messageBox.textContent = extractErrorMessage(error, "Failed to create reservation.");
            messageBox.style.color = "red";
        }
    });
});
