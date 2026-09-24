import React, { useState, useEffect } from 'react';
import { useSearchParams, useLocation } from 'react-router-dom';
import { 
  SlidersHorizontal,
  Question,
  GraduationCap, 
  UploadSimple, 
  CurrencyInr 
} from '@phosphor-icons/react';
import AdminCourseControl from './AdminCourseControl';
import AdminCourseFaq from './AdminCourseFaq';
import AdminCourseCurriculum from './AdminCourseCurriculum';
import AdminCourseStudents from './AdminCourseStudents';
import AdminCourseFee from './AdminCourseFee';

export default function AdminCourse() {
  const [searchParams, setSearchParams] = useSearchParams();
  const location = useLocation();

  const getInitialTab = () => {
    const tabParam = searchParams.get('tab');
    if (tabParam === 'students' || tabParam === 'purchases' || tabParam === 'orders' || tabParam === 'users') return 'students';
    if (tabParam === 'control' || tabParam === 'cards' || tabParam === 'master') return 'control';
    if (tabParam === 'faq' || tabParam === 'faqs' || tabParam === 'questions') return 'faq';
    if (tabParam === 'fee' || tabParam === 'pricing' || tabParam === 'gst') return 'fee';
    if (tabParam === 'curriculum' || tabParam === 'videos' || tabParam === 'comments') return 'curriculum';
    if (location.pathname.startsWith('/course-students') || location.pathname.startsWith('/course-purchases')) return 'students';
    if (location.pathname.startsWith('/course-control') || location.pathname.startsWith('/course-cards')) return 'control';
    if (location.pathname.startsWith('/course-faq')) return 'faq';
    if (location.pathname.startsWith('/course-fee') || location.pathname.startsWith('/course-pricing')) return 'fee';
    if (location.pathname.startsWith('/upload-videos') || location.pathname.startsWith('/course-curriculum')) return 'curriculum';

    try {
      const saved = localStorage.getItem('bwa_admin_course_tab');
      if (saved && ['students', 'control', 'faq', 'fee', 'curriculum'].includes(saved)) return saved;
    } catch (e) {}

    return 'students';
  };

  const [activeTab, setActiveTab] = useState(getInitialTab);

  useEffect(() => {
    const tabParam = searchParams.get('tab');
    if (tabParam === 'students' || tabParam === 'purchases' || tabParam === 'orders' || tabParam === 'users') {
      setActiveTab('students');
    } else if (tabParam === 'control' || tabParam === 'cards' || tabParam === 'master') {
      setActiveTab('control');
    } else if (tabParam === 'faq' || tabParam === 'faqs' || tabParam === 'questions') {
      setActiveTab('faq');
    } else if (tabParam === 'fee' || tabParam === 'pricing' || tabParam === 'gst') {
      setActiveTab('fee');
    } else if (tabParam === 'curriculum' || tabParam === 'videos' || tabParam === 'comments') {
      setActiveTab('curriculum');
    } else if (location.pathname.startsWith('/course-students') || location.pathname.startsWith('/course-purchases')) {
      setActiveTab('students');
    } else if (location.pathname.startsWith('/course-control') || location.pathname.startsWith('/course-cards')) {
      setActiveTab('control');
    } else if (location.pathname.startsWith('/course-faq')) {
      setActiveTab('faq');
    } else if (location.pathname.startsWith('/course-fee') || location.pathname.startsWith('/course-pricing')) {
      setActiveTab('fee');
    } else if (location.pathname.startsWith('/upload-videos') || location.pathname.startsWith('/course-curriculum')) {
      setActiveTab('curriculum');
    }
  }, [searchParams, location.pathname]);

  // Persist tab to localStorage and sync URL
  useEffect(() => {
    try {
      localStorage.setItem('bwa_admin_course_tab', activeTab);
      const url = new URL(window.location.href);
      url.searchParams.set('tab', activeTab);
      window.history.replaceState({}, '', url.toString());
    } catch (e) {}
  }, [activeTab]);

  const handleTabSwitch = (tab) => {
    setActiveTab(tab);
    setSearchParams({ tab });
  };

  return (
    <div className="w-full min-h-screen bg-[#050505] text-white flex flex-col">
      {/* Sub Navigation Bar for Course Vertical */}
      <div className="w-full bg-[#0a0a0a]/90 backdrop-blur-md border-b border-white/5 px-6 py-3.5 flex items-center justify-between sticky top-0 z-20">
        <div className="flex items-center gap-2 flex-wrap">
          {/* 1. Course Students & Purchases (First in Order) */}
          <button
            id="tab-btn-students"
            onClick={() => handleTabSwitch('students')}
            className={`flex items-center gap-2.5 px-4 py-2 rounded-lg text-xs font-semibold uppercase tracking-wider transition-all cursor-pointer ${
              activeTab === 'students'
                ? 'bg-[#c79c6e] text-black shadow-lg shadow-[#c79c6e]/15'
                : 'bg-white/5 text-white/60 hover:text-white hover:bg-white/10'
            }`}
          >
            <GraduationCap size={16} weight={activeTab === 'students' ? 'bold' : 'regular'} />
            <span>Course Students &amp; Purchases</span>
          </button>

          {/* 2. Course Fee & GST */}
          <button
            id="tab-btn-fee"
            onClick={() => handleTabSwitch('fee')}
            className={`flex items-center gap-2.5 px-4 py-2 rounded-lg text-xs font-semibold uppercase tracking-wider transition-all cursor-pointer ${
              activeTab === 'fee'
                ? 'bg-[#c79c6e] text-black shadow-lg shadow-[#c79c6e]/15'
                : 'bg-white/5 text-white/60 hover:text-white hover:bg-white/10'
            }`}
          >
            <CurrencyInr size={15} weight={activeTab === 'fee' ? 'bold' : 'regular'} />
            <span>Course Fee &amp; GST</span>
          </button>

          {/* 3. Upload Videos & Curriculum */}
          <button
            id="tab-btn-curriculum"
            onClick={() => handleTabSwitch('curriculum')}
            className={`flex items-center gap-2.5 px-4 py-2 rounded-lg text-xs font-semibold uppercase tracking-wider transition-all cursor-pointer ${
              activeTab === 'curriculum'
                ? 'bg-[#c79c6e] text-black shadow-lg shadow-[#c79c6e]/15'
                : 'bg-white/5 text-white/60 hover:text-white hover:bg-white/10'
            }`}
          >
            <UploadSimple size={15} weight={activeTab === 'curriculum' ? 'bold' : 'regular'} />
            <span>Upload Videos &amp; Curriculum</span>
          </button>

          {/* 4. What you will master */}
          <button
            id="tab-btn-control"
            onClick={() => handleTabSwitch('control')}
            className={`flex items-center gap-2.5 px-4 py-2 rounded-lg text-xs font-semibold uppercase tracking-wider transition-all cursor-pointer ${
              activeTab === 'control'
                ? 'bg-[#c79c6e] text-black shadow-lg shadow-[#c79c6e]/15'
                : 'bg-white/5 text-white/60 hover:text-white hover:bg-white/10'
            }`}
          >
            <SlidersHorizontal size={15} weight={activeTab === 'control' ? 'bold' : 'regular'} />
            <span>What you will master</span>
          </button>

          {/* 5. FAQ */}
          <button
            id="tab-btn-faq"
            onClick={() => handleTabSwitch('faq')}
            className={`flex items-center gap-2.5 px-4 py-2 rounded-lg text-xs font-semibold uppercase tracking-wider transition-all cursor-pointer ${
              activeTab === 'faq'
                ? 'bg-[#c79c6e] text-black shadow-lg shadow-[#c79c6e]/15'
                : 'bg-white/5 text-white/60 hover:text-white hover:bg-white/10'
            }`}
          >
            <Question size={15} weight={activeTab === 'faq' ? 'bold' : 'regular'} />
            <span>FAQ</span>
          </button>
        </div>
      </div>

      {/* Main Tab Content */}
      <div className="flex-1">
        {activeTab === 'students' ? (
          <AdminCourseStudents />
        ) : activeTab === 'fee' ? (
          <AdminCourseFee />
        ) : activeTab === 'curriculum' ? (
          <AdminCourseCurriculum />
        ) : activeTab === 'control' ? (
          <AdminCourseControl />
        ) : (
          <AdminCourseFaq />
        )}
      </div>
    </div>
  );
}
