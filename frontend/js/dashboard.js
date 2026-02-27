const token = localStorage.getItem('auth_token');

if (!token) {
  window.location.href = 'home.html';
} else {
  const logoutLink = document.getElementById('logout-link');
  if (logoutLink) {
    logoutLink.addEventListener('click', function() {
      localStorage.removeItem('auth_token');
      localStorage.removeItem('auth_employee');
      window.location.href = 'home.html';
    });
  }
}

const overviewLink = document.getElementById('overview-link');
if (overviewLink) {
  overviewLink.addEventListener('click', function() {
   const employeeData = localStorage.getItem('auth_employee');
   if (employeeData) {
     const employee = JSON.parse(employeeData);
    console.log('Employee Data:', employee);
   }
  });
}