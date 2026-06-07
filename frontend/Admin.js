const API= `http://${window.location.hostname}:3000`;
const token = localStorage.getItem('token');
const username = localStorage.getItem('username');
const userRole = localStorage.getItem('role')
let editingProductId = null;

if (!token) window.location.href = 'Login.html';
if (userRole == 'admin') {
    document.getElementById('admin-name').textContent = username;
    document.getElementById('section-subtitle').textContent = `Welcome back, ${username}!`;
}else{
    alert("ACCESS DENIED. UNAURTHOROTIZED ATTEMPT");
    window.location.href = 'Login.html';
}

// SIDEBAR NAV
const navItems = document.querySelectorAll('.nav-item');
const sections = document.querySelectorAll('.section');
const sectionTitle = document.getElementById('section-title');
const sectionSubtitle = document.getElementById('section-subtitle');

const sectionMeta = {
    overview: { title: 'Overview',  subtitle: `Welcome back, ${username}!` },
    products: { title: 'Products',  subtitle: 'Manage your product catalog' },
    users:    { title: 'Users',     subtitle: 'Manage registered users' },
};

navItems.forEach(item => {
    item.addEventListener('click', function(e) {
        e.preventDefault();
        const target = this.dataset.section;
        navItems.forEach(n => n.classList.remove('active'));
        sections.forEach(s => s.classList.remove('active'));
        this.classList.add('active');
        document.getElementById(`section-${target}`).classList.add('active');
        sectionTitle.textContent = sectionMeta[target].title;
        sectionSubtitle.textContent = sectionMeta[target].subtitle;
        if (target === 'products') loadProducts();
        if (target === 'users') loadUsers();
    });
});

// HELPERS
function formatPrice(price) {
    return 'Rp ' + Number(price).toLocaleString('id-ID');
}

function formatDate(dateStr) {
    return new Date(dateStr).toLocaleDateString('en-US', {
        day: '2-digit', month: 'short', year: 'numeric'
    });
}

function stockBadge(stock) {
    if (stock === 0) return `<span class="badge badge-danger">Out of Stock</span>`;
    if (stock <= 5)  return `<span class="badge badge-warning">Low Stock</span>`;
    return `<span class="badge badge-success">In Stock</span>`;
}

function authHeaders() {
    return { 'Authorization': `Bearer ${token}` };
}

// OVERVIEW
async function loadOverview() {
    try {
        const [productsRes, usersRes, revenueRes] = await Promise.all([
            fetch(`${API}/api/products`, { headers: authHeaders() }),
            fetch(`${API}/api/users`,    { headers: authHeaders() }),
            fetch(`${API}/api/orders/revenue`, { headers: authHeaders() }),
        ]);
        const products = await productsRes.json();
        const users    = await usersRes.json();
        const revenue  = await revenueRes.json();

        document.getElementById('total-revenue').textContent =
            'Rp ' + Number(revenue.total).toLocaleString('id-ID');
        document.getElementById('total-orders-placed').textContent =
            `${revenue.orderCount} orders placed`;

        document.getElementById('total-products').textContent = products.length;
        document.getElementById('total-users').textContent    = users.length;
        document.getElementById('low-stock').textContent      = products.filter(p => p.stock > 0 && p.stock <= 5).length;
        document.getElementById('out-of-stock').textContent   = products.filter(p => p.stock === 0).length;

        document.getElementById('overview-products-body').innerHTML = products.slice(0, 5).map(p => `
            <tr>
                <td>${p.name}</td>
                <td>${formatPrice(p.price)}</td>
                <td><b>${p.stock}</b></td>
                <td>${stockBadge(p.stock)}</td>
            </tr>
        `).join('') || `<tr><td colspan="4" class="loading">No products found</td></tr>`;

        document.getElementById('overview-users-body').innerHTML = users.slice(0, 5).map(u => `
            <tr>
                <td>${u.username}</td>
                <td>${u.email}</td>
                <td><span class="badge ${u.role === 'admin' ? 'badge-admin' : 'badge-primary'}">${u.role ?? 'user'}</span></td>
            </tr>
        `).join('') || `<tr><td colspan="3" class="loading">No users found</td></tr>`;

    } catch (err) {
        console.error('Overview load error:', err);
    }
}

