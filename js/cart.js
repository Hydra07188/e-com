// ==========================================
// 1. STATE (The Source of Truth)
// ==========================================
let cart = {}; // เก็บข้อมูลตะกร้าที่โหลดมาจาก LocalStorage
let allProducts = []; // เก็บข้อมูลแคตตาล็อกสินค้าทั้งหมด

// ==========================================
// 2. DOM ELEMENTS (The Targets)
// ==========================================
// ใช้ ID ที่เราเพิ่งเติมไปใน HTML เมื่อกี้
const cartTbody = document.getElementById('cart-tbody');
const cartSubtotal = document.getElementById('cart-subtotal');
const cartTotal = document.getElementById('cart-total');

// ==========================================
// 3. UI RENDERER (The Reflection of Data)
// ==========================================
function renderCart() {
    // ล้างตารางข้อมูลเก่าทิ้งก่อน
    if(cartTbody) cartTbody.innerHTML = '';
    
    let totalAmount = 0;
    
    // เช็คว่าตะกร้าว่างเปล่าหรือไม่
    if (Object.keys(cart).length === 0) {
        if(cartTbody) {
            cartTbody.innerHTML = `
                <tr>
                    <td colspan="6" class="text-center py-5">
                        <h4 class="text-muted">Your cart is empty</h4>
                        <a href="shop.html" class="btn btn-black mt-3">Continue shopping</a>
                    </td>
                </tr>
            `;
        }
        updateTotals(0);
        return;
    }

    // วนลูปตาม ID สินค้าที่มีในตะกร้า (cart object)
    for (const [productId, quantity] of Object.entries(cart)) {
        // ค้นหาข้อมูลสินค้าจาก allProducts ด้วย ID
        // (ระวัง: object key เป็น String แต่ id ใน JSON อาจเป็น Number เลยใช้ == แทน === หรือแปลง type ก่อน)
        const product = allProducts.find(p => p.id == productId);

        if (product) {
            const itemTotal = product.price * quantity;
            totalAmount += itemTotal; // สะสมยอดรวม

            // สร้างแถวตารางสินค้าแต่ละชิ้น
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td class="product-thumbnail">
                    <img src="${product.image}" alt="Image" class="img-fluid">
                </td>
                <td class="product-name">
                    <h2 class="h5 text-black">${product.title || product.name}</h2>
                </td>
                <td>$${product.price.toFixed(2)}</td>
                <td>
                    <!-- ระบบเพิ่ม/ลด จำนวนสินค้า -->
                    <div class="input-group mb-3 d-flex align-items-center quantity-container" style="max-width: 120px; margin: 0 auto;">
                        <div class="input-group-prepend">
                            <button class="btn btn-outline-black decrease" type="button" data-id="${product.id}">&minus;</button>
                        </div>
                        <input type="text" class="form-control text-center quantity-amount" value="${quantity}" readonly>
                        <div class="input-group-append">
                            <button class="btn btn-outline-black increase" type="button" data-id="${product.id}">&plus;</button>
                        </div>
                    </div>
                </td>
                <td>$${itemTotal.toFixed(2)}</td>
                <td><a href="#" class="btn btn-black btn-sm remove-item" data-id="${product.id}">X</a></td>
            `;
            cartTbody.appendChild(tr);
        }
    }

    // อัปเดตยอดรวมด้านล่าง
    updateTotals(totalAmount);
}

function updateTotals(amount) {
    if(cartSubtotal) cartSubtotal.innerText = `$${amount.toFixed(2)}`;
    if(cartTotal) cartTotal.innerText = `$${amount.toFixed(2)}`;
}

// ==========================================
// 4. BUSINESS LOGIC & EVENT DELEGATION
// ==========================================
// บันทึกข้อมูลลง LocalStorage (Serialization)
function saveCart() {
    localStorage.setItem('shopping_cart', JSON.stringify(cart));
    renderCart(); // พอข้อมูลเปลี่ยน ก็สั่งให้ UI อัปเดตตัวเองทันที
}

// ใช้ Event Delegation ดักฟังการคลิกทั้งตาราง
if (cartTbody) {
    cartTbody.addEventListener('click', function(event) {
        const target = event.target;
        
        // ถ้าคลิกปุ่ม เพิ่มจำนวน (+)
        if (target.classList.contains('increase')) {
            const id = target.dataset.id;
            cart[id] += 1;
            saveCart();
        }
        
        // ถ้าคลิกปุ่ม ลดจำนวน (-)
        if (target.classList.contains('decrease')) {
            const id = target.dataset.id;
            if (cart[id] > 1) {
                cart[id] -= 1; // <--- แก้ไขตรงนี้ เติม = เข้าไป
            } else {
                delete cart[id]; // ถ้าเหลือ 0 ให้ลบออกจากตะกร้า
            }
            saveCart();
        }

        // ถ้าคลิกปุ่ม ลบสินค้า (X)
        if (target.classList.contains('remove-item')) {
            event.preventDefault(); // ป้องกันลิงก์กระตุก
            const id = target.dataset.id;
            delete cart[id];
            saveCart();
        }
    });
}

// ==========================================
// 5. INITIALIZATION & DATA FETCHING
// ==========================================
async function initCart() {
    try {
        const response = await fetch('/api/products');
        if (!response.ok) throw new Error('Network response was not ok');
        allProducts = await response.json();

        // 2. Hydration: โหลดข้อมูลตะกร้าจาก LocalStorage[cite: 5]
        const savedCart = localStorage.getItem('shopping_cart');
        if (savedCart) {
            cart = JSON.parse(savedCart); // แปลง String กลับเป็น Object[cite: 5]
        }

        // 3. เริ่มวาดหน้าจอ
        renderCart();
        
    } catch (error) {
        console.error("Error loading cart data:", error);
    }
}

// สั่งทำงานทันทีที่เปิดหน้าเว็บ
initCart();
