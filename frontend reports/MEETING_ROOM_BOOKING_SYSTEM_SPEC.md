# Meeting Room Booking System Specification

## 1. Purpose

This document describes the current implemented behavior of the meeting room booking system.

It covers:

- roles and responsibilities
- authorization rules
- API scope
- database model
- validations
- business rules
- booking lifecycle rules
- participant and availability rules
- schedule rules
- audit and logging behavior
- frontend behavior that enforces or reflects those rules

This is a code-driven specification based on the current implementation in the repository, not a future-state product wish list.

## 2. Source of Truth

Primary implementation files:

- `backend/src/controllers/booking.controller.js`
- `backend/src/controllers/employee.controller.js`
- `backend/src/controllers/room.controller.js`
- `backend/src/controllers/auth.controller.js`
- `backend/src/controllers/admin.controller.js`
- `backend/src/routes/*.routes.js`
- `backend/src/middleware/requireAuth.js`
- `backend/src/middleware/rolecheck.js`
- `backend/src/middleware/authRateLimit.js`
- `backend/src/utils/password.js`
- `backend/src/utils/logger.js`
- `database/database1.sql`
- `database/migrations/2026-03-04-security-hardening-and-booking-audit.sql`
- `database/migrations/2026-03-05-employee-table-altering.sql`
- `database/migrations/2026-03-06-booking-participants-and-employee-active.sql`
- `frontend/js/entry/dashboard-entry.js`
- `frontend/js/dashboard/shared/init/dashboard-init.js`
- `frontend/js/dashboard/employee/bookings/bookings-load.js`
- `frontend/js/dashboard/employee/modals/booking-edit-modal.js`
- `frontend/js/dashboard/employee/modals/room-booking-modal.js`
- `frontend/js/dashboard/employee/modals/room-schedule-modal.js`
- `frontend/js/dashboard/admin/employees/employee-directory.js`
- `frontend/js/dashboard/admin/rooms/room-directory.js`
- `frontend/js/dashboard/admin/reports/admin-reports.js`
- `frontend/js/dashboard/shared/header/header-profile.js`
- `frontend/dashboards/employee-dashboard.html`
- `frontend/dashboards/admin-dashboard.html`

## 3. System Scope

The system manages:

- employee authentication
- employee and admin dashboards
- meeting room discovery and availability lookup
- meeting booking creation
- booking editing
- booking cancellation
- ongoing meeting vacate flow
- participant invitations
- employee availability checks
- invited-user visibility of bookings
- room schedule board for the next 7 days
- admin reporting
- booking audit logging

## 4. Core Roles

### 4.1 Employee

An authenticated non-admin user can:

- log in and log out
- view their own profile through `/api/auth/me`
- change their own password
- search active employees for booking participants
- view bookings where they are:
  - the organizer, or
  - an invited participant
- create a booking for themselves
- edit or cancel only bookings they organize
- vacate only bookings they organize and that are currently ongoing
- view booking details for bookings they are invited to
- use the room schedule board to choose an available slot

An authenticated non-admin user cannot:

- create bookings on behalf of another employee
- edit or cancel another organizer's booking
- vacate another organizer's booking
- access admin employee management endpoints
- access admin reports endpoint

### 4.2 Organizer

Organizer is a booking role, not a separate account type.

An organizer is the employee stored in `booking.employee_id`.

Organizer responsibilities:

- owns the booking
- is always counted as an attendee
- can edit future active bookings
- can cancel future active bookings
- can vacate ongoing active bookings
- can manage the participant list on create and update

Organizer-specific business rules:

- organizer is implicit and must not be duplicated in `participant_employee_ids`
- organizer availability is checked exactly like participant availability
- organizer cannot have overlapping meetings

### 4.3 Participant / Invited Employee

A participant is stored in `booking_participants.employee_id`.

Participant rights:

- can see the booking in My Bookings
- can view booking details
- sees organizer information
- sees booking status and time

Participant restrictions:

- cannot edit the booking
- cannot cancel the booking
- cannot vacate the booking
- cannot modify the participant list

### 4.4 Admin

An admin is any employee where `employee.is_admin = 1`.

Admin responsibilities and permissions:

- all authenticated employee capabilities
- can create bookings on behalf of another employee by passing `employee_id` in create payload
- can edit any booking
- can cancel any booking
- can vacate any ongoing booking
- can view any booking details
- can fetch all bookings in list and summary/report views
- can list employees
- can create employees
- can delete employees except their own account
- can access booking reports

### 4.5 System / Backend

The backend is responsible for:

- final validation enforcement
- permission enforcement
- room overlap prevention
- employee overlap prevention
- participant normalization
- audit persistence
- structured booking event logging
- exposing schedule and availability data

