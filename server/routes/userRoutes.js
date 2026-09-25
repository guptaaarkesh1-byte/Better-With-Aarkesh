import express from 'express';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { Resend } from 'resend';
import { protect } from '../middleware/authMiddleware.js';
import User from '../models/User.js';
import Article from '../models/Article.js';
import Video from '../models/Video.js';

const router = express.Router();

const generateOTP = () => Math.floor(1000 + Math.random() * 9000).toString();
const deleteAccountOTPs = new Map();

// @route   GET /api/users/saved-articles
// @desc    Get user's saved articles
// @access  Private
router.get('/saved-articles', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate('savedArticles');
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json((user.savedArticles || []).filter(Boolean));
  } catch (error) {
    console.error('Error fetching saved articles:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/users/save-article
// @desc    Toggle saving/unsaving an article
// @access  Private
router.post('/save-article', protect, async (req, res) => {
  try {
    const { articleId, title, category, excerpt, image, slug } = req.body;

    if (!articleId && !title) {
      return res.status(400).json({ message: 'Article ID or Title is required' });
    }

    let targetArticle = null;
    if (articleId && mongoose.isValidObjectId(articleId)) {
      targetArticle = await Article.findById(articleId);
    }
    if (!targetArticle) {
      const searchConditions = [];
      if (articleId && typeof articleId === 'string') {
        searchConditions.push({ slug: articleId }, { title: articleId });
      }
      if (slug) searchConditions.push({ slug });
      if (title) searchConditions.push({ title });

      if (searchConditions.length > 0) {
        targetArticle = await Article.findOne({ $or: searchConditions });
      }
    }

    // Auto-create article in DB if it's a curated/custom article not yet persisted
    if (!targetArticle) {
      targetArticle = await Article.create({
        title: title || (typeof articleId === 'string' ? articleId : 'Curated Article'),
        slug: slug || (typeof articleId === 'string' ? articleId : 'article'),
        category: category || 'RELATIONSHIPS',
        categoryId: (category || 'relationships').toLowerCase(),
        description: excerpt || '',
        featuredImage: image || '/library_preview_silhouette.jpg',
        image: image || '/library_preview_silhouette.jpg',
        status: 'Published'
      });
    }

    const finalId = targetArticle._id;
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (!user.savedArticles) {
      user.savedArticles = [];
    }

    const index = user.savedArticles.findIndex(id => id?.toString() === finalId.toString());

    if (index === -1) {
      user.savedArticles.push(finalId);
    } else {
      user.savedArticles.splice(index, 1);
    }

    await user.save();

    res.json({ 
      message: index === -1 ? 'Article saved successfully' : 'Article removed from saved',
      isSaved: index === -1,
      articleId: finalId,
      savedArticles: user.savedArticles 
    });
  } catch (error) {
    console.error('Error toggling saved article:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/users/completed-articles
// @desc    Get user's completed articles
// @access  Private
router.get('/completed-articles', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate('completedArticles');
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json((user.completedArticles || []).filter(Boolean));
  } catch (error) {
    console.error('Error fetching completed articles:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/users/complete-article
// @desc    Toggle marking an article as complete
// @access  Private
router.post('/complete-article', protect, async (req, res) => {
  try {
    const { articleId, title, category, excerpt, image, slug } = req.body;

    if (!articleId && !title) {
      return res.status(400).json({ message: 'Article ID or Title is required' });
    }

    let targetArticle = null;
    if (articleId && mongoose.isValidObjectId(articleId)) {
      targetArticle = await Article.findById(articleId);
    }
    if (!targetArticle) {
      const searchConditions = [];
      if (articleId && typeof articleId === 'string') {
        searchConditions.push({ slug: articleId }, { title: articleId });
      }
      if (slug) searchConditions.push({ slug });
      if (title) searchConditions.push({ title });

      if (searchConditions.length > 0) {
        targetArticle = await Article.findOne({ $or: searchConditions });
      }
    }

    if (!targetArticle) {
      targetArticle = await Article.create({
        title: title || (typeof articleId === 'string' ? articleId : 'Curated Article'),
        slug: slug || (typeof articleId === 'string' ? articleId : 'article'),
        category: category || 'RELATIONSHIPS',
        categoryId: (category || 'relationships').toLowerCase(),
        description: excerpt || '',
        featuredImage: image || '/library_preview_silhouette.jpg',
        image: image || '/library_preview_silhouette.jpg',
        status: 'Published'
      });
    }

    const finalId = targetArticle._id;
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (!user.completedArticles) {
      user.completedArticles = [];
    }

    const index = user.completedArticles.findIndex(id => id?.toString() === finalId.toString());

    if (index === -1) {
      user.completedArticles.push(finalId);
      if (user.savedArticles) {
        const savedIndex = user.savedArticles.findIndex(id => id?.toString() === finalId.toString());
        if (savedIndex !== -1) {
          user.savedArticles.splice(savedIndex, 1);
        }
      }
    } else {
      user.completedArticles.splice(index, 1);
    }

    await user.save();

    res.json({ 
      message: index === -1 ? 'Article marked as complete' : 'Article marked as incomplete',
      isCompleted: index === -1,
      articleId: finalId,
      completedArticles: user.completedArticles,
      savedArticles: user.savedArticles
    });
  } catch (error) {
    console.error('Error toggling completed article:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/users/saved-videos
// @desc    Get user's saved videos
// @access  Private
router.get('/saved-videos', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate('savedVideos');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json((user.savedVideos || []).filter(Boolean));
  } catch (error) {
    console.error('Error fetching saved videos:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/users/save-video
// @desc    Toggle saving/unsaving a video
// @access  Private
router.post('/save-video', protect, async (req, res) => {
  try {
    const { videoId, title, videoUrl, thumbnailUrl, duration } = req.body;
    if (!videoId && !title) {
      return res.status(400).json({ message: 'Video ID or Title is required' });
    }

    let targetVideo = null;
    if (videoId && mongoose.isValidObjectId(videoId)) {
      targetVideo = await Video.findById(videoId);
    }
    if (!targetVideo) {
      const searchConditions = [];
      if (videoId && typeof videoId === 'string') {
        searchConditions.push({ title: videoId }, { videoUrl: videoId });
      }
      if (title) searchConditions.push({ title });
      if (videoUrl) searchConditions.push({ videoUrl });

      if (searchConditions.length > 0) {
        targetVideo = await Video.findOne({ $or: searchConditions });
      }
    }

    if (!targetVideo) {
      targetVideo = await Video.create({
        title: title || (typeof videoId === 'string' ? videoId : 'Curated Video'),
        videoUrl: videoUrl || '',
        thumbnailUrl: thumbnailUrl || '',
        duration: duration || 'VIDEO',
        status: 'Published'
      });
    }

    const finalId = targetVideo._id;
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (!user.savedVideos) {
      user.savedVideos = [];
    }

    const index = user.savedVideos.findIndex(id => id?.toString() === finalId.toString());
    if (index === -1) {
      user.savedVideos.push(finalId);
    } else {
      user.savedVideos.splice(index, 1);
    }

    await user.save();

    res.json({ 
      message: index === -1 ? 'Video saved successfully' : 'Video removed from saved',
      isSaved: index === -1,
      videoId: finalId,
      savedVideos: user.savedVideos 
    });
  } catch (error) {
    console.error('Error toggling saved video:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/users/completed-videos
// @desc    Get user's completed videos
// @access  Private
router.get('/completed-videos', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate('completedVideos');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json((user.completedVideos || []).filter(Boolean));
  } catch (error) {
    console.error('Error fetching completed videos:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/users/complete-video
// @desc    Toggle marking a video as completed
// @access  Private
router.post('/complete-video', protect, async (req, res) => {
  try {
    const { videoId, title, videoUrl, thumbnailUrl, duration } = req.body;
    if (!videoId && !title) {
      return res.status(400).json({ message: 'Video ID or Title is required' });
    }

    let targetVideo = null;
    if (videoId && mongoose.isValidObjectId(videoId)) {
      targetVideo = await Video.findById(videoId);
    }
    if (!targetVideo) {
      const searchConditions = [];
      if (videoId && typeof videoId === 'string') {
        searchConditions.push({ title: videoId }, { videoUrl: videoId });
      }
      if (title) searchConditions.push({ title });
      if (videoUrl) searchConditions.push({ videoUrl });

      if (searchConditions.length > 0) {
        targetVideo = await Video.findOne({ $or: searchConditions });
      }
    }

    if (!targetVideo) {
      targetVideo = await Video.create({
        title: title || (typeof videoId === 'string' ? videoId : 'Curated Video'),
        videoUrl: videoUrl || '',
        thumbnailUrl: thumbnailUrl || '',
        duration: duration || 'VIDEO',
        status: 'Published'
      });
    }

    const finalId = targetVideo._id;
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (!user.completedVideos) {
      user.completedVideos = [];
    }

    const index = user.completedVideos.findIndex(id => id?.toString() === finalId.toString());
    if (index === -1) {
      user.completedVideos.push(finalId);
      if (user.savedVideos) {
        const savedIndex = user.savedVideos.findIndex(id => id?.toString() === finalId.toString());
        if (savedIndex !== -1) {
          user.savedVideos.splice(savedIndex, 1);
        }
      }
    } else {
      user.completedVideos.splice(index, 1);
    }

    await user.save();

    res.json({ 
      message: index === -1 ? 'Video marked as watched' : 'Video unmarked as watched',
      isCompleted: index === -1,
      videoId: finalId,
      completedVideos: user.completedVideos,
      savedVideos: user.savedVideos
    });
  } catch (error) {
    console.error('Error toggling completed video:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/users/change-password
// @desc    Change user password
// @access  Private
router.post('/change-password', protect, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Verify current password
    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Incorrect current password' });
    }

    // Validate new password
    if (!newPassword || newPassword.length < 6) {
      return res.status(400).json({ message: 'New password must be at least 6 characters long' });
    }

    // Hash new password
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);
    await user.save();

    res.json({ message: 'Password updated successfully' });
  } catch (error) {
    console.error('Error changing password:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/users/preferences
// @desc    Get user's notification preferences
// @access  Private
router.get('/preferences', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('notificationPreferences');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(user.notificationPreferences || { emailReminders: true, emailChanges: true });
  } catch (error) {
    console.error('Error fetching preferences:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/users/preferences
// @desc    Update user's notification preferences
// @access  Private
router.put('/preferences', protect, async (req, res) => {
  try {
    const { emailReminders, emailChanges } = req.body;
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.notificationPreferences = {
      emailReminders: typeof emailReminders === 'boolean' ? emailReminders : true,
      emailChanges: typeof emailChanges === 'boolean' ? emailChanges : true,
    };

    await user.save();
    res.json({ message: 'Preferences saved successfully', notificationPreferences: user.notificationPreferences });
  } catch (error) {
    console.error('Error saving preferences:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/users/delete-account-init
// @desc    Initiate account deletion and send OTP to user's registered email
// @access  Private
router.post('/delete-account-init', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const otp = generateOTP();
    const userIdStr = user._id.toString();
    const cleanEmail = (user.email || '').trim().toLowerCase();

    deleteAccountOTPs.set(userIdStr, {
      otp,
      expires: Date.now() + 10 * 60 * 1000
    });

    console.log(`\n========================================`);
    console.log(`⚠️ [DELETE ACCOUNT OTP] ${cleanEmail} -> OTP: ${otp}`);
    console.log(`========================================\n`);

    try {
      if (process.env.RESEND_API_KEY && cleanEmail) {
        const resend = new Resend(process.env.RESEND_API_KEY);
        const emailHtmlTemplate = `
          <table width="100%" bgcolor="#090909" cellpadding="0" cellspacing="0" style="background-color: #090909; margin: 0; padding: 40px 0; width: 100%;">
            <tr>
              <td align="center">
                <div style="font-family: 'Inter', Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #090909; color: #B8B1A7; text-align: left;">
                  <div style="border: 1px solid #333333; border-radius: 10px; background-color: #111111; padding: 30px;">
                    <h2 style="color: #ef4444; text-align: center; margin-bottom: 20px;">Account Deletion Request</h2>
                    <p style="font-size: 16px; line-height: 1.5;">Hi ${user.fullName || 'there'},</p>
                    <p style="font-size: 16px; line-height: 1.5;">We received a request to permanently delete your Better With Aarkesh account. To confirm this action, please enter the following verification code:</p>
                    <div style="text-align: center; margin: 30px 0;">
                      <span style="display: inline-block; font-size: 32px; font-weight: bold; color: #ffffff; background-color: #7f1d1d; padding: 12px 28px; border-radius: 6px; letter-spacing: 6px;">${otp}</span>
                    </div>
                    <p style="font-size: 14px; text-align: center; color: #ef4444;">Warning: This action will deactivate your account and sessions access.</p>
                    <p style="font-size: 13px; text-align: center; color: #888888; margin-top: 20px;">This code is valid for 10 minutes. If you did not request this, please change your password immediately.</p>
                  </div>
                </div>
              </td>
            </tr>
          </table>
        `;

        const { data, error } = await resend.emails.send({
          from: process.env.EMAIL_FROM || 'Better With Aarkesh <support@yashrajtech.online>',
          to: cleanEmail,
          subject: 'Security Verification: OTP to Delete Your Account',
          html: emailHtmlTemplate,
        });

        if (error) {
          console.warn('⚠️ Resend Warning:', error.message || error);
        } else {
          console.log(`✅ Delete OTP email sent via Resend to ${cleanEmail}:`, data);
        }
      }

      res.json({ message: 'OTP sent to your registered email' });
    } catch (emailError) {
      console.warn('⚠️ Email send exception:', emailError.message);
      res.json({ message: 'OTP generated', devOtp: process.env.NODE_ENV !== 'production' ? otp : undefined });
    }
  } catch (error) {
    console.error('Delete Account Init Error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/users/delete-account-verify
// @desc    Verify OTP and soft-delete user account
// @access  Private
router.post('/delete-account-verify', protect, async (req, res) => {
  try {
    const { otp } = req.body;
    const userIdStr = req.user._id.toString();

    const storedData = deleteAccountOTPs.get(userIdStr);
    if (!storedData) {
      return res.status(400).json({ message: 'Session expired or OTP not requested. Please request a new OTP.' });
    }

    if (storedData.expires < Date.now()) {
      deleteAccountOTPs.delete(userIdStr);
      return res.status(400).json({ message: 'OTP expired. Please request a new code.' });
    }

    if (storedData.otp !== (otp || '').trim()) {
      return res.status(400).json({ message: 'Invalid OTP. Please check the code and try again.' });
    }

    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Soft delete: Keep record in DB for admin records with isDeleted flag
    user.isDeleted = true;
    user.deletedAt = new Date();
    await user.save();

    deleteAccountOTPs.delete(userIdStr);

    res.json({ message: 'Your account has been deleted successfully.' });
  } catch (error) {
    console.error('Delete Account Verify Error:', error);
    res.status(500).json({ message: 'Server error deleting account' });
  }
});

export default router;
