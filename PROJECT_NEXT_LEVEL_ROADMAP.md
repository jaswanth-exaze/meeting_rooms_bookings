# Meeting Rooms Booking - Next Level Roadmap

## Goal
Turn the current project into a reliable, scalable, enterprise-ready room booking platform without breaking existing flows.

## Current Baseline (Already Good)
- Role-based access (`employee`, `admin`) and protected routes.
- Core booking lifecycle: create, update, cancel, vacate.
- Room finder with date/time/location/capacity filters.
- Security foundations: JWT cookie auth, password policy, rate limiting, CORS allowlist, security headers.
- Basic tests for env config and password utilities.

## Priority Framework
Use this order for decisions:
1. Reduce booking mistakes and conflicts.
2. Improve user productivity and adoption.
3. Strengthen security and operational reliability.
4. Scale for more users/locations.

---

## Phase 1 (0-30 days): High Impact, Low Risk

### 1) Booking Rules and Safety
- Add booking buffer rules (example: 5-10 minutes cleanup between meetings).
- Enforce business rules per room (max duration, allowed booking hours).
- Add "cannot double-book" hard checks in DB transaction layer.

Why:
- Prevents real-world scheduling conflicts and operational chaos.

### 2) Better User Communication
- Add email notifications for booking created/updated/cancelled.
- Add reminders (15 minutes before meeting).
- Show clear reason messages for failed booking attempts.

Why:
- Reduces no-shows and confusion.

### 3) Quick Product Wins
- Recurring bookings (daily/weekly) with conflict preview.
- Favorite rooms / recently used rooms.
- "Book again" from previous meetings.

Why:
- Speeds up repeat usage immediately.

### 4) Engineering Hygiene
- Add API validation middleware for all write endpoints.
- Add test coverage for booking conflicts and auth flows.
- Add centralized error codes for frontend-friendly handling.

Why:
- Fewer regressions and faster development.

---

## Phase 2 (31-60 days): Product Depth and Admin Control

### 5) Smart Availability Features
- Waitlist when room is unavailable.
- Auto-release room if no check-in within X minutes.
- Alternative room suggestions (same time/capacity/features).

Why:
- Converts failed searches into successful bookings.

### 6) Admin Features for Real Operations
- Room maintenance blocks (planned downtime).
- Floor/zone-based management.
- Approval workflow for premium rooms or long-duration bookings.

Why:
- Matches real office governance needs.

### 7) Reporting and Insights
- Occupancy heatmaps by day/time.
- No-show report and cancellation trend report.
- Team-wise usage and utilization score.

Why:
- Helps leadership optimize office space usage.

---

## Phase 3 (61-90 days): Enterprise Readiness

### 8) Security and Identity Maturity
- SSO integration (Google Workspace / Microsoft Entra).
- MFA for admin accounts.
- Audit trail export for compliance.

Why:
- Required for larger organizations.

### 9) Scalability and Reliability
- Move rate-limit store from in-memory `Map` to Redis.
- Add background job queue (emails/reminders/retries).
- Add DB indexes tuned for booking search windows.
- Add request correlation ID and structured monitoring dashboards.

Why:
- Stable behavior under higher load and multiple server instances.

### 10) Integration Ecosystem
- Google Calendar / Outlook sync.
- Slack / Teams notifications.
- Optional meeting room display panel mode.

Why:
- Deeply integrates with how teams already work.

---

## Recommended Features Backlog (Ranked)

| Rank | Feature | Value | Effort | Notes |
|---|---|---|---|---|
| 1 | Recurring bookings with conflict preview | High | Medium | Immediate user value |
| 2 | Notifications + reminders | High | Medium | Reduces no-shows |
| 3 | Waitlist + alternative room suggestions | High | Medium | Improves conversion |
| 4 | Auto-release for no-show | High | Medium | Frees wasted room time |
| 5 | Maintenance blocks + admin controls | Medium | Medium | Important for operations |
| 6 | Calendar sync (Google/Outlook) | High | High | Strong adoption driver |
| 7 | SSO + MFA (admin first) | High | High | Enterprise requirement |
| 8 | Analytics dashboard v2 | Medium | Medium | Better planning decisions |

---

## Technical Recommendations (Specific to This Project)

