// ==========================================
// 1. STATE (The Source of Truth)
// ==========================================
let allProducts = [];
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

    if (productsToRender.length === 0) {
        productContainer.innerHTML = `
            <div class="col-12 text-center py-5">
                <h3 class="text-black mb-3">No results found</h3>
                <p class="text-muted">ไม่พบสินค้าที่ตรงกับคำค้นหาหรือหมวดหมู่ที่คุณเลือก ลองค้นหาด้วยคำอื่นดูนะครับ</p>
            </div>
        `;
        return;
    }

    productsToRender.forEach(product => {
        // แก้ไขดึงค่าจาก product.title ให้ตรงกับ JSON
        const productName = product.title || product.name; 
        const productHTML = `
            <div class="col-12 col-md-4 col-lg-3 mb-5 mb-md-0">
                <a class="product-item" href="cart.html">
                    <img src="${product.image}" class="img-fluid product-thumbnail" alt="${productName}">
                    <h3 class="product-title">${productName}</h3>
                    <strong class="product-price">$${product.price.toFixed(2)}</strong>

                    <span class="icon-cross add-to-cart" data-product-id="${product.id}" data-price="${product.price}" title="Add to cart">
                        <img src="images/cross.svg" class="img-fluid" alt="Add to cart">
                    </span>
                </a>
            </div>
        `;
        productContainer.innerHTML += productHTML;
    });
}

// ฟังก์ชันสำหรับคำนวณและอัปเดตตัวเลขบนไอคอนตะกร้า
function updateCartBadge() {
    if (!cartBadge) return; // ป้องกัน Error ถ้าหา element ไม่เจอ

    let totalItems = 0;
    
    // วนลูป Object cart เพื่อบวกจำนวนสินค้า (Quantity) ทุกชิ้นเข้าด้วยกัน
    for (const productId in cart) {
        totalItems += cart[productId];
    }

    // ถ้ามีของในตะกร้า ให้โชว์ "ตัวเลขจำนวนรวม" ถ้าไม่มีให้ซ่อนป้ายแดง
    if (totalItems > 0) {
        cartBadge.innerText = totalItems;
        cartBadge.style.display = 'block';
    } else {
        cartBadge.style.display = 'none';
    }
}

// ==========================================
// 4. BUSINESS LOGIC (The Consumer/Handler)
// ==========================================
function filterAndRenderProducts() {
    const searchTerm = searchInput.value.toLowerCase().trim();
    const selectedCategory = categoryFilter.value;

    const filteredProducts = allProducts.filter(product => {
        // เช็คเงื่อนไขให้รองรับ title
        const productName = product.title || product.name;
        const matchName = productName.toLowerCase().includes(searchTerm);
        const matchCategory = selectedCategory === 'All' || product.category === selectedCategory;

        return matchName && matchCategory;
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

    // --- แสดงผล ID ที่เพิ่งกด และข้อมูลตะกร้าทั้งหมดใน Console ---
    console.log(`🛒 เพิ่งกดเพิ่มสินค้า ID: ${productId} ลงตะกร้า!`);
    console.log("📦 สรุปข้อมูลตะกร้าปัจจุบัน (ID : จำนวนชิ้น):");
    
    // ใช้ console.table เพื่อแสดง Object 'cart' เป็นตารางที่ดูง่ายสุดๆ
    console.table(cart); 
}
// ==========================================
// 5. EVENT LISTENERS (The Triggers)
// ==========================================
searchInput.addEventListener('input', filterAndRenderProducts);
categoryFilter.addEventListener('change', filterAndRenderProducts);
productContainer.addEventListener('click', handleCartClick);

// ==========================================
// 6. INITIALIZATION & DATA FETCHING
// ==========================================
async function loadProductsData() {
    try {
        const response = await fetch('data.json');
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        allProducts = await response.json();
        renderProducts(allProducts);

        const savedCart = localStorage.getItem('shopping_cart');
        if (savedCart) {
            cart = JSON.parse(savedCart); 
            updateCartBadge(); 
        }

    } catch (error) {
        console.error("เกิดข้อผิดพลาดในการโหลดข้อมูลสินค้า:", error);
        productContainer.innerHTML = `
            <div class="col-12 text-center py-5">
                <h3 class="text-danger mb-3">Error Loading Products</h3>
                <p class="text-muted">ไม่สามารถโหลดข้อมูลสินค้าได้ในขณะนี้ โปรดตรวจสอบว่าไฟล์ data.json มีอยู่จริงและรันผ่าน Live Server</p>
            </div>
        `;
    }
}

loadProductsData();