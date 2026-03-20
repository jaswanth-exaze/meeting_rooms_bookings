# Frontend JS Function Explanations

This guide explains the current frontend JavaScript file by file.
Each named function is described in plain language with: what it is, why it exists, how it works, and what it helps with.
Important inline callbacks are also listed where they carry meaningful runtime behavior.

Generated On: 2026-03-18T09:33:44.516Z
JavaScript File Count: 47
Named Function Count: 341
Important Inline Callback Count: 108

## How To Read This Guide

- `What this is` explains the role of the function.
- `Why this is used` explains why the logic is split into this function.
- `How this works` explains the main runtime steps.
- `What this helps with` explains the practical frontend benefit.
- `Key inputs` explains parameters in plain language.
- `Key dependencies` highlights helpers, shared state, backend routes, or browser APIs.
- `Return or side effects` explains whether the function mainly returns a value or mainly changes UI/state/network state.

## frontend/js/auth/login.js

- Area: Auth
- File role: This file owns login behavior in the auth layer.
- Line count: 69
- Named functions in this file: 0
- Important inline callbacks noted: 4
- Top-level behavior: attaches the login flow directly at the top level because the page has one main action.

### Named Functions

- This file does not expose standalone named functions.
- Its value comes from shared constants, cached DOM references, or top-level runtime wiring.

### Important Inline Callbacks

#### Inline Callback At Line 12

- Source marker: `loginForm.addEventListener('submit', function(event) {`
- What this is: This is the inline submit listener attached to `loginForm`.
- Why this is used: It stays beside the event registration so the trigger and reaction are easy to read together.
- How this works: When the browser fires that event, the callback reads closure state, performs the local UI action, and may call named helpers for heavier work.
- What this helps with: It helps the interface respond directly to user input without creating another global helper.

#### Inline Callback At Line 34

- Source marker: `.then(async response => {`
- What this is: This is the inline success handler in a promise chain.
- Why this is used: It stays in the chain so response handling sits next to the request that produced it.
- How this works: After the async operation resolves, it inspects the result and applies the next local UI or state step.
- What this helps with: It helps keep request logic readable because success handling stays close to the fetch call.

#### Inline Callback At Line 41

- Source marker: `.then(data => {`
- What this is: This is the inline success handler in a promise chain.
- Why this is used: It stays in the chain so response handling sits next to the request that produced it.
- How this works: After the async operation resolves, it inspects the result and applies the next local UI or state step.
- What this helps with: It helps keep request logic readable because success handling stays close to the fetch call.

#### Inline Callback At Line 56

- Source marker: `.catch(error => {`
- What this is: This is the inline error handler in a promise chain.
- Why this is used: It exists so request-specific failure handling stays beside the request flow that can fail.
- How this works: If the async chain rejects, it receives the error and turns it into logging, UI feedback, or cleanup.
- What this helps with: It helps the user see the right failure feedback for that exact request path.

## frontend/js/auth/pickers-init.js

- Area: Auth
- File role: This file owns pickers init behavior in the auth layer.
- Line count: 560
- Named functions in this file: 22
- Important inline callbacks noted: 21
- Top-level behavior: mixes named helpers with direct runtime wiring for this feature.

### Named Functions

#### `initializeModernPickers()`

- Defined at: line 11
- What this is: This is the main setup function for the modern pickers flow in the auth layer.
- Why this is used: It exists so one-time setup stays in one place.
- How this works: It reads current DOM or form values and leans on helpers like `setDefaultDateAndTime`, `enforcePickerOnlyDateInput`, `getTodayAtLocalMidnight`, `createModernTimePicker`, `enhanceSelectDropdowns`.
- What this helps with: It helps the feature become usable as soon as the page loads.
- Key inputs: This function does not take direct parameters; it mainly uses surrounding state, cached DOM references, or globals.
- Key dependencies: This function calls helpers such as `setDefaultDateAndTime`, `enforcePickerOnlyDateInput`, `getTodayAtLocalMidnight`, `createModernTimePicker`, `enhanceSelectDropdowns`.
- Return or side effects: It mostly works through local computation and whatever the caller does with the result.

#### `setDefaultDateAndTime()`

- Defined at: line 52
- What this is: This sets or writes the default date and time state in the auth layer.
- Why this is used: It exists so status or state changes follow one rule set.
- How this works: It reads current DOM or form values and computes date or time values.
- What this helps with: It helps the UI communicate state or feedback in a standardized way.
- Key inputs: This function does not take direct parameters; it mainly uses surrounding state, cached DOM references, or globals.
- Key dependencies: This function is mostly self-contained and depends only on local values plus standard browser APIs.
- Return or side effects: It mostly works through local computation and whatever the caller does with the result.

#### `enhanceSelectDropdowns()`

- Defined at: line 86
- What this is: This is a support helper for the enhance select dropdowns work in the auth layer.
- Why this is used: It exists to keep repeated logic small and reusable.
- How this works: It reads current DOM or form values.
- What this helps with: It helps reduce duplication and makes the calling code easier to read.
- Key inputs: This function does not take direct parameters; it mainly uses surrounding state, cached DOM references, or globals.
- Key dependencies: This function is mostly self-contained and depends only on local values plus standard browser APIs.
- Return or side effects: It mostly works through local computation and whatever the caller does with the result.

#### `clearOpenState(exceptElement = null)`

- Defined at: line 89
- What this is: This clears or resets the open state state.
- Why this is used: It exists so the feature can return to a known clean baseline.
- How this works: It reads current DOM or form values, uses shared state such as `clearOpenState`, and toggles CSS classes to reflect current state.
- What this helps with: It helps avoid stale errors, selections, and temporary state.
- Key inputs: `exceptElement` is a DOM reference.
- Key dependencies: This function touches shared runtime values like `clearOpenState`.
- Return or side effects: It works mainly through side effects, especially CSS class changes, listener registration.

#### `parseISO8601(dateString)`

- Defined at: line 145
- What this is: This parses raw iso8601 input into a usable value.
- Why this is used: It exists so raw strings become predictable values before business logic uses them.
- How this works: It computes date or time values.
- What this helps with: It helps convert raw input into something safe for the rest of the code.
- Key inputs: `dateString` represents scheduling input.
- Key dependencies: This function is mostly self-contained and depends only on local values plus standard browser APIs.
- Return or side effects: Mostly returns a derived value or prepared structure back to the caller.

#### `getTodayAtLocalMidnight()`

- Defined at: line 175
- What this is: This returns a derived today at local midnight value for the auth layer.
- Why this is used: It exists to centralize a repeated lookup or calculation.
- How this works: It computes date or time values.
- What this helps with: It helps other code ask for the current today at local midnight in one place.
- Key inputs: This function does not take direct parameters; it mainly uses surrounding state, cached DOM references, or globals.
- Key dependencies: This function is mostly self-contained and depends only on local values plus standard browser APIs.
- Return or side effects: Mostly returns a derived value or prepared structure back to the caller.

#### `enforcePickerOnlyDateInput(dateInput)`

- Defined at: line 180
- What this is: This enforces the picker only date input rule in the frontend.
- Why this is used: It exists so the frontend actively blocks states that should not be allowed.
- How this works: It performs small synchronous logic and returns the result.
- What this helps with: It helps protect the user from invalid or blocked states.
- Key inputs: `dateInput` represents scheduling input.
- Key dependencies: This function is mostly self-contained and depends only on local values plus standard browser APIs.
- Return or side effects: Mostly returns a derived value or prepared structure back to the caller.

#### `normalizeTimeTo24Hour(value)`

- Defined at: line 199
- What this is: This normalizes the time to24 hour so later code sees one consistent shape.
- Why this is used: It exists so downstream code does not guess between multiple input shapes.
- How this works: It performs small synchronous logic and returns the result.
- What this helps with: It helps downstream code stay simple because inputs become consistent.
- Key inputs: `value` is an input value the function uses.
- Key dependencies: This function is mostly self-contained and depends only on local values plus standard browser APIs.
- Return or side effects: Mostly returns a derived value or prepared structure back to the caller.

#### `get12HourTimeParts(time24)`

- Defined at: line 223
- What this is: This returns a derived get12 hour time parts value for the auth layer.
- Why this is used: It exists to centralize a repeated lookup or calculation.
- How this works: It leans on helpers like `normalizeTimeTo24Hour`.
- What this helps with: It helps other code ask for the current get12 hour time parts in one place.
- Key inputs: `time24` represents scheduling input.
- Key dependencies: This function calls helpers such as `normalizeTimeTo24Hour`.
- Return or side effects: Mostly returns a derived value or prepared structure back to the caller.

#### `to24HourString(hour12Value, minuteValue, periodValue)`

- Defined at: line 239
- What this is: This is a support helper for the to24 hour string work in the auth layer.
- Why this is used: It exists to keep repeated logic small and reusable.
- How this works: It performs small synchronous logic and returns the result.
- What this helps with: It helps reduce duplication and makes the calling code easier to read.
- Key inputs: `hour12Value` is an input value the function uses. `minuteValue` is an input value the function uses. `periodValue` is an input value the function uses.
- Key dependencies: This function is mostly self-contained and depends only on local values plus standard browser APIs.
- Return or side effects: Mostly returns a derived value or prepared structure back to the caller.

#### `getDatePickerInstance(element)`

- Defined at: line 261
- What this is: This returns a derived date picker instance value for the auth layer.
- Why this is used: It exists to centralize a repeated lookup or calculation.
- How this works: It performs small synchronous logic and returns the result.
- What this helps with: It helps other code ask for the current date picker instance in one place.
- Key inputs: `element` is a DOM reference.
- Key dependencies: This function is mostly self-contained and depends only on local values plus standard browser APIs.
- Return or side effects: Mostly returns a derived value or prepared structure back to the caller.

#### `setDatePickerValue(element, value)`

- Defined at: line 270
- What this is: This sets or writes the date picker value state in the auth layer.
- Why this is used: It exists so status or state changes follow one rule set.
- How this works: It leans on helpers like `getDatePickerInstance`.
- What this helps with: It helps the UI communicate state or feedback in a standardized way.
- Key inputs: `element` is a DOM reference. `value` is an input value the function uses.
- Key dependencies: This function calls helpers such as `getDatePickerInstance`.
- Return or side effects: It mostly works through local computation and whatever the caller does with the result.

#### `clearDatePicker(element)`

- Defined at: line 281
- What this is: This clears or resets the date picker state.
- Why this is used: It exists so the feature can return to a known clean baseline.
- How this works: It leans on helpers like `getDatePickerInstance`.
- What this helps with: It helps avoid stale errors, selections, and temporary state.
- Key inputs: `element` is a DOM reference.
- Key dependencies: This function calls helpers such as `getDatePickerInstance`.
- Return or side effects: It mostly works through local computation and whatever the caller does with the result.

#### `getDatePickerValue(element)`

- Defined at: line 293
- What this is: This returns a derived date picker value value for the auth layer.
- Why this is used: It exists to centralize a repeated lookup or calculation.
- How this works: It leans on helpers like `getDatePickerInstance`.
- What this helps with: It helps other code ask for the current date picker value in one place.
- Key inputs: `element` is a DOM reference.
- Key dependencies: This function calls helpers such as `getDatePickerInstance`.
- Return or side effects: Mostly returns a derived value or prepared structure back to the caller.

#### `onDatePickerChange(element, callback)`

- Defined at: line 306
- What this is: This is a support helper for the on date picker change work in the auth layer.
- Why this is used: It exists to keep repeated logic small and reusable.
- How this works: It leans on helpers like `getDatePickerInstance`.
- What this helps with: It helps reduce duplication and makes the calling code easier to read.
- Key inputs: `element` is a DOM reference. `callback` is an input value the function uses.
- Key dependencies: This function calls helpers such as `getDatePickerInstance`.
- Return or side effects: It mostly works through local computation and whatever the caller does with the result.

#### `createModernTimePicker(timeInput)`

- Defined at: line 317
- What this is: This creates the modern time picker object or DOM fragment.
- Why this is used: It exists so reusable objects or DOM fragments are built the same way each time.
- How this works: It reads current DOM or form values, leans on helpers like `normalizeTimeTo24Hour`, `getDefaultTimeString`, `get12HourTimeParts`, `createTimeButton`, and writes text, markup, or created elements back into the UI.
- What this helps with: It helps generated UI fragments stay uniform and easier to maintain.
- Key inputs: `timeInput` represents scheduling input.
- Key dependencies: This function calls helpers such as `normalizeTimeTo24Hour`, `getDefaultTimeString`, `get12HourTimeParts`, `createTimeButton`.
- Return or side effects: It works mainly through side effects, especially DOM updates.

#### `syncDisplayFromInput()`

- Defined at: line 429
- What this is: This keeps the display from input synchronized across related state.
- Why this is used: It exists so related values do not drift apart.
- How this works: It leans on helpers like `normalizeTimeTo24Hour`, `get12HourTimeParts` and writes text, markup, or created elements back into the UI.
- What this helps with: It helps the feature behave like one coherent workflow instead of separate disconnected pieces.
- Key inputs: This function does not take direct parameters; it mainly uses surrounding state, cached DOM references, or globals.
- Key dependencies: This function calls helpers such as `normalizeTimeTo24Hour`, `get12HourTimeParts`.
- Return or side effects: Mostly returns a derived value or prepared structure back to the caller.

#### `positionPopup()`

- Defined at: line 441
- What this is: This is a support helper for the position popup work in the auth layer.
- Why this is used: It exists to keep repeated logic small and reusable.
- How this works: It reads current DOM or form values, leans on helpers like `syncDisplayFromInput`, `to24HourString`, `get12HourTimeParts`, `updateHourValue`, `updateTimeValue`, writes text, markup, or created elements back into the UI, and toggles CSS classes to reflect current state.
- What this helps with: It helps reduce duplication and makes the calling code easier to read.
- Key inputs: This function does not take direct parameters; it mainly uses surrounding state, cached DOM references, or globals.
- Key dependencies: This function calls helpers such as `syncDisplayFromInput`, `to24HourString`, `get12HourTimeParts`, `updateHourValue`, `updateTimeValue`.
- Return or side effects: It works mainly through side effects, especially DOM updates, CSS class changes, listener registration.

#### `getDefaultTimeString()`

- Defined at: line 499
- What this is: This returns a derived default time string value for the auth layer.
- Why this is used: It exists to centralize a repeated lookup or calculation.
- How this works: It computes date or time values.
- What this helps with: It helps other code ask for the current default time string in one place.
- Key inputs: This function does not take direct parameters; it mainly uses surrounding state, cached DOM references, or globals.
- Key dependencies: This function is mostly self-contained and depends only on local values plus standard browser APIs.
- Return or side effects: Mostly returns a derived value or prepared structure back to the caller.

#### `createTimeButton(label, type, action)`

- Defined at: line 509
- What this is: This creates the time button object or DOM fragment.
- Why this is used: It exists so reusable objects or DOM fragments are built the same way each time.
- How this works: It reads current DOM or form values and writes text, markup, or created elements back into the UI.
- What this helps with: It helps generated UI fragments stay uniform and easier to maintain.
- Key inputs: `label` is an input value the function uses. `type` controls a visual tone or behavior mode. `action` is an input value the function uses.
- Key dependencies: This function is mostly self-contained and depends only on local values plus standard browser APIs.
- Return or side effects: Mostly returns a derived value or prepared structure back to the caller.

#### `updateTimeValue(displayElement, delta, max)`

- Defined at: line 522
- What this is: This updates the time value after state changes.
- Why this is used: It exists so dependent UI reacts when state changes.
- How this works: It writes text, markup, or created elements back into the UI.
- What this helps with: It helps linked UI pieces stay synchronized after a change.
- Key inputs: `displayElement` is a DOM reference. `delta` is an input value the function uses. `max` is an input value the function uses.
- Key dependencies: This function is mostly self-contained and depends only on local values plus standard browser APIs.
- Return or side effects: It works mainly through side effects, especially DOM updates.

#### `updateHourValue(displayElement, delta)`

- Defined at: line 536
- What this is: This updates the hour value after state changes.
- Why this is used: It exists so dependent UI reacts when state changes.
- How this works: It writes text, markup, or created elements back into the UI.
- What this helps with: It helps linked UI pieces stay synchronized after a change.
- Key inputs: `displayElement` is a DOM reference. `delta` is an input value the function uses.
- Key dependencies: This function is mostly self-contained and depends only on local values plus standard browser APIs.
- Return or side effects: It works mainly through side effects, especially DOM updates.

### Important Inline Callbacks

#### Inline Callback At Line 7

- Source marker: `document.addEventListener('DOMContentLoaded', function() {`
- What this is: This is the inline DOMContentLoaded listener attached to `document`.
- Why this is used: It stays beside the event registration so the trigger and reaction are easy to read together.
- How this works: When the browser fires that event, the callback reads closure state, performs the local UI action, and may call named helpers for heavier work.
- What this helps with: It helps the interface respond directly to user input without creating another global helper.

#### Inline Callback At Line 99

- Source marker: `select.addEventListener('focus', function() {`
- What this is: This is the inline focus listener attached to `select`.
- Why this is used: It stays beside the event registration so the trigger and reaction are easy to read together.
- How this works: When the browser fires that event, the callback reads closure state, performs the local UI action, and may call named helpers for heavier work.
- What this helps with: It helps the interface respond directly to user input without creating another global helper.

#### Inline Callback At Line 104

- Source marker: `select.addEventListener('click', function() {`
- What this is: This is the inline click listener attached to `select`.
- Why this is used: It stays beside the event registration so the trigger and reaction are easy to read together.
- How this works: When the browser fires that event, the callback reads closure state, performs the local UI action, and may call named helpers for heavier work.
- What this helps with: It helps the interface respond directly to user input without creating another global helper.

#### Inline Callback At Line 109

- Source marker: `select.addEventListener('pointerdown', function() {`
- What this is: This is the inline pointerdown listener attached to `select`.
- Why this is used: It stays beside the event registration so the trigger and reaction are easy to read together.
- How this works: When the browser fires that event, the callback reads closure state, performs the local UI action, and may call named helpers for heavier work.
- What this helps with: It helps the interface respond directly to user input without creating another global helper.

#### Inline Callback At Line 114

- Source marker: `select.addEventListener('keydown', function(event) {`
- What this is: This is the inline keydown listener attached to `select`.
- Why this is used: It stays beside the event registration so the trigger and reaction are easy to read together.
- How this works: When the browser fires that event, the callback reads closure state, performs the local UI action, and may call named helpers for heavier work.
- What this helps with: It helps the interface respond directly to user input without creating another global helper.

#### Inline Callback At Line 125

- Source marker: `select.addEventListener('blur', function() {`
- What this is: This is the inline blur listener attached to `select`.
- Why this is used: It stays beside the event registration so the trigger and reaction are easy to read together.
- How this works: When the browser fires that event, the callback reads closure state, performs the local UI action, and may call named helpers for heavier work.
- What this helps with: It helps the interface respond directly to user input without creating another global helper.

#### Inline Callback At Line 129

- Source marker: `select.addEventListener('change', function() {`
- What this is: This is the inline change listener attached to `select`.
- Why this is used: It stays beside the event registration so the trigger and reaction are easy to read together.
- How this works: When the browser fires that event, the callback reads closure state, performs the local UI action, and may call named helpers for heavier work.
- What this helps with: It helps the interface respond directly to user input without creating another global helper.

#### Inline Callback At Line 134

- Source marker: `document.addEventListener('pointerdown', event => {`
- What this is: This is the inline pointerdown listener attached to `document`.
- Why this is used: It stays beside the event registration so the trigger and reaction are easy to read together.
- How this works: When the browser fires that event, the callback reads closure state, performs the local UI action, and may call named helpers for heavier work.
- What this helps with: It helps the interface respond directly to user input without creating another global helper.

#### Inline Callback At Line 187

- Source marker: `dateInput.addEventListener('keydown', event => {`
- What this is: This is the inline keydown listener attached to `dateInput`.
- Why this is used: It stays beside the event registration so the trigger and reaction are easy to read together.
- How this works: When the browser fires that event, the callback reads closure state, performs the local UI action, and may call named helpers for heavier work.
- What this helps with: It helps the interface respond directly to user input without creating another global helper.

#### Inline Callback At Line 195

- Source marker: `dateInput.addEventListener('paste', event => event.preventDefault());`
- What this is: This is the inline paste listener attached to `dateInput`.
- Why this is used: It stays beside the event registration so the trigger and reaction are easy to read together.
- How this works: When the browser fires that event, the callback reads closure state, performs the local UI action, and may call named helpers for heavier work.
- What this helps with: It helps the interface respond directly to user input without creating another global helper.

#### Inline Callback At Line 196

- Source marker: `dateInput.addEventListener('drop', event => event.preventDefault());`
- What this is: This is the inline drop listener attached to `dateInput`.
- Why this is used: It stays beside the event registration so the trigger and reaction are easy to read together.
- How this works: When the browser fires that event, the callback reads closure state, performs the local UI action, and may call named helpers for heavier work.
- What this helps with: It helps the interface respond directly to user input without creating another global helper.

#### Inline Callback At Line 449

- Source marker: `timeInput.addEventListener('focus', () => {`
- What this is: This is the inline focus listener attached to `timeInput`.
- Why this is used: It stays beside the event registration so the trigger and reaction are easy to read together.
- How this works: When the browser fires that event, the callback reads closure state, performs the local UI action, and may call named helpers for heavier work.
- What this helps with: It helps the interface respond directly to user input without creating another global helper.

#### Inline Callback At Line 455

- Source marker: `window.addEventListener('scroll', () => {`
- What this is: This is the inline scroll listener attached to `window`.
- Why this is used: It stays beside the event registration so the trigger and reaction are easy to read together.
- How this works: When the browser fires that event, the callback reads closure state, performs the local UI action, and may call named helpers for heavier work.
- What this helps with: It helps the interface respond directly to user input without creating another global helper.

#### Inline Callback At Line 461

- Source marker: `window.addEventListener('resize', () => {`
- What this is: This is the inline resize listener attached to `window`.
- Why this is used: It stays beside the event registration so the trigger and reaction are easy to read together.
- How this works: When the browser fires that event, the callback reads closure state, performs the local UI action, and may call named helpers for heavier work.
- What this helps with: It helps the interface respond directly to user input without creating another global helper.

#### Inline Callback At Line 467

- Source marker: `confirmBtn.addEventListener('click', () => {`
- What this is: This is the inline click listener attached to `confirmBtn`.
- Why this is used: It stays beside the event registration so the trigger and reaction are easy to read together.
- How this works: When the browser fires that event, the callback reads closure state, performs the local UI action, and may call named helpers for heavier work.
- What this helps with: It helps the interface respond directly to user input without creating another global helper.

#### Inline Callback At Line 480

- Source marker: `hourIncrease.addEventListener('click', () => updateHourValue(hourDisplay, 1));`
- What this is: This is the inline click listener attached to `hourIncrease`.
- Why this is used: It stays beside the event registration so the trigger and reaction are easy to read together.
- How this works: When the browser fires that event, the callback reads closure state, performs the local UI action, and may call named helpers for heavier work.
- What this helps with: It helps the interface respond directly to user input without creating another global helper.

#### Inline Callback At Line 481

- Source marker: `hourDecrease.addEventListener('click', () => updateHourValue(hourDisplay, -1));`
- What this is: This is the inline click listener attached to `hourDecrease`.
- Why this is used: It stays beside the event registration so the trigger and reaction are easy to read together.
- How this works: When the browser fires that event, the callback reads closure state, performs the local UI action, and may call named helpers for heavier work.
- What this helps with: It helps the interface respond directly to user input without creating another global helper.

#### Inline Callback At Line 482

- Source marker: `minuteIncrease.addEventListener('click', () => updateTimeValue(minuteDisplay, 1, 60));`
- What this is: This is the inline click listener attached to `minuteIncrease`.
- Why this is used: It stays beside the event registration so the trigger and reaction are easy to read together.
- How this works: When the browser fires that event, the callback reads closure state, performs the local UI action, and may call named helpers for heavier work.
- What this helps with: It helps the interface respond directly to user input without creating another global helper.

#### Inline Callback At Line 483

- Source marker: `minuteDecrease.addEventListener('click', () => updateTimeValue(minuteDisplay, -1, 60));`
- What this is: This is the inline click listener attached to `minuteDecrease`.
- Why this is used: It stays beside the event registration so the trigger and reaction are easy to read together.
- How this works: When the browser fires that event, the callback reads closure state, performs the local UI action, and may call named helpers for heavier work.
- What this helps with: It helps the interface respond directly to user input without creating another global helper.

#### Inline Callback At Line 485

- Source marker: `periodToggle.addEventListener('click', () => {`
- What this is: This is the inline click listener attached to `periodToggle`.
- Why this is used: It stays beside the event registration so the trigger and reaction are easy to read together.
- How this works: When the browser fires that event, the callback reads closure state, performs the local UI action, and may call named helpers for heavier work.
- What this helps with: It helps the interface respond directly to user input without creating another global helper.

#### Inline Callback At Line 489

- Source marker: `document.addEventListener('click', (e) => {`
- What this is: This is the inline click listener attached to `document`.
- Why this is used: It stays beside the event registration so the trigger and reaction are easy to read together.
- How this works: When the browser fires that event, the callback reads closure state, performs the local UI action, and may call named helpers for heavier work.
- What this helps with: It helps the interface respond directly to user input without creating another global helper.

## frontend/js/core/api.js

- Area: Core
- File role: This file provides shared api utilities for the core layer.
- Line count: 95
- Named functions in this file: 5
- Important inline callbacks noted: 0
- Top-level behavior: mixes named helpers with direct runtime wiring for this feature.

### Named Functions

#### `async apiFetch(path, options = {})`

- Defined at: line 3
- What this is: This is a support helper for the api fetch work in the core layer.
- Why this is used: It exists to keep repeated logic small and reusable. It also keeps backend communication tied to the right UI step.
- How this works: It talks to the backend, leans on helpers like `clearStoredAuth`, and can redirect or alter browser navigation.
- What this helps with: It helps reduce duplication and makes the calling code easier to read.
- Key inputs: `path` is an input value the function uses. `options` is an input value the function uses.
- Key dependencies: This function calls helpers such as `clearStoredAuth`, depends on a backend request path.
- Return or side effects: Mostly returns a derived value or prepared structure back to the caller.

#### `async ensureAuthenticatedSession()`

- Defined at: line 38
- What this is: This ensures the authenticated session requirement is ready before the flow continues.
- Why this is used: It exists so later logic can assume a prerequisite is already satisfied. It also keeps backend communication tied to the right UI step.
- How this works: It talks to backend routes like `/auth/me`, leans on helpers like `apiFetch`, `setCurrentEmployee`, `enforceRoleAccess`, `clearStoredAuth`, and can redirect or alter browser navigation.
- What this helps with: It helps later code run with fewer defensive checks.
- Key inputs: This function does not take direct parameters; it mainly uses surrounding state, cached DOM references, or globals.
- Key dependencies: This function calls helpers such as `apiFetch`, `setCurrentEmployee`, `enforceRoleAccess`, `clearStoredAuth`, depends on backend routes including `/auth/me`.
- Return or side effects: Mostly returns a derived value or prepared structure back to the caller.

#### `async clearAuthAndLogout()`

- Defined at: line 57
- What this is: This clears or resets the auth and logout state.
- Why this is used: It exists so the feature can return to a known clean baseline. It also keeps backend communication tied to the right UI step.
- How this works: It talks to backend routes like `/auth/logout`, leans on helpers like `apiFetch`, `clearStoredAuth`, and can redirect or alter browser navigation.
- What this helps with: It helps avoid stale errors, selections, and temporary state.
- Key inputs: This function does not take direct parameters; it mainly uses surrounding state, cached DOM references, or globals.
- Key dependencies: This function calls helpers such as `apiFetch`, `clearStoredAuth`, depends on backend routes including `/auth/logout`.
- Return or side effects: It works mainly through side effects, especially network requests, navigation changes.

#### `buildUpcomingUrl({ limit = 20, ownOnly = false, includeAll = false } = {})`

- Defined at: line 67
- What this is: This builds the upcoming url structure another part of the feature needs.
- Why this is used: It exists to keep object, markup, or URL assembly consistent.
- How this works: It builds or interprets URL/query data and uses shared state such as `currentRole`, `currentEmployeeId`.
- What this helps with: It helps other functions trust the assembled upcoming url shape.
- Key inputs: `limit` is an input value the function uses. `ownOnly` is an input value the function uses. `includeAll` is an input value the function uses.
- Key dependencies: This function touches shared runtime values like `currentRole`, `currentEmployeeId`.
- Return or side effects: Mostly returns a derived value or prepared structure back to the caller.

#### `buildMyBookingsUrl(limit = 30)`

- Defined at: line 83
- What this is: This builds the my bookings url structure another part of the feature needs.
- Why this is used: It exists to keep object, markup, or URL assembly consistent.
- How this works: It builds or interprets URL/query data and uses shared state such as `currentRole`, `currentEmployeeId`.
- What this helps with: It helps other functions trust the assembled my bookings url shape.
- Key inputs: `limit` is an input value the function uses.
- Key dependencies: This function touches shared runtime values like `currentRole`, `currentEmployeeId`.
- Return or side effects: Mostly returns a derived value or prepared structure back to the caller.

## frontend/js/core/config.js

- Area: Core
- File role: This file provides shared config utilities for the core layer.
- Line count: 41
- Named functions in this file: 1
- Important inline callbacks noted: 0
- Top-level behavior: computes runtime API configuration immediately and exposes one shared config object.

### Named Functions

#### `toUrlHost(name)`

- Defined at: line 14
- What this is: This is a support helper for the to url host work in the core layer.
- Why this is used: It exists to keep repeated logic small and reusable.
- How this works: It performs small synchronous logic and returns the result.
- What this helps with: It helps reduce duplication and makes the calling code easier to read.
- Key inputs: `name` is an input value the function uses.
- Key dependencies: This function is mostly self-contained and depends only on local values plus standard browser APIs.
- Return or side effects: Mostly returns a derived value or prepared structure back to the caller.

## frontend/js/core/dom.js

- Area: Core
- File role: This file provides shared dom utilities for the core layer.
- Line count: 55
- Named functions in this file: 6
- Important inline callbacks noted: 0
- Top-level behavior: mixes named helpers with direct runtime wiring for this feature.

### Named Functions

#### `buildTableSkeletonRows(colSpan, rowCount = 3)`

- Defined at: line 1
- What this is: This builds the table skeleton rows structure another part of the feature needs.
- Why this is used: It exists to keep object, markup, or URL assembly consistent.
- How this works: It performs small synchronous logic and returns the result.
- What this helps with: It helps other functions trust the assembled table skeleton rows shape.
- Key inputs: `colSpan` is an input value the function uses. `rowCount` is an input value the function uses.
- Key dependencies: This function is mostly self-contained and depends only on local values plus standard browser APIs.
- Return or side effects: Mostly returns a derived value or prepared structure back to the caller.

#### `buildAvailabilityLoadingMarkup(itemCount = 3)`

- Defined at: line 18
- What this is: This builds the availability loading markup structure another part of the feature needs.
- Why this is used: It exists to keep object, markup, or URL assembly consistent.
- How this works: It performs small synchronous logic and returns the result.
- What this helps with: It helps other functions trust the assembled availability loading markup shape.
- Key inputs: `itemCount` is an input value the function uses.
- Key dependencies: This function is mostly self-contained and depends only on local values plus standard browser APIs.
- Return or side effects: Mostly returns a derived value or prepared structure back to the caller.

#### `setHelperMessage(element, message, type = "")`

- Defined at: line 32
- What this is: This sets or writes the helper message state in the core layer.
- Why this is used: It exists so status or state changes follow one rule set.
- How this works: It writes text, markup, or created elements back into the UI and toggles CSS classes to reflect current state.
- What this helps with: It helps the UI communicate state or feedback in a standardized way.
- Key inputs: `element` is a DOM reference. `message` is user-facing feedback text. `type` controls a visual tone or behavior mode.
- Key dependencies: This function is mostly self-contained and depends only on local values plus standard browser APIs.
- Return or side effects: It works mainly through side effects, especially DOM updates, CSS class changes.

#### `setLastRefreshed(labelId, date = new Date()`

- Defined at: line 39
- What this is: This sets or writes the last refreshed state in the core layer.
- Why this is used: It exists so status or state changes follow one rule set.
- How this works: It reads current DOM or form values, computes date or time values, leans on helpers like `formatRefreshStamp`, and writes text, markup, or created elements back into the UI.
- What this helps with: It helps the UI communicate state or feedback in a standardized way.
- Key inputs: `labelId` is an input value the function uses. `date` represents scheduling input.
- Key dependencies: This function calls helpers such as `formatRefreshStamp`.
- Return or side effects: It works mainly through side effects, especially DOM updates.

#### `markOverviewAndBookingsRefreshed(date = new Date()`

- Defined at: line 45
- What this is: This is a support helper for the mark overview and bookings refreshed work in the core layer.
- Why this is used: It exists to keep repeated logic small and reusable.
- How this works: It computes date or time values and leans on helpers like `setLastRefreshed`.
- What this helps with: It helps reduce duplication and makes the calling code easier to read.
- Key inputs: `date` represents scheduling input.
- Key dependencies: This function calls helpers such as `setLastRefreshed`.
- Return or side effects: It mostly works through local computation and whatever the caller does with the result.

#### `setBookedNowPanelTone(bookedCount)`

- Defined at: line 50
- What this is: This sets or writes the booked now panel tone state in the core layer.
- Why this is used: It exists so status or state changes follow one rule set.
- How this works: It reads current DOM or form values and toggles CSS classes to reflect current state.
- What this helps with: It helps the UI communicate state or feedback in a standardized way.
- Key inputs: `bookedCount` is an input value the function uses.
- Key dependencies: This function is mostly self-contained and depends only on local values plus standard browser APIs.
- Return or side effects: It works mainly through side effects, especially CSS class changes.

## frontend/js/core/format.js

- Area: Core
- File role: This file provides shared format utilities for the core layer.
- Line count: 490
- Named functions in this file: 39
- Important inline callbacks noted: 0
- Top-level behavior: mixes named helpers with direct runtime wiring for this feature.

### Named Functions

#### `normalizeGender(value)`

- Defined at: line 75
- What this is: This normalizes the gender so later code sees one consistent shape.
- Why this is used: It exists so downstream code does not guess between multiple input shapes.
- How this works: It performs small synchronous logic and returns the result.
- What this helps with: It helps downstream code stay simple because inputs become consistent.
- Key inputs: `value` is an input value the function uses.
- Key dependencies: This function is mostly self-contained and depends only on local values plus standard browser APIs.
- Return or side effects: Mostly returns a derived value or prepared structure back to the caller.

#### `getProfileImagePath(gender)`

- Defined at: line 83
- What this is: This returns a derived profile image path value for the core layer.
- Why this is used: It exists to centralize a repeated lookup or calculation.
- How this works: It leans on helpers like `normalizeGender`.
- What this helps with: It helps other code ask for the current profile image path in one place.
- Key inputs: `gender` is an input value the function uses.
- Key dependencies: This function calls helpers such as `normalizeGender`.
- Return or side effects: Mostly returns a derived value or prepared structure back to the caller.

#### `isPastBeyondGrace(timestamp, graceMs = BOOKING_PAST_GRACE_MS)`

- Defined at: line 87
- What this is: This answers a yes-or-no rule about the past beyond grace flow.
- Why this is used: It exists so calling code can branch on one clear business rule.
- How this works: It computes date or time values.
- What this helps with: It helps business rules stay readable and testable.
- Key inputs: `timestamp` represents scheduling input. `graceMs` is an input value the function uses.
- Key dependencies: This function is mostly self-contained and depends only on local values plus standard browser APIs.
- Return or side effects: Mostly returns a derived value or prepared structure back to the caller.

#### `getLocalDateInputValue(date = new Date()`

- Defined at: line 92
- What this is: This returns a derived local date input value value for the core layer.
- Why this is used: It exists to centralize a repeated lookup or calculation.
- How this works: It computes date or time values.
- What this helps with: It helps other code ask for the current local date input value in one place.
- Key inputs: `date` represents scheduling input.
- Key dependencies: This function is mostly self-contained and depends only on local values plus standard browser APIs.
- Return or side effects: Mostly returns a derived value or prepared structure back to the caller.

#### `getLocalTimeInputValue(date = new Date()`

- Defined at: line 97
- What this is: This returns a derived local time input value value for the core layer.
- Why this is used: It exists to centralize a repeated lookup or calculation.
- How this works: It computes date or time values.
- What this helps with: It helps other code ask for the current local time input value in one place.
- Key inputs: `date` represents scheduling input.
- Key dependencies: This function is mostly self-contained and depends only on local values plus standard browser APIs.
- Return or side effects: Mostly returns a derived value or prepared structure back to the caller.

#### `normalizeTimeValueTo24(value)`

- Defined at: line 101
- What this is: This normalizes the time value to24 so later code sees one consistent shape.
- Why this is used: It exists so downstream code does not guess between multiple input shapes.
- How this works: It performs small synchronous logic and returns the result.
- What this helps with: It helps downstream code stay simple because inputs become consistent.
- Key inputs: `value` is an input value the function uses.
- Key dependencies: This function is mostly self-contained and depends only on local values plus standard browser APIs.
- Return or side effects: Mostly returns a derived value or prepared structure back to the caller.

#### `format24HourAs12Hour(value24)`

- Defined at: line 121
- What this is: This formats the format24 hour as12 hour into display-friendly output.
- Why this is used: It exists so raw values become consistent display text.
- How this works: It leans on helpers like `normalizeTimeValueTo24`.
- What this helps with: It helps the interface stay readable because raw values become human-friendly text.
- Key inputs: `value24` is an input value the function uses.
- Key dependencies: This function calls helpers such as `normalizeTimeValueTo24`.
- Return or side effects: Mostly returns a derived value or prepared structure back to the caller.

