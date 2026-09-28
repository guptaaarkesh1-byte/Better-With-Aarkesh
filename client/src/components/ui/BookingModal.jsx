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
        className="absolute inset-0 bg-[#111010]/60 backdrop-blur-md transition-opacity duration-500 animate-in fade-in"
        onClick={closeBookingModal}
      />

      {/* Modal Container */}
      <div className="relative w-full max-w-[520px] bg-[#f5f1e8] text-[#111010] border border-black/10 rounded-2xl md:rounded-3xl p-8 md:p-10 shadow-2xl animate-in zoom-in-95 duration-500 z-10 flex flex-col">
        
        {/* Close Button */}
        <button 
          onClick={closeBookingModal}
          className="absolute top-6 right-6 text-[#7a756b] hover:text-[#111010] transition-colors cursor-pointer w-8 h-8 rounded-full flex items-center justify-center hover:bg-black/5"
        >
          <X size={20} weight="bold" />
        </button>

        {/* Header */}
        <span className="font-sans text-[0.68rem] uppercase tracking-[0.2em] font-bold text-[#c9542f] mb-2.5">
          BEGIN A CONVERSATION
        </span>
        <h2 className="font-serif text-2xl md:text-3xl text-[#111010] font-normal tracking-tight leading-[1.15] mb-3">
          Bring what feels difficult<br />to see clearly.
        </h2>
        <p className="font-sans text-xs sm:text-sm font-light leading-relaxed text-[#555047] mb-8 pr-4">
          Answer five short questions so the conversation can begin with useful context.
        </p>

        {/* Progress Bar & Step */}
        <div className="flex flex-col gap-2.5 mb-6">
          <span className="font-sans text-[0.65rem] uppercase tracking-widest font-bold text-[#7a756b]">
            {currentStep + 1} OF 5
          </span>
          <div className="w-full h-[3px] bg-black/10 rounded-full relative overflow-hidden">
            <div 
              className="absolute left-0 top-0 h-full bg-[#c9542f] transition-all duration-500 ease-out rounded-full"
              style={{ width: `${((currentStep + 1) / 5) * 100}%` }}
            />
          </div>
        </div>

        {/* Question Area (Animated) */}
        <div className={cn(
          "flex flex-col flex-1 transition-all duration-300",
          isAnimating ? "opacity-0 -translate-x-4" : "opacity-100 translate-x-0"
        )}>
          <span className="font-sans text-[0.68rem] uppercase tracking-wider font-bold text-[#c9542f] mb-3">
            {QUESTIONS[currentStep].title}
          </span>
          
          <textarea 
            value={answers[currentStep]}
            onChange={handleAnswerChange}
            placeholder={QUESTIONS[currentStep].placeholder}
            className="w-full h-32 bg-white border border-black/15 rounded-xl p-4 text-[#111010] text-sm font-normal font-sans resize-none focus:outline-none focus:border-[#c9542f] focus:ring-1 focus:ring-[#c9542f] placeholder:text-[#9c9689] mb-6 transition-colors shadow-xs"
          />
        </div>

        {/* Buttons */}
        <div className="flex flex-col gap-3 mt-auto">
          <button 
            onClick={handleNext}
            className="w-full py-4 rounded-xl bg-[#c9542f] hover:bg-[#111010] text-white font-sans text-xs uppercase tracking-widest font-bold transition-all duration-300 shadow-md cursor-pointer"
          >
            CONTINUE
          </button>
          
          <button 
            onClick={() => {
              closeBookingModal();
              navigate('/book');
            }}
            className="w-full py-2 font-sans text-[0.65rem] uppercase tracking-widest font-bold text-[#7a756b] hover:text-[#c9542f] transition-colors cursor-pointer"
          >
            BOOK A CONVERSATION DIRECTLY →
          </button>
        </div>
        
      </div>
    </div>
  );
}
