import React from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { 
  SquaresFour, 
  Users, 
  FileText, 
  CalendarBlank, 
  CurrencyDollar,
  SignOut
} from '@phosphor-icons/react';

export default function AdminLayout() {
  const location = useLocation();

  const navItems = [
    { path: '/admin', label: 'Overview', icon: <SquaresFour size={20} /> },
    { path: '/admin/users', label: 'Users', icon: <Users size={20} /> },
    { path: '/admin/content', label: 'Content', icon: <FileText size={20} /> },
    { path: '/admin/appointments', label: 'Appointments', icon: <CalendarBlank size={20} /> },
    { path: '/admin/transactions', label: 'Transactions', icon: <CurrencyDollar size={20} /> },
  ];

  return (
    <div className="w-full min-h-screen bg-[#050505] text-white font-sans flex">
      {/* Sidebar */}
      <aside className="w-64 border-r border-white/5 bg-[#0a0a0a] flex flex-col shrink-0 relative z-20 h-screen sticky top-0">
        
        {/* Branding */}
        <div className="p-8 border-b border-white/5">
          <h2 className="font-serif text-2xl text-[#c79c6e]">BWA Admin</h2>
          <span className="text-white/40 text-[0.65rem] uppercase tracking-widest mt-1 block">Dashboard</span>
        </div>

        {/* Navigation */}
        <nav className="flex-1 py-8 px-4 flex flex-col gap-2">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path || 
                             (item.path !== '/admin' && location.pathname.startsWith(item.path));
            
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-4 px-4 py-3 rounded-md transition-colors ${
                  isActive 
                    ? 'bg-[#c79c6e]/10 text-[#c79c6e] font-medium' 
                    : 'text-white/50 hover:text-white hover:bg-white/5'
                }`}
              >
                {item.icon}
                <span className="text-sm tracking-wide">{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="p-6 border-t border-white/5">
          <Link to="/" className="flex items-center gap-4 px-4 py-3 text-white/40 hover:text-white transition-colors">
            <SignOut size={20} />
            <span className="text-sm tracking-wide">Exit to Site</span>
          </Link>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 overflow-x-hidden">
        <Outlet />
      </main>
    </div>
  );
}
