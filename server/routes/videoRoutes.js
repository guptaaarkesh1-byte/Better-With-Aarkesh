import express from 'express';
import dotenv from 'dotenv';
import Mux from '@mux/mux-node';
import { protect, admin } from '../middleware/authMiddleware.js';
import Video from '../models/Video.js';
import Settings from '../models/Settings.js';

const router = express.Router();

// Helper to get Mux client from env or Settings
const getMuxClient = async () => {
  dotenv.config();
  let tokenId = process.env.MUX_TOKEN_ID;
  let tokenSecret = process.env.MUX_TOKEN_SECRET;

  if (!tokenId || !tokenSecret) {
    const muxSettings = await Settings.findOne({ key: 'mux' });
    if (muxSettings?.value?.tokenId && muxSettings?.value?.tokenSecret) {
      tokenId = muxSettings.value.tokenId;
      tokenSecret = muxSettings.value.tokenSecret;
    }
  }

  if (!tokenId || !tokenSecret) {
    throw new Error('Mux API credentials not configured. Please set MUX_TOKEN_ID and MUX_TOKEN_SECRET in .env or Admin Settings.');
  }

  return new Mux({
    tokenId,
    tokenSecret,
  });
};

// @route   POST /api/videos/mux-upload-url
// @desc    Generate a secure Direct Upload URL from Mux
// @access  Private/Admin
router.post('/mux-upload-url', protect, admin, async (req, res) => {
  try {
    const mux = await getMuxClient();

    const upload = await mux.video.uploads.create({
      new_asset_settings: {
        playback_policy: ['public'],
        video_quality: 'basic',
      },
      cors_origin: '*',
    });

    res.json({
      uploadUrl: upload.url,
      uploadId: upload.id,
    });
  } catch (error) {
    console.error('Error creating Mux upload URL:', error);
    res.status(500).json({
      message: error.message || 'Failed to initialize Mux direct upload. Check Mux API credentials.',
    });
  }
});

// @route   GET /api/videos/mux-asset-status/:identifier
// @desc    Check and sync Mux Asset Status for videos
// @access  Private/Admin
router.get('/mux-asset-status/:identifier', protect, admin, async (req, res) => {
  try {
    const { identifier } = req.params;
    const mux = await getMuxClient();

    let asset = null;
    let upload = null;

    try {
      upload = await mux.video.uploads.retrieve(identifier);
      if (upload && upload.asset_id) {
        asset = await mux.video.assets.retrieve(upload.asset_id);
      }
    } catch (e) {
      try {
        asset = await mux.video.assets.retrieve(identifier);
      } catch (assetErr) {}
    }

    if (!asset && upload) {
      return res.json({
        status: upload.status,
        uploadStatus: upload.status,
        assetId: upload.asset_id || null,
        playbackId: null,
      });
    }

    if (asset) {
      const playbackId = asset.playback_ids?.[0]?.id || null;
      let durationStr = '8 MIN';
      if (asset.duration) {
        const mins = Math.max(1, Math.round(asset.duration / 60));
        durationStr = `${mins} MIN`;
      }

      return res.json({
        status: asset.status,
        assetId: asset.id,
        playbackId,
        duration: durationStr,
        thumbnailUrl: playbackId ? `https://image.mux.com/${playbackId}/thumbnail.jpg` : '',
      });
    }

    res.json({ status: 'unknown' });
  } catch (error) {
    console.error('Error checking Mux asset status:', error);
    res.status(500).json({ message: error.message || 'Error checking Mux status' });
  }
});

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
    const { title, videoUrl, thumbnailUrl, description, duration, streamUid, muxUploadId, muxAssetId, muxPlaybackId, status } = req.body;

    let finalVideoUrl = videoUrl;
    let finalThumbnailUrl = thumbnailUrl;

    if (streamUid) {
      finalVideoUrl = `https://iframe.videodelivery.net/${streamUid}`;
      if (!finalThumbnailUrl) finalThumbnailUrl = `https://videodelivery.net/${streamUid}/thumbnails/thumbnail.jpg`;
    } else if (muxPlaybackId) {
      finalVideoUrl = `https://stream.mux.com/${muxPlaybackId}.m3u8`;
      if (!finalThumbnailUrl) finalThumbnailUrl = `https://image.mux.com/${muxPlaybackId}/thumbnail.jpg`;
    }

    const video = new Video({
      title,
      videoUrl: finalVideoUrl,
      thumbnailUrl: finalThumbnailUrl,
      description: description || '',
      duration: duration || '8 MIN',
      streamUid: streamUid || '',
      muxUploadId: muxUploadId || '',
      muxAssetId: muxAssetId || '',
      muxPlaybackId: muxPlaybackId || '',
      status: status || 'Published',
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
    const { title, videoUrl, thumbnailUrl, description, duration, streamUid, muxUploadId, muxAssetId, muxPlaybackId, status } = req.body;

    const video = await Video.findById(req.params.id);

    if (video) {
      let finalVideoUrl = videoUrl !== undefined ? videoUrl : video.videoUrl;
      let finalThumbnailUrl = thumbnailUrl !== undefined ? thumbnailUrl : video.thumbnailUrl;

      if (streamUid) {
        finalVideoUrl = `https://iframe.videodelivery.net/${streamUid}`;
        if (!finalThumbnailUrl) finalThumbnailUrl = `https://videodelivery.net/${streamUid}/thumbnails/thumbnail.jpg`;
      } else if (muxPlaybackId) {
        finalVideoUrl = `https://stream.mux.com/${muxPlaybackId}.m3u8`;
        if (!finalThumbnailUrl) finalThumbnailUrl = `https://image.mux.com/${muxPlaybackId}/thumbnail.jpg`;
      }

      video.title = title || video.title;
      video.videoUrl = finalVideoUrl;
      video.thumbnailUrl = finalThumbnailUrl;
      video.description = description !== undefined ? description : video.description;
      video.duration = duration !== undefined ? duration : video.duration;
      video.streamUid = streamUid !== undefined ? streamUid : video.streamUid;
      video.muxUploadId = muxUploadId !== undefined ? muxUploadId : video.muxUploadId;
      video.muxAssetId = muxAssetId !== undefined ? muxAssetId : video.muxAssetId;
      video.muxPlaybackId = muxPlaybackId !== undefined ? muxPlaybackId : video.muxPlaybackId;
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
