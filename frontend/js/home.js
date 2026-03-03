const API_BASE_URL = "http://localhost:4000/api";

const ROOM_IMAGES_BY_NAME = {
  
  "cell pod 1": "assets/cell_pod_1.png",
  "cell pod 2": "assets/cell_pod_2.png",
  hubble:"assets/hubble-2-persons.png",
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
  "training room": "assets/training_room.png"
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
const roomDetailLocation = document.getElementById("room-detail-location");
const roomDetailMeta = document.getElementById("room-detail-meta");
const roomDetailAvailability = document.getElementById("room-detail-availability");
const roomDetailDescription = document.getElementById("room-detail-description");
const modalMeetingTitleInput = document.getElementById("modal-meeting-title");
const modalMeetingDescriptionInput = document.getElementById("modal-meeting-description");
const modalBookButton = document.getElementById("modal-book-btn");
const roomModalMessage = document.getElementById("room-modal-message");

let currentRooms = [];
let selectedRoom = null;

function getLocalDateInputValue(date = new Date()) {
  const timezoneOffsetMs = date.getTimezoneOffset() * 60 * 1000;
  return new Date(date.getTime() - timezoneOffsetMs).toISOString().slice(0, 10);
}

function getLocalTimeInputValue(date = new Date()) {
  return date.toTimeString().slice(0, 5);
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

function formatDateTime(value) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleString(undefined, {
    month: "short",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false
  });
}

function getAvailabilityLabel(room) {
  if (isRoomAvailable(room)) {
    return "Available for selected slot";
  }

  if (room?.booked_until) {
    return `Booked. Available after ${formatDateTime(room.booked_until)}`;
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

  const start = new Date(`${bookingDateInput.value}T${bookingTimeInput.value}`);
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
    if (bookingTimeInput.value && bookingTimeInput.value < minTime) {
      bookingTimeInput.value = minTime;
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

function openRoomModal(room) {
  if (!roomDetailModal || !room) return;

  selectedRoom = room;
  setRoomModalMessage("", "");
  roomDetailImage.src = getRoomImage(room);
  roomDetailTitle.textContent = room.name || "Meeting Room";
  roomDetailLocation.textContent = room.location_name || "Unknown location";
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

  openRoomModal(room);
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

  const token = localStorage.getItem("auth_token");
  if (!token) {
    setRoomModalMessage("Please sign in first to book a room.", "error");
    return;
  }

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
  if (Number.isFinite(startTimestamp) && startTimestamp < Date.now()) {
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
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify(payload)
  })
    .then(async response => {
      const data = await response.json();
      if (!response.ok) {
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
    if (event.key === "Escape" && !roomDetailModal.hidden) {
      closeRoomModal();
    }
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
  bookingTimeInput.value = `${hours}:${minutes}`;

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
  const heroSlides = document.querySelectorAll(".hero-slide");
  const slideshowDots = document.querySelectorAll(".slideshow-dot");

  if (heroSlides.length === 0 || slideshowDots.length === 0) {
    return;
  }

  let currentSlideIndex = 0;
  const autoPlayInterval = 5000; // 5 seconds

  function showSlide(index) {
    // Ensure index is within bounds
    currentSlideIndex = index % heroSlides.length;

    // Remove active class from all slides and dots
    heroSlides.forEach(slide => slide.classList.remove("active"));
    slideshowDots.forEach(dot => dot.classList.remove("active"));

    // Add active class to current slide and dot
    heroSlides[currentSlideIndex].classList.add("active");
    slideshowDots[currentSlideIndex].classList.add("active");
  }

  // Set up dot click handlers for manual navigation
  slideshowDots.forEach((dot, index) => {
    dot.addEventListener("click", () => {
      showSlide(index);
      // Reset auto-play timer
      clearInterval(autoPlayTimer);
      autoPlayTimer = setInterval(() => {
        showSlide(currentSlideIndex + 1);
      }, autoPlayInterval);
    });
  });

  // Auto-play timer
  let autoPlayTimer = setInterval(() => {
    showSlide(currentSlideIndex + 1);
  }, autoPlayInterval);
}

// Initialize slideshow when DOM is ready
document.addEventListener("DOMContentLoaded", initializeSlideshow);
// Also call if DOM is already loaded
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initializeSlideshow);
} else {
  initializeSlideshow();
}
