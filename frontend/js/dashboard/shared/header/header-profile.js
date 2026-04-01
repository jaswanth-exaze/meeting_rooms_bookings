// Manage the dashboard profile header and password reset workflow.

// Define shared constants and configuration used by this module.
const PASSWORD_RULE_KEYS = ["length", "lowercase", "uppercase", "number", "special"];

// Return password rule state.
function getPasswordRuleState(passwordValue) {
  const password = String(passwordValue || "");
  return {
    length: password.length >= 8,
    lowercase: /[a-z]/.test(password),
    uppercase: /[A-Z]/.test(password),
    number: /\d/.test(password),
    special: /[^A-Za-z0-9]/.test(password)
  };
}

// Return password rule error.
function getPasswordRuleError(passwordValue) {
  const ruleState = getPasswordRuleState(passwordValue);
  if (!ruleState.length) return "Password must be at least 8 characters long.";
  if (!ruleState.lowercase) return "Password must include at least one lowercase letter.";
  if (!ruleState.uppercase) return "Password must include at least one uppercase letter.";
  if (!ruleState.number) return "Password must include at least one number.";
  if (!ruleState.special) return "Password must include at least one special character.";
  return "";
}

// Update password reset notice.
function updatePasswordResetNotice() {
  const notice = document.getElementById("passwordResetNotice");
  if (!notice) return;

  const requiresReset = forcePasswordChange || currentEmployee?.password_reset_required === true;
  notice.hidden = !requiresReset;
  if (requiresReset) {
    notice.textContent = "For security, please change your password before continuing regular usage.";
  } else {
    notice.textContent = "";
  }
}

// Set profile section.
function setProfileSection() {
  const profileHeroName = document.getElementById("profileHeroName");
  const profileHeroTitle = document.getElementById("profileHeroTitle");
  const profileHeroEmail = document.getElementById("profileHeroEmail");
  const profileDepartment = document.getElementById("profileDepartment");
  const profileGender = document.getElementById("profileGender");
  const profileJobRole = document.getElementById("profileJobRole");
  const profileProject = document.getElementById("profileProject");
  const profileManager = document.getElementById("profileManager");
  const profileWorkLocation = document.getElementById("profileWorkLocation");
  const profilePhone = document.getElementById("profilePhone");
  const profileHireDate = document.getElementById("profileHireDate");
  const profileEmployeeType = document.getElementById("profileEmployeeType");
  const profileImage = document.getElementById("profileImage");
  const gender = normalizeGender(currentEmployee?.gender);
  const hireDate = parseDateValue(currentEmployee?.hire_date);
  const managerLabel =
    currentEmployee?.manager_name ||
    (Number.isFinite(Number(currentEmployee?.manager_id)) ? `Employee #${Number(currentEmployee.manager_id)}` : "-");
  const profileTitle = currentEmployee?.role || (isAdmin ? "Administrator" : "Team Member");

  if (profileHeroName) profileHeroName.textContent = currentEmployee?.name || (isAdmin ? "Admin" : "Employee");
  if (profileHeroTitle) profileHeroTitle.textContent = profileTitle;
  if (profileHeroEmail) profileHeroEmail.textContent = currentEmployee?.email || "-";
  if (profileDepartment) profileDepartment.textContent = currentEmployee?.department || "-";
  if (profileGender) profileGender.textContent = gender === "female" ? "Female" : "Male";
  if (profileJobRole) profileJobRole.textContent = currentEmployee?.role || "-";
  if (profileProject) profileProject.textContent = currentEmployee?.project || "-";
  if (profileManager) profileManager.textContent = managerLabel;
  if (profileWorkLocation) profileWorkLocation.textContent = currentEmployee?.work_location_name || "-";
  if (profilePhone) profilePhone.textContent = currentEmployee?.phone_number || "-";
  if (profileHireDate) {
    profileHireDate.textContent = hireDate
      ? hireDate.toLocaleDateString(undefined, { month: "short", day: "2-digit", year: "numeric" })
      : "-";
  }
  if (profileEmployeeType) profileEmployeeType.textContent = currentEmployee?.employee_type || "-";
  if (profileImage) profileImage.src = getProfileImagePath(gender);
  updatePasswordResetNotice();
}

