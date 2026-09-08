import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Play, CheckCircle, LockKey, CaretDown, Clock, X, User, Eye, EyeSlash, SignOut, ArrowLeft } from '@phosphor-icons/react';
import Button from '../../components/ui/Button';

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
  const [showPricingModal, setShowPricingModal] = useState(false);
  const [showDashboard, setShowDashboard] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isPurchased, setIsPurchased] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showCheckout, setShowCheckout] = useState(false);
  const [checkoutAgreed, setCheckoutAgreed] = useState(false);
  const profileMenuRef = useRef(null);

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

  const otpRefs = [useRef(null), useRef(null), useRef(null), useRef(null)];

  // Course logic
  const [activeModule, setActiveModule] = useState(MODULES[0].id);
  const [activeLesson, setActiveLesson] = useState(MODULES[0].lessons[2]);

  const handleEnroll = () => {
    setShowPricingModal(true);
  };

  const handlePurchase = () => {
    if (!isLoggedIn) {
      setShowPricingModal(false);
      setShowCourseLogin(true);
    } else {
      setShowCheckout(true);
      setShowPricingModal(false);
    }
  };

  const handlePayment = async () => {
    if (!checkoutAgreed) {
      setError("Please agree to the terms and conditions.");
      return;
    }
    setIsLoading(true);
    setError('');

    const safeJson = async (res) => {
      const text = await res.text();
      try {
        return JSON.parse(text);
      } catch {
        console.error('Non-JSON response:', text.substring(0, 200));
        throw new Error(`Server error (${res.status}). Please ensure Razorpay keys are configured in admin settings.`);
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

      if (!scriptLoaded) throw new Error('Razorpay SDK failed to load.');

      const keyRes = await fetch('/api/payment/public-key');
      const keyData = await safeJson(keyRes);
      if (!keyRes.ok) throw new Error(keyData.message || 'Payment gateway not configured.');

      const orderRes = await fetch('/api/payment/course-order', {
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
            const verifyRes = await fetch('/api/payment/course-verify', {
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
              setShowDashboard(true);
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
      rzp.on('payment.failed', function (response) {
        setError(`Payment failed: ${response.error?.description || 'Please try again.'}`);
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
    }

    const handleClickOutside = (event) => {
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target)) {
        setShowProfileMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('courseToken');
    localStorage.removeItem('isCoursePurchased');
    setIsLoggedIn(false);
    setIsPurchased(false);
    setShowDashboard(false);
    setShowProfileMenu(false);
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
      if (phoneNumber.length !== 10) { setError('Phone number must be exactly 10 digits'); return; }
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
          body = { fullName, email, password, phoneNumber };
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
          if (data.isPurchased) {
            localStorage.setItem('isCoursePurchased', 'true');
            setIsPurchased(true);
          }
          setShowCourseLogin(false);
          setIsLoggedIn(true);
          if (data.isPurchased) {
            setShowDashboard(true);
          } else {
            setShowCheckout(true);
          }
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

  // ─── NAVBAR ─────────────────────────────────────────────────────
  const CourseNavbar = () => (
    <header className="flex-none h-[72px] border-b border-white/10 bg-[#0a0a0a] px-6 md:px-10 flex items-center justify-between z-50 sticky top-0">
      <Link to="/course" className="font-serif text-xl tracking-tight text-white hover:opacity-80 transition-opacity">
        BetterWith<span className="text-white/60">Aarkesh</span>
      </Link>
      {isLoggedIn ? (
        <div className="relative" ref={profileMenuRef}>
          <button
            onClick={() => setShowProfileMenu(!showProfileMenu)}
            className="w-10 h-10 rounded-full border border-white/20 bg-[#111] flex items-center justify-center text-[#c79c6e] hover:bg-[#c79c6e] hover:text-black transition-all hover:scale-105 shadow-[0_0_20px_rgba(199,156,110,0.15)]"
          >
            <User size={18} weight="light" />
          </button>
          {showProfileMenu && (
            <div className="absolute right-0 mt-3 w-48 rounded-xl border border-white/10 bg-[#0a0a0a] shadow-2xl py-2 z-[100]">
              <button onClick={handleLogout} className="w-full px-5 py-3 text-left font-sans text-sm text-red-400 hover:bg-white/5 transition-colors flex items-center gap-3">
                <SignOut size={18} /> Log Out
              </button>
            </div>
          )}
        </div>
      ) : (
        <Button
          variant="outline"
          className="text-[0.65rem] px-5 py-[0.65rem] flex items-center gap-2 border-[#c79c6e]/40 text-[#c79c6e] hover:bg-[#c79c6e] hover:text-[#050505]"
          onClick={() => setShowCourseLogin(true)}
        >
          <User size={14} weight="light" /> LOGIN
        </Button>
      )}
    </header>
  );

  // ─── AUTH MODAL ─────────────────────────────────────────────────
  const AuthModal = () => {
    if (!showCourseLogin) return null;
    return (
      <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-sm p-4">
        <div className="relative w-full max-w-[400px] rounded-xl bg-[#0a0a0a] p-8 md:p-10 shadow-2xl border border-white/5">
          <button onClick={() => setShowCourseLogin(false)} className="absolute right-6 top-6 text-white/30 hover:text-white transition-colors">
            <X size={20} />
          </button>
          {isForgotPassword && (
            <h2 className="font-serif text-2xl text-white mb-2">{isForgotOtpStep ? 'Reset Password' : 'Forgot Password'}</h2>
          )}
          <form onSubmit={handleAuthSubmit} className="flex flex-col gap-6 mt-4">
            {!isOtpStep && !isForgotOtpStep ? (
              <>
                {(!isForgotPassword && loginMode === 'register') && (
                  <div className="flex flex-col gap-1.5">
                    <label className="font-sans text-[0.65rem] uppercase tracking-widest text-[#c79c6e]">Full Name</label>
                    <input type="text" required value={fullName} onChange={e => setFullName(e.target.value)} placeholder="John Doe" className="w-full bg-transparent border-b border-white/20 pb-3 pt-1 text-white placeholder-white/20 focus:outline-none focus:border-[#c79c6e] transition-colors font-sans" />
                  </div>
                )}
                <div className="flex flex-col gap-1.5">
                  <label className="font-sans text-[0.65rem] uppercase tracking-widest text-[#c79c6e]">Email Address</label>
                  <input type="email" required value={email} onChange={e => setEmail(e.target.value)} placeholder="john@example.com" className="w-full bg-transparent border-b border-white/20 pb-3 pt-1 text-white placeholder-white/20 focus:outline-none focus:border-[#c79c6e] transition-colors font-sans" />
                </div>
                {(!isForgotPassword && loginMode === 'register') && (
                  <div className="flex flex-col gap-1.5">
                    <label className="font-sans text-[0.65rem] uppercase tracking-widest text-[#c79c6e]">Phone Number</label>
                    <div className="flex items-center w-full border-b border-white/20 pb-3 pt-1 focus-within:border-[#c79c6e] transition-colors">
                      <span className="text-white mr-4 whitespace-nowrap font-sans">IN (+91)</span>
                      <div className="w-[1px] h-4 bg-white/20 mr-4"></div>
                      <input type="tel" required maxLength={10} value={phoneNumber} onChange={e => setPhoneNumber(e.target.value.replace(/\D/g, ''))} placeholder="0000000000" className="w-full bg-transparent text-white placeholder-white/20 focus:outline-none font-sans" />
                    </div>
                  </div>
                )}
                {!isForgotPassword && (
                  <div className="flex flex-col gap-1.5">
                    <div className="flex justify-between items-center">
                      <label className="font-sans text-[0.65rem] uppercase tracking-widest text-[#c79c6e]">Password</label>
                      {loginMode === 'login' && (
                        <button type="button" onClick={() => { setIsForgotPassword(true); setError(''); }} className="font-sans text-[0.65rem] uppercase tracking-widest text-[#c79c6e] hover:text-white transition-colors">Forgot Password?</button>
                      )}
                    </div>
                    <div className="flex items-center w-full border-b border-white/20 pb-3 pt-1 focus-within:border-[#c79c6e] transition-colors relative">
                      <input type={showPassword ? "text" : "password"} required value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" className="w-full bg-transparent text-white placeholder-white/20 focus:outline-none font-sans tracking-widest pr-8" />
                      <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-0 bottom-3 text-white/40 hover:text-white transition-colors">
                        {showPassword ? <EyeSlash size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                  </div>
                )}
                {(!isForgotPassword && loginMode === 'register') && (
                  <div className="flex flex-col gap-1.5">
                    <label className="font-sans text-[0.65rem] uppercase tracking-widest text-[#c79c6e]">Confirm Password</label>
                    <div className="flex items-center w-full border-b border-white/20 pb-3 pt-1 focus-within:border-[#c79c6e] transition-colors relative">
                      <input type={showPassword ? "text" : "password"} required value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} placeholder="••••••••" className="w-full bg-transparent text-white placeholder-white/20 focus:outline-none font-sans tracking-widest pr-8" />
                      <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-0 bottom-3 text-white/40 hover:text-white transition-colors">
                        {showPassword ? <EyeSlash size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div className="flex flex-col gap-6 py-4">
                <p className="text-white/60 font-sans text-xs tracking-wider mb-2">Enter the 4-digit OTP sent to {email}</p>
                <div className="flex justify-between gap-2">
                  {otpValues.map((digit, index) => (
                    <input key={index} ref={otpRefs[index]} type="text" maxLength={1} value={digit} onChange={(e) => handleOtpChange(index, e.target.value)} onKeyDown={(e) => handleOtpKeyDown(index, e)} className="w-12 h-12 text-center bg-transparent border-b border-white/20 text-white font-sans text-xl focus:outline-none focus:border-[#c79c6e] transition-colors" />
                  ))}
                </div>
                {isForgotPassword && (
                  <>
                    <div className="flex flex-col gap-1.5 mt-4">
                      <label className="font-sans text-[0.65rem] uppercase tracking-widest text-[#c79c6e]">New Password</label>
                      <div className="flex items-center w-full border-b border-white/20 pb-3 pt-1 focus-within:border-[#c79c6e] transition-colors relative">
                        <input type={showPassword ? "text" : "password"} required value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" className="w-full bg-transparent text-white placeholder-white/20 focus:outline-none font-sans tracking-widest pr-8" />
                        <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-0 bottom-3 text-white/40 hover:text-white transition-colors">
                          {showPassword ? <EyeSlash size={16} /> : <Eye size={16} />}
                        </button>
                      </div>
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className="font-sans text-[0.65rem] uppercase tracking-widest text-[#c79c6e]">Confirm New Password</label>
                      <div className="flex items-center w-full border-b border-white/20 pb-3 pt-1 focus-within:border-[#c79c6e] transition-colors relative">
                        <input type={showPassword ? "text" : "password"} required value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} placeholder="••••••••" className="w-full bg-transparent text-white placeholder-white/20 focus:outline-none font-sans tracking-widest pr-8" />
                        <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-0 bottom-3 text-white/40 hover:text-white transition-colors">
                          {showPassword ? <EyeSlash size={16} /> : <Eye size={16} />}
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            )}
            {error && <div className="text-red-400 font-sans text-xs text-center">{error}</div>}
            <button type="submit" disabled={isLoading} className="w-full bg-[#c79c6e] px-8 py-4 font-sans text-[0.7rem] font-medium uppercase tracking-[0.15em] text-black transition-all hover:bg-[#b0885e] mt-4 rounded-[2px]">
              {isLoading ? 'PLEASE WAIT...' : (isForgotPassword ? (isForgotOtpStep ? 'RESET PASSWORD' : 'SEND OTP') : (isOtpStep ? 'VERIFY OTP' : (loginMode === 'login' ? 'SIGN IN' : 'CREATE ACCOUNT')))}
            </button>
            {(!isOtpStep && !isForgotOtpStep) && (
              <button type="button" onClick={handleToggleMode} className="w-full text-center font-sans text-[0.65rem] uppercase tracking-widest text-white/40 hover:text-white transition-colors mt-2">
                {isForgotPassword ? "BACK TO SIGN IN" : (loginMode === 'login' ? "DON'T HAVE AN ACCOUNT? REGISTER" : "ALREADY HAVE AN ACCOUNT? SIGN IN")}
              </button>
            )}
          </form>
        </div>
      </div>
    );
  };

  // ─── CHECKOUT OVERLAY ───────────────────────────────────────────
  const CheckoutOverlay = () => {
    if (!showCheckout) return null;
    return (
      <div className="fixed inset-0 z-[110] bg-[#050505] flex flex-col items-center pt-24 px-4 overflow-y-auto pb-10">
        <button onClick={() => setShowCheckout(false)} className="absolute left-6 top-6 md:left-10 md:top-10 flex items-center gap-2 font-sans text-[0.65rem] uppercase tracking-widest text-white/60 hover:text-[#c79c6e] transition-colors">
          <ArrowLeft className="text-base" /> BACK
        </button>
        <h1 className="font-serif text-3xl md:text-4xl text-white mb-10">Checkout Summary</h1>
        <div className="w-full max-w-4xl grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Left Col: Billing */}
          <div className="bg-[#0a0a0a] border border-white/10 rounded-2xl p-8 shadow-2xl flex flex-col">
            <div className="flex-grow">
              <h2 className="font-serif text-2xl text-white mb-6 border-b border-white/10 pb-4">Billing Details</h2>
              <div className="flex justify-between items-center mb-4 text-white/80 font-sans">
                <span>Premium Course Bundle</span>
                <span>₹15,000</span>
              </div>
              <div className="flex justify-between items-center mb-6 text-white/60 font-sans text-sm">
                <span>GST (18%)</span>
                <span>₹2,700</span>
              </div>
              <div className="flex justify-between items-center mb-8 text-[#c79c6e] font-sans font-bold text-xl border-t border-white/10 pt-4">
                <span>Total Amount</span>
                <span>₹17,700</span>
              </div>
            </div>
            <div className="mt-auto">
              <label className="flex items-start gap-3 cursor-pointer mb-6 group">
                <div className="relative flex items-center justify-center mt-0.5">
                  <input type="checkbox" className="sr-only" checked={checkoutAgreed} onChange={(e) => setCheckoutAgreed(e.target.checked)} />
                  <div className={`w-5 h-5 rounded border transition-colors flex items-center justify-center ${checkoutAgreed ? 'bg-[#c79c6e] border-[#c79c6e]' : 'border-white/30 group-hover:border-[#c79c6e]'}`}>
                    {checkoutAgreed && <CheckCircle size={14} weight="fill" className="text-black" />}
                  </div>
                </div>
                <span className="font-sans text-xs text-white/60 leading-relaxed">
                  I agree to the <a href="#" className="text-[#c79c6e] hover:underline">Terms & Conditions</a>.
                </span>
              </label>
              {error && <div className="text-red-400 font-sans text-xs mb-4 text-center">{error}</div>}
              <button type="button" onClick={handlePayment} disabled={isLoading || !checkoutAgreed} className="w-full rounded bg-[#c79c6e] px-8 py-4 font-sans text-sm font-semibold uppercase tracking-[0.2em] text-black transition-all hover:bg-[#b0885e] disabled:opacity-50 disabled:cursor-not-allowed">
                {isLoading ? 'PROCESSING...' : 'PROCEED TO PAYMENT'}
              </button>
            </div>
          </div>

          {/* Right Col: Benefits */}
          <div className="bg-[#0a0a0a] border border-white/10 rounded-2xl p-8 flex flex-col">
            <h3 className="font-serif text-xl text-white mb-6">What you're getting</h3>
            <ul className="space-y-6 text-white/80">
              <li className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-full bg-[#c79c6e]/10 flex items-center justify-center shrink-0">
                  <LockKey size={20} className="text-[#c79c6e]" weight="fill" />
                </div>
                <div>
                  <h4 className="font-bold font-sans text-sm mb-1 text-white">Full Access to All Modules</h4>
                  <p className="font-sans text-xs text-white/50">Unlock the complete library of videos, exercises, and resources.</p>
                </div>
              </li>
              <li className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-full bg-[#c79c6e]/10 flex items-center justify-center shrink-0">
                  <User size={20} className="text-[#c79c6e]" weight="fill" />
                </div>
                <div>
                  <h4 className="font-bold font-sans text-sm mb-1 text-white">3 Free Coaching Sessions</h4>
                  <p className="font-sans text-xs text-white/50">Includes three 1-on-1 private coaching sessions with Aarkesh.</p>
                </div>
              </li>
              <li className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-full bg-[#c79c6e]/10 flex items-center justify-center shrink-0">
                  <Clock size={20} className="text-[#c79c6e]" weight="fill" />
                </div>
                <div>
                  <h4 className="font-bold font-sans text-sm mb-1 text-white">Lifetime Access</h4>
                  <p className="font-sans text-xs text-white/50">Learn at your own pace and revisit the materials anytime.</p>
                </div>
              </li>
            </ul>
          </div>
        </div>
      </div>
    );
  };

  // ═══════════════════════════════════════════════════════════════
  // DASHBOARD VIEW (purchased users)
  // ═══════════════════════════════════════════════════════════════
  if (showDashboard) {
    return (
      <main className="h-screen bg-[#050505] text-white flex flex-col overflow-hidden">
        <CourseNavbar />
        <div className="flex-grow flex flex-col lg:flex-row h-[calc(100vh-72px)] overflow-hidden">
          {/* Left Column - Video Player & Description */}
          <div className="flex-1 flex flex-col bg-[#050505] overflow-y-auto border-r border-white/10">
            <div className="w-full aspect-video bg-black relative flex items-center justify-center border-b border-white/10">
              <button className="w-20 h-20 rounded-full bg-[#c79c6e] flex items-center justify-center text-black hover:scale-105 transition-transform shadow-[0_0_30px_rgba(199,156,110,0.15)]">
                <Play size={40} weight="fill" className="ml-2" />
              </button>
              <div className="absolute bottom-6 left-6 md:bottom-10 md:left-10">
                <p className="text-[0.65rem] uppercase tracking-[0.2em] text-[#c79c6e] font-semibold mb-2 drop-shadow-md">Up Next</p>
                <h2 className="text-2xl md:text-3xl font-serif text-white drop-shadow-md">{activeLesson.title}</h2>
              </div>
            </div>
            <div className="p-6 md:p-10 lg:p-16">
              <div className="bg-[#0a0a0a] border border-white/10 rounded-2xl p-8 md:p-10 shadow-2xl">
                <h3 className="font-serif text-2xl text-white mb-6">About this lesson</h3>
                <p className="text-white/70 font-sans text-sm md:text-base leading-relaxed mb-10">
                  In this session, we dive deep into the mechanics of presence. You will learn how to anchor yourself in high-pressure situations, tune out internal noise, and project a calm, magnetic energy that naturally draws people in.
                </p>
                <div className="flex items-center gap-8 text-xs font-sans uppercase tracking-[0.2em] text-white/50">
                  <div className="flex items-center gap-3">
                    <Clock size={18} className="text-[#c79c6e]" /> {activeLesson.duration}
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="w-6 h-6 rounded-full bg-[#c79c6e]/20 text-[#c79c6e] flex items-center justify-center text-[10px] font-bold">A</span>
                    AARKESH GUPTA
                  </div>
                </div>
              </div>
            </div>
          </div>
          {/* Right Column - Modules List */}
          <div className="w-full lg:w-[450px] bg-black flex flex-col h-full overflow-y-auto p-8 gap-6 border-l border-white/10">
            <div className="sticky top-0 bg-black/95 backdrop-blur-md z-10 pb-4">
              <h3 className="font-sans text-[0.65rem] uppercase tracking-widest text-white/50">Course Curriculum</h3>
            </div>
            <div className="flex flex-col gap-4">
              {MODULES.map((module) => (
                <div key={module.id} className="border border-white/10 rounded-2xl bg-[#050505] overflow-hidden">
                  <button className="w-full flex items-center justify-between p-6 hover:bg-white/5 transition-colors text-left group" onClick={() => setActiveModule(activeModule === module.id ? null : module.id)}>
                    <div className="pr-4">
                      <h4 className={`font-serif text-lg mb-2 transition-colors leading-snug ${activeModule === module.id ? 'text-[#c79c6e]' : 'text-white group-hover:text-[#c79c6e]'}`}>{module.title}</h4>
                      <p className="font-sans text-[0.65rem] uppercase tracking-[0.2em] text-white/40">{module.lessons.length} LESSONS • {module.duration}</p>
                    </div>
                    <CaretDown size={16} className={`text-white/40 transition-transform shrink-0 ${activeModule === module.id ? 'rotate-180' : ''}`} />
                  </button>
                  <div className={`overflow-hidden transition-all duration-300 ${activeModule === module.id ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'}`}>
                    <div className="bg-[#050505] p-2 pt-0">
                      {module.lessons.map((lesson) => (
                        <button key={lesson.id} onClick={() => setActiveLesson(lesson)} className={`w-full flex items-center justify-between py-3 px-4 rounded-xl hover:bg-white/5 transition-colors text-left ${activeLesson?.id === lesson.id ? 'bg-[#111]' : 'bg-transparent'}`}>
                          <div className="flex items-center gap-4">
                            {lesson.isCompleted ? (
                              <CheckCircle size={18} weight="fill" className="text-[#c79c6e] shrink-0" />
                            ) : (
                              <Play size={18} weight={activeLesson?.id === lesson.id ? "fill" : "regular"} className={`shrink-0 ${activeLesson?.id === lesson.id ? "text-[#c79c6e]" : "text-white/40"}`} />
                            )}
                            <span className={`font-sans text-sm ${activeLesson?.id === lesson.id ? 'text-white font-medium' : 'text-white/60'}`}>{lesson.title}</span>
                          </div>
                          <span className="font-sans text-[0.65rem] text-white/40 whitespace-nowrap ml-4">{lesson.duration}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
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
      <CourseNavbar />

      {/* ─── HERO ───────────────────────────────────────────────── */}
      <section className="relative w-full min-h-screen flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0">
          <img src="/course_hero_bg.jpg" alt="" className="w-full h-full object-cover object-center" />
          <div className="absolute inset-0 bg-gradient-to-b from-[#050505]/60 via-[#050505]/50 to-[#050505]" />
          <div className="absolute inset-0 bg-gradient-to-r from-[#050505]/80 via-transparent to-[#050505]/80" />
        </div>
        <div className="relative z-10 text-center px-6 max-w-4xl mx-auto">
          <p className="font-sans text-[0.6rem] uppercase tracking-[0.4em] text-[#c79c6e] mb-6">Premium Online Course</p>
          <h1 className="font-serif text-5xl md:text-7xl text-white leading-[1.05] mb-6">
            The Presence<br /><span className="text-[#c79c6e]">Protocol</span>
          </h1>
          <p className="font-sans text-white/60 text-base md:text-lg leading-relaxed max-w-2xl mx-auto mb-10">
            A transformative 9-lesson journey to master authentic presence, magnetic communication, and the quiet confidence that commands every room you walk into.
          </p>
          <div className="flex items-center justify-center gap-6 mb-10 flex-wrap">
            <div className="flex items-center gap-2 text-white/50 font-sans text-xs uppercase tracking-widest">
              <div className="flex -space-x-2">
                {['A','R','S'].map((l,i) => (
                  <span key={i} className="w-7 h-7 rounded-full bg-[#c79c6e]/20 border border-[#c79c6e]/30 flex items-center justify-center text-[#c79c6e] text-[10px] font-bold">{l}</span>
                ))}
              </div>
              <span>500+ students enrolled</span>
            </div>
            <div className="flex items-center gap-1 text-[#c79c6e] text-xs font-sans uppercase tracking-widest">
              {'★★★★★'.split('').map((s,i) => <span key={i}>{s}</span>)}
              <span className="text-white/50 ml-1">4.9 Rating</span>
            </div>
            <div className="text-white/50 font-sans text-xs uppercase tracking-widest">9 Lessons · 3h 30m</div>
          </div>
          <div className="flex items-center justify-center gap-4 flex-wrap">
            {!isPurchased ? (
              <button type="button" onClick={handleEnroll} className="rounded bg-[#c79c6e] px-10 py-4 font-sans text-sm font-semibold uppercase tracking-[0.2em] text-black transition-all hover:bg-[#b0885e] hover:scale-105 shadow-[0_0_40px_rgba(199,156,110,0.3)]">
                Enroll Now — ₹17,700
              </button>
            ) : (
              <button type="button" onClick={() => setShowDashboard(true)} className="rounded border border-white/20 px-10 py-4 font-sans text-sm font-semibold uppercase tracking-[0.2em] text-white/80 transition-all hover:border-[#c79c6e]/40 hover:text-white shadow-[0_0_40px_rgba(255,255,255,0.05)]">
                Skip to Video Dashboard
              </button>
            )}
          </div>
          <p className="text-white/30 font-sans text-xs mt-4">30-day money-back guarantee · Instant access · Lifetime updates</p>
        </div>
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 animate-bounce">
          <div className="w-[1px] h-10 bg-gradient-to-b from-transparent to-[#c79c6e]/60" />
        </div>
      </section>

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

      {/* ─── CURRICULUM ──────────────────────────────────────────── */}
      <section className="py-24 px-6 max-w-6xl mx-auto w-full">
        <div className="text-center mb-16">
          <p className="font-sans text-[0.6rem] uppercase tracking-[0.4em] text-[#c79c6e] mb-3">Inside the Course</p>
          <h2 className="font-serif text-4xl md:text-5xl text-white">Course Curriculum</h2>
          <p className="text-white/50 font-sans text-sm mt-3">9 lessons · 3 modules · 3h 30m total</p>
        </div>
        <div className="flex flex-col gap-4 max-w-3xl mx-auto">
          {MODULES.map((module, mi) => (
            <div key={module.id} className="border border-white/10 rounded-2xl bg-[#0a0a0a] overflow-hidden">
              <button className="w-full flex items-center justify-between p-6 hover:bg-white/[0.03] transition-colors text-left group" onClick={() => setActiveModule(activeModule === module.id ? null : module.id)}>
                <div className="flex items-center gap-4">
                  <span className="w-8 h-8 rounded-full border border-[#c79c6e]/30 flex items-center justify-center text-[#c79c6e] font-serif text-sm shrink-0">{mi + 1}</span>
                  <div>
                    <h4 className={`font-serif text-lg transition-colors leading-snug ${activeModule === module.id ? 'text-[#c79c6e]' : 'text-white group-hover:text-[#c79c6e]'}`}>{module.title}</h4>
                    <p className="font-sans text-[0.6rem] uppercase tracking-[0.2em] text-white/40 mt-1">{module.lessons.length} LESSONS · {module.duration}</p>
                  </div>
                </div>
                <CaretDown size={16} className={`text-white/40 transition-transform shrink-0 ml-4 ${activeModule === module.id ? 'rotate-180 text-[#c79c6e]' : ''}`} />
              </button>
              <div className={`overflow-hidden transition-all duration-300 ${activeModule === module.id ? 'max-h-[400px] opacity-100' : 'max-h-0 opacity-0'}`}>
                <div className="border-t border-white/[0.08] px-6 pb-4">
                  {module.lessons.map((lesson) => (
                    <div key={lesson.id} className="flex items-center justify-between py-3">
                      <div className="flex items-center gap-3">
                        {lesson.isLocked ? <LockKey size={16} className="text-white/20 shrink-0" /> : <Play size={16} className="text-[#c79c6e] shrink-0" weight="fill" />}
                        <span className={`font-sans text-sm ${lesson.isLocked ? 'text-white/30' : 'text-white/70'}`}>{lesson.title}</span>
                        {!lesson.isLocked && <span className="text-[#c79c6e] font-sans text-[0.55rem] uppercase tracking-wider border border-[#c79c6e]/30 px-2 py-0.5 rounded-full">Free</span>}
                      </div>
                      <span className="font-sans text-[0.65rem] text-white/30 whitespace-nowrap ml-4">{lesson.duration}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      <div className="w-full max-w-6xl mx-auto px-6"><div className="h-[1px] bg-gradient-to-r from-transparent via-white/10 to-transparent" /></div>

      {/* ─── INSTRUCTOR ──────────────────────────────────────────── */}
      <section className="py-24 px-6 max-w-6xl mx-auto w-full">
        <div className="text-center mb-16">
          <p className="font-sans text-[0.6rem] uppercase tracking-[0.4em] text-[#c79c6e] mb-3">Your Guide</p>
          <h2 className="font-serif text-4xl md:text-5xl text-white">Meet Aarkesh</h2>
        </div>
        <div className="flex flex-col md:flex-row gap-12 items-center max-w-4xl mx-auto">
          <div className="shrink-0">
            <div className="w-48 h-48 md:w-64 md:h-64 rounded-full overflow-hidden border-2 border-[#c79c6e]/30 shadow-[0_0_60px_rgba(199,156,110,0.15)]">
              <img src="/instructor_avatar.jpg" alt="Aarkesh Gupta" className="w-full h-full object-cover" />
            </div>
          </div>
          <div className="flex-1 text-center md:text-left">
            <h3 className="font-serif text-2xl text-white mb-1">Aarkesh Gupta</h3>
            <p className="font-sans text-[0.65rem] uppercase tracking-widest text-[#c79c6e] mb-5">Certified Life Coach · NLP Practitioner</p>
            <p className="font-sans text-white/60 text-sm leading-relaxed mb-6">
              Aarkesh has spent the last decade studying the psychology of human connection and influence. Having coached 500+ individuals from executives to artists, his approach blends neuroscience, mindfulness, and real-world social dynamics into a framework that creates lasting transformation.
            </p>
            <div className="flex gap-8 flex-wrap justify-center md:justify-start">
              {[['500+', 'Students Coached'], ['10+', 'Years Experience'], ['4.9★', 'Average Rating']].map(([num, label]) => (
                <div key={label}>
                  <div className="font-serif text-2xl text-[#c79c6e]">{num}</div>
                  <div className="font-sans text-[0.6rem] uppercase tracking-widest text-white/40">{label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <div className="w-full max-w-6xl mx-auto px-6"><div className="h-[1px] bg-gradient-to-r from-transparent via-white/10 to-transparent" /></div>

      {/* ─── TESTIMONIALS ────────────────────────────────────────── */}
      <section className="py-24 px-6 max-w-6xl mx-auto w-full">
        <div className="text-center mb-16">
          <p className="font-sans text-[0.6rem] uppercase tracking-[0.4em] text-[#c79c6e] mb-3">Student Stories</p>
          <h2 className="font-serif text-4xl md:text-5xl text-white">Real transformations</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { name: 'Rohan M.', role: 'Startup Founder', text: 'Within 3 weeks of starting this course, I walked into a pitch meeting and actually felt present. Not nervous, not performing — present. We closed the round.' },
            { name: 'Priya S.', role: 'Marketing Director', text: "I've done therapy, read every self-help book — nothing clicked until this. Aarkesh doesn't give you scripts, he rewires how you see yourself." },
            { name: 'Arjun K.', role: 'Medical Professional', text: 'The module on non-verbal communication alone was worth the full price. My patient interactions, my relationships — everything shifted.' },
          ].map((t, i) => (
            <div key={i} className="p-8 rounded-2xl border border-white/[0.08] bg-[#0a0a0a] flex flex-col gap-4 hover:border-[#c79c6e]/20 transition-colors">
              <div className="flex gap-0.5 text-[#c79c6e] text-sm">★★★★★</div>
              <p className="font-sans text-white/70 text-sm leading-relaxed italic flex-1">"{t.text}"</p>
              <div>
                <div className="font-sans font-semibold text-white text-sm">{t.name}</div>
                <div className="font-sans text-[0.6rem] uppercase tracking-widest text-white/30">{t.role}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ─── FINAL CTA ───────────────────────────────────────────── */}
      <section className="py-24 px-6 w-full bg-[#0a0a0a] border-t border-white/[0.08]">
        <div className="max-w-4xl mx-auto text-center">
          <p className="font-sans text-[0.6rem] uppercase tracking-[0.4em] text-[#c79c6e] mb-4">Start Today</p>
          <h2 className="font-serif text-4xl md:text-6xl text-white mb-6">Ready to step into<br />your fullest self?</h2>
          <p className="font-sans text-white/50 text-base mb-10 max-w-xl mx-auto">One investment. A lifetime of transformation. Join 500+ students who chose to show up differently.</p>
          <div className="inline-flex flex-col items-center gap-6 p-10 rounded-2xl border border-white/10 bg-[#050505] shadow-2xl mb-10">
            <div className="text-center">
              <div className="font-serif text-5xl text-[#c79c6e] mb-1">₹17,700</div>
              <div className="font-sans text-white/40 text-sm">incl. 18% GST · One-time payment</div>
            </div>
            <ul className="flex flex-col gap-3 text-left w-full max-w-xs">
              {['Full access to all 9 lessons', '3 Free 1-on-1 coaching sessions', 'Lifetime access & future updates', 'Certificate of completion', 'Private community access'].map(b => (
                <li key={b} className="flex items-center gap-3 text-white/70 font-sans text-sm">
                  <CheckCircle size={18} weight="fill" className="text-[#c79c6e] shrink-0" /> {b}
                </li>
              ))}
            </ul>
            {!isPurchased ? (
              <button type="button" onClick={handleEnroll} className="w-full max-w-xs rounded bg-[#c79c6e] px-10 py-4 font-sans text-sm font-semibold uppercase tracking-[0.2em] text-black transition-all hover:bg-[#b0885e] hover:scale-105 shadow-[0_0_40px_rgba(199,156,110,0.2)]">
                Enroll Now
              </button>
            ) : (
              <button type="button" onClick={() => setShowDashboard(true)} className="w-full max-w-xs rounded border border-white/20 px-10 py-4 font-sans text-sm font-semibold uppercase tracking-[0.2em] text-white/80 transition-all hover:border-[#c79c6e]/40 hover:text-white shadow-[0_0_40px_rgba(255,255,255,0.05)]">
                Skip to Video Dashboard
              </button>
            )}
            <p className="text-white/30 font-sans text-xs mt-4">30-day money-back guarantee · No questions asked</p>
          </div>
        </div>
      </section>

      {/* ─── MODALS ──────────────────────────────────────────────── */}

      {/* Pricing Modal */}
      {showPricingModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="relative w-full max-w-md rounded-2xl border border-white/10 bg-[#0a0a0a] p-8 shadow-2xl">
            <button onClick={() => setShowPricingModal(false)} className="absolute right-4 top-4 text-white/50 hover:text-white transition-colors">
              <X size={24} />
            </button>
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-white mb-2">Premium Bundle</h2>
              <p className="text-white/60 mb-4">Complete Access + Coaching</p>
              <div className="text-4xl font-bold text-[#c79c6e]">₹17,700</div>
              <div className="text-white/40 text-xs mt-1">incl. 18% GST</div>
            </div>
            <button type="button" onClick={handlePurchase} className="w-full rounded bg-[#c79c6e] px-8 py-4 font-sans text-sm font-semibold uppercase tracking-[0.2em] text-black transition-all hover:bg-[#b0885e] hover:scale-105 mb-6">
              Purchase Course
            </button>
            <ul className="space-y-3 text-white/70 text-sm">
              {['Full access to all 9 lessons', '3 Free Coaching Sessions with Aarkesh', 'Lifetime access to updates', 'Private community access'].map(b => (
                <li key={b} className="flex items-center gap-2"><CheckCircle size={18} weight="fill" className="text-[#c79c6e] shrink-0" />{b}</li>
              ))}
            </ul>
          </div>
        </div>
      )}

      <AuthModal />
      <CheckoutOverlay />
    </main>
  );
}
