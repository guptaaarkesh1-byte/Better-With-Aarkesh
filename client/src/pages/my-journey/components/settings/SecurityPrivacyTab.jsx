import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { ArrowRight, X, Check, SpinnerGap, Warning, ArrowsClockwise, ShieldCheck, Trash } from '@phosphor-icons/react';
import { useNavigate } from 'react-router-dom';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const generateCaptcha = () => {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let result = '';
  for (let i = 0; i < 5; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

export default function SecurityPrivacyTab() {
  const navigate = useNavigate();

  // Password state
  const [isEditingPassword, setIsEditingPassword] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordStatus, setPasswordStatus] = useState({ type: '', message: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Delete Account Modal state
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [captchaCode, setCaptchaCode] = useState('');
  const [userCaptchaInput, setUserCaptchaInput] = useState('');
  const [otpInput, setOtpInput] = useState('');
  const [deleteError, setDeleteError] = useState('');
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteSuccess, setDeleteSuccess] = useState(false);
  const [userEmail, setUserEmail] = useState('');
  const [resendCooldown, setResendCooldown] = useState(0);

  useEffect(() => {
    const saved = localStorage.getItem('userInfo');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setUserEmail(parsed.email || '');
      } catch (e) {}
    }
  }, []);

  // Lock background body scroll when modal is open
  useEffect(() => {
    if (isDeleteModalOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isDeleteModalOpen]);

  // Timer for resend cooldown
  useEffect(() => {
    let timer;
    if (resendCooldown > 0) {
      timer = setTimeout(() => setResendCooldown(prev => prev - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [resendCooldown]);

  // Click Delete button on page -> Open Captcha + OTP verification modal directly & auto-send OTP
  const openDeleteModal = async () => {
    setCaptchaCode(generateCaptcha());
    setUserCaptchaInput('');
    setOtpInput('');
    setDeleteError('');
    setDeleteSuccess(false);
    setIsDeleteModalOpen(true);

    // Auto-send OTP to registered email
    try {
      setDeleteLoading(true);
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_URL}/api/users/delete-account-init`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        }
      });

      if (res.ok) {
        setResendCooldown(30);
      } else {
        const data = await res.json();
        setDeleteError(data.message || 'Failed to send OTP to email');
      }
    } catch (err) {
      console.error(err);
      setDeleteError('Network error sending OTP. You can click Resend OTP.');
    } finally {
      setDeleteLoading(false);
    }
  };

  const closeDeleteModal = () => {
    if (deleteLoading && !deleteError) return;
    setIsDeleteModalOpen(false);
    setDeleteError('');
    setOtpInput('');
    setUserCaptchaInput('');
  };

  const handleRefreshCaptcha = () => {
    setCaptchaCode(generateCaptcha());
    setUserCaptchaInput('');
    setDeleteError('');
  };

  const handleResendOtp = async () => {
    if (resendCooldown > 0 || deleteLoading) return;
    try {
      setDeleteLoading(true);
      setDeleteError('');
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_URL}/api/users/delete-account-init`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        }
      });

      if (res.ok) {
        setResendCooldown(30);
        handleRefreshCaptcha();
      } else {
        const data = await res.json();
        setDeleteError(data.message || 'Failed to resend OTP.');
      }
    } catch (err) {
      console.error(err);
      setDeleteError('Error resending OTP.');
    } finally {
      setDeleteLoading(false);
    }
  };

  // Verify BOTH Captcha + Email OTP together
  const handleVerifyBothAndSoftDelete = async (e) => {
    e.preventDefault();
    setDeleteError('');

    // 1. Verify Captcha
    if (!userCaptchaInput.trim() || userCaptchaInput.trim().toUpperCase() !== captchaCode.toUpperCase()) {
      setDeleteError('Incorrect captcha code. Please try again.');
      setCaptchaCode(generateCaptcha());
      setUserCaptchaInput('');
      return;
    }

    // 2. Verify OTP length
    if (!otpInput.trim() || otpInput.trim().length < 4) {
      setDeleteError('Please enter the 4-digit verification OTP sent to your email.');
      return;
    }

    try {
      setDeleteLoading(true);
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_URL}/api/users/delete-account-verify`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ otp: otpInput.trim() })
      });

      const data = await res.json();
      if (!res.ok) {
        setDeleteError(data.message || 'Invalid or expired OTP code.');
        setCaptchaCode(generateCaptcha());
        setUserCaptchaInput('');
        return;
      }

      setDeleteSuccess(true);

      // Auto logout and redirect after 2s
      setTimeout(() => {
        localStorage.removeItem('token');
        localStorage.removeItem('userInfo');
        window.dispatchEvent(new Event('auth-change'));
        navigate('/');
      }, 2000);
    } catch (err) {
      console.error(err);
      setDeleteError('Failed to delete account. Please try again.');
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setPasswordStatus({ type: 'error', message: 'New passwords do not match' });
      return;
    }
    if (newPassword.length < 6) {
      setPasswordStatus({ type: 'error', message: 'Password must be at least 6 characters' });
      return;
    }

    try {
      setIsSubmitting(true);
      setPasswordStatus({ type: '', message: '' });
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/api/users/change-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ currentPassword, newPassword })
      });

      const data = await response.json();

      if (response.ok) {
        setPasswordStatus({ type: 'success', message: 'Password updated successfully' });
        setTimeout(() => {
          setIsEditingPassword(false);
          setCurrentPassword('');
          setNewPassword('');
          setConfirmPassword('');
          setPasswordStatus({ type: '', message: '' });
        }, 2000);
      } else {
        setPasswordStatus({ type: 'error', message: data.message || 'Failed to update password' });
      }
    } catch (error) {
      setPasswordStatus({ type: 'error', message: 'Something went wrong. Please try again.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full max-w-2xl border border-white/10 rounded-xl p-8 md:p-10 bg-[#0a0a0a]/80 backdrop-blur-sm flex flex-col animate-in fade-in duration-500">
      <h2 className="font-serif text-3xl text-white mb-2">Security & Privacy</h2>
      <p className="font-sans text-white/70 text-sm mb-10">
        Contribute to your account and understand what remains private.
      </p>

      <div className="flex flex-col gap-4 mb-8">
        
        {/* Password Card */}
        <div className={`flex flex-col border border-white/10 rounded-lg p-6 hover:border-[#c79c6e]/40 transition-colors ${!isEditingPassword ? 'group md:flex-row md:items-center justify-between' : ''}`}>
          {!isEditingPassword ? (
            <>
              <div className="flex flex-col gap-2">
                <span className="font-sans text-[0.65rem] uppercase tracking-[0.2em] font-medium text-[#c79c6e]">PASSWORD</span>
                <span className="font-mono text-white tracking-widest mt-1">•••••••••••••••</span>
              </div>
              <button 
                onClick={() => setIsEditingPassword(true)}
                className="mt-4 md:mt-0 font-sans text-[0.65rem] uppercase tracking-[0.2em] font-medium text-[#c79c6e] flex items-center gap-2 cursor-pointer"
              >
                CHANGE PASSWORD <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
              </button>
            </>
          ) : (
            <div className="w-full animate-in fade-in zoom-in-95 duration-200">
              <div className="flex items-center justify-between mb-6">
                <span className="font-sans text-[0.65rem] uppercase tracking-[0.2em] font-medium text-[#c79c6e]">CHANGE PASSWORD</span>
                <button 
                  onClick={() => {
                    setIsEditingPassword(false);
                    setPasswordStatus({ type: '', message: '' });
                    setCurrentPassword('');
                    setNewPassword('');
                    setConfirmPassword('');
                  }}
                  className="text-white/50 hover:text-white transition-colors p-1 cursor-pointer"
                >
                  <X size={16} />
                </button>
              </div>
              <form onSubmit={handleChangePassword} className="flex flex-col gap-4">
                <input 
                  type="password" 
                  placeholder="Current Password" 
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="bg-black/50 border border-white/10 rounded px-4 py-3 text-sm text-white focus:outline-none focus:border-[#c79c6e]/50 font-sans"
                  required
                />
                <input 
                  type="password" 
                  placeholder="New Password (min 6 characters)" 
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="bg-black/50 border border-white/10 rounded px-4 py-3 text-sm text-white focus:outline-none focus:border-[#c79c6e]/50 font-sans"
                  required
                />
                <input 
                  type="password" 
                  placeholder="Confirm New Password" 
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="bg-black/50 border border-white/10 rounded px-4 py-3 text-sm text-white focus:outline-none focus:border-[#c79c6e]/50 font-sans"
                  required
                />
                
                {passwordStatus.message && (
                  <div className={`text-xs p-3 rounded font-sans flex items-center gap-2 ${passwordStatus.type === 'error' ? 'bg-red-500/10 text-red-400 border border-red-500/20' : 'bg-green-500/10 text-green-400 border border-green-500/20'}`}>
                    {passwordStatus.type === 'success' && <Check size={14} />}
                    {passwordStatus.message}
                  </div>
                )}
                
                <button 
                  type="submit" 
                  disabled={isSubmitting}
                  className="mt-2 bg-[#c79c6e] text-black font-medium text-[0.7rem] tracking-[0.2em] uppercase py-3 rounded hover:bg-[#b58b5d] transition-colors flex items-center justify-center gap-2 disabled:opacity-70 cursor-pointer"
                >
                  {isSubmitting ? <SpinnerGap size={16} className="animate-spin" /> : 'SAVE PASSWORD'}
                </button>
              </form>
            </div>
          )}
        </div>

        {/* Delete Account Trigger Card */}
        <div className="flex flex-col md:flex-row md:items-center justify-between border border-red-900/60 bg-red-950/20 rounded-lg p-6 hover:border-red-500/60 transition-colors group shadow-[0_0_20px_rgba(239,68,68,0.05)]">
          <div className="flex flex-col gap-2 max-w-md">
            <span className="font-sans text-[0.65rem] uppercase tracking-[0.2em] font-semibold text-red-400">DELETE ACCOUNT</span>
            <p className="font-serif text-white/80 text-sm leading-relaxed">
              Permanently deactivate your account and access.
            </p>
          </div>
          <button 
            onClick={openDeleteModal}
            className="mt-4 md:mt-0 px-5 py-2.5 rounded-lg bg-red-600 hover:bg-red-500 text-white font-sans text-xs uppercase tracking-widest font-bold flex items-center gap-2 shrink-0 shadow-[0_0_20px_rgba(220,38,38,0.4)] transition-all cursor-pointer"
          >
            <Trash size={15} weight="bold" /> DELETE ACCOUNT
          </button>
        </div>

      </div>

      {/* ─── RED POPUP WINDOW (CAPTCHA + EMAIL OTP) MOUNTED AT ROOT BODY ─── */}
      {isDeleteModalOpen && typeof document !== 'undefined' && createPortal(
        <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-black/85 backdrop-blur-md overflow-y-auto animate-in fade-in duration-300">
          <div className="relative w-full max-w-lg bg-[#120606] border-2 border-red-600/90 rounded-2xl p-6 sm:p-8 shadow-[0_0_60px_rgba(239,68,68,0.4)] text-white max-h-[90vh] overflow-y-auto my-auto animate-in zoom-in-95 duration-200">
            
            {/* Close Button */}
            {!deleteSuccess && (
              <button 
                onClick={closeDeleteModal}
                disabled={deleteLoading}
                className="absolute top-5 right-5 text-white/40 hover:text-white p-1 rounded-full hover:bg-white/10 transition-colors cursor-pointer"
              >
                <X size={20} />
              </button>
            )}

            {deleteSuccess ? (
              /* Success View */
              <div className="flex flex-col items-center text-center py-6 animate-in zoom-in-95 duration-300">
                <div className="w-16 h-16 rounded-full bg-red-500/20 border border-red-500/40 text-red-400 flex items-center justify-center mb-4">
                  <Check size={32} weight="bold" />
                </div>
                <h3 className="font-serif text-2xl text-white mb-2">Account Deleted</h3>
                <p className="font-sans text-sm text-white/70 leading-relaxed max-w-xs">
                  Your account has been deleted successfully. You are being logged out...
                </p>
              </div>
            ) : (
              /* Captcha + Email OTP Window */
              <div>
                <div className="flex items-center gap-3 text-red-500 mb-2">
                  <Warning size={26} weight="bold" />
                  <h3 className="font-serif text-2xl text-white">Delete Account Verification</h3>
                </div>

                <p className="font-sans text-xs text-white/70 leading-relaxed mb-5">
                  A verification OTP has been sent to your registered email <strong className="text-[#c79c6e] font-semibold">({userEmail || 'your email'})</strong>. Please enter the OTP and solve the captcha below to confirm account deletion.
                </p>

                <form onSubmit={handleVerifyBothAndSoftDelete} className="flex flex-col gap-4">
                  
                  {/* 1. EMAIL OTP FIELD */}
                  <div className="flex flex-col gap-1.5">
                    <div className="flex items-center justify-between">
                      <label className="font-sans text-[0.68rem] uppercase tracking-[0.18em] text-white/70 font-semibold">
                        EMAIL VERIFICATION OTP
                      </label>
                      <button
                        type="button"
                        onClick={handleResendOtp}
                        disabled={resendCooldown > 0 || deleteLoading}
                        className={`text-[0.68rem] font-sans tracking-wider ${resendCooldown > 0 ? 'text-white/40' : 'text-[#c79c6e] hover:underline cursor-pointer'}`}
                      >
                        {resendCooldown > 0 ? `Resend in ${resendCooldown}s` : 'Resend OTP'}
                      </button>
                    </div>
                    <input 
                      type="text" 
                      value={otpInput}
                      onChange={(e) => setOtpInput(e.target.value.replace(/\D/g, ''))}
                      placeholder="Enter OTP"
                      maxLength={6}
                      className="w-full bg-black/70 border border-white/15 rounded-lg px-4 py-2.5 text-center text-lg font-mono tracking-[0.35em] text-white focus:outline-none focus:border-red-500/70 transition-colors"
                      required
                      autoFocus
                    />
                  </div>

                  {/* 2. CAPTCHA FIELD */}
                  <div className="flex flex-col gap-2 pt-2 border-t border-white/10">
                    <label className="font-sans text-[0.68rem] uppercase tracking-[0.18em] text-white/70 font-semibold">
                      SECURITY CAPTCHA
                    </label>
                    
                    <div className="flex items-center gap-3">
                      <div className="flex-1 tracking-[0.35em] font-mono text-2xl font-bold select-none text-center bg-gradient-to-r from-[#c79c6e] via-[#e8caa4] to-[#c79c6e] bg-clip-text text-transparent italic py-1.5 border border-dashed border-white/20 rounded bg-black/60">
                        {captchaCode}
                      </div>
                      <button 
                        type="button" 
                        onClick={handleRefreshCaptcha}
                        className="p-2.5 rounded-lg bg-white/5 hover:bg-white/10 text-white/60 hover:text-white transition-colors cursor-pointer shrink-0"
                        title="Refresh Captcha"
                      >
                        <ArrowsClockwise size={18} />
                      </button>
                    </div>

                    <input 
                      type="text" 
                      value={userCaptchaInput}
                      onChange={(e) => setUserCaptchaInput(e.target.value.toUpperCase())}
                      placeholder="Type the 5 captcha characters"
                      maxLength={5}
                      className="w-full bg-black/70 border border-white/15 rounded-lg px-4 py-2 text-sm font-mono tracking-widest text-white uppercase focus:outline-none focus:border-red-500/70 transition-colors mt-1"
                      required
                    />
                  </div>

                  {deleteError && (
                    <div className="text-xs p-3 rounded bg-red-500/20 border border-red-500/30 text-red-300 font-sans">
                      {deleteError}
                    </div>
                  )}

                  <div className="flex items-center gap-3 mt-3">
                    <button
                      type="button"
                      onClick={closeDeleteModal}
                      disabled={deleteLoading}
                      className="flex-1 py-3 border border-white/15 text-white/60 hover:text-white rounded-lg font-sans text-xs uppercase tracking-widest font-semibold transition-colors cursor-pointer"
                    >
                      CANCEL
                    </button>
                    <button
                      type="submit"
                      disabled={deleteLoading || !otpInput || !userCaptchaInput}
                      className="flex-1 py-3 bg-red-600 hover:bg-red-500 text-white rounded-lg font-sans text-xs uppercase tracking-widest font-bold transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 shadow-[0_0_20px_rgba(220,38,38,0.4)]"
                    >
                      {deleteLoading ? <SpinnerGap size={16} className="animate-spin" /> : 'CONFIRM & DELETE'}
                    </button>
                  </div>

                </form>
              </div>
            )}

          </div>
        </div>,
        document.body
      )}

    </div>
  );
}
