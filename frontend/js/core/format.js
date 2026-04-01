// Provide shared formatting helpers for rooms, dates, and bookings.

// Define shared constants and configuration used by this module.
const ROOM_IMAGES_BY_NAME = {
  "cell pod 1": "../assets/images/cell_pod_1.png",
  "cell pod 2": "../assets/images/cell_pod_2.png",
  hubble: "../assets/images/hubble-2-persons.png",
  fusion: "../assets/images/fussion-6-members.png",
  synergy: "../assets/images/synergy-4-members.png",
  nexus: "../assets/images/Nexus-2-persons.png",
  zenith: "../assets/images/zenith-3-persons.png",
  tranquil: "../assets/images/tranquil-5-members.png",
  "think tank": "../assets/images/think_tank.png",
  "innovation hub": "../assets/images/Innovation_Hub.png",
  boardroom: "../assets/images/boardroom-15-members.png",
  pinnacle: "../assets/images/pinnacle-15-members.png",
  "conference room a": "../assets/images/Conference_Room_A.png",
  "conference room b": "../assets/images/Conference_Room_B.png",
  "training room": "../assets/images/training_room.png",
  karoo: "../assets/images/hubble-2-persons.png",
  meerkat: "../assets/images/Nexus-2-persons.png",
  "cape town": "../assets/images/synergy-4-members.png",
  drakensberg: "../assets/images/fussion-6-members.png",
  "table mountain": "../assets/images/fussion-6-members.png"
};

// Define shared constants and configuration used by this module.
const ROOM_AMENITY_DEFINITIONS = Object.freeze([
  { key: "has_projector", label: "Projector", icon: "projector" },
  { key: "has_screen", label: "Display Screen", icon: "screen" },
  { key: "has_webcam", label: "Web Cam", icon: "camera" },
  { key: "has_video_conferencing", label: "Video Conference", icon: "video" },
  { key: "has_tv_set", label: "TV Set", icon: "tv" },
  { key: "has_wifi", label: "WiFi", icon: "wifi" },
  { key: "has_ac", label: "AC", icon: "air" },
  { key: "has_whiteboard", label: "Whiteboard", icon: "whiteboard" },
  { key: "has_power_backup", label: "Power Backup", icon: "battery" }
]);

// Define shared constants and configuration used by this module.
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
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="12" rx="2"></rect><path d="M8 20h8"></path><path d="M12 16v4"></path></svg>'
});

// Define shared constants and configuration used by this module.
const MALE_PROFILE_IMAGE = "../assets/images/male_profile.png";
const FEMALE_PROFILE_IMAGE = "../assets/images/female_profile.png";
const TIMEZONE_CODE_OVERRIDES = Object.freeze({
  "Asia/Kolkata": "IST",
  "Asia/Calcutta": "IST",
  "Africa/Johannesburg": "SAST"
});
// Define shared constants and configuration used by this module.
const BOOKING_PAST_GRACE_MS = 60 * 1000;
const ROOM_AVAILABLE_SOON_MS = 60 * 1000;
const ROOM_SCHEDULE_DAYS = 7;
const ROOM_SCHEDULE_STEP_MINUTES = 30;
const ROOM_SCHEDULE_DEFAULT_WORKDAY_START = "10:00";
const ROOM_SCHEDULE_DEFAULT_WORKDAY_END = "19:00";
const ROOM_SCHEDULE_TIMEZONE = "Asia/Kolkata";
const ROOM_SCHEDULE_TIMEZONE_LABEL = "IST";

// Normalize gender.
function normalizeGender(value) {
  const normalized = String(value || "")
    .trim()
    .toLowerCase();
  if (normalized === "female") return "female";
  return "male";
}

// Return profile image path.
function getProfileImagePath(gender) {
  return normalizeGender(gender) === "female" ? FEMALE_PROFILE_IMAGE : MALE_PROFILE_IMAGE;
}

// Return whether is past beyond grace.
function isPastBeyondGrace(timestamp, graceMs = BOOKING_PAST_GRACE_MS) {
  if (!Number.isFinite(timestamp)) return true;
  return timestamp < Date.now() - graceMs;
}

// Return local date input value.
function getLocalDateInputValue(date = new Date()) {
  const timezoneOffsetMs = date.getTimezoneOffset() * 60 * 1000;
  return new Date(date.getTime() - timezoneOffsetMs).toISOString().slice(0, 10);
}

// Return local time input value.
function getLocalTimeInputValue(date = new Date()) {
  return date.toTimeString().slice(0, 5);
}

// Normalize time value to24.
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

// Format24 hour as12 hour.
function format24HourAs12Hour(value24) {
  const normalized = normalizeTimeValueTo24(value24);
  if (!normalized) return "";

  const [hoursRaw, minutes] = normalized.split(":");
  const hours = Number.parseInt(hoursRaw, 10);
  const period = hours >= 12 ? "PM" : "AM";
  const hours12 = ((hours + 11) % 12) + 1;
  return `${String(hours12).padStart(2, "0")}:${minutes} ${period}`;
}

