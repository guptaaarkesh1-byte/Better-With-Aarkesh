import React, { useState } from 'react';
import { 
  CalendarBlank, Clock, User, VideoCamera, 
  EnvelopeSimple, Lock, ArrowLeft, LockKey, CheckSquare, Square, ClockCounterClockwise 
} from '@phosphor-icons/react';
import PolicyModal from '../ui/PolicyModal';

export default function Step3Confirm({ data, fee, onNext, onBack, isLoading, error, freeSessionInfo, settings = {} }) {
  const [agreed, setAgreed] = useState(false);
  const [activeModal, setActiveModal] = useState(null);

  const isFreeSession = freeSessionInfo?.hasFreeSessions && freeSessionInfo.freeSessions > 0;

  const nextStepIcons = [EnvelopeSimple, CalendarBlank, Lock, User];

  return (
    <div className="flex flex-col animate-in fade-in slide-in-from-bottom-4 duration-700">
      
      <div className="flex flex-col lg:flex-row gap-6 sm:gap-8 lg:gap-12">
        
        {/* Left Column - Details */}
        <div className="flex-1">
          <h3 className="font-sans text-[0.65rem] uppercase tracking-[0.2em] font-medium text-accent-gold mb-3 sm:mb-6">
            {settings.sessionDetailsHeading || 'SESSION DETAILS'}
          </h3>
          
          <div className="bg-[#0f0f0f] border border-white/5 rounded-xl p-4 sm:p-6 md:p-8 flex flex-col gap-5 sm:gap-7">
            
            <div className="flex items-start gap-3 sm:gap-4">
              <CalendarBlank className="text-accent-gold text-xl sm:text-2xl shrink-0 mt-0.5" weight="light" />
              <div>
                <p className="font-sans text-[0.65rem] text-white/50 mb-0.5">{settings.dateLabel || 'Date'}</p>
                <p className="text-white text-base sm:text-lg">{data.date || 'Friday, October 4, 2024'}</p>
              </div>
            </div>

            <div className="flex items-start gap-3 sm:gap-4">
              <Clock className="text-accent-gold text-xl sm:text-2xl shrink-0 mt-0.5" weight="light" />
              <div>
                <p className="font-sans text-[0.65rem] text-white/50 mb-0.5">{settings.timeLabel || 'Time'}</p>
                <p className="text-white text-base sm:text-lg">
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

            <div className="flex items-start gap-3 sm:gap-4">
              <User className="text-accent-gold text-xl sm:text-2xl shrink-0 mt-0.5" weight="light" />
              <div>
                <p className="font-sans text-[0.65rem] text-white/50 mb-0.5">{settings.sessionTypeLabel || 'Session Type'}</p>
                <p className="text-white text-base sm:text-lg">
                  {data.sessionDuration === 90 || data.isFirstSession === false 
                    ? '1-on-1 Follow-up Coaching Session' 
                    : '1-on-1 First Coaching Session'}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 sm:gap-4">
              <Clock className="text-accent-gold text-xl sm:text-2xl shrink-0 mt-0.5" weight="light" />
              <div>
                <p className="font-sans text-[0.65rem] text-white/50 mb-0.5">{settings.durationLabel || 'Duration'}</p>
                <p className="text-white text-base sm:text-lg">
                  {data.sessionDuration || (data.isFirstSession === false ? 90 : 60)} minutes
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 sm:gap-4">
              <VideoCamera className="text-accent-gold text-xl sm:text-2xl shrink-0 mt-0.5" weight="light" />
              <div>
                <p className="font-sans text-[0.65rem] text-white/50 mb-0.5">{settings.whereLabel || 'Where'}</p>
                <p className="text-white text-base sm:text-lg">{settings.whereValue || 'Google Meet'} <span className="text-white/40 text-xs sm:text-sm block sm:inline">{settings.whereNote || '(Link will be shared after booking)'}</span></p>
              </div>
            </div>

            <div className="flex items-start gap-3 sm:gap-4">
              <div className="w-5 sm:w-6 flex justify-center text-accent-gold text-xl sm:text-2xl shrink-0">₹</div>
              <div className="flex flex-col gap-1">
                <span className="font-sans text-[0.65rem] uppercase tracking-widest text-white/40">{settings.totalAmountLabel || 'Total Amount'}</span>
                {isFreeSession ? (
                  <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                    <span className="font-sans text-xl sm:text-2xl font-semibold text-accent-gold">₹0</span>
                    <span className="font-sans text-xs line-through text-white/40">₹{fee.toLocaleString('en-IN')}</span>
                    <span className="px-2 py-0.5 rounded bg-accent-gold/20 text-accent-gold text-[0.65rem] font-medium border border-accent-gold/30">
                      Course Benefit ({freeSessionInfo.freeSessions} Left)
                    </span>
                  </div>
                ) : (
                  <span className="font-sans text-lg sm:text-xl font-medium text-white">₹{fee.toLocaleString('en-IN')}</span>
                )}
              </div>
            </div>

          </div>
        </div>

        {/* Right Column - Info */}
        <div className="flex-1 mt-6 lg:mt-0">
          <h3 className="font-sans text-[0.65rem] uppercase tracking-[0.2em] font-medium text-accent-gold mb-3 sm:mb-6">
            {settings.whatHappensNextHeading || 'WHAT HAPPENS NEXT'}
          </h3>
          
          <div className="bg-[#0f0f0f] border border-white/5 rounded-xl p-4 sm:p-6 md:p-8 flex flex-col gap-4 sm:gap-6">
            
            {(settings.nextSteps && settings.nextSteps.length > 0 ? settings.nextSteps : [
              { title: "You'll receive a confirmation email", description: "With all the details and next steps." },
              { title: "A reminder before our session", description: "So you can show up fully." },
              { title: "A private, confidential space", description: "Built for honest conversations." },
              { title: "This is your time", description: "To reflect, gain clarity, and move forward." }
            ]).map((stepItem, idx) => {
              const IconComp = nextStepIcons[idx % nextStepIcons.length] || EnvelopeSimple;
              return (
                <div key={idx} className="flex items-start gap-3 sm:gap-4">
                  <IconComp className="text-accent-gold text-lg sm:text-xl shrink-0 mt-0.5" weight="light" />
                  <div>
                    <p className="text-white text-xs sm:text-sm font-medium mb-0.5">{stepItem.title}</p>
                    <p className="text-white/50 text-[0.72rem] sm:text-xs font-light">{stepItem.description}</p>
                  </div>
                </div>
              );
            })}

          </div>

          <h3 className="font-sans text-[0.65rem] uppercase tracking-[0.2em] font-medium text-accent-gold mb-3 sm:mb-4 mt-6 sm:mt-8">
            {settings.rescheduleHeading || 'NEED TO RESCHEDULE?'}
          </h3>
          
          <div className="bg-[#0f0f0f] border border-white/5 rounded-xl p-4 sm:p-6 flex gap-3 sm:gap-4 items-start">
            <ClockCounterClockwise className="text-accent-gold text-xl sm:text-2xl shrink-0 mt-0.5" weight="light" />
            <div>
              <p className="text-white/60 text-xs font-light leading-relaxed mb-2">
                {settings.rescheduleText || 'You can reschedule or cancel up to 24 hours before the session.'}
              </p>
              <button 
                onClick={() => setActiveModal('rescheduling-policy')}
                className="text-accent-gold text-xs underline hover:text-white transition-colors"
              >
                {settings.reschedulePolicyLinkText || 'View Rescheduling Policy'}
              </button>
            </div>
          </div>
        </div>

      </div>

      {/* Checkbox and Submit */}
      <div className="mt-8 sm:mt-12 pt-6 sm:pt-8 border-t border-white/10 flex flex-col md:flex-row items-start md:items-center justify-between gap-5 sm:gap-6">
        
        <div className="flex w-full md:w-auto">
          <div 
            className="flex items-start gap-3 cursor-pointer group"
            onClick={() => setAgreed(!agreed)}
          >
            {agreed ? (
              <CheckSquare className="text-accent-gold text-xl sm:text-2xl shrink-0 mt-0.5" weight="fill" />
            ) : (
              <Square className="text-white/30 text-xl sm:text-2xl shrink-0 mt-0.5 group-hover:text-white/60 transition-colors" weight="regular" />
            )}
            <p className="text-white/80 text-xs sm:text-sm font-light leading-snug">
              {settings.agreementPrefix || 'I agree to the'}{' '}
              <button type="button" className="text-accent-gold hover:underline font-medium cursor-pointer inline" onClick={(e) => { e.preventDefault(); e.stopPropagation(); setActiveModal('terms-and-conditions'); }}>
                {settings.agreementLinkText || 'terms and conditions'}
              </button>{' '}
              {settings.agreementSuffix || 'and understand that the amount above is the total payment shown in this summary.'}
            </p>
          </div>
        </div>

        <div className="flex flex-col-reverse md:flex-row items-stretch md:items-center gap-3 sm:gap-4 md:gap-6 w-full md:w-auto mt-2 md:mt-0">
          <button
            onClick={onBack}
            className="flex items-center justify-center gap-2 sm:gap-3 px-6 sm:px-8 py-3.5 sm:py-4 rounded-xl border border-white/10 font-sans text-xs sm:text-sm font-light tracking-wide text-white/60 hover:text-white hover:border-white/30 transition-all w-full md:w-auto"
          >
            <ArrowLeft className="text-base sm:text-lg" />
            {settings.backButtonText || 'BACK'}
          </button>
          
          <div className="flex flex-col gap-2 w-full md:w-auto">
            <button
              onClick={onNext}
              disabled={!agreed || isLoading}
              className={`flex items-center justify-center gap-2 sm:gap-3 px-6 sm:px-8 py-3.5 sm:py-4 rounded-xl font-sans text-xs sm:text-sm font-semibold tracking-wide transition-all w-full md:w-auto
                ${(!agreed || isLoading)
                  ? 'bg-white/5 text-white/20 cursor-not-allowed' 
                  : 'bg-accent-gold text-black hover:bg-white hover:text-black hover:-translate-y-0.5 shadow-[0_0_25px_rgba(185,138,86,0.2)]'
                }
              `}
            >
              {isLoading 
                ? (isFreeSession ? 'RESERVING SESSION...' : 'BOOKING...') 
                : (isFreeSession ? (settings.confirmFreeButtonText || 'CONFIRM FREE SESSION') : (settings.confirmButtonText || 'CONFIRM & BOOK'))
              }
              {!isLoading && <LockKey className="text-base sm:text-lg" weight="bold" />}
            </button>
            {error && <p className="text-red-400 font-sans text-xs text-center">{error}</p>}
          </div>
        </div>

      </div>

      <PolicyModal
        isOpen={!!activeModal}
        onClose={() => setActiveModal(null)}
        slug={activeModal}
        title={activeModal === 'terms-and-conditions' ? 'Terms & Conditions' : 'Rescheduling Policy'}
        showActions={activeModal === 'terms-and-conditions'}
        onAgree={() => { setAgreed(true); setActiveModal(null); }}
        onDecline={() => { setAgreed(false); setActiveModal(null); }}
      />
    </div>
  );
}
