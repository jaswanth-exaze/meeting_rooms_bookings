function setRoomFinderMessage(message, type = "") {
  const messageElement = document.getElementById("roomFinderMessage");
  setHelperMessage(messageElement, message, type);
}

function applyFinderDateTimeConstraints() {
  const dateInput = document.getElementById("finderDate");
  const timeInput = document.getElementById("finderTime");
  if (!dateInput || !timeInput) return;

  const now = new Date();
  const today = getLocalDateInputValue(now);
  dateInput.min = today;

  if (!dateInput.value) {
    dateInput.value = today;
  }

  if (dateInput.value === today) {
    const minTime = getLocalTimeInputValue(now);
    timeInput.min = minTime;
    const currentMinutes = getTimeValueMinutes(getTimeInputValue24(timeInput));
    const minMinutes = getTimeValueMinutes(minTime);
    if (currentMinutes !== null && minMinutes !== null && currentMinutes < minMinutes) {
      setTimeInputValue(timeInput, minTime);
    }
  } else {
    timeInput.min = "";
  }
}

function buildFinderWindow() {
  const dateInput = document.getElementById("finderDate");
  const timeInput = document.getElementById("finderTime");
  const durationInput = document.getElementById("finderDuration");
  return buildWindowFromLocalInputs(dateInput?.value, timeInput?.value, durationInput?.value);
}

function initializeRoomFinder() {
  const form = document.getElementById("roomFinderForm");
  if (!form) return;

  const dateInput = document.getElementById("finderDate");
  const timeInput = document.getElementById("finderTime");
  const durationInput = document.getElementById("finderDuration");

  const now = new Date();
  const roundedMinutes = Math.ceil(now.getMinutes() / 30) * 30;
  now.setMinutes(roundedMinutes, 0, 0);

  if (dateInput) {
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const day = String(now.getDate()).padStart(2, "0");
    dateInput.value = `${now.getFullYear()}-${month}-${day}`;
  }

  if (timeInput) {
    const hours = String(now.getHours()).padStart(2, "0");
    const minutes = String(now.getMinutes()).padStart(2, "0");
    setTimeInputValue(timeInput, `${hours}:${minutes}`);
  }

  if (durationInput && !durationInput.value) {
    durationInput.value = "60";
  }

  applyFinderDateTimeConstraints();
  const clearFinderMessage = () => setRoomFinderMessage("", "");
  dateInput?.addEventListener("change", applyFinderDateTimeConstraints);
  timeInput?.addEventListener("focus", applyFinderDateTimeConstraints);
  dateInput?.addEventListener("change", clearFinderMessage);
  timeInput?.addEventListener("change", clearFinderMessage);
  durationInput?.addEventListener("change", clearFinderMessage);

  form.addEventListener("submit", searchRooms);
}
