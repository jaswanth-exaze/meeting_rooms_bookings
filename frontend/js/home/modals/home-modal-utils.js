function isVisibleElement(element) {
  return element instanceof HTMLElement && !element.hidden && element.getClientRects().length > 0;
}

function getModalFocusableElements(modalElement) {
  if (!modalElement) return [];
  return Array.from(modalElement.querySelectorAll(FOCUSABLE_SELECTOR))
    .filter(node => isVisibleElement(node) && node.getAttribute("aria-hidden") !== "true");
}

function focusFirstElementInModal(modalElement) {
  const focusableElements = getModalFocusableElements(modalElement);
  if (focusableElements[0]) {
    focusableElements[0].focus();
  }
}

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
