import React, { useState } from 'react';
import { CaretLeft, CaretRight, CalendarBlank, CheckCircle, ArrowRight, CaretDown } from '@phosphor-icons/react';

export default function Step1Time({ data, updateData, onNext }) {
  // Initialize date parsing
  const initialDate = data.date ? new Date(data.date) : new Date();
  const isDateValid = !isNaN(initialDate.getTime());
  
  const today = new Date();
  
  const [currentMonth, setCurrentMonth] = useState(isDateValid ? initialDate.getMonth() : today.getMonth());
  const [currentYear, setCurrentYear] = useState(isDateValid ? initialDate.getFullYear() : today.getFullYear());
  
  // Dropdown states
  const [activeDropdown, setActiveDropdown] = useState(null);
  
  // If we have a saved date, and it matches the current calendar view, select it.
  const [selectedDay, setSelectedDay] = useState(() => {
    if (isDateValid && data.date) {
      return initialDate.getDate();
    }
    // Default to today if it's the current month, otherwise null
    return (currentMonth === today.getMonth() && currentYear === today.getFullYear()) ? today.getDate() : null;
  });

  const [selectedTime, setSelectedTime] = useState(data.time || null);
  const [times, setTimes] = useState([]);
  const [isLoadingSlots, setIsLoadingSlots] = useState(false);
  const [slotsError, setSlotsError] = useState(null);

  // Dynamic Calendar logic
  const getDaysInMonth = (month, year) => new Date(year, month + 1, 0).getDate();
  const getStartingDayOfWeek = (month, year) => new Date(year, month, 1).getDay();

  const daysInMonth = getDaysInMonth(currentMonth, currentYear);
  const startingDayOfWeek = getStartingDayOfWeek(currentMonth, currentYear);
  
  const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  const years = Array.from({ length: 5 }, (_, i) => today.getFullYear() + i);

  // Fetch live slots when a day is selected
  React.useEffect(() => {
    if (!selectedDay) {
      setTimes([]);
      return;
    }

    const fetchSlots = async () => {
      setIsLoadingSlots(true);
      setSlotsError(null);
      setTimes([]);
      
      try {
        // Format date as YYYY-MM-DD
        const monthStr = String(currentMonth + 1).padStart(2, '0');
        const dayStr = String(selectedDay).padStart(2, '0');
        const dateStr = `${currentYear}-${monthStr}-${dayStr}`;

        const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
        const res = await fetch(`${API_URL}/api/cal/slots?date=${dateStr}`);
        
        if (!res.ok) throw new Error('Failed to fetch slots');
        
        const resData = await res.json();
        
        // Cal.com returns data.slots["YYYY-MM-DD"]
        const dailySlots = resData?.data?.slots?.[dateStr] || [];
        
        // Format ISO times to local 12-hour strings
        const formattedTimes = dailySlots.map(slot => {
          const dateObj = new Date(slot.time);
          return dateObj.toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
            hour12: true
          });
        });
        
        setTimes(formattedTimes);
      } catch (err) {
        console.error(err);
        setSlotsError("Could not load available times for this date.");
      } finally {
        setIsLoadingSlots(false);
      }
    };

    fetchSlots();
  }, [selectedDay, currentMonth, currentYear]);

  const handleNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(currentYear + 1);
    } else {
      setCurrentMonth(currentMonth + 1);
    }
    setSelectedDay(null); // Require user to pick a new day in the new month
  };

  const handlePrevMonth = () => {
    // Prevent going to past months
    if (currentYear === today.getFullYear() && currentMonth === today.getMonth()) return;

    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(currentYear - 1);
    } else {
      setCurrentMonth(currentMonth - 1);
    }
    setSelectedDay(null);
  };

  const handleContinue = () => {
    if (selectedDay && selectedTime) {
      const dateObj = new Date(currentYear, currentMonth, selectedDay);
      const dayOfWeek = dateObj.toLocaleDateString('en-US', { weekday: 'long' });
      const monthName = monthNames[currentMonth];

      updateData({ 
        date: `${dayOfWeek}, ${monthName} ${selectedDay}, ${currentYear}`, 
        time: selectedTime 
      });
      onNext();
    }
  };

  // Close dropdowns if clicking outside (simplified for now, user can click dropdown to close)
  return (
    <div className="flex flex-col" onClick={() => activeDropdown && setActiveDropdown(null)}>
      
      <div className="flex flex-col lg:flex-row gap-12 lg:gap-16">
        
        {/* Left Column - Calendar */}
        <div className="flex-1" onClick={(e) => e.stopPropagation()}>
          <h3 className="font-sans text-[0.65rem] uppercase tracking-[0.2em] font-medium text-accent-gold mb-3">
            CHOOSE A DATE
          </h3>
          
          <div className="bg-[#0f0f0f] border border-white/5 rounded-xl p-5">
            {/* Calendar Header */}
            <div className="flex items-center justify-between mb-4 relative z-20">
              
              <div className="flex items-center gap-2">
                {/* Month Dropdown */}
                <div className="relative">
                  <button 
                    onClick={() => setActiveDropdown(activeDropdown === 'month' ? null : 'month')}
                    className="flex items-center gap-1 text-white hover:text-accent-gold transition-colors text-base font-medium focus:outline-none"
                  >
                    {monthNames[currentMonth]}
                    <CaretDown size={14} className={`transition-transform ${activeDropdown === 'month' ? 'rotate-180' : ''}`} />
                  </button>
                  
                  {activeDropdown === 'month' && (
                    <div className="absolute top-full left-0 mt-2 w-32 bg-[#050505] border border-white/10 rounded-lg shadow-xl flex flex-col py-1 z-30 max-h-48 overflow-y-auto overscroll-contain">
                      {monthNames.map((m, idx) => {
                        const isPast = currentYear === today.getFullYear() && idx < today.getMonth();
                        return (
                          <button 
                            key={m} 
                            onClick={() => {
                              if (!isPast) {
                                setCurrentMonth(idx);
                                setSelectedDay(null);
                                setActiveDropdown(null);
                              }
                            }}
                            disabled={isPast}
                            className={`px-4 py-2 text-left text-sm transition-colors ${
                              isPast ? 'text-white/20 cursor-not-allowed' : 
                              currentMonth === idx ? 'text-accent-gold bg-white/5' : 'text-white/70 hover:text-white hover:bg-white/5'
                            }`}
                          >
                            {m}
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* Year Dropdown */}
                <div className="relative">
                  <button 
                    onClick={() => setActiveDropdown(activeDropdown === 'year' ? null : 'year')}
                    className="flex items-center gap-1 text-white hover:text-accent-gold transition-colors text-base font-medium focus:outline-none"
                  >
                    {currentYear}
                    <CaretDown size={14} className={`transition-transform ${activeDropdown === 'year' ? 'rotate-180' : ''}`} />
                  </button>
                  
                  {activeDropdown === 'year' && (
                    <div className="absolute top-full left-0 mt-2 w-24 bg-[#050505] border border-white/10 rounded-lg shadow-xl flex flex-col py-1 z-30 max-h-48 overflow-y-auto overscroll-contain">
                      {years.map(y => (
                        <button 
                          key={y} 
                          onClick={() => {
                            setCurrentYear(y);
                            if (y === today.getFullYear() && currentMonth < today.getMonth()) {
                              setCurrentMonth(today.getMonth());
                            }
                            setSelectedDay(null);
                            setActiveDropdown(null);
                          }}
                          className={`px-4 py-2 text-left text-sm transition-colors ${
                            currentYear === y ? 'text-accent-gold bg-white/5' : 'text-white/70 hover:text-white hover:bg-white/5'
                          }`}
                        >
                          {y}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-4 text-accent-gold">
                <CaretLeft 
                  className={`transition-colors ${currentYear === today.getFullYear() && currentMonth === today.getMonth() ? 'text-white/20 cursor-not-allowed' : 'cursor-pointer hover:text-white'}`} 
                  onClick={handlePrevMonth} 
                />
                <CaretRight 
                  className="cursor-pointer hover:text-white transition-colors" 
                  onClick={handleNextMonth} 
                />
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
              {[...Array(startingDayOfWeek)].map((_, i) => {
                const prevMonthDays = getDaysInMonth(currentMonth === 0 ? 11 : currentMonth - 1, currentMonth === 0 ? currentYear - 1 : currentYear);
                return (
                  <div key={`empty-${i}`} className="text-center text-white/10 font-light text-sm">
                    {prevMonthDays - startingDayOfWeek + i + 1}
                  </div>
                );
              })}

              {/* Actual Days */}
              {[...Array(daysInMonth)].map((_, i) => {
                const day = i + 1;
                const isSelected = selectedDay === day;
                const isPast = currentYear === today.getFullYear() && currentMonth === today.getMonth() && day < today.getDate();
                
                return (
                  <div key={day} className="flex items-center justify-center">
                    <button
                      onClick={() => !isPast && setSelectedDay(day)}
                      disabled={isPast}
                      className={`w-8 h-8 rounded-md flex items-center justify-center font-light text-sm transition-all
                        ${isPast ? 'text-white/10 cursor-not-allowed' : ''}
                        ${!isPast && isSelected ? 'bg-transparent border border-accent-gold text-accent-gold' : ''}
                        ${!isPast && !isSelected ? 'text-white hover:bg-white/5' : ''}
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
            {!selectedDay && (
              <div className="text-white/40 text-sm font-light italic p-4 text-center">
                Select a date to view available times.
              </div>
            )}
            
            {isLoadingSlots && (
              <div className="text-accent-gold text-sm font-light p-4 text-center animate-pulse">
                Loading available slots...
              </div>
            )}

            {slotsError && (
              <div className="text-red-400 text-sm font-light p-4 text-center">
                {slotsError}
              </div>
            )}
            
            {!isLoadingSlots && !slotsError && selectedDay && times.length === 0 && (
              <div className="text-white/40 text-sm font-light italic p-4 text-center">
                No slots available on this date.
              </div>
            )}

            {!isLoadingSlots && times.map(time => {
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
      <div className="mt-8 pt-6 border-t border-white/10 flex flex-col-reverse md:flex-row items-stretch md:items-center justify-between gap-4 md:gap-6">
        
        <div className="flex items-center justify-center md:justify-start gap-3 text-white/40">
          <CalendarBlank className="text-2xl shrink-0" weight="light" />
          <span className="font-sans text-[0.7rem] font-light text-center md:text-left">All sessions are 1-on-1 and last 60 minutes.</span>
        </div>
        
        <button
          onClick={handleContinue}
          disabled={!selectedDay || !selectedTime}
          className={`flex items-center justify-center gap-3 px-6 py-4 rounded-xl font-sans text-[0.8rem] font-semibold tracking-wide transition-all w-full md:w-auto
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
