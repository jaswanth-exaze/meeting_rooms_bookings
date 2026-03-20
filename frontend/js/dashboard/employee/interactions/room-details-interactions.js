function initializeRoomDetailsInteractions() {
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
