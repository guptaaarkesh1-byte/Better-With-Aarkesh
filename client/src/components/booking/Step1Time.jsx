import React, { useState } from 'react';
import { 
  CaretLeft, CaretRight, CalendarBlank, CheckCircle, 
  ArrowRight, CaretDown, SunHorizon, Sun, Moon, Clock 
} from '@phosphor-icons/react';

const getGroupedSlots = (slots) => {
  const groups = {
    morning: [],
    afternoon: [],
    evening: []
  };

  slots.forEach((timeStr) => {
    const match = timeStr.match(/(\d+):(\d+)\s*(AM|PM)/i);
    if (!match) {
      groups.afternoon.push(timeStr);
      return;
    }
    let [_, h, m, meridiem] = match;
    let hour = parseInt(h, 10);
    if (meridiem.toUpperCase() === 'PM' && hour !== 12) hour += 12;
    if (meridiem.toUpperCase() === 'AM' && hour === 12) hour = 0;

    if (hour < 12) {
      groups.morning.push(timeStr);
    } else if (hour < 17) {
      groups.afternoon.push(timeStr);
    } else {
      groups.evening.push(timeStr);
    }
  });

  return groups;
};

export default function Step1Time({ data, updateData, onNext, onBack, settings = {} }) {
  const PERIOD_CONFIG = {
    morning: {
      label: settings?.morningLabel || 'Morning',
      sub: settings?.morningSub || 'Before 12:00 PM',
      icon: SunHorizon,
      iconColor: 'text-amber-400',
    },
    afternoon: {
      label: settings?.afternoonLabel || 'Afternoon',
      sub: settings?.afternoonSub || '12:00 PM – 5:00 PM',
      icon: Sun,
      iconColor: 'text-accent-gold',
    },
    evening: {
      label: settings?.eveningLabel || 'Evening',
      sub: settings?.eveningSub || '5:00 PM Onwards',
      icon: Moon,
      iconColor: 'text-indigo-300',
    }
  };

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
        const emailQuery = data.email ? `&email=${encodeURIComponent(data.email)}` : '';
        const res = await fetch(`${API_URL}/api/cal/slots?date=${dateStr}${emailQuery}`);
        
        if (!res.ok) throw new Error('Failed to fetch slots');
        
        const resData = await res.json();
        
        // Cal.com returns data.slots["YYYY-MM-DD"]
        const dailySlots = resData?.data?.slots?.[dateStr] || [];
        
        // Update duration state for UI
        if (resData?.metadata?.duration) {
          updateData({ sessionDuration: resData.metadata.duration });
        }
        
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
  }, [selectedDay, currentMonth, currentYear, data.email]);

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
      
      <div className="flex flex-col lg:flex-row gap-6 sm:gap-8 lg:gap-14">
        
        {/* Left Column - Calendar */}
        <div className="flex-1" onClick={(e) => e.stopPropagation()}>
          <h3 className="font-sans text-[0.68rem] uppercase tracking-[0.2em] font-bold text-[#c9542f] mb-3">
            {settings?.dateHeading || 'CHOOSE A DATE'}
          </h3>
          
          <div className="bg-white/90 border border-black/10 rounded-2xl p-4 sm:p-5 shadow-sm">
            {/* Calendar Header */}
            <div className="flex items-center justify-between mb-4 relative z-20">
              
              <div className="flex items-center gap-2">
                {/* Month Dropdown */}
                <div className="relative">
                  <button 
                    onClick={() => setActiveDropdown(activeDropdown === 'month' ? null : 'month')}
                    className="flex items-center gap-1.5 text-[#111010] hover:text-[#c9542f] transition-colors text-base sm:text-lg font-serif font-medium focus:outline-none cursor-pointer"
                  >
                    {monthNames[currentMonth]}
                    <CaretDown size={14} className={`text-[#c9542f] transition-transform ${activeDropdown === 'month' ? 'rotate-180' : ''}`} />
                  </button>
                  
                  {activeDropdown === 'month' && (
                    <div className="absolute top-full left-0 mt-2 w-36 bg-white border border-black/10 rounded-xl shadow-xl flex flex-col py-1.5 z-30 max-h-48 overflow-y-auto overscroll-contain">
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
                            className={`px-4 py-2 text-left text-xs sm:text-sm font-sans transition-colors ${
                              isPast ? 'text-black/20 cursor-not-allowed' : 
                              currentMonth === idx ? 'text-[#c9542f] bg-[#faede4] font-semibold' : 'text-[#111010] hover:bg-[#faede4]/60'
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
                    className="flex items-center gap-1.5 text-[#111010] hover:text-[#c9542f] transition-colors text-base sm:text-lg font-serif font-medium focus:outline-none cursor-pointer"
                  >
                    {currentYear}
                    <CaretDown size={14} className={`text-[#c9542f] transition-transform ${activeDropdown === 'year' ? 'rotate-180' : ''}`} />
                  </button>
                  
                  {activeDropdown === 'year' && (
                    <div className="absolute top-full left-0 mt-2 w-28 bg-white border border-black/10 rounded-xl shadow-xl flex flex-col py-1.5 z-30 max-h-48 overflow-y-auto overscroll-contain">
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
                          className={`px-4 py-2 text-left text-xs sm:text-sm font-sans transition-colors ${
                            currentYear === y ? 'text-[#c9542f] bg-[#faede4] font-semibold' : 'text-[#111010] hover:bg-[#faede4]/60'
                          }`}
                        >
                          {y}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-3 text-[#c9542f]">
                <CaretLeft 
                  className={`p-1 text-xl transition-colors rounded-lg ${currentYear === today.getFullYear() && currentMonth === today.getMonth() ? 'text-black/15 cursor-not-allowed' : 'cursor-pointer hover:bg-[#faede4] hover:text-[#111010]'}`} 
                  onClick={handlePrevMonth} 
                />
                <CaretRight 
                  className="p-1 text-xl cursor-pointer hover:bg-[#faede4] hover:text-[#111010] transition-colors rounded-lg" 
                  onClick={handleNextMonth} 
                />
              </div>
            </div>

            {/* Days of Week */}
            <div className="grid grid-cols-7 gap-y-1.5 mb-2">
              {['SU', 'MO', 'TU', 'WE', 'TH', 'FR', 'SA'].map(day => (
                <div key={day} className="text-center font-sans text-[0.62rem] tracking-wider text-[#7a756b] font-bold mb-1">
                  {day}
                </div>
              ))}

              {/* Empty slots before month starts */}
              {[...Array(startingDayOfWeek)].map((_, i) => {
                const prevMonthDays = getDaysInMonth(currentMonth === 0 ? 11 : currentMonth - 1, currentMonth === 0 ? currentYear - 1 : currentYear);
                return (
                  <div key={`empty-${i}`} className="text-center text-black/15 font-light text-xs sm:text-sm flex items-center justify-center h-8">
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
                      className={`w-8 h-8 rounded-lg flex items-center justify-center font-sans text-xs sm:text-sm transition-all cursor-pointer
                        ${isPast ? 'text-black/20 cursor-not-allowed' : ''}
                        ${!isPast && isSelected ? 'bg-[#c9542f] text-white font-bold shadow-xs' : ''}
                        ${!isPast && !isSelected ? 'text-[#111010] hover:bg-[#faede4] hover:text-[#c9542f] font-normal' : ''}
                      `}
                    >
                      {day}
                    </button>
                  </div>
                );
              })}
              
              {/* Empty slots after month ends */}
              {[...Array(42 - (daysInMonth + startingDayOfWeek))].map((_, i) => (
                <div key={`empty-end-${i}`} className="text-center text-black/15 font-light text-xs sm:text-sm flex items-center justify-center h-8">
                  {i + 1}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column - Times */}
        <div className="flex-1 mt-4 sm:mt-6 lg:mt-0">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-sans text-[0.68rem] uppercase tracking-[0.2em] font-bold text-[#c9542f]">
              {settings?.timeHeading || 'CHOOSE A TIME'}
            </h3>
            {times.length > 0 && !isLoadingSlots && (
              <span className="font-sans text-[0.62rem] uppercase tracking-wider text-[#7a756b] font-bold">
                {times.length} {times.length === 1 ? 'Slot Available' : 'Slots Available'}
              </span>
            )}
          </div>
          
          <div 
            className="flex flex-col gap-4 max-h-[300px] sm:max-h-[380px] overflow-y-auto custom-scrollbar pr-1 sm:pr-2 overscroll-contain"
            data-lenis-prevent="true"
          >
            {!selectedDay && (
              <div className="text-[#7a756b] text-xs sm:text-sm font-light italic p-6 text-center border border-black/10 rounded-2xl bg-white/60">
                Select a date from the calendar to view available times.
              </div>
            )}
            
            {isLoadingSlots && (
              <div className="text-[#c9542f] text-xs sm:text-sm font-medium p-8 text-center border border-black/10 rounded-2xl bg-white/60 flex flex-col items-center gap-2">
                <div className="w-5 h-5 border-2 border-[#c9542f]/20 border-t-[#c9542f] rounded-full animate-spin mb-1" />
                Finding available time slots...
              </div>
            )}

            {slotsError && (
              <div className="text-red-700 text-xs sm:text-sm font-normal p-4 text-center border border-red-200 rounded-2xl bg-red-50">
                {slotsError}
              </div>
            )}
            
            {!isLoadingSlots && !slotsError && selectedDay && times.length === 0 && (
              <div className="text-[#7a756b] text-xs sm:text-sm font-light italic p-6 text-center border border-black/10 rounded-2xl bg-white/60">
                {settings?.noSlotsText || 'No slots available on this date. Please pick another date.'}
              </div>
            )}

            {!isLoadingSlots && !slotsError && selectedDay && times.length > 0 && (
              (() => {
                const grouped = getGroupedSlots(times);
                return (
                  <div className="flex flex-col gap-4">
                    {['morning', 'afternoon', 'evening'].map(periodKey => {
                      const periodSlots = grouped[periodKey];
                      if (!periodSlots || periodSlots.length === 0) return null;
                      const config = PERIOD_CONFIG[periodKey];
                      const Icon = config.icon;

                      return (
                        <div key={periodKey} className="flex flex-col gap-2.5">
                          {/* Period Header */}
                          <div className="flex items-center justify-between px-1 pb-1 border-b border-black/10">
                            <div className="flex items-center gap-1.5 sm:gap-2">
                              <Icon className={`text-sm sm:text-base text-[#c9542f]`} weight="bold" />
                              <span className="font-sans text-[0.68rem] sm:text-[0.72rem] uppercase tracking-[0.16em] font-bold text-[#111010]">
                                {config.label}
                              </span>
                              <span className="text-[0.62rem] sm:text-[0.68rem] text-[#7a756b] font-light">
                                • {config.sub}
                              </span>
                            </div>
                            <span className="text-[0.58rem] uppercase tracking-wider text-[#c9542f] bg-[#faede4] px-2 py-0.5 rounded-md border border-[#f0c8b8] font-bold">
                              {periodSlots.length} {periodSlots.length === 1 ? 'slot' : 'slots'}
                            </span>
                          </div>

                          {/* Period Slots Grid */}
                          <div className="grid grid-cols-2 gap-2">
                            {periodSlots.map(time => {
                              const isSelected = selectedTime === time;
                              return (
                                <button
                                  key={time}
                                  type="button"
                                  onClick={() => setSelectedTime(time)}
                                  className={`px-3 sm:px-4 py-2.5 sm:py-3 rounded-xl border text-left transition-all flex items-center justify-between group cursor-pointer
                                    ${isSelected 
                                      ? 'bg-[#faede4] border-2 border-[#c9542f] text-[#c9542f] shadow-xs' 
                                      : 'bg-white border-black/10 text-[#111010] hover:border-[#c9542f] hover:bg-[#faede4]/50'
                                    }
                                  `}
                                >
                                  <div className="flex items-center gap-1.5 sm:gap-2 min-w-0">
                                    <Clock className={`text-xs shrink-0 ${isSelected ? 'text-[#c9542f]' : 'text-[#7a756b] group-hover:text-[#c9542f] transition-colors'}`} />
                                    <span className={`text-xs sm:text-sm font-sans tracking-wide truncate ${isSelected ? 'font-bold text-[#c9542f]' : 'font-medium'}`}>
                                      {time}
                                    </span>
                                  </div>
                                  {isSelected && (
                                    <CheckCircle className="text-[#c9542f] text-base shrink-0 ml-1" weight="fill" />
                                  )}
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                );
              })()
            )}
          </div>
        </div>
      </div>

      {/* Bottom Action Bar */}
      <div className="mt-8 pt-6 border-t border-black/10 flex flex-col-reverse md:flex-row items-stretch md:items-center justify-between gap-4 md:gap-6">
        
        <div className="flex items-center justify-center md:justify-start gap-2.5 sm:gap-3 text-[#555047]">
          <CalendarBlank className="text-xl sm:text-2xl shrink-0 text-[#c9542f]" weight="light" />
          <span className="font-sans text-[0.72rem] sm:text-[0.78rem] font-light text-center md:text-left">
            All sessions are 1-on-1 and last {data.sessionDuration || 60} minutes.
          </span>
        </div>

        <div className="flex flex-col-reverse md:flex-row items-stretch md:items-center gap-3 sm:gap-4 md:gap-6">
          {onBack && (
            <button
              onClick={onBack}
              className="flex items-center justify-center gap-2 sm:gap-3 px-6 sm:px-8 py-3.5 sm:py-4 rounded-xl border border-black/15 font-sans text-xs sm:text-sm font-semibold tracking-wide text-[#111010] hover:bg-black/5 transition-all w-full md:w-auto cursor-pointer"
            >
              <CaretLeft className="text-base sm:text-lg" />
              BACK
            </button>
          )}
          
          <button
            onClick={handleContinue}
            disabled={!selectedDay || !selectedTime}
            className={`flex items-center justify-center gap-2 sm:gap-3 px-6 sm:px-8 py-3.5 sm:py-4 rounded-xl font-sans text-xs sm:text-sm font-bold tracking-wider uppercase transition-all w-full md:w-auto cursor-pointer
              ${(!selectedDay || !selectedTime) 
                ? 'bg-black/5 text-black/30 border border-black/10 cursor-not-allowed' 
                : 'bg-[#111010] text-white hover:bg-[#c9542f] shadow-md hover:-translate-y-0.5'
              }
            `}
          >
            CONTINUE TO DETAILS
            <ArrowRight className="text-base sm:text-lg" weight="bold" />
          </button>
        </div>
      </div>

    </div>
  );
}
