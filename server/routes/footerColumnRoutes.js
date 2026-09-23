import express from 'express';
import FooterColumn from '../models/FooterColumn.js';
import FooterDocument from '../models/FooterDocument.js';
import Settings from '../models/Settings.js';
import { protect, admin } from '../middleware/authMiddleware.js';

const router = express.Router();

const DEFAULT_FOOTER_SETTINGS = {
  brandDescription: 'Authentic 1-on-1 mentorship, transformational coaching & self-mastery courses designed to quiet inner noise, dissolve reactive patterns, and elevate your presence.',
  brandEmail: 'coaching@betterwithaarkesh.com',
  copyrightText: '© 2026 Better With Aarkesh. All rights reserved.',
};

// Helper to seed initial unified columns if collection is empty
const seedDefaultUnifiedColumns = async () => {
  const defaultColumns = [
    {
      title: 'QUICK LINKS',
      category: 'general',
      order: 0,
      links: [
        { label: 'Home', url: '/', type: 'internal', order: 0 },
        { label: 'Coaching', url: '/#philosophy', type: 'internal', order: 1 },
        { label: 'About', url: '/#meet-aarkesh', type: 'internal', order: 2 },
        { label: 'Testimonials', url: '/#testimonials', type: 'internal', order: 3 },
        { label: 'FAQ', url: '/#faq', type: 'internal', order: 4 },
        { label: 'Library', url: '/library', type: 'internal', order: 5 },
      ],
    },
    {
      title: 'COURSES',
      category: 'general',
      order: 1,
      links: [
        { label: 'All Courses', url: '/course', type: 'internal', order: 0 },
        { label: 'My Courses', url: '/course/profile', type: 'internal', order: 1 },
        { label: 'Course Details', url: '/course#curriculum', type: 'internal', order: 2 },
        { label: 'Course Orders / Payments', url: '/course/profile', type: 'internal', order: 3 },
      ],
    },
    {
      title: 'COACHING',
      category: 'general',
      order: 2,
      links: [
        { label: 'Book a Session', url: '/book', type: 'internal', order: 0 },
        { label: 'My Sessions', url: '/my-journey', type: 'internal', order: 1 },
        { label: 'Session Details', url: '/my-journey', type: 'internal', order: 2 },
        { label: 'Session Payments', url: '/my-journey', type: 'internal', order: 3 },
      ],
    },
    {
      title: 'COMPANY',
      category: 'general',
      order: 3,
      links: [
        { label: 'About Us', url: '/#meet-aarkesh', type: 'internal', order: 0 },
        { label: 'Contact Us', url: 'mailto:coaching@betterwithaarkesh.com', type: 'external', order: 1 },
        { label: 'FAQ', url: '/#faq', type: 'internal', order: 2 },
      ],
    },
    {
      title: 'LEGAL',
      category: 'general',
      order: 4,
      links: [
        { label: 'Terms & Conditions', url: '/terms-and-conditions', type: 'internal', order: 0 },
        { label: 'Privacy Policy', url: '/privacy-policy', type: 'internal', order: 1 },
        { label: 'Refund & Cancellation Policy', url: '/refund-and-cancellation', type: 'internal', order: 2 },
      ],
    },
  ];
  await FooterColumn.insertMany(defaultColumns);
};

// ─── BRAND & TEXT SETTINGS ───────────────────────────────────────

// @desc    Get footer brand text settings
// @route   GET /api/footer-columns/settings
// @access  Public
router.get('/settings', async (req, res) => {
  try {
    const doc = await Settings.findOne({ key: 'footer_settings' });
    if (!doc || !doc.value) {
      return res.json(DEFAULT_FOOTER_SETTINGS);
    }
    res.json({
      brandDescription: doc.value.brandDescription || DEFAULT_FOOTER_SETTINGS.brandDescription,
      brandEmail: doc.value.brandEmail || DEFAULT_FOOTER_SETTINGS.brandEmail,
      copyrightText: doc.value.copyrightText || DEFAULT_FOOTER_SETTINGS.copyrightText,
    });
  } catch (error) {
    console.error('Error fetching footer settings:', error);
    res.json(DEFAULT_FOOTER_SETTINGS);
  }
});

// @desc    Update footer brand text settings
// @route   PUT /api/footer-columns/settings
// @access  Private/Admin
router.put('/settings', protect, admin, async (req, res) => {
  try {
    const { brandDescription, brandEmail, copyrightText } = req.body;
    
    const value = {
      brandDescription: brandDescription !== undefined ? brandDescription : DEFAULT_FOOTER_SETTINGS.brandDescription,
      brandEmail: brandEmail !== undefined ? brandEmail : DEFAULT_FOOTER_SETTINGS.brandEmail,
      copyrightText: copyrightText !== undefined ? copyrightText : DEFAULT_FOOTER_SETTINGS.copyrightText,
    };

    const updated = await Settings.findOneAndUpdate(
      { key: 'footer_settings' },
      { value },
      { upsert: true, new: true }
    );

    res.json(updated.value);
  } catch (error) {
    console.error('Error updating footer settings:', error);
    res.status(500).json({ message: 'Server Error' });
  }
});

// ─── DYNAMIC FOOTER COLUMNS & LINKS ──────────────────────────────

