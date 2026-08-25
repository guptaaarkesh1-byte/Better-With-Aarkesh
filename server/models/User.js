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
  completedArticles: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Article'
  }],
  isAdmin: {
    type: Boolean,
    default: false,
  }
}, { timestamps: true });

const User = mongoose.model('User', userSchema);
export default User;
