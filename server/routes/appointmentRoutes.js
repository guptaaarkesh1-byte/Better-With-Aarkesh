import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import Appointment from '../models/Appointment.js';
import User from '../models/User.js';
import CourseUser from '../models/CourseUser.js';
import CoursePurchase from '../models/CoursePurchase.js';
import Settings from '../models/Settings.js';
import PastClient from '../models/PastClient.js';
import { protect, optionalAuth, admin } from '../middleware/authMiddleware.js';
import { Resend } from 'resend';
import { sendCoachingBookingConfirmationEmail, generateCoachingAgreementPdf } from '../services/coachingAgreementService.js';
import { calculateAndSyncFreeSessions, getDynamicCourseFreeSessions } from '../services/freeSessionService.js';

const router = express.Router();

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'fallback_secret_key', {
    expiresIn: '30d',
  });
};

const getOrCreateBookingUser = async ({ name, email, countryCode, phoneNumber }) => {
  if (!email) return { user: null, courseUser: null, token: null, courseToken: null, isNewAccount: false };

  const cleanEmail = email.trim().toLowerCase();
  const emailRegex = new RegExp(`^${cleanEmail.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i');
  const cleanPhone = (phoneNumber || '').replace(/\D/g, '').slice(-10);

  if (cleanPhone.length === 10) {
    const existingPhoneUser = await User.findOne({
      phoneNumber: new RegExp(`${cleanPhone}$`),
      email: { $ne: cleanEmail },
      isDeleted: { $ne: true }
    });
    if (existingPhoneUser) {
      const err = new Error('This phone number is already registered with another account. Please use your registered email or enter a different phone number.');
      err.status = 400;
      throw err;
    }
  }

  let user = await User.findOne({ email: emailRegex, isDeleted: { $ne: true } });
  let courseUser = await CourseUser.findOne({ email: emailRegex });
  let isNewAccount = false;

  const randomPassword = await bcrypt.hash(Math.random().toString(36) + Date.now(), 10);

  if (!user) {
    isNewAccount = true;
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
    console.log(`✅ Auto-created coaching User account on session booking: ${user.fullName} (${cleanEmail})`);
  } else {
    if (phoneNumber && !user.phoneNumber) {
      user.phoneNumber = phoneNumber;
      if (countryCode) user.countryCode = countryCode;
      await user.save();
    }
  }

  if (!courseUser) {
    courseUser = new CourseUser({
      fullName: name || user.fullName || cleanEmail.split('@')[0],
      email: cleanEmail,
      phoneNumber: phoneNumber || user.phoneNumber || '',
      password: randomPassword,
      authProvider: 'google',
      isPurchased: false
    });
    await courseUser.save();
    console.log(`✅ Auto-created CourseUser account on session booking: ${courseUser.fullName} (${cleanEmail})`);
  }

  const token = generateToken(user._id);
  const courseToken = generateToken(courseUser._id);

  return {
    user,
    courseUser,
    token,
    courseToken,
    isNewAccount
  };
};

// --- Shared Cal.com sync helper (used by paid finalize + free course sessions) ---
const syncAppointmentToCal = async (appointment) => {
  if (!process.env.CAL_API_KEY) return;
  try {
    const startDate = new Date(`${appointment.date} ${appointment.time} GMT+0530`);
    const startISO = startDate.toISOString();

    const eventTypeId = appointment.isFirstSession
      ? (process.env.CAL_EVENT_TYPE_ID_60 || 6769198)
      : (process.env.CAL_EVENT_TYPE_ID_90 || 6769198);

    const payload = {
      eventTypeId: parseInt(eventTypeId),
      start: startISO,
      attendee: {
        name: appointment.name,
        email: appointment.email,
        timeZone: "Asia/Kolkata",
        language: "en"
      }
    };

    const calRes = await fetch('https://api.cal.com/v2/bookings', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.CAL_API_KEY}`,
        'Content-Type': 'application/json',
        'cal-api-version': '2024-08-13'
      },
      body: JSON.stringify(payload)
    });

    if (!calRes.ok) {
      const errData = await calRes.json();
      console.error("Cal.com API error:", errData);
    } else {
      const calData = await calRes.json();
      console.log("Successfully created booking on Cal.com:", calData);
      if (calData?.data?.uid) {
        appointment.calBookingUid = calData.data.uid;
      } else if (calData?.booking?.uid) {
        appointment.calBookingUid = calData.booking.uid;
      }

      if (calData?.data?.location) {
        appointment.meetLink = calData.data.location;
      } else if (calData?.location) {
        appointment.meetLink = calData.location;
      } else if (calData?.data?.locationValue) {
        appointment.meetLink = calData.data.locationValue;
      }

      await appointment.save();
    }
  } catch (calError) {
    console.error("Cal.com API sync error:", calError);
  }
};

