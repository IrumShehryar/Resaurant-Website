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
    const orderTime = now.toLocaleString();

    document.getElementById("order-number").textContent = orderNumber;
    document.getElementById("order-time").textContent   = orderTime;

    // Save for reuse (success page / history)
    localStorage.setItem("lastOrder", JSON.stringify({
        orderNumber,
        subtotal,
        deliveryFee,
        total,
        time: orderTime
    }));

    // --------------------------------------------------------
    // FINAL PLACE ORDER BUTTON
    // --------------------------------------------------------
    document.getElementById("place-order-final").addEventListener("click", () => {
        alert("Order Placed Successfully!\nOrder No: " + orderNumber);

        // Clear cart
        localStorage.removeItem("cart");
        localStorage.removeItem("cartTotal");

        // Redirect after placing order
        window.location.href = "/menu";
    });
});
