// slotHoldService.js - Client helper for temporary slot locking and release
import { API_URL } from './apiUrl';

/**
 * Request a temporary lock/hold on a time slot for 15 minutes.
 */
export async function holdSlot({ dateKey, displayDate, time, slotTimeIso, holderId, email }) {
  if (!dateKey || !time || !holderId) return { success: false };

  try {
    const res = await fetch(`${API_URL}/api/cal/slots/hold`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        dateKey,
        displayDate,
        time,
        slotTimeIso,
        holderId,
        email: email || ''
      })
    });

    const data = await res.json().catch(() => ({}));
    return {
      ok: res.ok,
      status: res.status,
      conflict: res.status === 409 || data.conflict,
      message: data.message || '',
      expiresAt: data.expiresAt || null
    };
  } catch (err) {
    console.warn('Failed to hold slot:', err);
    return { ok: false, error: err.message };
  }
}

/**
 * Send heartbeat to keep the slot locked while user is filling Step 2, Questionnaire, or Step 3.
 */
export async function heartbeatSlot({ holderId, dateKey, time }) {
  if (!holderId) return;

  try {
    await fetch(`${API_URL}/api/cal/slots/heartbeat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ holderId, dateKey, time })
    });
  } catch (err) {
    console.warn('Slot heartbeat failed:', err);
  }
}

/**
 * Explicitly release the slot hold when navigating away or unmounting.
 */
export async function releaseSlot(params) {
  if (!params) return;
  const holderId = typeof params === 'string' ? params : params?.holderId;
  const dateKey = typeof params === 'object' ? params?.dateKey : undefined;
  const time = typeof params === 'object' ? params?.time : undefined;
  if (!holderId) return;

  try {
    await fetch(`${API_URL}/api/cal/slots/release`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ holderId, dateKey, time }),
      keepalive: true
    });
  } catch (err) {
    console.warn('Slot release failed:', err);
  }
}

/**
 * Release slot using navigator.sendBeacon for instant cleanup when browser/tab closes.
 */
export function releaseSlotBeacon(params) {
  if (!params || typeof navigator === 'undefined' || !navigator.sendBeacon) return;
  const holderId = typeof params === 'string' ? params : params?.holderId;
  const dateKey = typeof params === 'object' ? params?.dateKey : undefined;
  const time = typeof params === 'object' ? params?.time : undefined;
  if (!holderId) return;

  try {
    const payload = JSON.stringify({ holderId, dateKey, time });
    const blob = new Blob([payload], { type: 'application/json' });
    navigator.sendBeacon(`${API_URL}/api/cal/slots/release`, blob);
  } catch (err) {
    console.warn('Slot beacon release failed:', err);
  }
}
