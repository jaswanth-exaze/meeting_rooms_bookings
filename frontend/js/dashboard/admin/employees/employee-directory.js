// Load, filter, and render the admin employee directory.

// Populate admin location options.
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

// Populate admin manager options.
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

// Load admin locations.
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

// Return admin employee filter elements.
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

// Return admin employee filter values.
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

// Return whether has active admin employee filters.
function hasActiveAdminEmployeeFilters() {
  return Object.values(getAdminEmployeeFilterValues()).some(Boolean);
}

// Populate admin employee filters.
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

// Set admin employee filter summary.
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

// Apply admin employee filters.
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

// Render employee table.
function renderEmployeeTable(rows) {
  const table = document.getElementById("employeeAdminTable");
  if (!table) return;

  adminEmployeeDirectory = Array.isArray(rows) ? rows : [];
  populateAdminManagerOptions();
  populateAdminEmployeeFilters();
  applyAdminEmployeeFilters();
}

// Return admin employee manager label.
function getAdminEmployeeManagerLabel(row) {
  const managerId = Number(row?.manager_id || 0);
  if (row?.manager_name) return row.manager_name;
  return managerId > 0 ? `Employee #${managerId}` : "-";
}

// Return admin employee hire date label.
function getAdminEmployeeHireDateLabel(value) {
  const parsed = parseDateValue(value);
  if (!parsed) return "-";
  return parsed.toLocaleDateString(undefined, { month: "short", day: "2-digit", year: "numeric" });
}

// Return admin employee status label.
function getAdminEmployeeStatusLabel(row) {
  const labels = [row?.is_active === false ? "Inactive" : "Active"];
  labels.push(row?.password_reset_required === true ? "Reset Required" : "Password Set");
  return labels.join(" | ");
}

// Render employee page.
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

// Load employees.
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

// Initialize admin settings.
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
