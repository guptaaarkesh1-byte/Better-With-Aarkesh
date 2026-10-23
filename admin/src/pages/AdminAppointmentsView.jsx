import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useToast } from '../context/ToastContext';
import Icon from '../components/common/AdminIcons';
import { API_URL } from '../utils/apiUrl';
import AdminQuestionnaireViewer from '../components/AdminQuestionnaireViewer';
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

  const [searchParams] = useSearchParams();
  const urlApptId = searchParams.get('apptId');
  const urlTab = searchParams.get('tab');

  // Filter Tabs per view
  const [sessionTab, setSessionTab] = useState(urlTab || 'all'); // all, needs, today, upcoming, completed, rescheduled, cancelled, refunded
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

  // Coaching Session Coupons state
  const [coupons, setCoupons] = useState([]);
  const [loadingCoupons, setLoadingCoupons] = useState(false);
  const [savingCoupon, setSavingCoupon] = useState(false);
  const [editingCouponId, setEditingCouponId] = useState(null);
  const [couponForm, setCouponForm] = useState({
    code: '',
    discountType: 'percentage',
    discountValue: 20,
    applicableTo: 'session',
    isActive: true,
    description: ''
  });

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

  // Coaching Agreement Review & Approval state
  const [agreementForm, setAgreementForm] = useState({
    clientName: '',
    clientEmail: '',
    clientPhone: '',
    sessionDate: '',
    sessionTime: '',
    modeOfCoaching: 'Online Video (Google Meet)',
    meetLink: '',
    betweenSessionSupport: '',
    additionalAgreedTerms: '',
    agreementDate: ''
  });
  const [isSavingAgreement, setIsSavingAgreement] = useState(false);
  const [isSendingAgreement, setIsSendingAgreement] = useState(false);

  // Fetch all initial data
  const fetchData = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('adminToken');
      const headers = { Authorization: `Bearer ${token}` };

      const [appRes, stuRes, statsRes, feeRes, couponRes] = await Promise.all([
        fetch(`${API_URL}/api/appointments/admin`, { headers }),
        fetch(`${API_URL}/api/course-auth/admin/students`, { headers }),
        fetch(`${API_URL}/api/course-auth/admin/stats`, { headers }),
        fetch(`${API_URL}/api/appointments/fees`, { headers }),
        fetch(`${API_URL}/api/coupons`, { headers }).catch(() => null)
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

      if (couponRes && couponRes.ok) {
        const cData = await couponRes.json();
        setCoupons(Array.isArray(cData) ? cData : []);
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

  useEffect(() => {
    if (urlTab) {
      setSessionTab(urlTab);
    }
  }, [urlTab]);

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
    if (app.agreementStatus === 'PENDING_REVIEW') return true;
    if (app.rescheduleRequested || app.rescheduleRequest?.status === 'PENDING' || app.rescheduleRequest?.status === 'pending') return true;
    if (app.paymentStatus === 'Pending' && !app.isFreeSession) return true;

    try {
      const appDateTime = new Date(`${app.date} ${app.time || '00:00'}`);
      if (!isNaN(appDateTime.getTime()) && appDateTime < new Date() && s !== 'COMPLETED') {
        return true;
      }
    } catch (e) {}

    return false;
  };

  // Helper to determine if appointment is rescheduled (pending or approved/historical)
  const isRescheduledAppt = (app) => {
    if (!app) return false;
    const s = (app.status || '').toUpperCase();
    return Boolean(
      s === 'RESCHEDULED' ||
      app.rescheduledFrom ||
      app.rescheduledDate ||
      app.rescheduleRequested ||
      (app.rescheduleRequest && (
        app.rescheduleRequest.status === 'PENDING' ||
        app.rescheduleRequest.status === 'pending' ||
        app.rescheduleRequest.status === 'APPROVED' ||
        app.rescheduleRequest.status === 'approved' ||
        Boolean(app.rescheduleRequest.originalDate)
      ))
    );
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
        isDeleted: Boolean(stu.isDeleted),
        deletedAt: stu.deletedAt || null,
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
          isDeleted: Boolean(app.userId?.isDeleted || app.isUserDeleted),
          deletedAt: app.userDeletedAt || app.userId?.deletedAt || null,
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
      if (app.userId?.isDeleted || app.isUserDeleted) {
        client.isDeleted = true;
        if (app.userDeletedAt || app.userId?.deletedAt) {
          client.deletedAt = app.userDeletedAt || app.userId?.deletedAt;
        }
      }
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
    if (found) {
      if (app.userId?.isDeleted || app.isUserDeleted) found.isDeleted = true;
      return found;
    }

    return {
      id: app._id,
      acct: (app._id || '').slice(-6).toUpperCase(),
      name: app.name || 'Anonymous Client',
      email: app.email || '—',
      phone: app.phoneNumber ? `${app.countryCode || ''} ${app.phoneNumber}`.trim() : (app.phone || ''),
      joined: app.createdAt || app.date,
      isDeleted: Boolean(app.userId?.isDeleted || app.isUserDeleted),
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
      const isRescheduled = isRescheduledAppt(app);

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
  const openApptDrawer = (appt, initialTab = null) => {
    const client = getClientForAppt(appt);
    setSelectedAppt(appt);
    setSelectedClient(client);
    setDrawerMode('appt');
    setDrawerTab(initialTab || (appt.agreementStatus === 'PENDING_REVIEW' ? 'agreement' : 'overview'));
    setCoachNotesText(appt.coachNotes || appt.notes || '');
    setNotesSaveStatus('saved');
    setRefundConfirmId(null);

    const custom = appt.agreementData || {};
    const chars = 'abcdefghijklmnopqrstuvwxyz';
    const randPart = (len) => Array.from({ length: len }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
    const defaultMeetLink = custom.meetLink || appt.meetLink || `https://meet.google.com/${randPart(3)}-${randPart(4)}-${randPart(3)}`;

    setAgreementForm({
      clientName: custom.clientName || appt.name || client?.name || '',
      clientEmail: custom.clientEmail || appt.email || client?.email || '',
      clientPhone: custom.clientPhone || appt.phoneNumber || appt.phone || client?.phone || '',
      sessionDate: custom.sessionDate || appt.date || '',
      sessionTime: custom.sessionTime || appt.time || '',
      modeOfCoaching: custom.modeOfCoaching || 'Online Video (Google Meet)',
      meetLink: defaultMeetLink,
      betweenSessionSupport: custom.betweenSessionSupport || '',
      additionalAgreedTerms: custom.additionalAgreedTerms || '',
      agreementDate: custom.agreementDate || (appt.agreementSentAt ? formatDate(appt.agreementSentAt) : new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }))
    });

    setDrawerOpen(true);
  };

  // Auto-open appointment drawer if apptId is provided in URL
  useEffect(() => {
    if (urlApptId && appointments.length > 0) {
      const match = appointments.find((a) => String(a._id) === String(urlApptId));
      if (match) {
        openApptDrawer(match);
      }
    }
  }, [urlApptId, appointments]);

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
    const f60 = Number(fees.fee60min) || 0;
    const f90 = Number(fees.fee90min) || 0;
    if (f60 <= 0 || f90 <= 0) {
      showError('Please enter valid session fees for both 60-min and 90-min sessions.');
      return;
    }
    setSavingFees(true);
    try {
      const token = localStorage.getItem('adminToken');
      const res = await fetch(`${API_URL}/api/appointments/fees`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ fee60min: f60, fee90min: f90 })
      });
      if (!res.ok) throw new Error('Failed to update fees');
      setFees({ fee60min: f60, fee90min: f90 });
      setFeeDirty(false);
      showSuccess('Coaching fee settings updated successfully!');
    } catch (err) {
      showError('Failed to save fee settings.');
    } finally {
      setSavingFees(false);
    }
  };

  // Coaching Session Coupons handlers
  const fetchCouponsOnly = async () => {
    setLoadingCoupons(true);
    try {
      const token = localStorage.getItem('adminToken');
      const res = await fetch(`${API_URL}/api/coupons`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setCoupons(Array.isArray(data) ? data : []);
      }
    } catch (err) {
      console.error('Failed to load coupons:', err);
    } finally {
      setLoadingCoupons(false);
    }
  };

  const sessionCouponsList = useMemo(() => {
    return coupons.filter(c => !c.applicableTo || c.applicableTo === 'session' || c.applicableTo === 'all');
  }, [coupons]);

  const handleSaveCoupon = async (e) => {
    if (e && e.preventDefault) e.preventDefault();
    const cleanCode = (couponForm.code || '').trim().toUpperCase();
    if (!cleanCode) {
      showError('Please enter a coupon code.');
      return;
    }
    const val = Number(couponForm.discountValue);
    if (!val || val <= 0) {
      showError('Please enter a valid discount value.');
      return;
    }
    if (couponForm.discountType === 'percentage' && (val <= 0 || val > 100)) {
      showError('Percentage discount must be between 1% and 100%.');
      return;
    }

    setSavingCoupon(true);
    try {
      const token = localStorage.getItem('adminToken');
      const url = editingCouponId 
        ? `${API_URL}/api/coupons/${editingCouponId}`
        : `${API_URL}/api/coupons`;
      const method = editingCouponId ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          code: cleanCode,
          discountType: couponForm.discountType,
          discountValue: val,
          applicableTo: couponForm.applicableTo || 'session',
          isActive: Boolean(couponForm.isActive),
          description: (couponForm.description || '').trim()
        })
      });

      const resData = await res.json();
      if (!res.ok) {
        throw new Error(resData.message || 'Failed to save coupon');
      }

      showSuccess(editingCouponId ? `Coupon "${cleanCode}" updated!` : `Coupon "${cleanCode}" created successfully!`);
      setEditingCouponId(null);
      setCouponForm({
        code: '',
        discountType: 'percentage',
        discountValue: 20,
        applicableTo: 'session',
        isActive: true,
        description: ''
      });
      fetchCouponsOnly();
    } catch (err) {
      showError(err.message || 'Error saving coupon.');
    } finally {
      setSavingCoupon(false);
    }
  };

  const handleToggleCouponActive = async (cpn) => {
    try {
      const token = localStorage.getItem('adminToken');
      const newActive = !cpn.isActive;
      // Optimistic update
      setCoupons(prev => prev.map(c => (c._id === cpn._id ? { ...c, isActive: newActive } : c)));

      const res = await fetch(`${API_URL}/api/coupons/${cpn._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ isActive: newActive })
      });
      if (!res.ok) {
        fetchCouponsOnly();
        throw new Error('Failed to toggle coupon status');
      }
      showInfo(`Coupon "${cpn.code}" is now ${newActive ? 'Active' : 'Disabled'}.`);
    } catch (err) {
      showError('Failed to change coupon status.');
    }
  };

  const handleEditCoupon = (cpn) => {
    setEditingCouponId(cpn._id);
    setCouponForm({
      code: cpn.code,
      discountType: cpn.discountType || 'percentage',
      discountValue: cpn.discountValue,
      applicableTo: cpn.applicableTo || 'session',
      isActive: cpn.isActive !== false,
      description: cpn.description || ''
    });
    const el = document.getElementById('session-coupon-editor');
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
  };

  const handleCancelEditCoupon = () => {
    setEditingCouponId(null);
    setCouponForm({
      code: '',
      discountType: 'percentage',
      discountValue: 20,
      applicableTo: 'session',
      isActive: true,
      description: ''
    });
  };

  const handleDeleteCoupon = async (cpn) => {
    if (!window.confirm(`Are you sure you want to delete coupon "${cpn.code}"?`)) return;
    try {
      const token = localStorage.getItem('adminToken');
      const res = await fetch(`${API_URL}/api/coupons/${cpn._id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) throw new Error('Failed to delete coupon');
      showSuccess(`Coupon "${cpn.code}" removed.`);
      if (editingCouponId === cpn._id) {
        handleCancelEditCoupon();
      }
      fetchCouponsOnly();
    } catch (err) {
      showError('Failed to delete coupon.');
    }
  };

  // Save Agreement Draft
  const handleSaveAgreementDraft = async () => {
    if (!selectedAppt?._id) return;
    setIsSavingAgreement(true);
    try {
      const token = localStorage.getItem('adminToken');
      const res = await fetch(`${API_URL}/api/appointments/${selectedAppt._id}/agreement-data`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(agreementForm)
      });
      if (!res.ok) throw new Error('Failed to save agreement draft');
      showSuccess('Agreement draft saved successfully!');
      setSelectedAppt((prev) => (prev ? {
        ...prev,
        agreementData: { ...(prev.agreementData || {}), ...agreementForm }
      } : prev));
      setAppointments((prev) => prev.map((a) => (a._id === selectedAppt._id ? {
        ...a,
        agreementData: { ...(a.agreementData || {}), ...agreementForm }
      } : a)));
    } catch (err) {
      showError(err.message || 'Error saving agreement draft');
    } finally {
      setIsSavingAgreement(false);
    }
  };

  // Preview Agreement PDF
  const handlePreviewAgreementPdf = async () => {
    if (!selectedAppt?._id) return;
    try {
      const token = localStorage.getItem('adminToken');
      // Save any pending edits first so preview is identical
      await fetch(`${API_URL}/api/appointments/${selectedAppt._id}/agreement-data`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(agreementForm)
      });

      const res = await fetch(`${API_URL}/api/appointments/${selectedAppt._id}/agreement-preview`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) throw new Error('Failed to generate PDF preview');
      const blob = await res.blob();
      const fileUrl = URL.createObjectURL(blob);
      window.open(fileUrl, '_blank');
    } catch (err) {
      showError(err.message || 'Failed to preview agreement PDF');
    }
  };

  // Approve & Send Agreement to Client
  const handleSendAgreementToClient = async () => {
    if (!selectedAppt?._id) return;
    if (!agreementForm.clientEmail) {
      showError('Client email is required to send agreement.');
      return;
    }
    setIsSendingAgreement(true);
    try {
      const token = localStorage.getItem('adminToken');
      const res = await fetch(`${API_URL}/api/appointments/${selectedAppt._id}/agreement-send`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(agreementForm)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to send agreement');

      showSuccess(`✓ Agreement approved & sent to ${agreementForm.clientEmail}!`);
      
      const updatedAppt = data.appointment || {
        ...selectedAppt,
        agreementStatus: 'APPROVED_SENT',
        agreementSentAt: new Date(),
        agreementData: agreementForm
      };

      setSelectedAppt(updatedAppt);
      setAppointments((prev) => prev.map((a) => (a._id === selectedAppt._id ? updatedAppt : a)));
      fetchData();
    } catch (err) {
      showError(err.message || 'Failed to dispatch agreement to client.');
    } finally {
      setIsSendingAgreement(false);
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
    const hasPendingReschedule = app.rescheduleRequested || app.rescheduleRequest?.status === 'PENDING' || app.rescheduleRequest?.status === 'pending';
    const isApprovedReschedule = s === 'RESCHEDULED' || Boolean(app.rescheduledFrom || app.rescheduleRequest?.status === 'APPROVED' || app.rescheduleRequest?.status === 'approved' || app.rescheduleRequest?.originalDate);

    if (s === 'CANCELLED') return <span className="bwa-pill p-cx">Cancelled</span>;
    if (s === 'COMPLETED') return <span className="bwa-pill p-done">Completed</span>;
    if (s === 'REFUNDED') return <span className="bwa-pill p-cx">Refunded</span>;
    if (hasPendingReschedule) return <span className="bwa-pill p-re">Wants to reschedule</span>;
    if (app.agreementStatus === 'PENDING_REVIEW') {
      return (
        <button
          type="button"
          className="bwa-pill"
          style={{
            background: '#fef3c7',
            color: '#92400e',
            border: '1px solid #fde68a',
            fontWeight: 700,
            cursor: 'pointer',
            padding: '4px 11px',
            borderRadius: '99px',
            fontSize: '12px',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '5px',
            boxShadow: '0 1px 3px rgba(217, 119, 6, 0.12)',
            transition: 'all 0.15s ease'
          }}
          onClick={(e) => {
            e.stopPropagation();
            openApptDrawer(app, 'agreement');
          }}
          title="Click to open Agreement review in sidebar"
        >
          <span>⏳ Review agreement</span>
          <span style={{ fontSize: '11px', fontWeight: 800 }}>&rarr;</span>
        </button>
      );
    }

    try {
      const appDateTime = new Date(`${app.date} ${app.time || '00:00'}`);
      if (!isNaN(appDateTime.getTime()) && appDateTime < new Date()) {
        return <span className="bwa-pill p-none" style={{ background: '#f0ede8', color: '#66615b', fontWeight: 600 }}>Expired / Closed</span>;
      }
    } catch (e) {}

    if (isApprovedReschedule) return <span className="bwa-pill p-re">Rescheduled</span>;
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
                      appointments.filter(isRescheduledAppt).length
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
                    <button className="bwa-btn bwa-btn-dark preserve-dark" style={{ color: '#ffffff', backgroundColor: '#1c1714' }} onClick={handleClearFilters}>
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
                              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                                <b>{client.name}</b>
                                {Boolean(client.isDeleted || app.isUserDeleted) && (
                                  <span style={{ fontSize: '10px', padding: '1px 6px', borderRadius: '4px', backgroundColor: '#fee2e2', color: '#b91c1c', border: '1px solid #fca5a5', fontWeight: 'bold', textTransform: 'uppercase' }}>
                                    Account Deleted
                                  </span>
                                )}
                              </div>
                              <span className="s">{client.email}</span>
                              <span className="s">{client.phone || 'No phone'}</span>
                            </div>
                          </div>

                          <div className="bwa-cell" data-label="Date & time">
                            <b>{formatDate(app.date)}</b>
                            <span className="s">
                              {formatTime(app.time, app.date)} · {app.duration || 60} mins
                            </span>
                            {(app.rescheduledFrom || app.rescheduleRequest?.originalDate) && (
                              <span className="was">
                                Was {formatDateShort(app.rescheduledFrom || app.rescheduleRequest.originalDate)}, {formatTime(app.rescheduleRequest?.originalTime || app.rescheduledFrom)}
                              </span>
                            )}
                            {app.createdAt && (
                              <span className="s" style={{ fontSize: '0.74rem', color: '#7a7269', marginTop: '3px' }}>
                                Booked: {formatDateShort(app.createdAt)} ({formatTime(null, app.createdAt)})
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
                    <button className="bwa-btn bwa-btn-dark preserve-dark" style={{ color: '#ffffff', backgroundColor: '#1c1714' }} onClick={handleClearFilters}>
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
                              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                                <b>{client.name}</b>
                                {client.isDeleted && (
                                  <span style={{ fontSize: '10px', padding: '1px 6px', borderRadius: '4px', backgroundColor: '#fee2e2', color: '#b91c1c', border: '1px solid #fca5a5', fontWeight: 'bold', textTransform: 'uppercase' }}>
                                    Account Deleted
                                  </span>
                                )}
                              </div>
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
                    <button className="bwa-btn bwa-btn-dark preserve-dark" style={{ color: '#ffffff', backgroundColor: '#1c1714' }} onClick={handleClearFilters}>
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
                              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                                <b>{client.name}</b>
                                {client.isDeleted && (
                                  <span style={{ fontSize: '10px', padding: '1px 6px', borderRadius: '4px', backgroundColor: '#fee2e2', color: '#b91c1c', border: '1px solid #fca5a5', fontWeight: 'bold', textTransform: 'uppercase' }}>
                                    Account Deleted
                                  </span>
                                )}
                              </div>
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
                            {client.isDeleted ? (
                              <span className="bwa-pill p-cancel" style={{ backgroundColor: '#fee2e2', color: '#b91c1c', border: '1px solid #fca5a5', fontWeight: 'bold' }}>
                                Account Deleted
                              </span>
                            ) : isCourse ? (
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
                        <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '6px' }}>
                          <b>{client.name}</b>
                          {client.isDeleted && (
                            <span
                              className="bwa-pill p-cancel"
                              style={{
                                fontSize: '0.65rem',
                                padding: '2px 6px',
                                backgroundColor: '#fee2e2',
                                color: '#b91c1c',
                                border: '1px solid #fca5a5',
                                fontWeight: 'bold',
                              }}
                            >
                              Account Deleted
                            </span>
                          )}
                        </div>
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
                      {client.isDeleted ? (
                        <span
                          className="bwa-pill p-cancel"
                          style={{
                            backgroundColor: '#fee2e2',
                            color: '#b91c1c',
                            border: '1px solid #fca5a5',
                            fontWeight: 'bold',
                          }}
                        >
                          Account Deleted
                        </span>
                      ) : client.course ? (
                        <span className="bwa-pill p-done">Student</span>
                      ) : client.appointments.length > 0 ? (
                        <span className="bwa-pill p-up">1-on-1 Client</span>
                      ) : (
                        <span className="bwa-pill p-none">Registered</span>
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

        {/* ----------------- SUBNAV TAB 3: FEE SETTINGS & COUPON CONTROL ----------------- */}
        {subnavTab === 'fees' && (
          <div style={{ maxWidth: '840px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '24px' }}>
            {/* Card 1: 1-on-1 Session Base Rates */}
            <div className="bwa-card">
              <div className="bwa-box">
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
                  <Icon name="rupee" size={20} style={{ color: 'var(--accent)' }} />
                  <h4 className="big" style={{ margin: 0 }}>1-on-1 Session Pricing</h4>
                </div>
                <p className="hint">Set your base rates for 60-minute and 90-minute private coaching calls.</p>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginTop: '16px' }}>
                  <div className="bwa-f" style={{ maxWidth: 'none' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                      <label style={{ margin: 0 }}>60-Minute Session Fee (INR)</label>
                      {(fees.fee60min !== '' && fees.fee60min !== 0 && fees.fee60min !== '0' && fees.fee60min !== null && fees.fee60min !== undefined) && (
                        <button
                          type="button"
                          onClick={() => {
                            setFees((prev) => ({ ...prev, fee60min: '' }));
                            setFeeDirty(true);
                          }}
                          style={{
                            border: 'none',
                            background: 'transparent',
                            color: 'var(--muted)',
                            fontSize: '11px',
                            cursor: 'pointer',
                            padding: '0 4px',
                            textDecoration: 'underline'
                          }}
                        >
                          Clear
                        </button>
                      )}
                    </div>
                    <div style={{ position: 'relative' }}>
                      <input
                        type="text"
                        inputMode="numeric"
                        placeholder="Enter 60-min session fee (e.g. 5000)"
                        value={fees.fee60min === 0 || fees.fee60min === '0' || fees.fee60min === '' || fees.fee60min === null || fees.fee60min === undefined ? '' : fees.fee60min}
                        onFocus={(e) => e.target.select()}
                        onChange={(e) => {
                          const val = e.target.value.replace(/\D/g, '');
                          setFees((prev) => ({ ...prev, fee60min: val }));
                          setFeeDirty(true);
                        }}
                        style={{ paddingRight: (fees.fee60min !== '' && fees.fee60min !== 0 && fees.fee60min !== '0') ? '34px' : '14px' }}
                      />
                      {(fees.fee60min !== '' && fees.fee60min !== 0 && fees.fee60min !== '0' && fees.fee60min !== null && fees.fee60min !== undefined) && (
                        <button
                          type="button"
                          onClick={() => {
                            setFees((prev) => ({ ...prev, fee60min: '' }));
                            setFeeDirty(true);
                          }}
                          style={{
                            position: 'absolute',
                            right: '10px',
                            top: '50%',
                            transform: 'translateY(-50%)',
                            border: 'none',
                            background: '#f0ede6',
                            color: 'var(--ink)',
                            width: '20px',
                            height: '20px',
                            borderRadius: '50%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '11px',
                            cursor: 'pointer',
                            lineHeight: 1
                          }}
                          title="Clear"
                        >
                          ✕
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="bwa-f" style={{ maxWidth: 'none' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                      <label style={{ margin: 0 }}>90-Minute Session Fee (INR)</label>
                      {(fees.fee90min !== '' && fees.fee90min !== 0 && fees.fee90min !== '0' && fees.fee90min !== null && fees.fee90min !== undefined) && (
                        <button
                          type="button"
                          onClick={() => {
                            setFees((prev) => ({ ...prev, fee90min: '' }));
                            setFeeDirty(true);
                          }}
                          style={{
                            border: 'none',
                            background: 'transparent',
                            color: 'var(--muted)',
                            fontSize: '11px',
                            cursor: 'pointer',
                            padding: '0 4px',
                            textDecoration: 'underline'
                          }}
                        >
                          Clear
                        </button>
                      )}
                    </div>
                    <div style={{ position: 'relative' }}>
                      <input
                        type="text"
                        inputMode="numeric"
                        placeholder="Enter 90-min session fee (e.g. 7500)"
                        value={fees.fee90min === 0 || fees.fee90min === '0' || fees.fee90min === '' || fees.fee90min === null || fees.fee90min === undefined ? '' : fees.fee90min}
                        onFocus={(e) => e.target.select()}
                        onChange={(e) => {
                          const val = e.target.value.replace(/\D/g, '');
                          setFees((prev) => ({ ...prev, fee90min: val }));
                          setFeeDirty(true);
                        }}
                        style={{ paddingRight: (fees.fee90min !== '' && fees.fee90min !== 0 && fees.fee90min !== '0') ? '34px' : '14px' }}
                      />
                      {(fees.fee90min !== '' && fees.fee90min !== 0 && fees.fee90min !== '0' && fees.fee90min !== null && fees.fee90min !== undefined) && (
                        <button
                          type="button"
                          onClick={() => {
                            setFees((prev) => ({ ...prev, fee90min: '' }));
                            setFeeDirty(true);
                          }}
                          style={{
                            position: 'absolute',
                            right: '10px',
                            top: '50%',
                            transform: 'translateY(-50%)',
                            border: 'none',
                            background: '#f0ede6',
                            color: 'var(--ink)',
                            width: '20px',
                            height: '20px',
                            borderRadius: '50%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '11px',
                            cursor: 'pointer',
                            lineHeight: 1
                          }}
                          title="Clear"
                        >
                          ✕
                        </button>
                      )}
                    </div>
                  </div>

                  <div style={{ marginTop: '8px', display: 'flex', gap: '10px' }}>
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

            {/* Card 2: 1-on-1 Coaching Session Coupon Codes & % Off Control */}
            <div className="bwa-card" id="session-coupon-editor">
              <div className="bwa-box">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px' }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
                      <Icon name="tag" size={20} style={{ color: 'var(--accent)' }} />
                      <h4 className="big" style={{ margin: 0 }}>Coaching Session Coupons &amp; % Discount Control</h4>
                    </div>
                    <p className="hint">
                      Create and control discount coupon codes with custom % off for clients booking 1-on-1 coaching sessions.
                    </p>
                  </div>
                  {editingCouponId && (
                    <span className="bwa-pill" style={{ background: '#fef3c7', color: '#92400e', border: '1px solid #fde68a', fontWeight: 700 }}>
                      Editing Coupon
                    </span>
                  )}
                </div>

                {/* Form to Add / Edit Coupon */}
                <form onSubmit={handleSaveCoupon} style={{ background: '#fcfbf9', border: '1px solid var(--line)', borderRadius: '16px', padding: '20px', marginTop: '18px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                    <span style={{ fontSize: '11.5px', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 800, color: 'var(--muted)' }}>
                      {editingCouponId ? `Edit Coupon: ${couponForm.code}` : '+ Add New Coaching Coupon Code'}
                    </span>
                    {editingCouponId && (
                      <button
                        type="button"
                        onClick={handleCancelEditCoupon}
                        className="bwa-link-btn"
                        style={{ height: 'auto', margin: 0, padding: 0, fontSize: '12px' }}
                      >
                        Cancel Edit
                      </button>
                    )}
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
                    {/* Coupon Code Input */}
                    <div className="bwa-f" style={{ maxWidth: 'none' }}>
                      <label>Coupon Code (e.g. AARKESH50)</label>
                      <input
                        type="text"
                        placeholder="ENTER CODE"
                        style={{ textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.05em' }}
                        value={couponForm.code}
                        onChange={(e) => setCouponForm({ ...couponForm, code: e.target.value.toUpperCase() })}
                      />
                    </div>

                    {/* Discount Value & Type */}
                    <div className="bwa-f" style={{ maxWidth: 'none' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '7px' }}>
                        <label style={{ margin: 0 }}>Discount {couponForm.discountType === 'percentage' ? '% Off' : 'Flat Off (INR)'}</label>
                        <div style={{ display: 'inline-flex', gap: '4px', background: 'var(--sand)', padding: '2px', borderRadius: '6px' }}>
                          <button
                            type="button"
                            onClick={() => setCouponForm({ ...couponForm, discountType: 'percentage' })}
                            style={{
                              border: 0,
                              background: couponForm.discountType === 'percentage' ? '#ffffff' : 'transparent',
                              color: couponForm.discountType === 'percentage' ? 'var(--ink)' : 'var(--muted)',
                              fontWeight: 700,
                              fontSize: '11px',
                              padding: '2px 8px',
                              borderRadius: '4px',
                              cursor: 'pointer'
                            }}
                          >
                            % Off
                          </button>
                          <button
                            type="button"
                            onClick={() => setCouponForm({ ...couponForm, discountType: 'fixed' })}
                            style={{
                              border: 0,
                              background: couponForm.discountType === 'fixed' ? '#ffffff' : 'transparent',
                              color: couponForm.discountType === 'fixed' ? 'var(--ink)' : 'var(--muted)',
                              fontWeight: 700,
                              fontSize: '11px',
                              padding: '2px 8px',
                              borderRadius: '4px',
                              cursor: 'pointer'
                            }}
                          >
                            Flat INR
                          </button>
                        </div>
                      </div>

                      <div style={{ position: 'relative' }}>
                        <input
                          type="text"
                          inputMode="numeric"
                          placeholder={couponForm.discountType === 'percentage' ? '50' : '1000'}
                          value={couponForm.discountValue === 0 || couponForm.discountValue === '0' || couponForm.discountValue === '' || couponForm.discountValue === null || couponForm.discountValue === undefined ? '' : couponForm.discountValue}
                          onFocus={(e) => e.target.select()}
                          onChange={(e) => {
                            const val = e.target.value.replace(/\D/g, '');
                            setCouponForm({ ...couponForm, discountValue: val });
                          }}
                          style={{ paddingRight: '40px', fontWeight: 700, fontSize: '15px' }}
                        />
                        <span style={{ position: 'absolute', right: '14px', top: '50%', transform: 'translateY(-50%)', fontWeight: 800, color: 'var(--muted)', fontSize: '14px', pointerEvents: 'none' }}>
                          {couponForm.discountType === 'percentage' ? '%' : 'INR'}
                        </span>
                      </div>

                      {/* Quick Percentage Presets */}
                      {couponForm.discountType === 'percentage' && (
                        <div style={{ display: 'flex', gap: '6px', marginTop: '8px', flexWrap: 'wrap' }}>
                          {[10, 20, 30, 50, 75].map((pct) => (
                            <button
                              key={pct}
                              type="button"
                              onClick={() => setCouponForm({ ...couponForm, discountValue: pct })}
                              style={{
                                border: '1px solid',
                                borderColor: Number(couponForm.discountValue) === pct ? 'var(--accent)' : 'var(--line)',
                                background: Number(couponForm.discountValue) === pct ? 'rgba(200, 80, 45, 0.12)' : '#ffffff',
                                color: Number(couponForm.discountValue) === pct ? 'var(--accent-d)' : 'var(--muted)',
                                fontWeight: 700,
                                fontSize: '11px',
                                padding: '3px 8px',
                                borderRadius: '6px',
                                cursor: 'pointer',
                                transition: 'all 0.15s ease'
                              }}
                            >
                              {pct}% off
                            </button>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Scope / Applicable To */}
                    <div className="bwa-f" style={{ maxWidth: 'none' }}>
                      <label>Applicable Scope</label>
                      <select
                        value={couponForm.applicableTo}
                        onChange={(e) => setCouponForm({ ...couponForm, applicableTo: e.target.value })}
                      >
                        <option value="session">Coaching Sessions Only</option>
                        <option value="all">Both Coaching Sessions &amp; Courses</option>
                      </select>
                    </div>

                    {/* Description */}
                    <div className="bwa-f" style={{ maxWidth: 'none' }}>
                      <label>Description / Note (Optional)</label>
                      <input
                        type="text"
                        placeholder="e.g. Special 50% discount for mentoring"
                        value={couponForm.description}
                        onChange={(e) => setCouponForm({ ...couponForm, description: e.target.value })}
                      />
                    </div>
                  </div>

                  {/* Status Toggle & Submit Button */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '16px', paddingTop: '14px', borderTop: '1px solid var(--line)', flexWrap: 'wrap', gap: '12px' }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '13px', fontWeight: 600, color: 'var(--ink)' }}>
                      <input
                        type="checkbox"
                        checked={couponForm.isActive}
                        onChange={(e) => setCouponForm({ ...couponForm, isActive: e.target.checked })}
                        style={{ width: '16px', height: '16px', accentColor: 'var(--accent)', cursor: 'pointer' }}
                      />
                      <span>Active coupon (immediately usable by clients)</span>
                    </label>

                    <div style={{ display: 'flex', gap: '8px' }}>
                      {editingCouponId && (
                        <button
                          type="button"
                          className="bwa-btn bwa-btn-line"
                          onClick={handleCancelEditCoupon}
                        >
                          Cancel
                        </button>
                      )}
                      <button
                        type="submit"
                        className="bwa-btn bwa-btn-accent"
                        disabled={savingCoupon}
                      >
                        {savingCoupon ? 'Saving...' : (editingCouponId ? 'Save Changes' : '+ Create Coupon')}
                      </button>
                    </div>
                  </div>
                </form>

                {/* Coaching Coupons List */}
                <div style={{ marginTop: '28px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                    <h5 style={{ margin: 0, fontSize: '13px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em', color: 'var(--muted)' }}>
                      Coaching Session Coupons ({sessionCouponsList.length})
                    </h5>
                    <button
                      type="button"
                      className="bwa-btn bwa-btn-line bwa-btn-sm"
                      onClick={fetchCouponsOnly}
                      disabled={loadingCoupons}
                      style={{ fontSize: '11px', padding: '4px 10px' }}
                    >
                      {loadingCoupons ? 'Refreshing...' : '↻ Refresh'}
                    </button>
                  </div>

                  {sessionCouponsList.length === 0 ? (
                    <div style={{ padding: '32px 16px', textAlign: 'center', background: '#faf8f5', borderRadius: '12px', border: '1px dashed var(--line)' }}>
                      <p style={{ margin: 0, color: 'var(--muted)', fontSize: '13px' }}>
                        No session coupons created yet. Use the form above to create your first coupon!
                      </p>
                    </div>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                      {sessionCouponsList.map((cpn) => {
                        const isPerc = cpn.discountType === 'percentage';
                        const discountLabel = isPerc ? `${cpn.discountValue}% OFF` : `₹${cpn.discountValue.toLocaleString('en-IN')} OFF`;
                        const isEditingThis = editingCouponId === cpn._id;

                        return (
                          <div
                            key={cpn._id || cpn.code}
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'space-between',
                              padding: '14px 16px',
                              background: isEditingThis ? 'rgba(200, 80, 45, 0.05)' : '#ffffff',
                              border: isEditingThis ? '1.5px solid var(--accent)' : '1px solid var(--line)',
                              borderRadius: '12px',
                              gap: '14px',
                              flexWrap: 'wrap',
                              transition: 'all 0.15s ease'
                            }}
                          >
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', minWidth: '200px' }}>
                              <span
                                style={{
                                  fontFamily: 'monospace',
                                  fontSize: '14px',
                                  fontWeight: 800,
                                  color: 'var(--ink)',
                                  background: 'var(--sand)',
                                  padding: '4px 10px',
                                  borderRadius: '6px',
                                  letterSpacing: '0.06em'
                                }}
                              >
                                {cpn.code}
                              </span>
                              <button
                                type="button"
                                className="bwa-copy-btn"
                                style={{ padding: '2px 8px', fontSize: '11px' }}
                                onClick={() => copyToClipboard(cpn.code)}
                              >
                                Copy
                              </button>
                              <span
                                className="bwa-pill"
                                style={{
                                  background: cpn.isActive ? '#e8f5e9' : '#f5f5f5',
                                  color: cpn.isActive ? '#1b5e20' : '#757575',
                                  border: cpn.isActive ? '1px solid #a5d6a7' : '1px solid #e0e0e0',
                                  fontWeight: 800,
                                  fontSize: '11px',
                                  padding: '3px 8px'
                                }}
                              >
                                {discountLabel}
                              </span>
                            </div>

                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
                              <span style={{ fontSize: '11.5px', color: 'var(--muted)', background: 'var(--paper)', padding: '2px 8px', borderRadius: '4px' }}>
                                {cpn.applicableTo === 'all' ? 'Sessions & Courses' : 'Coaching Only'}
                              </span>

                              {cpn.usedCount !== undefined && (
                                <span style={{ fontSize: '11.5px', color: 'var(--muted)' }}>
                                  {cpn.usedCount} used
                                </span>
                              )}

                              {/* Active Status Toggle Button */}
                              <button
                                type="button"
                                onClick={() => handleToggleCouponActive(cpn)}
                                style={{
                                  border: 0,
                                  cursor: 'pointer',
                                  borderRadius: '99px',
                                  padding: '4px 10px',
                                  fontSize: '11px',
                                  fontWeight: 700,
                                  background: cpn.isActive ? '#dcfce7' : '#fee2e2',
                                  color: cpn.isActive ? '#15803d' : '#b91c1c',
                                  transition: 'all 0.15s ease'
                                }}
                                title="Click to toggle active status"
                              >
                                {cpn.isActive ? '● Active' : '○ Disabled'}
                              </button>

                              {/* Edit Action */}
                              <button
                                type="button"
                                className="bwa-btn bwa-btn-line bwa-btn-sm"
                                onClick={() => handleEditCoupon(cpn)}
                                style={{ padding: '4px 8px', fontSize: '11px', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                                title="Edit discount % or code"
                              >
                                <Icon name="edit" size={12} />
                                <span>Edit</span>
                              </button>

                              {/* Delete Action */}
                              <button
                                type="button"
                                className="bwa-btn bwa-btn-danger bwa-btn-sm"
                                onClick={() => handleDeleteCoupon(cpn)}
                                style={{ padding: '4px 8px', fontSize: '11px', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                                title="Delete coupon"
                              >
                                <Icon name="trash" size={12} />
                              </button>
                            </div>

                            {cpn.description && (
                              <div style={{ width: '100%', fontSize: '11.5px', color: 'var(--muted)', marginTop: '-4px', paddingLeft: '2px' }}>
                                {cpn.description}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
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
        {(() => {
          const client = selectedClient || (selectedAppt ? getClientForAppt(selectedAppt) : null);
          if (!client && !selectedAppt) return null;
          return (
            <>
              {drawerMode === 'appt' && selectedAppt ? (
                /* ================= APPOINTMENT DETAIL DRAWER ================= */
                <>
                  <div className="bwa-d-head">
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
                        <h3 style={{ margin: 0 }}>Appointment with {client?.name || selectedAppt.name || 'Client'}</h3>
                        {(client?.isDeleted || selectedAppt.isUserDeleted) && (
                        <span
                          className="bwa-pill p-cancel"
                          style={{
                            fontSize: '0.7rem',
                            padding: '2px 8px',
                            backgroundColor: '#fee2e2',
                            color: '#b91c1c',
                            border: '1px solid #fca5a5',
                            fontWeight: 'bold',
                          }}
                        >
                          Account Deleted
                        </span>
                      )}
                    </div>
                    <span className="s">
                      {formatDate(selectedAppt.date)} at {formatTime(selectedAppt.time, selectedAppt.date)}
                    </span>
                  </div>
                  <button className="bwa-x-btn" onClick={closeDrawer} aria-label="Close">
                    ×
                  </button>
                </div>

                <div className="bwa-d-body">
                  {/* 5 Tabs: Overview / Agreement / Reschedule / Client answers / Coach notes */}
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
                      className={drawerTab === 'agreement' ? 'on' : ''}
                      onClick={() => setDrawerTab('agreement')}
                      style={selectedAppt.agreementStatus === 'PENDING_REVIEW' ? { color: '#92400e', fontWeight: 700 } : {}}
                    >
                      Agreement
                      {selectedAppt.agreementStatus === 'PENDING_REVIEW' && (
                        <span style={{
                          display: 'inline-block',
                          marginLeft: '5px',
                          width: '7px',
                          height: '7px',
                          borderRadius: '50%',
                          backgroundColor: '#d97706',
                          verticalAlign: 'middle'
                        }} />
                      )}
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
                      {selectedAppt.agreementStatus === 'PENDING_REVIEW' && (
                        <div
                          style={{
                            background: '#fffbeb',
                            border: '1px solid #fde68a',
                            borderRadius: '10px',
                            padding: '12px 14px',
                            marginBottom: '14px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            gap: '12px',
                            flexWrap: 'wrap'
                          }}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <span style={{ fontSize: '1.2rem' }}>📝</span>
                            <div>
                              <strong style={{ color: '#92400e', fontSize: '0.86rem', display: 'block' }}>
                                Agreement Pending Review
                              </strong>
                              <span style={{ color: '#78350f', fontSize: '0.78rem' }}>
                                Client has not received confirmation email or agreement PDF yet.
                              </span>
                            </div>
                          </div>
                          <button
                            className="bwa-btn bwa-btn-sm"
                            style={{ background: '#d97706', color: '#fff', border: 'none', fontWeight: 600, fontSize: '0.75rem', padding: '6px 14px', borderRadius: '6px', cursor: 'pointer' }}
                            onClick={() => setDrawerTab('agreement')}
                          >
                            Review &amp; Send Agreement &rarr;
                          </button>
                        </div>
                      )}

                      {(selectedClient.isDeleted || selectedAppt.isUserDeleted) && (
                        <div
                          style={{
                            backgroundColor: '#fef2f2',
                            border: '1px solid #fca5a5',
                            color: '#991b1b',
                            borderRadius: '8px',
                            padding: '12px 14px',
                            fontSize: '0.85rem',
                            marginBottom: '14px',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            fontWeight: 500,
                          }}
                        >
                          ⚠️ <span><strong>Account Deleted</strong>: This user has deleted their account from the portal.</span>
                        </div>
                      )}

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
                            <span>Booked On</span>
                            <b style={{ color: '#111010' }}>
                              {selectedAppt.createdAt ? `${formatDateShort(selectedAppt.createdAt)}, ${formatTime(null, selectedAppt.createdAt)}` : '—'}
                            </b>
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
                            <b>{client?.name || selectedAppt.name || 'Client'}</b>
                          </div>
                          <div>
                            <span>Email</span>
                            <b>{client?.email || selectedAppt.email || '—'}</b>
                          </div>
                          <div>
                            <span>Phone</span>
                            <b>{client?.phone || selectedAppt.phoneNumber || selectedAppt.phone || '—'}</b>
                          </div>
                          <div>
                            <span>Session duration</span>
                            <b>{selectedAppt.duration || 60} Minutes</b>
                          </div>
                        </div>
                      </div>

                      {/* Course Purchase Box */}
                      {client?.course ? (
                        <div className="bwa-box">
                          <h4>
                            Course purchase <span className="bwa-pill p-done">Enrolled</span>
                          </h4>
                          <div className="bwa-line-row">
                            <span>Course</span>
                            <b>{client.course.name}</b>
                          </div>
                          <div className="bwa-line-row">
                            <span>Bought on</span>
                            <b>
                              {formatDateShort(client.course.paidAt)},{' '}
                              {formatTime(client.course.paidAt)}
                            </b>
                          </div>
                          <div className="bwa-line-row">
                            <span>Amount paid</span>
                            <b>{inr(client.course.amount)}</b>
                          </div>
                          <div className="bwa-line-row">
                            <span>Free 1-on-1 sessions</span>
                            <b>
                              {getClientFreeUsed(client)} of {getClientTotalFree(client)} used ·{' '}
                              <span style={{ color: 'var(--accent)' }}>
                                {Math.max(0, getClientTotalFree(client) - getClientFreeUsed(client))} left
                              </span>
                            </b>
                          </div>
                          <div className="bwa-prog">
                            <i
                              style={{
                                width: `${Math.min(
                                  100,
                                  (getClientFreeUsed(client) / getClientTotalFree(client)) * 100
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

                  {/* TAB 2: AGREEMENT */}
                  {drawerTab === 'agreement' && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                      {/* Status Callout Banner */}
                      {selectedAppt.agreementStatus === 'PENDING_REVIEW' ? (
                        <div
                          style={{
                            background: '#fffbeb',
                            border: '1px solid #fde68a',
                            borderRadius: '12px',
                            padding: '16px',
                            display: 'flex',
                            gap: '12px',
                            alignItems: 'flex-start'
                          }}
                        >
                          <span style={{ fontSize: '1.4rem', lineHeight: 1 }}>⏳</span>
                          <div>
                            <h4 style={{ margin: '0 0 4px', color: '#92400e', fontSize: '0.95rem', fontWeight: 700 }}>
                              Action Required: Review &amp; Approve Coaching Agreement
                            </h4>
                            <p style={{ margin: 0, color: '#78350f', fontSize: '0.82rem', lineHeight: 1.5 }}>
                              The client has booked this session, but the confirmation email with the official Coaching Agreement has <strong>NOT</strong> been sent yet.
                              Review the details below, customize the coaching focus or communication support notes, preview the exact PDF replica, and click <strong>"Approve &amp; Send Agreement"</strong> to deliver it to the client.
                            </p>
                          </div>
                        </div>
                      ) : (
                        <div
                          style={{
                            background: '#f0fdf4',
                            border: '1px solid #bbf7d0',
                            borderRadius: '12px',
                            padding: '16px',
                            display: 'flex',
                            gap: '12px',
                            alignItems: 'flex-start'
                          }}
                        >
                          <span style={{ fontSize: '1.4rem', lineHeight: 1 }}>✅</span>
                          <div>
                            <h4 style={{ margin: '0 0 4px', color: '#166534', fontSize: '0.95rem', fontWeight: 700 }}>
                              Coaching Agreement Approved &amp; Sent
                            </h4>
                            <p style={{ margin: 0, color: '#15803d', fontSize: '0.82rem', lineHeight: 1.5 }}>
                              Delivered to <strong>{agreementForm.clientEmail || selectedAppt.email}</strong> on{' '}
                              {selectedAppt.agreementSentAt
                                ? `${formatDate(selectedAppt.agreementSentAt)} at ${formatTime(null, selectedAppt.agreementSentAt)}`
                                : 'file'}. You can preview the PDF or re-send with updated details anytime.
                            </p>
                          </div>
                        </div>
                      )}

                      {/* Agreement Editor Card */}
                      <div className="bwa-box">
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px', flexWrap: 'wrap', gap: '8px' }}>
                          <div>
                            <h4 className="big" style={{ margin: 0 }}>Editable Agreement Form</h4>
                            <p className="hint" style={{ margin: '2px 0 0' }}>Fields populated in the generated legal PDF document.</p>
                          </div>
                          <button
                            type="button"
                            className="bwa-btn bwa-btn-line bwa-btn-sm"
                            style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontWeight: 600 }}
                            onClick={handlePreviewAgreementPdf}
                          >
                            <span>📄</span> Preview PDF (New Tab)
                          </button>
                        </div>

                        {/* Client Meta Fields */}
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '12px', marginBottom: '14px' }}>
                          <div>
                            <label style={{ display: 'block', fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 700, color: '#666', marginBottom: '4px' }}>
                              Client Name
                            </label>
                            <input
                              type="text"
                              className="bwa-input"
                              style={{ width: '100%', padding: '8px 10px', fontSize: '0.85rem', borderRadius: '6px', border: '1px solid #d6cfc7', background: '#fff' }}
                              value={agreementForm.clientName}
                              onChange={(e) => setAgreementForm({ ...agreementForm, clientName: e.target.value })}
                            />
                          </div>

                          <div>
                            <label style={{ display: 'block', fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 700, color: '#666', marginBottom: '4px' }}>
                              Client Email
                            </label>
                            <input
                              type="email"
                              className="bwa-input"
                              style={{ width: '100%', padding: '8px 10px', fontSize: '0.85rem', borderRadius: '6px', border: '1px solid #d6cfc7', background: '#fff' }}
                              value={agreementForm.clientEmail}
                              onChange={(e) => setAgreementForm({ ...agreementForm, clientEmail: e.target.value })}
                            />
                          </div>

                          <div>
                            <label style={{ display: 'block', fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 700, color: '#666', marginBottom: '4px' }}>
                              Client Phone
                            </label>
                            <input
                              type="text"
                              className="bwa-input"
                              style={{ width: '100%', padding: '8px 10px', fontSize: '0.85rem', borderRadius: '6px', border: '1px solid #d6cfc7', background: '#fff' }}
                              value={agreementForm.clientPhone}
                              onChange={(e) => setAgreementForm({ ...agreementForm, clientPhone: e.target.value })}
                            />
                          </div>

                          <div>
                            <label style={{ display: 'block', fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 700, color: '#666', marginBottom: '4px' }}>
                              Agreement Date
                            </label>
                            <input
                              type="text"
                              className="bwa-input"
                              style={{ width: '100%', padding: '8px 10px', fontSize: '0.85rem', borderRadius: '6px', border: '1px solid #d6cfc7', background: '#fff' }}
                              value={agreementForm.agreementDate}
                              onChange={(e) => setAgreementForm({ ...agreementForm, agreementDate: e.target.value })}
                            />
                          </div>
                        </div>

                        {/* Session Schedule Fields */}
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '12px', marginBottom: '14px', background: '#faf8f5', padding: '12px', borderRadius: '8px', border: '1px solid #ede7df' }}>
                          <div>
                            <label style={{ display: 'block', fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 700, color: '#666', marginBottom: '4px' }}>
                              Session Date
                            </label>
                            <input
                              type="text"
                              className="bwa-input"
                              style={{ width: '100%', padding: '8px 10px', fontSize: '0.85rem', borderRadius: '6px', border: '1px solid #d6cfc7', background: '#fff' }}
                              value={agreementForm.sessionDate}
                              onChange={(e) => setAgreementForm({ ...agreementForm, sessionDate: e.target.value })}
                            />
                          </div>

                          <div>
                            <label style={{ display: 'block', fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 700, color: '#666', marginBottom: '4px' }}>
                              Session Time
                            </label>
                            <input
                              type="text"
                              className="bwa-input"
                              style={{ width: '100%', padding: '8px 10px', fontSize: '0.85rem', borderRadius: '6px', border: '1px solid #d6cfc7', background: '#fff' }}
                              value={agreementForm.sessionTime}
                              onChange={(e) => setAgreementForm({ ...agreementForm, sessionTime: e.target.value })}
                            />
                          </div>

                          <div>
                            <label style={{ display: 'block', fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 700, color: '#666', marginBottom: '4px' }}>
                              Mode of Coaching
                            </label>
                            <input
                              type="text"
                              className="bwa-input"
                              style={{ width: '100%', padding: '8px 10px', fontSize: '0.85rem', borderRadius: '6px', border: '1px solid #d6cfc7', background: '#fff' }}
                              value={agreementForm.modeOfCoaching}
                              onChange={(e) => setAgreementForm({ ...agreementForm, modeOfCoaching: e.target.value })}
                            />
                          </div>

                          <div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                              <label style={{ fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 700, color: '#666', margin: 0 }}>
                                Google Meet Link
                              </label>
                              {agreementForm.meetLink && (
                                <a
                                  href={agreementForm.meetLink}
                                  target="_blank"
                                  rel="noreferrer"
                                  style={{ fontSize: '0.72rem', color: '#c9542f', fontWeight: 600, textDecoration: 'underline' }}
                                >
                                  Test Link ↗
                                </a>
                              )}
                            </div>
                            <input
                              type="text"
                              className="bwa-input"
                              placeholder="https://meet.google.com/..."
                              style={{ width: '100%', padding: '8px 10px', fontSize: '0.85rem', borderRadius: '6px', border: '1px solid #d6cfc7', background: '#fff' }}
                              value={agreementForm.meetLink}
                              onChange={(e) => setAgreementForm({ ...agreementForm, meetLink: e.target.value })}
                            />
                          </div>
                        </div>

                        {/* Section 6: Between-Session Support */}
                        <div style={{ marginBottom: '14px' }}>
                          <label style={{ display: 'block', fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 700, color: '#666', marginBottom: '4px' }}>
                            Section 6: Between-Session Communication &amp; Support (Optional Customization)
                          </label>
                          <textarea
                            className="bwa-textarea"
                            rows={3}
                            placeholder="Leave blank for standard terms (WhatsApp / Email, 24-48h turnaround) or specify custom arrangement..."
                            style={{ width: '100%', minHeight: '65px', padding: '8px 10px', fontSize: '0.84rem', borderRadius: '6px', border: '1px solid #d6cfc7', fontFamily: 'inherit' }}
                            value={agreementForm.betweenSessionSupport}
                            onChange={(e) => setAgreementForm({ ...agreementForm, betweenSessionSupport: e.target.value })}
                          />
                          <p className="hint" style={{ margin: '3px 0 0', fontSize: '0.72rem' }}>
                            Leave blank to show standard placeholder lines, or enter custom between-session communication terms.
                          </p>
                        </div>

                        {/* Additional Agreed Terms */}
                        <div style={{ marginBottom: '18px' }}>
                          <label style={{ display: 'block', fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 700, color: '#666', marginBottom: '4px' }}>
                            Additional Agreed Terms, if any (Optional Customization)
                          </label>
                          <textarea
                            className="bwa-textarea"
                            rows={3}
                            placeholder="Write any special or additional agreed terms to include at the end of the agreement..."
                            style={{ width: '100%', minHeight: '65px', padding: '8px 10px', fontSize: '0.84rem', borderRadius: '6px', border: '1px solid #d6cfc7', fontFamily: 'inherit' }}
                            value={agreementForm.additionalAgreedTerms}
                            onChange={(e) => setAgreementForm({ ...agreementForm, additionalAgreedTerms: e.target.value })}
                          />
                          <p className="hint" style={{ margin: '3px 0 0', fontSize: '0.72rem' }}>
                            Leave blank to show standard blank lines in the PDF, or enter custom terms.
                          </p>
                        </div>

                        {/* Agreement Form Action Buttons */}
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '10px', flexWrap: 'wrap', paddingTop: '12px', borderTop: '1px solid #eae2d6' }}>
                          <button
                            type="button"
                            className="bwa-btn bwa-btn-line"
                            style={{ fontWeight: 600 }}
                            onClick={handlePreviewAgreementPdf}
                          >
                            👁️ Preview PDF
                          </button>

                          <button
                            type="button"
                            className="bwa-btn bwa-btn-line"
                            disabled={isSavingAgreement || isSendingAgreement}
                            onClick={handleSaveAgreementDraft}
                          >
                            {isSavingAgreement ? 'Saving Draft...' : '💾 Save Draft'}
                          </button>

                          <button
                            type="button"
                            className="bwa-btn bwa-btn-accent"
                            style={{ background: '#c9542f', color: '#fff', fontWeight: 700, padding: '9px 20px', borderRadius: '8px' }}
                            disabled={isSavingAgreement || isSendingAgreement}
                            onClick={handleSendAgreementToClient}
                          >
                            {isSendingAgreement
                              ? 'Delivering Agreement...'
                              : selectedAppt.agreementStatus === 'APPROVED_SENT'
                              ? '✓ Re-send Agreement to Client'
                              : '🚀 Approve & Send Agreement to Client'}
                          </button>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* TAB 3: RESCHEDULE */}
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

                      {/* Optional Coaching Questionnaire Answers */}
                      <AdminQuestionnaireViewer
                        questionnaireAnswers={
                          selectedAppt.questionnaireAnswers ||
                          selectedAppt.qa ||
                          selectedAppt.questionnaire ||
                          selectedAppt.answers?.questionnaireAnswers ||
                          selectedAppt.answers
                        }
                        clientName={selectedAppt.name || selectedAppt.userName || 'Client'}
                        appointmentDate={selectedAppt.date ? `${selectedAppt.date} ${selectedAppt.time || ''}` : ''}
                      />
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
                  {selectedAppt.agreementStatus === 'PENDING_REVIEW' && drawerTab !== 'agreement' && (
                    <button
                      className="bwa-btn bwa-btn-accent"
                      style={{ background: '#d97706', color: '#fff', border: 'none' }}
                      onClick={() => setDrawerTab('agreement')}
                    >
                      Review Agreement &rarr;
                    </button>
                  )}
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
                    <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
                      <h3 style={{ margin: 0 }}>{selectedClient.name}</h3>
                      {selectedClient.isDeleted && (
                        <span
                          className="bwa-pill p-cancel"
                          style={{
                            fontSize: '0.7rem',
                            padding: '2px 8px',
                            backgroundColor: '#fee2e2',
                            color: '#b91c1c',
                            border: '1px solid #fca5a5',
                            fontWeight: 'bold',
                          }}
                        >
                          Account Deleted
                        </span>
                      )}
                    </div>
                    <span className="s">
                      {selectedClient.course ? `Student account #${selectedClient.acct}` : 'Client account'}
                    </span>
                  </div>
                  <button className="bwa-x-btn" onClick={closeDrawer} aria-label="Close">
                    ×
                  </button>
                </div>

                <div className="bwa-d-body">
                  {selectedClient.isDeleted && (
                    <div
                      style={{
                        backgroundColor: '#fef2f2',
                        border: '1px solid #fca5a5',
                        color: '#991b1b',
                        borderRadius: '8px',
                        padding: '12px 14px',
                        fontSize: '0.85rem',
                        marginBottom: '14px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        fontWeight: 500,
                      }}
                    >
                      ⚠️ <span><strong>Account Deleted</strong>: This user submitted an account deletion request. Their active sessions have been cancelled and personal data cleared.</span>
                    </div>
                  )}

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
        );
      })()}
      </aside>
    </div>
  );
}
