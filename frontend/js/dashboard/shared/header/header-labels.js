function setTodayLabel() {
  const label = document.getElementById("todayLabel");
  if (!label) return;

  const today = new Date();
  label.textContent = `Today: ${today.toLocaleDateString(undefined, {
    month: "short",
    day: "2-digit",
    year: "numeric"
  })}`;
}

function setHeaderContent() {
  const headerName = document.getElementById("headerName");
  const welcomeHeading = document.getElementById("welcomeHeading");
  const headerAvatar = document.querySelector(".profile-pill .avatar");

  const name = currentEmployee?.name || (currentRole === "admin" ? "Admin" : "Employee");

  if (headerName) headerName.textContent = name;
  if (welcomeHeading) {
    welcomeHeading.textContent =
      currentRole === "admin" ? `Welcome, ${name}` : `Welcome Back, ${name.charAt(0).toUpperCase() + name.slice(1)}`;
  }
  if (headerAvatar) {
    headerAvatar.src = getProfileImagePath(currentEmployee?.gender);
  }
}
