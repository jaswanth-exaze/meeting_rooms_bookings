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
