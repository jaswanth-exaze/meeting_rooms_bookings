const API_BASE_URL = window.APP_CONFIG?.API_BASE_URL || "http://localhost:4000/api";

const ROOM_IMAGES_BY_NAME = {
  
  "cell pod 1": "assets/cell_pod_1.png",
  "cell pod 2": "assets/cell_pod_2.png",
  hubble: "assets/hubble-2-persons.png",
  fusion: "assets/fussion-6-members.png",
  nexus: "assets/Nexus-2-persons.png",
  zenith: "assets/zenith-3-persons.png",
  synergy: "assets/synergy-4-members.png",
  "tranquil": "assets/tranquil-5-members.png",
  "think tank": "assets/think_tank.png",
  "innovation hub": "assets/Innovation_Hub.png",
  boardroom: "assets/boardroom-15-members.png",
  pinnacle: "assets/pinnacle-15-members.png",
  "conference room a": "assets/Conference_Room_A.png",
  "conference room b": "assets/Conference_Room_B.png",
  "training room": "assets/training_room.png",
  karoo: "assets/hubble-2-persons.png",
  meerkat: "assets/Nexus-2-persons.png",
  "cape town": "assets/synergy-4-members.png",
  "drakensberg": "assets/fussion-6-members.png",
  "table mountain": "assets/fussion-6-members.png",
};

const roomSearchForm = document.getElementById("room-search-form");
const bookingDateInput = document.getElementById("booking-date");
const bookingTimeInput = document.getElementById("booking-time");
const bookingDurationSelect = document.getElementById("booking-duration");
const bookingLocationSelect = document.getElementById("booking-location");
const bookingAttendeesSelect = document.getElementById("booking-attendees");
const featuredLocationFilter = document.getElementById("featured-location-filter");
const roomsGrid = document.querySelector(".rooms-grid");
const bookingMessage = document.getElementById("booking-message");

const roomDetailModal = document.getElementById("room-detail-modal");
const roomDetailImage = document.getElementById("room-detail-image");
const roomDetailTitle = document.getElementById("room-detail-title");
const roomDetailMeta = document.getElementById("room-detail-meta");
const roomDetailAvailability = document.getElementById("room-detail-availability");
const roomDetailDescription = document.getElementById("room-detail-description");
const modalMeetingTitleInput = document.getElementById("modal-meeting-title");
const modalMeetingDescriptionInput = document.getElementById("modal-meeting-description");
const modalBookButton = document.getElementById("modal-book-btn");
const roomModalMessage = document.getElementById("room-modal-message");

let currentRooms = [];
let selectedRoom = null;
const BOOKING_PAST_GRACE_MS = 60 * 1000;
const ROOM_AVAILABLE_SOON_MS = 60 * 1000;
const TIMEZONE_CODE_OVERRIDES = Object.freeze({
  "Asia/Kolkata": "IST",
  "Africa/Johannesburg": "SAST"
});
const FOCUSABLE_SELECTOR = [
  "a[href]",
  "button:not([disabled])",
  "textarea:not([disabled])",
  "input:not([disabled]):not([type='hidden'])",
  "select:not([disabled])",
  "[tabindex]:not([tabindex='-1'])"
].join(", ");
let lastRoomModalTrigger = null;
let slideshowTimerId = null;
let isSlideshowInitialized = false;

function initializeStickyAuthCardState() {
  const authCard = document.querySelector(".home-auth-card");
  if (!authCard) return;

  const desktopMediaQuery = window.matchMedia("(min-width: 1041px)");
  let isTicking = false;

  function readStickyTopPx() {
    const computedTop = Number.parseFloat(window.getComputedStyle(authCard).top || "0");
    return Number.isFinite(computedTop) ? computedTop : 0;
  }

  function updateStickyState() {
    const isDesktopLayout = desktopMediaQuery.matches;
    if (!isDesktopLayout) {
      authCard.classList.remove("is-stuck");
      return;
    }

    const stickyTop = readStickyTopPx();
    const cardRect = authCard.getBoundingClientRect();
    const parentRect = authCard.parentElement?.getBoundingClientRect();
    const hasReachedStickyTop = cardRect.top <= stickyTop + 0.5;
    const parentPassedStickyTop = parentRect ? parentRect.top <= stickyTop : window.scrollY > 0;

    authCard.classList.toggle("is-stuck", hasReachedStickyTop && parentPassedStickyTop);
  }

  function scheduleStickyStateUpdate() {
    if (isTicking) return;
    isTicking = true;

    window.requestAnimationFrame(() => {
      isTicking = false;
      updateStickyState();
    });
  }

  window.addEventListener("scroll", scheduleStickyStateUpdate, { passive: true });
  window.addEventListener("resize", scheduleStickyStateUpdate, { passive: true });
  desktopMediaQuery.addEventListener("change", scheduleStickyStateUpdate);
  scheduleStickyStateUpdate();
}

