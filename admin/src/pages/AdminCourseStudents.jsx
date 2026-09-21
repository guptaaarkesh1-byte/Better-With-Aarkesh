import React, { useState, useEffect } from 'react';
import { 
  GraduationCap, 
  MagnifyingGlass, 
  CaretDown, 
  Eye, 
  X, 
  CheckCircle, 
  Clock, 
  CalendarBlank, 
  CurrencyInr, 
  Users, 
  ArrowClockwise,
  Sparkle,
  PhoneCall,
  WarningCircle,
  XCircle,
  Receipt,
  Copy,
  Check
} from '@phosphor-icons/react';

export default function AdminCourseStudents() {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalRegistered: 0,
    totalPurchased: 0,
    totalRevenue: 0,
    freeSessionsClaimed: 0,
    totalFailedPurchases: 0,
    coursePrice: 15000
  });

  // Filter States
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All'); // All, Enrolled, Failed, Registered
  const [coachingFilter, setCoachingFilter] = useState('All'); // All, Claimed, Unclaimed
  const [activeDropdown, setActiveDropdown] = useState(null);
  const [copiedId, setCopiedId] = useState(null);

  // Drawer / Details Modal State
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const fetchStudentsAndStats = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('adminToken');
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';

      const [studentsRes, statsRes] = await Promise.all([
        fetch(`${apiUrl}/api/course-auth/admin/students`, {
          headers: { 'Authorization': `Bearer ${token}` }
        }),
        fetch(`${apiUrl}/api/course-auth/admin/stats`, {
          headers: { 'Authorization': `Bearer ${token}` }
        })
      ]);

      if (studentsRes.ok) {
        const studentsData = await studentsRes.json();
        setStudents(studentsData);
      }

      if (statsRes.ok) {
        const statsData = await statsRes.json();
        setStats(statsData);
      }
    } catch (err) {
      console.error('Failed to fetch course data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudentsAndStats();
  }, []);

  const handleCopy = (text, id) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const openStudentDetails = (student) => {
    setSelectedStudent(student);
    setIsDrawerOpen(true);
  };

  const closeDrawer = () => {
    setIsDrawerOpen(false);
    setTimeout(() => setSelectedStudent(null), 300);
  };

  // Filtered students (unified single list)
  const filteredStudents = students.filter(student => {
    const query = searchQuery.toLowerCase();
    const matchesSearch = 
      (student.fullName && student.fullName.toLowerCase().includes(query)) ||
      (student.email && student.email.toLowerCase().includes(query)) ||
      (student.phoneNumber && student.phoneNumber.toLowerCase().includes(query)) ||
      (student.purchases && student.purchases.some(p => 
        (p.transactionId && p.transactionId.toLowerCase().includes(query)) ||
        (p.razorpayOrderId && p.razorpayOrderId.toLowerCase().includes(query)) ||
        (p.failureReason && p.failureReason.toLowerCase().includes(query))
      ));

    let matchesStatus = true;
    if (statusFilter === 'Enrolled') matchesStatus = student.isPurchased === true;
    if (statusFilter === 'Failed') matchesStatus = student.hasFailedPayments === true;
    if (statusFilter === 'Registered') matchesStatus = !student.isPurchased && !student.hasFailedPayments;

    let matchesCoaching = true;
    if (coachingFilter === 'Claimed') matchesCoaching = student.freeSessionsClaimed > 0;
    if (coachingFilter === 'Unclaimed') matchesCoaching = student.freeSessionsClaimed === 0;

    return matchesSearch && matchesStatus && matchesCoaching;
  });

  return (
    <div className="p-8 md:p-10 w-full max-w-[1400px] mx-auto flex flex-col gap-8 animate-in fade-in duration-500 font-sans">
      
      {/* Header & Refresh */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-3">
            <h1 className="font-serif text-3xl text-white">Course Students &amp; Purchases</h1>
            <span className="px-2.5 py-0.5 rounded-full bg-[#c79c6e]/10 border border-[#c79c6e]/30 text-[#c79c6e] text-xs font-medium">
              Better With Aarkesh Course
            </span>
          </div>
          <p className="font-sans text-sm text-white/50">
            Track all enrolled members, Razorpay purchase transactions, failed attempts, and complimentary session claims.
          </p>
        </div>

        <button 
          onClick={fetchStudentsAndStats}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2.5 rounded-lg border border-white/10 bg-[#111] hover:bg-white/5 text-white/70 hover:text-white transition-colors text-xs uppercase tracking-widest font-semibold cursor-pointer"
        >
          <ArrowClockwise size={14} className={loading ? 'animate-spin' : ''} />
          <span>Refresh</span>
        </button>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        
        {/* Total Enrolled */}
        <div 
          onClick={() => setStatusFilter(statusFilter === 'Enrolled' ? 'All' : 'Enrolled')}
          className={`bg-[#111] border rounded-xl p-5 flex flex-col gap-2 transition-all cursor-pointer group ${
            statusFilter === 'Enrolled' 
              ? 'border-[#c79c6e] ring-2 ring-[#c79c6e]/30 bg-[#c79c6e]/5' 
              : 'border-white/5 hover:border-[#c79c6e]/40'
          }`}
          title="Click to filter by Enrolled students"
        >
          <div className="flex justify-between items-start text-[#c79c6e]">
            <div className="w-9 h-9 rounded-lg bg-[#c79c6e]/10 border border-[#c79c6e]/20 flex items-center justify-center group-hover:scale-110 transition-transform">
              <GraduationCap size={20} />
            </div>
            <span className="text-[0.62rem] uppercase tracking-widest px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-bold">
              Enrolled
            </span>
          </div>
          <div className="flex flex-col mt-1">
            <span className="font-sans text-2xl font-light text-white">{stats.totalPurchased}</span>
            <span className="font-sans text-[0.65rem] uppercase tracking-widest text-white/40 mt-0.5">Enrolled Students</span>
          </div>
        </div>

        {/* Total Revenue */}
        <div className="bg-[#111] border border-white/5 rounded-xl p-5 flex flex-col gap-2 hover:border-[#c79c6e]/40 transition-colors">
          <div className="flex justify-between items-start text-[#c79c6e]">
            <div className="w-9 h-9 rounded-lg bg-[#c79c6e]/10 border border-[#c79c6e]/20 flex items-center justify-center">
              <CurrencyInr size={20} />
            </div>
            <span className="text-[0.62rem] uppercase tracking-widest px-2 py-0.5 rounded bg-[#c79c6e]/10 border border-[#c79c6e]/20 text-[#c79c6e]">
              Total
            </span>
          </div>
          <div className="flex flex-col mt-1">
            <span className="font-sans text-2xl font-light text-white">₹{stats.totalRevenue ? stats.totalRevenue.toLocaleString('en-IN') : 0}</span>
            <span className="font-sans text-[0.65rem] uppercase tracking-widest text-white/40 mt-0.5">Course Revenue</span>
          </div>
        </div>

        {/* Free Coaching Claimed */}
        <div 
          onClick={() => setCoachingFilter(coachingFilter === 'Claimed' ? 'All' : 'Claimed')}
          className={`bg-[#111] border rounded-xl p-5 flex flex-col gap-2 transition-all cursor-pointer group ${
            coachingFilter === 'Claimed' 
              ? 'border-blue-500 ring-2 ring-blue-500/30 bg-blue-500/5' 
              : 'border-white/5 hover:border-blue-500/40'
          }`}
          title="Click to filter by Coaching Claims"
        >
          <div className="flex justify-between items-start text-[#c79c6e]">
            <div className="w-9 h-9 rounded-lg bg-[#c79c6e]/10 border border-[#c79c6e]/20 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Sparkle size={20} />
            </div>
            <span className="text-[0.62rem] uppercase tracking-widest px-2 py-0.5 rounded bg-blue-500/10 border border-blue-500/20 text-blue-400">
              3/Student
            </span>
          </div>
          <div className="flex flex-col mt-1">
            <span className="font-sans text-2xl font-light text-white">{stats.freeSessionsClaimed}</span>
            <span className="font-sans text-[0.65rem] uppercase tracking-widest text-white/40 mt-0.5">Calls Claimed</span>
          </div>
        </div>

        {/* Failed Transactions Card - Clickable to filter table directly */}
        <div 
          onClick={() => setStatusFilter(statusFilter === 'Failed' ? 'All' : 'Failed')}
          className={`bg-[#111] border rounded-xl p-5 flex flex-col gap-2 transition-all cursor-pointer group ${
            statusFilter === 'Failed' 
              ? 'border-rose-500 ring-2 ring-rose-500/30 bg-rose-500/[0.05]' 
              : 'border-white/5 hover:border-rose-500/40 hover:bg-rose-500/[0.02]'
          }`}
          title="Click to filter table by Failed Attempts"
        >
          <div className="flex justify-between items-start text-rose-400">
            <div className="w-9 h-9 rounded-lg bg-rose-500/10 border border-rose-500/20 flex items-center justify-center group-hover:scale-110 transition-transform">
              <XCircle size={20} weight="bold" />
            </div>
            <span className="text-[0.62rem] uppercase tracking-widest px-2 py-0.5 rounded bg-rose-500/15 border border-rose-500/30 text-rose-400 font-bold">
              Failed
            </span>
          </div>
          <div className="flex flex-col mt-1">
            <span className="font-sans text-2xl font-bold text-rose-400">
              {stats.totalFailedPurchases || 0}
            </span>
            <span className="font-sans text-[0.65rem] uppercase tracking-widest text-white/40 mt-0.5">
              Failed Attempts
            </span>
          </div>
        </div>

        {/* Total Registered Accounts */}
        <div 
          onClick={() => setStatusFilter('All')}
          className="bg-[#111] border border-white/5 rounded-xl p-5 flex flex-col gap-2 hover:border-[#c79c6e]/40 transition-all cursor-pointer group"
          title="Click to view All Students"
        >
          <div className="flex justify-between items-start text-[#c79c6e]">
            <div className="w-9 h-9 rounded-lg bg-[#c79c6e]/10 border border-[#c79c6e]/20 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Users size={20} />
            </div>
            <span className="text-[0.62rem] uppercase tracking-widest px-2 py-0.5 rounded bg-white/5 border border-white/10 text-white/60">
              Accounts
            </span>
          </div>
          <div className="flex flex-col mt-1">
            <span className="font-sans text-2xl font-light text-white">{stats.totalRegistered}</span>
            <span className="font-sans text-[0.65rem] uppercase tracking-widest text-white/40 mt-0.5">Registered</span>
          </div>
        </div>

      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-wrap items-center gap-4 bg-[#111] border border-white/5 p-4 rounded-xl relative z-20">
        <div className="relative flex-1 min-w-[260px]">
          <MagnifyingGlass size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40" />
          <input 
            type="text" 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search students by name, email, phone, transaction ID or failure reason..."
            className="w-full bg-[#050505] border border-white/10 rounded-lg py-2.5 pl-10 pr-4 text-sm font-sans text-white placeholder-white/30 focus:outline-none focus:border-[#c79c6e]/50 transition-colors"
          />
        </div>

        {(searchQuery || statusFilter !== 'All' || coachingFilter !== 'All') && (
          <button 
            onClick={() => {
              setSearchQuery('');
              setStatusFilter('All');
              setCoachingFilter('All');
            }}
            className="text-[#c79c6e] hover:text-white text-xs uppercase tracking-widest font-semibold transition-colors px-2 cursor-pointer"
          >
            Clear Filters
          </button>
        )}

        <div className="h-8 w-px bg-white/10 mx-2 hidden md:block" />

        {/* Status Dropdown */}
        <div className="relative">
          <button 
            onClick={() => setActiveDropdown(activeDropdown === 'status' ? null : 'status')}
            className="flex items-center gap-2 px-4 py-2 rounded-lg border border-white/10 bg-[#050505] text-white/70 hover:text-white text-xs transition-colors cursor-pointer"
          >
            <span className="text-white/40 uppercase tracking-widest text-[0.65rem] mr-2">Enrollment</span>
            {statusFilter === 'All' ? 'All Students' : statusFilter}
            <CaretDown size={12} className="ml-2" />
          </button>
          {activeDropdown === 'status' && (
            <div className="absolute top-full left-0 mt-2 w-48 bg-[#050505] border border-white/10 rounded-lg shadow-xl flex flex-col py-1 overflow-hidden z-30">
              {[
                { label: 'All Students', val: 'All' },
                { label: 'Enrolled (Purchased)', val: 'Enrolled' },
                { label: 'Payment Failed', val: 'Failed' },
                { label: 'Registered Only', val: 'Registered' }
              ].map(opt => (
                <button 
                  key={opt.val} 
                  onClick={() => { setStatusFilter(opt.val); setActiveDropdown(null); }} 
                  className="px-4 py-2 text-left text-xs text-white/70 hover:text-white hover:bg-white/5 transition-colors cursor-pointer"
                >
                  {opt.label}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Coaching Free Sessions Filter */}
        <div className="relative">
          <button 
            onClick={() => setActiveDropdown(activeDropdown === 'coaching' ? null : 'coaching')}
            className="flex items-center gap-2 px-4 py-2 rounded-lg border border-white/10 bg-[#050505] text-white/70 hover:text-white text-xs transition-colors cursor-pointer"
          >
            <span className="text-white/40 uppercase tracking-widest text-[0.65rem] mr-2">Free Coaching</span>
            {coachingFilter === 'All' ? 'All' : coachingFilter}
            <CaretDown size={12} className="ml-2" />
          </button>
          {activeDropdown === 'coaching' && (
            <div className="absolute top-full left-0 mt-2 w-48 bg-[#050505] border border-white/10 rounded-lg shadow-xl flex flex-col py-1 overflow-hidden z-30">
              {[
                { label: 'All Claims', val: 'All' },
                { label: 'Free Sessions Claimed', val: 'Claimed' },
                { label: 'Unclaimed (0 Booked)', val: 'Unclaimed' }
              ].map(opt => (
                <button 
                  key={opt.val} 
                  onClick={() => { setCoachingFilter(opt.val); setActiveDropdown(null); }} 
                  className="px-4 py-2 text-left text-xs text-white/70 hover:text-white hover:bg-white/5 transition-colors cursor-pointer"
                >
                  {opt.label}
                </button>
              ))}
            </div>
          )}
        </div>

      </div>

      {/* Unified Students & Transactions Table */}
      <div className="w-full bg-[#111] border border-white/5 rounded-xl overflow-hidden flex flex-col z-10">
        
        {/* Table Header */}
        <div className="grid grid-cols-[1.5fr_1.5fr_1fr_1fr_1fr_1fr_1.2fr_100px] gap-4 px-6 py-4 bg-[#1a1a1a] border-b border-white/5 text-white/40 text-[0.65rem] uppercase tracking-widest font-semibold">
          <div>Student / Customer</div>
          <div>Email Address</div>
          <div>Phone No.</div>
          <div>Joined Date</div>
          <div>Status</div>
          <div>Revenue / Attempt</div>
          <div>Free Coaching (3 max)</div>
          <div className="text-right">Actions</div>
        </div>

        {/* Table Body */}
        <div className="flex flex-col min-h-[300px]">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-24 text-white/30 text-sm gap-3">
              <ArrowClockwise size={28} className="animate-spin text-[#c79c6e]" />
              <span>Loading course records...</span>
            </div>
          ) : filteredStudents.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-white/30 text-sm gap-2">
              <GraduationCap size={36} className="text-white/20" />
              <span>No records found matching your filters.</span>
            </div>
          ) : (
            filteredStudents.map((student) => {
              const joinedDate = student.createdAt 
                ? new Date(student.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
                : '—';

              return (
                <div 
                  key={student._id}
                  onClick={() => openStudentDetails(student)}
                  className={`grid grid-cols-[1.5fr_1.5fr_1fr_1fr_1fr_1fr_1.2fr_100px] gap-4 px-6 py-5 border-b border-white/5 items-center hover:bg-white/[0.02] transition-colors cursor-pointer group ${
                    student.hasFailedPayments && !student.isPurchased ? 'bg-rose-500/[0.015]' : ''
                  }`}
                >
                  {/* Name + Avatar */}
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center font-serif text-lg shrink-0 ${
                      student.isPurchased 
                        ? 'bg-[#c79c6e]/10 border border-[#c79c6e]/40 text-[#c79c6e]' 
                        : student.hasFailedPayments
                        ? 'bg-rose-500/10 border border-rose-500/30 text-rose-400'
                        : 'bg-white/5 border border-white/10 text-white/50'
                    }`}>
                      {student.fullName ? student.fullName.charAt(0).toUpperCase() : 'S'}
                    </div>
                    <div className="flex flex-col min-w-0">
                      <span className="text-white/90 text-sm font-medium truncate">{student.fullName || 'Student'}</span>
                      {student.isPurchased ? (
                        <span className="text-[0.65rem] text-[#c79c6e] flex items-center gap-1">
                          <GraduationCap size={10} /> Enrolled Member
                        </span>
                      ) : student.hasFailedPayments ? (
                        <span className="text-[0.65rem] text-rose-400 flex items-center gap-1">
                          <XCircle size={10} /> Payment Failed ({student.failedPurchasesCount})
                        </span>
                      ) : null}
                    </div>
                  </div>

                  {/* Email */}
                  <div className="text-[#c79c6e] text-sm truncate pr-2 font-mono">
                    {student.email}
                  </div>

                  {/* Phone */}
                  <div className="text-white/70 text-sm">
                    {student.phoneNumber || '—'}
                  </div>

                  {/* Joined Date */}
                  <div className="text-white/60 text-sm">
                    {joinedDate}
                  </div>

                  {/* Access Status */}
                  <div>
                    {student.isPurchased ? (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                        <CheckCircle size={12} weight="fill" />
                        Enrolled
                      </span>
                    ) : student.hasFailedPayments ? (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-rose-500/15 text-rose-400 border border-rose-500/30">
                        <XCircle size={12} weight="bold" />
                        Failed ({student.failedPurchasesCount})
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-white/5 text-white/50 border border-white/10">
                        Registered
                      </span>
                    )}
                  </div>

                  {/* Revenue / Attempt & Txn ID */}
                  <div className="flex flex-col gap-0.5">
                    {student.isPurchased ? (
                      <>
                        <span className="text-white font-mono font-medium text-sm">₹{student.revenue?.toLocaleString('en-IN') || '11,800'}</span>
                        {student.latestPaid?.transactionId && (
                          <div className="flex items-center gap-1 text-[10px] font-mono text-[#c79c6e]/70">
                            <span className="truncate max-w-[90px]">{student.latestPaid.transactionId}</span>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleCopy(student.latestPaid.transactionId, `row-txn-${student._id}`);
                              }}
                              className="text-white/40 hover:text-white"
                              title="Copy Transaction ID"
                            >
                              {copiedId === `row-txn-${student._id}` ? <Check size={10} className="text-emerald-400" /> : <Copy size={10} />}
                            </button>
                          </div>
                        )}
                      </>
                    ) : student.hasFailedPayments ? (
                      <div className="flex flex-col">
                        <span className="text-rose-400 text-xs font-mono font-bold">
                          ₹{student.latestFailed?.amount ? student.latestFailed.amount.toLocaleString('en-IN') : '11,800'} Failed
                        </span>
                        {student.latestFailed?.transactionId && (
                          <div className="flex items-center gap-1 text-[10px] font-mono text-rose-400/80">
                            <span className="truncate max-w-[95px]">{student.latestFailed.transactionId}</span>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleCopy(student.latestFailed.transactionId, `row-failed-${student._id}`);
                              }}
                              className="text-rose-400/60 hover:text-rose-300"
                              title="Copy Failed Transaction ID"
                            >
                              {copiedId === `row-failed-${student._id}` ? <Check size={10} className="text-emerald-400" /> : <Copy size={10} />}
                            </button>
                          </div>
                        )}
                      </div>
                    ) : (
                      <span className="text-white/30 text-sm font-mono">—</span>
                    )}
                  </div>

                  {/* Free Coaching Sessions */}
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-medium text-white/80">
                        {student.freeSessionsClaimed} / 3 Used
                      </span>
                      {student.freeSessionsClaimed === 3 && (
                        <span className="px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 text-[0.6rem] font-bold">Max</span>
                      )}
                    </div>
                    <span className="text-[0.65rem] text-white/40">
                      {3 - student.freeSessionsClaimed > 0 
                        ? `${3 - student.freeSessionsClaimed} remaining`
                        : 'None remaining'}
                    </span>
                  </div>

                  {/* Actions */}
                  <div className="text-right flex items-center justify-end gap-2">
                    <button 
                      onClick={(e) => { e.stopPropagation(); openStudentDetails(student); }}
                      className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-white/60 hover:text-white transition-colors cursor-pointer"
                      title="View Full Profile, Invoices & Diagnostic Details"
                    >
                      <Eye size={16} />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* ══════════════════════════════════════════════════════════════════
          STUDENT DETAILS SLIDE-OVER DRAWER MODAL
      ══════════════════════════════════════════════════════════════════ */}
      <div className={`fixed inset-0 z-50 overflow-hidden pointer-events-none transition-all duration-300 ${
        isDrawerOpen ? 'opacity-100' : 'opacity-0'
      }`}>
        {/* Backdrop */}
        <div 
          onClick={closeDrawer}
          className={`absolute inset-0 bg-black/80 backdrop-blur-sm transition-opacity duration-300 ${
            isDrawerOpen ? 'pointer-events-auto opacity-100' : 'pointer-events-none opacity-0'
          }`}
        />

        {/* Drawer Content */}
        {selectedStudent && (
          <div className={`absolute top-0 right-0 max-w-xl w-full h-full bg-[#0a0a0a] border-l border-white/10 shadow-2xl p-8 flex flex-col justify-between overflow-y-auto transform transition-transform duration-300 pointer-events-auto ${
            isDrawerOpen ? 'translate-x-0' : 'translate-x-full'
          }`}>
            <div className="flex flex-col gap-6">
              
              {/* Header */}
              <div className="flex justify-between items-start pb-4 border-b border-white/10">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-[#c79c6e]/10 border border-[#c79c6e]/40 flex items-center justify-center font-serif text-xl text-[#c79c6e]">
                    {selectedStudent.fullName ? selectedStudent.fullName.charAt(0).toUpperCase() : 'S'}
                  </div>
                  <div className="flex flex-col">
                    <h2 className="text-xl font-serif text-white">{selectedStudent.fullName}</h2>
                    <span className="text-xs text-white/40">Student Account #{selectedStudent._id?.slice(-6).toUpperCase()}</span>
                  </div>
                </div>

                <button 
                  onClick={closeDrawer}
                  className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-white/50 hover:text-white transition-colors cursor-pointer"
                >
                  <X size={16} />
                </button>
              </div>

              {/* Contact Details Card */}
              <div className="bg-[#111] border border-white/5 rounded-xl p-5 flex flex-col gap-3">
                <span className="text-xs uppercase tracking-widest text-[#c79c6e] font-semibold">Contact &amp; Account Info</span>
                <div className="grid grid-cols-2 gap-4 text-xs">
                  <div>
                    <span className="text-white/40 block text-[0.65rem] uppercase tracking-wider">Email Address</span>
                    <span className="text-white font-mono break-all">{selectedStudent.email}</span>
                  </div>
                  <div>
                    <span className="text-white/40 block text-[0.65rem] uppercase tracking-wider">Phone Number</span>
                    <span className="text-white font-mono">{selectedStudent.phoneNumber || 'Not Provided'}</span>
                  </div>
                  <div>
                    <span className="text-white/40 block text-[0.65rem] uppercase tracking-wider">Registered Since</span>
                    <span className="text-white">
                      {selectedStudent.createdAt ? new Date(selectedStudent.createdAt).toLocaleDateString('en-GB') : '—'}
                    </span>
                  </div>
                  <div>
                    <span className="text-white/40 block text-[0.65rem] uppercase tracking-wider">Coaching Account</span>
                    <span className={selectedStudent.coachingRegistered ? 'text-emerald-400 font-semibold' : 'text-white/40'}>
                      {selectedStudent.coachingRegistered ? '✓ Linked Account' : 'Not Registered'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Course Access Status */}
              <div className="bg-[#111] border border-white/5 rounded-xl p-5 flex flex-col gap-3">
                <div className="flex justify-between items-center">
                  <span className="text-xs uppercase tracking-widest text-[#c79c6e] font-semibold">Course Enrollment Status</span>
                  {selectedStudent.isPurchased ? (
                    <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                      <CheckCircle size={12} weight="fill" /> Enrolled (₹{selectedStudent.revenue?.toLocaleString('en-IN') || '11,800'} Paid)
                    </span>
                  ) : selectedStudent.hasFailedPayments ? (
                    <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-rose-500/15 text-rose-400 border border-rose-500/30 flex items-center gap-1">
                      <XCircle size={12} weight="bold" /> Payment Failed ({selectedStudent.failedPurchasesCount} attempts)
                    </span>
                  ) : (
                    <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-white/5 text-white/50 border border-white/10">
                      Registered Only
                    </span>
                  )}
                </div>

                {/* Free Sessions Status */}
                <div className="mt-2 pt-3 border-t border-white/5 flex flex-col gap-2">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-white/60">Complimentary 1-on-1 Sessions:</span>
                    <span className="font-semibold text-white font-mono">
                      {selectedStudent.freeSessionsClaimed} / 3 Used
                    </span>
                  </div>
                  <div className="w-full bg-white/5 h-2 rounded-full overflow-hidden">
                    <div 
                      className="bg-[#c79c6e] h-full rounded-full transition-all duration-500"
                      style={{ width: `${Math.min(100, (selectedStudent.freeSessionsClaimed / 3) * 100)}%` }}
                    />
                  </div>
                  <span className="text-[0.68rem] text-white/40">
                    {3 - selectedStudent.freeSessionsClaimed > 0 
                      ? `${3 - selectedStudent.freeSessionsClaimed} free sessions remaining to book`
                      : 'All 3 free sessions have been claimed'}
                  </span>
                </div>
              </div>

              {/* Transactions & Payment History (Paid & Failed Attempts) */}
              <div className="bg-[#111] border border-white/5 rounded-xl p-5 flex flex-col gap-3">
                <div className="flex items-center justify-between border-b border-white/5 pb-3">
                  <span className="text-xs uppercase tracking-widest text-[#c79c6e] font-semibold flex items-center gap-1.5">
                    <Receipt size={15} /> Payment &amp; Bill History ({selectedStudent.purchases?.length || 0})
                  </span>
                </div>

                {(!selectedStudent.purchases || selectedStudent.purchases.length === 0) ? (
                  <div className="py-4 text-center text-white/40 text-xs font-mono">
                    No payment attempts recorded for this account.
                  </div>
                ) : (
                  <div className="space-y-3 max-h-[280px] overflow-y-auto pr-1">
                    {selectedStudent.purchases.map((p, idx) => {
                      const isPaid = p.paymentStatus === 'Paid';
                      const pDate = p.purchaseDate || p.createdAt ? new Date(p.purchaseDate || p.createdAt).toLocaleString('en-IN') : '—';
                      return (
                        <div 
                          key={p._id || idx}
                          className={`p-3.5 rounded-xl border flex flex-col gap-2 text-xs font-mono ${
                            isPaid 
                              ? 'bg-emerald-500/[0.03] border-emerald-500/20' 
                              : 'bg-rose-500/[0.04] border-rose-500/25'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                              isPaid 
                                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' 
                                : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                            }`}>
                              {isPaid ? 'PAID IN FULL' : 'PAYMENT FAILED'}
                            </span>
                            <span className="font-bold text-white text-sm">
                              ₹{(p.amount || 11800).toLocaleString('en-IN')}
                            </span>
                          </div>

                          <div className="text-[11px] text-white/60 space-y-0.5">
                            <div className="flex items-center justify-between">
                              <span>Txn ID:</span>
                              <span className="text-white font-mono flex items-center gap-1">
                                {p.transactionId || '—'}
                                {p.transactionId && (
                                  <button
                                    onClick={() => handleCopy(p.transactionId, `drawer-txn-${idx}`)}
                                    className="text-white/40 hover:text-white"
                                  >
                                    {copiedId === `drawer-txn-${idx}` ? <Check size={11} className="text-emerald-400" /> : <Copy size={11} />}
                                  </button>
                                )}
                              </span>
                            </div>
                            <div className="flex items-center justify-between">
                              <span>Order:</span>
                              <span className="text-white/80 font-mono">{p.razorpayOrderId || '—'}</span>
                            </div>
                            <div className="flex items-center justify-between text-white/40 text-[10px]">
                              <span>Date:</span>
                              <span>{pDate}</span>
                            </div>
                          </div>

                          {!isPaid && p.failureReason && (
                            <div className="p-2 rounded bg-rose-500/10 border border-rose-500/20 text-[11px] text-rose-300 font-sans leading-relaxed">
                              <strong>Reason:</strong> {p.failureReason}
                              {p.errorCode && <span className="block font-mono text-[10px] text-rose-400/70 mt-0.5">Code: {p.errorCode}</span>}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Linked Coaching Appointments History */}
              <div className="flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs uppercase tracking-widest text-white/60 font-medium">
                    Linked Appointments ({selectedStudent.appointments?.length || 0})
                  </span>
                </div>

                {(!selectedStudent.appointments || selectedStudent.appointments.length === 0) ? (
                  <div className="bg-[#111] border border-white/5 rounded-xl p-6 text-center text-white/30 text-xs">
                    No coaching appointments booked yet with this email.
                  </div>
                ) : (
                  <div className="flex flex-col gap-2 max-h-[220px] overflow-y-auto">
                    {selectedStudent.appointments.map((app, idx) => (
                      <div key={app._id || idx} className="bg-[#111] border border-white/5 p-3 rounded-lg flex items-center justify-between text-xs">
                        <div className="flex flex-col gap-0.5">
                          <span className="text-white font-medium">{app.date} at {app.time}</span>
                          <span className="text-white/40 text-[0.65rem] font-mono">
                            {app.isFreeSession ? '🎓 Course Free Session' : 'Standard Session'}
                          </span>
                        </div>
                        <div className="flex flex-col items-end gap-1">
                          <span className={`px-2 py-0.5 rounded text-[0.65rem] uppercase tracking-wider font-semibold ${
                            app.status === 'COMPLETED' 
                              ? 'text-green-500 bg-green-500/10 border border-green-500/20' 
                              : 'text-[#c79c6e] bg-[#c79c6e]/10 border border-[#c79c6e]/20'
                          }`}>
                            {app.status}
                          </span>
                          {app.isFreeSession && (
                            <span className="text-emerald-400 text-[0.65rem] font-mono font-medium">₹0 Free</span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

            </div>

          </div>
        )}
      </div>

    </div>
  );
}
