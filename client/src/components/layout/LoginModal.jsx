import { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, Eye, EyeSlash } from '@phosphor-icons/react';
import Button from '../ui/Button';
import GoogleLoginButton from '../ui/GoogleLoginButton';
import { COUNTRY_CODES } from '../../utils/countryCodes';

export default function LoginModal({ isOpen, onClose, onSuccess, defaultMode = 'login', defaultCountryCode = '+91', defaultPhoneNumber = '', defaultEmail = '', defaultFullName = '', courseNotice = false }) {
  const [isLogin, setIsLogin] = useState(defaultMode === 'login');
  const [showPassword, setShowPassword] = useState(false);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [fullName, setFullName] = useState(defaultFullName || '');
  const [email, setEmail] = useState(defaultEmail || '');
  const [countryCode, setCountryCode] = useState(defaultCountryCode);
  const [phoneNumber, setPhoneNumber] = useState(defaultPhoneNumber);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isOtpStep, setIsOtpStep] = useState(false);
  const [otpValues, setOtpValues] = useState(['', '', '', '']);
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [isForgotOtpStep, setIsForgotOtpStep] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  const [isOtpLogin, setIsOtpLogin] = useState(false);
  const [isLoginOtpStep, setIsLoginOtpStep] = useState(false);
  const [loginOtpTargetEmail, setLoginOtpTargetEmail] = useState('');
  const [maskedLoginEmail, setMaskedLoginEmail] = useState('');
  
  const otpRefs = [useRef(null), useRef(null), useRef(null), useRef(null)];

  // Resend OTP cooldown timer
  useEffect(() => {
    let timer;
    if (resendCooldown > 0) {
      timer = setInterval(() => {
        setResendCooldown((c) => (c > 0 ? c - 1 : 0));
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [resendCooldown]);

  useEffect(() => {
    if (isOpen) {
      setIsLogin(defaultMode === 'login');
      setShowPassword(false);
      setPassword('');
      setConfirmPassword('');
      setFullName(defaultFullName || '');
      setEmail(defaultEmail || (defaultMode === 'login' && defaultPhoneNumber ? defaultPhoneNumber : ''));
      setCountryCode(defaultCountryCode || '+91');
      setPhoneNumber(defaultPhoneNumber || '');
      setError('');
      setIsLoading(false);
      setIsOtpStep(false);
      setOtpValues(['', '', '', '']);
      setIsForgotPassword(false);
      setIsForgotOtpStep(false);
      setIsOtpLogin(false);
      setIsLoginOtpStep(false);
      setLoginOtpTargetEmail('');
      setMaskedLoginEmail('');
      setResendCooldown(0);
    }
  }, [isOpen, defaultMode, defaultEmail, defaultFullName, defaultCountryCode, defaultPhoneNumber]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (isOtpLogin) {
      if (!isLoginOtpStep) {
        if (!email.trim()) {
          setError('Please enter your registered email address');
          return;
        }
        const rfcEmailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/;
        if (!rfcEmailRegex.test(email.trim().toLowerCase())) {
          setError('Please enter a valid email address.');
          return;
        }
      } else {
        if (otpValues.join('').length !== 4) {
          setError('Please enter the 4-digit OTP');
          return;
        }
      }
    } else if (!isLogin && !isForgotPassword) {
      if (!isOtpStep) {
        if (!fullName.trim()) {
          setError('Please enter your full name');
          return;
        }
        if (!email.trim()) {
          setError('Please enter your email address');
          return;
        }
        const rfcEmailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/;
        if (!rfcEmailRegex.test(email.trim().toLowerCase())) {
          setError('Please enter a valid email address.');
          return;
        }
        if (phoneNumber.length !== 10) {
          setError('Phone number must be exactly 10 digits');
          return;
        }
        if (password.length < 4) {
          setError('Password must be at least 4 characters long');
          return;
        }
        if (password !== confirmPassword) {
          setError('Passwords do not match');
          return;
        }
      } else {
        if (otpValues.join('').length !== 4) {
          setError('Please enter the 4-digit OTP');
          return;
        }
      }
    } else if (isForgotPassword && isForgotOtpStep) {
      if (otpValues.join('').length !== 4) {
        setError('Please enter the 4-digit OTP');
        return;
      }
      if (password.length < 4) {
        setError('Password must be at least 4 characters long');
        return;
      }
      if (password !== confirmPassword) {
        setError('Passwords do not match');
        return;
      }
    }

    setIsLoading(true);
    try {
      const API_URL = import.meta.env.VITE_API_URL || '';
      let endpoint = `${API_URL}/api/auth/login`;
      let body = { email, password };

      if (isOtpLogin) {
        if (!isLoginOtpStep) {
          endpoint = `${API_URL}/api/auth/login-otp-init`;
          body = { email: email.trim() };
        } else {
          endpoint = `${API_URL}/api/auth/login-otp-verify`;
          body = { email: loginOtpTargetEmail || email.trim(), otp: otpValues.join('') };
        }
      } else if (isForgotPassword) {
        if (!isForgotOtpStep) {
          if (!email.trim()) {
            setError('Please enter your email address');
            return;
          }
          const rfcEmailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/;
          if (!rfcEmailRegex.test(email.trim().toLowerCase())) {
            setError('Please enter a valid email address.');
            return;
          }
          endpoint = `${API_URL}/api/auth/forgot-password-init`;
          body = { email };
        } else {
          endpoint = `${API_URL}/api/auth/forgot-password-reset`;
          body = { email, otp: otpValues.join(''), newPassword: password };
        }
      } else if (!isLogin) {
        if (!isOtpStep) {
          endpoint = `${API_URL}/api/auth/register-init`;
          body = { fullName, email, password, countryCode, phoneNumber };
        } else {
          endpoint = `${API_URL}/api/auth/register-verify`;
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
        if (isOtpLogin) {
          if (!isLoginOtpStep) {
            setIsLoginOtpStep(true);
            setLoginOtpTargetEmail(data.email || email.trim());
            setMaskedLoginEmail(data.maskedEmail || '');
            setOtpValues(['', '', '', '']);
            setResendCooldown(45);
            setError('');
          } else {
            // Login with OTP succeeded
            localStorage.setItem('token', data.token);
            localStorage.setItem('userInfo', JSON.stringify({ 
              fullName: data.fullName, 
              email: data.email,
              phoneNumber: data.phoneNumber,
              countryCode: data.countryCode,
              dob: data.dob,
              gender: data.gender,
              freeSessions: data.freeSessions,
              courseSessionsGranted: data.courseSessionsGranted
            }));
            if (data.courseToken) {
              localStorage.setItem('courseToken', data.courseToken);
              localStorage.setItem('courseUser', JSON.stringify({
                _id: data.courseUserId || data._id,
                fullName: data.fullName,
                email: data.email,
                phoneNumber: data.phoneNumber || '',
              }));
            }
            window.dispatchEvent(new Event('auth-change'));
            onSuccess({ ...data, isRegister: false });
          }
        } else if (isForgotPassword) {
          if (!isForgotOtpStep) {
            setIsForgotOtpStep(true);
            setError('');
            setResendCooldown(45);
          } else {
            setIsForgotPassword(false);
            setIsForgotOtpStep(false);
            setIsLogin(true);
            setOtpValues(['', '', '', '']);
            setPassword('');
            setConfirmPassword('');
            setError('');
          }
        } else if (!isLogin) {
          if (!isOtpStep) {
            // Register init succeeded -> move to OTP verification step
            setIsOtpStep(true);
            setError('');
            setOtpValues(['', '', '', '']);
            setResendCooldown(45);
          } else {
            // Register verify succeeded with OTP -> complete login & onboarding
            localStorage.setItem('token', data.token);
            localStorage.setItem('userInfo', JSON.stringify({ 
              fullName: data.fullName, 
              email: data.email,
              phoneNumber: data.phoneNumber,
              countryCode: data.countryCode,
              dob: data.dob,
              gender: data.gender,
              freeSessions: data.freeSessions,
              courseSessionsGranted: data.courseSessionsGranted
            }));
            if (data.courseToken) {
              localStorage.setItem('courseToken', data.courseToken);
              localStorage.setItem('courseUser', JSON.stringify({
                _id: data.courseUserId || data._id,
                fullName: data.fullName,
                email: data.email,
                phoneNumber: data.phoneNumber || '',
              }));
            }
            window.dispatchEvent(new Event('auth-change'));
            onSuccess({ ...data, isRegister: true });
          }
        } else {
          // Normal Login succeeded
          localStorage.setItem('token', data.token);
          localStorage.setItem('userInfo', JSON.stringify({ 
            fullName: data.fullName, 
            email: data.email,
            phoneNumber: data.phoneNumber,
            countryCode: data.countryCode,
            dob: data.dob,
            gender: data.gender,
            freeSessions: data.freeSessions,
            courseSessionsGranted: data.courseSessionsGranted
          }));
          if (data.courseToken) {
            localStorage.setItem('courseToken', data.courseToken);
            localStorage.setItem('courseUser', JSON.stringify({
              _id: data.courseUserId || data._id,
              fullName: data.fullName,
              email: data.email,
              phoneNumber: data.phoneNumber || '',
            }));
          }
          window.dispatchEvent(new Event('auth-change'));
          onSuccess({ ...data, isRegister: false });
        }
      } else {
        // Handle special case: course student already has a booking account → switch to login
        if (res.status === 409 && data.redirectToLogin) {
          setIsLogin(true);
          setIsOtpStep(false);
          setError('You already have a booking account with this email. Please sign in to access your free sessions.');
        } else {
          setError(data.message || 'Authentication failed');
        }
      }
    } catch (err) {
      console.error(err);
      setError('Network error, please try again later');
    } finally {
      setIsLoading(false);
    }
  };

  const handleOtpChange = (index, value) => {
    if (!/^\d*$/.test(value)) return;
    const newOtp = [...otpValues];
    newOtp[index] = value;
    setOtpValues(newOtp);

    // Auto-focus next input
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
    setIsLogin(!isLogin);
    setIsOtpLogin(false);
    setIsLoginOtpStep(false);
    setLoginOtpTargetEmail('');
    setMaskedLoginEmail('');
    setIsOtpStep(false);
    setIsForgotPassword(false);
    setIsForgotOtpStep(false);
    setOtpValues(['', '', '', '']);
    setError('');
    setPassword('');
    setConfirmPassword('');
    setFullName(defaultFullName || '');
    setEmail(defaultEmail || '');
    setCountryCode(defaultCountryCode || '+91');
    setPhoneNumber(defaultPhoneNumber || '');
  };

  return createPortal(
    <div 
      className="fixed inset-0 z-[250] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4" 
    >
      <style>{`
        input:-webkit-autofill,
        input:-webkit-autofill:hover, 
        input:-webkit-autofill:focus, 
        input:-webkit-autofill:active {
          -webkit-box-shadow: 0 0 0px 1000px #ffffff inset !important;
          box-shadow: 0 0 0px 1000px #ffffff inset !important;
          -webkit-text-fill-color: #111010 !important;
          caret-color: #c9542f !important;
          color: #111010 !important;
          transition: background-color 5000s ease-in-out 0s !important;
        }
      `}</style>
      <div 
        className="relative w-full max-w-md bg-[#f5f1e8] border border-black/10 p-8 sm:p-9 shadow-[0_20px_60px_rgba(0,0,0,0.15)] rounded-2xl"
      >
        <button 
          onClick={() => {
            if (isLoginOtpStep) {
              setIsLoginOtpStep(false);
            } else if (isOtpStep) {
              setIsOtpStep(false);
            } else if (isForgotOtpStep) {
              setIsForgotOtpStep(false);
            } else if (isOtpLogin) {
              setIsOtpLogin(false);
            } else {
              onClose();
            }
          }}
          className="absolute top-5 right-5 text-[#111010]/40 hover:text-[#c9542f] transition-colors cursor-pointer"
        >
          <X size={22} />
        </button>

        <div className="flex items-center gap-3 mb-2">
          <div className="h-[1.5px] w-5 bg-[#c9542f]" />
          <span className="font-sans text-[0.65rem] uppercase tracking-[0.25em] font-bold text-[#c9542f]">
            {isLogin ? (isOtpLogin ? 'OTP ACCESS' : 'ACCOUNT ACCESS') : 'MEMBER ONBOARDING'}
          </span>
        </div>

        <h2 className="font-serif text-3xl sm:text-[2rem] font-medium text-[#111010] tracking-tight mb-1.5">
          {isForgotPassword 
            ? (isForgotOtpStep ? 'Reset Password' : 'Forgot Password')
            : isOtpLogin
            ? (isLoginOtpStep ? 'Verify OTP' : 'Sign In with OTP')
            : (!isOtpStep ? (isLogin ? 'Welcome Back' : 'Begin Your Journey') : 'Verify Email')}
        </h2>
        <p className="text-[#555047] font-sans text-xs tracking-wide mb-6">
          {isForgotPassword
            ? (isForgotOtpStep ? `Enter the 4-digit OTP sent to ${email} and your new password` : 'Enter your email address to reset your password')
            : isOtpLogin
            ? (isLoginOtpStep ? `Enter the 4-digit OTP sent to ${maskedLoginEmail || loginOtpTargetEmail || email}` : 'Enter your registered email to receive a secure OTP')
            : (!isOtpStep 
              ? (isLogin ? 'Enter your details to continue' : 'Create an account to access exclusive content')
              : `Enter the 4-digit OTP sent to ${email}`)
          }
        </p>

        {/* Course Student Notice */}
        {courseNotice && !isForgotPassword && (
          <div className="mb-6 p-3.5 rounded-xl border border-[#c9542f]/30 bg-[#fbf0eb] flex items-start gap-3">
            <span className="text-base leading-none mt-0.5">✨</span>
            <div>
              <p className="text-[#c9542f] text-xs font-semibold">Mastery Course Member</p>
              <p className="text-[#555047] text-[0.72rem] font-light mt-0.5 leading-relaxed">
                {isLogin 
                  ? `Sign in with your course email (${defaultEmail || email || 'your email'}) to access your 3 free coaching sessions.`
                  : `Register with your course email (${defaultEmail || email || 'your email'}) to instantly claim your 3 free coaching sessions.`}
              </p>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {!isOtpStep && !isForgotOtpStep && !isLoginOtpStep ? (
            <>
              {(!isLogin && !isForgotPassword) && (
                <div>
                  <label className="block font-sans text-[0.68rem] uppercase tracking-[0.2em] font-bold text-[#c9542f] mb-1.5">
                    Full Name
                  </label>
                  <input 
                    type="text" 
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full bg-white/80 border border-black/10 focus:border-[#c9542f] rounded-xl px-4 py-2.5 text-[#111010] font-sans focus:outline-none focus:bg-white transition-all placeholder:text-[#7a756b]/40 shadow-2xs"
                    placeholder="John Doe"
                  />
                </div>
              )}

              <div>
                <label className="block font-sans text-[0.68rem] uppercase tracking-[0.2em] font-bold text-[#c9542f] mb-1.5">
                  {isOtpLogin ? 'Email Address' : (isLogin ? 'Email Address or Mobile' : 'Email Address')}
                </label>
                <input 
                  type={isOtpLogin ? 'email' : (isLogin ? 'text' : 'email')} 
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-white/80 border border-black/10 focus:border-[#c9542f] rounded-xl px-4 py-2.5 text-[#111010] font-sans focus:outline-none focus:bg-white transition-all placeholder:text-[#7a756b]/40 shadow-2xs"
                  placeholder={isOtpLogin ? "name@example.com" : (isLogin ? "Email or 10-digit mobile number" : "john@example.com")}
                />
              </div>

              {(!isLogin && !isForgotPassword) && (
                <div>
                  <label className="block font-sans text-[0.68rem] uppercase tracking-[0.2em] font-bold text-[#c9542f] mb-1.5">
                    Phone Number
                  </label>
                  <div className="flex items-center bg-white/80 border border-black/10 focus-within:border-[#c9542f] rounded-xl px-3 py-1.5 transition-all focus-within:bg-white shadow-2xs">
                    <select 
                      className="bg-transparent text-[#111010] font-sans focus:outline-none appearance-none pr-2 cursor-pointer outline-none text-sm font-medium"
                      value={countryCode}
                      onChange={(e) => setCountryCode(e.target.value)}
                    >
                      {COUNTRY_CODES.map((country, index) => (
                        <option key={`${country.code}-${index}`} value={country.code} className="bg-white text-[#111010]">
                          {country.label}
                        </option>
                      ))}
                    </select>
                    <div className="w-[1px] h-5 bg-black/15 mx-2.5"></div>
                    <input 
                      type="tel" 
                      required
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value.replace(/\D/g, ''))}
                      maxLength={10}
                      className="w-full bg-transparent text-[#111010] font-sans focus:outline-none placeholder:text-[#7a756b]/40 py-1"
                      placeholder="0000000000"
                    />
                  </div>
                </div>
              )}

              {!isForgotPassword && !isOtpLogin && (
                <div>
                  <label className="block font-sans text-[0.68rem] uppercase tracking-[0.2em] font-bold text-[#c9542f] mb-1.5">
                    Password
                  </label>
                  <div className="relative">
                    <input 
                      type={showPassword ? "text" : "password"} 
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full bg-white/80 border border-black/10 focus:border-[#c9542f] rounded-xl px-4 py-2.5 text-[#111010] font-sans focus:outline-none focus:bg-white transition-all placeholder:text-[#7a756b]/40 pr-10 shadow-2xs"
                      placeholder="••••••••"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#7a756b] hover:text-[#c9542f] transition-colors cursor-pointer"
                    >
                      {showPassword ? <EyeSlash size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                  {isLogin && (
                    <div className="flex justify-end mt-1.5">
                      <button 
                        type="button"
                        onClick={() => {
                          setIsForgotPassword(true);
                          setError('');
                        }}
                        className="font-sans text-[0.65rem] uppercase tracking-[0.16em] font-bold text-[#7a756b] hover:text-[#c9542f] transition-colors cursor-pointer"
                      >
                        Forgot Password?
                      </button>
                    </div>
                  )}
                </div>
              )}

              {(!isLogin && !isForgotPassword) && (
                <div>
                  <label className="block font-sans text-[0.68rem] uppercase tracking-[0.2em] font-bold text-[#c9542f] mb-1.5">
                    Confirm Password
                  </label>
                  <div className="relative">
                    <input 
                      type={showPassword ? "text" : "password"} 
                      required
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="w-full bg-white/80 border border-black/10 focus:border-[#c9542f] rounded-xl px-4 py-2.5 text-[#111010] font-sans focus:outline-none focus:bg-white transition-all placeholder:text-[#7a756b]/40 pr-10 shadow-2xs"
                      placeholder="••••••••"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#7a756b] hover:text-[#c9542f] transition-colors cursor-pointer"
                    >
                      {showPassword ? <EyeSlash size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="flex flex-col gap-6 py-4">
              <div className="flex justify-center gap-3 sm:gap-4">
                {otpValues.map((digit, index) => (
                  <input
                    key={index}
                    ref={otpRefs[index]}
                    type="text"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleOtpChange(index, e.target.value)}
                    onKeyDown={(e) => handleOtpKeyDown(index, e)}
                    className="w-12 h-14 sm:w-14 sm:h-14 text-center bg-white border border-black/15 text-[#111010] font-sans text-2xl font-bold rounded-xl focus:outline-none focus:border-[#c9542f] shadow-2xs transition-colors"
                  />
                ))}
              </div>

              {isForgotPassword && (
                <>
                  <div>
                    <label className="block font-sans text-[0.68rem] uppercase tracking-[0.2em] font-bold text-[#c9542f] mb-1.5">
                      New Password
                    </label>
                    <div className="relative">
                      <input 
                        type={showPassword ? "text" : "password"} 
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full bg-white/80 border border-black/10 focus:border-[#c9542f] rounded-xl px-4 py-2.5 text-[#111010] font-sans focus:outline-none focus:bg-white transition-all placeholder:text-[#7a756b]/40 pr-10 shadow-2xs"
                        placeholder="••••••••"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#7a756b] hover:text-[#c9542f] transition-colors cursor-pointer"
                      >
                        {showPassword ? <EyeSlash size={18} /> : <Eye size={18} />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block font-sans text-[0.68rem] uppercase tracking-[0.2em] font-bold text-[#c9542f] mb-1.5">
                      Re-enter New Password
                    </label>
                    <div className="relative">
                      <input 
                        type={showPassword ? "text" : "password"} 
                        required
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="w-full bg-white/80 border border-black/10 focus:border-[#c9542f] rounded-xl px-4 py-2.5 text-[#111010] font-sans focus:outline-none focus:bg-white transition-all placeholder:text-[#7a756b]/40 pr-10 shadow-2xs"
                        placeholder="••••••••"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#7a756b] hover:text-[#c9542f] transition-colors cursor-pointer"
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
            <div className="text-rose-600 font-sans text-xs text-center pb-2 font-medium bg-rose-50 border border-rose-200 py-2 rounded-lg">
              {error}
            </div>
          )}

          <div className="pt-2 flex flex-col gap-2.5">
            <button 
              type="submit" 
              disabled={isLoading}
              className="w-full justify-center bg-[#c9542f] hover:bg-[#a94326] disabled:bg-[#c9542f]/60 text-white py-3.5 rounded-full font-sans text-xs uppercase tracking-[0.2em] font-bold transition-all shadow-[0_4px_16px_rgba(201,84,47,0.25)] hover:shadow-[0_6px_20px_rgba(201,84,47,0.35)] cursor-pointer"
            >
              {isLoading 
                ? 'PLEASE WAIT...' 
                : (isForgotPassword 
                  ? (isForgotOtpStep ? 'RESET PASSWORD' : 'SEND OTP') 
                  : (isOtpLogin 
                    ? (isLoginOtpStep ? 'VERIFY & SIGN IN' : 'REQUEST OTP') 
                    : (isOtpStep ? 'VERIFY OTP' : (isLogin ? 'SIGN IN' : 'CREATE ACCOUNT'))))}
            </button>

            {isLogin && !isForgotPassword && !isLoginOtpStep && (
              !isOtpLogin ? (
                <button 
                  type="button"
                  disabled={isLoading}
                  onClick={() => {
                    setIsOtpLogin(true);
                    setIsLoginOtpStep(false);
                    setError('');
                  }}
                  className="w-full justify-center bg-white/90 hover:bg-white border border-black/15 hover:border-[#c9542f] text-[#111010] hover:text-[#c9542f] py-3.5 rounded-full font-sans text-xs uppercase tracking-[0.2em] font-bold transition-all shadow-2xs cursor-pointer"
                >
                  LOGIN WITH OTP
                </button>
              ) : (
                <button 
                  type="button"
                  disabled={isLoading}
                  onClick={() => {
                    setIsOtpLogin(false);
                    setIsLoginOtpStep(false);
                    setError('');
                  }}
                  className="w-full justify-center bg-white/90 hover:bg-white border border-black/15 hover:border-[#c9542f] text-[#111010] hover:text-[#c9542f] py-3.5 rounded-full font-sans text-xs uppercase tracking-[0.2em] font-bold transition-all shadow-2xs cursor-pointer"
                >
                  LOGIN WITH PASSWORD
                </button>
              )
            )}
          </div>
        </form>

        {(isOtpStep || isForgotOtpStep || isLoginOtpStep) && (
          <div className="mt-4 flex items-center justify-between text-center pt-2">
            <button 
              type="button"
              onClick={() => {
                if (isLoginOtpStep) {
                  setIsLoginOtpStep(false);
                } else if (isForgotOtpStep) {
                  setIsForgotOtpStep(false);
                } else {
                  setIsOtpStep(false);
                }
                setError('');
              }}
              className="font-sans text-[0.68rem] uppercase tracking-[0.18em] font-semibold text-[#555047] hover:text-[#c9542f] transition-colors cursor-pointer"
            >
              ← Edit details
            </button>
            <button 
              type="button"
              disabled={resendCooldown > 0 || isLoading}
              onClick={async () => {
                if (resendCooldown > 0 || isLoading) return;
                try {
                  setIsLoading(true);
                  setError('');
                  const API_URL = import.meta.env.VITE_API_URL || '';
                  let endpoint, body;
                  if (isLoginOtpStep) {
                    endpoint = `${API_URL}/api/auth/login-otp-init`;
                    body = { email: loginOtpTargetEmail || email };
                  } else if (isForgotOtpStep) {
                    endpoint = `${API_URL}/api/auth/forgot-password-init`;
                    body = { email };
                  } else {
                    endpoint = `${API_URL}/api/auth/register-init`;
                    body = { fullName, email, password, countryCode, phoneNumber };
                  }

                  const res = await fetch(endpoint, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(body),
                  });
                  const data = await res.json();
                  if (res.ok) {
                    setOtpValues(['', '', '', '']);
                    setResendCooldown(45);
                    setError('New OTP sent to your email.');
                  } else {
                    setError(data.message || 'Failed to resend OTP');
                  }
                } catch (err) {
                  setError('Network error, please try again');
                } finally {
                  setIsLoading(false);
                }
              }}
              className={`font-sans text-[0.68rem] uppercase tracking-[0.18em] font-bold transition-colors ${
                resendCooldown > 0 || isLoading
                  ? 'text-[#7a756b]/50 cursor-not-allowed'
                  : 'text-[#c9542f] hover:text-[#111010] cursor-pointer'
              }`}
            >
              {resendCooldown > 0 ? `Resend OTP in ${resendCooldown}s` : 'Resend OTP'}
            </button>
          </div>
        )}

        {(!isOtpStep && !isForgotOtpStep && !isLoginOtpStep) && (
          <>
            <div className="flex items-center my-4 gap-3">
              <div className="flex-1 h-[1px] bg-black/10" />
              <span className="text-[0.62rem] uppercase tracking-widest text-[#7a756b] font-semibold">
                or
              </span>
              <div className="flex-1 h-[1px] bg-black/10" />
            </div>

            <GoogleLoginButton 
              theme="light"
              text={isLogin ? "Continue with Google" : "Sign up with Google"}
              onSuccess={(data) => {
                onSuccess?.(data);
                onClose();
              }}
              onError={(msg) => setError(msg)}
            />
          </>
        )}

        {(!isOtpStep && !isForgotOtpStep && !isLoginOtpStep) && (
          <div className="mt-5 text-center pt-3 border-t border-black/8">
            <button 
              type="button"
              onClick={handleToggleMode}
              className="font-sans text-[0.68rem] uppercase tracking-[0.18em] font-semibold text-[#555047] hover:text-[#c9542f] transition-colors cursor-pointer"
            >
              {isLogin ? "Don't have an account? Register" : "Already have an account? Sign in"}
            </button>
          </div>
        )}
      </div>
    </div>,
    document.body
  );
}
