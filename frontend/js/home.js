const API_BASE_URL = window.APP_CONFIG?.API_BASE_URL || "http://localhost:4000/api";

const ROOM_IMAGES_BY_NAME = {
  "cell pod 1": "assets/cell_pod_1.png",
  "cell pod 2": "assets/cell_pod_2.png",
  hubble: "assets/hubble-2-persons.png",
  fusion: "assets/fussion-6-members.png",
  nexus: "assets/Nexus-2-persons.png",
  zenith: "assets/zenith-3-persons.png",
  synergy: "assets/synergy-4-members.png",
  tranquil: "assets/tranquil-5-members.png",
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
  drakensberg: "assets/fussion-6-members.png",
  "table mountain": "assets/fussion-6-members.png",
};

const ROOM_AMENITY_DEFINITIONS = Object.freeze([
  { key: "has_projector", label: "Projector", icon: "projector" },
  { key: "has_screen", label: "Display Screen", icon: "screen" },
  { key: "has_webcam", label: "Web Cam", icon: "camera" },
  { key: "has_video_conferencing", label: "Video Conference", icon: "video" },
  { key: "has_tv_set", label: "TV Set", icon: "tv" },
  { key: "has_wifi", label: "WiFi", icon: "wifi" },
  { key: "has_ac", label: "AC", icon: "air" },
  { key: "has_whiteboard", label: "Whiteboard", icon: "whiteboard" },
  { key: "has_power_backup", label: "Power Backup", icon: "battery" },
]);

const ROOM_AMENITY_ICON_MARKUP = Object.freeze({
  projector:
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M5 7 3 5"></path><path d="M9 6V3"></path><path d="m13 7 2-2"></path><circle cx="9" cy="13" r="3"></circle><path d="M11.83 12H20a2 2 0 0 1 2 2v4a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2v-4a2 2 0 0 1 2-2h2.17"></path><path d="M16 16h2"></path></svg>',
  screen:
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="12" rx="2"></rect><path d="M8 20h8"></path><path d="M12 16v4"></path></svg>',
  camera:
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M12 16a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z"></path><path d="M12 16v4"></path><path d="M9 20h6"></path><path d="M5 6h14"></path><path d="M7 6a5 5 0 0 1 10 0"></path></svg>',
  video:
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="7" width="13" height="10" rx="2"></rect><path d="m16 10 5-3v10l-5-3z"></path></svg>',
  tv:
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="m8 3 4 3 4-3"></path><rect x="3" y="6" width="18" height="12" rx="2"></rect><path d="M8 21h8"></path></svg>',
  wifi:
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20h.01"></path><path d="M2 8.82a15 15 0 0 1 20 0"></path><path d="M5 12.86a10 10 0 0 1 14 0"></path><path d="M8.5 16.43a5 5 0 0 1 7 0"></path></svg>',
  air:
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M18 17.5a2.5 2.5 0 1 1-4 2.03V12"></path><path d="M6 12H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"></path><path d="M6 8h12"></path><path d="M6.6 15.57A2 2 0 1 0 10 17v-5"></path></svg>',
  whiteboard:
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M2 3h20"></path><path d="M21 3v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V3"></path><path d="m7 21 5-5 5 5"></path></svg>',
  battery:
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="m11 7-3 5h4l-3 5"></path><path d="M14.86 6H16a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2h-2.94"></path><path d="M22 14v-4"></path><path d="M5.14 18H4a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h2.94"></path></svg>',
  default:
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="12" rx="2"></rect><path d="M8 20h8"></path><path d="M12 16v4"></path></svg>',
});

const ROOM_DETAIL_META_ICON_MARKUP = Object.freeze({
  location:
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><path d="M12 21s-6-4.35-6-10a6 6 0 1 1 12 0c0 5.65-6 10-6 10Z"></path><circle cx="12" cy="11" r="2.4"></circle></svg>',
  capacity:
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M22 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>',
  default:
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"></circle></svg>',
});

const FEATURED_ROOM_LIMIT = 9;
const HERO_SLIDE_DURATION_MS = 5000;
const LOCATION_MAP_PRESETS = {
  "south africa (head office)": { lat: -26.0596, lng: 28.0594, zoom: 14, shortLabel: "ZA" },
  "india headquarters": { lat: 21.1938, lng: 81.3509, zoom: 13, shortLabel: "IN" },
  "united kingdom (sales office)": { lat: 51.3864, lng: -1.0065, zoom: 13, shortLabel: "UK" },
  "delivery centre - hyderabad": { lat: 17.4215, lng: 78.3413, zoom: 14, shortLabel: "HYD" },
  "delivery centre - pune": { lat: 18.5157, lng: 73.9369, zoom: 14, shortLabel: "PUN" },
  "delivery centre - bhopal": { lat: 23.2494, lng: 77.4372, zoom: 13, shortLabel: "BHO" },
};

