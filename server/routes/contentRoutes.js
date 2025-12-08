const express = require('express');
const router = express.Router();
const { protect, admin } = require('../middleware/authMiddleware');
const {
  getBanners, createBanner, deleteBanner,
  getAnnouncements, createAnnouncement, deleteAnnouncement,
  getCategories, createCategory, deleteCategory
} = require('../controllers/contentController');

// Banners
router.route('/banners')
  .get(getBanners)
  .post(protect, admin, createBanner);
router.delete('/banners/:id', protect, admin, deleteBanner);

// Announcements
router.route('/announcements')
  .get(getAnnouncements)
  .post(protect, admin, createAnnouncement);
router.delete('/announcements/:id', protect, admin, deleteAnnouncement);

// Categories
router.route('/categories')
  .get(getCategories)
  .post(protect, admin, createCategory);
router.delete('/categories/:id', protect, admin, deleteCategory);

module.exports = router;