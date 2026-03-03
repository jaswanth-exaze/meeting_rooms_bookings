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
    flatpickr(dateInput, {
      mode: 'single',
      dateFormat: 'Y-m-d',
      minDate: new Date(),
      enableTime: false,
      disableWeekends: false,
      clickOpens: true,
      static: false,
      animate: true,
      theme: 'light',
      position: 'auto',
      monthSelectorType: 'static',
      // Keyboard shortcuts
      allowInput: true,
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

  console.log('✓ Modern date/time pickers initialized');
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
  
  selects.forEach(select => {
    // Add smooth transitions
    select.addEventListener('focus', function() {
      this.style.transition = 'all 0.3s ease';
    });

    // Handle option selection feedback
    select.addEventListener('change', function() {
      const selectedOption = this.options[this.selectedIndex];
      // Visual feedback on selection
      this.style.borderColor = 'var(--leaf)';
      setTimeout(() => {
        this.style.borderColor = '#dbe3ef';
      }, 200);
    });
  });

  console.log('✓ Select dropdowns enhanced');
}

/**
 * ISO 8601 date parser for Flatpickr
 */
function parseISO8601(dateString) {
  const date = new Date(dateString);
  return isNaN(date.getTime()) ? null : date;
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
  // Get default time from attribute or use current time
  const defaultTime = timeInput.getAttribute('data-default-time') || getDefaultTimeString();
  const [defaultHour, defaultMinute] = defaultTime.split(':');
  
  const wrapper = document.createElement('div');
  wrapper.className = 'modern-time-picker-wrapper';
  
  // Create input display
  const display = document.createElement('div');
  display.className = 'modern-time-display';
  
  const input = document.createElement('input');
  input.type = 'text';
  input.id = timeInput.id;
  input.className = 'modern-time-input';
  input.placeholder = '00:00';
  input.readOnly = false;
  input.maxLength = 5;
  input.value = defaultTime;
  
  // Hidden input to store actual value
  const hiddenInput = document.createElement('input');
  hiddenInput.type = 'hidden';
  hiddenInput.name = timeInput.name;
  hiddenInput.value = defaultTime;
  
  // Create picker popup
  const pickerPopup = document.createElement('div');
  pickerPopup.className = 'modern-time-picker-popup';
  
  // Hour selector
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
  hourDisplay.textContent = String(defaultHour).padStart(2, '0');
  hourDisplay.id = `hour-display-${timeInput.id}`;
  const hourIncrease = createTimeButton('+', 'hour', 'increase');
  
  hourControls.appendChild(hourDecrease);
  hourControls.appendChild(hourDisplay);
  hourControls.appendChild(hourIncrease);
  
  hourSection.appendChild(hourLabel);
  hourSection.appendChild(hourControls);
  
  // Minute selector
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
  minuteDisplay.textContent = String(defaultMinute).padStart(2, '0');
  minuteDisplay.id = `minute-display-${timeInput.id}`;
  const minuteIncrease = createTimeButton('+', 'minute', 'increase');
  
  minuteControls.appendChild(minuteDecrease);
  minuteControls.appendChild(minuteDisplay);
  minuteControls.appendChild(minuteIncrease);
  
  minuteSection.appendChild(minuteLabel);
  minuteSection.appendChild(minuteControls);
  
  // Confirm button
  const confirmBtn = document.createElement('button');
  confirmBtn.type = 'button';
  confirmBtn.className = 'time-confirm-btn';
  confirmBtn.textContent = 'Done';
  
  pickerPopup.appendChild(hourSection);
  pickerPopup.appendChild(minuteSection);
  pickerPopup.appendChild(confirmBtn);
  
  // Assemble wrapper
  display.appendChild(input);
  wrapper.appendChild(display);
  wrapper.appendChild(pickerPopup);
  wrapper.appendChild(hiddenInput);
  
  // Replace original input
  timeInput.parentNode.replaceChild(wrapper, timeInput);
  
  // Store element references
  wrapper.timeInput = input;
  wrapper.hiddenInput = hiddenInput;
  wrapper.popup = pickerPopup;
  wrapper.hourDisplay = hourDisplay;
  wrapper.minuteDisplay = minuteDisplay;
  wrapper.confirmBtn = confirmBtn;
  
  // Event listeners
  input.addEventListener('focus', () => {
    pickerPopup.classList.add('active');
  });
  
  confirmBtn.addEventListener('click', () => {
    const hour = hourDisplay.textContent;
    const minute = minuteDisplay.textContent;
    const timeValue = `${hour}:${minute}`;
    input.value = timeValue;
    hiddenInput.value = timeValue;
    pickerPopup.classList.remove('active');
    input.dispatchEvent(new Event('change'));
  });
  
  // Handle hour/minute buttons
  hourIncrease.addEventListener('click', () => updateTimeValue(hourDisplay, 1, 24));
  hourDecrease.addEventListener('click', () => updateTimeValue(hourDisplay, -1, 24));
  minuteIncrease.addEventListener('click', () => updateTimeValue(minuteDisplay, 15, 60));
  minuteDecrease.addEventListener('click', () => updateTimeValue(minuteDisplay, -15, 60));
  
  // Close popup when clicking outside
  document.addEventListener('click', (e) => {
    if (!wrapper.contains(e.target)) {
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