// @desc    Get published footer columns with links (public)
// @route   GET /api/footer-columns
// @access  Public
router.get('/', async (req, res) => {
  try {
    let columns = await FooterColumn.find({}).sort({ order: 1, createdAt: 1 });

    if (columns.length === 0) {
      await seedDefaultUnifiedColumns();
      columns = await FooterColumn.find({}).sort({ order: 1, createdAt: 1 });
    }

    res.json(columns);
  } catch (error) {
    console.error('Error fetching footer columns:', error);
    res.status(500).json({ message: 'Server Error' });
  }
});

// @desc    Get all footer columns for admin
// @route   GET /api/footer-columns/admin
// @access  Private/Admin
router.get('/admin', protect, admin, async (req, res) => {
  try {
    let columns = await FooterColumn.find({}).sort({ order: 1, createdAt: 1 });
    if (columns.length === 0) {
      await seedDefaultUnifiedColumns();
      columns = await FooterColumn.find({}).sort({ order: 1, createdAt: 1 });
    }
    res.json(columns);
  } catch (error) {
    console.error('Error fetching admin footer columns:', error);
    res.status(500).json({ message: 'Server Error' });
  }
});

// @desc    Create a new footer column
// @route   POST /api/footer-columns
// @access  Private/Admin
router.post('/', protect, admin, async (req, res) => {
  try {
    const { title, category = 'general', order = 0, links = [] } = req.body;

    if (!title || !title.trim()) {
      return res.status(400).json({ message: 'Column title is required' });
    }

    const column = new FooterColumn({
      title: title.trim(),
      category,
      order: Number(order) || 0,
      links,
    });

    const savedColumn = await column.save();
    res.status(201).json(savedColumn);
  } catch (error) {
    console.error('Error creating footer column:', error);
    res.status(500).json({ message: 'Server Error' });
  }
});

// @desc    Reorder footer columns
// @route   PUT /api/footer-columns/reorder/all
// @access  Private/Admin
router.put('/reorder/all', protect, admin, async (req, res) => {
  try {
    const { columnIds } = req.body;
    if (Array.isArray(columnIds) && columnIds.length > 0) {
      for (let i = 0; i < columnIds.length; i++) {
        await FooterColumn.findByIdAndUpdate(columnIds[i], { order: i + 1 });
      }
    }
    const columns = await FooterColumn.find({}).sort({ order: 1, createdAt: 1 });
    res.json(columns);
  } catch (error) {
    console.error('Error reordering footer columns:', error);
    res.status(500).json({ message: 'Server Error' });
  }
});

// @desc    Update a footer column (title, order, links)
// @route   PUT /api/footer-columns/:id
// @access  Private/Admin
router.put('/:id', protect, admin, async (req, res) => {
  try {
    const { title, category, order, links } = req.body;
    const column = await FooterColumn.findById(req.params.id);

    if (!column) {
      return res.status(404).json({ message: 'Column not found' });
    }

    if (title !== undefined) column.title = title.trim();
    if (category !== undefined) column.category = category;
    if (order !== undefined) column.order = Number(order);
    if (links !== undefined) column.links = links;

    const updatedColumn = await column.save();
    res.json(updatedColumn);
  } catch (error) {
    console.error('Error updating footer column:', error);
    res.status(500).json({ message: 'Server Error' });
  }
});

// @desc    Delete a footer column
// @route   DELETE /api/footer-columns/:id
// @access  Private/Admin
router.delete('/:id', protect, admin, async (req, res) => {
  try {
    const column = await FooterColumn.findById(req.params.id);
    if (!column) {
      return res.status(404).json({ message: 'Column not found' });
    }

    await FooterColumn.findByIdAndDelete(req.params.id);
    res.json({ message: 'Column deleted successfully' });
  } catch (error) {
    console.error('Error deleting footer column:', error);
    res.status(500).json({ message: 'Server Error' });
  }
});

// @desc    Rename a footer section across columns and documents
// @route   PUT /api/footer-columns/rename-section
// @access  Private/Admin
router.put('/rename-section', protect, admin, async (req, res) => {
  try {
    const { oldName, newName } = req.body;
    if (!oldName || !newName || !newName.trim()) {
      return res.status(400).json({ message: 'Both old and new section names are required' });
    }

    const cleanOld = oldName.trim().toUpperCase();
    const cleanNew = newName.trim().toUpperCase();

    // Update column title if exists
    await FooterColumn.updateMany(
      { title: { $regex: new RegExp(`^${cleanOld}$`, 'i') } },
      { $set: { title: cleanNew } }
    );

    // Update all footer documents having this columnHeading
    const docUpdate = await FooterDocument.updateMany(
      { columnHeading: { $regex: new RegExp(`^${cleanOld}$`, 'i') } },
      { $set: { columnHeading: cleanNew } }
    );

    res.json({ message: 'Section renamed successfully', modifiedCount: docUpdate.modifiedCount });
  } catch (error) {
    console.error('Error renaming footer section:', error);
    res.status(500).json({ message: 'Server Error' });
  }
});

// @desc    Reset all columns to defaults
// @route   POST /api/footer-columns/reset
// @access  Private/Admin
router.post('/reset', protect, admin, async (req, res) => {
  try {
    await FooterColumn.deleteMany({});
    await seedDefaultUnifiedColumns();
    const columns = await FooterColumn.find({}).sort({ order: 1, createdAt: 1 });
    res.json(columns);
  } catch (error) {
    console.error('Error resetting footer columns:', error);
    res.status(500).json({ message: 'Server Error' });
  }
});

export default router;
