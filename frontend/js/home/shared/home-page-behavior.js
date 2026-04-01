// Handle shared interaction behavior on the home page.

// Initialize sign in illustration video.
function initializeSignInIllustrationVideo() {
  if (!signInIllustrationVideo) return;

  signInIllustrationVideo.muted = true;
  signInIllustrationVideo.defaultMuted = true;

  // Ensure playback.
  const ensurePlayback = () => {
    const playPromise = signInIllustrationVideo.play();
    if (playPromise && typeof playPromise.catch === "function") {
      playPromise.catch(() => {});
    }
  };

  signInIllustrationVideo.addEventListener("loadeddata", ensurePlayback, { once: true });
  document.addEventListener("visibilitychange", () => {
    if (!document.hidden) {
      ensurePlayback();
    }
  });

  ensurePlayback();
}

// Initialize sticky auth card state.
function initializeStickyAuthCardState() {
  const authCard = document.querySelector(".home-auth-card");
  if (!authCard) return;

  const desktopMediaQuery = window.matchMedia("(min-width: 1041px)");
  let isTicking = false;

  // Read sticky top px.
  function readStickyTopPx() {
    const computedTop = Number.parseFloat(window.getComputedStyle(authCard).top || "0");
    return Number.isFinite(computedTop) ? computedTop : 0;
  }

  // Update sticky state.
  function updateStickyState() {
    if (!desktopMediaQuery.matches) {
      authCard.classList.remove("is-stuck");
      return;
    }

    const stickyTop = readStickyTopPx();
    const cardRect = authCard.getBoundingClientRect();
    const parentRect = authCard.parentElement?.getBoundingClientRect();
    const hasReachedStickyTop = cardRect.top <= stickyTop + 0.5;
    const parentPassedStickyTop = parentRect ? parentRect.top <= stickyTop : window.scrollY > 0;
    authCard.classList.toggle("is-stuck", hasReachedStickyTop && parentPassedStickyTop);
  }

  // Schedule sticky state update.
  function scheduleStickyStateUpdate() {
    if (isTicking) return;
    isTicking = true;
    window.requestAnimationFrame(() => {
      isTicking = false;
      updateStickyState();
    });
  }

  window.addEventListener("scroll", scheduleStickyStateUpdate, { passive: true });
  window.addEventListener("resize", scheduleStickyStateUpdate, { passive: true });
  desktopMediaQuery.addEventListener("change", scheduleStickyStateUpdate);
  scheduleStickyStateUpdate();
}
