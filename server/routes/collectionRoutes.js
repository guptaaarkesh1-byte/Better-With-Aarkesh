import express from 'express';
import Collection from '../models/Collection.js';
import { protect, admin } from '../middleware/authMiddleware.js';


import Article from '../models/Article.js';
import Video from '../models/Video.js';

const router = express.Router();

router.get('/published', async (req, res) => {
  try {
    const collections = await Collection.find({ status: 'Published' }).sort({ updatedAt: -1, createdAt: -1 }).lean();
    
    // For each collection, populate the items
    for (let c of collections) {
      for (let item of c.items) {
        if (item.itemType === 'Article') {
          const article = await Article.findById(item.itemId).lean();
          console.log("Checking article:", item.itemId, "Found:", !!article);
          if (article) {
             item.duration = article.readTime || '5 MIN';
             item.image = article.featuredImage || '';
             item.hasPlay = false;
             item.categoryId = article.categoryId;
             item.headingId = article.headingId;
             console.log("Attached category:", item.categoryId, "to item");
          }
        } else if (item.itemType === 'Video') {
          const video = await Video.findById(item.itemId).lean();
          if (video) {
             item.duration = '10 MIN'; // Default for video
             item.image = video.thumbnailUrl || '';
             item.hasPlay = true;
          }
        }
      }
    }
    
    res.json(collections.map(c => ({ ...c, DEBUG_DUMMY: "YES" })));
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error fetching published collections' });
  }
});

router.get('/admin', protect, admin, async (req, res) => {
  try {
    const collections = await Collection.find().sort({ updatedAt: -1, createdAt: -1 });
    res.json(collections);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error fetching admin collections' });
  }
});

router.post('/admin', protect, admin, async (req, res) => {
  try {
    const collection = await Collection.create({
      title: req.body.title,
      status: req.body.status || 'Draft',
      items: req.body.items || []
    });
    res.status(201).json(collection);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error creating collection' });
  }
});

router.put('/admin/:id', protect, admin, async (req, res) => {
  try {
    const collection = await Collection.findById(req.params.id);

    if (!collection) {
      return res.status(404).json({ message: 'Collection not found' });
    }

    collection.title = req.body.title || collection.title;
    collection.status = req.body.status || collection.status;
    
    if (req.body.items) {
      collection.items = req.body.items;
    }

    const updatedCollection = await collection.save();
    res.json(updatedCollection);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error updating collection' });
  }
});

router.delete('/admin/:id', protect, admin, async (req, res) => {
  try {
    const collection = await Collection.findById(req.params.id);

    if (!collection) {
      return res.status(404).json({ message: 'Collection not found' });
    }

    await collection.deleteOne();
    res.json({ message: 'Collection deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error deleting collection' });
  }
});

export default router;
