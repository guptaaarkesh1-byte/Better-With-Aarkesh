import React, { useState, useEffect } from 'react';
import { Gear, Key, FloppyDisk, LockKey, Eye, EyeSlash } from '@phosphor-icons/react';
import AdminBreadcrumb from '../components/ui/AdminBreadcrumb';
import AdminCardPills from '../components/ui/AdminCardPills';

export default function AdminSettings() {
  const [activePill, setActivePill] = useState('password');
  const [razorpayKeyId, setRazorpayKeyId] = useState('');
  const [razorpayKeySecret, setRazorpayKeySecret] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isPasswordLoading, setIsPasswordLoading] = useState(false);
  const [passwordMessage, setPasswordMessage] = useState('');

  const [showRazorpaySecret, setShowRazorpaySecret] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      const res = await fetch(`${apiUrl}/api/payment/settings`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (res.ok) {
        const data = await res.json();
        setRazorpayKeyId(data.keyId || '');
        setRazorpayKeySecret(data.keySecret || '');
      }
    } catch (error) {
      console.error('Failed to fetch settings', error);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage('');

    try {
      const token = localStorage.getItem('adminToken');
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      const res = await fetch(`${apiUrl}/api/payment/settings`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ keyId: razorpayKeyId, keySecret: razorpayKeySecret })
      });

      if (res.ok) {
        setMessage('Settings saved successfully!');
      } else {
        setMessage('Failed to save settings.');
      }
    } catch (error) {
      console.error(error);
      setMessage('Network error while saving settings.');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setPasswordMessage('New passwords do not match.');
      return;
    }
    setIsPasswordLoading(true);
    setPasswordMessage('');

    try {
      const token = localStorage.getItem('adminToken');
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      const res = await fetch(`${apiUrl}/api/auth/admin/change-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ currentPassword, newPassword })
      });

      if (res.ok) {
        setPasswordMessage('Password changed successfully!');
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
      } else {
        const data = await res.json();
        setPasswordMessage(data.message || 'Failed to change password.');
      }
    } catch (error) {
      console.error(error);
      setPasswordMessage('Network error while changing password.');
    } finally {
      setIsPasswordLoading(false);
    }
  };

  return (
    <div className="p-8 md:p-12 w-full max-w-5xl mx-auto flex flex-col gap-8 animate-in fade-in duration-500 font-sans">
      
      <AdminBreadcrumb items={['MY JOURNEY', 'SETTINGS']} />

      <AdminCardPills 
        title="Settings" 
        icon={<Gear size={24} />}
        pills={[
          { id: 'password', label: 'Password' },
          { id: 'razorpay', label: 'Razorpay' }
        ]}
        activePill={activePill}
        onPillClick={setActivePill}
      />

      <div className="mt-4">
        {activePill === 'razorpay' && (
          <div className="bg-[#111] border border-white/5 rounded-2xl p-8 flex flex-col gap-6 relative shadow-2xl animate-in fade-in duration-300">
            <div className="flex items-center gap-3 text-[#c79c6e] border-b border-white/5 pb-4">
              <Gear size={24} />
              <h2 className="font-serif text-2xl text-white">Payment Gateway</h2>
            </div>

        <form onSubmit={handleSave} className="flex flex-col gap-6 mt-2">
          
          <div className="flex flex-col gap-2">
            <label className="font-sans text-xs uppercase tracking-widest text-white/60 font-semibold flex items-center gap-2">
              <Key size={14} /> Razorpay Key ID
            </label>
            <input 
              type="text" 
              value={razorpayKeyId}
              onChange={(e) => setRazorpayKeyId(e.target.value)}
              placeholder="rzp_test_..."
              className="w-full bg-[#0a0a0a] border border-white/10 rounded-lg px-4 py-3 text-white placeholder-white/20 focus:outline-none focus:border-[#c79c6e]/50 transition-colors font-mono text-sm"
              required
            />
          </div>

          <div className="flex flex-col gap-2">
            <label className="font-sans text-xs uppercase tracking-widest text-white/60 font-semibold flex items-center gap-2">
              <Key size={14} /> Razorpay Key Secret
            </label>
            <div className="relative">
              <input 
                type={showRazorpaySecret ? "text" : "password"}
                value={razorpayKeySecret}
                onChange={(e) => setRazorpayKeySecret(e.target.value)}
                placeholder="Enter your secret key"
                className="w-full bg-[#0a0a0a] border border-white/10 rounded-lg px-4 py-3 pr-12 text-white placeholder-white/20 focus:outline-none focus:border-[#c79c6e]/50 transition-colors font-mono text-sm"
                required
              />
              <button 
                type="button"
                onClick={() => setShowRazorpaySecret(!showRazorpaySecret)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-white/40 hover:text-white transition-colors focus:outline-none"
              >
                {showRazorpaySecret ? <EyeSlash size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          {message && (
            <div className={`p-4 rounded-lg border text-sm font-medium ${message.includes('success') ? 'bg-green-500/10 border-green-500/20 text-green-500' : 'bg-red-500/10 border-red-500/20 text-red-500'}`}>
              {message}
            </div>
          )}

          <div className="flex justify-end mt-4">
            <button 
              type="submit"
              disabled={isLoading}
              className="flex items-center gap-2 px-8 py-3 rounded bg-[#c79c6e] text-black hover:bg-[#b0885e] font-sans text-xs uppercase tracking-widest font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <FloppyDisk size={18} />
              {isLoading ? 'Saving...' : 'Save Settings'}
            </button>
          </div>

        </form>
          </div>
        )}

        {activePill === 'password' && (
          <div className="bg-[#111] border border-white/5 rounded-2xl p-8 flex flex-col gap-6 relative shadow-2xl animate-in fade-in duration-300">
            <div className="flex items-center gap-3 text-[#c79c6e] border-b border-white/5 pb-4">
              <LockKey size={24} />
              <h2 className="font-serif text-2xl text-white">Security</h2>
            </div>

        <form onSubmit={handlePasswordChange} className="flex flex-col gap-6 mt-2">
          
          <div className="flex flex-col gap-2">
            <label className="font-sans text-xs uppercase tracking-widest text-white/60 font-semibold flex items-center gap-2">
              <Key size={14} /> Current Password
            </label>
            <div className="relative">
              <input 
                type={showCurrentPassword ? "text" : "password"}
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="Enter current password"
                className="w-full bg-[#0a0a0a] border border-white/10 rounded-lg px-4 py-3 pr-12 text-white placeholder-white/20 focus:outline-none focus:border-[#c79c6e]/50 transition-colors font-mono text-sm"
                required
              />
              <button 
                type="button"
                onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-white/40 hover:text-white transition-colors focus:outline-none"
              >
                {showCurrentPassword ? <EyeSlash size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <label className="font-sans text-xs uppercase tracking-widest text-white/60 font-semibold flex items-center gap-2">
              <Key size={14} /> New Password
            </label>
            <div className="relative">
              <input 
                type={showNewPassword ? "text" : "password"}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Enter new password"
                className="w-full bg-[#0a0a0a] border border-white/10 rounded-lg px-4 py-3 pr-12 text-white placeholder-white/20 focus:outline-none focus:border-[#c79c6e]/50 transition-colors font-mono text-sm"
                required
              />
              <button 
                type="button"
                onClick={() => setShowNewPassword(!showNewPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-white/40 hover:text-white transition-colors focus:outline-none"
              >
                {showNewPassword ? <EyeSlash size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <label className="font-sans text-xs uppercase tracking-widest text-white/60 font-semibold flex items-center gap-2">
              <Key size={14} /> Re-enter New Password
            </label>
            <div className="relative">
              <input 
                type={showConfirmPassword ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Re-enter new password"
                className="w-full bg-[#0a0a0a] border border-white/10 rounded-lg px-4 py-3 pr-12 text-white placeholder-white/20 focus:outline-none focus:border-[#c79c6e]/50 transition-colors font-mono text-sm"
                required
              />
              <button 
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-white/40 hover:text-white transition-colors focus:outline-none"
              >
                {showConfirmPassword ? <EyeSlash size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          {passwordMessage && (
            <div className={`p-4 rounded-lg border text-sm font-medium ${passwordMessage.includes('success') ? 'bg-green-500/10 border-green-500/20 text-green-500' : 'bg-red-500/10 border-red-500/20 text-red-500'}`}>
              {passwordMessage}
            </div>
          )}

          <div className="flex justify-end mt-4">
            <button 
              type="submit"
              disabled={isPasswordLoading}
              className="flex items-center gap-2 px-8 py-3 rounded bg-[#c79c6e] text-black hover:bg-[#b0885e] font-sans text-xs uppercase tracking-widest font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <LockKey size={18} />
              {isPasswordLoading ? 'Changing...' : 'Change Password'}
            </button>
          </div>

        </form>
          </div>
        )}
      </div>

    </div>
  );
}
