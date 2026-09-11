import express from 'express';
import FooterColumn from '../models/FooterColumn.js';
import { protect, admin } from '../middleware/authMiddleware.js';

const router = express.Router();

// Helper to seed initial columns if collection is empty
const seedDefaultColumns = async (category = 'course') => {
  if (category === 'course') {
    const defaultCourseColumns = [
      {
        title: 'COURSE',
        category: 'course',
        order: 0,
        links: [
          { label: 'Curriculum', url: '#curriculum', type: 'scroll', order: 0 },
          { label: 'Student Portal', url: '/course/profile', type: 'internal', actionType: 'portal', order: 1 },
          { label: 'Enroll (₹15,000)', url: '', type: 'action', actionType: 'enroll', order: 2 },
        ],
      },
      {
        title: 'COACHING',
        category: 'course',
        order: 1,
        links: [
          { label: '1-on-1 Sessions', url: '/', type: 'internal', order: 0 },
          { label: 'Articles & Library', url: '/library', type: 'internal', order: 1 },
          { label: 'About Aarkesh', url: '/#meet-aarkesh', type: 'internal', order: 2 },
        ],
      },
      {
        title: 'LEGAL',
        category: 'course',
        order: 2,
        links: [
          { label: 'Course Terms & Conditions', url: '', type: 'document', documentSlug: 'course-terms-and-conditions', order: 0 },
          { label: 'Course Refund Policy', url: '', type: 'document', documentSlug: 'course-refund-policy', order: 1 },
          { label: 'Course Privacy Policy', url: '', type: 'document', documentSlug: 'course-privacy-policy', order: 2 },
          { label: 'support@betterwithaarkesh.com', url: 'mailto:support@betterwithaarkesh.com', type: 'external', order: 3 },
        ],
      },
    ];
    await FooterColumn.insertMany(defaultCourseColumns);
  }
};

// @desc    Get published footer columns with links (public)
// @route   GET /api/footer-columns
// @access  Public
router.get('/', async (req, res) => {
  try {
    const category = req.query.category || 'course';
    let columns = await FooterColumn.find({ category }).sort({ order: 1, createdAt: 1 });

    if (columns.length === 0 && category === 'course') {
      await seedDefaultColumns('course');
      columns = await FooterColumn.find({ category }).sort({ order: 1, createdAt: 1 });
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
    const filter = {};
    if (req.query.category) {
      filter.category = req.query.category;
    }
    const columns = await FooterColumn.find(filter).sort({ order: 1, createdAt: 1 });
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
    const { title, category = 'course', order = 0, links = [] } = req.body;

    if (!title || !title.trim()) {
      return res.status(400).json({ message: 'Column heading is required' });
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

// @desc    Update a footer column
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

// @desc    Reset/Seed default columns
// @route   POST /api/footer-columns/reset
// @access  Private/Admin
router.post('/reset', protect, admin, async (req, res) => {
  try {
    const category = req.body.category || 'course';
    await FooterColumn.deleteMany({ category });
    await seedDefaultColumns(category);
    const columns = await FooterColumn.find({ category }).sort({ order: 1, createdAt: 1 });
    res.json(columns);
  } catch (error) {
    console.error('Error resetting footer columns:', error);
    res.status(500).json({ message: 'Server Error' });
  }
});

export default router;
