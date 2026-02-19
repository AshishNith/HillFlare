import { ImgHTMLAttributes, forwardRef } from 'react';
import { cn } from '../../utils/cn';
import { getInitials } from '../../utils/cn';

interface AvatarProps extends Omit<ImgHTMLAttributes<HTMLImageElement>, 'src'> {
  src?: string | null;
  name?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  status?: 'online' | 'offline' | 'away' | 'busy';
  showStatus?: boolean;
  glowEffect?: boolean;
}

const Avatar = forwardRef<HTMLDivElement, AvatarProps>(
  ({ 
    className,
    src,
    name = '',
    size = 'md',
    status,
    showStatus = false,
    glowEffect = false,
    alt,
    ...props 
  }, ref) => {
    const sizes = {
      xs: 'w-6 h-6 text-xs',
      sm: 'w-8 h-8 text-sm',
      md: 'w-12 h-12 text-base',
      lg: 'w-16 h-16 text-lg',
      xl: 'w-20 h-20 text-xl',
      '2xl': 'w-24 h-24 text-2xl'
    };

    const statusColors = {
      online: 'bg-green-500',
      offline: 'bg-gray-500',
      away: 'bg-yellow-500',
      busy: 'bg-red-500'
    };

    const initials = getInitials(name);

    return (
      <div 
        ref={ref}
        className={cn(
          'relative inline-flex items-center justify-center rounded-full overflow-hidden',
          'bg-gradient-to-br from-purple-500/20 to-orange-500/20',
          'border-2 border-white/10',
          sizes[size],
          glowEffect && 'avatar-glow',
          className
        )}
      >
        {src ? (
          <img
            src={src}
            alt={alt || name}
            className="w-full h-full object-cover"
            onError={(e) => {
              // Fallback to initials if image fails to load
              e.currentTarget.style.display = 'none';
            }}
            {...props}
          />
        ) : (
          <span className={cn(
            'font-semibold text-white/90 select-none',
            'bg-gradient-to-br from-purple-500 to-orange-500',
            'flex items-center justify-center w-full h-full'
          )}>
            {initials}
          </span>
        )}

        {showStatus && status && (
          <div 
            className={cn(
              'status-indicator',
              statusColors[status]
            )}
          />
        )}
      </div>
    );
  }
);

Avatar.displayName = 'Avatar';

export { Avatar };
export type { AvatarProps };