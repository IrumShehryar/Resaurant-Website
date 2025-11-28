import { apiUrl } from "./utils/config.js";
import fetchData from "./utils/fetchData.js";

document.addEventListener("DOMContentLoaded", function () {
    const authBox = document.getElementById("auth-box");
    const authForm = document.getElementById("auth-form");
    const toggleText = document.getElementById("toggle-text");
    const nextUrlInput = document.getElementById("next-url");

    let mode = "login"; // default mode

    const roleInput = document.getElementById("role");
    const role = roleInput ? roleInput.value : "user";

    function getNextUrl() {
        return nextUrlInput && nextUrlInput.value ? nextUrlInput.value : "/";
    }

    function toggleForm(e) {
        // For admin login, do nothing (no sign-up)
        if (role === "admin") {
            e.preventDefault();
            return;
        }

        e.preventDefault();
        const toggleLink = e.target;

        if (toggleLink.textContent.includes("Sign up")) {
            // Switch to Sign-up Form
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
            // Switch back to Login Form
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

        // Re-attach click listener on the new link (login <> signup)
        const newToggleLink = document.getElementById("toggle-link");
        if (newToggleLink) {
            newToggleLink.addEventListener("click", toggleForm);
        }
    }

    // First link listener (only exists for customer login)
    const firstToggleLink = document.getElementById("toggle-link");
    if (firstToggleLink) {
        firstToggleLink.addEventListener("click", toggleForm);
    }

    // Submit handler for login / register
    authForm.addEventListener("submit", async function (e) {
        e.preventDefault();

        const formData = new FormData(authForm);
        const nextUrl = getNextUrl();

        if (mode === "login") {
            // LOGIN FLOW
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

                // Prefer top-level is_admin if present, otherwise look inside user
                const isAdmin = typeof data.is_admin !== "undefined"
                    ? data.is_admin
                    : (data.user && data.user.is_admin);

                if (isAdmin) {
                    // Admin: always go to admin interface
                    window.location.href = "/admin-interface";
                } else {
                    // Normal user: follow nextUrl (home, menu, etc.)
                    window.location.href = nextUrl;
                }
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

                // After register, go back to login with same next URL
                window.location.href = `/login?next=${encodeURIComponent(nextUrl)}`;
            } catch (err) {
                console.error(err);
                alert("Registration failed: " + err.message);
            }
        }
    });
});
