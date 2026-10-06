import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { 
  X, CaretLeft, CaretRight, CalendarBlank, Clock, 
  CheckCircle, CaretDown, SunHorizon, Sun, Moon,
  ArrowsClockwise, ArrowRight, ShieldCheck, User,
  CreditCard, LockSimple, Sparkle, EnvelopeSimple, VideoCamera
} from '@phosphor-icons/react';
import PolicyModal from '../../../components/ui/PolicyModal';

const getGroupedSlots = (slots) => {
  const groups = {
    morning: [],
    afternoon: [],
    evening: []
  };

  slots.forEach((timeStr) => {
    const match = timeStr.match(/(\d+):(\d+)\s*(AM|PM)/i);
    if (!match) {
      groups.afternoon.push(timeStr);
      return;
    }
    let [_, h, m, meridiem] = match;
    let hour = parseInt(h, 10);
    if (meridiem.toUpperCase() === 'PM' && hour !== 12) hour += 12;
    if (meridiem.toUpperCase() === 'AM' && hour === 12) hour = 0;

    if (hour < 12) {
      groups.morning.push(timeStr);
    } else if (hour < 17) {
      groups.afternoon.push(timeStr);
    } else {
      groups.evening.push(timeStr);
    }
  });

  return groups;
};

const PERIOD_CONFIG = {
  morning: {
    label: 'Morning',
    sub: 'Before 12:00 PM',
    icon: SunHorizon,
  },
  afternoon: {
    label: 'Afternoon',
    sub: '12:00 PM – 5:00 PM',
    icon: Sun,
  },
  evening: {
    label: 'Evening',
    sub: '5:00 PM Onwards',
    icon: Moon,
  }
};

