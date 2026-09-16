import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import PolicyModal from '../../components/ui/PolicyModal';
import { 
  Play, 
  CheckCircle, 
  LockKey, 
  CaretDown, 
  Clock, 
  X, 
  User, 
  Eye, 
  EyeSlash, 
  SignOut, 
  ArrowLeft, 
  ArrowRight, 
  Envelope, 
  Phone, 
  CaretLeft, 
  Sparkle,
  BookOpen,
  Users,
  Infinity,
  UsersThree,
  ShieldCheck,
  Lightning,
  PencilSimple,
  Info,
  FileText,
  ChatCenteredDots,
  Brain,
  Star,
  InstagramLogo,
  LinkedinLogo,
  XLogo,
  YoutubeLogo,
  FacebookLogo,
  SpotifyLogo,
  DiscordLogo,
  TiktokLogo,
  Globe
} from '@phosphor-icons/react';
import Button from '../../components/ui/Button';
import LessonComments from '../../components/course/LessonComments';
import ProtectedYouTubePlayer from '../../components/course/ProtectedYouTubePlayer';
import CoursePaymentSuccess from './CoursePaymentSuccess';

const renderSocialIcon = (platform, size = 16) => {
  switch (platform?.toLowerCase()) {
    case 'instagram': return <InstagramLogo size={size} />;
    case 'youtube': return <YoutubeLogo size={size} />;
    case 'x': case 'twitter': return <XLogo size={size} />;
    case 'linkedin': return <LinkedinLogo size={size} />;
    case 'facebook': return <FacebookLogo size={size} />;
    case 'spotify': return <SpotifyLogo size={size} />;
    case 'discord': return <DiscordLogo size={size} />;
    case 'tiktok': return <TiktokLogo size={size} />;
    default: return <Globe size={size} />;
  }
};

const extractYoutubeVideoId = (url) => {
  if (!url) return '';
  const trimmed = url.trim();
  if (/^[a-zA-Z0-9_-]{11}$/.test(trimmed)) {
    return trimmed;
  }
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
  const match = trimmed.match(regExp);
  return (match && match[2].length === 11) ? match[2] : '';
};

// Dummy course data
const MODULES = [
  {
    id: 1,
    title: 'Module 1: The Foundation of Presence',
    duration: '45 mins',
    progress: 100,
    lessons: [
      { id: 101, title: 'Introduction to Inner Stillness', duration: '12:30', isCompleted: true, isLocked: false },
      { id: 102, title: 'Breaking the Reactive Cycle', duration: '18:15', isCompleted: true, isLocked: false },
      { id: 103, title: 'Guided Grounding Meditation', duration: '15:00', isCompleted: false, isLocked: false },
    ]
  },
  {
    id: 2,
    title: 'Module 2: Mastering Conversations',
    duration: '1h 15m',
    progress: 0,
    lessons: [
      { id: 201, title: 'The Art of Active Listening', duration: '22:10', isCompleted: false, isLocked: true },
      { id: 202, title: 'Reading Non-Verbal Cues', duration: '28:45', isCompleted: false, isLocked: true },
      { id: 203, title: 'Expressing Authentic Boundaries', duration: '24:20', isCompleted: false, isLocked: true },
    ]
  },
  {
    id: 3,
    title: 'Module 3: Leadership & Magnetism',
    duration: '1h 30m',
    progress: 0,
    lessons: [
      { id: 301, title: 'Cultivating Charisma', duration: '30:00', isCompleted: false, isLocked: true },
      { id: 302, title: 'Leading with Vulnerability', duration: '25:15', isCompleted: false, isLocked: true },
      { id: 303, title: 'The Ripple Effect', duration: '35:45', isCompleted: false, isLocked: true },
    ]
  }
];

