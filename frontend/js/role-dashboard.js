const API_BASE_URL = "http://localhost:4000/api";

const ROOM_IMAGES_BY_NAME = {
  "think tank": "../assets/think_tank.png",
  fusion: "../assets/fussion.png",
  nexus: "../assets/Nexus.png",
  "cell pod 1": "../assets/cell_pod_1.png",
  "cell pod 2": "../assets/cell_pod_2.png",
  "innovation hub": "../assets/Innovation_Hub.png",
  boardroom: "../assets/Conference_Room_A.png",
  "conference room a": "../assets/Conference_Room_A.png",
  "conference room b": "../assets/Conference_Room_B.png",
  "training room": "../assets/training_room.png"
};

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
let selectedRoom = null;
let selectedBookingWindow = null;
let availabilityWindow = null;

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
  if (!room) return "../assets/image(1).png";
  const normalized = normalizeRoomName(room.name);
  return ROOM_IMAGES_BY_NAME[normalized] || "../assets/image(1).png";
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

  const name = currentEmployee?.name || (currentRole === "admin" ? "Admin" : "Employee");
  if (headerName) headerName.textContent = name;
  if (welcomeHeading) {
    welcomeHeading.textContent = currentRole === "admin" ? `Welcome, ${name}` : `Welcome Back, ${name}`;
  }
}

