import express from 'express';
import Settings from '../models/Settings.js';

const router = express.Router();

export const DEFAULT_COURSE_LANDING_SECTIONS = {
  masterTypography: {
    masterEyebrowSize: 14,
    masterHeadingSize: 54,
    masterDescriptionSize: 17,
    masterButtonSize: 14,
  },
  hero: {
    tag: 'Learn. Practise. Lead.',
    tagSize: 14,
    heading: 'THE *BETTER* MAN',
    headingSize: 56,
    headingPrefix: 'THE',
    headingSelected: 'BETTER',
    headingSuffix: 'MAN',
    subheading: 'Masterclasses in calm authority, magnetic communication and self-command, taught by Aarkesh.',
    subheadingSize: 18,
    proof1Bold: '3 private',
    proof1Text: '1-on-1 sessions with Aarkesh',
    proof2Bold: 'Lifetime',
    proof2Text: 'access, no recurring charges',
    proofSize: 14,
    primaryBtnText: 'Register Now',
    showPrimaryBtn: true,
    secondaryBtnText: 'Check Course',
    secondaryBtnLink: '/course/better-man',
    showSecondaryBtn: true,
    buttonSize: 14,
    navBtnText: 'Check Course',
    navBtnLink: '/course/better-man',
    showNavBtn: true,
    bgImageUrl: '',
    overlayOpacity: 40
  },
  moreCourses: {
    eyebrowText: 'MORE MASTERCLASSES',
    eyebrowSize: 14,
    heading: 'More Masterclasses',
    headingSize: 44,
    subheading: 'Each one is a standalone course with its own private sessions.',
    subheadingSize: 16,
    viewAllBtnText: 'View All Masterclasses',
    viewAllBtnLink: '/course/all',
    showViewAllBtn: true,
    buttonSize: 14
  },
  allCoursesPage: {
    tag: 'ALL PROGRAMS',
    tagSize: 14,
    heading: 'All Masterclasses & Programs',
    headingSize: 48,
    subheading: 'Each masterclass is an intensive, transformative curriculum paired with private 1-on-1 mentorship sessions with Aarkesh.',
    subheadingSize: 16,
    backBtnText: '← Back to overview',
    buttonSize: 14
  },
  faq: {
    tag: 'FAQS',
    tagSize: 14,
    heading: 'Frequently Asked Questions From Our Students',
    headingSize: 40,
    subheading: 'Clear answers about the masterclass, private mentorship, and enrollment.',
    subheadingSize: 16,
    questionSize: 17,
    answerSize: 15,
    items: [
      { question: 'How long do I have access to the course materials?', answer: 'You get lifetime access to all masterclass modules, downloadable resources, and all future updates with no recurring charges.' },
      { question: 'How do the 3 free coaching sessions work?', answer: 'Once enrolled, you can book your private 1-on-1 sessions directly with Aarkesh through your course profile dashboard.' },
      { question: 'What format is the course delivered in?', answer: 'High-definition on-demand video masterclasses with actionable workbooks, downloadable frameworks, and direct 1-on-1 coaching.' },
      { question: 'Is this course beginner-friendly?', answer: 'Absolutely. The framework starts from the fundamental psychology of presence and builds step-by-step toward advanced leadership and magnetism.' }
    ]
  },
  cta: {
    label: 'ENROLL TODAY',
    labelSize: 14,
    heading: 'Ready To Become The Man People Trust?',
    headingSize: 48,
    description: 'Master the psychology of calm authority, magnetic communication and effortless self-command with lifetime curriculum access and 3 private 1-on-1 coaching sessions.',
    descriptionSize: 17,
    badge1: '3 Private Coaching Calls',
    badge2: 'Lifetime Video Access',
    badgeSize: 13,
    primaryBtnText: 'Register Now',
    exploreBtnText: 'Explore Courses',
    buttonSize: 15,
    bgImageUrl: ''
  }
};

