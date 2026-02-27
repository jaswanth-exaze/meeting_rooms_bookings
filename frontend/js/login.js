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

      fetch('http://localhost:4000/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
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
          if (!data.token) {
            throw new Error('Login succeeded but token is missing.');
          }

          localStorage.setItem('auth_token', data.token);
          localStorage.setItem('auth_employee', JSON.stringify(data.employee || null));
          if (data.employee?.is_admin === true) {
            window.location.href = 'dashboards/admin-dashboard.html';
          } else {
            window.location.href = 'dashboards/employee-dashboard.html';
          }
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
