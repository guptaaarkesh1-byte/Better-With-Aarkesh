import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Link } from 'react-router-dom';
import { CalendarBlank, CheckCircle, PencilSimple, FileText, Clock, VideoCamera, User, CalendarPlus, ArrowsClockwise, XCircle, X, DotsThree, CurrencyInr, Sparkle, ArrowRight } from '@phosphor-icons/react';
import { generateGoogleCalendarLink } from '../../../utils/calendar';
import RescheduleModal from './RescheduleModal';

const formatTimeRange = (timeStr, duration = 60) => {
  if (!timeStr) return '';
  if (timeStr.includes('–') || timeStr.includes(' - ') || timeStr.includes(' to ')) {
    return timeStr;
  }

  const match = timeStr.match(/(\d+):?(\d*)\s*(AM|PM)?/i);
  if (!match) return timeStr;

  let [_, hoursStr, minutesStr, ampmStr] = match;
  let hours = parseInt(hoursStr, 10);
  let minutes = minutesStr ? parseInt(minutesStr, 10) : 0;
  let ampm = ampmStr ? ampmStr.toUpperCase() : 'AM';

  let totalMinutes = (hours % 12 + (ampm === 'PM' ? 12 : 0)) * 60 + minutes;
  let endTotalMinutes = totalMinutes + (parseInt(duration, 10) || 60);

  let endHours = Math.floor((endTotalMinutes / 60) % 24);
  let endMinutes = endTotalMinutes % 60;
  let endAmpm = endHours >= 12 ? 'PM' : 'AM';
  let endDisplayHours = endHours % 12 === 0 ? 12 : endHours % 12;

  const formattedStartTime = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')} ${ampm}`;
  const formattedEndTime = `${endDisplayHours.toString().padStart(2, '0')}:${endMinutes.toString().padStart(2, '0')} ${endAmpm}`;

  return `${formattedStartTime} – ${formattedEndTime}`;
};

