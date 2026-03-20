let allLocations = [];
let locationMapPoints = [];
let previewMap = null;
let modalMap = null;
let previewMarkers = [];
let modalMarkers = new Map();
let lastLocationMapTrigger = null;

function buildLocationMapPoints(locations) {
  return (Array.isArray(locations) ? locations : []).map(location => {
    const normalizedName = normalizeLocationName(location.name);
    const preset = LOCATION_MAP_PRESETS[normalizedName] || null;

    return {
      ...location,
      lat: preset?.lat ?? null,
      lng: preset?.lng ?? null,
      zoom: preset?.zoom ?? 13,
      shortLabel: getLocationShortLabel(location.name)
    };
  });
}

function getLocationMapPoint(locationId) {
  return locationMapPoints.find(location => Number(location.location_id) === Number(locationId)) || null;
}

function hasMapCoordinates(locationPoint) {
  return Number.isFinite(Number(locationPoint?.lat)) && Number.isFinite(Number(locationPoint?.lng));
}

function getLocationLatLng(locationPoint) {
  return [Number(locationPoint.lat), Number(locationPoint.lng)];
}

function ensureLeafletLoaded() {
  return typeof window.L !== "undefined";
}

function createLocationMarkerIcon(locationPoint, isActive = false, { compact = false } = {}) {
  if (!ensureLeafletLoaded()) return null;

  const activeClass = isActive ? " is-active" : "";
  const compactClass = compact ? " is-preview" : "";

  return L.divIcon({
    className: `leaflet-office-marker-shell${compactClass}`,
    html:
      `<span class="leaflet-office-marker${activeClass}${compactClass}">` +
      `<span class="leaflet-office-marker-label">${locationPoint.shortLabel}</span>` +
      `<span class="leaflet-office-marker-pin">` +
      `<span class="leaflet-office-marker-dot"></span>` +
      `<span class="leaflet-office-marker-stem"></span>` +
      `</span>` +
      `</span>`,
    iconSize: compact ? [64, 54] : [82, 72],
    iconAnchor: compact ? [32, 54] : [41, 72],
    popupAnchor: compact ? [0, -40] : [0, -58]
  });
}

function createLocationPopupContent(locationPoint) {
  const rooms = getLocationRooms(locationPoint.location_id);
  return (
    `<div class="leaflet-office-popup">` +
    `<strong>${locationPoint.name || "Office"}</strong>` +
    `<span>${rooms.length} room${rooms.length === 1 ? "" : "s"} | ${locationPoint.timezone || "UTC"}</span>` +
    `</div>`
  );
}

function clearPreviewMarkers() {
  previewMarkers.forEach(marker => marker.remove());
  previewMarkers = [];
}

function clearModalMarkers() {
  modalMarkers.forEach(marker => marker.remove());
  modalMarkers.clear();
}

function fitMapToLocationPoints(
  mapInstance,
  {
    maxZoom = 4,
    padding = [40, 40],
    paddingTopLeft = null,
    paddingBottomRight = null
  } = {}
) {
  if (!mapInstance || !ensureLeafletLoaded()) return;

  const points = locationMapPoints.filter(hasMapCoordinates);
  if (points.length === 0) return;

  const bounds = L.latLngBounds(points.map(getLocationLatLng));
  mapInstance.fitBounds(bounds, {
    padding,
    paddingTopLeft,
    paddingBottomRight,
    maxZoom
  });
}

function focusMapLocation(mapInstance, locationPoint, { animate = true } = {}) {
  if (!mapInstance || !locationPoint || !hasMapCoordinates(locationPoint)) return;

  const latLng = getLocationLatLng(locationPoint);
  const zoomLevel = Number(locationPoint.zoom) || 13;

  if (animate && typeof mapInstance.flyTo === "function") {
    mapInstance.flyTo(latLng, zoomLevel, { duration: 0.8 });
  } else {
    mapInstance.setView(latLng, zoomLevel);
  }
}

function refreshPreviewMarkers() {
  if (!previewMap || !ensureLeafletLoaded()) return;

  clearPreviewMarkers();

  locationMapPoints
    .filter(hasMapCoordinates)
    .forEach(locationPoint => {
      const marker = L.marker(getLocationLatLng(locationPoint), {
        icon: createLocationMarkerIcon(
          locationPoint,
          Number(selectedMapLocationId) === Number(locationPoint.location_id),
          { compact: true }
        ),
        keyboard: false
      });

      marker.on("click", () => {
        openLocationMapModal(officeMapPreview);
      });

      marker.addTo(previewMap);
      previewMarkers.push(marker);
    });
}

