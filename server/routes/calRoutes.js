import express from 'express';
import SlotHold from '../models/SlotHold.js';
import Appointment from '../models/Appointment.js';

const router = express.Router();

const normalizeTime = (t) => (t ? String(t).replace(/^0/, '').trim().toLowerCase() : '');

const getMonthName = (monthIndex) => {
  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  return monthNames[monthIndex] || '';
};

// GET /api/cal/slots?date=YYYY-MM-DD&email=...&holderId=...
router.get('/slots', async (req, res) => {
  try {
    const { date, email, holderId } = req.query;
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
      const normalizedEmail = email.toLowerCase().trim();
      const escapedEmail = normalizedEmail.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const pastAppointments = await Appointment.countDocuments({ 
        email: new RegExp(`^${escapedEmail}$`, 'i'),
        status: { $in: ['UPCOMING', 'COMPLETED'] },
        paymentStatus: { $ne: 'Failed' }
      });
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
      let errorData;
      try {
        errorData = await response.json();
      } catch (e) {
        errorData = { message: 'Cal.com API returned a non-JSON error.' };
      }
      console.error("Cal.com slots error:", errorData);
      
      // Cal.com v2 sometimes throws 500 or 404 when no slots are available for a given day.
      return res.json({
        data: { slots: {} },
        metadata: {
          isFirstSession,
          duration: isFirstSession ? 60 : 90
        }
      });
    }

    const data = await response.json();
    
    // ═════════════════════════════════════════════════════════════════
    // FILTER OUT SLOTS HELD BY OTHER CLIENTS OR ALREADY BOOKED
    // ═════════════════════════════════════════════════════════════════
    const now = new Date();

    // 1. Find slots currently held by other clients
    const holdQuery = {
      dateKey: date,
      status: 'HELD',
      expiresAt: { $gt: now }
    };
    if (holderId) {
      holdQuery.holderId = { $ne: String(holderId) };
    }
    const activeHolds = await SlotHold.find(holdQuery);

    // 2. Find appointments booked for this day
    const [year, monthNum, dayNum] = date.split('-').map(Number);
    const monthName = getMonthName(monthNum - 1);
    const dayInt = parseInt(dayNum, 10);
    const dateRegex = new RegExp(`(${date}|${monthName}\\s+0?${dayInt}[,\\s]+${year})`, 'i');

    const bookedAppointments = await Appointment.find({
      date: dateRegex,
      status: { $in: ['UPCOMING', 'COMPLETED'] },
      paymentStatus: { $ne: 'Failed' }
    });

    const unavailableTimes = new Set();
    activeHolds.forEach((h) => {
      if (h.time) unavailableTimes.add(normalizeTime(h.time));
    });
    bookedAppointments.forEach((a) => {
      if (a.time) unavailableTimes.add(normalizeTime(a.time));
    });

    // Filter slots for this date in Cal.com response
    if (data?.data?.slots?.[date] && Array.isArray(data.data.slots[date])) {
      data.data.slots[date] = data.data.slots[date].filter((slot) => {
        const d = new Date(slot.time);
        const t1 = d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
        const t2 = d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
        return !unavailableTimes.has(normalizeTime(t1)) && !unavailableTimes.has(normalizeTime(t2));
      });
    }

    const duration = isFirstSession ? 60 : 90;
    res.json({
      ...data,
      metadata: {
        isFirstSession,
        duration,
        heldCount: activeHolds.length
      }
    });
  } catch (error) {
    console.error("Failed to fetch slots from Cal.com:", error);
    res.status(500).json({ message: 'Server error fetching slots' });
  }
});

