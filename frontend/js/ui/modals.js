const MODAL_FOCUSABLE_SELECTOR = [
  "a[href]",
  "button:not([disabled])",
  "textarea:not([disabled])",
  "input:not([disabled]):not([type='hidden'])",
  "select:not([disabled])",
  "[tabindex]:not([tabindex='-1'])"
].join(", ");
let activeModalElement = null;
let lastModalTriggerElement = null;

function isVisibleElement(element) {
  if (!(element instanceof HTMLElement)) return false;
  if (element.hidden) return false;
  return element.getClientRects().length > 0;
}

function getModalFocusableElements(modalElement) {
  if (!modalElement) return [];
  return Array.from(modalElement.querySelectorAll(MODAL_FOCUSABLE_SELECTOR))
    .filter(node => isVisibleElement(node) && node.getAttribute("aria-hidden") !== "true");
}

function trapActiveModalFocus(event) {
  if (event.key !== "Tab" || !activeModalElement || activeModalElement.hidden) return;

  const focusableElements = getModalFocusableElements(activeModalElement);
  if (focusableElements.length === 0) {
    event.preventDefault();
    return;
  }

  const firstElement = focusableElements[0];
  const lastElement = focusableElements[focusableElements.length - 1];

  if (event.shiftKey && document.activeElement === firstElement) {
    event.preventDefault();
    lastElement.focus();
    return;
  }

  if (!event.shiftKey && document.activeElement === lastElement) {
    event.preventDefault();
    firstElement.focus();
  }
}

function openManagedModal(modalElement, triggerElement = null) {
  if (!modalElement) return;

  lastModalTriggerElement =
    triggerElement instanceof HTMLElement
      ? triggerElement
      : document.activeElement instanceof HTMLElement
        ? document.activeElement
        : null;

  modalElement.hidden = false;
  activeModalElement = modalElement;

  const focusableElements = getModalFocusableElements(modalElement);
  const firstElement = focusableElements[0];
  if (firstElement) {
    firstElement.focus();
  }
}

function closeManagedModal(modalElement) {
  if (!modalElement) return;

  modalElement.hidden = true;
  if (activeModalElement === modalElement) {
    activeModalElement = null;
  }

  if (lastModalTriggerElement && lastModalTriggerElement.isConnected) {
    lastModalTriggerElement.focus();
  }
  lastModalTriggerElement = null;
}

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

const roomModal = document.getElementById("dashboard-room-modal");
const roomModalImage = document.getElementById("dashboard-room-image");
const roomModalTitle = document.getElementById("dashboard-room-title");
const roomModalLocation = document.getElementById("dashboard-room-location");
const roomModalFeatures = document.getElementById("dashboard-room-features");
const roomModalSlot = document.getElementById("dashboard-room-slot");
const roomModalDescription = document.getElementById("dashboard-room-description");
const roomModalAmenities = document.getElementById("dashboard-room-amenities");
const roomModalPurpose = document.getElementById("dashboard-room-purpose");
const roomModalSetup = document.getElementById("dashboard-room-setup");
const roomModalComfort = document.getElementById("dashboard-room-comfort");
const roomModalOrganizer = document.getElementById("dashboardBookingOrganizer");
const roomModalAttendeeSummary = document.getElementById("dashboardAttendeeSummary");
const roomModalOrganizerField = document.getElementById("dashboardOrganizerField");
const roomModalOrganizerSelect = document.getElementById("dashboardBookingOrganizerSelect");
const roomModalOrganizerHelp = document.getElementById("dashboardBookingOrganizerHelp");
const roomModalMeetingTitle = document.getElementById("dashboardMeetingTitle");
const roomModalMeetingDescription = document.getElementById("dashboardMeetingDescription");
const roomModalParticipantSearch = document.getElementById("dashboardParticipantSearch");
const roomModalParticipantAddBtn = document.getElementById("dashboardParticipantAddBtn");
const roomModalParticipantDepartmentFilter = document.getElementById("dashboardParticipantDepartmentFilter");
const roomModalParticipantProjectFilter = document.getElementById("dashboardParticipantProjectFilter");
const roomModalParticipantRoleFilter = document.getElementById("dashboardParticipantRoleFilter");
const roomModalParticipantLocationFilter = document.getElementById("dashboardParticipantLocationFilter");
const roomModalParticipantSuggestions = document.getElementById("dashboardParticipantSuggestions");
const roomModalParticipantChips = document.getElementById("dashboardParticipantChips");
const roomModalParticipantMessage = document.getElementById("dashboardParticipantMessage");
const roomModalMessage = document.getElementById("dashboard-room-message");
const roomModalBookBtn = document.getElementById("dashboard-room-book-btn");
const roomModalScheduleToggle = document.getElementById("dashboardRoomScheduleToggle");
const roomScheduleModal = document.getElementById("dashboard-room-schedule-modal");
const roomScheduleTitle = document.getElementById("dashboardRoomScheduleTitle");
const roomScheduleMeta = document.getElementById("dashboardRoomScheduleMeta");
const roomScheduleMessage = document.getElementById("dashboardRoomScheduleMessage");
const roomScheduleGrid = document.getElementById("dashboardRoomScheduleGrid");

function renderRoomMediaSummary(room) {
  if (roomModalPurpose) {
    roomModalPurpose.textContent = getRoomPurposeText(room);
  }
  if (roomModalSetup) {
    roomModalSetup.textContent = getRoomSetupText(room);
  }
  if (roomModalComfort) {
    roomModalComfort.textContent = getRoomComfortText(room);
  }
}

function getCreateBookingOrganizerEmployeeId() {
  const organizerEmployeeId = Number(selectedCreateOrganizerId || currentEmployeeId || 0);
  return organizerEmployeeId > 0 ? organizerEmployeeId : 0;
}

function getCreateBookingOrganizerOption() {
  const organizerEmployeeId = getCreateBookingOrganizerEmployeeId();
  return (
    getParticipantEmployeeDirectory("create").find(employee => Number(employee.employee_id) === organizerEmployeeId) ||
    null
  );
}

function getCreateBookingOrganizerDisplayName() {
  const organizerEmployeeId = getCreateBookingOrganizerEmployeeId();
  if (!organizerEmployeeId) {
    return "-";
  }

  if (organizerEmployeeId === currentEmployeeId) {
    return currentEmployee?.name || "You";
  }

  return getCreateBookingOrganizerOption()?.name || `Employee #${organizerEmployeeId}`;
}

function getParticipantPickerConfig(mode) {
  if (mode === "edit") {
    return {
      searchInput: bookingEditParticipantSearch,
      addButton: bookingEditParticipantAddBtn,
      suggestionsElement: bookingEditParticipantSuggestions,
      chipsElement: bookingEditParticipantChips,
      messageElement: bookingEditParticipantMessage,
      summaryElement: bookingEditAttendeeSummary,
      filterElements: {
        department: bookingEditParticipantDepartmentFilter,
        project: bookingEditParticipantProjectFilter,
        role: bookingEditParticipantRoleFilter,
        work_location_name: bookingEditParticipantLocationFilter
      },
      getCapacity: () => Number(selectedBooking?.room_capacity || 0),
      getOrganizerEmployeeId: () => Number(selectedBooking?.organizer_employee_id || selectedBooking?.employee_id || 0)
    };
  }

  return {
    searchInput: roomModalParticipantSearch,
    addButton: roomModalParticipantAddBtn,
    suggestionsElement: roomModalParticipantSuggestions,
    chipsElement: roomModalParticipantChips,
    messageElement: roomModalParticipantMessage,
    summaryElement: roomModalAttendeeSummary,
    filterElements: {
      department: roomModalParticipantDepartmentFilter,
      project: roomModalParticipantProjectFilter,
      role: roomModalParticipantRoleFilter,
      work_location_name: roomModalParticipantLocationFilter
    },
    getCapacity: () => Number(selectedRoom?.capacity || 0),
    getOrganizerEmployeeId: getCreateBookingOrganizerEmployeeId
  };
}

