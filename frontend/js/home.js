const API_BASE_URL = "http://localhost:4000/api";

const ROOM_IMAGES_BY_NAME = {
  "think tank": "assets/think_tank.png",
  fusion: "assets/fussion.png",
  nexus: "assets/Nexus.png",
  "cell pod 1": "assets/cell_pod_1.png",
  "cell pod 2": "assets/cell_pod_2.png",
  "innovation hub": "assets/Innovation_Hub.png",
  boardroom: "assets/Conference_Room_A.png",
  "conference room a": "assets/Conference_Room_A.png",
  "conference room b": "assets/Conference_Room_B.png",
  "training room": "assets/training_room.png"
};

const roomSearchForm = document.getElementById("room-search-form");
const bookingDateInput = document.getElementById("booking-date");
const bookingTimeInput = document.getElementById("booking-time");
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
const roomDetailDescription = document.getElementById("room-detail-description");
const modalBookButton = document.getElementById("modal-book-btn");

let currentRooms = [];
let selectedRoom = null;

function setBookingMessage(message, type) {
  if (!bookingMessage) return;

  bookingMessage.textContent = message || "";
  bookingMessage.classList.remove("success", "error");

  if (type === "success" || type === "error") {
    bookingMessage.classList.add(type);
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
    return "assets/image(1).png";
  }

  const normalizedRoomName = normalizeRoomName(room.name);
  return ROOM_IMAGES_BY_NAME[normalizedRoomName] || "assets/image(1).png";
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

    const button = document.createElement("button");
    button.className = "btn btn-primary";
    button.type = "button";
    button.textContent = "View Details";
    button.dataset.roomId = String(room.room_id);

    body.appendChild(title);
    body.appendChild(meta);
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

  const end = new Date(start.getTime() + 60 * 60 * 1000);

  return {
    start: start.toISOString(),
    end: end.toISOString()
  };
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
  roomDetailImage.src = getRoomImage(room);
  roomDetailTitle.textContent = room.name || "Meeting Room";
  roomDetailLocation.textContent = room.location_name || "Unknown location";
  roomDetailMeta.textContent = getRoomMetaText(room);
  roomDetailDescription.textContent = room.description || "No description available.";

  roomDetailModal.hidden = false;
}

function closeRoomModal() {
  if (!roomDetailModal) return;
  roomDetailModal.hidden = true;
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
  setBookingMessage("", "");

  const token = localStorage.getItem("auth_token");
  if (!token) {
    setBookingMessage("Please sign in first to book a room.", "error");
    return;
  }

  if (!selectedRoom) {
    setBookingMessage("Select a room before booking.", "error");
    return;
  }

  const windowValue = getSearchStartAndEnd();
  if (!windowValue) {
    setBookingMessage("Choose booking date and time first.", "error");
    return;
  }

  const employee = getStoredEmployee();
  const payload = {
    room_id: selectedRoom.room_id,
    title: `Meeting in ${selectedRoom.name || "Room"}`,
    start_time: windowValue.start,
    end_time: windowValue.end
  };

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
      setBookingMessage(error.message || "Booking failed.", "error");
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
}

if (bookingLocationSelect && featuredLocationFilter && roomsGrid) {
  initializeSearchDefaults();
  loadLocations();
  loadFeaturedRooms();
}