// Initialize profile security.
function initializeProfileSecurity() {
  const form = document.getElementById("changePasswordForm");
  const messageElement = document.getElementById("changePasswordMessage");
  const currentPasswordInput = document.getElementById("currentPasswordInput");
  const newPasswordInput = document.getElementById("newPasswordInput");
  const confirmPasswordInput = document.getElementById("confirmPasswordInput");
  const passwordRulesList = document.getElementById("passwordRulesList");
  const passwordMatchHint = document.getElementById("passwordMatchHint");

  updatePasswordResetNotice();
  if (!form || !messageElement || !currentPasswordInput || !newPasswordInput || !confirmPasswordInput) {
    return;
  }

  // Render password hints.
  function renderPasswordHints() {
    const newPassword = newPasswordInput.value || "";
    const confirmPassword = confirmPasswordInput.value || "";
    const ruleState = getPasswordRuleState(newPassword);
    const hasPasswordValue = newPassword.length > 0;

    if (passwordRulesList) {
      PASSWORD_RULE_KEYS.forEach(ruleKey => {
        const ruleItem = passwordRulesList.querySelector(`[data-rule="${ruleKey}"]`);
        if (!ruleItem) return;

        const passed = ruleState[ruleKey] === true;
        ruleItem.classList.toggle("is-valid", passed);
        ruleItem.classList.toggle("is-invalid", hasPasswordValue && !passed);
      });
    }

    if (passwordMatchHint) {
      passwordMatchHint.textContent = "";
      passwordMatchHint.classList.remove("success", "error");
      if (!confirmPassword) return;

      if (newPassword === confirmPassword) {
        passwordMatchHint.textContent = "Passwords match.";
        passwordMatchHint.classList.add("success");
      } else {
        passwordMatchHint.textContent = "Passwords do not match.";
        passwordMatchHint.classList.add("error");
      }
    }
  }

  newPasswordInput.addEventListener("input", renderPasswordHints);
  confirmPasswordInput.addEventListener("input", renderPasswordHints);
  renderPasswordHints();

  form.addEventListener("submit", async event => {
    event.preventDefault();
    setHelperMessage(messageElement, "", "");

    const currentPassword = currentPasswordInput.value || "";
    const newPassword = newPasswordInput.value || "";
    const confirmPassword = confirmPasswordInput.value || "";

    if (!currentPassword || !newPassword || !confirmPassword) {
      setHelperMessage(messageElement, "Please fill all password fields.", "error");
      return;
    }

    const passwordRuleError = getPasswordRuleError(newPassword);
    if (passwordRuleError) {
      setHelperMessage(messageElement, passwordRuleError, "error");
      return;
    }

    if (newPassword !== confirmPassword) {
      setHelperMessage(messageElement, "New password and confirm password must match.", "error");
      return;
    }

    try {
      const response = await apiFetch("/auth/change-password", {
        method: "POST",
        body: JSON.stringify({
          current_password: currentPassword,
          new_password: newPassword
        })
      });

      if (response?.employee) {
        setCurrentEmployee(response.employee);
      }

      forcePasswordChange = false;
      const currentUrl = new URL(window.location.href);
      if (currentUrl.searchParams.has("force_password_change")) {
        currentUrl.searchParams.delete("force_password_change");
        const nextPath = `${currentUrl.pathname}${currentUrl.search}${currentUrl.hash}`;
        window.history.replaceState({}, "", nextPath);
      }

      setHeaderContent();
      setProfileSection();
      setHelperMessage(messageElement, response?.message || "Password changed successfully.", "success");
      form.reset();
      renderPasswordHints();
    } catch (error) {
      setHelperMessage(messageElement, error.message || "Failed to change password.", "error");
    }
  });
}
