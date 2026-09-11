import mongoose from 'mongoose';

const courseProgressSchema = new mongoose.Schema({
  courseUserId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'CourseUser',
    index: true,
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    index: true,
  },
  email: {
    type: String,
    required: true,
    lowercase: true,
    trim: true,
    index: true,
  },
  courseId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course',
    required: true,
    index: true,
  },
  lessonId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'CourseLesson',
    required: true,
    index: true,
  },
  isCompleted: {
    type: Boolean,
    default: false,
  },
  lastWatchedPosition: {
    type: Number, // In seconds
    default: 0,
  },
  completedAt: {
    type: Date,
    default: null,
  },
  lastActivityAt: {
    type: Date,
    default: Date.now,
  }
}, { timestamps: true });

courseProgressSchema.index({ email: 1, courseId: 1, lessonId: 1 }, { unique: true });

const CourseProgress = mongoose.model('CourseProgress', courseProgressSchema);
export default CourseProgress;
