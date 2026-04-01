// Handle login form submission and redirect flow.

// Define shared constants and configuration used by this module.
const LOGIN_API_BASE_URL = window.APP_CONFIG?.API_BASE_URL || "http://localhost:4000/api";
// Cache the DOM nodes reused throughout this module.
const loginForm = document.getElementById('login-form');
const authMessage = document.getElementById('auth-message');

if (loginForm) {
  const emailInput = loginForm.querySelector('input[name="email"]');
  const passwordInput = loginForm.querySelector('input[name="password"]');

  if (!emailInput || !passwordInput) {
    console.error('Login inputs were not found in #login-form.');
  } else {
    loginForm.addEventListener('submit', function(event) {
      event.preventDefault();
      if (authMessage) {
        authMessage.textContent = '';
      }

      const email = emailInput.value.trim();
      const password = passwordInput.value;

      if (!email || !password) {
        alert('Please fill in all fields.');
        return;
      }

      fetch(`${LOGIN_API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({ email, password })
      })
        .then(async response => {
          const data = await response.json();
          if (!response.ok) {
            throw new Error(data.message || 'Login failed.');
          }
          return data;
        })
        .then(data => {
          if (!data?.employee) {
            throw new Error('Login succeeded but employee details are missing.');
          }

          localStorage.removeItem('auth_token');
          localStorage.setItem('auth_employee', JSON.stringify(data.employee || null));
          const target = data.employee?.is_admin === true
            ? 'dashboards/admin-dashboard.html'
            : 'dashboards/employee-dashboard.html';
          const nextUrl = data.employee?.password_reset_required === true
            ? `${target}?force_password_change=1`
            : target;
          window.location.href = nextUrl;
        })
        .catch(error => {
          console.error('Error:', error);
          if (authMessage) {
            authMessage.textContent = error.message || 'An error occurred. Please try again later.';
          } else {
            alert(error.message || 'An error occurred. Please try again later.');
          }
        });
    });
  }
} else {
  console.error('Login form #login-form was not found.');
}