const PARTICIPANT_FILTER_FIELDS = [
  { key: "department", label: "All Departments" },
  { key: "project", label: "All Projects" },
  { key: "role", label: "All Roles" },
  { key: "work_location_name", label: "All Locations" }
];

function normalizeEmployeeOption(employee) {
  if (!employee || typeof employee !== "object") return null;

  const employeeId = Number(employee.employee_id || 0);
  if (!employeeId) return null;

  return {
    employee_id: employeeId,
    name: String(employee.name || "").trim() || `Employee #${employeeId}`,
    email: String(employee.email || "").trim() || "",
    department: String(employee.department || "").trim() || "",
    project: String(employee.project || "").trim() || "",
    role: String(employee.role || "").trim() || "",
    employee_type: String(employee.employee_type || "").trim() || "",
    work_location_id: Number(employee.work_location_id || 0) || null,
    work_location_name: String(employee.work_location_name || "").trim() || "",
    is_available: employee.is_available !== false,
    conflicting_booking_id: Number(employee.conflicting_booking_id || 0) || null,
    conflicting_booking_title: String(employee.conflicting_booking_title || "").trim() || "",
    conflicting_start_time: employee.conflicting_start_time || null,
    conflicting_end_time: employee.conflicting_end_time || null,
    conflicting_organizer_name: String(employee.conflicting_organizer_name || "").trim() || "",
    conflicting_involvement_role: String(employee.conflicting_involvement_role || "").trim() || ""
  };
}

function getParticipantPicker(mode) {
  return participantPickerState[mode] || participantPickerState.create;
}

function getParticipantEmployeeDirectory(mode) {
  return getParticipantPicker(mode).directory || [];
}

function getParticipantPickerAvailabilityWindow(mode) {
  if (mode === "edit") {
    const draftWindow = getBookingEditWindow();
    if (draftWindow?.start && draftWindow?.end) {
      return {
        start: draftWindow.start,
        end: draftWindow.end,
        exclude_booking_id: Number(selectedBooking?.booking_id || 0) || null
      };
    }

    if (selectedBooking?.start_time && selectedBooking?.end_time) {
      return {
        start: selectedBooking.start_time,
        end: selectedBooking.end_time,
        exclude_booking_id: Number(selectedBooking?.booking_id || 0) || null
      };
    }

    return {
      start: null,
      end: null,
      exclude_booking_id: Number(selectedBooking?.booking_id || 0) || null
    };
  }

  const windowValue = selectedBookingWindow || buildFinderWindow() || availabilityWindow || null;
  return {
    start: windowValue?.start || null,
    end: windowValue?.end || null,
    exclude_booking_id: null
  };
}

function buildParticipantDirectoryRequest(mode) {
  const availabilityWindow = getParticipantPickerAvailabilityWindow(mode);
  const params = new URLSearchParams();
  params.set("limit", "500");

  if (availabilityWindow.start && availabilityWindow.end) {
    params.set("start_time", availabilityWindow.start);
    params.set("end_time", availabilityWindow.end);
  }

  if (availabilityWindow.exclude_booking_id) {
    params.set("exclude_booking_id", String(availabilityWindow.exclude_booking_id));
  }

  return {
    key: JSON.stringify({
      mode,
      start_time: availabilityWindow.start || "",
      end_time: availabilityWindow.end || "",
      exclude_booking_id: availabilityWindow.exclude_booking_id || ""
    }),
    path: `/employees/search?${params.toString()}`
  };
}

function buildParticipantConflictHint(employee) {
  if (!employee || employee.is_available !== false) {
    return "";
  }

  const title = employee.conflicting_booking_title ? ` "${employee.conflicting_booking_title}"` : "";
  const organizerName = employee.conflicting_organizer_name ? ` by ${employee.conflicting_organizer_name}` : "";
  return `Unavailable due to another meeting${title}${organizerName}.`;
}

function buildParticipantAvailabilityMessage(mode, issues) {
  if (!Array.isArray(issues) || !issues.length) {
    return "";
  }

  const firstIssue = issues[0];
  const hint = buildParticipantConflictHint(firstIssue.employee);

  if (firstIssue.type === "organizer") {
    const organizerName = getParticipantPickerOrganizerDisplayName(mode);
    if (organizerName === "You") {
      return hint ? `You are not available during this time. ${hint}` : "You are not available during this time.";
    }

    return hint
      ? `${organizerName} is not available during this time. ${hint}`
      : `${organizerName} is not available during this time.`;
  }

  if (issues.length === 1) {
    return hint
      ? `${firstIssue.employee.name} is not available during this time. ${hint}`
      : `${firstIssue.employee.name} is not available during this time.`;
  }

  const names = issues
    .slice(0, 3)
    .map(issue => issue.employee.name)
    .filter(Boolean)
    .join(", ");

  return `Some selected attendees are not available during this time: ${names}.`;
}

async function loadEmployeeDirectory(mode, { force = false } = {}) {
  const picker = getParticipantPicker(mode);
  const request = buildParticipantDirectoryRequest(mode);
  if (!force && picker.directoryKey === request.key && picker.directory.length > 0) {
    return picker.directory;
  }

  const employees = await apiFetch(request.path);
  picker.directory = Array.isArray(employees) ? employees.map(normalizeEmployeeOption).filter(Boolean) : [];
  picker.directoryKey = request.key;
  populateParticipantFilters(mode);
  if (mode === "create") {
    renderRoomModalOrganizerSelection();
  }
  validateParticipantAvailability(mode, { showMessage: true });
  return picker.directory;
}

function setParticipantPickerMessage(mode, message, type = "") {
  const pickerConfig = getParticipantPickerConfig(mode);
  setHelperMessage(pickerConfig?.messageElement, message, type);
}

function getParticipantPickerSelectedIds(mode) {
  return getParticipantPicker(mode).selected.map(employee => Number(employee.employee_id));
}

function getParticipantPickerCapacity(mode) {
  const pickerConfig = getParticipantPickerConfig(mode);
  const rawCapacity = pickerConfig?.getCapacity?.();
  const capacity = Number(rawCapacity || 0);
  return capacity > 0 ? capacity : 0;
}

function getParticipantPickerOrganizerId(mode) {
  const pickerConfig = getParticipantPickerConfig(mode);
  const organizerEmployeeId = Number(pickerConfig?.getOrganizerEmployeeId?.() || currentEmployeeId || 0);
  return organizerEmployeeId > 0 ? organizerEmployeeId : 0;
}

