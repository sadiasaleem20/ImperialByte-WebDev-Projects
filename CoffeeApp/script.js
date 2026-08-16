// ===================== CART STATE =====================
// Cart persists in localStorage so it survives a page refresh.
let cart = JSON.parse(localStorage.getItem("greeno-cart")) || [];

const cartBadge = document.getElementById("cart-badge");
const cartItemsEl = document.getElementById("cart-items");
const cartEmptyEl = document.getElementById("cart-empty");
const cartTotalEl = document.getElementById("cart-total");
const cartPanel = document.getElementById("cart-panel");
const cartOverlay = document.getElementById("cart-overlay");
const cartToggleBtn = document.getElementById("cart-toggle");
const cartCloseBtn = document.getElementById("cart-close");
const cartCheckoutBtn = document.getElementById("cart-checkout");

function saveCart() {
  localStorage.setItem("greeno-cart", JSON.stringify(cart));
}

function addToCart(id, name, price) {
  const existing = cart.find((item) => item.id === id);
  if (existing) {
    existing.qty += 1;
  } else {
    cart.push({ id, name, price, qty: 1 });
  }
  saveCart();
  renderCart();
}

function changeQty(id, delta) {
  const item = cart.find((i) => i.id === id);
  if (!item) return;
  item.qty += delta;
  if (item.qty <= 0) {
    cart = cart.filter((i) => i.id !== id);
  }
  saveCart();
  renderCart();
}

function removeItem(id) {
  cart = cart.filter((i) => i.id !== id);
  saveCart();
  renderCart();
}

function cartCount() {
  return cart.reduce((sum, item) => sum + item.qty, 0);
}

function cartSubtotal() {
  return cart.reduce((sum, item) => sum + item.qty * item.price, 0);
}

function renderCart() {
  cartBadge.textContent = cartCount();

  if (cart.length === 0) {
    cartItemsEl.innerHTML = "";
    cartItemsEl.appendChild(cartEmptyEl);
    cartTotalEl.textContent = "Rs 0";
    return;
  }

  cartItemsEl.innerHTML = "";
  cart.forEach((item) => {
    const row = document.createElement("div");
    row.className = "cart-item";
    row.innerHTML = `
      <div>
        <div class="cart-item__name">${item.name}</div>
        <div class="cart-item__price">Rs ${item.price} × ${item.qty}</div>
      </div>
      <div class="cart-item__qty">
        <button data-action="dec" data-id="${item.id}">−</button>
        <span>${item.qty}</span>
        <button data-action="inc" data-id="${item.id}">+</button>
      </div>
    `;
    cartItemsEl.appendChild(row);
  });

  cartTotalEl.textContent = `Rs ${cartSubtotal()}`;

  // Wire up qty buttons for this render
  cartItemsEl.querySelectorAll("button[data-action]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const id = btn.dataset.id;
      const delta = btn.dataset.action === "inc" ? 1 : -1;
      changeQty(id, delta);
    });
  });
}

function openCart() {
  cartPanel.classList.add("is-open");
  cartOverlay.classList.add("is-open");
}
function closeCart() {
  cartPanel.classList.remove("is-open");
  cartOverlay.classList.remove("is-open");
}

// ===================== EVENT WIRING =====================
document.addEventListener("DOMContentLoaded", () => {
  renderCart();

  // Add-to-cart buttons on product cards
  document.querySelectorAll(".add-to-cart").forEach((btn) => {
    btn.addEventListener("click", () => {
      const card = btn.closest(".card");
      const { id, name, price } = card.dataset;
      addToCart(id, name, Number(price));

      // Small visual confirmation on the button itself
      const original = btn.textContent;
      btn.textContent = "Added ✓";
      btn.classList.add("just-added");
      setTimeout(() => {
        btn.textContent = original;
        btn.classList.remove("just-added");
      }, 900);

      openCart();
    });
  });

  cartToggleBtn.addEventListener("click", openCart);
  cartCloseBtn.addEventListener("click", closeCart);
  cartOverlay.addEventListener("click", closeCart);

  cartCheckoutBtn.addEventListener("click", () => {
    if (cart.length === 0) {
      alert("Your cart is empty — add something first!");
      return;
    }
    // Cart is already saved to localStorage on every change, so checkout.html
    // can read it straight from there.
    window.location.href = "checkout.html";
  });

  // Scroll reveal
  const revealEls = document.querySelectorAll(".reveal");
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.15 },
  );
  revealEls.forEach((el) => observer.observe(el));

  // Smooth-scroll anchor links
  document.querySelectorAll('a[href^="#"]').forEach((link) => {
    link.addEventListener("click", (e) => {
      const target = document.querySelector(link.getAttribute("href"));
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    });
  });

  // Newsletter form (no backend — just a friendly confirmation)
  const form = document.getElementById("newsletter-form");
  const msg = document.getElementById("newsletter-msg");
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const email = document.getElementById("newsletter-email").value;
    msg.textContent = `You're on the list, ${email.split("@")[0]}. Watch for Friday's specials.`;
    form.reset();
  });
});
