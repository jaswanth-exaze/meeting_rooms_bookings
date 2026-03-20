function getStoredTheme() {
  const stored = localStorage.getItem(THEME_STORAGE_KEY);
  return stored === THEME_DARK || stored === THEME_LIGHT ? stored : null;
}

function getSystemTheme() {
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? THEME_DARK : THEME_LIGHT;
}

function getActiveTheme() {
  return document.body.classList.contains("theme-dark") ? THEME_DARK : THEME_LIGHT;
}

function setThemeToggleButtonState(theme) {
  if (!themeToggleBtn) return;
  const isDark = theme === THEME_DARK;
  themeToggleBtn.textContent = isDark ? "Light Mode" : "Dark Mode";
  themeToggleBtn.setAttribute("aria-pressed", String(isDark));
  themeToggleBtn.setAttribute("aria-label", isDark ? "Switch to light mode" : "Switch to dark mode");
}

function applyTheme(theme, { persist = true } = {}) {
  const resolvedTheme = theme === THEME_DARK ? THEME_DARK : THEME_LIGHT;
  const isDark = resolvedTheme === THEME_DARK;

  document.body.classList.toggle("theme-dark", isDark);
  document.body.dataset.theme = resolvedTheme;
  document.documentElement.style.colorScheme = resolvedTheme;
  setThemeToggleButtonState(resolvedTheme);

  if (persist) {
    localStorage.setItem(THEME_STORAGE_KEY, resolvedTheme);
  }
}

function initializeThemeToggle() {
  const initialTheme = getStoredTheme() || getSystemTheme();
  applyTheme(initialTheme, { persist: false });

  if (themeToggleBtn) {
    themeToggleBtn.addEventListener("click", () => {
      const nextTheme = getActiveTheme() === THEME_DARK ? THEME_LIGHT : THEME_DARK;
      applyTheme(nextTheme);
    });
  }

  const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
  const syncWithSystemTheme = event => {
    if (getStoredTheme()) return;
    applyTheme(event.matches ? THEME_DARK : THEME_LIGHT, { persist: false });
  };

  if (typeof mediaQuery.addEventListener === "function") {
    mediaQuery.addEventListener("change", syncWithSystemTheme);
  } else if (typeof mediaQuery.addListener === "function") {
    mediaQuery.addListener(syncWithSystemTheme);
  }
}
