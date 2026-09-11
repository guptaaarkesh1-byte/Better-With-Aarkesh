import React, { useState, useEffect } from 'react';
import { useSearchParams, useLocation, useNavigate } from 'react-router-dom';
import { 
  GraduationCap, 
  UploadSimple, 
  VideoCamera, 
  Users,
  FilmStrip
} from '@phosphor-icons/react';
import AdminCourseCurriculum from './AdminCourseCurriculum';
import AdminCourseStudents from './AdminCourseStudents';

export default function AdminCourse() {
  const [searchParams, setSearchParams] = useSearchParams();
  const location = useLocation();
  const navigate = useNavigate();

  const getInitialTab = () => {
    const tabParam = searchParams.get('tab');
    if (tabParam === 'curriculum' || tabParam === 'videos') return 'curriculum';
    if (tabParam === 'students') return 'students';
    if (location.pathname.startsWith('/upload-videos') || location.pathname.startsWith('/course-curriculum')) return 'curriculum';
    return 'students'; // default to Students & Purchases view inside Course
  };

  const [activeTab, setActiveTab] = useState(getInitialTab);

  useEffect(() => {
    const tabParam = searchParams.get('tab');
    if (tabParam === 'students') {
      setActiveTab('students');
    } else if (tabParam === 'videos' || tabParam === 'curriculum') {
      setActiveTab('curriculum');
    } else if (location.pathname.startsWith('/upload-videos') || location.pathname.startsWith('/course-curriculum')) {
      setActiveTab('curriculum');
    } else if (location.pathname.startsWith('/course-students')) {
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
        <div className="flex items-center gap-2">
          <button
            id="tab-btn-students"
            onClick={() => handleTabSwitch('students')}
            className={`flex items-center gap-2.5 px-4 py-2 rounded-lg text-xs font-semibold uppercase tracking-wider transition-all ${
              activeTab === 'students'
                ? 'bg-[#c79c6e] text-black shadow-lg shadow-[#c79c6e]/15'
                : 'bg-white/5 text-white/60 hover:text-white hover:bg-white/10'
            }`}
          >
            <GraduationCap size={16} weight={activeTab === 'students' ? 'bold' : 'regular'} />
            <span>Course Students & Purchases</span>
          </button>

          <button
            id="tab-btn-curriculum"
            onClick={() => handleTabSwitch('curriculum')}
            className={`flex items-center gap-2.5 px-4 py-2 rounded-lg text-xs font-semibold uppercase tracking-wider transition-all ${
              activeTab === 'curriculum'
                ? 'bg-[#c79c6e] text-black shadow-lg shadow-[#c79c6e]/15'
                : 'bg-white/5 text-white/60 hover:text-white hover:bg-white/10'
            }`}
          >
            <UploadSimple size={15} weight={activeTab === 'curriculum' ? 'bold' : 'regular'} />
            <span>Upload Videos & Curriculum</span>
          </button>
        </div>

        <div className="hidden sm:flex items-center gap-2 text-xs text-white/40">
          <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
          <span>Presence Protocol™ Course Hub</span>
        </div>
      </div>

      {/* Main Tab Content */}
      <div className="flex-1">
        {activeTab === 'students' ? (
          <AdminCourseStudents />
        ) : (
          <AdminCourseCurriculum />
        )}
      </div>
    </div>
  );
}
