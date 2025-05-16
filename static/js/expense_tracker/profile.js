document.addEventListener("DOMContentLoaded", function () {
    const profileForm = document.getElementById("profile-form");
    const profileImageInput = document.getElementById("profile-image");
    const profilePreview = document.getElementById("profile-preview");
    const navProfilePic = document.getElementById("nav-profile-pic");
    const confirmation = document.getElementById("confirmation");
    const errorDiv = document.getElementById("error");
    const daySelect = document.getElementById("dob-day");
    const monthSelect = document.getElementById("dob-month");
    const yearSelect = document.getElementById("dob-year");
    const firstNameInput = document.getElementById("first-name");
    const lastNameInput = document.getElementById("last-name");
    const usernameInput = document.getElementById("username");
    const emailInput = document.getElementById("email");
    const companyInput = document.getElementById("company");
    const salaryInput = document.getElementById("salary");
    const passwordInput = document.getElementById("password");
    const confirmPasswordInput = document.getElementById("confirm-password");
    const emailError = document.getElementById("email-error");

    // Email validation
    function isValidEmail(email) {
        const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailPattern.test(email);
    }

    // Password validation
    function isValidPassword(password) {
        const lengthCheck = /.{8,}/;
        const uppercaseCheck = /[A-Z]/;
        const numberCheck = /[0-9]/;
        const specialCharCheck = /[!@#$%^&*(),.?":{}|<>]/;
        return (
            lengthCheck.test(password) &&
            uppercaseCheck.test(password) &&
            numberCheck.test(password) &&
            specialCharCheck.test(password)
        );
    }

    // Email blur validation
    if (emailInput && emailError) {
        emailInput.addEventListener("blur", function () {
            const email = emailInput.value.trim();
            if (!isValidEmail(email)) {
                emailError.textContent = "Please enter a valid email address.";
                emailError.style.display = "block";
                emailInput.focus();
            } else {
                emailError.textContent = "";
                emailError.style.display = "none";
            }
        });
    }

    // Live preview of uploaded image
    if (profileImageInput && profilePreview) {
        profileImageInput.addEventListener("change", function () {
            const file = this.files[0];
            if (file) {
                console.log("Selected file:", file.name);
                profilePreview.src = URL.createObjectURL(file);
            } else {
                console.log("No file selected");
            }
        });
    }

    // Populate DOB dropdowns
    if (!daySelect || !monthSelect || !yearSelect) {
        console.error("DOB dropdown elements not found.");
        return;
    }

    for (let day = 1; day <= 31; day++) {
        const option = document.createElement("option");
        option.value = day;
        option.textContent = day;
        daySelect.appendChild(option);
    }

    const months = [
        "January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"
    ];
    months.forEach((month, index) => {
        const option = document.createElement("option");
        option.value = index + 1;
        option.textContent = month;
        monthSelect.appendChild(option);
    });

    const today = new Date();
    const currentYear = today.getFullYear();
    const minYear = currentYear - 100;
    const maxYear = currentYear - 12;

    for (let year = maxYear; year >= minYear; year--) {
        const option = document.createElement("option");
        option.value = year;
        option.textContent = year;
        yearSelect.appendChild(option);
    }

    // Pre-fill DOB if available
    const dobHidden = document.getElementById("dob-hidden");
    const userDOB = dobHidden ? dobHidden.value : "";
    if (userDOB) {
        const [year, month, day] = userDOB.split("-");
        if (year && month && day) {
            yearSelect.value = parseInt(year);
            monthSelect.value = parseInt(month);
            daySelect.value = parseInt(day);
        }
    }

    // Submit handler
    profileForm.addEventListener("submit", function (e) {
        e.preventDefault();
        errorDiv.style.display = "none";

        // Validate required fields
        const requiredFields = [
            { input: firstNameInput, name: "First Name" },
            { input: lastNameInput, name: "Last Name" },
            { input: usernameInput, name: "Username" },
            { input: emailInput, name: "Email" }
        ];

        for (const field of requiredFields) {
            if (!field.input.value.trim()) {
                errorDiv.textContent = `${field.name} is required.`;
                errorDiv.style.display = "block";
                field.input.focus();
                return;
            }
        }

        if (!isValidEmail(emailInput.value.trim())) {
            errorDiv.textContent = "Please enter a valid email address.";
            errorDiv.style.display = "block";
            emailInput.focus();
            return;
        }

        const day = daySelect.value;
        const month = monthSelect.value;
        const year = yearSelect.value;

        if (!day || !month || !year) {
            errorDiv.textContent = "Please select a valid date of birth.";
            errorDiv.style.display = "block";
            daySelect.focus();
            return;
        }

        const selectedDate = new Date(`${year}-${month}-${day}`);
        const minDate = new Date(minYear, 0, 1);
        const maxDate = new Date(currentYear - 12, today.getMonth(), today.getDate());

        if (selectedDate > maxDate || selectedDate < minDate) {
            errorDiv.textContent = "Please select a valid date of birth. You must be at least 12 years old.";
            errorDiv.style.display = "block";
            yearSelect.focus();
            return;
        }

        const password = passwordInput.value;
        const confirmPassword = confirmPasswordInput.value;

        if (password || confirmPassword) {
            if (password !== confirmPassword) {
                errorDiv.textContent = "Passwords do not match.";
                errorDiv.style.display = "block";
                confirmPasswordInput.focus();
                return;
            }
            if (!isValidPassword(password)) {
                errorDiv.textContent = "Password must be at least 8 characters long and include one uppercase letter, one number, and one special character.";
                errorDiv.style.display = "block";
                passwordInput.focus();
                return;
            }
        }

        // Construct FormData manually
        const formData = new FormData();
        formData.append("first_name", firstNameInput.value.trim());
        formData.append("last_name", lastNameInput.value.trim());
        formData.append("username", usernameInput.value.trim());
        formData.append("email", emailInput.value.trim());
        formData.append("company", companyInput.value.trim());
        if (salaryInput.value) {
            formData.append("salary", salaryInput.value);
        }
        if (password) {
            formData.append("password", password);
            formData.append("confirm_password", confirmPassword);
        }
        if (profileImageInput.files[0]) {
            formData.append("profile_image", profileImageInput.files[0]);
        }
        const dob = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        formData.append("dob", dob);

        // Log FormData for debugging
        console.log("FormData contents:");
        for (let [key, value] of formData.entries()) {
            console.log(`${key}:`, value instanceof File ? value.name : value);
        }

        fetch('/update_profile', {
            method: 'POST',
            body: formData,
        })
        .then(response => {
            console.log("Response status:", response.status);
            return response.json();
        })
        .then(data => {
            console.log("Server response:", data);
            if (data.success) {
                confirmation.style.display = "block";
                if (data.profile_pic_url && navProfilePic) {
                    navProfilePic.src = `${data.profile_pic_url}?t=${new Date().getTime()}`; // Cache bust
                }
                // Update username in navbar
                const newUsername = usernameInput.value.trim();
                const navUsername = document.getElementById("nav-username");
                if (navUsername) {
                    navUsername.textContent = newUsername;
                }
                // Hide confirmation after delay
                setTimeout(() => {
                    confirmation.style.display = "none";
                }, 3000);
            } else {
                errorDiv.textContent = data.error || "An error occurred.";
                errorDiv.style.display = "block";
            }
        })
        .catch(error => {
            console.error("Fetch error:", error);
            errorDiv.textContent = "Failed to update profile. Please try again.";
            errorDiv.style.display = "block";
        });
    });

    // Show/hide password toggle
    document.querySelectorAll(".toggle-password").forEach(function (icon) {
        icon.addEventListener("click", function () {
            const input = document.querySelector(this.getAttribute("toggle"));
            const isPassword = input.type === "password";
            input.type = isPassword ? "text" : "password";
            this.classList.toggle("fa-eye");
            this.classList.toggle("fa-eye-slash");
        });
    });
});