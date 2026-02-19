import { HTMLAttributes, forwardRef } from 'react';
import { cn } from '../../utils/cn';
import { Avatar } from './Avatar';
import { NeonTag } from './NeonTag';
import { Heart, MapPin, GraduationCap } from 'lucide-react';

interface ProfileCardProps extends HTMLAttributes<HTMLDivElement> {
  user: {
    id: string;
    name: string;
    age: number;
    images: string[];
    bio?: string;
    distance?: number;
    school?: string;
    year?: string;
    interests: string[];
    clubs?: string[];
    compatibility?: number;
  };
  variant?: 'default' | 'compact' | 'swipe';
  interactive?: boolean;
  onLike?: () => void;
  onPass?: () => void;
}

const ProfileCard = forwardRef<HTMLDivElement, ProfileCardProps>(
  ({ 
    className,
    user,
    variant = 'default',
    interactive = false,
    onLike,
    onPass,
    ...props 
  }, ref) => {
    const primaryImage = user.images[0];
    
    if (variant === 'swipe') {
      return (
        <div
          ref={ref}
          className={cn(
            'relative w-full h-full rounded-3xl overflow-hidden',
            'bg-gradient-to-br from-purple-900/20 to-orange-900/20',
            'border border-white/10 shadow-2xl',
            className
          )}
          {...props}
        >
          {/* Background Image */}
          <div 
            className="absolute inset-0 bg-cover bg-center"
            style={{ 
              backgroundImage: `url(${primaryImage})`,
            }}
          />
          
          {/* Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
          
          {/* Content */}
          <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
            <div className="flex items-end justify-between mb-4">
              <div>
                <h2 className="text-3xl font-bold gradient-text">
                  {user.name}, {user.age}
                </h2>
                {user.distance && (
                  <div className="flex items-center gap-1 text-white/70 mt-1">
                    <MapPin size={16} />
                    <span className="text-sm">{user.distance} miles away</span>
                  </div>
                )}
              </div>
              
              {user.compatibility && (
                <div className="glass-card px-3 py-1">
                  <span className="text-sm font-semibold text-green-400">
                    {user.compatibility}% match
                  </span>
                </div>
              )}
            </div>
            
            {user.school && (
              <div className="flex items-center gap-2 text-white/80 mb-3">
                <GraduationCap size={16} />
                <span className="text-sm">{user.school}</span>
                {user.year && <span className="text-sm">• {user.year}</span>}
              </div>
            )}
            
            {user.bio && (
              <p className="text-sm text-white/90 mb-4 line-clamp-2">
                {user.bio}
              </p>
            )}
            
            <div className="flex flex-wrap gap-2 mb-4">
              {user.interests.slice(0, 3).map((interest) => (
                <NeonTag key={interest} size="sm" variant="purple">
                  {interest}
                </NeonTag>
              ))}
              {user.interests.length > 3 && (
                <NeonTag size="sm" variant="default">
                  +{user.interests.length - 3}
                </NeonTag>
              )}
            </div>
          </div>
        </div>
      );
    }

    if (variant === 'compact') {
      return (
        <div
          ref={ref}
          className={cn(
            'glass-card p-4',
            interactive && 'glass-card-interactive',
            className
          )}
          {...props}
        >
          <div className="flex gap-3">
            <Avatar 
              src={primaryImage} 
              name={user.name} 
              size="lg" 
              glowEffect
            />
            
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-semibold text-white truncate">
                  {user.name}, {user.age}
                </h3>
                {user.compatibility && (
                  <span className="text-xs px-2 py-1 bg-green-500/20 text-green-400 rounded-lg">
                    {user.compatibility}%
                  </span>
                )}
              </div>
              
              <div className="flex flex-wrap gap-1 mb-2">
                {user.interests.slice(0, 2).map((interest) => (
                  <NeonTag key={interest} size="sm" variant="purple">
                    {interest}
                  </NeonTag>
                ))}
              </div>
              
              {user.distance && (
                <p className="text-xs text-white/60">
                  {user.distance} miles away
                </p>
              )}
            </div>
          </div>
        </div>
      );
    }

    // Default variant
    return (
      <div
        ref={ref}
        className={cn(
          'glass-card overflow-hidden',
          interactive && 'glass-card-interactive',
          className
        )}
        {...props}
      >
        {/* Profile Image */}
        <div className="relative h-64 bg-gradient-to-br from-purple-900/20 to-orange-900/20">
          <img 
            src={primaryImage} 
            alt={user.name}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
          
          {user.compatibility && (
            <div className="absolute top-4 right-4 glass-card px-2 py-1">
              <span className="text-sm font-semibold text-green-400">
                {user.compatibility}%
              </span>
            </div>
          )}
        </div>
        
        {/* Profile Details */}
        <div className="p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-xl font-bold text-white">
              {user.name}, {user.age}
            </h3>
            
            {onLike && (
              <button
                onClick={onLike}
                className="glass-button-secondary p-2 rounded-full hover:text-red-400"
              >
                <Heart size={20} />
              </button>
            )}
          </div>
          
          {user.school && (
            <div className="flex items-center gap-2 text-white/70 mb-3">
              <GraduationCap size={16} />
              <span className="text-sm">{user.school}</span>
            </div>
          )}
          
          {user.bio && (
            <p className="text-sm text-white/80 mb-3 line-clamp-2">
              {user.bio}
            </p>
          )}
          
          <div className="flex flex-wrap gap-2">
            {user.interests.map((interest) => (
              <NeonTag key={interest} size="sm" variant="purple">
                {interest}
              </NeonTag>
            ))}
          </div>
        </div>
      </div>
    );
  }
);

ProfileCard.displayName = 'ProfileCard';

export { ProfileCard };
export type { ProfileCardProps };