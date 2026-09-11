import mongoose from 'mongoose';

const courseModuleSchema = new mongoose.Schema({
  courseId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course',
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
    trim: true,
  },
  position: {
    type: Number,
    required: true,
    default: 0,
  },
  isPublished: {
    type: Boolean,
    default: true,
  }
}, { timestamps: true });

courseModuleSchema.index({ courseId: 1, position: 1 });

const CourseModule = mongoose.model('CourseModule', courseModuleSchema);
export default CourseModule;
