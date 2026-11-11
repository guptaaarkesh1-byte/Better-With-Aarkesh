import express from 'express';
import SlotHold from '../models/SlotHold.js';
import Appointment from '../models/Appointment.js';
import {
  findConflictingAppointment,
  findConflictingHold,
  filterNonOverlappingSlots,
  buildDateRegex,
  normalizeDateToKey,
  timeToMinutes
} from '../utils/slotConflictHelper.js';

const router = express.Router();

const normalizeTime = (t) => (t ? String(t).replace(/^0/, '').trim().toLowerCase() : '');

const getMonthName = (monthIndex) => {
  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  return monthNames[monthIndex] || '';
};

// GET /api/cal/slots?date=YYYY-MM-DD&email=...&holderId=...&duration=...&isPackage=...
router.get('/slots', async (req, res) => {
  try {
    const { date, email, holderId, duration: reqDuration, isPackage } = req.query;
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

    // Session duration (package sessions and returning client sessions are 90 mins; first session is 60 mins)
    const duration = Number(reqDuration) || (isPackage === 'true' ? 90 : (isFirstSession ? 60 : 90));

    // Event Type ID for 60 min (first) or 90 min (subsequent)
    const eventTypeId = duration === 60 
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
          duration
        }
      });
    }

    const data = await response.json();
    
    // ═════════════════════════════════════════════════════════════════
    // FILTER OUT SLOTS THAT OVERLAP WITH ANY BOOKED APPOINTMENT OR HOLD
    // ═════════════════════════════════════════════════════════════════
    const now = new Date();
    const canonicalDateKey = normalizeDateToKey(date);

    // 1. Find slots currently held by other clients
    const holdQuery = {
      dateKey: canonicalDateKey,
      status: 'HELD',
      expiresAt: { $gt: now }
    };
    if (holderId) {
      holdQuery.holderId = { $ne: String(holderId).trim() };
    }
    const activeHolds = await SlotHold.find(holdQuery);

    // 2. Find appointments booked for this day (matches any date string format)
    const dateRegex = buildDateRegex(date);
    const bookedAppointments = await Appointment.find({
      date: dateRegex,
      status: { $in: ['UPCOMING', 'COMPLETED'] },
      paymentStatus: { $ne: 'Failed' }
    });

    // 3. Filter candidate slots using universal interval overlap protection:
    // Any candidate slot whose [slotStart, slotStart + duration) window overlaps with
    // ANY existing appointment's [apptStart, apptStart + apptDuration) is completely excluded!
    if (data?.data?.slots?.[date] && Array.isArray(data.data.slots[date])) {
      data.data.slots[date] = filterNonOverlappingSlots({
        slots: data.data.slots[date],
        candidateDuration: duration,
        bookedAppointments,
        activeHolds
      });
    }

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

