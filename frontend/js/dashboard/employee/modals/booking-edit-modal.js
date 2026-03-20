const bookingEditModal = document.getElementById("booking-edit-modal");
const bookingEditForm = document.getElementById("bookingEditForm");
const bookingEditTitle = document.getElementById("bookingEditTitle");
const bookingEditDescription = document.getElementById("bookingEditDescription");
const bookingEditDate = document.getElementById("bookingEditDate");
const bookingEditTime = document.getElementById("bookingEditTime");
const bookingEditDuration = document.getElementById("bookingEditDuration");
const bookingEditMessage = document.getElementById("bookingEditMessage");
const bookingEditHeading = document.getElementById("booking-edit-title");
const bookingEditOrganizerName = document.getElementById("bookingEditOrganizerName");
const bookingEditAttendeeSummary = document.getElementById("bookingEditAttendeeSummary");
const bookingEditParticipantSearch = document.getElementById("bookingEditParticipantSearch");
const bookingEditParticipantAddBtn = document.getElementById("bookingEditParticipantAddBtn");
const bookingEditParticipantDepartmentFilter = document.getElementById("bookingEditParticipantDepartmentFilter");
const bookingEditParticipantProjectFilter = document.getElementById("bookingEditParticipantProjectFilter");
const bookingEditParticipantRoleFilter = document.getElementById("bookingEditParticipantRoleFilter");
const bookingEditParticipantLocationFilter = document.getElementById("bookingEditParticipantLocationFilter");
const bookingEditParticipantSuggestions = document.getElementById("bookingEditParticipantSuggestions");
const bookingEditParticipantChips = document.getElementById("bookingEditParticipantChips");
const bookingEditParticipantMessage = document.getElementById("bookingEditParticipantMessage");
const bookingEditSubmitButton = bookingEditForm?.querySelector("button[type='submit']");
let bookingEditMode = "edit";

function setBookingEditMessage(message, type = "") {
  setHelperMessage(bookingEditMessage, message, type);
}

function setBookingEditMode(mode = "edit") {
  bookingEditMode = mode === "view" ? "view" : "edit";
  const isViewOnly = bookingEditMode === "view";

  if (bookingEditHeading) {
    bookingEditHeading.textContent = isViewOnly ? "Booking Details" : "Edit Booking";
  }
  if (bookingEditSubmitButton) {
    bookingEditSubmitButton.hidden = isViewOnly;
  }

  [bookingEditTitle, bookingEditDescription, bookingEditDate, bookingEditTime, bookingEditDuration].forEach(field => {
    if (!field) return;
    field.disabled = isViewOnly;
  });

  [bookingEditParticipantSearch, bookingEditParticipantAddBtn].forEach(field => {
    if (!field) return;
    field.disabled = isViewOnly;
  });

  [
    bookingEditParticipantDepartmentFilter,
    bookingEditParticipantProjectFilter,
    bookingEditParticipantRoleFilter,
    bookingEditParticipantLocationFilter
  ].forEach(field => {
    if (!field) return;
    field.disabled = isViewOnly;
  });

  if (isViewOnly) {
    hideParticipantSuggestions("edit");
  }
}

function applyBookingEditDateTimeConstraints() {
  if (!bookingEditDate || !bookingEditTime) return;

  const now = new Date();
  const today = getLocalDateInputValue(now);
  bookingEditDate.min = today;

  if (!bookingEditDate.value) {
    bookingEditDate.value = today;
  }

  if (bookingEditDate.value === today) {
    const minTime = getLocalTimeInputValue(now);
    bookingEditTime.min = minTime;
    const currentMinutes = getTimeValueMinutes(getTimeInputValue24(bookingEditTime));
    const minMinutes = getTimeValueMinutes(minTime);
    if (currentMinutes !== null && minMinutes !== null && currentMinutes < minMinutes) {
      setTimeInputValue(bookingEditTime, minTime);
    }
  } else {
    bookingEditTime.min = "";
  }
}

