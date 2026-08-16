const DELIVERY_FEE = 100;

const cart = JSON.parse(localStorage.getItem("greeno-cart")) || [];

const checkoutView = document.getElementById("checkout-view");
const confirmationView = document.getElementById("confirmation-view");
const emptyView = document.getElementById("empty-view");

const summaryList = document.getElementById("summary-list");
const summarySubtotal = document.getElementById("summary-subtotal");
const summaryDelivery = document.getElementById("summary-delivery");
const summaryTotal = document.getElementById("summary-total");

const form = document.getElementById("checkout-form");
const formError = document.getElementById("form-error");

function subtotal() {
  return cart.reduce((sum, item) => sum + item.qty * item.price, 0);
}

function renderSummary() {
  summaryList.innerHTML = "";
  cart.forEach((item) => {
    const row = document.createElement("div");
    row.className = "summary-item";
    row.innerHTML = `
      <span class="summary-item__name">${item.name} <span class="summary-item__qty">× ${item.qty}</span></span>
      <span class="summary-item__price">Rs ${item.qty * item.price}</span>
    `;
    summaryList.appendChild(row);
  });

  const sub = subtotal();
  summarySubtotal.textContent = `Rs ${sub}`;
  summaryDelivery.textContent = `Rs ${DELIVERY_FEE}`;
  summaryTotal.textContent = `Rs ${sub + DELIVERY_FEE}`;
}

function showEmptyState() {
  checkoutView.classList.add("d-none");
  emptyView.classList.remove("d-none");
}

function generateOrderId() {
  const n = Math.floor(1000 + Math.random() * 9000);
  return `GRN-${n}`;
}

document.addEventListener("DOMContentLoaded", () => {
  if (cart.length === 0) {
    showEmptyState();
    return;
  }

  renderSummary();

  // Scroll-reveal for the two columns
  document.querySelectorAll(".reveal").forEach((el, i) => {
    setTimeout(() => el.classList.add("is-visible"), i * 120);
  });

  form.addEventListener("submit", (e) => {
    e.preventDefault();

    const name = document.getElementById("name").value.trim();
    const phone = document.getElementById("phone").value.trim();
    const address = document.getElementById("address").value.trim();
    const city = document.getElementById("city").value.trim();

    if (!name || !phone || !address || !city) {
      formError.textContent =
        "Please fill in your name, phone, address, and city.";
      return;
    }
    formError.textContent = "";

    const orderId = generateOrderId();

    // Clear the cart — the order is "placed"
    localStorage.removeItem("greeno-cart");

    document.getElementById("order-id").textContent = `Order #${orderId}`;
    document.getElementById("confirmation-name").textContent = `, ${name}`;

    checkoutView.classList.add("d-none");
    confirmationView.classList.remove("d-none");
  });
});
