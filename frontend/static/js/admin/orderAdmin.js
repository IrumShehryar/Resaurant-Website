// static/js/admin/reservationsAdmin.js

import { getAllOrders } from "../services/orderService.js";
import { showNotification, createModalManager } from "../utils/tableManager.js";
import { renderTable } from "../utils/tableRenderer.js";
import { createCrudManager } from "../services/crudServices.js";

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

        // Show main columns in table
        renderTable(
            items,
            [ "order_id","name","phone","total","status"],
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
        form.name.value = item.name || "";
        form.phone.value = item.phone || "";
        form.email.value = item.email || "";
        form.address.value = item.address || "";
        form.payment_method.value = item.payment_method || "cash";
        form.items.value = item.items && Array.isArray(item.items)
            ? item.items.map(i => `${i.item_name}:${i.quantity}`).join(", ")
            : "";
        form.subtotal.value = item.subtotal || "";
        form.delivery_charges.value = item.delivery_charges || "";
        form.total.value = item.total || "";
        form.order_date.value = item.order_date || "";
        form.order_time.value = item.order_time || "";
        form.status.value = item.status || "pending";
        form.created_at.value = item.created_at || "";
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
            total: Number(formData.get("total")),
            status: formData.get("status"),
        };

        // Simple validation
        if (!data.name || data.name.length < 3) {
            showNotification("Name must be at least 3 characters", "error", notificationElement);
            return;
        }
        if (!data.phone) {
            showNotification("Phone is required", "error", notificationElement);
            return;
        }
        if (!data.total || data.total <= 0) {
            showNotification("Order amount is required", "error", notificationElement);
            return;
        }
        if (!data.status){
            showNotification("Status must be added", "error", notificationElement);
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
            showNotification("Error saving Order", "error", notificationElement);
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