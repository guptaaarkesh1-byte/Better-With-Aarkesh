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
    if (app.status === 'Refunded' || app.status === 'Completed' || app.status === 'Cancelled') return false;
    if (app.rescheduleRequested) return true;
    if (app.paymentStatus === 'Pending') return true;
    
    // Check if session date has passed without completion
    try {
      const appDateTime = new Date(`${app.date} ${app.time}`);
      if (!isNaN(appDateTime.getTime()) && appDateTime < new Date() && app.status !== 'Completed') {
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
    const rescheduleCount = appointments.filter(a => a.rescheduleRequested).length;
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
          phone: app.phone || app.userId?.phone || '',
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
      if (activeTab === 'needs-action' && !isNeedsAction(app)) return false;
      if (activeTab === 'today' && !isTodaySession(app)) return false;
      if (activeTab === 'upcoming') {
        if (app.status === 'Completed' || app.status === 'Refunded' || isTodaySession(app)) return false;
      }
      if (activeTab === 'past' && app.status !== 'Completed') return false;
      if (activeTab === 'refunded' && app.status !== 'Refunded') return false;

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchName = (app.name || '').toLowerCase().includes(q);
        const matchEmail = (app.email || '').toLowerCase().includes(q);
        const matchPhone = (app.phone || '').includes(q);
        if (!matchName && !matchEmail && !matchPhone) return false;
      }

      // Popover filters
      if (filters.paymentStatus && app.paymentStatus !== filters.paymentStatus) return false;
      if (filters.rescheduleStatus) {
        if (filters.rescheduleStatus === 'Requested' && !app.rescheduleRequested) return false;
        if (filters.rescheduleStatus === 'None' && app.rescheduleRequested) return false;
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
      const res = await fetch(`${API_URL}/api/appointments/${appId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ status: newStatus })
      });
      if (!res.ok) throw new Error('Status update failed');
      showSuccess(`Appointment marked as ${newStatus}`);
      fetchData();
      if (selectedAppointment?._id === appId) {
        setSelectedAppointment(prev => ({ ...prev, status: newStatus }));
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

  // Coach Notes Autosave
  const handleNotesChange = (text) => {
    setCoachNotes(text);
    setNotesSaveStatus('dirty');
    clearTimeout(notesTimerRef.current);
    notesTimerRef.current = setTimeout(async () => {
      if (!selectedAppointment?._id) return;
      setNotesSaveStatus('saving');
      try {
        const token = localStorage.getItem('adminToken');
        await fetch(`${API_URL}/api/notes`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify({
            appointmentId: selectedAppointment._id,
            coachNotes: text
          })
        });
        setNotesSaveStatus('saved');
      } catch (err) {
        setNotesSaveStatus('dirty');
      }
    }, 800);
  };

  // Open Appointment inside drawer
  const openAppointmentDetail = (app) => {
    setSelectedAppointment(app);
    setCoachNotes(app.coachNotes || app.notes || '');
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
                                {app.email} · {app.phone || 'No phone'}
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
                              ) : app.status === 'Completed' ? (
                                <span className="bwa-chip g">Completed</span>
                              ) : app.status === 'Refunded' ? (
                                <span className="bwa-chip r">Refunded</span>
                              ) : isTodaySession(app) ? (
                                <span className="bwa-chip b">Today</span>
                              ) : (
                                <span className="bwa-chip n">{app.status || 'Upcoming'}</span>
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
                            <small style={{ color: 'var(--muted)' }}>{c.phone || 'No phone'}</small>
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
              {selectedAppointment?.status !== 'Completed' && (
                <button
                  type="button"
                  className="bwa-btn pri sm"
                  onClick={() => handleStatusChange(selectedAppointment._id, 'Completed')}
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
                      <b>{selectedAppointment.phone || '—'}</b>
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
                  <p className="sub">Review requested schedule change.</p>

                  {selectedAppointment.rescheduleRequested ? (
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
                            {selectedAppointment.requestedDate || selectedAppointment.date} at {selectedAppointment.requestedTime}
                          </b>
                        </div>
                      </div>

                      {selectedAppointment.rescheduleReason && (
                        <p style={{ margin: '10px 0 0', fontSize: '13px', color: '#5b4d43' }}>
                          <b>Reason:</b> {selectedAppointment.rescheduleReason}
                        </p>
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
                  ) : (
                    <p style={{ color: 'var(--muted)', fontSize: '13.5px' }}>
                      No pending reschedule request for this appointment.
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

                {selectedAppointment.answers && Object.keys(selectedAppointment.answers).length > 0 ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                    {Object.entries(selectedAppointment.answers).map(([q, ans], i) => (
                      <div key={i} style={{ borderBottom: '1px solid var(--line2)', paddingBottom: '10px' }}>
                        <span style={{ fontSize: '12px', color: 'var(--muted)', fontWeight: 600, display: 'block' }}>
                          {q}
                        </span>
                        <p style={{ margin: '4px 0 0', fontSize: '14px', color: 'var(--ink)' }}>
                          {String(ans)}
                        </p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p style={{ color: 'var(--muted)', fontSize: '13.5px' }}>
                    No intake questionnaire submitted for this booking.
                  </p>
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

                <div className="bwa-f">
                  <textarea
                    rows={8}
                    value={coachNotes}
                    onChange={(e) => handleNotesChange(e.target.value)}
                    placeholder="Write session takeaways, action items, and personal breakthroughs..."
                  />
                </div>
                <div className="hint">
                  Client can view their shared action items in their private appointment view.
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
