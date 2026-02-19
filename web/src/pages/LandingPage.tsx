import { motion } from 'framer-motion';
import { useState } from 'react';
import api from '../services/api';

const fadeUp = {
    hidden: { opacity: 0, y: 40 },
    visible: (i: number) => ({
        opacity: 1, y: 0,
        transition: { delay: i * 0.15, duration: 0.7, ease: 'easeOut' as const },
    }),
};

const features = [
    {
        icon: '💘',
        title: 'Swipe Mode',
        desc: 'Discover people on campus with a simple swipe. Mutual likes unlock a match.',
        gradient: 'from-violet-500 to-purple-700',
    },
    {
        icon: '🎯',
        title: 'Interest Mode',
        desc: 'Find people who share your clubs, interests, and department with smart compatibility scoring.',
        gradient: 'from-pink-500 to-rose-700',
    },
    {
        icon: '🤫',
        title: 'Secret Crush',
        desc: 'Pick up to 3 anonymous crushes. If they pick you back — both identities are revealed!',
        gradient: 'from-amber-500 to-orange-700',
    },
];

const safetyItems = [
    { icon: '🎓', title: 'College Email Verification', desc: 'Only verified .edu and .ac.in emails allowed.' },
    { icon: '🛡️', title: 'Report & Block', desc: 'Instant report and block with moderation review.' },
    { icon: '🤖', title: 'Smart Moderation', desc: 'Automated suspension after repeated violations.' },
];

