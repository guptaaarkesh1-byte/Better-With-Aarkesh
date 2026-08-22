import React, { useState, useRef, useEffect } from 'react';
import { CaretDown } from '@phosphor-icons/react';

export default function CustomSelect({ value, onChange, options, placeholder, disabled, required }) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);

  // Close when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const selectedOption = options.find((opt) => opt.value === value);

  return (
    <div className={`relative w-full ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`} ref={containerRef}>
      <button
        type="button"
        disabled={disabled}
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between bg-[#050505] border border-white/10 rounded-lg px-3 py-2.5 text-left focus:outline-none focus:border-[#c79c6e]/50 transition-colors"
      >
        <span className={`text-sm ${!selectedOption ? 'text-white/50' : 'text-white'} truncate pr-2`}>
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        <CaretDown size={14} className={`text-white/40 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {/* Hidden input to support "required" attribute for forms if needed */}
      <input type="hidden" value={value || ''} required={required} />

      {isOpen && !disabled && (
        <div className="absolute z-50 w-full mt-1 bg-[#111] border border-white/10 rounded-lg shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-100">
          <ul className="max-h-60 overflow-y-auto custom-scrollbar py-1">
            <li
              onClick={() => {
                onChange('');
                setIsOpen(false);
              }}
              className={`px-3 py-2 text-sm cursor-pointer transition-colors ${
                !value ? 'bg-[#c79c6e]/20 text-[#c79c6e]' : 'text-white/50 hover:bg-white/5 hover:text-white'
              }`}
            >
              {placeholder}
            </li>
            {options.map((opt) => (
              <li
                key={opt.value}
                onClick={() => {
                  onChange(opt.value);
                  setIsOpen(false);
                }}
                className={`px-3 py-2 text-sm cursor-pointer transition-colors ${
                  value === opt.value
                    ? 'bg-[#c79c6e]/20 text-[#c79c6e] font-medium'
                    : 'text-white/80 hover:bg-white/5 hover:text-white'
                }`}
              >
                {opt.label}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
