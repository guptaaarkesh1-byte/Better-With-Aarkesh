import express from 'express';
import Article from '../models/Article.js';
import { protect, admin } from '../middleware/authMiddleware.js';

const router = express.Router();

const toPayload = (article) => ({
  slug: article.slug || '',
  categoryId: article.categoryId || article.category?.toLowerCase() || 'relationships',
  categoryTitle: article.categoryTitle || article.category || 'Relationships',
  headingId: article.headingId || article.category?.toLowerCase() || 'relationships',
  headingTitle: article.headingTitle || article.category || 'Relationships',
  category: article.category || 'RELATIONSHIPS',
  categoryNum: article.categoryNum || '01 / 06',
  title: article.title,
  subtitle: article.subtitle || article.excerpt || article.description || '',
  excerpt: article.excerpt || article.subtitle || article.description || '',
  highlightText: article.highlightText || '',
  description: article.description || article.subtitle || article.excerpt || '',
  quote: article.quote || '',
  date: article.date || '',
  readTime: article.readTime || '',
  status: article.status || 'Published',
  image: article.image || article.featuredImage || '',
  featuredImage: article.featuredImage || article.image || '',
  dropCap: article.dropCap || 'W',
  dropCapText: article.dropCapText || '',
  paragraphsAfterDropCap: article.paragraphsAfterDropCap || [],
  sections: article.sections || [],
  blocks: article.blocks || [],
  bodyHtml: article.bodyHtml || '',
});



// GET all articles or filter by query
router.get('/', async (req, res) => {
  try {
    const query = {};
    if (req.query.categoryId) query.categoryId = req.query.categoryId;
    if (req.query.headingId) query.headingId = req.query.headingId;
    if (req.query.status) query.status = req.query.status;
    const articles = await Article.find(query).sort({ updatedAt: -1, createdAt: -1 });
    res.json(articles);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error fetching articles' });
  }
});

// POST /api/articles - Create or upsert article
router.post('/', async (req, res) => {
  try {
    const payload = toPayload(req.body);
    const existingId = req.body._id || req.body.id;
    const existingSlug = req.body.slug || (payload.title ? payload.title.toLowerCase().replace(/[^a-z0-9]+/g, '-') : '');

    let article = null;
    if (existingId && existingId.match(/^[0-9a-fA-F]{24}$/)) {
      article = await Article.findById(existingId);
    }
    if (!article && existingSlug) {
      article = await Article.findOne({ slug: existingSlug });
    }

    if (article) {
      Object.assign(article, payload);
      const updated = await article.save();
      return res.json(updated);
    }

    const created = await Article.create(payload);
    res.status(201).json(created);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error saving article' });
  }
});

// GET single article by slug or ID
router.get('/single/:idOrSlug', async (req, res) => {
  try {
    const { idOrSlug } = req.params;
    let article = null;
    if (idOrSlug.match(/^[0-9a-fA-F]{24}$/)) {
      article = await Article.findById(idOrSlug);
    }
    if (!article) {
      article = await Article.findOne({ slug: idOrSlug });
    }
    if (!article) {
      return res.status(404).json({ message: 'Article not found' });
    }
    res.json(article);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error fetching single article' });
  }
});

router.get('/published', async (req, res) => {
  try {
    const query = { status: 'Published' };

    if (req.query.categoryId) {
      query.categoryId = req.query.categoryId;
    }

    if (req.query.headingId) {
      query.headingId = req.query.headingId;
    }

    const articles = await Article.find(query).sort({ updatedAt: -1, createdAt: -1 });
    res.json(articles);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error fetching published articles' });
  }
});

router.get('/admin', protect, admin, async (req, res) => {
  try {
    const articles = await Article.find().sort({ updatedAt: -1, createdAt: -1 });
    res.json(articles);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error fetching admin articles' });
  }
});

router.post('/admin', protect, admin, async (req, res) => {
  try {
    const article = await Article.create(toPayload(req.body));
    res.status(201).json(article);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error creating article' });
  }
});

router.put('/admin/:id', protect, admin, async (req, res) => {
  try {
    const article = await Article.findById(req.params.id);

    if (!article) {
      return res.status(404).json({ message: 'Article not found' });
    }

    Object.assign(article, toPayload(req.body));
    const updatedArticle = await article.save();
    res.json(updatedArticle);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error updating article' });
  }
});

// DELETE /api/articles/:idOrSlug  — open delete (used by admin panel)
router.delete('/:idOrSlug', async (req, res) => {
  try {
    const { idOrSlug } = req.params;
    let article = null;

    if (idOrSlug.match(/^[0-9a-fA-F]{24}$/)) {
      article = await Article.findById(idOrSlug);
    }
    if (!article) {
      article = await Article.findOne({ slug: idOrSlug });
    }
    if (!article) {
      return res.status(404).json({ message: 'Article not found' });
    }

    await article.deleteOne();
    res.json({ message: 'Article deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error deleting article' });
  }
});

router.delete('/admin/:id', protect, admin, async (req, res) => {
  try {
    const article = await Article.findById(req.params.id);

    if (!article) {
      return res.status(404).json({ message: 'Article not found' });
    }

    await article.deleteOne();
    res.json({ message: 'Article deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error deleting article' });
  }
});

export default router;
