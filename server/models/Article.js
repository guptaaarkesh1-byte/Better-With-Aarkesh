import mongoose from 'mongoose';

const articleSchema = new mongoose.Schema(
  {
    slug: {
      type: String,
      default: '',
      trim: true,
    },
    categoryId: {
      type: String,
      required: true,
      trim: true,
    },
    categoryTitle: {
      type: String,
      default: '',
      trim: true,
    },
    headingId: {
      type: String,
      default: '',
      trim: true,
    },
    headingTitle: {
      type: String,
      default: '',
      trim: true,
    },
    category: {
      type: String,
      default: 'RELATIONSHIPS',
      trim: true,
    },
    categoryNum: {
      type: String,
      default: '01 / 06',
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    subtitle: {
      type: String,
      default: '',
      trim: true,
    },
    description: {
      type: String,
      default: '',
      trim: true,
    },
    quote: {
      type: String,
      default: '',
      trim: true,
    },
    date: {
      type: String,
      default: '',
    },
    readTime: {
      type: String,
      default: '',
      trim: true,
    },
    status: {
      type: String,
      enum: ['Draft', 'Published'],
      default: 'Published',
    },
    image: {
      type: String,
      default: '',
    },
    featuredImage: {
      type: String,
      default: '',
    },
    dropCap: {
      type: String,
      default: 'W',
    },
    dropCapText: {
      type: String,
      default: '',
    },
    paragraphsAfterDropCap: {
      type: [String],
      default: [],
    },
    sections: {
      type: [mongoose.Schema.Types.Mixed],
      default: [],
    },
    blocks: {
      type: [mongoose.Schema.Types.Mixed],
      default: [],
    },
    bodyHtml: {
      type: String,
      default: '',
    },

  },
  {
    timestamps: true,
    strict: false,
  }
);

export default mongoose.model('Article', articleSchema);

