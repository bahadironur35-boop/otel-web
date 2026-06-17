const header = document.querySelector(".site-header");

const syncHeader = () => {
  const active = window.scrollY > 24;
  header.style.background = active ? "rgba(10, 27, 25, 0.92)" : "";
  header.style.backdropFilter = active ? "blur(14px)" : "";
};

window.addEventListener("scroll", syncHeader, { passive: true });
syncHeader();
