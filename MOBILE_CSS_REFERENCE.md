# Mobile-First CSS Code Reference Guide

## Quick Reference for Mobile Development

This guide provides practical examples and patterns used in the responsive design system.

---

## 1️⃣ Responsive Typography

### Pattern: Fluid Font Sizing
```css
/* Automatically scales between min and max */
h1 {
  font-size: clamp(1.2rem, 5vw, 1.8rem);
}
/* 
  - Minimum: 1.2rem (on small screens)
  - Preferred: 5% of viewport width
  - Maximum: 1.8rem (on large screens)
*/

h2 {
  font-size: clamp(1.1rem, 4vw, 1.6rem);
}

p {
  font-size: clamp(0.9rem, 2vw, 1rem);
}
```

### Usage Examples
```css
.brand-title { font-size: clamp(0.95rem, 4vw, 1.2rem); }
.dash-top h1 { font-size: clamp(1.2rem, 5vw, 1.8rem); }
.room-title { font-size: clamp(0.9rem, 3vw, 1.1rem); }
```

**Benefits:**
- No extra media queries needed
- Smooth scaling across all viewports
- Better readability at any size

---

## 2️⃣ Touch-Friendly Buttons

### Mobile Button Pattern
```css
.btn {
  /* Touch-friendly minimum size */
  min-height: 44px;
  min-width: 44px;
  padding: 0.75rem 1rem;
  font-size: 16px; /* Prevents iOS zoom */
  
  /* Smooth interactions */
  transition: all 0.2s ease;
  touch-action: manipulation;
}

.btn:active {
  transform: scale(0.98);
}

/* Only apply hover on devices that support it */
@media (hover: hover) {
  .btn:hover {
    transform: translateY(-2px);
  }
}

/* Disable hover on touch devices */
@media (hover: none) and (pointer: coarse) {
  .btn:hover {
    transform: none;
  }
}
```

### HTML Usage
```html
<button class="btn btn-primary">Book Room</button>

<!-- Touch target minimum size: 44px × 44px -->
```

---

## 3️⃣ Responsive Grid Layouts

### Mobile-First Grid Pattern
```css
/* Mobile: Single column */
.grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 1rem;
}

/* Tablet: 2 columns */
@media (min-width: 768px) {
  .grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

/* Desktop: 3 columns */
@media (min-width: 1024px) {
  .grid {
    grid-template-columns: repeat(3, 1fr);
  }
}
```

### Auto-Responsive Grid (No Breakpoints Needed)
```css
/* Automatically adapts without breakpoints */
.responsive-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1rem;
}
/* 
  - Small screens: 1 column
  - Medium screens: 2 columns
  - Large screens: 3+ columns
*/
```

### Our Implementation
```css
.rooms-grid {
  grid-template-columns: 1fr; /* Mobile */
}

@media (max-width: 1240px) {
  .rooms-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (min-width: 1241px) {
  .rooms-grid {
    grid-template-columns: repeat(3, 1fr);
  }
}
```

---

## 4️⃣ Responsive Forms

### Mobile-Friendly Input Pattern
```css
input,
select,
textarea {
  /* Prevent default styling */
  -webkit-appearance: none;
  appearance: none;
  
  /* Prevent iOS zoom on focus */
  font-size: 16px;
  
  /* Touch-friendly sizing */
  min-height: 44px;
  padding: 0.75rem;
  
  /* Better visibility */
  border: 1px solid #ccc;
  border-radius: 8px;
}

input:focus,
select:focus {
  outline: 3px solid rgba(60, 104, 166, 0.3);
  outline-offset: 2px;
}
```

### Single Column Form on Mobile
```css
.form-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 0.75rem;
}

@media (min-width: 768px) {
  .form-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (min-width: 1024px) {
  .form-grid {
    grid-template-columns: repeat(3, 1fr);
  }
}
```

### Search/Filter Form
```html
<form class="search-ribbon">
  <div class="search-chip">
    <label>Date</label>
    <input type="date">
  </div>
  <div class="search-chip">
    <label>Time</label>
    <input type="time">
  </div>
  <button class="btn btn-primary">Search</button>
</form>
```