// @desc    Check if session is first (60m) or returning (90m) + return updatable fees
// @route   POST /api/appointments/check-session-type
// @access  Public/Optional
router.post('/check-session-type', optionalAuth, async (req, res) => {
  try {
    const rawEmail = (req.body.email || (req.user && req.user.email) || '').toLowerCase().trim();
    const phone = (req.body.phoneNumber || (req.user && req.user.phoneNumber) || '').trim();

    // Fetch updatable fees from settings
    const feeSettings = await Settings.findOne({ key: 'fees' });
    const fee60min = Number(feeSettings?.value?.fee60min) || 5000;
    const fee90min = Number(feeSettings?.value?.fee90min) || 7500;

    let isFirstSession = true;

    // Check if user has ANY past appointments by email or phone (even across account deletions)
    if (rawEmail) {
      const escapedEmail = rawEmail.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
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
      const escapedPhone = phone.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
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

    if (isFirstSession && req.user?._id) {
      const pastUserAppointments = await Appointment.countDocuments({
        userId: req.user._id,
        status: { $in: ['UPCOMING', 'COMPLETED', 'CANCELLED'] },
        paymentStatus: { $ne: 'Failed' }
      });
      if (pastUserAppointments > 0) {
        isFirstSession = false;
      }
    }

    let freeSessions = 0;
    const lookupEmail = (rawEmail || (req.user && req.user.email) || '').toLowerCase().trim();
    if (lookupEmail) {
      const sessionInfo = await calculateAndSyncFreeSessions(lookupEmail);
      freeSessions = sessionInfo.remaining;
    }

    const duration = isFirstSession ? 60 : 90;
    const fee = duration === 90 ? fee90min : fee60min;

    res.json({
      isFirstSession,
      duration,
      fee,
      fee60min,
      fee90min,
      freeSessions,
      hasFreeSessions: freeSessions > 0
    });
  } catch (error) {
    console.error('Error checking session type:', error);
    res.status(500).json({ message: 'Error checking session type' });
  }
});

// @desc    Check if phone number is already registered to another account
// @route   POST /api/appointments/check-phone-availability
// @access  Public
router.post('/check-phone-availability', async (req, res) => {
  try {
    const { phoneNumber, email } = req.body;
    const cleanPhone = (phoneNumber || '').replace(/\D/g, '').slice(-10);
    const cleanEmail = (email || '').trim().toLowerCase();

    if (cleanPhone.length === 10) {
      const userQuery = {
        phoneNumber: new RegExp(`${cleanPhone}$`),
        isDeleted: { $ne: true }
      };
      if (cleanEmail) {
        userQuery.email = { $ne: cleanEmail };
      }

      const existingUser = await User.findOne(userQuery);
      if (existingUser) {
        return res.json({
          available: false,
          message: 'This phone number is already registered with another account.'
        });
      }
    }

    res.json({ available: true });
  } catch (error) {
    console.error('Error checking phone availability:', error);
    res.status(500).json({ message: 'Error checking phone availability' });
  }
});

// POST /api/appointments - Create a new appointment
router.post('/', optionalAuth, async (req, res) => {
  try {
    const { date, time, name, email, countryCode, phoneNumber, source, reason, extra, questionnaireAnswers, paymentId, orderId, signature, useFreeSession } = req.body;

    const normalizedEmail = (email || (req.user && req.user.email) || '').toLowerCase().trim();
    if (!normalizedEmail || !normalizedEmail.endsWith('@gmail.com')) {
      return res.status(400).json({ message: 'Only @gmail.com email addresses are accepted for session booking.' });
    }

    const phone = (phoneNumber || (req.user && req.user.phoneNumber) || '').trim();
    if (phone) {
      const cleanPhone = phone.replace(/\D/g, '').slice(-10);
      if (cleanPhone.length === 10) {
        const phoneOwner = await User.findOne({
          phoneNumber: new RegExp(`${cleanPhone}$`),
          isDeleted: { $ne: true },
          email: { $ne: normalizedEmail }
        });
        if (phoneOwner) {
          return res.status(400).json({ message: 'This phone number is already registered with another account.' });
        }
      }
    }

    // --- Free session booking (3 free sessions included with course purchase) ---
    if (useFreeSession) {
      const escapedEmail = normalizedEmail.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const emailRegex = new RegExp(`^${escapedEmail}$`, 'i');

      const sessionInfo = await calculateAndSyncFreeSessions(normalizedEmail);
      if (!sessionInfo.isCoursePurchaser || sessionInfo.remaining <= 0) {
        return res.status(403).json({ message: 'Free sessions are only available to enrolled students with remaining complimentary sessions.' });
      }

      const courseUser = await CourseUser.findOne({ email: emailRegex, isPurchased: true });
      let coachingUser = await User.findOne({ email: emailRegex });

      // Auto-create coaching user if not present
      if (!coachingUser && courseUser) {
        coachingUser = new User({
          fullName: courseUser.fullName || name,
          email: normalizedEmail,
          password: courseUser.password,
          countryCode: countryCode || '+91',
          phoneNumber: phoneNumber || courseUser.phoneNumber || '',
          freeSessions: sessionInfo.remaining,
          courseSessionsGranted: true
        });
        await coachingUser.save();
      }

      const pastAppointments = await Appointment.countDocuments({ email: emailRegex });
      const isFirstSession = pastAppointments === 0;
      const duration = isFirstSession ? 60 : 90;

      const freeAppointment = new Appointment({
        userId: coachingUser._id,
        date,
        time,
        name,
        email: normalizedEmail,
        countryCode,
        phoneNumber,
        source,
        reason,
        extra,
        questionnaireAnswers: questionnaireAnswers || null,
        status: 'UPCOMING',
        duration,
        isFirstSession,
        amount: 0,
        orderId: 'COURSE_FREE_SESSION',
        paymentStatus: 'Paid',
        isFreeSession: true
      });

      const createdFreeAppointment = await freeAppointment.save();

      // Consume one free session credit
      coachingUser.freeSessions -= 1;
      await coachingUser.save();

      // Sync with Cal.com just like a paid booking
      await syncAppointmentToCal(createdFreeAppointment);

      // Send confirmation emails with dynamic Coaching Agreement PDF attached
      sendCoachingBookingConfirmationEmail({
        appointment: createdFreeAppointment,
        isFreeSession: true,
        freeSessionsRemaining: coachingUser.freeSessions
      }).catch(emailErr => {
        console.error("Failed to send free session confirmation email with PDF agreement:", emailErr);
      });

      const authData = await getOrCreateBookingUser({
        name,
        email: normalizedEmail,
        countryCode,
        phoneNumber
      });

      return res.status(201).json({
        ...createdFreeAppointment.toObject(),
        freeSessionsRemaining: coachingUser.freeSessions,
        token: authData.token,
        courseToken: authData.courseToken,
        userInfo: authData.user ? {
          _id: authData.user._id,
          fullName: authData.user.fullName,
          email: authData.user.email,
          phoneNumber: authData.user.phoneNumber || '',
          countryCode: authData.user.countryCode || '+91',
          photoUrl: authData.user.photoUrl || '',
          freeSessions: coachingUser.freeSessions,
          courseSessionsGranted: true,
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

    // Check if user has past appointments (Registered or Unregistered, even across deleted accounts)
    let isFirstSession = true;
    if (normalizedEmail) {
      const escapedEmail = normalizedEmail.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const pastClient = await PastClient.findOne({ email: new RegExp(`^${escapedEmail}$`, 'i') });
      const pastAppointments = await Appointment.countDocuments({ 
        email: new RegExp(`^${escapedEmail}$`, 'i'),
        status: { $in: ['UPCOMING', 'COMPLETED', 'CANCELLED'] },
        paymentStatus: { $ne: 'Failed' }
      });
      if (pastClient || pastAppointments > 0) isFirstSession = false;
    }
    if (isFirstSession && phone) {
      const escapedPhone = phone.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const pastClientPhone = await PastClient.findOne({ phoneNumber: new RegExp(`^${escapedPhone}$`, 'i') });
      const pastPhoneAppointments = await Appointment.countDocuments({
        phoneNumber: new RegExp(`^${escapedPhone}$`, 'i'),
        status: { $in: ['UPCOMING', 'COMPLETED', 'CANCELLED'] },
        paymentStatus: { $ne: 'Failed' }
      });
      if (pastClientPhone || pastPhoneAppointments > 0) isFirstSession = false;
    }
    if (isFirstSession && req.user?._id) {
      const pastAppointments = await Appointment.countDocuments({ 
        userId: req.user._id,
        status: { $in: ['UPCOMING', 'COMPLETED', 'CANCELLED'] },
        paymentStatus: { $ne: 'Failed' }
      });
      if (pastAppointments > 0) isFirstSession = false;
    }

    const duration = isFirstSession ? 60 : 90;

    // Fetch dynamic fee settings
    const feeSettings = await Settings.findOne({ key: 'fees' });
    const fee60 = Number(feeSettings?.value?.fee60min) || 5000;
    const fee90 = Number(feeSettings?.value?.fee90min) || 7500;
    const dynamicAmount = duration === 90 ? fee90 : fee60;
    const finalAmount = req.body.amount !== undefined && req.body.amount !== null ? Number(req.body.amount) : dynamicAmount;

    // Auto-create or find user account for the booking
    const authData = await getOrCreateBookingUser({
      name,
      email: normalizedEmail,
      countryCode,
      phoneNumber: phone
    });

    const appointment = new Appointment({
      userId: req.user ? req.user._id : (authData.user ? authData.user._id : undefined),
      date,
      time,
      name,
      email: normalizedEmail,
      countryCode,
      phoneNumber: phone,
      source,
      reason,
      extra,
      questionnaireAnswers: questionnaireAnswers || null,
      status: 'UPCOMING',
      duration,
      isFirstSession,
      amount: finalAmount,
      paymentId,
      orderId,
      signature
    });

    const createdAppointment = await appointment.save();

    // Record in PastClient to ensure permanent returning user recognition
    if (normalizedEmail) {
      await PastClient.findOneAndUpdate(
        { email: normalizedEmail },
        { email: normalizedEmail, phoneNumber: phone },
        { upsert: true }
      );
    }

    // Cal.com sync is now handled in /finalize route
    // ---------------------------

    res.status(201).json({
      ...createdAppointment.toObject(),
      token: authData.token,
      courseToken: authData.courseToken,
      userInfo: authData.user ? {
        _id: authData.user._id,
        fullName: authData.user.fullName,
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
    console.error(error);
    res.status(500).json({ message: 'Server error saving appointment' });
  }
});

// PUT /api/appointments/:id/finalize - Mark as Paid and sync with Cal.com
router.put('/:id/finalize', optionalAuth, async (req, res) => {
  try {
    const { paymentId, signature } = req.body;
    const appointment = await Appointment.findById(req.params.id);
    
    if (!appointment) return res.status(404).json({ message: 'Appointment not found' });
    
    appointment.paymentId = paymentId;
    if (signature) appointment.signature = signature;
    appointment.paymentStatus = 'Paid';
    
    const updatedAppointment = await appointment.save();

    // --- Cal.com Integration ---
    if (process.env.CAL_API_KEY) {
      try {
        const startDate = new Date(`${appointment.date} ${appointment.time} GMT+0530`);
        const startISO = startDate.toISOString();
        
        const eventTypeId = appointment.isFirstSession 
          ? (process.env.CAL_EVENT_TYPE_ID_60 || 6769198) 
          : (process.env.CAL_EVENT_TYPE_ID_90 || 6769198);

        const payload = {
          eventTypeId: parseInt(eventTypeId),
          start: startISO,
          attendee: {
            name: appointment.name,
            email: appointment.email,
            timeZone: "Asia/Kolkata",
            language: "en"
          }
        };

        const calRes = await fetch('https://api.cal.com/v2/bookings', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${process.env.CAL_API_KEY}`,
            'Content-Type': 'application/json',
            'cal-api-version': '2024-08-13'
          },
          body: JSON.stringify(payload)
        });

        if (!calRes.ok) {
          const errData = await calRes.json();
          console.error("Cal.com API error:", errData);
        } else {
          const calData = await calRes.json();
          console.log("Successfully created booking on Cal.com:", calData);
          if (calData?.data?.uid) {
            appointment.calBookingUid = calData.data.uid;
          } else if (calData?.booking?.uid) {
             appointment.calBookingUid = calData.booking.uid;
          }
          
          const possibleMeetLink = calData?.data?.meetingUrl || calData?.data?.location || calData?.data?.videoCallUrl || calData?.booking?.meetingUrl || calData?.booking?.location || calData?.data?.metadata?.videoCallUrl;
          if (possibleMeetLink && typeof possibleMeetLink === 'string' && possibleMeetLink.startsWith('http')) {
             appointment.meetLink = possibleMeetLink;
          }

          await appointment.save();
        }
      } catch (calError) {
        console.error("Failed to sync with Cal.com:", calError);
      }
    }
    // ---------------------------
    
    // Send confirmation email with dynamic Coaching Agreement PDF attached
    sendCoachingBookingConfirmationEmail({
      appointment: updatedAppointment,
      isFreeSession: false
    }).catch(emailErr => {
      console.error('Failed to send paid booking confirmation email with PDF agreement:', emailErr);
    });

    const authData = await getOrCreateBookingUser({
      name: appointment.name,
      email: appointment.email,
      countryCode: appointment.countryCode,
      phoneNumber: appointment.phoneNumber
    });

    if (!appointment.userId && authData.user) {
      appointment.userId = authData.user._id;
      await appointment.save();
    }

    res.json({
      ...updatedAppointment.toObject(),
      token: authData.token,
      courseToken: authData.courseToken,
      userInfo: authData.user ? {
        _id: authData.user._id,
        fullName: authData.user.fullName,
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
    console.error(error);
    res.status(500).json({ message: 'Server error finalizing appointment' });
  }
});

// GET /api/appointments/:id/agreement-pdf - Download the official signed Coaching Agreement PDF
router.get('/:id/agreement-pdf', optionalAuth, async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id);
    if (!appointment) return res.status(404).json({ message: 'Appointment not found' });

    const clientName = (appointment.name || 'Client').trim();
    const pdfBuffer = await generateCoachingAgreementPdf({
      clientName,
      clientEmail: appointment.email,
      clientPhone: appointment.phoneNumber || appointment.phone || '',
      sessionDate: appointment.date,
      sessionTime: appointment.time,
      agreementDate: new Date(appointment.createdAt || Date.now()).toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
      }),
      isPackage: Boolean(appointment.isFreeSession || appointment.isCoursePackage),
      modeOfCoaching: 'Online 1-on-1 Video Session (Google Meet)',
      meetLink: appointment.meetLink,
    });

    const safeFilename = `Coaching_Agreement_${clientName.replace(/[^a-zA-Z0-9]/g, '_')}.pdf`;
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${safeFilename}"`);
    res.send(pdfBuffer);
  } catch (err) {
    console.error('Error generating Coaching Agreement PDF:', err);
    res.status(500).json({ message: 'Failed to generate Coaching Agreement PDF' });
  }
});

// PUT /api/appointments/:id/fail - Mark as Failed
router.put('/:id/fail', optionalAuth, async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id);
    
    if (!appointment) return res.status(404).json({ message: 'Appointment not found' });
    
    appointment.paymentStatus = 'Failed';
    const updatedAppointment = await appointment.save();
    
    res.json(updatedAppointment);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error failing appointment' });
  }
});

// GET /api/appointments - Get all appointments for a user
router.get('/', protect, async (req, res) => {
  try {
    const cleanEmail = (req.user.email || '').trim().toLowerCase();
    const escapedEmail = cleanEmail.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

    // Fetch active non-archived appointments by userId OR by email
    const appointments = await Appointment.find({
      $or: [
        { userId: req.user._id },
        { email: new RegExp(`^${escapedEmail}$`, 'i') }
      ],
      isArchived: { $ne: true }
    }).sort({ createdAt: -1 });

    // Deduplicate by _id (in case both userId and email matched)
    const seen = new Set();
    const unique = appointments.filter(a => {
      const key = a._id.toString();
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });

    // Fetch fee settings to ensure accurate fallback for any older records
    const feeSettings = await Settings.findOne({ key: 'fees' });
    const fee60 = feeSettings?.value?.fee60min || 1000;
    const fee90 = feeSettings?.value?.fee90min || 1500;

    const enriched = unique.map(a => {
      const appObj = a.toObject();
      const isFree = Boolean(appObj.isFreeSession || appObj.orderId === 'COURSE_FREE_SESSION');
      const calculatedAmount = isFree 
        ? 0 
        : (appObj.amount !== undefined && appObj.amount !== null 
            ? appObj.amount 
            : (appObj.duration === 90 ? fee90 : fee60));

      return {
        ...appObj,
        amount: calculatedAmount,
        isFreeSession: isFree
      };
    });

    res.json(enriched);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error fetching appointments' });
  }
});

// PUT /api/appointments/:id/link - Link an unassociated appointment to the logged-in user
router.put('/:id/link', protect, async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id);
    if (!appointment) return res.status(404).json({ message: 'Appointment not found' });
    if (appointment.userId) return res.status(400).json({ message: 'Appointment already linked' });
    
    appointment.userId = req.user._id;
    await appointment.save();
    res.json(appointment);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error linking appointment' });
  }
});

// GET /api/appointments/admin - Get all appointments (Admin only)
router.get('/admin', protect, admin, async (req, res) => {
  try {
    const appointments = await Appointment.find()
      .populate('userId', 'name fullName email phone phoneNumber createdAt isDeleted deletedAt')
      .sort({ createdAt: -1 });

    // Fetch fee settings to ensure accurate fallback
    const feeSettings = await Settings.findOne({ key: 'fees' });
    // Fetch all course purchasers for phone & email lookup
    const courseUsers = await CourseUser.find().select('email phoneNumber');
    const coursePurchaserEmails = new Set();
    const courseUserPhoneMap = new Map();
    courseUsers.forEach(c => {
      const em = (c.email || '').toLowerCase().trim();
      if (em) {
        coursePurchaserEmails.add(em);
        if (c.phoneNumber) courseUserPhoneMap.set(em, c.phoneNumber);
      }
    });

    const enrichedAppointments = appointments.map(app => {
      const appObj = app.toObject();
      const appEmail = (appObj.email || (appObj.userId && appObj.userId.email) || '').toLowerCase().trim();
      const isCoursePurchaser = coursePurchaserEmails.has(appEmail);
      const isFree = Boolean(appObj.isFreeSession || appObj.orderId === 'COURSE_FREE_SESSION');
      const calculatedAmount = isFree 
        ? 0 
        : (appObj.amount !== undefined && appObj.amount !== null 
            ? appObj.amount 
            : (appObj.duration === 90 ? fee90 : fee60));
      
      const resolvedPhone = appObj.phoneNumber || appObj.phone || (appObj.userId && (appObj.userId.phoneNumber || appObj.userId.phone)) || courseUserPhoneMap.get(appEmail) || '';
      const resolvedCountryCode = appObj.countryCode || (appObj.userId && appObj.userId.countryCode) || '';

      return {
        ...appObj,
        phoneNumber: resolvedPhone,
        phone: resolvedPhone,
        countryCode: resolvedCountryCode,
        amount: calculatedAmount,
        isCourseMember: isCoursePurchaser || isFree,
        isFreeSession: isFree,
        isUserDeleted: Boolean(app.userId && app.userId.isDeleted),
        userDeletedAt: app.userId ? app.userId.deletedAt : null
      };
    });

    res.json(enrichedAppointments);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error fetching all appointments' });
  }
});

// Status update handler (admin only)
const handleStatusUpdate = async (req, res) => {
  try {
    const rawStatus = req.body.status || '';
    const normalizedStatus = rawStatus.toUpperCase();
    const validStatuses = ['UPCOMING', 'COMPLETED', 'DRAFTS', 'CANCELLED', 'REFUNDED'];
    const finalStatus = validStatuses.includes(normalizedStatus) ? normalizedStatus : rawStatus;

    const appointment = await Appointment.findById(req.params.id);
    
    if (appointment) {
      appointment.status = finalStatus;
      const updatedAppointment = await appointment.save();
      res.json(updatedAppointment);
    } else {
      res.status(404).json({ message: 'Appointment not found' });
    }
  } catch (error) {
    console.error('Server error updating appointment status:', error);
    res.status(500).json({ message: 'Server error updating appointment status' });
  }
};

// PUT /api/appointments/admin/:id/status & PUT /api/appointments/:id/status - Update appointment status
router.put('/admin/:id/status', protect, admin, handleStatusUpdate);
router.put('/:id/status', protect, admin, handleStatusUpdate);


// PUT /api/appointments/admin/:id/notes - Update coach's session notes
router.put('/admin/:id/notes', protect, admin, async (req, res) => {
  try {
    const { notes, coachNotes } = req.body;
    const notesToSave = notes !== undefined ? notes : (coachNotes !== undefined ? coachNotes : '');
    
    const appointment = await Appointment.findById(req.params.id);
    if (!appointment) {
      return res.status(404).json({ message: 'Appointment not found' });
    }

    appointment.coachNotes = notesToSave;
    const updatedAppointment = await appointment.save();
    
    res.json(updatedAppointment);
  } catch (error) {
    console.error('Failed to update coach notes:', error);
    res.status(500).json({ message: 'Server error updating coach notes' });
  }
});

// PUT & POST /api/appointments/:id/notes - Update coach notes (Public/Admin endpoint)
router.all('/:id/notes', optionalAuth, async (req, res) => {
  try {
    const { notes, coachNotes } = req.body;
    const notesToSave = notes !== undefined ? notes : (coachNotes !== undefined ? coachNotes : '');
    
    const appointment = await Appointment.findById(req.params.id);
    if (!appointment) {
      return res.status(404).json({ message: 'Appointment not found' });
    }

    appointment.coachNotes = notesToSave;
    const updatedAppointment = await appointment.save();
    
    res.json(updatedAppointment);
  } catch (error) {
    console.error('Failed to update coach notes:', error);
    res.status(500).json({ message: 'Server error updating coach notes' });
  }
});

// POST /api/appointments/:id/reschedule - Submit a reschedule request (Standard / > 48h)
router.post('/:id/reschedule', optionalAuth, async (req, res) => {
  try {
    const { date, time, reason } = req.body;
    const appointment = await Appointment.findById(req.params.id);
    
    if (!appointment) return res.status(404).json({ message: 'Appointment not found' });
    if (appointment.status === 'RESCHEDULED' || appointment.rescheduleRequest?.status === 'APPROVED' || Boolean(appointment.rescheduledFrom || appointment.rescheduleRequest?.originalDate)) {
      return res.status(400).json({ message: 'This session has already been rescheduled once. Further reschedules are not permitted.' });
    }
    if (req.user && appointment.userId && !req.user.isAdmin) {
      const isOwnerId = appointment.userId.toString() === req.user._id.toString();
      const isOwnerEmail = appointment.email && req.user.email && appointment.email.toLowerCase() === req.user.email.toLowerCase();
      if (!isOwnerId && !isOwnerEmail) {
        return res.status(401).json({ message: 'Not authorized for this appointment' });
      }
    }

    // Calculate hours remaining until the scheduled session
    let hoursRemaining = null;
    let isWithin48Hours = false;
    try {
      const scheduledDateTime = new Date(`${appointment.date} ${appointment.time} GMT+0530`);
      if (!isNaN(scheduledDateTime.getTime())) {
        const diffMs = scheduledDateTime - new Date();
        hoursRemaining = Math.round(diffMs / (1000 * 60 * 60));
        isWithin48Hours = hoursRemaining < 48;
      }
    } catch (dateErr) {
      console.error('Error calculating hours remaining:', dateErr);
    }

    appointment.rescheduleRequest = {
      originalDate: appointment.date,
      originalTime: appointment.time,
      date,
      time,
      reason,
      status: 'PENDING',
      requestedAt: new Date(),
      isWithin48Hours,
      hoursRemainingAtRequest: hoursRemaining,
    };
    
    await appointment.save();
    res.json(appointment);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error submitting reschedule request' });
  }
});

// POST /api/appointments/:id/reschedule-paid - Reschedule with payment (within 48 hours)
router.post('/:id/reschedule-paid', optionalAuth, async (req, res) => {
  try {
    const { date, time, reason, paymentId, orderId, signature, amount } = req.body;
    const appointment = await Appointment.findById(req.params.id);
    
    if (!appointment) return res.status(404).json({ message: 'Appointment not found' });
    if (appointment.status === 'RESCHEDULED' || appointment.rescheduleRequest?.status === 'APPROVED' || Boolean(appointment.rescheduledFrom || appointment.rescheduleRequest?.originalDate)) {
      return res.status(400).json({ message: 'This session has already been rescheduled once. Further reschedules are not permitted.' });
    }
    if (req.user && appointment.userId && !req.user.isAdmin) {
      const isOwnerId = appointment.userId.toString() === req.user._id.toString();
      const isOwnerEmail = appointment.email && req.user.email && appointment.email.toLowerCase() === req.user.email.toLowerCase();
      if (!isOwnerId && !isOwnerEmail) {
        return res.status(401).json({ message: 'Not authorized for this appointment' });
      }
    }

    if (!date || !time) {
      return res.status(400).json({ message: 'New date and time are required.' });
    }

    // Do NOT auto-approve. Require Admin permission.
    // Keep current appointment slot intact, store payment and set rescheduleRequest as PENDING.
    appointment.rescheduleRequest = {
      originalDate: appointment.date,
      originalTime: appointment.time,
      date,
      time,
      reason,
      status: 'PENDING',
      requestedAt: new Date(),
      isWithin48Hours: true,
      hoursRemainingAtRequest: 0,
      rescheduleFeePaid: true,
      reschedulePaymentId: paymentId || '',
      rescheduleOrderId: orderId || '',
      rescheduleAmount: Number(amount) || 5000,
      paidAt: new Date(),
    };

    await appointment.save();

    // Send notification emails about PENDING paid reschedule request
    if (process.env.RESEND_API_KEY) {
      try {
        const resend = new Resend(process.env.RESEND_API_KEY);
        const emailHtmlTemplate = `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #333;">
            <h2 style="color: #c9542f;">Payment Received • Reschedule Request Submitted</h2>
            <p>Hi ${appointment.name},</p>
            <p>Your payment of ₹${amount || 5000} for the late reschedule fee was received successfully. Your reschedule request has been submitted and is currently <strong>pending coach approval</strong>.</p>
            <div style="background: #fbf0eb; border: 1px solid #e8c4e2; padding: 20px; border-radius: 12px; margin: 20px 0;">
              <strong>Current Scheduled Slot:</strong> ${appointment.date} at ${appointment.time}<br>
              <strong>Requested New Slot:</strong> ${date} at ${time}<br>
              ${paymentId ? `<strong>Payment ID:</strong> ${paymentId}<br>` : ''}
              <strong>Status:</strong> Pending Coach Confirmation<br>
            </div>
            <p>You will receive a confirmation email once your new time is confirmed by Coach Aarkesh.</p>
          </div>
        `;

        const coachEmailTemplate = `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #333;">
            <h2 style="color: #111010;">Paid Reschedule Request Pending Approval</h2>
            <p><strong>${appointment.name}</strong> (${appointment.email}) has requested a late reschedule and paid the ₹${amount || 5000} fee.</p>
            <div style="background: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <strong>Client:</strong> ${appointment.name} (${appointment.email})<br>
              <strong>Current Slot:</strong> ${appointment.date} at ${appointment.time}<br>
              <strong>Requested Slot:</strong> ${date} at ${time}<br>
              <strong>Fee Paid:</strong> ₹${amount || 5000}<br>
              ${paymentId ? `<strong>Payment ID:</strong> ${paymentId}<br>` : ''}
              <strong>Reason:</strong> ${reason || 'None provided'}<br>
            </div>
            <p>Please review and approve or keep the old time in your Admin Dashboard.</p>
          </div>
        `;

        await Promise.all([
          resend.emails.send({
            from: process.env.EMAIL_FROM || 'Better With Aarkesh Support <onboarding@resend.dev>',
            to: process.env.ADMIN_EMAIL || 'guptaaarkesh1@gmail.com',
            subject: `Paid Reschedule Request Pending Approval - ${appointment.name}`,
            html: coachEmailTemplate,
          }),
          resend.emails.send({
            from: process.env.EMAIL_FROM || 'Better With Aarkesh Support <onboarding@resend.dev>',
            to: appointment.email,
            subject: 'Late reschedule payment received (Pending coach confirmation)',
            html: emailHtmlTemplate,
          })
        ]);
      } catch (emailErr) {
        console.error("Failed to send reschedule email", emailErr);
      }
    }

    res.json(appointment);
  } catch (error) {
    console.error('Error processing paid reschedule:', error);
    res.status(500).json({ message: 'Server error processing paid reschedule' });
  }
});

// POST /api/appointments/:id/reschedule-credit - Reschedule using 1 Free Session Credit (e.g. within 48h)
router.post('/:id/reschedule-credit', optionalAuth, async (req, res) => {
  try {
    const { date, time, reason } = req.body;
    const appointment = await Appointment.findById(req.params.id);
    
    if (!appointment) return res.status(404).json({ message: 'Appointment not found' });
    if (appointment.status === 'RESCHEDULED' || appointment.rescheduleRequest?.status === 'APPROVED' || Boolean(appointment.rescheduledFrom || appointment.rescheduleRequest?.originalDate)) {
      return res.status(400).json({ message: 'This session has already been rescheduled once. Further reschedules are not permitted.' });
    }
    if (req.user && appointment.userId && !req.user.isAdmin) {
      const isOwnerId = appointment.userId.toString() === req.user._id.toString();
      const isOwnerEmail = appointment.email && req.user.email && appointment.email.toLowerCase() === req.user.email.toLowerCase();
      if (!isOwnerId && !isOwnerEmail) {
        return res.status(401).json({ message: 'Not authorized for this appointment' });
      }
    }

    if (!date || !time) {
      return res.status(400).json({ message: 'New date and time are required.' });
    }

    // Find User and verify free session credit
    const normalizedEmail = (appointment.email || (req.user && req.user.email) || '').toLowerCase().trim();
    const escapedEmail = normalizedEmail.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const emailRegex = new RegExp(`^${escapedEmail}$`, 'i');
    
    let coachingUser = await User.findOne({ email: emailRegex });
    if (!coachingUser && req.user?._id) {
      coachingUser = await User.findById(req.user._id);
    }
    const courseUser = await CourseUser.findOne({ email: emailRegex, isPurchased: true });

    // Calculate real remaining credits
    const relevantAppointments = await Appointment.find({
      email: emailRegex,
      status: { $ne: 'CANCELLED' }
    });

    let claimedAppointmentsCount = 0;
    for (const app of relevantAppointments) {
      if (app.isFreeSession || app.orderId === 'COURSE_FREE_SESSION') {
        claimedAppointmentsCount += 1;
      }
      if (app.rescheduleRequest && app.rescheduleRequest.usedFreeSessionCredit === true) {
        claimedAppointmentsCount += 1;
      }
    }

    const sessionInfo = await calculateAndSyncFreeSessions(appointment.email);
    if (!sessionInfo.isCoursePurchaser || sessionInfo.remaining <= 0) {
      return res.status(400).json({ message: 'You have no free session credits remaining.' });
    }
    const availableCredits = sessionInfo.remaining;

    // Deduct / hold 1 free session credit
    const newRemainingCredits = Math.max(0, availableCredits - 1);
    if (coachingUser) {
      coachingUser.freeSessions = newRemainingCredits;
      await coachingUser.save();
    }

    // Do NOT auto-approve. Require Admin permission.
    // Keep current appointment date & time intact, mark rescheduleRequest as PENDING.
    appointment.rescheduleRequest = {
      originalDate: appointment.date,
      originalTime: appointment.time,
      date,
      time,
      reason,
      status: 'PENDING',
      requestedAt: new Date(),
      isWithin48Hours: true,
      hoursRemainingAtRequest: 0,
      rescheduleFeePaid: false,
      usedFreeSessionCredit: true,
      reschedulePaymentId: 'FREE_CREDIT_USED',
      rescheduleOrderId: 'FREE_CREDIT_RESCHEDULE',
      rescheduleAmount: 0,
      paidAt: new Date(),
    };

    await appointment.save();

    // Send notification emails about PENDING reschedule request
    if (process.env.RESEND_API_KEY) {
      try {
        const resend = new Resend(process.env.RESEND_API_KEY);
        const emailHtmlTemplate = `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #333;">
            <h2 style="color: #c9542f;">Reschedule Request Submitted</h2>
            <p>Hi ${appointment.name},</p>
            <p>Your request to reschedule your 1-on-1 coaching session using 1 Complimentary Session Credit has been received and is currently <strong>pending coach approval</strong>.</p>
            <div style="background: #fbf0eb; border: 1px solid #e8c4e2; padding: 20px; border-radius: 12px; margin: 20px 0;">
              <strong>Current Scheduled Slot:</strong> ${appointment.date} at ${appointment.time}<br>
              <strong>Requested New Slot:</strong> ${date} at ${time}<br>
              <strong>Remaining Session Credits:</strong> ${coachingUser ? coachingUser.freeSessions : 0}<br>
              <strong>Status:</strong> Pending Coach Confirmation<br>
            </div>
            <p>You will receive a confirmation email once your new time is confirmed.</p>
          </div>
        `;

        const coachEmailTemplate = `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #333;">
            <h2 style="color: #111010;">New Reschedule Request Pending Approval</h2>
            <p><strong>${appointment.name}</strong> (${appointment.email}) has requested to reschedule their 1-on-1 coaching session using a complimentary session credit.</p>
            <div style="background: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <strong>Current Time:</strong> ${appointment.date} at ${appointment.time}<br>
              <strong>Requested Time:</strong> ${date} at ${time}<br>
              <strong>Client Reason:</strong> ${reason || 'None provided'}<br>
              <strong>Credit Used:</strong> 1 Complimentary Session Credit (Held on account)<br>
            </div>
            <p>Please review and approve or keep the old time in your Admin Dashboard.</p>
          </div>
        `;

        await Promise.all([
          resend.emails.send({
            from: process.env.EMAIL_FROM || 'Better With Aarkesh Support <onboarding@resend.dev>',
            to: process.env.ADMIN_EMAIL || 'guptaaarkesh1@gmail.com',
            subject: `Reschedule Request Pending Approval - ${appointment.name}`,
            html: coachEmailTemplate,
          }),
          resend.emails.send({
            from: process.env.EMAIL_FROM || 'Better With Aarkesh Support <onboarding@resend.dev>',
            to: appointment.email,
            subject: 'Reschedule request submitted (Pending coach confirmation)',
            html: emailHtmlTemplate,
          })
        ]);
      } catch (emailErr) {
        console.error("Failed to send reschedule email", emailErr);
      }
    }

    res.json({
      ...appointment.toObject(),
      freeSessionsRemaining: coachingUser.freeSessions
    });
  } catch (error) {
    console.error('Error processing credit reschedule:', error);
    res.status(500).json({ message: 'Server error processing credit reschedule' });
  }
});

// GET /api/appointments/admin/reschedule-requests - Get all pending reschedule requests (Admin only)
router.get('/admin/reschedule-requests', protect, admin, async (req, res) => {
  try {
    const requests = await Appointment.find({ 'rescheduleRequest.status': 'PENDING' })
      .populate('userId', 'name email phone')
      .sort({ updatedAt: -1 });
    res.json(requests);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error fetching reschedule requests' });
  }
});

// POST /api/appointments/admin/:id/approve-reschedule - Approve reschedule request
// Helper: Execute approve reschedule
const executeApproveReschedule = async (appointmentId) => {
  const appointment = await Appointment.findById(appointmentId);
  if (!appointment) throw new Error('Appointment not found');
  if (!appointment.rescheduleRequest || appointment.rescheduleRequest.status !== 'PENDING') {
    throw new Error('No pending reschedule request found');
  }

  const { date, time } = appointment.rescheduleRequest;

  // --- Cal.com Integration ---
  if (process.env.CAL_API_KEY) {
    try {
      if (appointment.calBookingUid) {
        await fetch(`https://api.cal.com/v2/bookings/${appointment.calBookingUid}/cancel`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${process.env.CAL_API_KEY}`,
            'Content-Type': 'application/json',
            'cal-api-version': '2024-08-13'
          },
          body: JSON.stringify({ reason: "Rescheduled by user request approved by admin" })
        });
      }

      const startDate = new Date(`${date} ${time} GMT+0530`);
      const startISO = startDate.toISOString();
      
      const eventTypeId = appointment.isFirstSession 
        ? (process.env.CAL_EVENT_TYPE_ID_60 || 6769198) 
        : (process.env.CAL_EVENT_TYPE_ID_90 || 6769198);

      const payload = {
        eventTypeId: parseInt(eventTypeId),
        start: startISO,
        attendee: {
          name: appointment.name,
          email: appointment.email,
          timeZone: "Asia/Calcutta",
          language: "en"
        }
      };

      const calRes = await fetch('https://api.cal.com/v2/bookings', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.CAL_API_KEY}`,
          'Content-Type': 'application/json',
          'cal-api-version': '2024-08-13'
        },
        body: JSON.stringify(payload)
      });

      if (calRes.ok) {
        const calData = await calRes.json();
        if (calData?.data?.uid) appointment.calBookingUid = calData.data.uid;
        else if (calData?.booking?.uid) appointment.calBookingUid = calData.booking.uid;
        
        const possibleMeetLink = calData?.data?.meetingUrl || calData?.data?.location || calData?.data?.videoCallUrl || calData?.booking?.meetingUrl || calData?.booking?.location || calData?.data?.metadata?.videoCallUrl;
        if (possibleMeetLink && typeof possibleMeetLink === 'string' && possibleMeetLink.startsWith('http')) {
          appointment.meetLink = possibleMeetLink;
        }
      }
    } catch (calError) {
      console.error("Failed to sync reschedule with Cal.com:", calError);
    }
  }

  // Officially update appointment schedule
  if (!appointment.rescheduleRequest.originalDate) {
    appointment.rescheduleRequest.originalDate = appointment.date;
  }
  if (!appointment.rescheduleRequest.originalTime) {
    appointment.rescheduleRequest.originalTime = appointment.time;
  }
  appointment.date = date;
  appointment.time = time;
  appointment.status = 'UPCOMING';
  appointment.rescheduleRequest.status = 'APPROVED';
  await appointment.save();

  // Send confirmation emails
  if (process.env.RESEND_API_KEY) {
    try {
      const resend = new Resend(process.env.RESEND_API_KEY);
      const emailHtmlTemplate = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #333;">
          <h2 style="color: #c9542f;">Your Session Reschedule Has Been Approved</h2>
          <p>Hi ${appointment.name},</p>
          <p>Your request to reschedule your coaching session has been approved by Coach Aarkesh.</p>
          <div style="background: #fbf0eb; border: 1px solid #e8c4e2; padding: 20px; border-radius: 12px; margin: 20px 0;">
            <strong>New Date:</strong> ${appointment.date}<br>
            <strong>New Time:</strong> ${appointment.time}<br>
            <strong>Duration:</strong> ${appointment.duration || 60} Minutes<br>
            ${appointment.meetLink ? `<strong>Meeting Link:</strong> <a href="${appointment.meetLink}" style="color: #c9542f;">Click here to join Google Meet</a><br>` : ''}
          </div>
          <p>We look forward to connecting with you!</p>
        </div>
      `;

      const coachEmailTemplate = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #333;">
          <h2>Session Rescheduled Confirmed</h2>
          <p>You have approved the reschedule request for <strong>${appointment.name}</strong>.</p>
          <div style="background: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <strong>New Date:</strong> ${appointment.date}<br>
            <strong>New Time:</strong> ${appointment.time}<br>
            ${appointment.meetLink ? `<strong>Meeting Link:</strong> <a href="${appointment.meetLink}" style="color: #c79c6e;">Join Link</a><br>` : ''}
          </div>
        </div>
      `;

      const clientUser = await User.findOne({ email: appointment.email });
      const allowChangesEmail = clientUser?.notificationPreferences?.emailChanges ?? true;

      const emailPromises = [
        resend.emails.send({
          from: process.env.EMAIL_FROM || 'Better With Aarkesh Support <onboarding@resend.dev>',
          to: process.env.ADMIN_EMAIL || 'guptaaarkesh1@gmail.com',
          subject: `Reschedule confirmed for ${appointment.name}`,
          html: coachEmailTemplate,
        })
      ];

      if (allowChangesEmail) {
        emailPromises.push(
          resend.emails.send({
            from: process.env.EMAIL_FROM || 'Better With Aarkesh Support <onboarding@resend.dev>',
            to: appointment.email,
            subject: 'Your session reschedule has been approved',
            html: emailHtmlTemplate,
          })
        );
      }

      await Promise.all(emailPromises);
    } catch (emailErr) {
      console.error("Failed to send reschedule confirmation email", emailErr);
    }
  }

  return appointment;
};

// Helper: Execute reject/decline reschedule
const executeRejectReschedule = async (appointmentId) => {
  const appointment = await Appointment.findById(appointmentId);
  if (!appointment) throw new Error('Appointment not found');
  if (!appointment.rescheduleRequest || appointment.rescheduleRequest.status !== 'PENDING') {
    throw new Error('No pending reschedule request found');
  }

  // If a free session credit was held for this request, refund it
  if (appointment.rescheduleRequest.usedFreeSessionCredit === true) {
    try {
      const coachingUser = await User.findOne({ email: appointment.email });
      if (coachingUser) {
        coachingUser.freeSessions = (coachingUser.freeSessions || 0) + 1;
        await coachingUser.save();
      }
    } catch (refundCreditErr) {
      console.error('Failed to refund free session credit on decline:', refundCreditErr);
    }
  }

  // If a paid reschedule fee was paid and coach rejects, initiate Razorpay refund if possible
  if (appointment.rescheduleRequest.rescheduleFeePaid === true && appointment.rescheduleRequest.reschedulePaymentId) {
    try {
      if (process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET) {
        const Razorpay = (await import('razorpay')).default;
        const razorpay = new Razorpay({
          key_id: process.env.RAZORPAY_KEY_ID,
          key_secret: process.env.RAZORPAY_KEY_SECRET,
        });
        await razorpay.payments.refund(appointment.rescheduleRequest.reschedulePaymentId, {
          amount: Math.round((appointment.rescheduleRequest.rescheduleAmount || 5000) * 100),
          notes: { reason: "Reschedule request declined by coach" }
        });
        console.log("Successfully refunded reschedule fee via Razorpay");
      }
    } catch (rzpErr) {
      console.error("Razorpay refund error on reschedule decline:", rzpErr?.message || rzpErr);
    }
  }

  appointment.rescheduleRequest.status = 'REJECTED';
  await appointment.save();

  // Send email informing user that original time is kept
  if (process.env.RESEND_API_KEY) {
    try {
      const resend = new Resend(process.env.RESEND_API_KEY);
      const emailHtml = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #333;">
          <h2>Session Reschedule Update</h2>
          <p>Hi ${appointment.name},</p>
          <p>Your requested reschedule time could not be accommodated. Your existing session remains scheduled as originally confirmed:</p>
          <div style="background: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <strong>Scheduled Date:</strong> ${appointment.date}<br>
            <strong>Scheduled Time:</strong> ${appointment.time}<br>
            ${appointment.meetLink ? `<strong>Meeting Link:</strong> <a href="${appointment.meetLink}" style="color: #c9542f;">Join Meeting</a><br>` : ''}
          </div>
          ${appointment.rescheduleRequest?.usedFreeSessionCredit ? '<p>Your complimentary session credit has been refunded back to your account balance.</p>' : ''}
          ${appointment.rescheduleRequest?.rescheduleFeePaid ? '<p>Your paid late reschedule fee of ₹' + (appointment.rescheduleRequest?.rescheduleAmount || 5000) + ' has been initiated for refund back to your payment method (5-7 business days).</p>' : ''}
        </div>
      `;
      await resend.emails.send({
        from: process.env.EMAIL_FROM || 'Better With Aarkesh Support <onboarding@resend.dev>',
        to: appointment.email,
        subject: 'Update on your session reschedule request',
        html: emailHtml,
      });
    } catch (e) {
      console.error('Failed to send decline email:', e);
    }
  }

  return appointment;
};

// POST /api/appointments/admin/:id/approve-reschedule - Approve reschedule request
router.post('/admin/:id/approve-reschedule', protect, admin, async (req, res) => {
  try {
    const updated = await executeApproveReschedule(req.params.id);
    res.json(updated);
  } catch (error) {
    console.error('Error approving reschedule:', error);
    res.status(500).json({ message: error.message || 'Server error approving reschedule' });
  }
});

// POST /api/appointments/admin/:id/reject-reschedule - Reject reschedule request
router.post('/admin/:id/reject-reschedule', protect, admin, async (req, res) => {
  try {
    const updated = await executeRejectReschedule(req.params.id);
    res.json(updated);
  } catch (error) {
    console.error('Error rejecting reschedule:', error);
    res.status(500).json({ message: error.message || 'Server error rejecting reschedule' });
  }
});

// PUT /api/appointments/:id/reschedule-admin & PUT /api/appointments/admin/:id/reschedule-admin
const handleAdminReschedule = async (req, res) => {
  try {
    const action = (req.body.action || '').toLowerCase();
    if (action === 'approve') {
      const updated = await executeApproveReschedule(req.params.id);
      return res.json(updated);
    } else {
      const updated = await executeRejectReschedule(req.params.id);
      return res.json(updated);
    }
  } catch (error) {
    console.error('Error handling admin reschedule:', error);
    res.status(500).json({ message: error.message || 'Server error processing reschedule action' });
  }
};
router.put('/:id/reschedule-admin', protect, admin, handleAdminReschedule);
router.put('/admin/:id/reschedule-admin', protect, admin, handleAdminReschedule);

// POST /api/appointments/admin/:id/issue-refund - Emergency / Manual Refund for an Appointment (Admin only)
router.post('/admin/:id/issue-refund', protect, admin, async (req, res) => {
  try {
    const { reason, refundAmount } = req.body;
    const appointment = await Appointment.findById(req.params.id);
    
    if (!appointment) return res.status(404).json({ message: 'Appointment not found' });

    // 1. Cancel / Release Cal.com booking if present
    if (process.env.CAL_API_KEY && appointment.calBookingUid) {
      try {
        await fetch(`https://api.cal.com/v2/bookings/${appointment.calBookingUid}/cancel`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${process.env.CAL_API_KEY}`,
            'Content-Type': 'application/json',
            'cal-api-version': '2024-08-13'
          },
          body: JSON.stringify({ reason: reason || "Cancelled & Refunded by Admin" })
        });
      } catch (calError) {
        console.error("Failed to cancel Cal.com booking on refund:", calError);
      }
    }

    // 2. Mark status as REFUNDED
    const finalRefundAmount = refundAmount !== undefined && refundAmount !== null ? Number(refundAmount) : (appointment.amount || 0);
    appointment.status = 'REFUNDED';
    appointment.refundStatus = 'REFUNDED';
    appointment.refundReason = reason || 'Admin issued emergency refund';
    appointment.refundAmount = finalRefundAmount;
    appointment.refundedAt = new Date();

    if (appointment.rescheduleRequest && appointment.rescheduleRequest.status === 'PENDING') {
      appointment.rescheduleRequest.status = 'REJECTED';
    }

    // 3. If it was a free course session, restore the credit to user
    if (appointment.isFreeSession && !appointment.freeSessionRefunded) {
      try {
        const refundedUser = await User.findOne({ email: appointment.email });
        if (refundedUser) {
          refundedUser.freeSessions = (refundedUser.freeSessions || 0) + 1;
          await refundedUser.save();
          appointment.freeSessionRefunded = true;
        }
      } catch (freeErr) {
        console.error("Failed to restore free session credit on refund:", freeErr);
      }
    }

    await appointment.save();

    // 4. Send Confirmation Email via Resend
    if (process.env.RESEND_API_KEY) {
      try {
        const resend = new Resend(process.env.RESEND_API_KEY);
        const emailHtml = `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #222; line-height: 1.6;">
            <h2 style="color: #c79c6e; margin-bottom: 8px;">Session Refund Confirmation</h2>
            <p>Hi <strong>${appointment.name}</strong>,</p>
            <p>We are writing to confirm that your 1:1 coaching session scheduled on <strong>${appointment.date} at ${appointment.time}</strong> has been cancelled and a refund has been processed.</p>
            
            <div style="background: #faf7f2; border: 1px solid #e8dbce; border-left: 4px solid #c79c6e; padding: 18px 20px; border-radius: 8px; margin: 24px 0;">
              <p style="margin: 0 0 8px 0; font-size: 14px;"><strong>Refund Amount:</strong> ₹${finalRefundAmount.toLocaleString('en-IN')}</p>
              <p style="margin: 0 0 8px 0; font-size: 14px;"><strong>Reason / Note:</strong> ${appointment.refundReason}</p>
              <p style="margin: 0; font-size: 14px;"><strong>Processed On:</strong> ${new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
            </div>

            <p style="font-size: 13px; color: #666;">
              Please allow 5-7 business days for the funds to reflect in your original payment account.
            </p>
            <p style="margin-top: 24px;">Warm regards,<br><strong>Aarkesh Gupta & Team</strong><br><span style="color: #888; font-size: 12px;">Better With Aarkesh</span></p>
          </div>
        `;

        await resend.emails.send({
          from: process.env.EMAIL_FROM || 'Better With Aarkesh Support <onboarding@resend.dev>',
          to: appointment.email,
          subject: 'Session Refund Confirmation - Better With Aarkesh',
          html: emailHtml,
        });
      } catch (emailErr) {
        console.error("Failed to send refund email:", emailErr);
      }
    }

    res.json({ message: 'Refund issued successfully', appointment });
  } catch (error) {
    console.error('Error issuing refund:', error);
    res.status(500).json({ message: 'Server error processing refund' });
  }
});

