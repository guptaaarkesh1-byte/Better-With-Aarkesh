import React, { useState } from 'react';
import { 
  CalendarBlank, Clock, User, VideoCamera, 
  EnvelopeSimple, Lock, ArrowLeft, LockKey, CheckSquare, Square, ClockCounterClockwise 
} from '@phosphor-icons/react';
import PolicyModal from '../ui/PolicyModal';

export default function Step3Confirm({ data, fee, onNext, onBack, isLoading, error }) {
  const [agreed, setAgreed] = useState(false);
  const [activeModal, setActiveModal] = useState(null);

  return (
    <div className="flex flex-col animate-in fade-in slide-in-from-bottom-4 duration-700">
      
      <div className="flex flex-col lg:flex-row gap-8 lg:gap-12">
        
        {/* Left Column - Details */}
        <div className="flex-1">
          <h3 className="font-sans text-[0.65rem] uppercase tracking-[0.2em] font-medium text-accent-gold mb-6">
            SESSION DETAILS
          </h3>
          
          <div className="bg-[#0f0f0f] border border-white/5 rounded-xl p-6 md:p-8 flex flex-col gap-8">
            
            <div className="flex items-start gap-4">
              <CalendarBlank className="text-accent-gold text-2xl shrink-0" weight="light" />
              <div>
                <p className="font-sans text-xs text-white/50 mb-1">Date</p>
                <p className="text-white text-lg">{data.date || 'Friday, October 4, 2024'}</p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <Clock className="text-accent-gold text-2xl shrink-0" weight="light" />
              <div>
                <p className="font-sans text-xs text-white/50 mb-1">Time</p>
                <p className="text-white text-lg">
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

            <div className="flex items-start gap-4">
              <User className="text-accent-gold text-2xl shrink-0" weight="light" />
              <div>
                <p className="font-sans text-xs text-white/50 mb-1">Session Type</p>
                <p className="text-white text-lg">1-on-1 Coaching Session</p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <Clock className="text-accent-gold text-2xl shrink-0" weight="light" />
              <div>
                <p className="font-sans text-xs text-white/50 mb-1">Duration</p>
                <p className="text-white text-lg">{data.sessionDuration || 60} minutes</p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <VideoCamera className="text-accent-gold text-2xl shrink-0" weight="light" />
              <div>
                <p className="font-sans text-xs text-white/50 mb-1">Where</p>
                <p className="text-white text-lg">Google Meet <span className="text-white/40 text-sm">(Link will be shared after booking)</span></p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="w-6 flex justify-center text-accent-gold text-2xl shrink-0">₹</div>
              <div className="flex flex-col gap-1">
                <span className="font-sans text-[0.65rem] uppercase tracking-widest text-white/40">Total Amount</span>
                <span className="font-sans text-xl font-medium text-white">₹{fee.toLocaleString('en-IN')}</span>
              </div>
            </div>

          </div>
        </div>

        {/* Right Column - Info */}
        <div className="flex-1 mt-8 lg:mt-0">
          <h3 className="font-sans text-[0.65rem] uppercase tracking-[0.2em] font-medium text-accent-gold mb-6">
            WHAT HAPPENS NEXT
          </h3>
          
          <div className="bg-[#0f0f0f] border border-white/5 rounded-xl p-6 md:p-8 flex flex-col gap-6">
            
            <div className="flex items-start gap-4">
              <EnvelopeSimple className="text-accent-gold text-xl shrink-0 mt-0.5" weight="light" />
              <div>
                <p className="text-white text-sm font-medium mb-1">You'll receive a confirmation email</p>
                <p className="text-white/50 text-xs font-light">With all the details and next steps.</p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <CalendarBlank className="text-accent-gold text-xl shrink-0 mt-0.5" weight="light" />
              <div>
                <p className="text-white text-sm font-medium mb-1">A reminder before our session</p>
                <p className="text-white/50 text-xs font-light">So you can show up fully.</p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <Lock className="text-accent-gold text-xl shrink-0 mt-0.5" weight="light" />
              <div>
                <p className="text-white text-sm font-medium mb-1">A private, confidential space</p>
                <p className="text-white/50 text-xs font-light">Built for honest conversations.</p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <User className="text-accent-gold text-xl shrink-0 mt-0.5" weight="light" />
              <div>
                <p className="text-white text-sm font-medium mb-1">This is your time</p>
                <p className="text-white/50 text-xs font-light">To reflect, gain clarity, and move forward.</p>
              </div>
            </div>

          </div>

          <h3 className="font-sans text-[0.65rem] uppercase tracking-[0.2em] font-medium text-accent-gold mb-4 mt-8">
            NEED TO RESCHEDULE?
          </h3>
          
          <div className="bg-[#0f0f0f] border border-white/5 rounded-xl p-6 flex gap-4 items-start">
            <ClockCounterClockwise className="text-accent-gold text-2xl shrink-0" weight="light" />
            <div>
              <p className="text-white/60 text-xs font-light leading-relaxed mb-2">
                You can reschedule or cancel up to 24 hours before the session.
              </p>
              <button 
                onClick={() => setActiveModal('rescheduling-policy')}
                className="text-accent-gold text-xs underline hover:text-white transition-colors"
              >
                View Rescheduling Policy
              </button>
            </div>
          </div>
        </div>

      </div>

      {/* Checkbox and Submit */}
      <div className="mt-12 pt-8 border-t border-white/10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        
        <div className="flex w-full md:w-auto">
          <div 
            className="flex items-start gap-3 cursor-pointer group"
            onClick={() => setAgreed(!agreed)}
          >
            {agreed ? (
              <CheckSquare className="text-accent-gold text-2xl shrink-0" weight="fill" />
            ) : (
              <Square className="text-white/30 text-2xl shrink-0 group-hover:text-white/60 transition-colors" weight="regular" />
            )}
            <p className="text-white/80 text-sm font-light leading-snug">
              I agree to the <button className="text-accent-gold hover:underline" onClick={(e) => { e.stopPropagation(); setActiveModal('terms-and-conditions'); }}>terms and conditions</button> and understand that the amount above is the total payment shown in this summary.
            </p>
          </div>
        </div>

        <div className="flex flex-col-reverse md:flex-row items-stretch md:items-center gap-4 md:gap-6 w-full md:w-auto mt-2 md:mt-0">
          <button
            onClick={onBack}
            className="flex items-center justify-center gap-3 px-8 py-4 rounded-xl border border-white/10 font-sans text-sm font-light tracking-wide text-white/60 hover:text-white hover:border-white/30 transition-all"
          >
            <ArrowLeft className="text-lg" />
            BACK
          </button>
          
          <div className="flex flex-col gap-2 w-full md:w-auto">
            <button
              onClick={onNext}
              disabled={!agreed || isLoading}
              className={`flex items-center justify-center gap-3 px-8 py-4 rounded-xl font-sans text-sm font-semibold tracking-wide transition-all
                ${(!agreed || isLoading)
                  ? 'bg-white/5 text-white/20 cursor-not-allowed' 
                  : 'bg-accent-gold text-black hover:bg-white hover:text-black hover:-translate-y-1'
                }
              `}
            >
              {isLoading ? 'BOOKING...' : 'CONFIRM & BOOK'}
              {!isLoading && <LockKey className="text-lg" weight="bold" />}
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
