import React, { useState, useEffect, useRef } from 'react';
import { useBooking } from '../../context/BookingContext';
import { X, ArrowRight } from '@phosphor-icons/react';
import { cn } from '../../utils/cn';
import { useNavigate } from 'react-router-dom';

const QUESTIONS = [
  {
    title: "WHAT WOULD YOU LIKE TO EXAMINE?",
    placeholder: "Describe it in your own words..."
  },
  {
    title: "WHAT FEELS MOST DIFFICULT OR UNCLEAR ABOUT IT RIGHT NOW?",
    placeholder: "Share only what feels useful..."
  },
  {
    title: "WHAT HAVE YOU TRIED SO FAR?",
    placeholder: "What helped, what didn't, or what remains unresolved..."
  },
  {
    title: "WHAT WOULD MAKE THIS CONVERSATION USEFUL FOR YOU?",
    placeholder: "Clarity, a decision, a different perspective..."
  },
  {
    title: "IS THERE ANYTHING ELSE I SHOULD KNOW BEFORE WE MEET?",
    placeholder: "Optional context you would like me to have..."
  }
];

export default function BookingModal() {
  const { isOpen, closeBookingModal } = useBooking();
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState(['', '', '', '', '']);
  const [isAnimating, setIsAnimating] = useState(false);
  const navigate = useNavigate();
  
  // Reset when opened
  useEffect(() => {
    if (isOpen) {
      setCurrentStep(0);
      setAnswers(['', '', '', '', '']);
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }
  }, [isOpen]);

  const handleNext = () => {
    if (currentStep < QUESTIONS.length - 1) {
      setIsAnimating(true);
      setTimeout(() => {
        setCurrentStep(prev => prev + 1);
        setIsAnimating(false);
      }, 300);
    } else {
      // Final submit
      console.log('Submitted answers:', answers);
      closeBookingModal();
    }
  };

  const handleAnswerChange = (e) => {
    const newAnswers = [...answers];
    newAnswers[currentStep] = e.target.value;
    setAnswers(newAnswers);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/80 backdrop-blur-md transition-opacity duration-500 animate-in fade-in"
        onClick={closeBookingModal}
      />

      {/* Modal Container */}
      <div className="relative w-full max-w-[500px] bg-[#050505] border border-white/10 rounded-md p-8 md:p-10 shadow-2xl animate-in zoom-in-95 duration-500 z-10 flex flex-col">
        
        {/* Close Button */}
        <button 
          onClick={closeBookingModal}
          className="absolute top-6 right-6 text-white/40 hover:text-white transition-colors"
        >
          <X size={24} weight="light" />
        </button>

        {/* Header */}
        <span className="font-sans text-[0.65rem] uppercase tracking-[0.2em] font-medium text-[#c79c6e] mb-3">
          BEGIN A CONVERSATION
        </span>
        <h2 className="font-serif text-2xl md:text-[2rem] text-white font-light tracking-tight leading-[1.1] mb-3">
          Bring what feels difficult<br />to see clearly.
        </h2>
        <p className="font-sans text-[0.8rem] font-light leading-relaxed text-white/50 mb-10 pr-4">
          Answer five short questions so the conversation can begin with useful context.
        </p>

        {/* Progress Bar & Step */}
        <div className="flex flex-col gap-3 mb-8">
          <span className="font-sans text-[0.65rem] uppercase tracking-widest font-semibold text-white/70">
            {currentStep + 1} OF 5
          </span>
          <div className="w-full h-[2px] bg-white/10 relative">
            <div 
              className="absolute left-0 top-0 h-full bg-[#c79c6e] transition-all duration-500 ease-out"
              style={{ width: `${((currentStep + 1) / 5) * 100}%` }}
            />
          </div>
        </div>

        {/* Question Area (Animated) */}
        <div className={cn(
          "flex flex-col flex-1 transition-all duration-300",
          isAnimating ? "opacity-0 -translate-x-4" : "opacity-100 translate-x-0"
        )}>
          <span className="font-sans text-[0.65rem] uppercase tracking-widest font-semibold text-[#c79c6e] mb-4">
            {QUESTIONS[currentStep].title}
          </span>
          
          <textarea 
            value={answers[currentStep]}
            onChange={handleAnswerChange}
            placeholder={QUESTIONS[currentStep].placeholder}
            className="w-full h-32 bg-transparent border border-white/10 rounded-md p-4 text-white/90 text-sm font-light font-sans resize-none focus:outline-none focus:border-[#c79c6e]/50 placeholder:text-white/20 mb-8 transition-colors"
          />
        </div>

        {/* Buttons */}
        <div className="flex flex-col gap-4 mt-auto">
          <button 
            onClick={handleNext}
            className="w-full py-4 rounded-sm bg-gradient-to-r from-[#c79c6e] via-[#e6c49a] to-[#c79c6e] text-black font-sans text-[0.75rem] uppercase tracking-widest font-bold hover:shadow-[0_0_20px_rgba(199,156,110,0.3)] transition-all duration-300"
          >
            CONTINUE
          </button>
          
          <button 
            onClick={() => {
              closeBookingModal();
              navigate('/book');
            }}
            className="w-full py-2 font-sans text-[0.6rem] uppercase tracking-widest font-semibold text-[#c79c6e]/70 hover:text-[#c79c6e] transition-colors"
          >
            BOOK A CONVERSATION
          </button>
        </div>
        
      </div>
    </div>
  );
}