### 4.6 Frontend

The frontend is responsible for:

- collecting user input
- pre-validating required fields
- pre-validating participant capacity and availability
- disabling unavailable employees in the picker
- showing organizer/invited labels
- rendering schedule data for room selection
- keeping edit flows view-only when the user lacks booking management rights

The frontend is not the source of truth. The backend is.

## 5. Role and Permission Matrix

| Capability                          | Employee                    | Organizer | Participant | Admin            |
| ----------------------------------- | --------------------------- | --------- | ----------- | ---------------- |
| Log in                              | Yes                         | Yes       | Yes         | Yes              |
| Change own password                 | Yes                         | Yes       | Yes         | Yes              |
| View own bookings                   | Yes                         | Yes       | Yes         | Yes              |
| View invited bookings               | Yes                         | Yes       | Yes         | Yes              |
| View booking detail when invited    | Yes                         | Yes       | Yes         | Yes              |
| Create booking for self             | Yes                         | Yes       | Yes         | Yes              |
| Create booking for another employee | No                          | No        | No          | Yes              |
| Edit future active booking          | Only own organized bookings | Yes       | No          | Yes              |
| Cancel future active booking        | Only own organized bookings | Yes       | No          | Yes              |
| Vacate ongoing booking              | Only own organized bookings | Yes       | No          | Yes              |
| Modify participant list             | Only own organized bookings | Yes       | No          | Yes              |
| View all bookings                   | No                          | No        | No          | Yes              |
| View reports                        | No                          | No        | No          | Yes              |
| Search active employees for booking | Yes                         | Yes       | Yes         | Yes              |
| Create employee                     | No                          | No        | No          | Yes              |
| Delete employee                     | No                          | No        | No          | Yes, except self |

## 6. Domain Model

### 6.1 `employee`

Key fields:

- `employee_id`
- `name`
- `email`
- `department`
- `gender`
- `is_admin`
- `is_active`
- `password`
- `password_reset_required`
- `password_updated_at`
- `last_login_at`
- `role`
- `project`
- `manager_id`
- `work_location_id`
- `phone_number`
- `hire_date`
- `employee_type`

Important rules:

- `email` is unique
- `is_active = 1` is required for participant search and booking attendee validation
- manager and location are nullable foreign keys

### 6.2 `location`

Key fields:

- `location_id`
- `name`
- `address`
- `timezone`

Used for:

- room grouping
- room display
- booking display timezone formatting

### 6.3 `meeting_room`

Key fields:

- `room_id`
- `location_id`
- `name`
- `capacity`
- `size_sqft`
- `has_projector`
- `has_screen`
- `has_whiteboard`
- `description`

Important rules:

- room name is unique per location
- `capacity > 0`

### 6.4 `booking`

Key fields:

- `booking_id`
- `room_id`
- `employee_id` - organizer
- `title`
- `description`
- `start_time`
- `end_time`
- `status`
- `created_at`
- `updated_at`

Important rules:

- `end_time > start_time`
- organizer is stored directly on booking
- room overlap checks use only `confirmed` and `pending`
- employee overlap checks use only `confirmed` and `pending`

### 6.5 `booking_participants`

Key fields:

- `booking_participant_id`
- `booking_id`
- `employee_id`
- `added_by_employee_id`
- `created_at`

Important constraints:

- unique `(booking_id, employee_id)`
- index on `employee_id`
- index on `booking_id`
- FK to `booking` with `ON DELETE CASCADE`
- FK to `employee` with `ON DELETE CASCADE`
- FK to `added_by_employee_id` with `ON DELETE SET NULL`

Meaning:

- this table stores invited attendees excluding the organizer
- if an employee is deleted, participant rows are deleted automatically
- if a booking is deleted, participant rows are deleted automatically

### 6.6 `booking_audit`

Key fields:

- `audit_id`
- `booking_id`
- `action`
- `actor_employee_id`
- `previous_status`
- `new_status`
- `previous_start_time`
- `previous_end_time`
- `new_start_time`
- `new_end_time`
- `metadata`
- `created_at`

Supported actions:

- `created`
- `updated`
- `cancelled`
- `vacated`

Purpose:

- preserve a server-side audit trail for booking lifecycle changes

## 7. Booking Status Model

Supported statuses:

- `confirmed`
- `pending`
- `cancelled`
- `vacated`

### 7.1 Status Meaning

`confirmed`

- active booking
- blocks room
- blocks organizer and participant availability

`pending`

- active booking from an availability perspective
- blocks room
- blocks organizer and participant availability
- counted in several summary/report queries