function isVisibleElement(element) {
  if (!(element instanceof HTMLElement)) return false;
  if (element.hidden) return false;
  return element.getClientRects().length > 0;
}

function getModalFocusableElements(modalElement) {
  if (!modalElement) return [];
  return Array.from(modalElement.querySelectorAll(FOCUSABLE_SELECTOR))
    .filter(node => isVisibleElement(node) && node.getAttribute("aria-hidden") !== "true");
}

function focusFirstElementInModal(modalElement) {
  const focusableElements = getModalFocusableElements(modalElement);
  const target = focusableElements[0];
  if (target) {
    target.focus();
  }
}

function trapModalFocus(modalElement, event) {
  if (!modalElement || modalElement.hidden || event.key !== "Tab") return;

  const focusableElements = getModalFocusableElements(modalElement);
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

function getLocalDateInputValue(date = new Date()) {
  const timezoneOffsetMs = date.getTimezoneOffset() * 60 * 1000;
  return new Date(date.getTime() - timezoneOffsetMs).toISOString().slice(0, 10);
}

function getLocalTimeInputValue(date = new Date()) {
  return date.toTimeString().slice(0, 5);
}

function normalizeTimeValueTo24(value) {
  const raw = String(value || "").trim();
  if (!raw) return null;

  const twentyFourHourMatch = raw.match(/^([01]?\d|2[0-3]):([0-5]\d)$/);
  if (twentyFourHourMatch) {
    return `${String(Number.parseInt(twentyFourHourMatch[1], 10)).padStart(2, "0")}:${twentyFourHourMatch[2]}`;
  }

  const twelveHourMatch = raw.match(/^(0?[1-9]|1[0-2]):([0-5]\d)\s*([AaPp][Mm])$/);
  if (!twelveHourMatch) return null;

  let hours = Number.parseInt(twelveHourMatch[1], 10) % 12;
  if (twelveHourMatch[3].toUpperCase() === "PM") {
    hours += 12;
  }

  return `${String(hours).padStart(2, "0")}:${twelveHourMatch[2]}`;
}

function format24HourAs12Hour(value24) {
  const normalized = normalizeTimeValueTo24(value24);
  if (!normalized) return "";

  const [hoursRaw, minutes] = normalized.split(":");
  const hours = Number.parseInt(hoursRaw, 10);
  const period = hours >= 12 ? "PM" : "AM";
  const hours12 = ((hours + 11) % 12) + 1;
  return `${String(hours12).padStart(2, "0")}:${minutes} ${period}`;
}

function getTimeInputValue24(inputElement) {
  if (!inputElement) return null;
  const dataTime24 = inputElement.getAttribute("data-time24");
  return normalizeTimeValueTo24(dataTime24 || inputElement.value);
}

function setTimeInputValue(inputElement, timeValue24) {
  if (!inputElement) return;
  const normalized = normalizeTimeValueTo24(timeValue24);
  if (!normalized) return;

  const isTwelveHour = String(inputElement.getAttribute("data-time-format") || "").toLowerCase() === "12h";
  if (isTwelveHour) {
    inputElement.setAttribute("data-time24", normalized);
    inputElement.value = format24HourAs12Hour(normalized);
    return;
  }

  inputElement.value = normalized;
}

function getTimeValueMinutes(value) {
  const normalized = normalizeTimeValueTo24(value);
  if (!normalized) return null;

  const [hours, minutes] = normalized.split(":").map(part => Number.parseInt(part, 10));
  if (!Number.isFinite(hours) || !Number.isFinite(minutes)) return null;
  return hours * 60 + minutes;
}

function isPastBeyondGrace(timestamp, graceMs = BOOKING_PAST_GRACE_MS) {
  if (!Number.isFinite(timestamp)) return true;
  return timestamp < Date.now() - graceMs;
}

function setBookingMessage(message, type) {
  if (!bookingMessage) return;

  bookingMessage.textContent = message || "";
  bookingMessage.classList.remove("success", "error");

  if (type === "success" || type === "error") {
    bookingMessage.classList.add(type);
  }
}

function setRoomModalMessage(message, type) {
  if (!roomModalMessage) return;

  roomModalMessage.textContent = message || "";
  roomModalMessage.classList.remove("success", "error");

  if (type === "success" || type === "error") {
    roomModalMessage.classList.add(type);
  }
}

function normalizeRoomName(roomName) {
  return String(roomName || "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, " ");
}

function getRoomImage(room) {
  if (!room) {
    return "assets/image(3).png";
  }

  const normalizedRoomName = normalizeRoomName(room.name);
  return ROOM_IMAGES_BY_NAME[normalizedRoomName] || "assets/image(3).png";
}

function getFeatureText(room) {
  const features = [];

  if (room.has_projector === 1 || room.has_projector === true || room.has_projector === "1") {
    features.push("Projector");
  }

  if (room.has_screen === 1 || room.has_screen === true || room.has_screen === "1") {
    features.push("Screen");
  }

  if (room.has_whiteboard === 1 || room.has_whiteboard === true || room.has_whiteboard === "1") {
    features.push("Whiteboard");
  }

  if (features.length === 0) {
    return "Standard setup";
  }

  return features.join(" | ");
}

function getRoomMetaText(room) {
  const location = room.location_name || "Unknown location";
  const capacity = `${room.capacity || 0} Seats`;
  const features = getFeatureText(room);

  return `${location} | ${capacity} | ${features}`;
}

function isRoomAvailable(room) {
  return room?.is_available === 1 || room?.is_available === true || room?.is_available === "1";
}

function normalizeTimeZone(value) {
  const normalized = String(value || "").trim();
  return normalized || null;
}

function getTimeZoneCode(date, timeZone) {
  const normalizedTimeZone = normalizeTimeZone(timeZone);
  if (normalizedTimeZone && TIMEZONE_CODE_OVERRIDES[normalizedTimeZone]) {
    return TIMEZONE_CODE_OVERRIDES[normalizedTimeZone];
  }

  const formatterOptions = { timeZoneName: "short" };
  if (normalizedTimeZone) {
    formatterOptions.timeZone = normalizedTimeZone;
  }

  try {
    const parts = new Intl.DateTimeFormat("en-US", formatterOptions).formatToParts(date);
    const zoneName = parts.find(part => part.type === "timeZoneName")?.value?.trim();
    if (zoneName) return zoneName;
  } catch (_error) {
    // Fallback to UTC when timezone formatting fails.
  }

  return "UTC";
}

function formatDateTime(value, timeZone) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  const normalizedTimeZone = normalizeTimeZone(timeZone);
  const dateOptions = { month: "short", day: "2-digit", year: "numeric" };
  const timeOptions = { hour: "numeric", minute: "2-digit", hour12: true };

  let dateText = "";
  let timeText = "";
  try {
    const optionsWithZone = normalizedTimeZone ? { timeZone: normalizedTimeZone } : {};
    dateText = date.toLocaleDateString("en-US", { ...dateOptions, ...optionsWithZone });
    timeText = date.toLocaleTimeString("en-US", { ...timeOptions, ...optionsWithZone });
  } catch (_error) {
    dateText = date.toLocaleDateString("en-US", dateOptions);
    timeText = date.toLocaleTimeString("en-US", timeOptions);
  }

  return `${dateText} ${timeText} ${getTimeZoneCode(date, normalizedTimeZone)}`;
}

function getAvailabilityLabel(room) {
  if (isRoomAvailable(room)) {
    return "Available for selected slot";
  }

  if (room?.booked_until) {
    const bookedUntil = new Date(room.booked_until);
    if (!Number.isNaN(bookedUntil.getTime()) && bookedUntil.getTime() <= Date.now() + ROOM_AVAILABLE_SOON_MS) {
      return "Booked. Available now";
    }
    return `Booked. Available after ${formatDateTime(room.booked_until, room.location_timezone)}`;
  }

  return "Booked for selected slot";
}

function renderLoadingCard(message) {
  if (!roomsGrid) return;

  roomsGrid.innerHTML = "";

  const card = document.createElement("article");
  card.className = "room-card room-loading";

  const body = document.createElement("div");
  body.className = "room-body";

  const title = document.createElement("h3");
  title.className = "room-title";
  title.textContent = message;

  body.appendChild(title);
  card.appendChild(body);
  roomsGrid.appendChild(card);
}

function renderRooms(rooms) {
  if (!roomsGrid) return;

  currentRooms = Array.isArray(rooms) ? rooms : [];
  roomsGrid.innerHTML = "";

  if (currentRooms.length === 0) {
    renderLoadingCard("No rooms found for selected filters.");
    return;
  }

  currentRooms.forEach(room => {
    const card = document.createElement("article");
    card.className = "room-card";

    const media = document.createElement("div");
    media.className = "room-media";

    const image = document.createElement("img");
    image.src = getRoomImage(room);
    image.alt = `${room.name || "Room"} preview`;

    const capacityPill = document.createElement("span");
    capacityPill.className = "room-capacity-pill";
    capacityPill.textContent = `${room.capacity || 0} Persons`;

    const body = document.createElement("div");
    body.className = "room-body";

    const title = document.createElement("h3");
    title.className = "room-title";
    title.textContent = room.name || "Meeting Room";

    const meta = document.createElement("p");
    meta.className = "room-meta";
    meta.textContent = getRoomMetaText(room);

    const availability = document.createElement("p");
    availability.className = `room-availability ${isRoomAvailable(room) ? "available" : "booked"}`;
    availability.textContent = getAvailabilityLabel(room);

    const button = document.createElement("button");
    button.className = "btn btn-primary";
    button.type = "button";
    button.textContent = "View Details";
    button.dataset.roomId = String(room.room_id);

    body.appendChild(title);
    body.appendChild(meta);
    body.appendChild(availability);
    media.appendChild(image);
    media.appendChild(capacityPill);
    card.appendChild(media);
    card.appendChild(body);
    card.appendChild(button);
    roomsGrid.appendChild(card);
  });
}

function fillLocationOptions(selectElement, locations) {
  if (!selectElement) return;

  const selectedValue = selectElement.value;
  selectElement.innerHTML = '<option value="">All Locations</option>';

  locations.forEach(location => {
    const option = document.createElement("option");
    option.value = String(location.location_id);
    option.textContent = location.name;
    selectElement.appendChild(option);
  });

  if (selectedValue) {
    selectElement.value = selectedValue;
  }
}

function loadLocations() {
  fetch(`${API_BASE_URL}/locations`)
    .then(async response => {
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data?.message || "Unable to load locations.");
      }
      return data;
    })
    .then(locations => {
      fillLocationOptions(bookingLocationSelect, locations);
      fillLocationOptions(featuredLocationFilter, locations);
    })
    .catch(error => {
      console.error("Error loading locations:", error);
      setBookingMessage("Failed to load locations.", "error");
    });
}

