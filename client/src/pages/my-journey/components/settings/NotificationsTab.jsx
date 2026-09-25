import React, { useState, useEffect } from 'react';
import { Check } from '@phosphor-icons/react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

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
  });
  const [loading, setLoading] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Fetch preferences on mount
  useEffect(() => {
    const fetchPreferences = async () => {
      const token = localStorage.getItem('token');
      if (!token) return;

      try {
        const res = await fetch(`${API_URL}/api/users/preferences`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          setToggles({
            emailReminders: data.emailReminders ?? true,
            emailChanges: data.emailChanges ?? true,
          });
        }
      } catch (err) {
        console.error('Failed to load notification preferences:', err);
      }
    };

    fetchPreferences();
  }, []);

  const toggleHandler = (key) => {
    setToggles(prev => ({ ...prev, [key]: !prev[key] }));
    setSaveSuccess(false);
  };

  const handleSave = async () => {
    const token = localStorage.getItem('token');
    if (!token) return;

    setLoading(true);
    setSaveSuccess(false);

    try {
      const res = await fetch(`${API_URL}/api/users/preferences`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(toggles)
      });

      if (res.ok) {
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 3000);
      }
    } catch (err) {
      console.error('Failed to save preferences:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-2xl border border-white/10 rounded-xl p-8 md:p-10 bg-[#0a0a0a]/80 backdrop-blur-sm flex flex-col animate-in fade-in duration-500">
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
        </div>
      </div>

      {/* Action Buttons */}
      <div className="mt-auto flex items-center gap-4">
        <button 
          onClick={handleSave}
          disabled={loading}
          className="px-6 py-2.5 border border-[#c79c6e] text-[#c79c6e] rounded text-[0.65rem] uppercase tracking-[0.2em] font-medium hover:bg-[#c79c6e] hover:text-black transition-colors cursor-pointer disabled:opacity-50"
        >
          {loading ? 'SAVING...' : 'SAVE PREFERENCES'}
        </button>

        {saveSuccess && (
          <span className="flex items-center gap-1.5 text-xs text-[#c79c6e] font-sans font-medium animate-in fade-in">
            <Check size={14} weight="bold" /> Preferences saved
          </span>
        )}
      </div>
    </div>
  );
}
