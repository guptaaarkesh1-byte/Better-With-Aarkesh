import express from 'express';
import FooterDocument from '../models/FooterDocument.js';
import { protect, admin } from '../middleware/authMiddleware.js';

const router = express.Router();

// @desc    Get all footer documents (admin)
// @route   GET /api/footer-documents
// @access  Private/Admin
router.get('/', protect, admin, async (req, res) => {
  try {
    const documents = await FooterDocument.find({}).sort({ order: 1, createdAt: -1 });
    res.json(documents);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
});

// @desc    Get published footer documents (public)
// @route   GET /api/footer-documents/published
// @access  Public
router.get('/published', async (req, res) => {
  try {
    const documents = await FooterDocument.find({ status: 'Published' }).sort({ order: 1, createdAt: -1 }).select('title slug order');
    res.json(documents);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
});

// @desc    Get footer document by slug
// @route   GET /api/footer-documents/:slug
// @access  Public
router.get('/:slug', async (req, res) => {
  try {
    const document = await FooterDocument.findOne({ slug: req.params.slug, status: 'Published' });
    if (document) {
      res.json(document);
    } else {
      res.status(404).json({ message: 'Document not found' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
});

// @desc    Create a footer document
// @route   POST /api/footer-documents
// @access  Private/Admin
router.post('/', protect, admin, async (req, res) => {
  try {
    const { title, slug, contentHtml, status, order } = req.body;
    
    // Check if slug exists
    const documentExists = await FooterDocument.findOne({ slug });
    if (documentExists) {
      return res.status(400).json({ message: 'Document with this slug already exists' });
    }

    const document = new FooterDocument({
      title,
      slug,
      contentHtml,
      status: status || 'Draft',
      order: order || 0,
    });

    const createdDocument = await document.save();
    res.status(201).json(createdDocument);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
});

// @desc    Update a footer document
// @route   PUT /api/footer-documents/:id
// @access  Private/Admin
router.put('/:id', protect, admin, async (req, res) => {
  try {
    const { title, slug, contentHtml, status, order } = req.body;

    const document = await FooterDocument.findById(req.params.id);

    if (document) {
      // Check if updating to an existing slug
      if (slug && slug !== document.slug) {
        const slugExists = await FooterDocument.findOne({ slug });
        if (slugExists) {
          return res.status(400).json({ message: 'Another document with this slug already exists' });
        }
      }

      document.title = title || document.title;
      document.slug = slug || document.slug;
      document.contentHtml = contentHtml !== undefined ? contentHtml : document.contentHtml;
      document.status = status || document.status;
      document.order = order !== undefined ? order : document.order;

      const updatedDocument = await document.save();
      res.json(updatedDocument);
    } else {
      res.status(404).json({ message: 'Document not found' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
});

// @desc    Delete a footer document
// @route   DELETE /api/footer-documents/:id
// @access  Private/Admin
router.delete('/:id', protect, admin, async (req, res) => {
  try {
    const document = await FooterDocument.findById(req.params.id);

    if (document) {
      await FooterDocument.deleteOne({ _id: document._id });
      res.json({ message: 'Document removed' });
    } else {
      res.status(404).json({ message: 'Document not found' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
});

export default router;
