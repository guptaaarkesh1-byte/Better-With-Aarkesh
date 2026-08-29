import React, { useState, useEffect } from 'react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { Play, CheckCircle, LockKey, CaretDown, Clock } from '@phosphor-icons/react';
import Container from '../../components/ui/Container';
import { cn } from '../../utils/cn';

// Dummy course data
const MODULES = [
  {
    id: 1,
    title: 'Module 1: The Foundation of Presence',
    duration: '45 mins',
    progress: 100,
    lessons: [
      { id: 101, title: 'Introduction to Inner Stillness', duration: '12:30', isCompleted: true, isLocked: false },
      { id: 102, title: 'Breaking the Reactive Cycle', duration: '18:15', isCompleted: true, isLocked: false },
      { id: 103, title: 'Guided Grounding Meditation', duration: '15:00', isCompleted: false, isLocked: false },
    ]
  },
  {
    id: 2,
    title: 'Module 2: Mastering Conversations',
    duration: '1h 15m',
    progress: 0,
    lessons: [
      { id: 201, title: 'The Art of Active Listening', duration: '22:10', isCompleted: false, isLocked: true },
      { id: 202, title: 'Reading Non-Verbal Cues', duration: '28:45', isCompleted: false, isLocked: true },
      { id: 203, title: 'Expressing Authentic Boundaries', duration: '24:20', isCompleted: false, isLocked: true },
    ]
  },
  {
    id: 3,
    title: 'Module 3: Leadership & Magnetism',
    duration: '1h 30m',
    progress: 0,
    lessons: [
      { id: 301, title: 'Cultivating Charisma', duration: '30:00', isCompleted: false, isLocked: true },
      { id: 302, title: 'Leading with Vulnerability', duration: '25:15', isCompleted: false, isLocked: true },
      { id: 303, title: 'The Ripple Effect', duration: '35:45', isCompleted: false, isLocked: true },
    ]
  }
];