function getParticipantPickerOrganizerDisplayName(mode) {
  const organizerEmployeeId = getParticipantPickerOrganizerId(mode);
  if (!organizerEmployeeId) {
    return "Organizer";
  }

  if (organizerEmployeeId === currentEmployeeId) {
    return "You";
  }

  if (mode === "edit") {
    return selectedBooking?.organizer_name || selectedBooking?.employee_name || `Employee #${organizerEmployeeId}`;
  }

  return getCreateBookingOrganizerOption()?.name || `Employee #${organizerEmployeeId}`;
}

function getParticipantPickerFilterValues(mode) {
  const filterElements = getParticipantPickerConfig(mode)?.filterElements || {};
  return {
    department: String(filterElements.department?.value || "").trim(),
    project: String(filterElements.project?.value || "").trim(),
    role: String(filterElements.role?.value || "").trim(),
    work_location_name: String(filterElements.work_location_name?.value || "").trim()
  };
}

function hasActiveParticipantFilters(mode) {
  return Object.values(getParticipantPickerFilterValues(mode)).some(Boolean);
}

function populateParticipantFilters(mode) {
  const pickerConfig = getParticipantPickerConfig(mode);
  const filterElements = pickerConfig?.filterElements || {};
  if (!Object.keys(filterElements).length) return;
  const employeeDirectory = getParticipantEmployeeDirectory(mode);

  PARTICIPANT_FILTER_FIELDS.forEach(field => {
    const selectElement = filterElements[field.key];
    if (!selectElement) return;

    const previousValue = String(selectElement.value || "");
    const uniqueValues = Array.from(
      new Set(
        employeeDirectory
          .map(employee => String(employee[field.key] || "").trim())
          .filter(Boolean)
      )
    ).sort((left, right) => left.localeCompare(right));

    selectElement.innerHTML = "";
    const defaultOption = document.createElement("option");
    defaultOption.value = "";
    defaultOption.textContent = field.label;
    selectElement.appendChild(defaultOption);

    uniqueValues.forEach(value => {
      const option = document.createElement("option");
      option.value = value;
      option.textContent = value;
      selectElement.appendChild(option);
    });

    selectElement.value = uniqueValues.includes(previousValue) ? previousValue : "";
  });
}

function resetParticipantFilters(mode) {
  const filterElements = getParticipantPickerConfig(mode)?.filterElements || {};
  Object.values(filterElements).forEach(selectElement => {
    if (!selectElement) return;
    selectElement.value = "";
  });
}

function hideParticipantSuggestions(mode) {
  const pickerConfig = getParticipantPickerConfig(mode);
  const suggestionContainer = pickerConfig?.suggestionsElement;
  if (!suggestionContainer) return;

  suggestionContainer.hidden = true;
  suggestionContainer.innerHTML = "";
  getParticipantPicker(mode).suggestions = [];
}

function updateParticipantAttendeeSummary(mode) {
  const pickerConfig = getParticipantPickerConfig(mode);
  const summaryElement = pickerConfig?.summaryElement;
  if (!summaryElement) return;

  const capacity = getParticipantPickerCapacity(mode);
  const selectedCount = getParticipantPicker(mode).selected.length;
  const totalAttendees = 1 + selectedCount;
  const capacityLabel = capacity > 0 ? capacity : "?";
  summaryElement.textContent = `Total attendees: ${totalAttendees} of ${capacityLabel} seats (1 organizer + ${selectedCount} added)`;
}

function renderParticipantChips(mode) {
  const pickerConfig = getParticipantPickerConfig(mode);
  const chipContainer = pickerConfig?.chipsElement;
  if (!chipContainer) return;

  const selectedEmployees = getParticipantPicker(mode).selected;
  const allowRemoval = !(mode === "edit" && bookingEditMode === "view");
  if (!selectedEmployees.length) {
    chipContainer.innerHTML = '<span class="participant-chip-empty">No additional attendees selected.</span>';
    return;
  }

  chipContainer.innerHTML = selectedEmployees
    .map(
      employee => `
        <span class="participant-chip">
          <span class="participant-chip-text">
            <span>${escapeHtml(employee.name)}</span>
            <small>${escapeHtml(employee.email || employee.department || "")}</small>
          </span>
          ${
            allowRemoval
              ? `
                <button
                  class="participant-chip-remove"
                  type="button"
                  data-participant-remove="${mode}"
                  data-employee-id="${employee.employee_id}"
                  aria-label="Remove ${escapeHtml(employee.name)}"
                >
                  &times;
                </button>
              `
              : ""
          }
        </span>
      `
    )
    .join("");
}

function getFilteredParticipantSuggestions(mode, searchTerm) {
  const normalizedSearch = String(searchTerm || "")
    .trim()
    .toLowerCase();
  const selectedIds = new Set(getParticipantPickerSelectedIds(mode));
  const organizerEmployeeId = getParticipantPickerOrganizerId(mode);
  const activeFilters = getParticipantPickerFilterValues(mode);

  return getParticipantEmployeeDirectory(mode)
    .filter(employee => {
      const employeeId = Number(employee.employee_id);
      if (!employeeId || employeeId === organizerEmployeeId || selectedIds.has(employeeId)) {
        return false;
      }

      if (activeFilters.department && employee.department !== activeFilters.department) {
        return false;
      }

      if (activeFilters.project && employee.project !== activeFilters.project) {
        return false;
      }

      if (activeFilters.role && employee.role !== activeFilters.role) {
        return false;
      }

      if (activeFilters.work_location_name && employee.work_location_name !== activeFilters.work_location_name) {
        return false;
      }

      if (!normalizedSearch) {
        return true;
      }

      const haystack =
        `${employee.name} ${employee.email} ${employee.department} ${employee.project} ${employee.role} ${employee.work_location_name}`.toLowerCase();
      return haystack.includes(normalizedSearch);
    })
    .sort((left, right) => {
      if (left.is_available !== right.is_available) {
        return left.is_available === true ? -1 : 1;
      }
      return left.name.localeCompare(right.name);
    })
    .slice(0, 8);
}

function renderParticipantSuggestions(mode) {
  const pickerConfig = getParticipantPickerConfig(mode);
  const suggestionContainer = pickerConfig?.suggestionsElement;
  const searchInput = pickerConfig?.searchInput;
  if (!suggestionContainer || !searchInput || searchInput.disabled) {
    hideParticipantSuggestions(mode);
    return;
  }

  const searchTerm = String(searchInput.value || "").trim();
  if (!searchTerm && !hasActiveParticipantFilters(mode)) {
    hideParticipantSuggestions(mode);
    return;
  }

  const suggestions = getFilteredParticipantSuggestions(mode, searchTerm);
  getParticipantPicker(mode).suggestions = suggestions;

  if (!suggestions.length) {
    hideParticipantSuggestions(mode);
    return;
  }

  suggestionContainer.hidden = false;
  suggestionContainer.innerHTML = suggestions
    .map(
      employee => `
        <button
          class="participant-suggestion ${employee.is_available === false ? "is-unavailable" : "is-available"}"
          type="button"
          data-participant-select="${mode}"
          data-employee-id="${employee.employee_id}"
          ${employee.is_available === false ? "disabled" : ""}
        >
          <strong>${escapeHtml(employee.name)}</strong>
          <span>
            ${escapeHtml(employee.email || "-")}
            ${employee.department ? ` | ${escapeHtml(employee.department)}` : ""}
            ${employee.project ? ` | ${escapeHtml(employee.project)}` : ""}
            ${employee.work_location_name ? ` | ${escapeHtml(employee.work_location_name)}` : ""}
            ${employee.is_available === false ? ` | ${escapeHtml(buildParticipantConflictHint(employee))}` : ""}
          </span>
        </button>
      `
    )
    .join("");
}