```css
.search-ribbon {
  /* Mobile: stacked */
  display: grid;
  grid-template-columns: 1fr;
  gap: 0.5rem;
}

@media (min-width: 768px) {
  .search-ribbon {
    /* Tablet: 2 columns */
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (min-width: 1024px) {
  .search-ribbon {
    /* Desktop: as many columns as fit */
    grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
  }
}
```

---

## 5️⃣ Responsive Images

### Flexible Image Container
```css
.image-container {
  width: 100%;
  max-width: 600px;
  aspect-ratio: 16 / 9;
  overflow: hidden;
  border-radius: 12px;
}

.image-container img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
```

### Responsive Image Heights
```css
.hero-image {
  width: 100%;
  height: clamp(200px, 50vw, 400px);
  object-fit: contain;
}

.card-image {
  width: 100%;
  height: clamp(150px, 40vw, 250px);
  object-fit: cover;
  border-radius: 12px;
}
```

### Mobile Example from Your Site
```css
.hero-slideshow-container {
  height: clamp(200px, 50vw, 320px);
  max-height: 320px;
}

.room-card img {
  height: 180px; /* Mobile */
}

@media (min-width: 768px) {
  .room-card img {
    height: 200px;
  }
}

@media (min-width: 1024px) {
  .room-card img {
    height: 235px;
  }
}
```

---

## 6️⃣ Mobile Navigation

### Hamburger Menu Pattern
```css
.mobile-drawer-toggle {
  display: none; /* Hidden on desktop */
  width: 44px;
  height: 44px;
  border: 1px solid #ddd;
  border-radius: 8px;
  padding: 0.5rem;
  cursor: pointer;
  background: white;
}

@media (max-width: 1040px) {
  .mobile-drawer-toggle {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
  }
}
```

### Sliding Sidebar Drawer
```css
.sidebar {
  /* Desktop: Always visible */
  display: block;
  position: relative;
}

@media (max-width: 1040px) {
  .sidebar {
    /* Mobile: Fixed position, slides in/out */
    position: fixed;
    top: 0.5rem;
    left: 0.5rem;
    right: 0.5rem;
    z-index: 1051;
    
    /* Animation */
    transform: translateY(-120%); /* Starts hidden */
    opacity: 0;
    pointer-events: none;
    transition: transform 0.26s ease, opacity 0.22s ease;
  }
  
  .sidebar.is-open {
    transform: translateY(0); /* Slides in */
    opacity: 1;
    pointer-events: auto;
  }
}
```

### Backdrop Overlay
```css
.sidebar-drawer-backdrop {
  display: none;
}

@media (max-width: 1040px) {
  .sidebar-drawer-backdrop {
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.5);
    z-index: 1050;
    opacity: 0;
    pointer-events: none;
    transition: opacity 0.2s ease;
  }
  
  .sidebar-drawer-backdrop.is-open {
    opacity: 1;
    pointer-events: auto;
  }
}
```

---

## 7️⃣ Responsive Spacing

### Flexible Padding Pattern
```css
.card {
  /* Scales from 1rem to 1.5rem based on viewport */
  padding: clamp(1rem, 2vw, 1.5rem);
  /* Or use fixed values by breakpoint */
}

@media (max-width: 767px) {
  .card {
    padding: 0.8rem;
  }
}

@media (min-width: 768px) {
  .card {
    padding: 1rem;
  }
}

@media (min-width: 1024px) {
  .card {
    padding: 1.2rem;
  }
}
```

### Container Padding
```css
.page-container {
  width: min(1380px, 90vw); /* Max width, but responsive */
  margin: 0 auto;
  padding: 0 1rem;
}

@media (max-width: 767px) {
  .page-container {
    padding: 0 0.75rem;
  }
}
```

---

## 8️⃣ Safe Area Handling (Notch Devices)

### Handling Notches and Rounded Corners
```css
@supports (padding: max(0px)) {
  body {
    padding-left: max(0px, env(safe-area-inset-left));
    padding-right: max(0px, env(safe-area-inset-right));
    padding-top: max(0px, env(safe-area-inset-top));
    padding-bottom: max(0px, env(safe-area-inset-bottom));
  }
  
  .modal {
    padding: max(1rem, env(safe-area-inset-left))
             max(1rem, env(safe-area-inset-right))
             max(1rem, env(safe-area-inset-bottom));
  }
}
```

