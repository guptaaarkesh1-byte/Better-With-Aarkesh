import mongoose from 'mongoose';

const courseCardSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
    order: {
      type: Number,
      default: 0,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    icon: {
      type: String,
      default: 'CheckCircle',
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model('CourseCard', courseCardSchema);
