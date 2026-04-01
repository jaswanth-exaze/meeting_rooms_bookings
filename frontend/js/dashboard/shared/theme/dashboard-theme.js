// Manage dashboard theme detection, persistence, and toggling.

// Define shared constants and configuration used by this module.
const DASHBOARD_THEME_STORAGE_KEY = "dashboard_theme_preference";
const DASHBOARD_THEME_LIGHT = "light";
const DASHBOARD_THEME_DARK = "dark";
// Cache the DOM nodes reused throughout this module.
const themeToggleBtn = document.getElementById("themeToggleBtn");

// Read the saved dashboard theme preference.
function getStoredDashboardTheme() {
  const stored = localStorage.getItem(DASHBOARD_THEME_STORAGE_KEY);
  if (stored === DASHBOARD_THEME_DARK || stored === DASHBOARD_THEME_LIGHT) {
    return stored;
  }
  return null;
}

// Detect the system dashboard color-scheme preference.
function getSystemDashboardTheme() {
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? DASHBOARD_THEME_DARK : DASHBOARD_THEME_LIGHT;
}

// Return the active dashboard theme.
function getActiveDashboardTheme() {
  return document.body.classList.contains("theme-dark") ? DASHBOARD_THEME_DARK : DASHBOARD_THEME_LIGHT;
}

// Set theme toggle button state.
function setThemeToggleButtonState(theme) {
  if (!themeToggleBtn) return;

  const isDark = theme === DASHBOARD_THEME_DARK;
  themeToggleBtn.textContent = isDark ? "Light Mode" : "Dark Mode";
  themeToggleBtn.setAttribute("aria-pressed", String(isDark));
  themeToggleBtn.setAttribute("aria-label", isDark ? "Switch to light mode" : "Switch to dark mode");
}

// Apply the selected dashboard theme and optionally persist it.
function applyDashboardTheme(theme, { persist = true } = {}) {
  const resolvedTheme = theme === DASHBOARD_THEME_DARK ? DASHBOARD_THEME_DARK : DASHBOARD_THEME_LIGHT;
  const isDark = resolvedTheme === DASHBOARD_THEME_DARK;

  document.body.classList.toggle("theme-dark", isDark);
  document.body.dataset.theme = resolvedTheme;
  document.documentElement.style.colorScheme = resolvedTheme;

  setThemeToggleButtonState(resolvedTheme);

  if (persist) {
    localStorage.setItem(DASHBOARD_THEME_STORAGE_KEY, resolvedTheme);
  }
}

// Initialize theme toggle.
function initializeThemeToggle() {
  const initialTheme = getStoredDashboardTheme() || getSystemDashboardTheme();
  applyDashboardTheme(initialTheme, { persist: false });

  if (themeToggleBtn) {
    themeToggleBtn.addEventListener("click", () => {
      const nextTheme =
        getActiveDashboardTheme() === DASHBOARD_THEME_DARK ? DASHBOARD_THEME_LIGHT : DASHBOARD_THEME_DARK;
      applyDashboardTheme(nextTheme);
    });
  }

  const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
  const syncWithSystemTheme = event => {
    if (getStoredDashboardTheme()) return;
    applyDashboardTheme(event.matches ? DASHBOARD_THEME_DARK : DASHBOARD_THEME_LIGHT, { persist: false });
  };

  if (typeof mediaQuery.addEventListener === "function") {
    mediaQuery.addEventListener("change", syncWithSystemTheme);
  } else if (typeof mediaQuery.addListener === "function") {
    mediaQuery.addListener(syncWithSystemTheme);
  }
}
