import mongoose from 'mongoose';

const commentSchema = new mongoose.Schema(
  {
    lessonId: {
      type: String,
      required: [true, 'Lesson ID is required'],
      index: true,
      trim: true,
    },
    lessonTitle: {
      type: String,
      default: '',
      trim: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      required: [true, 'User ID is required'],
      index: true,
    },
    userModel: {
      type: String,
      enum: ['CourseUser', 'User'],
      default: 'CourseUser',
    },
    userName: {
      type: String,
      required: [true, 'User name is required'],
      trim: true,
      maxlength: 120,
    },
    userEmail: {
      type: String,
      trim: true,
      lowercase: true,
    },
    userAvatar: {
      type: String,
      default: '',
    },
    authorRole: {
      type: String,
      enum: ['student', 'admin', 'instructor'],
      default: 'student',
      index: true,
    },
    authorBadge: {
      type: String,
      default: '',
    },
    type: {
      type: String,
      enum: ['comment', 'question'],
      default: 'comment',
      index: true,
    },
    isAnswered: {
      type: Boolean,
      default: false,
      index: true,
    },
    parentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Comment',
      default: null,
      index: true,
    },
    content: {
      type: String,
      required: [true, 'Comment content cannot be empty'],
      trim: true,
      maxlength: [3000, 'Comment cannot exceed 3000 characters'],
    },
    likesCount: {
      type: Number,
      default: 0,
      min: 0,
    },
    isEdited: {
      type: Boolean,
      default: false,
    },
    status: {
      type: String,
      enum: ['active', 'hidden', 'flagged'],
      default: 'active',
      index: true,
    },
    isPinned: {
      type: Boolean,
      default: false,
      index: true,
    },
    moderatedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for fast lookup of top-level comments and replies
commentSchema.index({ lessonId: 1, parentId: 1, isPinned: -1, createdAt: -1 });
commentSchema.index({ lessonId: 1, status: 1, createdAt: -1 });
commentSchema.index({ parentId: 1, createdAt: 1 });
commentSchema.index({ type: 1, isAnswered: 1, createdAt: -1 });

const Comment = mongoose.model('Comment', commentSchema);
export default Comment;