function loadFeaturedRooms() {
  if (!roomsGrid) return;

  renderLoadingCard("Loading featured rooms...");

  let url = `${API_BASE_URL}/rooms?limit=9`;

  if (featuredLocationFilter && featuredLocationFilter.value) {
    url += `&location_id=${encodeURIComponent(featuredLocationFilter.value)}`;
  }

  fetch(url)
    .then(async response => {
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data?.message || "Unable to load rooms.");
      }
      return data;
    })
    .then(rooms => {
      renderRooms(rooms);
    })
    .catch(error => {
      console.error("Error loading featured rooms:", error);
      renderLoadingCard("Unable to load featured rooms.");
      setBookingMessage("Failed to load featured rooms.", "error");
    });
}

function getSearchStartAndEnd() {
  if (!bookingDateInput || !bookingTimeInput) {
    return null;
  }

  if (!bookingDateInput.value || !bookingTimeInput.value) {
    return null;
  }

  const timeValue24 = getTimeInputValue24(bookingTimeInput);
  if (!timeValue24) {
    return null;
  }

  const start = new Date(`${bookingDateInput.value}T${timeValue24}`);
  if (Number.isNaN(start.getTime())) {
    return null;
  }

  const durationMinutes = Number.parseInt(bookingDurationSelect?.value, 10);
  const safeDuration = Number.isFinite(durationMinutes) && durationMinutes > 0 ? durationMinutes : 60;
  const end = new Date(start.getTime() + safeDuration * 60 * 1000);

  return {
    start: start.toISOString(),
    end: end.toISOString()
  };
}

