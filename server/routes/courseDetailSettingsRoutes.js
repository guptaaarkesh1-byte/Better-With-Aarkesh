import express from 'express';
import mongoose from 'mongoose';
import Settings from '../models/Settings.js';
import Course from '../models/Course.js';
import CourseModule from '../models/CourseModule.js';
import CourseLesson from '../models/CourseLesson.js';

const router = express.Router();

export const DEFAULT_COURSE_DETAILS_MAP = {
  'better-man': {
    slug: 'better-man',
    n: '01',
    imageUrl: '',
    chips: ['Calm Authority', 'Self-Command'],
    soon: false,
    cls: 'v3',
    title: 'The Better Man™',
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
    enableGst: true,
    gstRate: 18,
    isGstIncluded: false,
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
    imageUrl: '',
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
    enableGst: true,
    gstRate: 18,
    isGstIncluded: false,
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
    imageUrl: '',
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
    enableGst: true,
    gstRate: 18,
    isGstIncluded: false,
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
    const cleanSlug = (slug || '').toString().toLowerCase().trim();
    const defaultData = DEFAULT_COURSE_DETAILS_MAP[cleanSlug] || DEFAULT_COURSE_DETAILS_MAP[slug] || null;
    const doc = await Settings.findOne({ key: 'course_multi_details_settings' });

    if (doc && doc.value && doc.value[slug]) {
      const merged = { ...(defaultData || {}), ...(doc.value[slug] || {}), slug };
      return res.json(merged);
    }

    if (doc && doc.value && doc.value[cleanSlug]) {
      const merged = { ...(defaultData || {}), ...(doc.value[cleanSlug] || {}), slug: cleanSlug };
      return res.json(merged);
    }

    if (defaultData) {
      return res.json({ ...defaultData, slug: cleanSlug });
    }

    // Check if course exists in MongoDB Course collection
    const dbCourse = await Course.findOne({
      $or: [
        { slug: cleanSlug },
        { slug: slug },
        ...(mongoose.Types.ObjectId.isValid(slug) ? [{ _id: slug }] : [])
      ]
    });

    if (dbCourse) {
      return res.json({
        slug: dbCourse.slug || cleanSlug,
        title: dbCourse.title,
        lede: dbCourse.description || dbCourse.subtitle || '',
        price: dbCourse.price ? `₹${dbCourse.price.toLocaleString('en-IN')}` : '₹4,999',
        imageUrl: dbCourse.thumbnail || '',
        soon: !dbCourse.isPublished,
        isPublished: dbCourse.isPublished ?? true,
        live: dbCourse.isPublished ?? true
      });
    }

    // Fallback template for any unknown slug instead of 404
    const humanTitle = cleanSlug.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
    return res.json({
      slug: cleanSlug,
      title: humanTitle || 'Masterclass',
      lede: 'Master the psychology and strategies to elevate your sovereignty and leadership.',
      price: '₹4,999',
      was: '₹9,999',
      soon: false,
      live: true,
      isPublished: true,
      chips: ['Leadership', 'Mastery'],
      hl: [['Real-World Transformation', '(Not Just Theory)'], ['3 Private Sessions', 'with Aarkesh']],
      inside: ['HD video modules & frameworks', 'Downloadable workbooks', '3 private 1-on-1 sessions', 'Lifetime access']
    });
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
    const cleanSlug = (slug || '').toString().toLowerCase().trim();

    let doc = await Settings.findOne({ key: 'course_multi_details_settings' });
    let allCourses = doc && doc.value ? JSON.parse(JSON.stringify(doc.value)) : { ...DEFAULT_COURSE_DETAILS_MAP };

    const trailerVal = courseData.trailer || courseData.trailerVideo || courseData.heroSection?.trailerVideo || courseData.trailerVideoUrl || '';
    const thumbVal = courseData.imageUrl || courseData.thumbnailUrl || courseData.thumb || courseData.heroSection?.cardThumbnail || '';

    allCourses[slug] = {
      ...(DEFAULT_COURSE_DETAILS_MAP[slug] || {}),
      ...(allCourses[slug] || {}),
      ...courseData,
      trailer: trailerVal,
      trailerVideo: trailerVal,
      trailerVideoUrl: trailerVal,
      trailerMuxPlaybackId: trailerVal,
      imageUrl: thumbVal,
      thumbnailUrl: thumbVal,
      slug
    };

    if (cleanSlug !== slug) {
      allCourses[cleanSlug] = { ...allCourses[slug], slug: cleanSlug };
    }

    const updated = await Settings.findOneAndUpdate(
      { key: 'course_multi_details_settings' },
      { $set: { value: allCourses } },
      { new: true, upsert: true, setDefaultsOnInsert: true }
    );

    // Synchronize MongoDB Course collection if exists
    try {
      const dbCourse = await Course.findOne({
        $or: [
          { slug: cleanSlug },
          { slug: slug },
          ...(cleanSlug === 'better-man' ? [{ slug: 'the-better-man' }] : [])
        ]
      });

      if (dbCourse) {
        dbCourse.title = courseData.title || dbCourse.title;
        dbCourse.description = courseData.lede || dbCourse.description;
        dbCourse.thumbnail = thumbVal || dbCourse.thumbnail;
        dbCourse.thumbnailUrl = thumbVal || dbCourse.thumbnailUrl;
        dbCourse.trailerVideoUrl = trailerVal;
        dbCourse.trailerMuxPlaybackId = trailerVal;
        dbCourse.isPublished = courseData.isPublished ?? courseData.live ?? true;
        await dbCourse.save();

        if (Array.isArray(courseData.days) && courseData.days.length > 0) {
          await CourseLesson.deleteMany({ courseId: dbCourse._id });
          await CourseModule.deleteMany({ courseId: dbCourse._id });

          for (let mIdx = 0; mIdx < courseData.days.length; mIdx++) {
            const mod = courseData.days[mIdx];
            const newMod = await CourseModule.create({
              courseId: dbCourse._id,
              title: mod.t || `Module ${mIdx + 1}`,
              position: mIdx,
              isPublished: true
            });

            if (Array.isArray(mod.lessons)) {
              for (let lIdx = 0; lIdx < mod.lessons.length; lIdx++) {
                const l = mod.lessons[lIdx];
                const playbackId = l.src?.type === 'mux' ? l.src.val : (l.muxPlaybackId || null);
                const ytVal = l.src?.type === 'youtube' ? l.src.val : (l.youtubeUrl || null);
                await CourseLesson.create({
                  courseId: dbCourse._id,
                  moduleId: newMod._id,
                  title: l.t || `Lesson ${lIdx + 1}`,
                  description: l.desc || '',
                  duration: l.dur || '12:30',
                  position: lIdx,
                  isPublished: true,
                  isFreePreview: false,
                  videoSourceType: ytVal ? 'youtube' : (playbackId ? 'mux' : 'custom'),
                  muxPlaybackId: playbackId,
                  muxUploadId: l.src?.uploadId || null,
                  videoStatus: playbackId ? 'ready' : (l.src?.status || 'none'),
                  youtubeUrl: ytVal
                });
              }
            }
          }
        }
      }
    } catch (dbErr) {
      console.warn('Syncing to Course collection error:', dbErr.message);
    }

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
    const cleanSlug = (slug || '').toString().toLowerCase().trim();

    // 1. Delete from Settings collection
    let doc = await Settings.findOne({ key: 'course_multi_details_settings' });
    if (doc && doc.value) {
      let allCourses = { ...doc.value };
      delete allCourses[slug];
      delete allCourses[cleanSlug];
      if (cleanSlug === 'better-man') {
        delete allCourses['the-better-man'];
      }

      await Settings.findOneAndUpdate(
        { key: 'course_multi_details_settings' },
        { $set: { value: allCourses } },
        { new: true }
      );
    }

    // 2. Also delete from Course collection in MongoDB if present
    await Course.deleteMany({
      $or: [
        { slug: cleanSlug },
        { slug: slug },
        ...(mongoose.Types.ObjectId.isValid(slug) ? [{ _id: slug }] : [])
      ]
    }).catch(() => {});

    res.json({ message: `Course "${slug}" removed successfully` });
  } catch (err) {
    console.error(`Error deleting course ${req.params.slug}:`, err);
    res.status(500).json({ message: 'Failed to delete course' });
  }
});

export default router;
