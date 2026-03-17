function renderPaginatedSection(key) {
  if (key === "bookings") {
    renderBookingsPage();
    return;
  }
  if (key === "roomFinder") {
    renderRoomFinderPage();
    return;
  }
  if (key === "employees") {
    renderEmployeePage();
    return;
  }
  if (key === "rooms") {
    renderRoomPage();
    return;
  }
  if (key === "reportLocations") {
    renderReportLocationPage();
    return;
  }
  if (key === "reportUpcoming") {
    renderReportUpcomingPage();
  }
}

function initializePageActions() {
  const refreshBookingsBtn = document.getElementById("refreshBookingsBtn");
  if (refreshBookingsBtn) {
    refreshBookingsBtn.addEventListener("click", async () => {
      refreshBookingsBtn.disabled = true;
      try {
        await refreshBookingViews();
      } finally {
        refreshBookingsBtn.disabled = false;
      }
    });
  }

  const bookingsTable = document.getElementById("bookingsTable");
  if (bookingsTable) {
    bookingsTable.addEventListener("click", async event => {
      const button = event.target.closest("button[data-booking-action][data-booking-id]");
      if (!button) return;

      const bookingId = Number(button.dataset.bookingId);
      if (!bookingId) return;

      const action = button.dataset.bookingAction;
      if (action === "edit") {
        await openBookingEditModal(bookingId, { mode: "edit" });
        return;
      }
      if (action === "view") {
        await openBookingEditModal(bookingId, { mode: "view" });
        return;
      }
      if (action === "cancel") {
        await cancelBookingById(bookingId);
        return;
      }
      if (action === "vacate") {
        await vacateBookingById(bookingId);
      }
    });
  }

  document.addEventListener("click", event => {
    const removeButton = event.target.closest("button[data-participant-remove][data-employee-id]");
    if (removeButton) {
      removeParticipantFromPicker(removeButton.dataset.participantRemove || "create", removeButton.dataset.employeeId);
      return;
    }

    const selectButton = event.target.closest("button[data-participant-select][data-employee-id]");
    if (selectButton) {
      const mode = selectButton.dataset.participantSelect || "create";
      const employeeId = Number(selectButton.dataset.employeeId || 0);
      const employee = getParticipantEmployeeDirectory(mode).find(item => Number(item.employee_id) === employeeId);
      if (employee) {
        addParticipantToPicker(mode, employee);
      }
      return;
    }

    if (!event.target.closest(".participant-picker")) {
      hideParticipantSuggestions("create");
      hideParticipantSuggestions("edit");
    }

    const button = event.target.closest("button[data-pagination-key][data-pagination-page]");
    if (!button) return;

    const key = String(button.dataset.paginationKey || "");
    const page = Number.parseInt(String(button.dataset.paginationPage || ""), 10);
    const config = getPaginationConfig(key);
    if (!config || !Number.isFinite(page)) return;

    config.page = clamp(page, 1, getPaginationTotalPages(key));
    renderPaginatedSection(key);
  });
}

async function initializeDashboard() {
  const isAuthenticated = await ensureAuthenticatedSession();
  if (!isAuthenticated) return;

  initializeThemeToggle();
  setTodayLabel();
  setHeaderContent();
  setProfileSection();
  initializeSidebarDrawer();
  initializeNav();
  initializeProfileSecurity();
  initializePageActions();
  initializeRoomFinder();
  initializeBookingEditModalHandlers();
  initializeRoomModalHandlers();
  initializeRoomDetailsInteractions();
  if (currentRole === "admin" && typeof initializeAdminSettings === "function") {
    initializeAdminSettings();
  }

  if (forcePasswordChange || currentEmployee?.password_reset_required === true) {
    showSection("profileSection");
  }

  await Promise.all([loadSummary(), loadBookings(), loadFinderLocations(), loadOverviewAvailability()]);
  await searchRooms();

  if (currentRole === "admin") {
    await Promise.all([loadReports(), loadEmployees(), loadRooms()]);
  }
}
