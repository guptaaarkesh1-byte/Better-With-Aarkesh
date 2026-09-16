import express from 'express';
import CourseCard from '../models/CourseCard.js';
import { protect, admin } from '../middleware/authMiddleware.js';

const router = express.Router();

const DEFAULT_CARDS = [
  {
    title: 'The Foundation of Presence',
    description: 'Discover how to anchor yourself in any high-pressure situation with calm, unshakeable energy.',
    order: 0,
    isActive: true,
  },
  {
    title: 'Breaking Reactive Patterns',
    description: 'Identify and dissolve the emotional triggers that cause you to react instead of respond.',
    order: 1,
    isActive: true,
  },
  {
    title: 'Magnetic Communication',
    description: 'Develop a voice and language that people naturally lean toward and remember.',
    order: 2,
    isActive: true,
  },
  {
    title: 'Non-Verbal Mastery',
    description: 'Harness the 93% of communication that happens without words — posture, eye contact, space.',
    order: 3,
    isActive: true,
  },
  {
    title: 'Leadership from Within',
    description: 'Stop performing authority and start embodying it — people will follow without being asked.',
    order: 4,
    isActive: true,
  },
  {
    title: 'Emotional Sovereignty',
    description: 'Condition your nervous system to stay laser-focused, composed, and mentally sharp under extreme stress.',
    order: 5,
    isActive: true,
  },
  {
    title: 'Executive Gravitas & Charisma',
    description: 'Command high-stakes rooms and social dynamics with effortless poise, vocal resonance, and respect.',
    order: 6,
    isActive: true,
  },
  {
    title: 'The Ripple Effect',
    description: 'Turn your internal transformation into lasting impact on every relationship and environment.',
    order: 7,
    isActive: true,
  },
];

// Helper to auto-seed default cards if table is empty
const ensureDefaultCards = async () => {
  const count = await CourseCard.countDocuments();
  if (count === 0) {
    await CourseCard.insertMany(DEFAULT_CARDS);
  }
};

// ─── PUBLIC: Get all active cards for Course Landing Page ───
router.get('/public', async (req, res) => {
  try {
    await ensureDefaultCards();
    const cards = await CourseCard.find({ isActive: true }).sort({ order: 1, createdAt: 1 });
    res.json(cards);
  } catch (error) {
    console.error('Error fetching public course cards:', error);
    res.status(500).json({ message: 'Failed to fetch course cards' });
  }
});

// ─── ADMIN: Get all cards (active + inactive) ───
router.get('/admin', protect, admin, async (req, res) => {
  try {
    await ensureDefaultCards();
    const cards = await CourseCard.find().sort({ order: 1, createdAt: 1 });
    res.json(cards);
  } catch (error) {
    console.error('Error fetching admin course cards:', error);
    res.status(500).json({ message: 'Failed to fetch course cards' });
  }
});

// ─── ADMIN: Create a new card ───
router.post('/admin', protect, admin, async (req, res) => {
  try {
    const { title, description, order, isActive, icon } = req.body;
    if (!title || !description) {
      return res.status(400).json({ message: 'Title and description are required' });
    }

    const highestOrderDoc = await CourseCard.findOne().sort({ order: -1 });
    const nextOrder = order !== undefined ? Number(order) : (highestOrderDoc?.order !== undefined ? highestOrderDoc.order + 1 : 0);

    const card = await CourseCard.create({
      title: title.trim(),
      description: description.trim(),
      order: nextOrder,
      isActive: isActive !== undefined ? Boolean(isActive) : true,
      icon: icon || 'CheckCircle',
    });

    res.status(201).json(card);
  } catch (error) {
    console.error('Error creating course card:', error);
    res.status(500).json({ message: 'Failed to create card' });
  }
});

// ─── ADMIN: Update an existing card ───
router.put('/admin/:id', protect, admin, async (req, res) => {
  try {
    const { title, description, order, isActive, icon } = req.body;
    const card = await CourseCard.findById(req.params.id);
    if (!card) {
      return res.status(404).json({ message: 'Card not found' });
    }

    if (title !== undefined) card.title = title.trim();
    if (description !== undefined) card.description = description.trim();
    if (order !== undefined) card.order = Number(order);
    if (isActive !== undefined) card.isActive = Boolean(isActive);
    if (icon !== undefined) card.icon = icon;

    await card.save();
    res.json(card);
  } catch (error) {
    console.error('Error updating course card:', error);
    res.status(500).json({ message: 'Failed to update card' });
  }
});

// ─── ADMIN: Delete a card ───
router.delete('/admin/:id', protect, admin, async (req, res) => {
  try {
    const card = await CourseCard.findByIdAndDelete(req.params.id);
    if (!card) {
      return res.status(404).json({ message: 'Card not found' });
    }
    res.json({ message: 'Card deleted successfully' });
  } catch (error) {
    console.error('Error deleting course card:', error);
    res.status(500).json({ message: 'Failed to delete card' });
  }
});

// ─── ADMIN: Reset to default 8 cards ───
router.post('/admin/reset-defaults', protect, admin, async (req, res) => {
  try {
    await CourseCard.deleteMany({});
    const inserted = await CourseCard.insertMany(DEFAULT_CARDS);
    res.json({ message: 'Reset to default 8 cards successfully', cards: inserted });
  } catch (error) {
    console.error('Error resetting course cards:', error);
    res.status(500).json({ message: 'Failed to reset cards' });
  }
});

export default router;
