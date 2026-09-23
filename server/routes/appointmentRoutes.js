import express from 'express';
import Appointment from '../models/Appointment.js';
import User from '../models/User.js';
import CourseUser from '../models/CourseUser.js';
import Settings from '../models/Settings.js';
import { protect, optionalAuth, admin } from '../middleware/authMiddleware.js';
import { Resend } from 'resend';

const router = express.Router();

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

    // Fetch updatable fees from settings
    const feeSettings = await Settings.findOne({ key: 'fees' });
    const fee60min = Number(feeSettings?.value?.fee60min) || 5000;
    const fee90min = Number(feeSettings?.value?.fee90min) || 7500;

    let isFirstSession = true;

    if (rawEmail) {
      const escapedEmail = rawEmail.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const pastAppointments = await Appointment.countDocuments({
        email: new RegExp(`^${escapedEmail}$`, 'i'),
        status: { $in: ['UPCOMING', 'COMPLETED'] },
        paymentStatus: { $ne: 'Failed' }
      });
      isFirstSession = pastAppointments === 0;
    } else if (req.user?._id) {
      const pastAppointments = await Appointment.countDocuments({
        userId: req.user._id,
        status: { $in: ['UPCOMING', 'COMPLETED'] },
        paymentStatus: { $ne: 'Failed' }
      });
      isFirstSession = pastAppointments === 0;
    }

    const duration = isFirstSession ? 60 : 90;
    const fee = duration === 90 ? fee90min : fee60min;

    res.json({
      isFirstSession,
      duration,
      fee,
      fee60min,
      fee90min
    });
  } catch (error) {
    console.error('Error checking session type:', error);
    res.status(500).json({ message: 'Error checking session type' });
  }
});

