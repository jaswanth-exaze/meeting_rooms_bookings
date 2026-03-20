function renderBookingsPage() {
  const table = document.getElementById("bookingsTable");
  if (!table) return;

  const rows = getPaginationSlice("bookings");

  if (!Array.isArray(rows) || rows.length === 0) {
    table.innerHTML = `<tr><td colspan="8" class="empty-state">No bookings found yet. New reservations will appear here.</td></tr>`;
    renderPaginationControls("bookingsPagination", "bookings");
    return;
  }

  table.innerHTML = rows
    .map(row => {
      const statusClass = getStatusClass(row.status);
      const roomText = escapeHtml(row.room_name || "-");
      const locationText = escapeHtml(row.location_name || "-");
      const startText = formatCompactDateTime(row.start_time, row.location_timezone);
      const endText = formatCompactDateTime(row.end_time, row.location_timezone);
      const roleText = escapeHtml(getBookingRoleLabel(row));
      const roleClassName = getBookingRoleClassName(row);
      const organizerText = escapeHtml(getBookingOrganizerDisplayName(row));
      const statusText = escapeHtml(row.status || "-");
      return `
        <tr>
          <td><span class="cell-ellipsis" title="${roomText}">${roomText}</span></td>
          <td><span class="cell-ellipsis" title="${locationText}">${locationText}</span></td>
          <td><span class="cell-nowrap">${startText}</span></td>
          <td><span class="cell-nowrap">${endText}</span></td>
          <td><span class="booking-role-pill ${roleClassName}">${roleText}</span></td>
          <td><span class="cell-ellipsis" title="${organizerText}">${organizerText}</span></td>
          <td><span class="status ${statusClass}">${statusText}</span></td>
          <td>${buildBookingActionsCell(row)}</td>
        </tr>
      `;
    })
    .join("");

  renderPaginationControls("bookingsPagination", "bookings");
}

function renderBookingsTable(rows) {
  bookingsById = new Map();
  (rows || []).forEach(row => {
    bookingsById.set(Number(row.booking_id), row);
  });

  setPaginationRows("bookings", rows);
  renderBookingsPage();
}