export default function Course() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [showPricingModal, setShowPricingModal] = useState(false);
  const [showDashboard, setShowDashboard] = useState(() => {
    const isPurchasedStored = localStorage.getItem('isCoursePurchased') === 'true';
    const hasToken = !!localStorage.getItem('courseToken');
    const params = new URLSearchParams(window.location.search);
    const isCheckout = params.get('checkout') === 'true' || sessionStorage.getItem('course_checkout_active') === 'true';
    return hasToken && isPurchasedStored && !isCheckout;
  });
  const [isLoggedIn, setIsLoggedIn] = useState(() => !!localStorage.getItem('courseToken'));
  const [isPurchased, setIsPurchased] = useState(() => localStorage.getItem('isCoursePurchased') === 'true');
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showCheckout, setShowCheckout] = useState(() => {
    const params = new URLSearchParams(window.location.search);
    const hasToken = !!localStorage.getItem('courseToken');
    const isPurchasedStored = localStorage.getItem('isCoursePurchased') === 'true';
    const isCheckoutStored = sessionStorage.getItem('course_checkout_active') === 'true';
    return (params.get('checkout') === 'true' || isCheckoutStored) && hasToken && !isPurchasedStored;
  });
  const [checkoutAgreed, setCheckoutAgreed] = useState(false);
  const [showPreRegSuccessModal, setShowPreRegSuccessModal] = useState(false);
  const profileMenuRef = useRef(null);
  const leftColumnRef = useRef(null);

  // Auth Modal State
  const [showCourseLogin, setShowCourseLogin] = useState(false);
  const [loginMode, setLoginMode] = useState('login');

  // Auth Form State
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // OTP & Forgot Password State
  const [isOtpStep, setIsOtpStep] = useState(false);
  const [otpValues, setOtpValues] = useState(['', '', '', '']);
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [isForgotOtpStep, setIsForgotOtpStep] = useState(false);

  const otpRef0 = useRef(null);
  const otpRef1 = useRef(null);
  const otpRef2 = useRef(null);
  const otpRef3 = useRef(null);
  const otpRefs = [otpRef0, otpRef1, otpRef2, otpRef3];

  const navigate = useNavigate();
  const [curriculumModules, setCurriculumModules] = useState(MODULES);
  const [activeModuleObj, setActiveModuleObj] = useState(MODULES[0]);
  const [activeLesson, setActiveLesson] = useState(MODULES[0]?.lessons?.[0] || null);
  const [activeModule, setActiveModule] = useState(MODULES[0].id);
  const [courseDocuments, setCourseDocuments] = useState([]);
  const [socialLinks, setSocialLinks] = useState([]);
  const [activePolicySlug, setActivePolicySlug] = useState(null);
  const [courseData, setCourseData] = useState(null);
  const [activeMobileTab, setActiveMobileTab] = useState('playlist'); // 'playlist' | 'overview' | 'resources' | 'comments'
  const [landscapeView, setLandscapeView] = useState('list'); // 'list' | 'player'
  const [purchaseSuccessData, setPurchaseSuccessData] = useState(null);

  const allLessons = curriculumModules.flatMap((m) => (m.lessons || []).map((l) => ({ ...l, module: m })));
  const currentLessonIndex = allLessons.findIndex(
    (l) => (l._id || l.id)?.toString() === (activeLesson?._id || activeLesson?.id)?.toString()
  );
  const prevLesson = currentLessonIndex > 0 ? allLessons[currentLessonIndex - 1] : null;
  const nextLesson = currentLessonIndex >= 0 && currentLessonIndex < allLessons.length - 1 ? allLessons[currentLessonIndex + 1] : null;

  const handleSelectLesson = (lesson, module) => {
    setActiveLesson(lesson);
    if (module) setActiveModuleObj(module);
    localStorage.setItem('lastActiveCourseLessonId', (lesson._id || lesson.id)?.toString());
  };

  const isComingSoon = Boolean(courseData?.isComingSoon);
  const basePrice = courseData?.price !== undefined && courseData?.price !== null ? Number(courseData.price) : 15000;
  const comparePrice = courseData?.comparePrice !== undefined && courseData?.comparePrice !== null ? Number(courseData.comparePrice) : 25000;
  const gstRate = courseData?.gstRate !== undefined && courseData?.gstRate !== null ? Number(courseData.gstRate) : 18;
  const isGstIncluded = Boolean(courseData?.isGstIncluded);

  const gstAmount = isGstIncluded
    ? Math.round(basePrice - (basePrice / (1 + (gstRate / 100))))
    : Math.round((basePrice * gstRate) / 100);

  const baseBeforeGst = isGstIncluded ? basePrice - gstAmount : basePrice;
  const finalPayable = isGstIncluded ? basePrice : basePrice + gstAmount;

  useEffect(() => {
    const fetchPublishedCurriculum = async () => {
      try {
        const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
        const token = localStorage.getItem('courseToken');
        const headers = token ? { 'Authorization': `Bearer ${token}` } : {};
        const res = await fetch(`${apiUrl}/api/courses/primary/curriculum`, { headers });
        if (res.ok) {
          const data = await res.json();
          if (data && data.course) {
            setCourseData(data.course);
          }
          if (data && data.modules && data.modules.length > 0) {
            setCurriculumModules(data.modules);

            const savedLessonId = localStorage.getItem('lastActiveCourseLessonId');
            let matchedLesson = null;
            let matchedModule = null;

            if (savedLessonId) {
              for (const mod of data.modules) {
                const found = (mod.lessons || []).find(
                  (l) => (l._id || l.id)?.toString() === savedLessonId.toString()
                );
                if (found) {
                  matchedLesson = found;
                  matchedModule = mod;
                  break;
                }
              }
            }

            if (matchedLesson && matchedModule) {
              setActiveModuleObj(matchedModule);
              setActiveLesson(matchedLesson);
            } else {
              setActiveModuleObj(data.modules[0]);
              if (data.modules[0].lessons && data.modules[0].lessons.length > 0) {
                setActiveLesson(data.modules[0].lessons[0]);
              }
            }
          }
        }
      } catch (err) {
        console.error('Failed to fetch dynamic curriculum:', err);
      }
    };

    fetchPublishedCurriculum();
    window.addEventListener('focus', fetchPublishedCurriculum);
    const interval = setInterval(fetchPublishedCurriculum, 4000);

    return () => {
      window.removeEventListener('focus', fetchPublishedCurriculum);
      clearInterval(interval);
    };
  }, [isPurchased]);

  // Reset left column scroll to top whenever active lesson changes
  useEffect(() => {
    if (leftColumnRef.current) {
      leftColumnRef.current.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [activeLesson?._id, activeLesson?.id]);

  useEffect(() => {
    const fetchCourseFooter = async () => {
      try {
        const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
        const res = await fetch(`${apiUrl}/api/footer-documents/published?category=course`);
        if (res.ok) {
          const data = await res.json();
          setCourseDocuments(data);
        }
      } catch (err) {
        console.error('Failed to fetch course footer documents:', err);
      }
    };

    const fetchSocialLinks = async () => {
      try {
        const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
        const res = await fetch(`${apiUrl}/api/social-links`);
        if (res.ok) {
          const data = await res.json();
          setSocialLinks(data);
        }
      } catch (err) {
        console.error('Failed to fetch social links:', err);
      }
    };

    fetchCourseFooter();
    fetchSocialLinks();
  }, []);

  const [pendingCheckout, setPendingCheckout] = useState(false);

  // Group published course documents dynamically by columnHeading
  const groupedColumns = React.useMemo(() => {
    const groups = {};
    courseDocuments.forEach((doc) => {
      const heading = (doc.columnHeading || 'LEGAL').trim().toUpperCase();
      if (!groups[heading]) {
        groups[heading] = [];
      }
      groups[heading].push(doc);
    });
    return groups;
  }, [courseDocuments]);

  const handleEnroll = () => {
    if (!isLoggedIn) {
      setLoginMode('register');
      setIsOtpStep(false);
      setIsForgotPassword(false);
      setIsForgotOtpStep(false);
      setError('');
      setShowPricingModal(false);
      setShowCourseLogin(true);
    } else if (isComingSoon) {
      setShowPreRegSuccessModal(true);
    } else {
      setShowPricingModal(true);
    }
  };

  const handlePurchase = () => {
    if (isComingSoon) {
      setShowPricingModal(false);
      setShowPreRegSuccessModal(true);
      return;
    }
    if (!isLoggedIn) {
      setShowPricingModal(false);
      setPendingCheckout(true);
      setShowCourseLogin(true);
    } else {
      setShowCheckout(true);
      setShowPricingModal(false);
      setSearchParams({ checkout: 'true' });
      sessionStorage.setItem('course_checkout_active', 'true');
    }
  };

  const handleCloseCheckout = () => {
    setShowCheckout(false);
    sessionStorage.removeItem('course_checkout_active');
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      next.delete('checkout');
      return next;
    });
  };

  const handlePayment = async () => {
    if (!checkoutAgreed) {
      setError("Please agree to the terms and conditions.");
      return;
    }
    setIsLoading(true);
    setError('');

    const API_URL = import.meta.env.VITE_API_URL || '';

    const safeJson = async (res) => {
      const text = await res.text();
      try {
        return JSON.parse(text);
      } catch {
        console.error('Non-JSON response:', text.substring(0, 200));
        throw new Error(`Server returned ${res.status}. Please ensure backend API is running and Razorpay keys are configured.`);
      }
    };

    try {
      const scriptLoaded = await new Promise((resolve) => {
        if (window.Razorpay) return resolve(true);
        const script = document.createElement('script');
        script.src = 'https://checkout.razorpay.com/v1/checkout.js';
        script.onload = () => resolve(true);
        script.onerror = () => resolve(false);
        document.body.appendChild(script);
      });

      if (!scriptLoaded) throw new Error('Razorpay SDK failed to load. Please check your internet connection.');

      const keyRes = await fetch(`${API_URL}/api/payment/public-key`);
      const keyData = await safeJson(keyRes);
      if (!keyRes.ok) throw new Error(keyData.message || 'Payment gateway not configured.');

      const orderRes = await fetch(`${API_URL}/api/payment/course-order`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });
      const orderData = await safeJson(orderRes);
      if (!orderRes.ok) throw new Error(orderData.message || 'Failed to create payment order');

      const options = {
        key: keyData.keyId,
        amount: orderData.amount,
        currency: orderData.currency,
        name: 'Better With Aarkesh',
        description: 'Premium Course Bundle',
        order_id: orderData.id,
        handler: async function (response) {
          try {
            const token = localStorage.getItem('courseToken');
            const verifyRes = await fetch(`${API_URL}/api/payment/course-verify`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                token: token
              })
            });
            const verifyData = await safeJson(verifyRes);
            if (verifyRes.ok && verifyData.success) {
              localStorage.setItem('isCoursePurchased', 'true');
              setIsPurchased(true);
              setShowCheckout(false);
              sessionStorage.removeItem('course_checkout_active');
              setSearchParams({});

              const billPayload = verifyData.purchase || {
                transactionId: response.razorpay_payment_id,
                orderId: response.razorpay_order_id,
                amount: finalPayable,
                basePrice: baseBeforeGst,
                gstRate,
                gstAmount,
                isGstIncluded,
                finalAmount: finalPayable,
                purchaseDate: new Date().toISOString(),
                studentName: fullName || email?.split('@')[0] || 'Valued Student',
                studentEmail: email,
                courseTitle: 'The Better Man™',
                freeSessionsGranted: 3
              };

              setPurchaseSuccessData(billPayload);
              sessionStorage.setItem('lastCoursePurchaseReceipt', JSON.stringify(billPayload));
            } else {
              setError(verifyData.message || 'Payment verification failed');
            }
          } catch (err) {
            setError(err.message || 'Error verifying payment.');
          } finally {
            setIsLoading(false);
          }
        },
        prefill: { email },
        theme: { color: '#c79c6e' },
      };

      const rzp = new window.Razorpay(options);
      rzp.on('payment.failed', async function (response) {
        console.warn('Razorpay payment failed:', response);
        const failedPayload = {
          status: 'Failed',
          transactionId: response.error?.metadata?.payment_id || `failed_${Date.now().toString(36)}`,
          orderId: response.error?.metadata?.order_id || orderData.id,
          failureReason: response.error?.description || response.error?.reason || 'Transaction was declined by bank / user cancelled payment.',
          errorCode: response.error?.code || 'PAYMENT_FAILED',
          amount: finalPayable,
          basePrice: baseBeforeGst,
          gstRate,
          gstAmount,
          isGstIncluded,
          finalAmount: finalPayable,
          purchaseDate: new Date().toISOString(),
          studentName: fullName || email?.split('@')[0] || 'Valued Student',
          studentEmail: email,
          courseTitle: 'The Better Man™',
        };

        // Persist failed attempt in database for admin visibility
        try {
          fetch(`${API_URL}/api/payment/course-failed-record`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              email,
              studentName: fullName || email?.split('@')[0] || 'Student',
              razorpay_order_id: failedPayload.orderId,
              razorpay_payment_id: failedPayload.transactionId,
              error_code: failedPayload.errorCode,
              error_description: failedPayload.failureReason,
              amount: finalPayable
            })
          }).catch(e => console.warn('Failed record log err:', e));
        } catch (e) {
          console.warn('Failed to record failure:', e);
        }

        setPurchaseSuccessData(failedPayload);
        setShowCheckout(false);
        setIsLoading(false);
      });
      rzp.open();
    } catch (err) {
      console.error('Payment error:', err);
      setError(err.message || 'Payment setup failed.');
      setIsLoading(false);
    }
  };

  useEffect(() => {
    window.scrollTo(0, 0);
    const token = localStorage.getItem('courseToken');
    const purchased = localStorage.getItem('isCoursePurchased') === 'true';
    if (token) {
      setIsLoggedIn(true);
      setIsPurchased(purchased);
      if (purchased) {
        setShowDashboard(true);
      }
      const userStr = localStorage.getItem('courseUser');
      if (userStr) {
        try {
          const userObj = JSON.parse(userStr);
          if (userObj?.email) setEmail(userObj.email);
          if (userObj?.fullName) setFullName(userObj.fullName);
          if (userObj?.phoneNumber) setPhoneNumber(userObj.phoneNumber);
        } catch (e) {}
      }
    }

    const isCheckoutParam = searchParams.get('checkout') === 'true' || sessionStorage.getItem('course_checkout_active') === 'true';
    if (isCheckoutParam && !purchased) {
      if (token) {
        setShowCheckout(true);
        if (searchParams.get('checkout') !== 'true') {
          setSearchParams({ checkout: 'true' });
        }
      } else {
        setShowCourseLogin(true);
      }
    }

    const handleClickOutside = (event) => {
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target)) {
        setShowProfileMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [searchParams]);

  // Anti-Inspect & DevTools blocker in Course Dashboard
  useEffect(() => {
    if (!showDashboard) return;

    const blockDevToolsKeys = (e) => {
      if (
        e.key === 'F12' ||
        (e.ctrlKey && e.shiftKey && ['I', 'i', 'J', 'j', 'C', 'c'].includes(e.key)) ||
        (e.metaKey && e.altKey && ['I', 'i', 'J', 'j', 'C', 'c'].includes(e.key)) ||
        (e.ctrlKey && ['u', 'U', 's', 'S'].includes(e.key)) ||
        (e.metaKey && ['u', 'U', 's', 'S'].includes(e.key))
      ) {
        e.preventDefault();
        e.stopPropagation();
        return false;
      }
    };

    const blockContextMenu = (e) => {
      e.preventDefault();
      return false;
    };

    window.addEventListener('keydown', blockDevToolsKeys, { capture: true });
    window.addEventListener('contextmenu', blockContextMenu);

    return () => {
      window.removeEventListener('keydown', blockDevToolsKeys, { capture: true });
      window.removeEventListener('contextmenu', blockContextMenu);
    };
  }, [showDashboard]);

  const handleLogout = () => {
    localStorage.removeItem('courseToken');
    localStorage.removeItem('isCoursePurchased');
    localStorage.removeItem('courseUser');
    sessionStorage.removeItem('course_checkout_active');
    setIsLoggedIn(false);
    setIsPurchased(false);
    setShowDashboard(false);
    setShowCheckout(false);
    setShowProfileMenu(false);
    setSearchParams({});
  };

  // OTP Handlers
  const handleOtpChange = (index, value) => {
    if (!/^\d*$/.test(value)) return;
    const newOtp = [...otpValues];
    newOtp[index] = value;
    setOtpValues(newOtp);
    if (value !== '' && index < 3) {
      otpRefs[index + 1].current.focus();
    }
  };

  const handleOtpKeyDown = (index, e) => {
    if (e.key === 'Backspace' && otpValues[index] === '' && index > 0) {
      otpRefs[index - 1].current.focus();
    }
  };

  const handleToggleMode = () => {
    setLoginMode(loginMode === 'login' ? 'register' : 'login');
    setIsOtpStep(false);
    setIsForgotPassword(false);
    setIsForgotOtpStep(false);
    setOtpValues(['', '', '', '']);
    setError('');
    setPassword('');
    setConfirmPassword('');
    setFullName('');
    setEmail('');
    setPhoneNumber('');
  };

  // Auth Submit
  const handleAuthSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (loginMode === 'register' && !isForgotPassword) {
      if (password.length < 4) { setError('Password must be at least 4 characters long'); return; }
      if (password !== confirmPassword) { setError('Passwords do not match'); return; }
    } else if (isForgotPassword && isForgotOtpStep) {
      if (password.length < 4) { setError('Password must be at least 4 characters long'); return; }
      if (password !== confirmPassword) { setError('Passwords do not match'); return; }
    }

    setIsLoading(true);
    try {
      const API_URL = import.meta.env.VITE_API_URL || '';
      let endpoint = `${API_URL}/api/course-auth/login`;
      let body = { email, password };

      if (isForgotPassword) {
        if (!isForgotOtpStep) {
          endpoint = `${API_URL}/api/course-auth/forgot-password-init`;
          body = { email };
        } else {
          endpoint = `${API_URL}/api/course-auth/forgot-password-reset`;
          body = { email, otp: otpValues.join(''), newPassword: password };
        }
      } else if (loginMode === 'register') {
        if (!isOtpStep) {
          endpoint = `${API_URL}/api/course-auth/register-init`;
          body = { fullName, email, password };
        } else {
          endpoint = `${API_URL}/api/course-auth/register-verify`;
          body = { email, otp: otpValues.join('') };
        }
      }

      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      const data = await res.json();

      if (res.ok) {
        if (isForgotPassword) {
          if (!isForgotOtpStep) {
            setIsForgotOtpStep(true);
            setError('');
          } else {
            setIsForgotPassword(false);
            setIsForgotOtpStep(false);
            setLoginMode('login');
            setOtpValues(['', '', '', '']);
            setPassword('');
            setConfirmPassword('');
            setError('');
          }
        } else if (loginMode === 'register' && !isOtpStep) {
          setIsOtpStep(true);
          setError('');
        } else {
          localStorage.setItem('courseToken', data.token);
          localStorage.setItem('courseUser', JSON.stringify(data));
          if (data.isPurchased && !isComingSoon) {
            localStorage.setItem('isCoursePurchased', 'true');
            setIsPurchased(true);
            setShowDashboard(true);
            setShowPricingModal(false);
          } else {
            localStorage.removeItem('isCoursePurchased');
            setIsPurchased(false);
            setShowDashboard(false);
            if (isComingSoon) {
              setShowCheckout(false);
              setShowPricingModal(false);
              setShowPreRegSuccessModal(true);
            } else if (pendingCheckout || searchParams.get('checkout') === 'true') {
              setShowCheckout(true);
              setPendingCheckout(false);
            } else {
              setShowCheckout(false);
              setShowPricingModal(true);
            }
          }
          setShowCourseLogin(false);
          setIsLoggedIn(true);
        }
      } else {
        setError(data.message || 'Authentication failed');
      }
    } catch (err) {
      console.error(err);
      setError('Network error, please try again later');
    } finally {
      setIsLoading(false);
    }
  };



  // ═══════════════════════════════════════════════════════════════
  // PAYMENT SUCCESS / FAILED TAX INVOICE RECEIPT VIEW
  // ═══════════════════════════════════════════════════════════════
  if (purchaseSuccessData) {
    return (
      <CoursePaymentSuccess
        purchaseData={purchaseSuccessData}
        onStartLearning={() => {
          setPurchaseSuccessData(null);
          setShowDashboard(true);
        }}
        onBookSession={() => {
          setPurchaseSuccessData(null);
          navigate('/booking');
        }}
        onRetryPayment={() => {
          setPurchaseSuccessData(null);
          setShowCheckout(true);
          handlePayment();
        }}
        onBackToCourse={() => {
          setPurchaseSuccessData(null);
          setShowCheckout(false);
        }}
      />
    );
  }

  // ═══════════════════════════════════════════════════════════════
  // DASHBOARD VIEW (purchased users)
  // ═══════════════════════════════════════════════════════════════
  if (showDashboard) {
    return (
      <main className="h-screen bg-[#050505] text-white flex flex-col overflow-hidden">
        <CourseNavbar
          isLoggedIn={isLoggedIn}
          isPurchased={isPurchased}
          showDashboard={showDashboard}
          setShowDashboard={setShowDashboard}
          profileMenuRef={profileMenuRef}
          showProfileMenu={showProfileMenu}
          setShowProfileMenu={setShowProfileMenu}
          handleLogout={handleLogout}
          setShowCourseLogin={setShowCourseLogin}
        />

        {/* Main Dashboard Layout: Responsive Vertical/Landscape Mobile, Split on Desktop */}
        <div className="flex-grow flex flex-col lg:flex-row h-[calc(100vh-66px)] sm:h-[calc(100vh-76px)] overflow-hidden" data-lenis-prevent="true">
          
          {/* ── LEFT / MAIN COLUMN (Scrollable on both mobile and desktop) ── */}
          <div 
            ref={leftColumnRef}
            data-lenis-prevent="true"
            className="flex-1 flex flex-col bg-[#050505] overflow-y-auto border-r border-white/10 scroll-smooth overscroll-contain h-full"
          >
            {/* ── 1. VIDEO PLAYER (Naturally scrollable so user can scroll down to view details, list & comments) ── */}
            <div className="w-full aspect-video shrink-0 bg-black relative flex items-center justify-center border-b border-white/10 overflow-hidden z-20 shadow-2xl">
              {activeLesson?.videoToken || activeLesson?.encryptedVideoToken || activeLesson?.youtubeVideoId || (activeLesson?.youtubeUrl && extractYoutubeVideoId(activeLesson.youtubeUrl)) || (activeLesson?.videoSourceType === 'youtube') ? (
                <ProtectedYouTubePlayer 
                  key={activeLesson?._id || activeLesson?.id || 'yt_active'}
                  lesson={activeLesson}
                  videoToken={activeLesson?.videoToken || activeLesson?.encryptedVideoToken}
                  videoId={activeLesson?.youtubeVideoId || (activeLesson?.youtubeUrl ? extractYoutubeVideoId(activeLesson.youtubeUrl) : '')}
                  title={activeLesson?.title}
                />
              ) : activeLesson?.muxPlaybackId ? (
                <iframe
                  src={`https://player.mux.com/${activeLesson.muxPlaybackId}?accentColor=c79c6e`}
                  className="w-full h-full border-0"
                  allow="accelerometer; gyroscope; autoplay; encrypted-media; picture-in-picture;"
                  allowFullScreen
                  title={activeLesson.title}
                />
              ) : (
                <div className="w-full h-full relative flex items-center justify-center bg-gradient-to-br from-black via-[#0c0c0c] to-[#070707]">
                  <img src="/course_hero_bg.jpg" alt="" className="absolute inset-0 w-full h-full object-cover opacity-25" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
                  <button className="w-20 h-20 rounded-full bg-[#c79c6e] flex items-center justify-center text-black hover:scale-105 transition-transform shadow-[0_0_40px_rgba(199,156,110,0.3)] relative z-10">
                    <Play size={36} weight="fill" className="ml-1" />
                  </button>
                  <div className="absolute bottom-6 left-6 md:bottom-8 md:left-8 z-10">
                    <span className="text-[0.65rem] uppercase tracking-[0.2em] text-[#c79c6e] font-semibold mb-1 block">PLAYING NOW</span>
                    <h2 className="text-xl md:text-2xl font-serif text-white drop-shadow-md">{activeLesson?.title}</h2>
                  </div>
                </div>
              )}
            </div>

            {/* ── 2. MOBILE LESSON TITLE & MARK COMPLETED BAR ── */}
            <div className="lg:hidden flex items-center justify-between px-4 py-3 bg-[#0a0a0a] border-b border-white/10 shrink-0 gap-3">
              <h3 className="font-serif text-base text-white font-normal leading-snug truncate min-w-0">
                {activeLesson?.title}
              </h3>

              {/* Mark Complete Button */}
              <button
                type="button"
                onClick={() => {
                  const updated = { ...activeLesson, isCompleted: !activeLesson?.isCompleted };
                  setActiveLesson(updated);
                }}
                className={`px-3 py-1.5 rounded-xl border text-[11px] font-semibold flex items-center gap-1.5 transition-all shrink-0 ${
                  activeLesson?.isCompleted
                    ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-400'
                    : 'bg-white/5 border-white/10 text-white/80 hover:text-white'
                }`}
              >
                <CheckCircle size={15} weight={activeLesson?.isCompleted ? 'fill' : 'regular'} />
                <span>{activeLesson?.isCompleted ? 'Completed' : 'Mark Complete'}</span>
              </button>
            </div>

            {/* ── 3. MOBILE TAB SELECTOR (Playlist & Comments) ── */}
            <div className="lg:hidden flex items-center border-b border-white/10 bg-[#070707] px-3.5 py-2.5 gap-2 shrink-0">
              <button
                type="button"
                onClick={() => setActiveMobileTab('playlist')}
                className={`flex-1 py-2 px-3 rounded-xl text-xs font-semibold uppercase tracking-wider flex items-center justify-center gap-2 transition-all ${
                  activeMobileTab === 'playlist'
                    ? 'bg-[#c79c6e]/20 border border-[#c79c6e]/50 text-[#c79c6e] shadow-sm'
                    : 'bg-white/[0.03] border border-white/5 text-white/60 hover:text-white'
                }`}
              >
                <Play size={13} weight="fill" />
                <span>Playlist</span>
                <span className="px-1.5 py-0.5 rounded-full bg-white/10 text-[10px] font-mono">
                  {allLessons.length}
                </span>
              </button>

              <button
                type="button"
                onClick={() => setActiveMobileTab('comments')}
                className={`flex-1 py-2 px-3 rounded-xl text-xs font-semibold uppercase tracking-wider flex items-center justify-center gap-2 transition-all ${
                  activeMobileTab === 'comments'
                    ? 'bg-[#c79c6e]/20 border border-[#c79c6e]/50 text-[#c79c6e] shadow-sm'
                    : 'bg-white/[0.03] border border-white/5 text-white/60 hover:text-white'
                }`}
              >
                <ChatCenteredDots size={14} weight="bold" />
                <span>Comments</span>
              </button>
            </div>

            {/* ── MOBILE PLAYLIST VIEW ── */}
            {activeMobileTab === 'playlist' && (
              <div className="lg:hidden p-4 space-y-4 bg-[#050505]">
                <div className="flex items-center justify-between px-1">
                  <h4 className="font-serif text-base text-white">Course Curriculum</h4>
                  <span className="text-xs text-white/40 font-mono">{allLessons.length} Videos</span>
                </div>

                <div className="space-y-3">
                  {curriculumModules.map((module) => {
                    const isCurrentMod = activeModuleObj?._id === module._id || activeModuleObj?.id === module.id;
                    const lessons = module.lessons || [];

                    return (
                      <div key={module._id || module.id} className="border border-white/10 rounded-2xl bg-[#0a0a0a] overflow-hidden">
                        <button
                          type="button"
                          className="w-full flex items-center justify-between p-4 hover:bg-white/5 transition-colors text-left group"
                          onClick={() => setActiveModuleObj(isCurrentMod ? null : module)}
                        >
                          <div className="pr-3">
                            <h5 className={`font-serif text-sm mb-0.5 leading-snug ${isCurrentMod ? 'text-[#c79c6e]' : 'text-white'}`}>
                              {module.title}
                            </h5>
                            <p className="font-sans text-[0.6rem] uppercase tracking-[0.15em] text-white/40">
                              {lessons.length} {lessons.length === 1 ? 'VIDEO' : 'VIDEOS'}
                            </p>
                          </div>
                          <CaretDown size={14} className={`text-white/40 transition-transform shrink-0 ${isCurrentMod ? 'rotate-180' : ''}`} />
                        </button>

                        {isCurrentMod && (
                          <div className="bg-[#050505] p-2 pt-0 border-t border-white/5 space-y-1">
                            {lessons.map((lesson) => {
                              const isActive = (activeLesson?._id && activeLesson._id === lesson._id) || (activeLesson?.id && activeLesson.id === lesson.id);

                              return (
                                <button
                                  key={lesson._id || lesson.id}
                                  type="button"
                                  onClick={() => {
                                    handleSelectLesson(lesson, module);
                                    if (leftColumnRef.current) {
                                      leftColumnRef.current.scrollTo({ top: 0, behavior: 'smooth' });
                                    }
                                  }}
                                  className={`w-full flex items-center justify-between py-2.5 px-3 rounded-xl transition-all text-left ${
                                    isActive ? 'bg-[#c79c6e]/15 border border-[#c79c6e]/40' : 'hover:bg-white/5 border border-transparent'
                                  }`}
                                >
                                  <div className="flex items-center gap-2.5 min-w-0 pr-2">
                                    {lesson.isCompleted ? (
                                      <CheckCircle size={15} weight="fill" className="text-[#c79c6e] shrink-0" />
                                    ) : (
                                      <Play size={14} weight={isActive ? 'fill' : 'regular'} className={`shrink-0 ${isActive ? 'text-[#c79c6e]' : 'text-white/40'}`} />
                                    )}
                                    <span className={`font-sans text-xs truncate ${isActive ? 'text-white font-medium' : 'text-white/70'}`}>
                                      {lesson.title}
                                    </span>
                                  </div>
                                  <span className="font-sans text-[0.6rem] text-white/40 whitespace-nowrap ml-2 shrink-0">
                                    {lesson.duration || '12:00'}
                                  </span>
                                </button>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* ── 4. DESKTOP ONLY: Overview Description & Worksheets ── */}
            <div className="hidden lg:block p-6 md:p-10 pb-0 space-y-6">
              {/* About Lesson Card */}
              <div className="bg-[#0a0a0a] border border-white/10 rounded-2xl p-6 md:p-8 shadow-2xl">
                <div className="flex items-center justify-between gap-4 mb-4 pb-4 border-b border-white/10">
                  <h3 className="font-serif text-xl sm:text-2xl text-white">{activeLesson?.title}</h3>
                  <button
                    onClick={() => {
                      const updated = { ...activeLesson, isCompleted: !activeLesson.isCompleted };
                      setActiveLesson(updated);
                    }}
                    className={`px-4 py-2 rounded-xl border text-xs font-semibold uppercase tracking-wider items-center gap-2 transition-all ${
                      activeLesson?.isCompleted
                        ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-400'
                        : 'bg-white/5 border-white/10 text-white/70 hover:text-white hover:bg-white/10'
                    }`}
                  >
                    <CheckCircle size={16} weight={activeLesson?.isCompleted ? 'fill' : 'regular'} />
                    <span>{activeLesson?.isCompleted ? 'Completed' : 'Mark Complete'}</span>
                  </button>
                </div>

                <p className="text-white/70 font-sans text-sm md:text-base leading-relaxed mb-6">
                  {activeLesson?.description || 'In this session, we dive deep into the mechanics of presence. You will learn how to anchor yourself in high-pressure situations, tune out internal noise, and project a calm, magnetic energy.'}
                </p>

                <div className="flex items-center gap-6 text-xs font-sans uppercase tracking-[0.2em] text-white/50">
                  <div className="flex items-center gap-2">
                    <Clock size={16} className="text-[#c79c6e]" /> {activeLesson?.duration || '15:00'}
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-[#c79c6e]/20 text-[#c79c6e] flex items-center justify-center text-[9px] font-bold">A</span>
                    AARKESH GUPTA
                  </div>
                </div>
              </div>

              {/* Action Resources Container */}
              {activeLesson?.resources && activeLesson.resources.length > 0 && (
                <div className="bg-[#0a0a0a] border border-white/10 rounded-2xl p-6 md:p-8">
                  <div className="flex items-center gap-2 mb-4">
                    <FileText size={20} className="text-[#c79c6e]" />
                    <h4 className="font-serif text-lg sm:text-xl text-white font-normal">Action Resources & Worksheets</h4>
                  </div>
                  <div className="space-y-3">
                    {activeLesson.resources.map((res, rIdx) => (
                      <a
                        key={rIdx}
                        href={res.fileUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center justify-between p-3.5 sm:p-4 rounded-xl bg-white/[0.03] hover:bg-[#c79c6e]/10 border border-white/10 hover:border-[#c79c6e]/40 transition-all group"
                      >
                        <div className="flex items-center gap-3">
                          <FileText size={18} className="text-[#c79c6e] group-hover:scale-110 transition-transform" />
                          <span className="text-sm font-medium text-white group-hover:text-[#c79c6e] transition-colors">{res.title}</span>
                        </div>
                        <span className="text-xs font-semibold text-[#c79c6e] uppercase tracking-wider">Download PDF →</span>
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* ── 5. COMMENTS SECTION (Always on desktop, shown on mobile when Comments tab is active) ── */}
            <div className={`${activeMobileTab === 'comments' ? 'block' : 'hidden lg:block'} p-3.5 sm:p-6 md:p-10 pt-3 sm:pt-6`}>
              <LessonComments
                lessonId={activeLesson?._id || activeLesson?.id}
                lessonTitle={activeLesson?.title}
                onRequireAuth={() => {
                  setShowCourseLogin(true);
                  setLoginMode('login');
                }}
              />
            </div>
          </div>

          {/* ── DESKTOP RIGHT COLUMN - Day by Day Curriculum Playlist ── */}
          <div 
            data-lenis-prevent="true"
            className="hidden lg:flex w-[420px] bg-black flex-col h-full overflow-y-auto p-6 gap-5 border-l border-white/10 overscroll-contain"
          >
            <div className="sticky top-0 bg-black/95 backdrop-blur-md z-10 pb-2 flex items-center justify-between">
              <h3 className="font-sans text-[0.68rem] uppercase tracking-widest text-[#c79c6e] font-bold">
                Day-by-Day Playlist
              </h3>
              <span className="text-xs text-white/40 font-sans">
                {allLessons.length} Videos
              </span>
            </div>

            <div className="flex flex-col gap-4">
              {curriculumModules.map((module) => {
                const isCurrentMod = activeModuleObj?._id === module._id || activeModuleObj?.id === module.id;
                const lessons = module.lessons || [];

                return (
                  <div key={module._id || module.id} className="border border-white/10 rounded-2xl bg-[#050505] overflow-hidden">
                    <button
                      className="w-full flex items-center justify-between p-5 hover:bg-white/5 transition-colors text-left group"
                      onClick={() => setActiveModuleObj(isCurrentMod ? null : module)}
                    >
                      <div className="pr-3">
                        <h4 className={`font-serif text-base mb-1 transition-colors leading-snug ${isCurrentMod ? 'text-[#c79c6e]' : 'text-white group-hover:text-[#c79c6e]'}`}>
                          {module.title}
                        </h4>
                        <p className="font-sans text-[0.62rem] uppercase tracking-[0.2em] text-white/40">
                          {lessons.length} {lessons.length === 1 ? 'VIDEO' : 'VIDEOS'}
                        </p>
                      </div>
                      <CaretDown size={15} className={`text-white/40 transition-transform shrink-0 ${isCurrentMod ? 'rotate-180' : ''}`} />
                    </button>

                    {isCurrentMod && (
                      <div className="bg-[#080808] p-2 pt-0 border-t border-white/5 space-y-1">
                        {lessons.map((lesson) => {
                          const isActive = (activeLesson?._id && activeLesson._id === lesson._id) || (activeLesson?.id && activeLesson.id === lesson.id);

                          return (
                            <button
                              key={lesson._id || lesson.id}
                              onClick={() => handleSelectLesson(lesson, module)}
                              className={`w-full flex items-center justify-between py-3 px-3.5 rounded-xl transition-all text-left group ${
                                isActive ? 'bg-[#c79c6e]/15 border border-[#c79c6e]/40' : 'hover:bg-white/5 border border-transparent'
                              }`}
                            >
                              <div className="flex items-center gap-3 min-w-0 pr-2">
                                {lesson.isCompleted ? (
                                  <CheckCircle size={16} weight="fill" className="text-[#c79c6e] shrink-0" />
                                ) : (
                                  <Play size={16} weight={isActive ? 'fill' : 'regular'} className={`shrink-0 ${isActive ? 'text-[#c79c6e]' : 'text-white/40'}`} />
                                )}
                                <span className={`font-sans text-xs truncate ${isActive ? 'text-white font-semibold' : 'text-white/70 group-hover:text-white'}`}>
                                  {lesson.title}
                                </span>
                              </div>
                              <span className="font-sans text-[0.62rem] text-white/40 whitespace-nowrap ml-2 shrink-0">
                                {lesson.duration || '12:00'}
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </main>
    );
  }

  // ═══════════════════════════════════════════════════════════════
  // LANDING PAGE (non-purchased / non-logged-in users)
  // ═══════════════════════════════════════════════════════════════
  return (
    <main className="w-full bg-[#050505] text-white min-h-screen flex flex-col">
      <CourseNavbar
        isLoggedIn={isLoggedIn}
        isPurchased={isPurchased}
        showDashboard={showDashboard}
        setShowDashboard={setShowDashboard}
        profileMenuRef={profileMenuRef}
        showProfileMenu={showProfileMenu}
        setShowProfileMenu={setShowProfileMenu}
        handleLogout={handleLogout}
        setShowCourseLogin={setShowCourseLogin}
      />

      {/* ─── HERO ───────────────────────────────────────────────── */}
      <section id="hero" className={`relative w-full flex-1 min-h-[calc(100vh-76px)] flex flex-col justify-center items-center overflow-hidden px-6 py-20 ${
        isComingSoon 
          ? 'bg-gradient-to-b from-[#080808] via-[#050505] to-[#020202]' 
          : 'bg-[#050505]'
      }`}>
        {/* Ambient Backgrounds */}
        {isComingSoon ? (
          /* Luxury Gradient & Radial Ambient Lighting for Coming Soon */
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            {/* Soft top ambient spotlight */}
            <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[850px] h-[550px] bg-gradient-to-b from-[#c79c6e]/20 via-[#c79c6e]/8 to-transparent rounded-full blur-[140px]" />
            {/* Center golden radial core */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#c79c6e]/14 rounded-full blur-[160px]" />
            {/* Bottom depth vignette */}
            <div className="absolute -bottom-40 left-1/2 -translate-x-1/2 w-[700px] h-[400px] bg-[#c79c6e]/10 rounded-full blur-[150px]" />
            {/* Delicate subtle mesh lines/vignette */}
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_0%,rgba(5,5,5,0.85)_100%)]" />
          </div>
        ) : (
          /* Background Image & Vignettes for Live Masterclass Mode */
          <div className="absolute inset-0 pointer-events-none">
            <img src="/course_hero_bg.jpg" alt="" className="w-full h-full object-cover object-center opacity-85" />
            <div className="absolute inset-0 bg-gradient-to-b from-[#050505]/80 via-transparent to-[#050505]" />
            <div className="absolute inset-0 bg-gradient-to-r from-[#050505]/85 via-transparent to-[#050505]/85" />
            {/* Ambient center gold glow behind the figure */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[650px] h-[650px] bg-[#c79c6e]/12 rounded-full blur-[150px]" />
          </div>
        )}

        {/* Center Hero Content */}
        <div className="relative z-10 text-center max-w-3xl mx-auto flex flex-col items-center justify-center my-auto">
          {/* Eyebrow */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#c79c6e]/10 border border-[#c79c6e]/25 text-[#c79c6e] text-[0.65rem] font-sans font-semibold uppercase tracking-[0.25em] mb-6 shadow-sm">
            <Sparkle size={12} weight="fill" />
            <span>THE OFFICIAL MASTERCLASS</span>
          </div>

          {/* Clean Grand Title */}
          {isComingSoon ? (
            <h1 className="font-serif text-6xl sm:text-7xl md:text-8xl lg:text-[6.5rem] leading-[1.05] mb-6 font-normal tracking-tight">
              <span className="bg-clip-text text-transparent bg-gradient-to-b from-white via-[#faeedf] to-[#c79c6e] drop-shadow-[0_10px_35px_rgba(199,156,110,0.25)]">
                Coming Soon
              </span>
            </h1>
          ) : (
            <h1 className="font-serif text-5xl sm:text-6xl md:text-7xl lg:text-[5.4rem] text-white leading-[1.05] mb-6 font-normal tracking-tight">
              The Better<br />
              <span className="text-[#c79c6e]">Man</span>
            </h1>
          )}

          {/* Minimal Subtitle */}
          <p className="font-sans text-white/75 text-sm sm:text-base md:text-lg leading-relaxed max-w-xl mx-auto mb-10">
            Master the psychology of calm authority, magnetic communication, and effortless self-command.
          </p>

          {/* CTA Action */}
          <div className="flex flex-col items-center gap-3.5 mb-12">
            {isComingSoon ? (
              <button
                type="button"
                onClick={handleEnroll}
                className="group relative inline-flex items-center gap-4 rounded-full border border-[#c79c6e]/50 bg-gradient-to-r from-white/[0.08] to-[#c79c6e]/[0.08] hover:from-[#c79c6e]/20 hover:to-[#c79c6e]/30 hover:border-[#c79c6e] backdrop-blur-2xl pl-8 pr-2.5 py-2.5 font-sans text-xs md:text-sm font-semibold uppercase tracking-[0.2em] text-white transition-all hover:scale-105 shadow-[0_4px_30px_rgba(0,0,0,0.6),inset_0_1px_1px_rgba(255,255,255,0.25)] hover:shadow-[0_0_50px_rgba(199,156,110,0.4),inset_0_1px_1px_rgba(255,255,255,0.35)] cursor-pointer"
              >
                <span className="tracking-[0.2em]">Register Now</span>
                <span className="w-10 h-10 rounded-full bg-[#c79c6e]/20 border border-[#c79c6e]/40 flex items-center justify-center text-[#c79c6e] group-hover:bg-[#c79c6e] group-hover:text-black transition-all shadow-inner">
                  <ArrowRight size={17} weight="bold" />
                </span>
              </button>
            ) : !isPurchased ? (
              <button
                type="button"
                onClick={handleEnroll}
                className="group relative inline-flex items-center gap-4 rounded-full border border-[#c79c6e]/40 bg-white/[0.06] hover:bg-[#c79c6e]/15 hover:border-[#c79c6e] backdrop-blur-2xl pl-8 pr-2.5 py-2.5 font-sans text-xs md:text-sm font-semibold uppercase tracking-[0.2em] text-white transition-all hover:scale-105 shadow-[0_4px_30px_rgba(0,0,0,0.5),inset_0_1px_1px_rgba(255,255,255,0.2)] hover:shadow-[0_0_40px_rgba(199,156,110,0.35),inset_0_1px_1px_rgba(255,255,255,0.3)] cursor-pointer"
              >
                <span>{isLoggedIn ? 'Enroll Now' : 'Register Now'}</span>
                <span className="w-10 h-10 rounded-full bg-[#c79c6e]/20 border border-[#c79c6e]/40 flex items-center justify-center text-[#c79c6e] group-hover:bg-[#c79c6e] group-hover:text-black transition-all shadow-inner">
                  <ArrowRight size={17} weight="bold" />
                </span>
              </button>
            ) : (
              <button
                type="button"
                onClick={() => setShowDashboard(true)}
                className="group relative inline-flex items-center gap-4 rounded-full border border-white/20 bg-white/[0.06] hover:bg-white/[0.12] hover:border-[#c79c6e]/50 backdrop-blur-2xl pl-8 pr-2.5 py-2.5 font-sans text-xs md:text-sm font-semibold uppercase tracking-[0.2em] text-white transition-all shadow-[0_4px_30px_rgba(0,0,0,0.5),inset_0_1px_1px_rgba(255,255,255,0.15)] cursor-pointer"
              >
                <span>Go to Course Dashboard</span>
                <span className="w-10 h-10 rounded-full bg-[#c79c6e]/20 border border-[#c79c6e]/40 text-[#c79c6e] group-hover:bg-[#c79c6e] group-hover:text-black flex items-center justify-center transition-all">
                  <ArrowRight size={16} weight="bold" />
                </span>
              </button>
            )}
            {!isComingSoon && (
              <p className="text-white/40 font-sans text-xs tracking-wide">
                Instant Access · 3 Private 1-on-1 Sessions Included · 30-Day Guarantee
              </p>
            )}
          </div>

          {/* Minimal Key Highlight */}
          <div className="flex items-center justify-center pt-6 border-t border-white/10 text-white/70 font-sans text-xs">
            <div className="flex items-center gap-2">
              <Infinity size={16} className="text-[#c79c6e]" weight="bold" />
              <span className="tracking-wide font-medium">Lifetime Access</span>
            </div>
          </div>
        </div>
      </section>

      {/* ─── BELOW HERO CONTENT (Only visible when NOT in Coming Soon mode) ─── */}
      {!isComingSoon && (
        <>
          {/* ─── THE MANIFESTO: PURE EDITORIAL FLOWING TEXT (No Boxes/Cards - Full Width) ─── */}
          <section className="py-20 sm:py-28 px-6 sm:px-10 md:px-16 lg:px-24 max-w-7xl mx-auto w-full relative z-10 text-[#F5F2EB]">
            <div className="space-y-14 sm:space-y-20">

              {/* ─── PART 1 ─── */}
              <div className="space-y-6">
                <span className="block text-[0.65rem] font-sans font-semibold uppercase tracking-[0.25em] text-[#c79c6e]">
                  PART I · THE UNSEEN FRACTURE
                </span>

                <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl text-white font-normal leading-[1.15] tracking-tight">
                  Most men are not failing because they lack ambition. <span className="text-[#c79c6e] font-semibold">They are drowning in uncalibrated internal noise.</span>
                </h2>

                <p className="font-sans text-xl sm:text-2xl text-white font-bold leading-snug">
                  You wake up, check your screen before your feet touch the floor, and instantly hand over the steering wheel of your nervous system to fifty different external demands.
                </p>

                <p className="font-sans text-base sm:text-lg text-white/75 leading-relaxed">
                  <span className="text-lg sm:text-xl font-bold text-white block mb-1">By noon, you have fought a dozen silent battles:</span> negotiating difficult conversations, repressing subtle micro-frustrations, pretending to be fully focused when your mind is fractured into a hundred pieces, and <strong className="text-white font-bold">carrying an invisible weight in your chest</strong> that you have never once spoken out loud. You look successful on paper. You hit targets, you pay bills, you show up where you are expected. Yet beneath the curated surface, <span className="text-lg sm:text-xl text-[#F5F2EB] font-bold">there is a persistent sensation that you are simply performing a version of yourself</span> rather than inhabiting your genuine power.
                </p>

                <p className="font-serif text-2xl sm:text-3xl text-[#c79c6e] italic font-normal leading-relaxed pl-5 border-l-2 border-[#c79c6e] my-4">
                  "Presence is not something you fabricate through aggressive posturing. Presence is what remains when you finally stop leaking your attention to things you cannot control."
                </p>

                <p className="font-sans text-xs sm:text-sm text-white/45 leading-relaxed">
                  <strong className="text-white/70 font-semibold text-sm">Key Neuroscience Finding:</strong> Chronic sensory overload degrades executive presence by more than 40%, forcing the human nervous system into an unceasing baseline state of low-grade fight-or-flight.
                </p>
              </div>

              {/* ─── PART 2 ─── */}
              <div className="space-y-6">
                <span className="block text-[0.65rem] font-sans font-semibold uppercase tracking-[0.25em] text-[#c79c6e]">
                  PART II · THE REACTION LOOP
                </span>

                <h3 className="font-serif text-2xl sm:text-3xl md:text-4xl text-white font-normal leading-tight">
                  The moment you react impulsively, <span className="font-bold text-white">you surrender the room.</span>
                </h3>

                <p className="font-sans text-xl sm:text-2xl text-[#c79c6e] font-bold leading-snug">
                  True authority is never loud. It is measured, grounded, and unshakeable in the eye of emotional turbulence.
                </p>

                <p className="font-sans text-base sm:text-lg text-white/80 leading-relaxed">
                  <span className="text-lg sm:text-xl font-bold text-white block mb-1">Consider what happens in high-stakes environments:</span> When someone challenges your viewpoint in a boardroom, when unexpected conflict arises in your relationship, or when financial friction strikes without warning—<strong className="text-white font-bold">what is your instinctual bodily response?</strong> For 95% of men, the heart rate spikes, the breath climbs high into the collarbones, the vocal pitch tightens, and words rush out in an involuntary attempt to defend, validate, or appease.
                </p>

                <p className="font-sans text-2xl sm:text-3xl text-white font-bold leading-tight">
                  Every single person in the room sub-consciously registers that micro-panic. <span className="text-[#c79c6e]">They do not hear your words; they feel your instability.</span>
                </p>

                <p className="font-sans text-base sm:text-lg text-white/75 leading-relaxed">
                  Human beings are biological mirrors. We possess mirror neuron systems evolutionary fine-tuned over two million years to sense whether the man standing in front of us is anchored in reality or dangling by a psychological thread. <span className="text-lg sm:text-xl font-bold text-white">You cannot out-talk an ungrounded nervous system.</span> You cannot fake composure when your physiology is broadcasting insecurity with every shallow breath and restless shift of weight.
                </p>

                <p className="font-sans text-sm sm:text-base text-white/60 leading-relaxed font-medium">
                  When you learn to <strong className="text-white font-bold text-base sm:text-lg">lengthen the gap between stimulus and response</strong>, you reclaim sovereign control over every social, professional, and personal interaction in your life.
                </p>
              </div>

              {/* ─── PART 3 ─── */}
              <div className="space-y-6">
                <span className="block text-[0.65rem] font-sans font-semibold uppercase tracking-[0.25em] text-[#c79c6e]">
                  PART III · THE TRIAD OF SELF-COMMAND
                </span>

                <h3 className="font-serif text-3xl sm:text-4xl md:text-5xl text-white font-normal">
                  The Three Pillars of The Better Man
                </h3>

                <p className="font-sans text-xl sm:text-2xl text-white font-bold leading-snug">
                  Transformation is not an emotional high that fades by Monday morning. It is a systematic reconstruction of your mental, somatic, and vocal operating system.
                </p>

                <div className="space-y-5 pt-2">
                  <p className="font-sans text-base sm:text-lg text-white/80 leading-relaxed">
                    <span className="text-xl sm:text-2xl font-bold text-white block mb-0.5">1. Somatic Anchoring</span>
                    Rewiring your autonomic nervous system so your default response under severe pressure is <strong className="text-white font-bold">physiological calmness</strong> rather than adrenaline-driven reaction.
                  </p>
                  <p className="font-sans text-base sm:text-lg text-white/80 leading-relaxed">
                    <span className="text-xl sm:text-2xl font-bold text-white block mb-0.5">2. Magnetic Cadence</span>
                    Eliminating filler words, uptalk, and rushed speech. Speaking with <strong className="text-white font-bold">deliberate resonance, tactical silence</strong>, and unwavering eye contact.
                  </p>
                  <p className="font-sans text-base sm:text-lg text-white/80 leading-relaxed">
                    <span className="text-xl sm:text-2xl font-bold text-white block mb-0.5">3. Internal Sovereignty</span>
                    Eradicating the need for external validation. Cultivating an <strong className="text-white font-bold">unshakeable locus of control</strong> that no insult, crisis, or chaotic environment can disturb.
                  </p>
                </div>

                <p className="font-sans text-lg sm:text-xl text-white/90 leading-relaxed pt-2">
                  <span className="text-xl sm:text-2xl font-bold text-[#c79c6e] block mb-1">When these three pillars integrate into your daily unconscious behavior:</span> You stop straining for respect because your stillness commands it automatically. You stop over-explaining your decisions because your clarity carries unquestioned weight.
                </p>
              </div>

              {/* ─── PART 4 ─── */}
              <div className="space-y-6">
                <span className="block text-[0.65rem] font-sans font-semibold uppercase tracking-[0.25em] text-[#c79c6e]">
                  PART IV · THE RIPPLE EFFECT
                </span>

                <h3 className="font-serif text-2xl sm:text-3xl md:text-4xl text-white font-normal leading-snug">
                  What changes when you master authentic presence?
                </h3>

                <p className="font-sans text-2xl sm:text-3xl text-[#c79c6e] font-bold leading-tight">
                  Everything. Because how you do anything is how you do everything.
                </p>

                <p className="font-sans text-base sm:text-lg text-white/80 leading-relaxed">
                  <span className="text-lg sm:text-xl font-bold text-white block mb-1">In business and negotiations:</span> Clients stop hesitating and start saying yes because they feel your conviction. In leadership, teams look to you during turbulence because <strong className="text-white font-bold">your calm is contagious</strong>. In personal relationships, your partner feels safe and deeply connected because you are genuinely in the room with them—listening with your entire being.
                </p>

                <p className="font-sans text-xl sm:text-2xl text-white font-bold leading-snug">
                  You stop living in anticipation of the next catastrophe and start living in absolute command of the present moment.
                </p>

                <p className="font-sans text-xs sm:text-sm text-white/45 leading-relaxed">
                  *The Better Man curriculum is intentionally built without generic fluff. Every lesson and framework is distilled from over 10 years of intensive 1-on-1 coaching with top executives and high-performing leaders.*
                </p>
              </div>

              {/* ─── PART 5 ─── */}
              <div className="space-y-6 pb-6">
                <span className="block text-[0.65rem] font-sans font-semibold uppercase tracking-[0.25em] text-[#c79c6e]">
                  PART V · THE THRESHOLD
                </span>

                <h3 className="font-serif text-3xl sm:text-4xl md:text-5xl text-white font-normal leading-tight">
                  The standard you walk past is <span className="text-[#c79c6e] font-bold">the standard you accept.</span>
                </h3>

                <p className="font-sans text-2xl sm:text-3xl text-white font-bold leading-snug">
                  Another year of reactive living, silent frustration, and untapped potential is too high a price to pay.
                </p>

                <p className="font-sans text-base sm:text-lg text-white/75 leading-relaxed">
                  <span className="text-lg sm:text-xl font-bold text-white block mb-1">You are here for a reason:</span> Something in you knows that your current trajectory does not match your true capacity. You know that talent and hard work without presence will always leave you feeling undervalued. <strong className="text-white font-bold">The tools to re-architect your presence, communication, and emotional grounding exist.</strong> The blueprint is ready.
                </p>

                <p className="font-serif text-2xl sm:text-3xl text-[#c79c6e] italic font-normal leading-snug pl-5 border-l-2 border-[#c79c6e] my-4">
                  "The version of you that commands respect without demanding it is waiting on the other side of this decision."
                </p>

                <p className="font-sans text-sm sm:text-base text-white/60 leading-normal font-medium">
                  Click <strong className="text-white font-bold">{isLoggedIn ? 'Enroll Now' : 'Register Now'}</strong> above to begin your journey immediately.
                </p>
              </div>

            </div>
          </section>

          <div className="w-full max-w-6xl mx-auto px-6"><div className="h-[1px] bg-gradient-to-r from-transparent via-white/10 to-transparent" /></div>

          {/* ─── WHAT YOU'LL LEARN ──────────────────────────────────── */}
          <section className="py-24 px-6 max-w-6xl mx-auto w-full">
            <div className="text-center mb-16">
              <p className="font-sans text-[0.6rem] uppercase tracking-[0.4em] text-[#c79c6e] mb-3">The Curriculum</p>
              <h2 className="font-serif text-4xl md:text-5xl text-white">What you will master</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                { title: 'The Foundation of Presence', desc: 'Discover how to anchor yourself in any high-pressure situation with calm, unshakeable energy.' },
                { title: 'Breaking Reactive Patterns', desc: 'Identify and dissolve the emotional triggers that cause you to react instead of respond.' },
                { title: 'Magnetic Communication', desc: 'Develop a voice and language that people naturally lean toward and remember.' },
                { title: 'Non-Verbal Mastery', desc: 'Harness the 93% of communication that happens without words — posture, eye contact, space.' },
                { title: 'Leadership from Within', desc: 'Stop performing authority and start embodying it — people will follow without being asked.' },
                { title: 'Emotional Sovereignty', desc: 'Condition your nervous system to stay laser-focused, composed, and mentally sharp under extreme stress.' },
                { title: 'Executive Gravitas & Charisma', desc: 'Command high-stakes rooms and social dynamics with effortless poise, vocal resonance, and respect.' },
                { title: 'The Ripple Effect', desc: 'Turn your internal transformation into lasting impact on every relationship and environment.' },
              ].map((item, i) => (
                <div key={i} className="flex gap-4 p-6 rounded-2xl border border-white/[0.08] bg-[#0a0a0a] hover:border-[#c79c6e]/20 transition-colors group">
                  <CheckCircle size={22} weight="fill" className="text-[#c79c6e] shrink-0 mt-0.5" />
                  <div>
                    <h3 className="font-sans font-semibold text-white text-sm mb-1 group-hover:text-[#c79c6e] transition-colors">{item.title}</h3>
                    <p className="font-sans text-xs text-white/50 leading-relaxed">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <div className="w-full max-w-6xl mx-auto px-6"><div className="h-[1px] bg-gradient-to-r from-transparent via-white/10 to-transparent" /></div>

          {/* ─── FAQ SECTION ─────────────────────────────────────────── */}
          <section id="faq" className="py-24 px-6 max-w-4xl mx-auto w-full">
            <div className="text-center mb-16">
              <p className="font-sans text-[0.6rem] uppercase tracking-[0.4em] text-[#c79c6e] mb-3">Frequently Asked Questions</p>
              <h2 className="font-serif text-4xl md:text-5xl text-white">Everything you need to know</h2>
            </div>
            <div className="flex flex-col gap-4">
              {[
                { q: 'How long do I have access to the course materials?', a: 'You get lifetime access to all masterclass modules, downloadable resources, and all future updates with no recurring charges.' },
                { q: 'How do the 3 free coaching sessions work?', a: 'Once enrolled, you can book your private 1-on-1 sessions directly with Aarkesh through your course profile dashboard.' },
                { q: 'What format is the course delivered in?', a: 'High-definition on-demand video masterclasses with actionable workbooks, downloadable frameworks, and direct 1-on-1 coaching.' },
                { q: 'Is this course beginner-friendly?', a: 'Absolutely. The framework starts from the fundamental psychology of presence and builds step-by-step toward advanced leadership and magnetism.' }
              ].map((faq, fi) => (
                <div key={fi} className="border border-white/10 rounded-2xl bg-[#0a0a0a] p-6 hover:border-[#c79c6e]/30 transition-colors">
                  <h3 className="font-serif text-lg text-white mb-2">{faq.q}</h3>
                  <p className="font-sans text-xs md:text-sm text-white/60 leading-relaxed">{faq.a}</p>
                </div>
              ))}
            </div>
          </section>

          {/* ─── FULL-WIDTH FOOTER ──────────────────────────────────────── */}
          <footer className="w-full bg-[#080808] border-t border-white/10 pt-16 pb-12 px-6 sm:px-10 md:px-16 lg:px-20 relative z-20 overflow-hidden">
            {/* Ambient background glow */}
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[800px] h-[300px] bg-[#c79c6e]/8 rounded-full blur-[160px] pointer-events-none" />

            <div className="max-w-7xl mx-auto w-full flex flex-col gap-12 relative z-10">
              
              {/* Main Top Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-start">
                
                {/* Left Brand Column (lg:col-span-4) */}
                <div className="lg:col-span-4 flex flex-col items-start gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-[#c79c6e]/15 border border-[#c79c6e]/30 flex items-center justify-center text-[#c79c6e]">
                      <Sparkle size={22} weight="fill" />
                    </div>
                    <div className="flex flex-col">
                      <span className="font-serif text-2xl text-white font-medium tracking-tight">
                        BetterWith<span className="text-[#c79c6e]">Aarkesh</span>
                      </span>
                      <span className="font-sans text-[0.6rem] uppercase tracking-[0.25em] text-[#c79c6e]/80 font-semibold">
                        Course &amp; Masterclass
                      </span>
                    </div>
                  </div>

                  <p className="font-sans text-xs text-white/50 leading-relaxed max-w-sm">
                    A transformative self-mastery experience designed to help ambitious individuals break reactive cycles, cultivate deep presence, and lead with quiet confidence.
                  </p>

                  {/* Universal Social Icons */}
                  <div className="flex items-center gap-2.5 pt-1 flex-wrap">
                    {socialLinks.length > 0 ? (
                      socialLinks.map((s) => (
                        <a 
                          key={s._id || s.platform}
                          href={s.url} 
                          target="_blank" 
                          rel="noopener noreferrer" 
                          className="w-9 h-9 rounded-lg bg-white/5 border border-white/10 hover:border-[#c79c6e]/40 hover:bg-[#c79c6e]/10 text-white/60 hover:text-[#c79c6e] flex items-center justify-center transition-all"
                          aria-label={s.label || s.platform}
                          title={s.label || s.platform}
                        >
                          {renderSocialIcon(s.platform, 16)}
                        </a>
                      ))
                    ) : (
                      <>
                        <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="w-9 h-9 rounded-lg bg-white/5 border border-white/10 hover:border-[#c79c6e]/40 hover:bg-[#c79c6e]/10 text-white/60 hover:text-[#c79c6e] flex items-center justify-center transition-all" aria-label="X">
                          <XLogo size={16} />
                        </a>
                        <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="w-9 h-9 rounded-lg bg-white/5 border border-white/10 hover:border-[#c79c6e]/40 hover:bg-[#c79c6e]/10 text-white/60 hover:text-[#c79c6e] flex items-center justify-center transition-all" aria-label="Instagram">
                          <InstagramLogo size={16} />
                        </a>
                        <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" className="w-9 h-9 rounded-lg bg-white/5 border border-white/10 hover:border-[#c79c6e]/40 hover:bg-[#c79c6e]/10 text-white/60 hover:text-[#c79c6e] flex items-center justify-center transition-all" aria-label="LinkedIn">
                          <LinkedinLogo size={16} />
                        </a>
                      </>
                    )}
                  </div>
                </div>

                {/* Right Columns: Navigation, Legal & Support (lg:col-span-8) */}
                <div className="lg:col-span-8 grid grid-cols-2 sm:grid-cols-3 gap-8 sm:gap-10">
                  
                  {/* Column 1: Course Navigation */}
                  <div className="flex flex-col gap-3.5 text-left">
                    <h4 className="font-sans text-[0.7rem] uppercase tracking-[0.2em] text-[#c79c6e] font-semibold">
                      Course
                    </h4>
                    <ul className="flex flex-col gap-2.5 font-sans text-xs">
                      <li>
                        <button
                          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                          className="text-white/50 hover:text-white transition-colors text-left"
                        >
                          The Better Man™
                        </button>
                      </li>
                      <li>
                        <button
                          onClick={() => {
                            if (isLoggedIn && isPurchased) {
                              setShowDashboard(true);
                            } else {
                              setShowCourseLogin(true);
                            }
                          }}
                          className="text-white/50 hover:text-[#c79c6e] transition-colors text-left"
                        >
                          {isLoggedIn ? (isPurchased ? 'My Dashboard' : 'Student Area') : 'Student Login'}
                        </button>
                      </li>
                      <li>
                        <a
                          href="#curriculum"
                          onClick={(e) => {
                            e.preventDefault();
                            document.getElementById('curriculum')?.scrollIntoView({ behavior: 'smooth' });
                          }}
                          className="text-white/50 hover:text-white transition-colors text-left"
                        >
                          Curriculum
                        </a>
                      </li>
                      <li>
                        <a
                          href="#faq"
                          onClick={(e) => {
                            e.preventDefault();
                            document.getElementById('faq')?.scrollIntoView({ behavior: 'smooth' });
                          }}
                          className="text-white/50 hover:text-white transition-colors text-left"
                        >
                          Course FAQ
                        </a>
                      </li>
                      <li>
                        <Link
                          to="/"
                          className="text-[#c79c6e]/80 hover:text-[#c79c6e] transition-colors text-left inline-flex items-center gap-1"
                        >
                          <span>1:1 Coaching Portal</span>
                          <span>→</span>
                        </Link>
                      </li>
                    </ul>
                  </div>

                  {/* Column 2: Legal & Policies */}
                  <div className="flex flex-col gap-3.5 text-left">
                    <h4 className="font-sans text-[0.7rem] uppercase tracking-[0.2em] text-[#c79c6e] font-semibold">
                      Legal &amp; Policy
                    </h4>
                    <ul className="flex flex-col gap-2.5 font-sans text-xs">
                      {courseDocuments.length > 0 ? (
                        courseDocuments.map((doc) => (
                          <li key={doc.slug || doc._id}>
                            <button
                              onClick={() => setActivePolicySlug(doc.slug)}
                              className="text-white/50 hover:text-[#c79c6e] transition-colors text-left cursor-pointer"
                            >
                              {doc.title}
                            </button>
                          </li>
                        ))
                      ) : (
                        <>
                          <li>
                            <button onClick={() => setActivePolicySlug('course-terms-and-conditions')} className="text-white/50 hover:text-white transition-colors text-left">
                              Terms &amp; Conditions
                            </button>
                          </li>
                          <li>
                            <button onClick={() => setActivePolicySlug('course-privacy-policy')} className="text-white/50 hover:text-white transition-colors text-left">
                              Privacy Policy
                            </button>
                          </li>
                          <li>
                            <button onClick={() => setActivePolicySlug('course-refund-policy')} className="text-white/50 hover:text-white transition-colors text-left">
                              Refund Policy
                            </button>
                          </li>
                          <li>
                            <button onClick={() => setActivePolicySlug('course-shipping-policy')} className="text-white/50 hover:text-white transition-colors text-left">
                              Shipping Policy
                            </button>
                          </li>
                        </>
                      )}
                    </ul>
                  </div>

                  {/* Column 3: Support & Verification */}
                  <div className="col-span-2 sm:col-span-1 flex flex-col gap-3.5 text-left">
                    <h4 className="font-sans text-[0.7rem] uppercase tracking-[0.2em] text-[#c79c6e] font-semibold">
                      Support Desk
                    </h4>
                    <div className="flex flex-col gap-2.5 font-sans text-xs text-white/50">
                      <p className="leading-relaxed">
                        Need assistance with your enrollment or account?
                      </p>
                      <a
                        href="mailto:support@betterwithaarkesh.com"
                        className="text-[#c79c6e] hover:underline font-medium break-all"
                      >
                        support@betterwithaarkesh.com
                      </a>
                      <div className="pt-2 text-[0.68rem] text-white/40 space-y-1">
                        <p>✓ 100% Digital Delivery</p>
                        <p>✓ Razorpay 256-bit SSL Security</p>
                      </div>
                    </div>
                  </div>

                </div>

              </div>

              {/* Bottom Bar: Copyright & Quick Links */}
              <div className="pt-8 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-sans text-white/40">
                <p className="text-[0.7rem]">
                  &copy; {new Date().getFullYear()} Better With Aarkesh. All rights reserved.
                </p>
                <div className="flex items-center gap-4 text-[0.68rem]">
                  <Link to="/course-terms-and-conditions" className="hover:text-white transition-colors">Terms</Link>
                  <span>•</span>
                  <Link to="/course-privacy-policy" className="hover:text-white transition-colors">Privacy</Link>
                  <span>•</span>
                  <Link to="/course-refund-policy" className="hover:text-white transition-colors">Refunds</Link>
                  <span>•</span>
                  <Link to="/course-shipping-policy" className="hover:text-white transition-colors">Shipping</Link>
                </div>
              </div>

            </div>
          </footer>
        </>
      )}

      {/* ─── MODALS ──────────────────────────────────────────────── */}

      {/* 2-Column Minimal Glassmorphic Pricing Modal */}
      {showPricingModal && (
        <div className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-xl overflow-y-auto overscroll-contain p-3 sm:p-6 flex flex-col items-center justify-start sm:justify-center animate-in fade-in duration-200">
          {/* Background Ambient Glow */}
          <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[650px] h-[650px] bg-[#c79c6e]/12 rounded-full blur-[160px] pointer-events-none" />

          {/* Minimal Glassmorphic Modal Dialog Box */}
          <div className="relative w-full max-w-4xl rounded-2xl sm:rounded-3xl border border-[#c79c6e]/35 bg-[#0c0c0c] shadow-[0_25px_90px_rgba(0,0,0,0.95)] p-4 sm:p-8 my-4 sm:my-auto text-left">
            
            {/* Top Close Button */}
            <button 
              type="button"
              onClick={() => setShowPricingModal(false)} 
              className="absolute right-3.5 top-3.5 sm:right-6 sm:top-6 z-30 w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-white/10 border border-white/15 hover:bg-white/20 text-white/70 hover:text-white flex items-center justify-center transition-all cursor-pointer"
              title="Close modal"
            >
              <X size={17} />
            </button>

            {/* Modal Header */}
            <div className="pr-10 mb-3">
              <span className="font-sans text-[10px] uppercase tracking-[0.25em] text-[#c79c6e] font-semibold block mb-1">
                MASTERCLASS ACCESS
              </span>
              <h3 className="font-serif text-xl sm:text-3xl text-white font-normal tracking-tight">
                The Better Man™
              </h3>
            </div>

            <p className="font-sans text-xs sm:text-sm text-white/70 leading-relaxed mb-5">
              A transformative masterclass journey to master authentic presence, magnetic communication, and quiet confidence that commands every room.
            </p>

            {/* Grid Layout: Pricing Card & Features */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 lg:gap-8 items-start">
              
              {/* ─── PRICING CARD (Placed First on Mobile, Right on Desktop) ─── */}
              <div className="order-1 lg:order-2 lg:col-span-5 rounded-2xl border border-[#c79c6e]/40 bg-[#12100d] p-4 sm:p-6 shadow-2xl">
                <span className="font-sans text-[10px] uppercase tracking-[0.25em] text-[#c79c6e] font-semibold block mb-1">
                  ONE-TIME ENROLLMENT
                </span>
                
                <div className="flex items-baseline gap-2.5 mb-1">
                  <span className="font-sans text-3xl sm:text-4xl font-bold text-[#c79c6e] tracking-tight">
                    ₹{basePrice.toLocaleString('en-IN')}
                  </span>
                  {comparePrice > basePrice && (
                    <span className="font-sans text-xs sm:text-sm text-white/35 line-through">
                      ₹{comparePrice.toLocaleString('en-IN')}
                    </span>
                  )}
                </div>

                <p className="font-sans text-[11px] text-white/60 mb-3.5">
                  {gstRate > 0 && !isGstIncluded
                    ? `+ ${gstRate}% GST (₹${gstAmount.toLocaleString('en-IN')}) at checkout · No recurring charges`
                    : gstRate > 0 && isGstIncluded
                    ? `Inclusive of all taxes (${gstRate}% GST) · No recurring charges`
                    : 'Zero GST tax · No recurring charges'}
                </p>

                <div className="p-3 rounded-xl bg-white/[0.04] border border-white/10 mb-3.5 space-y-1.5 text-xs font-sans text-white/80">
                  <div className="flex items-center justify-between">
                    <span>Course Masterclass:</span>
                    <span className="font-semibold text-white">Included</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>3 Private 1-on-1 Calls:</span>
                    <span className="font-semibold text-[#c79c6e]">FREE</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Validity:</span>
                    <span className="font-semibold text-white">Lifetime Access</span>
                  </div>
                </div>

                {/* Glassmorphic CTA Button */}
                <button
                  type="button"
                  onClick={handlePurchase}
                  className="w-full rounded-xl bg-gradient-to-r from-[#c79c6e] via-[#dfb98f] to-[#c79c6e] hover:brightness-110 text-black px-4 py-3.5 font-sans text-xs sm:text-sm font-bold uppercase tracking-[0.18em] transition-all hover:scale-[1.01] active:scale-[0.99] shadow-[0_0_30px_rgba(199,156,110,0.3)] flex items-center justify-center gap-2 cursor-pointer mb-3"
                >
                  <span>PROCEED TO CHECKOUT</span>
                  <ArrowRight size={16} weight="bold" className="text-black" />
                </button>

                {/* Trust Strip */}
                <div className="space-y-1.5 pt-3 border-t border-white/10 text-white/60 text-[11px] font-sans">
                  <div className="flex items-center gap-2">
                    <LockKey size={14} className="text-[#c79c6e]" />
                    <span>256-Bit SSL Encrypted Checkout</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Lightning size={14} className="text-[#c79c6e]" />
                    <span>Instant Lifetime Access</span>
                  </div>
                </div>
              </div>

              {/* ─── FEATURES & WHAT'S INCLUDED (Placed Second on Mobile, Left on Desktop) ─── */}
              <div className="order-2 lg:order-1 lg:col-span-7 space-y-3 pb-2">
                <div className="text-[0.65rem] sm:text-[0.7rem] uppercase tracking-[0.25em] text-[#c79c6e] font-semibold font-sans">
                  WHAT'S INCLUDED
                </div>

                <div className="space-y-3">
                  {/* Item 1 */}
                  <div className="flex items-start gap-3 bg-white/[0.02] sm:bg-transparent p-3 sm:p-0 rounded-xl border border-white/5 sm:border-0">
                    <div className="w-8 h-8 rounded-full border border-[#c79c6e]/30 bg-white/[0.04] flex items-center justify-center text-[#c79c6e] shrink-0 mt-0.5">
                      <Play size={14} weight="fill" />
                    </div>
                    <div>
                      <h4 className="font-sans text-xs sm:text-sm font-medium text-white leading-tight">
                        Full Masterclass Video Access
                      </h4>
                      <p className="font-sans text-[11px] text-white/60 mt-0.5 leading-relaxed">
                        Self-paced HD video frameworks on mental clarity, posture &amp; gravitas
                      </p>
                    </div>
                  </div>

                  {/* Item 2 */}
                  <div className="flex items-start gap-3 bg-white/[0.02] sm:bg-transparent p-3 sm:p-0 rounded-xl border border-white/5 sm:border-0">
                    <div className="w-8 h-8 rounded-full border border-[#c79c6e]/30 bg-white/[0.04] flex items-center justify-center text-[#c79c6e] shrink-0 mt-0.5">
                      <Users size={14} />
                    </div>
                    <div>
                      <h4 className="font-sans text-xs sm:text-sm font-medium text-white leading-tight">
                        3 Free 1-on-1 Private Coaching Sessions with Aarkesh
                      </h4>
                      <p className="font-sans text-[11px] text-white/60 mt-0.5 leading-relaxed">
                        Direct personalized strategy and tailored breakthrough guidance
                      </p>
                    </div>
                  </div>

                  {/* Item 3 */}
                  <div className="flex items-start gap-3 bg-white/[0.02] sm:bg-transparent p-3 sm:p-0 rounded-xl border border-white/5 sm:border-0">
                    <div className="w-8 h-8 rounded-full border border-[#c79c6e]/30 bg-white/[0.04] flex items-center justify-center text-[#c79c6e] shrink-0 mt-0.5">
                      <FileText size={14} />
                    </div>
                    <div>
                      <h4 className="font-sans text-xs sm:text-sm font-medium text-white leading-tight">
                        Actionable Workbooks &amp; Mindset Guides
                      </h4>
                      <p className="font-sans text-[11px] text-white/60 mt-0.5 leading-relaxed">
                        Practical, downloadable templates for immediate implementation
                      </p>
                    </div>
                  </div>

                  {/* Item 4 */}
                  <div className="flex items-start gap-3 bg-white/[0.02] sm:bg-transparent p-3 sm:p-0 rounded-xl border border-white/5 sm:border-0">
                    <div className="w-8 h-8 rounded-full border border-[#c79c6e]/30 bg-white/[0.04] flex items-center justify-center text-[#c79c6e] shrink-0 mt-0.5">
                      <ShieldCheck size={14} weight="fill" />
                    </div>
                    <div>
                      <h4 className="font-sans text-xs sm:text-sm font-medium text-white leading-tight">
                        Verified Certificate of Completion
                      </h4>
                      <p className="font-sans text-[11px] text-white/60 mt-0.5 leading-relaxed">
                        Plus exclusive access to our private community
                      </p>
                    </div>
                  </div>
                </div>
              </div>

            </div>

          </div>
        </div>
      )}

      <AuthModal
        showCourseLogin={showCourseLogin}
        setShowCourseLogin={setShowCourseLogin}
        isForgotPassword={isForgotPassword}
        setIsForgotPassword={setIsForgotPassword}
        isForgotOtpStep={isForgotOtpStep}
        handleAuthSubmit={handleAuthSubmit}
        isOtpStep={isOtpStep}
        loginMode={loginMode}
        setLoginMode={setLoginMode}
        fullName={fullName}
        setFullName={setFullName}
        email={email}
        setEmail={setEmail}
        phoneNumber={phoneNumber}
        setPhoneNumber={setPhoneNumber}
        password={password}
        setPassword={setPassword}
        confirmPassword={confirmPassword}
        setConfirmPassword={setConfirmPassword}
        showPassword={showPassword}
        setShowPassword={setShowPassword}
        otpValues={otpValues}
        otpRefs={otpRefs}
        handleOtpChange={handleOtpChange}
        handleOtpKeyDown={handleOtpKeyDown}
        error={error}
        setError={setError}
        isLoading={isLoading}
        handleToggleMode={handleToggleMode}
      />
      <CheckoutOverlay
        showCheckout={showCheckout}
        setShowCheckout={handleCloseCheckout}
        checkoutAgreed={checkoutAgreed}
        setCheckoutAgreed={setCheckoutAgreed}
        handlePayment={handlePayment}
        isLoading={isLoading}
        error={error}
        courseData={courseData}
        onOpenTerms={() => {
          const termsDoc = courseDocuments.find(d => 
            (d.slug && (d.slug.toLowerCase().includes('term') || d.slug.toLowerCase().includes('condition'))) ||
            (d.title && (d.title.toLowerCase().includes('term') || d.title.toLowerCase().includes('condition')))
          );
          setActivePolicySlug(termsDoc?.slug || 'course-terms-and-conditions');
        }}
      />

      {/* Course Policy / T&C Modal for instant viewing with Allow & Deny actions */}
      <PolicyModal
        isOpen={!!activePolicySlug}
        onClose={() => setActivePolicySlug(null)}
        slug={activePolicySlug}
        title="Terms & Conditions"
        showActions={true}
        onAgree={() => {
          setCheckoutAgreed(true);
          setActivePolicySlug(null);
        }}
        onDecline={() => {
          setCheckoutAgreed(false);
          setActivePolicySlug(null);
        }}
      />

      {/* ─── PRE-REGISTRATION CONFIRMATION MODAL ─── */}
      {showPreRegSuccessModal && (
        <div className="fixed inset-0 z-[120] bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="relative w-full max-w-md rounded-2xl sm:rounded-3xl border border-amber-500/40 bg-[#0c0c0c] p-6 sm:p-8 shadow-[0_20px_70px_rgba(0,0,0,0.9),0_0_40px_rgba(245,158,11,0.15)] text-center space-y-5 animate-in fade-in zoom-in-95 duration-200">
            <button
              type="button"
              onClick={() => setShowPreRegSuccessModal(false)}
              className="absolute right-4 top-4 w-8 h-8 rounded-full bg-white/5 border border-white/10 text-white/60 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
              title="Close modal"
            >
              <X size={16} />
            </button>

            <div className="w-16 h-16 mx-auto rounded-full bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400 shadow-inner">
              <CheckCircle size={34} weight="fill" />
            </div>

            <div className="space-y-2">
              <span className="text-[10px] uppercase tracking-[0.25em] text-[#c79c6e] font-semibold block">
                REGISTRATION CONFIRMED
              </span>
              <h3 className="font-serif text-2xl sm:text-3xl text-white font-normal">
                You're Registered!
              </h3>
              <p className="font-sans text-xs sm:text-sm text-white/65 leading-relaxed max-w-sm mx-auto">
                You will be able to see the course once it is live.
              </p>
            </div>

            <button
              type="button"
              onClick={() => setShowPreRegSuccessModal(false)}
              className="w-full py-3.5 rounded-xl bg-[#c79c6e] hover:bg-[#b0885e] text-black font-semibold text-xs uppercase tracking-wider transition-all cursor-pointer shadow-lg shadow-[#c79c6e]/20 active:scale-[0.99]"
            >
              Got It
            </button>
          </div>
        </div>
      )}
    </main>
  );
}

// ─── NAVBAR ─────────────────────────────────────────────────────
function CourseNavbar({ isLoggedIn, isPurchased, showDashboard, setShowDashboard, profileMenuRef, showProfileMenu, setShowProfileMenu, handleLogout, setShowCourseLogin }) {
  return (
    <header className="flex-none h-[66px] sm:h-[76px] border-b border-white/10 bg-[#070707]/95 backdrop-blur-xl px-3.5 sm:px-6 md:px-12 flex items-center justify-between z-50 sticky top-0 w-full max-w-full">
      <div 
        onClick={() => isPurchased ? setShowDashboard(!showDashboard) : null}
        className="font-serif text-lg sm:text-2xl text-white tracking-tight flex items-center hover:opacity-90 transition-opacity select-none cursor-pointer shrink-0"
      >
        BetterWith<span className="text-[#c79c6e]">Aarkesh</span>
      </div>

      <div className="flex items-center gap-2 sm:gap-3 md:gap-4 shrink-0">
        {isPurchased && (
          <button
            type="button"
            onClick={() => setShowDashboard(!showDashboard)}
            className="hidden sm:flex text-[10px] sm:text-[0.65rem] font-sans font-semibold uppercase tracking-[0.15em] sm:tracking-[0.18em] px-2.5 sm:px-4 py-2 sm:py-2.5 rounded-lg border border-[#c79c6e]/40 text-[#c79c6e] hover:bg-[#c79c6e] hover:text-black transition-all items-center gap-1.5 shadow-[0_0_20px_rgba(199,156,110,0.1)] whitespace-nowrap"
          >
            {showDashboard ? 'OVERVIEW' : 'WATCH'}
          </button>
        )}

        <Link
          to="/"
          className="hidden sm:flex text-[10px] sm:text-[0.65rem] font-sans font-semibold uppercase tracking-[0.15em] sm:tracking-[0.18em] px-2.5 sm:px-3.5 py-2 sm:py-2.5 rounded-lg border border-white/10 text-white/75 hover:bg-white/10 hover:text-white transition-all items-center gap-1.5 whitespace-nowrap"
          title="Back to Coaching Portal"
        >
          <ArrowLeft size={13} weight="bold" />
          <span className="hidden xs:inline sm:inline">COACHING</span>
        </Link>

        {isLoggedIn ? (
          <div className="relative" ref={profileMenuRef}>
            <button
              type="button"
              onClick={() => setShowProfileMenu(!showProfileMenu)}
              className="w-9 h-9 sm:w-10 sm:h-10 rounded-full border border-[#c79c6e]/40 bg-[#111] flex items-center justify-center text-[#c79c6e] hover:bg-[#c79c6e] hover:text-black transition-all shadow-[0_0_20px_rgba(199,156,110,0.15)] shrink-0 cursor-pointer"
              title="Student Profile"
            >
              <User size={17} weight="bold" />
            </button>
            {showProfileMenu && (
              <div className="absolute right-0 mt-3 w-48 rounded-xl border border-white/10 bg-[#0a0a0a] shadow-2xl py-2 z-[100] overflow-hidden">
                <Link
                  to="/course/profile"
                  onClick={() => setShowProfileMenu(false)}
                  className="w-full px-5 py-3 text-left font-sans text-sm text-white/80 hover:text-white hover:bg-white/5 transition-colors flex items-center gap-3 border-b border-white/5"
                >
                  <User size={18} className="text-[#c79c6e]" /> Profile
                </Link>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="w-full px-5 py-3 text-left font-sans text-sm text-red-400 hover:bg-white/5 transition-colors flex items-center gap-3"
                >
                  <SignOut size={18} /> Log Out
                </button>
              </div>
            )}
          </div>
        ) : (
          <button
            type="button"
            className="text-[11px] sm:text-xs font-sans font-semibold uppercase tracking-[0.15em] sm:tracking-[0.2em] px-3.5 sm:px-6 py-2 sm:py-2.5 rounded-lg border border-[#c79c6e]/40 text-[#c79c6e] hover:bg-[#c79c6e] hover:text-black transition-all flex items-center gap-1.5 shadow-[0_0_20px_rgba(199,156,110,0.1)] whitespace-nowrap shrink-0 cursor-pointer"
            onClick={() => setShowCourseLogin(true)}
          >
            <User size={14} weight="bold" />
            <span>LOGIN</span>
          </button>
        )}
      </div>
    </header>
  );
}

// ─── AUTH MODAL ─────────────────────────────────────────────────
function AuthModal({
  showCourseLogin,
  setShowCourseLogin,
  isForgotPassword,
  setIsForgotPassword,
  isForgotOtpStep,
  handleAuthSubmit,
  isOtpStep,
  loginMode,
  setLoginMode,
  fullName,
  setFullName,
  email,
  setEmail,
  phoneNumber,
  setPhoneNumber,
  password,
  setPassword,
  confirmPassword,
  setConfirmPassword,
  showPassword,
  setShowPassword,
  otpValues,
  otpRefs,
  handleOtpChange,
  handleOtpKeyDown,
  error,
  setError,
  isLoading,
  handleToggleMode
}) {
  if (!showCourseLogin) return null;

  return (
    <div className="fixed inset-0 z-[120] bg-[#050505] flex flex-col justify-between p-4 sm:p-6 md:p-12 overflow-y-auto overscroll-contain min-h-screen">
      {/* Background Silhouette & Warm Glowing Atmosphere */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <img
          src="/course_hero_bg.jpg"
          alt=""
          className="w-full h-full object-cover object-center md:object-right opacity-35"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[#050505] via-[#050505]/75 to-[#050505]/30" />
        <div className="absolute inset-0 bg-gradient-to-b from-[#050505]/80 via-transparent to-[#050505]" />
        <div className="absolute top-1/2 right-1/4 -translate-y-1/2 w-[450px] h-[450px] bg-[#c79c6e]/15 rounded-full blur-[140px]" />
      </div>

      {/* Top Bar: Brand Logo + Close Button */}
      <div className="w-full max-w-7xl mx-auto flex items-center justify-between relative z-20 shrink-0">
        <div className="flex items-center gap-3">
          {(isForgotPassword || loginMode === 'register') && (
            <button
              onClick={() => {
                if (isForgotPassword) {
                  setIsForgotPassword(false);
                  setIsForgotOtpStep(false);
                } else {
                  setLoginMode('login');
                }
                setError('');
              }}
              className="text-white/60 hover:text-white transition-colors p-1"
              title="Back"
            >
              <ArrowLeft size={20} />
            </button>
          )}
          <span className="font-serif text-xl md:text-2xl tracking-tight text-white select-none">
            BetterWith<span className="text-[#c79c6e]">Aarkesh</span>
          </span>
        </div>
        <button
          onClick={() => setShowCourseLogin(false)}
          className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-white/5 border border-white/10 hover:bg-white/10 text-white/50 hover:text-white flex items-center justify-center transition-all cursor-pointer"
        >
          <X size={18} />
        </button>
      </div>

      {/* Center Content Section (Centered Vertically on Mobile) */}
      <div className="w-full max-w-7xl mx-auto flex-1 flex flex-col md:flex-row items-center justify-center md:justify-between gap-8 md:gap-12 my-auto py-4 sm:py-6 relative z-10">
        {/* Left Side Quotes & Branding (visible on md+) */}
        <div className="hidden md:flex flex-col justify-center max-w-md">
          {isForgotPassword ? (
            <>
              <h2 className="font-serif italic text-3xl lg:text-4xl text-[#F5F2EB] leading-snug font-normal">
                Clarity begins with a single intentional step.
              </h2>
              <div className="w-8 h-[2px] bg-[#c79c6e] my-6"></div>
              <div className="flex flex-col gap-2 font-sans text-[0.65rem] tracking-[0.25em] uppercase text-white/50 font-medium">
                <span>SECURITY</span>
                <span>RESET</span>
                <span>PROGRESS</span>
              </div>
            </>
          ) : loginMode === 'login' ? (
            <>
              <h2 className="font-serif italic text-3xl lg:text-4xl text-[#F5F2EB] leading-snug font-normal">
                Discipline<br />today,<br />extraordinary<br />tomorrow.
              </h2>
              <div className="w-8 h-[2px] bg-[#c79c6e] my-6"></div>
              <div className="flex flex-col gap-2 font-sans text-[0.65rem] tracking-[0.25em] uppercase text-white/50 font-medium">
                <span>LEARN</span>
                <span>APPLY</span>
                <span>GROW</span>
              </div>
            </>
          ) : (
            <>
              <h2 className="font-serif italic text-3xl lg:text-4xl text-[#F5F2EB] leading-snug font-normal">
                A better<br />you starts<br />here.
              </h2>
              <div className="w-8 h-[2px] bg-[#c79c6e] my-6"></div>
              <div className="flex flex-col gap-2 font-sans text-[0.65rem] tracking-[0.25em] uppercase text-white/50 font-medium">
                <span>KNOWLEDGE</span>
                <span>PRESENCE</span>
                <span>CONFIDENCE</span>
              </div>
            </>
          )}
        </div>

        {/* Center Card */}
        <div className="w-full max-w-[460px] rounded-2xl border border-[#c79c6e]/35 bg-[#0a0a0a]/92 backdrop-blur-2xl p-6 md:p-8 shadow-[0_0_60px_rgba(199,156,110,0.14)] relative z-10">
          {/* Card Header */}
          <div className="text-center mb-6">
            <span className="font-sans text-[0.65rem] uppercase tracking-[0.25em] text-[#c79c6e] font-semibold block mb-2">
              {isForgotPassword
                ? isForgotOtpStep
                  ? 'SET NEW PASSWORD'
                  : 'ACCOUNT RECOVERY'
                : isOtpStep
                ? 'VERIFY EMAIL'
                : loginMode === 'login'
                ? 'WELCOME BACK'
                : 'BEGIN YOUR JOURNEY'}
            </span>

            <h1 className="font-serif text-3xl md:text-[2.2rem] text-white font-normal leading-tight mb-2">
              {isForgotPassword
                ? isForgotOtpStep
                  ? 'Reset Password'
                  : 'Forgot Password'
                : isOtpStep
                ? 'Enter Code'
                : loginMode === 'login'
                ? 'Continue Your Journey'
                : 'Create Your Account'}
            </h1>

            <p className="font-sans text-xs text-white/60 leading-relaxed max-w-xs mx-auto">
              {isForgotPassword
                ? isForgotOtpStep
                  ? 'Enter the verification code sent to your email along with your new password.'
                  : 'Enter your registered email address and we will send you an OTP to reset your password.'
                : isOtpStep
                ? `Enter the 4-digit verification code sent to ${email}`
                : loginMode === 'login'
                ? 'Sign in to access your courses, track your progress and unlock your full potential.'
                : 'Join thousands of learners and gain access to exclusive content.'}
            </p>
          </div>

          <form onSubmit={handleAuthSubmit} className="flex flex-col gap-3.5">
            {!isOtpStep && !isForgotOtpStep ? (
              <>
                {/* Full Name for Register */}
                {!isForgotPassword && loginMode === 'register' && (
                  <div className="flex flex-col gap-1.5">
                    <label className="font-sans text-[0.65rem] uppercase tracking-[0.15em] text-white/70 font-semibold">
                      Full Name
                    </label>
                    <div className="flex items-center w-full rounded-lg border border-white/15 bg-white/[0.03] px-3.5 py-3 focus-within:border-[#c79c6e] focus-within:ring-1 focus-within:ring-[#c79c6e]/40 transition-all gap-3">
                      <User size={18} className="text-white/40 shrink-0" />
                      <input
                        type="text"
                        required
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        placeholder="John Doe"
                        className="w-full bg-transparent text-white placeholder-white/25 focus:outline-none font-sans text-sm"
                      />
                    </div>
                  </div>
                )}

                {/* Email Address */}
                <div className="flex flex-col gap-1.5">
                  <label className="font-sans text-[0.65rem] uppercase tracking-[0.15em] text-white/70 font-semibold">
                    Email Address
                  </label>
                  <div className="flex items-center w-full rounded-lg border border-white/15 bg-white/[0.03] px-3.5 py-3 focus-within:border-[#c79c6e] focus-within:ring-1 focus-within:ring-[#c79c6e]/40 transition-all gap-3">
                    <Envelope size={18} className="text-white/40 shrink-0" />
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="john@example.com"
                      className="w-full bg-transparent text-white placeholder-white/25 focus:outline-none font-sans text-sm"
                    />
                  </div>
                </div>

                {/* Password */}
                {!isForgotPassword && (
                  <div className="flex flex-col gap-1.5">
                    <label className="font-sans text-[0.65rem] uppercase tracking-[0.15em] text-white/70 font-semibold">
                      Password
                    </label>
                    <div className="flex items-center w-full rounded-lg border border-white/15 bg-white/[0.03] px-3.5 py-3 focus-within:border-[#c79c6e] focus-within:ring-1 focus-within:ring-[#c79c6e]/40 transition-all gap-3 relative">
                      <LockKey size={18} className="text-white/40 shrink-0" />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full bg-transparent text-white placeholder-white/25 focus:outline-none font-sans text-sm tracking-widest pr-8"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3.5 text-white/40 hover:text-white transition-colors"
                      >
                        {showPassword ? <EyeSlash size={18} /> : <Eye size={18} />}
                      </button>
                    </div>
                  </div>
                )}

                {/* Confirm Password for Register */}
                {!isForgotPassword && loginMode === 'register' && (
                  <div className="flex flex-col gap-1.5">
                    <label className="font-sans text-[0.65rem] uppercase tracking-[0.15em] text-white/70 font-semibold">
                      Confirm Password
                    </label>
                    <div className="flex items-center w-full rounded-lg border border-white/15 bg-white/[0.03] px-3.5 py-3 focus-within:border-[#c79c6e] focus-within:ring-1 focus-within:ring-[#c79c6e]/40 transition-all gap-3 relative">
                      <LockKey size={18} className="text-white/40 shrink-0" />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        required
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full bg-transparent text-white placeholder-white/25 focus:outline-none font-sans text-sm tracking-widest pr-8"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3.5 text-white/40 hover:text-white transition-colors"
                      >
                        {showPassword ? <EyeSlash size={18} /> : <Eye size={18} />}
                      </button>
                    </div>
                  </div>
                )}

                {/* Remember Me & Forgot Password on Login */}
                {!isForgotPassword && loginMode === 'login' && (
                  <div className="flex items-center justify-between pt-1">
                    <label className="flex items-center gap-2 cursor-pointer text-xs text-white/70 select-none group">
                      <input
                        type="checkbox"
                        defaultChecked
                        className="accent-[#c79c6e] rounded w-4 h-4 cursor-pointer"
                      />
                      <span className="group-hover:text-white transition-colors">Remember me</span>
                    </label>
                    <button
                      type="button"
                      onClick={() => {
                        setIsForgotPassword(true);
                        setError('');
                      }}
                      className="text-xs text-[#c79c6e] hover:text-white transition-colors font-medium"
                    >
                      Forgot Password?
                    </button>
                  </div>
                )}
              </>
            ) : (
              /* OTP verification / Forgot Password Reset form */
              <div className="flex flex-col gap-5 py-2">
                <div className="flex justify-between gap-3 my-2">
                  {otpValues.map((digit, index) => (
                    <input
                      key={index}
                      ref={otpRefs[index]}
                      type="text"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => handleOtpChange(index, e.target.value)}
                      onKeyDown={(e) => handleOtpKeyDown(index, e)}
                      className="w-14 h-14 text-center rounded-xl bg-white/[0.04] border border-white/15 text-white font-sans text-2xl font-bold focus:outline-none focus:border-[#c79c6e] focus:ring-1 focus:ring-[#c79c6e] transition-all"
                    />
                  ))}
                </div>

                {isForgotPassword && isForgotOtpStep && (
                  <>
                    <div className="flex flex-col gap-1.5 mt-2">
                      <label className="font-sans text-[0.65rem] uppercase tracking-[0.15em] text-white/70 font-semibold">
                        New Password
                      </label>
                      <div className="flex items-center w-full rounded-lg border border-white/15 bg-white/[0.03] px-3.5 py-3 focus-within:border-[#c79c6e] focus-within:ring-1 focus-within:ring-[#c79c6e]/40 transition-all gap-3 relative">
                        <LockKey size={18} className="text-white/40 shrink-0" />
                        <input
                          type={showPassword ? 'text' : 'password'}
                          required
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          placeholder="••••••••"
                          className="w-full bg-transparent text-white placeholder-white/25 focus:outline-none font-sans text-sm tracking-widest pr-8"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3.5 text-white/40 hover:text-white transition-colors"
                        >
                          {showPassword ? <EyeSlash size={18} /> : <Eye size={18} />}
                        </button>
                      </div>
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <label className="font-sans text-[0.65rem] uppercase tracking-[0.15em] text-white/70 font-semibold">
                        Confirm New Password
                      </label>
                      <div className="flex items-center w-full rounded-lg border border-white/15 bg-white/[0.03] px-3.5 py-3 focus-within:border-[#c79c6e] focus-within:ring-1 focus-within:ring-[#c79c6e]/40 transition-all gap-3 relative">
                        <LockKey size={18} className="text-white/40 shrink-0" />
                        <input
                          type={showPassword ? 'text' : 'password'}
                          required
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          placeholder="••••••••"
                          className="w-full bg-transparent text-white placeholder-white/25 focus:outline-none font-sans text-sm tracking-widest pr-8"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3.5 text-white/40 hover:text-white transition-colors"
                        >
                          {showPassword ? <EyeSlash size={18} /> : <Eye size={18} />}
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            )}

            {error && (
              <div className="p-3 rounded-lg border border-red-500/30 bg-red-500/10 text-red-300 font-sans text-xs text-center mt-1">
                {error}
              </div>
            )}

            {/* Primary Action Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-[#c79c6e] hover:bg-[#b0885e] text-black font-semibold text-xs tracking-[0.2em] uppercase py-3.5 rounded-lg flex items-center justify-center gap-2 shadow-[0_0_30px_rgba(199,156,110,0.25)] hover:scale-[1.01] transition-all disabled:opacity-50 mt-2"
            >
              {isLoading ? (
                'PLEASE WAIT...'
              ) : isForgotPassword ? (
                isForgotOtpStep ? (
                  <>RESET PASSWORD <ArrowRight size={16} weight="bold" /></>
                ) : (
                  <>SEND OTP <ArrowRight size={16} weight="bold" /></>
                )
              ) : isOtpStep ? (
                <>VERIFY & PROCEED <ArrowRight size={16} weight="bold" /></>
              ) : loginMode === 'login' ? (
                <>SIGN IN <ArrowRight size={16} weight="bold" /></>
              ) : (
                <>CREATE ACCOUNT <ArrowRight size={16} weight="bold" /></>
              )}
            </button>

            {/* Bottom Switcher */}
            {(!isOtpStep && !isForgotOtpStep) && (
              <div className="text-center pt-2 text-xs text-white/60">
                {isForgotPassword ? (
                  <button
                    type="button"
                    onClick={() => {
                      setIsForgotPassword(false);
                      setIsForgotOtpStep(false);
                      setError('');
                    }}
                    className="text-[#c79c6e] hover:underline font-medium inline-flex items-center gap-1"
                  >
                    <ArrowLeft size={13} /> Back to Sign In
                  </button>
                ) : loginMode === 'login' ? (
                  <>
                    Don't have an account?{' '}
                    <button
                      type="button"
                      onClick={handleToggleMode}
                      className="text-[#c79c6e] hover:underline font-semibold ml-1 inline-flex items-center gap-1"
                    >
                      Register <ArrowRight size={13} />
                    </button>
                  </>
                ) : (
                  <>
                    Already have an account?{' '}
                    <button
                      type="button"
                      onClick={handleToggleMode}
                      className="text-[#c79c6e] hover:underline font-semibold ml-1 inline-flex items-center gap-1"
                    >
                      Sign in <ArrowRight size={13} />
                    </button>
                  </>
                )}
              </div>
            )}
          </form>
        </div>
      </div>

      {/* Bottom Minimal Footer (Anchor for vertical balance) */}
      <div className="w-full max-w-7xl mx-auto flex items-center justify-center pt-2 relative z-20 text-[0.65rem] text-white/30 font-sans tracking-wider shrink-0 select-none">
        <span>&copy; {new Date().getFullYear()} Better With Aarkesh • Secure Member Access</span>
      </div>
    </div>
  );
}

// ─── CHECKOUT OVERLAY ───────────────────────────────────────────
function CheckoutOverlay({ showCheckout, setShowCheckout, checkoutAgreed, setCheckoutAgreed, handlePayment, isLoading, error, onOpenTerms, courseData }) {
  if (!showCheckout) return null;

  const basePrice = courseData?.price !== undefined ? courseData.price : 15000;
  const gstRate = courseData?.gstRate !== undefined ? courseData.gstRate : 18;
  const isGstIncluded = Boolean(courseData?.isGstIncluded);

  const gstAmount = isGstIncluded
    ? Math.round(basePrice - (basePrice / (1 + (gstRate / 100))))
    : Math.round((basePrice * gstRate) / 100);

  const baseBeforeGst = isGstIncluded ? basePrice - gstAmount : basePrice;
  const finalPayable = isGstIncluded ? basePrice : basePrice + gstAmount;

  return (
    <div className="fixed inset-0 z-[110] bg-[#050505] flex flex-col justify-between overflow-y-auto min-h-screen">
      {/* Background Ambience & Spotlights */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute -top-32 -left-32 w-[500px] h-[500px] bg-[#c79c6e]/10 rounded-full blur-[150px]" />
        <div className="absolute -top-32 -right-32 w-[500px] h-[500px] bg-[#c79c6e]/10 rounded-full blur-[150px]" />
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[700px] h-[400px] bg-[#c79c6e]/8 rounded-full blur-[160px]" />
      </div>

      {/* Top Bar Navigation */}
      <div className="w-full max-w-5xl mx-auto flex items-center justify-between pt-8 px-6 md:px-10 relative z-20">
        <button
          onClick={() => setShowCheckout(false)}
          className="flex items-center gap-2.5 font-sans text-xs uppercase tracking-[0.2em] text-white/70 hover:text-[#c79c6e] transition-colors"
        >
          <ArrowLeft size={16} /> BACK TO COURSE
        </button>

        <div className="flex items-center gap-2.5 px-3.5 py-1.5 rounded-full bg-white/[0.04] border border-white/10 backdrop-blur-md">
          <ShieldCheck size={16} className="text-[#c79c6e]" />
          <span className="font-sans text-[0.68rem] uppercase tracking-wider text-white/80 font-medium">100% Secure Checkout</span>
        </div>
      </div>

      {/* Center Checkout Card */}
      <div className="w-full max-w-lg mx-auto px-6 py-10 relative z-10 my-auto">
        <div className="text-center mb-8">
          <span className="font-sans text-[0.68rem] uppercase tracking-[0.25em] text-[#c79c6e] font-semibold block mb-2">
            FINAL STEP
          </span>
          <h1 className="font-serif text-3xl md:text-4xl text-white font-normal tracking-tight">
            Checkout Payment
          </h1>
          <p className="font-sans text-xs md:text-sm text-white/60 mt-1.5">
            Complete your enrollment to unlock instant lifetime access.
          </p>
        </div>

        {/* Glassmorphic Payment Summary Card */}
        <div className="rounded-3xl border border-[#c79c6e]/30 bg-[#0c0c0c]/85 backdrop-blur-2xl p-7 md:p-8 shadow-[0_20px_60px_rgba(0,0,0,0.8),0_0_40px_rgba(199,156,110,0.1)]">
          {/* Item Row */}
          <div className="flex items-center gap-4 pb-6 border-b border-white/10">
            <div className="w-16 h-16 rounded-xl overflow-hidden border border-[#c79c6e]/40 bg-black shrink-0 relative shadow-inner">
              <img src="/course_hero_bg.jpg" alt="Course" className="w-full h-full object-cover opacity-90" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent pointer-events-none" />
            </div>
            <div className="flex-1 min-w-0">
              <span className="inline-block px-2 py-0.5 rounded-full bg-[#c79c6e]/15 border border-[#c79c6e]/30 text-[0.65rem] text-[#c79c6e] font-medium tracking-wide uppercase mb-1">
                Full Master Access
              </span>
              <h3 className="font-sans text-sm font-semibold text-white truncate">The Better Man™</h3>
              <p className="font-sans text-xs text-white/60 truncate">All Modules + 3 Coaching Calls + Community</p>
            </div>
          </div>

          {/* Pricing Breakdown */}
          <div className="py-5 space-y-3 border-b border-white/10">
            <div className="flex justify-between items-center text-xs font-sans text-white/70">
              <span>Course Base Fee</span>
              <span className="font-medium text-white">₹{baseBeforeGst.toLocaleString('en-IN')}</span>
            </div>
            <div className="flex justify-between items-center text-xs font-sans text-white/70">
              <div className="flex items-center gap-1.5">
                <span>GST ({gstRate}%)</span>
                {isGstIncluded && <span className="text-[10px] text-white/40">(included)</span>}
                <Info size={13} className="text-white/40" />
              </div>
              <span className="font-medium text-white">₹{gstAmount.toLocaleString('en-IN')}</span>
            </div>
            <div className="flex justify-between items-center pt-2 text-white">
              <div>
                <span className="font-sans text-sm font-bold block text-white">Total Amount Due</span>
                <span className="font-sans text-[0.65rem] text-white/50 block">
                  {isGstIncluded ? `Inclusive of all taxes (${gstRate}% GST)` : `Includes ${gstRate}% GST`}
                </span>
              </div>
              <span className="font-sans text-2xl md:text-3xl font-bold text-[#c79c6e] tracking-tight">₹{finalPayable.toLocaleString('en-IN')}</span>
            </div>
          </div>

          {/* Agreement Checkbox */}
          <div className="pt-5">
            <label className="flex items-start gap-2.5 cursor-pointer mb-5 group select-none">
              <input
                type="checkbox"
                checked={checkoutAgreed}
                onChange={(e) => setCheckoutAgreed(e.target.checked)}
                className="accent-[#c79c6e] rounded w-4 h-4 mt-0.5 cursor-pointer shrink-0"
              />
              <span className="font-sans text-xs text-white/75 leading-relaxed group-hover:text-white transition-colors">
                I agree to the{' '}
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    if (onOpenTerms) onOpenTerms();
                  }}
                  className="underline text-[#c79c6e] font-semibold hover:text-white transition-colors inline"
                >
                  Terms &amp; Conditions
                </button>
                .
              </span>
            </label>

            {error && (
              <div className="text-red-300 font-sans text-xs mb-4 text-center bg-red-500/15 border border-red-500/30 rounded-xl p-2.5">
                {error}
              </div>
            )}

            {/* CTA Button */}
            <button
              type="button"
              onClick={handlePayment}
              disabled={isLoading || !checkoutAgreed}
              className="w-full rounded-xl bg-gradient-to-r from-[#c79c6e] via-[#dfb98f] to-[#c79c6e] hover:brightness-110 disabled:opacity-40 disabled:cursor-not-allowed px-6 py-4 font-sans text-xs font-bold uppercase tracking-[0.2em] text-black transition-all shadow-[0_0_30px_rgba(199,156,110,0.25)] flex items-center justify-center gap-2 hover:scale-[1.01] active:scale-[0.99]"
            >
              <span>{isLoading ? 'PROCESSING...' : `PAY ₹${finalPayable.toLocaleString('en-IN')} & ENROLL NOW`}</span>
              <ArrowRight size={16} weight="bold" />
            </button>

            {/* Security Badges */}
            <div className="flex items-center justify-center gap-4 text-[0.7rem] text-white/50 mt-4 font-sans">
              <div className="flex items-center gap-1.5">
                <LockKey size={13} className="text-[#c79c6e]" />
                <span>256-bit SSL Encrypted</span>
              </div>
              <span className="text-white/20">•</span>
              <span>Razorpay Verified</span>
              <span className="text-white/20">•</span>
              <span>Instant Access</span>
            </div>
          </div>
        </div>
      </div>

      {/* Footer minimal spacing */}
      <div className="pb-6 text-center text-[0.65rem] text-white/30 font-sans relative z-10">
        Better With Aarkesh • Secure Payment Gateway
      </div>
    </div>
  );
}
