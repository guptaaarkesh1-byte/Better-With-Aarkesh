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
import { protect, optionalAuth, admin } from '../middleware/authMiddleware.js';
import { 
  DEFAULT_PACKAGE_TIERS, 
  PACKAGE_CONFIG 
} from '../constants/packageConfig.js';
import { 
  sendClientPackageBookingConfirmationEmail,
  sendCoachPackageBookingAlertEmail,
  sendClientPackageAgreementEmail,
  sendClientPackageAgreementAcceptedConfirmationEmail,
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
      sessionDuration = 60, 
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

    if (!Array.isArray(sessions) || sessions.length !== sessionCount) {
      return res.status(400).json({ message: `Please select all ${sessionCount} sessions before proceeding.` });
    }

    // Atomic Slot Availability Re-validation for ALL selected slots
    for (let i = 0; i < sessions.length; i++) {
      const s = sessions[i];
      if (!s.date || !s.time) {
        return res.status(400).json({ message: `Session ${i + 1} has an invalid date or time.` });
      }

      // 1. Check existing confirmed appointments
      const existingAppt = await Appointment.findOne({
        date: s.date,
        time: s.time,
        status: { $in: ['UPCOMING', 'COMPLETED'] },
        paymentStatus: { $ne: 'Failed' }
      });

      if (existingAppt) {
        return res.status(409).json({
          conflict: true,
          conflictingIndex: i,
          conflictingSlot: { date: s.date, time: s.time },
          message: `The slot on ${s.date} at ${s.time} was just booked by another client. Please select another time for Session ${i + 1}.`
        });
      }

      // 2. Check slot holds by other users
      if (holderId) {
        const dateKey = s.dateKey || (s.date && s.date.includes(',') ? s.date : s.date);
        const contestedHold = await SlotHold.findOne({
          time: s.time,
          status: 'HELD',
          holderId: { $ne: String(holderId).trim() },
          expiresAt: { $gt: new Date() }
        });
        if (contestedHold && (contestedHold.dateKey === dateKey || contestedHold.displayDate === s.date)) {
          return res.status(409).json({
            conflict: true,
            conflictingIndex: i,
            conflictingSlot: { date: s.date, time: s.time },
            message: `The slot on ${s.date} at ${s.time} is temporarily reserved by another client. Please select another time for Session ${i + 1}.`
          });
        }
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

    // For fresh user: Session 1 is 60 mins (fee60min), Sessions 2..N are 90 mins (fee90min)
    // For returning user: All sessions are 90 mins (fee90min)
    const subtotal = isFirstSession
      ? (fee60min + (sessionCount - 1) * fee90min)
      : (sessionCount * fee90min);
    const pricePerSession = Math.round(subtotal / sessionCount);

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
      sessionDuration = 60,
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
      sessionDuration: Number(sessionDuration),
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

    // 2. Create All N Sibling Appointment Documents
    const createdAppointments = [];
    const perSessionAmount = Math.round(totalAmount / sessionCount);

    for (let idx = 0; idx < sessions.length; idx++) {
      const s = sessions[idx];
      const meetLink = generateGoogleMeetLink();

      const appt = new Appointment({
        userId: user?._id || req.user?._id || null,
        date: s.date,
        time: s.time,
        name: clientName.trim(),
        email: clientEmail.trim().toLowerCase(),
        countryCode,
        phoneNumber,
        duration: Number(sessionDuration),
        amount: perSessionAmount,
        originalAmount: pricePerSession,
        orderId,
        paymentId,
        paymentStatus: 'Paid',
        status: 'UPCOMING',
        packageId: packageDoc._id,
        sessionNumber: idx + 1,
        totalSessionsInPackage: sessionCount,
        meetLink,
        agreementStatus: 'pending',
        source,
        reason,
        extra,
        questionnaireAnswers,
        questionnaireBookingDraftId: bookingDraftId
      });

      await appt.save();
      createdAppointments.push(appt);
    }

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

    // Send Acceptance Confirmation Email to Client
    sendClientPackageAgreementAcceptedConfirmationEmail({
      packageDoc,
      appointments
    }).catch(e => console.error('Error sending package agreement accepted email:', e));

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
