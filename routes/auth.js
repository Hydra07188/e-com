const express = require('express');
const authController = require('../controllers/authController');
const { authenticateToken } = require('../middlewares/authMiddleware');

const router = express.Router();

// Identity/Auth route boundary.
// Routes only define HTTP endpoints and call controllers. This is the future
// cut line for an Identity/Auth microservice.
router.post('/register', authController.register);
router.post('/login', authController.login);
router.get('/me', authenticateToken, authController.me);

module.exports = router;
