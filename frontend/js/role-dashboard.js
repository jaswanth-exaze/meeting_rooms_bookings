const API_BASE_URL = "http://localhost:4000/api";

const ROOM_IMAGES_BY_NAME = {
  
  "cell pod 1": "../assets/cell_pod_1.png",
  "cell pod 2": "../assets/cell_pod_2.png",
  hubble:"../assets/hubble-2-persons.png",
  fusion: "../assets/fussion-6-members.png",
  synergy: "../assets/synergy-4-members.png",
  nexus: "../assets/Nexus-2-persons.png",
  zenith: "../assets/zenith-3-persons.png",
  "tranquil": "../assets/tranquil-5-members.png",
  "think tank": "../assets/think_tank.png",
  "innovation hub": "../assets/Innovation_Hub.png",
  boardroom: "../assets/boardroom-15-members.png",
  pinnacle: "../assets/pinnacle-15-members.png",
  "conference room a": "../assets/Conference_Room_A.png",
  "conference room b": "../assets/Conference_Room_B.png",
  "training room": "../assets/training_room.png"
};
const MALE_PROFILE_IMAGE = "../assets/male_profile.png";
const FEMALE_PROFILE_IMAGE = "../assets/female_profile.png";

const token = localStorage.getItem("auth_token");
if (!token) {
  window.location.href = "../home.html";
}

function getStoredEmployee() {
  const raw = localStorage.getItem("auth_employee");
  if (!raw) return null;

  try {
    return JSON.parse(raw);
  } catch (_error) {
    return null;
  }
}

const currentEmployee = getStoredEmployee();
const currentEmployeeId = Number(currentEmployee?.employee_id || 0);
const currentRole = document.body.dataset.role || "employee";
const isAdmin = currentEmployee?.is_admin === true;

if (currentRole === "admin" && !isAdmin) {
  window.location.href = "./employee-dashboard.html";
}

if (currentRole === "employee" && isAdmin) {
  window.location.href = "./admin-dashboard.html";
}

let finderRoomsById = new Map();
let availabilityRoomsById = new Map();
let bookingsById = new Map();
let selectedRoom = null;
let selectedBookingWindow = null;
let availabilityWindow = null;
let selectedBooking = null;
const paginationState = {
  bookings: { rows: [], page: 1, pageSize: 8 },
  roomFinder: { rows: [], page: 1, pageSize: 8 },
  employees: { rows: [], page: 1, pageSize: 8 },
  reportLocations: { rows: [], page: 1, pageSize: 6 },
  reportUpcoming: { rows: [], page: 1, pageSize: 6 }
};

function normalizeGender(value) {
  const normalized = String(value || "")
    .trim()
    .toLowerCase();
  if (normalized === "female") return "female";
  return "male";
}

