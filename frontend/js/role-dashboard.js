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
  "Asia/Calcutta": "IST",
  "Africa/Johannesburg": "SAST"
});
const BOOKING_PAST_GRACE_MS = 60 * 1000;
const ROOM_AVAILABLE_SOON_MS = 60 * 1000;
const ROOM_SCHEDULE_DAYS = 7;
const ROOM_SCHEDULE_STEP_MINUTES = 30;
const ROOM_SCHEDULE_DEFAULT_WORKDAY_START = "10:00";
const ROOM_SCHEDULE_DEFAULT_WORKDAY_END = "19:00";
const ROOM_SCHEDULE_TIMEZONE = "Asia/Kolkata";
const ROOM_SCHEDULE_TIMEZONE_LABEL = "IST";

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
  selectedCreateOrganizerId = Number(currentEmployeeId || 0);
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
let selectedCreateOrganizerId = Number(currentEmployeeId || 0);
const roomScheduleState = {
  isOpen: false,
  loading: false,
  requestKey: "",
  payload: null
};
const participantPickerState = {
  create: { selected: [], suggestions: [], directory: [], directoryKey: "" },
  edit: { selected: [], suggestions: [], directory: [], directoryKey: "" }
};
const paginationState = {
  bookings: { rows: [], page: 1, pageSize: 8 },
  roomFinder: { rows: [], page: 1, pageSize: 8 },
  employees: { rows: [], page: 1, pageSize: 8 },
  reportLocations: { rows: [], page: 1, pageSize: 6 },
  reportUpcoming: { rows: [], page: 1, pageSize: 6 }
};
let adminEmployeeDirectory = [];
let adminLocationDirectory = [];
const PARTICIPANT_FILTER_FIELDS = [
  { key: "department", label: "All Departments" },
  { key: "project", label: "All Projects" },
  { key: "role", label: "All Roles" },
  { key: "work_location_name", label: "All Locations" }
];
const PASSWORD_RULE_KEYS = ["length", "lowercase", "uppercase", "number", "special"];
const DASHBOARD_THEME_STORAGE_KEY = "dashboard_theme_preference";
const DASHBOARD_THEME_LIGHT = "light";
const DASHBOARD_THEME_DARK = "dark";

function buildTableSkeletonRows(colSpan, rowCount = 3) {
  const safeColSpan = Math.max(1, Number.parseInt(colSpan, 10) || 1);
  const safeRowCount = Math.max(1, Number.parseInt(rowCount, 10) || 1);

  return Array.from({ length: safeRowCount })
    .map(
      () => `
        <tr class="skeleton-row" aria-hidden="true">
          <td colspan="${safeColSpan}" class="skeleton-cell">
            <span class="table-skeleton"></span>
          </td>
        </tr>
      `
    )
    .join("");
}

function buildAvailabilityLoadingMarkup(itemCount = 3) {
  const safeItemCount = Math.max(1, Number.parseInt(itemCount, 10) || 1);
  return Array.from({ length: safeItemCount })
    .map(
      () => `
        <li class="availability-skeleton-item" aria-hidden="true">
          <span class="skeleton-line"></span>
          <small class="skeleton-line skeleton-line-sm"></small>
        </li>
      `
    )
    .join("");
}

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

function formatCompactDateTime(value, timeZone) {
  if (!value) return "-";
  const dateText = formatDate(value, timeZone);
  const shortDate = dateText.replace(/,\s*\d{4}$/, "");
  return `${shortDate} ${formatTime(value, timeZone)}`;
}

function formatTimeRange(startValue, endValue, timeZone) {
  const startText = formatTime(startValue, timeZone, { includeTimeZone: false });
  const endText = formatTime(endValue, timeZone, { includeTimeZone: false });
  if (startText === "-" || endText === "-") return "-";

  const referenceDate = parseDateValue(startValue) || parseDateValue(endValue) || new Date();
  return `${startText} - ${endText} ${getTimeZoneCode(referenceDate, timeZone)}`;
}

function getPasswordRuleState(passwordValue) {
  const password = String(passwordValue || "");
  return {
    length: password.length >= 8,
    lowercase: /[a-z]/.test(password),
    uppercase: /[A-Z]/.test(password),
    number: /\d/.test(password),
    special: /[^A-Za-z0-9]/.test(password)
  };
}

function getPasswordRuleError(passwordValue) {
  const ruleState = getPasswordRuleState(passwordValue);
  if (!ruleState.length) return "Password must be at least 8 characters long.";
  if (!ruleState.lowercase) return "Password must include at least one lowercase letter.";
  if (!ruleState.uppercase) return "Password must include at least one uppercase letter.";
  if (!ruleState.number) return "Password must include at least one number.";
  if (!ruleState.special) return "Password must include at least one special character.";
  return "";
}

function formatRefreshStamp(date = new Date()) {
  const resolvedZone = Intl.DateTimeFormat().resolvedOptions().timeZone || "";
  return formatTime(date.toISOString(), resolvedZone);
}

function setLastRefreshed(labelId, date = new Date()) {
  const label = document.getElementById(labelId);
  if (!label) return;
  label.textContent = `Last refreshed: ${formatRefreshStamp(date)}`;
}

function markOverviewAndBookingsRefreshed(date = new Date()) {
  setLastRefreshed("overviewLastRefreshed", date);
  setLastRefreshed("bookingsLastRefreshed", date);
}

