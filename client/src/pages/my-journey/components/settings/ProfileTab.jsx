import React, { useState } from 'react';
import { Info } from '@phosphor-icons/react';

export default function ProfileTab() {
  const [userInfo, setUserInfo] = useState(() => {
    const saved = localStorage.getItem('userInfo');
    return saved ? JSON.parse(saved) : {};
  });

  return (
    <div className="w-full max-w-2xl border border-white/10 rounded-xl p-8 md:p-10 bg-[#0a0a0a]/80 backdrop-blur-sm flex flex-col animate-in fade-in duration-500">
      <h2 className="font-serif text-3xl text-white mb-2">Profile</h2>
      <p className="font-sans text-white/70 text-sm mb-10">
        Your contact details and personal information.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6 mb-8">
        {/* Display Name */}
        <div className="flex flex-col gap-2">
          <label className="font-sans text-[0.65rem] uppercase tracking-[0.15em] text-white/60 font-medium">Display name</label>
          <input 
            type="text" 
            defaultValue={userInfo.fullName || ''}
            className="w-full bg-transparent border border-white/10 rounded-lg px-4 py-3 text-sm text-white focus:outline-none focus:border-[#c79c6e]/60 transition-colors"
          />
        </div>

        {/* Email Address */}
        <div className="flex flex-col gap-2 relative">
          <label className="font-sans text-[0.65rem] uppercase tracking-[0.15em] text-white/60 font-medium">Email address</label>
          <input 
            type="email" 
            defaultValue={userInfo.email || ''}
            className="w-full bg-transparent border border-white/10 rounded-lg px-4 py-3 text-sm text-white/50 focus:outline-none focus:border-[#c79c6e]/60 transition-colors"
            readOnly
          />
        </div>

        {/* Mobile */}
        <div className="flex flex-col gap-2">
          <label className="font-sans text-[0.65rem] uppercase tracking-[0.15em] text-white/60 font-medium">Mobile / WhatsApp</label>
          <input 
            type="text" 
            defaultValue={userInfo.phoneNumber ? `${userInfo.countryCode || '+91'} ${userInfo.phoneNumber}` : ''}
            className="w-full bg-transparent border border-white/10 rounded-lg px-4 py-3 text-sm text-white focus:outline-none focus:border-[#c79c6e]/60 transition-colors"
          />
        </div>

        {/* Date of Birth */}
        <div className="flex flex-col gap-2">
          <label className="font-sans text-[0.65rem] uppercase tracking-[0.15em] text-white/60 font-medium flex justify-between">
            <span>Date of birth</span>
            <span className="text-white/30">Optional</span>
          </label>
          <input 
            type="text" 
            defaultValue={userInfo.dob || ''}
            placeholder="DD / MM / YYYY"
            className="w-full bg-transparent border border-white/10 rounded-lg px-4 py-3 text-sm text-white focus:outline-none focus:border-[#c79c6e]/60 transition-colors"
          />
        </div>

        {/* Gender */}
        <div className="flex flex-col gap-2">
          <label className="font-sans text-[0.65rem] uppercase tracking-[0.15em] text-white/60 font-medium flex justify-between">
            <span>Gender</span>
            <span className="text-white/30">Optional</span>
          </label>
          <select 
            defaultValue={userInfo.gender || 'Prefer not to say'}
            className="w-full bg-transparent border border-white/10 rounded-lg px-4 py-3 text-sm text-white focus:outline-none focus:border-[#c79c6e]/60 transition-colors appearance-none cursor-pointer"
          >
            <option className="bg-[#050505] text-white">Prefer not to say</option>
            <option className="bg-[#050505] text-white">Male</option>
            <option className="bg-[#050505] text-white">Female</option>
            <option className="bg-[#050505] text-white">Other</option>
          </select>
        </div>
      </div>

      {/* Info Message */}
      <div className="flex items-start gap-3 text-white/60 font-sans text-xs leading-relaxed mb-10 max-w-sm">
        <Info size={16} className="shrink-0 mt-0.5" />
        <p>Your email or mobile number is used to sign in. A separate username is not required.</p>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center gap-6 mt-auto">
        <button className="px-6 py-2.5 border border-[#c79c6e] text-[#c79c6e] rounded text-[0.65rem] uppercase tracking-[0.2em] font-medium hover:bg-[#c79c6e] hover:text-black transition-colors">
          SAVE CHANGES
        </button>
        <button className="text-[0.65rem] uppercase tracking-[0.2em] font-medium text-white/50 hover:text-white transition-colors">
          Cancel
        </button>
      </div>
    </div>
  );
}