### API and Data
- Add request schema validation (e.g., Joi/Zod) on all input-heavy routes.
- Wrap create/update booking in explicit DB transactions.
- Add DB constraints/indexes for frequent filters (`room_id`, `location_id`, `start_time`, `end_time`, `status`).
- Introduce API versioning (`/api/v1/...`) before large feature growth.

### Security
- Rate-limit by endpoint with env-based tuning (`window`, `max attempts`).
- Use Redis for shared rate limiting in multi-instance deployments.
- Add account lock strategy for suspicious login patterns (with safe unlock path).
- Add security event logging for auth failures and repeated 429 responses.

### Frontend UX
- Add optimistic loading + clearer inline validation.
- Add persistent saved filters per user.
- Add mobile-first improvements for booking flow and modals.

### Testing and Release
- Expand automated tests for:
  - Booking overlap edge cases
  - Timezone behavior
  - Role/authorization boundaries
  - Rate limit and lockout behavior
- Add CI pipeline for:
  - `npm run check`
  - `npm test`
  - basic smoke tests

---

## KPIs to Track (So You Know It Is Improving)
- Booking success rate (% searches that become bookings)
- Conflict failure rate
- No-show rate
- Average time to book a room
- Peak-time room utilization
- Login failure and 429 trend
- P95 API latency for room search and booking create

---

## Suggested Execution Model
- Keep a 2-week sprint cycle.
- Deliver one user-facing feature + one stability/security improvement each sprint.
- Do small releases frequently (avoid large risky drops).
- Maintain a short "rollback plan" note for each release.

---

## First 5 Items to Start Immediately
1. Recurring booking with conflict preview.
2. Notification/reminder service.
3. Booking transaction hardening + overlap tests.
4. Redis-backed rate limiting (config-driven).
5. Occupancy/no-show analytics dashboard v2.

If you follow this order, you get visible product value quickly while also making the system stronger for long-term growth.

---

## Big Features to Add (Next-Level Bets)

These are larger initiatives that can significantly raise product value and market quality.

### 1) AI Smart Booking Assistant
- Natural language booking: "Book a room for 8 people tomorrow at 3 PM in Hyderabad office."
- AI suggests best room based on capacity, equipment, past behavior, and travel distance.
- Smart conflict resolution suggestions when preferred slot is unavailable.

### 2) Full Calendar Ecosystem Sync
- Two-way sync with Google Calendar and Microsoft Outlook.
- Conflict-aware booking from external calendar events.
- Auto-update or cancel room booking when calendar invite changes.

### 3) Visitor and External Meeting Management
- Invite guests with pre-approved access flow.
- Visitor check-in/check-out linked to room booking.
- Security desk view for expected guest list by time slot.

### 4) Smart Check-In and No-Show Automation
- QR or kiosk-based room check-in.
- Auto-cancel reservation if no check-in within defined grace period.
- Instant re-release to waitlist users.

### 5) Unified Workplace Resource Booking
- Extend beyond meeting rooms: desks, parking slots, cafeteria tables, training labs.
- One booking engine for all workplace resources.
- Shared policy engine (time limits, approval rules, role permissions).

### 6) Multi-Office and Multi-Tenant Platform Mode
- Support multiple companies/offices in one deployment.
- Tenant-level branding, policies, and data isolation.
- Cross-location reporting for central ops teams.

### 7) Advanced Analytics and Forecasting
- Occupancy forecasting for next 30/60/90 days.
- "Underused room" and "overcrowded slot" predictions.
- AI recommendations for office planning and room resizing.

### 8) Enterprise Governance and Compliance Suite
- Custom approval workflows by room type, duration, and budget owner.
- Immutable audit logs and compliance export packs.
- Policy-as-code model for booking governance.

### 9) Real-Time Collaboration Integrations
- Slack/Teams bot for quick room booking and reminders.
- Instant occupancy updates in channels.
- Action buttons in chat for extend, cancel, or release room.

### 10) Digital Signage and IoT Integration
- Live room status on tablets outside rooms.
- Sensor-based occupancy detection (optional hardware).
- Auto-switch room state based on real occupancy signal.

---

