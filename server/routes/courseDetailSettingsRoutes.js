import express from 'express';
import Settings from '../models/Settings.js';

const router = express.Router();

export const DEFAULT_COURSE_DETAILS_MAP = {
  'better-man': {
    slug: 'better-man',
    n: '01',
    chips: ['Calm Authority', 'Self-Command'],
    soon: false,
    cls: 'v3',
    title: 'The Better Man',
    lede: 'Master the psychology of calm authority, magnetic communication and effortless self-command.',
    d: 'Calm authority, magnetic communication and self-command, taught in eight modules with three private sessions.',
    sidebarChips: [
      ['Schedule', 'Self-Paced'],
      ['Certificate', 'Yes'],
      ['Language', 'Hinglish / English'],
      ['Mentorship', '1-on-1 Live']
    ],
    hl: [
      ['Build Real Presence', '(Not Just Theory)'],
      ['3 Private Sessions', 'with Aarkesh']
    ],
    inside: [
      '8 HD video modules & frameworks',
      'Downloadable workbooks and mental models',
      '3 private 1-on-1 coaching sessions with Aarkesh',
      'Lifetime access with all future updates'
    ],
    facts: [['8', 'Modules'], ['3 Free', '1-on-1 Sessions']],
    price: '₹15,000',
    was: '₹25,000',
    cta: 'Check Course',
    syllabusTitle: 'Eight Modules To Total Self-Command',
    syllabusSubtitle: 'A comprehensive, step-by-step roadmap from baseline nervousness to unshakeable gravitas.',
    syllabus: [
      { n: '01', t: 'The Foundation of Presence', d: 'Grounding techniques, diaphragmatic breathing under tension, and mastering the crucial first 10 seconds in any room.' },
      { n: '02', t: 'Breaking the Reactive Cycle', d: 'Identifying personal emotional triggers, pausing between impulse and response, and eliminating defensive habits.' },
      { n: '03', t: 'Mastering Vocal Gravitas & Tone', d: 'Lowering resonance, eliminating filler words, pacing your delivery, and speaking with magnetic, effortless weight.' },
      { n: '04', t: 'Non-Verbal Dominance & Spatial Calibration', d: 'Unwavering eye contact, open posture mechanics, micro-expression control, and physical composure.' },
      { n: '05', t: 'High-Stakes Conversations & Holding Frame', d: 'Navigating demanding bosses, aggressive negotiations, or emotionally volatile conversations without yielding.' },
      { n: '06', t: 'Decision Making & Decisive Action', d: 'Eliminating second-guessing, owning difficult outcomes, and leading team members or family with unhesitating clarity.' },
      { n: '07', t: 'Conflict Resolution Without Compromise', d: 'De-escalating heated confrontation while maintaining firm boundaries and achieving win-win outcomes.' },
      { n: '08', t: 'Integration & Lifetime Standard', d: 'Building your daily self-command rituals, maintaining high standards, and solidifying permanent personal gravitas.' }
    ],
    writeup: {
      chip: 'CORE METHODOLOGY',
      h1: 'Most Men Were Never Taught How to Hold Ground',
      lede: 'True charisma is not loud. It is the unhurried certainty of a man who does not need permission to take up space.',
      p1: 'When pressure spikes in a meeting, negotiation, or relationship, the natural reflex is either to collapse inward or become combative. Both signal the same underlying weakness: emotional reactivity.',
      quote: "A room doesn't respond to volume. It responds to certainty.",
      p2: 'Through 8 structured modules, you dismantle the nervous system habits that cause rushing, stammering, and over-explaining. You learn how to anchor your physical presence, speak with calm resonance, and command respectful silence before uttering a single sentence.',
      distinction: 'Reactive men seek approval through fast speech and validation. Anchored men lead through stillness, calibrated pauses, and clear boundaries.'
    }
  },
  'difficult-people': {
    slug: 'difficult-people',
    n: '02',
    chips: ['Boundaries', 'Conflict'],
    soon: true,
    cls: 'v2',
    title: 'Difficult People',
    lede: 'Stay steady with the boss, partner or parent who pushes every button you have.',
    d: 'Stay steady with the boss, partner or parent who pushes every button you have.',
    sidebarChips: [
      ['Schedule', 'Self-Paced'],
      ['Certificate', 'Yes'],
      ['Language', 'Hinglish / English'],
      ['Access', 'Lifetime']
    ],
    hl: [
      ['Hold Your Ground', '(Without a Fight)'],
      ['2 Private Sessions', 'with Aarkesh']
    ],
    inside: [
      '6 HD video modules',
      'Downloadable conflict frameworks',
      '2 private 1-on-1 coaching sessions',
      'Lifetime access',
      'Early-access price for waitlist members'
    ],
    facts: [['6', 'Modules'], ['2 Free', '1-on-1 Sessions']],
    price: '₹3,999',
    was: '₹7,999',
    cta: 'Check Course',
    syllabusTitle: 'Six Modules To Emotional Sovereignty',
    syllabusSubtitle: 'The practical psychological playbook to disarm manipulation, establish firm boundaries, and protect your inner peace.',
    syllabus: [
      { n: '01', t: 'Mapping Toxic Patterns & Triggers', d: 'Recognizing manipulative archetypes, passive-aggressive traps, and subtle emotional manipulation tactics before they drain you.' },
      { n: '02', t: 'The Unshakeable Boundary Framework', d: 'Setting clear, non-negotiable boundaries with bosses, partners, or parents without anger, defensiveness, or guilt.' },
      { n: '03', t: 'Disarming High-Conflict Personalities', d: 'Verbal de-escalation strategies, avoiding defensive traps, and maintaining quiet emotional detachment in heated moments.' },
      { n: '04', t: 'Holding Ground in High-Stakes Confrontations', d: 'Staying centered during intense arguments, asserting your authority, and never breaking composure under pressure.' },
      { n: '05', t: 'Navigating Difficult Workplace Dynamics', d: 'Managing micro-managers, corporate politics, and aggressive colleagues while protecting your professional standing.' },
      { n: '06', t: 'Reclaiming Your Mental Sovereignty', d: 'Overcoming post-conflict rumination, establishing internal calm, and permanent emotional freedom from difficult dynamics.' }
    ],
    writeup: {
      chip: 'CONFLICT FRAMEWORK',
      h1: "Stop Absorbing Other People's Emotional Chaos",
      lede: "High-conflict personalities don't look for resolution—they look for reaction. The moment you react, you lose ground.",
      p1: "Whether it's a demanding boss, a passive-aggressive colleague, or a volatile family member, their emotional turbulence is designed to pull you off-center and put you on the defensive.",
      quote: "You don't defeat difficult people by fighting back. You defeat them by becoming impossible to trigger.",
      p2: 'In this 6-module masterclass, you get the exact psychological tools to stay completely unshakeable. You will learn how to set ironclad boundaries, disarm manipulative tactics in real-time, and hold your frame without shouting or apologizing.',
      distinction: 'Weak responses either explode with anger or shrink with compliance. Strategic self-command stays neutral, unbothered, and in total control.'
    }
  },
  'decisions': {
    slug: 'decisions',
    n: '03',
    chips: ['Clarity', 'Choice'],
    soon: true,
    cls: '',
    title: 'Decisions',
    lede: 'Stop agonizing over what to do next. Learn the art of high-conviction decision-making.',
    d: 'Stop agonizing over what to do next. Learn the art of high-conviction decision-making.',
    sidebarChips: [
      ['Schedule', 'Self-Paced'],
      ['Certificate', 'Yes'],
      ['Language', 'Hinglish / English'],
      ['Access', 'Lifetime']
    ],
    hl: [
      ['Kill Second-Guessing', '(Forever)'],
      ['2 Private Sessions', 'with Aarkesh']
    ],
    inside: [
      '5 HD video modules',
      'Mental models decision matrix',
      '2 private 1-on-1 coaching sessions',
      'Lifetime access'
    ],
    facts: [['5', 'Modules'], ['2 Free', '1-on-1 Sessions']],
    price: '₹3,999',
    was: '₹7,999',
    cta: 'Check Course',
    syllabusTitle: 'Five Modules To High-Conviction Choices',
    syllabusSubtitle: 'Cut through analysis paralysis, eliminate regret, and make high-stakes career and life choices with complete confidence.',
    syllabus: [
      { n: '01', t: 'The Psychology of Indecision & Overthinking', d: 'Identifying the fear-based traps that cause analysis paralysis, second-guessing, and delayed execution.' },
      { n: '02', t: 'The Core Values Alignment Matrix', d: 'Creating your personal decision-making filter based on core life priorities and non-negotiables.' },
      { n: '03', t: 'Risk Calibration & Worst-Case Inversion', d: 'De-catastrophizing fear, calculating reversible vs non-reversible decisions, and acting boldly under uncertainty.' },
      { n: '04', t: 'Executing Without Regret or Hesitation', d: 'Moving from thought to commitment without looking back, eliminating post-decision anxiety.' },
      { n: '05', t: 'The Decisive Leader Operating System', d: 'Communicating difficult decisions to teams, stakeholders, and partners with unwavering conviction.' }
    ],
    writeup: {
      chip: 'DECISION ENGINE',
      h1: 'Indecision Is Not Caution. It Is Slow Poison.',
      lede: 'Most people do not lack information. They lack a decision-making framework they can trust under pressure.',
      p1: 'When you hesitate, opportunities expire, momentum dies, and self-trust erodes. High-performing individuals do not have better luck—they make cleaner, faster choices and commit fully.',
      quote: 'A good decision executed with 100% conviction beats a perfect decision delayed by fear.',
      p2: 'In this masterclass, you will learn the exact mental models used by elite operators to make high-stakes choices without second-guessing or regret.',
      distinction: 'Indecisive people wait for certainty that never comes. Decisive leaders generate certainty through aligned action.'
    }
  }
};

