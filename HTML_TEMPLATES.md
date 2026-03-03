# 📱 Action-First HTML Template Examples

## Copy-Paste Ready Templates

Use these templates to quickly implement the action-first design across your pages.

---

## 1️⃣ Dashboard Page Template

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Dashboard | Exaze</title>
  <link rel="stylesheet" href="css/styles.css">
</head>
<body class="page-dashboard">
  <main class="page-container">
    <section class="dashboard-main">
      <!-- Header -->
      <header class="dash-top">
        <div>
          <h1>Welcome Back, Alex</h1>
          <p>Today's Meetings</p>
        </div>
        <div class="profile-pill" onclick="goToProfile()">
          <img class="avatar" src="assets/profile.png" alt="Profile">
          <div>
            <strong>Alex Johnson</strong>
            <span>Employee</span>
          </div>
        </div>
      </header>

      <!-- Compact Stats (2x2 Grid) -->
      <div class="compact-stats">
        <article class="stat-card">
          <p class="label">Today's Meetings</p>
          <p class="value">4</p>
        </article>
        <article class="stat-card">
          <p class="label">Booked Hours</p>
          <p class="value">6.5h</p>
        </article>
        <article class="stat-card">
          <p class="label">This Week</p>
          <p class="value">18</p>
        </article>
        <article class="stat-card">
          <p class="label">Upcoming</p>
          <p class="value">8</p>
        </article>
      </div>

      <!-- Quick Booking Button -->
      <button class="quick-book-btn" id="quickBookBtn">
        🚀 Quick Book: 1 Hour Now
      </button>

      <!-- Upcoming Bookings (Cards instead of Table) -->
      <section class="dashboard-section">
        <h2 style="font-size: 1rem; margin-bottom: 0.8rem;">My Upcoming Bookings</h2>
        
        <div class="booking-card">
          <div class="booking-card-content">
            <h3 class="booking-card-title">Conference Room A</h3>
            <p class="booking-card-meta">New York • 8 people</p>
            <p class="booking-card-time">📅 Today • 2:00 PM - 3:00 PM</p>
          </div>
          <div class="booking-status">
            <span class="availability-pill available">✓ Confirmed</span>
          </div>
        </div>

        <div class="booking-card">
          <div class="booking-card-content">
            <h3 class="booking-card-title">Board Room</h3>
            <p class="booking-card-meta">San Francisco • 12 people</p>
            <p class="booking-card-time">📅 Tomorrow • 10:00 AM - 11:00 AM</p>
          </div>
          <div class="booking-status">
            <span class="availability-pill pending">⏳ Pending</span>
          </div>
        </div>

        <div class="booking-card">
          <div class="booking-card-content">
            <h3 class="booking-card-title">Executive Suite</h3>
            <p class="booking-card-meta">Los Angeles • 20 people</p>
            <p class="booking-card-time">📅 Mar 05 • 4:00 PM - 5:00 PM</p>
          </div>
          <div class="booking-card-actions">
            <button class="booking-card-action primary">View</button>
            <button class="booking-card-action secondary">Cancel</button>
          </div>
        </div>
      </section>

      <!-- Available Rooms (Room Cards) -->
      <section class="dashboard-section">
        <h2 style="font-size: 1rem; margin-bottom: 0.8rem;">Available Now</h2>
        
        <div class="room-result-card">
          <img src="assets/room1.png" alt="Meeting Room" class="room-result-image">
          <div class="room-result-content">
            <div class="room-result-header">
              <h3 class="room-result-name">Team Space</h3>
              <span class="room-availability-badge available">✓ Available</span>
            </div>
            <div class="room-result-details">
              <div class="room-result-detail">
                <span class="room-detail-label">📍</span>
                <span>Building A</span>
              </div>
              <div class="room-result-detail">
                <span class="room-detail-label">👥</span>
                <span>6 people</span>
              </div>
            </div>
            <button class="room-result-action">View Details</button>
          </div>
        </div>

        <div class="room-result-card">
          <img src="assets/room2.png" alt="Meeting Room" class="room-result-image">
          <div class="room-result-content">
            <div class="room-result-header">
              <h3 class="room-result-name">Focus Pod</h3>
              <span class="room-availability-badge available">✓ Available</span>
            </div>
            <div class="room-result-details">
              <div class="room-result-detail">
                <span class="room-detail-label">📍</span>
                <span>Building B</span>
              </div>
              <div class="room-result-detail">
                <span class="room-detail-label">👥</span>
                <span>2-4 people</span>
              </div>
            </div>
            <button class="room-result-action">View Details</button>
          </div>
        </div>
      </section>
    </section>
  </main>

  <!-- Bottom Navigation -->
  <nav class="bottom-nav">
    <a href="dashboard.html" class="active">
      <span class="bottom-nav-icon">🏠</span>
      <span class="bottom-nav-label">Home</span>
    </a>
    <a href="book.html">
      <span class="bottom-nav-icon">📅</span>
      <span class="bottom-nav-label">Book</span>
    </a>
    <a href="mybookings.html">
      <span class="bottom-nav-icon">📋</span>
      <span class="bottom-nav-label">Bookings</span>
    </a>
    <a href="profile.html">
      <span class="bottom-nav-icon">👤</span>
      <span class="bottom-nav-label">Profile</span>
    </a>
  </nav>

  <!-- FAB - Quick Book Button -->
  <button class="fab" id="quickBookBtn" title="Quick book a room">+</button>

  <script src="js/dashboard.js"></script>
