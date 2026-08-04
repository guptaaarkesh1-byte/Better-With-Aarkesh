import React, { useState } from 'react';
import { Info } from '@phosphor-icons/react';

// Reusable toggle switch component
const Toggle = ({ isOn, onToggle }) => (
  <div 
    onClick={onToggle}
    className={`w-10 h-5 rounded-full flex items-center p-0.5 cursor-pointer transition-colors duration-300 ${isOn ? 'bg-[#c79c6e]' : 'bg-white/20'}`}
  >
    <div 
      className={`w-4 h-4 rounded-full bg-black shadow-sm transform transition-transform duration-300 ${isOn ? 'translate-x-5' : 'translate-x-0'}`} 
    />
  </div>
);

export default function NotificationsTab() {
  const [toggles, setToggles] = useState({
    emailReminders: true,
    emailChanges: true,
    emailNotes: true,
    emailUpdates: false,
    waReminders: true,
    waChanges: true,
    waNotes: false,
  });

  const toggleHandler = (key) => {
    setToggles(prev => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <div className="w-full max-w-2xl border border-white/10 rounded-xl p-8 md:p-10 bg-[#0a0a0a]/80 backdrop-blur-md flex flex-col animate-in fade-in duration-500">
      <h2 className="font-serif text-3xl text-white mb-2">Notifications</h2>
      <p className="font-sans text-white/70 text-sm mb-10">
        Choose how and when you would like to hear from us.
      </p>

      {/* EMAIL SECTION */}
      <div className="mb-10">
        <span className="font-sans text-[0.65rem] uppercase tracking-[0.2em] font-medium text-[#c79c6e] mb-6 block">
          EMAIL
        </span>
        <div className="flex flex-col gap-5">
          <div className="flex items-center justify-between">
            <span className="font-serif text-white/90">Upcoming conversation reminders</span>
            <Toggle isOn={toggles.emailReminders} onToggle={() => toggleHandler('emailReminders')} />
          </div>
          <div className="flex items-center justify-between">
            <span className="font-serif text-white/90">Changes to an appointment</span>
            <Toggle isOn={toggles.emailChanges} onToggle={() => toggleHandler('emailChanges')} />
          </div>
          <div className="flex items-center justify-between">
            <span className="font-serif text-white/90">Coach's Notes added</span>
            <Toggle isOn={toggles.emailNotes} onToggle={() => toggleHandler('emailNotes')} />
          </div>
          <div className="flex items-center justify-between">
            <span className="font-serif text-white/90">New Perspectives and occasional updates</span>
            <Toggle isOn={toggles.emailUpdates} onToggle={() => toggleHandler('emailUpdates')} />
          </div>
        </div>
      </div>

      {/* WHATSAPP SECTION */}
      <div className="mb-10">
        <span className="font-sans text-[0.65rem] uppercase tracking-[0.2em] font-medium text-[#c79c6e] mb-6 block">
          WHATSAPP
        </span>
        <div className="flex flex-col gap-5">
          <div className="flex items-center justify-between">
            <span className="font-serif text-white/90">Upcoming conversation reminders</span>
            <Toggle isOn={toggles.waReminders} onToggle={() => toggleHandler('waReminders')} />
          </div>
          <div className="flex items-center justify-between">
            <span className="font-serif text-white/90">Changes to an appointment</span>
            <Toggle isOn={toggles.waChanges} onToggle={() => toggleHandler('waChanges')} />
          </div>
          <div className="flex items-center justify-between">
            <span className="font-serif text-white/90">Coach's Notes added</span>
            <Toggle isOn={toggles.waNotes} onToggle={() => toggleHandler('waNotes')} />
          </div>
        </div>
      </div>

      {/* Reminder Timing */}
      <div className="flex flex-col md:flex-row md:items-center gap-6 mb-6">
        <span className="font-serif text-white/70">Reminder timing</span>
        <div className="flex gap-4">
          <button className="px-6 py-2 border border-[#c79c6e] text-[#c79c6e] bg-[#c79c6e]/10 rounded text-[0.7rem] uppercase tracking-widest font-medium transition-colors">
            24 hours before
          </button>
          <button className="px-6 py-2 border border-white/20 text-white/60 hover:text-white rounded text-[0.7rem] uppercase tracking-widest font-medium transition-colors">
            2 hours before
          </button>
        </div>
      </div>

      {/* Info Message */}
      <div className="flex items-start gap-3 text-white/60 font-sans text-xs leading-relaxed mb-10">
        <Info size={16} className="shrink-0 mt-0.5" />
        <p>Essential booking confirmations may still be sent when required.</p>
      </div>

      {/* Action Buttons */}
      <div className="mt-auto">
        <button className="px-6 py-2.5 border border-[#c79c6e] text-[#c79c6e] rounded text-[0.65rem] uppercase tracking-[0.2em] font-medium hover:bg-[#c79c6e] hover:text-black transition-colors">
          SAVE PREFERENCES
        </button>
      </div>
    </div>
  );
}
