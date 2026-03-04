const API_BASE_URL = window.APP_CONFIG?.API_BASE_URL || "http://localhost:4000/api";

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
  "training room": "../assets/training_room.png",
  karoo: "../assets/hubble-2-persons.png",
  meerkat: "../assets/Nexus-2-persons.png",
  "cape town": "../assets/synergy-4-members.png",
  "drakensberg": "../assets/fussion-6-members.png",
  "table mountain": "../assets/fussion-6-members.png",

};
const MALE_PROFILE_IMAGE = "../assets/male_profile.png";
const FEMALE_PROFILE_IMAGE = "../assets/female_profile.png";
const TIMEZONE_CODE_OVERRIDES = Object.freeze({
  "Asia/Kolkata": "IST",
  "Africa/Johannesburg": "SAST"
});
const BOOKING_PAST_GRACE_MS = 60 * 1000;
const ROOM_AVAILABLE_SOON_MS = 60 * 1000;

function getStoredEmployee() {
  const raw = localStorage.getItem("auth_employee");
  if (!raw) return null;

  try {
    return JSON.parse(raw);
  } catch (_error) {
    return null;
  }
}

let currentEmployee = getStoredEmployee();
let currentEmployeeId = Number(currentEmployee?.employee_id || 0);
const currentRole = document.body.dataset.role || "employee";
let isAdmin = currentEmployee?.is_admin === true;
let forcePasswordChange = new URLSearchParams(window.location.search).get("force_password_change") === "1";

function setCurrentEmployee(employee) {
  if (employee && typeof employee === "object") {
    currentEmployee = employee;
    localStorage.setItem("auth_employee", JSON.stringify(employee));
  } else {
    currentEmployee = null;
    localStorage.removeItem("auth_employee");
  }
  currentEmployeeId = Number(currentEmployee?.employee_id || 0);
  isAdmin = currentEmployee?.is_admin === true;
}

function clearStoredAuth() {
  localStorage.removeItem("auth_token");
  localStorage.removeItem("auth_employee");
}

function enforceRoleAccess() {
  if (currentRole === "admin" && !isAdmin) {
    window.location.href = "./employee-dashboard.html";
    return false;
  }

  if (currentRole === "employee" && isAdmin) {
    window.location.href = "./admin-dashboard.html";
    return false;
  }

  return true;
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

function isPastBeyondGrace(timestamp, graceMs = BOOKING_PAST_GRACE_MS) {
  if (!Number.isFinite(timestamp)) return true;
  return timestamp < Date.now() - graceMs;
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
    // Fallback to UTC label when timezone formatting fails.
  }

  return "UTC";
}

function formatDate(value, timeZone) {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";
  const normalizedTimeZone = normalizeTimeZone(timeZone);
  const options = { month: "short", day: "2-digit", year: "numeric" };

  try {
    return date.toLocaleDateString(
      "en-US",
      normalizedTimeZone ? { ...options, timeZone: normalizedTimeZone } : options
    );
  } catch (_error) {
    return date.toLocaleDateString("en-US", options);
  }
}

function formatTime(value, timeZone, { includeTimeZone = true } = {}) {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";
  const normalizedTimeZone = normalizeTimeZone(timeZone);
  const options = { hour: "numeric", minute: "2-digit", hour12: true };

  let formattedTime = "-";
  try {
    formattedTime = date.toLocaleTimeString(
      "en-US",
      normalizedTimeZone ? { ...options, timeZone: normalizedTimeZone } : options
    );
  } catch (_error) {
    formattedTime = date.toLocaleTimeString("en-US", options);
  }

  if (!includeTimeZone) {
    return formattedTime;
  }

  return `${formattedTime} ${getTimeZoneCode(date, normalizedTimeZone)}`;
}

function formatDateTime(value, timeZone, options = {}) {
  if (!value) return "-";
  return `${formatDate(value, timeZone)} ${formatTime(value, timeZone, options)}`;
}

