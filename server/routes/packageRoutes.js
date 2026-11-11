import express from 'express';
import crypto from 'crypto';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import Razorpay from 'razorpay';
import jwt from 'jsonwebtoken';
import Package from '../models/Package.js';
import Appointment from '../models/Appointment.js';
import User from '../models/User.js';
import CourseUser from '../models/CourseUser.js';
import Settings from '../models/Settings.js';
import SlotHold from '../models/SlotHold.js';
import { 
  findConflictingAppointment, 
  findConflictingHold,
  normalizeDateToKey 
} from '../utils/slotConflictHelper.js';
import { protect, optionalAuth, admin } from '../middleware/authMiddleware.js';
import { 
  DEFAULT_PACKAGE_TIERS, 
  PACKAGE_CONFIG 
} from '../constants/packageConfig.js';
import { 
  sendClientPackageBookingConfirmationEmail,
  sendCoachPackageBookingAlertEmail,
  sendClientBookingConfirmationEmail,
  sendCoachBookingAlertEmail,
  sendClientPackageAgreementEmail,
  generateCoachingAgreementPdf,
  generateGoogleMeetLink,
  generateAgreementToken,
  getAgreementTokenExpiry
} from '../services/coachingAgreementService.js';
import { validateEmailFormat } from '../services/emailOtpService.js';
import { validateCouponInternal, incrementCouponUsage } from './couponRoutes.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = express.Router();

// Helper to get Razorpay instance
const getRazorpayInstance = async () => {
  let keyId = process.env.RAZORPAY_KEY_ID;
  let keySecret = process.env.RAZORPAY_KEY_SECRET;

  if (!keyId || !keySecret) {
    const settings = await Settings.findOne({ key: 'razorpay' });
    if (settings?.value?.keyId && settings?.value?.keySecret) {
      keyId = settings.value.keyId;
      keySecret = settings.value.keySecret;
    }
  }

  if (!keyId || !keySecret) {
    throw new Error('Razorpay keys not configured.');
  }

  return {
    instance: new Razorpay({ key_id: keyId, key_secret: keySecret }),
    keyId,
    keySecret
  };
};

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'fallback_secret_key', {
    expiresIn: '30d',
  });
};

import PastClient from '../models/PastClient.js';

// Helper to determine if a client is fresh / first-time or returning
export const checkIsFirstSession = async (email, phone, user) => {
  let isFirstSession = true;
  if (email) {
    const cleanEmail = email.toLowerCase().trim();
    const escapedEmail = cleanEmail.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const pastClient = await PastClient.findOne({ email: new RegExp(`^${escapedEmail}$`, 'i') });
    const pastAppointments = await Appointment.countDocuments({
      email: new RegExp(`^${escapedEmail}$`, 'i'),
      status: { $in: ['UPCOMING', 'COMPLETED', 'CANCELLED'] },
      paymentStatus: { $ne: 'Failed' }
    });
    if (pastClient || pastAppointments > 0) {
      isFirstSession = false;
    }
  }

  if (isFirstSession && phone) {
    const cleanPhone = String(phone).trim();
    const escapedPhone = cleanPhone.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const pastClientPhone = await PastClient.findOne({ phoneNumber: new RegExp(`^${escapedPhone}$`, 'i') });
    const pastPhoneAppointments = await Appointment.countDocuments({
      phoneNumber: new RegExp(`^${escapedPhone}$`, 'i'),
      status: { $in: ['UPCOMING', 'COMPLETED', 'CANCELLED'] },
      paymentStatus: { $ne: 'Failed' }
    });
    if (pastClientPhone || pastPhoneAppointments > 0) {
      isFirstSession = false;
    }
  }

  if (isFirstSession && user?._id) {
    const pastUserAppointments = await Appointment.countDocuments({
      userId: user._id,
      status: { $in: ['UPCOMING', 'COMPLETED', 'CANCELLED'] },
      paymentStatus: { $ne: 'Failed' }
    });
    if (pastUserAppointments > 0) {
      isFirstSession = false;
    }
  }

  return isFirstSession;
};