// POST /api/cal/slots/hold - Temporary lock on a slot for 15 minutes
router.post('/slots/hold', async (req, res) => {
  try {
    const { dateKey, displayDate, time, slotTimeIso, holderId, email } = req.body;
    if (!dateKey || !time || !holderId) {
      return res.status(400).json({ message: 'dateKey, time, and holderId are required' });
    }

    const cleanTime = String(time).trim();
    const cleanHolder = String(holderId).trim();
    const now = new Date();

    // 1. Check if already booked
    const [year, monthNum, dayNum] = dateKey.split('-').map(Number);
    const monthName = getMonthName(monthNum - 1);
    const dayInt = parseInt(dayNum, 10);
    const dateRegex = new RegExp(`(${dateKey}|${monthName}\\s+0?${dayInt}[,\\s]+${year})`, 'i');

    const alreadyBooked = await Appointment.findOne({
      date: dateRegex,
      time: new RegExp(`^0?${cleanTime.replace(/^0/, '')}$`, 'i'),
      status: { $in: ['UPCOMING', 'COMPLETED'] },
      paymentStatus: { $ne: 'Failed' }
    });
    if (alreadyBooked) {
      return res.status(409).json({ 
        conflict: true, 
        message: 'This time slot is no longer available. Please choose another date or time.' 
      });
    }

    // 2. Check if held by another user
    const otherHold = await SlotHold.findOne({
      dateKey,
      time: new RegExp(`^0?${cleanTime.replace(/^0/, '')}$`, 'i'),
      status: 'HELD',
      expiresAt: { $gt: now },
      holderId: { $ne: cleanHolder }
    });
    if (otherHold) {
      return res.status(409).json({
        conflict: true,
        message: 'This time slot is currently being booked by another client. Please select another time.'
      });
    }

    // 3. Clear any previous holds by this holder (so a single user cannot hoard multiple slots)
    await SlotHold.deleteMany({
      holderId: cleanHolder,
      $or: [
        { dateKey: { $ne: dateKey } },
        { time: { $ne: cleanTime } }
      ]
    });

    // 4. Reserve for 15 minutes
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000);
    const hold = await SlotHold.findOneAndUpdate(
      { dateKey, time: cleanTime, holderId: cleanHolder },
      {
        dateKey,
        displayDate: displayDate || '',
        time: cleanTime,
        holderId: cleanHolder,
        email: email || '',
        status: 'HELD',
        expiresAt
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    console.log(`🔒 [SLOT HOLD] Reserved ${dateKey} ${cleanTime} for holder ${cleanHolder} until ${expiresAt.toISOString()}`);

    res.json({
      success: true,
      message: 'Slot reserved successfully for 15 minutes',
      expiresAt: hold.expiresAt
    });
  } catch (error) {
    console.error('Error holding slot:', error);
    res.status(500).json({ message: 'Error reserving time slot' });
  }
});

// POST /api/cal/slots/heartbeat - Keep slot reserved while user answers questionnaire or confirms
router.post('/slots/heartbeat', async (req, res) => {
  try {
    const { holderId, dateKey, time } = req.body;
    if (!holderId) {
      return res.status(400).json({ message: 'holderId is required' });
    }

    const expiresAt = new Date(Date.now() + 15 * 60 * 1000);
    const query = { holderId: String(holderId).trim(), status: 'HELD' };
    if (dateKey) query.dateKey = dateKey;
    if (time) query.time = String(time).trim();

    const updated = await SlotHold.updateMany(query, { $set: { expiresAt } });
    res.json({ success: true, updatedCount: updated.modifiedCount, expiresAt });
  } catch (error) {
    console.error('Error refreshing slot heartbeat:', error);
    res.status(500).json({ message: 'Error refreshing slot reservation' });
  }
});

// POST /api/cal/slots/release - Immediately free slot when user navigates away or closes page
router.post('/slots/release', async (req, res) => {
  try {
    let body = req.body;
    // Support navigator.sendBeacon where body might be a JSON string or text/plain
    if (typeof body === 'string') {
      try {
        body = JSON.parse(body);
      } catch {}
    }

    const holderId = body?.holderId;
    if (holderId) {
      const cleanHolder = String(holderId).trim();
      const filter = { holderId: cleanHolder };
      if (body.dateKey) filter.dateKey = body.dateKey;
      if (body.time) filter.time = String(body.time).trim();

      const result = await SlotHold.deleteMany(filter);
      console.log(`🔓 [SLOT RELEASE] Released ${result.deletedCount} slot hold(s) for holder ${cleanHolder}`);
    }

    res.json({ success: true, message: 'Slot released successfully' });
  } catch (error) {
    console.error('Error releasing slot hold:', error);
    res.status(500).json({ message: 'Error releasing time slot' });
  }
});

export default router;
