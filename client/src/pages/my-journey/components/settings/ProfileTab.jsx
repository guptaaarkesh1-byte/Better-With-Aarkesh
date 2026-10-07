import React, { useState, useEffect } from 'react';
import { Info, CheckCircle, WarningCircle, CircleNotch } from '@phosphor-icons/react';
import API_URL from '../../../../utils/apiUrl';

export default function ProfileTab() {
  const [userInfo, setUserInfo] = useState(() => {
    try {
      const saved = localStorage.getItem('userInfo') || localStorage.getItem('user') || localStorage.getItem('courseUser');
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  const [fullName, setFullName] = useState(() => userInfo.fullName || userInfo.name || '');
  const [email, setEmail] = useState(() => userInfo.email || '');
  const [phoneNumber, setPhoneNumber] = useState(() => userInfo.phoneNumber || userInfo.phone || '');
  const [dob, setDob] = useState(() => userInfo.dob || '');
  const [gender, setGender] = useState(() => userInfo.gender || 'Prefer not to say');

  const [isSaving, setIsSaving] = useState(false);
  const [statusMessage, setStatusMessage] = useState({ type: '', text: '' });

  // Fetch latest profile from DB on mount
  useEffect(() => {
    const fetchLatestProfile = async () => {
      try {
        const token = localStorage.getItem('token') || localStorage.getItem('courseToken');
        if (!token) return;

        const res = await fetch(`${API_URL}/api/users/profile`, {
          headers: { Authorization: `Bearer ${token}` }
        });

        if (res.ok) {
          const data = await res.json();
          if (data) {
            setUserInfo(data);
            if (data.fullName) setFullName(data.fullName);
            if (data.email) setEmail(data.email);
            if (data.phoneNumber) setPhoneNumber(data.phoneNumber);
            if (data.dob) setDob(data.dob);
            if (data.gender) setGender(data.gender);
            localStorage.setItem('userInfo', JSON.stringify(data));
          }
        }
      } catch (err) {
        console.error('Failed to load profile:', err);
      }
    };

    fetchLatestProfile();
  }, []);

  // Save changes handler
  const handleSaveProfile = async (e) => {
    if (e) e.preventDefault();
    setIsSaving(true);
    setStatusMessage({ type: '', text: '' });

    try {
      const token = localStorage.getItem('token') || localStorage.getItem('courseToken');
      const res = await fetch(`${API_URL}/api/users/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          fullName,
          phoneNumber,
          dob,
          gender
        })
      });

      const data = await res.json();
      if (res.ok) {
        setStatusMessage({ type: 'success', text: 'Profile updated successfully ✓' });
        const updatedUser = data.user || { fullName, email, phoneNumber, dob, gender };
        setUserInfo(updatedUser);
        localStorage.setItem('userInfo', JSON.stringify(updatedUser));
        window.dispatchEvent(new Event('auth-change'));
        setTimeout(() => setStatusMessage({ type: '', text: '' }), 4000);
      } else {
        setStatusMessage({ type: 'error', text: data.message || 'Failed to update profile.' });
      }
    } catch (err) {
      console.error('Save profile error:', err);
      setStatusMessage({ type: 'error', text: 'Network error. Please try again.' });
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setFullName(userInfo.fullName || userInfo.name || '');
    setPhoneNumber(userInfo.phoneNumber || userInfo.phone || '');
    setDob(userInfo.dob || '');
    setGender(userInfo.gender || 'Prefer not to say');
    setStatusMessage({ type: '', text: '' });
  };

  return (
    <form onSubmit={handleSaveProfile} className="w-full max-w-2xl border border-black/10 rounded-2xl p-6 sm:p-8 md:p-10 bg-white shadow-xs flex flex-col animate-in fade-in duration-500">
      <h2 className="font-serif text-2xl sm:text-3xl text-[#111010] mb-2 font-medium">Profile</h2>
      <p className="font-sans text-[#555047] text-sm mb-8 sm:mb-10 font-light">
        Your contact details and personal information.
      </p>

      {statusMessage.text && (
        <div className={`mb-6 p-4 rounded-xl flex items-center gap-2.5 text-xs font-medium ${
          statusMessage.type === 'success' 
            ? 'bg-emerald-50 border border-emerald-200 text-emerald-800' 
            : 'bg-rose-50 border border-rose-200 text-rose-800'
        }`}>
          {statusMessage.type === 'success' ? <CheckCircle size={16} weight="fill" className="text-emerald-600 shrink-0" /> : <WarningCircle size={16} weight="fill" className="text-rose-600 shrink-0" />}
          <span>{statusMessage.text}</span>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6 mb-8">
        {/* Display Name */}
        <div className="flex flex-col gap-2">
          <label className="font-sans text-[0.65rem] uppercase tracking-[0.15em] text-[#7a756b] font-bold">Display name</label>
          <input 
            type="text" 
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            placeholder="Your Name"
            className="w-full bg-[#fcfbfa] border border-black/10 rounded-xl px-4 py-3 text-sm text-[#111010] focus:outline-none focus:border-[#c9542f] transition-colors"
          />
        </div>

        {/* Email Address */}
        <div className="flex flex-col gap-2 relative">
          <label className="font-sans text-[0.65rem] uppercase tracking-[0.15em] text-[#7a756b] font-bold">Email address</label>
          <input 
            type="email" 
            value={email}
            readOnly
            className="w-full bg-black/5 border border-black/10 rounded-xl px-4 py-3 text-sm text-[#555047] focus:outline-none transition-colors cursor-not-allowed"
          />
        </div>

        {/* Mobile */}
        <div className="flex flex-col gap-2">
          <label className="font-sans text-[0.65rem] uppercase tracking-[0.15em] text-[#7a756b] font-bold">Mobile / WhatsApp</label>
          <input 
            type="tel" 
            value={phoneNumber}
            onChange={(e) => setPhoneNumber(e.target.value)}
            placeholder="+91 9876543210"
            className="w-full bg-[#fcfbfa] border border-black/10 rounded-xl px-4 py-3 text-sm text-[#111010] focus:outline-none focus:border-[#c9542f] transition-colors"
          />
        </div>

        {/* Date of Birth */}
        <div className="flex flex-col gap-2">
          <label className="font-sans text-[0.65rem] uppercase tracking-[0.15em] text-[#7a756b] font-bold flex justify-between">
            <span>Date of birth</span>
            <span className="text-[#7a756b]/60 font-normal">Optional</span>
          </label>
          <input 
            type="text" 
            value={dob}
            onChange={(e) => setDob(e.target.value)}
            placeholder="DD / MM / YYYY"
            className="w-full bg-[#fcfbfa] border border-black/10 rounded-xl px-4 py-3 text-sm text-[#111010] focus:outline-none focus:border-[#c9542f] transition-colors placeholder-[#7a756b]/40"
          />
        </div>

        {/* Gender */}
        <div className="flex flex-col gap-2">
          <label className="font-sans text-[0.65rem] uppercase tracking-[0.15em] text-[#7a756b] font-bold flex justify-between">
            <span>Gender</span>
            <span className="text-[#7a756b]/60 font-normal">Optional</span>
          </label>
          <select 
            value={gender}
            onChange={(e) => setGender(e.target.value)}
            className="w-full bg-[#fcfbfa] border border-black/10 rounded-xl px-4 py-3 text-sm text-[#111010] focus:outline-none focus:border-[#c9542f] transition-colors cursor-pointer"
          >
            <option value="Prefer not to say">Prefer not to say</option>
            <option value="Male">Male</option>
            <option value="Female">Female</option>
            <option value="Other">Other</option>
          </select>
        </div>
      </div>

      {/* Info Message */}
      <div className="flex items-start gap-3 text-[#555047] font-sans text-xs leading-relaxed mb-10 max-w-sm">
        <Info size={16} className="shrink-0 mt-0.5 text-[#c9542f]" />
        <p>Your email or mobile number is used to sign in and schedule coaching calls.</p>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center gap-4 mt-auto">
        <button 
          type="submit"
          disabled={isSaving}
          className="px-6 py-3 bg-[#c9542f] hover:bg-[#a64117] text-white rounded-xl text-xs uppercase tracking-[0.16em] font-bold transition-all shadow-md flex items-center gap-2 cursor-pointer disabled:opacity-50"
        >
          {isSaving ? (
            <>
              <CircleNotch size={14} className="animate-spin" />
              <span>SAVING...</span>
            </>
          ) : (
            <span>SAVE CHANGES</span>
          )}
        </button>
        <button 
          type="button"
          onClick={handleCancel}
          disabled={isSaving}
          className="px-6 py-3 border border-black/10 text-[#555047] hover:text-[#111010] rounded-xl text-xs uppercase tracking-[0.16em] font-bold transition-colors cursor-pointer"
        >
          CANCEL
        </button>
      </div>
    </form>
  );
}
