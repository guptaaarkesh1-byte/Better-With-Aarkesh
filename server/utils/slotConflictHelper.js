import Appointment from '../models/Appointment.js';
import SlotHold from '../models/SlotHold.js';

const MONTH_MAP = {
  jan: 1, january: 1,
  feb: 2, february: 2,
  mar: 3, march: 3,
  apr: 4, april: 4,
  may: 5,
  jun: 6, june: 6,
  jul: 7, july: 7,
  aug: 8, august: 8,
  sep: 9, sept: 9, september: 9,
  oct: 10, october: 10,
  nov: 11, november: 11,
  dec: 12, december: 12
};

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

/**
 * Convert any time string (e.g. '07:00 PM', '7:30 pm', '19:30', '12:00 AM') into minutes from midnight (0..1439).
 */
export function timeToMinutes(timeStr) {
  if (!timeStr) return null;
  const str = String(timeStr).trim();
  
  // 1. 12-hour format: "07:00 PM", "7:30 am", "12:15PM"
  const m12 = str.match(/^0?(\d{1,2}):(\d{2})\s*(AM|PM)?$/i);
  if (m12) {
    let hours = parseInt(m12[1], 10);
    const minutes = parseInt(m12[2], 10);
    const meridiem = m12[3];
    if (meridiem) {
      const isPM = meridiem.toUpperCase() === 'PM';
      if (isPM && hours < 12) hours += 12;
      if (!isPM && hours === 12) hours = 0;
    }
    return hours * 60 + minutes;
  }

  // 2. 24-hour format: "19:30"
  const m24 = str.match(/^0?(\d{1,2}):(\d{2})$/);
  if (m24) {
    const hours = parseInt(m24[1], 10);
    const minutes = parseInt(m24[2], 10);
    return hours * 60 + minutes;
  }

  return null;
}

/**
 * Format minutes from midnight to standard 12-hour string (e.g. 1140 -> "07:00 PM")
 */
export function minutesToTimeString(totalMinutes) {
  if (totalMinutes === null || totalMinutes === undefined) return '';
  let hours24 = Math.floor(totalMinutes / 60) % 24;
  const minutes = totalMinutes % 60;
  const ampm = hours24 >= 12 ? 'PM' : 'AM';
  let hours12 = hours24 % 12;
  if (hours12 === 0) hours12 = 12;
  return `${String(hours12).padStart(2, '0')}:${String(minutes).padStart(2, '0')} ${ampm}`;
}

/**
 * Convert any date string (ISO YYYY-MM-DD, "Wednesday, November 11, 2026", "Wed, 11 Nov, 2026")
 * into canonical "YYYY-MM-DD"
 */
