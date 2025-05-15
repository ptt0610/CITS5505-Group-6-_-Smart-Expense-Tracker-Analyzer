document.addEventListener("DOMContentLoaded", function () {
    // Enable Bootstrap tooltips
    $('[data-toggle="tooltip"]').tooltip();

    const form = document.querySelector("form.user");
    const passwordInput = document.getElementById("password");
    const repeatPasswordInput = document.getElementById("repeatPassword");
    const emailInput = document.getElementById("email");
    const strengthBar = document.getElementById("passwordStrengthBar");

    const togglePasswordBtn = document.getElementById("togglePassword");
    const toggleRepeatPasswordBtn = document.getElementById("toggleRepeatPassword");

    // Toggle password visibility
    togglePasswordBtn.addEventListener("click", function () {
        const type = passwordInput.getAttribute("type") === "password" ? "text" : "password";
        passwordInput.setAttribute("type", type);
        this.classList.toggle("fa-eye");
        this.classList.toggle("fa-eye-slash");
    });

    toggleRepeatPasswordBtn.addEventListener("click", function () {
        const type = repeatPasswordInput.getAttribute("type") === "password" ? "text" : "password";
        repeatPasswordInput.setAttribute("type", type);
        this.classList.toggle("fa-eye");
        this.classList.toggle("fa-eye-slash");
    });

    // Password strength checker (on input)
    passwordInput.addEventListener("input", updateStrengthBar);

    form.addEventListener("submit", function (e) {
        const password = passwordInput.value.trim();
        const repeatPassword = repeatPasswordInput.value.trim();
        const email = emailInput.value.trim();

        let valid = true;
        let messages = [];

        // Email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            valid = false;
            messages.push("Please enter a valid email address.");
        }

        // Password validation
        const passwordRegex = /^(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/;
        if (!passwordRegex.test(password)) {
            valid = false;
            messages.push("Password must be at least 8 characters long and include one uppercase letter, one number, and one special character.");
        }

        // Confirm password match
        if (password !== repeatPassword) {
            valid = false;
            messages.push("Passwords do not match.");
        }

        if (!valid) {
            e.preventDefault(); // Stop form submission
            alert(messages.join("\n")); // Show error messages
        }
    });

    // Password strength bar
    function updateStrengthBar() {
        const password = passwordInput.value;
        let strength = 0;

        if (password.match(/[A-Z]/)) strength += 25;
        if (password.match(/[0-9]/)) strength += 25;
        if (password.match(/[^a-zA-Z0-9]/)) strength += 25;
        if (password.length >= 8) strength += 25;

        strengthBar.style.width = strength + "%";
        strengthBar.setAttribute("aria-valuenow", strength);

        if (strength < 50) {
            strengthBar.className = "progress-bar bg-danger";
        } else if (strength < 75) {
            strengthBar.className = "progress-bar bg-warning";
        } else {
            strengthBar.className = "progress-bar bg-success";
        }
    }
});
