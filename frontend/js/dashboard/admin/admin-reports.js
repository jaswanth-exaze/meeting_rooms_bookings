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
