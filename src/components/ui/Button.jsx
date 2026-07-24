import { cn } from '../../utils/cn';
import { FiArrowRight } from 'react-icons/fi';

export default function Button({ variant = 'primary', children, className, icon, ...props }) {
  return (
    <button
      className={cn(
        'group relative inline-flex items-center justify-center transition-all duration-300 font-sans tracking-[0.15em] text-[0.7rem] uppercase',
        {
          'bg-accent-gold text-background px-8 py-4 rounded-sm hover:bg-accent-hover hover:scale-105 hover:shadow-[0_0_20px_rgba(185,138,86,0.3)]': variant === 'primary',
          'bg-transparent text-paragraph hover:text-heading px-0 py-2 border-b border-transparent hover:border-heading': variant === 'secondary',
          'border border-accent-gold text-heading px-6 py-3 rounded-sm hover:bg-white/5': variant === 'outline',
        },
        className
      )}
      {...props}
    >
      {children}
      {icon && variant === 'primary' && (
        <FiArrowRight className="ml-3 transition-transform duration-300 group-hover:translate-x-1" />
      )}
      {icon && variant === 'secondary' && (
        <FiArrowRight className="ml-3 transition-transform duration-300 group-hover:translate-x-2" />
      )}
    </button>
  );
}
