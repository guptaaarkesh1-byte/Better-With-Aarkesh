import mongoose from 'mongoose';

const commentLikeSchema = new mongoose.Schema(
  {
    commentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Comment',
      required: true,
      index: true,
    },
    userId: {
      type: String,
      required: true,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

// Prevent duplicate likes by compound unique index
commentLikeSchema.index({ commentId: 1, userId: 1 }, { unique: true });

const CommentLike = mongoose.model('CommentLike', commentLikeSchema);
export default CommentLike;
