const cursorDot = document.querySelector("[data-cursor-dot]");
const cursorOutline = document.querySelector("[data-cursor-outline]");

if (cursorDot && cursorOutline) {
  const hoverSelector =
    "a, button, img, .gallery-overlay, .download-btn, [data-cursor-grow]";

  window.addEventListener("mousemove", (e) => {
    const posX = e.clientX;
    const posY = e.clientY;

    cursorDot.style.left = `${posX}px`;
    cursorDot.style.top = `${posY}px`;

    // Smooth lag effect
    cursorOutline.animate(
      {
        left: `${posX}px`,
        top: `${posY}px`,
      },
      {
        duration: 500,
        fill: "forwards",
      },
    );
  });

  // Grow cursor on hover using delegation
  document.addEventListener("mouseover", (e) => {
    const target = e.target.closest(hoverSelector);
    if (!target) return;
    cursorOutline.classList.add("hover");
  });

  // Remove grow only when truly leaving the hovered element
  document.addEventListener("mouseout", (e) => {
    const from = e.target.closest(hoverSelector);
    if (!from) return;

    const to = e.relatedTarget;
    if (to && to.closest && to.closest(hoverSelector)) return;

    cursorOutline.classList.remove("hover");
  });
}
