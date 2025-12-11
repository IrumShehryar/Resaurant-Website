/**
 * Handles order confirmation page logic, including cart totals, order number generation, and final order placement.
 * @event DOMContentLoaded
 */
document.addEventListener("DOMContentLoaded", () => {
    // --------------------------------------------------------
    // LOAD CART TOTALS
    // --------------------------------------------------------
    const subtotal = parseFloat(localStorage.getItem("cartTotal")) || 0;
    const deliveryFee = 3.50;
    const total = subtotal + deliveryFee;

    document.getElementById("subtotal").textContent      = "€" + subtotal.toFixed(2);
    document.getElementById("delivery-fee").textContent  = "€" + deliveryFee.toFixed(2);
    document.getElementById("total-amount").textContent  = "€" + total.toFixed(2);

    // --------------------------------------------------------
    // GENERATE ORDER NUMBER & TIMESTAMP
    // --------------------------------------------------------
    const orderNumber = "ORD-" + Math.floor(100000 + Math.random() * 900000);
    const now = new Date();
    const orderDate = now.toISOString().slice(0, 10); // YYYY-MM-DD
    const orderTime = now.toTimeString().slice(0, 5); // HH:MM

    document.getElementById("order-number").textContent = orderNumber;
    document.getElementById("order-time").textContent   = now.toLocaleString();

    // --------------------------------------------------------
    // FINAL PLACE ORDER BUTTON
    // --------------------------------------------------------
    /**
     * Handles the final order placement when the button is clicked.
     * @param {MouseEvent} event
     */
    document.getElementById("place-order-final").addEventListener("click", async () => {
        // Get user info from page
        const name = document.getElementById("user-name").textContent;
        const phone = document.getElementById("user-phone").textContent;
        const email = document.getElementById("user-email").textContent;
        const address = document.getElementById("user-address").textContent;
        const payment_method = document.getElementById("payment_method").value;

        // Get cart items from localStorage
        const cart = JSON.parse(localStorage.getItem("cart")) || [];
        if (cart.length === 0) {
            alert("Your cart is empty!");
            return;
        }

        // Prepare order data
        const orderData = {
            name,
            phone,
            email,
            address,
            payment_method,
            items: cart.map(item => ({
                item_name: item.name,
                quantity: item.quantity
            })),
            subtotal,
            delivery_charges: deliveryFee,
            total,
            order_date: orderDate,
            order_time: orderTime
        };

        try {
            const response = await fetch("/revontulet/api/v1/orders/", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(orderData)
            });

            if (!response.ok) {
                const err = await response.json();
                alert("Failed to place order: " + (err.error || "Unknown error"));
                return;
            }

            const result = await response.json();
            alert(`Order Placed Successfully!\nOrder No: ${result.order_id}\nPayment: ${result.payment_method}`);

            // Clear cart
            localStorage.removeItem("cart");
            localStorage.removeItem("cartTotal");

            // Redirect to menu or success page
            window.location.href = "/revontulet/menu";
        } catch (error) {
            console.error(error);
            alert("An error occurred while placing your order.");
        }
    });
});
