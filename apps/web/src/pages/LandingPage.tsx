import React, { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';

/* ── SVG Logo Component ── */
const HillFlareLogo: React.FC<{ size?: number }> = ({ size = 40 }) => (
  <svg width={size} height={size} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="flame-grad" x1="14" y1="4" x2="34" y2="44">
        <stop stopColor="#F07A83" />
        <stop offset="1" stopColor="#E8525E" />
      </linearGradient>
      <linearGradient id="flame-inner" x1="20" y1="16" x2="28" y2="40">
        <stop stopColor="#FFB8BD" />
        <stop offset="1" stopColor="#F07A83" />
      </linearGradient>
    </defs>
    <path d="M24 3C19 3 12 9 12 20c0 7 3.5 11.5 6 15 2.5 3.5 6 10 6 10s3.5-6.5 6-10c2.5-3.5 6-8 6-15C36 9 29 3 24 3z" fill="url(#flame-grad)" />
    <path d="M24 16c-2.5 0-6 3-6 9 0 3.5 1.5 6 3 7.5S24 38 24 38s1.5-4 3-5.5 3-4 3-7.5c0-6-3.5-9-6-9z" fill="url(#flame-inner)" opacity="0.8" />
  </svg>
);

/* ── Feature Icon Components ── */
const FeatureIcon: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-hf-accent/20 to-hf-accent/5">
    {children}
  </div>
);

const IconCampus = () => (
  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#F07A83" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 10v6M2 10l10-5 10 5-10 5z" /><path d="M6 12v5c0 1.1 2.7 3 6 3s6-1.9 6-3v-5" />
  </svg>
);
const IconSpark = () => (
  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#F07A83" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 2l2.4 7.4H22l-6.2 4.5L18.2 22 12 17.5 5.8 22l2.4-7.1L2 10.4h7.6z" />
  </svg>
);
const IconHeart = () => (
  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#F07A83" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" />
  </svg>
);
const IconShield = () => (
  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#F07A83" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
  </svg>
);
const IconChat = () => (
  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#F07A83" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />
  </svg>
);
const IconCalendar = () => (
  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#F07A83" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="4" width="18" height="18" rx="2" /><path d="M16 2v4M8 2v4M3 10h18" />
  </svg>
);

const features = [
  { title: 'Campus Exclusive', desc: 'Only verified students from your college can join', icon: <IconCampus /> },
  { title: 'Smart Matching', desc: 'Find people based on interests, clubs, and compatibility', icon: <IconSpark /> },
  { title: 'Anonymous Crushes', desc: "Pick your crushes — they're revealed only when mutual", icon: <IconHeart /> },
  { title: 'Safe & Private', desc: 'Verified profiles with strict privacy controls', icon: <IconShield /> },
  { title: 'Real-Time Chat', desc: 'Connect instantly with matches via seamless messaging', icon: <IconChat /> },
  { title: 'Events & Clubs', desc: 'Discover campus activities and connect over shared passions', icon: <IconCalendar /> },
];

/* ── Scroll Animation Hook ── */
const useScrollReveal = () => {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('revealed');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15 }
    );
    el.querySelectorAll('.scroll-reveal').forEach((child) => observer.observe(child));
    return () => observer.disconnect();
  }, []);
  return ref;
};

