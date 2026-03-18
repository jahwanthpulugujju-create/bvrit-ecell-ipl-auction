import { useState, useEffect, useRef, useMemo } from 'react';
import { useAuction, formatPrice } from '@/context/AuctionContext';
import { roleEmojis, Player } from '@/data/players';
import AuctionTimer from '@/components/AuctionTimer';
import ConnectionStatus from '@/components/ConnectionStatus';
import { supabase } from '@/lib/supabase';

function useLocalTimer(timerExpiresAt: number | null, timerRunning: boolean): number {
  const [seconds, setSeconds] = useState(15);
  useEffect(() => {
    const tick = () => {
      if (timerExpiresAt) setSeconds(Math.max(0, Math.floor((timerExpiresAt - Date.now()) / 1000)));
      else setSeconds(15);
    };
    tick();
    const iv = setInterval(tick, 500);
    return () => clearInterval(iv);
  }, [timerExpiresAt, timerRunning]);
  return seconds;
}

function SoldTicker({ soldPlayers, teams }: { soldPlayers: Player[]; teams: { id: string; name: string; color: string }[] }) {
  const entries = soldPlayers.filter(p => p.soldToTeamId).map(p => {
    const t = teams.find(tm => tm.id === p.soldToTeamId);
    return { name: p.name, teamName: t?.name || '', teamColor: t?.color || '#fff', price: p.soldPrice || 0 };
  });

  if (entries.length === 0) return null;

  const doubled = [...entries, ...entries];

  return (
    <div className="bg-background/80 border-t border-border h-10 flex items-center overflow-hidden relative">
      <div className="flex-shrink-0 px-3 text-xs font-rajdhani font-bold text-accent-gold tracking-widest border-r border-border h-full flex items-center">SOLD ▸</div>
      <div className="flex-1 overflow-hidden">
        <div className="flex whitespace-nowrap animate-marquee">
          {doubled.map((e, i) => (
            <span key={i} className="inline-flex items-center gap-1.5 px-4 text-xs font-rajdhani">
              <span className="inline-block w-2 h-2 rounded-full flex-shrink-0" style={{ background: e.teamColor }} />
              <span className="text-foreground">{e.name}</span>
              <span className="text-muted-foreground">→</span>
              <span style={{ color: e.teamColor }}>{e.teamName}</span>
              <span className="text-accent-gold font-mono">₹{(e.price / 100).toFixed(1)} Cr</span>
              <span className="text-border mx-2">·</span>
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

function TeamBudgetsPanel() {
  const { teams, auctionState, freezes, players } = useAuction();
  const [teamFreezeRemaining, setTeamFreezeRemaining] = useState<Record<string, number>>({});

  useEffect(() => {
    const iv = setInterval(() => {
      const updated: Record<string, number> = {};
      const currentPlayerId = auctionState?.current_player_id;
      if (!currentPlayerId) return;
      freezes.forEach(f => {
        if (f.player_id !== currentPlayerId) return;
        const rem = Math.max(0, f.freeze_expires_at - Date.now());
        if (rem > 0) updated[f.team_id] = rem;
      });
      setTeamFreezeRemaining(updated);
    }, 500);
    return () => clearInterval(iv);
  }, [freezes, auctionState?.current_player_id]);

  const sortedTeams = [...teams]
    .filter(t => t.is_active)
    .sort((a, b) => b.purse - a.purse);

  return (
    <div className="flex-1 overflow-auto p-3 space-y-2">
      <div className="text-[10px] font-rajdhani text-muted-foreground tracking-widest mb-2">TEAM BUDGETS</div>
      {sortedTeams.map(team => {
        const isLeading = team.id === auctionState?.leading_team_id;
        const freezeMs = teamFreezeRemaining[team.id];
        const pct = team.initial_purse > 0 ? (team.purse / team.initial_purse) * 100 : 0;
        const barColor = pct > 60 ? '#00ff88' : pct > 20 ? '#ffd700' : '#ff3b3b';
        const squadSize = players.filter(p => p.soldToTeamId === team.id).length;

        return (
          <div key={team.id} className={`rounded-lg p-2 border transition-all ${isLeading ? 'border-accent-emerald bg-accent-emerald/5' : 'border-border bg-card/50'}`}>
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-2">
                <div className="w-2 h-4 rounded-sm flex-shrink-0" style={{ background: team.color }} />
                <span className={`text-xs font-exo font-semibold truncate ${isLeading ? 'text-accent-emerald' : 'text-foreground'}`}>
                  {team.name}
                </span>
                {isLeading && <span className="text-[9px] bg-accent-emerald/20 text-accent-emerald px-1.5 py-0.5 rounded font-rajdhani font-bold">LEADING</span>}
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                {freezeMs && freezeMs > 0 && (
                  <span className="text-[10px] text-accent-gold font-mono">🔒{Math.ceil(freezeMs / 1000)}s</span>
                )}
                <span className="font-mono text-xs text-accent-cyan">{formatPrice(team.purse)}</span>
              </div>
            </div>
            <div className="h-1.5 bg-muted rounded-full overflow-hidden">
              <div className="h-full rounded-full transition-all duration-500" style={{ width: `${pct}%`, background: barColor }} />
            </div>
            <div className="text-[9px] text-muted-foreground mt-0.5">{squadSize} players · {team.rtm_remaining} RTM</div>
          </div>
        );
      })}
    </div>
  );
}

function SoldOverlay({ player, team }: { player: Player; team: { name: string; color: string } | undefined }) {
  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md">
      <div className="text-center">
        <div className="font-orbitron text-7xl font-black text-accent-gold text-glow-gold border-4 border-accent-gold px-10 py-5 -rotate-6 mb-6 inline-block">
          SOLD!
        </div>
        <div className="font-exo font-bold text-3xl text-foreground mb-2">{player.name}</div>
        {team && <div className="font-exo text-xl" style={{ color: team.color }}>{team.name}</div>}
      </div>
    </div>
  );
}

export default function Display() {
  const { auctionState, players, teams, freezes, getPlayer, connected } = useAuction();
  const timerSeconds = useLocalTimer(auctionState?.timer_expires_at ?? null, auctionState?.timer_running ?? false);

  const currentPlayer = auctionState?.current_player_id ? getPlayer(auctionState.current_player_id) : null;
  const leadingTeam = auctionState?.leading_team_id ? teams.find(t => t.id === auctionState.leading_team_id) : null;

  const [showSoldOverlay, setShowSoldOverlay] = useState(false);
  const [soldPlayer, setSoldPlayer] = useState<Player | null>(null);
  const [soldTeam, setSoldTeam] = useState<{ name: string; color: string } | undefined>();

  const prevCurrentPlayerId = useRef<string | null | undefined>(undefined);

  useEffect(() => {
    const prev = prevCurrentPlayerId.current;
    const curr = auctionState?.current_player_id;
    if (prev !== undefined && prev !== null && curr === null && auctionState?.leading_team_id === null) {
      // Player was cleared — may have been sold
    }
    prevCurrentPlayerId.current = curr;
  }, [auctionState?.current_player_id]);

  // Listen for sold events via auction_log
  useEffect(() => {
    const ch = supabase.channel('display-log')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'auction_log' }, payload => {
        const log = payload.new as any;
        if (log.type === 'sold') {
          const p = players.find(pl => pl.id === log.player_id);
          const t = teams.find(tm => tm.id === log.team_id);
          if (p) {
            setSoldPlayer(p);
            setSoldTeam(t ? { name: t.name, color: t.color } : undefined);
            setShowSoldOverlay(true);
            setTimeout(() => setShowSoldOverlay(false), 4000);
          }
        }
      })
      .subscribe();
    return () => { supabase.removeChannel(ch); };
  }, [players, teams]);

  const soldPlayers = useMemo(() => players.filter(p => p.status === 'sold'), [players]);
  const upcomingPlayers = useMemo(() => players.filter(p => p.status === 'available').slice(0, 5), [players]);
  const stats = useMemo(() => ({
    sold: soldPlayers.length,
    unsold: players.filter(p => p.status === 'unsold').length,
    available: players.filter(p => p.status === 'available').length,
    totalSpent: soldPlayers.reduce((s, p) => s + (p.soldPrice || 0), 0),
  }), [players, soldPlayers]);

  return (
    <div className="h-screen w-full bg-background flex flex-col overflow-hidden relative">
      {showSoldOverlay && soldPlayer && (
        <SoldOverlay player={soldPlayer} team={soldTeam} />
      )}

      {/* Zone 1: Top Status Bar */}
      <div className="flex-shrink-0 bg-card/80 border-b border-border px-4 py-2 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="font-orbitron font-black text-accent-cyan text-lg tracking-wider">BVRIT E-CELL</div>
          <div className="text-muted-foreground text-xs font-rajdhani">IPL AUCTION 2026</div>
        </div>
        <div className="flex items-center gap-6">
          <span className="font-rajdhani text-xs text-muted-foreground">SOLD: <span className="text-accent-gold font-bold">{stats.sold}</span></span>
          <span className="font-rajdhani text-xs text-muted-foreground">UNSOLD: <span className="text-accent-crimson font-bold">{stats.unsold}</span></span>
          <span className="font-rajdhani text-xs text-muted-foreground">AVAILABLE: <span className="font-bold text-foreground">{stats.available}</span></span>
          <span className="font-rajdhani text-xs text-muted-foreground">TOTAL SPENT: <span className="text-accent-emerald font-bold">{formatPrice(stats.totalSpent)}</span></span>
          <span className="font-rajdhani text-xs text-muted-foreground">PHASE: <span className="font-bold text-foreground">{(auctionState?.current_phase || '—').toUpperCase()}</span></span>
        </div>
        <ConnectionStatus />
      </div>

      {/* Main content: Zone 2 (player) + Zone 4 (budgets) */}
      <div className="flex-1 flex overflow-hidden min-h-0">
        {/* Zone 2: Current Player (center) */}
        <div className="flex-1 flex flex-col items-center justify-center p-6 relative">
          {currentPlayer ? (
            <>
              <div className="text-[10px] font-rajdhani text-accent-emerald tracking-widest mb-4 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-accent-emerald animate-pulse" /> NOW ON THE BLOCK
              </div>

              <div className="relative mb-6">
                <img
                  src={currentPlayer.photo}
                  alt={currentPlayer.name}
                  className="w-48 h-48 rounded-2xl border-4 object-cover shadow-2xl"
                  style={{ borderColor: leadingTeam?.color || 'hsl(var(--border))', boxShadow: leadingTeam ? `0 0 40px ${leadingTeam.color}60` : undefined }}
                />
                <div className={`absolute -top-2 -right-2 text-[10px] font-rajdhani font-bold px-2 py-1 rounded-full role-${currentPlayer.role}`}>
                  {roleEmojis[currentPlayer.role]} {currentPlayer.role.replace('-', ' ').toUpperCase()}
                </div>
              </div>

              <h1 className="font-orbitron font-black text-5xl text-foreground text-center mb-1">{currentPlayer.name}</h1>
              <p className="text-muted-foreground font-rajdhani text-sm mb-6">{currentPlayer.subRole} · {currentPlayer.nationality.toUpperCase()}</p>

              <div className="text-center mb-4">
                <div className="text-xs font-rajdhani text-muted-foreground tracking-widest mb-1">CURRENT BID</div>
                <div className="font-mono text-7xl font-black text-accent-cyan text-glow-cyan">{formatPrice(auctionState!.current_bid_amount)}</div>
                {leadingTeam && (
                  <div className="font-exo text-2xl font-bold mt-2" style={{ color: leadingTeam.color }}>
                    {leadingTeam.name}
                  </div>
                )}
              </div>

              <AuctionTimer seconds={timerSeconds} large />
              <div className="w-80 h-2 bg-muted rounded-full overflow-hidden mt-3">
                <div className={`h-full rounded-full transition-all duration-500 ${timerSeconds <= 5 ? 'bg-accent-crimson' : 'bg-accent-cyan'}`}
                  style={{ width: `${(timerSeconds / (auctionState?.bid_reset_seconds || 15)) * 100}%` }} />
              </div>

              <div className="mt-4 grid grid-cols-4 gap-3 text-center">
                {[
                  { label: 'BATTING', value: currentPlayer.batting },
                  { label: 'BOWLING', value: currentPlayer.bowling },
                  { label: 'FIELDING', value: currentPlayer.fielding },
                  { label: 'RATING', value: currentPlayer.rating.toFixed(1) },
                ].map(s => (
                  <div key={s.label} className="bg-card/60 border border-border rounded-lg px-3 py-2">
                    <div className="text-[9px] font-rajdhani text-muted-foreground tracking-wider">{s.label}</div>
                    <div className="font-mono text-lg font-bold text-accent-gold">{s.value}</div>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="text-center">
              <div className="font-orbitron text-3xl text-foreground mb-2">
                {auctionState?.status === 'complete' ? '🏆 Auction Complete' : 'Awaiting Next Player'}
              </div>
              <div className="font-rajdhani text-muted-foreground">{auctionState?.status === 'complete' ? 'Thank you for participating!' : 'The auctioneer will introduce the next player shortly.'}</div>
            </div>
          )}
        </div>

        {/* Zone 4: Team Budgets (right panel) */}
        <div className="w-72 border-l border-border flex flex-col overflow-hidden bg-background/50">
          <TeamBudgetsPanel />
        </div>
      </div>

      {/* Zone 3: Sold Ticker */}
      <SoldTicker soldPlayers={soldPlayers} teams={teams} />

      {/* Zone 5: Upcoming */}
      {upcomingPlayers.length > 0 && (
        <div className="flex-shrink-0 bg-card/60 border-t border-border px-4 py-2">
          <div className="flex items-center gap-4">
            <div className="text-[9px] font-rajdhani text-muted-foreground tracking-widest flex-shrink-0">UP NEXT ▸</div>
            <div className="flex gap-3 overflow-hidden">
              {upcomingPlayers.map(p => (
                <div key={p.id} className="flex items-center gap-2 flex-shrink-0">
                  <img src={p.photo} alt={p.name} className="w-7 h-7 rounded-lg border border-border object-cover" loading="lazy" />
                  <div>
                    <div className="text-[10px] font-medium text-foreground">{p.name}</div>
                    <div className="font-mono text-[9px] text-accent-cyan">{formatPrice(p.basePrice)}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
