const productService = require('../services/productService');

// 🌟 ต้องใส่ async ตรงนี้ เพราะเราต้องรอข้อมูลจาก Database
exports.getProducts = async (req, res) => {
    try {
        // 1. ดึงคำว่า 'hat' หรือ 'furniture' จาก URL (?category=...)
        const categoryQuery = req.query.category;

        // 2. เรียกใช้ Service โดยต้องมี await เพื่อรอให้ Database หาข้อมูลให้เสร็จ
        // (ระวังชื่อฟังก์ชันต้องตรงกับใน productService.js นะครับ)
        const products = await productService.getFilteredProducts(categoryQuery);
        
        // 3. ถ้าหาไม่เจอเลย (array ว่าง) ให้ตอบกลับเป็น 404 Not Found
        if (!products || products.length === 0) {
            return res.status(404).json({ error: "Category not found" });
        }

        // 4. ถ้าเจอข้อมูล ให้ตอบกลับเป็น 200 OK พร้อมข้อมูลสินค้า
        return res.status(200).json(products);

    } catch (error) {
        // 🚨 บรรทัดนี้สำคัญมาก! มันจะปริ้นท์สาเหตุที่แท้จริงออกมาใน Terminal ของ VS Code
        console.error("Controller Error:", error);
        
        // 5. ส่ง Error 500 กลับไปบอก Client ว่าหลังบ้านมีปัญหา
        return res.status(500).json({ error: "Internal Server Error" });
    }
};