function setProfileSection() {
  const profileName = document.getElementById("profileName");
  const profileEmail = document.getElementById("profileEmail");
  const profileDepartment = document.getElementById("profileDepartment");
  const profileRole = document.getElementById("profileRole");

  if (profileName) profileName.textContent = currentEmployee?.name || "-";
  if (profileEmail) profileEmail.textContent = currentEmployee?.email || "-";
  if (profileDepartment) profileDepartment.textContent = currentEmployee?.department || "-";
  if (profileRole) profileRole.textContent = isAdmin ? "Admin" : "Employee";
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

function initializeNav() {
  const navLinks = document.querySelectorAll(".side-nav [data-section-target]");
  navLinks.forEach(link => {
    link.addEventListener("click", event => {
      event.preventDefault();
      const targetId = link.dataset.sectionTarget;
      if (targetId) showSection(targetId);
    });
  });

  const jumpTargets = document.querySelectorAll("[data-section-jump]");
  jumpTargets.forEach(element => {
    const goToSection = () => {
      const targetId = element.dataset.sectionJump;
      if (targetId) showSection(targetId);
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

async function loadSummary() {
  try {
    const summary = await apiFetch("/bookings/summary");

    const roomsToday = document.getElementById("summaryRoomsToday");
    const upcoming = document.getElementById("summaryUpcoming");
    const openRequests = document.getElementById("summaryOpenRequests");
    const utilization = document.getElementById("summaryUtilization");

    if (roomsToday) roomsToday.textContent = String(summary.rooms_booked_today ?? 0);
    if (upcoming) upcoming.textContent = String(summary.upcoming_meetings ?? 0);
    if (openRequests) openRequests.textContent = String(summary.open_requests ?? 0);
    if (utilization) utilization.textContent = `${Number(summary.utilization_percent || 0)}%`;
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

function renderBookingsTable(rows) {
  const table = document.getElementById("bookingsTable");
  if (!table) return;

  if (!Array.isArray(rows) || rows.length === 0) {
    table.innerHTML = `<tr><td colspan="6" class="empty-state">No bookings found.</td></tr>`;
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
        </tr>
      `;
    })
    .join("");
}

async function loadBookings() {
  try {
    const overviewRows =
      currentRole === "admin"
        ? await apiFetch(buildUpcomingUrl({ limit: 12, includeAll: true }))
        : await apiFetch(buildUpcomingUrl({ limit: 12 }));

    renderOverviewBookings(overviewRows);

    const myRows = await apiFetch(buildUpcomingUrl({ limit: 30, ownOnly: true }));
    renderBookingsTable(myRows);
  } catch (error) {
    console.error("Failed to load bookings:", error);
  }
}

function buildFinderWindow() {
  const dateInput = document.getElementById("finderDate");
  const timeInput = document.getElementById("finderTime");

  if (!dateInput?.value || !timeInput?.value) return null;

  const start = new Date(`${dateInput.value}T${timeInput.value}`);
  if (Number.isNaN(start.getTime())) return null;

  const end = new Date(start.getTime() + 60 * 60 * 1000);
  return {
    start: start.toISOString(),
    end: end.toISOString()
  };
}

function renderRoomFinderTable(rooms) {
  const table = document.getElementById("roomFinderTable");
  if (!table) return;

  finderRoomsById = new Map();
  (rooms || []).forEach(room => {
    finderRoomsById.set(Number(room.room_id), room);
  });

  const hasAction = currentRole === "employee";

  if (!Array.isArray(rooms) || rooms.length === 0) {
    table.innerHTML = `<tr><td colspan="${hasAction ? 5 : 4}" class="empty-state">No rooms found.</td></tr>`;
    return;
  }

  table.innerHTML = rooms
    .map(room => {
      const roomId = Number(room.room_id);
      const actionCol = hasAction
        ? `<td><button class="btn btn-primary btn-sm" type="button" data-room-id="${roomId}">Details</button></td>`
        : "";

      return `
        <tr class="${hasAction ? "clickable-room" : ""}" ${hasAction ? `data-room-id="${roomId}"` : ""}>
          <td>${escapeHtml(room.name || "-")}</td>
          <td>${escapeHtml(room.location_name || "-")}</td>
          <td>${escapeHtml(room.capacity || "-")}</td>
          <td>${escapeHtml(buildRoomFeatures(room))}</td>
          ${actionCol}
        </tr>
      `;
    })
    .join("");
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

  const showDetailsHint = currentRole === "employee";
  list.innerHTML = rooms
    .slice(0, 5)
    .map(room => {
      const roomId = Number(room.room_id);
      const hints = showDetailsHint ? " | View details" : "";
      const detailAttrs = showDetailsHint
        ? `class="clickable-room" data-room-id="${roomId}" tabindex="0" role="button"`
        : "";

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
  params.set("limit", "20");
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
    limit: "5"
  });

  try {
    const rooms = await apiFetch(`/rooms?${params.toString()}`, { skipAuth: true });
    renderAvailabilityList(rooms);
  } catch (error) {
    console.error("Availability load failed:", error);
    renderAvailabilityList([]);
  }
}

function renderReportTables(rows) {
  const locationTable = document.getElementById("reportLocationTable");
  const upcomingTable = document.getElementById("reportUpcomingTable");
  const upcomingCount = document.getElementById("reportUpcomingCount");
  const pendingCount = document.getElementById("reportPendingCount");
  const topLocation = document.getElementById("reportTopLocation");

  if (!locationTable || !upcomingTable || !upcomingCount || !pendingCount || !topLocation) {
    return;
  }

  if (!Array.isArray(rows) || rows.length === 0) {
    locationTable.innerHTML = `<tr><td colspan="2" class="empty-state">No report data.</td></tr>`;
    upcomingTable.innerHTML = `<tr><td colspan="3" class="empty-state">No report data.</td></tr>`;
    upcomingCount.textContent = "0";
    pendingCount.textContent = "0";
    topLocation.textContent = "-";
    return;
  }

  const locationCounts = new Map();
  rows.forEach(row => {
    const key = row.location_name || "Unknown";
    locationCounts.set(key, (locationCounts.get(key) || 0) + 1);
  });

  const sortedLocations = [...locationCounts.entries()].sort((a, b) => b[1] - a[1]);
  locationTable.innerHTML = sortedLocations
    .slice(0, 8)
    .map(([location, count]) => `<tr><td>${escapeHtml(location)}</td><td>${count}</td></tr>`)
    .join("");

  upcomingTable.innerHTML = rows
    .slice(0, 5)
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

  upcomingCount.textContent = String(rows.length);
  pendingCount.textContent = String(rows.filter(row => String(row.status).toLowerCase() === "pending").length);
  topLocation.textContent = sortedLocations.length > 0 ? sortedLocations[0][0] : "-";
}

async function loadReports() {
  if (currentRole !== "admin") return;

  try {
    const rows = await apiFetch(buildUpcomingUrl({ limit: 50, includeAll: true }));
    renderReportTables(rows);
  } catch (error) {
    console.error("Failed to load reports:", error);
    renderReportTables([]);
  }
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

  if (!Array.isArray(rows) || rows.length === 0) {
    table.innerHTML = `<tr><td colspan="6" class="empty-state">No employees found.</td></tr>`;
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
}

async function loadEmployees() {
  if (currentRole !== "admin") return;

  const table = document.getElementById("employeeAdminTable");
  if (!table) return;

  table.innerHTML = `<tr><td colspan="6" class="empty-state">Loading employees...</td></tr>`;

  try {
    const rows = await apiFetch("/admin/employees");
    renderEmployeeTable(rows);
  } catch (error) {
    console.error("Failed to load employees:", error);
    table.innerHTML = `<tr><td colspan="6" class="empty-state">Failed to load employees.</td></tr>`;
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

const roomModal = document.getElementById("dashboard-room-modal");
const roomModalImage = document.getElementById("dashboard-room-image");
const roomModalTitle = document.getElementById("dashboard-room-title");
const roomModalLocation = document.getElementById("dashboard-room-location");
const roomModalFeatures = document.getElementById("dashboard-room-features");
const roomModalSlot = document.getElementById("dashboard-room-slot");
const roomModalDescription = document.getElementById("dashboard-room-description");
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

  setRoomModalMessage("", "");

  if (roomModalBookBtn) {
    roomModalBookBtn.hidden = currentRole !== "employee";
  }

  roomModal.hidden = false;
}

function closeRoomModal() {
  if (!roomModal) return;
  roomModal.hidden = true;
  selectedRoom = null;
  selectedBookingWindow = null;
}

async function bookSelectedRoom() {
  if (currentRole !== "employee") return;

  setRoomModalMessage("", "");

  if (!selectedRoom) {
    setRoomModalMessage("Select a room first.", "error");
    return;
  }

  const windowValue = selectedBookingWindow || buildFinderWindow() || availabilityWindow;
  if (!windowValue?.start || !windowValue?.end) {
    setRoomModalMessage("Select date and time in Room Finder first.", "error");
    return;
  }

  const payload = {
    room_id: selectedRoom.room_id,
    title: `Meeting in ${selectedRoom.name || "Room"}`,
    start_time: windowValue.start,
    end_time: windowValue.end,
    status: "confirmed"
  };

  if (currentEmployeeId > 0) {
    payload.employee_id = currentEmployeeId;
  }

  try {
    await apiFetch("/bookings", {
      method: "POST",
      body: JSON.stringify(payload)
    });

    setRoomModalMessage("Room booked successfully.", "success");

    await Promise.all([loadSummary(), loadBookings(), loadOverviewAvailability()]);
    await searchRooms();

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
    if (event.key === "Escape" && !roomModal.hidden) {
      closeRoomModal();
    }
  });

  if (roomModalBookBtn) {
    roomModalBookBtn.addEventListener("click", bookSelectedRoom);
  }
}

function initializeRoomDetailsInteractions() {
  if (currentRole !== "employee") return;

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

  form.addEventListener("submit", searchRooms);
}

function initializePageActions() {
  const refreshBookingsBtn = document.getElementById("refreshBookingsBtn");
  if (refreshBookingsBtn) {
    refreshBookingsBtn.addEventListener("click", () => {
      loadBookings();
    });
  }
}

async function initializeDashboard() {
  setTodayLabel();
  setHeaderContent();
  setProfileSection();
  initializeNav();
  initializePageActions();
  initializeRoomFinder();
  initializeRoomModalHandlers();
  initializeRoomDetailsInteractions();
  initializeAdminSettings();

  await Promise.all([loadSummary(), loadBookings(), loadFinderLocations(), loadOverviewAvailability()]);

  if (currentRole === "admin") {
    await Promise.all([loadReports(), loadEmployees()]);
  } else {
    await searchRooms();
  }
}

initializeDashboard();
