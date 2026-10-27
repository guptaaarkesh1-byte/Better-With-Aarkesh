import express from 'express';
import Mux from '@mux/mux-node';
import CourseLesson from '../models/CourseLesson.js';
import Settings from '../models/Settings.js';

const router = express.Router();

// @desc    Handle incoming Mux webhooks
// @route   POST /api/mux/webhook
router.post('/webhook', express.json({ type: 'application/json' }), async (req, res) => {
  try {
    const signature = req.headers['mux-signature'];
    const webhookSecret = process.env.MUX_WEBHOOK_SECRET;

    // Verify signature if secret is provided
    if (webhookSecret && signature) {
      try {
        const mux = new Mux();
        mux.webhooks.verifyHeader(JSON.stringify(req.body), signature, webhookSecret);
      } catch (err) {
        console.warn('Mux webhook signature verification failed:', err.message);
        return res.status(400).json({ message: 'Invalid webhook signature' });
      }
    }

    const { type, data } = req.body;
    console.log(`[MUX WEBHOOK] Received event: ${type}`);

    if (type === 'video.upload.asset_created') {
      const uploadId = data.id;
      const assetId = data.asset_id;

      if (uploadId && assetId) {
        await CourseLesson.updateMany(
          { muxUploadId: uploadId },
          { muxAssetId: assetId, videoStatus: 'processing' }
        );

        // Check About Aarkesh popup intro video
        try {
          const aboutDoc = await Settings.findOne({ key: 'about_popup_settings' });
          if (aboutDoc?.value?.popup?.introVideo?.muxUploadId === uploadId) {
            aboutDoc.value.popup.introVideo.muxAssetId = assetId;
            aboutDoc.value.popup.introVideo.status = 'processing';
            await Settings.updateOne({ key: 'about_popup_settings' }, { $set: { value: aboutDoc.value } });
          }
        } catch (aboutErr) {
          console.warn('Error syncing about popup upload asset:', aboutErr.message);
        }
      }
    }

    if (type === 'video.asset.ready') {
      const assetId = data.id;
      const playbackId = data.playback_ids?.[0]?.id || null;
      const duration = data.duration || 0;
      const resolution = data.max_stored_resolution ? `${data.max_stored_resolution}` : '';
      const aspectRatio = data.aspect_ratio || '';

      let durationStr = '00:00';
      if (duration) {
        const totalSeconds = Math.floor(duration);
        const mins = Math.floor(totalSeconds / 60);
        const secs = totalSeconds % 60;
        durationStr = `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
      }

      await CourseLesson.updateMany(
        { $or: [{ muxAssetId: assetId }, { muxUploadId: data.upload_id }] },
        {
          muxAssetId: assetId,
          ...(playbackId ? { muxPlaybackId: playbackId } : {}),
          muxDuration: duration,
          duration: durationStr,
          muxResolution: resolution,
          muxAspectRatio: aspectRatio,
          videoStatus: 'ready',
          videoReadyAt: new Date(),
          errorMessage: '',
        }
      );

      // Check About Aarkesh popup intro video
      try {
        const aboutDoc = await Settings.findOne({ key: 'about_popup_settings' });
        const intro = aboutDoc?.value?.popup?.introVideo;
        if (intro && (intro.muxAssetId === assetId || intro.muxUploadId === data.upload_id)) {
          intro.muxAssetId = assetId;
          if (playbackId) intro.playbackId = playbackId;
          intro.status = 'ready';
          intro.durationSeconds = duration ? Math.round(duration) : 120;
          await Settings.updateOne({ key: 'about_popup_settings' }, { $set: { value: aboutDoc.value } });
        }
      } catch (aboutErr) {
        console.warn('Error syncing about popup video ready:', aboutErr.message);
      }
    }

    if (type === 'video.asset.errored') {
      const assetId = data.id;
      const errorMsg = data.errors?.messages?.[0] || 'Mux video processing encountered an error.';

      await CourseLesson.updateMany(
        { muxAssetId: assetId },
        {
          videoStatus: 'errored',
          errorMessage: errorMsg,
        }
      );

      // Check About Aarkesh popup intro video
      try {
        const aboutDoc = await Settings.findOne({ key: 'about_popup_settings' });
        const intro = aboutDoc?.value?.popup?.introVideo;
        if (intro && intro.muxAssetId === assetId) {
          intro.status = 'errored';
          await Settings.updateOne({ key: 'about_popup_settings' }, { $set: { value: aboutDoc.value } });
        }
      } catch (aboutErr) {
        console.warn('Error syncing about popup video error:', aboutErr.message);
      }
    }

    if (type === 'video.asset.deleted') {
      const assetId = data.id;
      await CourseLesson.updateMany(
        { muxAssetId: assetId },
        {
          muxAssetId: null,
          muxPlaybackId: null,
          videoStatus: 'none',
        }
      );

      // Check About Aarkesh popup intro video
      try {
        const aboutDoc = await Settings.findOne({ key: 'about_popup_settings' });
        const intro = aboutDoc?.value?.popup?.introVideo;
        if (intro && intro.muxAssetId === assetId) {
          intro.muxAssetId = '';
          intro.playbackId = '';
          intro.status = 'none';
          await Settings.updateOne({ key: 'about_popup_settings' }, { $set: { value: aboutDoc.value } });
        }
      } catch (aboutErr) {
        console.warn('Error syncing about popup video deletion:', aboutErr.message);
      }
    }

    res.status(200).json({ received: true });
  } catch (error) {
    console.error('Error handling Mux webhook:', error);
    res.status(500).json({ message: 'Webhook processing error' });
  }
});

export default router;