function getParticipantAvailabilityIssues(mode, { includeOrganizer = true } = {}) {
  const employeeDirectory = getParticipantEmployeeDirectory(mode);
  const employeeById = new Map(employeeDirectory.map(employee => [Number(employee.employee_id), employee]));
  const issues = [];

  if (includeOrganizer) {
    const organizerEmployeeId = getParticipantPickerOrganizerId(mode);
    const organizer = employeeById.get(organizerEmployeeId);
    if (organizer && organizer.is_available === false) {
      issues.push({ type: "organizer", employee: organizer });
    }
  }

  getParticipantPicker(mode).selected.forEach(selectedEmployee => {
    const employee = employeeById.get(Number(selectedEmployee.employee_id));
    if (employee && employee.is_available === false) {
      issues.push({
        type: "participant",
        employee: {
          ...employee,
          name: selectedEmployee.name || employee.name
        }
      });
    }
  });

  return issues;
}

function validateParticipantAvailability(mode, { showMessage = true } = {}) {
  const issues = getParticipantAvailabilityIssues(mode);
  if (issues.length > 0) {
    if (showMessage) {
      setParticipantPickerMessage(mode, buildParticipantAvailabilityMessage(mode, issues), "error");
    }
    return false;
  }

  if (showMessage) {
    setParticipantPickerMessage(mode, "", "");
  }
  return true;
}

function validateParticipantCapacity(mode) {
  const capacity = getParticipantPickerCapacity(mode);
  if (!capacity) {
    updateParticipantAttendeeSummary(mode);
    return true;
  }

  const totalAttendees = 1 + getParticipantPicker(mode).selected.length;
  updateParticipantAttendeeSummary(mode);

  if (totalAttendees > capacity) {
    setParticipantPickerMessage(mode, `Total attendees cannot exceed room capacity of ${capacity}.`, "error");
    return false;
  }

  return true;
}

function setParticipantSelection(mode, employees) {
  const picker = getParticipantPicker(mode);
  const normalizedEmployees = Array.isArray(employees)
    ? employees.map(normalizeEmployeeOption).filter(Boolean)
    : [];

  picker.selected = normalizedEmployees.filter(
    employee => Number(employee.employee_id) !== getParticipantPickerOrganizerId(mode)
  );

  renderParticipantChips(mode);
  updateParticipantAttendeeSummary(mode);
  renderParticipantSuggestions(mode);
  if (validateParticipantCapacity(mode)) {
    validateParticipantAvailability(mode, { showMessage: true });
  }
}

function addParticipantToPicker(mode, employee) {
  const pickerConfig = getParticipantPickerConfig(mode);
  if (!pickerConfig) return false;

  const normalizedEmployee = normalizeEmployeeOption(employee);
  if (!normalizedEmployee) {
    setParticipantPickerMessage(mode, "Select a valid active employee.", "error");
    return false;
  }

  const picker = getParticipantPicker(mode);
  const organizerEmployeeId = getParticipantPickerOrganizerId(mode);
  if (normalizedEmployee.employee_id === organizerEmployeeId) {
    setParticipantPickerMessage(mode, "Organizer is already included as an attendee.", "error");
    return false;
  }

  if (picker.selected.some(item => Number(item.employee_id) === normalizedEmployee.employee_id)) {
    setParticipantPickerMessage(mode, `${normalizedEmployee.name} is already selected.`, "error");
    return false;
  }

  if (normalizedEmployee.is_available === false) {
    const hint = buildParticipantConflictHint(normalizedEmployee);
    setParticipantPickerMessage(
      mode,
      hint ? `${normalizedEmployee.name} is not available during this time. ${hint}` : `${normalizedEmployee.name} is not available during this time.`,
      "error"
    );
    return false;
  }

  picker.selected = [...picker.selected, normalizedEmployee];
  renderParticipantChips(mode);
  renderParticipantSuggestions(mode);
  const capacityIsValid = validateParticipantCapacity(mode);
  if (!capacityIsValid) {
    picker.selected = picker.selected.filter(item => Number(item.employee_id) !== normalizedEmployee.employee_id);
    renderParticipantChips(mode);
    renderParticipantSuggestions(mode);
    validateParticipantCapacity(mode);
    return false;
  }

  validateParticipantAvailability(mode, { showMessage: true });
  if (pickerConfig.searchInput) {
    pickerConfig.searchInput.value = "";
    pickerConfig.searchInput.focus();
  }
  hideParticipantSuggestions(mode);
  return true;
}

function removeParticipantFromPicker(mode, employeeId) {
  const picker = getParticipantPicker(mode);
  picker.selected = picker.selected.filter(employee => Number(employee.employee_id) !== Number(employeeId));
  renderParticipantChips(mode);
  renderParticipantSuggestions(mode);
  if (validateParticipantCapacity(mode)) {
    validateParticipantAvailability(mode, { showMessage: true });
  }
}

function resolveParticipantCandidate(mode) {
  const pickerConfig = getParticipantPickerConfig(mode);
  const searchInput = pickerConfig?.searchInput;
  if (!searchInput) return null;

  const rawSearch = String(searchInput.value || "").trim().toLowerCase();
  const suggestions = getParticipantPicker(mode).suggestions;
  if (!rawSearch) {
    return suggestions[0] || null;
  }

  return (
    suggestions.find(employee => {
      const exactName = String(employee.name || "").trim().toLowerCase() === rawSearch;
      const exactEmail = String(employee.email || "").trim().toLowerCase() === rawSearch;
      return (exactName || exactEmail) && employee.is_available !== false;
    }) ||
    suggestions.find(employee => employee.is_available !== false) ||
    null
  );
}

async function ensureParticipantDirectory(mode) {
  try {
    await loadEmployeeDirectory(mode);
    return true;
  } catch (error) {
    console.error("Failed to load employees for participant picker:", error);
    setParticipantPickerMessage(mode, error.message || "Unable to load employees right now.", "error");
    return false;
  }
}

async function attemptAddParticipantFromInput(mode) {
  const directoryReady = await ensureParticipantDirectory(mode);
  if (!directoryReady) return;

  const candidate = resolveParticipantCandidate(mode);
  if (!candidate) {
    const firstSuggestion = getParticipantPicker(mode).suggestions[0];
    if (firstSuggestion && firstSuggestion.is_available === false) {
      const hint = buildParticipantConflictHint(firstSuggestion);
      setParticipantPickerMessage(
        mode,
        hint
          ? `${firstSuggestion.name} is not available during this time. ${hint}`
          : `${firstSuggestion.name} is not available during this time.`,
        "error"
      );
    } else {
      setParticipantPickerMessage(mode, "Search and select an available employee to add.", "error");
    }
    return;
  }

  addParticipantToPicker(mode, candidate);
}