// Helper to get or create User account on package booking
const getOrCreateBookingUser = async ({ name, email, countryCode, phoneNumber }) => {
  if (!email) return { user: null, courseUser: null, token: null, courseToken: null, isNewAccount: false };

  const cleanEmail = email.trim().toLowerCase();
  const emailRegex = new RegExp(`^${cleanEmail.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i');

  let user = await User.findOne({ email: emailRegex, isDeleted: { $ne: true } });
  let courseUser = await CourseUser.findOne({ email: emailRegex });
  let isNewAccount = false;

  if (!user) {
    isNewAccount = true;
    const randomPassword = crypto.randomBytes(16).toString('hex');
    user = new User({
      fullName: name || cleanEmail.split('@')[0],
      email: cleanEmail,
      phoneNumber: phoneNumber || '',
      countryCode: countryCode || '+91',
      password: randomPassword,
      authProvider: 'google',
      isVerified: true,
      freeSessions: 0,
      courseSessionsGranted: false
    });
    await user.save();
    console.log(`✅ Auto-created coaching User account on package booking: ${user.fullName} (${cleanEmail})`);
  } else {
    if (phoneNumber && !user.phoneNumber) {
      user.phoneNumber = phoneNumber;
      if (countryCode) user.countryCode = countryCode;
      await user.save();
    }
  }

  if (!courseUser) {
    const randomPassword = crypto.randomBytes(16).toString('hex');
    courseUser = new CourseUser({
      fullName: name || user.fullName || cleanEmail.split('@')[0],
      email: cleanEmail,
      phoneNumber: phoneNumber || user.phoneNumber || '',
      password: randomPassword,
      authProvider: 'google',
      isPurchased: false
    });
    await courseUser.save();
  }

  const token = generateToken(user._id);
  const courseToken = generateToken(courseUser._id);

  return { user, courseUser, token, courseToken, isNewAccount };
};

// @desc    Get Package Configurations, Tiers & Fees
// @route   GET /api/packages/config
// @access  Public
router.get('/config', async (req, res) => {
  try {
    let feeSettings = await Settings.findOne({ key: 'fees' });
    let fee60min = 5000;
    let fee90min = 7500;
    if (feeSettings?.value) {
      fee60min = Number(feeSettings.value.fee60min) || 5000;
      fee90min = Number(feeSettings.value.fee90min) || 7500;
    }

    res.json({
      success: true,
      tiers: DEFAULT_PACKAGE_TIERS,
      fee60min,
      fee90min,
      slotHoldMinutes: PACKAGE_CONFIG.slotHoldMinutes,
      minGapDays: PACKAGE_CONFIG.minGapDays,
    });
  } catch (error) {
    console.error('Error fetching package config:', error);
    res.status(500).json({ success: false, message: 'Server error fetching package config' });
  }
});

// @desc    Create Razorpay Order for Package
// @route   POST /api/packages/create-order
// @access  Public
router.post('/create-order', optionalAuth, async (req, res) => {
  try {
    const { 
      email, 
      phoneNumber, 
      countryCode = '+91',
      totalSessions, 
      sessionDuration = 90, 
      sessions = [], 
      couponCode, 
      holderId 
    } = req.body;

    // Validate email
    const rawEmail = (email || (req.user && req.user.email) || '').trim().toLowerCase();
    const { valid, error: emailError, cleanEmail: normalizedEmail } = validateEmailFormat(rawEmail);
    if (!valid || !normalizedEmail) {
      return res.status(400).json({ message: emailError || 'Please enter a valid email address.' });
    }

    const sessionCount = Number(totalSessions);
    if (!sessionCount || sessionCount < PACKAGE_CONFIG.minSessions || sessionCount > PACKAGE_CONFIG.maxSessions) {
      return res.status(400).json({ message: `Package must contain between ${PACKAGE_CONFIG.minSessions} and ${PACKAGE_CONFIG.maxSessions} sessions.` });
    }

    const firstSession = (Array.isArray(sessions) && sessions.length > 0) ? sessions[0] : (req.body.session || null);
    if (!firstSession || !firstSession.date || !firstSession.time) {
      return res.status(400).json({ message: 'Please select a date and time for your first session.' });
    }

    // Atomic Slot Availability Re-validation for First Session slot
    // Check for slot conflicts with existing appointments (including full duration overlap)
    const conflictAppt = await findConflictingAppointment({
      date: firstSession.date,
      time: firstSession.time,
      duration: Number(sessionDuration) || 90
    });

    if (conflictAppt) {
      return res.status(409).json({
        conflict: true,
        conflictingSlot: { date: firstSession.date, time: firstSession.time },
        message: conflictAppt.message || `The slot on ${firstSession.date} at ${firstSession.time} overlaps with an existing appointment. Please select another time for Session 1.`
      });
    }

    // Check slot holds by other users (with duration overlap)
    if (holderId) {
      const conflictHold = await findConflictingHold({
        dateKey: firstSession.dateKey || firstSession.date,
        time: firstSession.time,
        duration: Number(sessionDuration) || 90,
        currentHolderId: holderId
      });
      if (conflictHold) {
        return res.status(409).json({
          conflict: true,
          conflictingSlot: { date: firstSession.date, time: firstSession.time },
          message: conflictHold.message || `The slot on ${firstSession.date} at ${firstSession.time} is temporarily reserved by another client. Please select another time for Session 1.`
        });
      }
    }

    // Check if client is fresh user or returning user
    const isFirstSession = await checkIsFirstSession(normalizedEmail, phoneNumber, req.user);

    // Server-side Pricing Computation
    let feeSettings = await Settings.findOne({ key: 'fees' });
    let fee60min = 5000;
    let fee90min = 7500;
    if (feeSettings?.value) {
      fee60min = Number(feeSettings.value.fee60min) || 5000;
      fee90min = Number(feeSettings.value.fee90min) || 7500;
    }

    // All package sessions are strictly 90 minutes. 60 min is ONLY for a brand-new user booking a single session.
    const subtotal = sessionCount * fee90min;
    const pricePerSession = fee90min;

    // Coupon calculation if any (discount is ONLY through coupons)
    let couponDiscount = 0;
    let validCouponCode = '';
    let amountAfterCoupon = subtotal;

    if (couponCode) {
      const couponRes = await validateCouponInternal(couponCode, 'session', subtotal);
      if (couponRes.valid) {
        couponDiscount = couponRes.discountAmount;
        amountAfterCoupon = couponRes.finalAmount;
        validCouponCode = couponRes.code;
      }
    }

    const totalAmount = Math.max(1, amountAfterCoupon); // In INR
    const totalDiscountAmount = couponDiscount;

    const { instance } = await getRazorpayInstance();
    const order = await instance.orders.create({
      amount: Math.round(totalAmount * 100), // in paise
      currency: 'INR',
      receipt: `pkg_${Date.now()}`,
      notes: {
        isPackage: 'true',
        totalSessions: String(sessionCount),
        sessionDuration: String(sessionDuration),
        isFirstSession: String(isFirstSession),
        email: normalizedEmail,
        couponCode: validCouponCode,
        discountAmount: String(totalDiscountAmount),
        originalAmount: String(subtotal)
      }
    });

    res.json({
      success: true,
      id: order.id,
      order_id: order.id,
      amount: order.amount,
      currency: order.currency,
      totalAmount,
      subtotal,
      pricePerSession,
      discountPercentage: 0,
      discountAmount: totalDiscountAmount,
      couponCode: validCouponCode,
      totalSessions: sessionCount,
      sessionDuration: Number(sessionDuration),
      isFirstSession
    });
  } catch (error) {
    console.error('Error creating package order:', error);
    res.status(500).json({ message: error.message || 'Failed to create package order' });
  }
});

// @desc    Finalize Package Booking after Successful Razorpay Payment
// @route   POST /api/packages/finalize
// @access  Public
router.post('/finalize', optionalAuth, async (req, res) => {
  try {
    const { 
      orderId, 
      paymentId, 
      signature,
      clientName,
      clientEmail,
      countryCode = '+91',
      phoneNumber = '',
      totalSessions,
      sessionDuration = 90,
      sessions = [],
      source = '',
      reason = '',
      extra = '',
      questionnaireAnswers = null,
      bookingDraftId = null
    } = req.body;

    if (!orderId || !paymentId) {
      return res.status(400).json({ message: 'orderId and paymentId are required to finalize package.' });
    }

    // Verify Razorpay signature if provided
    const { keySecret } = await getRazorpayInstance();
    if (signature && keySecret) {
      const body = `${orderId}|${paymentId}`;
      const expectedSignature = crypto
        .createHmac('sha256', keySecret)
        .update(body.toString())
        .digest('hex');

      if (expectedSignature !== signature) {
        return res.status(400).json({ message: 'Invalid payment signature verification failed.' });
      }
    }

    // Prevent duplicate package processing (idempotency)
    let existingPackage = await Package.findOne({ orderId });
    if (existingPackage && existingPackage.paymentStatus === 'Paid') {
      const appointments = await Appointment.find({ packageId: existingPackage._id }).sort({ sessionNumber: 1 });
      const authData = await getOrCreateBookingUser({
        name: clientName,
        email: clientEmail,
        countryCode,
        phoneNumber
      });
      return res.json({
        success: true,
        package: existingPackage,
        appointments,
        token: authData.token,
        courseToken: authData.courseToken,
        userInfo: authData.user ? {
          _id: authData.user._id,
          fullName: authData.user.fullName || authData.user.name,
          email: authData.user.email,
          phoneNumber: authData.user.phoneNumber || '',
          countryCode: authData.user.countryCode || '+91',
          photoUrl: authData.user.photoUrl || '',
          freeSessions: authData.user.freeSessions,
          courseSessionsGranted: authData.user.courseSessionsGranted,
          authProvider: authData.user.authProvider || 'google'
        } : null,
        courseUser: authData.courseUser ? {
          _id: authData.courseUser._id,
          fullName: authData.courseUser.fullName,
          email: authData.courseUser.email,
          phoneNumber: authData.courseUser.phoneNumber || '',
          isPurchased: authData.courseUser.isPurchased,
          authProvider: authData.courseUser.authProvider || 'google'
        } : null,
        isNewAccount: authData.isNewAccount
      });
    }

    const sessionCount = Number(totalSessions) || sessions.length;
    let feeSettings = await Settings.findOne({ key: 'fees' });
    let fee60min = 5000;
    let fee90min = 7500;
    if (feeSettings?.value) {
      fee60min = Number(feeSettings.value.fee60min) || 5000;
      fee90min = Number(feeSettings.value.fee90min) || 7500;
    }

    const pricePerSession = Number(sessionDuration) === 90 ? fee90min : fee60min;
    const subtotal = pricePerSession * sessionCount;
    let couponDiscount = 0;
    let totalAmount = subtotal;

    if (req.body.couponCode) {
      const couponRes = await validateCouponInternal(req.body.couponCode, 'session', subtotal);
      if (couponRes.valid) {
        couponDiscount = couponRes.discountAmount;
        totalAmount = couponRes.finalAmount;
        await incrementCouponUsage(couponRes.code).catch(() => {});
      }
    }

    // Link/Create user account
    const authData = await getOrCreateBookingUser({
      name: clientName,
      email: clientEmail,
      countryCode,
      phoneNumber
    });
    const user = authData.user;

    // 1. Create Package Document
    const packageDoc = new Package({
      userId: user?._id || req.user?._id || null,
      clientName: clientName.trim(),
      clientEmail: clientEmail.trim().toLowerCase(),
      countryCode,
      phoneNumber,
      totalSessions: sessionCount,
      bookedSessionsCount: 1,
      creditsRemaining: Math.max(0, sessionCount - 1),
      sessionDuration: 90,
      pricePerSession,
      discountPercentage: 0,
      discountAmount: couponDiscount,
      couponCode: (req.body.couponCode || '').trim().toUpperCase(),
      totalAmount,
      orderId,
      paymentId,
      signature: signature || '',
      paymentStatus: 'Paid',
      status: 'ACTIVE',
      agreementStatus: 'pending',
      source,
      reason,
      extra,
      questionnaireAnswers,
      bookingDraftId
    });

    await packageDoc.save();

    // Sync user.packageCredits
    if (user) {
      user.packageCredits = (user.packageCredits || 0) + Math.max(0, sessionCount - 1);
      await user.save().catch(e => console.error('Failed to update user packageCredits:', e));
    }

    // 2. Create ONLY the First Session Appointment Document
    const firstSessionSlot = (Array.isArray(sessions) && sessions.length > 0) ? sessions[0] : (req.body.session || {});
    const meetLink = generateGoogleMeetLink();

    const firstAppt = new Appointment({
      userId: user?._id || req.user?._id || null,
      date: firstSessionSlot.date,
      time: firstSessionSlot.time,
      name: clientName.trim(),
      email: clientEmail.trim().toLowerCase(),
      countryCode,
      phoneNumber,
      duration: 90,
      amount: totalAmount,
      originalAmount: pricePerSession * sessionCount,
      orderId,
      paymentId,
      paymentStatus: 'Paid',
      status: 'UPCOMING',
      packageId: packageDoc._id,
      sessionNumber: 1,
      totalSessionsInPackage: sessionCount,
      isPackageCredit: false,
      meetLink,
      agreementStatus: 'pending',
      source,
      reason,
      extra,
      questionnaireAnswers,
      questionnaireBookingDraftId: bookingDraftId
    });

    await firstAppt.save();
    const createdAppointments = [firstAppt];

    // 3. Clean up temporary slot holds for this draft
    if (bookingDraftId) {
      await SlotHold.deleteMany({ holderId: String(bookingDraftId).trim() }).catch(e => console.error('Slot hold cleanup error:', e));
    }

    // 4. Send Confirmation Emails via Resend
    sendClientPackageBookingConfirmationEmail({
      packageDoc,
      appointments: createdAppointments,
      paymentId,
      orderId
    }).catch(e => console.error('Error sending client package confirmation email:', e));

    sendCoachPackageBookingAlertEmail({
      packageDoc,
      appointments: createdAppointments
    }).catch(e => console.error('Error sending coach package alert email:', e));

    res.json({
      success: true,
      message: 'Package booked successfully!',
      package: packageDoc,
      appointments: createdAppointments,
      token: authData.token,
      courseToken: authData.courseToken,
      userInfo: authData.user ? {
        _id: authData.user._id,
        fullName: authData.user.fullName || authData.user.name,
        name: authData.user.fullName || authData.user.name,
        email: authData.user.email,
        phoneNumber: authData.user.phoneNumber || '',
        countryCode: authData.user.countryCode || '+91',
        photoUrl: authData.user.photoUrl || '',
        freeSessions: authData.user.freeSessions,
        courseSessionsGranted: authData.user.courseSessionsGranted,
        authProvider: authData.user.authProvider || 'google'
      } : null,
      courseUser: authData.courseUser ? {
        _id: authData.courseUser._id,
        fullName: authData.courseUser.fullName,
        email: authData.courseUser.email,
        phoneNumber: authData.courseUser.phoneNumber || '',
        isPurchased: authData.courseUser.isPurchased,
        authProvider: authData.courseUser.authProvider || 'google'
      } : null,
      isNewAccount: authData.isNewAccount
    });

  } catch (error) {
    console.error('Error finalizing package:', error);
    res.status(500).json({ message: error.message || 'Server error finalizing package' });
  }
});

// @desc    Get user's available package credits & active packages
// @route   GET /api/packages/credits & POST /api/packages/check-credits
const getPackageCreditsHandler = async (req, res) => {
  try {
    const rawEmail = (req.query.email || req.body?.email || (req.user && req.user.email) || '').trim().toLowerCase();
    if (!rawEmail) {
      return res.json({ 
        success: true, 
        hasCredits: false, 
        hasPackageCredits: false, 
        packageCredits: 0, 
        totalCredits: 0, 
        packages: [], 
        activePackages: [] 
      });
    }

    const emailRegex = new RegExp(`^${rawEmail.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i');
    
    // Find packages for this email that are paid and have creditsRemaining > 0
    const packages = await Package.find({
      clientEmail: emailRegex,
      paymentStatus: 'Paid',
      creditsRemaining: { $gt: 0 },
      status: { $ne: 'CANCELLED' }
    }).sort({ createdAt: -1 });

    const totalCredits = packages.reduce((sum, p) => sum + (Number(p.creditsRemaining) || 0), 0);

    // Sync user.packageCredits if user exists
    const user = await User.findOne({ email: emailRegex });
    if (user && user.packageCredits !== totalCredits) {
      user.packageCredits = totalCredits;
      await user.save().catch(() => {});
    }

    const mappedPackages = packages.map(p => ({
      _id: p._id,
      id: p._id,
      totalSessions: p.totalSessions,
      bookedSessionsCount: p.bookedSessionsCount || 1,
      creditsRemaining: p.creditsRemaining,
      sessionDuration: p.sessionDuration || 90,
      agreementStatus: p.agreementStatus,
      orderId: p.orderId,
      createdAt: p.createdAt
    }));

    res.json({
      success: true,
      hasPackageCredits: totalCredits > 0,
      hasCredits: totalCredits > 0,
      packageCredits: totalCredits,
      totalCredits: totalCredits,
      packages: mappedPackages,
      activePackages: mappedPackages
    });
  } catch (error) {
    console.error('Error fetching package credits:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch package credits' });
  }
};