function setBookedNowPanelTone(bookedCount) {
  const panel = document.querySelector(".panel-booked-now");
  if (!panel) return;
  panel.classList.toggle("is-alert", Number(bookedCount) > 0);
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
    welcomeHeading.textContent = currentRole === "admin" ? `Welcome, ${name}` : `Welcome Back, ${name.charAt(0).toUpperCase()+name.slice(1)}`;
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
  const profileHeroName = document.getElementById("profileHeroName");
  const profileHeroTitle = document.getElementById("profileHeroTitle");
  const profileHeroEmail = document.getElementById("profileHeroEmail");
  const profileDepartment = document.getElementById("profileDepartment");
  const profileGender = document.getElementById("profileGender");
  const profileJobRole = document.getElementById("profileJobRole");
  const profileProject = document.getElementById("profileProject");
  const profileManager = document.getElementById("profileManager");
  const profileWorkLocation = document.getElementById("profileWorkLocation");
  const profilePhone = document.getElementById("profilePhone");
  const profileHireDate = document.getElementById("profileHireDate");
  const profileEmployeeType = document.getElementById("profileEmployeeType");
  const profileImage = document.getElementById("profileImage");
  const gender = normalizeGender(currentEmployee?.gender);
  const hireDate = parseDateValue(currentEmployee?.hire_date);
  const managerLabel =
    currentEmployee?.manager_name ||
    (Number.isFinite(Number(currentEmployee?.manager_id)) ? `Employee #${Number(currentEmployee.manager_id)}` : "-");
  const profileTitle = currentEmployee?.role || (isAdmin ? "Administrator" : "Team Member");

  if (profileHeroName) profileHeroName.textContent = currentEmployee?.name || (isAdmin ? "Admin" : "Employee");
  if (profileHeroTitle) profileHeroTitle.textContent = profileTitle;
  if (profileHeroEmail) profileHeroEmail.textContent = currentEmployee?.email || "-";
  if (profileDepartment) profileDepartment.textContent = currentEmployee?.department || "-";
  if (profileGender) profileGender.textContent = gender === "female" ? "Female" : "Male";
  if (profileJobRole) profileJobRole.textContent = currentEmployee?.role || "-";
  if (profileProject) profileProject.textContent = currentEmployee?.project || "-";
  if (profileManager) profileManager.textContent = managerLabel;
  if (profileWorkLocation) profileWorkLocation.textContent = currentEmployee?.work_location_name || "-";
  if (profilePhone) profilePhone.textContent = currentEmployee?.phone_number || "-";
  if (profileHireDate) {
    profileHireDate.textContent = hireDate
      ? hireDate.toLocaleDateString(undefined, { month: "short", day: "2-digit", year: "numeric" })
      : "-";
  }
  if (profileEmployeeType) profileEmployeeType.textContent = currentEmployee?.employee_type || "-";
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

function getStoredDashboardTheme() {
  const stored = localStorage.getItem(DASHBOARD_THEME_STORAGE_KEY);
  if (stored === DASHBOARD_THEME_DARK || stored === DASHBOARD_THEME_LIGHT) {
    return stored;
  }
  return null;
}

function getSystemDashboardTheme() {
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? DASHBOARD_THEME_DARK : DASHBOARD_THEME_LIGHT;
}

function getActiveDashboardTheme() {
  return document.body.classList.contains("theme-dark") ? DASHBOARD_THEME_DARK : DASHBOARD_THEME_LIGHT;
}

function setThemeToggleButtonState(theme) {
  if (!themeToggleBtn) return;

  const isDark = theme === DASHBOARD_THEME_DARK;
  themeToggleBtn.textContent = isDark ? "Light Mode" : "Dark Mode";
  themeToggleBtn.setAttribute("aria-pressed", String(isDark));
  themeToggleBtn.setAttribute("aria-label", isDark ? "Switch to light mode" : "Switch to dark mode");
}

function applyDashboardTheme(theme, { persist = true } = {}) {
  const resolvedTheme = theme === DASHBOARD_THEME_DARK ? DASHBOARD_THEME_DARK : DASHBOARD_THEME_LIGHT;
  const isDark = resolvedTheme === DASHBOARD_THEME_DARK;

  document.body.classList.toggle("theme-dark", isDark);
  document.body.dataset.theme = resolvedTheme;
  document.documentElement.style.colorScheme = resolvedTheme;

  setThemeToggleButtonState(resolvedTheme);

  if (persist) {
    localStorage.setItem(DASHBOARD_THEME_STORAGE_KEY, resolvedTheme);
  }
}

function initializeThemeToggle() {
  const initialTheme = getStoredDashboardTheme() || getSystemDashboardTheme();
  applyDashboardTheme(initialTheme, { persist: false });

  if (themeToggleBtn) {
    themeToggleBtn.addEventListener("click", () => {
      const nextTheme =
        getActiveDashboardTheme() === DASHBOARD_THEME_DARK ? DASHBOARD_THEME_LIGHT : DASHBOARD_THEME_DARK;
      applyDashboardTheme(nextTheme);
    });
  }

  const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
  const syncWithSystemTheme = event => {
    if (getStoredDashboardTheme()) return;
    applyDashboardTheme(event.matches ? DASHBOARD_THEME_DARK : DASHBOARD_THEME_LIGHT, { persist: false });
  };

  if (typeof mediaQuery.addEventListener === "function") {
    mediaQuery.addEventListener("change", syncWithSystemTheme);
  } else if (typeof mediaQuery.addListener === "function") {
    mediaQuery.addListener(syncWithSystemTheme);
  }
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
const themeToggleBtn = document.getElementById("themeToggleBtn");

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
    table.innerHTML = `<tr><td colspan="${currentRole === "admin" ? 5 : 6}" class="empty-state">No upcoming bookings yet. Your next meeting will appear here.</td></tr>`;
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
          <td>${escapeHtml(getBookingOrganizerDisplayName(row))}</td>
          <td>${escapeHtml(row.room_name || "-")}</td>
          <td>${date}</td>
          <td>${time}</td>
          <td><span class="status ${statusClass}">${escapeHtml(row.status || "-")}</span></td>
        </tr>
      `;
    })
    .join("");
}

function userCanManageBooking(booking) {
  if (!booking) return false;
  return isAdmin || booking.is_organizer === true;
}

function canManageFutureBooking(booking) {
  const normalizedStatus = String(booking?.status || "").toLowerCase();
  if (normalizedStatus === "cancelled" || normalizedStatus === "vacated") return false;
  if (!userCanManageBooking(booking)) return false;

  const start = parseDateValue(booking?.start_time);
  if (!start) return false;
  return start.getTime() > Date.now();
}

function canVacateOngoingBooking(booking) {
  const normalizedStatus = String(booking?.status || "").toLowerCase();
  if (normalizedStatus === "cancelled" || normalizedStatus === "vacated") return false;
  if (!userCanManageBooking(booking)) return false;

  const start = parseDateValue(booking?.start_time);
  const end = parseDateValue(booking?.end_time);
  if (!start || !end) return false;

  const now = Date.now();
  return start.getTime() <= now && end.getTime() > now;
}

function getBookingActionState(booking) {
  const bookingId = Number(booking?.booking_id);
  if (!bookingId) {
    return { type: "locked", reason: "Booking reference is missing." };
  }

  if (canVacateOngoingBooking(booking)) {
    return { type: "vacate", reason: "This meeting is ongoing and can be vacated now." };
  }

  if (canManageFutureBooking(booking)) {
    return { type: "manage", reason: "Future bookings can be edited or cancelled." };
  }

  const normalizedStatus = String(booking?.status || "").toLowerCase();
  if (normalizedStatus === "cancelled") {
    return { type: "view", reason: "Cancelled bookings are view-only." };
  }
  if (normalizedStatus === "vacated") {
    return { type: "view", reason: "Vacated bookings are view-only." };
  }

  const endTime = parseDateValue(booking?.end_time);
  if (endTime && endTime.getTime() <= Date.now()) {
    return { type: "view", reason: "Completed bookings are view-only." };
  }

  return { type: "view", reason: "Booking details are view-only for invited attendees." };
}

function buildBookingActionsCell(booking) {
  const bookingId = Number(booking?.booking_id);
  const actionState = getBookingActionState(booking);
  const actionReason = escapeHtml(actionState.reason || "Action unavailable.");

  if (actionState.type === "vacate") {
    return `
      <div class="booking-actions">
        <button
          class="btn btn-sm btn-danger"
          type="button"
          data-booking-action="vacate"
          data-booking-id="${bookingId}"
          title="${actionReason}"
        >
          Vacate
        </button>
      </div>
    `;
  }

  if (actionState.type === "manage") {
    return `
      <div class="booking-actions">
        <button
          class="btn btn-sm btn-primary"
          type="button"
          data-booking-action="edit"
          data-booking-id="${bookingId}"
          title="Edit booking details and time."
        >
          Edit
        </button>
        <button
          class="btn btn-sm btn-warning"
          type="button"
          data-booking-action="cancel"
          data-booking-id="${bookingId}"
          title="Cancel this future booking."
        >
          Cancel
        </button>
      </div>
    `;
  }

  if (actionState.type === "view") {
    return `
      <div class="booking-actions">
        <button
          class="btn btn-sm btn-secondary"
          type="button"
          data-booking-action="view"
          data-booking-id="${bookingId}"
          title="${actionReason}"
        >
          View
        </button>
      </div>
    `;
  }

  return `<span class="action-muted" title="${actionReason}">Locked</span>`;
}

function getBookingRoleLabel(booking) {
  return booking?.is_organizer === true ? "Organizer" : "Invited";
}

function getBookingRoleClassName(booking) {
  return booking?.is_organizer === true ? "organizer" : "invited";
}

function getBookingOrganizerDisplayName(booking) {
  if (booking?.is_organizer === true) {
    return "You";
  }

  return booking?.organizer_name || booking?.employee_name || "-";
}

function renderBookingsPage() {
  const table = document.getElementById("bookingsTable");
  if (!table) return;

  const rows = getPaginationSlice("bookings");

  if (!Array.isArray(rows) || rows.length === 0) {
    table.innerHTML = `<tr><td colspan="8" class="empty-state">No bookings found yet. New reservations will appear here.</td></tr>`;
    renderPaginationControls("bookingsPagination", "bookings");
    return;
  }

  table.innerHTML = rows
    .map(row => {
      const statusClass = getStatusClass(row.status);
      const roomText = escapeHtml(row.room_name || "-");
      const locationText = escapeHtml(row.location_name || "-");
      const startText = formatCompactDateTime(row.start_time, row.location_timezone);
      const endText = formatCompactDateTime(row.end_time, row.location_timezone);
      const roleText = escapeHtml(getBookingRoleLabel(row));
      const roleClassName = getBookingRoleClassName(row);
      const organizerText = escapeHtml(getBookingOrganizerDisplayName(row));
      const statusText = escapeHtml(row.status || "-");
      return `
        <tr>
          <td><span class="cell-ellipsis" title="${roomText}">${roomText}</span></td>
          <td><span class="cell-ellipsis" title="${locationText}">${locationText}</span></td>
          <td><span class="cell-nowrap">${startText}</span></td>
          <td><span class="cell-nowrap">${endText}</span></td>
          <td><span class="booking-role-pill ${roleClassName}">${roleText}</span></td>
          <td><span class="cell-ellipsis" title="${organizerText}">${organizerText}</span></td>
          <td><span class="status ${statusClass}">${statusText}</span></td>
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
  const bookingsPagination = document.getElementById("bookingsPagination");

  if (overviewTable) {
    overviewTable.innerHTML = buildTableSkeletonRows(currentRole === "admin" ? 5 : 6, 3);
  }
  if (bookingsTable) {
    bookingsTable.innerHTML = buildTableSkeletonRows(8, 5);
  }
  if (bookingsPagination) {
    bookingsPagination.innerHTML = "";
  }

  try {
    const overviewRows =
      currentRole === "admin"
        ? await apiFetch(buildUpcomingUrl({ limit: 12, includeAll: true }))
        : await apiFetch(buildUpcomingUrl({ limit: 12 }));

    renderOverviewBookings(overviewRows);

    const myRows = await apiFetch(buildMyBookingsUrl(200));
    renderBookingsTable(myRows);
    markOverviewAndBookingsRefreshed(new Date());
  } catch (error) {
    console.error("Failed to load bookings:", error);
    if (overviewTable) {
      overviewTable.innerHTML = `<tr><td colspan="${currentRole === "admin" ? 5 : 6}" class="empty-state">Unable to load bookings right now. Please try refresh.</td></tr>`;
    }
    if (bookingsTable) {
      bookingsTable.innerHTML = `<tr><td colspan="8" class="empty-state">Unable to load your bookings. Please refresh.</td></tr>`;
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

function setRoomFinderMessage(message, type = "") {
  const messageElement = document.getElementById("roomFinderMessage");
  setHelperMessage(messageElement, message, type);
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
    table.innerHTML = `<tr><td colspan="${colSpan}" class="empty-state">No rooms match this slot. Try another time, duration, or location.</td></tr>`;
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

function populateAdminLocationOptions() {
  const locationSelect = document.getElementById("newEmployeeWorkLocation");
  if (!locationSelect) return;

  const selectedValue = String(locationSelect.value || "");
  locationSelect.innerHTML = '<option value="">Select Work Location</option>';

  adminLocationDirectory.forEach(location => {
    const option = document.createElement("option");
    option.value = String(location.location_id);
    option.textContent = location.name;
    locationSelect.appendChild(option);
  });

  if (selectedValue && adminLocationDirectory.some(location => String(location.location_id) === selectedValue)) {
    locationSelect.value = selectedValue;
  }
}

function populateAdminManagerOptions() {
  const managerSelect = document.getElementById("newEmployeeManager");
  if (!managerSelect) return;

  const selectedValue = String(managerSelect.value || "");
  const managerCandidates = adminEmployeeDirectory
    .filter(row => Number(row.employee_id || 0) > 0 && row.is_active !== false)
    .slice()
    .sort((left, right) => String(left.name || "").localeCompare(String(right.name || "")));

  managerSelect.innerHTML = '<option value="">No Manager</option>';
  managerCandidates.forEach(employee => {
    const option = document.createElement("option");
    option.value = String(employee.employee_id);
    option.textContent = `${employee.name || `Employee #${employee.employee_id}`} (${employee.email || "-"})`;
    managerSelect.appendChild(option);
  });

  if (selectedValue && managerCandidates.some(employee => String(employee.employee_id) === selectedValue)) {
    managerSelect.value = selectedValue;
  }
}

async function loadAdminLocations() {
  if (currentRole !== "admin") return;

  try {
    const locations = await apiFetch("/locations", { skipAuth: true });
    adminLocationDirectory = Array.isArray(locations) ? locations : [];
    populateAdminLocationOptions();
  } catch (error) {
    console.error("Failed to load admin location options:", error);
  }
}

function getAdminEmployeeFilterElements() {
  return {
    search: document.getElementById("employeeDirectorySearch"),
    department: document.getElementById("employeeDirectoryDepartmentFilter"),
    role: document.getElementById("employeeDirectoryRoleFilter"),
    location: document.getElementById("employeeDirectoryLocationFilter"),
    access: document.getElementById("employeeDirectoryAccessFilter"),
    status: document.getElementById("employeeDirectoryStatusFilter"),
    summary: document.getElementById("employeeFilterSummary")
  };
}

function getAdminEmployeeFilterValues() {
  const filters = getAdminEmployeeFilterElements();
  return {
    search: String(filters.search?.value || "").trim().toLowerCase(),
    department: String(filters.department?.value || "").trim(),
    role: String(filters.role?.value || "").trim(),
    location: String(filters.location?.value || "").trim(),
    access: String(filters.access?.value || "").trim(),
    status: String(filters.status?.value || "").trim()
  };
}

function hasActiveAdminEmployeeFilters() {
  return Object.values(getAdminEmployeeFilterValues()).some(Boolean);
}

function populateAdminEmployeeFilters() {
  const filters = getAdminEmployeeFilterElements();
  const dynamicSelects = [
    { element: filters.department, field: "department", label: "All Departments" },
    { element: filters.role, field: "role", label: "All Roles" },
    { element: filters.location, field: "work_location_name", label: "All Locations" }
  ];

  dynamicSelects.forEach(({ element, field, label }) => {
    if (!element) return;

    const previousValue = String(element.value || "");
    const uniqueValues = Array.from(
      new Set(
        adminEmployeeDirectory
          .map(row => String(row?.[field] || "").trim())
          .filter(Boolean)
      )
    ).sort((left, right) => left.localeCompare(right));

    element.innerHTML = "";
    const defaultOption = document.createElement("option");
    defaultOption.value = "";
    defaultOption.textContent = label;
    element.appendChild(defaultOption);

    uniqueValues.forEach(value => {
      const option = document.createElement("option");
      option.value = value;
      option.textContent = value;
      element.appendChild(option);
    });

    element.value = uniqueValues.includes(previousValue) ? previousValue : "";
  });
}

function setAdminEmployeeFilterSummary(filteredCount, totalCount) {
  const summaryElement = getAdminEmployeeFilterElements().summary;
  if (!summaryElement) return;

  if (!totalCount) {
    summaryElement.textContent = "No employees available.";
    return;
  }

  if (!hasActiveAdminEmployeeFilters()) {
    summaryElement.textContent = `Showing all ${totalCount} employees.`;
    return;
  }

  summaryElement.textContent = `Showing ${filteredCount} of ${totalCount} employees.`;
}

function applyAdminEmployeeFilters() {
  const filters = getAdminEmployeeFilterValues();
  const filteredRows = adminEmployeeDirectory.filter(row => {
    if (filters.department && String(row.department || "").trim() !== filters.department) {
      return false;
    }

    if (filters.role && String(row.role || "").trim() !== filters.role) {
      return false;
    }

    if (filters.location && String(row.work_location_name || "").trim() !== filters.location) {
      return false;
    }

    if (filters.access === "admin" && row.is_admin !== true) {
      return false;
    }

    if (filters.access === "employee" && row.is_admin === true) {
      return false;
    }

    if (filters.status === "active" && row.is_active === false) {
      return false;
    }

    if (filters.status === "inactive" && row.is_active !== false) {
      return false;
    }

    if (!filters.search) {
      return true;
    }

    const haystack = [
      row.name,
      row.email,
      row.department,
      row.role,
      row.project,
      row.employee_type,
      row.work_location_name,
      row.manager_name,
      row.phone_number,
      row.is_admin ? "admin" : "employee",
      row.is_active === false ? "inactive" : "active"
    ]
      .filter(Boolean)
      .join(" ")
      .toLowerCase();

    return haystack.includes(filters.search);
  });

  setPaginationRows("employees", filteredRows);
  setAdminEmployeeFilterSummary(filteredRows.length, adminEmployeeDirectory.length);
  renderEmployeePage();
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

function normalizeEmployeeOption(employee) {
  if (!employee || typeof employee !== "object") return null;

  const employeeId = Number(employee.employee_id || 0);
  if (!employeeId) return null;

  return {
    employee_id: employeeId,
    name: String(employee.name || "").trim() || `Employee #${employeeId}`,
    email: String(employee.email || "").trim() || "",
    department: String(employee.department || "").trim() || "",
    project: String(employee.project || "").trim() || "",
    role: String(employee.role || "").trim() || "",
    employee_type: String(employee.employee_type || "").trim() || "",
    work_location_id: Number(employee.work_location_id || 0) || null,
    work_location_name: String(employee.work_location_name || "").trim() || "",
    is_available: employee.is_available !== false,
    conflicting_booking_id: Number(employee.conflicting_booking_id || 0) || null,
    conflicting_booking_title: String(employee.conflicting_booking_title || "").trim() || "",
    conflicting_start_time: employee.conflicting_start_time || null,
    conflicting_end_time: employee.conflicting_end_time || null,
    conflicting_organizer_name: String(employee.conflicting_organizer_name || "").trim() || "",
    conflicting_involvement_role: String(employee.conflicting_involvement_role || "").trim() || ""
  };
}

function getParticipantPicker(mode) {
  return participantPickerState[mode] || participantPickerState.create;
}

function getParticipantEmployeeDirectory(mode) {
  return getParticipantPicker(mode).directory || [];
}

function getParticipantPickerAvailabilityWindow(mode) {
  if (mode === "edit") {
    const draftWindow = getBookingEditWindow();
    if (draftWindow?.start && draftWindow?.end) {
      return {
        start: draftWindow.start,
        end: draftWindow.end,
        exclude_booking_id: Number(selectedBooking?.booking_id || 0) || null
      };
    }

    if (selectedBooking?.start_time && selectedBooking?.end_time) {
      return {
        start: selectedBooking.start_time,
        end: selectedBooking.end_time,
        exclude_booking_id: Number(selectedBooking?.booking_id || 0) || null
      };
    }

    return {
      start: null,
      end: null,
      exclude_booking_id: Number(selectedBooking?.booking_id || 0) || null
    };
  }

  const windowValue = selectedBookingWindow || buildFinderWindow() || availabilityWindow || null;
  return {
    start: windowValue?.start || null,
    end: windowValue?.end || null,
    exclude_booking_id: null
  };
}

function buildParticipantDirectoryRequest(mode) {
  const availabilityWindow = getParticipantPickerAvailabilityWindow(mode);
  const params = new URLSearchParams();
  params.set("limit", "500");

  if (availabilityWindow.start && availabilityWindow.end) {
    params.set("start_time", availabilityWindow.start);
    params.set("end_time", availabilityWindow.end);
  }

  if (availabilityWindow.exclude_booking_id) {
    params.set("exclude_booking_id", String(availabilityWindow.exclude_booking_id));
  }

  return {
    key: JSON.stringify({
      mode,
      start_time: availabilityWindow.start || "",
      end_time: availabilityWindow.end || "",
      exclude_booking_id: availabilityWindow.exclude_booking_id || ""
    }),
    path: `/employees/search?${params.toString()}`
  };
}

function buildParticipantConflictHint(employee) {
  if (!employee || employee.is_available !== false) {
    return "";
  }

  const title = employee.conflicting_booking_title ? ` "${employee.conflicting_booking_title}"` : "";
  const organizerName = employee.conflicting_organizer_name ? ` by ${employee.conflicting_organizer_name}` : "";
  return `Unavailable due to another meeting${title}${organizerName}.`;
}

function buildParticipantAvailabilityMessage(mode, issues) {
  if (!Array.isArray(issues) || !issues.length) {
    return "";
  }

  const firstIssue = issues[0];
  const hint = buildParticipantConflictHint(firstIssue.employee);

  if (firstIssue.type === "organizer") {
    const organizerName = getParticipantPickerOrganizerDisplayName(mode);
    if (organizerName === "You") {
      return hint ? `You are not available during this time. ${hint}` : "You are not available during this time.";
    }

    return hint
      ? `${organizerName} is not available during this time. ${hint}`
      : `${organizerName} is not available during this time.`;
  }

  if (issues.length === 1) {
    return hint
      ? `${firstIssue.employee.name} is not available during this time. ${hint}`
      : `${firstIssue.employee.name} is not available during this time.`;
  }

  const names = issues
    .slice(0, 3)
    .map(issue => issue.employee.name)
    .filter(Boolean)
    .join(", ");

  return `Some selected attendees are not available during this time: ${names}.`;
}

async function loadEmployeeDirectory(mode, { force = false } = {}) {
  const picker = getParticipantPicker(mode);
  const request = buildParticipantDirectoryRequest(mode);
  if (!force && picker.directoryKey === request.key && picker.directory.length > 0) {
    return picker.directory;
  }

  const employees = await apiFetch(request.path);
  picker.directory = Array.isArray(employees) ? employees.map(normalizeEmployeeOption).filter(Boolean) : [];
  picker.directoryKey = request.key;
  populateParticipantFilters(mode);
  if (mode === "create") {
    renderRoomModalOrganizerSelection();
  }
  validateParticipantAvailability(mode, { showMessage: true });
  return picker.directory;
}

function setParticipantPickerMessage(mode, message, type = "") {
  const pickerConfig = getParticipantPickerConfig(mode);
  setHelperMessage(pickerConfig?.messageElement, message, type);
}

function getParticipantPickerSelectedIds(mode) {
  return getParticipantPicker(mode).selected.map(employee => Number(employee.employee_id));
}

function getParticipantPickerCapacity(mode) {
  const pickerConfig = getParticipantPickerConfig(mode);
  const rawCapacity = pickerConfig?.getCapacity?.();
  const capacity = Number(rawCapacity || 0);
  return capacity > 0 ? capacity : 0;
}

function getParticipantPickerOrganizerId(mode) {
  const pickerConfig = getParticipantPickerConfig(mode);
  const organizerEmployeeId = Number(pickerConfig?.getOrganizerEmployeeId?.() || currentEmployeeId || 0);
  return organizerEmployeeId > 0 ? organizerEmployeeId : 0;
}

function getParticipantPickerOrganizerDisplayName(mode) {
  const organizerEmployeeId = getParticipantPickerOrganizerId(mode);
  if (!organizerEmployeeId) {
    return "Organizer";
  }

  if (organizerEmployeeId === currentEmployeeId) {
    return "You";
  }

  if (mode === "edit") {
    return selectedBooking?.organizer_name || selectedBooking?.employee_name || `Employee #${organizerEmployeeId}`;
  }

  return getCreateBookingOrganizerOption()?.name || `Employee #${organizerEmployeeId}`;
}

function getParticipantPickerFilterValues(mode) {
  const filterElements = getParticipantPickerConfig(mode)?.filterElements || {};
  return {
    department: String(filterElements.department?.value || "").trim(),
    project: String(filterElements.project?.value || "").trim(),
    role: String(filterElements.role?.value || "").trim(),
    work_location_name: String(filterElements.work_location_name?.value || "").trim()
  };
}

function hasActiveParticipantFilters(mode) {
  return Object.values(getParticipantPickerFilterValues(mode)).some(Boolean);
}

function populateParticipantFilters(mode) {
  const pickerConfig = getParticipantPickerConfig(mode);
  const filterElements = pickerConfig?.filterElements || {};
  if (!Object.keys(filterElements).length) return;
  const employeeDirectory = getParticipantEmployeeDirectory(mode);

  PARTICIPANT_FILTER_FIELDS.forEach(field => {
    const selectElement = filterElements[field.key];
    if (!selectElement) return;

    const previousValue = String(selectElement.value || "");
    const uniqueValues = Array.from(
      new Set(
        employeeDirectory
          .map(employee => String(employee[field.key] || "").trim())
          .filter(Boolean)
      )
    ).sort((left, right) => left.localeCompare(right));

    selectElement.innerHTML = "";
    const defaultOption = document.createElement("option");
    defaultOption.value = "";
    defaultOption.textContent = field.label;
    selectElement.appendChild(defaultOption);

    uniqueValues.forEach(value => {
      const option = document.createElement("option");
      option.value = value;
      option.textContent = value;
      selectElement.appendChild(option);
    });

    selectElement.value = uniqueValues.includes(previousValue) ? previousValue : "";
  });
}

function resetParticipantFilters(mode) {
  const filterElements = getParticipantPickerConfig(mode)?.filterElements || {};
  Object.values(filterElements).forEach(selectElement => {
    if (!selectElement) return;
    selectElement.value = "";
  });
}

function hideParticipantSuggestions(mode) {
  const pickerConfig = getParticipantPickerConfig(mode);
  const suggestionContainer = pickerConfig?.suggestionsElement;
  if (!suggestionContainer) return;

  suggestionContainer.hidden = true;
  suggestionContainer.innerHTML = "";
  getParticipantPicker(mode).suggestions = [];
}

function updateParticipantAttendeeSummary(mode) {
  const pickerConfig = getParticipantPickerConfig(mode);
  const summaryElement = pickerConfig?.summaryElement;
  if (!summaryElement) return;

  const capacity = getParticipantPickerCapacity(mode);
  const selectedCount = getParticipantPicker(mode).selected.length;
  const totalAttendees = 1 + selectedCount;
  const capacityLabel = capacity > 0 ? capacity : "?";
  summaryElement.textContent = `Total attendees: ${totalAttendees} of ${capacityLabel} seats (1 organizer + ${selectedCount} added)`;
}

function renderParticipantChips(mode) {
  const pickerConfig = getParticipantPickerConfig(mode);
  const chipContainer = pickerConfig?.chipsElement;
  if (!chipContainer) return;

  const selectedEmployees = getParticipantPicker(mode).selected;
  const allowRemoval = !(mode === "edit" && bookingEditMode === "view");
  if (!selectedEmployees.length) {
    chipContainer.innerHTML = '<span class="participant-chip-empty">No additional attendees selected.</span>';
    return;
  }

  chipContainer.innerHTML = selectedEmployees
    .map(
      employee => `
        <span class="participant-chip">
          <span class="participant-chip-text">
            <span>${escapeHtml(employee.name)}</span>
            <small>${escapeHtml(employee.email || employee.department || "")}</small>
          </span>
          ${
            allowRemoval
              ? `
                <button
                  class="participant-chip-remove"
                  type="button"
                  data-participant-remove="${mode}"
                  data-employee-id="${employee.employee_id}"
                  aria-label="Remove ${escapeHtml(employee.name)}"
                >
                  &times;
                </button>
              `
              : ""
          }
        </span>
      `
    )
    .join("");
}

function getFilteredParticipantSuggestions(mode, searchTerm) {
  const normalizedSearch = String(searchTerm || "")
    .trim()
    .toLowerCase();
  const selectedIds = new Set(getParticipantPickerSelectedIds(mode));
  const organizerEmployeeId = getParticipantPickerOrganizerId(mode);
  const activeFilters = getParticipantPickerFilterValues(mode);

  return getParticipantEmployeeDirectory(mode)
    .filter(employee => {
      const employeeId = Number(employee.employee_id);
      if (!employeeId || employeeId === organizerEmployeeId || selectedIds.has(employeeId)) {
        return false;
      }

      if (activeFilters.department && employee.department !== activeFilters.department) {
        return false;
      }

      if (activeFilters.project && employee.project !== activeFilters.project) {
        return false;
      }

      if (activeFilters.role && employee.role !== activeFilters.role) {
        return false;
      }

      if (activeFilters.work_location_name && employee.work_location_name !== activeFilters.work_location_name) {
        return false;
      }

      if (!normalizedSearch) {
        return true;
      }

      const haystack =
        `${employee.name} ${employee.email} ${employee.department} ${employee.project} ${employee.role} ${employee.work_location_name}`.toLowerCase();
      return haystack.includes(normalizedSearch);
    })
    .sort((left, right) => {
      if (left.is_available !== right.is_available) {
        return left.is_available === true ? -1 : 1;
      }
      return left.name.localeCompare(right.name);
    })
    .slice(0, 8);
}

function renderParticipantSuggestions(mode) {
  const pickerConfig = getParticipantPickerConfig(mode);
  const suggestionContainer = pickerConfig?.suggestionsElement;
  const searchInput = pickerConfig?.searchInput;
  if (!suggestionContainer || !searchInput || searchInput.disabled) {
    hideParticipantSuggestions(mode);
    return;
  }

  const searchTerm = String(searchInput.value || "").trim();
  if (!searchTerm && !hasActiveParticipantFilters(mode)) {
    hideParticipantSuggestions(mode);
    return;
  }

  const suggestions = getFilteredParticipantSuggestions(mode, searchTerm);
  getParticipantPicker(mode).suggestions = suggestions;

  if (!suggestions.length) {
    hideParticipantSuggestions(mode);
    return;
  }

  suggestionContainer.hidden = false;
  suggestionContainer.innerHTML = suggestions
    .map(
      employee => `
        <button
          class="participant-suggestion ${employee.is_available === false ? "is-unavailable" : "is-available"}"
          type="button"
          data-participant-select="${mode}"
          data-employee-id="${employee.employee_id}"
          ${employee.is_available === false ? "disabled" : ""}
        >
          <strong>${escapeHtml(employee.name)}</strong>
          <span>
            ${escapeHtml(employee.email || "-")}
            ${employee.department ? ` | ${escapeHtml(employee.department)}` : ""}
            ${employee.project ? ` | ${escapeHtml(employee.project)}` : ""}
            ${employee.work_location_name ? ` | ${escapeHtml(employee.work_location_name)}` : ""}
            ${employee.is_available === false ? ` | ${escapeHtml(buildParticipantConflictHint(employee))}` : ""}
          </span>
        </button>
      `
    )
    .join("");
}

function getParticipantAvailabilityIssues(mode, { includeOrganizer = true } = {}) {
  const employeeDirectory = getParticipantEmployeeDirectory(mode);
  const employeeById = new Map(employeeDirectory.map(employee => [Number(employee.employee_id), employee]));
  const issues = [];

  if (includeOrganizer) {
    const organizerEmployeeId = getParticipantPickerOrganizerId(mode);
    const organizer = employeeById.get(organizerEmployeeId);
    if (organizer && organizer.is_available === false) {
      issues.push({ type: "organizer", employee: organizer });
    }
  }

  getParticipantPicker(mode).selected.forEach(selectedEmployee => {
    const employee = employeeById.get(Number(selectedEmployee.employee_id));
    if (employee && employee.is_available === false) {
      issues.push({
        type: "participant",
        employee: {
          ...employee,
          name: selectedEmployee.name || employee.name
        }
      });
    }
  });

  return issues;
}

function validateParticipantAvailability(mode, { showMessage = true } = {}) {
  const issues = getParticipantAvailabilityIssues(mode);
  if (issues.length > 0) {
    if (showMessage) {
      setParticipantPickerMessage(mode, buildParticipantAvailabilityMessage(mode, issues), "error");
    }
    return false;
  }

  if (showMessage) {
    setParticipantPickerMessage(mode, "", "");
  }
  return true;
}

function validateParticipantCapacity(mode) {
  const capacity = getParticipantPickerCapacity(mode);
  if (!capacity) {
    updateParticipantAttendeeSummary(mode);
    return true;
  }

  const totalAttendees = 1 + getParticipantPicker(mode).selected.length;
  updateParticipantAttendeeSummary(mode);

  if (totalAttendees > capacity) {
    setParticipantPickerMessage(mode, `Total attendees cannot exceed room capacity of ${capacity}.`, "error");
    return false;
  }

  return true;
}

function setParticipantSelection(mode, employees) {
  const picker = getParticipantPicker(mode);
  const normalizedEmployees = Array.isArray(employees)
    ? employees.map(normalizeEmployeeOption).filter(Boolean)
    : [];

  picker.selected = normalizedEmployees.filter(
    employee => Number(employee.employee_id) !== getParticipantPickerOrganizerId(mode)
  );

  renderParticipantChips(mode);
  updateParticipantAttendeeSummary(mode);
  renderParticipantSuggestions(mode);
  if (validateParticipantCapacity(mode)) {
    validateParticipantAvailability(mode, { showMessage: true });
  }
}

function addParticipantToPicker(mode, employee) {
  const pickerConfig = getParticipantPickerConfig(mode);
  if (!pickerConfig) return false;

  const normalizedEmployee = normalizeEmployeeOption(employee);
  if (!normalizedEmployee) {
    setParticipantPickerMessage(mode, "Select a valid active employee.", "error");
    return false;
  }

  const picker = getParticipantPicker(mode);
  const organizerEmployeeId = getParticipantPickerOrganizerId(mode);
  if (normalizedEmployee.employee_id === organizerEmployeeId) {
    setParticipantPickerMessage(mode, "Organizer is already included as an attendee.", "error");
    return false;
  }

  if (picker.selected.some(item => Number(item.employee_id) === normalizedEmployee.employee_id)) {
    setParticipantPickerMessage(mode, `${normalizedEmployee.name} is already selected.`, "error");
    return false;
  }

  if (normalizedEmployee.is_available === false) {
    const hint = buildParticipantConflictHint(normalizedEmployee);
    setParticipantPickerMessage(
      mode,
      hint ? `${normalizedEmployee.name} is not available during this time. ${hint}` : `${normalizedEmployee.name} is not available during this time.`,
      "error"
    );
    return false;
  }

  picker.selected = [...picker.selected, normalizedEmployee];
  renderParticipantChips(mode);
  renderParticipantSuggestions(mode);
  const capacityIsValid = validateParticipantCapacity(mode);
  if (!capacityIsValid) {
    picker.selected = picker.selected.filter(item => Number(item.employee_id) !== normalizedEmployee.employee_id);
    renderParticipantChips(mode);
    renderParticipantSuggestions(mode);
    validateParticipantCapacity(mode);
    return false;
  }

  validateParticipantAvailability(mode, { showMessage: true });
  if (pickerConfig.searchInput) {
    pickerConfig.searchInput.value = "";
    pickerConfig.searchInput.focus();
  }
  hideParticipantSuggestions(mode);
  return true;
}

function removeParticipantFromPicker(mode, employeeId) {
  const picker = getParticipantPicker(mode);
  picker.selected = picker.selected.filter(employee => Number(employee.employee_id) !== Number(employeeId));
  renderParticipantChips(mode);
  renderParticipantSuggestions(mode);
  if (validateParticipantCapacity(mode)) {
    validateParticipantAvailability(mode, { showMessage: true });
  }
}

function resolveParticipantCandidate(mode) {
  const pickerConfig = getParticipantPickerConfig(mode);
  const searchInput = pickerConfig?.searchInput;
  if (!searchInput) return null;

  const rawSearch = String(searchInput.value || "").trim().toLowerCase();
  const suggestions = getParticipantPicker(mode).suggestions;
  if (!rawSearch) {
    return suggestions[0] || null;
  }

  return (
    suggestions.find(employee => {
      const exactName = String(employee.name || "").trim().toLowerCase() === rawSearch;
      const exactEmail = String(employee.email || "").trim().toLowerCase() === rawSearch;
      return (exactName || exactEmail) && employee.is_available !== false;
    }) ||
    suggestions.find(employee => employee.is_available !== false) ||
    null
  );
}

async function ensureParticipantDirectory(mode) {
  try {
    await loadEmployeeDirectory(mode);
    return true;
  } catch (error) {
    console.error("Failed to load employees for participant picker:", error);
    setParticipantPickerMessage(mode, error.message || "Unable to load employees right now.", "error");
    return false;
  }
}

async function attemptAddParticipantFromInput(mode) {
  const directoryReady = await ensureParticipantDirectory(mode);
  if (!directoryReady) return;

  const candidate = resolveParticipantCandidate(mode);
  if (!candidate) {
    const firstSuggestion = getParticipantPicker(mode).suggestions[0];
    if (firstSuggestion && firstSuggestion.is_available === false) {
      const hint = buildParticipantConflictHint(firstSuggestion);
      setParticipantPickerMessage(
        mode,
        hint
          ? `${firstSuggestion.name} is not available during this time. ${hint}`
          : `${firstSuggestion.name} is not available during this time.`,
        "error"
      );
    } else {
      setParticipantPickerMessage(mode, "Search and select an available employee to add.", "error");
    }
    return;
  }

  addParticipantToPicker(mode, candidate);
}

function resetParticipantPicker(mode) {
  const pickerConfig = getParticipantPickerConfig(mode);
  const picker = getParticipantPicker(mode);
  picker.selected = [];
  picker.suggestions = [];

  if (pickerConfig?.searchInput) {
    pickerConfig.searchInput.value = "";
  }

  resetParticipantFilters(mode);
  picker.directory = [];
  picker.directoryKey = "";
  populateParticipantFilters(mode);
  renderParticipantChips(mode);
  updateParticipantAttendeeSummary(mode);
  hideParticipantSuggestions(mode);
  setParticipantPickerMessage(mode, "", "");
  if (mode === "create") {
    renderRoomModalOrganizerSelection();
  }
}

function initializeParticipantPicker(mode) {
  const pickerConfig = getParticipantPickerConfig(mode);
  if (!pickerConfig?.searchInput || !pickerConfig.addButton) {
    return;
  }

  pickerConfig.searchInput.addEventListener("focus", async () => {
    const directoryReady = await ensureParticipantDirectory(mode);
    if (!directoryReady) return;
    renderParticipantSuggestions(mode);
  });

  pickerConfig.searchInput.addEventListener("input", async () => {
    const directoryReady = await ensureParticipantDirectory(mode);
    if (!directoryReady) return;
    setParticipantPickerMessage(mode, "", "");
    renderParticipantSuggestions(mode);
  });

  pickerConfig.searchInput.addEventListener("keydown", async event => {
    if (event.key !== "Enter") return;
    event.preventDefault();
    await attemptAddParticipantFromInput(mode);
  });

  pickerConfig.addButton.addEventListener("click", async () => {
    await attemptAddParticipantFromInput(mode);
  });

  Object.values(pickerConfig.filterElements || {}).forEach(selectElement => {
    if (!selectElement) return;
    selectElement.addEventListener("change", async () => {
      const directoryReady = await ensureParticipantDirectory(mode);
      if (!directoryReady) return;
      validateParticipantAvailability(mode, { showMessage: true });
      renderParticipantSuggestions(mode);
    });
  });
}

function syncCreateParticipantsWithOrganizer() {
  setParticipantSelection("create", getParticipantPicker("create").selected);
}

function updateRoomModalOrganizerSummary() {
  if (!roomModalOrganizer) return;
  roomModalOrganizer.textContent = getCreateBookingOrganizerDisplayName();
}

function renderRoomModalOrganizerSelection() {
  if (!roomModalOrganizerField || !roomModalOrganizerSelect) {
    updateRoomModalOrganizerSummary();
    return;
  }

  if (!(currentRole === "admin" && isAdmin)) {
    roomModalOrganizerField.hidden = true;
    roomModalOrganizerSelect.innerHTML = "";
    setRoomModalOrganizerHelp("", "");
    updateRoomModalOrganizerSummary();
    return;
  }

  roomModalOrganizerField.hidden = false;
  const directory = getParticipantEmployeeDirectory("create");
  if (!directory.length) {
    roomModalOrganizerSelect.disabled = true;
    roomModalOrganizerSelect.innerHTML = '<option value="">Loading active employees...</option>';
    setRoomModalOrganizerHelp("Loading active employees...", "");
    updateRoomModalOrganizerSummary();
    return;
  }

  const organizerExists = directory.some(employee => Number(employee.employee_id) === getCreateBookingOrganizerEmployeeId());
  if (!organizerExists) {
    selectedCreateOrganizerId = Number(
      directory.find(employee => Number(employee.employee_id) === Number(currentEmployeeId || 0))?.employee_id ||
        directory[0]?.employee_id ||
        0
    );
  }

  roomModalOrganizerSelect.disabled = false;
  roomModalOrganizerSelect.innerHTML = directory
    .map(employee => {
      const label =
        `${employee.name} (${employee.email || `Employee #${employee.employee_id}`})` +
        (employee.is_available === false ? " - Unavailable" : "");
      return `<option value="${employee.employee_id}">${escapeHtml(label)}</option>`;
    })
    .join("");
  roomModalOrganizerSelect.value = String(getCreateBookingOrganizerEmployeeId());

  const organizer = getCreateBookingOrganizerOption();
  updateRoomModalOrganizerSummary();

  if (organizer?.is_available === false) {
    const hint = buildParticipantConflictHint(organizer);
    setRoomModalOrganizerHelp(
      hint ? `${organizer.name} is not available during this time. ${hint}` : `${organizer.name} is not available during this time.`,
      "error"
    );
    return;
  }

  if (getCreateBookingOrganizerEmployeeId() === currentEmployeeId) {
    setRoomModalOrganizerHelp("This booking will be created under your account.", "");
    return;
  }

  setRoomModalOrganizerHelp(
    organizer?.name ? `This booking will be created for ${organizer.name}.` : "This booking will be created for the selected employee.",
    ""
  );
}

function setCreateBookingOrganizer(employeeId) {
  const nextOrganizerId = Number(employeeId || 0);
  selectedCreateOrganizerId = nextOrganizerId > 0 ? nextOrganizerId : Number(currentEmployeeId || 0);
  updateRoomModalOrganizerSummary();
  renderRoomModalOrganizerSelection();
  syncCreateParticipantsWithOrganizer();
  renderParticipantSuggestions("create");
  validateParticipantAvailability("create", { showMessage: true });
}

function initializeProfileSecurity() {
  const form = document.getElementById("changePasswordForm");
  const messageElement = document.getElementById("changePasswordMessage");
  const currentPasswordInput = document.getElementById("currentPasswordInput");
  const newPasswordInput = document.getElementById("newPasswordInput");
  const confirmPasswordInput = document.getElementById("confirmPasswordInput");
  const passwordRulesList = document.getElementById("passwordRulesList");
  const passwordMatchHint = document.getElementById("passwordMatchHint");

  updatePasswordResetNotice();
  if (!form || !messageElement || !currentPasswordInput || !newPasswordInput || !confirmPasswordInput) {
    return;
  }

  function renderPasswordHints() {
    const newPassword = newPasswordInput.value || "";
    const confirmPassword = confirmPasswordInput.value || "";
    const ruleState = getPasswordRuleState(newPassword);
    const hasPasswordValue = newPassword.length > 0;

    if (passwordRulesList) {
      PASSWORD_RULE_KEYS.forEach(ruleKey => {
        const ruleItem = passwordRulesList.querySelector(`[data-rule="${ruleKey}"]`);
        if (!ruleItem) return;

        const passed = ruleState[ruleKey] === true;
        ruleItem.classList.toggle("is-valid", passed);
        ruleItem.classList.toggle("is-invalid", hasPasswordValue && !passed);
      });
    }

    if (passwordMatchHint) {
      passwordMatchHint.textContent = "";
      passwordMatchHint.classList.remove("success", "error");
      if (!confirmPassword) return;

      if (newPassword === confirmPassword) {
        passwordMatchHint.textContent = "Passwords match.";
        passwordMatchHint.classList.add("success");
      } else {
        passwordMatchHint.textContent = "Passwords do not match.";
        passwordMatchHint.classList.add("error");
      }
    }
  }

  newPasswordInput.addEventListener("input", renderPasswordHints);
  confirmPasswordInput.addEventListener("input", renderPasswordHints);
  renderPasswordHints();

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

    const passwordRuleError = getPasswordRuleError(newPassword);
    if (passwordRuleError) {
      setHelperMessage(messageElement, passwordRuleError, "error");
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
      renderPasswordHints();
    } catch (error) {
      setHelperMessage(messageElement, error.message || "Failed to change password.", "error");
    }
  });
}

function renderEmployeeTable(rows) {
  const table = document.getElementById("employeeAdminTable");
  if (!table) return;

  adminEmployeeDirectory = Array.isArray(rows) ? rows : [];
  populateAdminManagerOptions();
  populateAdminEmployeeFilters();
  applyAdminEmployeeFilters();
}

function getAdminEmployeeManagerLabel(row) {
  const managerId = Number(row?.manager_id || 0);
  if (row?.manager_name) return row.manager_name;
  return managerId > 0 ? `Employee #${managerId}` : "-";
}

function getAdminEmployeeHireDateLabel(value) {
  const parsed = parseDateValue(value);
  if (!parsed) return "-";
  return parsed.toLocaleDateString(undefined, { month: "short", day: "2-digit", year: "numeric" });
}

function getAdminEmployeeStatusLabel(row) {
  const labels = [row?.is_active === false ? "Inactive" : "Active"];
  labels.push(row?.password_reset_required === true ? "Reset Required" : "Password Set");
  return labels.join(" | ");
}

function renderEmployeePage() {
  const table = document.getElementById("employeeAdminTable");
  if (!table) return;

  const rows = getPaginationSlice("employees");
  if (!Array.isArray(rows) || rows.length === 0) {
    const emptyStateMessage =
      adminEmployeeDirectory.length > 0 && hasActiveAdminEmployeeFilters()
        ? "No employees match the selected filters."
        : "No employees found.";
    table.innerHTML = `<tr><td colspan="15" class="empty-state">${emptyStateMessage}</td></tr>`;
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
          <td>${escapeHtml(row.role || "-")}</td>
          <td>${escapeHtml(row.project || "-")}</td>
          <td>${escapeHtml(row.employee_type || "-")}</td>
          <td>${escapeHtml(row.work_location_name || "-")}</td>
          <td>${escapeHtml(getAdminEmployeeManagerLabel(row))}</td>
          <td>${escapeHtml(normalizeGender(row.gender) === "female" ? "Female" : "Male")}</td>
          <td>${escapeHtml(row.phone_number || "-")}</td>
          <td>${escapeHtml(getAdminEmployeeHireDateLabel(row.hire_date))}</td>
          <td>${row.is_admin ? "Admin" : "Employee"}</td>
          <td>${escapeHtml(getAdminEmployeeStatusLabel(row))}</td>
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
  const summaryElement = getAdminEmployeeFilterElements().summary;
  if (!table) return;

  table.innerHTML = `<tr><td colspan="15" class="empty-state">Loading employees...</td></tr>`;
  if (pagination) pagination.innerHTML = "";
  if (summaryElement) summaryElement.textContent = "Loading employees...";

  try {
    const rows = await apiFetch("/admin/employees");
    renderEmployeeTable(rows);
  } catch (error) {
    console.error("Failed to load employees:", error);
    adminEmployeeDirectory = [];
    populateAdminManagerOptions();
    populateAdminEmployeeFilters();
    if (summaryElement) summaryElement.textContent = "Unable to load employees.";
    table.innerHTML = `<tr><td colspan="15" class="empty-state">Failed to load employees.</td></tr>`;
    setPaginationRows("employees", []);
    renderPaginationControls("employeePagination", "employees");
  }
}

const employeeAdminModal = document.getElementById("employee-admin-modal");
const addEmployeeForm = document.getElementById("addEmployeeForm");
const addEmployeeMessage = document.getElementById("addEmployeeMessage");
const openAddEmployeeModalBtn = document.getElementById("openAddEmployeeModalBtn");

function openEmployeeAdminModal(triggerElement = null) {
  if (!employeeAdminModal || !addEmployeeForm) return;

  addEmployeeForm.reset();
  populateAdminLocationOptions();
  populateAdminManagerOptions();
  setHelperMessage(addEmployeeMessage, "", "");
  openManagedModal(employeeAdminModal, triggerElement);
}

function closeEmployeeAdminModal() {
  if (!employeeAdminModal) return;
  closeManagedModal(employeeAdminModal);
}

function initializeAdminSettings() {
  if (currentRole !== "admin") return;

  const refreshBtn = document.getElementById("refreshEmployeesBtn");
  const resetFiltersBtn = document.getElementById("resetEmployeeFiltersBtn");
  const table = document.getElementById("employeeAdminTable");
  const filterElements = getAdminEmployeeFilterElements();

  void loadAdminLocations();

  if (refreshBtn) {
    refreshBtn.addEventListener("click", () => {
      loadEmployees();
    });
  }

  if (openAddEmployeeModalBtn) {
    openAddEmployeeModalBtn.addEventListener("click", () => {
      openEmployeeAdminModal(openAddEmployeeModalBtn);
    });
  }

  if (filterElements.search) {
    filterElements.search.addEventListener("input", () => {
      applyAdminEmployeeFilters();
    });
  }

  [filterElements.department, filterElements.role, filterElements.location, filterElements.access, filterElements.status]
    .filter(Boolean)
    .forEach(selectElement => {
      selectElement.addEventListener("change", () => {
        applyAdminEmployeeFilters();
      });
    });

  if (resetFiltersBtn) {
    resetFiltersBtn.addEventListener("click", () => {
      if (filterElements.search) filterElements.search.value = "";
      if (filterElements.department) filterElements.department.value = "";
      if (filterElements.role) filterElements.role.value = "";
      if (filterElements.location) filterElements.location.value = "";
      if (filterElements.access) filterElements.access.value = "";
      if (filterElements.status) filterElements.status.value = "";
      applyAdminEmployeeFilters();
    });
  }

  if (employeeAdminModal) {
    employeeAdminModal.addEventListener("click", event => {
      if (event.target.matches("[data-close-employee-admin-modal]")) {
        closeEmployeeAdminModal();
      }
    });
  }

  if (addEmployeeForm) {
    addEmployeeForm.addEventListener("submit", async event => {
      event.preventDefault();
      setHelperMessage(addEmployeeMessage, "", "");

      const payload = {
        name: document.getElementById("newEmployeeName")?.value?.trim(),
        email: document.getElementById("newEmployeeEmail")?.value?.trim(),
        department: document.getElementById("newEmployeeDept")?.value?.trim(),
        role: document.getElementById("newEmployeeRole")?.value?.trim(),
        project: document.getElementById("newEmployeeProject")?.value?.trim(),
        employee_type: document.getElementById("newEmployeeType")?.value?.trim(),
        gender: document.getElementById("newEmployeeGender")?.value || "male",
        work_location_id: Number(document.getElementById("newEmployeeWorkLocation")?.value || 0) || null,
        manager_id: Number(document.getElementById("newEmployeeManager")?.value || 0) || null,
        phone_number: document.getElementById("newEmployeePhone")?.value?.trim(),
        hire_date: document.getElementById("newEmployeeHireDate")?.value || null,
        password: document.getElementById("newEmployeePassword")?.value || "",
        is_admin: document.getElementById("newEmployeeAdminAccess")?.value === "true",
        is_active: document.getElementById("newEmployeeActiveStatus")?.value !== "false"
      };

      try {
        await apiFetch("/admin/employees", {
          method: "POST",
          body: JSON.stringify(payload)
        });
        addEmployeeForm.reset();
        populateAdminLocationOptions();
        populateAdminManagerOptions();
        setHelperMessage(addEmployeeMessage, "Employee added successfully. Password reset is required on first sign-in.", "success");
        await loadEmployees();
        window.setTimeout(() => {
          closeEmployeeAdminModal();
        }, 300);
      } catch (error) {
        console.error("Add employee failed:", error);
        setHelperMessage(addEmployeeMessage, error.message, "error");
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
const bookingEditHeading = document.getElementById("booking-edit-title");
const bookingEditOrganizerName = document.getElementById("bookingEditOrganizerName");
const bookingEditAttendeeSummary = document.getElementById("bookingEditAttendeeSummary");
const bookingEditParticipantSearch = document.getElementById("bookingEditParticipantSearch");
const bookingEditParticipantAddBtn = document.getElementById("bookingEditParticipantAddBtn");
const bookingEditParticipantDepartmentFilter = document.getElementById("bookingEditParticipantDepartmentFilter");
const bookingEditParticipantProjectFilter = document.getElementById("bookingEditParticipantProjectFilter");
const bookingEditParticipantRoleFilter = document.getElementById("bookingEditParticipantRoleFilter");
const bookingEditParticipantLocationFilter = document.getElementById("bookingEditParticipantLocationFilter");
const bookingEditParticipantSuggestions = document.getElementById("bookingEditParticipantSuggestions");
const bookingEditParticipantChips = document.getElementById("bookingEditParticipantChips");
const bookingEditParticipantMessage = document.getElementById("bookingEditParticipantMessage");
const bookingEditSubmitButton = bookingEditForm?.querySelector("button[type='submit']");
let bookingEditMode = "edit";

function setBookingEditMessage(message, type = "") {
  setHelperMessage(bookingEditMessage, message, type);
}

function setBookingEditMode(mode = "edit") {
  bookingEditMode = mode === "view" ? "view" : "edit";
  const isViewOnly = bookingEditMode === "view";

  if (bookingEditHeading) {
    bookingEditHeading.textContent = isViewOnly ? "Booking Details" : "Edit Booking";
  }
  if (bookingEditSubmitButton) {
    bookingEditSubmitButton.hidden = isViewOnly;
  }

  [bookingEditTitle, bookingEditDescription, bookingEditDate, bookingEditTime, bookingEditDuration].forEach(field => {
    if (!field) return;
    field.disabled = isViewOnly;
  });

  [bookingEditParticipantSearch, bookingEditParticipantAddBtn].forEach(field => {
    if (!field) return;
    field.disabled = isViewOnly;
  });

  [
    bookingEditParticipantDepartmentFilter,
    bookingEditParticipantProjectFilter,
    bookingEditParticipantRoleFilter,
    bookingEditParticipantLocationFilter
  ].forEach(field => {
    if (!field) return;
    field.disabled = isViewOnly;
  });

  if (isViewOnly) {
    hideParticipantSuggestions("edit");
  }
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
  setBookingEditMode("edit");
  selectedBooking = null;
  if (bookingEditTitle) bookingEditTitle.value = "";
  if (bookingEditDescription) bookingEditDescription.value = "";
  if (bookingEditDate) bookingEditDate.value = "";
  if (bookingEditTime) {
    bookingEditTime.value = "";
    bookingEditTime.removeAttribute("data-time24");
  }
  if (bookingEditOrganizerName) {
    bookingEditOrganizerName.textContent = "-";
  }
  resetParticipantPicker("edit");
  setBookingEditMessage("", "");
}

async function openBookingEditModal(bookingId, { mode = "edit" } = {}) {
  if (!bookingEditModal) return;

  const bookingSummary = bookingsById.get(Number(bookingId));
  if (!bookingSummary) return;

  const resolvedMode = mode === "view" ? "view" : "edit";
  if (resolvedMode === "edit" && !canManageFutureBooking(bookingSummary)) {
    alert("Only future active bookings can be edited.");
    return;
  }

  let booking;
  try {
    const detailResponse = await apiFetch(`/bookings/${Number(bookingId)}`);
    booking = detailResponse?.booking || null;
  } catch (error) {
    console.error("Failed to load booking details:", error);
    alert(error.message || "Unable to load booking details.");
    return;
  }

  if (!booking) {
    alert("Booking details are unavailable.");
    return;
  }

  setBookingEditMode(resolvedMode);
  selectedBooking = booking;
  setBookingEditMessage("", "");
  if (bookingEditOrganizerName) {
    bookingEditOrganizerName.textContent = getBookingOrganizerDisplayName(booking);
  }

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
  setParticipantSelection("edit", booking.participants || []);
  void loadEmployeeDirectory("edit", { force: true })
    .then(() => {
      renderParticipantSuggestions("edit");
    })
    .catch(error => {
      console.error("Failed to preload employees for booking edit:", error);
    });

  if (resolvedMode === "edit") {
    applyBookingEditDateTimeConstraints();
  } else {
    if (bookingEditDate) bookingEditDate.min = "";
    if (bookingEditTime) bookingEditTime.min = "";
    setBookingEditMessage("View-only details for this booking.", "");
  }

  openManagedModal(bookingEditModal);
}

async function saveBookingEdits(event) {
  event.preventDefault();
  if (!selectedBooking) return;

  if (bookingEditMode !== "edit") {
    setBookingEditMessage("This booking is in view-only mode.", "error");
    return;
  }

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

  if (!validateParticipantCapacity("edit")) {
    return;
  }

  const directoryReady = await ensureParticipantDirectory("edit");
  if (!directoryReady || !validateParticipantAvailability("edit", { showMessage: true })) {
    return;
  }

  payload.participant_employee_ids = getParticipantPickerSelectedIds("edit");

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
    bookingEditDate.addEventListener("change", () => {
      applyBookingEditDateTimeConstraints();
      void loadEmployeeDirectory("edit", { force: true })
        .then(() => {
          renderParticipantSuggestions("edit");
        })
        .catch(error => {
          console.error("Failed to refresh employee availability for edit booking:", error);
        });
    });
  }
  if (bookingEditTime) {
    bookingEditTime.addEventListener("focus", applyBookingEditDateTimeConstraints);
    bookingEditTime.addEventListener("change", () => {
      void loadEmployeeDirectory("edit", { force: true })
        .then(() => {
          renderParticipantSuggestions("edit");
        })
        .catch(error => {
          console.error("Failed to refresh employee availability for edit booking:", error);
        });
    });
  }
  if (bookingEditDuration) {
    bookingEditDuration.addEventListener("change", () => {
      void loadEmployeeDirectory("edit", { force: true })
        .then(() => {
          renderParticipantSuggestions("edit");
        })
        .catch(error => {
          console.error("Failed to refresh employee availability for edit booking:", error);
        });
    });
  }
  if (bookingEditForm) {
    bookingEditForm.addEventListener("submit", saveBookingEdits);
  }

  initializeParticipantPicker("edit");
}

const roomModal = document.getElementById("dashboard-room-modal");
const roomModalImage = document.getElementById("dashboard-room-image");
const roomModalTitle = document.getElementById("dashboard-room-title");
const roomModalLocation = document.getElementById("dashboard-room-location");
const roomModalFeatures = document.getElementById("dashboard-room-features");
const roomModalSlot = document.getElementById("dashboard-room-slot");
const roomModalDescription = document.getElementById("dashboard-room-description");
const roomModalOrganizer = document.getElementById("dashboardBookingOrganizer");
const roomModalAttendeeSummary = document.getElementById("dashboardAttendeeSummary");
const roomModalOrganizerField = document.getElementById("dashboardOrganizerField");
const roomModalOrganizerSelect = document.getElementById("dashboardBookingOrganizerSelect");
const roomModalOrganizerHelp = document.getElementById("dashboardBookingOrganizerHelp");
const roomModalMeetingTitle = document.getElementById("dashboardMeetingTitle");
const roomModalMeetingDescription = document.getElementById("dashboardMeetingDescription");
const roomModalParticipantSearch = document.getElementById("dashboardParticipantSearch");
const roomModalParticipantAddBtn = document.getElementById("dashboardParticipantAddBtn");
const roomModalParticipantDepartmentFilter = document.getElementById("dashboardParticipantDepartmentFilter");
const roomModalParticipantProjectFilter = document.getElementById("dashboardParticipantProjectFilter");
const roomModalParticipantRoleFilter = document.getElementById("dashboardParticipantRoleFilter");
const roomModalParticipantLocationFilter = document.getElementById("dashboardParticipantLocationFilter");
const roomModalParticipantSuggestions = document.getElementById("dashboardParticipantSuggestions");
const roomModalParticipantChips = document.getElementById("dashboardParticipantChips");
const roomModalParticipantMessage = document.getElementById("dashboardParticipantMessage");
const roomModalMessage = document.getElementById("dashboard-room-message");
const roomModalBookBtn = document.getElementById("dashboard-room-book-btn");
const roomModalScheduleToggle = document.getElementById("dashboardRoomScheduleToggle");
const roomScheduleModal = document.getElementById("dashboard-room-schedule-modal");
const roomScheduleTitle = document.getElementById("dashboardRoomScheduleTitle");
const roomScheduleMeta = document.getElementById("dashboardRoomScheduleMeta");
const roomScheduleMessage = document.getElementById("dashboardRoomScheduleMessage");
const roomScheduleGrid = document.getElementById("dashboardRoomScheduleGrid");

function getCreateBookingOrganizerEmployeeId() {
  const organizerEmployeeId = Number(selectedCreateOrganizerId || currentEmployeeId || 0);
  return organizerEmployeeId > 0 ? organizerEmployeeId : 0;
}

function getCreateBookingOrganizerOption() {
  const organizerEmployeeId = getCreateBookingOrganizerEmployeeId();
  return (
    getParticipantEmployeeDirectory("create").find(employee => Number(employee.employee_id) === organizerEmployeeId) ||
    null
  );
}

function getCreateBookingOrganizerDisplayName() {
  const organizerEmployeeId = getCreateBookingOrganizerEmployeeId();
  if (!organizerEmployeeId) {
    return "-";
  }

  if (organizerEmployeeId === currentEmployeeId) {
    return currentEmployee?.name || "You";
  }

  return getCreateBookingOrganizerOption()?.name || `Employee #${organizerEmployeeId}`;
}

function getParticipantPickerConfig(mode) {
  if (mode === "edit") {
    return {
      searchInput: bookingEditParticipantSearch,
      addButton: bookingEditParticipantAddBtn,
      suggestionsElement: bookingEditParticipantSuggestions,
      chipsElement: bookingEditParticipantChips,
      messageElement: bookingEditParticipantMessage,
      summaryElement: bookingEditAttendeeSummary,
      filterElements: {
        department: bookingEditParticipantDepartmentFilter,
        project: bookingEditParticipantProjectFilter,
        role: bookingEditParticipantRoleFilter,
        work_location_name: bookingEditParticipantLocationFilter
      },
      getCapacity: () => Number(selectedBooking?.room_capacity || 0),
      getOrganizerEmployeeId: () => Number(selectedBooking?.organizer_employee_id || selectedBooking?.employee_id || 0)
    };
  }

  return {
    searchInput: roomModalParticipantSearch,
    addButton: roomModalParticipantAddBtn,
    suggestionsElement: roomModalParticipantSuggestions,
    chipsElement: roomModalParticipantChips,
    messageElement: roomModalParticipantMessage,
    summaryElement: roomModalAttendeeSummary,
    filterElements: {
      department: roomModalParticipantDepartmentFilter,
      project: roomModalParticipantProjectFilter,
      role: roomModalParticipantRoleFilter,
      work_location_name: roomModalParticipantLocationFilter
    },
    getCapacity: () => Number(selectedRoom?.capacity || 0),
    getOrganizerEmployeeId: getCreateBookingOrganizerEmployeeId
  };
}

function setRoomModalMessage(message, type = "") {
  setHelperMessage(roomModalMessage, message, type);
}

function setRoomModalBookButtonState(isAvailable) {
  if (!roomModalBookBtn) return;
  roomModalBookBtn.hidden = false;
  roomModalBookBtn.disabled = !isAvailable;
  roomModalBookBtn.textContent = isAvailable ? "Book This Room" : "Booked";
}

function setRoomScheduleMessage(message, type = "") {
  setHelperMessage(roomScheduleMessage, message, type);
}

function setRoomModalOrganizerHelp(message, type = "") {
  setHelperMessage(roomModalOrganizerHelp, message, type);
}

function getSlotLabel(windowValue) {
  if (!windowValue?.start || !windowValue?.end) {
    return "Selected Slot: Not set";
  }

  return `Selected Slot: ${formatDateTime(windowValue.start)} - ${formatTime(windowValue.end)}`;
}

function getRoomScheduleDurationMinutes() {
  const finderDuration = document.getElementById("finderDuration")?.value || "";
  const fallbackDuration = getMinutesBetween(selectedBookingWindow?.start, selectedBookingWindow?.end, 60);
  const preferredDuration = getDurationMinutes(finderDuration, fallbackDuration);
  return Math.max(30, preferredDuration);
}

function getRoomScheduleDateRange() {
  const startDate = new Date();
  startDate.setHours(0, 0, 0, 0);

  const endDate = new Date(startDate);
  endDate.setDate(endDate.getDate() + ROOM_SCHEDULE_DAYS);

  return { startDate, endDate };
}

function buildRoomScheduleRequest(roomId) {
  const range = getRoomScheduleDateRange();
  const params = new URLSearchParams({
    start_time: range.startDate.toISOString(),
    end_time: range.endDate.toISOString(),
    days: String(ROOM_SCHEDULE_DAYS)
  });

  return {
    key: JSON.stringify({
      room_id: Number(roomId || 0),
      start_time: params.get("start_time"),
      end_time: params.get("end_time"),
      days: ROOM_SCHEDULE_DAYS
    }),
    path: `/rooms/${Number(roomId || 0)}/schedule?${params.toString()}`
  };
}

function normalizeRoomScheduleBooking(booking) {
  if (!booking || typeof booking !== "object") return null;

  const bookingId = Number(booking.booking_id || 0);
  const startDate = parseDateValue(booking.start_time);
  const endDate = parseDateValue(booking.end_time);
  if (!bookingId || !startDate || !endDate) {
    return null;
  }

  return {
    booking_id: bookingId,
    room_id: Number(booking.room_id || 0),
    title: String(booking.title || "").trim() || "Booked meeting",
    description: String(booking.description || "").trim() || "",
    start_time: startDate.toISOString(),
    end_time: endDate.toISOString(),
    start_ms: startDate.getTime(),
    end_ms: endDate.getTime(),
    organizer_name: String(booking.organizer_name || "").trim() || "Unknown organizer",
    status: String(booking.status || "").trim() || "confirmed"
  };
}

function normalizeRoomSchedulePayload(payload) {
  return {
    room: payload?.room || selectedRoom || null,
    range: payload?.range || null,
    bookings: Array.isArray(payload?.bookings) ? payload.bookings.map(normalizeRoomScheduleBooking).filter(Boolean) : []
  };
}

function getRoomScheduleWorkingWindow(payload) {
  const workdayStart = payload?.range?.workday_start || ROOM_SCHEDULE_DEFAULT_WORKDAY_START;
  const workdayEnd = payload?.range?.workday_end || ROOM_SCHEDULE_DEFAULT_WORKDAY_END;
  const startMinutes = getTimeValueMinutes(workdayStart);
  const endMinutes = getTimeValueMinutes(workdayEnd);

  return {
    startMinutes: startMinutes === null ? 10 * 60 : startMinutes,
    endMinutes: endMinutes === null ? 19 * 60 : endMinutes
  };
}

function getRoomScheduleDayMeta(dayDate) {
  const weekday = dayDate.getDay();
  if (weekday === 0 || weekday === 6) {
    return {
      className: "is-holiday",
      label: "Holiday"
    };
  }

  if (weekday === 1 || weekday === 5) {
    return {
      className: "is-wfh",
      label: "WFH"
    };
  }

  return {
    className: "is-office",
    label: "Office Day"
  };
}

function getRoomScheduleMetaText(payload) {
  const durationMinutes = getRoomScheduleDurationMinutes();
  const scheduleDays = Number(payload?.range?.days || ROOM_SCHEDULE_DAYS) || ROOM_SCHEDULE_DAYS;
  const { startMinutes, endMinutes } = getRoomScheduleWorkingWindow(payload);
  const workdayStart = format24HourAs12Hour(
    `${String(Math.floor(startMinutes / 60)).padStart(2, "0")}:${String(startMinutes % 60).padStart(2, "0")}`
  );
  const workdayEnd = format24HourAs12Hour(
    `${String(Math.floor(endMinutes / 60)).padStart(2, "0")}:${String(endMinutes % 60).padStart(2, "0")}`
  );
  return `Next ${scheduleDays} days | ${workdayStart} - ${workdayEnd} | ${durationMinutes} min slots | ${ROOM_SCHEDULE_TIMEZONE_LABEL}`;
}

function buildRoomScheduleLoadingMarkup(dayCount = ROOM_SCHEDULE_DAYS) {
  return Array.from({ length: dayCount })
    .map(
      () => `
        <article class="room-schedule-day is-loading" aria-hidden="true">
          <div class="room-schedule-day-head">
            <span class="skeleton-line"></span>
            <small class="skeleton-line skeleton-line-sm"></small>
          </div>
          <div class="room-schedule-day-slots">
            <div class="room-schedule-slot is-skeleton"><span class="skeleton-line"></span><small class="skeleton-line skeleton-line-sm"></small></div>
            <div class="room-schedule-slot is-skeleton"><span class="skeleton-line"></span><small class="skeleton-line skeleton-line-sm"></small></div>
            <div class="room-schedule-slot is-skeleton"><span class="skeleton-line"></span><small class="skeleton-line skeleton-line-sm"></small></div>
          </div>
        </article>
      `
    )
    .join("");
}

function isRoomScheduleSlotSelected(slot) {
  return Boolean(
    slot?.start &&
      slot?.end &&
      selectedBookingWindow?.start === slot.start &&
      selectedBookingWindow?.end === slot.end
  );
}

function buildRoomScheduleDayDates() {
  const { startDate } = getRoomScheduleDateRange();
  return Array.from({ length: ROOM_SCHEDULE_DAYS }).map((_, index) => {
    const day = new Date(startDate);
    day.setDate(startDate.getDate() + index);
    return day;
  });
}

function getRoomScheduleConflictBooking(bookings, slotStartMs, slotEndMs) {
  return bookings.find(booking => booking.start_ms < slotEndMs && booking.end_ms > slotStartMs) || null;
}

function buildRoomScheduleSlotsForDay(dayDate, payload) {
  const durationMinutes = getRoomScheduleDurationMinutes();
  const { startMinutes, endMinutes } = getRoomScheduleWorkingWindow(payload);
  const lastStartMinutes = endMinutes - durationMinutes;
  const nowMs = Date.now();

  if (lastStartMinutes < startMinutes) {
    return [];
  }

  const bookings = Array.isArray(payload?.bookings) ? payload.bookings : [];
  const slots = [];

  for (let minute = startMinutes; minute <= lastStartMinutes; minute += ROOM_SCHEDULE_STEP_MINUTES) {
    const slotStart = new Date(dayDate);
    slotStart.setHours(0, 0, 0, 0);
    slotStart.setMinutes(minute);

    const slotEnd = new Date(slotStart.getTime() + durationMinutes * 60 * 1000);
    if (slotStart.getTime() < nowMs) {
      continue;
    }

    const booking = getRoomScheduleConflictBooking(bookings, slotStart.getTime(), slotEnd.getTime());
    slots.push({
      start: slotStart.toISOString(),
      end: slotEnd.toISOString(),
      booking,
      is_available: !booking
    });
  }

  return slots;
}

function buildRoomScheduleSlotMarkup(slot) {
  const slotLabel = escapeHtml(formatTimeRange(slot.start, slot.end, ROOM_SCHEDULE_TIMEZONE));
  const selectedClassName = isRoomScheduleSlotSelected(slot) ? " is-selected" : "";

  if (slot.is_available) {
    return `
      <button
        class="room-schedule-slot available${selectedClassName}"
        type="button"
        data-room-schedule-select="true"
        data-start-time="${escapeHtml(slot.start)}"
        data-end-time="${escapeHtml(slot.end)}"
      >
        <span class="room-schedule-slot-status">Available</span>
        <strong>${slotLabel}</strong>
        <small>Click to use this slot</small>
      </button>
    `;
  }

  const booking = slot.booking || null;
  const title = escapeHtml(booking?.title || "Booked meeting");
  const organizer = escapeHtml(booking?.organizer_name || "Unknown organizer");
  const bookingTime = escapeHtml(formatTimeRange(booking?.start_time, booking?.end_time, ROOM_SCHEDULE_TIMEZONE));

  return `
    <article class="room-schedule-slot booked">
      <span class="room-schedule-slot-status">Booked</span>
      <strong>${slotLabel}</strong>
      <small class="room-schedule-slot-title">${title}</small>
      <small>Organizer: ${organizer}</small>
      <small>Meeting: ${bookingTime}</small>
    </article>
  `;
}

function buildRoomScheduleDayMarkup(dayDate, payload) {
  const slots = buildRoomScheduleSlotsForDay(dayDate, payload);
  const dayMeta = getRoomScheduleDayMeta(dayDate);
  const dayLabel = dayDate.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    timeZone: ROOM_SCHEDULE_TIMEZONE
  });

  return `
    <article class="room-schedule-day ${dayMeta.className}">
      <div class="room-schedule-day-head">
        <strong>${escapeHtml(dayLabel)}</strong>
        <small>${escapeHtml(dayMeta.label)}</small>
      </div>
      <div class="room-schedule-day-slots">
        ${
          slots.length > 0
            ? slots.map(buildRoomScheduleSlotMarkup).join("")
            : '<p class="room-schedule-empty-day">No upcoming working-hour slots.</p>'
        }
      </div>
    </article>
  `;
}

function renderRoomSchedule() {
  if (!roomScheduleGrid || !roomScheduleMeta) return;

  if (roomScheduleState.loading) {
    roomScheduleMeta.textContent = "Loading upcoming room schedule...";
    roomScheduleGrid.innerHTML = buildRoomScheduleLoadingMarkup();
    return;
  }

  roomScheduleMeta.textContent = getRoomScheduleMetaText(roomScheduleState.payload);

  if (!roomScheduleState.payload) {
    roomScheduleGrid.innerHTML = '<div class="empty-state room-schedule-empty">Open the schedule to load the next 7 days.</div>';
    return;
  }

  const dayDates = buildRoomScheduleDayDates();
  roomScheduleGrid.innerHTML = dayDates.map(dayDate => buildRoomScheduleDayMarkup(dayDate, roomScheduleState.payload)).join("");
}

async function loadRoomSchedule({ force = false } = {}) {
  if (!selectedRoom?.room_id) {
    throw new Error("Select a room to view its schedule.");
  }

  const request = buildRoomScheduleRequest(selectedRoom.room_id);
  if (!force && roomScheduleState.requestKey === request.key && roomScheduleState.payload) {
    renderRoomSchedule();
    return roomScheduleState.payload;
  }

  roomScheduleState.loading = true;
  renderRoomSchedule();

  try {
    const payload = await apiFetch(request.path);
    roomScheduleState.payload = normalizeRoomSchedulePayload(payload);
    roomScheduleState.requestKey = request.key;
    renderRoomSchedule();
    return roomScheduleState.payload;
  } finally {
    roomScheduleState.loading = false;
    renderRoomSchedule();
  }
}

function setRoomScheduleOpen(isOpen) {
  roomScheduleState.isOpen = Boolean(isOpen);

  if (roomModalScheduleToggle) {
    roomModalScheduleToggle.setAttribute("aria-expanded", roomScheduleState.isOpen ? "true" : "false");
    roomModalScheduleToggle.textContent = roomScheduleState.isOpen ? "Hide Schedule" : "View Schedule";
  }

  if (!roomScheduleState.isOpen) {
    if (roomScheduleModal && !roomScheduleModal.hidden) {
      closeManagedModal(roomScheduleModal);
      if (roomModal && !roomModal.hidden) {
        activeModalElement = roomModal;
      }
    }
    setRoomScheduleMessage("", "");
    return;
  }

  if (roomScheduleTitle) {
    roomScheduleTitle.textContent = `${selectedRoom?.name || "Room"} Schedule`;
  }

  renderRoomSchedule();
  if (roomScheduleModal) {
    openManagedModal(roomScheduleModal, roomModalScheduleToggle);
  }
  void loadRoomSchedule({ force: false }).catch(error => {
    console.error("Failed to load room schedule:", error);
    roomScheduleState.payload = null;
    roomScheduleState.requestKey = "";
    roomScheduleState.loading = false;
    renderRoomSchedule();
    setRoomScheduleMessage(error.message || "Unable to load room schedule right now.", "error");
  });
}

function resetRoomScheduleState() {
  roomScheduleState.isOpen = false;
  roomScheduleState.loading = false;
  roomScheduleState.requestKey = "";
  roomScheduleState.payload = null;

  if (roomScheduleModal && !roomScheduleModal.hidden) {
    closeManagedModal(roomScheduleModal);
  }

  if (roomModalScheduleToggle) {
    roomModalScheduleToggle.setAttribute("aria-expanded", "false");
    roomModalScheduleToggle.textContent = "View Schedule";
  }

  if (roomScheduleTitle) {
    roomScheduleTitle.textContent = "Room Schedule";
  }

  if (roomScheduleMeta) {
    roomScheduleMeta.textContent = "Next 7 days, upcoming working-hour slots.";
  }

  if (roomScheduleGrid) {
    roomScheduleGrid.innerHTML = "";
  }

  setRoomScheduleMessage("", "");
}

async function applyRoomScheduleSelection(startTime, endTime) {
  const slotStart = parseDateValue(startTime);
  const slotEnd = parseDateValue(endTime);
  const dateInput = document.getElementById("finderDate");
  const timeInput = document.getElementById("finderTime");
  const durationInput = document.getElementById("finderDuration");

  if (!slotStart || !slotEnd || !dateInput || !timeInput || !durationInput) {
    setRoomScheduleMessage("Unable to apply the selected slot.", "error");
    return;
  }

  const durationMinutes = getMinutesBetween(startTime, endTime, getRoomScheduleDurationMinutes());
  dateInput.value = getLocalDateInputValue(slotStart);
  setTimeInputValue(timeInput, getLocalTimeInputValue(slotStart));
  ensureDurationOption(durationInput, durationMinutes);
  durationInput.value = String(durationMinutes);
  applyFinderDateTimeConstraints();

  selectedBookingWindow = buildWindowFromLocalInputs(dateInput.value, getTimeInputValue24(timeInput), durationInput.value);
  if (!selectedBookingWindow) {
    setRoomScheduleMessage("Unable to update the booking form with that slot.", "error");
    return;
  }

  if (roomModalSlot) {
    roomModalSlot.textContent = getSlotLabel(selectedBookingWindow);
  }

  selectedRoom = {
    ...selectedRoom,
    is_available: 1,
    booked_until: null
  };

  setRoomModalBookButtonState(true);
  setRoomModalMessage("Selected slot applied from schedule.", "success");
  setRoomScheduleOpen(false);

  void loadEmployeeDirectory("create", { force: true })
    .then(() => {
      renderParticipantSuggestions("create");
    })
    .catch(error => {
      console.error("Failed to refresh participant availability after schedule selection:", error);
    });

  void searchRooms().catch(error => {
    console.error("Failed to refresh room finder after schedule selection:", error);
  });
}

function openRoomModal(room, bookingWindow) {
  if (!roomModal || !room) return;

  selectedRoom = room;
  selectedBookingWindow = bookingWindow || buildFinderWindow() || availabilityWindow;
  selectedCreateOrganizerId = Number(currentEmployeeId || 0);
  resetRoomScheduleState();

  if (roomModalImage) roomModalImage.src = getRoomImage(room);
  if (roomModalTitle) roomModalTitle.textContent = room.name || "Room";
  if (roomModalLocation) roomModalLocation.textContent = room.location_name || "Unknown location";
  if (roomModalFeatures) roomModalFeatures.textContent = buildRoomFeatures(room);
  if (roomModalSlot) roomModalSlot.textContent = getSlotLabel(selectedBookingWindow);
  if (roomModalDescription) {
    roomModalDescription.textContent = room.description || "No description available for this room.";
  }
  updateRoomModalOrganizerSummary();
  renderRoomModalOrganizerSelection();
  if (roomModalMeetingTitle) {
    roomModalMeetingTitle.value = `Meeting in ${room.name || "Room"}`;
  }
  if (roomModalMeetingDescription) {
    roomModalMeetingDescription.value = "";
  }
  resetParticipantPicker("create");
  updateParticipantAttendeeSummary("create");
  void loadEmployeeDirectory("create", { force: true })
    .then(() => {
      renderParticipantSuggestions("create");
    })
    .catch(error => {
      console.error("Failed to preload employees for room booking:", error);
    });

  const available = isRoomAvailable(room);
  if (!available) {
    setRoomModalMessage(getRoomAvailabilityLabel(room), "error");
  } else {
    setRoomModalMessage("", "");
  }

  setRoomModalBookButtonState(available);

  openManagedModal(roomModal);
}

function closeRoomModal() {
  if (!roomModal) return;
  closeManagedModal(roomModal);
  selectedRoom = null;
  selectedBookingWindow = null;
  selectedCreateOrganizerId = Number(currentEmployeeId || 0);
  if (roomModalMeetingTitle) roomModalMeetingTitle.value = "";
  if (roomModalMeetingDescription) roomModalMeetingDescription.value = "";
  updateRoomModalOrganizerSummary();
  renderRoomModalOrganizerSelection();
  resetRoomScheduleState();
  resetParticipantPicker("create");
  setRoomModalOrganizerHelp("", "");
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

  const organizerEmployeeId = getCreateBookingOrganizerEmployeeId();
  if (!organizerEmployeeId) {
    setRoomModalMessage("Select a valid organizer for this booking.", "error");
    return;
  }

  if (!validateParticipantCapacity("create")) {
    return;
  }

  const directoryReady = await ensureParticipantDirectory("create");
  if (!directoryReady || !validateParticipantAvailability("create", { showMessage: true })) {
    return;
  }

  payload.participant_employee_ids = getParticipantPickerSelectedIds("create");
  payload.employee_id = organizerEmployeeId;

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
  if (roomScheduleModal) {
    roomScheduleModal.addEventListener("click", event => {
      const scheduleSelectButton = event.target.closest("button[data-room-schedule-select][data-start-time][data-end-time]");
      if (scheduleSelectButton) {
        void applyRoomScheduleSelection(
          String(scheduleSelectButton.dataset.startTime || ""),
          String(scheduleSelectButton.dataset.endTime || "")
        );
        return;
      }

      if (event.target.matches("[data-close-room-schedule-modal]")) {
        setRoomScheduleOpen(false);
      }
    });
  }

  document.addEventListener("keydown", event => {
    trapActiveModalFocus(event);

    if (event.key !== "Escape") return;

    if (dashboardSidebar && dashboardSidebar.classList.contains("is-open")) {
      closeSidebarDrawer();
      return;
    }

    if (roomScheduleModal && !roomScheduleModal.hidden) {
      setRoomScheduleOpen(false);
      return;
    }

    if (bookingEditModal && !bookingEditModal.hidden) {
      closeBookingEditModal();
      return;
    }

    if (employeeAdminModal && !employeeAdminModal.hidden) {
      closeEmployeeAdminModal();
      return;
    }

    if (!roomModal.hidden) {
      closeRoomModal();
    }
  });

  if (roomModalBookBtn) {
    roomModalBookBtn.addEventListener("click", bookSelectedRoom);
  }
  if (roomModalOrganizerSelect) {
    roomModalOrganizerSelect.addEventListener("change", () => {
      setCreateBookingOrganizer(roomModalOrganizerSelect.value);
    });
  }
  if (roomModalScheduleToggle) {
    roomModalScheduleToggle.addEventListener("click", () => {
      setRoomScheduleOpen(!roomScheduleState.isOpen);
    });
  }

  initializeParticipantPicker("create");
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
  const clearFinderMessage = () => setRoomFinderMessage("", "");
  dateInput?.addEventListener("change", applyFinderDateTimeConstraints);
  timeInput?.addEventListener("focus", applyFinderDateTimeConstraints);
  dateInput?.addEventListener("change", clearFinderMessage);
  timeInput?.addEventListener("change", clearFinderMessage);
  durationInput?.addEventListener("change", clearFinderMessage);

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
    refreshBookingsBtn.addEventListener("click", async () => {
      refreshBookingsBtn.disabled = true;
      try {
        await refreshBookingViews();
      } finally {
        refreshBookingsBtn.disabled = false;
      }
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
        await openBookingEditModal(bookingId, { mode: "edit" });
        return;
      }
      if (action === "view") {
        await openBookingEditModal(bookingId, { mode: "view" });
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
    const removeButton = event.target.closest("button[data-participant-remove][data-employee-id]");
    if (removeButton) {
      removeParticipantFromPicker(removeButton.dataset.participantRemove || "create", removeButton.dataset.employeeId);
      return;
    }

    const selectButton = event.target.closest("button[data-participant-select][data-employee-id]");
    if (selectButton) {
      const mode = selectButton.dataset.participantSelect || "create";
      const employeeId = Number(selectButton.dataset.employeeId || 0);
      const employee = getParticipantEmployeeDirectory(mode).find(item => Number(item.employee_id) === employeeId);
      if (employee) {
        addParticipantToPicker(mode, employee);
      }
      return;
    }

    if (!event.target.closest(".participant-picker")) {
      hideParticipantSuggestions("create");
      hideParticipantSuggestions("edit");
    }

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

  initializeThemeToggle();
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
