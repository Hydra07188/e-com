const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');

// จับคู่ GET Request เข้ากับฟังก์ชัน getProducts[cite: 9]
router.get('/', productController.getProducts);

module.exports = router;