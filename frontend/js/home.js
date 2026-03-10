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

const featuredLocationFilter = document.getElementById("featured-location-filter");
const roomsGrid = document.querySelector(".rooms-grid");
const bookingMessage = document.getElementById("booking-message");
const themeToggleBtn = document.getElementById("themeToggleBtn");

const roomDetailModal = document.getElementById("room-detail-modal");
const roomDetailImage = document.getElementById("room-detail-image");
const roomDetailTitle = document.getElementById("room-detail-title");
const roomDetailMeta = document.getElementById("room-detail-meta");
const roomDetailDescription = document.getElementById("room-detail-description");

let currentRooms = [];
const THEME_STORAGE_KEY = "dashboard_theme_preference";
const THEME_LIGHT = "light";
const THEME_DARK = "dark";
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

function getStoredTheme() {
  const stored = localStorage.getItem(THEME_STORAGE_KEY);
  if (stored === THEME_DARK || stored === THEME_LIGHT) {
    return stored;
  }
  return null;
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
    renderLoadingCard("No featured rooms available right now.");
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
      fillLocationOptions(featuredLocationFilter, locations);
    })
    .catch(error => {
      console.error("Error loading locations:", error);
      setBookingMessage("Failed to load locations.", "error");
    });
}

function loadFeaturedRooms() {
  if (!roomsGrid) return;

  setBookingMessage("", "");
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
  roomDetailMeta.textContent = getRoomMetaText(room);
  roomDetailDescription.textContent = room.description || "No description available.";

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

initializeThemeToggle();

if (featuredLocationFilter) {
  loadLocations();
}

if (roomsGrid) {
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
