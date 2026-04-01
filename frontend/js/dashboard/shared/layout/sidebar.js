// Manage dashboard sidebar drawer behavior.

// Cache the DOM nodes reused throughout this module.
const dashboardSidebar = document.getElementById("dashboardSidebar");
const sidebarToggleBtn = document.getElementById("sidebarToggleBtn");
const sidebarDrawerBackdrop = document.getElementById("sidebarDrawerBackdrop");

// Return whether is mobile drawer viewport.
function isMobileDrawerViewport() {
  return window.matchMedia("(max-width: 1040px)").matches;
}

// Set sidebar drawer state.
function setSidebarDrawerState(isOpen) {
  if (!dashboardSidebar) return;

  dashboardSidebar.classList.toggle("is-open", isOpen);
  document.body.classList.toggle("drawer-open", isOpen);

  if (sidebarDrawerBackdrop) {
    sidebarDrawerBackdrop.hidden = !isOpen;
    sidebarDrawerBackdrop.classList.toggle("is-open", isOpen);
  }

  if (sidebarToggleBtn) {
    sidebarToggleBtn.setAttribute("aria-expanded", String(isOpen));
    sidebarToggleBtn.setAttribute("aria-label", isOpen ? "Close navigation menu" : "Open navigation menu");
  }
}

// Close sidebar drawer.
function closeSidebarDrawer() {
  setSidebarDrawerState(false);
}

// Initialize sidebar drawer.
function initializeSidebarDrawer() {
  if (!dashboardSidebar || !sidebarToggleBtn || !sidebarDrawerBackdrop) return;

  // Force a clean initial state on load (especially after responsive transitions).
  setSidebarDrawerState(false);

  sidebarToggleBtn.addEventListener("click", () => {
    const isOpen = dashboardSidebar.classList.contains("is-open");
    setSidebarDrawerState(!isOpen);
  });

  sidebarDrawerBackdrop.addEventListener("click", closeSidebarDrawer);

  window.addEventListener("resize", () => {
    if (!isMobileDrawerViewport()) {
      closeSidebarDrawer();
    }
  });
}
