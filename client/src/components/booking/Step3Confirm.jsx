import React, { useState } from 'react';
import { CheckCircle, Sparkle, WarningCircle, CalendarBlank } from '@phosphor-icons/react';
import PolicyModal from '../ui/PolicyModal';

export default function Step3Confirm({ 
  data, 
  fee, 
  onNext, 
  onBack, 
  onChangeTime,
  isLoading, 
  error, 
  freeSessionInfo, 
  packageCreditInfo = null,
  onApplyPackageCredit = null,
  settings = {} 
}) {
  const [agreed, setAgreed] = useState(false);
  const [activeModal, setActiveModal] = useState(null);

  // Coupon state
  const [couponInput, setCouponInput] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [couponLoading, setCouponLoading] = useState(false);
  const [couponError, setCouponError] = useState('');
  const [couponSuccess, setCouponSuccess] = useState('');

  // Available credits analysis
  const isPackage = Boolean(!data.usePackageCredit && !data.isPackageCredit && data.isPackage && data.packageSlots && data.packageSlots.length > 0);
  const totalSessions = isPackage ? (data.totalSessions || data.packageSlots.length) : 1;
  const pricePerSession = fee;
  const packageSubtotal = pricePerSession * totalSessions;
  const effectiveBaseFee = isPackage ? packageSubtotal : fee;

  const hasPackageCredits = Boolean(packageCreditInfo?.hasCredits && packageCreditInfo.totalCredits > 0);
  const hasCourseCredits = Boolean(freeSessionInfo?.hasFreeSessions && freeSessionInfo.freeSessions > 0);
  const hasAnyCredits = !isPackage && (hasPackageCredits || hasCourseCredits);

  // Payment method state: 'package_credit' | 'course_free_credit' | 'pay_online'
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState(() => {
    if (isPackage) return 'pay_online';
    if (data.usePackageCredit || data.isPackageCredit) return 'package_credit';
    if (data.useFreeSession) return 'course_free_credit';
    // User requested priority: package credits first, then course credits, else pay online
    if (hasPackageCredits) return 'package_credit';
    if (hasCourseCredits) return 'course_free_credit';
    return 'pay_online';
  });

  const isUsingPackageCredit = !isPackage && selectedPaymentMethod === 'package_credit';
  const isUsingCourseCredit = !isPackage && selectedPaymentMethod === 'course_free_credit';
  const isUsingCredit = isUsingPackageCredit || isUsingCourseCredit;

  const handleApplyCoupon = async (e) => {
    if (e) e.preventDefault();
    const code = couponInput.trim().toUpperCase();
    if (!code) {
      setCouponError('Please enter a coupon code.');
      setCouponSuccess('');
      return;
    }

    setCouponLoading(true);
    setCouponError('');
    setCouponSuccess('');

    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/coupons/validate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code,
          type: 'session',
          amount: effectiveBaseFee
        })
      });

      const result = await res.json();
      if (!res.ok || !result.valid) {
        setCouponError(result.message || 'Invalid coupon code. Try AARKESH50 or BETTER20');
        setCouponSuccess('');
      } else {
        setAppliedCoupon(result);
        setCouponSuccess(result.message || `Coupon applied. You save ₹${(result.discountAmount || 0).toLocaleString('en-IN')}.`);
        setCouponError('');
      }
    } catch (err) {
      // Offline fallback: check known standard coupons
      const c = code.toUpperCase();
      if (c === 'AARKESH50' || c === 'CLAIM50' || c === 'SHERY50') {
        const discountAmount = Math.round(effectiveBaseFee * 0.5);
        setAppliedCoupon({ code: c, discountType: 'percentage', discountValue: 50, discountAmount, finalAmount: effectiveBaseFee - discountAmount });
        setCouponSuccess(`Coupon applied. You save ₹${discountAmount.toLocaleString('en-IN')}.`);
      } else if (c === 'BETTER20') {
        const discountAmount = Math.round(effectiveBaseFee * 0.2);
        setAppliedCoupon({ code: c, discountType: 'percentage', discountValue: 20, discountAmount, finalAmount: effectiveBaseFee - discountAmount });
        setCouponSuccess(`Coupon applied. You save ₹${discountAmount.toLocaleString('en-IN')}.`);
      } else if (c === 'WELCOME10') {
        const discountAmount = Math.round(effectiveBaseFee * 0.1);
        setAppliedCoupon({ code: c, discountType: 'percentage', discountValue: 10, discountAmount, finalAmount: effectiveBaseFee - discountAmount });
        setCouponSuccess(`Coupon applied. You save ₹${discountAmount.toLocaleString('en-IN')}.`);
      } else {
        setCouponError('That code isn’t valid. Please check and try again.');
      }
    } finally {
      setCouponLoading(false);
    }
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setCouponInput('');
    setCouponError('');
    setCouponSuccess('');
  };

  const finalFee = appliedCoupon ? appliedCoupon.finalAmount : effectiveBaseFee;
  const discountAmount = appliedCoupon ? appliedCoupon.discountAmount : 0;

  const formatTimeRange = (timeStr, duration = 60) => {
    if (!timeStr) return '7:00 PM – 8:30 PM';
    const match = timeStr.match(/(\d+):(\d+)\s*(AM|PM)/i);
    if (!match) return timeStr;
    
    let [_, hours, minutes, ampm] = match;
    let startHours = parseInt(hours, 10);
    let startMinutes = parseInt(minutes, 10);
    
    let totalMinutes = (startHours % 12) * 60 + startMinutes;
    if (ampm.toUpperCase() === 'PM') totalMinutes += 12 * 60;
    
    let endTotalMinutes = totalMinutes + (duration || 60);
    let endHours24 = Math.floor(endTotalMinutes / 60) % 24;
    let endMinutes = endTotalMinutes % 60;
    
    let endAmpm = endHours24 >= 12 ? 'PM' : 'AM';
    let endHours12 = endHours24 % 12;
    if (endHours12 === 0) endHours12 = 12;
    
    const formattedStartMinutes = startMinutes.toString().padStart(2, '0');
    const formattedEndMinutes = endMinutes.toString().padStart(2, '0');
    
    return `${startHours}:${formattedStartMinutes} ${ampm.toUpperCase()} – ${endHours12}:${formattedEndMinutes} ${endAmpm}`;
  };

  const sessionTitle = isUsingPackageCredit
    ? '1-on-1 Coaching Session (Package Credit)'
    : isUsingCourseCredit
      ? '1-on-1 Coaching Session (Course Benefit)'
      : isPackage
        ? `${totalSessions}-Session Coaching Package`
        : (data.sessionDuration === 90 || data.isFirstSession === false
            ? '1-on-1 Follow-up Coaching Session'
            : '1-on-1 First Coaching Session');

  const formattedDate = data.date || data.packageSlots?.[0]?.date || 'Wednesday, November 11, 2026';
  const durationMinutes = data.sessionDuration || (data.isFirstSession === false ? 90 : 60);
  const formattedTime = formatTimeRange(data.time || data.packageSlots?.[0]?.time, durationMinutes);

  return (
    <div className="w-full animate-in fade-in duration-500">
      
      {/* 2-Column Responsive Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-[1.15fr_1fr] gap-6 items-start">
        
        {/* LEFT COLUMN: Details + What happens next + Reschedule */}
        <div className="flex flex-col gap-5 sm:gap-6">
          
          {/* Card 1: SESSION DETAILS */}
          <section className="bg-white border border-[#e8e3dc] rounded-[20px] p-5 sm:p-6 shadow-[0_8px_30px_rgba(29,26,23,0.05)]">
            <p className="text-[11px] uppercase tracking-[0.14em] font-semibold text-[#c8512b] mb-3.5">
              {settings.sessionDetailsHeading || 'SESSION DETAILS'}
            </p>

            {/* Type Header Row with Pill */}
            <div className="flex items-center justify-between gap-3 flex-wrap mb-5 sm:mb-6">
              <b className="font-serif text-xl sm:text-[21px] font-medium text-[#1d1a17]">
                {sessionTitle}
              </b>
              {isPackage ? (
                <span className="text-xs font-semibold text-[#c8512b] bg-[#fbeee8] rounded-full px-3 py-1">
                  Session 1 of {totalSessions}
                </span>
              ) : isUsingPackageCredit ? (
                <span className="text-xs font-semibold text-[#2e7d32] bg-[#e8f5e9] border border-[#a5d6a7]/60 rounded-full px-3 py-1">
                  Package Credit
                </span>
              ) : isUsingCourseCredit ? (
                <span className="text-xs font-semibold text-[#16a34a] bg-[#f0fdf4] border border-[#bbf7d0] rounded-full px-3 py-1">
                  Course Benefit
                </span>
              ) : null}
            </div>

            {/* Facts Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              
              {/* Fact 1: Date (Wide) */}
              <div className="sm:col-span-2 bg-[#faf8f6] border border-[#e8e3dc] rounded-[14px] p-3.5 flex gap-3 items-start min-w-0">
                <div className="w-[34px] h-[34px] rounded-[10px] bg-white border border-[#e8e3dc] flex items-center justify-center shrink-0 text-base">
                  📅
                </div>
                <div className="min-w-0">
                  <small className="block text-[11px] uppercase tracking-[0.1em] font-semibold text-[#7b736a] leading-none mb-1">
                    {settings.dateLabel || 'Date'}
                  </small>
                  <b className="block font-semibold text-[15px] text-[#1d1a17] leading-tight break-words">
                    {formattedDate}
                  </b>
                </div>
              </div>

              {/* Fact 2: Time */}
              <div className="bg-[#faf8f6] border border-[#e8e3dc] rounded-[14px] p-3.5 flex gap-3 items-start min-w-0">
                <div className="w-[34px] h-[34px] rounded-[10px] bg-white border border-[#e8e3dc] flex items-center justify-center shrink-0 text-base">
                  🕖
                </div>
                <div className="min-w-0">
                  <small className="block text-[11px] uppercase tracking-[0.1em] font-semibold text-[#7b736a] leading-none mb-1">
                    {settings.timeLabel || 'Time'}
                  </small>
                  <b className="block font-semibold text-[14px] sm:text-[15px] text-[#1d1a17] leading-tight whitespace-nowrap">
                    {formattedTime}
                  </b>
                  <span className="block text-[13px] text-[#7b736a] leading-tight mt-0.5">IST</span>
                </div>
              </div>

              {/* Fact 3: Duration */}
              <div className="bg-[#faf8f6] border border-[#e8e3dc] rounded-[14px] p-3.5 flex gap-3 items-start min-w-0">
                <div className="w-[34px] h-[34px] rounded-[10px] bg-white border border-[#e8e3dc] flex items-center justify-center shrink-0 text-base">
                  ⏱
                </div>
                <div className="min-w-0">
                  <small className="block text-[11px] uppercase tracking-[0.1em] font-semibold text-[#7b736a] leading-none mb-1">
                    {settings.durationLabel || 'Duration'}
                  </small>
                  <b className="block font-semibold text-[14px] sm:text-[15px] text-[#1d1a17] leading-tight whitespace-nowrap">
                    {durationMinutes} minutes
                  </b>
                  {isPackage && <span className="block text-[13px] text-[#7b736a] leading-tight mt-0.5">per session</span>}
                </div>
              </div>

              {/* Fact 4: Where (Wide) */}
              <div className="sm:col-span-2 bg-[#faf8f6] border border-[#e8e3dc] rounded-[14px] p-3.5 flex gap-3 items-start min-w-0">
                <div className="w-[34px] h-[34px] rounded-[10px] bg-white border border-[#e8e3dc] flex items-center justify-center shrink-0 text-base">
                  🎥
                </div>
                <div className="min-w-0">
                  <small className="block text-[11px] uppercase tracking-[0.1em] font-semibold text-[#7b736a] leading-none mb-1">
                    {settings.whereLabel || 'Where'}
                  </small>
                  <b className="block font-semibold text-[15px] text-[#1d1a17] leading-tight">
                    {settings.whereValue || 'Google Meet'}
                  </b>
                  <span className="block text-[13px] text-[#7b736a] leading-tight mt-0.5">
                    {settings.whereNote || 'Link will be shared after booking'}
                  </span>
                </div>
              </div>

            </div>

            {/* Package Credits Explanatory Box */}
            {isPackage && (
              <div className="flex gap-3 mt-4 p-3.5 sm:p-4 rounded-[14px] bg-[#fbeee8] border border-[#f0d3c7] items-start">
                <span className="text-[#c8512b] shrink-0 text-base mt-0.5">✦</span>
                <div className="text-[13.5px] text-[#1d1a17] leading-relaxed">
                  <b className="block font-semibold mb-0.5">
                    Remaining {Math.max(0, totalSessions - 1)} sessions credited to your account
                  </b>
                  Only Session 1 is scheduled today. The other {Math.max(0, totalSessions - 1)} sessions are added to your account and can be booked anytime later, based on your availability, at no extra payment.
                </div>
              </div>
            )}

          </section>

          {/* Card 2: WHAT HAPPENS NEXT */}
          <section className="bg-white border border-[#e8e3dc] rounded-[20px] p-5 sm:p-6 shadow-[0_8px_30px_rgba(29,26,23,0.05)]">
            <p className="text-[11px] uppercase tracking-[0.14em] font-semibold text-[#c8512b] mb-3.5">
              {settings.whatHappensNextHeading || 'WHAT HAPPENS NEXT'}
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex gap-2.5 items-start">
                <span className="text-base shrink-0 mt-0.5">✉️</span>
                <div>
                  <b className="block text-sm font-semibold text-[#1d1a17]">Confirmation email</b>
                  <span className="text-[13px] text-[#7b736a]">With all the details and next steps.</span>
                </div>
              </div>
              <div className="flex gap-2.5 items-start">
                <span className="text-base shrink-0 mt-0.5">🗓</span>
                <div>
                  <b className="block text-sm font-semibold text-[#1d1a17]">A reminder before we meet</b>
                  <span className="text-[13px] text-[#7b736a]">So you can show up fully.</span>
                </div>
              </div>
              <div className="flex gap-2.5 items-start">
                <span className="text-base shrink-0 mt-0.5">🔒</span>
                <div>
                  <b className="block text-sm font-semibold text-[#1d1a17]">A private, confidential space</b>
                  <span className="text-[13px] text-[#7b736a]">Built for honest conversations.</span>
                </div>
              </div>
              <div className="flex gap-2.5 items-start">
                <span className="text-base shrink-0 mt-0.5">🌱</span>
                <div>
                  <b className="block text-sm font-semibold text-[#1d1a17]">This is your time</b>
                  <span className="text-[13px] text-[#7b736a]">To reflect, gain clarity, and move forward.</span>
                </div>
              </div>
            </div>
          </section>

          {/* Card 3: NEED TO RESCHEDULE? */}
          <section className="bg-[#faf8f6] border border-[#e8e3dc] rounded-[20px] p-5 sm:p-6 flex flex-col sm:flex-row gap-3 sm:items-center justify-between shadow-[0_8px_30px_rgba(29,26,23,0.05)]">
            <div>
              <b className="block text-sm font-semibold text-[#1d1a17] mb-0.5">
                {settings.rescheduleHeading || 'Need to reschedule?'}
              </b>
              <span className="text-[13px] text-[#7b736a]">
                {settings.rescheduleText || 'You can reschedule or cancel up to 48 hours before the session.'}
              </span>
            </div>
            <button 
              type="button"
              onClick={() => setActiveModal('rescheduling-policy')}
              className="text-[#c8512b] hover:text-[#1d1a17] font-semibold text-xs sm:text-sm underline whitespace-nowrap cursor-pointer transition-colors text-left sm:text-right"
            >
              {settings.reschedulePolicyLinkText || 'View rescheduling policy'}
            </button>
          </section>

        </div>

        {/* RIGHT COLUMN: Dedicated Sticky Checkout / Payment Card */}
        <aside className="lg:sticky lg:top-[150px] lg:self-start bg-white border border-[#e8e3dc] rounded-[20px] p-6 shadow-[0_8px_30px_rgba(29,26,23,0.05)] flex flex-col z-10">
          
          <p className="text-[11px] uppercase tracking-[0.14em] font-semibold text-[#c8512b] mb-4">
            {isPackage 
              ? 'PACKAGE PAYMENT' 
              : (isUsingCredit ? 'SESSION CONFIRMATION' : 'SESSION PAYMENT')}
          </p>

          {/* Total Amount Display */}
          <div className="flex flex-col">
            <small className="text-[11px] uppercase tracking-[0.14em] font-semibold text-[#7b736a] block mb-1">
              {settings.totalAmountLabel || 'TOTAL AMOUNT'}
            </small>
            <div className="font-serif font-semibold text-3xl sm:text-[40px] leading-[1.1] my-1 text-[#1d1a17] flex items-baseline flex-wrap">
              <span>
                {isUsingCredit ? '₹0' : `₹${finalFee.toLocaleString('en-IN')}`}
              </span>
              {appliedCoupon && discountAmount > 0 && !isUsingCredit ? (
                <s className="font-sans font-normal text-base sm:text-lg text-[#7b736a] ml-2">
                  ₹{packageSubtotal.toLocaleString('en-IN')}
                </s>
              ) : isUsingCredit ? (
                <s className="font-sans font-normal text-base sm:text-lg text-[#7b736a] ml-2">
                  ₹{fee.toLocaleString('en-IN')}
                </s>
              ) : null}
            </div>
            <div className="text-[13px] text-[#7b736a] mt-1">
              {isPackage ? (
                `${totalSessions} sessions · ₹${pricePerSession.toLocaleString('en-IN')} per session · Single payment`
              ) : isUsingPackageCredit ? (
                `Prepaid Package Credit · Zero Payment Today (${packageCreditInfo?.totalCredits || 0} Left)`
              ) : isUsingCourseCredit ? (
                `Course Complimentary Credit · Zero Payment Today (${freeSessionInfo?.freeSessions || 0} Left)`
              ) : (
                `1 session · ${durationMinutes} minutes · Single payment`
              )}
            </div>
          </div>

          <hr className="border-0 border-t border-[#e8e3dc] my-5 sm:my-6" />

          {/* Payment Method Selector (Directly on Step 3) */}
          {!isPackage && hasAnyCredits && (
            <div className="mb-5 sm:mb-6 flex flex-col gap-2.5">
              <div className="flex items-center justify-between">
                <small className="text-[11px] uppercase tracking-[0.14em] font-semibold text-[#7b736a] block">
                  CHOOSE PAYMENT METHOD
                </small>
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#2e7d32] bg-[#f0f9f1] border border-[#a5d6a7] px-2 py-0.5 rounded-full">
                  Credits Available
                </span>
              </div>

              {/* Option 1: Package Credit */}
              {hasPackageCredits && (
                <div
                  onClick={() => setSelectedPaymentMethod('package_credit')}
                  className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                    selectedPaymentMethod === 'package_credit'
                      ? 'bg-[#f0f9f1] border-[#2e7d32] ring-2 ring-[#2e7d32]/25 shadow-xs'
                      : 'bg-white border-[#e8e3dc] hover:border-[#2e7d32]/50'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 ${
                      selectedPaymentMethod === 'package_credit' ? 'border-[#2e7d32] bg-[#2e7d32]' : 'border-gray-300'
                    }`}>
                      {selectedPaymentMethod === 'package_credit' && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                    </div>
                    <div className="min-w-0">
                      <b className="block text-xs sm:text-[13px] font-semibold text-[#1d1a17] truncate">
                        🎟️ Use Package Session Credit
                      </b>
                      <span className="block text-[11px] sm:text-xs text-[#2e7d32] font-medium">
                        {packageCreditInfo.totalCredits} prepaid credit{packageCreditInfo.totalCredits > 1 ? 's' : ''} available
                      </span>
                    </div>
                  </div>
                  <span className="text-sm sm:text-base font-serif font-bold text-[#2e7d32] shrink-0">
                    ₹0
                  </span>
                </div>
              )}

              {/* Option 2: Course Free Session Credit */}
              {hasCourseCredits && (
                <div
                  onClick={() => setSelectedPaymentMethod('course_free_credit')}
                  className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                    selectedPaymentMethod === 'course_free_credit'
                      ? 'bg-[#f0fdf4] border-[#16a34a] ring-2 ring-[#16a34a]/25 shadow-xs'
                      : 'bg-white border-[#e8e3dc] hover:border-[#16a34a]/50'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 ${
                      selectedPaymentMethod === 'course_free_credit' ? 'border-[#16a34a] bg-[#16a34a]' : 'border-gray-300'
                    }`}>
                      {selectedPaymentMethod === 'course_free_credit' && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                    </div>
                    <div className="min-w-0">
                      <b className="block text-xs sm:text-[13px] font-semibold text-[#1d1a17] truncate">
                        🎓 Use Course Free Session Credit
                      </b>
                      <span className="block text-[11px] sm:text-xs text-[#16a34a] font-medium">
                        {freeSessionInfo.freeSessions} complimentary credit{freeSessionInfo.freeSessions > 1 ? 's' : ''} available
                      </span>
                    </div>
                  </div>
                  <span className="text-sm sm:text-base font-serif font-bold text-[#16a34a] shrink-0">
                    ₹0
                  </span>
                </div>
              )}

              {/* Option 3: Paid Method (Pay Online) */}
              <div
                onClick={() => setSelectedPaymentMethod('pay_online')}
                className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                  selectedPaymentMethod === 'pay_online'
                    ? 'bg-[#fef2f0] border-[#c8512b] ring-2 ring-[#c8512b]/25 shadow-xs'
                    : 'bg-white border-[#e8e3dc] hover:border-[#c8512b]/50'
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 ${
                    selectedPaymentMethod === 'pay_online' ? 'border-[#c8512b] bg-[#c8512b]' : 'border-gray-300'
                  }`}>
                    {selectedPaymentMethod === 'pay_online' && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                  </div>
                  <div className="min-w-0">
                    <b className="block text-xs sm:text-[13px] font-semibold text-[#1d1a17] truncate">
                      💳 Paid Method (Pay Online)
                    </b>
                    <span className="block text-[11px] sm:text-xs text-[#7b736a]">
                      UPI, Cards, NetBanking · Keep credits for later
                    </span>
                  </div>
                </div>
                <span className="text-sm sm:text-base font-serif font-bold text-[#c8512b] shrink-0">
                  ₹{finalFee.toLocaleString('en-IN')}
                </span>
              </div>
            </div>
          )}

          {/* Discount Lines (when coupon applied) */}
          {appliedCoupon && discountAmount > 0 && !isUsingCredit && (
            <>
              <div className="grid gap-2 text-sm text-[#1d1a17]">
                <div className="flex justify-between">
                  <span>Session total</span>
                  <span>₹{packageSubtotal.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between text-[#2e8a57] font-semibold">
                  <span>Coupon ({appliedCoupon.code})</span>
                  <span>− ₹{discountAmount.toLocaleString('en-IN')}</span>
                </div>
              </div>
              <hr className="border-0 border-t border-[#e8e3dc] my-5 sm:my-6" />
            </>
          )}

          {/* Coupon Code Section (Only when paying online) */}
          {!isUsingCredit && (
            <div>
              {!appliedCoupon ? (
                <>
                  <label htmlFor="coupon-code" className="block text-sm font-semibold text-[#1d1a17] mb-2">
                    Have a coupon code?
                  </label>
                  <form onSubmit={handleApplyCoupon} className="flex gap-2">
                    <input
                      id="coupon-code"
                      type="text"
                      value={couponInput}
                      onChange={(e) => {
                        setCouponInput(e.target.value.toUpperCase());
                        if (couponError) setCouponError('');
                      }}
                      placeholder="ENTER CODE"
                      autoComplete="off"
                      className="flex-1 min-w-0 font-sans text-xs uppercase tracking-[0.05em] border border-[#e8e3dc] rounded-xl px-3.5 py-3 bg-white text-[#1d1a17] placeholder:normal-case placeholder:text-[#999] focus:outline-2 focus:outline-[#c8512b] focus:outline-offset-2 transition-all"
                    />
                    <button
                      type="submit"
                      disabled={couponLoading || !couponInput.trim()}
                      className="font-sans font-semibold text-[13px] tracking-[0.08em] uppercase rounded-xl px-5 py-3 border border-[#e8e3dc] bg-white text-[#1d1a17] hover:border-[#c8512b] hover:text-[#c8512b] disabled:opacity-45 disabled:cursor-not-allowed transition-all cursor-pointer shrink-0"
                    >
                      {couponLoading ? '...' : 'APPLY'}
                    </button>
                  </form>
                  {couponError && (
                    <div className="text-[13px] text-[#b3261e] mt-1.5 min-h-[18px]">
                      {couponError}
                    </div>
                  )}
                  {couponSuccess && (
                    <div className="text-[13px] text-[#2e8a57] mt-1.5 min-h-[18px]">
                      {couponSuccess}
                    </div>
                  )}
                </>
              ) : (
                <div className="flex items-center justify-between p-2.5 rounded-xl bg-[#f0f9f1] border border-[#a5d6a7]/60 text-xs">
                  <div className="flex items-center gap-2">
                    <CheckCircle size={16} weight="fill" className="text-[#2e8a57]" />
                    <span className="font-mono font-bold text-[#2e8a57]">{appliedCoupon.code}</span>
                    <span className="text-[#2e8a57] font-sans font-medium text-[0.72rem]">
                      ({appliedCoupon.discountType === 'percentage' ? `${appliedCoupon.discountValue}% OFF` : `₹${appliedCoupon.discountValue} OFF`})
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={handleRemoveCoupon}
                    className="text-xs font-sans text-[#7b736a] hover:text-[#b3261e] underline cursor-pointer"
                  >
                    Remove
                  </button>
                </div>
              )}
              <hr className="border-0 border-t border-[#e8e3dc] my-5 sm:my-6" />
            </div>
          )}

          {/* Agreement Checkbox */}
          <label className="flex gap-2.5 items-start text-[13.5px] text-[#7b736a] cursor-pointer select-none leading-snug mb-5 sm:mb-6">
            <input 
              type="checkbox"
              checked={agreed}
              onChange={(e) => setAgreed(e.target.checked)}
              className="w-[18px] h-[18px] mt-0.5 rounded accent-[#c8512b] shrink-0 cursor-pointer"
            />
            <span>
              {settings.agreementPrefix || 'I agree to the'}{' '}
              <button 
                type="button" 
                className="text-[#c8512b] font-semibold hover:underline cursor-pointer inline" 
                onClick={(e) => { e.preventDefault(); e.stopPropagation(); setActiveModal('terms-and-conditions'); }}
              >
                {settings.agreementLinkText || 'terms and conditions'}
              </button>{' '}
              {settings.agreementSuffix || 'and understand that the amount above is the total payment shown in this summary.'}
            </span>
          </label>

          {/* Action CTA Buttons: Back + Pay */}
          <div className="grid grid-cols-[auto_1fr] gap-2.5">
            <button
              type="button"
              onClick={onBack}
              className="font-sans font-semibold text-[13px] tracking-[0.08em] uppercase rounded-xl px-4 sm:px-5 py-3.5 border border-[#e8e3dc] bg-white text-[#1d1a17] hover:bg-[#faf8f6] transition-all whitespace-nowrap cursor-pointer flex items-center justify-center shrink-0"
            >
              {settings.backButtonText || '← Back'}
            </button>
            
            <button
              type="button"
              onClick={() => onNext(appliedCoupon, selectedPaymentMethod)}
              disabled={!agreed || isLoading}
              className={`font-sans font-semibold text-xs sm:text-[13px] tracking-[0.08em] uppercase rounded-xl px-3 sm:px-4 py-3.5 border transition-all disabled:opacity-45 disabled:cursor-not-allowed cursor-pointer shadow-sm flex items-center justify-center text-center leading-snug ${
                isUsingPackageCredit
                  ? 'border-[#2e7d32] bg-[#2e7d32] hover:bg-[#256628] text-white'
                  : isUsingCourseCredit
                    ? 'border-[#16a34a] bg-[#16a34a] hover:bg-[#15803d] text-white'
                    : 'border-[#c8512b] bg-[#c8512b] hover:bg-[#b04523] text-white'
              }`}
            >
              {isLoading ? (
                'Processing...'
              ) : isUsingPackageCredit ? (
                'Confirm Session with Package Credit (₹0) 🔒'
              ) : isUsingCourseCredit ? (
                'Confirm Session with Course Credit (₹0) 🔒'
              ) : isPackage ? (
                <span>Pay ₹{finalFee.toLocaleString('en-IN')} &amp; secure package 🔒</span>
              ) : (
                <span>Pay ₹{finalFee.toLocaleString('en-IN')} &amp; confirm session 🔒</span>
              )}
            </button>
          </div>

          {error && (
            <div className="mt-3.5 p-3.5 rounded-xl bg-[#fff5f5] border border-[#f5c6cb] text-left animate-fadeIn shadow-2xs">
              <div className="flex items-start gap-2.5">
                <WarningCircle size={20} weight="fill" className="text-[#b3261e] shrink-0 mt-0.5" />
                <div className="flex-1 min-w-0">
                  <p className="font-sans text-xs font-semibold leading-relaxed text-[#b3261e]">
                    {error}
                  </p>
                  {(error.toLowerCase().includes('slot') || 
                    error.toLowerCase().includes('overlap') || 
                    error.toLowerCase().includes('booked') || 
                    error.toLowerCase().includes('available') || 
                    error.toLowerCase().includes('reserved') ||
                    error.toLowerCase().includes('hold') ||
                    error.toLowerCase().includes('chune')) && (
                    <button
                      type="button"
                      onClick={onChangeTime || onBack}
                      className="mt-2.5 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#b3261e] hover:bg-[#8e1c15] text-white text-[11px] font-bold uppercase tracking-wider transition-all cursor-pointer shadow-2xs"
                    >
                      <CalendarBlank size={14} weight="bold" />
                      <span>Choose another time in calendar</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Security Note */}
          <div className="text-center text-[#7b736a] text-[12.5px] mt-3">
            Secure payment · Your details stay private
          </div>

        </aside>

      </div>

      {/* Policy Modal */}
      <PolicyModal
        isOpen={!!activeModal}
        onClose={() => setActiveModal(null)}
        slug={activeModal}
        title={activeModal === 'terms-and-conditions' ? 'Terms & Conditions' : 'Rescheduling Policy'}
        showActions={activeModal === 'terms-and-conditions'}
        theme="light"
        onAgree={() => { setAgreed(true); setActiveModal(null); }}
        onDecline={() => { setAgreed(false); setActiveModal(null); }}
      />
    </div>
  );
}
