const DASHBOARD_THEME_STORAGE_KEY = "dashboard_theme_preference";
const DASHBOARD_THEME_LIGHT = "light";
const DASHBOARD_THEME_DARK = "dark";
const themeToggleBtn = document.getElementById("themeToggleBtn");

function getStoredDashboardTheme() {
  const stored = localStorage.getItem(DASHBOARD_THEME_STORAGE_KEY);
  if (stored === DASHBOARD_THEME_DARK || stored === DASHBOARD_THEME_LIGHT) {
    return stored;
  }
  return null;
}

function getSystemDashboardTheme() {
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? DASHBOARD_THEME_DARK : DASHBOARD_THEME_LIGHT;
}

function getActiveDashboardTheme() {
  return document.body.classList.contains("theme-dark") ? DASHBOARD_THEME_DARK : DASHBOARD_THEME_LIGHT;
}

function setThemeToggleButtonState(theme) {
  if (!themeToggleBtn) return;

  const isDark = theme === DASHBOARD_THEME_DARK;
  themeToggleBtn.textContent = isDark ? "Light Mode" : "Dark Mode";
  themeToggleBtn.setAttribute("aria-pressed", String(isDark));
  themeToggleBtn.setAttribute("aria-label", isDark ? "Switch to light mode" : "Switch to dark mode");
}

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
