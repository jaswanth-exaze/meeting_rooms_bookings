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

function initializeRoomScheduleModalHandlers() {
  if (!roomScheduleModal) return;

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
