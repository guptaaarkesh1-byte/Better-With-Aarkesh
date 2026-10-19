import React, { useState, useEffect, useRef, useId } from 'react';
import { createPortal } from 'react-dom';
import { 
  X, 
  ArrowLeft, 
  ArrowRight, 
  Check, 
  Question, 
  Sparkle, 
  ShieldCheck, 
  CaretDown, 
  CaretUp, 
  PencilSimple, 
  ArrowClockwise,
  WarningCircle,
  FileText
} from '@phosphor-icons/react';
import config from '../../data/questionnaireConfig.json';
import { getAllQuestions, saveQuestionnaireDraft, countAnsweredQuestions } from '../../utils/questionnaireDraft';

export default function QuestionnaireModal({
  isOpen,
  onClose,
  draft,
  draftId,
  onUpdateDraft,
  triggerRef
}) {
  const allQuestions = getAllQuestions();
  const totalQuestions = allQuestions.length; // 45

  // Local navigation state: 'intro' | number 0..44 | 'review'
  const [screen, setScreen] = useState('intro');
  const [skipConfirmTarget, setSkipConfirmTarget] = useState(null); // questionId pending skip confirmation
  const [limitWarning, setLimitWarning] = useState('');
  const [previewQ16Open, setPreviewQ16Open] = useState(false);
  const [storageErrorNotice, setStorageErrorNotice] = useState('');

  const modalRef = useRef(null);
  const scrollContainerRef = useRef(null);
  const headingRef = useRef(null);
  const titleId = useId();

  // Restore screen position from draft when opened
  useEffect(() => {
    if (isOpen) {
      if (draft?.last_screen !== undefined && draft?.last_screen !== null) {
        setScreen(draft.last_screen);
      } else {
        setScreen('intro');
      }
      setLimitWarning('');
      setSkipConfirmTarget(null);
    }
  }, [isOpen]);

  // W3C Modal accessibility: Inert background and focus trapping
  useEffect(() => {
    if (!isOpen) return;

    // Prevent body scrolling
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    // Mark main root inert for assistive tech
    const rootEl = document.getElementById('root');
    if (rootEl) {
      rootEl.setAttribute('aria-hidden', 'true');
      rootEl.inert = true;
    }

    // Focus inside modal
    const focusTimer = setTimeout(() => {
      if (headingRef.current) {
        headingRef.current.focus();
      } else if (modalRef.current) {
        modalRef.current.focus();
      }
    }, 50);

    // Escape key handler: Save and return to booking
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        handleSaveAndReturn();
        return;
      }

      // Tab trap
      if (e.key === 'Tab' && modalRef.current) {
        const focusable = modalRef.current.querySelectorAll(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        if (focusable.length === 0) return;
        const first = focusable[0];
        const last = focusable[focusable.length - 1];

        if (e.shiftKey) {
          if (document.activeElement === first) {
            e.preventDefault();
            last.focus();
          }
        } else {
          if (document.activeElement === last) {
            e.preventDefault();
            first.focus();
          }
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = originalOverflow;
      if (rootEl) {
        rootEl.removeAttribute('aria-hidden');
        rootEl.inert = false;
      }
      window.removeEventListener('keydown', handleKeyDown);
      // Restore focus to opening button
      if (triggerRef && triggerRef.current) {
        try {
          triggerRef.current.focus();
        } catch (e) {}
      }
    };
  }, [isOpen]);

  // On screen change: reset scroll position and focus heading
  useEffect(() => {
    if (!isOpen) return;
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTop = 0;
    }
    const timer = setTimeout(() => {
      if (headingRef.current) {
        headingRef.current.focus();
      }
    }, 40);
    setLimitWarning('');
    setSkipConfirmTarget(null);
    return () => clearTimeout(timer);
  }, [screen, isOpen]);

  if (!isOpen) return null;

  const answers = draft?.answers || {};
  const answeredCount = countAnsweredQuestions(draft);

  // Helper to persist answer updates to draft
  const updateAnswer = (questionId, newAnswerObj) => {
    const updatedDraft = {
      ...(draft || {}),
      booking_draft_id: draftId,
      questionnaire_id: config.questionnaire_id,
      content_version: config.content_version,
      opened: true,
      last_screen: screen,
      answers: {
        ...(draft?.answers || {}),
        [questionId]: newAnswerObj
      }
    };

    if (onUpdateDraft) {
      onUpdateDraft(updatedDraft);
    }
    const res = saveQuestionnaireDraft(draftId, updatedDraft);
    if (!res.storageAvailable) {
      setStorageErrorNotice('Draft storage is not available in your browser. Progress is kept in memory for this session, but refreshing the page may lose your answers.');
    }
  };

  const handleSaveAndReturn = () => {
    // Record current screen before closing
    if (draft && onUpdateDraft) {
      const updatedDraft = {
        ...draft,
        last_screen: screen,
        opened: true
      };
      onUpdateDraft(updatedDraft);
      saveQuestionnaireDraft(draftId, updatedDraft);
    }
    onClose();
  };

  // Current question data when screen is a numeric index
  const isQuestionScreen = typeof screen === 'number';
  const currentQIndex = isQuestionScreen ? screen : 0;
  const currentQ = allQuestions[currentQIndex] || allQuestions[0];
  const currentAnswer = currentQ ? answers[currentQ.id] : null;

  // Check if current question is the first in its section
  const isFirstInSection = currentQIndex === 0 || (
    currentQ && allQuestions[currentQIndex - 1]?.sectionId !== currentQ.sectionId
  );

  // Check if question has a non-empty answer entered
  const hasExistingAnswer = (q, ans) => {
    if (!ans || ans.state !== 'answered') return false;
    if (q.type === 'long_text') {
      return typeof ans.text === 'string' && ans.text.trim().length > 0;
    }
    if (Array.isArray(ans.selected_option_ids) && ans.selected_option_ids.length > 0) {
      return true;
    }
    return false;
  };

  // --- Actions for Multi-Select Checkboxes ---
  const handleToggleMulti = (opt) => {
    setLimitWarning('');
    const prevIds = Array.isArray(currentAnswer?.selected_option_ids)
      ? [...currentAnswer.selected_option_ids]
      : [];
    const prevWriteIns = { ...(currentAnswer?.other_text_by_option_id || {}) };

    const isCurrentlySelected = prevIds.includes(opt.id);

    if (isCurrentlySelected) {
      // Deselect option
      const newIds = prevIds.filter((id) => id !== opt.id);
      delete prevWriteIns[opt.id]; // Strip write-in text on deselect
      const newState = newIds.length > 0 ? 'answered' : 'unanswered';
      updateAnswer(currentQ.id, {
        question_id: currentQ.id,
        state: newState,
        selected_option_ids: newIds,
        text: null,
        other_text_by_option_id: prevWriteIns
      });
      return;
    }

    // User is selecting an option
    // Check if selecting an exclusive option
    if (opt.exclusive) {
      updateAnswer(currentQ.id, {
        question_id: currentQ.id,
        state: 'answered',
        selected_option_ids: [opt.id],
        text: null,
        other_text_by_option_id: {}
      });
      return;
    }

    // Selecting a regular option: clear any exclusive options already selected
    const nonExclusiveIds = prevIds.filter((id) => {
      const optionDef = currentQ.options?.find((o) => o.id === id);
      return !optionDef?.exclusive;
    });

    // Check selection limit
    const max = currentQ.max_selections;
    if (max && nonExclusiveIds.length >= max) {
      const limitTemplate = config.copy?.selection_limit_error || 'Choose up to {max} options. Deselect one to choose another.';
      setLimitWarning(limitTemplate.replace('{max}', max.toString()));
      return;
    }

    const newIds = [...nonExclusiveIds, opt.id];
    updateAnswer(currentQ.id, {
      question_id: currentQ.id,
      state: 'answered',
      selected_option_ids: newIds,
      text: null,
      other_text_by_option_id: prevWriteIns
    });
  };

  // --- Action for Single Choice (Radio) & Frequency & Confidence Q39 ---
  const handleSelectRadio = (opt) => {
    setLimitWarning('');
    const prevWriteIns = { ...(currentAnswer?.other_text_by_option_id || {}) };
    
    // Clean up write-ins for options not matching the new selection
    const cleanWriteIns = {};
    if (opt.write_in && prevWriteIns[opt.id]) {
      cleanWriteIns[opt.id] = prevWriteIns[opt.id];
    }

    updateAnswer(currentQ.id, {
      question_id: currentQ.id,
      state: 'answered',
      selected_option_ids: [opt.id],
      text: null,
      other_text_by_option_id: cleanWriteIns
    });
  };

  // --- Action for Text Area (long_text) ---
  const handleTextChange = (e) => {
    const textVal = e.target.value.slice(0, 2000);
    const hasText = textVal.trim().length > 0;
    updateAnswer(currentQ.id, {
      question_id: currentQ.id,
      state: hasText ? 'answered' : 'unanswered',
      selected_option_ids: [],
      text: textVal,
      other_text_by_option_id: {}
    });
  };

  // --- Action for Write-In Detail ---
  const handleWriteInChange = (optId, textVal) => {
    const cleanText = textVal.slice(0, 300);
    const prevWriteIns = { ...(currentAnswer?.other_text_by_option_id || {}) };
    prevWriteIns[optId] = cleanText;

    updateAnswer(currentQ.id, {
      question_id: currentQ.id,
      state: 'answered',
      selected_option_ids: currentAnswer?.selected_option_ids || [optId],
      text: null,
      other_text_by_option_id: prevWriteIns
    });
  };

  // --- Navigation Controls ---
  const handleNext = () => {
    // If blank/unanswered, mark as skipped as specified by contract
    if (!hasExistingAnswer(currentQ, currentAnswer)) {
      updateAnswer(currentQ.id, {
        question_id: currentQ.id,
        state: 'skipped',
        selected_option_ids: [],
        text: null,
        other_text_by_option_id: {}
      });
    }

    if (currentQIndex < totalQuestions - 1) {
      setScreen(currentQIndex + 1);
    } else {
      setScreen('review');
    }
  };

  const handleBack = () => {
    if (currentQIndex > 0) {
      setScreen(currentQIndex - 1);
    } else {
      setScreen('intro');
    }
  };

  const handleSkipClick = () => {
    if (hasExistingAnswer(currentQ, currentAnswer)) {
      setSkipConfirmTarget(currentQ.id);
    } else {
      executeSkip();
    }
  };

  const executeSkip = () => {
    updateAnswer(currentQ.id, {
      question_id: currentQ.id,
      state: 'skipped',
      selected_option_ids: [],
      text: null,
      other_text_by_option_id: {}
    });
    setSkipConfirmTarget(null);
    if (currentQIndex < totalQuestions - 1) {
      setScreen(currentQIndex + 1);
    } else {
      setScreen('review');
    }
  };

  const privacyUrl = import.meta.env.VITE_PRIVACY_POLICY_URL || '/privacy-policy';

  // Preview text for Q16 (referenced on Q17-Q20)
  const q16AnswerText = answers['q16']?.text?.trim() || '';

  return createPortal(
    <div
      className="fixed inset-0 z-[99999] flex items-center justify-center p-0 sm:p-4 md:p-6 h-[100dvh] w-full"
      style={{ backgroundColor: 'rgba(17, 16, 16, 0.65)', backdropFilter: 'blur(6px)' }}
      // Backdrop click explicitly does NOTHING per spec
      onClick={(e) => e.stopPropagation()}
    >
      <div
        ref={modalRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        tabIndex="-1"
        className="relative w-full max-w-[840px] h-[100dvh] sm:h-auto sm:max-h-[90vh] bg-[#f5f1e8] text-[#111010] sm:rounded-3xl shadow-2xl flex flex-col overflow-hidden border border-black/10 focus:outline-none"
      >
        {/* TOP HEADER BAR */}
        <div className="shrink-0 px-3.5 sm:px-6 py-2.5 sm:py-3.5 bg-[#f5f1e8] border-b border-black/10 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0">
            <span className="w-2 h-2 rounded-full bg-[#c9542f] shrink-0" />
            <h1 id={titleId} className="font-sans text-[0.68rem] sm:text-xs tracking-wider uppercase font-bold text-[#7a756b] truncate">
              {config.title || 'Optional Coaching Questionnaire'}
            </h1>
          </div>

          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            {isQuestionScreen && (
              <span className="font-sans text-[0.68rem] sm:text-xs text-[#555047] bg-black/5 px-2.5 py-1 rounded-full font-medium whitespace-nowrap">
                {answeredCount} <span className="hidden xs:inline">answered</span>
              </span>
            )}
            <button
              onClick={handleSaveAndReturn}
              aria-label="Save and return to booking"
              className="flex items-center gap-1.5 text-xs font-semibold text-[#111010] hover:text-[#c9542f] bg-black/5 hover:bg-black/10 px-2.5 sm:px-3 py-1.5 rounded-full transition-colors cursor-pointer whitespace-nowrap"
            >
              <span>Save & Close</span>
              <X size={14} weight="bold" />
            </button>
          </div>
        </div>

        {/* PROGRESS BAR (when on questions) */}
        {isQuestionScreen && (
          <div className="w-full bg-black/5 h-1.5 relative">
            <div
              className="bg-[#c9542f] h-full transition-all duration-300 ease-out"
              style={{ width: `${((currentQIndex + 1) / totalQuestions) * 100}%` }}
              role="progressbar"
              aria-label={`Question position ${currentQIndex + 1} of ${totalQuestions}`}
              aria-valuenow={currentQIndex + 1}
              aria-valuemin="1"
              aria-valuemax={totalQuestions}
            />
          </div>
        )}

        {/* STORAGE ERROR WARNING (if storage failed) */}
        {storageErrorNotice && (
          <div className="bg-amber-50 border-b border-amber-200 px-4 sm:px-6 py-2 text-xs text-amber-900 flex items-center gap-2">
            <WarningCircle size={16} className="text-amber-600 shrink-0" />
            <span>{storageErrorNotice}</span>
          </div>
        )}

        {/* SCROLLABLE QUESTION / SCREEN BODY */}
        <div
          ref={scrollContainerRef}
          className="flex-1 min-h-0 overflow-y-auto overscroll-contain px-4 sm:px-8 py-4 sm:py-7 space-y-5 sm:space-y-6 pb-12 sm:pb-8 touch-pan-y"
          style={{ WebkitOverflowScrolling: 'touch' }}
        >
          {/* ============================================================ */}
          {/* SCREEN: OPENING / INTRO                                      */}
          {/* ============================================================ */}
          {screen === 'intro' && (
            <div className="space-y-6 max-w-xl mx-auto py-2 sm:py-4 flex flex-col items-center text-center">
              <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#fbf0eb] border border-[#e8c4e2] text-[#c9542f] text-xs font-medium uppercase tracking-wider mx-auto">
                <Sparkle size={14} weight="fill" />
                <span>45 Questions • ~25–35 mins</span>
              </div>

              <h2
                ref={headingRef}
                tabIndex="-1"
                className="text-2xl sm:text-3xl font-serif font-normal text-[#111010] focus:outline-none text-center"
              >
                Welcome to your optional preparation
              </h2>

              <p className="text-sm sm:text-base text-[#555047] leading-relaxed text-center max-w-lg">
                {config.copy?.intro ||
                  'There are no right or wrong answers. Share only what you feel comfortable sharing. You can skip any question or return to booking whenever you like.'}
              </p>

              <div className="w-full p-4 sm:p-5 rounded-2xl bg-white/70 border border-black/10 space-y-3 text-left">
                <div className="flex items-start gap-3">
                  <ShieldCheck size={20} className="text-[#c9542f] shrink-0 mt-0.5" />
                  <div className="space-y-1.5 text-xs sm:text-sm text-[#555047] leading-relaxed">
                    <p className="font-semibold text-[#111010]">Private & Tab-Scoped</p>
                    <p>
                      {config.copy?.draft_notice ||
                        'Your progress is kept in this tab during booking. It may be lost if you close the tab. Answers are sent to Aarkesh when you confirm your booking.'}
                    </p>
                    <p>
                      These responses help Aarkesh prepare for your conversation.{' '}
                      <a
                        href={privacyUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[#c9542f] underline hover:text-[#111010]"
                      >
                        Read privacy policy
                      </a>
                    </p>
                  </div>
                </div>
              </div>

              {answeredCount > 0 && (
                <div className="w-full p-4 rounded-xl bg-[#fbf0eb] border border-[#e8c4e2] text-xs sm:text-sm text-[#111010] flex items-center justify-between text-left">
                  <span>You have <strong>{answeredCount}</strong> answers saved in this tab.</span>
                  <button
                    onClick={() => setScreen('review')}
                    className="text-[#c9542f] font-bold uppercase tracking-wider text-xs hover:underline cursor-pointer"
                  >
                    View answers
                  </button>
                </div>
              )}

              <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3 w-full">
                <button
                  onClick={() => setScreen(0)}
                  className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-[#111010] hover:bg-[#c9542f] text-white text-xs sm:text-sm font-bold tracking-wider uppercase transition-all shadow-md cursor-pointer flex items-center justify-center gap-2"
                >
                  <span>{answeredCount > 0 ? 'Continue Questionnaire' : 'Start Questionnaire'}</span>
                  <ArrowRight size={16} weight="bold" />
                </button>
                <button
                  onClick={handleSaveAndReturn}
                  className="w-full sm:w-auto px-6 py-3.5 rounded-xl border border-black/15 bg-white/80 hover:bg-white text-[#111010] text-xs sm:text-sm font-semibold tracking-wide transition-colors cursor-pointer text-center"
                >
                  Return to Booking Details
                </button>
              </div>
            </div>
          )}

          {/* ============================================================ */}
          {/* SCREEN: QUESTION (0..44)                                     */}
          {/* ============================================================ */}
          {isQuestionScreen && (
            <div className="space-y-5 sm:space-y-6">
              {/* SECTION HEADER & INTRO */}
              <div className="space-y-1.5 pb-2 border-b border-black/5">
                <div className="flex items-baseline justify-between gap-2 text-[0.68rem] sm:text-xs text-[#7a756b] uppercase tracking-wider font-semibold">
                  <span className="leading-tight">
                    Section {currentQ.sectionId.replace('s0', '').replace('s', '')}: {currentQ.sectionTitle}
                  </span>
                  <span className="font-mono text-[#c9542f] shrink-0 font-bold whitespace-nowrap">
                    <span className="hidden xs:inline">Question </span>
                    <span className="xs:hidden">Q</span>
                    {currentQ.number} of {totalQuestions}
                  </span>
                </div>

                {isFirstInSection && currentQ.sectionIntro && (
                  <div className="mt-2 p-3 sm:p-3.5 rounded-xl bg-white/70 border border-black/10 text-xs sm:text-sm text-[#555047] italic leading-relaxed">
                    {currentQ.sectionIntro}
                  </div>
                )}
              </div>

              {/* SPECIAL CASE Q17-Q20: COLLAPSIBLE PREVIEW OF Q16 */}
              {['q17', 'q18', 'q19', 'q20'].includes(currentQ.id) && (
                <div className="rounded-xl border border-black/10 bg-white/80 overflow-hidden text-xs sm:text-sm">
                  <button
                    onClick={() => setPreviewQ16Open(!previewQ16Open)}
                    className="w-full px-4 py-2.5 flex items-center justify-between text-[#555047] hover:text-[#111010] bg-black/5 transition-colors cursor-pointer"
                  >
                    <span className="flex items-center gap-2 font-medium">
                      <FileText size={16} className="text-[#c9542f]" />
                      <span>Review your example from Question 16</span>
                    </span>
                    {previewQ16Open ? <CaretUp size={16} /> : <CaretDown size={16} />}
                  </button>
                  {previewQ16Open && (
                    <div className="p-4 bg-white text-[#111010] leading-relaxed border-t border-black/5">
                      {q16AnswerText ? (
                        <p className="whitespace-pre-wrap">{q16AnswerText}</p>
                      ) : (
                        <p className="text-[#7a756b] italic">
                          You did not write an example for Question 16, but you can still answer this question.
                        </p>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* QUESTION PROMPT */}
              <div className="space-y-1.5 sm:space-y-2">
                <h2
                  ref={headingRef}
                  tabIndex="-1"
                  className="text-lg sm:text-2xl font-serif font-normal text-[#111010] leading-snug focus:outline-none"
                >
                  {currentQ.prompt}
                </h2>

                {currentQ.help_text && (
                  <p className="text-xs sm:text-sm text-[#7a756b] leading-relaxed">
                    {currentQ.help_text}
                  </p>
                )}

                {/* Question type instruction */}
                <div className="text-[0.68rem] sm:text-xs font-bold uppercase tracking-wider text-[#c9542f]">
                  {currentQ.type === 'multi_select' && (
                    <span>
                      {currentQ.max_selections
                        ? `Select up to ${currentQ.max_selections} options`
                        : 'Select all that apply'}
                    </span>
                  )}
                  {currentQ.type === 'single_select' && <span>Select one option</span>}
                  {currentQ.type === 'long_text' && <span>Written response (optional)</span>}
                  {currentQ.type === 'integer_choice' && <span>Select a number from 0 to 10 or Not sure</span>}
                </div>
              </div>

              {/* SELECTION LIMIT INLINE WARNING */}
              {limitWarning && (
                <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-900 flex items-center gap-2 animate-in fade-in">
                  <WarningCircle size={16} className="text-amber-600 shrink-0" />
                  <span>{limitWarning}</span>
                </div>
              )}

              {/* ============================================================ */}
              {/* CONTROL 1: MULTI_SELECT (CHECKBOXES - 2 COLUMNS)             */}
              {/* ============================================================ */}
              {currentQ.type === 'multi_select' && (
                <div
                  className="max-h-[48vh] sm:max-h-none overflow-y-auto overscroll-contain pr-1 sm:pr-0 p-0.5 grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-3 touch-pan-y"
                  style={{ scrollbarWidth: 'thin', scrollbarColor: '#c9542f transparent', WebkitOverflowScrolling: 'touch' }}
                >
                  {(currentQ.options || []).map((opt) => {
                    const isChecked = Array.isArray(currentAnswer?.selected_option_ids) &&
                      currentAnswer.selected_option_ids.includes(opt.id);
                    const writeInValue = currentAnswer?.other_text_by_option_id?.[opt.id] || '';
                    const spanFull = isChecked && opt.write_in;

                    return (
                      <div
                        key={opt.id}
                        className={`rounded-xl border transition-all ${spanFull ? 'sm:col-span-2' : ''} ${
                          isChecked
                            ? 'border-[#c9542f] bg-white shadow-xs'
                            : 'border-black/10 bg-white/70 hover:bg-white hover:border-black/20'
                        }`}
                      >
                        <label
                          htmlFor={`opt_${opt.id}`}
                          className="flex items-start gap-2.5 p-3 sm:p-3.5 cursor-pointer select-none"
                        >
                          <div className="pt-0.5">
                            <input
                              type="checkbox"
                              id={`opt_${opt.id}`}
                              checked={isChecked}
                              onChange={() => handleToggleMulti(opt)}
                              className="sr-only"
                            />
                            <div
                              className={`w-5 h-5 rounded-md border flex items-center justify-center transition-colors shrink-0 ${
                                isChecked
                                  ? 'bg-[#c9542f] border-[#c9542f] text-white'
                                  : 'border-black/25 bg-white'
                              }`}
                            >
                              {isChecked && <Check size={14} weight="bold" />}
                            </div>
                          </div>
                          <div className="flex-1 text-xs sm:text-sm font-medium text-[#111010] leading-snug">
                            <span>{opt.label}</span>
                            {opt.exclusive && (
                              <span className="block text-[0.68rem] uppercase tracking-wider text-[#7a756b] font-normal mt-0.5">
                                (Clears other options)
                              </span>
                            )}
                          </div>
                        </label>

                        {/* WRITE-IN TEXT INPUT (revealed when checked) */}
                        {isChecked && opt.write_in && (
                          <div className="px-4 pb-3.5 pt-1 border-t border-black/5 bg-[#faf7f2]/50">
                            <label
                              htmlFor={`write_in_${opt.id}`}
                              className="block text-[0.72rem] uppercase tracking-wider font-semibold text-[#555047] mb-1.5"
                            >
                              {opt.write_in.label || 'Add a little detail if you like'} (Optional, max 300 characters)
                            </label>
                            <input
                              type="text"
                              id={`write_in_${opt.id}`}
                              maxLength={300}
                              value={writeInValue}
                              onChange={(e) => handleWriteInChange(opt.id, e.target.value)}
                              placeholder="Type details here..."
                              className="w-full px-3.5 py-2.5 rounded-lg border border-black/15 bg-white text-xs sm:text-sm text-[#111010] focus:outline-none focus:border-[#c9542f] focus:ring-1 focus:ring-[#c9542f]"
                            />
                            {writeInValue.length > 200 && (
                              <div className="text-[0.68rem] text-right text-[#7a756b] mt-1 font-mono">
                                {writeInValue.length} / 300
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}

              {/* ============================================================ */}
              {/* CONTROL 2: SINGLE_SELECT (RADIO BUTTONS - 2 COLUMNS)         */}
              {/* ============================================================ */}
              {currentQ.type === 'single_select' && (
                <div
                  className="max-h-[48vh] sm:max-h-none overflow-y-auto overscroll-contain pr-1 sm:pr-0 p-0.5 grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-3 touch-pan-y"
                  style={{ scrollbarWidth: 'thin', scrollbarColor: '#c9542f transparent', WebkitOverflowScrolling: 'touch' }}
                >
                  {(currentQ.options || []).map((opt) => {
                    const isSelected = Array.isArray(currentAnswer?.selected_option_ids) &&
                      currentAnswer.selected_option_ids.includes(opt.id);
                    const writeInValue = currentAnswer?.other_text_by_option_id?.[opt.id] || '';
                    const spanFull = isSelected && opt.write_in;

                    return (
                      <div
                        key={opt.id}
                        className={`rounded-xl border transition-all ${spanFull ? 'sm:col-span-2' : ''} ${
                          isSelected
                            ? 'border-[#c9542f] bg-white shadow-xs'
                            : 'border-black/10 bg-white/70 hover:bg-white hover:border-black/20'
                        }`}
                      >
                        <label
                          htmlFor={`opt_${opt.id}`}
                          className="flex items-start gap-2.5 p-3 sm:p-3.5 cursor-pointer select-none"
                        >
                          <div className="pt-0.5">
                            <input
                              type="radio"
                              id={`opt_${opt.id}`}
                              name={`radio_${currentQ.id}`}
                              checked={isSelected}
                              onChange={() => handleSelectRadio(opt)}
                              className="sr-only"
                            />
                            <div
                              className={`w-5 h-5 rounded-full border flex items-center justify-center transition-colors shrink-0 ${
                                isSelected
                                  ? 'border-[#c9542f] bg-white'
                                  : 'border-black/25 bg-white'
                              }`}
                            >
                              {isSelected && <div className="w-2.5 h-2.5 rounded-full bg-[#c9542f]" />}
                            </div>
                          </div>
                          <div className="flex-1 text-xs sm:text-sm font-medium text-[#111010] leading-snug">
                            <span>{opt.label}</span>
                          </div>
                        </label>

                        {/* WRITE-IN TEXT INPUT (revealed when selected) */}
                        {isSelected && opt.write_in && (
                          <div className="px-4 pb-3.5 pt-1 border-t border-black/5 bg-[#faf7f2]/50">
                            <label
                              htmlFor={`write_in_${opt.id}`}
                              className="block text-[0.72rem] uppercase tracking-wider font-semibold text-[#555047] mb-1.5"
                            >
                              {opt.write_in.label || 'Add a little detail if you like'} (Optional, max 300 characters)
                            </label>
                            <input
                              type="text"
                              id={`write_in_${opt.id}`}
                              maxLength={300}
                              value={writeInValue}
                              onChange={(e) => handleWriteInChange(opt.id, e.target.value)}
                              placeholder="Type details here..."
                              className="w-full px-3.5 py-2.5 rounded-lg border border-black/15 bg-white text-xs sm:text-sm text-[#111010] focus:outline-none focus:border-[#c9542f] focus:ring-1 focus:ring-[#c9542f]"
                            />
                            {writeInValue.length > 200 && (
                              <div className="text-[0.68rem] text-right text-[#7a756b] mt-1 font-mono">
                                {writeInValue.length} / 300
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}

              {/* ============================================================ */}
              {/* CONTROL 3: LONG_TEXT (TEXTAREA)                              */}
              {/* ============================================================ */}
              {currentQ.type === 'long_text' && (
                <div className="space-y-2">
                  <textarea
                    rows={6}
                    maxLength={2000}
                    value={currentAnswer?.text || ''}
                    onChange={handleTextChange}
                    placeholder="Write freely. There is no minimum length, and you can skip this if you prefer..."
                    className="w-full p-4 rounded-xl border border-black/15 bg-white text-xs sm:text-sm text-[#111010] focus:outline-none focus:border-[#c9542f] focus:ring-1 focus:ring-[#c9542f] leading-relaxed resize-y"
                  />
                  <div className="flex justify-between items-center text-[0.72rem] text-[#7a756b]">
                    <span>Share as much or as little as you like.</span>
                    <span className="font-mono">{(currentAnswer?.text || '').length} / 2000</span>
                  </div>
                </div>
              )}

              {/* ============================================================ */}
              {/* CONTROL 4: INTEGER_CHOICE (Q39: 0..10 + NOT SURE)           */}
              {/* ============================================================ */}
              {currentQ.type === 'integer_choice' && (
                <div className="space-y-5">
                  <div className="flex justify-between text-[0.72rem] uppercase tracking-wider font-semibold text-[#7a756b] px-1">
                    <span>0: Not at all confident</span>
                    <span>10: Very confident</span>
                  </div>

                  {/* 0 to 10 Scale buttons */}
                  <div className="grid grid-cols-6 sm:grid-cols-11 gap-2">
                    {(currentQ.options || []).filter(o => o.id !== 'q39_not_sure').map((opt) => {
                      const isSelected = Array.isArray(currentAnswer?.selected_option_ids) &&
                        currentAnswer.selected_option_ids.includes(opt.id);

                      return (
                        <button
                          key={opt.id}
                          type="button"
                          onClick={() => handleSelectRadio(opt)}
                          className={`h-11 sm:h-12 rounded-xl font-sans font-bold text-sm sm:text-base border transition-all cursor-pointer flex items-center justify-center ${
                            isSelected
                              ? 'bg-[#c9542f] text-white border-[#c9542f] shadow-md scale-105'
                              : 'bg-white hover:bg-black/5 text-[#111010] border-black/15'
                          }`}
                        >
                          {opt.label}
                        </button>
                      );
                    })}
                  </div>

                  {/* Separate "Not sure" button */}
                  {(() => {
                    const notSureOpt = (currentQ.options || []).find(o => o.id === 'q39_not_sure');
                    if (!notSureOpt) return null;
                    const isSelected = Array.isArray(currentAnswer?.selected_option_ids) &&
                      currentAnswer.selected_option_ids.includes(notSureOpt.id);

                    return (
                      <div className="pt-2">
                        <button
                          type="button"
                          onClick={() => handleSelectRadio(notSureOpt)}
                          className={`w-full sm:w-auto px-6 py-2.5 rounded-xl text-xs sm:text-sm font-semibold border transition-all cursor-pointer ${
                            isSelected
                              ? 'bg-[#c9542f] text-white border-[#c9542f]'
                              : 'bg-white/80 hover:bg-white text-[#555047] border-black/15'
                          }`}
                        >
                          {notSureOpt.label}
                        </button>
                      </div>
                    );
                  })()}
                </div>
              )}

              {/* SKIP CONFIRMATION MODAL / INLINE PROMPT */}
              {skipConfirmTarget === currentQ.id && (
                <div className="p-4 rounded-2xl bg-amber-50 border border-amber-300 text-amber-950 space-y-3 animate-in fade-in">
                  <p className="text-xs sm:text-sm font-medium">
                    You have entered an answer for this question. Are you sure you want to skip and clear your answer?
                  </p>
                  <div className="flex gap-2">
                    <button
                      onClick={executeSkip}
                      className="px-4 py-2 rounded-lg bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold uppercase tracking-wider cursor-pointer"
                    >
                      Yes, Skip & Clear
                    </button>
                    <button
                      onClick={() => setSkipConfirmTarget(null)}
                      className="px-4 py-2 rounded-lg border border-amber-300 bg-white hover:bg-amber-100 text-xs font-medium cursor-pointer"
                    >
                      Keep My Answer
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ============================================================ */}
          {/* SCREEN: REVIEW (AFTER Q45)                                   */}
          {/* ============================================================ */}
          {screen === 'review' && (
            <div className="space-y-6 max-w-2xl mx-auto py-2">
              <div className="space-y-2 border-b border-black/10 pb-4">
                <h2
                  ref={headingRef}
                  tabIndex="-1"
                  className="text-2xl sm:text-3xl font-serif font-normal text-[#111010] focus:outline-none"
                >
                  {config.copy?.review_heading || 'Review your answers'}
                </h2>
                <p className="text-xs sm:text-sm text-[#555047] leading-relaxed">
                  {config.copy?.finish_message ||
                    'Thank you for sharing what feels useful. You can review your answers or return to booking.'}
                </p>

                {/* Summary badge counter */}
                <div className="pt-2 flex flex-wrap gap-2 text-xs">
                  <span className="px-3 py-1 rounded-full bg-[#fbf0eb] border border-[#e8c4e2] text-[#c9542f] font-semibold">
                    {answeredCount} Answered
                  </span>
                  <span className="px-3 py-1 rounded-full bg-black/5 text-[#555047] font-medium">
                    {totalQuestions - answeredCount} Skipped / Unanswered
                  </span>
                </div>
              </div>

              {/* Grouped by Section (1 to 9) */}
              <div className="space-y-6">
                {(config.sections || []).map((sec) => (
                  <div key={sec.id} className="space-y-3">
                    <h3 className="text-xs uppercase tracking-wider font-bold text-[#7a756b] border-b border-black/5 pb-1">
                      Section {sec.id.replace('s0', '').replace('s', '')}: {sec.title}
                    </h3>

                    <div className="space-y-2.5">
                      {(sec.questions || []).map((q) => {
                        const ans = answers[q.id];
                        const isAns = ans && ans.state === 'answered';
                        const isSkp = ans && ans.state === 'skipped';
                        const qGlobalIdx = allQuestions.findIndex(x => x.id === q.id);

                        return (
                          <div
                            key={q.id}
                            className="p-3.5 sm:p-4 rounded-xl border border-black/10 bg-white/70 flex flex-col sm:flex-row sm:items-start justify-between gap-3 text-xs sm:text-sm"
                          >
                            <div className="space-y-1.5 flex-1 pr-2">
                              <div className="flex items-center gap-2">
                                <span className="font-mono text-[0.68rem] text-[#7a756b] font-bold">
                                  Q{q.number}
                                </span>
                                <span
                                  className={`px-2 py-0.5 rounded-full text-[0.65rem] font-bold uppercase tracking-wider ${
                                    isAns
                                      ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                                      : isSkp
                                      ? 'bg-black/5 text-[#7a756b]'
                                      : 'bg-black/5 text-[#7a756b]'
                                  }`}
                                >
                                  {isAns ? 'Answered' : isSkp ? 'Skipped' : 'Unanswered'}
                                </span>
                              </div>

                              <p className="font-medium text-[#111010]">{q.prompt}</p>

                              {/* Answer Details */}
                              {isAns && (
                                <div className="text-xs text-[#555047] space-y-1 pt-1">
                                  {q.type === 'long_text' && (
                                    <p className="italic line-clamp-3 bg-[#faf7f2] p-2 rounded-lg border border-black/5">
                                      {ans.text}
                                    </p>
                                  )}
                                  {['multi_select', 'single_select', 'integer_choice'].includes(q.type) && (
                                    <ul className="space-y-0.5 list-disc list-inside">
                                      {(ans.selected_option_ids || []).map((optId) => {
                                        const optDef = q.options?.find((o) => o.id === optId);
                                        const writeIn = ans.other_text_by_option_id?.[optId];
                                        return (
                                          <li key={optId}>
                                            <span className="font-medium text-[#111010]">
                                              {optDef?.label || optId}
                                            </span>
                                            {writeIn && (
                                              <span className="italic text-[#7a756b]"> — "{writeIn}"</span>
                                            )}
                                          </li>
                                        );
                                      })}
                                    </ul>
                                  )}
                                </div>
                              )}
                            </div>

                            <button
                              onClick={() => setScreen(qGlobalIdx)}
                              className="shrink-0 px-3 py-1.5 rounded-lg border border-black/15 hover:border-[#c9542f] bg-white hover:text-[#c9542f] text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer self-start"
                            >
                              <PencilSimple size={14} />
                              <span>Edit</span>
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* BOTTOM FIXED NAVIGATION BAR */}
        <div className="shrink-0 px-3.5 sm:px-8 py-3 sm:py-4 bg-[#f5f1e8] border-t border-black/10 flex items-center justify-between gap-2 sm:gap-3">
          {isQuestionScreen ? (
            <>
              {/* BACK BUTTON */}
              <button
                onClick={handleBack}
                className="flex items-center justify-center gap-1 sm:gap-1.5 px-3 sm:px-5 py-2 sm:py-2.5 rounded-xl border border-black/15 bg-white/90 hover:bg-white text-xs sm:text-sm font-semibold text-[#111010] transition-colors cursor-pointer shrink-0"
              >
                <ArrowLeft size={15} />
                <span>{config.copy?.back_button || 'Back'}</span>
              </button>

              <div className="flex items-center justify-end gap-1.5 sm:gap-3 min-w-0">
                {/* SKIP BUTTON */}
                <button
                  onClick={handleSkipClick}
                  className="px-2 sm:px-4 py-2 sm:py-2.5 rounded-xl text-xs sm:text-sm font-semibold text-[#7a756b] hover:text-[#111010] transition-colors cursor-pointer whitespace-nowrap text-center"
                >
                  <span className="hidden sm:inline">{config.copy?.skip_button || 'Skip this question'}</span>
                  <span className="sm:hidden">Skip</span>
                </button>

                {/* NEXT BUTTON */}
                <button
                  onClick={handleNext}
                  className="flex items-center justify-center gap-1 sm:gap-1.5 px-4 sm:px-7 py-2 sm:py-2.5 rounded-xl bg-[#111010] hover:bg-[#c9542f] text-white text-xs sm:text-sm font-bold tracking-wider uppercase transition-all shadow-md cursor-pointer shrink-0 whitespace-nowrap"
                >
                  <span>{currentQIndex === totalQuestions - 1 ? 'Review' : (config.copy?.next_button || 'Next')}</span>
                  <ArrowRight size={15} weight="bold" />
                </button>
              </div>
            </>
          ) : screen === 'review' ? (
            <div className="w-full flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-between gap-2.5 sm:gap-3">
              <button
                onClick={() => setScreen(totalQuestions - 1)}
                className="flex items-center justify-center gap-1.5 px-4 sm:px-5 py-2.5 rounded-xl border border-black/15 bg-white/90 hover:bg-white text-xs sm:text-sm font-semibold text-[#111010] transition-colors cursor-pointer w-full sm:w-auto"
              >
                <ArrowLeft size={16} />
                <span>Back to Question 45</span>
              </button>

              <button
                onClick={handleSaveAndReturn}
                className="flex items-center justify-center gap-2 px-5 sm:px-7 py-2.5 sm:py-3 rounded-xl bg-[#111010] hover:bg-[#c9542f] text-white text-xs sm:text-sm font-bold tracking-wider uppercase transition-all shadow-md cursor-pointer w-full sm:w-auto"
              >
                <span>{config.copy?.return_button || 'Save and return to booking'}</span>
                <Check size={16} weight="bold" />
              </button>
            </div>
          ) : (
            // Opening screen bottom bar
            <div className="w-full flex flex-col sm:flex-row justify-between items-center gap-2 text-xs text-[#7a756b] text-center sm:text-left">
              <span>Clicking outside does not close this questionnaire.</span>
              <button
                onClick={handleSaveAndReturn}
                className="text-[#111010] hover:text-[#c9542f] font-semibold cursor-pointer underline py-1"
              >
                Return to Booking
              </button>
            </div>
          )}
        </div>
      </div>
    </div>,
    document.body
  );
}