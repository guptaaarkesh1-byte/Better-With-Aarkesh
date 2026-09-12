import express from 'express';
import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';
import Comment from '../models/Comment.js';
import CommentLike from '../models/CommentLike.js';
import CourseUser from '../models/CourseUser.js';
import User from '../models/User.js';

const router = express.Router();

// Helper to sanitize text (strip script tags, dangerous HTML tags)
const sanitizeContent = (str) => {
  if (!str) return '';
  return str
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<[^>]+>/g, '') // strip all raw HTML tags for safe text display
    .trim();
};

// Middleware: Authenticate either Admin, CourseUser, or regular User
const authenticateUser = async (req, res, next) => {
  let token;
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret_key');

      if (decoded && decoded.id) {
        // 1. Check if user is an Admin in User model
        const adminUser = await User.findById(decoded.id).select('-password');
        if (adminUser) {
          const isAdmin = adminUser.isAdmin === true || adminUser.role === 'admin' || adminUser.email === 'admin@betterwithaarkesh.com';
          req.user = {
            _id: adminUser._id,
            fullName: adminUser.fullName || (isAdmin ? 'Administrator' : 'Student'),
            email: adminUser.email,
            isAdmin: isAdmin,
            authorRole: isAdmin ? 'instructor' : 'student',
            authorBadge: isAdmin ? 'COURSE INSTRUCTOR' : '',
            userModel: 'User',
          };
          return next();
        }

        // 2. Check CourseUser (Student)
        const courseUser = await CourseUser.findById(decoded.id).select('-password');
        if (courseUser) {
          req.user = {
            _id: courseUser._id,
            fullName: courseUser.fullName,
            email: courseUser.email,
            isAdmin: false,
            authorRole: 'student',
            authorBadge: '',
            userModel: 'CourseUser',
          };
          return next();
        }

        // 3. Check regular User (Student)
        const generalUser = await User.findById(decoded.id).select('-password');
        if (generalUser) {
          const isGeneralAdmin = generalUser.isAdmin === true || generalUser.role === 'admin' || generalUser.email === 'admin@betterwithaarkesh.com';
          req.user = {
            _id: generalUser._id,
            fullName: generalUser.fullName,
            email: generalUser.email,
            isAdmin: isGeneralAdmin,
            authorRole: isGeneralAdmin ? 'instructor' : 'student',
            authorBadge: isGeneralAdmin ? 'COURSE INSTRUCTOR' : '',
            userModel: 'User',
          };
          return next();
        }
      }

      // 4. Check admin token fallback
      if (decoded && (decoded.email || decoded.role === 'admin' || decoded.isAdmin)) {
        const adminUser = await User.findOne({
          $or: [
            { email: decoded.email || 'admin@betterwithaarkesh.com' },
            { isAdmin: true },
          ],
        }).select('-password');

        req.user = {
          _id: adminUser ? adminUser._id : new mongoose.Types.ObjectId(),
          fullName: adminUser?.fullName || 'Administrator',
          email: adminUser?.email || 'admin@betterwithaarkesh.com',
          isAdmin: true,
          authorRole: 'instructor',
          authorBadge: 'COURSE INSTRUCTOR',
          userModel: 'User',
        };
        return next();
      }

      return res.status(401).json({ message: 'User not found or session expired. Please sign in again.' });
    } catch (err) {
      console.error('Comment Auth Error:', err.message);
      return res.status(401).json({ message: 'Not authorized, token invalid or expired' });
    }
  }

  return res.status(401).json({ message: 'Authentication required to participate in comments.' });
};

