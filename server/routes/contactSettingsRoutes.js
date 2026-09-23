import express from 'express';
import Settings from '../models/Settings.js';
import { protect, admin } from '../middleware/authMiddleware.js';

const router = express.Router();

export const DEFAULT_CONTACT_SETTINGS = {
  backButtonText: 'Back',
  headerBadge: 'Get In Touch',
  headerTitle: 'How can we support you?',
  headerSubtitle: 'Reach out to our dedicated desks for 1-on-1 coaching, sessions, and learning assistance.',
  
  cards: [
    {
      id: 'card-1',
      icon: 'email',
      title: 'Email Support',
      subtitle: 'We reply within 24 hours',
      items: [
        {
          id: 'item-1',
          label: '',
          value: 'coaching@betterwithaarkesh.com',
          linkUrl: 'mailto:coaching@betterwithaarkesh.com'
        }
      ]
    },
    {
      id: 'card-2',
      icon: 'phone',
      title: 'Phone Support',
      subtitle: '11am - 8pm (Mon-Sat)',
      items: [
        {
          id: 'item-2',
          label: '',
          value: '1234567890'
        }
      ]
    }
  ],

  // Address & Location Details
  addressTitle: 'Registered Office & Address',
  addressSubtitle: 'Official business details and communication location',
  operatingLocationLabel: 'Operating Location',
  operatingLocation: 'Mumbai, Maharashtra, India',
  operatingHoursLabel: 'Working Hours',
  operatingHours: 'Monday – Saturday, 11:00 AM – 8:00 PM IST',
  addressCtaText: 'Book 1:1 Coaching',
  addressCtaUrl: '/book',
};

// Helper to normalize settings
const normalizeSettings = (data) => {
  const merged = { ...DEFAULT_CONTACT_SETTINGS, ...data };
  if (!Array.isArray(merged.cards) || merged.cards.length === 0) {
    // Convert from legacy if cards array is missing
    merged.cards = DEFAULT_CONTACT_SETTINGS.cards;
  } else {
    // Ensure every card has an items array
    merged.cards = merged.cards.map((c, idx) => {
      let items = c.items;
      if (!Array.isArray(items) || items.length === 0) {
        if (c.highlight) {
          items = [
            {
              id: `item-${idx}-1`,
              label: '',
              value: c.highlight,
              linkUrl: c.linkUrl || (c.icon === 'email' ? `mailto:${c.highlight}` : c.icon === 'phone' ? `tel:${c.highlight}` : '/book')
            }
          ];
        } else {
          items = [];
        }
      }
      return {
        ...c,
        id: c.id || `card-${idx + 1}`,
        items
      };
    });
  }
  return merged;
};

// @desc    Get Contact Page settings
// @route   GET /api/contact-settings
// @access  Public
router.get('/', async (req, res) => {
  try {
    const doc = await Settings.findOne({ key: 'contact_page_settings' });
    if (!doc || !doc.value) {
      return res.json(DEFAULT_CONTACT_SETTINGS);
    }
    res.json(normalizeSettings(doc.value));
  } catch (error) {
    console.error('Error fetching contact settings:', error);
    res.json(DEFAULT_CONTACT_SETTINGS);
  }
});

// @desc    Update Contact Page settings
// @route   PUT /api/contact-settings
// @access  Private/Admin
router.put('/', protect, admin, async (req, res) => {
  try {
    const incomingData = req.body;
    const mergedValue = { ...DEFAULT_CONTACT_SETTINGS, ...incomingData };

    const updated = await Settings.findOneAndUpdate(
      { key: 'contact_page_settings' },
      { value: mergedValue },
      { upsert: true, new: true }
    );

    res.json(normalizeSettings(updated?.value || mergedValue));
  } catch (error) {
    console.error('Error updating contact settings:', error);
    res.status(500).json({ message: 'Failed to update contact page settings' });
  }
});

export default router;
