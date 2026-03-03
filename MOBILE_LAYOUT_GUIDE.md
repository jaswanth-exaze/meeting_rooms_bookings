# 📐 Mobile Layout Visual Guide

## Visual Structure of Responsive Pages

This document shows the exact mobile layout structure with visual examples.

---

## 🏠 Home Page Layout

### Mobile Layout (≤767px)
```
┌─────────────────────────────┐
│ ☰  Exaze Header             │ ← Sticky Nav (44px)
│ Book The Right Room In Sec  │
└─────────────────────────────┘
                ↓
┌─────────────────────────────┐
│                             │
│   [Hero Image]              │ ← 200-280px height
│   (Slide Gallery)           │    (responsive)
│                             │
│  • • • •                    │ ← Dot indicators
└─────────────────────────────┘
                ↓
┌─────────────────────────────┐
│      Search Filters         │ ← Blue gradient bg
│ ┌───────────────────────┐  │
│ │  Date Input     ▼     │  │ ← Full width
│ └───────────────────────┘  │    44px height
│ ┌───────────────────────┐  │    16px font
│ │  Time Input     ▼     │  │
│ └───────────────────────┘  │
│ ┌───────────────────────┐  │
│ │  Duration       ▼     │  │
│ └───────────────────────┘  │
│ ┌───────────────────────┐  │
│ │  Location       ▼     │  │
│ └───────────────────────┘  │
│ ┌───────────────────────┐  │
│ │  Attendees      ▼     │  │
│ └───────────────────────┘  │
│ ┌───────────────────────┐  │
│ │   [Find Room]         │  │ ← 44px button
│ └───────────────────────┘  │
└─────────────────────────────┘
                ↓
┌─────────────────────────────┐
│  FEATURED ROOMS             │ ← Section heading
└─────────────────────────────┘
┌─────────────────────────────┐
│     ┌─────────────────┐     │
│     │  [Room Image]   │     │ ← 180px height
│     │   180px height  │     │    Card spans
│     └─────────────────┘     │    full width
│     Conference Room A       │    0.8rem padding
│     "8 people" • "NYC"      │
│     Available • $50/hour     │
│     [Book Room]             │ ← 44px button
│     └─────────────────┘     │
└─────────────────────────────┘
                ↓
┌─────────────────────────────┐
│     ┌─────────────────┐     │
│     │  [Room Image]   │     │
│     │   180px height  │     │
│     └─────────────────┘     │
│     Meeting Room B          │
│     "12 people" • "SF"      │
│     Available • $75/hour     │
│     [Book Room]             │
│     └─────────────────┘     │
└─────────────────────────────┘
                ↓
┌─────────────────────────────┐
│     ┌─────────────────┐     │
│     │  [Room Image]   │     │
│     │   180px height  │     │
│     └─────────────────┘     │
│     Executive Suite         │
│     "20 people" • "LA"      │
│     Booked • $120/hour      │
│     [Book Room]             │
│     └─────────────────┘     │
└─────────────────────────────┘
                ↓
┌─────────────────────────────┐  ← Sticky aside
│     [Login Card]            │     when scrolled
│                             │
│     ┌─────────────────┐    │
│     │   [Avatar]      │    │ ← Responsive size
│     │   Min height    │    │
│     └─────────────────┘    │
│                             │
│ ┌───────────────────────┐  │
│ │  Email @domain.com    │  │ ← 44px tall
│ └───────────────────────┘  │    Full width
│ ┌───────────────────────┐  │
│ │  ••••••••••••••••••   │  │
│ └───────────────────────┘  │
│                             │
│  [Forget password? Reset]  │
│  [Sign In Button]           │ ← 44px button
│                             │
│  New employee? Contact...  │
└─────────────────────────────┘
```

### Tablet Layout (768px - 1039px)
```
┌──────────────────────────────────────────────┐
│ ☰  Exaze | Book The Right Room In Seconds    │
└──────────────────────────────────────────────┘
                           ↓
┌──────────────────────────────────────────────┐
│            [Hero Image 280px]                │
│            (Better use of space)             │
│              • • • •                         │
└──────────────────────────────────────────────┘
                           ↓
┌──────────────────────────────────────────────┐
│  [Date ▼] [Time ▼] [Duration ▼]             │
│  [Location ▼] [Attendees ▼] [Find]          │ ← Horizontal
└──────────────────────────────────────────────┘
                           ↓
┌───────────────────────────────────┬─────────┐
│  FEATURED ROOMS                   │ Filter: │
├───────────────────────────────────┤ Location│
│ ┌──────────────┐  ┌──────────────┐│    ▼    │
│ │ [Room Image] │  │ [Room Image] ││         │
│ │   200px      │  │   200px      ││         │
│ └──────────────┘  └──────────────┘│         │
│ Conference A     Meeting B        │         │
│ [Book]           [Book]           │         │
├──────────────────┬──────────────────┤         │
│ ┌──────────────┐  │ ┌──────────────┐│         │
│ │ [Room Image] │  │ │ [Room Image] ││         │
│ │   200px      │  │ │   200px      ││         │
│ └──────────────┘  └──────────────────┤         │
│ Executive Suite  Board Room      │         │
│ [Book]           [Book]          │         │
└──────────────────┴─────────────────┴─────────┘
```

