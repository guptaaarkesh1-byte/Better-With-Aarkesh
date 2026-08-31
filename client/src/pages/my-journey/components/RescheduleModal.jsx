import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, CaretLeft, CaretRight, CalendarBlank } from '@phosphor-icons/react';

export default function RescheduleModal({ session, onClose, onSuccess }) {
  const [selectedDate, setSelectedDate] = useState(null); // YYYY-MM-DD
  const [selectedTime, setSelectedTime] = useState(null);
  
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  
  const [times, setTimes] = useState([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [reason, setReason] = useState('');

  const getDaysInMonth = (month, year) => new Date(year, month + 1, 0).getDate();
  const getStartingDayOfWeek = (month, year) => new Date(year, month, 1).getDay();

  const daysInMonth = getDaysInMonth(currentMonth, currentYear);
  const startingDayOfWeek = getStartingDayOfWeek(currentMonth, currentYear);
  const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

  // Fetch slots when date is selected
  useEffect(() => {
    if (!selectedDate) {
      setTimes([]);
      return;
    }

    const fetchSlots = async () => {
      setLoadingSlots(true);
      try {
        const emailQuery = session.email ? `&email=${encodeURIComponent(session.email)}` : '';
        const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/cal/slots?date=${selectedDate}${emailQuery}`);
        if (!res.ok) throw new Error('Failed to fetch slots');
        const resData = await res.json();
        
        const dailySlots = resData?.data?.slots?.[selectedDate] || [];
        const formattedTimes = dailySlots.map(slot => {
          const dateObj = new Date(slot.time);
          return dateObj.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
        });
        setTimes(formattedTimes);
      } catch (err) {
        console.error(err);
      } finally {
        setLoadingSlots(false);
      }
    };
    fetchSlots();
  }, [selectedDate, session.email]);

  const handleSubmit = async () => {
    if (!selectedDate || !selectedTime) return;
    setSubmitting(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/appointments/${session._id || session.id}/reschedule`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ date: selectedDate, time: selectedTime, reason })
      });
      
      if (res.ok) {
        onSuccess();
      } else {
        alert("Failed to submit reschedule request.");
      }
    } catch (err) {
      console.error(err);
      alert("An error occurred.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(currentYear + 1);
    } else {
      setCurrentMonth(currentMonth + 1);
    }
  };

  const handlePrevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(currentYear - 1);
    } else {
      setCurrentMonth(currentMonth - 1);
    }
  };

  return createPortal(
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm transition-opacity" onClick={onClose} />
      
      {/* Modal */}
      <div className="relative bg-[#111] border border-white/10 rounded-2xl w-[80vw] max-w-[1200px] max-h-[90vh] overflow-y-auto shadow-2xl flex flex-col" data-lenis-prevent="true">
        <div className="sticky top-0 bg-[#111] border-b border-white/5 p-6 flex items-center justify-between z-10">
          <h2 className="font-serif text-2xl text-white">Reschedule Session</h2>
          <button onClick={onClose} className="p-2 text-white/50 hover:text-white transition-colors">
            <X size={24} />
          </button>
        </div>

        <div className="p-6 md:p-8 flex flex-col gap-8">
          <p className="text-white/60 text-sm">
            Please select a new date and time for your session. Your request will be sent to admin for approval.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Calendar */}
            <div className="flex flex-col gap-6">
              <div className="flex items-center justify-between bg-black/40 border border-white/5 p-3 rounded-lg">
                <button onClick={handlePrevMonth} className="p-1 text-white/50 hover:text-white"><CaretLeft size={20}/></button>
                <div className="font-sans text-sm uppercase tracking-[0.2em] text-white">
                  {monthNames[currentMonth]} {currentYear}
                </div>
                <button onClick={handleNextMonth} className="p-1 text-white/50 hover:text-white"><CaretRight size={20}/></button>
              </div>

              <div className="grid grid-cols-7 gap-1">
                {['S','M','T','W','T','F','S'].map((d, i) => (
                  <div key={i} className="text-center font-sans text-xs text-white/30 py-2">{d}</div>
                ))}
                {Array.from({ length: startingDayOfWeek }).map((_, i) => (
                  <div key={`empty-${i}`} className="p-2" />
                ))}
                {Array.from({ length: daysInMonth }).map((_, i) => {
                  const day = i + 1;
                  const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                  const isSelected = selectedDate === dateStr;
                  const isPast = new Date(dateStr) < new Date(new Date().setHours(0,0,0,0));
                  
                  return (
                    <button 
                      key={day}
                      disabled={isPast}
                      onClick={() => { setSelectedDate(dateStr); setSelectedTime(null); }}
                      className={`
                        aspect-square flex items-center justify-center rounded-full font-sans text-sm transition-all
                        ${isPast ? 'text-white/20 cursor-not-allowed' : 'text-white hover:bg-white/10'}
                        ${isSelected ? 'bg-[#c79c6e] text-black hover:bg-[#b98a56]' : ''}
                      `}
                    >
                      {day}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Times */}
            <div className="flex flex-col gap-6 border-t md:border-t-0 md:border-l border-white/5 pt-6 md:pt-0 md:pl-8">
              <div className="flex items-center gap-2 text-white/40">
                <CalendarBlank size={20} />
                <span className="font-sans text-sm uppercase tracking-wider">
                  {selectedDate ? new Date(selectedDate).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' }) : 'Select a date'}
                </span>
              </div>

              {loadingSlots ? (
                <div className="flex-1 flex items-center justify-center">
                  <div className="w-5 h-5 border-2 border-white/20 border-t-[#c79c6e] rounded-full animate-spin"></div>
                </div>
              ) : selectedDate && times.length > 0 ? (
                <div className="grid grid-cols-2 gap-3 max-h-[250px] overflow-y-auto pr-2 custom-scrollbar" data-lenis-prevent="true">
                  {times.map((time, i) => (
                    <button
                      key={i}
                      onClick={() => setSelectedTime(time)}
                      className={`
                        py-3 px-2 text-center rounded border transition-all font-sans text-sm
                        ${selectedTime === time 
                          ? 'border-[#c79c6e] bg-[#c79c6e]/10 text-[#c79c6e]' 
                          : 'border-white/10 text-white hover:border-white/30 hover:bg-white/5'
                        }
                      `}
                    >
                      {time}
                    </button>
                  ))}
                </div>
              ) : selectedDate ? (
                <div className="flex-1 flex items-center justify-center text-white/40 text-sm text-center">
                  No slots available for this date.
                </div>
              ) : (
                <div className="flex-1 flex items-center justify-center text-white/20 text-sm text-center">
                  Available times will appear here.
                </div>
              )}
              <div className="flex flex-col gap-2 pt-4 mt-auto">
                <label htmlFor="reason" className="text-white/60 text-sm">Reason for rescheduling (Optional)</label>
                <textarea
                  id="reason"
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  className="w-full h-24 bg-[#050505] border border-white/10 rounded-lg p-3 text-white placeholder-white/30 text-sm focus:outline-none focus:border-[#c79c6e]/50 transition-colors resize-none custom-scrollbar"
                  placeholder="E.g., I have a sudden work conflict..."
                />
              </div>
            </div>
          </div>
        </div>

        <div className="p-6 border-t border-white/5 bg-black/20 flex justify-end">
          <button 
            disabled={!selectedDate || !selectedTime || submitting}
            onClick={handleSubmit}
            className="px-8 py-3 bg-[#c79c6e] hover:bg-[#b98a56] text-black font-sans text-xs uppercase tracking-[0.2em] font-medium rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {submitting ? 'SUBMITTING...' : 'REQUEST RESCHEDULE'}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}