// Middleware: Optional auth for public reads
const optionalAuthenticateUser = async (req, res, next) => {
  let token;
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret_key');

      if (decoded && decoded.id) {
        const adminUser = await User.findById(decoded.id).select('-password');
        if (adminUser && adminUser.isAdmin) {
          req.user = {
            _id: adminUser._id,
            fullName: adminUser.fullName || 'Aarkesh (Instructor)',
            email: adminUser.email,
            isAdmin: true,
            authorRole: 'instructor',
            authorBadge: 'COURSE INSTRUCTOR',
            userModel: 'User',
          };
          return next();
        }

        const courseUser = await CourseUser.findById(decoded.id).select('-password');
        if (courseUser) {
          req.user = {
            _id: courseUser._id,
            fullName: courseUser.fullName,
            email: courseUser.email,
            isAdmin: false,
            authorRole: 'student',
            authorBadge: '',
            userModel: 'CourseUser',
          };
          return next();
        }

        const generalUser = await User.findById(decoded.id).select('-password');
        if (generalUser) {
          req.user = {
            _id: generalUser._id,
            fullName: generalUser.fullName,
            email: generalUser.email,
            isAdmin: !!generalUser.isAdmin,
            authorRole: generalUser.isAdmin ? 'instructor' : 'student',
            authorBadge: generalUser.isAdmin ? 'COURSE INSTRUCTOR' : '',
            userModel: 'User',
          };
          return next();
        }
      }
    } catch {
      // Ignore token decode failures for optional auth
    }
  }
  next();
};

// Middleware: Strictly require admin
const requireAdmin = (req, res, next) => {
  if (!req.user || !req.user.isAdmin) {
    return res.status(403).json({ message: 'Admin access required for this action.' });
  }
  next();
};

// @route   GET /api/comments/lesson/:lessonId
// @desc    Get paginated comments with nested replies for a specific lesson
// @access  Public (Optional auth for like states & admin view)
router.get('/lesson/:lessonId', optionalAuthenticateUser, async (req, res) => {
  try {
    const { lessonId } = req.params;
    const page = Math.max(1, parseInt(req.query.page, 10) || 1);
    const limit = Math.min(50, Math.max(1, parseInt(req.query.limit, 10) || 15));
    const skip = (page - 1) * limit;

    const isAdmin = !!req.user?.isAdmin;

    const query = {
      lessonId: lessonId.toString().trim(),
      parentId: null,
      ...(isAdmin ? {} : { status: { $ne: 'hidden' } }),
    };

    let totalLessonComments = 0;
    let topLevelComments = [];
    let totalTopLevel = 0;

    if (isAdmin) {
      [topLevelComments, totalTopLevel, totalLessonComments] = await Promise.all([
        Comment.find(query)
          .sort({ isPinned: -1, createdAt: -1 })
          .skip(skip)
          .limit(limit)
          .lean(),
        Comment.countDocuments(query),
        Comment.countDocuments({ lessonId: lessonId.toString().trim() }),
      ]);
    } else {
      [topLevelComments, totalTopLevel] = await Promise.all([
        Comment.find(query)
          .sort({ isPinned: -1, createdAt: -1 })
          .skip(skip)
          .limit(limit)
          .lean(),
        Comment.countDocuments(query),
      ]);

      // For students: Only count visible top-level comments and replies under active top-level comments
      const activeParents = await Comment.find({
        lessonId: lessonId.toString().trim(),
        parentId: null,
        status: { $ne: 'hidden' },
      }).select('_id').lean();

      const activeParentIds = activeParents.map(p => p._id);
      const visibleRepliesCount = activeParentIds.length > 0
        ? await Comment.countDocuments({
            parentId: { $in: activeParentIds },
            status: { $ne: 'hidden' },
          })
        : 0;

      totalLessonComments = activeParentIds.length + visibleRepliesCount;
    }

    // Fetch all replies for this page of comments
    const topCommentIds = topLevelComments.map((c) => c._id);
    const replies = topCommentIds.length > 0
      ? await Comment.find({
          parentId: { $in: topCommentIds },
          ...(isAdmin ? {} : { status: { $ne: 'hidden' } }),
        })
          .sort({ createdAt: 1 })
          .lean()
      : [];

    // Group replies by parentId
    const repliesMap = {};
    replies.forEach((rep) => {
      const pid = rep.parentId.toString();
      if (!repliesMap[pid]) {
        repliesMap[pid] = [];
      }
      repliesMap[pid].push(rep);
    });

    // Check user liked comments if authenticated
    let userLikedCommentIds = new Set();
    if (req.user) {
      const allCommentIds = [...topCommentIds, ...replies.map((r) => r._id)];
      if (allCommentIds.length > 0) {
        const userLikes = await CommentLike.find({
          commentId: { $in: allCommentIds },
          userId: req.user._id.toString(),
        }).select('commentId');
        userLikedCommentIds = new Set(userLikes.map((l) => l.commentId.toString()));
      }
    }

    // Format top-level comments with replies and hasLiked flag
    const formattedComments = topLevelComments.map((comment) => {
      const commentReplies = (repliesMap[comment._id.toString()] || []).map((reply) => ({
        ...reply,
        hasLiked: userLikedCommentIds.has(reply._id.toString()),
      }));

      return {
        ...comment,
        hasLiked: userLikedCommentIds.has(comment._id.toString()),
        replies: commentReplies,
        replyCount: commentReplies.length,
      };
    });

    const totalPages = Math.ceil(totalTopLevel / limit) || 1;

    res.json({
      comments: formattedComments,
      totalComments: totalLessonComments,
      totalTopLevel,
      page,
      totalPages,
      hasMore: page < totalPages,
      isAdmin,
    });
  } catch (error) {
    console.error('Error fetching comments:', error);
    res.status(500).json({ message: 'Unable to load comments. Please try again.' });
  }
});