</body>
</html>
```

---

## 2️⃣ Room Booking Form Template

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Book a Room | Exaze</title>
  <link rel="stylesheet" href="css/styles.css">
</head>
<body class="page-home">
  <main class="page-container">
    <!-- Header -->
    <header class="top-nav">
      <a class="logo-wrap" href="/">
        <img src="assets/exaze-logo.png" alt="Exaze">
      </a>
      <div class="brand-copy">
        <p class="brand-kicker">Book Your Meeting</p>
        <p class="brand-title">Find the Perfect Room</p>
      </div>
    </header>

    <!-- Hero Section (Reduced 30%) -->
    <section class="hero-block">
      <div class="hero-content">
        <div class="hero-slideshow-container">
          <img class="hero-slide active" src="assets/hero1.png" alt="Meeting room">
          <img class="hero-slide" src="assets/hero2.png" alt="Meeting room">
          <div class="hero-slideshow-dots">
            <button class="slideshow-dot active" data-slide="0"></button>
            <button class="slideshow-dot" data-slide="1"></button>
          </div>
        </div>
      </div>
    </section>

    <!-- Booking Form - Moved Higher -->
    <section class="search-ribbon-wrap">
      <form id="bookingForm" class="search-ribbon">
        <!-- Date Picker -->
        <div class="search-chip">
          <div>
            <label for="bookingDate">📅 Date</label>
            <input id="bookingDate" type="date" required>
          </div>
        </div>

        <!-- Time Picker -->
        <div class="search-chip">
          <div>
            <label for="bookingTime">🕐 Time</label>
            <input id="bookingTime" type="time" required>
          </div>
        </div>

        <!-- Duration (Segmented Buttons) -->
        <div style="padding: 0 0.5rem;">
          <label style="font-size: 0.72rem; font-weight: 700;">Duration</label>
          <div class="segmented-buttons" id="durationGroup">
            <button type="button" class="segmented-btn active" data-value="30">30m</button>
            <button type="button" class="segmented-btn" data-value="60">1h</button>
            <button type="button" class="segmented-btn" data-value="90">1.5h</button>
            <button type="button" class="segmented-btn" data-value="120">2h</button>
          </div>
          <input type="hidden" id="duration" name="duration" value="30">
        </div>

        <!-- Capacity (Stepper) -->
        <div style="padding: 0 0.5rem;">
          <label style="font-size: 0.72rem; font-weight: 700;">👥 People</label>
          <div class="stepper-input">
            <button type="button" class="stepper-btn" id="decreaseCapacity">−</button>
            <span class="stepper-value" id="capacityValue">4</span>
            <button type="button" class="stepper-btn" id="increaseCapacity">+</button>
          </div>
          <input type="hidden" id="capacity" name="capacity" value="4">
        </div>

        <!-- Location Dropdown -->
        <div class="search-chip">
          <div>
            <label for="location">📍 Location</label>
            <select id="location" name="location" required>
              <option value="">All Locations</option>
              <option value="ny">New York</option>
              <option value="sf">San Francisco</option>
              <option value="la">Los Angeles</option>
            </select>
          </div>
        </div>

        <!-- Sticky Search Button -->
        <button type="submit" class="search-go">Find Rooms</button>
      </form>
    </section>

    <!-- Sticky CTA Button (During Scroll) -->
    <div class="sticky-action">
      <button class="search-go" style="margin: 0;" onclick="scrollToForm()">
        ↑ Find Rooms
      </button>
    </div>
  </main>

  <!-- Bottom Navigation -->
  <nav class="bottom-nav">
    <a href="dashboard.html">
      <span class="bottom-nav-icon">🏠</span>
      <span class="bottom-nav-label">Home</span>
    </a>
    <a href="book.html" class="active">
      <span class="bottom-nav-icon">📅</span>
      <span class="bottom-nav-label">Book</span>
    </a>
    <a href="mybookings.html">
      <span class="bottom-nav-icon">📋</span>
      <span class="bottom-nav-label">Bookings</span>
    </a>
    <a href="profile.html">
      <span class="bottom-nav-icon">👤</span>
      <span class="bottom-nav-label">Profile</span>
    </a>
  </nav>

  <script>
    // Duration selection
    document.getElementById('durationGroup').addEventListener('click', (e) => {
      if (e.target.classList.contains('segmented-btn')) {
        document.querySelectorAll('#durationGroup .segmented-btn').forEach(btn => btn.classList.remove('active'));
        e.target.classList.add('active');
        document.getElementById('duration').value = e.target.getAttribute('data-value');
      }
    });

    // Capacity stepper
    let capacity = 4;
    document.getElementById('decreaseCapacity').addEventListener('click', () => {
      if (capacity > 1) {
        capacity--;
        document.getElementById('capacityValue').textContent = capacity;
        document.getElementById('capacity').value = capacity;
      }
    });

    document.getElementById('increaseCapacity').addEventListener('click', () => {
      if (capacity < 50) {
        capacity++;
        document.getElementById('capacityValue').textContent = capacity;
        document.getElementById('capacity').value = capacity;
      }
    });

    // Form submission
    document.getElementById('bookingForm').addEventListener('submit', (e) => {
      e.preventDefault();
      // Submit booking form
      console.log('Booking with:', {
        date: document.getElementById('bookingDate').value,
        time: document.getElementById('bookingTime').value,
        duration: document.getElementById('duration').value,
        capacity: document.getElementById('capacity').value,
        location: document.getElementById('location').value
      });
    });
  </script>
</body>
</html>
```