export function normalizeDateToKey(rawDate) {
  if (!rawDate) return '';
  const s = String(rawDate).trim();

  // 1. YYYY-MM-DD
  const isoMatch = s.match(/^(\d{4})-(\d{1,2})-(\d{1,2})$/);
  if (isoMatch) {
    return `${isoMatch[1]}-${String(isoMatch[2]).padStart(2, '0')}-${String(isoMatch[3]).padStart(2, '0')}`;
  }

  // 2. "Wednesday, November 11, 2026" or "November 11, 2026" or "Nov 11, 2026"
  const m1 = s.match(/([a-zA-Z]+)\s+(\d{1,2})[,\s]+(\d{4})/);
  if (m1) {
    const monthKey = m1[1].toLowerCase().slice(0, 3);
    const mNum = MONTH_MAP[monthKey];
    if (mNum) {
      return `${m1[3]}-${String(mNum).padStart(2, '0')}-${String(m1[2]).padStart(2, '0')}`;
    }
  }

  // 3. "11 Nov, 2026" or "Wed, 11 Nov, 2026" or "11 November 2026"
  const m2 = s.match(/(\d{1,2})\s+([a-zA-Z]+)[,\s]+(\d{4})/);
  if (m2) {
    const monthKey = m2[2].toLowerCase().slice(0, 3);
    const mNum = MONTH_MAP[monthKey];
    if (mNum) {
      return `${m2[3]}-${String(mNum).padStart(2, '0')}-${String(m2[1]).padStart(2, '0')}`;
    }
  }

  // Fallback Date parser
  const parsed = new Date(s);
  if (!isNaN(parsed.getTime())) {
    const y = parsed.getFullYear();
    const m = String(parsed.getMonth() + 1).padStart(2, '0');
    const d = String(parsed.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  }

  return s;
}

/**
 * Build a MongoDB regex query that matches any representation of the given date
 */
export function buildDateRegex(rawDate) {
  const dateKey = normalizeDateToKey(rawDate);
  if (!dateKey || !/^\d{4}-\d{2}-\d{2}$/.test(dateKey)) {
    return new RegExp(`^${String(rawDate).replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i');
  }

  const [y, mStr, dStr] = dateKey.split('-');
  const dInt = parseInt(dStr, 10);
  const mInt = parseInt(mStr, 10);
  const monthFull = MONTH_NAMES[mInt - 1] || '';
  const monthShort = monthFull.slice(0, 3);

  // Matches "2026-11-11", "November 11, 2026", "Nov 11, 2026", "11 Nov 2026", "Wednesday, November 11, 2026", etc.
  return new RegExp(
    `(${dateKey}|(?:${monthFull}|${monthShort})\\s+0?${dInt}[,\\s]+${y}|0?${dInt}\\s+(?:${monthFull}|${monthShort})[,\\s]+${y})`,
    'i'
  );
}

/**
 * Universal interval overlap check:
 * Interval 1: [start1, start1 + dur1)
 * Interval 2: [start2, start2 + dur2)
 * Overlap condition: start1 < end2 && start2 < end1
 */
export function checkSlotOverlap(start1, dur1, start2, dur2) {
  if (start1 === null || start2 === null) return false;
  const end1 = start1 + Number(dur1 || 60);
  const end2 = start2 + Number(dur2 || 60);
  return start1 < end2 && start2 < end1;
}

/**
 * Convert Cal.com ISO slot string to IST minutes from midnight
 */
export function slotTimeToISTMinutes(slotIsoString) {
  const d = new Date(slotIsoString);
  if (isNaN(d.getTime())) return null;
  const timeStr = d.toLocaleTimeString('en-US', {
    timeZone: 'Asia/Kolkata',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  });
  return timeToMinutes(timeStr);
}

/**
 * Check if a candidate slot overlaps with ANY booked appointment on that date
 */
export async function findConflictingAppointment({ date, time, duration = 60, excludeId = null }) {
  const candidateStart = timeToMinutes(time);
  if (candidateStart === null) return null;
  const candidateDuration = Number(duration) || 60;
  const candidateEnd = candidateStart + candidateDuration;

  const dateRegex = buildDateRegex(date);
  const query = {
    date: dateRegex,
    status: { $in: ['UPCOMING', 'COMPLETED'] },
    paymentStatus: { $ne: 'Failed' }
  };
  if (excludeId) {
    query._id = { $ne: excludeId };
  }

  const bookedAppointments = await Appointment.find(query);

  for (const appt of bookedAppointments) {
    const apptStart = timeToMinutes(appt.time);
    if (apptStart === null) continue;
    const apptDuration = Number(appt.duration) || (appt.isFirstSession === true ? 60 : 90);
    const apptEnd = apptStart + apptDuration;

    if (candidateStart < apptEnd && apptStart < candidateEnd) {
      const isExactMatch = candidateStart === apptStart;
      const message = isExactMatch
        ? `This time slot (${time}) has already been booked. Please choose another time.`
        : `The selected time slot (${time}) overlaps with an existing ${apptDuration}-minute session (${appt.time} – ${minutesToTimeString(apptEnd)}). Please choose another time.`;

      return {
        conflict: true,
        appointment: appt,
        conflictingSlot: {
          bookedStart: appt.time,
          bookedDuration: apptDuration,
          bookedEnd: minutesToTimeString(apptEnd)
        },
        message
      };
    }
  }

  return null;
}

/**
 * Check if a candidate slot overlaps with ANY active hold on that date by another user
 */
export async function findConflictingHold({ dateKey, time, duration = 60, currentHolderId = null }) {
  const candidateStart = timeToMinutes(time);
  if (candidateStart === null) return null;
  const candidateDuration = Number(duration) || 60;
  const candidateEnd = candidateStart + candidateDuration;

  const canonicalKey = normalizeDateToKey(dateKey);
  const now = new Date();
  const query = {
    dateKey: canonicalKey,
    status: 'HELD',
    expiresAt: { $gt: now }
  };
  if (currentHolderId) {
    query.holderId = { $ne: String(currentHolderId).trim() };
  }

  const activeHolds = await SlotHold.find(query);

  for (const hold of activeHolds) {
    const holdStart = timeToMinutes(hold.time);
    if (holdStart === null) continue;
    // Uses the hold's specific duration (e.g. 90 mins) to fully reserve the time window
    const holdDuration = Number(hold.duration) || 90;
    const holdEnd = holdStart + holdDuration;

    if (candidateStart < holdEnd && holdStart < candidateEnd) {
      return {
        conflict: true,
        hold,
        conflictingSlot: {
          heldStart: hold.time,
          heldDuration: holdDuration,
          heldEnd: minutesToTimeString(holdEnd)
        },
        message: `This time slot (${time}) is currently reserved by another client (${hold.time} – ${minutesToTimeString(holdEnd)}). Please select another time.`
      };
    }
  }

  return null;
}

/**
 * Filter an array of candidate slots (from Cal.com) against all booked appointments and active holds.
 * Eliminates every slot that overlaps with ANY existing session.
 */
export function filterNonOverlappingSlots({
  slots,
  candidateDuration = 60,
  bookedAppointments = [],
  activeHolds = []
}) {
  if (!Array.isArray(slots) || slots.length === 0) return [];

  // 1. Build intervals for all booked appointments
  const bookedIntervals = bookedAppointments.map(appt => {
    const start = timeToMinutes(appt.time);
    if (start === null) return null;
    const duration = Number(appt.duration) || (appt.isFirstSession === true ? 60 : 90);
    return { start, end: start + duration, raw: appt.time };
  }).filter(Boolean);

  // 2. Build intervals for active holds (holds reserve a 90-min window by default)
  const holdIntervals = activeHolds.map(hold => {
    const start = timeToMinutes(hold.time);
    if (start === null) return null;
    const duration = 90;
    return { start, end: start + duration, raw: hold.time };
  }).filter(Boolean);

  const occupiedIntervals = [...bookedIntervals, ...holdIntervals];
  const requiredCandidateDuration = Number(candidateDuration) || 60;

  // 3. Filter candidate slots
  return slots.filter(slot => {
    const slotStart = slotTimeToISTMinutes(slot.time);
    if (slotStart === null) return true;
    const slotEnd = slotStart + requiredCandidateDuration;

    // Check if [slotStart, slotEnd) overlaps with ANY occupied interval
    const hasOverlap = occupiedIntervals.some(interval => {
      return slotStart < interval.end && interval.start < slotEnd;
    });

    return !hasOverlap;
  });
}

