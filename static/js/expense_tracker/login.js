// This script handles the password visibility toggle for the login form.
document.addEventListener("DOMContentLoaded", function () {
    const togglePasswordBtn = document.getElementById("togglePassword");
    const passwordInput = document.querySelector("input[name='password']");

    // Toggle password visibility
    togglePasswordBtn.addEventListener("click", function () {
    const type = passwordInput.getAttribute("type") === "password" ? "text" : "password";
    passwordInput.setAttribute("type", type);
    this.classList.toggle("fa-eye");
    this.classList.toggle("fa-eye-slash");
    });
});