function applyBookingDateTimeConstraints() {
  if (!bookingDateInput || !bookingTimeInput) return;

  const now = new Date();
  const today = getLocalDateInputValue(now);
  bookingDateInput.min = today;

  if (!bookingDateInput.value) {
    bookingDateInput.value = today;
  }

  if (bookingDateInput.value === today) {
    const minTime = getLocalTimeInputValue(now);
    bookingTimeInput.min = minTime;
    const currentMinutes = getTimeValueMinutes(getTimeInputValue24(bookingTimeInput));
    const minMinutes = getTimeValueMinutes(minTime);
    if (currentMinutes !== null && minMinutes !== null && currentMinutes < minMinutes) {
      setTimeInputValue(bookingTimeInput, minTime);
    }
  } else {
    bookingTimeInput.min = "";
  }
}

function parseCapacityRange(value) {
  if (!value) return null;

  const raw = String(value).trim();
  if (!raw) return null;

  if (!raw.includes("-")) {
    const parsed = Number.parseInt(raw, 10);
    if (!Number.isFinite(parsed) || parsed <= 0) return null;
    return { min: parsed, max: null };
  }

  const [minRaw, maxRaw] = raw.split("-");
  const min = Number.parseInt(minRaw, 10);
  const max = Number.parseInt(maxRaw, 10);

  if (!Number.isFinite(min) || min <= 0) return null;
  if (!Number.isFinite(max) || max <= 0) return { min, max: null };
  if (max < min) return { min, max: null };

  return { min, max };
}

