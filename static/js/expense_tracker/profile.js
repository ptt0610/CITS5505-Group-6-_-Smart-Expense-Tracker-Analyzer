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

  // Live preview of uploaded image
  if (profileImageInput && profilePreview) {
    profileImageInput.addEventListener("change", function () {
        const file = this.files[0];
        if (file) {
            profilePreview.src = URL.createObjectURL(file);
        }
    });
}

  // Ensure the dropdowns are available
  if (!daySelect || !monthSelect || !yearSelect) {
      console.error("DOB dropdown elements not found.");
      return;
  }

  // Populate Days (1-31)
  for (let day = 1; day <= 31; day++) {
      const option = document.createElement("option");
      option.value = day;
      option.textContent = day;
      daySelect.appendChild(option);
  }

  // Populate Months (1-12)
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

  // Populate Years (at least 12 years ago, up to 100 years ago)
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

  // Prevent future dates
  profileForm.addEventListener("submit", function (e) {
      e.preventDefault();
      errorDiv.style.display = "none";

      const day = daySelect.value;
      const month = monthSelect.value;
      const year = yearSelect.value;

      if (!day || !month || !year) {
          alert("Please select a valid date of birth.");
          return;
      }

      const selectedDate = new Date(`${year}-${month}-${day}`);
      const minDate = new Date(minYear, 0, 1);
      const maxDate = new Date(currentYear - 12, today.getMonth(), today.getDate());

      if (selectedDate > maxDate || selectedDate < minDate) {
          alert("Please select a valid date of birth. You must be at least 12 years old.");
          return;
      }

      const dob = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      const formData = new FormData(profileForm);
      formData.append("dob", dob);

      fetch('/update_profile', {
          method: 'POST',
          body: formData,
      })
      .then(response => response.json())
      .then(data => {
          if (data.success) {
              confirmation.style.display = "block";
              setTimeout(() => {
                  confirmation.style.display = "none";
              }, 3000);
          } else {
              errorDiv.textContent = data.error || "An error occurred.";
              errorDiv.style.display = "block";
          }
      })
      .catch(error => {
          console.error("Error updating profile:", error);
          errorDiv.textContent = "Failed to update profile. Please try again.";
          errorDiv.style.display = "block";
      });
  });
});
