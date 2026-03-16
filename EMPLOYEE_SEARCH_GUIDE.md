# Employee Search (Admin) — From Absolute Zero

This guide explains how the **Employees** search works in the admin dashboard, starting from nothing. It is written so a new developer can follow the exact flow in the codebase.

## 1. What “Employee Search” Means Here
In this project, “employee search” is **client‑side filtering** of a list of employees already loaded into the browser.  
There is **no separate server search endpoint** for the admin view.  
The server is called once to fetch the full list; all search, filters, and pagination happen in the browser.

## 2. The UI Elements (Where You Type and Click)
The Employees section is in:
- `frontend/dashboards/admin-dashboard.html`

Important elements:
- Search input: `#employeeDirectorySearch`
- Department filter: `#employeeDirectoryDepartmentFilter`
- Role filter: `#employeeDirectoryRoleFilter`
- Location filter: `#employeeDirectoryLocationFilter`
- Access filter: `#employeeDirectoryAccessFilter`
- Status filter: `#employeeDirectoryStatusFilter`
- Reset button: `#resetEmployeeFiltersBtn`
- Table body: `#employeeAdminTable`
- Pagination container: `#employeePagination`
- Summary text: `#employeeFilterSummary`

## 3. The Data Source (Where Employees Come From)
The admin UI fetches employees from:
- `GET /api/admin/employees`

Backend handler:
- `backend/src/controllers/admin.controller.js` → `listEmployees()`

Frontend fetch call:
- `frontend/js/role-dashboard.js` → `loadEmployees()`

When the dashboard initializes (admin only), it calls:
- `loadEmployees()`

This pulls all employees into memory as `adminEmployeeDirectory`.

## 4. The Core Data Cache
Once data is loaded, it is stored here:
- `adminEmployeeDirectory` (array of employee objects)

This is the “master list” used for all filters and search.

## 5. How Filters Are Built
When employees are loaded, the UI builds filter options dynamically:

Function:
- `populateAdminEmployeeFilters()`

What it does:
- Reads `adminEmployeeDirectory`
- Extracts unique values for:
  - `department`
  - `role`
  - `work_location_name`
- Populates the dropdowns with those values

## 6. How Search and Filters Are Applied
Whenever the user types or changes a filter, the code calls:
- `applyAdminEmployeeFilters()`

### Step‑by‑step logic
1. Read all filter values from the UI:
   - `getAdminEmployeeFilterValues()`
2. Loop through every employee in `adminEmployeeDirectory`
3. Exclude any employee who fails a selected filter
4. If search text exists:
   - Build a **single lowercase string** with these fields:
     - name, email, department, role, project, employee_type,
       work_location_name, manager_name, phone_number,
       access (“admin/employee”), and status (“active/inactive”)
   - Use a substring match (`includes`) against the search text
5. Store the filtered list in pagination:
   - `setPaginationRows("employees", filteredRows)`
6. Update summary text:
   - `setAdminEmployeeFilterSummary()`
7. Render the page:
   - `renderEmployeePage()`

## 7. Pagination (Why You See Pages)
Pagination is also client‑side:
- The filtered list is stored in `paginationState.employees`
- `renderEmployeePage()` shows only one page at a time
- `renderPaginationControls("employeePagination", "employees")`
  builds the page buttons

So search and filters always happen **before** pagination.

## 8. Summary Text (The Message Under Filters)
The summary text is updated by:
- `setAdminEmployeeFilterSummary(filteredCount, totalCount)`

It shows:
- “Showing all X employees.” if no filters are active
- “Showing Y of X employees.” when filters are active
- “No employees available.” if none exist

## 9. What Triggers a Refresh
You can reload the full list (and rebuild filters) by:
- Clicking **Refresh** (`#refreshEmployeesBtn`)
- This calls `loadEmployees()` again

## 10. Where to Read the Code
Primary file:
- `frontend/js/role-dashboard.js`

Key functions:
- `loadEmployees()`
- `populateAdminEmployeeFilters()`
- `applyAdminEmployeeFilters()`
- `renderEmployeePage()`
- `renderPaginationControls()`

## 11. Common Behavior Questions
**Q: Is search case‑sensitive?**  
No. Everything is lowered before matching.

**Q: Does search hit the server?**  
No. It filters the already‑loaded list.

**Q: Why does the Location filter show names instead of IDs?**  
Because the backend joins location name into each employee row, and the UI uses that string.

**Q: Why do filters update after I add an employee?**  
Because `loadEmployees()` reloads the full dataset and `populateAdminEmployeeFilters()` rebuilds dropdowns.

---

If you want server‑side search (for huge orgs), the current structure would need a new API endpoint and a different client flow. This guide reflects the current client‑side behavior.
