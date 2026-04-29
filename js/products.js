// ==========================================
// 1. STATE (The Source of Truth)
// ==========================================
const allProducts = [
    // 1-7: สินค้าชุดเดิม
    { id: 1, name: "Nordic Chair", price: 50.00, category: "Chair", image: "images/product-1.png" },
    { id: 2, name: "Kruzo Aero Chair", price: 78.00, category: "Chair", image: "images/product-2.png" },
    { id: 3, name: "Ergonomic Chair", price: 43.00, category: "Chair", image: "images/product-3.png" },
    { id: 4, name: "Modern Sofa", price: 150.00, category: "Sofa", image: "images/sofa.png" },
    { id: 5, name: "Minimalist Table", price: 120.00, category: "Table", image: "images/product-1.png" },
    { id: 6, name: "Vintage Lamp", price: 35.00, category: "Lamp", image: "images/product-2.png" },
    { id: 7, name: "Leather Sofa", price: 250.00, category: "Sofa", image: "images/sofa.png" },
    
    // 8-20: สินค้าชุดใหม่ที่เพิ่มเข้ามาให้ครบ 20 ชิ้น
    { id: 8, name: "Wooden Dining Table", price: 300.00, category: "Table", image: "images/product-3.png" },
    { id: 9, name: "Lounge Chair", price: 85.00, category: "Chair", image: "images/product-1.png" },
    { id: 10, name: "Fabric Corner Sofa", price: 320.00, category: "Sofa", image: "images/sofa.png" },
    { id: 11, name: "Desk Reading Lamp", price: 25.00, category: "Lamp", image: "images/product-2.png" },
    { id: 12, name: "Glass Coffee Table", price: 95.00, category: "Table", image: "images/product-3.png" },
    { id: 13, name: "Accent Armchair", price: 110.00, category: "Chair", image: "images/product-1.png" },
    { id: 14, name: "Velvet Loveseat", price: 199.00, category: "Sofa", image: "images/sofa.png" },
    { id: 15, name: "Standing Floor Lamp", price: 65.00, category: "Lamp", image: "images/product-2.png" },
    { id: 16, name: "Outdoor Patio Chair", price: 55.00, category: "Chair", image: "images/product-3.png" },
    { id: 17, name: "Study Desk", price: 140.00, category: "Table", image: "images/product-1.png" },
    { id: 18, name: "Sleeper Sofa Bed", price: 280.00, category: "Sofa", image: "images/sofa.png" },
    { id: 19, name: "Bedside Table Lamp", price: 30.00, category: "Lamp", image: "images/product-2.png" },
    { id: 20, name: "Rocking Chair", price: 90.00, category: "Chair", image: "images/product-3.png" }
];

// ==========================================
// 2. DOM ELEMENTS (The Triggers & Targets)
// ==========================================
// เอื้อมมือไปจับ Elements บน HTML ที่เราเตรียมไว้
const productContainer = document.getElementById('product-container');
const searchInput = document.getElementById('searchInput');
const categoryFilter = document.getElementById('categoryFilter');

// ==========================================
// 3. UI RENDERER (The Reflection of Data)
// ==========================================
// ฟังก์ชันนี้มีหน้าที่เดียว: รับ Array สินค้ามา แล้ววาดลงบนหน้าจอ (Update DOM)
function renderProducts(productsToRender) {
    // ล้างข้อมูลเก่าบนหน้าจอก่อนทุกครั้ง (Clear UI)
    productContainer.innerHTML = '';

    // จัดการความเงียบ (UX as Logic): ถ้าไม่มีสินค้าตรงเงื่อนไขเลย (Array length เป็น 0)
    if (productsToRender.length === 0) {
        productContainer.innerHTML = `
            <div class="col-12 text-center py-5">
                <h3 class="text-black mb-3">No results found</h3>
                <p class="text-muted">ไม่พบสินค้าที่ตรงกับคำค้นหาหรือหมวดหมู่ที่คุณเลือก ลองค้นหาด้วยคำอื่นดูนะครับ</p>
            </div>
        `;
        return; // สั่งหยุดการทำงานฟังก์ชันแค่นี้ ไม่ต้องรันโค้ดด้านล่างต่อ
    }

    // ลูปสร้าง HTML ให้สินค้าแต่ละตัว แล้วยัดลงไปใน Container
    productsToRender.forEach(product => {
        const productHTML = `
            <div class="col-12 col-md-4 col-lg-3 mb-5 mb-md-0">
                <a class="product-item" href="cart.html">
                    <img src="${product.image}" class="img-fluid product-thumbnail" alt="${product.name}">
                    <h3 class="product-title">${product.name}</h3>
                    <strong class="product-price">$${product.price.toFixed(2)}</strong>

                    <span class="icon-cross">
                        <img src="images/cross.svg" class="img-fluid" alt="Add to cart">
                    </span>
                </a>
            </div>
        `;
        // นำ HTML ที่สร้างเสร็จไปต่อท้ายใน Container
        productContainer.innerHTML += productHTML;
    });
}

// ==========================================
// 4. BUSINESS LOGIC (The Consumer/Handler)
// ==========================================
// ฟังก์ชันนี้ถูกเรียกเมื่อเกิด Event: ทำหน้าที่ดึง Input -> กรอง Array -> สั่ง Render ใหม่
function filterAndRenderProducts() {
    // Capture Input: ดึงค่าล่าสุดจากช่อง Search และ Dropdown
    const searchTerm = searchInput.value.toLowerCase().trim(); // แปลงเป็นพิมพ์เล็กและตัดช่องว่างหัวท้าย
    const selectedCategory = categoryFilter.value;

    // Filter Array: ใช้ High-Order Function (.filter) สร้าง Array ชุดใหม่
    const filteredProducts = allProducts.filter(product => {
        // เช็คเงื่อนไขที่ 1: ชื่อสินค้ามีคำค้นหาผสมอยู่ไหม? (จัดการ Case Sensitivity แล้ว)
        const matchName = product.name.toLowerCase().includes(searchTerm);

        // เช็คเงื่อนไขที่ 2: หมวดหมู่ตรงไหม? (ถ้าเลือก 'All' ให้ถือว่าผ่านเงื่อนไขทันที)
        const matchCategory = selectedCategory === 'All' || product.category === selectedCategory;

        // ต้องผ่านทั้ง 2 เงื่อนไข (AND logic) สินค้าชิ้นนี้ถึงจะรอดไปอยู่ใน Array ใหม่
        return matchName && matchCategory;
    });

    // Update DOM: ส่ง Array ที่ผ่านการกรองแล้วไปวาดบนหน้าจอ
    renderProducts(filteredProducts);
}

// ==========================================
// 5. EVENT LISTENERS (The Triggers)
// ==========================================
// สั่งให้ Browser คอยดักฟัง (Listen) พฤติกรรมของผู้ใช้
// เมื่อพิมพ์ข้อความ (input event) ให้รันฟังก์ชันกรอง
searchInput.addEventListener('input', filterAndRenderProducts);

// เมื่อเปลี่ยนตัวเลือกหมวดหมู่ (change event) ให้รันฟังก์ชันกรอง
categoryFilter.addEventListener('change', filterAndRenderProducts);

// ==========================================
// 6. INITIALIZATION
// ==========================================
// เมื่อเปิดหน้าเว็บครั้งแรก ให้ดึงข้อมูลทั้งหมดมาวาดบนหน้าจอก่อน
renderProducts(allProducts);