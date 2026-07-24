import { cn } from '../../utils/cn';

export default function Container({ children, className }) {
  return (
    <div className={cn('w-full mx-auto px-4 md:px-8', className)}>
      {children}
    </div>
  );
}
