import express from 'express';
import dotenv from 'dotenv';
import Mux from '@mux/mux-node';
import Course from '../models/Course.js';
import CourseModule from '../models/CourseModule.js';
import CourseLesson from '../models/CourseLesson.js';
import CoursePurchase from '../models/CoursePurchase.js';
import CourseProgress from '../models/CourseProgress.js';
import CourseUser from '../models/CourseUser.js';
import User from '../models/User.js';
import Settings from '../models/Settings.js';
import { protect, admin } from '../middleware/authMiddleware.js';

const router = express.Router();

// Helper to get Mux client from env or Settings
const getMuxClient = async () => {
  dotenv.config(); // Reload from .env if updated at runtime
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

  return new Mux({
    tokenId,
    tokenSecret,
  });
};

// ═══════════════════════════════════════════════════════════════
// COURSES CRUD
// ═══════════════════════════════════════════════════════════════

// @desc    Get all courses with metrics (admin)
// @route   GET /api/admin/courses
router.get('/', protect, admin, async (req, res) => {
  try {
    const { status, search } = req.query;
    const filter = {};

    if (status && status !== 'All') {
      filter.status = status;
    }

    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { subtitle: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ];
    }

    const courses = await Course.find(filter).sort({ order: 1, createdAt: -1 });

    // Attach counts for modules, lessons, and students
    const enhancedCourses = await Promise.all(
      courses.map(async (course) => {
        const [modulesCount, lessonsCount, studentsCount] = await Promise.all([
          CourseModule.countDocuments({ courseId: course._id }),
          CourseLesson.countDocuments({ courseId: course._id }),
          CoursePurchase.countDocuments({ courseId: course._id, paymentStatus: 'Paid' }),
        ]);

        return {
          ...course.toObject(),
          modulesCount,
          lessonsCount,
          studentsCount,
        };
      })
    );

    res.json(enhancedCourses);
  } catch (error) {
    console.error('Error fetching courses:', error);
    res.status(500).json({ message: 'Server error fetching courses' });
  }
});

// @desc    Get single course by ID with modules and lessons
// @route   GET /api/admin/courses/:id
router.get('/:id', protect, admin, async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    const modules = await CourseModule.find({ courseId: course._id }).sort({ position: 1 });
    const lessons = await CourseLesson.find({ courseId: course._id }).sort({ position: 1 });

    const [studentsCount, totalRevenueResult] = await Promise.all([
      CoursePurchase.countDocuments({ courseId: course._id, paymentStatus: 'Paid' }),
      CoursePurchase.aggregate([
        { $match: { courseId: course._id, paymentStatus: 'Paid' } },
        { $group: { _id: null, total: { $sum: '$amount' } } },
      ]),
    ]);

    const totalRevenue = totalRevenueResult[0]?.total || 0;

    // Nest lessons under their respective modules
    const modulesWithLessons = modules.map((mod) => ({
      ...mod.toObject(),
      lessons: lessons.filter((l) => l.moduleId.toString() === mod._id.toString()),
    }));

    res.json({
      ...course.toObject(),
      modules: modulesWithLessons,
      metrics: {
        modulesCount: modules.length,
        lessonsCount: lessons.length,
        studentsCount,
        totalRevenue,
      },
    });
  } catch (error) {
    console.error('Error fetching course:', error);
    res.status(500).json({ message: 'Server error fetching course' });
  }
});

// @desc    Create new course
// @route   POST /api/admin/courses
router.post('/', protect, admin, async (req, res) => {
  try {
    const {
      title,
      slug,
      subtitle,
      description,
      thumbnail,
      price,
      comparePrice,
      duration,
      level,
      instructor,
      benefits,
      whatYouWillLearn,
      requirements,
      status,
      seoTitle,
      seoDescription,
    } = req.body;

    if (!title) {
      return res.status(400).json({ message: 'Course title is required' });
    }

    let finalSlug = slug ? slug.trim().toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '') : title.trim().toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');

    // Ensure unique slug
    let existing = await Course.findOne({ slug: finalSlug });
    if (existing) {
      finalSlug = `${finalSlug}-${Date.now()}`;
    }

    const course = await Course.create({
      title,
      slug: finalSlug,
      subtitle: subtitle || '',
      description: description || '',
      thumbnail: thumbnail || '',
      price: Number(price) || 15000,
      comparePrice: comparePrice ? Number(comparePrice) : null,
      duration: duration || '6+ Hours',
      level: level || 'All Levels',
      instructor: instructor || 'Aarkesh Gupta',
      benefits: Array.isArray(benefits) ? benefits : [],
      whatYouWillLearn: Array.isArray(whatYouWillLearn) ? whatYouWillLearn : [],
      requirements: Array.isArray(requirements) ? requirements : [],
      status: status || 'Draft',
      seoTitle: seoTitle || '',
      seoDescription: seoDescription || '',
    });

    res.status(201).json(course);
  } catch (error) {
    console.error('Error creating course:', error);
    res.status(500).json({ message: error.message || 'Server error creating course' });
  }
});

