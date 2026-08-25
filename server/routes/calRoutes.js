import express from 'express';

const router = express.Router();

// GET /api/cal/slots?date=YYYY-MM-DD
router.get('/slots', async (req, res) => {
  try {
    const { date, email } = req.query;
    if (!date) {
      return res.status(400).json({ message: 'Date is required' });
    }

    // Determine start and end of the requested day in UTC to fetch slots
    // date parameter comes as "YYYY-MM-DD"
    const startTime = new Date(`${date}T00:00:00.000Z`).toISOString();
    const endTime = new Date(`${date}T23:59:59.999Z`).toISOString();

    // Check if user is returning
    let isFirstSession = true;
    if (email) {
      const Appointment = (await import('../models/Appointment.js')).default;
      const pastAppointments = await Appointment.countDocuments({ email: email });
      isFirstSession = pastAppointments === 0;
    }

    // Event Type ID for 60 min (first) or 90 min (subsequent)
    const eventTypeId = isFirstSession 
      ? (process.env.CAL_EVENT_TYPE_ID_60 || 6769198) 
      : (process.env.CAL_EVENT_TYPE_ID_90 || 6769198);


    const response = await fetch(`https://api.cal.com/v2/slots/available?eventTypeId=${eventTypeId}&startTime=${startTime}&endTime=${endTime}`, {
      headers: {
        'Authorization': `Bearer ${process.env.CAL_API_KEY}`,
        'cal-api-version': '2024-08-13'
      }
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error("Cal.com slots error:", errorData);
      return res.status(response.status).json(errorData);
    }

    const data = await response.json();
    
    // Add our custom metadata to the response so frontend can adjust UI
    const duration = isFirstSession ? 60 : 90;
    res.json({
      ...data,
      metadata: {
        isFirstSession,
        duration
      }
    });
  } catch (error) {
    console.error("Failed to fetch slots from Cal.com:", error);
    res.status(500).json({ message: 'Server error fetching slots' });
  }
});

export default router;
