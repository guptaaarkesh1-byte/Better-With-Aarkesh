import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useToast } from '../context/ToastContext';
import Icon from '../components/common/AdminIcons';
import { API_URL } from '../utils/apiUrl';
import './AdminAppointments.css';

const inr = (n) => '₹' + Math.round(Number(n) || 0).toLocaleString('en-IN');
const COURSE_NAME = 'The Better Man™';
const COURSE_PRICE = 17700;
const COURSE_FREE_TOTAL = 3;

const formatQuestionnaireAnswers = (qa) => {
  if (!qa) return [];
  if (Array.isArray(qa)) {
    return qa.map((item, idx) => {
      if (typeof item === 'string') {
        return { question: `Question ${idx + 1}`, answer: item };
      }
      return {
        question: item.question || item.q || item.questionId || `Question ${idx + 1}`,
        answer: item.answer || item.a || item.optionLabel || item.optionId || (typeof item === 'object' ? JSON.stringify(item) : String(item))
      };
    });
  }
  if (typeof qa === 'object') {
    return Object.entries(qa).map(([key, val], idx) => {
      if (typeof val === 'object' && val !== null) {
        return {
          question: val.question || val.q || key,
          answer: val.answer || val.a || val.optionLabel || val.optionId || JSON.stringify(val)
        };
      }
      return {
        question: key,
        answer: String(val)
      };
    });
  }
  return [];
};

