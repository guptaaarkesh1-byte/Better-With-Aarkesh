import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { Resend } from 'resend';
import CourseUser from '../models/CourseUser.js';
import User from '../models/User.js';
import CoursePurchase from '../models/CoursePurchase.js';
import Course from '../models/Course.js';
import Settings from '../models/Settings.js';
import { DEFAULT_COURSE_DETAILS_MAP } from './courseDetailSettingsRoutes.js';
import Appointment from '../models/Appointment.js';
import { protect, admin } from '../middleware/authMiddleware.js';

const router = express.Router();

const generateOTP = () => Math.floor(1000 + Math.random() * 9000).toString();

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'fallback_secret_key', {
    expiresIn: '30d',
  });
};

const pendingRegistrations = new Map();
const pendingPasswordResets = new Map();

// @route   POST /api/course-auth/register-init
router.post('/register-init', async (req, res) => {
  try {
    const { fullName, email, password, phoneNumber } = req.body;

    const userExists = await CourseUser.findOne({ email });

    if (userExists) {
      return res.status(400).json({ message: 'Email ID already exists for the course. Please log in.' });
    }

    const otp = generateOTP();
    
    pendingRegistrations.set(email, {
      fullName,
      email,
      password,
      phoneNumber,
      otp,
      expires: Date.now() + 10 * 60 * 1000
    });

    console.log(`\n========================================`);
    console.log(`🔑 [COURSE OTP] ${email} -> OTP: ${otp}`);
    console.log(`========================================\n`);

    try {
      const resend = new Resend(process.env.RESEND_API_KEY);
      
      const emailHtmlTemplate = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Verify Your Course Registration</title>
        </head>
        <body style="margin: 0; padding: 0; background-color: #060207; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #f1ebf0;">
          <table width="100%" bgcolor="#060207" cellpadding="0" cellspacing="0" style="width: 100%; background-color: #060207; padding: 30px 15px;">
            <tr>
              <td align="center">
                <table width="100%" cellpadding="0" cellspacing="0" style="max-width: 580px; width: 100%; background-color: #0e0410; border: 1px solid #3d143a; border-radius: 18px; overflow: hidden; box-shadow: 0 20px 50px rgba(0,0,0,0.85), 0 0 30px rgba(200, 120, 190, 0.1);">
                  
                  <!-- Brand Header -->
                  <tr>
                    <td style="padding: 32px 36px 22px; background: linear-gradient(180deg, #1d0722 0%, #0e0410 100%); border-bottom: 1px solid #2d0e2e;">
                      <table width="100%" cellpadding="0" cellspacing="0">
                        <tr>
                          <td>
                            <div style="font-size: 22px; font-weight: bold; color: #ffffff; letter-spacing: -0.5px; font-family: Georgia, serif;">
                              Better With Aarkesh
                            </div>
                            <div style="font-size: 11px; color: #E3B8DE; text-transform: uppercase; letter-spacing: 2px; margin-top: 4px; font-weight: 600;">
                              Masterclass Student Portal
                            </div>
                          </td>
                          <td align="right">
                            <span style="display: inline-block; padding: 5px 12px; background-color: rgba(200, 120, 190, 0.15); border: 1px solid rgba(200, 120, 190, 0.4); color: #E3B8DE; font-size: 11px; font-weight: bold; text-transform: uppercase; letter-spacing: 1px; border-radius: 6px;">
                              ACCOUNT VERIFICATION
                            </span>
                          </td>
                        </tr>
                      </table>
                    </td>
                  </tr>

                  <!-- Main Content -->
                  <tr>
                    <td style="padding: 32px 36px 28px;">
                      <h2 style="margin: 0 0 10px; font-size: 20px; color: #ffffff; font-weight: 600;">
                        Welcome to the Masterclass, ${fullName}! 🎉
                      </h2>
                      <p style="margin: 0 0 16px; font-size: 14px; color: #cbbcc9; line-height: 1.6;">
                        Thank you for registering on the Better With Aarkesh student portal. Please use the One-Time Password (OTP) below to verify your email address and activate your learning account:
                      </p>

                      <!-- OTP Display Box -->
                      <div style="text-align: center; margin: 30px 0 28px;">
                        <div style="display: inline-block; background: linear-gradient(135deg, rgba(200, 120, 190, 0.18) 0%, rgba(134, 41, 118, 0.28) 100%); border: 1px solid #C878BE; padding: 14px 34px; border-radius: 12px; box-shadow: 0 8px 24px rgba(200, 120, 190, 0.25);">
                          <span style="font-size: 32px; font-weight: 800; color: #ffffff; letter-spacing: 8px; font-family: monospace; text-shadow: 0 0 12px rgba(200, 120, 190, 0.6);">${otp}</span>
                        </div>
                      </div>

                      <div style="background-color: #140517; border: 1px solid #280b2a; border-radius: 10px; padding: 14px 18px; text-align: center;">
                        <p style="margin: 0; font-size: 12px; color: #9d8c9b; line-height: 1.5;">
                          ⏳ This OTP is valid for <strong style="color: #E3B8DE;">10 minutes</strong>. For your security, please do not share this code with anyone.
                        </p>
                      </div>
                    </td>
                  </tr>

                  <!-- Footer -->
                  <tr>
                    <td style="padding: 20px 36px; background-color: #09020b; border-top: 1px solid #230b25; text-align: center; font-size: 11px; color: #6e5d6c; line-height: 1.5;">
                      <div>Better With Aarkesh · Executive Leadership &amp; Gravitas Coaching</div>
                      <div>For assistance, contact <a href="mailto:coaching@aarkeshgupta.com" style="color: #E3B8DE; text-decoration: none;">coaching@aarkeshgupta.com</a></div>
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
        to: email,
        subject: 'Verify your course registration - Better With Aarkesh',
        html: emailHtmlTemplate,
      });

      if (error) {
        console.warn('⚠️ Resend Warning:', error.message || error);
        // If testing locally or sandbox domain error, allow OTP verification using logged OTP
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

// @route   POST /api/course-auth/register-verify
router.post('/register-verify', async (req, res) => {
  try {
    const { email, otp } = req.body;

    const pendingData = pendingRegistrations.get(email);

    if (!pendingData) {
      return res.status(400).json({ message: 'Session expired or invalid. Please try registering again.' });
    }

    if (pendingData.expires < Date.now()) {
      pendingRegistrations.delete(email);
      return res.status(400).json({ message: 'OTP expired. Please try registering again.' });
    }

    if (pendingData.otp !== otp) {
      return res.status(400).json({ message: 'Invalid OTP' });
    }

    const { fullName, password, phoneNumber } = pendingData;

    const userExists = await CourseUser.findOne({ email });

    if (userExists) {
      return res.status(400).json({ message: 'Email ID already exists for the course.' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = await CourseUser.create({
      fullName,
      email,
      password: hashedPassword,
      phoneNumber,
    });

    if (user) {
      res.status(201).json({
        _id: user._id,
        fullName: user.fullName,
        email: user.email,
        phoneNumber: user.phoneNumber,
        isPurchased: user.isPurchased,
        purchasedCourses: user.purchasedCourses || [],
        token: generateToken(user._id),
      });
      pendingRegistrations.delete(email);
    } else {
      res.status(400).json({ message: 'Invalid user data' });
    }
  } catch (error) {
    console.error('Course Registration Verify Error:', error.message);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/course-auth/login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await CourseUser.findOne({ email });

    if (!user) {
      return res.status(401).json({ message: 'User account does not exist. Please register first.' });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (isMatch) {
      const emailRegex = new RegExp(`^${user.email.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i');
      const coachingUser = await User.findOne({ email: emailRegex });
      const relevantAppointments = await Appointment.find({
        email: emailRegex,
        status: { $ne: 'CANCELLED' }
      });
      let claimedAppointments = 0;
      for (const app of relevantAppointments) {
        if (app.isFreeSession || app.orderId === 'COURSE_FREE_SESSION') claimedAppointments += 1;
        if (app.rescheduleRequest && app.rescheduleRequest.usedFreeSessionCredit === true) claimedAppointments += 1;
      }
      const freeSessions = coachingUser && coachingUser.freeSessions !== undefined
        ? Math.max(0, coachingUser.freeSessions)
        : (user.isPurchased ? Math.max(0, 3 - claimedAppointments) : 0);

      res.json({
        _id: user._id,
        fullName: user.fullName,
        email: user.email,
        phoneNumber: user.phoneNumber,
        isPurchased: user.isPurchased,
        purchasedCourses: user.purchasedCourses || (user.isPurchased ? ['better-man'] : []),
        freeSessions,
        token: generateToken(user._id),
      });
    } else {
      res.status(401).json({ message: 'Wrong password' });
    }
  } catch (error) {
    console.error('Course Login Error:', error.message);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/course-auth/forgot-password-init
router.post('/forgot-password-init', async (req, res) => {
  try {
    const { email } = req.body;

    const user = await CourseUser.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'Course user account does not exist' });
    }

    const otp = generateOTP();
    
    pendingPasswordResets.set(email, {
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
          <title>Course Password Reset</title>
        </head>
        <body style="margin: 0; padding: 0; background-color: #060207; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #f1ebf0;">
          <table width="100%" bgcolor="#060207" cellpadding="0" cellspacing="0" style="width: 100%; background-color: #060207; padding: 30px 15px;">
            <tr>
              <td align="center">
                <table width="100%" cellpadding="0" cellspacing="0" style="max-width: 580px; width: 100%; background-color: #0e0410; border: 1px solid #3d143a; border-radius: 18px; overflow: hidden; box-shadow: 0 20px 50px rgba(0,0,0,0.85), 0 0 30px rgba(200, 120, 190, 0.1);">
                  
                  <!-- Brand Header -->
                  <tr>
                    <td style="padding: 32px 36px 22px; background: linear-gradient(180deg, #1d0722 0%, #0e0410 100%); border-bottom: 1px solid #2d0e2e;">
                      <table width="100%" cellpadding="0" cellspacing="0">
                        <tr>
                          <td>
                            <div style="font-size: 22px; font-weight: bold; color: #ffffff; letter-spacing: -0.5px; font-family: Georgia, serif;">
                              Better With Aarkesh
                            </div>
                            <div style="font-size: 11px; color: #E3B8DE; text-transform: uppercase; letter-spacing: 2px; margin-top: 4px; font-weight: 600;">
                              Masterclass Student Security
                            </div>
                          </td>
                          <td align="right">
                            <span style="display: inline-block; padding: 5px 12px; background-color: rgba(200, 120, 190, 0.15); border: 1px solid rgba(200, 120, 190, 0.4); color: #E3B8DE; font-size: 11px; font-weight: bold; text-transform: uppercase; letter-spacing: 1px; border-radius: 6px;">
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
                      <h2 style="margin: 0 0 10px; font-size: 20px; color: #ffffff; font-weight: 600;">
                        Reset Your Course Password
                      </h2>
                      <p style="margin: 0 0 16px; font-size: 14px; color: #cbbcc9; line-height: 1.6;">
                        We received a request to reset your password for the Better With Aarkesh course portal. Please use the One-Time Password (OTP) below to proceed:
                      </p>

                      <!-- OTP Display Box -->
                      <div style="text-align: center; margin: 30px 0 28px;">
                        <div style="display: inline-block; background: linear-gradient(135deg, rgba(200, 120, 190, 0.18) 0%, rgba(134, 41, 118, 0.28) 100%); border: 1px solid #C878BE; padding: 14px 34px; border-radius: 12px; box-shadow: 0 8px 24px rgba(200, 120, 190, 0.25);">
                          <span style="font-size: 32px; font-weight: 800; color: #ffffff; letter-spacing: 8px; font-family: monospace; text-shadow: 0 0 12px rgba(200, 120, 190, 0.6);">${otp}</span>
                        </div>
                      </div>

                      <div style="background-color: #140517; border: 1px solid #280b2a; border-radius: 10px; padding: 14px 18px; text-align: center;">
                        <p style="margin: 0; font-size: 12px; color: #9d8c9b; line-height: 1.5;">
                          ⏳ This OTP is valid for <strong style="color: #E3B8DE;">10 minutes</strong>. If you did not request this password reset, you can safely ignore this email.
                        </p>
                      </div>
                    </td>
                  </tr>

                  <!-- Footer -->
                  <tr>
                    <td style="padding: 20px 36px; background-color: #09020b; border-top: 1px solid #230b25; text-align: center; font-size: 11px; color: #6e5d6c; line-height: 1.5;">
                      <div>Better With Aarkesh · Executive Leadership &amp; Gravitas Coaching</div>
                      <div>For assistance, contact <a href="mailto:coaching@aarkeshgupta.com" style="color: #E3B8DE; text-decoration: none;">coaching@aarkeshgupta.com</a></div>
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
        to: email,
        subject: 'Course Password Reset OTP - Better With Aarkesh',
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
    console.error('Course Forgot Password Init Error:', error.message);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/course-auth/forgot-password-reset
router.post('/forgot-password-reset', async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;

    const pendingData = pendingPasswordResets.get(email);
    if (!pendingData) {
      return res.status(400).json({ message: 'Session expired or invalid. Please try again.' });
    }

    if (pendingData.expires < Date.now()) {
      pendingPasswordResets.delete(email);
      return res.status(400).json({ message: 'OTP expired. Please try again.' });
    }

    if (pendingData.otp !== otp) {
      return res.status(400).json({ message: 'Invalid OTP' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    await CourseUser.findOneAndUpdate({ email }, { password: hashedPassword });
    pendingPasswordResets.delete(email);

    res.status(200).json({ message: 'Password reset successfully' });
  } catch (error) {
    console.error('Course Forgot Password Reset Error:', error.message);
    res.status(500).json({ message: 'Server error' });
  }
});

// Middleware to protect course user routes
const protectCourse = async (req, res, next) => {
  let token;
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret_key');
      req.courseUser = await CourseUser.findById(decoded.id).select('-password');
      if (!req.courseUser) {
        return res.status(401).json({ message: 'Course user not found' });
      }
      return next();
    } catch (error) {
      console.error('Course token auth failed:', error.message);
      return res.status(401).json({ message: 'Not authorized, token invalid or expired' });
    }
  }

  if (!token) {
    return res.status(401).json({ message: 'Not authorized, no token provided' });
  }
};

// @route   GET /api/course-auth/me
router.get('/me', protectCourse, async (req, res) => {
  try {
    const courseUserObj = req.courseUser.toObject();
    
    // Look up linked coaching user for free coaching session balance and purchase history
    if (courseUserObj.email) {
      const email = courseUserObj.email.trim();
      const escapedEmail = email.toLowerCase().replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const emailRegex = new RegExp(`^${escapedEmail}$`, 'i');
      const coachingUser = await User.findOne({ email: emailRegex });
      // Fetch official purchase records for this student
      const purchases = await CoursePurchase.find({
        $or: [
          { courseUserId: courseUserObj._id },
          { studentEmail: emailRegex }
        ]
      }).populate('courseId').sort({ purchaseDate: -1, createdAt: -1 });

      courseUserObj.purchases = purchases;
      courseUserObj.latestPurchase = purchases[0] || null;

      // Consolidate all purchased course slugs
      const purchasedSlugs = new Set();
      if (Array.isArray(courseUserObj.purchasedCourses)) {
        courseUserObj.purchasedCourses.forEach(s => s && purchasedSlugs.add(s));
      }
      purchases.forEach(p => {
        if (p.courseSlug && p.paymentStatus === 'Paid') purchasedSlugs.add(p.courseSlug);
      });
      if (courseUserObj.isPurchased && purchasedSlugs.size === 0) {
        purchasedSlugs.add('better-man');
      }
      courseUserObj.purchasedCourses = Array.from(purchasedSlugs);
      courseUserObj.isPurchased = courseUserObj.purchasedCourses.length > 0;

      const totalCoursesCount = courseUserObj.purchasedCourses.length;
      const totalSessionsGranted = totalCoursesCount * 3;

      const relevantAppointments = await Appointment.find({
        email: emailRegex,
        status: { $ne: 'CANCELLED' }
      });
      let claimedAppointments = 0;
      for (const app of relevantAppointments) {
        if (app.isFreeSession || app.orderId === 'COURSE_FREE_SESSION') claimedAppointments += 1;
        if (app.rescheduleRequest && app.rescheduleRequest.usedFreeSessionCredit === true) claimedAppointments += 1;
      }

      const calculatedRemaining = Math.max(0, totalSessionsGranted - claimedAppointments);

      if (coachingUser) {
        coachingUser.freeSessions = calculatedRemaining;
        coachingUser.courseSessionsGranted = true;
        await coachingUser.save();
        courseUserObj.freeSessions = calculatedRemaining;
        courseUserObj.courseSessionsGranted = true;
      } else if (courseUserObj.isPurchased) {
        courseUserObj.freeSessions = calculatedRemaining;
        courseUserObj.courseSessionsGranted = true;
      } else {
        courseUserObj.freeSessions = 0;
        courseUserObj.courseSessionsGranted = false;
      }

      // Primary course doc
      const primaryCourse = await Course.findOne().sort({ createdAt: 1 });
      if (primaryCourse) {
        courseUserObj.coursePricing = {
          price: primaryCourse.price,
          gstRate: primaryCourse.gstRate,
          isGstIncluded: primaryCourse.isGstIncluded,
          title: primaryCourse.title
        };
      }

      // Fetch dynamic course details for all enrolled courses
      try {
        const multiDetailsSetting = await Settings.findOne({ key: 'course_multi_details_settings' });
        const allCourseDetails = {
          ...DEFAULT_COURSE_DETAILS_MAP,
          ...(multiDetailsSetting?.value || {})
        };

        const enrolledCourses = Array.from(purchasedSlugs).map(slug => {
          const cData = allCourseDetails[slug] || DEFAULT_COURSE_DETAILS_MAP[slug] || {};
          const purchase = purchases.find(p => p.courseSlug === slug);
          const imgUrl = cData.imageUrl || cData.thumbnailUrl || (slug === 'better-man' ? (primaryCourse?.thumbnail || DEFAULT_COURSE_DETAILS_MAP['better-man']?.imageUrl || '') : '') || '';
          return {
            slug,
            title: cData.title || purchase?.courseTitle || (slug === 'better-man' ? 'The Better Man™' : slug),
            imageUrl: imgUrl,
            thumbnailUrl: imgUrl,
            modulesCount: Array.isArray(cData.syllabus) && cData.syllabus.length > 0 ? cData.syllabus.length : 8,
            purchaseDate: purchase?.purchaseDate || purchase?.createdAt || courseUserObj.createdAt || new Date(),
            invoiceNumber: purchase?.invoiceNumber || null,
            amount: purchase?.amount || null,
            chips: cData.chips || [],
            lede: cData.lede || cData.d || ''
          };
        });

        courseUserObj.enrolledCourses = enrolledCourses;
      } catch (settingsErr) {
        console.error('Error attaching enrolledCourses metadata:', settingsErr.message);
        courseUserObj.enrolledCourses = Array.from(purchasedSlugs).map(slug => ({
          slug,
          title: slug === 'better-man' ? 'The Better Man™' : slug,
          imageUrl: '',
          thumbnailUrl: '',
          modulesCount: 8,
          purchaseDate: courseUserObj.createdAt || new Date()
        }));
      }
    }
    
    res.json(courseUserObj);
  } catch (error) {
    console.error('Fetch course user error:', error.message);
    res.status(500).json({ message: 'Server error fetching user profile' });
  }
});

// @route   PUT /api/course-auth/profile
router.put('/profile', protectCourse, async (req, res) => {
  try {
    const user = await CourseUser.findById(req.courseUser._id);
    if (!user) {
      return res.status(404).json({ message: 'Course user not found' });
    }

    if (req.body.fullName) user.fullName = req.body.fullName.trim();
    if (req.body.phoneNumber) user.phoneNumber = req.body.phoneNumber.trim();
    if (req.body.currentPassword && req.body.newPassword) {
      const isMatch = await bcrypt.compare(req.body.currentPassword, user.password);
      if (!isMatch) {
        return res.status(400).json({ message: 'Current password does not match' });
      }
      if (req.body.newPassword.length < 4) {
        return res.status(400).json({ message: 'New password must be at least 4 characters long' });
      }
      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(req.body.newPassword, salt);
    }

    const updatedUser = await user.save();
    res.json({
      _id: updatedUser._id,
      fullName: updatedUser.fullName,
      email: updatedUser.email,
      phoneNumber: updatedUser.phoneNumber,
      isPurchased: updatedUser.isPurchased,
      createdAt: updatedUser.createdAt
    });
  } catch (error) {
    console.error('Update course profile error:', error.message);
    res.status(500).json({ message: 'Server error updating profile' });
  }
});

// @route   POST /api/course-auth/sync-coaching-account
// @desc    Verify course purchase and prepare to grant 3 free coaching sessions.
//          Does NOT create a coaching account - user must register on the booking page.
//          Free sessions are identified by email and granted at registration/login.
// @access  Private (course student)
router.post('/sync-coaching-account', protectCourse, async (req, res) => {
  try {
    if (!req.courseUser || !req.courseUser.isPurchased) {
      return res.status(403).json({ message: 'Course purchase is required to claim the 3 free coaching sessions.' });
    }

    const courseUser = await CourseUser.findById(req.courseUser._id);
    if (!courseUser) {
      return res.status(404).json({ message: 'Course user not found' });
    }

    const email = (courseUser.email || '').trim();
    if (!email) {
      return res.status(400).json({ message: 'Course account email is missing.' });
    }

    // Simply confirm the purchase — no coaching User is created here.
    // When the student registers on the booking page with this same email,
    // the register-verify endpoint will detect the course purchase and grant 3 free sessions.
    res.json({
      success: true,
      message: 'Course purchase verified. Register on the booking page with your course email to claim 3 free sessions.',
      email: courseUser.email,
      fullName: courseUser.fullName,
      phoneNumber: courseUser.phoneNumber || '',
    });
  } catch (error) {
    console.error('Sync Coaching Account Error:', error.message);
    res.status(500).json({ message: 'Server error syncing coaching account' });
  }
});

// @route   GET /api/course-auth/admin/students
// @desc    Get all course students with purchase and session details (Admin only)
// @access  Private (Admin)
router.get('/admin/students', protect, admin, async (req, res) => {
  try {
    const [students, allPurchases, primaryCourse] = await Promise.all([
      CourseUser.find().select('-password').sort({ createdAt: -1 }),
      CoursePurchase.find().sort({ purchaseDate: -1, createdAt: -1 }),
      Course.findOne().sort({ createdAt: 1 })
    ]);
    
    // Enrich each student with coaching account info, appointments, and all purchase attempts
    const studentEmailsSet = new Set();
    const enrichedStudents = await Promise.all(students.map(async (student) => {
      studentEmailsSet.add((student.email || '').toLowerCase().trim());
      const emailRegex = new RegExp(`^${(student.email || '').trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i');
      
      const [coachingUser, appointments] = await Promise.all([
        User.findOne({ email: emailRegex }),
        Appointment.find({ email: emailRegex }).sort({ date: -1 })
      ]);

      const studentPurchases = allPurchases.filter(p => 
        (p.courseUserId && p.courseUserId.toString() === student._id.toString()) ||
        (p.studentEmail && p.studentEmail.toLowerCase() === (student.email || '').toLowerCase().trim())
      );

      const paidPurchases = studentPurchases.filter(p => p.paymentStatus === 'Paid');
      const failedPurchases = studentPurchases.filter(p => p.paymentStatus === 'Failed');
      const latestPaid = paidPurchases[0] || null;
      const latestFailed = failedPurchases[0] || null;
      const totalPaidAmount = paidPurchases.reduce((sum, p) => sum + (p.amount || 0), 0);

      let freeSessionsClaimed = 0;
      for (const a of appointments) {
        if (a.status !== 'CANCELLED') {
          if (a.isFreeSession || a.orderId === 'COURSE_FREE_SESSION') freeSessionsClaimed += 1;
          if (a.rescheduleRequest && a.rescheduleRequest.usedFreeSessionCredit === true) freeSessionsClaimed += 1;
        }
      }
      const totalAppointments = appointments.length;

      return {
        _id: student._id,
        fullName: student.fullName,
        email: student.email,
        phoneNumber: student.phoneNumber || (coachingUser ? coachingUser.phoneNumber : ''),
        isPurchased: student.isPurchased,
        createdAt: student.createdAt,
        updatedAt: student.updatedAt,
        coachingRegistered: !!coachingUser,
        freeSessionsRemaining: coachingUser ? (coachingUser.freeSessions ?? (student.isPurchased ? 3 - freeSessionsClaimed : 0)) : (student.isPurchased ? 3 : 0),
        freeSessionsClaimed,
        totalAppointments,
        purchases: studentPurchases.map(p => ({
          _id: p._id,
          amount: p.amount,
          currency: p.currency || 'INR',
          paymentStatus: p.paymentStatus,
          enrollmentStatus: p.enrollmentStatus,
          transactionId: p.transactionId,
          razorpayOrderId: p.razorpayOrderId,
          razorpayPaymentId: p.razorpayPaymentId,
          failureReason: p.failureReason || (p.paymentStatus === 'Failed' ? 'Bank transaction declined / cancelled' : ''),
          errorCode: p.errorCode || '',
          purchaseDate: p.purchaseDate || p.createdAt
        })),
        paidPurchasesCount: paidPurchases.length,
        failedPurchasesCount: failedPurchases.length,
        hasFailedPayments: failedPurchases.length > 0,
        latestPaid,
        latestFailed,
        revenue: student.isPurchased ? (totalPaidAmount || (primaryCourse?.price ? (primaryCourse.isGstIncluded ? primaryCourse.price : Math.round(primaryCourse.price * (1 + (primaryCourse.gstRate || 18) / 100))) : 11800)) : 0,
        appointments: appointments.map(app => ({
          _id: app._id,
          date: app.date,
          time: app.time,
          status: app.status,
          isFreeSession: !!app.isFreeSession || app.orderId === 'COURSE_FREE_SESSION' || !!app.rescheduleRequest?.usedFreeSessionCredit,
          paymentStatus: app.paymentStatus,
          orderId: app.orderId,
          rescheduleRequest: app.rescheduleRequest
        }))
      };
    }));

    // Find any purchases whose email is not registered as a CourseUser yet (e.g. guest failed checkout)
    const orphanPurchases = allPurchases.filter(p => {
      const email = (p.studentEmail || '').toLowerCase().trim();
      return email && !studentEmailsSet.has(email);
    });

    // Group orphan purchases by email
    const orphanByEmail = {};
    orphanPurchases.forEach(p => {
      const email = (p.studentEmail || '').toLowerCase().trim();
      if (!orphanByEmail[email]) orphanByEmail[email] = [];
      orphanByEmail[email].push(p);
    });

    Object.entries(orphanByEmail).forEach(([email, purchases]) => {
      const paidPurchases = purchases.filter(p => p.paymentStatus === 'Paid');
      const failedPurchases = purchases.filter(p => p.paymentStatus === 'Failed');
      const latestPaid = paidPurchases[0] || null;
      const latestFailed = failedPurchases[0] || null;
      const totalPaidAmount = paidPurchases.reduce((sum, p) => sum + (p.amount || 0), 0);

      enrichedStudents.push({
        _id: purchases[0]._id,
        fullName: purchases[0].studentName || email.split('@')[0] || 'Guest Lead',
        email: email,
        phoneNumber: '',
        isPurchased: paidPurchases.length > 0,
        createdAt: purchases[0].createdAt || purchases[0].purchaseDate || new Date(),
        updatedAt: purchases[0].updatedAt || new Date(),
        coachingRegistered: false,
        freeSessionsRemaining: paidPurchases.length > 0 ? 3 : 0,
        freeSessionsClaimed: 0,
        totalAppointments: 0,
        purchases: purchases.map(p => ({
          _id: p._id,
          amount: p.amount,
          currency: p.currency || 'INR',
          paymentStatus: p.paymentStatus,
          enrollmentStatus: p.enrollmentStatus,
          transactionId: p.transactionId,
          razorpayOrderId: p.razorpayOrderId,
          razorpayPaymentId: p.razorpayPaymentId,
          failureReason: p.failureReason || (p.paymentStatus === 'Failed' ? 'Bank transaction declined / cancelled' : ''),
          errorCode: p.errorCode || '',
          purchaseDate: p.purchaseDate || p.createdAt
        })),
        paidPurchasesCount: paidPurchases.length,
        failedPurchasesCount: failedPurchases.length,
        hasFailedPayments: failedPurchases.length > 0,
        latestPaid,
        latestFailed,
        revenue: totalPaidAmount,
        appointments: []
      });
    });

    res.json(enrichedStudents);
  } catch (error) {
    console.error('Fetch course students error:', error);
    res.status(500).json({ message: 'Server error fetching course students' });
  }
});

// @route   GET /api/course-auth/admin/purchases
// @desc    Get all transactions (Paid & Failed) sorted newest first (Admin only)
// @access  Private (Admin)
router.get('/admin/purchases', protect, admin, async (req, res) => {
  try {
    const purchases = await CoursePurchase.find().sort({ purchaseDate: -1, createdAt: -1 });
    res.json(purchases);
  } catch (error) {
    console.error('Fetch all purchases error:', error);
    res.status(500).json({ message: 'Server error fetching purchases' });
  }
});

// @route   GET /api/course-auth/admin/stats
// @desc    Get course revenue and student stats (Admin only)
// @access  Private (Admin)
router.get('/admin/stats', protect, admin, async (req, res) => {
  try {
    const [totalRegistered, totalPurchased, totalFailedPurchases, primaryCourse, nonCancelledAppointments] = await Promise.all([
      CourseUser.countDocuments(),
      CourseUser.countDocuments({ isPurchased: true }),
      CoursePurchase.countDocuments({ paymentStatus: 'Failed' }),
      Course.findOne().sort({ createdAt: 1 }),
      Appointment.find({ status: { $ne: 'CANCELLED' } })
    ]);

    let freeSessionAppointments = 0;
    for (const a of nonCancelledAppointments) {
      if (a.isFreeSession || a.orderId === 'COURSE_FREE_SESSION') freeSessionAppointments += 1;
      if (a.rescheduleRequest && a.rescheduleRequest.usedFreeSessionCredit === true) freeSessionAppointments += 1;
    }

    const basePrice = primaryCourse?.price || 10000;
    const gstRate = primaryCourse?.gstRate !== undefined ? primaryCourse.gstRate : 18;
    const isGstIncluded = Boolean(primaryCourse?.isGstIncluded);
    const finalAmount = isGstIncluded ? basePrice : Math.round(basePrice * (1 + gstRate / 100));

    // Calculate actual revenue from paid purchases if available
    const paidAggregation = await CoursePurchase.aggregate([
      { $match: { paymentStatus: 'Paid' } },
      { $group: { _id: null, totalRevenue: { $sum: '$amount' } } }
    ]);
    const actualRevenue = paidAggregation.length > 0 ? paidAggregation[0].totalRevenue : (totalPurchased * finalAmount);

    res.json({
      totalRegistered,
      totalPurchased,
      totalRevenue: actualRevenue,
      freeSessionsClaimed: freeSessionAppointments,
      totalFailedPurchases,
      coursePrice: finalAmount
    });
  } catch (error) {
    console.error('Fetch course stats error:', error);
    res.status(500).json({ message: 'Server error fetching course stats' });
  }
});

// @route   PUT /api/course-auth/admin/students/:id/toggle-access
// @desc    Toggle course access for a student manually (Admin only)
// @access  Private (Admin)
router.put('/admin/students/:id/toggle-access', protect, admin, async (req, res) => {
  try {
    const student = await CourseUser.findById(req.params.id);
    if (!student) {
      return res.status(404).json({ message: 'Course student not found' });
    }

    student.isPurchased = !student.isPurchased;
    await student.save();

    // Sync free sessions in coaching user if exists
    if (student.email) {
      const emailRegex = new RegExp(`^${student.email.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i');
      const coachingUser = await User.findOne({ email: emailRegex });
      if (coachingUser) {
        if (student.isPurchased) {
          if (!coachingUser.courseSessionsGranted) {
            coachingUser.freeSessions = (coachingUser.freeSessions || 0) + 3;
            coachingUser.courseSessionsGranted = true;
          }
        }
        await coachingUser.save();
      }
    }

    res.json({
      _id: student._id,
      fullName: student.fullName,
      email: student.email,
      isPurchased: student.isPurchased,
      message: `Course access ${student.isPurchased ? 'granted' : 'revoked'} successfully.`
    });
  } catch (error) {
    console.error('Toggle course access error:', error);
    res.status(500).json({ message: 'Server error toggling course access' });
  }
});

export default router;
