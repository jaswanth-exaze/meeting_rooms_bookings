// Manage the home page hero section behavior.

let slideshowTimerId = null;
let isSlideshowInitialized = false;

// Initialize slideshow.
function initializeSlideshow() {
  if (isSlideshowInitialized) {
    return;
  }

  const heroSlides = Array.from(document.querySelectorAll(".hero-slide"));

  if (heroSlides.length === 0) {
    return;
  }

  isSlideshowInitialized = true;
  let currentSlideIndex = 0;
  const autoPlayInterval = HERO_SLIDE_DURATION_MS;
  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  heroSlides.forEach(slide => {
    if (!(slide instanceof HTMLVideoElement)) {
      return;
    }

    // Sync duration.
    const syncDuration = () => {
      if (!Number.isFinite(slide.duration) || slide.duration <= 0) {
        return;
      }

      const playbackRate = slide.duration / (HERO_SLIDE_DURATION_MS / 1000);
      slide.defaultPlaybackRate = playbackRate;
      slide.playbackRate = playbackRate;
    };

    if (slide.readyState >= 1) {
      syncDuration();
    }

    slide.addEventListener("loadedmetadata", syncDuration, { once: true });
  });
  const syncSlidePlayback = activeIndex => {
    heroSlides.forEach((slide, index) => {
      if (!(slide instanceof HTMLVideoElement)) {
        return;
      }

      if (index === activeIndex) {
        slide.currentTime = 0;
        const playPromise = slide.play();
        if (playPromise && typeof playPromise.catch === "function") {
          playPromise.catch(() => {});
        }
        return;
      }

      slide.pause();
      slide.currentTime = 0;
    });
  };

  // Show slide.
  function showSlide(index) {
    currentSlideIndex = (index + heroSlides.length) % heroSlides.length;
    heroSlides.forEach(slide => slide.classList.remove("active"));
    heroSlides[currentSlideIndex].classList.add("active");
    syncSlidePlayback(currentSlideIndex);
  }

  // Stop auto play.
  function stopAutoPlay() {
    if (slideshowTimerId) {
      window.clearInterval(slideshowTimerId);
      slideshowTimerId = null;
    }
  }

  // Start auto play.
  function startAutoPlay() {
    if (prefersReducedMotion) return;
    stopAutoPlay();
    slideshowTimerId = window.setInterval(() => {
      showSlide(currentSlideIndex + 1);
    }, autoPlayInterval);
  }

  document.addEventListener("visibilitychange", () => {
    if (document.hidden) {
      stopAutoPlay();
      heroSlides.forEach(slide => {
        if (slide instanceof HTMLVideoElement) {
          slide.pause();
        }
      });
    } else {
      syncSlidePlayback(currentSlideIndex);
      startAutoPlay();
    }
  });

  window.addEventListener("beforeunload", stopAutoPlay, { once: true });
  showSlide(0);
  startAutoPlay();
}

