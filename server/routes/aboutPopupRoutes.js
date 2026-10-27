import express from 'express';
import dotenv from 'dotenv';
import Mux from '@mux/mux-node';
import Settings from '../models/Settings.js';
import { protect, admin } from '../middleware/authMiddleware.js';

dotenv.config();

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

  return new Mux({ tokenId, tokenSecret });
};

export const DEFAULT_ABOUT_POPUP = {
  popup: {
    enabled: true,
    title: 'ABOUT AARKESH',
    readMoreLabel: 'Read More',
    pageSize: 12,
    showYoutube: true,
    showInstagram: true,
    introVideo: {
      muxAssetId: '',
      muxUploadId: '',
      playbackId: '',
      status: 'ready',
      durationSeconds: 120,
      label: 'Meet Aarkesh · 2 min',
      poster: {
        url: 'https://res.cloudinary.com/vcotf5ps/image/upload/v1791627191/better_with_aarkesh/hero/hero_portrait_aarkesh.png',
        publicId: ''
      },
      useMuxThumbnail: false
    },
    categories: ['Mindset', 'Aviation', 'Relationships', 'Habits', 'Career'],
    status: 'published',
    updatedAt: new Date()
  },
  media: [
    {
      id: 'yt_1',
      type: 'youtube',
      externalId: 'DEMO_YT_1',
      title: 'Mastering Calm Under Extreme Pressure: The Cockpit Framework',
      category: 'Mindset',
      thumbnail: { url: '', publicId: '' },
      featured: true,
      published: true,
      sortOrder: 0
    },
    {
      id: 'yt_2',
      type: 'youtube',
      externalId: 'DEMO_YT_2',
      title: 'How Airline Pilots Make Life-or-Death Decisions in Seconds',
      category: 'Aviation',
      thumbnail: { url: '', publicId: '' },
      featured: false,
      published: true,
      sortOrder: 1
    },
    {
      id: 'yt_3',
      type: 'youtube',
      externalId: 'DEMO_YT_3',
      title: 'Deep Listening: What Most Coaches and Leaders Miss',
      category: 'Relationships',
      thumbnail: { url: '', publicId: '' },
      featured: false,
      published: true,
      sortOrder: 2
    },
    {
      id: 'yt_4',
      type: 'youtube',
      externalId: 'DEMO_YT_4',
      title: 'The Daily Disciplines That Prevent Executive Burnout',
      category: 'Habits',
      thumbnail: { url: '', publicId: '' },
      featured: false,
      published: true,
      sortOrder: 3
    },
    {
      id: 'ig_1',
      type: 'instagram',
      externalId: 'DMLGaOgTszV',
      title: 'Some people don’t leave your life with a bang (Outgrowing connections)',
      category: 'Relationships',
      thumbnail: { url: '', publicId: '' },
      featured: false,
      published: true,
      sortOrder: 0
    },
    {
      id: 'ig_2',
      type: 'instagram',
      externalId: 'DEMO_IG_1',
      title: 'Why calmness is a trained skill, not an innate talent',
      category: 'Mindset',
      thumbnail: { url: '', publicId: '' },
      featured: false,
      published: true,
      sortOrder: 1
    },
    {
      id: 'ig_3',
      type: 'instagram',
      externalId: 'DEMO_IG_2',
      title: 'Cockpit clarity: What to do when pressure hits',
      category: 'Aviation',
      thumbnail: { url: '', publicId: '' },
      featured: false,
      published: true,
      sortOrder: 2
    },
    {
      id: 'ig_4',
      type: 'instagram',
      externalId: 'DEMO_IG_3',
      title: 'How to stop reacting and start choosing consciously',
      category: 'Mindset',
      thumbnail: { url: '', publicId: '' },
      featured: false,
      published: true,
      sortOrder: 3
    },
    {
      id: 'ig_5',
      type: 'instagram',
      externalId: 'DEMO_IG_4',
      title: 'Real communication without masks or pretense',
      category: 'Relationships',
      thumbnail: { url: '', publicId: '' },
      featured: false,
      published: true,
      sortOrder: 4
    },
    {
      id: 'ig_6',
      type: 'instagram',
      externalId: 'DEMO_IG_5',
      title: 'The morning checklist that sets high-performance tone',
      category: 'Habits',
      thumbnail: { url: '', publicId: '' },
      featured: false,
      published: true,
      sortOrder: 5
    },
    {
      id: 'ig_7',
      type: 'instagram',
      externalId: 'DEMO_IG_6',
      title: 'Navigating career crossroads when stakes feel high',
      category: 'Career',
      thumbnail: { url: '', publicId: '' },
      featured: false,
      published: true,
      sortOrder: 6
    },
    {
      id: 'ig_8',
      type: 'instagram',
      externalId: 'DEMO_IG_7',
      title: 'When runway lights appear: Taking the final decisive step',
      category: 'Aviation',
      thumbnail: { url: '', publicId: '' },
      featured: false,
      published: true,
      sortOrder: 7
    }
  ],
  story: {
    kicker: 'My story',
    title: 'The Journey Behind the Mission',
    lead: 'From the skies to the soul, here is the story behind why I do what I do.',
    hero: { url: '', publicId: '', caption: '' },
    sections: [
      {
        id: 'sec_1',
        heading: 'The Sky Taught Me Calm',
        text: 'I still remember the first time I took off alone. The runway lights stretched ahead, the city shrank behind me, and for a few seconds everything went quiet. That silence taught me something I had never learned in a classroom: staying calm is not a talent some people are born with. It is a practice.\n\nIn the cockpit, decisions are made in seconds. Yet every one of them rests on months of training, a checklist you trust and a team you rely on. Calm is simply what preparation looks like from the outside. I carried that idea with me long after I stepped out of the aircraft, and it slowly became the foundation of everything I believe about growth.',
        quote: '',
        layout: 'right',
        image: {
          url: 'https://res.cloudinary.com/vcotf5ps/image/upload/v1791289785/better_with_aarkesh/server/uploads/pilot_4154.webp',
          publicId: '',
          caption: ''
        }
      },
      {
        id: 'sec_2',
        heading: 'Pressure Is Not the Enemy',
        text: 'Years of flying in high-pressure environments showed me a hard truth. Pressure never disappears. Weather changes, schedules collapse, and tired minds make small mistakes. The pilots I admired most were not the ones who avoided stress. They were the ones who understood it.\n\nThey named what they felt, slowed their breathing, followed their process and made the next good decision. Nothing dramatic, nothing heroic. Just a steady habit repeated until it became second nature. When I started noticing the same patterns in everyday life, in careers, families and friendships, I realised that these skills were not meant only for pilots. Anyone can learn them. That realisation changed how I work with people, and it is why I never promise a life without pressure, only a calmer way of meeting it.',
        quote: 'Calm is a skill. You can train it.',
        layout: 'left',
        image: {
          url: 'https://res.cloudinary.com/vcotf5ps/image/upload/v1791289681/better_with_aarkesh/client/src/assets/Page3/think-clearly_9629.png',
          publicId: '',
          caption: ''
        }
      },
      {
        id: 'sec_3',
        heading: 'From the Cockpit to Coaching',
        text: 'Becoming an ICF-certified coach gave my experience a proper shape. I trained in evidence-based methods, learned to listen without judging and to ask the questions that help people hear their own answers. The science mattered to me, but so did something simpler: people do not change because they are told what to do. They change when they feel understood.\n\nSo my sessions are built around three things: clarity about where you are, honesty about where you want to go, and small, realistic steps in between. No jargon. No grand promises. Just a clear process that you can follow on your busiest and most uncertain days.',
        quote: '',
        layout: 'none',
        image: { url: '', publicId: '', caption: '' }
      },
      {
        id: 'sec_4',
        heading: 'Walking Beside You',
        text: 'My favourite sentence in coaching is also my promise: I walk beside you, not ahead of you. I am not a guru standing on a mountain top, and I am not here to hand you a perfect plan. You are the expert on your own life. My role is to hold the space, reflect what I hear, challenge you kindly when you need it and celebrate every step forward, even the small and messy ones.\n\nSome of my clients come to me for career decisions. Others arrive carrying stress, doubt or a quiet feeling that life has become too heavy. Whatever brings you here, you will not be rushed, and you will not be judged. I believe the best answers are already inside you; they are just waiting for the right questions and a little patience.',
        quote: 'I walk beside you, not ahead of you.',
        layout: 'right',
        image: {
          url: 'https://res.cloudinary.com/vcotf5ps/image/upload/v1791289659/better_with_aarkesh/client/src/assets/coaching-process_8570.png',
          publicId: '',
          caption: ''
        }
      },
      {
        id: 'sec_5',
        heading: 'The Human Behind the Roles',
        text: 'Behind the uniform and the certificates, I am simply a human being. I have doubted myself, felt exhausted and stood at crossroads wondering which way to go. I still love watching the sun go down over the sea, and I still believe that small dreams deserve as much respect as big ones.\n\nThat is why I do this work. Someone once walked beside me when I needed it most, and it changed everything. If you have read this far, you have already taken a first step. Whenever you are ready, let us have a real conversation and take the next one together.',
        quote: '',
        layout: 'left',
        image: {
          url: 'https://res.cloudinary.com/vcotf5ps/image/upload/v1791289707/better_with_aarkesh/client/src/assets/Page8/human_6915.webp',
          publicId: '',
          caption: ''
        }
      }
    ]
  }
};

