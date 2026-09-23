import React from 'react';
import { useTheme } from '../../context/ThemeContext';
import { Sun, MoonStars } from '@phosphor-icons/react';
import { motion, AnimatePresence } from 'framer-motion';

export default function ThemeToggle({ className = '', size = 18, showLabel = false }) {
  const { theme, toggleTheme, isDark } = useTheme();

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
      title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
      className={`relative inline-flex items-center justify-center p-2 rounded-full border transition-all duration-300 group cursor-pointer ${
        isDark
          ? 'border-white/10 hover:border-[#c79c6e]/50 bg-white/5 hover:bg-[#c79c6e]/10 text-white/80 hover:text-[#c79c6e]'
          : 'border-black/10 hover:border-[#a06e3b]/50 bg-black/5 hover:bg-[#a06e3b]/10 text-[#423d38] hover:text-[#a06e3b]'
      } ${className}`}
    >
      <div className="relative w-5 h-5 flex items-center justify-center overflow-hidden">
        <AnimatePresence mode="wait" initial={false}>
          {isDark ? (
            <motion.div
              key="moon"
              initial={{ y: -12, opacity: 0, rotate: -45 }}
              animate={{ y: 0, opacity: 1, rotate: 0 }}
              exit={{ y: 12, opacity: 0, rotate: 45 }}
              transition={{ duration: 0.22, ease: 'easeOut' }}
              className="flex items-center justify-center"
            >
              <MoonStars size={size} weight="light" className="group-hover:scale-110 transition-transform" />
            </motion.div>
          ) : (
            <motion.div
              key="sun"
              initial={{ y: -12, opacity: 0, rotate: 45 }}
              animate={{ y: 0, opacity: 1, rotate: 0 }}
              exit={{ y: 12, opacity: 0, rotate: -45 }}
              transition={{ duration: 0.22, ease: 'easeOut' }}
              className="flex items-center justify-center text-[#a06e3b]"
            >
              <Sun size={size} weight="light" className="group-hover:scale-110 transition-transform" />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {showLabel && (
        <span className="ml-2 font-sans text-xs uppercase tracking-widest font-medium">
          {isDark ? 'Light' : 'Dark'}
        </span>
      )}
    </button>
  );
}
