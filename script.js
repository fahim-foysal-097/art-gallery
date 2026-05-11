// artwork database, add a new block here to update the site
const artworks = [
  {
    id: 1,
    title: "Block",
    category: "Digital",
    imageThumb: "/assets/thumbs/thumb-Block.webp",
    imageFull: "/assets/img/Block.jpg",
    description:
      "An exploration of form and color, this piece uses simple geometric shapes to create a visually striking composition.",
    year: "2023",
    medium: "Digital",
    downloadable: false,
  },
  {
    id: 2,
    title: "Urban Geometry",
    category: "Photography",
    imageThumb: "https://picsum.photos/seed/art2/500/300",
    imageFull: "https://picsum.photos/seed/art2/2000/1200",
    description:
      "Capturing the stark lines and brutalist architecture of modern metropolitan areas.",
    year: "2024",
    medium: "Photography",
    downloadable: true,
  },
  {
    id: 3,
    title: "Nebula Cascade",
    category: "Abstract",
    imageThumb: "https://picsum.photos/seed/art3/400/400",
    imageFull: "https://picsum.photos/seed/art3/1600/1600",
    description:
      "A generative art piece algorithmically created to simulate the chaotic yet beautiful expansion of cosmic dust.",
    year: "2024",
    medium: "Code/Canvas",
    downloadable: false,
  },
  {
    id: 4,
    title: "Silent Watcher",
    category: "Illustration",
    imageThumb: "https://picsum.photos/seed/art4/300/600",
    imageFull: "https://picsum.photos/seed/art4/1200/2400",
    description:
      "A character design study focusing on mood lighting and minimalist storytelling.",
    year: "2022",
    medium: "Digital Illustration",
    downloadable: true,
  },
  {
    id: 5,
    title: "Crimson Tides",
    category: "Digital",
    imageThumb: "https://picsum.photos/seed/art5/600/400",
    imageFull: "https://picsum.photos/seed/art5/2400/1600",
    description:
      "An emotional landscape depicting turbulence and passion through aggressive color palettes.",
    year: "2023",
    medium: "Digital",
    downloadable: false,
  },
  {
    id: 6,
    title: "Geometric Harmony",
    category: "Abstract",
    imageThumb: "https://picsum.photos/seed/art6/400/450",
    imageFull: "https://picsum.photos/seed/art6/1600/1800",
    description:
      "A study in balance and composition using basic geometric primitives and metallic textures.",
    year: "2024",
    medium: "3D Render",
    downloadable: false,
  },
  {
    id: 7,
    title: "Neon Nights",
    category: "Photography",
    imageThumb: "https://picsum.photos/seed/art7/800/450",
    imageFull: "https://picsum.photos/seed/art7/3200/1800",
    description:
      "Cyberpunk-inspired street photography taken in the heart of the metropolis.",
    year: "2023",
    medium: "Photography",
    downloadable: true,
  },
  {
    id: 8,
    title: "Flora & Fauna",
    category: "Illustration",
    imageThumb: "https://picsum.photos/seed/art8/350/350",
    imageFull: "https://picsum.photos/seed/art8/1400/1400",
    description:
      "A delicate botanical illustration exploring the intricate details of local plant life.",
    year: "2021",
    medium: "Ink and Watercolor",
    downloadable: false,
  },
  {
    id: 9,
    title: "Monolith",
    category: "3D Art",
    imageThumb: "https://picsum.photos/seed/art9/300/500",
    imageFull: "https://picsum.photos/seed/art9/1200/2000",
    description:
      "A surreal 3D environment depicting a massive, unexplainable structure in a barren wasteland.",
    year: "2024",
    medium: "Blender",
    downloadable: false,
  },
  {
    id: 10,
    title: "Fractured Memories",
    category: "Abstract",
    imageThumb: "https://picsum.photos/seed/art10/500/500",
    imageFull: "https://picsum.photos/seed/art10/2000/2000",
    description:
      "A collage of distorted memories, represented through fragmented shapes and glitch aesthetics.",
    year: "2022",
    medium: "Mixed Media",
    downloadable: false,
  },
  {
    id: 11,
    title: "Golden Hour",
    category: "Photography",
    imageThumb: "https://picsum.photos/seed/art11/400/533",
    imageFull: "https://picsum.photos/seed/art11/1500/2000",
    description:
      "Portrait photography emphasizing natural light and deep shadows.",
    year: "2024",
    medium: "Photography",
    downloadable: true,
  },
  {
    id: 12,
    title: "Mecha Concept",
    category: "Illustration",
    imageThumb: "https://picsum.photos/seed/art12/700/400",
    imageFull: "https://picsum.photos/seed/art12/2800/1600",
    description:
      "Concept art for a futuristic heavy loader mech, focusing on mechanical realism.",
    year: "2023",
    medium: "Digital Painting",
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
