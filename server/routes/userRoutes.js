import express from 'express';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { protect } from '../middleware/authMiddleware.js';
import User from '../models/User.js';
import Article from '../models/Article.js';
import Video from '../models/Video.js';

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

    res.json((user.savedArticles || []).filter(Boolean));
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
    const { articleId, title, category, excerpt, image, slug } = req.body;

    if (!articleId && !title) {
      return res.status(400).json({ message: 'Article ID or Title is required' });
    }

    let targetArticle = null;
    if (articleId && mongoose.isValidObjectId(articleId)) {
      targetArticle = await Article.findById(articleId);
    }
    if (!targetArticle) {
      const searchConditions = [];
      if (articleId && typeof articleId === 'string') {
        searchConditions.push({ slug: articleId }, { title: articleId });
      }
      if (slug) searchConditions.push({ slug });
      if (title) searchConditions.push({ title });

      if (searchConditions.length > 0) {
        targetArticle = await Article.findOne({ $or: searchConditions });
      }
    }

    // Auto-create article in DB if it's a curated/custom article not yet persisted
    if (!targetArticle) {
      targetArticle = await Article.create({
        title: title || (typeof articleId === 'string' ? articleId : 'Curated Article'),
        slug: slug || (typeof articleId === 'string' ? articleId : 'article'),
        category: category || 'RELATIONSHIPS',
        categoryId: (category || 'relationships').toLowerCase(),
        description: excerpt || '',
        featuredImage: image || '/library_preview_silhouette.jpg',
        image: image || '/library_preview_silhouette.jpg',
        status: 'Published'
      });
    }

    const finalId = targetArticle._id;
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (!user.savedArticles) {
      user.savedArticles = [];
    }

    const index = user.savedArticles.findIndex(id => id?.toString() === finalId.toString());

    if (index === -1) {
      user.savedArticles.push(finalId);
    } else {
      user.savedArticles.splice(index, 1);
    }

    await user.save();

    res.json({ 
      message: index === -1 ? 'Article saved successfully' : 'Article removed from saved',
      isSaved: index === -1,
      articleId: finalId,
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

    res.json((user.completedArticles || []).filter(Boolean));
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
    const { articleId, title, category, excerpt, image, slug } = req.body;

    if (!articleId && !title) {
      return res.status(400).json({ message: 'Article ID or Title is required' });
    }

    let targetArticle = null;
    if (articleId && mongoose.isValidObjectId(articleId)) {
      targetArticle = await Article.findById(articleId);
    }
    if (!targetArticle) {
      const searchConditions = [];
      if (articleId && typeof articleId === 'string') {
        searchConditions.push({ slug: articleId }, { title: articleId });
      }
      if (slug) searchConditions.push({ slug });
      if (title) searchConditions.push({ title });

      if (searchConditions.length > 0) {
        targetArticle = await Article.findOne({ $or: searchConditions });
      }
    }

    if (!targetArticle) {
      targetArticle = await Article.create({
        title: title || (typeof articleId === 'string' ? articleId : 'Curated Article'),
        slug: slug || (typeof articleId === 'string' ? articleId : 'article'),
        category: category || 'RELATIONSHIPS',
        categoryId: (category || 'relationships').toLowerCase(),
        description: excerpt || '',
        featuredImage: image || '/library_preview_silhouette.jpg',
        image: image || '/library_preview_silhouette.jpg',
        status: 'Published'
      });
    }

    const finalId = targetArticle._id;
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (!user.completedArticles) {
      user.completedArticles = [];
    }

    const index = user.completedArticles.findIndex(id => id?.toString() === finalId.toString());

    if (index === -1) {
      user.completedArticles.push(finalId);
      if (user.savedArticles) {
        const savedIndex = user.savedArticles.findIndex(id => id?.toString() === finalId.toString());
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
      articleId: finalId,
      completedArticles: user.completedArticles,
      savedArticles: user.savedArticles
    });
  } catch (error) {
    console.error('Error toggling completed article:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/users/saved-videos
// @desc    Get user's saved videos
// @access  Private
router.get('/saved-videos', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate('savedVideos');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json((user.savedVideos || []).filter(Boolean));
  } catch (error) {
    console.error('Error fetching saved videos:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/users/save-video
// @desc    Toggle saving/unsaving a video
// @access  Private
router.post('/save-video', protect, async (req, res) => {
  try {
    const { videoId, title, videoUrl, thumbnailUrl, duration } = req.body;
    if (!videoId && !title) {
      return res.status(400).json({ message: 'Video ID or Title is required' });
    }

    let targetVideo = null;
    if (videoId && mongoose.isValidObjectId(videoId)) {
      targetVideo = await Video.findById(videoId);
    }
    if (!targetVideo) {
      const searchConditions = [];
      if (videoId && typeof videoId === 'string') {
        searchConditions.push({ title: videoId }, { videoUrl: videoId });
      }
      if (title) searchConditions.push({ title });
      if (videoUrl) searchConditions.push({ videoUrl });

      if (searchConditions.length > 0) {
        targetVideo = await Video.findOne({ $or: searchConditions });
      }
    }

    if (!targetVideo) {
      targetVideo = await Video.create({
        title: title || (typeof videoId === 'string' ? videoId : 'Curated Video'),
        videoUrl: videoUrl || '',
        thumbnailUrl: thumbnailUrl || '',
        duration: duration || 'VIDEO',
        status: 'Published'
      });
    }

    const finalId = targetVideo._id;
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (!user.savedVideos) {
      user.savedVideos = [];
    }

    const index = user.savedVideos.findIndex(id => id?.toString() === finalId.toString());
    if (index === -1) {
      user.savedVideos.push(finalId);
    } else {
      user.savedVideos.splice(index, 1);
    }

    await user.save();

    res.json({ 
      message: index === -1 ? 'Video saved successfully' : 'Video removed from saved',
      isSaved: index === -1,
      videoId: finalId,
      savedVideos: user.savedVideos 
    });
  } catch (error) {
    console.error('Error toggling saved video:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/users/completed-videos
// @desc    Get user's completed videos
// @access  Private
router.get('/completed-videos', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate('completedVideos');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json((user.completedVideos || []).filter(Boolean));
  } catch (error) {
    console.error('Error fetching completed videos:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/users/complete-video
// @desc    Toggle marking a video as completed
// @access  Private
router.post('/complete-video', protect, async (req, res) => {
  try {
    const { videoId, title, videoUrl, thumbnailUrl, duration } = req.body;
    if (!videoId && !title) {
      return res.status(400).json({ message: 'Video ID or Title is required' });
    }

    let targetVideo = null;
    if (videoId && mongoose.isValidObjectId(videoId)) {
      targetVideo = await Video.findById(videoId);
    }
    if (!targetVideo) {
      const searchConditions = [];
      if (videoId && typeof videoId === 'string') {
        searchConditions.push({ title: videoId }, { videoUrl: videoId });
      }
      if (title) searchConditions.push({ title });
      if (videoUrl) searchConditions.push({ videoUrl });

      if (searchConditions.length > 0) {
        targetVideo = await Video.findOne({ $or: searchConditions });
      }
    }

    if (!targetVideo) {
      targetVideo = await Video.create({
        title: title || (typeof videoId === 'string' ? videoId : 'Curated Video'),
        videoUrl: videoUrl || '',
        thumbnailUrl: thumbnailUrl || '',
        duration: duration || 'VIDEO',
        status: 'Published'
      });
    }

    const finalId = targetVideo._id;
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (!user.completedVideos) {
      user.completedVideos = [];
    }

    const index = user.completedVideos.findIndex(id => id?.toString() === finalId.toString());
    if (index === -1) {
      user.completedVideos.push(finalId);
      if (user.savedVideos) {
        const savedIndex = user.savedVideos.findIndex(id => id?.toString() === finalId.toString());
        if (savedIndex !== -1) {
          user.savedVideos.splice(savedIndex, 1);
        }
      }
    } else {
      user.completedVideos.splice(index, 1);
    }

    await user.save();

    res.json({ 
      message: index === -1 ? 'Video marked as watched' : 'Video unmarked as watched',
      isCompleted: index === -1,
      videoId: finalId,
      completedVideos: user.completedVideos,
      savedVideos: user.savedVideos
    });
  } catch (error) {
    console.error('Error toggling completed video:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/users/change-password
// @desc    Change user password
// @access  Private
router.post('/change-password', protect, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Verify current password
    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Incorrect current password' });
    }

    // Validate new password
    if (!newPassword || newPassword.length < 6) {
      return res.status(400).json({ message: 'New password must be at least 6 characters long' });
    }

    // Hash new password
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);
    await user.save();

    res.json({ message: 'Password updated successfully' });
  } catch (error) {
    console.error('Error changing password:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;
