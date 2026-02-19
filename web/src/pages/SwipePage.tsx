import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence, useMotionValue, useTransform } from 'framer-motion';
import type { PanInfo } from 'framer-motion';
import { 
  Heart, 
  X as XIcon, 
  Loader2, 
  Sparkles, 
  MapPin, 
  GraduationCap,
  Eye,
  Star,
  Zap
} from 'lucide-react';
import { GlassCard, Avatar, NeonTag, ProfileCard } from '../components/ui';
import api from '../services/api';

interface Profile {
  _id: string; 
  name: string; 
  age?: number;
  department: string; 
  year: number;
  interests: string[]; 
  clubs: string[]; 
  photos: string[]; 
  bio: string; 
  avatar: string;
  distance?: number;
  compatibility?: number;
}

export default function SwipePage() {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [matchAnimation, setMatchAnimation] = useState(false);
  const [loading, setLoading] = useState(true);
  const [swipeDirection, setSwipeDirection] = useState<'like' | 'pass' | null>(null);

  useEffect(() => {
    (async () => {
      try { 
        const { data } = await api.get('/swipes/feed'); 
        setProfiles(data.data || []); 
      } catch { }
      setLoading(false);
    })();
  }, []);

  const handleSwipe = async (type: 'like' | 'pass') => {
    const profile = profiles[currentIndex];
    if (!profile) return;
    
    setSwipeDirection(type);
    
    try {
      const { data } = await api.post('/swipes', { toUser: profile._id, type });
      if (data.data?.isMatch) { 
        setTimeout(() => setMatchAnimation(true), 300);
        setTimeout(() => setMatchAnimation(false), 3000);
      }
    } catch { }
    
    setTimeout(() => {
      setCurrentIndex((prev) => prev + 1);
      setSwipeDirection(null);
    }, 300);
  };

  const currentProfile = profiles[currentIndex];
  const remaining = profiles.length - currentIndex;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-black to-purple-950/20 p-6 relative overflow-hidden">
      {/* Animated Background */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-20 right-20 w-64 h-64 bg-purple-600/10 rounded-full blur-3xl animate-float" />
        <div className="absolute bottom-20 left-20 w-80 h-80 bg-pink-600/8 rounded-full blur-3xl animate-float" style={{ animationDelay: '-3s' }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-orange-600/5 rounded-full blur-3xl animate-float" style={{ animationDelay: '-1.5s' }} />
      </div>

      <div className="max-w-md mx-auto relative z-10">
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between mb-8"
        >
          <div>
            <h1 className="text-3xl font-bold gradient-text">Discover</h1>
            <p className="text-white/60 text-sm">Swipe right to spark, left to pass</p>
          </div>
          
          {profiles.length > 0 && (
            <GlassCard className="px-4 py-2 text-center">
              <div className="text-2xl font-bold gradient-text">
                {remaining > 0 ? remaining : 0}
              </div>
              <div className="text-xs text-white/60 uppercase tracking-wide">
                profiles left
              </div>
            </GlassCard>
          )}
        </motion.div>

        {/* Match Animation */}
        <AnimatePresence>
          {matchAnimation && (
            <motion.div 
              className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-xl"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <motion.div
                initial={{ scale: 0, rotate: -180, opacity: 0 }}
                animate={{ scale: 1, rotate: 0, opacity: 1 }}
                exit={{ scale: 0, rotate: 180, opacity: 0 }}
                transition={{ type: 'spring', damping: 15, stiffness: 300 }}
                className="text-center relative"
              >
                {/* Sparkle effects */}
                <div className="absolute inset-0 pointer-events-none">
                  {[...Array(12)].map((_, i) => (
                    <motion.div
                      key={i}
                      className="absolute w-2 h-2"
                      style={{
                        top: '50%',
                        left: '50%',
                        background: 'linear-gradient(45deg, #FF2E63, #9B5CFF)',
                      }}
                      animate={{
                        x: [0, (Math.cos(i * 30 * (Math.PI / 180)) * 100)],
                        y: [0, (Math.sin(i * 30 * (Math.PI / 180)) * 100)],
                        scale: [0, 1, 0],
                        rotate: [0, 360],
                      }}
                      transition={{
                        duration: 1,
                        delay: 0.5 + i * 0.1,
                        repeat: 2,
                      }}
                    />
                  ))}
                </div>
                
                <GlassCard className="p-8 backdrop-blur-2xl">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.3, type: 'spring', damping: 20 }}
                    className="w-20 h-20 rounded-2xl mx-auto mb-6 flex items-center justify-center"
                    style={{
                      background: 'linear-gradient(135deg, #FF2E63, #9B5CFF)',
                      boxShadow: '0 0 40px rgba(255, 46, 99, 0.5)',
                    }}
                  >
                    <Heart size={40} className="text-white" fill="currentColor" />
                  </motion.div>
                  
                  <motion.h2 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                    className="text-4xl font-bold gradient-text mb-3"
                  >
                    It's a Match! ✨
                  </motion.h2>
                  
                  <motion.p 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.7 }}
                    className="text-white/70 mb-6"
                  >
                    You both sparked a connection
                  </motion.p>
                  
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.9 }}
                  >
                    <Link
                      to="/chat"
                      className="glass-button inline-flex items-center gap-2"
                    >
                      Start Chatting
                      <Sparkles size={16} />
                    </Link>
                  </motion.div>
                </GlassCard>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Card Stack */}
        <div className="relative h-[600px] mb-8">
          <AnimatePresence mode="wait">
            {currentProfile ? (
              <SwipeCard 
                key={currentProfile._id} 
                profile={currentProfile} 
                onSwipe={handleSwipe}
                swipeDirection={swipeDirection}
              />
            ) : loading ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="w-full h-full"
              >
                <GlassCard className="w-full h-full flex items-center justify-center">
                  <div className="text-center">
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                      className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center"
                    >
                      <Zap className="w-8 h-8 text-white" />
                    </motion.div>
                    <h3 className="text-xl font-bold text-white mb-2">Finding your perfect matches...</h3>
                    <p className="text-white/60">Preparing profiles just for you</p>
                  </div>
                </GlassCard>
              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="w-full h-full"
              >
                <GlassCard className="w-full h-full flex items-center justify-center">
                  <div className="text-center p-8">
                    <div className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center">
                      <Star className="w-8 h-8 text-white" />
                    </div>
                    <h3 className="text-2xl font-bold text-white mb-3">All caught up! 🎉</h3>
                    <p className="text-white/70 mb-6">You've seen all available profiles for now.</p>
                    <p className="text-white/50 text-sm">Check back later for new connections!</p>
                  </div>
                </GlassCard>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Action Buttons */}
        {currentProfile && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center justify-center gap-6"
          >
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => handleSwipe('pass')}
              className="w-16 h-16 rounded-2xl flex items-center justify-center transition-all glass-button-secondary group"
              style={{
                background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.1), rgba(220, 38, 127, 0.1))',
                border: '2px solid rgba(239, 68, 68, 0.3)',
              }}
            >
              <XIcon size={24} className="text-red-400 group-hover:text-red-300 transition-colors" />
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => handleSwipe('like')}
              className="w-20 h-20 rounded-2xl flex items-center justify-center transition-all group"
              style={{
                background: 'linear-gradient(135deg, #FF2E63, #9B5CFF)',
                boxShadow: '0 8px 32px rgba(255, 46, 99, 0.4)',
              }}
            >
              <Heart size={28} className="text-white group-hover:scale-110 transition-transform" fill="currentColor" />
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => {}} // Super like functionality
              className="w-16 h-16 rounded-2xl flex items-center justify-center transition-all glass-button-secondary group"
              style={{
                background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.1), rgba(147, 51, 234, 0.1))',
                border: '2px solid rgba(59, 130, 246, 0.3)',
              }}
            >
              <Star size={24} className="text-blue-400 group-hover:text-blue-300 transition-colors" />
            </motion.button>
          </motion.div>
        )}
      </div>
    </div>
  );
}

