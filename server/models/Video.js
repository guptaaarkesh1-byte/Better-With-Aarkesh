import mongoose from 'mongoose';

const videoSchema = mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },

    videoUrl: {
      type: String,
      required: true,
    },
    thumbnailUrl: {
      type: String,
      required: true,
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
