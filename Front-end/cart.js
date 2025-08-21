// Initialize cart only once
if (!window.cartInitialized) {
  window.cartInitialized = true;
  let cart = JSON.parse(localStorage.getItem("cart")) || [];
  
  // Remove global quantity variable
  // let quantity = 1; <- REMOVE THIS LINE

  function saveCart() {
    localStorage.setItem("cart", JSON.stringify(cart));
  }

  function updateCartUI() {
    const cartItems = document.getElementById("cart-items");
    const totalEl = document.getElementById("total");
    const cartCount = document.getElementById("cart-count");

    if (!cartItems || !totalEl || !cartCount) return;

    cartItems.innerHTML = "";
    let total = 0;

    cart.forEach((item, index) => {
      const li = document.createElement("li");
      li.innerHTML = `
        ${item.name} - Rs. ${item.price} × ${item.quantity} = Rs. ${(item.price * item.quantity).toFixed(2)}
        <button onclick="removeFromCart(${index})">Remove</button>
      `;
      cartItems.appendChild(li);
      total += item.price * item.quantity;
    });

    totalEl.textContent = total.toFixed(2);
    cartCount.textContent = cart.reduce((sum, item) => sum + item.quantity, 0);
  }

  function addToCart(name, price) {
    const existingItem = cart.find(item => item.name === name);
    
    if (existingItem) {
      existingItem.quantity = 2; // Always add just 1 quantity
    } else {
      cart.push({
        name,
        price,
        quantity: 1 // Default quantity is 1
      });
    }

    saveCart();
    updateCartUI();
  }

  function removeFromCart(index) {
    if (index >= 0 && index < cart.length) {
      cart.splice(index, 1);
      saveCart();
      updateCartUI();
    }
  }

  function toggleCart() {
    const panel = document.getElementById("cart-panel");
    if (panel) panel.classList.toggle("open");
  }

  function proceedToCheckout() {
    if (cart.length === 0) {
      alert("Your cart is empty!");
      return;
    }
    saveCart();
    window.location.href = "checkout.html";
  }

  // Initialize cart
  function initializeCart() {
    // Remove existing event listeners
    const buttons = document.querySelectorAll(".add-btn");
    buttons.forEach(btn => {
      btn.replaceWith(btn.cloneNode(true));
    });

    // Add fresh event listeners
    document.querySelectorAll(".add-btn").forEach(btn => {
      btn.addEventListener("click", function() {
        const productCard = this.closest(".product-card");
        const name = productCard.querySelector(".product-title").textContent.trim();
        const priceText = productCard.querySelector(".new-price").textContent
          .replace("Rs.", "")
          .replace(",", "")
          .trim();
        
        const price = parseFloat(priceText);
        
        if (!isNaN(price)) {
          addToCart(name, price);
        } else {
          console.error("Invalid price:", priceText);
        }
      });
    });

    updateCartUI();
  }

  // Wait for DOM to load
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initializeCart);
  } else {
    initializeCart();
  }
}