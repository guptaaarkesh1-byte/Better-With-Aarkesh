import express from 'express';
import mongoose from 'mongoose';
import Razorpay from 'razorpay';
import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import Settings from '../models/Settings.js';
import Appointment from '../models/Appointment.js';
import CourseUser from '../models/CourseUser.js';
import CoursePurchase from '../models/CoursePurchase.js';
import Course from '../models/Course.js';
import User from '../models/User.js';
import { protect, admin, optionalAuth } from '../middleware/authMiddleware.js';
import { sendCoursePurchaseInvoiceEmail, sendCoursePaymentFailedEmail } from '../services/courseEmailService.js';

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
    throw new Error('Razorpay keys not configured. Please configure in Admin Settings or .env.');
  }

  return new Razorpay({
    key_id: keyId,
    key_secret: keySecret,
  });
};

// @desc    Get Razorpay public key
// @route   GET /api/payment/public-key
// @access  Public
router.get('/public-key', async (req, res) => {
  try {
    let keyId = process.env.RAZORPAY_KEY_ID;
    if (!keyId) {
      const settings = await Settings.findOne({ key: 'razorpay' });
      if (settings?.value?.keyId) {
        keyId = settings.value.keyId;
      }
    }

    if (!keyId) {
      return res.status(404).json({ message: 'Razorpay keys not configured' });
    }
    res.json({ keyId });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error fetching key' });
  }
});

// @desc    Get Session Fees
// @route   GET /api/payment/fees
// @access  Public
router.get('/fees', async (req, res) => {
  try {
    const settings = await Settings.findOne({ key: 'fees' });
    if (!settings) {
      return res.json({ fee60min: 5000, fee90min: 7500 });
    }
    res.json(settings.value);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error fetching fees' });
  }
});

// @desc    Update Session Fees
// @route   POST /api/payment/fees
// @access  Private/Admin
router.post('/fees', protect, admin, async (req, res) => {
  try {
    const { fee60min, fee90min } = req.body;
    let settings = await Settings.findOne({ key: 'fees' });
    if (settings) {
      settings.value = { fee60min, fee90min };
      await settings.save();
    } else {
      await Settings.create({
        key: 'fees',
        value: { fee60min, fee90min }
      });
    }
    res.json({ message: 'Fees updated successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error updating fees' });
  }
});

// @desc    Create Razorpay Order
// @route   POST /api/payment/create-order
// @access  Public/Optional
router.post('/create-order', optionalAuth, async (req, res) => {
  try {
    const { email, currency = 'INR', receipt = `rcpt_${Date.now()}` } = req.body;
    
    // 1. Determine if first session
    let isFirstSession = true;
    if (email) {
      const pastAppointments = await Appointment.countDocuments({ email: email });
      isFirstSession = pastAppointments === 0;
    }

    // 2. Fetch fees from settings
    let feeSettings = await Settings.findOne({ key: 'fees' });
    let fee60min = 5000;
    let fee90min = 7500;
    if (feeSettings && feeSettings.value) {
      fee60min = feeSettings.value.fee60min || 5000;
      fee90min = feeSettings.value.fee90min || 7500;
    }

    // 3. Calculate dynamic amount
    const amount = isFirstSession ? fee60min : fee90min;
    
    const instance = await getRazorpayInstance();
    
    const options = {
      amount: amount * 100, // amount in smallest currency unit (paise)
      currency,
      receipt,
    };

    const order = await instance.orders.create(options);
    res.json(order);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message || 'Error creating order' });
  }
});

// @desc    Get Razorpay Settings (Admin)
// @route   GET /api/payment/settings
// @access  Private/Admin
router.get('/settings', protect, admin, async (req, res) => {
  try {
    let settings = await Settings.findOne({ key: 'razorpay' });
    if (!settings) {
      return res.json({ keyId: '', keySecret: '' });
    }
    res.json(settings.value);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error fetching settings' });
  }
});

// @desc    Update Razorpay Settings (Admin)
// @route   POST /api/payment/settings
// @access  Private/Admin
router.post('/settings', protect, admin, async (req, res) => {
  try {
    const { keyId, keySecret } = req.body;
    
    let settings = await Settings.findOne({ key: 'razorpay' });
    
    if (settings) {
      settings.value = { keyId, keySecret };
      await settings.save();
    } else {
      settings = await Settings.create({
        key: 'razorpay',
        value: { keyId, keySecret }
      });
    }
    
    res.json({ message: 'Razorpay settings updated successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error updating settings' });
  }
});

