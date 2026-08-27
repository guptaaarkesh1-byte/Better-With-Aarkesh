import express from 'express';
import Article from '../models/Article.js';
import { protect, admin } from '../middleware/authMiddleware.js';

const router = express.Router();

const toPayload = (article) => ({
  categoryId: article.categoryId,
  categoryTitle: article.categoryTitle,
  headingId: article.headingId,
  headingTitle: article.headingTitle,
  title: article.title,
  description: article.description || '',
  readTime: article.readTime || '',
  status: article.status || 'Draft',
  featuredImage: article.featuredImage || '',
  bodyHtml: article.bodyHtml || '',
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
