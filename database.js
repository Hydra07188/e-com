const sqlite3 = require('sqlite3');
const { open } = require('sqlite');

async function setupDatabase() {
    // 1. เปิดการเชื่อมต่อ (มันจะสร้างไฟล์ database.sqlite ให้เราอัตโนมัติ)
    const db = await open({
        filename: './database.sqlite',
        driver: sqlite3.Database
    });

    // 2. สร้างตาราง products 
    // อิงจากข้อมูลเดิมที่คุณมี (id, url, image, title, price) และเพิ่ม category เข้าไป
    await db.exec(`
        CREATE TABLE IF NOT EXISTS products (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            url TEXT,
            image TEXT,
            title TEXT,
            price REAL,
            category TEXT
        )
    `);

    // 3. เช็คว่ามีข้อมูลในตารางหรือยัง ถ้ายังให้ Insert ข้อมูลจำลองเริ่มต้นเข้าไป
    const { count } = await db.get('SELECT COUNT(*) as count FROM products');
    if (count === 0) {
        await db.run(`INSERT INTO products (url, image, title, price, category) VALUES 
            ('#', 'images/product-3.png', 'Nordic Chair', 50.00, 'furniture'),
            ('#', 'images/product-1.png', 'Kruzo Aero Chair', 78.00, 'furniture'),
            ('#', 'images/product-2.png', 'Cool Hat', 15.00, 'hat')
        `);
        console.log("✅ Mock data inserted into SQLite successfully!");
    } else {
        console.log("✅ Database is ready!");
    }

    return db;
}

// ส่งออก Connection ให้ไฟล์อื่นเอาไปใช้ต่อ
module.exports = setupDatabase();