---

## 3️⃣ Login Page with Password Toggle

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Sign In | Exaze</title>
  <link rel="stylesheet" href="css/styles.css">
</head>
<body>
  <main class="page-container" style="display: flex; align-items: center; justify-content: center; min-height: 100vh; padding: 2rem 1rem;">
    <div class="card-surface" style="width: 100%; max-width: 380px; padding: 2rem 1.5rem;">
      <!-- Header -->
      <div style="text-align: center; margin-bottom: 1.5rem;">
        <img src="assets/exaze-logo.png" alt="Exaze" style="width: 90px; margin-bottom: 1rem;">
        <h1 style="font-size: 1.3rem; margin-bottom: 0.5rem;">Welcome Back</h1>
        <p style="color: var(--text-muted); margin: 0;">Sign in to your account</p>
      </div>

      <!-- Login Form -->
      <form id="loginForm" onsubmit="handleLogin(event)">
        <!-- Email -->
        <div class="form-item">
          <label for="email">Email Address</label>
          <input 
            id="email" 
            type="email" 
            placeholder="name@company.com" 
            required
            autofocus
          >
        </div>

        <!-- Password with Toggle -->
        <div class="form-item">
          <label for="password">Password</label>
          <div class="password-toggle-wrapper">
            <input 
              id="password" 
              type="password" 
              placeholder="Enter your password"
              required
            >
            <button 
              type="button" 
              class="password-toggle" 
              id="passwordToggle"
              aria-label="Toggle password visibility"
            >
              👁️
            </button>
          </div>
        </div>

        <!-- Remember Me & Forgot Password -->
        <div style="display: flex; justify-content: space-between; align-items: center; margin: 1rem 0; font-size: 0.88rem;">
          <label style="display: flex; align-items: center; gap: 0.4rem; color: var(--navy);">
            <input type="checkbox" name="remember">
            Remember me
          </label>
          <a href="#" style="color: var(--leaf); font-weight: 700;">Forgot password?</a>
        </div>

        <!-- Sign In Button -->
        <button type="submit" class="btn btn-primary" style="width: 100%; min-height: 48px; font-size: 0.96rem; margin-bottom: 1rem;">
          Sign In
        </button>

        <!-- Status Message -->
        <p id="loginMessage" style="text-align: center; font-size: 0.85rem; color: var(--text-muted); margin: 0.8rem 0;"></p>

        <!-- Help Text -->
        <p style="text-align: center; font-size: 0.85rem; color: var(--text-muted); margin-top: 1rem; border-top: 1px solid var(--soft-line); padding-top: 1rem;">
          👩‍💼 New employee? Contact your admin to get access.
        </p>
      </form>
    </div>
  </main>

  <script>
    // Password toggle
    const passwordInput = document.getElementById('password');
    const passwordToggle = document.getElementById('passwordToggle');

    passwordToggle.addEventListener('click', () => {
      const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
      passwordInput.setAttribute('type', type);
      passwordToggle.textContent = type === 'password' ? '👁️' : '👁️‍🗨️';
    });

    // Login handler
    function handleLogin(event) {
      event.preventDefault();
      const email = document.getElementById('email').value;
      const password = document.getElementById('password').value;
      const message = document.getElementById('loginMessage');

      // Show loading
      message.textContent = 'Signing in...';

      // Simulate login
      setTimeout(() => {
        // Replace with actual API call
        console.log('Login:', email, password);
        message.style.color = '#2f8c25';
        message.textContent = '✓ Signed in successfully!';
        setTimeout(() => {
          window.location.href = 'dashboard.html';
        }, 1000);
      }, 1000);
    }
  </script>
