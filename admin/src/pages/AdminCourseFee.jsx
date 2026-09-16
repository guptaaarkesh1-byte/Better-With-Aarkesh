import React, { useState, useEffect } from 'react';
import { 
  CurrencyInr, 
  Percent, 
  CheckCircle, 
  CircleNotch, 
  Sparkle, 
  ArrowClockwise,
  Info,
  Tag,
  ShieldCheck,
  Receipt,
  Pen,
  FileText,
  BookOpen,
  Gift,
  Broadcast,
  Clock,
  WarningCircle
} from '@phosphor-icons/react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const GST_PRESETS = [0, 5, 12, 18, 28];

export default function AdminCourseFee() {
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [notification, setNotification] = useState(null);

  // Form State
  const [courseTitle, setCourseTitle] = useState('The Better Man™');
  const [courseSubtitle, setCourseSubtitle] = useState('');
  const [isComingSoon, setIsComingSoon] = useState(false);
  const [comingSoonText, setComingSoonText] = useState('Coming Soon — Pre-Register for Early Access');
  const [invoiceItemTitle, setInvoiceItemTitle] = useState('The Better Man™ — Masterclass Lifetime Access');
  const [invoiceItemSubtitle, setInvoiceItemSubtitle] = useState('HD video frameworks, modular curriculum, worksheets & community');
  const [bonusItemTitle, setBonusItemTitle] = useState('3 Private 1-on-1 Executive Coaching Sessions with Aarkesh');
  const [bonusItemSubtitle, setBonusItemSubtitle] = useState('Valued at ₹15,000 — 100% Complimentary student bonus');
  const [price, setPrice] = useState(15000);
  const [comparePrice, setComparePrice] = useState(25000);
  const [gstRate, setGstRate] = useState(18);
  const [isGstIncluded, setIsGstIncluded] = useState(false);

  const showNotification = (msg, type = 'success') => {
    setNotification({ msg, type });
    setTimeout(() => setNotification(null), 4000);
  };

  // Fetch Course details to get current pricing and invoice naming
  const fetchCoursePricing = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('adminToken');
      const res = await fetch(`${API_URL}/api/admin/courses`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const courses = await res.json();
        const primaryCourse = courses[0];
        if (primaryCourse) {
          setCourse(primaryCourse);
          setCourseTitle(primaryCourse.title || 'The Better Man™');
          setCourseSubtitle(primaryCourse.subtitle || '');
          setIsComingSoon(Boolean(primaryCourse.isComingSoon));
          setComingSoonText(primaryCourse.comingSoonText || 'Coming Soon — Pre-Register for Early Access');
          setInvoiceItemTitle(
            primaryCourse.invoiceItemTitle || 
            (primaryCourse.title ? `${primaryCourse.title} — Masterclass Lifetime Access` : 'The Better Man™ — Masterclass Lifetime Access')
          );
          setInvoiceItemSubtitle(
            primaryCourse.invoiceItemSubtitle || 
            'HD video frameworks, modular curriculum, worksheets & community'
          );
          setBonusItemTitle(
            primaryCourse.bonusItemTitle || 
            '3 Private 1-on-1 Executive Coaching Sessions with Aarkesh'
          );
          setBonusItemSubtitle(
            primaryCourse.bonusItemSubtitle || 
            'Valued at ₹15,000 — 100% Complimentary student bonus'
          );
          setPrice(primaryCourse.price ?? 15000);
          setComparePrice(primaryCourse.comparePrice ?? 25000);
          setGstRate(primaryCourse.gstRate !== undefined ? primaryCourse.gstRate : 18);
          setIsGstIncluded(!!primaryCourse.isGstIncluded);
        }
      }
    } catch (err) {
      console.error('Error fetching course pricing:', err);
      showNotification('Failed to load course settings', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCoursePricing();
  }, []);

  // Save Settings
  const handleSavePricing = async (e) => {
    if (e) e.preventDefault();
    if (!course?._id) return;

    setSaving(true);
    try {
      const token = localStorage.getItem('adminToken');
      const res = await fetch(`${API_URL}/api/admin/courses/${course._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          title: courseTitle.trim() || 'The Better Man™',
          subtitle: courseSubtitle.trim(),
          isComingSoon: Boolean(isComingSoon),
          comingSoonText: comingSoonText.trim() || 'Coming Soon — Pre-Register for Early Access',
          invoiceItemTitle: invoiceItemTitle.trim() || `${courseTitle.trim()} — Masterclass Lifetime Access`,
          invoiceItemSubtitle: invoiceItemSubtitle.trim(),
          bonusItemTitle: bonusItemTitle.trim(),
          bonusItemSubtitle: bonusItemSubtitle.trim(),
          price: Number(price) || 0,
          comparePrice: comparePrice ? Number(comparePrice) : null,
          gstRate: Number(gstRate) || 0,
          isGstIncluded: Boolean(isGstIncluded),
        })
      });

      const updated = await res.json();
      if (res.ok) {
        setCourse(updated);
        showNotification('Course settings, status & pricing saved successfully!');
      } else {
        showNotification(updated.message || 'Failed to update settings', 'error');
      }
    } catch (err) {
      console.error('Error saving settings:', err);
      showNotification('Network error while saving settings', 'error');
    } finally {
      setSaving(false);
    }
  };

  // Instant toggle for Live vs Coming Soon mode
  const handleToggleLaunchStatus = async (statusBoolean) => {
    setIsComingSoon(statusBoolean);
    if (!course?._id) return;

    try {
      const token = localStorage.getItem('adminToken');
      const res = await fetch(`${API_URL}/api/admin/courses/${course._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          isComingSoon: Boolean(statusBoolean),
          comingSoonText: comingSoonText.trim() || 'Coming Soon — Pre-Register for Early Access'
        })
      });

      const updated = await res.json();
      if (res.ok) {
        setCourse(updated);
        showNotification(
          statusBoolean
            ? '🟡 Switched to Coming Soon Mode! Landing page is now in pre-launch mode.'
            : '🟢 Switched to LIVE Mode! Full course landing page and enrollment are now active.'
        );
      }
    } catch (err) {
      console.error('Error toggling launch status:', err);
    }
  };

  // Calculations for Live Preview
  const numPrice = Math.max(0, Number(price) || 0);
  const numComparePrice = Math.max(0, Number(comparePrice) || 0);
  const numGstRate = Math.max(0, Math.min(100, Number(gstRate) || 0));

  const gstAmount = isGstIncluded
    ? Math.round(numPrice - (numPrice / (1 + numGstRate / 100)))
    : Math.round((numPrice * numGstRate) / 100);

  const baseBeforeGst = isGstIncluded ? numPrice - gstAmount : numPrice;
  const finalPayable = isGstIncluded ? numPrice : numPrice + gstAmount;

  const discountAmount = numComparePrice > numPrice ? numComparePrice - numPrice : 0;
  const discountPercentage = numComparePrice > numPrice 
    ? Math.round((discountAmount / numComparePrice) * 100) 
    : 0;

  return (
    <div className="w-full max-w-6xl mx-auto px-6 py-8">
      {/* Toast Notification */}
      {notification && (
        <div className={`fixed top-6 right-6 z-50 px-5 py-3 rounded-xl text-xs font-semibold uppercase tracking-wider flex items-center gap-2 shadow-2xl transition-all duration-300 animate-in fade-in slide-in-from-top-4 ${
          notification.type === 'error' 
            ? 'bg-rose-500 text-white shadow-rose-500/20' 
            : 'bg-[#c79c6e] text-black shadow-[#c79c6e]/20'
        }`}>
          <CheckCircle size={16} weight="bold" />
          <span>{notification.msg}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8 pb-6 border-b border-white/10">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="text-[0.65rem] uppercase tracking-[0.25em] text-[#c79c6e] font-semibold flex items-center gap-1.5">
              <Receipt size={14} weight="bold" />
              COURSE IDENTITY, PRICING &amp; BILL CUSTOMIZATION
            </span>
          </div>
          <h2 className="font-serif text-2xl md:text-3xl text-white">Course Name, Fee &amp; Tax Bill Settings</h2>
          <p className="font-sans text-xs text-white/50 mt-1 max-w-xl">
            Edit the course title, invoice heading, line item descriptions, base fee, and active GST % rate charged on student bills.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={fetchCoursePricing}
            disabled={loading || saving}
            className="p-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white/70 hover:text-white transition-colors disabled:opacity-50 cursor-pointer"
            title="Refresh settings"
          >
            <ArrowClockwise size={16} className={loading ? 'animate-spin' : ''} />
          </button>

          <button
            type="button"
            onClick={handleSavePricing}
            disabled={loading || saving}
            className="px-6 py-3 rounded-xl bg-[#c79c6e] hover:bg-[#b0885e] text-black font-semibold text-xs uppercase tracking-wider flex items-center gap-2 transition-all shadow-[0_0_20px_rgba(199,156,110,0.2)] disabled:opacity-50 hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
          >
            {saving ? (
              <>
                <CircleNotch size={16} className="animate-spin" />
                <span>Saving...</span>
              </>
            ) : (
              <>
                <CheckCircle size={16} weight="bold" />
                <span>Save All Changes</span>
              </>
            )}
          </button>
        </div>
      </div>

      {loading ? (
        <div className="py-24 text-center text-white/40 flex flex-col items-center justify-center gap-3">
          <CircleNotch size={32} className="animate-spin text-[#c79c6e]" />
          <span className="text-xs font-mono">Loading course configurations...</span>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Column: Form Controls */}
          <div className="lg:col-span-7 space-y-6">
            {/* ── 0. Launch Status & Coming Soon Toggle Card ── */}
            <div className={`bg-[#0a0a0a] border rounded-2xl p-6 shadow-xl space-y-5 relative overflow-hidden transition-all duration-300 ${
              isComingSoon 
                ? 'border-amber-500/50 shadow-amber-500/5' 
                : 'border-emerald-500/40 shadow-emerald-500/5'
            }`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className={`w-8 h-8 rounded-xl flex items-center justify-center border ${
                    isComingSoon 
                      ? 'bg-amber-500/15 border-amber-500/30 text-amber-400' 
                      : 'bg-emerald-500/15 border-emerald-500/30 text-emerald-400'
                  }`}>
                    {isComingSoon ? <Clock size={18} weight="bold" /> : <Broadcast size={18} weight="bold" />}
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold uppercase tracking-wider text-white">
                      Course Page Launch Status
                    </h3>
                    <p className="text-[11px] text-white/40">
                      Switch between Live Enrollment and Coming Soon Pre-Registration mode
                    </p>
                  </div>
                </div>

                <span className={`px-3 py-1 rounded-full border text-[11px] font-mono font-bold uppercase tracking-wider flex items-center gap-1.5 ${
                  isComingSoon
                    ? 'bg-amber-500/15 border-amber-500/40 text-amber-400'
                    : 'bg-emerald-500/15 border-emerald-500/40 text-emerald-400'
                }`}>
                  <span className={`w-2 h-2 rounded-full ${isComingSoon ? 'bg-amber-400 animate-pulse' : 'bg-emerald-400'}`} />
                  {isComingSoon ? 'COMING SOON MODE' : 'LIVE MODE'}
                </span>
              </div>

              {/* Toggle Switch Selector */}
              <div className="grid grid-cols-2 gap-3 p-1.5 bg-black/60 rounded-xl border border-white/10">
                <button
                  type="button"
                  onClick={() => handleToggleLaunchStatus(false)}
                  className={`py-3 px-4 rounded-lg text-xs font-semibold uppercase tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer ${
                    !isComingSoon
                      ? 'bg-emerald-500 text-black font-bold shadow-lg shadow-emerald-500/20 scale-[1.01]'
                      : 'text-white/60 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <Broadcast size={16} weight={!isComingSoon ? 'bold' : 'regular'} />
                  <span>🟢 Live Enrollment</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleToggleLaunchStatus(true)}
                  className={`py-3 px-4 rounded-lg text-xs font-semibold uppercase tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer ${
                    isComingSoon
                      ? 'bg-amber-400 text-black font-bold shadow-lg shadow-amber-500/20 scale-[1.01]'
                      : 'text-white/60 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <Clock size={16} weight={isComingSoon ? 'bold' : 'regular'} />
                  <span>🟡 Coming Soon</span>
                </button>
              </div>

              {/* Status Details / Explanations */}
              {isComingSoon ? (
                <div className="space-y-4 pt-3 border-t border-white/10">
                  <div>
                    <label className="block text-xs uppercase tracking-widest text-amber-400/90 mb-2 font-semibold flex items-center gap-1.5">
                      <Sparkle size={13} weight="fill" />
                      Coming Soon Banner Text *
                    </label>
                    <input
                      type="text"
                      required
                      value={comingSoonText}
                      onChange={(e) => setComingSoonText(e.target.value)}
                      placeholder="e.g. Coming Soon — Pre-Register for Early Access"
                      className="w-full bg-black/60 border border-amber-500/30 focus:border-amber-400 rounded-xl px-4 py-3 text-white text-sm focus:outline-none transition-colors"
                    />
                    <span className="text-[11px] text-white/40 block mt-1.5">
                      This banner will be prominently displayed at the top of the course landing page.
                    </span>
                  </div>

                  <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-300/90 text-xs space-y-1">
                    <p className="font-semibold flex items-center gap-1.5 text-amber-400">
                      <Info size={14} weight="bold" />
                      What visitors will see in Coming Soon mode:
                    </p>
                    <ul className="list-disc list-inside space-y-0.5 text-[11px] text-amber-200/80 pl-1">
                      <li>Prominent luxury Coming Soon banner in the hero section</li>
                      <li>Only the <strong>"Register Now"</strong> (Pre-Registration) button is displayed</li>
                      <li>No direct checkout/payment links; users pre-register for early priority access</li>
                    </ul>
                  </div>
                </div>
              ) : (
                <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300/90 text-xs space-y-1">
                  <p className="font-semibold flex items-center gap-1.5 text-emerald-400">
                    <CheckCircle size={14} weight="bold" />
                    Live Mode Active:
                  </p>
                  <p className="text-[11px] text-emerald-200/80">
                    Course landing page is live with full enrollment. Registered users can click "Enroll Now", view the course breakdown, and complete secure checkout.
                  </p>
                </div>
              )}
            </div>

            {/* ── 1. Course Name & Heading Settings Card ── */}
            <div className="bg-[#0a0a0a] border border-[#c79c6e]/30 rounded-2xl p-6 shadow-xl space-y-5 relative overflow-hidden">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold uppercase tracking-wider text-white flex items-center gap-2">
                  <Pen size={17} className="text-[#c79c6e]" />
                  Course Name &amp; Bill Headings
                </h3>
                <span className="px-2.5 py-0.5 rounded-full bg-[#c79c6e]/15 border border-[#c79c6e]/30 text-[#c79c6e] text-[10px] font-bold uppercase tracking-wider">
                  Editable
                </span>
              </div>

              {/* Main Course Name */}
              <div>
                <label className="block text-xs uppercase tracking-widest text-white/60 mb-2 font-semibold">
                  Course Name / Title *
                </label>
                <input
                  type="text"
                  required
                  value={courseTitle}
                  onChange={(e) => setCourseTitle(e.target.value)}
                  placeholder="e.g. The Better Man™"
                  className="w-full bg-black/60 border border-white/15 focus:border-[#c79c6e] rounded-xl px-4 py-3 text-white text-sm focus:outline-none transition-colors"
                />
                <span className="text-[11px] text-white/40 block mt-1">
                  Primary course name shown across the portal header and learning platform.
                </span>
              </div>

              {/* Course Subtitle / Tagline */}
              <div>
                <label className="block text-xs uppercase tracking-widest text-white/60 mb-2">
                  Course Subtitle / Tagline
                </label>
                <input
                  type="text"
                  value={courseSubtitle}
                  onChange={(e) => setCourseSubtitle(e.target.value)}
                  placeholder="e.g. The Better Man™ Course Hub"
                  className="w-full bg-black/60 border border-white/15 focus:border-[#c79c6e] rounded-xl px-4 py-3 text-white text-sm focus:outline-none transition-colors"
                />
              </div>

              <div className="pt-4 border-t border-white/[0.08] space-y-4">
                <span className="text-[11px] uppercase tracking-[0.2em] text-[#c79c6e] font-semibold block flex items-center gap-1.5">
                  <Receipt size={14} />
                  Tax Invoice &amp; Bill Item Customization
                </span>

                {/* Bill Line Item Title */}
                <div>
                  <label className="block text-xs uppercase tracking-widest text-white/60 mb-1.5 font-medium">
                    Invoice Course Heading (Line Item 1) *
                  </label>
                  <input
                    type="text"
                    required
                    value={invoiceItemTitle}
                    onChange={(e) => setInvoiceItemTitle(e.target.value)}
                    placeholder="e.g. The Better Man™ — Masterclass Lifetime Access"
                    className="w-full bg-black/60 border border-white/15 focus:border-[#c79c6e] rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none transition-colors font-medium"
                  />
                  <span className="text-[11px] text-white/40 block mt-1">
                    The primary title printed on the student's official tax bill receipt.
                  </span>
                </div>

                {/* Bill Line Item Subtitle */}
                <div>
                  <label className="block text-xs uppercase tracking-widest text-white/60 mb-1.5 font-medium">
                    Invoice Course Subtitle / Description *
                  </label>
                  <input
                    type="text"
                    required
                    value={invoiceItemSubtitle}
                    onChange={(e) => setInvoiceItemSubtitle(e.target.value)}
                    placeholder="e.g. HD video frameworks, modular curriculum, worksheets & community"
                    className="w-full bg-black/60 border border-white/15 focus:border-[#c79c6e] rounded-xl px-4 py-2.5 text-white/90 text-xs focus:outline-none transition-colors"
                  />
                  <span className="text-[11px] text-white/40 block mt-1">
                    Features subline printed beneath the course title on the invoice.
                  </span>
                </div>

                {/* Bonus Line Item Title */}
                <div className="pt-2">
                  <label className="block text-xs uppercase tracking-widest text-emerald-400/90 mb-1.5 font-medium flex items-center gap-1.5">
                    <Sparkle size={13} weight="fill" />
                    Complimentary VIP Bonus Heading (Line Item 3)
                  </label>
                  <input
                    type="text"
                    value={bonusItemTitle}
                    onChange={(e) => setBonusItemTitle(e.target.value)}
                    placeholder="e.g. 3 Private 1-on-1 Executive Coaching Sessions with Aarkesh"
                    className="w-full bg-black/60 border border-emerald-500/20 focus:border-emerald-400 rounded-xl px-4 py-2.5 text-white text-xs focus:outline-none transition-colors"
                  />
                </div>

                {/* Bonus Line Item Subtitle */}
                <div>
                  <label className="block text-xs uppercase tracking-widest text-white/50 mb-1.5 font-medium">
                    Complimentary VIP Bonus Subtitle / Valuation
                  </label>
                  <input
                    type="text"
                    value={bonusItemSubtitle}
                    onChange={(e) => setBonusItemSubtitle(e.target.value)}
                    placeholder="e.g. Valued at ₹15,000 — 100% Complimentary student bonus"
                    className="w-full bg-black/60 border border-white/15 focus:border-emerald-400 rounded-xl px-4 py-2.5 text-white/80 text-xs focus:outline-none transition-colors"
                  />
                </div>
              </div>
            </div>

            {/* ── 2. Base Fee & Original Price Card ── */}
            <div className="bg-[#0a0a0a] border border-white/10 rounded-2xl p-6 shadow-xl space-y-6">
              <h3 className="text-sm font-semibold uppercase tracking-wider text-white flex items-center gap-2">
                <CurrencyInr size={18} className="text-[#c79c6e]" />
                Course Base Enrollment Fee
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Base Fee */}
                <div>
                  <label className="block text-xs uppercase tracking-widest text-white/50 mb-2 font-semibold">
                    Course Selling Price (₹) *
                  </label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40 font-mono text-sm">₹</span>
                    <input
                      type="number"
                      min="0"
                      step="1"
                      required
                      value={price}
                      onChange={(e) => setPrice(e.target.value)}
                      placeholder="15000"
                      className="w-full bg-black/60 border border-white/15 rounded-xl pl-9 pr-4 py-3 text-white text-base font-mono focus:outline-none focus:border-[#c79c6e]"
                    />
                  </div>
                  <span className="text-[11px] text-white/40 block mt-1.5">
                    Base course fee before tax
                  </span>
                </div>

                {/* Compare Price */}
                <div>
                  <label className="block text-xs uppercase tracking-widest text-white/50 mb-2">
                    Original Price / MRP (₹)
                  </label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40 font-mono text-sm">₹</span>
                    <input
                      type="number"
                      min="0"
                      step="1"
                      value={comparePrice}
                      onChange={(e) => setComparePrice(e.target.value)}
                      placeholder="25000"
                      className="w-full bg-black/60 border border-white/15 rounded-xl pl-9 pr-4 py-3 text-white/80 text-base font-mono focus:outline-none focus:border-[#c79c6e]"
                    />
                  </div>
                  <span className="text-[11px] text-white/40 block mt-1.5">
                    Shown as strikethrough discount
                  </span>
                </div>
              </div>
            </div>

            {/* ── 3. GST Rate Controller Card ── */}
            <div className="bg-[#0a0a0a] border border-white/10 rounded-2xl p-6 shadow-xl space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold uppercase tracking-wider text-white flex items-center gap-2">
                  <Percent size={18} className="text-[#c79c6e]" />
                  GST % Rate Control
                </h3>
                <span className="px-2.5 py-0.5 rounded-full bg-[#c79c6e]/20 border border-[#c79c6e]/40 text-[#c79c6e] text-xs font-mono font-bold">
                  {numGstRate}% ACTIVE
                </span>
              </div>

              {/* GST Preset Buttons */}
              <div>
                <label className="block text-xs uppercase tracking-widest text-white/50 mb-3">
                  Quick GST Rate Presets
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
                  {GST_PRESETS.map((preset) => {
                    const isSelected = numGstRate === preset;
                    return (
                      <button
                        key={preset}
                        type="button"
                        onClick={() => setGstRate(preset)}
                        className={`py-2.5 px-3 rounded-xl text-xs font-mono font-semibold transition-all cursor-pointer border ${
                          isSelected
                            ? 'bg-[#c79c6e] text-black border-[#c79c6e] shadow-lg shadow-[#c79c6e]/20 scale-[1.02]'
                            : 'bg-black/50 border-white/10 text-white/70 hover:text-white hover:border-white/25 hover:bg-white/5'
                        }`}
                      >
                        {preset === 0 ? '0% (None)' : `${preset}% GST`}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Custom GST Input */}
              <div className="pt-4 border-t border-white/[0.08]">
                <label className="block text-xs uppercase tracking-widest text-white/50 mb-2">
                  Custom GST Percentage (%)
                </label>
                <div className="relative max-w-xs">
                  <input
                    type="number"
                    min="0"
                    max="100"
                    step="0.1"
                    value={gstRate}
                    onChange={(e) => setGstRate(e.target.value)}
                    placeholder="18"
                    className="w-full bg-black/60 border border-white/15 rounded-xl px-4 py-2.5 text-white font-mono text-sm focus:outline-none focus:border-[#c79c6e]"
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-white/40 font-mono text-sm">%</span>
                </div>
              </div>

              {/* GST Inclusion Mode Toggle */}
              <div className="pt-4 border-t border-white/[0.08]">
                <label className="flex items-start gap-3 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={isGstIncluded}
                    onChange={(e) => setIsGstIncluded(e.target.checked)}
                    className="mt-1 w-4 h-4 accent-[#c79c6e] rounded cursor-pointer"
                  />
                  <div>
                    <span className="block text-xs font-semibold text-white">
                      Inclusive Pricing (GST is already included in Course Price)
                    </span>
                    <span className="block text-[11px] text-white/40 mt-0.5">
                      {isGstIncluded
                        ? 'Students pay exactly ₹' + numPrice.toLocaleString('en-IN') + ' with GST embedded inside.'
                        : 'GST will be added on top of the base fee at checkout (+₹' + gstAmount.toLocaleString('en-IN') + ').'}
                    </span>
                  </div>
                </label>
              </div>
            </div>
          </div>

          {/* Right Column: Live Bill Table & Breakdown Simulator */}
          <div className="lg:col-span-5 space-y-6">
            {/* ── Live Bill Invoice Item Preview ── */}
            <div className="bg-[#0a0a0a] border border-[#c79c6e]/40 rounded-2xl p-6 shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-[#c79c6e]/10 blur-3xl pointer-events-none" />

              <div className="flex items-center justify-between mb-4 pb-3 border-b border-white/10">
                <span className="text-[10px] uppercase tracking-[0.2em] text-[#c79c6e] font-semibold flex items-center gap-1.5">
                  <Receipt size={13} weight="bold" />
                  LIVE TAX BILL PREVIEW
                </span>
                <span className="px-2 py-0.5 rounded bg-emerald-500/15 text-emerald-400 text-[10px] font-bold uppercase font-mono">
                  STUDENT RECEIPT
                </span>
              </div>

              {/* Sample Tax Invoice Table */}
              <div className="space-y-4">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-white/10 text-[10px] uppercase tracking-widest text-white/40 font-semibold">
                      <th className="pb-2.5">Description</th>
                      <th className="pb-2.5 text-center">Qty</th>
                      <th className="pb-2.5 text-right">Amount</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5 font-sans">
                    {/* Item 1: Main Course */}
                    <tr>
                      <td className="py-2.5 pr-2">
                        <strong className="text-white block text-[13px] leading-tight font-sans">
                          {invoiceItemTitle || `${courseTitle} — Masterclass Lifetime Access`}
                        </strong>
                        <span className="text-[11px] text-white/50 block mt-0.5">
                          {invoiceItemSubtitle || 'HD video frameworks, modular curriculum, worksheets & community'}
                        </span>
                      </td>
                      <td className="py-2.5 text-center text-white/70 font-mono text-[11px]">1</td>
                      <td className="py-2.5 text-right font-mono text-white text-[12px]">
                        ₹{baseBeforeGst.toLocaleString('en-IN')}
                      </td>
                    </tr>

                    {/* Item 2: GST */}
                    <tr>
                      <td className="py-2 pr-2">
                        <span className="text-white/80 text-xs">
                          Goods &amp; Services Tax (GST @ {numGstRate}%)
                        </span>
                        {isGstIncluded && (
                          <span className="text-[10px] text-white/40 ml-1">(Inclusive)</span>
                        )}
                      </td>
                      <td className="py-2 text-center text-white/40 font-mono text-[11px]">-</td>
                      <td className="py-2 text-right font-mono text-white/90 text-[12px]">
                        ₹{gstAmount.toLocaleString('en-IN')}
                      </td>
                    </tr>

                    {/* Item 3: Bonus Coaching */}
                    {bonusItemTitle && (
                      <tr>
                        <td className="py-2 pr-2">
                          <span className="text-emerald-400 font-semibold text-xs flex items-center gap-1">
                            <Sparkle size={12} weight="fill" />
                            {bonusItemTitle}
                          </span>
                          <span className="text-[10px] text-white/40 block mt-0.5">
                            {bonusItemSubtitle}
                          </span>
                        </td>
                        <td className="py-2 text-center text-emerald-400 font-mono text-[11px]">3</td>
                        <td className="py-2 text-right font-mono font-bold text-emerald-400 text-xs">
                          FREE (₹0)
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>

                {/* Subtotal & Total Strip */}
                <div className="pt-3 border-t border-white/10 space-y-2 text-xs font-mono">
                  <div className="flex justify-between text-white/60">
                    <span>Subtotal:</span>
                    <span>₹{baseBeforeGst.toLocaleString('en-IN')}</span>
                  </div>
                  <div className="flex justify-between text-white/60">
                    <span>Tax (GST {numGstRate}%):</span>
                    <span>₹{gstAmount.toLocaleString('en-IN')}</span>
                  </div>
                  <div className="pt-2 border-t border-white/15 flex justify-between text-white font-bold text-sm">
                    <span>Grand Total:</span>
                    <span className="text-[#c79c6e]">₹{finalPayable.toLocaleString('en-IN')}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* ── Summary & Compliance Card ── */}
            <div className="bg-[#0a0a0a] border border-white/10 rounded-2xl p-5 text-xs space-y-3">
              <div className="flex items-center gap-2 text-[#c79c6e] font-semibold">
                <Info size={16} />
                <span>How Bill Headings &amp; Pricing Operate</span>
              </div>
              <ul className="space-y-2 text-white/60 leading-relaxed pl-4 list-disc">
                <li>
                  Changing the <strong className="text-white">Course Name</strong> or <strong className="text-white">Invoice Course Heading</strong> immediately updates all future student bills, invoices on checkout success, and student profile receipt downloads.
                </li>
                <li>
                  The <strong className="text-white">Complimentary VIP Bonus</strong> heading is itemized automatically with a ₹0 amount and highlighted in emerald green.
                </li>
                <li>
                  All Razorpay orders dynamically recalculate the exact base price and GST percentage.
                </li>
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
