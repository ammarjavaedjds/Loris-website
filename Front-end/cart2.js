let cart = JSON.parse(localStorage.getItem('cart')) || [];

// Quantity management
function increaseQty() {
  const qtyInput = document.getElementById('quantity');
  qtyInput.value = parseInt(qtyInput.value) + 1;
}

function decreaseQty() {
  const qtyInput = document.getElementById('quantity');
  if (qtyInput.value > 1) {
    qtyInput.value = parseInt(qtyInput.value) - 1;
  }
}

function addToCartWithQty(productName, productPrice) {
  const quantity = parseInt(document.getElementById('quantity').value);
  addToCart(productName, productPrice, quantity);
}

function directCheckout(productName, productPrice) {

  const tempCheckoutItem = [{
    name: productName,
    price: productPrice,
    quantity: 1
  }];
  localStorage.setItem('direct_checkout_item', JSON.stringify(tempCheckoutItem));


  window.location.href = "checkout.html";
}

// Main cart functions
function addToCart(name, price, quantity = 1) {
  const existingItem = cart.find(item => item.name === name);
  
  if (existingItem) {
    existingItem.quantity += quantity;
  } else {
    cart.push({
      name,
      price,
      quantity
    });
  }
  
  saveCart();
  updateCartUI();
  resetQuantity();
}

function removeItem(productName) {
  cart = cart.filter(item => item.name !== productName);
  saveCart();
  updateCartUI();
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

function saveCart() {
  localStorage.setItem('cart', JSON.stringify(cart));
}

function updateCartUI() {
  const cartItems = document.getElementById('cart-items');
  const totalEl = document.getElementById('total');
  const countEl = document.getElementById('cart-count');
  
  let total = 0;
  let itemCount = 0;
  
  if (cartItems) {
    cartItems.innerHTML = '';
    cart.forEach(item => {
      const li = document.createElement('li');
      li.innerHTML = `
        ${item.name} - Rs.${item.price} × ${item.quantity} = Rs.${(item.price * item.quantity).toFixed(2)}
        <button onclick="removeItem('${item.name}')">Remove</button>
      `;
      cartItems.appendChild(li);
      total += item.price * item.quantity;
      itemCount += item.quantity;
    });
  }
  
  if (totalEl) totalEl.textContent = total.toFixed(2);
  if (countEl) countEl.textContent = itemCount;
}

function resetQuantity() {
  document.getElementById('quantity').value = 1;
}

// Initialize on page load
window.onload = () => {
  updateCartUI();
  if (document.getElementById('cart-panel')) {
    document.getElementById('cart-panel').classList.remove('show');
  }
};
function buyNowDirect(productName, productPrice) {
    const quantity = parseInt(document.getElementById("quantity").value) || 1;

    let cart = JSON.parse(localStorage.getItem("cart")) || [];

    const existingItem = cart.find(item => item.name === productName);
    if (existingItem) {
      existingItem.quantity += quantity;
    } else {
      cart.push({
        name: productName,
        price: productPrice,
        quantity: quantity
      });
    }

    localStorage.setItem("cart", JSON.stringify(cart));

    // ✅ Redirect directly to checkout
    window.location.href = "checkout.html";
  }

function submitOrder() {
  const name = document.getElementById("customer-name").value.trim();
  const phone = document.getElementById("customer-phone").value.trim();
  const address = document.getElementById("customer-address").value.trim();

  if (!name || !phone || !address) {
    alert("Please fill all required fields.");
    return;
  }

  // STEP: Try to read both cart options
  let cart = JSON.parse(localStorage.getItem("cart"));

  if (!cart || cart.length === 0) {
    cart = JSON.parse(localStorage.getItem("direct_checkout_data"));
  }

  // If still empty
  if (!cart || cart.length === 0) {
    alert("Cart is empty!");
    return;
  }

  const orderData = {
    name,
    phone,
    address,
    cart
  };

  fetch("http://localhost:5000/submit-order", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(orderData)
  })
    .then(response => response.json())
    .then(data => {
      alert("Order placed successfully!");
      localStorage.removeItem("cart");
      localStorage.removeItem("direct_checkout_data");

      // OPTIONAL: Clear the form after submit
      document.getElementById("customer-name").value = "";
      document.getElementById("customer-phone").value = "";
      document.getElementById("customer-address").value = "";

      window.location.href = "thankyou.html"; // redirect
    })
    .catch(error => {
      console.error("Order Error:", error);
      alert("Something went wrong while placing order.");
    });
}
