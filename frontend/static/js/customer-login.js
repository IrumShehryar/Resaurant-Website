import { apiUrl } from "./utils/config.js";
import fetchData from "./utils/fetchData.js";
import { extractErrorMessage } from "./utils/errorMessage.js";
import { validateUserFormFields } from "./utils/validation.js";
import { showNotification } from "./utils/tableManager.js";

/**
 * Handles customer login and registration logic, including form toggling, validation, and authentication requests.
 * @event DOMContentLoaded
 */
document.addEventListener("DOMContentLoaded", async () => {
    const authBox = document.getElementById("auth-box");
    const nextUrlInput = document.getElementById("next-url");
    const roleInput = document.getElementById("role");
    const role = roleInput ? roleInput.value : "user";

    // Debug: Show role value for login context
    console.log("Login role:", role);

    
    // Track current form mode (login/register)
    let mode = "login";

    const getNextUrl = () => nextUrlInput && nextUrlInput.value ? nextUrlInput.value : "/revontulet/order-confirmation";

    const revealAuthBox = () => {
        authBox.classList.remove("hidden-auth");
    };

    const authForm = document.getElementById("auth-form");
    const toggleText = document.getElementById("toggle-text");
    const notificationElement = document.getElementById("notification");

    if (!authForm) {
        revealAuthBox();
        return;
    }

    // Event delegation for toggle and submit
    authBox.addEventListener("click", (e) => {
        if (e.target && e.target.id === "toggle-link") {
            toggleForm(e);
        }
    });
    authBox.addEventListener("submit", (e) => {
        if (e.target && e.target.id === "auth-form") {
            handleLoginSubmit(e);
        }
    });

    // -----------------------------
    // LOGOUT HANDLER UTILITY
    // -----------------------------
    /**
     * Attaches logout handler to the logout button.
     * @function attachLogoutHandler
     */
    const attachLogoutHandler = () => {
        const logoutBtn = document.getElementById("logout-btn");
        if (logoutBtn) {
            logoutBtn.addEventListener("click", () => {
                fetch(apiUrl("auth/logout"), {
                    method: "GET",
                    credentials: "same-origin" // send session cookie
                })
                .then(() => window.location.href = "/revontulet/login")
                .catch(err => console.error(err));
            });
        }
    };

    // -----------------------------
    // CHECK IF USER ALREADY LOGGED IN (skip for admin)
    // -----------------------------
    if (role !== "admin") {
        try {
            const userData = await fetchData(apiUrl("orders/user-details"), {
                method: "GET",
                credentials: "same-origin"
            });
            if (!userData.error) {
                authBox.innerHTML = `
                    <h2>Already Logged In</h2>
                    <p>Welcome back, ${userData.name}!</p>
                    <div class="auth-button-wrapper">
                        <button id="logout-btn" class="btn-order-now">Logout</button>
                    </div>
                `;
                attachLogoutHandler();
                revealAuthBox();
                return; // stop further setup
            }
        } catch (err) {
            console.error("Error checking login:", err);
        }
    }

    // -----------------------------
    // TOGGLE FORM LOGIN/REGISTER
    // -----------------------------
    const toggleForm = (e) => {
        e.preventDefault();
        const toggleLink = e.target;

            if (toggleLink.textContent.includes("Sign up")) {
                mode = "register";
                authBox.querySelector("h2").textContent = "Sign Up";
                authForm.innerHTML = `
                    <label>Full Name:<input type="text" name="name" required></label>
                    <label>Username:<input type="text" name="username" required></label>
                    <label>Email:<input type="email" name="email" required></label>
                    <label>Phone:<input type="text" name="phone" required></label>
                    <label>Address:<input type="text" name="address" required></label>
                    <label>Password:<input type="password" name="password" required></label>
                    <label>Confirm Password:<input type="password" name="confirm_password" required></label>
                    <button type="submit">Sign Up</button>
                `;
                if (toggleText) toggleText.innerHTML = `Already have an account? <a href="#" id="toggle-link">Log in here</a>`;
            } else {
                mode = "login";
                authBox.querySelector("h2").textContent = "Log In";
                authForm.innerHTML = `
                    <label>Username:<input type="text" name="username" required></label>
                    <label>Password:<input type="password" name="password" required></label>
                    <button type="submit">Log In</button>
                `;
                if (toggleText) toggleText.innerHTML = `Don't have an account? <a href="#" id="toggle-link">Sign up here</a>`;
            }
            const newToggleLink = document.getElementById("toggle-link");
            if (newToggleLink) newToggleLink.addEventListener("click", toggleForm);
            attachFormSubmit();

        setTimeout(() => {
            const newToggleLink = document.getElementById("toggle-link");
            if (newToggleLink) newToggleLink.addEventListener("click", toggleForm);
        }, 0);

        attachFormSubmit();
    };

    // -----------------------------
    // LOGIN / REGISTER SUBMIT
    // -----------------------------
    const handleLoginSubmit = async (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        const nextUrl = getNextUrl();

        if (mode === "login") {
            const username = formData.get("username");
            const password = formData.get("password");

            try {
                const data = await fetchData(apiUrl("auth/login"), {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    credentials: "same-origin",
                    body: JSON.stringify({ username, password })
                });

                if (role === "admin" && data.token) {
                    localStorage.setItem("authToken", data.token);
                    window.location.href = "/revontulet/admin-interface";
                    return;
                }

                if (data.user) {
                    authBox.innerHTML = `
                        <h2>Successfully Logged In</h2>
                        <p>Welcome, ${data.user.name || data.user.username}!<\/p>
                        <div class="auth-button-wrapper">
                            <button id="logout-btn" class="btn-order-now"> Logout<\/button>
                        <\/div>
                    `;
                    attachLogoutHandler();
                    console.log("Redirecting to:", nextUrl);
                    setTimeout(() => {
                        window.location.href = nextUrl;
                    }, 1000);
                    revealAuthBox();
                    return;
                }

                showNotification(data.message || "Login failed", "error", notificationElement);
            } catch (err) {
                console.error(err);
                showNotification(extractErrorMessage(err, "Login failed"), "error", notificationElement);
            }

        } else {
            const name = formData.get("name");
            const username = formData.get("username");
            const email = formData.get("email");
            const phone = formData.get("phone");
            const address = formData.get("address");
            const password = formData.get("password");
            const confirmPassword = formData.get("confirm_password");

            if (password !== confirmPassword) {
                showNotification("Passwords do not match", "error", notificationElement);
                return;
            }

            // Frontend validation
            const validation = validateUserFormFields({ name, email, phone, password });
            if (!validation.valid) {
                showNotification(validation.message, "error", notificationElement);
                return;
            }

            try {
                await fetchData(apiUrl("auth/register"), {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    credentials: "same-origin",
                    body: JSON.stringify({ name, username, email, phone, address, password })
                });
                showNotification("Registration successful!", "success", notificationElement);
                setTimeout(() => window.location.reload(), 1200);
            } catch (err) {
                console.error(err);
                showNotification(extractErrorMessage(err, "Registration failed"), "error", notificationElement);
            }
        }
    };

    revealAuthBox();
});
