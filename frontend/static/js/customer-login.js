import { apiUrl } from "./utils/config.js";

document.addEventListener("DOMContentLoaded", async function () {

    const authBox = document.getElementById("auth-box");
    const nextUrlInput = document.getElementById("next-url");
    const roleInput = document.getElementById("role");
    const role = roleInput ? roleInput.value : "user";

    let mode = "login"; // default

    function getNextUrl() {
        return nextUrlInput && nextUrlInput.value ? nextUrlInput.value : "/order-confirmation";
    }

    function revealAuthBox() {
        authBox.classList.remove("hidden-auth");
    }

    const authForm = document.getElementById("auth-form");
    const toggleText = document.getElementById("toggle-text");

    if (!authForm) {
        revealAuthBox();
        return;
    }

    // -----------------------------
    // LOGOUT HANDLER UTILITY
    // -----------------------------
    function attachLogoutHandler() {
        const logoutBtn = document.getElementById("logout-btn");
        if (logoutBtn) {
            logoutBtn.addEventListener("click", () => {
                fetch(apiUrl("auth/logout"), {
                    method: "GET",
                    credentials: "same-origin" // send session cookie
                })
                .then(() => window.location.href = "/login")
                .catch(err => console.error(err));
            });
        }
    }

    // -----------------------------
    // CHECK IF USER ALREADY LOGGED IN
    // -----------------------------
    try {
        const userData = await fetch(apiUrl("orders/user-details"), {
            method: "GET",
            credentials: "same-origin"
        }).then(res => res.json());

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

    // -----------------------------
    // TOGGLE FORM LOGIN/REGISTER
    // -----------------------------
    function toggleForm(e) {
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
    }

    const firstToggleLink = document.getElementById("toggle-link");
    if (firstToggleLink) firstToggleLink.addEventListener("click", toggleForm);

    // -----------------------------
    // LOGIN / REGISTER SUBMIT
    // -----------------------------
    async function handleLoginSubmit(e) {
        e.preventDefault();
        const formData = new FormData(authForm);
        const nextUrl = getNextUrl();

        if (mode === "login") {
            const username = formData.get("username");
            const password = formData.get("password");

            try {
                const data = await fetch(apiUrl("auth/login"), {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    credentials: "same-origin",
                    body: JSON.stringify({ username, password })
                }).then(res => res.json());

                if (!data.user) {
                    alert(data.message || "Login failed");
                    return;
                }

                // Show logged-in box and attach logout
                authBox.innerHTML = `
                    <h2>Successfully Logged In</h2>
                    <p>Welcome, ${data.user.name || data.user.username}!</p>
                    <div class="auth-button-wrapper">
                        <button id="logout-btn" class="btn-order-now">Logout</button>
                    </div>
                `;
                attachLogoutHandler();

                // Redirect to order-confirmation after 1 second
                setTimeout(() => {
                    window.location.href = nextUrl;
                }, 1000);

                revealAuthBox();

            } catch (err) {
                console.error(err);
                alert("Login failed: " + err.message);
            }

        } else {
            // REGISTER FLOW
            const name = formData.get("name");
            const username = formData.get("username");
            const email = formData.get("email");
            const phone = formData.get("phone");
            const address = formData.get("address");
            const password = formData.get("password");
            const confirmPassword = formData.get("confirm_password");

            if (password !== confirmPassword) {
                alert("Passwords do not match");
                return;
            }

            try {
                await fetch(apiUrl("auth/register"), {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    credentials: "same-origin",
                    body: JSON.stringify({ name, username, email, phone, address, password })
                });

                // After register, reload page to show login box
                window.location.reload();
            } catch (err) {
                console.error(err);
                alert("Registration failed: " + err.message);
            }
        }
    }

    function attachFormSubmit() {
        const currentForm = document.getElementById("auth-form");
        if (currentForm) currentForm.addEventListener("submit", handleLoginSubmit);
    }

    attachFormSubmit();
    revealAuthBox();
});
