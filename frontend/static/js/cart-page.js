document.getElementById("checkout-btn").addEventListener("click", () => {
    const token = localStorage.getItem("authToken");
    const redirectTo = "/order-confirmation";

    if (!token) {
        window.location.href = `/login?next=${encodeURIComponent(redirectTo)}`;
    } else {
        window.location.href = redirectTo;
    }
});