// PRODUCTS
async function loadProducts() {
    const tbody = document.getElementById('products-table-body');
    tbody.innerHTML = `<tr><td colspan="8" class="loading">Loading...</td></tr>`;

    try {
        const res = await fetch(`${API}/api/products`, { headers: authHeaders() });
        const products = await res.json();

        if (!products.length) {
            tbody.innerHTML = `<tr><td colspan="8" class="loading">No products found</td></tr>`;
            return;
        }

        tbody.innerHTML = products.map(p => `
            <tr>
                <td><span style="font-family:'Space Mono',monospace;color:#888">#${p.id}</span></td>
                <td>
                    ${p.imageUrl
                        ? `<img src="${API}${p.imageUrl}" alt="${p.name}" style="width:3rem;height:3rem;object-fit:cover;border-radius:0.4rem;">`
                        : '<span style="color:#bbb;font-size:0.8rem;">No image</span>'}
                </td>
                <td><b>${p.name}</b></td>
                <td><span class="badge badge-primary">${p.category ?? '—'}</span></td>
                <td>${formatPrice(p.price)}</td>
                <td><b>${p.stock}</b></td>
                <td>${stockBadge(p.stock)}</td>
                <td class="actions-cell">
                    <button class="btn-icon" title="Edit" onclick="openEditModal(${JSON.stringify(p).replace(/"/g, '&quot;')})">
                        <img src="assets/Edit.png" alt="Edit">
                    </button>
                    <button class="btn-icon" title="Delete" onclick="confirmDelete('product', ${p.id}, '${p.name}')">
                        <img src="assets/trash.png" alt="Delete">
                    </button>
                </td>
            </tr>
        `).join('');

    } catch (err) {
        tbody.innerHTML = `<tr><td colspan="8" class="loading">Error loading products</td></tr>`;
    }
}

// ADD PRODUCT
document.getElementById('p-image').addEventListener('change', function() {
    const file = this.files[0];
    const preview = document.getElementById('p-image-preview');
    const img = document.getElementById('p-preview-img');
    if (file) {
        img.src = URL.createObjectURL(file);
        preview.style.display = 'block';
    } else {
        preview.style.display = 'none';
    }
});

document.getElementById('btn-add-product').addEventListener('click', () => {
    const form = document.getElementById('add-product-form');
    form.style.display = form.style.display === 'none' ? 'block' : 'none';
});

document.getElementById('btn-cancel-product').addEventListener('click', () => {
    document.getElementById('add-product-form').style.display = 'none';
    clearProductForm();
});

document.getElementById('btn-save-product').addEventListener('click', async () => {
    const name        = document.getElementById('p-name').value.trim();
    const category    = document.getElementById('p-category').value;
    const price       = document.getElementById('p-price').value;
    const stock       = document.getElementById('p-stock').value;
    const description = document.getElementById('p-description').value.trim();
    const spec1       = document.getElementById('p-spec1').value.trim();
    const spec2       = document.getElementById('p-spec2').value.trim();
    const spec3       = document.getElementById('p-spec3').value.trim();
    const spec4       = document.getElementById('p-spec4').value.trim();
    const imageFile   = document.getElementById('p-image').files[0];
    const errorEl     = document.getElementById('p-error');

    if (!name || !price || !stock || !category) {
        errorEl.textContent = 'Please fill in all required fields.';
        return;
    }

    errorEl.textContent = '';

    const formData = new FormData();
    formData.append('name', name);
    formData.append('category', category);
    formData.append('price', price);
    formData.append('stock', stock);
    if (description) formData.append('description', description);
    if (spec1) formData.append('spec1', spec1);
    if (spec2) formData.append('spec2', spec2);
    if (spec3) formData.append('spec3', spec3);
    if (spec4) formData.append('spec4', spec4);
    if (imageFile) formData.append('image', imageFile);

    try {
        const res = await fetch(`${API}/api/products`, {
            method: 'POST',
            headers: authHeaders(), // no Content-Type — browser sets multipart boundary
            body: formData,
        });

        const data = await res.json();

        if (res.ok) {
            document.getElementById('add-product-form').style.display = 'none';
            clearProductForm();
            loadProducts();
            loadOverview();
        } else {
            errorEl.textContent = data.message || 'Failed to add product.';
        }
    } catch (err) {
        errorEl.textContent = 'Server error. Try again.';
    }
});

function clearProductForm() {
    ['p-name', 'p-price', 'p-stock', 'p-description', 'p-spec1', 'p-spec2', 'p-spec3', 'p-spec4'].forEach(id => {
        document.getElementById(id).value = '';
    });
    document.getElementById('p-category').value = '';
    document.getElementById('p-image').value = '';
    document.getElementById('p-image-preview').style.display = 'none';
    document.getElementById('p-error').textContent = '';
}

// EDIT PRODUCT
function openEditModal(product) {
    editingProductId = product.id;

    document.getElementById('e-name').value        = product.name || '';
    document.getElementById('e-category').value    = product.category || '';
    document.getElementById('e-price').value       = product.price || '';
    document.getElementById('e-stock').value       = product.stock || '';
    document.getElementById('e-spec1').value       = product.spec1 || '';
    document.getElementById('e-spec2').value       = product.spec2 || '';
    document.getElementById('e-spec3').value       = product.spec3 || '';
    document.getElementById('e-spec4').value       = product.spec4 || '';
    document.getElementById('e-description').value = product.description || '';
    document.getElementById('e-error').textContent = '';
    document.getElementById('e-image').value       = '';

    const previewImg = document.getElementById('e-preview-img');
    if (product.imageUrl) {
        previewImg.src = `${API}${product.imageUrl}`; // fixed: no double slash
        previewImg.style.display = 'block';
    } else {
        previewImg.style.display = 'none';
    }

    document.getElementById('edit-modal-overlay').style.display = 'flex';
}

