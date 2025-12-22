// Review System - Loads and displays reviews from CSV
class ReviewSystem {
    constructor() {
        this.allReviews = [];
        this.displayedReviews = [];
        this.currentPage = 1;
        this.reviewsPerPage = 6;
        this.maxReviews = 60;
        this.productReviewCount = 0;
    }

    async loadReviews() {
        try {
            const response = await fetch('assets/reviews.csv?v=1765331453');
            const csvText = await response.text();
            this.allReviews = this.parseCSV(csvText);
            return true;
        } catch (error) {
            console.error('Error loading reviews:', error);
            return false;
        }
    }

    parseCSV(csvText) {
        const reviews = [];
        const lines = [];
        let currentLine = '';
        let inQuotes = false;

        // First, properly split lines while respecting quotes
        for (let i = 0; i < csvText.length; i++) {
            const char = csvText[i];
            if (char === '"') {
                inQuotes = !inQuotes;
                currentLine += char;
            } else if (char === '\n' && !inQuotes) {
                if (currentLine.trim()) {
                    lines.push(currentLine);
                }
                currentLine = '';
            } else if (char === '\r') {
                // Skip carriage returns
                continue;
            } else {
                currentLine += char;
            }
        }
        if (currentLine.trim()) {
            lines.push(currentLine);
        }

        // Skip header line and parse remaining lines
        for (let i = 1; i < lines.length; i++) {
            const fields = this.parseCSVLine(lines[i]);
            if (fields.length >= 7) {
                // Replace "Amazon Customer" with "Jane Smith"
                let reviewerName = fields[1] || 'Anonymous';
                if (reviewerName.toLowerCase() === 'amazon customer') {
                    reviewerName = 'Jane Smith';
                }

                // Get title and text, apply profanity filter if available
                let reviewTitle = this.cleanTitle(fields[3]);
                let reviewText = fields[6] || '';

                // Replace "amazon" with "online" (case-insensitive)
                reviewTitle = reviewTitle.replace(/amazon/gi, 'online');
                reviewText = reviewText.replace(/amazon/gi, 'online');

                // Apply profanity filter if the filter is loaded
                if (typeof profanityFilter !== 'undefined') {
                    reviewTitle = profanityFilter.filter(reviewTitle);
                    reviewText = profanityFilter.filter(reviewText);
                }

                reviews.push({
                    name: reviewerName,
                    rating: this.parseRating(fields[2]),
                    title: reviewTitle,
                    date: this.cleanDate(fields[4]),
                    verified: fields[5] === 'Yes',
                    text: reviewText,
                    helpful: parseInt(fields[7]) || 0
                });
            }
        }

        return reviews;
    }

    parseCSVLine(line) {
        const fields = [];
        let current = '';
        let inQuotes = false;

        for (let i = 0; i < line.length; i++) {
            const char = line[i];
            if (char === '"') {
                inQuotes = !inQuotes;
            } else if (char === ',' && !inQuotes) {
                fields.push(current.trim());
                current = '';
            } else {
                current += char;
            }
        }
        fields.push(current.trim());
        return fields;
    }

    parseRating(ratingStr) {
        const match = ratingStr.match(/(\d+\.\d+)/);
        return match ? parseFloat(match[1]) : 5.0;
    }

    cleanTitle(title) {
        // Remove duplicate rating text from title
        return title.replace(/\d+\.\d+\s+out\s+of\s+\d+\s+stars\s*/gi, '').trim();
    }

    cleanDate(dateStr) {
        // Remove the prefix and year, keep only month and day
        const date = dateStr.replace('Reviewed in the United States on ', '');
        // Remove the year (everything after the last comma)
        return date.replace(/,\s*\d{4}$/, '');
    }

    getRandomReviews(count) {
        const shuffled = [...this.allReviews].sort(() => Math.random() - 0.5);
        return shuffled.slice(0, count);
    }