// Return time input value24.
function getTimeInputValue24(inputElement) {
  if (!inputElement) return null;
  const dataTime24 = inputElement.getAttribute("data-time24");
  return normalizeTimeValueTo24(dataTime24 || inputElement.value);
}

// Set time input value.
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

// Return time value minutes.
function getTimeValueMinutes(value) {
  const normalized = normalizeTimeValueTo24(value);
  if (!normalized) return null;

  const [hours, minutes] = normalized.split(":").map(part => Number.parseInt(part, 10));
  if (!Number.isFinite(hours) || !Number.isFinite(minutes)) return null;
  return hours * 60 + minutes;
}

// Normalize time zone.
function normalizeTimeZone(value) {
  const normalized = String(value || "").trim();
  return normalized || null;
}

// Return time zone code.
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

// Format date.
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

// Format time.
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

// Format date time.
function formatDateTime(value, timeZone, options = {}) {
  if (!value) return "-";
  return `${formatDate(value, timeZone)} ${formatTime(value, timeZone, options)}`;
}

// Format compact date time.
function formatCompactDateTime(value, timeZone) {
  if (!value) return "-";
  const dateText = formatDate(value, timeZone);
  const shortDate = dateText.replace(/,\s*\d{4}$/, "");
  return `${shortDate} ${formatTime(value, timeZone)}`;
}

// Format time range.
function formatTimeRange(startValue, endValue, timeZone) {
  const startText = formatTime(startValue, timeZone, { includeTimeZone: false });
  const endText = formatTime(endValue, timeZone, { includeTimeZone: false });
  if (startText === "-" || endText === "-") return "-";

  const referenceDate = parseDateValue(startValue) || parseDateValue(endValue) || new Date();
  return `${startText} - ${endText} ${getTimeZoneCode(referenceDate, timeZone)}`;
}

// Return status class.
function getStatusClass(status) {
  const normalized = String(status || "").toLowerCase();
  if (normalized === "confirmed") return "confirmed";
  if (normalized === "pending") return "pending";
  if (normalized === "cancelled") return "cancelled";
  if (normalized === "vacated") return "vacated";
  return "";
}

// Format refresh stamp.
function formatRefreshStamp(date = new Date()) {
  const resolvedZone = Intl.DateTimeFormat().resolvedOptions().timeZone || "";
  return formatTime(date.toISOString(), resolvedZone);
}

// Return duration minutes.
function getDurationMinutes(value, fallback = 60) {
  const parsed = Number.parseInt(value, 10);
  if (!Number.isFinite(parsed) || parsed <= 0) return fallback;
  return parsed;
}

// Parse date value.
function parseDateValue(value) {
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return null;
  return parsed;
}

// To local date input value.
function toLocalDateInputValue(value) {
  const parsed = parseDateValue(value);
  if (!parsed) return "";
  const timezoneOffsetMs = parsed.getTimezoneOffset() * 60 * 1000;
  return new Date(parsed.getTime() - timezoneOffsetMs).toISOString().slice(0, 10);
}

// To local time input value.
function toLocalTimeInputValue(value) {
  const parsed = parseDateValue(value);
  if (!parsed) return "";
  return parsed.toTimeString().slice(0, 5);
}

// Return minutes between.
function getMinutesBetween(startValue, endValue, fallback = 60) {
  const start = parseDateValue(startValue);
  const end = parseDateValue(endValue);
  if (!start || !end) return fallback;
  const diff = Math.round((end.getTime() - start.getTime()) / (60 * 1000));
  return diff > 0 ? diff : fallback;
}

// Build window from local inputs.
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

// Ensure duration option.
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

// Escape HTML.
function escapeHtml(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

// Normalize room name.
function normalizeRoomName(roomName) {
  return String(roomName || "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, " ");
}

// Return room image.
function getRoomImage(room) {
  if (!room) return "../assets/images/image(3).png";
  const normalized = normalizeRoomName(room.name);
  return ROOM_IMAGES_BY_NAME[normalized] || "../assets/images/image(3).png";
}

// Return whether is amenity enabled.
function isAmenityEnabled(value) {
  return value === 1 || value === true || value === "1" || value === "true";
}

// Return room amenities.
function getRoomAmenities(room) {
  return ROOM_AMENITY_DEFINITIONS.filter(amenity => isAmenityEnabled(room?.[amenity.key]));
}

// Build room features.
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

// Create amenity icon.
function createAmenityIcon(iconKey) {
  const iconElement = document.createElement("span");
  iconElement.className = "room-amenity-icon";
  iconElement.setAttribute("aria-hidden", "true");
  iconElement.innerHTML = ROOM_AMENITY_ICON_MARKUP[iconKey] || ROOM_AMENITY_ICON_MARKUP.default;
  return iconElement;
}

// Render room amenities.
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

// Return whether is room available.
function isRoomAvailable(room) {
  return room?.is_available === 1 || room?.is_available === true || room?.is_available === "1";
}

// Return room availability label.
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

// Return room purpose text.
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

// Return room setup text.
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

// Return room comfort text.
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
