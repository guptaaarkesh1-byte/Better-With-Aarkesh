import React, { useState, useEffect } from 'react';
import { useSearchParams, useLocation } from 'react-router-dom';
import { 
  GraduationCap, 
  UploadSimple, 
  CurrencyInr 
} from '@phosphor-icons/react';
import AdminCourseCurriculum from './AdminCourseCurriculum';
import AdminCourseStudents from './AdminCourseStudents';
import AdminCourseFee from './AdminCourseFee';

export default function AdminCourse() {
  const [searchParams, setSearchParams] = useSearchParams();
  const location = useLocation();

  const getInitialTab = () => {
    const tabParam = searchParams.get('tab');
    if (tabParam === 'students') return 'students';
    if (tabParam === 'curriculum' || tabParam === 'videos' || tabParam === 'comments') return 'curriculum';
    if (tabParam === 'fee' || tabParam === 'pricing' || tabParam === 'gst') return 'fee';
    if (location.pathname.startsWith('/course-fee') || location.pathname.startsWith('/course-pricing')) return 'fee';
    if (location.pathname.startsWith('/upload-videos') || location.pathname.startsWith('/course-curriculum')) return 'curriculum';
    if (location.pathname.startsWith('/course-students')) return 'students';
    return 'students';
  };

  const [activeTab, setActiveTab] = useState(getInitialTab);

  useEffect(() => {
    const tabParam = searchParams.get('tab');
    if (tabParam === 'fee' || tabParam === 'pricing' || tabParam === 'gst') {
      setActiveTab('fee');
    } else if (tabParam === 'curriculum' || tabParam === 'videos' || tabParam === 'comments') {
      setActiveTab('curriculum');
    } else if (tabParam === 'students') {
      setActiveTab('students');
    } else if (location.pathname.startsWith('/course-fee') || location.pathname.startsWith('/course-pricing')) {
      setActiveTab('fee');
    } else if (location.pathname.startsWith('/upload-videos') || location.pathname.startsWith('/course-curriculum')) {
      setActiveTab('curriculum');
    } else if (location.pathname.startsWith('/course-students')) {
      setActiveTab('students');
    } else if (!tabParam) {
      setActiveTab('students');
    }
  }, [searchParams, location.pathname]);

  const handleTabSwitch = (tab) => {
    setActiveTab(tab);
    setSearchParams({ tab });
  };

  return (
    <div className="w-full min-h-screen bg-[#050505] text-white flex flex-col">
      {/* Sub Navigation Bar for Course Vertical */}
      <div className="w-full bg-[#0a0a0a]/90 backdrop-blur-md border-b border-white/5 px-6 py-3.5 flex items-center justify-between sticky top-0 z-20">
        <div className="flex items-center gap-2 flex-wrap">
          {/* 1. Course Fee & GST (First in Order) */}
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

          {/* 2. Upload Videos & Curriculum */}
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

          {/* 3. Course Students & Purchases */}
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
        </div>
      </div>

      {/* Main Tab Content */}
      <div className="flex-1">
        {activeTab === 'fee' ? (
          <AdminCourseFee />
        ) : activeTab === 'curriculum' ? (
          <AdminCourseCurriculum />
        ) : (
          <AdminCourseStudents />
        )}
      </div>
    </div>
  );
}
