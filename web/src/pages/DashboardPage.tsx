import { motion } from 'framer-motion';
import { useAuthStore } from '../stores/authStore';
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  Flame, 
  Search, 
  Heart, 
  MessageCircle, 
  ArrowRight, 
  Users, 
  Sparkles,
  TrendingUp,
  MapPin,
  Calendar,
  Zap
} from 'lucide-react';
import { GlassCard, Avatar, NeonTag } from '../components/ui';
import api from '../services/api';

const getGreeting = () => {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  if (h < 21) return 'Good evening';
  return 'Good night';
};

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2,
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { duration: 0.5, ease: [0.4, 0, 0.2, 1] }
  }
};

export default function DashboardPage() {
  const user = useAuthStore((s) => s.user);
  const [stats, setStats] = useState({ matches: 0, crushes: 0, chats: 0 });
  const [recentActivity, setRecentActivity] = useState([]);
  const [trending, setTrending] = useState([]);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [matchRes, crushRes, chatRes] = await Promise.all([
          api.get('/matches'), 
          api.get('/crushes'), 
          api.get('/chats'),
        ]);
        setStats({
          matches: matchRes.data.data?.length || 0,
          crushes: crushRes.data.data?.length || 0,
          chats: chatRes.data.data?.length || 0,
        });
      } catch { }
    };
    fetchStats();
  }, []);

  const statCards = [
    { 
      label: 'Matches', 
      value: stats.matches, 
      icon: Heart,
      gradient: 'from-pink-500 to-rose-500',
      glowColor: 'rgba(244, 63, 94, 0.3)',
      change: '+12%',
    },
    { 
      label: 'Crushes', 
      value: stats.crushes, 
      icon: Sparkles,
      gradient: 'from-orange-500 to-amber-500',
      glowColor: 'rgba(245, 158, 11, 0.3)',
      change: '+8%',
    },
    { 
      label: 'Chats', 
      value: stats.chats, 
      icon: MessageCircle,
      gradient: 'from-purple-500 to-violet-500',
      glowColor: 'rgba(139, 92, 246, 0.3)',
      change: '+24%',
    },
  ];

  const quickActions = [
    { 
      icon: Flame, 
      title: 'Start Swiping', 
      desc: 'Discover new connections waiting for you',
      path: '/swipe', 
      gradient: 'from-red-500 to-pink-500',
      featured: true,
    },
    { 
      icon: Search, 
      title: 'Explore Interests', 
      desc: 'Find people who share your passions',
      path: '/explore', 
      gradient: 'from-blue-500 to-cyan-500',
    },
    { 
      icon: Sparkles, 
      title: 'Secret Crush', 
      desc: 'Add anonymous crushes anonymously',
      path: '/crush', 
      gradient: 'from-yellow-500 to-orange-500',
    },
    { 
      icon: MessageCircle, 
      title: 'Messages', 
      desc: 'Continue your conversations',
      path: '/chat', 
      gradient: 'from-green-500 to-emerald-500',
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-black to-purple-950/20 p-6">
      {/* Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 right-20 w-64 h-64 bg-purple-600/10 rounded-full blur-3xl animate-float" />
        <div className="absolute bottom-20 left-20 w-80 h-80 bg-pink-600/10 rounded-full blur-3xl animate-float" style={{ animationDelay: '-3s' }} />
      </div>

      <div className="max-w-7xl mx-auto relative">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {/* Header Section */}
          <motion.div variants={itemVariants} className="mb-12">
            <div className="flex items-center justify-between mb-6">
              <div>
                <p className="text-sm text-white/60 font-medium mb-2">
                  {getGreeting()}
                </p>
                <h1 className="text-4xl lg:text-5xl font-bold gradient-text">
                  {user?.name || 'Welcome'} ✨
                </h1>
                <p className="text-white/70 mt-2">
                  Ready to make meaningful connections on campus?
                </p>
              </div>

              <div className="text-right">
                <Avatar 
                  src={user?.avatar} 
                  name={user?.name || ''} 
                  size="xl" 
                  glowEffect
                  showStatus 
                  status="online"
                />
              </div>
            </div>
          </motion.div>

          {/* Stats Grid */}
          <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            {statCards.map((stat, i) => (
              <GlassCard 
                key={stat.label}
                interactive 
                className="p-6 group relative overflow-hidden"
              >
                {/* Glow Effect */}
                <div 
                  className="absolute inset-0 opacity-0 group-hover:opacity-20 transition-opacity duration-500 rounded-3xl blur"
                  style={{ 
                    background: `linear-gradient(135deg, ${stat.gradient.replace('from-', '').replace(' to-', ', ')})` 
                  }}
                />
                
                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-4">
                    <div 
                      className="w-12 h-12 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300"
                      style={{
                        background: `linear-gradient(135deg, ${stat.gradient.replace('from-', '').replace(' to-', ', ')})`,
                        boxShadow: `0 8px 32px ${stat.glowColor}`,
                      }}
                    >
                      <stat.icon className="w-6 h-6 text-white" />
                    </div>
                    
                    <div className="flex items-center gap-1 text-green-400 text-sm font-medium">
                      <TrendingUp className="w-4 h-4" />
                      {stat.change}
                    </div>
                  </div>
                  
                  <p className="text-xs font-semibold uppercase tracking-wider text-white/50 mb-2">
                    {stat.label}
                  </p>
                  <p className="text-3xl font-bold text-white">
                    {stat.value}
                  </p>
                </div>
              </GlassCard>
            ))}
          </motion.div>

          {/* Quick Actions */}
          <motion.div variants={itemVariants} className="mb-12">
            <h2 className="text-2xl font-bold mb-6 gradient-text">
              Quick Actions
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {quickActions.map((action, i) => (
                <Link key={action.title} to={action.path}>
                  <GlassCard 
                    interactive 
                    className={`p-6 h-full group relative overflow-hidden ${
                      action.featured ? 'ring-2 ring-white/20' : ''
                    }`}
                  >
                    {action.featured && (
                      <div className="absolute top-4 right-4 glass-card px-2 py-1">
                        <span className="text-xs font-bold gradient-text">HOT</span>
                      </div>
                    )}
                    
                    <div 
                      className="w-14 h-14 rounded-2xl mb-4 flex items-center justify-center group-hover:scale-110 transition-all duration-300"
                      style={{
                        background: `linear-gradient(135deg, ${action.gradient.replace('from-', '').replace(' to-', ', ')})`,
                      }}
                    >
                      <action.icon className="w-7 h-7 text-white" />
                    </div>
                    
                    <div className="flex-1">
                      <h3 className="font-bold text-white mb-2 group-hover:gradient-text transition-all duration-300">
                        {action.title}
                      </h3>
                      <p className="text-white/70 text-sm mb-4 leading-relaxed">
                        {action.desc}
                      </p>
                      <div className="flex items-center text-white/50 group-hover:text-white/80 transition-colors">
                        <span className="text-sm font-medium">Get started</span>
                        <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                      </div>
                    </div>
                  </GlassCard>
                </Link>
              ))}
            </div>
          </motion.div>

          {/* Activity Feed & Trending */}
          <div className="grid lg:grid-cols-2 gap-8">
            {/* Recent Activity */}
            <motion.div variants={itemVariants}>
              <GlassCard className="p-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center">
                    <Zap className="w-4 h-4 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-white">Recent Activity</h3>
                </div>

                <div className="space-y-4">
                  {/* Activity Items */}
                  <div className="flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-white/10">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-pink-500 to-rose-500 flex items-center justify-center">
                      <Heart className="w-4 h-4 text-white" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm text-white/90">You have 3 new likes!</p>
                      <p className="text-xs text-white/60">2 minutes ago</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-white/10">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center">
                      <MessageCircle className="w-4 h-4 text-white" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm text-white/90">Sarah sent you a message</p>
                      <p className="text-xs text-white/60">15 minutes ago</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-white/10">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center">
                      <Sparkles className="w-4 h-4 text-white" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm text-white/90">Someone added you as a crush!</p>
                      <p className="text-xs text-white/60">1 hour ago</p>
                    </div>
                  </div>
                </div>
              </GlassCard>
            </motion.div>

            {/* Campus Trending */}
            <motion.div variants={itemVariants}>
              <GlassCard className="p-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center">
                    <TrendingUp className="w-4 h-4 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-white">Trending on Campus</h3>
                </div>

                <div className="space-y-4">
                  {/* Trending Interests */}
                  <div>
                    <p className="text-sm text-white/70 mb-3">Popular Interests</p>
                    <div className="flex flex-wrap gap-2">
                      <NeonTag variant="purple" size="sm" selected>Photography</NeonTag>
                      <NeonTag variant="pink" size="sm">Music Production</NeonTag>
                      <NeonTag variant="orange" size="sm">Entrepreneurship</NeonTag>
                      <NeonTag variant="purple" size="sm">Gaming</NeonTag>
                    </div>
                  </div>

                  {/* Campus Events */}
                  <div className="pt-4 border-t border-white/10">
                    <p className="text-sm text-white/70 mb-3">Upcoming Events</p>
                    <div className="space-y-3">
                      <div className="flex items-center gap-3 p-2 rounded-lg bg-white/5">
                        <Calendar className="w-4 h-4 text-purple-400" />
                        <div>
                          <p className="text-sm text-white/90">Spring Mixer</p>
                          <p className="text-xs text-white/60">Tomorrow, 8 PM</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 p-2 rounded-lg bg-white/5">
                        <MapPin className="w-4 h-4 text-pink-400" />
                        <div>
                          <p className="text-sm text-white/90">Study Group @ Library</p>
                          <p className="text-xs text-white/60">Friday, 3 PM</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </GlassCard>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