router.get('/credits', optionalAuth, getPackageCreditsHandler);
router.post('/credits', optionalAuth, getPackageCreditsHandler);
router.post('/check-credits', optionalAuth, getPackageCreditsHandler);
router.get('/check-credits', optionalAuth, getPackageCreditsHandler);

// @desc    Book a session using an existing package credit
// @route   POST /api/packages/book-credit-session
// @access  Public / Optional Auth
router.post('/book-credit-session', optionalAuth, async (req, res) => {
  try {
    const {
      packageId,
      date,
      time,
      name,
      email,
      countryCode = '+91',
      phoneNumber = '',
      source = '',
      reason = '',
      extra = '',
      questionnaireAnswers = null,
      bookingDraftId = null
    } = req.body;

    const rawEmail = (email || (req.user && req.user.email) || '').trim().toLowerCase();
    const { valid, error: emailError, cleanEmail: normalizedEmail } = validateEmailFormat(rawEmail);
    if (!valid || !normalizedEmail) {
      return res.status(400).json({ message: emailError || 'Please enter a valid email address.' });
    }

    if (!date || !time) {
      return res.status(400).json({ message: 'Please select a session date and time.' });
    }

    const emailRegex = new RegExp(`^${normalizedEmail.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i');

    // 1. Find the target package (or latest active package with credits for this email)
    let packageDoc = null;
    if (packageId) {
      packageDoc = await Package.findById(packageId);
    }
    if (!packageDoc || packageDoc.paymentStatus !== 'Paid' || (packageDoc.creditsRemaining || 0) <= 0) {
      packageDoc = await Package.findOne({
        clientEmail: emailRegex,
        paymentStatus: 'Paid',
        creditsRemaining: { $gt: 0 },
        status: { $ne: 'CANCELLED' }
      }).sort({ createdAt: -1 });
    }

    if (!packageDoc || (packageDoc.creditsRemaining || 0) <= 0) {
      return res.status(400).json({ message: 'No available package credits found for this account.' });
    }

    // 2. Check for slot conflicts (with full interval overlap protection)
    const sessionDuration = Number(packageDoc.sessionDuration) || 90;
    const conflictAppt = await findConflictingAppointment({
      date,
      time,
      duration: sessionDuration
    });

    if (conflictAppt) {
      return res.status(409).json({
        conflict: true,
        message: conflictAppt.message || `The slot on ${date} at ${time} overlaps with an existing session. Please select another time.`
      });
    }

    if (bookingDraftId) {
      const conflictHold = await findConflictingHold({
        dateKey: date,
        time,
        duration: sessionDuration,
        currentHolderId: bookingDraftId
      });
      if (conflictHold) {
        return res.status(409).json({
          conflict: true,
          message: conflictHold.message || `The slot on ${date} at ${time} is temporarily reserved by another client. Please select another time.`
        });
      }
    }

    // 3. User association
    const authData = await getOrCreateBookingUser({
      name: name || packageDoc.clientName,
      email: normalizedEmail,
      countryCode: countryCode || packageDoc.countryCode,
      phoneNumber: phoneNumber || packageDoc.phoneNumber
    });
    const user = authData.user;

    // 4. Update Package credits count
    packageDoc.bookedSessionsCount = (packageDoc.bookedSessionsCount || 1) + 1;
    packageDoc.creditsRemaining = Math.max(0, (packageDoc.creditsRemaining || 1) - 1);
    await packageDoc.save();

    // 5. Update user packageCredits
    if (user) {
      user.packageCredits = Math.max(0, (user.packageCredits || 1) - 1);
      await user.save().catch(() => {});
    }

    const nextSessionNumber = packageDoc.bookedSessionsCount;
    const meetLink = generateGoogleMeetLink();

    // 6. Create Appointment document
    // User requirement: "package ke credits se book kiye hue sesson me aggrement ni jayega"
    // So agreementStatus is 'accepted' and NO separate agreement is created/required.
    const appt = new Appointment({
      userId: user?._id || packageDoc.userId || null,
      date,
      time,
      name: (name || packageDoc.clientName).trim(),
      email: normalizedEmail,
      countryCode: countryCode || packageDoc.countryCode,
      phoneNumber: phoneNumber || packageDoc.phoneNumber,
      duration: packageDoc.sessionDuration || 90,
      amount: 0, // Prepaid via package credit
      originalAmount: packageDoc.pricePerSession,
      orderId: packageDoc.orderId,
      paymentId: packageDoc.paymentId,
      paymentStatus: 'Paid',
      status: 'UPCOMING',
      packageId: packageDoc._id,
      sessionNumber: nextSessionNumber,
      totalSessionsInPackage: packageDoc.totalSessions,
      isPackageCredit: true,
      meetLink,
      agreementStatus: 'accepted',
      agreementAcceptedAt: packageDoc.agreementAcceptedAt || new Date(),
      agreementPdfUrl: packageDoc.agreementPdfUrl || '',
      source: source || packageDoc.source,
      reason: reason || packageDoc.reason,
      extra: extra || packageDoc.extra,
      questionnaireAnswers: questionnaireAnswers || packageDoc.questionnaireAnswers,
      questionnaireBookingDraftId: bookingDraftId
    });

    await appt.save();

    // Clean up holds
    if (bookingDraftId) {
      await SlotHold.deleteMany({ holderId: String(bookingDraftId).trim() }).catch(() => {});
    }

    // 7. Send single session confirmation email to client and coach (NO agreement attached)
    sendClientBookingConfirmationEmail({
      appointment: appt,
      isFreeSession: false,
      isPackageCredit: true,
      packageDoc
    }).catch(e => console.error('Error sending credit booking email to client:', e));

    sendCoachBookingAlertEmail({
      appointment: appt,
      isFreeSession: false,
      isPackageCredit: true,
      packageDoc
    }).catch(e => console.error('Error sending credit booking email to coach:', e));

    res.json({
      success: true,
      message: `Session ${nextSessionNumber} of ${packageDoc.totalSessions} booked successfully with your package credit!`,
      appointment: appt,
      package: packageDoc,
      creditsRemaining: packageDoc.creditsRemaining,
      token: authData.token,
      userInfo: authData.user ? {
        _id: authData.user._id,
        fullName: authData.user.fullName || authData.user.name,
        email: authData.user.email,
        packageCredits: authData.user.packageCredits,
        freeSessions: authData.user.freeSessions
      } : null
    });
  } catch (error) {
    console.error('Error booking package credit session:', error);
    res.status(500).json({ message: 'Failed to book session with package credit. Please try again.' });
  }
});

// @desc    Get Package by ID (Admin or Authenticated Owner)
// @route   GET /api/packages/:id
// @access  Public / OptionalAuth
router.get('/:id', optionalAuth, async (req, res) => {
  try {
    const packageDoc = await Package.findById(req.params.id);
    if (!packageDoc) {
      return res.status(404).json({ message: 'Package not found' });
    }

    const appointments = await Appointment.find({ packageId: packageDoc._id }).sort({ sessionNumber: 1 });
    res.json({
      success: true,
      package: packageDoc,
      appointments
    });
  } catch (error) {
    console.error('Error fetching package:', error);
    res.status(500).json({ message: 'Server error fetching package' });
  }
});

// @desc    Update Package Agreement Terms (Admin)
// @route   PUT /api/packages/:id/agreement-data
// @access  Private/Admin
router.put('/:id/agreement-data', protect, admin, async (req, res) => {
  try {
    const packageDoc = await Package.findById(req.params.id);
    if (!packageDoc) return res.status(404).json({ message: 'Package not found' });

    const { betweenSessionSupport, additionalAgreedTerms, modeOfCoaching } = req.body;
    packageDoc.agreementData = {
      modeOfCoaching: modeOfCoaching || packageDoc.agreementData?.modeOfCoaching || 'Online Video (Google Meet)',
      betweenSessionSupport: betweenSessionSupport !== undefined ? betweenSessionSupport : (packageDoc.agreementData?.betweenSessionSupport || ''),
      additionalAgreedTerms: additionalAgreedTerms !== undefined ? additionalAgreedTerms : (packageDoc.agreementData?.additionalAgreedTerms || '')
    };

    await packageDoc.save();

    // Sync to all child appointments
    await Appointment.updateMany(
      { packageId: packageDoc._id },
      { $set: { agreementData: packageDoc.agreementData } }
    );

    res.json({ success: true, message: 'Package agreement terms updated', package: packageDoc });
  } catch (error) {
    console.error('Error updating package agreement data:', error);
    res.status(500).json({ message: 'Failed to update package agreement terms' });
  }
});

// @desc    Approve & Send Package Agreement to Client (Admin)
// @route   POST /api/packages/:id/agreement-send
// @access  Private/Admin
router.post('/:id/agreement-send', protect, admin, async (req, res) => {
  try {
    const packageDoc = await Package.findById(req.params.id);
    if (!packageDoc) return res.status(404).json({ message: 'Package not found' });

    const appointments = await Appointment.find({ packageId: packageDoc._id }).sort({ sessionNumber: 1 });

    const token = generateAgreementToken();
    const expiresAt = getAgreementTokenExpiry(7);

    packageDoc.agreementToken = token;
    packageDoc.agreementTokenExpiresAt = expiresAt;
    packageDoc.agreementStatus = 'sent';
    packageDoc.agreementSentAt = new Date();
    await packageDoc.save();

    // Sync token and status to all sibling appointments
    await Appointment.updateMany(
      { packageId: packageDoc._id },
      {
        $set: {
          agreementToken: token,
          agreementTokenExpiresAt: expiresAt,
          agreementStatus: 'sent',
          agreementSentAt: new Date()
        }
      }
    );

    // Send package agreement email
    await sendClientPackageAgreementEmail({
      packageDoc,
      appointments
    });

    res.json({
      success: true,
      message: 'Package coaching agreement approved and sent to client',
      package: packageDoc
    });
  } catch (error) {
    console.error('Error sending package agreement:', error);
    res.status(500).json({ message: 'Failed to send package agreement' });
  }
});

// @desc    Resend Package Agreement to Client (Admin)
// @route   POST /api/packages/:id/agreement-resend
// @access  Private/Admin
router.post('/:id/agreement-resend', protect, admin, async (req, res) => {
  try {
    const packageDoc = await Package.findById(req.params.id);
    if (!packageDoc) return res.status(404).json({ message: 'Package not found' });

    if (!packageDoc.agreementToken || packageDoc.agreementTokenExpiresAt < new Date()) {
      packageDoc.agreementToken = generateAgreementToken();
      packageDoc.agreementTokenExpiresAt = getAgreementTokenExpiry(7);
    }

    packageDoc.agreementSentAt = new Date();
    await packageDoc.save();

    const appointments = await Appointment.find({ packageId: packageDoc._id }).sort({ sessionNumber: 1 });

    await Appointment.updateMany(
      { packageId: packageDoc._id },
      {
        $set: {
          agreementToken: packageDoc.agreementToken,
          agreementTokenExpiresAt: packageDoc.agreementTokenExpiresAt,
          agreementStatus: 'sent',
          agreementSentAt: new Date()
        }
      }
    );

    await sendClientPackageAgreementEmail({
      packageDoc,
      appointments,
      isResend: true
    });

    res.json({ success: true, message: 'Package agreement resent successfully', package: packageDoc });
  } catch (error) {
    console.error('Error resending package agreement:', error);
    res.status(500).json({ message: 'Failed to resend package agreement' });
  }
});

// @desc    Get Agreement by Token (Public View for Client Signing)
// @route   GET /api/packages/agreement-view/:token
// @access  Public
router.get('/agreement-view/:token', async (req, res) => {
  try {
    const token = req.params.token;
    const packageDoc = await Package.findOne({ agreementToken: token });

    if (!packageDoc) {
      return res.status(404).json({ message: 'Invalid or expired agreement link.' });
    }

    if (packageDoc.agreementTokenExpiresAt && packageDoc.agreementTokenExpiresAt < new Date()) {
      return res.status(410).json({ message: 'This agreement link has expired. Please contact Aarkesh for a new link.' });
    }

    const appointments = await Appointment.find({ packageId: packageDoc._id }).sort({ sessionNumber: 1 });

    res.json({
      success: true,
      isPackage: true,
      package: packageDoc,
      appointments
    });
  } catch (error) {
    console.error('Error loading package agreement by token:', error);
    res.status(500).json({ message: 'Error loading agreement' });
  }
});

// @desc    Accept Package Digital Agreement (Client Signature)
// @route   POST /api/packages/agreement-accept/:token
// @access  Public
router.post('/agreement-accept/:token', async (req, res) => {
  try {
    const token = req.params.token;
    const packageDoc = await Package.findOne({ agreementToken: token });

    if (!packageDoc) {
      return res.status(404).json({ message: 'Invalid or expired agreement token.' });
    }

    if (packageDoc.agreementStatus === 'accepted') {
      await Appointment.updateMany(
        { packageId: packageDoc._id },
        {
          $set: {
            agreementStatus: 'accepted',
            agreementAcceptedAt: packageDoc.agreementAcceptedAt || new Date(),
            agreementPdfUrl: packageDoc.agreementPdfUrl
          }
        }
      ).catch(() => {});
      return res.json({
        success: true,
        alreadyAccepted: true,
        pdfUrl: packageDoc.agreementPdfUrl,
        message: 'This package agreement has already been accepted.'
      });
    }

    const appointments = await Appointment.find({ packageId: packageDoc._id }).sort({ sessionNumber: 1 });

    const clientIp = req.headers['x-forwarded-for'] || req.socket.remoteAddress || '';
    const userAgent = req.headers['user-agent'] || '';

    // Generate Official Signed PDF
    const sessionsList = appointments.map((a, idx) => ({
      sessionNumber: idx + 1,
      date: a.date,
      time: a.time,
      meetLink: a.meetLink
    }));

    const pdfBuffer = await generateCoachingAgreementPdf({
      clientName: packageDoc.clientName,
      clientEmail: packageDoc.clientEmail,
      clientPhone: packageDoc.phoneNumber ? `${packageDoc.countryCode || '+91'} ${packageDoc.phoneNumber}` : '',
      isPackage: true,
      totalSessions: packageDoc.totalSessions,
      sessionsList,
      totalAmount: packageDoc.totalAmount,
      modeOfCoaching: packageDoc.agreementData?.modeOfCoaching || 'Online Video (Google Meet)',
      betweenSessionSupport: packageDoc.agreementData?.betweenSessionSupport || '',
      additionalAgreedTerms: packageDoc.agreementData?.additionalAgreedTerms || '',
      agreementDate: new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })
    });

    // Save PDF to public uploads directory
    const uploadsDir = path.join(__dirname, '../uploads/agreements');
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }

    const fileName = `package_agreement_${packageDoc._id}_${Date.now()}.pdf`;
    const filePath = path.join(uploadsDir, fileName);
    fs.writeFileSync(filePath, pdfBuffer);

    const pdfUrl = `/uploads/agreements/${fileName}`;

    packageDoc.agreementStatus = 'accepted';
    packageDoc.agreementAcceptedAt = new Date();
    packageDoc.agreementAcceptedIp = String(clientIp);
    packageDoc.agreementAcceptedUserAgent = String(userAgent);
    packageDoc.agreementPdfUrl = pdfUrl;
    await packageDoc.save();

    // Update all child appointments
    await Appointment.updateMany(
      { packageId: packageDoc._id },
      {
        $set: {
          agreementStatus: 'accepted',
          agreementAcceptedAt: new Date(),
          agreementAcceptedIp: String(clientIp),
          agreementAcceptedUserAgent: String(userAgent),
          agreementPdfUrl: pdfUrl
        }
      }
    );

    res.json({
      success: true,
      message: 'Package coaching agreement accepted successfully!',
      pdfUrl,
      package: packageDoc
    });
  } catch (error) {
    console.error('Error accepting package agreement:', error);
    res.status(500).json({ message: 'Error processing package agreement acceptance' });
  }
});

export default router;
