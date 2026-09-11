import express from 'express';
import SocialLink from '../models/SocialLink.js';
import { protect, admin } from '../middleware/authMiddleware.js';

const router = express.Router();

// Helper to seed initial social links if collection is empty
const seedDefaultSocialLinks = async () => {
  const count = await SocialLink.countDocuments();
  if (count === 0) {
    const defaults = [
      { platform: 'instagram', label: 'Instagram', url: 'https://instagram.com', isActive: true, order: 0 },
      { platform: 'youtube', label: 'YouTube', url: 'https://youtube.com', isActive: true, order: 1 },
      { platform: 'x', label: 'X (Twitter)', url: 'https://twitter.com', isActive: true, order: 2 },
      { platform: 'linkedin', label: 'LinkedIn', url: 'https://linkedin.com', isActive: true, order: 3 },
    ];
    await SocialLink.insertMany(defaults);
  }
};

// @desc    Get active social links (public)
// @route   GET /api/social-links
// @access  Public
router.get('/', async (req, res) => {
  try {
    await seedDefaultSocialLinks();
    const links = await SocialLink.find({ isActive: true }).sort({ order: 1, createdAt: 1 });
    res.json(links);
  } catch (error) {
    console.error('Error fetching social links:', error);
    res.status(500).json({ message: 'Server Error' });
  }
});

// @desc    Get all social links for admin
// @route   GET /api/social-links/admin
// @access  Private/Admin
router.get('/admin', protect, admin, async (req, res) => {
  try {
    await seedDefaultSocialLinks();
    const links = await SocialLink.find({}).sort({ order: 1, createdAt: 1 });
    res.json(links);
  } catch (error) {
    console.error('Error fetching admin social links:', error);
    res.status(500).json({ message: 'Server Error' });
  }
});

// @desc    Create social link
// @route   POST /api/social-links
// @access  Private/Admin
router.post('/', protect, admin, async (req, res) => {
  try {
    const { platform, label, url, isActive = true, order = 0 } = req.body;

    if (!url || !url.trim()) {
      return res.status(400).json({ message: 'URL is required' });
    }

    const link = new SocialLink({
      platform: platform || 'other',
      label: label?.trim() || platform || 'Social Link',
      url: url.trim(),
      isActive: Boolean(isActive),
      order: Number(order) || 0,
    });

    const savedLink = await link.save();
    res.status(201).json(savedLink);
  } catch (error) {
    console.error('Error creating social link:', error);
    res.status(500).json({ message: 'Server Error' });
  }
});

// @desc    Update social link
// @route   PUT /api/social-links/:id
// @access  Private/Admin
router.put('/:id', protect, admin, async (req, res) => {
  try {
    const { platform, label, url, isActive, order } = req.body;
    const link = await SocialLink.findById(req.params.id);

    if (!link) {
      return res.status(404).json({ message: 'Social link not found' });
    }

    if (platform !== undefined) link.platform = platform;
    if (label !== undefined) link.label = label.trim();
    if (url !== undefined) link.url = url.trim();
    if (isActive !== undefined) link.isActive = Boolean(isActive);
    if (order !== undefined) link.order = Number(order);

    const updatedLink = await link.save();
    res.json(updatedLink);
  } catch (error) {
    console.error('Error updating social link:', error);
    res.status(500).json({ message: 'Server Error' });
  }
});

// @desc    Delete social link
// @route   DELETE /api/social-links/:id
// @access  Private/Admin
router.delete('/:id', protect, admin, async (req, res) => {
  try {
    const link = await SocialLink.findById(req.params.id);
    if (!link) {
      return res.status(404).json({ message: 'Social link not found' });
    }

    await SocialLink.findByIdAndDelete(req.params.id);
    res.json({ message: 'Social link deleted successfully' });
  } catch (error) {
    console.error('Error deleting social link:', error);
    res.status(500).json({ message: 'Server Error' });
  }
});

export default router;
