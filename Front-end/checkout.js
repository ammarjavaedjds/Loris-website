document.addEventListener("DOMContentLoaded", function() {
  // 1. Check for direct checkout data FIRST
  const directData = localStorage.getItem('direct_checkout_data');
  const cartList = document.getElementById("checkout-cart-items");
  const totalEl = document.getElementById("checkout-total");

  if (directData) {
    const directCart = JSON.parse(directData);
    
    // Display exactly like cart items
    cartList.innerHTML = '';
    let total = 0;
    
    directCart.forEach(item => {
      const li = document.createElement("li");
      li.innerHTML = `
        ${item.name} - Rs. ${item.price} × ${item.quantity} = Rs. ${(item.price * item.quantity).toFixed(2)}
      `;
      cartList.appendChild(li);
      total += item.price * item.quantity;
    });

    totalEl.textContent = total.toFixed(2);
    localStorage.removeItem('direct_checkout_data'); // Clear temp data
    return; // Exit early
  }

  // 2. Normal cart handling (only runs if no direct checkout)
  const cart = JSON.parse(localStorage.getItem("cart")) || [];
  
  if (cart.length === 0) {
    cartList.innerHTML = "<li>Your cart is empty</li>";
    totalEl.textContent = "0";
  } else {
    let total = 0;
    cartList.innerHTML = "";
    cart.forEach(item => {
      const li = document.createElement("li");
      li.innerHTML = `
        ${item.name} - Rs. ${item.price} × ${item.quantity} = Rs. ${(item.price * item.quantity).toFixed(2)}
      `;
      cartList.appendChild(li);
      total += item.price * item.quantity;
    });
    totalEl.textContent = total.toFixed(2);
  }
});


function submitOrder(event) {
  event.preventDefault();

  const fname = document.getElementById("fname").value.trim();
  const lname = document.getElementById("lname").value.trim();
  const phone = document.getElementById("contact").value.trim();
  const address = document.getElementById("address").value.trim();
  const city = document.getElementById("city").value.trim();
  const postal = document.getElementById("postal").value.trim();
  const email = document.getElementById("email").value.trim();
  const notes = document.getElementById("notes").value.trim();

  // Get cart from either normal cart or direct checkout
  let cart = JSON.parse(localStorage.getItem("cart")) || [];
  const directCart = JSON.parse(localStorage.getItem("direct_checkout_data")) || [];

  if (directCart.length > 0) {
    cart = directCart;
  }

  if (!fname || !lname || !phone || !address || !city || !postal || cart.length === 0) {
    alert("Please fill all required fields and ensure cart is not empty.");
    return;
  }

  const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

const orderData = {
    name: `${fname} ${lname}`,
    phone: phone,
    address: `${address}, ${city}, ${postal}`,
    email: email,
    notes: notes,
    cart: cart,
    total: total // ✅ total price add kiya
};


  fetch("https://loris-website-production.up.railway.app/api/orders", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(orderData)
  })
  .then(async res => {
    const data = await res.json();
    if (!res.ok) throw data; // Backend error → catch block
    return data;
  })
  .then(data => {
    // ✅ Success alert
    alert("Order placed successfully! ID: " + data.order_id);

    // ✅ Clear checkout form
    const checkoutForm = document.getElementById("checkout-form");
    if (checkoutForm) {
     checkoutForm.reset();
    }

    // ✅ Empty checkout cart
    const checkoutCart = document.getElementById("checkout-cart-items");
    if (checkoutCart) {
      checkoutCart.innerHTML = "<li>Your cart is empty</li>";
    }

    // ✅ Reset checkout total
    const checkoutTotal = document.getElementById("checkout-total");
    if (checkoutTotal) {
      checkoutTotal.textContent = "0";
    }


    // Clear both cart storages
    localStorage.removeItem("cart");
    localStorage.removeItem("direct_checkout_data");

    // Update UI
    const cartContainer = document.getElementById("cart-items") || document.getElementById("checkout-cart-items");
    if (cartContainer) cartContainer.innerHTML = "<p>Your cart is empty.</p>";

    // Optional: if you have updateCartUI function
    if (typeof updateCartUI === "function") updateCartUI();
  })
  .catch(err => {
    console.error("Order placement error:", err);
    alert("Failed to place order: " + (err.error || "Unknown error"));
  });
}
