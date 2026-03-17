async function loadBookings() {
  const overviewTable = document.getElementById("overviewBookingsTable");
  const bookingsTable = document.getElementById("bookingsTable");
  const bookingsPagination = document.getElementById("bookingsPagination");

  if (overviewTable) {
    overviewTable.innerHTML = buildTableSkeletonRows(currentRole === "admin" ? 5 : 6, 3);
  }
  if (bookingsTable) {
    bookingsTable.innerHTML = buildTableSkeletonRows(8, 5);
  }
  if (bookingsPagination) {
    bookingsPagination.innerHTML = "";
  }

  try {
    const overviewRows =
      currentRole === "admin"
        ? await apiFetch(buildUpcomingUrl({ limit: 12, includeAll: true }))
        : await apiFetch(buildUpcomingUrl({ limit: 12 }));

    renderOverviewBookings(overviewRows);

    const myRows = await apiFetch(buildMyBookingsUrl(200));
    renderBookingsTable(myRows);
    markOverviewAndBookingsRefreshed(new Date());
  } catch (error) {
    console.error("Failed to load bookings:", error);
    if (overviewTable) {
      overviewTable.innerHTML = `<tr><td colspan="${currentRole === "admin" ? 5 : 6}" class="empty-state">Unable to load bookings right now. Please try refresh.</td></tr>`;
    }
    if (bookingsTable) {
      bookingsTable.innerHTML = `<tr><td colspan="8" class="empty-state">Unable to load your bookings. Please refresh.</td></tr>`;
    }
    setPaginationRows("bookings", []);
    renderPaginationControls("bookingsPagination", "bookings");
  }
}

async function refreshBookingViews() {
  const tasks = [loadSummary(), loadBookings(), loadOverviewAvailability(), searchRooms()];
  if (currentRole === "admin") {
    tasks.push(loadReports());
  }
  await Promise.all(tasks);
}