// @desc    Update course
// @route   PUT /api/admin/courses/:id
router.put('/:id', protect, admin, async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    const fields = [
      'title', 'slug', 'subtitle', 'description', 'thumbnail',
      'price', 'comparePrice', 'duration', 'level', 'instructor',
      'benefits', 'whatYouWillLearn', 'requirements', 'status',
      'seoTitle', 'seoDescription', 'order',
    ];

    fields.forEach((field) => {
      if (req.body[field] !== undefined) {
        course[field] = req.body[field];
      }
    });

    await course.save();
    res.json(course);
  } catch (error) {
    console.error('Error updating course:', error);
    res.status(500).json({ message: 'Server error updating course' });
  }
});

// @desc    Toggle publish status
// @route   PUT /api/admin/courses/:id/publish-status
router.put('/:id/publish-status', protect, admin, async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    course.status = course.status === 'Published' ? 'Draft' : 'Published';
    await course.save();

    res.json({ message: `Course status changed to ${course.status}`, status: course.status });
  } catch (error) {
    console.error('Error toggling course status:', error);
    res.status(500).json({ message: 'Server error updating status' });
  }
});

// @desc    Duplicate course with curriculum
// @route   POST /api/admin/courses/:id/duplicate
router.post('/:id/duplicate', protect, admin, async (req, res) => {
  try {
    const originalCourse = await Course.findById(req.params.id);
    if (!originalCourse) {
      return res.status(404).json({ message: 'Course not found' });
    }

    const newCourseData = originalCourse.toObject();
    delete newCourseData._id;
    delete newCourseData.createdAt;
    delete newCourseData.updatedAt;

    newCourseData.title = `${originalCourse.title} (Copy)`;
    newCourseData.slug = `${originalCourse.slug}-copy-${Date.now()}`;
    newCourseData.status = 'Draft';

    const duplicatedCourse = await Course.create(newCourseData);

    // Duplicate modules and lessons
    const originalModules = await CourseModule.find({ courseId: originalCourse._id }).sort({ position: 1 });
    for (const mod of originalModules) {
      const newModData = mod.toObject();
      delete newModData._id;
      delete newModData.createdAt;
      delete newModData.updatedAt;
      newModData.courseId = duplicatedCourse._id;

      const duplicatedMod = await CourseModule.create(newModData);

      const originalLessons = await CourseLesson.find({ moduleId: mod._id }).sort({ position: 1 });
      for (const lesson of originalLessons) {
        const newLessonData = lesson.toObject();
        delete newLessonData._id;
        delete newLessonData.createdAt;
        delete newLessonData.updatedAt;
        newLessonData.courseId = duplicatedCourse._id;
        newLessonData.moduleId = duplicatedMod._id;

        await CourseLesson.create(newLessonData);
      }
    }

    res.status(201).json(duplicatedCourse);
  } catch (error) {
    console.error('Error duplicating course:', error);
    res.status(500).json({ message: 'Server error duplicating course' });
  }
});

// @desc    Delete course and all sub-modules/lessons
// @route   DELETE /api/admin/courses/:id
router.delete('/:id', protect, admin, async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    await Promise.all([
      Course.findByIdAndDelete(course._id),
      CourseModule.deleteMany({ courseId: course._id }),
      CourseLesson.deleteMany({ courseId: course._id }),
    ]);

    res.json({ message: 'Course and curriculum deleted successfully' });
  } catch (error) {
    console.error('Error deleting course:', error);
    res.status(500).json({ message: 'Server error deleting course' });
  }
});

// ═══════════════════════════════════════════════════════════════
// MODULES CRUD & REORDER
// ═══════════════════════════════════════════════════════════════

