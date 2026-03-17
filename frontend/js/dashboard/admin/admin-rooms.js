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

const roomAdminModal = document.getElementById("room-admin-modal");
const addRoomForm = document.getElementById("addRoomForm");
const addRoomMessage = document.getElementById("addRoomMessage");
const openAddRoomModalBtn = document.getElementById("openAddRoomModalBtn");

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