// @route   POST /api/comments/lesson/:lessonId
// @desc    Post a new top-level comment (or Question) on a lesson
// @access  Private
router.post('/lesson/:lessonId', authenticateUser, async (req, res) => {
  try {
    const { lessonId } = req.params;
    const { content, type, lessonTitle } = req.body;

    if (!lessonId || !lessonId.trim()) {
      return res.status(400).json({ message: 'Lesson ID is required' });
    }

    const cleanContent = sanitizeContent(content);
    if (!cleanContent) {
      return res.status(400).json({ message: 'Comment content cannot be empty' });
    }

    if (cleanContent.length > 3000) {
      return res.status(400).json({ message: 'Comment exceeds maximum allowed length (3000 characters)' });
    }

    const commentType = type === 'question' ? 'question' : 'comment';
    const isInstructor = req.user.isAdmin;

    const newComment = await Comment.create({
      lessonId: lessonId.toString().trim(),
      lessonTitle: (lessonTitle || '').trim(),
      userId: req.user._id,
      userModel: req.user.userModel,
      userName: req.user.fullName || (isInstructor ? 'Aarkesh (Instructor)' : 'Student'),
      userEmail: req.user.email,
      authorRole: isInstructor ? 'instructor' : 'student',
      authorBadge: isInstructor ? 'COURSE INSTRUCTOR' : '',
      type: commentType,
      isAnswered: false,
      parentId: null,
      content: cleanContent,
      likesCount: 0,
      isEdited: false,
      status: 'active',
      isPinned: false,
    });

    res.status(201).json({
      ...newComment.toObject(),
      hasLiked: false,
      replies: [],
      replyCount: 0,
    });
  } catch (error) {
    console.error('Error posting comment:', error);
    res.status(500).json({ message: 'Failed to post comment. Please try again.' });
  }
});