    initializeForProduct(reviewCount, ratingDistribution = null) {
        this.productReviewCount = reviewCount;
        this.ratingDistribution = ratingDistribution;
        const reviewsToShow = Math.min(reviewCount, this.maxReviews);

        if (ratingDistribution) {
            // Use custom distribution to select reviews
            this.displayedReviews = this.getReviewsWithDistribution(reviewsToShow, ratingDistribution);
        } else {
            this.displayedReviews = this.getRandomReviews(reviewsToShow);
        }
        this.currentPage = 1;
    }

    getReviewsWithDistribution(count, distribution) {
        // Calculate how many reviews of each rating we need
        const needed = {
            5: Math.round(count * (distribution['5'] / 100)),
            4: Math.round(count * (distribution['4'] / 100)),
            3: Math.round(count * (distribution['3'] / 100)),
            2: Math.round(count * (distribution['2'] / 100)),
            1: Math.round(count * (distribution['1'] / 100))
        };

        // Adjust to exactly match count
        let total = Object.values(needed).reduce((a, b) => a + b, 0);
        if (total < count) {
            needed[5] += (count - total);
        } else if (total > count) {
            needed[5] -= (total - count);
        }

        // Group reviews by rating
        const reviewsByRating = { 1: [], 2: [], 3: [], 4: [], 5: [] };
        this.allReviews.forEach(review => {
            const rating = Math.round(review.rating);
            if (reviewsByRating[rating]) {
                reviewsByRating[rating].push(review);
            }
        });

        // Shuffle each rating group
        Object.keys(reviewsByRating).forEach(rating => {
            reviewsByRating[rating] = reviewsByRating[rating].sort(() => Math.random() - 0.5);
        });

        // Select reviews according to distribution
        const selected = [];
        for (let rating = 5; rating >= 1; rating--) {
            const need = needed[rating];
            const available = reviewsByRating[rating];
            for (let i = 0; i < need && i < available.length; i++) {
                selected.push(available[i]);
            }

            // If we don't have enough reviews of this rating, fill with similar ratings
            if (selected.length < needed[5] + needed[4] + needed[3] + needed[2] + needed[1]) {
                const diff = needed[rating] - Math.min(need, available.length);
                if (diff > 0) {
                    // Try to fill from adjacent ratings
                    const adjacent = rating < 5 ? reviewsByRating[rating + 1] : reviewsByRating[rating - 1];
                    for (let i = 0; i < diff && adjacent && i < adjacent.length; i++) {
                        if (!selected.includes(adjacent[i])) {
                            selected.push(adjacent[i]);
                        }
                    }
                }
            }
        }

        // Shuffle final selection
        return selected.sort(() => Math.random() - 0.5).slice(0, count);
    }

    renderReviews(containerSelector) {
        const container = document.querySelector(containerSelector);
        if (!container) return;

        const startIdx = (this.currentPage - 1) * this.reviewsPerPage;
        const endIdx = Math.min(startIdx + this.reviewsPerPage, this.displayedReviews.length);
        const reviewsToShow = this.displayedReviews.slice(startIdx, endIdx);

        container.innerHTML = reviewsToShow.map(review => this.renderReview(review)).join('');

        // Update pagination
        this.updatePagination();
    }

    renderReview(review) {
        const stars = this.renderStars(review.rating);
        const verifiedBadge = review.verified ?
            '<span class="verified-badge"><svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/></svg>Verified Buyer</span>' : '';

        // Get initials for avatar
        const initials = this.getInitials(review.name);
        const avatarColor = this.getAvatarColor(review.name);

        return `
            <div class="review-item judgeme-style">
                <div class="review-avatar" style="background-color: ${avatarColor};">
                    ${initials}
                </div>
                <div class="review-content">
                    <div class="review-header">
                        <div class="review-author-info">
                            <strong class="review-author-name">${this.escapeHtml(review.name)}</strong>
                            ${verifiedBadge}
                        </div>
                        <div class="review-meta">
                            ${stars}
                        </div>
                    </div>
                    <div class="review-date">${this.escapeHtml(review.date)}</div>
                    <div class="review-title">${this.escapeHtml(review.title)}</div>
                    <div class="review-text">${this.escapeHtml(review.text)}</div>
                    <div class="review-helpful">
                        <button class="helpful-btn" onclick="reviewSystem.markHelpful(this)">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3"></path>
                            </svg>
                            Helpful${review.helpful > 0 ? ` (${review.helpful})` : ''}
                        </button>
                    </div>
                </div>
            </div>
        `;
    }

