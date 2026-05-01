const productService = require('../services/productService');

exports.getProducts = (req, res) => {
    try {
        // ดึงข้อมูลสินค้าจาก Service
        const products = productService.getAllProducts();
        
        // ส่งข้อมูลกลับไปให้ Client พร้อม Status 200 OK
        res.status(200).json(products);
    } catch (error) {
        console.error("Error fetching products:", error);
        // หากมีข้อผิดพลาด ส่ง Status 500 Internal Server Error[cite: 9]
        res.status(500).json({ error: "Internal Server Error" });
    }
};