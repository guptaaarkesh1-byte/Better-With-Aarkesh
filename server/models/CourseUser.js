import mongoose from 'mongoose';

const courseUserSchema = new mongoose.Schema({
  fullName: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  phoneNumber: {
    type: String,
  },
  isPurchased: {
    type: Boolean,
    default: false,
  },
  purchasedCourses: {
    type: [String],
    default: [],
  },
  freeSessions: {
    type: Number,
    default: 0,
  },
  authProvider: {
    type: String,
    default: 'local', // 'local' | 'google'
  },
  googleId: {
    type: String,
    default: '',
  },
  photoUrl: {
    type: String,
    default: '',
  },
}, { timestamps: true });

const CourseUser = mongoose.model('CourseUser', courseUserSchema);
export default CourseUser;