function refreshModalMarkers() {
  if (!modalMap || !ensureLeafletLoaded()) return;

  clearModalMarkers();

  locationMapPoints
    .filter(hasMapCoordinates)
    .forEach(locationPoint => {
      const isActive = Number(selectedMapLocationId) === Number(locationPoint.location_id);
      const marker = L.marker(getLocationLatLng(locationPoint), {
        icon: createLocationMarkerIcon(locationPoint, isActive)
      });

      marker.bindPopup(createLocationPopupContent(locationPoint), {
        closeButton: false,
        offset: [0, -34]
      });

      marker.on("click", () => {
        selectMapLocation(Number(locationPoint.location_id), {
          syncFeaturedFilter: true,
          focusMap: true,
          openPopup: true
        });
      });

      marker.addTo(modalMap);
      modalMarkers.set(Number(locationPoint.location_id), marker);
    });
}

function initializePreviewMap() {
  if (!officeMapPreview || previewMap || !ensureLeafletLoaded()) return;

  previewMap = L.map(officeMapPreview, {
    attributionControl: false,
    boxZoom: false,
    doubleClickZoom: false,
    dragging: true,
    keyboard: false,
    scrollWheelZoom: true,
    tap: false,
    touchZoom: false,
    zoomControl: false
  });

  L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
    maxZoom: 19
  }).addTo(previewMap);

  previewMap.on("click", () => {
    openLocationMapModal(officeMapPreview);
  });

  refreshPreviewMarkers();
  fitMapToLocationPoints(previewMap, {
    maxZoom: 3,
    paddingTopLeft: [24, 72],
    paddingBottomRight: [24, 20]
  });
}

function initializeModalMap() {
  if (!locationMapCanvas || modalMap || !ensureLeafletLoaded()) return;

  modalMap = L.map(locationMapCanvas, {
    zoomControl: true
  });

  L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
    maxZoom: 19
  }).addTo(modalMap);

  refreshModalMarkers();
  fitMapToLocationPoints(modalMap, { maxZoom: 4 });
}

function refreshAllMapMarkers() {
  refreshPreviewMarkers();
  refreshModalMarkers();
}

function updateLocationFocusCard(locationPoint, roomCount = 0) {
  if (!locationMapFocusCard) return;

  if (!locationPoint) {
    locationMapFocusCard.hidden = true;
    return;
  }

  locationMapFocusTitle.textContent = locationPoint.name || "Office";
  locationMapFocusAddress.textContent = formatLocationAddress(locationPoint.address) || "Address not available.";
  locationMapFocusMeta.textContent = `${roomCount} room${roomCount === 1 ? "" : "s"} | ${locationPoint.timezone || "UTC"}`;
  locationMapFocusCard.hidden = false;
}

function renderLocationRoomCards(locationPoint) {
  if (!locationPoint) {
    renderDefaultLocationRoomState();
    return;
  }

  const locationRooms = getLocationRooms(locationPoint.location_id);

  if (locationRoomPanelTitle) {
    locationRoomPanelTitle.textContent = `${locationPoint.name} Rooms`;
  }
  if (locationRoomPanelCopy) {
    locationRoomPanelCopy.textContent = `${locationRooms.length} room${locationRooms.length === 1 ? "" : "s"} available at this office.`;
  }

  renderRoomCollection(locationRoomGrid, locationRooms, {
    emptyTitle: "No rooms found for this office.",
    emptyMeta: "This location is available on the map but has no room records yet."
  });

  updateLocationFocusCard(locationPoint, locationRooms.length);

  if (locationMapSelectedMeta) {
    locationMapSelectedMeta.textContent = `${locationRooms.length} room${locationRooms.length === 1 ? "" : "s"} available at ${locationPoint.name}`;
  }
}

function resetLocationMapSelection({ preserveFeaturedFilter = true } = {}) {
  selectedMapLocationId = null;
  updateLocationFocusCard(null);
  renderDefaultLocationRoomState();
  refreshAllMapMarkers();

  if (locationMapSelectedMeta) {
    locationMapSelectedMeta.textContent = `${locationMapPoints.length} office locations available`;
  }

  if (!preserveFeaturedFilter && featuredLocationFilter) {
    featuredLocationFilter.value = "";
    renderFeaturedRooms();
  }

  if (!locationMapModal?.hidden && modalMap) {
    fitMapToLocationPoints(modalMap, { maxZoom: 4 });
  }
}

function selectMapLocation(
  locationId,
  { syncFeaturedFilter = true, focusMap = true, openPopup = false } = {}
) {
  const locationPoint = getLocationMapPoint(locationId);
  if (!locationPoint) return;

  selectedMapLocationId = Number(locationPoint.location_id);
  renderLocationRoomCards(locationPoint);
  refreshAllMapMarkers();

  if (syncFeaturedFilter && featuredLocationFilter) {
    featuredLocationFilter.value = String(locationPoint.location_id);
    renderFeaturedRooms();
  }

  if (!locationMapModal?.hidden && modalMap && focusMap) {
    focusMapLocation(modalMap, locationPoint);

    if (openPopup) {
      const marker = modalMarkers.get(Number(locationPoint.location_id));
      if (marker) {
        marker.openPopup();
      }
    }
  }
}

