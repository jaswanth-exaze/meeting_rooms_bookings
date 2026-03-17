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
  return String(roomName || "").trim().toLowerCase().replace(/\\s+/g, " ");
}

function normalizeLocationName(locationName) {
  return String(locationName || "").trim().toLowerCase().replace(/\\s+/g, " ");
}

function formatLocationAddress(address) {
  return String(address || "")
    .split(/\\r?\\n/)
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

function getRoomImage(room) {
  if (!room) {
    return "assets/images/image(3).png";
  }

  const normalizedRoomName = normalizeRoomName(room.name);
  return ROOM_IMAGES_BY_NAME[normalizedRoomName] || "assets/images/image(3).png";
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
    { label: "Capacity", value: getRoomCapacityText(room), icon: "capacity" }
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