// @route   POST /api/comments/:commentId/reply
// @desc    Reply to an existing comment (Admin or Student)
// @access  Private
router.post('/:commentId/reply', authenticateUser, async (req, res) => {
  try {
    const { commentId } = req.params;
    const { content } = req.body;

    if (!mongoose.Types.ObjectId.isValid(commentId)) {
      return res.status(400).json({ message: 'Invalid comment ID' });
    }

    const parentComment = await Comment.findById(commentId);
    if (!parentComment || parentComment.status === 'hidden') {
      return res.status(404).json({ message: 'Original comment not found or has been removed' });
    }

    const cleanContent = sanitizeContent(content);
    if (!cleanContent) {
      return res.status(400).json({ message: 'Reply content cannot be empty' });
    }

    if (cleanContent.length > 3000) {
      return res.status(400).json({ message: 'Reply exceeds maximum allowed length (3000 characters)' });
    }

    // If target comment is already a reply, attach to top-level parent to maintain 1-level nesting
    const targetParentId = parentComment.parentId || parentComment._id;
    const isInstructor = req.user.isAdmin;

    const reply = await Comment.create({
      lessonId: parentComment.lessonId,
      lessonTitle: parentComment.lessonTitle,
      userId: req.user._id,
      userModel: req.user.userModel,
      userName: req.user.fullName || (isInstructor ? 'Aarkesh (Instructor)' : 'Student'),
      userEmail: req.user.email,
      authorRole: isInstructor ? 'instructor' : 'student',
      authorBadge: isInstructor ? 'COURSE INSTRUCTOR' : '',
      parentId: targetParentId,
      content: cleanContent,
      likesCount: 0,
      isEdited: false,
      status: 'active',
    });

    // If an instructor replies to a student question, automatically mark the question as answered
    if (isInstructor) {
      await Comment.findByIdAndUpdate(targetParentId, { isAnswered: true });
    }

    res.status(201).json({
      ...reply.toObject(),
      hasLiked: false,
    });
  } catch (error) {
    console.error('Error posting reply:', error);
    res.status(500).json({ message: 'Failed to post reply. Please try again.' });
  }
});

// @route   POST /api/comments/:commentId/pin
// @desc    Toggle pin status of a comment (Admin only)
// @access  Private (Admin)
router.post('/:commentId/pin', authenticateUser, requireAdmin, async (req, res) => {
  try {
    const { commentId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(commentId)) {
      return res.status(400).json({ message: 'Invalid comment ID' });
    }

    const comment = await Comment.findById(commentId);
    if (!comment) {
      return res.status(404).json({ message: 'Comment not found' });
    }

    comment.isPinned = !comment.isPinned;
    await comment.save();

    res.json({
      success: true,
      isPinned: comment.isPinned,
      message: comment.isPinned ? 'Comment pinned to top' : 'Comment unpinned',
    });
  } catch (error) {
    console.error('Error pinning comment:', error);
    res.status(500).json({ message: 'Failed to toggle pin state' });
  }
});

// @route   POST /api/comments/:commentId/hide
// @desc    Hide a comment for moderation (Admin only)
// @access  Private (Admin)
router.post('/:commentId/hide', authenticateUser, requireAdmin, async (req, res) => {
  try {
    const { commentId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(commentId)) {
      return res.status(400).json({ message: 'Invalid comment ID' });
    }

    const comment = await Comment.findById(commentId);
    if (!comment) {
      return res.status(404).json({ message: 'Comment not found' });
    }

    const now = new Date();
    comment.status = 'hidden';
    comment.moderatedAt = now;
    await comment.save();

    // Also cascade hidden status to all replies under this comment
    await Comment.updateMany(
      { parentId: comment._id },
      { status: 'hidden', moderatedAt: now }
    );

    res.json({
      success: true,
      status: 'hidden',
      message: 'Comment is now hidden from students',
    });
  } catch (error) {
    console.error('Error hiding comment:', error);
    res.status(500).json({ message: 'Failed to hide comment' });
  }
});

// @route   POST /api/comments/:commentId/restore
// @desc    Restore a hidden comment (Admin only)
// @access  Private (Admin)
router.post('/:commentId/restore', authenticateUser, requireAdmin, async (req, res) => {
  try {
    const { commentId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(commentId)) {
      return res.status(400).json({ message: 'Invalid comment ID' });
    }

    const comment = await Comment.findById(commentId);
    if (!comment) {
      return res.status(404).json({ message: 'Comment not found' });
    }

    comment.status = 'active';
    comment.moderatedAt = null;
    await comment.save();

    // Also cascade restored status to all replies under this comment
    await Comment.updateMany(
      { parentId: comment._id },
      { status: 'active', moderatedAt: null }
    );

    res.json({
      success: true,
      status: 'active',
      message: 'Comment restored and visible to students',
    });
  } catch (error) {
    console.error('Error restoring comment:', error);
    res.status(500).json({ message: 'Failed to restore comment' });
  }
});

