import React, { useState, useEffect } from 'react';
import { 
  Check, CalendarBlank, Clock, User, VideoCamera, 
  EnvelopeSimple, House, Quotes, ChatCenteredText, BookOpen, ArrowLeft
} from '@phosphor-icons/react';
import { Link, useNavigate } from 'react-router-dom';
import bookingBg from '../../assets/images/booking_bg_lamp.png';
import defaultHeroImg from '../../assets/hero.webp';
import LoginModal from '../layout/LoginModal';
import PolicyModal from '../ui/PolicyModal';
import { generateGoogleCalendarLink } from '../../utils/calendar';

export default function BookingSuccess({ data, fee, settings = {}, generalSettings = {} }) {
  const navigate = useNavigate();
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isPolicyModalOpen, setIsPolicyModalOpen] = useState(false);
  const isAuthenticated = !!localStorage.getItem('token');

  const nextStepIcons = [EnvelopeSimple, CalendarBlank, VideoCamera, User];

  useEffect(() => {
    if (!isAuthenticated && data.appointmentId) {
      setIsLoginModalOpen(true);
    }
  }, [isAuthenticated, data.appointmentId]);

  const handleRegistrationSuccess = async (userData) => {
    try {
      const token = localStorage.getItem('token');
      if (token && data.appointmentId) {
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
      // Still navigate since registration succeeded
      navigate('/my-journey');
    }
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
        {/* Soft edge washes to blend seamlessly with theme while keeping lamp crystal clear */}
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
            {settings.badgeTag || 'YOUR SESSION IS RESERVED'}
          </span>
          <h1 className="font-serif text-3xl sm:text-4xl md:text-5xl font-normal tracking-tight leading-[1.15] text-[#111010] mb-3 sm:mb-4 max-w-2xl mx-auto">
            {settings.titleLine1 || 'Thank you for trusting me'}<br/>{settings.titleLine2 || 'with a part of your story.'}
          </h1>
          <p className="text-[#555047] text-sm md:text-base font-light leading-relaxed max-w-lg mx-auto">
            {settings.subtitleLine1 || "I've sent a confirmation email with everything you'll need."}
            {settings.subtitleLine2 && (
              <>
                <br className="hidden md:block" />
                {settings.subtitleLine2}
              </>
            )}
            {settings.subtitleHighlight && (
              <span className="italic text-[#c9542f] mt-1 block font-serif">{settings.subtitleHighlight}</span>
            )}
          </p>
        </div>

        {/* Appointment Card - Centered, Image Removed */}
        <div className="max-w-2xl mx-auto bg-white/95 backdrop-blur-sm border border-black/10 rounded-2xl md:rounded-3xl p-6 sm:p-8 md:p-9 mb-10 shadow-[0_20px_50px_rgba(0,0,0,0.08)]">
          
          <div className="flex items-start gap-3.5 sm:gap-4 mb-6 pb-6 border-b border-black/10">
            <div className="w-12 h-12 rounded-2xl bg-[#fbf0eb] border border-[#e8c4e2] flex items-center justify-center text-[#c9542f] shrink-0 shadow-xs">
              <CalendarBlank className="text-2xl" weight="light" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-sans text-[0.62rem] uppercase tracking-[0.2em] font-bold text-[#c9542f] mb-1">
                {settings.appointmentCardBadge || 'YOUR APPOINTMENT'}
              </p>
              <h3 className="text-[#111010] text-xl sm:text-2xl font-serif font-medium leading-snug">
                {data.date || 'Friday, October 4, 2024'}
              </h3>
              <p className="text-[#555047] text-sm font-normal mt-1">
                {data.time ? (
                  (() => {
                    const match = data.time.match(/(\d+):(\d+)\s(AM|PM)/);
                    if (!match) return `${data.time}`;
                    
                    let [_, hours, minutes, ampm] = match;
                    hours = parseInt(hours, 10);
                    minutes = parseInt(minutes, 10);
                    
                    if (ampm === 'PM' && hours !== 12) hours += 12;
                    if (ampm === 'AM' && hours === 12) hours = 0;
                    
                    const duration = data.sessionDuration || 60;
                    minutes += duration;
                    hours += Math.floor(minutes / 60);
                    minutes = minutes % 60;
                    
                    const endAmpm = (hours >= 12 && hours < 24) ? 'PM' : 'AM';
                    let endHours = hours % 12;
                    if (endHours === 0) endHours = 12;
                    
                    const endTime = `${endHours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')} ${endAmpm}`;
                    return `${data.time} – ${endTime} IST`;
                  })()
                ) : '10:30 AM – 11:30 AM IST'}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
            <div className="flex items-start gap-3.5 p-3.5 rounded-xl bg-[#faf8f5] border border-black/5">
              <div className="w-9 h-9 rounded-xl bg-white border border-black/5 flex items-center justify-center text-[#c9542f] shrink-0 shadow-xs">
                <User className="text-lg" weight="light" />
              </div>
              <div>
                <p className="font-sans text-[0.62rem] uppercase tracking-wider text-[#7a756b] font-bold mb-0.5">Session Type</p>
                <p className="text-[#111010] text-sm font-semibold">
                  {data.sessionDuration === 90 || data.isFirstSession === false
                    ? '1-on-1 Follow-up Coaching Session'
                    : '1-on-1 First Coaching Session'}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3.5 p-3.5 rounded-xl bg-[#faf8f5] border border-black/5">
              <div className="w-9 h-9 rounded-xl bg-white border border-black/5 flex items-center justify-center text-[#c9542f] shrink-0 shadow-xs">
                <Clock className="text-lg" weight="light" />
              </div>
              <div>
                <p className="font-sans text-[0.62rem] uppercase tracking-wider text-[#7a756b] font-bold mb-0.5">Duration</p>
                <p className="text-[#111010] text-sm font-semibold">
                  {data.sessionDuration || (data.isFirstSession === false ? 90 : 60)} minutes
                </p>
              </div>
            </div>

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
                ) : (
                  <p className="text-[#111010] text-sm font-bold">₹{(data.paidAmount ?? fee ?? 5000).toLocaleString('en-IN')}</p>
                )}
              </div>
            </div>

            <div className="flex items-start gap-3.5 p-3.5 rounded-xl bg-[#faf8f5] border border-black/5">
              <div className="w-9 h-9 rounded-xl bg-white border border-black/5 flex items-center justify-center text-[#c9542f] shrink-0 shadow-xs">
                <VideoCamera className="text-lg" weight="light" />
              </div>
              <div>
                <p className="font-sans text-[0.62rem] uppercase tracking-wider text-[#7a756b] font-bold mb-0.5">Where</p>
                <p className="text-[#111010] text-sm font-semibold">{settings.whereValue || 'Google Meet'}</p>
                <p className="text-[#7a756b] text-xs font-normal">{settings.whereNote || '(Link shared in confirmation email)'}</p>
              </div>
            </div>
          </div>

        </div>

        {/* What Happens Next Grid */}
        <h3 className="font-sans text-[0.68rem] uppercase tracking-[0.25em] font-bold text-[#c9542f] text-center mb-6 mt-12">
          {settings.whatHappensNextHeading || 'WHAT HAPPENS NEXT'}
        </h3>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-12">
          {(settings.nextSteps && settings.nextSteps.length > 0 ? settings.nextSteps : [
            { title: "CONFIRMATION EMAIL", description: "You'll receive a confirmation email with all the details and next steps." },
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
          {/* Add to Google Calendar */}
          <a 
            href={generateGoogleCalendarLink(data.date, data.time, data.sessionDuration || 60)}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-3 px-8 py-4 rounded-xl border border-black/15 font-sans text-xs sm:text-sm font-semibold tracking-wider uppercase text-[#111010] hover:bg-black/5 transition-all w-full sm:w-auto text-center cursor-pointer shadow-xs"
          >
            <CalendarBlank className="text-lg text-[#c9542f]" />
            {settings.addToCalendarButtonText || 'ADD TO CALENDAR'}
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
            {settings.changeText || 'You can reschedule or cancel up to 48 hours before the session.'}
          </span>
          <button 
            type="button"
            onClick={() => setIsPolicyModalOpen(true)} 
            className="font-sans text-xs text-[#c9542f] font-semibold underline hover:text-[#111010] transition-colors mt-1 cursor-pointer"
          >
            {settings.changePolicyLinkText || 'View Rescheduling Policy →'}
          </button>
        </div>

      </div>

      <PolicyModal 
        isOpen={isPolicyModalOpen}
        onClose={() => setIsPolicyModalOpen(false)}
        slug="rescheduling-policy"
        title="Rescheduling Policy"
        showActions={false}
        theme="light"
      />

      <LoginModal 
        isOpen={isLoginModalOpen} 
        onClose={() => setIsLoginModalOpen(false)} 
        onSuccess={handleRegistrationSuccess}
        defaultMode="register"
        defaultFullName={data.name || ''}
        defaultEmail={data.email || ''}
        defaultCountryCode={data.countryCode || '+91'}
        defaultPhoneNumber={data.phoneNumber || ''}
        courseNotice={false}
      />
    </div>
  );
}
