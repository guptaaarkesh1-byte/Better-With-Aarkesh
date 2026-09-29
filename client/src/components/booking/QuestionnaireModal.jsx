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
      style={{ backgroundColor: 'rgba(17,16,16,0.6)', backdropFilter: 'blur(8px)' }}
    >
      <div
        className="relative w-full max-w-2xl bg-[#f5f1e8] text-[#111010] border border-black/10 rounded-2xl md:rounded-3xl shadow-2xl flex flex-col max-h-[92vh] sm:max-h-[88vh] overflow-hidden"
      >
        {/* Header - Fixed Top */}
        <div className="flex items-center justify-between px-6 py-4 sm:py-5 border-b border-black/10 shrink-0 bg-[#f5f1e8]">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full border border-[#e8c4e2] flex items-center justify-center shrink-0 bg-[#fbf0eb] shadow-xs">
              <Clock size={18} weight="light" className="text-[#c9542f]" />
            </div>
            <div>
              <h3 className="font-serif text-[#111010] text-lg font-medium leading-tight">
                {questionnaire?.title || 'Questionnaire'}
              </h3>
              <p className="font-sans text-[0.72rem] text-[#7a756b] mt-0.5 font-medium">
                {questionnaire?.badgeLabel || 'Optional'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-lg border border-black/10 hover:border-black/30 text-[#7a756b] hover:text-[#111010] transition-all cursor-pointer bg-white/60"
          >
            <X size={16} />
          </button>
        </div>

        {/* Progress Bar - Fixed Below Header */}
        {!submitted && !loading && (
          <div className="px-6 pt-4 pb-1 shrink-0 bg-[#f5f1e8]">
            <div className="flex items-center justify-between mb-2">
              <span className="font-sans text-[0.68rem] uppercase tracking-widest text-[#7a756b] font-bold">
                Question {currentQuestion + 1} of {total}
              </span>
              <span className="font-mono text-[0.68rem] text-[#c9542f] font-bold">
                {Math.round(progress)}%
              </span>
            </div>
            <div className="w-full h-1.5 bg-black/10 rounded-full overflow-hidden">
              <div
                className="h-full bg-[#c9542f] rounded-full transition-all duration-500 ease-out"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        )}

        {/* Body - Scrollable Area */}
        <div className="px-6 py-5 flex-1 overflow-y-auto min-h-0">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-16 gap-4">
              <div className="w-8 h-8 border-2 border-[#c9542f] border-t-transparent rounded-full animate-spin" />
              <span className="font-sans text-sm text-[#7a756b]">Loading...</span>
            </div>
          ) : submitted ? (
            <div className="flex flex-col items-center justify-center py-10 gap-5 text-center">
              <div className="w-16 h-16 rounded-full bg-[#fbf0eb] border border-[#e8c4e2] flex items-center justify-center shadow-xs">
                <CheckCircle size={32} weight="fill" className="text-[#c9542f]" />
              </div>
              <div>
                <h4 className="font-serif text-2xl text-[#111010] font-normal mb-2">
                  {questionnaire?.completedText || 'Questionnaire Completed'}
                </h4>
                <p className="font-sans text-sm text-[#555047]">
                  Your answers will help make our session more meaningful.
                </p>
              </div>
              <button
                onClick={onClose}
                className="mt-2 flex items-center gap-2 px-6 py-3 rounded-xl bg-[#c9542f] hover:bg-[#111010] text-white font-sans text-xs font-bold uppercase tracking-wider transition-all shadow-md cursor-pointer"
              >
                <CheckCircle size={16} weight="bold" />
                Done
              </button>
            </div>
          ) : current ? (
            <div key={currentQuestion} className="animate-in fade-in slide-in-from-right-4 duration-300">
              <h4 className="font-serif text-xl sm:text-2xl text-[#111010] font-normal leading-snug mb-5">
                {current.question}
              </h4>
              <div className="flex flex-col gap-2.5">
                {(current.options || []).map((option) => {
                  const isSelected = selectedOption === option.id;
                  return (
                    <button
                      key={option.id}
                      onClick={() => handleSelect(current.id, option.id, option.label)}
                      className={`w-full text-left px-4 py-3.5 sm:px-5 sm:py-4 rounded-xl border transition-all duration-200 group cursor-pointer ${
                        isSelected
                          ? 'border-[#c9542f] bg-[#fbf0eb] shadow-xs'
                          : 'border-black/10 bg-white hover:border-[#c9542f]/50 hover:bg-[#fbf0eb]/40 shadow-xs'
                      }`}
                    >
                      <div className="flex items-center gap-3.5">
                        <div
                          className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-all duration-200 ${
                            isSelected ? 'border-[#c9542f] bg-[#c9542f]' : 'border-black/20 group-hover:border-[#c9542f]'
                          }`}
                        >
                          {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                        </div>
                        <span className={`font-sans text-sm leading-relaxed transition-colors duration-200 ${isSelected ? 'text-[#c9542f] font-semibold' : 'text-[#111010]'}`}>
                          {option.label}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
              {!current.required && (
                <p className="font-sans text-[0.7rem] text-[#7a756b] mt-4 text-center">
                  This question is optional — feel free to skip
                </p>
              )}
            </div>
          ) : null}
        </div>

        {/* Footer Navigation - Fixed Pinned Bottom */}
        {!loading && !submitted && (
          <div className="px-6 py-4 shrink-0 flex items-center justify-between border-t border-black/10 bg-[#ede7d8]/60">
            <button
              onClick={handleBack}
              disabled={currentQuestion === 0}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border text-xs font-sans font-semibold transition-all cursor-pointer ${
                currentQuestion === 0
                  ? 'border-black/5 text-black/20 cursor-not-allowed'
                  : 'border-black/15 text-[#111010] hover:bg-black/5'
              }`}
            >
              <ArrowLeft size={14} />
              Back
            </button>
            <div className="flex items-center gap-3">
              {current && !current.required && !selectedOption && (
                <button
                  onClick={handleNext}
                  className="font-sans text-xs text-[#7a756b] hover:text-[#111010] font-semibold transition-colors px-3 py-2 cursor-pointer"
                >
                  Skip
                </button>
              )}
              <button
                onClick={handleNext}
                disabled={current?.required && !selectedOption}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-sans text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
                  current?.required && !selectedOption
                    ? 'bg-black/5 text-black/20 cursor-not-allowed'
                    : 'bg-[#c9542f] hover:bg-[#111010] text-white shadow-md active:scale-[0.98]'
                }`}
              >
                {currentQuestion < total - 1 ? (
                  <>Next <ArrowRight size={14} weight="bold" /></>
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