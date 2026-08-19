import mongoose from 'mongoose';

const articleSchema = new mongoose.Schema(
  {
    categoryId: {
      type: String,
      required: true,
      trim: true,
    },
    categoryTitle: {
      type: String,
      required: true,
      trim: true,
    },
    headingId: {
      type: String,
      required: true,
      trim: true,
    },
    headingTitle: {
      type: String,
      required: true,
      trim: true,
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
    readTime: {
      type: String,
      default: '',
      trim: true,
    },
    status: {
      type: String,
      enum: ['Draft', 'Published'],
      default: 'Draft',
    },
    featuredImage: {
      type: String,
      default: '',
    },
    bodyHtml: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model('Article', articleSchema);
