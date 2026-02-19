import { motion } from 'framer-motion';
import { useState } from 'react';
import { 
  Heart, 
  Users, 
  Shield, 
  Sparkles, 
  Download, 
  Globe, 
  GraduationCap, 
  Zap,
  ArrowRight,
  CheckCircle
} from 'lucide-react';
import { GlassCard, GradientButton, NeonTag, GlassInput } from '../components/ui';
import api from '../services/api';

const fadeUp = {
  hidden: { opacity: 0, y: 60 },
  visible: (i: number) => ({
    opacity: 1, 
    y: 0,
    transition: { 
      delay: i * 0.1, 
      duration: 0.8, 
      ease: [0.4, 0, 0.2, 1] 
    },
  }),
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.3,
    }
  }
};

const features = [
  {
    icon: Heart,
    title: 'Smart Swipe',
    description: 'AI-powered matching that learns your preferences and suggests the most compatible profiles.',
    color: 'from-pink-500 to-rose-500',
    glowColor: 'rgba(244, 63, 94, 0.3)',
  },
  {
    icon: Users,
    title: 'Interest Matching',
    description: 'Connect with people who share your passions, clubs, and academic interests.',
    color: 'from-purple-500 to-violet-500',
    glowColor: 'rgba(139, 92, 246, 0.3)',
  },
  {
    icon: Sparkles,
    title: 'Secret Crush',
    description: 'Anonymously add up to 3 crushes. If they add you back, both identities are revealed!',
    color: 'from-orange-500 to-amber-500',
    glowColor: 'rgba(245, 158, 11, 0.3)',
  },
];

const safetyFeatures = [
  {
    icon: GraduationCap,
    title: 'College Verified',
    description: 'Exclusive to verified .edu email addresses',
  },
  {
    icon: Shield,
    title: 'Privacy First',
    description: 'End-to-end encryption for all conversations',
  },
  {
    icon: Zap,
    title: 'Smart Moderation',
    description: 'AI-powered content filtering and user safety',
  },
];

