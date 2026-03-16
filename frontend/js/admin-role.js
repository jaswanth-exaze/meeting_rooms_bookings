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

function populateAdminRoomLocationOptions() {
  const locationSelect = document.getElementById("newRoomLocation");
  if (!locationSelect) return;

  const selectedValue = String(locationSelect.value || "");
  locationSelect.innerHTML = '<option value="">Select Location</option>';

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

function populateAdminRoomFilters() {
  const locationFilter = document.getElementById("roomDirectoryLocationFilter");
  if (!locationFilter) return;

  const selectedValue = String(locationFilter.value || "");
  locationFilter.innerHTML = '<option value="">All Locations</option>';

  adminLocationDirectory.forEach(location => {
    const option = document.createElement("option");
    option.value = String(location.location_id);
    option.textContent = location.name;
    locationFilter.appendChild(option);
  });

  if (selectedValue && adminLocationDirectory.some(location => String(location.location_id) === selectedValue)) {
    locationFilter.value = selectedValue;
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
    populateAdminRoomLocationOptions();
    populateAdminRoomFilters();
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

function getAdminRoomFilterElements() {
  return {
    search: document.getElementById("roomDirectorySearch"),
    location: document.getElementById("roomDirectoryLocationFilter"),
    summary: document.getElementById("roomFilterSummary")
  };
}

function getAdminRoomFilterValues() {
  const filters = getAdminRoomFilterElements();
  return {
    search: String(filters.search?.value || "").trim().toLowerCase(),
    location: String(filters.location?.value || "").trim()
  };
}

function hasActiveAdminRoomFilters() {
  return Object.values(getAdminRoomFilterValues()).some(Boolean);
}

function setAdminRoomFilterSummary(filteredCount, totalCount) {
  const summaryElement = getAdminRoomFilterElements().summary;
  if (!summaryElement) return;

  if (!totalCount) {
    summaryElement.textContent = "No rooms available.";
    return;
  }

  if (!hasActiveAdminRoomFilters()) {
    summaryElement.textContent = `Showing all ${totalCount} rooms.`;
    return;
  }

  summaryElement.textContent = `Showing ${filteredCount} of ${totalCount} rooms.`;
}

function applyAdminRoomFilters() {
  const filters = getAdminRoomFilterValues();
  const filteredRows = adminRoomDirectory.filter(row => {
    if (filters.location && String(row.location_id || "") !== filters.location) {
      return false;
    }

    if (!filters.search) {
      return true;
    }

    const haystack = [row.name, row.location_name, row.description]
      .filter(Boolean)
      .join(" ")
      .toLowerCase();

    return haystack.includes(filters.search);
  });

  setPaginationRows("rooms", filteredRows);
  setAdminRoomFilterSummary(filteredRows.length, adminRoomDirectory.length);
  renderRoomPage();
}

function getRoomSizeLabel(sizeSqft) {
  const parsed = Number(sizeSqft);
  if (!Number.isFinite(parsed) || parsed <= 0) return "-";
  return `${Math.round(parsed)} sq ft`;
}

function renderRoomPage() {
  const table = document.getElementById("roomAdminTable");
  if (!table) return;

  const rows = getPaginationSlice("rooms");
  if (!Array.isArray(rows) || rows.length === 0) {
    const emptyStateMessage =
      adminRoomDirectory.length > 0 && hasActiveAdminRoomFilters()
        ? "No rooms match the selected filters."
        : "No rooms found.";
    table.innerHTML = `<tr><td colspan="7" class="empty-state">${emptyStateMessage}</td></tr>`;
    renderPaginationControls("roomPagination", "rooms");
    return;
  }

  table.innerHTML = rows
    .map(row => {
      return `
        <tr>
          <td>${escapeHtml(row.room_id)}</td>
          <td>${escapeHtml(row.name || "-")}</td>
          <td>${escapeHtml(row.location_name || "-")}</td>
          <td>${escapeHtml(row.capacity || "-")}</td>
          <td>${escapeHtml(getRoomSizeLabel(row.size_sqft))}</td>
          <td>${escapeHtml(buildRoomFeatures(row, { limit: 4 }))}</td>
          <td>${escapeHtml(row.description || "-")}</td>
        </tr>
      `;
    })
    .join("");

  renderPaginationControls("roomPagination", "rooms");
}

function renderRoomTable(rows) {
  const table = document.getElementById("roomAdminTable");
  if (!table) return;

  adminRoomDirectory = Array.isArray(rows) ? rows : [];
  populateAdminRoomFilters();
  applyAdminRoomFilters();
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

async function loadRooms() {
  if (currentRole !== "admin") return;

  const table = document.getElementById("roomAdminTable");
  const pagination = document.getElementById("roomPagination");
  const summaryElement = getAdminRoomFilterElements().summary;
  if (!table) return;

  table.innerHTML = `<tr><td colspan="7" class="empty-state">Loading rooms...</td></tr>`;
  if (pagination) pagination.innerHTML = "";
  if (summaryElement) summaryElement.textContent = "Loading rooms...";

  try {
    const rows = await apiFetch("/admin/rooms");
    renderRoomTable(rows);
  } catch (error) {
    console.error("Failed to load rooms:", error);
    adminRoomDirectory = [];
    populateAdminRoomFilters();
    if (summaryElement) summaryElement.textContent = "Unable to load rooms.";
    table.innerHTML = `<tr><td colspan="7" class="empty-state">Failed to load rooms.</td></tr>`;
    setPaginationRows("rooms", []);
    renderPaginationControls("roomPagination", "rooms");
  }
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
const roomAdminModal = document.getElementById("room-admin-modal");
const addRoomForm = document.getElementById("addRoomForm");
const addRoomMessage = document.getElementById("addRoomMessage");
const openAddRoomModalBtn = document.getElementById("openAddRoomModalBtn");

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

function openRoomAdminModal(triggerElement = null) {
  if (!roomAdminModal || !addRoomForm) return;

  addRoomForm.reset();
  populateAdminRoomLocationOptions();
  setHelperMessage(addRoomMessage, "", "");
  openManagedModal(roomAdminModal, triggerElement);
}

function closeRoomAdminModal() {
  if (!roomAdminModal) return;
  closeManagedModal(roomAdminModal);
}

function initializeAdminSettings() {
  if (currentRole !== "admin") return;

  const refreshBtn = document.getElementById("refreshEmployeesBtn");
  const resetFiltersBtn = document.getElementById("resetEmployeeFiltersBtn");
  const table = document.getElementById("employeeAdminTable");
  const filterElements = getAdminEmployeeFilterElements();
  const refreshRoomsBtn = document.getElementById("refreshRoomsBtn");
  const resetRoomFiltersBtn = document.getElementById("resetRoomFiltersBtn");
  const roomFilterElements = getAdminRoomFilterElements();

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

  if (refreshRoomsBtn) {
    refreshRoomsBtn.addEventListener("click", () => {
      loadRooms();
    });
  }

  if (openAddRoomModalBtn) {
    openAddRoomModalBtn.addEventListener("click", () => {
      openRoomAdminModal(openAddRoomModalBtn);
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

  if (roomFilterElements.search) {
    roomFilterElements.search.addEventListener("input", () => {
      applyAdminRoomFilters();
    });
  }

  if (roomFilterElements.location) {
    roomFilterElements.location.addEventListener("change", () => {
      applyAdminRoomFilters();
    });
  }

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

  if (resetRoomFiltersBtn) {
    resetRoomFiltersBtn.addEventListener("click", () => {
      if (roomFilterElements.search) roomFilterElements.search.value = "";
      if (roomFilterElements.location) roomFilterElements.location.value = "";
      applyAdminRoomFilters();
    });
  }

  if (employeeAdminModal) {
    employeeAdminModal.addEventListener("click", event => {
      if (event.target.matches("[data-close-employee-admin-modal]")) {
        closeEmployeeAdminModal();
      }
    });
  }

  if (roomAdminModal) {
    roomAdminModal.addEventListener("click", event => {
      if (event.target.matches("[data-close-room-admin-modal]")) {
        closeRoomAdminModal();
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

  if (addRoomForm) {
    addRoomForm.addEventListener("submit", async event => {
      event.preventDefault();
      setHelperMessage(addRoomMessage, "", "");

      const payload = {
        name: document.getElementById("newRoomName")?.value?.trim(),
        location_id: Number(document.getElementById("newRoomLocation")?.value || 0) || null,
        capacity: Number(document.getElementById("newRoomCapacity")?.value || 0) || null,
        size_sqft: document.getElementById("newRoomSize")?.value?.trim() || null,
        description: document.getElementById("newRoomDescription")?.value?.trim() || null,
        has_projector: document.getElementById("newRoomProjector")?.checked === true,
        has_screen: document.getElementById("newRoomScreen")?.checked === true,
        has_whiteboard: document.getElementById("newRoomWhiteboard")?.checked === true,
        has_webcam: document.getElementById("newRoomWebcam")?.checked === true,
        has_video_conferencing: document.getElementById("newRoomVideoConferencing")?.checked === true,
        has_tv_set: document.getElementById("newRoomTvSet")?.checked === true,
        has_wifi: document.getElementById("newRoomWifi")?.checked === true,
        has_ac: document.getElementById("newRoomAc")?.checked === true,
        has_power_backup: document.getElementById("newRoomPowerBackup")?.checked === true
      };

      if (!payload.name || !payload.location_id || !payload.capacity) {
        setHelperMessage(addRoomMessage, "Please provide room name, location, and capacity.", "error");
        return;
      }

      try {
        await apiFetch("/admin/rooms", {
          method: "POST",
          body: JSON.stringify(payload)
        });
        addRoomForm.reset();
        populateAdminRoomLocationOptions();
        setHelperMessage(addRoomMessage, "Meeting room added successfully.", "success");
        await loadRooms();
        window.setTimeout(() => {
          closeRoomAdminModal();
        }, 300);
      } catch (error) {
        console.error("Add room failed:", error);
        setHelperMessage(addRoomMessage, error.message, "error");
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

