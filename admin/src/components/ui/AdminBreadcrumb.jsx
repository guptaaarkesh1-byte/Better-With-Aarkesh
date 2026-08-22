import React from 'react';
import { CaretRight } from '@phosphor-icons/react';

export default function AdminBreadcrumb({ items }) {
  return (
    <div className="flex items-center gap-2 mb-6">
      {items.map((item, index) => (
        <React.Fragment key={index}>
          <span className={`font-sans text-[0.65rem] uppercase tracking-widest font-semibold ${
            index === items.length - 1 ? 'text-[#c79c6e]' : 'text-white/40'
          }`}>
            {item}
          </span>
          {index < items.length - 1 && (
            <CaretRight size={10} className="text-white/20" />
          )}
        </React.Fragment>
      ))}
    </div>
  );
}
