import express from 'express';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { Resend } from 'resend';
import { protect } from '../middleware/authMiddleware.js';
import User from '../models/User.js';
import Article from '../models/Article.js';
import Video from '../models/Video.js';
import Appointment from '../models/Appointment.js';
import Note from '../models/Note.js';
import PastClient from '../models/PastClient.js';
import CourseUser from '../models/CourseUser.js';

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
          <!DOCTYPE html>
          <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Account Deletion Request</title>
          </head>
          <body style="margin: 0; padding: 0; background-color: #FAF8F5; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #333333;">
            <table width="100%" bgcolor="#FAF8F5" cellpadding="0" cellspacing="0" style="width: 100%; background-color: #FAF8F5; padding: 30px 15px;">
              <tr>
                <td align="center">
                  <table width="100%" cellpadding="0" cellspacing="0" style="max-width: 580px; width: 100%; background-color: #FFFFFF; border: 1px solid #EAE3D9; border-radius: 16px; overflow: hidden; box-shadow: 0 12px 36px rgba(40, 30, 20, 0.05);">
                    
                    <!-- Brand Header -->
                    <tr>
                      <td style="padding: 32px 36px 22px; background: #FAF7F2; border-bottom: 1px solid #EAE3D9;">
                        <table width="100%" cellpadding="0" cellspacing="0">
                          <tr>
                            <td>
                              <div style="font-size: 22px; font-weight: bold; color: #1A1A1A; letter-spacing: -0.5px; font-family: Georgia, serif;">
                                BetterWith<span style="color: #C25E38;">Aarkesh</span>
                              </div>
                              <div style="font-size: 11px; color: #dc2626; text-transform: uppercase; letter-spacing: 2px; margin-top: 4px; font-weight: 600;">
                                Security Verification
                              </div>
                            </td>
                            <td align="right">
                              <span style="display: inline-block; padding: 5px 12px; background-color: rgba(220, 38, 38, 0.08); border: 1px solid rgba(220, 38, 38, 0.3); color: #dc2626; font-size: 11px; font-weight: bold; text-transform: uppercase; letter-spacing: 1px; border-radius: 6px;">
                                ACCOUNT DELETION
                              </span>
                            </td>
                          </tr>
                        </table>
                      </td>
                    </tr>

                    <!-- Main Content -->
                    <tr>
                      <td style="padding: 32px 36px 28px;">
                        <h2 style="margin: 0 0 10px; font-size: 20px; color: #1A1A1A; font-weight: 600;">
                          Account Deletion Request
                        </h2>
                        <p style="margin: 0 0 16px; font-size: 14px; color: #555555; line-height: 1.6;">
                          Hi ${user.fullName || 'there'}, we received a request to permanently delete your Better With Aarkesh account. To confirm this action, please enter the following verification code:
                        </p>

                        <!-- OTP Display Box -->
                        <div style="text-align: center; margin: 30px 0 28px;">
                          <div style="display: inline-block; background-color: #FEF2F2; border: 1.5px solid #dc2626; padding: 14px 34px; border-radius: 12px; box-shadow: 0 6px 18px rgba(220, 38, 38, 0.12);">
                            <span style="font-size: 32px; font-weight: 800; color: #dc2626; letter-spacing: 8px; font-family: monospace;">${otp}</span>
                          </div>
                        </div>

                        <div style="background-color: #FEF2F2; border: 1px solid #FCA5A5; border-radius: 10px; padding: 14px 18px; text-align: center;">
                          <p style="margin: 0; font-size: 12px; color: #991B1B; line-height: 1.5;">
                            ⚠️ <strong>Warning:</strong> This action will deactivate your account and sessions access. This OTP is valid for 10 minutes.
                          </p>
                        </div>
                      </td>
                    </tr>

                    <!-- Footer -->
                    <tr>
                      <td style="padding: 20px 36px; background-color: #FAF7F2; border-top: 1px solid #EAE3D9; text-align: center; font-size: 11px; color: #777777; line-height: 1.5;">
                        <div>Better With Aarkesh · Executive Leadership &amp; Gravitas Coaching</div>
                        <div>For assistance, contact <a href="mailto:coaching@aarkeshgupta.com" style="color: #C25E38; text-decoration: none;">coaching@aarkeshgupta.com</a></div>
                      </td>
                    </tr>

                  </table>
                </td>
              </tr>
            </table>
          </body>
          </html>
        `;

        const { data, error } = await resend.emails.send({
          from: process.env.EMAIL_FROM || 'Better With Aarkesh <noreply@aarkeshgupta.com>',
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

    const cleanEmail = (user.email || '').trim().toLowerCase();

    // 1. Record in PastClient to remember user has booked before (90m for returning)
    if (cleanEmail) {
      await PastClient.findOneAndUpdate(
        { email: cleanEmail },
        { email: cleanEmail, phoneNumber: user.phoneNumber },
        { upsert: true }
      );
    }

    // 2. Delete all user notes
    await Note.deleteMany({ user: user._id });

    // 3. Clear and remove past appointment history from DB
    if (cleanEmail) {
      const escapedEmail = cleanEmail.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      await Appointment.deleteMany({
        $or: [
          { userId: user._id },
          { email: new RegExp(`^${escapedEmail}$`, 'i') }
        ]
      });
    } else {
      await Appointment.deleteMany({ userId: user._id });
    }

    // 4. Clear saved and completed lists and mark user as deleted
    user.savedArticles = [];
    user.savedVideos = [];
    user.completedArticles = [];
    user.completedVideos = [];
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

// @route   GET /api/users/profile
// @desc    Get user profile details
// @access  Private
router.get('/profile', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Also check CourseUser if phone is missing in User model
    let phoneNumber = user.phoneNumber || '';
    let countryCode = user.countryCode || '+91';

    if (!phoneNumber && user.email) {
      const emailRegex = new RegExp(`^${user.email.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i');
      const courseUser = await CourseUser.findOne({ email: emailRegex });
      if (courseUser && courseUser.phoneNumber) {
        phoneNumber = courseUser.phoneNumber;
      }
    }

    res.json({
      _id: user._id,
      fullName: user.fullName || '',
      email: user.email || '',
      countryCode: countryCode,
      phoneNumber: phoneNumber,
      dob: user.dob || '',
      gender: user.gender || 'Prefer not to say',
      freeSessions: user.freeSessions || 0,
      courseSessionsGranted: user.courseSessionsGranted || false,
    });
  } catch (error) {
    console.error('Fetch Profile Error:', error);
    res.status(500).json({ message: 'Server error fetching profile' });
  }
});

