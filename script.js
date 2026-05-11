// artwork database, add a new block here to update the site
const artworks = [
  {
    id: 1,
    title: "Block",
    category: "Abstract",
    imageThumb: "/assets/thumbs/thumb-Block.webp",
    imageFull: "/assets/img/Block.jpg",
    description:
      "An exploration of form and color, this piece uses simple geometric shapes to create a visually striking composition.",
    year: "2026",
    medium: "Digital",
    downloadable: false,
  },
  {
    id: 2,
    title: "Block Blur",
    category: "Abstract",
    imageThumb: "/assets/thumbs/thumb-Block-blur.webp",
    imageFull: "/assets/img/Block-blur.jpg",
    description: "Same as the original, but with a blurred effect.",
    year: "2026",
    medium: "Digital",
    downloadable: false,
  },
  {
    id: 3,
    title: "Block Paint",
    category: "Abstract",
    imageThumb: "/assets/thumbs/thumb-Block-paint.webp",
    imageFull: "/assets/img/Block-paint.jpg",
    description: "Same as the original, but with done with oil paints.",
    year: "2026",
    medium: "Digital",
    downloadable: false,
  },
  {
    id: 4,
    title: "Block Tree",
    category: "Abstract",
    imageThumb: "/assets/thumbs/thumb-Block-tree.webp",
    imageFull: "/assets/img/Block-tree.jpg",
    description:
      "A simple yet elegant composition of a tree with block elements.",
    year: "2026",
    medium: "Digital",
    downloadable: false,
  },
  {
    id: 5,
    title: "Block Tree Blur",
    category: "Abstract",
    imageThumb: "/assets/thumbs/thumb-Block-tree-blur.webp",
    imageFull: "/assets/img/Block-tree-blur.jpg",
    description: "Same as the original, but with a blurred effect.",
    year: "2026",
    medium: "Digital",
    downloadable: false,
  },
];

