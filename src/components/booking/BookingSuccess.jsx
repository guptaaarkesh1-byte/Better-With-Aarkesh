import React from 'react';
import { 
  Check, CalendarBlank, Clock, User, VideoCamera, 
  EnvelopeSimple, House, Quotes, ChatCenteredText, BookOpen, ArrowLeft
} from '@phosphor-icons/react';
import { Link } from 'react-router-dom';
import bookingBg from '../../assets/images/booking_bg_lamp.png';

export default function BookingSuccess({ data }) {
  return (
    <div className="min-h-screen bg-[#0a0a0a] relative pt-20 md:pt-28 pb-16 px-4 md:px-8 animate-in fade-in zoom-in-95 duration-1000">
      
      {/* Background Image Layer */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <img 
          src={bookingBg} 
          alt="Desk lamp" 
          className="w-full h-full object-cover object-left opacity-60"
        />
        {/* Gradients to fade the image into black so text stays readable */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#0a0a0a]/40 via-[#0a0a0a]/80 to-[#0a0a0a]" />
        <div className="absolute inset-0 bg-gradient-to-b from-[#0a0a0a]/50 via-transparent to-[#0a0a0a]/90" />
      </div>

      <div className="relative z-10 max-w-5xl mx-auto">
        
        {/* Top Left Back Button */}
        <div className="flex w-full mb-8">
          <Link 
            to="/" 
            className="flex items-center gap-2 font-sans text-[0.65rem] uppercase tracking-widest text-white/60 hover:text-white hover:text-accent-gold transition-colors"
          >
            <ArrowLeft className="text-base" />
            RETURN TO HOME
          </Link>
        </div>

        {/* Header section */}
        <div className="text-center mb-8 flex flex-col items-center justify-center">
          <div className="w-10 h-10 rounded-full border border-accent-gold flex items-center justify-center mb-4">
            <Check className="text-accent-gold text-lg" weight="bold" />
          </div>
          <span className="font-sans text-[0.6rem] uppercase tracking-[0.3em] font-medium text-accent-gold block mb-3">
            YOUR SESSION IS RESERVED
          </span>
          <h1 className="font-serif text-3xl md:text-4xl lg:text-5xl font-medium tracking-tight leading-[1.1] text-white mb-4 max-w-2xl mx-auto">
            Thank you for trusting me<br/>with a part of your story.
          </h1>
          <p className="text-paragraph text-xs md:text-sm font-light tracking-wide text-white/80 max-w-lg mx-auto">
            I've sent a confirmation email with everything you'll need.
            <br className="hidden md:block" />
            Until then, don't worry about preparing the "right" answers.
            <br className="hidden md:block" />
            <span className="italic text-accent-gold mt-1 block">Just bring yourself.</span>
          </p>
        </div>

        {/* Appointment Card */}
        <div className="grid grid-cols-1 md:grid-cols-5 bg-[#0f0f0f] border border-white/5 rounded-2xl overflow-hidden mb-8 shadow-2xl">
          
          <div className="p-5 md:p-6 md:col-span-2 flex flex-col justify-center">
            <div className="flex items-start gap-3 mb-5">
              <CalendarBlank className="text-accent-gold text-3xl shrink-0" weight="light" />
              <div>
                <p className="font-sans text-[0.55rem] uppercase tracking-[0.2em] font-medium text-accent-gold mb-1">YOUR APPOINTMENT</p>
                <p className="text-white text-lg font-medium">{data.date || 'Friday, October 4, 2024'}</p>
                <p className="text-white/60 text-sm font-light mt-0.5">{data.time || '10:30 AM'} – 11:30 AM IST</p>
              </div>
            </div>

            <div className="w-full h-[1px] bg-white/5 mb-5" />

            <div className="flex flex-col gap-4">
              <div className="flex items-start gap-4">
                <User className="text-accent-gold text-2xl shrink-0" weight="light" />
                <div>
                  <p className="font-sans text-[0.65rem] text-white/50 mb-1">Session Type</p>
                  <p className="text-white text-sm">1-on-1 Coaching Session</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <Clock className="text-accent-gold text-2xl shrink-0" weight="light" />
                <div>
                  <p className="font-sans text-[0.65rem] text-white/50 mb-1">Duration</p>
                  <p className="text-white text-sm">60 minutes</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <VideoCamera className="text-accent-gold text-2xl shrink-0" weight="light" />
                <div>
                  <p className="font-sans text-[0.65rem] text-white/50 mb-1">Where</p>
                  <p className="text-white text-sm">Google Meet</p>
                  <p className="text-white/40 text-xs">(Link shared in confirmation email)</p>
                </div>
              </div>
            </div>
          </div>

          <div className="relative h-64 md:h-auto md:col-span-3 overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-[#0f0f0f] to-transparent z-10" />
            <img 
              src="https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?q=80&w=1287&auto=format&fit=crop" 
              alt="Peaceful desk" 
              className="absolute inset-0 w-full h-full object-cover object-center opacity-70 scale-105 filter contrast-[1.05] brightness-90 saturate-[0.85]"
            />
          </div>

        </div>

        {/* What Happens Next Grid */}
        <h3 className="font-sans text-[0.65rem] uppercase tracking-[0.3em] font-medium text-accent-gold text-center mb-6 mt-16">
          WHAT HAPPENS NEXT
        </h3>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-12">
          
          <div className="bg-[#0f0f0f] border border-white/5 rounded-xl p-6 text-center flex flex-col items-center">
            <div className="w-12 h-12 rounded-full border border-white/10 flex items-center justify-center mb-4 text-accent-gold">
              <EnvelopeSimple size={24} weight="light" />
            </div>
            <h4 className="text-white text-sm font-semibold tracking-wide uppercase mb-2">CONFIRMATION EMAIL</h4>
            <p className="text-white/50 text-xs font-light leading-relaxed">You'll receive a confirmation email with all the details and next steps.</p>
          </div>

          <div className="bg-[#0f0f0f] border border-white/5 rounded-xl p-6 text-center flex flex-col items-center">
            <div className="w-12 h-12 rounded-full border border-white/10 flex items-center justify-center mb-4 text-accent-gold">
              <CalendarBlank size={24} weight="light" />
            </div>
            <h4 className="text-white text-sm font-semibold tracking-wide uppercase mb-2">CALENDAR INVITE</h4>
            <p className="text-white/50 text-xs font-light leading-relaxed">A calendar invite has been sent. Add it to your calendar.</p>
          </div>

          <div className="bg-[#0f0f0f] border border-white/5 rounded-xl p-6 text-center flex flex-col items-center">
            <div className="w-12 h-12 rounded-full border border-white/10 flex items-center justify-center mb-4 text-accent-gold">
              <VideoCamera size={24} weight="light" />
            </div>
            <h4 className="text-white text-sm font-semibold tracking-wide uppercase mb-2">MEETING LINK</h4>
            <p className="text-white/50 text-xs font-light leading-relaxed">Your Google Meet link is included in the email. Check your spam folder if you don't see it.</p>
          </div>

          <div className="bg-[#0f0f0f] border border-white/5 rounded-xl p-6 text-center flex flex-col items-center">
            <div className="w-12 h-12 rounded-full border border-white/10 flex items-center justify-center mb-4 text-accent-gold">
              <User size={24} weight="light" />
            </div>
            <h4 className="text-white text-sm font-semibold tracking-wide uppercase mb-2">BE YOURSELF</h4>
            <p className="text-white/50 text-xs font-light leading-relaxed">This is a space for honesty, clarity, and real conversations. You don't have to have it all figured out.</p>
          </div>

        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12">
          <button className="flex items-center justify-center gap-3 px-8 py-4 rounded-xl border border-white/10 font-sans text-sm font-light tracking-wide text-white/80 hover:text-white hover:border-white/30 transition-all w-full sm:w-auto">
            <CalendarBlank className="text-lg text-accent-gold" />
            ADD TO CALENDAR
          </button>
          
          <Link to="/" className="flex items-center justify-center gap-3 px-8 py-4 rounded-xl bg-accent-gold text-black font-sans text-sm font-semibold tracking-wide hover:bg-white transition-all w-full sm:w-auto">
            RETURN HOME
            <House className="text-lg" />
          </Link>

          <button className="flex items-center justify-center gap-3 px-8 py-4 rounded-xl border border-white/10 font-sans text-sm font-light tracking-wide text-white/80 hover:text-white hover:border-white/30 transition-all w-full sm:w-auto">
            <BookOpen className="text-lg text-accent-gold" />
            EXPLORE PERSPECTIVES
          </button>
        </div>

        {/* Quote Banner */}
        <div className="relative border border-accent-gold/20 bg-[#0f0f0f] rounded-2xl p-8 md:p-12 overflow-hidden flex items-center justify-center shadow-xl mb-12">
          <div className="absolute inset-0 bg-gradient-to-r from-accent-gold/5 via-transparent to-accent-gold/5 opacity-50" />
          <Quotes className="text-accent-gold/20 text-8xl absolute left-8 top-8" weight="fill" />
          <div className="relative z-10 text-center">
            <p className="text-white text-xl md:text-2xl font-serif font-light mb-2">
              Clarity doesn't come from having all the answers.
            </p>
            <p className="text-accent-gold text-xl md:text-2xl font-serif italic">
              It comes from asking better questions.
            </p>
          </div>
        </div>

        {/* Footer Note */}
        <div className="flex flex-col items-center justify-center gap-2">
          <div className="flex items-center gap-2">
            <ChatCenteredText className="text-accent-gold text-lg" />
            <span className="font-sans text-xs uppercase tracking-[0.2em] font-medium text-accent-gold">NEED TO MAKE A CHANGE?</span>
          </div>
          <span className="font-sans text-xs text-white/40">You can reschedule or cancel up to 24 hours before the session.</span>
          <a href="#" className="font-sans text-xs text-accent-gold underline hover:text-white transition-colors mt-1">View Rescheduling Policy &rarr;</a>
        </div>

      </div>
    </div>
  );
}
