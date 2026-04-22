const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');
const { authenticateToken, requireAdmin } = require('../middleware/auth');

// Protected routes (require authentication)
router.post('/', authenticateToken, orderController.createOrder);
router.get('/my-orders', authenticateToken, orderController.getMyOrders);
router.get('/:id', authenticateToken, orderController.getOrderById);
router.put('/:id/cancel', authenticateToken, orderController.cancelOrder);

// Admin only routes
router.get('/', authenticateToken, requireAdmin, orderController.getAllOrders);
router.put('/:id/status', authenticateToken, requireAdmin, orderController.updateOrderStatus);
router.put('/:id/payment', authenticateToken, requireAdmin, orderController.updatePaymentStatus);

module.exports = router;