import mongoose from 'mongoose';

const appointmentSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: false,
  },
  date: {
    type: String,
    required: true,
  },
  time: {
    type: String,
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  countryCode: {
    type: String,
  },
  phoneNumber: {
    type: String,
  },
  source: {
    type: String,
  },
  reason: {
    type: String,
  },
  extra: {
    type: String,
  },
  status: {
    type: String,
    enum: ['UPCOMING', 'COMPLETED', 'DRAFTS'],
    default: 'UPCOMING',
  },
  duration: {
    type: Number,
  },
  isFirstSession: {
    type: Boolean,
    default: false,
  },
  paymentId: {
    type: String,
  },
  orderId: {
    type: String,
  },
  signature: {
    type: String,
  },
  paymentStatus: {
    type: String,
    enum: ['Pending', 'Paid', 'Failed'],
    default: 'Pending',
  }
}, { timestamps: true });

const Appointment = mongoose.model('Appointment', appointmentSchema);

export default Appointment;
