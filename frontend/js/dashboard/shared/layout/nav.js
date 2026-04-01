// Manage dashboard section navigation.

// Show section.
function showSection(sectionId) {
  const target = document.getElementById(sectionId);
  if (!target) return;

  const sections = document.querySelectorAll(".dashboard-section");
  const navLinks = document.querySelectorAll(".side-nav [data-section-target]");

  sections.forEach(section => {
    section.classList.toggle("is-hidden", section.id !== sectionId);
  });

  navLinks.forEach(link => {
    link.classList.toggle("active", link.dataset.sectionTarget === sectionId);
  });
}

// Initialize nav.
function initializeNav() {
  const navLinks = document.querySelectorAll(".side-nav [data-section-target]");
  navLinks.forEach(link => {
    link.addEventListener("click", event => {
      event.preventDefault();
      const targetId = link.dataset.sectionTarget;
      if (targetId) {
        showSection(targetId);
        closeSidebarDrawer();
      }
    });
  });

  const jumpTargets = document.querySelectorAll("[data-section-jump]");
  jumpTargets.forEach(element => {
    // Go to section.
    const goToSection = () => {
      const targetId = element.dataset.sectionJump;
      if (targetId) {
        showSection(targetId);
        closeSidebarDrawer();
      }
    };

    element.addEventListener("click", goToSection);
    element.addEventListener("keydown", event => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        goToSection();
      }
    });
  });

  const logoutLink = document.getElementById("logout-link");
  if (logoutLink) {
    logoutLink.addEventListener("click", event => {
      event.preventDefault();
      closeSidebarDrawer();
      clearAuthAndLogout();
    });
  }
}