function searchRooms(event) {
  event.preventDefault();
  setBookingMessage("", "");
  renderLoadingCard("Searching rooms...");

  const params = new URLSearchParams();
  params.set("limit", "12");

  if (bookingLocationSelect && bookingLocationSelect.value) {
    params.set("location_id", bookingLocationSelect.value);
  }

  const capacityRange = parseCapacityRange(bookingAttendeesSelect?.value);
  if (capacityRange?.min) {
    params.set("capacity", String(capacityRange.min));
  }

  const windowValue = getSearchStartAndEnd();
  if (windowValue) {
    params.set("start_time", windowValue.start);
    params.set("end_time", windowValue.end);
  }

  fetch(`${API_BASE_URL}/rooms?${params.toString()}`)
    .then(async response => {
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data?.message || "Room search failed.");
      }
      return data;
    })
    .then(rooms => {
      let filteredRooms = Array.isArray(rooms) ? rooms : [];

      // Backend supports minimum capacity only; apply max range on client for precise filter behavior.
      if (capacityRange?.max) {
        filteredRooms = filteredRooms.filter(room => Number(room.capacity || 0) <= capacityRange.max);
      }

      renderRooms(filteredRooms);
    })
    .catch(error => {
      console.error("Error searching rooms:", error);
      renderLoadingCard("Unable to search rooms right now.");
      setBookingMessage("Room search failed.", "error");
    });
}

