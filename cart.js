/* ============ CART.JS — Cart & Checkout Logic ============ */
(function() {
  'use strict';

  const CART_KEY = 'jossypraiz_cart';
  const WHATSAPP_NUMBER = '96891694398';

  function getCart() {
    return JSON.parse(localStorage.getItem(CART_KEY) || '[]');
  }
  function saveCart(cart) {
    localStorage.setItem(CART_KEY, JSON.stringify(cart));
    if (window.updateCartBadge) window.updateCartBadge();
  }

  /* --- Add to Cart --- */
  window.addToCart = function(productId, qty) {
    qty = qty || 1;
    const product = window.PRODUCTS && window.PRODUCTS.find(p => p.id === productId);
    if (!product) return;
    const cart = getCart();
    const existing = cart.find(item => item.id === productId);
    if (existing) {
      existing.qty += qty;
    } else {
      cart.push({ id: product.id, name: product.name, price: product.price, qty: qty, category: product.category, colors: product.colors });
    }
    saveCart(cart);
    showCartToast(product.name);
  };

  /* --- Remove from Cart --- */
  window.removeFromCart = function(productId) {
    let cart = getCart();
    cart = cart.filter(item => item.id !== productId);
    saveCart(cart);
    if (window.renderCartPage) window.renderCartPage();
  };

  /* --- Update Quantity --- */
  window.updateCartQty = function(productId, qty) {
    const cart = getCart();
    const item = cart.find(i => i.id === productId);
    if (item) {
      item.qty = Math.max(1, qty);
      saveCart(cart);
      if (window.renderCartPage) window.renderCartPage();
    }
  };

  /* --- Get Cart Total --- */
  window.getCartTotal = function() {
    return getCart().reduce((sum, item) => sum + item.price * item.qty, 0);
  };

  /* --- Cart Toast --- */
  function showCartToast(name) {
    let toast = document.getElementById('cart-toast');
    if (!toast) {
      toast = document.createElement('div');
      toast.id = 'cart-toast';
      toast.style.cssText = 'position:fixed;bottom:90px;right:24px;background:#111;color:#fff;padding:14px 24px;border-radius:12px;z-index:9999;font-size:0.9rem;box-shadow:0 4px 20px rgba(0,0,0,0.3);transform:translateY(20px);opacity:0;transition:all 0.3s ease;display:flex;align-items:center;gap:8px;';
      document.body.appendChild(toast);
    }
    toast.innerHTML = `<span style="color:#C89B3C;">✓</span> "${name}" added to cart`;
    toast.style.opacity = '1';
    toast.style.transform = 'translateY(0)';
    clearTimeout(toast._timeout);
    toast._timeout = setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateY(20px)';
    }, 2500);
  }

  /* --- Render Cart Page --- */
  window.renderCartPage = function() {
    const cartItemsEl = document.getElementById('cart-items');
    const cartSummaryEl = document.getElementById('cart-summary-content');
    const cartEmptyEl = document.getElementById('cart-empty');
    const cartFullEl = document.getElementById('cart-full');
    if (!cartItemsEl) return;

    const cart = getCart();

    if (cart.length === 0) {
      if (cartEmptyEl) cartEmptyEl.style.display = 'block';
      if (cartFullEl) cartFullEl.style.display = 'none';
      return;
    }
    if (cartEmptyEl) cartEmptyEl.style.display = 'none';
    if (cartFullEl) cartFullEl.style.display = 'grid';

    let itemsHTML = '';
    cart.forEach(item => {
      const c1 = item.colors ? item.colors[0] : '#C89B3C';
      const c2 = item.colors ? (item.colors[1] || '#A67C2E') : '#A67C2E';
      itemsHTML += `
        <div class="cart-item">
          <div class="cart-item-image">
            <div style="width:100%;height:100%;background:linear-gradient(135deg,${c1},${c2});display:flex;align-items:center;justify-content:center;color:rgba(255,255,255,0.3);font-size:1.5rem;">✦</div>
          </div>
          <div class="cart-item-info">
            <h3>${item.name}</h3>
            <p class="item-price">₦${item.price.toLocaleString()}</p>
          </div>
          <div class="cart-item-actions">
            <div class="quantity-selector">
              <button onclick="updateCartQty(${item.id}, ${item.qty - 1})">−</button>
              <input type="number" value="${item.qty}" min="1" onchange="updateCartQty(${item.id}, parseInt(this.value))" />
              <button onclick="updateCartQty(${item.id}, ${item.qty + 1})">+</button>
            </div>
            <p style="font-weight:700;color:var(--gold);">₦${(item.price * item.qty).toLocaleString()}</p>
            <button class="remove-btn" onclick="removeFromCart(${item.id})">✕ Remove</button>
          </div>
        </div>`;
    });
    cartItemsEl.innerHTML = itemsHTML;

    const subtotal = getCartTotal();
    const delivery = 2000;
    const total = subtotal + delivery;
    if (cartSummaryEl) {
      cartSummaryEl.innerHTML = `
        <div class="summary-row"><span>Subtotal</span><span>₦${subtotal.toLocaleString()}</span></div>
        <div class="summary-row"><span>Delivery</span><span>₦${delivery.toLocaleString()}</span></div>
        <div class="summary-row total"><span>Total</span><span class="amount">₦${total.toLocaleString()}</span></div>`;
    }
  };

  /* --- WhatsApp Order --- */
  window.sendWhatsAppOrder = function() {
    const cart = getCart();
    if (cart.length === 0) return alert('Your cart is empty!');
    const name = document.getElementById('checkout-name')?.value || '';
    const phone = document.getElementById('checkout-phone')?.value || '';
    const address = document.getElementById('checkout-address')?.value || '';

    let msg = '🛒 *New Order from JossyPraiz Textile Website*\n\n';
    msg += '*Order Items:*\n';
    cart.forEach((item, i) => {
      msg += `${i+1}. ${item.name} × ${item.qty} = ₦${(item.price * item.qty).toLocaleString()}\n`;
    });
    msg += `\n*Subtotal:* ₦${getCartTotal().toLocaleString()}`;
    msg += `\n*Delivery:* ₦2,000`;
    msg += `\n*Total:* ₦${(getCartTotal() + 2000).toLocaleString()}`;
    if (name) msg += `\n\n*Name:* ${name}`;
    if (phone) msg += `\n*Phone:* ${phone}`;
    if (address) msg += `\n*Address:* ${address}`;

    window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(msg)}`, '_blank');
  };

  /* --- Place Order (simple) --- */
  window.placeOrder = function(e) {
    if (e) e.preventDefault();
    const name = document.getElementById('checkout-name')?.value;
    const phone = document.getElementById('checkout-phone')?.value;
    const address = document.getElementById('checkout-address')?.value;
    if (!name || !phone || !address) return alert('Please fill in all fields.');
    alert(`Thank you, ${name}! Your order has been received. We'll contact you at ${phone} to confirm. You can also complete payment via WhatsApp.`);
    localStorage.removeItem(CART_KEY);
    if (window.updateCartBadge) window.updateCartBadge();
    if (window.renderCartPage) window.renderCartPage();
  };

})();
