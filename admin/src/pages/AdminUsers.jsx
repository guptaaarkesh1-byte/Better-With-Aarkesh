import React, { useState } from 'react';
import { 
  MagnifyingGlass, 
  CaretDown, 
  CaretUp, 
  Eye, 
  CalendarBlank, 
  Plus, 
  CaretLeft, 
  CaretRight,
  X,
  Phone,
  User,
  FileText,
  Clock,
  CurrencyCircleDollar
} from '@phosphor-icons/react';

export default function AdminUsers() {
  const [expandedUser, setExpandedUser] = useState(1); // Default expand first user
  
  // Sidebar State
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [selectedSession, setSelectedSession] = useState(null);

  const openProfile = (user) => {
    setSelectedSession(null);
    setSelectedUser(user);
    setIsSidebarOpen(true);
  };

  const openSessionDetails = (user, session) => {
    setSelectedUser(user);
    setSelectedSession(session);
    setIsSidebarOpen(true);
  };

  const closeProfile = () => {
    setIsSidebarOpen(false);
    setTimeout(() => {
      // Clear after closing animation to prevent flickering content
      setSelectedSession(null);
    }, 300);
  };

  // Filter States
  const [searchQuery, setSearchQuery] = useState('');
  const [paymentFilter, setPaymentFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [bookingFilter, setBookingFilter] = useState('All');

  // Dropdown UI states
  const [activeDropdown, setActiveDropdown] = useState(null);

  // Mock data with appointment history & payment details
  const mockUsers = [
    { 
      id: 1, 
      name: 'Emma Thompson', 
      email: 'emma.t@example.com', 
      phone: '+1 555-0101', 
      joined: '12 Aug 2026', 
      appointmentsCount: 3,
      nextAppointmentDate: '15 Aug 2026',
      nextAppointmentTime: '10:30 AM',
      nextAppointmentStatus: 'Upcoming',
      history: [
        { 
          id: 101, 
          date: '15 Aug 2026', 
          time: '10:30 AM', 
          type: 'Life Coaching Session', 
          status: 'Upcoming', 
          txnId: 'TXN-9A8B7C', 
          payment: 'Paid', 
          beforeWeSpeak: 'I want to focus on overcoming my imposter syndrome at work and setting boundaries with my manager.',
          rescheduleRequest: {
            requestedDate: '16 Aug 2026',
            requestedTime: '11:00 AM',
            reason: 'I got called into a last-minute mandatory team meeting at my original time.'
          }
        },
        { id: 102, date: '20 Aug 2026', time: '04:00 PM', type: 'Life Coaching Session', status: 'Upcoming', txnId: 'TXN-5D4E3F', payment: 'Failed', beforeWeSpeak: '' },
        { id: 103, date: '05 Aug 2026', time: '02:00 PM', type: 'Life Coaching Session', status: 'Completed', txnId: 'TXN-1A2B3C', payment: 'Paid', beforeWeSpeak: 'Just general anxiety about my upcoming career transition.' },
      ]
    },
    { 
      id: 2, 
      name: 'James Wilson', 
      email: 'james.w@example.com', 
      phone: '+1 555-0102', 
      joined: '10 Aug 2026', 
      appointmentsCount: 0,
      nextAppointmentDate: null,
      history: []
    },
    { 
      id: 3, 
      name: 'Sarah Connor', 
      email: 'sarah.c@example.com', 
      phone: '+1 555-0103', 
      joined: '05 Aug 2026', 
      appointmentsCount: 2,
      nextAppointmentDate: '20 Aug 2026',
      nextAppointmentTime: '04:00 PM',
      nextAppointmentStatus: 'Upcoming',
      history: [
        { id: 104, date: '20 Aug 2026', time: '04:00 PM', type: 'Life Coaching Session', status: 'Upcoming', txnId: 'TXN-8K9L0M', payment: 'Paid', beforeWeSpeak: 'Discussing my progress on the weekly goals we set last time.' },
        { id: 105, date: '01 Aug 2026', time: '10:00 AM', type: 'Introductory Call', status: 'Completed', txnId: 'TXN-2X3Y4Z', payment: 'Failed', beforeWeSpeak: '' },
      ]
    },
    { 
      id: 4, 
      name: 'Michael Brown', 
      email: 'm.brown@example.com', 
      phone: '+1 555-0104', 
      joined: '01 Aug 2026', 
      appointmentsCount: 1,
      nextAppointmentDate: '14 Aug 2026',
      nextAppointmentTime: '06:30 PM',
      nextAppointmentStatus: 'Today',
      history: [
        { id: 106, date: '14 Aug 2026', time: '06:30 PM', type: 'Life Coaching Session', status: 'Today', txnId: 'TXN-7P8Q9R', payment: 'Paid', beforeWeSpeak: 'I am feeling very stuck and need help finding motivation to stick to my daily routine.' }
      ]
    },
    { 
      id: 5, 
      name: 'Lisa Ray', 
      email: 'lisa.ray@example.com', 
      phone: '+1 555-0105', 
      joined: '28 Jul 2026', 
      appointmentsCount: 1,
      nextAppointmentDate: '28 Jul 2026',
      nextAppointmentTime: '05:00 PM',
      nextAppointmentStatus: 'Completed',
      history: [
        { id: 107, date: '28 Jul 2026', time: '05:00 PM', type: 'Initial Consultation', status: 'Completed', txnId: 'TXN-4N5M6L', payment: 'Paid', beforeWeSpeak: 'Exploring if life coaching is right for me.' }
      ]
    },
  ];

  const [users, setUsers] = useState(mockUsers);
  const [statusDropdownOpenId, setStatusDropdownOpenId] = useState(null);

  const updateAppointmentStatus = async (userId, sessionId, newStatus) => {
    try {
      const token = localStorage.getItem('adminToken');
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      
      // Try to update via API if it's a real MongoDB ID (not a mock number ID)
      if (typeof sessionId === 'string' && sessionId.length > 10) {
        const res = await fetch(`${apiUrl}/api/appointments/admin/${sessionId}/status`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ status: newStatus })
        });
        
        if (!res.ok) {
          console.error('Failed to update status in backend', res.status);
          alert('Failed to update status on the server. Please ensure the backend is running with the latest code.');
          return;
        }
      }

      setUsers(prevUsers => prevUsers.map(user => {
        if (user.id === userId) {
          const updatedHistory = user.history.map(session => 
            session.id === sessionId ? { ...session, status: newStatus } : session
          );
          let nextAppointmentStatus = user.nextAppointmentStatus;
          // Note: we assume the first item in history is the next appointment if we update it
          if (updatedHistory.length > 0 && updatedHistory[0].id === sessionId) {
            nextAppointmentStatus = updatedHistory[0].status;
          }
          return { ...user, history: updatedHistory, nextAppointmentStatus };
        }
        return user;
      }));
    } catch (err) {
      console.error('Failed to update status:', err);
      alert('An error occurred while communicating with the server.');
    } finally {
      setStatusDropdownOpenId(null);
    }
  };

  // Fetch real appointments on load
  React.useEffect(() => {
    const fetchRealData = async () => {
      try {
        const token = localStorage.getItem('adminToken');
        const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
        const res = await fetch(`${apiUrl}/api/appointments/admin`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        
        if (res.ok) {
          const appointments = await res.json();
          // Group by user
          const userMap = {};
          
          appointments.forEach(app => {
            const uId = (app.userId && app.userId._id) ? app.userId._id : 'guest_' + app._id;
            if (!userMap[uId]) {
              userMap[uId] = {
                id: uId,
                name: (app.userId && app.userId.name) ? app.userId.name : app.name || 'Unknown User',
                email: (app.userId && app.userId.email) ? app.userId.email : app.email || 'No Email',
                phone: (app.userId && app.userId.phone) ? app.userId.phone : '+1 000-0000',
                joined: new Date((app.userId && app.userId.createdAt) ? app.userId.createdAt : Date.now()).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
                appointmentsCount: 0,
                nextAppointmentDate: null,
                nextAppointmentTime: null,
                nextAppointmentStatus: null,
                history: []
              };
            }
            
            // Format appointment
            userMap[uId].history.push({
              id: app._id,
              date: app.date,
              time: app.time,
              type: app.type || 'Life Coaching Session',
              status: app.status || 'Upcoming',
              txnId: app.orderId || 'TXN-PENDING',
              payment: app.paymentId ? 'Paid' : 'Failed',
              beforeWeSpeak: app.reason || ''
            });
            userMap[uId].appointmentsCount++;
          });

          const realUsers = Object.values(userMap).map(u => {
            if (u.history.length > 0) {
              u.nextAppointmentDate = u.history[0].date;
              u.nextAppointmentTime = u.history[0].time;
              u.nextAppointmentStatus = u.history[0].status;
            }
            return u;
          });

          setUsers([...realUsers, ...mockUsers]);
        }
      } catch (err) {
        console.error('Failed to fetch real appointments:', err);
      }
    };
    
    fetchRealData();
  }, []);

  const toggleExpand = (userId) => {
    setExpandedUser(expandedUser === userId ? null : userId);
  };

  const getStatusPillColor = (status) => {
    switch(status.toLowerCase()) {
      case 'upcoming': return 'text-[#c79c6e] border-[#c79c6e]/40';
      case 'completed': return 'text-green-500 border-green-500/40';
      case 'today': return 'text-blue-400 border-blue-400/40';
      default: return 'text-white/60 border-white/20';
    }
  };

  const getPaymentPillColor = (payment) => {
    switch(payment.toLowerCase()) {
      case 'paid': return 'text-green-500 bg-green-500/10 border-green-500/20';
      case 'failed': return 'text-red-500 bg-red-500/10 border-red-500/20';
      default: return 'text-white/60 border-white/20';
    }
  };

  const clearFilters = () => {
    setSearchQuery('');
    setPaymentFilter('All');
    setStatusFilter('All');
    setBookingFilter('All');
  };

  // Filtering Logic
  const filteredUsers = users.filter(user => {
    const matchesSearch = 
      user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.phone.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesPayment = paymentFilter === 'All' || 
      user.history.some(h => h.payment.toLowerCase() === paymentFilter.toLowerCase());

    const matchesStatus = statusFilter === 'All' || 
      user.history.some(h => h.status.toLowerCase() === statusFilter.toLowerCase());

    let matchesBooking = true;
    if (bookingFilter === 'Booked') matchesBooking = user.appointmentsCount > 0;
    if (bookingFilter === 'No Bookings') matchesBooking = user.appointmentsCount === 0;

    return matchesSearch && matchesPayment && matchesStatus && matchesBooking;
  });

  return (
    <div className="p-8 md:p-10 w-full max-w-[1400px] mx-auto flex flex-col gap-6 animate-in fade-in duration-500 font-sans">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex flex-col gap-1">
          <h1 className="font-serif text-3xl text-white">Client Management</h1>
          <p className="font-sans text-sm text-white/50">View all registered users and their booking status in one place.</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2.5 rounded border border-white/10 hover:border-[#c79c6e]/50 text-white hover:text-[#c79c6e] font-sans text-xs uppercase tracking-widest transition-colors bg-[#0a0a0a]">
          <Plus size={16} />
          Add New Client
        </button>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-wrap items-center gap-4 bg-[#111] border border-white/5 p-4 rounded-xl relative z-20">
        <div className="relative flex-1 min-w-[250px]">
          <MagnifyingGlass size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40" />
          <input 
            type="text" 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search clients by name, email or phone..."
            className="w-full bg-[#050505] border border-white/10 rounded-lg py-2.5 pl-10 pr-4 text-sm font-sans text-white placeholder-white/30 focus:outline-none focus:border-[#c79c6e]/50 transition-colors"
          />
        </div>
        
        {(searchQuery || paymentFilter !== 'All' || statusFilter !== 'All' || bookingFilter !== 'All') && (
          <button 
            onClick={clearFilters}
            className="text-[#c79c6e] hover:text-white text-xs uppercase tracking-widest font-semibold transition-colors px-2"
          >
            Clear filters
          </button>
        )}

        <div className="h-8 w-px bg-white/10 mx-2 hidden md:block"></div>

        {/* Dropdowns */}
        <div className="flex flex-wrap items-center gap-3">
          
          {/* Payment Filter */}
          <div className="relative">
            <button 
              onClick={() => setActiveDropdown(activeDropdown === 'payment' ? null : 'payment')}
              className="flex items-center gap-2 px-4 py-2 rounded-lg border border-white/10 bg-[#050505] text-white/70 hover:text-white text-xs transition-colors"
            >
              <span className="text-white/40 uppercase tracking-widest text-[0.65rem] mr-2">Payment</span>
              {paymentFilter}
              <CaretDown size={12} className="ml-2" />
            </button>
            {activeDropdown === 'payment' && (
              <div className="absolute top-full left-0 mt-2 w-40 bg-[#050505] border border-white/10 rounded-lg shadow-xl flex flex-col py-1 overflow-hidden z-30">
                {['All', 'Paid', 'Failed'].map(opt => (
                  <button key={opt} onClick={() => { setPaymentFilter(opt); setActiveDropdown(null); }} className="px-4 py-2 text-left text-xs text-white/70 hover:text-white hover:bg-white/5 transition-colors">
                    {opt}
                  </button>
                ))}
              </div>
            )}
          </div>
          
          {/* Status Filter */}
          <div className="relative">
            <button 
              onClick={() => setActiveDropdown(activeDropdown === 'status' ? null : 'status')}
              className="flex items-center gap-2 px-4 py-2 rounded-lg border border-white/10 bg-[#050505] text-white/70 hover:text-white text-xs transition-colors"
            >
              <span className="text-white/40 uppercase tracking-widest text-[0.65rem] mr-2">Session</span>
              {statusFilter}
              <CaretDown size={12} className="ml-2" />
            </button>
            {activeDropdown === 'status' && (
              <div className="absolute top-full left-0 mt-2 w-40 bg-[#050505] border border-white/10 rounded-lg shadow-xl flex flex-col py-1 overflow-hidden z-30">
                {['All', 'Upcoming', 'Today', 'Completed'].map(opt => (
                  <button key={opt} onClick={() => { setStatusFilter(opt); setActiveDropdown(null); }} className="px-4 py-2 text-left text-xs text-white/70 hover:text-white hover:bg-white/5 transition-colors">
                    {opt}
                  </button>
                ))}
              </div>
            )}
          </div>
          
          {/* Booking Filter */}
          <div className="relative">
            <button 
              onClick={() => setActiveDropdown(activeDropdown === 'booking' ? null : 'booking')}
              className="flex items-center gap-2 px-4 py-2 rounded-lg border border-white/10 bg-[#050505] text-white/70 hover:text-white text-xs transition-colors"
            >
              <span className="text-white/40 uppercase tracking-widest text-[0.65rem] mr-2">Booking</span>
              {bookingFilter}
              <CaretDown size={12} className="ml-2" />
            </button>
            {activeDropdown === 'booking' && (
              <div className="absolute top-full left-0 mt-2 w-40 bg-[#050505] border border-white/10 rounded-lg shadow-xl flex flex-col py-1 overflow-hidden z-30">
                {['All', 'Booked', 'No Bookings'].map(opt => (
                  <button key={opt} onClick={() => { setBookingFilter(opt); setActiveDropdown(null); }} className="px-4 py-2 text-left text-xs text-white/70 hover:text-white hover:bg-white/5 transition-colors">
                    {opt}
                  </button>
                ))}
              </div>
            )}
          </div>

        </div>
      </div>

      {/* Users Table */}
      <div className="w-full bg-[#111] border border-white/5 rounded-xl overflow-hidden flex flex-col z-10">
        
        {/* Table Header */}
        <div className="grid grid-cols-[1.5fr_1.5fr_1fr_1fr_0.8fr_1.5fr_80px] gap-4 px-6 py-4 bg-[#1a1a1a] border-b border-white/5 text-white/40 text-[0.65rem] uppercase tracking-widest font-semibold">
          <div>Client Name</div>
          <div>Email Address</div>
          <div>Phone No.</div>
          <div>Joined Date</div>
          <div className="text-center">Appointments</div>
          <div>Next Appointment</div>
          <div className="text-right">Actions</div>
        </div>

        {/* Table Body */}
        <div className="flex flex-col min-h-[300px]">
          {filteredUsers.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-white/30 text-sm gap-2">
              <MagnifyingGlass size={32} />
              <span>No clients match your filters.</span>
            </div>
          ) : (
            filteredUsers.map((user) => (
              <React.Fragment key={user.id}>
                {/* Main Row */}
                <div 
                  className={`grid grid-cols-[1.5fr_1.5fr_1fr_1fr_0.8fr_1.5fr_80px] gap-4 px-6 py-5 border-b border-white/5 items-center transition-colors cursor-pointer group ${expandedUser === user.id ? 'bg-white/[0.02]' : 'hover:bg-white/[0.02]'}`}
                  onClick={() => toggleExpand(user.id)}
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-white/5 border border-white/10 text-[#c79c6e] flex items-center justify-center font-serif text-lg shrink-0">
                      {user.name.charAt(0)}
                    </div>
                    <span className="text-white/90 text-sm font-medium">{user.name}</span>
                  </div>
                  
                  <div className="text-[#c79c6e] text-sm">{user.email}</div>
                  
                  <div className="text-white/70 text-sm">{user.phone}</div>
                  
                  <div className="text-white/70 text-sm">{user.joined}</div>
                  
                  <div className="text-center text-white/90 font-medium text-sm">
                    {user.appointmentsCount}
                  </div>
                  
                  <div className="flex flex-col items-start gap-1">
                    {user.nextAppointmentDate ? (
                      <>
                        <div className="flex flex-col">
                          <span className="text-white/90 text-sm">{user.nextAppointmentDate}</span>
                          <span className="text-white/50 text-xs">{user.nextAppointmentTime}</span>
                        </div>
                        <div className="relative inline-block">
                          {user.history.length > 0 ? (
                            <button 
                              onClick={(e) => {
                                e.stopPropagation();
                                setStatusDropdownOpenId(statusDropdownOpenId === `main-${user.id}` ? null : `main-${user.id}`);
                              }}
                              className={`px-2 py-0.5 rounded-full border text-[0.65rem] uppercase tracking-wider hover:opacity-80 transition-opacity flex items-center gap-1 ${getStatusPillColor(user.nextAppointmentStatus)}`}
                            >
                              {user.nextAppointmentStatus}
                              <CaretDown size={10} />
                            </button>
                          ) : (
                            <span className={`px-2 py-0.5 rounded-full border text-[0.65rem] uppercase tracking-wider ${getStatusPillColor(user.nextAppointmentStatus)}`}>
                              {user.nextAppointmentStatus}
                            </span>
                          )}
                          
                          {statusDropdownOpenId === `main-${user.id}` && (
                            <div className="absolute top-full mt-1 left-0 w-28 bg-[#050505] border border-white/10 rounded-lg shadow-xl flex flex-col py-1 overflow-hidden z-30">
                              {user.nextAppointmentStatus.toUpperCase() !== 'COMPLETED' && (
                                <button 
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    updateAppointmentStatus(user.id, user.history[0].id, 'COMPLETED');
                                  }} 
                                  className="px-3 py-1.5 text-left text-[0.65rem] uppercase tracking-widest text-green-500 hover:bg-white/5 transition-colors"
                                >
                                  Completed
                                </button>
                              )}
                              {user.nextAppointmentStatus.toUpperCase() !== 'UPCOMING' && (
                                <button 
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    updateAppointmentStatus(user.id, user.history[0].id, 'UPCOMING');
                                  }} 
                                  className="px-3 py-1.5 text-left text-[0.65rem] uppercase tracking-widest text-[#c79c6e] hover:bg-white/5 transition-colors"
                                >
                                  Upcoming
                                </button>
                              )}
                            </div>
                          )}
                        </div>
                      </>
                    ) : (
                      <div className="flex flex-col text-white/30 text-sm">
                        <span>—</span>
                        <span className="text-xs">No appointments</span>
                      </div>
                    )}
                  </div>
                  
                  <div className="flex items-center justify-end gap-3 text-white/50">
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        openProfile(user);
                      }}
                      className="hover:text-[#c79c6e] transition-colors p-1" 
                      title="View Profile"
                    >
                      <Eye size={18} />
                    </button>
                    <button className="hover:text-white transition-colors p-1">
                      <CaretDown size={16} className={`transition-transform duration-300 ${expandedUser === user.id ? 'rotate-180' : ''}`} />
                    </button>
                  </div>
                </div>

                {/* Expanded History Row (Animated) */}
                <div className={`grid transition-[grid-template-rows] duration-300 ease-in-out ${expandedUser === user.id ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'}`}>
                  <div className="overflow-hidden">
                    {user.history.length > 0 ? (
                      <div className="bg-[#0a0a0a] border-b border-white/5 px-6 py-6 flex flex-col">
                        <div className="flex items-center gap-2 mb-4 px-2">
                          <span className="text-white/40 text-[0.65rem] uppercase tracking-widest font-semibold">Appointment History</span>
                          <span className="w-1 h-1 rounded-full bg-white/20"></span>
                          <span className="text-white/60 text-[0.65rem] font-medium">{user.history.length}</span>
                        </div>
                        
                        <div className="flex flex-col gap-2 pl-4 border-l border-white/10 ml-2">
                          {user.history.map((session) => (
                            <div key={session.id} className="grid grid-cols-[1fr_2fr_1fr_1.5fr_1fr_100px] gap-4 items-center px-4 py-3 bg-[#111] border border-white/5 rounded-lg hover:border-white/10 transition-colors">
                              
                              <div className="flex items-start gap-3">
                                <CalendarBlank size={16} className="text-white/30 mt-0.5" />
                                <div className="flex flex-col">
                                  <span className="text-white/80 text-sm">{session.date}</span>
                                  <span className="text-white/40 text-xs">{session.time}</span>
                                </div>
                              </div>

                              <div className="text-white/70 text-sm">{session.type}</div>

                              <div className="relative">
                                <button 
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setStatusDropdownOpenId(statusDropdownOpenId === session.id ? null : session.id);
                                  }}
                                  className={`px-2.5 py-1 rounded-full border text-[0.65rem] uppercase tracking-wider hover:opacity-80 transition-opacity flex items-center gap-1 ${getStatusPillColor(session.status)}`}
                                >
                                  {session.status}
                                  <CaretDown size={10} />
                                </button>
                                
                                {statusDropdownOpenId === session.id && (
                                  <div className="absolute top-full mt-1 left-0 w-28 bg-[#050505] border border-white/10 rounded-lg shadow-xl flex flex-col py-1 overflow-hidden z-30">
                                    {session.status.toUpperCase() !== 'COMPLETED' && (
                                      <button 
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          updateAppointmentStatus(user.id, session.id, 'COMPLETED');
                                        }} 
                                        className="px-3 py-1.5 text-left text-[0.65rem] uppercase tracking-widest text-green-500 hover:bg-white/5 transition-colors"
                                      >
                                        Completed
                                      </button>
                                    )}
                                    {session.status.toUpperCase() !== 'UPCOMING' && (
                                      <button 
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          updateAppointmentStatus(user.id, session.id, 'UPCOMING');
                                        }} 
                                        className="px-3 py-1.5 text-left text-[0.65rem] uppercase tracking-widest text-[#c79c6e] hover:bg-white/5 transition-colors"
                                      >
                                        Upcoming
                                      </button>
                                    )}
                                  </div>
                                )}
                              </div>

                              <div className="flex flex-col gap-0.5">
                                <span className="text-white/40 text-[0.6rem] uppercase tracking-wider">Transaction ID</span>
                                <span className="text-white/80 text-xs font-mono">{session.txnId}</span>
                              </div>

                              <div>
                                <span className={`px-2 py-0.5 rounded border text-[0.65rem] uppercase tracking-wider ${getPaymentPillColor(session.payment)}`}>
                                  {session.payment}
                                </span>
                              </div>

                              <div className="text-right">
                                <button 
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    openSessionDetails(user, session);
                                  }}
                                  className="text-[#c79c6e] hover:text-white text-xs flex items-center justify-end gap-1 transition-colors group ml-auto"
                                >
                                  View Details
                                  <CaretRight size={12} className="group-hover:translate-x-0.5 transition-transform" />
                                </button>
                              </div>
                              
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <div className="bg-[#0a0a0a] border-b border-white/5 px-6 py-8 flex items-center justify-center text-white/30 text-sm">
                        No appointment history found for this client.
                      </div>
                    )}
                  </div>
                </div>
              </React.Fragment>
            ))
          )}
        </div>

        {/* Pagination Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-white/5 bg-[#111]">
          <span className="text-white/40 text-sm">Showing 1 to {Math.min(filteredUsers.length, 5)} of {filteredUsers.length} clients</span>
          
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <button className="p-1 text-white/30 hover:text-white transition-colors">
                <CaretLeft size={16} />
              </button>
              <div className="flex items-center gap-1">
                <button className="w-7 h-7 rounded border border-[#c79c6e] text-[#c79c6e] flex items-center justify-center text-xs font-medium">1</button>
              </div>
              <button className="p-1 text-white/60 hover:text-white transition-colors">
                <CaretRight size={16} />
              </button>
            </div>
          </div>
        </div>

      </div>

      {/* Profile/Session Sidebar Overlay */}
      <div 
        className={`fixed inset-0 bg-black/60 backdrop-blur-sm z-40 transition-opacity duration-300 ${
          isSidebarOpen ? 'opacity-100 visible' : 'opacity-0 invisible'
        }`}
        onClick={closeProfile}
      />

      {/* Profile/Session Sidebar Panel */}
      <div 
        className={`fixed right-0 top-0 h-screen w-full md:w-[450px] bg-[#0a0a0a] border-l border-white/10 z-50 transform transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] overflow-y-auto ${
          isSidebarOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {selectedUser && (
          <div className="flex flex-col h-full">
            {/* Sidebar Header */}
            <div className="p-6 border-b border-white/5 flex items-center justify-between sticky top-0 bg-[#0a0a0a]/95 backdrop-blur z-10">
              <h2 className="font-serif text-xl text-white">
                {selectedSession ? 'Session Details' : 'Client Profile'}
              </h2>
              <button 
                onClick={closeProfile}
                className="p-2 rounded-full hover:bg-white/10 text-white/50 hover:text-white transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {/* Sidebar Content */}
            <div className="p-8 flex flex-col gap-8">
              
              {/* Identity Section */}
              <div className="flex items-center gap-5">
                <div className="w-16 h-16 rounded-full bg-[#c79c6e]/20 text-[#c79c6e] flex items-center justify-center font-serif text-2xl shrink-0">
                  {selectedUser.name.charAt(0)}
                </div>
                <div className="flex flex-col gap-1">
                  <span className="font-sans text-xl text-white font-medium">{selectedUser.name}</span>
                  <span className="font-sans text-sm text-white/50">{selectedUser.email}</span>
                  {!selectedSession && (
                    <div className="flex items-center gap-1.5 text-white/40 mt-1">
                      <Phone size={14} />
                      <span className="font-sans text-xs">{selectedUser.phone}</span>
                    </div>
                  )}
                </div>
              </div>

              {selectedSession ? (
                /* Session Specific Details */
                <div className="flex flex-col gap-6 animate-in fade-in slide-in-from-right-4 duration-300">
                  {/* Session Info Grid */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-[#111] border border-white/5 p-4 rounded-xl flex flex-col gap-2">
                      <div className="flex items-center gap-2 text-white/40">
                        <Clock size={16} />
                        <span className="text-[0.65rem] uppercase tracking-widest">Date & Time</span>
                      </div>
                      <span className="text-white text-sm font-medium">{selectedSession.date}</span>
                      <span className="text-white/60 text-xs">{selectedSession.time}</span>
                    </div>
                    <div className="bg-[#111] border border-white/5 p-4 rounded-xl flex flex-col gap-2">
                      <div className="flex items-center gap-2 text-white/40">
                        <CurrencyCircleDollar size={16} />
                        <span className="text-[0.65rem] uppercase tracking-widest">Payment</span>
                      </div>
                      <span className={`text-sm font-medium ${selectedSession.payment === 'Paid' ? 'text-green-500' : 'text-red-500'}`}>
                        {selectedSession.payment}
                      </span>
                      <span className="text-white/40 text-[0.65rem] font-mono">{selectedSession.txnId}</span>
                    </div>
                  </div>

                  {/* Reschedule Request */}
                  {selectedSession.rescheduleRequest && (
                    <div className="flex flex-col gap-3">
                      <div className="flex items-center gap-2 text-amber-500 border-b border-white/5 pb-2">
                        <CalendarBlank size={18} />
                        <h3 className="font-sans text-sm font-medium uppercase tracking-widest">Reschedule Request</h3>
                      </div>
                      <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-5 flex flex-col gap-4">
                        <div className="flex flex-col gap-1">
                          <span className="text-amber-500/60 text-[0.65rem] uppercase tracking-widest font-semibold">Requested New Time</span>
                          <span className="text-amber-500 font-medium text-sm">
                            {selectedSession.rescheduleRequest.requestedDate} at {selectedSession.rescheduleRequest.requestedTime}
                          </span>
                        </div>
                        <div className="flex flex-col gap-1">
                          <span className="text-amber-500/60 text-[0.65rem] uppercase tracking-widest font-semibold">Client's Reason</span>
                          <span className="text-amber-500/90 text-sm italic">
                            "{selectedSession.rescheduleRequest.reason}"
                          </span>
                        </div>
                        <div className="flex items-center gap-2 mt-2">
                          <button className="flex-1 py-2 rounded bg-amber-500 text-black font-semibold text-xs uppercase tracking-widest hover:bg-amber-400 transition-colors">
                            Accept
                          </button>
                          <button className="flex-1 py-2 rounded border border-amber-500/30 text-amber-500 font-semibold text-xs uppercase tracking-widest hover:bg-amber-500/10 transition-colors">
                            Decline
                          </button>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Before We Speak Note */}
                  <div className="flex flex-col gap-3">
                    <div className="flex items-center gap-2 text-[#c79c6e] border-b border-white/5 pb-2">
                      <User size={18} />
                      <h3 className="font-sans text-sm font-medium uppercase tracking-widest">Client's Note</h3>
                    </div>
                    <div className="bg-[#111] border border-white/5 rounded-xl p-5 text-white/80 font-sans text-sm leading-relaxed">
                      {selectedSession.beforeWeSpeak ? (
                        <p className="italic text-white/70">"{selectedSession.beforeWeSpeak}"</p>
                      ) : (
                        <p className="text-white/30 italic">No notes provided for this session.</p>
                      )}
                    </div>
                  </div>

                  {/* Coach's Session Notes */}
                  <div className="flex flex-col gap-3">
                    <div className="flex items-center gap-2 text-[#c79c6e] border-b border-white/5 pb-2">
                      <FileText size={18} />
                      <h3 className="font-sans text-sm font-medium uppercase tracking-widest">Coach's Session Notes</h3>
                    </div>
                    <textarea 
                      className="w-full h-40 bg-[#111] border border-white/5 rounded-xl p-4 text-white/80 font-sans text-sm resize-none focus:outline-none focus:border-[#c79c6e]/50 transition-colors placeholder-white/20"
                      placeholder="Write your private notes about this specific session here..."
                      defaultValue=""
                    />
                    <button className="self-end px-4 py-2 mt-2 rounded bg-white/5 text-white hover:bg-white/10 font-sans text-xs uppercase tracking-widest transition-colors">
                      Save Session Notes
                    </button>
                  </div>
                </div>
              ) : (
                /* General Profile Details */
                <div className="flex flex-col gap-8 animate-in fade-in slide-in-from-left-4 duration-300">
                  {/* Status Cards */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-[#111] border border-white/5 p-4 rounded-xl flex flex-col gap-2">
                      <div className="flex items-center gap-2 text-white/40">
                        <User size={16} />
                        <span className="text-[0.65rem] uppercase tracking-widest">Member Since</span>
                      </div>
                      <span className="text-white text-sm font-medium">{selectedUser.joined}</span>
                    </div>
                    <div className="bg-[#111] border border-white/5 p-4 rounded-xl flex flex-col gap-2">
                      <div className="flex items-center gap-2 text-white/40">
                        <CalendarBlank size={16} />
                        <span className="text-[0.65rem] uppercase tracking-widest">Next Booking</span>
                      </div>
                      <span className={`text-sm font-medium ${selectedUser.appointmentsCount > 0 ? 'text-[#c79c6e]' : 'text-white'}`}>
                        {selectedUser.appointmentsCount > 0 ? selectedUser.nextAppointmentDate : 'None scheduled'}
                      </span>
                    </div>
                  </div>

                  {/* Coach's Private Notes */}
                  <div className="flex flex-col gap-3">
                    <div className="flex items-center gap-2 text-[#c79c6e] border-b border-white/5 pb-2">
                      <FileText size={18} />
                      <h3 className="font-sans text-sm font-medium uppercase tracking-widest">Coach's General Notes</h3>
                    </div>
                    <textarea 
                      className="w-full h-40 bg-[#111] border border-white/5 rounded-xl p-4 text-white/80 font-sans text-sm resize-none focus:outline-none focus:border-[#c79c6e]/50 transition-colors placeholder-white/20"
                      placeholder="Write your general private notes about this client here... These are only visible to you."
                      defaultValue={selectedUser.notes || ''}
                    />
                    <button className="self-end px-4 py-2 mt-2 rounded bg-white/5 text-white hover:bg-white/10 font-sans text-xs uppercase tracking-widest transition-colors">
                      Save Notes
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

    </div>
  );
}
