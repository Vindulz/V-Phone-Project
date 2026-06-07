const API = 'http://localhost:3000';

// =============================================
// CAROUSEL STATE
// =============================================
let carouselStates = {}; // { 'gaming': { current: 0, total: 3 }, ... }

function showSlide(category, index) {
    const carousel = document.querySelector(`#${category} .carousel`);
    if (!carousel) return;
    const slides = carousel.querySelectorAll('.carousel-slide');
    const total = slides.length;
    if (total === 0) return;

    carouselStates[category].current = (index + total) % total;
    carousel.style.transition = 'transform 0.5s ease-in-out';
    carousel.style.transform = `translateX(-${carouselStates[category].current * 100}%)`;
}

function moveSlide(category, direction) {
    if (!carouselStates[category]) return;
    showSlide(category, carouselStates[category].current + direction);
}

// =============================================
// HELPERS
// =============================================
function formatPrice(price) {
    return 'Rp ' + Number(price).toLocaleString('id-ID');
}

function stockLabel(stock) {
    if (stock === 0) return `<p class="stock-label out-of-stock">Out of Stock</p>`;
    return `<p class="stock-label">In Stock: ${stock} units</p>`;
}

function specsHtml(product) {
    const specs = [product.spec1, product.spec2, product.spec3, product.spec4].filter(Boolean);
    if (!specs.length) return '';
    return `<ul>${specs.map(s => `<li>${s}</li>`).join('')}</ul>`;
}

function productImage(product) {
    if (product.imageUrl) {
        return `<img src="${product.imageUrl}" alt="${product.name}"/>`;
    }
    // fallback placeholder
    return `<div class="img-placeholder">No Image</div>`;
}

// =============================================
// BUILD CAROUSEL SLIDE
// =============================================
function buildSlide(product, cardClass, textClass, imageClass, btnId) {
    const outOfStock = product.stock === 0;
    return `
        <div class="carousel-slide">
            <div class="${cardClass}">
                <div class="${textClass}">
                    <h2>${product.name}</h2>
                    ${specsHtml(product)}
                    <p>${product.description || ''}</p>
                    <h3>${formatPrice(product.price)}</h3>
                    ${stockLabel(product.stock)}
                    <div class="qty-wrapper">
                        <div class="qty-control" ${outOfStock ? 'style="opacity:0.4;pointer-events:none;"' : ''}>
                            <button type="button" class="qty-btn" onclick="changeQty('${btnId}', -1)">−</button>
                            <input type="number" id="qty-${btnId}" class="qty-input" value="1" min="1" max="${product.stock}" readonly>
                            <button type="button" class="qty-btn" onclick="changeQty('${btnId}', 1)">+</button>
                        </div>
                    </div>
                    <button
                        class="buy-btn"
                        id="${btnId}"
                        data-product-id="${product.id}"
                        data-product-name="${product.name}"
                        data-product-stock="${product.stock}"
                        ${outOfStock ? 'disabled style="opacity:0.4;cursor:not-allowed;"' : ''}
                    >Buy Now</button>
                </div>
                <div class="${imageClass}">
                    ${productImage(product)}
                </div>
            </div>
        </div>
    `;
}

// =============================================
// BUILD CATEGORY SECTION
// =============================================
function buildSection(category, products) {
    const sectionEl = document.getElementById(category);
    if (!sectionEl) return;

    const carouselEl = sectionEl.querySelector('.carousel');
    if (!carouselEl) return;

    // map category → card/text/image CSS classes
    const classMap = {
        gaming: { card: 'game-card', text: 'game-text', image: 'game-image' },
        camera: { card: 'camera-card', text: 'camera-text', image: 'camera-image' },
        budget: { card: 'budget-card', text: 'budget-text', image: 'budget-image' },
    };

    const cls = classMap[category] || classMap.gaming;

    if (!products.length) {
        carouselEl.innerHTML = `<div class="carousel-slide"><div class="${cls.card}"><div class="${cls.text}"><h2>No products available</h2></div></div></div>`;
        carouselStates[category] = { current: 0, total: 1 };
        return;
    }

    carouselEl.innerHTML = products.map((p, i) =>
        buildSlide(p, cls.card, cls.text, cls.image, `btn-${category}-${i}`)
    ).join('');

    // set carousel width based on number of slides
    carouselEl.style.width = `${products.length * 100}%`;

    carouselStates[category] = { current: 0, total: products.length };
    showSlide(category, 0);

    // attach buy now listeners
    products.forEach((p, i) => {
        const btn = document.getElementById(`btn-${category}-${i}`);
        if (btn && p.stock > 0) {
            btn.addEventListener('click', () => buyProduct(btn));
        }
    });
}

// =============================================
// LOAD ALL PRODUCTS FROM DB
// =============================================
async function loadProducts() {
    try {
        const res = await fetch(`${API}/api/products`);
        const products = await res.json();

        const gaming = products.filter(p => p.category === 'gaming');
        const camera = products.filter(p => p.category === 'camera');
        const budget = products.filter(p => p.category === 'budget');

        buildSection('gaming', gaming);
        buildSection('camera', camera);
        buildSection('budget', budget);

    } catch (err) {
        console.error('Could not load products:', err);
    }
}

// =============================================
// QUANTITY CONTROLS
// =============================================
function changeQty(btnId, delta) {
    const input = document.getElementById(`qty-${btnId}`);
    if (!input) return;
    const max = parseInt(input.max) || 99;
    const newVal = Math.min(max, Math.max(1, parseInt(input.value) + delta));
    input.value = newVal;
}

// =============================================
// BUY NOW
// =============================================
async function buyProduct(btn) {
    const userId  = localStorage.getItem('userId');
    const token   = localStorage.getItem('token');
    const productId   = btn.dataset.productId;
    const productName = btn.dataset.productName;
    const stock   = parseInt(btn.dataset.productStock);

    const qtyInput = btn.closest('.game-text, .camera-text, .budget-text')?.querySelector('.qty-input');
    const quantity = qtyInput ? Math.max(1, parseInt(qtyInput.value) || 1) : 1;

    if (stock === 0) {
        alert(`"${productName}" is out of stock.`);
        return;
    }

    if (quantity > stock) {
        alert(`Only ${stock} unit(s) of "${productName}" available.`);
        return;
    }

    try {
        const res = await fetch(`${API}/api/orders/add`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
            },
            body: JSON.stringify({
                productId: Number(productId),
                quantity,
                userId: userId ? Number(userId) : null,
            }),
        });

        const data = await res.json();

        if (!res.ok) {
            alert(data.message || 'Could not add to cart.');
            return;
        }

        alert(data.message);

        // update cart count in navbar
        const cartCount = document.getElementById('nav-cart-count');
        if (cartCount && userId) {
            const cartRes = await fetch(`${API}/api/orders/cart?userId=${userId}`);
            const items = await cartRes.json();
            cartCount.textContent = items.length;
        }

    } catch (err) {
        alert('Could not add to cart. Is the server running?');
    }
}

// =============================================
// INIT
// =============================================
document.addEventListener('DOMContentLoaded', async () => {
    await loadProducts();
});