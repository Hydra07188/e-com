// ==========================================
// 1. STATE (The Source of Truth)
// ==========================================
let allProducts = []; // เก็บข้อมูลที่ถูกดึงมาจาก Backend
let cart = {};

// ==========================================
// 2. DOM ELEMENTS (The Triggers & Targets)
// ==========================================
const productContainer = document.getElementById('product-container');
const searchInput = document.getElementById('searchInput');
const categoryFilter = document.getElementById('categoryFilter');
const cartBadge = document.getElementById('cart-badge');

// ==========================================
// 3. UI RENDERER (The Reflection of Data)
// ==========================================
function renderProducts(productsToRender) {
    productContainer.innerHTML = '';

    // ถ้าไม่พบข้อมูล (ได้ Array ว่างกลับมาจาก Backend)
    if (!productsToRender || productsToRender.length === 0) {
        productContainer.innerHTML = `
            <div class="col-12 text-center py-5">
                <h3 class="text-black mb-3">No results found</h3>
                <p class="text-muted">Try another search term or category.</p>
            </div>
        `;
        return;
    }

    productsToRender.forEach(product => {
        // รองรับทั้งชื่อ field ว่า title และ name
        const productName = product.title || product.name;
        
        // เราใช้ parseFloat เผื่อราคาถูกส่งมาเป็น String จะได้โชว์ทศนิยม .2 หลักไม่ Error
        const productHTML = `
            <div class="col-12 col-md-4 col-lg-3 mb-5 mb-md-0">
                <a class="product-item" href="cart.html">
                    <img src="${product.image}" class="img-fluid product-thumbnail" alt="${productName}">
                    <h3 class="product-title">${productName}</h3>
                    <strong class="product-price">$${parseFloat(product.price).toFixed(2)}</strong>

                    <span class="icon-cross add-to-cart" data-product-id="${product.id}" data-price="${product.price}" title="Add to cart">
                        <img src="images/cross.svg" class="img-fluid" alt="Add to cart">
                    </span>
                </a>
            </div>
        `;
        productContainer.innerHTML += productHTML;
    });
}

function updateCartBadge() {
    if (!cartBadge) return; 

    let totalItems = 0;
    for (const productId in cart) {
        totalItems += cart[productId];
    }

    if (totalItems > 0) {
        cartBadge.innerText = totalItems;
        cartBadge.style.display = 'block';
    } else {
        cartBadge.style.display = 'none';
    }
}

// ==========================================
// 4. BUSINESS LOGIC & API CALL (เชื่อม SQLite)
// ==========================================
// 🌟 ฟังก์ชันหลัก: ยิง API ไปหา Backend เพื่อคัดกรองข้อมูลตามโจทย์!
async function fetchProductsFromBackend(category) {
    try {
        productContainer.innerHTML = '<h3 class="text-center w-100 py-5">Loading...</h3>';

        const normalizedCategory = category ? category.toLowerCase().trim() : 'all';
        const queryString = (!normalizedCategory || normalizedCategory === 'all')
            ? ''
            : `?category=${encodeURIComponent(normalizedCategory)}`;
        
        // ยิง Request พร้อม Query ตรงตาม Contract!
        const response = await fetch(`/api/products${queryString}`); 
        
        // ดัก Error 404 (หาหมวดหมู่ไม่เจอใน Database)
        if (response.status === 404) {
            allProducts = []; 
            renderProducts(allProducts);
            return;
        }

        // ดัก Error 500 (ระบบพัง)
        if (response.status === 500) {
            throw new Error("Internal Server Error");
        }

        // กรณี 200 OK ได้ JSON ข้อมูลสินค้า
        allProducts = await response.json();
        
        // ตรวจสอบว่าในช่อง Search มีการพิมพ์ชื่อค้างไว้ไหม ถ้ามีให้เอามา Filter ต่อหน้าเว็บ
        applyLocalSearchFilter();

    } catch (error) {
        console.error("Error loading products:", error);
        productContainer.innerHTML = `
            <div class="col-12 text-center py-5">
                <h3 class="text-danger mb-3">Error Loading Products</h3>
                <p class="text-muted">Please check that the server is running and try again.</p>
            </div>
        `;
    }
}

// ฟังก์ชันสำหรับช่องค้นหา (ค้นหาจากข้อมูลที่ได้มาจาก Backend แล้ว)
function applyLocalSearchFilter() {
    if (!searchInput) return;
    const searchTerm = searchInput.value.toLowerCase().trim();
    
    const filteredProducts = allProducts.filter(product => {
        const productName = product.title || product.name;
        return productName.toLowerCase().includes(searchTerm);
    });

    renderProducts(filteredProducts);
}

function handleCartClick(event) {
    const addToCartBtn = event.target.closest('.add-to-cart');
    if (!addToCartBtn) return;

    event.preventDefault();

    const productId = addToCartBtn.dataset.productId;

    if (cart[productId]) {
        cart[productId] += 1;
    } else {
        cart[productId] = 1;
    }

    localStorage.setItem('shopping_cart', JSON.stringify(cart));
    updateCartBadge();

    console.log(`Added product ID ${productId} to cart.`);
}

// ==========================================
// 5. EVENT LISTENERS
// ==========================================
if (searchInput) {
    searchInput.addEventListener('input', applyLocalSearchFilter);
}

if (categoryFilter) {
    categoryFilter.addEventListener('change', (e) => {
        // เมื่อเลือก Dropdown หมวดหมู่ จะวิ่งไปดึง Database ใหม่ทันที
        fetchProductsFromBackend(e.target.value.toLowerCase().trim());
    });
}

productContainer.addEventListener('click', handleCartClick);

// ==========================================
// 6. INITIALIZATION 
// ==========================================
function init() {
    const savedCart = localStorage.getItem('shopping_cart');
    if (savedCart) {
        cart = JSON.parse(savedCart); 
        updateCartBadge(); 
    }

    const initialCategory = categoryFilter ? categoryFilter.value.toLowerCase().trim() : 'all';
    fetchProductsFromBackend(initialCategory);
}

init();
