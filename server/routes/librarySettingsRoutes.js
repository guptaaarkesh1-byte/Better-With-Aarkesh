import express from 'express';
import Settings from '../models/Settings.js';

const router = express.Router();

export const DEFAULT_LIBRARY_SECTIONS = {
  hero: {
    eyebrowText: 'THE LIBRARY',
    headingLine1: 'What are you trying',
    headingLine2: 'to understand?',
    description: 'Articles, videos and reflective tools for the parts of life that are difficult to see clearly while you are living through them.',
    searchPlaceholder: "Describe what you're facing...",
    bottomPromptText: 'OR EXPLORE WHAT OTHERS OFTEN CARRY',
    bgImageUrl: '',
    overlayOpacity: 40,
  }
};

// @desc    Get All Library Sections
// @route   GET /api/library-settings
// @access  Public
router.get('/', async (req, res) => {
  try {
    const doc = await Settings.findOne({ key: 'library_all_sections_settings' });
    if (!doc) {
      return res.json(DEFAULT_LIBRARY_SECTIONS);
    }
    const result = {
      hero: { ...DEFAULT_LIBRARY_SECTIONS.hero, ...(doc.value?.hero || {}) }
    };
    res.json(result);
  } catch (err) {
    console.error('Error fetching library settings:', err);
    res.status(500).json({ message: 'Failed to fetch library settings' });
  }
});

// @desc    Get Specific Section Settings
// @route   GET /api/library-settings/:section
// @access  Public
router.get('/:section', async (req, res) => {
  try {
    const { section } = req.params;
    const defaultSectionData = DEFAULT_LIBRARY_SECTIONS[section] || {};
    const doc = await Settings.findOne({ key: 'library_all_sections_settings' });
    
    if (!doc || !doc.value || !doc.value[section]) {
      return res.json(defaultSectionData);
    }
    
    res.json({ ...defaultSectionData, ...doc.value[section] });
  } catch (err) {
    console.error(`Error fetching library section ${req.params.section}:`, err);
    res.status(500).json({ message: 'Failed to fetch library section settings' });
  }
});

// @desc    Update Specific Section Settings
// @route   PUT /api/library-settings/:section
// @access  Admin
router.put('/:section', async (req, res) => {
  try {
    const { section } = req.params;
    const sectionData = req.body;

    let doc = await Settings.findOne({ key: 'library_all_sections_settings' });
    let allSections = doc && doc.value ? JSON.parse(JSON.stringify(doc.value)) : { ...DEFAULT_LIBRARY_SECTIONS };

    allSections[section] = {
      ...(DEFAULT_LIBRARY_SECTIONS[section] || {}),
      ...(allSections[section] || {}),
      ...sectionData
    };

    const updated = await Settings.findOneAndUpdate(
      { key: 'library_all_sections_settings' },
      { $set: { value: allSections } },
      { new: true, upsert: true, setDefaultsOnInsert: true }
    );

    res.json({ message: `${section} updated successfully`, data: updated.value[section] });
  } catch (err) {
    console.error(`Error updating library section ${req.params.section}:`, err);
    res.status(500).json({ message: 'Failed to update library section settings' });
  }
});

export default router;
