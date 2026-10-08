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
    theme: 'roy',
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
    includeFreeSessions: true,
    freeSessionsCount: 3,
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
    const cleanMap = { ...DEFAULT_COURSE_DETAILS_MAP, ...(doc.value || {}) };
    // Remove difficult-people and decisions if not explicitly kept
    delete cleanMap['difficult-people'];
    delete cleanMap['decisions'];
    res.json(cleanMap);
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

    const existingCourse = allCourses[slug] || allCourses[cleanSlug] || {};
    allCourses[slug] = {
      ...(DEFAULT_COURSE_DETAILS_MAP[slug] || {}),
      ...existingCourse,
      ...courseData,
      createdAt: existingCourse.createdAt || courseData.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
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

        const parsedPrice = typeof courseData.price === 'number' 
          ? courseData.price 
          : Number(String(courseData.price || '').replace(/[^\d.]/g, ''));
        if (!isNaN(parsedPrice) && parsedPrice > 0) {
          dbCourse.price = parsedPrice;
        } else if (courseData.pricingSection?.currentPrice) {
          dbCourse.price = Number(courseData.pricingSection.currentPrice);
        }

        const parsedWas = typeof courseData.was === 'number' 
          ? courseData.was 
          : Number(String(courseData.was || '').replace(/[^\d.]/g, ''));
        if (!isNaN(parsedWas) && parsedWas > 0) {
          dbCourse.comparePrice = parsedWas;
        } else if (courseData.pricingSection?.originalPrice) {
          dbCourse.comparePrice = Number(courseData.pricingSection.originalPrice);
        }

        if (courseData.enableGst !== undefined) {
          dbCourse.enableGst = Boolean(courseData.enableGst);
        } else if (courseData.pricingSection?.enableGst !== undefined) {
          dbCourse.enableGst = Boolean(courseData.pricingSection.enableGst);
        }

        if (courseData.gstRate !== undefined) {
          dbCourse.gstRate = Number(courseData.gstRate);
        } else if (courseData.pricingSection?.gstRate !== undefined) {
          dbCourse.gstRate = Number(courseData.pricingSection.gstRate);
        }

        if (courseData.isGstIncluded !== undefined) {
          dbCourse.isGstIncluded = Boolean(courseData.isGstIncluded);
        } else if (courseData.pricingSection?.gstMode) {
          dbCourse.isGstIncluded = courseData.pricingSection.gstMode === 'included';
        } else if (courseData.gstMode) {
          dbCourse.isGstIncluded = courseData.gstMode === 'included';
        }

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
                const rawVal = l.src?.val || l.youtubeUrl || l.youtubeVideoId || l.muxPlaybackId || l.videoUrl || '';
                const ytMatch = String(rawVal).match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([\w-]{11})/) || (String(rawVal).trim().length === 11 && !String(rawVal).includes('/') && !String(rawVal).includes('.') ? [null, String(rawVal).trim()] : null);

                let playbackId = null;
                let ytVal = null;

                if (ytMatch || l.src?.type === 'youtube' || l.youtubeUrl || l.youtubeVideoId) {
                  ytVal = ytMatch ? ytMatch[1] : (l.src?.val || l.youtubeUrl || l.youtubeVideoId);
                } else if (l.src?.type === 'mux' || l.muxPlaybackId) {
                  playbackId = l.src?.val || l.muxPlaybackId;
                } else if (rawVal && !rawVal.includes('youtube') && !rawVal.includes('youtu.be')) {
                  playbackId = rawVal;
                }

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
                  videoStatus: (playbackId || ytVal) ? 'ready' : (l.src?.status || 'none'),
                  youtubeUrl: ytVal ? `https://www.youtube.com/watch?v=${ytVal}` : null,
                  youtubeVideoId: ytVal
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
      
      // Delete all matching variants
      delete allCourses[slug];
      delete allCourses[cleanSlug];
      Object.keys(allCourses).forEach((k) => {
        if (k.toLowerCase().trim() === cleanSlug || k.toLowerCase().trim() === slug.toLowerCase().trim()) {
          delete allCourses[k];
        }
      });

      await Settings.findOneAndUpdate(
        { key: 'course_multi_details_settings' },
        { $set: { value: allCourses } },
        { new: true }
      );
    }

    // 2. Also delete from Course, CourseModule, and CourseLesson collections in MongoDB
    const matchedCourses = await Course.find({
      $or: [
        { slug: cleanSlug },
        { slug: slug },
        { slug: { $regex: new RegExp(`^${cleanSlug}`, 'i') } },
        { title: { $regex: new RegExp(`^${cleanSlug}$`, 'i') } },
        ...(mongoose.Types.ObjectId.isValid(slug) ? [{ _id: slug }] : [])
      ]
    });

    const courseIds = matchedCourses.map(c => c._id);
    if (courseIds.length > 0) {
      await Promise.all([
        Course.deleteMany({ _id: { $in: courseIds } }),
        CourseModule.deleteMany({ courseId: { $in: courseIds } }),
        CourseLesson.deleteMany({ courseId: { $in: courseIds } })
      ]);
    } else {
      await Course.deleteMany({
        $or: [
          { slug: cleanSlug },
          { slug: slug },
          { title: { $regex: new RegExp(`^${cleanSlug}$`, 'i') } }
        ]
      });
    }

    res.json({ message: `Course "${slug}" removed successfully` });
  } catch (err) {
    console.error(`Error deleting course ${req.params.slug}:`, err);
    res.status(500).json({ message: 'Failed to delete course' });
  }
});

export default router;