function resetParticipantPicker(mode) {
  const pickerConfig = getParticipantPickerConfig(mode);
  const picker = getParticipantPicker(mode);
  picker.selected = [];
  picker.suggestions = [];

  if (pickerConfig?.searchInput) {
    pickerConfig.searchInput.value = "";
  }

  resetParticipantFilters(mode);
  picker.directory = [];
  picker.directoryKey = "";
  populateParticipantFilters(mode);
  renderParticipantChips(mode);
  updateParticipantAttendeeSummary(mode);
  hideParticipantSuggestions(mode);
  setParticipantPickerMessage(mode, "", "");
  if (mode === "create") {
    renderRoomModalOrganizerSelection();
  }
}

function initializeParticipantPicker(mode) {
  const pickerConfig = getParticipantPickerConfig(mode);
  if (!pickerConfig?.searchInput || !pickerConfig.addButton) {
    return;
  }

  pickerConfig.searchInput.addEventListener("focus", async () => {
    const directoryReady = await ensureParticipantDirectory(mode);
    if (!directoryReady) return;
    renderParticipantSuggestions(mode);
  });

  pickerConfig.searchInput.addEventListener("input", async () => {
    const directoryReady = await ensureParticipantDirectory(mode);
    if (!directoryReady) return;
    setParticipantPickerMessage(mode, "", "");
    renderParticipantSuggestions(mode);
  });

  pickerConfig.searchInput.addEventListener("keydown", async event => {
    if (event.key !== "Enter") return;
    event.preventDefault();
    await attemptAddParticipantFromInput(mode);
  });

  pickerConfig.addButton.addEventListener("click", async () => {
    await attemptAddParticipantFromInput(mode);
  });

  Object.values(pickerConfig.filterElements || {}).forEach(selectElement => {
    if (!selectElement) return;
    selectElement.addEventListener("change", async () => {
      const directoryReady = await ensureParticipantDirectory(mode);
      if (!directoryReady) return;
      validateParticipantAvailability(mode, { showMessage: true });
      renderParticipantSuggestions(mode);
    });
  });
}

function syncCreateParticipantsWithOrganizer() {
  setParticipantSelection("create", getParticipantPicker("create").selected);
}

function updateRoomModalOrganizerSummary() {
  if (!roomModalOrganizer) return;
  roomModalOrganizer.textContent = getCreateBookingOrganizerDisplayName();
}

function renderRoomModalOrganizerSelection() {
  if (!roomModalOrganizerField || !roomModalOrganizerSelect) {
    updateRoomModalOrganizerSummary();
    return;
  }

  if (!(currentRole === "admin" && isAdmin)) {
    roomModalOrganizerField.hidden = true;
    roomModalOrganizerSelect.innerHTML = "";
    setRoomModalOrganizerHelp("", "");
    updateRoomModalOrganizerSummary();
    return;
  }

  roomModalOrganizerField.hidden = false;
  const directory = getParticipantEmployeeDirectory("create");
  if (!directory.length) {
    roomModalOrganizerSelect.disabled = true;
    roomModalOrganizerSelect.innerHTML = '<option value="">Loading active employees...</option>';
    setRoomModalOrganizerHelp("Loading active employees...", "");
    updateRoomModalOrganizerSummary();
    return;
  }

  const organizerExists = directory.some(employee => Number(employee.employee_id) === getCreateBookingOrganizerEmployeeId());
  if (!organizerExists) {
    selectedCreateOrganizerId = Number(
      directory.find(employee => Number(employee.employee_id) === Number(currentEmployeeId || 0))?.employee_id ||
        directory[0]?.employee_id ||
        0
    );
  }

  roomModalOrganizerSelect.disabled = false;
  roomModalOrganizerSelect.innerHTML = directory
    .map(employee => {
      const label =
        `${employee.name} (${employee.email || `Employee #${employee.employee_id}`})` +
        (employee.is_available === false ? " - Unavailable" : "");
      return `<option value="${employee.employee_id}">${escapeHtml(label)}</option>`;
    })
    .join("");
  roomModalOrganizerSelect.value = String(getCreateBookingOrganizerEmployeeId());

  const organizer = getCreateBookingOrganizerOption();
  updateRoomModalOrganizerSummary();

  if (organizer?.is_available === false) {
    const hint = buildParticipantConflictHint(organizer);
    setRoomModalOrganizerHelp(
      hint ? `${organizer.name} is not available during this time. ${hint}` : `${organizer.name} is not available during this time.`,
      "error"
    );
    return;
  }

  if (getCreateBookingOrganizerEmployeeId() === currentEmployeeId) {
    setRoomModalOrganizerHelp("This booking will be created under your account.", "");
    return;
  }

  setRoomModalOrganizerHelp(
    organizer?.name ? `This booking will be created for ${organizer.name}.` : "This booking will be created for the selected employee.",
    ""
  );
}

function setCreateBookingOrganizer(employeeId) {
  const nextOrganizerId = Number(employeeId || 0);
  selectedCreateOrganizerId = nextOrganizerId > 0 ? nextOrganizerId : Number(currentEmployeeId || 0);
  updateRoomModalOrganizerSummary();
  renderRoomModalOrganizerSelection();
  syncCreateParticipantsWithOrganizer();
  renderParticipantSuggestions("create");
  validateParticipantAvailability("create", { showMessage: true });
}

function setRoomModalMessage(message, type = "") {
  setHelperMessage(roomModalMessage, message, type);
}

function setRoomModalBookButtonState(isAvailable) {
  if (!roomModalBookBtn) return;
  roomModalBookBtn.hidden = false;
  roomModalBookBtn.disabled = !isAvailable;
  roomModalBookBtn.textContent = isAvailable ? "Book This Room" : "Booked";
}

function setRoomScheduleMessage(message, type = "") {
  setHelperMessage(roomScheduleMessage, message, type);
}

function setRoomModalOrganizerHelp(message, type = "") {
  setHelperMessage(roomModalOrganizerHelp, message, type);
}

function getSlotLabel(windowValue) {
  if (!windowValue?.start || !windowValue?.end) {
    return "Selected Slot: Not set";
  }

  return `Selected Slot: ${formatDateTime(windowValue.start)} - ${formatTime(windowValue.end)}`;
}

function getRoomScheduleDurationMinutes() {
  const finderDuration = document.getElementById("finderDuration")?.value || "";
  const fallbackDuration = getMinutesBetween(selectedBookingWindow?.start, selectedBookingWindow?.end, 60);
  const preferredDuration = getDurationMinutes(finderDuration, fallbackDuration);
  return Math.max(30, preferredDuration);
}

function getRoomScheduleDateRange() {
  const startDate = new Date();
  startDate.setHours(0, 0, 0, 0);

  const endDate = new Date(startDate);
  endDate.setDate(endDate.getDate() + ROOM_SCHEDULE_DAYS);

  return { startDate, endDate };
}

function buildRoomScheduleRequest(roomId) {
  const range = getRoomScheduleDateRange();
  const params = new URLSearchParams({
    start_time: range.startDate.toISOString(),
    end_time: range.endDate.toISOString(),
    days: String(ROOM_SCHEDULE_DAYS)
  });

  return {
    key: JSON.stringify({
      room_id: Number(roomId || 0),
      start_time: params.get("start_time"),
      end_time: params.get("end_time"),
      days: ROOM_SCHEDULE_DAYS
    }),
    path: `/rooms/${Number(roomId || 0)}/schedule?${params.toString()}`
  };
}

