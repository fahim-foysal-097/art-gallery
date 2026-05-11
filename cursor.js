const cursorDot = document.querySelector("[data-cursor-dot]");
const cursorOutline = document.querySelector("[data-cursor-outline]");

const rootStyles = getComputedStyle(document.documentElement);
const accentColor = rootStyles.getPropertyValue("--accent-color").trim();

window.addEventListener("mousemove", function (e) {
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

// Hover effects
const interactiveElements = document.querySelectorAll("a, button");

interactiveElements.forEach((el) => {
  el.addEventListener("mouseenter", () => {
    cursorOutline.style.transform = "translate(-50%, -50%) scale(1.5)";

    cursorOutline.style.backgroundColor = `${accentColor}22`;
    // 22 = low alpha transparency

    cursorOutline.style.borderColor = accentColor;
  });

  el.addEventListener("mouseleave", () => {
    cursorOutline.style.transform = "translate(-50%, -50%) scale(1)";

    cursorOutline.style.backgroundColor = "transparent";

    cursorOutline.style.borderColor = accentColor;
  });
});
