import { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuction } from '@/context/AuctionContext';
import { formatPrice } from '@/context/AuctionContext';
import PlayerCard from '@/components/PlayerCard';
import AuctionTimer, { TimerBar } from '@/components/AuctionTimer';
import { roleEmojis } from '@/data/players';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';
import ConnectionStatus from '@/components/ConnectionStatus';
import { Lock, Unlock, Eye, EyeOff } from 'lucide-react';
import { RealtimeChannel } from '@supabase/supabase-js';

const MIN_REQ: Record<string, number> = {
  batsman: 4, 'fast-bowler': 2, spinner: 1, 'wicket-keeper': 1, 'all-rounder': 0,
};

export default function Teams() {
  const { state } = useAuction();

  return (
    <div className="min-h-screen bg-background pt-20 pb-12">
      <div className="container mx-auto px-4">
        <h1 className="section-title mb-8">All <span className="text-accent-cyan">Teams</span></h1>
        {state.teams.length === 0 ? (
          <div className="glass-card p-12 text-center">
            <p className="text-muted-foreground">No teams have been created yet. Check back soon!</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            {state.teams.map(team => {
              const pursePct = (team.purse / (team.initialPurse || 12000)) * 100;
              return (
                <Link
                  key={team.id}
                  to={`/team/${team.slug}`}
                  className="glass-card p-6 hover:border-accent-cyan/30 hover:-translate-y-1 transition-all duration-200 block"
                  style={{ borderTopColor: team.color, borderTopWidth: 3 }}
                >
                  <h3 className="font-exo font-bold text-lg text-foreground mb-1">{team.name}</h3>
                  <p className="text-xs text-muted-foreground mb-4">{team.city}</p>
                  <div className="flex items-baseline justify-between mb-2">
                    <span className="text-xs font-rajdhani text-muted-foreground tracking-wider">PURSE</span>
                    <span className={`font-mono font-bold text-lg ${pursePct > 60 ? 'text-accent-emerald' : pursePct > 20 ? 'text-accent-gold' : 'text-accent-crimson'}`}>
                      {formatPrice(team.purse)}
                    </span>
                  </div>
                  <div className="w-full h-2 bg-muted rounded-full overflow-hidden mb-4">
                    <div className={`h-full rounded-full transition-all ${pursePct > 60 ? 'bg-accent-emerald' : pursePct > 20 ? 'bg-accent-gold' : 'bg-accent-crimson'}`} style={{ width: `${pursePct}%` }} />
                  </div>
                  <div className="text-xs text-muted-foreground">
                    <span className="font-mono">{team.players.length}</span> players • <span className="font-mono">{team.rtmRemaining}</span> RTM cards
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

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
  city: string;
  color: string;
  purse: number;
  initial_purse: number;
  rtm_remaining: number;
  password_hash: string;
  is_active: boolean;
}

interface PlayerDB {
  id: string;
  name: string;
  role: string;
  category: string;
  nationality: string;
  base_price: number;
  batting: number;
  bowling: number;
  fielding: number;
  rating: number;
  batting_style: string;
  bowling_style: string;
  image_url: string;
  status: string;
  sold_to_team_id: string | null;
  sold_price: number | null;
}

export function TeamDashboard() {
  const { slug } = useParams<{ slug: string }>();
  const { toast } = useToast();

  const [team, setTeam] = useState<TeamDB | null>(null);
  const [squadPlayers, setSquadPlayers] = useState<PlayerDB[]>([]);
  const [allTeams, setAllTeams] = useState<TeamDB[]>([]);
  const [auctionState, setAuctionState] = useState<AuctionStateDB | null>(null);
  const [currentPlayer, setCurrentPlayer] = useState<PlayerDB | null>(null);
  const [upcomingPlayers, setUpcomingPlayers] = useState<PlayerDB[]>([]);
  const [timerSeconds, setTimerSeconds] = useState(0);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [channel, setChannel] = useState<RealtimeChannel | null>(null);

  const [authenticated, setAuthenticated] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authPw, setAuthPw] = useState('');
  const [authError, setAuthError] = useState('');
  const [showAuthPw, setShowAuthPw] = useState(false);
  const [attempts, setAttempts] = useState(0);
  const [lockoutUntil, setLockoutUntil] = useState(0);
  const [lockoutRemaining, setLockoutRemaining] = useState(0);

  const [freezeRemaining, setFreezeRemaining] = useState(0);
  const [showFreeze, setShowFreeze] = useState(false);
  const [showSoldOverlay, setShowSoldOverlay] = useState(false);
  const [soldInfo, setSoldInfo] = useState({ player: '', team: '', price: 0 });

  const prevCurrentPlayerIdRef = useRef<string | null>(null);
  const timerIntervalRef = useRef<any>(null);
  const freezeIntervalRef = useRef<any>(null);

  useEffect(() => {
    if (!slug) return;
    const authKey = `team_auth_${slug}`;
    if (sessionStorage.getItem(authKey) === 'authenticated') setAuthenticated(true);
  }, [slug]);

  useEffect(() => {
    if (lockoutUntil <= 0) return;
    const iv = setInterval(() => {
      const rem = Math.max(0, Math.ceil((lockoutUntil - Date.now()) / 1000));
      setLockoutRemaining(rem);
      if (rem <= 0) { setLockoutUntil(0); clearInterval(iv); }
    }, 500);
    return () => clearInterval(iv);
  }, [lockoutUntil]);

  const syncTimer = (aState: AuctionStateDB) => {
    if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    if (aState.timer_running && aState.timer_expires_at) {
      const tick = () => {
        const rem = Math.max(0, Math.floor((aState.timer_expires_at! - Date.now()) / 1000));
        setTimerSeconds(rem);
      };
      tick();
      timerIntervalRef.current = setInterval(tick, 1000);
    } else {
      setTimerSeconds(aState.timer_expires_at ? Math.max(0, Math.floor((aState.timer_expires_at - Date.now()) / 1000)) : 15);
    }
  };

  const loadCurrentPlayer = async (playerId: string | null) => {
    if (!playerId) { setCurrentPlayer(null); return; }
    const { data } = await supabase.from('players').select('*').eq('id', playerId).single();
    setCurrentPlayer(data || null);
  };

  const loadSquad = async (teamId: string) => {
    const { data: squads } = await supabase.from('team_squads').select('player_id, purchase_price').eq('team_id', teamId);
    if (!squads || squads.length === 0) { setSquadPlayers([]); return; }
    const ids = squads.map(s => s.player_id);
    const { data: players } = await supabase.from('players').select('*').in('id', ids);
    setSquadPlayers(players || []);
  };

  const loadUpcoming = async () => {
    const { data } = await supabase.from('players').select('*').eq('status', 'available').order('sort_order').limit(5);
    setUpcomingPlayers(data || []);
  };

  useEffect(() => {
    if (!slug) return;
    const init = async () => {
      setLoading(true);
      const { data: teamData } = await supabase.from('teams').select('*').eq('slug', slug).single();
      if (!teamData) { setNotFound(true); setLoading(false); return; }
      setTeam(teamData);

      const [{ data: aState }, { data: teams }] = await Promise.all([
        supabase.from('auction_state').select('*').single(),
        supabase.from('teams').select('*'),
      ]);

      if (aState) { setAuctionState(aState); syncTimer(aState); loadCurrentPlayer(aState.current_player_id); }
      setAllTeams(teams || []);
      await Promise.all([loadSquad(teamData.id), loadUpcoming()]);
      setLoading(false);

      const ch = supabase.channel(`team-dashboard-${slug}`)
        .on('postgres_changes', { event: '*', schema: 'public', table: 'auction_state' }, async (payload) => {
          const newState = payload.new as AuctionStateDB;
          setAuctionState(newState);
          syncTimer(newState);
          if (newState.current_player_id !== prevCurrentPlayerIdRef.current) {
            await loadCurrentPlayer(newState.current_player_id);
            loadUpcoming();
            if (!newState.current_player_id && prevCurrentPlayerIdRef.current) {
              if (newState.leading_team_id) {
                const soldTeam = teams?.find(t => t.id === newState.leading_team_id);
                setSoldInfo({ player: '', team: soldTeam?.name || '', price: newState.current_bid_amount });
                setShowSoldOverlay(true);
                setTimeout(() => setShowSoldOverlay(false), 3000);
              }
            }
            prevCurrentPlayerIdRef.current = newState.current_player_id;
          }
        })
        .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'teams', filter: `slug=eq.${slug}` }, (payload) => {
          setTeam(payload.new as TeamDB);
          loadSquad((payload.new as TeamDB).id);
        })
        .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'teams' }, (payload) => {
          setAllTeams(prev => prev.map(t => t.id === (payload.new as TeamDB).id ? (payload.new as TeamDB) : t));
        })
        .on('postgres_changes', { event: '*', schema: 'public', table: 'team_player_freezes', filter: `team_id=eq.${teamData.id}` }, (payload) => {
          if (payload.eventType === 'DELETE') { setShowFreeze(false); setFreezeRemaining(0); return; }
          const freeze = payload.new as any;
          if (!freeze.freeze_expires_at) return;
          if (freezeIntervalRef.current) clearInterval(freezeIntervalRef.current);
          const tick = () => {
            const rem = Math.max(0, freeze.freeze_expires_at - Date.now());
            setFreezeRemaining(rem);
            setShowFreeze(rem > 0);
            if (rem <= 0) clearInterval(freezeIntervalRef.current);
          };
          tick();
          freezeIntervalRef.current = setInterval(tick, 100);
        })
        .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'announcements' }, (payload) => {
          toast({ title: '📢 Announcement', description: (payload.new as any).message, duration: 5000 });
        })
        .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'team_squads', filter: `team_id=eq.${teamData.id}` }, () => {
          loadSquad(teamData.id);
        })
        .subscribe();

      setChannel(ch);
      prevCurrentPlayerIdRef.current = aState?.current_player_id || null;
    };
    init();
    return () => {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
      if (freezeIntervalRef.current) clearInterval(freezeIntervalRef.current);
      if (channel) supabase.removeChannel(channel);
    };
  }, [slug]);

  const handleAuth = () => {
    if (!team) return;
    if (lockoutUntil > Date.now()) return;
    const hash = btoa(`${team.slug}:${authPw}`);
    if (hash === team.password_hash) {
      sessionStorage.setItem(`team_auth_${slug}`, 'authenticated');
      setAuthenticated(true);
      setShowAuthModal(false);
      setAuthPw('');
      setAuthError('');
      setAttempts(0);
      toast({ title: '✅ Authenticated — RTM controls unlocked' });
    } else {
      const newAttempts = attempts + 1;
      setAttempts(newAttempts);
      setAuthError('Incorrect password');
      if (newAttempts >= 3) {
        const until = Date.now() + 60000;
        setLockoutUntil(until);
        setLockoutRemaining(60);
        setShowAuthModal(false);
        toast({ title: '❌ Too many attempts — locked for 60s', variant: 'destructive' });
      }
    }
  };

  if (loading) return (
    <div className="min-h-screen bg-background pt-20 flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-accent-cyan/30 border-t-accent-cyan rounded-full animate-spin" />
    </div>
  );

  if (notFound || !team) return (
    <div className="min-h-screen bg-background pt-20 flex items-center justify-center">
      <div className="glass-card p-12 text-center border-accent-cyan/30">
        <h1 className="font-orbitron text-3xl text-foreground mb-4">Team Not Found</h1>
        <p className="text-muted-foreground mb-6">This team dashboard doesn't exist.</p>
        <Link to="/teams" className="btn-ghost">← Back to Teams</Link>
      </div>
    </div>
  );

  const leadingTeam = auctionState?.leading_team_id ? allTeams.find(t => t.id === auctionState.leading_team_id) : null;
  const pursePct = (team.purse / (team.initial_purse || 12000)) * 100;
  const isLive = auctionState?.status === 'live' && currentPlayer;
  const lockoutActive = lockoutUntil > Date.now();

  return (
    <div className="min-h-screen bg-background pt-20 pb-12">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <div className="w-4 h-12 rounded" style={{ background: team.color }} />
            <div>
              <h1 className="font-exo font-bold text-3xl text-foreground">{team.name}</h1>
              <p className="text-muted-foreground text-sm">{team.city}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <ConnectionStatus channel={channel} />
            {authenticated ? (
              <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-accent-emerald/15 border border-accent-emerald/30 text-accent-emerald text-xs font-rajdhani font-semibold">
                <Unlock size={12} /> Authenticated
              </span>
            ) : lockoutActive ? (
              <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-accent-crimson/15 border border-accent-crimson/30 text-accent-crimson text-xs font-rajdhani font-semibold">
                <Lock size={12} /> Locked {lockoutRemaining}s
              </span>
            ) : (
              <button
                onClick={() => setShowAuthModal(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-accent-purple/15 border border-accent-purple/30 text-accent-purple text-xs font-rajdhani font-semibold hover:bg-accent-purple/25 transition-colors"
              >
                <Lock size={12} /> Unlock RTM
              </button>
            )}
          </div>
        </div>

        {showFreeze && freezeRemaining > 0 && currentPlayer && (
          <div className="mb-4 p-4 bg-accent-gold/10 border border-accent-gold/40 rounded-xl flex items-center gap-4">
            <div className="text-2xl">🔒</div>
            <div>
              <div className="font-rajdhani font-bold text-accent-gold tracking-wider">BID FREEZE ACTIVE</div>
              <div className="text-sm text-muted-foreground">Your team cannot bid for another {Math.ceil(freezeRemaining / 1000)}s on {currentPlayer.name}</div>
            </div>
            <div className="ml-auto font-mono text-3xl font-bold text-accent-gold">{Math.ceil(freezeRemaining / 1000)}s</div>
          </div>
        )}

        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-4">
            {isLive ? (
              <div className="glass-card p-6">
                <div className="text-xs font-rajdhani text-accent-emerald tracking-wider mb-4 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-accent-emerald animate-pulse" />
                  LIVE AUCTION
                </div>
                <div className="flex items-start gap-4 mb-6">
                  <img src={currentPlayer.image_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(currentPlayer.name)}&background=0d1b2a&color=00d4ff`} alt={currentPlayer.name} className="w-20 h-20 rounded-xl border-2 border-border object-cover" />
                  <div>
                    <h2 className="font-exo font-bold text-2xl text-foreground">{currentPlayer.name}</h2>
                    <span className={`text-xs font-rajdhani font-semibold px-2 py-0.5 rounded-full role-${currentPlayer.role}`}>
                      {roleEmojis[currentPlayer.role]} {currentPlayer.role.replace('-', ' ').toUpperCase()}
                    </span>
                    <div className="text-xs text-muted-foreground mt-1">Base: {formatPrice(currentPlayer.base_price)}</div>
                  </div>
                </div>

                <div className="text-center mb-6">
                  <div className="text-xs font-rajdhani text-muted-foreground tracking-wider mb-1">CURRENT BID</div>
                  <div className="font-mono text-5xl font-bold text-accent-cyan text-glow-cyan">{formatPrice(auctionState.current_bid_amount)}</div>
                  {leadingTeam && <div className="font-exo text-lg mt-2" style={{ color: leadingTeam.color }}>{leadingTeam.name}</div>}
                </div>

                <div className="text-center mb-4">
                  <AuctionTimer seconds={timerSeconds} />
                  <TimerBar seconds={timerSeconds} max={15} />
                </div>

                <div className="bg-accent-orange/10 border border-accent-orange/20 rounded-lg p-3 text-center text-xs text-accent-orange">
                  🎙️ Raise your placard to bid. The auctioneer registers all bids.
                </div>
              </div>
            ) : (
              <div className="glass-card p-12 text-center">
                <div className="font-orbitron text-2xl text-muted-foreground mb-2">
                  {auctionState?.status === 'pre' ? 'Auction Starting Soon' :
                   auctionState?.status === 'complete' ? 'Auction Complete' :
                   'Waiting for Next Player'}
                </div>
                <p className="text-muted-foreground text-sm">Stay tuned for live updates</p>
              </div>
            )}

            {authenticated && (
              <div className="glass-card p-6">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-3 h-3 rounded-full bg-accent-purple animate-pulse" />
                  <h3 className="font-exo font-semibold text-foreground">RTM Controls</h3>
                </div>
                <p className="text-sm text-muted-foreground mb-4">
                  Right to Match allows your team to match the winning bid for a player you previously owned.
                  You have <span className="font-mono text-accent-purple">{team.rtm_remaining}</span> RTM card{team.rtm_remaining !== 1 ? 's' : ''} remaining.
                </p>
                <button
                  disabled={!isLive || team.rtm_remaining === 0}
                  className={`w-full py-3 rounded-xl font-exo font-bold text-lg transition-all ${
                    isLive && team.rtm_remaining > 0
                      ? 'bg-gradient-to-r from-accent-purple to-accent-violet text-white shadow-[0_0_20px_hsl(271_91%_65%/0.4)] hover:brightness-110'
                      : 'bg-muted text-muted-foreground cursor-not-allowed'
                  }`}
                >
                  {team.rtm_remaining === 0 ? '🔒 No RTM Cards Remaining' :
                   !isLive ? '🔒 Use RTM — Auction Not Live' :
                   `🟣 USE RTM — Match ${formatPrice(auctionState?.current_bid_amount || 0)}`}
                </button>
              </div>
            )}

            {!authenticated && (
              <div className="glass-card p-6 border border-accent-purple/20">
                <div className="text-center">
                  <Lock className="w-8 h-8 text-accent-purple mx-auto mb-3 opacity-50" />
                  <p className="text-sm text-muted-foreground">
                    <button onClick={() => !lockoutActive && setShowAuthModal(true)} className="text-accent-purple hover:underline cursor-pointer">
                      Authenticate
                    </button> to unlock RTM controls for your team.
                  </p>
                </div>
              </div>
            )}

            <div className="glass-card p-6">
              <h3 className="font-exo font-semibold text-foreground mb-4">Coming Up Next</h3>
              <div className="space-y-2">
                {upcomingPlayers.length === 0 ? (
                  <p className="text-muted-foreground text-sm text-center py-4">No upcoming players</p>
                ) : upcomingPlayers.map((p, i) => (
                  <div key={p.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/30 transition-colors">
                    <span className="font-mono text-xs text-muted-foreground w-4">{i + 1}</span>
                    <img src={p.image_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(p.name)}&background=0d1b2a&color=00d4ff`} alt={p.name} className="w-8 h-8 rounded-lg border border-border object-cover" loading="lazy" />
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-foreground truncate">{p.name}</div>
                      <span className={`text-[10px] font-rajdhani role-${p.role} px-1.5 rounded`}>
                        {roleEmojis[p.role]} {p.role.replace('-', ' ').toUpperCase()}
                      </span>
                    </div>
                    <span className="font-mono text-xs text-accent-cyan">{formatPrice(p.base_price)}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="glass-card p-6" style={{ borderTopColor: team.color, borderTopWidth: 3 }}>
              <h3 className="font-exo font-semibold text-foreground mb-4">Team Summary</h3>
              <div className="flex items-baseline justify-between mb-2">
                <span className="text-xs font-rajdhani text-muted-foreground">PURSE REMAINING</span>
                <span className={`font-mono font-bold text-2xl ${pursePct > 60 ? 'text-accent-emerald' : pursePct > 20 ? 'text-accent-gold' : 'text-accent-crimson'}`}>
                  {formatPrice(team.purse)}
                </span>
              </div>
              <div className="w-full h-3 bg-muted rounded-full overflow-hidden mb-6">
                <div className={`h-full rounded-full ${pursePct > 60 ? 'bg-accent-emerald' : pursePct > 20 ? 'bg-accent-gold' : 'bg-accent-crimson'}`} style={{ width: `${pursePct}%` }} />
              </div>

              <div className="space-y-3 mb-6">
                {Object.entries(MIN_REQ).map(([role, min]) => {
                  const count = squadPlayers.filter(p => p.role === role).length;
                  const met = count >= min;
                  return (
                    <div key={role} className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">{roleEmojis[role as keyof typeof roleEmojis]} {role.replace('-', ' ')}</span>
                      <span className={`font-mono ${met ? 'text-accent-emerald' : 'text-accent-crimson'}`}>
                        {count} / {min} {met ? '✓' : '⚠️'}
                      </span>
                    </div>
                  );
                })}
              </div>

              <div className="flex items-center gap-2 text-sm">
                <span className="bg-accent-purple/15 text-accent-purple px-2 py-1 rounded-full text-xs font-rajdhani font-semibold border border-accent-purple/30">
                  RTM Cards: {team.rtm_remaining}
                </span>
              </div>
            </div>

            <div className="glass-card p-6">
              <h3 className="font-exo font-semibold text-foreground mb-4">
                Squad <span className="font-mono text-xs text-muted-foreground">({squadPlayers.length})</span>
              </h3>
              {squadPlayers.length === 0 ? (
                <p className="text-muted-foreground text-sm text-center py-4">No players yet</p>
              ) : (
                <div className="space-y-2">
                  {squadPlayers.map(p => (
                    <div key={p.id} className="flex items-center justify-between py-2 border-b border-border/50 last:border-0">
                      <div className="flex items-center gap-2">
                        <img src={p.image_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(p.name)}&background=0d1b2a&color=00d4ff`} alt={p.name} className="w-8 h-8 rounded-full object-cover" loading="lazy" />
                        <div>
                          <div className="text-sm text-foreground">{p.name}</div>
                          <span className={`text-[10px] font-rajdhani role-${p.role} px-1 rounded`}>{p.role.replace('-', ' ')}</span>
                        </div>
                      </div>
                      <span className="font-mono text-xs text-accent-gold">{formatPrice(p.sold_price || 0)}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {showAuthModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="glass-card p-8 w-full max-w-sm">
            <h2 className="font-orbitron text-xl text-foreground mb-1">Authenticate Your Team</h2>
            <div className="w-full h-px bg-border my-4" />
            <p className="text-muted-foreground text-sm mb-6">Team: <span className="text-foreground font-medium">{team.name}</span></p>
            <label className="text-xs font-rajdhani text-muted-foreground tracking-wider mb-2 block">TEAM PASSWORD</label>
            <div className="relative mb-4">
              <input
                type={showAuthPw ? 'text' : 'password'}
                value={authPw}
                onChange={e => { setAuthPw(e.target.value); setAuthError(''); }}
                onKeyDown={e => e.key === 'Enter' && handleAuth()}
                placeholder="Enter password"
                className={`w-full bg-background border rounded-lg px-4 py-3 text-foreground focus:outline-none ${authError ? 'border-accent-crimson' : 'border-border focus:border-accent-purple/40'}`}
              />
              <button onClick={() => setShowAuthPw(v => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                {showAuthPw ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            {authError && <p className="text-accent-crimson text-xs mb-4">{authError} ({3 - attempts} attempt{3 - attempts !== 1 ? 's' : ''} left)</p>}
            <div className="flex gap-2">
              <button onClick={handleAuth} className="flex-1 py-3 rounded-lg bg-gradient-to-r from-accent-purple to-accent-violet text-white font-exo font-semibold hover:brightness-110 transition-all">
                Authenticate
              </button>
              <button onClick={() => { setShowAuthModal(false); setAuthPw(''); setAuthError(''); }} className="btn-ghost py-3 px-4">
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {showSoldOverlay && (
        <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-md flex items-center justify-center">
          <div className="text-center animate-sold-stamp">
            <div className="font-orbitron text-5xl font-black text-accent-gold text-glow-gold border-4 border-accent-gold px-8 py-4 -rotate-12">SOLD!</div>
            {soldInfo.team && <div className="font-exo text-xl text-foreground mt-4">→ {soldInfo.team} for {formatPrice(soldInfo.price)}</div>}
          </div>
        </div>
      )}
    </div>
  );
}
