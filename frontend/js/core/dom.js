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

function setHelperMessage(element, message, type = "") {
  if (!element) return;
  element.textContent = message;
  element.classList.remove("success", "error");
  if (type) element.classList.add(type);
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
