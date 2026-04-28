/**
 * DATA FLOW OVERVIEW:
 * 1. requestProducts() ถูกเรียกเมื่อโหลดหน้าเว็บ
 * 2. fetch() ดึงข้อมูลจาก 'data.json'
 * 3. แปลงข้อมูลเป็น JavaScript Object และส่งต่อไปให้ renderUI()
 * 4. renderUI() วนลูปสร้าง HTML ตามโครงสร้างของเทมเพลตและแสดงผล
 */

// ---------------------------------------------------------
// 1. INITIATION & FETCHING (ดึงข้อมูล)
// ---------------------------------------------------------
async function requestProducts() {
    const container = document.getElementById('product-container');
    
    try {
        // ขั้นตอนที่ 1 & 2: Fetch และเช็คสถานะ
        // หมายเหตุ: เช็คให้แน่ใจว่าไฟล์ data.json อยู่ถูกที่เมื่ออ้างอิงจากหน้า HTML
        const response = await fetch('data.json');
        
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }

        // แปลง JSON string เป็น JavaScript Array
        const productsData = await response.json();

        // ขั้นตอนที่ 3: ส่งข้อมูลไปวาด UI
        renderUI(productsData);

    } catch (error) {
        console.error("Failed to load products:", error);
        // แสดง Error UI หากดึงข้อมูลไม่สำเร็จ
        container.innerHTML = `
            <div class="col-12 text-center mt-5 mb-5">
                <p class="text-danger">Sorry, we couldn't load the products right now. Please try again later.</p>
            </div>
        `;
    }
}

// ---------------------------------------------------------
// 2. RENDERING THE UI (แสดงผลหน้าจอ)
// ---------------------------------------------------------
function renderUI(products) {
    const container = document.getElementById('product-container');
    let htmlContent = '';
    
    // ขั้นตอนที่ 4 & 5: วนลูปข้อมูลและสร้าง HTML String โดยใช้คลาสของ Bootstrap จากเทมเพลต
    products.forEach(product => {
        htmlContent += `
            <div class="col-12 col-md-4 col-lg-3 mb-5">
                <a class="product-item" href="${product.url || '#'}">
                    <img src="${product.image}" class="img-fluid product-thumbnail" alt="${product.title}">
                    <h3 class="product-title">${product.title}</h3>
                    <strong class="product-price">$${Number(product.price).toFixed(2)}</strong>

                    <span class="icon-cross">
                        <img src="images/cross.svg" class="img-fluid" alt="Add to cart">
                    </span>
                </a>
            </div>
        `;
    });

    // ขั้นตอนที่ 6: นำ HTML ทั้งหมดไปใส่ในหน้าเว็บทีเดียว
    container.innerHTML = htmlContent;
}

// ---------------------------------------------------------
// 3. EXECUTION (สั่งทำงาน)
// ---------------------------------------------------------
document.addEventListener('DOMContentLoaded', requestProducts);