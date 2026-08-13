import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft } from '@phosphor-icons/react';
import BookingStepper from '../components/booking/BookingStepper';
import Step1Time from '../components/booking/Step1Time';
import Step2Details from '../components/booking/Step2Details';
import Step3Confirm from '../components/booking/Step3Confirm';
import BookingSuccess from '../components/booking/BookingSuccess';
import bookingBg from '../assets/images/booking_bg_lamp.png';

export default function Booking() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [bookingData, setBookingData] = useState(() => {
    const saved = localStorage.getItem('userInfo');
    const userInfo = saved ? JSON.parse(saved) : {};
    return {
      date: null,
      time: null,
      name: userInfo.fullName || '',
      email: userInfo.email || '',
      source: '',
      reason: '',
      extra: '',
    };
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // Always scroll to top when landing on the booking page
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

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
      if (!token) {
        setError('Please log in to book an appointment.');
        setIsLoading(false);
        return;
      }

      const res = await fetch('https://meet-with-aarkesh.onrender.com/api/appointments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(bookingData),
      });

      if (res.ok) {
        nextStep();
      } else {
        const data = await res.json();
        setError(data.message || 'Failed to book appointment');
      }
    } catch (err) {
      console.error(err);
      setError('Network error');
    } finally {
      setIsLoading(false);
    }
  };

  // Step 4 is the success screen
  if (step === 4) {
    return <BookingSuccess data={bookingData} />;
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

      <div className="relative z-10 px-4 md:px-8 w-full max-w-5xl mx-auto">
        
        {/* Top Left Back Button */}
        {step === 1 && (
          <div className="flex w-full mt-6 md:mt-8 mb-4">
            <button 
              onClick={() => navigate(-1)}
              className="flex items-center gap-2 font-sans text-[0.65rem] uppercase tracking-widest text-white/60 hover:text-white hover:text-accent-gold transition-colors"
            >
              <ArrowLeft className="text-base" />
              BACK
            </button>
          </div>
        )}

        {/* Header section based on step */}
        <div className="text-center mb-4">
          <span className="font-sans text-[0.55rem] uppercase tracking-[0.3em] font-medium text-accent-gold block mb-2">
            CHAPTER {step} OF 3
          </span>
          <h1 className="font-serif text-3xl md:text-4xl lg:text-5xl font-medium tracking-tight leading-[1.1] text-white mb-4">
            {step === 1 && "Let's Find a Time That Works"}
            {step === 2 && "A Little About You"}
            {step === 3 && "Confirm & Secure Your Session"}
          </h1>
          <div className="h-[1px] w-8 bg-accent-gold mx-auto mb-4" />
          <p className="text-paragraph text-sm font-light tracking-wide text-white/80 max-w-lg mx-auto">
            {step === 1 && (
              <>
                You don't need to have everything figured out before you begin.
                <br className="hidden md:block" />
                This is a space for honest conversation and real clarity.
              </>
            )}
            {step === 2 && (
              <>
                This helps me understand you better before we meet.
                <br className="hidden md:block" />
                Share only what you're comfortable with.
              </>
            )}
            {step === 3 && (
              <>
                Almost there. Review your session details
                <br className="hidden md:block" />
                and let's make it official.
              </>
            )}
          </p>
        </div>

        {/* Main Booking Card */}
        <div className="bg-[#0f0f0f] border border-white/5 rounded-2xl overflow-hidden relative shadow-2xl">
          
          {/* Subtle top glow */}
          <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-accent-gold/20 to-transparent" />
          
          <div className="p-6 md:p-8">
            <BookingStepper currentStep={step} />

            <div className="mt-8">
              {step === 1 && (
                <Step1Time 
                  data={bookingData} 
                  updateData={updateData} 
                  onNext={nextStep} 
                />
              )}
              {step === 2 && (
                <Step2Details 
                  data={bookingData} 
                  updateData={updateData} 
                  onNext={nextStep} 
                  onBack={prevStep} 
                />
              )}
              {step === 3 && (
                <Step3Confirm 
                  data={bookingData} 
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
    </div>
  );
}