// In-memory cache for public read-only endpoint
let publicCache = null;
let cacheTime = 0;
const CACHE_TTL_MS = 60 * 1000; // 1 minute

export const syncMuxIntroVideoStatus = async (introVideo) => {
  if (!introVideo) return introVideo;
  if (introVideo.status === 'processing' || (introVideo.muxUploadId && !introVideo.playbackId)) {
    try {
      const mux = await getMuxClient();
      let asset = null;
      if (introVideo.muxUploadId) {
        try {
          const upload = await mux.video.uploads.retrieve(introVideo.muxUploadId);
          if (upload && upload.asset_id) {
            asset = await mux.video.assets.retrieve(upload.asset_id);
          }
        } catch {}
      }
      if (!asset && introVideo.muxAssetId) {
        try {
          asset = await mux.video.assets.retrieve(introVideo.muxAssetId);
        } catch {}
      }
      if (asset) {
        const playbackId = asset.playback_ids?.[0]?.id || '';
        const durationSeconds = asset.duration ? Math.round(asset.duration) : introVideo.durationSeconds || 120;
        if (asset.status === 'ready' && playbackId) {
          introVideo.status = 'ready';
          introVideo.playbackId = playbackId;
          introVideo.muxAssetId = asset.id;
          introVideo.durationSeconds = durationSeconds;

          await Settings.updateOne(
            { key: 'about_popup_settings' },
            {
              $set: {
                'value.popup.introVideo.status': 'ready',
                'value.popup.introVideo.playbackId': playbackId,
                'value.popup.introVideo.muxAssetId': asset.id,
                'value.popup.introVideo.durationSeconds': durationSeconds
              }
            }
          );
          invalidateAboutPopupCache();
        } else if (asset.status === 'errored') {
          introVideo.status = 'errored';
          await Settings.updateOne(
            { key: 'about_popup_settings' },
            { $set: { 'value.popup.introVideo.status': 'errored' } }
          );
          invalidateAboutPopupCache();
        }
      }
    } catch (e) {
      console.warn('Could not auto-sync Mux intro video status:', e?.message);
    }
  }
  return introVideo;
};