export default function CoachingTab() {
  const [activeTab, setActiveTab] = useState('UPCOMING');
  const [selectedSession, setSelectedSession] = useState(null);
  const [sessionModalTab, setSessionModalTab] = useState('details'); // 'details' | 'notes'
  const [prepareSession, setPrepareSession] = useState(null);
  const [rescheduleSession, setRescheduleSession] = useState(null);
  const [cancelSession, setCancelSession] = useState(null);
  const [isCancelling, setIsCancelling] = useState(false);
  const [optionsOpenId, setOptionsOpenId] = useState(null);

  const handleRescheduleSuccess = () => {
    setRescheduleSession(null);
    window.location.reload(); // Simple way to refresh data
  };

  useEffect(() => {
    if (selectedSession || prepareSession) {
      document.body.style.overflow = 'hidden';
      document.documentElement.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
      document.documentElement.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
      document.documentElement.style.overflow = 'unset';
    };
  }, [selectedSession, prepareSession]);

  const tabs = ['UPCOMING', 'COMPLETED'];
  
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userProfile, setUserProfile] = useState(null);
  const [feeSettings, setFeeSettings] = useState({ fee60min: 1000, fee90min: 1500 });

  useEffect(() => {
    const fetchFees = async () => {
      try {
        const res = await fetch(`${import.meta.env.VITE_API_URL}/api/payment/fees`);
        if (res.ok) {
          const data = await res.json();
          setFeeSettings({
            fee60min: data.fee60min || 1000,
            fee90min: data.fee90min || 1500
          });
        }
      } catch (err) {
        console.error('Failed to fetch fees:', err);
      }
    };
    fetchFees();
  }, []);

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) return;
        const res = await fetch(`${import.meta.env.VITE_API_URL}/api/auth/me`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          setUserProfile(data);
          localStorage.setItem('userInfo', JSON.stringify(data));
        }
      } catch (err) {
        console.error('Failed to fetch user profile:', err);
      }
    };
    fetchUserProfile();
  }, []);

  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          setLoading(false);
          return;
        }
        const res = await fetch(`${import.meta.env.VITE_API_URL}/api/appointments`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          const formatted = data.map(app => {
            let dateObj;
            if (app.date && app.date.includes('-') && app.date.split('-').length === 3) {
              const [y, m, d] = app.date.split('-');
              dateObj = new Date(y, m - 1, d);
            } else {
              dateObj = new Date(app.date);
            }

            let formattedDate = app.date;
            
            const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
            const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

            if (!isNaN(dateObj)) {
              formattedDate = `${days[dateObj.getDay()]}, ${String(dateObj.getDate()).padStart(2, '0')} ${months[dateObj.getMonth()]} ${dateObj.getFullYear()}`;
            }

            let formattedRescheduleDate = null;
            if (app.rescheduleRequest && app.rescheduleRequest.date) {
               let resDateObj;
               if (app.rescheduleRequest.date.includes('-') && app.rescheduleRequest.date.split('-').length === 3) {
                 const [y, m, d] = app.rescheduleRequest.date.split('-');
                 resDateObj = new Date(y, m - 1, d);
               } else {
                 resDateObj = new Date(app.rescheduleRequest.date);
               }
               formattedRescheduleDate = app.rescheduleRequest.date;
               if (!isNaN(resDateObj)) {
                 formattedRescheduleDate = `${days[resDateObj.getDay()]}, ${String(resDateObj.getDate()).padStart(2, '0')} ${months[resDateObj.getMonth()]} ${resDateObj.getFullYear()}`;
               }
               
               // Safely attach it to the reschedule request object for the modal
               app.rescheduleRequest = {
                 ...app.rescheduleRequest,
                 formattedDate: formattedRescheduleDate
               };
            }

            // Check if UPCOMING session date and time has passed (Expired / Missed)
            let isExpired = false;
            if (app.status === 'UPCOMING' && app.date && app.time) {
              try {
                let startDt;
                if (app.date.includes('-') && app.date.split('-').length === 3) {
                  const [y, m, d] = app.date.split('-').map(Number);
                  startDt = new Date(y, m - 1, d);
                } else {
                  startDt = new Date(app.date);
                }

                const timeMatch = app.time.match(/(\d+):?(\d*)\s*(AM|PM)?/i);
                if (timeMatch && !isNaN(startDt.getTime())) {
                  let [_, hStr, minStr, ampm] = timeMatch;
                  let hours = parseInt(hStr, 10);
                  const minutes = parseInt(minStr, 10) || 0;
                  if (ampm) {
                    if (ampm.toUpperCase() === 'PM' && hours < 12) hours += 12;
                    if (ampm.toUpperCase() === 'AM' && hours === 12) hours = 0;
                  }
                  startDt.setHours(hours, minutes, 0, 0);
                  const durationMin = app.sessionDuration || app.duration || 60;
                  const endDt = new Date(startDt.getTime() + (durationMin * 60 * 1000));
                  if (new Date() > endDt) {
                    isExpired = true;
                  }
                } else if (!isNaN(startDt.getTime())) {
                  const endOfDay = new Date(startDt);
                  endOfDay.setHours(23, 59, 59, 999);
                  if (new Date() > endOfDay) {
                    isExpired = true;
                  }
                }
              } catch (dateParseErr) {
                console.error('Error checking session expiry:', dateParseErr);
              }
            }

            let calculatedBadge = 'CONFIRMED';
            if (app.status === 'COMPLETED') {
              calculatedBadge = 'COMPLETED';
            } else if (app.status === 'CANCELLED') {
              calculatedBadge = 'CANCELLED';
            } else if (app.status === 'REFUNDED') {
              calculatedBadge = 'REFUNDED';
            } else if (isExpired) {
              calculatedBadge = 'EXPIRED';
            }

            return {
              ...app,
              id: app._id,
              status: app.status,
              isExpired,
              badge: calculatedBadge,
              date: formattedDate,
              rawDate: app.date, // Keep raw date if needed for operations
              time: app.time,
              durationStr: `${app.sessionDuration || app.duration || 60}-MINUTE CONVERSATION`,
              person: app.name,
              primaryAction: app.status === 'COMPLETED' ? 'VIEW SHARED NOTES' : 'VIEW APPOINTMENT',
            };
          });
          setAppointments(formatted);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchAppointments();
  }, []);
  
  const filteredAppointments = appointments.filter(app => {
    if (activeTab === 'UPCOMING') return app.status === 'UPCOMING' || app.status === 'CANCELLED';
    return app.status === activeTab;
  });

  const handleCancelAppointment = async () => {
    if (!cancelSession) return;
    setIsCancelling(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/appointments/${cancelSession.id}/cancel`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        window.location.reload();
      } else {
        alert("Failed to cancel appointment.");
      }
    } catch (err) {
      console.error(err);
      alert("Error cancelling appointment.");
    } finally {
      setIsCancelling(false);
      setCancelSession(null);
    }
  };

  return (
    <div className="w-full h-full min-h-[500px] rounded-2xl border border-black/10 bg-[#f5f1e8] p-4 sm:p-6 md:p-10 lg:p-12 flex flex-col mb-20 relative overflow-hidden shadow-xs">

      {/* Header */}
      <div className="mb-6 md:mb-10 relative z-10">
        <span className="font-sans text-[0.65rem] uppercase tracking-[0.25em] md:tracking-[0.3em] font-bold text-[#c9542f] block mb-2 md:mb-3">
          YOUR SCHEDULE
        </span>
        <h2 className="font-serif text-2xl sm:text-3xl md:text-5xl text-[#111010] mb-2 md:mb-4 tracking-tight">Coaching Appointments</h2>
        <p className="font-sans text-[#555047] font-light text-sm sm:text-base md:text-lg max-w-xl">
          Manage your upcoming sessions and review past conversations.
        </p>
      </div>

      {/* Course Student Complimentary Sessions Widget */}
      {(userProfile?.courseSessionsGranted || (userProfile?.freeSessions ?? 0) > 0) && (
        <div className="mb-6 md:mb-10 relative z-10 overflow-hidden rounded-xl md:rounded-2xl border border-[#e8c4e2] bg-[#fbf0eb] p-4 sm:p-6 md:p-8 shadow-xs">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 md:gap-6">
            <div className="space-y-2">
              <div className="flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white border border-[#e8c4e2] text-[#c9542f] text-[0.6rem] sm:text-[0.65rem] font-semibold uppercase tracking-wider shadow-2xs">
                  <Sparkle size={12} weight="fill" /> Course Perk
                </span>
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#e5f2e8] border border-[#a8d5b1] text-[#2f4a34] text-[0.6rem] sm:text-[0.65rem] font-semibold uppercase tracking-wider">
                  <CheckCircle size={12} weight="fill" /> {userProfile?.freeSessions ?? 0} of 3 Credits Remaining
                </span>
              </div>
              <h3 className="font-serif text-lg sm:text-xl md:text-2xl text-[#111010] font-normal">
                Complimentary 1-on-1 Coaching Sessions
              </h3>
              <p className="text-[#555047] text-xs sm:text-sm font-light max-w-xl leading-relaxed">
                As an enrolled Mastery Course student, your membership includes 3 private coaching sessions with Aarkesh at ₹0.
              </p>
            </div>

            {(userProfile?.freeSessions ?? 0) > 0 ? (
              <Link
                to="/book"
                className="w-full sm:w-auto shrink-0 inline-flex items-center justify-center gap-2 px-5 py-3 sm:px-6 sm:py-3.5 rounded-xl bg-[#c9542f] text-white font-semibold text-xs uppercase tracking-[0.15em] hover:bg-[#a64117] hover:scale-[1.02] transition-all shadow-md text-center"
              >
                <CalendarPlus size={16} weight="bold" /> Book Free Session <ArrowRight size={14} weight="bold" />
              </Link>
            ) : (
              <span className="shrink-0 inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-white border border-black/10 text-[#7a756b] text-xs font-medium shadow-2xs">
                <CheckCircle size={15} weight="fill" className="text-[#c9542f]" /> All 3 Sessions Utilized
              </span>
            )}
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="flex items-center gap-6 md:gap-8 border-b border-black/10 mb-6 md:mb-10 relative z-10">
        {tabs.map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`pb-3 md:pb-4 font-sans text-[0.65rem] sm:text-[0.7rem] uppercase tracking-[0.15em] sm:tracking-[0.2em] font-bold transition-all duration-300 relative cursor-pointer ${
              activeTab === tab ? 'text-[#c9542f]' : 'text-[#7a756b] hover:text-[#111010]'
            }`}
          >
            {tab}
            {activeTab === tab && (
              <span className="absolute bottom-[-1px] left-0 w-full h-[2px] bg-[#c9542f]" />
            )}
          </button>
        ))}
      </div>

      {/* List */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 md:gap-8 relative z-10">
        {loading ? (
          <div className="py-16 flex flex-col items-center justify-center border border-black/10 rounded-2xl bg-white shadow-xs">
            <span className="font-sans text-[#7a756b] text-sm tracking-wide">Loading...</span>
          </div>
        ) : filteredAppointments.length === 0 ? (
          <div className="py-16 flex flex-col items-center justify-center border border-black/10 rounded-2xl bg-white shadow-xs">
            <CalendarBlank size={32} className="text-[#7a756b]/40 mb-4" />
            <span className="font-sans text-[#7a756b] text-sm tracking-wide">No {activeTab.toLowerCase()} appointments found.</span>
          </div>
        ) : (
          filteredAppointments.map(app => (
            <div key={app.id} className="group/card w-full flex flex-col items-center">
                {/* Main Card */}
                <div className="w-full rounded-xl border border-black/10 bg-white p-4 sm:p-6 md:p-8 flex flex-col justify-between gap-5 sm:gap-6 hover:border-[#c9542f]/50 transition-all duration-300 shadow-xs hover:shadow-md relative z-10 h-full overflow-hidden">
                  
                  {app.rescheduleRequest?.status === 'APPROVED' && (
                    <div className="absolute top-0 right-0 bg-[#e5f2e8] border-b border-l border-[#a8d5b1] px-3 sm:px-4 py-1.5 sm:py-2 rounded-bl-xl text-[#2f4a34] font-sans text-[0.55rem] sm:text-[0.6rem] uppercase tracking-[0.15em] sm:tracking-[0.2em] font-semibold flex items-center gap-1.5 z-20">
                      <CheckCircle weight="fill" size={13} />
                      RESCHEDULE APPROVED
                    </div>
                  )}
                  {app.rescheduleRequest?.status === 'PENDING' && (
                    <div className="absolute top-0 right-0 bg-amber-50 border-b border-l border-amber-200 px-3 sm:px-4 py-1.5 sm:py-2 rounded-bl-xl text-amber-800 font-sans text-[0.55rem] sm:text-[0.6rem] uppercase tracking-[0.15em] sm:tracking-[0.2em] font-semibold flex items-center gap-1.5 z-20">
                      <Clock weight="fill" size={13} />
                      RESCHEDULE PENDING
                    </div>
                  )}
                  {app.rescheduleRequest?.status === 'REJECTED' && (
                    <div className="absolute top-0 right-0 bg-rose-50 border-b border-l border-rose-200 px-3 sm:px-4 py-1.5 sm:py-2 rounded-bl-xl text-rose-700 font-sans text-[0.55rem] sm:text-[0.6rem] uppercase tracking-[0.15em] sm:tracking-[0.2em] font-semibold flex items-center gap-1.5 z-20">
                      <XCircle weight="fill" size={13} />
                      RESCHEDULE DECLINED
                    </div>
                  )}
                  {app.status === 'CANCELLED' && (
                    <div className="absolute top-0 right-0 bg-rose-50 border-b border-l border-rose-200 px-3 sm:px-4 py-1.5 sm:py-2 rounded-bl-xl text-rose-700 font-sans text-[0.55rem] sm:text-[0.6rem] uppercase tracking-[0.15em] sm:tracking-[0.2em] font-semibold flex items-center gap-1.5 z-20">
                      <XCircle weight="fill" size={13} />
                      CANCELLED
                    </div>
                  )}
                  {app.isExpired && app.status === 'UPCOMING' && (
                    <div className="absolute top-0 right-0 bg-zinc-100 border-b border-l border-zinc-300 px-3 sm:px-4 py-1.5 sm:py-2 rounded-bl-xl text-zinc-600 font-sans text-[0.55rem] sm:text-[0.6rem] uppercase tracking-[0.15em] sm:tracking-[0.2em] font-semibold flex items-center gap-1.5 z-20">
                      <Clock weight="bold" size={13} />
                      SESSION EXPIRED
                    </div>
                  )}

                  {/* Top: Status & Details */}
                  <div className="flex flex-col gap-3 sm:gap-4 pt-2 sm:pt-0">
                    <div className={`flex items-center gap-2 ${
                      app.badge === 'COMPLETED' 
                        ? 'text-emerald-700' 
                        : app.badge === 'EXPIRED'
                        ? 'text-zinc-500'
                        : app.badge === 'REFUNDED'
                        ? 'text-purple-700'
                        : app.badge === 'CANCELLED'
                        ? 'text-rose-700'
                        : 'text-[#c9542f]'
                    } font-sans text-[0.6rem] sm:text-[0.65rem] uppercase tracking-[0.15em] sm:tracking-[0.2em] font-bold`}>
                      <span>{app.badge === 'EXPIRED' ? 'SESSION EXPIRED' : app.badge}</span>
                      {app.badge === 'CONFIRMED' && <CheckCircle weight="fill" size={14} />}
                      {app.badge === 'PENDING' && <Clock weight="fill" size={14} />}
                      {app.badge === 'COMPLETED' && <CheckCircle weight="fill" size={14} />}
                      {app.badge === 'EXPIRED' && <Clock weight="fill" size={14} className="text-zinc-400" />}
                    </div>

                    <div className="flex flex-col gap-1 sm:gap-1.5">
                      <h3 className={`font-serif text-xl sm:text-2xl md:text-[1.7rem] uppercase tracking-wide leading-tight transition-colors ${app.isExpired ? 'text-[#555047] group-hover/card:text-[#111010]' : 'text-[#111010] group-hover/card:text-[#c9542f]'}`}>
                        {app.date}
                      </h3>
                      <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3 font-sans text-[0.65rem] sm:text-[0.7rem] tracking-[0.12em] sm:tracking-[0.15em] text-[#555047] uppercase mt-1">
                        <span>{formatTimeRange(app.time, app.duration || app.sessionDuration || 60)}</span>
                        <span className="hidden sm:block w-1 h-1 rounded-full bg-black/20"></span>
                        <span>{app.durationStr}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2.5 sm:gap-3 mt-1 text-[#111010] font-sans text-[0.7rem] sm:text-[0.75rem] tracking-[0.12em] sm:tracking-[0.15em] uppercase font-semibold">
                      <User size={18} weight="regular" className="text-[#c9542f] shrink-0" />
                      <span>{app.person}</span>
                    </div>
                  </div>

                  {/* Bottom: Main Action Button & Options */}
                  <div className="w-full shrink-0 flex items-center mt-2 gap-2 relative">
                    <button 
                      onClick={() => {
                        setSelectedSession(app);
                        setSessionModalTab(app.status === 'COMPLETED' || app.primaryAction === 'VIEW SHARED NOTES' ? 'notes' : 'details');
                      }}
                      className="flex-1 py-3 sm:py-3.5 px-4 sm:px-6 rounded-xl border border-black/15 text-[#c9542f] hover:border-[#c9542f] hover:bg-[#fbf0eb] font-sans text-[0.6rem] sm:text-[0.65rem] uppercase tracking-[0.15em] sm:tracking-[0.2em] font-bold transition-all text-center cursor-pointer shadow-2xs"
                    >
                      {app.primaryAction}
                    </button>
                    
                    {app.status === 'UPCOMING' && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setOptionsOpenId(optionsOpenId === app.id ? null : app.id);
                        }}
                        className={`p-3 sm:p-3.5 rounded-xl border transition-colors flex items-center justify-center shrink-0 cursor-pointer ${optionsOpenId === app.id ? 'bg-[#fbf0eb] border-[#c9542f] text-[#c9542f]' : 'border-black/15 text-[#555047] hover:text-[#111010] hover:border-black/30 hover:bg-black/5'}`}
                      >
                        <DotsThree size={18} weight="bold" />
                      </button>
                    )}

                    {/* Popover Menu */}
                    {optionsOpenId === app.id && app.status === 'UPCOMING' && (
                      <div className="absolute bottom-full right-0 mb-3 w-48 sm:w-56 bg-white border border-black/10 rounded-xl shadow-[0_10px_40px_rgba(0,0,0,0.15)] flex flex-col py-2 z-50 animate-in fade-in slide-in-from-bottom-2 duration-200">
                        
                        {!app.isExpired ? (
                          <>
                            <a 
                              href={generateGoogleCalendarLink(app.date, app.time, app.duration)}
                              target="_blank"
                              rel="noopener noreferrer"
                              onClick={() => setOptionsOpenId(null)}
                              className="w-full flex items-center gap-2.5 sm:gap-3 px-3.5 sm:px-4 py-2.5 sm:py-3 text-left text-[#555047] hover:text-[#111010] hover:bg-[#fbf0eb]/60 font-sans text-[0.6rem] sm:text-[0.65rem] uppercase tracking-[0.15em] sm:tracking-[0.2em] font-semibold transition-colors"
                            >
                              <CalendarPlus size={15} className="text-[#c9542f] shrink-0" />
                              <span>ADD TO CALENDAR</span>
                            </a>
                            
                            <button 
                              onClick={() => {
                                setRescheduleSession(app);
                                setOptionsOpenId(null);
                              }}
                              disabled={app.rescheduleRequest?.status === 'PENDING' || app.rescheduleRequest?.status === 'APPROVED'}
                              className="w-full flex items-center gap-2.5 sm:gap-3 px-3.5 sm:px-4 py-2.5 sm:py-3 text-left text-[#555047] hover:text-[#111010] hover:bg-[#fbf0eb]/60 font-sans text-[0.6rem] sm:text-[0.65rem] uppercase tracking-[0.15em] sm:tracking-[0.2em] font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                            >
                              <ArrowsClockwise size={15} className="text-amber-600 shrink-0" />
                              <span>
                                {app.rescheduleRequest?.status === 'PENDING' 
                                  ? 'RESCHEDULE PENDING' 
                                  : app.rescheduleRequest?.status === 'APPROVED' 
                                    ? 'RESCHEDULED' 
                                    : 'RESCHEDULE'}
                              </span>
                            </button>
                            
                            <div className="h-px w-full bg-black/10 my-1"></div>

                            <button 
                              onClick={() => {
                                setCancelSession(app);
                                setOptionsOpenId(null);
                              }}
                              className="w-full flex items-center gap-2.5 sm:gap-3 px-3.5 sm:px-4 py-2.5 sm:py-3 text-left text-red-600 hover:text-red-700 hover:bg-red-50 font-sans text-[0.6rem] sm:text-[0.65rem] uppercase tracking-[0.15em] sm:tracking-[0.2em] font-semibold transition-colors cursor-pointer"
                            >
                              <XCircle size={15} className="shrink-0" />
                              <span>CANCEL</span>
                            </button>
                          </>
                        ) : (
                          <a
                            href="/book"
                            onClick={() => setOptionsOpenId(null)}
                            className="w-full flex items-center gap-2.5 sm:gap-3 px-3.5 sm:px-4 py-2.5 sm:py-3 text-left text-[#c9542f] hover:bg-[#fbf0eb] font-sans text-[0.6rem] sm:text-[0.65rem] uppercase tracking-[0.15em] sm:tracking-[0.2em] font-semibold transition-colors"
                          >
                            <CalendarPlus size={15} className="text-[#c9542f] shrink-0" />
                            <span>BOOK NEW SESSION</span>
                          </a>
                        )}

                      </div>
                    )}
                  </div>
                </div>
              </div>
          ))
        )}
      </div>

      {/* Modal for Session Details */}
      {selectedSession && createPortal(
        <div 
          data-lenis-prevent="true" 
          className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-4 md:p-8 bg-black/50 backdrop-blur-sm animate-in fade-in duration-300 overscroll-none"
        >
          {/* Clickable backdrop to close */}
          <div className="absolute inset-0" onClick={() => setSelectedSession(null)} />
          
          {/* Modal Content */}
          <div className="relative w-full max-w-3xl bg-[#f5f1e8] border border-black/10 rounded-2xl sm:rounded-3xl shadow-[0_20px_60px_rgba(0,0,0,0.15)] p-5 sm:p-7 md:p-10 flex flex-col max-h-[90vh] sm:max-h-[85vh] animate-in slide-in-from-bottom-8 duration-500">
            
            {/* Close Button */}
            <button 
              onClick={() => setSelectedSession(null)}
              className="absolute top-4 right-4 sm:top-5 sm:right-5 md:top-6 md:right-6 p-2 rounded-full text-[#7a756b] hover:text-[#111010] hover:bg-black/5 transition-colors z-10 cursor-pointer"
            >
              <X size={20} className="sm:w-6 sm:h-6" />
            </button>

            {/* Modal Tab Navigation */}
            {(() => {
              const hasNotes = Boolean(selectedSession.coachNotes && (
                typeof selectedSession.coachNotes === 'string' 
                  ? selectedSession.coachNotes.trim().length > 0 
                  : Array.isArray(selectedSession.coachNotes) && selectedSession.coachNotes.length > 0
              ));

              return (
                <div className="flex items-center gap-4 sm:gap-6 border-b border-black/10 pb-3 sm:pb-4 mb-4 pr-10 overflow-x-auto [scrollbar-width:none]">
                  <button 
                    onClick={() => setSessionModalTab('details')}
                    className={`font-sans text-[0.65rem] sm:text-[0.7rem] uppercase tracking-[0.15em] sm:tracking-[0.2em] font-bold transition-colors relative pb-1 flex items-center gap-1.5 sm:gap-2 shrink-0 cursor-pointer ${sessionModalTab === 'details' ? 'text-[#c9542f]' : 'text-[#7a756b] hover:text-[#111010]'}`}
                  >
                    <CalendarBlank size={15} />
                    <span>Appointment Details</span>
                    {sessionModalTab === 'details' && (
                      <div className="absolute bottom-[-13px] sm:bottom-[-17px] left-0 w-full h-[2px] bg-[#c9542f]" />
                    )}
                  </button>
                  <button 
                    onClick={() => setSessionModalTab('notes')}
                    className={`font-sans text-[0.65rem] sm:text-[0.7rem] uppercase tracking-[0.15em] sm:tracking-[0.2em] font-bold transition-colors relative pb-1 flex items-center gap-1.5 sm:gap-2 shrink-0 cursor-pointer ${sessionModalTab === 'notes' ? 'text-[#c9542f]' : 'text-[#7a756b] hover:text-[#111010]'}`}
                  >
                    <FileText size={15} />
                    <span>Coach's Session Notes</span>
                    {hasNotes && (
                      <span className="w-2 h-2 rounded-full bg-[#c9542f] animate-pulse" />
                    )}
                    {sessionModalTab === 'notes' && (
                      <div className="absolute bottom-[-13px] sm:bottom-[-17px] left-0 w-full h-[2px] bg-[#c9542f]" />
                    )}
                  </button>
                </div>
              );
            })()}

            {/* Scrollable Content Area */}
            <div className="overflow-y-auto overscroll-contain pr-1 sm:pr-2 md:pr-4 -mr-1 sm:-mr-2 md:-mr-4 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
              {sessionModalTab === 'details' ? (
                /* Tab 1: Appointment Details */
                <div className="flex flex-col gap-6 sm:gap-8 pb-4 pt-2 animate-in fade-in duration-300">
                  
                  {/* Date */}
                  <div className="flex gap-3.5 sm:gap-5">
                    <CalendarBlank size={20} className="text-[#c9542f] shrink-0 mt-0.5" />
                    <div className="flex flex-col gap-1">
                      <span className="font-sans text-[0.65rem] sm:text-[0.7rem] text-[#7a756b] font-medium uppercase tracking-wider">Date</span>
                      <span className="font-sans text-base sm:text-lg md:text-xl text-[#111010] font-semibold">{selectedSession.date}</span>
                    </div>
                  </div>

                  {/* Time */}
                  <div className="flex gap-3.5 sm:gap-5">
                    <Clock size={20} className="text-[#c9542f] shrink-0 mt-0.5" />
                    <div className="flex flex-col gap-1">
                      <span className="font-sans text-[0.65rem] sm:text-[0.7rem] text-[#7a756b] font-medium uppercase tracking-wider">Time</span>
                      <span className="font-sans text-base sm:text-lg md:text-xl text-[#111010] font-semibold">{formatTimeRange(selectedSession.time, selectedSession.duration || 60)}</span>
                    </div>
                  </div>

                  {/* Session Type */}
                  <div className="flex gap-3.5 sm:gap-5">
                    <User size={20} className="text-[#c9542f] shrink-0 mt-0.5" />
                    <div className="flex flex-col gap-1">
                      <span className="font-sans text-[0.65rem] sm:text-[0.7rem] text-[#7a756b] font-medium uppercase tracking-wider">Session Type</span>
                      <span className="font-sans text-base sm:text-lg md:text-xl text-[#111010] font-semibold">1-on-1 Coaching Session</span>
                    </div>
                  </div>

                  {/* Duration */}
                  <div className="flex gap-3.5 sm:gap-5">
                    <Clock size={20} className="text-[#c9542f] shrink-0 mt-0.5" />
                    <div className="flex flex-col gap-1">
                      <span className="font-sans text-[0.65rem] sm:text-[0.7rem] text-[#7a756b] font-medium uppercase tracking-wider">Duration</span>
                      <span className="font-sans text-base sm:text-lg md:text-xl text-[#111010] font-semibold">{selectedSession.duration || 60} minutes</span>
                    </div>
                  </div>

                  {/* Where */}
                  <div className="flex gap-3.5 sm:gap-5">
                    <VideoCamera size={20} className="text-[#c9542f] shrink-0 mt-0.5" />
                    <div className="flex flex-col gap-1">
                      <span className="font-sans text-[0.65rem] sm:text-[0.7rem] text-[#7a756b] font-medium uppercase tracking-wider">Where</span>
                      <div className="font-sans text-base sm:text-lg md:text-xl text-[#111010] font-semibold flex flex-wrap items-center gap-1.5 sm:gap-2">
                        Google Meet
                        {selectedSession.meetLink ? (
                           <a href={selectedSession.meetLink} target="_blank" rel="noopener noreferrer" className="text-[#c9542f] hover:underline text-xs sm:text-sm md:text-base ml-1">(Join Link)</a>
                        ) : (
                           <span className="text-[#7a756b] text-xs sm:text-sm md:text-base ml-1 font-normal">(Link will be shared after booking)</span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Total Amount */}
                  <div className="flex gap-3.5 sm:gap-5">
                    <CurrencyInr size={20} className="text-[#c9542f] shrink-0 mt-0.5" />
                    <div className="flex flex-col gap-1">
                      <span className="font-sans text-[0.6rem] sm:text-[0.65rem] uppercase tracking-[0.2em] text-[#7a756b] font-bold">TOTAL AMOUNT</span>
                      {selectedSession.isFreeSession ? (
                        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                          <span className="font-sans text-lg sm:text-xl md:text-2xl text-[#111010] font-bold">₹0</span>
                          <span className="px-2 sm:px-2.5 py-0.5 rounded-full bg-[#e5f2e8] border border-[#a8d5b1] text-[#2f4a34] text-[0.6rem] sm:text-[0.65rem] font-bold uppercase tracking-wider">Course Free Session</span>
                        </div>
                      ) : (
                        <span className="font-sans text-lg sm:text-xl md:text-2xl text-[#111010] font-bold">
                          ₹{Number(selectedSession.amount !== undefined && selectedSession.amount !== null ? selectedSession.amount : (selectedSession.duration === 90 ? feeSettings.fee90min : feeSettings.fee60min)).toLocaleString('en-IN')}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Reschedule Details */}
                  {selectedSession.rescheduleRequest && (
                    <div className="w-full rounded-xl sm:rounded-2xl bg-amber-50/80 border border-amber-200 p-4 sm:p-6 md:p-8 shadow-xs relative overflow-hidden">
                      <div className="absolute top-0 right-0 bg-amber-100 border-b border-l border-amber-200 px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-bl-xl text-amber-900 font-sans text-[0.5rem] sm:text-[0.55rem] uppercase tracking-[0.2em] font-bold">
                        {selectedSession.rescheduleRequest.status}
                      </div>
                      <h4 className="font-sans text-[0.6rem] sm:text-[0.65rem] uppercase tracking-[0.25em] font-bold text-amber-900 mb-3 sm:mb-4">
                        RESCHEDULE REQUEST
                      </h4>
                      <div className="flex flex-col gap-1.5 sm:gap-2 font-sans text-sm sm:text-base text-[#111010] leading-relaxed">
                        <p><strong className="text-[#7a756b] font-sans text-xs tracking-wider uppercase mr-2">Requested Date:</strong> {selectedSession.rescheduleRequest.formattedDate || selectedSession.rescheduleRequest.date}</p>
                        <p><strong className="text-[#7a756b] font-sans text-xs tracking-wider uppercase mr-2">Requested Time:</strong> {formatTimeRange(selectedSession.rescheduleRequest.time, selectedSession.duration || 60)}</p>
                        {selectedSession.rescheduleRequest.reason && (
                          <p className="mt-2 text-[#555047] italic">"{selectedSession.rescheduleRequest.reason}"</p>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Coach Notes Preview Banner (if notes exist) */}
                  {Boolean(selectedSession.coachNotes && (typeof selectedSession.coachNotes === 'string' ? selectedSession.coachNotes.trim().length > 0 : selectedSession.coachNotes.length > 0)) && (
                    <div 
                      onClick={() => setSessionModalTab('notes')}
                      className="w-full rounded-xl bg-[#fbf0eb] border border-[#e8c4e2] p-3.5 sm:p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-3 cursor-pointer hover:bg-[#eed5e9] transition-colors shadow-2xs"
                    >
                      <div className="flex items-center gap-3">
                        <FileText size={18} className="text-[#c9542f] shrink-0" />
                        <div className="flex flex-col">
                          <span className="text-xs sm:text-sm font-semibold text-[#111010]">Coach Notes Available</span>
                          <span className="text-[0.7rem] sm:text-xs text-[#555047]">Aarkesh has written notes for this session. Click to view.</span>
                        </div>
                      </div>
                      <span className="text-xs font-bold text-[#c9542f] uppercase tracking-wider shrink-0">
                        View Notes &rarr;
                      </span>
                    </div>
                  )}

                </div>
              ) : (
                /* Tab 2: Coach's Session Notes */
                <div className="flex flex-col gap-4 sm:gap-6 pb-4 pt-2 animate-in fade-in duration-300">
                  {(() => {
                    const notes = selectedSession.coachNotes;
                    const hasNotes = Boolean(notes && (
                      typeof notes === 'string' ? notes.trim().length > 0 : Array.isArray(notes) && notes.length > 0
                    ));

                    if (!hasNotes) {
                      return (
                        <div className="w-full py-12 sm:py-16 px-4 sm:px-6 rounded-xl sm:rounded-2xl bg-white border border-black/10 flex flex-col items-center justify-center text-center gap-3 shadow-xs">
                          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-[#fbf0eb] border border-[#e8c4e2] flex items-center justify-center text-[#c9542f] mb-2">
                            <FileText size={20} className="sm:w-6 sm:h-6" />
                          </div>
                          <span className="font-serif text-base sm:text-lg text-[#111010]">No Notes Shared Yet</span>
                          <p className="font-sans text-xs text-[#555047] max-w-md leading-relaxed">
                            Aarkesh hasn't added notes for this session yet. Session takeaways, recommendations, and next steps will appear right here after or during your conversation.
                          </p>
                        </div>
                      );
                    }

                    return (
                      <div className="w-full rounded-xl sm:rounded-2xl bg-white border border-black/10 p-4 sm:p-6 md:p-8 shadow-xs flex flex-col gap-4 sm:gap-5">
                        <div className="flex flex-wrap items-center justify-between border-b border-black/10 pb-3 sm:pb-4 gap-2">
                          <div className="flex items-center gap-2.5 sm:gap-3">
                            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-[#fbf0eb] border border-[#e8c4e2] flex items-center justify-center text-[#c9542f]">
                              <FileText size={16} />
                            </div>
                            <div className="flex flex-col">
                              <h4 className="font-sans text-[0.65rem] sm:text-[0.7rem] uppercase tracking-[0.2em] sm:tracking-[0.25em] font-bold text-[#c9542f]">
                                COACH'S SESSION NOTES
                              </h4>
                              <span className="text-[#7a756b] text-[0.7rem] sm:text-xs">Shared with you by Aarkesh</span>
                            </div>
                          </div>
                          <span className="px-2.5 py-0.5 rounded-full bg-[#fbf0eb] border border-[#e8c4e2] text-[#c9542f] text-[0.7rem] sm:text-xs font-semibold">
                            {selectedSession.date}
                          </span>
                        </div>

                        {/* Notes Content */}
                        <div className="text-[#111010] font-serif text-sm sm:text-base md:text-lg leading-relaxed whitespace-pre-wrap py-2">
                          {typeof notes === 'string' ? (
                            <p>{notes}</p>
                          ) : Array.isArray(notes) ? (
                            <ul className="flex flex-col gap-2.5 sm:gap-3">
                              {notes.map((n, idx) => (
                                <li key={idx} className="flex items-start gap-2.5 sm:gap-3">
                                  <span className="text-[#c9542f] mt-1 text-xs">●</span>
                                  <span>{n}</span>
                                </li>
                              ))}
                            </ul>
                          ) : (
                            <p>{JSON.stringify(notes)}</p>
                          )}
                        </div>

                        {/* Footer Disclaimer */}
                        <div className="pt-3 sm:pt-4 border-t border-black/10 flex flex-col sm:flex-row items-start sm:items-center justify-between text-[0.7rem] sm:text-xs text-[#7a756b] gap-1.5 sm:gap-2">
                          <span>Personal guidance & action items shared for your journey</span>
                          <span className="text-[#c9542f] font-serif italic">Better With Aarkesh</span>
                        </div>
                      </div>
                    );
                  })()}
                </div>
              )}
            </div>
            
          </div>
        </div>,
        document.body
      )}

      {/* Step 1: Small Prepare Tooltip/Modal */}
      {prepareSession && prepareSession.step === 1 && createPortal(
        <div 
          data-lenis-prevent="true"
          className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-300 overscroll-none"
        >
          <div className="absolute inset-0" onClick={() => setPrepareSession(null)} />
          <div className="relative w-full max-w-[360px] bg-[#f5f1e8] border border-black/10 rounded-2xl sm:rounded-3xl shadow-2xl p-6 sm:p-8 animate-in zoom-in-95 duration-300">
            <button 
              onClick={() => setPrepareSession(null)}
              className="absolute top-5 right-5 sm:top-6 sm:right-6 text-[#7a756b] hover:text-[#111010] transition-colors cursor-pointer"
            >
              <X size={20} />
            </button>
            <h3 className="font-sans text-[0.65rem] sm:text-[0.7rem] uppercase tracking-[0.25em] sm:tracking-[0.3em] font-bold text-[#c9542f] mb-4 sm:mb-6 leading-relaxed pr-6">
              PREPARE FOR THE<br/>CONVERSATION
            </h3>
            <p className="font-sans text-[#111010] text-sm sm:text-[1.05rem] leading-[1.6] mb-6 sm:mb-8 font-light">
              Optional questions to help you gather what feels important before we speak.
            </p>
            <p className="font-sans text-[#7a756b] text-xs sm:text-[0.8rem] mb-6 sm:mb-8 font-light">
              Your responses here will be shared with Aarkesh.
            </p>
            <button 
              onClick={() => setPrepareSession({ ...prepareSession, step: 2 })}
              className="w-full flex items-center justify-center gap-2 sm:gap-3 py-3.5 sm:py-4 rounded-xl bg-[#c9542f] text-white hover:bg-[#a64117] font-sans text-[0.65rem] sm:text-[0.7rem] uppercase tracking-[0.15em] sm:tracking-[0.2em] font-bold transition-all shadow-md cursor-pointer"
            >
              <span>BEGIN PREPARATION</span>
              <span>&rarr;</span>
            </button>
          </div>
        </div>,
        document.body
      )}

      {/* Step 2: Full Screen Prepare Modal */}
      {prepareSession && prepareSession.step === 2 && createPortal(
        <div 
          data-lenis-prevent="true"
          className="fixed inset-0 z-[120] bg-[#f5f1e8] text-[#111010] flex flex-col overflow-y-auto overscroll-none animate-in slide-in-from-bottom-8 duration-500 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
        >
          {/* Header Row */}
          <div className="w-full px-4 sm:px-8 md:px-16 pt-8 sm:pt-12 md:pt-20 flex flex-col items-start max-w-[1400px] mx-auto min-h-screen pb-16 md:pb-20">
              <div className="flex flex-wrap items-center gap-2 sm:gap-3 px-3.5 sm:px-5 py-2 sm:py-2.5 rounded-xl border border-black/10 bg-white mb-6 sm:mb-8 font-sans text-[0.55rem] sm:text-[0.65rem] uppercase tracking-[0.15em] sm:tracking-[0.2em] font-semibold text-[#555047] shadow-2xs">
                <span>{prepareSession.session.date} • {formatTimeRange(prepareSession.session.time, prepareSession.session.duration || 60)}</span>
                <span className="text-[#c9542f] flex items-center gap-1.5 ml-1 sm:ml-2">
                  • {prepareSession.session.badge} <CheckCircle size={12} weight="fill" />
                </span>
              </div>
              
              <button 
                onClick={() => setPrepareSession(null)}
                className="flex items-center gap-2.5 sm:gap-3 font-sans text-[0.65rem] sm:text-[0.7rem] uppercase tracking-[0.15em] sm:tracking-[0.2em] font-bold text-[#c9542f] hover:text-[#111010] transition-colors mb-8 sm:mb-16 cursor-pointer"
              >
                <span>&larr;</span>
                <span>BACK TO APPOINTMENT</span>
              </button>
              
              <div className="w-full flex flex-col lg:flex-row justify-between items-start gap-8 sm:gap-12 lg:gap-24 flex-1">
                
                {/* Left Column: Form */}
                <div className="flex flex-col flex-1 w-full max-w-4xl">
                  <span className="font-sans text-[0.6rem] sm:text-[0.65rem] uppercase tracking-[0.25em] sm:tracking-[0.3em] font-bold text-[#c9542f] mb-4 sm:mb-6 block">
                    BEFORE WE SPEAK
                  </span>
                  <h1 className="font-serif text-2xl sm:text-4xl md:text-5xl lg:text-[3.5rem] text-[#111010] tracking-tight leading-[1.15] mb-6 sm:mb-12">
                    What feels most important to bring into this conversation?
                  </h1>
                  
                  <div className="w-full relative mb-3 sm:mb-4">
                    <textarea 
                      className="w-full h-56 sm:h-72 md:h-80 bg-white border border-black/10 rounded-2xl p-4 sm:p-6 md:p-8 font-serif text-base sm:text-lg md:text-xl text-[#111010] placeholder-[#7a756b]/40 resize-none focus:outline-none focus:border-[#c9542f] transition-all shadow-xs"
                      placeholder="Write as much or as little as you need."
                    />
                  </div>
                  <p className="font-sans text-xs sm:text-sm text-[#7a756b] font-light mb-8 sm:mb-12">
                    Optional - Shared with Aarkesh for this conversation
                  </p>

                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 sm:gap-8 mt-auto">
                    <button className="flex items-center justify-center gap-3 sm:gap-4 px-8 sm:px-10 py-3.5 sm:py-4 rounded-xl bg-[#c9542f] text-white hover:bg-[#a64117] font-sans text-[0.65rem] sm:text-[0.7rem] uppercase tracking-[0.15em] sm:tracking-[0.2em] font-bold transition-all shadow-md cursor-pointer">
                      <span>CONTINUE</span>
                      <span>&rarr;</span>
                    </button>
                    <button onClick={() => setPrepareSession(null)} className="py-2.5 sm:py-0 text-center font-sans text-[0.65rem] sm:text-[0.7rem] uppercase tracking-[0.15em] sm:tracking-[0.2em] font-semibold text-[#7a756b] hover:text-[#111010] transition-colors cursor-pointer">
                      SKIP FOR NOW
                    </button>
                  </div>
                </div>

                {/* Right Column: Note from Coach */}
                {prepareSession.noteVisible && (
                  <div className="w-full lg:w-[380px] shrink-0 rounded-2xl sm:rounded-3xl bg-white border border-black/10 p-6 sm:p-10 shadow-lg relative animate-in fade-in zoom-in-95 duration-500 mt-0 lg:-mt-2">
                    <button 
                      onClick={() => setPrepareSession({ ...prepareSession, noteVisible: false })}
                      className="absolute top-6 right-6 sm:top-8 sm:right-8 text-[#7a756b] hover:text-[#111010] transition-colors cursor-pointer"
                    >
                      <X size={16} />
                    </button>
                    
                    <h4 className="font-sans text-[0.6rem] sm:text-[0.65rem] uppercase tracking-[0.2em] font-bold text-[#c9542f] mb-4 sm:mb-6">
                      A NOTE FROM AARKESH
                    </h4>
                    <p className="font-serif text-sm sm:text-base md:text-lg text-[#111010] leading-[1.7] sm:leading-[1.8] mb-6 sm:mb-10">
                      Before our conversation, take a few quiet minutes to revisit what felt most important after our last session. You do not need to arrive with an answer.
                    </p>
                    
                    <span className="font-sans text-[0.55rem] uppercase tracking-[0.25em] sm:tracking-[0.3em] font-semibold text-[#7a756b] block mb-3 sm:mb-4">
                      FOR THIS CONVERSATION
                    </span>
                    <button className="font-sans text-[0.6rem] sm:text-[0.65rem] uppercase tracking-[0.15em] sm:tracking-[0.2em] font-bold text-[#c9542f] hover:text-[#a64117] transition-colors border-b border-[#c9542f]/30 pb-1 cursor-pointer">
                      COACH'S NOTES
                    </button>
                  </div>
                )}

              </div>
            </div>
          </div>,
        document.body
      )}

      {rescheduleSession && (
        <RescheduleModal
          isOpen={!!rescheduleSession}
          onClose={() => setRescheduleSession(null)}
          session={rescheduleSession}
          onSuccess={handleRescheduleSuccess}
        />
      )}

      {/* Cancel Confirmation Modal */}
      {cancelSession && createPortal(
        <div 
          className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-300"
        >
          <div className="relative w-full max-w-md bg-[#f5f1e8] border border-red-200 rounded-2xl sm:rounded-3xl shadow-2xl p-6 sm:p-8 flex flex-col items-center text-center">
            <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-red-100 flex items-center justify-center mb-4 sm:mb-6">
              <XCircle className="text-red-600" size={28} weight="fill" />
            </div>
            
            <h2 className="font-serif text-xl sm:text-2xl text-[#111010] mb-2 font-medium">Cancel Appointment?</h2>
            <p className="font-sans text-[#555047] text-xs sm:text-sm mb-6 sm:mb-8 leading-relaxed">
              Are you sure you want to cancel your session on <strong>{cancelSession.date}</strong> at <strong>{formatTimeRange(cancelSession.time, cancelSession.duration || 60)}</strong>? This action cannot be undone.
            </p>

            <div className="flex w-full gap-3 sm:gap-4">
              <button
                onClick={() => setCancelSession(null)}
                disabled={isCancelling}
                className="flex-1 py-2.5 sm:py-3 rounded-xl border border-black/15 text-[#555047] hover:bg-black/5 hover:text-[#111010] font-sans text-[0.65rem] sm:text-xs uppercase tracking-wider sm:tracking-widest font-semibold transition-colors cursor-pointer shadow-2xs"
              >
                No, Keep It
              </button>
              <button
                onClick={handleCancelAppointment}
                disabled={isCancelling}
                className="flex-1 py-2.5 sm:py-3 rounded-xl bg-red-600 hover:bg-red-700 text-white font-sans text-[0.65rem] sm:text-xs uppercase tracking-wider sm:tracking-widest font-bold transition-all shadow-md disabled:opacity-50 cursor-pointer"
              >
                {isCancelling ? 'CANCELLING...' : 'YES, CANCEL'}
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}
