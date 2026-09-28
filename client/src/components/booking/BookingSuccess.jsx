import React, { useState, useEffect } from 'react';
import { 
  Check, CalendarBlank, Clock, User, VideoCamera, 
  EnvelopeSimple, House, Quotes, ChatCenteredText, BookOpen, ArrowLeft
} from '@phosphor-icons/react';
import { Link, useNavigate } from 'react-router-dom';
import bookingBg from '../../assets/images/booking_bg_lamp.webp';
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
      
      {/* Background Image Layer with Warm Cream Gradients */}
      <div className="fixed inset-0 z-0 pointer-events-none opacity-25">
        <img 
          src={generalSettings?.bgImageUrl || bookingBg} 
          alt="Desk lamp" 
          className="w-full h-full object-cover object-left mix-blend-multiply"
          style={{ opacity: (generalSettings?.overlayOpacity ? (100 - generalSettings.overlayOpacity) / 100 : 0.4) }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-[#f5f1e8]/60 via-transparent to-[#f5f1e8]/90" />
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
          <div className="w-12 h-12 rounded-full border border-[#f0c8b8] bg-[#faede4] flex items-center justify-center mb-3 sm:mb-4 shadow-xs">
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

        {/* Appointment Card */}
        <div className="grid grid-cols-1 md:grid-cols-5 bg-white/90 border border-black/10 rounded-2xl md:rounded-3xl overflow-hidden mb-8 shadow-xl">
          
          <div className="p-6 md:p-8 md:col-span-2 flex flex-col justify-center">
            <div className="flex items-start gap-3 mb-5">
              <CalendarBlank className="text-[#c9542f] text-3xl shrink-0" weight="light" />
              <div>
                <p className="font-sans text-[0.6rem] uppercase tracking-[0.2em] font-bold text-[#c9542f] mb-1">
                  {settings.appointmentCardBadge || 'YOUR APPOINTMENT'}
                </p>
                <div className="flex flex-col">
                <span className="text-[#111010] text-lg font-medium">{data.date || 'Friday, October 4, 2024'}</span>
                <p className="text-[#555047] text-sm font-normal mt-0.5">
                  {data.time ? (
                    (() => {
                      const match = data.time.match(/(\d+):(\d+)\s(AM|PM)/);
                      if (!match) return `${data.time}`;
                      
                      let [_, hours, minutes, ampm] = match;
                      hours = parseInt(hours, 10);
                      minutes = parseInt(minutes, 10);
                      
                      // Convert to 24h for easier math
                      if (ampm === 'PM' && hours !== 12) hours += 12;
                      if (ampm === 'AM' && hours === 12) hours = 0;
                      
                      // Add duration
                      const duration = data.sessionDuration || 60;
                      minutes += duration;
                      hours += Math.floor(minutes / 60);
                      minutes = minutes % 60;
                      
                      // Convert back to 12h format
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
            </div>

            <div className="w-full h-[1px] bg-black/10 mb-5" />

            <div className="flex flex-col gap-4">
              <div className="flex items-start gap-4">
                <User className="text-[#c9542f] text-2xl shrink-0" weight="light" />
                <div>
                  <p className="font-sans text-[0.65rem] uppercase tracking-wider text-[#7a756b] font-bold mb-0.5">Session Type</p>
                  <p className="text-[#111010] text-sm font-medium">
                    {data.sessionDuration === 90 || data.isFirstSession === false
                      ? '1-on-1 Follow-up Coaching Session'
                      : '1-on-1 First Coaching Session'}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <Clock className="text-[#c9542f] text-2xl shrink-0" weight="light" />
                <div>
                  <p className="font-sans text-[0.65rem] uppercase tracking-wider text-[#7a756b] font-bold mb-0.5">Duration</p>
                  <p className="text-[#111010] text-sm font-medium">
                    {data.sessionDuration || (data.isFirstSession === false ? 90 : 60)} minutes
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-6 flex justify-center text-[#c9542f] text-2xl shrink-0 font-serif font-bold">₹</div>
                <div>
                  <p className="font-sans text-[0.65rem] uppercase tracking-wider text-[#7a756b] font-bold mb-0.5">Total Paid</p>
                  {data.isFreeSession ? (
                    <p className="text-[#c9542f] text-sm font-bold">
                      ₹0 <span className="text-[#7a756b] text-xs font-normal">(Course Bonus • {data.freeSessionsRemaining ?? 0} credits left)</span>
                    </p>
                  ) : (
                    <p className="text-[#111010] text-sm font-bold">₹{(data.paidAmount ?? fee ?? 5000).toLocaleString('en-IN')}</p>
                  )}
                </div>
              </div>

              <div className="flex items-start gap-4">
                <VideoCamera className="text-[#c9542f] text-2xl shrink-0" weight="light" />
                <div>
                  <p className="font-sans text-[0.65rem] uppercase tracking-wider text-[#7a756b] font-bold mb-0.5">Where</p>
                  <p className="text-[#111010] text-sm font-medium">{settings.whereValue || 'Google Meet'}</p>
                  <p className="text-[#7a756b] text-xs font-normal">{settings.whereNote || '(Link shared in confirmation email)'}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="relative h-64 md:h-auto md:col-span-3 overflow-hidden">
            <img 
              src={(!settings.cardImageUrl || settings.cardImageUrl.includes('images.unsplash.com/photo-1506794778202-cad84cf45f1d')) ? defaultHeroImg : settings.cardImageUrl} 
              alt="Peaceful coaching environment" 
              className="absolute inset-0 w-full h-full object-cover object-center scale-105"
            />
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
                <div className="w-12 h-12 rounded-full border border-[#f0c8b8] bg-[#faede4] flex items-center justify-center mb-4 text-[#c9542f] shadow-xs">
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
        <div className="relative border border-[#f0c8b8] bg-[#faede4] rounded-2xl md:rounded-3xl p-8 md:p-12 overflow-hidden flex items-center justify-center shadow-sm mb-12">
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
            {settings.changeText || 'You can reschedule or cancel up to 24 hours before the session.'}
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
