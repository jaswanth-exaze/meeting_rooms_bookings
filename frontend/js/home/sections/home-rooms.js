// Load, filter, and render home page room collections.

let currentRooms = [];
let allRooms = [];
let roomLookup = new Map();
let selectedMapLocationId = null;

// Render room state.
function renderRoomState(container, titleText, metaText = "") {
  if (!container) return;

  container.innerHTML = "";
  const card = document.createElement("article");
  card.className = "room-card room-loading";

  const body = document.createElement("div");
  body.className = "room-body";

  const title = document.createElement("h3");
  title.className = "room-title";
  title.textContent = titleText;
  body.appendChild(title);

  if (metaText) {
    const meta = document.createElement("p");
    meta.className = "room-meta";
    meta.textContent = metaText;
    body.appendChild(meta);
  }

  card.appendChild(body);
  container.appendChild(card);
}

// Create room card.
function createRoomCard(room) {
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

  return card;
}

// Render room collection.
function renderRoomCollection(container, rooms, { emptyTitle, emptyMeta = "" } = {}) {
  if (!container) return;

  container.innerHTML = "";
  const roomList = Array.isArray(rooms) ? rooms : [];

  if (roomList.length === 0) {
    renderRoomState(container, emptyTitle, emptyMeta);
    return;
  }

  roomList.forEach(room => {
    container.appendChild(createRoomCard(room));
  });
}

// Fill location options.
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

// Sync room lookup.
function syncRoomLookup(rooms) {
  roomLookup = new Map();
  (Array.isArray(rooms) ? rooms : []).forEach(room => {
    roomLookup.set(Number(room.room_id), room);
  });
}

// Return filtered featured rooms.
function getFilteredFeaturedRooms() {
  const selectedLocationId = featuredLocationFilter?.value ? Number(featuredLocationFilter.value) : null;
  const sourceRooms = selectedLocationId
    ? allRooms.filter(room => Number(room.location_id) === selectedLocationId)
    : allRooms;

  return sourceRooms.slice(0, FEATURED_ROOM_LIMIT);
}

// Render featured rooms.
function renderFeaturedRooms() {
  if (!featuredRoomsGrid) return;

  currentRooms = getFilteredFeaturedRooms();
  renderRoomCollection(featuredRoomsGrid, currentRooms, {
    emptyTitle: "No featured rooms available right now.",
    emptyMeta: "Try another office location or reload the page."
  });
}

// Render default location room state.
function renderDefaultLocationRoomState() {
  if (locationRoomPanelTitle) {
    locationRoomPanelTitle.textContent = "Choose a location marker";
  }
  if (locationRoomPanelCopy) {
    locationRoomPanelCopy.textContent = "The room cards for the selected office will appear here.";
  }

  renderRoomState(
    locationRoomGrid,
    "Select a location",
    "Click any marker on the map to load room cards for that office."
  );
}

// Return location rooms.
function getLocationRooms(locationId) {
  return allRooms.filter(room => Number(room.location_id) === Number(locationId));
}

// Handle room card click.
function handleRoomCardClick(event) {
  const button = event.target.closest("button[data-room-id]");
  if (!button) return;

  const roomId = Number(button.dataset.roomId);
  const room = roomLookup.get(roomId) || currentRooms.find(item => Number(item.room_id) === roomId);

  if (!room) {
    setBookingMessage("Room details not found.", "error");
    return;
  }

  openRoomModal(room, button);
}

// Load all rooms.
function loadAllRooms() {
  if (featuredRoomsGrid) {
    setBookingMessage("");
    renderRoomState(featuredRoomsGrid, "Loading featured rooms...", "Fetching high-quality room previews.");
  }

  return fetchJson(`${API_BASE_URL}/rooms`, "Unable to load rooms.")
    .then(rooms => {
      allRooms = Array.isArray(rooms) ? rooms : [];
      syncRoomLookup(allRooms);
      renderFeaturedRooms();
      refreshAllMapMarkers();

      if (selectedMapLocationId) {
        selectMapLocation(selectedMapLocationId, { syncFeaturedFilter: false, focusMap: false });
      }
    })
    .catch(error => {
      console.error("Error loading featured rooms:", error);
      renderRoomState(featuredRoomsGrid, "Unable to load featured rooms.", "The API did not return room data.");
      setBookingMessage("Failed to load featured rooms.", "error");

      if (selectedMapLocationId) {
        renderRoomState(locationRoomGrid, "Unable to load rooms.", "Room cards could not be loaded for this location.");
      }
    });
}

if (featuredRoomsGrid) {
  featuredRoomsGrid.addEventListener("click", handleRoomCardClick);
}

if (locationRoomGrid) {
  locationRoomGrid.addEventListener("click", handleRoomCardClick);
}
