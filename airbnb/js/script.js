const listings = [
  {
    name: "Room in Islamabad",
    nights: 2,
    price: 46,
    rating: 4.89,
    cat: "cabin",
    img: "assets/house1.avif",
    grad: ["#C9A98C", "#7A5C43"],
  },
  {
    name: "Place to stay in Islamabad",
    nights: 2,
    price: 46,
    rating: 4.87,
    cat: "beach",
    img: "assets/house2.avif",
    grad: ["#D9C6A5", "#8A6D4E"],
  },
  {
    name: "Apartment in Islamabad",
    nights: 2,
    price: 39,
    rating: 5.0,
    cat: "design",
    img: "assets/house3.avif",
    grad: ["#B7A8C9", "#5B4A73"],
  },
  {
    name: "Room in Islamabad",
    nights: 2,
    price: 58,
    rating: 4.87,
    cat: "lake",
    img: "assets/house1.avif",
    grad: ["#8FB6D9", "#3E6A8F"],
  },
  {
    name: "Condo in Islamabad",
    nights: 2,
    price: 27,
    rating: 4.95,
    cat: "tiny",
    img: "assets/house2.avif",
    grad: ["#C9C4B8", "#726B5C"],
  },
  {
    name: "Apartment in Islamabad",
    nights: 2,
    price: 50,
    rating: 5.0,
    cat: "pool",
    img: "assets/house3.avif",
    grad: ["#D9B8A5", "#8F5A3E"],
  },
];

const grid = document.getElementById("grid");

function starIcon() {
  return '<svg viewBox="0 0 24 24" fill="#222"><path d="M12 2l2.9 6.9L22 9.8l-5.5 4.8L18 22l-6-3.9L6 22l1.5-7.4L2 9.8l7.1-.9z"/></svg>';
}
function heartIcon() {
  return '<svg viewBox="0 0 24 24"><path d="M12 21s-7.5-4.6-10-9.3C.5 8 2.3 4.5 6 4.5c2.1 0 3.6 1.2 6 3.6 2.4-2.4 3.9-3.6 6-3.6 3.7 0 5.5 3.5 4 7.2C19.5 16.4 12 21 12 21z"/></svg>';
}

function render(filter) {
  grid.innerHTML = "";
  const data =
    filter === "all" ? listings : listings.filter((l) => l.cat === filter);
  data.forEach((l) => {
    const el = document.createElement("div");
    el.className = "listing";
    el.innerHTML = `
      <div class="listing-media" style="background:linear-gradient(135deg, ${l.grad[0]}, ${l.grad[1]})">
        <img src="${l.img}" alt="${l.name}" class="listing-photo" loading="lazy">
        <span class="badge">Guest favorite</span>
        <button class="heart" aria-label="Save">${heartIcon()}</button>
      </div>
      <div class="listing-row">
        <h3>${l.name}</h3>
      </div>
      <p class="price">$${l.price} for ${l.nights} nights · ${starIcon()} ${l.rating.toFixed(2)}</p>
    `;
    grid.appendChild(el);
  });
}
render("all");

grid.addEventListener("click", (e) => {
  const heart = e.target.closest(".heart");
  if (heart) {
    heart.classList.toggle("liked");
    e.stopPropagation();
  }
});

// if an AVIF file is missing or misnamed, hide the broken <img>
// so the gradient underneath shows through instead of a broken-image icon
grid.addEventListener(
  "error",
  (e) => {
    if (e.target.classList && e.target.classList.contains("listing-photo")) {
      e.target.style.display = "none";
    }
  },
  true,
);

document.getElementById("catStrip").addEventListener("click", (e) => {
  const item = e.target.closest(".cat-item");
  if (!item) return;
  document
    .querySelectorAll(".cat-item")
    .forEach((c) => c.classList.remove("active"));
  item.classList.add("active");
  render(item.dataset.cat);
});

document.getElementById("searchForm").addEventListener("submit", (e) => {
  e.preventDefault();
  const where = document
    .getElementById("whereInput")
    .value.trim()
    .toLowerCase();
  const map = {
    beach: "beach",
    cabin: "cabin",
    pool: "pool",
    lake: "lake",
    farm: "farm",
  };
  const cat = map[where] || "all";
  document
    .querySelectorAll(".cat-item")
    .forEach((c) => c.classList.toggle("active", c.dataset.cat === cat));
  render(cat);
});

/* ---- Carousel arrow buttons ---- */
const prevBtn = document.getElementById("prevBtn");
const nextBtn = document.getElementById("nextBtn");
const SCROLL_STEP = 310; // one card width + gap

function updateArrowState() {
  prevBtn.disabled = grid.scrollLeft <= 0;
  nextBtn.disabled = grid.scrollLeft + grid.clientWidth >= grid.scrollWidth - 4;
}
prevBtn.addEventListener("click", () =>
  grid.scrollBy({ left: -SCROLL_STEP, behavior: "smooth" }),
);
nextBtn.addEventListener("click", () =>
  grid.scrollBy({ left: SCROLL_STEP, behavior: "smooth" }),
);
grid.addEventListener("scroll", updateArrowState);
updateArrowState();

/* ---- Scroll behavior: collapse full header + hide category row,
   swap in the compact "Anywhere · Anytime · Add guests" pill ---- */
const header = document.getElementById("mainHeader");
const SCROLL_THRESHOLD = 80;
let ticking = false;

function updateHeaderState() {
  const scrolled = window.scrollY > SCROLL_THRESHOLD;
  header.classList.toggle("scrolled", scrolled);
  ticking = false;
}

