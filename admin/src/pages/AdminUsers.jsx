import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { useToast } from '../context/ToastContext';
import { API_URL } from '../utils/apiUrl';
import './AdminAppointments.css';

// Helper date formatters
const MON = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const DAY = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

const parseDateObj = (dateVal, timeStr = '10:00 AM') => {
  if (!dateVal) return new Date();
  if (dateVal instanceof Date) return dateVal;
  try {
    const d = new Date(dateVal);
    if (!isNaN(d.getTime())) return d;
  } catch {}
  return new Date();
};

const fD = (d) => {
  if (!d) return '—';
  const dt = parseDateObj(d);
  return `${dt.getDate()} ${MON[dt.getMonth()]} ${dt.getFullYear()}`;
};

const fDay = (d) => {
  if (!d) return '—';
  const dt = parseDateObj(d);
  return `${DAY[dt.getDay()]}, ${dt.getDate()} ${MON[dt.getMonth()]}`;
};

const inr = (n) => '₹' + (Number(n) || 0).toLocaleString('en-IN');

const formatTimeRange = (timeStr, duration = 60) => {
  if (!timeStr) return '10:00 AM – 11:00 AM';
  if (timeStr.includes('–') || timeStr.includes(' - ') || timeStr.includes(' to ')) {
    return timeStr;
  }
  const match = timeStr.match(/(\d+):?(\d*)\s*(AM|PM)?/i);
  if (!match) return timeStr;

  let [_, hoursStr, minutesStr, ampmStr] = match;
  let hours = parseInt(hoursStr, 10);
  let minutes = minutesStr ? parseInt(minutesStr, 10) : 0;
  let ampm = ampmStr ? ampmStr.toUpperCase() : 'AM';

  if (ampm === 'PM' && hours < 12) hours += 12;
  if (ampm === 'AM' && hours === 12) hours = 0;

  const startD = new Date(2026, 0, 1, hours, minutes);
  const endD = new Date(startD.getTime() + duration * 60000);

  const formatT = (date) => {
    let h = date.getHours();
    let m = date.getMinutes();
    const ap = h >= 12 ? 'PM' : 'AM';
    h = h % 12 || 12;
    return `${h}:${String(m).padStart(2, '0')} ${ap}`;
  };

  return `${formatT(startD)} – ${formatT(endD)}`;
};

const badPhone = (p) => {
  if (!p) return true;
  const clean = p.replace(/[\s+-]/g, '');
  return clean.length < 10 || /^\+?1000/.test(p) || p.includes('000-0000');
};

