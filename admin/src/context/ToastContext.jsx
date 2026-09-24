import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { CheckCircle, WarningCircle, Info, X } from '@phosphor-icons/react';

const ToastContext = createContext(null);

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const [hasSuccessFlash, setHasSuccessFlash] = useState(false);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const showToast = useCallback((message, type = 'success', duration = 3500) => {
    const id = Date.now() + Math.random().toString(36).substring(2, 7);
    const newToast = { id, message, type, duration };

    setToasts((prev) => [...prev, newToast]);

    if (type === 'success') {
      setHasSuccessFlash(true);
      setTimeout(() => setHasSuccessFlash(false), 900);
    }

    if (duration > 0) {
      setTimeout(() => {
        removeToast(id);
      }, duration);
    }
    return id;
  }, [removeToast]);

  const showSuccess = useCallback((message, duration = 3500) => {
    return showToast(message, 'success', duration);
  }, [showToast]);

  const showError = useCallback((message, duration = 4000) => {
    return showToast(message, 'error', duration);
  }, [showToast]);

  const showInfo = useCallback((message, duration = 3500) => {
    return showToast(message, 'info', duration);
  }, [showToast]);

  // Global window event listener so any file can trigger toast easily
  useEffect(() => {
    const handleCustomToast = (e) => {
      if (e.detail?.message) {
        showToast(e.detail.message, e.detail.type || 'success', e.detail.duration || 3500);
      }
    };

    window.addEventListener('bwa_admin_toast', handleCustomToast);
    return () => window.removeEventListener('bwa_admin_toast', handleCustomToast);
  }, [showToast]);

  const toastContainer = typeof document !== 'undefined' ? createPortal(
    <>
      {/* Soft brief ambient green glow flash across the screen on save */}
      {hasSuccessFlash && (
        <div 
          className="fixed inset-0 pointer-events-none z-[999998] transition-opacity duration-700 ease-out"
          style={{
            background: 'radial-gradient(ellipse 80% 50% at 50% 0%, rgba(16, 185, 129, 0.12), transparent 75%)',
            animation: 'adminSavePulse 0.9s ease-out forwards'
          }}
        />
      )}

      {/* Floating Global Toast Container (Fixed in viewport at top-right regardless of scroll position) */}
      <div 
        className="fixed top-6 right-6 z-[999999] flex flex-col gap-3 pointer-events-none max-w-sm sm:max-w-md w-full px-4 sm:px-0"
        style={{ perspective: '1000px' }}
      >
        {toasts.map((toast) => {
          const isSuccess = toast.type === 'success';
          const isError = toast.type === 'error';
          
          return (
            <div
              key={toast.id}
              className={`pointer-events-auto relative overflow-hidden rounded-2xl p-4 shadow-2xl backdrop-blur-2xl border transition-all duration-300 animate-in slide-in-from-top-5 fade-in ${
                isSuccess
                  ? 'bg-[#0a1711]/95 border-emerald-500/50 text-white shadow-[0_16px_40px_rgba(16,185,129,0.28)] ring-1 ring-emerald-500/20'
                  : isError
                  ? 'bg-[#1c0c0c]/95 border-red-500/50 text-white shadow-[0_16px_40px_rgba(239,68,68,0.28)] ring-1 ring-red-500/20'
                  : 'bg-[#141210]/95 border-[#c79c6e]/50 text-white shadow-[0_16px_40px_rgba(199,156,110,0.28)] ring-1 ring-[#c79c6e]/20'
              }`}
            >
              <div className="flex items-start gap-3.5">
                <div className={`p-2.5 rounded-xl shrink-0 mt-0.5 shadow-inner ${
                  isSuccess 
                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 shadow-emerald-500/10' 
                    : isError 
                    ? 'bg-red-500/20 text-red-400 border border-red-500/40 shadow-red-500/10' 
                    : 'bg-[#c79c6e]/20 text-[#c79c6e] border border-[#c79c6e]/40'
                }`}>
                  {isSuccess && <CheckCircle size={22} weight="fill" />}
                  {isError && <WarningCircle size={22} weight="fill" />}
                  {!isSuccess && !isError && <Info size={22} weight="fill" />}
                </div>

                <div className="flex-1 min-w-0 pr-1">
                  <div className="flex items-center gap-2">
                    <h4 className={`text-xs font-bold uppercase tracking-wider font-sans ${
                      isSuccess ? 'text-emerald-400' : isError ? 'text-red-400' : 'text-[#c79c6e]'
                    }`}>
                      {isSuccess ? 'Saved Successfully' : isError ? 'Action Failed' : 'Notice'}
                    </h4>
                    {isSuccess && (
                      <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                    )}
                  </div>
                  <p className="text-xs font-sans text-white/90 leading-relaxed mt-1 font-medium">
                    {toast.message}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => removeToast(toast.id)}
                  className="p-1 rounded-lg text-white/40 hover:text-white hover:bg-white/10 transition-colors shrink-0"
                >
                  <X size={15} />
                </button>
              </div>

              {/* Animated Progress countdown timer bar */}
              {toast.duration > 0 && (
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/5">
                  <div
                    className={`h-full ${
                      isSuccess ? 'bg-gradient-to-r from-emerald-500 to-teal-400' : isError ? 'bg-red-500' : 'bg-[#c79c6e]'
                    }`}
                    style={{
                      animation: `adminToastProgress ${toast.duration}ms linear forwards`,
                    }}
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </>,
    document.body
  ) : null;

  return (
    <ToastContext.Provider value={{ showToast, showSuccess, showError, showInfo, removeToast }}>
      {children}
      {toastContainer}
    </ToastContext.Provider>
  );
}

// Global dispatch helper for non-react or static functions
export function triggerAdminToast(message, type = 'success', duration = 3500) {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(
      new CustomEvent('bwa_admin_toast', {
        detail: { message, type, duration }
      })
    );
  }
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    // Fallback if used outside provider
    return {
      showToast: triggerAdminToast,
      showSuccess: (msg) => triggerAdminToast(msg, 'success'),
      showError: (msg) => triggerAdminToast(msg, 'error'),
      showInfo: (msg) => triggerAdminToast(msg, 'info'),
      removeToast: () => {},
    };
  }
  return context;
}

