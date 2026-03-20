function initializeSignInIllustrationVideo() {
  if (!signInIllustrationVideo) return;

  signInIllustrationVideo.muted = true;
  signInIllustrationVideo.defaultMuted = true;

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

function initializeStickyAuthCardState() {
  const authCard = document.querySelector(".home-auth-card");
  if (!authCard) return;

  const desktopMediaQuery = window.matchMedia("(min-width: 1041px)");
  let isTicking = false;

  function readStickyTopPx() {
    const computedTop = Number.parseFloat(window.getComputedStyle(authCard).top || "0");
    return Number.isFinite(computedTop) ? computedTop : 0;
  }

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
