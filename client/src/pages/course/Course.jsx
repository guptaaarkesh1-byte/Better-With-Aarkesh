import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Link, useNavigate, useSearchParams, useParams } from 'react-router-dom';
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
import './course-landing.css';

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
  const { slug } = useParams();
  const isDetailPage = Boolean(slug);
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
  const [showSyllabusModal, setShowSyllabusModal] = useState(false);
  const [isNavDarkText, setIsNavDarkText] = useState(false);
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
  const [curriculumCards, setCurriculumCards] = useState([
    { title: 'The Foundation of Presence', description: 'Discover how to anchor yourself in any high-pressure situation with calm, unshakeable energy.' },
    { title: 'Breaking Reactive Patterns', description: 'Identify and dissolve the emotional triggers that cause you to react instead of respond.' },
    { title: 'Magnetic Communication', description: 'Develop a voice and language that people naturally lean toward and remember.' },
    { title: 'Non-Verbal Mastery', description: 'Harness the 93% of communication that happens without words — posture, eye contact, space.' },
    { title: 'Leadership from Within', description: 'Stop performing authority and start embodying it — people will follow without being asked.' },
    { title: 'Emotional Sovereignty', description: 'Condition your nervous system to stay laser-focused, composed, and mentally sharp under extreme stress.' },
    { title: 'Executive Gravitas & Charisma', description: 'Command high-stakes rooms and social dynamics with effortless poise, vocal resonance, and respect.' },
    { title: 'The Ripple Effect', description: 'Turn your internal transformation into lasting impact on every relationship and environment.' },
  ]);
  const [courseFaqs, setCourseFaqs] = useState([
    { question: 'How long do I have access to the course materials?', answer: 'You get lifetime access to all masterclass modules, downloadable resources, and all future updates with no recurring charges.' },
    { question: 'How do the 3 free coaching sessions work?', answer: 'Once enrolled, you can book your private 1-on-1 sessions directly with Aarkesh through your course profile dashboard.' },
    { question: 'What format is the course delivered in?', answer: 'High-definition on-demand video masterclasses with actionable workbooks, downloadable frameworks, and direct 1-on-1 coaching.' },
    { question: 'Is this course beginner-friendly?', answer: 'Absolutely. The framework starts from the fundamental psychology of presence and builds step-by-step toward advanced leadership and magnetism.' },
  ]);

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

    const fetchCurriculumCards = async () => {
      try {
        const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
        const res = await fetch(`${apiUrl}/api/courses/cards/public`);
        if (res.ok) {
          const cardsData = await res.json();
          if (Array.isArray(cardsData) && cardsData.length > 0) {
            setCurriculumCards(cardsData);
          }
        }
      } catch (err) {
        console.error('Failed to fetch curriculum cards:', err);
      }
    };

    const fetchCourseFaqs = async () => {
      try {
        const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
        const res = await fetch(`${apiUrl}/api/courses/faqs/public`);
        if (res.ok) {
          const faqsData = await res.json();
          if (Array.isArray(faqsData) && faqsData.length > 0) {
            setCourseFaqs(faqsData);
          }
        }
      } catch (err) {
        console.error('Failed to fetch course FAQs:', err);
      }
    };

    fetchCourseFooter();
    fetchSocialLinks();
    fetchCurriculumCards();
    fetchCourseFaqs();
  }, []);

  // Dynamically detect when floating navbar crosses light/white sections
  useEffect(() => {
    const handleScroll = () => {
      const lightElements = document.querySelectorAll('.stack-sec, .light-sec, [data-theme="light"], .curriculum-section, footer');
      if (!lightElements || lightElements.length === 0) {
        setIsNavDarkText(false);
        return;
      }
      
      const navCheckLine = 40; // Pixels from top of viewport where navbar buttons sit
      let isDark = false;

      lightElements.forEach((el) => {
        const rect = el.getBoundingClientRect();
        if (rect.top <= navCheckLine && rect.bottom >= navCheckLine) {
          isDark = true;
        }
      });

      setIsNavDarkText(isDark);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('resize', handleScroll, { passive: true });
    handleScroll();
    const timer = setTimeout(handleScroll, 150);

    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleScroll);
      clearTimeout(timer);
    };
  }, [slug]);

  const [pendingCheckout, setPendingCheckout] = useState(false);
  const [activeToc, setActiveToc] = useState('p1');

  const coursesList = useMemo(() => [
    {
      slug: "better-man",
      n: "01",
      chips: ["Calm Authority", "Self-Command"],
      soon: false,
      cls: "",
      title: "The Better Man",
      lede: "Master the psychology of calm authority, magnetic communication and effortless self-command.",
      d: "Calm authority, magnetic communication and self-command, taught in eight modules with three private sessions.",
      sidebarChips: [
        ["Schedule", "Self-Paced"],
        ["Certificate", "Yes"],
        ["Language", "Hinglish / English"],
        ["Mentorship", "1-on-1 Live"]
      ],
      hl: [
        ["Build Real Presence", "(Not Just Theory)"],
        ["3 Private Sessions", "with Aarkesh"]
      ],
      inside: [
        "8 HD video modules & frameworks",
        "Downloadable workbooks and mental models",
        "3 private 1-on-1 coaching sessions with Aarkesh",
        "Lifetime access with all future updates",
        "30-day money-back guarantee"
      ],
      facts: [["8", "Modules"], ["Yes", "Certified"], ["1-on-1", "Coaching"]],
      price: `₹${basePrice.toLocaleString('en-IN')}`,
      was: `₹${comparePrice.toLocaleString('en-IN')}`,
      cta: "Check Course"
    },
    {
      slug: "difficult-people",
      n: "02",
      chips: ["Boundaries", "Conflict"],
      soon: true,
      cls: "v2",
      title: "Difficult People",
      lede: "Stay steady with the boss, partner or parent who pushes every button you have.",
      d: "Stay steady with the boss, partner or parent who pushes every button you have.",
      sidebarChips: [
        ["Schedule", "Self-Paced"],
        ["Certificate", "Yes"],
        ["Language", "Hinglish / English"],
        ["Access", "Lifetime"]
      ],
      hl: [
        ["Hold Your Ground", "(Without a Fight)"],
        ["2 Private Sessions", "with Aarkesh"]
      ],
      inside: [
        "6 HD video modules",
        "Downloadable conflict frameworks",
        "2 private 1-on-1 coaching sessions",
        "Lifetime access",
        "Early-access price for waitlist members"
      ],
      facts: [["6", "Modules"], ["Yes", "Certified"], ["1-on-1", "Coaching"]],
      price: "₹3,999",
      was: "₹7,999",
      cta: "Check Course"
    },
    {
      slug: "decisions",
      n: "03",
      chips: ["Clarity", "Choice"],
      soon: true,
      cls: "v3",
      title: "Decisions",
      lede: "A clear method for the choices you keep putting off, and for living with them once made.",
      d: "A clear method for the choices you keep putting off, and for living with them once made.",
      sidebarChips: [
        ["Schedule", "Self-Paced"],
        ["Certificate", "Yes"],
        ["Language", "Hinglish / English"],
        ["Access", "Lifetime"]
      ],
      hl: [
        ["Decide With Clarity", "(Not Certainty)"],
        ["2 Private Sessions", "with Aarkesh"]
      ],
      inside: [
        "5 HD video modules",
        "Downloadable decision matrix workbooks",
        "2 private 1-on-1 coaching sessions",
        "Lifetime access",
        "Early-access price for waitlist members"
      ],
      facts: [["5", "Modules"], ["Yes", "Certified"], ["1-on-1", "Coaching"]],
      price: "₹3,499",
      was: "₹6,999",
      cta: "Check Course"
    }
  ], [basePrice, comparePrice]);

  const activeCourse = useMemo(() => {
    if (!slug) return coursesList[0];
    return coursesList.find((c) => c.slug === slug) || coursesList[0];
  }, [coursesList, slug]);

  const handleSelectCourse = (c) => {
    navigate(`/course/${c.slug}`);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  useEffect(() => {
    if (showDashboard) return;
    const ids = ['p1', 'p2', 'p3', 'curriculum', 'faq'];
    const elements = ids.map((id) => document.getElementById(id)).filter(Boolean);
    if (!elements.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveToc(entry.target.id);
          }
        });
      },
      { rootMargin: '-20% 0px -70% 0px' }
    );

    elements.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [showDashboard]);

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

  return (
    <div className="course-landing-scope">
      {/* ── Top Fixed Nav ── */}
      <header className={`course-nav ${isNavDarkText ? 'nav-dark-text' : ''}`}>
        <Link className="course-logo" to="/course">
          BetterWith<b>Aarkesh</b>
        </Link>
        <div className="nav-r">
          <Link to="/" className="course-nav-back-btn" title="Back to Main Website">
            <ArrowLeft size={16} weight="bold" />
            <span>Back to Home</span>
          </Link>
          {isPurchased ? (
            <button
              type="button"
              className="sign-in-btn font-semibold"
              onClick={() => setShowDashboard(true)}
            >
              Go to Dashboard →
            </button>
          ) : isLoggedIn ? (
            <div className="relative" ref={profileMenuRef}>
              <button
                type="button"
                onClick={() => setShowProfileMenu(!showProfileMenu)}
                className="course-profile-btn w-9 h-9 rounded-full border border-[#C878BE]/50 bg-[#111] flex items-center justify-center text-[#C878BE] hover:bg-[#C878BE] hover:text-black transition-all shadow-[0_0_20px_rgba(200,120,190,0.2)] shrink-0 cursor-pointer"
                title="Student Profile"
              >
                <User size={16} weight="bold" />
              </button>
              {showProfileMenu && (
                <div className="absolute right-0 mt-3 w-48 rounded-xl border border-white/10 bg-[#0C0C0E] shadow-2xl py-2 z-[100] overflow-hidden text-left">
                  <Link
                    to="/course/profile"
                    onClick={() => setShowProfileMenu(false)}
                    className="w-full px-5 py-3 text-left font-sans text-sm text-white/80 hover:text-white hover:bg-white/5 transition-colors flex items-center gap-3 border-b border-white/5"
                  >
                    <User size={18} className="text-[#C878BE]" /> Profile
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
              className="sign-in-btn"
              onClick={() => {
                setLoginMode('login');
                setShowCourseLogin(true);
              }}
            >
              Sign In
            </button>
          )}
        </div>
      </header>

      <main id="top">
        {!isDetailPage ? (
          /* ═══════════════════════════════════════════════════════════════
             MAIN COURSES LISTING PAGE (/course or /courses)
             ═══════════════════════════════════════════════════════════════ */
          <>
            {/* ── Hero Section ── */}
            <section className="hero">
              <div className="wrap">
                <p className="tag">Learn. Practise. Lead.</p>
                <h1>
                  THE <span className="sel">BETTER</span> MAN
                </h1>
                <p className="sub">
                  Masterclasses in calm authority, magnetic communication and self-command, taught by Aarkesh.
                </p>
                <div className="proof">
                  <span><b>3 private</b> 1-on-1 sessions with Aarkesh</span>
                  <span><b>Lifetime</b> access, no recurring charges</span>
                </div>
                <div>
                  {isPurchased ? (
                    <button type="button" className="btn" onClick={() => setShowDashboard(true)}>
                      Go to Dashboard <span aria-hidden="true">→</span>
                    </button>
                  ) : (
                    <button type="button" className="btn" onClick={handleEnroll}>
                      Register Now <span aria-hidden="true">→</span>
                    </button>
                  )}
                </div>
              </div>
            </section>

            {/* ── Dashboard Metrics Strip ── */}
            <div className="strip">
              <div className="strip-in">
                <div className="stat">
                  <strong>8</strong>
                  <span>video modules with workbooks</span>
                </div>
                <div className="stat">
                  <strong>3</strong>
                  <span>private coaching sessions</span>
                </div>
                <div className="peek">
                  <small>Start with Module 1</small>
                  <b>The Foundation of Presence</b>
                </div>
              </div>
            </div>

            {/* ── More Masterclasses Stacked Section (Directly Below Hero Section) ── */}
            <section className="stack-sec" id="courses">
              <div className="stack">
                <h2>More Masterclasses</h2>
                <p className="lead">Each one is a standalone course with its own private sessions.</p>
                <div id="cards">
                  {coursesList.map((c, i) => {
                    const btnClass = i === 0 ? 'btn dark' : i === 1 ? 'btn light' : 'btn';
                    return (
                      <article className="sc" key={c.n}>
                        <div className={`vis ${c.cls}`} aria-hidden="true">
                          <span className="no">{c.n}</span>
                          <i>{c.chips[0]}</i>
                          <i>{c.chips[1]}</i>
                        </div>
                        <div>
                          {c.soon ? (
                            <span className="soon">Coming soon</span>
                          ) : (
                            <span className="soon">Live now</span>
                          )}
                          <h3>{c.title}</h3>
                          <p className="d">{c.d}</p>
                          <div className="facts">
                            {c.facts.map((f, fi) => (
                              <div key={fi}>
                                <em>{f[0]}</em>
                                <div><b>{f[1]}</b></div>
                              </div>
                            ))}
                          </div>
                          <div className="price">
                            Price <b>{c.price}</b><s>{c.was}</s><small>(+GST)</small>
                          </div>
                          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                            <button
                              type="button"
                              className={btnClass}
                              onClick={() => handleSelectCourse(c)}
                            >
                              Check Course <span aria-hidden="true">→</span>
                            </button>
                            {c.soon ? (
                              <button
                                type="button"
                                className="btn line sm"
                                onClick={() => {
                                  if (!isLoggedIn) {
                                    setShowCourseLogin(true);
                                  } else {
                                    setShowPreRegSuccessModal(true);
                                  }
                                }}
                              >
                                Waitlist
                              </button>
                            ) : !isPurchased && (
                              <button
                                type="button"
                                className="btn line sm"
                                onClick={handleEnroll}
                              >
                                Enroll Now
                              </button>
                            )}
                          </div>
                        </div>
                      </article>
                    );
                  })}
                </div>
              </div>
            </section>

            {/* ── Editorial Philosophy Deep-Dive Section ── */}
            <section className="light-sec" id="philosophy">
              <div className="wrap">
                <div className="card">
                  <div className="rd">
                    <nav className="toc" aria-label="Table of contents">
                      <p>IN THIS MASTERCLASS</p>
                      <a href="#p1" className={activeToc === 'p1' ? 'on' : ''}>01. Presence Under Pressure</a>
                      <a href="#p2" className={activeToc === 'p2' ? 'on' : ''}>02. Breaking Reaction</a>
                      <a href="#p3" className={activeToc === 'p3' ? 'on' : ''}>03. Calm Gravitas</a>
                      <a href="#curriculum" className={activeToc === 'curriculum' ? 'on' : ''}>04. Full Curriculum</a>
                      <a href="#faq" className={activeToc === 'faq' ? 'on' : ''}>05. Frequently Asked</a>
                    </nav>

                    <article className="prose">
                      <span className="chip">CORE METHODOLOGY</span>
                      <h2 id="p1">Most Men Were Never Taught How to Hold Ground</h2>
                      <p className="lede">
                        True charisma is not loud. It is the unhurried certainty of a man who does not need permission to take up space.
                      </p>
                      <p>
                        When pressure spikes in a meeting, negotiation, or relationship, the natural reflex is either to collapse inward or become combative. Both responses signal the same underlying weakness: emotional reactivity.
                      </p>
                      <blockquote>
                        "A room doesn't respond to volume. It responds to certainty."
                      </blockquote>
                      <p>
                        In <b>The Better Man</b> masterclass, we dismantle the nervous system habits that cause rushing, stammering, and over-explaining. You learn how to anchor your physical presence, lower your vocal register under stress, and command respectful silence before uttering a single sentence.
                      </p>

                      <div className="finding">
                        <b>Key Distinction:</b> Reactive men seek approval through fast speech and excessive validation. Anchored men lead through stillness, calibrated pauses, and clear boundaries.
                      </div>

                      <h2 id="p2">From Seeking Approval to Setting Direction</h2>
                      <p>
                        Authority is communicated in the micro-moments: the half-second pause before replying, the stillness of your shoulders, the refusal to laugh at nervous tension.
                      </p>
                      <p>
                        Through 8 structured modules, you will develop a repeatable internal framework that replaces performance anxiety with quiet, magnetic self-command.
                      </p>

                      <h2 id="p3">3 Private 1-on-1 Sessions With Aarkesh</h2>
                      <p>
                        Video courses alone don't transform behavior — feedback does. That is why every student receives <b>3 personalized private sessions</b> directly with Aarkesh to analyze your unique communication style, deconstruct your real-life situations, and lock in lasting transformation.
                      </p>
                    </article>
                  </div>
                </div>
              </div>
            </section>

            {/* ── Curriculum Syllabus Section ── */}
            <section className="sec center" id="curriculum">
              <div className="wrap">
                <span className="label">SYLLABUS</span>
                <h2>Eight Modules To Total Self-Command</h2>
                <p className="lead">
                  A comprehensive, step-by-step roadmap from baseline nervousness to unshakeable gravitas.
                </p>

                <div className="acc">
                  {[
                    { n: '01', t: 'The Foundation of Presence', d: 'Grounding techniques, diaphragmatic breathing under tension, and mastering the crucial first 10 seconds in any room.' },
                    { n: '02', t: 'Breaking the Reactive Cycle', d: 'Identifying personal emotional triggers, pausing between impulse and response, and eliminating defensive habits.' },
                    { n: '03', t: 'Mastering Vocal Gravitas & Tone', d: 'Lowering resonance, eliminating filler words, pacing your delivery, and speaking with magnetic, effortless weight.' },
                    { n: '04', t: 'Non-Verbal Dominance & Spatial Calibration', d: 'Unwavering eye contact, open posture mechanics, micro-expression control, and physical composure.' },
                    { n: '05', t: 'High-Stakes Conversations & Holding Frame', d: 'Navigating demanding bosses, aggressive negotiations, or emotionally volatile conversations without yielding.' },
                    { n: '06', t: 'Decision Making & Decisive Action', d: 'Eliminating second-guessing, owning difficult outcomes, and leading team members or family with unhesitating clarity.' },
                    { n: '07', t: 'Conflict Resolution Without Compromise', d: 'De-escalating heated confrontation while maintaining firm boundaries and achieving win-win outcomes.' },
                    { n: '08', t: 'Integration & Lifetime Standard', d: 'Building your daily self-command rituals, maintaining high standards, and solidifying permanent personal gravitas.' }
                  ].map((m, idx) => (
                    <details className="a" key={m.n} open={idx === 0}>
                      <summary>
                        <span className="n">{m.n}</span>
                        <span className="t">{m.t}</span>
                      </summary>
                      <p>{m.d}</p>
                    </details>
                  ))}
                </div>
              </div>
            </section>

            {/* ── What Is Included Banner ── */}
            <div className="orange">
              <div className="wrap">
                <h2>Everything Included In Your Lifetime Membership</h2>
                <div className="inc">
                  <div>
                    <strong>8</strong>
                    <b>HD Video Modules</b>
                    <span>Self-paced video curriculum with downloadable workbooks & frameworks.</span>
                  </div>
                  <div>
                    <strong>3</strong>
                    <b>Private Coaching Calls</b>
                    <span>Direct 1-on-1 private mentorship sessions with Aarkesh.</span>
                  </div>
                  <div>
                    <strong>∞</strong>
                    <b>Lifetime Access</b>
                    <span>Continuous access to all current & future curriculum updates.</span>
                  </div>
                </div>
              </div>
            </div>

            {/* ── FAQ Section ── */}
            <section className="faq center" id="faq">
              <div className="wrap">
                <span className="label">FAQS</span>
                <h2>Frequently Asked Questions From Our Students</h2>
                <p className="lead">
                  Clear answers about the masterclass, private mentorship, and enrollment.
                </p>

                <div className="acc">
                  {[
                    { q: 'How do the 3 private 1-on-1 sessions work?', a: 'Immediately after enrollment, you gain access to Aarkesh\'s private booking calendar. You can schedule each 1-on-1 session at dates and times that suit your schedule.' },
                    { q: 'Is this course suitable for professionals and introverts?', a: 'Yes. The curriculum is specifically designed for professionals, entrepreneurs, and introverts who want to develop natural, calm authority without acting loud or fake.' },
                    { q: 'How long do I have access to the materials?', a: 'You receive full lifetime access. You can revisit lessons, download the workbooks, and receive all future course updates at zero extra cost.' },
                    { q: 'What is the refund and satisfaction guarantee?', a: 'We offer a complete 30-day money-back guarantee. If you complete the lessons and don\'t feel a substantial shift in your presence, simply email us for a 100% full refund.' }
                  ].map((f, idx) => (
                    <details className="a" key={idx} open={idx === 0}>
                      <summary>
                        <span className="n">Q{idx + 1}</span>
                        <span className="t">{f.q}</span>
                      </summary>
                      <p>{f.a}</p>
                    </details>
                  ))}
                </div>
              </div>
            </section>

            {/* ── Final Call to Action ── */}
            <section className="cta center">
              <div className="wrap">
                <div className="cta-box">
                  <span className="label" style={{ marginBottom: '16px' }}>ENROLL TODAY</span>
                  <h2>Ready To Become The Man People Trust?</h2>
                  <p className="lead">
                    Master the psychology of calm authority, magnetic communication and effortless self-command with lifetime curriculum access and 3 private 1-on-1 coaching sessions.
                  </p>
                  <div className="cta-badges">
                    <span><Users size={16} weight="fill" /> 3 Private Coaching Calls</span>
                    <span><Clock size={16} weight="fill" /> Lifetime Video Access</span>
                    <span><ShieldCheck size={16} weight="fill" /> 30-Day Money-Back Guarantee</span>
                  </div>
                  <div>
                    {isPurchased ? (
                      <button type="button" className="btn" onClick={() => setShowDashboard(true)}>
                        Go to Dashboard <span aria-hidden="true">→</span>
                      </button>
                    ) : (
                      <button type="button" className="btn" onClick={handleEnroll}>
                        Register Now <span aria-hidden="true">→</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </section>
          </>
        ) : (
          /* ═══════════════════════════════════════════════════════════════
             DEDICATED SINGLE-PAGE COURSE DETAILS VIEW (/course/:slug)
             ═══════════════════════════════════════════════════════════════ */
          <section className="d-top" id="course-detail">
            <div className="wrap">
              <button
                type="button"
                onClick={() => {
                  navigate('/course');
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className="back-link"
              >
                ← Back to all courses
              </button>

              <div className="d-grid">
                {/* Left Column: Preview Canvas & Title */}
                <div>
                  <div className={`pv ${activeCourse.cls}`} aria-hidden="true">
                    <span className="big">{activeCourse.title}</span>
                    <i>{activeCourse.chips[0]}</i>
                    <i>{activeCourse.chips[1]}</i>
                    <div className="pv-center-btn">
                      <Play size={24} weight="fill" />
                    </div>
                  </div>

                  <div className="dtitle">
                    <h1>{activeCourse.title}</h1>
                    <span className={`sticker ${activeCourse.soon ? 'soon' : ''}`}>
                      {activeCourse.soon ? 'Coming soon' : 'Live now'}
                    </span>
                  </div>
                  <p className="dlede">{activeCourse.lede || activeCourse.d}</p>
                </div>

                {/* Right Column: Sidebar Card */}
                <aside className="side" aria-label="Course summary">
                  {/* Meta Chips */}
                  <div className="chips">
                    {activeCourse.sidebarChips.map((chip, idx) => (
                      <span key={idx}>
                        <em>{chip[0]}:</em> {chip[1]}
                      </span>
                    ))}
                  </div>

                  {/* Key Highlights */}
                  {activeCourse.hl.map((h, idx) => (
                    <p className="hl" key={idx}>
                      <span>
                        <b>{h[0]}</b> {h[1]}
                      </span>
                    </p>
                  ))}

                  {/* Divider */}
                  <div className="div-divider">What's inside</div>

                  {/* Feature Checklist */}
                  <ul className="ck">
                    {activeCourse.inside.map((item, idx) => (
                      <li key={idx}>{item}</li>
                    ))}
                  </ul>

                  {/* Pricing */}
                  <p className="sprice">
                    Price <b>{activeCourse.price}</b>
                    <s>{activeCourse.was}</s>
                    <small>(+GST)</small>
                  </p>

                  {/* Action Buttons */}
                  {activeCourse.soon ? (
                    <button
                      type="button"
                      className="btn block"
                      onClick={() => {
                        if (!isLoggedIn) {
                          setShowCourseLogin(true);
                        } else {
                          setShowPreRegSuccessModal(true);
                        }
                      }}
                    >
                      Join the Waitlist <span aria-hidden="true">→</span>
                    </button>
                  ) : isPurchased ? (
                    <button
                      type="button"
                      className="btn block"
                      onClick={() => setShowDashboard(true)}
                    >
                      Go to Dashboard <span aria-hidden="true">→</span>
                    </button>
                  ) : (
                    <button
                      type="button"
                      className="btn block"
                      onClick={handleEnroll}
                    >
                      Register Now <span aria-hidden="true">→</span>
                    </button>
                  )}

                  <button
                    type="button"
                    className="btn block line"
                    onClick={() => setShowSyllabusModal(true)}
                  >
                    View Full Syllabus <span aria-hidden="true">→</span>
                  </button>
                </aside>
              </div>
            </div>
          </section>
        )}
      </main>

      {/* Syllabus Modal */}
      {showSyllabusModal && (
        <div className="fixed inset-0 z-[110] bg-black/90 backdrop-blur-xl flex items-center justify-center p-4">
          <div className="relative w-full max-w-2xl bg-[#0c0a0e] border border-[#5A2C55] rounded-3xl p-6 sm:p-8 max-h-[85vh] overflow-y-auto shadow-2xl">
            <button 
              type="button"
              onClick={() => setShowSyllabusModal(false)}
              className="absolute right-5 top-5 w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center cursor-pointer transition-colors"
              title="Close syllabus"
            >
              <X size={16} />
            </button>
            <span className="label" style={{ marginBottom: '12px' }}>SYLLABUS</span>
            <h3 className="font-head text-2xl font-bold text-white mb-2">{activeCourse.title} Curriculum</h3>
            <p className="text-sm text-white/60 mb-6 font-body">Structured modules and deep-dive lessons included in this masterclass.</p>
            <div className="acc">
              {curriculumCards.map((card, idx) => (
                <details className="a" key={idx} open={idx === 0}>
                  <summary>
                    <span className="n">{String(idx + 1).padStart(2, '0')}</span>
                    <span className="t">{card.title}</span>
                  </summary>
                  <p>{card.description}</p>
                </details>
              ))}
            </div>
          </div>
        </div>
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
                    : 'No recurring charges'}
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

      {/* Policy Documents Modal */}
      {activePolicySlug && (
        <PolicyModal 
          slug={activePolicySlug} 
          onClose={() => setActivePolicySlug(null)} 
        />
      )}
    </div>
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
  handleToggleMode,
  basePrice = 15000,
  comparePrice = 25000
}) {
  if (!showCourseLogin) return null;

  return (
    <div className="auth-modal-scope">
      {/* Floating Close Button */}
      <button
        type="button"
        onClick={() => setShowCourseLogin(false)}
        className="close-btn"
        title="Close"
      >
        <X size={18} />
      </button>

      {/* ── Left Column: Form Section ── */}
      <div className="auth-l">
        <div className="fbox">
          {/* Back Navigation */}
          {isForgotPassword ? (
            <button
              type="button"
              className="back"
              onClick={() => {
                setIsForgotPassword(false);
                setIsForgotOtpStep(false);
                setError('');
              }}
            >
              ← Back to sign in
            </button>
          ) : isOtpStep ? (
            <button
              type="button"
              className="back"
              onClick={() => {
                setError('');
              }}
            >
              ← Back to details
            </button>
          ) : (
            <button
              type="button"
              className="back"
              onClick={() => setShowCourseLogin(false)}
            >
              ← Back to course
            </button>
          )}

          {/* Heading & Subtitle */}
          <h1>
            {isForgotPassword
              ? isForgotOtpStep
                ? 'Set new password'
                : 'Reset your password'
              : isOtpStep
              ? 'Verify your email'
              : loginMode === 'login'
              ? 'Welcome back'
              : 'Create your account'}
          </h1>
          <p className="sm">
            {isForgotPassword
              ? isForgotOtpStep
                ? 'Enter the 4-digit code and your new password.'
                : 'Enter your registered email to receive a reset code.'
              : isOtpStep
              ? `Enter the 4-digit code sent to ${email}`
              : loginMode === 'login'
              ? 'Sign in to continue your masterclass.'
              : 'One account for every masterclass you join.'}
          </p>

          {/* Error Message Box */}
          {error && <div className="err">{error}</div>}

          {/* Form */}
          <form onSubmit={handleAuthSubmit} noValidate>
            {!isOtpStep && !isForgotOtpStep ? (
              <>
                {/* Full Name for Register */}
                {!isForgotPassword && loginMode === 'register' && (
                  <div className="fld">
                    <label htmlFor="reg-fullname">Full Name</label>
                    <input
                      id="reg-fullname"
                      type="text"
                      required
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="Your full name"
                      autoComplete="name"
                    />
                  </div>
                )}

                {/* Email Address */}
                <div className="fld">
                  <label htmlFor="auth-email">Email Address</label>
                  <input
                    id="auth-email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    autoComplete="email"
                  />
                </div>

                {/* Password Field */}
                {!isForgotPassword && (
                  <div className="fld">
                    <label htmlFor="auth-password">Password</label>
                    <div className="pw">
                      <input
                        id="auth-password"
                        type={showPassword ? 'text' : 'password'}
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Enter password"
                        autoComplete={loginMode === 'login' ? 'current-password' : 'new-password'}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        aria-label="Toggle password visibility"
                      >
                        {showPassword ? 'Hide' : 'Show'}
                      </button>
                    </div>
                  </div>
                )}

                {/* Confirm Password for Register */}
                {!isForgotPassword && loginMode === 'register' && (
                  <div className="fld">
                    <label htmlFor="auth-cpassword">Confirm Password</label>
                    <div className="pw">
                      <input
                        id="auth-cpassword"
                        type={showPassword ? 'text' : 'password'}
                        required
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="Re-enter password"
                        autoComplete="new-password"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        aria-label="Toggle password visibility"
                      >
                        {showPassword ? 'Hide' : 'Show'}
                      </button>
                    </div>
                  </div>
                )}

                {/* Remember Me & Forgot Password for Login */}
                {!isForgotPassword && loginMode === 'login' && (
                  <div className="row">
                    <label className="chk" style={{ margin: 0 }}>
                      <input type="checkbox" defaultChecked />
                      <span>Keep me signed in</span>
                    </label>
                    <button
                      type="button"
                      onClick={() => {
                        setIsForgotPassword(true);
                        setError('');
                      }}
                    >
                      Forgot password?
                    </button>
                  </div>
                )}

                {/* Terms checkbox for Register */}
                {!isForgotPassword && loginMode === 'register' && (
                  <label className="chk">
                    <input type="checkbox" defaultChecked />
                    <span>I agree to the terms and privacy policy.</span>
                  </label>
                )}

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={isLoading}
                  className="btn block"
                  style={{ width: '100%' }}
                >
                  {isLoading
                    ? 'Please wait...'
                    : isForgotPassword
                    ? 'Send Reset Code'
                    : loginMode === 'login'
                    ? 'Sign In'
                    : 'Create Account'}{' '}
                  <span aria-hidden="true">→</span>
                </button>
              </>
            ) : (
              /* OTP verification / Forgot Password Reset form */
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', gap: '10px', margin: '8px 0' }}>
                  {otpValues.map((digit, index) => (
                    <input
                      key={index}
                      ref={otpRefs[index]}
                      type="text"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => handleOtpChange(index, e.target.value)}
                      onKeyDown={(e) => handleOtpKeyDown(index, e)}
                      style={{
                        width: '56px',
                        height: '56px',
                        textAlign: 'center',
                        fontSize: '22px',
                        fontWeight: 'bold',
                        borderRadius: '12px',
                        background: '#100B13',
                        border: '1px solid #3A3040',
                        color: '#fff'
                      }}
                    />
                  ))}
                </div>

                {isForgotPassword && isForgotOtpStep && (
                  <>
                    <div className="fld">
                      <label htmlFor="reset-new-pw">New Password</label>
                      <div className="pw">
                        <input
                          id="reset-new-pw"
                          type={showPassword ? 'text' : 'password'}
                          required
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          placeholder="Enter new password"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                        >
                          {showPassword ? 'Hide' : 'Show'}
                        </button>
                      </div>
                    </div>

                    <div className="fld">
                      <label htmlFor="reset-new-cpw">Confirm New Password</label>
                      <div className="pw">
                        <input
                          id="reset-new-cpw"
                          type={showPassword ? 'text' : 'password'}
                          required
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          placeholder="Confirm new password"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                        >
                          {showPassword ? 'Hide' : 'Show'}
                        </button>
                      </div>
                    </div>
                  </>
                )}

                <button
                  type="submit"
                  disabled={isLoading}
                  className="btn block"
                  style={{ width: '100%', marginTop: '8px' }}
                >
                  {isLoading
                    ? 'Verifying...'
                    : isForgotPassword
                    ? 'Reset Password'
                    : 'Verify Code'}{' '}
                  <span aria-hidden="true">→</span>
                </button>
              </div>
            )}
          </form>

          {/* Alternate Mode Switcher */}
          <p className="alt">
            {isForgotPassword ? (
              <button
                type="button"
                onClick={() => {
                  setIsForgotPassword(false);
                  setIsForgotOtpStep(false);
                  setError('');
                }}
              >
                ← Back to Sign In
              </button>
            ) : loginMode === 'login' ? (
              <>
                New here?{' '}
                <button type="button" onClick={handleToggleMode}>
                  Create an account
                </button>
              </>
            ) : (
              <>
                Already have an account?{' '}
                <button type="button" onClick={handleToggleMode}>
                  Sign in
                </button>
              </>
            )}
          </p>
        </div>
      </div>

      {/* ── Right Column: Aesthetic Summary Card ── */}
      <div className="auth-r">
        <div className="orb" aria-hidden="true" />
        <div className="in">
          <h2>
            {isForgotPassword
              ? 'Security & peace of mind.'
              : loginMode === 'login'
              ? 'Pick up where you left off.'
              : 'Your masterclass, ready when you are.'}
          </h2>

          <div className="sum">
            {loginMode === 'login' && !isForgotPassword ? (
              <ul className="ck">
                <li>Continue your modules from the last video</li>
                <li>Book your private sessions with Aarkesh</li>
                <li>Download your workbooks and frameworks</li>
                <li>Lifetime updates with no recurring fees</li>
              </ul>
            ) : isForgotPassword ? (
              <ul className="ck">
                <li>Instant 4-digit verification code to your email</li>
                <li>End-to-end encrypted password restoration</li>
                <li>Resume your learning seamlessly right after</li>
              </ul>
            ) : (
              <>
                <span className="sticker">Live now</span>
                <h3>The Better Man</h3>
                <p className="l">
                  Calm authority, magnetic communication and effortless self-command.
                </p>
                <ul className="ck">
                  <li>8 HD video modules</li>
                  <li>Downloadable workbooks and frameworks</li>
                  <li>3 private 1-on-1 coaching sessions</li>
                  <li>Lifetime access with all future updates</li>
                  <li>30-day money-back guarantee</li>
                </ul>
                <p className="sprice">
                  Price <b>₹{basePrice.toLocaleString('en-IN')}</b>
                  <s>₹{comparePrice.toLocaleString('en-IN')}</s>
                  <small>(+GST)</small>
                </p>
                <p className="guar">Covered by the 30-day guarantee.</p>
              </>
            )}
          </div>
        </div>
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
            {gstRate > 0 && (
              <div className="flex justify-between items-center text-xs font-sans text-white/70">
                <span>Course Base Fee</span>
                <span className="font-medium text-white">₹{baseBeforeGst.toLocaleString('en-IN')}</span>
              </div>
            )}
            {gstRate > 0 && (
              <div className="flex justify-between items-center text-xs font-sans text-white/70">
                <div className="flex items-center gap-1.5">
                  <span>GST ({gstRate}%)</span>
                  {isGstIncluded && <span className="text-[10px] text-white/40">(included)</span>}
                  <Info size={13} className="text-white/40" />
                </div>
                <span className="font-medium text-white">₹{gstAmount.toLocaleString('en-IN')}</span>
              </div>
            )}
            <div className="flex justify-between items-center pt-2 text-white">
              <div>
                <span className="font-sans text-sm font-bold block text-white">Total Amount Due</span>
                {gstRate > 0 && (
                  <span className="font-sans text-[0.65rem] text-white/50 block">
                    {isGstIncluded ? `Inclusive of all taxes (${gstRate}% GST)` : `Includes ${gstRate}% GST`}
                  </span>
                )}
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
