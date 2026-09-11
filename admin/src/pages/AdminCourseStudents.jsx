import React, { useState, useEffect } from 'react';
import { 
  GraduationCap, 
  MagnifyingGlass, 
  CaretDown, 
  CaretLeft, 
  CaretRight, 
  Eye, 
  X, 
  CheckCircle, 
  Clock, 
  CalendarBlank, 
  CurrencyInr, 
  Users, 
  VideoCamera, 
  ArrowClockwise,
  Sparkle,
  EnvelopeSimple,
  PhoneCall
} from '@phosphor-icons/react';

export default function AdminCourseStudents() {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalRegistered: 0,
    totalPurchased: 0,
    totalRevenue: 0,
    freeSessionsClaimed: 0,
    coursePrice: 15000
  });

  // Filter States
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All'); // All, Enrolled, Registered
  const [coachingFilter, setCoachingFilter] = useState('All'); // All, Claimed, Unclaimed
  const [activeDropdown, setActiveDropdown] = useState(null);

  // Drawer / Details Modal State
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isTogglingAccess, setIsTogglingAccess] = useState(false);

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
      console.error('Failed to fetch course students:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudentsAndStats();
  }, []);

  const handleToggleAccess = async (studentId) => {
    if (!window.confirm('Are you sure you want to change course access for this student?')) return;
    setIsTogglingAccess(true);
    try {
      const token = localStorage.getItem('adminToken');
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      const res = await fetch(`${apiUrl}/api/course-auth/admin/students/${studentId}/toggle-access`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (res.ok) {
        await fetchStudentsAndStats();
        if (selectedStudent && selectedStudent._id === studentId) {
          setSelectedStudent(prev => ({
            ...prev,
            isPurchased: !prev.isPurchased
          }));
        }
      } else {
        alert('Failed to update course access.');
      }
    } catch (err) {
      console.error(err);
      alert('Error updating course access.');
    } finally {
      setIsTogglingAccess(false);
    }
  };

  const openStudentDetails = (student) => {
    setSelectedStudent(student);
    setIsDrawerOpen(true);
  };

  const closeDrawer = () => {
    setIsDrawerOpen(false);
    setTimeout(() => setSelectedStudent(null), 300);
  };

  // Filtered students
  const filteredStudents = students.filter(student => {
    const query = searchQuery.toLowerCase();
    const matchesSearch = 
      (student.fullName && student.fullName.toLowerCase().includes(query)) ||
      (student.email && student.email.toLowerCase().includes(query)) ||
      (student.phoneNumber && student.phoneNumber.toLowerCase().includes(query));

    let matchesStatus = true;
    if (statusFilter === 'Enrolled') matchesStatus = student.isPurchased === true;
    if (statusFilter === 'Registered') matchesStatus = !student.isPurchased;

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
            <h1 className="font-serif text-3xl text-white">Course Students & Purchases</h1>
            <span className="px-2.5 py-0.5 rounded-full bg-[#c79c6e]/10 border border-[#c79c6e]/30 text-[#c79c6e] text-xs font-medium">
              Better With Aarkesh Course
            </span>
          </div>
          <p className="font-sans text-sm text-white/50">
            Track all enrolled members, Razorpay purchase revenue, and 3 complimentary coaching session claims.
          </p>
        </div>

        <button 
          onClick={fetchStudentsAndStats}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2.5 rounded-lg border border-white/10 bg-[#111] hover:bg-white/5 text-white/70 hover:text-white transition-colors text-xs uppercase tracking-widest font-semibold"
        >
          <ArrowClockwise size={14} className={loading ? 'animate-spin' : ''} />
          <span>Refresh</span>
        </button>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        
        {/* Total Enrolled */}
        <div className="bg-[#111] border border-white/5 rounded-xl p-6 flex flex-col gap-3 hover:border-[#c79c6e]/40 transition-colors">
          <div className="flex justify-between items-start text-[#c79c6e]">
            <div className="w-10 h-10 rounded-lg bg-[#c79c6e]/10 border border-[#c79c6e]/20 flex items-center justify-center">
              <GraduationCap size={22} />
            </div>
            <span className="text-[0.65rem] uppercase tracking-widest px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
              Active Access
            </span>
          </div>
          <div className="flex flex-col">
            <span className="font-sans text-3xl font-light text-white">{stats.totalPurchased}</span>
            <span className="font-sans text-xs uppercase tracking-widest text-white/40 mt-1">Enrolled Students</span>
          </div>
          <div className="text-[0.7rem] text-white/30 pt-3 border-t border-white/5">
            Full lifetime course & dashboard access
          </div>
        </div>

        {/* Total Course Revenue */}
        <div className="bg-[#111] border border-white/5 rounded-xl p-6 flex flex-col gap-3 hover:border-[#c79c6e]/40 transition-colors">
          <div className="flex justify-between items-start text-[#c79c6e]">
            <div className="w-10 h-10 rounded-lg bg-[#c79c6e]/10 border border-[#c79c6e]/20 flex items-center justify-center">
              <CurrencyInr size={22} />
            </div>
            <span className="text-[0.65rem] uppercase tracking-widest px-2 py-0.5 rounded bg-[#c79c6e]/10 border border-[#c79c6e]/20 text-[#c79c6e]">
              ₹15,000 / seat
            </span>
          </div>
          <div className="flex flex-col">
            <span className="font-sans text-3xl font-light text-white">₹{stats.totalRevenue.toLocaleString('en-IN')}</span>
            <span className="font-sans text-xs uppercase tracking-widest text-white/40 mt-1">Total Course Revenue</span>
          </div>
          <div className="text-[0.7rem] text-white/30 pt-3 border-t border-white/5">
            Verified payments via Razorpay
          </div>
        </div>

        {/* Free Coaching Claimed */}
        <div className="bg-[#111] border border-white/5 rounded-xl p-6 flex flex-col gap-3 hover:border-[#c79c6e]/40 transition-colors">
          <div className="flex justify-between items-start text-[#c79c6e]">
            <div className="w-10 h-10 rounded-lg bg-[#c79c6e]/10 border border-[#c79c6e]/20 flex items-center justify-center">
              <Sparkle size={22} />
            </div>
            <span className="text-[0.65rem] uppercase tracking-widest px-2 py-0.5 rounded bg-blue-500/10 border border-blue-500/20 text-blue-400">
              3 Included / Student
            </span>
          </div>
          <div className="flex flex-col">
            <span className="font-sans text-3xl font-light text-white">{stats.freeSessionsClaimed}</span>
            <span className="font-sans text-xs uppercase tracking-widest text-white/40 mt-1">Free Sessions Claimed</span>
          </div>
          <div className="text-[0.7rem] text-white/30 pt-3 border-t border-white/5">
            Complimentary 1-on-1 coaching bookings
          </div>
        </div>

        {/* Total Registered Accounts */}
        <div className="bg-[#111] border border-white/5 rounded-xl p-6 flex flex-col gap-3 hover:border-[#c79c6e]/40 transition-colors">
          <div className="flex justify-between items-start text-[#c79c6e]">
            <div className="w-10 h-10 rounded-lg bg-[#c79c6e]/10 border border-[#c79c6e]/20 flex items-center justify-center">
              <Users size={22} />
            </div>
            <span className="text-[0.65rem] uppercase tracking-widest px-2 py-0.5 rounded bg-white/5 border border-white/10 text-white/60">
              Accounts
            </span>
          </div>
          <div className="flex flex-col">
            <span className="font-sans text-3xl font-light text-white">{stats.totalRegistered}</span>
            <span className="font-sans text-xs uppercase tracking-widest text-white/40 mt-1">Registered Accounts</span>
          </div>
          <div className="text-[0.7rem] text-white/30 pt-3 border-t border-white/5">
            Includes prospects & enrolled members
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
            placeholder="Search students by name, email, or phone..."
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
            className="text-[#c79c6e] hover:text-white text-xs uppercase tracking-widest font-semibold transition-colors px-2"
          >
            Clear Filters
          </button>
        )}

        <div className="h-8 w-px bg-white/10 mx-2 hidden md:block" />

        {/* Status Dropdown */}
        <div className="relative">
          <button 
            onClick={() => setActiveDropdown(activeDropdown === 'status' ? null : 'status')}
            className="flex items-center gap-2 px-4 py-2 rounded-lg border border-white/10 bg-[#050505] text-white/70 hover:text-white text-xs transition-colors"
          >
            <span className="text-white/40 uppercase tracking-widest text-[0.65rem] mr-2">Enrollment</span>
            {statusFilter === 'All' ? 'All Students' : statusFilter}
            <CaretDown size={12} className="ml-2" />
          </button>
          {activeDropdown === 'status' && (
            <div className="absolute top-full left-0 mt-2 w-44 bg-[#050505] border border-white/10 rounded-lg shadow-xl flex flex-col py-1 overflow-hidden z-30">
              {[
                { label: 'All Students', val: 'All' },
                { label: 'Enrolled (Purchased)', val: 'Enrolled' },
                { label: 'Registered Only', val: 'Registered' }
              ].map(opt => (
                <button 
                  key={opt.val} 
                  onClick={() => { setStatusFilter(opt.val); setActiveDropdown(null); }} 
                  className="px-4 py-2 text-left text-xs text-white/70 hover:text-white hover:bg-white/5 transition-colors"
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
            className="flex items-center gap-2 px-4 py-2 rounded-lg border border-white/10 bg-[#050505] text-white/70 hover:text-white text-xs transition-colors"
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
                  className="px-4 py-2 text-left text-xs text-white/70 hover:text-white hover:bg-white/5 transition-colors"
                >
                  {opt.label}
                </button>
              ))}
            </div>
          )}
        </div>

      </div>

      {/* Students Data Table */}
      <div className="w-full bg-[#111] border border-white/5 rounded-xl overflow-hidden flex flex-col z-10">
        
        {/* Table Header */}
        <div className="grid grid-cols-[1.5fr_1.5fr_1fr_1fr_1fr_1fr_1.2fr_100px] gap-4 px-6 py-4 bg-[#1a1a1a] border-b border-white/5 text-white/40 text-[0.65rem] uppercase tracking-widest font-semibold">
          <div>Student Name</div>
          <div>Email Address</div>
          <div>Phone No.</div>
          <div>Joined Date</div>
          <div>Status</div>
          <div>Revenue</div>
          <div>Free Coaching (3 max)</div>
          <div className="text-right">Actions</div>
        </div>

        {/* Table Body */}
        <div className="flex flex-col min-h-[300px]">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-24 text-white/30 text-sm gap-3">
              <ArrowClockwise size={28} className="animate-spin text-[#c79c6e]" />
              <span>Loading course students...</span>
            </div>
          ) : filteredStudents.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-white/30 text-sm gap-2">
              <GraduationCap size={36} className="text-white/20" />
              <span>No students found matching your filters.</span>
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
                  className="grid grid-cols-[1.5fr_1.5fr_1fr_1fr_1fr_1fr_1.2fr_100px] gap-4 px-6 py-5 border-b border-white/5 items-center hover:bg-white/[0.02] transition-colors cursor-pointer group"
                >
                  {/* Name + Avatar */}
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center font-serif text-lg shrink-0 ${
                      student.isPurchased 
                        ? 'bg-[#c79c6e]/10 border border-[#c79c6e]/40 text-[#c79c6e]' 
                        : 'bg-white/5 border border-white/10 text-white/50'
                    }`}>
                      {student.fullName ? student.fullName.charAt(0).toUpperCase() : 'S'}
                    </div>
                    <div className="flex flex-col">
                      <span className="text-white/90 text-sm font-medium">{student.fullName || 'Student'}</span>
                      {student.isPurchased && (
                        <span className="text-[0.65rem] text-[#c79c6e] flex items-center gap-1">
                          <GraduationCap size={10} /> Enrolled Member
                        </span>
                      )}
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
                    ) : (
                      <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-white/5 text-white/50 border border-white/10">
                        Registered
                      </span>
                    )}
                  </div>

                  {/* Revenue */}
                  <div>
                    {student.isPurchased ? (
                      <span className="text-white font-mono font-medium text-sm">₹15,000</span>
                    ) : (
                      <span className="text-white/30 text-sm font-mono">—</span>
                    )}
                  </div>

                  {/* Free Coaching Sessions */}
                  <div className="flex flex-col gap-1">
                    {student.isPurchased ? (
                      <>
                        <div className="flex items-center gap-2">
                          <span className={`px-2 py-0.5 rounded text-[0.68rem] font-medium ${
                            student.freeSessionsClaimed > 0 
                              ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20' 
                              : 'bg-white/5 text-white/60 border border-white/10'
                          }`}>
                            {student.freeSessionsClaimed} / 3 Used
                          </span>
                        </div>
                        <span className="text-white/30 text-[0.65rem]">
                          {3 - student.freeSessionsClaimed} remaining
                        </span>
                      </>
                    ) : (
                      <span className="text-white/30 text-xs">—</span>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="text-right">
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        openStudentDetails(student);
                      }}
                      className="text-[#c79c6e] hover:text-white text-xs flex items-center justify-end gap-1 transition-colors group ml-auto"
                    >
                      <Eye size={14} />
                      <span>Details</span>
                      <CaretRight size={12} className="group-hover:translate-x-0.5 transition-transform" />
                    </button>
                  </div>

                </div>
              );
            })
          )}
        </div>

        {/* Footer info */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-white/5 bg-[#111]">
          <span className="text-white/40 text-sm">
            Showing {filteredStudents.length} of {students.length} total students
          </span>
          <span className="text-white/30 text-xs">
            Course Fee: ₹15,000 • Included 1-on-1 Sessions: 3 complimentary
          </span>
        </div>

      </div>

      {/* Student Details Slide-over Drawer Backdrop */}
      <div 
        className={`fixed inset-0 bg-black/60 backdrop-blur-sm z-40 transition-opacity duration-300 ${
          isDrawerOpen ? 'opacity-100 visible' : 'opacity-0 invisible'
        }`}
        onClick={closeDrawer}
      />

      {/* Student Details Drawer */}
      <div 
        className={`fixed right-0 top-0 h-screen w-full md:w-[480px] bg-[#0a0a0a] border-l border-white/10 z-50 transform transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] overflow-y-auto ${
          isDrawerOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {selectedStudent && (
          <div className="flex flex-col h-full p-6 md:p-8 justify-between">
            
            <div className="flex flex-col gap-6">
              
              {/* Drawer Top / Close */}
              <div className="flex items-center justify-between border-b border-white/10 pb-4">
                <div className="flex items-center gap-2">
                  <GraduationCap size={20} className="text-[#c79c6e]" />
                  <span className="text-xs uppercase tracking-widest text-[#c79c6e] font-semibold">Student Profile</span>
                </div>
                <button 
                  onClick={closeDrawer}
                  className="p-1 rounded-md text-white/50 hover:text-white hover:bg-white/10 transition-colors"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Student Header */}
              <div className="flex items-center gap-4 bg-[#111] p-4 rounded-xl border border-white/5">
                <div className={`w-14 h-14 rounded-full flex items-center justify-center font-serif text-2xl shrink-0 ${
                  selectedStudent.isPurchased 
                    ? 'bg-[#c79c6e]/10 border border-[#c79c6e]/40 text-[#c79c6e]' 
                    : 'bg-white/5 border border-white/10 text-white/50'
                }`}>
                  {selectedStudent.fullName ? selectedStudent.fullName.charAt(0).toUpperCase() : 'S'}
                </div>
                <div className="flex flex-col">
                  <h3 className="text-white font-medium text-lg">{selectedStudent.fullName}</h3>
                  <span className="text-[#c79c6e] text-xs font-mono">{selectedStudent.email}</span>
                  {selectedStudent.phoneNumber && (
                    <span className="text-white/50 text-xs mt-0.5">{selectedStudent.phoneNumber}</span>
                  )}
                </div>
              </div>

              {/* Purchase Details Box */}
              <div className="bg-[#111] border border-white/5 rounded-xl p-5 flex flex-col gap-4">
                <div className="flex items-center justify-between border-b border-white/5 pb-3">
                  <span className="text-xs uppercase tracking-widest text-white/50 font-medium">Course Access</span>
                  {selectedStudent.isPurchased ? (
                    <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                      <CheckCircle size={12} weight="fill" /> Enrolled (₹15,000 Paid)
                    </span>
                  ) : (
                    <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-white/5 text-white/50 border border-white/10">
                      Not Purchased
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="flex flex-col gap-1">
                    <span className="text-white/40 uppercase tracking-widest text-[0.65rem]">Joined Date</span>
                    <span className="text-white/80 font-medium">
                      {selectedStudent.createdAt ? new Date(selectedStudent.createdAt).toLocaleString('en-GB') : '—'}
                    </span>
                  </div>
                  <div className="flex flex-col gap-1">
                    <span className="text-white/40 uppercase tracking-widest text-[0.65rem]">Course Price</span>
                    <span className="text-white/80 font-medium font-mono">
                      {selectedStudent.isPurchased ? '₹15,000 (Lifetime)' : '₹0'}
                    </span>
                  </div>
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

            {/* Bottom Actions */}
            <div className="pt-6 border-t border-white/10 flex flex-col gap-3 mt-6">
              <button
                onClick={() => handleToggleAccess(selectedStudent._id)}
                disabled={isTogglingAccess}
                className={`w-full py-3 rounded-lg text-xs font-semibold uppercase tracking-widest transition-all ${
                  selectedStudent.isPurchased 
                    ? 'bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30' 
                    : 'bg-[#c79c6e] hover:bg-[#b0885e] text-black'
                }`}
              >
                {isTogglingAccess 
                  ? 'Updating...' 
                  : selectedStudent.isPurchased 
                    ? 'Revoke Course Access' 
                    : 'Grant Course Access (Manually)'}
              </button>
            </div>

          </div>
        )}
      </div>

    </div>
  );
}
