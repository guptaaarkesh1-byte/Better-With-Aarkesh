import mongoose from 'mongoose';

const courseLessonSchema = new mongoose.Schema({
  courseId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course',
    required: true,
    index: true,
  },
  moduleId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'CourseModule',
    required: true,
    index: true,
  },
  title: {
    type: String,
    required: true,
    trim: true,
  },
  description: {
    type: String,
    default: '',
  },
  position: {
    type: Number,
    required: true,
    default: 0,
  },
  duration: {
    type: String,
    default: '00:00',
    trim: true,
  },
  isPublished: {
    type: Boolean,
    default: true,
  },
  isFreePreview: {
    type: Boolean,
    default: false,
  },
  // Video Provider & Source
  videoSourceType: {
    type: String,
    enum: ['mux', 'youtube', 'custom'],
    default: 'mux',
  },
  youtubeUrl: {
    type: String,
    default: '',
    trim: true,
  },
  youtubeVideoId: {
    type: String,
    default: '',
    trim: true,
  },
  // Mux Video Metadata
  videoStatus: {
    type: String,
    enum: ['none', 'uploading', 'processing', 'ready', 'errored'],
    default: 'none',
  },
  muxUploadId: {
    type: String,
    default: null,
    index: true,
  },
  muxAssetId: {
    type: String,
    default: null,
    index: true,
  },
  muxPlaybackId: {
    type: String,
    default: null,
  },
  muxDuration: {
    type: Number, // duration in seconds returned from Mux
    default: 0,
  },
  muxResolution: {
    type: String,
    default: '',
  },
  muxAspectRatio: {
    type: String,
    default: '',
  },
  videoReadyAt: {
    type: Date,
    default: null,
  },
  errorMessage: {
    type: String,
    default: '',
  },
  resources: [{
    title: { type: String, trim: true },
    fileUrl: { type: String, trim: true },
  }]
}, { timestamps: true });

courseLessonSchema.index({ moduleId: 1, position: 1 });

const CourseLesson = mongoose.model('CourseLesson', courseLessonSchema);
export default CourseLesson;