function getBookingEditWindow() {
  return buildWindowFromLocalInputs(bookingEditDate?.value, bookingEditTime?.value, bookingEditDuration?.value);
}

function closeBookingEditModal() {
  if (!bookingEditModal) return;
  closeManagedModal(bookingEditModal);
  setBookingEditMode("edit");
  selectedBooking = null;
  if (bookingEditTitle) bookingEditTitle.value = "";
  if (bookingEditDescription) bookingEditDescription.value = "";
  if (bookingEditDate) bookingEditDate.value = "";
  if (bookingEditTime) {
    bookingEditTime.value = "";
    bookingEditTime.removeAttribute("data-time24");
  }
  if (bookingEditOrganizerName) {
    bookingEditOrganizerName.textContent = "-";
  }
  resetParticipantPicker("edit");
  setBookingEditMessage("", "");
}

async function openBookingEditModal(bookingId, { mode = "edit" } = {}) {
  if (!bookingEditModal) return;

  const bookingSummary = bookingsById.get(Number(bookingId));
  if (!bookingSummary) return;

  const resolvedMode = mode === "view" ? "view" : "edit";
  if (resolvedMode === "edit" && !canManageFutureBooking(bookingSummary)) {
    alert("Only future active bookings can be edited.");
    return;
  }

  let booking;
  try {
    const detailResponse = await apiFetch(`/bookings/${Number(bookingId)}`);
    booking = detailResponse?.booking || null;
  } catch (error) {
    console.error("Failed to load booking details:", error);
    alert(error.message || "Unable to load booking details.");
    return;
  }

  if (!booking) {
    alert("Booking details are unavailable.");
    return;
  }

  setBookingEditMode(resolvedMode);
  selectedBooking = booking;
  setBookingEditMessage("", "");
  if (bookingEditOrganizerName) {
    bookingEditOrganizerName.textContent = getBookingOrganizerDisplayName(booking);
  }

  if (bookingEditTitle) {
    bookingEditTitle.value = booking.title || "";
  }
  if (bookingEditDescription) {
    bookingEditDescription.value = booking.description || "";
  }

  if (bookingEditDate) {
    bookingEditDate.value = toLocalDateInputValue(booking.start_time);
  }
  if (bookingEditTime) {
    setTimeInputValue(bookingEditTime, toLocalTimeInputValue(booking.start_time));
  }

  ensureDurationOption(bookingEditDuration, getMinutesBetween(booking.start_time, booking.end_time, 60));
  setParticipantSelection("edit", booking.participants || []);
  void loadEmployeeDirectory("edit", { force: true })
    .then(() => {
      renderParticipantSuggestions("edit");
    })
    .catch(error => {
      console.error("Failed to preload employees for booking edit:", error);
    });

  if (resolvedMode === "edit") {
    applyBookingEditDateTimeConstraints();
  } else {
    if (bookingEditDate) bookingEditDate.min = "";
    if (bookingEditTime) bookingEditTime.min = "";
    setBookingEditMessage("View-only details for this booking.", "");
  }

  openManagedModal(bookingEditModal);
}

