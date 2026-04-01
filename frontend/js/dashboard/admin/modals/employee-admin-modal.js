// Manage the add employee modal for admins.

// Cache the DOM nodes reused throughout this module.
const employeeAdminModal = document.getElementById("employee-admin-modal");
const addEmployeeForm = document.getElementById("addEmployeeForm");
const addEmployeeMessage = document.getElementById("addEmployeeMessage");
const openAddEmployeeModalBtn = document.getElementById("openAddEmployeeModalBtn");

// Open employee admin modal.
function openEmployeeAdminModal(triggerElement = null) {
  if (!employeeAdminModal || !addEmployeeForm) return;

  addEmployeeForm.reset();
  populateAdminLocationOptions();
  populateAdminManagerOptions();
  setHelperMessage(addEmployeeMessage, "", "");
  openManagedModal(employeeAdminModal, triggerElement);
}

// Close employee admin modal.
function closeEmployeeAdminModal() {
  if (!employeeAdminModal) return;
  closeManagedModal(employeeAdminModal);
}

// Initialize employee admin modal handlers.
function initializeEmployeeAdminModalHandlers() {
  if (!employeeAdminModal) return;

  employeeAdminModal.addEventListener("click", event => {
    if (event.target.matches("[data-close-employee-admin-modal]")) {
      closeEmployeeAdminModal();
    }
  });
}