document.getElementById('e-image').addEventListener('change', function() {
    const file = this.files[0];
    const previewImg = document.getElementById('e-preview-img');
    if (file) {
        previewImg.src = URL.createObjectURL(file);
        previewImg.style.display = 'block';
    }
});

document.getElementById('edit-modal-cancel').addEventListener('click', () => {
    document.getElementById('edit-modal-overlay').style.display = 'none';
    editingProductId = null;
});

document.getElementById('edit-modal-overlay').addEventListener('click', function(e) {
    if (e.target === this) {
        this.style.display = 'none';
        editingProductId = null;
    }
});

document.getElementById('edit-modal-save').addEventListener('click', async () => {
    if (!editingProductId) return;

    const name        = document.getElementById('e-name').value.trim();
    const category    = document.getElementById('e-category').value;
    const price       = document.getElementById('e-price').value;
    const stock       = document.getElementById('e-stock').value;
    const description = document.getElementById('e-description').value.trim();
    const spec1       = document.getElementById('e-spec1').value.trim();
    const spec2       = document.getElementById('e-spec2').value.trim();
    const spec3       = document.getElementById('e-spec3').value.trim();
    const spec4       = document.getElementById('e-spec4').value.trim();
    const imageFile   = document.getElementById('e-image').files[0];
    const errorEl     = document.getElementById('e-error');

    errorEl.textContent = '';

    // Send everything as FormData so image upload works the same as add
    const formData = new FormData();
    formData.append('name', name);
    formData.append('category', category);
    formData.append('price', price);
    formData.append('stock', stock);
    if (description) formData.append('description', description);
    if (spec1) formData.append('spec1', spec1);
    if (spec2) formData.append('spec2', spec2);
    if (spec3) formData.append('spec3', spec3);
    if (spec4) formData.append('spec4', spec4);
    if (imageFile) formData.append('image', imageFile);

    try {
        const res = await fetch(`${API}/api/products/${editingProductId}`, {
            method: 'PATCH',
            headers: authHeaders(), // no Content-Type for FormData
            body: formData,
        });

        const data = await res.json();

        if (res.ok) {
            document.getElementById('edit-modal-overlay').style.display = 'none';
            editingProductId = null;
            loadProducts();
            loadOverview();
        } else {
            errorEl.textContent = data.message || 'Failed to update product.';
        }
    } catch (err) {
        errorEl.textContent = 'Server error. Try again.';
    }
});

// USERS
async function loadUsers() {
    const tbody = document.getElementById('users-table-body');
    tbody.innerHTML = `<tr><td colspan="7" class="loading">Loading...</td></tr>`;

    try {
        const res = await fetch(`${API}/api/users`, { headers: authHeaders() });
        const users = await res.json();

        if (!users.length) {
            tbody.innerHTML = `<tr><td colspan="7" class="loading">No users found</td></tr>`;
            return;
        }

        tbody.innerHTML = users.map(u => `
            <tr>
                <td><span style="font-family:'Space Mono',monospace;color:#888">#${u.id}</span></td>
                <td><b>${u.username}</b></td>
                <td>${u.email}</td>
                <td>${u.gender ?? '—'}</td>
                <td><span class="badge ${u.role === 'admin' ? 'badge-admin' : 'badge-primary'}">${u.role ?? 'user'}</span></td>
                <td>${u.createdAt ? formatDate(u.createdAt) : '—'}</td>
                <td>
                    <button class="btn-icon" title="Delete" onclick="confirmDelete('user', ${u.id}, '${u.username}')">
                        <img src='assets/trash.png' alt='Delete'>
                    </button>
                </td>
            </tr>
        `).join('');

    } catch (err) {
        tbody.innerHTML = `<tr><td colspan="7" class="loading">Error loading users</td></tr>`;
    }
}

// DELETE MODAL
let pendingDelete = null;

function confirmDelete(type, id, name) {
    pendingDelete = { type, id };
    document.getElementById('modal-message').textContent =
        `Are you sure you want to delete ${type} "${name}"? This cannot be undone.`;
    document.getElementById('modal-overlay').style.display = 'flex';
}

document.getElementById('modal-cancel').addEventListener('click', () => {
    document.getElementById('modal-overlay').style.display = 'none';
    pendingDelete = null;
});

document.getElementById('modal-confirm').addEventListener('click', async () => {
    if (!pendingDelete) return;
    const { type, id } = pendingDelete;
    const url = type === 'product' ? `${API}/api/products/${id}` : `${API}/api/users/${id}`;

    try {
        const res = await fetch(url, { method: 'DELETE', headers: authHeaders() });
        if (res.ok) {
            document.getElementById('modal-overlay').style.display = 'none';
            pendingDelete = null;
            if (type === 'product') loadProducts();
            if (type === 'user')    loadUsers();
            loadOverview();
        }
    } catch (err) {
        console.error('Delete error:', err);
    }
});

document.getElementById('modal-overlay').addEventListener('click', function(e) {
    if (e.target === this) {
        this.style.display = 'none';
        pendingDelete = null;
    }
});

// INIT
loadOverview();