function openRoomModal(room, triggerElement = null) {
  if (!roomDetailModal || !room) return;

  lastRoomModalTrigger =
    triggerElement instanceof HTMLElement
      ? triggerElement
      : document.activeElement instanceof HTMLElement
        ? document.activeElement
        : null;
  selectedRoom = room;
  setRoomModalMessage("", "");
  roomDetailImage.src = getRoomImage(room);
  roomDetailTitle.textContent = room.name || "Meeting Room";

  roomDetailMeta.textContent = getRoomMetaText(room);
  if (roomDetailAvailability) {
    const available = isRoomAvailable(room);
    roomDetailAvailability.className = `room-availability ${available ? "available" : "booked"}`;
    roomDetailAvailability.textContent = getAvailabilityLabel(room);
  }
  roomDetailDescription.textContent = room.description || "No description available.";
  if (modalMeetingTitleInput) {
    modalMeetingTitleInput.value = `Meeting in ${room.name || "Room"}`;
  }
  if (modalMeetingDescriptionInput) {
    modalMeetingDescriptionInput.value = "";
  }

  if (modalBookButton) {
    const available = isRoomAvailable(room);
    modalBookButton.disabled = !available;
    modalBookButton.textContent = available ? "Book This Room" : "Booked";
  }

  roomDetailModal.hidden = false;
  focusFirstElementInModal(roomDetailModal);
}

function closeRoomModal() {
  if (!roomDetailModal) return;
  roomDetailModal.hidden = true;
  setRoomModalMessage("", "");
  if (modalBookButton) {
    modalBookButton.disabled = false;
    modalBookButton.textContent = "Book This Room";
  }
  if (modalMeetingTitleInput) {
    modalMeetingTitleInput.value = "";
  }
  if (modalMeetingDescriptionInput) {
    modalMeetingDescriptionInput.value = "";
  }
  selectedRoom = null;

  if (lastRoomModalTrigger && lastRoomModalTrigger.isConnected) {
    lastRoomModalTrigger.focus();
  }
  lastRoomModalTrigger = null;
}

function handleRoomCardClick(event) {
  const button = event.target.closest("button[data-room-id]");
  if (!button) return;

  const roomId = Number(button.dataset.roomId);
  const room = currentRooms.find(item => Number(item.room_id) === roomId);

  if (!room) {
    setBookingMessage("Room details not found.", "error");
    return;
  }

  openRoomModal(room, button);
}

function getStoredEmployee() {
  const rawEmployee = localStorage.getItem("auth_employee");
  if (!rawEmployee) return null;

  try {
    return JSON.parse(rawEmployee);
  } catch (_error) {
    return null;
  }
}

function bookRoom() {
  setRoomModalMessage("", "");

  if (!selectedRoom) {
    setRoomModalMessage("Select a room before booking.", "error");
    return;
  }

  if (!isRoomAvailable(selectedRoom)) {
    setRoomModalMessage(getAvailabilityLabel(selectedRoom), "error");
    return;
  }

  const windowValue = getSearchStartAndEnd();
  if (!windowValue) {
    setRoomModalMessage("Choose booking date and time first.", "error");
    return;
  }

  const startTimestamp = Date.parse(windowValue.start);
  if (isPastBeyondGrace(startTimestamp)) {
    setRoomModalMessage("You cannot book for past date/time.", "error");
    return;
  }

  const employee = getStoredEmployee();
  const payload = {
    room_id: selectedRoom.room_id,
    title: modalMeetingTitleInput?.value?.trim() || "",
    description: modalMeetingDescriptionInput?.value?.trim() || "",
    start_time: windowValue.start,
    end_time: windowValue.end
  };

  if (!payload.title || !payload.description) {
    setRoomModalMessage("Meeting name and description are required.", "error");
    return;
  }

  if (employee && employee.employee_id) {
    payload.employee_id = employee.employee_id;
  }

  fetch(`${API_BASE_URL}/bookings`, {
    method: "POST",
    credentials: "include",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(payload)
  })
    .then(async response => {
      const data = await response.json();
      if (!response.ok) {
        if (response.status === 401) {
          throw new Error("Please sign in first to book a room.");
        }
        throw new Error(data.message || "Booking failed.");
      }
      return data;
    })
    .then(data => {
      closeRoomModal();
      setBookingMessage(data.message || "Booking created successfully.", "success");
      loadFeaturedRooms();
    })
    .catch(error => {
      console.error("Error creating booking:", error);
      setRoomModalMessage(error.message || "Booking failed.", "error");
    });
}

