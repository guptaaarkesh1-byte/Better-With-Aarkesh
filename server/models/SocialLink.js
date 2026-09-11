import mongoose from 'mongoose';

const socialLinkSchema = new mongoose.Schema(
  {
    platform: {
      type: String,
      required: true,
      trim: true,
      enum: ['instagram', 'youtube', 'x', 'linkedin', 'facebook', 'spotify', 'discord', 'tiktok', 'other'],
      default: 'instagram',
    },
    label: {
      type: String,
      required: true,
      trim: true,
    },
    url: {
      type: String,
      required: true,
      trim: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    order: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model('SocialLink', socialLinkSchema);