#### `getTimeInputValue24(inputElement)`

- Defined at: line 132
- What this is: This returns a derived time input value24 value for the core layer.
- Why this is used: It exists to centralize a repeated lookup or calculation.
- How this works: It leans on helpers like `normalizeTimeValueTo24`.
- What this helps with: It helps other code ask for the current time input value24 in one place.
- Key inputs: `inputElement` is a DOM reference.
- Key dependencies: This function calls helpers such as `normalizeTimeValueTo24`.
- Return or side effects: Mostly returns a derived value or prepared structure back to the caller.

#### `setTimeInputValue(inputElement, timeValue24)`

- Defined at: line 138
- What this is: This sets or writes the time input value state in the core layer.
- Why this is used: It exists so status or state changes follow one rule set.
- How this works: It leans on helpers like `normalizeTimeValueTo24`, `format24HourAs12Hour`.
- What this helps with: It helps the UI communicate state or feedback in a standardized way.
- Key inputs: `inputElement` is a DOM reference. `timeValue24` represents scheduling input.
- Key dependencies: This function calls helpers such as `normalizeTimeValueTo24`, `format24HourAs12Hour`.
- Return or side effects: It mostly works through local computation and whatever the caller does with the result.

#### `getTimeValueMinutes(value)`

- Defined at: line 153
- What this is: This returns a derived time value minutes value for the core layer.
- Why this is used: It exists to centralize a repeated lookup or calculation.
- How this works: It leans on helpers like `normalizeTimeValueTo24`.
- What this helps with: It helps other code ask for the current time value minutes in one place.
- Key inputs: `value` is an input value the function uses.
- Key dependencies: This function calls helpers such as `normalizeTimeValueTo24`.
- Return or side effects: Mostly returns a derived value or prepared structure back to the caller.

#### `normalizeTimeZone(value)`

- Defined at: line 162
- What this is: This normalizes the time zone so later code sees one consistent shape.
- Why this is used: It exists so downstream code does not guess between multiple input shapes.
- How this works: It performs small synchronous logic and returns the result.
- What this helps with: It helps downstream code stay simple because inputs become consistent.
- Key inputs: `value` is an input value the function uses.
- Key dependencies: This function is mostly self-contained and depends only on local values plus standard browser APIs.
- Return or side effects: Mostly returns a derived value or prepared structure back to the caller.

#### `getTimeZoneCode(date, timeZone)`

- Defined at: line 167
- What this is: This returns a derived time zone code value for the core layer.
- Why this is used: It exists to centralize a repeated lookup or calculation.
- How this works: It leans on helpers like `normalizeTimeZone`.
- What this helps with: It helps other code ask for the current time zone code in one place.
- Key inputs: `date` represents scheduling input. `timeZone` represents scheduling input.
- Key dependencies: This function calls helpers such as `normalizeTimeZone`.
- Return or side effects: Mostly returns a derived value or prepared structure back to the caller.

#### `formatDate(value, timeZone)`

- Defined at: line 189
- What this is: This formats the date into display-friendly output.
- Why this is used: It exists so raw values become consistent display text.
- How this works: It computes date or time values and leans on helpers like `normalizeTimeZone`.
- What this helps with: It helps the interface stay readable because raw values become human-friendly text.
- Key inputs: `value` is an input value the function uses. `timeZone` represents scheduling input.
- Key dependencies: This function calls helpers such as `normalizeTimeZone`.
- Return or side effects: Mostly returns a derived value or prepared structure back to the caller.

#### `formatTime(value, timeZone, { includeTimeZone = true } = {})`

- Defined at: line 206
- What this is: This formats the time into display-friendly output.
- Why this is used: It exists so raw values become consistent display text.
- How this works: It computes date or time values and leans on helpers like `normalizeTimeZone`, `getTimeZoneCode`.
- What this helps with: It helps the interface stay readable because raw values become human-friendly text.
- Key inputs: `value` is an input value the function uses. `timeZone` represents scheduling input. `includeTimeZone` represents scheduling input.
- Key dependencies: This function calls helpers such as `normalizeTimeZone`, `getTimeZoneCode`.
- Return or side effects: Mostly returns a derived value or prepared structure back to the caller.

#### `formatDateTime(value, timeZone, options = {})`

- Defined at: line 230
- What this is: This formats the date time into display-friendly output.
- Why this is used: It exists so raw values become consistent display text.
- How this works: It leans on helpers like `formatDate`, `formatTime`.
- What this helps with: It helps the interface stay readable because raw values become human-friendly text.
- Key inputs: `value` is an input value the function uses. `timeZone` represents scheduling input. `options` is an input value the function uses.
- Key dependencies: This function calls helpers such as `formatDate`, `formatTime`.
- Return or side effects: Mostly returns a derived value or prepared structure back to the caller.

#### `formatCompactDateTime(value, timeZone)`

- Defined at: line 235
- What this is: This formats the compact date time into display-friendly output.
- Why this is used: It exists so raw values become consistent display text.
- How this works: It leans on helpers like `formatDate`, `formatTime`.
- What this helps with: It helps the interface stay readable because raw values become human-friendly text.
- Key inputs: `value` is an input value the function uses. `timeZone` represents scheduling input.
- Key dependencies: This function calls helpers such as `formatDate`, `formatTime`.
- Return or side effects: Mostly returns a derived value or prepared structure back to the caller.

#### `formatTimeRange(startValue, endValue, timeZone)`

- Defined at: line 242
- What this is: This formats the time range into display-friendly output.
- Why this is used: It exists so raw values become consistent display text.
- How this works: It computes date or time values and leans on helpers like `formatTime`, `parseDateValue`, `getTimeZoneCode`.
- What this helps with: It helps the interface stay readable because raw values become human-friendly text.
- Key inputs: `startValue` is an input value the function uses. `endValue` is an input value the function uses. `timeZone` represents scheduling input.
- Key dependencies: This function calls helpers such as `formatTime`, `parseDateValue`, `getTimeZoneCode`.
- Return or side effects: Mostly returns a derived value or prepared structure back to the caller.

#### `getStatusClass(status)`

- Defined at: line 251
- What this is: This returns a derived status class value for the core layer.
- Why this is used: It exists to centralize a repeated lookup or calculation.
- How this works: It performs small synchronous logic and returns the result.
- What this helps with: It helps other code ask for the current status class in one place.
- Key inputs: `status` is an input value the function uses.
- Key dependencies: This function is mostly self-contained and depends only on local values plus standard browser APIs.
- Return or side effects: Mostly returns a derived value or prepared structure back to the caller.

#### `formatRefreshStamp(date = new Date()`

- Defined at: line 260
- What this is: This formats the refresh stamp into display-friendly output.
- Why this is used: It exists so raw values become consistent display text.
- How this works: It computes date or time values and leans on helpers like `formatTime`.
- What this helps with: It helps the interface stay readable because raw values become human-friendly text.
- Key inputs: `date` represents scheduling input.
- Key dependencies: This function calls helpers such as `formatTime`.
- Return or side effects: Mostly returns a derived value or prepared structure back to the caller.

#### `getDurationMinutes(value, fallback = 60)`

- Defined at: line 265
- What this is: This returns a derived duration minutes value for the core layer.
- Why this is used: It exists to centralize a repeated lookup or calculation.
- How this works: It performs small synchronous logic and returns the result.
- What this helps with: It helps other code ask for the current duration minutes in one place.
- Key inputs: `value` is an input value the function uses. `fallback` is an input value the function uses.
- Key dependencies: This function is mostly self-contained and depends only on local values plus standard browser APIs.
- Return or side effects: Mostly returns a derived value or prepared structure back to the caller.

#### `parseDateValue(value)`

- Defined at: line 271
- What this is: This parses raw date value input into a usable value.
- Why this is used: It exists so raw strings become predictable values before business logic uses them.
- How this works: It computes date or time values.
- What this helps with: It helps convert raw input into something safe for the rest of the code.
- Key inputs: `value` is an input value the function uses.
- Key dependencies: This function is mostly self-contained and depends only on local values plus standard browser APIs.
- Return or side effects: Mostly returns a derived value or prepared structure back to the caller.

#### `toLocalDateInputValue(value)`

- Defined at: line 277
- What this is: This is a support helper for the to local date input value work in the core layer.
- Why this is used: It exists to keep repeated logic small and reusable.
- How this works: It computes date or time values and leans on helpers like `parseDateValue`.
- What this helps with: It helps reduce duplication and makes the calling code easier to read.
- Key inputs: `value` is an input value the function uses.
- Key dependencies: This function calls helpers such as `parseDateValue`.
- Return or side effects: Mostly returns a derived value or prepared structure back to the caller.

#### `toLocalTimeInputValue(value)`

- Defined at: line 284
- What this is: This is a support helper for the to local time input value work in the core layer.
- Why this is used: It exists to keep repeated logic small and reusable.
- How this works: It leans on helpers like `parseDateValue`.
- What this helps with: It helps reduce duplication and makes the calling code easier to read.
- Key inputs: `value` is an input value the function uses.
- Key dependencies: This function calls helpers such as `parseDateValue`.
- Return or side effects: Mostly returns a derived value or prepared structure back to the caller.

#### `getMinutesBetween(startValue, endValue, fallback = 60)`

- Defined at: line 290
- What this is: This returns a derived minutes between value for the core layer.
- Why this is used: It exists to centralize a repeated lookup or calculation.
- How this works: It leans on helpers like `parseDateValue`.
- What this helps with: It helps other code ask for the current minutes between in one place.
- Key inputs: `startValue` is an input value the function uses. `endValue` is an input value the function uses. `fallback` is an input value the function uses.
- Key dependencies: This function calls helpers such as `parseDateValue`.
- Return or side effects: Mostly returns a derived value or prepared structure back to the caller.

#### `buildWindowFromLocalInputs(dateValue, timeValue, durationValue)`

- Defined at: line 298
- What this is: This builds the window from local inputs structure another part of the feature needs.
- Why this is used: It exists to keep object, markup, or URL assembly consistent.
- How this works: It computes date or time values and leans on helpers like `normalizeTimeValueTo24`, `getDurationMinutes`.
- What this helps with: It helps other functions trust the assembled window from local inputs shape.
- Key inputs: `dateValue` represents scheduling input. `timeValue` represents scheduling input. `durationValue` represents scheduling input.
- Key dependencies: This function calls helpers such as `normalizeTimeValueTo24`, `getDurationMinutes`.
- Return or side effects: Mostly returns a derived value or prepared structure back to the caller.

#### `ensureDurationOption(selectElement, minutes)`

- Defined at: line 316
- What this is: This ensures the duration option requirement is ready before the flow continues.
- Why this is used: It exists so later logic can assume a prerequisite is already satisfied.
- How this works: It reads current DOM or form values, leans on helpers like `getDurationMinutes`, and writes text, markup, or created elements back into the UI.
- What this helps with: It helps later code run with fewer defensive checks.
- Key inputs: `selectElement` is a DOM reference. `minutes` is an input value the function uses.
- Key dependencies: This function calls helpers such as `getDurationMinutes`.
- Return or side effects: Mostly returns a derived value or prepared structure back to the caller.

#### `escapeHtml(value)`

- Defined at: line 329
- What this is: This is a support helper for the escape html work in the core layer.
- Why this is used: It exists to keep repeated logic small and reusable.
- How this works: It performs small synchronous logic and returns the result.
- What this helps with: It helps reduce duplication and makes the calling code easier to read.
- Key inputs: `value` is an input value the function uses.
- Key dependencies: This function is mostly self-contained and depends only on local values plus standard browser APIs.
- Return or side effects: Mostly returns a derived value or prepared structure back to the caller.

#### `normalizeRoomName(roomName)`

- Defined at: line 338
- What this is: This normalizes the room name so later code sees one consistent shape.
- Why this is used: It exists so downstream code does not guess between multiple input shapes.
- How this works: It performs small synchronous logic and returns the result.
- What this helps with: It helps downstream code stay simple because inputs become consistent.
- Key inputs: `roomName` carries room data or a room id.
- Key dependencies: This function is mostly self-contained and depends only on local values plus standard browser APIs.
- Return or side effects: Mostly returns a derived value or prepared structure back to the caller.

#### `getRoomImage(room)`

- Defined at: line 345
- What this is: This returns a derived room image value for the core layer.
- Why this is used: It exists to centralize a repeated lookup or calculation.
- How this works: It leans on helpers like `normalizeRoomName`.
- What this helps with: It helps other code ask for the current room image in one place.
- Key inputs: `room` carries room data or a room id.
- Key dependencies: This function calls helpers such as `normalizeRoomName`.
- Return or side effects: Mostly returns a derived value or prepared structure back to the caller.

#### `isAmenityEnabled(value)`

- Defined at: line 351
- What this is: This answers a yes-or-no rule about the amenity enabled flow.
- Why this is used: It exists so calling code can branch on one clear business rule.
- How this works: It performs small synchronous logic and returns the result.
- What this helps with: It helps business rules stay readable and testable.
- Key inputs: `value` is an input value the function uses.
- Key dependencies: This function is mostly self-contained and depends only on local values plus standard browser APIs.
- Return or side effects: Mostly returns a derived value or prepared structure back to the caller.

#### `getRoomAmenities(room)`

- Defined at: line 355
- What this is: This returns a derived room amenities value for the core layer.
- Why this is used: It exists to centralize a repeated lookup or calculation.
- How this works: It leans on helpers like `isAmenityEnabled`.
- What this helps with: It helps other code ask for the current room amenities in one place.
- Key inputs: `room` carries room data or a room id.
- Key dependencies: This function calls helpers such as `isAmenityEnabled`.
- Return or side effects: Mostly returns a derived value or prepared structure back to the caller.

#### `buildRoomFeatures(room, { limit = null } = {})`

- Defined at: line 359
- What this is: This builds the room features structure another part of the feature needs.
- Why this is used: It exists to keep object, markup, or URL assembly consistent.
- How this works: It leans on helpers like `getRoomAmenities`.
- What this helps with: It helps other functions trust the assembled room features shape.
- Key inputs: `room` carries room data or a room id. `limit` is an input value the function uses.
- Key dependencies: This function calls helpers such as `getRoomAmenities`.
- Return or side effects: Mostly returns a derived value or prepared structure back to the caller.

#### `createAmenityIcon(iconKey)`

- Defined at: line 373
- What this is: This creates the amenity icon object or DOM fragment.
- Why this is used: It exists so reusable objects or DOM fragments are built the same way each time.
- How this works: It reads current DOM or form values and writes text, markup, or created elements back into the UI.
- What this helps with: It helps generated UI fragments stay uniform and easier to maintain.
- Key inputs: `iconKey` is an input value the function uses.
- Key dependencies: This function is mostly self-contained and depends only on local values plus standard browser APIs.
- Return or side effects: Mostly returns a derived value or prepared structure back to the caller.

#### `renderRoomAmenities(container, room)`

- Defined at: line 381
- What this is: This is the render function for the room amenities UI in the core layer.
- Why this is used: It exists so UI output is rebuilt from current state instead of patched everywhere.
- How this works: It reads current DOM or form values, leans on helpers like `getRoomAmenities`, `createAmenityIcon`, uses shared state such as `emptyState`, and writes text, markup, or created elements back into the UI.
- What this helps with: It helps keep the visible UI aligned with the latest state.
- Key inputs: `container` is a DOM reference. `room` carries room data or a room id.
- Key dependencies: This function calls helpers such as `getRoomAmenities`, `createAmenityIcon`, touches shared runtime values like `emptyState`.
- Return or side effects: It works mainly through side effects, especially DOM updates.

#### `isRoomAvailable(room)`

- Defined at: line 408
- What this is: This answers a yes-or-no rule about the room available flow.
- Why this is used: It exists so calling code can branch on one clear business rule.
- How this works: It performs small synchronous logic and returns the result.
- What this helps with: It helps business rules stay readable and testable.
- Key inputs: `room` carries room data or a room id.
- Key dependencies: This function is mostly self-contained and depends only on local values plus standard browser APIs.
- Return or side effects: Mostly returns a derived value or prepared structure back to the caller.

#### `getRoomAvailabilityLabel(room)`

- Defined at: line 412
- What this is: This returns a derived room availability label value for the core layer.
- Why this is used: It exists to centralize a repeated lookup or calculation.
- How this works: It computes date or time values and leans on helpers like `isRoomAvailable`, `parseDateValue`, `formatDateTime`.
- What this helps with: It helps other code ask for the current room availability label in one place.
- Key inputs: `room` carries room data or a room id.
- Key dependencies: This function calls helpers such as `isRoomAvailable`, `parseDateValue`, `formatDateTime`.
- Return or side effects: Mostly returns a derived value or prepared structure back to the caller.

#### `getRoomPurposeText(room)`

- Defined at: line 428
- What this is: This returns a derived room purpose text value for the core layer.
- Why this is used: It exists to centralize a repeated lookup or calculation.
- How this works: It leans on helpers like `normalizeRoomName`.
- What this helps with: It helps other code ask for the current room purpose text in one place.
- Key inputs: `room` carries room data or a room id.
- Key dependencies: This function calls helpers such as `normalizeRoomName`.
- Return or side effects: Mostly returns a derived value or prepared structure back to the caller.

#### `getRoomSetupText(room)`

- Defined at: line 462
- What this is: This returns a derived room setup text value for the core layer.
- Why this is used: It exists to centralize a repeated lookup or calculation.
- How this works: It leans on helpers like `isAmenityEnabled`.
- What this helps with: It helps other code ask for the current room setup text in one place.
- Key inputs: `room` carries room data or a room id.
- Key dependencies: This function calls helpers such as `isAmenityEnabled`.
- Return or side effects: Mostly returns a derived value or prepared structure back to the caller.

#### `getRoomComfortText(room)`

- Defined at: line 478
- What this is: This returns a derived room comfort text value for the core layer.
- Why this is used: It exists to centralize a repeated lookup or calculation.
- How this works: It leans on helpers like `isAmenityEnabled`.
- What this helps with: It helps other code ask for the current room comfort text in one place.
- Key inputs: `room` carries room data or a room id.
- Key dependencies: This function calls helpers such as `isAmenityEnabled`.
- Return or side effects: Mostly returns a derived value or prepared structure back to the caller.

## frontend/js/core/pagination.js

- Area: Core
- File role: This file provides shared pagination utilities for the core layer.
- Line count: 96
- Named functions in this file: 6
- Important inline callbacks noted: 0
- Top-level behavior: mixes named helpers with direct runtime wiring for this feature.

### Named Functions

#### `clamp(value, min, max)`

- Defined at: line 1
- What this is: This is a support helper for the clamp work in the core layer.
- Why this is used: It exists to keep repeated logic small and reusable.
- How this works: It performs small synchronous logic and returns the result.
- What this helps with: It helps reduce duplication and makes the calling code easier to read.
- Key inputs: `value` is an input value the function uses. `min` is an input value the function uses. `max` is an input value the function uses.
- Key dependencies: This function is mostly self-contained and depends only on local values plus standard browser APIs.
- Return or side effects: Mostly returns a derived value or prepared structure back to the caller.

#### `getPaginationConfig(key)`

- Defined at: line 5
- What this is: This returns a derived pagination config value for the core layer.
- Why this is used: It exists to centralize a repeated lookup or calculation.
- How this works: It uses shared state such as `paginationState`.
- What this helps with: It helps other code ask for the current pagination config in one place.
- Key inputs: `key` is an input value the function uses.
- Key dependencies: This function touches shared runtime values like `paginationState`.
- Return or side effects: Mostly returns a derived value or prepared structure back to the caller.

#### `setPaginationRows(key, rows)`

- Defined at: line 9
- What this is: This sets or writes the pagination rows state in the core layer.
- Why this is used: It exists so status or state changes follow one rule set.
- How this works: It leans on helpers like `getPaginationConfig`.
- What this helps with: It helps the UI communicate state or feedback in a standardized way.
- Key inputs: `key` is an input value the function uses. `rows` is an input value the function uses.
- Key dependencies: This function calls helpers such as `getPaginationConfig`.
- Return or side effects: It mostly works through local computation and whatever the caller does with the result.

#### `getPaginationTotalPages(key)`

- Defined at: line 16
- What this is: This returns a derived pagination total pages value for the core layer.
- Why this is used: It exists to centralize a repeated lookup or calculation.
- How this works: It leans on helpers like `getPaginationConfig`.
- What this helps with: It helps other code ask for the current pagination total pages in one place.
- Key inputs: `key` is an input value the function uses.
- Key dependencies: This function calls helpers such as `getPaginationConfig`.
- Return or side effects: Mostly returns a derived value or prepared structure back to the caller.

#### `getPaginationSlice(key)`

- Defined at: line 22
- What this is: This returns a derived pagination slice value for the core layer.
- Why this is used: It exists to centralize a repeated lookup or calculation.
- How this works: It leans on helpers like `getPaginationConfig`, `getPaginationTotalPages`, `clamp`.
- What this helps with: It helps other code ask for the current pagination slice in one place.
- Key inputs: `key` is an input value the function uses.
- Key dependencies: This function calls helpers such as `getPaginationConfig`, `getPaginationTotalPages`, `clamp`.
- Return or side effects: Mostly returns a derived value or prepared structure back to the caller.

#### `renderPaginationControls(containerId, key)`

- Defined at: line 34
- What this is: This is the render function for the pagination controls UI in the core layer.
- Why this is used: It exists so UI output is rebuilt from current state instead of patched everywhere.
- How this works: It reads current DOM or form values, leans on helpers like `getPaginationConfig`, `getPaginationTotalPages`, `clamp`, writes text, markup, or created elements back into the UI, and refreshes pagination controls.
- What this helps with: It helps keep the visible UI aligned with the latest state.
- Key inputs: `containerId` is a DOM reference. `key` is an input value the function uses.
- Key dependencies: This function calls helpers such as `getPaginationConfig`, `getPaginationTotalPages`, `clamp`.
- Return or side effects: It works mainly through side effects, especially DOM updates.

## frontend/js/core/state.js

- Area: Core
- File role: This file provides shared state utilities for the core layer.
- Line count: 79
- Named functions in this file: 4
- Important inline callbacks noted: 0
- Top-level behavior: mixes named helpers with direct runtime wiring for this feature.

### Named Functions

#### `getStoredEmployee()`

- Defined at: line 1
- What this is: This returns a derived stored employee value for the core layer.
- Why this is used: It exists to centralize a repeated lookup or calculation.
- How this works: It reads current DOM or form values, builds or interprets URL/query data, uses shared state such as `currentEmployee`, `currentEmployeeId`, `currentRole`, `isAdmin`, reads or writes browser storage, and can redirect or alter browser navigation.
- What this helps with: It helps other code ask for the current stored employee in one place.
- Key inputs: This function does not take direct parameters; it mainly uses surrounding state, cached DOM references, or globals.
- Key dependencies: This function touches shared runtime values like `currentEmployee`, `currentEmployeeId`, `currentRole`, `isAdmin`.
- Return or side effects: Mostly returns a derived value or prepared structure back to the caller.

#### `setCurrentEmployee(employee)`

- Defined at: line 18
- What this is: This sets or writes the current employee state in the core layer.
- Why this is used: It exists so status or state changes follow one rule set.
- How this works: It uses shared state such as `currentEmployee`, `currentEmployeeId`, `isAdmin` and reads or writes browser storage.
- What this helps with: It helps the UI communicate state or feedback in a standardized way.
- Key inputs: `employee` carries people-related data.
- Key dependencies: This function touches shared runtime values like `currentEmployee`, `currentEmployeeId`, `isAdmin`.
- Return or side effects: It works mainly through side effects, especially browser storage writes.

#### `clearStoredAuth()`

- Defined at: line 31
- What this is: This clears or resets the stored auth state.
- Why this is used: It exists so the feature can return to a known clean baseline.
- How this works: It reads or writes browser storage.
- What this helps with: It helps avoid stale errors, selections, and temporary state.
- Key inputs: This function does not take direct parameters; it mainly uses surrounding state, cached DOM references, or globals.
- Key dependencies: This function is mostly self-contained and depends only on local values plus standard browser APIs.
- Return or side effects: It works mainly through side effects, especially browser storage writes.

#### `enforceRoleAccess()`

- Defined at: line 36
- What this is: This enforces the role access rule in the frontend.
- Why this is used: It exists so the frontend actively blocks states that should not be allowed.
- How this works: It uses shared state such as `currentRole`, `isAdmin`, `finderRoomsById`, `availabilityRoomsById`, `bookingsById`, `selectedRoom` and can redirect or alter browser navigation.
- What this helps with: It helps protect the user from invalid or blocked states.
- Key inputs: This function does not take direct parameters; it mainly uses surrounding state, cached DOM references, or globals.
- Key dependencies: This function touches shared runtime values like `currentRole`, `isAdmin`, `finderRoomsById`, `availabilityRoomsById`, `bookingsById`, `selectedRoom`.
- Return or side effects: Mostly returns a derived value or prepared structure back to the caller.

## frontend/js/dashboard/admin/employees/employee-directory.js

- Area: Dashboard Admin
- File role: This file owns employee directory behavior in the dashboard admin layer.
- Line count: 498
- Named functions in this file: 16
- Important inline callbacks noted: 15
- Top-level behavior: mixes named helpers with direct runtime wiring for this feature.

### Named Functions

#### `populateAdminLocationOptions()`

- Defined at: line 1
- What this is: This fills the admin location options UI with options or values.
- Why this is used: It exists so dropdowns and filters reflect the current dataset.
- How this works: It reads current DOM or form values and writes text, markup, or created elements back into the UI.
- What this helps with: It helps selects and filters stay in sync with live data.
- Key inputs: This function does not take direct parameters; it mainly uses surrounding state, cached DOM references, or globals.
- Key dependencies: This function is mostly self-contained and depends only on local values plus standard browser APIs.
- Return or side effects: It works mainly through side effects, especially DOM updates.

#### `populateAdminManagerOptions()`

- Defined at: line 20
- What this is: This fills the admin manager options UI with options or values.
- Why this is used: It exists so dropdowns and filters reflect the current dataset.
- How this works: It reads current DOM or form values, uses shared state such as `adminEmployeeDirectory`, and writes text, markup, or created elements back into the UI.
- What this helps with: It helps selects and filters stay in sync with live data.
- Key inputs: This function does not take direct parameters; it mainly uses surrounding state, cached DOM references, or globals.
- Key dependencies: This function touches shared runtime values like `adminEmployeeDirectory`.
- Return or side effects: It works mainly through side effects, especially DOM updates.

#### `async loadAdminLocations()`

- Defined at: line 43
- What this is: This is the data-loading function for the admin locations flow in the dashboard admin layer.
- Why this is used: It exists so loading, success, and error paths stay consistent. It also keeps backend communication tied to the right UI step.
- How this works: It talks to backend routes like `/locations`, leans on helpers like `apiFetch`, `populateAdminLocationOptions`, `populateAdminRoomLocationOptions`, `populateAdminRoomFilters`, and uses shared state such as `currentRole`.
- What this helps with: It helps the user see fresh data and gives the feature a clear refresh path.
- Key inputs: This function does not take direct parameters; it mainly uses surrounding state, cached DOM references, or globals.
- Key dependencies: This function calls helpers such as `apiFetch`, `populateAdminLocationOptions`, `populateAdminRoomLocationOptions`, `populateAdminRoomFilters`, touches shared runtime values like `currentRole`, depends on backend routes including `/locations`.
- Return or side effects: It works mainly through side effects, especially network requests.

#### `getAdminEmployeeFilterElements()`

- Defined at: line 57
- What this is: This returns a derived admin employee filter elements value for the dashboard admin layer.
- Why this is used: It exists to centralize a repeated lookup or calculation.
- How this works: It reads current DOM or form values.
- What this helps with: It helps other code ask for the current admin employee filter elements in one place.
- Key inputs: This function does not take direct parameters; it mainly uses surrounding state, cached DOM references, or globals.
- Key dependencies: This function is mostly self-contained and depends only on local values plus standard browser APIs.
- Return or side effects: Mostly returns a derived value or prepared structure back to the caller.

#### `getAdminEmployeeFilterValues()`

- Defined at: line 69
- What this is: This returns a derived admin employee filter values value for the dashboard admin layer.
- Why this is used: It exists to centralize a repeated lookup or calculation.
- How this works: It leans on helpers like `getAdminEmployeeFilterElements`.
- What this helps with: It helps other code ask for the current admin employee filter values in one place.
- Key inputs: This function does not take direct parameters; it mainly uses surrounding state, cached DOM references, or globals.
- Key dependencies: This function calls helpers such as `getAdminEmployeeFilterElements`.
- Return or side effects: Mostly returns a derived value or prepared structure back to the caller.

#### `hasActiveAdminEmployeeFilters()`

- Defined at: line 81
- What this is: This answers a yes-or-no rule about the active admin employee filters flow.
- Why this is used: It exists so calling code can branch on one clear business rule.
- How this works: It leans on helpers like `getAdminEmployeeFilterValues`.
- What this helps with: It helps business rules stay readable and testable.
- Key inputs: This function does not take direct parameters; it mainly uses surrounding state, cached DOM references, or globals.
- Key dependencies: This function calls helpers such as `getAdminEmployeeFilterValues`.
- Return or side effects: Mostly returns a derived value or prepared structure back to the caller.

#### `populateAdminEmployeeFilters()`

- Defined at: line 85
- What this is: This fills the admin employee filters UI with options or values.
- Why this is used: It exists so dropdowns and filters reflect the current dataset.
- How this works: It reads current DOM or form values, leans on helpers like `getAdminEmployeeFilterElements`, uses shared state such as `adminEmployeeDirectory`, and writes text, markup, or created elements back into the UI.
- What this helps with: It helps selects and filters stay in sync with live data.
- Key inputs: This function does not take direct parameters; it mainly uses surrounding state, cached DOM references, or globals.
- Key dependencies: This function calls helpers such as `getAdminEmployeeFilterElements`, touches shared runtime values like `adminEmployeeDirectory`.
- Return or side effects: It works mainly through side effects, especially DOM updates.

#### `setAdminEmployeeFilterSummary(filteredCount, totalCount)`

- Defined at: line 122
- What this is: This sets or writes the admin employee filter summary state in the dashboard admin layer.
- Why this is used: It exists so status or state changes follow one rule set.
- How this works: It leans on helpers like `getAdminEmployeeFilterElements`, `hasActiveAdminEmployeeFilters` and writes text, markup, or created elements back into the UI.
- What this helps with: It helps the UI communicate state or feedback in a standardized way.
- Key inputs: `filteredCount` is an input value the function uses. `totalCount` is an input value the function uses.
- Key dependencies: This function calls helpers such as `getAdminEmployeeFilterElements`, `hasActiveAdminEmployeeFilters`.
- Return or side effects: It works mainly through side effects, especially DOM updates.

#### `applyAdminEmployeeFilters()`

- Defined at: line 139
- What this is: This applies the admin employee filters rule to the live UI state.
- Why this is used: It exists so a computed rule is actually pushed into the live UI at the right time.
- How this works: It leans on helpers like `getAdminEmployeeFilterValues`, `setPaginationRows`, `setAdminEmployeeFilterSummary`, `renderEmployeePage` and uses shared state such as `adminEmployeeDirectory`.
- What this helps with: It helps the interface enforce the right rule at the exact place the user feels it.
- Key inputs: This function does not take direct parameters; it mainly uses surrounding state, cached DOM references, or globals.
- Key dependencies: This function calls helpers such as `getAdminEmployeeFilterValues`, `setPaginationRows`, `setAdminEmployeeFilterSummary`, `renderEmployeePage`, touches shared runtime values like `adminEmployeeDirectory`.
- Return or side effects: It mostly works through local computation and whatever the caller does with the result.

#### `renderEmployeeTable(rows)`

- Defined at: line 199
- What this is: This is the render function for the employee table UI in the dashboard admin layer.
- Why this is used: It exists so UI output is rebuilt from current state instead of patched everywhere.
- How this works: It reads current DOM or form values, leans on helpers like `populateAdminManagerOptions`, `populateAdminEmployeeFilters`, `applyAdminEmployeeFilters`, and uses shared state such as `adminEmployeeDirectory`.
- What this helps with: It helps keep the visible UI aligned with the latest state.
- Key inputs: `rows` is an input value the function uses.
- Key dependencies: This function calls helpers such as `populateAdminManagerOptions`, `populateAdminEmployeeFilters`, `applyAdminEmployeeFilters`, touches shared runtime values like `adminEmployeeDirectory`.
- Return or side effects: It mostly works through local computation and whatever the caller does with the result.

#### `getAdminEmployeeManagerLabel(row)`

- Defined at: line 209
- What this is: This returns a derived admin employee manager label value for the dashboard admin layer.
- Why this is used: It exists to centralize a repeated lookup or calculation.
- How this works: It performs small synchronous logic and returns the result.
- What this helps with: It helps other code ask for the current admin employee manager label in one place.
- Key inputs: `row` is an input value the function uses.
- Key dependencies: This function is mostly self-contained and depends only on local values plus standard browser APIs.
- Return or side effects: Mostly returns a derived value or prepared structure back to the caller.

#### `getAdminEmployeeHireDateLabel(value)`

- Defined at: line 215
- What this is: This returns a derived admin employee hire date label value for the dashboard admin layer.
- Why this is used: It exists to centralize a repeated lookup or calculation.
- How this works: It leans on helpers like `parseDateValue`.
- What this helps with: It helps other code ask for the current admin employee hire date label in one place.
- Key inputs: `value` is an input value the function uses.
- Key dependencies: This function calls helpers such as `parseDateValue`.
- Return or side effects: Mostly returns a derived value or prepared structure back to the caller.

#### `getAdminEmployeeStatusLabel(row)`

- Defined at: line 221
- What this is: This returns a derived admin employee status label value for the dashboard admin layer.
- Why this is used: It exists to centralize a repeated lookup or calculation.
- How this works: It performs small synchronous logic and returns the result.
- What this helps with: It helps other code ask for the current admin employee status label in one place.
- Key inputs: `row` is an input value the function uses.
- Key dependencies: This function is mostly self-contained and depends only on local values plus standard browser APIs.
- Return or side effects: Mostly returns a derived value or prepared structure back to the caller.

#### `renderEmployeePage()`

- Defined at: line 227
- What this is: This is the render function for the employee page UI in the dashboard admin layer.
- Why this is used: It exists so UI output is rebuilt from current state instead of patched everywhere.
- How this works: It reads current DOM or form values, leans on helpers like `getPaginationSlice`, `hasActiveAdminEmployeeFilters`, `renderPaginationControls`, `escapeHtml`, `getAdminEmployeeManagerLabel`, `normalizeGender`, uses shared state such as `adminEmployeeDirectory`, `currentEmployeeId`, writes text, markup, or created elements back into the UI, and refreshes pagination controls.
- What this helps with: It helps keep the visible UI aligned with the latest state.
- Key inputs: This function does not take direct parameters; it mainly uses surrounding state, cached DOM references, or globals.
- Key dependencies: This function calls helpers such as `getPaginationSlice`, `hasActiveAdminEmployeeFilters`, `renderPaginationControls`, `escapeHtml`, `getAdminEmployeeManagerLabel`, `normalizeGender`, touches shared runtime values like `adminEmployeeDirectory`, `currentEmployeeId`.
- Return or side effects: It works mainly through side effects, especially DOM updates.

#### `async loadEmployees()`

- Defined at: line 279
- What this is: This is the data-loading function for the employees flow in the dashboard admin layer.
- Why this is used: It exists so loading, success, and error paths stay consistent. It also keeps backend communication tied to the right UI step.
- How this works: It reads current DOM or form values, talks to backend routes like `/admin/employees`, leans on helpers like `getAdminEmployeeFilterElements`, `apiFetch`, `renderEmployeeTable`, `populateAdminManagerOptions`, `populateAdminEmployeeFilters`, `setPaginationRows`, uses shared state such as `currentRole`, `adminEmployeeDirectory`, writes text, markup, or created elements back into the UI, and refreshes pagination controls.
- What this helps with: It helps the user see fresh data and gives the feature a clear refresh path.
- Key inputs: This function does not take direct parameters; it mainly uses surrounding state, cached DOM references, or globals.
- Key dependencies: This function calls helpers such as `getAdminEmployeeFilterElements`, `apiFetch`, `renderEmployeeTable`, `populateAdminManagerOptions`, `populateAdminEmployeeFilters`, `setPaginationRows`, touches shared runtime values like `currentRole`, `adminEmployeeDirectory`, depends on backend routes including `/admin/employees`.
- Return or side effects: It works mainly through side effects, especially DOM updates, network requests.

#### `initializeAdminSettings()`

- Defined at: line 306
- What this is: This is the main setup function for the admin settings flow in the dashboard admin layer.
- Why this is used: It exists so one-time setup stays in one place.
- How this works: It reads current DOM or form values, leans on helpers like `getAdminEmployeeFilterElements`, `getAdminRoomFilterElements`, `loadAdminLocations`, `loadEmployees`, `openEmployeeAdminModal`, `loadRooms`, uses shared state such as `currentRole`, and wires listeners for later user actions.
- What this helps with: It helps the feature become usable as soon as the page loads.
- Key inputs: This function does not take direct parameters; it mainly uses surrounding state, cached DOM references, or globals.
- Key dependencies: This function calls helpers such as `getAdminEmployeeFilterElements`, `getAdminRoomFilterElements`, `loadAdminLocations`, `loadEmployees`, `openEmployeeAdminModal`, `loadRooms`, touches shared runtime values like `currentRole`.
- Return or side effects: It works mainly through side effects, especially listener registration.

### Important Inline Callbacks

