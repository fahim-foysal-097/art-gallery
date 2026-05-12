document.addEventListener("DOMContentLoaded", () => {
  const artworks = Array.isArray(window.artworksData)
    ? window.artworksData
    : [];

  const filterContainer = document.getElementById("art-filters");
  const galleryContainer = document.getElementById("gallery-container");
  const galleryEmpty = document.getElementById("gallery-empty");
  const artworkModalElement = document.getElementById("artworkModal");
  const miniGameModalElement = document.getElementById("miniGameModal");
  const pageProgress = document.getElementById("page-progress");
  const navbar = document.getElementById("mainNav");
  const currentYearElement = document.getElementById("current-year");
  const artCount = document.getElementById("art-count");
  const categoryCount = document.getElementById("category-count");
  const downloadableCount = document.getElementById("downloadable-count");

  const heroTitle = document.getElementById("hero-spotlight-title");
  const heroImage = document.getElementById("hero-spotlight-image");
  const heroCategory = document.getElementById("hero-spotlight-category");
  const heroYear = document.getElementById("hero-spotlight-year");
  const heroMedium = document.getElementById("hero-spotlight-medium");
  const heroDescription = document.getElementById("hero-spotlight-description");
  const heroTrigger = document.getElementById("hero-spotlight-trigger");
  const openSpotlightBtn = document.getElementById("open-spotlight-btn");
  const shuffleSpotlightBtn = document.getElementById("shuffle-spotlight");
  const openGameBtn = document.getElementById("open-game-btn");
  const brandLink = document.getElementById("brand-link");
  const backToTopBtn = document.getElementById("back-to-top");
  const gameProgressBar = document.getElementById("game-progress-bar");

  const modalInstance = artworkModalElement
    ? new bootstrap.Modal(artworkModalElement)
    : null;
  const gameModalInstance = miniGameModalElement
    ? new bootstrap.Modal(miniGameModalElement)
    : null;

  const state = {
    masonry: null,
    modalImageRequestId: 0,
    toastTimer: null,
    progressRaf: 0,
    activeSpotlight: null,
    gameTimer: null,
    gameActive: false,
    gameLocked: false,
    gameTimeTotal: 35,
    gameTimeLeft: 35,
    gameScore: 0,
    gameStreak: 0,
    gameCorrectIndex: -1,
  };

  function setText(element, value) {
    if (element) element.textContent = value;
  }

  function slugify(name) {
    return (
      String(name || "artwork")
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "_")
        .replace(/^_+|_+$/g, "") || "artwork"
    );
  }

  function isFeaturedArt(art) {
    return (
      art &&
      (art.featured === true || art.feature === true || art.isFeatured === true)
    );
  }

  function showToast(message, type = "info") {
    const snackbar = document.getElementById("snackbar");
    if (!snackbar) return;

    window.clearTimeout(state.toastTimer);
    snackbar.className = `app-toast toast-${type}`;
    snackbar.innerHTML = `
      <div class="toast-shell">
        <div class="toast-icon">
          <i class="bi ${type === "success" ? "bi-check2-circle" : type === "error" ? "bi-exclamation-triangle-fill" : type === "warning" ? "bi-info-circle-fill" : "bi-chat-left-text-fill"}"></i>
        </div>
        <div>
          <div class="toast-title">Art Gallery</div>
          <p class="toast-message">${message}</p>
        </div>
        <div class="toast-progress"></div>
      </div>
    `;

    requestAnimationFrame(() => snackbar.classList.add("show"));

    state.toastTimer = window.setTimeout(() => {
      snackbar.classList.remove("show");
    }, 3350);
  }

  function updateStats() {
    const total = artworks.length;
    const categories = new Set(
      artworks.map((art) => art.category).filter(Boolean),
    ).size;
    const downloadable = artworks.filter((art) => art.downloadable).length;

    setText(artCount, String(total).padStart(2, "0"));
    setText(categoryCount, String(categories).padStart(2, "0"));
    setText(downloadableCount, String(downloadable).padStart(2, "0"));
  }

  function updateProgressBar() {
    if (!pageProgress) return;

    const scrollTop = window.scrollY || document.documentElement.scrollTop || 0;
    const docHeight =
      document.documentElement.scrollHeight - window.innerHeight;
    const progress = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
    pageProgress.style.width = `${Math.min(100, Math.max(0, progress))}%`;
  }

  function updateNavbar() {
    if (!navbar) return;

    if (window.scrollY > 24) {
      navbar.classList.add("scrolled", "py-2");
      navbar.classList.remove("py-3");
    } else {
      navbar.classList.remove("scrolled", "py-2");
      navbar.classList.add("py-3");
    }
  }

  function setupSectionObserver() {
    const sections = ["hero", "arts", "about", "contact"]
      .map((id) => document.getElementById(id))
      .filter(Boolean);

    const navLinks = Array.from(document.querySelectorAll(".nav-link"));
    if (!sections.length || !("IntersectionObserver" in window)) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];

        if (!visible) return;

        navLinks.forEach((link) => {
          link.classList.toggle(
            "active",
            link.getAttribute("href") === `#${visible.target.id}`,
          );
        });
      },
      { threshold: [0.25, 0.45, 0.65] },
    );

    sections.forEach((section) => observer.observe(section));
  }

  function setupRevealEffects() {
    const revealTargets = document.querySelectorAll(
      ".section-padding, .hero-copy, .hero-showcase-card, .about-frame, .section-heading",
    );
    revealTargets.forEach((node) => node.classList.add("reveal-up"));

    if (!("IntersectionObserver" in window)) {
      revealTargets.forEach((node) => node.classList.add("is-visible"));
      return;
    }

    const observer = new IntersectionObserver(
      (entries, obs) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            obs.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12 },
    );

    revealTargets.forEach((node) => observer.observe(node));
  }

  function destroyMasonry() {
    if (state.masonry && typeof state.masonry.destroy === "function") {
      state.masonry.destroy();
      state.masonry = null;
    }
  }

  function initTilt() {
    const tiltElements = document.querySelectorAll(".gallery-item");
    if (typeof VanillaTilt === "undefined" || !tiltElements.length) return;

    VanillaTilt.init(tiltElements, {
      max: 10,
      speed: 450,
      glare: true,
      "max-glare": 0.18,
      scale: 1.03,
      perspective: 1100,
    });
  }

  function buildFilters() {
    if (!filterContainer) return;

    const categories = [
      "all",
      ...new Set(artworks.map((art) => art.category).filter(Boolean)),
    ];
    filterContainer.innerHTML = "";

    categories.forEach((category) => {
      const button = document.createElement("button");
      button.className = `filter-btn ${category === "all" ? "active" : ""}`;
      button.type = "button";
      button.dataset.filter = category;
      button.textContent = category === "all" ? "All" : category;
      filterContainer.appendChild(button);
    });
  }

  function setHeroSpotlight(art) {
    if (!art || !heroImage) return;

    state.activeSpotlight = art;
    setText(heroTitle, art.title || "Untitled");
    setText(heroCategory, art.category || "Unknown");
    setText(heroYear, art.year || "—");
    setText(heroMedium, art.medium || "—");
    setText(heroDescription, art.description || "");

    const requestId = ++state.modalImageRequestId;
    const thumb = art.imageThumb || art.imageFull;
    const full = art.imageFull || art.imageThumb;

    heroImage.classList.add("is-loading");
    heroImage.classList.remove("is-loaded");
    heroImage.src = thumb;
    heroImage.alt = art.title || "Featured artwork";

    const preload = new Image();
    preload.src = full;
    preload.onload = () => {
      if (requestId !== state.modalImageRequestId) return;
      heroImage.src = full;
      heroImage.classList.remove("is-loading");
      heroImage.classList.add("is-loaded");
    };

    preload.onerror = () => {
      if (requestId !== state.modalImageRequestId) return;
      heroImage.classList.remove("is-loading");
      showToast("A featured image failed to load.", "error");
    };
  }

  function pickRandomSpotlight() {
    if (!artworks.length) return;

    const next = artworks[Math.floor(Math.random() * artworks.length)];
    setHeroSpotlight(next);
  }

  function renderGallery(filter = "all") {
    if (!galleryContainer) return;

    galleryContainer.style.opacity = "0";

    window.setTimeout(() => {
      galleryContainer.innerHTML = "";

      const filteredArt =
        filter === "all"
          ? artworks
          : artworks.filter((art) => art.category === filter);

      if (!filteredArt.length) {
        if (galleryEmpty) galleryEmpty.classList.remove("d-none");
        galleryContainer.style.opacity = "1";
        return;
      }

      if (galleryEmpty) galleryEmpty.classList.add("d-none");

      filteredArt.forEach((art) => {
        const itemWrapper = document.createElement("div");
        itemWrapper.className = "masonry-item";

        const statusHtml = art.downloadable
          ? `<span class="gallery-status"><i class="bi bi-download"></i> Downloadable</span>`
          : `<span class="gallery-status view-only"><i class="bi bi-lock-fill"></i> View only</span>`;

        itemWrapper.innerHTML = `
          <div class="gallery-item" data-tilt data-tilt-max="10" data-tilt-speed="450" data-tilt-glare="true" data-tilt-max-glare="0.18">
            <div class="gallery-img-container">
              <img src="${art.imageThumb}" alt="${art.title}" class="gallery-img" loading="lazy" decoding="async">
            </div>
            <div class="gallery-overlay">
              <p class="gallery-category">${art.category}</p>
              <h3 class="gallery-title">${art.title}</h3>
              ${statusHtml}
            </div>
          </div>
        `;

        const card = itemWrapper.querySelector(".gallery-item");
        card.addEventListener("click", () => openModal(art));

        galleryContainer.appendChild(itemWrapper);
      });

      destroyMasonry();

      const finishLayout = () => {
        state.masonry = new Masonry(galleryContainer, {
          itemSelector: ".masonry-item",
          percentPosition: true,
          transitionDuration: "0.35s",
        });

        initTilt();
        galleryContainer.style.opacity = "1";
      };

      if (typeof imagesLoaded !== "undefined") {
        imagesLoaded(galleryContainer, finishLayout);
      } else {
        finishLayout();
      }
    }, 160);
  }

  function openModal(art) {
    if (!modalInstance || !art) return;

    const els = {
      img: document.getElementById("modal-image"),
      title: document.getElementById("modal-title"),
      cat: document.getElementById("modal-category"),
      desc: document.getElementById("modal-description"),
      year: document.getElementById("modal-year"),
      medium: document.getElementById("modal-medium"),
      downloadBtn: document.getElementById("download-btn"),
    };

    setText(els.title, art.title || "Untitled");
    setText(els.cat, art.category || "Unknown");
    setText(els.desc, art.description || "");
    setText(els.year, art.year || "—");
    setText(els.medium, art.medium || "—");

    if (els.img) {
      const requestId = ++state.modalImageRequestId;
      const thumb = art.imageThumb || art.imageFull;
      const full = art.imageFull || art.imageThumb;

      els.img.src = thumb;
      els.img.alt = art.title || "Artwork";
      els.img.classList.add("is-loading");
      els.img.classList.remove("is-loaded");

      const preload = new Image();
      preload.src = full;

      preload.onload = () => {
        if (requestId !== state.modalImageRequestId) return;
        els.img.src = full;
        els.img.classList.remove("is-loading");
        els.img.classList.add("is-loaded");
      };

      preload.onerror = () => {
        if (requestId !== state.modalImageRequestId) return;
        els.img.classList.remove("is-loading");
        showToast("Image failed to load.", "error");
      };
    }

    if (els.downloadBtn) {
      const button = els.downloadBtn.cloneNode(true);
      els.downloadBtn.parentNode.replaceChild(button, els.downloadBtn);

      const btnLabel = button.querySelector(".download-btn-label");
      if (btnLabel) {
        btnLabel.textContent = art.downloadable
          ? "Download artwork"
          : "Not available for download";
      }

      button.disabled = !art.downloadable;
      button.classList.toggle("is-disabled", !art.downloadable);

      if (art.downloadable) {
        button.addEventListener("click", async () => {
          try {
            showToast("Preparing download…", "info");

            const response = await fetch(art.imageFull || art.imageThumb);
            if (!response.ok) throw new Error(`HTTP ${response.status}`);

            const blob = await response.blob();
            const blobUrl = URL.createObjectURL(blob);
            const link = document.createElement("a");
            link.style.display = "none";
            link.href = blobUrl;
            link.download = `${slugify(art.title)}.jpg`;
            document.body.appendChild(link);
            link.click();

            window.setTimeout(() => {
              URL.revokeObjectURL(blobUrl);
              link.remove();
            }, 1000);

            showToast("Download started.", "success");
          } catch (error) {
            console.error("Download failed:", error);
            showToast("Download failed. Try again.", "error");
          }
        });
      }
    }

    modalInstance.show();
  }

  function randomRange(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  function hsl(h, s, l) {
    return `hsl(${h} ${s}% ${l}%)`;
  }

  function updateGameStats() {
    setText(document.getElementById("game-score"), String(state.gameScore));
    setText(
      document.getElementById("game-time"),
      String(Math.max(0, state.gameTimeLeft)),
    );
    setText(document.getElementById("game-streak"), String(state.gameStreak));

    if (gameProgressBar) {
      const percent = Math.max(
        0,
        Math.min(100, (state.gameTimeLeft / state.gameTimeTotal) * 100),
      );
      gameProgressBar.style.transform = `scaleX(${percent / 100})`;
    }
  }

  function finishGame() {
    const board = document.getElementById("game-board");
    const messageEl = document.getElementById("game-message");

    state.gameActive = false;
    state.gameLocked = false;
    window.clearInterval(state.gameTimer);
    state.gameTimer = null;

    if (board) board.classList.add("is-hidden");
    if (messageEl)
      messageEl.textContent = `Time is up. Final score: ${state.gameScore}.`;

    showToast("Time is up.", "warning");
  }

  function buildGameBoard() {
    const board = document.getElementById("game-board");
    const messageEl = document.getElementById("game-message");
    if (!board || !messageEl) return;

    board.innerHTML = "";
    board.classList.remove("is-hidden");
    state.gameLocked = false;

    const baseSize = 4 + Math.floor(state.gameScore / 4);
    const maxSize =
      window.innerWidth < 576 ? 5 : window.innerWidth < 992 ? 6 : 7;
    const size = Math.min(
      maxSize,
      baseSize + randomRange(0, Math.min(1, Math.floor(state.gameScore / 8))),
    );
    const tileCount = size * size;
    const baseHue = randomRange(0, 359);
    const baseSat = randomRange(46, 74);
    const baseLight = randomRange(32, 58);
    const oddIndex = randomRange(0, tileCount - 1);
    const variationType = randomRange(0, 2);
    const subtleShift = Math.max(2, 12 - Math.floor(state.gameScore * 0.35));

    state.gameCorrectIndex = oddIndex;
    board.style.gridTemplateColumns = `repeat(${size}, minmax(0, 1fr))`;

    for (let i = 0; i < tileCount; i += 1) {
      const tile = document.createElement("button");
      tile.type = "button";
      tile.className = "game-tile";
      tile.setAttribute("aria-label", "Paint tile");

      const isOdd = i === oddIndex;
      let hue = baseHue;
      let sat = baseSat;
      let light = baseLight;

      if (isOdd) {
        if (variationType === 0) hue = (baseHue + subtleShift + 360) % 360;
        if (variationType === 1) sat = Math.min(96, baseSat + subtleShift);
        if (variationType === 2) light = Math.min(84, baseLight + subtleShift);
      } else {
        hue = (hue + randomRange(-3, 3) + 360) % 360;
        sat = Math.max(28, Math.min(88, sat + randomRange(-3, 3)));
        light = Math.max(18, Math.min(80, light + randomRange(-3, 3)));
      }

      const c1 = hsl(hue, sat, light);
      const c2 = hsl(
        (hue + randomRange(4, 16)) % 360,
        Math.max(36, sat - 8),
        Math.max(20, light - 10),
      );
      tile.style.background = `linear-gradient(135deg, ${c1}, ${c2})`;
      tile.style.boxShadow = isOdd
        ? "inset 0 0 0 1px rgba(255,255,255,0.2)"
        : "inset 0 0 0 1px rgba(255,255,255,0.08)";

      const handleClick = () => {
        if (!state.gameActive || state.gameLocked) return;

        if (i === state.gameCorrectIndex) {
          state.gameLocked = true;
          state.gameScore += 1;
          state.gameStreak += 1;
          updateGameStats();

          messageEl.textContent =
            state.gameStreak >= 3
              ? "Nice run. The patterns are getting subtler."
              : "Good eye. The board shifts again.";

          tile.classList.add("correct");
          window.setTimeout(
            () => {
              if (!state.gameActive) return;
              buildGameBoard();
              messageEl.textContent = "Keep going until the timer ends.";
            },
            Math.max(60, 120 - state.gameScore * 3),
          );
        } else {
          state.gameStreak = 0;
          state.gameTimeLeft = Math.max(0, state.gameTimeLeft - 1);
          updateGameStats();
          messageEl.textContent = "Wrong tile. Time drops a little.";

          tile.animate(
            [
              { transform: "translateX(0)" },
              { transform: "translateX(-4px)" },
              { transform: "translateX(4px)" },
              { transform: "translateX(0)" },
            ],
            { duration: 180 },
          );

          if (state.gameTimeLeft <= 0) {
            finishGame();
          }
        }
      };

      tile.addEventListener("click", handleClick);
      board.appendChild(tile);
    }

    updateGameStats();
  }

  function startGame(reset = false) {
    const messageEl = document.getElementById("game-message");

    if (reset) {
      state.gameScore = 0;
      state.gameStreak = 0;
      state.gameTimeTotal = 35;
      state.gameTimeLeft = 35;
    }

    state.gameActive = true;
    state.gameLocked = false;
    window.clearInterval(state.gameTimer);

    if (messageEl)
      messageEl.textContent =
        "Find the slightly different tile before time runs out.";

    buildGameBoard();

    state.gameTimer = window.setInterval(() => {
      if (!state.gameActive) return;

      state.gameTimeLeft -= 1;
      updateGameStats();

      if (state.gameTimeLeft <= 0) {
        finishGame();
      }
    }, 1000);
  }

  function bindGameControls() {
    const restartGameBtn = document.getElementById("game-restart");

    if (restartGameBtn) {
      restartGameBtn.addEventListener("click", () => startGame(true));
    }

    if (miniGameModalElement) {
      miniGameModalElement.addEventListener("shown.bs.modal", () =>
        startGame(true),
      );
      miniGameModalElement.addEventListener("hidden.bs.modal", () => {
        state.gameActive = false;
        window.clearInterval(state.gameTimer);
        state.gameTimer = null;
      });
    }

    if (openGameBtn) {
      openGameBtn.addEventListener("click", () => {
        if (gameModalInstance) gameModalInstance.show();
      });
    }
  }

  function bindHeroControls() {
    if (artworks.length) {
      const initial =
        artworks.find((art) => isFeaturedArt(art)) ||
        artworks[randomRange(0, artworks.length - 1)];
      setHeroSpotlight(initial);
    } else {
      setText(heroTitle, "No artwork yet");
      setText(heroCategory, "Add entries in artworks.js");
      setText(heroYear, "—");
      setText(heroMedium, "—");
      setText(
        heroDescription,
        "The hero spotlight will automatically use the first featured artwork when you add one.",
      );
    }

    if (heroTrigger) {
      heroTrigger.addEventListener("click", () => {
        if (state.activeSpotlight) openModal(state.activeSpotlight);
      });
    }

    if (openSpotlightBtn) {
      openSpotlightBtn.addEventListener("click", () => {
        if (state.activeSpotlight) openModal(state.activeSpotlight);
      });
    }

    if (shuffleSpotlightBtn) {
      shuffleSpotlightBtn.addEventListener("click", pickRandomSpotlight);
    }

    if (brandLink) {
      let clicks = 0;
      let resetTimer = null;

      brandLink.addEventListener("click", (event) => {
        clicks += 1;
        window.clearTimeout(resetTimer);
        resetTimer = window.setTimeout(() => {
          clicks = 0;
        }, 1200);

        if (clicks >= 5) {
          clicks = 0;
          event.preventDefault();
          if (gameModalInstance) gameModalInstance.show();
        }
      });
    }
  }

  function bindGalleryFilters() {
    if (!filterContainer) return;

    filterContainer.addEventListener("click", (event) => {
      const button = event.target.closest(".filter-btn");
      if (!button) return;

      filterContainer
        .querySelectorAll(".filter-btn")
        .forEach((btn) => btn.classList.remove("active"));
      button.classList.add("active");
      renderGallery(button.dataset.filter || "all");
    });
  }

  function bindBackToTop() {
    if (!backToTopBtn) return;

    backToTopBtn.addEventListener("click", () => {
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  }

  function bindScrollHandlers() {
    const onScroll = () => {
      updateNavbar();
      updateProgressBar();
      if (backToTopBtn)
        backToTopBtn.classList.toggle("visible", window.scrollY > 600);
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", updateProgressBar, { passive: true });
    onScroll();
  }

  if (currentYearElement) {
    currentYearElement.textContent = new Date().getFullYear();
  }

  updateStats();
  buildFilters();
  renderGallery("all");
  setupRevealEffects();
  setupSectionObserver();
  bindGalleryFilters();
  bindHeroControls();
  bindGameControls();
  bindBackToTop();
  bindScrollHandlers();
  updateNavbar();
  updateProgressBar();

  window.addEventListener("keydown", (event) => {
    if (
      event.ctrlKey &&
      event.shiftKey &&
      (event.key === "A" || event.key === "a")
    ) {
      event.preventDefault();
      if (gameModalInstance) gameModalInstance.show();
    }
  });

  if (artworkModalElement) {
    artworkModalElement.addEventListener("hidden.bs.modal", () => {
      const modalImage = document.getElementById("modal-image");
      if (modalImage) {
        modalImage.classList.remove("is-loading", "is-loaded");
        modalImage.src = "";
      }
    });
  }
});
