import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
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
  countryCode: {
    type: String,
  },
  phoneNumber: {
    type: String,
  },
  dob: {
    type: String,
    default: '',
  },
  gender: {
    type: String,
    default: 'Prefer not to say',
  },
  savedArticles: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Article'
  }],
  savedVideos: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Video'
  }],
  completedArticles: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Article'
  }],
  completedVideos: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Video'
  }],
  freeSessions: {
    type: Number,
    default: 0,
  },
  courseSessionsGranted: {
    type: Boolean,
    default: false,
  },
  isAdmin: {
    type: Boolean,
    default: false,
  },
  notificationPreferences: {
    emailReminders: {
      type: Boolean,
      default: true,
    },
    emailChanges: {
      type: Boolean,
      default: true,
    },
  }
}, { timestamps: true });

const User = mongoose.model('User', userSchema);
export default User;