#### Inline Callback At Line 320

- Source marker: `refreshBtn.addEventListener("click", () => {`
- What this is: This is the inline click listener attached to `refreshBtn`.
- Why this is used: It stays beside the event registration so the trigger and reaction are easy to read together.
- How this works: When the browser fires that event, the callback reads closure state, performs the local UI action, and may call named helpers for heavier work.
- What this helps with: It helps the interface respond directly to user input without creating another global helper.

#### Inline Callback At Line 326

- Source marker: `openAddEmployeeModalBtn.addEventListener("click", () => {`
- What this is: This is the inline click listener attached to `openAddEmployeeModalBtn`.
- Why this is used: It stays beside the event registration so the trigger and reaction are easy to read together.
- How this works: When the browser fires that event, the callback reads closure state, performs the local UI action, and may call named helpers for heavier work.
- What this helps with: It helps the interface respond directly to user input without creating another global helper.

#### Inline Callback At Line 332

- Source marker: `refreshRoomsBtn.addEventListener("click", () => {`
- What this is: This is the inline click listener attached to `refreshRoomsBtn`.
- Why this is used: It stays beside the event registration so the trigger and reaction are easy to read together.
- How this works: When the browser fires that event, the callback reads closure state, performs the local UI action, and may call named helpers for heavier work.
- What this helps with: It helps the interface respond directly to user input without creating another global helper.

#### Inline Callback At Line 338

- Source marker: `openAddRoomModalBtn.addEventListener("click", () => {`
- What this is: This is the inline click listener attached to `openAddRoomModalBtn`.
- Why this is used: It stays beside the event registration so the trigger and reaction are easy to read together.
- How this works: When the browser fires that event, the callback reads closure state, performs the local UI action, and may call named helpers for heavier work.
- What this helps with: It helps the interface respond directly to user input without creating another global helper.

#### Inline Callback At Line 344

- Source marker: `filterElements.search.addEventListener("input", () => {`
- What this is: This is the inline input listener attached to `filterElements.search`.
- Why this is used: It stays beside the event registration so the trigger and reaction are easy to read together.
- How this works: When the browser fires that event, the callback reads closure state, performs the local UI action, and may call named helpers for heavier work.
- What this helps with: It helps the interface respond directly to user input without creating another global helper.

#### Inline Callback At Line 352

- Source marker: `selectElement.addEventListener("change", () => {`
- What this is: This is the inline change listener attached to `selectElement`.
- Why this is used: It stays beside the event registration so the trigger and reaction are easy to read together.
- How this works: When the browser fires that event, the callback reads closure state, performs the local UI action, and may call named helpers for heavier work.
- What this helps with: It helps the interface respond directly to user input without creating another global helper.

#### Inline Callback At Line 358

- Source marker: `roomFilterElements.search.addEventListener("input", () => {`
- What this is: This is the inline input listener attached to `roomFilterElements.search`.
- Why this is used: It stays beside the event registration so the trigger and reaction are easy to read together.
- How this works: When the browser fires that event, the callback reads closure state, performs the local UI action, and may call named helpers for heavier work.
- What this helps with: It helps the interface respond directly to user input without creating another global helper.

#### Inline Callback At Line 364

- Source marker: `roomFilterElements.location.addEventListener("change", () => {`
- What this is: This is the inline change listener attached to `roomFilterElements.location`.
- Why this is used: It stays beside the event registration so the trigger and reaction are easy to read together.
- How this works: When the browser fires that event, the callback reads closure state, performs the local UI action, and may call named helpers for heavier work.
- What this helps with: It helps the interface respond directly to user input without creating another global helper.

#### Inline Callback At Line 370

- Source marker: `resetFiltersBtn.addEventListener("click", () => {`
- What this is: This is the inline click listener attached to `resetFiltersBtn`.
- Why this is used: It stays beside the event registration so the trigger and reaction are easy to read together.
- How this works: When the browser fires that event, the callback reads closure state, performs the local UI action, and may call named helpers for heavier work.
- What this helps with: It helps the interface respond directly to user input without creating another global helper.

#### Inline Callback At Line 382

- Source marker: `resetRoomFiltersBtn.addEventListener("click", () => {`
- What this is: This is the inline click listener attached to `resetRoomFiltersBtn`.
- Why this is used: It stays beside the event registration so the trigger and reaction are easy to read together.
- How this works: When the browser fires that event, the callback reads closure state, performs the local UI action, and may call named helpers for heavier work.
- What this helps with: It helps the interface respond directly to user input without creating another global helper.

#### Inline Callback At Line 390

- Source marker: `addEmployeeForm.addEventListener("submit", async event => {`
- What this is: This is the inline submit listener attached to `addEmployeeForm`.
- Why this is used: It stays beside the event registration so the trigger and reaction are easy to read together.
- How this works: When the browser fires that event, the callback reads closure state, performs the local UI action, and may call named helpers for heavier work.
- What this helps with: It helps the interface respond directly to user input without creating another global helper.

#### Inline Callback At Line 421

- Source marker: `window.setTimeout(() => {`
- What this is: This is the delayed callback passed to a timeout timer.
- Why this is used: It exists because this feature needs to do something slightly later instead of immediately.
- How this works: The browser waits for the delay and then runs it with access to the surrounding state.
- What this helps with: It helps with deferred UI work or temporary notices.

#### Inline Callback At Line 432

- Source marker: `addRoomForm.addEventListener("submit", async event => {`
- What this is: This is the inline submit listener attached to `addRoomForm`.
- Why this is used: It stays beside the event registration so the trigger and reaction are easy to read together.
- How this works: When the browser fires that event, the callback reads closure state, performs the local UI action, and may call named helpers for heavier work.
- What this helps with: It helps the interface respond directly to user input without creating another global helper.

#### Inline Callback At Line 467

- Source marker: `window.setTimeout(() => {`
- What this is: This is the delayed callback passed to a timeout timer.
- Why this is used: It exists because this feature needs to do something slightly later instead of immediately.
- How this works: The browser waits for the delay and then runs it with access to the surrounding state.
- What this helps with: It helps with deferred UI work or temporary notices.

#### Inline Callback At Line 478

- Source marker: `table.addEventListener("click", async event => {`
- What this is: This is the inline click listener attached to `table`.
- Why this is used: It stays beside the event registration so the trigger and reaction are easy to read together.
- How this works: When the browser fires that event, the callback reads closure state, performs the local UI action, and may call named helpers for heavier work.
- What this helps with: It helps the interface respond directly to user input without creating another global helper.

## frontend/js/dashboard/admin/modals/employee-admin-modal.js

- Area: Dashboard Admin
- File role: This file owns employee admin modal behavior inside the modal layer of dashboard admin.
- Line count: 30
- Named functions in this file: 3
- Important inline callbacks noted: 1
- Top-level behavior: mixes named helpers with direct runtime wiring for this feature.

### Named Functions

#### `openEmployeeAdminModal(triggerElement = null)`

- Defined at: line 6
- What this is: This opens the employee admin modal UI or modal in the dashboard admin layer. It also matters for modal focus, temporary state, and predictable open/close behavior.
- Why this is used: It exists so opening logic can prepare state, content, and focus consistently. In modal code, that consistency prevents broken overlay and focus behavior.
- How this works: It leans on helpers like `populateAdminLocationOptions`, `populateAdminManagerOptions`, `setHelperMessage`, `openManagedModal` and uses the shared modal manager.
- What this helps with: It helps the user start a focused interaction with the right context visible.
- Key inputs: `triggerElement` is a DOM reference.
- Key dependencies: This function calls helpers such as `populateAdminLocationOptions`, `populateAdminManagerOptions`, `setHelperMessage`, `openManagedModal`, depends on the shared modal manager.
- Return or side effects: It mostly works through local computation and whatever the caller does with the result.

#### `closeEmployeeAdminModal()`

- Defined at: line 16
- What this is: This closes or tears down the employee admin modal UI state. It also matters for modal focus, temporary state, and predictable open/close behavior.
- Why this is used: It exists so closing logic can clean up and restore context consistently. In modal code, that consistency prevents broken overlay and focus behavior.
- How this works: It leans on helpers like `closeManagedModal` and uses the shared modal manager.
- What this helps with: It helps the user leave the interaction cleanly without stale state leaking into the next open.
- Key inputs: This function does not take direct parameters; it mainly uses surrounding state, cached DOM references, or globals.
- Key dependencies: This function calls helpers such as `closeManagedModal`, depends on the shared modal manager.
- Return or side effects: It mostly works through local computation and whatever the caller does with the result.

#### `initializeEmployeeAdminModalHandlers()`

- Defined at: line 21
- What this is: This is the main setup function for the employee admin modal handlers flow in the dashboard admin layer. It also matters for modal focus, temporary state, and predictable open/close behavior.
- Why this is used: It exists so one-time setup stays in one place.
- How this works: It leans on helpers like `closeEmployeeAdminModal` and wires listeners for later user actions.
- What this helps with: It helps the feature become usable as soon as the page loads.
- Key inputs: This function does not take direct parameters; it mainly uses surrounding state, cached DOM references, or globals.
- Key dependencies: This function calls helpers such as `closeEmployeeAdminModal`.
- Return or side effects: It works mainly through side effects, especially listener registration.

### Important Inline Callbacks

#### Inline Callback At Line 24

- Source marker: `employeeAdminModal.addEventListener("click", event => {`
- What this is: This is the inline click listener attached to `employeeAdminModal`.
- Why this is used: It stays beside the event registration so the trigger and reaction are easy to read together.
- How this works: When the browser fires that event, the callback reads closure state, performs the local UI action, and may call named helpers for heavier work.
- What this helps with: It helps the interface respond directly to user input without creating another global helper.

## frontend/js/dashboard/admin/modals/room-admin-modal.js

- Area: Dashboard Admin
- File role: This file owns room admin modal behavior inside the modal layer of dashboard admin.
- Line count: 29
- Named functions in this file: 3
- Important inline callbacks noted: 1
- Top-level behavior: mixes named helpers with direct runtime wiring for this feature.

### Named Functions

#### `openRoomAdminModal(triggerElement = null)`

- Defined at: line 6
- What this is: This opens the room admin modal UI or modal in the dashboard admin layer. It also matters for modal focus, temporary state, and predictable open/close behavior.
- Why this is used: It exists so opening logic can prepare state, content, and focus consistently. In modal code, that consistency prevents broken overlay and focus behavior.
- How this works: It leans on helpers like `populateAdminRoomLocationOptions`, `setHelperMessage`, `openManagedModal` and uses the shared modal manager.
- What this helps with: It helps the user start a focused interaction with the right context visible.
- Key inputs: `triggerElement` is a DOM reference.
- Key dependencies: This function calls helpers such as `populateAdminRoomLocationOptions`, `setHelperMessage`, `openManagedModal`, depends on the shared modal manager.
- Return or side effects: It mostly works through local computation and whatever the caller does with the result.

#### `closeRoomAdminModal()`

- Defined at: line 15
- What this is: This closes or tears down the room admin modal UI state. It also matters for modal focus, temporary state, and predictable open/close behavior.
- Why this is used: It exists so closing logic can clean up and restore context consistently. In modal code, that consistency prevents broken overlay and focus behavior.
- How this works: It leans on helpers like `closeManagedModal` and uses the shared modal manager.
- What this helps with: It helps the user leave the interaction cleanly without stale state leaking into the next open.
- Key inputs: This function does not take direct parameters; it mainly uses surrounding state, cached DOM references, or globals.
- Key dependencies: This function calls helpers such as `closeManagedModal`, depends on the shared modal manager.
- Return or side effects: It mostly works through local computation and whatever the caller does with the result.

#### `initializeRoomAdminModalHandlers()`

- Defined at: line 20
- What this is: This is the main setup function for the room admin modal handlers flow in the dashboard admin layer. It also matters for modal focus, temporary state, and predictable open/close behavior.
- Why this is used: It exists so one-time setup stays in one place.
- How this works: It leans on helpers like `closeRoomAdminModal` and wires listeners for later user actions.
- What this helps with: It helps the feature become usable as soon as the page loads.
- Key inputs: This function does not take direct parameters; it mainly uses surrounding state, cached DOM references, or globals.
- Key dependencies: This function calls helpers such as `closeRoomAdminModal`.
- Return or side effects: It works mainly through side effects, especially listener registration.

### Important Inline Callbacks

#### Inline Callback At Line 23

- Source marker: `roomAdminModal.addEventListener("click", event => {`
- What this is: This is the inline click listener attached to `roomAdminModal`.
- Why this is used: It stays beside the event registration so the trigger and reaction are easy to read together.
- How this works: When the browser fires that event, the callback reads closure state, performs the local UI action, and may call named helpers for heavier work.
- What this helps with: It helps the interface respond directly to user input without creating another global helper.

## frontend/js/dashboard/admin/reports/admin-reports.js

- Area: Dashboard Admin
- File role: This file owns admin reports behavior in the dashboard admin layer.
- Line count: 76
- Named functions in this file: 4
- Important inline callbacks noted: 0
- Top-level behavior: mixes named helpers with direct runtime wiring for this feature.

### Named Functions

#### `renderReportTables(reportData)`

- Defined at: line 1
- What this is: This is the render function for the report tables UI in the dashboard admin layer.
- Why this is used: It exists so UI output is rebuilt from current state instead of patched everywhere.
- How this works: It reads current DOM or form values, leans on helpers like `setPaginationRows`, `renderReportLocationPage`, `renderReportUpcomingPage`, and writes text, markup, or created elements back into the UI.
- What this helps with: It helps keep the visible UI aligned with the latest state.
- Key inputs: `reportData` is an input value the function uses.
- Key dependencies: This function calls helpers such as `setPaginationRows`, `renderReportLocationPage`, `renderReportUpcomingPage`.
- Return or side effects: It works mainly through side effects, especially DOM updates.

#### `renderReportLocationPage()`

- Defined at: line 27
- What this is: This is the render function for the report location page UI in the dashboard admin layer.
- Why this is used: It exists so UI output is rebuilt from current state instead of patched everywhere.
- How this works: It reads current DOM or form values, leans on helpers like `getPaginationSlice`, `escapeHtml`, `renderPaginationControls`, writes text, markup, or created elements back into the UI, and refreshes pagination controls.
- What this helps with: It helps keep the visible UI aligned with the latest state.
- Key inputs: This function does not take direct parameters; it mainly uses surrounding state, cached DOM references, or globals.
- Key dependencies: This function calls helpers such as `getPaginationSlice`, `escapeHtml`, `renderPaginationControls`.
- Return or side effects: It works mainly through side effects, especially DOM updates.

#### `renderReportUpcomingPage()`

- Defined at: line 42
- What this is: This is the render function for the report upcoming page UI in the dashboard admin layer.
- Why this is used: It exists so UI output is rebuilt from current state instead of patched everywhere.
- How this works: It reads current DOM or form values, leans on helpers like `getPaginationSlice`, `escapeHtml`, `formatDateTime`, `renderPaginationControls`, writes text, markup, or created elements back into the UI, and refreshes pagination controls.
- What this helps with: It helps keep the visible UI aligned with the latest state.
- Key inputs: This function does not take direct parameters; it mainly uses surrounding state, cached DOM references, or globals.
- Key dependencies: This function calls helpers such as `getPaginationSlice`, `escapeHtml`, `formatDateTime`, `renderPaginationControls`.
- Return or side effects: It works mainly through side effects, especially DOM updates.

#### `async loadReports()`

- Defined at: line 65
- What this is: This is the data-loading function for the reports flow in the dashboard admin layer.
- Why this is used: It exists so loading, success, and error paths stay consistent. It also keeps backend communication tied to the right UI step.
- How this works: It talks to backend routes like `/bookings/reports`, leans on helpers like `apiFetch`, `renderReportTables`, and uses shared state such as `currentRole`.
- What this helps with: It helps the user see fresh data and gives the feature a clear refresh path.
- Key inputs: This function does not take direct parameters; it mainly uses surrounding state, cached DOM references, or globals.
- Key dependencies: This function calls helpers such as `apiFetch`, `renderReportTables`, touches shared runtime values like `currentRole`, depends on backend routes including `/bookings/reports`.
- Return or side effects: It works mainly through side effects, especially network requests.

## frontend/js/dashboard/admin/rooms/room-directory.js

- Area: Dashboard Admin
- File role: This file owns room directory behavior in the dashboard admin layer.
- Line count: 174
- Named functions in this file: 11
- Important inline callbacks noted: 0
- Top-level behavior: mixes named helpers with direct runtime wiring for this feature.

### Named Functions

#### `populateAdminRoomLocationOptions()`

- Defined at: line 1
- What this is: This fills the admin room location options UI with options or values.
- Why this is used: It exists so dropdowns and filters reflect the current dataset.
- How this works: It reads current DOM or form values and writes text, markup, or created elements back into the UI.
- What this helps with: It helps selects and filters stay in sync with live data.
- Key inputs: This function does not take direct parameters; it mainly uses surrounding state, cached DOM references, or globals.
- Key dependencies: This function is mostly self-contained and depends only on local values plus standard browser APIs.
- Return or side effects: It works mainly through side effects, especially DOM updates.

#### `populateAdminRoomFilters()`

- Defined at: line 20
- What this is: This fills the admin room filters UI with options or values.
- Why this is used: It exists so dropdowns and filters reflect the current dataset.
- How this works: It reads current DOM or form values and writes text, markup, or created elements back into the UI.
- What this helps with: It helps selects and filters stay in sync with live data.
- Key inputs: This function does not take direct parameters; it mainly uses surrounding state, cached DOM references, or globals.
- Key dependencies: This function is mostly self-contained and depends only on local values plus standard browser APIs.
- Return or side effects: It works mainly through side effects, especially DOM updates.

#### `getAdminRoomFilterElements()`

- Defined at: line 39
- What this is: This returns a derived admin room filter elements value for the dashboard admin layer.
- Why this is used: It exists to centralize a repeated lookup or calculation.
- How this works: It reads current DOM or form values.
- What this helps with: It helps other code ask for the current admin room filter elements in one place.
- Key inputs: This function does not take direct parameters; it mainly uses surrounding state, cached DOM references, or globals.
- Key dependencies: This function is mostly self-contained and depends only on local values plus standard browser APIs.
- Return or side effects: Mostly returns a derived value or prepared structure back to the caller.

#### `getAdminRoomFilterValues()`

- Defined at: line 47
- What this is: This returns a derived admin room filter values value for the dashboard admin layer.
- Why this is used: It exists to centralize a repeated lookup or calculation.
- How this works: It leans on helpers like `getAdminRoomFilterElements`.
- What this helps with: It helps other code ask for the current admin room filter values in one place.
- Key inputs: This function does not take direct parameters; it mainly uses surrounding state, cached DOM references, or globals.
- Key dependencies: This function calls helpers such as `getAdminRoomFilterElements`.
- Return or side effects: Mostly returns a derived value or prepared structure back to the caller.

#### `hasActiveAdminRoomFilters()`

- Defined at: line 55
- What this is: This answers a yes-or-no rule about the active admin room filters flow.
- Why this is used: It exists so calling code can branch on one clear business rule.
- How this works: It leans on helpers like `getAdminRoomFilterValues`.
- What this helps with: It helps business rules stay readable and testable.
- Key inputs: This function does not take direct parameters; it mainly uses surrounding state, cached DOM references, or globals.
- Key dependencies: This function calls helpers such as `getAdminRoomFilterValues`.
- Return or side effects: Mostly returns a derived value or prepared structure back to the caller.

#### `setAdminRoomFilterSummary(filteredCount, totalCount)`

- Defined at: line 59
- What this is: This sets or writes the admin room filter summary state in the dashboard admin layer.
- Why this is used: It exists so status or state changes follow one rule set.
- How this works: It leans on helpers like `getAdminRoomFilterElements`, `hasActiveAdminRoomFilters` and writes text, markup, or created elements back into the UI.
- What this helps with: It helps the UI communicate state or feedback in a standardized way.
- Key inputs: `filteredCount` is an input value the function uses. `totalCount` is an input value the function uses.
- Key dependencies: This function calls helpers such as `getAdminRoomFilterElements`, `hasActiveAdminRoomFilters`.
- Return or side effects: It works mainly through side effects, especially DOM updates.

#### `applyAdminRoomFilters()`

- Defined at: line 76
- What this is: This applies the admin room filters rule to the live UI state.
- Why this is used: It exists so a computed rule is actually pushed into the live UI at the right time.
- How this works: It leans on helpers like `getAdminRoomFilterValues`, `setPaginationRows`, `setAdminRoomFilterSummary`, `renderRoomPage` and uses shared state such as `adminRoomDirectory`.
- What this helps with: It helps the interface enforce the right rule at the exact place the user feels it.
- Key inputs: This function does not take direct parameters; it mainly uses surrounding state, cached DOM references, or globals.
- Key dependencies: This function calls helpers such as `getAdminRoomFilterValues`, `setPaginationRows`, `setAdminRoomFilterSummary`, `renderRoomPage`, touches shared runtime values like `adminRoomDirectory`.
- Return or side effects: It mostly works through local computation and whatever the caller does with the result.

#### `getRoomSizeLabel(sizeSqft)`

- Defined at: line 100
- What this is: This returns a derived room size label value for the dashboard admin layer.
- Why this is used: It exists to centralize a repeated lookup or calculation.
- How this works: It performs small synchronous logic and returns the result.
- What this helps with: It helps other code ask for the current room size label in one place.
- Key inputs: `sizeSqft` is an input value the function uses.
- Key dependencies: This function is mostly self-contained and depends only on local values plus standard browser APIs.
- Return or side effects: Mostly returns a derived value or prepared structure back to the caller.

#### `renderRoomPage()`

- Defined at: line 106
- What this is: This is the render function for the room page UI in the dashboard admin layer.
- Why this is used: It exists so UI output is rebuilt from current state instead of patched everywhere.
- How this works: It reads current DOM or form values, leans on helpers like `getPaginationSlice`, `hasActiveAdminRoomFilters`, `renderPaginationControls`, `escapeHtml`, `getRoomSizeLabel`, `buildRoomFeatures`, uses shared state such as `adminRoomDirectory`, writes text, markup, or created elements back into the UI, and refreshes pagination controls.
- What this helps with: It helps keep the visible UI aligned with the latest state.
- Key inputs: This function does not take direct parameters; it mainly uses surrounding state, cached DOM references, or globals.
- Key dependencies: This function calls helpers such as `getPaginationSlice`, `hasActiveAdminRoomFilters`, `renderPaginationControls`, `escapeHtml`, `getRoomSizeLabel`, `buildRoomFeatures`, touches shared runtime values like `adminRoomDirectory`.
- Return or side effects: It works mainly through side effects, especially DOM updates.

#### `renderRoomTable(rows)`

- Defined at: line 140
- What this is: This is the render function for the room table UI in the dashboard admin layer.
- Why this is used: It exists so UI output is rebuilt from current state instead of patched everywhere.
- How this works: It reads current DOM or form values, leans on helpers like `populateAdminRoomFilters`, `applyAdminRoomFilters`, and uses shared state such as `adminRoomDirectory`.
- What this helps with: It helps keep the visible UI aligned with the latest state.
- Key inputs: `rows` is an input value the function uses.
- Key dependencies: This function calls helpers such as `populateAdminRoomFilters`, `applyAdminRoomFilters`, touches shared runtime values like `adminRoomDirectory`.
- Return or side effects: It mostly works through local computation and whatever the caller does with the result.

#### `async loadRooms()`

- Defined at: line 149
- What this is: This is the data-loading function for the rooms flow in the dashboard admin layer.
- Why this is used: It exists so loading, success, and error paths stay consistent. It also keeps backend communication tied to the right UI step.
- How this works: It reads current DOM or form values, talks to backend routes like `/admin/rooms`, leans on helpers like `getAdminRoomFilterElements`, `apiFetch`, `renderRoomTable`, `populateAdminRoomFilters`, `setPaginationRows`, `renderPaginationControls`, uses shared state such as `currentRole`, `adminRoomDirectory`, writes text, markup, or created elements back into the UI, and refreshes pagination controls.
- What this helps with: It helps the user see fresh data and gives the feature a clear refresh path.
- Key inputs: This function does not take direct parameters; it mainly uses surrounding state, cached DOM references, or globals.
- Key dependencies: This function calls helpers such as `getAdminRoomFilterElements`, `apiFetch`, `renderRoomTable`, `populateAdminRoomFilters`, `setPaginationRows`, `renderPaginationControls`, touches shared runtime values like `currentRole`, `adminRoomDirectory`, depends on backend routes including `/admin/rooms`.
- Return or side effects: It works mainly through side effects, especially DOM updates, network requests.

## frontend/js/dashboard/employee/bookings/bookings-actions.js

- Area: Dashboard Employee
- File role: This file owns bookings actions behavior in the dashboard employee layer.
- Line count: 139
- Named functions in this file: 8
- Important inline callbacks noted: 0
- Top-level behavior: mixes named helpers with direct runtime wiring for this feature.

### Named Functions

#### `userCanManageBooking(booking)`

- Defined at: line 1
- What this is: This is a support helper for the user can manage booking work in the dashboard employee layer.
- Why this is used: It exists to keep repeated logic small and reusable.
- How this works: It uses shared state such as `isAdmin`.
- What this helps with: It helps reduce duplication and makes the calling code easier to read.
- Key inputs: `booking` carries booking data or a booking id.
- Key dependencies: This function touches shared runtime values like `isAdmin`.
- Return or side effects: Mostly returns a derived value or prepared structure back to the caller.

#### `canManageFutureBooking(booking)`

- Defined at: line 6
- What this is: This answers a yes-or-no rule about the manage future booking flow.
- Why this is used: It exists so calling code can branch on one clear business rule.
- How this works: It computes date or time values and leans on helpers like `userCanManageBooking`, `parseDateValue`.
- What this helps with: It helps business rules stay readable and testable.
- Key inputs: `booking` carries booking data or a booking id.
- Key dependencies: This function calls helpers such as `userCanManageBooking`, `parseDateValue`.
- Return or side effects: Mostly returns a derived value or prepared structure back to the caller.

#### `canVacateOngoingBooking(booking)`

- Defined at: line 16
- What this is: This answers a yes-or-no rule about the vacate ongoing booking flow.
- Why this is used: It exists so calling code can branch on one clear business rule.
- How this works: It computes date or time values and leans on helpers like `userCanManageBooking`, `parseDateValue`.
- What this helps with: It helps business rules stay readable and testable.
- Key inputs: `booking` carries booking data or a booking id.
- Key dependencies: This function calls helpers such as `userCanManageBooking`, `parseDateValue`.
- Return or side effects: Mostly returns a derived value or prepared structure back to the caller.

#### `getBookingActionState(booking)`

- Defined at: line 29
- What this is: This returns a derived booking action state value for the dashboard employee layer.
- Why this is used: It exists to centralize a repeated lookup or calculation.
- How this works: It computes date or time values, leans on helpers like `canVacateOngoingBooking`, `canManageFutureBooking`, `parseDateValue`, and uses shared state such as `getBookingActionState`.
- What this helps with: It helps other code ask for the current booking action state in one place.
- Key inputs: `booking` carries booking data or a booking id.
- Key dependencies: This function calls helpers such as `canVacateOngoingBooking`, `canManageFutureBooking`, `parseDateValue`, touches shared runtime values like `getBookingActionState`.
- Return or side effects: Mostly returns a derived value or prepared structure back to the caller.

#### `buildBookingActionsCell(booking)`

- Defined at: line 59
- What this is: This builds the booking actions cell structure another part of the feature needs.
- Why this is used: It exists to keep object, markup, or URL assembly consistent.
- How this works: It leans on helpers like `getBookingActionState`, `escapeHtml` and uses shared state such as `actionState`, `getBookingActionState`.
- What this helps with: It helps other functions trust the assembled booking actions cell shape.
- Key inputs: `booking` carries booking data or a booking id.
- Key dependencies: This function calls helpers such as `getBookingActionState`, `escapeHtml`, touches shared runtime values like `actionState`, `getBookingActionState`.
- Return or side effects: Mostly returns a derived value or prepared structure back to the caller.

#### `getBookingRoleLabel(booking)`

- Defined at: line 124
- What this is: This returns a derived booking role label value for the dashboard employee layer.
- Why this is used: It exists to centralize a repeated lookup or calculation.
- How this works: It performs small synchronous logic and returns the result.
- What this helps with: It helps other code ask for the current booking role label in one place.
- Key inputs: `booking` carries booking data or a booking id.
- Key dependencies: This function is mostly self-contained and depends only on local values plus standard browser APIs.
- Return or side effects: Mostly returns a derived value or prepared structure back to the caller.

#### `getBookingRoleClassName(booking)`

- Defined at: line 128
- What this is: This returns a derived booking role class name value for the dashboard employee layer.
- Why this is used: It exists to centralize a repeated lookup or calculation.
- How this works: It performs small synchronous logic and returns the result.
- What this helps with: It helps other code ask for the current booking role class name in one place.
- Key inputs: `booking` carries booking data or a booking id.
- Key dependencies: This function is mostly self-contained and depends only on local values plus standard browser APIs.
- Return or side effects: Mostly returns a derived value or prepared structure back to the caller.

#### `getBookingOrganizerDisplayName(booking)`

- Defined at: line 132
- What this is: This returns a derived booking organizer display name value for the dashboard employee layer.
- Why this is used: It exists to centralize a repeated lookup or calculation.
- How this works: It performs small synchronous logic and returns the result.
- What this helps with: It helps other code ask for the current booking organizer display name in one place.
- Key inputs: `booking` carries booking data or a booking id.
- Key dependencies: This function is mostly self-contained and depends only on local values plus standard browser APIs.
- Return or side effects: Mostly returns a derived value or prepared structure back to the caller.

## frontend/js/dashboard/employee/bookings/bookings-load.js

- Area: Dashboard Employee
- File role: This file owns bookings load behavior in the dashboard employee layer.
- Line count: 47
- Named functions in this file: 2
- Important inline callbacks noted: 0
- Top-level behavior: mixes named helpers with direct runtime wiring for this feature.

### Named Functions

#### `async loadBookings()`

- Defined at: line 1
- What this is: This is the data-loading function for the bookings flow in the dashboard employee layer.
- Why this is used: It exists so loading, success, and error paths stay consistent. It also keeps backend communication tied to the right UI step.
- How this works: It reads current DOM or form values, computes date or time values, talks to the backend, leans on helpers like `buildTableSkeletonRows`, `apiFetch`, `buildUpcomingUrl`, `renderOverviewBookings`, `buildMyBookingsUrl`, `renderBookingsTable`, uses shared state such as `currentRole`, writes text, markup, or created elements back into the UI, and refreshes pagination controls.
- What this helps with: It helps the user see fresh data and gives the feature a clear refresh path.
- Key inputs: This function does not take direct parameters; it mainly uses surrounding state, cached DOM references, or globals.
- Key dependencies: This function calls helpers such as `buildTableSkeletonRows`, `apiFetch`, `buildUpcomingUrl`, `renderOverviewBookings`, `buildMyBookingsUrl`, `renderBookingsTable`, touches shared runtime values like `currentRole`, depends on a backend request path.
- Return or side effects: It works mainly through side effects, especially DOM updates, network requests.

#### `async refreshBookingViews()`

- Defined at: line 40
- What this is: This is a support helper for the refresh booking views work in the dashboard employee layer.
- Why this is used: It exists to keep repeated logic small and reusable.
- How this works: It leans on helpers like `loadSummary`, `loadBookings`, `loadOverviewAvailability`, `searchRooms`, `loadReports` and uses shared state such as `currentRole`.
- What this helps with: It helps reduce duplication and makes the calling code easier to read.
- Key inputs: This function does not take direct parameters; it mainly uses surrounding state, cached DOM references, or globals.
- Key dependencies: This function calls helpers such as `loadSummary`, `loadBookings`, `loadOverviewAvailability`, `searchRooms`, `loadReports`, touches shared runtime values like `currentRole`.
- Return or side effects: It mostly works through local computation and whatever the caller does with the result.

## frontend/js/dashboard/employee/bookings/bookings-render.js

- Area: Dashboard Employee
- File role: This file owns bookings render behavior in the dashboard employee layer.
- Line count: 51
- Named functions in this file: 2
- Important inline callbacks noted: 0
- Top-level behavior: mixes named helpers with direct runtime wiring for this feature.

### Named Functions

#### `renderBookingsPage()`

- Defined at: line 1
- What this is: This is the render function for the bookings page UI in the dashboard employee layer.
- Why this is used: It exists so UI output is rebuilt from current state instead of patched everywhere.
- How this works: It reads current DOM or form values, leans on helpers like `getPaginationSlice`, `renderPaginationControls`, `getStatusClass`, `escapeHtml`, `formatCompactDateTime`, `getBookingRoleLabel`, writes text, markup, or created elements back into the UI, and refreshes pagination controls.
- What this helps with: It helps keep the visible UI aligned with the latest state.
- Key inputs: This function does not take direct parameters; it mainly uses surrounding state, cached DOM references, or globals.
- Key dependencies: This function calls helpers such as `getPaginationSlice`, `renderPaginationControls`, `getStatusClass`, `escapeHtml`, `formatCompactDateTime`, `getBookingRoleLabel`.
- Return or side effects: It works mainly through side effects, especially DOM updates.

#### `renderBookingsTable(rows)`

- Defined at: line 42
- What this is: This is the render function for the bookings table UI in the dashboard employee layer.
- Why this is used: It exists so UI output is rebuilt from current state instead of patched everywhere.
- How this works: It leans on helpers like `setPaginationRows`, `renderBookingsPage` and uses shared state such as `bookingsById`.
- What this helps with: It helps keep the visible UI aligned with the latest state.
- Key inputs: `rows` is an input value the function uses.
- Key dependencies: This function calls helpers such as `setPaginationRows`, `renderBookingsPage`, touches shared runtime values like `bookingsById`.
- Return or side effects: It mostly works through local computation and whatever the caller does with the result.

## frontend/js/dashboard/employee/interactions/room-details-interactions.js

- Area: Dashboard Employee
- File role: This file owns room details interactions behavior in the dashboard employee layer.
- Line count: 44
- Named functions in this file: 1
- Important inline callbacks noted: 3
- Top-level behavior: mixes named helpers with direct runtime wiring for this feature.

### Named Functions

#### `initializeRoomDetailsInteractions()`

- Defined at: line 1
- What this is: This is the main setup function for the room details interactions flow in the dashboard employee layer.
- Why this is used: It exists so one-time setup stays in one place.
- How this works: It reads current DOM or form values, leans on helpers like `openRoomModal`, `buildFinderWindow`, uses shared state such as `finderRoomsById`, `availabilityWindow`, `availabilityRoomsById`, and wires listeners for later user actions.
- What this helps with: It helps the feature become usable as soon as the page loads.
- Key inputs: This function does not take direct parameters; it mainly uses surrounding state, cached DOM references, or globals.
- Key dependencies: This function calls helpers such as `openRoomModal`, `buildFinderWindow`, touches shared runtime values like `finderRoomsById`, `availabilityWindow`, `availabilityRoomsById`.
- Return or side effects: It works mainly through side effects, especially listener registration.

### Important Inline Callbacks

#### Inline Callback At Line 4

- Source marker: `finderTable.addEventListener("click", event => {`
- What this is: This is the inline click listener attached to `finderTable`.
- Why this is used: It stays beside the event registration so the trigger and reaction are easy to read together.
- How this works: When the browser fires that event, the callback reads closure state, performs the local UI action, and may call named helpers for heavier work.
- What this helps with: It helps the interface respond directly to user input without creating another global helper.

#### Inline Callback At Line 18

- Source marker: `availabilityList.addEventListener("click", event => {`
- What this is: This is the inline click listener attached to `availabilityList`.
- Why this is used: It stays beside the event registration so the trigger and reaction are easy to read together.
- How this works: When the browser fires that event, the callback reads closure state, performs the local UI action, and may call named helpers for heavier work.
- What this helps with: It helps the interface respond directly to user input without creating another global helper.

#### Inline Callback At Line 29

- Source marker: `availabilityList.addEventListener("keydown", event => {`
- What this is: This is the inline keydown listener attached to `availabilityList`.
- Why this is used: It stays beside the event registration so the trigger and reaction are easy to read together.
- How this works: When the browser fires that event, the callback reads closure state, performs the local UI action, and may call named helpers for heavier work.
- What this helps with: It helps the interface respond directly to user input without creating another global helper.

## frontend/js/dashboard/employee/modals/booking-edit-modal.js

- Area: Dashboard Employee
- File role: This file owns booking edit modal behavior inside the modal layer of dashboard employee.
- Line count: 341
- Named functions in this file: 10
- Important inline callbacks noted: 13
- Top-level behavior: mixes named helpers with direct runtime wiring for this feature.

### Named Functions

#### `setBookingEditMessage(message, type = "")`

- Defined at: line 24
- What this is: This sets or writes the booking edit message state in the dashboard employee layer. It also matters for modal focus, temporary state, and predictable open/close behavior.
- Why this is used: It exists so status or state changes follow one rule set.
- How this works: It leans on helpers like `setHelperMessage`.
- What this helps with: It helps the UI communicate state or feedback in a standardized way.
- Key inputs: `message` is user-facing feedback text. `type` controls a visual tone or behavior mode.
- Key dependencies: This function calls helpers such as `setHelperMessage`.
- Return or side effects: It mostly works through local computation and whatever the caller does with the result.

#### `setBookingEditMode(mode = "edit")`

