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
  rooms: { rows: [], page: 1, pageSize: 8 },
  reportLocations: { rows: [], page: 1, pageSize: 6 },
  reportUpcoming: { rows: [], page: 1, pageSize: 6 }
};
let adminEmployeeDirectory = [];
let adminRoomDirectory = [];
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

function isAmenityEnabled(value) {
  return value === 1 || value === true || value === "1" || value === "true";
}

function getRoomAmenities(room) {
  return ROOM_AMENITY_DEFINITIONS.filter(amenity => isAmenityEnabled(room?.[amenity.key]));
}

function buildRoomFeatures(room, { limit = null } = {}) {
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
          <td>${escapeHtml(buildRoomFeatures(room, { limit: 3 }))}</td>
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

