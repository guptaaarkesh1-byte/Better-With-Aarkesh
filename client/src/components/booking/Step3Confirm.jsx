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
          <h3 className="font-sans text-[0.68rem] uppercase tracking-[0.2em] font-bold text-[#c9542f] mb-3 sm:mb-4">
            {settings.sessionDetailsHeading || 'SESSION DETAILS'}
          </h3>
          
          <div className="bg-white/90 border border-black/10 rounded-2xl p-5 sm:p-7 md:p-8 flex flex-col gap-5 sm:gap-6 shadow-xs">
            
            <div className="flex items-start gap-3 sm:gap-4">
              <CalendarBlank className="text-[#c9542f] text-xl sm:text-2xl shrink-0 mt-0.5" weight="light" />
              <div>
                <p className="font-sans text-[0.65rem] uppercase tracking-wider text-[#7a756b] font-bold mb-0.5">{settings.dateLabel || 'Date'}</p>
                <p className="text-[#111010] text-base sm:text-lg font-medium">{data.date || 'Friday, October 4, 2024'}</p>
              </div>
            </div>

            <div className="flex items-start gap-3 sm:gap-4">
              <Clock className="text-[#c9542f] text-xl sm:text-2xl shrink-0 mt-0.5" weight="light" />
              <div>
                <p className="font-sans text-[0.65rem] uppercase tracking-wider text-[#7a756b] font-bold mb-0.5">{settings.timeLabel || 'Time'}</p>
                <p className="text-[#111010] text-base sm:text-lg font-medium">
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
              <User className="text-[#c9542f] text-xl sm:text-2xl shrink-0 mt-0.5" weight="light" />
              <div>
                <p className="font-sans text-[0.65rem] uppercase tracking-wider text-[#7a756b] font-bold mb-0.5">{settings.sessionTypeLabel || 'Session Type'}</p>
                <p className="text-[#111010] text-base sm:text-lg font-medium">
                  {data.sessionDuration === 90 || data.isFirstSession === false 
                    ? '1-on-1 Follow-up Coaching Session' 
                    : '1-on-1 First Coaching Session'}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 sm:gap-4">
              <Clock className="text-[#c9542f] text-xl sm:text-2xl shrink-0 mt-0.5" weight="light" />
              <div>
                <p className="font-sans text-[0.65rem] uppercase tracking-wider text-[#7a756b] font-bold mb-0.5">{settings.durationLabel || 'Duration'}</p>
                <p className="text-[#111010] text-base sm:text-lg font-medium">
                  {data.sessionDuration || (data.isFirstSession === false ? 90 : 60)} minutes
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 sm:gap-4">
              <VideoCamera className="text-[#c9542f] text-xl sm:text-2xl shrink-0 mt-0.5" weight="light" />
              <div>
                <p className="font-sans text-[0.65rem] uppercase tracking-wider text-[#7a756b] font-bold mb-0.5">{settings.whereLabel || 'Where'}</p>
                <p className="text-[#111010] text-base sm:text-lg font-medium">{settings.whereValue || 'Google Meet'} <span className="text-[#7a756b] text-xs sm:text-sm block sm:inline font-normal">{settings.whereNote || '(Link will be shared after booking)'}</span></p>
              </div>
            </div>

            <div className="flex items-start gap-3 sm:gap-4 pt-2 border-t border-black/10">
              <div className="w-5 sm:w-6 flex justify-center text-[#c9542f] text-xl sm:text-2xl shrink-0 font-serif font-bold">₹</div>
              <div className="flex flex-col gap-1">
                <span className="font-sans text-[0.65rem] uppercase tracking-widest text-[#7a756b] font-bold">{settings.totalAmountLabel || 'Total Amount'}</span>
                {isFreeSession ? (
                  <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                    <span className="font-serif text-2xl sm:text-3xl font-bold text-[#c9542f]">₹0</span>
                    <span className="font-sans text-xs line-through text-[#7a756b]">₹{fee.toLocaleString('en-IN')}</span>
                    <span className="px-2 py-0.5 rounded bg-[#faede4] text-[#c9542f] text-[0.65rem] font-bold border border-[#f0c8b8]">
                      Course Benefit ({freeSessionInfo.freeSessions} Left)
                    </span>
                  </div>
                ) : (
                  <span className="font-serif text-2xl sm:text-3xl font-bold text-[#111010]">₹{fee.toLocaleString('en-IN')}</span>
                )}
              </div>
            </div>

          </div>
        </div>

        {/* Right Column - Info */}
        <div className="flex-1 mt-6 lg:mt-0">
          <h3 className="font-sans text-[0.68rem] uppercase tracking-[0.2em] font-bold text-[#c9542f] mb-3 sm:mb-4">
            {settings.whatHappensNextHeading || 'WHAT HAPPENS NEXT'}
          </h3>
          
          <div className="bg-white/90 border border-black/10 rounded-2xl p-5 sm:p-7 md:p-8 flex flex-col gap-4 sm:gap-5 shadow-xs">
            
            {(settings.nextSteps && settings.nextSteps.length > 0 ? settings.nextSteps : [
              { title: "You'll receive a confirmation email", description: "With all the details and next steps." },
              { title: "A reminder before our session", description: "So you can show up fully." },
              { title: "A private, confidential space", description: "Built for honest conversations." },
              { title: "This is your time", description: "To reflect, gain clarity, and move forward." }
            ]).map((stepItem, idx) => {
              const IconComp = nextStepIcons[idx % nextStepIcons.length] || EnvelopeSimple;
              return (
                <div key={idx} className="flex items-start gap-3 sm:gap-4">
                  <IconComp className="text-[#c9542f] text-lg sm:text-xl shrink-0 mt-0.5" weight="light" />
                  <div>
                    <p className="text-[#111010] text-xs sm:text-sm font-semibold mb-0.5">{stepItem.title}</p>
                    <p className="text-[#555047] text-[0.75rem] sm:text-xs font-light">{stepItem.description}</p>
                  </div>
                </div>
              );
            })}

          </div>

          <h3 className="font-sans text-[0.68rem] uppercase tracking-[0.2em] font-bold text-[#c9542f] mb-3 sm:mb-4 mt-6 sm:mt-8">
            {settings.rescheduleHeading || 'NEED TO RESCHEDULE?'}
          </h3>
          
          <div className="bg-[#faede4] border border-[#f0c8b8] rounded-2xl p-4 sm:p-5 flex gap-3 sm:gap-4 items-start shadow-xs">
            <ClockCounterClockwise className="text-[#c9542f] text-xl sm:text-2xl shrink-0 mt-0.5" weight="light" />
            <div>
              <p className="text-[#555047] text-xs font-normal leading-relaxed mb-2">
                {settings.rescheduleText || 'You can reschedule or cancel up to 24 hours before the session.'}
              </p>
              <button 
                onClick={() => setActiveModal('rescheduling-policy')}
                className="text-[#c9542f] text-xs font-semibold underline hover:text-[#111010] transition-colors cursor-pointer"
              >
                {settings.reschedulePolicyLinkText || 'View Rescheduling Policy'}
              </button>
            </div>
          </div>
        </div>

      </div>

      {/* Checkbox and Submit */}
      <div className="mt-8 sm:mt-12 pt-6 sm:pt-8 border-t border-black/10 flex flex-col md:flex-row items-start md:items-center justify-between gap-5 sm:gap-6">
        
        <div className="flex w-full md:w-auto">
          <div 
            className="flex items-start gap-3 cursor-pointer group"
            onClick={() => setAgreed(!agreed)}
          >
            {agreed ? (
              <CheckSquare className="text-[#c9542f] text-xl sm:text-2xl shrink-0 mt-0.5" weight="fill" />
            ) : (
              <Square className="text-black/30 text-xl sm:text-2xl shrink-0 mt-0.5 group-hover:text-[#c9542f] transition-colors" weight="regular" />
            )}
            <p className="text-[#555047] text-xs sm:text-sm font-normal leading-snug">
              {settings.agreementPrefix || 'I agree to the'}{' '}
              <button type="button" className="text-[#c9542f] hover:underline font-semibold cursor-pointer inline" onClick={(e) => { e.preventDefault(); e.stopPropagation(); setActiveModal('terms-and-conditions'); }}>
                {settings.agreementLinkText || 'terms and conditions'}
              </button>{' '}
              {settings.agreementSuffix || 'and understand that the amount above is the total payment shown in this summary.'}
            </p>
          </div>
        </div>

        <div className="flex flex-col-reverse md:flex-row items-stretch md:items-center gap-3 sm:gap-4 md:gap-6 w-full md:w-auto mt-2 md:mt-0">
          <button
            onClick={onBack}
            className="flex items-center justify-center gap-2 sm:gap-3 px-6 sm:px-8 py-3.5 sm:py-4 rounded-xl border border-black/15 font-sans text-xs sm:text-sm font-semibold tracking-wide text-[#111010] hover:bg-black/5 transition-all w-full md:w-auto cursor-pointer"
          >
            <ArrowLeft className="text-base sm:text-lg" />
            {settings.backButtonText || 'BACK'}
          </button>
          
          <div className="flex flex-col gap-2 w-full md:w-auto">
            <button
              onClick={onNext}
              disabled={!agreed || isLoading}
              className={`flex items-center justify-center gap-2 sm:gap-3 px-6 sm:px-8 py-3.5 sm:py-4 rounded-xl font-sans text-xs sm:text-sm font-bold tracking-wider uppercase transition-all w-full md:w-auto cursor-pointer
                ${(!agreed || isLoading)
                  ? 'bg-black/5 text-black/30 border border-black/10 cursor-not-allowed' 
                  : 'bg-[#c9542f] text-white hover:bg-[#111010] shadow-md hover:-translate-y-0.5'
                }
              `}
            >
              {isLoading 
                ? (isFreeSession ? 'RESERVING SESSION...' : 'BOOKING...') 
                : (isFreeSession ? (settings.confirmFreeButtonText || 'CONFIRM FREE SESSION') : (settings.confirmButtonText || 'CONFIRM & BOOK'))
              }
              {!isLoading && <LockKey className="text-base sm:text-lg" weight="bold" />}
            </button>
            {error && <p className="text-red-600 font-sans text-xs text-center font-medium">{error}</p>}
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
