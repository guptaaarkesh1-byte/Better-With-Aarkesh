import mongoose from 'mongoose';

const videoSchema = mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },

    videoUrl: {
      type: String,
      default: '',
    },
    thumbnailUrl: {
      type: String,
      default: '',
    },
    description: {
      type: String,
      default: '',
    },
    duration: {
      type: String,
      default: '',
    },
    streamUid: {
      type: String,
      default: '',
    },
    muxUploadId: {
      type: String,
      default: '',
    },
    muxAssetId: {
      type: String,
      default: '',
    },
    muxPlaybackId: {
      type: String,
      default: '',
    },

    status: {
      type: String,
      enum: ['Draft', 'Published'],
      default: 'Draft',
    }
  },
  {
    timestamps: true,
  }
);

const Video = mongoose.model('Video', videoSchema);

export default Video;