const loadRazorpayScript = () => {
  return new Promise((resolve) => {
    if (window.Razorpay) {
      resolve(true);
      return;
    }
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};

export default function RescheduleModal({ session, onClose, onSuccess }) {
  const today = new Date();
  
  const [selectedDay, setSelectedDay] = useState(null); // number
  const [selectedTime, setSelectedTime] = useState(null);
  
  const [currentMonth, setCurrentMonth] = useState(today.getMonth());
  const [currentYear, setCurrentYear] = useState(today.getFullYear());
  
  const [activeDropdown, setActiveDropdown] = useState(null); // 'month' | 'year' | null
  
  const [times, setTimes] = useState([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [slotsError, setSlotsError] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [reason, setReason] = useState('');
  const [isPolicyOpen, setIsPolicyOpen] = useState(false);
  const [showConfirmPopup, setShowConfirmPopup] = useState(false);
  const [fees, setFees] = useState({ fee60min: 5000, fee90min: 7500 });
  const [freeSessionsRemaining, setFreeSessionsRemaining] = useState(0);
  const [useFreeCredit, setUseFreeCredit] = useState(false);
  const [successData, setSuccessData] = useState(null);

  const getDaysInMonth = (month, year) => new Date(year, month + 1, 0).getDate();
  const getStartingDayOfWeek = (month, year) => new Date(year, month, 1).getDay();

  const daysInMonth = getDaysInMonth(currentMonth, currentYear);
  const startingDayOfWeek = getStartingDayOfWeek(currentMonth, currentYear);
  const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  const years = Array.from({ length: 5 }, (_, i) => today.getFullYear() + i);

  // Formatted selected Date string: YYYY-MM-DD
  const selectedDateStr = selectedDay 
    ? `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(selectedDay).padStart(2, '0')}`
    : null;

  // Nice human readable date string for display
  const formattedNewDate = selectedDay 
    ? new Date(currentYear, currentMonth, selectedDay).toLocaleDateString('en-US', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric'
      })
    : '';

  // Determine exact session duration & fee
  const sessionDuration = Number(session?.duration) || (session?.isFirstSession ? 60 : (session?.amount === 7500 ? 90 : 60));

  // Fetch fees & real-time remaining free session balance from backend
  useEffect(() => {
    const fetchFeesAndCredits = async () => {
      let resolvedEmail = (session?.email || session?.userId?.email || '').trim().toLowerCase();
      if (!resolvedEmail) {
        try {
          const uStr = localStorage.getItem('user') || localStorage.getItem('courseUser') || localStorage.getItem('userInfo');
          if (uStr) {
            const u = JSON.parse(uStr);
            if (u?.email) resolvedEmail = u.email.trim().toLowerCase();
          }
        } catch {}
      }

      const token = localStorage.getItem('token') || localStorage.getItem('courseToken');
      const authHeaders = {
        'Content-Type': 'application/json',
        ...(token ? { 'Authorization': `Bearer ${token}` } : {})
      };

      try {
        // 1. Fetch fees
        const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/appointments/check-session-type`, {
          method: 'POST',
          headers: authHeaders,
          body: JSON.stringify({ email: resolvedEmail })
        });
        if (res.ok) {
          const data = await res.json();
          setFees({
            fee60min: data.fee60min || 5000,
            fee90min: data.fee90min || 7500
          });
          if (typeof data.freeSessions === 'number') {
            const count = Math.max(0, data.freeSessions);
            setFreeSessionsRemaining(count);
            localStorage.setItem('freeSessions', String(count));
            setUseFreeCredit(count > 0);
          }
        }

        // 2. Fetch free sessions from /api/auth/check-free-sessions (exact same endpoint used on Booking page)
        if (resolvedEmail) {
          const freeRes = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/auth/check-free-sessions`, {
            method: 'POST',
            headers: authHeaders,
            body: JSON.stringify({ email: resolvedEmail })
          });
          if (freeRes.ok) {
            const freeData = await freeRes.json();
            if (typeof freeData.freeSessions === 'number') {
              const count = Math.max(0, freeData.freeSessions);
              setFreeSessionsRemaining(count);
              localStorage.setItem('freeSessions', String(count));
              setUseFreeCredit(count > 0);
            }
          }
        }
      } catch (err) {
        console.error('Failed to load session fees & free session count:', err);
      }
    };
    fetchFeesAndCredits();
  }, [session]);

  const rescheduleFee = sessionDuration === 90 
    ? (fees.fee90min || 7500) 
    : (fees.fee60min || 5000);

  // Fetch slots when a day is selected
  useEffect(() => {
    if (!selectedDay) {
      setTimes([]);
      return;
    }

    const fetchSlots = async () => {
      setLoadingSlots(true);
      setSlotsError(null);
      setTimes([]);

      try {
        const monthStr = String(currentMonth + 1).padStart(2, '0');
        const dayStr = String(selectedDay).padStart(2, '0');
        const dateStr = `${currentYear}-${monthStr}-${dayStr}`;

        const emailQuery = session.email ? `&email=${encodeURIComponent(session.email)}` : '';
        const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/cal/slots?date=${dateStr}${emailQuery}`);
        
        if (!res.ok) throw new Error('Failed to fetch slots');
        const resData = await res.json();
        
        const dailySlots = resData?.data?.slots?.[dateStr] || [];
        const formattedTimes = dailySlots.map(slot => {
          const dateObj = new Date(slot.time);
          return dateObj.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
        });
        setTimes(formattedTimes);
      } catch (err) {
        console.error(err);
        setSlotsError("Could not load available times for this date.");
      } finally {
        setLoadingSlots(false);
      }
    };

    fetchSlots();
  }, [selectedDay, currentMonth, currentYear, session.email]);

  const get48hInfo = () => {
    try {
      if (!session?.date || !session?.time) return null;
      const scheduled = new Date(`${session.date} ${session.time} GMT+0530`);
      if (isNaN(scheduled.getTime())) return null;
      const diffHours = Math.round((scheduled - new Date()) / (1000 * 60 * 60));
      return {
        hoursLeft: diffHours,
        isWithin48h: diffHours < 48,
      };
    } catch {
      return null;
    }
  };

  const notice48h = get48hInfo();

  const handleSubmit = async () => {
    if (!selectedDateStr || !selectedTime) return;
    setSubmitting(true);

    const token = localStorage.getItem('token');
    const authHeaders = {
      'Content-Type': 'application/json',
      ...(token ? { 'Authorization': `Bearer ${token}` } : {})
    };

    // Case 1: Within 48 Hours
    if (notice48h && notice48h.isWithin48h) {
      // 1A. User opted to use 1 Free Session Credit
      if (useFreeCredit && freeSessionsRemaining > 0) {
        try {
          const creditRes = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/appointments/${session._id || session.id}/reschedule-credit`, {
            method: 'POST',
            headers: authHeaders,
            body: JSON.stringify({
              date: selectedDateStr,
              time: selectedTime,
              reason
            })
          });

          const resJson = await creditRes.json().catch(() => null);

          if (creditRes.ok) {
            const newRemaining = resJson?.freeSessionsRemaining ?? Math.max(0, freeSessionsRemaining - 1);
            setFreeSessionsRemaining(newRemaining);
            localStorage.setItem('freeSessions', String(newRemaining));
            setShowConfirmPopup(false);
            setSuccessData({
              date: formattedNewDate,
              time: selectedTime,
              duration: sessionDuration,
              isPaid: false,
              isCredit: true,
              amount: 0,
              freeSessionsRemaining: newRemaining,
              paymentId: '',
              orderId: '',
              email: session?.email || '',
              reason: reason
            });
          } else {
            alert(resJson?.message || 'Failed to reschedule using free session credit.');
          }
        } catch (err) {
          console.error('Error rescheduling with credit:', err);
          alert('Network error while processing reschedule. Please check your connection.');
        } finally {
          setSubmitting(false);
        }
        return;
      }

      // 1B. Paid late reschedule flow with Razorpay
      try {
        const scriptLoaded = await loadRazorpayScript();
        if (!scriptLoaded) {
          alert('Razorpay SDK failed to load. Please check your internet connection.');
          setSubmitting(false);
          return;
        }

        // Fetch Razorpay public key
        const keyRes = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/payment/public-key`);
        const keyData = await keyRes.json();
        if (!keyRes.ok || !keyData.keyId) {
          alert('Payment gateway not configured. Please contact support.');
          setSubmitting(false);
          return;
        }

        // Create Razorpay order with exact session duration and fee
        const orderRes = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/payment/create-order`, {
          method: 'POST',
          headers: authHeaders,
          body: JSON.stringify({
            email: session.email,
            phoneNumber: session.phoneNumber,
            sessionDuration: sessionDuration,
            duration: sessionDuration,
            amount: rescheduleFee,
            currency: 'INR',
            receipt: `resched_${(session._id || session.id || '').toString().slice(-6)}_${Date.now()}`
          })
        });

        const orderData = await orderRes.json();
        if (!orderRes.ok) {
          alert(orderData.message || 'Failed to create payment order.');
          setSubmitting(false);
          return;
        }

        const finalChargeAmount = orderData.amount 
          ? orderData.amount / 100 
          : (orderData.amountRupees || rescheduleFee);

        // Launch Razorpay popup
        const options = {
          key: keyData.keyId,
          amount: orderData.amount,
          currency: orderData.currency || 'INR',
          name: 'Better With Aarkesh',
          description: `Late Reschedule Fee (${sessionDuration} mins)`,
          order_id: orderData.id,
          prefill: {
            name: session.name || '',
            email: session.email || '',
            contact: session.phoneNumber || ''
          },
          theme: {
            color: '#c9542f'
          },
          handler: async function (response) {
            try {
              const paidRes = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/appointments/${session._id || session.id}/reschedule-paid`, {
                method: 'POST',
                headers: authHeaders,
                body: JSON.stringify({
                  date: selectedDateStr,
                  time: selectedTime,
                  reason,
                  paymentId: response.razorpay_payment_id,
                  orderId: response.razorpay_order_id,
                  signature: response.razorpay_signature,
                  amount: finalChargeAmount
                })
              });

              const resJson = await paidRes.json().catch(() => null);

              if (paidRes.ok) {
                setShowConfirmPopup(false);
                setSuccessData({
                  date: formattedNewDate,
                  time: selectedTime,
                  duration: sessionDuration,
                  isPaid: true,
                  isCredit: false,
                  amount: finalChargeAmount,
                  paymentId: response.razorpay_payment_id,
                  orderId: response.razorpay_order_id,
                  email: session?.email || '',
                  reason: reason
                });
              } else {
                alert(resJson?.message || 'Payment was processed, but updating the schedule encountered an issue. Our support team will assist you.');
              }
            } catch (err) {
              console.error('Error confirming paid reschedule:', err);
              alert('Network error while confirming schedule. Please check your connection or contact support.');
            } finally {
              setSubmitting(false);
            }
          },
          modal: {
            ondismiss: function () {
              setSubmitting(false);
            }
          }
        };

        const rzp = new window.Razorpay(options);
        rzp.open();
      } catch (err) {
        console.error('Late reschedule payment error:', err);
        alert('An error occurred while opening payment gateway.');
        setSubmitting(false);
      }
      return;
    }

    // Case 2: > 48 Hours -> Free reschedule request
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/appointments/${session._id || session.id}/reschedule`, {
        method: 'POST',
        headers: authHeaders,
        body: JSON.stringify({ date: selectedDateStr, time: selectedTime, reason })
      });
      
      const resJson = await res.json().catch(() => null);

      if (res.ok) {
        setShowConfirmPopup(false);
        setSuccessData({
          date: formattedNewDate,
          time: selectedTime,
          duration: sessionDuration,
          isPaid: false,
          isCredit: false,
          amount: 0,
          paymentId: '',
          orderId: '',
          email: session?.email || '',
          reason: reason
        });
      } else {
        alert(resJson?.message || "Failed to submit reschedule request.");
      }
    } catch (err) {
      console.error(err);
      alert("An error occurred while submitting reschedule request.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(currentYear + 1);
    } else {
      setCurrentMonth(currentMonth + 1);
    }
    setSelectedDay(null);
    setSelectedTime(null);
  };

  const handlePrevMonth = () => {
    if (currentYear === today.getFullYear() && currentMonth === today.getMonth()) return;
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(currentYear - 1);
    } else {
      setCurrentMonth(currentMonth - 1);
    }
    setSelectedDay(null);
    setSelectedTime(null);
  };

  return createPortal(
    <div 
      className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-5"
      onClick={() => activeDropdown && setActiveDropdown(null)}
    >
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity" 
        onClick={() => {
          if (successData) {
            onSuccess();
          } else {
            onClose();
          }
        }} 
      />
      
      {/* Modal Card */}
      <div 
        className="relative bg-[#fbfbf9] border border-[#eadcd3] rounded-3xl w-full max-w-4xl max-h-[92vh] overflow-y-auto shadow-2xl flex flex-col z-10 custom-scrollbar"
        data-lenis-prevent="true"
        onClick={(e) => e.stopPropagation()}
      >
        {/* ========================================================================= */}
        {/* SUCCESS CONFIRMATION SCREEN (Shown immediately after payment/reschedule) */}
        {/* ========================================================================= */}
        {successData ? (
          <div className="p-6 sm:p-10 flex flex-col items-center text-center animate-in zoom-in-95 duration-200">
            
            {/* Top Glowing Icon Badge */}
            <div className="relative mb-5 sm:mb-6">
              <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-[#fbf0eb] border-2 border-[#e8c4e2] flex items-center justify-center text-[#c9542f] shadow-lg">
                <CheckCircle size={48} weight="fill" className="text-[#c9542f]" />
              </div>
              <div className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full bg-emerald-500 text-white flex items-center justify-center shadow-md border-2 border-white">
                <Sparkle size={16} weight="fill" />
              </div>
            </div>

            {/* Success Heading */}
            <h2 className="font-serif text-2xl sm:text-4xl text-[#111010] font-normal mb-2">
              {successData.isPaid 
                ? 'Payment & Reschedule Confirmed!' 
                : successData.isCredit 
                  ? 'Rescheduled with Free Credit!' 
                  : 'Reschedule Confirmed!'}
            </h2>
            <p className="text-[#555047] text-xs sm:text-sm font-sans max-w-md mb-6 sm:mb-8 leading-relaxed">
              Your 1-on-1 coaching session has been successfully rescheduled. Your calendar invites and session links have been updated.
            </p>

            {/* Detailed Summary Card */}
            <div className="w-full max-w-lg bg-white border border-[#eadcd3] rounded-2xl p-5 sm:p-6 shadow-sm flex flex-col gap-4 text-left mb-6 sm:mb-8">
              
              {/* Date & Time Highlight */}
              <div className="bg-[#fbf0eb] border border-[#e8c4e2] rounded-xl p-4 flex flex-col gap-2">
                <span className="font-sans text-[0.65rem] uppercase tracking-wider text-[#c9542f] font-bold flex items-center gap-1.5">
                  <CalendarBlank size={14} weight="bold" />
                  New Confirmed Session Slot
                </span>
                <div className="font-serif text-lg sm:text-xl text-[#111010] font-medium">
                  {successData.date}
                </div>
                <div className="flex items-center gap-2 text-xs sm:text-sm font-sans font-semibold text-[#111010]">
                  <Clock size={16} className="text-[#c9542f]" weight="bold" />
                  <span>{successData.time}</span>
                  <span className="text-xs font-normal text-[#7a756b]">({successData.duration} Minutes Duration)</span>
                </div>
              </div>

              {/* Free Credit Used Info */}
              {successData.isCredit && (
                <div className="bg-[#f0fdf4] border border-[#bbf7d0] rounded-xl p-4 flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <Sparkle size={18} className="text-emerald-600" weight="fill" />
                    <div>
                      <span className="font-sans text-xs font-bold text-emerald-950 uppercase tracking-wider block">
                        Complimentary Credit Used
                      </span>
                      <span className="text-[0.7rem] text-emerald-800">
                        {successData.freeSessionsRemaining} credit(s) remaining on your account
                      </span>
                    </div>
                  </div>
                  <span className="font-serif text-base font-bold text-emerald-800">₹0</span>
                </div>
              )}

              {/* Payment & Transaction Info (if paid) */}
              {successData.isPaid && (
                <div className="bg-[#f9faf7] border border-[#d6e2d1] rounded-xl p-4 flex flex-col gap-2.5">
                  <div className="flex items-center justify-between border-b border-[#e2ece0] pb-2">
                    <span className="font-sans text-xs font-bold text-emerald-950 uppercase tracking-wider flex items-center gap-1.5">
                      <CreditCard size={15} className="text-emerald-600" weight="bold" />
                      Late Reschedule Fee ({successData.duration} mins)
                    </span>
                    <div className="flex items-center gap-2">
                      <span className="font-serif text-base sm:text-lg font-bold text-emerald-800">
                        ₹{Number(successData.amount).toLocaleString('en-IN')}
                      </span>
                      <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-800 text-[0.62rem] font-bold uppercase tracking-wider">
                        PAID
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[0.68rem] text-[#555047] font-mono pt-0.5">
                    {successData.paymentId && (
                      <div>
                        <span className="text-[#7a756b] block text-[0.6rem] uppercase font-sans">Payment ID</span>
                        <span className="font-semibold text-emerald-950 break-all">{successData.paymentId}</span>
                      </div>
                    )}
                    {successData.orderId && (
                      <div>
                        <span className="text-[#7a756b] block text-[0.6rem] uppercase font-sans">Order ID</span>
                        <span className="text-[#111010] break-all">{successData.orderId}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Email & Calendar Notice */}
              <div className="flex items-start gap-3 text-xs text-[#555047] pt-1">
                <EnvelopeSimple size={18} className="text-[#c9542f] shrink-0 mt-0.5" />
                <span className="leading-relaxed">
                  A confirmation email with the Google Meet link has been sent to <strong className="text-[#111010] font-semibold">{successData.email || session?.email}</strong>.
                </span>
              </div>
            </div>

            {/* Done / Return Action */}
            <button
              type="button"
              onClick={onSuccess}
              className="w-full max-w-lg py-3.5 px-6 rounded-full bg-[#111010] hover:bg-[#c9542f] text-white text-xs sm:text-sm font-sans uppercase tracking-widest font-semibold shadow-lg hover:shadow-xl transition-all cursor-pointer text-center"
            >
              Done • Return to My Journey
            </button>

          </div>
        ) : (
          <>
            {/* Header */}
            <div className="sticky top-0 bg-[#fbfbf9]/95 backdrop-blur-md border-b border-[#eadcd3] p-5 sm:p-6 flex items-start justify-between z-30">
              <div className="flex flex-col gap-1">
                <h2 className="font-serif text-2xl sm:text-3xl text-[#111010] font-normal">
                  Reschedule Session
                </h2>
                <p className="text-[#7a756b] text-xs sm:text-sm font-sans">
                  Current Session: <span className="font-semibold text-[#111010]">{session?.formattedDate || session?.date}</span> at <span className="font-semibold text-[#111010]">{session?.time}</span> ({sessionDuration} mins)
                </p>
              </div>
              <button 
                onClick={onClose} 
                className="p-2 text-[#7a756b] hover:text-[#111010] hover:bg-[#fbf0eb] rounded-full transition-colors cursor-pointer"
                aria-label="Close modal"
              >
                <X size={22} />
              </button>
            </div>

            {/* Content Body */}
            <div className="p-5 sm:p-7 md:p-8 flex flex-col gap-6">
              
              {/* 48h Notice Badge */}
              {notice48h && notice48h.isWithin48h ? (
                <div className="bg-[#fef2f0] border border-[#f5c6cb] rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-xs">
                  <div className="flex flex-col gap-1">
                    <span className="font-bold text-[#c9542f] uppercase tracking-wider text-xs flex items-center gap-1.5">
                      ⚠️ Late Reschedule Window ({notice48h.hoursLeft > 0 ? `${notice48h.hoursLeft} hours remaining` : 'Under 48 Hours'})
                    </span>
                    <span className="text-[#555047] text-xs leading-relaxed">
                      {freeSessionsRemaining > 0 ? (
                        <>
                          You have <strong className="text-emerald-700 font-bold">{freeSessionsRemaining} Free Session{freeSessionsRemaining === 1 ? '' : 's'} Remaining</strong>. You can use 1 remaining free session to reschedule immediately at <strong className="text-emerald-700 font-bold">₹0</strong>, or pay the late reschedule fee of <strong className="text-[#111010] font-bold">₹{rescheduleFee.toLocaleString('en-IN')}</strong> ({sessionDuration} mins).
                        </>
                      ) : (
                        <>
                          Per our rescheduling policy, sessions rescheduled less than 48 hours in advance require a session fee of <strong className="text-[#111010] font-bold">₹{rescheduleFee.toLocaleString('en-IN')}</strong> ({sessionDuration} mins) to secure your new slot.
                        </>
                      )}
                    </span>
                    <button
                      type="button"
                      onClick={() => setIsPolicyOpen(true)}
                      className="text-[#c9542f] text-xs font-semibold underline hover:text-[#111010] transition-colors cursor-pointer text-left self-start mt-0.5"
                    >
                      View Rescheduling Policy →
                    </button>
                  </div>
                  <div className="shrink-0 flex items-center gap-2 bg-[#fbf0eb] border border-[#e8c4e2] px-3.5 py-2 rounded-xl">
                    {freeSessionsRemaining > 0 ? (
                      <>
                        <Sparkle size={18} className="text-emerald-600" weight="fill" />
                        <span className="font-sans font-bold text-xs text-emerald-800">{freeSessionsRemaining} Free Session{freeSessionsRemaining === 1 ? '' : 's'} Remaining</span>
                      </>
                    ) : (
                      <>
                        <CreditCard size={18} className="text-[#c9542f]" weight="bold" />
                        <span className="font-sans font-bold text-xs text-[#c9542f]">Fee: ₹{rescheduleFee.toLocaleString('en-IN')}</span>
                      </>
                    )}
                  </div>
                </div>
              ) : (
                <div className="bg-[#f0f9f4] border border-[#c3e6cb] rounded-2xl p-4 sm:p-4.5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5 text-xs shadow-xs">
                  <div className="flex items-center gap-3">
                    <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 shrink-0" />
                    <span className="text-emerald-900 leading-relaxed font-sans">
                      <strong className="text-emerald-950 font-semibold">Free Reschedule Eligible:</strong> You are rescheduling more than 48 hours in advance. No additional charges apply.
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsPolicyOpen(true)}
                    className="text-[#c9542f] font-semibold underline hover:text-[#111010] transition-colors cursor-pointer shrink-0 sm:ml-2"
                  >
                    View Rescheduling Policy
                  </button>
                </div>
              )}

              {/* Calendar & Time Slots Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8">
                
                {/* Left Column: Calendar (6 cols) */}
                <div className="lg:col-span-6 flex flex-col">
                  <h3 className="font-sans text-[0.68rem] uppercase tracking-[0.2em] font-bold text-[#c9542f] mb-3">
                    CHOOSE A DATE
                  </h3>

                  <div className="bg-white border border-[#eadcd3] rounded-2xl p-4 sm:p-5 shadow-xs">
                    {/* Month & Year Selectors with Arrows */}
                    <div className="flex items-center justify-between mb-4 relative z-20">
                      <div className="flex items-center gap-2">
                        
                        {/* Month Dropdown */}
                        <div className="relative">
                          <button 
                            type="button"
                            onClick={() => setActiveDropdown(activeDropdown === 'month' ? null : 'month')}
                            className="flex items-center gap-1.5 text-[#111010] hover:text-[#c9542f] transition-colors text-base sm:text-lg font-serif font-medium focus:outline-none cursor-pointer"
                          >
                            {monthNames[currentMonth]}
                            <CaretDown size={14} className={`text-[#c9542f] transition-transform ${activeDropdown === 'month' ? 'rotate-180' : ''}`} />
                          </button>
                          
                          {activeDropdown === 'month' && (
                            <div className="absolute top-full left-0 mt-2 w-36 bg-white border border-[#eadcd3] rounded-xl shadow-xl flex flex-col py-1.5 z-30 max-h-48 overflow-y-auto overscroll-contain custom-scrollbar">
                              {monthNames.map((m, idx) => {
                                const isPast = currentYear === today.getFullYear() && idx < today.getMonth();
                                return (
                                  <button 
                                    key={m} 
                                    type="button"
                                    onClick={() => {
                                      if (!isPast) {
                                        setCurrentMonth(idx);
                                        setSelectedDay(null);
                                        setSelectedTime(null);
                                        setActiveDropdown(null);
                                      }
                                    }}
                                    disabled={isPast}
                                    className={`px-4 py-2 text-left text-xs sm:text-sm font-sans transition-colors ${
                                      isPast ? 'text-black/20 cursor-not-allowed' : 
                                      currentMonth === idx ? 'text-[#c9542f] bg-[#fbf0eb] font-semibold' : 'text-[#111010] hover:bg-[#fbf0eb]/60 cursor-pointer'
                                    }`}
                                  >
                                    {m}
                                  </button>
                                );
                              })}
                            </div>
                          )}
                        </div>

                        {/* Year Dropdown */}
                        <div className="relative">
                          <button 
                            type="button"
                            onClick={() => setActiveDropdown(activeDropdown === 'year' ? null : 'year')}
                            className="flex items-center gap-1.5 text-[#111010] hover:text-[#c9542f] transition-colors text-base sm:text-lg font-serif font-medium focus:outline-none cursor-pointer"
                          >
                            {currentYear}
                            <CaretDown size={14} className={`text-[#c9542f] transition-transform ${activeDropdown === 'year' ? 'rotate-180' : ''}`} />
                          </button>
                          
                          {activeDropdown === 'year' && (
                            <div className="absolute top-full left-0 mt-2 w-28 bg-white border border-[#eadcd3] rounded-xl shadow-xl flex flex-col py-1.5 z-30 max-h-48 overflow-y-auto overscroll-contain custom-scrollbar">
                              {years.map(y => (
                                <button 
                                  key={y} 
                                  type="button"
                                  onClick={() => {
                                    setCurrentYear(y);
                                    if (y === today.getFullYear() && currentMonth < today.getMonth()) {
                                      setCurrentMonth(today.getMonth());
                                    }
                                    setSelectedDay(null);
                                    setSelectedTime(null);
                                    setActiveDropdown(null);
                                  }}
                                  className={`px-4 py-2 text-left text-xs sm:text-sm font-sans transition-colors ${
                                    currentYear === y ? 'text-[#c9542f] bg-[#fbf0eb] font-semibold' : 'text-[#111010] hover:bg-[#fbf0eb]/60 cursor-pointer'
                                  }`}
                                >
                                  {y}
                                </button>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Navigation Arrows */}
                      <div className="flex items-center gap-2 text-[#c9542f]">
                        <button
                          type="button"
                          disabled={currentYear === today.getFullYear() && currentMonth === today.getMonth()}
                          onClick={handlePrevMonth}
                          className={`p-1.5 rounded-lg transition-colors ${
                            currentYear === today.getFullYear() && currentMonth === today.getMonth()
                              ? 'text-black/15 cursor-not-allowed'
                              : 'hover:bg-[#fbf0eb] hover:text-[#111010] cursor-pointer'
                          }`}
                        >
                          <CaretLeft size={18} />
                        </button>
                        <button
                          type="button"
                          onClick={handleNextMonth}
                          className="p-1.5 rounded-lg hover:bg-[#fbf0eb] hover:text-[#111010] transition-colors cursor-pointer"
                        >
                          <CaretRight size={18} />
                        </button>
                      </div>
                    </div>

                    {/* Days of Week Header */}
                    <div className="grid grid-cols-7 gap-y-1.5 mb-2">
                      {['SU', 'MO', 'TU', 'WE', 'TH', 'FR', 'SA'].map(day => (
                        <div key={day} className="text-center font-sans text-[0.65rem] tracking-wider text-[#7a756b] font-bold mb-1">
                          {day}
                        </div>
                      ))}

                      {/* Empty slots before month starts */}
                      {[...Array(startingDayOfWeek)].map((_, i) => {
                        const prevMonthDays = getDaysInMonth(currentMonth === 0 ? 11 : currentMonth - 1, currentMonth === 0 ? currentYear - 1 : currentYear);
                        return (
                          <div key={`empty-${i}`} className="text-center text-black/15 font-light text-xs sm:text-sm flex items-center justify-center h-8">
                            {prevMonthDays - startingDayOfWeek + i + 1}
                          </div>
                        );
                      })}

                      {/* Actual Month Days */}
                      {[...Array(daysInMonth)].map((_, i) => {
                        const day = i + 1;
                        const isSelected = selectedDay === day;
                        const isPast = currentYear === today.getFullYear() && currentMonth === today.getMonth() && day < today.getDate();
                        
                        return (
                          <div key={day} className="flex items-center justify-center">
                            <button
                              type="button"
                              onClick={() => {
                                if (!isPast) {
                                  setSelectedDay(day);
                                  setSelectedTime(null);
                                }
                              }}
                              disabled={isPast}
                              className={`w-8 h-8 rounded-lg flex items-center justify-center font-sans text-xs sm:text-sm transition-all
                                ${isPast ? 'text-black/20 cursor-not-allowed' : 'cursor-pointer'}
                                ${!isPast && isSelected ? 'bg-[#c9542f] text-white font-bold shadow-xs' : ''}
                                ${!isPast && !isSelected ? 'text-[#111010] hover:bg-[#fbf0eb] hover:text-[#c9542f] font-normal' : ''}
                              `}
                            >
                              {day}
                            </button>
                          </div>
                        );
                      })}

                      {/* Trailing empty slots */}
                      {[...Array(42 - (daysInMonth + startingDayOfWeek))].map((_, i) => (
                        <div key={`empty-end-${i}`} className="text-center text-black/15 font-light text-xs sm:text-sm flex items-center justify-center h-8">
                          {i + 1}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Right Column: Time Slots (6 cols) */}
                <div className="lg:col-span-6 flex flex-col">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-sans text-[0.68rem] uppercase tracking-[0.2em] font-bold text-[#c9542f]">
                      CHOOSE A TIME
                    </h3>
                    {times.length > 0 && !loadingSlots && (
                      <span className="font-sans text-[0.62rem] uppercase tracking-wider text-[#7a756b] font-bold">
                        {times.length} {times.length === 1 ? 'Slot Available' : 'Slots Available'}
                      </span>
                    )}
                  </div>

                  <div 
                    className="flex flex-col gap-4 max-h-[320px] sm:max-h-[350px] overflow-y-auto custom-scrollbar pr-1 sm:pr-2 overscroll-contain"
                    data-lenis-prevent="true"
                  >
                    {!selectedDay && (
                      <div className="text-[#7a756b] text-xs sm:text-sm font-light italic p-8 text-center border border-[#eadcd3] rounded-2xl bg-white/70">
                        Select a date from the calendar to view available times.
                      </div>
                    )}

                    {loadingSlots && (
                      <div className="text-[#c9542f] text-xs sm:text-sm font-medium p-8 text-center border border-[#eadcd3] rounded-2xl bg-white/70 flex flex-col items-center gap-2">
                        <div className="w-5 h-5 border-2 border-[#c9542f]/20 border-t-[#c9542f] rounded-full animate-spin mb-1" />
                        Finding available time slots...
                      </div>
                    )}

                    {slotsError && (
                      <div className="text-red-700 text-xs sm:text-sm font-normal p-4 text-center border border-red-200 rounded-2xl bg-red-50">
                        {slotsError}
                      </div>
                    )}

                    {!loadingSlots && !slotsError && selectedDay && times.length === 0 && (
                      <div className="text-[#7a756b] text-xs sm:text-sm font-light italic p-8 text-center border border-[#eadcd3] rounded-2xl bg-white/70">
                        No slots available on this date. Please pick another date.
                      </div>
                    )}

                    {!loadingSlots && !slotsError && selectedDay && times.length > 0 && (
                      (() => {
                        const grouped = getGroupedSlots(times);
                        return (
                          <div className="flex flex-col gap-4">
                            {['morning', 'afternoon', 'evening'].map(periodKey => {
                              const periodSlots = grouped[periodKey];
                              if (!periodSlots || periodSlots.length === 0) return null;
                              const config = PERIOD_CONFIG[periodKey];
                              const Icon = config.icon;

                              return (
                                <div key={periodKey} className="flex flex-col gap-2">
                                  {/* Period Header */}
                                  <div className="flex items-center justify-between px-1 pb-1 border-b border-[#eadcd3]">
                                    <div className="flex items-center gap-1.5 sm:gap-2">
                                      <Icon className="text-sm sm:text-base text-[#c9542f]" weight="bold" />
                                      <span className="font-sans text-[0.68rem] sm:text-[0.72rem] uppercase tracking-[0.16em] font-bold text-[#111010]">
                                        {config.label}
                                      </span>
                                      <span className="text-[0.62rem] sm:text-[0.68rem] text-[#7a756b] font-light">
                                        • {config.sub}
                                      </span>
                                    </div>
                                    <span className="text-[0.58rem] uppercase tracking-wider text-[#c9542f] bg-[#fbf0eb] px-2 py-0.5 rounded-md border border-[#e8c4e2] font-bold">
                                      {periodSlots.length} {periodSlots.length === 1 ? 'slot' : 'slots'}
                                    </span>
                                  </div>

                                  {/* Slots Grid */}
                                  <div className="grid grid-cols-2 gap-2">
                                    {periodSlots.map(time => {
                                      const isSelected = selectedTime === time;
                                      return (
                                        <button
                                          key={time}
                                          type="button"
                                          onClick={() => setSelectedTime(time)}
                                          className={`px-3 sm:px-4 py-2.5 rounded-xl border text-left transition-all flex items-center justify-between group cursor-pointer
                                            ${isSelected 
                                              ? 'bg-[#fbf0eb] border-2 border-[#c9542f] text-[#c9542f] shadow-xs' 
                                              : 'bg-white border-[#eadcd3] text-[#111010] hover:border-[#c9542f] hover:bg-[#fbf0eb]/50'
                                            }
                                          `}
                                        >
                                          <div className="flex items-center gap-1.5 sm:gap-2 min-w-0">
                                            <Clock className={`text-xs shrink-0 ${isSelected ? 'text-[#c9542f]' : 'text-[#7a756b] group-hover:text-[#c9542f] transition-colors'}`} />
                                            <span className={`text-xs sm:text-sm font-sans tracking-wide truncate ${isSelected ? 'font-bold text-[#c9542f]' : 'font-medium'}`}>
                                              {time}
                                            </span>
                                          </div>
                                          {isSelected && (
                                            <CheckCircle className="text-[#c9542f] text-base shrink-0 ml-1" weight="fill" />
                                          )}
                                        </button>
                                      );
                                    })}
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        );
                      })()
                    )}
                  </div>
                </div>
              </div>

              {/* Reason Field */}
              <div className="flex flex-col gap-1.5 pt-2 border-t border-[#eadcd3]">
                <label htmlFor="reschedule-reason" className="font-sans text-xs text-[#555047] font-medium">
                  Reason for rescheduling (Optional)
                </label>
                <textarea
                  id="reschedule-reason"
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  className="w-full h-20 bg-white border border-[#eadcd3] rounded-xl p-3 text-[#111010] placeholder-[#7a756b]/50 text-xs sm:text-sm focus:outline-none focus:border-[#c9542f] transition-colors resize-none custom-scrollbar"
                  placeholder="E.g., I have a sudden conflict, traveling, etc."
                />
              </div>
            </div>

            {/* Footer Bar */}
            <div className="p-5 sm:p-6 bg-white border-t border-[#eadcd3] flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-between gap-3 sm:gap-4 mt-auto">
              <div className="flex items-center gap-2 text-[#7a756b]">
                <CalendarBlank className="text-lg text-[#c9542f] shrink-0" weight="light" />
                <span className="font-sans text-xs">
                  All sessions are 1-on-1 and last {sessionDuration} minutes.
                </span>
              </div>

              <div className="flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-5 py-2.5 rounded-full border border-black/15 text-[#555047] hover:text-[#111010] hover:bg-[#fbf0eb] text-xs font-sans uppercase tracking-wider font-semibold transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button 
                  type="button"
                  disabled={!selectedDay || !selectedTime || submitting}
                  onClick={() => setShowConfirmPopup(true)}
                  className={`px-6 py-2.5 rounded-full text-white text-xs font-sans uppercase tracking-wider font-semibold shadow-md hover:shadow-lg transition-all disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer text-center flex items-center gap-2 ${
                    notice48h && notice48h.isWithin48h
                      ? useFreeCredit && freeSessionsRemaining > 0
                        ? 'bg-emerald-700 hover:bg-emerald-800'
                        : 'bg-[#c9542f] hover:bg-[#b04523]'
                      : 'bg-[#111010] hover:bg-[#c9542f]'
                  }`}
                >
                  {notice48h && notice48h.isWithin48h ? (
                    useFreeCredit && freeSessionsRemaining > 0 ? (
                      <>
                        <Sparkle size={15} weight="fill" />
                        <span>Reschedule with 1 Credit (₹0)</span>
                      </>
                    ) : (
                      <>
                        <CreditCard size={15} weight="bold" />
                        <span>Pay ₹{rescheduleFee.toLocaleString('en-IN')} &amp; Reschedule</span>
                      </>
                    )
                  ) : (
                    <span>Confirm Reschedule</span>
                  )}
                </button>
              </div>
            </div>
          </>
        )}

      </div>

      {/* Confirmation Summary Popup Dialog */}
      {showConfirmPopup && !successData && (
        <div 
          className="fixed inset-0 z-[110] flex items-center justify-center p-3 sm:p-5 bg-black/70 backdrop-blur-md animate-in fade-in duration-200"
          onClick={() => setShowConfirmPopup(false)}
        >
          <div 
            className="bg-[#fbfbf9] border border-[#eadcd3] rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 relative flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Confirmation Header */}
            <div className="px-6 py-5 border-b border-[#eadcd3] bg-[#fbfbf9]/95 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-[#fbf0eb] border border-[#e8c4e2] flex items-center justify-center text-[#c9542f] shrink-0 shadow-xs">
                  <ArrowsClockwise size={18} weight="bold" />
                </div>
                <div>
                  <h3 className="text-lg sm:text-xl font-serif text-[#111010] font-normal">
                    Confirm Reschedule
                  </h3>
                  <span className="text-[0.62rem] uppercase tracking-widest text-[#c9542f] font-sans font-bold">
                    Review Details Before Proceeding
                  </span>
                </div>
              </div>

              <button 
                type="button"
                onClick={() => setShowConfirmPopup(false)}
                className="w-8 h-8 rounded-full flex items-center justify-center text-[#7a756b] hover:text-[#111010] hover:bg-[#fbf0eb] transition-all cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            {/* Confirmation Body Details */}
            <div className="p-6 sm:p-7 flex flex-col gap-3.5">
              
              {/* Current Session Box */}
              <div className="bg-white border border-[#eadcd3] rounded-2xl p-4 sm:p-5 flex flex-col gap-1.5 shadow-xs">
                <span className="font-sans text-[0.65rem] uppercase tracking-wider text-[#7a756b] font-bold">
                  Current Scheduled Slot
                </span>
                <div className="flex items-center gap-2 text-xs sm:text-sm text-[#555047]">
                  <CalendarBlank size={16} className="text-[#7a756b] shrink-0" />
                  <span className="line-through">{session?.formattedDate || session?.date} at {session?.time}</span>
                </div>
              </div>

              {/* Arrow Transition */}
              <div className="flex items-center justify-center py-0.5">
                <div className="px-3.5 py-1 rounded-full bg-[#fbf0eb] border border-[#e8c4e2] text-[#c9542f] font-sans text-[0.68rem] font-bold uppercase tracking-wider flex items-center gap-1.5 shadow-xs">
                  <ArrowRight size={12} weight="bold" />
                  <span>Rescheduling To New Slot</span>
                </div>
              </div>

              {/* New Slot Details Box */}
              <div className="bg-[#fbf0eb] border border-[#e8c4e2] rounded-2xl p-4 sm:p-5 flex flex-col gap-2.5 shadow-xs">
                <span className="font-sans text-[0.68rem] uppercase tracking-wider text-[#c9542f] font-bold flex items-center gap-1.5">
                  <CheckCircle size={15} weight="fill" />
                  New Requested Date &amp; Time
                </span>
                
                <div className="flex flex-col gap-1.5 pt-1">
                  <div className="flex items-center gap-2 font-serif text-base sm:text-lg text-[#111010] font-medium">
                    <CalendarBlank size={18} className="text-[#c9542f] shrink-0" />
                    <span>{formattedNewDate}</span>
                  </div>
                  <div className="flex items-center gap-2 font-sans text-xs sm:text-sm text-[#111010] font-semibold pl-6">
                    <Clock size={16} className="text-[#c9542f] shrink-0" />
                    <span>{selectedTime}</span>
                    <span className="text-xs font-normal text-[#7a756b]">({sessionDuration} mins)</span>
                  </div>
                </div>

                {reason && reason.trim() && (
                  <div className="mt-1 pt-2.5 border-t border-[#eadcd3] text-xs">
                    <span className="font-bold text-[#555047]">Reason: </span>
                    <span className="italic text-[#555047]">"{reason.trim()}"</span>
                  </div>
                )}
              </div>

              {/* Pricing & 48h Notice in Popup */}
              {notice48h && notice48h.isWithin48h ? (
                freeSessionsRemaining > 0 ? (
                  /* Free Session Credit Selector */
                  <div className="flex flex-col gap-2.5 pt-1">
                    <span className="font-sans text-[0.65rem] uppercase tracking-wider text-[#555047] font-bold">
                      Reschedule Payment Option (Late Window &lt; 48h)
                    </span>
                    
                    {/* Option 1: Use Free Session Credit */}
                    <div 
                      onClick={() => setUseFreeCredit(true)}
                      className={`cursor-pointer rounded-2xl p-3.5 border transition-all flex items-center justify-between ${
                        useFreeCredit 
                          ? 'bg-[#f0fdf4] border-emerald-500 ring-2 ring-emerald-500/20 shadow-xs' 
                          : 'bg-white border-[#eadcd3] hover:border-emerald-300'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                          useFreeCredit ? 'border-emerald-600 bg-emerald-600' : 'border-gray-300'
                        }`}>
                          {useFreeCredit && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                        </div>
                        <div className="flex flex-col">
                          <span className="font-sans text-xs font-bold text-[#111010] flex items-center gap-1.5">
                            <Sparkle size={14} className="text-emerald-600" weight="fill" />
                            Use 1 Free Session Credit
                          </span>
                          <span className="text-[0.68rem] text-emerald-800 font-medium">
                            {freeSessionsRemaining} credit{freeSessionsRemaining === 1 ? '' : 's'} available • Instant confirm
                          </span>
                        </div>
                      </div>
                      <span className="font-serif text-base font-bold text-emerald-800">₹0</span>
                    </div>

                    {/* Option 2: Pay Reschedule Fee */}
                    <div 
                      onClick={() => setUseFreeCredit(false)}
                      className={`cursor-pointer rounded-2xl p-3.5 border transition-all flex items-center justify-between ${
                        !useFreeCredit 
                          ? 'bg-[#fef2f0] border-[#c9542f] ring-2 ring-[#c9542f]/20 shadow-xs' 
                          : 'bg-white border-[#eadcd3] hover:border-[#c9542f]/50'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                          !useFreeCredit ? 'border-[#c9542f] bg-[#c9542f]' : 'border-gray-300'
                        }`}>
                          {!useFreeCredit && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                        </div>
                        <div className="flex flex-col">
                          <span className="font-sans text-xs font-bold text-[#111010] flex items-center gap-1.5">
                            <CreditCard size={14} className="text-[#c9542f]" weight="bold" />
                            Pay Late Reschedule Fee
                          </span>
                          <span className="text-[0.68rem] text-[#7a756b]">
                            Pay securely via Razorpay ({sessionDuration} mins)
                          </span>
                        </div>
                      </div>
                      <span className="font-serif text-base font-bold text-[#c9542f]">
                        ₹{rescheduleFee.toLocaleString('en-IN')}
                      </span>
                    </div>
                  </div>
                ) : (
                  <div className="bg-[#fef2f0] border border-[#f5c6cb] rounded-2xl p-4 flex flex-col gap-2 shadow-xs">
                    <div className="flex items-center justify-between border-b border-[#f5c6cb] pb-2">
                      <span className="font-sans text-xs font-bold text-[#721c24] uppercase tracking-wider flex items-center gap-1.5">
                        <LockSimple size={14} weight="bold" />
                        Late Reschedule Fee ({sessionDuration} mins)
                      </span>
                      <span className="font-serif text-lg font-bold text-[#c9542f]">
                        ₹{rescheduleFee.toLocaleString('en-IN')}
                      </span>
                    </div>
                    <p className="text-[0.72rem] text-[#721c24] leading-relaxed">
                      As this reschedule is within 48 hours, completing the payment securely via Razorpay will immediately confirm your new slot and update your session links.
                    </p>
                  </div>
                )
              ) : (
                <div className="bg-[#f0f9f4] border border-[#c3e6cb] rounded-xl p-3.5 text-[0.72rem] text-emerald-900 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shrink-0" />
                    <span className="leading-relaxed">Free Reschedule Eligible (&gt; 48 hours notice).</span>
                  </div>
                  <span className="font-semibold text-emerald-950 font-sans">₹0</span>
                </div>
              )}

            </div>

            {/* Confirmation Footer */}
            <div className="px-6 py-4 bg-white border-t border-[#eadcd3] flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setShowConfirmPopup(false)}
                className="px-5 py-2.5 rounded-full border border-black/15 text-[#555047] hover:text-[#111010] hover:bg-[#fbf0eb] text-xs font-sans uppercase tracking-wider font-semibold transition-all cursor-pointer"
              >
                Back &amp; Edit
              </button>
              <button
                type="button"
                disabled={submitting}
                onClick={handleSubmit}
                className={`px-6 py-2.5 rounded-full text-white text-xs font-sans uppercase tracking-wider font-semibold shadow-md hover:shadow-lg transition-all disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer flex items-center gap-2 ${
                  notice48h && notice48h.isWithin48h
                    ? useFreeCredit && freeSessionsRemaining > 0
                      ? 'bg-emerald-700 hover:bg-emerald-800'
                      : 'bg-[#c9542f] hover:bg-[#b04523]'
                    : 'bg-[#111010] hover:bg-[#c9542f]'
                }`}
              >
                {submitting ? (
                  <>
                    <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Processing...</span>
                  </>
                ) : notice48h && notice48h.isWithin48h ? (
                  useFreeCredit && freeSessionsRemaining > 0 ? (
                    <>
                      <Sparkle size={15} weight="fill" />
                      <span>Use 1 Free Credit &amp; Confirm</span>
                    </>
                  ) : (
                    <>
                      <CreditCard size={15} weight="bold" />
                      <span>Pay ₹{rescheduleFee.toLocaleString('en-IN')} &amp; Confirm</span>
                    </>
                  )
                ) : (
                  <span>Yes, Confirm Reschedule</span>
                )}
              </button>
            </div>

          </div>
        </div>
      )}

      {/* Policy Modal */}
      <PolicyModal
        isOpen={isPolicyOpen}
        onClose={() => setIsPolicyOpen(false)}
        slug="rescheduling-policy"
        title="Rescheduling Policy"
        showActions={false}
      />
    </div>,
    document.body
  );
}