export default function AdminAppointmentsView() {
  const { showSuccess, showError, showInfo } = useToast();

  // Primary top subnav: 'merged' (Clients & Sessions) | 'clients' (By client) | 'fees' (Fee settings)
  const [subnavTab, setSubnavTab] = useState('merged');

  // 3-Way Segmented View: 'sessions' (Appointments) | 'courses' (Course students) | 'all_clients' (All students & clients)
  const [view, setView] = useState('sessions');

  // Filter Tabs per view
  const [sessionTab, setSessionTab] = useState('all'); // all, needs, today, upcoming, completed, rescheduled, cancelled, refunded
  const [courseTab, setCourseTab] = useState('all'); // all, free_left, free_done, failed
  const [allClientTab, setAllClientTab] = useState('all'); // all, course_students, coaching_only, registered_only

  // Dropdown & Search Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [sessionTypeFilter, setSessionTypeFilter] = useState('all'); // all, course_free, standard
  const [courseFilter, setCourseFilter] = useState('all'); // all, The Better Man™, none
  const [dateRangeFilter, setDateRangeFilter] = useState('all'); // all, today, week, month, past30
  const [sortBy, setSortBy] = useState('smart'); // smart, new, old

  // Data state
  const [appointments, setAppointments] = useState([]);
  const [students, setStudents] = useState([]);
  const [courseStats, setCourseStats] = useState({
    totalPurchased: 0,
    totalRevenue: 0,
    totalRegistered: 0,
    freeSessionsClaimed: 0
  });
  const [loading, setLoading] = useState(true);

  // Fee Settings state
  const [fees, setFees] = useState({ fee60min: 5000, fee90min: 7500 });
  const [feeDirty, setFeeDirty] = useState(false);
  const [savingFees, setSavingFees] = useState(false);

  // Drawer state
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [drawerMode, setDrawerMode] = useState('appt'); // 'appt' | 'client'
  const [selectedAppt, setSelectedAppt] = useState(null);
  const [selectedClient, setSelectedClient] = useState(null);
  const [drawerTab, setDrawerTab] = useState('overview'); // 'overview' | 'reschedule' | 'answers' | 'notes'
  const [refundConfirmId, setRefundConfirmId] = useState(null);

  // Coach Notes Autosave state
  const [coachNotesText, setCoachNotesText] = useState('');
  const [notesSaveStatus, setNotesSaveStatus] = useState('saved'); // 'saved' | 'saving' | 'dirty'
  const notesTimerRef = useRef(null);

  // Fetch all initial data
  const fetchData = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('adminToken');
      const headers = { Authorization: `Bearer ${token}` };

      const [appRes, stuRes, statsRes, feeRes] = await Promise.all([
        fetch(`${API_URL}/api/appointments/admin`, { headers }),
        fetch(`${API_URL}/api/course-auth/admin/students`, { headers }),
        fetch(`${API_URL}/api/course-auth/admin/stats`, { headers }),
        fetch(`${API_URL}/api/appointments/fees`, { headers })
      ]);

      if (appRes.ok) {
        const appData = await appRes.json();
        setAppointments(appData);
      }

      if (stuRes.ok) {
        const stuData = await stuRes.json();
        setStudents(stuData);
      }

      if (statsRes.ok) {
        const sData = await statsRes.json();
        setCourseStats(sData);
      }

      if (feeRes.ok) {
        const fData = await feeRes.json();
        setFees({
          fee60min: fData.fee60min || 5000,
          fee90min: fData.fee90min || 7500
        });
      }
    } catch (err) {
      console.error('Error fetching admin data:', err);
      showError('Failed to load dashboard data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Format Helpers
  const parseDate = (dStr) => {
    if (!dStr) return new Date(0);
    const d = new Date(dStr);
    return isNaN(d.getTime()) ? new Date(0) : d;
  };

  const formatDate = (dStr) => {
    if (!dStr) return '—';
    const d = parseDate(dStr);
    if (!d || d.getTime() === 0) return '—';
    return d.toLocaleDateString('en-IN', {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  const formatDateShort = (dStr) => {
    if (!dStr) return '—';
    const d = parseDate(dStr);
    if (!d || d.getTime() === 0) return '—';
    return d.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  const formatTime = (timeStr, dateStr) => {
    if (!timeStr && !dateStr) return '—';
    if (timeStr && (timeStr.includes(':') || timeStr.includes('AM') || timeStr.includes('PM'))) {
      return timeStr;
    }
    const d = parseDate(dateStr || timeStr);
    if (!d || d.getTime() === 0) return timeStr || '—';
    return d.toLocaleTimeString('en-IN', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    }).toUpperCase();
  };

  const isSameDay = (d1, d2) => {
    return (
      d1.getFullYear() === d2.getFullYear() &&
      d1.getMonth() === d2.getMonth() &&
      d1.getDate() === d2.getDate()
    );
  };

  // Helper to determine if appointment needs action
  const isNeedsAction = (app) => {
    const s = (app.status || '').toUpperCase();
    if (s === 'COMPLETED' || s === 'REFUNDED' || s === 'CANCELLED') return false;
    if (app.rescheduleRequested || app.rescheduleRequest?.status === 'PENDING') return true;
    if (app.paymentStatus === 'Pending' && !app.isFreeSession) return true;

    try {
      const appDateTime = new Date(`${app.date} ${app.time || '00:00'}`);
      if (!isNaN(appDateTime.getTime()) && appDateTime < new Date() && s !== 'COMPLETED') {
        return true;
      }
    } catch (e) {}

    return false;
  };

  // Build Unified Student / Client Directory
  const clientsDirectory = useMemo(() => {
    const map = new Map();

    // 1. Ingest Course Students
    students.forEach((stu) => {
      const email = (stu.email || '').toLowerCase().trim();
      if (!email) return;

      const primaryPurchase = (stu.purchases && stu.purchases.length > 0)
        ? stu.purchases.find(p => p.paymentStatus === 'Paid') || stu.purchases[0]
        : null;

      const isEnrolled = stu.isPurchased || (primaryPurchase && primaryPurchase.paymentStatus === 'Paid');

      map.set(email, {
        id: stu._id || email,
        acct: (stu._id || '').slice(-6).toUpperCase() || 'STUDENT',
        name: stu.name || stu.fullName || 'Student Client',
        email,
        phone: stu.phone || stu.phoneNumber || '',
        joined: stu.purchaseDate || stu.createdAt || new Date().toISOString(),
        isPurchased: Boolean(isEnrolled),
        hasFailedPayments: Boolean(stu.hasFailedPayments || (stu.purchases && stu.purchases.some(p => p.paymentStatus === 'Failed'))),
        purchases: stu.purchases || [],
        course: isEnrolled
          ? {
              name: stu.courseTitle || primaryPurchase?.courseTitle || COURSE_NAME,
              amount: primaryPurchase?.amount || COURSE_PRICE,
              txn: primaryPurchase?.transactionId || primaryPurchase?.razorpayPaymentId || 'pay_CourseEnrolled',
              order: primaryPurchase?.razorpayOrderId || '—',
              paidAt: primaryPurchase?.purchaseDate || stu.purchaseDate || stu.createdAt || new Date().toISOString(),
              freeSessionsTotal: stu.freeSessionsTotal !== undefined && Number(stu.freeSessionsTotal) > 0
                ? Number(stu.freeSessionsTotal)
                : (primaryPurchase?.freeSessionsGranted !== undefined && Number(primaryPurchase.freeSessionsGranted) > 0
                    ? Number(primaryPurchase.freeSessionsGranted)
                    : ((Number(stu.freeSessionsRemaining) || 0) + (Number(stu.freeSessionsClaimed) || 0) || 3))
            }
          : null,
        freeSessionsTotal: stu.freeSessionsTotal !== undefined && Number(stu.freeSessionsTotal) > 0
          ? Number(stu.freeSessionsTotal)
          : ((Number(stu.freeSessionsRemaining) || 0) + (Number(stu.freeSessionsClaimed) || 0) || (isEnrolled ? 3 : 0)),
        freeSessionsRemaining: stu.freeSessionsRemaining !== undefined
          ? Number(stu.freeSessionsRemaining)
          : (isEnrolled ? Math.max(0, 3 - (stu.freeSessionsClaimed || 0)) : 0),
        freeSessionsClaimed: stu.freeSessionsClaimed || 0,
        appointments: [],
        totalPaid: isEnrolled ? (primaryPurchase?.amount || COURSE_PRICE) : 0
      });
    });

    // 2. Ingest Appointment Clients
    appointments.forEach((app) => {
      const email = (app.email || app.userId?.email || 'unknown@client.com').toLowerCase().trim();
      if (!map.has(email)) {
        map.set(email, {
          id: app._id || email,
          acct: (app._id || '').slice(-6).toUpperCase() || 'CLIENT',
          name: app.name || app.userId?.name || 'Client',
          email,
          phone: app.phoneNumber ? `${app.countryCode || ''} ${app.phoneNumber}`.trim() : (app.phone || app.userId?.phone || ''),
          joined: app.createdAt || app.date || new Date().toISOString(),
          isPurchased: false,
          hasFailedPayments: false,
          purchases: [],
          course: null,
          freeSessionsRemaining: 0,
          freeSessionsClaimed: 0,
          appointments: [],
          totalPaid: 0
        });
      }

      const client = map.get(email);
      client.appointments.push(app);
      if (app.paymentStatus === 'Paid' && !app.isFreeSession && app.orderId !== 'COURSE_FREE_SESSION' && Number(app.amount) > 0) {
        client.totalPaid += Number(app.amount);
      }
    });

    return Array.from(map.values());
  }, [students, appointments]);

  // Find Client Helper
  const getClientForAppt = (app) => {
    const email = (app.email || app.userId?.email || '').toLowerCase().trim();
    const found = clientsDirectory.find((c) => c.email === email);
    if (found) return found;

    return {
      id: app._id,
      acct: (app._id || '').slice(-6).toUpperCase(),
      name: app.name || 'Anonymous Client',
      email: app.email || '—',
      phone: app.phoneNumber ? `${app.countryCode || ''} ${app.phoneNumber}`.trim() : (app.phone || ''),
      joined: app.createdAt || app.date,
      course: (app.isFreeSession || app.orderId === 'COURSE_FREE_SESSION') ? { name: COURSE_NAME, amount: COURSE_PRICE, paidAt: app.date } : null,
      appointments: [app],
      totalPaid: app.amount || 0
    };
  };

  const getClientFreeUsed = (client) => {
    const fromAppointments = client.appointments.filter(
      (s) => (s.isFreeSession || s.orderId === 'COURSE_FREE_SESSION') && (s.status || '').toUpperCase() !== 'CANCELLED'
    ).length;
    return Math.max(fromAppointments, client.freeSessionsClaimed || 0);
  };

  const getClientTotalFree = (client) => {
    if (!client) return 5;
    const fromCourse = client.course?.freeSessionsTotal;
    if (fromCourse !== undefined && fromCourse > 0) return Number(fromCourse);
    const fromClient = client.freeSessionsTotal;
    if (fromClient !== undefined && fromClient > 0) return Number(fromClient);
    const calculated = (client.freeSessionsRemaining || 0) + getClientFreeUsed(client);
    return calculated > 0 ? calculated : 5;
  };

  // Stats Calculations
  const stats = useMemo(() => {
    const enrolledStudents = clientsDirectory.filter((c) => Boolean(c.course) || c.isPurchased);
    const courseRevenue = enrolledStudents.reduce((sum, c) => sum + (c.course?.amount || COURSE_PRICE), 0);

    const paidSessions = appointments.filter((a) => a.paymentStatus === 'Paid' && !a.isFreeSession && a.orderId !== 'COURSE_FREE_SESSION');
    const sessionRevenue = paidSessions.reduce((sum, a) => sum + (Number(a.amount) || 5000), 0);

    const refundedSessions = appointments.filter((a) => a.paymentStatus === 'Refunded' || (a.status || '').toUpperCase() === 'REFUNDED');
    const refundedTotal = refundedSessions.reduce((sum, a) => sum + (Number(a.amount) || 5000), 0);

    const usedFree = enrolledStudents.reduce((sum, c) => sum + getClientFreeUsed(c), 0);
    const totalFreeAvailable = enrolledStudents.reduce((sum, c) => sum + getClientTotalFree(c), 0);

    const needsActionList = appointments.filter(isNeedsAction);
    const rescheduleRequests = appointments.filter((a) => a.rescheduleRequested || a.rescheduleRequest?.status === 'PENDING').length;

    return {
      courseRevenue,
      sessionRevenue,
      totalRevenue: courseRevenue + sessionRevenue,
      enrolledCount: enrolledStudents.length,
      paidSessionsCount: paidSessions.length,
      refundedTotal,
      cancelledCount: appointments.filter((a) => (a.status || '').toUpperCase() === 'CANCELLED').length,
      usedFree,
      totalFreeAvailable,
      needsActionCount: needsActionList.length,
      rescheduleRequestsCount: rescheduleRequests
    };
  }, [clientsDirectory, appointments]);

  // Date Range Predicate
  const matchesDateRange = (dateStr) => {
    if (dateRangeFilter === 'all') return true;
    const d = parseDate(dateStr);
    const now = new Date();

    if (dateRangeFilter === 'today') {
      return isSameDay(d, now);
    }
    if (dateRangeFilter === 'week') {
      const weekFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
      return d >= new Date(now.getFullYear(), now.getMonth(), now.getDate()) && d <= weekFromNow;
    }
    if (dateRangeFilter === 'month') {
      return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
    }
    if (dateRangeFilter === 'past30') {
      const past30 = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      return d <= now && d >= past30;
    }
    return true;
  };

  // Course Filter Predicate
  const matchesCourseFilter = (client) => {
    if (courseFilter === 'all') return true;
    if (courseFilter === 'none') return !client.course;
    return client.course && client.course.name.toLowerCase().includes(courseFilter.toLowerCase());
  };

  // Filtered Sessions (Appointments view)
  const filteredSessions = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();

    return appointments.filter((app) => {
      const client = getClientForAppt(app);
      const s = (app.status || '').toUpperCase();
      const isFree = app.isFreeSession || app.orderId === 'COURSE_FREE_SESSION';
      const isRescheduled = Boolean(app.rescheduledFrom || app.rescheduleRequested || app.rescheduleRequest?.status === 'PENDING');

      // Tab filter
      if (sessionTab === 'needs' && !isNeedsAction(app)) return false;
      if (sessionTab === 'today') {
        const appDate = parseDate(`${app.date} ${app.time || ''}`);
        if (s === 'CANCELLED' || !isSameDay(appDate, new Date())) return false;
      }
      if (sessionTab === 'upcoming') {
        if (s !== 'UPCOMING' && s !== '') return false;
      }
      if (sessionTab === 'completed' && s !== 'COMPLETED') return false;
      if (sessionTab === 'rescheduled' && !isRescheduled) return false;
      if (sessionTab === 'cancelled' && s !== 'CANCELLED') return false;
      if (sessionTab === 'refunded' && app.paymentStatus !== 'Refunded' && s !== 'REFUNDED') return false;

      // Dropdown filters
      if (sessionTypeFilter === 'course_free' && !isFree) return false;
      if (sessionTypeFilter === 'standard' && isFree) return false;

      if (!matchesCourseFilter(client)) return false;
      if (!matchesDateRange(`${app.date} ${app.time || ''}`)) return false;

      // Search query
      if (q) {
        const clientPurchasesTerms = (client?.purchases || []).flatMap(p => [
          p.transactionId,
          p.razorpayPaymentId,
          p.razorpayOrderId,
          p.paymentId,
          p.orderId,
          p.courseTitle,
          String(p._id || '')
        ]);
        const terms = [
          client?.name,
          client?.email,
          client?.phone,
          client?.acct,
          String(client?.id || ''),
          app?.name,
          app?.email,
          app?.phoneNumber,
          app?.phone,
          app?.countryCode,
          String(app?._id || ''),
          app?.paymentId,
          app?.orderId,
          app?.signature,
          app?.razorpayPaymentId,
          app?.razorpayOrderId,
          app?.calBookingUid,
          app?.date,
          app?.time,
          app?.reason,
          app?.extra,
          app?.status,
          app?.paymentStatus,
          app?.rescheduleRequest?.reschedulePaymentId,
          app?.rescheduleRequest?.rescheduleOrderId,
          app?.rescheduleRequest?.rescheduleSignature,
          app?.rescheduleRequest?.date,
          app?.rescheduleRequest?.time,
          app?.rescheduleRequest?.reason,
          client?.course?.name,
          client?.course?.txn,
          client?.course?.order,
          client?.course?.paymentId,
          client?.course?.orderId,
          client?.course?.razorpayPaymentId,
          client?.course?.razorpayOrderId,
          ...clientPurchasesTerms
        ];
        const hay = terms.filter(Boolean).join(' ').toLowerCase();
        if (!hay.includes(q)) return false;
      }

      return true;
    });
  }, [appointments, sessionTab, sessionTypeFilter, courseFilter, dateRangeFilter, searchQuery, clientsDirectory]);

  // Sorted Sessions
  const sortedSessions = useMemo(() => {
    const list = [...filteredSessions];

    if (sortBy === 'new') {
      return list.sort((a, b) => parseDate(`${b.date} ${b.time}`) - parseDate(`${a.date} ${a.time}`));
    }
    if (sortBy === 'old') {
      return list.sort((a, b) => parseDate(`${a.date} ${a.time}`) - parseDate(`${b.date} ${b.time}`));
    }

    // Default 'smart' sort: Needs action first, then upcoming by earliest date, then past
    const needs = list.filter(isNeedsAction).sort((a, b) => parseDate(`${a.date} ${a.time}`) - parseDate(`${b.date} ${b.time}`));
    const upcoming = list.filter((s) => !isNeedsAction(s) && (s.status || '').toUpperCase() === 'UPCOMING')
      .sort((a, b) => parseDate(`${a.date} ${a.time}`) - parseDate(`${b.date} ${b.time}`));
    const rest = list.filter((s) => !isNeedsAction(s) && (s.status || '').toUpperCase() !== 'UPCOMING')
      .sort((a, b) => parseDate(`${b.date} ${b.time}`) - parseDate(`${a.date} ${a.time}`));

    return [...needs, ...upcoming, ...rest];
  }, [filteredSessions, sortBy]);

  // Filtered Course Students (Course view)
  const filteredCourseStudents = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();

    return clientsDirectory.filter((client) => {
      // Must be a course purchaser / student
      if (!client.course && !client.isPurchased) return false;

      const used = getClientFreeUsed(client);
      const left = Math.max(0, COURSE_FREE_TOTAL - used);

      // Course tab filter
      if (courseTab === 'free_left' && left === 0) return false;
      if (courseTab === 'free_done' && left > 0) return false;
      if (courseTab === 'failed' && !client.hasFailedPayments) return false;

      if (!matchesCourseFilter(client)) return false;
      if (!matchesDateRange(client.course ? client.course.paidAt : client.joined)) return false;

      if (q) {
        const apptTerms = (client.appointments || []).flatMap((a) => [
          a.name,
          a.email,
          a.phoneNumber,
          a.phone,
          String(a._id || ''),
          a.paymentId,
          a.orderId,
          a.razorpayPaymentId,
          a.razorpayOrderId,
          a.calBookingUid,
          a.date,
          a.time,
          a.reason,
          a.rescheduleRequest?.reschedulePaymentId,
          a.rescheduleRequest?.rescheduleOrderId,
          a.rescheduleRequest?.rescheduleSignature,
          a.rescheduleRequest?.reason
        ]);
        const purchaseTerms = (client.purchases || []).flatMap((p) => [
          p.transactionId,
          p.razorpayPaymentId,
          p.razorpayOrderId,
          p.paymentId,
          p.orderId,
          p.courseTitle,
          p.courseId,
          p.paymentStatus,
          String(p._id || '')
        ]);
        const terms = [
          client.name,
          client.email,
          client.phone,
          String(client._id || ''),
          String(client.id || ''),
          String(client.acct || ''),
          client.course?.name,
          client.course?.txn,
          client.course?.order,
          client.course?.paymentId,
          client.course?.orderId,
          client.course?.razorpayPaymentId,
          client.course?.razorpayOrderId,
          ...apptTerms,
          ...purchaseTerms
        ];
        const hay = terms.filter(Boolean).join(' ').toLowerCase();
        if (!hay.includes(q)) return false;
      }

      return true;
    });
  }, [clientsDirectory, courseTab, courseFilter, dateRangeFilter, searchQuery]);

  const sortedCourseStudents = useMemo(() => {
    const list = [...filteredCourseStudents];
    return list.sort((a, b) => {
      const ad = parseDate(a.course ? a.course.paidAt : a.joined);
      const bd = parseDate(b.course ? b.course.paidAt : b.joined);
      return sortBy === 'old' ? ad - bd : bd - ad;
    });
  }, [filteredCourseStudents, sortBy]);

  // Filtered All Students & Clients (All Clients view)
  const filteredAllClients = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();

    return clientsDirectory.filter((client) => {
      const isCourse = Boolean(client.course) || client.isPurchased;
      const isCoachingOnly = !isCourse && client.appointments.length > 0;
      const isRegisteredOnly = !isCourse && client.appointments.length === 0;

      // Tab filter
      if (allClientTab === 'course_students' && !isCourse) return false;
      if (allClientTab === 'coaching_only' && !isCoachingOnly) return false;
      if (allClientTab === 'registered_only' && !isRegisteredOnly) return false;

      if (!matchesCourseFilter(client)) return false;
      if (!matchesDateRange(client.course ? client.course.paidAt : client.joined)) return false;

      if (q) {
        const apptTerms = (client.appointments || []).flatMap((a) => [
          a.name,
          a.email,
          a.phoneNumber,
          a.phone,
          String(a._id || ''),
          a.paymentId,
          a.orderId,
          a.razorpayPaymentId,
          a.razorpayOrderId,
          a.calBookingUid,
          a.date,
          a.time,
          a.reason,
          a.rescheduleRequest?.reschedulePaymentId,
          a.rescheduleRequest?.rescheduleOrderId,
          a.rescheduleRequest?.rescheduleSignature,
          a.rescheduleRequest?.reason
        ]);
        const purchaseTerms = (client.purchases || []).flatMap((p) => [
          p.transactionId,
          p.razorpayPaymentId,
          p.razorpayOrderId,
          p.paymentId,
          p.orderId,
          p.courseTitle,
          p.courseId,
          p.paymentStatus,
          String(p._id || '')
        ]);
        const terms = [
          client.name,
          client.email,
          client.phone,
          String(client._id || ''),
          String(client.id || ''),
          String(client.acct || ''),
          client.course?.name,
          client.course?.txn,
          client.course?.order,
          client.course?.paymentId,
          client.course?.orderId,
          client.course?.razorpayPaymentId,
          client.course?.razorpayOrderId,
          ...apptTerms,
          ...purchaseTerms
        ];
        const hay = terms.filter(Boolean).join(' ').toLowerCase();
        if (!hay.includes(q)) return false;
      }

      return true;
    });
  }, [clientsDirectory, allClientTab, courseFilter, dateRangeFilter, searchQuery]);

  const sortedAllClients = useMemo(() => {
    const list = [...filteredAllClients];
    return list.sort((a, b) => {
      const ad = parseDate(a.course ? a.course.paidAt : a.joined);
      const bd = parseDate(b.course ? b.course.paidAt : b.joined);
      return sortBy === 'old' ? ad - bd : bd - ad;
    });
  }, [filteredAllClients, sortBy]);

  // Drawer Open Handlers
  const openApptDrawer = (appt) => {
    const client = getClientForAppt(appt);
    setSelectedAppt(appt);
    setSelectedClient(client);
    setDrawerMode('appt');
    setDrawerTab('overview');
    setCoachNotesText(appt.coachNotes || appt.notes || '');
    setNotesSaveStatus('saved');
    setRefundConfirmId(null);
    setDrawerOpen(true);
  };

  const openClientDrawer = (client) => {
    setSelectedClient(client);
    setSelectedAppt(null);
    setDrawerMode('client');
    setDrawerOpen(true);
  };

  const closeDrawer = () => {
    setDrawerOpen(false);
    setRefundConfirmId(null);
  };

  // Status Change Handler
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
      if (selectedAppt?._id === appId) {
        setSelectedAppt((prev) => (prev ? { ...prev, status: normalizedStatus } : prev));
      }
    } catch (err) {
      showError('Failed to update appointment status.');
    }
  };

  // Reschedule Action Handler
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
      const updatedAppt = await res.json();
      showSuccess(`Reschedule request ${action === 'approve' ? 'approved' : 'declined'} successfully`);
      fetchData();
      if (selectedAppt?._id === appId) {
        setSelectedAppt(updatedAppt || ((prev) => (prev ? {
          ...prev,
          rescheduleRequested: false,
          rescheduleRequest: {
            ...prev.rescheduleRequest,
            status: action === 'approve' ? 'APPROVED' : 'REJECTED'
          }
        } : prev)));
      }
    } catch (err) {
      showError(`Failed to ${action} reschedule request.`);
    }
  };

  // Emergency Refund Handler
  const handleEmergencyRefund = async (appt) => {
    if (refundConfirmId !== appt._id) {
      setRefundConfirmId(appt._id);
      return;
    }

    try {
      const token = localStorage.getItem('adminToken');
      const res = await fetch(`${API_URL}/api/appointments/manual-refund`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          appointmentId: appt._id,
          amount: Number(appt.amount) || 5000,
          reason: 'Emergency refund issued by admin coach'
        })
      });

      if (!res.ok) throw new Error('Refund failed');
      showSuccess(`${inr(appt.amount || 5000)} refunded successfully`);
      setRefundConfirmId(null);
      fetchData();
      if (selectedAppt?._id === appt._id) {
        setSelectedAppt((prev) => (prev ? { ...prev, status: 'Refunded', paymentStatus: 'Refunded' } : prev));
      }
    } catch (err) {
      showError('Failed to process refund.');
    }
  };

  // Coach Notes Autosave
  const saveCoachNotes = async (textToSave) => {
    if (!selectedAppt?._id) return;
    clearTimeout(notesTimerRef.current);
    setNotesSaveStatus('saving');
    try {
      const token = localStorage.getItem('adminToken');
      const res = await fetch(`${API_URL}/api/appointments/admin/${selectedAppt._id}/notes`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          notes: textToSave,
          coachNotes: textToSave
        })
      });

      if (res.ok) {
        setNotesSaveStatus('saved');
        setSelectedAppt((prev) => (prev ? { ...prev, coachNotes: textToSave, notes: textToSave } : prev));
        setAppointments((prev) => prev.map((a) => (a._id === selectedAppt._id ? { ...a, coachNotes: textToSave, notes: textToSave } : a)));
      } else {
        setNotesSaveStatus('dirty');
      }
    } catch (err) {
      setNotesSaveStatus('dirty');
    }
  };

  const handleNotesChange = (text) => {
    setCoachNotesText(text);
    setNotesSaveStatus('saving');
    clearTimeout(notesTimerRef.current);
    notesTimerRef.current = setTimeout(() => {
      saveCoachNotes(text);
    }, 650);
  };

  // Save Fees Settings
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
      showError('Failed to save fee settings.');
    } finally {
      setSavingFees(false);
    }
  };

  // Clear Filters
  const handleClearFilters = () => {
    setSearchQuery('');
    setSessionTab('all');
    setCourseTab('all');
    setAllClientTab('all');
    setSessionTypeFilter('all');
    setCourseFilter('all');
    setDateRangeFilter('all');
    setSortBy(view === 'sessions' ? 'smart' : 'new');
  };

  const isFilterActive =
    Boolean(searchQuery.trim()) ||
    sessionTab !== 'all' ||
    courseTab !== 'all' ||
    allClientTab !== 'all' ||
    sessionTypeFilter !== 'all' ||
    courseFilter !== 'all' ||
    dateRangeFilter !== 'all';

  // UI Pills
  const renderStatusPill = (app) => {
    const s = (app.status || '').toUpperCase();
    const hasReschedule = app.rescheduleRequested || app.rescheduleRequest?.status === 'PENDING';

    if (s === 'CANCELLED') return <span className="bwa-pill p-cx">Cancelled</span>;
    if (s === 'COMPLETED') return <span className="bwa-pill p-done">Completed</span>;
    if (s === 'REFUNDED') return <span className="bwa-pill p-cx">Refunded</span>;
    if (hasReschedule) return <span className="bwa-pill p-re">Wants to reschedule</span>;

    try {
      const appDateTime = new Date(`${app.date} ${app.time || '00:00'}`);
      if (!isNaN(appDateTime.getTime()) && appDateTime < new Date()) {
        return <span className="bwa-pill p-re">Past · close it</span>;
      }
    } catch (e) {}

    if (app.rescheduledFrom) return <span className="bwa-pill p-re">Rescheduled</span>;
    return <span className="bwa-pill p-up">Upcoming</span>;
  };

  const renderPaymentPill = (app) => {
    const isFree = app.isFreeSession || app.orderId === 'COURSE_FREE_SESSION';
    if (isFree) return <span className="bwa-pill p-course">Free · in course</span>;
    if (app.paymentStatus === 'Refunded' || (app.status || '').toUpperCase() === 'REFUNDED') {
      return <span className="bwa-pill p-cx">{inr(app.amount || 5000)} refunded</span>;
    }
    return <span className="bwa-pill p-paid">{inr(app.amount || 5000)} paid</span>;
  };

  const copyToClipboard = (text) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    showInfo('Copied to clipboard');
  };

  const hasValidRescheduleRequest = (appt) => {
    if (!appt) return false;
    if (appt.rescheduledFrom) return true;
    const req = appt.rescheduleRequest;
    if (!req) return false;
    return Boolean(req.date && req.time && (req.status || req.requestedAt || req.reason || appt.rescheduleRequested));
  };

  const renderRescheduleDetails = (appt, isOverview = false) => {
    if (!appt || !hasValidRescheduleRequest(appt)) return null;
    const req = appt.rescheduleRequest;

    // Previous slot
    const originalDate = req?.originalDate || appt.date;
    const originalTime = req?.originalTime || appt.time;
    // Requested new slot
    const requestedDate = req?.date;
    const requestedTime = req?.time;

    // Status
    const status = (req?.status || (appt.rescheduleRequested ? 'PENDING' : 'APPROVED')).toUpperCase();

    // Original booking type
    const isOriginalFree = appt.isFreeSession || appt.orderId === 'COURSE_FREE_SESSION';
    const bookingTypeBadge = isOriginalFree ? (
      <span className="bwa-pill p-course" style={{ fontSize: '0.74rem', fontWeight: 600 }}>
        🎁 Free Course Perk Session
      </span>
    ) : (
      <span className="bwa-pill p-paid" style={{ fontSize: '0.74rem', fontWeight: 600 }}>
        💳 Paid Session Booking ({inr(appt.amount || 5000)})
      </span>
    );

    // 48-Hour Policy Window
    const isWithin48h = req?.isWithin48Hours === true || (req?.hoursRemainingAtRequest !== undefined && req?.hoursRemainingAtRequest < 48);

    // Charge / Credit status
    const usedCredit = req?.usedFreeSessionCredit === true;
    const feePaid = req?.rescheduleFeePaid === true || (Number(req?.rescheduleAmount) > 0);
    const feeAmount = Number(req?.rescheduleAmount) || 5000;

    return (
      <div
        className="bwa-box"
        style={{
          borderLeft: status === 'PENDING' ? '4px solid #d97706' : status === 'APPROVED' ? '4px solid #16a34a' : '4px solid #dc2626',
          background: status === 'PENDING' ? '#fffdfa' : '#ffffff',
          marginBottom: isOverview ? '20px' : '16px',
          boxShadow: status === 'PENDING' ? '0 2px 10px rgba(217, 119, 6, 0.08)' : 'none'
        }}
      >
        {/* Header with Title and Status */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '12px', flexWrap: 'wrap', marginBottom: '14px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
              <h4 className="big" style={{ margin: 0, color: '#111010' }}>
                Reschedule Request Details
              </h4>
              {status === 'PENDING' && (
                <span className="bwa-pill p-re" style={{ background: '#fef3c7', color: '#92400e', fontWeight: 700, fontSize: '0.72rem' }}>
                  ⏳ Pending Coach Approval
                </span>
              )}
              {status === 'APPROVED' && (
                <span className="bwa-pill p-done" style={{ background: '#dcfce7', color: '#166534', fontWeight: 700, fontSize: '0.72rem' }}>
                  ✓ Approved &amp; Confirmed
                </span>
              )}
              {(status === 'REJECTED' || status === 'DECLINED') && (
                <span className="bwa-pill p-cx" style={{ background: '#fee2e2', color: '#991b1b', fontWeight: 700, fontSize: '0.72rem' }}>
                  ✕ Declined · Original Time Kept
                </span>
              )}
            </div>
            <p className="hint" style={{ margin: '3px 0 0', fontSize: '0.78rem' }}>
              {(() => {
                if (!req?.requestedAt) return 'Review client schedule modification request';
                const d = new Date(req.requestedAt);
                if (isNaN(d.getTime())) return 'Review client schedule modification request';
                return `Requested on ${d.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })}, ${d.toLocaleTimeString('en-IN', { hour: 'numeric', minute: '2-digit', hour12: true })}`;
              })()}
            </p>
          </div>
        </div>

        {/* Schedule Change Comparison Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))',
          gap: '12px',
          background: '#fcfaf7',
          padding: '14px',
          borderRadius: '10px',
          border: '1px solid #eae2d6',
          marginBottom: '14px'
        }}>
          {/* Previous / Original Slot */}
          <div style={{ borderRight: '1px dashed #e2d9cd', paddingRight: '10px' }}>
            <span style={{ fontSize: '0.68rem', textTransform: 'uppercase', letterSpacing: '0.06em', color: '#888', fontWeight: 700, display: 'block', marginBottom: '4px' }}>
              📅 Previous / Original Slot
            </span>
            <div style={{ fontSize: '0.92rem', fontWeight: 700, color: '#443d39', textDecoration: status === 'APPROVED' ? 'line-through' : 'none' }}>
              {formatDate(originalDate)}
            </div>
            <div style={{ fontSize: '0.84rem', color: '#666', marginTop: '2px' }}>
              Time: <b>{formatTime(originalTime)}</b>
            </div>
          </div>

          {/* Requested New Slot */}
          <div>
            <span style={{ fontSize: '0.68rem', textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--accent, #c9542f)', fontWeight: 700, display: 'block', marginBottom: '4px' }}>
              👉 Requested New Slot
            </span>
            <div style={{ fontSize: '0.96rem', fontWeight: 700, color: '#111010' }}>
              {requestedDate ? formatDate(requestedDate) : 'Not specified'}
            </div>
            <div style={{ fontSize: '0.84rem', color: 'var(--accent, #c9542f)', fontWeight: 600, marginTop: '2px' }}>
              Time: <b>{requestedTime ? formatTime(requestedTime) : 'Not specified'}</b>
            </div>
          </div>
        </div>

        {/* 48-Hour Notice Policy & Reschedule Payment Breakdown */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '14px' }}>
          {/* 48-Hour Policy Window Card */}
          <div style={{
            padding: '10px 12px',
            borderRadius: '8px',
            background: isWithin48h ? 'rgba(217, 119, 6, 0.08)' : 'rgba(22, 163, 74, 0.08)',
            border: isWithin48h ? '1px solid rgba(217, 119, 6, 0.3)' : '1px solid rgba(22, 163, 74, 0.25)',
            display: 'flex',
            alignItems: 'flex-start',
            gap: '10px'
          }}>
            <span style={{ fontSize: '1.2rem', lineHeight: 1 }}>{isWithin48h ? '⏱️' : '🕒'}</span>
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '4px' }}>
                <span style={{ fontSize: '0.82rem', fontWeight: 700, color: isWithin48h ? '#b45309' : '#15803d' }}>
                  {isWithin48h ? 'Within 48-Hour Window (Late Notice Reschedule)' : 'Advance Notice (>48 Hours Notice)'}
                </span>
                <span className="bwa-pill" style={{
                  fontSize: '0.66rem',
                  fontWeight: 700,
                  background: isWithin48h ? '#fef3c7' : '#dcfce7',
                  color: isWithin48h ? '#92400e' : '#166534'
                }}>
                  {isWithin48h ? '< 48 Hours Notice' : '> 48 Hours Notice'}
                </span>
              </div>
              <p style={{ margin: '3px 0 0', fontSize: '0.76rem', color: '#555', lineHeight: 1.4 }}>
                {isWithin48h
                  ? 'Policy rule: Reschedules requested within 48 hours of session require 1 Complimentary Session Credit or a ₹5,000 reschedule fee.'
                  : 'Policy rule: Requested more than 48 hours before session. Client is eligible for free reschedule under standard advance policy.'}
              </p>
            </div>
          </div>

          {/* Payment / Session Credit Deduction Card */}
          <div style={{
            padding: '10px 12px',
            borderRadius: '8px',
            background: '#faf7f2',
            border: '1px solid #ebd8c5',
            display: 'flex',
            alignItems: 'flex-start',
            gap: '10px'
          }}>
            <span style={{ fontSize: '1.2rem', lineHeight: 1 }}>{usedCredit ? '🎟️' : feePaid ? '💰' : '🆓'}</span>
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '6px' }}>
                <span style={{ fontSize: '0.82rem', fontWeight: 700, color: '#222' }}>
                  {usedCredit
                    ? 'Complimentary Session Credit Used'
                    : feePaid
                    ? `Late Reschedule Fee Paid (${inr(feeAmount)})`
                    : !isWithin48h
                    ? 'Free Reschedule (Standard Advance Notice)'
                    : 'Late Reschedule Fee Unpaid / Pending'}
                </span>
                <span className="bwa-pill" style={{
                  fontSize: '0.68rem',
                  fontWeight: 700,
                  background: usedCredit ? '#e0f2fe' : feePaid ? '#dcfce7' : '#f3f4f6',
                  color: usedCredit ? '#0369a1' : feePaid ? '#15803d' : '#374151'
                }}>
                  {usedCredit ? '1 Free Credit Held' : feePaid ? 'Paid via Razorpay' : !isWithin48h ? '₹0 Policy Charge' : 'Action Needed'}
                </span>
              </div>
              <p style={{ margin: '3px 0 0', fontSize: '0.76rem', color: '#666', lineHeight: 1.4 }}>
                {usedCredit && 'Client used 1 of their available course free 1-on-1 session credits for this reschedule. Credit is held on account and will be refunded if you decline.'}
                {feePaid && `Late reschedule fee received via Razorpay (Payment ID: ${req?.reschedulePaymentId || 'Recorded'}).`}
                {!usedCredit && !feePaid && !isWithin48h && 'No fee or credit charged. Rescheduled with >48h advance notice under standard policy.'}
                {!usedCredit && !feePaid && isWithin48h && 'Late reschedule requested without credit deduction or fee payment. Please verify.'}
              </p>
            </div>
          </div>
        </div>

        {/* Client Reason & Original Booking Type */}
        <div style={{
          padding: '10px 12px',
          background: '#ffffff',
          borderRadius: '8px',
          border: '1px solid #e8e3dc',
          display: 'flex',
          flexDirection: 'column',
          gap: '8px',
          marginBottom: '14px'
        }}>
          <div>
            <span style={{ fontSize: '0.68rem', textTransform: 'uppercase', letterSpacing: '0.06em', color: '#888', fontWeight: 700, display: 'block' }}>
              Client Reason for Rescheduling:
            </span>
            <p style={{ margin: '3px 0 0', fontSize: '0.84rem', color: '#111010', fontStyle: req?.reason ? 'italic' : 'normal', lineHeight: 1.4 }}>
              {req?.reason ? `"${req.reason}"` : 'No specific reason provided by client.'}
            </p>
          </div>

          <div style={{ borderTop: '1px solid #f0ebe4', paddingTop: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '6px' }}>
            <span style={{ fontSize: '0.74rem', color: '#777' }}>
              Original Booking Type:
            </span>
            <div>{bookingTypeBadge}</div>
          </div>
        </div>

        {/* Action Buttons for Pending Requests */}
        {status === 'PENDING' && (
          <div style={{
            paddingTop: '12px',
            borderTop: '1px solid #eee5dc',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '10px',
            flexWrap: 'wrap'
          }}>
            <span style={{ fontSize: '0.74rem', color: '#666', maxWidth: '320px' }}>
              {usedCredit
                ? 'Declining will keep original slot and automatically refund 1 session credit back to client.'
                : feePaid
                ? `Declining will keep original slot and initiate refund of the ${inr(feeAmount)} reschedule fee.`
                : 'Approve to officially confirm new time and update Google Meet invite.'}
            </span>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                type="button"
                className="bwa-btn bwa-btn-sm"
                style={{
                  background: 'var(--accent, #c9542f)',
                  color: '#ffffff',
                  fontWeight: 600,
                  fontSize: '0.78rem',
                  padding: '6px 14px',
                  borderRadius: '6px',
                  border: 'none',
                  cursor: 'pointer'
                }}
                onClick={() => handleRescheduleAction(appt._id, 'approve')}
              >
                ✓ Approve new time
              </button>
              <button
                type="button"
                className="bwa-btn bwa-btn-line bwa-btn-sm"
                style={{
                  fontSize: '0.78rem',
                  padding: '6px 14px',
                  borderRadius: '6px',
                  cursor: 'pointer'
                }}
                onClick={() => handleRescheduleAction(appt._id, 'decline')}
              >
                ✕ Keep old time
              </button>
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="bwa-appts-page">
      <div className="bwa-shell">
        {/* Top-Level Sub Navigation */}
        <div className="bwa-subnav" role="tablist" aria-label="Clients and Sessions navigation">
          <button
            role="tab"
            aria-selected={subnavTab === 'merged'}
            className={`bwa-subnav-btn ${subnavTab === 'merged' ? 'active' : ''}`}
            onClick={() => setSubnavTab('merged')}
          >
            <Icon name="calendar" size={16} />
            Clients &amp; Sessions
          </button>
          <button
            role="tab"
            aria-selected={subnavTab === 'clients'}
            className={`bwa-subnav-btn ${subnavTab === 'clients' ? 'active' : ''}`}
            onClick={() => setSubnavTab('clients')}
          >
            <Icon name="user" size={16} />
            By client
          </button>
          <button
            role="tab"
            aria-selected={subnavTab === 'fees'}
            className={`bwa-subnav-btn ${subnavTab === 'fees' ? 'active' : ''}`}
            onClick={() => setSubnavTab('fees')}
          >
            <Icon name="rupee" size={16} />
            Fee settings
          </button>
        </div>

        {/* ----------------- SUBNAV TAB 1: MERGED CLIENTS & SESSIONS ----------------- */}
        {subnavTab === 'merged' && (
          <>
            {/* Header with Title & 3-Way Segmented Toggle */}
            <div className="bwa-head">
              <div>
                <h1>
                  {view === 'sessions'
                    ? 'Appointments'
                    : view === 'courses'
                    ? 'Course students'
                    : 'All students & clients'}
                </h1>
                <p>
                  {view === 'sessions'
                    ? "Every booking, with the client's course and payment status."
                    : view === 'courses'
                    ? 'Everyone who purchased a course, with payment details and 3 free 1-on-1 coaching sessions balance.'
                    : 'Complete directory of everyone who registered, enrolled, or booked.'}
                </p>
              </div>
              <div className="bwa-seg" role="tablist" aria-label="View toggle">
                <button
                  role="tab"
                  aria-selected={view === 'sessions'}
                  className={view === 'sessions' ? 'active' : ''}
                  onClick={() => {
                    setView('sessions');
                    setSortBy('smart');
                  }}
                >
                  Appointments
                </button>
                <button
                  role="tab"
                  aria-selected={view === 'courses'}
                  className={view === 'courses' ? 'active' : ''}
                  onClick={() => {
                    setView('courses');
                    setSortBy('new');
                  }}
                >
                  Course students
                </button>
                <button
                  role="tab"
                  aria-selected={view === 'all_clients'}
                  className={view === 'all_clients' ? 'active' : ''}
                  onClick={() => {
                    setView('all_clients');
                    setSortBy('new');
                  }}
                >
                  All students &amp; clients
                </button>
              </div>
            </div>

            {/* Needs Action Alert Banner */}
            {stats.needsActionCount > 0 && (
              <div className="bwa-alert">
                <span className="ic">{stats.needsActionCount}</span>
                <div>
                  <b>
                    {stats.needsActionCount} {stats.needsActionCount > 1 ? 'sessions need' : 'session needs'} your action
                  </b>
                  <span>
                    {stats.rescheduleRequestsCount > 0 && `${stats.rescheduleRequestsCount} reschedule request(s)`}
                    {stats.rescheduleRequestsCount > 0 && stats.needsActionCount - stats.rescheduleRequestsCount > 0 && ' · '}
                    {stats.needsActionCount - stats.rescheduleRequestsCount > 0 &&
                      `${stats.needsActionCount - stats.rescheduleRequestsCount} past / pending session(s)`}
                  </span>
                </div>
                <button
                  className="bwa-btn bwa-btn-accent bwa-btn-sm btn-action"
                  onClick={() => {
                    setView('sessions');
                    setSessionTab('needs');
                  }}
                >
                  Review
                </button>
              </div>
            )}

            {/* 4-Group Stats Row */}
            <div className="bwa-stats-grid">
              {/* Money Collected Card (Wide) */}
              <div className="bwa-stat-card g">
                <div className="lab">Money collected</div>
                <div className="bwa-rev-cols">
                  <div className="bwa-rev-col">
                    <div className="k">Course sales</div>
                    <div className="big">{inr(stats.courseRevenue)}</div>
                    <div className="det">
                      {stats.enrolledCount} student{stats.enrolledCount === 1 ? '' : 's'} × {inr(COURSE_PRICE)}
                    </div>
                  </div>
                  <div className="bwa-rev-col">
                    <div className="k">Session bookings</div>
                    <div className="big">{inr(stats.sessionRevenue)}</div>
                    <div className="det">
                      {stats.paidSessionsCount} paid 1-on-1 session{stats.paidSessionsCount === 1 ? '' : 's'}
                    </div>
                  </div>
                  <div className="bwa-rev-col tot">
                    <div className="k">Total collected</div>
                    <div className="big">{inr(stats.totalRevenue)}</div>
                    <div className="det">
                      {stats.refundedTotal > 0 ? `Excl. ${inr(stats.refundedTotal)} refunded` : 'Course + 1-on-1 sessions'}
                    </div>
                  </div>
                </div>
              </div>

              {/* Course Students */}
              <div className="bwa-stat-card b">
                <div className="lab">Course students</div>
                <div className="big">{stats.enrolledCount}</div>
                <div className="det">{COURSE_NAME}</div>
              </div>

              {/* Free Sessions Used */}
              <div className="bwa-stat-card o">
                <div className="lab">Free sessions used</div>
                <div className="big">
                  {stats.usedFree} of {stats.totalFreeAvailable}
                </div>
                <div className="det">{Math.max(0, stats.totalFreeAvailable - stats.usedFree)} still available to book</div>
              </div>

              {/* Refunded Card */}
              <div className="bwa-stat-card s">
                <div className="lab">Refunded</div>
                <div className="big">{inr(stats.refundedTotal)}</div>
                <div className="det">{stats.cancelledCount} cancelled sessions</div>
              </div>
            </div>

            {/* Filter Tabs */}
            <div className="bwa-tabs" role="tablist">
              {view === 'sessions' && (
                <>
                  {[
                    ['all', 'All', appointments.length],
                    ['needs', 'Needs action', stats.needsActionCount],
                    [
                      'today',
                      'Today',
                      appointments.filter(
                        (a) =>
                          (a.status || '').toUpperCase() !== 'CANCELLED' &&
                          isSameDay(parseDate(`${a.date} ${a.time || ''}`), new Date())
                      ).length
                    ],
                    [
                      'upcoming',
                      'Upcoming',
                      appointments.filter((a) => (a.status || '').toUpperCase() === 'UPCOMING' || !a.status).length
                    ],
                    [
                      'completed',
                      'Completed',
                      appointments.filter((a) => (a.status || '').toUpperCase() === 'COMPLETED').length
                    ],
                    [
                      'rescheduled',
                      'Rescheduled',
                      appointments.filter(
                        (a) => a.rescheduledFrom || a.rescheduleRequested || a.rescheduleRequest?.status === 'PENDING'
                      ).length
                    ],
                    [
                      'cancelled',
                      'Cancelled',
                      appointments.filter((a) => (a.status || '').toUpperCase() === 'CANCELLED').length
                    ],
                    [
                      'refunded',
                      'Refunded',
                      appointments.filter(
                        (a) => a.paymentStatus === 'Refunded' || (a.status || '').toUpperCase() === 'REFUNDED'
                      ).length
                    ]
                  ].map(([key, label, count]) => (
                    <button
                      key={key}
                      role="tab"
                      aria-selected={sessionTab === key}
                      className={`bwa-tab-btn ${sessionTab === key ? 'on' : ''} ${key === 'needs' && count > 0 ? 'hot' : ''}`}
                      onClick={() => setSessionTab(key)}
                    >
                      {label}
                      <span className="n">{count}</span>
                    </button>
                  ))}
                </>
              )}

              {view === 'courses' && (
                <>
                  {[
                    ['all', 'All students', clientsDirectory.filter((c) => Boolean(c.course) || c.isPurchased).length],
                    [
                      'free_left',
                      'Free sessions left',
                      clientsDirectory.filter((c) => (c.course || c.isPurchased) && COURSE_FREE_TOTAL - getClientFreeUsed(c) > 0).length
                    ],
                    [
                      'free_done',
                      'All free used',
                      clientsDirectory.filter((c) => (c.course || c.isPurchased) && COURSE_FREE_TOTAL - getClientFreeUsed(c) <= 0).length
                    ],
                    [
                      'failed',
                      'Failed checkouts',
                      clientsDirectory.filter((c) => c.hasFailedPayments).length
                    ]
                  ].map(([key, label, count]) => (
                    <button
                      key={key}
                      role="tab"
                      aria-selected={courseTab === key}
                      className={`bwa-tab-btn ${courseTab === key ? 'on' : ''}`}
                      onClick={() => setCourseTab(key)}
                    >
                      {label}
                      <span className="n">{count}</span>
                    </button>
                  ))}
                </>
              )}

              {view === 'all_clients' && (
                <>
                  {[
                    ['all', 'Everyone', clientsDirectory.length],
                    [
                      'course_students',
                      'Course students',
                      clientsDirectory.filter((c) => Boolean(c.course) || c.isPurchased).length
                    ],
                    [
                      'coaching_only',
                      'Coaching only',
                      clientsDirectory.filter((c) => !c.course && !c.isPurchased && c.appointments.length > 0).length
                    ],
                    [
                      'registered_only',
                      'Registered (no purchase)',
                      clientsDirectory.filter((c) => !c.course && !c.isPurchased && c.appointments.length === 0).length
                    ]
                  ].map(([key, label, count]) => (
                    <button
                      key={key}
                      role="tab"
                      aria-selected={allClientTab === key}
                      className={`bwa-tab-btn ${allClientTab === key ? 'on' : ''}`}
                      onClick={() => setAllClientTab(key)}
                    >
                      {label}
                      <span className="n">{count}</span>
                    </button>
                  ))}
                </>
              )}
            </div>

            {/* Filter Toolbar */}
            <div className="bwa-filters-bar">
              <div className="bwa-f bwa-search-f">
                <label>Search</label>
                <input
                  type="search"
                  placeholder="Search name, email, phone or payment ID"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>

              {view === 'sessions' && (
                <div className="bwa-f">
                  <label>Session type</label>
                  <select value={sessionTypeFilter} onChange={(e) => setSessionTypeFilter(e.target.value)}>
                    <option value="all">All types</option>
                    <option value="course_free">Free session (course perk)</option>
                    <option value="standard">Paid 1-on-1 session</option>
                  </select>
                </div>
              )}

              <div className="bwa-f">
                <label>Course bought</label>
                <select value={courseFilter} onChange={(e) => setCourseFilter(e.target.value)}>
                  <option value="all">Any / no course</option>
                  <option value={COURSE_NAME}>{COURSE_NAME}</option>
                  <option value="none">No course bought</option>
                </select>
              </div>

              <div className="bwa-f">
                <label>{view === 'sessions' ? 'Session date' : 'Joined / bought on'}</label>
                <select value={dateRangeFilter} onChange={(e) => setDateRangeFilter(e.target.value)}>
                  <option value="all">All time</option>
                  <option value="today">Today</option>
                  <option value="week">Next 7 days</option>
                  <option value="month">This month</option>
                  <option value="past30">Last 30 days</option>
                </select>
              </div>

              <div className="bwa-f">
                <label>Sort by</label>
                <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
                  {view === 'sessions' ? (
                    <>
                      <option value="smart">Needs action first</option>
                      <option value="new">Newest first</option>
                      <option value="old">Oldest first</option>
                    </>
                  ) : (
                    <>
                      <option value="new">Newest first</option>
                      <option value="old">Oldest first</option>
                    </>
                  )}
                </select>
              </div>

              {isFilterActive && (
                <button className="bwa-link-btn" onClick={handleClearFilters}>
                  Clear filters
                </button>
              )}
            </div>

            {/* Results Counter */}
            <p className="bwa-result-count">
              {view === 'sessions'
                ? `Showing ${sortedSessions.length} of ${appointments.length} appointments`
                : view === 'courses'
                ? `Showing ${sortedCourseStudents.length} of ${clientsDirectory.filter((c) => Boolean(c.course) || c.isPurchased).length} course students`
                : `Showing ${sortedAllClients.length} of ${clientsDirectory.length} total clients & users`}
            </p>

            {/* Table / List Container */}
            <div className="bwa-table-card">
              {loading ? (
                <div className="bwa-empty-box">
                  <h3>Loading...</h3>
                  <p>Fetching records and financial stats...</p>
                </div>
              ) : view === 'sessions' ? (
                /* ================= 1. APPOINTMENTS VIEW ================= */
                sortedSessions.length === 0 ? (
                  <div className="bwa-empty-box">
                    <h3>No appointments found</h3>
                    <p>Nothing matches these filters. Clear filters to see everything.</p>
                    <button className="bwa-btn bwa-btn-dark" onClick={handleClearFilters}>
                      Clear filters
                    </button>
                  </div>
                ) : (
                  <>
                    <div className="bwa-table-row sess th">
                      <div>Client</div>
                      <div>Date &amp; time</div>
                      <div>Session</div>
                      <div>Status</div>
                      <div>Payment</div>
                      <div></div>
                    </div>
                    {sortedSessions.map((app) => {
                      const client = getClientForAppt(app);
                      const isFree = app.isFreeSession || app.orderId === 'COURSE_FREE_SESSION';
                      const needsAct = isNeedsAction(app);

                      return (
                        <div key={app._id} className={`bwa-table-row sess ${needsAct ? 'warn' : ''}`}>
                          <div className="bwa-who">
                            <span className="bwa-av">{client.name?.[0]?.toUpperCase() || 'C'}</span>
                            <div style={{ minWidth: 0 }}>
                              <b>{client.name}</b>
                              <span className="s">{client.email}</span>
                              <span className="s">{client.phone || 'No phone'}</span>
                            </div>
                          </div>

                          <div className="bwa-cell" data-label="Date & time">
                            <b>{formatDate(app.date)}</b>
                            <span className="s">
                              {formatTime(app.time, app.date)} · {app.duration || 60} mins
                            </span>
                            {app.rescheduledFrom && (
                              <span className="was">
                                Was {formatDateShort(app.rescheduledFrom)}, {formatTime(app.rescheduledFrom)}
                              </span>
                            )}
                          </div>

                          <div className="bwa-cell" data-label="Session">
                            <b>{isFree ? 'Free session (course perk)' : 'Paid 1-on-1 session'}</b>
                            {client.course ? (
                              <span className="s ctag">Course: {client.course.name}</span>
                            ) : (
                              <span className="s">No course bought</span>
                            )}
                          </div>

                          <div className="bwa-cell" data-label="Status">
                            {renderStatusPill(app)}
                          </div>

                          <div className="bwa-cell" data-label="Payment">
                            {renderPaymentPill(app)}
                            {app.rescheduleRequest?.rescheduleFee > 0 && (
                              <span className="s was" style={{ marginTop: '2px' }}>
                                + {inr(app.rescheduleRequest.rescheduleFee)} reschedule fee
                              </span>
                            )}
                          </div>

                          <div className="bwa-act">
                            <button className="bwa-btn bwa-btn-line" onClick={() => openApptDrawer(app)}>
                              View detail
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </>
                )
              ) : view === 'courses' ? (
                /* ================= 2. COURSE STUDENTS VIEW ================= */
                sortedCourseStudents.length === 0 ? (
                  <div className="bwa-empty-box">
                    <h3>No course students found</h3>
                    <p>Nothing matches these filters. Clear filters to see everyone.</p>
                    <button className="bwa-btn bwa-btn-dark" onClick={handleClearFilters}>
                      Clear filters
                    </button>
                  </div>
                ) : (
                  <>
                    <div className="bwa-table-row stu th">
                      <div>Student / client</div>
                      <div>Course bought</div>
                      <div>Free sessions</div>
                      <div>Payment</div>
                      <div>Next session</div>
                      <div></div>
                    </div>
                    {sortedCourseStudents.map((client) => {
                      const used = getClientFreeUsed(client);
                      const left = Math.max(0, COURSE_FREE_TOTAL - used);
                      const nextAppt = client.appointments
                        .filter((s) => (s.status || '').toUpperCase() === 'UPCOMING')
                        .sort((a, b) => parseDate(`${a.date} ${a.time}`) - parseDate(`${b.date} ${b.time}`))[0];

                      return (
                        <div key={client.id} className="bwa-table-row stu">
                          <div className="bwa-who">
                            <span className="bwa-av">{client.name?.[0]?.toUpperCase() || 'S'}</span>
                            <div style={{ minWidth: 0 }}>
                              <b>{client.name}</b>
                              <span className="s">{client.email}</span>
                              <span className="s">{client.phone || 'No phone'}</span>
                            </div>
                          </div>

                          <div className="bwa-cell" data-label="Course bought">
                            {client.course ? (
                              <>
                                <b>{client.course.name}</b>
                                <span className="s">
                                  {formatDateShort(client.course.paidAt)}
                                </span>
                              </>
                            ) : (
                              <span className="none">No course bought</span>
                            )}
                          </div>

                          <div className="bwa-cell" data-label="Free sessions">
                            {client.course ? (
                              <>
                                <div className="bwa-bars">
                                  {Array.from({ length: Math.max(1, getClientTotalFree(client)) }).map((_, i) => (
                                    <i key={i} className={i < used ? 'on' : ''} />
                                  ))}
                                </div>
                                <b>
                                  {used} of {getClientTotalFree(client)} used
                                </b>
                                <span className="s">{Math.max(0, getClientTotalFree(client) - used)} left to book</span>
                              </>
                            ) : (
                              <span className="none">Not applicable</span>
                            )}
                          </div>

                          <div className="bwa-cell" data-label="Payment">
                            {client.course ? (
                              <>
                                <span className="bwa-pill p-paid">{inr(client.course.amount)} paid</span>
                                <span className="s bwa-mono" style={{ marginTop: '4px' }}>
                                  {client.course.txn}
                                </span>
                              </>
                            ) : (
                              <span className="none">—</span>
                            )}
                          </div>

                          <div className="bwa-cell" data-label="Next session">
                            {nextAppt ? (
                              <>
                                <b>{formatDateShort(nextAppt.date)}</b>
                                <span className="s">{formatTime(nextAppt.time, nextAppt.date)}</span>
                              </>
                            ) : (
                              <span className="none">None booked</span>
                            )}
                          </div>

                          <div className="bwa-act">
                            <button className="bwa-btn bwa-btn-line" onClick={() => openClientDrawer(client)}>
                              View detail
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </>
                )
              ) : (
                /* ================= 3. ALL STUDENTS & CLIENTS VIEW ================= */
                sortedAllClients.length === 0 ? (
                  <div className="bwa-empty-box">
                    <h3>No users found</h3>
                    <p>Nothing matches these filters. Clear filters to see everyone.</p>
                    <button className="bwa-btn bwa-btn-dark" onClick={handleClearFilters}>
                      Clear filters
                    </button>
                  </div>
                ) : (
                  <>
                    <div className="bwa-table-row stu th">
                      <div>User / Client</div>
                      <div>Course enrolled</div>
                      <div>Total sessions</div>
                      <div>Total spend</div>
                      <div>Status</div>
                      <div></div>
                    </div>
                    {sortedAllClients.map((client) => {
                      const usedFree = getClientFreeUsed(client);
                      const isCourse = Boolean(client.course) || client.isPurchased;

                      return (
                        <div key={client.id} className="bwa-table-row stu">
                          <div className="bwa-who">
                            <span className="bwa-av">{client.name?.[0]?.toUpperCase() || 'C'}</span>
                            <div style={{ minWidth: 0 }}>
                              <b>{client.name}</b>
                              <span className="s">{client.email}</span>
                              <span className="s">{client.phone || 'No phone'}</span>
                            </div>
                          </div>

                          <div className="bwa-cell" data-label="Course enrolled">
                            {isCourse ? (
                              <>
                                <b>{client.course?.name || COURSE_NAME}</b>
                                <span className="s">
                                  {usedFree}/{COURSE_FREE_TOTAL} free perks used
                                </span>
                              </>
                            ) : (
                              <span className="none">No course bought</span>
                            )}
                          </div>

                          <div className="bwa-cell" data-label="Total sessions">
                            <b>{client.appointments.length} sessions</b>
                            <span className="s">
                              {client.appointments.filter((a) => (a.status || '').toUpperCase() === 'COMPLETED').length}{' '}
                              completed
                            </span>
                          </div>

                          <div className="bwa-cell" data-label="Total spend">
                            {client.totalPaid > 0 ? (
                              <span className="bwa-pill p-paid">{inr(client.totalPaid)}</span>
                            ) : (
                              <span className="none">₹0</span>
                            )}
                          </div>

                          <div className="bwa-cell" data-label="Status">
                            {isCourse ? (
                              <span className="bwa-pill p-done">Student</span>
                            ) : client.appointments.length > 0 ? (
                              <span className="bwa-pill p-up">1-on-1 Client</span>
                            ) : (
                              <span className="bwa-pill p-none">Registered</span>
                            )}
                          </div>

                          <div className="bwa-act">
                            <button className="bwa-btn bwa-btn-line" onClick={() => openClientDrawer(client)}>
                              View detail
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </>
                )
              )}
            </div>
          </>
        )}

        {/* ----------------- SUBNAV TAB 2: BY CLIENT ROSTER ----------------- */}
        {subnavTab === 'clients' && (
          <div className="bwa-card">
            <div className="bwa-head" style={{ margin: '0 0 16px' }}>
              <div>
                <h1>Client roster</h1>
                <p>Overview of all unique clients, lifetime session count, and total revenue.</p>
              </div>
            </div>

            <div className="bwa-table-card">
              <div className="bwa-table-row stu th">
                <div>Client</div>
                <div>Course enrolled</div>
                <div>Total sessions</div>
                <div>Total spend</div>
                <div>Status</div>
                <div></div>
              </div>
              {clientsDirectory.map((client) => {
                const usedFree = getClientFreeUsed(client);
                return (
                  <div key={client.id} className="bwa-table-row stu">
                    <div className="bwa-who">
                      <span className="bwa-av">{client.name?.[0]?.toUpperCase() || 'C'}</span>
                      <div style={{ minWidth: 0 }}>
                        <b>{client.name}</b>
                        <span className="s">{client.email}</span>
                        <span className="s">{client.phone || 'No phone'}</span>
                      </div>
                    </div>

                    <div className="bwa-cell" data-label="Course enrolled">
                      {client.course ? (
                        <>
                          <b>{client.course.name}</b>
                          <span className="s">
                            {usedFree}/{COURSE_FREE_TOTAL} free perks used
                          </span>
                        </>
                      ) : (
                        <span className="none">None</span>
                      )}
                    </div>

                    <div className="bwa-cell" data-label="Total sessions">
                      <b>{client.appointments.length} sessions</b>
                      <span className="s">
                        {client.appointments.filter((a) => (a.status || '').toUpperCase() === 'COMPLETED').length}{' '}
                        completed
                      </span>
                    </div>

                    <div className="bwa-cell" data-label="Total spend">
                      <span className="bwa-pill p-paid">{inr(client.totalPaid)}</span>
                    </div>

                    <div className="bwa-cell" data-label="Status">
                      {client.course ? (
                        <span className="bwa-pill p-done">Student</span>
                      ) : (
                        <span className="bwa-pill p-up">1-on-1 Client</span>
                      )}
                    </div>

                    <div className="bwa-act">
                      <button className="bwa-btn bwa-btn-line" onClick={() => openClientDrawer(client)}>
                        View history
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ----------------- SUBNAV TAB 3: FEE SETTINGS ----------------- */}
        {subnavTab === 'fees' && (
          <div className="bwa-card" style={{ maxWidth: '680px', margin: '0 auto' }}>
            <div className="bwa-box">
              <h4 className="big">1-on-1 Session Pricing</h4>
              <p className="hint">Set your base rates for 60-minute and 90-minute private coaching calls.</p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginTop: '16px' }}>
                <div className="bwa-f" style={{ maxWidth: 'none' }}>
                  <label>60-Minute Session Fee (INR)</label>
                  <input
                    type="number"
                    value={fees.fee60min}
                    onChange={(e) => {
                      setFees((prev) => ({ ...prev, fee60min: Number(e.target.value) }));
                      setFeeDirty(true);
                    }}
                  />
                </div>

                <div className="bwa-f" style={{ maxWidth: 'none' }}>
                  <label>90-Minute Session Fee (INR)</label>
                  <input
                    type="number"
                    value={fees.fee90min}
                    onChange={(e) => {
                      setFees((prev) => ({ ...prev, fee90min: Number(e.target.value) }));
                      setFeeDirty(true);
                    }}
                  />
                </div>

                <div style={{ marginTop: '12px', display: 'flex', gap: '10px' }}>
                  <button
                    className="bwa-btn bwa-btn-accent"
                    onClick={handleSaveFees}
                    disabled={savingFees || !feeDirty}
                  >
                    {savingFees ? 'Saving...' : 'Save Pricing Changes'}
                  </button>
                  {feeDirty && (
                    <button
                      className="bwa-btn bwa-btn-line"
                      onClick={() => {
                        fetchData();
                        setFeeDirty(false);
                      }}
                    >
                      Discard
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ----------------- DRAWER & SCRIM ----------------- */}
      <div className={`bwa-scrim ${drawerOpen ? 'on' : ''}`} onClick={closeDrawer} />

      <aside
        className={`bwa-drawer ${drawerOpen ? 'on' : ''}`}
        role="dialog"
        aria-modal="true"
        aria-label="Detail Drawer"
      >
        {selectedClient && (
          <>
            {drawerMode === 'appt' && selectedAppt ? (
              /* ================= APPOINTMENT DETAIL DRAWER ================= */
              <>
                <div className="bwa-d-head">
                  <div>
                    <h3>Appointment with {selectedClient.name}</h3>
                    <span className="s">
                      {formatDate(selectedAppt.date)} at {formatTime(selectedAppt.time, selectedAppt.date)}
                    </span>
                  </div>
                  <button className="bwa-x-btn" onClick={closeDrawer} aria-label="Close">
                    ×
                  </button>
                </div>

                <div className="bwa-d-body">
                  {/* 4 Tabs: Overview / Reschedule / Client answers / Coach notes */}
                  <div className="bwa-dtabs" role="tablist">
                    <button
                      role="tab"
                      className={drawerTab === 'overview' ? 'on' : ''}
                      onClick={() => setDrawerTab('overview')}
                    >
                      Overview
                    </button>
                    <button
                      role="tab"
                      className={drawerTab === 'reschedule' ? 'on' : ''}
                      onClick={() => setDrawerTab('reschedule')}
                    >
                      Reschedule
                      {(selectedAppt.rescheduleRequested ||
                        selectedAppt.rescheduleRequest?.status === 'PENDING') &&
                        ' •'}
                    </button>
                    <button
                      role="tab"
                      className={drawerTab === 'answers' ? 'on' : ''}
                      onClick={() => setDrawerTab('answers')}
                    >
                      Client answers
                    </button>
                    <button
                      role="tab"
                      className={drawerTab === 'notes' ? 'on' : ''}
                      onClick={() => setDrawerTab('notes')}
                    >
                      Coach notes
                    </button>
                  </div>

                  {/* TAB 1: OVERVIEW */}
                  {drawerTab === 'overview' && (
                    <>
                      <div className="bwa-glance">
                        {renderStatusPill(selectedAppt)}
                        {renderPaymentPill(selectedAppt)}
                        <span className="s" style={{ whiteSpace: 'normal' }}>
                          {selectedAppt.isFreeSession || selectedAppt.orderId === 'COURSE_FREE_SESSION'
                            ? 'Free session (course perk)'
                            : 'Paid 1-on-1 session'}
                        </span>
                      </div>

                      {/* Reschedule Alert Note */}
                      {(selectedAppt.rescheduleRequested ||
                        selectedAppt.rescheduleRequest?.status === 'PENDING') && (
                        <div className="bwa-note-banner">
                          Client asked to reschedule.{' '}
                          <button
                            className="bwa-link-btn"
                            style={{ padding: 0 }}
                            onClick={() => setDrawerTab('reschedule')}
                          >
                            Review request in Reschedule tab →
                          </button>
                        </div>
                      )}

                      {/* Cancelled without refund note */}
                      {(selectedAppt.status || '').toUpperCase() === 'CANCELLED' &&
                        selectedAppt.paymentStatus === 'Paid' && (
                          <div className="bwa-note-banner">
                            This appointment is cancelled but the payment has not been refunded.
                          </div>
                        )}

                      {/* Session & Google Meet Schedule Details Box */}
                      <div className="bwa-box" style={{ borderLeft: '3px solid var(--accent, #c9542f)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '10px' }}>
                          <div>
                            <h4 className="big" style={{ margin: 0 }}>Session schedule &amp; meeting link</h4>
                            <p className="hint" style={{ margin: '2px 0 12px' }}>Confirmed booking date, time &amp; Google Meet call.</p>
                          </div>
                          <span className="bwa-pill" style={{ background: '#e5f2e8', color: '#2f4a34', fontWeight: 600, fontSize: '11px' }}>
                            {selectedAppt.isFreeSession || selectedAppt.orderId === 'COURSE_FREE_SESSION' ? 'Complimentary 1-on-1' : 'Paid Session'}
                          </span>
                        </div>

                        <div className="bwa-kv" style={{ marginBottom: '14px' }}>
                          <div>
                            <span>Date &amp; Day</span>
                            <b style={{ color: '#111010', fontSize: '0.88rem' }}>
                              {new Date(selectedAppt.date).toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'short', year: 'numeric' })}
                            </b>
                          </div>
                          <div>
                            <span>Time</span>
                            <b style={{ color: '#111010', fontSize: '0.88rem' }}>
                              {formatTime(selectedAppt.time, selectedAppt.date)}
                            </b>
                          </div>
                          <div>
                            <span>Duration</span>
                            <b>{selectedAppt.duration || 60} Minutes</b>
                          </div>
                          <div>
                            <span>Status</span>
                            <b>{(selectedAppt.status || 'Confirmed').toUpperCase()}</b>
                          </div>
                        </div>

                        {/* Google Meet Link Bar */}
                        <div style={{ padding: '10px 12px', background: 'rgba(201, 84, 47, 0.06)', borderRadius: '10px', border: '1px solid rgba(201, 84, 47, 0.2)' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                            <span style={{ fontSize: '0.68rem', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 700, color: 'var(--accent, #c9542f)' }}>
                              📹 Google Meet Video Link
                            </span>
                            {selectedAppt.meetLink && (
                              <button
                                type="button"
                                className="bwa-copy-btn"
                                style={{ padding: '2px 8px', fontSize: '0.65rem' }}
                                onClick={() => copyToClipboard(selectedAppt.meetLink)}
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

                        {/* Quick Intake Answers preview on Overview */}
                        {(selectedAppt.reason || selectedAppt.extra || selectedAppt.notes || selectedAppt.source || selectedAppt.questionnaireAnswers) && (
                          <div style={{ marginTop: '14px', paddingTop: '12px', borderTop: '1px solid rgba(0,0,0,0.06)' }}>
                            <span style={{ fontSize: '0.65rem', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 700, color: 'var(--accent, #c9542f)', display: 'block', marginBottom: '6px' }}>
                              Client Intake Summary:
                            </span>
                            
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                              <div>
                                <strong style={{ fontSize: '0.75rem', color: '#7a756b', display: 'block' }}>What brings them here:</strong>
                                <p style={{ margin: '2px 0 0', fontSize: '0.82rem', color: '#111010', lineHeight: 1.4 }}>
                                  {selectedAppt.reason || selectedAppt.brings || selectedAppt.answers?.why || selectedAppt.goals || selectedAppt.message || 'No specific intake note.'}
                                </p>
                              </div>

                              {selectedAppt.source && (
                                <p style={{ margin: 0, fontSize: '0.76rem', color: '#555047' }}>
                                  <strong>Heard about via:</strong> {selectedAppt.source}
                                </p>
                              )}

                              {(selectedAppt.extra || selectedAppt.notes) && (selectedAppt.extra !== selectedAppt.reason && selectedAppt.notes !== selectedAppt.reason) && (
                                <p style={{ margin: 0, fontSize: '0.76rem', color: '#555047' }}>
                                  <strong>Additional notes:</strong> {selectedAppt.extra || selectedAppt.notes}
                                </p>
                              )}

                              {selectedAppt.questionnaireAnswers && (
                                <div style={{ marginTop: '4px' }}>
                                  <span className="bwa-pill p-done" style={{ fontSize: '0.65rem', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                                    ✓ Deep Questionnaire Submitted
                                  </span>
                                </div>
                              )}
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Client Info Box */}
                      <div className="bwa-box">
                        <h4 className="big">Client information</h4>
                        <p className="hint">Contact and intake reference.</p>
                        <div className="bwa-kv">
                          <div>
                            <span>Name</span>
                            <b>{selectedClient.name}</b>
                          </div>
                          <div>
                            <span>Email</span>
                            <b>{selectedClient.email}</b>
                          </div>
                          <div>
                            <span>Phone</span>
                            <b>{selectedClient.phone || '—'}</b>
                          </div>
                          <div>
                            <span>Session duration</span>
                            <b>{selectedAppt.duration || 60} Minutes</b>
                          </div>
                        </div>
                      </div>

                      {/* Course Purchase Box */}
                      {selectedClient.course ? (
                        <div className="bwa-box">
                          <h4>
                            Course purchase <span className="bwa-pill p-done">Enrolled</span>
                          </h4>
                          <div className="bwa-line-row">
                            <span>Course</span>
                            <b>{selectedClient.course.name}</b>
                          </div>
                          <div className="bwa-line-row">
                            <span>Bought on</span>
                            <b>
                              {formatDateShort(selectedClient.course.paidAt)},{' '}
                              {formatTime(selectedClient.course.paidAt)}
                            </b>
                          </div>
                          <div className="bwa-line-row">
                            <span>Amount paid</span>
                            <b>{inr(selectedClient.course.amount)}</b>
                          </div>
                          <div className="bwa-line-row">
                            <span>Free 1-on-1 sessions</span>
                            <b>
                              {getClientFreeUsed(selectedClient)} of {getClientTotalFree(selectedClient)} used ·{' '}
                              <span style={{ color: 'var(--accent)' }}>
                                {Math.max(0, getClientTotalFree(selectedClient) - getClientFreeUsed(selectedClient))} left
                              </span>
                            </b>
                          </div>
                          <div className="bwa-prog">
                            <i
                              style={{
                                width: `${Math.min(
                                  100,
                                  (getClientFreeUsed(selectedClient) / getClientTotalFree(selectedClient)) * 100
                                )}%`
                              }}
                            />
                          </div>
                        </div>
                      ) : (
                        <div className="bwa-box">
                          <h4 className="big">Course purchase</h4>
                          <p className="hint" style={{ margin: 0 }}>
                            No course bought. This client books paid sessions only.
                          </p>
                        </div>
                      )}

                      {/* Payment Breakdown Box */}
                      <div className="bwa-box">
                        <h4 className="big">Payment breakdown</h4>
                        <p className="hint">Razorpay transaction record.</p>

                        <div className="bwa-fee-box">
                          <div className="bwa-line-row">
                            <span>Session fee</span>
                            <span>
                              {selectedAppt.isFreeSession || selectedAppt.orderId === 'COURSE_FREE_SESSION'
                                ? '₹0 (Course Free)'
                                : selectedAppt.paymentStatus === 'Refunded'
                                ? `${inr(selectedAppt.amount || 5000)} (Refunded)`
                                : inr(selectedAppt.amount || 5000)}
                            </span>
                          </div>
                          <div className="bwa-line-row">
                            <span>Total</span>
                            <span>
                              {selectedAppt.isFreeSession ||
                              selectedAppt.orderId === 'COURSE_FREE_SESSION' ||
                              selectedAppt.paymentStatus === 'Refunded'
                                ? '₹0'
                                : inr(selectedAppt.amount || 5000)}
                            </span>
                          </div>
                        </div>

                        <div className="s bwa-mono" style={{ whiteSpace: 'normal' }}>
                          Payment ID:{' '}
                          <span className="bwa-codebox">
                            {selectedAppt.razorpayPaymentId ||
                              selectedAppt.paymentId ||
                              (selectedAppt.isFreeSession ? 'N/A (Free Call)' : '—')}
                          </span>
                          {(selectedAppt.razorpayPaymentId || selectedAppt.paymentId) && (
                            <button
                              className="bwa-copy-btn"
                              onClick={() =>
                                copyToClipboard(selectedAppt.razorpayPaymentId || selectedAppt.paymentId)
                              }
                            >
                              Copy
                            </button>
                          )}
                        </div>

                        {selectedAppt.orderId && (
                          <div className="s bwa-mono" style={{ marginTop: '4px' }}>
                            Order: {selectedAppt.orderId}
                          </div>
                        )}
                      </div>

                      {/* Danger Zone: Refund */}
                      {selectedAppt.paymentStatus === 'Paid' && !selectedAppt.isFreeSession && (
                        <div className="bwa-box danger">
                          <h4 className="big">Danger zone: Emergency refund</h4>
                          <p className="hint">
                            Refund payment directly back to client's original method via Razorpay.
                          </p>
                          <button
                            className="bwa-btn bwa-btn-danger"
                            onClick={() => handleEmergencyRefund(selectedAppt)}
                          >
                            {refundConfirmId === selectedAppt._id
                              ? `Tap again to confirm refund of ${inr(selectedAppt.amount || 5000)}`
                              : `Refund ${inr(selectedAppt.amount || 5000)}`}
                          </button>
                        </div>
                      )}

                      {/* More From This Client */}
                      <div className="bwa-box">
                        <h4>More from this client</h4>
                        <p className="hint" style={{ margin: '0 0 12px' }}>
                          {selectedClient.appointments.length > 1
                            ? `${selectedClient.appointments.length - 1} other appointment(s) · `
                            : 'No other appointments · '}
                          {selectedClient.course ? 'course purchase and payment history.' : 'payment history.'}
                        </p>
                        <button
                          className="bwa-btn bwa-btn-line bwa-btn-sm"
                          onClick={() => setDrawerMode('client')}
                        >
                          View client history
                        </button>
                      </div>
                    </>
                  )}

                  {/* TAB 2: RESCHEDULE */}
                  {drawerTab === 'reschedule' && (
                    <div>
                      {hasValidRescheduleRequest(selectedAppt) ? (
                        renderRescheduleDetails(selectedAppt, false)
                      ) : (
                        <div className="bwa-box">
                          <h4 className="big">Reschedule timeline</h4>
                          <p className="hint">Review requested and confirmed schedule changes.</p>
                          <div style={{
                            padding: '32px 20px',
                            textAlign: 'center',
                            background: '#faf7f2',
                            borderRadius: '12px',
                            border: '1px dashed #e2d9cd',
                            marginTop: '14px'
                          }}>
                            <span style={{ fontSize: '1.4rem', display: 'block', marginBottom: '6px' }}>🗓️</span>
                            <b style={{ color: '#111010', fontSize: '0.95rem', display: 'block', marginBottom: '4px' }}>
                              No Reschedule Requested
                            </b>
                            <span style={{ fontSize: '0.82rem', color: '#7a756b' }}>
                              This session is confirmed for its original scheduled slot ({formatDate(selectedAppt.date)}, {formatTime(selectedAppt.time)}). The client has not requested any reschedule.
                            </span>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* TAB 3: CLIENT ANSWERS */}
                  {drawerTab === 'answers' && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                      {/* Booking Step 2 Intake Details */}
                      <div className="bwa-box">
                        <h4 className="big">Booking intake details</h4>
                        <p className="hint">Responses submitted during session scheduling.</p>

                        <div className="bwa-qa">
                          <label>What brings them here?</label>
                          <div style={{ color: selectedAppt.reason ? 'var(--ink, #111010)' : '#7a756b', fontStyle: selectedAppt.reason ? 'normal' : 'italic' }}>
                            {selectedAppt.reason || selectedAppt.brings || selectedAppt.answers?.why || selectedAppt.goals || selectedAppt.message || 'No details provided.'}
                          </div>
                        </div>

                        <div className="bwa-qa">
                          <label>How did you hear about me?</label>
                          <div style={{ color: selectedAppt.source ? 'var(--ink, #111010)' : '#7a756b', fontStyle: selectedAppt.source ? 'normal' : 'italic' }}>
                            {selectedAppt.source || selectedAppt.heard || 'Not specified.'}
                          </div>
                        </div>

                        <div className="bwa-qa">
                          <label>Anything else they shared (Optional Notes)</label>
                          <div style={{ color: (selectedAppt.extra || selectedAppt.notes) ? 'var(--ink, #111010)' : '#7a756b', fontStyle: (selectedAppt.extra || selectedAppt.notes) ? 'normal' : 'italic' }}>
                            {selectedAppt.extra || selectedAppt.notes || selectedAppt.answers?.extra || selectedAppt.experience || selectedAppt.additionalNotes || 'None provided.'}
                          </div>
                        </div>
                      </div>

                      {/* Deep Reflection Questionnaire Answers (if submitted) */}
                      {(() => {
                        const qaList = formatQuestionnaireAnswers(selectedAppt.questionnaireAnswers || selectedAppt.qa);
                        if (qaList.length > 0) {
                          return (
                            <div className="bwa-box">
                              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                                <h4 className="big" style={{ margin: 0 }}>Deep Reflection Questionnaire</h4>
                                <span className="bwa-pill p-done" style={{ fontSize: '0.65rem' }}>{qaList.length} Answered ✓</span>
                              </div>
                              <p className="hint" style={{ marginBottom: '14px' }}>
                                Optional ~30 minute deep questionnaire answers submitted by client.
                              </p>
                              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                {qaList.map((item, idx) => (
                                  <div 
                                    key={idx} 
                                    style={{ 
                                      background: '#faf7f2', 
                                      border: '1px solid rgba(0,0,0,0.07)', 
                                      borderRadius: '12px', 
                                      padding: '12px 14px' 
                                    }}
                                  >
                                    <div style={{ fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 700, color: 'var(--accent, #c9542f)', marginBottom: '4px' }}>
                                      Q{idx + 1}: {item.question}
                                    </div>
                                    <div style={{ fontSize: '0.85rem', color: '#111010', lineHeight: 1.45, fontWeight: 500 }}>
                                      {item.answer}
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          );
                        }
                        return (
                          <div className="bwa-box" style={{ background: 'rgba(0,0,0,0.02)', borderStyle: 'dashed' }}>
                            <h4 style={{ fontSize: '0.82rem', color: '#7a756b', margin: '0 0 4px' }}>Deep Reflection Questionnaire</h4>
                            <p style={{ margin: 0, fontSize: '0.75rem', color: '#9c9689' }}>
                              Client did not complete the optional ~30-min deep questionnaire for this session.
                            </p>
                          </div>
                        );
                      })()}
                    </div>
                  )}

                  {/* TAB 4: COACH NOTES */}
                  {drawerTab === 'notes' && (
                    <div className="bwa-box">
                      <div
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          gap: '10px'
                        }}
                      >
                        <h4 className="big" style={{ margin: 0 }}>
                          Coach private notes
                        </h4>
                        <span className="bwa-saved-badge">
                          <i className={`bwa-dot ${notesSaveStatus === 'saving' ? 'sv' : ''}`} />
                          {notesSaveStatus === 'saving' ? 'Saving...' : 'Saved ✓'}
                        </span>
                      </div>
                      <p className="hint" style={{ marginTop: '6px' }}>
                        Private coaching observations and action items. Notes autosave automatically as you type.
                      </p>
                      <textarea
                        className="bwa-textarea"
                        placeholder="Write session takeaways, action items, and personal breakthroughs..."
                        value={coachNotesText}
                        onChange={(e) => handleNotesChange(e.target.value)}
                      />
                      <div className="bwa-nfoot">
                        <span>Private to coach dashboard.</span>
                        <button
                          className="bwa-btn bwa-btn-accent bwa-btn-sm"
                          onClick={() => saveCoachNotes(coachNotesText)}
                        >
                          Save notes ✓
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                <div className="bwa-d-foot">
                  {(selectedAppt.status || '').toUpperCase() === 'UPCOMING' && (
                    <>
                      <button
                        className="bwa-btn bwa-btn-line"
                        onClick={() => handleStatusChange(selectedAppt._id, 'CANCELLED')}
                      >
                        Cancel session
                      </button>
                      <button
                        className="bwa-btn bwa-btn-accent"
                        onClick={() => handleStatusChange(selectedAppt._id, 'COMPLETED')}
                      >
                        Mark completed
                      </button>
                    </>
                  )}
                  <button className="bwa-btn bwa-btn-line" onClick={closeDrawer}>
                    Close
                  </button>
                </div>
              </>
            ) : (
              /* ================= CLIENT PROFILE DRAWER ================= */
              <>
                <div className="bwa-d-head">
                  <span className="bwa-av">{selectedClient.name?.[0]?.toUpperCase() || 'C'}</span>
                  <div>
                    <h3>{selectedClient.name}</h3>
                    <span className="s">
                      {selectedClient.course ? `Student account #${selectedClient.acct}` : 'Client account'}
                    </span>
                  </div>
                  <button className="bwa-x-btn" onClick={closeDrawer} aria-label="Close">
                    ×
                  </button>
                </div>

                <div className="bwa-d-body">
                  {/* Contact Info */}
                  <div className="bwa-box">
                    <h4>Contact</h4>
                    <div className="bwa-kv">
                      <div>
                        <span>Email</span>
                        <b className="bwa-mono">{selectedClient.email}</b>
                      </div>
                      <div>
                        <span>Phone</span>
                        <b>{selectedClient.phone || '—'}</b>
                      </div>
                      <div>
                        <span>Registered</span>
                        <b>{formatDateShort(selectedClient.joined)}</b>
                      </div>
                    </div>
                  </div>

                  {/* Course Purchase Box */}
                  {selectedClient.course ? (
                    <div className="bwa-box">
                      <h4>
                        Course purchase <span className="bwa-pill p-done">Enrolled</span>
                      </h4>
                      <div className="bwa-line-row">
                        <span>Course</span>
                        <b>{selectedClient.course.name}</b>
                      </div>
                      <div className="bwa-line-row">
                        <span>Bought on</span>
                        <b>
                          {formatDateShort(selectedClient.course.paidAt)},{' '}
                          {formatTime(selectedClient.course.paidAt)}
                        </b>
                      </div>
                      <div className="bwa-line-row">
                        <span>Amount paid</span>
                        <b>{inr(selectedClient.course.amount)}</b>
                      </div>
                      <div className="bwa-line-row">
                        <span>Free 1-on-1 sessions</span>
                        <b>
                          {getClientFreeUsed(selectedClient)} of {getClientTotalFree(selectedClient)} used ·{' '}
                          <span style={{ color: 'var(--accent)' }}>
                            {Math.max(0, getClientTotalFree(selectedClient) - getClientFreeUsed(selectedClient))} left
                          </span>
                        </b>
                      </div>
                      <div className="bwa-prog">
                        <i
                          style={{
                            width: `${Math.min(
                              100,
                              (getClientFreeUsed(selectedClient) / getClientTotalFree(selectedClient)) * 100
                            )}%`
                          }}
                        />
                      </div>
                    </div>
                  ) : (
                    <div className="bwa-box">
                      <h4 className="big">Course purchase</h4>
                      <p className="hint" style={{ margin: 0 }}>
                        No course bought. This client books paid sessions only.
                      </p>
                    </div>
                  )}

                  {/* Appointments Box */}
                  <div className="bwa-box">
                    <h4>Appointments ({selectedClient.appointments.length})</h4>
                    {selectedClient.appointments.length === 0 ? (
                      <span className="none">No appointments booked yet.</span>
                    ) : (
                      selectedClient.appointments
                        .slice()
                        .sort((a, b) => parseDate(`${b.date} ${b.time}`) - parseDate(`${a.date} ${a.time}`))
                        .map((s) => (
                          <div key={s._id} className="bwa-scard">
                            <b>{formatDate(s.date)}</b>
                            <span className="s">
                              {formatTime(s.time, s.date)} · {s.duration || 60} mins ·{' '}
                              {s.isFreeSession || s.orderId === 'COURSE_FREE_SESSION'
                                ? 'Free perk'
                                : 'Paid session'}
                            </span>
                            <div className="bwa-pills-row">
                              {renderStatusPill(s)}
                              {renderPaymentPill(s)}
                            </div>
                            <div className="bwa-acts-row">
                              <button
                                className="bwa-btn bwa-btn-line bwa-btn-sm"
                                onClick={() => {
                                  setSelectedAppt(s);
                                  setDrawerMode('appt');
                                  setDrawerTab('overview');
                                  setCoachNotesText(s.coachNotes || s.notes || '');
                                }}
                              >
                                Open appointment
                              </button>
                            </div>
                          </div>
                        ))
                    )}
                  </div>

                  {/* Payments Box */}
                  <div className="bwa-box">
                    <h4>Payment history</h4>
                    {selectedClient.course && (
                      <div className="bwa-pay-card">
                        <div className="t">
                          <span className="bwa-tag">PAID</span>
                          <span className="amt">{inr(selectedClient.course.amount)}</span>
                        </div>
                        <span className="s" style={{ marginBottom: '6px' }}>
                          {selectedClient.course.name} (Course enrollment)
                        </span>
                        <div className="bwa-line-row bwa-mono" style={{ padding: '2px 0' }}>
                          <span>Txn ID</span>
                          <span>
                            {selectedClient.course.txn}
                            <button
                              className="bwa-copy-btn"
                              onClick={() => copyToClipboard(selectedClient.course.txn)}
                            >
                              Copy
                            </button>
                          </span>
                        </div>
                        <div className="bwa-line-row bwa-mono" style={{ padding: '2px 0' }}>
                          <span>Date</span>
                          <span>{formatDateShort(selectedClient.course.paidAt)}</span>
                        </div>
                      </div>
                    )}

                    {selectedClient.purchases && selectedClient.purchases.filter(p => p.paymentStatus === 'Failed').map((p, idx) => (
                      <div key={`failed-${idx}`} className="bwa-pay-card ref">
                        <div className="t">
                          <span className="bwa-tag" style={{ background: 'rgba(163, 45, 34, 0.15)', color: 'var(--red)' }}>FAILED ATTEMPT</span>
                          <span className="amt">{inr(p.amount || COURSE_PRICE)}</span>
                        </div>
                        <span className="s" style={{ marginBottom: '6px' }}>
                          {p.courseTitle || COURSE_NAME} (Checkout attempt)
                        </span>
                        {p.razorpayOrderId && (
                          <div className="bwa-line-row bwa-mono" style={{ padding: '2px 0' }}>
                            <span>Order ID</span>
                            <span>
                              {p.razorpayOrderId}
                              <button
                                className="bwa-copy-btn"
                                onClick={() => copyToClipboard(p.razorpayOrderId)}
                              >
                                Copy
                              </button>
                            </span>
                          </div>
                        )}
                        <div className="bwa-line-row bwa-mono" style={{ padding: '2px 0' }}>
                          <span>Date</span>
                          <span>{formatDateShort(p.purchaseDate || p.createdAt)}</span>
                        </div>
                      </div>
                    ))}

                    {selectedClient.appointments
                      .filter((s) => s.paymentStatus === 'Paid' || s.paymentStatus === 'Refunded' || s.isFreeSession || s.orderId === 'COURSE_FREE_SESSION')
                      .map((s) => {
                        const isComplimentary = Boolean(s.isFreeSession || s.orderId === 'COURSE_FREE_SESSION' || Number(s.amount) === 0);
                        const isRefunded = s.paymentStatus === 'Refunded';
                        return (
                          <div
                            key={s._id}
                            className={`bwa-pay-card ${isRefunded ? 'ref' : ''}`}
                            style={isComplimentary ? { background: 'rgba(21, 128, 61, 0.04)', borderColor: 'rgba(21, 128, 61, 0.2)' } : {}}
                          >
                            <div className="t">
                              <span 
                                className="bwa-tag"
                                style={isComplimentary ? { background: 'rgba(21, 128, 61, 0.15)', color: '#15803d', border: '1px solid rgba(21, 128, 61, 0.25)' } : (isRefunded ? {} : {})}
                              >
                                {isComplimentary ? 'FREE PERK' : (isRefunded ? 'REFUNDED' : 'PAID')}
                              </span>
                              <span className="amt" style={isComplimentary ? { color: '#15803d' } : {}}>
                                {isComplimentary ? '₹0 (Course Perk)' : inr(s.amount || 5000)}
                              </span>
                            </div>
                            <span className="s" style={{ marginBottom: '6px' }}>
                              1-on-1 Coaching session on {formatDateShort(s.date)}
                            </span>
                            <div className="bwa-line-row bwa-mono" style={{ padding: '2px 0' }}>
                              <span>{isComplimentary ? 'Redemption' : 'Txn ID'}</span>
                              <span>
                                {isComplimentary ? 'Complimentary Free Session' : (s.razorpayPaymentId || s.paymentId || '—')}
                                {!isComplimentary && (s.razorpayPaymentId || s.paymentId) && (
                                  <button
                                    className="bwa-copy-btn"
                                    onClick={() => copyToClipboard(s.razorpayPaymentId || s.paymentId)}
                                  >
                                    Copy
                                  </button>
                                )}
                              </span>
                            </div>
                            <div className="bwa-line-row bwa-mono" style={{ padding: '2px 0' }}>
                              <span>Date</span>
                              <span>{formatDateShort(s.date || s.createdAt)}</span>
                            </div>
                          </div>
                        );
                      })}
                  </div>
                </div>

                <div className="bwa-d-foot">
                  <button className="bwa-btn bwa-btn-line" onClick={closeDrawer}>
                    Close
                  </button>
                </div>
              </>
            )}
          </>
        )}
      </aside>
    </div>
  );
}