const featuredLocationFilter = document.getElementById("featured-location-filter");
const featuredRoomsGrid = document.getElementById("featured-rooms-grid");
const bookingMessage = document.getElementById("booking-message");
const themeToggleBtn = document.getElementById("themeToggleBtn");
const signInIllustrationVideo = document.getElementById("signInIllustrationVideo");
const officeMapPreview = document.getElementById("office-map-preview");
const locationMapModal = document.getElementById("location-map-modal");
const locationMapCanvas = document.getElementById("location-map-canvas");
const locationMapStatus = document.getElementById("location-map-status");
const locationMapSelectedMeta = document.getElementById("location-map-selected-meta");
const locationMapResetBtn = document.getElementById("location-map-reset-btn");
const locationMapFocusCard = document.getElementById("location-map-focus-card");
const locationMapFocusTitle = document.getElementById("location-map-focus-title");
const locationMapFocusAddress = document.getElementById("location-map-focus-address");
const locationMapFocusMeta = document.getElementById("location-map-focus-meta");
const locationRoomGrid = document.getElementById("location-room-grid");
const locationRoomPanelTitle = document.getElementById("location-room-panel-title");
const locationRoomPanelCopy = document.getElementById("location-room-panel-copy");
const roomDetailModal = document.getElementById("room-detail-modal");
const roomDetailImage = document.getElementById("room-detail-image");
const roomDetailTitle = document.getElementById("room-detail-title");
const roomDetailMeta = document.getElementById("room-detail-meta");
const roomDetailDescription = document.getElementById("room-detail-description");
const roomDetailAmenities = document.getElementById("room-detail-amenities");
const roomDetailPurpose = document.getElementById("room-detail-purpose");
const roomDetailSetup = document.getElementById("room-detail-setup");
const roomDetailComfort = document.getElementById("room-detail-comfort");

const THEME_STORAGE_KEY = "dashboard_theme_preference";
const THEME_LIGHT = "light";
const THEME_DARK = "dark";
const FOCUSABLE_SELECTOR = [
  "a[href]",
  "button:not([disabled])",
  "textarea:not([disabled])",
  "input:not([disabled]):not([type='hidden'])",
  "select:not([disabled])",
  "[tabindex]:not([tabindex='-1'])",
].join(", ");

let currentRooms = [];
let allRooms = [];
let allLocations = [];
let roomLookup = new Map();
let locationMapPoints = [];
let selectedMapLocationId = null;
let previewMap = null;
let modalMap = null;
let previewMarkers = [];
let modalMarkers = new Map();
let lastRoomModalTrigger = null;
let lastLocationMapTrigger = null;
let slideshowTimerId = null;
let isSlideshowInitialized = false;

function getStoredTheme() {
  const stored = localStorage.getItem(THEME_STORAGE_KEY);
  return stored === THEME_DARK || stored === THEME_LIGHT ? stored : null;
}

function getSystemTheme() {
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? THEME_DARK : THEME_LIGHT;
}

function getActiveTheme() {
  return document.body.classList.contains("theme-dark") ? THEME_DARK : THEME_LIGHT;
}

function setThemeToggleButtonState(theme) {
  if (!themeToggleBtn) return;
  const isDark = theme === THEME_DARK;
  themeToggleBtn.textContent = isDark ? "Light Mode" : "Dark Mode";
  themeToggleBtn.setAttribute("aria-pressed", String(isDark));
  themeToggleBtn.setAttribute("aria-label", isDark ? "Switch to light mode" : "Switch to dark mode");
}

function applyTheme(theme, { persist = true } = {}) {
  const resolvedTheme = theme === THEME_DARK ? THEME_DARK : THEME_LIGHT;
  const isDark = resolvedTheme === THEME_DARK;

  document.body.classList.toggle("theme-dark", isDark);
  document.body.dataset.theme = resolvedTheme;
  document.documentElement.style.colorScheme = resolvedTheme;
  setThemeToggleButtonState(resolvedTheme);

  if (persist) {
    localStorage.setItem(THEME_STORAGE_KEY, resolvedTheme);
  }
}

function initializeThemeToggle() {
  const initialTheme = getStoredTheme() || getSystemTheme();
  applyTheme(initialTheme, { persist: false });

  if (themeToggleBtn) {
    themeToggleBtn.addEventListener("click", () => {
      const nextTheme = getActiveTheme() === THEME_DARK ? THEME_LIGHT : THEME_DARK;
      applyTheme(nextTheme);
    });
  }

  const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
  const syncWithSystemTheme = event => {
    if (getStoredTheme()) return;
    applyTheme(event.matches ? THEME_DARK : THEME_LIGHT, { persist: false });
  };

  if (typeof mediaQuery.addEventListener === "function") {
    mediaQuery.addEventListener("change", syncWithSystemTheme);
  } else if (typeof mediaQuery.addListener === "function") {
    mediaQuery.addListener(syncWithSystemTheme);
  }
}

