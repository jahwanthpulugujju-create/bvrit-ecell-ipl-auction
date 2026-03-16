import { useState, useMemo } from 'react';
import { useAuction, formatPrice } from '@/context/AuctionContext';
import AuctionTimer, { TimerBar } from '@/components/AuctionTimer';
import PlayerCard from '@/components/PlayerCard';
import { roleEmojis } from '@/data/players';
import { Search, Play, Pause, RotateCcw, Hammer, X, Undo2, Users, Settings, BarChart3, Eye } from 'lucide-react';

export default function Admin() {
  const [authed, setAuthed] = useState(() => sessionStorage.getItem('admin_auth') === '1');
  const [pw, setPw] = useState('');
  const [pwError, setPwError] = useState(false);
  const [activeTab, setActiveTab] = useState('auction');

  if (!authed) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="glass-card p-8 w-full max-w-sm text-center">
          <h1 className="font-orbitron text-2xl text-foreground mb-2">Admin Access</h1>
          <p className="text-muted-foreground text-sm mb-6">Enter the auctioneer password</p>
          <input
            type="password"
            value={pw}
            onChange={e => { setPw(e.target.value); setPwError(false); }}
            onKeyDown={e => {
              if (e.key === 'Enter') {
                if (pw === 'BVRIT2026') {
                  sessionStorage.setItem('admin_auth', '1');
                  setAuthed(true);
                } else {
                  setPwError(true);
                }
              }
            }}
            placeholder="Password"
            className={`w-full bg-card border rounded-lg px-4 py-3 text-foreground placeholder:text-muted-foreground focus:outline-none mb-4 ${
              pwError ? 'border-accent-crimson animate-[shake_0.3s_ease-in-out] focus:border-accent-crimson' : 'border-border focus:border-accent-cyan/40'
            }`}
          />
          {pwError && <p className="text-accent-crimson text-xs mb-4">Incorrect password</p>}
          <button
            onClick={() => {
              if (pw === 'BVRIT2026') {
                sessionStorage.setItem('admin_auth', '1');
                setAuthed(true);
              } else {
                setPwError(true);
              }
            }}
            className="btn-primary w-full"
          >
            Unlock
          </button>
        </div>
      </div>
    );
  }

  const tabs = [
    { id: 'auction', label: 'Auction Control', icon: <Hammer size={16} /> },
    { id: 'players', label: 'Players', icon: <Users size={16} /> },
    { id: 'teams', label: 'Teams', icon: <BarChart3 size={16} /> },
    { id: 'monitor', label: 'Monitor', icon: <Eye size={16} /> },
  ];

  return (
    <div className="min-h-screen bg-background pt-16">
      {/* Tab bar */}
      <div className="glass-navbar sticky top-16 z-40">
        <div className="container mx-auto px-4 flex gap-1 overflow-x-auto py-2">
          {tabs.map(t => (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                activeTab === t.id ? 'bg-accent-cyan/10 text-accent-cyan' : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              {t.icon} {t.label}
            </button>
          ))}
        </div>
      </div>

      <div className="container mx-auto px-4 py-6">
        {activeTab === 'auction' && <AuctionControl />}
        {activeTab === 'players' && <PlayerManagement />}
        {activeTab === 'teams' && <TeamManagement />}
        {activeTab === 'monitor' && <LiveMonitor />}
      </div>
    </div>
  );
}