// POST /api/appointments - Create a new appointment
router.post('/', optionalAuth, async (req, res) => {
  try {
    const { date, time, name, email, countryCode, phoneNumber, source, reason, extra, paymentId, orderId, signature, useFreeSession } = req.body;

    // --- Free session booking (3 free sessions included with course purchase) ---
    if (useFreeSession) {
      const normalizedEmail = (email || '').trim().toLowerCase();
      const escapedEmail = normalizedEmail.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const emailRegex = new RegExp(`^${escapedEmail}$`, 'i');

      // Only students who purchased the course can use free sessions
      const courseUser = await CourseUser.findOne({ email: emailRegex, isPurchased: true });
      let coachingUser = await User.findOne({ email: emailRegex });

      if (!courseUser && (!coachingUser || !coachingUser.courseSessionsGranted || !coachingUser.freeSessions || coachingUser.freeSessions <= 0)) {
        return res.status(403).json({ message: 'Free sessions are only available to course purchasers.' });
      }

      // Auto-create/sync coaching user if not present
      if (!coachingUser && courseUser) {
        coachingUser = new User({
          fullName: courseUser.fullName || name,
          email: normalizedEmail,
          password: courseUser.password,
          countryCode: countryCode || '+91',
          phoneNumber: phoneNumber || courseUser.phoneNumber || '',
          freeSessions: 3,
          courseSessionsGranted: true
        });
        await coachingUser.save();
      } else if (coachingUser && courseUser && !coachingUser.courseSessionsGranted) {
        coachingUser.freeSessions = 3;
        coachingUser.courseSessionsGranted = true;
        await coachingUser.save();
      }

      if (!coachingUser || !coachingUser.freeSessions || coachingUser.freeSessions <= 0) {
        return res.status(403).json({ message: 'No free sessions remaining on your account.' });
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

      // Send confirmation emails in background
      if (process.env.RESEND_API_KEY) {
        try {
          const resend = new Resend(process.env.RESEND_API_KEY);
          await resend.emails.send({
            from: 'Better With Aarkesh <coaching@betterwithaarkesh.com>',
            to: normalizedEmail,
            subject: 'Your Free Coaching Session is Confirmed',
            html: `
              <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #333;">
                <h2>Coaching Session Confirmed</h2>
                <p>Hello ${name},</p>
                <p>Your 1-on-1 complimentary coaching session with Aarkesh has been reserved.</p>
                <p><strong>Date:</strong> ${date}<br/><strong>Time:</strong> ${time}<br/><strong>Duration:</strong> ${duration} Minutes</p>
                <p>Remaining complimentary credits: ${coachingUser.freeSessions}</p>
                <p>Google Meet details will follow prior to the call.</p>
              </div>
            `
          });
        } catch (emailErr) {
          console.error("Failed to send free session confirmation email", emailErr);
        }
      }

      return res.status(201).json({
        ...createdFreeAppointment.toObject(),
        freeSessionsRemaining: coachingUser.freeSessions
      });
    }

    // Check if user has past appointments (Registered or Unregistered)
    const normalizedEmail = (email || (req.user && req.user.email) || '').toLowerCase().trim();
    const phone = (phoneNumber || (req.user && req.user.phoneNumber) || '').trim();

    let isFirstSession = true;
    if (normalizedEmail) {
      const escapedEmail = normalizedEmail.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const pastAppointments = await Appointment.countDocuments({ 
        email: new RegExp(`^${escapedEmail}$`, 'i'),
        status: { $in: ['UPCOMING', 'COMPLETED'] },
        paymentStatus: { $ne: 'Failed' }
      });
      isFirstSession = pastAppointments === 0;
    } else if (req.user?._id) {
      const pastAppointments = await Appointment.countDocuments({ 
        userId: req.user._id,
        status: { $in: ['UPCOMING', 'COMPLETED'] },
        paymentStatus: { $ne: 'Failed' }
      });
      isFirstSession = pastAppointments === 0;
    }

    const duration = isFirstSession ? 60 : 90;

    // Fetch dynamic fee settings
    const feeSettings = await Settings.findOne({ key: 'fees' });
    const fee60 = Number(feeSettings?.value?.fee60min) || 5000;
    const fee90 = Number(feeSettings?.value?.fee90min) || 7500;
    const dynamicAmount = duration === 90 ? fee90 : fee60;
    const finalAmount = req.body.amount !== undefined && req.body.amount !== null ? Number(req.body.amount) : dynamicAmount;

    const appointment = new Appointment({
      userId: req.user ? req.user._id : undefined,
      date,
      time,
      name,
      email: normalizedEmail,
      countryCode,
      phoneNumber: phone,
      source,
      reason,
      extra,
      status: 'UPCOMING',
      duration,
      isFirstSession,
      amount: finalAmount,
      paymentId,
      orderId,
      signature
    });

    const createdAppointment = await appointment.save();

    // Cal.com sync is now handled in /finalize route
    // ---------------------------

    res.status(201).json(createdAppointment);
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
    
    res.json(updatedAppointment);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error finalizing appointment' });
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
    // Fetch by userId OR by email (to catch free-session appointments that may have been booked before account linking)
    const appointments = await Appointment.find({
      $or: [
        { userId: req.user._id },
        { email: { $regex: new RegExp(`^${req.user.email.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i') } }
      ]
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
      .populate('userId', 'name email phone createdAt')
      .sort({ createdAt: -1 });

    // Fetch fee settings to ensure accurate fallback
    const feeSettings = await Settings.findOne({ key: 'fees' });
    const fee60 = feeSettings?.value?.fee60min || 1000;
    const fee90 = feeSettings?.value?.fee90min || 1500;

    // Fetch all course purchasers emails for fast lookup
    const coursePurchasers = await CourseUser.find({ isPurchased: true }).select('email');
    const coursePurchaserEmails = new Set(coursePurchasers.map(c => (c.email || '').toLowerCase().trim()));

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
      
      return {
        ...appObj,
        amount: calculatedAmount,
        isCourseMember: isCoursePurchaser || isFree,
        isFreeSession: isFree
      };
    });

    res.json(enrichedAppointments);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error fetching all appointments' });
  }
});

// PUT /api/appointments/admin/:id/status - Update appointment status
router.put('/admin/:id/status', protect, admin, async (req, res) => {
  try {
    const { status } = req.body;
    const appointment = await Appointment.findById(req.params.id);
    
    if (appointment) {
      appointment.status = status;
      const updatedAppointment = await appointment.save();
      res.json(updatedAppointment);
    } else {
      res.status(404).json({ message: 'Appointment not found' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error updating appointment status' });
  }
});

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

// POST /api/appointments/:id/reschedule - Submit a reschedule request
router.post('/:id/reschedule', protect, async (req, res) => {
  try {
    const { date, time, reason } = req.body;
    const appointment = await Appointment.findById(req.params.id);
    
    if (!appointment) return res.status(404).json({ message: 'Appointment not found' });
    if (appointment.userId && appointment.userId.toString() !== req.user._id.toString()) return res.status(401).json({ message: 'Not authorized' });

    appointment.rescheduleRequest = {
      date,
      time,
      reason,
      status: 'PENDING'
    };
    
    await appointment.save();
    res.json(appointment);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error submitting reschedule request' });
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
router.post('/admin/:id/approve-reschedule', protect, admin, async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id);
    
    if (!appointment) return res.status(404).json({ message: 'Appointment not found' });
    if (!appointment.rescheduleRequest || appointment.rescheduleRequest.status !== 'PENDING') {
      return res.status(400).json({ message: 'No pending reschedule request found' });
    }

    const { date, time } = appointment.rescheduleRequest;

    // --- Cal.com Integration ---
    if (process.env.CAL_API_KEY) {
      try {
        // 1. Cancel existing if we have UID
        if (appointment.calBookingUid) {
          await fetch(`https://api.cal.com/v2/bookings/${appointment.calBookingUid}/cancel`, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${process.env.CAL_API_KEY}`,
              'Content-Type': 'application/json',
              'cal-api-version': '2024-08-13'
            },
            body: JSON.stringify({ reason: "Rescheduled by user request" })
          });
        }

        // 2. Create new booking
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
    // ---------------------------

    // Update appointment
    appointment.date = date;
    appointment.time = time;
    appointment.rescheduleRequest.status = 'APPROVED';
    
    await appointment.save();

    // Send Email
    if (process.env.RESEND_API_KEY) {
      try {
        const resend = new Resend(process.env.RESEND_API_KEY);
        const emailHtmlTemplate = `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #333;">
            <h2>Your Session Has Been Rescheduled</h2>
            <p>Hi ${appointment.name},</p>
            <p>Your request to reschedule your coaching session has been approved.</p>
            <div style="background: #f5f5f5; padding: 20px; border-radius: 5px; margin: 20px 0;">
              <strong>New Date:</strong> ${appointment.date}<br>
              <strong>New Time:</strong> ${appointment.time}<br>
              ${appointment.meetLink ? `<strong>Meeting Link:</strong> <a href="${appointment.meetLink}" style="color: #c79c6e;">Click here to join</a><br>` : ''}
            </div>
            <p>We look forward to seeing you then!</p>
          </div>
        `;

        const coachEmailTemplate = `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #333;">
            <h2>Session Rescheduled</h2>
            <p>You have successfully approved the reschedule request for <strong>${appointment.name}</strong>.</p>
            <div style="background: #f5f5f5; padding: 20px; border-radius: 5px; margin: 20px 0;">
              <strong>New Date:</strong> ${appointment.date}<br>
              <strong>New Time:</strong> ${appointment.time}<br>
              ${appointment.meetLink ? `<strong>Meeting Link:</strong> <a href="${appointment.meetLink}" style="color: #c79c6e;">Click here to join</a><br>` : ''}
            </div>
          </div>
        `;

        await Promise.all([
          resend.emails.send({
            from: process.env.EMAIL_FROM || 'Better With Aarkesh Support <onboarding@resend.dev>',
            to: appointment.email,
            subject: 'Your session has been rescheduled',
            html: emailHtmlTemplate,
          }),
          resend.emails.send({
            from: process.env.EMAIL_FROM || 'Better With Aarkesh Support <onboarding@resend.dev>',
            to: process.env.ADMIN_EMAIL || 'support@yashrajtech.online',
            subject: `Reschedule confirmed for ${appointment.name}`,
            html: coachEmailTemplate,
          })
        ]);
      } catch (emailErr) {
        console.error("Failed to send reschedule email", emailErr);
      }
    }

    res.json(appointment);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error approving reschedule' });
  }
});

// POST /api/appointments/admin/:id/reject-reschedule - Reject reschedule request
router.post('/admin/:id/reject-reschedule', protect, admin, async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id);
    
    if (!appointment) return res.status(404).json({ message: 'Appointment not found' });
    if (!appointment.rescheduleRequest || appointment.rescheduleRequest.status !== 'PENDING') {
      return res.status(400).json({ message: 'No pending reschedule request found' });
    }

    appointment.rescheduleRequest.status = 'REJECTED';
    await appointment.save();

    res.json(appointment);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error rejecting reschedule' });
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

        await Promise.all([
          resend.emails.send({
            from: process.env.EMAIL_FROM || 'Better With Aarkesh Support <onboarding@resend.dev>',
            to: appointment.email,
            subject: 'Appointment Cancelled',
            html: clientEmailHtml,
          }),
          resend.emails.send({
            from: process.env.EMAIL_FROM || 'Better With Aarkesh Support <onboarding@resend.dev>',
            to: process.env.ADMIN_EMAIL || 'support@yashrajtech.online',
            subject: `Session Cancelled: ${appointment.name}`,
            html: coachEmailHtml,
          })
        ]);
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