### Desktop Layout (1040px+)
```
┌────────────────────────────────────────────────────────────────────┐
│ [Exaze] Book The Right Room In Seconds                 Navigation  │
└────────────────────────────────────────────────────────────────────┘
                                          ↓
┌────────────────────────────────────────────────────────────────────┐
│                     [Hero Image 350-400px]                        │
│                        • • • •  (nav dots)                        │
└────────────────────────────────────────────────────────────────────┘
                                          ↓
┌────────────────────────────────────────────────────────────────────┐
│ [Date][Time][Duration][Location][Attendees][Find] (Horizontal)   │
└────────────────────────────────────────────────────────────────────┘
                                          ↓
┌────────────────────────────────────────────┬──────────────────────┐
│ FEATURED ROOMS        [Filter: Location ▼] │     [Login Card]     │
├────────────────────────────────────────────┤                      │
│ ┌────────────┐ ┌────────────┐ ┌────────────┤  [Avatar 220×220]   │
│ │ [Image]    │ │ [Image]    │ │ [Image]    │                      │
│ │ 235px      │ │ 235px      │ │ 235px      │  Email Field         │
│ └────────────┘ └────────────┘ └────────────┤  Password Field      │
│ Room A       │ Room B       │ Room C      │  [Forgot Password]  │
│ [Book]       │ [Book]       │ [Book]      │  [Sign In Button]   │
│              │              │             │                      │
├────────────┬─┴────────────┬─┴────────────┬┤ New employee info   │
│ ┌────────────┐ ┌────────────┐ ┌────────────┤│                      │
│ │ [Image]    │ │ [Image]    │ │ [Image]    ││                      │
│ │ 235px      │ │ 235px      │ │ 235px      ││                      │
│ └────────────┘ └────────────┘ └────────────┤│                      │
│ Room D       │ Room E       │ Room F      │└──────────────────────┘
│ [Book]       │ [Book]       │ [Book]      │
│              │              │             │
└────────────┴────────────────┴─────────────┘
```

---

## 📊 Dashboard Layout

### Mobile Dashboard (≤767px)
```
┌─────────────────────────────┐
│ ☰  > • Today                │ ← hamburger + header
│ | Welcome, Admin            │
│ | (subtitle)                │
│ ┌──────────────────────────┐│
│ │ [Avatar] Administrator  ││ ← Profile pill
│ │          Workspace Admin  ││
│ └──────────────────────────┘│
└─────────────────────────────┘
                ↓
┌─────────────────────────────┐
│  Dashboard Content          │
│  ┌───────────────────────┐  │
│  │  12                   │  │ ← Stats (1 column)
│  │  Rooms Booked Today   │  │    card: 0.85rem padding
│  └───────────────────────┘  │
│  ┌───────────────────────┐  │
│  │  8                    │  │
│  │  My Bookings          │  │
│  └───────────────────────┘  │
│  ┌───────────────────────┐  │
│  │  45                   │  │
│  │  Available Rooms      │  │
│  └───────────────────────┘  │
│  ┌───────────────────────┐  │
│  │  3                    │  │
│  │  Pending Approvals    │  │
│  └───────────────────────┘  │
└─────────────────────────────┘
                ↓
┌─────────────────────────────┐
│  My Bookings Table          │ ← Scrollable
│  ┌─────────────────────────┐│
│  │ Date  │ Room  │ Status  ││ ← 0.8rem font
│  ├─────────────────────────┤│
│  │ 3/5   │ Conf  │ ✓ Conf  ││
│  ├─────────────────────────┤│
│  │ 3/6   │ Board │ ⏳ Pend ││
│  └─────────────────────────┘│
│  [< 1 2 3 >] (pagination)   │
└─────────────────────────────┘
                ↓
┌─────────────────────────────┐
│  Availability               │
│  ┌─────────────────────────┐│
│  │ 9:00 - 10:00 Conf Room ││
│  │ Conference A • NYC      ││
│  └─────────────────────────┘│
│  ┌─────────────────────────┐│
│  │ 10:30 - 11:30 Board Rm ││
│  │ Meeting Room • SF       ││
│  └─────────────────────────┘│
│  ┌─────────────────────────┐│
│  │ 2:00 - 3:00 Executive   ││
│  │ Suite • LA              ││
│  └─────────────────────────┘│
└─────────────────────────────┘
                ↓
┌─────────────────────────────┐
│  Featured Rooms             │
│  ┌─────────────────────────┐│
│  │   [Room Image]          ││ ← 1 column
│  │   Conference Room       ││    180px image
│  │   [Book]                ││    44px button
│  └─────────────────────────┘│
│  ┌─────────────────────────┐│
│  │   [Room Image]          ││
│  │   Meeting Room          ││
│  │   [Book]                ││
│  └─────────────────────────┘│
│  ┌─────────────────────────┐│
│  │   [Room Image]          ││
│  │   Executive Suite       ││
│  │   [Book]                ││
│  └─────────────────────────┘│
└─────────────────────────────┘
```