function AuctionControl() {
  const { state, dispatch, getPlayer, formatPrice } = useAuction();
  const currentPlayer = state.currentPlayerId ? getPlayer(state.currentPlayerId) : null;
  const leadingTeam = state.leadingTeamId ? state.teams.find(t => t.id === state.leadingTeamId) : null;
  const [search, setSearch] = useState('');
  const [showSold, setShowSold] = useState(false);

  const availablePlayers = state.players.filter(p =>
    p.status === 'available' && p.name.toLowerCase().includes(search.toLowerCase())
  ).slice(0, 10);

  const increments = [
    { label: '₹5L', value: 5 },
    { label: '₹10L', value: 10 },
    { label: '₹25L', value: 25 },
    { label: '₹50L', value: 50 },
    { label: '₹1Cr', value: 100 },
  ];

  return (
    <div className="space-y-6">
      {/* Status bar */}
      <div className="glass-card p-4 flex flex-wrap items-center gap-4">
        <div className="flex items-center gap-2">
          <span className={`w-2.5 h-2.5 rounded-full ${state.status === 'live' ? 'bg-accent-emerald animate-pulse' : 'bg-muted-foreground'}`} />
          <span className="font-rajdhani font-bold text-sm text-foreground tracking-wider">{state.status.toUpperCase()}</span>
        </div>
        <span className="font-mono text-sm text-muted-foreground">Sold: {state.soldCount}</span>
        <span className="font-mono text-sm text-muted-foreground">Value: {formatPrice(state.totalValue)}</span>
        <span className="font-mono text-sm text-muted-foreground">Phase: {state.currentPhase.toUpperCase()}</span>
        <div className="ml-auto flex gap-2">
          {(['pre', 'live', 'complete'] as const).map(s => (
            <button
              key={s}
              onClick={() => dispatch({ type: 'SET_STATUS', status: s })}
              className={`px-3 py-1 rounded text-xs font-rajdhani font-semibold ${
                state.status === s ? 'bg-accent-cyan text-background' : 'bg-card text-muted-foreground border border-border'
              }`}
            >
              {s.toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Current player + bidding */}
        <div className="lg:col-span-2 space-y-4">
          {currentPlayer ? (
            <>
              <div className="glass-card p-6">
                <div className="flex items-start gap-4 mb-6">
                  <img src={currentPlayer.photo} alt={currentPlayer.name} className="w-20 h-20 rounded-xl border-2 border-accent-cyan/30" />
                  <div>
                    <h2 className="font-exo font-bold text-2xl text-foreground">{currentPlayer.name}</h2>
                    <span className={`text-xs font-rajdhani font-bold px-2 py-0.5 rounded-full role-${currentPlayer.role}`}>
                      {roleEmojis[currentPlayer.role]} {currentPlayer.role.replace('-', ' ').toUpperCase()}
                    </span>
                    <div className="font-mono text-sm text-muted-foreground mt-1">Base: {formatPrice(currentPlayer.basePrice)}</div>
                  </div>
                </div>

                <div className="text-center mb-6">
                  <div className="text-xs font-rajdhani text-muted-foreground tracking-wider mb-1">CURRENT BID</div>
                  <div className="font-mono text-5xl font-bold text-accent-cyan text-glow-cyan mb-2">{formatPrice(state.currentBid)}</div>
                  {leadingTeam && <div className="font-exo text-lg" style={{ color: leadingTeam.color }}>{leadingTeam.name}</div>}
                </div>

                <div className="text-center mb-6">
                  <AuctionTimer seconds={state.timerSeconds} />
                  <TimerBar seconds={state.timerSeconds} max={15} />
                </div>

                {/* Timer controls */}
                <div className="flex justify-center gap-2 mb-6">
                  <button onClick={() => dispatch({ type: 'START_TIMER' })} className="btn-primary flex items-center gap-1.5 text-sm py-2 px-4">
                    <Play size={14} /> Start
                  </button>
                  <button onClick={() => dispatch({ type: 'PAUSE_TIMER' })} className="btn-ghost flex items-center gap-1.5 text-sm py-2 px-4">
                    <Pause size={14} /> Pause
                  </button>
                  <button onClick={() => dispatch({ type: 'RESET_TIMER', seconds: 15 })} className="btn-ghost flex items-center gap-1.5 text-sm py-2 px-4">
                    <RotateCcw size={14} /> Reset
                  </button>
                </div>

                {/* Bid increment */}
                <div className="mb-4">
                  <div className="text-xs font-rajdhani text-muted-foreground tracking-wider mb-2">BID INCREMENT</div>
                  <div className="flex gap-2">
                    {increments.map(inc => (
                      <button
                        key={inc.value}
                        onClick={() => dispatch({ type: 'SET_INCREMENT', increment: inc.value })}
                        className={`px-3 py-1.5 rounded text-xs font-mono font-semibold transition-all ${
                          state.bidIncrement === inc.value ? 'bg-accent-cyan text-background' : 'bg-card text-muted-foreground border border-border'
                        }`}
                      >
                        {inc.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Team bid buttons */}
                <div className="mb-4">
                  <div className="text-xs font-rajdhani text-muted-foreground tracking-wider mb-2">WHO RAISED THE PLACARD?</div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                    {state.teams.map(t => {
                      const canAfford = t.purse >= (state.leadingTeamId ? state.currentBid + state.bidIncrement : state.currentBid);
                      return (
                        <button
                          key={t.id}
                          onClick={() => canAfford && dispatch({ type: 'PLACE_BID', teamId: t.id })}
                          disabled={!canAfford || t.id === state.leadingTeamId}
                          className={`p-3 rounded-lg text-sm font-semibold transition-all border-2 ${
                            t.id === state.leadingTeamId
                              ? 'border-accent-emerald bg-accent-emerald/10 text-accent-emerald'
                              : canAfford
                                ? 'border-border bg-card text-foreground hover:border-accent-cyan/50 hover:-translate-y-0.5'
                                : 'border-border bg-card/50 text-muted-foreground opacity-50 cursor-not-allowed'
                          }`}
                          style={canAfford ? { borderColor: t.id === state.leadingTeamId ? undefined : t.color + '40' } : {}}
                        >
                          <div className="truncate">{t.name}</div>
                          <div className="font-mono text-xs mt-1 text-muted-foreground">{formatPrice(t.purse)}</div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Action buttons */}
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      if (state.leadingTeamId && window.confirm(`Sell ${currentPlayer.name} to ${leadingTeam?.name} for ${formatPrice(state.currentBid)}?`)) {
                        dispatch({ type: 'SELL_PLAYER' });
                        setShowSold(true);
                        setTimeout(() => setShowSold(false), 3000);
                      }
                    }}
                    disabled={!state.leadingTeamId}
                    className="btn-gold flex items-center gap-1.5 flex-1 justify-center disabled:opacity-50"
                  >
                    <Hammer size={16} /> SELL
                  </button>
                  <button
                    onClick={() => {
                      if (window.confirm(`Mark ${currentPlayer.name} as unsold?`)) {
                        dispatch({ type: 'MARK_UNSOLD' });
                      }
                    }}
                    className="btn-crimson flex items-center gap-1.5 flex-1 justify-center"
                  >
                    <X size={16} /> UNSOLD
                  </button>
                </div>
              </div>
            </>
          ) : (
            <div className="glass-card p-8 text-center">
              <h2 className="font-orbitron text-xl text-foreground mb-4">Select a Player</h2>
              <p className="text-muted-foreground text-sm">Search and select a player to start the auction</p>
            </div>
          )}

          {/* Player selector */}
          <div className="glass-card p-4">
            <div className="text-xs font-rajdhani text-muted-foreground tracking-wider mb-2">SET CURRENT PLAYER</div>
            <div className="relative mb-3">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="text"
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search available players..."
                className="w-full bg-card border border-border rounded-lg pl-10 pr-4 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-accent-cyan/40"
              />
            </div>
            <div className="space-y-1 max-h-60 overflow-auto">
              {availablePlayers.map(p => (
                <button
                  key={p.id}
                  onClick={() => dispatch({ type: 'SET_CURRENT_PLAYER', playerId: p.id })}
                  className="w-full flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50 transition-colors text-left"
                >
                  <img src={p.photo} alt={p.name} className="w-8 h-8 rounded-lg border border-border" loading="lazy" />
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-foreground truncate">{p.name}</div>
                    <span className={`text-[10px] font-rajdhani role-${p.role} px-1.5 py-0.5 rounded`}>
                      {roleEmojis[p.role]} {p.role.replace('-', ' ').toUpperCase()}
                    </span>
                  </div>
                  <span className="font-mono text-xs text-accent-cyan">{formatPrice(p.basePrice)}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right: Auction log */}
        <div className="space-y-4">
          <div className="glass-card p-4">
            <h3 className="font-exo font-semibold text-foreground text-sm mb-3">Auction Log</h3>
            <div className="space-y-2 max-h-[600px] overflow-auto">
              {state.auctionLog.slice(0, 50).map((log, i) => (
                <div key={i} className={`p-2 rounded-lg text-xs ${
                  log.type === 'sold' ? 'bg-accent-gold/10 border border-accent-gold/20' :
                  log.type === 'unsold' ? 'bg-accent-crimson/10 border border-accent-crimson/20' :
                  'bg-card border border-border'
                }`}>
                  <div className="text-foreground">{log.message}</div>
                  <div className="text-muted-foreground mt-0.5">{new Date(log.timestamp).toLocaleTimeString()}</div>
                </div>
              ))}
              {state.auctionLog.length === 0 && <p className="text-muted-foreground text-xs text-center py-4">No activity yet</p>}
            </div>
          </div>
        </div>
      </div>

      {/* SOLD overlay */}
      {showSold && (
        <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-md flex items-center justify-center">
          <div className="text-center animate-sold-stamp">
            <div className="font-orbitron text-6xl font-black text-accent-gold text-glow-gold border-4 border-accent-gold px-8 py-4 -rotate-12">
              SOLD!
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function PlayerManagement() {
  const { state, formatPrice } = useAuction();
  const [search, setSearch] = useState('');

  const filtered = state.players.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase())
  );

  const statusCounts = {
    available: state.players.filter(p => p.status === 'available').length,
    sold: state.players.filter(p => p.status === 'sold').length,
    unsold: state.players.filter(p => p.status === 'unsold').length,
    retained: state.players.filter(p => p.status === 'retained').length,
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="font-exo font-bold text-xl text-foreground">Player Management</h2>
          <p className="text-xs text-muted-foreground">
            {state.players.length} players · {statusCounts.sold} sold · {statusCounts.unsold} unsold · {statusCounts.available} available
          </p>
        </div>
      </div>

      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <input
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search players..."
          className="w-full bg-card border border-border rounded-lg pl-10 pr-4 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-accent-cyan/40"
        />
      </div>

      <div className="glass-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left p-3 text-xs font-rajdhani text-muted-foreground">#</th>
                <th className="text-left p-3 text-xs font-rajdhani text-muted-foreground">PLAYER</th>
                <th className="text-left p-3 text-xs font-rajdhani text-muted-foreground">ROLE</th>
                <th className="text-left p-3 text-xs font-rajdhani text-muted-foreground">CATEGORY</th>
                <th className="text-right p-3 text-xs font-rajdhani text-muted-foreground">BASE PRICE</th>
                <th className="text-right p-3 text-xs font-rajdhani text-muted-foreground">RATING</th>
                <th className="text-center p-3 text-xs font-rajdhani text-muted-foreground">STATUS</th>
              </tr>
            </thead>
            <tbody>
              {filtered.slice(0, 50).map((p, i) => {
                const team = p.soldToTeamId ? state.teams.find(t => t.id === p.soldToTeamId) : null;
                return (
                  <tr key={p.id} className="border-b border-border/50 hover:bg-muted/30 transition-colors">
                    <td className="p-3 text-xs font-mono text-muted-foreground">{i + 1}</td>
                    <td className="p-3">
                      <div className="flex items-center gap-2">
                        <img src={p.photo} alt={p.name} className="w-8 h-8 rounded-lg border border-border" loading="lazy" />
                        <span className="text-sm text-foreground font-medium">{p.name}</span>
                      </div>
                    </td>
                    <td className="p-3">
                      <span className={`text-[10px] font-rajdhani font-bold px-2 py-0.5 rounded-full role-${p.role}`}>
                        {roleEmojis[p.role]} {p.role.replace('-', ' ').toUpperCase()}
                      </span>
                    </td>
                    <td className="p-3 text-xs font-rajdhani text-muted-foreground">{p.category.toUpperCase()}</td>
                    <td className="p-3 text-right font-mono text-xs text-accent-cyan">{formatPrice(p.basePrice)}</td>
                    <td className="p-3 text-right font-mono text-xs text-accent-gold">{p.rating.toFixed(1)}</td>
                    <td className="p-3 text-center">
                      <span className={`text-[10px] font-rajdhani font-bold px-2 py-0.5 rounded-full border status-${p.status}`}>
                        {p.status.toUpperCase()}
                        {team && ` (${team.name})`}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function TeamManagement() {
  const { state, formatPrice } = useAuction();

  return (
    <div>
      <h2 className="font-exo font-bold text-xl text-foreground mb-6">Team Management</h2>
      <div className="grid md:grid-cols-2 gap-4">
        {state.teams.map(t => {
          const pct = (t.purse / 12000) * 100;
          const teamPlayers = t.players.map(id => state.players.find(p => p.id === id)).filter(Boolean);
          return (
            <div key={t.id} className="glass-card p-6" style={{ borderLeftColor: t.color, borderLeftWidth: 4 }}>
              <h3 className="font-exo font-bold text-lg text-foreground mb-1">{t.name}</h3>
              <p className="text-xs text-muted-foreground mb-4">{t.city}</p>

              <div className="flex items-baseline justify-between mb-2">
                <span className="text-xs text-muted-foreground">Purse</span>
                <span className={`font-mono font-bold ${pct > 60 ? 'text-accent-emerald' : pct > 20 ? 'text-accent-gold' : 'text-accent-crimson'}`}>
                  {formatPrice(t.purse)} / {formatPrice(12000)}
                </span>
              </div>
              <div className="w-full h-2 bg-muted rounded-full overflow-hidden mb-4">
                <div className={`h-full rounded-full ${pct > 60 ? 'bg-accent-emerald' : pct > 20 ? 'bg-accent-gold' : 'bg-accent-crimson'}`} style={{ width: `${pct}%` }} />
              </div>

              <div className="grid grid-cols-5 gap-2 mb-4">
                {Object.entries(t.roleCounts).map(([role, count]) => (
                  <div key={role} className="text-center">
                    <div className="text-lg">{roleEmojis[role as keyof typeof roleEmojis]}</div>
                    <div className="font-mono text-xs text-foreground">{count}</div>
                  </div>
                ))}
              </div>

              <div className="text-xs text-muted-foreground">
                {teamPlayers.length} players • {t.rtmRemaining} RTM cards
              </div>

              {teamPlayers.length > 0 && (
                <div className="mt-3 space-y-1">
                  {teamPlayers.map(p => p && (
                    <div key={p.id} className="flex items-center justify-between text-xs py-1 border-t border-border/30">
                      <span className="text-foreground">{p.name}</span>
                      <span className="font-mono text-accent-gold">{formatPrice(p.soldPrice || 0)}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function LiveMonitor() {
  const { state, formatPrice } = useAuction();

  return (
    <div>
      <h2 className="font-exo font-bold text-xl text-foreground mb-6">Live Monitor</h2>

      {/* Team grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
        {state.teams.map(t => {
          const pct = (t.purse / 12000) * 100;
          return (
            <div key={t.id} className="glass-card p-4" style={{ borderTopColor: t.color, borderTopWidth: 2 }}>
              <div className="font-exo font-semibold text-sm text-foreground truncate mb-2">{t.name}</div>
              <div className={`font-mono text-lg font-bold ${pct > 60 ? 'text-accent-emerald' : pct > 20 ? 'text-accent-gold' : 'text-accent-crimson'}`}>
                {formatPrice(t.purse)}
              </div>
              <div className="w-full h-1.5 bg-muted rounded-full mt-2 overflow-hidden">
                <div className={`h-full rounded-full ${pct > 60 ? 'bg-accent-emerald' : pct > 20 ? 'bg-accent-gold' : 'bg-accent-crimson'}`} style={{ width: `${pct}%` }} />
              </div>
              <div className="text-[10px] text-muted-foreground mt-1">{t.players.length} players</div>
            </div>
          );
        })}
      </div>

      {/* Full auction log */}
      <div className="glass-card p-4">
        <h3 className="font-exo font-semibold text-foreground text-sm mb-3">Full Auction Log</h3>
        <div className="space-y-2 max-h-[500px] overflow-auto">
          {state.auctionLog.map((log, i) => (
            <div key={i} className={`p-3 rounded-lg text-sm ${
              log.type === 'sold' ? 'bg-accent-gold/10 border border-accent-gold/20' :
              log.type === 'unsold' ? 'bg-accent-crimson/10 border border-accent-crimson/20' :
              'bg-card border border-border'
            }`}>
              <div className="text-foreground">{log.message}</div>
              <div className="text-xs text-muted-foreground mt-1">{new Date(log.timestamp).toLocaleString()}</div>
            </div>
          ))}
          {state.auctionLog.length === 0 && <p className="text-muted-foreground text-sm text-center py-8">No activity yet</p>}
        </div>
      </div>
    </div>
  );
}
