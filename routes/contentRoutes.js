const express = require('express');
const router = express.Router();
const contentController = require('../controllers/contentController');
const { authenticateToken, requireAdmin } = require('../middleware/auth');

// Public routes
router.get('/about', contentController.getAbout);
router.get('/team', contentController.getTeam);
router.get('/blogs', contentController.getBlogs);
router.get('/blogs/:slug', contentController.getBlogById);
router.post('/contact', contentController.submitContact);

// Admin only routes
router.put('/about', authenticateToken, requireAdmin, contentController.updateAbout);

router.post('/team', authenticateToken, requireAdmin, contentController.createTeamMember);
router.put('/team/:id', authenticateToken, requireAdmin, contentController.updateTeamMember);
router.delete('/team/:id', authenticateToken, requireAdmin, contentController.deleteTeamMember);

router.post('/blogs', authenticateToken, requireAdmin, contentController.createBlog);
router.put('/blogs/:id', authenticateToken, requireAdmin, contentController.updateBlog);
router.delete('/blogs/:id', authenticateToken, requireAdmin, contentController.deleteBlog);

router.get('/contact', authenticateToken, requireAdmin, contentController.getContacts);
router.put('/contact/:id', authenticateToken, requireAdmin, contentController.updateContact);
router.delete('/contact/:id', authenticateToken, requireAdmin, contentController.deleteContact);

module.exports = router;