## Suggested Order for Big Features
1. Calendar sync + Smart check-in/no-show automation.
2. AI smart booking assistant.
3. Unified workplace resource booking.
4. Advanced analytics and forecasting.
5. Multi-tenant mode + compliance suite + IoT/signage.

## Note
Start with features that improve booking reliability and utilization first (calendar sync, check-in automation), then move to AI and platform expansion.

---

## Add-On Feature: Multi-Employee Booking Visibility (Your Idea)

### Problem
Today one employee can book a room with capacity 5, but the other 4 members are not attached to that booking, so:
- they do not know the room was booked for them
- their dashboard does not show that meeting

### Phase 1 Scope (Implement Now)
Phase 1 is in-app visibility only (no email yet).

What Phase 1 must do:
1. While booking, organizer can add employees to the meeting.
2. Added employees must see that booking on their dashboard.
3. Organizer remains owner of booking actions (edit/cancel).
4. Validate attendee count against room capacity.

### Out of Scope for Phase 1 (Later)
- Email notifications
- RSVP (Accept/Decline)
- External guest invites

---

## Phase 1 - Clear Changes Required

### A) Database Changes
Create a new join table for booking participants.

Recommended table: `booking_participants`
- `booking_participant_id` (PK)
- `booking_id` (FK -> bookings.booking_id, ON DELETE CASCADE)
- `employee_id` (FK -> employees.employee_id, ON DELETE CASCADE)
- `added_by_employee_id` (FK -> employees.employee_id)
- `created_at` (timestamp default current)

Recommended constraints/indexes:
- Unique (`booking_id`, `employee_id`) to avoid duplicates.
- Index on `employee_id` for fast "my invited meetings" dashboard loads.
- Index on `booking_id` for booking detail views.

### B) Backend API Changes

#### 1) Booking create payload
Extend `POST /api/bookings` body:
- `participant_employee_ids: number[]` (optional)

Rules:
- Remove duplicates.
- Exclude organizer ID if sent (organizer is implicit attendee).
- Reject if any employee ID is invalid/inactive.
- Reject if total attendees (`1 + participant_employee_ids.length`) > room capacity.

#### 2) Booking update payload
Extend `PATCH /api/bookings/:bookingId`:
- allow participant list updates (same validations as create).

#### 3) Booking read/list queries
Update "my bookings" queries so a user sees bookings where:
- user is organizer, OR
- user exists in `booking_participants`.

Add response fields:
- `organizer_employee_id`
- `organizer_name`
- `is_organizer` (boolean for logged-in user)
- `participant_count`
- `participants` (optional detailed list in booking detail endpoints)

#### 4) Employee picker source
Add/enable an endpoint for active employee list usable by non-admin booking flow.
Suggested:
- `GET /api/employees/search?q=&limit=` (auth required)
or
- extend existing safe employee listing with minimal fields (`id`, `name`, `email`).

### C) Frontend Changes

#### 1) Room booking modal/form
Add "Add Employees" UI:
- multi-select dropdown or searchable chips input
- show selected employees as chips
- show attendee summary: `Attendees: organizer + selected = X / room capacity`

#### 2) Validation UX
Before submit:
- show inline error if attendee count exceeds capacity
- show inline error for invalid duplicate selection

#### 3) Dashboard visibility
In My Bookings table:
- include meetings where user is invited participant
- show a label:
  - `Organizer` for own bookings
  - `Invited` for bookings created by others
- show organizer name for invited meetings

### D) Authorization Rules
- Organizer (or admin) can edit/cancel booking and participant list.
- Invited employees can view details.
- Invited employees cannot change/cancel unless explicit future rule is added.

### E) Audit and Logging
Log participant changes:
- booking created with participant count
- participant added/removed on update
- who performed the action

---

## Phase 1 Acceptance Criteria
1. Organizer can add employees while creating booking.
2. Added employees see booking in dashboard immediately after refresh.
3. Capacity validation blocks over-capacity booking.
4. Duplicate participants are not saved.
5. Organizer can edit participant list; invited users cannot.
6. Existing bookings without participants continue to work without regression.

---

## Phase 2 (Next): Notifications
After Phase 1 stabilization:
- send email to added employees on create/update/cancel
- include room, location, start/end time, organizer, and calendar link (future)
