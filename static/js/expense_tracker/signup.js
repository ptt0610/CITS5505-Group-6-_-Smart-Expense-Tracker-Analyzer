// Initialize Bootstrap tooltips
document.addEventListener("DOMContentLoaded", function () {
    $('[data-toggle="tooltip"]').tooltip();
});

// Password strength checker
function checkPasswordStrength() {
    const password = document.getElementById("password").value;
    const strengthBar = document.getElementById(
        "passwordStrengthBar"
    );
    let strength = 0;

    // Check for uppercase letters
    if (password.match(/[A-Z]/)) strength += 25;

    // Check for numbers
    if (password.match(/[0-9]/)) strength += 25;

    // Check for special characters
    if (password.match(/[^a-zA-Z0-9]/)) strength += 25;

    // Check for minimum length of 8 characters
    if (password.length >= 8) strength += 25;

    // Update the strength bar width and aria-valuenow
    strengthBar.style.width = strength + "%";
    strengthBar.setAttribute("aria-valuenow", strength);

    // Update the bar color based on strength
    if (strength < 50) {
        strengthBar.className = "progress-bar bg-danger";
    } else if (strength < 75) {
        strengthBar.className = "progress-bar bg-warning";
    } else {
        strengthBar.className = "progress-bar bg-success";
    }
}