function normalizeRoomScheduleBooking(booking) {
  if (!booking || typeof booking !== "object") return null;

  const bookingId = Number(booking.booking_id || 0);
  const startDate = parseDateValue(booking.start_time);
  const endDate = parseDateValue(booking.end_time);
  if (!bookingId || !startDate || !endDate) {
    return null;
  }

  return {
    booking_id: bookingId,
    room_id: Number(booking.room_id || 0),
    title: String(booking.title || "").trim() || "Booked meeting",
    description: String(booking.description || "").trim() || "",
    start_time: startDate.toISOString(),
    end_time: endDate.toISOString(),
    start_ms: startDate.getTime(),
    end_ms: endDate.getTime(),
    organizer_name: String(booking.organizer_name || "").trim() || "Unknown organizer",
    status: String(booking.status || "").trim() || "confirmed"
  };
}

function normalizeRoomSchedulePayload(payload) {
  return {
    room: payload?.room || selectedRoom || null,
    range: payload?.range || null,
    bookings: Array.isArray(payload?.bookings) ? payload.bookings.map(normalizeRoomScheduleBooking).filter(Boolean) : []
  };
}

function getRoomScheduleWorkingWindow() {
  const startMinutes = getTimeValueMinutes(ROOM_SCHEDULE_DEFAULT_WORKDAY_START);
  const endMinutes = getTimeValueMinutes(ROOM_SCHEDULE_DEFAULT_WORKDAY_END);

  return {
    startMinutes: startMinutes === null ? 10 * 60 : startMinutes,
    endMinutes: endMinutes === null ? 19 * 60 : endMinutes
  };
}

function getRoomScheduleDayMeta(dayDate) {
  const weekday = dayDate.getDay();
  if (weekday === 0 || weekday === 6) {
    return {
      className: "is-holiday",
      label: "Weekend"
    };
  }

  if (weekday === 1 || weekday === 5) {
    return {
      className: "is-wfh",
      label: "WFH"
    };
  }

  return {
    className: "is-office",
    label: "Office"
  };
}

function getRoomScheduleMetaText(payload) {
  const { startMinutes, endMinutes } = getRoomScheduleWorkingWindow(payload);
  const workdayStart = format24HourAs12Hour(
    `${String(Math.floor(startMinutes / 60)).padStart(2, "0")}:${String(startMinutes % 60).padStart(2, "0")}`
  );
  const workdayEnd = format24HourAs12Hour(
    `${String(Math.floor(endMinutes / 60)).padStart(2, "0")}:${String(endMinutes % 60).padStart(2, "0")}`
  );
  return `Weekly overview | ${workdayStart} - ${workdayEnd} | 18 half-hour slots`;
}

function buildRoomScheduleLoadingMarkup(dayCount = ROOM_SCHEDULE_DAYS) {
  return Array.from({ length: dayCount })
    .map(
      () => `
        <article class="room-schedule-day is-loading" aria-hidden="true">
          <div class="room-schedule-day-head">
            <span class="skeleton-line"></span>
            <small class="skeleton-line skeleton-line-sm"></small>
          </div>
          <div class="room-schedule-day-slots">
            <div class="room-schedule-slot is-skeleton"><span class="skeleton-line"></span><small class="skeleton-line skeleton-line-sm"></small></div>
            <div class="room-schedule-slot is-skeleton"><span class="skeleton-line"></span><small class="skeleton-line skeleton-line-sm"></small></div>
            <div class="room-schedule-slot is-skeleton"><span class="skeleton-line"></span><small class="skeleton-line skeleton-line-sm"></small></div>
          </div>
        </article>
      `
    )
    .join("");
}

function isRoomScheduleSlotSelected(slot) {
  return Boolean(
    slot?.start &&
      slot?.end &&
      selectedBookingWindow?.start === slot.start &&
      selectedBookingWindow?.end === slot.end
  );
}

function buildRoomScheduleDayDates() {
  const { startDate } = getRoomScheduleDateRange();
  return Array.from({ length: ROOM_SCHEDULE_DAYS }).map((_, index) => {
    const day = new Date(startDate);
    day.setDate(startDate.getDate() + index);
    return day;
  });
}

function getRoomScheduleConflictBooking(bookings, slotStartMs, slotEndMs) {
  return bookings.find(booking => booking.start_ms < slotEndMs && booking.end_ms > slotStartMs) || null;
}

function buildRoomScheduleSlotsForDay(dayDate, payload) {
  const durationMinutes = ROOM_SCHEDULE_STEP_MINUTES;
  const { startMinutes, endMinutes } = getRoomScheduleWorkingWindow(payload);
  const lastStartMinutes = endMinutes - durationMinutes;
  const nowMs = Date.now();

  if (lastStartMinutes < startMinutes) {
    return [];
  }

  const bookings = Array.isArray(payload?.bookings) ? payload.bookings : [];
  const slots = [];

  for (let minute = startMinutes; minute <= lastStartMinutes; minute += ROOM_SCHEDULE_STEP_MINUTES) {
    const slotStart = new Date(dayDate);
    slotStart.setHours(0, 0, 0, 0);
    slotStart.setMinutes(minute);

    const slotEnd = new Date(slotStart.getTime() + durationMinutes * 60 * 1000);
    const booking = getRoomScheduleConflictBooking(bookings, slotStart.getTime(), slotEnd.getTime());
    const isPast = slotStart.getTime() < nowMs;
    const state = booking ? "booked" : isPast ? "past" : "available";

    slots.push({
      start: slotStart.toISOString(),
      end: slotEnd.toISOString(),
      booking,
      is_available: state === "available",
      is_past: state === "past",
      state
    });
  }

  return slots;
}

function buildRoomScheduleSlotMarkup(slot) {
  const startLabel = formatTime(slot.start, ROOM_SCHEDULE_TIMEZONE, { includeTimeZone: false });
  const endLabel = formatTime(slot.end, ROOM_SCHEDULE_TIMEZONE, { includeTimeZone: false });
  const slotLabel = escapeHtml(`${startLabel} - ${endLabel}`);
  const selectedClassName = isRoomScheduleSlotSelected(slot) ? " is-selected" : "";

  if (slot.is_available) {
    return `
      <button
        class="room-schedule-slot available${selectedClassName}"
        type="button"
        data-room-schedule-select="true"
        data-start-time="${escapeHtml(slot.start)}"
        data-end-time="${escapeHtml(slot.end)}"
      >
        <strong>${slotLabel}</strong>
        <span class="room-schedule-slot-status">Open</span>
      </button>
    `;
  }

  if (slot.is_past) {
    return `
      <article class="room-schedule-slot past">
        <strong>${slotLabel}</strong>
        <span class="room-schedule-slot-status">Past</span>
      </article>
    `;
  }

  const booking = slot.booking || null;
  const title = escapeHtml(booking?.title || "Booked meeting");

  return `
    <article class="room-schedule-slot booked" title="${title}">
      <strong>${slotLabel}</strong>
      <span class="room-schedule-slot-status">Busy</span>
    </article>
  `;
}