// @desc    Create a module
// @route   POST /api/admin/courses/:courseId/modules
router.post('/:courseId/modules', protect, admin, async (req, res) => {
  try {
    const { title, description } = req.body;
    if (!title) {
      return res.status(400).json({ message: 'Module title is required' });
    }

    const lastModule = await CourseModule.findOne({ courseId: req.params.courseId }).sort({ position: -1 });
    const position = lastModule ? lastModule.position + 1 : 0;

    const module = await CourseModule.create({
      courseId: req.params.courseId,
      title: title.trim(),
      description: description || '',
      position,
      isPublished: true,
    });

    res.status(201).json({ ...module.toObject(), lessons: [] });
  } catch (error) {
    console.error('Error creating module:', error);
    res.status(500).json({ message: 'Server error creating module' });
  }
});

// @desc    Update a module
// @route   PUT /api/admin/courses/modules/:moduleId
router.put('/modules/:moduleId', protect, admin, async (req, res) => {
  try {
    const { title, description, isPublished } = req.body;
    const module = await CourseModule.findById(req.params.moduleId);
    if (!module) {
      return res.status(404).json({ message: 'Module not found' });
    }

    if (title !== undefined) module.title = title.trim();
    if (description !== undefined) module.description = description;
    if (isPublished !== undefined) module.isPublished = isPublished;

    await module.save();
    res.json(module);
  } catch (error) {
    console.error('Error updating module:', error);
    res.status(500).json({ message: 'Server error updating module' });
  }
});

// @desc    Delete a module and its lessons
// @route   DELETE /api/admin/courses/modules/:moduleId
router.delete('/modules/:moduleId', protect, admin, async (req, res) => {
  try {
    const module = await CourseModule.findById(req.params.moduleId);
    if (!module) {
      return res.status(404).json({ message: 'Module not found' });
    }

    await Promise.all([
      CourseModule.findByIdAndDelete(module._id),
      CourseLesson.deleteMany({ moduleId: module._id }),
    ]);

    res.json({ message: 'Module and lessons deleted successfully' });
  } catch (error) {
    console.error('Error deleting module:', error);
    res.status(500).json({ message: 'Server error deleting module' });
  }
});

// @desc    Reorder modules in a course
// @route   PUT /api/admin/courses/:courseId/modules/reorder
router.put('/:courseId/modules/reorder', protect, admin, async (req, res) => {
  try {
    const { moduleIds } = req.body; // Array of module IDs in new order
    if (!Array.isArray(moduleIds)) {
      return res.status(400).json({ message: 'moduleIds must be an array' });
    }

    await Promise.all(
      moduleIds.map((id, index) =>
        CourseModule.findByIdAndUpdate(id, { position: index })
      )
    );

    res.json({ message: 'Modules reordered successfully' });
  } catch (error) {
    console.error('Error reordering modules:', error);
    res.status(500).json({ message: 'Server error reordering modules' });
  }
});

// ═══════════════════════════════════════════════════════════════
// LESSONS CRUD & REORDER
// ═══════════════════════════════════════════════════════════════

// @desc    Create a lesson in a module
// @route   POST /api/admin/courses/modules/:moduleId/lessons
router.post('/modules/:moduleId/lessons', protect, admin, async (req, res) => {
  try {
    const { title, description, isFreePreview } = req.body;
    const module = await CourseModule.findById(req.params.moduleId);
    if (!module) {
      return res.status(404).json({ message: 'Module not found' });
    }

    const lastLesson = await CourseLesson.findOne({ moduleId: module._id }).sort({ position: -1 });
    const position = lastLesson ? lastLesson.position + 1 : 0;

    const lesson = await CourseLesson.create({
      courseId: module.courseId,
      moduleId: module._id,
      title: title ? title.trim() : `Lesson ${position + 1}`,
      description: description || '',
      position,
      duration: '00:00',
      isPublished: true,
      isFreePreview: !!isFreePreview,
      videoStatus: 'none',
    });

    res.status(201).json(lesson);
  } catch (error) {
    console.error('Error creating lesson:', error);
    res.status(500).json({ message: 'Server error creating lesson' });
  }
});

// @desc    Get single lesson
// @route   GET /api/admin/courses/lessons/:lessonId
router.get('/lessons/:lessonId', protect, admin, async (req, res) => {
  try {
    const lesson = await CourseLesson.findById(req.params.lessonId);
    if (!lesson) {
      return res.status(404).json({ message: 'Lesson not found' });
    }
    res.json(lesson);
  } catch (error) {
    console.error('Error fetching lesson:', error);
    res.status(500).json({ message: 'Server error fetching lesson' });
  }
});