    getInitials(name) {
        const parts = name.trim().split(' ');
        if (parts.length >= 2) {
            return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
        }
        return name.substring(0, 2).toUpperCase();
    }

    getAvatarColor(name) {
        // Generate consistent color based on name
        const colors = [
            '#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A',
            '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E2',
            '#F8B739', '#52B788'
        ];
        let hash = 0;
        for (let i = 0; i < name.length; i++) {
            hash = name.charCodeAt(i) + ((hash << 5) - hash);
        }
        return colors[Math.abs(hash) % colors.length];
    }

    markHelpful(button) {
        if (button.classList.contains('marked')) return;

        button.classList.add('marked');
        const currentText = button.innerHTML;
        const match = currentText.match(/\((\d+)\)/);
        const count = match ? parseInt(match[1]) : 0;

        button.innerHTML = currentText.replace(/Helpful(\s*\(\d+\))?/, `Helpful (${count + 1})`);
    }

    getRatingBreakdown() {
        const breakdown = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
        const total = this.displayedReviews.length;

        this.displayedReviews.forEach(review => {
            const rating = Math.round(review.rating);
            if (breakdown[rating] !== undefined) {
                breakdown[rating]++;
            }
        });

        // Convert to percentages
        const percentages = {};
        for (let i = 5; i >= 1; i--) {
            percentages[i] = total > 0 ? Math.round((breakdown[i] / total) * 100) : 0;
        }

        return percentages;
    }

    renderRatingBreakdown() {
        const breakdown = this.getRatingBreakdown();
        let html = '<div class="rating-breakdown">';

        for (let i = 5; i >= 1; i--) {
            html += `
                <div class="rating-bar-row">
                    <span class="rating-label">${i} star${i !== 1 ? 's' : ''}</span>
                    <div class="rating-bar-container">
                        <div class="rating-bar-fill" style="width: ${breakdown[i]}%"></div>
                    </div>
                    <span class="rating-percentage">${breakdown[i]}%</span>
                </div>
            `;
        }

        html += '</div>';
        return html;
    }

    renderStars(rating) {
        const fullStars = Math.floor(rating);
        const hasHalfStar = rating % 1 >= 0.5;
        let stars = '';

        for (let i = 0; i < fullStars; i++) {
            stars += '<span class="star filled">★</span>';
        }
        if (hasHalfStar) {
            stars += '<span class="star half">★</span>';
        }
        const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);
        for (let i = 0; i < emptyStars; i++) {
            stars += '<span class="star">☆</span>';
        }

