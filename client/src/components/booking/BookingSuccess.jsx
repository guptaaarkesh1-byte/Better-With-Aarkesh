import React, { useState, useEffect } from 'react';
import { 
  Check, CalendarBlank, Clock, User, VideoCamera, 
  EnvelopeSimple, House, Quotes, ChatCenteredText, BookOpen, ArrowLeft
} from '@phosphor-icons/react';
import { Link, useNavigate } from 'react-router-dom';
import bookingBg from '../../assets/images/booking_bg_lamp.webp';
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
    <div className="min-h-screen bg-[#0a0a0a] relative pt-28 md:pt-36 lg:pt-40 pb-12 sm:pb-16 px-3 sm:px-4 md:px-8 animate-in fade-in zoom-in-95 duration-1000">
      
      {/* Background Image Layer */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <img 
          src={generalSettings?.bgImageUrl || bookingBg} 
          alt="Desk lamp" 
          className="w-full h-full object-cover object-left"
          style={{ opacity: (generalSettings?.overlayOpacity ? (100 - generalSettings.overlayOpacity) / 100 : 0.6) }}
        />
        {/* Gradients to fade the image into black so text stays readable */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#0a0a0a]/40 via-[#0a0a0a]/80 to-[#0a0a0a]" />
        <div className="absolute inset-0 bg-gradient-to-b from-[#0a0a0a]/50 via-transparent to-[#0a0a0a]/90" />
      </div>

      <div className="relative z-10 max-w-5xl mx-auto">
        
        {/* Top Left Back Button */}
        <div className="flex w-full mb-6 sm:mb-8">
          <Link 
            to="/" 
            className="flex items-center gap-2 font-sans text-[0.65rem] uppercase tracking-widest text-white/60 hover:text-white hover:text-accent-gold transition-colors"
          >
            <ArrowLeft className="text-base" />
            {settings.backButtonText || 'RETURN TO HOME'}
          </Link>
        </div>

        {/* Header section */}
        <div className="text-center mb-6 sm:mb-8 flex flex-col items-center justify-center">
          <div className="w-10 h-10 rounded-full border border-accent-gold flex items-center justify-center mb-3 sm:mb-4">
            <Check className="text-accent-gold text-lg" weight="bold" />
          </div>
          <span className="font-sans text-[0.6rem] uppercase tracking-[0.3em] font-medium text-accent-gold block mb-2 sm:mb-3">
            {settings.badgeTag || 'YOUR SESSION IS RESERVED'}
          </span>
          <h1 className="font-serif text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-medium tracking-tight leading-[1.15] text-white mb-3 sm:mb-4 max-w-2xl mx-auto">
            {settings.titleLine1 || 'Thank you for trusting me'}<br/>{settings.titleLine2 || 'with a part of your story.'}
          </h1>
          <p className="text-paragraph text-xs md:text-sm font-light tracking-wide text-white/80 max-w-lg mx-auto">
            {settings.subtitleLine1 || "I've sent a confirmation email with everything you'll need."}
            {settings.subtitleLine2 && (
              <>
                <br className="hidden md:block" />
                {settings.subtitleLine2}
              </>
            )}
            {settings.subtitleHighlight && (
              <span className="italic text-accent-gold mt-1 block">{settings.subtitleHighlight}</span>
            )}
          </p>
        </div>

        {/* Appointment Card */}
        <div className="grid grid-cols-1 md:grid-cols-5 bg-[#0f0f0f] border border-white/5 rounded-2xl overflow-hidden mb-6 sm:mb-8 shadow-2xl">
          
          <div className="p-5 md:p-6 md:col-span-2 flex flex-col justify-center">
            <div className="flex items-start gap-3 mb-5">
              <CalendarBlank className="text-accent-gold text-3xl shrink-0" weight="light" />
              <div>
                <p className="font-sans text-[0.55rem] uppercase tracking-[0.2em] font-medium text-accent-gold mb-1">
                  {settings.appointmentCardBadge || 'YOUR APPOINTMENT'}
                </p>
                <div className="flex flex-col">
                <span className="text-white text-base font-medium">{data.date || 'Friday, October 4, 2024'}</span>
                <p className="text-white/60 text-sm font-light mt-0.5">
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

            <div className="w-full h-[1px] bg-white/5 mb-5" />

            <div className="flex flex-col gap-4">
              <div className="flex items-start gap-4">
                <User className="text-accent-gold text-2xl shrink-0" weight="light" />
                <div>
                  <p className="font-sans text-[0.65rem] text-white/50 mb-1">Session Type</p>
                  <p className="text-white text-sm">
                    {data.sessionDuration === 90 || data.isFirstSession === false
                      ? '1-on-1 Follow-up Coaching Session'
                      : '1-on-1 First Coaching Session'}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <Clock className="text-accent-gold text-2xl shrink-0" weight="light" />
                <div>
                  <p className="font-sans text-[0.65rem] text-white/50 mb-1">Duration</p>
                  <p className="text-white text-sm">
                    {data.sessionDuration || (data.isFirstSession === false ? 90 : 60)} minutes
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-6 flex justify-center text-accent-gold text-2xl shrink-0">₹</div>
                <div>
                  <p className="font-sans text-[0.65rem] text-white/50 mb-1">Total Paid</p>
                  {data.isFreeSession ? (
                    <p className="text-[#c79c6e] text-sm font-medium">
                      ₹0 <span className="text-white/50 text-xs font-light">(Course Bonus • {data.freeSessionsRemaining ?? 0} credits left)</span>
                    </p>
                  ) : (
                    <p className="text-white text-sm">₹{(data.paidAmount ?? fee ?? 5000).toLocaleString('en-IN')}</p>
                  )}
                </div>
              </div>

              <div className="flex items-start gap-4">
                <VideoCamera className="text-accent-gold text-2xl shrink-0" weight="light" />
                <div>
                  <p className="font-sans text-[0.65rem] text-white/50 mb-1">Where</p>
                  <p className="text-white text-sm">{settings.whereValue || 'Google Meet'}</p>
                  <p className="text-white/40 text-xs">{settings.whereNote || '(Link shared in confirmation email)'}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="relative h-64 md:h-auto md:col-span-3 overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-[#0f0f0f] to-transparent z-10" />
            <img 
              src={settings.cardImageUrl || "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?q=80&w=1287&auto=format&fit=crop"} 
              alt="Peaceful desk" 
              className="absolute inset-0 w-full h-full object-cover object-center opacity-70 scale-105 filter contrast-[1.05] brightness-90 saturate-[0.85]"
            />
          </div>

        </div>

        {/* What Happens Next Grid */}
        <h3 className="font-sans text-[0.65rem] uppercase tracking-[0.3em] font-medium text-accent-gold text-center mb-6 mt-16">
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
              <div key={idx} className="bg-[#0f0f0f] border border-white/5 rounded-xl p-6 text-center flex flex-col items-center">
                <div className="w-12 h-12 rounded-full border border-white/10 flex items-center justify-center mb-4 text-accent-gold">
                  <IconComp size={24} weight="light" />
                </div>
                <h4 className="text-white text-sm font-semibold tracking-wide uppercase mb-2">{card.title}</h4>
                <p className="text-white/50 text-xs font-light leading-relaxed">{card.description}</p>
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
            className="flex items-center justify-center gap-3 px-8 py-4 rounded-xl border border-white/10 font-sans text-sm font-light tracking-wide text-white/80 hover:text-white hover:border-white/30 hover:bg-white/5 transition-all w-full sm:w-auto text-center"
          >
            <CalendarBlank className="text-lg text-accent-gold" />
            {settings.addToCalendarButtonText || 'ADD TO CALENDAR'}
          </a>
          
          {isAuthenticated ? (
            <>
              <Link to="/my-journey" className="flex items-center justify-center gap-3 px-8 py-4 rounded-xl bg-accent-gold text-black font-sans text-sm font-semibold tracking-wide hover:bg-white transition-all w-full sm:w-auto">
                {settings.myJourneyButtonText || 'MY JOURNEY'}
                <User className="text-lg" />
              </Link>

              <Link to="/library" className="flex items-center justify-center gap-3 px-8 py-4 rounded-xl border border-white/10 font-sans text-sm font-light tracking-wide text-white/80 hover:text-white hover:border-white/30 transition-all w-full sm:w-auto">
                <BookOpen className="text-lg text-accent-gold" />
                {settings.exploreLibraryButtonText || 'EXPLORE LIBRARY'}
              </Link>
            </>
          ) : (
            <button onClick={() => setIsLoginModalOpen(true)} className="flex items-center justify-center gap-3 px-8 py-4 rounded-xl bg-accent-gold text-black font-sans text-sm font-semibold tracking-wide hover:bg-white transition-all w-full sm:w-auto">
              {settings.createAccountButtonText || 'CREATE ACCOUNT TO VIEW JOURNEY'}
              <User className="text-lg" />
            </button>
          )}
        </div>

        {/* Quote Banner */}
        <div className="relative border border-accent-gold/20 bg-[#0f0f0f] rounded-2xl p-8 md:p-12 overflow-hidden flex items-center justify-center shadow-xl mb-12">
          <div className="absolute inset-0 bg-gradient-to-r from-accent-gold/5 via-transparent to-accent-gold/5 opacity-50" />
          <Quotes className="text-accent-gold/20 text-8xl absolute left-8 top-8" weight="fill" />
          <div className="relative z-10 text-center">
            <p className="text-white text-xl md:text-2xl font-serif font-light mb-2">
              {settings.quoteLine1 || "Clarity doesn't come from having all the answers."}
            </p>
            <p className="text-accent-gold text-xl md:text-2xl font-serif italic">
              {settings.quoteLine2 || "It comes from asking better questions."}
            </p>
          </div>
        </div>

        {/* Footer Note */}
        <div className="flex flex-col items-center justify-center gap-2">
          <div className="flex items-center gap-2">
            <ChatCenteredText className="text-accent-gold text-lg" />
            <span className="font-sans text-xs uppercase tracking-[0.2em] font-medium text-accent-gold">
              {settings.changeHeading || 'NEED TO MAKE A CHANGE?'}
            </span>
          </div>
          <span className="font-sans text-xs text-white/40">
            {settings.changeText || 'You can reschedule or cancel up to 24 hours before the session.'}
          </span>
          <button 
            type="button"
            onClick={() => setIsPolicyModalOpen(true)} 
            className="font-sans text-xs text-accent-gold underline hover:text-white transition-colors mt-1 cursor-pointer"
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
