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
                className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 border transition-colors duration-500
                  ${isCompleted ? 'bg-transparent border-accent-gold' : 
                    isActive ? 'bg-transparent border-accent-gold' : 'bg-transparent border-white/20'}`}
              >
                {isCompleted ? (
                  <Check className="text-accent-gold text-sm" weight="bold" />
                ) : (
                  <span className={`font-sans text-xs ${isActive ? 'text-accent-gold' : 'text-white'}`}>
                    {step.num}
                  </span>
                )}
              </div>
              <span className={`hidden md:block font-sans text-[0.65rem] font-bold tracking-widest ${isActive || isCompleted ? 'text-white' : 'text-white'}`}>
                {step.label}
              </span>
            </div>

            {/* Line Connector */}
            {index < steps.length - 1 && (
              <div className="w-8 md:w-24 h-[1px] mx-2 md:mx-4 transition-colors duration-500">
                <div className={`h-full w-full ${isCompleted ? 'bg-accent-gold' : 'bg-white/10'}`} />
              </div>
            )}

          </React.Fragment>
        );
      })}
    </div>
  );
}
