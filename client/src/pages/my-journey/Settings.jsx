import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { 
  User, Bell, LockKey, CaretLeft, CalendarBlank,
  SignOut, Lock, CheckCircle, ArrowLeft, Play,
  CaretDown, CaretUp
} from '@phosphor-icons/react';
import './my-journey.css';
import ProfileTab from './components/settings/ProfileTab';
import NotificationsTab from './components/settings/NotificationsTab';
import SecurityPrivacyTab from './components/settings/SecurityPrivacyTab';

export default function Settings() {
  const location = useLocation();
  const navigate = useNavigate();
  const searchParams = new URLSearchParams(location.search);
  const tabFromUrl = searchParams.get('tab');
  
  const [activeTab, setActiveTab] = useState(tabFromUrl || 'PROFILE');
  const [user, setUser] = useState(null);
  const [avatarMenuOpen, setAvatarMenuOpen] = useState(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem('userInfo');
      if (saved) {
        setUser(JSON.parse(saved));
      }
    } catch (e) {
      console.error(e);
    }
  }, []);

  useEffect(() => {
    if (tabFromUrl && tabFromUrl !== activeTab) {
      setActiveTab(tabFromUrl);
    }
  }, [tabFromUrl]);

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    navigate(`/my-journey/settings?tab=${tab}`, { replace: true });
  };

  return (
    <div className="mj-container">
      <div className="mj-shell">

        {/* ─── DARK TOP BAR ─── */}
        <header className="mj-top">
          <div className="mj-top-inner">
            <div className="mj-bar">
              <div className="flex items-center gap-3 sm:gap-4">
                <Link 
                  to="/" 
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/10 hover:bg-white/20 text-[#f5f1e8] text-xs font-semibold tracking-wide border border-white/15 transition-all cursor-pointer shadow-xs"
                  title="Back to Home"
                >
                  <ArrowLeft size={14} weight="bold" />
                  <span>Home</span>
                </Link>

                <Link to="/" className="mj-logo">
                  BetterWith<span>Aarkesh</span>
                </Link>
              </div>

              <div className="mj-actions">
                <button 
                  onClick={() => navigate('/course')}
                  className="mj-btn mj-btn-primary"
                >
                  <Play size={14} weight="fill" />
                  <span>COURSE</span>
                </button>

                {/* User Avatar (Round Shape) & Dropdown */}
                <div className="relative">
                  <div 
                    onClick={() => setAvatarMenuOpen(!avatarMenuOpen)}
                    className="w-[38px] h-[38px] rounded-full bg-[#c8512d] text-white flex items-center justify-center font-bold text-sm cursor-pointer shadow-md hover:opacity-90 active:scale-95 transition-all select-none overflow-hidden relative" 
                    title={user?.fullName || 'Your Profile'}
                  >
                    {user?.photoUrl ? (
                      <img 
                        src={user.photoUrl} 
                        alt="" 
                        onError={(e) => { e.currentTarget.style.display = 'none'; }} 
                        className="w-full h-full object-cover rounded-full absolute inset-0" 
                      />
                    ) : null}
                    <span>{(user?.fullName || 'Y').charAt(0).toUpperCase()}</span>
                  </div>

                  {avatarMenuOpen && (
                    <div className="absolute right-0 top-full mt-3 w-[290px] bg-[#faf8f6] border border-[#e4dfd9] rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.18)] overflow-hidden z-[200] text-[#1c1714] animate-in fade-in slide-in-from-top-2 duration-150">
                      <div className="p-6 pb-4 text-left">
                        <div className="flex items-center gap-3.5 mb-4">
                          <div className="w-[46px] h-[46px] rounded-full bg-[#c8512d] text-white flex items-center justify-center font-bold text-base shrink-0 shadow-sm overflow-hidden relative border border-[#e4dfd9]">
                            {user?.photoUrl ? (
                              <img 
                                src={user.photoUrl} 
                                alt="" 
                                onError={(e) => { e.currentTarget.style.display = 'none'; }} 
                                className="w-full h-full object-cover rounded-full absolute inset-0" 
                              />
                            ) : null}
                            <span>{(user?.fullName || 'Y').charAt(0).toUpperCase()}</span>
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="text-[#c8512d] text-[10.5px] font-bold tracking-[0.18em] uppercase mb-0.5">
                              WELCOME BACK
                            </p>
                            <h3 
                              className="text-[22px] font-semibold text-[#1c1714] leading-tight capitalize truncate"
                              style={{ fontFamily: 'Fraunces, Georgia, serif' }}
                            >
                              {user?.fullName ? user.fullName.split(' ')[0] : 'User'}
                            </h3>
                          </div>
                        </div>

                        {/* Continue Journey Button */}
                        <button
                          onClick={() => {
                            setAvatarMenuOpen(false);
                            navigate('/my-journey');
                          }}
                          className="w-full h-11 rounded-full bg-[#1c1714] hover:bg-black text-white font-bold text-[11px] tracking-[0.14em] uppercase flex items-center justify-center gap-3 transition-colors cursor-pointer"
                        >
                          <span>MY JOURNEY & PROFILE</span>
                          <span className="text-base leading-none">→</span>
                        </button>
                      </div>

                      {/* Bottom Logout Row */}
                      <div className="border-t border-[#e4dfd9] px-6 py-3 bg-[#faf8f6]">
                        <button 
                          onClick={() => {
                            setAvatarMenuOpen(false);
                            localStorage.clear();
                            window.dispatchEvent(new Event('auth-change'));
                            navigate('/');
                          }}
                          className="flex items-center gap-2.5 text-[#9a918a] hover:text-[#c8512d] text-[13.5px] font-medium transition-colors w-full text-left cursor-pointer"
                        >
                          <SignOut size={18} />
                          <span>Log out</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Title & Back Button Strip */}
            <div className="mj-strip justify-between">
              <div className="mj-hello">
                <h1>Profile & Settings</h1>
                <p>Manage your details, preferences and account security.</p>
              </div>

              <div className="flex items-center gap-3">
                <button 
                  onClick={() => navigate('/my-journey')}
                  className="mj-btn mj-btn-line !bg-transparent !text-white !border-[#4a413b] hover:!bg-[#2b2420]"
                >
                  <CaretLeft size={16} weight="bold" />
                  <span>Back to My Journey</span>
                </button>
              </div>
            </div>
          </div>
        </header>

        {/* ─── SECTION TABS BAR ─── */}
        <div className="mj-tabbar">
          <div className="mj-tabbar-inner">
            <nav className="mj-tabs" role="tablist">
              <button 
                className={`mj-tab ${activeTab === 'PROFILE' ? 'active' : ''}`}
                onClick={() => handleTabChange('PROFILE')}
              >
                <User size={17} weight={activeTab === 'PROFILE' ? 'bold' : 'regular'} />
                <span>Profile</span>
              </button>

              <button 
                className={`mj-tab ${activeTab === 'NOTIFICATIONS' ? 'active' : ''}`}
                onClick={() => handleTabChange('NOTIFICATIONS')}
              >
                <Bell size={17} weight={activeTab === 'NOTIFICATIONS' ? 'bold' : 'regular'} />
                <span>Notifications</span>
              </button>

              <button 
                className={`mj-tab ${activeTab === 'SECURITY' ? 'active' : ''}`}
                onClick={() => handleTabChange('SECURITY')}
              >
                <LockKey size={17} weight={activeTab === 'SECURITY' ? 'bold' : 'regular'} />
                <span>Security & Privacy</span>
              </button>
            </nav>
          </div>
        </div>

        {/* ─── MAIN BODY ─── */}
        <div className="mj-body-wrap">
          <div className="mj-body fullwidth">
            <main className="w-full flex justify-center">
              <div className="w-full max-w-[700px]">
                {activeTab === 'PROFILE' && <ProfileTab />}
                {activeTab === 'NOTIFICATIONS' && <NotificationsTab />}
                {activeTab === 'SECURITY' && <SecurityPrivacyTab />}
              </div>
            </main>
          </div>
        </div>

      </div>
    </div>
  );
}
