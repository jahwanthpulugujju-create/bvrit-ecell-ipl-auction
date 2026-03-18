import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion, useInView } from 'framer-motion';
import { ChevronRight, Users, Zap, Trophy, Calendar } from 'lucide-react';

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

  const timeline = [
    { label: 'Retention Window Opens', date: 'TBA' },
    { label: 'Player Pool Released', date: 'TBA' },
    { label: 'Strategy Session', date: 'TBA' },
    { label: 'Live Auction Day 1', date: '25 Mar 2026' },
    { label: 'Live Auction Day 2', date: '26 Mar 2026' },
    { label: 'Awards & Results', date: '26 Mar 2026' },
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
              <span className="font-rajdhani font-semibold text-accent-orange text-sm tracking-wider">E-SUMMIT 2026 • 25–26 MARCH</span>
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
            className="flex flex-col sm:flex-row gap-4 justify-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
          >
            <Link to="/players" className="btn-secondary glow-orange flex items-center gap-2 justify-center">
              View Players <ChevronRight size={18} />
            </Link>
            <Link to="/display" className="btn-ghost flex items-center gap-2 justify-center">
              📺 Open Display
            </Link>
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

      {/* Event Timeline */}
      <section className="py-24 relative">
        <div className="container mx-auto px-4 max-w-2xl">
          <h2 className="section-title text-center mb-16">Event <span className="text-accent-cyan">Timeline</span></h2>
          <div className="relative">
            <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-accent-cyan/20" />
            {timeline.map((item, i) => (
              <motion.div
                key={i}
                className="relative pl-12 pb-8 last:pb-0"
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
              >
                <div className="absolute left-2.5 top-1 w-3 h-3 rounded-full bg-accent-cyan border-2 border-background" />
                <div className="glass-card p-4">
                  <h4 className="font-exo font-semibold text-foreground text-sm">{item.label}</h4>
                  <p className="font-mono text-xs text-accent-cyan mt-1">{item.date}</p>
                </div>
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
              B. V. Raju Institute of Technology, Narsapur, Medak District, Telangana.
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
          <span>© 2026 BVRIT E-Cell | E-Summit 2026 | Virtual currency only. No real monetary value.</span>
          <span>@ecellbvrit</span>
        </div>
      </footer>
    </div>
  );
}