// @desc    Create Razorpay Order for Course
// @route   POST /api/payment/course-order
// @access  Public
router.post('/course-order', async (req, res) => {
  try {
    const { email, courseId } = req.body;
    
    // Fetch course for dynamic fee and GST
    let course = null;
    if (courseId) {
      course = await Course.findById(courseId);
    }
    if (!course) {
      course = (await Course.findOne({ status: 'Published' })) || (await Course.findOne());
    }

    const basePrice = course?.price || 15000;
    const gstRate = course?.gstRate !== undefined ? course.gstRate : 18;
    const isGstIncluded = !!course?.isGstIncluded;

    const gstAmount = isGstIncluded ? 0 : Math.round((basePrice * gstRate) / 100);
    const finalAmount = isGstIncluded ? basePrice : (basePrice + gstAmount);
    
    const instance = await getRazorpayInstance();
    
    const options = {
      amount: finalAmount * 100, // in paise
      currency: 'INR',
      receipt: `course_${Date.now()}`,
    };

    const order = await instance.orders.create(options);
    res.json({
      ...order,
      basePrice,
      gstRate,
      gstAmount,
      finalAmount,
      isGstIncluded,
    });
  } catch (error) {
    console.error('Course Order Error:', error);
    res.status(500).json({ message: error.message || 'Error creating course order' });
  }
});

// @desc    Verify Course Payment
// @route   POST /api/payment/course-verify
// @access  Public
router.post('/course-verify', async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, token } = req.body;

    const settings = await Settings.findOne({ key: 'razorpay' });
    if (!settings || !settings.value || !settings.value.keySecret) {
      return res.status(500).json({ message: 'Razorpay keys not configured' });
    }

    const body = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac('sha256', settings.value.keySecret)
      .update(body.toString())
      .digest('hex');

    const isAuthentic = expectedSignature === razorpay_signature;

    if (isAuthentic) {
      let coachingToken = null;
      let freeSessions = 0;

      // Decode the user token to update their database record
      if (token) {
        try {
          const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret_key');
          const courseUser = await CourseUser.findByIdAndUpdate(decoded.id, { isPurchased: true }, { returnDocument: 'after' });

          if (courseUser && courseUser.email) {
            const email = courseUser.email.trim();
            const escapedEmail = email.toLowerCase().replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
            const emailRegex = new RegExp(`^${escapedEmail}$`, 'i');

            let coachingUser = await User.findOne({ email: emailRegex });
            if (!coachingUser) {
              coachingUser = new User({
                fullName: courseUser.fullName,
                email,
                password: courseUser.password,
                countryCode: '+91',
                phoneNumber: courseUser.phoneNumber || '',
              });
            }
            if (!coachingUser.courseSessionsGranted) {
              coachingUser.freeSessions = 3;
              coachingUser.courseSessionsGranted = true;
            }
            await coachingUser.save();
            freeSessions = coachingUser.freeSessions;
            coachingToken = jwt.sign({ id: coachingUser._id }, process.env.JWT_SECRET || 'fallback_secret_key', {
              expiresIn: '30d',
            });

            // Find main course or default course
            const primaryCourse = await Course.findOne().sort({ createdAt: 1 });
            let courseTitle = 'The Better Man™';
            let basePrice = 15000;
            let gstRate = 18;
            let isGstIncluded = false;
            let gstAmount = 2700;
            let finalAmount = 17700;

            if (primaryCourse) {
              courseTitle = primaryCourse.title || courseTitle;
              basePrice = primaryCourse.price !== undefined ? primaryCourse.price : 15000;
              gstRate = primaryCourse.gstRate !== undefined ? primaryCourse.gstRate : 18;
              isGstIncluded = Boolean(primaryCourse.isGstIncluded);
              gstAmount = isGstIncluded
                ? Math.round(basePrice - (basePrice / (1 + (gstRate / 100))))
                : Math.round((basePrice * gstRate) / 100);
              finalAmount = isGstIncluded ? basePrice : basePrice + gstAmount;

              await CoursePurchase.findOneAndUpdate(
                { transactionId: razorpay_payment_id },
                {
                  userId: coachingUser._id,
                  courseUserId: courseUser._id,
                  courseId: primaryCourse._id,
                  studentName: courseUser.fullName,
                  studentEmail: email.toLowerCase(),
                  amount: finalAmount,
                  currency: 'INR',
                  paymentStatus: 'Paid',
                  enrollmentStatus: 'Active',
                  transactionId: razorpay_payment_id,
                  razorpayOrderId: razorpay_order_id,
                  razorpayPaymentId: razorpay_payment_id,
                  purchaseDate: new Date(),
                },
                { upsert: true, returnDocument: 'after' }
              );

              // Asynchronously dispatch official tax invoice email
              sendCoursePurchaseInvoiceEmail({
                studentEmail: email.toLowerCase(),
                studentName: courseUser.fullName || 'Valued Student',
                txnId: razorpay_payment_id,
                orderId: razorpay_order_id,
                amount: finalAmount,
                basePrice: isGstIncluded ? (basePrice - gstAmount) : basePrice,
                gstRate,
                gstAmount,
                isGstIncluded,
                courseTitle,
                invoiceItemTitle: primaryCourse?.invoiceItemTitle || `${courseTitle} — Masterclass Lifetime Access`,
                invoiceItemSubtitle: primaryCourse?.invoiceItemSubtitle || 'HD video frameworks, modular curriculum, worksheets & community',
                bonusItemTitle: primaryCourse?.bonusItemTitle || '3 Private 1-on-1 Executive Coaching Sessions with Aarkesh',
                bonusItemSubtitle: primaryCourse?.bonusItemSubtitle || 'Valued at ₹15,000 — 100% Complimentary student bonus',
                purchaseDate: new Date(),
              }).catch(err => console.error('Background purchase invoice email error:', err));
            }

            return res.json({ 
              message: 'Payment verified successfully', 
              success: true,
              coachingToken,
              freeSessions,
              purchase: {
                transactionId: razorpay_payment_id,
                orderId: razorpay_order_id,
                amount: finalAmount,
                basePrice: isGstIncluded ? (basePrice - gstAmount) : basePrice,
                gstRate,
                gstAmount,
                isGstIncluded,
                finalAmount,
                purchaseDate: new Date().toISOString(),
                studentName: courseUser.fullName,
                studentEmail: email,
                courseTitle,
                invoiceItemTitle: primaryCourse?.invoiceItemTitle || `${courseTitle} — Masterclass Lifetime Access`,
                invoiceItemSubtitle: primaryCourse?.invoiceItemSubtitle || 'HD video frameworks, modular curriculum, worksheets & community',
                bonusItemTitle: primaryCourse?.bonusItemTitle || '3 Private 1-on-1 Executive Coaching Sessions with Aarkesh',
                bonusItemSubtitle: primaryCourse?.bonusItemSubtitle || 'Valued at ₹15,000 — 100% Complimentary student bonus',
                freeSessionsGranted: 3
              }
            });
          }
        } catch (err) {
          console.error('Failed to decode token or sync coaching user during verification:', err);
        }
      }

      res.json({ 
        message: 'Payment verified successfully', 
        success: true,
        coachingToken,
        freeSessions
      });
    } else {
      res.status(400).json({ message: 'Invalid payment signature', success: false });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error verifying payment' });
  }
});

