// Main JavaScript for REHOTTOP Website

// Mobile menu toggle
document.addEventListener('DOMContentLoaded', function() {
  const menuToggle = document.querySelector('.menu-toggle');
  const nav = document.querySelector('.nav');

  if (menuToggle) {
    menuToggle.addEventListener('click', function() {
      nav.classList.toggle('active');
    });
  }

  // Close mobile menu when clicking outside
  document.addEventListener('click', function(event) {
    if (nav && nav.classList.contains('active')) {
      if (!nav.contains(event.target) && !menuToggle.contains(event.target)) {
        nav.classList.remove('active');
      }
    }
  });

  // Highlight active nav link
  const currentPage = window.location.pathname.split('/').pop() || 'index.html';
  const navLinks = document.querySelectorAll('.nav a');
  navLinks.forEach(link => {
    const linkPage = link.getAttribute('href');
    if (linkPage === currentPage || (currentPage === '' && linkPage === 'index.html')) {
      link.classList.add('active');
    }
  });
});

// Load prices from CSV file
async function loadPrices() {
  try {
    const response = await fetch('assets/prices.csv?v=' + Date.now());
    const csvText = await response.text();
    const lines = csvText.trim().split('\n');
    const prices = {};

    // Skip header row and parse each line
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;

      // Parse CSV line (handle commas in product names)
      const match = line.match(/^([^,]+),(.+),(\d+\.\d+)$/);
      if (match) {
        const productId = match[1].trim();
        const price = parseFloat(match[3]);
        prices[productId] = price;
      }
    }

    return prices;
  } catch (error) {
    console.error('Error loading prices:', error);
    return {};
  }
}

// Product loading and display
async function loadProducts() {
  try {
    const [productsResponse, prices] = await Promise.all([
      fetch('assets/products.json?v=1765337111'),
      loadPrices()
    ]);

    const products = await productsResponse.json();

    // Merge prices from CSV into products
    products.forEach(product => {
      if (prices[product.id] !== undefined) {
        product.price = prices[product.id];
      }
    });

    return products;
  } catch (error) {
    console.error('Error loading products:', error);
    return [];
  }
}

// Display products on home page
async function displayProducts() {
  const productGrid = document.getElementById('product-grid');
  if (!productGrid) return;

  const products = await loadProducts();

  if (products.length === 0) {
    productGrid.innerHTML = '<p>No products available.</p>';
    return;
  }

  productGrid.innerHTML = products.map((product, index) => {
    // Create a simplified product object for addToCart (without ratingDistribution)
    const cartProduct = {
      id: product.id,
      name: product.name,
      brand: product.brand,
      model: product.model,
      price: product.price,
      images: product.images,
      category: product.category
    };

    return `
    <div class="product-card">
      <a href="product.html?id=${product.id}" class="product-image">
        <img src="${product.images[0] || 'assets/images/placeholder.jpg'}"
             alt="${product.name}"
             loading="lazy">
      </a>
      <div class="product-info">
        <div class="product-category">${product.category}</div>
        <a href="product.html?id=${product.id}">
          <h3 class="product-name">${product.name}</h3>
        </a>
        ${product.rating && product.reviewCount ? `
          <div class="product-rating">
            <span class="rating-stars">${generateStars(product.rating)}</span>
            <span class="rating-count">(${product.reviewCount.toLocaleString()})</span>
          </div>
        ` : ''}
        <div class="product-price">$${product.price.toFixed(2)}</div>
        <button class="btn btn-primary" onclick='addToCart(${JSON.stringify(cartProduct).replace(/'/g, "&apos;")})'>Add to Cart</button>
      </div>
    </div>
    `;
  }).join('');
}

// Generate star rating HTML
function generateStars(rating) {
  const fullStars = Math.floor(rating);
  const hasHalfStar = (rating % 1) >= 0.3;
  const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);

  let stars = '';

  // Add full stars
  for (let i = 0; i < fullStars; i++) {
    stars += '★';
  }

  // Add half star using CSS class
  if (hasHalfStar) {
    stars += '<span class="star-half"></span>';
  }

  // Add empty stars
  for (let i = 0; i < emptyStars; i++) {
    stars += '☆';
  }

  return stars;
}