export const getStoredAboutPopup = async () => {
  const doc = await Settings.findOne({ key: 'about_popup_settings' });
  if (!doc || !doc.value) {
    return JSON.parse(JSON.stringify(DEFAULT_ABOUT_POPUP));
  }
  const popupObj = { ...DEFAULT_ABOUT_POPUP.popup, ...(doc.value.popup || {}) };
  if (popupObj.introVideo) {
    await syncMuxIntroVideoStatus(popupObj.introVideo);
  }
  return {
    popup: popupObj,
    media: Array.isArray(doc.value.media) ? doc.value.media : DEFAULT_ABOUT_POPUP.media,
    story: {
      ...DEFAULT_ABOUT_POPUP.story,
      ...(doc.value.story || {}),
      sections: Array.isArray(doc.value.story?.sections) ? doc.value.story.sections : DEFAULT_ABOUT_POPUP.story.sections
    }
  };
};

export const invalidateAboutPopupCache = () => {
  publicCache = null;
  cacheTime = 0;
};

// @desc    Get Public About Popup Data (Read-only, published items only, cached)
// @route   GET /api/about-popup
// @access  Public
router.get('/', async (req, res) => {
  try {
    const now = Date.now();
    if (publicCache && (now - cacheTime < CACHE_TTL_MS)) {
      return res.json(publicCache);
    }

    const fullData = await getStoredAboutPopup();
    
    // Filter only published media items, sort by sortOrder
    const publishedMedia = (fullData.media || [])
      .filter((m) => m && m.published !== false)
      .sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0));

    const responsePayload = {
      popup: fullData.popup,
      media: publishedMedia,
      story: fullData.story
    };

    publicCache = responsePayload;
    cacheTime = now;

    res.json(responsePayload);
  } catch (err) {
    console.error('Error in GET /api/about-popup:', err);
    res.status(500).json({ message: 'Failed to fetch about popup data' });
  }
});

