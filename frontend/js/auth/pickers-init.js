/**
 * Modern Date/Time Picker Initialization
 * Uses Flatpickr for a modern, accessible date/time picker experience
 */

// Wait for Flatpickr to be loaded
document.addEventListener('DOMContentLoaded', function() {
  initializeModernPickers();
});

function initializeModernPickers() {
  // Set default date and time
  setDefaultDateAndTime();
  
  // Initialize date pickers
  const dateInputs = document.querySelectorAll('input[type="date"]');
  dateInputs.forEach(dateInput => {
    enforcePickerOnlyDateInput(dateInput);
    flatpickr(dateInput, {
      mode: 'single',
      dateFormat: 'Y-m-d',
      minDate: getTodayAtLocalMidnight(),
      enableTime: false,
      disableWeekends: false,
      clickOpens: true,
      static: false,
      animate: true,
      theme: 'light',
      position: 'auto',
      monthSelectorType: 'static',
      // Keyboard shortcuts
      allowInput: false,
      parseDate: parseISO8601,
      // Custom class for styling
      calendarWidth: 320,
    });
  });

  // Initialize time pickers - Modern custom time picker
  const timeInputs = document.querySelectorAll('input[type="time"]');
  timeInputs.forEach(timeInput => {
    createModernTimePicker(timeInput);
  });

  // Enhance select dropdowns with modern styling
  enhanceSelectDropdowns();
}

/**
 * Set default date and time to current values
 */
function setDefaultDateAndTime() {
  const now = new Date();
  
  // Format date as YYYY-MM-DD
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const dateString = `${year}-${month}-${day}`;
  
  // Format time as HH:MM
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  const timeString = `${hours}:${minutes}`;
  
  // Set default date inputs
  const dateInputs = document.querySelectorAll('input[type="date"]');
  dateInputs.forEach(dateInput => {
    if (!dateInput.value) {
      dateInput.value = dateString;
    }
  });
  
  // Set default time inputs (store for time picker initialization)
  const timeInputs = document.querySelectorAll('input[type="time"]');
  timeInputs.forEach(timeInput => {
    if (!timeInput.value) {
      timeInput.setAttribute('data-default-time', timeString);
    }
  });
}

/**
 * Enhance select dropdowns with smooth interactions
 */
function enhanceSelectDropdowns() {
  const selects = document.querySelectorAll('select');

  function clearOpenState(exceptElement = null) {
    selects.forEach(select => {
      if (select !== exceptElement) {
        select.classList.remove('is-open');
      }
    });
  }

  selects.forEach(select => {
    // Browser support for styling open native select varies; use a class fallback.
    select.addEventListener('focus', function() {
      clearOpenState(this);
      this.classList.add('is-open');
    });

    select.addEventListener('click', function() {
      clearOpenState(this);
      this.classList.add('is-open');
    });

    select.addEventListener('pointerdown', function() {
      clearOpenState(this);
      this.classList.add('is-open');
    });

    select.addEventListener('keydown', function(event) {
      const openKeys = [' ', 'Enter', 'ArrowDown', 'ArrowUp'];
      if (openKeys.includes(event.key)) {
        clearOpenState(this);
        this.classList.add('is-open');
      }
      if (event.key === 'Escape') {
        this.classList.remove('is-open');
      }
    });

    select.addEventListener('blur', function() {
      this.classList.remove('is-open');
    });

    select.addEventListener('change', function() {
      this.classList.remove('is-open');
    });
  });

  document.addEventListener('pointerdown', event => {
    const targetSelect = event.target?.closest?.('select');
    if (!targetSelect) {
      clearOpenState();
    }
  });
}

/**
 * ISO 8601 date parser for Flatpickr
 */
function parseISO8601(dateString) {
  if (dateString instanceof Date) {
    return Number.isNaN(dateString.getTime()) ? null : new Date(dateString.getTime());
  }

  const rawValue = String(dateString || '').trim();
  if (!rawValue) return null;

  const dateOnlyMatch = rawValue.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (dateOnlyMatch) {
    const year = Number.parseInt(dateOnlyMatch[1], 10);
    const monthIndex = Number.parseInt(dateOnlyMatch[2], 10) - 1;
    const day = Number.parseInt(dateOnlyMatch[3], 10);
    const localDate = new Date(year, monthIndex, day);

    if (
      localDate.getFullYear() !== year ||
      localDate.getMonth() !== monthIndex ||
      localDate.getDate() !== day
    ) {
      return null;
    }

    return localDate;
  }

  const date = new Date(dateString);
  return isNaN(date.getTime()) ? null : date;
}