async function saveBookingEdits(event) {
  event.preventDefault();
  if (!selectedBooking) return;

  if (bookingEditMode !== "edit") {
    setBookingEditMessage("This booking is in view-only mode.", "error");
    return;
  }

  setBookingEditMessage("", "");

  const windowValue = getBookingEditWindow();
  if (!windowValue?.start || !windowValue?.end) {
    setBookingEditMessage("Select valid date, time, and duration.", "error");
    return;
  }

  const startDate = parseDateValue(windowValue.start);
  if (isPastBeyondGrace(startDate?.getTime())) {
    setBookingEditMessage("You can only set future time slots.", "error");
    return;
  }

  const payload = {
    title: bookingEditTitle?.value?.trim() || selectedBooking.title || "Meeting",
    description: bookingEditDescription?.value?.trim() || selectedBooking.description || "",
    start_time: windowValue.start,
    end_time: windowValue.end
  };

  if (!payload.title || !payload.description) {
    setBookingEditMessage("Meeting name and description are required.", "error");
    return;
  }

  if (!validateParticipantCapacity("edit")) {
    return;
  }

  const directoryReady = await ensureParticipantDirectory("edit");
  if (!directoryReady || !validateParticipantAvailability("edit", { showMessage: true })) {
    return;
  }

  payload.participant_employee_ids = getParticipantPickerSelectedIds("edit");

  try {
    await apiFetch(`/bookings/${selectedBooking.booking_id}`, {
      method: "PATCH",
      body: JSON.stringify(payload)
    });

    setBookingEditMessage("Booking updated successfully.", "success");
    await refreshBookingViews();
    setTimeout(() => {
      closeBookingEditModal();
    }, 500);
  } catch (error) {
    console.error("Booking update failed:", error);
    setBookingEditMessage(error.message || "Unable to update booking.", "error");
  }
}

async function cancelBookingById(bookingId) {
  const booking = bookingsById.get(Number(bookingId));
  if (!booking) return;

  if (!canManageFutureBooking(booking)) {
    alert("Only future active bookings can be cancelled.");
    return;
  }

  const confirmed = window.confirm("Cancel this booking?");
  if (!confirmed) return;

  try {
    await apiFetch(`/bookings/${Number(bookingId)}/cancel`, { method: "PATCH" });
    await refreshBookingViews();
    if (selectedBooking && Number(selectedBooking.booking_id) === Number(bookingId)) {
      closeBookingEditModal();
    }
  } catch (error) {
    console.error("Booking cancel failed:", error);
    alert(error.message || "Unable to cancel booking.");
  }
}

async function vacateBookingById(bookingId) {
  const booking = bookingsById.get(Number(bookingId));
  if (!booking) return;

  if (!canVacateOngoingBooking(booking)) {
    alert("Only ongoing active bookings can be vacated.");
    return;
  }

  const confirmed = window.confirm("Vacate this room now?");
  if (!confirmed) return;

  try {
    await apiFetch(`/bookings/${Number(bookingId)}/vacate`, { method: "PATCH" });
    await refreshBookingViews();
    if (selectedBooking && Number(selectedBooking.booking_id) === Number(bookingId)) {
      closeBookingEditModal();
    }
  } catch (error) {
    console.error("Booking vacate failed:", error);
    alert(error.message || "Unable to vacate booking.");
  }
}

function initializeBookingEditModalHandlers() {
  if (!bookingEditModal) return;

  bookingEditModal.addEventListener("click", event => {
    if (event.target.matches("[data-close-booking-modal]")) {
      closeBookingEditModal();
    }
  });

  if (bookingEditDate) {
    bookingEditDate.addEventListener("change", () => {
      applyBookingEditDateTimeConstraints();
      void loadEmployeeDirectory("edit", { force: true })
        .then(() => {
          renderParticipantSuggestions("edit");
        })
        .catch(error => {
          console.error("Failed to refresh employee availability for edit booking:", error);
        });
    });
  }
  if (bookingEditTime) {
    bookingEditTime.addEventListener("focus", applyBookingEditDateTimeConstraints);
    bookingEditTime.addEventListener("change", () => {
      void loadEmployeeDirectory("edit", { force: true })
        .then(() => {
          renderParticipantSuggestions("edit");
        })
        .catch(error => {
          console.error("Failed to refresh employee availability for edit booking:", error);
        });
    });
  }
  if (bookingEditDuration) {
    bookingEditDuration.addEventListener("change", () => {
      void loadEmployeeDirectory("edit", { force: true })
        .then(() => {
          renderParticipantSuggestions("edit");
        })
        .catch(error => {
          console.error("Failed to refresh employee availability for edit booking:", error);
        });
    });
  }
  if (bookingEditForm) {
    bookingEditForm.addEventListener("submit", saveBookingEdits);
  }

  initializeParticipantPicker("edit");
}
