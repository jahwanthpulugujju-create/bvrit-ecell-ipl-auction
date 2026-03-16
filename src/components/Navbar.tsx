import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, Tv } from 'lucide-react';

const navLinks = [
  { to: '/', label: 'Home' },
  { to: '/players', label: 'Players' },
  { to: '/teams', label: 'Teams' },
  { to: '/admin', label: 'Admin' },
];

function CountdownTimer() {
  const target = new Date('2026-04-05T10:00:00+05:30').getTime();
  const [diff, setDiff] = useState(target - Date.now());

  useEffect(() => {
    const i = setInterval(() => setDiff(target - Date.now()), 1000);
    return () => clearInterval(i);
  }, [target]);

  if (diff <= 0) return <span className="font-mono text-accent-orange text-sm">LIVE NOW</span>;
  const d = Math.floor(diff / 86400000);
  const h = Math.floor((diff % 86400000) / 3600000);
  const m = Math.floor((diff % 3600000) / 60000);
  const s = Math.floor((diff % 60000) / 1000);

  return (
    <span className="font-mono text-xs tracking-wider text-accent-cyan bg-accent-cyan/10 px-3 py-1.5 rounded-full border border-accent-cyan/20">
      {d}d {String(h).padStart(2,'0')}:{String(m).padStart(2,'0')}:{String(s).padStart(2,'0')}
    </span>
  );
}

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const location = useLocation();

  // Hide navbar on display page
  if (location.pathname === '/display') return null;

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 glass-navbar">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <span className="font-orbitron font-bold text-lg text-foreground">
            BVRIT <span className="text-accent-orange">E-CELL</span>
          </span>
          <span className="hidden sm:inline text-[10px] font-rajdhani font-semibold bg-accent-orange/20 text-accent-orange px-2 py-0.5 rounded-full border border-accent-orange/30 tracking-wider">
            E-SUMMIT 2026
          </span>
        </Link>

        <div className="hidden md:flex items-center gap-1">
          {navLinks.map(l => (
            <Link
              key={l.to}
              to={l.to}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                location.pathname === l.to
                  ? 'text-accent-cyan bg-accent-cyan/10'
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
              }`}
            >
              {l.label}
            </Link>
          ))}
        </div>

        <div className="flex items-center gap-3">
          <CountdownTimer />
          <Link
            to="/display"
            className="hidden md:flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-accent-cyan transition-colors"
          >
            <Tv size={14} />
            Display
          </Link>
          <button className="md:hidden text-foreground" onClick={() => setOpen(!open)}>
            {open ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {open && (
        <div className="md:hidden glass-card mx-4 mb-4 p-4 flex flex-col gap-2">
          {navLinks.map(l => (
            <Link
              key={l.to}
              to={l.to}
              onClick={() => setOpen(false)}
              className={`px-4 py-3 rounded-lg text-sm font-medium ${
                location.pathname === l.to ? 'text-accent-cyan bg-accent-cyan/10' : 'text-muted-foreground'
              }`}
            >
              {l.label}
            </Link>
          ))}
          <Link to="/display" onClick={() => setOpen(false)} className="px-4 py-3 rounded-lg text-sm text-muted-foreground flex items-center gap-2">
            <Tv size={14} /> Projector Display
          </Link>
        </div>
      )}
    </nav>
  );
}
