import React, { useState } from 'react';
import { Clock, ArrowLeft, ArrowRight, ArrowUpRight, Sparkle, CheckCircle } from '@phosphor-icons/react';
import { COUNTRY_CODES } from '../../utils/countryCodes';
import QuestionnaireModal from './QuestionnaireModal';

export default function Step2Details({ data, updateData, onNext, onBack, isAuthenticated, freeSessionInfo, settings = {} }) {
  const [showQuestionnaire, setShowQuestionnaire] = useState(false);
  const [questionnaireCompleted, setQuestionnaireCompleted] = useState(false);
  const [questionnaireAnswers, setQuestionnaireAnswers] = useState({});

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    updateData({ [name]: value });
  };

  const handleQuestionnaireComplete = (answers) => {
    setQuestionnaireAnswers(answers);
    setQuestionnaireCompleted(true);
    // Store answers in booking data
    updateData({ questionnaireAnswers: answers });
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
      <style>{`
        input:-webkit-autofill,
        input:-webkit-autofill:hover, 
        input:-webkit-autofill:focus, 
        input:-webkit-autofill:active,
        textarea:-webkit-autofill,
        select:-webkit-autofill {
          -webkit-box-shadow: 0 0 0 1000px #ffffff inset !important;
          box-shadow: 0 0 0 1000px #ffffff inset !important;
          -webkit-text-fill-color: #111010 !important;
          color: #111010 !important;
          caret-color: #111010 !important;
          transition: background-color 5000s ease-in-out 0s;
        }
      `}</style>
      
      {/* Course Student Free Session Banner */}
      {freeSessionInfo?.hasFreeSessions && freeSessionInfo.freeSessions > 0 && (
        <div className="mb-6 sm:mb-8 p-4 rounded-2xl border border-[#e8c4e2] bg-[#fbf0eb] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4 shadow-xs">
          <div className="flex items-start sm:items-center gap-3 sm:gap-3.5">
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-white border border-[#e8c4e2] flex items-center justify-center text-[#c9542f] shrink-0 mt-0.5 sm:mt-0 shadow-xs">
              <Sparkle size={16} weight="fill" className="sm:w-[18px] sm:h-[18px]" />
            </div>
            <div>
              <p className="text-[#111010] text-xs font-semibold flex flex-wrap items-center gap-1.5 sm:gap-2">
                Course Student Benefit Recognized
                <span className="text-[#c9542f] font-bold">• {freeSessionInfo.freeSessions} Free {freeSessionInfo.freeSessions === 1 ? 'Session' : 'Sessions'} Available</span>
              </p>
              <p className="text-[#555047] text-[0.75rem] sm:text-xs font-normal mt-0.5">
                Included with your Mastery Course enrollment. No payment will be charged for this booking.
              </p>
            </div>
          </div>
          <span className="text-[0.65rem] uppercase tracking-wider font-bold px-2.5 py-1 rounded bg-[#c9542f] text-white shrink-0 self-start sm:self-auto shadow-xs">
            ₹0 Complimentary
          </span>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 sm:gap-x-8 gap-y-5 sm:gap-y-6 md:gap-y-8">
        
        {/* Name */}
        <div>
          <label className="font-sans text-[0.68rem] uppercase tracking-[0.2em] font-bold text-[#c9542f] block mb-2 sm:mb-2.5">
            {settings.nameLabel || 'YOUR NAME'}
          </label>
          <input
            type="text"
            name="name"
            value={data.name}
            onChange={handleInputChange}
            placeholder={settings.namePlaceholder || "What should I call you?"}
            className="w-full bg-white border border-black/15 rounded-xl px-4 sm:px-5 py-3 sm:py-3.5 text-sm text-[#111010] placeholder-[#9c9689] font-normal focus:outline-none focus:border-[#c9542f] focus:ring-1 focus:ring-[#c9542f] shadow-xs transition-colors"
          />
        </div>

        {/* Source */}
        <div>
          <label className="font-sans text-[0.68rem] uppercase tracking-[0.2em] font-bold text-[#c9542f] block mb-2 sm:mb-2.5">
            {settings.sourceLabel || 'HOW DID YOU HEAR ABOUT ME? (OPTIONAL)'}
          </label>
          <div className="flex flex-col gap-2.5">
            <select
              name="source"
              value={data.source}
              onChange={handleInputChange}
              className="w-full bg-white border border-black/15 rounded-xl px-4 sm:px-5 py-3 sm:py-3.5 text-sm text-[#111010] font-normal focus:outline-none focus:border-[#c9542f] focus:ring-1 focus:ring-[#c9542f] shadow-xs transition-colors appearance-none cursor-pointer"
              style={{ backgroundImage: 'url("data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22292.4%22%20height%3D%22292.4%22%3E%3Cpath%20fill%3D%22%23802673%22%20d%3D%22M287%2069.4a17.6%2017.6%200%200%200-13-5.4H18.4c-5%200-9.3%201.8-12.9%205.4A17.6%2017.6%200%200%200%200%2082.2c0%205%201.8%209.3%205.4%2012.9l128%20127.9c3.6%203.6%207.8%205.4%2012.8%205.4s9.2-1.8%2012.8-5.4L287%2095c3.5-3.5%205.4-7.8%205.4-12.8%200-5-1.9-9.2-5.5-12.8z%22%2F%3E%3C%2Fsvg%3E")', backgroundRepeat: 'no-repeat', backgroundPosition: 'right 1.2rem top 50%', backgroundSize: '0.65rem auto' }}
            >
              <option value="" disabled className="bg-white text-[#7a756b]">{settings.sourcePlaceholder || 'Select an option'}</option>
              <option value="social" className="bg-white">Social Media</option>
              <option value="referral" className="bg-white">Referral</option>
              <option value="search" className="bg-white">Search Engine</option>
              <option value="other" className="bg-white">Other</option>
            </select>

            {data.source === 'other' && (
              <div className="animate-in fade-in slide-in-from-top-2 duration-300">
                <input
                  type="text"
                  name="otherSource"
                  value={data.otherSource || ''}
                  onChange={handleInputChange}
                  placeholder={settings.otherSourcePlaceholder || "Please specify (e.g. YouTube, Podcast, Friend, Book...)"}
                  className="w-full bg-white border border-[#c9542f] rounded-xl px-4 sm:px-5 py-3 text-sm text-[#111010] placeholder-[#9c9689] font-normal focus:outline-none focus:ring-1 focus:ring-[#c9542f] shadow-xs transition-colors"
                  autoFocus
                />
              </div>
            )}
          </div>
        </div>

        {/* Email */}
        <div>
          <label className="font-sans text-[0.68rem] uppercase tracking-[0.2em] font-bold text-[#c9542f] block mb-2 sm:mb-2.5">
            {settings.emailLabel || 'EMAIL'}
          </label>
          <input
            type="email"
            name="email"
            value={data.email}
            onChange={handleInputChange}
            placeholder={settings.emailPlaceholder || "your.email@example.com"}
            className="w-full bg-white border border-black/15 rounded-xl px-4 sm:px-5 py-3 sm:py-3.5 text-sm text-[#111010] placeholder-[#9c9689] font-normal focus:outline-none focus:border-[#c9542f] focus:ring-1 focus:ring-[#c9542f] shadow-xs transition-colors"
          />
        </div>

        {/* Phone Number (Guest Only) */}
        {!isAuthenticated && (
          <div>
            <label className="font-sans text-[0.68rem] uppercase tracking-[0.2em] font-bold text-[#c9542f] block mb-2 sm:mb-2.5">
              {settings.phoneLabel || 'PHONE NUMBER'}
            </label>
            <div className="flex items-center border border-black/15 rounded-xl px-4 sm:px-5 py-3 sm:py-3.5 transition-colors focus-within:border-[#c9542f] focus-within:ring-1 focus-within:ring-[#c9542f] bg-white shadow-xs">
              <select 
                name="countryCode"
                className="bg-transparent text-[#111010] font-sans text-sm focus:outline-none appearance-none pr-2 cursor-pointer outline-none font-medium"
                value={data.countryCode}
                onChange={handleInputChange}
              >
                {COUNTRY_CODES.map((country, index) => (
                  <option key={`${country.code}-${index}`} value={country.code} className="bg-white text-[#111010]">
                    {country.label}
                  </option>
                ))}
              </select>
              <div className="w-[1px] h-4 bg-black/20 mx-3"></div>
              <input 
                type="tel" 
                name="phoneNumber"
                value={data.phoneNumber}
                onChange={(e) => updateData({ phoneNumber: e.target.value.replace(/\D/g, '') })}
                maxLength={10}
                className="w-full bg-transparent text-[#111010] font-sans text-sm focus:outline-none placeholder-[#9c9689]"
                placeholder={settings.phonePlaceholder || "0000000000"}
              />
            </div>
          </div>
        )}

        {/* Reason */}
        <div className={isAuthenticated ? "md:col-span-2" : ""}>
          <label className="font-sans text-[0.68rem] uppercase tracking-[0.2em] font-bold text-[#c9542f] block mb-2 sm:mb-2.5">
            {settings.reasonLabel || 'WHAT BRINGS YOU HERE?'}
          </label>
          <div className="relative">
            <textarea
              name="reason"
              value={data.reason}
              onChange={handleInputChange}
              placeholder={settings.reasonPlaceholder || "A few words are enough."}
              rows={4}
              maxLength={500}
              className="w-full bg-white border border-black/15 rounded-xl px-4 sm:px-5 py-3 sm:py-3.5 text-sm text-[#111010] placeholder-[#9c9689] font-normal focus:outline-none focus:border-[#c9542f] focus:ring-1 focus:ring-[#c9542f] shadow-xs transition-colors resize-none"
            />
            <div className="text-[0.68rem] text-[#7a756b] text-right mt-1">
              {data.reason.length} / 500
            </div>
          </div>
        </div>

      </div>

      {/* Extra Textarea */}
      <div className="mt-5 sm:mt-6">
        <label className="font-sans text-[0.68rem] uppercase tracking-[0.2em] font-bold text-[#c9542f] block mb-2 sm:mb-2.5">
          {settings.extraLabel || 'ANYTHING ELSE I SHOULD KNOW? (OPTIONAL)'}
        </label>
        <div className="relative">
          <textarea
            name="extra"
            value={data.extra}
            onChange={handleInputChange}
            placeholder={settings.extraPlaceholder || "Share anything that feels important."}
            rows={3}
            maxLength={500}
            className="w-full bg-white border border-black/15 rounded-xl px-4 sm:px-5 py-3 sm:py-3.5 text-sm text-[#111010] placeholder-[#9c9689] font-normal focus:outline-none focus:border-[#c9542f] focus:ring-1 focus:ring-[#c9542f] shadow-xs transition-colors resize-none"
          />
          <div className="text-[0.68rem] text-[#7a756b] text-right mt-1">
            {data.extra.length} / 500
          </div>
        </div>
      </div>

      {/* Questionnaire Banner */}
      <div
        className={`mt-6 sm:mt-8 border rounded-2xl p-4 sm:p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 sm:gap-6 transition-all duration-300 shadow-sm ${
          questionnaireCompleted
            ? 'border-[#e8c4e2] bg-[#fbf0eb]'
            : 'border-black/10 bg-white/90'
        }`}
      >
        <div className="flex gap-3 sm:gap-4 items-start">
          <div className={`w-9 h-9 sm:w-10 sm:h-10 rounded-full border flex items-center justify-center shrink-0 mt-0.5 sm:mt-0 transition-all duration-300 shadow-xs ${
            questionnaireCompleted ? 'border-[#e8c4e2] bg-white' : 'border-[#e8c4e2] bg-[#fbf0eb]'
          }`}>
            {questionnaireCompleted
              ? <CheckCircle className="text-[#c9542f]" size={20} weight="fill" />
              : <Clock className="text-[#c9542f] text-lg sm:text-xl" weight="light" />
            }
          </div>
          <div>
            <h4 className="text-[#111010] font-serif font-normal text-base sm:text-lg mb-1">
              {questionnaireCompleted
                ? (settings.questionnaireCompletedText || 'Questionnaire Completed')
                : (settings.questionnaireBannerTitle || 'Want to go deeper? (Optional – ~30 mins)')
              }
            </h4>
            <p className="text-[#555047] text-xs sm:text-sm font-light">
              {questionnaireCompleted
                ? 'Your answers have been saved. They\'ll help make our session more meaningful.'
                : (settings.questionnaireBannerSubtitle || 'A short questionnaire to help us make the most of our time together.')
              }
            </p>
          </div>
        </div>
        <button
          onClick={() => setShowQuestionnaire(true)}
          className={`flex items-center gap-2 font-sans text-xs tracking-widest font-bold uppercase transition-colors shrink-0 cursor-pointer ${
            questionnaireCompleted
              ? 'text-[#7a756b] hover:text-[#111010]'
              : 'text-[#c9542f] hover:text-[#111010]'
          }`}
        >
          {questionnaireCompleted ? 'RETAKE' : (settings.questionnaireBannerButtonText || 'TAKE QUESTIONNAIRE')}
          <ArrowUpRight size={16} weight="bold" />
        </button>
      </div>

      {/* Questionnaire Modal */}
      <QuestionnaireModal
        isOpen={showQuestionnaire}
        onClose={() => setShowQuestionnaire(false)}
        onComplete={(answers) => {
          handleQuestionnaireComplete(answers);
          setShowQuestionnaire(false);
        }}
      />

      {/* Bottom Action Bar */}
      <div className="mt-8 sm:mt-12 pt-6 sm:pt-8 border-t border-black/10 flex flex-col-reverse md:flex-row items-stretch md:items-center justify-between gap-3 sm:gap-4 md:gap-6">
        {onBack ? (
          <button
            onClick={onBack}
            className="flex items-center justify-center gap-2 sm:gap-3 px-6 sm:px-8 py-3.5 sm:py-4 rounded-xl border border-black/10 hover:border-[#c9542f]/40 bg-white/90 hover:bg-white font-sans text-xs sm:text-sm font-semibold tracking-wide text-[#111010] transition-all w-full md:w-auto shadow-xs cursor-pointer"
          >
            <ArrowLeft className="text-base sm:text-lg text-[#c9542f]" />
            {settings.backButtonText || 'BACK'}
          </button>
        ) : (
          <div></div>
        )}
        
        <button
          onClick={handleContinue}
          disabled={!isFormValid}
          className={`flex items-center gap-2 sm:gap-3 px-6 sm:px-8 py-3.5 sm:py-4 rounded-xl font-sans text-xs sm:text-sm font-bold tracking-wider uppercase transition-all w-full md:w-auto justify-center cursor-pointer
            ${!isFormValid 
              ? 'bg-black/5 text-black/30 border border-black/10 cursor-not-allowed' 
              : 'bg-[#111010] text-white hover:bg-[#c9542f] shadow-md hover:-translate-y-0.5'
            }
          `}
        >
          {settings.continueButtonText || 'CONTINUE TO CONFIRMATION'}
          <ArrowRight className="text-base sm:text-lg" weight="bold" />
        </button>
      </div>

    </div>
  );
}