### HTML Meta Tag (Required)
```html
<meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover">
```

---

## 9️⃣ Print Styles

### Hide Mobile-Only Elements When Printing
```css
@media print {
  /* Hide navigation and buttons */
  .mobile-drawer-toggle,
  .search-ribbon,
  .navigation {
    display: none !important;
  }
  
  /* Adjust layout for paper */
  body {
    background: white;
    color: black;
  }
  
  .card {
    box-shadow: none;
    border: 1px solid #ddd;
    page-break-inside: avoid;
  }
}
```

---

## 🧪 Testing Responsive Design

### Browser DevTools
```
1. Open DevTools (F12)
2. Click "Toggle Device Toolbar" (Ctrl+Shift+M)
3. Test at these viewport sizes:
   - 320px (iPhone SE)
   - 375px (iPhone)
   - 390px (iPhone 12)
   - 768px (iPad)
   - 1024px (iPad Pro)
   - 1366px (Desktop)
```

### Test Breakpoints
```javascript
// Test breakpoints in console
console.log(window.matchMedia('(max-width: 767px)').matches); // Mobile?
console.log(window.matchMedia('(max-width: 1040px)').matches); // Tablet?
```

---

## 🔟 Common Mobile Issues & Fixes

### Issue: Text Too Small on Mobile
```css
/* ❌ Bad: Fixed font size */
.text { font-size: 12px; }

/* ✅ Good: Scaled font size */
.text { font-size: clamp(0.85rem, 2vw, 1rem); }
```

### Issue: Buttons Too Small to Tap
```css
/* ❌ Bad: 30px button */
.btn { padding: 0.2rem 0.5rem; min-height: 30px; }

/* ✅ Good: 44px minimum */
.btn { padding: 0.75rem 1rem; min-height: 44px; }
```

### Issue: Form Zooms on Focus (iOS)
```css
/* ❌ Bad: 13px font causes zoom */
input { font-size: 13px; }

/* ✅ Good: 16px prevents zoom */
input { font-size: 16px; }
```

### Issue: Horizontal Scrolling on Mobile
```css
/* ❌ Bad: Fixed width tables cause scroll */
table { width: 100%; }

/* ✅ Good: Allow horizontal scroll with touch */
.table-wrap {
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
}
```

### Issue: No Visual Feedback on Touch
```css
/* ❌ Bad: No feedback */
.btn:hover { opacity: 0.8; }

/* ✅ Good: Works on touch */
@media (hover: hover) {
  .btn:hover { opacity: 0.8; }
}

.btn:active { transform: scale(0.95); }
```

---

## 📊 Responsive Design Summary

| Aspect | Mobile (≤767px) | Tablet (768-1039px) | Desktop (1040px+) |
|--------|-----------------|---------------------|-------------------|
| **Layout** | Single column | 2 columns | 3+ columns |
| **Font Size** | Smaller, clamp() | Medium, clamp() | Larger |
| **Images** | 180px height | 200px height | 235px height |
| **Button** | 44px min height | 44px min height | 40px min height |
| **Padding** | 0.75rem | 1rem | 1.2rem |
| **Navigation** | Drawer menu | Drawer menu | Sidebar visible |
| **Grid Gap** | 0.8rem | 0.8rem | 1rem |

---

## ✅ Mobile-Ready Checklist

- [ ] All text readable without zooming (16px+ base)
- [ ] All buttons/links ≥44px touch target
- [ ] No horizontal scrolling needed
- [ ] Forms full width on mobile
- [ ] Images scale responsively
- [ ] Navigation accessible on mobile
- [ ] Focus states visible
- [ ] Works in landscape mode
- [ ] No layout shift on load (CLS < 0.1)
- [ ] Fast load time on 4G (< 3s)

---

**Remember:** Mobile-first means starting with mobile CSS, then enhancing for larger screens! 📱 → 💻
