const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { authenticateToken, requireAdmin } = require('../middleware/auth');

// Public routes
router.post('/register', authController.register);
router.post('/login', authController.login);

// Protected routes (require authentication)
router.get('/me', authenticateToken, authController.getMe);
router.put('/profile', authenticateToken, authController.updateProfile);

// Admin only routes
router.get('/users', authenticateToken, requireAdmin, authController.getAllUsers);
router.get('/users/:id', authenticateToken, requireAdmin, authController.getUserById);
router.put('/users/:id', authenticateToken, requireAdmin, authController.updateUser);
router.delete('/users/:id', authenticateToken, requireAdmin, authController.deleteUser);
router.put('/users/:id/access', authenticateToken, requireAdmin, authController.updateUserAccess);

module.exports = router;