const LandingPage: React.FC = () => {
  const howItWorksRef = useScrollReveal();
  const featuresRef = useScrollReveal();
  const safetyRef = useScrollReveal();

  return (
    <div className="min-h-screen bg-gradient-to-br from-hf-bg via-white to-hf-accent/5">
      {/* Header */}
      <header className="border-b border-hf-border bg-white/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-2.5">
            <HillFlareLogo size={40} />
            <span className="text-2xl font-bold text-hf-charcoal">HillFlare</span>
          </div>
          <nav className="hidden gap-8 md:flex">
            <a href="#features" className="text-hf-muted transition hover:text-hf-charcoal">Features</a>
            <a href="#how-it-works" className="text-hf-muted transition hover:text-hf-charcoal">How It Works</a>
            <a href="#safety" className="text-hf-muted transition hover:text-hf-charcoal">Safety</a>
          </nav>
          <Link
            to="/login"
            className="rounded-full bg-hf-accent px-6 py-2.5 font-semibold text-white shadow-soft transition hover:shadow-glow"
          >
            Get Started
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <section className="mx-auto max-w-7xl px-6 py-20 text-center lg:py-32">
        <div className="mx-auto max-w-3xl">
          <h1 className="mb-6 text-5xl font-bold leading-tight text-hf-charcoal lg:text-7xl">
            Find Your Perfect Match on{' '}
            <span className="bg-gradient-to-r from-hf-accent to-hf-accent/70 bg-clip-text text-transparent">
              Campus
            </span>
          </h1>
          <p className="mb-10 text-xl text-hf-muted lg:text-2xl">
            HillFlare is a premium, college-exclusive social discovery platform. Connect with
            classmates, find study partners, and discover meaningful relationships.
          </p>
          <div className="flex flex-col gap-4 sm:flex-row sm:justify-center">
            <Link
              to="/login"
              className="rounded-full bg-hf-accent px-8 py-4 text-lg font-semibold text-white shadow-soft transition hover:shadow-glow"
            >
              Start in Browser
            </Link>
            <a
              href="#download"
              className="rounded-full border-2 border-hf-border bg-white px-8 py-4 text-lg font-semibold text-hf-charcoal transition hover:border-hf-accent"
            >
              Download the App
            </a>
          </div>
        </div>

        {/* Stats */}
        <div className="mx-auto mt-20 grid max-w-4xl gap-8 sm:grid-cols-3">
          {[
            { label: 'Active Students', value: '50,000+' },
            { label: 'College Campuses', value: '100+' },
            { label: 'Matches Made', value: '1M+' },
          ].map((stat) => (
            <div key={stat.label} className="rounded-3xl border border-hf-border bg-white p-6 shadow-soft">
              <p className="text-4xl font-bold text-hf-accent">{stat.value}</p>
              <p className="mt-2 text-hf-muted">{stat.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="bg-white py-20" ref={featuresRef}>
        <div className="mx-auto max-w-7xl px-6">
          <div className="mb-16 text-center">
            <h2 className="mb-4 text-4xl font-bold text-hf-charcoal lg:text-5xl">
              Why Choose HillFlare?
            </h2>
            <p className="text-xl text-hf-muted">Designed exclusively for college students</p>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {features.map((feature, i) => (
              <div
                key={feature.title}
                className={`scroll-reveal scroll-delay-${(i % 3) + 1} group rounded-3xl border border-hf-border bg-gradient-to-br from-white to-hf-bg/50 p-7 shadow-soft transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:border-hf-accent/30`}
              >
                <FeatureIcon>{feature.icon}</FeatureIcon>
                <h3 className="mb-2 text-xl font-bold text-hf-charcoal">{feature.title}</h3>
                <p className="text-hf-muted leading-relaxed">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-20" ref={howItWorksRef}>
        <div className="mx-auto max-w-7xl px-6">
          <div className="mb-16 text-center">
            <h2 className="mb-4 text-4xl font-bold text-hf-charcoal lg:text-5xl">How It Works</h2>
            <p className="text-xl text-hf-muted">Three simple steps to get started</p>
          </div>

          <div className="mx-auto max-w-4xl">
            <div className="relative">
              {/* Connecting line */}
              <div className="absolute left-8 top-0 hidden h-full w-0.5 bg-gradient-to-b from-hf-accent via-hf-accent/50 to-hf-accent/20 md:block" />

              {[
                {
                  step: '01',
                  title: 'Create Your Profile',
                  desc: 'Sign up with your college email, add your interests, clubs, and a great bio. Your profile is your first impression.',
                },
                {
                  step: '02',
                  title: 'Discover & Swipe',
                  desc: "Browse profiles of students from your campus. Swipe right to like, left to pass. It's that simple.",
                },
                {
                  step: '03',
                  title: 'Match & Chat',
                  desc: 'When someone likes you back, it\'s a match! Start chatting instantly and build meaningful connections.',
                },
              ].map((item, i) => (
                <div
                  key={item.step}
                  className={`scroll-reveal scroll-delay-${i + 1} relative mb-12 flex items-start gap-6 last:mb-0`}
                >
                  <div className="relative z-10 flex h-16 w-16 flex-shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-hf-accent to-hf-accent/70 text-xl font-bold text-white shadow-glow">
                    {item.step}
                  </div>
                  <div className="flex-1 rounded-3xl border border-hf-border bg-white p-6 shadow-soft">
                    <h3 className="mb-2 text-xl font-bold text-hf-charcoal">{item.title}</h3>
                    <p className="text-hf-muted leading-relaxed">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Safety Section */}
      <section id="safety" className="bg-white py-20" ref={safetyRef}>
        <div className="mx-auto max-w-7xl px-6 text-center">
          <h2 className="mb-4 text-4xl font-bold text-hf-charcoal lg:text-5xl">Your Safety First</h2>
          <p className="mb-12 text-xl text-hf-muted">We take your privacy and security seriously</p>
          <div className="mx-auto grid max-w-3xl gap-6 sm:grid-cols-2">
            {[
              'Email Verification',
              'Profile Moderation',
              'Report & Block',
              '24/7 Support',
            ].map((item, i) => (
              <div
                key={item}
                className={`scroll-reveal scroll-delay-${(i % 2) + 1} flex items-center gap-4 rounded-2xl border border-hf-border bg-hf-bg/50 p-5`}
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-green-100">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                </div>
                <span className="font-semibold text-hf-charcoal">{item}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Download Section */}
      <section id="download" className="py-20">
        <div className="mx-auto max-w-6xl px-6">
          <div className="overflow-hidden rounded-[2rem] bg-gradient-to-br from-hf-charcoal via-hf-charcoal to-hf-charcoal/90 p-10 shadow-soft lg:p-14">
            <div className="grid items-center gap-10 lg:grid-cols-[1.4fr_1fr]">
              <div>
                <div className="mb-6 flex items-center gap-3">
                  <HillFlareLogo size={44} />
                  <span className="text-2xl font-bold text-white">HillFlare</span>
                </div>
                <h2 className="mb-4 text-4xl font-bold leading-tight text-white lg:text-5xl">
                  Take HillFlare<br />with you
                </h2>
                <p className="mb-8 text-lg text-white/60">
                  Download the app for the full experience, or keep chatting directly in your browser.
                </p>
                <div className="flex flex-wrap gap-3">
                  <button className="flex items-center gap-2 rounded-xl bg-white/10 px-5 py-3 font-semibold text-white backdrop-blur transition hover:bg-white/20">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="white"><path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z" /></svg>
                    App Store
                  </button>
                  <button className="flex items-center gap-2 rounded-xl bg-white/10 px-5 py-3 font-semibold text-white backdrop-blur transition hover:bg-white/20">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="white"><path d="M3 20.5v-17c0-.59.34-1.11.84-1.35L13.69 12l-9.85 9.85c-.5-.24-.84-.76-.84-1.35m13.81-5.38L6.05 21.34l8.49-8.49 2.27 2.27m3.35-4.31c.34.27.56.69.56 1.19s-.22.92-.57 1.19l-1.41.88-2.52-2.52 2.52-2.52 1.42.88M6.05 2.66l10.76 6.22-2.27 2.27-8.49-8.49z" /></svg>
                    Google Play
                  </button>
                  <Link
                    to="/login"
                    className="flex items-center gap-2 rounded-xl border border-white/20 px-5 py-3 font-semibold text-white transition hover:bg-white/10"
                  >
                    Use Web App →
                  </Link>
                </div>
                <p className="mt-4 text-sm text-white/30">Mobile apps coming soon</p>
              </div>
              <div className="hidden items-center justify-center lg:flex">
                <div className="relative">
                  {/* Phone mockup */}
                  <div className="h-80 w-44 rounded-[2rem] border-4 border-white/20 bg-gradient-to-br from-white/10 to-white/5 p-3 backdrop-blur">
                    <div className="flex h-full flex-col items-center justify-center rounded-[1.5rem] bg-white/5">
                      <HillFlareLogo size={48} />
                      <p className="mt-3 text-sm font-semibold text-white/80">HillFlare</p>
                      <p className="mt-1 text-xs text-white/40">Campus Dating</p>
                      <div className="mt-6 rounded-full bg-hf-accent/80 px-4 py-2 text-xs font-semibold text-white">
                        Coming Soon
                      </div>
                    </div>
                  </div>
                  {/* Glow effect */}
                  <div className="absolute -inset-4 -z-10 rounded-[3rem] bg-hf-accent/10 blur-2xl" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-white py-20">
        <div className="mx-auto max-w-3xl px-6 text-center">
          <h2 className="mb-4 text-4xl font-bold text-hf-charcoal lg:text-5xl">
            Ready to Find Your Match?
          </h2>
          <p className="mb-8 text-xl text-hf-muted">
            Join thousands of students already connecting on HillFlare
          </p>
          <Link
            to="/login"
            className="inline-block rounded-full bg-hf-accent px-8 py-4 text-lg font-semibold text-white shadow-soft transition hover:shadow-glow"
          >
            Get Started Free
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-hf-border bg-hf-bg py-12">
        <div className="mx-auto max-w-7xl px-6">
          <div className="grid gap-8 md:grid-cols-4">
            <div>
              <div className="mb-4 flex items-center gap-2">
                <HillFlareLogo size={32} />
                <span className="text-lg font-bold text-hf-charcoal">HillFlare</span>
              </div>
              <p className="text-sm text-hf-muted">
                The premium campus dating platform.
              </p>
            </div>
            {[
              { title: 'Product', links: ['Features', 'How it Works', 'Safety'] },
              { title: 'Company', links: ['About Us', 'Careers', 'Contact'] },
              { title: 'Legal', links: ['Privacy Policy', 'Terms of Service', 'Community Guidelines'] },
            ].map((col) => (
              <div key={col.title}>
                <h4 className="mb-3 font-semibold text-hf-charcoal">{col.title}</h4>
                <ul className="space-y-2">
                  {col.links.map((link) => (
                    <li key={link}>
                      <a href="#" className="text-sm text-hf-muted transition hover:text-hf-charcoal">{link}</a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <div className="mt-12 border-t border-hf-border pt-6 text-center text-sm text-hf-muted">
            © 2026 HillFlare. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