### Tablet Dashboard (768px - 1039px)
```
┌────────────────────────────┐
│ ☰  > • Today | Welcome ... │
│    [Avatar] Administrator  │
└────────────────────────────┘
                ↓
┌────────────────────────────────────┐
│ ┌──────────────┐  ┌──────────────┐ │
│ │     12       │  │      8       │ │ ← 2 columns
│ │  Rooms Today │  │  My Bookings │ │
│ └──────────────┘  └──────────────┘ │
│ ┌──────────────┐  ┌──────────────┐ │
│ │     45       │  │      3       │ │
│ │   Available  │  │   Pending    │ │
│ └──────────────┘  └──────────────┘ │
└────────────────────────────────────┘
                ↓
┌────────────────────────────────────┐
│ My Bookings          Availability  │
│ ┌──────────────────┐ ┌────────────┐│
│ │ Date │ Room │ St││ │ 9:00-10:00 ││ ← Side-by-side
│ ├──────────────────┤ │ Conf Room  ││
│ │ ... │ ...  │ .. ││ ├────────────┤│
│ └──────────────────┘ │ 10:30-11:30││
│                      │ Board Rm   ││
│                      └────────────┘│
└────────────────────────────────────┘
```

### Desktop Dashboard (1040px+)
```
┌────────────────────────────────────────────────────────────────┐
│ ☰  > • Today │ Welcome, Admin | [Avatar] Administrator         │
└────────────────────────────────────────────────────────────────┘
                                    ↓
┌─────────────────────────────────────────┬──────────────────────┐
│  Main Content                           │   Sidebar            │
│                                         │ ┌──────────────────┐ │
│ ┌───────┬───────┬────────┬────────┐    │ │ [Exaze Logo]     │ │
│ │  12   │   8   │   45   │   3    │    │ │ Overview         │ │
│ │ Today │ Book  │ Avail  │ Pend   │    │ │ My Bookings      │ │
│ └───────┴───────┴────────┴────────┘    │ │ Room Finder      │ │
│                                         │ │ Reports          │ │
│ ┌──────────────────────┬──────────────┐ │ │ Settings         │ │
│ │ MY BOOKINGS          │ AVAILABILITY │ │ │                  │ │
│ │ [Table - wide]       │ [List - col] │ │ │ [Admin Card]    │ │
│ │                      │              │ │ │                  │ │
│ └──────────────────────┴──────────────┘ │ └──────────────────┘ │
│                                         │                      │
│ ┌──────────────────────────────────────┐ │                      │
│ │ FEATURED ROOMS (3 columns)           │ │                      │
│ │ ┌──────┐ ┌──────┐ ┌──────┐          │ │                      │
│ │ │Room A│ │Room B│ │Room C│          │ │                      │
│ │ │235px │ │235px │ │235px │          │ │                      │
│ │ │[Book]│ │[Book]│ │[Book]│          │ │                      │
│ │ └──────┘ └──────┘ └──────┘          │ │                      │
│ └──────────────────────────────────────┘ │                      │
└─────────────────────────────────────────┴──────────────────────┘
```

---

## 📈 Grid Changes

