async function loadSummary() {
  try {
    const summary = await apiFetch("/bookings/summary");

    const roomsToday = document.getElementById("summaryRoomsToday");
    const upcoming = document.getElementById("summaryUpcoming");
    const openRequests = document.getElementById("summaryOpenRequests");
    const utilization = document.getElementById("summaryUtilization");

    if (roomsToday) {
      roomsToday.textContent = String(summary.rooms_booked_today ?? 0);
    }

    if (currentRole === "admin") {
      if (upcoming) upcoming.textContent = String(summary.upcoming_meetings ?? 0);
      if (openRequests) openRequests.textContent = String(summary.open_requests ?? 0);
      if (utilization) utilization.textContent = `${Number(summary.utilization_percent || 0)}%`;
    } else {
      if (upcoming) upcoming.textContent = String(summary.upcoming_meetings_week ?? 0);
      if (openRequests) openRequests.textContent = String(summary.upcoming_meetings ?? 0);
      if (utilization) utilization.textContent = `${Number(summary.booked_hours_week || 0)}h`;
    }
  } catch (error) {
    console.error("Failed to load summary:", error);
  }
}
