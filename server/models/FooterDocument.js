import mongoose from 'mongoose';

const footerDocumentSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    columnHeading: {
      type: String,
      default: 'LEGAL',
      trim: true,
    },
    contentHtml: {
      type: String,
      default: '',
    },
    status: {
      type: String,
      enum: ['Draft', 'Published'],
      default: 'Draft',
    },
    category: {
      type: String,
      enum: ['coaching', 'course'],
      default: 'coaching',
    },
    order: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model('FooterDocument', footerDocumentSchema);
