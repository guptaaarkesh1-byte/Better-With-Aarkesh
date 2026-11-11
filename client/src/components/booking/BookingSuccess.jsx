import React, { useState, useEffect } from 'react';
import { 
  Check, CalendarBlank, Clock, User, VideoCamera, 
  EnvelopeSimple, Quotes, ChatCenteredText, BookOpen, ArrowLeft,
  Package, Tag, CheckCircle
} from '@phosphor-icons/react';
import { Link, useNavigate } from 'react-router-dom';
import bookingBg from '../../assets/images/booking_bg_lamp.png';
import LoginModal from '../layout/LoginModal';
import PolicyModal from '../ui/PolicyModal';
import { generateGoogleCalendarLink } from '../../utils/calendar';

export default function BookingSuccess({ data = {}, fee, settings = {}, generalSettings = {} }) {
  const navigate = useNavigate();
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isPolicyModalOpen, setIsPolicyModalOpen] = useState(false);
  const isAuthenticated = !!localStorage.getItem('token');

  const nextStepIcons = [EnvelopeSimple, CalendarBlank, VideoCamera, User];

  useEffect(() => {
    if (!isAuthenticated && data?.appointmentId) {
      setIsLoginModalOpen(true);
    }
  }, [isAuthenticated, data?.appointmentId]);

  const handleRegistrationSuccess = async (userData) => {
    try {
      const token = localStorage.getItem('token');
      if (token && data?.appointmentId) {
        await fetch(`${import.meta.env.VITE_API_URL}/api/appointments/${data.appointmentId}/link`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        });
      }
      navigate('/my-journey');
    } catch (err) {
      console.error('Error linking appointment:', err);
      navigate('/my-journey');
    }
  };

  const isPackageCredit = Boolean(data.isPackageCredit || data.usePackageCredit);
  const isPackage = Boolean(data.isPackage && !isPackageCredit);
  const totalSessions = isPackage 
    ? (data.totalSessions || data.packageSlots?.length || 1) 
    : (isPackageCredit ? (data.totalSessionsInPackage || 1) : 1);
  const creditsRemaining = data.creditsRemaining ?? Math.max(0, totalSessions - 1);
  const duration = Number(data.sessionDuration) || 60;

  // All package slots
  const allSlots = Array.isArray(data.packageSlots) && data.packageSlots.length > 0 
    ? data.packageSlots 
    : (Array.isArray(data.appointments) ? data.appointments : []);

  const paidAmount = Number(data.paidAmount ?? fee ?? 0);
  const discountAmount = Number(data.discountAmount) || 0;
  const pricePerSession = Number(data.pricePerSession) || (totalSessions > 0 ? Math.round((paidAmount + discountAmount) / totalSessions) : paidAmount);
  const couponCode = data.couponCode || '';

  const formatSingleSessionTime = (timeStr, dur) => {
    if (!timeStr) return '10:30 AM – 11:30 AM IST';
    const match = timeStr.match(/(\d+):(\d+)\s*(AM|PM)/i);
    if (!match) return `${timeStr} IST`;
    
    let [_, hours, minutes, ampm] = match;
    hours = parseInt(hours, 10);
    minutes = parseInt(minutes, 10);
    
    if (ampm.toUpperCase() === 'PM' && hours !== 12) hours += 12;
    if (ampm.toUpperCase() === 'AM' && hours === 12) hours = 0;
    
    const d = dur || 60;
    minutes += d;
    hours += Math.floor(minutes / 60);
    minutes = minutes % 60;
    
    const endAmpm = (hours >= 12 && hours < 24) ? 'PM' : 'AM';
    let endHours = hours % 12;
    if (endHours === 0) endHours = 12;
    
    const endTime = `${endHours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')} ${endAmpm}`;
    return `${timeStr} – ${endTime} IST`;
  };

  return (
    <div className="min-h-screen bg-[#f5f1e8] text-[#111010] relative pt-28 md:pt-36 lg:pt-40 pb-12 sm:pb-16 px-3 sm:px-4 md:px-8 animate-in fade-in zoom-in-95 duration-1000">
      
      {/* Background Image Layer with Warm Lamp Atmosphere */}
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
        <img 
          src={generalSettings?.bgImageUrl || bookingBg} 
          alt="Warm desk lamp coaching atmosphere" 
          className="w-full h-full object-cover object-left md:object-left-top opacity-85 transition-opacity duration-700"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[#f5f1e8]/20 to-[#f5f1e8]/70" />
        <div className="absolute inset-0 bg-gradient-to-b from-[#f5f1e8]/30 via-transparent to-[#f5f1e8]/60" />
      </div>

      <div className="relative z-10 max-w-5xl mx-auto">
        
        {/* Top Left Back Button */}
        <div className="flex w-full mb-6 sm:mb-8">
          <Link 
            to="/" 
            className="flex items-center gap-2 font-sans text-[0.68rem] uppercase tracking-widest text-[#7a756b] hover:text-[#c9542f] transition-colors font-semibold"
          >
            <ArrowLeft className="text-base" />
            {settings.backButtonText || 'RETURN TO HOME'}
          </Link>
        </div>

        {/* Header section */}
        <div className="text-center mb-6 sm:mb-8 flex flex-col items-center justify-center">
          <div className="w-12 h-12 rounded-full border border-[#e8c4e2] bg-[#fbf0eb] flex items-center justify-center mb-3 sm:mb-4 shadow-xs">
            <Check className="text-[#c9542f] text-xl" weight="bold" />
          </div>
          <span className="font-sans text-[0.65rem] uppercase tracking-[0.25em] font-bold text-[#c9542f] block mb-2 sm:mb-3">
            {isPackageCredit
              ? `SESSION ${data.sessionNumber || ''} OF ${totalSessions} RESERVED (PACKAGE CREDIT)`
              : isPackage 
                ? 'YOUR COACHING PACKAGE IS CONFIRMED' 
                : (settings.badgeTag || 'YOUR SESSION IS RESERVED')}
          </span>
          <h1 className="font-serif text-3xl sm:text-4xl md:text-5xl font-normal tracking-tight leading-[1.15] text-[#111010] mb-3 sm:mb-4 max-w-2xl mx-auto">
            {settings.titleLine1 || 'Thank you for trusting me'}<br/>{settings.titleLine2 || 'with a part of your story.'}
          </h1>
          <p className="text-[#555047] text-sm md:text-base font-light leading-relaxed max-w-lg mx-auto">
            {isPackageCredit
              ? 'Your appointment is confirmed using your package credit. No additional agreement is needed as your package agreement is already in effect.'
              : (settings.subtitleLine1 || "Coach Aarkesh will review your intake details to prepare your personalized Coaching Agreement and email your official confirmation shortly.")}
            {settings.subtitleLine2 && !isPackageCredit && (
              <>
                <br className="hidden md:block" />
                {settings.subtitleLine2}
              </>
            )}
            {settings.subtitleHighlight && !isPackageCredit && (
              <span className="italic text-[#c9542f] mt-1 block font-serif">{settings.subtitleHighlight}</span>
            )}
          </p>
        </div>

        {/* Appointment / Package Card */}
        <div className="max-w-2xl mx-auto bg-white/95 backdrop-blur-sm border border-black/10 rounded-2xl md:rounded-3xl p-6 sm:p-8 md:p-9 mb-10 shadow-[0_20px_50px_rgba(0,0,0,0.08)]">
          
          <div className="flex items-start gap-3.5 sm:gap-4 mb-6 pb-6 border-b border-black/10">
            <div className="w-12 h-12 rounded-2xl bg-[#fbf0eb] border border-[#e8c4e2] flex items-center justify-center text-[#c9542f] shrink-0 shadow-xs">
              {isPackage ? <Package className="text-2xl" weight="bold" /> : <CalendarBlank className="text-2xl" weight="light" />}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-sans text-[0.62rem] uppercase tracking-[0.2em] font-bold text-[#c9542f] mb-1">
                {isPackageCredit
                  ? 'PACKAGE CREDIT SESSION'
                  : isPackage 
                    ? 'COACHING PACKAGE CONFIRMED' 
                    : (settings.appointmentCardBadge || 'YOUR APPOINTMENT')}
              </p>
              <h3 className="text-[#111010] text-xl sm:text-2xl font-serif font-medium leading-snug">
                {isPackage 
                  ? `${totalSessions}-Session Coaching Package` 
                  : (data.date || 'Friday, October 4, 2024')}
              </h3>
              <p className="text-[#555047] text-sm font-normal mt-1">
                {isPackage 
                  ? `Session 1 scheduled · ${creditsRemaining} session${creditsRemaining > 1 ? 's' : ''} credited to your account`
                  : formatSingleSessionTime(data.time, data.sessionDuration)}
              </p>
            </div>
          </div>

          {/* 4 Overview Grid Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
            {/* Session Type */}
            <div className="flex items-start gap-3.5 p-3.5 rounded-xl bg-[#faf8f5] border border-black/5">
              <div className="w-9 h-9 rounded-xl bg-white border border-black/5 flex items-center justify-center text-[#c9542f] shrink-0 shadow-xs">
                {isPackage ? <Package className="text-lg" weight="bold" /> : <User className="text-lg" weight="light" />}
              </div>
              <div>
                <p className="font-sans text-[0.62rem] uppercase tracking-wider text-[#7a756b] font-bold mb-0.5">Session Type</p>
                <p className="text-[#111010] text-sm font-semibold">
                  {isPackageCredit
                    ? `Session ${data.sessionNumber || ''} of ${totalSessions} (Package Credit)`
                    : isPackage 
                      ? `${totalSessions}-Session Coaching Package` 
                      : (data.sessionDuration === 90 || data.isFirstSession === false
                          ? '1-on-1 Follow-up Coaching Session'
                          : '1-on-1 First Coaching Session')}
                </p>
                {isPackageCredit ? (
                  <p className="text-[#2e7d32] text-xs font-semibold">Prepaid Package Credit Applied • Agreement Active</p>
                ) : isPackage ? (
                  <p className="text-[#7a756b] text-xs font-normal">1-on-1 Personalized Coaching</p>
                ) : null}
              </div>
            </div>

            {/* Duration */}
            <div className="flex items-start gap-3.5 p-3.5 rounded-xl bg-[#faf8f5] border border-black/5">
              <div className="w-9 h-9 rounded-xl bg-white border border-black/5 flex items-center justify-center text-[#c9542f] shrink-0 shadow-xs">
                <Clock className="text-lg" weight="light" />
              </div>
              <div>
                <p className="font-sans text-[0.62rem] uppercase tracking-wider text-[#7a756b] font-bold mb-0.5">Duration</p>
                <p className="text-[#111010] text-sm font-semibold">
                  {duration} minutes {isPackage ? 'each' : ''}
                </p>
                {isPackage && (
                  <p className="text-[#7a756b] text-xs font-normal">
                    {totalSessions * duration} mins total coaching
                  </p>
                )}
              </div>
            </div>

            {/* Total Paid */}
            <div className="flex items-start gap-3.5 p-3.5 rounded-xl bg-[#faf8f5] border border-black/5">
              <div className="w-9 h-9 rounded-xl bg-white border border-black/5 flex items-center justify-center text-[#c9542f] shrink-0 shadow-xs font-serif font-bold text-base">
                ₹
              </div>
              <div>
                <p className="font-sans text-[0.62rem] uppercase tracking-wider text-[#7a756b] font-bold mb-0.5">Total Paid</p>
                {data.isFreeSession ? (
                  <p className="text-[#c9542f] text-sm font-bold">
                    ₹0 <span className="text-[#7a756b] text-xs font-normal">(Course Bonus • {data.freeSessionsRemaining ?? 0} credits left)</span>
                  </p>
                ) : isPackageCredit ? (
                  <>
                    <p className="text-[#2e7d32] text-sm font-bold">₹0</p>
                    <p className="text-emerald-700 text-xs font-medium flex items-center gap-1 mt-0.5">
                      <CheckCircle size={11} weight="fill" /> Prepaid Package Credit ({creditsRemaining} remaining)
                    </p>
                  </>
                ) : (
                  <>
                    <p className="text-[#111010] text-sm font-bold">₹{paidAmount.toLocaleString('en-IN')}</p>
                    <p className="text-emerald-700 text-xs font-medium flex items-center gap-1 mt-0.5">
                      <CheckCircle size={11} weight="fill" /> Paid in full via Razorpay
                    </p>
                  </>
                )}
              </div>
            </div>

            {/* Where */}
            <div className="flex items-start gap-3.5 p-3.5 rounded-xl bg-[#faf8f5] border border-black/5">
              <div className="w-9 h-9 rounded-xl bg-white border border-black/5 flex items-center justify-center text-[#c9542f] shrink-0 shadow-xs">
                <VideoCamera className="text-lg" weight="light" />
              </div>
              <div>
                <p className="font-sans text-[0.62rem] uppercase tracking-wider text-[#7a756b] font-bold mb-0.5">Where</p>
                <p className="text-[#111010] text-sm font-semibold">{settings.whereValue || 'Google Meet'}</p>
                <p className="text-[#7a756b] text-xs font-normal">
                  {isPackage ? 'Coaching agreement & meeting details will be shared with you shortly' : (settings.whereNote || '(Link shared in confirmation email)')}
                </p>
              </div>
            </div>
          </div>

          {/* PACKAGE SCHEDULE: Session 1 Scheduled + Remaining Credits Banner */}
          {isPackage && allSlots.length > 0 && (
            <div className="mt-6 pt-6 border-t border-black/10">
              <div className="flex items-center justify-between mb-3.5">
                <h4 className="font-sans text-[0.68rem] uppercase tracking-[0.18em] font-bold text-[#c9542f]">
                  PACKAGE SCHEDULE ({totalSessions} SESSIONS)
                </h4>
                <span className="font-sans text-[0.65rem] text-[#7a756b] font-semibold">
                  {duration} Mins Each
                </span>
              </div>

              {/* Notice callout */}
              <div className="mb-4 p-3.5 rounded-xl bg-[#fff8f3] border border-[#f3d2c1] text-xs text-[#555047] flex items-start gap-2.5">
                <Clock size={16} className="text-[#c9542f] shrink-0 mt-0.5" weight="bold" />
                <div className="leading-relaxed">
                  <strong className="text-[#1c1714]">Next Step:</strong> Coach Aarkesh will review your intake details to prepare your personalized Coaching Agreement for your entire package. Your official <strong>Coaching Agreement</strong> and <strong>Google Meet meeting details</strong> will be shared with you via email shortly.
                </div>
              </div>

              <div className="flex flex-col gap-3">
                {allSlots.slice(0, 1).map((slot, idx) => (
                  <div 
                    key={idx}
                    className="p-3.5 sm:p-4 rounded-xl bg-[#faf8f5] border border-[#c9542f]/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4 transition-all shadow-2xs"
                  >
                    <div className="flex items-start sm:items-center gap-3 min-w-0">
                      <span className="w-7 h-7 rounded-full bg-[#c9542f] text-white flex items-center justify-center font-bold text-xs shrink-0 mt-0.5 sm:mt-0 shadow-2xs">
                        1
                      </span>
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="font-serif font-medium text-sm sm:text-base text-[#111010]">
                            {slot.date}
                          </p>
                          <span className="text-[0.62rem] uppercase tracking-wider bg-[#fbf0eb] text-[#c9542f] font-bold px-2 py-0.5 rounded border border-[#e8c4e2]">
                            Session 1 (Scheduled)
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-[#7a756b] mt-0.5">
                          <Clock size={13} className="text-[#c9542f]" />
                          <span className="font-medium text-[#111010]">{slot.time} IST</span>
                          <span>•</span>
                          <span>{duration} minutes</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 w-full sm:w-auto justify-end pt-2 sm:pt-0 border-t sm:border-t-0 border-black/5">
                      <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-black/8 text-[0.72rem] text-[#7a756b] font-medium shadow-2xs">
                        <VideoCamera size={13} className="text-[#c9542f]" weight="light" />
                        <span>Link shared with Agreement</span>
                      </span>
                    </div>
                  </div>
                ))}

                {/* Remaining Sessions Credited Card */}
                {creditsRemaining > 0 && (
                  <div className="p-4 rounded-xl bg-[#fbf0eb] border border-[#e8c4e2] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                    <div className="flex items-start gap-2.5">
                      <div className="w-7 h-7 rounded-full bg-[#111010] text-white flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                        ✨
                      </div>
                      <div>
                        <p className="font-sans text-[0.68rem] uppercase tracking-wider font-bold text-[#c9542f]">
                          {creditsRemaining} Session{creditsRemaining > 1 ? 's' : ''} Remaining in Your Package
                        </p>
                        <p className="text-xs text-[#555047] mt-0.5 leading-relaxed">
                          Your remaining <strong>{creditsRemaining} session{creditsRemaining > 1 ? 's' : ''}</strong> are credited to your account. You can schedule them anytime from your dashboard with ₹0 extra payment.
                        </p>
                      </div>
                    </div>
                    <Link
                      to="/my-journey"
                      className="px-4 py-2 rounded-xl bg-[#111010] hover:bg-[#c9542f] text-white text-xs font-bold uppercase tracking-wider transition-all whitespace-nowrap shrink-0 shadow-xs"
                    >
                      View in My Journey →
                    </Link>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Detailed Receipt Breakdown */}
          {isPackage && (
            <div className="mt-6 pt-5 border-t border-black/10">
              <div className="p-4 rounded-xl bg-[#faf8f5] border border-black/8 flex flex-col gap-2">
                <div className="flex items-center justify-between text-xs text-[#7a756b]">
                  <span>Package Rate ({totalSessions} Sessions × ₹{pricePerSession.toLocaleString('en-IN')})</span>
                  <span className="font-medium text-[#111010]">₹{(pricePerSession * totalSessions).toLocaleString('en-IN')}</span>
                </div>

                {discountAmount > 0 && (
                  <div className="flex items-center justify-between text-xs text-emerald-700 font-medium">
                    <span className="flex items-center gap-1">
                      <Tag size={13} weight="bold" />
                      Coupon Discount {couponCode ? `(${couponCode})` : ''}
                    </span>
                    <span>-₹{discountAmount.toLocaleString('en-IN')}</span>
                  </div>
                )}

                <div className="pt-2 border-t border-black/8 flex items-center justify-between text-sm sm:text-base font-bold text-[#111010]">
                  <span>Total Amount Paid</span>
                  <span className="text-[#c9542f] text-base sm:text-lg">
                    ₹{paidAmount.toLocaleString('en-IN')}
                  </span>
                </div>

                {(data.paymentId || data.orderId) && (
                  <div className="pt-2 border-t border-black/5 flex flex-wrap items-center justify-between gap-2 text-[0.68rem] text-[#7a756b]">
                    {data.paymentId && <span>Payment ID: <code className="text-[#111010] font-mono">{data.paymentId}</code></span>}
                    <span className="text-emerald-700 font-semibold flex items-center gap-1">
                      <CheckCircle size={12} weight="fill" /> Paid in full via Razorpay
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}

        </div>

        {/* What Happens Next Grid */}
        <h3 className="font-sans text-[0.68rem] uppercase tracking-[0.25em] font-bold text-[#c9542f] text-center mb-6 mt-12">
          {settings.whatHappensNextHeading || 'WHAT HAPPENS NEXT'}
        </h3>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-12">
          {(settings.nextSteps && settings.nextSteps.length > 0 ? settings.nextSteps : [
            { title: "AGREEMENT & CONFIRMATION", description: "Coach Aarkesh will personally review your booking and email your official confirmation with your Coaching Agreement attached." },
            { title: "CALENDAR INVITE", description: "A calendar invite has been sent. Add it to your calendar." },
            { title: "MEETING LINK", description: "Your Google Meet link is included in the email. Check your spam folder if you don't see it." },
            { title: "BE YOURSELF", description: "This is a space for honesty, clarity, and real conversations. You don't have to have it all figured out." }
          ]).map((card, idx) => {
            const IconComp = nextStepIcons[idx % nextStepIcons.length] || EnvelopeSimple;
            return (
              <div key={idx} className="bg-white/90 border border-black/10 rounded-2xl p-6 text-center flex flex-col items-center shadow-xs">
                <div className="w-12 h-12 rounded-full border border-[#e8c4e2] bg-[#fbf0eb] flex items-center justify-center mb-4 text-[#c9542f] shadow-xs">
                  <IconComp size={24} weight="light" />
                </div>
                <h4 className="text-[#111010] text-sm font-bold tracking-wider uppercase mb-2">{card.title}</h4>
                <p className="text-[#555047] text-xs font-light leading-relaxed">{card.description}</p>
              </div>
            );
          })}
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12">
          {/* Add to Google Calendar (Single session or first session of package) */}
          <a 
            href={generateGoogleCalendarLink(
              isPackage && allSlots.length > 0 ? allSlots[0].date : data.date, 
              isPackage && allSlots.length > 0 ? allSlots[0].time : data.time, 
              duration
            )}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-3 px-8 py-4 rounded-xl border border-black/15 font-sans text-xs sm:text-sm font-semibold tracking-wider uppercase text-[#111010] hover:bg-black/5 transition-all w-full sm:w-auto text-center cursor-pointer shadow-xs"
          >
            <CalendarBlank className="text-lg text-[#c9542f]" />
            {isPackage ? 'ADD SESSION 1 TO CALENDAR' : (settings.addToCalendarButtonText || 'ADD TO CALENDAR')}
          </a>
          
          {isAuthenticated ? (
            <>
              <Link to="/my-journey" className="flex items-center justify-center gap-3 px-8 py-4 rounded-xl bg-[#c9542f] text-white font-sans text-xs sm:text-sm font-bold tracking-wider uppercase hover:bg-[#111010] transition-all w-full sm:w-auto shadow-md">
                {settings.myJourneyButtonText || 'MY JOURNEY'}
                <User className="text-lg" />
              </Link>

              <Link to="/library" className="flex items-center justify-center gap-3 px-8 py-4 rounded-xl border border-black/15 font-sans text-xs sm:text-sm font-semibold tracking-wider uppercase text-[#111010] hover:bg-black/5 transition-all w-full sm:w-auto shadow-xs">
                <BookOpen className="text-lg text-[#c9542f]" />
                {settings.exploreLibraryButtonText || 'EXPLORE LIBRARY'}
              </Link>
            </>
          ) : (
            <button onClick={() => setIsLoginModalOpen(true)} className="flex items-center justify-center gap-3 px-8 py-4 rounded-xl bg-[#c9542f] text-white font-sans text-xs sm:text-sm font-bold tracking-wider uppercase hover:bg-[#111010] transition-all w-full sm:w-auto shadow-md cursor-pointer">
              {settings.createAccountButtonText || 'CREATE ACCOUNT TO VIEW JOURNEY'}
              <User className="text-lg" />
            </button>
          )}
        </div>

        {/* Quote Banner */}
        <div className="relative border border-[#e8c4e2] bg-[#fbf0eb] rounded-2xl md:rounded-3xl p-8 md:p-12 overflow-hidden flex items-center justify-center shadow-sm mb-12">
          <Quotes className="text-[#c9542f]/15 text-8xl absolute left-8 top-8" weight="fill" />
          <div className="relative z-10 text-center">
            <p className="text-[#111010] text-xl md:text-2xl font-serif font-light mb-2">
              {settings.quoteLine1 || "Clarity doesn't come from having all the answers."}
            </p>
            <p className="text-[#c9542f] text-xl md:text-2xl font-serif italic">
              {settings.quoteLine2 || "It comes from asking better questions."}
            </p>
          </div>
        </div>

        {/* Footer Note */}
        <div className="flex flex-col items-center justify-center gap-2 text-center">
          <div className="flex items-center gap-2">
            <ChatCenteredText className="text-[#c9542f] text-lg" />
            <span className="font-sans text-xs uppercase tracking-[0.2em] font-bold text-[#c9542f]">
              {settings.changeHeading || 'NEED TO MAKE A CHANGE?'}
            </span>
          </div>
          <span className="font-sans text-xs text-[#555047]">
            {settings.changeNote || 'You can reschedule or cancel with 48 hours notice via your confirmation email.'}
          </span>
        </div>

      </div>

      <LoginModal 
        isOpen={isLoginModalOpen} 
        onClose={() => setIsLoginModalOpen(false)}
        onSuccess={handleRegistrationSuccess}
        defaultEmail={data.email}
        defaultFullName={data.name}
        defaultPhoneNumber={data.phoneNumber}
        title="Create Your Account"
        subtitle="Set up your account to access your coaching materials, session notes, and manage your appointments."
      />

      <PolicyModal 
        isOpen={isPolicyModalOpen}
        onClose={() => setIsPolicyModalOpen(false)}
        type="rescheduling"
      />
    </div>
  );
}
