import express from 'express';
import Appointment from '../models/Appointment.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// POST /api/appointments - Create a new appointment
router.post('/', protect, async (req, res) => {
  try {
    const { date, time, name, email, source, reason, extra, paymentId, orderId, signature } = req.body;

    const appointment = new Appointment({
      userId: req.user._id,
      date,
      time,
      name,
      email,
      source,
      reason,
      extra,
      status: 'UPCOMING',
      paymentId,
      orderId,
      signature
    });

    const createdAppointment = await appointment.save();
    res.status(201).json(createdAppointment);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error saving appointment' });
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

import { admin } from '../middleware/authMiddleware.js';

// GET /api/appointments/admin - Get all appointments (Admin only)
router.get('/admin', admin, async (req, res) => {
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
router.put('/admin/:id/status', admin, async (req, res) => {
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
