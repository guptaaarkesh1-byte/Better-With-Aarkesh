import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { Resend } from 'resend';
import User from '../models/User.js';
import CourseUser from '../models/CourseUser.js';
import CoursePurchase from '../models/CoursePurchase.js';
import Appointment from '../models/Appointment.js';
import Note from '../models/Note.js';
import PastClient from '../models/PastClient.js';
import { protect, admin } from '../middleware/authMiddleware.js';

const router = express.Router();

const generateOTP = () => Math.floor(1000 + Math.random() * 9000).toString();

// Generate JWT
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'fallback_secret_key', {
    expiresIn: '30d',
  });
};

// In-memory store for pending registrations (OTP mock)
const pendingRegistrations = new Map();

// In-memory store for pending password resets (OTP mock)
const pendingPasswordResets = new Map();

// @route   POST /api/auth/register-init
// @desc    Initiate registration and send OTP
// @access  Public
router.post('/register-init', async (req, res) => {
  try {
    const { fullName, email, password, countryCode, phoneNumber } = req.body;
    if (!email) {
      return res.status(400).json({ message: 'Email is required' });
    }
    const cleanEmail = email.trim().toLowerCase();
    const emailRegex = new RegExp(`^${cleanEmail.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i');

    // Check if active user exists
    const userExists = await User.findOne({ email: emailRegex });

    if (userExists && !userExists.isDeleted) {
      // Check if this is a course purchaser — redirect to login instead of blocking
      const courseUser = await CourseUser.findOne({ email: emailRegex, isPurchased: true });
      if (courseUser) {
        if (!userExists.courseSessionsGranted) {
          userExists.freeSessions = 3;
          userExists.courseSessionsGranted = true;
          await userExists.save();
        }
        return res.status(409).json({
          message: 'A booking account already exists for this email. Please sign in to access your 3 free sessions.',
          redirectToLogin: true
        });
      }
      return res.status(400).json({ message: 'Email ID already exists. Use a different one.' });
    }

    // Generate 6-digit OTP
    const otp = generateOTP();
    
    // Store in memory for 10 minutes
    pendingRegistrations.set(cleanEmail, {
      fullName,
      email: cleanEmail,
      password,
      countryCode,
      phoneNumber,
      otp,
      expires: Date.now() + 10 * 60 * 1000
    });

    console.log(`\n========================================`);
    console.log(`🔑 [USER REGISTRATION OTP] ${cleanEmail} -> OTP: ${otp}`);
    console.log(`========================================\n`);

    try {
      const resend = new Resend(process.env.RESEND_API_KEY);
      
      const emailHtmlTemplate = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Verify Your Email</title>
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
                            <div style="font-size: 11px; color: #C25E38; text-transform: uppercase; letter-spacing: 2px; margin-top: 4px; font-weight: 600;">
                              Executive Coaching Portal
                            </div>
                          </td>
                          <td align="right">
                            <span style="display: inline-block; padding: 5px 12px; background-color: rgba(194, 94, 56, 0.1); border: 1px solid rgba(194, 94, 56, 0.3); color: #C25E38; font-size: 11px; font-weight: bold; text-transform: uppercase; letter-spacing: 1px; border-radius: 6px;">
                              VERIFICATION CODE
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
                        Welcome to Better With Aarkesh! ✨
                      </h2>
                      <p style="margin: 0 0 16px; font-size: 14px; color: #555555; line-height: 1.6;">
                        Hi ${fullName}, thank you for beginning your coaching journey. Please use the One-Time Password (OTP) below to verify your email address:
                      </p>

                      <!-- OTP Display Box -->
                      <div style="text-align: center; margin: 30px 0 28px;">
                        <div style="display: inline-block; background-color: #FDF7F3; border: 1.5px solid #C25E38; padding: 14px 34px; border-radius: 12px; box-shadow: 0 6px 18px rgba(194, 94, 56, 0.12);">
                          <span style="font-size: 32px; font-weight: 800; color: #C25E38; letter-spacing: 8px; font-family: monospace;">${otp}</span>
                        </div>
                      </div>

                      <div style="background-color: #FAF7F2; border: 1px solid #EBE4DA; border-radius: 10px; padding: 14px 18px; text-align: center;">
                        <p style="margin: 0; font-size: 12px; color: #777777; line-height: 1.5;">
                          ⏳ This OTP is valid for <strong style="color: #C25E38;">10 minutes</strong>. For your security, please do not share this code with anyone.
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
        subject: 'Verify your email - Better With Aarkesh',
        html: emailHtmlTemplate,
      });

      if (error) {
        console.warn('⚠️ Resend Warning:', error.message || error);
        if (process.env.NODE_ENV !== 'production') {
          return res.status(200).json({ 
            message: 'OTP generated (Dev Mode: Check backend console for OTP)', 
            devOtp: otp 
          });
        }
        return res.status(500).json({ message: error.message || 'Failed to send OTP email' });
      }

      res.status(200).json({ message: 'OTP sent successfully' });
    } catch (emailError) {
      console.warn('⚠️ Email send exception:', emailError.message);
      if (process.env.NODE_ENV !== 'production') {
        return res.status(200).json({ 
          message: 'OTP generated (Dev Mode: Check backend console for OTP)', 
          devOtp: otp 
        });
      }
      res.status(500).json({ message: 'Failed to send OTP email' });
    }
  } catch (error) {
    console.error('OTP Init Error:', error.message);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/auth/register-verify
// @desc    Verify OTP and register user
// @access  Public
router.post('/register-verify', async (req, res) => {
  try {
    const { email, otp } = req.body;
    const cleanEmail = (email || '').trim().toLowerCase();

    const pendingData = pendingRegistrations.get(cleanEmail);

    if (!pendingData) {
      return res.status(400).json({ message: 'Session expired or invalid. Please try registering again.' });
    }

    if (pendingData.expires < Date.now()) {
      pendingRegistrations.delete(cleanEmail);
      return res.status(400).json({ message: 'OTP expired. Please try registering again.' });
    }

    if (pendingData.otp !== otp) {
      return res.status(400).json({ message: 'Invalid OTP' });
    }

    // OTP is valid, proceed with user creation
    const { fullName, password, countryCode, phoneNumber } = pendingData;
    const emailRegex = new RegExp(`^${cleanEmail.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i');

    // Check if active user exists
    const userExists = await User.findOne({ email: emailRegex });

    if (userExists && !userExists.isDeleted) {
      return res.status(400).json({ message: 'Email ID already exists. Use a different one.' });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Check if this email belongs to a course purchaser → grant 3 free sessions
    const courseUser = await CourseUser.findOne({ email: emailRegex, isPurchased: true });
    const coursePurchase = await CoursePurchase.findOne({ email: emailRegex, paymentStatus: 'paid' });
    const hasCoursePerks = !!courseUser || !!coursePurchase;

    let user;
    if (userExists && userExists.isDeleted) {
      // 1. Record PastClient so returning user gets 90min
      await PastClient.findOneAndUpdate(
        { email: cleanEmail },
        { email: cleanEmail, phoneNumber },
        { upsert: true }
      );

      // 2. Clear any leftover user notes
      await Note.deleteMany({ user: userExists._id });

      // 3. Delete previous appointments from old account so user gets a 100% clean fresh start
      await Appointment.deleteMany({
        $or: [
          { userId: userExists._id },
          { email: new RegExp(`^${cleanEmail.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i') }
        ]
      });

      // 4. Re-activate and reset user data with fresh registration
      userExists.fullName = fullName;
      userExists.password = hashedPassword;
      userExists.countryCode = countryCode;
      userExists.phoneNumber = phoneNumber;
      userExists.dob = '';
      userExists.gender = 'Prefer not to say';
      userExists.savedArticles = [];
      userExists.savedVideos = [];
      userExists.completedArticles = [];
      userExists.completedVideos = [];
      userExists.freeSessions = hasCoursePerks ? 3 : 0;
      userExists.courseSessionsGranted = hasCoursePerks;
      userExists.isDeleted = false;
      userExists.deletedAt = null;
      await userExists.save();
      user = userExists;
    } else {
      // Create user
      user = await User.create({
        fullName,
        email: cleanEmail,
        password: hashedPassword,
        countryCode,
        phoneNumber,
        freeSessions: hasCoursePerks ? 3 : 0,
        courseSessionsGranted: hasCoursePerks,
      });
    }

    if (user) {
      res.status(201).json({
        _id: user._id,
        fullName: user.fullName,
        email: user.email,
        phoneNumber: user.phoneNumber,
        countryCode: user.countryCode,
        dob: user.dob,
        gender: user.gender,
        freeSessions: user.freeSessions || 0,
        courseSessionsGranted: user.courseSessionsGranted || false,
        token: generateToken(user._id),
      });
      // Clear pending data
      pendingRegistrations.delete(cleanEmail);
    } else {
      res.status(400).json({ message: 'Invalid user data' });
    }
  } catch (error) {
    console.error('Registration Verify Error:', error.message);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/auth/login
// @desc    Authenticate user & get token
// @access  Public
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const cleanEmail = (email || '').trim().toLowerCase();
    const emailRegex = new RegExp(`^${cleanEmail.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i');

    // Check for user
    const user = await User.findOne({ email: emailRegex });

    if (!user) {
      return res.status(401).json({ message: 'User account does not exist, please register first' });
    }

    if (user.isDeleted) {
      return res.status(403).json({ message: 'This account has been deleted. Please contact support if you need assistance.' });
    }

    // Match password
    const isMatch = await bcrypt.compare(password, user.password);

    if (isMatch) {
      // If user purchased course but coaching account didn't have sessions granted yet, sync them
      if (!user.courseSessionsGranted) {
        const courseUser = await CourseUser.findOne({ email: emailRegex, isPurchased: true });
        const coursePurchase = await CoursePurchase.findOne({ email: emailRegex, paymentStatus: 'paid' });
        if (courseUser || coursePurchase) {
          user.freeSessions = 3;
          user.courseSessionsGranted = true;
          await user.save();
        }
      }

      res.json({
        _id: user._id,
        fullName: user.fullName,
        email: user.email,
        phoneNumber: user.phoneNumber,
        countryCode: user.countryCode,
        dob: user.dob,
        gender: user.gender,
        freeSessions: user.freeSessions || 0,
        courseSessionsGranted: user.courseSessionsGranted || false,
        token: generateToken(user._id),
      });
    } else {
      res.status(401).json({ message: 'Wrong password' });
    }
  } catch (error) {
    console.error('Login Error:', error.message);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/auth/me
// @desc    Get current user profile with freeSessions
// @access  Private
router.get('/me', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Auto-sync if purchased course
    if (!user.courseSessionsGranted && user.email) {
      const emailRegex = new RegExp(`^${user.email.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i');
      const courseUser = await CourseUser.findOne({ email: emailRegex, isPurchased: true });
      const coursePurchase = await CoursePurchase.findOne({ email: emailRegex, paymentStatus: 'paid' });
      if (courseUser || coursePurchase) {
        user.freeSessions = 3;
        user.courseSessionsGranted = true;
        await user.save();
      }
    }

    res.json(user);
  } catch (error) {
    console.error('Fetch Auth Me Error:', error.message);
    res.status(500).json({ message: 'Server error fetching profile' });
  }
});

// @route   POST /api/auth/check-free-sessions
// @desc    Check available free sessions by email
// @access  Public
router.post('/check-free-sessions', async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.json({ hasFreeSessions: false, freeSessions: 0, isCoursePurchaser: false });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const emailRegex = new RegExp(`^${normalizedEmail.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i');

    const courseUser = await CourseUser.findOne({ email: emailRegex, isPurchased: true });
    const coachingUser = await User.findOne({ email: emailRegex, isDeleted: { $ne: true } });

    if (courseUser) {
      const distinctPurchasedCourses = new Set();
      if (Array.isArray(courseUser.purchasedCourses)) {
        courseUser.purchasedCourses.forEach(s => s && distinctPurchasedCourses.add(s));
      }
      const purchases = await CoursePurchase.find({
        $or: [{ courseUserId: courseUser._id }, { studentEmail: emailRegex }],
        paymentStatus: 'Paid'
      });
      purchases.forEach(p => { if (p.courseSlug) distinctPurchasedCourses.add(p.courseSlug); });
      if (distinctPurchasedCourses.size === 0) distinctPurchasedCourses.add('better-man');

      const totalCoursesCount = distinctPurchasedCourses.size || 1;
      const totalGrantedSessions = totalCoursesCount * 3;

      const relevantAppointments = await Appointment.find({
        email: emailRegex,
        status: { $ne: 'CANCELLED' }
      });

      let claimedSessionsCount = 0;
      for (const app of relevantAppointments) {
        if (app.isFreeSession || app.orderId === 'COURSE_FREE_SESSION') {
          claimedSessionsCount += 1;
        }
        if (app.rescheduleRequest && app.rescheduleRequest.usedFreeSessionCredit === true) {
          claimedSessionsCount += 1;
        }
      }

      const freeSessions = Math.max(0, totalGrantedSessions - claimedSessionsCount);

      if (coachingUser) {
        coachingUser.freeSessions = freeSessions;
        coachingUser.courseSessionsGranted = true;
        await coachingUser.save();
      }

      return res.json({
        hasFreeSessions: freeSessions > 0,
        freeSessions,
        totalGranted: totalGrantedSessions,
        isCoursePurchaser: true,
        courseUserName: courseUser.fullName
      });
    }

    if (coachingUser) {
      const relevantAppointments = await Appointment.find({
        email: emailRegex,
        status: { $ne: 'CANCELLED' }
      });

      let claimedSessionsCount = 0;
      for (const app of relevantAppointments) {
        if (app.isFreeSession || app.orderId === 'COURSE_FREE_SESSION') {
          claimedSessionsCount += 1;
        }
        if (app.rescheduleRequest && app.rescheduleRequest.usedFreeSessionCredit === true) {
          claimedSessionsCount += 1;
        }
      }

      const totalGranted = coachingUser.courseSessionsGranted ? 3 : (typeof coachingUser.freeSessions === 'number' ? (coachingUser.freeSessions + claimedSessionsCount) : 0);
      const freeSessions = Math.max(0, totalGranted - claimedSessionsCount);

      if (coachingUser.freeSessions !== freeSessions) {
        coachingUser.freeSessions = freeSessions;
        await coachingUser.save();
      }

      if (freeSessions > 0) {
        return res.json({
          hasFreeSessions: true,
          freeSessions: freeSessions,
          isCoursePurchaser: coachingUser.courseSessionsGranted || false
        });
      }
    }

    return res.json({
      hasFreeSessions: false,
      freeSessions: 0,
      isCoursePurchaser: false
    });
  } catch (error) {
    console.error('Check Free Sessions Error:', error.message);
    res.status(500).json({ message: 'Server error checking free sessions' });
  }
});
// @route   POST /api/auth/forgot-password-init
// @desc    Initiate forgot password and send OTP
// @access  Public
router.post('/forgot-password-init', async (req, res) => {
  try {
    const { email } = req.body;
    const cleanEmail = (email || '').trim().toLowerCase();
    const emailRegex = new RegExp(`^${cleanEmail.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i');

    const user = await User.findOne({ email: emailRegex, isDeleted: { $ne: true } });
    if (!user) {
      return res.status(404).json({ message: 'User account does not exist' });
    }

    const otp = generateOTP();
    
    pendingPasswordResets.set(cleanEmail, {
      otp,
      expires: Date.now() + 10 * 60 * 1000
    });

    try {
      const resend = new Resend(process.env.RESEND_API_KEY);

      const emailHtmlTemplate = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Password Reset Request</title>
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
                            <div style="font-size: 11px; color: #C25E38; text-transform: uppercase; letter-spacing: 2px; margin-top: 4px; font-weight: 600;">
                              Account Security
                            </div>
                          </td>
                          <td align="right">
                            <span style="display: inline-block; padding: 5px 12px; background-color: rgba(194, 94, 56, 0.1); border: 1px solid rgba(194, 94, 56, 0.3); color: #C25E38; font-size: 11px; font-weight: bold; text-transform: uppercase; letter-spacing: 1px; border-radius: 6px;">
                              PASSWORD RESET
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
                        Reset Your Password
                      </h2>
                      <p style="margin: 0 0 16px; font-size: 14px; color: #555555; line-height: 1.6;">
                        We received a request to reset your password. Please use the One-Time Password (OTP) below to proceed:
                      </p>

                      <!-- OTP Display Box -->
                      <div style="text-align: center; margin: 30px 0 28px;">
                        <div style="display: inline-block; background-color: #FDF7F3; border: 1.5px solid #C25E38; padding: 14px 34px; border-radius: 12px; box-shadow: 0 6px 18px rgba(194, 94, 56, 0.12);">
                          <span style="font-size: 32px; font-weight: 800; color: #C25E38; letter-spacing: 8px; font-family: monospace;">${otp}</span>
                        </div>
                      </div>

                      <div style="background-color: #FAF7F2; border: 1px solid #EBE4DA; border-radius: 10px; padding: 14px 18px; text-align: center;">
                        <p style="margin: 0; font-size: 12px; color: #777777; line-height: 1.5;">
                          ⏳ This OTP is valid for <strong style="color: #C25E38;">10 minutes</strong>. If you did not request a password reset, please ignore this email.
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
        subject: 'Password Reset OTP - Better With Aarkesh',
        html: emailHtmlTemplate,
      });

      if (error) {
        console.error('Resend Error:', error);
        return res.status(500).json({ message: 'Failed to send reset OTP email' });
      }

      res.status(200).json({ message: 'OTP sent successfully' });
    } catch (emailError) {
      console.error('Email sending failed:', emailError);
      res.status(500).json({ message: 'Failed to send reset OTP email' });
    }
  } catch (error) {
    console.error('Forgot Password Init Error:', error.message);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/auth/forgot-password-reset
// @desc    Verify OTP and reset password
// @access  Public
router.post('/forgot-password-reset', async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;
    const cleanEmail = (email || '').trim().toLowerCase();
    const emailRegex = new RegExp(`^${cleanEmail.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i');

    const pendingData = pendingPasswordResets.get(cleanEmail);
    if (!pendingData) {
      return res.status(400).json({ message: 'Session expired or invalid. Please try again.' });
    }

    if (pendingData.expires < Date.now()) {
      pendingPasswordResets.delete(cleanEmail);
      return res.status(400).json({ message: 'OTP expired. Please try again.' });
    }

    if (pendingData.otp !== otp) {
      return res.status(400).json({ message: 'Invalid OTP' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    await User.findOneAndUpdate({ email: emailRegex, isDeleted: { $ne: true } }, { password: hashedPassword });
    pendingPasswordResets.delete(cleanEmail);

    res.status(200).json({ message: 'Password reset successfully' });
  } catch (error) {
    console.error('Forgot Password Reset Error:', error.message);
    res.status(500).json({ message: 'Server error' });
  }
});
// @route   POST /api/auth/admin/login
// @desc    Admin login, initializes admin if doesn't exist
// @access  Public
router.post('/admin/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    const normalizedEmail = (email || '').toLowerCase().trim();
    if (normalizedEmail !== 'admin@aarkeshgupta.com' && normalizedEmail !== 'admin@betterwithaarkesh.com') {
      return res.status(401).json({ message: 'Invalid admin credentials' });
    }

    let adminUser = await User.findOne({ $or: [{ email: normalizedEmail }, { email: 'admin@aarkeshgupta.com' }, { email: 'admin@betterwithaarkesh.com' }] });

    // Auto-initialize admin on first login attempt if missing
    if (!adminUser) {
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash('admin123', salt);
      adminUser = await User.create({
        fullName: 'Administrator',
        email: normalizedEmail,
        password: hashedPassword,
        isAdmin: true
      });
    }

    const isMatch = await bcrypt.compare(password, adminUser.password);

    if (isMatch && adminUser.isAdmin) {
      res.json({
        _id: adminUser._id,
        email: adminUser.email,
        isAdmin: adminUser.isAdmin,
        token: generateToken(adminUser._id)
      });
    } else {
      res.status(401).json({ message: 'Invalid admin credentials' });
    }
  } catch (error) {
    console.error('Admin Login Error:', error.message);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/auth/admin/change-password
// @desc    Change admin password in DB
// @access  Private (Admin)
router.post('/admin/change-password', protect, admin, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    const adminUser = await User.findById(req.user._id);

    if (!adminUser) {
      return res.status(404).json({ message: 'Admin user not found' });
    }

    const isMatch = await bcrypt.compare(currentPassword, adminUser.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Incorrect current password' });
    }

    if (!newPassword || newPassword.length < 6) {
      return res.status(400).json({ message: 'New password must be at least 6 characters' });
    }

    const salt = await bcrypt.genSalt(10);
    adminUser.password = await bcrypt.hash(newPassword, salt);
    await adminUser.save();

    res.status(200).json({ message: 'Password changed successfully' });
  } catch (error) {
    console.error('Admin Password Change Error:', error.message);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;
