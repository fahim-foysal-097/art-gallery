const cursorDot = document.querySelector("[data-cursor-dot]");
const cursorOutline = document.querySelector("[data-cursor-outline]");

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
      duration: 180,
      fill: "forwards",
    },
  );
});

// Hover effects
const interactiveElements = document.querySelectorAll("a, button");

interactiveElements.forEach((el) => {
  el.addEventListener("mouseenter", () => {
    cursorOutline.classList.add("hover");
  });

  el.addEventListener("mouseleave", () => {
    cursorOutline.classList.remove("hover");
  });
});