`cancelled`

- inactive booking
- does not block room availability
- does not block employee availability
- view-only

`vacated`

- booking ended early
- does not block future room availability beyond the shortened `end_time`
- not editable
- not cancellable
- view-only after vacate

### 7.2 Status Transition Rules

| From          | To            | Allowed                      | Notes                                             |
| ------------- | ------------- | ---------------------------- | ------------------------------------------------- |
| `confirmed` | `cancelled` | Yes                          | Only future bookings, organizer or admin          |
| `pending`   | `cancelled` | Yes                          | Only future bookings, organizer or admin          |
| `confirmed` | `vacated`   | Yes                          | Only while ongoing, organizer or admin            |
| `pending`   | `vacated`   | Yes                          | Only while ongoing, organizer or admin            |
| `cancelled` | anything      | No through current endpoints | Cancelled bookings are immutable in current flows |
| `vacated`   | anything      | No through current endpoints | Vacated bookings are immutable in current flows   |

### 7.3 Important Implementation Note

The create endpoint currently accepts `status` values:

- `confirmed`
- `pending`
- `cancelled`

The UI currently creates bookings as `confirmed`.

## 8. Authentication and Session Rules

### 8.1 Login

Endpoint:

- `POST /api/auth/login`

Requirements:

- `email` required
- `password` required

Behavior:

- email is trimmed and lowercased
- user is looked up by email
- password is verified
- successful login returns employee payload and sets auth cookie
- if stored password is legacy plaintext, the system:
  - upgrades it to bcrypt
  - sets `password_reset_required = 1`
  - updates `password_updated_at`
  - updates `last_login_at`

Failure responses:

- `400` when email or password missing
- `401` when credentials invalid
- `429` when auth rate limit exceeded

### 8.2 Logout

Endpoint:

- `POST /api/auth/logout`

Rules:

- requires authentication
- clears auth cookie

### 8.3 Current User

Endpoint:

- `GET /api/auth/me`

Rules:

- requires authentication
- reloads employee data from database
- clears auth cookie and returns `401` if authenticated employee no longer exists

### 8.4 Change Password

Endpoint:

- `POST /api/auth/change-password`

Requirements:

- `current_password` required
- `new_password` required

Validation rules:

- new password must differ from current password
- minimum length 8
- must include at least one lowercase letter
- must include at least one uppercase letter
- must include at least one number
- must include at least one special character

Behavior:

- verifies current password
- updates hash
- sets `password_reset_required = 0`
- updates `password_updated_at`
- refreshes auth token cookie

### 8.5 Auth Transport

The backend accepts auth token from:

- signed auth cookie, or
- `Authorization: Bearer <token>`

### 8.6 Auth Middleware Rules

`requireAuth`:

- rejects requests with no valid token
- rejects invalid or expired token
- injects `req.user` with:
  - `employee_id`
  - `email`
  - `name`
  - `department`
  - `gender`
  - `is_admin`
  - `password_reset_required`

`requireAdmin`:

- rejects any authenticated non-admin with `403`

### 8.7 Authentication Rate Limit

The auth rate limiter applies to:

- login
- change password

Current implementation:

- window: 15 minutes
- max attempts: 10
- keyed by IP plus email when available
- returns `429` with `Retry-After`

## 9. API Surface Summary

### 9.1 Public Endpoints

- `GET /api/health`
- `GET /api/locations`
- `GET /api/rooms`
- `GET /api/rooms/:roomId`

### 9.2 Authenticated Endpoints

- `POST /api/auth/logout`
- `GET /api/auth/me`
- `POST /api/auth/change-password`
- `GET /api/employees/search`
- `GET /api/rooms/:roomId/schedule`
- all `/api/bookings/*`

### 9.3 Admin-Only Endpoints

- `GET /api/bookings/reports`
- `GET /api/admin/employees`
- `POST /api/admin/employees`
- `DELETE /api/admin/employees/:employeeId`

## 10. Room Discovery and Availability Rules

### 10.1 Room Search Endpoint

Endpoint:

- `GET /api/rooms`

Supported filters:

- `location_id`
- `capacity`
- `limit`
- `available_only`
- `start_time`
- `end_time`

Validation rules:

- if `start_time` is present, `end_time` must also be present
- if `end_time` is present, `start_time` must also be present
- both timestamps must parse successfully
- `end_time` must be greater than `start_time`
- `limit` maximum is 100

Behavior without time range:

- returns rooms with `is_available = 1`
- `booked_until = null`

Behavior with time range:

- joins bookings that overlap the requested range
- considers only booking statuses `confirmed` and `pending`
- marks room unavailable when at least one overlap exists
- optionally filters to available rooms only using `available_only=1`