function getTodayAtLocalMidnight() {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), now.getDate());
}

function enforcePickerOnlyDateInput(dateInput) {
  if (!dateInput) return;

  dateInput.readOnly = true;
  dateInput.setAttribute('inputmode', 'none');
  dateInput.setAttribute('autocomplete', 'off');

  dateInput.addEventListener('keydown', event => {
    if (event.ctrlKey || event.metaKey || event.altKey) return;
    const allowedKeys = new Set(['Tab', 'Enter', 'Escape', 'Shift']);
    if (!allowedKeys.has(event.key)) {
      event.preventDefault();
    }
  });

  dateInput.addEventListener('paste', event => event.preventDefault());
  dateInput.addEventListener('drop', event => event.preventDefault());
}

function normalizeTimeTo24Hour(value) {
  const raw = String(value || '').trim();
  if (!raw) return null;

  const twentyFourHourMatch = raw.match(/^([01]?\d|2[0-3]):([0-5]\d)$/);
  if (twentyFourHourMatch) {
    const hours = String(Number.parseInt(twentyFourHourMatch[1], 10)).padStart(2, '0');
    const minutes = twentyFourHourMatch[2];
    return `${hours}:${minutes}`;
  }

  const twelveHourMatch = raw.match(/^(0?[1-9]|1[0-2]):([0-5]\d)\s*([AaPp][Mm])$/);
  if (!twelveHourMatch) return null;

  let hours = Number.parseInt(twelveHourMatch[1], 10) % 12;
  const minutes = twelveHourMatch[2];
  const meridiem = twelveHourMatch[3].toUpperCase();
  if (meridiem === 'PM') {
    hours += 12;
  }

  return `${String(hours).padStart(2, '0')}:${minutes}`;
}

function get12HourTimeParts(time24) {
  const normalized = normalizeTimeTo24Hour(time24) || '00:00';
  const [hourRaw, minuteRaw] = normalized.split(':');
  const hour24 = Number.parseInt(hourRaw, 10);
  const minute = Number.parseInt(minuteRaw, 10);
  const period = hour24 >= 12 ? 'PM' : 'AM';
  const hour12 = ((hour24 + 11) % 12) + 1;

  return {
    hour12: String(hour12).padStart(2, '0'),
    minute: String(minute).padStart(2, '0'),
    period,
    display: `${String(hour12).padStart(2, '0')}:${String(minute).padStart(2, '0')} ${period}`
  };
}