- Defined at: line 28
- What this is: This sets or writes the booking edit mode state in the dashboard employee layer. It also matters for modal focus, temporary state, and predictable open/close behavior.
- Why this is used: It exists so status or state changes follow one rule set.
- How this works: It leans on helpers like `hideParticipantSuggestions` and writes text, markup, or created elements back into the UI.
- What this helps with: It helps the UI communicate state or feedback in a standardized way.
- Key inputs: `mode` controls a visual tone or behavior mode.
- Key dependencies: This function calls helpers such as `hideParticipantSuggestions`.
- Return or side effects: It works mainly through side effects, especially DOM updates.

#### `applyBookingEditDateTimeConstraints()`

- Defined at: line 64
- What this is: This applies the booking edit date time constraints rule to the live UI state. It also matters for modal focus, temporary state, and predictable open/close behavior.
- Why this is used: It exists so a computed rule is actually pushed into the live UI at the right time.
- How this works: It computes date or time values and leans on helpers like `getLocalDateInputValue`, `getLocalTimeInputValue`, `getTimeValueMinutes`, `getTimeInputValue24`, `setTimeInputValue`.
- What this helps with: It helps the interface enforce the right rule at the exact place the user feels it.
- Key inputs: This function does not take direct parameters; it mainly uses surrounding state, cached DOM references, or globals.
- Key dependencies: This function calls helpers such as `getLocalDateInputValue`, `getLocalTimeInputValue`, `getTimeValueMinutes`, `getTimeInputValue24`, `setTimeInputValue`.
- Return or side effects: It mostly works through local computation and whatever the caller does with the result.

#### `getBookingEditWindow()`

- Defined at: line 88
- What this is: This returns a derived booking edit window value for the dashboard employee layer. It also matters for modal focus, temporary state, and predictable open/close behavior.
- Why this is used: It exists to centralize a repeated lookup or calculation.
- How this works: It leans on helpers like `buildWindowFromLocalInputs`.
- What this helps with: It helps other code ask for the current booking edit window in one place.
- Key inputs: This function does not take direct parameters; it mainly uses surrounding state, cached DOM references, or globals.
- Key dependencies: This function calls helpers such as `buildWindowFromLocalInputs`.
- Return or side effects: Mostly returns a derived value or prepared structure back to the caller.

#### `closeBookingEditModal()`

- Defined at: line 92
- What this is: This closes or tears down the booking edit modal UI state. It also matters for modal focus, temporary state, and predictable open/close behavior.
- Why this is used: It exists so closing logic can clean up and restore context consistently. In modal code, that consistency prevents broken overlay and focus behavior.
- How this works: It computes date or time values, leans on helpers like `closeManagedModal`, `setBookingEditMode`, `resetParticipantPicker`, `setBookingEditMessage`, uses shared state such as `selectedBooking`, writes text, markup, or created elements back into the UI, and uses the shared modal manager.
- What this helps with: It helps the user leave the interaction cleanly without stale state leaking into the next open.
- Key inputs: This function does not take direct parameters; it mainly uses surrounding state, cached DOM references, or globals.
- Key dependencies: This function calls helpers such as `closeManagedModal`, `setBookingEditMode`, `resetParticipantPicker`, `setBookingEditMessage`, touches shared runtime values like `selectedBooking`, depends on the shared modal manager.
- Return or side effects: It works mainly through side effects, especially DOM updates.

#### `async openBookingEditModal(bookingId, { mode = "edit" } = {})`

- Defined at: line 111
- What this is: This opens the booking edit modal UI or modal in the dashboard employee layer. It also matters for modal focus, temporary state, and predictable open/close behavior.
- Why this is used: It exists so opening logic can prepare state, content, and focus consistently. It also keeps backend communication tied to the right UI step. In modal code, that consistency prevents broken overlay and focus behavior.
- How this works: It computes date or time values, talks to backend routes like `/bookings/${Number`, leans on helpers like `canManageFutureBooking`, `apiFetch`, `setBookingEditMode`, `setBookingEditMessage`, `getBookingOrganizerDisplayName`, `toLocalDateInputValue`, uses shared state such as `bookingsById`, `selectedBooking`, writes text, markup, or created elements back into the UI, and uses the shared modal manager.
- What this helps with: It helps the user start a focused interaction with the right context visible.
- Key inputs: `bookingId` carries booking data or a booking id. `mode` controls a visual tone or behavior mode.
- Key dependencies: This function calls helpers such as `canManageFutureBooking`, `apiFetch`, `setBookingEditMode`, `setBookingEditMessage`, `getBookingOrganizerDisplayName`, `toLocalDateInputValue`, touches shared runtime values like `bookingsById`, `selectedBooking`, depends on backend routes including `/bookings/${Number`, depends on the shared modal manager.
- Return or side effects: It works mainly through side effects, especially DOM updates, network requests.

#### `async saveBookingEdits(event)`

- Defined at: line 180
- What this is: This is a support helper for the save booking edits work in the dashboard employee layer. It also matters for modal focus, temporary state, and predictable open/close behavior.
- Why this is used: It exists to keep repeated logic small and reusable. It also keeps backend communication tied to the right UI step.
- How this works: It talks to backend routes like `/bookings/${selectedBooking.booking_id}`, leans on helpers like `setBookingEditMessage`, `getBookingEditWindow`, `parseDateValue`, `isPastBeyondGrace`, `validateParticipantCapacity`, `ensureParticipantDirectory`, and uses shared state such as `selectedBooking`.
- What this helps with: It helps reduce duplication and makes the calling code easier to read.
- Key inputs: `event` is the browser event object.
- Key dependencies: This function calls helpers such as `setBookingEditMessage`, `getBookingEditWindow`, `parseDateValue`, `isPastBeyondGrace`, `validateParticipantCapacity`, `ensureParticipantDirectory`, touches shared runtime values like `selectedBooking`, depends on backend routes including `/bookings/${selectedBooking.booking_id}`.
- Return or side effects: Mostly returns a derived value or prepared structure back to the caller.

#### `async cancelBookingById(bookingId)`

- Defined at: line 243
- What this is: This answers a yes-or-no rule about the cancel booking by id flow. It also matters for modal focus, temporary state, and predictable open/close behavior.
- Why this is used: It exists so calling code can branch on one clear business rule. It also keeps backend communication tied to the right UI step.
- How this works: It talks to backend routes like `/bookings/${Number`, leans on helpers like `canManageFutureBooking`, `apiFetch`, `refreshBookingViews`, `closeBookingEditModal`, and uses shared state such as `bookingsById`, `selectedBooking`.
- What this helps with: It helps business rules stay readable and testable.
- Key inputs: `bookingId` carries booking data or a booking id.
- Key dependencies: This function calls helpers such as `canManageFutureBooking`, `apiFetch`, `refreshBookingViews`, `closeBookingEditModal`, touches shared runtime values like `bookingsById`, `selectedBooking`, depends on backend routes including `/bookings/${Number`.
- Return or side effects: Mostly returns a derived value or prepared structure back to the caller.

#### `async vacateBookingById(bookingId)`

- Defined at: line 267
- What this is: This is a support helper for the vacate booking by id work in the dashboard employee layer. It also matters for modal focus, temporary state, and predictable open/close behavior.
- Why this is used: It exists to keep repeated logic small and reusable. It also keeps backend communication tied to the right UI step.
- How this works: It talks to backend routes like `/bookings/${Number`, leans on helpers like `canVacateOngoingBooking`, `apiFetch`, `refreshBookingViews`, `closeBookingEditModal`, and uses shared state such as `bookingsById`, `selectedBooking`.
- What this helps with: It helps reduce duplication and makes the calling code easier to read.
- Key inputs: `bookingId` carries booking data or a booking id.
- Key dependencies: This function calls helpers such as `canVacateOngoingBooking`, `apiFetch`, `refreshBookingViews`, `closeBookingEditModal`, touches shared runtime values like `bookingsById`, `selectedBooking`, depends on backend routes including `/bookings/${Number`.
- Return or side effects: Mostly returns a derived value or prepared structure back to the caller.

#### `initializeBookingEditModalHandlers()`

- Defined at: line 291
- What this is: This is the main setup function for the booking edit modal handlers flow in the dashboard employee layer. It also matters for modal focus, temporary state, and predictable open/close behavior.
- Why this is used: It exists so one-time setup stays in one place.
- How this works: It computes date or time values, leans on helpers like `closeBookingEditModal`, `applyBookingEditDateTimeConstraints`, `loadEmployeeDirectory`, `renderParticipantSuggestions`, `initializeParticipantPicker`, and wires listeners for later user actions.
- What this helps with: It helps the feature become usable as soon as the page loads.
- Key inputs: This function does not take direct parameters; it mainly uses surrounding state, cached DOM references, or globals.
- Key dependencies: This function calls helpers such as `closeBookingEditModal`, `applyBookingEditDateTimeConstraints`, `loadEmployeeDirectory`, `renderParticipantSuggestions`, `initializeParticipantPicker`.
- Return or side effects: It works mainly through side effects, especially listener registration.

### Important Inline Callbacks

#### Inline Callback At Line 162

- Source marker: `.then(() => {`
- What this is: This is the inline success handler in a promise chain.
- Why this is used: It stays in the chain so response handling sits next to the request that produced it.
- How this works: After the async operation resolves, it inspects the result and applies the next local UI or state step.
- What this helps with: It helps keep request logic readable because success handling stays close to the fetch call.

#### Inline Callback At Line 165

- Source marker: `.catch(error => {`
- What this is: This is the inline error handler in a promise chain.
- Why this is used: It exists so request-specific failure handling stays beside the request flow that can fail.
- How this works: If the async chain rejects, it receives the error and turns it into logging, UI feedback, or cleanup.
- What this helps with: It helps the user see the right failure feedback for that exact request path.

#### Inline Callback At Line 234

- Source marker: `setTimeout(() => {`
- What this is: This is the delayed callback passed to a timeout timer.
- Why this is used: It exists because this feature needs to do something slightly later instead of immediately.
- How this works: The browser waits for the delay and then runs it with access to the surrounding state.
- What this helps with: It helps with deferred UI work or temporary notices.

#### Inline Callback At Line 294

- Source marker: `bookingEditModal.addEventListener("click", event => {`
- What this is: This is the inline click listener attached to `bookingEditModal`.
- Why this is used: It stays beside the event registration so the trigger and reaction are easy to read together.
- How this works: When the browser fires that event, the callback reads closure state, performs the local UI action, and may call named helpers for heavier work.
- What this helps with: It helps the interface respond directly to user input without creating another global helper.

#### Inline Callback At Line 301

- Source marker: `bookingEditDate.addEventListener("change", () => {`
- What this is: This is the inline change listener attached to `bookingEditDate`.
- Why this is used: It stays beside the event registration so the trigger and reaction are easy to read together.
- How this works: When the browser fires that event, the callback reads closure state, performs the local UI action, and may call named helpers for heavier work.
- What this helps with: It helps the interface respond directly to user input without creating another global helper.

#### Inline Callback At Line 304

- Source marker: `.then(() => {`
- What this is: This is the inline success handler in a promise chain.
- Why this is used: It stays in the chain so response handling sits next to the request that produced it.
- How this works: After the async operation resolves, it inspects the result and applies the next local UI or state step.
- What this helps with: It helps keep request logic readable because success handling stays close to the fetch call.

#### Inline Callback At Line 307

- Source marker: `.catch(error => {`
- What this is: This is the inline error handler in a promise chain.
- Why this is used: It exists so request-specific failure handling stays beside the request flow that can fail.
- How this works: If the async chain rejects, it receives the error and turns it into logging, UI feedback, or cleanup.
- What this helps with: It helps the user see the right failure feedback for that exact request path.

#### Inline Callback At Line 314

- Source marker: `bookingEditTime.addEventListener("change", () => {`
- What this is: This is the inline change listener attached to `bookingEditTime`.
- Why this is used: It stays beside the event registration so the trigger and reaction are easy to read together.
- How this works: When the browser fires that event, the callback reads closure state, performs the local UI action, and may call named helpers for heavier work.
- What this helps with: It helps the interface respond directly to user input without creating another global helper.

#### Inline Callback At Line 316

- Source marker: `.then(() => {`
- What this is: This is the inline success handler in a promise chain.
- Why this is used: It stays in the chain so response handling sits next to the request that produced it.
- How this works: After the async operation resolves, it inspects the result and applies the next local UI or state step.
- What this helps with: It helps keep request logic readable because success handling stays close to the fetch call.

#### Inline Callback At Line 319

- Source marker: `.catch(error => {`
- What this is: This is the inline error handler in a promise chain.
- Why this is used: It exists so request-specific failure handling stays beside the request flow that can fail.
- How this works: If the async chain rejects, it receives the error and turns it into logging, UI feedback, or cleanup.
- What this helps with: It helps the user see the right failure feedback for that exact request path.

#### Inline Callback At Line 325

- Source marker: `bookingEditDuration.addEventListener("change", () => {`
- What this is: This is the inline change listener attached to `bookingEditDuration`.
- Why this is used: It stays beside the event registration so the trigger and reaction are easy to read together.
- How this works: When the browser fires that event, the callback reads closure state, performs the local UI action, and may call named helpers for heavier work.
- What this helps with: It helps the interface respond directly to user input without creating another global helper.

#### Inline Callback At Line 327

- Source marker: `.then(() => {`
- What this is: This is the inline success handler in a promise chain.
- Why this is used: It stays in the chain so response handling sits next to the request that produced it.
- How this works: After the async operation resolves, it inspects the result and applies the next local UI or state step.
- What this helps with: It helps keep request logic readable because success handling stays close to the fetch call.

#### Inline Callback At Line 330

- Source marker: `.catch(error => {`
- What this is: This is the inline error handler in a promise chain.
- Why this is used: It exists so request-specific failure handling stays beside the request flow that can fail.
- How this works: If the async chain rejects, it receives the error and turns it into logging, UI feedback, or cleanup.
- What this helps with: It helps the user see the right failure feedback for that exact request path.

## frontend/js/dashboard/employee/modals/room-booking-modal.js

- Area: Dashboard Employee
- File role: This file owns room booking modal behavior inside the modal layer of dashboard employee.
- Line count: 240
- Named functions in this file: 10
- Important inline callbacks noted: 6
- Top-level behavior: mixes named helpers with direct runtime wiring for this feature.

### Named Functions

#### `renderRoomMediaSummary(room)`

- Defined at: line 37
- What this is: This is the render function for the room media summary UI in the dashboard employee layer. It also matters for modal focus, temporary state, and predictable open/close behavior.
- Why this is used: It exists so UI output is rebuilt from current state instead of patched everywhere.
- How this works: It leans on helpers like `getRoomPurposeText`, `getRoomSetupText`, `getRoomComfortText` and writes text, markup, or created elements back into the UI.
- What this helps with: It helps keep the visible UI aligned with the latest state.
- Key inputs: `room` carries room data or a room id.
- Key dependencies: This function calls helpers such as `getRoomPurposeText`, `getRoomSetupText`, `getRoomComfortText`.
- Return or side effects: It works mainly through side effects, especially DOM updates.

#### `setRoomModalMessage(message, type = "")`

- Defined at: line 49
- What this is: This sets or writes the room modal message state in the dashboard employee layer. It also matters for modal focus, temporary state, and predictable open/close behavior.
- Why this is used: It exists so status or state changes follow one rule set.
- How this works: It leans on helpers like `setHelperMessage`.
- What this helps with: It helps the UI communicate state or feedback in a standardized way.
- Key inputs: `message` is user-facing feedback text. `type` controls a visual tone or behavior mode.
- Key dependencies: This function calls helpers such as `setHelperMessage`.
- Return or side effects: It mostly works through local computation and whatever the caller does with the result.

#### `setRoomModalBookButtonState(isAvailable)`

- Defined at: line 53
- What this is: This sets or writes the room modal book button state state in the dashboard employee layer. It also matters for modal focus, temporary state, and predictable open/close behavior.
- Why this is used: It exists so status or state changes follow one rule set.
- How this works: It uses shared state such as `setRoomModalBookButtonState` and writes text, markup, or created elements back into the UI.
- What this helps with: It helps the UI communicate state or feedback in a standardized way.
- Key inputs: `isAvailable` is an input value the function uses.
- Key dependencies: This function touches shared runtime values like `setRoomModalBookButtonState`.
- Return or side effects: It works mainly through side effects, especially DOM updates.

#### `setRoomScheduleMessage(message, type = "")`

- Defined at: line 60
- What this is: This sets or writes the room schedule message state in the dashboard employee layer. It also matters for modal focus, temporary state, and predictable open/close behavior.
- Why this is used: It exists so status or state changes follow one rule set.
- How this works: It leans on helpers like `setHelperMessage`.
- What this helps with: It helps the UI communicate state or feedback in a standardized way.
- Key inputs: `message` is user-facing feedback text. `type` controls a visual tone or behavior mode.
- Key dependencies: This function calls helpers such as `setHelperMessage`.
- Return or side effects: It mostly works through local computation and whatever the caller does with the result.

#### `setRoomModalOrganizerHelp(message, type = "")`

- Defined at: line 64
- What this is: This sets or writes the room modal organizer help state in the dashboard employee layer. It also matters for modal focus, temporary state, and predictable open/close behavior.
- Why this is used: It exists so status or state changes follow one rule set.
- How this works: It leans on helpers like `setHelperMessage`.
- What this helps with: It helps the UI communicate state or feedback in a standardized way.
- Key inputs: `message` is user-facing feedback text. `type` controls a visual tone or behavior mode.
- Key dependencies: This function calls helpers such as `setHelperMessage`.
- Return or side effects: It mostly works through local computation and whatever the caller does with the result.

#### `getSlotLabel(windowValue)`

- Defined at: line 68
- What this is: This returns a derived slot label value for the dashboard employee layer. It also matters for modal focus, temporary state, and predictable open/close behavior.
- Why this is used: It exists to centralize a repeated lookup or calculation.
- How this works: It leans on helpers like `formatDateTime`, `formatTime`.
- What this helps with: It helps other code ask for the current slot label in one place.
- Key inputs: `windowValue` represents scheduling input.
- Key dependencies: This function calls helpers such as `formatDateTime`, `formatTime`.
- Return or side effects: Mostly returns a derived value or prepared structure back to the caller.

#### `openRoomModal(room, bookingWindow)`

- Defined at: line 76
- What this is: This opens the room modal UI or modal in the dashboard employee layer. It also matters for modal focus, temporary state, and predictable open/close behavior.
- Why this is used: It exists so opening logic can prepare state, content, and focus consistently. In modal code, that consistency prevents broken overlay and focus behavior.
- How this works: It leans on helpers like `buildFinderWindow`, `resetRoomScheduleState`, `getRoomImage`, `buildRoomFeatures`, `getSlotLabel`, `renderRoomMediaSummary`, uses shared state such as `selectedRoom`, `selectedBookingWindow`, `availabilityWindow`, `currentEmployeeId`, `resetRoomScheduleState`, `setRoomModalBookButtonState`, writes text, markup, or created elements back into the UI, and uses the shared modal manager.
- What this helps with: It helps the user start a focused interaction with the right context visible.
- Key inputs: `room` carries room data or a room id. `bookingWindow` carries booking data or a booking id.
- Key dependencies: This function calls helpers such as `buildFinderWindow`, `resetRoomScheduleState`, `getRoomImage`, `buildRoomFeatures`, `getSlotLabel`, `renderRoomMediaSummary`, touches shared runtime values like `selectedRoom`, `selectedBookingWindow`, `availabilityWindow`, `currentEmployeeId`, `resetRoomScheduleState`, `setRoomModalBookButtonState`, depends on the shared modal manager.
- Return or side effects: It works mainly through side effects, especially DOM updates.

#### `closeRoomModal()`

- Defined at: line 124
- What this is: This closes or tears down the room modal UI state. It also matters for modal focus, temporary state, and predictable open/close behavior.
- Why this is used: It exists so closing logic can clean up and restore context consistently. In modal code, that consistency prevents broken overlay and focus behavior.
- How this works: It leans on helpers like `closeManagedModal`, `updateRoomModalOrganizerSummary`, `renderRoomModalOrganizerSelection`, `resetRoomScheduleState`, `resetParticipantPicker`, `setRoomModalOrganizerHelp`, uses shared state such as `selectedRoom`, `selectedBookingWindow`, `currentEmployeeId`, `resetRoomScheduleState`, and uses the shared modal manager.
- What this helps with: It helps the user leave the interaction cleanly without stale state leaking into the next open.
- Key inputs: This function does not take direct parameters; it mainly uses surrounding state, cached DOM references, or globals.
- Key dependencies: This function calls helpers such as `closeManagedModal`, `updateRoomModalOrganizerSummary`, `renderRoomModalOrganizerSelection`, `resetRoomScheduleState`, `resetParticipantPicker`, `setRoomModalOrganizerHelp`, touches shared runtime values like `selectedRoom`, `selectedBookingWindow`, `currentEmployeeId`, `resetRoomScheduleState`, depends on the shared modal manager.
- Return or side effects: It mostly works through local computation and whatever the caller does with the result.

#### `async bookSelectedRoom()`

- Defined at: line 140
- What this is: This is a support helper for the book selected room work in the dashboard employee layer. It also matters for modal focus, temporary state, and predictable open/close behavior.
- Why this is used: It exists to keep repeated logic small and reusable. It also keeps backend communication tied to the right UI step.
- How this works: It computes date or time values, talks to backend routes like `/bookings`, leans on helpers like `setRoomModalMessage`, `isRoomAvailable`, `getRoomAvailabilityLabel`, `buildFinderWindow`, `isPastBeyondGrace`, `getCreateBookingOrganizerEmployeeId`, and uses shared state such as `selectedRoom`, `selectedBookingWindow`, `availabilityWindow`.
- What this helps with: It helps reduce duplication and makes the calling code easier to read.
- Key inputs: This function does not take direct parameters; it mainly uses surrounding state, cached DOM references, or globals.
- Key dependencies: This function calls helpers such as `setRoomModalMessage`, `isRoomAvailable`, `getRoomAvailabilityLabel`, `buildFinderWindow`, `isPastBeyondGrace`, `getCreateBookingOrganizerEmployeeId`, touches shared runtime values like `selectedRoom`, `selectedBookingWindow`, `availabilityWindow`, depends on backend routes including `/bookings`.
- Return or side effects: Mostly returns a derived value or prepared structure back to the caller.

#### `initializeRoomModalHandlers()`

- Defined at: line 215
- What this is: This is the main setup function for the room modal handlers flow in the dashboard employee layer. It also matters for modal focus, temporary state, and predictable open/close behavior.
- Why this is used: It exists so one-time setup stays in one place.
- How this works: It leans on helpers like `closeRoomModal`, `setCreateBookingOrganizer`, `setRoomScheduleOpen`, `initializeParticipantPicker`, uses shared state such as `roomScheduleState`, and wires listeners for later user actions.
- What this helps with: It helps the feature become usable as soon as the page loads.
- Key inputs: This function does not take direct parameters; it mainly uses surrounding state, cached DOM references, or globals.
- Key dependencies: This function calls helpers such as `closeRoomModal`, `setCreateBookingOrganizer`, `setRoomScheduleOpen`, `initializeParticipantPicker`, touches shared runtime values like `roomScheduleState`.
- Return or side effects: It works mainly through side effects, especially listener registration.

### Important Inline Callbacks

#### Inline Callback At Line 105

- Source marker: `.then(() => {`
- What this is: This is the inline success handler in a promise chain.
- Why this is used: It stays in the chain so response handling sits next to the request that produced it.
- How this works: After the async operation resolves, it inspects the result and applies the next local UI or state step.
- What this helps with: It helps keep request logic readable because success handling stays close to the fetch call.

#### Inline Callback At Line 108

- Source marker: `.catch(error => {`
- What this is: This is the inline error handler in a promise chain.
- Why this is used: It exists so request-specific failure handling stays beside the request flow that can fail.
- How this works: If the async chain rejects, it receives the error and turns it into logging, UI feedback, or cleanup.
- What this helps with: It helps the user see the right failure feedback for that exact request path.

#### Inline Callback At Line 206

- Source marker: `setTimeout(() => {`
- What this is: This is the delayed callback passed to a timeout timer.
- Why this is used: It exists because this feature needs to do something slightly later instead of immediately.
- How this works: The browser waits for the delay and then runs it with access to the surrounding state.
- What this helps with: It helps with deferred UI work or temporary notices.

#### Inline Callback At Line 218

- Source marker: `roomModal.addEventListener("click", event => {`
- What this is: This is the inline click listener attached to `roomModal`.
- Why this is used: It stays beside the event registration so the trigger and reaction are easy to read together.
- How this works: When the browser fires that event, the callback reads closure state, performs the local UI action, and may call named helpers for heavier work.
- What this helps with: It helps the interface respond directly to user input without creating another global helper.

#### Inline Callback At Line 228

- Source marker: `roomModalOrganizerSelect.addEventListener("change", () => {`
- What this is: This is the inline change listener attached to `roomModalOrganizerSelect`.
- Why this is used: It stays beside the event registration so the trigger and reaction are easy to read together.
- How this works: When the browser fires that event, the callback reads closure state, performs the local UI action, and may call named helpers for heavier work.
- What this helps with: It helps the interface respond directly to user input without creating another global helper.

#### Inline Callback At Line 233

- Source marker: `roomModalScheduleToggle.addEventListener("click", () => {`
- What this is: This is the inline click listener attached to `roomModalScheduleToggle`.
- Why this is used: It stays beside the event registration so the trigger and reaction are easy to read together.
- How this works: When the browser fires that event, the callback reads closure state, performs the local UI action, and may call named helpers for heavier work.
- What this helps with: It helps the interface respond directly to user input without creating another global helper.

## frontend/js/dashboard/employee/modals/room-schedule-modal.js

- Area: Dashboard Employee
- File role: This file owns room schedule modal behavior inside the modal layer of dashboard employee.
- Line count: 441
- Named functions in this file: 21
- Important inline callbacks noted: 5
- Top-level behavior: mixes named helpers with direct runtime wiring for this feature.

### Named Functions

#### `getRoomScheduleDurationMinutes()`

- Defined at: line 1
- What this is: This returns a derived room schedule duration minutes value for the dashboard employee layer. It also matters for modal focus, temporary state, and predictable open/close behavior.
- Why this is used: It exists to centralize a repeated lookup or calculation.
- How this works: It reads current DOM or form values, leans on helpers like `getMinutesBetween`, `getDurationMinutes`, and uses shared state such as `selectedBookingWindow`.
- What this helps with: It helps other code ask for the current room schedule duration minutes in one place.
- Key inputs: This function does not take direct parameters; it mainly uses surrounding state, cached DOM references, or globals.
- Key dependencies: This function calls helpers such as `getMinutesBetween`, `getDurationMinutes`, touches shared runtime values like `selectedBookingWindow`.
- Return or side effects: Mostly returns a derived value or prepared structure back to the caller.

#### `getRoomScheduleDateRange()`

- Defined at: line 8
- What this is: This returns a derived room schedule date range value for the dashboard employee layer. It also matters for modal focus, temporary state, and predictable open/close behavior.
- Why this is used: It exists to centralize a repeated lookup or calculation.
- How this works: It computes date or time values.
- What this helps with: It helps other code ask for the current room schedule date range in one place.
- Key inputs: This function does not take direct parameters; it mainly uses surrounding state, cached DOM references, or globals.
- Key dependencies: This function is mostly self-contained and depends only on local values plus standard browser APIs.
- Return or side effects: Mostly returns a derived value or prepared structure back to the caller.

#### `buildRoomScheduleRequest(roomId)`

- Defined at: line 18
- What this is: This builds the room schedule request structure another part of the feature needs. It also matters for modal focus, temporary state, and predictable open/close behavior.
- Why this is used: It exists to keep object, markup, or URL assembly consistent.
- How this works: It computes date or time values, builds or interprets URL/query data, and leans on helpers like `getRoomScheduleDateRange`.
- What this helps with: It helps other functions trust the assembled room schedule request shape.
- Key inputs: `roomId` carries room data or a room id.
- Key dependencies: This function calls helpers such as `getRoomScheduleDateRange`.
- Return or side effects: Mostly returns a derived value or prepared structure back to the caller.

#### `normalizeRoomScheduleBooking(booking)`

- Defined at: line 37
- What this is: This normalizes the room schedule booking so later code sees one consistent shape. It also matters for modal focus, temporary state, and predictable open/close behavior.
- Why this is used: It exists so downstream code does not guess between multiple input shapes.
- How this works: It computes date or time values and leans on helpers like `parseDateValue`.
- What this helps with: It helps downstream code stay simple because inputs become consistent.
- Key inputs: `booking` carries booking data or a booking id.
- Key dependencies: This function calls helpers such as `parseDateValue`.
- Return or side effects: Mostly returns a derived value or prepared structure back to the caller.

#### `normalizeRoomSchedulePayload(payload)`

- Defined at: line 61
- What this is: This normalizes the room schedule payload so later code sees one consistent shape. It also matters for modal focus, temporary state, and predictable open/close behavior.
- Why this is used: It exists so downstream code does not guess between multiple input shapes.
- How this works: It uses shared state such as `selectedRoom`.
- What this helps with: It helps downstream code stay simple because inputs become consistent.
- Key inputs: `payload` is an input value the function uses.
- Key dependencies: This function touches shared runtime values like `selectedRoom`.
- Return or side effects: Mostly returns a derived value or prepared structure back to the caller.

#### `getRoomScheduleWorkingWindow()`

- Defined at: line 69
- What this is: This returns a derived room schedule working window value for the dashboard employee layer. It also matters for modal focus, temporary state, and predictable open/close behavior.
- Why this is used: It exists to centralize a repeated lookup or calculation.
- How this works: It leans on helpers like `getTimeValueMinutes`.
- What this helps with: It helps other code ask for the current room schedule working window in one place.
- Key inputs: This function does not take direct parameters; it mainly uses surrounding state, cached DOM references, or globals.
- Key dependencies: This function calls helpers such as `getTimeValueMinutes`.
- Return or side effects: Mostly returns a derived value or prepared structure back to the caller.

#### `getRoomScheduleDayMeta(dayDate)`

- Defined at: line 79
- What this is: This returns a derived room schedule day meta value for the dashboard employee layer. It also matters for modal focus, temporary state, and predictable open/close behavior.
- Why this is used: It exists to centralize a repeated lookup or calculation.
- How this works: It computes date or time values.
- What this helps with: It helps other code ask for the current room schedule day meta in one place.
- Key inputs: `dayDate` represents scheduling input.
- Key dependencies: This function is mostly self-contained and depends only on local values plus standard browser APIs.
- Return or side effects: Mostly returns a derived value or prepared structure back to the caller.

#### `getRoomScheduleMetaText(payload)`

- Defined at: line 101
- What this is: This returns a derived room schedule meta text value for the dashboard employee layer. It also matters for modal focus, temporary state, and predictable open/close behavior.
- Why this is used: It exists to centralize a repeated lookup or calculation.
- How this works: It leans on helpers like `getRoomScheduleWorkingWindow`, `format24HourAs12Hour`.
- What this helps with: It helps other code ask for the current room schedule meta text in one place.
- Key inputs: `payload` is an input value the function uses.
- Key dependencies: This function calls helpers such as `getRoomScheduleWorkingWindow`, `format24HourAs12Hour`.
- Return or side effects: Mostly returns a derived value or prepared structure back to the caller.

#### `buildRoomScheduleLoadingMarkup(dayCount = ROOM_SCHEDULE_DAYS)`

- Defined at: line 112
- What this is: This builds the room schedule loading markup structure another part of the feature needs. It also matters for modal focus, temporary state, and predictable open/close behavior.
- Why this is used: It exists to keep object, markup, or URL assembly consistent.
- How this works: It performs small synchronous logic and returns the result.
- What this helps with: It helps other functions trust the assembled room schedule loading markup shape.
- Key inputs: `dayCount` is an input value the function uses.
- Key dependencies: This function is mostly self-contained and depends only on local values plus standard browser APIs.
- Return or side effects: Mostly returns a derived value or prepared structure back to the caller.

#### `isRoomScheduleSlotSelected(slot)`

- Defined at: line 132
- What this is: This answers a yes-or-no rule about the room schedule slot selected flow. It also matters for modal focus, temporary state, and predictable open/close behavior.
- Why this is used: It exists so calling code can branch on one clear business rule.
- How this works: It uses shared state such as `selectedBookingWindow`.
- What this helps with: It helps business rules stay readable and testable.
- Key inputs: `slot` is an input value the function uses.
- Key dependencies: This function touches shared runtime values like `selectedBookingWindow`.
- Return or side effects: Mostly returns a derived value or prepared structure back to the caller.

#### `buildRoomScheduleDayDates()`

- Defined at: line 141
- What this is: This builds the room schedule day dates structure another part of the feature needs. It also matters for modal focus, temporary state, and predictable open/close behavior.
- Why this is used: It exists to keep object, markup, or URL assembly consistent.
- How this works: It computes date or time values and leans on helpers like `getRoomScheduleDateRange`.
- What this helps with: It helps other functions trust the assembled room schedule day dates shape.
- Key inputs: This function does not take direct parameters; it mainly uses surrounding state, cached DOM references, or globals.
- Key dependencies: This function calls helpers such as `getRoomScheduleDateRange`.
- Return or side effects: Mostly returns a derived value or prepared structure back to the caller.

#### `getRoomScheduleConflictBooking(bookings, slotStartMs, slotEndMs)`

- Defined at: line 150
- What this is: This returns a derived room schedule conflict booking value for the dashboard employee layer. It also matters for modal focus, temporary state, and predictable open/close behavior.
- Why this is used: It exists to centralize a repeated lookup or calculation.
- How this works: It performs small synchronous logic and returns the result.
- What this helps with: It helps other code ask for the current room schedule conflict booking in one place.
- Key inputs: `bookings` carries booking data or a booking id. `slotStartMs` is an input value the function uses. `slotEndMs` is an input value the function uses.
- Key dependencies: This function is mostly self-contained and depends only on local values plus standard browser APIs.
- Return or side effects: Mostly returns a derived value or prepared structure back to the caller.

#### `buildRoomScheduleSlotsForDay(dayDate, payload)`

- Defined at: line 154
- What this is: This builds the room schedule slots for day structure another part of the feature needs. It also matters for modal focus, temporary state, and predictable open/close behavior.
- Why this is used: It exists to keep object, markup, or URL assembly consistent.
- How this works: It computes date or time values and leans on helpers like `getRoomScheduleWorkingWindow`, `getRoomScheduleConflictBooking`.
- What this helps with: It helps other functions trust the assembled room schedule slots for day shape.
- Key inputs: `dayDate` represents scheduling input. `payload` is an input value the function uses.
- Key dependencies: This function calls helpers such as `getRoomScheduleWorkingWindow`, `getRoomScheduleConflictBooking`.
- Return or side effects: Mostly returns a derived value or prepared structure back to the caller.

#### `buildRoomScheduleSlotMarkup(slot)`

- Defined at: line 190
- What this is: This builds the room schedule slot markup structure another part of the feature needs. It also matters for modal focus, temporary state, and predictable open/close behavior.
- Why this is used: It exists to keep object, markup, or URL assembly consistent.
- How this works: It leans on helpers like `formatTime`, `escapeHtml`, `isRoomScheduleSlotSelected`.
- What this helps with: It helps other functions trust the assembled room schedule slot markup shape.
- Key inputs: `slot` is an input value the function uses.
- Key dependencies: This function calls helpers such as `formatTime`, `escapeHtml`, `isRoomScheduleSlotSelected`.
- Return or side effects: Mostly returns a derived value or prepared structure back to the caller.

#### `buildRoomScheduleDayMarkup(dayDate, payload)`

- Defined at: line 231
- What this is: This builds the room schedule day markup structure another part of the feature needs. It also matters for modal focus, temporary state, and predictable open/close behavior.
- Why this is used: It exists to keep object, markup, or URL assembly consistent.
- How this works: It computes date or time values and leans on helpers like `buildRoomScheduleSlotsForDay`, `getRoomScheduleDayMeta`, `escapeHtml`.
- What this helps with: It helps other functions trust the assembled room schedule day markup shape.
- Key inputs: `dayDate` represents scheduling input. `payload` is an input value the function uses.
- Key dependencies: This function calls helpers such as `buildRoomScheduleSlotsForDay`, `getRoomScheduleDayMeta`, `escapeHtml`.
- Return or side effects: Mostly returns a derived value or prepared structure back to the caller.

#### `renderRoomSchedule()`

- Defined at: line 258
- What this is: This is the render function for the room schedule UI in the dashboard employee layer. It also matters for modal focus, temporary state, and predictable open/close behavior.
- Why this is used: It exists so UI output is rebuilt from current state instead of patched everywhere.
- How this works: It leans on helpers like `buildRoomScheduleLoadingMarkup`, `getRoomScheduleMetaText`, `buildRoomScheduleDayDates`, `buildRoomScheduleDayMarkup`, uses shared state such as `roomScheduleState`, and writes text, markup, or created elements back into the UI.
- What this helps with: It helps keep the visible UI aligned with the latest state.
- Key inputs: This function does not take direct parameters; it mainly uses surrounding state, cached DOM references, or globals.
- Key dependencies: This function calls helpers such as `buildRoomScheduleLoadingMarkup`, `getRoomScheduleMetaText`, `buildRoomScheduleDayDates`, `buildRoomScheduleDayMarkup`, touches shared runtime values like `roomScheduleState`.
- Return or side effects: It works mainly through side effects, especially DOM updates.

#### `async loadRoomSchedule({ force = false } = {})`