Overlap formula:

- existing booking overlaps requested slot when:
  - `existing.start_time < requested.end_time`
  - and `existing.end_time > requested.start_time`

### 10.2 Room Detail Endpoint

Endpoint:

- `GET /api/rooms/:roomId`

Validation:

- room id must be a positive integer

Response behavior:

- returns room metadata
- returns `404` if room not found

## 11. Room Schedule Rules

### 11.1 Endpoint

- `GET /api/rooms/:roomId/schedule`

Auth:

- requires authentication

### 11.2 Schedule Range Rules

Inputs:

- `days`
- `start_time`
- `end_time`

Validation:

- room id must be valid
- `start_time` and `end_time` must be supplied together if either is supplied
- both timestamps must parse
- `end_time` must be greater than `start_time`

Defaults:

- if no explicit range is supplied:
  - schedule starts at start of current UTC day
  - schedule ends after `days`
- default days: 7
- maximum days: 14

### 11.3 Schedule Data Rules

Schedule endpoint returns:

- room metadata
- range metadata
- bookings in the requested range

Only these statuses appear as blocking schedule entries:

- `confirmed`
- `pending`

### 11.4 Working-Hour Rules

Current schedule working window:

- `10:00` to `19:00`

Frontend schedule board presentation:

- timezone label: `IST`
- working hours shown as `10:00 AM - 7:00 PM`
- next 7 days shown
- Saturday and Sunday visually marked as `Holiday`
- Monday and Friday visually marked as `WFH`

### 11.5 UI Schedule Behavior

The schedule modal:

- shows available and booked slots
- displays title, organizer, and meeting time for booked slots
- allows selecting an available slot
- fills Room Finder date, time, and duration when a slot is selected
- refreshes participant availability after slot selection
- refreshes room search after slot selection

## 12. Employee Search and Participant Directory Rules

### 12.1 Endpoint

- `GET /api/employees/search`

Auth:

- requires authentication

### 12.2 Search Filters

Supported query params:

- `q`
- `limit`
- `department`
- `project`
- `role`
- `work_location_id`
- `exclude_booking_id`
- `start_time`
- `end_time`

### 12.3 Validation Rules

- `start_time` and `end_time` must appear together
- both timestamps must parse
- `end_time` must be greater than `start_time`
- `limit` default 20, maximum 500

### 12.4 Search Population Rules

Search includes only:

- active employees where `is_active = 1`

Returned fields include:

- `employee_id`
- `name`
- `email`
- `department`
- `project`
- `role`
- `employee_type`
- `work_location_id`
- `work_location_name`
- availability fields

### 12.5 Availability Rules in Employee Search

If `start_time` and `end_time` are supplied:

- each employee is checked for conflicts as organizer
- each employee is checked for conflicts as participant
- only `confirmed` and `pending` bookings count as conflicts
- one earliest conflict row is returned per employee

Returned availability metadata includes:

- `is_available`
- `conflicting_booking_id`
- `conflicting_booking_title`
- `conflicting_start_time`
- `conflicting_end_time`
- `conflicting_organizer_name`
- `conflicting_involvement_role`

If no time range is supplied:

- employees are returned as available by default

### 12.6 Frontend Participant Picker Rules

The picker currently supports:

- free-text search
- department filter
- project filter
- role filter
- location filter
- selected chips
- disabled unavailable employees
- availability colors

Picker behaviors:

- organizer is excluded from selectable suggestions
- already selected employees do not appear again
- unavailable employees appear disabled
- suggestions sort available employees before unavailable employees
- only up to 8 suggestions are shown at a time
- filters are populated from current employee directory results
- picker reloads when booking time changes

## 13. Booking Visibility Rules

Booking visibility is based on this logic for non-admin users:

- booking is visible if user is organizer
- booking is visible if user exists in `booking_participants`

This applies to:

- upcoming booking list
- booking summary
- booking detail access
- My Bookings UI

Admin visibility rules:

- admin can view all bookings
- admin can optionally filter summary/list by a specific employee

## 14. Booking Read/List Rules

### 14.1 Upcoming / My Bookings List

Endpoint:

- `GET /api/bookings/upcoming`

Supported params:

- `limit`
- `employee_id`
- `include_past`
- `include_cancelled`

Rules:

- default limit is 20
- max limit is 200
- by default only future bookings are returned
- when `include_past=1`, past bookings are included
- when `include_cancelled=1`, cancelled bookings are included

Returned fields include:

