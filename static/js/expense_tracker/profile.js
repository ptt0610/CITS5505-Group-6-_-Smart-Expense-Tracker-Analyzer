document.addEventListener("DOMContentLoaded", function () {
  const profileForm = document.getElementById("profile-form");
  const profileImageInput = document.getElementById("profile-image");
  const profilePreview = document.getElementById("profile-preview");
  const navProfilePic = document.getElementById("nav-profile-pic");
  const confirmation = document.getElementById("confirmation");

  if (!profileImageInput || !profilePreview) return;

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

  profileForm.addEventListener("submit", function (e) {
    e.preventDefault();

    const uploadedFile = profileImageInput.files[0];
    if (uploadedFile && uploadedFile.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onload = function (e) {
        navProfilePic.src = e.target.result;
      };
      reader.readAsDataURL(uploadedFile);
    }

    confirmation.style.display = "block";
    setTimeout(() => {
      confirmation.style.display = "none";
    }, 3000);
  });
});

