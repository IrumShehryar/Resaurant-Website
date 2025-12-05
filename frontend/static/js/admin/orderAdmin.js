// static/js/admin/reservationsAdmin.js

import { getAllOrders } from "../services/orderService.js";
import { showNotification, createModalManager } from "../utils/tableManager.js";
import { renderTable } from "../utils/tableRenderer.js";
import { createCrudManager } from "../services/crudServices.js";
import { countStatuses, countCreatedToday } from "../utils/statusCounter.js";
import { extractErrorMessage } from "../utils/errorMessage.js";
import { validateOrderFormFields } from "../utils/validation.js";

// ========== DOM Elements ==========
const modal = document.getElementById("order-admin-modal");
const closeBtn = modal ? modal.querySelector(".modal-close") : null;
const addBtn = document.getElementById("btn-add-order");
const form = document.getElementById("order-form");
const orderTbody = document.getElementById("orders-tbody");
const notificationElement = document.getElementById("notification");
const formTitle = document.getElementById("order-form-title");

// Store original title text ({{ t.add_new_order }})
const defaultFormTitle = formTitle ? formTitle.textContent : "Add new order";

// ========== Utilities Initialization ==========
const modalManager = createModalManager();

const orderCrud = createCrudManager("orders");

// ========== State Management ==========
let currentEditId = null;
let allOrders = [];

// ========== Load & Render ==========

async function loadOrders() {
    try {
        const items = await getAllOrders();
        allOrders = items;
        console.log("order received:", items);

        // --- Dynamic Order Stats ---
                // 1. Count by status
                const orderStatuses = ["pending", "ready", "completed","cancelled"];
                const orderCounts = countStatuses(items, "status", orderStatuses);
            // Change field if needed
        
                // 3. Update DOM (make sure you have these IDs in your HTML)
                const pendingEl = document.getElementById("orders-pending");
                const readyEl = document.getElementById("orders-ready");
                const completedEl = document.getElementById("orders-completed");
                const cancelledEl = document.getElementById("orders-cancelled");
                //const newTodayEl = document.getElementById("orders-new");
                if (pendingEl) pendingEl.textContent = orderCounts.pending;
                if (readyEl) readyEl.textContent = orderCounts.ready;
                if (completedEl) completedEl.textContent = orderCounts.completed;
                if (cancelledEl) cancelledEl.textContent = orderCounts.cancelled;
                //if (newTodayEl) newTodayEl.textContent = newReservationsToday;

        // Show main columns in table
        renderTable(
            items,
            [ "id","name","phone","total","status"],
            orderTbody
        );
    } catch (error) {
        console.error("Error loading order:", error);
        orderTbody.innerHTML =
            '<tr><td colspan="6">Error loading order</td></tr>';
    }
}

// Helper: get item from cached array by row data-id
const getOrderFromRow = (row) => {
    const id = row.dataset.id;
    return allOrders.find((r) => r.id === id);
};

// ========== Event Listeners ==========



// Add button: open modal to create new order
if (addBtn) {
    addBtn.addEventListener("click", () => {
        currentEditId = null;
        form.reset();
        if (formTitle) {
            formTitle.textContent = defaultFormTitle; // back to "Add new order" (translated in HTML)
        }
        // Fix the items label every time modal opens
        const itemsField = document.getElementById("editOrderItems");
        if (itemsField) {
            // Find the label that is the parent of the textarea
            const label = itemsField.closest("label");
            if (label) {
                label.textContent = "Items (Format: item_name:quantity, e.g. Pizza:2, Burger:1):";
                // Re-append the textarea to the label (since setting textContent removes children)
                label.appendChild(itemsField);
            }
        }
        modalManager.open(modal);
    });
}

// Setup modal closing mechanisms
if (closeBtn && modal) {
    modalManager.setupCloseButton(closeBtn, modal);
    modalManager.setupBackdropClick(modal);
}