- `booking_id`
- `title`
- `description`
- `start_time`
- `end_time`
- `status`
- `employee_id`
- `organizer_employee_id`
- `employee_name`
- `organizer_name`
- `is_organizer`
- `participant_count`
- room and location metadata

### 14.2 Booking Summary

Endpoint:

- `GET /api/bookings/summary`

Summary includes:

- total bookings
- rooms booked today
- upcoming meetings
- upcoming meetings in next 7 days
- open requests
- utilization percent
- booked hours in week

Visibility:

- admin sees global totals unless filtered elsewhere
- employee summary is scoped to visible bookings

Important implementation note:

- utilization assumes a 9-hour workday per room
- current formula: `total rooms * 9 * 60`

### 14.3 Booking Detail

Endpoint:

- `GET /api/bookings/:bookingId`

Rules:

- booking id must be valid
- authenticated user must be:
  - admin, or
  - organizer, or
  - invited participant
- returns `404` when not found or not visible to non-admin

Detailed response includes:

- organizer fields
- `is_organizer`
- `participant_count`
- `participants` detailed list

Participant detail fields include:

- `booking_participant_id`
- `booking_id`
- `employee_id`
- `name`
- `email`
- `department`
- `added_by_employee_id`
- `added_by_name`
- `created_at`

## 15. Booking Create Rules

### 15.1 Endpoint

- `POST /api/bookings`

### 15.2 Required Inputs

Required fields:

- `room_id`
- `title`
- `description`
- `start_time`
- `end_time`

Optional fields:

- `employee_id`
- `participant_employee_ids`
- `status`

### 15.3 Create Authorization Rules

Non-admin:

- organizer is forced to authenticated employee
- cannot create on behalf of another employee

Admin:

- may create on behalf of another employee using `employee_id`
- if `employee_id` not supplied, defaults to authenticated admin

### 15.4 Field Validation Rules

`room_id`

- must be positive integer

`title`

- trimmed
- must not be blank

`description`

- trimmed
- must not be blank

`start_time` and `end_time`

- must parse into valid timestamps
- `end_time` must be greater than `start_time`
- start time must not be in the past beyond grace window

`status`

- allowed values on create:
  - `confirmed`
  - `pending`
  - `cancelled`

### 15.5 Past-Time Rule

The system rejects booking create when:

- start time is in the past beyond the 1-minute grace window

Current grace constant:

- 60 seconds

### 15.6 Participant Payload Rules

`participant_employee_ids` rules:

- optional
- must be an array if provided
- every item must be a positive integer
- duplicates are removed
- organizer id is removed if supplied
- result is normalized before further validation

The system also tracks:

- whether duplicates were removed
- whether organizer was excluded from participants

### 15.7 Attendee Validation Rules

Organizer validation:

- organizer must exist
- organizer must be active

Participant validation:

- every participant must exist
- every participant must be active
- any invalid or inactive participant rejects the request

### 15.8 Capacity Rules

Total attendees are calculated as:

- `1 organizer + participant count`

Business rule:

- total attendees must not exceed room capacity

If exceeded:

- request is rejected with `400`

### 15.9 Room Conflict Rule

The system prevents overlapping room bookings for:

- `confirmed`
- `pending`

If a room overlap exists:

- request is rejected with `409`

### 15.10 Employee Conflict Rule

The system prevents overlapping employee participation across all attendees.

Conflict check includes:

- organizer's other bookings as organizer
- organizer's other bookings as participant
- participant bookings as organizer
- participant bookings as participant

Result:

- no attendee may be double-booked

If conflicts exist:

- request is rejected with `409`
- response includes a human-readable message
- response includes conflict detail list

### 15.11 Conflict Message Behavior

Examples of backend conflict messaging:

- organizer conflict:
  - user is told they are not available because they already have another meeting
- single participant conflict:
  - employee name is called out directly
- multiple participant conflicts:
  - response says some selected employees are not available and previews names

### 15.12 Transaction and Locking Rules on Create

Create booking uses a DB transaction.

It locks:

- organizer and participant employee rows using `FOR UPDATE`
- target room row using `FOR UPDATE`
- conflicting room bookings using `FOR UPDATE`

Purpose:

- reduce race conditions during concurrent booking attempts

### 15.13 Post-Create Side Effects

On success:

- inserts booking row
- inserts participant rows
- inserts booking audit row with `created`
- logs structured `booking_created`

Audit metadata includes:

- participant count
- total attendees
- participant ids
- whether organizer was removed from participant list
- whether duplicates were removed

## 16. Booking Update Rules

### 16.1 Endpoint

- `PATCH /api/bookings/:bookingId`

### 16.2 Update Authorization Rules

Allowed only for:

- organizer of the booking
- admin

