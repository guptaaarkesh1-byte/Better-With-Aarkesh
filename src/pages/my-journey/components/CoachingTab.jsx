import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { CalendarBlank, CheckCircle, PencilSimple, FileText, Clock, VideoCamera, User, CalendarPlus, ArrowsClockwise, XCircle, X } from '@phosphor-icons/react';

export default function CoachingTab() {
  const [activeTab, setActiveTab] = useState('UPCOMING');
  const [selectedSession, setSelectedSession] = useState(null);
  const [prepareSession, setPrepareSession] = useState(null);

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

  const allAppointments = [
    {
      id: 1,
      status: 'UPCOMING',
      badge: 'CONFIRMED',
      date: 'WEDNESDAY, 12 AUGUST',
      time: '6:00 PM - 7:30 PM IST',
      durationStr: '90-MINUTE CONVERSATION',
      person: 'AARKESH GUPTA',
      primaryAction: 'VIEW APPOINTMENT'
    },
    {
      id: 2,
      status: 'UPCOMING',
      badge: 'PENDING',
      date: 'THURSDAY, 28 AUGUST',
      time: '5:00 PM - 5:45 PM IST',
      durationStr: '45-MINUTE CONVERSATION',
      person: 'AARKESH GUPTA',
      primaryAction: 'VIEW APPOINTMENT'
    },
    {
      id: 3,
      status: 'COMPLETED',
      badge: 'NOTES SHARED',
      date: '28 JULY 2026',
      durationStr: '90-MINUTE CONVERSATION',
      title: 'Making a decision without waiting for certainty',
      primaryAction: 'VIEW SESSION',
      secondaryAction: 'OPEN SHARED NOTES',
      noteTitle: 'SHARED AFTER THIS CONVERSATION',
      noteDescription: 'You do not need perfect certainty to make an honest decision.',
      sharedSummary: 'We explored the difference between wanting certainty and having enough clarity to choose. The aim was not to remove doubt, but to decide which trade-offs you are willing to own.',
      coachNotes: [
        'Revisit the values you identified before making the final choice.',
        'Notice when anxiety is being treated as evidence.'
      ]
    },
    {
      id: 4,
      status: 'COMPLETED',
      badge: 'NOTES SHARED',
      date: '14 JULY 2026',
      durationStr: '90-MINUTE CONVERSATION',
      title: 'Recognising the pattern beneath the conflict',
      primaryAction: 'VIEW SESSION'
    },
    {
      id: 5,
      status: 'COMPLETED',
      badge: 'COMPLETED',
      date: '30 JUNE 2026',
      durationStr: 'INTRODUCTORY CONVERSATION',
      title: 'What feels important right now',
      primaryAction: 'VIEW SESSION'
    }
  ];

  const filteredAppointments = allAppointments.filter(app => app.status === activeTab);

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
      <div className="flex flex-col gap-8 relative z-10">
        {filteredAppointments.length === 0 ? (
          <div className="py-16 flex flex-col items-center justify-center border border-white/5 rounded-2xl bg-[#050505]/40 backdrop-blur-sm">
            <CalendarBlank size={32} className="text-white/20 mb-4" />
            <span className="font-sans text-white/40 text-sm tracking-wide">No {activeTab.toLowerCase()} appointments found.</span>
          </div>
        ) : (
          filteredAppointments.map(app => (
            app.status === 'UPCOMING' || app.status === 'DRAFTS' ? (
              <div key={app.id} className="group/card w-full flex flex-col items-center">
                {/* Main Card */}
                <div className="w-full rounded-xl border border-[#c79c6e]/30 bg-[#0a0a0a]/90 backdrop-blur-md p-6 md:p-8 flex flex-col lg:flex-row lg:items-center justify-between gap-6 md:gap-10 hover:border-[#c79c6e]/60 transition-colors duration-500 shadow-xl relative z-10">
                  
                  {/* Left Side: Status & Details */}
                  <div className="flex flex-col gap-4">
                    <div className="flex items-center gap-2 text-[#c79c6e] font-sans text-[0.65rem] uppercase tracking-[0.2em] font-medium">
                      <span>{app.badge}</span>
                      {app.badge === 'CONFIRMED' && <CheckCircle weight="fill" size={16} />}
                      {app.badge === 'PENDING' && <Clock weight="fill" size={16} />}
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

                  {/* Right Side: Main Action Button */}
                  <div className="w-full lg:w-auto shrink-0 flex items-center">
                    <button className="w-full lg:min-w-[240px] py-4 md:py-5 px-6 rounded border border-white/20 text-[#c79c6e] hover:border-[#c79c6e]/40 hover:bg-[#c79c6e]/5 font-sans text-[0.65rem] uppercase tracking-[0.2em] font-medium transition-colors">
                      {app.primaryAction}
                    </button>
                  </div>
                </div>

                {/* Expandable Action Row (Visible on hover of the main card area) */}
                {app.status === 'UPCOMING' && (
                  <div className="w-full grid grid-rows-[0fr] opacity-0 group-hover/card:grid-rows-[1fr] group-hover/card:opacity-100 transition-all duration-500 ease-in-out">
                    <div className="overflow-hidden">
                      <div className="w-full flex flex-col md:flex-row items-center gap-4 pt-6 mt-4 border-t border-white/5">
                        <button 
                          onClick={() => setPrepareSession({ session: app, step: 1, noteVisible: true })}
                          className="w-full flex items-center justify-center gap-3 px-6 py-4 rounded border border-[#c79c6e]/40 text-[#c79c6e] hover:bg-[#c79c6e]/5 font-sans text-[0.65rem] uppercase tracking-[0.2em] font-medium transition-colors"
                        >
                          <PencilSimple size={16} />
                          <span>PREPARE</span>
                        </button>
                        <button className="w-full flex items-center justify-center gap-3 px-6 py-4 rounded border border-white/10 text-white/60 hover:text-white hover:bg-white/5 hover:border-white/30 font-sans text-[0.65rem] uppercase tracking-[0.2em] font-medium transition-colors">
                          <CalendarPlus size={16} />
                          <span>ADD TO CALENDAR</span>
                        </button>
                        <button className="w-full flex items-center justify-center gap-3 px-6 py-4 rounded border border-white/10 text-white/60 hover:text-white hover:bg-white/5 hover:border-white/30 font-sans text-[0.65rem] uppercase tracking-[0.2em] font-medium transition-colors">
                          <ArrowsClockwise size={16} />
                          <span>RESCHEDULE</span>
                        </button>
                        <button className="w-full flex items-center justify-center gap-3 px-6 py-4 rounded border border-white/10 text-white/60 hover:text-white hover:bg-white/5 hover:border-white/30 font-sans text-[0.65rem] uppercase tracking-[0.2em] font-medium transition-colors">
                          <XCircle size={16} />
                          <span>CANCEL</span>
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div key={app.id} className="group/completed relative w-full border-b border-white/10 last:border-0 py-6 hover:p-6 md:hover:p-8 hover:-mx-8 md:hover:-mx-8 hover:w-[calc(100%+4rem)] hover:bg-[#0a0a0a]/90 hover:backdrop-blur-md hover:border hover:border-[#c79c6e]/30 hover:rounded-xl hover:shadow-[0_8px_30px_rgba(0,0,0,0.5)] transition-all duration-300">
                
                {/* Top Row: Details & Badge */}
                <div className="flex justify-between items-end mb-1">
                  <div className="flex flex-col gap-2">
                    <div className="flex items-center gap-2 font-sans text-[0.65rem] md:text-[0.7rem] uppercase tracking-[0.2em] font-medium text-white/60">
                      <span>{app.date}</span>
                      <span>·</span>
                      <span>{app.durationStr}</span>
                    </div>
                    <h3 className="font-serif text-xl md:text-2xl text-white">
                      {app.title}
                    </h3>
                  </div>
                  <div className="flex flex-col items-end gap-2 shrink-0">
                    <span className="font-sans text-[0.65rem] md:text-[0.7rem] uppercase tracking-[0.2em] font-medium text-[#c79c6e]">
                      {app.badge}
                    </span>
                    <button onClick={() => setSelectedSession(app)} className="flex items-center gap-2 font-sans text-[0.65rem] md:text-[0.7rem] uppercase tracking-[0.2em] font-medium text-[#c79c6e] group-hover/completed:text-white transition-colors">
                      <span>{app.primaryAction}</span>
                      <span>&rarr;</span>
                    </button>
                  </div>
                </div>

                {/* Expandable Hover Section */}
                {app.noteTitle && (
                  <div className="w-full grid grid-rows-[0fr] opacity-0 group-hover/completed:grid-rows-[1fr] group-hover/completed:opacity-100 transition-all duration-500 ease-in-out">
                    <div className="overflow-hidden">
                      <div className="pt-6">
                        <span className="font-sans text-[0.65rem] uppercase tracking-[0.2em] font-medium text-[#c79c6e] block mb-2">
                          {app.noteTitle}
                        </span>
                        <p className="font-sans text-sm md:text-base text-white/70 font-light mb-8 max-w-2xl">
                          {app.noteDescription}
                        </p>
                        <div className="flex items-center gap-4">
                          <button onClick={() => setSelectedSession(app)} className="px-6 py-4 rounded border border-[#c79c6e]/40 text-white bg-white/5 hover:bg-white/10 font-sans text-[0.65rem] uppercase tracking-[0.2em] font-medium transition-colors">
                            {app.primaryAction}
                          </button>
                          <button onClick={() => setSelectedSession(app)} className="px-6 py-4 rounded border border-[#c79c6e]/40 text-[#c79c6e] hover:bg-[#c79c6e]/5 font-sans text-[0.65rem] uppercase tracking-[0.2em] font-medium transition-colors">
                            {app.secondaryAction}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )
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
              <h2 className="font-serif text-3xl md:text-4xl text-white mb-8 pr-8 leading-tight">
                {selectedSession.title}
              </h2>

              <div className="flex flex-col gap-6 pb-4">
                
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

    </div>
  );
}