- Defined at: line 278
- What this is: This is the data-loading function for the room schedule flow in the dashboard employee layer. It also matters for modal focus, temporary state, and predictable open/close behavior.
- Why this is used: It exists so loading, success, and error paths stay consistent. It also keeps backend communication tied to the right UI step.
- How this works: It talks to the backend, leans on helpers like `buildRoomScheduleRequest`, `renderRoomSchedule`, `apiFetch`, `normalizeRoomSchedulePayload`, and uses shared state such as `selectedRoom`, `roomScheduleState`.
- What this helps with: It helps the user see fresh data and gives the feature a clear refresh path.
- Key inputs: `force` is an input value the function uses.
- Key dependencies: This function calls helpers such as `buildRoomScheduleRequest`, `renderRoomSchedule`, `apiFetch`, `normalizeRoomSchedulePayload`, touches shared runtime values like `selectedRoom`, `roomScheduleState`, depends on a backend request path.
- Return or side effects: It works mainly through side effects, especially network requests.

#### `setRoomScheduleOpen(isOpen)`

- Defined at: line 304
- What this is: This sets or writes the room schedule open state in the dashboard employee layer. It also matters for modal focus, temporary state, and predictable open/close behavior.
- Why this is used: It exists so status or state changes follow one rule set. In modal code, that consistency prevents broken overlay and focus behavior.
- How this works: It leans on helpers like `closeManagedModal`, `setRoomScheduleMessage`, `renderRoomSchedule`, `openManagedModal`, `loadRoomSchedule`, uses shared state such as `roomScheduleState`, `selectedRoom`, writes text, markup, or created elements back into the UI, and uses the shared modal manager.
- What this helps with: It helps the UI communicate state or feedback in a standardized way.
- Key inputs: `isOpen` is an input value the function uses.
- Key dependencies: This function calls helpers such as `closeManagedModal`, `setRoomScheduleMessage`, `renderRoomSchedule`, `openManagedModal`, `loadRoomSchedule`, touches shared runtime values like `roomScheduleState`, `selectedRoom`, depends on the shared modal manager.
- Return or side effects: It works mainly through side effects, especially DOM updates.

#### `resetRoomScheduleState()`

- Defined at: line 341
- What this is: This clears or resets the room schedule state state. It also matters for modal focus, temporary state, and predictable open/close behavior.
- Why this is used: It exists so the feature can return to a known clean baseline. In modal code, that consistency prevents broken overlay and focus behavior.
- How this works: It leans on helpers like `closeManagedModal`, `setRoomScheduleMessage`, uses shared state such as `resetRoomScheduleState`, `roomScheduleState`, writes text, markup, or created elements back into the UI, and uses the shared modal manager.
- What this helps with: It helps avoid stale errors, selections, and temporary state.
- Key inputs: This function does not take direct parameters; it mainly uses surrounding state, cached DOM references, or globals.
- Key dependencies: This function calls helpers such as `closeManagedModal`, `setRoomScheduleMessage`, touches shared runtime values like `resetRoomScheduleState`, `roomScheduleState`, depends on the shared modal manager.
- Return or side effects: It works mainly through side effects, especially DOM updates.

#### `async applyRoomScheduleSelection(startTime, endTime)`

- Defined at: line 371
- What this is: This applies the room schedule selection rule to the live UI state. It also matters for modal focus, temporary state, and predictable open/close behavior.
- Why this is used: It exists so a computed rule is actually pushed into the live UI at the right time.
- How this works: It reads current DOM or form values, leans on helpers like `parseDateValue`, `setRoomScheduleMessage`, `getMinutesBetween`, `getRoomScheduleDurationMinutes`, `getLocalDateInputValue`, `setTimeInputValue`, uses shared state such as `selectedBookingWindow`, `selectedRoom`, `setRoomModalBookButtonState`, and writes text, markup, or created elements back into the UI.
- What this helps with: It helps the interface enforce the right rule at the exact place the user feels it.
- Key inputs: `startTime` represents scheduling input. `endTime` represents scheduling input.
- Key dependencies: This function calls helpers such as `parseDateValue`, `setRoomScheduleMessage`, `getMinutesBetween`, `getRoomScheduleDurationMinutes`, `getLocalDateInputValue`, `setTimeInputValue`, touches shared runtime values like `selectedBookingWindow`, `selectedRoom`, `setRoomModalBookButtonState`.
- Return or side effects: It works mainly through side effects, especially DOM updates.

#### `initializeRoomScheduleModalHandlers()`

- Defined at: line 423
- What this is: This is the main setup function for the room schedule modal handlers flow in the dashboard employee layer. It also matters for modal focus, temporary state, and predictable open/close behavior.
- Why this is used: It exists so one-time setup stays in one place.
- How this works: It reads current DOM or form values, leans on helpers like `applyRoomScheduleSelection`, `setRoomScheduleOpen`, and wires listeners for later user actions.
- What this helps with: It helps the feature become usable as soon as the page loads.
- Key inputs: This function does not take direct parameters; it mainly uses surrounding state, cached DOM references, or globals.
- Key dependencies: This function calls helpers such as `applyRoomScheduleSelection`, `setRoomScheduleOpen`.
- Return or side effects: It works mainly through side effects, especially listener registration.

### Important Inline Callbacks

#### Inline Callback At Line 331

- Source marker: `void loadRoomSchedule({ force: false }).catch(error => {`
- What this is: This is the inline error handler in a promise chain.
- Why this is used: It exists so request-specific failure handling stays beside the request flow that can fail.
- How this works: If the async chain rejects, it receives the error and turns it into logging, UI feedback, or cleanup.
- What this helps with: It helps the user see the right failure feedback for that exact request path.

#### Inline Callback At Line 411

- Source marker: `.then(() => {`
- What this is: This is the inline success handler in a promise chain.
- Why this is used: It stays in the chain so response handling sits next to the request that produced it.
- How this works: After the async operation resolves, it inspects the result and applies the next local UI or state step.
- What this helps with: It helps keep request logic readable because success handling stays close to the fetch call.

#### Inline Callback At Line 414

- Source marker: `.catch(error => {`
- What this is: This is the inline error handler in a promise chain.
- Why this is used: It exists so request-specific failure handling stays beside the request flow that can fail.
- How this works: If the async chain rejects, it receives the error and turns it into logging, UI feedback, or cleanup.
- What this helps with: It helps the user see the right failure feedback for that exact request path.

#### Inline Callback At Line 418

- Source marker: `void searchRooms().catch(error => {`
- What this is: This is the inline error handler in a promise chain.
- Why this is used: It exists so request-specific failure handling stays beside the request flow that can fail.
- How this works: If the async chain rejects, it receives the error and turns it into logging, UI feedback, or cleanup.
- What this helps with: It helps the user see the right failure feedback for that exact request path.

#### Inline Callback At Line 426

- Source marker: `roomScheduleModal.addEventListener("click", event => {`
- What this is: This is the inline click listener attached to `roomScheduleModal`.
- Why this is used: It stays beside the event registration so the trigger and reaction are easy to read together.
- How this works: When the browser fires that event, the callback reads closure state, performs the local UI action, and may call named helpers for heavier work.
- What this helps with: It helps the interface respond directly to user input without creating another global helper.

## frontend/js/dashboard/employee/overview/overview-load.js

- Area: Dashboard Employee
- File role: This file owns overview load behavior in the dashboard employee layer.
- Line count: 27
- Named functions in this file: 1
- Important inline callbacks noted: 0
- Top-level behavior: mixes named helpers with direct runtime wiring for this feature.

### Named Functions

#### `async loadSummary()`

- Defined at: line 1
- What this is: This is the data-loading function for the summary flow in the dashboard employee layer.
- Why this is used: It exists so loading, success, and error paths stay consistent. It also keeps backend communication tied to the right UI step.
- How this works: It reads current DOM or form values, talks to backend routes like `/bookings/summary`, leans on helpers like `apiFetch`, uses shared state such as `currentRole`, and writes text, markup, or created elements back into the UI.
- What this helps with: It helps the user see fresh data and gives the feature a clear refresh path.
- Key inputs: This function does not take direct parameters; it mainly uses surrounding state, cached DOM references, or globals.
- Key dependencies: This function calls helpers such as `apiFetch`, touches shared runtime values like `currentRole`, depends on backend routes including `/bookings/summary`.
- Return or side effects: It works mainly through side effects, especially DOM updates, network requests.

## frontend/js/dashboard/employee/overview/overview-render.js

- Area: Dashboard Employee
- File role: This file owns overview render behavior in the dashboard employee layer.
- Line count: 42
- Named functions in this file: 1
- Important inline callbacks noted: 0
- Top-level behavior: mixes named helpers with direct runtime wiring for this feature.

### Named Functions

#### `renderOverviewBookings(rows)`

- Defined at: line 1
- What this is: This is the render function for the overview bookings UI in the dashboard employee layer.
- Why this is used: It exists so UI output is rebuilt from current state instead of patched everywhere.
- How this works: It reads current DOM or form values, leans on helpers like `getStatusClass`, `formatDate`, `formatTimeRange`, `escapeHtml`, `getBookingOrganizerDisplayName`, uses shared state such as `currentRole`, and writes text, markup, or created elements back into the UI.
- What this helps with: It helps keep the visible UI aligned with the latest state.
- Key inputs: `rows` is an input value the function uses.
- Key dependencies: This function calls helpers such as `getStatusClass`, `formatDate`, `formatTimeRange`, `escapeHtml`, `getBookingOrganizerDisplayName`, touches shared runtime values like `currentRole`.
- Return or side effects: It works mainly through side effects, especially DOM updates.

## frontend/js/dashboard/employee/room-finder/finder-availability.js

- Area: Dashboard Employee
- File role: This file owns finder availability behavior in the dashboard employee layer.
- Line count: 152
- Named functions in this file: 5
- Important inline callbacks noted: 0
- Top-level behavior: mixes named helpers with direct runtime wiring for this feature.

### Named Functions

#### `renderAvailabilityList(rooms)`

- Defined at: line 1
- What this is: This is the render function for the availability list UI in the dashboard employee layer.
- Why this is used: It exists so UI output is rebuilt from current state instead of patched everywhere.
- How this works: It reads current DOM or form values, leans on helpers like `setBookedNowPanelTone`, `escapeHtml`, `getRoomAvailabilityLabel`, uses shared state such as `availabilityRoomsById`, and writes text, markup, or created elements back into the UI.
- What this helps with: It helps keep the visible UI aligned with the latest state.
- Key inputs: `rooms` carries room data or a room id.
- Key dependencies: This function calls helpers such as `setBookedNowPanelTone`, `escapeHtml`, `getRoomAvailabilityLabel`, touches shared runtime values like `availabilityRoomsById`.
- Return or side effects: It works mainly through side effects, especially DOM updates.

#### `renderAvailabilityErrorState()`

- Defined at: line 40
- What this is: This is the render function for the availability error state UI in the dashboard employee layer.
- Why this is used: It exists so UI output is rebuilt from current state instead of patched everywhere.
- How this works: It reads current DOM or form values, leans on helpers like `setBookedNowPanelTone`, uses shared state such as `renderAvailabilityErrorState`, `availabilityRoomsById`, and writes text, markup, or created elements back into the UI.
- What this helps with: It helps keep the visible UI aligned with the latest state.
- Key inputs: This function does not take direct parameters; it mainly uses surrounding state, cached DOM references, or globals.
- Key dependencies: This function calls helpers such as `setBookedNowPanelTone`, touches shared runtime values like `renderAvailabilityErrorState`, `availabilityRoomsById`.
- Return or side effects: It works mainly through side effects, especially DOM updates.

#### `async loadFinderLocations()`

- Defined at: line 54
- What this is: This is the data-loading function for the finder locations flow in the dashboard employee layer.
- Why this is used: It exists so loading, success, and error paths stay consistent. It also keeps backend communication tied to the right UI step.
- How this works: It reads current DOM or form values, talks to backend routes like `/locations`, leans on helpers like `apiFetch`, and writes text, markup, or created elements back into the UI.
- What this helps with: It helps the user see fresh data and gives the feature a clear refresh path.
- Key inputs: This function does not take direct parameters; it mainly uses surrounding state, cached DOM references, or globals.
- Key dependencies: This function calls helpers such as `apiFetch`, depends on backend routes including `/locations`.
- Return or side effects: It works mainly through side effects, especially DOM updates, network requests.

#### `async searchRooms(event)`

- Defined at: line 76
- What this is: This is a support helper for the search rooms work in the dashboard employee layer.
- Why this is used: It exists to keep repeated logic small and reusable. It also keeps backend communication tied to the right UI step.
- How this works: It reads current DOM or form values, builds or interprets URL/query data, talks to backend routes like `/rooms?${params.toString`, leans on helpers like `setRoomFinderMessage`, `buildFinderWindow`, `renderRoomFinderTable`, `parseDateValue`, `isPastBeyondGrace`, `buildTableSkeletonRows`, and writes text, markup, or created elements back into the UI.
- What this helps with: It helps reduce duplication and makes the calling code easier to read.
- Key inputs: `event` is the browser event object.
- Key dependencies: This function calls helpers such as `setRoomFinderMessage`, `buildFinderWindow`, `renderRoomFinderTable`, `parseDateValue`, `isPastBeyondGrace`, `buildTableSkeletonRows`, depends on backend routes including `/rooms?${params.toString`.
- Return or side effects: Mostly returns a derived value or prepared structure back to the caller.

#### `async loadOverviewAvailability()`

- Defined at: line 124
- What this is: This is the data-loading function for the overview availability flow in the dashboard employee layer.
- Why this is used: It exists so loading, success, and error paths stay consistent. It also keeps backend communication tied to the right UI step.
- How this works: It reads current DOM or form values, computes date or time values, builds or interprets URL/query data, talks to backend routes like `/rooms?${params.toString`, leans on helpers like `buildAvailabilityLoadingMarkup`, `apiFetch`, `isRoomAvailable`, `renderAvailabilityList`, `renderAvailabilityErrorState`, uses shared state such as `availabilityWindow`, `renderAvailabilityErrorState`, and writes text, markup, or created elements back into the UI.
- What this helps with: It helps the user see fresh data and gives the feature a clear refresh path.
- Key inputs: This function does not take direct parameters; it mainly uses surrounding state, cached DOM references, or globals.
- Key dependencies: This function calls helpers such as `buildAvailabilityLoadingMarkup`, `apiFetch`, `isRoomAvailable`, `renderAvailabilityList`, `renderAvailabilityErrorState`, touches shared runtime values like `availabilityWindow`, `renderAvailabilityErrorState`, depends on backend routes including `/rooms?${params.toString`.
- Return or side effects: It works mainly through side effects, especially DOM updates, network requests.

## frontend/js/dashboard/employee/room-finder/finder-form.js

- Area: Dashboard Employee
- File role: This file owns finder form behavior in the dashboard employee layer.
- Line count: 77
- Named functions in this file: 5
- Important inline callbacks noted: 0
- Top-level behavior: mixes named helpers with direct runtime wiring for this feature.

### Named Functions

#### `setRoomFinderMessage(message, type = "")`

- Defined at: line 1
- What this is: This sets or writes the room finder message state in the dashboard employee layer.
- Why this is used: It exists so status or state changes follow one rule set.
- How this works: It reads current DOM or form values and leans on helpers like `setHelperMessage`.
- What this helps with: It helps the UI communicate state or feedback in a standardized way.
- Key inputs: `message` is user-facing feedback text. `type` controls a visual tone or behavior mode.
- Key dependencies: This function calls helpers such as `setHelperMessage`.
- Return or side effects: It mostly works through local computation and whatever the caller does with the result.

#### `applyFinderDateTimeConstraints()`

- Defined at: line 6
- What this is: This applies the finder date time constraints rule to the live UI state.
- Why this is used: It exists so a computed rule is actually pushed into the live UI at the right time.
- How this works: It reads current DOM or form values, computes date or time values, and leans on helpers like `getLocalDateInputValue`, `getLocalTimeInputValue`, `getTimeValueMinutes`, `getTimeInputValue24`, `setTimeInputValue`.
- What this helps with: It helps the interface enforce the right rule at the exact place the user feels it.
- Key inputs: This function does not take direct parameters; it mainly uses surrounding state, cached DOM references, or globals.
- Key dependencies: This function calls helpers such as `getLocalDateInputValue`, `getLocalTimeInputValue`, `getTimeValueMinutes`, `getTimeInputValue24`, `setTimeInputValue`.
- Return or side effects: It mostly works through local computation and whatever the caller does with the result.

#### `buildFinderWindow()`

- Defined at: line 32
- What this is: This builds the finder window structure another part of the feature needs.
- Why this is used: It exists to keep object, markup, or URL assembly consistent.
- How this works: It reads current DOM or form values and leans on helpers like `buildWindowFromLocalInputs`.
- What this helps with: It helps other functions trust the assembled finder window shape.
- Key inputs: This function does not take direct parameters; it mainly uses surrounding state, cached DOM references, or globals.
- Key dependencies: This function calls helpers such as `buildWindowFromLocalInputs`.
- Return or side effects: Mostly returns a derived value or prepared structure back to the caller.

#### `initializeRoomFinder()`

- Defined at: line 39
- What this is: This is the main setup function for the room finder flow in the dashboard employee layer.
- Why this is used: It exists so one-time setup stays in one place.
- How this works: It reads current DOM or form values, computes date or time values, and leans on helpers like `setTimeInputValue`, `applyFinderDateTimeConstraints`.
- What this helps with: It helps the feature become usable as soon as the page loads.
- Key inputs: This function does not take direct parameters; it mainly uses surrounding state, cached DOM references, or globals.
- Key dependencies: This function calls helpers such as `setTimeInputValue`, `applyFinderDateTimeConstraints`.
- Return or side effects: It mostly works through local computation and whatever the caller does with the result.

#### `clearFinderMessage()`

- Defined at: line 68
- What this is: This clears or resets the finder message state.
- Why this is used: It exists so the feature can return to a known clean baseline.
- How this works: It leans on helpers like `setRoomFinderMessage`.
- What this helps with: It helps avoid stale errors, selections, and temporary state.
- Key inputs: This function does not take direct parameters; it mainly uses surrounding state, cached DOM references, or globals.
- Key dependencies: This function calls helpers such as `setRoomFinderMessage`.
- Return or side effects: It works mainly through side effects, especially listener registration.

## frontend/js/dashboard/employee/room-finder/finder-render.js

- Area: Dashboard Employee
- File role: This file owns finder render behavior in the dashboard employee layer.
- Line count: 49
- Named functions in this file: 2
- Important inline callbacks noted: 0
- Top-level behavior: mixes named helpers with direct runtime wiring for this feature.

### Named Functions

#### `renderRoomFinderTable(rooms)`

- Defined at: line 1
- What this is: This is the render function for the room finder table UI in the dashboard employee layer.
- Why this is used: It exists so UI output is rebuilt from current state instead of patched everywhere.
- How this works: It reads current DOM or form values, leans on helpers like `setPaginationRows`, `renderRoomFinderPage`, and uses shared state such as `finderRoomsById`.
- What this helps with: It helps keep the visible UI aligned with the latest state.
- Key inputs: `rooms` carries room data or a room id.
- Key dependencies: This function calls helpers such as `setPaginationRows`, `renderRoomFinderPage`, touches shared runtime values like `finderRoomsById`.
- Return or side effects: It mostly works through local computation and whatever the caller does with the result.

#### `renderRoomFinderPage()`

- Defined at: line 14
- What this is: This is the render function for the room finder page UI in the dashboard employee layer.
- Why this is used: It exists so UI output is rebuilt from current state instead of patched everywhere.
- How this works: It reads current DOM or form values, leans on helpers like `getPaginationSlice`, `renderPaginationControls`, `isRoomAvailable`, `getRoomAvailabilityLabel`, `escapeHtml`, `buildRoomFeatures`, writes text, markup, or created elements back into the UI, and refreshes pagination controls.
- What this helps with: It helps keep the visible UI aligned with the latest state.
- Key inputs: This function does not take direct parameters; it mainly uses surrounding state, cached DOM references, or globals.
- Key dependencies: This function calls helpers such as `getPaginationSlice`, `renderPaginationControls`, `isRoomAvailable`, `getRoomAvailabilityLabel`, `escapeHtml`, `buildRoomFeatures`.
- Return or side effects: It works mainly through side effects, especially DOM updates.

## frontend/js/dashboard/shared/header/header-labels.js

- Area: Dashboard Shared
- File role: This file owns header labels behavior in the dashboard shared layer.
- Line count: 29
- Named functions in this file: 2
- Important inline callbacks noted: 0
- Top-level behavior: mixes named helpers with direct runtime wiring for this feature.

### Named Functions

#### `setTodayLabel()`

- Defined at: line 1
- What this is: This sets or writes the today label state in the dashboard shared layer.
- Why this is used: It exists so status or state changes follow one rule set.
- How this works: It reads current DOM or form values, computes date or time values, and writes text, markup, or created elements back into the UI.
- What this helps with: It helps the UI communicate state or feedback in a standardized way.
- Key inputs: This function does not take direct parameters; it mainly uses surrounding state, cached DOM references, or globals.
- Key dependencies: This function is mostly self-contained and depends only on local values plus standard browser APIs.
- Return or side effects: It works mainly through side effects, especially DOM updates.

#### `setHeaderContent()`

- Defined at: line 13
- What this is: This sets or writes the header content state in the dashboard shared layer.
- Why this is used: It exists so status or state changes follow one rule set.
- How this works: It reads current DOM or form values, leans on helpers like `getProfileImagePath`, uses shared state such as `currentEmployee`, `currentRole`, and writes text, markup, or created elements back into the UI.
- What this helps with: It helps the UI communicate state or feedback in a standardized way.
- Key inputs: This function does not take direct parameters; it mainly uses surrounding state, cached DOM references, or globals.
- Key dependencies: This function calls helpers such as `getProfileImagePath`, touches shared runtime values like `currentEmployee`, `currentRole`.
- Return or side effects: It works mainly through side effects, especially DOM updates.

## frontend/js/dashboard/shared/header/header-profile.js

- Area: Dashboard Shared
- File role: This file owns header profile behavior in the dashboard shared layer.
- Line count: 183
- Named functions in this file: 6
- Important inline callbacks noted: 1
- Top-level behavior: mixes named helpers with direct runtime wiring for this feature.

### Named Functions

#### `getPasswordRuleState(passwordValue)`

- Defined at: line 3
- What this is: This returns a derived password rule state value for the dashboard shared layer.
- Why this is used: It exists to centralize a repeated lookup or calculation.
- How this works: It uses shared state such as `getPasswordRuleState`.
- What this helps with: It helps other code ask for the current password rule state in one place.
- Key inputs: `passwordValue` is an input value the function uses.
- Key dependencies: This function touches shared runtime values like `getPasswordRuleState`.
- Return or side effects: Mostly returns a derived value or prepared structure back to the caller.

#### `getPasswordRuleError(passwordValue)`

- Defined at: line 14
- What this is: This returns a derived password rule error value for the dashboard shared layer.
- Why this is used: It exists to centralize a repeated lookup or calculation.
- How this works: It leans on helpers like `getPasswordRuleState` and uses shared state such as `ruleState`, `getPasswordRuleState`.
- What this helps with: It helps other code ask for the current password rule error in one place.
- Key inputs: `passwordValue` is an input value the function uses.
- Key dependencies: This function calls helpers such as `getPasswordRuleState`, touches shared runtime values like `ruleState`, `getPasswordRuleState`.
- Return or side effects: Mostly returns a derived value or prepared structure back to the caller.

#### `updatePasswordResetNotice()`

- Defined at: line 24
- What this is: This updates the password reset notice after state changes.
- Why this is used: It exists so dependent UI reacts when state changes.
- How this works: It reads current DOM or form values, uses shared state such as `currentEmployee`, and writes text, markup, or created elements back into the UI.
- What this helps with: It helps linked UI pieces stay synchronized after a change.
- Key inputs: This function does not take direct parameters; it mainly uses surrounding state, cached DOM references, or globals.
- Key dependencies: This function touches shared runtime values like `currentEmployee`.
- Return or side effects: It works mainly through side effects, especially DOM updates.

#### `setProfileSection()`

- Defined at: line 37
- What this is: This sets or writes the profile section state in the dashboard shared layer.
- Why this is used: It exists so status or state changes follow one rule set.
- How this works: It reads current DOM or form values, computes date or time values, leans on helpers like `normalizeGender`, `parseDateValue`, `getProfileImagePath`, `updatePasswordResetNotice`, uses shared state such as `currentEmployee`, `isAdmin`, and writes text, markup, or created elements back into the UI.
- What this helps with: It helps the UI communicate state or feedback in a standardized way.
- Key inputs: This function does not take direct parameters; it mainly uses surrounding state, cached DOM references, or globals.
- Key dependencies: This function calls helpers such as `normalizeGender`, `parseDateValue`, `getProfileImagePath`, `updatePasswordResetNotice`, touches shared runtime values like `currentEmployee`, `isAdmin`.
- Return or side effects: It works mainly through side effects, especially DOM updates.

#### `initializeProfileSecurity()`

- Defined at: line 78
- What this is: This is the main setup function for the profile security flow in the dashboard shared layer.
- Why this is used: It exists so one-time setup stays in one place.
- How this works: It reads current DOM or form values and leans on helpers like `updatePasswordResetNotice`.
- What this helps with: It helps the feature become usable as soon as the page loads.
- Key inputs: This function does not take direct parameters; it mainly uses surrounding state, cached DOM references, or globals.
- Key dependencies: This function calls helpers such as `updatePasswordResetNotice`.
- Return or side effects: It mostly works through local computation and whatever the caller does with the result.

#### `renderPasswordHints()`

- Defined at: line 92
- What this is: This is the render function for the password hints UI in the dashboard shared layer.
- Why this is used: It exists so UI output is rebuilt from current state instead of patched everywhere. It also keeps backend communication tied to the right UI step.
- How this works: It reads current DOM or form values, builds or interprets URL/query data, talks to backend routes like `/auth/change-password`, leans on helpers like `getPasswordRuleState`, `setHelperMessage`, `getPasswordRuleError`, `apiFetch`, `setCurrentEmployee`, uses shared state such as `ruleState`, `getPasswordRuleState`, `replaceState`, writes text, markup, or created elements back into the UI, toggles CSS classes to reflect current state, and can redirect or alter browser navigation.
- What this helps with: It helps keep the visible UI aligned with the latest state.
- Key inputs: This function does not take direct parameters; it mainly uses surrounding state, cached DOM references, or globals.
- Key dependencies: This function calls helpers such as `getPasswordRuleState`, `setHelperMessage`, `getPasswordRuleError`, `apiFetch`, `setCurrentEmployee`, touches shared runtime values like `ruleState`, `getPasswordRuleState`, `replaceState`, depends on backend routes including `/auth/change-password`.
- Return or side effects: It works mainly through side effects, especially DOM updates, CSS class changes, network requests, navigation changes, listener registration.

### Important Inline Callbacks

#### Inline Callback At Line 128

- Source marker: `form.addEventListener("submit", async event => {`
- What this is: This is the inline submit listener attached to `form`.
- Why this is used: It stays beside the event registration so the trigger and reaction are easy to read together.
- How this works: When the browser fires that event, the callback reads closure state, performs the local UI action, and may call named helpers for heavier work.
- What this helps with: It helps the interface respond directly to user input without creating another global helper.

## frontend/js/dashboard/shared/init/dashboard-init.js

- Area: Dashboard Shared
- File role: This file owns dashboard init behavior in the dashboard shared layer.
- Line count: 143
- Named functions in this file: 3
- Important inline callbacks noted: 3
- Top-level behavior: mixes named helpers with direct runtime wiring for this feature.

### Named Functions

#### `renderPaginatedSection(key)`

- Defined at: line 1
- What this is: This is the render function for the paginated section UI in the dashboard shared layer.
- Why this is used: It exists so UI output is rebuilt from current state instead of patched everywhere.
- How this works: It leans on helpers like `renderBookingsPage`, `renderRoomFinderPage`, `renderEmployeePage`, `renderRoomPage`, `renderReportLocationPage`, `renderReportUpcomingPage`.
- What this helps with: It helps keep the visible UI aligned with the latest state.
- Key inputs: `key` is an input value the function uses.
- Key dependencies: This function calls helpers such as `renderBookingsPage`, `renderRoomFinderPage`, `renderEmployeePage`, `renderRoomPage`, `renderReportLocationPage`, `renderReportUpcomingPage`.
- Return or side effects: It mostly works through local computation and whatever the caller does with the result.

#### `initializePageActions()`

- Defined at: line 27
- What this is: This is the main setup function for the page actions flow in the dashboard shared layer.
- Why this is used: It exists so one-time setup stays in one place.
- How this works: It reads current DOM or form values, leans on helpers like `refreshBookingViews`, `openBookingEditModal`, `cancelBookingById`, `vacateBookingById`, `removeParticipantFromPicker`, `getParticipantEmployeeDirectory`, and wires listeners for later user actions.
- What this helps with: It helps the feature become usable as soon as the page loads.
- Key inputs: This function does not take direct parameters; it mainly uses surrounding state, cached DOM references, or globals.
- Key dependencies: This function calls helpers such as `refreshBookingViews`, `openBookingEditModal`, `cancelBookingById`, `vacateBookingById`, `removeParticipantFromPicker`, `getParticipantEmployeeDirectory`.
- Return or side effects: It works mainly through side effects, especially listener registration.

#### `async initializeDashboard()`

- Defined at: line 104
- What this is: This is the main setup function for the dashboard flow in the dashboard shared layer.
- Why this is used: It exists so one-time setup stays in one place.
- How this works: It leans on helpers like `ensureAuthenticatedSession`, `initializeThemeToggle`, `setTodayLabel`, `setHeaderContent`, `setProfileSection`, `initializeSidebarDrawer` and uses shared state such as `currentRole`, `currentEmployee`.
- What this helps with: It helps the feature become usable as soon as the page loads.
- Key inputs: This function does not take direct parameters; it mainly uses surrounding state, cached DOM references, or globals.
- Key dependencies: This function calls helpers such as `ensureAuthenticatedSession`, `initializeThemeToggle`, `setTodayLabel`, `setHeaderContent`, `setProfileSection`, `initializeSidebarDrawer`, touches shared runtime values like `currentRole`, `currentEmployee`.
- Return or side effects: It mostly works through local computation and whatever the caller does with the result.

### Important Inline Callbacks

#### Inline Callback At Line 30

- Source marker: `refreshBookingsBtn.addEventListener("click", async () => {`
- What this is: This is the inline click listener attached to `refreshBookingsBtn`.
- Why this is used: It stays beside the event registration so the trigger and reaction are easy to read together.
- How this works: When the browser fires that event, the callback reads closure state, performs the local UI action, and may call named helpers for heavier work.
- What this helps with: It helps the interface respond directly to user input without creating another global helper.

#### Inline Callback At Line 42

- Source marker: `bookingsTable.addEventListener("click", async event => {`
- What this is: This is the inline click listener attached to `bookingsTable`.
- Why this is used: It stays beside the event registration so the trigger and reaction are easy to read together.
- How this works: When the browser fires that event, the callback reads closure state, performs the local UI action, and may call named helpers for heavier work.
- What this helps with: It helps the interface respond directly to user input without creating another global helper.

#### Inline Callback At Line 68

- Source marker: `document.addEventListener("click", event => {`
- What this is: This is the inline click listener attached to `document`.
- Why this is used: It stays beside the event registration so the trigger and reaction are easy to read together.
- How this works: When the browser fires that event, the callback reads closure state, performs the local UI action, and may call named helpers for heavier work.
- What this helps with: It helps the interface respond directly to user input without creating another global helper.

## frontend/js/dashboard/shared/layout/nav.js

- Area: Dashboard Shared
- File role: This file owns nav behavior in the dashboard shared layer.
- Line count: 58
- Named functions in this file: 3
- Important inline callbacks noted: 3
- Top-level behavior: mixes named helpers with direct runtime wiring for this feature.

### Named Functions

#### `showSection(sectionId)`

- Defined at: line 1
- What this is: This is a support helper for the show section work in the dashboard shared layer.
- Why this is used: It exists to keep repeated logic small and reusable.
- How this works: It reads current DOM or form values and toggles CSS classes to reflect current state.
- What this helps with: It helps reduce duplication and makes the calling code easier to read.
- Key inputs: `sectionId` is an input value the function uses.
- Key dependencies: This function is mostly self-contained and depends only on local values plus standard browser APIs.
- Return or side effects: Mostly returns a derived value or prepared structure back to the caller.

#### `initializeNav()`

- Defined at: line 17
- What this is: This is the main setup function for the nav flow in the dashboard shared layer.
- Why this is used: It exists so one-time setup stays in one place.
- How this works: It reads current DOM or form values, leans on helpers like `showSection`, `closeSidebarDrawer`, and wires listeners for later user actions.
- What this helps with: It helps the feature become usable as soon as the page loads.
- Key inputs: This function does not take direct parameters; it mainly uses surrounding state, cached DOM references, or globals.
- Key dependencies: This function calls helpers such as `showSection`, `closeSidebarDrawer`.
- Return or side effects: It works mainly through side effects, especially listener registration.

#### `goToSection()`

- Defined at: line 32
- What this is: This is a support helper for the go to section work in the dashboard shared layer.
- Why this is used: It exists to keep repeated logic small and reusable.
- How this works: It reads current DOM or form values and leans on helpers like `showSection`, `closeSidebarDrawer`, `clearAuthAndLogout`.
- What this helps with: It helps reduce duplication and makes the calling code easier to read.
- Key inputs: This function does not take direct parameters; it mainly uses surrounding state, cached DOM references, or globals.
- Key dependencies: This function calls helpers such as `showSection`, `closeSidebarDrawer`, `clearAuthAndLogout`.
- Return or side effects: It works mainly through side effects, especially listener registration.

### Important Inline Callbacks

#### Inline Callback At Line 20

- Source marker: `link.addEventListener("click", event => {`
- What this is: This is the inline click listener attached to `link`.
- Why this is used: It stays beside the event registration so the trigger and reaction are easy to read together.
- How this works: When the browser fires that event, the callback reads closure state, performs the local UI action, and may call named helpers for heavier work.
- What this helps with: It helps the interface respond directly to user input without creating another global helper.

#### Inline Callback At Line 41

- Source marker: `element.addEventListener("keydown", event => {`
- What this is: This is the inline keydown listener attached to `element`.
- Why this is used: It stays beside the event registration so the trigger and reaction are easy to read together.
- How this works: When the browser fires that event, the callback reads closure state, performs the local UI action, and may call named helpers for heavier work.
- What this helps with: It helps the interface respond directly to user input without creating another global helper.

#### Inline Callback At Line 51

- Source marker: `logoutLink.addEventListener("click", event => {`
- What this is: This is the inline click listener attached to `logoutLink`.
- Why this is used: It stays beside the event registration so the trigger and reaction are easy to read together.
- How this works: When the browser fires that event, the callback reads closure state, performs the local UI action, and may call named helpers for heavier work.
- What this helps with: It helps the interface respond directly to user input without creating another global helper.

## frontend/js/dashboard/shared/layout/sidebar.js

- Area: Dashboard Shared
- File role: This file owns sidebar behavior in the dashboard shared layer.
- Line count: 49
- Named functions in this file: 4
- Important inline callbacks noted: 2
- Top-level behavior: mixes named helpers with direct runtime wiring for this feature.

### Named Functions

#### `isMobileDrawerViewport()`

- Defined at: line 5
- What this is: This answers a yes-or-no rule about the mobile drawer viewport flow.
- Why this is used: It exists so calling code can branch on one clear business rule.
- How this works: It performs small synchronous logic and returns the result.
- What this helps with: It helps business rules stay readable and testable.
- Key inputs: This function does not take direct parameters; it mainly uses surrounding state, cached DOM references, or globals.
- Key dependencies: This function depends on browser media-query support.
- Return or side effects: Mostly returns a derived value or prepared structure back to the caller.

#### `setSidebarDrawerState(isOpen)`

- Defined at: line 9
- What this is: This sets or writes the sidebar drawer state state in the dashboard shared layer.
- Why this is used: It exists so status or state changes follow one rule set.
- How this works: It reads current DOM or form values, uses shared state such as `setSidebarDrawerState`, and toggles CSS classes to reflect current state.
- What this helps with: It helps the UI communicate state or feedback in a standardized way.
- Key inputs: `isOpen` is an input value the function uses.
- Key dependencies: This function touches shared runtime values like `setSidebarDrawerState`.
- Return or side effects: It works mainly through side effects, especially CSS class changes.

#### `closeSidebarDrawer()`

- Defined at: line 26
- What this is: This closes or tears down the sidebar drawer UI state.
- Why this is used: It exists so closing logic can clean up and restore context consistently.
- How this works: It leans on helpers like `setSidebarDrawerState` and uses shared state such as `setSidebarDrawerState`.
- What this helps with: It helps the user leave the interaction cleanly without stale state leaking into the next open.
- Key inputs: This function does not take direct parameters; it mainly uses surrounding state, cached DOM references, or globals.
- Key dependencies: This function calls helpers such as `setSidebarDrawerState`, touches shared runtime values like `setSidebarDrawerState`.
- Return or side effects: It mostly works through local computation and whatever the caller does with the result.

#### `initializeSidebarDrawer()`

- Defined at: line 30
- What this is: This is the main setup function for the sidebar drawer flow in the dashboard shared layer.
- Why this is used: It exists so one-time setup stays in one place.
- How this works: It leans on helpers like `setSidebarDrawerState`, `isMobileDrawerViewport`, `closeSidebarDrawer`, uses shared state such as `setSidebarDrawerState`, toggles CSS classes to reflect current state, and wires listeners for later user actions.
- What this helps with: It helps the feature become usable as soon as the page loads.
- Key inputs: This function does not take direct parameters; it mainly uses surrounding state, cached DOM references, or globals.
- Key dependencies: This function calls helpers such as `setSidebarDrawerState`, `isMobileDrawerViewport`, `closeSidebarDrawer`, touches shared runtime values like `setSidebarDrawerState`.
- Return or side effects: It works mainly through side effects, especially CSS class changes, listener registration.