Denied for:

- invited participant
- unrelated employee

### 16.3 Update Scope

Current update endpoint can change:

- `title`
- `description`
- `start_time`
- `end_time`
- `participant_employee_ids`

Current update endpoint does not change:

- `room_id`
- organizer
- booking status

### 16.4 Update Preconditions

- booking id must be valid
- booking must exist
- booking must not be `cancelled`
- booking must not be `vacated`
- updated start time must still be future-oriented

### 16.5 Partial Update Behavior

If some fields are omitted:

- missing title falls back to existing title
- missing description falls back to existing description
- missing start/end fall back to existing times
- missing participant list means existing participants remain unchanged

### 16.6 Update Validation Rules

All major create validations are re-applied:

- required resulting title and description must still be non-blank
- resulting end time must be after start time
- participant payload must be valid if provided
- participants must be valid and active if participant list is provided
- room capacity must not be exceeded if participant list is provided
- room must not overlap another active booking
- organizer and participants must all be available

### 16.7 Update Conflict Rule

When checking conflicts during update:

- current booking is excluded from room overlap check
- current booking is excluded from employee conflict check

### 16.8 Participant Sync Rules

If participant list is provided:

- existing participants are loaded
- removed participants are deleted
- new participants are inserted
- unchanged participants are retained

If participant list is not provided:

- participant list remains unchanged

### 16.9 Update Audit and Logging

On successful update:

- booking row is updated
- audit row is inserted with action `updated`
- participant update event is logged when participant list changes

Audit metadata may include:

- participant count
- added participant ids
- removed participant ids
- duplicate removal flag
- organizer exclusion flag

Structured log `booking_participants_updated` includes:

- booking id
- actor employee id
- added employee ids
- removed employee ids
- participant count before
- participant count after

## 17. Booking Cancel Rules

### 17.1 Endpoint

- `PATCH /api/bookings/:bookingId/cancel`

### 17.2 Authorization

Allowed only for:

- organizer
- admin

### 17.3 Cancel Preconditions

- booking id must be valid
- booking must exist
- booking must not be `vacated`
- booking must be future booking

### 17.4 Cancel Behavior

If already cancelled:

- returns success-style response saying booking already cancelled

If booking is future active booking:

- status becomes `cancelled`
- audit row is created

If booking already started:

- request is rejected

### 17.5 Cancel Business Rule

Only future bookings can be cancelled.

## 18. Booking Vacate Rules

### 18.1 Endpoint

- `PATCH /api/bookings/:bookingId/vacate`

### 18.2 Authorization

Allowed only for:

- organizer
- admin

### 18.3 Vacate Preconditions

- booking id must be valid
- booking must exist
- booking must not be cancelled
- booking must be ongoing

### 18.4 Vacate Definition

Ongoing means:

- current time is greater than or equal to booking start
- current time is before booking end

### 18.5 Vacate Behavior

On successful vacate:

- `end_time` is updated to current time
- status becomes `vacated`
- audit row is inserted

If booking has not started yet:

- reject with message that only ongoing bookings can be vacated

If booking already ended:

- returns informational response that booking is already completed

If vacate happens too close to booking start:

- request may be rejected with "please try again in a few seconds"

## 19. Conflict Detection Rules

This is one of the most important business-rule areas in the system.

### 19.1 Conflict Scope

Conflict detection applies during:

- booking creation
- booking update
- participant list update
- employee search availability mode

### 19.2 Conflict Dimensions

The system checks:

- room conflict
- employee conflict

### 19.3 Room Conflict

Two bookings conflict for a room when:

- same room
- active statuses only: `confirmed` or `pending`
- time windows overlap

### 19.4 Employee Conflict

Two bookings conflict for an employee when:

- employee is organizer in one booking and overlaps another
- employee is participant in one booking and overlaps another
- employee is organizer in both
- employee is participant in both
- one side organizer and other side participant

### 19.5 Overlap Formula

Overlap is defined as:

- `existing.start < requested.end`
- `existing.end > requested.start`

This means:

- exact touching end-to-start boundaries are allowed
- true time overlap is not allowed

### 19.6 Statuses Considered for Conflicts

Conflict checks consider only:

- `confirmed`
- `pending`

Conflict checks ignore:

- `cancelled`
- `vacated`

### 19.7 Guarantee Provided

Business guarantee:

- no room may have two active overlapping bookings
- no employee may be scheduled into two overlapping active meetings

### 19.8 Database Enforcement Note

There is no native database exclusion constraint preventing overlaps.

The current guarantee is enforced by:

- transactional application logic
- `FOR UPDATE` locking on room and employee rows
- overlap queries before insert/update