// Edit button: load order into form for editing
if (orderTbody) {
    orderTbody.addEventListener("click", async (e) => {
        if (!e.target.classList.contains("btn-edit")) return;

        const row = e.target.closest("tr");
        const item = getOrderFromRow(row);
        if (!item) return;

        currentEditId = item.id;

        if (formTitle) {
            formTitle.textContent = "Edit Order"; // you can later translate this via data-attr if needed
        }

        // Populate form fields
        form.id.value = item.id || "";
        form.name.value = item.name || "";
        form.phone.value = item.phone || "";
        form.email.value = item.email || "";
        form.address.value = item.address || "";
        form.payment_method.value = item.payment_method || "cash";

        // Fix label bug: ensure correct field and label
        const itemsField = document.getElementById("editOrderItems");
        if (itemsField) {
            itemsField.value = Array.isArray(item.items)
                ? item.items.map(i => `${i.item_name}:${i.quantity}`).join(", ")
                : "";
            // Also fix the label if needed
            const label = itemsField.closest("label");
            if (label) {
                label.textContent = "Items (Format: item_name:quantity, e.g. Pizza:2, Burger:1):";
                label.appendChild(itemsField);
            }
        }
        
        form.subtotal.value = item.subtotal || "";
        form.delivery_charges.value = item.delivery_charges || "";
        form.total.value = item.total || "";
        form.order_date.value = item.order_date || "";
        form.order_time.value = item.order_time || "";
        form.status.value = item.status || "pending";
       // form.created_at.value = item.created_at || "";
        modal.style.display = "block";
    });
}



// Form submission: create or update order
if (form) {
    form.addEventListener("submit", async (e) => {
        e.preventDefault();
        const formData = new FormData(form);

        // Parse items field: expects format like "pizza:2, burger:1"
        // Converts to array: [ { item_name: "pizza", quantity: 2 }, ... ]
        const itemsRaw = formData.get("items").trim();
        const items = itemsRaw.split(",").map(entry => {
            const [item_name, quantity] = entry.split(":").map(s => s.trim());
            return { item_name, quantity: Number(quantity) };
        }).filter(item => item.item_name && item.quantity);

        // Build data object for backend
        const data = {
            name: formData.get("name").trim(),
            email: formData.get("email").trim(),
            phone: formData.get("phone").trim(),
            address: formData.get("address").trim(), // required by backend
            order_date: formData.get("order_date").trim(),
            order_time: formData.get("order_time").trim(),
            subtotal: Number(formData.get("subtotal")), // required by backend
            delivery_charges: Number(formData.get("delivery_charges")), // required by backend
            total: Number(formData.get("total")),
            status: formData.get("status"),
            items, // array of { item_name, quantity }
        };

        // Unified validation
        const validation = validateOrderFormFields(data);
        if (!validation.valid) {
            showNotification(validation.message, "error", notificationElement);
            return;
        }

        try {
            if (currentEditId) {
                // Update existing order
                await orderCrud.update(currentEditId, data);
            } else {
                // Create new order
                await orderCrud.create(data);
            }

            modal.style.display = "none";
            form.reset();

            await loadOrders();
            showNotification("Order saved successfully!", "success", notificationElement);
        } catch (error) {
            console.error(error);
            showNotification(extractErrorMessage(error, "Error saving Order"), "error", notificationElement);
        }
    });
}

// Delete button: remove reservation from database
if (orderTbody) {
    orderTbody.addEventListener("click", async (e) => {
        if (!e.target.classList.contains("btn-delete")) return;

        const row = e.target.closest("tr");
        const item = getOrderFromRow(row);

        if (item && confirm(`Are you sure you want to delete order for "${item.name}"?`)) {
            try {
                await orderCrud.deleteItem(item.id);
                await loadOrders();
                showNotification("order deleted successfully!", "success", notificationElement);
            } catch (error) {
                console.error(error);
                showNotification("Error deleting order", "error", notificationElement);
            }
        }
    });
}

// ========== Initialize Page ==========
loadOrders();