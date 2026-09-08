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
  }
}, { timestamps: true });

const CourseUser = mongoose.model('CourseUser', courseUserSchema);
export default CourseUser;