## 20. Frontend Booking Rules

### 20.1 Room Booking Modal

The room booking modal currently supports:

- room image and room summary
- selected slot display
- organizer display
- attendee summary
- meeting name
- meeting description
- add employees picker
- schedule modal launch

### 20.2 Create-Flow Frontend Validation

Before submit, the frontend checks:

- room selected
- room currently available
- slot selected
- slot not in past beyond grace logic
- meeting title present
- meeting description present
- participant count within capacity
- participant availability valid

Frontend create payload includes:

- `room_id`
- `title`
- `description`
- `start_time`
- `end_time`
- `status: "confirmed"`
- `participant_employee_ids`
- `employee_id` for current user when available in client context

### 20.3 Edit Modal Behavior

Booking edit modal has two modes:

- `edit`
- `view`

`edit` mode is available only for:

- future active bookings
- organizer or admin

`view` mode is used for:

- invited attendees
- completed bookings
- cancelled bookings
- vacated bookings

### 20.4 Edit-Flow Frontend Validation

Before update submit, the frontend checks:

- valid date, time, and duration
- future slot
- title present
- description present
- participant count within capacity
- participant availability valid

### 20.5 My Bookings UI Rules

My Bookings includes:

- organizer-owned meetings
- invited meetings

Labels:

- organizer sees role label `Organizer`
- invited employee sees role label `Invited`

Organizer display:

- organizer sees `You`
- invited employee sees actual organizer name

### 20.6 Action Availability in UI

`Edit` and `Cancel` are shown when:

- booking is future
- booking status is active
- user can manage booking

`Vacate` is shown when:

- booking is ongoing
- booking status is active
- user can manage booking

`View` is shown when:

- booking is not manageable by current user
- booking is completed
- booking is cancelled
- booking is vacated

### 20.7 Participant Picker UX Rules

UI rules enforced client-side:

- organizer cannot be added
- duplicates cannot be added
- unavailable employees cannot be added
- attendee total cannot exceed room capacity
- error messages are shown inline
- suggestions are searchable and filterable
- suggestions include availability hint text when unavailable

### 20.8 Availability Coloring

Participant suggestions visually distinguish:

- available employees
- unavailable employees

Schedule slots visually distinguish:

- available slots
- booked slots

## 21. Admin Rules

### 21.1 Employee Management

Admin endpoints:

- `GET /api/admin/employees`
- `POST /api/admin/employees`
- `DELETE /api/admin/employees/:employeeId`

### 21.2 Admin Create Employee Rules

Required fields:

- `name`
- `email`
- `gender`
- `password`

Optional:

- `department`
- `is_admin`

Validation:

- email normalized to lowercase
- gender must be `male` or `female`
- password must satisfy password complexity rules
- email must be unique

Behavior:

- password is hashed with bcrypt
- `password_reset_required = 1` when supported by schema

### 21.3 Admin Delete Employee Rules

Rules:

- employee id must be valid
- admin cannot delete own account
- returns `404` if employee not found

Important cascade note:

- deleting an employee can cascade through bookings, participants, and audit records because of current FK design

### 21.4 Reporting Rules

Admin-only reports endpoint:

- `GET /api/bookings/reports`

Returns:

- summary counts
- booking counts by location for next 30 days
- upcoming booking list
- generation timestamp

## 22. Database Constraints and Integrity Rules

### 22.1 Existing Important Constraints

`booking`

- primary key on `booking_id`
- FK to `meeting_room`
- FK to `employee`
- check constraint `end_time > start_time`
- indexes:
  - `idx_booking_room_time`
  - `idx_booking_employee`

`meeting_room`

- unique `(location_id, name)`
- check `capacity > 0`

`employee`

- unique `email`

`booking_participants`

- unique `(booking_id, employee_id)`
- indexes on booking, employee, added_by

`booking_audit`

- indexed by booking and actor with `created_at`

### 22.2 Integrity Guarantees

The schema plus backend logic currently guarantee:

- no duplicate participant row for the same booking
- no orphan participant rows after booking deletion
- no orphan audit rows after booking deletion
- no attendee count beyond room capacity when create/update validations are used
- no blank title/description in create/update API flows

### 22.3 What Is Enforced in App Instead of DB

These rules are enforced in application logic, not as DB-native constraints:

- no overlapping room bookings
- no overlapping employee schedules
- only active employees can be organizers or participants in new flows
- invited employees are view-only
- only future bookings can be cancelled
- only ongoing bookings can be vacated

## 23. Audit and Logging Rules

### 23.1 Booking Audit Table

The system attempts to write audit records for:

- booking created
- booking updated
- booking cancelled
- booking vacated

