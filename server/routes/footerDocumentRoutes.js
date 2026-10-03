import express from 'express';
import FooterDocument from '../models/FooterDocument.js';
import { protect, admin } from '../middleware/authMiddleware.js';

const router = express.Router();

const CORE_DOCUMENTS = [
  {
    title: 'Terms & Conditions',
    slug: 'terms-and-conditions',
    columnHeading: 'LEGAL',
    status: 'Published',
    order: 1,
    contentHtml: '<h2>Terms & Conditions</h2><p>Welcome to Better With Aarkesh. By accessing our services, you agree to these terms.</p>'
  },
  {
    title: 'Privacy Policy',
    slug: 'privacy-policy',
    columnHeading: 'LEGAL',
    status: 'Published',
    order: 2,
    contentHtml: '<h2>Privacy Policy</h2><p>Your privacy is important to us. We protect all personal information responsibly.</p>'
  },
  {
    title: 'Refund & Cancellation Policy',
    slug: 'refund-and-cancellation',
    columnHeading: 'LEGAL',
    status: 'Published',
    order: 3,
    contentHtml: '<h2>Refund & Cancellation Policy</h2><p>Details regarding refunds, cancellations, and session rescheduling.</p>'
  },
  {
    title: 'Contact Us',
    slug: 'contact-us',
    columnHeading: 'COMPANY',
    status: 'Published',
    order: 4,
    contentHtml: ''
  },
  {
    title: 'About Us',
    slug: 'about-us',
    columnHeading: 'COMPANY',
    status: 'Published',
    order: 5,
    contentHtml: '<h2>About Better With Aarkesh</h2><p>Authentic mentorship and transformational coaching.</p>'
  }
];

const sanitizeHtml = (html) => {
  if (!html || typeof html !== 'string') return '';
  return html
    .replace(/<img[^>]*src=["'](?:webkit-fake-url:[^"']*|blob:[^"']*|data:image\/[^"']*placeholder[^"']*|about:blank|)["'][^>]*>/gi, '')
    .replace(/<img(?![^>]*\bsrc=)[^>]*>/gi, '')
    .replace(/<img[^>]*src=["']\s*["'][^>]*>/gi, '')
    .replace(/<img[^>]*width=["'](?:0|1)["'][^>]*>/gi, '');
};

let isCoreSeeded = false;
const ensureCoreDocuments = async () => {
  if (isCoreSeeded) return;
  try {
    for (const coreDoc of CORE_DOCUMENTS) {
      const exists = await FooterDocument.findOne({ 
        slug: { $in: [coreDoc.slug, `/${coreDoc.slug}`] } 
      });
      if (!exists) {
        await FooterDocument.create(coreDoc);
      }
    }
    isCoreSeeded = true;
  } catch (err) {
    console.error('Error ensuring core footer documents:', err);
  }
};

// @desc    Get all footer documents (admin / public)
// @route   GET /api/footer-documents
// @access  Public
router.get('/', async (req, res) => {
  try {
    await ensureCoreDocuments();
    const filter = {};
    if (req.query.category) {
      filter.category = req.query.category;
    }
    const documents = await FooterDocument.find(filter).sort({ order: 1, createdAt: -1 });
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
    const filter = { status: 'Published' };
    if (req.query.category) {
      filter.category = req.query.category;
    }
    const documents = await FooterDocument.find(filter).sort({ order: 1, createdAt: -1 }).select('title slug order category columnHeading');
    res.json(documents);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
});

// @desc    Get footer document by slug
// @route   GET /api/footer-documents/:slug or /api/footer-documents/slug/:slug
// @access  Public
const getDocumentBySlug = async (req, res) => {
  try {
    const rawSlug = req.params.slug ? req.params.slug.replace(/^\/+/, '') : '';
    const document = await FooterDocument.findOne({ 
      slug: { $in: [rawSlug, `/${rawSlug}`] }, 
      status: 'Published' 
    });
    if (document) {
      res.json(document);
    } else {
      res.status(404).json({ message: 'Document not found' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};

router.get('/slug/:slug', getDocumentBySlug);
router.get('/:slug', getDocumentBySlug);

// @desc    Create a footer document
// @route   POST /api/footer-documents
// @access  Private/Admin
router.post('/', protect, admin, async (req, res) => {
  try {
    const { title, slug, contentHtml, status, order, category, columnHeading } = req.body;
    
    // Check if slug exists
    const documentExists = await FooterDocument.findOne({ slug });
    if (documentExists) {
      return res.status(400).json({ message: 'Document with this slug already exists' });
    }

    const document = new FooterDocument({
      title,
      slug,
      contentHtml: sanitizeHtml(contentHtml),
      status: status || 'Draft',
      category: category || 'coaching',
      columnHeading: (columnHeading || 'LEGAL').trim().toUpperCase(),
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
    const { title, slug, contentHtml, status, order, category, columnHeading } = req.body;

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
      document.contentHtml = contentHtml !== undefined ? sanitizeHtml(contentHtml) : document.contentHtml;
      document.status = status || document.status;
      document.category = category || document.category || 'coaching';
      if (columnHeading !== undefined) {
        document.columnHeading = columnHeading.trim().toUpperCase();
      }
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
