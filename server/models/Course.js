import mongoose from 'mongoose';

const courseSchema = new mongoose.Schema({
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
    lowercase: true,
  },
  subtitle: {
    type: String,
    default: '',
    trim: true,
  },
  invoiceItemTitle: {
    type: String,
    default: 'The Better Man™ — Masterclass Lifetime Access',
    trim: true,
  },
  invoiceItemSubtitle: {
    type: String,
    default: 'HD video frameworks, modular curriculum, worksheets & community',
    trim: true,
  },
  bonusItemTitle: {
    type: String,
    default: '3 Private 1-on-1 Executive Coaching Sessions with Aarkesh',
    trim: true,
  },
  bonusItemSubtitle: {
    type: String,
    default: 'Valued at ₹15,000 — 100% Complimentary student bonus',
    trim: true,
  },
  description: {
    type: String,
    default: '',
  },
  thumbnail: {
    type: String,
    default: '',
  },
  price: {
    type: Number,
    required: true,
    default: 15000,
  },
  comparePrice: {
    type: Number,
    default: 25000,
  },
  gstRate: {
    type: Number,
    default: 18,
    min: 0,
    max: 100,
  },
  isGstIncluded: {
    type: Boolean,
    default: false,
  },
  duration: {
    type: String,
    default: '6+ Hours',
    trim: true,
  },
  level: {
    type: String,
    enum: ['All Levels', 'Beginner', 'Intermediate', 'Advanced', 'Masterclass'],
    default: 'All Levels',
  },
  instructor: {
    type: String,
    default: 'Aarkesh Gupta',
    trim: true,
  },
  benefits: [{
    type: String,
    trim: true,
  }],
  whatYouWillLearn: [{
    type: String,
    trim: true,
  }],
  requirements: [{
    type: String,
    trim: true,
  }],
  status: {
    type: String,
    enum: ['Draft', 'Published'],
    default: 'Draft',
  },
  seoTitle: {
    type: String,
    default: '',
    trim: true,
  },
  seoDescription: {
    type: String,
    default: '',
    trim: true,
  },
  order: {
    type: Number,
    default: 0,
  }
}, { timestamps: true });

const Course = mongoose.model('Course', courseSchema);
export default Course;
