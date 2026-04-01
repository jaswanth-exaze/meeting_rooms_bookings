// Provide focus and visibility helpers for home page modals.

// Return whether is visible element.
function isVisibleElement(element) {
  return element instanceof HTMLElement && !element.hidden && element.getClientRects().length > 0;
}

// Return modal focusable elements.
function getModalFocusableElements(modalElement) {
  if (!modalElement) return [];
  return Array.from(modalElement.querySelectorAll(FOCUSABLE_SELECTOR))
    .filter(node => isVisibleElement(node) && node.getAttribute("aria-hidden") !== "true");
}

// Focus first element in modal.
function focusFirstElementInModal(modalElement) {
  const focusableElements = getModalFocusableElements(modalElement);
  if (focusableElements[0]) {
    focusableElements[0].focus();
  }
}

// Trap modal focus.
function trapModalFocus(modalElement, event) {
  if (!modalElement || modalElement.hidden || event.key !== "Tab") return;

  const focusableElements = getModalFocusableElements(modalElement);
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
