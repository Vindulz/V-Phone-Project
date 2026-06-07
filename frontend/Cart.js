const userId = localStorage.getItem("userId");
const token = localStorage.getItem("token");

function formatPrice(price) {
  return "Rp. " + Number(price).toLocaleString("id-ID");
}

async function loadCart() {
  if (!userId) {
    document.getElementById("empty-msg").textContent = "Please login to view your cart.";
    return;
  }

  try {
    const res = await fetch(`http://localhost:3000/api/orders/cart?userId=${userId}`);
    const items = await res.json();

    const cartContainer = document.getElementById("cart-items");
    const emptyMsg = document.getElementById("empty-msg");
    const totalSection = document.getElementById("cart-total-section");
    const cartCount = document.getElementById("nav-cart-count");

    if (!items || items.length === 0) {
      emptyMsg.style.display = "block";
      totalSection.style.display = "none";
      cartCount.textContent = "0";
      return;
    }

    emptyMsg.style.display = "none";
    totalSection.style.display = "flex";
    cartCount.textContent = items.length;
    cartContainer.innerHTML = "";

    items.forEach(item => {
      const card = document.createElement("div");
      card.classList.add("cart-card");
      card.dataset.id = item.id;
      card.dataset.price = item.price;
      card.innerHTML = `
        <div class="cart-card-info">
          <h3>${item.productName}</h3>
          <p class="unit-price">${formatPrice(item.price)} / unit</p>
          <p class="subtotal">${formatPrice(Number(item.price) * item.quantity)}</p>
        </div>
        <div class="cart-card-actions">
          <div class="qty-control">
            <button class="qty-btn" onclick="changeCartQty(${item.id}, -1)">−</button>
            <span class="qty-display" id="qty-display-${item.id}">${item.quantity}</span>
            <button class="qty-btn" onclick="changeCartQty(${item.id}, 1)">+</button>
          </div>
          <button class="remove-btn" onclick="removeItem(${item.id})">Remove</button>
        </div>
      `;
      cartContainer.appendChild(card);
    });

    updateTotal();

  } catch (err) {
    document.getElementById("empty-msg").textContent = "Could not load cart. Is the server running?";
  }
}

async function changeCartQty(id, delta) {
  const display = document.getElementById(`qty-display-${id}`);
  const current = parseInt(display.textContent);
  const newQty = current + delta;

  if (newQty < 1) {
    // Ask before removing
    if (confirm("Remove this item from cart?")) {
      removeItem(id);
    }
    return;
  }

  try {
    const res = await fetch(`http://localhost:3000/api/orders/cart/${id}/quantity`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ quantity: newQty }),
    });

    if (!res.ok) throw new Error("Failed");

    display.textContent = newQty;

    // Update subtotal on the card
    const card = display.closest(".cart-card");
    const unitPrice = Number(card.dataset.price);
    card.querySelector(".subtotal").textContent = formatPrice(unitPrice * newQty);

    updateTotal();

  } catch (err) {
    console.error(err);
  }
}

async function removeItem(id) {
  try {
    const res = await fetch(`http://localhost:3000/api/orders/cart/${id}`, {
      method: "DELETE",
    });

    if (!res.ok) throw new Error("Failed");

    const card = document.querySelector(`.cart-card[data-id="${id}"]`);
    if (card) {
      card.remove();
      updateCartCount(-1);
      updateTotal();
      checkEmpty();
    }

  } catch (err) {
    console.error(err);
  }
}

async function checkout() {
  if (!userId) {
    alert("Please login first.");
    return;
  }

  const checkoutBtn = document.querySelector(".checkout-btn");
  checkoutBtn.disabled = true;
  checkoutBtn.textContent = "Processing...";

  try {
    const res = await fetch(`http://localhost:3000/api/orders/checkout?userId=${userId}`, {
      method: "POST",
      headers: { ...(token ? { "Authorization": `Bearer ${token}` } : {}) },
    });

    const data = await res.json();

    if (!res.ok) {
      alert(data.message || "Checkout failed.");
      checkoutBtn.disabled = false;
      checkoutBtn.textContent = "Checkout";
      return;
    }

    const itemList = data.items
      .map(i => `• ${i.name} x${i.quantity} — ${formatPrice(Number(i.price) * i.quantity)}`)
      .join("\n");

    alert(`✅ ${data.message}\n\n${itemList}\n\nTotal: ${formatPrice(data.total)}\n\nThank you for shopping at V-Phone!`);

    document.getElementById("cart-items").innerHTML = "";
    document.getElementById("empty-msg").style.display = "block";
    document.getElementById("cart-total-section").style.display = "none";
    document.getElementById("nav-cart-count").textContent = "0";

  } catch (err) {
    console.error(err);
    alert("Checkout failed. Is the server running?");
    checkoutBtn.disabled = false;
    checkoutBtn.textContent = "Checkout";
  }
}

function updateTotal() {
  const cards = document.querySelectorAll(".cart-card");
  let total = 0;
  cards.forEach(card => {
    const unitPrice = Number(card.dataset.price);
    const qty = parseInt(card.querySelector(".qty-display").textContent);
    total += unitPrice * qty;
  });
  document.getElementById("cart-total").textContent = formatPrice(total);
}

function updateCartCount(delta) {
  const cartCount = document.getElementById("nav-cart-count");
  let count = Number(cartCount.textContent) || 0;
  cartCount.textContent = Math.max(0, count + delta);
}

function checkEmpty() {
  const cards = document.querySelectorAll(".cart-card");
  const emptyMsg = document.getElementById("empty-msg");
  const totalSection = document.getElementById("cart-total-section");
  if (cards.length === 0) {
    emptyMsg.style.display = "block";
    totalSection.style.display = "none";
    document.getElementById("nav-cart-count").textContent = "0";
  }
}

loadCart();