function getProfileImagePath(gender) {
  return normalizeGender(gender) === "female" ? FEMALE_PROFILE_IMAGE : MALE_PROFILE_IMAGE;
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function getPaginationConfig(key) {
  return paginationState[key] || null;
}

function setPaginationRows(key, rows) {
  const config = getPaginationConfig(key);
  if (!config) return;
  config.rows = Array.isArray(rows) ? rows : [];
  config.page = 1;
}

function getPaginationTotalPages(key) {
  const config = getPaginationConfig(key);
  if (!config) return 1;
  return Math.max(1, Math.ceil(config.rows.length / config.pageSize));
}

function getPaginationSlice(key) {
  const config = getPaginationConfig(key);
  if (!config) return [];

  const totalPages = getPaginationTotalPages(key);
  config.page = clamp(config.page, 1, totalPages);

  const start = (config.page - 1) * config.pageSize;
  const end = start + config.pageSize;
  return config.rows.slice(start, end);
}

function renderPaginationControls(containerId, key) {
  const container = document.getElementById(containerId);
  const config = getPaginationConfig(key);
  if (!container || !config) return;

  const totalRows = config.rows.length;
  const totalPages = getPaginationTotalPages(key);
  config.page = clamp(config.page, 1, totalPages);

  if (totalRows === 0 || totalPages <= 1) {
    container.innerHTML = "";
    return;
  }

  const windowSize = 5;
  let startPage = Math.max(1, config.page - Math.floor(windowSize / 2));
  let endPage = startPage + windowSize - 1;
  if (endPage > totalPages) {
    endPage = totalPages;
    startPage = Math.max(1, endPage - windowSize + 1);
  }

  const pageButtons = [];
  for (let page = startPage; page <= endPage; page += 1) {
    pageButtons.push(`
      <button
        type="button"
        class="pagination-btn ${page === config.page ? "active" : ""}"
        data-pagination-key="${key}"
        data-pagination-page="${page}"
      >
        ${page}
      </button>
    `);
  }

  const from = (config.page - 1) * config.pageSize + 1;
  const to = Math.min(config.page * config.pageSize, totalRows);

  container.innerHTML = `
    <span class="pagination-meta">Showing ${from}-${to} of ${totalRows}</span>
    <button
      type="button"
      class="pagination-btn"
      data-pagination-key="${key}"
      data-pagination-page="${config.page - 1}"
      ${config.page === 1 ? "disabled" : ""}
    >
      Prev
    </button>
    ${pageButtons.join("")}
    <button
      type="button"
      class="pagination-btn"
      data-pagination-key="${key}"
      data-pagination-page="${config.page + 1}"
      ${config.page === totalPages ? "disabled" : ""}
    >
      Next
    </button>
  `;
}

function getLocalDateInputValue(date = new Date()) {
  const timezoneOffsetMs = date.getTimezoneOffset() * 60 * 1000;
  return new Date(date.getTime() - timezoneOffsetMs).toISOString().slice(0, 10);
}

function getLocalTimeInputValue(date = new Date()) {
  return date.toTimeString().slice(0, 5);
}

function formatDate(value) {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";
  return date.toLocaleDateString(undefined, {
    month: "short",
    day: "2-digit",
    year: "numeric"
  });
}

function formatTime(value) {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";
  return date.toLocaleTimeString(undefined, {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false
  });
}

function formatDateTime(value) {
  if (!value) return "-";
  return `${formatDate(value)} ${formatTime(value)}`;
}

function getDurationMinutes(value, fallback = 60) {
  const parsed = Number.parseInt(value, 10);
  if (!Number.isFinite(parsed) || parsed <= 0) return fallback;
  return parsed;
}

function parseDateValue(value) {
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return null;
  return parsed;
}

function toLocalDateInputValue(value) {
  const parsed = parseDateValue(value);
  if (!parsed) return "";
  const timezoneOffsetMs = parsed.getTimezoneOffset() * 60 * 1000;
  return new Date(parsed.getTime() - timezoneOffsetMs).toISOString().slice(0, 10);
}

function toLocalTimeInputValue(value) {
  const parsed = parseDateValue(value);
  if (!parsed) return "";
  return parsed.toTimeString().slice(0, 5);
}

function getMinutesBetween(startValue, endValue, fallback = 60) {
  const start = parseDateValue(startValue);
  const end = parseDateValue(endValue);
  if (!start || !end) return fallback;
  const diff = Math.round((end.getTime() - start.getTime()) / (60 * 1000));
  return diff > 0 ? diff : fallback;
}

function buildWindowFromLocalInputs(dateValue, timeValue, durationValue) {
  if (!dateValue || !timeValue) return null;

  const start = new Date(`${dateValue}T${timeValue}`);
  if (Number.isNaN(start.getTime())) return null;

  const durationMinutes = getDurationMinutes(durationValue, 60);
  const end = new Date(start.getTime() + durationMinutes * 60 * 1000);
  return {
    start: start.toISOString(),
    end: end.toISOString(),
    duration_minutes: durationMinutes
  };
}

function ensureDurationOption(selectElement, minutes) {
  if (!selectElement) return;
  const normalized = String(getDurationMinutes(minutes, 60));
  const existing = Array.from(selectElement.options).find(option => option.value === normalized);
  if (!existing) {
    const option = document.createElement("option");
    option.value = normalized;
    option.textContent = `${normalized} mins`;
    selectElement.appendChild(option);
  }
  selectElement.value = normalized;
}

function escapeHtml(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function normalizeRoomName(roomName) {
  return String(roomName || "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, " ");
}

function getRoomImage(room) {
  if (!room) return "../assets/image(3).png";
  const normalized = normalizeRoomName(room.name);
  return ROOM_IMAGES_BY_NAME[normalized] || "../assets/image(3).png";
}

function buildRoomFeatures(room) {
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

  return features.length > 0 ? features.join(" | ") : "Standard setup";
}

function isRoomAvailable(room) {
  return room?.is_available === 1 || room?.is_available === true || room?.is_available === "1";
}

function getRoomAvailabilityLabel(room) {
  if (isRoomAvailable(room)) {
    return "Available";
  }

  if (room?.booked_until) {
    return `Booked. Available after ${formatDateTime(room.booked_until)}`;
  }

  return "Booked";
}

function setTodayLabel() {
  const label = document.getElementById("todayLabel");
  if (!label) return;

  const today = new Date();
  label.textContent = `Today: ${today.toLocaleDateString(undefined, {
    month: "short",
    day: "2-digit",
    year: "numeric"
  })}`;
}

function setHeaderContent() {
  const headerName = document.getElementById("headerName");
  const welcomeHeading = document.getElementById("welcomeHeading");
  const headerAvatar = document.querySelector(".profile-pill .avatar");

  const name = currentEmployee?.name || (currentRole === "admin" ? "Admin" : "Employee");
  if (headerName) headerName.textContent = name;
  if (welcomeHeading) {
    welcomeHeading.textContent = currentRole === "admin" ? `Welcome, ${name}` : `Welcome Back, ${name}`;
  }
  if (headerAvatar) {
    headerAvatar.src = getProfileImagePath(currentEmployee?.gender);
  }
}

function setProfileSection() {
  const profileName = document.getElementById("profileName");
  const profileEmail = document.getElementById("profileEmail");
  const profileDepartment = document.getElementById("profileDepartment");
  const profileGender = document.getElementById("profileGender");
  const profileRole = document.getElementById("profileRole");
  const profileImage = document.getElementById("profileImage");
  const gender = normalizeGender(currentEmployee?.gender);

  if (profileName) profileName.textContent = currentEmployee?.name || "-";
  if (profileEmail) profileEmail.textContent = currentEmployee?.email || "-";
  if (profileDepartment) profileDepartment.textContent = currentEmployee?.department || "-";
  if (profileGender) profileGender.textContent = gender === "female" ? "Female" : "Male";
  if (profileRole) profileRole.textContent = isAdmin ? "Admin" : "Employee";
  if (profileImage) profileImage.src = getProfileImagePath(gender);
}

function clearAuthAndLogout() {
  localStorage.removeItem("auth_token");
  localStorage.removeItem("auth_employee");
  window.location.href = "../home.html";
}

async function apiFetch(path, options = {}) {
  const { skipAuth = false, ...fetchOptions } = options;
  const headers = { ...(fetchOptions.headers || {}) };

  if (!skipAuth && token) {
    headers.Authorization = `Bearer ${token}`;
  }

  if (fetchOptions.body && !headers["Content-Type"]) {
    headers["Content-Type"] = "application/json";
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...fetchOptions,
    headers
  });

  let data = null;
  try {
    data = await response.json();
  } catch (_error) {
    data = null;
  }

  if (!response.ok) {
    throw new Error(data?.message || `Request failed with status ${response.status}`);
  }

  return data;
}

function getStatusClass(status) {
  const normalized = String(status || "").toLowerCase();
  if (normalized === "confirmed") return "confirmed";
  if (normalized === "pending") return "pending";
  if (normalized === "cancelled") return "cancelled";
  return "";
}

function showSection(sectionId) {
  const target = document.getElementById(sectionId);
  if (!target) return;

  const sections = document.querySelectorAll(".dashboard-section");
  const navLinks = document.querySelectorAll(".side-nav [data-section-target]");

  sections.forEach(section => {
    section.classList.toggle("is-hidden", section.id !== sectionId);
  });

  navLinks.forEach(link => {
    link.classList.toggle("active", link.dataset.sectionTarget === sectionId);
  });
}

const dashboardSidebar = document.getElementById("dashboardSidebar");
const sidebarToggleBtn = document.getElementById("sidebarToggleBtn");
const sidebarDrawerBackdrop = document.getElementById("sidebarDrawerBackdrop");

function isMobileDrawerViewport() {
  return window.matchMedia("(max-width: 1040px)").matches;
}

function setSidebarDrawerState(isOpen) {
  if (!dashboardSidebar) return;

  dashboardSidebar.classList.toggle("is-open", isOpen);
  document.body.classList.toggle("drawer-open", isOpen);

  if (sidebarDrawerBackdrop) {
    sidebarDrawerBackdrop.hidden = !isOpen;
    sidebarDrawerBackdrop.classList.toggle("is-open", isOpen);
  }

  if (sidebarToggleBtn) {
    sidebarToggleBtn.setAttribute("aria-expanded", String(isOpen));
    sidebarToggleBtn.setAttribute("aria-label", isOpen ? "Close navigation menu" : "Open navigation menu");
  }
}

function closeSidebarDrawer() {
  setSidebarDrawerState(false);
}

function initializeSidebarDrawer() {
  if (!dashboardSidebar || !sidebarToggleBtn || !sidebarDrawerBackdrop) return;

  // Force a clean initial state on load (especially after responsive transitions).
  setSidebarDrawerState(false);

  sidebarToggleBtn.addEventListener("click", () => {
    const isOpen = dashboardSidebar.classList.contains("is-open");
    setSidebarDrawerState(!isOpen);
  });

  sidebarDrawerBackdrop.addEventListener("click", closeSidebarDrawer);

  window.addEventListener("resize", () => {
    if (!isMobileDrawerViewport()) {
      closeSidebarDrawer();
    }
  });
}

function initializeNav() {
  const navLinks = document.querySelectorAll(".side-nav [data-section-target]");
  navLinks.forEach(link => {
    link.addEventListener("click", event => {
      event.preventDefault();
      const targetId = link.dataset.sectionTarget;
      if (targetId) {
        showSection(targetId);
        closeSidebarDrawer();
      }
    });
  });

  const jumpTargets = document.querySelectorAll("[data-section-jump]");
  jumpTargets.forEach(element => {
    const goToSection = () => {
      const targetId = element.dataset.sectionJump;
      if (targetId) {
        showSection(targetId);
        closeSidebarDrawer();
      }
    };

    element.addEventListener("click", goToSection);
    element.addEventListener("keydown", event => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        goToSection();
      }
    });
  });

  const logoutLink = document.getElementById("logout-link");
  if (logoutLink) {
    logoutLink.addEventListener("click", event => {
      event.preventDefault();
      closeSidebarDrawer();
      clearAuthAndLogout();
    });
  }
}

