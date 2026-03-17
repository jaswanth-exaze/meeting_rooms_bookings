function userCanManageBooking(booking) {
  if (!booking) return false;
  return isAdmin || booking.is_organizer === true;
}

function canManageFutureBooking(booking) {
  const normalizedStatus = String(booking?.status || "").toLowerCase();
  if (normalizedStatus === "cancelled" || normalizedStatus === "vacated") return false;
  if (!userCanManageBooking(booking)) return false;

  const start = parseDateValue(booking?.start_time);
  if (!start) return false;
  return start.getTime() > Date.now();
}

function canVacateOngoingBooking(booking) {
  const normalizedStatus = String(booking?.status || "").toLowerCase();
  if (normalizedStatus === "cancelled" || normalizedStatus === "vacated") return false;
  if (!userCanManageBooking(booking)) return false;

  const start = parseDateValue(booking?.start_time);
  const end = parseDateValue(booking?.end_time);
  if (!start || !end) return false;

  const now = Date.now();
  return start.getTime() <= now && end.getTime() > now;
}

function getBookingActionState(booking) {
  const bookingId = Number(booking?.booking_id);
  if (!bookingId) {
    return { type: "locked", reason: "Booking reference is missing." };
  }

  if (canVacateOngoingBooking(booking)) {
    return { type: "vacate", reason: "This meeting is ongoing and can be vacated now." };
  }

  if (canManageFutureBooking(booking)) {
    return { type: "manage", reason: "Future bookings can be edited or cancelled." };
  }

  const normalizedStatus = String(booking?.status || "").toLowerCase();
  if (normalizedStatus === "cancelled") {
    return { type: "view", reason: "Cancelled bookings are view-only." };
  }
  if (normalizedStatus === "vacated") {
    return { type: "view", reason: "Vacated bookings are view-only." };
  }

  const endTime = parseDateValue(booking?.end_time);
  if (endTime && endTime.getTime() <= Date.now()) {
    return { type: "view", reason: "Completed bookings are view-only." };
  }

  return { type: "view", reason: "Booking details are view-only for invited attendees." };
}

function buildBookingActionsCell(booking) {
  const bookingId = Number(booking?.booking_id);
  const actionState = getBookingActionState(booking);
  const actionReason = escapeHtml(actionState.reason || "Action unavailable.");

  if (actionState.type === "vacate") {
    return `
      <div class="booking-actions">
        <button
          class="btn btn-sm btn-danger"
          type="button"
          data-booking-action="vacate"
          data-booking-id="${bookingId}"
          title="${actionReason}"
        >
          Vacate
        </button>
      </div>
    `;
  }

  if (actionState.type === "manage") {
    return `
      <div class="booking-actions">
        <button
          class="btn btn-sm btn-primary"
          type="button"
          data-booking-action="edit"
          data-booking-id="${bookingId}"
          title="Edit booking details and time."
        >
          Edit
        </button>
        <button
          class="btn btn-sm btn-warning"
          type="button"
          data-booking-action="cancel"
          data-booking-id="${bookingId}"
          title="Cancel this future booking."
        >
          Cancel
        </button>
      </div>
    `;
  }

  if (actionState.type === "view") {
    return `
      <div class="booking-actions">
        <button
          class="btn btn-sm btn-secondary"
          type="button"
          data-booking-action="view"
          data-booking-id="${bookingId}"
          title="${actionReason}"
        >
          View
        </button>
      </div>
    `;
  }

  return `<span class="action-muted" title="${actionReason}">Locked</span>`;
}

function getBookingRoleLabel(booking) {
  return booking?.is_organizer === true ? "Organizer" : "Invited";
}

function getBookingRoleClassName(booking) {
  return booking?.is_organizer === true ? "organizer" : "invited";
}

function getBookingOrganizerDisplayName(booking) {
  if (booking?.is_organizer === true) {
    return "You";
  }

  return booking?.organizer_name || booking?.employee_name || "-";
}
