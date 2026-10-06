import React from 'react';
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
  Sun,
  Gear
} from '@phosphor-icons/react';

export default function AdminLayout({ children, onLogout }) {
  const location = useLocation();
  const navigate = useNavigate();
  const currentPath = location.pathname;

  // Determine active top tab based on route
  const getActiveTab = () => {
    if (currentPath.startsWith('/home') || currentPath.startsWith('/home-editor')) return 'home';
    if (currentPath.startsWith('/library')) return 'library';
    if (currentPath.startsWith('/booking') || currentPath.startsWith('/book-editor') || currentPath.startsWith('/booking-editor')) return 'booking';
    if (currentPath.startsWith('/profile') || currentPath.startsWith('/settings')) return 'settings';
    if (currentPath.startsWith('/coaching') || currentPath.startsWith('/appointments')) return 'coaching';
    if (currentPath.startsWith('/course') || currentPath.startsWith('/admin/courses') || currentPath.startsWith('/upload-videos') || currentPath.startsWith('/course-curriculum') || currentPath.startsWith('/course-students')) return 'course';
    if (currentPath.startsWith('/footer-documents')) return 'footer';
    return 'overview';
  };

  const activeTab = getActiveTab();

  const topTabs = [
    { id: 'overview', label: 'Overview', icon: <SquaresFour size={18} />, path: '/' },
    { id: 'coaching', label: 'Appointments', icon: <Users size={18} />, path: '/appointments' },
    { id: 'home', label: 'Home', icon: <House size={18} />, path: '/home-editor' },
    { id: 'library', label: 'Library', icon: <Books size={18} />, path: '/library' },
    { id: 'booking', label: 'Book a Session', icon: <CalendarBlank size={18} />, path: '/booking-editor' },
    { id: 'course', label: 'Course', icon: <GraduationCap size={18} />, path: '/course' },
    { id: 'footer', label: 'Footer', icon: <FolderOpen size={18} />, path: '/footer-documents' },
    { id: 'settings', label: 'Setting', icon: <Gear size={18} />, path: '/settings' },
  ];

  return (
    <div className="bwa-admin-root w-full min-h-screen flex flex-col">
      {/* Top Header */}
      <header className="bwa-top">
        <Link to="/" className="bwa-brand">
          <div className="bwa-logo">B</div>
          <span>BWA Admin</span>
        </Link>
        
        <div className="bwa-top-r">
          <button 
            type="button"
            onClick={onLogout}
            className="bwa-logout"
          >
            <SignOut size={16} />
            <span>Logout</span>
          </button>
        </div>
      </header>
      
      {/* Module Tabs Navigation */}
      <nav className="bwa-mods" aria-label="Module Sections">
        {topTabs.map(tab => {
          const isActive = activeTab === tab.id;
          return (
            <Link
              key={tab.id}
              to={tab.path}
              className={isActive ? 'on' : ''}
            >
              {tab.label}
            </Link>
          );
        })}
      </nav>

      {/* Main Page Area */}
      <main className="flex-1 w-full bg-[#F5F0E8]">
        {children || <Outlet />}
      </main>
    </div>
  );
}
