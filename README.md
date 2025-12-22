# REHOTTOP Website

A modern, responsive website for REHOTTOP - premium automotive accessories including tire inflators, jump starters, air dusters, and vacuum cleaners.

## Features

- ✅ **Responsive Design** - Works seamlessly on desktop, tablet, and mobile devices
- ✅ **Product Catalog** - Dynamic product listing with detailed product pages
- ✅ **Fast Performance** - Optimized images and efficient code
- ✅ **SEO Optimized** - Meta tags, semantic HTML, and proper heading structure
- ✅ **Modern Design** - Clean, professional interface with smooth animations
- ✅ **Easy to Maintain** - Structured product data in JSON format
- ✅ **Secure** - HTTPS ready with security headers
- ✅ **Accessible** - Follows web accessibility best practices

## Project Structure

```
website/
├── assets/
│   ├── css/
│   │   ├── variables.css    # Design tokens and CSS variables
│   │   ├── reset.css         # CSS reset
│   │   └── styles.css        # Main styles
│   ├── images/
│   │   ├── products/         # Product images (104 images)
│   │   └── favicon.svg       # Site favicon
│   ├── js/
│   │   └── main.js           # JavaScript functionality
│   └── products.json         # Product data (11 products)
├── index.html                # Homepage/Shop page
├── product.html              # Product detail page template
├── about.html                # About Us page
├── 404.html                  # Custom 404 error page
├── netlify.toml              # Netlify configuration
└── README.md                 # This file
```

## Products

The website features 11 high-quality REHOTTOP products:

1. **C5 Portable Tire Inflator** - $59.99
2. **Compressed Air Duster (250000RPM)** - $59.99
3. **Cordless Tire Inflator (180PSI)** - $59.99
4. **Electric Ball Pump** - $49.99
5. **Electric Bike Pump C3** - $53.99
6. **Jump Starter (2000A)** - $79.99
7. **Jump Starter S3000** - $79.99
8. **Portable Car Vacuum Cleaner** - $59.99
9. **Portable Tire Inflator A17** - $59.99
10. **Portable Tire Inflator (160 PSI)** - $59.99
11. **RS5 Car Jump Starter & Tire Inflator 2-in-1** - $89.99

## Technology Stack

- **HTML5** - Semantic markup
- **CSS3** - Modern styling with CSS variables and Grid/Flexbox
- **JavaScript (ES6+)** - Vanilla JavaScript, no frameworks
- **JSON** - Structured product data
- **Netlify** - Hosting and deployment platform

## Local Development

To run the website locally:

1. **Clone the repository:**
   ```bash
   git clone <repository-url>
   cd website
   ```

2. **Open in browser:**
   - Simply open `index.html` in your web browser
   - Or use a local server:
     ```bash
     # Python 3
     python3 -m http.server 8000

     # Python 2
     python -m SimpleHTTPServer 8000

     # Node.js (with npx)
     npx serve
     ```

3. **View the site:**
   - Open http://localhost:8000 in your browser

## Deployment to Netlify

### Option 1: Deploy via Netlify UI (Recommended)

1. **Push to GitHub:**
   ```bash
   git init
   git add .
   git commit -m "Initial commit: REHOTTOP website"
   git branch -M main
   git remote add origin <your-github-repo-url>
   git push -u origin main
   ```

2. **Deploy on Netlify:**
   - Go to [netlify.com](https://netlify.com) and sign in
   - Click "Add new site" → "Import an existing project"
   - Connect your GitHub account and select your repository
   - Configure build settings:
     - **Build command:** Leave empty (static site)
     - **Publish directory:** `.` (root directory)
   - Click "Deploy site"

3. **Configure custom domain (optional):**
   - In Netlify site settings, go to "Domain management"
   - Add your custom domain (e.g., rehottop.com)
   - Follow DNS configuration instructions

### Option 2: Deploy via Netlify CLI

```bash
# Install Netlify CLI
npm install -g netlify-cli

# Login to Netlify
netlify login

# Deploy site
netlify deploy --prod
```

### Option 3: Drag and Drop

1. Go to [app.netlify.com/drop](https://app.netlify.com/drop)
2. Drag the `website` folder to the page
3. Your site will be deployed instantly

## Environment & Configuration

### Netlify Configuration

The `netlify.toml` file includes:
- Security headers (X-Frame-Options, CSP, etc.)
- Cache control for optimal performance
- Custom 404 page redirect
- Asset optimization

### SSL/HTTPS

Netlify automatically provides free SSL certificates via Let's Encrypt. Your site will be served over HTTPS by default.

## Maintenance

### Adding New Products

1. Add product images to `assets/images/products/`
2. Update `assets/products.json` with new product data:
   ```json
   {
     "id": "product-slug",
     "name": "Product Name",
     "brand": "REHOTTOP",
     "model": "Model Number",
     "price": 59.99,
     "description": "Product description...",
     "images": [
       "assets/images/products/image1.jpg",
       "assets/images/products/image2.jpg"
     ],
     "category": "Product Category"
   }
   ```
3. The website will automatically display the new product

### Updating Styles

- Modify design tokens in `assets/css/variables.css`
- Update component styles in `assets/css/styles.css`
- Changes are applied globally across all pages

### Updating Content

- **Homepage:** Edit `index.html`
- **About Page:** Edit `about.html`
- **Product Details:** Products load from `assets/products.json`

## Performance Optimization

### Image Optimization

To further optimize images:

```bash
# Install imagemin-cli
npm install -g imagemin-cli imagemin-mozjpeg

# Optimize all JPG images
imagemin assets/images/products/*.jpg --out-dir=assets/images/products --plugin=mozjpeg
```

### Testing

- **Lighthouse:** Run Chrome DevTools Lighthouse audit
- **PageSpeed Insights:** [https://pagespeed.web.dev/](https://pagespeed.web.dev/)
- **Mobile-Friendly Test:** [https://search.google.com/test/mobile-friendly](https://search.google.com/test/mobile-friendly)

## Browser Support

- Chrome/Edge (last 2 versions)
- Firefox (last 2 versions)
- Safari (last 2 versions)
- iOS Safari (last 2 versions)
- Android Chrome (last 2 versions)

## SEO

The site includes:
- Unique meta titles and descriptions for each page
- Open Graph tags for social media sharing
- Semantic HTML structure
- Image alt text
- Mobile-responsive design
- Fast loading times

### Sitemap (Optional)

To generate a sitemap:

```bash
# Install sitemap generator
npm install -g sitemap-generator-cli

# Generate sitemap
sitemap-generator https://yoursite.netlify.app -f website/sitemap.xml
```

## License

© 2024 REHOTTOP. All rights reserved.

## Support

For questions or issues with the website, please contact the development team or open an issue in the repository.

---

**Built with ❤️ for REHOTTOP**
