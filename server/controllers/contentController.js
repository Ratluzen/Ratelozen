const asyncHandler = require('express-async-handler');
const prisma = require('../config/db');

// --- BANNERS ---
const getBanners = asyncHandler(async (req, res) => {
  const banners = await prisma.banner.findMany();
  res.json(banners);
});

const createBanner = asyncHandler(async (req, res) => {
  const banner = await prisma.banner.create({ data: req.body });
  res.status(201).json(banner);
});

const deleteBanner = asyncHandler(async (req, res) => {
  await prisma.banner.delete({ where: { id: req.params.id } });
  res.json({ message: 'Banner removed' });
});

// --- ANNOUNCEMENTS ---
const getAnnouncements = asyncHandler(async (req, res) => {
  // Public endpoint gets active only, Admin might want all
  // For now, let's return active only or all based on query param
  const where = req.query.all ? {} : { isActive: true };
  const anns = await prisma.announcement.findMany({ where });
  res.json(anns);
});

const createAnnouncement = asyncHandler(async (req, res) => {
  const ann = await prisma.announcement.create({ data: req.body });
  res.status(201).json(ann);
});

const deleteAnnouncement = asyncHandler(async (req, res) => {
  await prisma.announcement.delete({ where: { id: req.params.id } });
  res.json({ message: 'Announcement removed' });
});

// --- CATEGORIES ---
const getCategories = asyncHandler(async (req, res) => {
  const cats = await prisma.category.findMany();
  res.json(cats);
});

const createCategory = asyncHandler(async (req, res) => {
  const cat = await prisma.category.create({ data: req.body });
  res.status(201).json(cat);
});

const deleteCategory = asyncHandler(async (req, res) => {
  await prisma.category.delete({ where: { id: req.params.id } });
  res.json({ message: 'Category removed' });
});

module.exports = {
  getBanners, createBanner, deleteBanner,
  getAnnouncements, createAnnouncement, deleteAnnouncement,
  getCategories, createCategory, deleteCategory
};