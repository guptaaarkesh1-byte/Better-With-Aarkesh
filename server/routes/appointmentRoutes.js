import express from 'express';
import Appointment from '../models/Appointment.js';
import { protect, optionalAuth, admin } from '../middleware/authMiddleware.js';

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
          console.log("Successfully created booking on Cal.com");
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

export default router;