// GET /api/cal/month-availability?year=YYYY&month=MM&email=...&duration=...
router.get('/month-availability', async (req, res) => {
  try {
    const { year, month, email, duration: reqDuration, isPackage } = req.query;
    if (!year || !month) {
      return res.status(400).json({ message: 'year and month are required' });
    }

    const y = parseInt(year, 10);
    const m = parseInt(month, 10); // 1-indexed (1 to 12)
    const daysInMonth = new Date(y, m, 0).getDate();

    const mStr = String(m).padStart(2, '0');
    const startTime = new Date(`${y}-${mStr}-01T00:00:00.000Z`).toISOString();
    const endTime = new Date(`${y}-${mStr}-${String(daysInMonth).padStart(2, '0')}T23:59:59.999Z`).toISOString();

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

    const candidateDuration = Number(reqDuration) || (isPackage === 'true' ? 90 : (isFirstSession ? 60 : 90));
    const eventTypeId = candidateDuration === 60 
      ? (process.env.CAL_EVENT_TYPE_ID_60 || 6769198) 
      : (process.env.CAL_EVENT_TYPE_ID_90 || 6769198);

    const response = await fetch(`https://api.cal.com/v2/slots/available?eventTypeId=${eventTypeId}&startTime=${startTime}&endTime=${endTime}`, {
      headers: {
        'Authorization': `Bearer ${process.env.CAL_API_KEY}`,
        'cal-api-version': '2024-08-13'
      }
    });

    if (!response.ok) {
      return res.json({ availableDays: [], slotsCountByDate: {} });
    }

    const data = await response.json();
    const slotsMap = data?.data?.slots || {};

    // Get all booked appointments for this month
    const bookedAppointments = await Appointment.find({
      status: { $in: ['UPCOMING', 'COMPLETED'] },
      paymentStatus: { $ne: 'Failed' }
    });

    // Get active holds for this month
    const now = new Date();
    const activeHolds = await SlotHold.find({
      dateKey: new RegExp(`^${y}-${mStr}`),
      status: 'HELD',
      expiresAt: { $gt: now }
    });

    // Group booked appointments and holds by canonical YYYY-MM-DD
    const bookedByDate = {};
    bookedAppointments.forEach(a => {
      const key = normalizeDateToKey(a.date);
      if (key && key.startsWith(`${y}-${mStr}`)) {
        if (!bookedByDate[key]) bookedByDate[key] = [];
        bookedByDate[key].push(a);
      }
    });

    const holdsByDate = {};
    activeHolds.forEach(h => {
      if (h.dateKey) {
        if (!holdsByDate[h.dateKey]) holdsByDate[h.dateKey] = [];
        holdsByDate[h.dateKey].push(h);
      }
    });

    const availableDays = [];
    const slotsCountByDate = {};

    for (let day = 1; day <= daysInMonth; day++) {
      const dateKey = `${y}-${mStr}-${String(day).padStart(2, '0')}`;
      const rawSlots = slotsMap[dateKey];
      if (Array.isArray(rawSlots) && rawSlots.length > 0) {
        const dayBooked = bookedByDate[dateKey] || [];
        const dayHolds = holdsByDate[dateKey] || [];
        const validSlots = filterNonOverlappingSlots({
          slots: rawSlots,
          candidateDuration,
          bookedAppointments: dayBooked,
          activeHolds: dayHolds
        });

        if (validSlots.length > 0) {
          availableDays.push(day);
          slotsCountByDate[dateKey] = validSlots.length;
        }
      }
    }

    res.json({
      success: true,
      year: y,
      month: m,
      availableDays,
      slotsCountByDate
    });
  } catch (error) {
    console.error("Failed to fetch month availability:", error);
    res.status(500).json({ message: 'Server error fetching month availability' });
  }
});

// POST /api/cal/slots/hold - Temporary lock on a slot for 15 minutes with overlap validation
router.post('/slots/hold', async (req, res) => {
  try {
    const { dateKey, displayDate, time, slotTimeIso, holderId, email, duration: reqDuration } = req.body;
    if (!dateKey || !time || !holderId) {
      return res.status(400).json({ message: 'dateKey, time, and holderId are required' });
    }

    const cleanTime = String(time).trim();
    const cleanHolder = String(holderId).trim();
    const candidateDuration = Number(reqDuration) || 90; // Default to 90 min window for complete safety

    // 1. Check if overlapping appointment is already booked
    const conflictAppt = await findConflictingAppointment({
      date: dateKey,
      time: cleanTime,
      duration: candidateDuration
    });
    if (conflictAppt) {
      return res.status(409).json({ 
        conflict: true, 
        message: conflictAppt.message || 'This time slot overlaps with an existing appointment. Please choose another time.' 
      });
    }

    // 2. Check if held by another user with overlap
    const conflictHold = await findConflictingHold({
      dateKey,
      time: cleanTime,
      duration: candidateDuration,
      currentHolderId: cleanHolder
    });
    if (conflictHold) {
      return res.status(409).json({
        conflict: true,
        message: conflictHold.message || 'This time slot is currently being booked by another client. Please select another time.'
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
      { dateKey: normalizeDateToKey(dateKey), time: cleanTime, holderId: cleanHolder },
      {
        dateKey: normalizeDateToKey(dateKey),
        displayDate: displayDate || '',
        time: cleanTime,
        duration: candidateDuration,
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