// @desc    Get Admin About Popup Data (Includes drafts, full media list)
// @route   GET /api/about-popup/admin
// @access  Private/Admin
router.get('/admin', protect, admin, async (req, res) => {
  try {
    const fullData = await getStoredAboutPopup();
    res.json(fullData);
  } catch (err) {
    console.error('Error in GET /api/about-popup/admin:', err);
    res.status(500).json({ message: 'Failed to fetch admin about popup data' });
  }
});

// @desc    Update About Popup Data
// @route   PUT /api/about-popup/admin
// @access  Private/Admin
router.put('/admin', protect, admin, async (req, res) => {
  try {
    const { popup, media, story } = req.body || {};

    if (!popup || typeof popup !== 'object') {
      return res.status(400).json({ message: 'Invalid popup settings payload' });
    }

    // Server-side validation
    const cleanPopup = {
      enabled: Boolean(popup.enabled !== false),
      title: String(popup.title || 'ABOUT AARKESH').trim().slice(0, 80),
      readMoreLabel: String(popup.readMoreLabel || 'Read More').trim().slice(0, 40),
      pageSize: Math.max(1, Math.min(60, Number(popup.pageSize) || 12)),
      showYoutube: Boolean(popup.showYoutube !== false),
      showInstagram: Boolean(popup.showInstagram !== false),
      introVideo: {
        muxAssetId: String(popup.introVideo?.muxAssetId || '').trim(),
        muxUploadId: String(popup.introVideo?.muxUploadId || '').trim(),
        playbackId: String(popup.introVideo?.playbackId || '').trim(),
        status: String(popup.introVideo?.status || 'ready').trim(),
        durationSeconds: Number(popup.introVideo?.durationSeconds) || 120,
        label: String(popup.introVideo?.label || 'Meet Aarkesh · 2 min').trim().slice(0, 100),
        poster: {
          url: String(popup.introVideo?.poster?.url || '').trim(),
          publicId: String(popup.introVideo?.poster?.publicId || '').trim()
        },
        useMuxThumbnail: Boolean(popup.introVideo?.useMuxThumbnail)
      },
      categories: Array.isArray(popup.categories) && popup.categories.length > 0
        ? popup.categories.map((c) => String(c).trim().slice(0, 40)).filter(Boolean)
        : DEFAULT_ABOUT_POPUP.popup.categories,
      status: 'published',
      updatedAt: new Date()
    };

    const cleanMedia = Array.isArray(media)
      ? media.map((item, idx) => ({
          id: item.id || `media_${Date.now()}_${idx}`,
          type: item.type === 'instagram' ? 'instagram' : 'youtube',
          externalId: String(item.externalId || '').trim(),
          title: String(item.title || '').trim().slice(0, 200),
          category: String(item.category || cleanPopup.categories[0] || 'Mindset').trim(),
          thumbnail: {
            url: String(item.thumbnail?.url || '').trim(),
            publicId: String(item.thumbnail?.publicId || '').trim()
          },
          featured: Boolean(item.featured),
          published: Boolean(item.published !== false),
          sortOrder: typeof item.sortOrder === 'number' ? item.sortOrder : idx
        }))
      : DEFAULT_ABOUT_POPUP.media;

    const cleanStory = {
      kicker: String(story?.kicker || 'My story').trim().slice(0, 60),
      title: String(story?.title || 'The Journey Behind the Mission').trim().slice(0, 150),
      lead: String(story?.lead || '').trim().slice(0, 300),
      hero: {
        url: String(story?.hero?.url || '').trim(),
        publicId: String(story?.hero?.publicId || '').trim(),
        caption: String(story?.hero?.caption || '').trim().slice(0, 200)
      },
      sections: Array.isArray(story?.sections)
        ? story.sections.map((sec, idx) => ({
            id: sec.id || `sec_${idx + 1}`,
            heading: String(sec.heading || '').trim().slice(0, 150),
            text: String(sec.text || '').trim().slice(0, 5000),
            quote: String(sec.quote || '').trim().slice(0, 300),
            layout: ['right', 'left', 'full', 'none'].includes(sec.layout) ? sec.layout : 'right',
            image: {
              url: String(sec.image?.url || '').trim(),
              publicId: String(sec.image?.publicId || '').trim(),
              caption: String(sec.image?.caption || '').trim().slice(0, 200)
            }
          }))
        : DEFAULT_ABOUT_POPUP.story.sections
    };

    const updated = await Settings.findOneAndUpdate(
      { key: 'about_popup_settings' },
      {
        $set: {
          value: {
            popup: cleanPopup,
            media: cleanMedia,
            story: cleanStory
          }
        }
      },
      { new: true, upsert: true, setDefaultsOnInsert: true }
    );

    invalidateAboutPopupCache();

    res.json({
      message: 'About Aarkesh popup settings saved successfully',
      data: updated.value
    });
  } catch (err) {
    console.error('Error saving about popup data:', err);
    res.status(500).json({ message: 'Failed to save about popup settings' });
  }
});

