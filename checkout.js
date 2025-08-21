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
  event.preventDefault(); // Prevent page reload

  const fname = document.getElementById("fname").value.trim();
  const lname = document.getElementById("lname").value.trim();
  const phone = document.getElementById("contact").value.trim();
  const address = document.getElementById("address").value.trim();
  const city = document.getElementById("city").value.trim();
  const postal = document.getElementById("postal").value.trim();
  const email = document.getElementById("email").value.trim();
  const notes = document.getElementById("notes").value.trim();

  const cart =
    JSON.parse(localStorage.getItem("cart")) ||
    JSON.parse(localStorage.getItem("direct_checkout_data")) ||
    [];


  if (!fname || !lname || !phone || !address || !city || !postal || cart.length === 0) {
    alert("Please fill all required fields and ensure cart is not empty.");
    return;
  }

  const orderData = {
    name: `${fname} ${lname}`,
    phone: phone,
    address: `${address}, ${city}, ${postal}`,
    email: email,
    notes: notes,
    cart: cart
  };

  fetch("https://loris-website-production.up.railway.app/api/orders", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify(orderData)
  })
  .then(res => res.json())
  .then(data => {
    if (data.error) {
      alert("Failed: " + data.error);
    } else {
      alert("Order placed successfully! ID: " + data.order_id);

      // ✅ Clear form fields
      document.getElementById("checkout-form").reset();

      // ✅ Empty cart
      localStorage.removeItem("cart");

      // ✅ Update cart UI
      if (typeof updateCartUI === "function") {
        updateCartUI(); // agar tumhara function bana hua hai
      } else {
        const cartContainer = document.getElementById("cart-items");
        if (cartContainer) {
          cartContainer.innerHTML = "<p>Your cart is empty.</p>";
        }
      }
    }
  })
  .catch(err => {
    console.error(err);
    alert("Failed to place order");
  });
}