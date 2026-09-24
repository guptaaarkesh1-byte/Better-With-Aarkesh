import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { X, ArrowRight, CheckCircle, Clock, ArrowLeft } from '@phosphor-icons/react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export default function QuestionnaireModal({ isOpen, onClose, onComplete }) {
  const [questionnaire, setQuestionnaire] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const overlayRef = useRef(null);

  useEffect(() => {
    if (!isOpen) return;
    setLoading(true);
    setCurrentQuestion(0);
    setAnswers({});
    setSubmitted(false);
    fetch(`${API_URL}/api/questionnaire`)
      .then(r => r.json())
      .then(data => { setQuestionnaire(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, [isOpen]);

  useEffect(() => {
    if (isOpen) { document.body.style.overflow = 'hidden'; }
    else { document.body.style.overflow = ''; }
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  if (!isOpen) return null;

  const questions = questionnaire?.questions || [];
  const total = questions.length;
  const current = questions[currentQuestion];
  const selectedOption = current ? (answers[current.id]?.optionId || (typeof answers[current.id] === 'string' ? answers[current.id] : null)) : null;

  const handleSelect = (questionId, optionId, optionLabel) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: {
        questionId,
        question: current?.question || '',
        optionId,
        answer: optionLabel || ''
      }
    }));
  };

  const handleNext = () => {
    if (currentQuestion < total - 1) {
      setCurrentQuestion(q => q + 1);
    } else {
      setSubmitted(true);
      const structuredAnswers = questions.map(q => {
        const ans = answers[q.id];
        if (!ans) return null;
        if (typeof ans === 'object' && ans.answer) {
          return ans;
        }
        const opt = q.options?.find(o => o.id === ans);
        return {
          questionId: q.id,
          question: q.question,
          optionId: ans,
          answer: opt?.label || ''
        };
      }).filter(Boolean);

      if (onComplete) onComplete(structuredAnswers);
    }
  };

  const handleBack = () => {
    if (currentQuestion > 0) setCurrentQuestion(q => q - 1);
  };

  const handleOverlayClick = (e) => {
    if (e.target === overlayRef.current) onClose();
  };

  const progress = total > 0 ? ((currentQuestion + 1) / total) * 100 : 0;

  return createPortal(
    <div
      ref={overlayRef}
      onClick={handleOverlayClick}
      className="fixed inset-0 z-[99999] flex items-center justify-center p-3 sm:p-6"
      style={{ backgroundColor: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(8px)' }}
    >
      <div
        className="relative w-full max-w-2xl bg-[#0d0d0d] border border-white/10 rounded-2xl shadow-2xl flex flex-col max-h-[92vh] sm:max-h-[88vh] overflow-hidden"
      >
        {/* Header - Fixed Top */}
        <div className="flex items-center justify-between px-6 py-4 sm:py-5 border-b border-white/5 shrink-0 bg-[#0d0d0d]">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full border border-[#c79c6e]/40 flex items-center justify-center shrink-0 bg-[#c79c6e]/5">
              <Clock size={18} weight="light" className="text-[#c79c6e]" />
            </div>
            <div>
              <h3 className="font-serif text-white text-base leading-tight">
                {questionnaire?.title || 'Questionnaire'}
              </h3>
              <p className="font-sans text-[0.72rem] text-white/40 mt-0.5">
                {questionnaire?.badgeLabel || 'Optional'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-lg border border-white/10 hover:border-white/30 text-white/40 hover:text-white transition-all"
          >
            <X size={16} />
          </button>
        </div>

        {/* Progress Bar - Fixed Below Header */}
        {!submitted && !loading && (
          <div className="px-6 pt-4 pb-1 shrink-0 bg-[#0d0d0d]">
            <div className="flex items-center justify-between mb-2">
              <span className="font-sans text-[0.68rem] uppercase tracking-widest text-white/30">
                Question {currentQuestion + 1} of {total}
              </span>
              <span className="font-mono text-[0.68rem] text-[#c79c6e]">
                {Math.round(progress)}%
              </span>
            </div>
            <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden">
              <div
                className="h-full bg-[#c79c6e] rounded-full transition-all duration-500 ease-out"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        )}

        {/* Body - Scrollable Area */}
        <div className="px-6 py-5 flex-1 overflow-y-auto min-h-0">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-16 gap-4">
              <div className="w-8 h-8 border-2 border-[#c79c6e] border-t-transparent rounded-full animate-spin" />
              <span className="font-sans text-sm text-white/40">Loading...</span>
            </div>
          ) : submitted ? (
            <div className="flex flex-col items-center justify-center py-10 gap-5 text-center">
              <div className="w-16 h-16 rounded-full bg-[#c79c6e]/15 border border-[#c79c6e]/30 flex items-center justify-center">
                <CheckCircle size={32} weight="fill" className="text-[#c79c6e]" />
              </div>
              <div>
                <h4 className="font-serif text-xl text-white mb-2">
                  {questionnaire?.completedText || 'Questionnaire Completed'}
                </h4>
                <p className="font-sans text-sm text-white/50">
                  Your answers will help make our session more meaningful.
                </p>
              </div>
              <button
                onClick={onClose}
                className="mt-2 flex items-center gap-2 px-6 py-3 rounded-xl bg-[#c79c6e] hover:bg-[#b58c5f] text-black font-sans text-xs font-semibold uppercase tracking-wider transition-all"
              >
                <CheckCircle size={16} weight="bold" />
                Done
              </button>
            </div>
          ) : current ? (
            <div key={currentQuestion} className="animate-in fade-in slide-in-from-right-4 duration-300">
              <h4 className="font-serif text-lg sm:text-xl text-white leading-snug mb-5">
                {current.question}
              </h4>
              <div className="flex flex-col gap-2.5">
                {(current.options || []).map((option) => {
                  const isSelected = selectedOption === option.id;
                  return (
                    <button
                      key={option.id}
                      onClick={() => handleSelect(current.id, option.id, option.label)}
                      className={`w-full text-left px-4 py-3 sm:px-5 sm:py-3.5 rounded-xl border transition-all duration-200 group ${
                        isSelected
                          ? 'border-[#c79c6e]/60 shadow-[0_0_20px_rgba(199,156,110,0.08)]'
                          : 'border-white/8 bg-[#141414] hover:border-white/20 hover:bg-white/3'
                      }`}
                      style={{ backgroundColor: isSelected ? 'rgba(199,156,110,0.08)' : undefined }}
                    >
                      <div className="flex items-center gap-3.5">
                        <div
                          className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-all duration-200 ${
                            isSelected ? 'border-[#c79c6e] bg-[#c79c6e]' : 'border-white/20 group-hover:border-white/40'
                          }`}
                        >
                          {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-black" />}
                        </div>
                        <span className={`font-sans text-sm leading-relaxed transition-colors duration-200 ${isSelected ? 'text-white font-medium' : 'text-white/70 group-hover:text-white/90'}`}>
                          {option.label}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
              {!current.required && (
                <p className="font-sans text-[0.7rem] text-white/30 mt-4 text-center">
                  This question is optional — feel free to skip
                </p>
              )}
            </div>
          ) : null}
        </div>

        {/* Footer Navigation - Fixed Pinned Bottom */}
        {!loading && !submitted && (
          <div className="px-6 py-4 shrink-0 flex items-center justify-between border-t border-white/8 bg-[#0a0a0a]">
            <button
              onClick={handleBack}
              disabled={currentQuestion === 0}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border text-xs font-sans font-medium transition-all ${
                currentQuestion === 0
                  ? 'border-white/5 text-white/20 cursor-not-allowed'
                  : 'border-white/10 text-white/60 hover:text-white hover:border-white/30'
              }`}
            >
              <ArrowLeft size={14} />
              Back
            </button>
            <div className="flex items-center gap-3">
              {current && !current.required && !selectedOption && (
                <button
                  onClick={handleNext}
                  className="font-sans text-xs text-white/40 hover:text-white transition-colors px-3 py-2"
                >
                  Skip
                </button>
              )}
              <button
                onClick={handleNext}
                disabled={current?.required && !selectedOption}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-sans text-xs font-semibold uppercase tracking-wider transition-all ${
                  current?.required && !selectedOption
                    ? 'bg-white/5 text-white/20 cursor-not-allowed'
                    : 'bg-[#c79c6e] hover:bg-[#b58c5f] text-black shadow-[0_0_16px_rgba(199,156,110,0.25)] active:scale-[0.98]'
                }`}
              >
                {currentQuestion < total - 1 ? (
                  <>Next <ArrowRight size={14} /></>
                ) : (
                  <>{questionnaire?.submitButtonText || 'Submit'} <CheckCircle size={14} weight="bold" /></>
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>,
    document.body
  );
}