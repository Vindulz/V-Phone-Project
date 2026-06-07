// Loads the top-selling products from the backend and renders the
// "BEST SELLERS" strip. Uses the same .slider-card / .hidden-info markup
// as the old hardcoded cards, so the MORE INFO toggle in home.js works as-is.

const BS_API = `http://${window.location.hostname}:3000/api`;

function bsFormatPrice(price) {
    return 'Rp. ' + Number(price).toLocaleString('id-ID');
}

function bsSpecsHtml(product) {
    const specs = [product.spec1, product.spec2, product.spec3, product.spec4].filter(Boolean);
    if (!specs.length) return '';
    return `<ul class="Specs">${specs.map(s => `<li>${s}</li>`).join('')}</ul>`;
}

function bsImage(product) {
    // Uploaded images are served by the backend (port 3000), and imageUrl
    // is stored like "/uploads/xxxx.png". If images don't show, adjust this URL.
    if (product.imageUrl) {
        return `<img src="http://${window.location.hostname}:3000${product.imageUrl}" alt="${product.name}">`;
    }
    return `<div class="img-placeholder">No Image</div>`;
}

async function loadBestSellers() {
    const wrap = document.getElementById('bestseller-wraper');
    if (!wrap) return;

    try {
        const res = await fetch(`${BS_API}/products/best-sellers`);
        const products = await res.json();

        if (!Array.isArray(products) || products.length === 0) {
            wrap.innerHTML = `<p style="padding:2rem;color:#888;">No best sellers yet.</p><div class="border-end"></div>`;
            return;
        }

        wrap.innerHTML = products.map(p => `
            <div class="slider-card">
                <p>${p.name}</p>
                ${bsImage(p)}
                <div class="hidden-info">
                    ${bsSpecsHtml(p)}
                    <p>${p.description || ''}</p>
                </div>
                <div class="card-footer">
                    <p>${bsFormatPrice(p.price)}</p>
                    <button>MORE INFO</button>
                </div>
            </div>
        `).join('') + `<div class="border-end"></div>`;

    } catch (err) {
        console.error('Could not load best sellers:', err);
        wrap.innerHTML = `<p style="padding:2rem;color:#888;">Could not load best sellers. Is the server running?</p><div class="border-end"></div>`;
    }
}

document.addEventListener('DOMContentLoaded', loadBestSellers);