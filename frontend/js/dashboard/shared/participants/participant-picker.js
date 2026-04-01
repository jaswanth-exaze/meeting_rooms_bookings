// Manage participant search, filtering, selection, and availability state.

// Return create booking organizer employee ID.
function getCreateBookingOrganizerEmployeeId() {
  const organizerEmployeeId = Number(selectedCreateOrganizerId || currentEmployeeId || 0);
  return organizerEmployeeId > 0 ? organizerEmployeeId : 0;
}

// Return create booking organizer option.
function getCreateBookingOrganizerOption() {
  const organizerEmployeeId = getCreateBookingOrganizerEmployeeId();
  return (
    getParticipantEmployeeDirectory("create").find(employee => Number(employee.employee_id) === organizerEmployeeId) ||
    null
  );
}

// Return create booking organizer display name.
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

// Return participant picker config.
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

// Define shared constants and configuration used by this module.
const PARTICIPANT_FILTER_FIELDS = [
  { key: "department", label: "All Departments" },
  { key: "project", label: "All Projects" },
  { key: "role", label: "All Roles" },
  { key: "work_location_name", label: "All Locations" }
];

// Normalize employee option.
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

// Return participant picker.
function getParticipantPicker(mode) {
  return participantPickerState[mode] || participantPickerState.create;
}

// Return participant employee directory.
function getParticipantEmployeeDirectory(mode) {
  return getParticipantPicker(mode).directory || [];
}

// Return participant picker availability window.
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

// Build participant directory request.
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

// Build participant conflict hint.
function buildParticipantConflictHint(employee) {
  if (!employee || employee.is_available !== false) {
    return "";
  }

  const title = employee.conflicting_booking_title ? ` "${employee.conflicting_booking_title}"` : "";
  const organizerName = employee.conflicting_organizer_name ? ` by ${employee.conflicting_organizer_name}` : "";
  return `Unavailable due to another meeting${title}${organizerName}.`;
}

// Build participant availability message.
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

// Load employee directory.
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

// Set participant picker message.
function setParticipantPickerMessage(mode, message, type = "") {
  const pickerConfig = getParticipantPickerConfig(mode);
  setHelperMessage(pickerConfig?.messageElement, message, type);
}

// Return participant picker selected IDs.
function getParticipantPickerSelectedIds(mode) {
  return getParticipantPicker(mode).selected.map(employee => Number(employee.employee_id));
}

// Return participant picker capacity.
function getParticipantPickerCapacity(mode) {
  const pickerConfig = getParticipantPickerConfig(mode);
  const rawCapacity = pickerConfig?.getCapacity?.();
  const capacity = Number(rawCapacity || 0);
  return capacity > 0 ? capacity : 0;
}

// Return participant picker organizer ID.
function getParticipantPickerOrganizerId(mode) {
  const pickerConfig = getParticipantPickerConfig(mode);
  const organizerEmployeeId = Number(pickerConfig?.getOrganizerEmployeeId?.() || currentEmployeeId || 0);
  return organizerEmployeeId > 0 ? organizerEmployeeId : 0;
}

// Return participant picker organizer display name.
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

// Return participant picker filter values.
function getParticipantPickerFilterValues(mode) {
  const filterElements = getParticipantPickerConfig(mode)?.filterElements || {};
  return {
    department: String(filterElements.department?.value || "").trim(),
    project: String(filterElements.project?.value || "").trim(),
    role: String(filterElements.role?.value || "").trim(),
    work_location_name: String(filterElements.work_location_name?.value || "").trim()
  };
}

// Return whether has active participant filters.
function hasActiveParticipantFilters(mode) {
  return Object.values(getParticipantPickerFilterValues(mode)).some(Boolean);
}

// Populate participant filters.
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

// Reset participant filters.
function resetParticipantFilters(mode) {
  const filterElements = getParticipantPickerConfig(mode)?.filterElements || {};
  Object.values(filterElements).forEach(selectElement => {
    if (!selectElement) return;
    selectElement.value = "";
  });
}

// Hide participant suggestions.
function hideParticipantSuggestions(mode) {
  const pickerConfig = getParticipantPickerConfig(mode);
  const suggestionContainer = pickerConfig?.suggestionsElement;
  if (!suggestionContainer) return;

  suggestionContainer.hidden = true;
  suggestionContainer.innerHTML = "";
  getParticipantPicker(mode).suggestions = [];
}

// Update participant attendee summary.
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

// Render participant chips.
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

// Return filtered participant suggestions.
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

// Render participant suggestions.
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

// Return participant availability issues.
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

// Validate participant availability.
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

// Validate participant capacity.
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

// Set participant selection.
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

// Add participant to picker.
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

// Remove participant from picker.
function removeParticipantFromPicker(mode, employeeId) {
  const picker = getParticipantPicker(mode);
  picker.selected = picker.selected.filter(employee => Number(employee.employee_id) !== Number(employeeId));
  renderParticipantChips(mode);
  renderParticipantSuggestions(mode);
  if (validateParticipantCapacity(mode)) {
    validateParticipantAvailability(mode, { showMessage: true });
  }
}

// Resolve participant candidate.
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

// Ensure participant directory.
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

// Attempt to add participant from input.
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

// Reset participant picker.
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

// Initialize participant picker.
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

// Sync create participants with organizer.
function syncCreateParticipantsWithOrganizer() {
  setParticipantSelection("create", getParticipantPicker("create").selected);
}

// Update room modal organizer summary.
function updateRoomModalOrganizerSummary() {
  if (!roomModalOrganizer) return;
  roomModalOrganizer.textContent = getCreateBookingOrganizerDisplayName();
}

// Render room modal organizer selection.
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

// Set create booking organizer.
function setCreateBookingOrganizer(employeeId) {
  const nextOrganizerId = Number(employeeId || 0);
  selectedCreateOrganizerId = nextOrganizerId > 0 ? nextOrganizerId : Number(currentEmployeeId || 0);
  updateRoomModalOrganizerSummary();
  renderRoomModalOrganizerSelection();
  syncCreateParticipantsWithOrganizer();
  renderParticipantSuggestions("create");
  validateParticipantAvailability("create", { showMessage: true });
}
