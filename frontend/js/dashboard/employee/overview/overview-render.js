// Render the employee overview panels and tables.

// Render overview bookings.
function renderOverviewBookings(rows) {
  const table = document.getElementById("overviewBookingsTable");
  if (!table) return;

  if (!Array.isArray(rows) || rows.length === 0) {
    table.innerHTML = `<tr><td colspan="${currentRole === "admin" ? 5 : 6}" class="empty-state">No upcoming bookings yet. Your next meeting will appear here.</td></tr>`;
    return;
  }

  table.innerHTML = rows
    .slice(0, 6)
    .map(row => {
      const statusClass = getStatusClass(row.status);
      const date = formatDate(row.start_time, row.location_timezone);
      const time = formatTimeRange(row.start_time, row.end_time, row.location_timezone);

      if (currentRole === "admin") {
        return `
          <tr>
            <td>${escapeHtml(row.employee_name || "-")}</td>
            <td>${escapeHtml(row.room_name || "-")}</td>
            <td>${date}</td>
            <td>${time}</td>
            <td><span class="status ${statusClass}">${escapeHtml(row.status || "-")}</span></td>
          </tr>
        `;
      }

      return `
        <tr>
          <td>${escapeHtml(row.title || "-")}</td>
          <td>${escapeHtml(getBookingOrganizerDisplayName(row))}</td>
          <td>${escapeHtml(row.room_name || "-")}</td>
          <td>${date}</td>
          <td>${time}</td>
          <td><span class="status ${statusClass}">${escapeHtml(row.status || "-")}</span></td>
        </tr>
      `;
    })
    .join("");
}