function buildUpcomingUrl({ limit = 20, ownOnly = false, includeAll = false } = {}) {
  const params = new URLSearchParams();
  params.set("limit", String(limit));

  if (currentRole === "admin") {
    if (ownOnly && currentEmployeeId > 0) {
      params.set("employee_id", String(currentEmployeeId));
    }
    if (!includeAll && !ownOnly && currentEmployeeId > 0) {
      params.set("employee_id", String(currentEmployeeId));
    }
  }

  return `/bookings/upcoming?${params.toString()}`;
}

function buildMyBookingsUrl(limit = 30) {
  const params = new URLSearchParams();
  params.set("limit", String(limit));
  params.set("include_past", "1");
  params.set("include_cancelled", "1");

  if (currentRole === "admin" && currentEmployeeId > 0) {
    params.set("employee_id", String(currentEmployeeId));
  }

  return `/bookings/upcoming?${params.toString()}`;
}

async function loadSummary() {
  try {
    const summary = await apiFetch("/bookings/summary");

    const roomsToday = document.getElementById("summaryRoomsToday");
    const upcoming = document.getElementById("summaryUpcoming");
    const openRequests = document.getElementById("summaryOpenRequests");
    const utilization = document.getElementById("summaryUtilization");

    if (roomsToday) {
      roomsToday.textContent = String(summary.rooms_booked_today ?? 0);
    }

    if (currentRole === "admin") {
      if (upcoming) upcoming.textContent = String(summary.upcoming_meetings ?? 0);
      if (openRequests) openRequests.textContent = String(summary.open_requests ?? 0);
      if (utilization) utilization.textContent = `${Number(summary.utilization_percent || 0)}%`;
    } else {
      if (upcoming) upcoming.textContent = String(summary.upcoming_meetings_week ?? 0);
      if (openRequests) openRequests.textContent = String(summary.upcoming_meetings ?? 0);
      if (utilization) utilization.textContent = `${Number(summary.booked_hours_week || 0)}h`;
    }
  } catch (error) {
    console.error("Failed to load summary:", error);
  }
}

function renderOverviewBookings(rows) {
  const table = document.getElementById("overviewBookingsTable");
  if (!table) return;

  if (!Array.isArray(rows) || rows.length === 0) {
    table.innerHTML = `<tr><td colspan="5" class="empty-state">No upcoming bookings found.</td></tr>`;
    return;
  }

  table.innerHTML = rows
    .slice(0, 6)
    .map(row => {
      const statusClass = getStatusClass(row.status);
      const date = formatDate(row.start_time);
      const time = `${formatTime(row.start_time)} - ${formatTime(row.end_time)}`;

      if (currentRole === "admin") {
        return `
          <tr>
            <td>${escapeHtml(row.employee_name || "-")}</td>
            <td>${escapeHtml(row.room_name || "-")}</td>
            <td>${date}</td>
            <td>${time}</td>
            <td><span class="status ${statusClass}">${escapeHtml(row.status || "-")}</span></td>
          </tr>
        `;
      }

      return `
        <tr>
          <td>${escapeHtml(row.title || "-")}</td>
          <td>${escapeHtml(row.room_name || "-")}</td>
          <td>${date}</td>
          <td>${time}</td>
          <td><span class="status ${statusClass}">${escapeHtml(row.status || "-")}</span></td>
        </tr>
      `;
    })
    .join("");
}

