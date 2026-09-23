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
  },
  directory: {
    eyebrowText: 'IDEAS FOR A MORE THOUGHTFUL LIFE',
    headingText: 'Library',
    description: 'A collection of ideas about how we think, relate, choose and change.',
    searchPlaceholder: "Describe what you're facing...",
    quoteText: '“A quieter mind builds a braver, kinder life.”',
    quoteAuthor: '— Aarkesh Gupta',
    categories: [
      { id: 'relationships', key: 'RELATIONSHIPS', num: '01', title: 'Relationships', subtitle: 'On love, friendship and what it means to stay close.' },
      { id: 'self', key: 'SELF', num: '02', title: 'Self', subtitle: 'On identity, self-trust and becoming a steadier you.' },
      { id: 'change', key: 'CHANGE', num: '03', title: 'Change', subtitle: 'On letting go, starting over and becoming who you want to be.' },
      { id: 'decisions', key: 'DECISIONS', num: '04', title: 'Decisions', subtitle: 'On better thinking, trade-offs and choosing a life you mean.' },
      { id: 'difficult-people', key: 'DIFFICULT PEOPLE', num: '05', title: 'Difficult People', subtitle: 'On boundaries, perspective and dealing with the hard ones.' },
      { id: 'communication', key: 'COMMUNICATION', num: '06', title: 'Communication', subtitle: 'On saying what matters, listening and being understood.' }
    ]
  },
  formatExplore: {
    showSection: true,
    eyebrowText: 'EXPLORE BY FORMAT',
    headingLine1: 'Choose the form that',
    headingLine2: 'meets you where you are.',
    latestCardTitle: 'LATEST',
    latestCardSubtitle: 'NEW ARRIVALS',
    latestCardDesc: 'The most recent\narticles and videos.',
    readCardTitle: 'READ',
    readCardSubtitle: '12 ARTICLES',
    readCardDesc: 'Ideas to sit with at\nyour own pace.',
    watchCardTitle: 'WATCH',
    watchCardSubtitle: '10 VIDEOS',
    watchCardDesc: 'Perspectives spoken\nand explored.',
    showWatchCard: true
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
      hero: { ...DEFAULT_LIBRARY_SECTIONS.hero, ...(doc.value?.hero || {}) },
      directory: { ...DEFAULT_LIBRARY_SECTIONS.directory, ...(doc.value?.directory || {}) },
      formatExplore: { ...DEFAULT_LIBRARY_SECTIONS.formatExplore, ...(doc.value?.formatExplore || {}) }
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