// PUT /api/appointments/:id/cancel - Cancel an appointment
router.put('/:id/cancel', optionalAuth, async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id);
    if (!appointment) return res.status(404).json({ message: 'Appointment not found' });
    
    // Only allow cancellation of UPCOMING appointments
    if (appointment.status !== 'UPCOMING') {
      return res.status(400).json({ message: 'Can only cancel upcoming appointments' });
    }

    appointment.status = 'CANCELLED';
    await appointment.save();

    // --- Credit the free course session back on cancellation ---
    if (appointment.isFreeSession && !appointment.freeSessionRefunded) {
      try {
        const refundedUser = await User.findOne({ email: appointment.email });
        if (refundedUser) {
          refundedUser.freeSessions = (refundedUser.freeSessions || 0) + 1;
          await refundedUser.save();
          appointment.freeSessionRefunded = true;
          await appointment.save();
        }
      } catch (refundErr) {
        console.error('Failed to refund free session credit:', refundErr);
      }
    }

    // --- Cal.com Integration ---
    if (process.env.CAL_API_KEY && appointment.calBookingUid) {
      try {
        const calRes = await fetch(`https://api.cal.com/v2/bookings/${appointment.calBookingUid}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${process.env.CAL_API_KEY}`,
            'cal-api-version': '2024-08-13'
          }
        });

        if (!calRes.ok) {
          console.error("Failed to cancel booking on Cal.com:", await calRes.text());
        } else {
          console.log("Successfully cancelled booking on Cal.com");
        }
      } catch (calError) {
        console.error("Cal.com API cancellation error:", calError);
      }
    }

    // --- Send Emails ---
    if (process.env.RESEND_API_KEY) {
      try {
        const resend = new Resend(process.env.RESEND_API_KEY);
        
        const clientEmailHtml = `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #333;">
            <h2>Appointment Cancelled</h2>
            <p>Hi ${appointment.name},</p>
            <p>Your upcoming coaching session has been cancelled.</p>
            <div style="background: #fdf5f5; padding: 20px; border-left: 4px solid #ef4444; border-radius: 4px; margin: 20px 0;">
              <strong>Original Date:</strong> ${appointment.date}<br>
              <strong>Original Time:</strong> ${appointment.time}<br>
            </div>
            <p>If you'd like to book a new session, please visit our website.</p>
          </div>
        `;

        const coachEmailHtml = `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #333;">
            <h2>Session Cancelled</h2>
            <p>An upcoming session with <strong>${appointment.name}</strong> has been cancelled.</p>
            <div style="background: #fdf5f5; padding: 20px; border-left: 4px solid #ef4444; border-radius: 4px; margin: 20px 0;">
              <strong>Date:</strong> ${appointment.date}<br>
              <strong>Time:</strong> ${appointment.time}<br>
              <strong>Client:</strong> ${appointment.name} (${appointment.email})<br>
            </div>
          </div>
        `;

        const clientUser = await User.findOne({ email: appointment.email });
        const allowChangesEmail = clientUser?.notificationPreferences?.emailChanges ?? true;

        const cancelEmailPromises = [
          resend.emails.send({
            from: process.env.EMAIL_FROM || 'Better With Aarkesh Support <onboarding@resend.dev>',
            to: process.env.ADMIN_EMAIL || 'guptaaarkesh1@gmail.com',
            subject: `Session Cancelled: ${appointment.name}`,
            html: coachEmailHtml,
          })
        ];

        if (allowChangesEmail) {
          cancelEmailPromises.push(
            resend.emails.send({
              from: process.env.EMAIL_FROM || 'Better With Aarkesh Support <onboarding@resend.dev>',
              to: appointment.email,
              subject: 'Appointment Cancelled',
              html: clientEmailHtml,
            })
          );
        }

        await Promise.all(cancelEmailPromises);
      } catch (emailErr) {
        console.error("Failed to send cancellation emails", emailErr);
      }
    }

    res.json(appointment);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error cancelling appointment' });
  }
});

export default router;