const screens = [
    { label: 'Swipe', color: '#8B5CF6' },
    { label: 'Explore', color: '#EC4899' },
    { label: 'Crush', color: '#F59E0B' },
    { label: 'Chat', color: '#34D399' },
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
        <div className="min-h-screen bg-surface overflow-hidden">
            {/* ========== HERO ========== */}
            <section className="relative min-h-screen flex items-center justify-center px-4">
                {/* Subtle background pattern */}
                <div className="absolute inset-0 overflow-hidden">
                    <div className="absolute w-96 h-96 rounded-full opacity-[0.07]" style={{ background: '#8B5CF6', filter: 'blur(120px)', top: '10%', left: '15%' }} />
                    <div className="absolute w-80 h-80 rounded-full opacity-[0.05]" style={{ background: '#F97316', filter: 'blur(100px)', bottom: '20%', right: '10%' }} />
                </div>

                <div className="relative z-10 text-center max-w-4xl mx-auto">
                    <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.8 }}>
                        <span className="inline-block px-4 py-1.5 rounded-full text-sm font-medium bg-surface-3 text-text-muted border border-border mb-6">
                            🎓 Exclusively for College Students
                        </span>
                    </motion.div>

                    <motion.h1
                        className="text-5xl md:text-7xl font-bold leading-tight mb-6"
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 0.2 }}
                    >
                        Your Campus.
                        <br />
                        <span className="text-gradient">Your Connections.</span>
                    </motion.h1>

                    <motion.p
                        className="text-xl md:text-2xl text-text-muted mb-10 max-w-2xl mx-auto"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 0.4 }}
                    >
                        Verified. Private. Real.
                    </motion.p>

                    <motion.div
                        className="flex flex-col sm:flex-row gap-4 justify-center"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 0.6 }}
                    >
                        <a href="/login" className="btn-primary text-lg px-8 py-4">
                            Get Started
                        </a>
                        <button className="btn-secondary text-lg px-8 py-4">
                            Download APK
                        </button>
                    </motion.div>
                </div>

                {/* Scroll indicator */}
                <motion.div
                    className="absolute bottom-8 left-1/2 -translate-x-1/2"
                    animate={{ y: [0, 12, 0] }}
                    transition={{ duration: 2, repeat: Infinity }}
                >
                    <div className="w-6 h-10 rounded-full border-2 border-primary/30 flex justify-center pt-2">
                        <div className="w-1.5 h-3 rounded-full bg-primary/60" />
                    </div>
                </motion.div>
            </section>

            {/* ========== FEATURES ========== */}
            <section className="py-24 px-4">
                <div className="max-w-6xl mx-auto">
                    <motion.div
                        className="text-center mb-16"
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true, margin: '-100px' }}
                        variants={fadeUp}
                        custom={0}
                    >
                        <h2 className="text-4xl md:text-5xl font-bold mb-4">
                            Three Ways to <span className="text-primary-light">Connect</span>
                        </h2>
                        <p className="text-text-muted text-lg max-w-2xl mx-auto">
                            Whether you're looking for a spark, shared interests, or a secret admirer — we've got you.
                        </p>
                    </motion.div>

                    <div className="grid md:grid-cols-3 gap-8">
                        {features.map((f, i) => (
                            <motion.div
                                key={f.title}
                                className="card p-8 hover:border-border-strong transition-all duration-300 group cursor-pointer"
                                initial="hidden"
                                whileInView="visible"
                                viewport={{ once: true, margin: '-50px' }}
                                variants={fadeUp}
                                custom={i + 1}
                            >
                                <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${f.gradient} flex items-center justify-center text-3xl mb-6 group-hover:scale-110 transition-transform`}>
                                    {f.icon}
                                </div>
                                <h3 className="text-xl font-bold mb-3">{f.title}</h3>
                                <p className="text-text-muted leading-relaxed">{f.desc}</p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ========== SAFETY ========== */}
            <section className="py-24 px-4 relative">
                <div className="absolute inset-0 bg-gradient-to-b from-transparent via-primary/5 to-transparent" />
                <div className="max-w-6xl mx-auto relative">
                    <motion.div
                        className="text-center mb-16"
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true }}
                        variants={fadeUp}
                        custom={0}
                    >
                        <h2 className="text-4xl md:text-5xl font-bold mb-4">
                            Your Safety, <span className="text-primary-light">Our Priority</span>
                        </h2>
                        <p className="text-text-muted text-lg">Built with privacy and security at the core.</p>
                    </motion.div>

                    <div className="grid md:grid-cols-3 gap-8">
                        {safetyItems.map((item, i) => (
                            <motion.div
                                key={item.title}
                                className="card p-8 text-center"
                                initial="hidden"
                                whileInView="visible"
                                viewport={{ once: true }}
                                variants={fadeUp}
                                custom={i + 1}
                            >
                                <div className="text-4xl mb-4">{item.icon}</div>
                                <h3 className="text-lg font-bold mb-2">{item.title}</h3>
                                <p className="text-text-muted text-sm">{item.desc}</p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ========== SCREENS PREVIEW ========== */}
            <section className="py-24 px-4">
                <div className="max-w-6xl mx-auto">
                    <motion.div
                        className="text-center mb-16"
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true }}
                        variants={fadeUp}
                        custom={0}
                    >
                        <h2 className="text-4xl md:text-5xl font-bold mb-4">
                            Explore the <span className="text-primary-light">Experience</span>
                        </h2>
                    </motion.div>

                    <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        {screens.map((screen, i) => (
                            <motion.div
                                key={screen.label}
                                className="relative group"
                                initial="hidden"
                                whileInView="visible"
                                viewport={{ once: true }}
                                variants={fadeUp}
                                custom={i + 1}
                            >
                                {/* Phone mockup */}
                                <div className="card p-3 mx-auto max-w-[200px] group-hover:border-border-strong transition-all duration-500">
                                    <div className="rounded-2xl overflow-hidden aspect-[9/16] relative" style={{ background: `linear-gradient(180deg, ${screen.color}22 0%, ${screen.color}08 100%)` }}>
                                        {/* Notch */}
                                        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-20 h-5 bg-surface rounded-b-xl" />
                                        {/* Content */}
                                        <div className="h-full flex flex-col items-center justify-center px-4">
                                            <div className="w-12 h-12 rounded-full mb-3" style={{ background: screen.color, opacity: 0.6 }} />
                                            <div className="w-20 h-2 rounded-full mb-2" style={{ background: screen.color, opacity: 0.3 }} />
                                            <div className="w-16 h-2 rounded-full mb-4" style={{ background: screen.color, opacity: 0.2 }} />
                                            <div className="w-full space-y-2">
                                                {[1, 2, 3].map((j) => (
                                                    <div key={j} className="w-full h-8 rounded-lg" style={{ background: screen.color, opacity: 0.08 + j * 0.04 }} />
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <p className="text-center mt-4 font-semibold text-text-muted group-hover:text-text transition-colors">{screen.label}</p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ========== WAITLIST ========== */}
            <section className="py-24 px-4 relative">
                <div className="absolute inset-0 bg-gradient-to-t from-primary/5 to-transparent" />
                <div className="max-w-xl mx-auto relative">
                    <motion.div
                        className="card-raised p-8 md:p-12"
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true }}
                        variants={fadeUp}
                        custom={0}
                    >
                        <h2 className="text-3xl md:text-4xl font-bold text-center mb-3">
                            Join the <span className="text-accent-light">Waitlist</span>
                        </h2>
                        <p className="text-text-muted text-center mb-8">
                            Be the first to know when we launch at your campus.
                        </p>

                        <form onSubmit={handleWaitlist} className="space-y-4">
                            <input
                                type="text"
                                placeholder="Your Name"
                                value={waitlistForm.name}
                                onChange={(e) => setWaitlistForm({ ...waitlistForm, name: e.target.value })}
                                required
                                className="w-full px-5 py-3.5 rounded-xl bg-surface-3 border border-primary/10 text-text placeholder-text-muted/50 focus:border-primary/40 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                            />
                            <input
                                type="email"
                                placeholder="College Email"
                                value={waitlistForm.email}
                                onChange={(e) => setWaitlistForm({ ...waitlistForm, email: e.target.value })}
                                required
                                className="w-full px-5 py-3.5 rounded-xl bg-surface-3 border border-primary/10 text-text placeholder-text-muted/50 focus:border-primary/40 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                            />
                            <button
                                type="submit"
                                disabled={waitlistStatus === 'loading'}
                                className="btn-primary w-full py-4 text-lg disabled:opacity-50"
                            >
                                {waitlistStatus === 'loading' ? '⏳ Joining...' : '🚀 Join Waitlist'}
                            </button>
                        </form>

                        {waitlistStatus === 'success' && (
                            <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-success text-center mt-4 font-medium">
                                ✅ {waitlistMessage}
                            </motion.p>
                        )}
                        {waitlistStatus === 'error' && (
                            <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-danger text-center mt-4 font-medium">
                                ❌ {waitlistMessage}
                            </motion.p>
                        )}
                    </motion.div>
                </div>
            </section>

            {/* ========== FOOTER ========== */}
            <footer className="py-12 px-4 border-t border-primary/10">
                <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
                    <div className="flex items-center gap-2">
                        <span className="text-2xl">💜</span>
                        <span className="text-xl font-bold text-primary-light">CampusConnect</span>
                    </div>
                    <div className="flex gap-6 text-text-muted text-sm">
                        <a href="#" className="hover:text-primary transition-colors">Privacy Policy</a>
                        <a href="#" className="hover:text-primary transition-colors">Terms of Service</a>
                        <a href="#" className="hover:text-primary transition-colors">Contact</a>
                    </div>
                    <p className="text-text-muted/50 text-sm">© 2026 CampusConnect. All rights reserved.</p>
                </div>
            </footer>
        </div>
    );
}
