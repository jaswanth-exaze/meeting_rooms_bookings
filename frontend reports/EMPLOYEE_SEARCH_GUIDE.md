# Employee Search Guide

## Updated
- March 18, 2026

## Purpose
This guide explains how employee search works in the current admin dashboard implementation.

## Current Source Files
- `frontend/dashboards/admin-dashboard.html`
- `frontend/js/dashboard/admin/employees/employee-directory.js`
- `frontend/js/core/pagination.js`
- `frontend/js/core/api.js`
- `frontend/js/core/format.js`

## Important Correction
Employee search is no longer owned by `frontend/js/role-dashboard.js`.

The live search flow is now owned by `frontend/js/dashboard/admin/employees/employee-directory.js`.

## What "Employee Search" Means In The Current App
- The admin dashboard loads the employee directory once through `GET /admin/employees`.
- Search and filters are then applied in the browser.
- There is no separate frontend search controller file.
- There is no separate backend "search endpoint" just for admin employee search.

## Current UI Elements
From `frontend/dashboards/admin-dashboard.html`:
- Search input: `#employeeDirectorySearch`
- Department filter: `#employeeDirectoryDepartmentFilter`
- Role filter: `#employeeDirectoryRoleFilter`
- Location filter: `#employeeDirectoryLocationFilter`
- Access filter: `#employeeDirectoryAccessFilter`
- Status filter: `#employeeDirectoryStatusFilter`
- Summary label: `#employeeFilterSummary`
- Reset button: `#resetEmployeeFiltersBtn`
- Refresh button: `#refreshEmployeesBtn`
- Table body: `#employeeAdminTable`
- Pagination container: `#employeePagination`

## Current Load Flow
1. `initializeDashboard()` runs from `frontend/js/dashboard/shared/init/dashboard-init.js`.
2. Admin mode calls `initializeAdminSettings()`.
3. `initializeAdminSettings()` calls `loadEmployees()`.
4. `loadEmployees()` fetches rows through `apiFetch("/admin/employees")`.
5. `renderEmployeeTable(rows)` stores the full dataset in `adminEmployeeDirectory`.
6. The script populates dynamic filter options and then calls `applyAdminEmployeeFilters()`.

## Current Filter Pipeline
The main functions are:
- `getAdminEmployeeFilterElements()`
- `getAdminEmployeeFilterValues()`
- `hasActiveAdminEmployeeFilters()`
- `populateAdminEmployeeFilters()`
- `applyAdminEmployeeFilters()`
- `renderEmployeePage()`

## What The Search Field Checks
When the free-text search box is used, `applyAdminEmployeeFilters()` builds a search haystack from:
- `name`
- `email`
- `department`
- `role`
- `project`
- `employee_type`
- `work_location_name`
- `manager_name`
- `phone_number`
- derived access label: `admin` or `employee`
- derived status label: `active` or `inactive`

The comparison is case-insensitive.

## What The Structured Filters Check
- Department filter matches `department`
- Role filter matches `role`
- Location filter matches `work_location_name`
- Access filter checks `is_admin`
- Status filter checks `is_active`

Every filter is combined in the browser before pagination is rendered.

## Pagination Behavior
- `setPaginationRows("employees", filteredRows)` stores the filtered dataset
- `setPaginationRows()` resets the current page to `1`
- `renderEmployeePage()` reads the current page slice through `getPaginationSlice("employees")`
- `renderPaginationControls("employeePagination", "employees")` draws the controls

This means a new search term or filter always sends the table back to page 1.

## Refresh And Reset Behavior
- `Refresh` button reruns `loadEmployees()`
- `Reset Filters` clears all employee filter inputs and reruns `applyAdminEmployeeFilters()`
- Changing any select or typing in the search box immediately reapplies the client-side filters

## Related Admin Behavior In The Same File
The same file also owns:
- employee creation
- employee deletion
- manager option population for the add-employee form
- admin location option loading

That is why employee search now lives beside admin employee management instead of a removed shared dashboard controller.

## Conclusion
Employee search is currently a client-side filtered view of the admin employee dataset, owned by `frontend/js/dashboard/admin/employees/employee-directory.js` and paginated through the shared pagination helpers.
