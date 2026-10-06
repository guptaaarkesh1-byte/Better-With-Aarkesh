import React, { useState } from 'react';
import { useToast } from '../context/ToastContext';
import { API_URL } from '../utils/apiUrl';
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
  CurrencyCircleDollar,
  GraduationCap,
  Megaphone,
  Question,
  CheckCircle,
  Sparkle,
  WarningCircle,
  ShieldCheck,
  ArrowCounterClockwise,
  Receipt,
  Info
} from '@phosphor-icons/react';

const formatSource = (src) => {
  if (!src) return '';
  const lower = src.toLowerCase();
  if (lower === 'social') return 'Social Media';
  if (lower === 'referral') return 'Referral';
  if (lower === 'search') return 'Search Engine';
  if (lower === 'other') return 'Other';
  return src;
};

const formatTimeRange = (timeStr, duration = 60) => {
  if (!timeStr) return '';
  if (timeStr.includes('–') || timeStr.includes(' - ') || timeStr.includes(' to ')) {
    return timeStr;
  }

  const match = timeStr.match(/(\d+):?(\d*)\s*(AM|PM)?/i);
  if (!match) return timeStr;

  let [_, hoursStr, minutesStr, ampmStr] = match;
  let hours = parseInt(hoursStr, 10);
  let minutes = minutesStr ? parseInt(minutesStr, 10) : 0;
  let ampm = ampmStr ? ampmStr.toUpperCase() : 'AM';

  let totalMinutes = (hours % 12 + (ampm === 'PM' ? 12 : 0)) * 60 + minutes;
  let endTotalMinutes = totalMinutes + (parseInt(duration, 10) || 60);

  let endHours = Math.floor((endTotalMinutes / 60) % 24);
  let endMinutes = endTotalMinutes % 60;
  let endAmpm = endHours >= 12 ? 'PM' : 'AM';
  let endDisplayHours = endHours % 12 === 0 ? 12 : endHours % 12;

  const formattedStartTime = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')} ${ampm}`;
  const formattedEndTime = `${endDisplayHours.toString().padStart(2, '0')}:${endMinutes.toString().padStart(2, '0')} ${endAmpm}`;

  return `${formattedStartTime} – ${formattedEndTime}`;
};

const formatDisplayDate = (dateVal) => {
  if (!dateVal) return '—';
  try {
    const str = String(dateVal).trim();
    
    // Case 1: Format "YYYY-MM-DD" e.g. "2026-10-08" or "2026-10-1"
    const ymdMatch = str.match(/^(\d{4})-(\d{1,2})-(\d{1,2})$/);
    if (ymdMatch) {
      const year = parseInt(ymdMatch[1], 10);
      const month = parseInt(ymdMatch[2], 10) - 1;
      const day = parseInt(ymdMatch[3], 10);
      const d = new Date(year, month, day);
      if (!isNaN(d.getTime())) {
        const weekday = d.toLocaleDateString('en-US', { weekday: 'long' });
        const monthName = d.toLocaleDateString('en-US', { month: 'short' });
        return `${weekday}, ${day} ${monthName} ${year}`;
      }
    }

    // Case 2: Parse standard date formats (like "Thursday, October 1, 2026" or ISO)
    const d = new Date(str);
    if (!isNaN(d.getTime())) {
      const weekday = d.toLocaleDateString('en-US', { weekday: 'long' });
      const day = d.getDate();
      const monthName = d.toLocaleDateString('en-US', { month: 'short' });
      const year = d.getFullYear();
      return `${weekday}, ${day} ${monthName} ${year}`;
    }
  } catch (e) {
    console.error('Error in formatDisplayDate:', e);
  }
  return dateVal;
};

