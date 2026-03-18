import { useState, useEffect, useRef } from 'react';
import { formatPrice } from '@/context/AuctionContext';
import AuctionTimer from '@/components/AuctionTimer';
import { roleEmojis } from '@/data/players';
import { supabase } from '@/lib/supabase';
import ConnectionStatus from '@/components/ConnectionStatus';
import { RealtimeChannel } from '@supabase/supabase-js';

interface AuctionStateDB {
  id: number;
  status: string;
  current_player_id: string | null;
  current_bid_amount: number;
  leading_team_id: string | null;
  timer_expires_at: number | null;
  timer_running: boolean;
  current_phase: string;
  bid_increment: number;
}

interface TeamDB {
  id: string;
  name: string;
  slug: string;
  color: string;
  purse: number;
  initial_purse: number;
  rtm_remaining: number;
  is_active: boolean;
}

interface PlayerDB {
  id: string;
  name: string;
  role: string;
  category: string;
  base_price: number;
  image_url: string;
  status: string;
  sold_to_team_id: string | null;
  sold_price: number | null;
  sort_order: number;
}

interface FreezeDB {
  team_id: string;
  player_id: string;
  freeze_expires_at: number;
  freeze_seconds: number;
}

export default function Display() {
  const [auctionState, setAuctionState] = useState<AuctionStateDB | null>(null);
  const [teams, setTeams] = useState<TeamDB[]>([]);
  const [currentPlayer, setCurrentPlayer] = useState<PlayerDB | null>(null);
  const [upcomingPlayers, setUpcomingPlayers] = useState<PlayerDB[]>([]);
  const [soldPlayers, setSoldPlayers] = useState<(PlayerDB & { teamName: string; teamColor: string })[]>([]);
  const [timerSeconds, setTimerSeconds] = useState(15);
  const [teamFreezes, setTeamFreezes] = useState<Record<string, FreezeDB>>({});
  const [teamFreezeRemaining, setTeamFreezeRemaining] = useState<Record<string, number>>({});
  const [showSold, setShowSold] = useState(false);
  const [soldInfo, setSoldInfo] = useState({ player: '', team: '', price: 0, color: '' });
  const [channel, setChannel] = useState<RealtimeChannel | null>(null);

  const timerRef = useRef<any>(null);
  const freezeTimersRef = useRef<Record<string, any>>({});

  const syncTimer = (aState: AuctionStateDB) => {
    if (timerRef.current) clearInterval(timerRef.current);
    if (aState.timer_running && aState.timer_expires_at) {
      const tick = () => {
        const rem = Math.max(0, Math.floor((aState.timer_expires_at! - Date.now()) / 1000));
        setTimerSeconds(rem);
      };
      tick();
      timerRef.current = setInterval(tick, 1000);
    } else {
      setTimerSeconds(aState.timer_expires_at ? Math.max(0, Math.floor((aState.timer_expires_at - Date.now()) / 1000)) : 15);
    }
  };

  const startFreezeTimer = (freeze: FreezeDB) => {
    const teamId = freeze.team_id;
    if (freezeTimersRef.current[teamId]) clearInterval(freezeTimersRef.current[teamId]);
    const tick = () => {
      const rem = Math.max(0, freeze.freeze_expires_at - Date.now());
      setTeamFreezeRemaining(prev => ({ ...prev, [teamId]: rem }));
      if (rem <= 0) {
        setTeamFreezes(prev => { const n = { ...prev }; delete n[teamId]; return n; });
        clearInterval(freezeTimersRef.current[teamId]);
      }
    };
    tick();
    freezeTimersRef.current[teamId] = setInterval(tick, 1000);
  };

  const loadCurrentPlayer = async (playerId: string | null) => {
    if (!playerId) { setCurrentPlayer(null); return; }
    const { data } = await supabase.from('players').select('*').eq('id', playerId).single();
    setCurrentPlayer(data || null);
  };

  const loadUpcoming = async () => {
    const { data } = await supabase.from('players').select('*').eq('status', 'available').order('sort_order').limit(5);
    setUpcomingPlayers(data || []);
  };

  const loadSoldTicker = async (allTeams: TeamDB[]) => {
    const { data } = await supabase.from('players').select('*').eq('status', 'sold').order('updated_at', { ascending: false }).limit(30);
    if (data) {
      setSoldPlayers(data.map(p => {
        const t = allTeams.find(tm => tm.id === p.sold_to_team_id);
        return { ...p, teamName: t?.name || '', teamColor: t?.color || '#fff' };
      }));
    }
  };

  useEffect(() => {
    const init = async () => {
      const [{ data: aState }, { data: teamsData }] = await Promise.all([
        supabase.from('auction_state').select('*').single(),
        supabase.from('teams').select('*').order('name'),
      ]);
      const loadedTeams = teamsData || [];
      setTeams(loadedTeams);
      if (aState) { setAuctionState(aState); syncTimer(aState); loadCurrentPlayer(aState.current_player_id); }
      loadUpcoming();
      loadSoldTicker(loadedTeams);

      const { data: freezes } = await supabase.from('team_player_freezes').select('*');
      if (freezes) {
        const now = Date.now();
        const active = freezes.filter(f => f.freeze_expires_at > now);
        const map: Record<string, FreezeDB> = {};
        active.forEach(f => { map[f.team_id] = f; startFreezeTimer(f); });
        setTeamFreezes(map);
      }

      const ch = supabase.channel('display-main')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'auction_state' }, async (payload) => {
          const newState = payload.new as AuctionStateDB;
          const prev = aState;
          setAuctionState(newState);
          syncTimer(newState);
          if (newState.current_player_id !== prev?.current_player_id) {
            loadCurrentPlayer(newState.current_player_id);
            loadUpcoming();
          }
          if (!newState.current_player_id && prev?.current_player_id && prev.leading_team_id) {
            const soldTeam = loadedTeams.find(t => t.id === prev.leading_team_id);
            setSoldInfo({ player: '', team: soldTeam?.name || '', price: prev.current_bid_amount, color: soldTeam?.color || '' });
            setShowSold(true);
            loadSoldTicker(loadedTeams);
            setTimeout(() => setShowSold(false), 3000);
          }
        })
        .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'teams' }, (payload) => {
          setTeams(prev => {
            const updated = prev.map(t => t.id === (payload.new as TeamDB).id ? (payload.new as TeamDB) : t);
            loadSoldTicker(updated);
            return updated;
          });
        })
        .on('postgres_changes', { event: '*', schema: 'public', table: 'team_player_freezes' }, (payload) => {
          if (payload.eventType === 'DELETE') {
            const teamId = (payload.old as any).team_id;
            setTeamFreezes(prev => { const n = { ...prev }; delete n[teamId]; return n; });
            if (freezeTimersRef.current[teamId]) clearInterval(freezeTimersRef.current[teamId]);
          } else {
            const freeze = payload.new as FreezeDB;
            setTeamFreezes(prev => ({ ...prev, [freeze.team_id]: freeze }));
            startFreezeTimer(freeze);
          }
        })
        .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'players' }, (payload) => {
          const p = payload.new as PlayerDB;
          if (p.status === 'sold') {
            loadSoldTicker(loadedTeams);
          }
          if (p.status === 'available') {
            loadUpcoming();
          }
        })
        .subscribe();
      setChannel(ch);
    };
    init();
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      Object.values(freezeTimersRef.current).forEach(clearInterval);
      if (channel) supabase.removeChannel(channel);
    };
  }, []);

  const leadingTeam = auctionState?.leading_team_id ? teams.find(t => t.id === auctionState.leading_team_id) : null;

  return (
    <div className="h-screen w-screen overflow-hidden bg-background relative flex flex-col">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute w-[600px] h-[600px] -top-40 -left-40 rounded-full bg-accent-cyan/5 blur-3xl animate-float" />
        <div className="absolute w-[500px] h-[500px] -bottom-40 -right-40 rounded-full bg-accent-orange/5 blur-3xl animate-float" style={{ animationDelay: '4s' }} />
      </div>

      <div className="absolute top-3 right-4 z-20">
        <ConnectionStatus channel={channel} />
      </div>

      <div className="flex-1 grid grid-cols-[1fr_300px] grid-rows-[1fr_auto] gap-0 relative z-10 p-4">
        <div className="flex flex-col items-center justify-center p-8">
          {currentPlayer ? (
            <div className="text-center">
              <div className="flex items-center gap-2 justify-center mb-6">
                <span className="w-3 h-3 rounded-full bg-accent-emerald animate-pulse" />
                <span className="font-rajdhani font-bold text-accent-emerald text-sm tracking-[0.3em]">LIVE AUCTION</span>
              </div>

              <div className="mb-6">
                <img
                  src={currentPlayer.image_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(currentPlayer.name)}&background=0d1b2a&color=00d4ff&size=200`}
                  alt={currentPlayer.name}
                  className="w-28 h-28 rounded-2xl border-2 border-accent-cyan/30 mx-auto mb-4 glow-cyan object-cover"
                />
                <h1 className="font-orbitron text-5xl md:text-7xl font-black text-foreground text-glow-cyan leading-none mb-3">
                  {currentPlayer.name}
                </h1>
                <span className={`inline-block text-sm font-rajdhani font-bold px-4 py-1.5 rounded-full role-${currentPlayer.role}`}>
                  {roleEmojis[currentPlayer.role]} {currentPlayer.role.replace('-', ' ').toUpperCase()}
                </span>
                <div className="font-mono text-lg text-muted-foreground mt-2">
                  Base: {formatPrice(currentPlayer.base_price)}
                </div>
              </div>

              <div className="mb-6">
                <div className="text-xs font-rajdhani text-muted-foreground tracking-[0.3em] mb-2">CURRENT BID</div>
                <div className="font-mono text-7xl md:text-9xl font-bold text-accent-cyan text-glow-cyan">
                  {formatPrice(auctionState?.current_bid_amount || 0)}
                </div>
              </div>

              {leadingTeam && (
                <div className="font-exo text-3xl font-bold mb-8" style={{ color: leadingTeam.color }}>
                  {leadingTeam.name}
                </div>
              )}

              <AuctionTimer seconds={timerSeconds} large />
              <div className="w-96 mx-auto mt-4 h-3 bg-muted rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-1000 ease-linear ${
                    timerSeconds <= 5 ? 'bg-accent-crimson glow-crimson' : 'bg-accent-cyan glow-cyan'
                  }`}
                  style={{ width: `${(timerSeconds / 15) * 100}%` }}
                />
              </div>
            </div>
          ) : (
            <div className="text-center">
              <h1 className="font-orbitron text-4xl md:text-6xl font-black text-foreground mb-4">
                BVRIT <span className="text-accent-orange">IPL AUCTION</span>
              </h1>
              <p className="font-exo text-2xl text-muted-foreground">
                {auctionState?.status === 'complete' ? 'Auction Complete' : 'Waiting for Next Player...'}
              </p>
              <p className="font-rajdhani text-lg text-muted-foreground mt-2 tracking-wider">E-SUMMIT 2026</p>
            </div>
          )}
        </div>

        <div className="border-l border-border/50 p-4 flex flex-col gap-4 overflow-hidden">
          <div>
            <h3 className="font-rajdhani font-bold text-xs text-muted-foreground tracking-[0.3em] mb-3">COMING UP NEXT</h3>
            <div className="space-y-2">
              {upcomingPlayers.map((p, i) => (
                <div key={p.id} className="glass-card p-3 flex items-center gap-3">
                  <span className="font-mono text-xs text-muted-foreground w-5">{i + 1}</span>
                  <img
                    src={p.image_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(p.name)}&background=0d1b2a&color=00d4ff`}
                    alt={p.name} className="w-8 h-8 rounded-lg border border-border object-cover" loading="lazy"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="font-exo font-semibold text-xs text-foreground truncate">{p.name}</div>
                    <div className="font-mono text-[10px] text-accent-cyan">{formatPrice(p.base_price)}</div>
                  </div>
                </div>
              ))}
              {upcomingPlayers.length === 0 && <p className="text-xs text-muted-foreground text-center py-2">No upcoming players</p>}
            </div>
          </div>

          <div className="flex-1 overflow-auto">
            <h3 className="font-rajdhani font-bold text-xs text-muted-foreground tracking-[0.3em] mb-3">TEAM PURSES</h3>
            <div className="space-y-2">
              {teams.map(t => {
                const pct = (t.purse / (t.initial_purse || 12000)) * 100;
                const freeze = teamFreezes[t.id];
                const freezeRem = teamFreezeRemaining[t.id] || 0;
                const isLeading = t.id === auctionState?.leading_team_id;
                return (
                  <div key={t.id} className={`p-2 rounded-lg ${isLeading ? 'border border-accent-cyan/40 bg-accent-cyan/5' : 'bg-card/40'}`}>
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="text-foreground font-medium truncate flex items-center gap-1">
                        {t.name}
                        {freeze && freezeRem > 0 && (
                          <span className="font-mono text-accent-gold ml-1">🔒 {Math.ceil(freezeRem / 1000)}s</span>
                        )}
                      </span>
                      <span className="font-mono text-muted-foreground">{formatPrice(t.purse)}</span>
                    </div>
                    <div className="w-full h-1 bg-muted rounded-full overflow-hidden">
                      <div className={`h-full rounded-full ${pct > 60 ? 'bg-accent-emerald' : pct > 20 ? 'bg-accent-gold' : 'bg-accent-crimson'}`} style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <div className="col-span-2 border-t border-border/50 py-2 overflow-hidden">
          <div className="flex items-center gap-2 h-8">
            <span className="font-rajdhani font-bold text-xs text-accent-gold tracking-wider shrink-0 px-3">SOLD</span>
            <div className="overflow-hidden flex-1">
              <div className={`flex gap-6 ${soldPlayers.length > 3 ? 'animate-ticker' : ''}`} style={{ width: 'max-content' }}>
                {(soldPlayers.length > 3 ? [...soldPlayers, ...soldPlayers] : soldPlayers).map((p, i) => (
                  <span key={`${p.id}-${i}`} className="text-xs text-muted-foreground whitespace-nowrap flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full" style={{ background: p.teamColor }} />
                    {p.name} → {p.teamName} → {formatPrice(p.sold_price || 0)}
                  </span>
                ))}
                {soldPlayers.length === 0 && <span className="text-xs text-muted-foreground">No players sold yet</span>}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-card/80 border-t border-border/50 px-6 py-2 flex items-center justify-between text-xs text-muted-foreground">
        <span className="font-orbitron text-[10px]">E-SUMMIT 2026 | BVRIT E-CELL</span>
        <span className="font-rajdhani tracking-wider">{auctionState?.current_phase?.toUpperCase() || 'MARQUEE'} PHASE</span>
        <span className="font-mono">Phase: {auctionState?.status?.toUpperCase() || '—'}</span>
      </div>

      {showSold && (
        <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-md flex items-center justify-center">
          <div className="text-center animate-sold-stamp">
            <div className="font-orbitron text-6xl font-black text-accent-gold text-glow-gold border-4 border-accent-gold px-8 py-4 -rotate-12">SOLD!</div>
            {soldInfo.team && (
              <div className="font-exo text-3xl font-bold mt-4" style={{ color: soldInfo.color || undefined }}>
                → {soldInfo.team} for {formatPrice(soldInfo.price)}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
