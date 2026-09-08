import express from 'express';
import { protect, admin } from '../middleware/authMiddleware.js';
import Video from '../models/Video.js';

const router = express.Router();

// @route   POST /api/videos/cloudflare-upload
// @desc    Create a one-time Cloudflare Stream upload URL
// @access  Private/Admin
router.post('/cloudflare-upload', protect, admin, async (req, res) => {
  try {
    const { CLOUDFLARE_ACCOUNT_ID, CLOUDFLARE_API_TOKEN } = process.env;

    if (!CLOUDFLARE_ACCOUNT_ID || !CLOUDFLARE_API_TOKEN) {
      return res.status(500).json({ message: 'Cloudflare Stream is not configured' });
    }

    const response = await fetch(
      `https://api.cloudflare.com/client/v4/accounts/${CLOUDFLARE_ACCOUNT_ID}/stream/direct_upload`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${CLOUDFLARE_API_TOKEN}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ maxDurationSeconds: 7200 }),
      }
    );
    const data = await response.json();

    if (!response.ok || !data.success) {
      return res.status(502).json({ message: 'Cloudflare could not create an upload URL' });
    }

    res.json({ uploadURL: data.result.uploadURL, uid: data.result.uid });
  } catch (error) {
    console.error('Error creating Cloudflare upload URL:', error);
    res.status(500).json({ message: 'Server error creating video upload' });
  }
});

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
    const { title, videoUrl, thumbnailUrl, description, duration, streamUid, status } = req.body;

    const video = new Video({
      title,
      videoUrl: streamUid ? `https://iframe.videodelivery.net/${streamUid}` : videoUrl,
      thumbnailUrl: streamUid ? `https://videodelivery.net/${streamUid}/thumbnails/thumbnail.jpg` : thumbnailUrl,
      description,
      duration,
      streamUid,
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
    const { title, videoUrl, thumbnailUrl, description, duration, streamUid, status } = req.body;

    const video = await Video.findById(req.params.id);

    if (video) {
      video.title = title || video.title;
      video.videoUrl = streamUid ? `https://iframe.videodelivery.net/${streamUid}` : (videoUrl || video.videoUrl);
      video.thumbnailUrl = streamUid ? `https://videodelivery.net/${streamUid}/thumbnails/thumbnail.jpg` : (thumbnailUrl || video.thumbnailUrl);
      video.description = description ?? video.description;
      video.duration = duration ?? video.duration;
      video.streamUid = streamUid || video.streamUid;
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
