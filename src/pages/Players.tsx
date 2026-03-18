import { useState, useMemo } from 'react';
import { useAuction } from '@/context/AuctionContext';
import PlayerCard from '@/components/PlayerCard';
import { PlayerRole, PlayerCategory } from '@/data/players';
import { Search } from 'lucide-react';

export default function Players() {
  const { players } = useAuction();
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState<PlayerRole | 'all'>('all');
  const [catFilter, setCatFilter] = useState<PlayerCategory | 'all'>('all');
  const [natFilter, setNatFilter] = useState<'all' | 'indian' | 'overseas'>('all');
  const [sortBy, setSortBy] = useState<'rating' | 'price' | 'name'>('rating');
  const [visible, setVisible] = useState(20);

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
      if (sortBy === 'rating') return b.rating - a.rating;
      if (sortBy === 'price') return b.basePrice - a.basePrice;
      return a.name.localeCompare(b.name);
    });
    return list;
  }, [players, search, roleFilter, catFilter, natFilter, sortBy]);

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

  return (
    <div className="min-h-screen bg-background pt-20 pb-12">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="section-title">Player Pool <span className="text-accent-cyan">2026</span></h1>
            <p className="text-muted-foreground text-sm mt-1">Showing {Math.min(visible, filtered.length)} of {filtered.length} players</p>
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
            onChange={e => { setSearch(e.target.value); setVisible(20); }}
            className="w-full bg-card border border-border rounded-xl pl-12 pr-4 py-3 text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-accent-cyan/40 transition-colors"
          />
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-4 mb-8">
          <div className="flex flex-wrap gap-1.5">
            {cats.map(c => (
              <button
                key={c.value}
                onClick={() => { setCatFilter(c.value); setVisible(20); }}
                className={`px-3 py-1.5 rounded-lg text-xs font-rajdhani font-semibold tracking-wider transition-all ${
                  catFilter === c.value
                    ? 'bg-accent-cyan text-background'
                    : 'bg-card text-muted-foreground hover:text-foreground border border-border'
                }`}
              >
                {c.label}
              </button>
            ))}
          </div>
          <div className="flex flex-wrap gap-1.5">
            {roles.map(r => (
              <button
                key={r.value}
                onClick={() => { setRoleFilter(r.value); setVisible(20); }}
                className={`px-3 py-1.5 rounded-lg text-xs font-rajdhani font-semibold tracking-wider transition-all ${
                  roleFilter === r.value
                    ? 'bg-accent-cyan text-background'
                    : 'bg-card text-muted-foreground hover:text-foreground border border-border'
                }`}
              >
                {r.label}
              </button>
            ))}
          </div>
          <div className="flex gap-1.5 ml-auto">
            {(['rating', 'price', 'name'] as const).map(s => (
              <button
                key={s}
                onClick={() => setSortBy(s)}
                className={`px-3 py-1.5 rounded-lg text-xs font-rajdhani font-semibold tracking-wider transition-all ${
                  sortBy === s
                    ? 'bg-accent-orange text-background'
                    : 'bg-card text-muted-foreground hover:text-foreground border border-border'
                }`}
              >
                {s.toUpperCase()}
              </button>
            ))}
          </div>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filtered.slice(0, visible).map(p => (
            <PlayerCard key={p.id} player={p} />
          ))}
        </div>

        {visible < filtered.length && (
          <div className="text-center mt-8">
            <button onClick={() => setVisible(v => v + 20)} className="btn-ghost">
              Load More ({filtered.length - visible} remaining)
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