### Important Inline Callbacks

#### Inline Callback At Line 36

- Source marker: `sidebarToggleBtn.addEventListener("click", () => {`
- What this is: This is the inline click listener attached to `sidebarToggleBtn`.
- Why this is used: It stays beside the event registration so the trigger and reaction are easy to read together.
- How this works: When the browser fires that event, the callback reads closure state, performs the local UI action, and may call named helpers for heavier work.
- What this helps with: It helps the interface respond directly to user input without creating another global helper.

#### Inline Callback At Line 43

- Source marker: `window.addEventListener("resize", () => {`
- What this is: This is the inline resize listener attached to `window`.
- Why this is used: It stays beside the event registration so the trigger and reaction are easy to read together.
- How this works: When the browser fires that event, the callback reads closure state, performs the local UI action, and may call named helpers for heavier work.
- What this helps with: It helps the interface respond directly to user input without creating another global helper.

## frontend/js/dashboard/shared/modals/dashboard-modal-shortcuts.js

- Area: Dashboard Shared
- File role: This file owns dashboard modal shortcuts behavior inside the modal layer of dashboard shared.
- Line count: 44
- Named functions in this file: 1
- Important inline callbacks noted: 1
- Top-level behavior: mixes named helpers with direct runtime wiring for this feature.

### Named Functions

#### `initializeDashboardModalShortcuts()`

- Defined at: line 3
- What this is: This is the main setup function for the dashboard modal shortcuts flow in the dashboard shared layer. It also matters for modal focus, temporary state, and predictable open/close behavior.
- Why this is used: It exists so one-time setup stays in one place.
- How this works: It reads current DOM or form values, leans on helpers like `trapActiveModalFocus`, `closeSidebarDrawer`, `setRoomScheduleOpen`, `closeBookingEditModal`, `closeEmployeeAdminModal`, `closeRoomAdminModal`, toggles CSS classes to reflect current state, and wires listeners for later user actions.
- What this helps with: It helps the feature become usable as soon as the page loads.
- Key inputs: This function does not take direct parameters; it mainly uses surrounding state, cached DOM references, or globals.
- Key dependencies: This function calls helpers such as `trapActiveModalFocus`, `closeSidebarDrawer`, `setRoomScheduleOpen`, `closeBookingEditModal`, `closeEmployeeAdminModal`, `closeRoomAdminModal`.
- Return or side effects: It works mainly through side effects, especially CSS class changes, listener registration.

### Important Inline Callbacks

#### Inline Callback At Line 9

- Source marker: `document.addEventListener("keydown", event => {`
- What this is: This is the inline keydown listener attached to `document`.
- Why this is used: It stays beside the event registration so the trigger and reaction are easy to read together.
- How this works: When the browser fires that event, the callback reads closure state, performs the local UI action, and may call named helpers for heavier work.
- What this helps with: It helps the interface respond directly to user input without creating another global helper.

## frontend/js/dashboard/shared/modals/modal-manager.js

- Area: Dashboard Shared
- File role: This file owns modal manager behavior inside the modal layer of dashboard shared.
- Line count: 81
- Named functions in this file: 5
- Important inline callbacks noted: 0
- Top-level behavior: mixes named helpers with direct runtime wiring for this feature.

### Named Functions

#### `isVisibleElement(element)`

- Defined at: line 12
- What this is: This answers a yes-or-no rule about the visible element flow. It also matters for modal focus, temporary state, and predictable open/close behavior.
- Why this is used: It exists so calling code can branch on one clear business rule.
- How this works: It performs small synchronous logic and returns the result.
- What this helps with: It helps business rules stay readable and testable.
- Key inputs: `element` is a DOM reference.
- Key dependencies: This function is mostly self-contained and depends only on local values plus standard browser APIs.
- Return or side effects: Mostly returns a derived value or prepared structure back to the caller.

#### `getModalFocusableElements(modalElement)`

- Defined at: line 18
- What this is: This returns a derived modal focusable elements value for the dashboard shared layer. It also matters for modal focus, temporary state, and predictable open/close behavior.
- Why this is used: It exists to centralize a repeated lookup or calculation.
- How this works: It reads current DOM or form values and leans on helpers like `isVisibleElement`.
- What this helps with: It helps other code ask for the current modal focusable elements in one place.
- Key inputs: `modalElement` is a DOM reference.
- Key dependencies: This function calls helpers such as `isVisibleElement`.
- Return or side effects: Mostly returns a derived value or prepared structure back to the caller.

#### `trapActiveModalFocus(event)`

- Defined at: line 24
- What this is: This is a support helper for the trap active modal focus work in the dashboard shared layer. It also matters for modal focus, temporary state, and predictable open/close behavior.
- Why this is used: It exists to keep repeated logic small and reusable.
- How this works: It reads current DOM or form values and leans on helpers like `getModalFocusableElements`.
- What this helps with: It helps reduce duplication and makes the calling code easier to read.
- Key inputs: `event` is the browser event object.
- Key dependencies: This function calls helpers such as `getModalFocusableElements`.
- Return or side effects: Mostly returns a derived value or prepared structure back to the caller.

#### `openManagedModal(modalElement, triggerElement = null)`

- Defined at: line 48
- What this is: This opens the managed modal UI or modal in the dashboard shared layer. It also matters for modal focus, temporary state, and predictable open/close behavior.
- Why this is used: It exists so opening logic can prepare state, content, and focus consistently. In modal code, that consistency prevents broken overlay and focus behavior.
- How this works: It reads current DOM or form values, leans on helpers like `getModalFocusableElements`, and uses the shared modal manager.
- What this helps with: It helps the user start a focused interaction with the right context visible.
- Key inputs: `modalElement` is a DOM reference. `triggerElement` is a DOM reference.
- Key dependencies: This function calls helpers such as `getModalFocusableElements`, depends on the shared modal manager.
- Return or side effects: It mostly works through local computation and whatever the caller does with the result.

#### `closeManagedModal(modalElement)`

- Defined at: line 68
- What this is: This closes or tears down the managed modal UI state. It also matters for modal focus, temporary state, and predictable open/close behavior.
- Why this is used: It exists so closing logic can clean up and restore context consistently. In modal code, that consistency prevents broken overlay and focus behavior.
- How this works: It uses the shared modal manager.
- What this helps with: It helps the user leave the interaction cleanly without stale state leaking into the next open.
- Key inputs: `modalElement` is a DOM reference.
- Key dependencies: This function depends on the shared modal manager.
- Return or side effects: It mostly works through local computation and whatever the caller does with the result.

## frontend/js/dashboard/shared/participants/participant-picker.js

- Area: Dashboard Shared
- File role: This file owns participant picker behavior in the dashboard shared layer.
- Line count: 832
- Named functions in this file: 41
- Important inline callbacks noted: 5
- Top-level behavior: mixes named helpers with direct runtime wiring for this feature.

### Named Functions

#### `getCreateBookingOrganizerEmployeeId()`

- Defined at: line 1
- What this is: This returns a derived create booking organizer employee id value for the dashboard shared layer.
- Why this is used: It exists to centralize a repeated lookup or calculation.
- How this works: It uses shared state such as `currentEmployeeId`.
- What this helps with: It helps other code ask for the current create booking organizer employee id in one place.
- Key inputs: This function does not take direct parameters; it mainly uses surrounding state, cached DOM references, or globals.
- Key dependencies: This function touches shared runtime values like `currentEmployeeId`.
- Return or side effects: Mostly returns a derived value or prepared structure back to the caller.

#### `getCreateBookingOrganizerOption()`

- Defined at: line 6
- What this is: This returns a derived create booking organizer option value for the dashboard shared layer.
- Why this is used: It exists to centralize a repeated lookup or calculation.
- How this works: It leans on helpers like `getCreateBookingOrganizerEmployeeId`, `getParticipantEmployeeDirectory`.
- What this helps with: It helps other code ask for the current create booking organizer option in one place.
- Key inputs: This function does not take direct parameters; it mainly uses surrounding state, cached DOM references, or globals.
- Key dependencies: This function calls helpers such as `getCreateBookingOrganizerEmployeeId`, `getParticipantEmployeeDirectory`.
- Return or side effects: Mostly returns a derived value or prepared structure back to the caller.

#### `getCreateBookingOrganizerDisplayName()`

- Defined at: line 14
- What this is: This returns a derived create booking organizer display name value for the dashboard shared layer.
- Why this is used: It exists to centralize a repeated lookup or calculation.
- How this works: It leans on helpers like `getCreateBookingOrganizerEmployeeId`, `getCreateBookingOrganizerOption` and uses shared state such as `currentEmployeeId`, `currentEmployee`.
- What this helps with: It helps other code ask for the current create booking organizer display name in one place.
- Key inputs: This function does not take direct parameters; it mainly uses surrounding state, cached DOM references, or globals.
- Key dependencies: This function calls helpers such as `getCreateBookingOrganizerEmployeeId`, `getCreateBookingOrganizerOption`, touches shared runtime values like `currentEmployeeId`, `currentEmployee`.
- Return or side effects: Mostly returns a derived value or prepared structure back to the caller.

#### `getParticipantPickerConfig(mode)`

- Defined at: line 27
- What this is: This returns a derived participant picker config value for the dashboard shared layer.
- Why this is used: It exists to centralize a repeated lookup or calculation.
- How this works: It uses shared state such as `selectedBooking`, `selectedRoom`.
- What this helps with: It helps other code ask for the current participant picker config in one place.
- Key inputs: `mode` controls a visual tone or behavior mode.
- Key dependencies: This function touches shared runtime values like `selectedBooking`, `selectedRoom`.
- Return or side effects: Mostly returns a derived value or prepared structure back to the caller.

#### `normalizeEmployeeOption(employee)`

- Defined at: line 72
- What this is: This normalizes the employee option so later code sees one consistent shape.
- Why this is used: It exists so downstream code does not guess between multiple input shapes.
- How this works: It performs small synchronous logic and returns the result.
- What this helps with: It helps downstream code stay simple because inputs become consistent.
- Key inputs: `employee` carries people-related data.
- Key dependencies: This function is mostly self-contained and depends only on local values plus standard browser APIs.
- Return or side effects: Mostly returns a derived value or prepared structure back to the caller.

#### `getParticipantPicker(mode)`

- Defined at: line 98
- What this is: This returns a derived participant picker value for the dashboard shared layer.
- Why this is used: It exists to centralize a repeated lookup or calculation.
- How this works: It uses shared state such as `participantPickerState`.
- What this helps with: It helps other code ask for the current participant picker in one place.
- Key inputs: `mode` controls a visual tone or behavior mode.
- Key dependencies: This function touches shared runtime values like `participantPickerState`.
- Return or side effects: Mostly returns a derived value or prepared structure back to the caller.

#### `getParticipantEmployeeDirectory(mode)`

- Defined at: line 102
- What this is: This returns a derived participant employee directory value for the dashboard shared layer.
- Why this is used: It exists to centralize a repeated lookup or calculation.
- How this works: It leans on helpers like `getParticipantPicker`.
- What this helps with: It helps other code ask for the current participant employee directory in one place.
- Key inputs: `mode` controls a visual tone or behavior mode.
- Key dependencies: This function calls helpers such as `getParticipantPicker`.
- Return or side effects: Mostly returns a derived value or prepared structure back to the caller.

#### `getParticipantPickerAvailabilityWindow(mode)`

- Defined at: line 106
- What this is: This returns a derived participant picker availability window value for the dashboard shared layer.
- Why this is used: It exists to centralize a repeated lookup or calculation.
- How this works: It leans on helpers like `getBookingEditWindow`, `buildFinderWindow` and uses shared state such as `selectedBooking`, `selectedBookingWindow`, `availabilityWindow`.
- What this helps with: It helps other code ask for the current participant picker availability window in one place.
- Key inputs: `mode` controls a visual tone or behavior mode.
- Key dependencies: This function calls helpers such as `getBookingEditWindow`, `buildFinderWindow`, touches shared runtime values like `selectedBooking`, `selectedBookingWindow`, `availabilityWindow`.
- Return or side effects: Mostly returns a derived value or prepared structure back to the caller.

#### `buildParticipantDirectoryRequest(mode)`

- Defined at: line 140
- What this is: This builds the participant directory request structure another part of the feature needs.
- Why this is used: It exists to keep object, markup, or URL assembly consistent.
- How this works: It builds or interprets URL/query data, leans on helpers like `getParticipantPickerAvailabilityWindow`, and uses shared state such as `availabilityWindow`.
- What this helps with: It helps other functions trust the assembled participant directory request shape.
- Key inputs: `mode` controls a visual tone or behavior mode.
- Key dependencies: This function calls helpers such as `getParticipantPickerAvailabilityWindow`, touches shared runtime values like `availabilityWindow`.
- Return or side effects: Mostly returns a derived value or prepared structure back to the caller.

#### `buildParticipantConflictHint(employee)`

- Defined at: line 165
- What this is: This builds the participant conflict hint structure another part of the feature needs.
- Why this is used: It exists to keep object, markup, or URL assembly consistent.
- How this works: It performs small synchronous logic and returns the result.
- What this helps with: It helps other functions trust the assembled participant conflict hint shape.
- Key inputs: `employee` carries people-related data.
- Key dependencies: This function is mostly self-contained and depends only on local values plus standard browser APIs.
- Return or side effects: Mostly returns a derived value or prepared structure back to the caller.

#### `buildParticipantAvailabilityMessage(mode, issues)`

- Defined at: line 175
- What this is: This builds the participant availability message structure another part of the feature needs.
- Why this is used: It exists to keep object, markup, or URL assembly consistent.
- How this works: It leans on helpers like `buildParticipantConflictHint`, `getParticipantPickerOrganizerDisplayName`.
- What this helps with: It helps other functions trust the assembled participant availability message shape.
- Key inputs: `mode` controls a visual tone or behavior mode. `issues` is an input value the function uses.
- Key dependencies: This function calls helpers such as `buildParticipantConflictHint`, `getParticipantPickerOrganizerDisplayName`.
- Return or side effects: Mostly returns a derived value or prepared structure back to the caller.

#### `async loadEmployeeDirectory(mode, { force = false } = {})`

- Defined at: line 209
- What this is: This is the data-loading function for the employee directory flow in the dashboard shared layer.
- Why this is used: It exists so loading, success, and error paths stay consistent. It also keeps backend communication tied to the right UI step.
- How this works: It talks to the backend and leans on helpers like `getParticipantPicker`, `buildParticipantDirectoryRequest`, `apiFetch`, `populateParticipantFilters`, `renderRoomModalOrganizerSelection`, `validateParticipantAvailability`.
- What this helps with: It helps the user see fresh data and gives the feature a clear refresh path.
- Key inputs: `mode` controls a visual tone or behavior mode. `force` is an input value the function uses.
- Key dependencies: This function calls helpers such as `getParticipantPicker`, `buildParticipantDirectoryRequest`, `apiFetch`, `populateParticipantFilters`, `renderRoomModalOrganizerSelection`, `validateParticipantAvailability`, depends on a backend request path.
- Return or side effects: It works mainly through side effects, especially network requests.

#### `setParticipantPickerMessage(mode, message, type = "")`

- Defined at: line 227
- What this is: This sets or writes the participant picker message state in the dashboard shared layer.
- Why this is used: It exists so status or state changes follow one rule set.
- How this works: It leans on helpers like `getParticipantPickerConfig`, `setHelperMessage`.
- What this helps with: It helps the UI communicate state or feedback in a standardized way.
- Key inputs: `mode` controls a visual tone or behavior mode. `message` is user-facing feedback text. `type` controls a visual tone or behavior mode.
- Key dependencies: This function calls helpers such as `getParticipantPickerConfig`, `setHelperMessage`.
- Return or side effects: It mostly works through local computation and whatever the caller does with the result.

#### `getParticipantPickerSelectedIds(mode)`

- Defined at: line 232
- What this is: This returns a derived participant picker selected ids value for the dashboard shared layer.
- Why this is used: It exists to centralize a repeated lookup or calculation.
- How this works: It leans on helpers like `getParticipantPicker`.
- What this helps with: It helps other code ask for the current participant picker selected ids in one place.
- Key inputs: `mode` controls a visual tone or behavior mode.
- Key dependencies: This function calls helpers such as `getParticipantPicker`.
- Return or side effects: Mostly returns a derived value or prepared structure back to the caller.

#### `getParticipantPickerCapacity(mode)`

- Defined at: line 236
- What this is: This returns a derived participant picker capacity value for the dashboard shared layer.
- Why this is used: It exists to centralize a repeated lookup or calculation.
- How this works: It leans on helpers like `getParticipantPickerConfig`.
- What this helps with: It helps other code ask for the current participant picker capacity in one place.
- Key inputs: `mode` controls a visual tone or behavior mode.
- Key dependencies: This function calls helpers such as `getParticipantPickerConfig`.
- Return or side effects: Mostly returns a derived value or prepared structure back to the caller.

#### `getParticipantPickerOrganizerId(mode)`

- Defined at: line 243
- What this is: This returns a derived participant picker organizer id value for the dashboard shared layer.
- Why this is used: It exists to centralize a repeated lookup or calculation.
- How this works: It leans on helpers like `getParticipantPickerConfig` and uses shared state such as `currentEmployeeId`.
- What this helps with: It helps other code ask for the current participant picker organizer id in one place.
- Key inputs: `mode` controls a visual tone or behavior mode.
- Key dependencies: This function calls helpers such as `getParticipantPickerConfig`, touches shared runtime values like `currentEmployeeId`.
- Return or side effects: Mostly returns a derived value or prepared structure back to the caller.

#### `getParticipantPickerOrganizerDisplayName(mode)`

- Defined at: line 249
- What this is: This returns a derived participant picker organizer display name value for the dashboard shared layer.
- Why this is used: It exists to centralize a repeated lookup or calculation.
- How this works: It leans on helpers like `getParticipantPickerOrganizerId`, `getCreateBookingOrganizerOption` and uses shared state such as `currentEmployeeId`, `selectedBooking`.
- What this helps with: It helps other code ask for the current participant picker organizer display name in one place.
- Key inputs: `mode` controls a visual tone or behavior mode.
- Key dependencies: This function calls helpers such as `getParticipantPickerOrganizerId`, `getCreateBookingOrganizerOption`, touches shared runtime values like `currentEmployeeId`, `selectedBooking`.
- Return or side effects: Mostly returns a derived value or prepared structure back to the caller.

#### `getParticipantPickerFilterValues(mode)`

- Defined at: line 266
- What this is: This returns a derived participant picker filter values value for the dashboard shared layer.
- Why this is used: It exists to centralize a repeated lookup or calculation.
- How this works: It leans on helpers like `getParticipantPickerConfig`.
- What this helps with: It helps other code ask for the current participant picker filter values in one place.
- Key inputs: `mode` controls a visual tone or behavior mode.
- Key dependencies: This function calls helpers such as `getParticipantPickerConfig`.
- Return or side effects: Mostly returns a derived value or prepared structure back to the caller.

#### `hasActiveParticipantFilters(mode)`

- Defined at: line 276
- What this is: This answers a yes-or-no rule about the active participant filters flow.
- Why this is used: It exists so calling code can branch on one clear business rule.
- How this works: It leans on helpers like `getParticipantPickerFilterValues`.
- What this helps with: It helps business rules stay readable and testable.
- Key inputs: `mode` controls a visual tone or behavior mode.
- Key dependencies: This function calls helpers such as `getParticipantPickerFilterValues`.
- Return or side effects: Mostly returns a derived value or prepared structure back to the caller.

#### `populateParticipantFilters(mode)`

- Defined at: line 280
- What this is: This fills the participant filters UI with options or values.
- Why this is used: It exists so dropdowns and filters reflect the current dataset.
- How this works: It reads current DOM or form values, leans on helpers like `getParticipantPickerConfig`, `getParticipantEmployeeDirectory`, and writes text, markup, or created elements back into the UI.
- What this helps with: It helps selects and filters stay in sync with live data.
- Key inputs: `mode` controls a visual tone or behavior mode.
- Key dependencies: This function calls helpers such as `getParticipantPickerConfig`, `getParticipantEmployeeDirectory`.
- Return or side effects: It works mainly through side effects, especially DOM updates.

#### `resetParticipantFilters(mode)`

- Defined at: line 316
- What this is: This clears or resets the participant filters state.
- Why this is used: It exists so the feature can return to a known clean baseline.
- How this works: It leans on helpers like `getParticipantPickerConfig`.
- What this helps with: It helps avoid stale errors, selections, and temporary state.
- Key inputs: `mode` controls a visual tone or behavior mode.
- Key dependencies: This function calls helpers such as `getParticipantPickerConfig`.
- Return or side effects: It mostly works through local computation and whatever the caller does with the result.

#### `hideParticipantSuggestions(mode)`

- Defined at: line 324
- What this is: This is a support helper for the hide participant suggestions work in the dashboard shared layer.
- Why this is used: It exists to keep repeated logic small and reusable.
- How this works: It leans on helpers like `getParticipantPickerConfig`, `getParticipantPicker` and writes text, markup, or created elements back into the UI.
- What this helps with: It helps reduce duplication and makes the calling code easier to read.
- Key inputs: `mode` controls a visual tone or behavior mode.
- Key dependencies: This function calls helpers such as `getParticipantPickerConfig`, `getParticipantPicker`.
- Return or side effects: Mostly returns a derived value or prepared structure back to the caller.

#### `updateParticipantAttendeeSummary(mode)`

- Defined at: line 334
- What this is: This updates the participant attendee summary after state changes.
- Why this is used: It exists so dependent UI reacts when state changes.
- How this works: It leans on helpers like `getParticipantPickerConfig`, `getParticipantPickerCapacity`, `getParticipantPicker` and writes text, markup, or created elements back into the UI.
- What this helps with: It helps linked UI pieces stay synchronized after a change.
- Key inputs: `mode` controls a visual tone or behavior mode.
- Key dependencies: This function calls helpers such as `getParticipantPickerConfig`, `getParticipantPickerCapacity`, `getParticipantPicker`.
- Return or side effects: It works mainly through side effects, especially DOM updates.

#### `renderParticipantChips(mode)`

- Defined at: line 346
- What this is: This is the render function for the participant chips UI in the dashboard shared layer.
- Why this is used: It exists so UI output is rebuilt from current state instead of patched everywhere.
- How this works: It leans on helpers like `getParticipantPickerConfig`, `getParticipantPicker`, `escapeHtml` and writes text, markup, or created elements back into the UI.
- What this helps with: It helps keep the visible UI aligned with the latest state.
- Key inputs: `mode` controls a visual tone or behavior mode.
- Key dependencies: This function calls helpers such as `getParticipantPickerConfig`, `getParticipantPicker`, `escapeHtml`.
- Return or side effects: It works mainly through side effects, especially DOM updates.

#### `getFilteredParticipantSuggestions(mode, searchTerm)`

- Defined at: line 387
- What this is: This returns a derived filtered participant suggestions value for the dashboard shared layer.
- Why this is used: It exists to centralize a repeated lookup or calculation.
- How this works: It leans on helpers like `getParticipantPickerSelectedIds`, `getParticipantPickerOrganizerId`, `getParticipantPickerFilterValues`, `getParticipantEmployeeDirectory`.
- What this helps with: It helps other code ask for the current filtered participant suggestions in one place.
- Key inputs: `mode` controls a visual tone or behavior mode. `searchTerm` is an input value the function uses.
- Key dependencies: This function calls helpers such as `getParticipantPickerSelectedIds`, `getParticipantPickerOrganizerId`, `getParticipantPickerFilterValues`, `getParticipantEmployeeDirectory`.
- Return or side effects: Mostly returns a derived value or prepared structure back to the caller.

#### `renderParticipantSuggestions(mode)`

- Defined at: line 435
- What this is: This is the render function for the participant suggestions UI in the dashboard shared layer.
- Why this is used: It exists so UI output is rebuilt from current state instead of patched everywhere.
- How this works: It leans on helpers like `getParticipantPickerConfig`, `hideParticipantSuggestions`, `hasActiveParticipantFilters`, `getFilteredParticipantSuggestions`, `getParticipantPicker`, `escapeHtml` and writes text, markup, or created elements back into the UI.
- What this helps with: It helps keep the visible UI aligned with the latest state.
- Key inputs: `mode` controls a visual tone or behavior mode.
- Key dependencies: This function calls helpers such as `getParticipantPickerConfig`, `hideParticipantSuggestions`, `hasActiveParticipantFilters`, `getFilteredParticipantSuggestions`, `getParticipantPicker`, `escapeHtml`.
- Return or side effects: It works mainly through side effects, especially DOM updates.

#### `getParticipantAvailabilityIssues(mode, { includeOrganizer = true } = {})`

- Defined at: line 483
- What this is: This returns a derived participant availability issues value for the dashboard shared layer.
- Why this is used: It exists to centralize a repeated lookup or calculation.
- How this works: It leans on helpers like `getParticipantEmployeeDirectory`, `getParticipantPickerOrganizerId`, `getParticipantPicker`.
- What this helps with: It helps other code ask for the current participant availability issues in one place.
- Key inputs: `mode` controls a visual tone or behavior mode. `includeOrganizer` carries people-related data.
- Key dependencies: This function calls helpers such as `getParticipantEmployeeDirectory`, `getParticipantPickerOrganizerId`, `getParticipantPicker`.
- Return or side effects: Mostly returns a derived value or prepared structure back to the caller.

#### `validateParticipantAvailability(mode, { showMessage = true } = {})`

- Defined at: line 512
- What this is: This validates the participant availability before the flow is allowed to continue.
- Why this is used: It exists so invalid input or invalid state is stopped early.
- How this works: It leans on helpers like `getParticipantAvailabilityIssues`, `setParticipantPickerMessage`, `buildParticipantAvailabilityMessage`.
- What this helps with: It helps prevent invalid submissions, bad scheduling, or confusing UI.
- Key inputs: `mode` controls a visual tone or behavior mode. `showMessage` is user-facing feedback text.
- Key dependencies: This function calls helpers such as `getParticipantAvailabilityIssues`, `setParticipantPickerMessage`, `buildParticipantAvailabilityMessage`.
- Return or side effects: Mostly returns a derived value or prepared structure back to the caller.

#### `validateParticipantCapacity(mode)`

- Defined at: line 527
- What this is: This validates the participant capacity before the flow is allowed to continue.
- Why this is used: It exists so invalid input or invalid state is stopped early.
- How this works: It leans on helpers like `getParticipantPickerCapacity`, `updateParticipantAttendeeSummary`, `getParticipantPicker`, `setParticipantPickerMessage`.
- What this helps with: It helps prevent invalid submissions, bad scheduling, or confusing UI.
- Key inputs: `mode` controls a visual tone or behavior mode.
- Key dependencies: This function calls helpers such as `getParticipantPickerCapacity`, `updateParticipantAttendeeSummary`, `getParticipantPicker`, `setParticipantPickerMessage`.
- Return or side effects: Mostly returns a derived value or prepared structure back to the caller.

#### `setParticipantSelection(mode, employees)`

- Defined at: line 545
- What this is: This sets or writes the participant selection state in the dashboard shared layer.
- Why this is used: It exists so status or state changes follow one rule set.
- How this works: It leans on helpers like `getParticipantPicker`, `getParticipantPickerOrganizerId`, `renderParticipantChips`, `updateParticipantAttendeeSummary`, `renderParticipantSuggestions`, `validateParticipantCapacity`.
- What this helps with: It helps the UI communicate state or feedback in a standardized way.
- Key inputs: `mode` controls a visual tone or behavior mode. `employees` carries people-related data.
- Key dependencies: This function calls helpers such as `getParticipantPicker`, `getParticipantPickerOrganizerId`, `renderParticipantChips`, `updateParticipantAttendeeSummary`, `renderParticipantSuggestions`, `validateParticipantCapacity`.
- Return or side effects: It mostly works through local computation and whatever the caller does with the result.

#### `addParticipantToPicker(mode, employee)`

- Defined at: line 563
- What this is: This is a support helper for the add participant to picker work in the dashboard shared layer.
- Why this is used: It exists to keep repeated logic small and reusable.
- How this works: It leans on helpers like `getParticipantPickerConfig`, `normalizeEmployeeOption`, `setParticipantPickerMessage`, `getParticipantPicker`, `getParticipantPickerOrganizerId`, `buildParticipantConflictHint`.
- What this helps with: It helps reduce duplication and makes the calling code easier to read.
- Key inputs: `mode` controls a visual tone or behavior mode. `employee` carries people-related data.
- Key dependencies: This function calls helpers such as `getParticipantPickerConfig`, `normalizeEmployeeOption`, `setParticipantPickerMessage`, `getParticipantPicker`, `getParticipantPickerOrganizerId`, `buildParticipantConflictHint`.
- Return or side effects: Mostly returns a derived value or prepared structure back to the caller.

#### `removeParticipantFromPicker(mode, employeeId)`

- Defined at: line 616
- What this is: This is a support helper for the remove participant from picker work in the dashboard shared layer.
- Why this is used: It exists to keep repeated logic small and reusable.
- How this works: It leans on helpers like `getParticipantPicker`, `renderParticipantChips`, `renderParticipantSuggestions`, `validateParticipantCapacity`, `validateParticipantAvailability`.
- What this helps with: It helps reduce duplication and makes the calling code easier to read.
- Key inputs: `mode` controls a visual tone or behavior mode. `employeeId` carries people-related data.
- Key dependencies: This function calls helpers such as `getParticipantPicker`, `renderParticipantChips`, `renderParticipantSuggestions`, `validateParticipantCapacity`, `validateParticipantAvailability`.
- Return or side effects: It mostly works through local computation and whatever the caller does with the result.

#### `resolveParticipantCandidate(mode)`

- Defined at: line 626
- What this is: This resolves the participant candidate from available inputs or cached state.
- Why this is used: It exists so the feature can choose the best available value from multiple sources.
- How this works: It leans on helpers like `getParticipantPickerConfig`, `getParticipantPicker`.
- What this helps with: It helps the feature choose the correct value when multiple inputs compete.
- Key inputs: `mode` controls a visual tone or behavior mode.
- Key dependencies: This function calls helpers such as `getParticipantPickerConfig`, `getParticipantPicker`.
- Return or side effects: Mostly returns a derived value or prepared structure back to the caller.

#### `async ensureParticipantDirectory(mode)`

- Defined at: line 648
- What this is: This ensures the participant directory requirement is ready before the flow continues.
- Why this is used: It exists so later logic can assume a prerequisite is already satisfied.
- How this works: It leans on helpers like `loadEmployeeDirectory`, `setParticipantPickerMessage`.
- What this helps with: It helps later code run with fewer defensive checks.
- Key inputs: `mode` controls a visual tone or behavior mode.
- Key dependencies: This function calls helpers such as `loadEmployeeDirectory`, `setParticipantPickerMessage`.
- Return or side effects: Mostly returns a derived value or prepared structure back to the caller.

#### `async attemptAddParticipantFromInput(mode)`

- Defined at: line 659
- What this is: This attempts the add participant from input action and exits safely if prerequisites are missing.
- Why this is used: It exists so a user action can fail safely without leaving partial UI state.
- How this works: It leans on helpers like `ensureParticipantDirectory`, `resolveParticipantCandidate`, `getParticipantPicker`, `buildParticipantConflictHint`, `setParticipantPickerMessage`, `addParticipantToPicker`.
- What this helps with: It helps user actions fail safely.
- Key inputs: `mode` controls a visual tone or behavior mode.
- Key dependencies: This function calls helpers such as `ensureParticipantDirectory`, `resolveParticipantCandidate`, `getParticipantPicker`, `buildParticipantConflictHint`, `setParticipantPickerMessage`, `addParticipantToPicker`.
- Return or side effects: Mostly returns a derived value or prepared structure back to the caller.

#### `resetParticipantPicker(mode)`

- Defined at: line 684
- What this is: This clears or resets the participant picker state.
- Why this is used: It exists so the feature can return to a known clean baseline.
- How this works: It leans on helpers like `getParticipantPickerConfig`, `getParticipantPicker`, `resetParticipantFilters`, `populateParticipantFilters`, `renderParticipantChips`, `updateParticipantAttendeeSummary`.
- What this helps with: It helps avoid stale errors, selections, and temporary state.
- Key inputs: `mode` controls a visual tone or behavior mode.
- Key dependencies: This function calls helpers such as `getParticipantPickerConfig`, `getParticipantPicker`, `resetParticipantFilters`, `populateParticipantFilters`, `renderParticipantChips`, `updateParticipantAttendeeSummary`.
- Return or side effects: It mostly works through local computation and whatever the caller does with the result.

#### `initializeParticipantPicker(mode)`

- Defined at: line 707
- What this is: This is the main setup function for the participant picker flow in the dashboard shared layer.
- Why this is used: It exists so one-time setup stays in one place.
- How this works: It leans on helpers like `getParticipantPickerConfig`, `ensureParticipantDirectory`, `renderParticipantSuggestions`, `setParticipantPickerMessage`, `attemptAddParticipantFromInput`, `validateParticipantAvailability` and wires listeners for later user actions.
- What this helps with: It helps the feature become usable as soon as the page loads.
- Key inputs: `mode` controls a visual tone or behavior mode.
- Key dependencies: This function calls helpers such as `getParticipantPickerConfig`, `ensureParticipantDirectory`, `renderParticipantSuggestions`, `setParticipantPickerMessage`, `attemptAddParticipantFromInput`, `validateParticipantAvailability`.
- Return or side effects: It works mainly through side effects, especially listener registration.

#### `syncCreateParticipantsWithOrganizer()`

- Defined at: line 747
- What this is: This keeps the create participants with organizer synchronized across related state.
- Why this is used: It exists so related values do not drift apart.
- How this works: It leans on helpers like `setParticipantSelection`, `getParticipantPicker`.
- What this helps with: It helps the feature behave like one coherent workflow instead of separate disconnected pieces.
- Key inputs: This function does not take direct parameters; it mainly uses surrounding state, cached DOM references, or globals.
- Key dependencies: This function calls helpers such as `setParticipantSelection`, `getParticipantPicker`.
- Return or side effects: It mostly works through local computation and whatever the caller does with the result.

#### `updateRoomModalOrganizerSummary()`

- Defined at: line 751
- What this is: This updates the room modal organizer summary after state changes.
- Why this is used: It exists so dependent UI reacts when state changes.
- How this works: It leans on helpers like `getCreateBookingOrganizerDisplayName` and writes text, markup, or created elements back into the UI.
- What this helps with: It helps linked UI pieces stay synchronized after a change.
- Key inputs: This function does not take direct parameters; it mainly uses surrounding state, cached DOM references, or globals.
- Key dependencies: This function calls helpers such as `getCreateBookingOrganizerDisplayName`.
- Return or side effects: It works mainly through side effects, especially DOM updates.

#### `renderRoomModalOrganizerSelection()`

- Defined at: line 756
- What this is: This is the render function for the room modal organizer selection UI in the dashboard shared layer.
- Why this is used: It exists so UI output is rebuilt from current state instead of patched everywhere.
- How this works: It leans on helpers like `updateRoomModalOrganizerSummary`, `setRoomModalOrganizerHelp`, `getParticipantEmployeeDirectory`, `getCreateBookingOrganizerEmployeeId`, `escapeHtml`, `getCreateBookingOrganizerOption`, uses shared state such as `currentRole`, `isAdmin`, `currentEmployeeId`, and writes text, markup, or created elements back into the UI.
- What this helps with: It helps keep the visible UI aligned with the latest state.
- Key inputs: This function does not take direct parameters; it mainly uses surrounding state, cached DOM references, or globals.
- Key dependencies: This function calls helpers such as `updateRoomModalOrganizerSummary`, `setRoomModalOrganizerHelp`, `getParticipantEmployeeDirectory`, `getCreateBookingOrganizerEmployeeId`, `escapeHtml`, `getCreateBookingOrganizerOption`, touches shared runtime values like `currentRole`, `isAdmin`, `currentEmployeeId`.
- Return or side effects: It works mainly through side effects, especially DOM updates.

#### `setCreateBookingOrganizer(employeeId)`

- Defined at: line 823
- What this is: This sets or writes the create booking organizer state in the dashboard shared layer.
- Why this is used: It exists so status or state changes follow one rule set.
- How this works: It leans on helpers like `updateRoomModalOrganizerSummary`, `renderRoomModalOrganizerSelection`, `syncCreateParticipantsWithOrganizer`, `renderParticipantSuggestions`, `validateParticipantAvailability` and uses shared state such as `currentEmployeeId`.
- What this helps with: It helps the UI communicate state or feedback in a standardized way.
- Key inputs: `employeeId` carries people-related data.
- Key dependencies: This function calls helpers such as `updateRoomModalOrganizerSummary`, `renderRoomModalOrganizerSelection`, `syncCreateParticipantsWithOrganizer`, `renderParticipantSuggestions`, `validateParticipantAvailability`, touches shared runtime values like `currentEmployeeId`.
- Return or side effects: It mostly works through local computation and whatever the caller does with the result.

### Important Inline Callbacks

#### Inline Callback At Line 713

- Source marker: `pickerConfig.searchInput.addEventListener("focus", async () => {`
- What this is: This is the inline focus listener attached to `pickerConfig.searchInput`.
- Why this is used: It stays beside the event registration so the trigger and reaction are easy to read together.
- How this works: When the browser fires that event, the callback reads closure state, performs the local UI action, and may call named helpers for heavier work.
- What this helps with: It helps the interface respond directly to user input without creating another global helper.

#### Inline Callback At Line 719

- Source marker: `pickerConfig.searchInput.addEventListener("input", async () => {`
- What this is: This is the inline input listener attached to `pickerConfig.searchInput`.
- Why this is used: It stays beside the event registration so the trigger and reaction are easy to read together.
- How this works: When the browser fires that event, the callback reads closure state, performs the local UI action, and may call named helpers for heavier work.
- What this helps with: It helps the interface respond directly to user input without creating another global helper.

