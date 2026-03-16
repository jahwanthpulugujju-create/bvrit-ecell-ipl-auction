import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion, useInView } from 'framer-motion';
import { useAuction } from '@/context/AuctionContext';
import { ChevronRight, Users, Zap, Trophy, Calendar } from 'lucide-react';

function AnimatedCounter({ target, suffix = '' }: { target: number; suffix?: string }) {
  const [val, setVal] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true });

  useEffect(() => {
    if (!inView) return;
    let start = 0;
    const duration = 1500;
    const step = (ts: number) => {
      if (!start) start = ts;
      const progress = Math.min((ts - start) / duration, 1);
      setVal(Math.floor(progress * target));
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [inView, target]);

  return <div ref={ref} className="font-mono text-4xl md:text-5xl font-bold text-accent-cyan text-glow-cyan">{val}{suffix}</div>;
}

function FloatingOrb({ delay, x, y, size, color }: { delay: number; x: string; y: string; size: number; color: string }) {
  return (
    <div
      className="absolute rounded-full animate-float opacity-20 blur-3xl pointer-events-none"
      style={{
        left: x, top: y,
        width: size, height: size,
        background: color,
        animationDelay: `${delay}s`,
        animationDuration: `${12 + delay * 3}s`,
      }}
    />
  );
}

export default function Landing() {
  const { state } = useAuction();

  const steps = [
    { icon: '🔒', title: 'RETENTION', desc: 'Teams retain key players from previous seasons' },
    { icon: '🎙️', title: 'AUCTION BEGINS', desc: 'Players enter the pool, bidding starts' },
    { icon: '💰', title: 'BID & WIN', desc: 'Strategic bidding to build your dream team' },
    { icon: '🏆', title: 'RESULTS', desc: 'Final squads revealed, champions emerge' },
  ];

  const features = [
    { icon: <Zap className="w-8 h-8 text-accent-cyan" />, title: 'Auctioneer Panel', desc: 'Full control of the auction flow with real-time bid registration', link: '/admin' },
    { icon: <Users className="w-8 h-8 text-accent-orange" />, title: 'Team Dashboards', desc: 'Live squad updates, purse tracking, and RTM controls', link: '/teams' },
    { icon: <Trophy className="w-8 h-8 text-accent-gold" />, title: 'Projector Display', desc: 'Full-screen auction display for the stadium audience', link: '/display' },
  ];

  return (
    <div className="min-h-screen bg-background overflow-hidden">
      {/* Hero */}
      <section className="relative min-h-screen flex items-center justify-center pt-16">
        <FloatingOrb delay={0} x="10%" y="20%" size={400} color="hsl(192 100% 50%)" />
        <FloatingOrb delay={3} x="70%" y="60%" size={350} color="hsl(25 100% 50%)" />
        <FloatingOrb delay={6} x="50%" y="10%" size={250} color="hsl(271 91% 65%)" />

        <div className="relative z-10 container mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <div className="inline-flex items-center gap-2 bg-accent-orange/10 border border-accent-orange/30 rounded-full px-4 py-1.5 mb-8">
              <span className="w-2 h-2 rounded-full bg-accent-orange animate-pulse" />
              <span className="font-rajdhani font-semibold text-accent-orange text-sm tracking-wider">E-SUMMIT 2026</span>
            </div>
          </motion.div>

          <motion.h1
            className="font-orbitron text-5xl sm:text-6xl md:text-8xl font-black text-foreground leading-none mb-6"
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            BUILD YOUR{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-accent-cyan to-accent-orange">
              DYNASTY
            </span>
            <span className="text-accent-orange">.</span>
          </motion.h1>

          <motion.p
            className="font-exo text-lg md:text-2xl text-muted-foreground max-w-2xl mx-auto mb-10"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            BVRIT E-Cell IPL Auction 2026 — Where Strategy Meets Cricket
          </motion.p>

          <motion.div
            className="flex flex-col sm:flex-row gap-4 justify-center mb-16"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
          >
            <Link to="/teams" className="btn-secondary glow-orange flex items-center gap-2 justify-center">
              View Teams <ChevronRight size={18} />
            </Link>
            <Link to="/players" className="btn-ghost flex items-center gap-2 justify-center">
              View Players
            </Link>
          </motion.div>

          {/* Stats */}
          <motion.div
            className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.9 }}
          >
            {[
              { label: 'Teams', value: 8 },
              { label: 'Players', value: 250 },
              { label: 'Total Purse', value: 960, suffix: ' Cr' },
              { label: 'April 5, 2026', value: 0, isDate: true },
            ].map((s, i) => (
              <div key={i} className="glass-card p-6 text-center">
                {s.isDate ? (
                  <div className="font-mono text-4xl md:text-5xl font-bold text-accent-orange text-glow-orange flex items-center justify-center gap-2">
                    <Calendar className="w-8 h-8" />
                  </div>
                ) : (
                  <AnimatedCounter target={s.value} suffix={s.suffix} />
                )}
                <div className="font-rajdhani text-sm text-muted-foreground mt-2 tracking-wider">{s.label}</div>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Features */}
      <section className="py-24 relative">
        <div className="container mx-auto px-4">
          <h2 className="section-title text-center mb-4">3 Interfaces, <span className="text-accent-cyan">1 Platform</span></h2>
          <p className="text-center text-muted-foreground mb-16 max-w-lg mx-auto">Complete auction management from a single web application</p>
          <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {features.map((f, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.15 }}
              >
                <Link to={f.link} className="glass-card p-8 block hover:border-accent-cyan/30 hover:-translate-y-1 transition-all duration-200 h-full">
                  <div className="mb-4">{f.icon}</div>
                  <h3 className="font-exo font-bold text-xl text-foreground mb-2">{f.title}</h3>
                  <p className="text-muted-foreground text-sm">{f.desc}</p>
                  <span className="inline-flex items-center gap-1 text-accent-cyan text-sm font-semibold mt-4">
                    Open <ChevronRight size={14} />
                  </span>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-24 relative">
        <div className="container mx-auto px-4">
          <h2 className="section-title text-center mb-16">How It <span className="text-accent-orange">Works</span></h2>
          <div className="grid md:grid-cols-4 gap-6 max-w-5xl mx-auto relative">
            <div className="hidden md:block absolute top-12 left-[12.5%] right-[12.5%] h-0.5 bg-gradient-to-r from-accent-cyan via-accent-orange to-accent-gold" />
            {steps.map((s, i) => (
              <motion.div
                key={i}
                className="text-center relative"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.2 }}
              >
                <div className="relative z-10 w-20 h-20 mx-auto mb-4 rounded-2xl glass-card flex items-center justify-center text-3xl border-accent-cyan/20">
                  {s.icon}
                </div>
                <h3 className="font-orbitron font-bold text-sm text-foreground mb-2">{s.title}</h3>
                <p className="text-muted-foreground text-sm">{s.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* About */}
      <section className="py-24 relative">
        <div className="container mx-auto px-4">
          <div className="glass-card p-8 md:p-12 max-w-4xl mx-auto">
            <h2 className="section-title mb-6">About <span className="text-accent-orange">BVRIT E-Cell</span></h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              BVRIT Hyderabad College of Engineering for Women, Narsapur, Medak District, Telangana — 502313.
              The Entrepreneurship Cell (E-Cell) fosters innovation and entrepreneurial spirit among students through events, workshops, and initiatives like the E-Summit.
            </p>
            <p className="text-muted-foreground leading-relaxed">
              The IPL Auction 2026 is a flagship event of E-Summit 2026, bringing the thrill of cricket strategy to campus with a fully digital, real-time auction platform.
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
              <span className="text-sm text-muted-foreground flex items-center gap-2">📧 ecell@bvrit.ac.in</span>
              <span className="text-sm text-muted-foreground flex items-center gap-2">📞 +91 8415 000 000</span>
              <span className="text-sm text-muted-foreground flex items-center gap-2">📍 Narsapur, Telangana</span>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-8">
        <div className="container mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
          <span className="font-orbitron text-xs">BVRIT <span className="text-accent-orange">E-CELL</span></span>
          <span>© 2026 BVRIT E-Cell | Virtual currency only. No real monetary value.</span>
          <span>@ecellbvrit</span>
        </div>
      </footer>
    </div>
  );
}