function canManageFutureBooking(booking) {
  const normalizedStatus = String(booking?.status || "").toLowerCase();
  if (normalizedStatus === "cancelled") return false;

  const start = parseDateValue(booking?.start_time);
  if (!start) return false;
  return start.getTime() > Date.now();
}

function buildBookingActionsCell(booking) {
  if (!canManageFutureBooking(booking)) {
    return '<span class="action-muted">Locked</span>';
  }

  const bookingId = Number(booking.booking_id);
  if (!bookingId) {
    return '<span class="action-muted">Locked</span>';
  }

  return `
    <div class="booking-actions">
      <button class="btn btn-sm btn-primary" type="button" data-booking-action="edit" data-booking-id="${bookingId}">
        Edit
      </button>
      <button class="btn btn-sm btn-danger" type="button" data-booking-action="cancel" data-booking-id="${bookingId}">
        Cancel
      </button>
    </div>
  `;
}

function renderBookingsPage() {
  const table = document.getElementById("bookingsTable");
  if (!table) return;

  const rows = getPaginationSlice("bookings");

  if (!Array.isArray(rows) || rows.length === 0) {
    table.innerHTML = `<tr><td colspan="7" class="empty-state">No bookings found.</td></tr>`;
    renderPaginationControls("bookingsPagination", "bookings");
    return;
  }

  table.innerHTML = rows
    .map(row => {
      const statusClass = getStatusClass(row.status);
      return `
        <tr>
          <td>${escapeHtml(row.title || "-")}</td>
          <td>${escapeHtml(row.room_name || "-")}</td>
          <td>${escapeHtml(row.location_name || "-")}</td>
          <td>${formatDateTime(row.start_time)}</td>
          <td>${formatDateTime(row.end_time)}</td>
          <td><span class="status ${statusClass}">${escapeHtml(row.status || "-")}</span></td>
          <td>${buildBookingActionsCell(row)}</td>
        </tr>
      `;
    })
    .join("");

  renderPaginationControls("bookingsPagination", "bookings");
}

function renderBookingsTable(rows) {
  bookingsById = new Map();
  (rows || []).forEach(row => {
    bookingsById.set(Number(row.booking_id), row);
  });

  setPaginationRows("bookings", rows);
  renderBookingsPage();
}

async function loadBookings() {
  const overviewTable = document.getElementById("overviewBookingsTable");
  const bookingsTable = document.getElementById("bookingsTable");

  try {
    const overviewRows =
      currentRole === "admin"
        ? await apiFetch(buildUpcomingUrl({ limit: 12, includeAll: true }))
        : await apiFetch(buildUpcomingUrl({ limit: 12 }));

    renderOverviewBookings(overviewRows);

    const myRows = await apiFetch(buildMyBookingsUrl(200));
    renderBookingsTable(myRows);
  } catch (error) {
    console.error("Failed to load bookings:", error);
    if (overviewTable) {
      overviewTable.innerHTML = `<tr><td colspan="5" class="empty-state">Unable to load bookings right now.</td></tr>`;
    }
    if (bookingsTable) {
      bookingsTable.innerHTML = `<tr><td colspan="7" class="empty-state">Unable to load your bookings. Please refresh.</td></tr>`;
    }
    setPaginationRows("bookings", []);
    renderPaginationControls("bookingsPagination", "bookings");
  }
}

function buildFinderWindow() {
  const dateInput = document.getElementById("finderDate");
  const timeInput = document.getElementById("finderTime");
  const durationInput = document.getElementById("finderDuration");
  return buildWindowFromLocalInputs(dateInput?.value, timeInput?.value, durationInput?.value);
}

function applyFinderDateTimeConstraints() {
  const dateInput = document.getElementById("finderDate");
  const timeInput = document.getElementById("finderTime");
  if (!dateInput || !timeInput) return;

  const now = new Date();
  const today = getLocalDateInputValue(now);
  dateInput.min = today;

  if (!dateInput.value) {
    dateInput.value = today;
  }

  if (dateInput.value === today) {
    const minTime = getLocalTimeInputValue(now);
    timeInput.min = minTime;
    if (timeInput.value && timeInput.value < minTime) {
      timeInput.value = minTime;
    }
  } else {
    timeInput.min = "";
  }
}

function renderRoomFinderTable(rooms) {
  const table = document.getElementById("roomFinderTable");
  if (!table) return;

  finderRoomsById = new Map();
  (rooms || []).forEach(room => {
    finderRoomsById.set(Number(room.room_id), room);
  });

  setPaginationRows("roomFinder", rooms);
  renderRoomFinderPage();
}

function renderRoomFinderPage() {
  const table = document.getElementById("roomFinderTable");
  if (!table) return;

  const rooms = getPaginationSlice("roomFinder");
  const hasAction = true;
  const colSpan = 6;

  if (!Array.isArray(rooms) || rooms.length === 0) {
    table.innerHTML = `<tr><td colspan="${colSpan}" class="empty-state">No rooms found.</td></tr>`;
    renderPaginationControls("roomFinderPagination", "roomFinder");
    return;
  }

  table.innerHTML = rooms
    .map(room => {
      const roomId = Number(room.room_id);
      const available = isRoomAvailable(room);
      const availabilityText = getRoomAvailabilityLabel(room);
      const actionCol = `<td><button class="btn btn-primary btn-sm" type="button" data-room-id="${roomId}">Details</button></td>`;

      return `
        <tr class="clickable-room" data-room-id="${roomId}">
          <td>${escapeHtml(room.name || "-")}</td>
          <td>${escapeHtml(room.location_name || "-")}</td>
          <td>${escapeHtml(room.capacity || "-")}</td>
          <td><span class="availability-pill ${available ? "available" : "booked"}">${escapeHtml(availabilityText)}</span></td>
          <td>${escapeHtml(buildRoomFeatures(room))}</td>
          ${actionCol}
        </tr>
      `;
    })
    .join("");

  renderPaginationControls("roomFinderPagination", "roomFinder");
}

