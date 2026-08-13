import { useState, useRef } from 'react';
import { createPortal } from 'react-dom';
import { X, Eye, EyeSlash } from '@phosphor-icons/react';
import Button from '../ui/Button';
import { COUNTRY_CODES } from '../../utils/countryCodes';

export default function LoginModal({ isOpen, onClose, onSuccess }) {
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [countryCode, setCountryCode] = useState('+91');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isOtpStep, setIsOtpStep] = useState(false);
  const [otpValues, setOtpValues] = useState(['', '', '', '']);
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [isForgotOtpStep, setIsForgotOtpStep] = useState(false);
  
  const otpRefs = [useRef(null), useRef(null), useRef(null), useRef(null)];

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!isLogin && !isForgotPassword) {
      if (password.length < 8) {
        setError('Password must be at least 8 characters long');
        return;
      }
      if (!/[A-Z]/.test(password)) {
        setError('Password must contain at least one uppercase letter');
        return;
      }
      if (!/[0-9]/.test(password)) {
        setError('Password must contain at least one number');
        return;
      }
      if (password !== confirmPassword) {
        setError('Passwords do not match');
        return;
      }
    } else if (isForgotPassword && isForgotOtpStep) {
      if (password.length < 8) {
        setError('Password must be at least 8 characters long');
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

      if (isForgotPassword) {
        if (!isForgotOtpStep) {
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
        if (isForgotPassword) {
          if (!isForgotOtpStep) {
            setIsForgotOtpStep(true);
            setError('');
          } else {
            setIsForgotPassword(false);
            setIsForgotOtpStep(false);
            setIsLogin(true);
            setOtpValues(['', '', '', '']);
            setPassword('');
            setConfirmPassword('');
            setError('');
          }
        } else if (!isLogin && !isOtpStep) {
          // Move to OTP step
          setIsOtpStep(true);
          setError('');
        } else {
          localStorage.setItem('token', data.token);
          localStorage.setItem('userInfo', JSON.stringify({ 
            fullName: data.fullName, 
            email: data.email,
            phoneNumber: data.phoneNumber,
            countryCode: data.countryCode,
            dob: data.dob,
            gender: data.gender
          }));
          onSuccess({ ...data, isRegister: isOtpStep });
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

  return createPortal(
    <div className="fixed inset-0 z-[250] flex items-center justify-center bg-black/80 backdrop-blur-md p-4" onClick={onClose}>
      <style>{`
        input:-webkit-autofill,
        input:-webkit-autofill:hover, 
        input:-webkit-autofill:focus, 
        input:-webkit-autofill:active {
          transition: background-color 5000s ease-in-out 0s !important;
          -webkit-text-fill-color: white !important;
        }
      `}</style>
      <div 
        className="relative w-full max-w-md bg-[#0a0a0a] border border-[#c79c6e]/30 p-8 shadow-[0_0_40px_rgba(199,156,110,0.15)] rounded-none"
        onClick={(e) => e.stopPropagation()}
      >
        <button 
          onClick={() => {
            if (isOtpStep) {
              setIsOtpStep(false);
            } else {
              onClose();
            }
          }}
          className="absolute top-4 right-4 text-white/50 hover:text-white transition-colors"
        >
          <X size={24} />
        </button>

        <h2 className="font-serif text-3xl font-light text-white mb-2">
          {isForgotPassword 
            ? (isForgotOtpStep ? 'Reset Password' : 'Forgot Password')
            : (!isOtpStep ? (isLogin ? 'Welcome Back' : 'Begin Your Journey') : 'Verify Email')}
        </h2>
        <p className="text-white/60 font-sans text-xs tracking-wider mb-8">
          {isForgotPassword
            ? (isForgotOtpStep ? `Enter the 4-digit OTP sent to ${email} and your new password` : 'Enter your email address to reset your password')
            : (!isOtpStep 
              ? (isLogin ? 'Enter your details to continue' : 'Create an account to access exclusive content')
              : `Enter the 4-digit OTP sent to ${email}`)
          }
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          {!isOtpStep && !isForgotOtpStep ? (
            <>
              {(!isLogin && !isForgotPassword) && (
                <div>
              <label className="block font-sans text-[0.65rem] uppercase tracking-[0.2em] text-[#c79c6e] mb-2">
                Full Name
              </label>
              <input 
                type="text" 
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full bg-transparent border-b border-white/20 pb-2 text-white font-sans focus:outline-none focus:border-[#c79c6e] transition-colors placeholder:text-white/20"
                placeholder="John Doe"
              />
            </div>
          )}

          <div>
            <label className="block font-sans text-[0.65rem] uppercase tracking-[0.2em] text-[#c79c6e] mb-2">
              Email Address
            </label>
            <input 
              type="email" 
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-transparent border-b border-white/20 pb-2 text-white font-sans focus:outline-none focus:border-[#c79c6e] transition-colors placeholder:text-white/20"
              placeholder="john@example.com"
            />
          </div>

          {(!isLogin && !isForgotPassword) && (
            <div>
              <label className="block font-sans text-[0.65rem] uppercase tracking-[0.2em] text-[#c79c6e] mb-2">
                Phone Number
              </label>
              <div className="flex items-center border-b border-white/20 pb-2 transition-colors focus-within:border-[#c79c6e]">
                <select 
                  className="bg-transparent text-white/70 font-sans focus:outline-none appearance-none pr-2 cursor-pointer outline-none"
                  value={countryCode}
                  onChange={(e) => setCountryCode(e.target.value)}
                >
                  {COUNTRY_CODES.map((country, index) => (
                    <option key={`${country.code}-${index}`} value={country.code} className="bg-[#0a0a0a] text-white">
                      {country.label}
                    </option>
                  ))}
                </select>
                <div className="w-[1px] h-4 bg-white/20 mx-3"></div>
                <input 
                  type="tel" 
                  required
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  className="w-full bg-transparent text-white font-sans focus:outline-none placeholder:text-white/20"
                  placeholder="(555) 000-0000"
                />
              </div>
            </div>
          )}

          {!isForgotPassword && (
          <div>
            <label className="block font-sans text-[0.65rem] uppercase tracking-[0.2em] text-[#c79c6e] mb-2">
              Password
            </label>
            <div className="relative">
              <input 
                type={showPassword ? "text" : "password"} 
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-transparent border-b border-white/20 pb-2 text-white font-sans focus:outline-none focus:border-[#c79c6e] transition-colors placeholder:text-white/20 pr-8"
                placeholder="••••••••"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-0 bottom-2 text-white/50 hover:text-white transition-colors"
              >
                {showPassword ? <EyeSlash size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>
          )}

          {(!isLogin && !isForgotPassword) && (
            <div>
              <label className="block font-sans text-[0.65rem] uppercase tracking-[0.2em] text-[#c79c6e] mb-2">
                Confirm Password
              </label>
              <div className="relative">
                <input 
                  type={showPassword ? "text" : "password"} 
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full bg-transparent border-b border-white/20 pb-2 text-white font-sans focus:outline-none focus:border-[#c79c6e] transition-colors placeholder:text-white/20 pr-8"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-0 bottom-2 text-white/50 hover:text-white transition-colors"
                >
                  {showPassword ? <EyeSlash size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>
          )}
          </>
          ) : (
            <div className="flex flex-col gap-6 py-4">
              <div className="flex justify-center gap-4">
                {otpValues.map((digit, index) => (
                  <input
                    key={index}
                    ref={otpRefs[index]}
                    type="text"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleOtpChange(index, e.target.value)}
                    onKeyDown={(e) => handleOtpKeyDown(index, e)}
                    className="w-14 h-14 text-center bg-transparent border border-white/20 text-white font-sans text-2xl focus:outline-none focus:border-[#c79c6e] transition-colors"
                  />
                ))}
              </div>

              {isForgotPassword && (
                <>
                  <div>
                    <label className="block font-sans text-[0.65rem] uppercase tracking-[0.2em] text-[#c79c6e] mb-2">
                      New Password
                    </label>
                    <div className="relative">
                      <input 
                        type={showPassword ? "text" : "password"} 
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full bg-transparent border-b border-white/20 pb-2 text-white font-sans focus:outline-none focus:border-[#c79c6e] transition-colors placeholder:text-white/20 pr-8"
                        placeholder="••••••••"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-0 bottom-2 text-white/50 hover:text-white transition-colors"
                      >
                        {showPassword ? <EyeSlash size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block font-sans text-[0.65rem] uppercase tracking-[0.2em] text-[#c79c6e] mb-2">
                      Re-enter New Password
                    </label>
                    <div className="relative">
                      <input 
                        type={showPassword ? "text" : "password"} 
                        required
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="w-full bg-transparent border-b border-white/20 pb-2 text-white font-sans focus:outline-none focus:border-[#c79c6e] transition-colors placeholder:text-white/20 pr-8"
                        placeholder="••••••••"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-0 bottom-2 text-white/50 hover:text-white transition-colors"
                      >
                        {showPassword ? <EyeSlash size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          )}

          {error && (
            <div className="text-red-400 font-sans text-xs text-center pb-2">
              {error}
            </div>
          )}

          <div className="pt-2">
            <Button type="submit" variant="primary" className="w-full justify-center" disabled={isLoading}>
              {isLoading ? 'PLEASE WAIT...' : (isForgotPassword ? (isForgotOtpStep ? 'RESET PASSWORD' : 'SEND OTP') : (isOtpStep ? 'VERIFY OTP' : (isLogin ? 'SIGN IN' : 'CREATE ACCOUNT')))}
            </Button>
          </div>
        </form>

        {isLogin && !isForgotPassword && (
          <div className="mt-4 text-center">
            <button 
              type="button"
              onClick={() => {
                setIsForgotPassword(true);
                setError('');
              }}
              className="font-sans text-[0.65rem] uppercase tracking-[0.2em] text-[#c79c6e] hover:text-white transition-colors"
            >
              Forgot Password?
            </button>
          </div>
        )}

        {(!isOtpStep && !isForgotOtpStep) && (
          <div className="mt-6 text-center">
            <button 
              type="button"
              onClick={handleToggleMode}
              className="font-sans text-[0.65rem] uppercase tracking-[0.2em] text-white/50 hover:text-[#c79c6e] transition-colors"
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
