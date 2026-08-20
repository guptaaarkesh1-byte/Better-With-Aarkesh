import express from 'express';
import { protect, admin } from '../middleware/authMiddleware.js';
import Video from '../models/Video.js';

const router = express.Router();

// @route   GET /api/videos
// @desc    Get all videos
// @access  Public
router.get('/', async (req, res) => {
  try {
    const videos = await Video.find({}).sort({ createdAt: -1 });
    res.json(videos);
  } catch (error) {
    console.error('Error fetching videos:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/videos/published
// @desc    Get all published videos
// @access  Public
router.get('/published', async (req, res) => {
  try {
    const videos = await Video.find({ status: 'Published' }).sort({ createdAt: -1 });
    res.json(videos);
  } catch (error) {
    console.error('Error fetching published videos:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/videos
// @desc    Create a video
// @access  Private/Admin
router.post('/', protect, admin, async (req, res) => {
  try {
    const { title, description, videoUrl, thumbnailUrl, duration, status } = req.body;

    const video = new Video({
      title,
      description,
      videoUrl,
      thumbnailUrl,
      duration,
      status,
    });

    const createdVideo = await video.save();
    res.status(201).json(createdVideo);
  } catch (error) {
    console.error('Error creating video:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/videos/:id
// @desc    Update a video
// @access  Private/Admin
router.put('/:id', protect, admin, async (req, res) => {
  try {
    const { title, description, videoUrl, thumbnailUrl, duration, status } = req.body;

    const video = await Video.findById(req.params.id);

    if (video) {
      video.title = title || video.title;
      video.description = description || video.description;
      video.videoUrl = videoUrl || video.videoUrl;
      video.thumbnailUrl = thumbnailUrl || video.thumbnailUrl;
      video.duration = duration || video.duration;
      video.status = status || video.status;

      const updatedVideo = await video.save();
      res.json(updatedVideo);
    } else {
      res.status(404).json({ message: 'Video not found' });
    }
  } catch (error) {
    console.error('Error updating video:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   DELETE /api/videos/:id
// @desc    Delete a video
// @access  Private/Admin
router.delete('/:id', protect, admin, async (req, res) => {
  try {
    const video = await Video.findById(req.params.id);

    if (video) {
      await Video.deleteOne({ _id: video._id });
      res.json({ message: 'Video removed' });
    } else {
      res.status(404).json({ message: 'Video not found' });
    }
  } catch (error) {
    console.error('Error deleting video:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;
