import React from 'react';
import { ArrowRight, Info } from '@phosphor-icons/react';

export default function SecurityPrivacyTab() {
  return (
    <div className="w-full max-w-2xl border border-white/10 rounded-xl p-8 md:p-10 bg-[#0a0a0a]/80 backdrop-blur-sm flex flex-col animate-in fade-in duration-500">
      <h2 className="font-serif text-3xl text-white mb-2">Security & Privacy</h2>
      <p className="font-sans text-white/70 text-sm mb-10">
        Contribute to your account and understand what remains private.
      </p>

      <div className="flex flex-col gap-4 mb-8">
        
        {/* Password */}
        <div className="flex flex-col md:flex-row md:items-center justify-between border border-white/10 rounded-lg p-6 hover:border-[#c79c6e]/40 transition-colors group">
          <div className="flex flex-col gap-2">
            <span className="font-sans text-[0.65rem] uppercase tracking-[0.2em] font-medium text-[#c79c6e]">PASSWORD</span>
            <span className="font-mono text-white tracking-widest mt-1">•••••••••••••••</span>
          </div>
          <button className="mt-4 md:mt-0 font-sans text-[0.65rem] uppercase tracking-[0.2em] font-medium text-[#c79c6e] flex items-center gap-2">
            CHANGE PASSWORD <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
          </button>
        </div>

        {/* Private Notes */}
        <div className="flex flex-col md:flex-row md:items-center justify-between border border-white/10 rounded-lg p-6 hover:border-[#c79c6e]/40 transition-colors group">
          <div className="flex flex-col gap-2 max-w-md">
            <span className="font-sans text-[0.65rem] uppercase tracking-[0.2em] font-medium text-[#c79c6e]">PRIVATE NOTES</span>
            <p className="font-serif text-white/80 text-sm leading-relaxed">
              Your notes are not shared with Aarkesh or attached to coaching responses unless you choose to share them.
            </p>
          </div>
          <button className="mt-4 md:mt-0 font-sans text-[0.65rem] uppercase tracking-[0.2em] font-medium text-[#c79c6e] flex items-center gap-2 shrink-0">
            LEARN MORE <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
          </button>
        </div>

        {/* Your Data */}
        <div className="flex flex-col md:flex-row md:items-center justify-between border border-white/10 rounded-lg p-6 hover:border-[#c79c6e]/40 transition-colors group">
          <div className="flex flex-col gap-2 max-w-md">
            <span className="font-sans text-[0.65rem] uppercase tracking-[0.2em] font-medium text-[#c79c6e]">YOUR DATA</span>
            <p className="font-serif text-white/80 text-sm leading-relaxed">
              Request a copy of your account information and activity.
            </p>
          </div>
          <button className="mt-4 md:mt-0 font-sans text-[0.65rem] uppercase tracking-[0.2em] font-medium text-[#c79c6e] flex items-center gap-2 shrink-0">
            DOWNLOAD DATA <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
          </button>
        </div>

        {/* Delete Account */}
        <div className="flex flex-col md:flex-row md:items-center justify-between border border-red-900/50 bg-red-950/10 rounded-lg p-6 hover:border-red-500/50 transition-colors group">
          <div className="flex flex-col gap-2 max-w-md">
            <span className="font-sans text-[0.65rem] uppercase tracking-[0.2em] font-medium text-red-500/80">DELETE ACCOUNT</span>
            <p className="font-serif text-white/80 text-sm leading-relaxed">
              Permanently remove your account and saved activity.
            </p>
          </div>
          <button className="mt-4 md:mt-0 font-sans text-[0.65rem] uppercase tracking-[0.2em] font-medium text-red-500 flex items-center gap-2 shrink-0">
            DELETE ACCOUNT <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
          </button>
        </div>

      </div>

      {/* Info Message */}
      <div className="flex items-start gap-3 text-white/40 font-sans text-[0.65rem] leading-relaxed mt-auto">
        <Info size={14} className="shrink-0 mt-0.5" />
        <p>Coach-shared notes and pre-session responses are separate from My Notes.</p>
      </div>
    </div>
  );
}
