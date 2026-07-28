import React, { useState } from 'react';
import { CaretLeft, CaretRight, CalendarBlank, CheckCircle, ArrowRight, ArrowLeft } from '@phosphor-icons/react';
import { Link } from 'react-router-dom';

export default function Step1Time({ data, updateData, onNext }) {
  // Using fixed fake dates for the demo since we don't have a backend yet
  const [selectedDay, setSelectedDay] = useState(data.date || 4);
  const [selectedTime, setSelectedTime] = useState(data.time || null);

  const times = [
    '09:00 AM',
    '10:30 AM',
    '01:00 PM',
    '02:30 PM',
    '04:00 PM'
  ];

  // Calendar rendering (fixed to October 2024 to match design, but dynamic logic is easy to add)
  const daysInMonth = 31;
  const startingDayOfWeek = 2; // Oct 1, 2024 is a Tuesday
  
  const handleContinue = () => {
    if (selectedDay && selectedTime) {
      updateData({ 
        date: `Friday, October ${selectedDay}, 2024`, // Formatted for step 3
        time: selectedTime 
      });
      onNext();
    }
  };

  return (
    <div className="flex flex-col">
      
      <div className="flex flex-col lg:flex-row gap-12 lg:gap-16">
        
        {/* Left Column - Calendar */}
        <div className="flex-1">
          <h3 className="font-sans text-[0.65rem] uppercase tracking-[0.2em] font-medium text-accent-gold mb-3">
            CHOOSE A DATE
          </h3>
          
          <div className="bg-[#0f0f0f] border border-white/5 rounded-xl p-5">
            {/* Calendar Header */}
            <div className="flex items-center justify-between mb-4">
              <span className="text-white text-base font-medium">October 2024</span>
              <div className="flex items-center gap-4 text-accent-gold">
                <CaretLeft className="cursor-pointer hover:text-white transition-colors" />
                <CaretRight className="cursor-pointer hover:text-white transition-colors" />
              </div>
            </div>

            {/* Days of Week */}
            <div className="grid grid-cols-7 gap-y-2 mb-3">
              {['SU', 'MO', 'TU', 'WE', 'TH', 'FR', 'SA'].map(day => (
                <div key={day} className="text-center font-sans text-[0.65rem] tracking-wider text-white/40 mb-2">
                  {day}
                </div>
              ))}

              {/* Empty slots before month starts */}
              {[...Array(startingDayOfWeek)].map((_, i) => (
                <div key={`empty-${i}`} className="text-center text-white/10 font-light text-sm">
                  {30 - startingDayOfWeek + i + 1}
                </div>
              ))}

              {/* Actual Days */}
              {[...Array(daysInMonth)].map((_, i) => {
                const day = i + 1;
                const isSelected = selectedDay === day;
                return (
                  <div key={day} className="flex items-center justify-center">
                    <button
                      onClick={() => setSelectedDay(day)}
                      className={`w-8 h-8 rounded-md flex items-center justify-center font-light text-sm transition-all
                        ${isSelected ? 'bg-transparent border border-accent-gold text-accent-gold' : 'text-white hover:bg-white/5'}
                      `}
                    >
                      {day}
                    </button>
                  </div>
                );
              })}
              
              {/* Empty slots after month ends */}
              {[...Array(42 - (daysInMonth + startingDayOfWeek))].map((_, i) => (
                <div key={`empty-end-${i}`} className="text-center text-white/10 font-light text-sm flex items-center justify-center">
                  {i + 1}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column - Times */}
        <div className="flex-1 mt-6 lg:mt-0">
          <h3 className="font-sans text-[0.65rem] uppercase tracking-[0.2em] font-medium text-accent-gold mb-3">
            CHOOSE A TIME
          </h3>
          
          <div className="flex flex-col gap-2">
            {times.map(time => {
              const isSelected = selectedTime === time;
              return (
                <button
                  key={time}
                  onClick={() => setSelectedTime(time)}
                  className={`w-full text-left px-5 py-3 rounded-xl border transition-all flex items-center justify-between
                    ${isSelected 
                      ? 'bg-[#1a130c] border-accent-gold/40' 
                      : 'bg-transparent border-white/5 hover:border-white/20'
                    }
                  `}
                >
                  <span className={`font-light ${isSelected ? 'text-accent-gold font-medium' : 'text-white/80'}`}>
                    {time}
                  </span>
                  {isSelected && (
                    <CheckCircle className="text-accent-gold text-xl" weight="fill" />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Bottom Action Bar */}
      <div className="mt-8 pt-6 border-t border-white/10 flex flex-col md:flex-row items-center justify-between gap-4">
        

        <div className="hidden lg:flex items-center gap-3 text-white/40 order-2">
          <CalendarBlank className="text-2xl" weight="light" />
          <span className="font-sans text-[0.7rem] font-light">All sessions are 1-on-1 and last 60 minutes.</span>
        </div>
        
        <button
          onClick={handleContinue}
          disabled={!selectedDay || !selectedTime}
          className={`flex items-center justify-center gap-3 px-6 py-3 rounded-xl font-sans text-[0.8rem] font-semibold tracking-wide transition-all w-full md:w-auto order-1 md:order-3
            ${(!selectedDay || !selectedTime) 
              ? 'bg-white/5 text-white/20 cursor-not-allowed' 
              : 'bg-accent-gold text-black hover:bg-white hover:text-black hover:-translate-y-1'
            }
          `}
        >
          CONTINUE TO DETAILS
          <ArrowRight className="text-lg" weight="bold" />
        </button>
      </div>

    </div>
  );
}
