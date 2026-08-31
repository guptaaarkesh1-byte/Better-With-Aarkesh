import express from 'express';
import Appointment from '../models/Appointment.js';
import { protect, optionalAuth, admin } from '../middleware/authMiddleware.js';
import { Resend } from 'resend';

const router = express.Router();

// POST /api/appointments - Create a new appointment
router.post('/', optionalAuth, async (req, res) => {
  try {
    const { date, time, name, email, countryCode, phoneNumber, source, reason, extra, paymentId, orderId, signature } = req.body;

    // Check if user has past appointments
    const pastAppointments = await Appointment.countDocuments({ email: email });
    const isFirstSession = pastAppointments === 0;
    const duration = isFirstSession ? 60 : 90;

    const appointment = new Appointment({
      userId: req.user ? req.user._id : undefined,
      date,
      time,
      name,
      email,
      countryCode,
      phoneNumber,
      source,
      reason,
      extra,
      status: 'UPCOMING',
      duration,
      isFirstSession,
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
    const appointments = await Appointment.find({ userId: req.user._id }).sort({ createdAt: -1 });
    res.json(appointments);
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
    res.json(appointments);
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