// Helper to deep merge and ensure empty strings use defaults
const mergeWithDefaults = (storedValue) => {
  const d = DEFAULT_COURSE_LANDING_SECTIONS;
  const mergeSection = (defSec, dataSec) => {
    const res = { ...defSec, ...(dataSec || {}) };
    for (const k of Object.keys(defSec)) {
      if (typeof defSec[k] === 'string' && k !== 'bgImageUrl') {
        if (res[k] === undefined || res[k] === null || (typeof res[k] === 'string' && res[k].trim() === '')) {
          res[k] = defSec[k];
        }
      } else if (typeof defSec[k] === 'boolean' || typeof defSec[k] === 'number') {
        if (res[k] === undefined || res[k] === null || isNaN(res[k])) {
          res[k] = defSec[k];
        }
      }
    }
    if (Array.isArray(defSec.items)) {
      if (dataSec && Array.isArray(dataSec.items) && dataSec.items.length > 0) {
        res.items = dataSec.items;
      } else if (!res.items || !Array.isArray(res.items) || res.items.length === 0) {
        res.items = defSec.items;
      }
    }
    return res;
  };

  return {
    masterTypography: mergeSection(d.masterTypography, storedValue?.masterTypography),
    hero: mergeSection(d.hero, storedValue?.hero),
    moreCourses: mergeSection(d.moreCourses, storedValue?.moreCourses),
    allCoursesPage: mergeSection(d.allCoursesPage, storedValue?.allCoursesPage),
    faq: mergeSection(d.faq, storedValue?.faq),
    cta: mergeSection(d.cta, storedValue?.cta),
  };
};

// @desc    Get All Course Landing Sections
// @route   GET /api/courses/landing-settings
// @access  Public
router.get('/', async (req, res) => {
  try {
    const doc = await Settings.findOne({ key: 'course_landing_sections_settings' });
    if (!doc || !doc.value) {
      return res.json(DEFAULT_COURSE_LANDING_SECTIONS);
    }
    res.json(mergeWithDefaults(doc.value));
  } catch (err) {
    console.error('Error fetching course landing settings:', err);
    res.status(500).json({ message: 'Failed to fetch course landing settings' });
  }
});

// @desc    Get Specific Section Settings
// @route   GET /api/courses/landing-settings/:section
// @access  Public
router.get('/:section', async (req, res) => {
  try {
    const { section } = req.params;
    const defaultSectionData = DEFAULT_COURSE_LANDING_SECTIONS[section] || {};
    const doc = await Settings.findOne({ key: 'course_landing_sections_settings' });

    if (!doc || !doc.value || !doc.value[section]) {
      return res.json(defaultSectionData);
    }

    res.json({ ...defaultSectionData, ...doc.value[section] });
  } catch (err) {
    console.error(`Error fetching section ${req.params.section}:`, err);
    res.status(500).json({ message: 'Failed to fetch section settings' });
  }
});

// @desc    Update Specific Section Settings
// @route   PUT /api/courses/landing-settings/:section
// @access  Admin
router.put('/:section', async (req, res) => {
  try {
    const { section } = req.params;
    const sectionData = req.body;

    let doc = await Settings.findOne({ key: 'course_landing_sections_settings' });
    let allSections = doc && doc.value ? JSON.parse(JSON.stringify(doc.value)) : { ...DEFAULT_COURSE_LANDING_SECTIONS };

    allSections[section] = {
      ...(DEFAULT_COURSE_LANDING_SECTIONS[section] || {}),
      ...(allSections[section] || {}),
      ...sectionData
    };

    const updated = await Settings.findOneAndUpdate(
      { key: 'course_landing_sections_settings' },
      { $set: { value: allSections } },
      { new: true, upsert: true, setDefaultsOnInsert: true }
    );

    res.json({ message: `${section} updated successfully`, data: updated.value[section] });
  } catch (err) {
    console.error(`Error updating section ${req.params.section}:`, err);
    res.status(500).json({ message: 'Failed to update section settings' });
  }
});

// @desc    Reset Specific Section Settings to Default
// @route   POST /api/courses/landing-settings/:section/reset
// @access  Admin
router.post('/:section/reset', async (req, res) => {
  try {
    const { section } = req.params;
    if (!DEFAULT_COURSE_LANDING_SECTIONS[section]) {
      return res.status(400).json({ message: 'Invalid section' });
    }

    let doc = await Settings.findOne({ key: 'course_landing_sections_settings' });
    let allSections = doc && doc.value ? JSON.parse(JSON.stringify(doc.value)) : { ...DEFAULT_COURSE_LANDING_SECTIONS };

    allSections[section] = { ...DEFAULT_COURSE_LANDING_SECTIONS[section] };

    const updated = await Settings.findOneAndUpdate(
      { key: 'course_landing_sections_settings' },
      { $set: { value: allSections } },
      { new: true, upsert: true, setDefaultsOnInsert: true }
    );

    res.json({ message: `${section} reset to default successfully`, data: updated.value[section] });
  } catch (err) {
    console.error(`Error resetting section ${req.params.section}:`, err);
    res.status(500).json({ message: 'Failed to reset section settings' });
  }
});

export default router;