export default function LandingPage() {
  const [waitlistForm, setWaitlistForm] = useState({ name: '', email: '' });
  const [waitlistStatus, setWaitlistStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [waitlistMessage, setWaitlistMessage] = useState('');

  const handleWaitlist = async (e: React.FormEvent) => {
    e.preventDefault();
    setWaitlistStatus('loading');
    try {
      const { data } = await api.post('/waitlist', waitlistForm);
      setWaitlistStatus('success');
      setWaitlistMessage(data.message);
      setWaitlistForm({ name: '', email: '' });
    } catch (err: any) {
      setWaitlistStatus('error');
      setWaitlistMessage(err.response?.data?.error || 'Something went wrong');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-950 via-black to-gray-950 overflow-hidden">
      {/* Animated Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-600/20 rounded-full blur-[120px] animate-float" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-pink-600/15 rounded-full blur-[120px] animate-float" style={{ animationDelay: '-2s' }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-orange-600/10 rounded-full blur-[140px] animate-float" style={{ animationDelay: '-1s' }} />
      </div>

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center px-6">
        <div className="content-container text-center">
          <motion.div
            initial="hidden"
            animate="visible"
            variants={staggerContainer}
          >
            {/* Badge */}
            <motion.div variants={fadeUp} custom={0}>
              <div className="inline-flex items-center gap-2 glass-card px-4 py-2 mb-8">
                <GraduationCap size={16} className="text-purple-400" />
                <span className="text-sm font-medium text-white/80">Exclusively for College Students</span>
              </div>
            </motion.div>

            {/* Main Headline */}
            <motion.h1 
              variants={fadeUp}
              custom={1}
              className="text-5xl md:text-7xl lg:text-8xl font-black leading-tight mb-6 font-display"
            >
              Your Campus.
              <br />
              <span className="gradient-text animate-gradient">
                Your Spark.
              </span>
            </motion.h1>

            {/* Subheadline */}
            <motion.p 
              variants={fadeUp}
              custom={2}
              className="text-xl md:text-2xl text-white/70 mb-12 max-w-3xl mx-auto leading-relaxed"
            >
              The premium social platform where college connections ignite. 
              <br className="hidden md:block" />
              Verified. Private. Exclusively yours.
            </motion.p>

            {/* CTA Buttons */}
            <motion.div
              variants={fadeUp}
              custom={3}
              className="flex flex-col sm:flex-row gap-4 justify-center mb-16"
            >
              <GradientButton size="lg" className="group">
                <Globe className="w-5 h-5 mr-2" />
                Launch Web App
                <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
              </GradientButton>
              
              <GradientButton variant="secondary" size="lg" className="group">
                <Download className="w-5 h-5 mr-2" />
                Download Mobile
              </GradientButton>
            </motion.div>

            {/* Stats */}
            <motion.div
              variants={fadeUp}
              custom={4}
              className="flex justify-center gap-8 text-center"
            >
              <div>
                <div className="text-2xl font-bold gradient-text">500K+</div>
                <div className="text-sm text-white/60">Students</div>
              </div>
              <div>
                <div className="text-2xl font-bold gradient-text">200+</div>
                <div className="text-sm text-white/60">Universities</div>
              </div>
              <div>
                <div className="text-2xl font-bold gradient-text">2M+</div>
                <div className="text-sm text-white/60">Matches</div>
              </div>
            </motion.div>
          </motion.div>
        </div>

        {/* Scroll Indicator */}
        <motion.div
          className="absolute bottom-8 left-1/2 -translate-x-1/2"
          animate={{ y: [0, 12, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        >
          <div className="w-6 h-10 rounded-full border-2 border-white/20 flex justify-center pt-2">
            <div className="w-1 h-3 rounded-full bg-gradient-to-b from-purple-400 to-transparent" />
          </div>
        </motion.div>
      </section>

      {/* Features Section */}
      <section className="section-spacing relative">
        <div className="content-container">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-100px' }}
            variants={staggerContainer}
            className="text-center mb-20"
          >
            <motion.h2 
              variants={fadeUp}
              custom={0}
              className="text-4xl md:text-6xl font-bold mb-6 gradient-text"
            >
              Three Ways to Connect
            </motion.h2>
            <motion.p 
              variants={fadeUp}
              custom={1}
              className="text-xl text-white/70 max-w-2xl mx-auto"
            >
              Whether you're seeking romance, friendship, or that perfect study partner
            </motion.p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {features.map((feature, i) => (
              <motion.div
                key={feature.title}
                variants={fadeUp}
                custom={i + 2}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: '-50px' }}
              >
                <GlassCard interactive className="p-8 h-full group">
                  <div 
                    className="w-16 h-16 rounded-2xl mb-6 flex items-center justify-center group-hover:scale-110 transition-transform duration-300"
                    style={{
                      background: `linear-gradient(135deg, ${feature.color})`,
                      boxShadow: `0 8px 32px ${feature.glowColor}`,
                    }}
                  >
                    <feature.icon className="w-8 h-8 text-white" />
                  </div>
                  
                  <h3 className="text-2xl font-bold mb-4 text-white">
                    {feature.title}
                  </h3>
                  
                  <p className="text-white/70 leading-relaxed">
                    {feature.description}
                  </p>
                </GlassCard>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* App Preview Section */}
      <section className="section-spacing relative">
        <div className="content-container">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-100px' }}
            variants={staggerContainer}
            className="text-center mb-20"
          >
              <motion.h2 
              variants={fadeUp}
              custom={0}
              className="text-4xl md:text-6xl font-bold mb-6 gradient-text"
            >
              Experience HillFlare
            </motion.h2>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-100px' }}
            variants={staggerContainer}
            className="relative max-w-4xl mx-auto"
          >
            {/* Phone Mockups */}
            <div className="flex justify-center items-center gap-8">
              {/* Left Phone */}
              <motion.div
                variants={fadeUp}
                custom={1}
                className="hidden md:block"
              >
                <GlassCard className="w-64 h-[500px] p-4">
                  <div className="w-full h-full bg-gradient-to-b from-purple-900/20 to-pink-900/20 rounded-2xl relative overflow-hidden">
                    <div className="absolute top-4 left-1/2 -translate-x-1/2 w-20 h-1 bg-white/20 rounded-full" />
                    <div className="p-6 h-full flex flex-col justify-between">
                      <div className="text-center">
                        <h4 className="text-white font-semibold mb-2">Swipe</h4>
                        <div className="w-full h-40 bg-gradient-to-br from-pink-500/20 to-purple-500/20 rounded-xl mb-4" />
                      </div>
                    </div>
                  </div>
                </GlassCard>
              </motion.div>

              {/* Center Phone - Main */}
              <motion.div
                variants={fadeUp}
                custom={2}
              >
                <GlassCard className="w-72 h-[600px] p-4 relative z-10">
                  <div className="w-full h-full bg-gradient-to-b from-purple-900/30 to-orange-900/30 rounded-2xl relative overflow-hidden">
                    <div className="absolute top-4 left-1/2 -translate-x-1/2 w-24 h-1 bg-white/30 rounded-full" />
                    <div className="p-6 h-full">
                        <div className="text-center mb-6">
                        <h4 className="text-white font-bold text-lg gradient-text">HillFlare</h4>
                      </div>
                      <div className="space-y-4">
                        <div className="w-full h-48 bg-gradient-to-br from-purple-500/30 to-pink-500/30 rounded-xl" />
                        <div className="flex gap-2">
                          <NeonTag variant="purple" size="sm">Photography</NeonTag>
                          <NeonTag variant="pink" size="sm">Music</NeonTag>
                        </div>
                      </div>
                    </div>
                  </div>
                </GlassCard>
              </motion.div>

              {/* Right Phone */}
              <motion.div
                variants={fadeUp}
                custom={3}
                className="hidden md:block"
              >
                <GlassCard className="w-64 h-[500px] p-4">
                  <div className="w-full h-full bg-gradient-to-b from-orange-900/20 to-purple-900/20 rounded-2xl relative overflow-hidden">
                    <div className="absolute top-4 left-1/2 -translate-x-1/2 w-20 h-1 bg-white/20 rounded-full" />
                    <div className="p-6 h-full flex flex-col justify-between">
                      <div className="text-center">
                        <h4 className="text-white font-semibold mb-2">Chat</h4>
                        <div className="space-y-2">
                          <div className="w-3/4 h-8 bg-purple-500/20 rounded-xl ml-auto" />
                          <div className="w-2/3 h-8 bg-white/10 rounded-xl" />
                        </div>
                      </div>
                    </div>
                  </div>
                </GlassCard>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Safety & Privacy Section */}
      <section className="section-spacing relative">
        <div className="content-container">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-100px' }}
            variants={staggerContainer}
            className="text-center mb-20"
          >
            <motion.h2 
              variants={fadeUp}
              custom={0}
              className="text-4xl md:text-6xl font-bold mb-6"
            >
              Your Safety, 
              <span className="gradient-text"> Our Priority</span>
            </motion.h2>
            <motion.p 
              variants={fadeUp}
              custom={1}
              className="text-xl text-white/70 max-w-2xl mx-auto"
            >
              Built with enterprise-grade security and privacy from day one
            </motion.p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {safetyFeatures.map((feature, i) => (
              <motion.div
                key={feature.title}
                variants={fadeUp}
                custom={i + 2}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: '-50px' }}
              >
                <GlassCard className="p-8 text-center h-full">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-green-500/20 to-blue-500/20 flex items-center justify-center mx-auto mb-6">
                    <feature.icon className="w-8 h-8 text-green-400" />
                  </div>
                  
                  <h3 className="text-xl font-bold mb-4 text-white">
                    {feature.title}
                  </h3>
                  
                  <p className="text-white/70">
                    {feature.description}
                  </p>
                </GlassCard>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Waitlist Section */}
      <section className="section-spacing relative">
        <div className="content-container">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={staggerContainer}
            className="max-w-2xl mx-auto"
          >
            <GlassCard className="p-8 md:p-12 text-center">
              <motion.h2 
                variants={fadeUp}
                custom={0}
                className="text-3xl md:text-5xl font-bold mb-4"
              >
                Join the 
                <span className="gradient-text"> Revolution</span>
              </motion.h2>
              
              <motion.p 
                variants={fadeUp}
                custom={1}
                className="text-xl text-white/70 mb-8"
              >
                Be among the first to experience the future of college social networking
              </motion.p>

              <motion.form
                variants={fadeUp}
                custom={2}
                onSubmit={handleWaitlist}
                className="space-y-6"
              >
                <div className="grid md:grid-cols-2 gap-4">
                  <GlassInput
                    placeholder="Your Name"
                    value={waitlistForm.name}
                    onChange={(e) => setWaitlistForm({ ...waitlistForm, name: e.target.value })}
                    required
                  />
                  <GlassInput
                    type="email"
                    placeholder="College Email"
                    value={waitlistForm.email}
                    onChange={(e) => setWaitlistForm({ ...waitlistForm, email: e.target.value })}
                    required
                  />
                </div>
                
                <GradientButton
                  type="submit"
                  size="lg"
                  fullWidth
                  disabled={waitlistStatus === 'loading'}
                  className="group"
                >
                  {waitlistStatus === 'loading' ? (
                    <>
                      <div className="animate-spin w-5 h-5 border-2 border-white/30 border-t-white rounded-full mr-2" />
                      Joining Waitlist...
                    </>
                  ) : (
                    <>
                      Join the Waitlist
                      <Sparkles className="w-5 h-5 ml-2 group-hover:animate-pulse" />
                    </>
                  )}
                </GradientButton>
              </motion.form>

              {waitlistStatus === 'success' && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-center justify-center gap-2 mt-6 text-green-400"
                >
                  <CheckCircle className="w-5 h-5" />
                  <span className="font-medium">{waitlistMessage}</span>
                </motion.div>
              )}
              
              {waitlistStatus === 'error' && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-6 text-red-400 font-medium"
                >
                  {waitlistMessage}
                </motion.div>
              )}
            </GlassCard>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-6 border-t border-white/10">
        <div className="content-container">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
                <Heart className="w-5 h-5 text-white" />
              </div>
              <span className="text-2xl font-bold gradient-text">HillFlare</span>
            </div>
            
            <div className="flex gap-8 text-white/60 text-sm">
              <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
              <a href="#" className="hover:text-white transition-colors">Terms of Service</a>
              <a href="#" className="hover:text-white transition-colors">Contact</a>
            </div>
            
            <p className="text-white/40 text-sm">
              © 2026 HillFlare. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