function initializeSignInIllustrationVideo() {
  if (!signInIllustrationVideo) return;

  signInIllustrationVideo.muted = true;
  signInIllustrationVideo.defaultMuted = true;

  const ensurePlayback = () => {
    const playPromise = signInIllustrationVideo.play();
    if (playPromise && typeof playPromise.catch === "function") {
      playPromise.catch(() => {});
    }
  };

  signInIllustrationVideo.addEventListener("loadeddata", ensurePlayback, { once: true });
  document.addEventListener("visibilitychange", () => {
    if (!document.hidden) {
      ensurePlayback();
    }
  });

  ensurePlayback();
}

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
    if (!desktopMediaQuery.matches) {
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
  return element instanceof HTMLElement && !element.hidden && element.getClientRects().length > 0;
}

function getModalFocusableElements(modalElement) {
  if (!modalElement) return [];
  return Array.from(modalElement.querySelectorAll(FOCUSABLE_SELECTOR))
    .filter(node => isVisibleElement(node) && node.getAttribute("aria-hidden") !== "true");
}

function focusFirstElementInModal(modalElement) {
  const focusableElements = getModalFocusableElements(modalElement);
  if (focusableElements[0]) {
    focusableElements[0].focus();
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

function setBookingMessage(message, type = "") {
  if (!bookingMessage) return;
  bookingMessage.textContent = message || "";
  bookingMessage.classList.remove("success", "error");
  if (type === "success" || type === "error") {
    bookingMessage.classList.add(type);
  }
}

function setLocationMapStatus(message, type = "") {
  if (!locationMapStatus) return;
  locationMapStatus.textContent = message || "";
  locationMapStatus.hidden = !message;
  locationMapStatus.classList.remove("is-loading", "is-error");
  if (type === "loading" || type === "error") {
    locationMapStatus.classList.add(`is-${type}`);
  }
}

function normalizeRoomName(roomName) {
  return String(roomName || "").trim().toLowerCase().replace(/\s+/g, " ");
}

function normalizeLocationName(locationName) {
  return String(locationName || "").trim().toLowerCase().replace(/\s+/g, " ");
}

function formatLocationAddress(address) {
  return String(address || "")
    .split(/\r?\n/)
    .map(line => line.trim())
    .filter(Boolean)
    .join(", ");
}

function fetchJson(url, fallbackMessage) {
  return fetch(url).then(async response => {
    const data = await response.json().catch(() => null);
    if (!response.ok) {
      throw new Error(data?.message || fallbackMessage);
    }
    return data;
  });
}

function getLocationShortLabel(locationName) {
  const normalizedName = normalizeLocationName(locationName);
  const preset = LOCATION_MAP_PRESETS[normalizedName];
  if (preset?.shortLabel) {
    return preset.shortLabel;
  }

  const tokens = normalizedName
    .split(" ")
    .filter(token => !["delivery", "centre", "sales", "office", "head", "headquarters"].includes(token));

  return tokens
    .slice(0, 3)
    .map(token => token.charAt(0).toUpperCase())
    .join("") || "LOC";
}

function buildLocationMapPoints(locations) {
  return (Array.isArray(locations) ? locations : []).map(location => {
    const normalizedName = normalizeLocationName(location.name);
    const preset = LOCATION_MAP_PRESETS[normalizedName] || null;

    return {
      ...location,
      lat: preset?.lat ?? null,
      lng: preset?.lng ?? null,
      zoom: preset?.zoom ?? 13,
      shortLabel: getLocationShortLabel(location.name),
    };
  });
}

function getLocationMapPoint(locationId) {
  return locationMapPoints.find(location => Number(location.location_id) === Number(locationId)) || null;
}

function hasMapCoordinates(locationPoint) {
  return Number.isFinite(Number(locationPoint?.lat)) && Number.isFinite(Number(locationPoint?.lng));
}

function getLocationLatLng(locationPoint) {
  return [Number(locationPoint.lat), Number(locationPoint.lng)];
}

function getRoomImage(room) {
  if (!room) {
    return "assets/image(3).png";
  }

  const normalizedRoomName = normalizeRoomName(room.name);
  return ROOM_IMAGES_BY_NAME[normalizedRoomName] || "assets/image(3).png";
}

function isAmenityEnabled(value) {
  return value === 1 || value === true || value === "1" || value === "true";
}

function getRoomAmenities(room) {
  return ROOM_AMENITY_DEFINITIONS.filter(amenity => isAmenityEnabled(room?.[amenity.key]));
}

function getFeatureText(room, { limit = null } = {}) {
  const features = getRoomAmenities(room).map(amenity => amenity.label);
  if (features.length === 0) {
    return "Standard setup";
  }

  const safeLimit = Number.isFinite(limit) ? Math.max(0, Math.floor(limit)) : 0;
  if (!safeLimit || features.length <= safeLimit) {
    return features.join(" | ");
  }

  return `${features.slice(0, safeLimit).join(" | ")} | +${features.length - safeLimit} more`;
}

function createAmenityIcon(iconKey) {
  const iconElement = document.createElement("span");
  iconElement.className = "room-amenity-icon";
  iconElement.setAttribute("aria-hidden", "true");
  iconElement.innerHTML = ROOM_AMENITY_ICON_MARKUP[iconKey] || ROOM_AMENITY_ICON_MARKUP.default;
  return iconElement;
}

function createRoomDetailMetaIcon(iconKey) {
  const iconElement = document.createElement("span");
  iconElement.className = "home-room-modal-detail-icon";
  iconElement.setAttribute("aria-hidden", "true");
  iconElement.innerHTML = ROOM_DETAIL_META_ICON_MARKUP[iconKey] || ROOM_DETAIL_META_ICON_MARKUP.default;
  return iconElement;
}

function renderRoomAmenities(container, room) {
  if (!container) return;

  container.replaceChildren();
  const amenities = getRoomAmenities(room);

  if (amenities.length === 0) {
    const emptyState = document.createElement("p");
    emptyState.className = "room-amenity-empty";
    emptyState.textContent = "Amenities have not been configured for this room yet.";
    container.appendChild(emptyState);
    return;
  }

  amenities.forEach(({ label, icon }) => {
    const item = document.createElement("div");
    item.className = "room-amenity-item";

    const labelElement = document.createElement("p");
    labelElement.className = "room-amenity-label";
    labelElement.textContent = label;

    item.append(createAmenityIcon(icon), labelElement);
    container.appendChild(item);
  });
}

function getRoomMetaText(room) {
  const location = room.location_name || "Unknown location";
  const capacity = `${room.capacity || 0} Seats`;
  return `${location} | ${capacity} | ${getFeatureText(room, { limit: 3 })}`;
}

function getRoomCapacityText(room) {
  const parsedCapacity = Number(room?.capacity);
  const seatCount = Number.isFinite(parsedCapacity) && parsedCapacity > 0 ? parsedCapacity : 0;
  return `${seatCount} ${seatCount === 1 ? "seat" : "seats"}`;
}

function getRoomPurposeText(room) {
  const normalizedRoomName = normalizeRoomName(room?.name);
  const capacity = Number(room?.capacity || 0);

  if (normalizedRoomName.includes("cell pod") || normalizedRoomName === "hubble" || capacity <= 1) {
    return "Private calls";
  }
  if (normalizedRoomName === "think tank") {
    return "Brainstorming";
  }
  if (normalizedRoomName === "training room") {
    return "Training sessions";
  }
  if (normalizedRoomName === "boardroom" || normalizedRoomName === "pinnacle") {
    return "Leadership reviews";
  }
  if (normalizedRoomName.startsWith("conference room")) {
    return "Client meetings";
  }
  if (normalizedRoomName === "innovation hub") {
    return "Presentations";
  }
  if (capacity <= 2) {
    return "1:1 huddles";
  }
  if (capacity <= 5) {
    return "Small team syncs";
  }
  if (capacity <= 10) {
    return "Planning sessions";
  }
  return "Team sessions";
}

function getRoomSetupText(room) {
  if (isAmenityEnabled(room?.has_video_conferencing) && (isAmenityEnabled(room?.has_tv_set) || isAmenityEnabled(room?.has_screen))) {
    return "VC-ready";
  }
  if (isAmenityEnabled(room?.has_projector) && isAmenityEnabled(room?.has_whiteboard)) {
    return "Workshop-ready";
  }
  if (isAmenityEnabled(room?.has_projector) || isAmenityEnabled(room?.has_screen) || isAmenityEnabled(room?.has_tv_set)) {
    return "Presentation-ready";
  }
  if (isAmenityEnabled(room?.has_whiteboard)) {
    return "Whiteboard setup";
  }
  return "Essential setup";
}

function getRoomComfortText(room) {
  if (isAmenityEnabled(room?.has_wifi) && isAmenityEnabled(room?.has_ac) && isAmenityEnabled(room?.has_power_backup)) {
    return "WiFi, AC, backup";
  }
  if (isAmenityEnabled(room?.has_wifi) && isAmenityEnabled(room?.has_ac)) {
    return "WiFi and AC";
  }
  if (isAmenityEnabled(room?.has_wifi)) {
    return "WiFi enabled";
  }
  return "Core essentials";
}

function renderRoomMediaSummary(room) {
  if (roomDetailPurpose) {
    roomDetailPurpose.textContent = getRoomPurposeText(room);
  }
  if (roomDetailSetup) {
    roomDetailSetup.textContent = getRoomSetupText(room);
  }
  if (roomDetailComfort) {
    roomDetailComfort.textContent = getRoomComfortText(room);
  }
}

function renderRoomDetailMeta(room) {
  if (!roomDetailMeta) return;

  const detailRows = [
    { label: "Location", value: room.location_name || "Unknown location", icon: "location" },
    { label: "Capacity", value: getRoomCapacityText(room), icon: "capacity" },
  ];

  roomDetailMeta.replaceChildren();

  detailRows.forEach(({ label, value, icon }) => {
    const row = document.createElement("div");
    row.className = "home-room-modal-detail";

    const copy = document.createElement("div");
    copy.className = "home-room-modal-detail-copy";

    const labelElement = document.createElement("span");
    labelElement.className = "home-room-modal-detail-label";
    labelElement.textContent = label;

    const valueElement = document.createElement("span");
    valueElement.className = "home-room-modal-detail-value";
    valueElement.textContent = value;

    copy.append(labelElement, valueElement);
    row.append(createRoomDetailMetaIcon(icon), copy);
    roomDetailMeta.appendChild(row);
  });
}

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

function syncRoomLookup(rooms) {
  roomLookup = new Map();
  (Array.isArray(rooms) ? rooms : []).forEach(room => {
    roomLookup.set(Number(room.room_id), room);
  });
}

function getFilteredFeaturedRooms() {
  const selectedLocationId = featuredLocationFilter?.value ? Number(featuredLocationFilter.value) : null;
  const sourceRooms = selectedLocationId
    ? allRooms.filter(room => Number(room.location_id) === selectedLocationId)
    : allRooms;

  return sourceRooms.slice(0, FEATURED_ROOM_LIMIT);
}

function renderFeaturedRooms() {
  if (!featuredRoomsGrid) return;

  currentRooms = getFilteredFeaturedRooms();
  renderRoomCollection(featuredRoomsGrid, currentRooms, {
    emptyTitle: "No featured rooms available right now.",
    emptyMeta: "Try another office location or reload the page.",
  });
}

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

function getLocationRooms(locationId) {
  return allRooms.filter(room => Number(room.location_id) === Number(locationId));
}

function updateLocationFocusCard(locationPoint, roomCount = 0) {
  if (!locationMapFocusCard) return;

  if (!locationPoint) {
    locationMapFocusCard.hidden = true;
    return;
  }

  locationMapFocusTitle.textContent = locationPoint.name || "Office";
  locationMapFocusAddress.textContent = formatLocationAddress(locationPoint.address) || "Address not available.";
  locationMapFocusMeta.textContent = `${roomCount} room${roomCount === 1 ? "" : "s"} | ${locationPoint.timezone || "UTC"}`;
  locationMapFocusCard.hidden = false;
}

function renderLocationRoomCards(locationPoint) {
  if (!locationPoint) {
    renderDefaultLocationRoomState();
    return;
  }

  const locationRooms = getLocationRooms(locationPoint.location_id);

  if (locationRoomPanelTitle) {
    locationRoomPanelTitle.textContent = `${locationPoint.name} Rooms`;
  }
  if (locationRoomPanelCopy) {
    locationRoomPanelCopy.textContent = `${locationRooms.length} room${locationRooms.length === 1 ? "" : "s"} available at this office.`;
  }

  renderRoomCollection(locationRoomGrid, locationRooms, {
    emptyTitle: "No rooms found for this office.",
    emptyMeta: "This location is available on the map but has no room records yet.",
  });

  updateLocationFocusCard(locationPoint, locationRooms.length);

  if (locationMapSelectedMeta) {
    locationMapSelectedMeta.textContent = `${locationRooms.length} room${locationRooms.length === 1 ? "" : "s"} available at ${locationPoint.name}`;
  }
}

function ensureLeafletLoaded() {
  return typeof window.L !== "undefined";
}

function createLocationMarkerIcon(locationPoint, isActive = false, { compact = false } = {}) {
  if (!ensureLeafletLoaded()) return null;

  const activeClass = isActive ? " is-active" : "";
  const compactClass = compact ? " is-preview" : "";

  return L.divIcon({
    className: `leaflet-office-marker-shell${compactClass}`,
    html:
      `<span class="leaflet-office-marker${activeClass}${compactClass}">` +
      `<span class="leaflet-office-marker-label">${locationPoint.shortLabel}</span>` +
      `<span class="leaflet-office-marker-pin">` +
      `<span class="leaflet-office-marker-dot"></span>` +
      `<span class="leaflet-office-marker-stem"></span>` +
      `</span>` +
      `</span>`,
    iconSize: compact ? [64, 54] : [82, 72],
    iconAnchor: compact ? [32, 54] : [41, 72],
    popupAnchor: compact ? [0, -40] : [0, -58],
  });
}

function createLocationPopupContent(locationPoint) {
  const rooms = getLocationRooms(locationPoint.location_id);
  return (
    `<div class="leaflet-office-popup">` +
    `<strong>${locationPoint.name || "Office"}</strong>` +
    `<span>${rooms.length} room${rooms.length === 1 ? "" : "s"} | ${locationPoint.timezone || "UTC"}</span>` +
    `</div>`
  );
}

function clearPreviewMarkers() {
  previewMarkers.forEach(marker => marker.remove());
  previewMarkers = [];
}

function clearModalMarkers() {
  modalMarkers.forEach(marker => marker.remove());
  modalMarkers.clear();
}

function fitMapToLocationPoints(
  mapInstance,
  {
    maxZoom = 4,
    padding = [40, 40],
    paddingTopLeft = null,
    paddingBottomRight = null,
  } = {}
) {
  if (!mapInstance || !ensureLeafletLoaded()) return;

  const points = locationMapPoints.filter(hasMapCoordinates);
  if (points.length === 0) return;

  const bounds = L.latLngBounds(points.map(getLocationLatLng));
  mapInstance.fitBounds(bounds, {
    padding,
    paddingTopLeft,
    paddingBottomRight,
    maxZoom,
  });
}

function focusMapLocation(mapInstance, locationPoint, { animate = true } = {}) {
  if (!mapInstance || !locationPoint || !hasMapCoordinates(locationPoint)) return;

  const latLng = getLocationLatLng(locationPoint);
  const zoomLevel = Number(locationPoint.zoom) || 13;

  if (animate && typeof mapInstance.flyTo === "function") {
    mapInstance.flyTo(latLng, zoomLevel, { duration: 0.8 });
  } else {
    mapInstance.setView(latLng, zoomLevel);
  }
}

function refreshPreviewMarkers() {
  if (!previewMap || !ensureLeafletLoaded()) return;

  clearPreviewMarkers();

  locationMapPoints
    .filter(hasMapCoordinates)
    .forEach(locationPoint => {
      const marker = L.marker(getLocationLatLng(locationPoint), {
        icon: createLocationMarkerIcon(
          locationPoint,
          Number(selectedMapLocationId) === Number(locationPoint.location_id),
          { compact: true }
        ),
        keyboard: false,
      });

      marker.on("click", () => {
        openLocationMapModal(officeMapPreview);
      });

      marker.addTo(previewMap);
      previewMarkers.push(marker);
    });
}

function refreshModalMarkers() {
  if (!modalMap || !ensureLeafletLoaded()) return;

  clearModalMarkers();

  locationMapPoints
    .filter(hasMapCoordinates)
    .forEach(locationPoint => {
      const isActive = Number(selectedMapLocationId) === Number(locationPoint.location_id);
      const marker = L.marker(getLocationLatLng(locationPoint), {
        icon: createLocationMarkerIcon(locationPoint, isActive),
      });

      marker.bindPopup(createLocationPopupContent(locationPoint), {
        closeButton: false,
        offset: [0, -34],
      });

      marker.on("click", () => {
        selectMapLocation(Number(locationPoint.location_id), {
          syncFeaturedFilter: true,
          focusMap: true,
          openPopup: true,
        });
      });

      marker.addTo(modalMap);
      modalMarkers.set(Number(locationPoint.location_id), marker);
    });
}

function initializePreviewMap() {
  if (!officeMapPreview || previewMap || !ensureLeafletLoaded()) return;

  previewMap = L.map(officeMapPreview, {
    attributionControl: false,
    boxZoom: false,
    doubleClickZoom: false,
    dragging: true,
    keyboard: false,
    scrollWheelZoom: true,
    tap: false,
    touchZoom: false,
    zoomControl: false,
  });

  L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
    maxZoom: 19,
  }).addTo(previewMap);

  previewMap.on("click", () => {
    openLocationMapModal(officeMapPreview);
  });

  refreshPreviewMarkers();
  fitMapToLocationPoints(previewMap, {
    maxZoom: 3,
    paddingTopLeft: [24, 72],
    paddingBottomRight: [24, 20],
  });
}

