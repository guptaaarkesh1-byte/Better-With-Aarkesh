import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Sparkle, CheckCircle } from '@phosphor-icons/react';
import BookingStepper from '../components/booking/BookingStepper';
import Step1Time from '../components/booking/Step1Time';
import Step2Details from '../components/booking/Step2Details';
import Step3Confirm from '../components/booking/Step3Confirm';
import BookingSuccess from '../components/booking/BookingSuccess';
import BookingCancelled from '../components/booking/BookingCancelled';
import LoginModal from '../components/layout/LoginModal';
import bookingBgLocal from '../assets/images/booking_bg_lamp.png';
import { CDN_IMAGES } from '../utils/cdnAssets';
import config from '../data/questionnaireConfig.json';
import { 
  getOrCreateBookingDraftId, 
  loadQuestionnaireDraft, 
  saveQuestionnaireDraft,
  clearQuestionnaireDraft, 
  buildResponseContractPayload,
  convertResponsesToDraft,
  countAnsweredQuestions
} from '../utils/questionnaireDraft';
import { 
  heartbeatSlot, 
  releaseSlot, 
  releaseSlotBeacon 
} from '../utils/slotHoldService';

const bookingBg = CDN_IMAGES.BOOKING_LAMP_BG || bookingBgLocal;

export default function Booking() {
  const navigate = useNavigate();
  const [isLoggedIn, setIsLoggedIn] = useState(() => !!localStorage.getItem('token'));
  const [hasExistingSavedProfile, setHasExistingSavedProfile] = useState(() => {
    try {
      const u = JSON.parse(localStorage.getItem('user') || localStorage.getItem('courseUser') || 'null');
      return Boolean((localStorage.getItem('token') || localStorage.getItem('courseToken')) && u?.intakeProfile?.reason?.trim());
    } catch {
      return false;
    }
  });
  
  // Maintain session-scoped draft ID
  const [draftId] = useState(() => getOrCreateBookingDraftId());
  const bookingCompletedRef = useRef(false);
  const [questionnaireDraft, setQuestionnaireDraft] = useState(() => {
    return loadQuestionnaireDraft(draftId) || {
      booking_draft_id: draftId,
      questionnaire_id: config.questionnaire_id || 'bwa_optional_coaching',
      content_version: config.content_version || '2026-10-16-v1',
      opened: false,
      last_screen: 'intro',
      answers: {}
    };
  });

  // Sync questionnaire draft with User profile when logged in
  useEffect(() => {
    const token = localStorage.getItem('token') || localStorage.getItem('courseToken');
    if (!token) return;

    const fetchUserProfileQuestionnaire = async () => {
      try {
        const res = await fetch(`${import.meta.env.VITE_API_URL}/api/users/questionnaire`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.ok) {
          const resData = await res.json();
          if (resData?.questionnaireAnswers) {
            const profileDraft = convertResponsesToDraft(resData.questionnaireAnswers, draftId);
            setQuestionnaireDraft(profileDraft);
            saveQuestionnaireDraft(draftId, profileDraft);
            setBookingData(prev => ({
              ...prev,
              questionnaireAnswers: resData.questionnaireAnswers
            }));
          } else {
            // User has NOT filled questionnaire in profile - clear stale drafts so questionnaire option shows
            clearQuestionnaireDraft(draftId);
            const freshDraft = {
              booking_draft_id: draftId,
              questionnaire_id: config.questionnaire_id || 'bwa_optional_coaching',
              content_version: config.content_version || '2026-10-16-v1',
              opened: false,
              last_screen: 'intro',
              answers: {}
            };
            setQuestionnaireDraft(freshDraft);
            setBookingData(prev => ({
              ...prev,
              questionnaireAnswers: null
            }));
          }
        }
      } catch (err) {
        console.error('Failed to pre-fill questionnaire from user profile:', err);
      }
    };

    fetchUserProfileQuestionnaire();
  }, [draftId]);

  const [step, setStep] = useState(() => {
    const savedStep = sessionStorage.getItem('bookingStep');
    if (savedStep) {
      const parsed = parseInt(savedStep, 10);
      if (parsed >= 1 && parsed <= 3) return parsed;
    }
    return 1;
  });

  const [bookingData, setBookingData] = useState(() => {
    let userInfo = {};
    try {
      const saved = localStorage.getItem('user') || localStorage.getItem('courseUser') || localStorage.getItem('userInfo');
      if (saved) userInfo = JSON.parse(saved);
    } catch {}

    const loggedInEmail = (userInfo.email || '').trim().toLowerCase();

    const savedData = sessionStorage.getItem('bookingData');
    if (savedData) {
      try {
        const parsed = JSON.parse(savedData);
        if (parsed && typeof parsed === 'object') {
          // If the logged-in user changed or doesn't match the cached email in sessionStorage, discard stale draft!
          if (loggedInEmail && parsed.email && parsed.email.trim().toLowerCase() !== loggedInEmail) {
            sessionStorage.removeItem('bookingData');
          } else {
            return {
              ...parsed,
              email: loggedInEmail || parsed.email || '',
              name: (loggedInEmail ? (userInfo.fullName || userInfo.name) : '') || parsed.name || '',
              phoneNumber: (loggedInEmail ? (userInfo.phoneNumber || userInfo.phone) : '') || parsed.phoneNumber || ''
            };
          }
        }
      } catch (e) {}
    }

    return {
      date: null,
      time: null,
      name: userInfo.fullName || userInfo.name || '',
      email: loggedInEmail,
      countryCode: userInfo.countryCode || '+91',
      phoneNumber: userInfo.phoneNumber || '',
      source: '',
      otherSource: '',
      reason: '',
      extra: '',
      usePackageCredit: false,
      isPackage: false,
      bookingMode: 'single'
    };
  });
  const [successBookingData, setSuccessBookingData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [fees, setFees] = useState({ fee60min: 5000, fee90min: 7500 });
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState('register');
  const [authDefaultEmail, setAuthDefaultEmail] = useState('');
  const [authDefaultName, setAuthDefaultName] = useState('');
  const [authDefaultPhone, setAuthDefaultPhone] = useState('');
  const [freeSessionInfo, setFreeSessionInfo] = useState({
    hasFreeSessions: false,
    freeSessions: 0,
    isCoursePurchaser: false,
    courseUserName: ''
  });
  const [packageCreditInfo, setPackageCreditInfo] = useState({
    hasCredits: false,
    totalCredits: 0,
    packages: []
  });
  const [bookingSettings, setBookingSettings] = useState({
    general: {
      bgImageUrl: '',
      overlayOpacity: 60,
      privacyNoteLine1: 'Your information is private and only visible to me.',
      privacyNoteLine2: 'It helps me show up better for you.'
    },
    step1: {
      chapterTag: 'CHAPTER 1 OF 3',
      title: "Let's Find a Time That Works",
      subtitleLine1: "You don't need to have everything figured out before you begin.",
      subtitleLine2: "This is a space for honest conversation and real clarity.",
      dateHeading: "CHOOSE A DATE",
      timeHeading: "CHOOSE A TIME",
      noSlotsText: "No slots available on this date. Please pick another date.",
      morningLabel: "Morning",
      morningSub: "Before 12:00 PM",
      afternoonLabel: "Afternoon",
      afternoonSub: "12:00 PM – 5:00 PM",
      eveningLabel: "Evening",
      eveningSub: "5:00 PM Onwards",
    },
    step2: {
      chapterTag: 'CHAPTER 2 OF 3',
      title: "A Little About You",
      subtitleLine1: "This helps me understand you better before we meet.",
      subtitleLine2: "Share only what you're comfortable with.",
      nameLabel: "YOUR NAME",
      namePlaceholder: "What should I call you?",
      sourceLabel: "HOW DID YOU HEAR ABOUT ME? (OPTIONAL)",
      sourcePlaceholder: "Select an option",
      otherSourcePlaceholder: "Please specify (e.g. YouTube, Podcast, Friend, Book...)",
      emailLabel: "EMAIL",
      emailPlaceholder: "your.email@example.com",
      phoneLabel: "PHONE NUMBER",
      phonePlaceholder: "Enter 10-digit number",
      reasonLabel: "WHAT BRINGS YOU HERE?",
      reasonPlaceholder: "Tell me a little about where you are right now and what you're hoping to get out of our time together...",
      extraLabel: "ANYTHING ELSE I SHOULD KNOW? (OPTIONAL)",
      extraPlaceholder: "Any specific questions, concerns, or background context...",
      continueButtonText: "CONTINUE TO CONFIRMATION",
      backButtonText: "BACK",
    },
    step3: {
      chapterTag: 'CHAPTER 3 OF 3',
      title: "Confirm & Secure Your Session",
      subtitleLine1: "Almost there. Review your session details",
      subtitleLine2: "and let's make it official.",
      sessionDetailsHeading: "SESSION DETAILS",
      dateLabel: "Date",
      timeLabel: "Time",
      sessionTypeLabel: "Session Type",
      durationLabel: "Duration",
      whereLabel: "Where",
      whereValue: "Google Meet",
      whereNote: "(Link will be shared after booking)",
      totalAmountLabel: "Total Amount",
      whatHappensNextHeading: "WHAT HAPPENS NEXT",
      nextSteps: [
        {
          title: "You'll receive a confirmation email",
          description: "With all the details and next steps."
        },
        {
          title: "A reminder before our session",
          description: "So you can show up fully."
        },
        {
          title: "A private, confidential space",
          description: "Built for honest conversations."
        },
        {
          title: "This is your time",
          description: "To reflect, gain clarity, and move forward."
        }
      ],
      rescheduleHeading: "NEED TO RESCHEDULE?",
      rescheduleText: "You can reschedule or cancel up to 48 hours before the session.",
      reschedulePolicyLinkText: "View Rescheduling Policy",
      agreementPrefix: "I agree to the",
      agreementLinkText: "terms and conditions",
      agreementSuffix: "and understand that the amount above is the total payment shown in this summary.",
      confirmButtonText: "CONFIRM & BOOK",
      confirmFreeButtonText: "CONFIRM FREE SESSION",
      backButtonText: "BACK",
    }
  });

  // Fetch live booking settings from backend
  useEffect(() => {
    const fetchBookingSettings = async () => {
      try {
        const res = await fetch(`${import.meta.env.VITE_API_URL}/api/booking-settings`);
        if (res.ok) {
          const data = await res.json();
          setBookingSettings(prev => ({
            general: { ...prev.general, ...(data.general || {}) },
            step1: { ...prev.step1, ...(data.step1 || {}) },
            step2: { ...prev.step2, ...(data.step2 || {}) },
            step3: { ...prev.step3, ...(data.step3 || {}) },
          }));
        }
      } catch (err) {
        console.error('Failed to fetch booking settings:', err);
      }
    };
    fetchBookingSettings();
  }, []);

  // Handle openAuth query param and auth modal pre-fill
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const openAuth = params.get('openAuth');
    const mode = params.get('authMode') || 'register';
    const paramEmail = params.get('email');
    const paramName = params.get('name');
    const paramPhone = params.get('phone');
    const usePackageCreditParam = params.get('usePackageCredit') === 'true' || params.get('packageCredit') === 'true';
    const paramPackageId = params.get('packageId');

    if (usePackageCreditParam) {
      setBookingData(prev => ({
        ...prev,
        usePackageCredit: true,
        packageId: paramPackageId || prev.packageId,
        bookingMode: 'single'
      }));
    }

    if (mode) setAuthMode(mode);
    if (paramEmail) setAuthDefaultEmail(paramEmail);
    if (paramName) setAuthDefaultName(paramName);
    if (paramPhone) setAuthDefaultPhone(paramPhone);

    const token = localStorage.getItem('token') || localStorage.getItem('courseToken');
    const loggedIn = !!token;
    setIsLoggedIn(loggedIn);

    let localUser = null;
    try {
      localUser = JSON.parse(localStorage.getItem('user') || localStorage.getItem('courseUser') || 'null');
    } catch {}

    const loggedInEmail = (localUser?.email || '').trim().toLowerCase();
    const resolvedEmail = paramEmail || loggedInEmail;
    const resolvedName = paramName || localUser?.fullName || localUser?.name || '';
    const resolvedPhone = paramPhone || localUser?.phoneNumber || localUser?.phone || '';
    const resolvedSource = localUser?.intakeProfile?.source || '';
    const resolvedOtherSource = localUser?.intakeProfile?.otherSource || '';
    const resolvedReason = localUser?.intakeProfile?.reason || '';
    const resolvedExtra = localUser?.intakeProfile?.extra || '';

    if (resolvedReason?.trim()) {
      setHasExistingSavedProfile(true);
    }

    if (loggedIn && loggedInEmail) {
      setBookingData(prev => {
        const isDifferentEmail = prev.email && prev.email.trim().toLowerCase() !== loggedInEmail;
        if (isDifferentEmail) {
          try { sessionStorage.removeItem('bookingData'); } catch {}
          setPackageCreditInfo({ hasCredits: false, totalCredits: 0, packages: [] });
          setFreeSessionInfo({ hasFreeSessions: false, freeSessions: 0, isCoursePurchaser: false, courseUserName: '' });
        }
        return {
          ...prev,
          name: isDifferentEmail ? resolvedName : (resolvedName || prev.name),
          email: loggedInEmail,
          phoneNumber: isDifferentEmail ? resolvedPhone : (resolvedPhone || prev.phoneNumber),
          source: prev.source || resolvedSource,
          otherSource: prev.otherSource || resolvedOtherSource,
          reason: prev.reason || resolvedReason,
          extra: prev.extra || resolvedExtra,
          usePackageCredit: isDifferentEmail ? false : prev.usePackageCredit
        };
      });
    } else if (resolvedEmail || resolvedName || resolvedPhone || resolvedReason || resolvedSource) {
      setBookingData(prev => ({
        ...prev,
        name: prev.name || resolvedName,
        email: prev.email || resolvedEmail,
        phoneNumber: prev.phoneNumber || resolvedPhone,
        source: prev.source || resolvedSource,
        otherSource: prev.otherSource || resolvedOtherSource,
        reason: prev.reason || resolvedReason,
        extra: prev.extra || resolvedExtra,
      }));
    }

    // Also fetch fresh user profile with intakeProfile from backend if logged in
    if (token) {
      fetch(`${import.meta.env.VITE_API_URL}/api/users/profile`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      .then(res => res.ok ? res.json() : null)
      .then(prof => {
        if (prof && prof.email) {
          const profEmail = prof.email.trim().toLowerCase();
          if (prof.intakeProfile?.reason?.trim()) {
            setHasExistingSavedProfile(true);
          }
          setBookingData(prev => ({
            ...prev,
            name: prof.fullName || prof.name || prev.name,
            email: profEmail,
            phoneNumber: prof.phoneNumber || prev.phoneNumber,
            countryCode: prof.countryCode || prev.countryCode || '+91',
            source: prev.source || prof.intakeProfile?.source || '',
            otherSource: prev.otherSource || prof.intakeProfile?.otherSource || '',
            reason: prev.reason || prof.intakeProfile?.reason || '',
            extra: prev.extra || prof.intakeProfile?.extra || '',
          }));
        }
      })
      .catch(e => console.error('Failed to prefill intake profile in Booking:', e));
    }

    if (localUser) {
      const fs = Number(localUser.freeSessions || 0);
      setFreeSessionInfo({
        hasFreeSessions: fs > 0,
        freeSessions: fs,
        isCoursePurchaser: Boolean(localUser.courseSessionsGranted || localUser.isPurchased),
        courseUserName: localUser.fullName || localUser.name || ''
      });
    }

    if (openAuth === 'true' && !token) {
      setShowAuthModal(true);
    }
  }, []);

  // Dynamic Session Duration & Fees check (First Session = 60 mins, Returning = 90 mins)
  useEffect(() => {
    const checkSessionType = async () => {
      try {
        const token = localStorage.getItem('token');
        const headers = { 'Content-Type': 'application/json' };
        if (token) headers['Authorization'] = `Bearer ${token}`;

        const res = await fetch(`${import.meta.env.VITE_API_URL}/api/appointments/check-session-type`, {
          method: 'POST',
          headers,
          body: JSON.stringify({
            email: bookingData.email || '',
            phoneNumber: bookingData.phoneNumber || ''
          })
        });
        if (res.ok) {
          const data = await res.json();
          setFees({
            fee60min: data.fee60min || 5000,
            fee90min: data.fee90min || 7500
          });
          setBookingData(prev => ({
            ...prev,
            sessionDuration: data.duration,
            isFirstSession: data.isFirstSession
          }));
        }
      } catch (err) {
        console.error('Failed to check session type:', err);
      }
    };

    const timer = setTimeout(checkSessionType, 200);
    return () => clearTimeout(timer);
  }, [bookingData.email, bookingData.phoneNumber, isLoggedIn]);

  // Check free sessions ONLY when user is logged in
  useEffect(() => {
    const checkFreeSessions = async () => {
      const token = localStorage.getItem('token') || localStorage.getItem('courseToken');
      if (!token) {
        setFreeSessionInfo({ hasFreeSessions: false, freeSessions: 0, isCoursePurchaser: false, courseUserName: '' });
        return;
      }

      const email = bookingData.email?.trim();
      if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        setFreeSessionInfo({ hasFreeSessions: false, freeSessions: 0, isCoursePurchaser: false, courseUserName: '' });
        return;
      }
      try {
        const res = await fetch(`${import.meta.env.VITE_API_URL}/api/auth/check-free-sessions`, {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ email })
        });
        if (res.ok) {
          const data = await res.json();
          setFreeSessionInfo(data);
        }
      } catch (err) {
        console.error('Failed to check free sessions:', err);
      }
    };

    const debounce = setTimeout(checkFreeSessions, 300);
    return () => clearTimeout(debounce);
  }, [bookingData.email, isLoggedIn]);

  // Check available package credits for this client
  useEffect(() => {
    const checkPackageCredits = async () => {
      let email = bookingData.email?.trim();
      const token = localStorage.getItem('token') || localStorage.getItem('courseToken');

      if (!email) {
        try {
          const saved = localStorage.getItem('userInfo') || localStorage.getItem('user') || localStorage.getItem('courseUser');
          if (saved) {
            const parsed = JSON.parse(saved);
            email = (parsed.email || '').trim();
          }
        } catch {}
      }

      if (!email && !token) {
        setPackageCreditInfo({ hasCredits: false, totalCredits: 0, packages: [] });
        return;
      }

      try {
        const headers = {};
        if (token) headers['Authorization'] = `Bearer ${token}`;
        const query = email ? `?email=${encodeURIComponent(email)}` : '';
        const res = await fetch(`${import.meta.env.VITE_API_URL}/api/packages/credits${query}`, { headers });
        if (res.ok) {
          const data = await res.json();
          const total = Number(data.packageCredits ?? data.totalCredits ?? 0) || 0;
          const pkgs = data.packages || data.activePackages || [];
          setPackageCreditInfo({
            hasCredits: total > 0,
            totalCredits: total,
            packages: pkgs
          });

          // If client has available credits and hasn't explicitly chosen to book a package,
          // auto-apply the package credit for their session!
          if (total > 0) {
            setBookingData(prev => {
              if (prev.isPackage) return prev;
              return {
                ...prev,
                email: prev.email || email,
                usePackageCredit: prev.usePackageCredit !== false,
                packageId: prev.packageId || pkgs[0]?._id || pkgs[0]?.id
              };
            });
          } else {
            setBookingData(prev => ({
              ...prev,
              usePackageCredit: false
            }));
          }
        }
      } catch (err) {
        console.error('Failed to fetch package credits:', err);
      }
    };

    const debounce = setTimeout(checkPackageCredits, 150);
    return () => clearTimeout(debounce);
  }, [bookingData.email, isLoggedIn]);

  // Save to sessionStorage whenever step or bookingData changes
  useEffect(() => {
    if (bookingCompletedRef.current) {
      sessionStorage.removeItem('bookingStep');
      return;
    }
    sessionStorage.setItem('bookingStep', step.toString());
  }, [step]);

  useEffect(() => {
    if (bookingCompletedRef.current) {
      sessionStorage.removeItem('bookingData');
      return;
    }
    sessionStorage.setItem('bookingData', JSON.stringify(bookingData));
  }, [bookingData]);

  // Keep latest bookingData in ref for unmount/beforeunload cleanup
  const bookingDataRef = useRef(bookingData);
  useEffect(() => {
    bookingDataRef.current = bookingData;
  }, [bookingData]);

  // -------------------------------------------------------------
  // Slot Hold Lifecycle: Heartbeat while user is in booking flow
  // (Step 1, Step 2, Questionnaire Modal, or Step 3)
  // Keeps slot reserved and unavailable for any other user
  // -------------------------------------------------------------
  useEffect(() => {
    if (step > 3 || bookingCompletedRef.current) return;
    const currentData = bookingDataRef.current;

    const pingSlots = () => {
      const activeData = bookingDataRef.current;
      if (!activeData || bookingCompletedRef.current) return;
      if (activeData.time && activeData.dateKey) {
        heartbeatSlot({
          holderId: draftId,
          dateKey: activeData.dateKey,
          time: activeData.time
        });
      }
      if (activeData.isPackage && Array.isArray(activeData.packageSlots)) {
        activeData.packageSlots.forEach(slot => {
          if (slot?.dateKey && slot?.time) {
            heartbeatSlot({
              holderId: draftId,
              dateKey: slot.dateKey,
              time: slot.time
            });
          }
        });
      }
    };

    pingSlots();
    const interval = setInterval(pingSlots, 2 * 60 * 1000); // refresh hold every 2 minutes

    return () => clearInterval(interval);
  }, [bookingData.dateKey, bookingData.time, bookingData.packageSlots, draftId, step]);

  // -------------------------------------------------------------
  // Slot Hold Lifecycle: Release slot if user navigates away
  // or leaves the booking page without completing payment
  // -------------------------------------------------------------
  useEffect(() => {
    const handleBeforeUnload = () => {
      if (!bookingCompletedRef.current && draftId) {
        releaseSlotBeacon({ holderId: draftId });
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      if (!bookingCompletedRef.current && draftId) {
        releaseSlot({ holderId: draftId });
      }
    };
  }, [draftId]);

  // Always scroll to top when landing on the booking page or changing steps
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [step]);

  const handleAuthSuccess = (userData) => {
    setIsLoggedIn(true);
    setShowAuthModal(false);
    setBookingData((prev) => ({
      ...prev,
      name: userData.fullName || prev.name,
      email: userData.email || prev.email,
      phoneNumber: userData.phoneNumber || prev.phoneNumber,
      countryCode: userData.countryCode || prev.countryCode,
    }));
    if (userData.freeSessions !== undefined) {
      setFreeSessionInfo({
        hasFreeSessions: userData.freeSessions > 0,
        freeSessions: userData.freeSessions,
        isCoursePurchaser: !!userData.courseSessionsGranted,
        courseUserName: userData.fullName
      });
    }
  };

  const nextStep = () => setStep((s) => Math.min(s + 1, 4));
  const prevStep = () => {
    if (step === 1) {
      if (window.history.length > 1) {
        navigate(-1);
      } else {
        navigate('/');
      }
    } else {
      setStep((s) => Math.max(s - 1, 1));
    }
  };
  
  const updateData = (newData) => {
    setBookingData((prev) => ({ ...prev, ...newData }));
  };

  const handleAutoLoginOnBooking = (data) => {
    if (!data) return;
    const currentToken = localStorage.getItem('token');
    if (!currentToken && data.token) {
      localStorage.setItem('token', data.token);
      if (data.courseToken) {
        localStorage.setItem('courseToken', data.courseToken);
      }
      if (data.userInfo) {
        localStorage.setItem('userInfo', JSON.stringify(data.userInfo));
      }
      if (data.courseUser) {
        localStorage.setItem('courseUser', JSON.stringify(data.courseUser));
      }
      window.dispatchEvent(new Event('auth-change'));
    }
  };

  const submitBooking = async (couponInfo = null) => {
    setIsLoading(true);
    setError('');
    try {
      const token = localStorage.getItem('token');
      const authHeaders = { 'Content-Type': 'application/json' };
      if (token) {
        authHeaders['Authorization'] = `Bearer ${token}`;
      }

      const finalSource = bookingData.source === 'other'
        ? (bookingData.otherSource?.trim() ? `Other: ${bookingData.otherSource.trim()}` : 'Other')
        : bookingData.source;

      const questionnairePayload = buildResponseContractPayload(questionnaireDraft, draftId);

      const payloadData = {
        ...bookingData,
        source: finalSource,
        questionnaire_id: questionnairePayload.questionnaire_id,
        content_version: questionnairePayload.content_version,
        booking_draft_id: questionnairePayload.booking_draft_id || draftId,
        holderId: draftId,
        questionnaire_opened: questionnairePayload.opened,
        questionnaire_responses: questionnairePayload.responses,
        questionnaireAnswers: questionnairePayload
      };

      // Check whether user is buying a new multi-session package online
      const isBuyingPackage = Boolean(bookingData.isPackage && Array.isArray(bookingData.packageSlots) && bookingData.packageSlots.length > 0);

      // Determine effective payment method for single sessions
      const hasPkgCredits = Boolean(packageCreditInfo?.hasCredits && packageCreditInfo.totalCredits > 0);
      const hasCourseCredits = Boolean(freeSessionInfo?.hasFreeSessions && freeSessionInfo.freeSessions > 0);

      const chosenMethod = isBuyingPackage 
        ? 'pay_online' 
        : (paymentMethodChoice || (
            hasPkgCredits ? 'package_credit' :
            hasCourseCredits ? 'course_free_credit' :
            'pay_online'
          ));

      // --- Case 1: Package Credit Zero-Payment Checkout ---
      if (chosenMethod === 'package_credit' && (hasPkgCredits || bookingData.packageId)) {
        const creditRes = await fetch(`${import.meta.env.VITE_API_URL}/api/packages/book-credit-session`, {
          method: 'POST',
          headers: authHeaders,
          body: JSON.stringify({
            packageId: bookingData.packageId || (packageCreditInfo.packages?.[0]?._id),
            date: bookingData.date,
            time: bookingData.time,
            name: bookingData.name,
            email: bookingData.email,
            countryCode: bookingData.countryCode || '+91',
            phoneNumber: bookingData.phoneNumber,
            source: finalSource,
            reason: bookingData.reason || '',
            extra: bookingData.extra || '',
            questionnaireAnswers: questionnairePayload,
            bookingDraftId: draftId
          })
        });

        if (!creditRes.ok) {
          const errData = await creditRes.json().catch(() => ({}));
          if (creditRes.status === 409 || errData.message?.toLowerCase().includes('slot') || errData.message?.toLowerCase().includes('available')) {
            setError(errData.message || 'This time slot was just booked or is no longer available. Please select another time.');
            setStep(1);
            setIsLoading(false);
            return;
          }
          throw new Error(errData.message || 'Failed to book session with package credit');
        }

        bookingCompletedRef.current = true;
        const creditData = await creditRes.json();
        handleAutoLoginOnBooking(creditData);

        const confirmedCreditData = {
          ...bookingData,
          appointmentId: creditData.appointment?._id,
          isPackageCredit: true,
          packageId: creditData.package?._id,
          sessionNumber: creditData.appointment?.sessionNumber,
          totalSessionsInPackage: creditData.appointment?.totalSessionsInPackage,
          creditsRemaining: creditData.creditsRemaining,
          meetLink: creditData.appointment?.meetLink,
          date: creditData.appointment?.date || bookingData.date,
          time: creditData.appointment?.time || bookingData.time
        };

        setSuccessBookingData(confirmedCreditData);
        setPackageCreditInfo(prev => ({
          ...prev,
          totalCredits: creditData.creditsRemaining ?? Math.max(0, prev.totalCredits - 1),
          hasCredits: (creditData.creditsRemaining ?? Math.max(0, prev.totalCredits - 1)) > 0
        }));

        setBookingData(prev => ({
          ...prev,
          date: null,
          dateKey: null,
          time: null,
          usePackageCredit: false,
          bookingMode: 'single'
        }));

        clearQuestionnaireDraft(draftId);
        sessionStorage.removeItem('bwa_booking_draft_id');
        sessionStorage.removeItem('bookingStep');
        sessionStorage.removeItem('bookingData');
        setQuestionnaireDraft({
          booking_draft_id: `bwa_draft_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`,
          questionnaire_id: config.questionnaire_id || 'bwa_optional_coaching',
          content_version: config.content_version || '2026-10-16-v1',
          opened: false,
          last_screen: 'intro',
          answers: {}
        });
        setIsLoading(false);
        nextStep();
        return;
      }

      // --- Case 2: Course Free Session Zero-Payment Checkout ---
      if (chosenMethod === 'course_free_credit' && (hasCourseCredits || freeSessionInfo.hasFreeSessions)) {
        const freeRes = await fetch(`${import.meta.env.VITE_API_URL}/api/appointments`, {
          method: 'POST',
          headers: authHeaders,
          body: JSON.stringify({
            ...payloadData,
            useFreeSession: true
          }),
        });

        if (!freeRes.ok) {
          const errData = await freeRes.json().catch(() => ({}));
          // Handle slot expiry or collision: return to Step 1 without discarding details or answers
          if (freeRes.status === 409 || errData.message?.toLowerCase().includes('slot') || errData.message?.toLowerCase().includes('available')) {
            setError(errData.message || 'This time slot was just booked or is no longer available. Please select another time.');
            setStep(1);
            setIsLoading(false);
            return;
          }
          throw new Error(errData.message || 'Failed to book complimentary coaching session');
        }

        bookingCompletedRef.current = true;
        const freeData = await freeRes.json();
        handleAutoLoginOnBooking(freeData);
        updateData({ 
          appointmentId: freeData._id,
          isFreeSession: true,
          freeSessionsRemaining: freeData.freeSessionsRemaining
        });
        setFreeSessionInfo(prev => ({
          ...prev,
          freeSessions: freeData.freeSessionsRemaining,
          hasFreeSessions: freeData.freeSessionsRemaining > 0
        }));

        clearQuestionnaireDraft(draftId);
        sessionStorage.removeItem('bwa_booking_draft_id');
        sessionStorage.removeItem('bookingStep');
        sessionStorage.removeItem('bookingData');
        setQuestionnaireDraft({
          booking_draft_id: `bwa_draft_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`,
          questionnaire_id: config.questionnaire_id || 'bwa_optional_coaching',
          content_version: config.content_version || '2026-10-16-v1',
          opened: false,
          last_screen: 'intro',
          answers: {}
        });
        setIsLoading(false);
        nextStep();
        return;
      }

      // --- Standard Paid Flow via Razorpay ---

      // 1. Load Razorpay script dynamically
      const scriptLoaded = await new Promise((resolve) => {
        const script = document.createElement('script');
        script.src = 'https://checkout.razorpay.com/v1/checkout.js';
        script.onload = () => resolve(true);
        script.onerror = () => resolve(false);
        document.body.appendChild(script);
      });

      if (!scriptLoaded) {
        throw new Error('Razorpay SDK failed to load. Are you online?');
      }

      // 2. Fetch Razorpay public key
      const keyRes = await fetch(`${import.meta.env.VITE_API_URL}/api/payment/public-key`);
      const keyData = await keyRes.json();
      if (!keyRes.ok || !keyData.keyId) {
        throw new Error('Payment gateway not configured.');
      }

      // --- Package Booking Flow via Razorpay ---
      if (bookingData.isPackage && Array.isArray(bookingData.packageSlots) && bookingData.packageSlots.length > 0) {
        const orderRes = await fetch(`${import.meta.env.VITE_API_URL}/api/packages/create-order`, {
          method: 'POST',
          headers: authHeaders,
          body: JSON.stringify({
            email: bookingData.email,
            phoneNumber: bookingData.phoneNumber,
            countryCode: bookingData.countryCode || '+91',
            totalSessions: bookingData.totalSessions || bookingData.packageSlots.length,
            sessionDuration: 90,
            sessions: bookingData.packageSlots,
            couponCode: couponInfo?.code || '',
            holderId: draftId
          })
        });

        const orderData = await orderRes.json();
        if (!orderRes.ok) {
          if (orderRes.status === 409 || orderData.conflict) {
            setError(orderData.message || 'One of the selected slots was just booked. Please pick another time.');
            setStep(1);
            setIsLoading(false);
            return;
          }
          throw new Error(orderData.message || 'Failed to create package order');
        }

        const options = {
          key: keyData.keyId,
          amount: orderData.amount,
          currency: orderData.currency,
          name: 'Better With Aarkesh',
          description: `${bookingData.totalSessions || bookingData.packageSlots.length}-Session Coaching Package`,
          order_id: orderData.id,
          handler: async function (response) {
            try {
              const finalRes = await fetch(`${import.meta.env.VITE_API_URL}/api/packages/finalize`, {
                method: 'POST',
                headers: authHeaders,
                body: JSON.stringify({
                  orderId: orderData.id,
                  paymentId: response.razorpay_payment_id,
                  signature: response.razorpay_signature,
                  clientName: bookingData.name,
                  clientEmail: bookingData.email,
                  countryCode: bookingData.countryCode,
                  phoneNumber: bookingData.phoneNumber,
                  totalSessions: bookingData.totalSessions || bookingData.packageSlots.length,
                  sessionDuration: 90,
                  sessions: bookingData.packageSlots,
                  source: finalSource,
                  reason: bookingData.reason || '',
                  extra: bookingData.extra || '',
                  questionnaireAnswers: questionnairePayload,
                  bookingDraftId: draftId,
                  couponCode: couponInfo?.code || ''
                })
              });

              if (finalRes.ok) {
                bookingCompletedRef.current = true;
                const finalData = await finalRes.json();
                handleAutoLoginOnBooking(finalData);
                const confirmedPackageData = {
                  ...bookingData,
                  packageId: finalData.package?._id,
                  isPackage: true,
                  totalSessions: finalData.package?.totalSessions || bookingData.totalSessions,
                  creditsRemaining: finalData.package?.creditsRemaining ?? Math.max(0, (finalData.package?.totalSessions || bookingData.totalSessions || 1) - 1),
                  bookedSessionsCount: finalData.package?.bookedSessionsCount || 1,
                  paidAmount: finalData.package?.totalAmount,
                  pricePerSession: finalData.package?.pricePerSession,
                  couponCode: finalData.package?.couponCode || couponInfo?.code || '',
                  discountAmount: finalData.package?.discountAmount || 0,
                  orderId: finalData.package?.orderId || orderData.id,
                  paymentId: response.razorpay_payment_id,
                  appointments: finalData.appointments || [],
                  packageSlots: (finalData.appointments && finalData.appointments.length > 0)
                    ? finalData.appointments.map(a => ({
                        date: a.date,
                        time: a.time,
                        meetLink: a.meetLink,
                        sessionNumber: a.sessionNumber
                      }))
                    : (bookingData.packageSlots || [])
                };
                setSuccessBookingData(confirmedPackageData);
                setBookingData(prev => ({
                  ...prev,
                  date: null,
                  dateKey: null,
                  time: null,
                  bookingMode: 'single',
                  isPackage: false,
                  totalSessions: 1,
                  packageSlots: []
                }));
                clearQuestionnaireDraft(draftId);
                sessionStorage.removeItem('bwa_booking_draft_id');
                sessionStorage.removeItem('bookingStep');
                sessionStorage.removeItem('bookingData');
                setQuestionnaireDraft({
                  booking_draft_id: `bwa_draft_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`,
                  questionnaire_id: config.questionnaire_id || 'bwa_optional_coaching',
                  content_version: config.content_version || '2026-10-16-v1',
                  opened: false,
                  last_screen: 'intro',
                  answers: {}
                });
                setIsLoading(false);
                nextStep();
              } else {
                const data = await finalRes.json();
                setError(data.message || 'Failed to finalize package booking');
                setIsLoading(false);
              }
            } catch (err) {
              console.error('Package finalization error:', err);
              setError('Error confirming package booking.');
              setIsLoading(false);
            }
          },
          prefill: {
            name: bookingData.name,
            email: bookingData.email,
          },
          theme: {
            color: '#c79c6e'
          },
          modal: {
            ondismiss: function() {
              setStep(5);
              setIsLoading(false);
            }
          }
        };

        const rzp = new window.Razorpay(options);
        rzp.on('payment.failed', function () {
          setError('Payment failed or was cancelled.');
          setStep(5);
          setIsLoading(false);
        });
        rzp.open();
        return;
      }

      // 3. Create an order (passing optional couponCode and slot info)
      const orderRes = await fetch(`${import.meta.env.VITE_API_URL}/api/payment/create-order`, {
        method: 'POST',
        headers: authHeaders,
        body: JSON.stringify({ 
          email: bookingData.email,
          phoneNumber: bookingData.phoneNumber,
          sessionDuration: bookingData.sessionDuration || 60,
          currency: 'INR',
          couponCode: couponInfo?.code || '',
          date: bookingData.date,
          time: bookingData.time,
          duration: bookingData.sessionDuration || 60,
          booking_draft_id: draftId,
          holderId: draftId
        })
      });
      const orderData = await orderRes.json().catch(() => ({}));
      
      if (!orderRes.ok) {
        const msg = orderData.message || '';
        setError(msg || 'Yeh time slot already book ho chuka hai ya available nahi hai. Kripya koi aur date ya time chune.');
        setIsLoading(false);
        return;
      }

      const chargedAmountInRupees = orderData.amount ? orderData.amount / 100 : (orderData.amountRupees || currentFee);
      const finalDuration = orderData.targetDuration || bookingData.sessionDuration || (orderData.isFirstSession ? 60 : 90);

      // 4. Create the appointment as Pending
      const initAppRes = await fetch(`${import.meta.env.VITE_API_URL}/api/appointments`, {
        method: 'POST',
        headers: authHeaders,
        body: JSON.stringify({
          ...payloadData,
          orderId: orderData.id,
          amount: chargedAmountInRupees,
          originalAmount: orderData.originalAmount || currentFee,
          couponCode: orderData.couponCode || couponInfo?.code || '',
          discountAmount: orderData.discountAmount || couponInfo?.discountAmount || 0,
          duration: finalDuration,
          isFirstSession: orderData.isFirstSession ?? bookingData.isFirstSession,
          booking_draft_id: draftId,
          holderId: draftId
        }),
      });
      const initAppData = await initAppRes.json().catch(() => ({}));

      if (!initAppRes.ok) {
        const msg = initAppData.message || '';
        setError(msg || 'Yeh time slot already book ho chuka hai ya available nahi hai. Kripya koi aur date ya time chune.');
        setIsLoading(false);
        return;
      }
      const appointmentId = initAppData._id;

      // Helper to record failed/abandoned appointments
      const recordFailedAppointment = async () => {
        try {
          await fetch(`${import.meta.env.VITE_API_URL}/api/appointments/${appointmentId}/fail`, {
            method: 'PUT',
            headers: authHeaders
          });
        } catch (err) {
          console.error('Failed to mark appointment as failed:', err);
        }
      };

      // 5. Initialize Razorpay popup
      const options = {
        key: keyData.keyId,
        amount: orderData.amount,
        currency: orderData.currency,
        name: 'Better With Aarkesh',
        description: 'Life Coaching Session',
        order_id: orderData.id,
        handler: async function (response) {
          // 6. On success, finalize the appointment in the backend
          try {
            const finalRes = await fetch(`${import.meta.env.VITE_API_URL}/api/appointments/${appointmentId}/finalize`, {
              method: 'PUT',
              headers: authHeaders,
              body: JSON.stringify({
                paymentId: response.razorpay_payment_id,
                signature: response.razorpay_signature
              }),
            });

            if (finalRes.ok) {
              bookingCompletedRef.current = true;
              const finalData = await finalRes.json();
              handleAutoLoginOnBooking(finalData);
              updateData({ 
                appointmentId, 
                paidAmount: chargedAmountInRupees 
              });
              clearQuestionnaireDraft(draftId);
              sessionStorage.removeItem('bwa_booking_draft_id');
              sessionStorage.removeItem('bookingStep');
              sessionStorage.removeItem('bookingData');
              setQuestionnaireDraft({
                booking_draft_id: `bwa_draft_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`,
                questionnaire_id: config.questionnaire_id || 'bwa_optional_coaching',
                content_version: config.content_version || '2026-10-16-v1',
                opened: false,
                last_screen: 'intro',
                answers: {}
              });
              nextStep();
            } else {
              const data = await finalRes.json();
              setError(data.message || 'Failed to finalize appointment booking');
            }
          } catch (err) {
            console.error('Finalization error:', err);
            setError('Error confirming appointment.');
          } finally {
            setIsLoading(false);
          }
        },
        prefill: {
          name: bookingData.name,
          email: bookingData.email,
        },
        theme: {
          color: '#c79c6e'
        },
        modal: {
          ondismiss: function() {
            recordFailedAppointment();
            setStep(5);
            setIsLoading(false);
          }
        }
      };

      const rzp = new window.Razorpay(options);
      rzp.on('payment.failed', function (response){
        recordFailedAppointment();
        setError('Payment failed or was cancelled.');
        setStep(5);
        setIsLoading(false);
      });
      rzp.open();

    } catch (err) {
      console.error(err);
      setError(err.message || 'Network error');
      setIsLoading(false);
    }
  };

  // Calculate dynamic fee for display
  const currentFee = bookingData.sessionDuration === 90 ? fees.fee90min : fees.fee60min;

  // Step 4 is the success screen
  if (step === 4) {
    return <BookingSuccess data={successBookingData || bookingData} fee={currentFee} settings={bookingSettings.success} generalSettings={bookingSettings.general} />;
  }

  // Step 5 is the cancelled screen
  if (step === 5) {
    return <BookingCancelled data={bookingData} onRetry={() => setStep(3)} />;
  }

  return (
    <div className="flex-grow w-full relative flex flex-col pt-28 md:pt-36 lg:pt-40 pb-12 md:pb-16 bg-[#f5f1e8] text-[#111010]">
      
      {/* Background Image Layer with Warm Lamp Atmosphere */}
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
        <img 
          src={bookingSettings.general.bgImageUrl || bookingBg} 
          alt="Warm desk lamp coaching atmosphere" 
          className="w-full h-full object-cover object-left md:object-left-top opacity-85 transition-opacity duration-700"
        />
        {/* Soft edge washes to blend seamlessly with theme while keeping lamp crystal clear */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[#f5f1e8]/20 to-[#f5f1e8]/70" />
        <div className="absolute inset-0 bg-gradient-to-b from-[#f5f1e8]/30 via-transparent to-[#f5f1e8]/60" />
      </div>

      <div className={`relative z-10 px-3 sm:px-6 md:px-8 w-full ${step === 1 && (bookingData.bookingMode === 'package' || bookingData.isPackage) ? 'max-w-7xl' : (step === 3 ? 'max-w-6xl' : 'max-w-5xl')} mx-auto transition-all duration-300`}>
        
        {/* Top Left Back Button */}
        {step <= 3 && (
          <div className="flex w-full mb-4">
            <button 
              onClick={prevStep}
              className="flex items-center gap-2 font-sans text-[0.68rem] uppercase tracking-widest text-[#7a756b] hover:text-[#c9542f] transition-colors cursor-pointer font-semibold"
            >
              <ArrowLeft className="text-base" />
              BACK
            </button>
          </div>
        )}

        {/* Unified Free Session Credits Active Banner */}
        {((packageCreditInfo?.hasCredits && packageCreditInfo.totalCredits > 0) || (isLoggedIn && freeSessionInfo?.hasFreeSessions && freeSessionInfo.freeSessions > 0)) && (
          <div className="mb-6 sm:mb-8 p-4 sm:p-5 rounded-2xl border border-[#a5d6a7] bg-[#f0f9f1] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3.5 sm:gap-4 shadow-xs">
            <div className="flex items-start sm:items-center gap-3 sm:gap-3.5 w-full sm:w-auto">
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-white border border-[#a5d6a7] flex items-center justify-center text-[#2e7d32] shrink-0 mt-0.5 sm:mt-0 shadow-xs">
                <Sparkle size={18} weight="fill" className="sm:w-5 sm:h-5 text-[#2e7d32]" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-[#1b5e20] text-xs sm:text-sm font-bold">
                    Free Session Credits Available
                  </span>
                  {packageCreditInfo?.hasCredits && packageCreditInfo.totalCredits > 0 && (
                    <span className="px-2.5 py-0.5 rounded-full bg-white border border-[#81c784] text-[#1b5e20] text-[0.62rem] sm:text-[0.68rem] font-bold uppercase tracking-wider">
                      🎟️ {packageCreditInfo.totalCredits} Package Credit{packageCreditInfo.totalCredits > 1 ? 's' : ''}
                    </span>
                  )}
                  {freeSessionInfo?.hasFreeSessions && freeSessionInfo.freeSessions > 0 && (
                    <span className="px-2.5 py-0.5 rounded-full bg-[#fbf0eb] border border-[#e8c4e2] text-[#c9542f] text-[0.62rem] sm:text-[0.68rem] font-bold uppercase tracking-wider">
                      🎓 {freeSessionInfo.freeSessions} Course Free Credit{freeSessionInfo.freeSessions > 1 ? 's' : ''}
                    </span>
                  )}
                </div>
                <p className="text-[#2e7d32] text-[0.72rem] sm:text-xs font-normal mt-1 break-words">
                  Account: <span className="text-[#111010] font-semibold">{bookingData.email || 'Client'}</span> • You can choose to redeem your credits (₹0) or pay online at the confirmation step.
                </p>
              </div>
            </div>
            <div className="w-full sm:w-auto shrink-0 flex items-center justify-center sm:justify-end">
              <span className="w-full sm:w-auto text-center font-bold text-xs tracking-wider uppercase px-3.5 py-2 rounded-xl border border-[#2e7d32] bg-[#2e7d32] text-white shadow-xs">
                ₹0 Credit Eligible
              </span>
            </div>
          </div>
        )}

        {/* Header section based on step */}
        <div className="text-center mb-6 sm:mb-8">
          <span className="font-sans text-[0.65rem] uppercase tracking-[0.25em] font-bold text-[#c9542f] block mb-2">
            {step === 1 && (bookingSettings.step1.chapterTag || 'CHAPTER 1 OF 3')}
            {step === 2 && (bookingSettings.step2.chapterTag || 'CHAPTER 2 OF 3')}
            {step === 3 && (bookingSettings.step3.chapterTag || 'CHAPTER 3 OF 3')}
          </span>
          <h1 className="font-serif text-3xl sm:text-4xl md:text-5xl font-normal tracking-tight leading-[1.15] text-[#111010] mb-3 sm:mb-4">
            {step === 1 && (bookingSettings.step1.title || "Let's Find a Time That Works")}
            {step === 2 && (bookingSettings.step2.title || "A Little About You")}
            {step === 3 && (bookingSettings.step3.title || "Confirm & Secure Your Session")}
          </h1>
          <div className="h-[2px] w-10 bg-[#c9542f] mx-auto mb-3 sm:mb-4 rounded-full" />
          <p className="text-[#555047] text-sm sm:text-[0.95rem] font-light leading-relaxed max-w-lg mx-auto px-2">
            {step === 1 && (
              <>
                {bookingSettings.step1.subtitleLine1 || "You don't need to have everything figured out before you begin."}
                {bookingSettings.step1.subtitleLine2 && (
                  <>
                    <br className="hidden md:block" />
                    {" "}{bookingSettings.step1.subtitleLine2}
                  </>
                )}
              </>
            )}
            {step === 2 && (
              hasExistingSavedProfile ? (
                "Everything we need is in. Use Edit if something changes."
              ) : (
                <>
                  {bookingSettings.step2.subtitleLine1 || "This helps me understand you better before we meet."}
                  {bookingSettings.step2.subtitleLine2 && (
                    <>
                      <br className="hidden md:block" />
                      {" "}{bookingSettings.step2.subtitleLine2}
                    </>
                  )}
                </>
              )
            )}
            {step === 3 && (
              <>
                {bookingSettings.step3.subtitleLine1 || "Almost there. Review your session details"}
                {bookingSettings.step3.subtitleLine2 && (
                  <>
                    <br className="hidden md:block" />
                    {" "}{bookingSettings.step3.subtitleLine2}
                  </>
                )}
              </>
            )}
          </p>
        </div>

        {/* Main Booking Card */}
        <div className={`bg-[#f5f1e8]/95 backdrop-blur-xl border border-black/8 rounded-2xl sm:rounded-3xl relative shadow-[0_10px_35px_rgba(0,0,0,0.04)] ${step === 3 ? 'overflow-visible' : 'overflow-hidden'}`}>
          
          {/* Subtle top warm glow */}
          <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-[#c9542f]/40 to-transparent" />
          
          <div className={`p-4 sm:p-6 ${step === 3 ? 'md:p-7 lg:p-8' : 'md:p-10'}`}>
            <BookingStepper currentStep={step} />

            <div className="mt-8">
              {step === 1 && (
                <Step1Time 
                  data={bookingData} 
                  updateData={updateData} 
                  onNext={nextStep} 
                  onBack={prevStep}
                  freeSessionInfo={freeSessionInfo}
                  packageCreditInfo={packageCreditInfo}
                  settings={bookingSettings.step1}
                  draftId={draftId}
                  fees={fees}
                />
              )}
              {step === 2 && (
                <Step2Details 
                  data={bookingData} 
                  updateData={updateData} 
                  onNext={nextStep} 
                  onBack={prevStep}
                  isAuthenticated={!!localStorage.getItem('token') || isLoggedIn}
                  hasExistingSavedProfile={hasExistingSavedProfile}
                  onProfileSaved={() => setHasExistingSavedProfile(true)}
                  freeSessionInfo={freeSessionInfo}
                  settings={bookingSettings.step2}
                  questionnaireDraft={questionnaireDraft}
                  draftId={draftId}
                  onUpdateDraft={setQuestionnaireDraft}
                  onOpenLogin={(phone, email) => {
                    setAuthMode('login');
                    if (phone) setAuthDefaultPhone(phone);
                    if (email) setAuthDefaultEmail(email);
                    setShowAuthModal(true);
                  }}
                />
              )}
              {step === 3 && (
                <Step3Confirm 
                  data={bookingData} 
                  fee={currentFee}
                  freeSessionInfo={freeSessionInfo}
                  packageCreditInfo={packageCreditInfo}
                  onApplyPackageCredit={() => {
                    setBookingData(prev => ({
                      ...prev,
                      usePackageCredit: true,
                      isPackage: false,
                      packageId: prev.packageId || packageCreditInfo.packages?.[0]?._id || packageCreditInfo.packages?.[0]?.id
                    }));
                  }}
                  onNext={submitBooking} 
                  onBack={prevStep} 
                  onChangeTime={() => {
                    setError('');
                    setStep(1);
                  }}
                  isLoading={isLoading}
                  error={error}
                  settings={bookingSettings.step3}
                />
              )}
            </div>
          </div>
        </div>

        {/* Footer Note */}
        <div className="mt-6 sm:mt-8 flex items-center justify-center gap-2 text-center px-4 max-w-md mx-auto">
          <svg width="14" height="16" viewBox="0 0 14 16" fill="none" xmlns="http://www.w3.org/2000/svg" className="shrink-0 text-[#c9542f]">
            <path d="M11.6667 7.33333H2.33333C1.59695 7.33333 1 7.93029 1 8.66667V13.3333C1 14.0697 1.59695 14.6667 2.33333 14.6667H11.6667C12.403 14.6667 13 14.0697 13 13.3333V8.66667C13 7.93029 12.403 7.33333 11.6667 7.33333Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M4.3335 7.33333V4.66667C4.3335 3.95942 4.61445 3.28115 5.11455 2.78105C5.61465 2.28095 6.29292 2 7.00016 2C7.70741 2 8.38568 2.28095 8.88578 2.78105C9.38588 3.28115 9.66683 3.95942 9.66683 4.66667V7.33333" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          <div className="text-left font-sans text-xs leading-snug">
            <span className="text-[#555047] font-medium block">
              {bookingSettings.general.privacyNoteLine1 || 'Your information is private and only visible to me.'}
            </span>
            {bookingSettings.general.privacyNoteLine2 && (
              <span className="text-[#7a756b] block text-[0.7rem] sm:text-xs">
                {bookingSettings.general.privacyNoteLine2}
              </span>
            )}
          </div>
        </div>

      </div>

      <LoginModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        onSuccess={handleAuthSuccess}
        defaultMode={authMode}
        defaultEmail={authDefaultEmail}
        defaultFullName={authDefaultName}
        defaultPhoneNumber={authDefaultPhone}
        courseNotice={true}
      />
    </div>
  );
}
