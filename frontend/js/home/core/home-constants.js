// Define shared constants, assets, and theme keys for the home page.

// Define shared constants and configuration used by this module.
const API_BASE_URL = window.APP_CONFIG?.API_BASE_URL || "http://localhost:4000/api";

const ROOM_IMAGES_BY_NAME = {
  "cell pod 1": "assets/images/cell_pod_1.png",
  "cell pod 2": "assets/images/cell_pod_2.png",
  hubble: "assets/images/hubble-2-persons.png",
  fusion: "assets/images/fussion-6-members.png",
  nexus: "assets/images/Nexus-2-persons.png",
  zenith: "assets/images/zenith-3-persons.png",
  synergy: "assets/images/synergy-4-members.png",
  tranquil: "assets/images/tranquil-5-members.png",
  "think tank": "assets/images/think_tank.png",
  "innovation hub": "assets/images/Innovation_Hub.png",
  boardroom: "assets/images/boardroom-15-members.png",
  pinnacle: "assets/images/pinnacle-15-members.png",
  "conference room a": "assets/images/Conference_Room_A.png",
  "conference room b": "assets/images/Conference_Room_B.png",
  "training room": "assets/images/training_room.png",
  karoo: "assets/images/hubble-2-persons.png",
  meerkat: "assets/images/Nexus-2-persons.png",
  "cape town": "assets/images/synergy-4-members.png",
  drakensberg: "assets/images/fussion-6-members.png",
  "table mountain": "assets/images/fussion-6-members.png"
};

// Define shared constants and configuration used by this module.
const ROOM_AMENITY_DEFINITIONS = Object.freeze([
  { key: "has_projector", label: "Projector", icon: "projector" },
  { key: "has_screen", label: "Display Screen", icon: "screen" },
  { key: "has_webcam", label: "Web Cam", icon: "camera" },
  { key: "has_video_conferencing", label: "Video Conference", icon: "video" },
  { key: "has_tv_set", label: "TV Set", icon: "tv" },
  { key: "has_wifi", label: "WiFi", icon: "wifi" },
  { key: "has_ac", label: "AC", icon: "air" },
  { key: "has_whiteboard", label: "Whiteboard", icon: "whiteboard" },
  { key: "has_power_backup", label: "Power Backup", icon: "battery" }
]);

// Define shared constants and configuration used by this module.
const ROOM_AMENITY_ICON_MARKUP = Object.freeze({
  projector:
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M5 7 3 5"></path><path d="M9 6V3"></path><path d="m13 7 2-2"></path><circle cx="9" cy="13" r="3"></circle><path d="M11.83 12H20a2 2 0 0 1 2 2v4a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2v-4a2 2 0 0 1 2-2h2.17"></path><path d="M16 16h2"></path></svg>',
  screen:
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="12" rx="2"></rect><path d="M8 20h8"></path><path d="M12 16v4"></path></svg>',
  camera:
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M12 16a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z"></path><path d="M12 16v4"></path><path d="M9 20h6"></path><path d="M5 6h14"></path><path d="M7 6a5 5 0 0 1 10 0"></path></svg>',
  video:
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="7" width="13" height="10" rx="2"></rect><path d="m16 10 5-3v10l-5-3z"></path></svg>',
  tv:
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="m8 3 4 3 4-3"></path><rect x="3" y="6" width="18" height="12" rx="2"></rect><path d="M8 21h8"></path></svg>',
  wifi:
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20h.01"></path><path d="M2 8.82a15 15 0 0 1 20 0"></path><path d="M5 12.86a10 10 0 0 1 14 0"></path><path d="M8.5 16.43a5 5 0 0 1 7 0"></path></svg>',
  air:
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M18 17.5a2.5 2.5 0 1 1-4 2.03V12"></path><path d="M6 12H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"></path><path d="M6 8h12"></path><path d="M6.6 15.57A2 2 0 1 0 10 17v-5"></path></svg>',
  whiteboard:
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M2 3h20"></path><path d="M21 3v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V3"></path><path d="m7 21 5-5 5 5"></path></svg>',
  battery:
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="m11 7-3 5h4l-3 5"></path><path d="M14.86 6H16a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2h-2.94"></path><path d="M22 14v-4"></path><path d="M5.14 18H4a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h2.94"></path></svg>',
  default:
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="12" rx="2"></rect><path d="M8 20h8"></path><path d="M12 16v4"></path></svg>'
});

// Define shared constants and configuration used by this module.
const ROOM_DETAIL_META_ICON_MARKUP = Object.freeze({
  location:
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><path d="M12 21s-6-4.35-6-10a6 6 0 1 1 12 0c0 5.65-6 10-6 10Z"></path><circle cx="12" cy="11" r="2.4"></circle></svg>',
  capacity:
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M22 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>',
  default:
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"></circle></svg>'
});

// Define shared constants and configuration used by this module.
const FEATURED_ROOM_LIMIT = 9;
const HERO_SLIDE_DURATION_MS = 5000;
const LOCATION_MAP_PRESETS = {
  "south africa (head office)": { lat: -26.0596, lng: 28.0594, zoom: 14, shortLabel: "ZA" },
  "india headquarters": { lat: 21.1938, lng: 81.3509, zoom: 13, shortLabel: "IN" },
  "united kingdom (sales office)": { lat: 51.3864, lng: -1.0065, zoom: 13, shortLabel: "UK" },
  "delivery centre - hyderabad": { lat: 17.4215, lng: 78.3413, zoom: 14, shortLabel: "HYD" },
  "delivery centre - pune": { lat: 18.5157, lng: 73.9369, zoom: 14, shortLabel: "PUN" },
  "delivery centre - bhopal": { lat: 23.2494, lng: 77.4372, zoom: 13, shortLabel: "BHO" }
};

// Define shared constants and configuration used by this module.
const THEME_STORAGE_KEY = "dashboard_theme_preference";
const THEME_LIGHT = "light";
const THEME_DARK = "dark";
const FOCUSABLE_SELECTOR = [
  "a[href]",
  "button:not([disabled])",
  "textarea:not([disabled])",
  "input:not([disabled]):not([type='hidden'])",
  "select:not([disabled])",
  "[tabindex]:not([tabindex='-1'])"
].join(", ");
