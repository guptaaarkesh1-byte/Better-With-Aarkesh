import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Sparkle, CheckCircle } from '@phosphor-icons/react';
import BookingStepper from '../components/booking/BookingStepper';
import Step1Time from '../components/booking/Step1Time';
import Step2Details from '../components/booking/Step2Details';
import Step3Confirm from '../components/booking/Step3Confirm';
import BookingSuccess from '../components/booking/BookingSuccess';
import BookingCancelled from '../components/booking/BookingCancelled';
import LoginModal from '../components/layout/LoginModal';
import bookingBg from '../assets/images/booking_bg_lamp.webp';

export default function Booking() {
  const navigate = useNavigate();
  const [isLoggedIn, setIsLoggedIn] = useState(() => !!localStorage.getItem('token'));
  const [step, setStep] = useState(1);
  const [bookingData, setBookingData] = useState(() => {
    // Always start fresh — do not restore from sessionStorage
    sessionStorage.removeItem('bookingStep');
    sessionStorage.removeItem('bookingData');
    const token = localStorage.getItem('token');
    const saved = token ? localStorage.getItem('userInfo') : null;
    const userInfo = saved ? JSON.parse(saved) : {};
    return {
      date: null,
      time: null,
      name: userInfo.fullName || '',
      email: userInfo.email || '',
      countryCode: userInfo.countryCode || '+91',
      phoneNumber: userInfo.phoneNumber || '',
      source: '',
      otherSource: '',
      reason: '',
      extra: '',
    };
  });
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

  // Handle openAuth query param and auth modal pre-fill
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const openAuth = params.get('openAuth');
    const mode = params.get('authMode') || 'register';
    const paramEmail = params.get('email');
    const paramName = params.get('name');
    const paramPhone = params.get('phone');

    if (mode) setAuthMode(mode);
    if (paramEmail) setAuthDefaultEmail(paramEmail);
    if (paramName) setAuthDefaultName(paramName);
    if (paramPhone) setAuthDefaultPhone(paramPhone);

    const token = localStorage.getItem('token');
    const loggedIn = !!token;
    setIsLoggedIn(loggedIn);

    if (loggedIn && (paramEmail || paramName || paramPhone)) {
      setBookingData(prev => ({
        ...prev,
        name: prev.name || paramName || '',
        email: prev.email || paramEmail || '',
        phoneNumber: prev.phoneNumber || paramPhone || ''
      }));
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
      const token = localStorage.getItem('token');
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

  // Save to sessionStorage whenever step or bookingData changes
  useEffect(() => {
    sessionStorage.setItem('bookingStep', step.toString());
  }, [step]);

  useEffect(() => {
    sessionStorage.setItem('bookingData', JSON.stringify(bookingData));
  }, [bookingData]);

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
  const prevStep = () => setStep((s) => Math.max(s - 1, 1));
  
  const updateData = (newData) => {
    setBookingData((prev) => ({ ...prev, ...newData }));
  };

  const submitBooking = async () => {
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

      const payloadData = {
        ...bookingData,
        source: finalSource
      };

      // --- Course Free Session Zero-Payment Checkout ---
      if (freeSessionInfo.hasFreeSessions && freeSessionInfo.freeSessions > 0) {
        const freeRes = await fetch(`${import.meta.env.VITE_API_URL}/api/appointments`, {
          method: 'POST',
          headers: authHeaders,
          body: JSON.stringify({
            ...payloadData,
            useFreeSession: true
          }),
        });

        if (!freeRes.ok) {
          const errData = await freeRes.json();
          throw new Error(errData.message || 'Failed to book complimentary coaching session');
        }

        const freeData = await freeRes.json();
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

        sessionStorage.removeItem('bookingStep');
        sessionStorage.removeItem('bookingData');
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

      // 3. Create an order
      const orderRes = await fetch(`${import.meta.env.VITE_API_URL}/api/payment/create-order`, {
        method: 'POST',
        headers: authHeaders,
        body: JSON.stringify({ 
          email: bookingData.email,
          phoneNumber: bookingData.phoneNumber,
          sessionDuration: bookingData.sessionDuration || 60,
          currency: 'INR' 
        })
      });
      const orderData = await orderRes.json();
      
      if (!orderRes.ok) {
        throw new Error(orderData.message || 'Failed to create order');
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
          duration: finalDuration,
          isFirstSession: orderData.isFirstSession ?? bookingData.isFirstSession
        }),
      });
      if (!initAppRes.ok) {
        throw new Error('Failed to initialize appointment');
      }
      const initAppData = await initAppRes.json();
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
              updateData({ 
                appointmentId, 
                paidAmount: chargedAmountInRupees 
              });
              sessionStorage.removeItem('bookingStep');
              sessionStorage.removeItem('bookingData');
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
    return <BookingSuccess data={bookingData} fee={currentFee} />;
  }

  // Step 5 is the cancelled screen
  if (step === 5) {
    return <BookingCancelled data={bookingData} onRetry={() => setStep(3)} />;
  }

  return (
    <div className="flex-grow w-full relative flex flex-col pt-16 md:pt-20 pb-8 md:pb-12">
      
      {/* Background Image Layer */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <img 
          src={bookingBg} 
          alt="Desk lamp" 
          className="w-full h-full object-cover object-left opacity-60"
        />
        {/* Gradients to fade the image into black so text stays readable */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#0a0a0a]/40 via-[#0a0a0a]/80 to-[#0a0a0a]" />
        <div className="absolute inset-0 bg-gradient-to-b from-[#0a0a0a]/50 via-transparent to-[#0a0a0a]/90" />
      </div>

      <div className="relative z-10 px-3 sm:px-6 md:px-8 w-full max-w-5xl mx-auto">
        
        {/* Top Left Back Button */}
        {step === 1 && (
          <div className="flex w-full mt-4 sm:mt-6 md:mt-8 mb-4">
            <button 
              onClick={() => navigate(-1)}
              className="flex items-center gap-2 font-sans text-[0.65rem] uppercase tracking-widest text-white/60 hover:text-white hover:text-accent-gold transition-colors"
            >
              <ArrowLeft className="text-base" />
              BACK
            </button>
          </div>
        )}

        {/* Course Student Free Sessions Active Banner */}
        {isLoggedIn && freeSessionInfo?.hasFreeSessions && freeSessionInfo.freeSessions > 0 && (
          <div className="mb-6 sm:mb-8 p-3.5 sm:p-5 rounded-2xl border border-accent-gold/40 bg-gradient-to-r from-accent-gold/20 via-[#15120d] to-[#0a0a0a] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3.5 sm:gap-4 shadow-[0_0_35px_rgba(199,156,110,0.18)]">
            <div className="flex items-start sm:items-center gap-3 sm:gap-3.5 w-full sm:w-auto">
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-accent-gold/20 border border-accent-gold/40 flex items-center justify-center text-accent-gold shrink-0 mt-0.5 sm:mt-0">
                <Sparkle size={18} weight="fill" className="sm:w-5 sm:h-5" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                  <span className="text-white text-xs sm:text-sm font-medium">Mastery Course Benefit Active</span>
                  <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-[0.6rem] sm:text-[0.65rem] font-semibold uppercase tracking-wider">
                    {freeSessionInfo.freeSessions} of 3 Free Sessions Available
                  </span>
                </div>
                <p className="text-white/70 text-[0.72rem] sm:text-xs font-light mt-1 break-words">
                  Account: <span className="text-white font-normal">{bookingData.email || 'Course Student'}</span> • Your session is 100% complimentary (₹0 at checkout).
                </p>
              </div>
            </div>
            <div className="w-full sm:w-auto shrink-0 flex items-center justify-center sm:justify-end">
              <span className="w-full sm:w-auto text-center text-accent-gold font-semibold text-xs tracking-wider uppercase bg-accent-gold/10 px-3.5 py-2 rounded-xl border border-accent-gold/30">
                ₹0 Free Booking
              </span>
            </div>
          </div>
        )}

        {/* Header section based on step */}
        <div className="text-center mb-6">
          <span className="font-sans text-[0.55rem] uppercase tracking-[0.3em] font-medium text-accent-gold block mb-2">
            CHAPTER {step} OF 3
          </span>
          <h1 className="font-serif text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-medium tracking-tight leading-[1.15] text-white mb-3 sm:mb-4">
            {step === 1 && "Let's Find a Time That Works"}
            {step === 2 && "A Little About You"}
            {step === 3 && "Confirm & Secure Your Session"}
          </h1>
          <div className="h-[1px] w-8 bg-accent-gold mx-auto mb-3 sm:mb-4" />
          <p className="text-paragraph text-xs sm:text-sm font-light tracking-wide text-white/80 max-w-lg mx-auto px-2">
            {step === 1 && (
              <>
                You don't need to have everything figured out before you begin.
                <br className="hidden md:block" />
                {" "}This is a space for honest conversation and real clarity.
              </>
            )}
            {step === 2 && (
              <>
                This helps me understand you better before we meet.
                <br className="hidden md:block" />
                {" "}Share only what you're comfortable with.
              </>
            )}
            {step === 3 && (
              <>
                Almost there. Review your session details
                <br className="hidden md:block" />
                {" "}and let's make it official.
              </>
            )}
          </p>
        </div>

        {/* Main Booking Card */}
        <div className="bg-[#0f0f0f] border border-white/5 rounded-2xl overflow-hidden relative shadow-2xl">
          
          {/* Subtle top glow */}
          <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-accent-gold/20 to-transparent" />
          
          <div className="p-4 sm:p-6 md:p-8">
            <BookingStepper currentStep={step} />

            <div className="mt-8">
              {step === 1 && (
                <Step1Time 
                  data={bookingData} 
                  updateData={updateData} 
                  onNext={nextStep} 
                  onBack={prevStep}
                  freeSessionInfo={freeSessionInfo}
                />
              )}
              {step === 2 && (
                <Step2Details 
                  data={bookingData} 
                  updateData={updateData} 
                  onNext={nextStep} 
                  isAuthenticated={!!localStorage.getItem('token')}
                  freeSessionInfo={freeSessionInfo}
                />
              )}
              {step === 3 && (
                <Step3Confirm 
                  data={bookingData} 
                  fee={currentFee}
                  freeSessionInfo={freeSessionInfo}
                  onNext={submitBooking} 
                  onBack={prevStep} 
                  isLoading={isLoading}
                  error={error}
                />
              )}
            </div>
          </div>
        </div>

        {/* Footer Note */}
        <div className="mt-6 flex flex-col items-center justify-center gap-1">
          <div className="flex items-center gap-2">
            {/* Lock Icon */}
            <svg width="14" height="16" viewBox="0 0 14 16" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M11.6667 7.33333H2.33333C1.59695 7.33333 1 7.93029 1 8.66667V13.3333C1 14.0697 1.59695 14.6667 2.33333 14.6667H11.6667C12.403 14.6667 13 14.0697 13 13.3333V8.66667C13 7.93029 12.403 7.33333 11.6667 7.33333Z" stroke="#B98A56" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M4.3335 7.33333V4.66667C4.3335 3.95942 4.61445 3.28115 5.11455 2.78105C5.61465 2.28095 6.29292 2 7.00016 2C7.70741 2 8.38568 2.28095 8.88578 2.78105C9.38588 3.28115 9.66683 3.95942 9.66683 4.66667V7.33333" stroke="#B98A56" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <span className="font-sans text-xs text-white">Your information is private and only visible to me.</span>
          </div>
          <span className="font-sans text-xs text-white">It helps me show up better for you.</span>
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
