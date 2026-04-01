// Initialize the home page modules and event handlers.

// Load home data.
function loadHomeData() {
  renderDefaultLocationRoomState();

  if (!ensureLeafletLoaded()) {
    setLocationMapStatus("Leaflet failed to load for the office map.", "error");
  }

  return Promise.all([loadLocations(), loadAllRooms()]);
}

// Initialize the home page feature modules.
function initializeHome() {
  initializeThemeToggle();
  initializeSignInIllustrationVideo();
  loadHomeData();

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", () => {
      initializeSlideshow();
      initializeStickyAuthCardState();
    });
  } else {
    initializeSlideshow();
    initializeStickyAuthCardState();
  }
}
