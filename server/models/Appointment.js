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
    enum: ['UPCOMING', 'COMPLETED', 'DRAFTS', 'CANCELLED', 'REFUNDED'],
    default: 'UPCOMING',
  },
  duration: {
    type: Number,
  },
  isFirstSession: {
    type: Boolean,
    default: false,
  },
  amount: {
    type: Number,
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
  },
  isFreeSession: {
    type: Boolean,
    default: false,
  },
  freeSessionRefunded: {
    type: Boolean,
    default: false,
  },
  refundStatus: {
    type: String,
    enum: ['NONE', 'PENDING', 'REFUNDED'],
    default: 'NONE',
  },
  refundAmount: {
    type: Number,
    default: 0,
  },
  refundReason: {
    type: String,
    default: '',
  },
  refundedAt: {
    type: Date,
  },
  calBookingUid: {
    type: String,
  },
  meetLink: {
    type: String,
  },
  coachNotes: {
    type: String,
    default: '',
  },
  questionnaireAnswers: {
    type: mongoose.Schema.Types.Mixed,
    default: null,
  },
  rescheduleRequest: {
    date: String,
    time: String,
    reason: String,
    status: {
      type: String,
      enum: ['PENDING', 'APPROVED', 'REJECTED'],
    },
    requestedAt: Date,
    isWithin48Hours: Boolean,
    hoursRemainingAtRequest: Number,
    rescheduleFeePaid: {
      type: Boolean,
      default: false,
    },
    usedFreeSessionCredit: {
      type: Boolean,
      default: false,
    },
    reschedulePaymentId: String,
    rescheduleOrderId: String,
    rescheduleAmount: Number,
    paidAt: Date,
  },
  isArchived: {
    type: Boolean,
    default: false,
  }
}, { timestamps: true });

const Appointment = mongoose.model('Appointment', appointmentSchema);

export default Appointment;
