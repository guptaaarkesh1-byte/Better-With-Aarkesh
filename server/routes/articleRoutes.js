import express from 'express';
import Article from '../models/Article.js';
import Settings from '../models/Settings.js';
import { protect, admin } from '../middleware/authMiddleware.js';
import { CURATED_LIBRARY_ARTICLES } from '../data/curatedArticlesData.js';

const router = express.Router();

const stripArticleNumbering = (title) => {
  if (!title || typeof title !== 'string') return title;
  return title
    .replace(/^\s*\d+(\.\d+)+[\.\s\-–—:]*\s*/, '')
    .replace(/^\s*\d{1,2}\.\s+/, '')
    .trim();
};

const toPayload = (article) => ({
  slug: article.slug || '',
  categoryId: article.categoryId || article.category?.toLowerCase() || 'relationships',
  categoryTitle: article.categoryTitle || article.category || 'Relationships',
  headingId: article.headingId || article.category?.toLowerCase() || 'relationships',
  headingTitle: article.headingTitle || article.category || 'Relationships',
  category: article.category || 'RELATIONSHIPS',
  categoryNum: article.categoryNum || '01 / 06',
  title: stripArticleNumbering(article.title),
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
  order: typeof article.order === 'number' ? article.order : 0,
  dropCap: article.dropCap || 'W',
  dropCapText: article.dropCapText || '',
  paragraphsAfterDropCap: article.paragraphsAfterDropCap || [],
  sections: article.sections || [],
  blocks: article.blocks || [],
  bodyHtml: article.bodyHtml || '',
});

// Helper to get deleted articles list
const getDeletedSlugs = async () => {
  try {
    const doc = await Settings.findOne({ key: 'deleted_library_articles' });
    return Array.isArray(doc?.value) ? doc.value : [];
  } catch (_) {
    return [];
  }
};

// Seed default curated articles once if DB is fresh
const ensureArticlesSeeded = async () => {
  try {
    const count = await Article.countDocuments();
    const deletedSlugs = await getDeletedSlugs();

    if (count === 0 && deletedSlugs.length === 0) {
      console.log('Seeding initial curated library articles...');
      const seedData = CURATED_LIBRARY_ARTICLES.map(a => toPayload(a));
      await Article.insertMany(seedData);
      console.log(`Seeded ${seedData.length} library articles.`);
    }
  } catch (err) {
    console.error('Error ensuring articles seeded:', err);
  }
};

// Run seed check
ensureArticlesSeeded();

// PUT /api/articles/reorder - Reorder articles
router.put('/reorder', async (req, res) => {
  try {
    const { articleIds } = req.body;
    if (Array.isArray(articleIds) && articleIds.length > 0) {
      const updatePromises = articleIds.map((id, index) => {
        const query = id.match(/^[0-9a-fA-F]{24}$/) ? { _id: id } : { slug: id };
        return Article.findOneAndUpdate(query, { order: index + 1 });
      });
      await Promise.all(updatePromises);
    }
    const articles = await Article.find({}).sort({ order: 1, createdAt: 1 });
    res.json({ success: true, message: 'Articles reordered successfully', articles });
  } catch (error) {
    console.error('Error reordering articles:', error);
    res.status(500).json({ message: 'Server error reordering articles' });
  }
});

// GET all articles or filter by query
router.get('/', async (req, res) => {
  try {
    const deletedSlugs = await getDeletedSlugs();
    const query = {};
    if (req.query.categoryId) query.categoryId = req.query.categoryId;
    if (req.query.headingId) query.headingId = req.query.headingId;
    if (req.query.status) query.status = req.query.status;

    let articles = await Article.find(query).sort({ order: 1, createdAt: 1 });

    // Filter out any explicitly deleted articles
    if (deletedSlugs.length > 0) {
      articles = articles.filter(a => 
        !deletedSlugs.includes(a.slug) && 
        !deletedSlugs.includes(a.title) && 
        !deletedSlugs.includes(String(a._id)) &&
        !deletedSlugs.includes(a.id)
      );
    }

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
    const deletedSlugs = await getDeletedSlugs();
    if (deletedSlugs.includes(idOrSlug)) {
      return res.status(404).json({ message: 'Article not found' });
    }

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

// GET published articles for public client
router.get('/published', async (req, res) => {
  try {
    const deletedSlugs = await getDeletedSlugs();
    const query = { status: 'Published' };

    if (req.query.categoryId) {
      query.categoryId = req.query.categoryId;
    }

    if (req.query.headingId) {
      query.headingId = req.query.headingId;
    }

    let articles = await Article.find(query).sort({ order: 1, createdAt: 1 });

    if (deletedSlugs.length > 0) {
      articles = articles.filter(a => 
        !deletedSlugs.includes(a.slug) && 
        !deletedSlugs.includes(a.title) && 
        !deletedSlugs.includes(String(a._id)) &&
        !deletedSlugs.includes(a.id)
      );
    }

    res.json(articles);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error fetching published articles' });
  }
});

router.get('/admin', protect, admin, async (req, res) => {
  try {
    const deletedSlugs = await getDeletedSlugs();
    let articles = await Article.find().sort({ order: 1, createdAt: 1 });
    if (deletedSlugs.length > 0) {
      articles = articles.filter(a => !deletedSlugs.includes(a.slug) && !deletedSlugs.includes(a.title));
    }
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

// DELETE /api/articles/:idOrSlug — permanent delete (handles _id, slug, id or title)
router.delete('/:idOrSlug', async (req, res) => {
  try {
    const { idOrSlug } = req.params;
    const { slug, title, id } = req.body || {};

    const deletionKeys = [
      idOrSlug,
      slug,
      title,
      id
    ].filter(Boolean);

    // Record in deleted_library_articles list in Settings
    await Settings.findOneAndUpdate(
      { key: 'deleted_library_articles' },
      { $addToSet: { value: { $each: deletionKeys } } },
      { upsert: true, new: true }
    );

    // Delete matching documents in MongoDB
    const filterConditions = [];
    if (idOrSlug && idOrSlug.match(/^[0-9a-fA-F]{24}$/)) {
      filterConditions.push({ _id: idOrSlug });
    }
    if (idOrSlug) filterConditions.push({ slug: idOrSlug }, { title: idOrSlug });
    if (slug) filterConditions.push({ slug: slug });
    if (title) filterConditions.push({ title: title });

    if (filterConditions.length > 0) {
      await Article.deleteMany({ $or: filterConditions });
    }

    res.json({ success: true, message: 'Article deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error deleting article' });
  }
});

router.delete('/admin/:id', protect, admin, async (req, res) => {
  try {
    const { id } = req.params;
    const article = await Article.findById(id);

    if (article) {
      await Settings.findOneAndUpdate(
        { key: 'deleted_library_articles' },
        { $addToSet: { value: { $each: [id, article.slug, article.title].filter(Boolean) } } },
        { upsert: true, new: true }
      );
      await article.deleteOne();
    }

    res.json({ message: 'Article deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error deleting article' });
  }
});

export default router;