</body>
</html>
```

---

## 4️⃣ My Bookings Page (Card-based)

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>My Bookings | Exaze</title>
  <link rel="stylesheet" href="css/styles.css">
</head>
<body class="page-dashboard">
  <main class="page-container">
    <section class="dashboard-main">
      <header class="dash-top">
        <h1>My Bookings</h1>
        <p>All your meeting reservations</p>
      </header>

      <!-- Filter/Sort (Optional) -->
      <div style="display: flex; gap: 0.5rem; margin-bottom: 1rem;">
        <button class="segmented-btn active" onclick="filterBookings('upcoming')">Upcoming</button>
        <button class="segmented-btn" onclick="filterBookings('past')">Past</button>
        <button class="segmented-btn" onclick="filterBookings('cancelled')">Cancelled</button>
      </div>

      <!-- Booking Cards -->
      <div id="bookingsContainer">
        <!-- UPCOMING BOOKINGS -->
        <div style="margin-bottom: 1.5rem;">
          <h3 style="font-size: 0.95rem; font-weight: 800; margin-bottom: 0.8rem; color: var(--navy);">Upcoming</h3>

          <!-- Booking Card 1 -->
          <div class="booking-card">
            <div class="booking-card-content">
              <h3 class="booking-card-title">Team Standup</h3>
              <p class="booking-card-meta">Conference Room A • 6 people</p>
              <p class="booking-card-time">📅 Today • 2:00 PM - 2:30 PM</p>
            </div>
            <div class="booking-card-actions">
              <button class="booking-card-action primary" onclick="editBooking(1)">Edit</button>
              <button class="booking-card-action secondary" onclick="cancelBooking(1)">Cancel</button>
            </div>
          </div>

          <!-- Booking Card 2 -->
          <div class="booking-card">
            <div class="booking-card-content">
              <h3 class="booking-card-title">Client Presentation</h3>
              <p class="booking-card-meta">Executive Suite • 12 people</p>
              <p class="booking-card-time">📅 Tomorrow • 10:00 AM - 11:30 AM</p>
            </div>
            <div class="booking-status">
              <span class="availability-pill available">✓ Confirmed</span>
            </div>
          </div>

          <!-- Booking Card 3 -->
          <div class="booking-card">
            <div class="booking-card-content">
              <h3 class="booking-card-title">Design Review</h3>
              <p class="booking-card-meta">Focus Pod • 4 people</p>
              <p class="booking-card-time">📅 Mar 05 • 3:00 PM - 4:00 PM</p>
            </div>
            <div class="booking-status">
              <span class="availability-pill pending">⏳ Pending Approval</span>
            </div>
          </div>
        </div>

        <!-- PAST BOOKINGS -->
        <div>
          <h3 style="font-size: 0.95rem; font-weight: 800; margin-bottom: 0.8rem; color: var(--navy);">Past</h3>

          <div class="booking-card" style="opacity: 0.7;">
            <div class="booking-card-content">
              <h3 class="booking-card-title">Weekly Sync</h3>
              <p class="booking-card-meta">Conference Room B • 8 people</p>
              <p class="booking-card-time">📅 Mar 01 • 1:00 PM - 2:00 PM</p>
            </div>
            <div class="booking-status">
              <span class="availability-pill available">✓ Completed</span>
            </div>
          </div>

          <div class="booking-card" style="opacity: 0.7;">
            <div class="booking-card-content">
              <h3 class="booking-card-title">Planning Session</h3>
              <p class="booking-card-meta">Board Room • 15 people</p>
              <p class="booking-card-time">📅 Feb 28 • 4:00 PM - 5:30 PM</p>
            </div>
            <div class="booking-status">
              <span class="availability-pill available">✓ Completed</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  </main>

  <!-- Bottom Navigation -->
  <nav class="bottom-nav">
    <a href="dashboard.html">
      <span class="bottom-nav-icon">🏠</span>
      <span class="bottom-nav-label">Home</span>
    </a>
    <a href="book.html">
      <span class="bottom-nav-icon">📅</span>
      <span class="bottom-nav-label">Book</span>
    </a>
    <a href="mybookings.html" class="active">
      <span class="bottom-nav-icon">📋</span>
      <span class="bottom-nav-label">Bookings</span>
    </a>
    <a href="profile.html">
      <span class="bottom-nav-icon">👤</span>
      <span class="bottom-nav-label">Profile</span>
    </a>
  </nav>

  <script>
    function editBooking(id) {
      console.log('Edit booking:', id);
      window.location.href = `edit-booking.html?id=${id}`;
    }

    function cancelBooking(id) {
      if (confirm('Are you sure you want to cancel this booking?')) {
        console.log('Cancel booking:', id);
        // Make API call to cancel
      }
    }

    function filterBookings(type) {
      console.log('Filter:', type);
      // Update booking display based on filter
    }
  </script>
</body>
</html>
```

---

## 🎯 Quick Implementation Checklist

✅ HTML Templates provided above
✅ CSS styles added to `styles.css`
✅ Bottom navigation ready
✅ FAB button ready
✅ Card components ready
✅ Form components ready
✅ Password toggle ready

**Next steps:**
1. Copy templates to your html files
2. Update API endpoints in JavaScript
3. Test on mobile device
4. Adjust colors/branding as needed
5. Deploy!

---

**All set! 🚀**
