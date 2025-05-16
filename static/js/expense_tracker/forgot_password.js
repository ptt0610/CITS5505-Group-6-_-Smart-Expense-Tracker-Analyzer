// Password complexity validation
function isPasswordValid(password) {
    const minLength = 8;
    const hasUppercase = /[A-Z]/.test(password);
    const hasLowercase = /[a-z]/.test(password);
    const hasNumber = /[0-9]/.test(password);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);

    return (
        password.length >= minLength &&
        hasUppercase &&
        hasLowercase &&
        hasNumber &&
        hasSpecialChar
    );
}

// Enable Bootstrap tooltips
$(function () {
  $('[data-toggle="tooltip"]').tooltip();
});


// Client-side validation for the email input
function isEmailValid(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

// Client-side validation for the password reset form
document.querySelector("form").addEventListener("submit", function (event) {
    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value.trim();
    const confirmPassword = document.getElementById("confirm_password").value.trim();

    if (!isEmailValid(email)) {
        event.preventDefault();
        alert("Please enter a valid email address.");
        return;
    }

    if (password !== confirmPassword) {
        event.preventDefault();
        alert("Passwords do not match!");
        return;
    }

    if (!isPasswordValid(password)) {
        event.preventDefault();
        alert("Password must be at least 8 characters long and include uppercase, lowercase, number, and special character.");
        return;
    }
});

// Toggle password visibility for the password reset form
document.querySelectorAll(".toggle-password").forEach(function (icon) {
    icon.addEventListener("click", function () {
        const input = document.querySelector(this.getAttribute("toggle"));
        if (input.type === "password") {
            input.type = "text";
            this.classList.remove("fa-eye");
            this.classList.add("fa-eye-slash");
        } else {
            input.type = "password";
            this.classList.remove("fa-eye-slash");
            this.classList.add("fa-eye");
        }
    });
});