// @desc    Update a lesson
// @route   PUT /api/admin/courses/lessons/:lessonId
router.put('/lessons/:lessonId', protect, admin, async (req, res) => {
  try {
    const lesson = await CourseLesson.findById(req.params.lessonId);
    if (!lesson) {
      return res.status(404).json({ message: 'Lesson not found' });
    }

    const fields = [
      'title', 'description', 'duration', 'isPublished', 'isFreePreview',
      'videoStatus', 'muxUploadId', 'muxAssetId', 'muxPlaybackId',
      'muxDuration', 'muxResolution', 'muxAspectRatio', 'videoReadyAt',
      'errorMessage', 'resources'
    ];

    fields.forEach((field) => {
      if (req.body[field] !== undefined) {
        lesson[field] = req.body[field];
      }
    });

    await lesson.save();
    res.json(lesson);
  } catch (error) {
    console.error('Error updating lesson:', error);
    res.status(500).json({ message: 'Server error updating lesson' });
  }
});

// @desc    Duplicate a lesson
// @route   POST /api/admin/courses/lessons/:lessonId/duplicate
router.post('/lessons/:lessonId/duplicate', protect, admin, async (req, res) => {
  try {
    const original = await CourseLesson.findById(req.params.lessonId);
    if (!original) {
      return res.status(404).json({ message: 'Lesson not found' });
    }

    const lastLesson = await CourseLesson.findOne({ moduleId: original.moduleId }).sort({ position: -1 });
    const position = lastLesson ? lastLesson.position + 1 : original.position + 1;

    const newLessonData = original.toObject();
    delete newLessonData._id;
    delete newLessonData.createdAt;
    delete newLessonData.updatedAt;

    newLessonData.title = `${original.title} (Copy)`;
    newLessonData.position = position;

    const duplicated = await CourseLesson.create(newLessonData);
    res.status(201).json(duplicated);
  } catch (error) {
    console.error('Error duplicating lesson:', error);
    res.status(500).json({ message: 'Server error duplicating lesson' });
  }
});

// @desc    Delete a lesson
// @route   DELETE /api/admin/courses/lessons/:lessonId
router.delete('/lessons/:lessonId', protect, admin, async (req, res) => {
  try {
    const lesson = await CourseLesson.findById(req.params.lessonId);
    if (!lesson) {
      return res.status(404).json({ message: 'Lesson not found' });
    }

    await CourseLesson.findByIdAndDelete(lesson._id);
    res.json({ message: 'Lesson deleted successfully' });
  } catch (error) {
    console.error('Error deleting lesson:', error);
    res.status(500).json({ message: 'Server error deleting lesson' });
  }
});

// @desc    Reorder lessons in a module
// @route   PUT /api/admin/courses/modules/:moduleId/lessons/reorder
router.put('/modules/:moduleId/lessons/reorder', protect, admin, async (req, res) => {
  try {
    const { lessonIds } = req.body;
    if (!Array.isArray(lessonIds)) {
      return res.status(400).json({ message: 'lessonIds must be an array' });
    }

    await Promise.all(
      lessonIds.map((id, index) =>
        CourseLesson.findByIdAndUpdate(id, { position: index })
      )
    );

    res.json({ message: 'Lessons reordered successfully' });
  } catch (error) {
    console.error('Error reordering lessons:', error);
    res.status(500).json({ message: 'Server error reordering lessons' });
  }
});

// ═══════════════════════════════════════════════════════════════
// MUX DIRECT UPLOAD & ASSET STATUS
// ═══════════════════════════════════════════════════════════════

// @desc    Generate a secure Direct Upload URL from Mux
// @route   POST /api/admin/courses/mux/upload-url
router.post('/mux/upload-url', protect, admin, async (req, res) => {
  try {
    const { lessonId } = req.body;
    const mux = await getMuxClient();

    // Create Direct Upload with public playback policy and basic video quality
    const upload = await mux.video.uploads.create({
      new_asset_settings: {
        playback_policy: ['public'],
        video_quality: 'basic',
      },
      cors_origin: '*',
    });

    if (lessonId) {
      await CourseLesson.findByIdAndUpdate(lessonId, {
        muxUploadId: upload.id,
        videoStatus: 'uploading',
        errorMessage: '',
      });
    }

    res.json({
      uploadUrl: upload.url,
      uploadId: upload.id,
    });
  } catch (error) {
    console.error('Error creating Mux upload URL:', error);
    res.status(500).json({
      message: error.message || 'Failed to initialize Mux direct upload. Check Mux API credentials.',
    });
  }
});