function buildRoomScheduleDayMarkup(dayDate, payload) {
  const slots = buildRoomScheduleSlotsForDay(dayDate, payload);
  const dayMeta = getRoomScheduleDayMeta(dayDate);
  const dayLabel = dayDate.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    timeZone: ROOM_SCHEDULE_TIMEZONE
  });

  return `
    <article class="room-schedule-day ${dayMeta.className}">
      <div class="room-schedule-day-head">
        <strong>${escapeHtml(dayLabel)}</strong>
        <small>${escapeHtml(dayMeta.label)}</small>
      </div>
      <div class="room-schedule-day-slots">
        ${
          slots.length > 0
            ? slots.map(buildRoomScheduleSlotMarkup).join("")
            : '<p class="room-schedule-empty-day">No slots available.</p>'
        }
      </div>
    </article>
  `;
}

function renderRoomSchedule() {
  if (!roomScheduleGrid || !roomScheduleMeta) return;

  if (roomScheduleState.loading) {
    roomScheduleMeta.textContent = "Loading upcoming room schedule...";
    roomScheduleGrid.innerHTML = buildRoomScheduleLoadingMarkup();
    return;
  }

  roomScheduleMeta.textContent = getRoomScheduleMetaText(roomScheduleState.payload);

  if (!roomScheduleState.payload) {
    roomScheduleGrid.innerHTML = '<div class="empty-state room-schedule-empty">Open the schedule to load the next 7 days.</div>';
    return;
  }

  const dayDates = buildRoomScheduleDayDates();
  roomScheduleGrid.innerHTML = dayDates.map(dayDate => buildRoomScheduleDayMarkup(dayDate, roomScheduleState.payload)).join("");
}

async function loadRoomSchedule({ force = false } = {}) {
  if (!selectedRoom?.room_id) {
    throw new Error("Select a room to view its schedule.");
  }

  const request = buildRoomScheduleRequest(selectedRoom.room_id);
  if (!force && roomScheduleState.requestKey === request.key && roomScheduleState.payload) {
    renderRoomSchedule();
    return roomScheduleState.payload;
  }

  roomScheduleState.loading = true;
  renderRoomSchedule();

  try {
    const payload = await apiFetch(request.path);
    roomScheduleState.payload = normalizeRoomSchedulePayload(payload);
    roomScheduleState.requestKey = request.key;
    renderRoomSchedule();
    return roomScheduleState.payload;
  } finally {
    roomScheduleState.loading = false;
    renderRoomSchedule();
  }
}

function setRoomScheduleOpen(isOpen) {
  roomScheduleState.isOpen = Boolean(isOpen);

  if (roomModalScheduleToggle) {
    roomModalScheduleToggle.setAttribute("aria-expanded", roomScheduleState.isOpen ? "true" : "false");
    roomModalScheduleToggle.textContent = roomScheduleState.isOpen ? "Hide Schedule" : "View Schedule";
  }

  if (!roomScheduleState.isOpen) {
    if (roomScheduleModal && !roomScheduleModal.hidden) {
      closeManagedModal(roomScheduleModal);
      if (roomModal && !roomModal.hidden) {
        activeModalElement = roomModal;
      }
    }
    setRoomScheduleMessage("", "");
    return;
  }

  if (roomScheduleTitle) {
    roomScheduleTitle.textContent = `${selectedRoom?.name || "Room"} Schedule`;
  }

  renderRoomSchedule();
  if (roomScheduleModal) {
    openManagedModal(roomScheduleModal, roomModalScheduleToggle);
  }
  void loadRoomSchedule({ force: false }).catch(error => {
    console.error("Failed to load room schedule:", error);
    roomScheduleState.payload = null;
    roomScheduleState.requestKey = "";
    roomScheduleState.loading = false;
    renderRoomSchedule();
    setRoomScheduleMessage(error.message || "Unable to load room schedule right now.", "error");
  });
}

function resetRoomScheduleState() {
  roomScheduleState.isOpen = false;
  roomScheduleState.loading = false;
  roomScheduleState.requestKey = "";
  roomScheduleState.payload = null;

  if (roomScheduleModal && !roomScheduleModal.hidden) {
    closeManagedModal(roomScheduleModal);
  }

  if (roomModalScheduleToggle) {
    roomModalScheduleToggle.setAttribute("aria-expanded", "false");
    roomModalScheduleToggle.textContent = "View Schedule";
  }

  if (roomScheduleTitle) {
    roomScheduleTitle.textContent = "Room Schedule";
  }

  if (roomScheduleMeta) {
    roomScheduleMeta.textContent = "Weekly overview | 10:00 AM - 7:00 PM | 18 half-hour slots";
  }

  if (roomScheduleGrid) {
    roomScheduleGrid.innerHTML = "";
  }

  setRoomScheduleMessage("", "");
}

async function applyRoomScheduleSelection(startTime, endTime) {
  const slotStart = parseDateValue(startTime);
  const slotEnd = parseDateValue(endTime);
  const dateInput = document.getElementById("finderDate");
  const timeInput = document.getElementById("finderTime");
  const durationInput = document.getElementById("finderDuration");

  if (!slotStart || !slotEnd || !dateInput || !timeInput || !durationInput) {
    setRoomScheduleMessage("Unable to apply the selected slot.", "error");
    return;
  }

  const durationMinutes = getMinutesBetween(startTime, endTime, getRoomScheduleDurationMinutes());
  dateInput.value = getLocalDateInputValue(slotStart);
  setTimeInputValue(timeInput, getLocalTimeInputValue(slotStart));
  ensureDurationOption(durationInput, durationMinutes);
  durationInput.value = String(durationMinutes);
  applyFinderDateTimeConstraints();

  selectedBookingWindow = buildWindowFromLocalInputs(dateInput.value, getTimeInputValue24(timeInput), durationInput.value);
  if (!selectedBookingWindow) {
    setRoomScheduleMessage("Unable to update the booking form with that slot.", "error");
    return;
  }

  if (roomModalSlot) {
    roomModalSlot.textContent = getSlotLabel(selectedBookingWindow);
  }

  selectedRoom = {
    ...selectedRoom,
    is_available: 1,
    booked_until: null
  };

  setRoomModalBookButtonState(true);
  setRoomModalMessage("Selected slot applied from schedule.", "success");
  setRoomScheduleOpen(false);

  void loadEmployeeDirectory("create", { force: true })
    .then(() => {
      renderParticipantSuggestions("create");
    })
    .catch(error => {
      console.error("Failed to refresh participant availability after schedule selection:", error);
    });

  void searchRooms().catch(error => {
    console.error("Failed to refresh room finder after schedule selection:", error);
  });
}

