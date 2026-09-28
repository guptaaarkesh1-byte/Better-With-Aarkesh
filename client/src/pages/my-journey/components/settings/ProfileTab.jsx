import React, { useState } from 'react';
import { Info } from '@phosphor-icons/react';

export default function ProfileTab() {
  const [userInfo, setUserInfo] = useState(() => {
    const saved = localStorage.getItem('userInfo');
    return saved ? JSON.parse(saved) : {};
  });

  return (
    <div className="w-full max-w-2xl border border-black/10 rounded-2xl p-6 sm:p-8 md:p-10 bg-white shadow-xs flex flex-col animate-in fade-in duration-500">
      <h2 className="font-serif text-2xl sm:text-3xl text-[#111010] mb-2 font-medium">Profile</h2>
      <p className="font-sans text-[#555047] text-sm mb-8 sm:mb-10 font-light">
        Your contact details and personal information.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6 mb-8">
        {/* Display Name */}
        <div className="flex flex-col gap-2">
          <label className="font-sans text-[0.65rem] uppercase tracking-[0.15em] text-[#7a756b] font-bold">Display name</label>
          <input 
            type="text" 
            defaultValue={userInfo.fullName || ''}
            className="w-full bg-[#fcfbfa] border border-black/10 rounded-xl px-4 py-3 text-sm text-[#111010] focus:outline-none focus:border-[#802673] transition-colors"
          />
        </div>

        {/* Email Address */}
        <div className="flex flex-col gap-2 relative">
          <label className="font-sans text-[0.65rem] uppercase tracking-[0.15em] text-[#7a756b] font-bold">Email address</label>
          <input 
            type="email" 
            defaultValue={userInfo.email || ''}
            className="w-full bg-black/5 border border-black/10 rounded-xl px-4 py-3 text-sm text-[#555047] focus:outline-none transition-colors"
            readOnly
          />
        </div>

        {/* Mobile */}
        <div className="flex flex-col gap-2">
          <label className="font-sans text-[0.65rem] uppercase tracking-[0.15em] text-[#7a756b] font-bold">Mobile / WhatsApp</label>
          <input 
            type="text" 
            defaultValue={userInfo.phoneNumber ? `${userInfo.countryCode || '+91'} ${userInfo.phoneNumber}` : ''}
            className="w-full bg-[#fcfbfa] border border-black/10 rounded-xl px-4 py-3 text-sm text-[#111010] focus:outline-none focus:border-[#802673] transition-colors"
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
            defaultValue={userInfo.dob || ''}
            placeholder="DD / MM / YYYY"
            className="w-full bg-[#fcfbfa] border border-black/10 rounded-xl px-4 py-3 text-sm text-[#111010] focus:outline-none focus:border-[#802673] transition-colors placeholder-[#7a756b]/40"
          />
        </div>

        {/* Gender */}
        <div className="flex flex-col gap-2">
          <label className="font-sans text-[0.65rem] uppercase tracking-[0.15em] text-[#7a756b] font-bold flex justify-between">
            <span>Gender</span>
            <span className="text-[#7a756b]/60 font-normal">Optional</span>
          </label>
          <select 
            defaultValue={userInfo.gender || 'Prefer not to say'}
            className="w-full bg-[#fcfbfa] border border-black/10 rounded-xl px-4 py-3 text-sm text-[#111010] focus:outline-none focus:border-[#802673] transition-colors cursor-pointer"
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
        <Info size={16} className="shrink-0 mt-0.5 text-[#802673]" />
        <p>Your email or mobile number is used to sign in. A separate username is not required.</p>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center gap-4 mt-auto">
        <button className="px-6 py-3 bg-[#802673] text-white rounded-xl text-xs uppercase tracking-[0.16em] font-bold hover:bg-[#962e87] transition-all shadow-md cursor-pointer">
          SAVE CHANGES
        </button>
        <button className="px-6 py-3 border border-black/10 text-[#555047] hover:text-[#111010] rounded-xl text-xs uppercase tracking-[0.16em] font-bold transition-colors cursor-pointer">
          CANCEL
        </button>
      </div>
    </div>
  );
}
