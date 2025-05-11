document.addEventListener("DOMContentLoaded", function () {
  const profileForm = document.getElementById("profile-form");
  const profileImageInput = document.getElementById("profile-image");
  const profilePreview = document.getElementById("profile-preview");
  const navProfilePic = document.getElementById("nav-profile-pic");
  const confirmation = document.getElementById("confirmation");
  const errorDiv = document.getElementById("error");

  if (!profileImageInput || !profilePreview) return;

  // Handle image preview for profile picture
  profileImageInput.addEventListener("change", function () {
    const file = this.files[0];
    if (file && file.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onload = function (e) {
        profilePreview.src = e.target.result;
      };
      reader.readAsDataURL(file);
    }
  });

  // Handle form submission to update the profile
  profileForm.addEventListener("submit", function (e) {
    e.preventDefault();
    errorDiv.style.display = "none"; // Clear previous errors

    const formData = new FormData(profileForm);
    const uploadedFile = profileImageInput.files[0];
    
    if (uploadedFile && uploadedFile.type.startsWith("image/")) {
      formData.append('profile_image', uploadedFile);
    }

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
          if (uploadedFile && navProfilePic) {
            const reader = new FileReader();
            reader.onload = function (e) {
              navProfilePic.src = e.target.result;
            };
            reader.readAsDataURL(uploadedFile);
          }
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