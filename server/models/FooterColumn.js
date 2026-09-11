import mongoose from 'mongoose';

const footerLinkSchema = new mongoose.Schema(
  {
    label: {
      type: String,
      required: true,
      trim: true,
    },
    url: {
      type: String,
      default: '',
      trim: true,
    },
    type: {
      type: String,
      enum: ['internal', 'external', 'document', 'scroll', 'action'],
      default: 'internal',
    },
    documentSlug: {
      type: String,
      default: '',
      trim: true,
    },
    actionType: {
      type: String,
      enum: ['', 'enroll', 'login', 'portal'],
      default: '',
    },
    target: {
      type: String,
      default: '_self',
    },
    order: {
      type: Number,
      default: 0,
    },
  },
  { _id: true }
);

const footerColumnSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    category: {
      type: String,
      enum: ['course', 'coaching'],
      default: 'course',
    },
    order: {
      type: Number,
      default: 0,
    },
    links: [footerLinkSchema],
  },
  {
    timestamps: true,
  }
);

export default mongoose.model('FooterColumn', footerColumnSchema);
