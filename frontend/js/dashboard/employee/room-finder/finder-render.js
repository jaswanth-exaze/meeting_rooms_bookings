function renderRoomFinderTable(rooms) {
  const table = document.getElementById("roomFinderTable");
  if (!table) return;

  finderRoomsById = new Map();
  (rooms || []).forEach(room => {
    finderRoomsById.set(Number(room.room_id), room);
  });

  setPaginationRows("roomFinder", rooms);
  renderRoomFinderPage();
}

function renderRoomFinderPage() {
  const table = document.getElementById("roomFinderTable");
  if (!table) return;

  const rooms = getPaginationSlice("roomFinder");
  const colSpan = 6;

  if (!Array.isArray(rooms) || rooms.length === 0) {
    table.innerHTML = `<tr><td colspan="${colSpan}" class="empty-state">No rooms match this slot. Try another time, duration, or location.</td></tr>`;
    renderPaginationControls("roomFinderPagination", "roomFinder");
    return;
  }

  table.innerHTML = rooms
    .map(room => {
      const roomId = Number(room.room_id);
      const available = isRoomAvailable(room);
      const availabilityText = getRoomAvailabilityLabel(room);
      const actionCol = `<td><button class="btn btn-primary btn-sm" type="button" data-room-id="${roomId}">Details</button></td>`;

      return `
        <tr class="clickable-room" data-room-id="${roomId}">
          <td>${escapeHtml(room.name || "-")}</td>
          <td>${escapeHtml(room.location_name || "-")}</td>
          <td>${escapeHtml(room.capacity || "-")}</td>
          <td><span class="availability-pill ${available ? "available" : "booked"}">${escapeHtml(availabilityText)}</span></td>
          <td>${escapeHtml(buildRoomFeatures(room, { limit: 3 }))}</td>
          ${actionCol}
        </tr>
      `;
    })
    .join("");

  renderPaginationControls("roomFinderPagination", "roomFinder");
}
