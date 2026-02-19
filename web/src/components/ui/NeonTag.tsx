import { HTMLAttributes, forwardRef } from 'react';
import { cn } from '../../utils/cn';

interface NeonTagProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: 'default' | 'purple' | 'pink' | 'orange';
  size?: 'sm' | 'md' | 'lg';
  interactive?: boolean;
  selected?: boolean;
  children: React.ReactNode;
}

const NeonTag = forwardRef<HTMLSpanElement, NeonTagProps>(
  ({ 
    className,
    variant = 'default',
    size = 'md',
    interactive = false,
    selected = false,
    children,
    ...props 
  }, ref) => {
    const baseStyles = cn(
      'neon-tag',
      'inline-flex items-center justify-center',
      'font-medium whitespace-nowrap',
      'transition-all duration-200 ease-out',
      interactive && 'cursor-pointer',
      interactive && 'hover:scale-105'
    );

    const variants = {
      default: cn(
        'border-white/10',
        selected && 'border-white/30 text-white shadow-[0_0_15px_rgba(255,255,255,0.3)]'
      ),
      purple: cn(
        'border-purple-500/30 text-purple-300',
        selected && 'border-purple-400 text-purple-200 shadow-[0_0_15px_rgba(155,92,255,0.4)]'
      ),
      pink: cn(
        'border-pink-500/30 text-pink-300',
        selected && 'border-pink-400 text-pink-200 shadow-[0_0_15px_rgba(255,46,99,0.4)]'
      ),
      orange: cn(
        'border-orange-500/30 text-orange-300',
        selected && 'border-orange-400 text-orange-200 shadow-[0_0_15px_rgba(255,138,0,0.4)]'
      )
    };

    const sizes = {
      sm: 'px-2 py-1 text-xs rounded-lg',
      md: 'px-3 py-1.5 text-sm rounded-xl',
      lg: 'px-4 py-2 text-base rounded-xl'
    };

    return (
      <span
        ref={ref}
        className={cn(
          baseStyles,
          variants[variant],
          sizes[size],
          className
        )}
        {...props}
      >
        {children}
      </span>
    );
  }
);

NeonTag.displayName = 'NeonTag';

export { NeonTag };
export type { NeonTagProps };