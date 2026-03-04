# Refresh Model Detailed Report

## 1) Objective
This report explains how refresh and data synchronization work in the dashboard after the recent architecture updates.

The scope covers:
- how refresh is triggered
- what API calls are made
- why this is called an event-driven refresh model (instead of timer polling)
- what was improved
- where limitations still exist

Primary implementation file:
- `frontend/js/role-dashboard.js`

---

## 2) What "Refresh Rate" Means in This Project
In this project, refresh does **not** run on a fixed interval like every 5 seconds.

Instead, refresh is **event-driven**:
- initial page bootstrap
- user click actions
- successful data mutation actions (book/edit/cancel/vacate)

So practical refresh cadence is:
- immediate on load
- immediate after relevant operations
- manual when user chooses

This avoids unnecessary constant API traffic while keeping state fresh when it matters.

---

## 3) Core Refresh Entry Points

### 3.1 Initial dashboard hydration
On `initializeDashboard()`:
1. session is validated via `/auth/me`
2. multiple data blocks are loaded in parallel using `Promise.all`:
   - summary
   - bookings
   - finder locations
   - overview availability
3. room search is then executed
4. admin-only report + employee data is fetched (also parallelized)

Result:
- first paint gets complete dashboard state quickly
- avoids long serial wait time

### 3.2 Manual refresh
`#refreshBookingsBtn` triggers:
- `loadBookings()` only

This is intentional:
- fast action for user to re-check bookings without reloading all panels

### 3.3 Mutation-based refresh
After successful:
- booking create
- booking edit
- booking cancel
- booking vacate

the app calls `refreshBookingViews()`, which runs:
- `loadSummary()`
- `loadBookings()`
- `loadOverviewAvailability()`
- `searchRooms()`
- and `loadReports()` for admin

This gives strong cross-panel consistency after each booking mutation.

---

## 4) API Surface Involved in Refresh

### 4.1 Common dashboard data
- `GET /api/bookings/summary`
- `GET /api/bookings/upcoming` (overview and my bookings variants)
- `GET /api/rooms` (finder + right-now availability)
- `GET /api/locations` (finder location dropdown)

### 4.2 Admin extras
- `GET /api/bookings/reports`
- `GET /api/admin/employees`

All requests use:
- `credentials: include` (cookie session model)
- centralized wrapper `apiFetch(path, options)`

---

## 5) Why This Model Is Better Than Polling

## 5.1 Improvements delivered
1. **Lower backend load**
No constant timer flood while user is idle.

2. **Fresher state at correct moments**
Data refresh happens exactly after operations that change booking state.

3. **Better perceived performance**
Parallel fetch on startup and refresh reduces total waiting.

4. **Single refresh orchestrator**
`refreshBookingViews()` reduces partial updates and panel drift.

5. **Cleaner failure handling**
One API wrapper ensures consistent error parsing and session behavior.

### 5.2 User-visible behavior improvements
- bookings table, overview counts, room availability, and finder stay aligned after actions
- less stale data confusion
- fewer hard reloads needed

---

## 6) Consistency Guarantees and Design Intent

Current design guarantees:
1. After successful booking mutations, all related views are refreshed as a unit.
2. Auth failure (`401`) causes safe logout redirect instead of partial broken UI state.
3. Admin-only panels are loaded only in admin context.

Design intent:
- prioritize correctness after write operations
- avoid long-lived stale caches in browser memory

---

## 7) Known Constraints / Tradeoffs

1. No periodic polling means background external changes are not auto-reflected unless:
   - user triggers an action
   - user clicks refresh
   - page is reloaded

2. Manual refresh button currently refreshes bookings list only, not all cards.

3. Parallel refresh can issue several requests at once; if backend is slow, all panels wait on their own responses.

---

## 8) Recommended Next-Level Enhancements

1. Add optional low-frequency sync (e.g., every 60-120s) only when dashboard tab is visible.
2. Add request cancellation (`AbortController`) to prevent stale race overwrites during fast repeated actions.
3. Add optimistic UI for some operations with rollback on failure.
4. Add client-side "last updated at" timestamp per panel for transparency.
5. Add cache + revalidation pattern for locations/static room metadata.

---

## 9) Operational Troubleshooting Guide

If dashboard appears to refresh and then redirects home:
1. Check `/api/auth/me` response in network tab.
2. Verify cookie exists for the same host used by frontend.
3. Ensure frontend and backend host style is consistent:
   - `localhost` with `localhost`
   - `127.0.0.1` with `127.0.0.1`
4. Validate `.env` `CORS_ORIGIN` includes exact frontend origin.

If bookings don’t reflect changes:
1. Confirm mutation API returned success (2xx).
2. Confirm `refreshBookingViews()` was called in that success path.
3. Check for API errors in browser console for summary/bookings/rooms endpoints.

---

## 10) Summary
The current refresh architecture is event-driven, mutation-aware, and performance-conscious.

It is a strong fit for this booking domain because:
- booking state changes are discrete events
- consistency after each event matters more than constant polling
- infrastructure load is controlled while preserving UX responsiveness
