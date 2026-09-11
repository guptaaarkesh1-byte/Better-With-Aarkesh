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
    default: null,
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
