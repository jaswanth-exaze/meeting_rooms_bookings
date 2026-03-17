function renderAvailabilityList(rooms) {
  const list = document.getElementById("overviewAvailabilityList");
  if (!list) return;

  const roomRows = Array.isArray(rooms) ? rooms : [];
  setBookedNowPanelTone(roomRows.length);

  availabilityRoomsById = new Map();
  roomRows.forEach(room => {
    availabilityRoomsById.set(Number(room.room_id), room);
  });

  if (roomRows.length === 0) {
    list.innerHTML = `
      <li>
        <span>No booked rooms right now</span>
        <small>All rooms are currently free</small>
      </li>
    `;
    return;
  }

  list.innerHTML = roomRows
    .slice(0, 5)
    .map(room => {
      const roomId = Number(room.room_id);
      const availabilityHint = escapeHtml(getRoomAvailabilityLabel(room));
      const detailAttrs = `class="clickable-room" data-room-id="${roomId}" tabindex="0" role="button"`;

      return `
        <li ${detailAttrs}>
          <span>${escapeHtml(room.name || "-")}</span>
          <small>${escapeHtml(room.capacity || "-")} Seats | ${availabilityHint} | View details</small>
        </li>
      `;
    })
    .join("");
}

function renderAvailabilityErrorState() {
  const list = document.getElementById("overviewAvailabilityList");
  if (!list) return;

  availabilityRoomsById = new Map();
  setBookedNowPanelTone(0);
  list.innerHTML = `
    <li>
      <span>Unable to refresh booked rooms</span>
      <small>Please use refresh to retry.</small>
    </li>
  `;
}

async function loadFinderLocations() {
  const locationSelect = document.getElementById("finderLocation");
  if (!locationSelect) return;

  try {
    const locations = await apiFetch("/locations", { skipAuth: true });
    const selected = locationSelect.value;

    locationSelect.innerHTML = '<option value="">All Locations</option>';
    locations.forEach(location => {
      const option = document.createElement("option");
      option.value = String(location.location_id);
      option.textContent = location.name;
      locationSelect.appendChild(option);
    });

    if (selected) locationSelect.value = selected;
  } catch (error) {
    console.error("Failed to load locations:", error);
  }
}

async function searchRooms(event) {
  if (event) event.preventDefault();

  setRoomFinderMessage("", "");

  const locationValue = document.getElementById("finderLocation")?.value || "";
  const capacityValue = document.getElementById("finderCapacity")?.value || "";
  const table = document.getElementById("roomFinderTable");
  const pagination = document.getElementById("roomFinderPagination");

  const params = new URLSearchParams();
  params.set("limit", "100");
  if (locationValue) params.set("location_id", locationValue);
  if (capacityValue) params.set("capacity", capacityValue);

  const windowValue = buildFinderWindow();
  if (!windowValue?.start || !windowValue?.end) {
    setRoomFinderMessage("Select valid date, time, and duration.", "error");
    renderRoomFinderTable([]);
    return;
  }

  const finderStart = parseDateValue(windowValue.start);
  if (!finderStart || isPastBeyondGrace(finderStart.getTime())) {
    setRoomFinderMessage("Past date/time search is not allowed. Please pick current or future time.", "error");
    renderRoomFinderTable([]);
    return;
  }

  params.set("start_time", windowValue.start);
  params.set("end_time", windowValue.end);

  if (table) {
    table.innerHTML = buildTableSkeletonRows(6, 4);
  }
  if (pagination) {
    pagination.innerHTML = "";
  }

  try {
    const rooms = await apiFetch(`/rooms?${params.toString()}`, { skipAuth: true });
    renderRoomFinderTable(rooms);
  } catch (error) {
    console.error("Room search failed:", error);
    renderRoomFinderTable([]);
  }
}

async function loadOverviewAvailability() {
  const start = new Date();
  const end = new Date(start.getTime() + 60 * 1000);
  availabilityWindow = {
    start: start.toISOString(),
    end: end.toISOString()
  };
  const list = document.getElementById("overviewAvailabilityList");

  const params = new URLSearchParams({
    start_time: availabilityWindow.start,
    end_time: availabilityWindow.end,
    limit: "100"
  });

  if (list) {
    list.innerHTML = buildAvailabilityLoadingMarkup(3);
  }

  try {
    const rooms = await apiFetch(`/rooms?${params.toString()}`, { skipAuth: true });
    const bookedRooms = (rooms || []).filter(room => !isRoomAvailable(room));
    renderAvailabilityList(bookedRooms);
  } catch (error) {
    console.error("Availability load failed:", error);
    renderAvailabilityErrorState();
  }
}
