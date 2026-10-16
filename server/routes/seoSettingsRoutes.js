import express from 'express';
import Settings from '../models/Settings.js';

const router = express.Router();

export const DEFAULT_SEO_SETTINGS = {
  siteName: 'Better With Aarkesh',
  canonicalUrl: 'https://aarkeshgupta.com',
  metaTitle: 'Better With Aarkesh - Life & Executive Coaching | Aarkesh Gupta',
  metaDescription: 'Transform your mindset, communication, and executive presence with Aarkesh Gupta. Explore 1-on-1 life coaching, executive mentorship, and masterclasses.',
  favicon: '/favicon.svg',
  gaMeasurementId: '',
  googleSiteVerification: 'jN65pbrKDcPuJhySbFlitGKVeEBiFknAqNQMMQS28UE',
  sitelinks: {
    sitelink1: {
      badge: 'Sitelink 1: Book 1-on-1 Coaching',
      title: 'Book a Session',
      description: 'Schedule a private 1-on-1 life and clarity coaching session with Aarkesh Gupta.',
      url: '/book'
    },
    sitelink2: {
      badge: 'Sitelink 2: Masterclass / Course',
      title: 'The Better Man Masterclass',
      description: 'Access the flagship masterclass on calm authority, communication, and emotional clarity.',
      url: '/course'
    },
    sitelink3: {
      badge: 'Sitelink 3: Principles & Library',
      title: 'Principles & Articles',
      description: 'Explore transformative life principles, reflections, and mindset frameworks.',
      url: '/library'
    },
    sitelink4: {
      badge: 'Sitelink 4: About Aarkesh',
      title: 'About Aarkesh Gupta',
      description: 'Learn about Aarkesh Gupta, personal coaching philosophy, and transformation journey.',
      url: '/about-us'
    }
  }
};

// @desc    Get SEO Settings (Public)
// @route   GET /api/seo-settings
router.get('/', async (req, res) => {
  try {
    const doc = await Settings.findOne({ key: 'seo_settings' });
    if (!doc || !doc.value) {
      return res.json({ ...DEFAULT_SEO_SETTINGS });
    }
    return res.json({
      ...DEFAULT_SEO_SETTINGS,
      ...doc.value,
      sitelinks: {
        ...DEFAULT_SEO_SETTINGS.sitelinks,
        ...(doc.value.sitelinks || {})
      }
    });
  } catch (error) {
    console.error('Error fetching SEO settings:', error);
    res.status(500).json({ message: 'Server error fetching SEO settings', fallback: DEFAULT_SEO_SETTINGS });
  }
});

// @desc    Update SEO Settings (Admin)
// @route   POST /api/seo-settings
router.post('/', async (req, res) => {
  try {
    const incoming = req.body || {};

    const cleanSettings = {
      siteName: (incoming.siteName ?? DEFAULT_SEO_SETTINGS.siteName).trim(),
      canonicalUrl: (incoming.canonicalUrl ?? DEFAULT_SEO_SETTINGS.canonicalUrl).trim(),
      metaTitle: (incoming.metaTitle ?? DEFAULT_SEO_SETTINGS.metaTitle).trim(),
      metaDescription: (incoming.metaDescription ?? DEFAULT_SEO_SETTINGS.metaDescription).trim(),
      favicon: (incoming.favicon ?? DEFAULT_SEO_SETTINGS.favicon).trim(),
      gaMeasurementId: (incoming.gaMeasurementId ?? '').trim(),
      googleSiteVerification: (incoming.googleSiteVerification ?? DEFAULT_SEO_SETTINGS.googleSiteVerification).trim(),
      sitelinks: {
        sitelink1: {
          badge: incoming.sitelinks?.sitelink1?.badge || DEFAULT_SEO_SETTINGS.sitelinks.sitelink1.badge,
          title: (incoming.sitelinks?.sitelink1?.title || DEFAULT_SEO_SETTINGS.sitelinks.sitelink1.title).trim(),
          description: (incoming.sitelinks?.sitelink1?.description || DEFAULT_SEO_SETTINGS.sitelinks.sitelink1.description).trim(),
          url: (incoming.sitelinks?.sitelink1?.url || DEFAULT_SEO_SETTINGS.sitelinks.sitelink1.url).trim()
        },
        sitelink2: {
          badge: incoming.sitelinks?.sitelink2?.badge || DEFAULT_SEO_SETTINGS.sitelinks.sitelink2.badge,
          title: (incoming.sitelinks?.sitelink2?.title || DEFAULT_SEO_SETTINGS.sitelinks.sitelink2.title).trim(),
          description: (incoming.sitelinks?.sitelink2?.description || DEFAULT_SEO_SETTINGS.sitelinks.sitelink2.description).trim(),
          url: (incoming.sitelinks?.sitelink2?.url || DEFAULT_SEO_SETTINGS.sitelinks.sitelink2.url).trim()
        },
        sitelink3: {
          badge: incoming.sitelinks?.sitelink3?.badge || DEFAULT_SEO_SETTINGS.sitelinks.sitelink3.badge,
          title: (incoming.sitelinks?.sitelink3?.title || DEFAULT_SEO_SETTINGS.sitelinks.sitelink3.title).trim(),
          description: (incoming.sitelinks?.sitelink3?.description || DEFAULT_SEO_SETTINGS.sitelinks.sitelink3.description).trim(),
          url: (incoming.sitelinks?.sitelink3?.url || DEFAULT_SEO_SETTINGS.sitelinks.sitelink3.url).trim()
        },
        sitelink4: {
          badge: incoming.sitelinks?.sitelink4?.badge || DEFAULT_SEO_SETTINGS.sitelinks.sitelink4.badge,
          title: (incoming.sitelinks?.sitelink4?.title || DEFAULT_SEO_SETTINGS.sitelinks.sitelink4.title).trim(),
          description: (incoming.sitelinks?.sitelink4?.description || DEFAULT_SEO_SETTINGS.sitelinks.sitelink4.description).trim(),
          url: (incoming.sitelinks?.sitelink4?.url || DEFAULT_SEO_SETTINGS.sitelinks.sitelink4.url).trim()
        }
      },
      updatedAt: new Date().toISOString()
    };

    const updatedDoc = await Settings.findOneAndUpdate(
      { key: 'seo_settings' },
      { value: cleanSettings },
      { new: true, upsert: true }
    );

    res.json({
      success: true,
      message: 'SEO settings updated successfully',
      settings: updatedDoc.value
    });
  } catch (error) {
    console.error('Error saving SEO settings:', error);
    res.status(500).json({ message: 'Server error saving SEO settings' });
  }
});

export default router;
