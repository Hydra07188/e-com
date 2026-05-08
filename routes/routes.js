const express = require('express');
const productController = require('../controllers/productController');

const router = express.Router();

// Product Catalog route boundary.
// This route intentionally has no Auth middleware. That decoupling proves that
// guest users can browse products even if Identity/Auth is disabled.
router.get('/', productController.getProducts);

module.exports = router;
