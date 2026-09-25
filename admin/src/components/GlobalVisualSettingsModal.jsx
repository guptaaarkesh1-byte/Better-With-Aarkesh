import React, { useState, useEffect } from 'react';
import { useToast } from '../context/ToastContext';
import { 
  X, 
  SlidersHorizontal, 
  Sun, 
  Sparkle, 
  ArrowCounterClockwise, 
  FloppyDisk, 
  CheckCircle,
  Eye,
  Drop,
  TextAa,
  Quotes
} from '@phosphor-icons/react';

import heroPreviewImg from '../../../client/src/assets/hero.webp';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const FONT_PRESETS = [
  { label: 'Compact', scale: 90, desc: '90% Scale' },
  { label: 'Standard', scale: 100, desc: '100% Default' },
  { label: 'Comfort', scale: 110, desc: '110% Readable' },
  { label: 'Large', scale: 120, desc: '120% Senior/High-Vis' },
];

export default function GlobalVisualSettingsModal({ isOpen, onClose }) {
  const { showSuccess, showError } = useToast();
  const [activeTab, setActiveTab] = useState('font'); // 'font' | 'visuals'
  const [settings, setSettings] = useState({
    contrast: 100,
    brightness: 100,
    overlayDarkness: 40,
    saturation: 100,
    fontScale: 100,
  });

  const [initialSettings, setInitialSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Fetch current settings on open
  useEffect(() => {
    if (!isOpen) return;
    setLoading(true);
    setSaveSuccess(false);
    fetch(`${API_URL}/api/visual-settings`)
      .then(res => res.json())
      .then(data => {
        if (data) {
          const loaded = {
            contrast: data.contrast ?? 100,
            brightness: data.brightness ?? 100,
            overlayDarkness: data.overlayDarkness ?? 40,
            saturation: data.saturation ?? 100,
            fontScale: data.fontScale ?? 100,
          };
          setSettings(loaded);
          setInitialSettings(loaded);
        }
        setLoading(false);
      })
      .catch(err => {
        console.error('Failed to load visual settings:', err);
        setLoading(false);
      });
  }, [isOpen]);

  if (!isOpen) return null;

  const handleReset = () => {
    setSettings({
      contrast: 100,
      brightness: 100,
      overlayDarkness: 40,
      saturation: 100,
      fontScale: 100,
    });
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      const token = localStorage.getItem('adminToken');
      const res = await fetch(`${API_URL}/api/visual-settings`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        },
        body: JSON.stringify(settings)
      });

      if (res.ok) {
        try {
          localStorage.setItem('bwa_visual_settings', JSON.stringify(settings));
          // Live apply to current document
          document.documentElement.style.setProperty('--site-contrast', `${settings.contrast}%`);
          document.documentElement.style.setProperty('--site-brightness', `${settings.brightness}%`);
          document.documentElement.style.setProperty('--overlay-opacity', `${settings.overlayDarkness / 100}`);
          document.documentElement.style.setProperty('--site-saturation', `${settings.saturation}%`);
          document.documentElement.style.setProperty('--site-font-scale', `${settings.fontScale}`);
        } catch (e) {}

        showSuccess('Universal font size & visual settings saved across all website pages!');
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 3000);
      } else {
        showError('Failed to save master visual settings');
      }
    } catch (err) {
      console.error('Error saving visual settings:', err);
      showError('Error saving master visual settings');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-[#0d0d0d] border border-white/10 rounded-2xl overflow-hidden shadow-2xl flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#c79c6e]/10 border border-[#c79c6e]/30 flex items-center justify-center text-[#c79c6e]">
              <SlidersHorizontal size={20} weight="bold" />
            </div>
            <div>
              <h2 className="font-serif text-lg text-white font-medium">Master Website Controller</h2>
              <p className="font-sans text-xs text-white/40">Universal Font Size, Contrast, Brightness &amp; Overlay Darkness</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-lg border border-white/10 hover:border-white/30 text-white/40 hover:text-white transition-all"
          >
            <X size={16} />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-2 px-6 pt-3 pb-0 border-b border-white/5 bg-[#0a0a0a]">
          <button
            type="button"
            onClick={() => setActiveTab('font')}
            className={`flex items-center gap-2 px-4 py-2.5 text-xs font-semibold uppercase tracking-wider rounded-t-lg transition-all border-b-2 ${
              activeTab === 'font'
                ? 'text-[#c79c6e] border-[#c79c6e] bg-[#141210]'
                : 'text-white/40 border-transparent hover:text-white hover:bg-white/5'
            }`}
          >
            <TextAa size={16} weight="bold" />
            <span>Universal Font Size</span>
            <span className="px-1.5 py-0.2 text-[0.65rem] rounded bg-[#c79c6e]/20 text-[#c79c6e] font-mono">
              {settings.fontScale}%
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('visuals')}
            className={`flex items-center gap-2 px-4 py-2.5 text-xs font-semibold uppercase tracking-wider rounded-t-lg transition-all border-b-2 ${
              activeTab === 'visuals'
                ? 'text-[#c79c6e] border-[#c79c6e] bg-[#141210]'
                : 'text-white/40 border-transparent hover:text-white hover:bg-white/5'
            }`}
          >
            <Sun size={16} weight="bold" />
            <span>Contrast &amp; Brightness</span>
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto flex flex-col gap-6 font-sans">
          
          {/* Success Toast */}
          {saveSuccess && (
            <div className="p-3.5 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 flex items-center gap-2.5 text-xs font-semibold animate-in fade-in">
              <CheckCircle size={18} weight="fill" />
              <span>Settings saved and applied to all pages across the website!</span>
            </div>
          )}

          {activeTab === 'font' && (
            <div className="flex flex-col gap-6 animate-in fade-in duration-200">
              {/* Info Banner */}
              <div className="p-3.5 rounded-xl bg-[#c79c6e]/10 border border-[#c79c6e]/20 flex items-start gap-3">
                <Sparkle size={18} className="text-[#c79c6e] shrink-0 mt-0.5" weight="fill" />
                <p className="text-xs text-white/80 leading-relaxed">
                  <strong className="text-[#c79c6e]">Universal Font Size Scale:</strong> Adjusting this single master bar proportionally resizes <strong>every heading, title, subtitle, card text, button, and body paragraph</strong> across all pages of the website simultaneously.
                </p>
              </div>

              {/* Slider Control Card */}
              <div className="bg-[#121212] border border-white/5 p-5 rounded-2xl flex flex-col gap-5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <TextAa size={20} className="text-[#c79c6e]" weight="bold" />
                    <div>
                      <span className="text-sm font-semibold text-white block">Master Font Size Scale</span>
                      <span className="text-[0.7rem] text-white/40">Default base: 100% (16px root)</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`text-sm font-mono font-bold px-3 py-1 rounded-lg ${
                      settings.fontScale === 100 ? 'bg-white/5 text-white/70' : 'bg-[#c79c6e]/20 text-[#c79c6e] border border-[#c79c6e]/30'
                    }`}>
                      {settings.fontScale}%
                    </span>
                    {settings.fontScale !== 100 && (
                      <span className="text-xs text-white/40">
                        {settings.fontScale > 100 ? `+${settings.fontScale - 100}% larger` : `-${100 - settings.fontScale}% smaller`}
                      </span>
                    )}
                  </div>
                </div>

                {/* Slider */}
                <input
                  type="range"
                  min="75"
                  max="135"
                  step="1"
                  value={settings.fontScale}
                  onChange={(e) => setSettings(prev => ({ ...prev, fontScale: Number(e.target.value) }))}
                  className="w-full accent-[#c79c6e] cursor-pointer h-2 bg-white/10 rounded-lg"
                />

                <div className="flex justify-between text-[0.7rem] text-white/40 px-1 font-mono">
                  <span>75% (Small)</span>
                  <span className="text-white/70 font-bold">100% (Default)</span>
                  <span>135% (Large)</span>
                </div>

                {/* Quick Presets */}
                <div className="pt-3 border-t border-white/5 flex flex-col gap-2">
                  <span className="text-[0.68rem] uppercase tracking-wider text-white/40 font-semibold">Quick Presets</span>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {FONT_PRESETS.map((preset) => {
                      const isActive = settings.fontScale === preset.scale;
                      return (
                        <button
                          key={preset.scale}
                          type="button"
                          onClick={() => setSettings(prev => ({ ...prev, fontScale: preset.scale }))}
                          className={`p-2.5 rounded-xl border text-left transition-all flex flex-col gap-0.5 ${
                            isActive
                              ? 'bg-[#c79c6e]/20 border-[#c79c6e] text-white'
                              : 'bg-white/5 border-white/5 text-white/60 hover:border-white/20 hover:text-white'
                          }`}
                        >
                          <span className={`text-xs font-semibold ${isActive ? 'text-[#c79c6e]' : 'text-white'}`}>
                            {preset.label}
                          </span>
                          <span className="text-[0.65rem] text-white/40 font-mono">
                            {preset.desc}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Live Simulated Typography Preview Box */}
              <div className="bg-[#121212] border border-white/5 rounded-2xl p-5 flex flex-col gap-4">
                <div className="flex items-center justify-between pb-3 border-b border-white/5">
                  <span className="text-xs font-semibold uppercase tracking-wider text-white/50 flex items-center gap-1.5">
                    <Eye size={16} className="text-[#c79c6e]" />
                    <span>Live Typography Preview (Scaled at {settings.fontScale}%)</span>
                  </span>
                  <span className="text-[0.68rem] text-[#c79c6e] font-mono">
                    ~{(16 * (settings.fontScale / 100)).toFixed(1)}px base root
                  </span>
                </div>

                {/* Typography Sample Card with dynamic font-size scaling */}
                <div 
                  className="bg-[#090909] border border-white/10 rounded-xl p-6 flex flex-col gap-3 transition-all duration-150 overflow-hidden"
                  style={{
                    fontSize: `${settings.fontScale}%`,
                  }}
                >
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded-full bg-[#c79c6e]/15 border border-[#c79c6e]/30 text-[#c79c6e] text-[0.7rem] font-semibold uppercase tracking-wider">
                      Chapter 01 • Master Sample
                    </span>
                    <span className="text-white/40 text-[0.75rem]">Life Coaching Framework</span>
                  </div>

                  <h3 className="font-serif text-2xl font-normal text-white leading-tight">
                    Where Executive Presence Meets Deep Inner Clarity
                  </h3>

                  <p className="text-white/70 text-sm leading-relaxed">
                    You don't need to fix everything at once. We build high-conviction decision making, emotional sovereignty, and an unshakeable presence in high-stakes environments.
                  </p>

                  <div className="pt-2 flex items-center gap-3">
                    <button type="button" className="px-4 py-2 rounded-lg bg-[#c79c6e] text-black font-semibold text-xs uppercase tracking-wider">
                      Book Private Session
                    </button>
                    <span className="text-xs text-white/50 italic flex items-center gap-1">
                      <Quotes size={12} className="text-[#c79c6e]" />
                      "Clear thinking creates calm action."
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'visuals' && (
            <div className="flex flex-col gap-6 animate-in fade-in duration-200">
              {/* Info Banner */}
              <div className="p-3.5 rounded-xl bg-[#c79c6e]/10 border border-[#c79c6e]/20 flex items-start gap-3">
                <Sparkle size={18} className="text-[#c79c6e] shrink-0 mt-0.5" weight="fill" />
                <p className="text-xs text-white/80 leading-relaxed">
                  <strong className="text-[#c79c6e]">Universal Visual Filters:</strong> Adjusting these master sliders changes the contrast, brightness, and darkening layer on <strong>every page, background image, and section</strong> across the entire website simultaneously.
                </p>
              </div>

              {/* Sliders Container */}
              <div className="flex flex-col gap-5 bg-[#121212] border border-white/5 p-5 rounded-2xl">
                
                {/* 1. Master Contrast */}
                <div className="flex flex-col gap-2">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-medium text-white flex items-center gap-2">
                      <Sun size={16} className="text-[#c79c6e]" weight="bold" />
                      <span>Master Contrast</span>
                    </label>
                    <div className="flex items-center gap-2">
                      <span className={`text-xs font-mono font-bold px-2 py-0.5 rounded ${
                        settings.contrast === 100 ? 'bg-white/5 text-white/60' : 'bg-[#c79c6e]/20 text-[#c79c6e]'
                      }`}>
                        {settings.contrast}%
                      </span>
                      {settings.contrast !== 100 && (
                        <span className="text-[0.68rem] text-white/30">
                          {settings.contrast > 100 ? `+${settings.contrast - 100}%` : `-${100 - settings.contrast}%`}
                        </span>
                      )}
                    </div>
                  </div>
                  <input
                    type="range"
                    min="50"
                    max="150"
                    step="1"
                    value={settings.contrast}
                    onChange={(e) => setSettings(prev => ({ ...prev, contrast: Number(e.target.value) }))}
                    className="w-full accent-[#c79c6e] cursor-pointer h-1.5 bg-white/10 rounded-lg"
                  />
                  <div className="flex justify-between text-[0.65rem] text-white/30 px-0.5">
                    <span>50% (Soft)</span>
                    <span>100% (Default)</span>
                    <span>150% (High Contrast)</span>
                  </div>
                </div>

                {/* 2. Master Brightness */}
                <div className="flex flex-col gap-2 pt-4 border-t border-white/5">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-medium text-white flex items-center gap-2">
                      <Sun size={16} className="text-amber-400" weight="fill" />
                      <span>Master Brightness</span>
                    </label>
                    <div className="flex items-center gap-2">
                      <span className={`text-xs font-mono font-bold px-2 py-0.5 rounded ${
                        settings.brightness === 100 ? 'bg-white/5 text-white/60' : 'bg-[#c79c6e]/20 text-[#c79c6e]'
                      }`}>
                        {settings.brightness}%
                      </span>
                      {settings.brightness !== 100 && (
                        <span className="text-[0.68rem] text-white/30">
                          {settings.brightness > 100 ? `+${settings.brightness - 100}%` : `-${100 - settings.brightness}%`}
                        </span>
                      )}
                    </div>
                  </div>
                  <input
                    type="range"
                    min="50"
                    max="150"
                    step="1"
                    value={settings.brightness}
                    onChange={(e) => setSettings(prev => ({ ...prev, brightness: Number(e.target.value) }))}
                    className="w-full accent-[#c79c6e] cursor-pointer h-1.5 bg-white/10 rounded-lg"
                  />
                  <div className="flex justify-between text-[0.65rem] text-white/30 px-0.5">
                    <span>50% (Dim)</span>
                    <span>100% (Natural)</span>
                    <span>150% (Bright)</span>
                  </div>
                </div>

                {/* 3. Global Overlay Darkness */}
                <div className="flex flex-col gap-2 pt-4 border-t border-white/5">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-medium text-white flex items-center gap-2">
                      <SlidersHorizontal size={16} className="text-[#c79c6e]" />
                      <span>Global Contrast Overlay Darkness</span>
                    </label>
                    <div className="flex items-center gap-2">
                      <span className={`text-xs font-mono font-bold px-2 py-0.5 rounded ${
                        settings.overlayDarkness === 40 ? 'bg-white/5 text-white/60' : 'bg-[#c79c6e]/20 text-[#c79c6e]'
                      }`}>
                        {settings.overlayDarkness}%
                      </span>
                      <span className="text-[0.68rem] text-white/30">
                        {settings.overlayDarkness < 30 ? 'Bright' : settings.overlayDarkness > 60 ? 'Deep Dark' : 'Balanced'}
                      </span>
                    </div>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="90"
                    step="1"
                    value={settings.overlayDarkness}
                    onChange={(e) => setSettings(prev => ({ ...prev, overlayDarkness: Number(e.target.value) }))}
                    className="w-full accent-[#c79c6e] cursor-pointer h-1.5 bg-white/10 rounded-lg"
                  />
                  <div className="flex justify-between text-[0.65rem] text-white/30 px-0.5">
                    <span>0% (No Overlay)</span>
                    <span>40% (Default)</span>
                    <span>90% (Maximum Dark)</span>
                  </div>
                </div>

                {/* 4. Color Saturation */}
                <div className="flex flex-col gap-2 pt-4 border-t border-white/5">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-medium text-white flex items-center gap-2">
                      <Drop size={16} className="text-blue-400" />
                      <span>Color Saturation</span>
                    </label>
                    <span className={`text-xs font-mono font-bold px-2 py-0.5 rounded ${
                      settings.saturation === 100 ? 'bg-white/5 text-white/60' : 'bg-[#c79c6e]/20 text-[#c79c6e]'
                    }`}>
                      {settings.saturation}%
                    </span>
                  </div>
                  <input
                    type="range"
                    min="50"
                    max="150"
                    step="1"
                    value={settings.saturation}
                    onChange={(e) => setSettings(prev => ({ ...prev, saturation: Number(e.target.value) }))}
                    className="w-full accent-[#c79c6e] cursor-pointer h-1.5 bg-white/10 rounded-lg"
                  />
                  <div className="flex justify-between text-[0.65rem] text-white/30 px-0.5">
                    <span>50% (Muted)</span>
                    <span>100% (Original)</span>
                    <span>150% (Vibrant)</span>
                  </div>
                </div>

              </div>

              {/* Live Preview Sample */}
              <div className="bg-[#121212] border border-white/5 rounded-xl p-4 flex flex-col gap-2.5">
                <span className="text-[0.68rem] font-semibold uppercase tracking-widest text-white/50 flex items-center gap-1.5">
                  <Eye size={14} className="text-[#c79c6e]" />
                  <span>Simulated Visual Preview</span>
                </span>
                <div className="relative h-24 rounded-lg overflow-hidden border border-white/10">
                  <img
                    src={heroPreviewImg}
                    alt="Preview"
                    className="w-full h-full object-cover"
                    style={{
                      filter: `contrast(${settings.contrast}%) brightness(${settings.brightness}%) saturate(${settings.saturation}%)`
                    }}
                  />
                  <div 
                    className="absolute inset-0 bg-black transition-opacity"
                    style={{ opacity: settings.overlayDarkness / 100 }}
                  />
                  <div className="absolute inset-0 flex items-center justify-center p-3">
                    <span className="font-serif text-white text-sm tracking-wide drop-shadow-md">
                      Aarkesh Gupta • Life Coach
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 border-t border-white/5 bg-[#080808] flex items-center justify-between font-sans">
          <button
            type="button"
            onClick={handleReset}
            className="flex items-center gap-1.5 text-xs text-white/50 hover:text-white px-3 py-2 rounded-lg hover:bg-white/5 transition-colors"
          >
            <ArrowCounterClockwise size={14} />
            <span>Reset Defaults</span>
          </button>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs text-white/70 hover:text-white rounded-lg border border-white/10 hover:border-white/20 transition-all"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSave}
              disabled={saving}
              className="flex items-center gap-2 px-5 py-2.5 bg-[#c79c6e] hover:bg-[#b0885e] text-black font-semibold text-xs rounded-xl uppercase tracking-wider transition-all disabled:opacity-50 shadow-lg shadow-[#c79c6e]/20"
            >
              <FloppyDisk size={16} weight="bold" />
              <span>{saving ? 'Saving...' : 'Save & Apply All Pages'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

