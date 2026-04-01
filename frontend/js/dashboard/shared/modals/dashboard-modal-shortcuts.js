// Register dashboard-wide modal keyboard shortcuts.

let dashboardModalShortcutsInitialized = false;

// Register keyboard shortcuts that close active dashboard modals.
function initializeDashboardModalShortcuts() {
  if (dashboardModalShortcutsInitialized) {
    return;
  }

  dashboardModalShortcutsInitialized = true;
  document.addEventListener("keydown", event => {
    trapActiveModalFocus(event);

    if (event.key !== "Escape") return;

    if (typeof dashboardSidebar !== "undefined" && dashboardSidebar?.classList.contains("is-open")) {
      closeSidebarDrawer();
      return;
    }

    if (typeof roomScheduleModal !== "undefined" && roomScheduleModal && !roomScheduleModal.hidden) {
      setRoomScheduleOpen(false);
      return;
    }

    if (typeof bookingEditModal !== "undefined" && bookingEditModal && !bookingEditModal.hidden) {
      closeBookingEditModal();
      return;
    }

    if (typeof employeeAdminModal !== "undefined" && employeeAdminModal && !employeeAdminModal.hidden) {
      closeEmployeeAdminModal();
      return;
    }

    if (typeof roomAdminModal !== "undefined" && roomAdminModal && !roomAdminModal.hidden) {
      closeRoomAdminModal();
      return;
    }

    if (typeof roomModal !== "undefined" && roomModal && !roomModal.hidden) {
      closeRoomModal();
    }
  });
}