function initializeModalMap() {
  if (!locationMapCanvas || modalMap || !ensureLeafletLoaded()) return;

  modalMap = L.map(locationMapCanvas, {
    zoomControl: true,
  });

  L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
    maxZoom: 19,
 
  }).addTo(modalMap);

  refreshModalMarkers();
  fitMapToLocationPoints(modalMap, { maxZoom: 4 });
}

function refreshAllMapMarkers() {
  refreshPreviewMarkers();
  refreshModalMarkers();
}

function resetLocationMapSelection({ preserveFeaturedFilter = true } = {}) {
  selectedMapLocationId = null;
  updateLocationFocusCard(null);
  renderDefaultLocationRoomState();
  refreshAllMapMarkers();

  if (locationMapSelectedMeta) {
    locationMapSelectedMeta.textContent = `${locationMapPoints.length} office locations available`;
  }

  if (!preserveFeaturedFilter && featuredLocationFilter) {
    featuredLocationFilter.value = "";
    renderFeaturedRooms();
  }

  if (!locationMapModal?.hidden && modalMap) {
    fitMapToLocationPoints(modalMap, { maxZoom: 4 });
  }
}

function selectMapLocation(
  locationId,
  { syncFeaturedFilter = true, focusMap = true, openPopup = false } = {}
) {
  const locationPoint = getLocationMapPoint(locationId);
  if (!locationPoint) return;

  selectedMapLocationId = Number(locationPoint.location_id);
  renderLocationRoomCards(locationPoint);
  refreshAllMapMarkers();

  if (syncFeaturedFilter && featuredLocationFilter) {
    featuredLocationFilter.value = String(locationPoint.location_id);
    renderFeaturedRooms();
  }

  if (!locationMapModal?.hidden && modalMap && focusMap) {
    focusMapLocation(modalMap, locationPoint);

    if (openPopup) {
      const marker = modalMarkers.get(Number(locationPoint.location_id));
      if (marker) {
        marker.openPopup();
      }
    }
  }
}

