/**
 * In-memory cart management, synced with localStorage.
 * Provides functions to load, save, and display cart, and handle checkout.
 */
let cart = [];

// ----------------------------------------------
// Load and save cart from/to localStorage
// ----------------------------------------------
/**
 * Loads cart data from localStorage.
 * @function loadCartFromStorage
 */
const loadCartFromStorage = () => {
  try {
    const raw = localStorage.getItem("cart");
    cart = raw ? JSON.parse(raw) : [];
  } catch (err) {
    console.error("Failed to parse cart from localStorage:", err);
    cart = [];
  }
};

/**
 * Saves cart data to localStorage.
 * @function saveCartToStorage
 */
const saveCartToStorage = () => {
  try {
    localStorage.setItem("cart", JSON.stringify(cart));
  } catch (err) {
    console.error("Failed to write cart to localStorage:", err);
  }
};

// ----------------------------------------------
// Floating Cart Button
// ----------------------------------------------
/**
 * Shows the floating cart button and attaches event listeners.
 * @function showCartButton
 */
const showCartButton = () => {
  let cartBtn = document.getElementById("floating-cart-btn");

  if (!cartBtn) {
    cartBtn = document.createElement("div");
    cartBtn.id = "floating-cart-btn";
    cartBtn.style.cssText = `
      position: fixed;
      bottom: 2rem;
      right: 2rem;
      background: #00ff88;
      color: #0b0b0b;
      padding: 1rem 1.5rem;
      border-radius: 3.125rem;
      font-weight: bold;
      cursor: pointer;
      z-index: 999;
      box-shadow: 0 0.25rem 0.75rem rgba(0, 255, 136, 0.4);
      transition: all 0.3s ease;
    `;

    cartBtn.addEventListener("click", proceedToCheckout);

    cartBtn.addEventListener("mouseover", () => {
      cartBtn.style.transform = "scale(1.05)";
      cartBtn.style.boxShadow = "0 0.375rem 1rem rgba(0, 255, 136, 0.6)";
    });

    cartBtn.addEventListener("mouseout", () => {
      cartBtn.style.transform = "scale(1)";
      cartBtn.style.boxShadow = "0 0.25rem 0.75rem rgba(0, 255, 136, 0.4)";
    });

    document.body.appendChild(cartBtn);
  }

  const totalItems = cart.reduce((sum, item) => sum + (item.quantity || 1), 0);
  cartBtn.textContent = `🛒 ${window.t && window.t.view_cart ? window.t.view_cart : 'View Cart'} (${totalItems})`;
  cartBtn.style.display = totalItems > 0 ? "block" : "none";
};

// ----------------------------------------------
// Notification Popup
// ----------------------------------------------
const showNotification = (message) => {
  let notification = document.getElementById("notification");

  if (!notification) {
    notification = document.createElement("div");
    notification.id = "notification";
    notification.style.cssText = `
      position: fixed;
      top: 6.25rem;
      right: 2rem;
      background: #00ff88;
      color: #0b0b0b;
      padding: 1rem 1.5rem;
      border-radius: 0.5rem;
      font-weight: bold;
      z-index: 1000;
      box-shadow: 0 0.25rem 0.75rem rgba(0, 255, 136, 0.4);
      animation: slideIn 0.3s ease;
    `;
    document.body.appendChild(notification);
  }

  notification.textContent = message;
  notification.style.display = "block";

  setTimeout(() => {
    notification.style.display = "none";
  }, 2000);
};

// Add notification keyframe animation
(() => {
  const style = document.createElement("style");
  style.textContent = `
    @keyframes slideIn {
      from { transform: translateX(25rem); opacity: 0; }
      to   { transform: translateX(0); opacity: 1; }
    }
  `;
  document.head.appendChild(style);
})();

// ----------------------------------------------
// Add to Cart (main function)
// ----------------------------------------------
/**
 * Adds an item to the cart.
 * @function addToCart
 */
export function addToCart(item) {
  const id = item._id || item.id;
  if (!id) {
    console.error("addToCart: item has no id/_id", item);
    return;
  }

  loadCartFromStorage();

  const existing = cart.find((i) => (i._id || i.id) === id);

  if (existing) {
    existing.quantity = (existing.quantity || 1) + 1;
  } else {
    cart.push({
      ...item,
      quantity: 1,
    });
  }

  saveCartToStorage();

  showCartButton();
  showNotification(`${item.name} ${window.t && window.t.added_to_cart ? window.t.added_to_cart : 'added to cart!'}`);
  console.log("Cart updated:", cart);
}

// ----------------------------------------------
// Proceed to Checkout
// ----------------------------------------------
const proceedToCheckout = () => {
  fetch("/api/v1/orders/user-details", {
    method: "GET",
    credentials: "same-origin",
  })
    .then(res => res.json())
    .then(data => {
      if (!data.error) {
        window.location.href = "/revontulet/cart";
      } else {
        window.location.href = "/revontulet/login?next=/revontulet/order-confirmation";
      }
    })
    .catch(err => {
      console.error("Failed to check login:", err);
      window.location.href = "/revontulet/login?next=/revontulet/order-confirmation";
    });
};

// ----------------------------------------------
// Initialize on menu page
// ----------------------------------------------
export const initCartUI = () => {
  loadCartFromStorage();
  showCartButton();
  console.log("Cart initialized:", cart);
};
