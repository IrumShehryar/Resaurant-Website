import { apiUrl } from "./utils/config.js";
import fetchData from "./utils/fetchData.js";

document.addEventListener("DOMContentLoaded", function () {

    const authBox = document.getElementById("auth-box");
    const nextUrlInput = document.getElementById("next-url");
    const roleInput = document.getElementById("role");
    const role = roleInput ? roleInput.value : "user";

    let mode = "login"; // default mode

    // Get next URL (default to home if missing)
    function getNextUrl() {
        return nextUrlInput && nextUrlInput.value ? nextUrlInput.value : "/";
    }

    // ============================
    // SHOW SUCCESS BOX
    // ============================
    function showLoggedInBox(redirectUrl = null) {
        authBox.innerHTML = `
            <h2>Successfully Logged In</h2>
            <p>You are now logged in!</p>
            <div class="auth-button-wrapper">
                <button id="logout-btn" class="btn-order-now">Logout</button>
            </div>
        `;

        // Logout listener
        document.getElementById("logout-btn").addEventListener("click", () => {
            localStorage.removeItem("authToken");
            window.location.reload();
        });

        // CASE B: redirect to the previous page after 2 seconds if provided
        if (redirectUrl && redirectUrl !== "/") {
            setTimeout(() => {
                window.location.href = redirectUrl;
            }, 2000); // 2 seconds delay
        }
    }

    // ============================
    // REVEAL AUTH BOX (PREVENT FLASH)
    // ============================
    function revealAuthBox() {
        authBox.classList.remove("hidden-auth");
    }

    // ============================
    // CHECK IF ALREADY LOGGED IN
    // ============================
    if (localStorage.getItem("authToken")) {
        showLoggedInBox(getNextUrl());
        revealAuthBox();
        return; // stop further setup
    }

    const authForm = document.getElementById("auth-form");
    const toggleText = document.getElementById("toggle-text");

    if (!authForm) {
        revealAuthBox();
        return;
    }

    // ============================
    // TOGGLE LOGIN / REGISTER FORM
    // ============================
    function toggleForm(e) {
        if (role === "admin") {
            e.preventDefault();
            return;
        }

        e.preventDefault();
        const toggleLink = e.target;

        if (toggleLink.textContent.includes("Sign up")) {
            mode = "register";
            authBox.querySelector("h2").textContent = "Sign Up";

            authForm.innerHTML = `
                <label>Full Name:
                    <input type="text" name="name" required>
                </label>
                <label>Username:
                    <input type="text" name="username" required>
                </label>
                <label>Email:
                    <input type="email" name="email" required>
                </label>
                <label>Phone:
                    <input type="text" name="phone" required>
                </label>
                <label>Address:
                    <input type="text" name="address" required>
                </label>
                <label>Password:
                    <input type="password" name="password" required>
                </label>
                <label>Confirm Password:
                    <input type="password" name="confirm_password" required>
                </label>
                <button type="submit">Sign Up</button>
            `;

            if (toggleText) {
                toggleText.innerHTML = `
                    Already have an account?
                    <a href="#" id="toggle-link">Log in here</a>
                `;
            }

        } else {
            mode = "login";
            authBox.querySelector("h2").textContent = "Log In";

            authForm.innerHTML = `
                <label>Username:
                    <input type="text" name="username" required>
                </label>
                <label>Password:
                    <input type="password" name="password" required>
                </label>
                <button type="submit">Log In</button>
            `;

            if (toggleText) {
                toggleText.innerHTML = `
                    Don't have an account?
                    <a href="#" id="toggle-link">Sign up here</a>
                `;
            }
        }

        // Reattach toggle listener
        const newToggleLink = document.getElementById("toggle-link");
        if (newToggleLink) {
            newToggleLink.addEventListener("click", toggleForm);
        }

        // Reattach submit listener after form replacement
        attachFormSubmit();
    }

    // Initial toggle link listener
    const firstToggleLink = document.getElementById("toggle-link");
    if (firstToggleLink) {
        firstToggleLink.addEventListener("click", toggleForm);
    }

    // ============================
    // LOGIN / REGISTER SUBMIT
    // ============================
    async function handleLoginSubmit(e) {
        e.preventDefault();

        const formData = new FormData(authForm);
        const nextUrl = getNextUrl();

        if (mode === "login") {
            const username = formData.get("username");
            const password = formData.get("password");

            try {
                const data = await fetchData(
                    apiUrl("auth/login"),
                    {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ username, password })
                    }
                );

                if (data.token) {
                    localStorage.setItem("authToken", data.token);
                }

                const isAdmin =
                    typeof data.is_admin !== "undefined"
                        ? data.is_admin
                        : (data.user && data.user.is_admin);

                if (isAdmin) {
                    window.location.href = "/admin-interface";
                    return;
                }

                // CASE A: Direct login → no next_url or next_url is "/" → show success box
                if (!nextUrl || nextUrl === "/") {
                    showLoggedInBox();
                    revealAuthBox();
                    return;
                }

                // CASE B: Login from any page → show success box + redirect to previous page after 2s
                showLoggedInBox(nextUrl);
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
                await fetchData(
                    apiUrl("auth/register"),
                    {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({
                            name,
                            username,
                            email,
                            phone,
                            address,
                            password
                        })
                    }
                );

                window.location.href = `/login?next=${encodeURIComponent(nextUrl)}`;
            } catch (err) {
                console.error(err);
                alert("Registration failed: " + err.message);
            }
        }
    }

    // ============================
    // ATTACH SUBMIT LISTENER
    // ============================
    function attachFormSubmit() {
        const currentForm = document.getElementById("auth-form");
        if (currentForm) {
            currentForm.addEventListener("submit", handleLoginSubmit);
        }
    }

    attachFormSubmit();

    // Reveal login form after setup to prevent flash
    revealAuthBox();

});
