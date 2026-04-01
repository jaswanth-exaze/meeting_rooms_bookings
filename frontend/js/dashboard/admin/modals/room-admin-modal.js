// Manage the add room modal for admins.

// Cache the DOM nodes reused throughout this module.
const roomAdminModal = document.getElementById("room-admin-modal");
const addRoomForm = document.getElementById("addRoomForm");
const addRoomMessage = document.getElementById("addRoomMessage");
const openAddRoomModalBtn = document.getElementById("openAddRoomModalBtn");

// Open room admin modal.
function openRoomAdminModal(triggerElement = null) {
  if (!roomAdminModal || !addRoomForm) return;

  addRoomForm.reset();
  populateAdminRoomLocationOptions();
  setHelperMessage(addRoomMessage, "", "");
  openManagedModal(roomAdminModal, triggerElement);
}

// Close room admin modal.
function closeRoomAdminModal() {
  if (!roomAdminModal) return;
  closeManagedModal(roomAdminModal);
}

// Initialize room admin modal handlers.
function initializeRoomAdminModalHandlers() {
  if (!roomAdminModal) return;

  roomAdminModal.addEventListener("click", event => {
    if (event.target.matches("[data-close-room-admin-modal]")) {
      closeRoomAdminModal();
    }
  });
}
