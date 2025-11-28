import { apiUrl } from "./utils/config.js";
import fetchData from "./utils/fetchData.js";

document.addEventListener("DOMContentLoaded", function () {
    const authBox = document.getElementById("auth-box");
    const authForm = document.getElementById("auth-form");
    const toggleText = document.getElementById("toggle-text");
    const nextUrlInput = document.getElementById("next-url");
    
    let mode = "login"; // default mode
function getNextUrl() {
    return nextUrlInput.value || "/";
}

    function toggleForm(e) {
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

            toggleText.innerHTML = `
                Already have an account?
                <a href="#" id="toggle-link">Log in here</a>
            `;
        } else {
            // Switch back to Login Form
            mode ="login"
            authBox.querySelector("h2").textContent = "Log In";

            authForm.innerHTML = `
                <label>Email:
                    <input type="email" name="email" required>
                </label>

                <label>Password:
                    <input type="password" name="password" required>
                </label>

                <button type="submit">Log In</button>
            `;

            toggleText.innerHTML = `
                Don't have an account? 
                <a href="#" id="toggle-link">Sign up here</a>
            `;
        }

        // Re-attach click listener
        document.getElementById("toggle-link").addEventListener("click", toggleForm);
    }

    // First link listener
    document.getElementById("toggle-link").addEventListener("click", toggleForm);
    
    authForm.addEventListener("submit", async function (e) {
        e.preventDefault();

        const formData = new FormData(authForm);
        const nextUrl = getNextUrl();
        if (mode === "login") {
    // LOGIN FLOW
    const email = formData.get("email");
    const password = formData.get("password");

    try {
        const data = await fetchData(
            apiUrl("auth/login"),
            {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                // backend expects username, we use email as username
                body: JSON.stringify({ username: email, password })
            }
        );

        // fetchData returns parsed JSON if 2xx, throws otherwise
        if (data.token) {
            localStorage.setItem("authToken", data.token);
        }

        window.location.href = nextUrl;
    } catch (err) {
        console.error(err);
        // err.message comes from your fetchData error
        alert("Login failed: " + err.message);
    }
} else {
    // REGISTER FLOW
    const name = formData.get("name");
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
        const data = await fetchData(
            apiUrl("auth/register"),
            {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    name,
                    email,
                    phone,
                    address,
                    password
                    // username will be set to email in backend
                })
            }
        );

        // If you want you can auto-log them in here if backend returns token
        // For now, just redirect back to login:
        window.location.href = `/login?next=${encodeURIComponent(nextUrl)}`;
    } catch (err) {
        console.error(err);
        alert("Registration failed: " + err.message);
    }
}

    });
})