// @desc    Generate Mux direct upload URL for 2-minute intro video
// @route   POST /api/about-popup/mux-upload
// @access  Private/Admin
router.post('/mux-upload', protect, admin, async (req, res) => {
  try {
    const mux = await getMuxClient();
    const upload = await mux.video.uploads.create({
      new_asset_settings: {
        playback_policy: ['public'],
        video_quality: 'basic'
      },
      cors_origin: '*'
    });

    res.json({
      uploadUrl: upload.url,
      uploadId: upload.id
    });
  } catch (error) {
    console.error('Error generating Mux upload for about popup:', error);
    res.status(500).json({
      message: error.message || 'Failed to initialize Mux upload. Check Mux API credentials.'
    });
  }
});

// @desc    Check Mux asset/upload status
// @route   GET /api/about-popup/mux-status/:identifier
// @access  Private/Admin
router.get('/mux-status/:identifier', protect, admin, async (req, res) => {
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
    } catch {
      try {
        asset = await mux.video.assets.retrieve(identifier);
      } catch {}
    }

    if (!asset && upload) {
      return res.json({
        status: upload.status,
        uploadStatus: upload.status,
        assetId: upload.asset_id || null,
        playbackId: null
      });
    }

    if (asset) {
      const playbackId = asset.playback_ids?.[0]?.id || null;
      const durationSeconds = asset.duration ? Math.round(asset.duration) : 120;
      if (asset.status === 'ready' && playbackId) {
        await Settings.updateOne(
          { key: 'about_popup_settings' },
          {
            $set: {
              'value.popup.introVideo.status': 'ready',
              'value.popup.introVideo.playbackId': playbackId,
              'value.popup.introVideo.muxAssetId': asset.id,
              'value.popup.introVideo.durationSeconds': durationSeconds
            }
          }
        );
        invalidateAboutPopupCache();
      }
      return res.json({
        status: asset.status,
        assetId: asset.id,
        playbackId,
        durationSeconds,
        thumbnailUrl: playbackId ? `https://image.mux.com/${playbackId}/thumbnail.jpg` : ''
      });
    }

    res.json({ status: 'unknown' });
  } catch (error) {
    console.error('Error checking Mux asset status for about popup:', error);
    res.status(500).json({ message: error.message || 'Error checking Mux status' });
  }
});

// @desc    Delete Mux asset
// @route   DELETE /api/about-popup/mux-asset/:assetId
// @access  Private/Admin
router.delete('/mux-asset/:assetId', protect, admin, async (req, res) => {
  try {
    const { assetId } = req.params;
    if (!assetId) {
      return res.status(400).json({ message: 'Missing assetId' });
    }
    const mux = await getMuxClient();
    try {
      await mux.video.assets.delete(assetId);
    } catch (muxErr) {
      console.warn('Mux asset delete warning:', muxErr.message);
    }
    res.json({ message: 'Mux asset deleted successfully' });
  } catch (error) {
    console.error('Error deleting Mux asset:', error);
    res.status(500).json({ message: error.message || 'Failed to delete Mux asset' });
  }
});

export default router;