function SwipeCard({ 
  profile, 
  onSwipe, 
  swipeDirection 
}: { 
  profile: Profile; 
  onSwipe: (type: 'like' | 'pass') => void;
  swipeDirection: 'like' | 'pass' | null;
}) {
  const x = useMotionValue(0);
  const rotate = useTransform(x, [-300, 300], [-25, 25]);
  const likeOpacity = useTransform(x, [50, 150], [0, 1]);
  const passOpacity = useTransform(x, [-150, -50], [1, 0]);

  const handleDragEnd = (_: any, info: PanInfo) => {
    const threshold = 100;
    if (info.offset.x > threshold) {
      onSwipe('like');
    } else if (info.offset.x < -threshold) {
      onSwipe('pass');
    }
  };

  const primaryImage = profile.photos?.[0] || profile.avatar;
  const displayAge = profile.age || Math.floor(Math.random() * 4) + 19; // Fallback age for demo

  return (
    <motion.div
      className="absolute inset-0 cursor-grab active:cursor-grabbing"
      style={{ x, rotate }}
      drag="x"
      dragConstraints={{ left: 0, right: 0 }}
      dragElastic={0.7}
      onDragEnd={handleDragEnd}
      initial={{ scale: 0.95, opacity: 0 }}
      animate={{ 
        scale: 1, 
        opacity: 1,
        x: swipeDirection === 'like' ? 300 : swipeDirection === 'pass' ? -300 : 0,
      }}
      exit={{ 
        scale: 0.9, 
        opacity: 0,
        transition: { duration: 0.3 }
      }}
      whileDrag={{ scale: 1.02 }}
    >
      <GlassCard className="w-full h-full overflow-hidden relative backdrop-blur-xl">
        {/* Swipe Indicators */}
        <motion.div 
          className="absolute top-8 left-8 z-20 px-4 py-2 rounded-xl border-4 border-green-400 bg-green-400/10 backdrop-blur-sm"
          style={{ 
            opacity: likeOpacity,
            rotate: -25,
          }}
        >
          <span className="text-green-400 font-black text-xl tracking-wider neon-glow">
            LIKE
          </span>
        </motion.div>

        <motion.div 
          className="absolute top-8 right-8 z-20 px-4 py-2 rounded-xl border-4 border-red-400 bg-red-400/10 backdrop-blur-sm"
          style={{ 
            opacity: passOpacity,
            rotate: 25,
          }}
        >
          <span className="text-red-400 font-black text-xl tracking-wider neon-glow">
            PASS
          </span>
        </motion.div>

        {/* Profile Image */}
        <div className="relative h-2/3 overflow-hidden">
          {primaryImage ? (
            <img 
              src={primaryImage} 
              alt={profile.name}
              className="w-full h-full object-cover"
              draggable={false}
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-purple-900/50 to-pink-900/50 flex items-center justify-center">
              <Avatar 
                name={profile.name} 
                size="2xl" 
                className="w-32 h-32" 
              />
            </div>
          )}
          
          {/* Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
          
          {/* Compatibility Badge */}
          {profile.compatibility && (
            <div className="absolute top-4 right-4 glass-card px-3 py-1">
              <span className="text-sm font-bold text-green-400">
                {profile.compatibility}% match
              </span>
            </div>
          )}
        </div>

        {/* Profile Info */}
        <div className="p-6 h-1/3 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-2xl font-bold text-white">
                {profile.name}, {displayAge}
              </h2>
              <Link
                to={`/user/${profile._id}`}
                onClick={e => e.stopPropagation()}
                className="glass-button-secondary p-2 rounded-xl group"
              >
                <Eye size={18} className="text-white/70 group-hover:text-white transition-colors" />
              </Link>
            </div>

            {profile.department && (
              <div className="flex items-center gap-2 text-white/70 mb-3">
                <GraduationCap size={16} />
                <span className="text-sm">{profile.department}</span>
                {profile.year && <span className="text-sm">• Year {profile.year}</span>}
              </div>
            )}

            {profile.distance && (
              <div className="flex items-center gap-2 text-white/60 mb-3">
                <MapPin size={14} />
                <span className="text-xs">{profile.distance} miles away</span>
              </div>
            )}

            {profile.bio && (
              <p className="text-white/80 text-sm mb-4 line-clamp-2 leading-relaxed">
                {profile.bio}
              </p>
            )}
          </div>

          {/* Interests */}
          <div className="flex flex-wrap gap-2">
            {profile.interests?.slice(0, 3).map((interest, i) => (
              <NeonTag 
                key={interest} 
                size="sm" 
                variant={['purple', 'pink', 'orange'][i % 3] as any}
              >
                {interest}
              </NeonTag>
            ))}
            {profile.interests?.length > 3 && (
              <NeonTag size="sm" variant="default">
                +{profile.interests.length - 3}
              </NeonTag>
            )}
          </div>
        </div>
      </GlassCard>
    </motion.div>
  );
}
