// Checkout Page Logic
document.addEventListener('DOMContentLoaded', function() {
    // Load cart items from localStorage
    loadCheckoutCart();

    // Handle form submission
    const checkoutForm = document.getElementById('checkout-form');
    if (checkoutForm) {
        checkoutForm.addEventListener('submit', handleCheckoutSubmit);
    }
});

function loadCheckoutCart() {
    const orderSummary = document.getElementById('order-summary');
    if (!orderSummary) return;

    // Get cart from localStorage (set by main.js before redirect)
    const cartData = localStorage.getItem('checkoutCart');
    if (!cartData) {
        orderSummary.innerHTML = `
            <p style="text-align: center; color: #666;">Your cart is empty.</p>
            <a href="index.html" class="btn btn-primary" style="display: block; text-align: center; margin-top: 1rem; text-decoration: none;">
                Continue Shopping
            </a>
        `;
        return;
    }

    const cart = JSON.parse(cartData);

    // Calculate totals
    const subtotal = cart.reduce((sum, item) => sum + item.price, 0);
    const tax = subtotal * 0.08; // 8% tax
    const shipping = subtotal > 50 ? 0 : 9.99;
    const total = subtotal + tax + shipping;

    // Render cart items and summary
    let html = '<div style="margin-bottom: 1.5rem;">';

    cart.forEach(item => {
        html += `
            <div style="display: flex; gap: 1rem; margin-bottom: 1rem; padding-bottom: 1rem; border-bottom: 1px solid #ddd;">
                <img src="${item.image}" alt="${item.name}" style="width: 80px; height: 80px; object-fit: cover; border-radius: 8px;">
                <div style="flex: 1;">
                    <div style="font-weight: 600; margin-bottom: 0.25rem;">${item.name}</div>
                    <div style="color: var(--color-primary); font-weight: 600;">$${item.price.toFixed(2)}</div>
                </div>
            </div>
        `;
    });

    html += '</div>';

    // Add summary totals
    html += `
        <div style="border-top: 2px solid #333; padding-top: 1rem;">
            <div style="display: flex; justify-content: space-between; margin-bottom: 0.5rem;">
                <span>Subtotal:</span>
                <span>$${subtotal.toFixed(2)}</span>
            </div>
            <div style="display: flex; justify-content: space-between; margin-bottom: 0.5rem;">
                <span>Tax (8%):</span>
                <span>$${tax.toFixed(2)}</span>
            </div>
            <div style="display: flex; justify-content: space-between; margin-bottom: 1rem;">
                <span>Shipping:</span>
                <span>${shipping === 0 ? 'FREE' : '$' + shipping.toFixed(2)}</span>
            </div>
            <div style="display: flex; justify-content: space-between; font-size: 1.3rem; font-weight: 700; padding-top: 1rem; border-top: 2px solid #333;">
                <span>Total:</span>
                <span style="color: var(--color-primary);">$${total.toFixed(2)}</span>
            </div>
        </div>
    `;

    orderSummary.innerHTML = html;
}

function handleCheckoutSubmit(event) {
    event.preventDefault();

    const submitBtn = event.target.querySelector('button[type="submit"]');
    const originalText = submitBtn.textContent;

    // Show processing state
    submitBtn.textContent = 'Processing...';
    submitBtn.disabled = true;

    // Simulate API call
    setTimeout(() => {
        // Clear cart from localStorage
        localStorage.removeItem('checkoutCart');

        // Show success message
        alert('Order placed successfully! Thank you for your purchase.');

        // Redirect to home page
        window.location.href = 'index.html';
    }, 1500);
}