// Display product detail page
async function displayProductDetail() {
  const urlParams = new URLSearchParams(window.location.search);
  const productId = urlParams.get('id');

  if (!productId) {
    window.location.href = 'index.html';
    return;
  }

  const products = await loadProducts();
  const product = products.find(p => p.id === productId);

  if (!product) {
    window.location.href = '404.html';
    return;
  }

  // Update page title
  document.title = `${product.name} - REHOTTOP`;

  // Update meta description
  const metaDesc = document.querySelector('meta[name="description"]');
  if (metaDesc) {
    metaDesc.content = product.description.substring(0, 160);
  }

  // Display product name
  const productName = document.getElementById('product-name');
  if (productName) {
    productName.textContent = product.name;
  }

  // Display category
  const productCategory = document.getElementById('product-category');
  if (productCategory) {
    productCategory.textContent = product.category;
  }

  // Display brand
  const productBrand = document.getElementById('product-brand');
  if (productBrand) {
    productBrand.textContent = product.brand;
  }

  // Display model
  const productModel = document.getElementById('product-model');
  if (productModel) {
    productModel.textContent = product.model || 'N/A';
  }

  // Display rating in product header
  if (product.rating && product.reviewCount) {
    const ratingContainer = document.getElementById('product-detail-rating');
    const ratingStars = document.getElementById('product-detail-stars');
    const ratingCount = document.getElementById('product-detail-count');

    if (ratingContainer && ratingStars && ratingCount) {
      const starsHTML = generateStars(product.rating);
      console.log('Product rating:', product.rating, 'Stars HTML:', starsHTML);
      ratingStars.innerHTML = starsHTML;
      ratingCount.textContent = `(${product.reviewCount.toLocaleString()})`;
      ratingContainer.style.display = 'flex';
    }
  }

  // Display price
  const productPrice = document.getElementById('product-price');
  if (productPrice) {
    productPrice.textContent = `$${product.price.toFixed(2)}`;
  }

  // Display description
  const productDescription = document.getElementById('product-description');
  if (productDescription) {
    productDescription.textContent = product.description;
  }

  // Display images
  const mainImage = document.getElementById('main-image');
  const thumbnailList = document.getElementById('thumbnail-list');

  if (product.images && product.images.length > 0) {
    if (mainImage) {
      mainImage.src = product.images[0];
      mainImage.alt = product.name;
    }

    if (thumbnailList) {
      thumbnailList.innerHTML = product.images.map((img, index) => `
        <div class="thumbnail ${index === 0 ? 'active' : ''}" data-index="${index}">
          <img src="${img}" alt="${product.name} - Image ${index + 1}" loading="lazy">
        </div>
      `).join('');

      // Add click event to thumbnails
      const thumbnails = thumbnailList.querySelectorAll('.thumbnail');
      thumbnails.forEach(thumb => {
        thumb.addEventListener('click', function() {
          const index = this.getAttribute('data-index');
          mainImage.src = product.images[index];

          // Update active state
          thumbnails.forEach(t => t.classList.remove('active'));
          this.classList.add('active');
        });
      });
    }
  }

  // Add to Cart button functionality for product detail page
  const addToCartBtn = document.getElementById('add-to-cart-btn');
  if (addToCartBtn) {
    addToCartBtn.addEventListener('click', function() {
      addToCart(product);
    });
  }

  // Initialize reviews for this product
  initializeReviews(product);
}

// Initialize reviews for product page
async function initializeReviews(product) {
  if (typeof reviewSystem === 'undefined') return;

  // Load review CSV
  await reviewSystem.loadReviews();

  // Display rating summary
  const ratingStars = document.getElementById('product-rating-stars');
  const ratingValue = document.getElementById('product-rating-value');
  const ratingCount = document.getElementById('product-rating-count');

  if (ratingStars && product.rating) {
    ratingStars.innerHTML = reviewSystem.renderStars(product.rating);
  }

  if (ratingValue && product.rating) {
    ratingValue.textContent = product.rating.toFixed(1);
  }

  if (ratingCount && product.reviewCount) {
    ratingCount.textContent = `${product.reviewCount.toLocaleString()}`;
  }

  // Initialize and display reviews
  if (product.reviewCount) {
    reviewSystem.initializeForProduct(product.reviewCount, product.ratingDistribution);
    reviewSystem.renderReviews('.reviews-list');

    // Render rating breakdown for Judge.me style
    const breakdownContainer = document.getElementById('rating-breakdown-container');
    if (breakdownContainer) {
      // Use custom distribution if available, otherwise calculate from reviews
      if (product.ratingDistribution) {
        breakdownContainer.innerHTML = renderCustomRatingBreakdown(product.ratingDistribution);
      } else {
        breakdownContainer.innerHTML = reviewSystem.renderRatingBreakdown();
      }
    }
  }
}

