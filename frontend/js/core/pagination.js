// Store client-side pagination state and render controls.

// Clamp a numeric value to the provided range.
function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

// Return pagination config.
function getPaginationConfig(key) {
  return paginationState[key] || null;
}

// Set pagination rows.
function setPaginationRows(key, rows) {
  const config = getPaginationConfig(key);
  if (!config) return;
  config.rows = Array.isArray(rows) ? rows : [];
  config.page = 1;
}

// Return pagination total pages.
function getPaginationTotalPages(key) {
  const config = getPaginationConfig(key);
  if (!config) return 1;
  return Math.max(1, Math.ceil(config.rows.length / config.pageSize));
}

// Return pagination slice.
function getPaginationSlice(key) {
  const config = getPaginationConfig(key);
  if (!config) return [];

  const totalPages = getPaginationTotalPages(key);
  config.page = clamp(config.page, 1, totalPages);

  const start = (config.page - 1) * config.pageSize;
  const end = start + config.pageSize;
  return config.rows.slice(start, end);
}

// Render pagination controls.
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
