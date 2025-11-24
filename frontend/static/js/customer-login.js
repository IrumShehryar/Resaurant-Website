document.addEventListener("DOMContentLoaded", function () {
    const authBox = document.getElementById("auth-box");
    const authForm = document.getElementById("auth-form");
    const toggleText = document.getElementById("toggle-text");

    function toggleForm(e) {
        e.preventDefault();
        const toggleLink = e.target;

        if (toggleLink.textContent.includes("Sign up")) {
            // Switch to Sign-up Form
            authBox.querySelector("h2").textContent = "Sign Up";

            authForm.innerHTML = `
                <label>Full Name:
                    <input type="text" name="name" required>
                </label>

                <label>Email:
                    <input type="email" name="email" required>
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
});