// @route   GET /api/comments/admin/lessons-summary
// @desc    Get comment counts and latest comment timestamps by lessonId for admin notification badges
// @access  Private (Admin)
router.get('/admin/lessons-summary', authenticateUser, requireAdmin, async (req, res) => {
  try {
    const summary = await Comment.aggregate([
      {
        $group: {
          _id: '$lessonId',
          totalComments: { $sum: 1 },
          latestCommentAt: { $max: '$createdAt' },
          studentCommentsCount: {
            $sum: { $cond: [{ $eq: ['$authorRole', 'student'] }, 1, 0] }
          }
        }
      }
    ]);

    const summaryMap = {};
    summary.forEach(item => {
      if (item._id) {
        summaryMap[item._id.toString()] = {
          totalComments: item.totalComments,
          latestCommentAt: item.latestCommentAt,
          studentCommentsCount: item.studentCommentsCount
        };
      }
    });

    res.json({ success: true, summary: summaryMap });
  } catch (error) {
    console.error('Error fetching lessons comment summary:', error);
    res.status(500).json({ message: 'Failed to fetch comment summaries' });
  }
});

// @route   GET /api/comments/admin/all
// @desc    Get all course comments with filters for Admin Dashboard
// @access  Private (Admin)
router.get('/admin/all', authenticateUser, requireAdmin, async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page, 10) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit, 10) || 20));
    const skip = (page - 1) * limit;

    const filter = req.query.filter || 'all';
    const lessonId = req.query.lessonId;
    const search = (req.query.search || '').trim();

    const query = { parentId: null };

    if (lessonId) {
      query.lessonId = lessonId;
    }

    if (filter === 'unanswered') {
      query.type = 'question';
      query.isAnswered = false;
      query.status = { $ne: 'hidden' };
    } else if (filter === 'answered') {
      query.type = 'question';
      query.isAnswered = true;
    } else if (filter === 'pinned') {
      query.isPinned = true;
    } else if (filter === 'hidden') {
      query.status = 'hidden';
    }

    if (search) {
      query.$or = [
        { content: { $regex: search, $options: 'i' } },
        { userName: { $regex: search, $options: 'i' } },
        { userEmail: { $regex: search, $options: 'i' } },
      ];
    }

    const [comments, totalComments, totalUnanswered] = await Promise.all([
      Comment.find(query)
        .sort({ isPinned: -1, createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Comment.countDocuments(query),
      Comment.countDocuments({ type: 'question', isAnswered: false, status: { $ne: 'hidden' } }),
    ]);

    // Fetch replies for each top-level comment
    const topIds = comments.map((c) => c._id);
    const replies = topIds.length > 0
      ? await Comment.find({ parentId: { $in: topIds } }).sort({ createdAt: 1 }).lean()
      : [];

    const repliesMap = {};
    replies.forEach((rep) => {
      const pid = rep.parentId.toString();
      if (!repliesMap[pid]) repliesMap[pid] = [];
      repliesMap[pid].push(rep);
    });

    const formatted = comments.map((c) => ({
      ...c,
      replies: repliesMap[c._id.toString()] || [],
      replyCount: (repliesMap[c._id.toString()] || []).length,
    }));

    res.json({
      comments: formatted,
      totalComments,
      totalUnanswered,
      page,
      totalPages: Math.ceil(totalComments / limit) || 1,
    });
  } catch (error) {
    console.error('Error fetching admin comments:', error);
    res.status(500).json({ message: 'Failed to load comments for admin' });
  }
});