document.addEventListener("DOMContentLoaded", () => {
  // update the footer year
  const currentYearElement = document.getElementById("current-year");
  if (currentYearElement)
    currentYearElement.textContent = new Date().getFullYear();

  // shrink navbar when scroll down
  const navbar = document.getElementById("mainNav");
  if (navbar) {
    window.addEventListener("scroll", () => {
      if (window.scrollY > 50) {
        navbar.classList.add("py-2", "shadow-sm");
        navbar.classList.remove("py-3");
      } else {
        navbar.classList.add("py-3");
        navbar.classList.remove("py-2", "shadow-sm");
      }
    });
  }

  const filterContainer = document.getElementById("art-filters");
  const galleryContainer = document.getElementById("gallery-container");
  const artworkModalElement = document.getElementById("artworkModal");

  if (!filterContainer || !galleryContainer) return;

  // grab unique categories from my artwork array
  const categories = ["all", ...new Set(artworks.map((art) => art.category))];
  filterContainer.innerHTML = "";

  categories.forEach((category) => {
    const btn = document.createElement("button");
    btn.className = `filter-btn ${category === "all" ? "active" : ""}`;
    btn.setAttribute("data-filter", category);
    btn.textContent = category === "all" ? "All" : category;
    filterContainer.appendChild(btn);
  });

  let modalInstance = null;
  if (artworkModalElement) {
    modalInstance = new bootstrap.Modal(artworkModalElement);
  }

  // draw the masonry grid
  function renderGallery(filter = "all") {
    galleryContainer.style.opacity = "0";

    setTimeout(() => {
      galleryContainer.innerHTML = "";

      const filteredArt =
        filter === "all"
          ? artworks
          : artworks.filter((art) => art.category === filter);

      filteredArt.forEach((art) => {
        const itemWrapper = document.createElement("div");
        itemWrapper.className = "masonry-item";

        itemWrapper.innerHTML = `
                            <div class="gallery-item" data-id="${art.id}">
                                <div class="gallery-img-container">
                                    <img src="${art.imageThumb}" alt="${art.title}" class="gallery-img" loading="lazy">
                                </div>
                                <div class="gallery-overlay">
                                    <p class="gallery-category">${art.category}</p>
                                    <h3 class="gallery-title">${art.title}</h3>
                                </div>
                            </div>
                        `;

        itemWrapper
          .querySelector(".gallery-item")
          .addEventListener("click", () => {
            if (modalInstance) openModal(art);
          });

        galleryContainer.appendChild(itemWrapper);
      });

      galleryContainer.style.opacity = "1";
    }, 300);
  }

  renderGallery();

  // handle filter clicks
  filterContainer.addEventListener("click", (e) => {
    if (
      e.target &&
      e.target.nodeName === "BUTTON" &&
      e.target.classList.contains("filter-btn")
    ) {
      const buttons = filterContainer.querySelectorAll(".filter-btn");
      buttons.forEach((btn) => btn.classList.remove("active"));
      e.target.classList.add("active");

      renderGallery(e.target.getAttribute("data-filter"));
    }
  });

  // setup and show the fullscreen artwork modal

  let modalImageRequestId = 0;

  function openModal(art) {
    const els = {
      img: document.getElementById("modal-image"),
      title: document.getElementById("modal-title"),
      cat: document.getElementById("modal-category"),
      desc: document.getElementById("modal-description"),
      year: document.getElementById("modal-year"),
      medium: document.getElementById("modal-medium"),
      downloadBtn: document.getElementById("download-btn"),
    };

    if (els.title) els.title.textContent = art.title;
    if (els.cat) els.cat.textContent = art.category;
    if (els.desc) els.desc.textContent = art.description;
    if (els.year) els.year.textContent = art.year;
    if (els.medium) els.medium.textContent = art.medium;

    if (els.img) {
      const requestId = ++modalImageRequestId;

      // Show thumbnail immediately so the modal never flashes the previous art
      els.img.src = art.imageThumb;
      els.img.alt = art.title;
      els.img.classList.add("is-loading");
      els.img.classList.remove("is-loaded");

      // Preload the full image
      const preload = new Image();
      preload.src = art.imageFull;

      preload.onload = () => {
        if (requestId !== modalImageRequestId) return;

        els.img.src = art.imageFull;
        els.img.classList.remove("is-loading");
        els.img.classList.add("is-loaded");
      };

      preload.onerror = () => {
        if (requestId !== modalImageRequestId) return;

        els.img.classList.remove("is-loading");
        showSnackbar("Image failed to load.", "error");
      };
    }

    if (els.downloadBtn) {
      const newBtn = els.downloadBtn.cloneNode(true);
      els.downloadBtn.parentNode.replaceChild(newBtn, els.downloadBtn);

      newBtn.addEventListener("click", () => {
        if (art.downloadable) {
          showSnackbar("Starting download...", "success");

          fetch(art.imageFull)
            .then((response) => response.blob())
            .then((blob) => {
              const blobUrl = window.URL.createObjectURL(blob);
              const a = document.createElement("a");
              a.style.display = "none";
              a.href = blobUrl;
              a.download = `${art.title.replace(/[^a-z0-9]/gi, "_").toLowerCase()}.jpg`;
              document.body.appendChild(a);
              a.click();
              window.URL.revokeObjectURL(blobUrl);
              document.body.removeChild(a);
            })
            .catch((err) => {
              console.error("Download failed:", err);
              showSnackbar("Oops, download failed. Try again.", "error");
            });
        } else {
          showSnackbar("Not available for download.", "error");
        }
      });
    }

    modalInstance.show();
  }

  // popup notification helper
  let snackbarTimeout;
  function showSnackbar(message, type) {
    const snackbar = document.getElementById("snackbar");
    if (!snackbar) return;

    clearTimeout(snackbarTimeout);
    snackbar.className = "";
    void snackbar.offsetWidth;

    snackbar.textContent = message;
    snackbar.className = `show ${type}`;

    snackbarTimeout = setTimeout(() => {
      snackbar.className = snackbar.className.replace("show", "").trim();
    }, 3500);
  }
});
