// static/js/admin/reservationsAdmin.js

import { getAllReservations } from "../services/reservationService.js";
import { showNotification, createModalManager } from "../utils/tableManager.js";
import { renderTable } from "../utils/tableRenderer.js";
import { createCrudManager } from "../services/crudServices.js";
import { countStatuses, countCreatedToday } from "../utils/statusCounter.js";
import { extractErrorMessage } from "../utils/errorMessage.js";
import { validateReservationFormFields } from "../utils/validation.js";

// ========== DOM Elements ==========
const modal = document.getElementById("reservation-modal");
const closeBtn = modal ? modal.querySelector(".modal-close") : null;
const addBtn = document.getElementById("btn-add-reservation");
const form = document.getElementById("reservation-form");
const reservationTbody = document.getElementById("reservation-tbody");
const notificationElement = document.getElementById("notification");
const formTitle = document.getElementById("reservation-form-title");

// Store original title text ({{ t.add_new_reservation }})
const defaultFormTitle = formTitle ? formTitle.textContent : "Add new reservation";

// ========== Utilities Initialization ==========
const modalManager = createModalManager();
// IMPORTANT: keep this string consistent with how crudServices builds URLs.
// If menu uses createCrudManager("menu"), and your backend reservation route is /api/v1/reservation,
// then "reservation" is correct here.
const reservationCrud = createCrudManager("reservation");

// ========== State Management ==========
let currentEditId = null;
let allReservations = [];

// ========== Load & Render ==========

async function loadReservations() {
    try {
        const items = await getAllReservations();
        allReservations = items;
        console.log("Reservations received:", items);

        // --- Dynamic Reservation Stats ---
        // 1. Count by status
        const reservationStatuses = ["pending", "confirmed", "cancelled"];
        const reservationCounts = countStatuses(items, "status", reservationStatuses);
        // 2. Count new reservations today (if you want to show this stat)
        const newReservationsToday = countCreatedToday(items, "created_at"); // Change field if needed

        // 3. Update DOM (make sure you have these IDs in your HTML)
        const pendingEl = document.getElementById("reservations-pending");
        const confirmedEl = document.getElementById("reservations-confirmed");
        const cancelledEl = document.getElementById("reservations-cancelled");
        const newTodayEl = document.getElementById("reservations-new");
        if (pendingEl) pendingEl.textContent = reservationCounts.pending;
        if (confirmedEl) confirmedEl.textContent = reservationCounts.confirmed;
        if (cancelledEl) cancelledEl.textContent = reservationCounts.cancelled;
        if (newTodayEl) newTodayEl.textContent = newReservationsToday;

        // Show main columns in table
        renderTable(
            items,
            ["name", "phone", "email", "reservation_date", "reservation_time", "no_of_people", "status"],
            reservationTbody
        );
    } catch (error) {
        console.error("Error loading reservation:", error);
        reservationTbody.innerHTML =
            '<tr><td colspan="8">Error loading reservations</td></tr>';
    }
}

// Helper: get item from cached array by row data-id
const getReservationFromRow = (row) => {
    const id = row.dataset.id;
    return allReservations.find((r) => r.id === id);
};

// ========== Event Listeners ==========

// Add button: open modal to create new reservation
if (addBtn) {
    addBtn.addEventListener("click", () => {
        currentEditId = null;
        form.reset();
        if (formTitle) {
            formTitle.textContent = defaultFormTitle; // back to "Add new reservation" (translated in HTML)
        }
        modalManager.open(modal);
    });
}

// Setup modal closing mechanisms
if (closeBtn && modal) {
    modalManager.setupCloseButton(closeBtn, modal);
    modalManager.setupBackdropClick(modal);
}

// Edit button: load reservation into form for editing
if (reservationTbody) {
    reservationTbody.addEventListener("click", async (e) => {
        if (!e.target.classList.contains("btn-edit")) return;

        const row = e.target.closest("tr");
        const item = getReservationFromRow(row);
        if (!item) return;

        currentEditId = item.id;

        if (formTitle) {
            formTitle.textContent = "Edit reservation"; // you can later translate this via data-attr if needed
        }

        // Populate form fields
        form.name.value = item.name || "";
        form.phone.value = item.phone || "";
        form.email.value = item.email || "";
        form.reservation_date.value = item.reservation_date || "";
        form.reservation_time.value = item.reservation_time || "";
        form.no_of_people.value = item.no_of_people ?? 1;
        form.status.value = item.status || "pending";

        modal.style.display = "block";
    });
}

// Form submission: create or update reservation
if (form) {
    form.addEventListener("submit", async (e) => {
        e.preventDefault();
        const formData = new FormData(form);

        const data = {
            name: formData.get("name").trim(),
            phone: formData.get("phone").trim(),
            email: formData.get("email").trim(),
            reservation_date: formData.get("reservation_date"),
            reservation_time: formData.get("reservation_time"),
            no_of_people: Number(formData.get("no_of_people")),
            status: formData.get("status"),
        };

            // Frontend validation
            const validation = validateReservationFormFields(data);
            if (!validation.valid) {
                showNotification(validation.message, "error", notificationElement);
                return;
            }

        try {
            if (currentEditId) {
                // Update existing reservation
                await reservationCrud.update(currentEditId, data);
            } else {
                // Create new reservation
                await reservationCrud.create(data);
            }

            modal.style.display = "none";
            form.reset();

            await loadReservations();
            showNotification("Reservation saved successfully!", "success", notificationElement);
        } catch (error) {
            console.error(error);
            showNotification(extractErrorMessage(error, "Error saving reservation"), "error", notificationElement);
        }
    });
}

// Delete button: remove reservation from database
if (reservationTbody) {
    reservationTbody.addEventListener("click", async (e) => {
        if (!e.target.classList.contains("btn-delete")) return;

        const row = e.target.closest("tr");
        const item = getReservationFromRow(row);

        if (item && confirm(`Are you sure you want to delete reservation for "${item.name}"?`)) {
            try {
                await reservationCrud.deleteItem(item.id);
                await loadReservations();
                showNotification("Reservation deleted successfully!", "success", notificationElement);
            } catch (error) {
                console.error(error);
                showNotification(extractErrorMessage(error, "Error deleting reservation"), "error", notificationElement);
            }
        }
    });
}

// ========== Initialize Page ==========
loadReservations();
