import mongoose from 'mongoose';

const packageSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: false,
    index: true,
  },
  clientName: {
    type: String,
    required: true,
    trim: true,
  },
  clientEmail: {
    type: String,
    required: true,
    lowercase: true,
    trim: true,
    index: true,
  },
  countryCode: {
    type: String,
    default: '+91',
  },
  phoneNumber: {
    type: String,
    default: '',
    trim: true,
  },

  // Package configuration
  totalSessions: {
    type: Number,
    required: true,
  },
  bookedSessionsCount: {
    type: Number,
    default: 1,
  },
  creditsRemaining: {
    type: Number,
    default: 0,
  },
  sessionDuration: {
    type: Number,
    default: 90,
  },
  isFirstSession: {
    type: Boolean,
    default: false,
  },
  pricePerSession: {
    type: Number,
    required: true,
  },
  discountPercentage: {
    type: Number,
    default: 0,
  },
  discountAmount: {
    type: Number,
    default: 0,
  },
  totalAmount: {
    type: Number,
    required: true,
  },
  couponCode: {
    type: String,
    default: '',
  },

  // Payment fields
  orderId: {
    type: String,
    required: true,
    index: true,
  },
  paymentId: {
    type: String,
    index: true,
  },
  signature: {
    type: String,
  },
  paymentStatus: {
    type: String,
    enum: ['Pending', 'Paid', 'Failed', 'Refunded'],
    default: 'Pending',
    index: true,
  },

  // Package lifecycle status
  status: {
    type: String,
    enum: ['ACTIVE', 'COMPLETED', 'CANCELLED'],
    default: 'ACTIVE',
    index: true,
  },

  // Digital Agreement (One agreement covers the full package)
  agreementStatus: {
    type: String,
    enum: ['pending', 'sent', 'accepted', 'expired'],
    default: 'pending',
    index: true,
  },
  agreementToken: {
    type: String,
    index: true,
    default: null,
  },
  agreementTokenExpiresAt: {
    type: Date,
    default: null,
  },
  agreementSentAt: {
    type: Date,
    default: null,
  },
  agreementAcceptedAt: {
    type: Date,
    default: null,
  },
  agreementAcceptedIp: {
    type: String,
    default: '',
  },
  agreementAcceptedUserAgent: {
    type: String,
    default: '',
  },
  agreementSnapshot: {
    type: mongoose.Schema.Types.Mixed,
    default: null,
  },
  agreementPdfUrl: {
    type: String,
    default: '',
  },
  agreementData: {
    modeOfCoaching: {
      type: String,
      default: 'Online Video (Google Meet)',
    },
    betweenSessionSupport: {
      type: String,
      default: '',
    },
    additionalAgreedTerms: {
      type: String,
      default: '',
    },
  },

  // Client Details & Questionnaire
  source: {
    type: String,
    default: '',
  },
  reason: {
    type: String,
    default: '',
  },
  extra: {
    type: String,
    default: '',
  },
  questionnaireAnswers: {
    type: mongoose.Schema.Types.Mixed,
    default: null,
  },
  bookingDraftId: {
    type: String,
    default: null,
    index: true,
  },

  isArchived: {
    type: Boolean,
    default: false,
  },
}, { timestamps: true });

const Package = mongoose.model('Package', packageSchema);

export default Package;
