import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import User from '../models/User.js';

const router = express.Router();

// @route   GET /api/users/saved-articles
// @desc    Get user's saved articles
// @access  Private
router.get('/saved-articles', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate('savedArticles');
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json(user.savedArticles || []);
  } catch (error) {
    console.error('Error fetching saved articles:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/users/save-article
// @desc    Toggle saving/unsaving an article
// @access  Private
router.post('/save-article', protect, async (req, res) => {
  try {
    const { articleId } = req.body;

    if (!articleId) {
      return res.status(400).json({ message: 'Article ID is required' });
    }

    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Initialize array if it doesn't exist
    if (!user.savedArticles) {
      user.savedArticles = [];
    }

    const index = user.savedArticles.indexOf(articleId);

    if (index === -1) {
      // Add article
      user.savedArticles.push(articleId);
    } else {
      // Remove article
      user.savedArticles.splice(index, 1);
    }

    await user.save();

    res.json({ 
      message: index === -1 ? 'Article saved successfully' : 'Article removed from saved',
      isSaved: index === -1,
      savedArticles: user.savedArticles 
    });
  } catch (error) {
    console.error('Error toggling saved article:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/users/completed-articles
// @desc    Get user's completed articles
// @access  Private
router.get('/completed-articles', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate('completedArticles');
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json(user.completedArticles || []);
  } catch (error) {
    console.error('Error fetching completed articles:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/users/complete-article
// @desc    Toggle marking an article as complete
// @access  Private
router.post('/complete-article', protect, async (req, res) => {
  try {
    const { articleId } = req.body;

    if (!articleId) {
      return res.status(400).json({ message: 'Article ID is required' });
    }

    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (!user.completedArticles) {
      user.completedArticles = [];
    }

    const index = user.completedArticles.indexOf(articleId);

    if (index === -1) {
      user.completedArticles.push(articleId);
      // Remove from saved articles if it exists there
      if (user.savedArticles) {
        const savedIndex = user.savedArticles.indexOf(articleId);
        if (savedIndex !== -1) {
          user.savedArticles.splice(savedIndex, 1);
        }
      }
    } else {
      user.completedArticles.splice(index, 1);
    }

    await user.save();

    res.json({ 
      message: index === -1 ? 'Article marked as complete' : 'Article marked as incomplete',
      isCompleted: index === -1,
      completedArticles: user.completedArticles,
      savedArticles: user.savedArticles
    });
  } catch (error) {
    console.error('Error toggling completed article:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;
