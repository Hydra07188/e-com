// ดึงไฟล์ database.js ที่เราเพิ่งสร้างมาใช้งาน
const dbPromise = require('../database'); 

exports.getFilteredProducts = async (categoryQuery) => {
    // ถ้าไม่มีการส่ง category มา ให้ส่ง array ว่างกลับไป (เพื่อเข้าเงื่อนไข 404 ใน Controller)
    if (!categoryQuery) return [];

    try {
        // รอให้ระบบเชื่อมต่อ Database ให้เสร็จ
        const db = await dbPromise; 
        
        // ใช้คำสั่ง SQL SELECT เพื่อหาข้อมูลตาม Category
        // LOWER() ช่วยให้ค้นหาแบบไม่สนตัวพิมพ์เล็ก-ใหญ่ (เช่น 'Hat' หรือ 'hat' ก็เจอหมด)
        // เครื่องหมาย ? เป็นการส่งค่าพารามิเตอร์เพื่อป้องกัน SQL Injection
        const products = await db.all(
            'SELECT * FROM products WHERE LOWER(category) = LOWER(?)', 
            [categoryQuery]
        );

        return products; 
    } catch (error) {
        // ถ้า Query พัง โยน Error ออกไปให้ Controller จัดการ (เพื่อพ่น Status 500)
        throw error; 
    }
};