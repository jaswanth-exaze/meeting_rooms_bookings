// Manage the employee room booking modal.

// Cache the DOM nodes reused throughout this module.
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

// Render room media summary.
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

// Set room modal message.
function setRoomModalMessage(message, type = "") {
  setHelperMessage(roomModalMessage, message, type);
}

// Set room modal book button state.
function setRoomModalBookButtonState(isAvailable) {
  if (!roomModalBookBtn) return;
  roomModalBookBtn.hidden = false;
  roomModalBookBtn.disabled = !isAvailable;
  roomModalBookBtn.textContent = isAvailable ? "Book This Room" : "Booked";
}

// Set room schedule message.
function setRoomScheduleMessage(message, type = "") {
  setHelperMessage(roomScheduleMessage, message, type);
}

// Set room modal organizer help.
function setRoomModalOrganizerHelp(message, type = "") {
  setHelperMessage(roomModalOrganizerHelp, message, type);
}

// Return slot label.
function getSlotLabel(windowValue) {
  if (!windowValue?.start || !windowValue?.end) {
    return "Selected Slot: Not set";
  }

  return `Selected Slot: ${formatDateTime(windowValue.start)} - ${formatTime(windowValue.end)}`;
}

// Open room modal.
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

// Close room modal.
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

// Book selected room.
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

// Initialize room modal handlers.
function initializeRoomModalHandlers() {
  if (!roomModal) return;

  roomModal.addEventListener("click", event => {
    if (event.target.matches("[data-close-modal]")) {
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