function openLocationMapModal(triggerElement = null) {
  if (!locationMapModal) return;

  lastLocationMapTrigger =
    triggerElement instanceof HTMLElement
      ? triggerElement
      : document.activeElement instanceof HTMLElement
        ? document.activeElement
        : null;

  locationMapModal.hidden = false;
  focusFirstElementInModal(locationMapModal);

  if (!ensureLeafletLoaded()) {
    setLocationMapStatus("Leaflet failed to load for the office map.", "error");
    return;
  }

  initializeModalMap();
  setLocationMapStatus("");

  window.requestAnimationFrame(() => {
    if (!modalMap) return;

    modalMap.invalidateSize();

    if (selectedMapLocationId) {
      const locationPoint = getLocationMapPoint(selectedMapLocationId);
      if (locationPoint) {
        focusMapLocation(modalMap, locationPoint, { animate: false });
        const marker = modalMarkers.get(Number(locationPoint.location_id));
        if (marker) {
          marker.openPopup();
        }
        return;
      }
    }

    fitMapToLocationPoints(modalMap, { maxZoom: 4 });
  });
}

function closeLocationMapModal() {
  if (!locationMapModal) return;

  locationMapModal.hidden = true;

  if (lastLocationMapTrigger && lastLocationMapTrigger.isConnected) {
    lastLocationMapTrigger.focus();
  }

  lastLocationMapTrigger = null;
}

function loadLocations() {
  return fetchJson(`${API_BASE_URL}/locations`, "Unable to load locations.")
    .then(locations => {
      allLocations = Array.isArray(locations) ? locations : [];
      locationMapPoints = buildLocationMapPoints(allLocations);
      fillLocationOptions(featuredLocationFilter, allLocations);

      if (ensureLeafletLoaded()) {
        initializePreviewMap();
        refreshAllMapMarkers();
        if (previewMap) {
          fitMapToLocationPoints(previewMap, {
            maxZoom: 3,
            paddingTopLeft: [24, 72],
            paddingBottomRight: [24, 20]
          });
        }
      }

      if (selectedMapLocationId) {
        selectMapLocation(selectedMapLocationId, { syncFeaturedFilter: false, focusMap: false });
      } else {
        resetLocationMapSelection();
      }
    })
    .catch(error => {
      console.error("Error loading locations:", error);
      setBookingMessage("Failed to load locations.", "error");
      setLocationMapStatus("Failed to load office locations.", "error");
    });
}

if (featuredLocationFilter) {
  featuredLocationFilter.addEventListener("change", () => {
    renderFeaturedRooms();

    if (featuredLocationFilter.value) {
      selectMapLocation(Number(featuredLocationFilter.value), {
        syncFeaturedFilter: false,
        focusMap: Boolean(locationMapModal && !locationMapModal.hidden),
        openPopup: Boolean(locationMapModal && !locationMapModal.hidden)
      });
    } else {
      resetLocationMapSelection();
    }
  });
}

if (officeMapPreview) {
  officeMapPreview.addEventListener("click", () => {
    if (!previewMap) {
      openLocationMapModal(officeMapPreview);
    }
  });

  officeMapPreview.addEventListener("keydown", event => {
    if (event.key !== "Enter" && event.key !== " ") return;
    event.preventDefault();
    openLocationMapModal(officeMapPreview);
  });
}

if (locationMapResetBtn) {
  locationMapResetBtn.addEventListener("click", () => {
    resetLocationMapSelection({ preserveFeaturedFilter: false });
  });
}

if (locationMapModal) {
  locationMapModal.addEventListener("click", event => {
    if (event.target.matches("[data-close-location-map]")) {
      closeLocationMapModal();
    }
  });
}

window.addEventListener("resize", () => {
  if (previewMap) {
    previewMap.invalidateSize();
    fitMapToLocationPoints(previewMap, {
      maxZoom: 3,
      paddingTopLeft: [24, 72],
      paddingBottomRight: [24, 20]
    });
  }

  if (!locationMapModal?.hidden && modalMap) {
    modalMap.invalidateSize();

    if (selectedMapLocationId) {
      const locationPoint = getLocationMapPoint(selectedMapLocationId);
      if (locationPoint) {
        focusMapLocation(modalMap, locationPoint, { animate: false });
      }
    } else {
      fitMapToLocationPoints(modalMap, { maxZoom: 4 });
    }
  }
});