function openLocationMapModal(triggerElement = null) {
  if (!locationMapModal) return;

  lastLocationMapTrigger =
    triggerElement instanceof HTMLElement
      ? triggerElement
      : document.activeElement instanceof HTMLElement
        ? document.activeElement
        : null;

  locationMapModal.hidden = false;
  focusFirstElementInModal(locationMapModal);

  if (!ensureLeafletLoaded()) {
    setLocationMapStatus("Leaflet failed to load for the office map.", "error");
    return;
  }

  initializeModalMap();
  setLocationMapStatus("");

  window.requestAnimationFrame(() => {
    if (!modalMap) return;

    modalMap.invalidateSize();

    if (selectedMapLocationId) {
      const locationPoint = getLocationMapPoint(selectedMapLocationId);
      if (locationPoint) {
        focusMapLocation(modalMap, locationPoint, { animate: false });
        const marker = modalMarkers.get(Number(locationPoint.location_id));
        if (marker) {
          marker.openPopup();
        }
        return;
      }
    }

    fitMapToLocationPoints(modalMap, { maxZoom: 4 });
  });
}

function closeLocationMapModal() {
  if (!locationMapModal) return;

  locationMapModal.hidden = true;

  if (lastLocationMapTrigger && lastLocationMapTrigger.isConnected) {
    lastLocationMapTrigger.focus();
  }

  lastLocationMapTrigger = null;
}

