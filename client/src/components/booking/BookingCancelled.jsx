import React from 'react';
import { 
  X, CalendarBlank, Clock, User, ArrowLeft, ArrowRight
} from '@phosphor-icons/react';
import { Link } from 'react-router-dom';
import bookingBg from '../../assets/images/booking_bg_lamp.png';

export default function BookingCancelled({ data, onRetry }) {
  return (
    <div className="min-h-screen bg-[#0a0a0a] relative pt-20 md:pt-28 pb-16 px-4 md:px-8 animate-in fade-in zoom-in-95 duration-1000">
      
      {/* Background Image Layer */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <img 
          src={bookingBg} 
          alt="Desk lamp" 
          className="w-full h-full object-cover object-left opacity-60 filter grayscale"
        />
        {/* Gradients to fade the image into black so text stays readable */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#0a0a0a]/60 via-[#0a0a0a]/80 to-[#0a0a0a]" />
        <div className="absolute inset-0 bg-gradient-to-b from-[#0a0a0a]/50 via-transparent to-[#0a0a0a]/90" />
      </div>

      <div className="relative z-10 max-w-2xl mx-auto flex flex-col items-center justify-center min-h-[60vh]">
        
        {/* Top Left Back Button */}
        <div className="absolute top-0 left-0 w-full mb-8">
          <Link 
            to="/" 
            className="flex items-center gap-2 font-sans text-[0.65rem] uppercase tracking-widest text-white/60 hover:text-white hover:text-accent-gold transition-colors"
          >
            <ArrowLeft className="text-base" />
            RETURN TO HOME
          </Link>
        </div>

        {/* Header section */}
        <div className="text-center mb-8 flex flex-col items-center justify-center w-full mt-16">
          <div className="w-16 h-16 rounded-full border border-red-500/30 flex items-center justify-center mb-6 bg-red-500/10">
            <X className="text-red-400 text-3xl" weight="bold" />
          </div>
          <span className="font-sans text-[0.6rem] uppercase tracking-[0.3em] font-medium text-red-400 block mb-3">
            PAYMENT CANCELLED
          </span>
          <h1 className="font-serif text-3xl md:text-4xl lg:text-5xl font-medium tracking-tight leading-[1.1] text-white mb-6">
            Your payment was not completed.
          </h1>
          <p className="text-paragraph text-sm font-light tracking-wide text-white/70 max-w-md mx-auto mb-10 leading-relaxed">
            Your session has not been reserved because the payment was cancelled or failed. No charges were made to your account.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 w-full">
            <button 
              onClick={onRetry}
              className="flex items-center justify-center gap-3 px-8 py-4 rounded-xl bg-accent-gold text-black font-sans text-sm font-semibold tracking-wide hover:bg-white transition-all w-full sm:w-auto"
            >
              TRY AGAIN
              <ArrowRight className="text-lg" />
            </button>
            
            <Link 
              to="/" 
              className="flex items-center justify-center gap-3 px-8 py-4 rounded-xl border border-white/10 font-sans text-sm font-light tracking-wide text-white/80 hover:text-white hover:border-white/30 transition-all w-full sm:w-auto"
            >
              <ArrowLeft className="text-lg" />
              BACK TO HOME
            </Link>
          </div>
        </div>

        {/* Contact Note */}
        <div className="mt-12 pt-8 border-t border-white/5 w-full text-center">
          <p className="font-sans text-xs text-white/40 mb-2">Having trouble with payment?</p>
          <a href="mailto:support@betterwithaarkesh.com" className="font-sans text-xs text-accent-gold underline hover:text-white transition-colors">
            Contact Support
          </a>
        </div>

      </div>
    </div>
  );
}
