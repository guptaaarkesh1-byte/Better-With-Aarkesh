import express from 'express';
import Appointment from '../models/Appointment.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// POST /api/appointments - Create a new appointment
router.post('/', protect, async (req, res) => {
  try {
    const { date, time, name, email, source, reason, extra } = req.body;

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

export default router;