export default function AdminUsers() {
  const { showSuccess, showError, showInfo } = useToast();

  // Primary data state
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fee settings state
  const [feeSettings, setFeeSettings] = useState({ fee60min: 5000, fee90min: 7500 });
  const [feeModalOpen, setFeeModalOpen] = useState(false);
  const [isSavingFees, setIsSavingFees] = useState(false);

  // View state: 'clients' | 'appts'
  const [viewMode, setViewMode] = useState('clients');

  // Filter state
  const [activeTab, setActiveTab] = useState('all'); // 'all' | 'needs' | 'today' | 'upcoming' | 'past' | 'refunded'
  const [searchQuery, setSearchQuery] = useState('');
  const [filterPopOpen, setFilterPopOpen] = useState(false);
  const [filters, setFilters] = useState({
    pay: 'all',     // 'all' | 'paid' | 'pending' | 'refunded'
    rs: 'all',      // 'all' | 'pending' | 'approved' | 'rejected' | 'fee' | 'none'
    acct: 'all',    // 'all' | 'course' | 'regular'
    when: 'all'     // 'all' | '7d' | '30d' | 'month'
  });

  // Drawer state
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [selectedApptId, setSelectedApptId] = useState(null);
  const [drawerTab, setDrawerTab] = useState('overview'); // 'overview' | 'reschedule' | 'answers' | 'notes'

  // Notes state inside drawer
  const [notesText, setNotesText] = useState('');
  const [notesStatus, setNotesStatus] = useState('Saved ✓');
  const notesTimeoutRef = useRef(null);

  // Emergency Refund modal state
  const [refundModal, setRefundModal] = useState({
    isOpen: false,
    user: null,
    appt: null,
    reason: '',
    isProcessing: false
  });

  // Fetch all appointments from backend
  const fetchAppointmentsData = useCallback(async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('adminToken');
      const res = await fetch(`${API_URL}/api/appointments/admin`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (res.ok) {
        const appointments = await res.json();
        const userMap = {};

        appointments.forEach((app) => {
          const uId = app.userId && app.userId._id ? app.userId._id : 'guest_' + app._id;
          const isFreeSession = !!app.isFreeSession || app.orderId === 'COURSE_FREE_SESSION' || app.isComplimentary;
          const isCourseMember = !!app.isCourseMember || isFreeSession;

          if (!userMap[uId]) {
            userMap[uId] = {
              id: uId,
              name: (app.userId && (app.userId.fullName || app.userId.name)) ? (app.userId.fullName || app.userId.name) : app.name || 'Unknown Client',
              email: (app.userId && app.userId.email) ? app.userId.email : app.email || 'No Email',
              phone: (app.userId && (app.userId.phoneNumber || app.userId.phone)) ? (app.userId.phoneNumber || app.userId.phone) : app.phone || '',
              joined: parseDateObj((app.userId && app.userId.createdAt) ? app.userId.createdAt : (app.createdAt || Date.now())),
              course: isCourseMember,
              appts: []
            };
          } else {
            if (isCourseMember) userMap[uId].course = true;
          }

          const appDateObj = parseDateObj(app.date, app.time);
          const duration = Number(app.duration) || 60;
          const isRefunded = app.status === 'REFUNDED' || app.refundStatus === 'REFUNDED' || app.payment === 'Refunded';

          let payStatus = 'paid';
          if (isRefunded) payStatus = 'refunded';
          else if (isFreeSession) payStatus = 'paid';
          else if (app.paymentId || app.paymentStatus === 'PAID' || app.paymentStatus === 'paid' || app.payment === 'Paid') payStatus = 'paid';
          else payStatus = 'pending';

          const reschedReq = app.rescheduleRequest ? {
            status: (app.rescheduleRequest.status || 'pending').toLowerCase(),
            from: {
              s: parseDateObj(app.date, app.time),
              time: app.time
            },
            to: {
              s: parseDateObj(app.rescheduleRequest.date || app.date, app.rescheduleRequest.time || app.time),
              time: app.rescheduleRequest.time || app.time
            },
            reason: app.rescheduleRequest.reason || app.reason || 'Requested new slot',
            feePaid: Number(app.rescheduleRequest.feePaid) || 0,
            paidOn: app.rescheduleRequest.paidOn || ''
          } : null;

          const baseFee = Number(app.amount) || (duration === 90 ? feeSettings.fee90min : feeSettings.fee60min) || (duration === 90 ? 7500 : 5000);

          userMap[uId].appts.push({
            id: app._id,
            s: appDateObj,
            time: app.time || '10:00 AM',
            duration: duration,
            type: isFreeSession ? 'Course Free Session' : (app.type || 'Life Coaching Session'),
            fee: isFreeSession ? 0 : baseFee,
            pay: payStatus,
            done: app.status === 'COMPLETED' || app.status === 'completed',
            status: app.status || 'UPCOMING',
            resched: reschedReq,
            heard: app.source || '',
            brings: app.reason || '',
            extra: app.extra || '',
            qa: Array.isArray(app.questionnaireAnswers) ? app.questionnaireAnswers : [],
            notes: app.coachNotes || '',
            payId: app.paymentId || (isFreeSession ? 'COURSE_INCLUDED' : 'pay_' + app._id.slice(-8)),
            order: app.orderId || (isFreeSession ? 'COURSE_FREE_SESSION' : 'order_' + app._id.slice(-8)),
            isFreeSession: isFreeSession
          });
        });

        const loadedUsers = Object.values(userMap);
        setUsers(loadedUsers);
      }
    } catch (err) {
      console.error('Failed to fetch appointments:', err);
    } finally {
      setLoading(false);
    }
  }, [feeSettings.fee60min, feeSettings.fee90min]);

  // Fetch fees on mount
  useEffect(() => {
    const fetchFees = async () => {
      try {
        const res = await fetch(`${API_URL}/api/payment/fees`);
        if (res.ok) {
          const data = await res.json();
          if (data.fee60min && data.fee90min) {
            setFeeSettings({
              fee60min: Number(data.fee60min) || 5000,
              fee90min: Number(data.fee90min) || 7500
            });
          }
        }
      } catch (err) {}
    };
    fetchFees();
  }, []);

  useEffect(() => {
    fetchAppointmentsData();
  }, [fetchAppointmentsData]);

  // Save fee settings
  const handleSaveFees = async () => {
    setIsSavingFees(true);
    try {
      const token = localStorage.getItem('adminToken');
      const res = await fetch(`${API_URL}/api/payment/fees`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(feeSettings)
      });
      if (res.ok) {
        showSuccess('Session fees updated successfully!');
        setFeeModalOpen(false);
      } else {
        showError('Failed to update fees');
      }
    } catch (err) {
      showError('Error updating fees');
    } finally {
      setIsSavingFees(false);
    }
  };

  // Helper calculation functions
  const NOW = useMemo(() => new Date(), []);

  const sameDay = (a, b) => {
    if (!a || !b) return false;
    const d1 = parseDateObj(a);
    const d2 = parseDateObj(b);
    return d1.toDateString() === d2.toDateString();
  };

  const hoursLeft = (a) => {
    if (!a?.s) return 0;
    return (parseDateObj(a.s).getTime() - NOW.getTime()) / 36e5;
  };

  const stateOf = useCallback((a) => {
    if (!a) return 'upcoming';
    if (a.pay === 'refunded' || a.status === 'REFUNDED') return 'refunded';
    if (a.done || a.status === 'COMPLETED') return 'completed';
    if (sameDay(a.s, NOW) || a.status === 'Today') return 'today';
    if (parseDateObj(a.s) < NOW) return 'overdue';
    return 'upcoming';
  }, [NOW]);

  const rsPending = (a) => Boolean(a.resched && a.resched.status === 'pending');

  const actionOf = useCallback((a) => {
    if (rsPending(a)) return 'Reschedule request';
    if (a.pay === 'pending') return 'Payment pending';
    if (stateOf(a) === 'overdue') return 'Update status';
    return null;
  }, [stateOf]);

  const paidAmount = (a) => {
    if (a.pay === 'paid') {
      return a.fee + (a.resched?.feePaid || 0);
    }
    return 0;
  };

  // All appointments flattened list
  const allAppts = useMemo(() => {
    return users.flatMap((c) => c.appts.map((a) => ({ c, a })));
  }, [users]);

  // Tab & Filter Matching
  const tabMatch = useCallback((a, tab) => {
    const s = stateOf(a);
    switch (tab) {
      case 'needs':
        return !!actionOf(a);
      case 'today':
        return s === 'today';
      case 'upcoming':
        return s === 'upcoming' || s === 'today';
      case 'past':
        return s === 'completed' || s === 'overdue';
      case 'refunded':
        return s === 'refunded';
      default:
        return true;
    }
  }, [actionOf, stateOf]);

  const matchAppt = useCallback((c, a, tab = activeTab) => {
    if (!tabMatch(a, tab)) return false;

    if (filters.pay !== 'all' && a.pay !== filters.pay) return false;

    if (filters.rs !== 'all') {
      const r = a.resched;
      if (filters.rs === 'none' && r) return false;
      if (filters.rs === 'pending' && !(r && r.status === 'pending')) return false;
      if (filters.rs === 'approved' && !(r && (r.status === 'approved' || r.status === 'auto'))) return false;
      if (filters.rs === 'rejected' && !(r && r.status === 'rejected')) return false;
      if (filters.rs === 'fee' && !(r && r.feePaid > 0)) return false;
    }

    if (filters.acct === 'course' && !c.course) return false;
    if (filters.acct === 'regular' && c.course) return false;

    if (filters.when !== 'all') {
      const h = hoursLeft(a);
      if (filters.when === '7d' && !(h >= -12 && h <= 168)) return false;
      if (filters.when === '30d' && !(h >= -12 && h <= 720)) return false;
      if (filters.when === 'month') {
        const appD = parseDateObj(a.s);
        if (!(appD.getMonth() === NOW.getMonth() && appD.getFullYear() === NOW.getFullYear())) return false;
      }
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      const nMatch = c.name?.toLowerCase().includes(q);
      const eMatch = c.email?.toLowerCase().includes(q);
      const pMatch = c.phone?.includes(q);
      if (!nMatch && !eMatch && !pMatch) return false;
    }

    return true;
  }, [activeTab, filters, hoursLeft, NOW, searchQuery, tabMatch]);

  // KPI counts
  const kpiData = useMemo(() => {
    const needs = allAppts.filter((x) => actionOf(x.a)).length;
    const today = allAppts.filter((x) => stateOf(x.a) === 'today').length;
    const rs = allAppts.filter((x) => rsPending(x.a)).length;
    const rev = allAppts.reduce((sum, x) => sum + paidAmount(x.a), 0);
    return { needs, today, rs, rev };
  }, [actionOf, allAppts, stateOf]);

  const handleKpiClick = (k) => {
    setFilters({ pay: 'all', rs: 'all', acct: 'all', when: 'all' });
    setSearchQuery('');
    if (k === 'needs') setActiveTab('needs');
    else if (k === 'today') setActiveTab('today');
    else if (k === 'rs') {
      setActiveTab('all');
      setFilters((prev) => ({ ...prev, rs: 'pending' }));
    } else if (k === 'rev') {
      setActiveTab('all');
      setFilters((prev) => ({ ...prev, pay: 'paid' }));
    }
  };

  // Status Chips Helper
  const renderStateChip = (a) => {
    const s = stateOf(a);
    const map = {
      upcoming: ['bwa-c-blue', 'Upcoming'],
      today: ['bwa-c-acc', 'Today'],
      completed: ['bwa-c-green', 'Completed'],
      overdue: ['bwa-c-amber', 'Update status'],
      refunded: ['bwa-c-grey', 'Refunded']
    };
    const [cls, label] = map[s] || ['bwa-c-blue', 'Upcoming'];
    return <span className={`bwa-chip ${cls}`}>{label}</span>;
  };

  const renderPayChip = (a) => {
    if (a.pay === 'paid') return <span className="bwa-chip bwa-c-green">{a.isFreeSession ? 'Included in Course' : 'Paid'}</span>;
    if (a.pay === 'pending') return <span className="bwa-chip bwa-c-amber">Pending</span>;
    return <span className="bwa-chip bwa-c-grey">Refunded</span>;
  };

  // Reschedule Info helper
  const renderRsLine = (a) => {
    const r = a.resched;
    if (!r) return <span className="bwa-mut">—</span>;
    const statusMap = {
      pending: ['bwa-c-amber', 'Requested'],
      approved: ['bwa-c-green', 'Approved'],
      auto: ['bwa-c-green', 'Approved · fee paid'],
      rejected: ['bwa-c-red', 'Declined']
    };
    const [cls, label] = statusMap[r.status] || ['bwa-c-grey', r.status];
    const fromTime = formatTimeRange(r.from?.time || a.time);
    const toTime = formatTimeRange(r.to?.time || a.time);
    return (
      <div>
        <span className={`bwa-chip ${cls}`}>{label}</span>
        <div className="bwa-mut bwa-diff" style={{ marginTop: '4px', fontSize: '12px' }}>
          {fromTime} → {toTime}
        </div>
      </div>
    );
  };

  // Drawer handlers
  const selectedClient = useMemo(() => {
    return users.find((c) => c.id === selectedUserId) || null;
  }, [users, selectedUserId]);

  const selectedAppt = useMemo(() => {
    if (!selectedClient || !selectedApptId) return null;
    return selectedClient.appts.find((a) => a.id === selectedApptId) || null;
  }, [selectedClient, selectedApptId]);

  const openClientDrawer = (cId) => {
    setSelectedUserId(cId);
    setSelectedApptId(null);
    setDrawerOpen(true);
  };

  const openApptDrawer = (cId, aId) => {
    setSelectedUserId(cId);
    setSelectedApptId(aId);
    const clientObj = users.find((c) => c.id === cId);
    const apptObj = clientObj?.appts.find((a) => a.id === aId);
    setNotesText(apptObj?.notes || '');
    setDrawerTab('overview');
    setDrawerOpen(true);
  };

  const closeDrawer = () => {
    setDrawerOpen(false);
  };

  // Saving notes
  const saveNotesNow = async (val) => {
    if (notesTimeoutRef.current) clearTimeout(notesTimeoutRef.current);
    setNotesStatus('Saving…');
    try {
      const token = localStorage.getItem('adminToken');
      if (selectedApptId) {
        await fetch(`${API_URL}/api/appointments/admin/${selectedApptId}/notes`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify({ notes: val, coachNotes: val })
        });
        setUsers((prev) =>
          prev.map((c) => {
            if (c.id === selectedUserId) {
              return {
                ...c,
                appts: c.appts.map((a) => (a.id === selectedApptId ? { ...a, notes: val, coachNotes: val } : a))
              };
            }
            return c;
          })
        );
      }
      setNotesStatus('Saved ✓');
    } catch {
      setNotesStatus('Error saving');
    }
  };

  const handleNotesChange = (val) => {
    setNotesText(val);
    setNotesStatus('Unsaved');
    if (notesTimeoutRef.current) clearTimeout(notesTimeoutRef.current);
    notesTimeoutRef.current = setTimeout(() => {
      saveNotesNow(val);
    }, 600);
  };

  // Reschedule resolution
  const handleResolveRs = async (ok) => {
    if (!selectedApptId) return;
    try {
      const token = localStorage.getItem('adminToken');
      const endpoint = ok ? 'approve-reschedule' : 'reject-reschedule';
      const res = await fetch(`${API_URL}/api/appointments/admin/${selectedApptId}/${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        }
      });
      if (res.ok) {
        showSuccess(ok ? 'Reschedule approved!' : 'Reschedule declined.');
        setUsers((prev) =>
          prev.map((c) => {
            if (c.id === selectedUserId) {
              return {
                ...c,
                appts: c.appts.map((a) => {
                  if (a.id === selectedApptId) {
                    const nextStatus = ok ? 'approved' : 'rejected';
                    return {
                      ...a,
                      time: ok && a.resched?.to?.time ? a.resched.to.time : a.time,
                      s: ok && a.resched?.to?.s ? a.resched.to.s : a.s,
                      resched: a.resched ? { ...a.resched, status: nextStatus } : null
                    };
                  }
                  return a;
                })
              };
            }
            return c;
          })
        );
      } else {
        showError('Failed to process reschedule action');
      }
    } catch {
      showError('Network error');
    }
  };

  // Mark Completed
  const handleMarkCompleted = async () => {
    if (!selectedApptId) return;
    try {
      const token = localStorage.getItem('adminToken');
      const res = await fetch(`${API_URL}/api/appointments/admin/${selectedApptId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ status: 'COMPLETED' })
      });
      if (res.ok) {
        showSuccess('Marked appointment as completed');
        setUsers((prev) =>
          prev.map((c) => {
            if (c.id === selectedUserId) {
              return {
                ...c,
                appts: c.appts.map((a) => (a.id === selectedApptId ? { ...a, done: true, status: 'COMPLETED' } : a))
              };
            }
            return c;
          })
        );
      }
    } catch {
      showError('Error updating status');
    }
  };

  // Execute Refund
  const handleExecuteRefund = async () => {
    const { appt, user, reason } = refundModal;
    if (!appt) return;
    setRefundModal((prev) => ({ ...prev, isProcessing: true }));
    try {
      const token = localStorage.getItem('adminToken');
      const res = await fetch(`${API_URL}/api/appointments/admin/${appt.id}/issue-refund`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          reason: reason || 'Admin emergency refund',
          refundAmount: appt.fee
        })
      });
      if (res.ok) {
        showSuccess(`Refund of ${inr(appt.fee)} issued successfully!`);
        setRefundModal({ isOpen: false, user: null, appt: null, reason: '', isProcessing: false });
        setUsers((prev) =>
          prev.map((c) => {
            if (c.id === user.id) {
              return {
                ...c,
                appts: c.appts.map((a) => (a.id === appt.id ? { ...a, pay: 'refunded', status: 'REFUNDED' } : a))
              };
            }
            return c;
          })
        );
      } else {
        showError('Refund failed on server');
      }
    } catch {
      showError('Network error issuing refund');
    } finally {
      setRefundModal((prev) => ({ ...prev, isProcessing: false }));
    }
  };

  const copyToClipboard = (text) => {
    if (navigator?.clipboard?.writeText) {
      navigator.clipboard.writeText(text);
      showSuccess('Copied to clipboard');
    }
  };

  // Active filter chip labels
  const filterChips = useMemo(() => {
    const chips = [];
    const labels = {
      pay: { paid: 'Paid', pending: 'Payment pending', refunded: 'Refunded' },
      rs: { pending: 'Reschedule pending', approved: 'Reschedule approved', rejected: 'Reschedule declined', fee: 'Paid reschedule fee', none: 'No reschedule' },
      acct: { course: 'Course member', regular: 'Regular client' },
      when: { '7d': 'Next 7 days', '30d': 'Next 30 days', month: 'This month' }
    };
    ['pay', 'rs', 'acct', 'when'].forEach((k) => {
      if (filters[k] !== 'all') {
        chips.push({ key: k, label: labels[k][filters[k]] });
      }
    });
    return chips;
  }, [filters]);

  // Render client list rows
  const clientsList = useMemo(() => {
    return users
      .map((c) => ({
        c,
        matchedAppts: c.appts.filter((a) => matchAppt(c, a))
      }))
      .filter((x) => x.matchedAppts.length > 0);
  }, [matchAppt, users]);

  // Render all appointments grouped list
  const groupedApptsList = useMemo(() => {
    const matched = allAppts.filter((x) => matchAppt(x.c, x.a));
    const groups = [
      { name: 'Needs action', test: (x) => !!actionOf(x.a), sort: (a, b) => parseDateObj(a.a.s) - parseDateObj(b.a.s) },
      { name: 'Today', test: (x) => !actionOf(x.a) && stateOf(x.a) === 'today', sort: (a, b) => parseDateObj(a.a.s) - parseDateObj(b.a.s) },
      { name: 'Upcoming', test: (x) => !actionOf(x.a) && stateOf(x.a) === 'upcoming', sort: (a, b) => parseDateObj(a.a.s) - parseDateObj(b.a.s) },
      { name: 'Past', test: (x) => !actionOf(x.a) && stateOf(x.a) === 'completed', sort: (a, b) => parseDateObj(b.a.s) - parseDateObj(a.a.s) },
      { name: 'Refunded', test: (x) => stateOf(x.a) === 'refunded', sort: (a, b) => parseDateObj(b.a.s) - parseDateObj(a.a.s) }
    ];

    return groups
      .map((g) => ({
        name: g.name,
        items: matched.filter(g.test).sort(g.sort)
      }))
      .filter((g) => g.items.length > 0);
  }, [actionOf, allAppts, matchAppt, stateOf]);

  return (
    <div className="bwa-appts-container">
      <main className="bwa-appts-wrap">
        {/* ── Top Header ── */}
        <div className="bwa-appts-head">
          <div>
            <h1>Appointments &amp; Fees</h1>
            <p className="bwa-sub">Manage your client sessions and update your pricing structure.</p>
          </div>

          <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
            <div className="bwa-seg" role="tablist" aria-label="View mode">
              <button
                type="button"
                className={viewMode === 'clients' ? 'on' : ''}
                onClick={() => setViewMode('clients')}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="9" cy="8" r="3.5" />
                  <path d="M2.5 20c.6-3.6 3.2-5.5 6.5-5.5s5.9 1.9 6.5 5.5" />
                  <path d="M16 4.5a3.5 3.5 0 0 1 0 7M18 14.8c2 .7 3.2 2.4 3.5 5.2" />
                </svg>
                By client
              </button>

              <button
                type="button"
                className={viewMode === 'appts' ? 'on' : ''}
                onClick={() => setViewMode('appts')}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="3" y="5" width="18" height="16" rx="2" />
                  <path d="M3 10h18M8 3v4M16 3v4" />
                </svg>
                All appointments
              </button>
            </div>

            <button
              type="button"
              className="bwa-btn pri"
              onClick={() => setFeeModalOpen(true)}
              style={{ padding: '9px 16px' }}
            >
              Fee Settings
            </button>
          </div>
        </div>

        {/* ── KPI Cards ── */}
        <section className="bwa-kpis">
          <button
            type="button"
            className={`bwa-kpi ${kpiData.needs > 0 ? 'hot' : ''}`}
            onClick={() => handleKpiClick('needs')}
          >
            <div className="n">{kpiData.needs}</div>
            <div className="l">Need your action</div>
          </button>

          <button
            type="button"
            className="bwa-kpi"
            onClick={() => handleKpiClick('today')}
          >
            <div className="n">{kpiData.today}</div>
            <div className="l">Sessions today</div>
          </button>

          <button
            type="button"
            className="bwa-kpi"
            onClick={() => handleKpiClick('rs')}
          >
            <div className="n">{kpiData.rs}</div>
            <div className="l">Reschedule requests</div>
          </button>

          <button
            type="button"
            className="bwa-kpi"
            onClick={() => handleKpiClick('rev')}
          >
            <div className="n">{inr(kpiData.rev)}</div>
            <div className="l">Collected revenue</div>
          </button>
        </section>

        {/* ── Filter Tabs ── */}
        <div className="bwa-tabs" role="tablist">
          {[
            ['all', 'All'],
            ['needs', 'Needs action'],
            ['today', 'Today'],
            ['upcoming', 'Upcoming'],
            ['past', 'Past'],
            ['refunded', 'Refunded']
          ].map(([k, label]) => {
            const count = allAppts.filter((x) => tabMatch(x.a, k)).length;
            return (
              <button
                key={k}
                type="button"
                role="tab"
                className={activeTab === k ? 'on' : ''}
                onClick={() => setActiveTab(k)}
              >
                {label} <span className="c">{count}</span>
              </button>
            );
          })}
        </div>

        {/* ── Search & Filter Tools ── */}
        <div className="bwa-tools">
          <div className="bwa-search">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="7" />
              <path d="m20 20-3.5-3.5" />
            </svg>
            <input
              type="search"
              placeholder="Search by client name, email, or phone..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              aria-label="Search"
            />
          </div>

          <button
            type="button"
            className="bwa-fbtn"
            onClick={() => setFilterPopOpen(!filterPopOpen)}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M4 6h16M7 12h10M10 18h4" />
            </svg>
            Filters {filterChips.length > 0 && <span className="b">{filterChips.length}</span>}
          </button>

          {/* Filter Popup Modal */}
          <div className={`bwa-pop ${filterPopOpen ? 'open' : ''}`}>
            <div className="grid">
              <div>
                <label>Payment</label>
                <select
                  value={filters.pay}
                  onChange={(e) => setFilters((prev) => ({ ...prev, pay: e.target.value }))}
                >
                  <option value="all">All</option>
                  <option value="paid">Paid</option>
                  <option value="pending">Payment pending</option>
                  <option value="refunded">Refunded</option>
                </select>
              </div>

              <div>
                <label>Reschedule</label>
                <select
                  value={filters.rs}
                  onChange={(e) => setFilters((prev) => ({ ...prev, rs: e.target.value }))}
                >
                  <option value="all">All</option>
                  <option value="pending">Request pending</option>
                  <option value="approved">Approved</option>
                  <option value="rejected">Declined</option>
                  <option value="fee">Paid reschedule fee</option>
                  <option value="none">No reschedule</option>
                </select>
              </div>

              <div>
                <label>Account type</label>
                <select
                  value={filters.acct}
                  onChange={(e) => setFilters((prev) => ({ ...prev, acct: e.target.value }))}
                >
                  <option value="all">All</option>
                  <option value="course">Course member</option>
                  <option value="regular">Regular</option>
                </select>
              </div>

              <div>
                <label>Session date</label>
                <select
                  value={filters.when}
                  onChange={(e) => setFilters((prev) => ({ ...prev, when: e.target.value }))}
                >
                  <option value="all">Any time</option>
                  <option value="7d">Next 7 days</option>
                  <option value="30d">Next 30 days</option>
                  <option value="month">This month</option>
                </select>
              </div>
            </div>

            <div className="foot">
              <button
                type="button"
                className="bwa-link"
                onClick={() => setFilters({ pay: 'all', rs: 'all', acct: 'all', when: 'all' })}
              >
                Clear all
              </button>
              <button
                type="button"
                className="bwa-btn pri sm"
                onClick={() => setFilterPopOpen(false)}
              >
                Done
              </button>
            </div>
          </div>
        </div>

        {/* ── Active Filter Chips ── */}
        {filterChips.length > 0 && (
          <div className="bwa-chips">
            {filterChips.map((chip) => (
              <span className="bwa-fchip" key={chip.key}>
                {chip.label}
                <button
                  type="button"
                  onClick={() => setFilters((prev) => ({ ...prev, [chip.key]: 'all' }))}
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        )}

        {/* ── Main Data Table ── */}
        <section className="bwa-card">
          <div className="bwa-scroller">
            {viewMode === 'clients' ? (
              clientsList.length === 0 ? (
                <div className="bwa-empty">
                  <h3>No client records found</h3>
                  <p className="bwa-mut">Try searching for a different name, email, or clear your filters.</p>
                  <button
                    type="button"
                    className="bwa-btn pri"
                    onClick={() => {
                      setSearchQuery('');
                      setActiveTab('all');
                      setFilters({ pay: 'all', rs: 'all', acct: 'all', when: 'all' });
                    }}
                  >
                    Clear filters
                  </button>
                </div>
              ) : (
                <table className="bwa-table">
                  <thead>
                    <tr>
                      <th>Client</th>
                      <th>Contact</th>
                      <th>Sessions</th>
                      <th>Next session</th>
                      <th>Status</th>
                      <th>Action</th>
                      <th></th>
                    </tr>
                  </thead>
                  <tbody>
                    {clientsList.map(({ c, matchedAppts }) => {
                      const upcoming = matchedAppts
                        .filter((a) => ['today', 'upcoming'].includes(stateOf(a)))
                        .sort((a, b) => parseDateObj(a.s) - parseDateObj(b.s))[0];
                      const next = upcoming || matchedAppts.slice().sort((a, b) => parseDateObj(b.s) - parseDateObj(a.s))[0];
                      const totalPaid = c.appts.reduce((sum, a) => sum + paidAmount(a), 0);
                      const acts = c.appts.map(actionOf).filter(Boolean);
                      const firstAction = acts[0];

                      return (
                        <tr
                          className={`bwa-row ${acts.length > 0 ? 'bwa-flag' : ''}`}
                          key={c.id}
                          onClick={() => openClientDrawer(c.id)}
                        >
                          <td>
                            <div className="bwa-who">
                              <div className="bwa-av">{c.name?.[0]?.toUpperCase() || 'U'}</div>
                              <div>
                                <div className="bwa-nm">{c.name}</div>
                                {c.course && <div className="bwa-mem">Course member</div>}
                              </div>
                            </div>
                          </td>

                          <td>
                            <div>{c.email}</div>
                            <div className={badPhone(c.phone) ? 'bwa-bad' : 'bwa-mut'}>
                              {c.phone || 'No phone'}
                              {badPhone(c.phone) && ' · check number'}
                            </div>
                          </td>

                          <td>
                            <b>{c.appts.length}</b>{' '}
                            <span className="bwa-mut">{c.appts.length === 1 ? 'session' : 'sessions'}</span>
                            <div className="bwa-mut">{inr(totalPaid)} paid</div>
                          </td>

                          <td>
                            {next ? (
                              <>
                                <div className="bwa-nm">{fDay(next.s)}</div>
                                <div className="bwa-mut">{formatTimeRange(next.time, next.duration)}</div>
                              </>
                            ) : (
                              <span className="bwa-mut">—</span>
                            )}
                          </td>

                          <td>{next ? renderStateChip(next) : <span className="bwa-mut">—</span>}</td>

                          <td>
                            {firstAction ? (
                              <button
                                type="button"
                                className="bwa-btn sm pri"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  openClientDrawer(c.id);
                                }}
                              >
                                {acts.length > 1
                                  ? `${acts.length} to review`
                                  : firstAction === 'Reschedule request'
                                  ? 'Review request'
                                  : firstAction === 'Payment pending'
                                  ? 'Check payment'
                                  : 'Update status'}
                              </button>
                            ) : (
                              <button
                                type="button"
                                className="bwa-btn sm"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  openClientDrawer(c.id);
                                }}
                              >
                                View detail
                              </button>
                            )}
                          </td>

                          <td className="bwa-chev">›</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              )
            ) : (
              /* All Appointments View */
              groupedApptsList.length === 0 ? (
                <div className="bwa-empty">
                  <h3>No appointments match your filters</h3>
                  <p className="bwa-mut">Try choosing a different tab or resetting search terms.</p>
                  <button
                    type="button"
                    className="bwa-btn pri"
                    onClick={() => {
                      setSearchQuery('');
                      setActiveTab('all');
                      setFilters({ pay: 'all', rs: 'all', acct: 'all', when: 'all' });
                    }}
                  >
                    Clear filters
                  </button>
                </div>
              ) : (
                <table className="bwa-table">
                  <thead>
                    <tr>
                      <th>Client</th>
                      <th>Date &amp; Time</th>
                      <th>Type &amp; Duration</th>
                      <th>Status</th>
                      <th>Payment</th>
                      <th>Reschedule</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {groupedApptsList.map((group) => (
                      <React.Fragment key={group.name}>
                        <tr className="bwa-grp">
                          <td colSpan={7}>
                            {group.name} · {group.items.length}
                          </td>
                        </tr>
                        {group.items.map(({ c, a }) => {
                          const act = actionOf(a);
                          return (
                            <tr
                              className={`bwa-row ${act ? 'bwa-flag' : ''}`}
                              key={a.id}
                              onClick={() => openApptDrawer(c.id, a.id)}
                            >
                              <td>
                                <div className="bwa-who">
                                  <div className="bwa-av" style={{ width: '34px', height: '34px', fontSize: '13px' }}>
                                    {c.name?.[0]?.toUpperCase() || 'U'}
                                  </div>
                                  <div>
                                    <div className="bwa-nm">{c.name}</div>
                                    <div className="bwa-mut">{c.course ? 'Course member' : c.email}</div>
                                  </div>
                                </div>
                              </td>

                              <td>
                                <div className="bwa-nm">{fDay(a.s)}, {parseDateObj(a.s).getFullYear()}</div>
                                <div className="bwa-mut">{formatTimeRange(a.time, a.duration)}</div>
                              </td>

                              <td>
                                <div className="bwa-nm">{a.duration} mins</div>
                                <div className="bwa-mut">{a.type}</div>
                              </td>

                              <td>
                                {renderStateChip(a)}
                                {act && stateOf(a) !== 'overdue' && (
                                  <div className="bwa-mut" style={{ marginTop: '4px', color: 'var(--bwa-accent-d)', fontWeight: '600', fontSize: '12px' }}>
                                    {act}
                                  </div>
                                )}
                              </td>

                              <td>
                                {renderPayChip(a)}
                                <div className="bwa-mut" style={{ marginTop: '2px', fontSize: '12px' }}>
                                  {a.isFreeSession ? 'Free 1-on-1' : inr(a.fee + (a.resched?.feePaid || 0))}
                                </div>
                              </td>

                              <td>{renderRsLine(a)}</td>

                              <td>
                                <button
                                  type="button"
                                  className="bwa-btn sm"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    openApptDrawer(c.id, a.id);
                                  }}
                                >
                                  View detail
                                </button>
                              </td>
                            </tr>
                          );
                        })}
                      </React.Fragment>
                    ))}
                  </tbody>
                </table>
              )
            )}
          </div>
        </section>
      </main>

      {/* ── Right Detail Drawer (Client / Appointment Details) ── */}
      <div
        className={`bwa-scrim ${drawerOpen ? 'on' : ''}`}
        onClick={closeDrawer}
      />
      <aside className={`bwa-drawer ${drawerOpen ? 'on' : ''}`} aria-label="Details Drawer">
        {selectedClient && (
          selectedAppt ? (
            /* Appointment Detailed View */
            <>
              <div className="bwa-dh">
                <div className="bwa-dtop">
                  <div>
                    <div style={{ fontFamily: 'var(--bwa-serif)', fontSize: '24px', fontWeight: '400', color: 'var(--bwa-ink)' }}>
                      Appointment with {selectedClient.name}
                    </div>
                    <div className="bwa-mut" style={{ marginTop: '2px', fontSize: '13.5px' }}>
                      {parseDateObj(selectedAppt.s).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })} at {selectedAppt.time || '10:00 AM'}
                    </div>
                  </div>
                  <button
                    type="button"
                    className="bwa-x"
                    onClick={closeDrawer}
                    aria-label="Close"
                  >
                    ✕
                  </button>
                </div>

                <div className="bwa-dtabs" role="tablist" style={{ marginTop: '16px' }}>
                  {[
                    ['overview', 'Overview'],
                    ['reschedule', 'Reschedule'],
                    ['answers', 'Client answers'],
                    ['notes', 'Coach notes']
                  ].map(([k, label]) => (
                    <button
                      key={k}
                      type="button"
                      className={drawerTab === k ? 'on' : ''}
                      onClick={() => setDrawerTab(k)}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="bwa-dbody">
                {/* 1. Overview Tab */}
                {drawerTab === 'overview' && (
                  <div>
                    {actionOf(selectedAppt) && (
                      <div className="bwa-alert">
                        <div>
                          <b>{actionOf(selectedAppt)}</b>
                          <span className="bwa-mut" style={{ fontSize: '13px' }}>
                            {actionOf(selectedAppt) === 'Reschedule request'
                              ? 'The client asked for a new session time. Approve or decline below or in the Reschedule tab.'
                              : actionOf(selectedAppt) === 'Payment pending'
                              ? 'The session has not been paid yet.'
                              : 'This session date has passed. Please update its status.'}
                          </span>
                        </div>
                      </div>
                    )}

                    {/* Session & Google Meet Schedule Details Box */}
                    <div className="bwa-box" style={{ borderLeft: '3px solid var(--accent, #c9542f)' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '10px' }}>
                        <div>
                          <h3 style={{ fontFamily: 'var(--bwa-serif)', fontSize: '19px', fontWeight: '400', margin: '0 0 2px', color: 'var(--bwa-ink)' }}>
                            Session schedule &amp; meeting link
                          </h3>
                          <p className="bwa-mut" style={{ fontSize: '13px', margin: '0 0 12px' }}>
                            Confirmed booking date, time &amp; Google Meet video link.
                          </p>
                        </div>
                        <span className="bwa-chip" style={{ background: '#e5f2e8', color: '#2f4a34', fontWeight: 600, fontSize: '11px' }}>
                          {selectedAppt.isFreeSession || selectedAppt.orderId === 'COURSE_FREE_SESSION' ? 'Complimentary 1-on-1' : 'Paid Session'}
                        </span>
                      </div>

                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px 24px', marginBottom: '14px' }}>
                        <div>
                          <label style={{ display: 'block', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--bwa-muted)', fontWeight: '600', marginBottom: '3px' }}>
                            Date &amp; Day
                          </label>
                          <b style={{ fontSize: '14px', color: 'var(--bwa-ink)' }}>
                            {parseDateObj(selectedAppt.s).toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'short', year: 'numeric' })}
                          </b>
                        </div>
                        <div>
                          <label style={{ display: 'block', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--bwa-muted)', fontWeight: '600', marginBottom: '3px' }}>
                            Time
                          </label>
                          <b style={{ fontSize: '14px', color: 'var(--bwa-ink)' }}>
                            {selectedAppt.time || '10:00 AM'}
                          </b>
                        </div>
                        <div>
                          <label style={{ display: 'block', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--bwa-muted)', fontWeight: '600', marginBottom: '3px' }}>
                            Duration
                          </label>
                          <b style={{ fontSize: '14px', color: 'var(--bwa-ink)' }}>
                            {selectedAppt.duration || 60} Minutes
                          </b>
                        </div>
                        <div>
                          <label style={{ display: 'block', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--bwa-muted)', fontWeight: '600', marginBottom: '3px' }}>
                            Status
                          </label>
                          <b style={{ fontSize: '14px', color: 'var(--bwa-ink)' }}>
                            {(selectedAppt.status || 'Confirmed').toUpperCase()}
                          </b>
                        </div>
                      </div>

                      {/* Google Meet Video Link */}
                      <div style={{ padding: '10px 12px', background: 'rgba(201, 84, 47, 0.06)', borderRadius: '10px', border: '1px solid rgba(201, 84, 47, 0.2)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                          <span style={{ fontSize: '0.68rem', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 700, color: 'var(--accent, #c9542f)' }}>
                            📹 Google Meet Video Link
                          </span>
                          {selectedAppt.meetLink && (
                            <button
                              type="button"
                              className="bwa-btn bwa-btn-sm"
                              style={{ padding: '2px 8px', fontSize: '0.65rem' }}
                              onClick={() => navigator.clipboard.writeText(selectedAppt.meetLink)}
                            >
                              Copy Link
                            </button>
                          )}
                        </div>

                        {selectedAppt.meetLink ? (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', marginTop: '4px' }}>
                            <a 
                              href={selectedAppt.meetLink} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              style={{ color: 'var(--accent, #c9542f)', fontWeight: 600, fontSize: '0.82rem', textDecoration: 'underline', wordBreak: 'break-all' }}
                            >
                              {selectedAppt.meetLink}
                            </a>
                            <a
                              href={selectedAppt.meetLink}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="bwa-btn bwa-btn-sm"
                              style={{ padding: '4px 12px', fontSize: '0.72rem', background: 'var(--accent, #c9542f)', color: '#fff', textDecoration: 'none', borderRadius: '6px', fontWeight: 600 }}
                            >
                              Join Meeting ↗
                            </a>
                          </div>
                        ) : (
                          <div style={{ fontSize: '0.78rem', color: '#7a756b' }}>
                            Google Meet link will be generated automatically or sent with the calendar invite.
                          </div>
                        )}
                      </div>

                      {/* Client Intake Note */}
                      {(selectedAppt.reason || selectedAppt.notes) && (
                        <div style={{ marginTop: '12px', paddingTop: '10px', borderTop: '1px solid rgba(0,0,0,0.06)' }}>
                          <span style={{ fontSize: '0.65rem', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 600, color: '#7a756b', display: 'block', marginBottom: '4px' }}>
                            Client Goal / What Brings Them Here:
                          </span>
                          <p style={{ margin: 0, fontSize: '0.8rem', color: '#111010', lineHeight: 1.4 }}>
                            {selectedAppt.reason || selectedAppt.notes || 'No specific intake note.'}
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Client information Card */}
                    <div className="bwa-box">
                      <h3 style={{ fontFamily: 'var(--bwa-serif)', fontSize: '19px', fontWeight: '400', margin: '0 0 2px', color: 'var(--bwa-ink)' }}>
                        Client information
                      </h3>
                      <p className="bwa-mut" style={{ fontSize: '13px', margin: '0 0 16px' }}>
                        Contact and intake reference.
                      </p>

                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px 24px' }}>
                        <div>
                          <label style={{ display: 'block', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--bwa-muted)', fontWeight: '600', marginBottom: '3px' }}>
                            Name
                          </label>
                          <b style={{ fontSize: '14.5px', color: 'var(--bwa-ink)' }}>{selectedClient.name}</b>
                        </div>

                        <div>
                          <label style={{ display: 'block', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--bwa-muted)', fontWeight: '600', marginBottom: '3px' }}>
                            Email
                          </label>
                          <b style={{ fontSize: '14.5px', color: 'var(--bwa-ink)', wordBreak: 'break-all' }}>{selectedClient.email}</b>
                        </div>

                        <div>
                          <label style={{ display: 'block', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--bwa-muted)', fontWeight: '600', marginBottom: '3px' }}>
                            Phone
                          </label>
                          <b style={{ fontSize: '14px', color: selectedClient.phone ? 'var(--bwa-ink)' : 'var(--bwa-muted)' }}>
                            {selectedClient.phone || '—'}
                          </b>
                        </div>

                        <div>
                          <label style={{ display: 'block', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--bwa-muted)', fontWeight: '600', marginBottom: '3px' }}>
                            Session Duration
                          </label>
                          <b style={{ fontSize: '14.5px', color: 'var(--bwa-ink)' }}>{selectedAppt.duration || 60} Minutes</b>
                        </div>
                      </div>

                      {selectedClient.course && (
                        <div style={{ marginTop: '16px', paddingTop: '12px', borderTop: '1px solid var(--bwa-line2)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span className="bwa-chip bwa-c-acc" style={{ fontSize: '11px' }}>Course Student</span>
                          <span className="bwa-mut" style={{ fontSize: '12.5px' }}>Complimentary 1-on-1 private mentoring included</span>
                        </div>
                      )}
                    </div>

                    {/* Payment breakdown Card */}
                    <div className="bwa-box">
                      <h3 style={{ fontFamily: 'var(--bwa-serif)', fontSize: '19px', fontWeight: '400', margin: '0 0 2px', color: 'var(--bwa-ink)' }}>
                        Payment breakdown
                      </h3>
                      <p className="bwa-mut" style={{ fontSize: '13px', margin: '0 0 16px' }}>
                        Razorpay transaction record.
                      </p>

                      <div style={{ background: 'var(--bwa-bg)', border: '1px solid var(--bwa-line)', borderRadius: '12px', padding: '14px 16px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '13.5px' }}>
                          <span className="bwa-mut">Session fee</span>
                          <b>{selectedAppt.isFreeSession ? '₹0 (Course Free)' : inr(selectedAppt.fee)}</b>
                        </div>

                        {selectedAppt.resched?.feePaid > 0 && (
                          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '13.5px' }}>
                            <span className="bwa-mut">Reschedule fee</span>
                            <b>{inr(selectedAppt.resched.feePaid)}</b>
                          </div>
                        )}

                        <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: '10px', borderTop: '1px solid var(--bwa-line)', fontSize: '16px', fontWeight: '700', color: 'var(--bwa-ink)' }}>
                          <span>Total</span>
                          <span>{selectedAppt.isFreeSession ? '₹0' : inr(paidAmount(selectedAppt) || selectedAppt.fee)}</span>
                        </div>
                      </div>

                      <div style={{ marginTop: '12px', fontSize: '12.5px', color: 'var(--bwa-muted)' }}>
                        <span>Payment ID: </span>
                        <span style={{ fontFamily: 'Consolas, monospace', background: 'var(--bwa-grey-s)', padding: '2px 6px', borderRadius: '4px', color: 'var(--bwa-ink)' }}>
                          {selectedAppt.isFreeSession ? 'N/A (Free Call)' : (selectedAppt.payId || 'N/A')}
                        </span>
                        {selectedAppt.payId && !selectedAppt.isFreeSession && (
                          <button
                            type="button"
                            className="bwa-copy"
                            onClick={() => copyToClipboard(selectedAppt.payId)}
                          >
                            Copy
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Danger zone: Emergency refund */}
                    <div className="bwa-danger-zone">
                      <h4 style={{ fontFamily: 'var(--bwa-serif)', fontSize: '17px', fontWeight: '400', color: 'var(--bwa-red)', margin: '0 0 4px' }}>
                        Danger zone: Emergency refund
                      </h4>
                      <p className="bwa-mut" style={{ margin: '0 0 12px', fontSize: '13px' }}>
                        Refund payment directly back to client's original method via Razorpay.
                      </p>
                      {selectedAppt.isFreeSession ? (
                        <span className="bwa-mut" style={{ fontSize: '12.5px', fontStyle: 'italic' }}>
                          This is a free course complimentary session. No transaction refund is applicable.
                        </span>
                      ) : selectedAppt.pay === 'refunded' ? (
                        <span className="bwa-chip bwa-c-grey">Already Refunded</span>
                      ) : (
                        <button
                          type="button"
                          className="bwa-btn danger"
                          onClick={() =>
                            setRefundModal({
                              isOpen: true,
                              user: selectedClient,
                              appt: selectedAppt,
                              reason: '',
                              isProcessing: false
                            })
                          }
                        >
                          Issue emergency refund
                        </button>
                      )}
                    </div>
                  </div>
                )}

                {/* 2. Reschedule Tab */}
                {drawerTab === 'reschedule' && (
                  <div>
                    {!selectedAppt.resched ? (
                      <div className="bwa-empty">
                        <h3>No reschedule requested</h3>
                        <p className="bwa-mut">The client has not requested any time change for this session.</p>
                      </div>
                    ) : (
                      <>
                        <div className="bwa-box">
                          <h3 style={{ fontFamily: 'var(--bwa-serif)', fontSize: '19px', fontWeight: '400', margin: '0 0 2px', color: 'var(--bwa-ink)' }}>
                            Time change comparison
                          </h3>
                          <p className="bwa-mut" style={{ fontSize: '13px', margin: '0 0 14px' }}>
                            Review original vs newly requested time slot.
                          </p>

                          <div className="bwa-tl">
                            <div className="s">
                              <small>Original</small>
                              {fDay(selectedAppt.resched.from.s)}
                              <br />
                              {formatTimeRange(selectedAppt.resched.from.time)}
                            </div>
                            <div style={{ textAlign: 'center', color: 'var(--bwa-accent)', fontWeight: 'bold' }}>→</div>
                            <div className="s new">
                              <small>{selectedAppt.resched.status === 'pending' ? 'Requested New Time' : 'Updated Time'}</small>
                              {fDay(selectedAppt.resched.to.s)}
                              <br />
                              {formatTimeRange(selectedAppt.resched.to.time)}
                            </div>
                          </div>
                          <div style={{ marginTop: '12px' }}>
                            {renderRsLine(selectedAppt)}
                          </div>
                        </div>

                        <div className="bwa-box">
                          <h4>Client's Reason</h4>
                          <p style={{ margin: 0, fontStyle: 'italic', color: 'var(--bwa-ink)' }}>
                            “{selectedAppt.resched.reason || 'No specific reason entered.'}”
                          </p>
                        </div>

                        <div className="bwa-box">
                          <h4>Reschedule Fee</h4>
                          <div>
                            {selectedAppt.resched.feePaid > 0 ? (
                              <span style={{ color: 'var(--bwa-green)', fontWeight: '600' }}>
                                {inr(selectedAppt.resched.feePaid)} paid on {selectedAppt.resched.paidOn || 'Online'}
                              </span>
                            ) : (
                              <span className="bwa-mut">No reschedule fee charged (within 48h free policy window).</span>
                            )}
                          </div>
                        </div>

                        {rsPending(selectedAppt) && (
                          <div style={{ display: 'flex', gap: '10px', marginTop: '16px' }}>
                            <button
                              type="button"
                              className="bwa-btn pri"
                              onClick={() => handleResolveRs(true)}
                            >
                              Approve new time
                            </button>
                            <button
                              type="button"
                              className="bwa-btn"
                              onClick={() => handleResolveRs(false)}
                            >
                              Decline request
                            </button>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                )}

                {/* 3. Client Answers Tab */}
                {drawerTab === 'answers' && (
                  <div>
                    <div className="bwa-box">
                      <h3 style={{ fontFamily: 'var(--bwa-serif)', fontSize: '19px', fontWeight: '400', margin: '0 0 2px', color: 'var(--bwa-ink)' }}>
                        Client Intake Responses
                      </h3>
                      <p className="bwa-mut" style={{ fontSize: '13px', margin: '0 0 16px' }}>
                        Submitted during session booking.
                      </p>

                      <div className="bwa-qa">
                        <small>WHAT BRINGS YOU HERE?</small>
                        <b style={{ fontWeight: '600', color: 'var(--bwa-ink)', fontSize: '14px' }}>
                          {selectedAppt.brings || <i className="bwa-mut">No response provided</i>}
                        </b>
                      </div>

                      <div className="bwa-qa">
                        <small>HOW DID YOU HEAR ABOUT ME?</small>
                        <b style={{ fontWeight: '600', color: 'var(--bwa-ink)', fontSize: '14px' }}>
                          {selectedAppt.heard || <i className="bwa-mut">No response provided</i>}
                        </b>
                      </div>

                      <div className="bwa-qa">
                        <small>ANYTHING ELSE I SHOULD KNOW?</small>
                        <b style={{ fontWeight: '600', color: 'var(--bwa-ink)', fontSize: '14px' }}>
                          {selectedAppt.extra || <i className="bwa-mut">No extra notes provided</i>}
                        </b>
                      </div>
                    </div>

                    {selectedAppt.qa && selectedAppt.qa.length > 0 && (
                      <div className="bwa-box" style={{ marginTop: '16px' }}>
                        <div className="bwa-sec" style={{ margin: '0 0 14px' }}>
                          Questionnaire Answers
                          <span>{selectedAppt.qa.length} answered</span>
                        </div>
                        {selectedAppt.qa.map((item, idx) => {
                          const question = Array.isArray(item) ? item[0] : item.question || item.q || `Question ${idx + 1}`;
                          const answer = Array.isArray(item) ? item[1] : item.answer || item.a || 'Answered';
                          return (
                            <div className="bwa-qa" key={idx}>
                              <small>Q{idx + 1}: {question}</small>
                              <span className="bwa-ans">{answer}</span>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                )}

                {/* 4. Coach Notes Tab */}
                {drawerTab === 'notes' && (
                  <div>
                    <div className="bwa-sec" style={{ marginTop: 0 }}>
                      Session Notes &amp; Action Points
                      <span className="bwa-saved">{notesStatus}</span>
                    </div>

                    <textarea
                      className="bwa-textarea"
                      placeholder="Write confidential private or shared notes for this session..."
                      value={notesText}
                      onChange={(e) => handleNotesChange(e.target.value)}
                    />

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '10px', gap: '12px', flexWrap: 'wrap' }}>
                      <p className="bwa-mut" style={{ fontSize: '12.5px', margin: 0, flex: 1 }}>
                        Notes are auto-saved in real-time and synced to the client's session summary.
                      </p>
                      <button
                        type="button"
                        className="bwa-btn pri sm"
                        onClick={() => saveNotesNow(notesText)}
                        disabled={notesStatus === 'Saving…'}
                        style={{ minWidth: '100px' }}
                      >
                        {notesStatus === 'Saving…' ? 'Saving…' : notesStatus === 'Saved ✓' ? 'Save Notes ✓' : 'Save Notes'}
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Drawer Footer Actions */}
              <div style={{ padding: '16px 26px', background: '#fff', borderTop: '1px solid var(--bwa-line)', display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                {!selectedAppt.done && (stateOf(selectedAppt) === 'today' || stateOf(selectedAppt) === 'overdue' || stateOf(selectedAppt) === 'upcoming') && (
                  <button
                    type="button"
                    className="bwa-btn pri"
                    onClick={handleMarkCompleted}
                  >
                    Mark completed
                  </button>
                )}
                <button
                  type="button"
                  className="bwa-btn"
                  onClick={closeDrawer}
                >
                  Close
                </button>
              </div>
            </>
          ) : (
            /* Client Overview View */
            <>
              <div className="bwa-dh">
                <div className="bwa-dtop">
                  <span className="bwa-mut">Client Profile</span>
                  <button
                    type="button"
                    className="bwa-x"
                    onClick={closeDrawer}
                    aria-label="Close"
                  >
                    ✕
                  </button>
                </div>

                <div className="bwa-who" style={{ paddingBottom: '16px' }}>
                  <div className="bwa-av" style={{ width: '56px', height: '56px', fontSize: '22px' }}>
                    {selectedClient.name?.[0]?.toUpperCase() || 'U'}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontFamily: 'var(--bwa-serif)', fontSize: '24px', color: 'var(--bwa-ink)' }}>
                      {selectedClient.name}
                    </div>
                    <div className="bwa-mut">
                      {selectedClient.email} ·{' '}
                      <span className={badPhone(selectedClient.phone) ? 'bwa-bad' : ''}>
                        {selectedClient.phone || 'No phone'}
                      </span>
                    </div>
                    {selectedClient.course && <div className="bwa-mem">Course member</div>}
                  </div>
                </div>
              </div>

              <div className="bwa-dbody">
                {/* Contact Quick Actions */}
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '16px' }}>
                  <a
                    className="bwa-btn sm"
                    style={{ textDecoration: 'none' }}
                    href={`mailto:${selectedClient.email}`}
                  >
                    Email Client
                  </a>
                  {!badPhone(selectedClient.phone) && (
                    <a
                      className="bwa-btn sm"
                      style={{ textDecoration: 'none' }}
                      target="_blank"
                      rel="noreferrer"
                      href={`https://wa.me/91${selectedClient.phone.replace(/\D/g, '').slice(-10)}`}
                    >
                      WhatsApp
                    </a>
                  )}
                </div>

                {/* Client Stats */}
                <div className="bwa-stats">
                  <div className="bwa-stat">
                    <span className="bwa-mut">Sessions</span>
                    <b>{selectedClient.appts.length}</b>
                  </div>
                  <div className="bwa-stat">
                    <span className="bwa-mut">Total Paid</span>
                    <b>{inr(selectedClient.appts.reduce((sum, a) => sum + paidAmount(a), 0))}</b>
                  </div>
                  <div className="bwa-stat">
                    <span className="bwa-mut">Joined</span>
                    <b style={{ fontSize: '15px', paddingTop: '4px' }}>{fD(selectedClient.joined)}</b>
                  </div>
                </div>

                {/* Client Appointments List Sections */}
                {(() => {
                  const upcoming = selectedClient.appts
                    .filter((a) => ['today', 'upcoming'].includes(stateOf(a)))
                    .sort((a, b) => parseDateObj(a.s) - parseDateObj(b.s));
                  const past = selectedClient.appts
                    .filter((a) => ['completed', 'overdue'].includes(stateOf(a)))
                    .sort((a, b) => parseDateObj(b.s) - parseDateObj(a.s));
                  const refunded = selectedClient.appts
                    .filter((a) => stateOf(a) === 'refunded')
                    .sort((a, b) => parseDateObj(b.s) - parseDateObj(a.s));

                  const renderApptCards = (title, list) => {
                    if (list.length === 0) return null;
                    return (
                      <div style={{ marginTop: '20px' }}>
                        <div className="bwa-sec">
                          {title} <span>{list.length}</span>
                        </div>
                        {list.map((a) => {
                          const act = actionOf(a);
                          return (
                            <div
                              className={`bwa-acard ${act ? 'flag' : ''}`}
                              key={a.id}
                              onClick={() => openApptDrawer(selectedClient.id, a.id)}
                            >
                              <div>
                                <div className="t">
                                  {fDay(a.s)} · {formatTimeRange(a.time, a.duration)}
                                </div>
                                <div className="bwa-mut">{a.type}</div>
                              </div>
                              <div style={{ textAlign: 'right' }}>
                                {renderStateChip(a)}
                                <div className="bwa-mut" style={{ marginTop: '4px', fontSize: '12px' }}>
                                  {a.isFreeSession ? 'Included' : inr(paidAmount(a) || a.fee)}
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    );
                  };

                  return (
                    <>
                      {renderApptCards('Upcoming Sessions', upcoming)}
                      {renderApptCards('Past Sessions', past)}
                      {renderApptCards('Refunded Sessions', refunded)}
                    </>
                  );
                })()}
              </div>
            </>
          )
        )}
      </aside>

      {/* ── Emergency Refund Confirmation Modal ── */}
      <div className={`bwa-modal ${refundModal.isOpen ? 'on' : ''}`}>
        <div className="bwa-mbox" role="dialog" aria-modal="true">
          <h3>Refund {refundModal.appt ? inr(refundModal.appt.fee) : ''}?</h3>
          <p className="bwa-mut" style={{ fontSize: '13.5px' }}>
            {refundModal.appt && `${fDay(refundModal.appt.s)} · ${formatTimeRange(refundModal.appt.time, refundModal.appt.duration)}. The appointment slot will be released and payment refunded in full.`}
          </p>

          <label style={{ display: 'block', fontSize: '13px', color: 'var(--bwa-muted)', marginTop: '12px' }}>
            Reason for refund (internal records):
          </label>
          <textarea
            rows={3}
            placeholder="e.g. Client requested emergency cancellation due to illness"
            value={refundModal.reason}
            onChange={(e) => setRefundModal((prev) => ({ ...prev, reason: e.target.value }))}
          />

          <div className="bwa-mact">
            <button
              type="button"
              className="bwa-btn"
              onClick={() => setRefundModal({ isOpen: false, user: null, appt: null, reason: '', isProcessing: false })}
            >
              Cancel
            </button>
            <button
              type="button"
              className="bwa-btn danger"
              style={{ background: 'var(--bwa-red)', borderColor: 'var(--bwa-red)', color: '#fff' }}
              disabled={refundModal.isProcessing}
              onClick={handleExecuteRefund}
            >
              {refundModal.isProcessing ? 'Processing Refund…' : `Refund ${refundModal.appt ? inr(refundModal.appt.fee) : ''}`}
            </button>
          </div>
        </div>
      </div>

      {/* ── Fee Settings Modal ── */}
      <div className={`bwa-modal ${feeModalOpen ? 'on' : ''}`}>
        <div className="bwa-mbox" role="dialog" aria-modal="true">
          <h3>Coaching Fee Settings</h3>
          <p className="bwa-sub" style={{ marginBottom: '16px' }}>
            Update the pricing structure for 60-minute and 90-minute live 1-on-1 coaching sessions.
          </p>

          <div style={{ marginBottom: '14px' }}>
            <label style={{ display: 'block', fontSize: '12.5px', fontWeight: '600', color: 'var(--bwa-muted)' }}>
              60-Min Session Fee (₹)
            </label>
            <input
              type="number"
              value={feeSettings.fee60min}
              onChange={(e) => setFeeSettings((prev) => ({ ...prev, fee60min: Number(e.target.value) || 0 }))}
            />
          </div>

          <div style={{ marginBottom: '18px' }}>
            <label style={{ display: 'block', fontSize: '12.5px', fontWeight: '600', color: 'var(--bwa-muted)' }}>
              90-Min Session Fee (₹)
            </label>
            <input
              type="number"
              value={feeSettings.fee90min}
              onChange={(e) => setFeeSettings((prev) => ({ ...prev, fee90min: Number(e.target.value) || 0 }))}
            />
          </div>

          <div className="bwa-mact">
            <button
              type="button"
              className="bwa-btn"
              onClick={() => setFeeModalOpen(false)}
            >
              Cancel
            </button>
            <button
              type="button"
              className="bwa-btn pri"
              disabled={isSavingFees}
              onClick={handleSaveFees}
            >
              {isSavingFees ? 'Saving Changes…' : 'Save Fee Settings'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
