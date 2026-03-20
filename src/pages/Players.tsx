import { useState, useMemo, useEffect } from 'react';
import { useAuction } from '@/context/AuctionContext';
import PlayerCard from '@/components/PlayerCard';
import { PlayerRole, PlayerCategory } from '@/data/players';
import { Search, Lock } from 'lucide-react';
import { Link } from 'react-router-dom';

const PAGE_SIZE = 24;

export default function Players() {
  const isAdmin = sessionStorage.getItem('admin_auth') === '1';

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="glass-card p-10 max-w-sm w-full text-center">
          <Lock size={36} className="text-muted-foreground mx-auto mb-4" />
          <h1 className="font-orbitron text-xl text-foreground mb-2">Restricted</h1>
          <p className="text-muted-foreground text-sm mb-6">The player pool is only accessible to the admin. Please use the admin panel to view all players.</p>
          <Link to="/admin" className="btn-primary w-full block text-center">Go to Admin</Link>
        </div>
      </div>
    );
  }

  return <PlayersContent />;
}

function PlayersContent() {
  const { players } = useAuction();
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState<PlayerRole | 'all'>('all');
  const [catFilter, setCatFilter] = useState<PlayerCategory | 'all'>('all');
  const [natFilter, setNatFilter] = useState<'all' | 'indian' | 'overseas'>('all');
  const [sortBy, setSortBy] = useState<'role_order' | 'rating' | 'price' | 'name'>('role_order');
  const [visible, setVisible] = useState(PAGE_SIZE);

  useEffect(() => {
    setVisible(PAGE_SIZE);
  }, [search, roleFilter, catFilter, natFilter, sortBy]);

  const roleOrder: Record<string, number> = {
    batsman: 0,
    'fast-bowler': 1,
    spinner: 1,
    'all-rounder': 2,
    'wicket-keeper': 3,
  };

  const filtered = useMemo(() => {
    let list = players;
    if (search) {
      const q = search.toLowerCase();
      list = list.filter(p => p.name.toLowerCase().includes(q));
    }
    if (roleFilter !== 'all') list = list.filter(p => p.role === roleFilter);
    if (catFilter !== 'all') list = list.filter(p => p.category === catFilter);
    if (natFilter !== 'all') list = list.filter(p => p.nationality === natFilter);

    list = [...list].sort((a, b) => {
      if (sortBy === 'role_order') {
        const ra = roleOrder[a.role] ?? 99;
        const rb = roleOrder[b.role] ?? 99;
        return ra - rb;
      }
      if (sortBy === 'rating') return b.rating - a.rating;
      if (sortBy === 'price') return b.basePrice - a.basePrice;
      return a.name.localeCompare(b.name);
    });
    return list;
  }, [players, search, roleFilter, catFilter, natFilter, sortBy]);

  const roleCounts = useMemo(() => {
    const counts: Record<string, number> = { all: players.length };
    players.forEach(p => { counts[p.role] = (counts[p.role] || 0) + 1; });
    return counts;
  }, [players]);

  const catCounts = useMemo(() => {
    const counts: Record<string, number> = { all: players.length };
    players.forEach(p => { counts[p.category] = (counts[p.category] || 0) + 1; });
    return counts;
  }, [players]);

  const roles: { value: PlayerRole | 'all'; label: string }[] = [
    { value: 'all', label: 'ALL' },
    { value: 'batsman', label: '🏏 BAT' },
    { value: 'fast-bowler', label: '⚡ PACE' },
    { value: 'spinner', label: '🌀 SPIN' },
    { value: 'wicket-keeper', label: '🧤 WK' },
    { value: 'all-rounder', label: '🔄 AR' },
  ];

  const cats: { value: PlayerCategory | 'all'; label: string }[] = [
    { value: 'all', label: 'ALL' },
    { value: 'marquee', label: 'MARQUEE' },
    { value: 'premium', label: 'PREMIUM' },
    { value: 'mid-tier', label: 'MID-TIER' },
    { value: 'budget', label: 'BUDGET' },
  ];

  const visibleCount = Math.min(visible, filtered.length);
  const hasMore = visible < filtered.length;

  return (
    <div className="min-h-screen bg-background pt-20 pb-12">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="section-title">Player Pool <span className="text-accent-cyan">2026</span></h1>
            <p className="text-muted-foreground text-sm mt-1">
              Admin view — {visibleCount} of {filtered.length} players
              {filtered.length !== players.length && ` (filtered from ${players.length} total)`}
            </p>
          </div>
          <span className="font-mono text-sm bg-accent-cyan/10 text-accent-cyan px-3 py-1.5 rounded-full border border-accent-cyan/20">
            {players.length} TOTAL
          </span>
        </div>

        {/* Search */}
        <div className="relative mb-6">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search players by name..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full bg-card border border-border rounded-xl pl-12 pr-4 py-3 text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-accent-cyan/40 transition-colors"
          />
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-4 mb-8">
          <div className="flex flex-wrap gap-1.5">
            {cats.map(c => (
              <button
                key={c.value}
                onClick={() => setCatFilter(c.value)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-rajdhani font-semibold tracking-wider transition-all ${
                  catFilter === c.value
                    ? 'bg-accent-cyan text-background'
                    : 'bg-card text-muted-foreground hover:text-foreground border border-border'
                }`}
              >
                {c.label}
                <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded-full ${catFilter === c.value ? 'bg-black/20' : 'bg-muted/60'}`}>
                  {catCounts[c.value] ?? 0}
                </span>
              </button>
            ))}
          </div>
          <div className="flex flex-wrap gap-1.5">
            {roles.map(r => (
              <button
                key={r.value}
                onClick={() => setRoleFilter(r.value)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-rajdhani font-semibold tracking-wider transition-all ${
                  roleFilter === r.value
                    ? 'bg-accent-cyan text-background'
                    : 'bg-card text-muted-foreground hover:text-foreground border border-border'
                }`}
              >
                {r.label}
                <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded-full ${roleFilter === r.value ? 'bg-black/20' : 'bg-muted/60'}`}>
                  {roleCounts[r.value] ?? 0}
                </span>
              </button>
            ))}
          </div>
          <div className="flex gap-1.5 ml-auto">
            {([
              { value: 'role_order', label: 'ORDER' },
              { value: 'rating', label: 'RATING' },
              { value: 'price', label: 'PRICE' },
              { value: 'name', label: 'NAME' },
            ] as const).map(s => (
              <button
                key={s.value}
                onClick={() => setSortBy(s.value)}
                className={`px-3 py-1.5 rounded-lg text-xs font-rajdhani font-semibold tracking-wider transition-all ${
                  sortBy === s.value
                    ? 'bg-accent-orange text-background'
                    : 'bg-card text-muted-foreground hover:text-foreground border border-border'
                }`}
              >
                {s.label}
              </button>
            ))}
          </div>
        </div>

        {/* Nationality quick filter */}
        <div className="flex gap-1.5 mb-6">
          {(['all', 'indian', 'overseas'] as const).map(n => (
            <button
              key={n}
              onClick={() => setNatFilter(n)}
              className={`px-3 py-1 rounded-lg text-xs font-rajdhani font-semibold tracking-wider transition-all ${
                natFilter === n
                  ? 'bg-accent-purple text-background'
                  : 'bg-card text-muted-foreground hover:text-foreground border border-border'
              }`}
            >
              {n === 'all' ? '🌐 ALL' : n === 'indian' ? '🇮🇳 INDIAN' : '✈️ OVERSEAS'}
              <span className={`ml-1.5 text-[10px] font-mono px-1 py-0.5 rounded-full ${natFilter === n ? 'bg-black/20' : 'bg-muted/60'}`}>
                {n === 'all' ? players.length : players.filter(p => p.nationality === n).length}
              </span>
            </button>
          ))}
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filtered.slice(0, visible).map(p => (
            <PlayerCard key={p.id} player={p} />
          ))}
        </div>

        {filtered.length === 0 && (
          <div className="text-center py-16 text-muted-foreground">
            <div className="text-4xl mb-3">🔍</div>
            <p>No players match your filters</p>
          </div>
        )}

        {hasMore && (
          <div className="text-center mt-8 space-y-2">
            <button onClick={() => setVisible(v => v + PAGE_SIZE)} className="btn-ghost">
              Load More ({filtered.length - visible} remaining)
            </button>
            <div className="text-xs text-muted-foreground">
              {visibleCount} / {filtered.length} shown
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