function to24HourString(hour12Value, minuteValue, periodValue) {
  const hour12 = Number.parseInt(String(hour12Value), 10);
  const minute = Number.parseInt(String(minuteValue), 10);
  const period = String(periodValue || '').toUpperCase();

  if (!Number.isFinite(hour12) || hour12 < 1 || hour12 > 12) return null;
  if (!Number.isFinite(minute) || minute < 0 || minute > 59) return null;
  if (period !== 'AM' && period !== 'PM') return null;

  let hour24 = hour12 % 12;
  if (period === 'PM') {
    hour24 += 12;
  }

  return `${String(hour24).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;
}

/**
 * Utility function to get date picker instance
 * @param {HTMLElement} element - The input element
 * @returns {Object} Flatpickr instance
 */
function getDatePickerInstance(element) {
  return element._flatpickr;
}

/**
 * Utility function to set date picker value
 * @param {HTMLElement} element - The input element
 * @param {string|Date} value - The date value to set
 */
function setDatePickerValue(element, value) {
  const picker = getDatePickerInstance(element);
  if (picker) {
    picker.setDate(value);
  }
}

/**
 * Utility function to clear date picker
 * @param {HTMLElement} element - The input element
 */
function clearDatePicker(element) {
  const picker = getDatePickerInstance(element);
  if (picker) {
    picker.clear();
  }
}

/**
 * Utility function to get date picker value
 * @param {HTMLElement} element - The input element
 * @returns {Date|null} The selected date
 */
function getDatePickerValue(element) {
  const picker = getDatePickerInstance(element);
  if (picker && picker.selectedDates.length > 0) {
    return picker.selectedDates[0];
  }
  return null;
}

/**
 * Add custom event listener for when date changes
 * @param {HTMLElement} element - The input element
 * @param {Function} callback - Function to call when date changes
 */
function onDatePickerChange(element, callback) {
  const picker = getDatePickerInstance(element);
  if (picker) {
    picker.config.onChange.push(callback);
  }
}

/**
 * Create a modern time picker component
 * @param {HTMLElement} timeInput - The time input element
 */
function createModernTimePicker(timeInput) {
  // Keep the original node so references in other scripts remain valid.
  const initialTime24 =
    normalizeTimeTo24Hour(timeInput.value) ||
    normalizeTimeTo24Hour(timeInput.getAttribute('data-default-time')) ||
    getDefaultTimeString();
  const initialParts = get12HourTimeParts(initialTime24);

  const wrapper = document.createElement('div');
  wrapper.className = 'modern-time-picker-wrapper';

  const display = document.createElement('div');
  display.className = 'modern-time-display';

  // Move original input inside wrapper, then style as 12h picker field.
  const parent = timeInput.parentNode;
  parent.insertBefore(wrapper, timeInput);
  wrapper.appendChild(display);
  display.appendChild(timeInput);

  timeInput.type = 'text';
  timeInput.className = 'modern-time-input';
  timeInput.placeholder = '12:00 AM';
  timeInput.readOnly = true;
  timeInput.setAttribute('data-time-format', '12h');
  timeInput.setAttribute('data-time24', initialTime24);
  timeInput.value = initialParts.display;

  const pickerPopup = document.createElement('div');
  pickerPopup.className = 'modern-time-picker-popup';

  const hourSection = document.createElement('div');
  hourSection.className = 'time-section';

  const hourLabel = document.createElement('label');
  hourLabel.textContent = 'Hours';
  hourLabel.className = 'time-label';

  const hourControls = document.createElement('div');
  hourControls.className = 'time-controls';

  const hourDecrease = createTimeButton('-', 'hour', 'decrease');
  const hourDisplay = document.createElement('div');
  hourDisplay.className = 'time-display-value';
  hourDisplay.textContent = initialParts.hour12;
  hourDisplay.id = `hour-display-${timeInput.id}`;
  const hourIncrease = createTimeButton('+', 'hour', 'increase');

  hourControls.appendChild(hourDecrease);
  hourControls.appendChild(hourDisplay);
  hourControls.appendChild(hourIncrease);

  hourSection.appendChild(hourLabel);
  hourSection.appendChild(hourControls);

  const minuteSection = document.createElement('div');
  minuteSection.className = 'time-section';

  const minuteLabel = document.createElement('label');
  minuteLabel.textContent = 'Minutes';
  minuteLabel.className = 'time-label';

  const minuteControls = document.createElement('div');
  minuteControls.className = 'time-controls';

  const minuteDecrease = createTimeButton('-', 'minute', 'decrease');
  const minuteDisplay = document.createElement('div');
  minuteDisplay.className = 'time-display-value';
  minuteDisplay.textContent = initialParts.minute;
  minuteDisplay.id = `minute-display-${timeInput.id}`;
  const minuteIncrease = createTimeButton('+', 'minute', 'increase');

  minuteControls.appendChild(minuteDecrease);
  minuteControls.appendChild(minuteDisplay);
  minuteControls.appendChild(minuteIncrease);

  minuteSection.appendChild(minuteLabel);
  minuteSection.appendChild(minuteControls);

  const periodSection = document.createElement('div');
  periodSection.className = 'time-section';

  const periodLabel = document.createElement('label');
  periodLabel.textContent = 'AM / PM';
  periodLabel.className = 'time-label';

  const periodToggle = document.createElement('button');
  periodToggle.type = 'button';
  periodToggle.className = 'time-period-toggle';
  periodToggle.textContent = initialParts.period;

  periodSection.appendChild(periodLabel);
  periodSection.appendChild(periodToggle);

  const confirmBtn = document.createElement('button');
  confirmBtn.type = 'button';
  confirmBtn.className = 'time-confirm-btn';
  confirmBtn.textContent = 'Done';

  pickerPopup.appendChild(hourSection);
  pickerPopup.appendChild(minuteSection);
  pickerPopup.appendChild(periodSection);
  pickerPopup.appendChild(confirmBtn);

  document.body.appendChild(pickerPopup);

  wrapper.popup = pickerPopup;
  wrapper.hourDisplay = hourDisplay;
  wrapper.minuteDisplay = minuteDisplay;
  wrapper.periodToggle = periodToggle;
  wrapper.confirmBtn = confirmBtn;

  function syncDisplayFromInput() {
    const normalized = normalizeTimeTo24Hour(timeInput.getAttribute('data-time24') || timeInput.value);
    if (!normalized) return;

    const parts = get12HourTimeParts(normalized);
    hourDisplay.textContent = parts.hour12;
    minuteDisplay.textContent = parts.minute;
    periodToggle.textContent = parts.period;
    timeInput.setAttribute('data-time24', normalized);
    timeInput.value = parts.display;
  }

  function positionPopup() {
    const rect = timeInput.getBoundingClientRect();
    pickerPopup.style.position = 'fixed';
    pickerPopup.style.top = (rect.bottom + 8) + 'px';
    pickerPopup.style.left = rect.left + 'px';
    pickerPopup.style.width = rect.width + 'px';
  }

  timeInput.addEventListener('focus', () => {
    syncDisplayFromInput();
    positionPopup();
    pickerPopup.classList.add('active');
  });

  window.addEventListener('scroll', () => {
    if (pickerPopup.classList.contains('active')) {
      positionPopup();
    }
  }, true);

  window.addEventListener('resize', () => {
    if (pickerPopup.classList.contains('active')) {
      positionPopup();
    }
  });

  confirmBtn.addEventListener('click', () => {
    const hour = hourDisplay.textContent || '12';
    const minute = minuteDisplay.textContent || '00';
    const period = periodToggle.textContent || 'AM';
    const time24 = to24HourString(hour, minute, period);
    const parts = get12HourTimeParts(time24 || '00:00');

    timeInput.setAttribute('data-time24', time24 || '00:00');
    timeInput.value = parts.display;
    pickerPopup.classList.remove('active');
    timeInput.dispatchEvent(new Event('change'));
  });

  hourIncrease.addEventListener('click', () => updateHourValue(hourDisplay, 1));
  hourDecrease.addEventListener('click', () => updateHourValue(hourDisplay, -1));
  minuteIncrease.addEventListener('click', () => updateTimeValue(minuteDisplay, 1, 60));
  minuteDecrease.addEventListener('click', () => updateTimeValue(minuteDisplay, -1, 60));

  periodToggle.addEventListener('click', () => {
    periodToggle.textContent = periodToggle.textContent === 'AM' ? 'PM' : 'AM';
  });

  document.addEventListener('click', (e) => {
    if (!wrapper.contains(e.target) && !pickerPopup.contains(e.target)) {
      pickerPopup.classList.remove('active');
    }
  });
}

/**
 * Get default time string in HH:MM format
 */
function getDefaultTimeString() {
  const now = new Date();
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  return `${hours}:${minutes}`;
}

/**
 * Create time increment/decrement button
 */
function createTimeButton(label, type, action) {
  const btn = document.createElement('button');
  btn.type = 'button';
  btn.className = `time-btn time-${action}`;
  btn.textContent = label;
  btn.setAttribute('data-type', type);
  btn.setAttribute('data-action', action);
  return btn;
}

/**
 * Update time value in display
 */
function updateTimeValue(displayElement, delta, max) {
  let value = parseInt(displayElement.textContent) || 0;
  value += delta;
  
  // Handle wrapping
  if (value >= max) {
    value = 0;
  } else if (value < 0) {
    value = max - Math.abs(delta);
  }
  
  displayElement.textContent = String(value).padStart(2, '0');
}

function updateHourValue(displayElement, delta) {
  let value = Number.parseInt(displayElement.textContent, 10);
  if (!Number.isFinite(value) || value < 1 || value > 12) {
    value = 12;
  }

  value += delta;
  if (value > 12) value = 1;
  if (value < 1) value = 12;
  displayElement.textContent = String(value).padStart(2, '0');
}

// Export functions for use in other scripts (if using modules)
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    getDatePickerInstance,
    setDatePickerValue,
    clearDatePicker,
    getDatePickerValue,
    onDatePickerChange,
    initializeModernPickers,
    createModernTimePicker,
  };
}