function formatTimeRange(startValue, endValue, timeZone) {
  const startText = formatTime(startValue, timeZone, { includeTimeZone: false });
  const endText = formatTime(endValue, timeZone, { includeTimeZone: false });
  if (startText === "-" || endText === "-") return "-";

  const referenceDate = parseDateValue(startValue) || parseDateValue(endValue) || new Date();
  return `${startText} - ${endText} ${getTimeZoneCode(referenceDate, timeZone)}`;
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

  const normalizedTime = normalizeTimeValueTo24(timeValue);
  if (!normalizedTime) return null;

  const start = new Date(`${dateValue}T${normalizedTime}`);
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
    const bookedUntil = parseDateValue(room.booked_until);
    if (bookedUntil && bookedUntil.getTime() <= Date.now() + ROOM_AVAILABLE_SOON_MS) {
      return "Booked. Available now";
    }
    return `Booked. Available after ${formatDateTime(room.booked_until, room.location_timezone)}`;
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

function updatePasswordResetNotice() {
  const notice = document.getElementById("passwordResetNotice");
  if (!notice) return;

  const requiresReset = forcePasswordChange || currentEmployee?.password_reset_required === true;
  notice.hidden = !requiresReset;
  if (requiresReset) {
    notice.textContent = "For security, please change your password before continuing regular usage.";
  } else {
    notice.textContent = "";
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
  updatePasswordResetNotice();
}

async function ensureAuthenticatedSession() {
  try {
    const data = await apiFetch("/auth/me", { skipAuth: true });
    if (!data?.employee) {
      throw new Error("Session data is missing.");
    }
    setCurrentEmployee(data.employee);

    if (!enforceRoleAccess()) {
      return false;
    }
    return true;
  } catch (_error) {
    clearStoredAuth();
    window.location.href = "../home.html";
    return false;
  }
}

async function clearAuthAndLogout() {
  try {
    await apiFetch("/auth/logout", { method: "POST", skipAuth: true });
  } catch (_error) {
    // no-op: logout should still clear local auth and redirect
  }
  clearStoredAuth();
  window.location.href = "../home.html";
}

async function apiFetch(path, options = {}) {
  const { skipAuth = false, ...fetchOptions } = options;
  const headers = { ...(fetchOptions.headers || {}) };

  if (fetchOptions.body && !headers["Content-Type"]) {
    headers["Content-Type"] = "application/json";
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...fetchOptions,
    credentials: "include",
    headers
  });

  let data = null;
  try {
    data = await response.json();
  } catch (_error) {
    data = null;
  }

  if (!response.ok) {
    const error = new Error(data?.message || `Request failed with status ${response.status}`);
    error.status = response.status;
    error.payload = data;
    if (response.status === 401 && !skipAuth) {
      clearStoredAuth();
      window.location.href = "../home.html";
    }
    throw error;
  }

  return data;
}

function getStatusClass(status) {
  const normalized = String(status || "").toLowerCase();
  if (normalized === "confirmed") return "confirmed";
  if (normalized === "pending") return "pending";
  if (normalized === "cancelled") return "cancelled";
  if (normalized === "vacated") return "vacated";
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
      const date = formatDate(row.start_time, row.location_timezone);
      const time = formatTimeRange(row.start_time, row.end_time, row.location_timezone);

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
  if (normalizedStatus === "cancelled" || normalizedStatus === "vacated") return false;

  const start = parseDateValue(booking?.start_time);
  if (!start) return false;
  return start.getTime() > Date.now();
}

function canVacateOngoingBooking(booking) {
  const normalizedStatus = String(booking?.status || "").toLowerCase();
  if (normalizedStatus === "cancelled" || normalizedStatus === "vacated") return false;

  const start = parseDateValue(booking?.start_time);
  const end = parseDateValue(booking?.end_time);
  if (!start || !end) return false;

  const now = Date.now();
  return start.getTime() <= now && end.getTime() > now;
}

function buildBookingActionsCell(booking) {
  const bookingId = Number(booking.booking_id);
  if (!bookingId) {
    return '<span class="action-muted">Locked</span>';
  }

  if (canVacateOngoingBooking(booking)) {
    return `
      <div class="booking-actions">
        <button class="btn btn-sm btn-danger" type="button" data-booking-action="vacate" data-booking-id="${bookingId}">
          Vacate
        </button>
      </div>
    `;
  }

  if (!canManageFutureBooking(booking)) {
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
          <td>${formatDateTime(row.start_time, row.location_timezone)}</td>
          <td>${formatDateTime(row.end_time, row.location_timezone)}</td>
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
    const currentMinutes = getTimeValueMinutes(getTimeInputValue24(timeInput));
    const minMinutes = getTimeValueMinutes(minTime);
    if (currentMinutes !== null && minMinutes !== null && currentMinutes < minMinutes) {
      setTimeInputValue(timeInput, minTime);
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
        <span>No booked rooms right now</span>
        <small>All rooms are currently free</small>
      </li>
    `;
    return;
  }

  list.innerHTML = rooms
    .slice(0, 5)
    .map(room => {
      const roomId = Number(room.room_id);
      const availabilityHint = escapeHtml(getRoomAvailabilityLabel(room));
      const hints = ` | ${availabilityHint} | View details`;
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
  const start = new Date();
  const end = new Date(start.getTime() + 60 * 1000);
  availabilityWindow = {
    start: start.toISOString(),
    end: end.toISOString()
  };

  const params = new URLSearchParams({
    start_time: availabilityWindow.start,
    end_time: availabilityWindow.end,
    limit: "100"
  });

  try {
    const rooms = await apiFetch(`/rooms?${params.toString()}`, { skipAuth: true });
    const bookedRooms = (rooms || []).filter(room => !isRoomAvailable(room));
    renderAvailabilityList(bookedRooms);
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
                <td>${formatDateTime(row.start_time, row.location_timezone)}</td>
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

function initializeProfileSecurity() {
  const form = document.getElementById("changePasswordForm");
  const messageElement = document.getElementById("changePasswordMessage");
  const currentPasswordInput = document.getElementById("currentPasswordInput");
  const newPasswordInput = document.getElementById("newPasswordInput");
  const confirmPasswordInput = document.getElementById("confirmPasswordInput");

  updatePasswordResetNotice();
  if (!form || !messageElement || !currentPasswordInput || !newPasswordInput || !confirmPasswordInput) {
    return;
  }

  form.addEventListener("submit", async event => {
    event.preventDefault();
    setHelperMessage(messageElement, "", "");

    const currentPassword = currentPasswordInput.value || "";
    const newPassword = newPasswordInput.value || "";
    const confirmPassword = confirmPasswordInput.value || "";

    if (!currentPassword || !newPassword || !confirmPassword) {
      setHelperMessage(messageElement, "Please fill all password fields.", "error");
      return;
    }

    if (newPassword !== confirmPassword) {
      setHelperMessage(messageElement, "New password and confirm password must match.", "error");
      return;
    }

    try {
      const response = await apiFetch("/auth/change-password", {
        method: "POST",
        body: JSON.stringify({
          current_password: currentPassword,
          new_password: newPassword
        })
      });

      if (response?.employee) {
        setCurrentEmployee(response.employee);
      }

      forcePasswordChange = false;
      const currentUrl = new URL(window.location.href);
      if (currentUrl.searchParams.has("force_password_change")) {
        currentUrl.searchParams.delete("force_password_change");
        const nextPath = `${currentUrl.pathname}${currentUrl.search}${currentUrl.hash}`;
        window.history.replaceState({}, "", nextPath);
      }

      setHeaderContent();
      setProfileSection();
      setHelperMessage(messageElement, response?.message || "Password changed successfully.", "success");
      form.reset();
    } catch (error) {
      setHelperMessage(messageElement, error.message || "Failed to change password.", "error");
    }
  });
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

const MODAL_FOCUSABLE_SELECTOR = [
  "a[href]",
  "button:not([disabled])",
  "textarea:not([disabled])",
  "input:not([disabled]):not([type='hidden'])",
  "select:not([disabled])",
  "[tabindex]:not([tabindex='-1'])"
].join(", ");
let activeModalElement = null;
let lastModalTriggerElement = null;

function isVisibleElement(element) {
  if (!(element instanceof HTMLElement)) return false;
  if (element.hidden) return false;
  return element.getClientRects().length > 0;
}

function getModalFocusableElements(modalElement) {
  if (!modalElement) return [];
  return Array.from(modalElement.querySelectorAll(MODAL_FOCUSABLE_SELECTOR))
    .filter(node => isVisibleElement(node) && node.getAttribute("aria-hidden") !== "true");
}

function trapActiveModalFocus(event) {
  if (event.key !== "Tab" || !activeModalElement || activeModalElement.hidden) return;

  const focusableElements = getModalFocusableElements(activeModalElement);
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

function openManagedModal(modalElement, triggerElement = null) {
  if (!modalElement) return;

  lastModalTriggerElement =
    triggerElement instanceof HTMLElement
      ? triggerElement
      : document.activeElement instanceof HTMLElement
        ? document.activeElement
        : null;

  modalElement.hidden = false;
  activeModalElement = modalElement;

  const focusableElements = getModalFocusableElements(modalElement);
  const firstElement = focusableElements[0];
  if (firstElement) {
    firstElement.focus();
  }
}

function closeManagedModal(modalElement) {
  if (!modalElement) return;

  modalElement.hidden = true;
  if (activeModalElement === modalElement) {
    activeModalElement = null;
  }

  if (lastModalTriggerElement && lastModalTriggerElement.isConnected) {
    lastModalTriggerElement.focus();
  }
  lastModalTriggerElement = null;
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
    const currentMinutes = getTimeValueMinutes(getTimeInputValue24(bookingEditTime));
    const minMinutes = getTimeValueMinutes(minTime);
    if (currentMinutes !== null && minMinutes !== null && currentMinutes < minMinutes) {
      setTimeInputValue(bookingEditTime, minTime);
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
  closeManagedModal(bookingEditModal);
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
    setTimeInputValue(bookingEditTime, toLocalTimeInputValue(booking.start_time));
  }

  ensureDurationOption(bookingEditDuration, getMinutesBetween(booking.start_time, booking.end_time, 60));
  applyBookingEditDateTimeConstraints();

  openManagedModal(bookingEditModal);
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
  if (isPastBeyondGrace(startDate?.getTime())) {
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

async function vacateBookingById(bookingId) {
  const booking = bookingsById.get(Number(bookingId));
  if (!booking) return;

  if (!canVacateOngoingBooking(booking)) {
    alert("Only ongoing active bookings can be vacated.");
    return;
  }

  const confirmed = window.confirm("Vacate this room now?");
  if (!confirmed) return;

  try {
    await apiFetch(`/bookings/${Number(bookingId)}/vacate`, { method: "PATCH" });
    await refreshBookingViews();
    if (selectedBooking && Number(selectedBooking.booking_id) === Number(bookingId)) {
      closeBookingEditModal();
    }
  } catch (error) {
    console.error("Booking vacate failed:", error);
    alert(error.message || "Unable to vacate booking.");
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

  openManagedModal(roomModal);
}

function closeRoomModal() {
  if (!roomModal) return;
  closeManagedModal(roomModal);
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
  if (isPastBeyondGrace(startTimestamp)) {
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
    trapActiveModalFocus(event);

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
    setTimeInputValue(timeInput, `${hours}:${minutes}`);
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
        return;
      }
      if (action === "vacate") {
        await vacateBookingById(bookingId);
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
  const isAuthenticated = await ensureAuthenticatedSession();
  if (!isAuthenticated) return;

  setTodayLabel();
  setHeaderContent();
  setProfileSection();
  initializeSidebarDrawer();
  initializeNav();
  initializeProfileSecurity();
  initializePageActions();
  initializeRoomFinder();
  initializeBookingEditModalHandlers();
  initializeRoomModalHandlers();
  initializeRoomDetailsInteractions();
  initializeAdminSettings();

  if (forcePasswordChange || currentEmployee?.password_reset_required === true) {
    showSection("profileSection");
  }

  await Promise.all([loadSummary(), loadBookings(), loadFinderLocations(), loadOverviewAvailability()]);
  await searchRooms();

  if (currentRole === "admin") {
    await Promise.all([loadReports(), loadEmployees()]);
  }
}

initializeDashboard();
