const express = require('express');
const orderController = require('../controllers/orderController');

const router = express.Router();

// Order route boundary.
// Routes stay thin so this endpoint can later move behind an Order Service
// gateway without rewriting checkout business logic.
router.post('/', orderController.checkout);

module.exports = router;