function renderAvailabilityList(rooms) {
  const list = document.getElementById("overviewAvailabilityList");
  if (!list) return;

  availabilityRoomsById = new Map();
  (rooms || []).forEach(room => {
    availabilityRoomsById.set(Number(room.room_id), room);
  });

  if (!Array.isArray(rooms) || rooms.length === 0) {
    list.innerHTML = `
      <li>
        <span>No immediate rooms</span>
        <small>Try Room Finder</small>
      </li>
    `;
    return;
  }

  list.innerHTML = rooms
    .slice(0, 5)
    .map(room => {
      const roomId = Number(room.room_id);
      const hints = " | View details";
      const detailAttrs = `class="clickable-room" data-room-id="${roomId}" tabindex="0" role="button"`;

      return `
        <li ${detailAttrs}>
          <span>${escapeHtml(room.name || "-")}</span>
          <small>${escapeHtml(room.capacity || "-")} Seats${hints}</small>
        </li>
      `;
    })
    .join("");
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

  const locationValue = document.getElementById("finderLocation")?.value || "";
  const capacityValue = document.getElementById("finderCapacity")?.value || "";

  const params = new URLSearchParams();
  params.set("limit", "100");
  if (locationValue) params.set("location_id", locationValue);
  if (capacityValue) params.set("capacity", capacityValue);

  const windowValue = buildFinderWindow();
  if (windowValue) {
    params.set("start_time", windowValue.start);
    params.set("end_time", windowValue.end);
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
  const start = new Date(Date.now() + 30 * 60 * 1000);
  const end = new Date(start.getTime() + 60 * 60 * 1000);
  availabilityWindow = {
    start: start.toISOString(),
    end: end.toISOString()
  };

  const params = new URLSearchParams({
    start_time: availabilityWindow.start,
    end_time: availabilityWindow.end,
    limit: "5",
    available_only: "1"
  });

  try {
    const rooms = await apiFetch(`/rooms?${params.toString()}`, { skipAuth: true });
    renderAvailabilityList(rooms);
  } catch (error) {
    console.error("Availability load failed:", error);
    renderAvailabilityList([]);
  }
}

function renderReportTables(reportData) {
  const locationTable = document.getElementById("reportLocationTable");
  const upcomingTable = document.getElementById("reportUpcomingTable");
  const upcomingCount = document.getElementById("reportUpcomingCount");
  const pendingCount = document.getElementById("reportPendingCount");
  const topLocation = document.getElementById("reportTopLocation");

  if (!locationTable || !upcomingTable || !upcomingCount || !pendingCount || !topLocation) {
    return;
  }

  const summary = reportData?.summary || {};
  const byLocation = Array.isArray(reportData?.by_location) ? reportData.by_location : [];
  const upcoming = Array.isArray(reportData?.upcoming) ? reportData.upcoming : [];

  setPaginationRows("reportLocations", byLocation);
  setPaginationRows("reportUpcoming", upcoming);

  renderReportLocationPage();
  renderReportUpcomingPage();

  upcomingCount.textContent = String(Number(summary.upcoming_count || 0));
  pendingCount.textContent = String(Number(summary.pending_count || 0));
  topLocation.textContent = String(summary.top_location || "-");
}

function renderReportLocationPage() {
  const locationTable = document.getElementById("reportLocationTable");
  if (!locationTable) return;

  const rows = getPaginationSlice("reportLocations");
  locationTable.innerHTML =
    rows.length === 0
      ? `<tr><td colspan="2" class="empty-state">No report data.</td></tr>`
      : rows
          .map(row => `<tr><td>${escapeHtml(row.location_name || "-")}</td><td>${Number(row.booking_count || 0)}</td></tr>`)
          .join("");

  renderPaginationControls("reportLocationPagination", "reportLocations");
}

function renderReportUpcomingPage() {
  const upcomingTable = document.getElementById("reportUpcomingTable");
  if (!upcomingTable) return;

  const rows = getPaginationSlice("reportUpcoming");
  upcomingTable.innerHTML =
    rows.length === 0
      ? `<tr><td colspan="3" class="empty-state">No report data.</td></tr>`
      : rows
          .map(row => {
            return `
              <tr>
                <td>${escapeHtml(row.employee_name || "-")}</td>
                <td>${escapeHtml(row.room_name || "-")}</td>
                <td>${formatDateTime(row.start_time)}</td>
              </tr>
            `;
          })
          .join("");

  renderPaginationControls("reportUpcomingPagination", "reportUpcoming");
}

async function loadReports() {
  if (currentRole !== "admin") return;

  try {
    const reportData = await apiFetch("/bookings/reports");
    renderReportTables(reportData);
  } catch (error) {
    console.error("Failed to load reports:", error);
    renderReportTables(null);
  }
}

async function refreshBookingViews() {
  const tasks = [loadSummary(), loadBookings(), loadOverviewAvailability(), searchRooms()];
  if (currentRole === "admin") {
    tasks.push(loadReports());
  }
  await Promise.all(tasks);
}

function setHelperMessage(element, message, type = "") {
  if (!element) return;
  element.textContent = message;
  element.classList.remove("success", "error");
  if (type) element.classList.add(type);
}

function renderEmployeeTable(rows) {
  const table = document.getElementById("employeeAdminTable");
  if (!table) return;

  setPaginationRows("employees", rows);
  renderEmployeePage();
}

function renderEmployeePage() {
  const table = document.getElementById("employeeAdminTable");
  if (!table) return;

  const rows = getPaginationSlice("employees");
  if (!Array.isArray(rows) || rows.length === 0) {
    table.innerHTML = `<tr><td colspan="7" class="empty-state">No employees found.</td></tr>`;
    renderPaginationControls("employeePagination", "employees");
    return;
  }

  table.innerHTML = rows
    .map(row => {
      const isCurrent = Number(row.employee_id) === currentEmployeeId;
      return `
        <tr>
          <td>${escapeHtml(row.employee_id)}</td>
          <td>${escapeHtml(row.name)}</td>
          <td>${escapeHtml(row.email)}</td>
          <td>${escapeHtml(row.department || "-")}</td>
          <td>${escapeHtml(normalizeGender(row.gender) === "female" ? "Female" : "Male")}</td>
          <td>${row.is_admin ? "Admin" : "Employee"}</td>
          <td>
            <button
              class="btn btn-danger btn-sm"
              type="button"
              data-delete-employee-id="${escapeHtml(row.employee_id)}"
              ${isCurrent ? "disabled" : ""}
            >
              Delete
            </button>
          </td>
        </tr>
      `;
    })
    .join("");

  renderPaginationControls("employeePagination", "employees");
}

async function loadEmployees() {
  if (currentRole !== "admin") return;

  const table = document.getElementById("employeeAdminTable");
  const pagination = document.getElementById("employeePagination");
  if (!table) return;

  table.innerHTML = `<tr><td colspan="7" class="empty-state">Loading employees...</td></tr>`;
  if (pagination) pagination.innerHTML = "";

  try {
    const rows = await apiFetch("/admin/employees");
    renderEmployeeTable(rows);
  } catch (error) {
    console.error("Failed to load employees:", error);
    table.innerHTML = `<tr><td colspan="7" class="empty-state">Failed to load employees.</td></tr>`;
    setPaginationRows("employees", []);
    renderPaginationControls("employeePagination", "employees");
  }
}

function initializeAdminSettings() {
  if (currentRole !== "admin") return;

  const addForm = document.getElementById("addEmployeeForm");
  const addMessage = document.getElementById("addEmployeeMessage");
  const refreshBtn = document.getElementById("refreshEmployeesBtn");
  const table = document.getElementById("employeeAdminTable");

  if (refreshBtn) {
    refreshBtn.addEventListener("click", () => {
      loadEmployees();
    });
  }

  if (addForm) {
    addForm.addEventListener("submit", async event => {
      event.preventDefault();
      setHelperMessage(addMessage, "", "");

      const payload = {
        name: document.getElementById("newEmployeeName")?.value?.trim(),
        email: document.getElementById("newEmployeeEmail")?.value?.trim(),
        department: document.getElementById("newEmployeeDept")?.value?.trim(),
        gender: document.getElementById("newEmployeeGender")?.value || "male",
        password: document.getElementById("newEmployeePassword")?.value || "",
        is_admin: document.getElementById("newEmployeeAdmin")?.checked === true
      };

      try {
        await apiFetch("/admin/employees", {
          method: "POST",
          body: JSON.stringify(payload)
        });
        addForm.reset();
        setHelperMessage(addMessage, "Employee added successfully.", "success");
        loadEmployees();
      } catch (error) {
        console.error("Add employee failed:", error);
        setHelperMessage(addMessage, error.message, "error");
      }
    });
  }

  if (table) {
    table.addEventListener("click", async event => {
      const button = event.target.closest("button[data-delete-employee-id]");
      if (!button) return;

      const employeeId = Number(button.dataset.deleteEmployeeId);
      if (!employeeId) return;

      const confirmed = window.confirm("Delete this employee?");
      if (!confirmed) return;

      try {
        await apiFetch(`/admin/employees/${employeeId}`, { method: "DELETE" });
        loadEmployees();
      } catch (error) {
        console.error("Delete employee failed:", error);
        alert(error.message);
      }
    });
  }
}

const bookingEditModal = document.getElementById("booking-edit-modal");
const bookingEditForm = document.getElementById("bookingEditForm");
const bookingEditTitle = document.getElementById("bookingEditTitle");
const bookingEditDescription = document.getElementById("bookingEditDescription");
const bookingEditDate = document.getElementById("bookingEditDate");
const bookingEditTime = document.getElementById("bookingEditTime");
const bookingEditDuration = document.getElementById("bookingEditDuration");
const bookingEditMessage = document.getElementById("bookingEditMessage");

function setBookingEditMessage(message, type = "") {
  setHelperMessage(bookingEditMessage, message, type);
}

function applyBookingEditDateTimeConstraints() {
  if (!bookingEditDate || !bookingEditTime) return;

  const now = new Date();
  const today = getLocalDateInputValue(now);
  bookingEditDate.min = today;

  if (!bookingEditDate.value) {
    bookingEditDate.value = today;
  }

  if (bookingEditDate.value === today) {
    const minTime = getLocalTimeInputValue(now);
    bookingEditTime.min = minTime;
    if (bookingEditTime.value && bookingEditTime.value < minTime) {
      bookingEditTime.value = minTime;
    }
  } else {
    bookingEditTime.min = "";
  }
}

function getBookingEditWindow() {
  return buildWindowFromLocalInputs(bookingEditDate?.value, bookingEditTime?.value, bookingEditDuration?.value);
}

function closeBookingEditModal() {
  if (!bookingEditModal) return;
  bookingEditModal.hidden = true;
  selectedBooking = null;
  if (bookingEditDescription) bookingEditDescription.value = "";
  setBookingEditMessage("", "");
}

async function openBookingEditModal(bookingId) {
  if (!bookingEditModal) return;

  const booking = bookingsById.get(Number(bookingId));
  if (!booking) return;

  if (!canManageFutureBooking(booking)) {
    alert("Only future active bookings can be edited.");
    return;
  }

  selectedBooking = booking;
  setBookingEditMessage("", "");

  if (bookingEditTitle) {
    bookingEditTitle.value = booking.title || "";
  }
  if (bookingEditDescription) {
    bookingEditDescription.value = booking.description || "";
  }

  if (bookingEditDate) {
    bookingEditDate.value = toLocalDateInputValue(booking.start_time);
  }
  if (bookingEditTime) {
    bookingEditTime.value = toLocalTimeInputValue(booking.start_time);
  }

  ensureDurationOption(bookingEditDuration, getMinutesBetween(booking.start_time, booking.end_time, 60));
  applyBookingEditDateTimeConstraints();

  bookingEditModal.hidden = false;
}

async function saveBookingEdits(event) {
  event.preventDefault();
  if (!selectedBooking) return;

  setBookingEditMessage("", "");

  const windowValue = getBookingEditWindow();
  if (!windowValue?.start || !windowValue?.end) {
    setBookingEditMessage("Select valid date, time, and duration.", "error");
    return;
  }

  const startDate = parseDateValue(windowValue.start);
  if (!startDate || startDate.getTime() < Date.now()) {
    setBookingEditMessage("You can only set future time slots.", "error");
    return;
  }

  const payload = {
    title: bookingEditTitle?.value?.trim() || selectedBooking.title || "Meeting",
    description: bookingEditDescription?.value?.trim() || selectedBooking.description || "",
    start_time: windowValue.start,
    end_time: windowValue.end
  };

  if (!payload.title || !payload.description) {
    setBookingEditMessage("Meeting name and description are required.", "error");
    return;
  }

  try {
    await apiFetch(`/bookings/${selectedBooking.booking_id}`, {
      method: "PATCH",
      body: JSON.stringify(payload)
    });

    setBookingEditMessage("Booking updated successfully.", "success");
    await refreshBookingViews();
    setTimeout(() => {
      closeBookingEditModal();
    }, 500);
  } catch (error) {
    console.error("Booking update failed:", error);
    setBookingEditMessage(error.message || "Unable to update booking.", "error");
  }
}

async function cancelBookingById(bookingId) {
  const booking = bookingsById.get(Number(bookingId));
  if (!booking) return;

  if (!canManageFutureBooking(booking)) {
    alert("Only future active bookings can be cancelled.");
    return;
  }

  const confirmed = window.confirm("Cancel this booking?");
  if (!confirmed) return;

  try {
    await apiFetch(`/bookings/${Number(bookingId)}/cancel`, { method: "PATCH" });
    await refreshBookingViews();
    if (selectedBooking && Number(selectedBooking.booking_id) === Number(bookingId)) {
      closeBookingEditModal();
    }
  } catch (error) {
    console.error("Booking cancel failed:", error);
    alert(error.message || "Unable to cancel booking.");
  }
}

function initializeBookingEditModalHandlers() {
  if (!bookingEditModal) return;

  bookingEditModal.addEventListener("click", event => {
    if (event.target.matches("[data-close-booking-modal]")) {
      closeBookingEditModal();
    }
  });

  if (bookingEditDate) {
    bookingEditDate.addEventListener("change", applyBookingEditDateTimeConstraints);
  }
  if (bookingEditTime) {
    bookingEditTime.addEventListener("focus", applyBookingEditDateTimeConstraints);
  }
  if (bookingEditForm) {
    bookingEditForm.addEventListener("submit", saveBookingEdits);
  }
}

const roomModal = document.getElementById("dashboard-room-modal");
const roomModalImage = document.getElementById("dashboard-room-image");
const roomModalTitle = document.getElementById("dashboard-room-title");
const roomModalLocation = document.getElementById("dashboard-room-location");
const roomModalFeatures = document.getElementById("dashboard-room-features");
const roomModalSlot = document.getElementById("dashboard-room-slot");
const roomModalDescription = document.getElementById("dashboard-room-description");
const roomModalMeetingTitle = document.getElementById("dashboardMeetingTitle");
const roomModalMeetingDescription = document.getElementById("dashboardMeetingDescription");
const roomModalMessage = document.getElementById("dashboard-room-message");
const roomModalBookBtn = document.getElementById("dashboard-room-book-btn");

function setRoomModalMessage(message, type = "") {
  setHelperMessage(roomModalMessage, message, type);
}

function getSlotLabel(windowValue) {
  if (!windowValue?.start || !windowValue?.end) {
    return "Selected Slot: Not set";
  }

  return `Selected Slot: ${formatDateTime(windowValue.start)} - ${formatTime(windowValue.end)}`;
}

function openRoomModal(room, bookingWindow) {
  if (!roomModal || !room) return;

  selectedRoom = room;
  selectedBookingWindow = bookingWindow || buildFinderWindow() || availabilityWindow;

  if (roomModalImage) roomModalImage.src = getRoomImage(room);
  if (roomModalTitle) roomModalTitle.textContent = room.name || "Room";
  if (roomModalLocation) roomModalLocation.textContent = room.location_name || "Unknown location";
  if (roomModalFeatures) roomModalFeatures.textContent = buildRoomFeatures(room);
  if (roomModalSlot) roomModalSlot.textContent = getSlotLabel(selectedBookingWindow);
  if (roomModalDescription) {
    roomModalDescription.textContent = room.description || "No description available for this room.";
  }
  if (roomModalMeetingTitle) {
    roomModalMeetingTitle.value = `Meeting in ${room.name || "Room"}`;
  }
  if (roomModalMeetingDescription) {
    roomModalMeetingDescription.value = "";
  }

  const available = isRoomAvailable(room);
  if (!available) {
    setRoomModalMessage(getRoomAvailabilityLabel(room), "error");
  } else {
    setRoomModalMessage("", "");
  }

  if (roomModalBookBtn) {
    roomModalBookBtn.hidden = false;
    roomModalBookBtn.disabled = !available;
    roomModalBookBtn.textContent = available ? "Book This Room" : "Booked";
  }

  roomModal.hidden = false;
}

function closeRoomModal() {
  if (!roomModal) return;
  roomModal.hidden = true;
  selectedRoom = null;
  selectedBookingWindow = null;
  if (roomModalMeetingTitle) roomModalMeetingTitle.value = "";
  if (roomModalMeetingDescription) roomModalMeetingDescription.value = "";
  setRoomModalMessage("", "");
}

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
  if (Number.isFinite(startTimestamp) && startTimestamp < Date.now()) {
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

  if (currentEmployeeId > 0) {
    payload.employee_id = currentEmployeeId;
  }

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

function initializeRoomModalHandlers() {
  if (!roomModal) return;

  roomModal.addEventListener("click", event => {
    if (event.target.matches("[data-close-modal]")) {
      closeRoomModal();
    }
  });

  document.addEventListener("keydown", event => {
    if (event.key !== "Escape") return;

    if (dashboardSidebar && dashboardSidebar.classList.contains("is-open")) {
      closeSidebarDrawer();
      return;
    }

    if (bookingEditModal && !bookingEditModal.hidden) {
      closeBookingEditModal();
      return;
    }

    if (!roomModal.hidden) {
      closeRoomModal();
    }
  });

  if (roomModalBookBtn) {
    roomModalBookBtn.addEventListener("click", bookSelectedRoom);
  }
}

function initializeRoomDetailsInteractions() {
  const finderTable = document.getElementById("roomFinderTable");
  if (finderTable) {
    finderTable.addEventListener("click", event => {
      const clickable = event.target.closest("[data-room-id]");
      if (!clickable) return;

      const roomId = Number(clickable.dataset.roomId);
      const room = finderRoomsById.get(roomId);
      if (!room) return;

      openRoomModal(room, buildFinderWindow() || availabilityWindow);
    });
  }

  const availabilityList = document.getElementById("overviewAvailabilityList");
  if (availabilityList) {
    availabilityList.addEventListener("click", event => {
      const row = event.target.closest("[data-room-id]");
      if (!row) return;

      const roomId = Number(row.dataset.roomId);
      const room = availabilityRoomsById.get(roomId);
      if (!room) return;

      openRoomModal(room, availabilityWindow);
    });

    availabilityList.addEventListener("keydown", event => {
      if (event.key !== "Enter" && event.key !== " ") return;

      const row = event.target.closest("[data-room-id]");
      if (!row) return;

      event.preventDefault();
      const roomId = Number(row.dataset.roomId);
      const room = availabilityRoomsById.get(roomId);
      if (!room) return;

      openRoomModal(room, availabilityWindow);
    });
  }
}

function initializeRoomFinder() {
  const form = document.getElementById("roomFinderForm");
  if (!form) return;

  const dateInput = document.getElementById("finderDate");
  const timeInput = document.getElementById("finderTime");
  const durationInput = document.getElementById("finderDuration");

  const now = new Date();
  const roundedMinutes = Math.ceil(now.getMinutes() / 30) * 30;
  now.setMinutes(roundedMinutes, 0, 0);

  if (dateInput) {
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const day = String(now.getDate()).padStart(2, "0");
    dateInput.value = `${now.getFullYear()}-${month}-${day}`;
  }

  if (timeInput) {
    const hours = String(now.getHours()).padStart(2, "0");
    const minutes = String(now.getMinutes()).padStart(2, "0");
    timeInput.value = `${hours}:${minutes}`;
  }

  if (durationInput && !durationInput.value) {
    durationInput.value = "60";
  }

  applyFinderDateTimeConstraints();
  dateInput?.addEventListener("change", applyFinderDateTimeConstraints);
  timeInput?.addEventListener("focus", applyFinderDateTimeConstraints);

  form.addEventListener("submit", searchRooms);
}

function renderPaginatedSection(key) {
  if (key === "bookings") {
    renderBookingsPage();
    return;
  }
  if (key === "roomFinder") {
    renderRoomFinderPage();
    return;
  }
  if (key === "employees") {
    renderEmployeePage();
    return;
  }
  if (key === "reportLocations") {
    renderReportLocationPage();
    return;
  }
  if (key === "reportUpcoming") {
    renderReportUpcomingPage();
  }
}

function initializePageActions() {
  const refreshBookingsBtn = document.getElementById("refreshBookingsBtn");
  if (refreshBookingsBtn) {
    refreshBookingsBtn.addEventListener("click", () => {
      loadBookings();
    });
  }

  const bookingsTable = document.getElementById("bookingsTable");
  if (bookingsTable) {
    bookingsTable.addEventListener("click", async event => {
      const button = event.target.closest("button[data-booking-action][data-booking-id]");
      if (!button) return;

      const bookingId = Number(button.dataset.bookingId);
      if (!bookingId) return;

      const action = button.dataset.bookingAction;
      if (action === "edit") {
        await openBookingEditModal(bookingId);
        return;
      }
      if (action === "cancel") {
        await cancelBookingById(bookingId);
      }
    });
  }

  document.addEventListener("click", event => {
    const button = event.target.closest("button[data-pagination-key][data-pagination-page]");
    if (!button) return;

    const key = String(button.dataset.paginationKey || "");
    const page = Number.parseInt(String(button.dataset.paginationPage || ""), 10);
    const config = getPaginationConfig(key);
    if (!config || !Number.isFinite(page)) return;

    config.page = clamp(page, 1, getPaginationTotalPages(key));
    renderPaginatedSection(key);
  });
}

async function initializeDashboard() {
  setTodayLabel();
  setHeaderContent();
  setProfileSection();
  initializeSidebarDrawer();
  initializeNav();
  initializePageActions();
  initializeRoomFinder();
  initializeBookingEditModalHandlers();
  initializeRoomModalHandlers();
  initializeRoomDetailsInteractions();
  initializeAdminSettings();

  await Promise.all([loadSummary(), loadBookings(), loadFinderLocations(), loadOverviewAvailability()]);
  await searchRooms();

  if (currentRole === "admin") {
    await Promise.all([loadReports(), loadEmployees()]);
  }
}

initializeDashboard();
