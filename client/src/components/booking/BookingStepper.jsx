import React from 'react';
import { Check } from '@phosphor-icons/react';

export default function BookingStepper({ currentStep }) {
  const steps = [
    { num: 1, label: 'CHOOSE A TIME' },
    { num: 2, label: 'A LITTLE ABOUT YOU' },
    { num: 3, label: 'CONFIRM' },
  ];

  return (
    <div className="flex items-center justify-center w-full">
      {steps.map((step, index) => {
        const isCompleted = currentStep > step.num;
        const isActive = currentStep === step.num;
        
        return (
          <React.Fragment key={step.num}>
            
            {/* Step Item */}
            <div className={`flex items-center gap-2 md:gap-3 transition-colors duration-500 ${isActive || isCompleted ? 'opacity-100' : 'opacity-40'}`}>
              <div 
                className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 border transition-all duration-300
                  ${isCompleted ? 'bg-[#faede4] border-[#c9542f] text-[#c9542f] shadow-xs' : 
                    isActive ? 'bg-white border-2 border-[#c9542f] text-[#c9542f] shadow-xs' : 'bg-white/50 border-black/15 text-[#7a756b]'}`}
              >
                {isCompleted ? (
                  <Check className="text-[#c9542f] text-sm" weight="bold" />
                ) : (
                  <span className={`font-sans text-xs font-bold ${isActive ? 'text-[#c9542f]' : 'text-[#7a756b]'}`}>
                    {step.num}
                  </span>
                )}
              </div>
              <span className={`hidden md:block font-sans text-[0.68rem] font-bold tracking-widest ${isActive ? 'text-[#111010]' : isCompleted ? 'text-[#c9542f]' : 'text-[#7a756b]'}`}>
                {step.label}
              </span>
            </div>

            {/* Line Connector */}
            {index < steps.length - 1 && (
              <div className="w-6 sm:w-10 md:w-24 h-[1px] mx-1.5 sm:mx-2.5 md:mx-4 transition-colors duration-500">
                <div className={`h-full w-full ${isCompleted ? 'bg-[#c9542f]' : 'bg-black/10'}`} />
              </div>
            )}

          </React.Fragment>
        );
      })}
    </div>
  );
}