// @route   PUT /api/users/profile
// @desc    Update user profile details (name, phone, dob, gender)
// @access  Private
router.put('/profile', protect, async (req, res) => {
  try {
    const { fullName, countryCode, phoneNumber, dob, gender } = req.body;
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (fullName && typeof fullName === 'string' && fullName.trim()) {
      user.fullName = fullName.trim();
    }

    if (countryCode !== undefined) {
      user.countryCode = String(countryCode || '+91').trim();
    }

    if (phoneNumber !== undefined) {
      // Clean phone number (strip redundant country code if prefixed)
      let cleanedPhone = String(phoneNumber || '').trim();
      if (cleanedPhone.startsWith('+91')) {
        cleanedPhone = cleanedPhone.replace(/^\+91\s*/, '').trim();
      }
      user.phoneNumber = cleanedPhone;
    }

    if (dob !== undefined) {
      user.dob = String(dob || '').trim();
    }

    if (gender !== undefined) {
      user.gender = String(gender || 'Prefer not to say').trim();
    }

    await user.save();

    // Also sync to CourseUser if exists
    if (user.email) {
      const emailRegex = new RegExp(`^${user.email.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i');
      await CourseUser.updateMany(
        { email: emailRegex },
        { 
          $set: { 
            fullName: user.fullName,
            phoneNumber: user.phoneNumber 
          } 
        }
      );
    }

    res.json({
      message: 'Profile updated successfully',
      user: {
        _id: user._id,
        fullName: user.fullName,
        email: user.email,
        countryCode: user.countryCode,
        phoneNumber: user.phoneNumber,
        dob: user.dob,
        gender: user.gender,
        freeSessions: user.freeSessions || 0,
        courseSessionsGranted: user.courseSessionsGranted || false,
      }
    });
  } catch (error) {
    console.error('Update Profile Error:', error);
    res.status(500).json({ message: 'Server error updating profile' });
  }
});

export default router;
