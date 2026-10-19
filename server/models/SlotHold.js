import mongoose from 'mongoose';

const slotHoldSchema = new mongoose.Schema({
  // The normalized YYYY-MM-DD date string (e.g. '2026-10-29')
  dateKey: {
    type: String,
    required: true,
    index: true,
  },
  // The human-readable formatted date string (e.g. 'Thursday, October 29, 2026')
  displayDate: {
    type: String,
    required: false,
  },
  // The 12-hour formatted time string (e.g. '10:00 AM')
  time: {
    type: String,
    required: true,
    index: true,
  },
  // Unique client session/draft ID (bwa_booking_draft_id)
  holderId: {
    type: String,
    required: true,
    index: true,
  },
  // User email if available
  email: {
    type: String,
    required: false,
  },
  // Status: 'HELD' | 'BOOKED' | 'RELEASED'
  status: {
    type: String,
    enum: ['HELD', 'BOOKED', 'RELEASED'],
    default: 'HELD',
    index: true,
  },
  // Auto-expiry timestamp (MongoDB TTL index: automatically deletes document when expiresAt is reached)
  expiresAt: {
    type: Date,
    required: true,
    index: { expires: 0 },
  },
}, { timestamps: true });

// Compound index for instant conflict detection and cleanup
slotHoldSchema.index({ dateKey: 1, time: 1, status: 1 });
slotHoldSchema.index({ holderId: 1, status: 1 });

const SlotHold = mongoose.model('SlotHold', slotHoldSchema);
export default SlotHold;