#### Inline Callback At Line 726

- Source marker: `pickerConfig.searchInput.addEventListener("keydown", async event => {`
- What this is: This is the inline keydown listener attached to `pickerConfig.searchInput`.
- Why this is used: It stays beside the event registration so the trigger and reaction are easy to read together.
- How this works: When the browser fires that event, the callback reads closure state, performs the local UI action, and may call named helpers for heavier work.
- What this helps with: It helps the interface respond directly to user input without creating another global helper.

#### Inline Callback At Line 732

- Source marker: `pickerConfig.addButton.addEventListener("click", async () => {`
- What this is: This is the inline click listener attached to `pickerConfig.addButton`.
- Why this is used: It stays beside the event registration so the trigger and reaction are easy to read together.
- How this works: When the browser fires that event, the callback reads closure state, performs the local UI action, and may call named helpers for heavier work.
- What this helps with: It helps the interface respond directly to user input without creating another global helper.

#### Inline Callback At Line 738

- Source marker: `selectElement.addEventListener("change", async () => {`
- What this is: This is the inline change listener attached to `selectElement`.
- Why this is used: It stays beside the event registration so the trigger and reaction are easy to read together.
- How this works: When the browser fires that event, the callback reads closure state, performs the local UI action, and may call named helpers for heavier work.
- What this helps with: It helps the interface respond directly to user input without creating another global helper.

## frontend/js/dashboard/shared/theme/dashboard-theme.js

- Area: Dashboard Shared
- File role: This file owns dashboard theme theme behavior in the dashboard shared layer.
- Line count: 70
- Named functions in this file: 7
- Important inline callbacks noted: 1
- Top-level behavior: mixes named helpers with direct runtime wiring for this feature.

### Named Functions

#### `getStoredDashboardTheme()`

- Defined at: line 6
- What this is: This returns a derived stored dashboard theme value for the dashboard shared layer. It also matters for visual consistency and saved theme preference behavior.
- Why this is used: It exists to centralize a repeated lookup or calculation.
- How this works: It reads or writes browser storage.
- What this helps with: It helps other code ask for the current stored dashboard theme in one place. In theme code, that also improves preference persistence.
- Key inputs: This function does not take direct parameters; it mainly uses surrounding state, cached DOM references, or globals.
- Key dependencies: This function is mostly self-contained and depends only on local values plus standard browser APIs.
- Return or side effects: Mostly returns a derived value or prepared structure back to the caller.

#### `getSystemDashboardTheme()`

- Defined at: line 14
- What this is: This returns a derived system dashboard theme value for the dashboard shared layer. It also matters for visual consistency and saved theme preference behavior.
- Why this is used: It exists to centralize a repeated lookup or calculation.
- How this works: It performs small synchronous logic and returns the result.
- What this helps with: It helps other code ask for the current system dashboard theme in one place. In theme code, that also improves preference persistence.
- Key inputs: This function does not take direct parameters; it mainly uses surrounding state, cached DOM references, or globals.
- Key dependencies: This function depends on browser media-query support.
- Return or side effects: Mostly returns a derived value or prepared structure back to the caller.

#### `getActiveDashboardTheme()`

- Defined at: line 18
- What this is: This returns a derived active dashboard theme value for the dashboard shared layer. It also matters for visual consistency and saved theme preference behavior.
- Why this is used: It exists to centralize a repeated lookup or calculation.
- How this works: It reads current DOM or form values and toggles CSS classes to reflect current state.
- What this helps with: It helps other code ask for the current active dashboard theme in one place. In theme code, that also improves preference persistence.
- Key inputs: This function does not take direct parameters; it mainly uses surrounding state, cached DOM references, or globals.
- Key dependencies: This function is mostly self-contained and depends only on local values plus standard browser APIs.
- Return or side effects: Mostly returns a derived value or prepared structure back to the caller.

#### `setThemeToggleButtonState(theme)`

- Defined at: line 22
- What this is: This sets or writes the theme toggle button state state in the dashboard shared layer. It also matters for visual consistency and saved theme preference behavior.
- Why this is used: It exists so status or state changes follow one rule set.
- How this works: It uses shared state such as `setThemeToggleButtonState` and writes text, markup, or created elements back into the UI.
- What this helps with: It helps the UI communicate state or feedback in a standardized way. In theme code, that also improves preference persistence.
- Key inputs: `theme` is an input value the function uses.
- Key dependencies: This function touches shared runtime values like `setThemeToggleButtonState`.
- Return or side effects: It works mainly through side effects, especially DOM updates.

#### `applyDashboardTheme(theme, { persist = true } = {})`

- Defined at: line 31
- What this is: This applies the dashboard theme rule to the live UI state. It also matters for visual consistency and saved theme preference behavior.
- Why this is used: It exists so a computed rule is actually pushed into the live UI at the right time.
- How this works: It reads current DOM or form values, leans on helpers like `setThemeToggleButtonState`, uses shared state such as `setThemeToggleButtonState`, toggles CSS classes to reflect current state, and reads or writes browser storage.
- What this helps with: It helps the interface enforce the right rule at the exact place the user feels it. In theme code, that also improves preference persistence.
- Key inputs: `theme` is an input value the function uses. `persist` is an input value the function uses.
- Key dependencies: This function calls helpers such as `setThemeToggleButtonState`, touches shared runtime values like `setThemeToggleButtonState`.
- Return or side effects: It works mainly through side effects, especially CSS class changes, browser storage writes.

#### `initializeThemeToggle()`

- Defined at: line 46
- What this is: This is the main setup function for the theme toggle flow in the dashboard shared layer. It also matters for visual consistency and saved theme preference behavior.
- Why this is used: It exists so one-time setup stays in one place.
- How this works: It leans on helpers like `getStoredDashboardTheme`, `getSystemDashboardTheme`, `applyDashboardTheme`, `getActiveDashboardTheme` and wires listeners for later user actions.
- What this helps with: It helps the feature become usable as soon as the page loads. In theme code, that also improves preference persistence.
- Key inputs: This function does not take direct parameters; it mainly uses surrounding state, cached DOM references, or globals.
- Key dependencies: This function calls helpers such as `getStoredDashboardTheme`, `getSystemDashboardTheme`, `applyDashboardTheme`, `getActiveDashboardTheme`, depends on browser media-query support.
- Return or side effects: It works mainly through side effects, especially listener registration.

#### `syncWithSystemTheme(event)`

- Defined at: line 59
- What this is: This keeps the with system theme synchronized across related state. It also matters for visual consistency and saved theme preference behavior.
- Why this is used: It exists so related values do not drift apart.
- How this works: It leans on helpers like `getStoredDashboardTheme`, `applyDashboardTheme`.
- What this helps with: It helps the feature behave like one coherent workflow instead of separate disconnected pieces. In theme code, that also improves preference persistence.
- Key inputs: `event` is the browser event object.
- Key dependencies: This function calls helpers such as `getStoredDashboardTheme`, `applyDashboardTheme`.
- Return or side effects: Mostly returns a derived value or prepared structure back to the caller.

### Important Inline Callbacks

#### Inline Callback At Line 51

- Source marker: `themeToggleBtn.addEventListener("click", () => {`
- What this is: This is the inline click listener attached to `themeToggleBtn`.
- Why this is used: It stays beside the event registration so the trigger and reaction are easy to read together.
- How this works: When the browser fires that event, the callback reads closure state, performs the local UI action, and may call named helpers for heavier work.
- What this helps with: It helps the interface respond directly to user input without creating another global helper.

## frontend/js/entry/dashboard-entry.js

- Area: Entry
- File role: This file is the entry trigger for the entry layer.
- Line count: 2
- Named functions in this file: 0
- Important inline callbacks noted: 0
- Top-level behavior: directly calls `initializeDashboard()` so the real startup logic stays in the dashboard init module.

### Named Functions

- This file does not expose standalone named functions.
- Its value comes from shared constants, cached DOM references, or top-level runtime wiring.

## frontend/js/entry/home-entry.js

- Area: Entry
- File role: This file is the entry trigger for the entry layer.
- Line count: 2
- Named functions in this file: 0
- Important inline callbacks noted: 0
- Top-level behavior: directly calls `initializeHome()` so the real startup logic stays in the home init module.

### Named Functions

- This file does not expose standalone named functions.
- Its value comes from shared constants, cached DOM references, or top-level runtime wiring.

## frontend/js/home/core/home-constants.js

- Area: Home
- File role: This file provides shared home constants utilities for the home layer.
- Line count: 92
- Named functions in this file: 0
- Important inline callbacks noted: 0
- Top-level behavior: defines reusable constants and icon/config maps used by home modules.

### Named Functions

- This file does not expose standalone named functions.
- Its value comes from shared constants, cached DOM references, or top-level runtime wiring.

## frontend/js/home/core/home-dom.js

- Area: Home
- File role: This file provides shared home dom utilities for the home layer.
- Line count: 28
- Named functions in this file: 0
- Important inline callbacks noted: 0
- Top-level behavior: caches home-page DOM references so other scripts reuse the same elements.

### Named Functions

- This file does not expose standalone named functions.
- Its value comes from shared constants, cached DOM references, or top-level runtime wiring.

## frontend/js/home/init/home-init.js

- Area: Home
- File role: This file owns home init behavior in the home layer.
- Line count: 26
- Named functions in this file: 2
- Important inline callbacks noted: 1
- Top-level behavior: mixes named helpers with direct runtime wiring for this feature.

### Named Functions

#### `loadHomeData()`

- Defined at: line 1
- What this is: This is the data-loading function for the home data flow in the home layer.
- Why this is used: It exists so loading, success, and error paths stay consistent.
- How this works: It leans on helpers like `renderDefaultLocationRoomState`, `ensureLeafletLoaded`, `setLocationMapStatus`, `loadLocations`, `loadAllRooms` and uses shared state such as `renderDefaultLocationRoomState`.
- What this helps with: It helps the user see fresh data and gives the feature a clear refresh path.
- Key inputs: This function does not take direct parameters; it mainly uses surrounding state, cached DOM references, or globals.
- Key dependencies: This function calls helpers such as `renderDefaultLocationRoomState`, `ensureLeafletLoaded`, `setLocationMapStatus`, `loadLocations`, `loadAllRooms`, touches shared runtime values like `renderDefaultLocationRoomState`.
- Return or side effects: It mostly works through local computation and whatever the caller does with the result.

#### `initializeHome()`

- Defined at: line 11
- What this is: This is the main setup function for the home flow in the home layer.
- Why this is used: It exists so one-time setup stays in one place.
- How this works: It reads current DOM or form values, leans on helpers like `initializeThemeToggle`, `initializeSignInIllustrationVideo`, `loadHomeData`, `initializeSlideshow`, `initializeStickyAuthCardState`, uses shared state such as `readyState`, `initializeStickyAuthCardState`, and wires listeners for later user actions.
- What this helps with: It helps the feature become usable as soon as the page loads.
- Key inputs: This function does not take direct parameters; it mainly uses surrounding state, cached DOM references, or globals.
- Key dependencies: This function calls helpers such as `initializeThemeToggle`, `initializeSignInIllustrationVideo`, `loadHomeData`, `initializeSlideshow`, `initializeStickyAuthCardState`, touches shared runtime values like `readyState`, `initializeStickyAuthCardState`.
- Return or side effects: It works mainly through side effects, especially listener registration.

### Important Inline Callbacks

#### Inline Callback At Line 17

- Source marker: `document.addEventListener("DOMContentLoaded", () => {`
- What this is: This is the inline DOMContentLoaded listener attached to `document`.
- Why this is used: It stays beside the event registration so the trigger and reaction are easy to read together.
- How this works: When the browser fires that event, the callback reads closure state, performs the local UI action, and may call named helpers for heavier work.
- What this helps with: It helps the interface respond directly to user input without creating another global helper.

## frontend/js/home/modals/home-modal-utils.js

- Area: Home
- File role: This file owns home modal utils behavior inside the modal layer of home.
- Line count: 41
- Named functions in this file: 4
- Important inline callbacks noted: 0
- Top-level behavior: mixes named helpers with direct runtime wiring for this feature.

### Named Functions

#### `isVisibleElement(element)`

- Defined at: line 1
- What this is: This answers a yes-or-no rule about the visible element flow. It also matters for modal focus, temporary state, and predictable open/close behavior.
- Why this is used: It exists so calling code can branch on one clear business rule.
- How this works: It performs small synchronous logic and returns the result.
- What this helps with: It helps business rules stay readable and testable.
- Key inputs: `element` is a DOM reference.
- Key dependencies: This function is mostly self-contained and depends only on local values plus standard browser APIs.
- Return or side effects: Mostly returns a derived value or prepared structure back to the caller.

#### `getModalFocusableElements(modalElement)`

- Defined at: line 5
- What this is: This returns a derived modal focusable elements value for the home layer. It also matters for modal focus, temporary state, and predictable open/close behavior.
- Why this is used: It exists to centralize a repeated lookup or calculation.
- How this works: It reads current DOM or form values and leans on helpers like `isVisibleElement`.
- What this helps with: It helps other code ask for the current modal focusable elements in one place.
- Key inputs: `modalElement` is a DOM reference.
- Key dependencies: This function calls helpers such as `isVisibleElement`.
- Return or side effects: Mostly returns a derived value or prepared structure back to the caller.

#### `focusFirstElementInModal(modalElement)`

- Defined at: line 11
- What this is: This is a support helper for the focus first element in modal work in the home layer. It also matters for modal focus, temporary state, and predictable open/close behavior.
- Why this is used: It exists to keep repeated logic small and reusable.
- How this works: It leans on helpers like `getModalFocusableElements`.
- What this helps with: It helps reduce duplication and makes the calling code easier to read.
- Key inputs: `modalElement` is a DOM reference.
- Key dependencies: This function calls helpers such as `getModalFocusableElements`.
- Return or side effects: It mostly works through local computation and whatever the caller does with the result.

#### `trapModalFocus(modalElement, event)`

- Defined at: line 18
- What this is: This is a support helper for the trap modal focus work in the home layer. It also matters for modal focus, temporary state, and predictable open/close behavior.
- Why this is used: It exists to keep repeated logic small and reusable.
- How this works: It reads current DOM or form values and leans on helpers like `getModalFocusableElements`.
- What this helps with: It helps reduce duplication and makes the calling code easier to read.
- Key inputs: `modalElement` is a DOM reference. `event` is the browser event object.
- Key dependencies: This function calls helpers such as `getModalFocusableElements`.
- Return or side effects: Mostly returns a derived value or prepared structure back to the caller.

## frontend/js/home/modals/home-room-modal.js

- Area: Home
- File role: This file owns home room modal behavior inside the modal layer of home.
- Line count: 63
- Named functions in this file: 3
- Important inline callbacks noted: 2
- Top-level behavior: mixes named helpers with direct runtime wiring for this feature.

### Named Functions

#### `openRoomModal(room, triggerElement = null)`

- Defined at: line 3
- What this is: This opens the room modal UI or modal in the home layer. It also matters for modal focus, temporary state, and predictable open/close behavior.
- Why this is used: It exists so opening logic can prepare state, content, and focus consistently.
- How this works: It reads current DOM or form values, leans on helpers like `getRoomImage`, `renderRoomDetailMeta`, `renderRoomMediaSummary`, `renderRoomAmenities`, `focusFirstElementInModal`, and writes text, markup, or created elements back into the UI.
- What this helps with: It helps the user start a focused interaction with the right context visible.
- Key inputs: `room` carries room data or a room id. `triggerElement` is a DOM reference.
- Key dependencies: This function calls helpers such as `getRoomImage`, `renderRoomDetailMeta`, `renderRoomMediaSummary`, `renderRoomAmenities`, `focusFirstElementInModal`.
- Return or side effects: It works mainly through side effects, especially DOM updates.

#### `closeRoomModal()`

- Defined at: line 23
- What this is: This closes or tears down the room modal UI state. It also matters for modal focus, temporary state, and predictable open/close behavior.
- Why this is used: It exists so closing logic can clean up and restore context consistently.
- How this works: It performs small synchronous logic and returns the result.
- What this helps with: It helps the user leave the interaction cleanly without stale state leaking into the next open.
- Key inputs: This function does not take direct parameters; it mainly uses surrounding state, cached DOM references, or globals.
- Key dependencies: This function is mostly self-contained and depends only on local values plus standard browser APIs.
- Return or side effects: It mostly works through local computation and whatever the caller does with the result.

#### `getTopOpenModal()`

- Defined at: line 35
- What this is: This returns a derived top open modal value for the home layer. It also matters for modal focus, temporary state, and predictable open/close behavior.
- Why this is used: It exists to centralize a repeated lookup or calculation.
- How this works: It reads current DOM or form values and leans on helpers like `closeRoomModal`, `closeLocationMapModal`, `trapModalFocus`.
- What this helps with: It helps other code ask for the current top open modal in one place.
- Key inputs: This function does not take direct parameters; it mainly uses surrounding state, cached DOM references, or globals.
- Key dependencies: This function calls helpers such as `closeRoomModal`, `closeLocationMapModal`, `trapModalFocus`.
- Return or side effects: Mostly returns a derived value or prepared structure back to the caller.

### Important Inline Callbacks

#### Inline Callback At Line 41

- Source marker: `roomDetailModal.addEventListener("click", event => {`
- What this is: This is the inline click listener attached to `roomDetailModal`.
- Why this is used: It stays beside the event registration so the trigger and reaction are easy to read together.
- How this works: When the browser fires that event, the callback reads closure state, performs the local UI action, and may call named helpers for heavier work.
- What this helps with: It helps the interface respond directly to user input without creating another global helper.

#### Inline Callback At Line 48

- Source marker: `document.addEventListener("keydown", event => {`
- What this is: This is the inline keydown listener attached to `document`.
- Why this is used: It stays beside the event registration so the trigger and reaction are easy to read together.
- How this works: When the browser fires that event, the callback reads closure state, performs the local UI action, and may call named helpers for heavier work.
- What this helps with: It helps the interface respond directly to user input without creating another global helper.

## frontend/js/home/modals/location-map-modal.js

- Area: Home
- File role: This file owns location map modal behavior inside the modal layer of home.
- Line count: 468
- Named functions in this file: 21
- Important inline callbacks noted: 9
- Top-level behavior: mixes named helpers with direct runtime wiring for this feature.

### Named Functions

#### `buildLocationMapPoints(locations)`

- Defined at: line 9
- What this is: This builds the location map points structure another part of the feature needs. It also matters for modal focus, temporary state, and predictable open/close behavior.
- Why this is used: It exists to keep object, markup, or URL assembly consistent.
- How this works: It leans on helpers like `normalizeLocationName`, `getLocationShortLabel`.
- What this helps with: It helps other functions trust the assembled location map points shape.
- Key inputs: `locations` is an input value the function uses.
- Key dependencies: This function calls helpers such as `normalizeLocationName`, `getLocationShortLabel`.
- Return or side effects: Mostly returns a derived value or prepared structure back to the caller.

#### `getLocationMapPoint(locationId)`

- Defined at: line 24
- What this is: This returns a derived location map point value for the home layer. It also matters for modal focus, temporary state, and predictable open/close behavior.
- Why this is used: It exists to centralize a repeated lookup or calculation.
- How this works: It performs small synchronous logic and returns the result.
- What this helps with: It helps other code ask for the current location map point in one place.
- Key inputs: `locationId` is an input value the function uses.
- Key dependencies: This function is mostly self-contained and depends only on local values plus standard browser APIs.
- Return or side effects: Mostly returns a derived value or prepared structure back to the caller.

#### `hasMapCoordinates(locationPoint)`

- Defined at: line 28
- What this is: This answers a yes-or-no rule about the map coordinates flow. It also matters for modal focus, temporary state, and predictable open/close behavior.
- Why this is used: It exists so calling code can branch on one clear business rule.
- How this works: It performs small synchronous logic and returns the result.
- What this helps with: It helps business rules stay readable and testable.
- Key inputs: `locationPoint` is an input value the function uses.
- Key dependencies: This function is mostly self-contained and depends only on local values plus standard browser APIs.
- Return or side effects: Mostly returns a derived value or prepared structure back to the caller.

#### `getLocationLatLng(locationPoint)`

- Defined at: line 32
- What this is: This returns a derived location lat lng value for the home layer. It also matters for modal focus, temporary state, and predictable open/close behavior.
- Why this is used: It exists to centralize a repeated lookup or calculation.
- How this works: It performs small synchronous logic and returns the result.
- What this helps with: It helps other code ask for the current location lat lng in one place.
- Key inputs: `locationPoint` is an input value the function uses.
- Key dependencies: This function is mostly self-contained and depends only on local values plus standard browser APIs.
- Return or side effects: Mostly returns a derived value or prepared structure back to the caller.

#### `ensureLeafletLoaded()`

- Defined at: line 36
- What this is: This ensures the leaflet loaded requirement is ready before the flow continues. It also matters for modal focus, temporary state, and predictable open/close behavior.
- Why this is used: It exists so later logic can assume a prerequisite is already satisfied.
- How this works: It drives Leaflet map state or markers.
- What this helps with: It helps later code run with fewer defensive checks. In the map flow, that improves discovery and navigation.
- Key inputs: This function does not take direct parameters; it mainly uses surrounding state, cached DOM references, or globals.
- Key dependencies: This function depends on Leaflet being loaded.
- Return or side effects: Mostly returns a derived value or prepared structure back to the caller.

#### `createLocationMarkerIcon(locationPoint, isActive = false, { compact = false } = {})`

- Defined at: line 40
- What this is: This creates the location marker icon object or DOM fragment. It also matters for modal focus, temporary state, and predictable open/close behavior.
- Why this is used: It exists so reusable objects or DOM fragments are built the same way each time.
- How this works: It leans on helpers like `ensureLeafletLoaded` and drives Leaflet map state or markers.
- What this helps with: It helps generated UI fragments stay uniform and easier to maintain. In the map flow, that improves discovery and navigation.
- Key inputs: `locationPoint` is an input value the function uses. `isActive` is an input value the function uses. `compact` is an input value the function uses.
- Key dependencies: This function calls helpers such as `ensureLeafletLoaded`, depends on Leaflet being loaded.
- Return or side effects: Mostly returns a derived value or prepared structure back to the caller.

#### `createLocationPopupContent(locationPoint)`

- Defined at: line 62
- What this is: This creates the location popup content object or DOM fragment. It also matters for modal focus, temporary state, and predictable open/close behavior.
- Why this is used: It exists so reusable objects or DOM fragments are built the same way each time.
- How this works: It leans on helpers like `getLocationRooms`.
- What this helps with: It helps generated UI fragments stay uniform and easier to maintain.
- Key inputs: `locationPoint` is an input value the function uses.
- Key dependencies: This function calls helpers such as `getLocationRooms`.
- Return or side effects: Mostly returns a derived value or prepared structure back to the caller.

#### `clearPreviewMarkers()`

- Defined at: line 72
- What this is: This clears or resets the preview markers state. It also matters for modal focus, temporary state, and predictable open/close behavior.
- Why this is used: It exists so the feature can return to a known clean baseline.
- How this works: It performs small synchronous logic and returns the result.
- What this helps with: It helps avoid stale errors, selections, and temporary state.
- Key inputs: This function does not take direct parameters; it mainly uses surrounding state, cached DOM references, or globals.
- Key dependencies: This function is mostly self-contained and depends only on local values plus standard browser APIs.
- Return or side effects: It mostly works through local computation and whatever the caller does with the result.

#### `clearModalMarkers()`

- Defined at: line 77
- What this is: This clears or resets the modal markers state. It also matters for modal focus, temporary state, and predictable open/close behavior.
- Why this is used: It exists so the feature can return to a known clean baseline.
- How this works: It leans on helpers like `ensureLeafletLoaded` and drives Leaflet map state or markers.
- What this helps with: It helps avoid stale errors, selections, and temporary state. In the map flow, that improves discovery and navigation.
- Key inputs: This function does not take direct parameters; it mainly uses surrounding state, cached DOM references, or globals.
- Key dependencies: This function calls helpers such as `ensureLeafletLoaded`, depends on Leaflet being loaded.
- Return or side effects: It mostly works through local computation and whatever the caller does with the result.

#### `focusMapLocation(mapInstance, locationPoint, { animate = true } = {})`

- Defined at: line 105
- What this is: This is a support helper for the focus map location work in the home layer. It also matters for modal focus, temporary state, and predictable open/close behavior.
- Why this is used: It exists to keep repeated logic small and reusable.
- How this works: It leans on helpers like `hasMapCoordinates`, `getLocationLatLng`.
- What this helps with: It helps reduce duplication and makes the calling code easier to read.
- Key inputs: `mapInstance` is an input value the function uses. `locationPoint` is an input value the function uses. `animate` is an input value the function uses.
- Key dependencies: This function calls helpers such as `hasMapCoordinates`, `getLocationLatLng`.
- Return or side effects: Mostly returns a derived value or prepared structure back to the caller.

#### `refreshPreviewMarkers()`

- Defined at: line 118
- What this is: This is a support helper for the refresh preview markers work in the home layer. It also matters for modal focus, temporary state, and predictable open/close behavior.
- Why this is used: It exists to keep repeated logic small and reusable.
- How this works: It leans on helpers like `ensureLeafletLoaded`, `clearPreviewMarkers`, `getLocationLatLng`, `createLocationMarkerIcon`, `openLocationMapModal` and drives Leaflet map state or markers.
- What this helps with: It helps reduce duplication and makes the calling code easier to read. In the map flow, that improves discovery and navigation.
- Key inputs: This function does not take direct parameters; it mainly uses surrounding state, cached DOM references, or globals.
- Key dependencies: This function calls helpers such as `ensureLeafletLoaded`, `clearPreviewMarkers`, `getLocationLatLng`, `createLocationMarkerIcon`, `openLocationMapModal`, depends on Leaflet being loaded.
- Return or side effects: Mostly returns a derived value or prepared structure back to the caller.

#### `refreshModalMarkers()`

- Defined at: line 144
- What this is: This is a support helper for the refresh modal markers work in the home layer. It also matters for modal focus, temporary state, and predictable open/close behavior.
- Why this is used: It exists to keep repeated logic small and reusable.
- How this works: It leans on helpers like `ensureLeafletLoaded`, `clearModalMarkers`, `getLocationLatLng`, `createLocationMarkerIcon`, `createLocationPopupContent` and drives Leaflet map state or markers.
- What this helps with: It helps reduce duplication and makes the calling code easier to read. In the map flow, that improves discovery and navigation.
- Key inputs: This function does not take direct parameters; it mainly uses surrounding state, cached DOM references, or globals.
- Key dependencies: This function calls helpers such as `ensureLeafletLoaded`, `clearModalMarkers`, `getLocationLatLng`, `createLocationMarkerIcon`, `createLocationPopupContent`, depends on Leaflet being loaded.
- Return or side effects: Mostly returns a derived value or prepared structure back to the caller.

#### `initializePreviewMap()`

- Defined at: line 175
- What this is: This is the main setup function for the preview map flow in the home layer. It also matters for modal focus, temporary state, and predictable open/close behavior.
- Why this is used: It exists so one-time setup stays in one place.
- How this works: It leans on helpers like `ensureLeafletLoaded`, `openLocationMapModal`, `refreshPreviewMarkers` and drives Leaflet map state or markers.
- What this helps with: It helps the feature become usable as soon as the page loads. In the map flow, that improves discovery and navigation.
- Key inputs: This function does not take direct parameters; it mainly uses surrounding state, cached DOM references, or globals.
- Key dependencies: This function calls helpers such as `ensureLeafletLoaded`, `openLocationMapModal`, `refreshPreviewMarkers`, depends on Leaflet being loaded.
- Return or side effects: It mostly works through local computation and whatever the caller does with the result.

#### `initializeModalMap()`

- Defined at: line 206
- What this is: This is the main setup function for the modal map flow in the home layer. It also matters for modal focus, temporary state, and predictable open/close behavior.
- Why this is used: It exists so one-time setup stays in one place.
- How this works: It leans on helpers like `ensureLeafletLoaded`, `refreshModalMarkers` and drives Leaflet map state or markers.
- What this helps with: It helps the feature become usable as soon as the page loads. In the map flow, that improves discovery and navigation.
- Key inputs: This function does not take direct parameters; it mainly uses surrounding state, cached DOM references, or globals.
- Key dependencies: This function calls helpers such as `ensureLeafletLoaded`, `refreshModalMarkers`, depends on Leaflet being loaded.
- Return or side effects: It mostly works through local computation and whatever the caller does with the result.

#### `refreshAllMapMarkers()`

- Defined at: line 221
- What this is: This is a support helper for the refresh all map markers work in the home layer. It also matters for modal focus, temporary state, and predictable open/close behavior.
- Why this is used: It exists to keep repeated logic small and reusable.
- How this works: It leans on helpers like `refreshPreviewMarkers`, `refreshModalMarkers`.
- What this helps with: It helps reduce duplication and makes the calling code easier to read.
- Key inputs: This function does not take direct parameters; it mainly uses surrounding state, cached DOM references, or globals.
- Key dependencies: This function calls helpers such as `refreshPreviewMarkers`, `refreshModalMarkers`.
- Return or side effects: It mostly works through local computation and whatever the caller does with the result.

#### `updateLocationFocusCard(locationPoint, roomCount = 0)`

- Defined at: line 226
- What this is: This updates the location focus card after state changes. It also matters for modal focus, temporary state, and predictable open/close behavior.
- Why this is used: It exists so dependent UI reacts when state changes.
- How this works: It leans on helpers like `formatLocationAddress` and writes text, markup, or created elements back into the UI.
- What this helps with: It helps linked UI pieces stay synchronized after a change.
- Key inputs: `locationPoint` is an input value the function uses. `roomCount` carries room data or a room id.
- Key dependencies: This function calls helpers such as `formatLocationAddress`.
- Return or side effects: It works mainly through side effects, especially DOM updates.

#### `renderLocationRoomCards(locationPoint)`

- Defined at: line 240
- What this is: This is the render function for the location room cards UI in the home layer. It also matters for modal focus, temporary state, and predictable open/close behavior.
- Why this is used: It exists so UI output is rebuilt from current state instead of patched everywhere.
- How this works: It leans on helpers like `renderDefaultLocationRoomState`, `getLocationRooms`, `renderRoomCollection`, `updateLocationFocusCard`, uses shared state such as `renderDefaultLocationRoomState`, and writes text, markup, or created elements back into the UI.
- What this helps with: It helps keep the visible UI aligned with the latest state.
- Key inputs: `locationPoint` is an input value the function uses.
- Key dependencies: This function calls helpers such as `renderDefaultLocationRoomState`, `getLocationRooms`, `renderRoomCollection`, `updateLocationFocusCard`, touches shared runtime values like `renderDefaultLocationRoomState`.
- Return or side effects: It works mainly through side effects, especially DOM updates.

#### `resetLocationMapSelection({ preserveFeaturedFilter = true } = {})`

- Defined at: line 267
- What this is: This clears or resets the location map selection state. It also matters for modal focus, temporary state, and predictable open/close behavior.
- Why this is used: It exists so the feature can return to a known clean baseline.
- How this works: It leans on helpers like `updateLocationFocusCard`, `renderDefaultLocationRoomState`, `refreshAllMapMarkers`, `renderFeaturedRooms`, `getLocationMapPoint`, `renderLocationRoomCards`, uses shared state such as `renderDefaultLocationRoomState`, and writes text, markup, or created elements back into the UI.
- What this helps with: It helps avoid stale errors, selections, and temporary state.
- Key inputs: `preserveFeaturedFilter` is an input value the function uses.
- Key dependencies: This function calls helpers such as `updateLocationFocusCard`, `renderDefaultLocationRoomState`, `refreshAllMapMarkers`, `renderFeaturedRooms`, `getLocationMapPoint`, `renderLocationRoomCards`, touches shared runtime values like `renderDefaultLocationRoomState`.
- Return or side effects: It works mainly through side effects, especially DOM updates.

#### `openLocationMapModal(triggerElement = null)`

- Defined at: line 315
- What this is: This opens the location map modal UI or modal in the home layer. It also matters for modal focus, temporary state, and predictable open/close behavior.
- Why this is used: It exists so opening logic can prepare state, content, and focus consistently.
- How this works: It reads current DOM or form values and leans on helpers like `focusFirstElementInModal`, `ensureLeafletLoaded`, `setLocationMapStatus`, `initializeModalMap`, `getLocationMapPoint`, `focusMapLocation`.
- What this helps with: It helps the user start a focused interaction with the right context visible.
- Key inputs: `triggerElement` is a DOM reference.
- Key dependencies: This function calls helpers such as `focusFirstElementInModal`, `ensureLeafletLoaded`, `setLocationMapStatus`, `initializeModalMap`, `getLocationMapPoint`, `focusMapLocation`.
- Return or side effects: It mostly works through local computation and whatever the caller does with the result.

#### `closeLocationMapModal()`

- Defined at: line 357
- What this is: This closes or tears down the location map modal UI state. It also matters for modal focus, temporary state, and predictable open/close behavior.
- Why this is used: It exists so closing logic can clean up and restore context consistently.
- How this works: It performs small synchronous logic and returns the result.
- What this helps with: It helps the user leave the interaction cleanly without stale state leaking into the next open.
- Key inputs: This function does not take direct parameters; it mainly uses surrounding state, cached DOM references, or globals.
- Key dependencies: This function is mostly self-contained and depends only on local values plus standard browser APIs.
- Return or side effects: It mostly works through local computation and whatever the caller does with the result.

#### `loadLocations()`

- Defined at: line 369
- What this is: This is the data-loading function for the locations flow in the home layer. It also matters for modal focus, temporary state, and predictable open/close behavior.
- Why this is used: It exists so loading, success, and error paths stay consistent.
- How this works: It leans on helpers like `fetchJson`, `buildLocationMapPoints`, `fillLocationOptions`, `ensureLeafletLoaded`, `initializePreviewMap`, `refreshAllMapMarkers`.
- What this helps with: It helps the user see fresh data and gives the feature a clear refresh path.
- Key inputs: This function does not take direct parameters; it mainly uses surrounding state, cached DOM references, or globals.
- Key dependencies: This function calls helpers such as `fetchJson`, `buildLocationMapPoints`, `fillLocationOptions`, `ensureLeafletLoaded`, `initializePreviewMap`, `refreshAllMapMarkers`.
- Return or side effects: It works mainly through side effects, especially listener registration.

### Important Inline Callbacks

#### Inline Callback At Line 336

- Source marker: `window.requestAnimationFrame(() => {`
- What this is: This is the callback scheduled for the next animation frame.
- Why this is used: It exists so layout-sensitive work happens in step with the browser paint cycle.
- How this works: The browser runs it just before repaint, which is useful for smoother measurement and UI updates.
- What this helps with: It helps reduce visual jitter when state changes line up with rendering.

#### Inline Callback At Line 371

- Source marker: `.then(locations => {`
- What this is: This is the inline success handler in a promise chain.
- Why this is used: It stays in the chain so response handling sits next to the request that produced it.
- How this works: After the async operation resolves, it inspects the result and applies the next local UI or state step.
- What this helps with: It helps keep request logic readable because success handling stays close to the fetch call.

#### Inline Callback At Line 394

- Source marker: `.catch(error => {`
- What this is: This is the inline error handler in a promise chain.
- Why this is used: It exists so request-specific failure handling stays beside the request flow that can fail.
- How this works: If the async chain rejects, it receives the error and turns it into logging, UI feedback, or cleanup.
- What this helps with: It helps the user see the right failure feedback for that exact request path.

#### Inline Callback At Line 402

- Source marker: `featuredLocationFilter.addEventListener("change", () => {`
- What this is: This is the inline change listener attached to `featuredLocationFilter`.
- Why this is used: It stays beside the event registration so the trigger and reaction are easy to read together.
- How this works: When the browser fires that event, the callback reads closure state, performs the local UI action, and may call named helpers for heavier work.
- What this helps with: It helps the interface respond directly to user input without creating another global helper.

#### Inline Callback At Line 418

- Source marker: `officeMapPreview.addEventListener("click", () => {`
- What this is: This is the inline click listener attached to `officeMapPreview`.
- Why this is used: It stays beside the event registration so the trigger and reaction are easy to read together.
- How this works: When the browser fires that event, the callback reads closure state, performs the local UI action, and may call named helpers for heavier work.
- What this helps with: It helps the interface respond directly to user input without creating another global helper.

#### Inline Callback At Line 424

- Source marker: `officeMapPreview.addEventListener("keydown", event => {`
- What this is: This is the inline keydown listener attached to `officeMapPreview`.
- Why this is used: It stays beside the event registration so the trigger and reaction are easy to read together.
- How this works: When the browser fires that event, the callback reads closure state, performs the local UI action, and may call named helpers for heavier work.
- What this helps with: It helps the interface respond directly to user input without creating another global helper.

#### Inline Callback At Line 432

- Source marker: `locationMapResetBtn.addEventListener("click", () => {`
- What this is: This is the inline click listener attached to `locationMapResetBtn`.
- Why this is used: It stays beside the event registration so the trigger and reaction are easy to read together.
- How this works: When the browser fires that event, the callback reads closure state, performs the local UI action, and may call named helpers for heavier work.
- What this helps with: It helps the interface respond directly to user input without creating another global helper.

#### Inline Callback At Line 438

- Source marker: `locationMapModal.addEventListener("click", event => {`
- What this is: This is the inline click listener attached to `locationMapModal`.
- Why this is used: It stays beside the event registration so the trigger and reaction are easy to read together.
- How this works: When the browser fires that event, the callback reads closure state, performs the local UI action, and may call named helpers for heavier work.
- What this helps with: It helps the interface respond directly to user input without creating another global helper.

