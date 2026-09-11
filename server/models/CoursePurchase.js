import mongoose from 'mongoose';

const coursePurchaseSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  courseUserId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'CourseUser',
  },
  courseId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course',
    required: true,
    index: true,
  },
  studentName: {
    type: String,
    required: true,
    trim: true,
  },
  studentEmail: {
    type: String,
    required: true,
    trim: true,
    lowercase: true,
    index: true,
  },
  amount: {
    type: Number,
    required: true,
  },
  currency: {
    type: String,
    default: 'INR',
  },
  paymentStatus: {
    type: String,
    enum: ['Paid', 'Refunded', 'Failed', 'Pending'],
    default: 'Paid',
    index: true,
  },
  enrollmentStatus: {
    type: String,
    enum: ['Active', 'Suspended', 'Revoked', 'Completed'],
    default: 'Active',
    index: true,
  },
  transactionId: {
    type: String,
    required: true,
    index: true,
  },
  razorpayOrderId: {
    type: String,
  },
  razorpayPaymentId: {
    type: String,
  },
  purchaseDate: {
    type: Date,
    default: Date.now,
    index: true,
  },
}, { timestamps: true });

const CoursePurchase = mongoose.model('CoursePurchase', coursePurchaseSchema);
export default CoursePurchase;