// @route   PATCH /api/comments/:commentId
// @desc    Edit a comment or reply (only by author or admin)
// @access  Private
router.patch('/:commentId', authenticateUser, async (req, res) => {
  try {
    const { commentId } = req.params;
    const { content } = req.body;

    if (!mongoose.Types.ObjectId.isValid(commentId)) {
      return res.status(400).json({ message: 'Invalid comment ID' });
    }

    const comment = await Comment.findById(commentId);
    if (!comment) {
      return res.status(404).json({ message: 'Comment not found' });
    }

    // Ownership check: must be comment author or admin
    const isOwner = comment.userId.toString() === req.user._id.toString();
    if (!isOwner && !req.user.isAdmin) {
      return res.status(403).json({ message: 'You do not have permission to edit this comment' });
    }

    const cleanContent = sanitizeContent(content);
    if (!cleanContent) {
      return res.status(400).json({ message: 'Comment content cannot be empty' });
    }

    if (cleanContent.length > 3000) {
      return res.status(400).json({ message: 'Comment exceeds maximum allowed length' });
    }

    comment.content = cleanContent;
    comment.isEdited = true;
    await comment.save();

    res.json({
      success: true,
      comment: {
        ...comment.toObject(),
      },
    });
  } catch (error) {
    console.error('Error editing comment:', error);
    res.status(500).json({ message: 'Failed to update comment' });
  }
});

// @route   DELETE /api/comments/:commentId
// @desc    Delete a comment and its child replies and likes
// @access  Private
router.delete('/:commentId', authenticateUser, async (req, res) => {
  try {
    const { commentId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(commentId)) {
      return res.status(400).json({ message: 'Invalid comment ID' });
    }

    const comment = await Comment.findById(commentId);
    if (!comment) {
      return res.status(404).json({ message: 'Comment not found' });
    }

    // Ownership check: must be author or admin
    const isOwner = comment.userId.toString() === req.user._id.toString();
    if (!isOwner && !req.user.isAdmin) {
      return res.status(403).json({ message: 'You do not have permission to delete this comment' });
    }

    // Find all reply IDs if this is a parent comment
    const replies = await Comment.find({ parentId: comment._id }).select('_id');
    const commentIdsToDelete = [comment._id, ...replies.map((r) => r._id)];

    // Delete associated likes
    await CommentLike.deleteMany({ commentId: { $in: commentIdsToDelete } });

    // Delete replies and parent comment
    await Comment.deleteMany({ _id: { $in: commentIdsToDelete } });

    res.json({
      success: true,
      message: 'Comment deleted successfully',
      deletedCommentId: commentId,
      deletedReplyIds: replies.map((r) => r._id),
    });
  } catch (error) {
    console.error('Error deleting comment:', error);
    res.status(500).json({ message: 'Failed to delete comment' });
  }
});

// @route   POST /api/comments/:commentId/like
// @desc    Toggle like / unlike on a comment or reply
// @access  Private
router.post('/:commentId/like', authenticateUser, async (req, res) => {
  try {
    const { commentId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(commentId)) {
      return res.status(400).json({ message: 'Invalid comment ID' });
    }

    const comment = await Comment.findById(commentId);
    if (!comment) {
      return res.status(404).json({ message: 'Comment not found' });
    }

    const userIdStr = req.user._id.toString();
    const existingLike = await CommentLike.findOne({
      commentId: comment._id,
      userId: userIdStr,
    });

    if (existingLike) {
      await CommentLike.deleteOne({ _id: existingLike._id });
      const updated = await Comment.findByIdAndUpdate(
        comment._id,
        { $inc: { likesCount: -1 } },
        { returnDocument: 'after' }
      );
      const likesCount = Math.max(0, updated ? updated.likesCount : comment.likesCount - 1);
      if (updated && updated.likesCount < 0) {
        await Comment.findByIdAndUpdate(comment._id, { likesCount: 0 });
      }

      return res.json({
        success: true,
        hasLiked: false,
        likesCount,
      });
    } else {
      await CommentLike.create({
        commentId: comment._id,
        userId: userIdStr,
      });
      const updated = await Comment.findByIdAndUpdate(
        comment._id,
        { $inc: { likesCount: 1 } },
        { returnDocument: 'after' }
      );

      return res.json({
        success: true,
        hasLiked: true,
        likesCount: updated ? updated.likesCount : comment.likesCount + 1,
      });
    }
  } catch (error) {
    if (error.code === 11000) {
      const comment = await Comment.findById(req.params.commentId);
      return res.json({
        success: true,
        hasLiked: true,
        likesCount: comment ? comment.likesCount : 1,
      });
    }
    console.error('Error toggling comment like:', error);
    res.status(500).json({ message: 'Failed to update like status' });
  }
});

export default router;
