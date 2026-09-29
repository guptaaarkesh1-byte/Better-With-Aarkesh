import React from 'react';
import { 
  X, CalendarBlank, Clock, User, ArrowLeft, ArrowRight
} from '@phosphor-icons/react';
import { Link } from 'react-router-dom';
import bookingBg from '../../assets/images/booking_bg_lamp.png';

export default function BookingCancelled({ data, onRetry }) {
  return (
    <div className="min-h-screen bg-[#f5f1e8] text-[#111010] relative pt-20 sm:pt-24 md:pt-32 pb-12 sm:pb-16 px-3 sm:px-4 md:px-8 animate-in fade-in zoom-in-95 duration-1000">
      
      {/* Background Image Layer with Warm Cream Gradients */}
      <div className="fixed inset-0 z-0 pointer-events-none opacity-20">
        <img 
          src={bookingBg} 
          alt="Desk lamp" 
          className="w-full h-full object-cover object-left mix-blend-multiply filter grayscale"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-[#f5f1e8]/60 via-transparent to-[#f5f1e8]/90" />
      </div>

      <div className="relative z-10 max-w-2xl mx-auto flex flex-col items-center justify-center min-h-[60vh]">
        
        {/* Top Left Back Button */}
        <div className="w-full mb-6 sm:mb-8 text-left">
          <Link 
            to="/" 
            className="inline-flex items-center gap-2 font-sans text-[0.68rem] uppercase tracking-widest text-[#7a756b] hover:text-[#802673] transition-colors font-semibold"
          >
            <ArrowLeft className="text-base" />
            RETURN TO HOME
          </Link>
        </div>

        {/* Header section card */}
        <div className="bg-white/90 border border-black/10 rounded-2xl md:rounded-3xl p-8 sm:p-12 text-center mb-6 sm:mb-8 flex flex-col items-center justify-center w-full shadow-xl">
          <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full border border-red-200 flex items-center justify-center mb-4 sm:mb-6 bg-red-50 shadow-xs">
            <X className="text-red-500 text-2xl sm:text-3xl" weight="bold" />
          </div>
          <span className="font-sans text-[0.65rem] uppercase tracking-[0.25em] font-bold text-red-600 block mb-2 sm:mb-3">
            PAYMENT CANCELLED
          </span>
          <h1 className="font-serif text-3xl sm:text-4xl md:text-5xl font-normal tracking-tight leading-[1.15] text-[#111010] mb-4 sm:mb-6">
            Your payment was not completed.
          </h1>
          <p className="text-[#555047] text-sm md:text-base font-light tracking-wide max-w-md mx-auto mb-8 sm:mb-10 leading-relaxed">
            Your session has not been reserved because the payment was cancelled or failed. No charges were made to your account.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 w-full">
            <button 
              onClick={onRetry}
              className="flex items-center justify-center gap-3 px-8 py-4 rounded-xl bg-[#802673] text-white font-sans text-xs sm:text-sm font-bold tracking-wider uppercase hover:bg-[#111010] transition-all w-full sm:w-auto shadow-md cursor-pointer"
            >
              TRY AGAIN
              <ArrowRight className="text-lg" weight="bold" />
            </button>
            
            <Link 
              to="/" 
              className="flex items-center justify-center gap-3 px-8 py-4 rounded-xl border border-black/15 font-sans text-xs sm:text-sm font-semibold tracking-wider uppercase text-[#111010] hover:bg-black/5 transition-all w-full sm:w-auto shadow-xs"
            >
              <ArrowLeft className="text-lg" />
              BACK TO HOME
            </Link>
          </div>
        </div>

        {/* Contact Note */}
        <div className="mt-6 pt-6 border-t border-black/10 w-full text-center">
          <p className="font-sans text-xs text-[#7a756b] mb-1.5">Having trouble with payment?</p>
          <a href="mailto:coaching@betterwithaarkesh.com" className="font-sans text-xs text-[#802673] font-semibold underline hover:text-[#111010] transition-colors">
            Contact Support →
          </a>
        </div>

      </div>
    </div>
  );
}
