import React, { useState, useEffect } from 'react';
import { 
  CaretLeft, CaretRight, CalendarBlank, CheckCircle, 
  ArrowRight, CaretDown, SunHorizon, Sun, Moon, Clock, WarningCircle,
  Package, Sparkle, X, Check
} from '@phosphor-icons/react';
import { holdSlot, releaseSlot } from '../../utils/slotHoldService';
import { getOrCreateBookingDraftId } from '../../utils/questionnaireDraft';

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

export default function Step1Time({ data, updateData, onNext, onBack, settings = {}, draftId, fees, packageCreditInfo = null }) {
  const [bookingMode, setBookingMode] = useState(() => data.bookingMode || (data.isPackage ? 'package' : 'single'));
  const [selectedTier, setSelectedTier] = useState(() => data.totalSessions || 3);
  const [isCustomTier, setIsCustomTier] = useState(() => {
    const val = data.totalSessions || 3;
    return ![3, 5, 10].includes(val);
  });
  const [packageSlots, setPackageSlots] = useState(() => data.packageSlots || []);
  const [packageTiers, setPackageTiers] = useState([
    { sessions: 3, label: '3 Sessions' },
    { sessions: 5, label: '5 Sessions' },
    { sessions: 10, label: '10 Sessions' }
  ]);

  const [configFees, setConfigFees] = useState(null);

  // Fetch package tiers dynamically
  useEffect(() => {
    const fetchPackageConfig = async () => {
      try {
        const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
        const res = await fetch(`${API_URL}/api/packages/config`);
        if (res.ok) {
          const cfg = await res.json();
          if (Array.isArray(cfg?.tiers) && cfg.tiers.length > 0) {
            setPackageTiers(cfg.tiers);
          }
          if (cfg?.fee60min || cfg?.fee90min) {
            setConfigFees({ fee60min: cfg.fee60min, fee90min: cfg.fee90min });
          }
        }
      } catch (err) {
        console.warn('Could not load package config:', err);
      }
    };
    fetchPackageConfig();
  }, []);

  // Compute live package pricing breakdown (discounts only through coupon codes)
  // All package sessions are strictly 90 minutes!
  const isPkg = bookingMode === 'package' || data?.isPackage;
  const sessionDuration = isPkg ? 90 : (Number(data?.sessionDuration) || 60);
  const currentPerSessionRate = isPkg 
    ? (configFees?.fee90min || fees?.fee90min || settings?.fee90min || 7500)
    : (sessionDuration === 90 
        ? (configFees?.fee90min || fees?.fee90min || settings?.fee90min || 7500) 
        : (configFees?.fee60min || fees?.fee60min || settings?.fee60min || 5000));

  const packageSubtotal = (configFees?.fee90min || fees?.fee90min || settings?.fee90min || 7500) * selectedTier;
  const packageTotal = packageSubtotal;

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
  const [isHoldingSlot, setIsHoldingSlot] = useState(false);
  const [slotConflictMsg, setSlotConflictMsg] = useState('');
  const [availableDays, setAvailableDays] = useState(null);
  const [isLoadingMonth, setIsLoadingMonth] = useState(false);

  // Dynamic Calendar logic
  const getDaysInMonth = (month, year) => new Date(year, month + 1, 0).getDate();
  const getStartingDayOfWeek = (month, year) => new Date(year, month, 1).getDay();

  const daysInMonth = getDaysInMonth(currentMonth, currentYear);
  const startingDayOfWeek = getStartingDayOfWeek(currentMonth, currentYear);
  
  const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  const years = Array.from({ length: 5 }, (_, i) => today.getFullYear() + i);

  const activeHolderId = draftId || data.holderId || data.booking_draft_id || getOrCreateBookingDraftId();

  // Fetch month availability to fade out dates with 0 slots (Google Calendar / Cal.com sync)
  const fetchMonthAvailability = async (year, month) => {
    setIsLoadingMonth(true);
    try {
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      const emailQuery = data.email ? `&email=${encodeURIComponent(data.email)}` : '';
      const candidateDuration = Number(data.sessionDuration) || (bookingMode === 'package' || data.isPackage ? 90 : 60);
      const durationQuery = `&duration=${candidateDuration}`;
      const packageQuery = (bookingMode === 'package' || data.isPackage) ? '&isPackage=true' : '';
      const res = await fetch(`${API_URL}/api/cal/month-availability?year=${year}&month=${month + 1}${emailQuery}${durationQuery}${packageQuery}`);
      if (!res.ok) throw new Error('Failed to fetch month availability');
      const resData = await res.json();
      if (Array.isArray(resData?.availableDays)) {
        setAvailableDays(resData.availableDays);
        return;
      }
    } catch (err) {
      console.error('Error fetching month availability:', err);
    } finally {
      setIsLoadingMonth(false);
    }
  };

  React.useEffect(() => {
    fetchMonthAvailability(currentYear, currentMonth);
  }, [currentMonth, currentYear, data.email, bookingMode]);

  // If currently selected day becomes unavailable, deselect it
  React.useEffect(() => {
    if (availableDays !== null && selectedDay) {
      const isPast =
        (currentYear === today.getFullYear() && currentMonth === today.getMonth() && selectedDay < today.getDate()) ||
        (currentYear < today.getFullYear()) ||
        (currentYear === today.getFullYear() && currentMonth < today.getMonth());
      if (isPast || !availableDays.includes(selectedDay)) {
        setSelectedDay(null);
        setTimes([]);
      }
    }
  }, [availableDays]);

  // Helper to re-fetch slots on the current day
  const fetchLiveSlots = async (dayToFetch = selectedDay) => {
    if (!dayToFetch) {
      setTimes([]);
      return;
    }
    setIsLoadingSlots(true);
    setSlotsError(null);
    try {
      const monthStr = String(currentMonth + 1).padStart(2, '0');
      const dayStr = String(dayToFetch).padStart(2, '0');
      const dateStr = `${currentYear}-${monthStr}-${dayStr}`;

      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      const emailQuery = data.email ? `&email=${encodeURIComponent(data.email)}` : '';
      const holderQuery = activeHolderId ? `&holderId=${encodeURIComponent(activeHolderId)}` : '';
      const candidateDuration = Number(data.sessionDuration) || (bookingMode === 'package' || data.isPackage ? 90 : 60);
      const durationQuery = `&duration=${candidateDuration}`;
      const packageQuery = (bookingMode === 'package' || data.isPackage) ? '&isPackage=true' : '';
      const res = await fetch(`${API_URL}/api/cal/slots?date=${dateStr}${emailQuery}${holderQuery}${durationQuery}${packageQuery}`);
      
      if (!res.ok) throw new Error('Failed to fetch slots');
      
      const resData = await res.json();
      const dailySlots = resData?.data?.slots?.[dateStr] || [];
      
      if (resData?.metadata?.duration && resData.metadata.duration !== data.sessionDuration) {
        updateData({ sessionDuration: resData.metadata.duration });
      }
      
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

  // Fetch live slots when a day is selected
  React.useEffect(() => {
    if (!selectedDay) {
      setTimes([]);
      setSelectedTime(null);
      return;
    }
    fetchLiveSlots(selectedDay);
  }, [selectedDay, currentMonth, currentYear, data.email, activeHolderId, bookingMode]);

  const handleNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(currentYear + 1);
    } else {
      setCurrentMonth(currentMonth + 1);
    }
    setSelectedDay(null);
  };

  const handlePrevMonth = () => {
    if (currentYear === today.getFullYear() && currentMonth === today.getMonth()) return;

    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(currentYear - 1);
    } else {
      setCurrentMonth(currentMonth - 1);
    }
    setSelectedDay(null);
  };

  // Mode & Tier Handlers
  const handleModeChange = (mode) => {
    setBookingMode(mode);
    setSlotConflictMsg('');
    if (mode === 'single') {
      updateData({
        bookingMode: 'single',
        isPackage: false,
        totalSessions: 1,
      });
    } else {
      let initialSlots = [...packageSlots];
      if (initialSlots.length === 0 && selectedDay && selectedTime) {
        const monthStr = String(currentMonth + 1).padStart(2, '0');
        const dayStr = String(selectedDay).padStart(2, '0');
        const dateStr = `${currentYear}-${monthStr}-${dayStr}`;
        const dateObj = new Date(currentYear, currentMonth, selectedDay);
        const dayOfWeek = dateObj.toLocaleDateString('en-US', { weekday: 'long' });
        const monthName = monthNames[currentMonth];
        const displayDate = `${dayOfWeek}, ${monthName} ${selectedDay}, ${currentYear}`;
        initialSlots = [{
          date: displayDate,
          dateKey: dateStr,
          time: selectedTime,
          sortTimestamp: dateObj.getTime()
        }];
        setPackageSlots(initialSlots);
      }
      updateData({
        bookingMode: 'package',
        isPackage: true,
        sessionDuration: 90,
        totalSessions: selectedTier,
        packageSlots: initialSlots
      });
    }
  };

  const handleTierChange = async (newTierCount, custom = false) => {
    const count = Math.max(2, Math.min(20, Number(newTierCount) || 2));
    setIsCustomTier(custom);
    setSelectedTier(count);
    if (packageSlots.length > count) {
      const kept = packageSlots.slice(0, count);
      const toRelease = packageSlots.slice(count);
      for (const slot of toRelease) {
        releaseSlot({ holderId: activeHolderId, dateKey: slot.dateKey, time: slot.time });
      }
      setPackageSlots(kept);
      updateData({
        totalSessions: count,
        packageSlots: kept
      });
    } else {
      updateData({
        totalSessions: count
      });
    }
  };

  const handleRemovePackageSlot = (indexToRemove) => {
    const slot = packageSlots[indexToRemove];
    if (slot) {
      releaseSlot({ holderId: activeHolderId, dateKey: slot.dateKey, time: slot.time });
    }
    const updated = packageSlots.filter((_, idx) => idx !== indexToRemove);
    setPackageSlots(updated);
    updateData({
      packageSlots: updated,
      isPackage: true,
      totalSessions: selectedTier
    });
  };

  // User clicks a slot to lock/reserve it (Single or Package mode)
  const handleSelectTime = async (time) => {
    setSlotConflictMsg('');
    const monthStr = String(currentMonth + 1).padStart(2, '0');
    const dayStr = String(selectedDay).padStart(2, '0');
    const dateStr = `${currentYear}-${monthStr}-${dayStr}`;

    const dateObj = new Date(currentYear, currentMonth, selectedDay);
    const dayOfWeek = dateObj.toLocaleDateString('en-US', { weekday: 'long' });
    const monthName = monthNames[currentMonth];
    const displayDate = `${dayOfWeek}, ${monthName} ${selectedDay}, ${currentYear}`;

    if (bookingMode === 'single') {
      setSelectedTime(time);
      setIsHoldingSlot(true);

      const candidateDuration = Number(data.sessionDuration) || (data.usePackageCredit || data.isPackage || data.isFirstSession === false ? 90 : 60);
      const result = await holdSlot({
        dateKey: dateStr,
        displayDate,
        time,
        holderId: activeHolderId,
        email: data.email,
        duration: candidateDuration
      });

      setIsHoldingSlot(false);

      if (result.conflict) {
        setSlotConflictMsg(result.message || 'This time slot was just selected by another client. Please choose another time.');
        setSelectedTime(null);
        fetchLiveSlots(selectedDay);
      } else {
        updateData({ 
          date: displayDate, 
          dateKey: dateStr,
          time,
          holderId: activeHolderId,
          isPackage: false,
          bookingMode: 'single'
        });
      }
      return;
    }

    // --- PACKAGE MODE (Select Session 1; remaining sessions are credited) ---
    setSelectedTime(time);
    setIsHoldingSlot(true);

    const result = await holdSlot({
      dateKey: dateStr,
      displayDate,
      time,
      holderId: activeHolderId,
      email: data.email,
      duration: 90
    });

    setIsHoldingSlot(false);

    if (result.conflict) {
      setSlotConflictMsg(result.message || 'This time slot was just selected by another client. Please choose another time.');
      setSelectedTime(null);
      fetchLiveSlots(selectedDay);
    } else {
      const firstSlot = {
        date: displayDate,
        dateKey: dateStr,
        time,
        sortTimestamp: new Date(`${dateStr} ${time}`).getTime() || dateObj.getTime()
      };
      setPackageSlots([firstSlot]);
      updateData({ 
        date: displayDate, 
        dateKey: dateStr,
        time,
        holderId: activeHolderId,
        isPackage: true,
        bookingMode: 'package',
        totalSessions: selectedTier,
        packageSlots: [firstSlot]
      });
    }
  };

  const handleContinue = async () => {
    if (bookingMode === 'single') {
      if (selectedDay && selectedTime) {
        setIsHoldingSlot(true);
        const dateObj = new Date(currentYear, currentMonth, selectedDay);
        const dayOfWeek = dateObj.toLocaleDateString('en-US', { weekday: 'long' });
        const monthName = monthNames[currentMonth];
        const monthStr = String(currentMonth + 1).padStart(2, '0');
        const dayStr = String(selectedDay).padStart(2, '0');
        const dateStr = `${currentYear}-${monthStr}-${dayStr}`;
        const displayDate = `${dayOfWeek}, ${monthName} ${selectedDay}, ${currentYear}`;

        const candidateDuration = Number(data.sessionDuration) || (data.usePackageCredit || data.isPackage || data.isFirstSession === false ? 90 : 60);
        const result = await holdSlot({
          dateKey: dateStr,
          displayDate,
          time: selectedTime,
          holderId: activeHolderId,
          email: data.email,
          duration: candidateDuration
        });
        setIsHoldingSlot(false);

        if (result.conflict) {
          setSlotConflictMsg(result.message || 'This time slot was just selected by another client. Please choose another time.');
          setSelectedTime(null);
          fetchLiveSlots(selectedDay);
          return;
        }

        updateData({ 
          date: displayDate, 
          dateKey: dateStr,
          time: selectedTime,
          holderId: activeHolderId,
          isPackage: false,
          bookingMode: 'single'
        });
        onNext();
      }
    } else {
      // Package Mode: Session 1 is selected; remaining are credited to account
      if (selectedDay && selectedTime) {
        setIsHoldingSlot(true);
        const dateObj = new Date(currentYear, currentMonth, selectedDay);
        const dayOfWeek = dateObj.toLocaleDateString('en-US', { weekday: 'long' });
        const monthName = monthNames[currentMonth];
        const monthStr = String(currentMonth + 1).padStart(2, '0');
        const dayStr = String(selectedDay).padStart(2, '0');
        const dateStr = `${currentYear}-${monthStr}-${dayStr}`;
        const displayDate = `${dayOfWeek}, ${monthName} ${selectedDay}, ${currentYear}`;

        const result = await holdSlot({
          dateKey: dateStr,
          displayDate,
          time: selectedTime,
          holderId: activeHolderId,
          email: data.email,
          duration: 90
        });
        setIsHoldingSlot(false);

        if (result.conflict) {
          setSlotConflictMsg(result.message || 'This time slot was just selected by another client. Please choose another time.');
          setSelectedTime(null);
          fetchLiveSlots(selectedDay);
          return;
        }

        const slot = {
          date: displayDate,
          dateKey: dateStr,
          time: selectedTime,
          sortTimestamp: new Date(`${dateStr} ${selectedTime}`).getTime() || dateObj.getTime()
        };

        updateData({
          isPackage: true,
          bookingMode: 'package',
          totalSessions: selectedTier,
          packageSlots: [slot],
          date: displayDate,
          dateKey: dateStr,
          time: selectedTime,
          holderId: activeHolderId
        });
        onNext();
      } else {
        setSlotConflictMsg('Please select a date and time for Session 1 of your package.');
      }
    }
  };

  // Close dropdowns if clicking outside (simplified for now, user can click dropdown to close)
  return (
    <div className="flex flex-col" onClick={() => activeDropdown && setActiveDropdown(null)}>
      
      <div className={`flex flex-col lg:flex-row ${bookingMode === 'package' ? 'gap-5 xl:gap-6' : 'gap-6 sm:gap-8 lg:gap-14'} items-start`}>
        
        {/* Left Column - Calendar */}
        <div 
          className={`${bookingMode === 'package' ? 'w-full lg:w-[310px] xl:w-[325px] shrink-0' : 'w-full lg:flex-1'} min-w-0`}
          onClick={(e) => e.stopPropagation()}
        >
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
                              currentMonth === idx ? 'text-[#c9542f] bg-[#fbf0eb] font-semibold' : 'text-[#111010] hover:bg-[#fbf0eb]/60'
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
                            currentYear === y ? 'text-[#c9542f] bg-[#fbf0eb] font-semibold' : 'text-[#111010] hover:bg-[#fbf0eb]/60'
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
                  className={`p-1 text-xl transition-colors rounded-lg ${currentYear === today.getFullYear() && currentMonth === today.getMonth() ? 'text-black/15 cursor-not-allowed' : 'cursor-pointer hover:bg-[#fbf0eb] hover:text-[#111010]'}`} 
                  onClick={handlePrevMonth} 
                />
                <CaretRight 
                  className="p-1 text-xl cursor-pointer hover:bg-[#fbf0eb] hover:text-[#111010] transition-colors rounded-lg" 
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
                const isPast =
                  (currentYear === today.getFullYear() && currentMonth === today.getMonth() && day < today.getDate()) ||
                  (currentYear < today.getFullYear()) ||
                  (currentYear === today.getFullYear() && currentMonth < today.getMonth());
                
                // Day is unavailable if in the past OR if monthly availability loaded and day has 0 slots
                const isUnavailable = isPast || (availableDays !== null && !availableDays.includes(day));
                
                return (
                  <div key={day} className="flex items-center justify-center">
                    <button
                      onClick={() => !isUnavailable && setSelectedDay(day)}
                      disabled={isUnavailable}
                      title={isUnavailable ? (isPast ? 'Past date' : 'No slots available on this date') : undefined}
                      className={`w-8 h-8 rounded-lg flex items-center justify-center font-sans text-xs sm:text-sm transition-all
                        ${isUnavailable ? 'text-black/20 cursor-not-allowed opacity-40 hover:bg-transparent pointer-events-none' : 'cursor-pointer'}
                        ${!isUnavailable && isSelected ? 'bg-[#c9542f] text-white font-bold shadow-xs' : ''}
                        ${!isUnavailable && !isSelected ? 'text-[#111010] hover:bg-[#fbf0eb] hover:text-[#c9542f] font-normal' : ''}
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

        {/* Right Column - Times & Package Summary */}
        <div className="w-full lg:flex-1 min-w-0 mt-4 sm:mt-6 lg:mt-0 flex flex-col">
          
          {/* Package Credits Available Banner */}
          {packageCreditInfo?.hasCredits && (
            <div className="mb-4 p-3.5 sm:p-4 rounded-2xl bg-[#f0f9f1] border border-[#a5d6a7] flex items-center justify-between gap-3 text-xs shadow-2xs">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-8 h-8 rounded-xl bg-white border border-[#a5d6a7] flex items-center justify-center text-[#2e7d32] shrink-0 shadow-2xs">
                  <Sparkle size={16} weight="fill" />
                </div>
                <div className="min-w-0">
                  <div className="text-xs font-bold text-[#1b5e20] leading-snug">
                    You have <span className="font-extrabold">{packageCreditInfo.totalCredits} prepaid package credit{packageCreditInfo.totalCredits > 1 ? 's' : ''}</span>
                  </div>
                  <div className="text-[11.5px] text-[#2e7d32] leading-tight mt-0.5">
                    {data.usePackageCredit ? 'Prepaid credit applied • ₹0 at checkout' : 'Click to use your prepaid credit for this session'}
                  </div>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  const nextState = !data.usePackageCredit;
                  updateData({
                    usePackageCredit: nextState,
                    isPackage: false,
                    bookingMode: 'single'
                  });
                  if (nextState) {
                    setBookingMode('single');
                  }
                }}
                className={`px-3 sm:px-3.5 py-1.5 rounded-xl text-[11px] font-bold uppercase tracking-wider transition-all shrink-0 cursor-pointer shadow-2xs ${
                  data.usePackageCredit
                    ? 'bg-[#2e7d32] text-white'
                    : 'bg-white text-[#2e7d32] border border-[#2e7d32]/40 hover:bg-[#2e7d32]/10'
                }`}
              >
                {data.usePackageCredit ? 'Credit Active (₹0) ✓' : 'Use Credit (₹0)'}
              </button>
            </div>
          )}

          {/* Segmented Mode Toggle: [ Single session | Book a Package ] */}
          <div className="flex items-center gap-1.5 p-1 rounded-xl bg-black/5 border border-black/8 mb-4">
            <button
              type="button"
              onClick={() => handleModeChange('single')}
              className={`flex-1 py-2 px-3 rounded-lg font-sans text-xs uppercase tracking-wider font-bold transition-all cursor-pointer ${
                bookingMode === 'single'
                  ? 'bg-white text-[#c9542f] shadow-xs'
                  : 'text-[#7a756b] hover:text-[#111010]'
              }`}
            >
              Single Session
            </button>
            <button
              type="button"
              onClick={() => handleModeChange('package')}
              className={`flex-1 py-2 px-3 rounded-lg font-sans text-xs uppercase tracking-wider font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                bookingMode === 'package'
                  ? 'bg-white text-[#c9542f] shadow-xs'
                  : 'text-[#7a756b] hover:text-[#111010]'
              }`}
            >
              <Sparkle size={13} weight="fill" />
              Book a Package
            </button>
          </div>

          {/* Package Tier Selection Chips (Only visible in Package mode) */}
          {bookingMode === 'package' && (
            <div className="mb-4 bg-white/70 border border-[#e8c4e2] rounded-xl p-3 shadow-2xs animate-fadeIn">
              <div className="flex items-center justify-between mb-2">
                <span className="font-sans text-[0.62rem] uppercase tracking-wider text-[#7a756b] font-bold">
                  CHOOSE PACKAGE SIZE
                </span>
                <span className="text-[0.65rem] text-[#c9542f] font-semibold">
                  {selectedTier} Sessions selected
                </span>
              </div>
              <div className="grid grid-cols-4 gap-2">
                {packageTiers.map((t) => (
                  <button
                    key={t.sessions}
                    type="button"
                    onClick={() => handleTierChange(t.sessions, false)}
                    className={`py-2 px-1.5 sm:px-2 rounded-xl border text-center transition-all cursor-pointer flex items-center justify-center ${
                      !isCustomTier && selectedTier === t.sessions
                        ? 'bg-[#fbf0eb] border-2 border-[#c9542f] text-[#c9542f] shadow-xs font-bold'
                        : 'bg-white border-black/10 text-[#111010] hover:border-[#c9542f]/40 hover:bg-[#fbf0eb]/30 font-medium'
                    }`}
                  >
                    <span className="text-xs leading-tight whitespace-nowrap">{t.sessions} Sessions</span>
                  </button>
                ))}
                <button
                  type="button"
                  onClick={() => {
                    const initialCustom = ![3, 5, 10].includes(selectedTier) ? selectedTier : 4;
                    handleTierChange(initialCustom, true);
                  }}
                  className={`py-2 px-1.5 sm:px-2 rounded-xl border text-center transition-all cursor-pointer flex items-center justify-center ${
                    isCustomTier
                      ? 'bg-[#fbf0eb] border-2 border-[#c9542f] text-[#c9542f] shadow-xs font-bold'
                      : 'bg-white border-black/10 text-[#111010] hover:border-[#c9542f]/40 hover:bg-[#fbf0eb]/30 font-medium'
                  }`}
                >
                  <span className="text-xs leading-tight">Custom</span>
                </button>
              </div>

              {/* Stepper when Custom is selected */}
              {isCustomTier && (
                <div className="flex items-center justify-between p-2.5 rounded-xl bg-[#fbf0eb] border border-[#e8c4e2] mt-2.5 animate-fadeIn">
                  <div className="flex flex-col">
                    <span className="text-xs font-bold text-[#111010]">Custom session count</span>
                    <span className="text-[0.68rem] text-[#7a756b]">Choose 2 to 20 sessions</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleTierChange(Math.max(2, selectedTier - 1), true)}
                      disabled={selectedTier <= 2}
                      className="w-8 h-8 rounded-lg border border-black/15 bg-white text-[#111010] hover:bg-black/5 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center font-bold text-base transition-all cursor-pointer"
                      aria-label="Decrease session count"
                    >
                      −
                    </button>
                    <div className="w-12 h-8 flex items-center justify-center font-bold text-sm bg-white border border-black/15 rounded-lg text-[#c9542f] shadow-2xs">
                      {selectedTier}
                    </div>
                    <button
                      type="button"
                      onClick={() => handleTierChange(Math.min(20, selectedTier + 1), true)}
                      disabled={selectedTier >= 20}
                      className="w-8 h-8 rounded-lg border border-black/15 bg-white text-[#111010] hover:bg-black/5 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center font-bold text-base transition-all cursor-pointer"
                      aria-label="Increase session count"
                    >
                      +
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Times Section Header */}
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-sans text-[0.68rem] uppercase tracking-[0.2em] font-bold text-[#c9542f]">
              {bookingMode === 'package' 
                ? `CHOOSE TIME FOR SESSION ${Math.min(packageSlots.length + 1, selectedTier)}` 
                : (settings?.timeHeading || 'CHOOSE A TIME')}
            </h3>
            {times.length > 0 && !isLoadingSlots && (
              <span className="font-sans text-[0.62rem] uppercase tracking-wider text-[#7a756b] font-bold">
                {times.length} {times.length === 1 ? 'Slot Available' : 'Slots Available'}
              </span>
            )}
          </div>
          
          <div 
            className={`flex flex-col gap-4 ${bookingMode === 'package' ? 'max-h-[380px] sm:max-h-[420px] lg:max-h-[480px]' : 'max-h-[280px] sm:max-h-[320px]'} overflow-y-auto custom-scrollbar pr-1 sm:pr-2 overscroll-contain`}
            data-lenis-prevent="true"
          >
            {slotConflictMsg && (
              <div className="p-3 rounded-xl border border-amber-300 bg-amber-50/95 text-amber-900 text-xs flex items-start gap-2 shadow-xs animate-fadeIn">
                <WarningCircle className="text-amber-600 text-base shrink-0 mt-0.5" weight="fill" />
                <div className="flex-1">
                  <span>{slotConflictMsg}</span>
                </div>
              </div>
            )}

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
                const monthStr = String(currentMonth + 1).padStart(2, '0');
                const dayStr = String(selectedDay).padStart(2, '0');
                const currentDateKey = `${currentYear}-${monthStr}-${dayStr}`;

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
                            <span className="text-[0.58rem] uppercase tracking-wider text-[#c9542f] bg-[#fbf0eb] px-2 py-0.5 rounded-md border border-[#e8c4e2] font-bold">
                              {periodSlots.length} {periodSlots.length === 1 ? 'slot' : 'slots'}
                            </span>
                          </div>

                          {/* Period Slots Grid */}
                          <div className="grid grid-cols-2 gap-2">
                            {periodSlots.map(time => {
                              const isSelectedInSingle = bookingMode === 'single' && selectedTime === time;
                              const slotIndexInPackage = bookingMode === 'package' 
                                ? packageSlots.findIndex(s => s.dateKey === currentDateKey && s.time === time) 
                                : -1;
                              const isSelectedInPackage = slotIndexInPackage !== -1;
                              const isSelected = isSelectedInSingle || isSelectedInPackage;

                              return (
                                <button
                                  key={time}
                                  type="button"
                                  onClick={() => handleSelectTime(time)}
                                  disabled={isHoldingSlot}
                                  className={`px-3 sm:px-4 py-2.5 sm:py-3 rounded-xl border text-left transition-all flex items-center justify-between group cursor-pointer
                                    ${isSelected 
                                      ? 'bg-[#fbf0eb] border-2 border-[#c9542f] text-[#c9542f] shadow-xs' 
                                      : 'bg-white border-black/10 text-[#111010] hover:border-[#c9542f] hover:bg-[#fbf0eb]/50'
                                    }
                                    ${isHoldingSlot && !isSelected ? 'opacity-60 cursor-not-allowed' : ''}
                                  `}
                                >
                                  <div className="flex items-center gap-1.5 sm:gap-2 min-w-0">
                                    <Clock className={`text-xs shrink-0 ${isSelected ? 'text-[#c9542f]' : 'text-[#7a756b] group-hover:text-[#c9542f] transition-colors'}`} />
                                    <span className={`text-xs sm:text-sm font-sans tracking-wide truncate ${isSelected ? 'font-bold text-[#c9542f]' : 'font-medium'}`}>
                                      {time}
                                    </span>
                                  </div>
                                  {bookingMode === 'package' && isSelectedInPackage && (
                                    <span className="text-[0.62rem] bg-[#c9542f] text-white font-bold px-1.5 py-0.5 rounded-md flex items-center gap-1 shrink-0 ml-1">
                                      <Check size={10} weight="bold" /> #{slotIndexInPackage + 1}
                                    </span>
                                  )}
                                  {bookingMode === 'single' && isSelectedInSingle && (
                                    isHoldingSlot ? (
                                      <div className="w-3.5 h-3.5 border-2 border-[#c9542f]/30 border-t-[#c9542f] rounded-full animate-spin ml-1 shrink-0" />
                                    ) : (
                                      <CheckCircle className="text-[#c9542f] text-base shrink-0 ml-1" weight="fill" />
                                    )
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

        {/* Right Column - Sticky "Your Package" Summary Panel (Only in Package Mode) */}
        {bookingMode === 'package' && (
          <div className="w-full lg:w-[320px] xl:w-[350px] shrink-0 lg:sticky lg:top-24 self-start mt-6 lg:mt-0">
            <div className="p-4 sm:p-5 rounded-2xl bg-white/95 border border-[#e8c4e2] shadow-sm flex flex-col gap-3.5 animate-fadeIn">
              
              {/* Header */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-1.5 font-sans text-xs uppercase tracking-wider font-bold text-[#111010]">
                    <Package size={16} className="text-[#c9542f]" weight="bold" />
                    <span>Your Coaching Package</span>
                  </div>
                  <span className="text-xs font-bold text-[#c9542f]">
                    {selectedTier} Sessions
                  </span>
                </div>
                <p className="text-[0.72rem] text-[#7a756b] leading-relaxed">
                  Select your first session today. All {selectedTier} sessions are paid together in one transaction.
                </p>
              </div>

              {/* Session 1 Schedule Slot */}
              <div className="flex flex-col gap-1.5">
                <span className="font-sans text-[0.62rem] uppercase tracking-wider font-bold text-[#7a756b]">
                  Session 1 of {selectedTier} (Scheduling Now)
                </span>
                {selectedTime && selectedDay ? (
                  <div className="flex items-center justify-between p-2.5 rounded-xl bg-[#fbf0eb] border border-[#e8c4e2] text-xs text-[#111010]">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="w-5 h-5 rounded-full bg-[#c9542f] text-white flex items-center justify-center font-bold text-[0.62rem] shrink-0">
                        1
                      </span>
                      <span className="font-medium truncate">
                        {monthNames[currentMonth]} {selectedDay}, {currentYear} · {selectedTime}
                      </span>
                    </div>
                    <span className="text-[0.68rem] font-bold text-[#c9542f] uppercase shrink-0">Selected ✓</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 p-2.5 rounded-xl border border-dashed border-black/15 text-xs text-[#7a756b] bg-black/2">
                    <span className="w-5 h-5 rounded-full border border-black/20 text-[#7a756b] flex items-center justify-center font-medium text-[0.62rem] shrink-0">
                      1
                    </span>
                    <span className="italic">Pick Session 1 date & time on calendar...</span>
                  </div>
                )}
              </div>

              {/* Informational Message: Remaining Sessions Credited to Account */}
              <div className="p-3.5 rounded-xl bg-[#faf7f2] border border-[#ebdccc] flex items-start gap-2.5">
                <Sparkle size={18} className="text-[#c9542f] shrink-0 mt-0.5" weight="fill" />
                <div className="text-[0.75rem] text-[#555047] leading-relaxed">
                  <strong className="block text-[#111010] font-semibold mb-0.5">
                    Remaining {selectedTier - 1} Sessions Credited to Your Account
                  </strong>
                  Only your first session is scheduled today. The remaining <strong>{selectedTier - 1} sessions</strong> will be automatically credited to your account. You can book them anytime later based on your availability with zero extra payment.
                </div>
              </div>

              {/* Live Price Calculation Box */}
              <div className="pt-2.5 border-t border-black/8 flex flex-col gap-1 text-xs">
                <div className="flex items-center justify-between text-[#7a756b]">
                  <span>{selectedTier} Sessions × ₹{currentPerSessionRate.toLocaleString('en-IN')}</span>
                  <span>₹{packageSubtotal.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex items-center justify-between font-bold text-sm text-[#111010] pt-1.5 border-t border-black/5">
                  <span>Total Payable:</span>
                  <span className="text-[#c9542f] text-base">₹{packageTotal.toLocaleString('en-IN')}</span>
                </div>
              </div>

              {/* Direct Continue CTA inside the card */}
              <button
                type="button"
                onClick={handleContinue}
                disabled={!selectedDay || !selectedTime || isHoldingSlot}
                className={`w-full py-3 px-4 rounded-xl font-sans text-xs font-bold tracking-wider uppercase transition-all flex items-center justify-center gap-2 cursor-pointer mt-1
                  ${(!selectedDay || !selectedTime || isHoldingSlot)
                    ? 'bg-black/5 text-black/30 border border-black/10 cursor-not-allowed'
                    : 'bg-[#111010] text-white hover:bg-[#c9542f] shadow-md hover:-translate-y-0.5'
                  }
                `}
              >
                {!selectedDay || !selectedTime
                  ? 'Select Session 1 to Continue'
                  : 'Continue to Details'}
                <ArrowRight size={14} weight="bold" />
              </button>

            </div>
          </div>
        )}

      </div>

      {/* Bottom Action Bar */}
      <div className="mt-8 pt-6 border-t border-black/10 flex flex-col-reverse md:flex-row items-stretch md:items-center justify-between gap-4 md:gap-6">
        
        <div className="flex items-center justify-center md:justify-start gap-2.5 sm:gap-3 text-[#555047]">
          <CalendarBlank className="text-xl sm:text-2xl shrink-0 text-[#c9542f]" weight="light" />
          <span className="font-sans text-[0.72rem] sm:text-[0.78rem] font-light text-center md:text-left">
            {bookingMode === 'package' 
              ? `All ${selectedTier} sessions are 1-on-1 and last ${data.sessionDuration || 60} minutes each.`
              : `All sessions are 1-on-1 and last ${data.sessionDuration || 60} minutes.`}
          </span>
        </div>

        <div className="flex flex-col-reverse md:flex-row items-stretch md:items-center gap-3 sm:gap-4 md:gap-6">
          {onBack && (
            <button
              onClick={onBack}
              className="flex items-center justify-center gap-2 sm:gap-3 px-6 sm:px-8 py-3.5 sm:py-4 rounded-xl border border-black/10 hover:border-[#c9542f]/40 bg-white/90 hover:bg-white font-sans text-xs sm:text-sm font-semibold tracking-wide text-[#111010] transition-all w-full md:w-auto shadow-xs cursor-pointer"
            >
              <CaretLeft className="text-base sm:text-lg text-[#c9542f]" />
              BACK
            </button>
          )}
          
          <button
            onClick={handleContinue}
            disabled={!selectedDay || !selectedTime || isHoldingSlot}
            className={`flex items-center justify-center gap-2 sm:gap-3 px-6 sm:px-8 py-3.5 sm:py-4 rounded-xl font-sans text-xs sm:text-sm font-bold tracking-wider uppercase transition-all w-full md:w-auto cursor-pointer
              ${(!selectedDay || !selectedTime || isHoldingSlot)
                ? 'bg-black/5 text-black/30 border border-black/10 cursor-not-allowed' 
                : 'bg-[#111010] text-white hover:bg-[#c9542f] shadow-md hover:-translate-y-0.5'
              }
            `}
          >
            {bookingMode === 'package' && (!selectedDay || !selectedTime)
              ? 'SELECT SESSION 1 ON CALENDAR'
              : 'CONTINUE TO DETAILS'}
            <ArrowRight className="text-base sm:text-lg" weight="bold" />
          </button>
        </div>
      </div>

    </div>
  );
}
