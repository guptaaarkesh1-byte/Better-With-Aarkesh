import express from 'express';
import CourseFaq from '../models/CourseFaq.js';
import { protect, admin } from '../middleware/authMiddleware.js';

const router = express.Router();

const DEFAULT_FAQS = [
  {
    question: 'How long do I have access to the course materials?',
    answer: 'You get lifetime access to all masterclass modules, downloadable resources, and all future updates with no recurring charges.',
    order: 0,
    isActive: true,
  },
  {
    question: 'How do the 3 free coaching sessions work?',
    answer: 'Once enrolled, you can book your private 1-on-1 sessions directly with Aarkesh through your course profile dashboard.',
    order: 1,
    isActive: true,
  },
  {
    question: 'What format is the course delivered in?',
    answer: 'High-definition on-demand video masterclasses with actionable workbooks, downloadable frameworks, and direct 1-on-1 coaching.',
    order: 2,
    isActive: true,
  },
  {
    question: 'Is this course beginner-friendly?',
    answer: 'Absolutely. The framework starts from the fundamental psychology of presence and builds step-by-step toward advanced leadership and magnetism.',
    order: 3,
    isActive: true,
  },
];

// Helper to auto-seed default FAQs if table is empty
const ensureDefaultFaqs = async () => {
  const count = await CourseFaq.countDocuments();
  if (count === 0) {
    await CourseFaq.insertMany(DEFAULT_FAQS);
  }
};

// ─── PUBLIC: Get all active FAQs for Course Landing Page ───
router.get('/public', async (req, res) => {
  try {
    await ensureDefaultFaqs();
    const faqs = await CourseFaq.find({ isActive: true }).sort({ order: 1, createdAt: 1 });
    res.json(faqs);
  } catch (error) {
    console.error('Error fetching public course faqs:', error);
    res.status(500).json({ message: 'Failed to fetch FAQs' });
  }
});

// ─── ADMIN: Get all FAQs (active + inactive) ───
router.get('/admin', protect, admin, async (req, res) => {
  try {
    await ensureDefaultFaqs();
    const faqs = await CourseFaq.find().sort({ order: 1, createdAt: 1 });
    res.json(faqs);
  } catch (error) {
    console.error('Error fetching admin course faqs:', error);
    res.status(500).json({ message: 'Failed to fetch FAQs' });
  }
});

// ─── ADMIN: Create a new FAQ ───
router.post('/admin', protect, admin, async (req, res) => {
  try {
    const { question, answer, order, isActive } = req.body;
    if (!question || !answer) {
      return res.status(400).json({ message: 'Question and Answer are required' });
    }

    const highestOrderDoc = await CourseFaq.findOne().sort({ order: -1 });
    const nextOrder = order !== undefined ? Number(order) : (highestOrderDoc?.order !== undefined ? highestOrderDoc.order + 1 : 0);

    const faq = await CourseFaq.create({
      question: question.trim(),
      answer: answer.trim(),
      order: nextOrder,
      isActive: isActive !== undefined ? Boolean(isActive) : true,
    });

    res.status(201).json(faq);
  } catch (error) {
    console.error('Error creating course FAQ:', error);
    res.status(500).json({ message: 'Failed to create FAQ' });
  }
});

import mongoose from 'mongoose';

// ─── ADMIN: Update an existing FAQ ───
router.put('/admin/:id', protect, admin, async (req, res) => {
  try {
    const { question, answer, order, isActive } = req.body;
    let faq = null;

    if (mongoose.Types.ObjectId.isValid(req.params.id)) {
      faq = await CourseFaq.findById(req.params.id);
    } else if (question) {
      faq = await CourseFaq.findOne({ question: question.trim() });
    }

    if (!faq) {
      // If not found by ID or question, create new one
      const highestOrderDoc = await CourseFaq.findOne().sort({ order: -1 });
      const nextOrder = order !== undefined ? Number(order) : (highestOrderDoc?.order !== undefined ? highestOrderDoc.order + 1 : 0);
      faq = await CourseFaq.create({
        question: question ? question.trim() : 'FAQ Question',
        answer: answer ? answer.trim() : 'FAQ Answer',
        order: nextOrder,
        isActive: isActive !== undefined ? Boolean(isActive) : true,
      });
      return res.status(201).json(faq);
    }

    if (question !== undefined) faq.question = question.trim();
    if (answer !== undefined) faq.answer = answer.trim();
    if (order !== undefined) faq.order = Number(order);
    if (isActive !== undefined) faq.isActive = Boolean(isActive);

    await faq.save();
    res.json(faq);
  } catch (error) {
    console.error('Error updating course FAQ:', error);
    res.status(500).json({ message: error.message || 'Failed to update FAQ' });
  }
});

// ─── ADMIN: Delete an FAQ ───
router.delete('/admin/:id', protect, admin, async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: 'Invalid FAQ ID' });
    }
    const faq = await CourseFaq.findByIdAndDelete(req.params.id);
    if (!faq) {
      return res.status(404).json({ message: 'FAQ not found' });
    }
    res.json({ message: 'FAQ deleted successfully' });
  } catch (error) {
    console.error('Error deleting course FAQ:', error);
    res.status(500).json({ message: error.message || 'Failed to delete FAQ' });
  }
});

// ─── ADMIN: Reset to default 4 FAQs ───
router.post('/admin/reset-defaults', protect, admin, async (req, res) => {
  try {
    await CourseFaq.deleteMany({});
    const inserted = await CourseFaq.insertMany(DEFAULT_FAQS);
    res.json({ message: 'Reset to default 4 FAQs successfully', faqs: inserted });
  } catch (error) {
    console.error('Error resetting course FAQs:', error);
    res.status(500).json({ message: 'Failed to reset FAQs' });
  }
});

export default router;
