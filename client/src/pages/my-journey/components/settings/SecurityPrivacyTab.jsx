import React, { useState } from 'react';
import { ArrowRight, Info, X, Check, SpinnerGap } from '@phosphor-icons/react';

export default function SecurityPrivacyTab() {
  const [isEditingPassword, setIsEditingPassword] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordStatus, setPasswordStatus] = useState({ type: '', message: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);

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
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/users/change-password`, {
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
        
        {/* Password */}
        <div className={`flex flex-col border border-white/10 rounded-lg p-6 hover:border-[#c79c6e]/40 transition-colors ${!isEditingPassword ? 'group md:flex-row md:items-center justify-between' : ''}`}>
          {!isEditingPassword ? (
            <>
              <div className="flex flex-col gap-2">
                <span className="font-sans text-[0.65rem] uppercase tracking-[0.2em] font-medium text-[#c79c6e]">PASSWORD</span>
                <span className="font-mono text-white tracking-widest mt-1">•••••••••••••••</span>
              </div>
              <button 
                onClick={() => setIsEditingPassword(true)}
                className="mt-4 md:mt-0 font-sans text-[0.65rem] uppercase tracking-[0.2em] font-medium text-[#c79c6e] flex items-center gap-2"
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
                  className="text-white/50 hover:text-white transition-colors p-1"
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
                  className="mt-2 bg-[#c79c6e] text-black font-medium text-[0.7rem] tracking-[0.2em] uppercase py-3 rounded hover:bg-[#b58b5d] transition-colors flex items-center justify-center gap-2 disabled:opacity-70"
                >
                  {isSubmitting ? <SpinnerGap size={16} className="animate-spin" /> : 'SAVE PASSWORD'}
                </button>
              </form>
            </div>
          )}
        </div>

        {/* Private Notes */}
        <div className="flex flex-col md:flex-row md:items-center justify-between border border-white/10 rounded-lg p-6 hover:border-[#c79c6e]/40 transition-colors group">
          <div className="flex flex-col gap-2 max-w-md">
            <span className="font-sans text-[0.65rem] uppercase tracking-[0.2em] font-medium text-[#c79c6e]">PRIVATE NOTES</span>
            <p className="font-serif text-white/80 text-sm leading-relaxed">
              Your notes are not shared with Aarkesh or attached to coaching responses unless you choose to share them.
            </p>
          </div>
          <button className="mt-4 md:mt-0 font-sans text-[0.65rem] uppercase tracking-[0.2em] font-medium text-[#c79c6e] flex items-center gap-2 shrink-0">
            LEARN MORE <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
          </button>
        </div>

        {/* Your Data */}
        <div className="flex flex-col md:flex-row md:items-center justify-between border border-white/10 rounded-lg p-6 hover:border-[#c79c6e]/40 transition-colors group">
          <div className="flex flex-col gap-2 max-w-md">
            <span className="font-sans text-[0.65rem] uppercase tracking-[0.2em] font-medium text-[#c79c6e]">YOUR DATA</span>
            <p className="font-serif text-white/80 text-sm leading-relaxed">
              Request a copy of your account information and activity.
            </p>
          </div>
          <button className="mt-4 md:mt-0 font-sans text-[0.65rem] uppercase tracking-[0.2em] font-medium text-[#c79c6e] flex items-center gap-2 shrink-0">
            DOWNLOAD DATA <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
          </button>
        </div>

        {/* Delete Account */}
        <div className="flex flex-col md:flex-row md:items-center justify-between border border-red-900/50 bg-red-950/10 rounded-lg p-6 hover:border-red-500/50 transition-colors group">
          <div className="flex flex-col gap-2 max-w-md">
            <span className="font-sans text-[0.65rem] uppercase tracking-[0.2em] font-medium text-red-500/80">DELETE ACCOUNT</span>
            <p className="font-serif text-white/80 text-sm leading-relaxed">
              Permanently remove your account and saved activity.
            </p>
          </div>
          <button className="mt-4 md:mt-0 font-sans text-[0.65rem] uppercase tracking-[0.2em] font-medium text-red-500 flex items-center gap-2 shrink-0">
            DELETE ACCOUNT <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
          </button>
        </div>

      </div>

      {/* Info Message */}
      <div className="flex items-start gap-3 text-white/40 font-sans text-[0.65rem] leading-relaxed mt-auto">
        <Info size={14} className="shrink-0 mt-0.5" />
        <p>Coach-shared notes and pre-session responses are separate from My Notes.</p>
      </div>
    </div>
  );
}