function openRoomModal(room, triggerElement = null) {
  if (!roomDetailModal || !room) return;

  lastRoomModalTrigger =
    triggerElement instanceof HTMLElement
      ? triggerElement
      : document.activeElement instanceof HTMLElement
        ? document.activeElement
        : null;

  roomDetailImage.src = getRoomImage(room);
  roomDetailTitle.textContent = room.name || "Meeting Room";
  renderRoomDetailMeta(room);
  renderRoomMediaSummary(room);
  roomDetailDescription.textContent = room.description || "No description available.";
  renderRoomAmenities(roomDetailAmenities, room);
  roomDetailModal.hidden = false;
  focusFirstElementInModal(roomDetailModal);
}

function closeRoomModal() {
  if (!roomDetailModal) return;

  roomDetailModal.hidden = true;

  if (lastRoomModalTrigger && lastRoomModalTrigger.isConnected) {
    lastRoomModalTrigger.focus();
  }

  lastRoomModalTrigger = null;
}

function getTopOpenModal() {
  const openModals = [locationMapModal, roomDetailModal].filter(modal => modal && !modal.hidden);
  return openModals.length > 0 ? openModals[openModals.length - 1] : null;
}

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

function loadLocations() {
  return fetchJson(`${API_BASE_URL}/locations`, "Unable to load locations.")
    .then(locations => {
      allLocations = Array.isArray(locations) ? locations : [];
      locationMapPoints = buildLocationMapPoints(allLocations);
      fillLocationOptions(featuredLocationFilter, allLocations);

      if (ensureLeafletLoaded()) {
        initializePreviewMap();
        refreshAllMapMarkers();
        if (previewMap) {
          fitMapToLocationPoints(previewMap, {
            maxZoom: 3,
            paddingTopLeft: [24, 72],
            paddingBottomRight: [24, 20],
          });
        }
      }

      if (selectedMapLocationId) {
        selectMapLocation(selectedMapLocationId, { syncFeaturedFilter: false, focusMap: false });
      } else {
        resetLocationMapSelection();
      }
    })
    .catch(error => {
      console.error("Error loading locations:", error);
      setBookingMessage("Failed to load locations.", "error");
      setLocationMapStatus("Failed to load office locations.", "error");
    });
}

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

