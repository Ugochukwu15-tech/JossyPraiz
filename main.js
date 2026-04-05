/* ============ MAIN.JS — Shared UI Logic ============ */
(function() {
  'use strict';

  const WHATSAPP_NUMBER = '96891694398';

  /* --- Header scroll effect --- */
  const header = document.querySelector('.header');
  window.addEventListener('scroll', () => {
    header && header.classList.toggle('scrolled', window.scrollY > 50);
  });

  /* --- Mobile nav toggle --- */
  const hamburger = document.querySelector('.hamburger');
  const mobileNav = document.querySelector('.mobile-nav');
  if (hamburger && mobileNav) {
    hamburger.addEventListener('click', () => {
      hamburger.classList.toggle('active');
      mobileNav.classList.toggle('active');
      document.body.style.overflow = mobileNav.classList.contains('active') ? 'hidden' : '';
    });
    mobileNav.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        hamburger.classList.remove('active');
        mobileNav.classList.remove('active');
        document.body.style.overflow = '';
      });
    });
  }

  /* --- Search overlay --- */
  const searchBtn = document.querySelector('.nav-search-btn');
  const searchOverlay = document.querySelector('.search-overlay');
  const searchClose = document.querySelector('.search-close');
  const searchInput = document.querySelector('.search-overlay input');
  if (searchBtn && searchOverlay) {
    searchBtn.addEventListener('click', () => {
      searchOverlay.classList.add('active');
      setTimeout(() => searchInput && searchInput.focus(), 300);
    });
    searchClose && searchClose.addEventListener('click', () => searchOverlay.classList.remove('active'));
    searchOverlay.addEventListener('click', (e) => {
      if (e.target === searchOverlay) searchOverlay.classList.remove('active');
    });
    searchInput && searchInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && searchInput.value.trim()) {
        window.location.href = `shop.html?search=${encodeURIComponent(searchInput.value.trim())}`;
      }
    });
  }

  /* --- Scroll Animations (fade-in) --- */
  const fadeEls = document.querySelectorAll('.fade-in');
  if (fadeEls.length) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });
    fadeEls.forEach(el => observer.observe(el));
  }

  /* --- Product Card Generation --- */
  window.createProductCard = function(product) {
    const badgeHTML = product.badge
      ? `<span class="badge badge-${product.badge}">${product.badge === 'bestseller' ? '★ Bestseller' : product.badge === 'new' ? 'New' : product.badge === 'limited' ? 'Limited' : '% Sale'}</span>`
      : '';
    const oldPriceHTML = product.oldPrice ? `<span class="old">₦${product.oldPrice.toLocaleString()}</span>` : '';
    const fullStars = Math.floor(product.rating);
    const stars = '★'.repeat(fullStars) + (product.rating % 1 >= 0.5 ? '☆' : '');
    const colorGradient = product.colors[0] || '#C89B3C';
    const colorGradient2 = product.colors[1] || '#A67C2E';
    const colorGradient3 = product.colors[2] || colorGradient;
    const discount = product.oldPrice ? Math.round((1 - product.price / product.oldPrice) * 100) : 0;
    const discountBadge = discount > 0 ? `<span class="discount-tag">-${discount}%</span>` : '';

    return `
      <div class="product-card fade-in">
        ${badgeHTML}
        ${discountBadge}
        <div class="product-image">
          <div class="product-img-bg" style="background:linear-gradient(135deg,${colorGradient} 0%,${colorGradient2} 50%,${colorGradient3} 100%);">
            <svg width="80" height="80" viewBox="0 0 80 80" fill="none" style="opacity:0.15;">
              <path d="M40 0L45.5 27.6L73 20L52.4 40L73 60L45.5 52.4L40 80L34.5 52.4L7 60L27.6 40L7 20L34.5 27.6L40 0Z" fill="white"/>
            </svg>
          </div>
          <div class="quick-actions">
            <button class="btn btn-primary btn-sm" onclick="addToCart(${product.id})">Add to Cart</button>
            <a href="https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent('Hi, I want to order: ' + product.name + ' (₦' + product.price.toLocaleString() + ')')}" class="btn btn-whatsapp btn-sm" target="_blank">WhatsApp</a>
          </div>
        </div>
        <div class="product-info">
          <div class="product-category-tag">${getCategoryName(product.category)}</div>
          <h3><a href="product.html?id=${product.id}">${product.name}</a></h3>
          <div class="product-price">
            <span class="current">₦${product.price.toLocaleString()}</span>
            ${oldPriceHTML}
          </div>
          <div class="product-rating">
            <span class="stars">${stars}</span>
            <span class="count">${product.rating} (${product.reviews} reviews)</span>
          </div>
        </div>
      </div>`;
  };

  window.getCategoryName = function(catId) {
    const cat = window.CATEGORIES && window.CATEGORIES.find(c => c.id === catId);
    return cat ? cat.name : catId;
  };

  /* --- Render products into a container --- */
  window.renderProducts = function(containerId, products) {
    const container = document.getElementById(containerId);
    if (!container) return;
    container.innerHTML = products.map(p => createProductCard(p)).join('');
    // Re-init fade for new elements
    container.querySelectorAll('.fade-in').forEach(el => {
      const obs = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) { entry.target.classList.add('visible'); obs.unobserve(entry.target); }
        });
      }, { threshold: 0.1 });
      obs.observe(el);
    });
  };

  /* --- WhatsApp FAB --- */
  window.openWhatsApp = function(msg) {
    const defaultMsg = msg || 'Hi JossyPraiz Textile! I\'m interested in your fabrics. Can you help me?';
    window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(defaultMsg)}`, '_blank');
  };

  /* --- Update cart badge on page load --- */
  function updateCartBadge() {
    const badge = document.querySelector('.cart-badge');
    if (!badge) return;
    const cart = JSON.parse(localStorage.getItem('jossypraiz_cart') || '[]');
    const count = cart.reduce((sum, item) => sum + item.qty, 0);
    badge.textContent = count;
    badge.style.display = count > 0 ? 'flex' : 'none';
  }
  updateCartBadge();
  window.updateCartBadge = updateCartBadge;

  /* --- FAQ Accordion --- */
  document.querySelectorAll('.faq-question').forEach(btn => {
    btn.addEventListener('click', () => {
      const item = btn.closest('.faq-item');
      const answer = item.querySelector('.faq-answer');
      const wasActive = item.classList.contains('active');
      // close all
      document.querySelectorAll('.faq-item').forEach(i => {
        i.classList.remove('active');
        i.querySelector('.faq-answer').style.maxHeight = null;
      });
      if (!wasActive) {
        item.classList.add('active');
        answer.style.maxHeight = answer.scrollHeight + 'px';
      }
    });
  });

})();