Audit insert is tolerant of migration mismatch:

- if table or field is missing and MySQL returns schema error, the code safely skips audit write

### 23.2 Structured App Logs

Current structured logs include:

- `booking_created`
- `booking_participants_updated`
- request logs
- CORS blocked warnings

Logger format:

- JSON lines
- includes timestamp, level, message, and metadata

### 23.3 Audit Metadata Examples

Create metadata may include:

- participant count
- total attendees
- participant ids
- organizer removed from participants
- duplicate participants removed

Update metadata may include:

- participant count
- participant added ids
- participant removed ids
- duplicate participants removed
- organizer removed from participants

## 24. Error Model

Common response status patterns:

`400`

- invalid payload
- invalid ids
- bad timestamp format
- end time not after start time
- past-time violation
- capacity violation
- immutable-state violation

`401`

- authentication missing
- invalid or expired token
- invalid authenticated user
- incorrect current password

`403`

- admin access required
- user lacks permission to manage booking

`404`

- booking not found
- room not found
- employee not found

`409`

- room already booked for selected slot
- organizer or participant scheduling conflict
- duplicate employee email on admin create

`429`

- too many authentication attempts

## 25. Business Rule Summary Checklist

### 25.1 Booking Creation

- organizer must be authenticated
- organizer can be overridden only by admin
- room must exist
- organizer must be active
- participants must be active
- title required
- description required
- valid timestamps required
- end after start required
- start cannot be in past
- room capacity cannot be exceeded
- room overlap forbidden
- employee overlap forbidden
- organizer excluded from participant list
- duplicate participants removed
- audit written

### 25.2 Booking Update

- booking must exist
- only organizer or admin may update
- cancelled and vacated bookings cannot be updated
- time changes must remain future-oriented
- room overlap forbidden
- employee overlap forbidden
- participants validated if supplied
- participant sync add/remove applied
- audit written

### 25.3 Booking Cancel

- only organizer or admin
- only future booking
- cancelled booking stays cancelled
- vacated booking cannot be cancelled

### 25.4 Booking Vacate

- only organizer or admin
- only ongoing booking
- cancelled booking cannot be vacated
- completed booking cannot be vacated again
- vacate shortens end time to now

### 25.5 Participant Rules

- organizer is implicit attendee
- organizer cannot be added as participant
- duplicate participants are removed
- inactive participants rejected
- participant availability required
- participant visibility grants booking detail access

### 25.6 Visibility Rules

- organizer can see booking
- invited participant can see booking
- invited participant can view details
- invited participant cannot edit/cancel/vacate
- admin can see everything

### 25.7 Schedule Rules

- next 7 days by default
- max 14 days from API
- 10 AM to 7 PM working window for schedule board
- available slots selectable
- booked slots informational

## 26. Known Implementation Notes and Caveats

### 26.1 Public vs Auth-Protected Room APIs

Current routing makes:

- room list public
- room detail public
- room schedule authenticated

If the intended product rule is that all room discovery should be authenticated, the routes would need tightening.

### 26.2 Create Endpoint Accepts `cancelled`

The current create endpoint allows `status = cancelled`.

This is implemented, but the normal UI flow does not use it.

### 26.3 Summary Utilization Uses 9-Hour Day

The schedule board and reporting both align to a 9-hour workday, but the schedule UI specifically presents it as:

- `10:00 AM - 7:00 PM IST`

### 26.4 Timezone Handling

Backend booking timestamps are normalized in UTC-style MySQL datetime handling.

UI display behavior:

- booking tables use room location timezone for display
- room schedule board is currently presented in IST in the dashboard experience

### 26.5 Soft vs Hard Visibility

The visibility model is implemented in query filters, not in a dedicated policy layer.

### 26.6 No Native Overlap Constraint

Schedule safety depends on application logic and locking, not on database-native exclusion constraints.

## 27. Recommended Use of This Document

Use this document when:

- onboarding new developers
- reviewing booking-related bugs
- validating whether a new feature matches current rules
- preparing QA test cases
- writing future admin, booking, or scheduling enhancements
- discussing permission changes for invited participants

## 28. Short Executive Summary

The current system is a multi-role room booking platform where:

- employees can create and manage only their own bookings
- admins can manage all bookings and employees
- invited participants can view but not manage bookings
- participant lists are stored separately from organizers
- room conflicts and employee conflicts are both prevented
- availability checks cover organizer and participant involvement
- the frontend pre-validates availability and capacity, but the backend is authoritative
- audit and structured logging exist for booking lifecycle changes
- the room schedule board provides a 7-day forward-looking availability view with slot selection support