function loadHomeData() {
  renderDefaultLocationRoomState();

  if (!ensureLeafletLoaded()) {
    setLocationMapStatus("Leaflet failed to load for the office map.", "error");
  }

  return Promise.all([loadLocations(), loadAllRooms()]);
}

if (featuredLocationFilter) {
  featuredLocationFilter.addEventListener("change", () => {
    renderFeaturedRooms();

    if (featuredLocationFilter.value) {
      selectMapLocation(Number(featuredLocationFilter.value), {
        syncFeaturedFilter: false,
        focusMap: Boolean(locationMapModal && !locationMapModal.hidden),
        openPopup: Boolean(locationMapModal && !locationMapModal.hidden),
      });
    } else {
      resetLocationMapSelection();
    }
  });
}

if (featuredRoomsGrid) {
  featuredRoomsGrid.addEventListener("click", handleRoomCardClick);
}

if (locationRoomGrid) {
  locationRoomGrid.addEventListener("click", handleRoomCardClick);
}

if (officeMapPreview) {
  officeMapPreview.addEventListener("click", () => {
    if (!previewMap) {
      openLocationMapModal(officeMapPreview);
    }
  });

  officeMapPreview.addEventListener("keydown", event => {
    if (event.key !== "Enter" && event.key !== " ") return;
    event.preventDefault();
    openLocationMapModal(officeMapPreview);
  });
}

