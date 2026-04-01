// Manage the home page room detail modal.

let lastRoomModalTrigger = null;

// Open room modal.
function openRoomModal(room, triggerElement = null) {
  if (!roomDetailModal || !room) return;

  lastRoomModalTrigger =
    triggerElement instanceof HTMLElement
      ? triggerElement
      : document.activeElement instanceof HTMLElement
        ? document.activeElement
        : null;

  roomDetailImage.src = getRoomImage(room);
  roomDetailTitle.textContent = room.name || "Meeting Room";
  renderRoomDetailMeta(room);
  renderRoomMediaSummary(room);
  roomDetailDescription.textContent = room.description || "No description available.";
  renderRoomAmenities(roomDetailAmenities, room);
  roomDetailModal.hidden = false;
  focusFirstElementInModal(roomDetailModal);
}

// Close room modal.
function closeRoomModal() {
  if (!roomDetailModal) return;

  roomDetailModal.hidden = true;

  if (lastRoomModalTrigger && lastRoomModalTrigger.isConnected) {
    lastRoomModalTrigger.focus();
  }

  lastRoomModalTrigger = null;
}

// Return top open modal.
function getTopOpenModal() {
  const openModals = [locationMapModal, roomDetailModal].filter(modal => modal && !modal.hidden);
  return openModals.length > 0 ? openModals[openModals.length - 1] : null;
}

if (roomDetailModal) {
  roomDetailModal.addEventListener("click", event => {
    if (event.target.matches("[data-close-modal]")) {
      closeRoomModal();
    }
  });
}

document.addEventListener("keydown", event => {
  const activeModal = getTopOpenModal();
  if (!activeModal) return;

  if (event.key === "Escape") {
    if (activeModal === roomDetailModal) {
      closeRoomModal();
    } else if (activeModal === locationMapModal) {
      closeLocationMapModal();
    }
    return;
  }

  trapModalFocus(activeModal, event);
});