export default function AdminUsers() {
  const { showSuccess, showError, showInfo } = useToast();
  const [expandedUser, setExpandedUser] = useState(() => {
    const saved = sessionStorage.getItem('admin_users_expanded');
    return saved ? parseInt(saved, 10) : 1;
  }); // Default expand first user
  
  const [activeTab, setActiveTab] = useState('appointments');
  const [feeSettings, setFeeSettings] = useState({ fee60min: 5000, fee90min: 7500 });
  const [isSavingFees, setIsSavingFees] = useState(false);
  const [feeMessage, setFeeMessage] = useState('');
  
  // Sidebar State
  const [isSidebarOpen, setIsSidebarOpen] = useState(() => {
    return sessionStorage.getItem('admin_users_sidebar_open') === 'true';
  });
  const [selectedUser, setSelectedUser] = useState(() => {
    const saved = sessionStorage.getItem('admin_users_selected_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [selectedSession, setSelectedSession] = useState(() => {
    const saved = sessionStorage.getItem('admin_users_selected_session');
    return saved ? JSON.parse(saved) : null;
  });

  // Coach Session Notes State
  const [sessionNotesText, setSessionNotesText] = useState(() => {
    const saved = sessionStorage.getItem('admin_users_selected_session');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        return parsed.coachNotes || '';
      } catch (e) {}
    }
    return '';
  });
  const [isSavingNotes, setIsSavingNotes] = useState(false);
  const [notesSuccessMessage, setNotesSuccessMessage] = useState(false);

  // Persist states
  React.useEffect(() => {
    sessionStorage.setItem('admin_users_expanded', expandedUser);
    sessionStorage.setItem('admin_users_sidebar_open', isSidebarOpen);
    if (selectedUser) sessionStorage.setItem('admin_users_selected_user', JSON.stringify(selectedUser));
    else sessionStorage.removeItem('admin_users_selected_user');
    if (selectedSession) sessionStorage.setItem('admin_users_selected_session', JSON.stringify(selectedSession));
    else sessionStorage.removeItem('admin_users_selected_session');
  }, [expandedUser, isSidebarOpen, selectedUser, selectedSession]);

  const openProfile = (user) => {
    setSelectedSession(null);
    setSelectedUser(user);
    setSessionNotesText('');
    setNotesSuccessMessage(false);
    setIsSidebarOpen(true);
  };

  const openSessionDetails = (user, session) => {
    setSelectedUser(user);
    setSelectedSession(session);
    setSessionNotesText(session.coachNotes || '');
    setNotesSuccessMessage(false);
    setIsSidebarOpen(true);
  };

  const handleSaveSessionNotes = async () => {
    if (!selectedSession || !selectedSession.id) return;
    setIsSavingNotes(true);
    try {
      const token = localStorage.getItem('adminToken');
      const apiUrl = API_URL;
      const res = await fetch(`${apiUrl}/api/appointments/admin/${selectedSession.id}/notes`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ notes: sessionNotesText })
      });

      if (res.ok) {
        const updated = await res.json();
        showSuccess('Session notes saved successfully!');
        setNotesSuccessMessage(true);
        setTimeout(() => setNotesSuccessMessage(false), 3000);

        // Update selectedSession in state and storage
        const updatedSession = { ...selectedSession, coachNotes: sessionNotesText };
        setSelectedSession(updatedSession);
        sessionStorage.setItem('admin_users_selected_session', JSON.stringify(updatedSession));

        // Update users state
        setUsers(prevUsers => prevUsers.map(u => {
          if (u.id === selectedUser.id) {
            const updatedHistory = u.history.map(s => s.id === selectedSession.id ? { ...s, coachNotes: sessionNotesText } : s);
            return { ...u, history: updatedHistory };
          }
          return u;
        }));
      } else {
        showError('Failed to save session notes');
      }
    } catch (err) {
      console.error('Save session notes error:', err);
      showError('An error occurred while saving notes.');
    } finally {
      setIsSavingNotes(false);
    }
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
  const [accountFilter, setAccountFilter] = useState('All');
  const [rescheduleFilter, setRescheduleFilter] = useState('All');

  // Dropdown UI states
  const [activeDropdown, setActiveDropdown] = useState(null);

  // Mock data with appointment history & payment details
  const mockUsers = [];

  const [users, setUsers] = useState(mockUsers);
  const [statusDropdownOpenId, setStatusDropdownOpenId] = useState(null);

  const updateAppointmentStatus = async (userId, sessionId, newStatus) => {
    try {
      const token = localStorage.getItem('adminToken');
      const apiUrl = API_URL;
      
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
          showError('Failed to update status on the server.');
          return;
        } else {
          showSuccess(`Appointment status changed to ${newStatus}`);
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
      showError('An error occurred while communicating with the server.');
    } finally {
      setStatusDropdownOpenId(null);
    }
  };

  const [isProcessingReschedule, setIsProcessingReschedule] = useState(false);

  const handleRescheduleAction = async (userId, sessionId, action) => {
    const targetSessionId = sessionId || selectedSession?._id || selectedSession?.id;
    if (!targetSessionId) {
      showError('Session ID is missing');
      return;
    }

    setIsProcessingReschedule(true);
    try {
      const token = localStorage.getItem('adminToken');
      const apiUrl = API_URL;
      
      const endpoint = action === 'approve' ? 'approve-reschedule' : 'reject-reschedule';
      
      const res = await fetch(`${apiUrl}/api/appointments/admin/${targetSessionId}/${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.message || 'Failed to perform action');
      }

      const updatedAppointment = await res.json();
      const newStatus = action === 'approve' ? 'APPROVED' : 'REJECTED';
      
      // Immediately update selectedSession in UI
      setSelectedSession(prev => {
        if (!prev) return prev;
        const updated = {
          ...prev,
          date: action === 'approve' ? (updatedAppointment.date || prev.rescheduleRequest?.date || prev.date) : prev.date,
          time: action === 'approve' ? (updatedAppointment.time || prev.rescheduleRequest?.time || prev.time) : prev.time,
          rescheduleRequest: {
            ...(prev.rescheduleRequest || {}),
            status: newStatus
          }
        };
        sessionStorage.setItem('admin_users_selected_session', JSON.stringify(updated));
        return updated;
      });

      // Update user in users list state
      setUsers(prevUsers => prevUsers.map(user => {
        const isTargetUser = (user.id === userId || user._id === userId || (selectedUser && (user.id === selectedUser.id || user._id === selectedUser._id)));
        if (isTargetUser) {
          const updatedHistory = (user.history || []).map(session => {
            const isMatch = (session.id === targetSessionId || session._id === targetSessionId || session.id === sessionId || session._id === sessionId);
            if (isMatch) {
              return { 
                ...session, 
                date: action === 'approve' ? (updatedAppointment.date || session.rescheduleRequest?.date || session.date) : session.date,
                time: action === 'approve' ? (updatedAppointment.time || session.rescheduleRequest?.time || session.time) : session.time,
                rescheduleRequest: {
                  ...(session.rescheduleRequest || {}),
                  status: newStatus
                }
              };
            }
            return session;
          });
          return { ...user, history: updatedHistory };
        }
        return user;
      }));

      showSuccess(`Reschedule request ${action === 'approve' ? 'approved' : 'declined'} successfully!`);
    } catch (err) {
      console.error('handleRescheduleAction error:', err);
      showError(`Failed to ${action} reschedule request: ${err.message}`);
    } finally {
      setIsProcessingReschedule(false);
    }
  };

  // 48-Hour Reschedule Window Calculator
  const get48HoursNoticeInfo = (date, time) => {
    if (!date || !time) return null;
    try {
      const scheduled = new Date(`${date} ${time} GMT+0530`);
      if (isNaN(scheduled.getTime())) return null;
      const now = new Date();
      const diffMs = scheduled - now;
      const diffHours = Math.round(diffMs / (1000 * 60 * 60));
      
      if (diffMs <= 0) {
        return {
          status: 'PAST',
          hours: Math.abs(diffHours),
          badgeText: 'Past Session',
          badgeClass: 'bg-zinc-800/80 text-zinc-400 border-zinc-700/60',
          isSafe: false,
          isLate: false,
        };
      }
      if (diffHours >= 48) {
        return {
          status: 'SAFE',
          hours: diffHours,
          badgeText: `> 48h Safe (${diffHours}h left)`,
          badgeSub: 'Free Reschedule Eligible',
          badgeClass: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
          isSafe: true,
          isLate: false,
        };
      }
      return {
        status: 'LATE',
        hours: diffHours,
        badgeText: `< 48h Window (${diffHours}h left)`,
        badgeSub: 'Late / Locked Window',
        badgeClass: 'bg-rose-500/15 text-rose-400 border-rose-500/30',
        isSafe: false,
        isLate: true,
      };
    } catch {
      return null;
    }
  };

  // Refund Modal State & Actions
  const [refundModalSession, setRefundModalSession] = useState(null);
  const [refundReason, setRefundReason] = useState('');
  const [refundAmount, setRefundAmount] = useState('');
  const [isRefunding, setIsRefunding] = useState(false);

  const openRefundModal = (session, user) => {
    const defaultAmt = session.amount !== undefined && session.amount !== null 
      ? session.amount 
      : (session.duration === 90 ? feeSettings.fee90min : feeSettings.fee60min);

    setRefundModalSession({
      ...session,
      userId: user.id,
      userName: user.name,
      userEmail: user.email,
      defaultAmount: defaultAmt
    });
    setRefundReason('Client Emergency / Cancellation Request');
    setRefundAmount(defaultAmt);
  };

  const handleIssueRefund = async () => {
    if (!refundModalSession) return;
    setIsRefunding(true);
    try {
      const token = localStorage.getItem('adminToken');
      const apiUrl = API_URL;
      const res = await fetch(`${apiUrl}/api/appointments/admin/${refundModalSession.id}/issue-refund`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ 
          reason: refundReason || 'Admin issued emergency refund',
          refundAmount: refundAmount !== '' ? Number(refundAmount) : refundModalSession.defaultAmount
        })
      });

      if (!res.ok) {
        throw new Error('Failed to issue refund');
      }

      const data = await res.json();
      const refundedAmt = data.appointment?.refundAmount !== undefined ? data.appointment.refundAmount : refundAmount;
      showSuccess(`Refund of ₹${Number(refundedAmt).toLocaleString('en-IN')} processed successfully!`);

      // Update local state
      setUsers(prevUsers => prevUsers.map(u => {
        if (u.id === refundModalSession.userId) {
          const updatedHistory = u.history.map(s => 
            s.id === refundModalSession.id 
              ? { 
                  ...s, 
                  status: 'REFUNDED', 
                  payment: 'Refunded', 
                  refundStatus: 'REFUNDED', 
                  refundReason: data.appointment?.refundReason || refundReason, 
                  refundAmount: refundedAmt,
                  refundedAt: data.appointment?.refundedAt || new Date()
                } 
              : s
          );
          return { ...u, history: updatedHistory };
        }
        return u;
      }));

      if (selectedSession && selectedSession.id === refundModalSession.id) {
        setSelectedSession(prev => ({
          ...prev,
          status: 'REFUNDED',
          payment: 'Refunded',
          refundStatus: 'REFUNDED',
          refundReason: data.appointment?.refundReason || refundReason,
          refundAmount: refundedAmt,
          refundedAt: data.appointment?.refundedAt || new Date()
        }));
      }

      setRefundModalSession(null);
      setRefundReason('');
      setRefundAmount('');
    } catch (err) {
      console.error('Refund error:', err);
      showError('Failed to process refund.');
    } finally {
      setIsRefunding(false);
    }
  };

  // Fetch real appointments on load
  React.useEffect(() => {
    const fetchRealData = async () => {
      try {
        const token = localStorage.getItem('adminToken');
        const apiUrl = API_URL;
        const res = await fetch(`${apiUrl}/api/appointments/admin`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        
        if (res.ok) {
          const appointments = await res.json();
          // Group by user
          const userMap = {};
          
          appointments.forEach(app => {
            const uId = (app.userId && app.userId._id) ? app.userId._id : 'guest_' + app._id;
            const isFreeSession = !!app.isFreeSession || app.orderId === 'COURSE_FREE_SESSION';
            const isCourseMember = !!app.isCourseMember || isFreeSession;
            const isUserDeleted = !!app.isUserDeleted || (app.userId && !!app.userId.isDeleted);
            const userDeletedAt = app.userDeletedAt || (app.userId ? app.userId.deletedAt : null);

            if (!userMap[uId]) {
              userMap[uId] = {
                id: uId,
                name: (app.userId && (app.userId.fullName || app.userId.name)) ? (app.userId.fullName || app.userId.name) : app.name || 'Unknown User',
                email: (app.userId && app.userId.email) ? app.userId.email : app.email || 'No Email',
                phone: (app.userId && (app.userId.phoneNumber || app.userId.phone)) ? (app.userId.phoneNumber || app.userId.phone) : '+1 000-0000',
                joined: new Date((app.userId && app.userId.createdAt) ? app.userId.createdAt : Date.now()).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
                appointmentsCount: 0,
                nextAppointmentDate: null,
                nextAppointmentTime: null,
                nextAppointmentStatus: null,
                isCourseMember: isCourseMember,
                isDeleted: isUserDeleted,
                deletedAt: userDeletedAt,
                source: app.source || '',
                history: []
              };
            } else {
              if (isUserDeleted) {
                userMap[uId].isDeleted = true;
                userMap[uId].deletedAt = userDeletedAt;
              }
              if (isCourseMember) {
                userMap[uId].isCourseMember = true;
              }
              if (!userMap[uId].source && app.source) {
                userMap[uId].source = app.source;
              }
            }
            
            // Format appointment
            const appDateObj = new Date(app.date);
            const today = new Date();
            const isToday = appDateObj.getDate() === today.getDate() &&
                            appDateObj.getMonth() === today.getMonth() &&
                            appDateObj.getFullYear() === today.getFullYear();
            
            let calculatedStatus = app.status || 'Upcoming';
            if (calculatedStatus.toLowerCase() !== 'completed' && calculatedStatus.toLowerCase() !== 'refunded' && isToday) {
              calculatedStatus = 'Today';
            }

            const isRefunded = app.status === 'REFUNDED' || app.refundStatus === 'REFUNDED';

            userMap[uId].history.push({
              id: app._id,
              date: app.date,
              time: app.time,
              type: isFreeSession ? '🎓 Course Complimentary Session' : (app.type || 'Life Coaching Session'),
              status: calculatedStatus,
              txnId: isFreeSession ? 'COURSE_FREE_SESSION' : (app.orderId || 'TXN-PENDING'),
              paymentId: app.paymentId || '',
              orderId: app.orderId || '',
              payment: isRefunded ? 'Refunded' : (isFreeSession ? 'Free' : (app.paymentId ? 'Paid' : (app.paymentStatus || 'Failed'))),
              beforeWeSpeak: app.reason || '',
              reason: app.reason || '',
              extra: app.extra || '',
              source: app.source || '',
              duration: app.duration || (app.isFirstSession ? 60 : 90),
              rescheduleRequest: app.rescheduleRequest || null,
              isFreeSession: isFreeSession,
              isCourseMember: isCourseMember,
              amount: app.amount,
              refundStatus: app.refundStatus || 'NONE',
              refundAmount: app.refundAmount || 0,
              refundReason: app.refundReason || '',
              refundedAt: app.refundedAt || null,
              coachNotes: app.coachNotes || '',
              questionnaireAnswers: app.questionnaireAnswers || null
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

  React.useEffect(() => {
    const fetchFees = async () => {
      try {
        const apiUrl = API_URL;
        const res = await fetch(`${apiUrl}/api/payment/fees`);
        if (res.ok) {
          const data = await res.json();
          setFeeSettings({ 
            fee60min: data.fee60min || 5000, 
            fee90min: data.fee90min || 7500 
          });
        }
      } catch (err) {
        console.error('Failed to fetch fees:', err);
      }
    };
    fetchFees();
  }, []);

  const handleSaveFees = async (e) => {
    e.preventDefault();
    setIsSavingFees(true);
    setFeeMessage('');
    try {
      const token = localStorage.getItem('adminToken');
      const apiUrl = API_URL;
      const res = await fetch(`${apiUrl}/api/payment/fees`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(feeSettings)
      });
      if (res.ok) {
        showSuccess('Booking fee configuration saved successfully!');
        setFeeMessage('Fees updated successfully!');
        setTimeout(() => setFeeMessage(''), 3000);
      } else {
        showError('Failed to update fees.');
        setFeeMessage('Failed to update fees.');
      }
    } catch (err) {
      console.error(err);
      showError('Error communicating with server.');
      setFeeMessage('Error communicating with server.');
    } finally {
      setIsSavingFees(false);
    }
  };

  const toggleExpand = (userId) => {
    setExpandedUser(expandedUser === userId ? null : userId);
  };

  const getStatusPillColor = (status) => {
    switch(status.toLowerCase()) {
      case 'upcoming': return 'text-[#c79c6e] border-[#c79c6e]/40';
      case 'completed': return 'text-green-500 border-green-500/40';
      case 'cancelled': return 'text-red-500 border-red-500/40';
      case 'refunded': return 'text-purple-400 border-purple-500/40 bg-purple-500/10';
      case 'today': return 'text-blue-400 border-blue-400/40';
      default: return 'text-white/60 border-white/20';
    }
  };

  const getPaymentPillColor = (payment) => {
    switch(payment.toLowerCase()) {
      case 'paid': return 'text-green-500 bg-green-500/10 border-green-500/20';
      case 'free': 
      case 'complimentary': return 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30 font-semibold';
      case 'failed': return 'text-red-500 bg-red-500/10 border-red-500/20';
      case 'pending': return 'text-yellow-500 bg-yellow-500/10 border-yellow-500/20';
      case 'refunded': return 'text-purple-400 bg-purple-500/10 border-purple-500/30 font-semibold';
      default: return 'text-white/60 border-white/20';
    }
  };

  const clearFilters = () => {
    setSearchQuery('');
    setPaymentFilter('All');
    setStatusFilter('All');
    setBookingFilter('All');
    setAccountFilter('All');
    setRescheduleFilter('All');
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

    let matchesAccount = true;
    if (accountFilter === 'Active') matchesAccount = !user.isDeleted;
    if (accountFilter === 'Deleted') matchesAccount = !!user.isDeleted;

    let matchesReschedule = true;
    if (rescheduleFilter === 'Has Reschedule') {
      matchesReschedule = user.history.some(h => !!h.rescheduleRequest);
    } else if (rescheduleFilter === 'Paid Reschedule') {
      matchesReschedule = user.history.some(h => h.rescheduleRequest?.rescheduleFeePaid);
    } else if (rescheduleFilter === 'Pending Reschedule') {
      matchesReschedule = user.history.some(h => h.rescheduleRequest?.status === 'PENDING');
    } else if (rescheduleFilter === 'Approved Reschedule') {
      matchesReschedule = user.history.some(h => h.rescheduleRequest?.status === 'APPROVED');
    } else if (rescheduleFilter === 'Rejected Reschedule') {
      matchesReschedule = user.history.some(h => h.rescheduleRequest?.status === 'REJECTED');
    } else if (rescheduleFilter === '< 48h Late') {
      matchesReschedule = user.history.some(h => h.rescheduleRequest?.isWithin48Hours);
    } else if (rescheduleFilter === '> 48h Safe') {
      matchesReschedule = user.history.some(h => h.rescheduleRequest && !h.rescheduleRequest.isWithin48Hours);
    }

    return matchesSearch && matchesPayment && matchesStatus && matchesBooking && matchesAccount && matchesReschedule;
  });

  return (
    <div className="p-8 md:p-10 w-full max-w-[1400px] mx-auto flex flex-col gap-6 animate-in fade-in duration-500 font-sans">
      
      {/* Header & Tabs */}
      <div className="flex flex-col gap-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="flex flex-col gap-1">
            <h1 className="font-serif text-3xl text-white">Appointments & Fees</h1>
            <p className="font-sans text-sm text-white/50">Manage your client sessions and update your pricing structure.</p>
          </div>
        </div>
        
        {/* Tab Navigation */}
        <div className="flex items-center gap-6 border-b border-white/10 pb-px">
          <button 
            onClick={() => setActiveTab('appointments')}
            className={`pb-3 font-sans text-xs uppercase tracking-widest transition-colors relative ${activeTab === 'appointments' ? 'text-[#c79c6e] font-semibold' : 'text-white/50 hover:text-white'}`}
          >
            Client Appointments
            {activeTab === 'appointments' && <div className="absolute bottom-0 left-0 w-full h-[2px] bg-[#c79c6e]" />}
          </button>
          <button 
            onClick={() => setActiveTab('fees')}
            className={`pb-3 font-sans text-xs uppercase tracking-widest transition-colors relative ${activeTab === 'fees' ? 'text-[#c79c6e] font-semibold' : 'text-white/50 hover:text-white'}`}
          >
            Fee Settings
            {activeTab === 'fees' && <div className="absolute bottom-0 left-0 w-full h-[2px] bg-[#c79c6e]" />}
          </button>
        </div>
      </div>

      {activeTab === 'fees' ? (
        <div className="w-full max-w-2xl bg-[#111] border border-white/5 rounded-xl p-8 mt-4">
          <div className="flex flex-col gap-2 mb-8">
            <h2 className="font-serif text-2xl text-white">Session Pricing</h2>
            <p className="font-sans text-sm text-white/50">Update the fees for your coaching sessions. These will be automatically reflected during checkout via Razorpay.</p>
          </div>
          
          <form onSubmit={handleSaveFees} className="flex flex-col gap-6">
            <div className="flex flex-col gap-2">
              <label className="font-sans text-xs uppercase tracking-widest text-white/60">First Session (60 mins) - ₹</label>
              <input 
                type="number"
                value={feeSettings.fee60min}
                onChange={e => setFeeSettings({...feeSettings, fee60min: e.target.value === '' ? '' : parseInt(e.target.value)})}
                className="w-full bg-[#050505] border border-white/10 rounded-lg px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:border-[#c79c6e]/50 transition-colors font-mono"
                required
              />
            </div>
            
            <div className="flex flex-col gap-2">
              <label className="font-sans text-xs uppercase tracking-widest text-white/60">Returning Session (90 mins) - ₹</label>
              <input 
                type="number"
                value={feeSettings.fee90min}
                onChange={e => setFeeSettings({...feeSettings, fee90min: e.target.value === '' ? '' : parseInt(e.target.value)})}
                className="w-full bg-[#050505] border border-white/10 rounded-lg px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:border-[#c79c6e]/50 transition-colors font-mono"
                required
              />
            </div>
            
            {feeMessage && (
              <div className={`p-4 rounded-lg border font-sans text-sm ${feeMessage.includes('success') ? 'bg-green-500/10 border-green-500/20 text-green-500' : 'bg-red-500/10 border-red-500/20 text-red-500'}`}>
                {feeMessage}
              </div>
            )}
            
            <button 
              type="submit"
              disabled={isSavingFees}
              className="mt-4 px-6 py-3 rounded-lg bg-[#c79c6e] text-black font-sans text-sm font-semibold tracking-wide hover:bg-white transition-all disabled:opacity-50"
            >
              {isSavingFees ? 'SAVING...' : 'SAVE PRICING'}
            </button>
          </form>
        </div>
      ) : (
        <>
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
        
        {(searchQuery || paymentFilter !== 'All' || statusFilter !== 'All' || bookingFilter !== 'All' || accountFilter !== 'All' || rescheduleFilter !== 'All') && (
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
          
          {/* Reschedule Filter */}
          <div className="relative">
            <button 
              onClick={() => setActiveDropdown(activeDropdown === 'reschedule' ? null : 'reschedule')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg border text-xs transition-colors ${
                rescheduleFilter !== 'All' 
                  ? 'border-amber-500/50 bg-amber-500/10 text-amber-300 font-semibold' 
                  : 'border-white/10 bg-[#050505] text-white/70 hover:text-white'
              }`}
            >
              <span className="text-white/40 uppercase tracking-widest text-[0.65rem] mr-2">Reschedule</span>
              <span className={rescheduleFilter === 'Paid Reschedule' ? 'text-emerald-400 font-semibold' : rescheduleFilter === 'Pending Reschedule' ? 'text-yellow-400 font-semibold' : ''}>
                {rescheduleFilter}
              </span>
              <CaretDown size={12} className="ml-2" />
            </button>
            {activeDropdown === 'reschedule' && (
              <div className="absolute top-full left-0 mt-2 w-56 bg-[#050505] border border-white/10 rounded-lg shadow-xl flex flex-col py-1 overflow-hidden z-30">
                {[
                  { label: 'All', value: 'All' },
                  { label: 'Any Reschedule Request', value: 'Has Reschedule' },
                  { label: '💳 Paid Reschedules', value: 'Paid Reschedule', badge: 'bg-emerald-500/20 text-emerald-300' },
                  { label: '⏳ Pending Requests', value: 'Pending Reschedule', badge: 'bg-yellow-500/20 text-yellow-300' },
                  { label: '✅ Approved Reschedules', value: 'Approved Reschedule', badge: 'bg-green-500/20 text-green-300' },
                  { label: '❌ Rejected Reschedules', value: 'Rejected Reschedule', badge: 'bg-red-500/20 text-red-300' },
                  { label: '⚠️ < 48h Late Window', value: '< 48h Late', badge: 'bg-rose-500/20 text-rose-300' },
                  { label: '🟢 > 48h Safe Window', value: '> 48h Safe', badge: 'bg-emerald-500/20 text-emerald-300' },
                ].map(opt => (
                  <button 
                    key={opt.value} 
                    onClick={() => { setRescheduleFilter(opt.value); setActiveDropdown(null); }} 
                    className={`px-4 py-2 text-left text-xs transition-colors hover:bg-white/5 flex items-center justify-between ${
                      rescheduleFilter === opt.value 
                        ? 'text-[#c79c6e] font-semibold bg-white/[0.03]' 
                        : 'text-white/70 hover:text-white'
                    }`}
                  >
                    <span>{opt.label}</span>
                    {opt.badge && (
                      <span className={`text-[0.58rem] px-1.5 py-0.2 rounded font-semibold uppercase tracking-wider ${opt.badge}`}>
                        {opt.value.split(' ')[0]}
                      </span>
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>

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
                {['All', 'Paid', 'Failed', 'Pending'].map(opt => (
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

          {/* Account Status Filter (All / Active / Deleted) */}
          <div className="relative">
            <button 
              onClick={() => setActiveDropdown(activeDropdown === 'account' ? null : 'account')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg border text-xs transition-colors ${accountFilter === 'Deleted' ? 'border-red-500/50 bg-red-950/20 text-red-400' : 'border-white/10 bg-[#050505] text-white/70 hover:text-white'}`}
            >
              <span className="text-white/40 uppercase tracking-widest text-[0.65rem] mr-2">Account</span>
              <span className={accountFilter === 'Deleted' ? 'text-red-400 font-semibold' : (accountFilter === 'Active' ? 'text-emerald-400 font-semibold' : '')}>
                {accountFilter}
              </span>
              <CaretDown size={12} className="ml-2" />
            </button>
            {activeDropdown === 'account' && (
              <div className="absolute top-full left-0 mt-2 w-44 bg-[#050505] border border-white/10 rounded-lg shadow-xl flex flex-col py-1 overflow-hidden z-30">
                {[
                  { label: 'All', value: 'All' },
                  { label: 'Active', value: 'Active' },
                  { label: 'Deleted Accounts', value: 'Deleted' }
                ].map(opt => (
                  <button 
                    key={opt.value} 
                    onClick={() => { setAccountFilter(opt.value); setActiveDropdown(null); }} 
                    className={`px-4 py-2 text-left text-xs transition-colors hover:bg-white/5 flex items-center justify-between ${
                      accountFilter === opt.value 
                        ? 'text-[#c79c6e] font-semibold bg-white/[0.03]' 
                        : opt.value === 'Deleted' 
                          ? 'text-red-400 hover:text-red-300' 
                          : 'text-white/70 hover:text-white'
                    }`}
                  >
                    <span>{opt.label}</span>
                    {opt.value === 'Deleted' && <span className="w-1.5 h-1.5 rounded-full bg-red-500"></span>}
                    {opt.value === 'Active' && <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>}
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
        <div className="grid grid-cols-[1.5fr_1.5fr_1fr_1fr_0.8fr_1.5fr_1.2fr_80px] gap-4 px-6 py-4 bg-[#1a1a1a] border-b border-white/5 text-white/40 text-[0.65rem] uppercase tracking-widest font-semibold">
          <div>Client Name</div>
          <div>Email Address</div>
          <div>Phone No.</div>
          <div>Joined Date</div>
          <div className="text-center">Appointments</div>
          <div>Next Appointment</div>
          <div>Reschedule Req</div>
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
                  className={`grid grid-cols-[1.5fr_1.5fr_1fr_1fr_0.8fr_1.5fr_1.2fr_80px] gap-4 px-6 py-5 border-b border-white/5 items-center transition-colors cursor-pointer group ${expandedUser === user.id ? 'bg-white/[0.02]' : 'hover:bg-white/[0.02]'}`}
                  onClick={() => toggleExpand(user.id)}
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-white/5 border border-white/10 text-[#c79c6e] flex items-center justify-center font-serif text-lg shrink-0">
                      {user.name.charAt(0)}
                    </div>
                    <div className="flex flex-col">
                      <div className="flex items-center gap-2">
                        <span className="text-white/90 text-sm font-medium">{user.name}</span>
                        {user.isDeleted && (
                          <span className="text-[0.6rem] px-2 py-0.5 rounded bg-red-950/80 text-red-400 border border-red-800/40 uppercase tracking-widest font-semibold font-sans">
                            DELETED
                          </span>
                        )}
                      </div>
                      {user.isCourseMember && (
                        <span className="text-[0.65rem] text-[#c79c6e] flex items-center gap-1 font-sans">
                          <GraduationCap size={11} /> Course Member
                        </span>
                      )}
                    </div>
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
                          <span className="text-white/90 text-sm">{formatDisplayDate(user.nextAppointmentDate)}</span>
                          <span className="text-white/50 text-xs">{formatTimeRange(user.nextAppointmentTime, user.history?.[0]?.duration || 60)}</span>
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
                              {user.nextAppointmentStatus.toUpperCase() !== 'COMPLETED' && (() => {
                                // Disable "Mark as Completed" for future appointments
                                const rawDate = user.history[0]?.date;
                                const d = rawDate ? new Date(rawDate) : null;
                                const today = new Date(); today.setHours(0,0,0,0);
                                const isFuture = d && !isNaN(d) && d > today;
                                return (
                                  <button 
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      if (!isFuture) updateAppointmentStatus(user.id, user.history[0].id, 'COMPLETED');
                                    }} 
                                    disabled={isFuture}
                                    title={isFuture ? 'Cannot mark a future appointment as completed' : 'Mark as completed'}
                                    className={`px-3 py-1.5 text-left text-[0.65rem] uppercase tracking-widest transition-colors ${isFuture ? 'text-green-500/30 cursor-not-allowed' : 'text-green-500 hover:bg-white/5'}`}
                                  >
                                    Completed
                                  </button>
                                );
                              })()}
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
                  
                  <div className="flex flex-col items-start gap-1">
                    {user.history.some(h => h.rescheduleRequest?.status === 'PENDING') ? (
                      <span className="text-yellow-400 text-xs font-medium px-2 py-0.5 bg-yellow-500/10 rounded-full border border-yellow-500/20">Pending</span>
                    ) : user.history.some(h => h.rescheduleRequest?.rescheduleFeePaid) ? (
                      <span className="text-emerald-300 text-xs font-medium px-2 py-0.5 bg-emerald-500/10 rounded-full border border-emerald-500/20">Paid Reschedule</span>
                    ) : user.history.some(h => h.rescheduleRequest?.status === 'APPROVED') ? (
                      <span className="text-green-400 text-xs font-medium px-2 py-0.5 bg-green-500/10 rounded-full border border-green-500/20">Approved</span>
                    ) : user.history.some(h => h.rescheduleRequest?.status === 'REJECTED') ? (
                      <span className="text-red-400 text-xs font-medium px-2 py-0.5 bg-red-500/10 rounded-full border border-red-500/20">Rejected</span>
                    ) : (
                      <span className="text-white/30 text-sm">—</span>
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
                    {(() => {
                      const filteredHistory = user.history.filter(h => {
                        const matchesPayment = paymentFilter === 'All' || h.payment.toLowerCase() === paymentFilter.toLowerCase();
                        const matchesStatus = statusFilter === 'All' || h.status.toLowerCase() === statusFilter.toLowerCase();
                        
                        let matchesReschedule = true;
                        if (rescheduleFilter === 'Has Reschedule') {
                          matchesReschedule = !!h.rescheduleRequest;
                        } else if (rescheduleFilter === 'Paid Reschedule') {
                          matchesReschedule = !!h.rescheduleRequest?.rescheduleFeePaid;
                        } else if (rescheduleFilter === 'Pending Reschedule') {
                          matchesReschedule = h.rescheduleRequest?.status === 'PENDING';
                        } else if (rescheduleFilter === 'Approved Reschedule') {
                          matchesReschedule = h.rescheduleRequest?.status === 'APPROVED';
                        } else if (rescheduleFilter === 'Rejected Reschedule') {
                          matchesReschedule = h.rescheduleRequest?.status === 'REJECTED';
                        } else if (rescheduleFilter === '< 48h Late') {
                          matchesReschedule = !!h.rescheduleRequest?.isWithin48Hours;
                        } else if (rescheduleFilter === '> 48h Safe') {
                          matchesReschedule = !!h.rescheduleRequest && !h.rescheduleRequest.isWithin48Hours;
                        }

                        return matchesPayment && matchesStatus && matchesReschedule;
                      });

                      if (filteredHistory.length === 0) {
                        return (
                          <div className="bg-[#0a0a0a] border-b border-white/5 px-6 py-6 flex flex-col items-center justify-center text-white/30 text-sm">
                            No appointments match your filters.
                          </div>
                        );
                      }

                      return (
                        <div className="bg-[#0a0a0a] border-b border-white/5 px-6 py-6 flex flex-col">
                          <div className="flex items-center gap-2 mb-4 px-2">
                            <span className="text-white/40 text-[0.65rem] uppercase tracking-widest font-semibold">Appointment History</span>
                            <span className="w-1 h-1 rounded-full bg-white/20"></span>
                            <span className="text-white/60 text-[0.65rem] font-medium">{filteredHistory.length}</span>
                          </div>
                          
                          <div className="flex flex-col gap-2 pl-4 border-l border-white/10 ml-2">
                            {filteredHistory.map((session) => {
                              const notice48h = get48HoursNoticeInfo(session.date, session.time);
                              return (
                            <div key={session.id} className="grid grid-cols-[1.3fr_2fr_1fr_1.3fr_1fr_1.4fr_110px] gap-4 items-center px-4 py-3 bg-[#111] border border-white/5 rounded-lg hover:border-white/10 transition-colors">
                              
                              <div className="flex items-start gap-3">
                                <CalendarBlank size={16} className="text-white/30 mt-0.5 shrink-0" />
                                <div className="flex flex-col gap-1">
                                  <span className="text-white/80 text-sm font-medium">{formatDisplayDate(session.date)}</span>
                                  <span className="text-white/40 text-xs">{formatTimeRange(session.time, session.duration || 60)}</span>
                                  {notice48h && session.status.toUpperCase() === 'UPCOMING' && (
                                    <span 
                                      className={`text-[0.6rem] px-2 py-0.5 rounded border inline-flex items-center gap-1 font-medium w-fit ${notice48h.badgeClass}`}
                                      title={notice48h.badgeSub}
                                    >
                                      <span className={`w-1.5 h-1.5 rounded-full ${notice48h.isSafe ? 'bg-emerald-400' : notice48h.isLate ? 'bg-rose-400' : 'bg-zinc-400'}`} />
                                      {notice48h.badgeText}
                                    </span>
                                  )}
                                </div>
                              </div>

                              <div className="flex flex-col">
                                <span className="text-white/70 text-sm">{session.type}</span>
                                {session.source && (
                                  <span className="text-white/40 text-[0.65rem] flex items-center gap-1 mt-0.5">
                                    <Megaphone size={11} className="text-[#c79c6e]" />
                                    <span className="text-white/50">Heard via:</span>
                                    <span className="text-[#c79c6e] font-medium">{formatSource(session.source)}</span>
                                  </span>
                                )}
                              </div>

                                <div className="relative">
                                  <button 
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      if (session.status.toUpperCase() !== 'CANCELLED' && session.status.toUpperCase() !== 'REFUNDED') {
                                        setStatusDropdownOpenId(statusDropdownOpenId === session.id ? null : session.id);
                                      }
                                    }}
                                    className={`px-2.5 py-1 rounded-full border text-[0.65rem] uppercase tracking-wider hover:opacity-80 transition-opacity flex items-center gap-1 ${getStatusPillColor(session.status)} ${(session.status.toUpperCase() === 'CANCELLED' || session.status.toUpperCase() === 'REFUNDED') ? 'cursor-default opacity-90' : ''}`}
                                  >
                                    {session.status}
                                    {session.status.toUpperCase() !== 'CANCELLED' && session.status.toUpperCase() !== 'REFUNDED' && <CaretDown size={10} />}
                                  </button>
                                  
                                  {statusDropdownOpenId === session.id && (
                                    <div className="absolute top-full mt-1 left-0 w-28 bg-[#050505] border border-white/10 rounded-lg shadow-xl flex flex-col py-1 overflow-hidden z-30">
                                      {session.status.toUpperCase() !== 'COMPLETED' && (
                                        <button 
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            updateAppointmentStatus(user.id, session.id, 'COMPLETED');
                                          }} 
                                          className="px-3 py-1.5 text-left text-[0.65rem] uppercase tracking-widest text-green-500 hover:bg-white/5 transition-colors cursor-pointer"
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
                                          className="px-3 py-1.5 text-left text-[0.65rem] uppercase tracking-widest text-[#c79c6e] hover:bg-white/5 transition-colors cursor-pointer"
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

                              <div className="flex flex-col items-center gap-1.5">
                                <span className={`px-2 py-0.5 rounded border text-[0.65rem] uppercase tracking-wider ${getPaymentPillColor(session.payment)}`}>
                                  {session.payment}
                                </span>
                                <span className="text-white/80 text-[0.65rem] font-medium font-mono">
                                  {session.status === 'REFUNDED' ? (
                                    <span className="text-purple-400 font-bold">₹{Number(session.refundAmount || session.amount || 0).toLocaleString('en-IN')}</span>
                                  ) : session.isFreeSession ? (
                                    <span className="text-emerald-400 font-semibold">₹0 FREE</span>
                                  ) : session.rescheduleRequest?.rescheduleFeePaid ? (
                                    <div className="flex flex-col items-start">
                                      <span>₹{Number(session.amount || (session.duration === 90 ? feeSettings.fee90min : feeSettings.fee60min)).toLocaleString('en-IN')}</span>
                                      <span className="text-emerald-400 text-[0.58rem] font-semibold">+ ₹{Number(session.rescheduleRequest.rescheduleAmount || 5000).toLocaleString('en-IN')} Fee</span>
                                    </div>
                                  ) : (
                                    `₹${Number(session.amount !== undefined && session.amount !== null ? session.amount : (session.duration === 90 ? feeSettings.fee90min : feeSettings.fee60min)).toLocaleString('en-IN')}`
                                  )}
                                </span>
                              </div>

                              <div className="flex flex-col gap-0.5">
                                {session.rescheduleRequest ? (
                                  <>
                                    <div className="flex items-center gap-1.5">
                                      {session.rescheduleRequest.rescheduleFeePaid ? (
                                        <span className="text-[0.6rem] px-1.5 py-0.2 rounded font-semibold uppercase tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                                          PAID RESCHEDULE
                                        </span>
                                      ) : (
                                        <span className={`text-[0.65rem] uppercase tracking-wider font-semibold ${session.rescheduleRequest.status === 'PENDING' ? 'text-yellow-500' : session.rescheduleRequest.status === 'APPROVED' ? 'text-green-500' : 'text-red-500'}`}>
                                          {session.rescheduleRequest.status}
                                        </span>
                                      )}
                                      {session.rescheduleRequest.isWithin48Hours !== undefined && !session.rescheduleRequest.rescheduleFeePaid && (
                                        <span className={`text-[0.55rem] px-1.5 py-0.2 rounded font-semibold uppercase tracking-wider ${session.rescheduleRequest.isWithin48Hours ? 'bg-rose-500/20 text-rose-300' : 'bg-emerald-500/20 text-emerald-300'}`}>
                                          {session.rescheduleRequest.isWithin48Hours ? '<48h Late' : '>48h Safe'}
                                        </span>
                                      )}
                                    </div>
                                    <span className="text-white/80 text-xs">{formatDisplayDate(session.rescheduleRequest.date)}</span>
                                    <span className="text-white/50 text-[0.6rem]">{formatTimeRange(session.rescheduleRequest.time, session.duration || 60)}</span>
                                  </>
                                ) : (
                                  <span className="text-white/30 text-sm">—</span>
                                )}
                              </div>

                              <div className="text-right flex items-center justify-end">
                                <button 
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    openSessionDetails(user, session);
                                  }}
                                  className="text-[#c79c6e] hover:text-white text-xs flex items-center justify-end gap-1 transition-colors group cursor-pointer"
                                >
                                  View Details
                                  <CaretRight size={12} className="group-hover:translate-x-0.5 transition-transform" />
                                </button>
                              </div>
                              
                            </div>
                            );
                            })}
                        </div>
                      </div>
                    );
                    })()}
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
      </>
      )}

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
                  {selectedUser.isCourseMember && (
                    <span className="text-[0.65rem] text-[#c79c6e] flex items-center gap-1 font-sans mt-0.5">
                      <GraduationCap size={12} /> Course Member
                    </span>
                  )}
                  {!selectedSession && (
                    <div className="flex flex-wrap items-center gap-3 text-white/40 mt-1">
                      <div className="flex items-center gap-1.5">
                        <Phone size={14} />
                        <span className="font-sans text-xs">{selectedUser.phone}</span>
                      </div>
                      {selectedUser.source && (
                        <div className="flex items-center gap-1.5 text-white/60">
                          <Megaphone size={13} className="text-[#c79c6e]" />
                          <span className="font-sans text-xs">Heard via: <span className="text-white/90 font-medium">{formatSource(selectedUser.source)}</span></span>
                        </div>
                      )}
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
                      <span className="text-white text-sm font-medium">{formatDisplayDate(selectedSession.date)}</span>
                      <span className="text-white/60 text-xs">{formatTimeRange(selectedSession.time, selectedSession.duration || 60)}</span>
                    </div>
                    <div className="bg-[#111] border border-white/5 p-4 rounded-xl flex flex-col gap-2">
                      <div className="flex items-center justify-between text-white/40">
                        <div className="flex items-center gap-2">
                          <CurrencyCircleDollar size={16} />
                          <span className="text-[0.65rem] uppercase tracking-widest">Payment</span>
                        </div>
                        {selectedSession.rescheduleRequest?.rescheduleFeePaid && (
                          <span className="text-[0.6rem] px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-semibold uppercase tracking-wider">
                            + Paid Reschedule Fee
                          </span>
                        )}
                      </div>
                      <div className="flex items-baseline justify-between">
                        <span className={`text-sm font-medium ${selectedSession.payment === 'Paid' ? 'text-green-500' : selectedSession.payment === 'Refunded' ? 'text-purple-400' : 'text-red-500'}`}>
                          {selectedSession.payment}
                        </span>
                        <span className="text-white text-xs font-mono font-bold">
                          {selectedSession.isFreeSession ? (
                            <span className="text-emerald-400 font-semibold">₹0 FREE</span>
                          ) : selectedSession.rescheduleRequest?.rescheduleFeePaid ? (
                            `₹${(Number(selectedSession.amount || 0) + Number(selectedSession.rescheduleRequest.rescheduleAmount || 5000)).toLocaleString('en-IN')} Total`
                          ) : (
                            `₹${Number(selectedSession.amount !== undefined && selectedSession.amount !== null ? selectedSession.amount : (selectedSession.duration === 90 ? feeSettings.fee90min : feeSettings.fee60min)).toLocaleString('en-IN')}`
                          )}
                        </span>
                      </div>
                      {selectedSession.isFreeSession ? (
                        <span className="text-emerald-400 text-[0.65rem] font-semibold">Course Free Session</span>
                      ) : (
                        <div className="flex flex-col gap-0.5 text-white/40 text-[0.65rem] font-mono">
                          {selectedSession.paymentId && <span>Payment ID: {selectedSession.paymentId}</span>}
                          {selectedSession.txnId && selectedSession.txnId !== 'TXN-PENDING' && <span>Order ID: {selectedSession.txnId}</span>}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* 48-Hour Rescheduling Notice Window Card */}
                  {(() => {
                    const noticeInfo = get48HoursNoticeInfo(selectedSession.date, selectedSession.time);
                    if (!noticeInfo) return null;
                    return (
                      <div className={`p-4 rounded-xl border flex flex-col gap-2 ${noticeInfo.badgeClass}`}>
                        <div className="flex items-center justify-between">
                          <span className="text-[0.68rem] uppercase tracking-widest font-bold flex items-center gap-1.5">
                            <Clock size={14} />
                            {noticeInfo.isSafe ? '🟢 > 48h Safe Window' : noticeInfo.isLate ? '🔴 < 48h Late Window' : '⚪ Session Concluded'}
                          </span>
                          <span className="text-xs font-mono font-bold">
                            {noticeInfo.badgeText}
                          </span>
                        </div>
                        <p className="text-xs opacity-85 leading-relaxed">
                          {noticeInfo.isSafe 
                            ? 'Client is eligible for automated 100% free rescheduling. Over 48 hours remaining before appointment.'
                            : noticeInfo.isLate
                            ? 'Session is within the locked 48-hour window. Rescheduling requires coach/admin review or fresh booking.'
                            : 'This session has already taken place or is currently ongoing.'}
                        </p>
                      </div>
                    );
                  })()}

                  {/* Emergency Refund / Cancellation Card */}
                  <div className="flex flex-col gap-2 bg-[#111] border border-white/5 p-4 rounded-xl">
                    <div className="flex items-center justify-between text-white/40 pb-1 border-b border-white/5">
                      <div className="flex items-center gap-2">
                        <Receipt size={16} className="text-[#c79c6e]" />
                        <span className="text-[0.65rem] uppercase tracking-widest text-white/70 font-semibold">Emergency Refund / Cancellation</span>
                      </div>
                      <span className={`text-[0.65rem] font-medium px-2 py-0.5 rounded border uppercase ${
                        selectedSession.status === 'REFUNDED' 
                          ? 'text-purple-400 bg-purple-500/10 border-purple-500/30' 
                          : 'text-white/40 border-white/10'
                      }`}>
                        {selectedSession.status === 'REFUNDED' ? 'REFUNDED' : 'ACTIVE / BOOKED'}
                      </span>
                    </div>

                    {selectedSession.status === 'REFUNDED' ? (
                      <div className="flex flex-col gap-1.5 pt-2">
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-white/60">Amount Refunded:</span>
                          <span className="text-purple-400 font-bold font-mono text-sm">₹{Number(selectedSession.refundAmount || selectedSession.amount || 0).toLocaleString('en-IN')}</span>
                        </div>
                        {selectedSession.refundReason && (
                          <p className="text-xs text-white/70 italic bg-purple-500/5 p-2 rounded border border-purple-500/20">
                            Reason: "{selectedSession.refundReason}"
                          </p>
                        )}
                        {selectedSession.refundedAt && (
                          <span className="text-[0.65rem] text-white/40">
                            Processed on {new Date(selectedSession.refundedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                          </span>
                        )}
                      </div>
                    ) : (
                      <div className="flex flex-col gap-2.5 pt-2">
                        <p className="text-xs text-white/60 leading-relaxed">
                          If the client has a genuine emergency or cancellation need, you can process a full refund and release the calendar slot.
                        </p>
                        <button
                          type="button"
                          onClick={() => openRefundModal(selectedSession, selectedUser)}
                          className="w-full py-2 px-3 rounded-lg bg-rose-500/15 border border-rose-500/30 text-rose-300 hover:bg-rose-500 hover:text-white transition-all text-xs uppercase tracking-wider font-semibold flex items-center justify-center gap-2 cursor-pointer shadow-sm"
                        >
                          <ArrowCounterClockwise size={14} weight="bold" />
                          <span>Issue Emergency Refund</span>
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Reschedule Request & Payment Details */}
                  {selectedSession.rescheduleRequest && (
                    <div className="flex flex-col gap-3">
                      <div className="flex items-center justify-between text-amber-500 border-b border-white/5 pb-2">
                        <div className="flex items-center gap-2">
                          <CalendarBlank size={18} />
                          <h3 className="font-sans text-sm font-medium uppercase tracking-widest">Reschedule Details</h3>
                        </div>
                        {selectedSession.rescheduleRequest.rescheduleFeePaid ? (
                          <span className="text-[0.62rem] px-2 py-0.5 rounded font-semibold uppercase tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
                            <CheckCircle size={12} weight="fill" />
                            <span>Paid Late Reschedule (Auto-Approved)</span>
                          </span>
                        ) : selectedSession.rescheduleRequest.isWithin48Hours !== undefined ? (
                          <span className={`text-[0.62rem] px-2 py-0.5 rounded font-semibold uppercase tracking-wider ${
                            selectedSession.rescheduleRequest.isWithin48Hours 
                              ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30' 
                              : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                          }`}>
                            {selectedSession.rescheduleRequest.isWithin48Hours ? '⚠️ Requested in <48h Window' : '✅ Requested >48h in advance'}
                          </span>
                        ) : null}
                      </div>

                      <div className={`border rounded-xl p-5 flex flex-col gap-4 ${
                        selectedSession.rescheduleRequest.rescheduleFeePaid 
                          ? 'bg-emerald-950/20 border-emerald-500/30' 
                          : 'bg-amber-500/10 border-amber-500/20'
                      }`}>
                        <div className="flex flex-col gap-1">
                          <span className="text-white/60 text-[0.65rem] uppercase tracking-widest font-semibold">Rescheduled Session Time</span>
                          <span className="text-white font-medium text-sm">
                            {formatDisplayDate(selectedSession.rescheduleRequest.date)} at {formatTimeRange(selectedSession.rescheduleRequest.time, selectedSession.duration || 60)}
                          </span>
                        </div>

                        {/* Late Reschedule Payment Information Card */}
                        {selectedSession.rescheduleRequest.rescheduleFeePaid && (
                          <div className="bg-black/50 border border-emerald-500/30 rounded-lg p-3.5 flex flex-col gap-2">
                            <div className="flex items-center justify-between">
                              <span className="text-emerald-400 text-xs uppercase tracking-wider font-bold flex items-center gap-1.5">
                                <CheckCircle size={14} weight="fill" />
                                Reschedule Fee Paid
                              </span>
                              <span className="text-emerald-300 font-mono font-bold text-sm">
                                ₹{Number(selectedSession.rescheduleRequest.rescheduleAmount || 5000).toLocaleString('en-IN')}
                              </span>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[0.68rem] text-white/70 font-mono pt-2 border-t border-white/10">
                              {selectedSession.rescheduleRequest.reschedulePaymentId && (
                                <div>
                                  <span className="text-white/40 block text-[0.6rem] uppercase">Payment ID</span>
                                  <span className="text-emerald-300">{selectedSession.rescheduleRequest.reschedulePaymentId}</span>
                                </div>
                              )}
                              {selectedSession.rescheduleRequest.rescheduleOrderId && (
                                <div>
                                  <span className="text-white/40 block text-[0.6rem] uppercase">Order ID</span>
                                  <span className="text-white/80">{selectedSession.rescheduleRequest.rescheduleOrderId}</span>
                                </div>
                              )}
                              {selectedSession.rescheduleRequest.paidAt && (
                                <div className="sm:col-span-2 text-white/50 text-[0.65rem]">
                                  Paid on: {new Date(selectedSession.rescheduleRequest.paidAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                </div>
                              )}
                            </div>
                          </div>
                        )}

                        <div className="flex flex-col gap-1">
                          <span className="text-white/60 text-[0.65rem] uppercase tracking-widest font-semibold">Client's Reason</span>
                          <span className="text-white/90 text-sm italic">
                            {selectedSession.rescheduleRequest.reason ? `"${selectedSession.rescheduleRequest.reason}"` : <span className="text-white/40">No reason provided.</span>}
                          </span>
                        </div>

                        {selectedSession.rescheduleRequest.status === 'PENDING' && (
                          <div className="flex items-center gap-2 mt-2">
                            <button 
                              disabled={isProcessingReschedule}
                              onClick={() => handleRescheduleAction(selectedUser?.id || selectedUser?._id, selectedSession?._id || selectedSession?.id, 'approve')}
                              className="flex-1 py-2.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-black font-semibold text-xs uppercase tracking-widest transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed shadow-xs flex items-center justify-center gap-2"
                            >
                              {isProcessingReschedule ? 'Processing...' : 'Accept'}
                            </button>
                            <button 
                              disabled={isProcessingReschedule}
                              onClick={() => handleRescheduleAction(selectedUser?.id || selectedUser?._id, selectedSession?._id || selectedSession?.id, 'reject')}
                              className="flex-1 py-2.5 rounded-lg border border-amber-500/30 text-amber-500 font-semibold text-xs uppercase tracking-widest hover:bg-amber-500/10 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              Decline
                            </button>
                          </div>
                        )}
                        {selectedSession.rescheduleRequest.status !== 'PENDING' && !selectedSession.rescheduleRequest.rescheduleFeePaid && (
                          <div className="mt-2 text-xs uppercase tracking-widest font-semibold opacity-60">
                            Status: {selectedSession.rescheduleRequest.status}
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Client's Booking Submission Details */}
                  <div className="flex flex-col gap-4">
                    <div className="flex items-center gap-2 text-[#c79c6e] border-b border-white/5 pb-2">
                      <User size={18} />
                      <h3 className="font-sans text-sm font-medium uppercase tracking-widest">Client's Submission Details</h3>
                    </div>

                    {/* What Brings You Here? */}
                    <div className="flex flex-col gap-1.5">
                      <span className="text-[#c79c6e]/80 text-[0.65rem] uppercase tracking-widest font-semibold font-sans">
                        What Brings You Here?
                      </span>
                      <div className="bg-[#111] border border-white/5 rounded-xl p-4 text-white/80 font-sans text-sm leading-relaxed">
                        {(selectedSession.reason || selectedSession.beforeWeSpeak) ? (
                          <p className="text-white/90 whitespace-pre-wrap">{selectedSession.reason || selectedSession.beforeWeSpeak}</p>
                        ) : (
                          <p className="text-white/30 italic text-xs">No response provided.</p>
                        )}
                      </div>
                    </div>

                    {/* How Did You Hear About Me? */}
                    <div className="flex flex-col gap-1.5">
                      <div className="flex items-center gap-1.5 text-[#c79c6e]/80">
                        <Megaphone size={14} className="text-[#c79c6e]" />
                        <span className="text-[0.65rem] uppercase tracking-widest font-semibold font-sans">
                          How Did You Hear About Me?
                        </span>
                      </div>
                      <div className="bg-[#111] border border-white/5 rounded-xl p-4 text-white/90 font-sans text-sm">
                        {selectedSession.source ? (
                          <div className="flex items-center gap-2">
                            <span className="px-3 py-1 rounded-lg bg-[#c79c6e]/15 border border-[#c79c6e]/30 text-[#c79c6e] text-xs font-medium inline-block">
                              {formatSource(selectedSession.source)}
                            </span>
                          </div>
                        ) : (
                          <p className="text-white/30 italic text-xs">No response provided.</p>
                        )}
                      </div>
                    </div>

                    {/* Anything Else You Want Me To Know? */}
                    <div className="flex flex-col gap-1.5">
                      <span className="text-[#c79c6e]/80 text-[0.65rem] uppercase tracking-widest font-semibold font-sans">
                        Anything Else You Want Me To Know? (Optional)
                      </span>
                      <div className="bg-[#111] border border-white/5 rounded-xl p-4 text-white/80 font-sans text-sm leading-relaxed">
                        {selectedSession.extra ? (
                          <p className="text-white/90 whitespace-pre-wrap">{selectedSession.extra}</p>
                        ) : (
                          <p className="text-white/30 italic text-xs">No additional information provided.</p>
                        )}
                      </div>
                    </div>

                    {/* Questionnaire Responses */}
                    <div className="flex flex-col gap-2 pt-2 border-t border-white/5">
                      <div className="flex items-center justify-between text-[#c79c6e]/80">
                        <div className="flex items-center gap-1.5">
                          <Question size={15} className="text-[#c79c6e]" weight="bold" />
                          <span className="text-[0.65rem] uppercase tracking-widest font-semibold font-sans">
                            Questionnaire Responses
                          </span>
                        </div>
                        {selectedSession.questionnaireAnswers && (
                          <span className="text-[0.62rem] px-2 py-0.5 rounded bg-[#c79c6e]/15 border border-[#c79c6e]/30 text-[#c79c6e] font-mono font-semibold">
                            {Array.isArray(selectedSession.questionnaireAnswers) 
                              ? `${selectedSession.questionnaireAnswers.length} Answered` 
                              : `${Object.keys(selectedSession.questionnaireAnswers).length} Answered`}
                          </span>
                        )}
                      </div>

                      {selectedSession.questionnaireAnswers && (
                        (Array.isArray(selectedSession.questionnaireAnswers) && selectedSession.questionnaireAnswers.length > 0) ||
                        (typeof selectedSession.questionnaireAnswers === 'object' && Object.keys(selectedSession.questionnaireAnswers).length > 0)
                      ) ? (
                        <div className="flex flex-col gap-2.5">
                          {Array.isArray(selectedSession.questionnaireAnswers) ? (
                            selectedSession.questionnaireAnswers.map((item, idx) => (
                              <div key={idx} className="bg-[#111] border border-white/8 rounded-xl p-3.5 flex flex-col gap-2 hover:border-[#c79c6e]/30 transition-colors">
                                <div className="flex items-start gap-2">
                                  <span className="text-[0.65rem] font-mono px-1.5 py-0.5 rounded bg-white/5 text-[#c79c6e] shrink-0 mt-0.5">
                                    Q{idx + 1}
                                  </span>
                                  <p className="font-serif text-white/90 text-sm leading-snug">
                                    {item.question || item.questionText || `Question ${idx + 1}`}
                                  </p>
                                </div>
                                <div className="pl-7">
                                  <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#c79c6e]/10 border border-[#c79c6e]/30 text-xs font-sans text-[#c79c6e] font-medium">
                                    <CheckCircle size={14} weight="fill" className="text-[#c79c6e] shrink-0" />
                                    <span>{item.answer || item.answerText || item.optionId || 'Selected'}</span>
                                  </div>
                                </div>
                              </div>
                            ))
                          ) : (
                            Object.entries(selectedSession.questionnaireAnswers).map(([qKey, val], idx) => {
                              const qText = typeof val === 'object' ? (val.question || val.questionText || qKey) : qKey;
                              const aText = typeof val === 'object' ? (val.answer || val.answerText || val.optionId || '') : String(val);
                              return (
                                <div key={idx} className="bg-[#111] border border-white/8 rounded-xl p-3.5 flex flex-col gap-2 hover:border-[#c79c6e]/30 transition-colors">
                                  <div className="flex items-start gap-2">
                                    <span className="text-[0.65rem] font-mono px-1.5 py-0.5 rounded bg-white/5 text-[#c79c6e] shrink-0 mt-0.5">
                                      Q{idx + 1}
                                    </span>
                                    <p className="font-serif text-white/90 text-sm leading-snug">
                                      {qText}
                                    </p>
                                  </div>
                                  <div className="pl-7">
                                    <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#c79c6e]/10 border border-[#c79c6e]/30 text-xs font-sans text-[#c79c6e] font-medium">
                                      <CheckCircle size={14} weight="fill" className="text-[#c79c6e] shrink-0" />
                                      <span>{aText}</span>
                                    </div>
                                  </div>
                                </div>
                              );
                            })
                          )}
                        </div>
                      ) : (
                        <div className="bg-[#111] border border-white/5 rounded-xl p-4 text-white/30 italic text-xs font-sans">
                          No questionnaire submitted for this session (skipped or not filled).
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Official Coaching Agreement PDF */}
                  <div className="bg-[#111] border border-white/10 rounded-xl p-4 flex items-center justify-between gap-3 shadow-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-lg bg-[#c79c6e]/15 border border-[#c79c6e]/30 flex items-center justify-center text-[#c79c6e] shrink-0">
                        <FileText size={20} />
                      </div>
                      <div className="flex flex-col">
                        <span className="text-white text-xs font-semibold">Coaching Agreement</span>
                        <span className="text-white/40 text-[0.68rem]">Official legal coaching agreement (PDF)</span>
                      </div>
                    </div>
                    <a
                      href={`${API_URL}/api/appointments/${selectedSession.id || selectedSession._id}/agreement-pdf`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3.5 py-2 rounded-lg bg-[#c79c6e] hover:bg-white text-black text-xs font-semibold uppercase tracking-wider transition-colors shrink-0 flex items-center gap-1.5"
                    >
                      <FileText size={14} weight="bold" />
                      Download PDF
                    </a>
                  </div>

                  {/* Coach's Session Notes */}
                  <div className="flex flex-col gap-3">
                    <div className="flex items-center justify-between border-b border-white/5 pb-2">
                      <div className="flex items-center gap-2 text-[#c79c6e]">
                        <FileText size={18} />
                        <h3 className="font-sans text-sm font-medium uppercase tracking-widest">Coach's Session Notes</h3>
                      </div>
                      {notesSuccessMessage && (
                        <span className="text-emerald-400 text-xs font-sans flex items-center gap-1 animate-in fade-in">
                          ✓ Saved successfully
                        </span>
                      )}
                    </div>
                    <textarea 
                      value={sessionNotesText}
                      onChange={(e) => setSessionNotesText(e.target.value)}
                      className="w-full h-40 bg-[#111] border border-white/10 rounded-xl p-4 text-white font-sans text-sm resize-none focus:outline-none focus:border-[#c79c6e] transition-colors placeholder-white/20"
                      placeholder="Write your notes for this session here. These notes will be visible to the client in their appointment details..."
                    />
                    <div className="flex items-center justify-between mt-1">
                      <span className="text-[0.65rem] text-white/40 font-sans">
                        Notes will appear in the client's "View Appointment" & "Shared Notes" view.
                      </span>
                      <button 
                        onClick={handleSaveSessionNotes}
                        disabled={isSavingNotes}
                        className="px-5 py-2.5 rounded bg-[#c79c6e] text-black hover:bg-white font-sans text-xs uppercase tracking-widest font-semibold transition-all disabled:opacity-50"
                      >
                        {isSavingNotes ? 'Saving...' : 'Save Session Notes'}
                      </button>
                    </div>
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
                        {selectedUser.appointmentsCount > 0 ? formatDisplayDate(selectedUser.nextAppointmentDate) : 'None scheduled'}
                      </span>
                    </div>
                  </div>


                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* ── Emergency Refund Confirmation Modal ── */}
      {refundModalSession && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
          <div className="bg-[#12100e] border border-rose-500/40 rounded-2xl w-full max-w-md p-6 shadow-2xl flex flex-col gap-5 relative">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <div className="flex items-center gap-2.5 text-rose-400">
                <ArrowCounterClockwise size={20} weight="bold" />
                <h3 className="font-serif text-lg text-white font-medium">Issue Emergency Refund</h3>
              </div>
              <button 
                onClick={() => setRefundModalSession(null)}
                disabled={isRefunding}
                className="p-1 rounded-full text-white/40 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <div className="bg-black/40 border border-white/5 rounded-xl p-4 flex flex-col gap-2 text-xs">
              <div className="flex justify-between">
                <span className="text-white/50">Client Name:</span>
                <span className="text-white font-semibold">{refundModalSession.userName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-white/50">Client Email:</span>
                <span className="text-white/80 font-mono">{refundModalSession.userEmail}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-white/50">Scheduled Time:</span>
                <span className="text-[#c79c6e] font-medium">{formatDisplayDate(refundModalSession.date)} at {refundModalSession.time}</span>
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-white/70 uppercase tracking-wider">
                Refund Amount (₹)
              </label>
              <input 
                type="number"
                value={refundAmount}
                onChange={(e) => setRefundAmount(e.target.value)}
                placeholder="Amount to refund"
                className="w-full px-3.5 py-2.5 rounded-lg bg-black/60 border border-white/15 text-white font-mono text-sm focus:outline-none focus:border-rose-400"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-white/70 uppercase tracking-wider">
                Reason / Note for Client
              </label>
              <textarea 
                value={refundReason}
                onChange={(e) => setRefundReason(e.target.value)}
                rows={3}
                placeholder="E.g., Client medical emergency, mutual cancellation agreement..."
                className="w-full px-3.5 py-2.5 rounded-lg bg-black/60 border border-white/15 text-white text-xs resize-none focus:outline-none focus:border-rose-400 placeholder-white/20"
              />
            </div>

            <div className="p-3 bg-rose-500/10 border border-rose-500/20 rounded-lg text-[11px] text-rose-300 leading-relaxed">
              ⚠️ This will mark the session as <strong>REFUNDED</strong>, release the calendar slot, and dispatch an automated confirmation email to the client.
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setRefundModalSession(null)}
                disabled={isRefunding}
                className="px-4 py-2 rounded-lg text-xs font-medium text-white/70 hover:text-white hover:bg-white/5 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleIssueRefund}
                disabled={isRefunding}
                className="px-5 py-2.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold uppercase tracking-wider transition-all shadow-lg flex items-center gap-2 disabled:opacity-50 cursor-pointer"
              >
                {isRefunding ? 'Processing...' : 'Confirm & Process Refund'}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