if (locationMapResetBtn) {
  locationMapResetBtn.addEventListener("click", () => {
    resetLocationMapSelection({ preserveFeaturedFilter: false });
  });
}

if (locationMapModal) {
  locationMapModal.addEventListener("click", event => {
    if (event.target.matches("[data-close-location-map]")) {
      closeLocationMapModal();
    }
  });
}

if (roomDetailModal) {
  roomDetailModal.addEventListener("click", event => {
    if (event.target.matches("[data-close-modal]")) {
      closeRoomModal();
    }
  });
}

document.addEventListener("keydown", event => {
  const activeModal = getTopOpenModal();
  if (!activeModal) return;

  if (event.key === "Escape") {
    if (activeModal === roomDetailModal) {
      closeRoomModal();
    } else if (activeModal === locationMapModal) {
      closeLocationMapModal();
    }
    return;
  }

  trapModalFocus(activeModal, event);
});

window.addEventListener("resize", () => {
  if (previewMap) {
    previewMap.invalidateSize();
    fitMapToLocationPoints(previewMap, {
      maxZoom: 3,
      paddingTopLeft: [24, 72],
      paddingBottomRight: [24, 20],
    });
  }

  if (!locationMapModal?.hidden && modalMap) {
    modalMap.invalidateSize();

    if (selectedMapLocationId) {
      const locationPoint = getLocationMapPoint(selectedMapLocationId);
      if (locationPoint) {
        focusMapLocation(modalMap, locationPoint, { animate: false });
      }
    } else {
      fitMapToLocationPoints(modalMap, { maxZoom: 4 });
    }
  }
});

initializeThemeToggle();
initializeSignInIllustrationVideo();
loadHomeData();

function initializeSlideshow() {
  if (isSlideshowInitialized) {
    return;
  }

  const heroSlides = Array.from(document.querySelectorAll(".hero-slide"));
  const slideshowDots = document.querySelectorAll(".slideshow-dot");

  if (heroSlides.length === 0) {
    return;
  }

  isSlideshowInitialized = true;
  let currentSlideIndex = 0;
  const autoPlayInterval = HERO_SLIDE_DURATION_MS;
  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  heroSlides.forEach(slide => {
    if (!(slide instanceof HTMLVideoElement)) {
      return;
    }

    const syncDuration = () => {
      if (!Number.isFinite(slide.duration) || slide.duration <= 0) {
        return;
      }

      const playbackRate = slide.duration / (HERO_SLIDE_DURATION_MS / 1000);
      slide.defaultPlaybackRate = playbackRate;
      slide.playbackRate = playbackRate;
    };

    if (slide.readyState >= 1) {
      syncDuration();
    }

    slide.addEventListener("loadedmetadata", syncDuration, { once: true });
  });
  const syncSlidePlayback = activeIndex => {
    heroSlides.forEach((slide, index) => {
      if (!(slide instanceof HTMLVideoElement)) {
        return;
      }

      if (index === activeIndex) {
        slide.currentTime = 0;
        const playPromise = slide.play();
        if (playPromise && typeof playPromise.catch === "function") {
          playPromise.catch(() => {});
        }
        return;
      }

      slide.pause();
      slide.currentTime = 0;
    });
  };

  function showSlide(index) {
    currentSlideIndex = (index + heroSlides.length) % heroSlides.length;
    heroSlides.forEach(slide => slide.classList.remove("active"));
    slideshowDots.forEach(dot => dot.classList.remove("active"));
    heroSlides[currentSlideIndex].classList.add("active");
    syncSlidePlayback(currentSlideIndex);

    if (slideshowDots[currentSlideIndex]) {
      slideshowDots[currentSlideIndex].classList.add("active");
    }
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

  if (slideshowDots.length > 0) {
    slideshowDots.forEach((dot, index) => {
      dot.addEventListener("click", () => {
        showSlide(index);
        startAutoPlay();
      });
    });
  }

  document.addEventListener("visibilitychange", () => {
    if (document.hidden) {
      stopAutoPlay();
      heroSlides.forEach(slide => {
        if (slide instanceof HTMLVideoElement) {
          slide.pause();
        }
      });
    } else {
      syncSlidePlayback(currentSlideIndex);
      startAutoPlay();
    }
  });

  window.addEventListener("beforeunload", stopAutoPlay, { once: true });
  showSlide(0);
  startAutoPlay();
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", () => {
    initializeSlideshow();
    initializeStickyAuthCardState();
  });
} else {
  initializeSlideshow();
  initializeStickyAuthCardState();
}