// @desc    Record Failed Payment Attempt
// @route   POST /api/payment/course-failed-record
// @access  Public
router.post('/course-failed-record', async (req, res) => {
  try {
    const { 
      email, 
      studentName, 
      razorpay_order_id, 
      razorpay_payment_id, 
      error_code, 
      error_description, 
      error_reason, 
      amount 
    } = req.body;

    const primaryCourse = await Course.findOne().sort({ createdAt: 1 });
    let courseUser = null;
    if (email) {
      courseUser = await CourseUser.findOne({ email: new RegExp(`^${email.trim()}$`, 'i') });
    }

    const failedTxnId = razorpay_payment_id || `failed_${Date.now()}`;
    const failedOrderId = razorpay_order_id || `order_${Date.now()}`;

    const purchase = await CoursePurchase.create({
      userId: null,
      courseUserId: courseUser ? courseUser._id : null,
      courseId: primaryCourse ? primaryCourse._id : new mongoose.Types.ObjectId(),
      studentName: studentName || (courseUser ? courseUser.fullName : 'Guest Student'),
      studentEmail: (email || '').toLowerCase().trim(),
      amount: amount || (primaryCourse ? primaryCourse.price : 11800),
      currency: 'INR',
      paymentStatus: 'Failed',
      enrollmentStatus: 'Revoked',
      transactionId: failedTxnId,
      razorpayOrderId: failedOrderId,
      razorpayPaymentId: razorpay_payment_id || '',
      failureReason: error_description || error_reason || 'Bank transaction declined / user cancelled',
      errorCode: error_code || 'PAYMENT_FAILED',
      purchaseDate: new Date(),
    });

    // Asynchronously dispatch failed payment attempt notification & bill summary email
    if (email) {
      sendCoursePaymentFailedEmail({
        studentEmail: (email || '').toLowerCase().trim(),
        studentName: studentName || (courseUser ? courseUser.fullName : 'Valued Student'),
        txnId: failedTxnId,
        orderId: failedOrderId,
        amount: amount || (primaryCourse ? primaryCourse.price : 11800),
        failureReason: error_description || error_reason || 'Bank transaction declined / user cancelled payment',
        errorCode: error_code || 'PAYMENT_FAILED',
        courseTitle: primaryCourse?.title || 'The Better Man™',
        invoiceItemTitle: primaryCourse?.invoiceItemTitle || `${primaryCourse?.title || 'The Better Man™'} — Masterclass Lifetime Access`,
        purchaseDate: new Date(),
      }).catch(err => console.error('Background payment failed notice email error:', err));
    }

    res.json({ success: true, message: 'Failed payment recorded', purchaseId: purchase._id });
  } catch (err) {
    console.error('Record failed payment error:', err);
    res.status(500).json({ message: 'Error recording failed payment' });
  }
});

export default router;
