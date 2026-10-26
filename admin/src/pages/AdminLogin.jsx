import React, { useState, useEffect, useRef } from 'react';
import { 
  LockKey, 
  EnvelopeSimple, 
  ArrowRight, 
  ArrowLeft, 
  ArrowsClockwise, 
  CheckCircle, 
  WarningCircle, 
  ShieldCheck, 
  Key 
} from '@phosphor-icons/react';
import { API_URL } from '../utils/apiUrl';

// STRICT Whitelist baseline for immediate pre-check (dynamically refreshed on mount)
const DEFAULT_ALLOWED_EMAILS = [
  'guptaaarkesh1@gmail.com',
  'admin@aarkeshgupta.com',
  'admin@betterwithaarkesh.com',
  'yashrajsingh28359@gmail.com',
  'gauravajm@gmail.com',
  'merakimovies@gmail.com',
];

export default function AdminLogin({ onLogin }) {
  // Steps: 'email' | 'otp'
  const [step, setStep] = useState('email');
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [allowedEmails, setAllowedEmails] = useState(DEFAULT_ALLOWED_EMAILS);
  const [cooldown, setCooldown] = useState(0);

  const otpInputRef = useRef(null);

  // Sync latest dynamic authorized emails from backend on mount
  useEffect(() => {
    let isMounted = true;
    const fetchAllowedEmails = async () => {
      try {
        const res = await fetch(`${API_URL}/api/admin/auth/allowed-emails`);
        const data = await res.json();
        if (isMounted && data.success && Array.isArray(data.emails) && data.emails.length > 0) {
          setAllowedEmails(data.emails.map((e) => e.trim().toLowerCase()));
        }
      } catch (_) {
        // Fallback to DEFAULT_ALLOWED_EMAILS silently
      }
    };
    fetchAllowedEmails();
    return () => { isMounted = false; };
  }, []);

  // Countdown timer for Resend OTP cooldown
  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setInterval(() => {
      setCooldown((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [cooldown]);

  // Auto-focus OTP input when switching to OTP step
  useEffect(() => {
    if (step === 'otp') {
      setTimeout(() => otpInputRef.current?.focus(), 150);
    }
  }, [step]);

  // Step 1: Request OTP
  const handleRequestOtp = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');

    const cleanEmail = email.trim().toLowerCase();

    if (!cleanEmail) {
      setError('Please enter your administrator email address.');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(cleanEmail)) {
      setError('Please enter a valid email address.');
      return;
    }

    // STRICT Whitelist validation: Only authorized emails are allowed
    if (allowedEmails.length > 0 && !allowedEmails.includes(cleanEmail)) {
      setError('Access Denied: This email is not authorized for Admin access. Only whitelisted administrators are permitted.');
      return;
    }

    setLoading(true);

    try {
      const res = await fetch(`${API_URL}/api/admin/auth/send-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: cleanEmail }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        setStep('otp');
        setOtp('');
        setCooldown(data.cooldownSeconds || 30);
        setSuccessMsg(data.message || `Verification code sent to ${cleanEmail}`);
      } else {
        setError(data.message || 'Unable to send verification code. Please try again.');
        if (data.cooldownRemaining) {
          setCooldown(data.cooldownRemaining);
        }
      }
    } catch (err) {
      setError('Connection error. Please ensure the server is running and try again.');
    } finally {
      setLoading(false);
    }
  };

  // Resend OTP handler
  const handleResendOtp = async () => {
    if (cooldown > 0 || resending) return;
    setError('');
    setSuccessMsg('');
    setResending(true);

    const cleanEmail = email.trim().toLowerCase();

    try {
      const res = await fetch(`${API_URL}/api/admin/auth/resend-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: cleanEmail }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        setCooldown(data.cooldownSeconds || 30);
        setSuccessMsg(data.message || 'New verification code sent to your email.');
      } else {
        setError(data.message || 'Failed to resend code.');
        if (data.cooldownRemaining) {
          setCooldown(data.cooldownRemaining);
        }
      }
    } catch (err) {
      setError('Network error while resending verification code.');
    } finally {
      setResending(false);
    }
  };

  // Step 2: Verify OTP
  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');

    const cleanEmail = email.trim().toLowerCase();
    const cleanOtp = otp.trim();

    if (!cleanOtp) {
      setError('Please enter the 4-digit verification code.');
      return;
    }

    if (cleanOtp.length < 4) {
      setError('Please enter all 4 digits of the verification code.');
      return;
    }

    setLoading(true);

    try {
      const res = await fetch(`${API_URL}/api/admin/auth/verify-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: cleanEmail,
          otp: cleanOtp,
        }),
      });

      const data = await res.json();

      if (res.ok && data.success && data.token) {
        // Store session in localStorage
        localStorage.setItem('adminToken', data.token);
        localStorage.setItem('adminEmail', cleanEmail);
        if (data.admin?.fullName) {
          localStorage.setItem('adminName', data.admin.fullName);
        }
        
        onLogin(true);
      } else {
        setError(data.message || 'Invalid or expired verification code.');
      }
    } catch (err) {
      setError('Verification failed due to a network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full min-h-screen bg-[#F5F0E8] flex items-center justify-center p-4 sm:p-6 font-sans">
      <div className="w-full max-w-[420px] bg-white border border-black/[0.08] rounded-2xl p-7 sm:p-9 shadow-xl flex flex-col items-center">
        
        {/* Top Icon Badge */}
        <div className="w-14 h-14 rounded-full bg-[#c9542f]/10 border border-[#c9542f]/25 flex items-center justify-center mb-5">
          {step === 'email' ? (
            <LockKey size={26} className="text-[#c9542f]" weight="duotone" />
          ) : (
            <Key size={26} className="text-[#c9542f]" weight="duotone" />
          )}
        </div>

        {/* Title & Subtitle */}
        <h1 className="font-serif text-2xl sm:text-3xl font-medium text-gray-900 mb-1.5 text-center tracking-tight">
          Admin Portal
        </h1>
        <p className="font-sans text-xs sm:text-sm text-gray-500 mb-6 text-center leading-relaxed">
          {step === 'email' 
            ? 'Enter your credentials to access the dashboard.' 
            : 'Enter the verification passcode sent to your authorized email.'}
        </p>

        {/* Error Notification */}
        {error && (
          <div className="w-full mb-5 p-3.5 bg-red-50/90 border border-red-200/80 rounded-xl text-red-700 text-xs font-medium flex items-start gap-2.5 animate-in fade-in duration-200">
            <WarningCircle size={18} className="text-red-500 shrink-0 mt-0.5" weight="fill" />
            <span className="leading-snug">{error}</span>
          </div>
        )}

        {/* Success Notification */}
        {successMsg && (
          <div className="w-full mb-5 p-3.5 bg-emerald-50/90 border border-emerald-200/80 rounded-xl text-emerald-800 text-xs font-medium flex items-start gap-2.5 animate-in fade-in duration-200">
            <CheckCircle size={18} className="text-emerald-600 shrink-0 mt-0.5" weight="fill" />
            <span className="leading-snug">{successMsg}</span>
          </div>
        )}

        {step === 'email' ? (
          /* ================= STEP 1: EMAIL INPUT ================= */
          <form onSubmit={handleRequestOtp} className="w-full flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <label 
                htmlFor="admin-email-input" 
                className="font-sans text-[11px] uppercase tracking-wider font-semibold text-gray-600"
              >
                Email Address
              </label>
              <div className="relative w-full">
                <input
                  id="admin-email-input"
                  type="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (error) setError('');
                  }}
                  className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-[#c9542f] focus:ring-1 focus:ring-[#c9542f] transition-all font-medium"
                  placeholder="admin@aarkeshgupta.com"
                  autoComplete="email"
                  autoFocus
                  required
                />
              </div>
              <p className="text-[11px] text-gray-400 mt-1 flex items-center gap-1.5">
                <ShieldCheck size={14} className="text-[#c9542f] shrink-0" weight="fill" />
                <span>Strictly restricted to authorized administrator accounts.</span>
              </p>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 py-3.5 px-4 rounded-xl bg-[#c9542f] hover:bg-[#a64117] text-white font-sans text-xs uppercase tracking-wider font-semibold transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer shadow-md hover:shadow-lg disabled:opacity-60 disabled:cursor-not-allowed group"
            >
              {loading ? (
                <>
                  <ArrowsClockwise size={16} className="animate-spin text-white" />
                  <span>Sending Code...</span>
                </>
              ) : (
                <>
                  <span>Send Verification Code</span>
                  <ArrowRight size={16} className="group-hover:translate-x-0.5 transition-transform" />
                </>
              )}
            </button>
          </form>
        ) : (
          /* ================= STEP 2: OTP VERIFICATION ================= */
          <form onSubmit={handleVerifyOtp} className="w-full flex flex-col gap-4">
            <div className="flex items-center justify-between pb-1">
              <button
                type="button"
                onClick={() => {
                  setStep('email');
                  setError('');
                  setSuccessMsg('');
                }}
                className="text-xs font-semibold text-gray-500 hover:text-gray-900 transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <ArrowLeft size={14} />
                <span>Change Email</span>
              </button>
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#c9542f] bg-[#c9542f]/10 px-2.5 py-0.5 rounded-full border border-[#c9542f]/20">
                Step 2 of 2
              </span>
            </div>

            <div className="p-3 bg-[#FAF7F2] border border-[#EAE3D9] rounded-xl flex items-center gap-2.5 text-xs font-semibold text-gray-800">
              <EnvelopeSimple size={16} className="text-[#c9542f] shrink-0" weight="fill" />
              <span className="truncate">{email}</span>
            </div>

            <div className="flex flex-col gap-1.5 mt-1">
              <label 
                htmlFor="admin-otp-input" 
                className="font-sans text-[11px] uppercase tracking-wider font-semibold text-gray-600"
              >
                One-Time Passcode (OTP)
              </label>
              <input
                id="admin-otp-input"
                ref={otpInputRef}
                type="text"
                inputMode="numeric"
                value={otp}
                onChange={(e) => {
                  const val = e.target.value.replace(/\D/g, '').slice(0, 4);
                  setOtp(val);
                  if (error) setError('');
                }}
                className="w-full text-center tracking-[0.6em] text-2xl font-mono font-bold py-3 bg-[#FAF8F5] border border-gray-200 rounded-xl text-[#c9542f] placeholder-gray-300 focus:outline-none focus:border-[#c9542f] focus:ring-1 focus:ring-[#c9542f] transition-all"
                placeholder="••••"
                maxLength={4}
                required
              />

              <div className="flex items-center justify-between pt-1 text-[11px]">
                <span className="text-gray-400">Valid for 2 minutes</span>
                
                {cooldown > 0 ? (
                  <span className="font-semibold text-gray-400">
                    Resend in {cooldown}s
                  </span>
                ) : (
                  <button
                    type="button"
                    onClick={handleResendOtp}
                    disabled={resending}
                    className="font-semibold text-[#c9542f] hover:text-[#a64117] hover:underline transition-colors cursor-pointer flex items-center gap-1 disabled:opacity-50"
                  >
                    {resending ? (
                      <>
                        <ArrowsClockwise size={12} className="animate-spin" />
                        <span>Resending...</span>
                      </>
                    ) : (
                      <span>Resend Code</span>
                    )}
                  </button>
                )}
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || otp.trim().length < 4}
              className="w-full mt-2 py-3.5 px-4 rounded-xl bg-[#c9542f] hover:bg-[#a64117] text-white font-sans text-xs uppercase tracking-wider font-semibold transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed group"
            >
              {loading ? (
                <>
                  <ArrowsClockwise size={16} className="animate-spin text-white" />
                  <span>Verifying Code...</span>
                </>
              ) : (
                <>
                  <span>Verify & Enter Admin Portal</span>
                  <ArrowRight size={16} className="group-hover:translate-x-0.5 transition-transform" />
                </>
              )}
            </button>
          </form>
        )}

        {/* Security Footer Notice */}
        <div className="w-full mt-7 pt-5 border-t border-gray-100 flex items-center justify-center text-center">
          <p className="text-[11px] text-gray-400 flex items-center justify-center gap-1.5 font-medium">
            <ShieldCheck size={15} className="text-[#c9542f]" weight="fill" />
            <span>Multi-Factor OTP Protected • BWA Admin Portal</span>
          </p>
        </div>

      </div>
    </div>
  );
}