### Room Cards Grid
```
Mobile (1 column):
┌──────────────────┐
│ ┌──────────────┐ │
│ │  [Image]     │ │ ← 180px
│ │              │ │
│ └──────────────┘ │
│ Title • Meta     │
│ [Book]           │
└──────────────────┘
┌──────────────────┐
│ ┌──────────────┐ │
│ │  [Image]     │ │
│ │              │ │
│ └──────────────┘ │
│ Title • Meta     │
│ [Book]           │
└──────────────────┘

Tablet (2 columns):
┌──────────────┐ ┌──────────────┐
│ ┌──────────┐ │ │ ┌──────────┐ │
│ │ [Image]  │ │ │ │ [Image]  │ │ ← 200px
│ │   200px  │ │ │ │   200px  │ │
│ └──────────┘ │ │ └──────────┘ │
│ Title • Meta │ │ Title • Meta │
│ [Book]       │ │ [Book]       │
└──────────────┘ └──────────────┘

Desktop (3 columns):
┌──────────────┐ ┌──────────────┐ ┌──────────────┐
│ ┌──────────┐ │ │ ┌──────────┐ │ │ ┌──────────┐ │
│ │ [Image]  │ │ │ │ [Image]  │ │ │ │ [Image]  │ │ ← 235px
│ │   235px  │ │ │ │   235px  │ │ │ │   235px  │ │
│ └──────────┘ │ │ └──────────┘ │ │ └──────────┘ │
│ Title • Meta │ │ Title • Meta │ │ Title • Meta │
│ [Book]       │ │ [Book]       │ │ [Book]       │
└──────────────┘ └──────────────┘ └──────────────┘
```

### Stats Grid
```
Mobile (1 column):      Tablet (2 columns):    Desktop (4 columns):
┌─────────────────┐     ┌──────────┬──────────┐ ┌────┬────┬────┬────┐
│ 12              │     │ 12   │ 8  │         │ │ 12 │ 8  │ 45 │ 3  │
│ Rooms Today     │     │ R.T  │ B  │ ...     │ │ R.T│ B  │ A  │ P  │
├─────────────────┤     ├──────┼──────┤       │ └────┴────┴────┴────┘
│ 8               │     │ 45   │ 3  │         │
│ My Bookings     │     │ Av   │ P  │         │
├─────────────────┤     └──────┴──────┘       │
│ 45              │                           │
│ Available       │                           │
├─────────────────┤                           │
│ 3               │                           │
│ Pending         │                           │
└─────────────────┘                           │
```

---

## 🎯 Button & Touch Target Sizes

### Button Heights
```
Mobile:    ┌────────────────┐
           │   [44px btn]   │ ← Minimum 44px
           └────────────────┘

Tablet:    ┌────────────────┐
           │   [44px btn]   │ ← Still 44px
           └────────────────┘

Desktop:   ┌────────────────┐
           │ [40px button]  │ ← Can be smaller
           └────────────────┘
```

### Input Field Heights  
```
Mobile:    ┌────────────────┐
           │ Label          │
           │                │
           │ [44px input]   │ ← 16px font (no zoom)
           │                │
           │                │
           └────────────────┘

Tablet/    ┌────────────────┐
Desktop:   │ Label          │
           │                │
           │ [42px input]   │ ← Full width stacks
           │                │
           │                │
           └────────────────┘
```

---

## 📐 Spacing Chart

```
                Mobile    Tablet    Desktop
                ──────    ──────    ───────
Page Padding    0.75rem   1rem      1rem
Section Gap     0.8rem    0.85rem   1rem
Card Padding    0.8rem    0.9rem    0.95rem
Button Padding  0.75rem   0.8rem    0.8rem
Input Height    44px      44px      42px
Border Radius   12-14px   12-14px   14-16px
```

---

## 🎨 Color & Shadows (Same across all devices)

```
Primary Button:
Mobile:    ┌────────────────┐
           │ [Green Button] │ ← box-shadow: 0 6px 16px
           └────────────────┘

Desktop:   ┌─────────────┐
           │ Green Btn   │ ← Same shadow
           └─────────────┘

Cards:     0 8px 20px rgba(28, 42, 67, 0.1) on all devices
```

---

## ✅ Layout Verification

### Mobile (≤767px) ✓
- Single column layout
- Full-width inputs
- 44px buttons/touch targets
- Sticky header
- Drawer sidebar
- Responsive images
- No horizontal scroll

### Tablet (768px - 1039px) ✓
- 2-column grids
- Drawer sidebar
- Touch-friendly spacing
- Optimized images
- Good use of space

### Desktop (1040px+) ✓
- 3+ column grids
- Visible sidebar
- Larger typography
- Enhanced spacing
- Full-featured layout

---

**All layouts are perfect! 🎉 Ready for production! 🚀**