if (roomSearchForm) {
  roomSearchForm.addEventListener("submit", searchRooms);
}

if (featuredLocationFilter) {
  featuredLocationFilter.addEventListener("change", loadFeaturedRooms);
}

if (roomsGrid) {
  roomsGrid.addEventListener("click", handleRoomCardClick);
}

if (roomDetailModal) {
  roomDetailModal.addEventListener("click", function(event) {
    if (event.target.matches("[data-close-modal]")) {
      closeRoomModal();
    }
  });

  document.addEventListener("keydown", function(event) {
    if (roomDetailModal.hidden) return;

    if (event.key === "Escape") {
      closeRoomModal();
      return;
    }

    trapModalFocus(roomDetailModal, event);
  });
}

if (modalBookButton) {
  modalBookButton.addEventListener("click", bookRoom);
}

function initializeSearchDefaults() {
  if (!bookingDateInput || !bookingTimeInput) return;

  const now = new Date();
  const roundedMinutes = Math.ceil(now.getMinutes() / 30) * 30;
  now.setMinutes(roundedMinutes, 0, 0);

  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  const hours = String(now.getHours()).padStart(2, "0");
  const minutes = String(now.getMinutes()).padStart(2, "0");

  bookingDateInput.value = `${now.getFullYear()}-${month}-${day}`;
  setTimeInputValue(bookingTimeInput, `${hours}:${minutes}`);

  if (bookingDurationSelect && !bookingDurationSelect.value) {
    bookingDurationSelect.value = "60";
  }

  applyBookingDateTimeConstraints();
}

if (bookingLocationSelect && featuredLocationFilter && roomsGrid) {
  initializeSearchDefaults();
  if (bookingDateInput) {
    bookingDateInput.addEventListener("change", applyBookingDateTimeConstraints);
  }
  if (bookingTimeInput) {
    bookingTimeInput.addEventListener("focus", applyBookingDateTimeConstraints);
  }
  loadLocations();
  loadFeaturedRooms();
}

// Auto-slideshow functionality
function initializeSlideshow() {
  if (isSlideshowInitialized) {
    return;
  }

  const heroSlides = document.querySelectorAll(".hero-slide");
  const slideshowDots = document.querySelectorAll(".slideshow-dot");

  if (heroSlides.length === 0 || slideshowDots.length === 0) {
    return;
  }

  isSlideshowInitialized = true;
  let currentSlideIndex = 0;
  const autoPlayInterval = 5000; // 5 seconds
  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  function showSlide(index) {
    // Ensure index is within bounds
    currentSlideIndex = (index + heroSlides.length) % heroSlides.length;

    // Remove active class from all slides and dots
    heroSlides.forEach(slide => slide.classList.remove("active"));
    slideshowDots.forEach(dot => dot.classList.remove("active"));

    // Add active class to current slide and dot
    heroSlides[currentSlideIndex].classList.add("active");
    slideshowDots[currentSlideIndex].classList.add("active");
  }

  function stopAutoPlay() {
    if (slideshowTimerId) {
      window.clearInterval(slideshowTimerId);
      slideshowTimerId = null;
    }
  }

  function startAutoPlay() {
    if (prefersReducedMotion) return;
    stopAutoPlay();
    slideshowTimerId = window.setInterval(() => {
      showSlide(currentSlideIndex + 1);
    }, autoPlayInterval);
  }

  // Set up dot click handlers for manual navigation
  slideshowDots.forEach((dot, index) => {
    dot.addEventListener("click", () => {
      showSlide(index);
      // Reset auto-play timer
      startAutoPlay();
    });
  });

  document.addEventListener("visibilitychange", () => {
    if (document.hidden) {
      stopAutoPlay();
    } else {
      startAutoPlay();
    }
  });

  window.addEventListener("beforeunload", stopAutoPlay, { once: true });
  startAutoPlay();
}

// Initialize slideshow when DOM is ready
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", () => {
    initializeSlideshow();
    initializeStickyAuthCardState();
  });
} else {
  initializeSlideshow();
  initializeStickyAuthCardState();
}
