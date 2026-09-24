import React, { useState } from 'react';
import { Link, useLocation, useNavigate, Outlet } from 'react-router-dom';
import { 
  SquaresFour, 
  Users,
  FolderOpen,
  GraduationCap,
  SignOut,
  House,
  Books,
  CalendarBlank,
  SlidersHorizontal,
  Sun
} from '@phosphor-icons/react';
import GlobalVisualSettingsModal from '../components/GlobalVisualSettingsModal';

export default function AdminLayout({ children, onLogout }) {
  const [showVisualModal, setShowVisualModal] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const currentPath = location.pathname;

  // Determine active top tab based on route
  const getActiveTab = () => {
    if (currentPath.startsWith('/home') || currentPath.startsWith('/home-editor')) return 'home';
    if (currentPath.startsWith('/library')) return 'library';
    if (currentPath.startsWith('/booking') || currentPath.startsWith('/book-editor') || currentPath.startsWith('/booking-editor')) return 'booking';
    if (currentPath.startsWith('/coaching') || currentPath.startsWith('/appointments') || currentPath.startsWith('/profile') || currentPath.startsWith('/journey')) return 'coaching';
    if (currentPath.startsWith('/course') || currentPath.startsWith('/admin/courses') || currentPath.startsWith('/upload-videos')) return 'course';
    if (currentPath.startsWith('/footer-documents')) return 'footer';
    return 'overview';
  };

  const activeTab = getActiveTab();

  const topTabs = [
    { id: 'overview', label: 'Overview', icon: <SquaresFour size={18} />, path: '/' },
    { id: 'coaching', label: 'Appointments', icon: <Users size={18} />, path: '/coaching' },
    { id: 'home', label: 'Home', icon: <House size={18} />, path: '/home-editor' },
    { id: 'library', label: 'Library', icon: <Books size={18} />, path: '/library' },
    { id: 'booking', label: 'Book a Session', icon: <CalendarBlank size={18} />, path: '/booking-editor' },
    { id: 'course', label: 'Course', icon: <GraduationCap size={18} />, path: '/course' },
    { id: 'footer', label: 'Footer', icon: <FolderOpen size={18} />, path: '/footer-documents' },
  ];

  return (
    <div className="w-full min-h-screen bg-[#050505] text-white font-sans flex flex-col">
      {/* Top Bar (Header + Tabs) */}
      <header className="w-full bg-[#0a0a0a] border-b border-white/5 flex flex-col z-30 sticky top-0">
        <div className="px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-8 h-8 rounded bg-[#c79c6e]/10 border border-[#c79c6e]/30 flex items-center justify-center">
              <span className="text-[#c79c6e] font-serif font-bold text-lg leading-none">B</span>
            </div>
            <h2 className="font-serif text-xl text-[#c79c6e]">BWA Admin</h2>
          </div>
          
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowVisualModal(true)}
              className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white/5 hover:bg-[#c79c6e]/10 border border-white/10 hover:border-[#c79c6e]/40 text-white/80 hover:text-[#c79c6e] text-xs font-semibold uppercase tracking-wider transition-all shadow-sm"
              title="Global Master Controls (Font Size, Contrast, Brightness & Overlay)"
            >
              <SlidersHorizontal size={16} className="text-[#c79c6e]" weight="bold" />
              <span className="hidden sm:inline">Master Controls</span>
            </button>

            <button 
              onClick={onLogout}
              className="flex items-center gap-2 px-4 py-2 text-red-500/70 hover:text-red-500 hover:bg-red-500/10 rounded-md transition-colors text-sm"
            >
              <SignOut size={16} />
              <span className="hidden md:inline tracking-wide">Logout</span>
            </button>
          </div>
        </div>

        <GlobalVisualSettingsModal
          isOpen={showVisualModal}
          onClose={() => setShowVisualModal(false)}
        />
        
        {/* Horizontal Tabs */}
        <div className="px-6 flex items-center gap-1 overflow-x-auto scrollbar-hide border-t border-white/5 bg-[#050505]/50">
          {topTabs.map(tab => {
            const isActive = activeTab === tab.id;
            return (
              <Link
                key={tab.id}
                to={tab.path}
                className={`flex items-center gap-2 px-6 py-4 border-b-2 transition-colors whitespace-nowrap ${
                  isActive 
                    ? 'border-[#c79c6e] text-[#c79c6e] bg-[#c79c6e]/5' 
                    : 'border-transparent text-white/50 hover:text-white hover:bg-white/5'
                }`}
              >
                {tab.icon}
                <span className="text-sm font-medium tracking-wide">{tab.label}</span>
              </Link>
            );
          })}
        </div>
      </header>

      {/* Main Layout */}
      <div className="flex-1 flex overflow-hidden">
        {/* Page Content */}
        <main className="flex-1 overflow-y-auto bg-[#050505] relative">
          {children || <Outlet />}
        </main>
      </div>
    </div>
  );
}
