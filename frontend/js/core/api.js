const API_BASE_URL = window.APP_CONFIG?.API_BASE_URL || "http://localhost:4000/api";

async function apiFetch(path, options = {}) {
  const { skipAuth = false, ...fetchOptions } = options;
  const headers = { ...(fetchOptions.headers || {}) };

  if (fetchOptions.body && !headers["Content-Type"]) {
    headers["Content-Type"] = "application/json";
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...fetchOptions,
    credentials: "include",
    headers
  });

  let data = null;
  try {
    data = await response.json();
  } catch (_error) {
    data = null;
  }

  if (!response.ok) {
    const error = new Error(data?.message || `Request failed with status ${response.status}`);
    error.status = response.status;
    error.payload = data;
    if (response.status === 401 && !skipAuth) {
      clearStoredAuth();
      window.location.href = "../home.html";
    }
    throw error;
  }

  return data;
}

async function ensureAuthenticatedSession() {
  try {
    const data = await apiFetch("/auth/me", { skipAuth: true });
    if (!data?.employee) {
      throw new Error("Session data is missing.");
    }
    setCurrentEmployee(data.employee);

    if (!enforceRoleAccess()) {
      return false;
    }
    return true;
  } catch (_error) {
    clearStoredAuth();
    window.location.href = "../home.html";
    return false;
  }
}

async function clearAuthAndLogout() {
  try {
    await apiFetch("/auth/logout", { method: "POST", skipAuth: true });
  } catch (_error) {
    // no-op: logout should still clear local auth and redirect
  }
  clearStoredAuth();
  window.location.href = "../home.html";
}

function buildUpcomingUrl({ limit = 20, ownOnly = false, includeAll = false } = {}) {
  const params = new URLSearchParams();
  params.set("limit", String(limit));

  if (currentRole === "admin") {
    if (ownOnly && currentEmployeeId > 0) {
      params.set("employee_id", String(currentEmployeeId));
    }
    if (!includeAll && !ownOnly && currentEmployeeId > 0) {
      params.set("employee_id", String(currentEmployeeId));
    }
  }

  return `/bookings/upcoming?${params.toString()}`;
}

function buildMyBookingsUrl(limit = 30) {
  const params = new URLSearchParams();
  params.set("limit", String(limit));
  params.set("include_past", "1");
  params.set("include_cancelled", "1");

  if (currentRole === "admin" && currentEmployeeId > 0) {
    params.set("employee_id", String(currentEmployeeId));
  }

  return `/bookings/upcoming?${params.toString()}`;
}