export default function Course() {
  const [activeModule, setActiveModule] = useState(1);
  const [activeLesson, setActiveLesson] = useState(MODULES[0].lessons[2]);
  
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  useGSAP(() => {
    gsap.fromTo('.course-hero', 
      { y: 30, opacity: 0 },
      { y: 0, opacity: 1, duration: 1, ease: 'power3.out', delay: 0.1 }
    );
    gsap.fromTo('.course-content', 
      { y: 40, opacity: 0 },
      { y: 0, opacity: 1, duration: 1, ease: 'power3.out', delay: 0.3 }
    );
  });

  return (
    <div className="min-h-screen bg-[#050505] pt-28 pb-20 relative selection:bg-[#c79c6e]/30">
      {/* Background glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[600px] bg-[#c79c6e]/5 rounded-full blur-[120px] pointer-events-none" />

      <Container>
        {/* --- HERO SECTION --- */}
        <div className="course-hero flex flex-col items-center text-center mb-12 relative z-10">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 border border-[#c79c6e]/30 rounded-full mb-6 bg-black/50 backdrop-blur-md">
            <span className="w-1.5 h-1.5 rounded-full bg-[#c79c6e] animate-pulse"></span>
            <span className="font-sans text-[0.65rem] uppercase tracking-[0.2em] text-[#c79c6e] font-medium">
              Now Enrolling
            </span>
          </div>
          
          <h1 className="font-serif text-4xl md:text-5xl lg:text-6xl text-white mb-6 tracking-tight max-w-4xl leading-tight">
            The Art of <span className="text-[#c79c6e] italic pr-2">Connection</span>
          </h1>
        </div>

        {/* --- MAIN CONTENT GRID --- */}
        <div className="course-content grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 relative z-10">
          
          {/* Left Column: Video Player */}
          <div className="lg:col-span-8 flex flex-col gap-6">
            {/* Video Container */}
            <div className="relative w-full aspect-video bg-[#0a0a0a] rounded-xl border border-white/5 overflow-hidden group cursor-pointer shadow-2xl shadow-black/50">
              {/* Fake Video Thumbnail (Gradient + Pattern) */}
              <div className="absolute inset-0 bg-gradient-to-br from-[#1a1a1a] to-[#050505]" />
              <div className="absolute inset-0 opacity-[0.03] bg-[radial-gradient(circle_at_center,_white_1px,_transparent_1px)] [background-size:24px_24px]" />
              
              {/* Play Button Overlay */}
              <div className="absolute inset-0 flex items-center justify-center bg-black/20 group-hover:bg-black/40 transition-all duration-500 backdrop-blur-[2px]">
                <div className="w-20 h-20 rounded-full bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center group-hover:scale-110 group-hover:bg-[#c79c6e] group-hover:border-[#c79c6e] transition-all duration-500">
                  <Play size={32} weight="fill" className="text-white ml-2" />
                </div>
              </div>

              {/* Video Info Overlay */}
              <div className="absolute bottom-0 left-0 w-full p-6 bg-gradient-to-t from-black/90 via-black/40 to-transparent">
                <span className="font-sans text-[0.65rem] uppercase tracking-[0.2em] text-[#c79c6e] font-medium block mb-2">
                  Up Next
                </span>
                <h3 className="font-serif text-2xl md:text-3xl text-white">
                  {activeLesson.title}
                </h3>
              </div>
            </div>

            {/* Video Details */}
            <div className="bg-[#0a0a0a] border border-white/5 p-6 rounded-xl">
              <h4 className="font-serif text-xl text-white mb-3">About this lesson</h4>
              <p className="font-sans text-white/60 text-sm leading-relaxed mb-6">
                In this session, we dive deep into the mechanics of presence. You will learn how to anchor yourself in high-pressure situations, tune out internal noise, and project a calm, magnetic energy that naturally draws people in.
              </p>
              
              <div className="flex items-center gap-6 border-t border-white/5 pt-6">
                <div className="flex items-center gap-2">
                  <Clock size={18} className="text-[#c79c6e]" weight="light" />
                  <span className="font-sans text-xs uppercase tracking-widest text-white/50">{activeLesson.duration}</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-[#c79c6e]/20 flex items-center justify-center">
                    <span className="text-[#c79c6e] text-[10px] font-bold">A</span>
                  </div>
                  <span className="font-sans text-xs uppercase tracking-widest text-white/50">Aarkesh Gupta</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Curriculum Accordion */}
          <div className="lg:col-span-4 flex flex-col gap-4">
            <h3 className="font-sans text-xs uppercase tracking-[0.2em] text-white/40 font-medium mb-2 pl-2">
              Course Curriculum
            </h3>
            
            {MODULES.map((module) => (
              <div 
                key={module.id} 
                className={cn(
                  "border rounded-xl transition-all duration-300 overflow-hidden",
                  activeModule === module.id 
                    ? "border-[#c79c6e]/30 bg-[#0a0a0a]" 
                    : "border-white/5 bg-transparent hover:bg-white/[0.02]"
                )}
              >
                {/* Accordion Header */}
                <button 
                  onClick={() => setActiveModule(activeModule === module.id ? null : module.id)}
                  className="w-full flex items-center justify-between p-5 text-left"
                >
                  <div className="flex-1 pr-4">
                    <h4 className={cn(
                      "font-serif text-lg mb-1 transition-colors",
                      activeModule === module.id ? "text-[#c79c6e]" : "text-white"
                    )}>
                      {module.title}
                    </h4>
                    <div className="flex items-center gap-3">
                      <span className="font-sans text-[0.65rem] uppercase tracking-widest text-white/40">
                        {module.lessons.length} Lessons
                      </span>
                      <span className="w-1 h-1 rounded-full bg-white/20" />
                      <span className="font-sans text-[0.65rem] uppercase tracking-widest text-white/40">
                        {module.duration}
                      </span>
                    </div>
                  </div>
                  <CaretDown 
                    size={20} 
                    className={cn(
                      "text-white/40 transition-transform duration-300",
                      activeModule === module.id ? "rotate-180" : ""
                    )} 
                  />
                </button>

                {/* Accordion Content (Lessons) */}
                <div 
                  className={cn(
                    "grid transition-all duration-300 ease-in-out",
                    activeModule === module.id ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
                  )}
                >
                  <div className="overflow-hidden">
                    <div className="p-2 pt-0 pb-4 flex flex-col gap-1">
                      {module.lessons.map((lesson) => {
                        const isPlaying = activeLesson.id === lesson.id;
                        
                        return (
                          <button
                            key={lesson.id}
                            disabled={lesson.isLocked}
                            onClick={() => setActiveLesson(lesson)}
                            className={cn(
                              "w-full flex items-center gap-4 p-3 rounded-lg text-left transition-all duration-300 group",
                              lesson.isLocked ? "opacity-50 cursor-not-allowed" : "cursor-pointer hover:bg-white/5",
                              isPlaying ? "bg-white/5" : ""
                            )}
                          >
                            {/* Icon State */}
                            <div className="flex-shrink-0 w-6 flex justify-center">
                              {lesson.isLocked ? (
                                <LockKey size={16} weight="fill" className="text-white/20" />
                              ) : lesson.isCompleted ? (
                                <CheckCircle size={18} weight="fill" className="text-[#c79c6e]" />
                              ) : isPlaying ? (
                                <Play size={16} weight="fill" className="text-[#c79c6e]" />
                              ) : (
                                <Play size={16} weight="regular" className="text-white/40 group-hover:text-white" />
                              )}
                            </div>
                            
                            {/* Title & Duration */}
                            <div className="flex-1 flex flex-col gap-1 pr-2">
                              <span className={cn(
                                "font-sans text-sm line-clamp-1",
                                isPlaying ? "text-white font-medium" : "text-white/70"
                              )}>
                                {lesson.title}
                              </span>
                            </div>
                            
                            <span className="font-sans text-[0.65rem] text-white/40 tabular-nums">
                              {lesson.duration}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

        </div>
      </Container>
    </div>
  );
}
