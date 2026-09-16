import React, { useState } from 'react';
import { 
  CheckCircle, 
  XCircle, 
  WarningCircle, 
  ShieldCheck, 
  Printer, 
  Copy, 
  Check, 
  Sparkle, 
  PlayCircle, 
  CalendarCheck, 
  Receipt, 
  ArrowRight,
  ArrowCounterClockwise,
  ArrowLeft,
  Question,
  DownloadSimple
} from '@phosphor-icons/react';

export default function CoursePaymentSuccess({ 
  purchaseData, 
  onStartLearning, 
  onBookSession,
  onRetryPayment,
  onBackToCourse
}) {
  const [copiedTxn, setCopiedTxn] = useState(false);

  const isFailed = purchaseData?.status === 'Failed';
  const failureReason = purchaseData?.failureReason || purchaseData?.errorDescription || 'Payment was declined or cancelled at the gateway.';
  const errorCode = purchaseData?.errorCode || 'TRANSACTION_INCOMPLETE';

  // Fallback defaults if props are sparse
  const txnId = purchaseData?.transactionId || (isFailed ? `failed_${Math.random().toString(36).substr(2, 9)}` : `pay_${Math.random().toString(36).substr(2, 9)}`);
  const orderId = purchaseData?.orderId || `order_${Math.random().toString(36).substr(2, 9)}`;
  const studentName = purchaseData?.studentName || 'Valued Student';
  const studentEmail = purchaseData?.studentEmail || '';
  const courseTitle = purchaseData?.courseTitle || 'The Better Man™';
  const invoiceHeading = purchaseData?.invoiceItemTitle || (purchaseData?.courseTitle ? `${purchaseData.courseTitle} — Masterclass Lifetime Access` : 'The Better Man™ — Masterclass Lifetime Access');
  const invoiceSubtitle = purchaseData?.invoiceItemSubtitle || 'HD video frameworks, modular curriculum, worksheets & community';
  const bonusHeading = purchaseData?.bonusItemTitle || '3 Private 1-on-1 Executive Coaching Sessions with Aarkesh';
  const bonusSubtitle = purchaseData?.bonusItemSubtitle || 'Valued at ₹15,000 — 100% Complimentary student bonus';
  
  const finalAmount = purchaseData?.finalAmount || purchaseData?.amount || 11800;
  const basePrice = purchaseData?.basePrice || 10000;
  const gstRate = purchaseData?.gstRate !== undefined ? purchaseData.gstRate : 18;
  const gstAmount = purchaseData?.gstAmount !== undefined ? purchaseData.gstAmount : 1800;
  const isGstIncluded = Boolean(purchaseData?.isGstIncluded);

  const purchaseDate = purchaseData?.purchaseDate 
    ? new Date(purchaseData.purchaseDate) 
    : new Date();

  const formattedDate = purchaseDate.toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  const invoiceNumber = `INV-${purchaseDate.getFullYear()}${String(purchaseDate.getMonth() + 1).padStart(2, '0')}-${txnId.slice(-6).toUpperCase()}`;

  const handleCopyTxn = () => {
    navigator.clipboard.writeText(txnId);
    setCopiedTxn(true);
    setTimeout(() => setCopiedTxn(false), 2500);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="w-full min-h-screen bg-[#050505] text-white py-10 px-4 sm:px-6 relative overflow-hidden flex flex-col items-center">
      {/* Background Ambient Glows */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden print:hidden">
        {isFailed ? (
          <>
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[350px] bg-rose-500/10 rounded-full blur-[160px]" />
            <div className="absolute bottom-0 right-10 w-[500px] h-[500px] bg-amber-500/5 rounded-full blur-[180px]" />
          </>
        ) : (
          <>
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[350px] bg-[#c79c6e]/10 rounded-full blur-[160px]" />
            <div className="absolute bottom-0 right-10 w-[500px] h-[500px] bg-emerald-500/5 rounded-full blur-[180px]" />
          </>
        )}
      </div>

      <div className="w-full max-w-3xl relative z-10 space-y-6">
        {/* ── TOP HERO CONFIRMATION / FAILURE ── */}
        <div className="text-center space-y-3 print:hidden">
          {isFailed ? (
            <>
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-rose-500/15 border border-rose-500/30 text-rose-400 text-xs font-semibold uppercase tracking-widest animate-in fade-in zoom-in duration-500">
                <XCircle size={16} weight="fill" />
                <span>PAYMENT TRANSACTION FAILED</span>
              </div>

              <h1 className="font-serif text-3xl sm:text-4xl text-white font-normal tracking-tight">
                Enrollment <span className="text-rose-400 italic">Incomplete</span>
              </h1>
              <p className="font-sans text-xs sm:text-sm text-white/60 max-w-md mx-auto">
                We were unable to complete your payment for <strong className="text-white">{courseTitle}</strong>. Your account was not charged.
              </p>
            </>
          ) : (
            <>
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-xs font-semibold uppercase tracking-widest animate-in fade-in zoom-in duration-500">
                <CheckCircle size={15} weight="fill" />
                <span>PAYMENT SUCCESSFUL · ENROLLMENT ACTIVE</span>
              </div>

              <h1 className="font-serif text-3xl sm:text-4xl text-white font-normal tracking-tight">
                Welcome to <span className="text-[#c79c6e] italic">{courseTitle}</span>
              </h1>
              <p className="font-sans text-xs sm:text-sm text-white/60 max-w-md mx-auto">
                Congratulations <strong className="text-white">{studentName}</strong>! Your masterclass access is unlocked and your 3 private coaching calls are credited.
              </p>
            </>
          )}
        </div>

        {/* ── ACTION CTA BAR (PRINT / RETRY / START) ── */}
        <div className="flex flex-wrap items-center justify-between gap-3 bg-white/[0.03] border border-white/10 rounded-2xl p-4 backdrop-blur-xl print:hidden">
          <div className="flex items-center gap-2 text-xs text-white/70">
            {isFailed ? (
              <>
                <WarningCircle size={18} className="text-rose-400" weight="fill" />
                <span>Failed Transaction Audit Bill</span>
              </>
            ) : (
              <>
                <ShieldCheck size={18} className="text-[#c79c6e]" weight="fill" />
                <span>Official Invoice &amp; Tax Receipt</span>
              </>
            )}
          </div>

          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={handlePrint}
              className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/15 text-white/80 hover:text-white text-xs font-semibold flex items-center gap-2 transition-colors cursor-pointer"
            >
              <Printer size={15} />
              <span>Print / Save PDF</span>
            </button>

            {isFailed ? (
              <button
                type="button"
                onClick={onRetryPayment}
                className="px-5 py-2 rounded-xl bg-gradient-to-r from-[#c79c6e] to-[#b0885e] text-black text-xs font-bold uppercase tracking-wider flex items-center gap-2 transition-all hover:scale-[1.02] active:scale-[0.98] shadow-[0_0_20px_rgba(199,156,110,0.25)] cursor-pointer"
              >
                <ArrowCounterClockwise size={16} weight="bold" />
                <span>Retry Payment</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={onStartLearning}
                className="px-5 py-2 rounded-xl bg-gradient-to-r from-[#c79c6e] to-[#b0885e] text-black text-xs font-bold uppercase tracking-wider flex items-center gap-2 transition-all hover:scale-[1.02] active:scale-[0.98] shadow-[0_0_20px_rgba(199,156,110,0.25)] cursor-pointer"
              >
                <PlayCircle size={16} weight="fill" />
                <span>Start Learning Now</span>
              </button>
            )}
          </div>
        </div>

        {/* ── THE FORMAL TAX INVOICE & BILL CARD ── */}
        <div 
          id="invoice-receipt"
          className={`rounded-3xl border ${isFailed ? 'border-rose-500/30' : 'border-[#c79c6e]/30'} bg-[#0a0a0a]/95 backdrop-blur-2xl p-6 sm:p-10 shadow-[0_25px_60px_rgba(0,0,0,0.8),0_0_40px_rgba(199,156,110,0.08)] relative overflow-hidden print:bg-white print:text-black print:border-gray-300 print:shadow-none print:p-6`}
        >
          {/* Subtle Corner Accent */}
          <div className={`absolute top-0 right-0 w-36 h-36 ${isFailed ? 'bg-rose-500/10' : 'bg-[#c79c6e]/10'} blur-3xl pointer-events-none print:hidden`} />

          {/* Invoice Header */}
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-6 pb-6 border-b border-white/10 print:border-gray-300">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="font-serif text-xl sm:text-2xl text-white font-bold tracking-tight print:text-black">
                  Better With Aarkesh
                </span>
                <span className={`px-2 py-0.5 rounded ${isFailed ? 'bg-rose-500/20 text-rose-400' : 'bg-[#c79c6e]/20 text-[#c79c6e]'} text-[10px] font-mono font-bold tracking-wider print:border print:border-gray-400`}>
                  {isFailed ? 'FAILED ATTEMPT BILL' : 'OFFICIAL INVOICE'}
                </span>
              </div>
              <p className="font-sans text-xs text-white/50 print:text-gray-600">
                Executive Leadership, Communication &amp; Gravitas Coaching
              </p>
              <p className="font-sans text-[11px] text-white/40 print:text-gray-500 mt-0.5">
                support@aarkeshgupta.com · https://aarkeshgupta.com
              </p>
            </div>

            <div className="sm:text-right space-y-1 font-mono text-xs">
              {isFailed ? (
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded bg-rose-500/20 text-rose-400 font-bold uppercase text-[10px] tracking-widest border border-rose-500/30 print:text-rose-700 print:border-rose-600">
                  <XCircle size={12} weight="bold" />
                  <span>PAYMENT FAILED</span>
                </div>
              ) : (
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400 font-bold uppercase text-[10px] tracking-widest border border-emerald-500/30 print:text-emerald-700 print:border-emerald-600">
                  <CheckCircle size={12} weight="bold" />
                  <span>PAID IN FULL</span>
                </div>
              )}
              <div className="text-white/80 print:text-gray-800 pt-1">
                <span className="text-white/40 print:text-gray-500">Invoice: </span>
                <strong>{invoiceNumber}</strong>
              </div>
              <div className="text-white/60 print:text-gray-600 text-[11px]">
                {formattedDate}
              </div>
            </div>
          </div>

          {/* Failure Alert Banner inside the Bill if failed */}
          {isFailed && (
            <div className="my-6 p-4 rounded-2xl bg-rose-500/10 border border-rose-500/25 text-xs text-rose-200 space-y-1.5">
              <div className="flex items-center gap-2 font-semibold text-rose-400">
                <WarningCircle size={16} weight="fill" />
                <span>Gateway Failure Diagnostic Details</span>
              </div>
              <p className="text-white/80 pl-6 leading-relaxed">
                <strong>Error Reason:</strong> {failureReason}
              </p>
              <p className="text-white/50 pl-6 text-[11px] font-mono">
                Error Reference: {errorCode} · Order: {orderId}
              </p>
            </div>
          )}

          {/* Billed To & Payment Metadata */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 py-6 border-b border-white/10 print:border-gray-300 text-xs">
            {/* Student Info */}
            <div className="space-y-1">
              <span className="text-[10px] uppercase tracking-widest text-[#c79c6e] font-semibold block print:text-[#916b3f]">
                BILLED TO (STUDENT)
              </span>
              <p className="font-semibold text-white text-sm print:text-black">{studentName}</p>
              <p className="text-white/60 print:text-gray-600">{studentEmail || 'N/A'}</p>
              <p className="text-white/40 print:text-gray-500 text-[11px]">
                Enrollment Status: {isFailed ? (
                  <span className="text-rose-400 font-semibold print:text-rose-700">Pending / Unpaid</span>
                ) : (
                  <span className="text-emerald-400 font-semibold print:text-emerald-700">Lifetime Active</span>
                )}
              </p>
            </div>

            {/* Payment Info */}
            <div className="space-y-1 sm:text-right">
              <span className="text-[10px] uppercase tracking-widest text-[#c79c6e] font-semibold block print:text-[#916b3f]">
                PAYMENT TRANSACTION DETAILS
              </span>
              <div className="flex items-center sm:justify-end gap-1.5 font-mono text-white/90 print:text-black">
                <span>Attempt ID: {txnId}</span>
                <button
                  type="button"
                  onClick={handleCopyTxn}
                  className="p-1 text-white/50 hover:text-white transition-colors print:hidden"
                  title="Copy Transaction ID"
                >
                  {copiedTxn ? <Check size={13} className="text-emerald-400" /> : <Copy size={13} />}
                </button>
              </div>
              <p className="text-white/50 print:text-gray-600 font-mono text-[11px]">Order ID: {orderId}</p>
              <p className="text-white/40 print:text-gray-500 text-[11px]">Gateway: Razorpay 256-bit Secure</p>
            </div>
          </div>

          {/* Itemized Receipt Table */}
          <div className="py-6 border-b border-white/10 print:border-gray-300">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-white/10 print:border-gray-300 text-[10px] uppercase tracking-widest text-white/40 print:text-gray-500">
                  <th className="pb-3 font-semibold">Description</th>
                  <th className="pb-3 text-center font-semibold">Qty</th>
                  <th className="pb-3 text-right font-semibold">Amount (INR)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 print:divide-gray-200">
                {/* Main Course */}
                <tr>
                  <td className="py-3 pr-4">
                    <span className="font-semibold text-white block print:text-black">
                      {invoiceHeading}
                    </span>
                    <span className="text-[11px] text-white/50 print:text-gray-500 block">
                      {invoiceSubtitle}
                    </span>
                  </td>
                  <td className="py-3 text-center text-white/70 print:text-gray-700 font-mono">1</td>
                  <td className="py-3 text-right font-mono text-white print:text-black">
                    ₹{basePrice.toLocaleString('en-IN')}
                  </td>
                </tr>

                {/* GST */}
                <tr>
                  <td className="py-2.5 pr-4">
                    <span className="text-white/80 print:text-gray-800">
                      Goods &amp; Services Tax (GST @ {gstRate}%)
                    </span>
                    {isGstIncluded && (
                      <span className="text-[10px] text-white/40 print:text-gray-500 ml-1.5">(Inclusive)</span>
                    )}
                  </td>
                  <td className="py-2.5 text-center text-white/50 print:text-gray-500 font-mono">-</td>
                  <td className="py-2.5 text-right font-mono text-white/90 print:text-black">
                    ₹{gstAmount.toLocaleString('en-IN')}
                  </td>
                </tr>

                {/* VIP Bonus 3 Calls */}
                {bonusHeading && (
                  <tr>
                    <td className="py-2.5 pr-4">
                      <span className="text-emerald-400 font-semibold print:text-emerald-700 flex items-center gap-1.5">
                        <Sparkle size={13} weight="fill" />
                        {bonusHeading}
                      </span>
                      {bonusSubtitle && (
                        <span className="text-[11px] text-white/40 print:text-gray-500 block">
                          {bonusSubtitle}
                        </span>
                      )}
                    </td>
                    <td className="py-2.5 text-center text-emerald-400 print:text-emerald-700 font-mono">3</td>
                    <td className="py-2.5 text-right font-mono font-bold text-emerald-400 print:text-emerald-700">
                      FREE (₹0)
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Total Calculation Strip */}
          <div className="pt-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="text-xs text-white/50 print:text-gray-600 max-w-sm">
              {isFailed ? (
                <p className="text-amber-300/80">
                  Notice: No charges were incurred for this failed attempt. If any amount was debited, your bank will automatically reverse it within 3-5 working days.
                </p>
              ) : (
                <p>
                  This document serves as your official electronic tax invoice and proof of enrollment. Thank you for investing in your personal mastery.
                </p>
              )}
            </div>

            <div className="w-full sm:w-auto space-y-1.5 sm:text-right font-mono text-xs">
              <div className="flex justify-between sm:justify-end gap-6 text-white/70 print:text-gray-700">
                <span>Subtotal:</span>
                <span>₹{basePrice.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between sm:justify-end gap-6 text-white/70 print:text-gray-700">
                <span>GST ({gstRate}%):</span>
                <span>₹{gstAmount.toLocaleString('en-IN')}</span>
              </div>
              <div className="pt-2 border-t border-white/10 print:border-gray-300 flex justify-between sm:justify-end gap-6 text-base font-bold text-white print:text-black">
                <span>{isFailed ? 'Amount Due (Unpaid):' : 'Total Paid:'}</span>
                <span className={`${isFailed ? 'text-rose-400' : 'text-[#c79c6e]'} font-bold text-lg print:text-black`}>
                  ₹{finalAmount.toLocaleString('en-IN')}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* ── ACTION CARDS AT BOTTOM ── */}
        {isFailed ? (
          <div className="bg-[#0a0a0a] border border-rose-500/20 rounded-2xl p-6 sm:p-8 space-y-5 print:hidden">
            <div className="flex items-center gap-2 text-rose-400 font-semibold text-xs uppercase tracking-wider">
              <WarningCircle size={16} weight="fill" />
              <span>HOW WOULD YOU LIKE TO PROCEED?</span>
            </div>

            <p className="text-xs text-white/70 leading-relaxed">
              Payments can occasionally fail due to bank server timeouts, network interruptions, or incorrect OTPs. You can retry safely using UPI, Netbanking, or another Card.
            </p>

            <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-white/10">
              <button
                type="button"
                onClick={onBackToCourse}
                className="w-full sm:w-auto px-5 py-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white/70 hover:text-white text-xs font-semibold uppercase tracking-wider flex items-center justify-center gap-2 transition-colors cursor-pointer"
              >
                <ArrowLeft size={16} />
                <span>Back to Course Page</span>
              </button>

              <button
                type="button"
                onClick={onRetryPayment}
                className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-gradient-to-r from-[#c79c6e] via-[#dfb98f] to-[#c79c6e] text-black text-xs font-bold uppercase tracking-widest flex items-center justify-center gap-2 transition-all hover:scale-[1.02] active:scale-[0.98] shadow-[0_0_25px_rgba(199,156,110,0.3)] cursor-pointer"
              >
                <ArrowCounterClockwise size={16} weight="bold" />
                <span>RETRY PAYMENT (₹{finalAmount.toLocaleString('en-IN')})</span>
              </button>
            </div>
          </div>
        ) : (
          <div className="bg-[#0a0a0a] border border-white/10 rounded-2xl p-6 sm:p-8 space-y-5 print:hidden">
            <div className="flex items-center gap-2 text-[#c79c6e] font-semibold text-xs uppercase tracking-wider">
              <Sparkle size={16} weight="fill" />
              <span>YOUR UNLOCKED STUDENT BENEFITS</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5 space-y-1">
                <div className="flex items-center gap-2 text-white font-semibold">
                  <PlayCircle size={16} className="text-[#c79c6e]" weight="fill" />
                  <span>Lifetime Masterclass Access</span>
                </div>
                <p className="text-white/50 leading-relaxed">
                  Stream all video lessons on any device, replay anytime, and access upcoming updates.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5 space-y-1">
                <div className="flex items-center gap-2 text-emerald-400 font-semibold">
                  <CalendarCheck size={16} weight="fill" />
                  <span>3 Free Private 1-on-1 Calls</span>
                </div>
                <p className="text-white/50 leading-relaxed">
                  Schedule personal breakthrough sessions directly with Aarkesh whenever you're ready.
                </p>
              </div>
            </div>

            <div className="pt-4 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-white/10">
              {onBookSession ? (
                <button
                  type="button"
                  onClick={onBookSession}
                  className="w-full sm:w-auto px-5 py-3 rounded-xl bg-white/5 hover:bg-white/10 border border-[#c79c6e]/40 text-[#c79c6e] hover:text-white text-xs font-semibold uppercase tracking-wider flex items-center justify-center gap-2 transition-colors cursor-pointer"
                >
                  <CalendarCheck size={16} />
                  <span>Book 1st Coaching Call (₹0)</span>
                </button>
              ) : <div />}

              <button
                type="button"
                onClick={onStartLearning}
                className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-gradient-to-r from-[#c79c6e] via-[#dfb98f] to-[#c79c6e] text-black text-xs font-bold uppercase tracking-widest flex items-center justify-center gap-2 transition-all hover:scale-[1.02] active:scale-[0.98] shadow-[0_0_25px_rgba(199,156,110,0.3)] cursor-pointer"
              >
                <span>ACCESS COURSE DASHBOARD</span>
                <ArrowRight size={16} weight="bold" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