// @desc    Get All Course Details Map
// @route   GET /api/courses/details-settings
// @access  Public
router.get('/', async (req, res) => {
  try {
    const doc = await Settings.findOne({ key: 'course_multi_details_settings' });
    if (!doc || !doc.value) {
      return res.json(DEFAULT_COURSE_DETAILS_MAP);
    }
    const merged = { ...DEFAULT_COURSE_DETAILS_MAP, ...(doc.value || {}) };
    res.json(merged);
  } catch (err) {
    console.error('Error fetching course detail settings:', err);
    res.status(500).json({ message: 'Failed to fetch course detail settings' });
  }
});

// @desc    Get Specific Course Details
// @route   GET /api/courses/details-settings/:slug
// @access  Public
router.get('/:slug', async (req, res) => {
  try {
    const { slug } = req.params;
    const defaultData = DEFAULT_COURSE_DETAILS_MAP[slug] || null;
    const doc = await Settings.findOne({ key: 'course_multi_details_settings' });

    if (!doc || !doc.value || !doc.value[slug]) {
      if (defaultData) return res.json(defaultData);
      return res.status(404).json({ message: 'Course not found' });
    }

    const merged = { ...(defaultData || {}), ...(doc.value[slug] || {}) };
    res.json(merged);
  } catch (err) {
    console.error(`Error fetching course ${req.params.slug}:`, err);
    res.status(500).json({ message: 'Failed to fetch course details' });
  }
});