function openRoomModal(room, bookingWindow) {
  if (!roomModal || !room) return;

  selectedRoom = room;
  selectedBookingWindow = bookingWindow || buildFinderWindow() || availabilityWindow;
  selectedCreateOrganizerId = Number(currentEmployeeId || 0);
  resetRoomScheduleState();

  if (roomModalImage) roomModalImage.src = getRoomImage(room);
  if (roomModalTitle) roomModalTitle.textContent = room.name || "Room";
  if (roomModalLocation) roomModalLocation.textContent = room.location_name || "Unknown location";
  if (roomModalFeatures) roomModalFeatures.textContent = buildRoomFeatures(room, { limit: 4 });
  if (roomModalSlot) roomModalSlot.textContent = getSlotLabel(selectedBookingWindow);
  if (roomModalDescription) {
    roomModalDescription.textContent = room.description || "No description available for this room.";
  }
  renderRoomMediaSummary(room);
  renderRoomAmenities(roomModalAmenities, room);
  updateRoomModalOrganizerSummary();
  renderRoomModalOrganizerSelection();
  if (roomModalMeetingTitle) {
    roomModalMeetingTitle.value = `Meeting in ${room.name || "Room"}`;
  }
  if (roomModalMeetingDescription) {
    roomModalMeetingDescription.value = "";
  }
  resetParticipantPicker("create");
  updateParticipantAttendeeSummary("create");
  void loadEmployeeDirectory("create", { force: true })
    .then(() => {
      renderParticipantSuggestions("create");
    })
    .catch(error => {
      console.error("Failed to preload employees for room booking:", error);
    });

  const available = isRoomAvailable(room);
  if (!available) {
    setRoomModalMessage(getRoomAvailabilityLabel(room), "error");
  } else {
    setRoomModalMessage("", "");
  }

  setRoomModalBookButtonState(available);

  openManagedModal(roomModal);
}

function closeRoomModal() {
  if (!roomModal) return;
  closeManagedModal(roomModal);
  selectedRoom = null;
  selectedBookingWindow = null;
  selectedCreateOrganizerId = Number(currentEmployeeId || 0);
  if (roomModalMeetingTitle) roomModalMeetingTitle.value = "";
  if (roomModalMeetingDescription) roomModalMeetingDescription.value = "";
  updateRoomModalOrganizerSummary();
  renderRoomModalOrganizerSelection();
  resetRoomScheduleState();
  resetParticipantPicker("create");
  setRoomModalOrganizerHelp("", "");
  setRoomModalMessage("", "");
}

async function bookSelectedRoom() {
  setRoomModalMessage("", "");

  if (!selectedRoom) {
    setRoomModalMessage("Select a room first.", "error");
    return;
  }

  if (!isRoomAvailable(selectedRoom)) {
    setRoomModalMessage(getRoomAvailabilityLabel(selectedRoom), "error");
    return;
  }

  const windowValue = selectedBookingWindow || buildFinderWindow() || availabilityWindow;
  if (!windowValue?.start || !windowValue?.end) {
    setRoomModalMessage("Select date and time in Room Finder first.", "error");
    return;
  }

  const startTimestamp = Date.parse(windowValue.start);
  if (isPastBeyondGrace(startTimestamp)) {
    setRoomModalMessage("You cannot book for past date/time.", "error");
    return;
  }

  const payload = {
    room_id: selectedRoom.room_id,
    title: roomModalMeetingTitle?.value?.trim() || "",
    description: roomModalMeetingDescription?.value?.trim() || "",
    start_time: windowValue.start,
    end_time: windowValue.end,
    status: "confirmed"
  };

  if (!payload.title || !payload.description) {
    setRoomModalMessage("Meeting name and description are required.", "error");
    return;
  }

  const organizerEmployeeId = getCreateBookingOrganizerEmployeeId();
  if (!organizerEmployeeId) {
    setRoomModalMessage("Select a valid organizer for this booking.", "error");
    return;
  }

  if (!validateParticipantCapacity("create")) {
    return;
  }

  const directoryReady = await ensureParticipantDirectory("create");
  if (!directoryReady || !validateParticipantAvailability("create", { showMessage: true })) {
    return;
  }

  payload.participant_employee_ids = getParticipantPickerSelectedIds("create");
  payload.employee_id = organizerEmployeeId;

  try {
    await apiFetch("/bookings", {
      method: "POST",
      body: JSON.stringify(payload)
    });

    setRoomModalMessage("Room booked successfully.", "success");
    await refreshBookingViews();

    setTimeout(() => {
      closeRoomModal();
    }, 500);
  } catch (error) {
    console.error("Booking failed:", error);
    setRoomModalMessage(error.message || "Booking failed.", "error");
  }
}

function initializeRoomModalHandlers() {
  if (!roomModal) return;

  roomModal.addEventListener("click", event => {
    if (event.target.matches("[data-close-modal]")) {
      closeRoomModal();
    }
  });
  if (roomScheduleModal) {
    roomScheduleModal.addEventListener("click", event => {
      const scheduleSelectButton = event.target.closest("button[data-room-schedule-select][data-start-time][data-end-time]");
      if (scheduleSelectButton) {
        void applyRoomScheduleSelection(
          String(scheduleSelectButton.dataset.startTime || ""),
          String(scheduleSelectButton.dataset.endTime || "")
        );
        return;
      }

      if (event.target.matches("[data-close-room-schedule-modal]")) {
        setRoomScheduleOpen(false);
      }
    });
  }

  document.addEventListener("keydown", event => {
    trapActiveModalFocus(event);

    if (event.key !== "Escape") return;

    if (dashboardSidebar && dashboardSidebar.classList.contains("is-open")) {
      closeSidebarDrawer();
      return;
    }

    if (roomScheduleModal && !roomScheduleModal.hidden) {
      setRoomScheduleOpen(false);
      return;
    }

    if (bookingEditModal && !bookingEditModal.hidden) {
      closeBookingEditModal();
      return;
    }

    if (employeeAdminModal && !employeeAdminModal.hidden) {
      closeEmployeeAdminModal();
      return;
    }

    if (!roomModal.hidden) {
      closeRoomModal();
    }
  });

  if (roomModalBookBtn) {
    roomModalBookBtn.addEventListener("click", bookSelectedRoom);
  }
  if (roomModalOrganizerSelect) {
    roomModalOrganizerSelect.addEventListener("change", () => {
      setCreateBookingOrganizer(roomModalOrganizerSelect.value);
    });
  }
  if (roomModalScheduleToggle) {
    roomModalScheduleToggle.addEventListener("click", () => {
      setRoomScheduleOpen(!roomScheduleState.isOpen);
    });
  }

  initializeParticipantPicker("create");
}

function initializeRoomDetailsInteractions() {
  const finderTable = document.getElementById("roomFinderTable");
  if (finderTable) {
    finderTable.addEventListener("click", event => {
      const clickable = event.target.closest("[data-room-id]");
      if (!clickable) return;

      const roomId = Number(clickable.dataset.roomId);
      const room = finderRoomsById.get(roomId);
      if (!room) return;

      openRoomModal(room, buildFinderWindow() || availabilityWindow);
    });
  }

  const availabilityList = document.getElementById("overviewAvailabilityList");
  if (availabilityList) {
    availabilityList.addEventListener("click", event => {
      const row = event.target.closest("[data-room-id]");
      if (!row) return;

      const roomId = Number(row.dataset.roomId);
      const room = availabilityRoomsById.get(roomId);
      if (!room) return;

      openRoomModal(room, availabilityWindow);
    });

    availabilityList.addEventListener("keydown", event => {
      if (event.key !== "Enter" && event.key !== " ") return;

      const row = event.target.closest("[data-room-id]");
      if (!row) return;

      event.preventDefault();
      const roomId = Number(row.dataset.roomId);
      const room = availabilityRoomsById.get(roomId);
      if (!room) return;

      openRoomModal(room, availabilityWindow);
    });
  }
}

