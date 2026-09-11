import express from 'express';
import jwt from 'jsonwebtoken';
import Course from '../models/Course.js';
import CourseModule from '../models/CourseModule.js';
import CourseLesson from '../models/CourseLesson.js';
import CoursePurchase from '../models/CoursePurchase.js';
import CourseProgress from '../models/CourseProgress.js';
import CourseUser from '../models/CourseUser.js';

const router = express.Router();

// Helper to extract authenticated student user from Authorization header
const getAuthenticatedStudent = async (req) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }
  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret_key');
    if (!decoded?.id) return null;

    const courseUser = await CourseUser.findById(decoded.id);
    return courseUser;
  } catch (err) {
    return null;
  }
};

// @desc    Get primary course curriculum
// @route   GET /api/courses/primary/curriculum
router.get('/primary/curriculum', async (req, res) => {
  try {
    const course = await Course.findOne();
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    const modules = await CourseModule.find({ courseId: course._id, isPublished: true }).sort({ position: 1 });
    const lessons = await CourseLesson.find({ courseId: course._id, isPublished: true }).sort({ position: 1 });

    const formattedModules = modules.map((mod) => ({
      _id: mod._id,
      id: mod._id,
      title: mod.title,
      description: mod.description,
      position: mod.position,
      lessons: lessons
        .filter((l) => l.moduleId.toString() === mod._id.toString())
        .map((l) => ({
          _id: l._id,
          id: l._id,
          title: l.title,
          description: l.description,
          duration: l.duration,
          position: l.position,
          isFreePreview: l.isFreePreview,
          videoStatus: l.videoStatus,
          muxPlaybackId: l.muxPlaybackId,
          resources: l.resources || [],
          isCompleted: false,
        })),
    }));

    res.json({ course, modules: formattedModules });
  } catch (error) {
    console.error('Error fetching primary curriculum:', error);
    res.status(500).json({ message: 'Server error fetching curriculum' });
  }
});

// @desc    Get published course by slug with published curriculum outline
// @route   GET /api/courses/published/:slug
router.get('/published/:slug', async (req, res) => {
  try {
    const course = await Course.findOne({
      slug: req.params.slug.toLowerCase(),
      status: 'Published',
    });

    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    const modules = await CourseModule.find({ courseId: course._id, isPublished: true }).sort({ position: 1 });
    const lessons = await CourseLesson.find({ courseId: course._id, isPublished: true })
      .select('title description duration position isFreePreview videoStatus moduleId')
      .sort({ position: 1 });

    const student = await getAuthenticatedStudent(req);
    let isEnrolled = false;

    if (student) {
      if (student.isPurchased) {
        isEnrolled = true;
      } else {
        const purchase = await CoursePurchase.findOne({
          courseId: course._id,
          studentEmail: student.email.toLowerCase(),
          paymentStatus: 'Paid',
          enrollmentStatus: 'Active',
        });
        isEnrolled = !!purchase;
      }
    }

    // Attach lessons to modules
    const curriculum = modules.map((mod) => ({
      _id: mod._id,
      title: mod.title,
      description: mod.description,
      position: mod.position,
      lessons: lessons.filter((l) => l.moduleId.toString() === mod._id.toString()),
    }));

    res.json({
      ...course.toObject(),
      isEnrolled,
      curriculum,
    });
  } catch (error) {
    console.error('Error fetching published course:', error);
    res.status(500).json({ message: 'Server error fetching course' });
  }
});

// @desc    Get full student curriculum with progress and secure video authorization
// @route   GET /api/courses/:courseId/learn
router.get('/:courseId/learn', async (req, res) => {
  try {
    const student = await getAuthenticatedStudent(req);
    if (!student) {
      return res.status(401).json({ message: 'Please log in to access this course.' });
    }

    const course = await Course.findById(req.params.courseId);
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    // Check enrollment
    let isAuthorized = student.isPurchased;
    if (!isAuthorized) {
      const purchase = await CoursePurchase.findOne({
        courseId: course._id,
        studentEmail: student.email.toLowerCase(),
        paymentStatus: 'Paid',
        enrollmentStatus: 'Active',
      });
      isAuthorized = !!purchase;
    }

    if (!isAuthorized) {
      return res.status(403).json({ message: 'You have not purchased this course.' });
    }

    const [modules, lessons, progressRecords] = await Promise.all([
      CourseModule.find({ courseId: course._id, isPublished: true }).sort({ position: 1 }),
      CourseLesson.find({ courseId: course._id, isPublished: true }).sort({ position: 1 }),
      CourseProgress.find({ courseId: course._id, email: student.email.toLowerCase() }),
    ]);

    const progressMap = {};
    progressRecords.forEach((pr) => {
      progressMap[pr.lessonId.toString()] = pr;
    });

    const curriculum = modules.map((mod) => ({
      _id: mod._id,
      title: mod.title,
      description: mod.description,
      position: mod.position,
      lessons: lessons
        .filter((l) => l.moduleId.toString() === mod._id.toString())
        .map((l) => ({
          _id: l._id,
          title: l.title,
          description: l.description,
          duration: l.duration,
          position: l.position,
          isFreePreview: l.isFreePreview,
          videoStatus: l.videoStatus,
          muxPlaybackId: l.muxPlaybackId,
          resources: l.resources || [],
          isCompleted: !!progressMap[l._id.toString()]?.isCompleted,
          lastWatchedPosition: progressMap[l._id.toString()]?.lastWatchedPosition || 0,
        })),
    }));

    const totalLessons = lessons.length;
    const completedLessons = progressRecords.filter((r) => r.isCompleted).length;
    const progressPercent = totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0;

    res.json({
      course: {
        _id: course._id,
        title: course.title,
        slug: course.slug,
        instructor: course.instructor,
        description: course.description,
      },
      curriculum,
      progressPercent,
      completedLessons,
      totalLessons,
    });
  } catch (error) {
    console.error('Error fetching student learning room:', error);
    res.status(500).json({ message: 'Server error loading course' });
  }
});

// @desc    Update student lesson progress
// @route   POST /api/courses/progress
router.post('/progress', async (req, res) => {
  try {
    const student = await getAuthenticatedStudent(req);
    if (!student) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const { courseId, lessonId, isCompleted, lastWatchedPosition } = req.body;
    if (!courseId || !lessonId) {
      return res.status(400).json({ message: 'courseId and lessonId are required' });
    }

    const email = student.email.toLowerCase();

    let progress = await CourseProgress.findOne({ courseId, lessonId, email });
    if (!progress) {
      progress = new CourseProgress({
        courseUserId: student._id,
        email,
        courseId,
        lessonId,
      });
    }

    if (isCompleted !== undefined) {
      progress.isCompleted = isCompleted;
      if (isCompleted && !progress.completedAt) {
        progress.completedAt = new Date();
      } else if (!isCompleted) {
        progress.completedAt = null;
      }
    }

    if (lastWatchedPosition !== undefined) {
      progress.lastWatchedPosition = lastWatchedPosition;
    }

    progress.lastActivityAt = new Date();
    await progress.save();

    res.json({ success: true, progress });
  } catch (error) {
    console.error('Error saving lesson progress:', error);
    res.status(500).json({ message: 'Server error saving progress' });
  }
});

export default router;
