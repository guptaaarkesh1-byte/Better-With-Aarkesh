import React from 'react';
import { Clock, ArrowLeft, ArrowRight, ArrowUpRight, Sparkle, CheckCircle } from '@phosphor-icons/react';
import { COUNTRY_CODES } from '../../utils/countryCodes';

export default function Step2Details({ data, updateData, onNext, onBack, isAuthenticated, freeSessionInfo }) {
  
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    updateData({ [name]: value });
  };

  const isValidEmail = (email) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const isFormValid = data.name.trim() !== '' && isValidEmail(data.email) && data.reason.trim() !== '' &&
    (isAuthenticated || (data.phoneNumber && data.phoneNumber.length === 10));

  const handleContinue = () => {
    if (isFormValid) {
      onNext();
    }
  };

  return (
    <div className="flex flex-col animate-in fade-in slide-in-from-bottom-4 duration-700">
      
      {/* Course Student Free Session Banner */}
      {freeSessionInfo?.hasFreeSessions && freeSessionInfo.freeSessions > 0 && (
        <div className="mb-6 sm:mb-8 p-3.5 sm:p-4 rounded-xl border border-accent-gold/40 bg-gradient-to-r from-accent-gold/15 to-transparent flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4 shadow-[0_0_20px_rgba(185,138,86,0.1)]">
          <div className="flex items-start sm:items-center gap-3 sm:gap-3.5">
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-accent-gold/20 border border-accent-gold/40 flex items-center justify-center text-accent-gold shrink-0 mt-0.5 sm:mt-0">
              <Sparkle size={16} weight="fill" className="sm:w-[18px] sm:h-[18px]" />
            </div>
            <div>
              <p className="text-white text-xs font-medium flex flex-wrap items-center gap-1.5 sm:gap-2">
                Course Student Benefit Recognized
                <span className="text-accent-gold font-semibold">• {freeSessionInfo.freeSessions} Free {freeSessionInfo.freeSessions === 1 ? 'Session' : 'Sessions'} Available</span>
              </p>
              <p className="text-white/60 text-[0.72rem] sm:text-xs font-light mt-0.5">
                Included with your Mastery Course enrollment. No payment will be charged for this booking.
              </p>
            </div>
          </div>
          <span className="text-[0.65rem] uppercase tracking-wider font-semibold px-2.5 py-1 rounded bg-accent-gold text-black shrink-0 self-start sm:self-auto">
            ₹0 Complimentary
          </span>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 sm:gap-x-8 gap-y-5 sm:gap-y-6 md:gap-y-8">
        
        {/* Name */}
        <div>
          <label className="font-sans text-[0.65rem] uppercase tracking-[0.2em] font-medium text-accent-gold block mb-2 sm:mb-3">
            YOUR NAME
          </label>
          <input
            type="text"
            name="name"
            value={data.name}
            onChange={handleInputChange}
            placeholder="What should I call you?"
            className="w-full bg-transparent border border-white/10 rounded-xl px-4 sm:px-5 py-3 sm:py-4 text-sm text-white placeholder-white/30 font-light focus:outline-none focus:border-accent-gold/50 transition-colors"
          />
        </div>

        {/* Source */}
        <div>
          <label className="font-sans text-[0.65rem] uppercase tracking-[0.2em] font-medium text-accent-gold block mb-2 sm:mb-3">
            HOW DID YOU HEAR ABOUT ME? (OPTIONAL)
          </label>
          <div className="flex flex-col gap-2.5">
            <select
              name="source"
              value={data.source}
              onChange={handleInputChange}
              className="w-full bg-transparent border border-white/10 rounded-xl px-4 sm:px-5 py-3 sm:py-4 text-sm text-white/80 font-light focus:outline-none focus:border-accent-gold/50 transition-colors appearance-none cursor-pointer"
              style={{ backgroundImage: 'url("data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22292.4%22%20height%3D%22292.4%22%3E%3Cpath%20fill%3D%22%23FFFFFF40%22%20d%3D%22M287%2069.4a17.6%2017.6%200%200%200-13-5.4H18.4c-5%200-9.3%201.8-12.9%205.4A17.6%2017.6%200%200%200%200%2082.2c0%205%201.8%209.3%205.4%2012.9l128%20127.9c3.6%203.6%207.8%205.4%2012.8%205.4s9.2-1.8%2012.8-5.4L287%2095c3.5-3.5%205.4-7.8%205.4-12.8%200-5-1.9-9.2-5.5-12.8z%22%2F%3E%3C%2Fsvg%3E")', backgroundRepeat: 'no-repeat', backgroundPosition: 'right 1.2rem top 50%', backgroundSize: '0.65rem auto' }}
            >
              <option value="" disabled className="bg-[#0f0f0f] text-white/50">Select an option</option>
              <option value="social" className="bg-[#0f0f0f]">Social Media</option>
              <option value="referral" className="bg-[#0f0f0f]">Referral</option>
              <option value="search" className="bg-[#0f0f0f]">Search Engine</option>
              <option value="other" className="bg-[#0f0f0f]">Other</option>
            </select>

            {data.source === 'other' && (
              <div className="animate-in fade-in slide-in-from-top-2 duration-300">
                <input
                  type="text"
                  name="otherSource"
                  value={data.otherSource || ''}
                  onChange={handleInputChange}
                  placeholder="Please specify (e.g. YouTube, Podcast, Friend, Book...)"
                  className="w-full bg-[#121212] border border-accent-gold/40 rounded-xl px-4 sm:px-5 py-3 sm:py-3.5 text-sm text-white placeholder-white/30 font-light focus:outline-none focus:border-accent-gold transition-colors"
                  autoFocus
                />
              </div>
            )}
          </div>
        </div>

        {/* Email */}
        <div>
          <label className="font-sans text-[0.65rem] uppercase tracking-[0.2em] font-medium text-accent-gold block mb-2 sm:mb-3">
            EMAIL
          </label>
          <input
            type="email"
            name="email"
            value={data.email}
            onChange={handleInputChange}
            placeholder="your.email@example.com"
            className="w-full bg-transparent border border-white/10 rounded-xl px-4 sm:px-5 py-3 sm:py-4 text-sm text-white placeholder-white/30 font-light focus:outline-none focus:border-accent-gold/50 transition-colors"
          />
        </div>

        {/* Phone Number (Guest Only) */}
        {!isAuthenticated && (
          <div>
            <label className="font-sans text-[0.65rem] uppercase tracking-[0.2em] font-medium text-accent-gold block mb-2 sm:mb-3">
              PHONE NUMBER
            </label>
            <div className="flex items-center border border-white/10 rounded-xl px-4 sm:px-5 py-3 sm:py-4 transition-colors focus-within:border-accent-gold/50 bg-transparent">
              <select 
                name="countryCode"
                className="bg-transparent text-white/70 font-sans text-sm focus:outline-none appearance-none pr-2 cursor-pointer outline-none"
                value={data.countryCode}
                onChange={handleInputChange}
              >
                {COUNTRY_CODES.map((country, index) => (
                  <option key={`${country.code}-${index}`} value={country.code} className="bg-[#0a0a0a] text-white">
                    {country.label}
                  </option>
                ))}
              </select>
              <div className="w-[1px] h-4 bg-white/20 mx-3"></div>
              <input 
                type="tel" 
                name="phoneNumber"
                value={data.phoneNumber}
                onChange={(e) => updateData({ phoneNumber: e.target.value.replace(/\D/g, '') })}
                maxLength={10}
                className="w-full bg-transparent text-white font-sans text-sm focus:outline-none placeholder-white/30"
                placeholder="0000000000"
              />
            </div>
          </div>
        )}

        {/* Reason */}
        <div className={isAuthenticated ? "md:col-span-2" : ""}>
          <label className="font-sans text-[0.65rem] uppercase tracking-[0.2em] font-medium text-accent-gold block mb-2 sm:mb-3">
            WHAT BRINGS YOU HERE?
          </label>
          <div className="relative">
            <textarea
              name="reason"
              value={data.reason}
              onChange={handleInputChange}
              placeholder="A few words are enough."
              rows={4}
              maxLength={500}
              className="w-full bg-transparent border border-white/10 rounded-xl px-4 sm:px-5 py-3 sm:py-4 text-sm text-white placeholder-white/30 font-light focus:outline-none focus:border-accent-gold/50 transition-colors resize-none"
            />
            <div className="text-[0.65rem] text-white/30 text-right mt-1">
              {data.reason.length} / 500
            </div>
          </div>
        </div>

      </div>

      {/* Extra Textarea */}
      <div className="mt-5 sm:mt-6">
        <label className="font-sans text-[0.65rem] uppercase tracking-[0.2em] font-medium text-accent-gold block mb-2 sm:mb-3">
          ANYTHING ELSE YOU WANT ME TO KNOW? (OPTIONAL)
        </label>
        <div className="relative">
          <textarea
            name="extra"
            value={data.extra}
            onChange={handleInputChange}
            placeholder="Share anything that feels important."
            rows={3}
            maxLength={500}
            className="w-full bg-transparent border border-white/10 rounded-xl px-4 sm:px-5 py-3 sm:py-4 text-sm text-white placeholder-white/30 font-light focus:outline-none focus:border-accent-gold/50 transition-colors resize-none"
          />
          <div className="text-[0.65rem] text-white/30 text-right mt-1">
            {data.extra.length} / 500
          </div>
        </div>
      </div>

      {/* Questionnaire Banner */}
      <div className="mt-6 sm:mt-8 border border-white/5 bg-[#140e09] rounded-xl p-4 sm:p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 sm:gap-6">
        <div className="flex gap-3 sm:gap-4 items-start">
          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full border border-accent-gold/40 flex items-center justify-center shrink-0 mt-0.5 sm:mt-0">
            <Clock className="text-accent-gold text-lg sm:text-xl" weight="light" />
          </div>
          <div>
            <h4 className="text-accent-gold text-base sm:text-lg mb-1">Want to go deeper? (Optional – ~30 mins)</h4>
            <p className="text-white/60 text-xs sm:text-sm font-light">A short questionnaire to help us make the most of our time together.</p>
          </div>
        </div>
        <button className="flex items-center gap-2 text-accent-gold font-sans text-xs tracking-widest font-semibold uppercase hover:text-white transition-colors shrink-0">
          TAKE QUESTIONNAIRE
          <ArrowUpRight />
        </button>
      </div>

      {/* Bottom Action Bar */}
      <div className="mt-8 sm:mt-12 pt-6 sm:pt-8 border-t border-white/10 flex flex-col-reverse md:flex-row items-stretch md:items-center justify-between gap-3 sm:gap-4 md:gap-6">
        {onBack ? (
          <button
            onClick={onBack}
            className="flex items-center justify-center gap-2 sm:gap-3 px-6 sm:px-8 py-3.5 sm:py-4 rounded-xl border border-white/10 font-sans text-xs sm:text-sm font-light tracking-wide text-white/60 hover:text-white hover:border-white/30 transition-all w-full md:w-auto"
          >
            <ArrowLeft className="text-base sm:text-lg" />
            BACK
          </button>
        ) : (
          <div></div>
        )}
        
        <button
          onClick={handleContinue}
          disabled={!isFormValid}
          className={`flex items-center gap-2 sm:gap-3 px-6 sm:px-8 py-3.5 sm:py-4 rounded-xl font-sans text-xs sm:text-sm font-semibold tracking-wide transition-all w-full md:w-auto justify-center
            ${!isFormValid 
              ? 'bg-white/5 text-white/20 cursor-not-allowed' 
              : 'bg-accent-gold text-black hover:bg-white hover:text-black hover:-translate-y-0.5'
            }
          `}
        >
          CONTINUE TO CONFIRM
          <ArrowRight className="text-base sm:text-lg" />
        </button>
      </div>

    </div>
  );
}
