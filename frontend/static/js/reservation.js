// frontend/static/js/reservation.js

import { apiUrl } from "./utils/config.js";
import fetchData from "./utils/fetchData.js";

document.addEventListener("DOMContentLoaded", () => {
    const form = document.getElementById("reservation-form");
    const messageBox = document.getElementById("reservation-message");

    if (!form) {
        console.warn("reservation-form not found in DOM");
        return;
    }

    form.addEventListener("submit", async (event) => {
        event.preventDefault();

        const formData = new FormData(form);

        const payload = {
            name: formData.get("name"),
            email: formData.get("email"),
            phone: formData.get("phone"),
            no_of_people: Number(formData.get("guests")),
            reservation_date: formData.get("date"),  // "YYYY-MM-DD"
            reservation_time: formData.get("time"),  // "HH:MM"
        };

        try {
            const data = await fetchData(apiUrl("reservation"), {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(payload),
            });

            console.log("Reservation created:", data);

            messageBox.textContent = "Reservation created successfully!";
            messageBox.style.color = "green";
            form.reset();
        } catch (error) {
            console.error("Reservation error:", error);

            const text =
                (error && (error.error || error.message)) ||
                "Failed to create reservation.";
            messageBox.textContent = text;
            messageBox.style.color = "red";
        }
    });
});
