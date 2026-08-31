import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { CalendarBlank, CheckCircle, PencilSimple, FileText, Clock, VideoCamera, User, CalendarPlus, ArrowsClockwise, XCircle, X, DotsThree, CurrencyInr } from '@phosphor-icons/react';
import { generateGoogleCalendarLink } from '../../../utils/calendar';
import RescheduleModal from './RescheduleModal';

export default function CoachingTab() {
  const [activeTab, setActiveTab] = useState('UPCOMING');
  const [selectedSession, setSelectedSession] = useState(null);
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

  const tabs = ['UPCOMING', 'COMPLETED', 'DRAFTS'];
  
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);

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

            return {
              ...app,
              id: app._id,
              status: app.status,
              badge: app.status === 'UPCOMING' ? 'CONFIRMED' : 'COMPLETED',
              date: formattedDate,
              rawDate: app.date, // Keep raw date if needed for operations
              time: app.time,
              durationStr: '60-MINUTE CONVERSATION',
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
    <div className="w-full h-full min-h-[500px] rounded-2xl border border-[#c79c6e]/40 bg-[#0a0a0a]/70 backdrop-blur-sm p-8 md:p-12 flex flex-col animate-in fade-in duration-700 mb-20 relative overflow-hidden group hover:border-[#c79c6e]/60 transition-colors duration-500 hover:shadow-[0_0_50px_rgba(199,156,110,0.15)]">
      
      {/* Subtle Glow inside the card */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-[#c79c6e]/10 rounded-full blur-[120px] pointer-events-none transition-opacity duration-700 group-hover:opacity-100 opacity-60" />

      {/* Header */}
      <div className="mb-10 relative z-10">
        <span className="font-sans text-[0.65rem] uppercase tracking-[0.3em] font-medium text-[#c79c6e] block mb-3 opacity-90">
          YOUR SCHEDULE
        </span>
        <h2 className="font-serif text-4xl md:text-5xl text-white mb-4 tracking-tight">Coaching Appointments</h2>
        <p className="font-sans text-white/60 font-light text-lg max-w-xl">
          Manage your upcoming sessions, review past conversations, and continue booking drafts.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-8 border-b border-white/10 mb-10 relative z-10">
        {tabs.map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`pb-4 font-sans text-[0.7rem] uppercase tracking-[0.2em] font-medium transition-all duration-300 relative ${
              activeTab === tab ? 'text-[#c79c6e]' : 'text-white/40 hover:text-white/80'
            }`}
          >
            {tab}
            {activeTab === tab && (
              <span className="absolute bottom-[-1px] left-0 w-full h-[2px] bg-[#c79c6e] shadow-[0_0_10px_rgba(199,156,110,0.5)]" />
            )}
          </button>
        ))}
      </div>

      {/* List */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 relative z-10">
        {loading ? (
          <div className="py-16 flex flex-col items-center justify-center border border-white/5 rounded-2xl bg-[#050505]/40 backdrop-blur-sm">
            <span className="font-sans text-white/40 text-sm tracking-wide">Loading...</span>
          </div>
        ) : filteredAppointments.length === 0 ? (
          <div className="py-16 flex flex-col items-center justify-center border border-white/5 rounded-2xl bg-[#050505]/40 backdrop-blur-sm">
            <CalendarBlank size={32} className="text-white/20 mb-4" />
            <span className="font-sans text-white/40 text-sm tracking-wide">No {activeTab.toLowerCase()} appointments found.</span>
          </div>
        ) : (
          filteredAppointments.map(app => (
            <div key={app.id} className="group/card w-full flex flex-col items-center">
                {/* Main Card */}
                <div className="w-full rounded-xl border border-[#c79c6e]/30 bg-[#0a0a0a]/90 backdrop-blur-md p-6 md:p-8 flex flex-col justify-between gap-6 hover:border-[#c79c6e]/60 transition-colors duration-500 shadow-xl relative z-10 h-full overflow-hidden">
                  
                  {app.rescheduleRequest?.status === 'APPROVED' && (
                    <div className="absolute top-0 right-0 bg-green-500/10 border-b border-l border-green-500/20 px-4 py-2 rounded-bl-xl text-green-500 font-sans text-[0.6rem] uppercase tracking-[0.2em] font-semibold flex items-center gap-1.5 backdrop-blur-md z-20">
                      <CheckCircle weight="fill" size={14} />
                      RESCHEDULE APPROVED
                    </div>
                  )}
                  {app.rescheduleRequest?.status === 'PENDING' && (
                    <div className="absolute top-0 right-0 bg-amber-500/10 border-b border-l border-amber-500/20 px-4 py-2 rounded-bl-xl text-amber-500 font-sans text-[0.6rem] uppercase tracking-[0.2em] font-semibold flex items-center gap-1.5 backdrop-blur-md z-20">
                      <Clock weight="fill" size={14} />
                      RESCHEDULE PENDING
                    </div>
                  )}
                  {app.rescheduleRequest?.status === 'REJECTED' && (
                    <div className="absolute top-0 right-0 bg-red-500/10 border-b border-l border-red-500/20 px-4 py-2 rounded-bl-xl text-red-500 font-sans text-[0.6rem] uppercase tracking-[0.2em] font-semibold flex items-center gap-1.5 backdrop-blur-md z-20">
                      <XCircle weight="fill" size={14} />
                      RESCHEDULE DECLINED
                    </div>
                  )}
                  {app.status === 'CANCELLED' && (
                    <div className="absolute top-0 right-0 bg-red-500/10 border-b border-l border-red-500/20 px-4 py-2 rounded-bl-xl text-red-500 font-sans text-[0.6rem] uppercase tracking-[0.2em] font-semibold flex items-center gap-1.5 backdrop-blur-md z-20">
                      <XCircle weight="fill" size={14} />
                      CANCELLED
                    </div>
                  )}

                  {/* Top: Status & Details */}
                  <div className="flex flex-col gap-4">
                    <div className={`flex items-center gap-2 ${app.status === 'COMPLETED' ? 'text-green-500' : 'text-[#c79c6e]'} font-sans text-[0.65rem] uppercase tracking-[0.2em] font-medium`}>
                      <span>{app.badge}</span>
                      {app.badge === 'CONFIRMED' && <CheckCircle weight="fill" size={16} />}
                      {app.badge === 'PENDING' && <Clock weight="fill" size={16} />}
                      {app.badge === 'COMPLETED' && <CheckCircle weight="fill" size={16} />}
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <h3 className="font-serif text-2xl md:text-[1.7rem] text-white uppercase tracking-wide leading-tight transition-colors group-hover/card:text-[#c79c6e]">
                        {app.date}
                      </h3>
                      <div className="flex flex-col md:flex-row md:items-center gap-1.5 md:gap-3 font-sans text-[0.7rem] tracking-[0.15em] text-white/60 uppercase mt-1">
                        <span>{app.time}</span>
                        <span className="hidden md:block w-1 h-1 rounded-full bg-white/20"></span>
                        <span>{app.durationStr}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 mt-1 text-white/90 font-sans text-[0.75rem] tracking-[0.15em] uppercase font-medium">
                      <User size={20} weight="light" className="text-[#c79c6e]" />
                      <span>{app.person}</span>
                    </div>
                  </div>

                  {/* Bottom: Main Action Button & Options */}
                  <div className="w-full shrink-0 flex items-center mt-2 gap-2 relative">
                    <button 
                      onClick={() => setSelectedSession(app)}
                      className="flex-1 py-4 px-6 rounded border border-white/20 text-[#c79c6e] hover:border-[#c79c6e]/40 hover:bg-[#c79c6e]/5 font-sans text-[0.65rem] uppercase tracking-[0.2em] font-medium transition-colors"
                    >
                      {app.primaryAction}
                    </button>
                    
                    {app.status === 'UPCOMING' && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setOptionsOpenId(optionsOpenId === app.id ? null : app.id);
                        }}
                        className={`p-3.5 rounded border transition-colors flex items-center justify-center ${optionsOpenId === app.id ? 'bg-[#c79c6e]/10 border-[#c79c6e]/40 text-[#c79c6e]' : 'border-white/20 text-white/60 hover:text-white hover:border-white/40 hover:bg-white/5'}`}
                      >
                        <DotsThree size={20} weight="bold" />
                      </button>
                    )}

                    {/* Popover Menu */}
                    {optionsOpenId === app.id && app.status === 'UPCOMING' && (
                      <div className="absolute bottom-full right-0 mb-3 w-56 bg-[#0a0a0a] border border-[#c79c6e]/20 rounded-xl shadow-[0_10px_40px_rgba(0,0,0,0.8)] flex flex-col py-2 z-50 animate-in fade-in slide-in-from-bottom-2 duration-200">
                        
                        <a 
                          href={generateGoogleCalendarLink(app.date, app.time, app.duration)}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={() => setOptionsOpenId(null)}
                          className="w-full flex items-center gap-3 px-4 py-3 text-left text-white/70 hover:text-white hover:bg-white/5 font-sans text-[0.65rem] uppercase tracking-[0.2em] font-medium transition-colors"
                        >
                          <CalendarPlus size={16} className="text-blue-400" />
                          <span>ADD TO CALENDAR</span>
                        </a>
                        
                        <button 
                          onClick={() => {
                            setRescheduleSession(app);
                            setOptionsOpenId(null);
                          }}
                          disabled={app.rescheduleRequest?.status === 'PENDING' || app.rescheduleRequest?.status === 'APPROVED'}
                          className="w-full flex items-center gap-3 px-4 py-3 text-left text-white/70 hover:text-white hover:bg-white/5 font-sans text-[0.65rem] uppercase tracking-[0.2em] font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <ArrowsClockwise size={16} className="text-amber-400" />
                          <span>
                            {app.rescheduleRequest?.status === 'PENDING' 
                              ? 'RESCHEDULE PENDING' 
                              : app.rescheduleRequest?.status === 'APPROVED' 
                                ? 'RESCHEDULED' 
                                : 'RESCHEDULE'}
                          </span>
                        </button>
                        
                        <div className="h-px w-full bg-white/10 my-1"></div>

                        <button 
                          onClick={() => {
                            setCancelSession(app);
                            setOptionsOpenId(null);
                          }}
                          className="w-full flex items-center gap-3 px-4 py-3 text-left text-red-400 hover:text-red-300 hover:bg-red-500/10 font-sans text-[0.65rem] uppercase tracking-[0.2em] font-medium transition-colors"
                        >
                          <XCircle size={16} />
                          <span>CANCEL</span>
                        </button>

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
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-8 bg-[#0a0a0a]/90 backdrop-blur-xl animate-in fade-in duration-300 overscroll-none"
        >
          {/* Clickable backdrop to close */}
          <div className="absolute inset-0" onClick={() => setSelectedSession(null)} />
          
          {/* Modal Content */}
          <div className="relative w-full max-w-3xl bg-[#0a0a0a] border border-white/10 rounded-2xl shadow-[0_0_50px_rgba(0,0,0,0.8)] p-6 md:p-10 flex flex-col max-h-[85vh] animate-in slide-in-from-bottom-8 duration-500">
            
            {/* Close Button */}
            <button 
              onClick={() => setSelectedSession(null)}
              className="absolute top-4 right-4 md:top-6 md:right-6 p-2 rounded-full text-white/40 hover:text-white hover:bg-white/10 transition-colors z-10"
            >
              <X size={24} />
            </button>

            {/* Scrollable Content Area */}
            <div className="overflow-y-auto overscroll-contain pr-2 md:pr-4 -mr-2 md:-mr-4 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
              <div className="flex flex-col gap-8 pb-4 pt-4">
                
                {/* Date */}
                <div className="flex gap-5">
                  <CalendarBlank size={22} className="text-[#c79c6e] shrink-0 mt-0.5" />
                  <div className="flex flex-col gap-1.5">
                    <span className="font-sans text-[0.7rem] text-white/50 font-medium">Date</span>
                    <span className="font-sans text-lg md:text-xl text-white font-medium">{selectedSession.date}</span>
                  </div>
                </div>

                {/* Time */}
                <div className="flex gap-5">
                  <Clock size={22} className="text-[#c79c6e] shrink-0 mt-0.5" />
                  <div className="flex flex-col gap-1.5">
                    <span className="font-sans text-[0.7rem] text-white/50 font-medium">Time</span>
                    <span className="font-sans text-lg md:text-xl text-white font-medium">{selectedSession.time}</span>
                  </div>
                </div>

                {/* Session Type */}
                <div className="flex gap-5">
                  <User size={22} className="text-[#c79c6e] shrink-0 mt-0.5" />
                  <div className="flex flex-col gap-1.5">
                    <span className="font-sans text-[0.7rem] text-white/50 font-medium">Session Type</span>
                    <span className="font-sans text-lg md:text-xl text-white font-medium">1-on-1 Coaching Session</span>
                  </div>
                </div>

                {/* Duration */}
                <div className="flex gap-5">
                  <Clock size={22} className="text-[#c79c6e] shrink-0 mt-0.5" />
                  <div className="flex flex-col gap-1.5">
                    <span className="font-sans text-[0.7rem] text-white/50 font-medium">Duration</span>
                    <span className="font-sans text-lg md:text-xl text-white font-medium">{selectedSession.duration || 60} minutes</span>
                  </div>
                </div>

                {/* Where */}
                <div className="flex gap-5">
                  <VideoCamera size={22} className="text-[#c79c6e] shrink-0 mt-0.5" />
                  <div className="flex flex-col gap-1.5">
                    <span className="font-sans text-[0.7rem] text-white/50 font-medium">Where</span>
                    <div className="font-sans text-lg md:text-xl text-white font-medium flex flex-wrap items-center gap-2">
                      Google Meet
                      {selectedSession.meetLink ? (
                         <a href={selectedSession.meetLink} target="_blank" rel="noopener noreferrer" className="text-[#c79c6e] hover:underline text-sm md:text-base ml-1">(Join Link)</a>
                      ) : (
                         <span className="text-white/40 text-sm md:text-base ml-1 font-normal">(Link will be shared after booking)</span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Total Amount */}
                <div className="flex gap-5">
                  <CurrencyInr size={22} className="text-[#c79c6e] shrink-0 mt-0.5" />
                  <div className="flex flex-col gap-1.5">
                    <span className="font-sans text-[0.65rem] uppercase tracking-[0.2em] text-white/50 font-semibold">TOTAL AMOUNT</span>
                    <span className="font-sans text-xl md:text-2xl text-white font-bold">₹{selectedSession.duration === 90 ? '7,500' : '5,000'}</span>
                  </div>
                </div>

                {/* Reschedule Details */}
                {selectedSession.rescheduleRequest && (
                  <div className="w-full rounded-2xl bg-gradient-to-br from-[#120f0d] to-[#050505] border border-amber-500/30 p-6 md:p-8 shadow-lg relative overflow-hidden">
                    <div className="absolute top-0 right-0 bg-amber-500/10 border-b border-l border-amber-500/30 px-3 py-1.5 rounded-bl-xl text-amber-500 font-sans text-[0.55rem] uppercase tracking-[0.2em] font-semibold">
                      {selectedSession.rescheduleRequest.status}
                    </div>
                    <h4 className="font-sans text-[0.65rem] uppercase tracking-[0.25em] font-medium text-amber-500 mb-4">
                      RESCHEDULE REQUEST
                    </h4>
                    <div className="flex flex-col gap-2 font-serif text-base md:text-lg text-white/90 leading-relaxed">
                      <p><strong className="text-white/50 font-sans text-xs tracking-wider uppercase mr-2">Requested Date:</strong> {selectedSession.rescheduleRequest.formattedDate || selectedSession.rescheduleRequest.date}</p>
                      <p><strong className="text-white/50 font-sans text-xs tracking-wider uppercase mr-2">Requested Time:</strong> {selectedSession.rescheduleRequest.time}</p>
                      {selectedSession.rescheduleRequest.reason && (
                        <p className="mt-2 text-white/70 italic">"{selectedSession.rescheduleRequest.reason}"</p>
                      )}
                    </div>
                  </div>
                )}
                
                {/* Shared Summary Card */}
                {selectedSession.sharedSummary && (
                  <div className="w-full rounded-2xl bg-gradient-to-br from-[#120f0d] to-[#050505] border border-[#c79c6e]/20 p-6 md:p-8 shadow-lg">
                    <h4 className="font-sans text-[0.65rem] uppercase tracking-[0.25em] font-medium text-[#c79c6e] mb-4">
                      SHARED SUMMARY
                    </h4>
                    <p className="font-serif text-base md:text-lg text-white/90 leading-relaxed">
                      {selectedSession.sharedSummary}
                    </p>
                  </div>
                )}

                {/* Coach-Shared Notes Card */}
                {selectedSession.coachNotes && selectedSession.coachNotes.length > 0 && (
                  <div className="w-full rounded-2xl bg-gradient-to-br from-[#120f0d] to-[#050505] border border-[#c79c6e]/20 p-6 md:p-8 shadow-lg">
                    <h4 className="font-sans text-[0.65rem] uppercase tracking-[0.25em] font-medium text-[#c79c6e] mb-6">
                      COACH-SHARED NOTES
                    </h4>
                    
                    <ul className="flex flex-col gap-4 mb-8">
                      {selectedSession.coachNotes.map((note, idx) => (
                        <li key={idx} className="flex items-start gap-4 text-white/90 font-serif text-base md:text-lg">
                          <span className="text-[#c79c6e] mt-2 text-[0.5rem]">●</span>
                          <span className="leading-relaxed">{note}</span>
                        </li>
                      ))}
                    </ul>

                    <p className="font-sans text-xs md:text-sm text-white/40 font-light">
                      These are notes Aarkesh deliberately shared with you.<br/>His confidential coaching notes are not shown here.
                    </p>
                  </div>
                )}

              </div>
            </div>
            
          </div>
        </div>,
        document.body
      )}

      {/* Step 1: Small Prepare Tooltip/Modal */}
      {prepareSession && prepareSession.step === 1 && createPortal(
        <div 
          data-lenis-prevent="true"
          className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300 overscroll-none"
        >
          <div className="absolute inset-0" onClick={() => setPrepareSession(null)} />
          <div className="relative w-full max-w-[340px] bg-[#050505] border border-[#c79c6e]/30 rounded-2xl shadow-2xl p-8 animate-in zoom-in-95 duration-300">
            <button 
              onClick={() => setPrepareSession(null)}
              className="absolute top-6 right-6 text-white/40 hover:text-white transition-colors"
            >
              <X size={20} />
            </button>
            <h3 className="font-sans text-[0.7rem] uppercase tracking-[0.3em] font-medium text-[#c79c6e] mb-6 leading-relaxed pr-6">
              PREPARE FOR THE<br/>CONVERSATION
            </h3>
            <p className="font-sans text-white/90 text-[1.05rem] leading-[1.6] mb-8 font-light">
              Optional questions to help you gather what feels important before we speak.
            </p>
            <p className="font-sans text-white/40 text-[0.8rem] mb-8 font-light">
              Your responses here will be shared with Aarkesh.
            </p>
            <button 
              onClick={() => setPrepareSession({ ...prepareSession, step: 2 })}
              className="w-full flex items-center justify-center gap-3 py-4 rounded-lg border border-[#c79c6e]/50 text-[#c79c6e] hover:bg-[#c79c6e]/10 font-sans text-[0.7rem] uppercase tracking-[0.2em] font-medium transition-colors"
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
          className="fixed inset-0 z-[120] bg-[#050505] flex flex-col overflow-y-auto overscroll-none animate-in slide-in-from-bottom-8 duration-500 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
        >
          {/* Header Row */}
          <div className="w-full px-6 md:px-16 pt-10 md:pt-20 flex flex-col items-start max-w-[1400px] mx-auto min-h-screen pb-20">
              <div className="flex flex-wrap items-center gap-3 px-5 py-2.5 rounded border border-white/10 mb-8 font-sans text-[0.6rem] md:text-[0.65rem] uppercase tracking-[0.2em] font-medium text-white/60">
                <span>{prepareSession.session.date} • {prepareSession.session.time}</span>
                <span className="text-[#c79c6e] flex items-center gap-1.5 ml-2">
                  • {prepareSession.session.badge} <CheckCircle size={12} weight="fill" />
                </span>
              </div>
              
              <button 
                onClick={() => setPrepareSession(null)}
                className="flex items-center gap-3 font-sans text-[0.7rem] uppercase tracking-[0.2em] font-medium text-[#c79c6e] hover:text-white transition-colors mb-16"
              >
                <span>&larr;</span>
                <span>BACK TO APPOINTMENT</span>
              </button>
              
              <div className="w-full flex flex-col lg:flex-row justify-between items-start gap-12 lg:gap-24 flex-1">
                
                {/* Left Column: Form */}
                <div className="flex flex-col flex-1 w-full max-w-4xl">
                  <span className="font-sans text-[0.65rem] uppercase tracking-[0.3em] font-medium text-[#c79c6e] mb-6 block">
                    BEFORE WE SPEAK
                  </span>
                  <h1 className="font-serif text-4xl md:text-5xl lg:text-[4rem] text-white tracking-tight leading-[1.05] mb-12">
                    What feels most important to bring into this conversation?
                  </h1>
                  
                  <div className="w-full relative mb-4">
                    <textarea 
                      className="w-full h-72 md:h-80 bg-[#0a0a0a]/50 border border-white/10 rounded-2xl p-6 md:p-8 font-serif text-lg md:text-xl text-white placeholder-white/20 resize-none focus:outline-none focus:border-[#c79c6e]/40 transition-colors"
                      placeholder="Write as much or as little as you need."
                    />
                  </div>
                  <p className="font-sans text-xs md:text-sm text-white/30 font-light mb-12">
                    Optional - Shared with Aarkesh for this conversation
                  </p>

                  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-8 mt-auto">
                    <button className="flex items-center justify-center gap-4 px-10 py-4 rounded-lg border border-[#c79c6e]/50 text-[#c79c6e] hover:bg-[#c79c6e]/10 font-sans text-[0.7rem] uppercase tracking-[0.2em] font-medium transition-colors">
                      <span>CONTINUE</span>
                      <span>&rarr;</span>
                    </button>
                    <button onClick={() => setPrepareSession(null)} className="font-sans text-[0.7rem] uppercase tracking-[0.2em] font-medium text-white/40 hover:text-white transition-colors">
                      SKIP FOR NOW
                    </button>
                  </div>
                </div>

                {/* Right Column: Note from Coach */}
                {prepareSession.noteVisible && (
                  <div className="w-full lg:w-[380px] shrink-0 rounded-3xl bg-gradient-to-b from-[#120f0d] to-[#0a0a0a] border border-[#c79c6e]/20 p-10 shadow-2xl relative animate-in fade-in zoom-in-95 duration-500 mt-0 lg:-mt-2">
                    <button 
                      onClick={() => setPrepareSession({ ...prepareSession, noteVisible: false })}
                      className="absolute top-8 right-8 text-white/40 hover:text-white transition-colors"
                    >
                      <X size={16} />
                    </button>
                    
                    <h4 className="font-sans text-[0.65rem] uppercase tracking-[0.2em] font-medium text-[#c79c6e] mb-8">
                      A NOTE FROM AARKESH
                    </h4>
                    <p className="font-serif text-base md:text-lg text-white/80 leading-[1.8] mb-10">
                      Before our conversation, take a few quiet minutes to revisit what felt most important after our last session. You do not need to arrive with an answer.
                    </p>
                    
                    <span className="font-sans text-[0.55rem] uppercase tracking-[0.3em] font-medium text-white/30 block mb-4">
                      FOR THIS CONVERSATION
                    </span>
                    <button className="font-sans text-[0.65rem] uppercase tracking-[0.2em] font-medium text-[#c79c6e] hover:text-white transition-colors border-b border-[#c79c6e]/30 hover:border-white/50 pb-1">
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
          className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-300"
        >
          <div className="relative w-full max-w-md bg-[#0a0a0a] border border-red-500/20 rounded-2xl shadow-[0_0_50px_rgba(239,68,68,0.15)] p-8 flex flex-col items-center text-center">
            <div className="w-16 h-16 rounded-full bg-red-500/10 flex items-center justify-center mb-6">
              <XCircle className="text-red-500" size={32} weight="fill" />
            </div>
            
            <h2 className="font-serif text-2xl text-white mb-2">Cancel Appointment?</h2>
            <p className="font-sans text-white/60 text-sm mb-8 leading-relaxed">
              Are you sure you want to cancel your session on <strong>{cancelSession.date}</strong> at <strong>{cancelSession.time}</strong>? This action cannot be undone.
            </p>

            <div className="flex w-full gap-4">
              <button
                onClick={() => setCancelSession(null)}
                disabled={isCancelling}
                className="flex-1 py-3 rounded border border-white/20 text-white/70 hover:bg-white/5 hover:text-white font-sans text-xs uppercase tracking-widest transition-colors"
              >
                No, Keep It
              </button>
              <button
                onClick={handleCancelAppointment}
                disabled={isCancelling}
                className="flex-1 py-3 rounded bg-red-600 hover:bg-red-500 text-white font-sans text-xs uppercase tracking-widest font-semibold transition-colors disabled:opacity-50"
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
