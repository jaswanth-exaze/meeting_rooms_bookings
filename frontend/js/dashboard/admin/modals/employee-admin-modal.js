const employeeAdminModal = document.getElementById("employee-admin-modal");
const addEmployeeForm = document.getElementById("addEmployeeForm");
const addEmployeeMessage = document.getElementById("addEmployeeMessage");
const openAddEmployeeModalBtn = document.getElementById("openAddEmployeeModalBtn");

function openEmployeeAdminModal(triggerElement = null) {
  if (!employeeAdminModal || !addEmployeeForm) return;

  addEmployeeForm.reset();
  populateAdminLocationOptions();
  populateAdminManagerOptions();
  setHelperMessage(addEmployeeMessage, "", "");
  openManagedModal(employeeAdminModal, triggerElement);
}

function closeEmployeeAdminModal() {
  if (!employeeAdminModal) return;
  closeManagedModal(employeeAdminModal);
}

function initializeEmployeeAdminModalHandlers() {
  if (!employeeAdminModal) return;

  employeeAdminModal.addEventListener("click", event => {
    if (event.target.matches("[data-close-employee-admin-modal]")) {
      closeEmployeeAdminModal();
    }
  });
}