// @desc    Check and sync Mux Asset Status (Polling Fallback)
// @route   GET /api/admin/courses/mux/asset-status/:identifier
router.get('/mux/asset-status/:identifier', protect, admin, async (req, res) => {
  try {
    const { identifier } = req.params;
    const mux = await getMuxClient();

    let asset = null;
    let upload = null;

    // Check if identifier is an uploadId or assetId
    try {
      upload = await mux.video.uploads.retrieve(identifier);
      if (upload && upload.asset_id) {
        asset = await mux.video.assets.retrieve(upload.asset_id);
      }
    } catch (e) {
      // If not an upload, try fetching directly as asset
      try {
        asset = await mux.video.assets.retrieve(identifier);
      } catch (assetErr) {
        // Not found
      }
    }

    if (!asset && upload) {
      return res.json({
        status: upload.status, // 'waiting', 'asset_created', 'errored', 'cancelled'
        uploadStatus: upload.status,
        assetId: upload.asset_id || null,
        playbackId: null,
      });
    }

    if (asset) {
      const playbackId = asset.playback_ids?.[0]?.id || null;
      let durationStr = '00:00';

      if (asset.duration) {
        const totalSeconds = Math.floor(asset.duration);
        const mins = Math.floor(totalSeconds / 60);
        const secs = totalSeconds % 60;
        durationStr = `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
      }

      const resolution = asset.max_stored_resolution ? `${asset.max_stored_resolution}` : '';
      const aspectRatio = asset.aspect_ratio || '';

      // Update matching lesson in DB if exists
      const query = { $or: [{ muxUploadId: identifier }, { muxAssetId: asset.id }] };
      const lesson = await CourseLesson.findOne(query);

      if (lesson) {
        lesson.muxAssetId = asset.id;
        if (playbackId) lesson.muxPlaybackId = playbackId;
        if (asset.duration) lesson.muxDuration = asset.duration;
        lesson.duration = durationStr;
        if (resolution) lesson.muxResolution = resolution;
        if (aspectRatio) lesson.muxAspectRatio = aspectRatio;

        if (asset.status === 'ready') {
          lesson.videoStatus = 'ready';
          lesson.videoReadyAt = lesson.videoReadyAt || new Date();
          lesson.errorMessage = '';
        } else if (asset.status === 'errored') {
          lesson.videoStatus = 'errored';
          lesson.errorMessage = asset.errors?.messages?.[0] || 'Mux processing failed';
        } else {
          lesson.videoStatus = 'processing';
        }

        await lesson.save();
      }

      return res.json({
        status: asset.status, // 'preparing', 'ready', 'errored'
        assetId: asset.id,
        playbackId,
        duration: asset.duration,
        durationFormatted: durationStr,
        resolution,
        aspectRatio,
      });
    }

    res.status(404).json({ message: 'Video asset not found yet' });
  } catch (error) {
    console.error('Error fetching Mux asset status:', error);
    res.status(500).json({ message: 'Error checking video status' });
  }
});

// ═══════════════════════════════════════════════════════════════
// PURCHASES & STUDENTS
// ═══════════════════════════════════════════════════════════════

// @desc    Get all course purchases/transactions
// @route   GET /api/admin/courses/purchases
router.get('/purchases/all', protect, admin, async (req, res) => {
  try {
    const { courseId, paymentStatus, search } = req.query;
    const filter = {};

    if (courseId && courseId !== 'All') {
      filter.courseId = courseId;
    }
    if (paymentStatus && paymentStatus !== 'All') {
      filter.paymentStatus = paymentStatus;
    }
    if (search) {
      filter.$or = [
        { studentName: { $regex: search, $options: 'i' } },
        { studentEmail: { $regex: search, $options: 'i' } },
        { transactionId: { $regex: search, $options: 'i' } },
      ];
    }

    const purchases = await CoursePurchase.find(filter)
      .populate('courseId', 'title slug price')
      .sort({ purchaseDate: -1 });

    // Calculate progress for each purchase
    const enhancedPurchases = await Promise.all(
      purchases.map(async (p) => {
        if (!p.courseId) return p.toObject();

        const totalLessons = await CourseLesson.countDocuments({ courseId: p.courseId._id, isPublished: true });
        const completedLessons = await CourseProgress.countDocuments({
          courseId: p.courseId._id,
          email: p.studentEmail.toLowerCase(),
          isCompleted: true,
        });

        const progressPercent = totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0;

        return {
          ...p.toObject(),
          totalLessons,
          completedLessons,
          progressPercent,
        };
      })
    );

    res.json(enhancedPurchases);
  } catch (error) {
    console.error('Error fetching course purchases:', error);
    res.status(500).json({ message: 'Server error fetching purchases' });
  }
});

// @desc    Get all students across courses with progress
// @route   GET /api/admin/courses/students/all
router.get('/students/all', protect, admin, async (req, res) => {
  try {
    const { courseId, search } = req.query;

    const purchaseFilter = { paymentStatus: 'Paid' };
    if (courseId && courseId !== 'All') {
      purchaseFilter.courseId = courseId;
    }
    if (search) {
      purchaseFilter.$or = [
        { studentName: { $regex: search, $options: 'i' } },
        { studentEmail: { $regex: search, $options: 'i' } },
      ];
    }

    const purchases = await CoursePurchase.find(purchaseFilter)
      .populate('courseId', 'title slug')
      .sort({ purchaseDate: -1 });

    const students = await Promise.all(
      purchases.map(async (p) => {
        const totalLessons = await CourseLesson.countDocuments({ courseId: p.courseId?._id, isPublished: true });
        const completedCount = await CourseProgress.countDocuments({
          courseId: p.courseId?._id,
          email: p.studentEmail.toLowerCase(),
          isCompleted: true,
        });

        const lastProgress = await CourseProgress.findOne({
          courseId: p.courseId?._id,
          email: p.studentEmail.toLowerCase(),
        }).sort({ lastActivityAt: -1 });

        const progressPercent = totalLessons > 0 ? Math.round((completedCount / totalLessons) * 100) : 0;

        return {
          purchaseId: p._id,
          studentName: p.studentName,
          studentEmail: p.studentEmail,
          courseTitle: p.courseId?.title || 'Unknown Course',
          courseId: p.courseId?._id,
          purchaseDate: p.purchaseDate,
          paymentStatus: p.paymentStatus,
          enrollmentStatus: p.enrollmentStatus,
          transactionId: p.transactionId,
          amount: p.amount,
          progressPercent,
          completedLessons: completedCount,
          totalLessons,
          lastActive: lastProgress ? lastProgress.lastActivityAt : p.purchaseDate,
        };
      })
    );

    res.json(students);
  } catch (error) {
    console.error('Error fetching course students:', error);
    res.status(500).json({ message: 'Server error fetching students' });
  }
});

// @desc    Get detailed student course progress breakdown
// @route   GET /api/admin/courses/students/:purchaseId/detail
router.get('/students/:purchaseId/detail', protect, admin, async (req, res) => {
  try {
    const purchase = await CoursePurchase.findById(req.params.purchaseId).populate('courseId');
    if (!purchase) {
      return res.status(404).json({ message: 'Purchase record not found' });
    }

    const courseId = purchase.courseId._id;
    const email = purchase.studentEmail.toLowerCase();

    const [modules, lessons, progressRecords] = await Promise.all([
      CourseModule.find({ courseId }).sort({ position: 1 }),
      CourseLesson.find({ courseId }).sort({ position: 1 }),
      CourseProgress.find({ courseId, email }),
    ]);

    const progressMap = {};
    progressRecords.forEach((pr) => {
      progressMap[pr.lessonId.toString()] = pr;
    });

    const curriculumWithProgress = modules.map((mod) => ({
      ...mod.toObject(),
      lessons: lessons
        .filter((l) => l.moduleId.toString() === mod._id.toString())
        .map((l) => ({
          ...l.toObject(),
          isCompleted: !!progressMap[l._id.toString()]?.isCompleted,
          completedAt: progressMap[l._id.toString()]?.completedAt || null,
          lastWatchedPosition: progressMap[l._id.toString()]?.lastWatchedPosition || 0,
        })),
    }));

    const totalLessons = lessons.length;
    const completedCount = progressRecords.filter((r) => r.isCompleted).length;
    const progressPercent = totalLessons > 0 ? Math.round((completedCount / totalLessons) * 100) : 0;

    res.json({
      purchase,
      curriculum: curriculumWithProgress,
      progressPercent,
      completedLessons: completedCount,
      totalLessons,
    });
  } catch (error) {
    console.error('Error fetching student detail:', error);
    res.status(500).json({ message: 'Server error fetching student detail' });
  }
});

export default router;