window.addEventListener("scroll", () => {
  if (!ticking) {
    requestAnimationFrame(updateHeaderState);
    ticking = true;
  }
});

// clicking the compact pill expands the full search bar back into view
document.getElementById("compactPillBtn").addEventListener("click", () => {
  window.scrollTo({ top: 0, behavior: "smooth" });
});

/* ---- Inspiration section: destination data per tab ---- */
const inspirationData = {
  popular: [
    ["Wilmington", "House rentals"],
    ["Key West", "Cottage rentals"],
    ["Galveston", "Vacation rentals"],
    ["Detroit", "Vacation rentals"],
    ["Albuquerque", "Vacation rentals"],
    ["Broken Bow", "Cabin rentals"],
    ["Amsterdam", "Condo rentals"],
    ["Portland", "Cabin rentals"],
    ["Minneapolis", "Vacation rentals"],
    ["Cincinnati", "Vacation rentals"],
    ["Charlotte", "Condo rentals"],
    ["Tampa", "Villa rentals"],
    ["Brooklyn", "Condo rentals"],
    ["Athens", "Villa rentals"],
    ["Cleveland", "Apartment rentals"],
    ["Maui", "Vacation rentals"],
    ["Oahu", "House rentals"],
  ],
  arts: [
    ["Amsterdam", "Condo rentals"],
    ["Athens", "Villa rentals"],
    ["Brooklyn", "Condo rentals"],
    ["Charlotte", "Condo rentals"],
    ["Cleveland", "Apartment rentals"],
    ["Detroit", "Vacation rentals"],
  ],
  beach: [
    ["Key West", "Cottage rentals"],
    ["Galveston", "Vacation rentals"],
    ["Tampa", "Villa rentals"],
    ["Maui", "Vacation rentals"],
    ["Oahu", "House rentals"],
    ["Athens", "Villa rentals"],
  ],
  mountains: [
    ["Broken Bow", "Cabin rentals"],
    ["Portland", "Cabin rentals"],
    ["Albuquerque", "Vacation rentals"],
    ["Minneapolis", "Vacation rentals"],
    ["Cincinnati", "Vacation rentals"],
    ["Detroit", "Vacation rentals"],
  ],
  outdoors: [
    ["Broken Bow", "Cabin rentals"],
    ["Portland", "Cabin rentals"],
    ["Maui", "Vacation rentals"],
    ["Oahu", "House rentals"],
    ["Galveston", "Vacation rentals"],
    ["Wilmington", "House rentals"],
  ],
  things: [
    ["Brooklyn", "Condo rentals"],
    ["Amsterdam", "Condo rentals"],
    ["Charlotte", "Condo rentals"],
    ["Cleveland", "Apartment rentals"],
    ["Cincinnati", "Vacation rentals"],
    ["Athens", "Villa rentals"],
  ],
  tips: [
    ["Wilmington", "House rentals"],
    ["Detroit", "Vacation rentals"],
    ["Minneapolis", "Vacation rentals"],
    ["Albuquerque", "Vacation rentals"],
    ["Tampa", "Villa rentals"],
    ["Key West", "Cottage rentals"],
  ],
  friendly: [
    ["Amsterdam", "Condo rentals"],
    ["Brooklyn", "Condo rentals"],
    ["Charlotte", "Condo rentals"],
    ["Cleveland", "Apartment rentals"],
    ["Cincinnati", "Vacation rentals"],
    ["Minneapolis", "Vacation rentals"],
  ],
};

const inspGrid = document.getElementById("inspGrid");
const INITIAL_COUNT = 11; // leaves the 12th grid slot for "Show more"
let inspExpanded = false;

function chevronIcon() {
  return '<svg viewBox="0 0 24 24" fill="none" stroke="#222" stroke-width="2"><path d="M6 9l6 6 6-6"/></svg>';
}

function renderInspiration(tab) {
  inspExpanded = false;
  const items = inspirationData[tab] || [];
  drawInspGrid(items);
}

function drawInspGrid(items) {
  inspGrid.innerHTML = "";
  const visibleCount = inspExpanded
    ? items.length
    : Math.min(INITIAL_COUNT, items.length);

  for (let i = 0; i < visibleCount; i++) {
    const [city, type] = items[i];
    const cell = document.createElement("div");
    cell.className = "col-6 col-md-4 col-lg-2 insp-item";
    cell.innerHTML = `<span class="city">${city}</span><span class="type">${type}</span>`;
    inspGrid.appendChild(cell);
  }

  if (items.length > INITIAL_COUNT) {
    const moreCell = document.createElement("div");
    moreCell.className =
      "col-6 col-md-4 col-lg-2 insp-item show-more-item" +
      (inspExpanded ? " open" : "");
    moreCell.innerHTML = `<button type="button" id="showMoreBtn">${inspExpanded ? "Show less" : "Show more"} ${chevronIcon()}</button>`;
    inspGrid.appendChild(moreCell);

    document.getElementById("showMoreBtn").addEventListener("click", () => {
      inspExpanded = !inspExpanded;
      const activeTab = document.querySelector(".insp-tab.active").dataset.tab;
      drawInspGrid(inspirationData[activeTab]);
    });
  }
}

renderInspiration("popular");

document.getElementById("inspirationTabs").addEventListener("click", (e) => {
  const tab = e.target.closest(".insp-tab");
  if (!tab) return;
  document
    .querySelectorAll(".insp-tab")
    .forEach((t) => t.classList.remove("active"));
  tab.classList.add("active");
  renderInspiration(tab.dataset.tab);
});