        return `<div class="stars">${stars}</div>`;
    }

    updatePagination() {
        const totalPages = Math.ceil(this.displayedReviews.length / this.reviewsPerPage);
        const paginationContainer = document.querySelector('.review-pagination');

        if (!paginationContainer || totalPages <= 1) {
            if (paginationContainer) paginationContainer.innerHTML = '';
            return;
        }

        let html = '<div class="pagination-controls">';

        // Previous button
        if (this.currentPage > 1) {
            html += `<button onclick="reviewSystem.goToPage(${this.currentPage - 1})" class="pagination-btn">← Previous</button>`;
        }

        // Page numbers
        html += `<span class="page-info">Page ${this.currentPage} of ${totalPages}</span>`;

        // Next button
        if (this.currentPage < totalPages) {
            html += `<button onclick="reviewSystem.goToPage(${this.currentPage + 1})" class="pagination-btn">Next →</button>`;
        } else if (this.displayedReviews.length >= this.maxReviews) {
            // Show load more button that will show error
            html += `<button onclick="reviewSystem.loadMore()" class="pagination-btn">Load More</button>`;
        }

        html += '</div>';
        paginationContainer.innerHTML = html;
    }

    goToPage(page) {
        this.currentPage = page;
        this.renderReviews('.reviews-list');
        document.querySelector('.reviews-section').scrollIntoView({ behavior: 'smooth' });
    }

    loadMore() {
        // Show error when trying to load beyond 60 reviews
        const errorMsg = document.createElement('div');
        errorMsg.className = 'review-error';
        errorMsg.textContent = 'Failed to fetch additional reviews. Please try again later.';
        errorMsg.style.cssText = 'background: #fee; color: #c33; padding: 15px; margin: 15px 0; border-radius: 8px; text-align: center;';

        const pagination = document.querySelector('.review-pagination');
        pagination.insertBefore(errorMsg, pagination.firstChild);

        // Remove error after 3 seconds
        setTimeout(() => errorMsg.remove(), 3000);
    }

    submitReview(formData) {
        // Simulate review submission (doesn't actually save)
        return new Promise((resolve) => {
            setTimeout(() => {
                // Show success message
                resolve({
                    success: true,
                    message: 'Thank you for your review! It will appear after moderation.'
                });
            }, 800);
        });
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
}

// Initialize global review system
const reviewSystem = new ReviewSystem();

// Form submission handler
function handleReviewSubmit(event) {
    event.preventDefault();

    const form = event.target;
    const submitBtn = form.querySelector('button[type="submit"]');
    const originalBtnText = submitBtn.textContent;

    const formData = {
        name: form.querySelector('#review-name').value,
        rating: form.querySelector('input[name="rating"]:checked').value,
        title: form.querySelector('#review-title').value,
        text: form.querySelector('#review-text').value
    };

    // Validate for profanity if profanity filter is available
    if (typeof profanityFilter !== 'undefined') {
        // Check title for profanity
        const titleValidation = profanityFilter.validate(formData.title, 'Review title');
        if (!titleValidation.isValid) {
            showErrorMessage(form, titleValidation.message);
            return;
        }

        // Check review text for profanity
        const textValidation = profanityFilter.validate(formData.text, 'Review text');
        if (!textValidation.isValid) {
            showErrorMessage(form, textValidation.message);
            return;
        }
    }

    submitBtn.textContent = 'Submitting...';
    submitBtn.disabled = true;

    reviewSystem.submitReview(formData).then(result => {
        // Show success message
        const successMsg = document.createElement('div');
        successMsg.className = 'review-success';
        successMsg.textContent = result.message;
        successMsg.style.cssText = 'background: #efe; color: #2a2; padding: 15px; margin: 15px 0; border-radius: 8px; text-align: center;';

        form.insertBefore(successMsg, form.firstChild);
        form.reset();

        // Remove success message after 3 seconds
        setTimeout(() => successMsg.remove(), 3000);

        submitBtn.textContent = originalBtnText;
        submitBtn.disabled = false;
    });
}

// Helper function to show error messages
function showErrorMessage(form, message) {
    // Remove any existing error messages
    const existingError = form.querySelector('.review-error');
    if (existingError) {
        existingError.remove();
    }

    // Show error message
    const errorMsg = document.createElement('div');
    errorMsg.className = 'review-error';
    errorMsg.textContent = message;
    errorMsg.style.cssText = 'background: #fee; color: #c33; padding: 15px; margin: 15px 0; border-radius: 8px; text-align: center;';

    form.insertBefore(errorMsg, form.firstChild);

    // Remove error message after 5 seconds
    setTimeout(() => errorMsg.remove(), 5000);
}