#### Inline Callback At Line 445

- Source marker: `window.addEventListener("resize", () => {`
- What this is: This is the inline resize listener attached to `window`.
- Why this is used: It stays beside the event registration so the trigger and reaction are easy to read together.
- How this works: When the browser fires that event, the callback reads closure state, performs the local UI action, and may call named helpers for heavier work.
- What this helps with: It helps the interface respond directly to user input without creating another global helper.

## frontend/js/home/sections/home-hero.js

- Area: Home
- File role: This file owns home hero behavior in the home layer.
- Line count: 101
- Named functions in this file: 6
- Important inline callbacks noted: 3
- Top-level behavior: mixes named helpers with direct runtime wiring for this feature.

### Named Functions

#### `initializeSlideshow()`

- Defined at: line 4
- What this is: This is the main setup function for the slideshow flow in the home layer.
- Why this is used: It exists so one-time setup stays in one place.
- How this works: It reads current DOM or form values.
- What this helps with: It helps the feature become usable as soon as the page loads.
- Key inputs: This function does not take direct parameters; it mainly uses surrounding state, cached DOM references, or globals.
- Key dependencies: This function depends on browser media-query support.
- Return or side effects: It mostly works through local computation and whatever the caller does with the result.

#### `syncDuration()`

- Defined at: line 24
- What this is: This keeps the duration synchronized across related state.
- Why this is used: It exists so related values do not drift apart.
- How this works: It uses shared state such as `readyState`.
- What this helps with: It helps the feature behave like one coherent workflow instead of separate disconnected pieces.
- Key inputs: This function does not take direct parameters; it mainly uses surrounding state, cached DOM references, or globals.
- Key dependencies: This function touches shared runtime values like `readyState`.
- Return or side effects: Mostly returns a derived value or prepared structure back to the caller.

#### `syncSlidePlayback(activeIndex)`

- Defined at: line 40
- What this is: This keeps the slide playback synchronized across related state.
- Why this is used: It exists so related values do not drift apart.
- How this works: It performs small synchronous logic and returns the result.
- What this helps with: It helps the feature behave like one coherent workflow instead of separate disconnected pieces.
- Key inputs: `activeIndex` is an input value the function uses.
- Key dependencies: This function is mostly self-contained and depends only on local values plus standard browser APIs.
- Return or side effects: Mostly returns a derived value or prepared structure back to the caller.

#### `showSlide(index)`

- Defined at: line 60
- What this is: This is a support helper for the show slide work in the home layer.
- Why this is used: It exists to keep repeated logic small and reusable.
- How this works: It leans on helpers like `syncSlidePlayback` and toggles CSS classes to reflect current state.
- What this helps with: It helps reduce duplication and makes the calling code easier to read.
- Key inputs: `index` is an input value the function uses.
- Key dependencies: This function calls helpers such as `syncSlidePlayback`.
- Return or side effects: It works mainly through side effects, especially CSS class changes.

#### `stopAutoPlay()`

- Defined at: line 67
- What this is: This is a support helper for the stop auto play work in the home layer.
- Why this is used: It exists to keep repeated logic small and reusable.
- How this works: It performs small synchronous logic and returns the result.
- What this helps with: It helps reduce duplication and makes the calling code easier to read.
- Key inputs: This function does not take direct parameters; it mainly uses surrounding state, cached DOM references, or globals.
- Key dependencies: This function is mostly self-contained and depends only on local values plus standard browser APIs.
- Return or side effects: It mostly works through local computation and whatever the caller does with the result.

#### `startAutoPlay()`

- Defined at: line 74
- What this is: This is a support helper for the start auto play work in the home layer.
- Why this is used: It exists to keep repeated logic small and reusable.
- How this works: It reads current DOM or form values and leans on helpers like `stopAutoPlay`, `showSlide`, `syncSlidePlayback`.
- What this helps with: It helps reduce duplication and makes the calling code easier to read.
- Key inputs: This function does not take direct parameters; it mainly uses surrounding state, cached DOM references, or globals.
- Key dependencies: This function calls helpers such as `stopAutoPlay`, `showSlide`, `syncSlidePlayback`.
- Return or side effects: Mostly returns a derived value or prepared structure back to the caller.

### Important Inline Callbacks

#### Inline Callback At Line 50

- Source marker: `playPromise.catch(() => {});`
- What this is: This is the inline error handler in a promise chain.
- Why this is used: It exists so request-specific failure handling stays beside the request flow that can fail.
- How this works: If the async chain rejects, it receives the error and turns it into logging, UI feedback, or cleanup.
- What this helps with: It helps the user see the right failure feedback for that exact request path.

#### Inline Callback At Line 77

- Source marker: `slideshowTimerId = window.setInterval(() => {`
- What this is: This is the repeating callback passed to an interval timer.
- Why this is used: It exists because this feature needs a repeating cycle instead of one immediate action.
- How this works: The browser reruns it on every interval tick until the timer is cleared.
- What this helps with: It helps drive slideshows, polling, or repeated refresh behavior.

#### Inline Callback At Line 82

- Source marker: `document.addEventListener("visibilitychange", () => {`
- What this is: This is the inline visibilitychange listener attached to `document`.
- Why this is used: It stays beside the event registration so the trigger and reaction are easy to read together.
- How this works: When the browser fires that event, the callback reads closure state, performs the local UI action, and may call named helpers for heavier work.
- What this helps with: It helps the interface respond directly to user input without creating another global helper.

## frontend/js/home/sections/home-rooms.js

- Area: Home
- File role: This file owns home rooms behavior in the home layer.
- Line count: 204
- Named functions in this file: 11
- Important inline callbacks noted: 2
- Top-level behavior: mixes named helpers with direct runtime wiring for this feature.

### Named Functions

#### `renderRoomState(container, titleText, metaText = "")`

- Defined at: line 6
- What this is: This is the render function for the room state UI in the home layer.
- Why this is used: It exists so UI output is rebuilt from current state instead of patched everywhere.
- How this works: It reads current DOM or form values, uses shared state such as `renderRoomState`, and writes text, markup, or created elements back into the UI.
- What this helps with: It helps keep the visible UI aligned with the latest state.
- Key inputs: `container` is a DOM reference. `titleText` is an input value the function uses. `metaText` is an input value the function uses.
- Key dependencies: This function touches shared runtime values like `renderRoomState`.
- Return or side effects: It works mainly through side effects, especially DOM updates.

#### `createRoomCard(room)`

- Defined at: line 32
- What this is: This creates the room card object or DOM fragment.
- Why this is used: It exists so reusable objects or DOM fragments are built the same way each time.
- How this works: It reads current DOM or form values, leans on helpers like `getRoomImage`, `getRoomMetaText`, and writes text, markup, or created elements back into the UI.
- What this helps with: It helps generated UI fragments stay uniform and easier to maintain.
- Key inputs: `room` carries room data or a room id.
- Key dependencies: This function calls helpers such as `getRoomImage`, `getRoomMetaText`.
- Return or side effects: Mostly returns a derived value or prepared structure back to the caller.

#### `renderRoomCollection(container, rooms, { emptyTitle, emptyMeta = "" } = {})`

- Defined at: line 75
- What this is: This is the render function for the room collection UI in the home layer.
- Why this is used: It exists so UI output is rebuilt from current state instead of patched everywhere.
- How this works: It leans on helpers like `renderRoomState`, `createRoomCard`, uses shared state such as `renderRoomState`, and writes text, markup, or created elements back into the UI.
- What this helps with: It helps keep the visible UI aligned with the latest state.
- Key inputs: `container` is a DOM reference. `rooms` carries room data or a room id. `emptyTitle` is an input value the function uses. `emptyMeta` is an input value the function uses.
- Key dependencies: This function calls helpers such as `renderRoomState`, `createRoomCard`, touches shared runtime values like `renderRoomState`.
- Return or side effects: It works mainly through side effects, especially DOM updates.

#### `fillLocationOptions(selectElement, locations)`

- Defined at: line 91
- What this is: This fills the location options UI with options or values.
- Why this is used: It exists so dropdowns and filters reflect the current dataset.
- How this works: It reads current DOM or form values and writes text, markup, or created elements back into the UI.
- What this helps with: It helps selects and filters stay in sync with live data.
- Key inputs: `selectElement` is a DOM reference. `locations` is an input value the function uses.
- Key dependencies: This function is mostly self-contained and depends only on local values plus standard browser APIs.
- Return or side effects: It works mainly through side effects, especially DOM updates.

#### `syncRoomLookup(rooms)`

- Defined at: line 109
- What this is: This keeps the room lookup synchronized across related state.
- Why this is used: It exists so related values do not drift apart.
- How this works: It performs small synchronous logic and returns the result.
- What this helps with: It helps the feature behave like one coherent workflow instead of separate disconnected pieces.
- Key inputs: `rooms` carries room data or a room id.
- Key dependencies: This function is mostly self-contained and depends only on local values plus standard browser APIs.
- Return or side effects: It mostly works through local computation and whatever the caller does with the result.

#### `getFilteredFeaturedRooms()`

- Defined at: line 116
- What this is: This returns a derived filtered featured rooms value for the home layer.
- Why this is used: It exists to centralize a repeated lookup or calculation.
- How this works: It performs small synchronous logic and returns the result.
- What this helps with: It helps other code ask for the current filtered featured rooms in one place.
- Key inputs: This function does not take direct parameters; it mainly uses surrounding state, cached DOM references, or globals.
- Key dependencies: This function is mostly self-contained and depends only on local values plus standard browser APIs.
- Return or side effects: Mostly returns a derived value or prepared structure back to the caller.

#### `renderFeaturedRooms()`

- Defined at: line 125
- What this is: This is the render function for the featured rooms UI in the home layer.
- Why this is used: It exists so UI output is rebuilt from current state instead of patched everywhere.
- How this works: It leans on helpers like `getFilteredFeaturedRooms`, `renderRoomCollection`.
- What this helps with: It helps keep the visible UI aligned with the latest state.
- Key inputs: This function does not take direct parameters; it mainly uses surrounding state, cached DOM references, or globals.
- Key dependencies: This function calls helpers such as `getFilteredFeaturedRooms`, `renderRoomCollection`.
- Return or side effects: It mostly works through local computation and whatever the caller does with the result.

#### `renderDefaultLocationRoomState()`

- Defined at: line 135
- What this is: This is the render function for the default location room state UI in the home layer.
- Why this is used: It exists so UI output is rebuilt from current state instead of patched everywhere.
- How this works: It leans on helpers like `renderRoomState`, uses shared state such as `renderDefaultLocationRoomState`, `renderRoomState`, and writes text, markup, or created elements back into the UI.
- What this helps with: It helps keep the visible UI aligned with the latest state.
- Key inputs: This function does not take direct parameters; it mainly uses surrounding state, cached DOM references, or globals.
- Key dependencies: This function calls helpers such as `renderRoomState`, touches shared runtime values like `renderDefaultLocationRoomState`, `renderRoomState`.
- Return or side effects: It works mainly through side effects, especially DOM updates.

#### `getLocationRooms(locationId)`

- Defined at: line 150
- What this is: This returns a derived location rooms value for the home layer.
- Why this is used: It exists to centralize a repeated lookup or calculation.
- How this works: It performs small synchronous logic and returns the result.
- What this helps with: It helps other code ask for the current location rooms in one place.
- Key inputs: `locationId` is an input value the function uses.
- Key dependencies: This function is mostly self-contained and depends only on local values plus standard browser APIs.
- Return or side effects: Mostly returns a derived value or prepared structure back to the caller.

#### `handleRoomCardClick(event)`

- Defined at: line 154
- What this is: This is a support helper for the handle room card click work in the home layer.
- Why this is used: It exists to keep repeated logic small and reusable.
- How this works: It reads current DOM or form values and leans on helpers like `setBookingMessage`, `openRoomModal`.
- What this helps with: It helps reduce duplication and makes the calling code easier to read.
- Key inputs: `event` is the browser event object.
- Key dependencies: This function calls helpers such as `setBookingMessage`, `openRoomModal`.
- Return or side effects: Mostly returns a derived value or prepared structure back to the caller.

#### `loadAllRooms()`

- Defined at: line 169
- What this is: This is the data-loading function for the all rooms flow in the home layer.
- Why this is used: It exists so loading, success, and error paths stay consistent.
- How this works: It leans on helpers like `setBookingMessage`, `renderRoomState`, `fetchJson`, `syncRoomLookup`, `renderFeaturedRooms`, `refreshAllMapMarkers` and uses shared state such as `renderRoomState`.
- What this helps with: It helps the user see fresh data and gives the feature a clear refresh path.
- Key inputs: This function does not take direct parameters; it mainly uses surrounding state, cached DOM references, or globals.
- Key dependencies: This function calls helpers such as `setBookingMessage`, `renderRoomState`, `fetchJson`, `syncRoomLookup`, `renderFeaturedRooms`, `refreshAllMapMarkers`, touches shared runtime values like `renderRoomState`.
- Return or side effects: It works mainly through side effects, especially listener registration.

### Important Inline Callbacks

#### Inline Callback At Line 176

- Source marker: `.then(rooms => {`
- What this is: This is the inline success handler in a promise chain.
- Why this is used: It stays in the chain so response handling sits next to the request that produced it.
- How this works: After the async operation resolves, it inspects the result and applies the next local UI or state step.
- What this helps with: It helps keep request logic readable because success handling stays close to the fetch call.

#### Inline Callback At Line 186

- Source marker: `.catch(error => {`
- What this is: This is the inline error handler in a promise chain.
- Why this is used: It exists so request-specific failure handling stays beside the request flow that can fail.
- How this works: If the async chain rejects, it receives the error and turns it into logging, UI feedback, or cleanup.
- What this helps with: It helps the user see the right failure feedback for that exact request path.

## frontend/js/home/shared/home-page-behavior.js

- Area: Home
- File role: This file owns home page behavior behavior in the home layer.
- Line count: 64
- Named functions in this file: 6
- Important inline callbacks noted: 3
- Top-level behavior: mixes named helpers with direct runtime wiring for this feature.

### Named Functions

#### `initializeSignInIllustrationVideo()`

- Defined at: line 1
- What this is: This is the main setup function for the sign in illustration video flow in the home layer.
- Why this is used: It exists so one-time setup stays in one place.
- How this works: It performs small synchronous logic and returns the result.
- What this helps with: It helps the feature become usable as soon as the page loads.
- Key inputs: This function does not take direct parameters; it mainly uses surrounding state, cached DOM references, or globals.
- Key dependencies: This function is mostly self-contained and depends only on local values plus standard browser APIs.
- Return or side effects: It mostly works through local computation and whatever the caller does with the result.

#### `ensurePlayback()`

- Defined at: line 7
- What this is: This ensures the playback requirement is ready before the flow continues.
- Why this is used: It exists so later logic can assume a prerequisite is already satisfied.
- How this works: It reads current DOM or form values.
- What this helps with: It helps later code run with fewer defensive checks.
- Key inputs: This function does not take direct parameters; it mainly uses surrounding state, cached DOM references, or globals.
- Key dependencies: This function is mostly self-contained and depends only on local values plus standard browser APIs.
- Return or side effects: It works mainly through side effects, especially listener registration.

#### `initializeStickyAuthCardState()`

- Defined at: line 24
- What this is: This is the main setup function for the sticky auth card state flow in the home layer.
- Why this is used: It exists so one-time setup stays in one place.
- How this works: It reads current DOM or form values and uses shared state such as `initializeStickyAuthCardState`.
- What this helps with: It helps the feature become usable as soon as the page loads.
- Key inputs: This function does not take direct parameters; it mainly uses surrounding state, cached DOM references, or globals.
- Key dependencies: This function touches shared runtime values like `initializeStickyAuthCardState`, depends on browser media-query support.
- Return or side effects: It mostly works through local computation and whatever the caller does with the result.

#### `readStickyTopPx()`

- Defined at: line 31
- What this is: This is a support helper for the read sticky top px work in the home layer.
- Why this is used: It exists to keep repeated logic small and reusable.
- How this works: It performs small synchronous logic and returns the result.
- What this helps with: It helps reduce duplication and makes the calling code easier to read.
- Key inputs: This function does not take direct parameters; it mainly uses surrounding state, cached DOM references, or globals.
- Key dependencies: This function is mostly self-contained and depends only on local values plus standard browser APIs.
- Return or side effects: Mostly returns a derived value or prepared structure back to the caller.

#### `updateStickyState()`

- Defined at: line 36
- What this is: This updates the sticky state after state changes.
- Why this is used: It exists so dependent UI reacts when state changes.
- How this works: It leans on helpers like `readStickyTopPx`, uses shared state such as `updateStickyState`, and toggles CSS classes to reflect current state.
- What this helps with: It helps linked UI pieces stay synchronized after a change.
- Key inputs: This function does not take direct parameters; it mainly uses surrounding state, cached DOM references, or globals.
- Key dependencies: This function calls helpers such as `readStickyTopPx`, touches shared runtime values like `updateStickyState`.
- Return or side effects: It works mainly through side effects, especially CSS class changes.

#### `scheduleStickyStateUpdate()`

- Defined at: line 50
- What this is: This is a support helper for the schedule sticky state update work in the home layer.
- Why this is used: It exists to keep repeated logic small and reusable.
- How this works: It leans on helpers like `updateStickyState` and uses shared state such as `updateStickyState`.
- What this helps with: It helps reduce duplication and makes the calling code easier to read.
- Key inputs: This function does not take direct parameters; it mainly uses surrounding state, cached DOM references, or globals.
- Key dependencies: This function calls helpers such as `updateStickyState`, touches shared runtime values like `updateStickyState`.
- Return or side effects: Mostly returns a derived value or prepared structure back to the caller.

### Important Inline Callbacks

#### Inline Callback At Line 10

- Source marker: `playPromise.catch(() => {});`
- What this is: This is the inline error handler in a promise chain.
- Why this is used: It exists so request-specific failure handling stays beside the request flow that can fail.
- How this works: If the async chain rejects, it receives the error and turns it into logging, UI feedback, or cleanup.
- What this helps with: It helps the user see the right failure feedback for that exact request path.

#### Inline Callback At Line 15

- Source marker: `document.addEventListener("visibilitychange", () => {`
- What this is: This is the inline visibilitychange listener attached to `document`.
- Why this is used: It stays beside the event registration so the trigger and reaction are easy to read together.
- How this works: When the browser fires that event, the callback reads closure state, performs the local UI action, and may call named helpers for heavier work.
- What this helps with: It helps the interface respond directly to user input without creating another global helper.

#### Inline Callback At Line 53

- Source marker: `window.requestAnimationFrame(() => {`
- What this is: This is the callback scheduled for the next animation frame.
- Why this is used: It exists so layout-sensitive work happens in step with the browser paint cycle.
- How this works: The browser runs it just before repaint, which is useful for smoother measurement and UI updates.
- What this helps with: It helps reduce visual jitter when state changes line up with rendering.

## frontend/js/home/shared/home-room-utils.js

- Area: Home
- File role: This file owns home room utils behavior in the home layer.
- Line count: 254
- Named functions in this file: 21
- Important inline callbacks noted: 2
- Top-level behavior: mixes named helpers with direct runtime wiring for this feature.

### Named Functions

#### `setBookingMessage(message, type = "")`

- Defined at: line 1
- What this is: This sets or writes the booking message state in the home layer.
- Why this is used: It exists so status or state changes follow one rule set.
- How this works: It writes text, markup, or created elements back into the UI and toggles CSS classes to reflect current state.
- What this helps with: It helps the UI communicate state or feedback in a standardized way.
- Key inputs: `message` is user-facing feedback text. `type` controls a visual tone or behavior mode.
- Key dependencies: This function is mostly self-contained and depends only on local values plus standard browser APIs.
- Return or side effects: It works mainly through side effects, especially DOM updates, CSS class changes.

#### `setLocationMapStatus(message, type = "")`

- Defined at: line 10
- What this is: This sets or writes the location map status state in the home layer.
- Why this is used: It exists so status or state changes follow one rule set.
- How this works: It writes text, markup, or created elements back into the UI and toggles CSS classes to reflect current state.
- What this helps with: It helps the UI communicate state or feedback in a standardized way.
- Key inputs: `message` is user-facing feedback text. `type` controls a visual tone or behavior mode.
- Key dependencies: This function is mostly self-contained and depends only on local values plus standard browser APIs.
- Return or side effects: It works mainly through side effects, especially DOM updates, CSS class changes.

#### `normalizeRoomName(roomName)`

- Defined at: line 20
- What this is: This normalizes the room name so later code sees one consistent shape.
- Why this is used: It exists so downstream code does not guess between multiple input shapes.
- How this works: It performs small synchronous logic and returns the result.
- What this helps with: It helps downstream code stay simple because inputs become consistent.
- Key inputs: `roomName` carries room data or a room id.
- Key dependencies: This function is mostly self-contained and depends only on local values plus standard browser APIs.
- Return or side effects: Mostly returns a derived value or prepared structure back to the caller.

#### `normalizeLocationName(locationName)`

- Defined at: line 24
- What this is: This normalizes the location name so later code sees one consistent shape.
- Why this is used: It exists so downstream code does not guess between multiple input shapes.
- How this works: It performs small synchronous logic and returns the result.
- What this helps with: It helps downstream code stay simple because inputs become consistent.
- Key inputs: `locationName` is an input value the function uses.
- Key dependencies: This function is mostly self-contained and depends only on local values plus standard browser APIs.
- Return or side effects: Mostly returns a derived value or prepared structure back to the caller.

#### `formatLocationAddress(address)`

- Defined at: line 28
- What this is: This formats the location address into display-friendly output.
- Why this is used: It exists so raw values become consistent display text.
- How this works: It performs small synchronous logic and returns the result.
- What this helps with: It helps the interface stay readable because raw values become human-friendly text.
- Key inputs: `address` is an input value the function uses.
- Key dependencies: This function is mostly self-contained and depends only on local values plus standard browser APIs.
- Return or side effects: Mostly returns a derived value or prepared structure back to the caller.

#### `fetchJson(url, fallbackMessage)`

- Defined at: line 36
- What this is: This is a support helper for the fetch json work in the home layer.
- Why this is used: It exists to keep repeated logic small and reusable. It also keeps backend communication tied to the right UI step.
- How this works: It talks to the backend.
- What this helps with: It helps reduce duplication and makes the calling code easier to read.
- Key inputs: `url` is an input value the function uses. `fallbackMessage` is user-facing feedback text.
- Key dependencies: This function depends on a backend request path.
- Return or side effects: Mostly returns a derived value or prepared structure back to the caller.

#### `getLocationShortLabel(locationName)`

- Defined at: line 46
- What this is: This returns a derived location short label value for the home layer.
- Why this is used: It exists to centralize a repeated lookup or calculation.
- How this works: It leans on helpers like `normalizeLocationName`.
- What this helps with: It helps other code ask for the current location short label in one place.
- Key inputs: `locationName` is an input value the function uses.
- Key dependencies: This function calls helpers such as `normalizeLocationName`.
- Return or side effects: Mostly returns a derived value or prepared structure back to the caller.

#### `getRoomImage(room)`

- Defined at: line 63
- What this is: This returns a derived room image value for the home layer.
- Why this is used: It exists to centralize a repeated lookup or calculation.
- How this works: It leans on helpers like `normalizeRoomName`.
- What this helps with: It helps other code ask for the current room image in one place.
- Key inputs: `room` carries room data or a room id.
- Key dependencies: This function calls helpers such as `normalizeRoomName`.
- Return or side effects: Mostly returns a derived value or prepared structure back to the caller.

#### `isAmenityEnabled(value)`

- Defined at: line 72
- What this is: This answers a yes-or-no rule about the amenity enabled flow.
- Why this is used: It exists so calling code can branch on one clear business rule.
- How this works: It performs small synchronous logic and returns the result.
- What this helps with: It helps business rules stay readable and testable.
- Key inputs: `value` is an input value the function uses.
- Key dependencies: This function is mostly self-contained and depends only on local values plus standard browser APIs.
- Return or side effects: Mostly returns a derived value or prepared structure back to the caller.

#### `getRoomAmenities(room)`

- Defined at: line 76
- What this is: This returns a derived room amenities value for the home layer.
- Why this is used: It exists to centralize a repeated lookup or calculation.
- How this works: It leans on helpers like `isAmenityEnabled`.
- What this helps with: It helps other code ask for the current room amenities in one place.
- Key inputs: `room` carries room data or a room id.
- Key dependencies: This function calls helpers such as `isAmenityEnabled`.
- Return or side effects: Mostly returns a derived value or prepared structure back to the caller.

#### `getFeatureText(room, { limit = null } = {})`

- Defined at: line 80
- What this is: This returns a derived feature text value for the home layer.
- Why this is used: It exists to centralize a repeated lookup or calculation.
- How this works: It leans on helpers like `getRoomAmenities`.
- What this helps with: It helps other code ask for the current feature text in one place.
- Key inputs: `room` carries room data or a room id. `limit` is an input value the function uses.
- Key dependencies: This function calls helpers such as `getRoomAmenities`.
- Return or side effects: Mostly returns a derived value or prepared structure back to the caller.

#### `createAmenityIcon(iconKey)`

- Defined at: line 94
- What this is: This creates the amenity icon object or DOM fragment.
- Why this is used: It exists so reusable objects or DOM fragments are built the same way each time.
- How this works: It reads current DOM or form values and writes text, markup, or created elements back into the UI.
- What this helps with: It helps generated UI fragments stay uniform and easier to maintain.
- Key inputs: `iconKey` is an input value the function uses.
- Key dependencies: This function is mostly self-contained and depends only on local values plus standard browser APIs.
- Return or side effects: Mostly returns a derived value or prepared structure back to the caller.

#### `createRoomDetailMetaIcon(iconKey)`

- Defined at: line 102
- What this is: This creates the room detail meta icon object or DOM fragment.
- Why this is used: It exists so reusable objects or DOM fragments are built the same way each time.
- How this works: It reads current DOM or form values and writes text, markup, or created elements back into the UI.
- What this helps with: It helps generated UI fragments stay uniform and easier to maintain.
- Key inputs: `iconKey` is an input value the function uses.
- Key dependencies: This function is mostly self-contained and depends only on local values plus standard browser APIs.
- Return or side effects: Mostly returns a derived value or prepared structure back to the caller.

#### `renderRoomAmenities(container, room)`

- Defined at: line 110
- What this is: This is the render function for the room amenities UI in the home layer.
- Why this is used: It exists so UI output is rebuilt from current state instead of patched everywhere.
- How this works: It reads current DOM or form values, leans on helpers like `getRoomAmenities`, `createAmenityIcon`, uses shared state such as `emptyState`, and writes text, markup, or created elements back into the UI.
- What this helps with: It helps keep the visible UI aligned with the latest state.
- Key inputs: `container` is a DOM reference. `room` carries room data or a room id.
- Key dependencies: This function calls helpers such as `getRoomAmenities`, `createAmenityIcon`, touches shared runtime values like `emptyState`.
- Return or side effects: It works mainly through side effects, especially DOM updates.

#### `getRoomMetaText(room)`

- Defined at: line 137
- What this is: This returns a derived room meta text value for the home layer.
- Why this is used: It exists to centralize a repeated lookup or calculation.
- How this works: It leans on helpers like `getFeatureText`.
- What this helps with: It helps other code ask for the current room meta text in one place.
- Key inputs: `room` carries room data or a room id.
- Key dependencies: This function calls helpers such as `getFeatureText`.
- Return or side effects: Mostly returns a derived value or prepared structure back to the caller.

#### `getRoomCapacityText(room)`

- Defined at: line 143
- What this is: This returns a derived room capacity text value for the home layer.
- Why this is used: It exists to centralize a repeated lookup or calculation.
- How this works: It performs small synchronous logic and returns the result.
- What this helps with: It helps other code ask for the current room capacity text in one place.
- Key inputs: `room` carries room data or a room id.
- Key dependencies: This function is mostly self-contained and depends only on local values plus standard browser APIs.
- Return or side effects: Mostly returns a derived value or prepared structure back to the caller.

#### `getRoomPurposeText(room)`

- Defined at: line 149
- What this is: This returns a derived room purpose text value for the home layer.
- Why this is used: It exists to centralize a repeated lookup or calculation.
- How this works: It leans on helpers like `normalizeRoomName`.
- What this helps with: It helps other code ask for the current room purpose text in one place.
- Key inputs: `room` carries room data or a room id.
- Key dependencies: This function calls helpers such as `normalizeRoomName`.
- Return or side effects: Mostly returns a derived value or prepared structure back to the caller.

#### `getRoomSetupText(room)`

- Defined at: line 183
- What this is: This returns a derived room setup text value for the home layer.
- Why this is used: It exists to centralize a repeated lookup or calculation.
- How this works: It leans on helpers like `isAmenityEnabled`.
- What this helps with: It helps other code ask for the current room setup text in one place.
- Key inputs: `room` carries room data or a room id.
- Key dependencies: This function calls helpers such as `isAmenityEnabled`.
- Return or side effects: Mostly returns a derived value or prepared structure back to the caller.

#### `getRoomComfortText(room)`

- Defined at: line 199
- What this is: This returns a derived room comfort text value for the home layer.
- Why this is used: It exists to centralize a repeated lookup or calculation.
- How this works: It leans on helpers like `isAmenityEnabled`.
- What this helps with: It helps other code ask for the current room comfort text in one place.
- Key inputs: `room` carries room data or a room id.
- Key dependencies: This function calls helpers such as `isAmenityEnabled`.
- Return or side effects: Mostly returns a derived value or prepared structure back to the caller.

#### `renderRoomMediaSummary(room)`

- Defined at: line 212
- What this is: This is the render function for the room media summary UI in the home layer.
- Why this is used: It exists so UI output is rebuilt from current state instead of patched everywhere.
- How this works: It leans on helpers like `getRoomPurposeText`, `getRoomSetupText`, `getRoomComfortText` and writes text, markup, or created elements back into the UI.
- What this helps with: It helps keep the visible UI aligned with the latest state.
- Key inputs: `room` carries room data or a room id.
- Key dependencies: This function calls helpers such as `getRoomPurposeText`, `getRoomSetupText`, `getRoomComfortText`.
- Return or side effects: It works mainly through side effects, especially DOM updates.

#### `renderRoomDetailMeta(room)`

- Defined at: line 224
- What this is: This is the render function for the room detail meta UI in the home layer.
- Why this is used: It exists so UI output is rebuilt from current state instead of patched everywhere.
- How this works: It reads current DOM or form values, leans on helpers like `getRoomCapacityText`, `createRoomDetailMetaIcon`, and writes text, markup, or created elements back into the UI.
- What this helps with: It helps keep the visible UI aligned with the latest state.
- Key inputs: `room` carries room data or a room id.
- Key dependencies: This function calls helpers such as `getRoomCapacityText`, `createRoomDetailMetaIcon`.
- Return or side effects: It works mainly through side effects, especially DOM updates.

### Important Inline Callbacks

#### Inline Callback At Line 37

- Source marker: `return fetch(url).then(async response => {`
- What this is: This is the inline success handler in a promise chain.
- Why this is used: It stays in the chain so response handling sits next to the request that produced it.
- How this works: After the async operation resolves, it inspects the result and applies the next local UI or state step.
- What this helps with: It helps keep request logic readable because success handling stays close to the fetch call.

#### Inline Callback At Line 38

- Source marker: `const data = await response.json().catch(() => null);`
- What this is: This is the inline error handler in a promise chain.
- Why this is used: It exists so request-specific failure handling stays beside the request flow that can fail.
- How this works: If the async chain rejects, it receives the error and turns it into logging, UI feedback, or cleanup.
- What this helps with: It helps the user see the right failure feedback for that exact request path.

## frontend/js/home/theme/home-theme.js

- Area: Home
- File role: This file owns home theme theme behavior in the home layer.
- Line count: 59
- Named functions in this file: 7
- Important inline callbacks noted: 1
- Top-level behavior: mixes named helpers with direct runtime wiring for this feature.

### Named Functions

#### `getStoredTheme()`

- Defined at: line 1
- What this is: This returns a derived stored theme value for the home layer. It also matters for visual consistency and saved theme preference behavior.
- Why this is used: It exists to centralize a repeated lookup or calculation.
- How this works: It reads or writes browser storage.
- What this helps with: It helps other code ask for the current stored theme in one place. In theme code, that also improves preference persistence.
- Key inputs: This function does not take direct parameters; it mainly uses surrounding state, cached DOM references, or globals.
- Key dependencies: This function is mostly self-contained and depends only on local values plus standard browser APIs.
- Return or side effects: Mostly returns a derived value or prepared structure back to the caller.

#### `getSystemTheme()`

- Defined at: line 6
- What this is: This returns a derived system theme value for the home layer. It also matters for visual consistency and saved theme preference behavior.
- Why this is used: It exists to centralize a repeated lookup or calculation.
- How this works: It performs small synchronous logic and returns the result.
- What this helps with: It helps other code ask for the current system theme in one place. In theme code, that also improves preference persistence.
- Key inputs: This function does not take direct parameters; it mainly uses surrounding state, cached DOM references, or globals.
- Key dependencies: This function depends on browser media-query support.
- Return or side effects: Mostly returns a derived value or prepared structure back to the caller.

#### `getActiveTheme()`

- Defined at: line 10
- What this is: This returns a derived active theme value for the home layer. It also matters for visual consistency and saved theme preference behavior.
- Why this is used: It exists to centralize a repeated lookup or calculation.
- How this works: It reads current DOM or form values and toggles CSS classes to reflect current state.
- What this helps with: It helps other code ask for the current active theme in one place. In theme code, that also improves preference persistence.
- Key inputs: This function does not take direct parameters; it mainly uses surrounding state, cached DOM references, or globals.
- Key dependencies: This function is mostly self-contained and depends only on local values plus standard browser APIs.
- Return or side effects: Mostly returns a derived value or prepared structure back to the caller.

#### `setThemeToggleButtonState(theme)`

- Defined at: line 14
- What this is: This sets or writes the theme toggle button state state in the home layer. It also matters for visual consistency and saved theme preference behavior.
- Why this is used: It exists so status or state changes follow one rule set.
- How this works: It uses shared state such as `setThemeToggleButtonState` and writes text, markup, or created elements back into the UI.
- What this helps with: It helps the UI communicate state or feedback in a standardized way. In theme code, that also improves preference persistence.
- Key inputs: `theme` is an input value the function uses.
- Key dependencies: This function touches shared runtime values like `setThemeToggleButtonState`.
- Return or side effects: It works mainly through side effects, especially DOM updates.

#### `applyTheme(theme, { persist = true } = {})`

- Defined at: line 22
- What this is: This applies the theme rule to the live UI state. It also matters for visual consistency and saved theme preference behavior.
- Why this is used: It exists so a computed rule is actually pushed into the live UI at the right time.
- How this works: It reads current DOM or form values, leans on helpers like `setThemeToggleButtonState`, uses shared state such as `setThemeToggleButtonState`, toggles CSS classes to reflect current state, and reads or writes browser storage.
- What this helps with: It helps the interface enforce the right rule at the exact place the user feels it. In theme code, that also improves preference persistence.
- Key inputs: `theme` is an input value the function uses. `persist` is an input value the function uses.
- Key dependencies: This function calls helpers such as `setThemeToggleButtonState`, touches shared runtime values like `setThemeToggleButtonState`.
- Return or side effects: It works mainly through side effects, especially CSS class changes, browser storage writes.

#### `initializeThemeToggle()`

- Defined at: line 36
- What this is: This is the main setup function for the theme toggle flow in the home layer. It also matters for visual consistency and saved theme preference behavior.
- Why this is used: It exists so one-time setup stays in one place.
- How this works: It leans on helpers like `getStoredTheme`, `getSystemTheme`, `applyTheme`, `getActiveTheme` and wires listeners for later user actions.
- What this helps with: It helps the feature become usable as soon as the page loads. In theme code, that also improves preference persistence.
- Key inputs: This function does not take direct parameters; it mainly uses surrounding state, cached DOM references, or globals.
- Key dependencies: This function calls helpers such as `getStoredTheme`, `getSystemTheme`, `applyTheme`, `getActiveTheme`, depends on browser media-query support.
- Return or side effects: It works mainly through side effects, especially listener registration.

#### `syncWithSystemTheme(event)`

- Defined at: line 48
- What this is: This keeps the with system theme synchronized across related state. It also matters for visual consistency and saved theme preference behavior.
- Why this is used: It exists so related values do not drift apart.
- How this works: It leans on helpers like `getStoredTheme`, `applyTheme`.
- What this helps with: It helps the feature behave like one coherent workflow instead of separate disconnected pieces. In theme code, that also improves preference persistence.
- Key inputs: `event` is the browser event object.
- Key dependencies: This function calls helpers such as `getStoredTheme`, `applyTheme`.
- Return or side effects: Mostly returns a derived value or prepared structure back to the caller.

### Important Inline Callbacks

#### Inline Callback At Line 41

- Source marker: `themeToggleBtn.addEventListener("click", () => {`
- What this is: This is the inline click listener attached to `themeToggleBtn`.
- Why this is used: It stays beside the event registration so the trigger and reaction are easy to read together.
- How this works: When the browser fires that event, the callback reads closure state, performs the local UI action, and may call named helpers for heavier work.
- What this helps with: It helps the interface respond directly to user input without creating another global helper.

## Closing Notes

- The home scripts are organized around public browsing, theme handling, featured-room discovery, map exploration, and room-detail display.
- The dashboard scripts are organized around employee flows, admin flows, and shared shell behavior such as theme, header, nav, modal management, and participant selection.
- The core scripts hold reusable pieces such as configuration, state, formatting, DOM helpers, API requests, and pagination.
