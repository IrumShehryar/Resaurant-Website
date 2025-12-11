/**
 * Handles checkout button click event to redirect user based on authentication status.
 * @event click
 */
document.getElementById("checkout-btn").addEventListener("click", () => {
    const token = localStorage.getItem("authToken");
    const redirectTo = "/revontulet/order-confirmation";

    if (!token) {
        window.location.href = `/revontulet/login?next=${encodeURIComponent(redirectTo)}`;
    } else {
        window.location.href = redirectTo;
    }
});
