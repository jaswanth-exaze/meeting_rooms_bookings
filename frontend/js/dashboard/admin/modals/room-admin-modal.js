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

function initializeRoomAdminModalHandlers() {
  if (!roomAdminModal) return;

  roomAdminModal.addEventListener("click", event => {
    if (event.target.matches("[data-close-room-admin-modal]")) {
      closeRoomAdminModal();
    }
  });
}
