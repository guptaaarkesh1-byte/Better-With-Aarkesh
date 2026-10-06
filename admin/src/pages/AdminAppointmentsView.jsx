import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useToast } from '../context/ToastContext';
import Icon from '../components/common/AdminIcons';
import AdminDrawer from '../components/common/AdminDrawer';
import AdminConfirmModal from '../components/common/AdminConfirmModal';
import AdminStickyBar from '../components/common/AdminStickyBar';

import { API_URL } from '../utils/apiUrl';

const inr = (n) => '₹' + Math.round(Number(n) || 0).toLocaleString('en-IN');

export default function AdminAppointmentsView() {
  const { showSuccess, showError, showInfo } = useToast();
  
  // View mode
  const [viewMode, setViewMode] = useState('appointments'); // 'appointments' | 'clients' | 'fees'
  const [activeTab, setActiveTab] = useState('all'); // 'all' | 'needs-action' | 'today' | 'upcoming' | 'past' | 'refunded'
  
  // Data State
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterPopoverOpen, setFilterPopoverOpen] = useState(false);
  const [filters, setFilters] = useState({
    paymentStatus: '',
    rescheduleStatus: '',
    accountType: '',
    bookingType: '',
    dateRange: ''
  });

  // Fee Settings State
  const [fees, setFees] = useState({ fee60min: 5000, fee90min: 7500 });
  const [feeDirty, setFeeDirty] = useState(false);
  const [savingFees, setSavingFees] = useState(false);

  // Drawer States
  const [selectedClient, setSelectedClient] = useState(null);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [detailTab, setDetailTab] = useState('overview'); // 'overview' | 'reschedule' | 'answers' | 'notes'

  // Coach Notes autosave
  const [coachNotes, setCoachNotes] = useState('');
  const [notesSaveStatus, setNotesSaveStatus] = useState('saved'); // 'saved' | 'saving' | 'dirty'
  const notesTimerRef = useRef(null);

  // Refund Modal State
  const [refundModalOpen, setRefundModalOpen] = useState(false);
  const [refundAmount, setRefundAmount] = useState('');
  const [refundReason, setRefundReason] = useState('');
  const [processingRefund, setProcessingRefund] = useState(false);

  // Fetch Appointments & Fees
  const fetchData = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('adminToken');
      const headers = { Authorization: `Bearer ${token}` };

      const [appRes, feeRes] = await Promise.all([
        fetch(`${API_URL}/api/appointments/admin`, { headers }),
        fetch(`${API_URL}/api/appointments/fees`, { headers })
      ]);

      if (appRes.ok) {
        const appData = await appRes.json();
        setAppointments(appData);
      }

      if (feeRes.ok) {
        const feeData = await feeRes.json();
        setFees({
          fee60min: feeData.fee60min || 5000,
          fee90min: feeData.fee90min || 7500
        });
      }
    } catch (err) {
      console.error('Error fetching appointments:', err);
      showError('Failed to load appointments data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Compute needs-action flag
  const isNeedsAction = (app) => {
    const s = (app.status || '').toUpperCase();
    if (s === 'REFUNDED' || s === 'COMPLETED' || s === 'CANCELLED') return false;
    if (app.rescheduleRequested) return true;
    if (app.paymentStatus === 'Pending') return true;
    
    // Check if session date has passed without completion
    try {
      const appDateTime = new Date(`${app.date} ${app.time}`);
      if (!isNaN(appDateTime.getTime()) && appDateTime < new Date() && s !== 'COMPLETED') {
        return true;
      }
    } catch (e) {}

    return false;
  };

  const isTodaySession = (app) => {
    if (!app.date) return false;
    const today = new Date();
    const [y, m, d] = String(app.date).split('-').map(Number);
    if (!y || !m || !d) return false;
    return (
      today.getFullYear() === y &&
      today.getMonth() + 1 === m &&
      today.getDate() === d
    );
  };

  // KPI Metrics
  const metrics = useMemo(() => {
    const todayCount = appointments.filter(isTodaySession).length;
    const needsActionCount = appointments.filter(isNeedsAction).length;
    const rescheduleCount = appointments.filter(a => a.rescheduleRequested || a.rescheduleRequest?.status === 'PENDING').length;
    const totalCollected = appointments
      .filter(a => a.paymentStatus === 'Paid')
      .reduce((sum, a) => sum + (Number(a.amount) || 5000), 0);

    return {
      needsAction: needsActionCount,
      today: todayCount,
      reschedule: rescheduleCount,
      collected: totalCollected
    };
  }, [appointments]);

  // Grouped Clients
  const clientsMap = useMemo(() => {
    const map = new Map();
    appointments.forEach(app => {
      const email = (app.email || app.userId?.email || 'unknown@client.com').toLowerCase().trim();
      if (!map.has(email)) {
        map.set(email, {
          name: app.name || app.userId?.name || 'Anonymous Client',
          email,
          phone: app.phoneNumber ? `${app.countryCode || ''} ${app.phoneNumber}`.trim() : (app.phone || app.userId?.phone || ''),
          appointments: [],
          totalPaid: 0,
          joined: app.createdAt || app.date
        });
      }
      const client = map.get(email);
      client.appointments.push(app);
      if (app.paymentStatus === 'Paid') {
        client.totalPaid += Number(app.amount) || 5000;
      }
    });
    return Array.from(map.values());
  }, [appointments]);

  // Filtered Appointments
  const filteredAppointments = useMemo(() => {
    return appointments.filter(app => {
      // Tab filter
      const s = (app.status || '').toUpperCase();
      if (activeTab === 'needs-action' && !isNeedsAction(app)) return false;
      if (activeTab === 'today' && !isTodaySession(app)) return false;
      if (activeTab === 'upcoming') {
        if (s === 'COMPLETED' || s === 'REFUNDED' || isTodaySession(app)) return false;
      }
      if (activeTab === 'past' && s !== 'COMPLETED') return false;
      if (activeTab === 'refunded' && s !== 'REFUNDED') return false;

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchName = (app.name || '').toLowerCase().includes(q);
        const matchEmail = (app.email || '').toLowerCase().includes(q);
        const matchPhone = (app.phoneNumber || app.phone || '').includes(q);
        if (!matchName && !matchEmail && !matchPhone) return false;
      }

      // Popover filters
      if (filters.paymentStatus && app.paymentStatus !== filters.paymentStatus) return false;
      if (filters.rescheduleStatus) {
        const hasReschedule = app.rescheduleRequested || app.rescheduleRequest?.status === 'PENDING';
        if (filters.rescheduleStatus === 'Requested' && !hasReschedule) return false;
        if (filters.rescheduleStatus === 'None' && hasReschedule) return false;
      }
      if (filters.accountType) {
        if (filters.accountType === 'free' && !app.isFreeSession) return false;
        if (filters.accountType === 'paid' && app.isFreeSession) return false;
      }

      return true;
    });
  }, [appointments, activeTab, searchQuery, filters]);

  // Save Fees
  const handleSaveFees = async () => {
    setSavingFees(true);
    try {
      const token = localStorage.getItem('adminToken');
      const res = await fetch(`${API_URL}/api/appointments/fees`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(fees)
      });
      if (!res.ok) throw new Error('Failed to update fees');
      setFeeDirty(false);
      showSuccess('Coaching fee settings updated successfully!');
    } catch (err) {
      console.error(err);
      showError('Failed to save fee settings.');
    } finally {
      setSavingFees(false);
    }
  };

  // Status Actions
  const handleStatusChange = async (appId, newStatus) => {
    try {
      const token = localStorage.getItem('adminToken');
      const normalizedStatus = (newStatus || '').toUpperCase();
      const res = await fetch(`${API_URL}/api/appointments/admin/${appId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ status: normalizedStatus })
      });
      if (!res.ok) throw new Error('Status update failed');
      showSuccess(`Appointment marked as ${normalizedStatus === 'COMPLETED' ? 'Completed' : normalizedStatus}`);
      fetchData();
      if (selectedAppointment?._id === appId) {
        setSelectedAppointment(prev => ({ ...prev, status: normalizedStatus }));
      }
    } catch (err) {
      showError('Failed to update appointment status.');
    }
  };

  // Reschedule Action
  const handleRescheduleAction = async (appId, action) => {
    try {
      const token = localStorage.getItem('adminToken');
      const res = await fetch(`${API_URL}/api/appointments/${appId}/reschedule-admin`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ action }) // 'approve' | 'decline'
      });
      if (!res.ok) throw new Error('Reschedule action failed');
      showSuccess(`Reschedule request ${action}d successfully`);
      fetchData();
      if (selectedAppointment?._id === appId) {
        setSelectedAppointment(prev => ({
          ...prev,
          rescheduleRequested: false,
          rescheduleStatus: action === 'approve' ? 'Approved' : 'Declined'
        }));
      }
    } catch (err) {
      showError(`Failed to ${action} reschedule request.`);
    }
  };

  // Emergency Refund
  const handleProcessRefund = async () => {
    if (!selectedAppointment?._id) return;
    setProcessingRefund(true);
    try {
      const token = localStorage.getItem('adminToken');
      const res = await fetch(`${API_URL}/api/appointments/manual-refund`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          appointmentId: selectedAppointment._id,
          amount: Number(refundAmount) || Number(selectedAppointment.amount) || 5000,
          reason: refundReason || 'Emergency refund requested by coach'
        })
      });

      if (!res.ok) throw new Error('Refund failed');
      showSuccess('Refund issued successfully');
      setRefundModalOpen(false);
      fetchData();
      if (selectedAppointment) {
        setSelectedAppointment(prev => ({ ...prev, status: 'Refunded', paymentStatus: 'Refunded' }));
      }
    } catch (err) {
      showError('Failed to process refund. Check server logs.');
    } finally {
      setProcessingRefund(false);
    }
  };

  // Save Coach Notes (Manual or Autosave)
  const saveCoachNotes = async (textToSave) => {
    if (!selectedAppointment?._id) return;
    clearTimeout(notesTimerRef.current);
    setNotesSaveStatus('saving');
    try {
      const token = localStorage.getItem('adminToken');
      const res = await fetch(`${API_URL}/api/appointments/admin/${selectedAppointment._id}/notes`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        body: JSON.stringify({
          notes: textToSave,
          coachNotes: textToSave
        })
      });

      if (res.ok) {
        setNotesSaveStatus('saved');
        // Update selectedAppointment and appointments list in local state
        setSelectedAppointment(prev => prev ? { ...prev, coachNotes: textToSave, notes: textToSave } : prev);
        setAppointments(prev => prev.map(a => a._id === selectedAppointment._id ? { ...a, coachNotes: textToSave, notes: textToSave } : a));
      } else {
        setNotesSaveStatus('dirty');
      }
    } catch (err) {
      console.error('Failed to save coach notes:', err);
      setNotesSaveStatus('dirty');
    }
  };

  // Coach Notes Autosave on keystroke
  const handleNotesChange = (text) => {
    setCoachNotes(text);
    setNotesSaveStatus('dirty');
    clearTimeout(notesTimerRef.current);
    notesTimerRef.current = setTimeout(() => {
      saveCoachNotes(text);
    }, 600);
  };

  // Open Appointment inside drawer
  const openAppointmentDetail = (app) => {
    setSelectedAppointment(app);
    setCoachNotes(app.coachNotes || app.notes || '');
    setNotesSaveStatus('saved');
    setDetailTab('overview');
  };

  // Open Client Drawer
  const openClientDrawer = (client) => {
    setSelectedClient(client);
    setSelectedAppointment(null);
  };

  return (
    <div className="w-full">
      {/* Subtabs Bar */}
      <div className="bwa-subtabs">
        <button
          type="button"
          className={viewMode === 'appointments' ? 'on' : ''}
          onClick={() => setViewMode('appointments')}
        >
          All appointments
        </button>
        <button
          type="button"
          className={viewMode === 'clients' ? 'on' : ''}
          onClick={() => setViewMode('clients')}
        >
          By client
        </button>
        <button
          type="button"
          className={viewMode === 'fees' ? 'on' : ''}
          onClick={() => setViewMode('fees')}
        >
          Fee settings
        </button>
      </div>

      <div className="p-6 md:p-8 max-w-[1500px] mx-auto">
        {/* VIEW 1 & 2: Appointments / Clients */}
        {viewMode !== 'fees' ? (
          <div>
            {/* 4 Clickable KPI Cards */}
            <div className="bwa-stats" style={{ gridTemplateColumns: 'repeat(4, 1fr)', marginBottom: '24px' }}>
              <div
                className={`bwa-stat ${activeTab === 'needs-action' ? 'active' : ''}`}
                onClick={() => setActiveTab('needs-action')}
                role="button"
                tabIndex={0}
              >
                <b style={{ color: metrics.needsAction > 0 ? 'var(--accent)' : 'inherit' }}>
                  {metrics.needsAction}
                </b>
                <span>Need your action</span>
              </div>

              <div
                className={`bwa-stat ${activeTab === 'today' ? 'active' : ''}`}
                onClick={() => setActiveTab('today')}
                role="button"
                tabIndex={0}
              >
                <b>{metrics.today}</b>
                <span>Sessions today</span>
              </div>

              <div
                className={`bwa-stat ${activeTab === 'needs-action' ? 'active' : ''}`}
                onClick={() => {
                  setActiveTab('needs-action');
                  setFilters(p => ({ ...p, rescheduleStatus: 'Requested' }));
                }}
                role="button"
                tabIndex={0}
              >
                <b style={{ color: metrics.reschedule > 0 ? 'var(--amber)' : 'inherit' }}>
                  {metrics.reschedule}
                </b>
                <span>Reschedule requests</span>
              </div>

              <div className="bwa-stat">
                <b>{inr(metrics.collected)}</b>
                <span>Collected revenue</span>
              </div>
            </div>

            {/* Filter Tabs with Live Counts */}
            <div className="bwa-row" style={{ marginBottom: '16px' }}>
              <div className="bwa-seg">
                {[
                  ['all', `All (${appointments.length})`],
                  ['needs-action', `Needs action (${metrics.needsAction})`],
                  ['today', `Today (${metrics.today})`],
                  ['upcoming', 'Upcoming'],
                  ['past', 'Past'],
                  ['refunded', 'Refunded']
                ].map(([tabId, label]) => (
                  <button
                    key={tabId}
                    type="button"
                    className={activeTab === tabId ? 'on' : ''}
                    onClick={() => setActiveTab(tabId)}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>

            {/* Search & Filters Toolbar */}
            <div className="bwa-tools" style={{ marginBottom: '20px' }}>
              <div className="s">
                <input
                  type="search"
                  placeholder="Search by client name, email, or phone..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>

              <div style={{ position: 'relative' }}>
                <button
                  type="button"
                  className={`bwa-btn sm ${Object.values(filters).some(Boolean) ? 'pri' : ''}`}
                  onClick={() => setFilterPopoverOpen(!filterPopoverOpen)}
                >
                  <Icon name="filter" size={14} />
                  <span>Filters</span>
                  {Object.values(filters).filter(Boolean).length > 0 && (
                    <span className="bwa-chip n" style={{ padding: '1px 6px', fontSize: '11px' }}>
                      {Object.values(filters).filter(Boolean).length}
                    </span>
                  )}
                </button>

                {filterPopoverOpen && (
                  <div
                    className="bwa-card"
                    style={{
                      position: 'absolute',
                      right: 0,
                      top: '42px',
                      zIndex: 40,
                      width: '320px',
                      boxShadow: '0 10px 30px rgba(60,40,20,0.15)',
                      padding: '16px'
                    }}
                  >
                    <div className="bwa-row" style={{ marginBottom: '12px' }}>
                      <b style={{ fontSize: '14px' }}>Filter appointments</b>
                      <button
                        type="button"
                        className="bwa-btn sm"
                        onClick={() => {
                          setFilters({ paymentStatus: '', rescheduleStatus: '', accountType: '', bookingType: '', dateRange: '' });
                          setFilterPopoverOpen(false);
                        }}
                      >
                        Clear all
                      </button>
                    </div>

                    <div className="bwa-f">
                      <label>Payment status</label>
                      <select
                        value={filters.paymentStatus}
                        onChange={(e) => setFilters(p => ({ ...p, paymentStatus: e.target.value }))}
                      >
                        <option value="">All payment statuses</option>
                        <option value="Paid">Paid</option>
                        <option value="Pending">Pending</option>
                        <option value="Refunded">Refunded</option>
                      </select>
                    </div>

                    <div className="bwa-f">
                      <label>Reschedule status</label>
                      <select
                        value={filters.rescheduleStatus}
                        onChange={(e) => setFilters(p => ({ ...p, rescheduleStatus: e.target.value }))}
                      >
                        <option value="">All</option>
                        <option value="Requested">Reschedule requested</option>
                        <option value="None">No reschedule</option>
                      </select>
                    </div>

                    <div className="bwa-f">
                      <label>Session type</label>
                      <select
                        value={filters.accountType}
                        onChange={(e) => setFilters(p => ({ ...p, accountType: e.target.value }))}
                      >
                        <option value="">All session types</option>
                        <option value="paid">Paid 1-on-1 session</option>
                        <option value="free">Course free 1-on-1 session</option>
                      </select>
                    </div>

                    <button
                      type="button"
                      className="bwa-btn pri sm"
                      style={{ width: '100%', marginTop: '8px', justifyContent: 'center' }}
                      onClick={() => setFilterPopoverOpen(false)}
                    >
                      Apply filters
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Active filter chips */}
            {Object.values(filters).some(Boolean) && (
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '16px', alignItems: 'center' }}>
                <span style={{ color: 'var(--muted)', fontSize: '12.5px' }}>Active filters:</span>
                {filters.paymentStatus && (
                  <span className="bwa-chip b">
                    Payment: {filters.paymentStatus}
                    <button type="button" onClick={() => setFilters(p => ({ ...p, paymentStatus: '' }))}>×</button>
                  </span>
                )}
                {filters.rescheduleStatus && (
                  <span className="bwa-chip a">
                    Reschedule: {filters.rescheduleStatus}
                    <button type="button" onClick={() => setFilters(p => ({ ...p, rescheduleStatus: '' }))}>×</button>
                  </span>
                )}
                {filters.accountType && (
                  <span className="bwa-chip g">
                    Type: {filters.accountType}
                    <button type="button" onClick={() => setFilters(p => ({ ...p, accountType: '' }))}>×</button>
                  </span>
                )}
                <button
                  type="button"
                  style={{ background: 'none', border: 0, color: 'var(--accent)', fontSize: '12.5px', textDecoration: 'underline', cursor: 'pointer' }}
                  onClick={() => setFilters({ paymentStatus: '', rescheduleStatus: '', accountType: '', bookingType: '', dateRange: '' })}
                >
                  Clear all
                </button>
              </div>
            )}

            {/* TABLE / LIST VIEW */}
            {viewMode === 'appointments' ? (
              <div className="bwa-table-container">
                <table className="bwa-table">
                  <thead>
                    <tr>
                      <th>Client</th>
                      <th>Date &amp; Time</th>
                      <th>Type &amp; Duration</th>
                      <th>Status</th>
                      <th>Payment</th>
                      <th style={{ textAlign: 'right' }}>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredAppointments.length === 0 ? (
                      <tr>
                        <td colSpan={6} style={{ textAlign: 'center', padding: '40px', color: 'var(--muted)' }}>
                          <b>No appointments found</b>
                          <p style={{ margin: '4px 0 0', fontSize: '13px' }}>Try adjusting your filters or search term.</p>
                        </td>
                      </tr>
                    ) : (
                      filteredAppointments.map(app => {
                        const needsAction = isNeedsAction(app);
                        const isFree = app.isFreeSession;

                        return (
                          <tr
                            key={app._id}
                            className={`clickable ${needsAction ? 'needs-action' : ''}`}
                            onClick={() => openAppointmentDetail(app)}
                          >
                            <td>
                              <b>{app.name || 'Anonymous Client'}</b>
                              <div style={{ color: 'var(--muted)', fontSize: '12px' }}>
                                {app.email} · {app.phoneNumber ? `${app.countryCode ? app.countryCode + ' ' : ''}${app.phoneNumber}` : (app.phone || app.userId?.phoneNumber || app.userId?.phone || 'No phone')}
                              </div>
                            </td>
                            <td>
                              <div><b>{app.date}</b></div>
                              <div style={{ color: 'var(--muted)', fontSize: '12.5px' }}>
                                {app.rescheduleRequested ? (
                                  <span style={{ color: 'var(--amber)', fontWeight: 600 }}>
                                    {app.time} → {app.requestedTime || 'New slot'}
                                  </span>
                                ) : (
                                  app.time
                                )}
                              </div>
                            </td>
                            <td>
                              <span>{app.duration || 60} mins</span>
                              <div>
                                <small style={{ color: 'var(--muted)' }}>
                                  {isFree ? 'Course Free Session' : 'Standard 1-on-1'}
                                </small>
                              </div>
                            </td>
                            <td>
                              {app.rescheduleRequested ? (
                                <span className="bwa-chip a">Reschedule Pending</span>
                              ) : (app.status || '').toUpperCase() === 'COMPLETED' ? (
                                <span className="bwa-chip g">Completed</span>
                              ) : (app.status || '').toUpperCase() === 'REFUNDED' ? (
                                <span className="bwa-chip r">Refunded</span>
                              ) : isTodaySession(app) ? (
                                <span className="bwa-chip b">Today</span>
                              ) : (
                                <span className="bwa-chip n">{(app.status || 'Upcoming').toUpperCase() === 'UPCOMING' ? 'Upcoming' : app.status}</span>
                              )}
                            </td>
                            <td>
                              {isFree ? (
                                <span className="bwa-chip b">Included in Course</span>
                              ) : app.paymentStatus === 'Paid' ? (
                                <span className="bwa-chip g">{inr(app.amount || 5000)} Paid</span>
                              ) : (
                                <span className="bwa-chip a">Pending</span>
                              )}
                            </td>
                            <td style={{ textAlign: 'right' }}>
                              <button
                                type="button"
                                className="bwa-btn sm"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  openAppointmentDetail(app);
                                }}
                              >
                                View detail
                              </button>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            ) : (
              /* By Client View */
              <div className="bwa-table-container">
                <table className="bwa-table">
                  <thead>
                    <tr>
                      <th>Client Name</th>
                      <th>Contact</th>
                      <th>Total Sessions</th>
                      <th>Total Paid</th>
                      <th>Joined</th>
                      <th style={{ textAlign: 'right' }}>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {clientsMap.length === 0 ? (
                      <tr>
                        <td colSpan={6} style={{ textAlign: 'center', padding: '40px', color: 'var(--muted)' }}>
                          No clients found
                        </td>
                      </tr>
                    ) : (
                      clientsMap.map(c => (
                        <tr
                          key={c.email}
                          className="clickable"
                          onClick={() => openClientDrawer(c)}
                        >
                          <td>
                            <b>{c.name}</b>
                          </td>
                          <td>
                            <div>{c.email}</div>
                            <small style={{ color: 'var(--muted)' }}>{c.phone || c.phoneNumber || 'No phone'}</small>
                          </td>
                          <td>
                            <span className="bwa-chip n">{c.appointments.length} sessions</span>
                          </td>
                          <td>
                            <b>{inr(c.totalPaid)}</b>
                          </td>
                          <td>
                            <span style={{ color: 'var(--muted)' }}>{String(c.joined).slice(0, 10)}</span>
                          </td>
                          <td style={{ textAlign: 'right' }}>
                            <button
                              type="button"
                              className="bwa-btn sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                openClientDrawer(c);
                              }}
                            >
                              Client profile
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        ) : (
          /* VIEW 3: Fee Settings */
          <div className="bwa-card" style={{ maxWidth: '640px' }}>
            <h3>Coaching session fee settings</h3>
            <p className="sub">Set the default rates charged for 1-on-1 coaching bookings on the website.</p>

            <div className="bwa-f">
              <label>60-Minute session fee</label>
              <div className="bwa-pre">
                <b>₹</b>
                <input
                  type="number"
                  min={0}
                  value={fees.fee60min}
                  onChange={(e) => {
                    setFees(p => ({ ...p, fee60min: Number(e.target.value) || 0 }));
                    setFeeDirty(true);
                  }}
                />
              </div>
              <div className="hint">Standard introductory coaching session.</div>
            </div>

            <div className="bwa-f">
              <label>90-Minute session fee</label>
              <div className="bwa-pre">
                <b>₹</b>
                <input
                  type="number"
                  min={0}
                  value={fees.fee90min}
                  onChange={(e) => {
                    setFees(p => ({ ...p, fee90min: Number(e.target.value) || 0 }));
                    setFeeDirty(true);
                  }}
                />
              </div>
              <div className="hint">Deep-dive breakthrough coaching session.</div>
            </div>

            <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'flex-end' }}>
              <button
                type="button"
                className="bwa-btn pri"
                disabled={!feeDirty || savingFees}
                onClick={handleSaveFees}
              >
                {savingFees ? 'Saving...' : 'Save fee settings'}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* CLIENT SLIDE DRAWER (640px) */}
      <AdminDrawer
        isOpen={!!selectedClient && !selectedAppointment}
        onClose={() => setSelectedClient(null)}
        title={selectedClient?.name || 'Client Profile'}
        subtitle={selectedClient?.email}
        footer={
          <button
            type="button"
            className="bwa-btn"
            onClick={() => setSelectedClient(null)}
          >
            Close
          </button>
        }
      >
        {selectedClient && (
          <div>
            {/* Quick Contact Bar */}
            <div className="bwa-card" style={{ padding: '14px 16px', marginBottom: '16px' }}>
              <div className="bwa-row">
                <div>
                  <b style={{ display: 'block', fontSize: '15px' }}>{selectedClient.name}</b>
                  <span style={{ color: 'var(--muted)', fontSize: '13px' }}>{selectedClient.email}</span>
                </div>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <a
                    href={`mailto:${selectedClient.email}`}
                    className="bwa-btn sm"
                    target="_blank"
                    rel="noreferrer"
                  >
                    <Icon name="mail" size={14} /> Email
                  </a>
                  {selectedClient.phone && (
                    <a
                      href={`https://wa.me/${selectedClient.phone.replace(/\D/g, '')}`}
                      className="bwa-btn sm"
                      target="_blank"
                      rel="noreferrer"
                      style={{ color: 'var(--green)' }}
                    >
                      <Icon name="whatsapp" size={14} /> WhatsApp
                    </a>
                  )}
                </div>
              </div>
            </div>

            {/* Client Stats */}
            <div className="bwa-stats" style={{ gridTemplateColumns: 'repeat(3, 1fr)', marginBottom: '20px' }}>
              <div className="bwa-stat">
                <b>{selectedClient.appointments.length}</b>
                <span>Sessions</span>
              </div>
              <div className="bwa-stat">
                <b>{inr(selectedClient.totalPaid)}</b>
                <span>Total paid</span>
              </div>
              <div className="bwa-stat">
                <b style={{ fontSize: '18px' }}>{String(selectedClient.joined).slice(0, 10)}</b>
                <span>Client since</span>
              </div>
            </div>

            {/* Session History */}
            <h3 style={{ fontSize: '17px', margin: '0 0 12px' }}>Session history</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {selectedClient.appointments.map(app => (
                <div
                  key={app._id}
                  className="bwa-card"
                  style={{ padding: '14px', marginBottom: '8px', cursor: 'pointer' }}
                  onClick={() => openAppointmentDetail(app)}
                >
                  <div className="bwa-row">
                    <div>
                      <b>{app.date} at {app.time}</b>
                      <div style={{ color: 'var(--muted)', fontSize: '12.5px' }}>
                        {app.duration || 60} min · {app.isFreeSession ? 'Course Session' : inr(app.amount || 5000)}
                      </div>
                    </div>
                    <div>
                      {app.status === 'Completed' ? (
                        <span className="bwa-chip g">Completed</span>
                      ) : app.status === 'Refunded' ? (
                        <span className="bwa-chip r">Refunded</span>
                      ) : (
                        <span className="bwa-chip b">{app.status || 'Upcoming'}</span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </AdminDrawer>

      {/* APPOINTMENT DETAIL DRAWER (inside slide) */}
      <AdminDrawer
        isOpen={!!selectedAppointment}
        onClose={() => setSelectedAppointment(null)}
        title={selectedAppointment ? `Appointment with ${selectedAppointment.name}` : 'Appointment Detail'}
        subtitle={selectedAppointment ? `${selectedAppointment.date} at ${selectedAppointment.time}` : ''}
        footer={
          <div className="bwa-row" style={{ width: '100%' }}>
            {selectedClient && (
              <button
                type="button"
                className="bwa-btn sm"
                onClick={() => setSelectedAppointment(null)}
              >
                ‹ Back to client
              </button>
            )}
            <div style={{ display: 'flex', gap: '8px', marginLeft: 'auto' }}>
              {(selectedAppointment?.status || '').toUpperCase() !== 'COMPLETED' && (
                <button
                  type="button"
                  className="bwa-btn pri sm"
                  onClick={() => handleStatusChange(selectedAppointment._id, 'COMPLETED')}
                >
                  Mark completed
                </button>
              )}
              <button
                type="button"
                className="bwa-btn sm"
                onClick={() => setSelectedAppointment(null)}
              >
                Close
              </button>
            </div>
          </div>
        }
      >
        {selectedAppointment && (
          <div>
            {/* Detail Tabs */}
            <div className="bwa-seg" style={{ width: '100%', marginBottom: '18px' }}>
              {[
                ['overview', 'Overview'],
                ['reschedule', 'Reschedule'],
                ['answers', 'Client answers'],
                ['notes', 'Coach notes']
              ].map(([tId, label]) => (
                <button
                  key={tId}
                  type="button"
                  style={{ flex: 1, justifyContent: 'center' }}
                  className={detailTab === tId ? 'on' : ''}
                  onClick={() => setDetailTab(tId)}
                >
                  {label}
                </button>
              ))}
            </div>

            {/* TAB 1: Overview */}
            {detailTab === 'overview' && (
              <div>
                {isNeedsAction(selectedAppointment) && (
                  <div className="bwa-banner">
                    <span style={{ color: 'var(--amber)' }}><Icon name="alert" size={18} /></span>
                    <div>
                      <b>Action required</b>
                      <span>
                        {selectedAppointment.rescheduleRequested
                          ? 'Client requested a reschedule. Review and approve or decline in the Reschedule tab.'
                          : 'This session date has passed without being marked Completed.'}
                      </span>
                    </div>
                  </div>
                )}

                <div className="bwa-card">
                  <h3>Client information</h3>
                  <p className="sub">Contact and intake reference.</p>
                  <div className="bwa-grid2">
                    <div>
                      <span style={{ color: 'var(--muted)', fontSize: '12px', display: 'block' }}>Name</span>
                      <b>{selectedAppointment.name}</b>
                    </div>
                    <div>
                      <span style={{ color: 'var(--muted)', fontSize: '12px', display: 'block' }}>Email</span>
                      <b>{selectedAppointment.email}</b>
                    </div>
                    <div>
                      <span style={{ color: 'var(--muted)', fontSize: '12px', display: 'block' }}>Phone</span>
                      <b>{selectedAppointment.phoneNumber ? `${selectedAppointment.countryCode ? selectedAppointment.countryCode + ' ' : ''}${selectedAppointment.phoneNumber}`.trim() : (selectedAppointment.phone || selectedAppointment.userId?.phoneNumber || selectedAppointment.userId?.phone || '—')}</b>
                    </div>
                    <div>
                      <span style={{ color: 'var(--muted)', fontSize: '12px', display: 'block' }}>Session Duration</span>
                      <b>{selectedAppointment.duration || 60} Minutes</b>
                    </div>
                  </div>
                </div>

                <div className="bwa-card">
                  <h3>Payment breakdown</h3>
                  <p className="sub">Razorpay transaction record.</p>
                  <div className="bwa-calc" style={{ marginTop: 0 }}>
                    <div>
                      <span>Session fee</span>
                      <span>{selectedAppointment.isFreeSession ? '₹0 (Course Free)' : inr(selectedAppointment.amount || 5000)}</span>
                    </div>
                    {selectedAppointment.rescheduleFee > 0 && (
                      <div>
                        <span>Reschedule fee</span>
                        <span>{inr(selectedAppointment.rescheduleFee)}</span>
                      </div>
                    )}
                    {selectedAppointment.rescheduleRequest?.usedFreeSessionCredit && (
                      <div>
                        <span>Reschedule</span>
                        <span style={{ color: 'var(--green)', fontWeight: 600 }}>1 Free Credit Used (₹0)</span>
                      </div>
                    )}
                    <div className="tot">
                      <span>Total</span>
                      <span>{selectedAppointment.isFreeSession ? '₹0' : inr(selectedAppointment.amount || 5000)}</span>
                    </div>
                  </div>

                  <div style={{ marginTop: '12px', fontSize: '12.5px', color: 'var(--muted)' }}>
                    Payment ID: <code style={{ fontFamily: 'var(--mono)', background: 'var(--grey-s)', padding: '2px 6px', borderRadius: '4px' }}>
                      {selectedAppointment.razorpayPaymentId || selectedAppointment.paymentId || 'N/A (Free Call)'}
                    </code>
                  </div>
                </div>

                {/* Red Danger Zone: Emergency Refund */}
                <div className="bwa-card" style={{ borderColor: '#E3A9A3', background: '#FFFDFD' }}>
                  <h3 style={{ color: 'var(--red)' }}>Danger zone: Emergency refund</h3>
                  <p className="sub">Refund payment directly back to client's original method via Razorpay.</p>

                  <button
                    type="button"
                    className="bwa-btn danger sm"
                    onClick={() => {
                      setRefundAmount(String(selectedAppointment.amount || 5000));
                      setRefundReason('Client emergency cancellation');
                      setRefundModalOpen(true);
                    }}
                  >
                    Initiate emergency refund
                  </button>
                </div>
              </div>
            )}

            {/* TAB 2: Reschedule */}
            {detailTab === 'reschedule' && (
              <div>
                <div className="bwa-card">
                  <h3>Reschedule timeline</h3>
                  <p className="sub">Review requested and confirmed schedule changes.</p>

                  {(selectedAppointment.rescheduleRequested || selectedAppointment.rescheduleRequest?.status === 'PENDING') ? (
                    <div style={{ background: 'var(--amber-s)', border: '1px solid #EBCB85', borderRadius: '12px', padding: '16px', marginBottom: '16px' }}>
                      <div style={{ fontSize: '13px', color: 'var(--amber)', fontWeight: 700, marginBottom: '6px' }}>
                        RESCHEDULE REQUESTED
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '15px' }}>
                        <div>
                          <small style={{ color: 'var(--muted)', display: 'block' }}>Original slot</small>
                          <b>{selectedAppointment.date} at {selectedAppointment.time}</b>
                        </div>
                        <span style={{ fontSize: '20px' }}>→</span>
                        <div>
                          <small style={{ color: 'var(--muted)', display: 'block' }}>Requested slot</small>
                          <b style={{ color: 'var(--accent)' }}>
                            {selectedAppointment.rescheduleRequest?.date || selectedAppointment.requestedDate || selectedAppointment.date} at {selectedAppointment.rescheduleRequest?.time || selectedAppointment.requestedTime || '—'}
                          </b>
                        </div>
                      </div>

                      {(selectedAppointment.rescheduleRequest?.reason || selectedAppointment.rescheduleReason) && (
                        <p style={{ margin: '10px 0 0', fontSize: '13px', color: '#5b4d43' }}>
                          <b>Reason:</b> {selectedAppointment.rescheduleRequest?.reason || selectedAppointment.rescheduleReason}
                        </p>
                      )}

                      {selectedAppointment.rescheduleRequest?.isWithin48Hours && (
                        <div style={{ marginTop: '8px', fontSize: '12px', color: 'var(--amber)', fontWeight: 600 }}>
                          ⚠ Request was made within 48 hours of the session
                        </div>
                      )}

                      <div style={{ display: 'flex', gap: '8px', marginTop: '16px' }}>
                        <button
                          type="button"
                          className="bwa-btn pri sm"
                          onClick={() => handleRescheduleAction(selectedAppointment._id, 'approve')}
                        >
                          Approve reschedule
                        </button>
                        <button
                          type="button"
                          className="bwa-btn danger sm"
                          onClick={() => handleRescheduleAction(selectedAppointment._id, 'decline')}
                        >
                          Decline request
                        </button>
                      </div>
                    </div>
                  ) : selectedAppointment.rescheduleRequest?.status === 'APPROVED' || selectedAppointment.rescheduleRequest?.usedFreeSessionCredit || selectedAppointment.rescheduleRequest?.rescheduleFeePaid ? (
                    <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '12px', padding: '16px', marginBottom: '16px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
                        <span style={{ fontSize: '12px', color: '#166534', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                          ✓ Reschedule Confirmed &amp; Active
                        </span>
                        <span style={{ fontSize: '11px', background: '#dcfce7', color: '#15803d', padding: '2px 8px', borderRadius: '12px', fontWeight: 600 }}>
                          {selectedAppointment.rescheduleRequest?.usedFreeSessionCredit
                            ? 'Free Credit Used'
                            : selectedAppointment.rescheduleRequest?.rescheduleFeePaid
                              ? 'Paid Reschedule'
                              : 'Standard / Approved'}
                        </span>
                      </div>

                      <div style={{ fontSize: '14.5px', color: '#1f2937', marginBottom: '8px' }}>
                        <small style={{ color: '#6b7280', display: 'block', fontSize: '12px' }}>Confirmed Slot</small>
                        <b style={{ color: '#111010', fontSize: '16px' }}>
                          {selectedAppointment.rescheduleRequest?.date || selectedAppointment.date} at {selectedAppointment.rescheduleRequest?.time || selectedAppointment.time}
                        </b>
                      </div>

                      {selectedAppointment.rescheduleRequest?.usedFreeSessionCredit && (
                        <div style={{ marginTop: '8px', fontSize: '12.5px', color: '#15803d', fontWeight: 600, background: '#ffffff', border: '1px solid #bbf7d0', borderRadius: '8px', padding: '8px 12px' }}>
                          ✨ 1 Complimentary Course Session Credit was consumed (₹0 Fee)
                        </div>
                      )}

                      {selectedAppointment.rescheduleRequest?.rescheduleFeePaid && (
                        <div style={{ marginTop: '8px', fontSize: '12.5px', color: '#9a3412', background: '#fff7ed', border: '1px solid #ffedd5', borderRadius: '8px', padding: '8px 12px' }}>
                          💳 Late Reschedule Fee Paid: <b>₹{Number(selectedAppointment.rescheduleRequest?.rescheduleAmount || 5000).toLocaleString('en-IN')}</b>
                          {selectedAppointment.rescheduleRequest?.reschedulePaymentId && (
                            <div style={{ fontSize: '11.5px', color: '#7c2d12', marginTop: '2px', fontFamily: 'monospace' }}>
                              Payment ID: {selectedAppointment.rescheduleRequest.reschedulePaymentId}
                            </div>
                          )}
                        </div>
                      )}

                      <div style={{ marginTop: '10px', background: '#ffffff', border: '1px solid #d1fae5', borderRadius: '8px', padding: '10px 14px' }}>
                        <div style={{ fontSize: '11px', color: '#047857', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 700, marginBottom: '3px' }}>
                          Reason for Reschedule
                        </div>
                        <div style={{ fontSize: '13.5px', color: '#1f2937', lineHeight: '1.4' }}>
                          {selectedAppointment.rescheduleRequest?.reason || selectedAppointment.rescheduleReason || (
                            <span style={{ color: '#9ca3af', fontStyle: 'italic' }}>No reason specified</span>
                          )}
                        </div>
                      </div>

                      {selectedAppointment.rescheduleRequest?.paidAt && (
                        <div style={{ marginTop: '8px', fontSize: '11.5px', color: '#6b7280' }}>
                          Rescheduled on: {new Date(selectedAppointment.rescheduleRequest.paidAt).toLocaleString('en-IN')}
                        </div>
                      )}
                    </div>
                  ) : selectedAppointment.rescheduleRequest?.status === 'REJECTED' ? (
                    <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '12px', padding: '16px', marginBottom: '16px' }}>
                      <div style={{ fontSize: '13px', color: '#b91c1c', fontWeight: 700, marginBottom: '4px' }}>
                        ✕ RESCHEDULE REQUEST DECLINED
                      </div>
                      <p style={{ margin: 0, fontSize: '13px', color: '#7f1d1d' }}>
                        The reschedule request for this appointment was declined.
                      </p>
                    </div>
                  ) : (
                    <p style={{ color: 'var(--muted)', fontSize: '13.5px' }}>
                      No reschedule history for this appointment.
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* TAB 3: Client Answers */}
            {detailTab === 'answers' && (
              <div className="bwa-card">
                <h3>Intake questionnaire</h3>
                <p className="sub">Form answers submitted during booking.</p>

                {/* Check if any intake data exists */}
                {(() => {
                  const qa = selectedAppointment.questionnaireAnswers;
                  const hasQA = Array.isArray(qa) ? qa.length > 0 : (qa && Object.keys(qa).length > 0);
                  const hasAny = selectedAppointment.reason || selectedAppointment.source || selectedAppointment.extra || hasQA;
                  return !hasAny;
                })() ? (
                  <p style={{ color: 'var(--muted)', fontSize: '13.5px' }}>
                    No intake questionnaire submitted for this booking.
                  </p>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>

                    {/* Source: How did they hear about Aarkesh */}
                    {selectedAppointment.source && (() => {
                      const sourceMap = { social: 'Social Media', referral: 'Referral', search: 'Search Engine', other: 'Other' };
                      const raw = selectedAppointment.source;
                      // Handle "Other: YouTube" format (free text stored inline)
                      const displaySource = raw.startsWith('Other: ')
                        ? raw
                        : (sourceMap[raw] || raw);
                      return (
                        <div style={{ borderBottom: '1px solid var(--line2)', paddingBottom: '14px' }}>
                          <span style={{ fontSize: '11px', color: 'var(--muted)', fontWeight: 700, display: 'block', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '6px' }}>
                            How did they hear about Aarkesh?
                          </span>
                          <p style={{ margin: 0, fontSize: '14.5px', color: 'var(--ink)', lineHeight: 1.5 }}>
                            {displaySource}
                          </p>
                        </div>
                      );
                    })()}

                    {/* Reason: What brings them here */}
                    {selectedAppointment.reason && (
                      <div style={{ borderBottom: '1px solid var(--line2)', paddingBottom: '14px' }}>
                        <span style={{ fontSize: '11px', color: 'var(--muted)', fontWeight: 700, display: 'block', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '6px' }}>
                          What brings them here?
                        </span>
                        <p style={{ margin: 0, fontSize: '14.5px', color: 'var(--ink)', lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>
                          {selectedAppointment.reason}
                        </p>
                      </div>
                    )}

                    {/* Extra: Anything else */}
                    {selectedAppointment.extra && (
                      <div style={{ borderBottom: '1px solid var(--line2)', paddingBottom: '14px' }}>
                        <span style={{ fontSize: '11px', color: 'var(--muted)', fontWeight: 700, display: 'block', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '6px' }}>
                          Anything else they shared
                        </span>
                        <p style={{ margin: 0, fontSize: '14.5px', color: 'var(--ink)', lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>
                          {selectedAppointment.extra}
                        </p>
                      </div>
                    )}

                    {/* Structured questionnaireAnswers (array of {question, answer} objects) */}
                    {Array.isArray(selectedAppointment.questionnaireAnswers) && selectedAppointment.questionnaireAnswers.length > 0 ? (
                      <div>
                        <span style={{ fontSize: '11px', color: 'var(--muted)', fontWeight: 700, display: 'block', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '10px' }}>
                          Additional questionnaire
                        </span>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                          {selectedAppointment.questionnaireAnswers.map((item, i) => (
                            <div key={i} style={{ borderBottom: '1px solid var(--line2)', paddingBottom: '10px' }}>
                              <span style={{ fontSize: '12px', color: 'var(--muted)', fontWeight: 600, display: 'block', marginBottom: '4px' }}>
                                {item.question || `Question ${i + 1}`}
                              </span>
                              <p style={{ margin: 0, fontSize: '14px', color: 'var(--ink)', lineHeight: 1.5 }}>
                                {item.answer || String(item)}
                              </p>
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : selectedAppointment.questionnaireAnswers && !Array.isArray(selectedAppointment.questionnaireAnswers) && Object.keys(selectedAppointment.questionnaireAnswers).length > 0 ? (
                      <div>
                        <span style={{ fontSize: '11px', color: 'var(--muted)', fontWeight: 700, display: 'block', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '10px' }}>
                          Additional questionnaire
                        </span>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                          {Object.entries(selectedAppointment.questionnaireAnswers).map(([q, ans], i) => (
                            <div key={i} style={{ borderBottom: '1px solid var(--line2)', paddingBottom: '10px' }}>
                              <span style={{ fontSize: '12px', color: 'var(--muted)', fontWeight: 600, display: 'block', marginBottom: '4px' }}>
                                {q}
                              </span>
                              <p style={{ margin: 0, fontSize: '14px', color: 'var(--ink)', lineHeight: 1.5 }}>
                                {typeof ans === 'object' ? (ans.answer || JSON.stringify(ans)) : String(ans)}
                              </p>
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : null}
                  </div>
                )}
              </div>
            )}

            {/* TAB 4: Coach Notes (Autosaved) */}
            {detailTab === 'notes' && (
              <div className="bwa-card">
                <div className="bwa-row" style={{ marginBottom: '8px' }}>
                  <h3>Coach private notes</h3>
                  <span className={`bwa-sv ${notesSaveStatus === 'dirty' ? 'dirty' : ''}`}>
                    <i style={{ background: notesSaveStatus === 'saved' ? 'var(--green)' : 'var(--amber)' }} />
                    {notesSaveStatus === 'saved' ? 'Saved ✓' : notesSaveStatus === 'saving' ? 'Saving...' : 'Unsaved'}
                  </span>
                </div>
                <p className="sub">
                  Private coaching observations and action items for this session. Notes autosave automatically as you type.
                </p>

                <div className="bwa-f" style={{ marginBottom: '12px' }}>
                  <textarea
                    rows={8}
                    value={coachNotes}
                    onChange={(e) => handleNotesChange(e.target.value)}
                    placeholder="Write session takeaways, action items, and personal breakthroughs..."
                  />
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
                  <div className="hint" style={{ margin: 0, flex: 1 }}>
                    Client can view their shared action items in their private appointment view.
                  </div>
                  <button
                    type="button"
                    className="bwa-btn pri sm"
                    onClick={() => saveCoachNotes(coachNotes)}
                    disabled={notesSaveStatus === 'saving'}
                    style={{ minWidth: '110px', height: '36px', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
                  >
                    {notesSaveStatus === 'saving' ? (
                      <>Saving...</>
                    ) : notesSaveStatus === 'saved' ? (
                      <>Save Notes ✓</>
                    ) : (
                      <>Save Notes</>
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </AdminDrawer>

      {/* REFUND CONFIRM MODAL */}
      <AdminConfirmModal
        isOpen={refundModalOpen}
        title="Confirm Emergency Refund"
        message={`Are you sure you want to refund ${inr(refundAmount)} to ${selectedAppointment?.name}? This action immediately refunds the payment through Razorpay and cannot be undone.`}
        confirmText={processingRefund ? 'Processing...' : 'Issue Refund'}
        isDanger={true}
        onConfirm={handleProcessRefund}
        onCancel={() => setRefundModalOpen(false)}
      >
        <div style={{ marginTop: '14px' }}>
          <div className="bwa-f">
            <label>Refund amount (₹)</label>
            <input
              type="number"
              value={refundAmount}
              onChange={(e) => setRefundAmount(e.target.value)}
            />
          </div>
          <div className="bwa-f">
            <label>Reason for refund</label>
            <input
              type="text"
              value={refundReason}
              onChange={(e) => setRefundReason(e.target.value)}
              placeholder="e.g. Schedule conflict or client request"
            />
          </div>
        </div>
      </AdminConfirmModal>
    </div>
  );
}