// Render custom rating breakdown
function renderCustomRatingBreakdown(distribution) {
  let html = '<div class="rating-breakdown">';

  for (let i = 5; i >= 1; i--) {
    const percent = distribution[i.toString()] || 0;
    html += `
      <div class="rating-bar-row">
        <span class="rating-label">${i} star${i !== 1 ? 's' : ''}</span>
        <div class="rating-bar-container">
          <div class="rating-bar-fill" style="width: ${percent}%"></div>
        </div>
        <span class="rating-percentage">${percent}%</span>
      </div>
    `;
  }

  html += '</div>';
  return html;
}

// Search/Filter functionality (optional enhancement)
function filterProducts(category) {
  const productCards = document.querySelectorAll('.product-card');
  productCards.forEach(card => {
    const cardCategory = card.querySelector('.product-category').textContent;
    if (category === 'all' || cardCategory === category) {
      card.style.display = 'flex';
    } else {
      card.style.display = 'none';
    }
  });
}

// Smooth scroll to top
function scrollToTop() {
  window.scrollTo({
    top: 0,
    behavior: 'smooth'
  });
}

// Initialize page-specific functions
document.addEventListener('DOMContentLoaded', function() {
  const currentPage = window.location.pathname.split('/').pop();

  if (currentPage === 'index.html' || currentPage === '') {
    displayProducts();
  } else if (currentPage === 'product.html') {
    displayProductDetail();
  }
});

// Shopping Cart functionality
let cart = [];

function addToCart(product) {
  cart.push(product);
  updateCartCount();
  showNotification('Added to cart!');
}

function updateCartCount() {
  const cartCount = document.getElementById('cart-count');
  if (cartCount) {
    cartCount.textContent = cart.length;
    cartCount.style.display = cart.length > 0 ? 'flex' : 'none';
  }
}

function showNotification(message) {
  // Simple notification (could be enhanced)
  const notification = document.createElement('div');
  notification.textContent = message;
  notification.style.cssText = `
    position: fixed;
    top: 100px;
    right: 20px;
    background: var(--color-success, #52b548);
    color: white;
    padding: 1rem 1.5rem;
    border-radius: 0.5rem;
    box-shadow: 0 4px 6px rgba(0,0,0,0.1);
    z-index: 10000;
    animation: slideIn 0.3s ease-out;
  `;
  document.body.appendChild(notification);
  setTimeout(() => {
    notification.remove();
  }, 2000);
}

function openCart() {
  const modal = document.getElementById('cart-modal');
  if (!modal) return;

  const cartItemsContainer = document.getElementById('cart-items-list');
  const cartTotal = document.getElementById('cart-total-amount');

  if (cart.length === 0) {
    cartItemsContainer.innerHTML = '<div class="cart-empty">Your cart is empty</div>';
    cartTotal.textContent = '$0.00';
  } else {
    let total = 0;
    cartItemsContainer.innerHTML = cart.map(item => {
      total += item.price;
      return `
        <div class="cart-item">
          <img src="${item.images[0]}" alt="${item.name}" class="cart-item-image">
          <div class="cart-item-info">
            <div class="cart-item-name">${item.name}</div>
            <div class="cart-item-price">$${item.price.toFixed(2)}</div>
          </div>
        </div>
      `;
    }).join('');
    cartTotal.textContent = `$${total.toFixed(2)}`;
  }

  modal.classList.add('active');
}

function closeCart() {
  const modal = document.getElementById('cart-modal');
  if (modal) {
    modal.classList.remove('active');
  }
}

function proceedToCheckout() {
  if (cart.length === 0) {
    alert('Your cart is empty!');
    return;
  }

  // Save cart to localStorage for checkout page
  localStorage.setItem('checkoutCart', JSON.stringify(cart));

  // Redirect to checkout page
  window.location.href = 'checkout.html';
}

// Close modal when clicking outside
document.addEventListener('click', function(event) {
  const modal = document.getElementById('cart-modal');
  if (modal && event.target === modal) {
    closeCart();
  }
});

// Export functions for use in HTML
window.filterProducts = filterProducts;
window.scrollToTop = scrollToTop;
window.addToCart = addToCart;
window.openCart = openCart;
window.closeCart = closeCart;
window.proceedToCheckout = proceedToCheckout;
