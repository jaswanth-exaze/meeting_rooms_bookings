// Provide shared modal open, close, and focus management.

// Define shared constants and configuration used by this module.
const MODAL_FOCUSABLE_SELECTOR = [
  "a[href]",
  "button:not([disabled])",
  "textarea:not([disabled])",
  "input:not([disabled]):not([type='hidden'])",
  "select:not([disabled])",
  "[tabindex]:not([tabindex='-1'])"
].join(", ");
let activeModalElement = null;
let lastModalTriggerElement = null;

// Return whether is visible element.
function isVisibleElement(element) {
  if (!(element instanceof HTMLElement)) return false;
  if (element.hidden) return false;
  return element.getClientRects().length > 0;
}

// Return modal focusable elements.
function getModalFocusableElements(modalElement) {
  if (!modalElement) return [];
  return Array.from(modalElement.querySelectorAll(MODAL_FOCUSABLE_SELECTOR))
    .filter(node => isVisibleElement(node) && node.getAttribute("aria-hidden") !== "true");
}

// Trap active modal focus.
function trapActiveModalFocus(event) {
  if (event.key !== "Tab" || !activeModalElement || activeModalElement.hidden) return;

  const focusableElements = getModalFocusableElements(activeModalElement);
  if (focusableElements.length === 0) {
    event.preventDefault();
    return;
  }

  const firstElement = focusableElements[0];
  const lastElement = focusableElements[focusableElements.length - 1];

  if (event.shiftKey && document.activeElement === firstElement) {
    event.preventDefault();
    lastElement.focus();
    return;
  }

  if (!event.shiftKey && document.activeElement === lastElement) {
    event.preventDefault();
    firstElement.focus();
  }
}

// Open managed modal.
function openManagedModal(modalElement, triggerElement = null) {
  if (!modalElement) return;

  lastModalTriggerElement =
    triggerElement instanceof HTMLElement
      ? triggerElement
      : document.activeElement instanceof HTMLElement
        ? document.activeElement
        : null;

  modalElement.hidden = false;
  activeModalElement = modalElement;

  const focusableElements = getModalFocusableElements(modalElement);
  const firstElement = focusableElements[0];
  if (firstElement) {
    firstElement.focus();
  }
}

// Close managed modal.
function closeManagedModal(modalElement) {
  if (!modalElement) return;

  modalElement.hidden = true;
  if (activeModalElement === modalElement) {
    activeModalElement = null;
  }

  if (lastModalTriggerElement && lastModalTriggerElement.isConnected) {
    lastModalTriggerElement.focus();
  }
  lastModalTriggerElement = null;
}