// @desc    Update Specific Course Details
// @route   PUT /api/courses/details-settings/:slug
// @access  Admin
router.put('/:slug', async (req, res) => {
  try {
    const { slug } = req.params;
    const courseData = req.body;

    let doc = await Settings.findOne({ key: 'course_multi_details_settings' });
    let allCourses = doc && doc.value ? JSON.parse(JSON.stringify(doc.value)) : { ...DEFAULT_COURSE_DETAILS_MAP };

    allCourses[slug] = {
      ...(DEFAULT_COURSE_DETAILS_MAP[slug] || {}),
      ...(allCourses[slug] || {}),
      ...courseData,
      slug
    };

    const updated = await Settings.findOneAndUpdate(
      { key: 'course_multi_details_settings' },
      { $set: { value: allCourses } },
      { new: true, upsert: true, setDefaultsOnInsert: true }
    );

    res.json({ message: `Course "${courseData.title || slug}" updated successfully`, data: updated.value[slug] });
  } catch (err) {
    console.error(`Error updating course ${req.params.slug}:`, err);
    res.status(500).json({ message: 'Failed to update course details' });
  }
});

// @desc    Reset Specific Course Details to Default
// @route   POST /api/courses/details-settings/:slug/reset
// @access  Admin
router.post('/:slug/reset', async (req, res) => {
  try {
    const { slug } = req.params;
    if (!DEFAULT_COURSE_DETAILS_MAP[slug]) {
      return res.status(400).json({ message: 'Cannot reset custom course without default' });
    }

    let doc = await Settings.findOne({ key: 'course_multi_details_settings' });
    let allCourses = doc && doc.value ? JSON.parse(JSON.stringify(doc.value)) : { ...DEFAULT_COURSE_DETAILS_MAP };

    allCourses[slug] = { ...DEFAULT_COURSE_DETAILS_MAP[slug] };

    const updated = await Settings.findOneAndUpdate(
      { key: 'course_multi_details_settings' },
      { $set: { value: allCourses } },
      { new: true, upsert: true, setDefaultsOnInsert: true }
    );

    res.json({ message: `Course "${slug}" reset to defaults`, data: updated.value[slug] });
  } catch (err) {
    console.error(`Error resetting course ${req.params.slug}:`, err);
    res.status(500).json({ message: 'Failed to reset course' });
  }
});

// @desc    Delete Custom Course
// @route   DELETE /api/courses/details-settings/:slug
// @access  Admin
router.delete('/:slug', async (req, res) => {
  try {
    const { slug } = req.params;
    let doc = await Settings.findOne({ key: 'course_multi_details_settings' });
    if (!doc || !doc.value) {
      return res.json({ message: 'Course removed' });
    }

    let allCourses = { ...doc.value };
    delete allCourses[slug];

    await Settings.findOneAndUpdate(
      { key: 'course_multi_details_settings' },
      { $set: { value: allCourses } },
      { new: true }
    );

    res.json({ message: `Course "${slug}" removed successfully` });
  } catch (err) {
    console.error(`Error deleting course ${req.params.slug}:`, err);
    res.status(500).json({ message: 'Failed to delete course' });
  }
});

export default router;
