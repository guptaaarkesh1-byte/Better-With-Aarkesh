import React, { useState, useEffect, useRef } from 'react';
import { Clock, ArrowLeft, ArrowRight, ArrowUpRight, Sparkle, CheckCircle, WarningCircle, Trash } from '@phosphor-icons/react';
import { COUNTRY_CODES } from '../../utils/countryCodes';
import QuestionnaireModal from './QuestionnaireModal';
import config from '../../data/questionnaireConfig.json';
import { 
  countAnsweredQuestions, 
  clearQuestionnaireDraft, 
  buildResponseContractPayload,
  getOrCreateBookingDraftId,
  loadQuestionnaireDraft
} from '../../utils/questionnaireDraft';

export default function Step2Details({ 
  data, 
  updateData, 
  onNext, 
  onBack, 
  isAuthenticated, 
  freeSessionInfo, 
  settings = {},
  questionnaireDraft: parentDraft,
  draftId: parentDraftId,
  onUpdateDraft: parentUpdateDraft,
  onOpenLogin
}) {
  const [showQuestionnaire, setShowQuestionnaire] = useState(false);
  const [showRemoveConfirm, setShowRemoveConfirm] = useState(false);
  const openQuestionnaireBtnRef = useRef(null);

  const fallbackDraftId = useRef(getOrCreateBookingDraftId()).current;
  const activeDraftId = parentDraftId || fallbackDraftId;
  const [localDraft, setLocalDraft] = useState(() => parentDraft || loadQuestionnaireDraft(activeDraftId) || {
    booking_draft_id: activeDraftId,
    questionnaire_id: config.questionnaire_id,
    content_version: config.content_version,
    opened: false,
    last_screen: 'intro',
    answers: {}
  });

  const activeDraft = parentDraft || localDraft;

  const handleDraftUpdate = (updated) => {
    if (parentUpdateDraft) {
      parentUpdateDraft(updated);
    } else {
      setLocalDraft(updated);
    }
    const contractPayload = buildResponseContractPayload(updated, activeDraftId);
    updateData({ questionnaireAnswers: contractPayload });
  };

  const handleRemoveAnswersConfirm = () => {
    clearQuestionnaireDraft(activeDraftId);
    const freshDraft = {
      booking_draft_id: activeDraftId,
      questionnaire_id: config.questionnaire_id,
      content_version: config.content_version,
      opened: false,
      last_screen: 'intro',
      answers: {}
    };
    if (parentUpdateDraft) {
      parentUpdateDraft(freshDraft);
    } else {
      setLocalDraft(freshDraft);
    }
    updateData({ questionnaireAnswers: null });
    setShowRemoveConfirm(false);
  };

  const answeredCount = countAnsweredQuestions(activeDraft);

  const [emailError, setEmailError] = useState('');
  const [isValidatingEmail, setIsValidatingEmail] = useState(false);
  const [phoneError, setPhoneError] = useState('');
  const [isCheckingPhone, setIsCheckingPhone] = useState(false);
  
  const emailSectionRef = useRef(null);
  const emailInputRef = useRef(null);

  const scrollToEmail = () => {
    if (emailSectionRef.current) {
      emailSectionRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
    } else if (emailInputRef.current) {
      emailInputRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
    setTimeout(() => {
      emailInputRef.current?.focus({ preventScroll: true });
    }, 350);
  };

  // Standard RFC-compliant email validation (no @gmail restriction)
  const isValidEmailFormat = (email) => {
    if (!email || typeof email !== 'string') return false;
    const clean = email.trim().toLowerCase();
    const rfcRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/;
    return rfcRegex.test(clean);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    updateData({ [name]: value });
  };

  const handleEmailChange = (e) => {
    const val = e.target.value;
    updateData({ email: val });
    if (emailError) {
      if (!val.trim()) {
        setEmailError('Please enter your email address.');
      } else if (!isValidEmailFormat(val)) {
        setEmailError('Please enter a valid email address.');
      } else {
        setEmailError('');
      }
    }
  };

  // Check phone availability
  useEffect(() => {
    const checkPhone = async () => {
      const cleanPhone = (data.phoneNumber || '').replace(/\D/g, '');
      if (cleanPhone.length === 10) {
        try {
          setIsCheckingPhone(true);
          const API_URL = import.meta.env.VITE_API_URL || '';
          const res = await fetch(`${API_URL}/api/appointments/check-phone-availability`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              phoneNumber: cleanPhone,
              email: data.email
            })
          });
          const resData = await res.json();
          if (res.ok && !resData.available) {
            setPhoneError(resData.message || 'This phone number is already registered with another account.');
          } else {
            setPhoneError('');
          }
        } catch (err) {
          console.error('Phone check error:', err);
        } finally {
          setIsCheckingPhone(false);
        }
      } else {
        setPhoneError('');
      }
    };

    const timer = setTimeout(checkPhone, 400);
    return () => clearTimeout(timer);
  }, [data.phoneNumber, data.email]);

  const isEmailValid = isValidEmailFormat(data.email);

  const isFormValid =
    data.name.trim() !== '' &&
    isEmailValid &&
    data.reason.trim() !== '' &&
    (isAuthenticated || (data.phoneNumber && data.phoneNumber.length === 10 && !phoneError));

  const handleContinue = async () => {
    if (!data.name?.trim()) return;

    if (!data.email?.trim()) {
      setEmailError('Please enter your email address.');
      scrollToEmail();
      return;
    }

    if (!isValidEmailFormat(data.email)) {
      setEmailError('Please enter a valid email address.');
      scrollToEmail();
      return;
    }

    if (!isAuthenticated && (!data.phoneNumber || data.phoneNumber.length !== 10 || phoneError)) {
      return;
    }

    if (!data.reason?.trim()) return;

    // Backend email validity check (DNS MX records, disposable domain, format - NO OTP)
    try {
      setIsValidatingEmail(true);
      setEmailError('');
      const API_URL = import.meta.env.VITE_API_URL || '';
      const res = await fetch(`${API_URL}/api/auth/validate-email`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: data.email.trim().toLowerCase() })
      });

      const resData = await res.json();
      if (!res.ok || !resData.valid) {
        setEmailError(resData.message || 'Please enter a valid email address.');
        scrollToEmail();
        return;
      }

      // Email is verified valid by backend! Continue directly to next step without OTP
      onNext();
    } catch (err) {
      console.error('Email validation error:', err);
      setEmailError('Please enter a valid email address.');
      scrollToEmail();
    } finally {
      setIsValidatingEmail(false);
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
            {!/\*\s*$/.test(settings.nameLabel || '') && (
              <span className="text-red-500 font-bold ml-1" aria-hidden="true">*</span>
            )}
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
        <div ref={emailSectionRef}>
          <label className="font-sans text-[0.68rem] uppercase tracking-[0.2em] font-bold text-[#c9542f] block mb-2 sm:mb-2.5">
            {settings.emailLabel || 'EMAIL'}
            {!/\*\s*$/.test(settings.emailLabel || '') && (
              <span className="text-red-500 font-bold ml-1" aria-hidden="true">*</span>
            )}
          </label>
          <input
            ref={emailInputRef}
            type="email"
            name="email"
            value={data.email}
            onChange={handleEmailChange}
            onBlur={() => {
              if (data.email && !isValidEmailFormat(data.email)) {
                setEmailError('Please enter a valid email address.');
              }
            }}
            placeholder={settings.emailPlaceholder || "your.email@example.com"}
            className={`w-full bg-white border rounded-xl px-4 sm:px-5 py-3 sm:py-3.5 text-sm text-[#111010] placeholder-[#9c9689] font-normal focus:outline-none shadow-xs transition-colors ${
              emailError
                ? 'border-red-500 focus:border-red-500 focus:ring-1 focus:ring-red-500 bg-red-50/15'
                : 'border-black/15 focus:border-[#c9542f] focus:ring-1 focus:ring-[#c9542f]'
            }`}
          />
          {emailError && (
            <p className="text-xs text-red-600 font-sans mt-1.5 flex items-center gap-1 font-medium animate-in fade-in duration-200">
              {emailError}
            </p>
          )}
        </div>

        {/* Phone Number (Guest Only) */}
        {!isAuthenticated && (
          <div>
            <label className="font-sans text-[0.68rem] uppercase tracking-[0.2em] font-bold text-[#c9542f] block mb-2 sm:mb-2.5">
              {settings.phoneLabel || 'PHONE NUMBER'}
              {!/\*\s*$/.test(settings.phoneLabel || '') && (
                <span className="text-red-500 font-bold ml-1" aria-hidden="true">*</span>
              )}
            </label>
            <div className={`flex items-center border rounded-xl px-4 sm:px-5 py-3 sm:py-3.5 transition-colors bg-white shadow-xs ${
              phoneError
                ? 'border-red-500 focus-within:border-red-500 focus-within:ring-1 focus-within:ring-red-500 bg-red-50/15'
                : 'border-black/15 focus-within:border-[#c9542f] focus-within:ring-1 focus-within:ring-[#c9542f]'
            }`}>
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
                onChange={(e) => updateData({ phoneNumber: e.target.value.replace(/\D/g, '').slice(0, 10) })}
                maxLength={10}
                className="w-full bg-transparent text-[#111010] font-sans text-sm focus:outline-none placeholder-[#9c9689]"
                placeholder={settings.phonePlaceholder || "0000000000"}
              />
            </div>
            {phoneError && (
              <div className="mt-1.5 space-y-1 animate-in fade-in duration-200">
                <p className="text-xs text-red-600 font-sans flex items-center gap-1 font-medium">
                  {phoneError}
                </p>
                <p className="text-xs text-[#555047] font-sans">
                  Please{' '}
                  <button
                    type="button"
                    onClick={() => {
                      if (onOpenLogin) {
                        onOpenLogin(data.phoneNumber, data.email);
                      }
                    }}
                    className="text-[#c9542f] font-semibold underline underline-offset-2 hover:text-[#9e3a1b] cursor-pointer transition-colors"
                  >
                    login
                  </button>{' '}
                  with registered account.
                </p>
              </div>
            )}
          </div>
        )}

        {/* Reason */}
        <div className={isAuthenticated ? "md:col-span-2" : ""}>
          <label className="font-sans text-[0.68rem] uppercase tracking-[0.2em] font-bold text-[#c9542f] block mb-2 sm:mb-2.5">
            {settings.reasonLabel || 'WHAT BRINGS YOU HERE?'}
            {!/\*\s*$/.test(settings.reasonLabel || '') && (
              <span className="text-red-500 font-bold ml-1" aria-hidden="true">*</span>
            )}
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

      {/* Questionnaire Card (Optional 45-Question Coaching Questionnaire) */}
      <div
        className={`mt-6 sm:mt-8 border rounded-2xl p-4 sm:p-6 lg:p-7 flex flex-col sm:flex-row sm:items-center justify-between gap-4 sm:gap-6 transition-all duration-300 shadow-xs ${
          answeredCount > 0
            ? 'border-[#e8c4e2] bg-[#fbf0eb]'
            : 'border-black/10 bg-white/95'
        }`}
      >
        <div className="flex flex-col sm:flex-row gap-3.5 sm:gap-4 items-start flex-1 min-w-0">
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <div className={`w-9 h-9 sm:w-11 sm:h-11 rounded-full border flex items-center justify-center shrink-0 transition-all duration-300 shadow-xs ${
              answeredCount > 0 ? 'border-[#e8c4e2] bg-white' : 'border-black/10 bg-[#faf7f2]'
            }`}>
              {answeredCount > 0
                ? <CheckCircle className="text-[#c9542f]" size={20} weight="fill" />
                : <Sparkle className="text-[#c9542f] text-lg sm:text-xl" weight="fill" />
              }
            </div>
            <div className="sm:hidden flex-1 min-w-0">
              <h4 className="text-[#111010] font-serif font-medium text-base leading-tight">
                {config.copy?.card_title || 'Want to go deeper?'}
              </h4>
            </div>
          </div>

          <div className="space-y-2 flex-1 min-w-0">
            <div className="hidden sm:flex flex-wrap items-center gap-2">
              <h4 className="text-[#111010] font-serif font-medium text-base sm:text-lg">
                {config.copy?.card_title || 'Want to go deeper?'}
              </h4>
              <span className="font-sans text-[0.65rem] uppercase tracking-wider font-bold px-2.5 py-0.5 rounded-full bg-black/5 text-[#7a756b]">
                Optional • 45 Questions • ~25–35 mins
              </span>
            </div>

            <div className="sm:hidden flex flex-wrap gap-1.5 pt-0.5">
              <span className="font-sans text-[0.62rem] uppercase tracking-wide font-bold px-2.5 py-0.5 rounded-full bg-black/5 text-[#7a756b]">
                Optional
              </span>
              <span className="font-sans text-[0.62rem] uppercase tracking-wide font-bold px-2.5 py-0.5 rounded-full bg-black/5 text-[#7a756b]">
                45 Questions
              </span>
              <span className="font-sans text-[0.62rem] uppercase tracking-wide font-bold px-2.5 py-0.5 rounded-full bg-black/5 text-[#7a756b]">
                ~25–35 mins
              </span>
            </div>

            <p className="text-[#555047] text-xs sm:text-sm font-light leading-relaxed">
              {config.copy?.card_description ||
                'An optional questionnaire to help me prepare for our conversation. There are 45 questions, and every question can be skipped. Allow around 25–35 minutes if you choose to answer them all.'}
            </p>

            {answeredCount > 0 && (
              <p className="text-xs font-semibold text-[#c9542f]">
                ✓ {answeredCount} of 45 answers currently saved in this tab.
              </p>
            )}
          </div>
        </div>

        <div className="flex flex-col sm:items-end gap-2 shrink-0 w-full sm:w-auto pt-1 sm:pt-0">
          <button
            ref={openQuestionnaireBtnRef}
            type="button"
            onClick={() => setShowQuestionnaire(true)}
            className="flex items-center justify-center gap-2 px-5 py-3.5 sm:py-3 rounded-xl bg-[#111010] hover:bg-[#c9542f] text-white font-sans text-xs tracking-wider font-bold uppercase transition-all shadow-xs cursor-pointer w-full sm:w-auto"
          >
            <span>
              {activeDraft?.last_screen === 'review'
                ? (config.copy?.review_button || 'Review answers')
                : answeredCount > 0
                ? `${config.copy?.resume_button || 'Continue questionnaire'} (${answeredCount} answered)`
                : activeDraft?.opened
                ? (config.copy?.resume_button || 'Continue questionnaire')
                : (config.copy?.start_button || 'Start optional questionnaire')}
            </span>
            <ArrowUpRight size={15} weight="bold" />
          </button>

          {(answeredCount > 0 || activeDraft?.opened) && (
            <button
              type="button"
              onClick={() => setShowRemoveConfirm(true)}
              className="text-[0.72rem] text-[#7a756b] hover:text-red-700 underline font-medium self-center sm:self-end transition-colors cursor-pointer"
            >
              {config.copy?.remove_answers_button || 'Remove questionnaire answers'}
            </button>
          )}
        </div>
      </div>

      {/* Confirmation Modal for Remove Questionnaire Answers */}
      {showRemoveConfirm && (
        <div 
          className="fixed inset-0 z-[999999] flex items-center justify-center p-4"
          style={{ backgroundColor: 'rgba(17, 16, 16, 0.65)', backdropFilter: 'blur(4px)' }}
          role="dialog"
          aria-modal="true"
        >
          <div className="bg-[#f5f1e8] border border-black/15 rounded-2xl p-6 max-w-md w-full shadow-2xl space-y-4">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-full bg-red-100 text-red-700 flex items-center justify-center shrink-0">
                <WarningCircle size={22} weight="bold" />
              </div>
              <div className="space-y-1">
                <h5 className="font-serif text-lg text-[#111010] font-normal">Remove Questionnaire Answers?</h5>
                <p className="text-xs sm:text-sm text-[#555047] leading-relaxed">
                  This will clear all 45 questionnaire questions and remove your draft from this tab. Your name, email, and selected appointment slot will remain intact.
                </p>
              </div>
            </div>
            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowRemoveConfirm(false)}
                className="px-4 py-2 rounded-xl border border-black/15 bg-white text-xs font-semibold text-[#111010] hover:bg-black/5 cursor-pointer"
              >
                Keep Answers
              </button>
              <button
                type="button"
                onClick={handleRemoveAnswersConfirm}
                className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold uppercase tracking-wider cursor-pointer"
              >
                Yes, Remove Answers
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Questionnaire Modal */}
      <QuestionnaireModal
        isOpen={showQuestionnaire}
        onClose={() => setShowQuestionnaire(false)}
        draft={activeDraft}
        draftId={activeDraftId}
        onUpdateDraft={handleDraftUpdate}
        triggerRef={openQuestionnaireBtnRef}
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
          disabled={!isFormValid || isValidatingEmail}
          className={`flex items-center gap-2 sm:gap-3 px-6 sm:px-8 py-3.5 sm:py-4 rounded-xl font-sans text-xs sm:text-sm font-bold tracking-wider uppercase transition-all w-full md:w-auto justify-center cursor-pointer
            ${!isFormValid || isValidatingEmail
              ? 'bg-black/5 text-black/30 border border-black/10 cursor-not-allowed' 
              : 'bg-[#111010] text-white hover:bg-[#c9542f] shadow-md hover:-translate-y-0.5'
            }
          `}
        >
          {isValidatingEmail ? (
            <>
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              <span>CHECKING EMAIL...</span>
            </>
          ) : (
            <>
              <span>{settings.continueButtonText || 'CONTINUE TO CONFIRMATION'}</span>
              <ArrowRight className="text-base sm:text-lg" weight="bold" />
            </>
          )}
        </button>
      </div>

    </div>
  );
}
