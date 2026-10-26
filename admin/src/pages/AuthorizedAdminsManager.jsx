import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, 
  EnvelopeSimple, 
  Plus, 
  Trash, 
  ArrowsClockwise, 
  CheckCircle, 
  WarningCircle, 
  UserCheck, 
  LockKey,
  Key,
  X
} from '@phosphor-icons/react';
import { API_URL } from '../utils/apiUrl';

export default function AuthorizedAdminsManager() {
  const [emails, setEmails] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newEmail, setNewEmail] = useState('');
  const [adding, setAdding] = useState(false);
  const [confirmDeleteModal, setConfirmDeleteModal] = useState(null);

  // OTP Verification Modal State
  const [otpModal, setOtpModal] = useState(null); // { email: '', otp: '', cooldown: 30 }
  const [verifyingOtp, setVerifyingOtp] = useState(false);
  const [resendingOtp, setResendingOtp] = useState(false);
  const [otpError, setOtpError] = useState('');

  const [toastMessage, setToastMessage] = useState(null);
  const [errorMessage, setErrorMessage] = useState(null);

  const currentLoggedInEmail = (
    localStorage.getItem('adminEmail') || ''
  ).toLowerCase();

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const showError = (msg) => {
    setErrorMessage(msg);
    setTimeout(() => setErrorMessage(null), 4500);
  };

  // Cooldown countdown timer for OTP modal
  useEffect(() => {
    if (!otpModal || otpModal.cooldown <= 0) return;
    const timer = setInterval(() => {
      setOtpModal((prev) => (prev && prev.cooldown > 0 ? { ...prev, cooldown: prev.cooldown - 1 } : prev));
    }, 1000);
    return () => clearInterval(timer);
  }, [otpModal?.cooldown]);

  const getHeaders = () => {
    const token = localStorage.getItem('adminToken');
    const headers = {
      'Content-Type': 'application/json',
    };
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    return headers;
  };

  // Fetch authorized emails from backend
  const fetchEmails = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_URL}/api/admin/auth/emails`, {
        headers: getHeaders(),
      });
      const data = await res.json();
      if (data.success && Array.isArray(data.emails)) {
        setEmails(data.emails);

        // If the current logged-in user was deleted, log out
        if (
          currentLoggedInEmail &&
          !data.emails.map((e) => e.toLowerCase()).includes(currentLoggedInEmail)
        ) {
          showToast('Your admin account is no longer authorized. Logging out...');
          localStorage.removeItem('adminToken');
          localStorage.removeItem('adminEmail');
          setTimeout(() => {
            window.location.reload();
          }, 800);
          return;
        }
      } else {
        showError(data.message || 'Failed to load authorized emails.');
      }
    } catch (err) {
      showError('Network error while fetching authorized admin emails.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmails();
  }, []);

  // Step 1: Send OTP to new email address to initiate authorization
  const handleInitiateAdd = async (e) => {
    e.preventDefault();
    const clean = newEmail.trim().toLowerCase();

    if (!clean) {
      showError('Please enter an email address.');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(clean)) {
      showError('Please enter a valid email address.');
      return;
    }

    if (emails.map((e) => e.toLowerCase()).includes(clean)) {
      showError('This email is already in the authorized administrator list.');
      return;
    }

    try {
      setAdding(true);
      const res = await fetch(`${API_URL}/api/admin/auth/emails/send-otp`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({ email: clean }),
      });

      const data = await res.json();
      if (data.success) {
        setOtpModal({
          email: clean,
          otp: '',
          cooldown: data.cooldownSeconds || 30,
        });
        setOtpError('');
        showToast(data.message || `Verification OTP sent to ${clean}`);
      } else {
        showError(data.message || 'Failed to send OTP to this email.');
      }
    } catch (err) {
      showError('Network error while requesting verification OTP.');
    } finally {
      setAdding(false);
    }
  };

  // Resend OTP to the email being authorized
  const handleResendOtp = async () => {
    if (!otpModal?.email || otpModal.cooldown > 0 || resendingOtp) return;
    try {
      setResendingOtp(true);
      setOtpError('');
      const res = await fetch(`${API_URL}/api/admin/auth/emails/resend-otp`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({ email: otpModal.email }),
      });
      const data = await res.json();
      if (data.success) {
        setOtpModal((prev) => ({ ...prev, cooldown: data.cooldownSeconds || 30 }));
        showToast(`Verification code resent to ${otpModal.email}`);
      } else {
        setOtpError(data.message || 'Failed to resend verification code.');
      }
    } catch (err) {
      setOtpError('Network error while resending code.');
    } finally {
      setResendingOtp(false);
    }
  };

  // Step 2: Verify OTP and authorize email in database
  const handleVerifyAndAdd = async (e) => {
    e.preventDefault();
    if (!otpModal?.otp || otpModal.otp.trim().length < 4) {
      setOtpError('Please enter the 4-digit verification code.');
      return;
    }

    try {
      setVerifyingOtp(true);
      setOtpError('');
      const res = await fetch(`${API_URL}/api/admin/auth/emails`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({
          email: otpModal.email,
          otp: otpModal.otp.trim(),
        }),
      });

      const data = await res.json();
      if (data.success) {
        setEmails(data.emails);
        showToast(`${otpModal.email} has been authorized as Administrator!`);
        setOtpModal(null);
        setNewEmail('');
      } else {
        setOtpError(data.message || 'Invalid verification code.');
      }
    } catch (err) {
      setOtpError('Network error while confirming authorization.');
    } finally {
      setVerifyingOtp(false);
    }
  };

  // Delete an authorized email
  const handleConfirmDelete = async () => {
    if (!confirmDeleteModal) return;
    const targetEmail = confirmDeleteModal.toLowerCase();

    if (emails.length <= 1) {
      showError('Cannot delete the last remaining administrator.');
      setConfirmDeleteModal(null);
      return;
    }

    try {
      const res = await fetch(`${API_URL}/api/admin/auth/emails`, {
        method: 'DELETE',
        headers: getHeaders(),
        body: JSON.stringify({ email: targetEmail }),
      });

      const data = await res.json();
      if (data.success) {
        setEmails(data.emails);
        showToast(`${targetEmail} was removed from administrators.`);
        setConfirmDeleteModal(null);

        // If removing oneself, log out
        if (targetEmail === currentLoggedInEmail) {
          localStorage.removeItem('adminToken');
          localStorage.removeItem('adminEmail');
          window.location.reload();
        }
      } else {
        showError(data.message || 'Failed to delete administrator email.');
      }
    } catch (err) {
      showError('Network error while removing admin email.');
    }
  };

  return (
    <div className="w-full flex flex-col gap-6 animate-in fade-in duration-300">
      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed top-5 right-5 z-50 bg-emerald-600 text-white text-xs font-semibold px-4 py-3 rounded-xl shadow-xl flex items-center gap-2">
          <CheckCircle size={18} weight="fill" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Error Alert */}
      {errorMessage && (
        <div className="fixed top-5 right-5 z-50 bg-red-600 text-white text-xs font-semibold px-4 py-3 rounded-xl shadow-xl flex items-center gap-2">
          <WarningCircle size={18} weight="fill" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Header Info */}
      <div className="bg-white border border-black/[0.08] rounded-2xl p-6 sm:p-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5 mb-1.5">
            <div className="w-8 h-8 rounded-lg bg-[#c9542f]/10 flex items-center justify-center text-[#c9542f]">
              <ShieldCheck size={20} weight="fill" />
            </div>
            <h2 className="font-serif text-xl sm:text-2xl text-gray-900 font-semibold">
              Authorized Administrators
            </h2>
          </div>
          <p className="text-xs sm:text-sm text-gray-500 max-w-2xl leading-relaxed">
            Strict email whitelist for the BWA Admin Portal. Only verified email addresses listed here can receive login passcodes and access administrative capabilities.
          </p>
        </div>

        <button
          type="button"
          onClick={fetchEmails}
          disabled={loading}
          className="self-start sm:self-center px-3.5 py-2 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-semibold flex items-center gap-2 transition-colors cursor-pointer"
        >
          <ArrowsClockwise size={14} className={loading ? 'animate-spin' : ''} />
          <span>Refresh Whitelist</span>
        </button>
      </div>

      {/* Add New Admin Form */}
      <div className="bg-white border border-black/[0.08] rounded-2xl p-6 sm:p-8">
        <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-2 flex items-center gap-2">
          <Plus size={16} className="text-[#c9542f]" weight="bold" />
          Authorize New Administrator Email
        </h3>
        <p className="text-xs text-gray-500 mb-4 leading-relaxed">
          For security, a 4-digit verification code will be sent to the email address first to verify ownership before it is granted access.
        </p>

        <form onSubmit={handleInitiateAdd} className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 max-w-xl">
          <div className="relative flex-1">
            <input
              type="email"
              value={newEmail}
              onChange={(e) => setNewEmail(e.target.value)}
              placeholder="e.g. colleague@betterwithaarkesh.com"
              className="w-full bg-white border border-gray-200 rounded-xl px-4 py-2.5 text-xs sm:text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-[#c9542f] focus:ring-1 focus:ring-[#c9542f] transition-all"
              required
            />
          </div>
          <button
            type="submit"
            disabled={adding || !newEmail.trim()}
            className="px-5 py-2.5 rounded-xl bg-[#c9542f] hover:bg-[#a64117] text-white text-xs font-bold uppercase tracking-wider transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer shadow-sm hover:shadow disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {adding ? (
              <>
                <ArrowsClockwise size={14} className="animate-spin" />
                <span>Sending OTP...</span>
              </>
            ) : (
              <>
                <ShieldCheck size={16} weight="fill" />
                <span>Verify & Add Admin</span>
              </>
            )}
          </button>
        </form>
      </div>

      {/* Whitelisted Admins List */}
      <div className="bg-white border border-black/[0.08] rounded-2xl overflow-hidden shadow-sm">
        <div className="p-5 sm:p-6 border-b border-gray-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-gray-600">
              Active Authorized List
            </span>
            <span className="text-[11px] font-bold text-[#c9542f] bg-[#c9542f]/10 px-2 py-0.5 rounded-full">
              {emails.length} Authorized
            </span>
          </div>
        </div>

        {loading ? (
          <div className="p-8 text-center text-xs text-gray-400 flex items-center justify-center gap-2">
            <ArrowsClockwise size={16} className="animate-spin text-[#c9542f]" />
            <span>Loading authorized administrators...</span>
          </div>
        ) : emails.length === 0 ? (
          <div className="p-8 text-center text-xs text-gray-400">
            No authorized administrators found.
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {emails.map((emailItem) => {
              const isCurrent = emailItem.toLowerCase() === currentLoggedInEmail;
              return (
                <div
                  key={emailItem}
                  className="p-4 sm:p-5 flex items-center justify-between hover:bg-gray-50/70 transition-colors"
                >
                  <div className="flex items-center gap-3 truncate pr-4">
                    <div className="w-9 h-9 rounded-full bg-[#c9542f]/10 border border-[#c9542f]/20 flex items-center justify-center text-[#c9542f] shrink-0">
                      <EnvelopeSimple size={18} weight="fill" />
                    </div>
                    <div className="flex flex-col truncate">
                      <span className="text-xs sm:text-sm font-semibold text-gray-900 truncate">
                        {emailItem}
                      </span>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200 flex items-center gap-1">
                          <CheckCircle size={10} weight="fill" />
                          Authorized
                        </span>
                        {isCurrent && (
                          <span className="text-[10px] font-bold text-[#c9542f] bg-[#c9542f]/10 px-2 py-0.5 rounded-full border border-[#c9542f]/25">
                            Current Session
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => setConfirmDeleteModal(emailItem)}
                    disabled={emails.length <= 1}
                    className="p-2 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
                    title={emails.length <= 1 ? 'Cannot delete last admin' : 'Remove authorization'}
                  >
                    <Trash size={16} />
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* OTP Verification Modal for Adding New Admin */}
      {otpModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-gray-200 shadow-2xl p-6 sm:p-8 max-w-md w-full animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-4 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-[#c9542f]/10 text-[#c9542f] flex items-center justify-center">
                  <Key size={18} weight="duotone" />
                </div>
                <h3 className="font-serif text-lg font-bold text-gray-900">
                  Verify Admin Email
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setOtpModal(null)}
                className="text-gray-400 hover:text-gray-600 p-1 cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <p className="text-xs text-gray-500 mt-4 leading-relaxed">
              We sent a 4-digit verification code to:
            </p>
            <div className="p-3 bg-[#FAF7F2] border border-[#EAE3D9] rounded-xl flex items-center gap-2 my-2 text-xs font-semibold text-gray-900 truncate">
              <EnvelopeSimple size={16} className="text-[#c9542f] shrink-0" weight="fill" />
              <span className="truncate">{otpModal.email}</span>
            </div>

            {otpError && (
              <div className="my-3 p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-xs font-medium flex items-center gap-2">
                <WarningCircle size={16} className="shrink-0" weight="fill" />
                <span>{otpError}</span>
              </div>
            )}

            <form onSubmit={handleVerifyAndAdd} className="mt-4 flex flex-col gap-3">
              <div>
                <label className="text-[11px] font-semibold uppercase tracking-wider text-gray-600 mb-1.5 block">
                  Enter 4-Digit Code
                </label>
                <input
                  type="text"
                  inputMode="numeric"
                  value={otpModal.otp}
                  onChange={(e) => {
                    const val = e.target.value.replace(/\D/g, '').slice(0, 4);
                    setOtpModal((prev) => ({ ...prev, otp: val }));
                    if (otpError) setOtpError('');
                  }}
                  placeholder="••••"
                  maxLength={4}
                  autoFocus
                  required
                  className="w-full text-center tracking-[0.6em] text-2xl font-mono font-bold py-3 bg-[#FAF8F5] border border-gray-200 rounded-xl text-[#c9542f] focus:outline-none focus:border-[#c9542f] focus:ring-1 focus:ring-[#c9542f]"
                />
              </div>

              <div className="flex items-center justify-between text-[11px] pt-1">
                <span className="text-gray-400">Valid for 2 minutes</span>
                {otpModal.cooldown > 0 ? (
                  <span className="text-gray-400 font-semibold">
                    Resend in {otpModal.cooldown}s
                  </span>
                ) : (
                  <button
                    type="button"
                    onClick={handleResendOtp}
                    disabled={resendingOtp}
                    className="font-semibold text-[#c9542f] hover:underline cursor-pointer"
                  >
                    {resendingOtp ? 'Resending...' : 'Resend Code'}
                  </button>
                )}
              </div>

              <div className="flex gap-2.5 mt-3">
                <button
                  type="button"
                  onClick={() => setOtpModal(null)}
                  className="flex-1 py-2.5 rounded-xl border border-gray-200 text-gray-600 text-xs font-semibold hover:bg-gray-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={verifyingOtp || otpModal.otp.trim().length < 4}
                  className="flex-1 py-2.5 rounded-xl bg-[#c9542f] hover:bg-[#a64117] text-white text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer disabled:opacity-50"
                >
                  {verifyingOtp ? 'Verifying...' : 'Confirm Authorization'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Confirm Delete Modal */}
      {confirmDeleteModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-gray-200 shadow-2xl p-6 max-w-sm w-full animate-in zoom-in-95 duration-200">
            <h3 className="font-serif text-lg font-bold text-gray-900 mb-2">
              Remove Administrator?
            </h3>
            <p className="text-xs text-gray-500 leading-relaxed mb-4">
              Are you sure you want to remove <strong className="text-gray-800">{confirmDeleteModal}</strong> from authorized administrators? They will immediately lose access to the portal.
            </p>
            <div className="flex gap-2.5">
              <button
                type="button"
                onClick={() => setConfirmDeleteModal(null)}
                className="flex-1 py-2 rounded-xl border border-gray-200 text-gray-600 text-xs font-semibold hover:bg-gray-50 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                className="flex-1 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer"
              >
                Remove
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
