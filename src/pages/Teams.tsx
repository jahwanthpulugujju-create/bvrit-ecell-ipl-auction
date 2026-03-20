import { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useAuction, formatPrice } from '@/context/AuctionContext';
import AuctionTimer, { TimerBar } from '@/components/AuctionTimer';
import { roleEmojis } from '@/data/players';
import { verifyTeamPassword } from '@/data/teams';
import { useToast } from '@/hooks/use-toast';
import ConnectionStatus from '@/components/ConnectionStatus';
import { supabase } from '@/lib/supabase';
import { Lock, Eye, EyeOff, X } from 'lucide-react';

const MIN_REQ: Record<string, number> = {
  batsman: 4, 'fast-bowler': 2, spinner: 1, 'wicket-keeper': 1, 'all-rounder': 0,
};

export default function Teams() {
  const { teams } = useAuction();

  return (
    <div className="min-h-screen bg-background pt-20 pb-12">
      <div className="container mx-auto px-4">
        <h1 className="section-title mb-2">Participating <span className="text-accent-cyan">Teams</span></h1>
        <p className="text-muted-foreground text-sm mb-8">Select your team and authenticate to access your private dashboard.</p>
        {teams.length === 0 ? (
          <div className="glass-card p-12 text-center">
            <p className="text-muted-foreground">No teams have been created yet. Check back soon!</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            {teams.map(team => (
              <Link key={team.id} to={`/team/${team.slug}`}
                className="glass-card p-6 hover:border-accent-cyan/30 hover:-translate-y-1 transition-all duration-200 block"
                style={{ borderTopColor: team.color, borderTopWidth: 3 }}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="w-2 h-8 rounded-sm flex-shrink-0" style={{ background: team.color }} />
                  <Lock size={14} className="text-muted-foreground" />
                </div>
                <h3 className="font-exo font-bold text-lg text-foreground mb-1">{team.name}</h3>
                <p className="text-xs text-muted-foreground mb-4">Private team dashboard</p>
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <Lock size={11} />
                  <span>Authentication required</span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

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

function FreezeBanner({ teamId }: { teamId: string }) {
  const { freezes, auctionState } = useAuction();
  const currentPlayerId = auctionState?.current_player_id;
  const freeze = freezes.find(f =>
    f.team_id === teamId &&
    f.player_id === currentPlayerId &&
    f.freeze_expires_at > Date.now()
  );
  const [remainingMs, setRemainingMs] = useState(0);
  const [justExpired, setJustExpired] = useState(false);

  useEffect(() => {
    if (!freeze) { setRemainingMs(0); return; }
    const tick = () => {
      const rem = Math.max(0, freeze.freeze_expires_at - Date.now());
      setRemainingMs(rem);
      if (rem === 0) setJustExpired(true);
    };
    tick();
    const iv = setInterval(tick, 100);
    return () => clearInterval(iv);
  }, [freeze]);

  useEffect(() => {
    if (justExpired) {
      const t = setTimeout(() => setJustExpired(false), 600);
      return () => clearTimeout(t);
    }
  }, [justExpired]);

  if (!freeze && !justExpired) return null;

  const totalMs = (freeze?.freeze_seconds ?? 0) * 1000;
  const pct = totalMs > 0 ? Math.max(0, remainingMs / totalMs) * 100 : 0;
  const dashOffset = 100 - pct;
  const secs = Math.ceil(remainingMs / 1000);

  if (justExpired && remainingMs === 0) {
    return (
      <div className="fixed top-0 left-0 right-0 z-30 bg-accent-emerald/90 text-background text-center py-3 font-rajdhani font-bold tracking-wider text-sm animate-pulse">
        ✅ FREEZE LIFTED — YOU CAN BID NOW
      </div>
    );
  }

  return (
    <div className="fixed top-0 left-0 right-0 z-30 bg-accent-gold/20 border-b border-accent-gold/50 backdrop-blur-md">
      <div className="container mx-auto px-4 py-3 flex items-center gap-4">
        <div className="relative flex-shrink-0">
          <svg viewBox="0 0 36 36" className="w-14 h-14" style={{ transform: 'rotate(-90deg)' }}>
            <circle cx="18" cy="18" r="15.9" fill="none" stroke="rgba(245,158,11,0.2)" strokeWidth="3" />
            <circle cx="18" cy="18" r="15.9" fill="none" stroke="hsl(51 100% 50%)"
              strokeWidth="3" strokeDasharray="100" strokeDashoffset={dashOffset} strokeLinecap="round"
              style={{ filter: 'drop-shadow(0 0 4px hsl(51 100% 50%))', transition: 'stroke-dashoffset 100ms linear' }}
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center font-mono text-xs font-bold text-accent-gold">{secs}s</div>
        </div>
        <div>
          <div className="font-rajdhani font-bold text-accent-gold tracking-wider">🔒 BID COOLDOWN ACTIVE</div>
          <div className="text-xs text-muted-foreground">Your team cannot bid for {secs} more second{secs !== 1 ? 's' : ''}.</div>
        </div>
      </div>
    </div>
  );
}

function CountdownTimer({ expiresAt, onExpire }: { expiresAt: number | null; onExpire: () => void }) {
  const [seconds, setSeconds] = useState(0);
  useEffect(() => {
    if (!expiresAt) return;
    const tick = () => {
      const rem = Math.max(0, Math.floor((expiresAt - Date.now()) / 1000));
      setSeconds(rem);
      if (rem === 0) onExpire();
    };
    tick();
    const iv = setInterval(tick, 1000);
    return () => clearInterval(iv);
  }, [expiresAt, onExpire]);

  return (
    <div className="text-center mt-2">
      <span className={`font-mono text-3xl font-bold ${seconds <= 5 ? 'text-accent-crimson animate-pulse' : 'text-accent-gold'}`}>{seconds}s</span>
    </div>
  );
}

function AuthModal({ slug, onAuth, onClose }: { slug: string; onAuth: () => void; onClose?: () => void }) {
  const { getTeamBySlug } = useAuction();
  const team = getTeamBySlug(slug);
  const [pw, setPw] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState('');
  const [lockout, setLockout] = useState(0);
  const [attempts, setAttempts] = useState(0);
  const lockoutRef = useRef<any>(null);

  const handleSubmit = () => {
    if (lockout > 0) return;
    if (!team) return;
    if (verifyTeamPassword(slug, pw, team.password_hash)) {
      sessionStorage.setItem(`team_auth_${slug}`, '1');
      onAuth();
    } else {
      const newAttempts = attempts + 1;
      setAttempts(newAttempts);
      if (newAttempts >= 3) {
        const lockSecs = 60;
        setLockout(lockSecs);
        setError(`Too many attempts. Locked for ${lockSecs}s.`);
        lockoutRef.current = setInterval(() => {
          setLockout(prev => {
            if (prev <= 1) { clearInterval(lockoutRef.current); setAttempts(0); setError(''); return 0; }
            return prev - 1;
          });
        }, 1000);
      } else {
        setError(`Incorrect password. ${3 - newAttempts} attempt${3 - newAttempts !== 1 ? 's' : ''} remaining.`);
      }
      setPw('');
    }
  };

  useEffect(() => () => { if (lockoutRef.current) clearInterval(lockoutRef.current); }, []);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md">
      <div className="bg-card border-2 border-border rounded-xl w-full max-w-sm p-6 shadow-2xl" style={team ? { borderTopColor: team.color, borderTopWidth: 3 } : {}}>
        <div className="flex items-center justify-between mb-2">
          <h3 className="font-exo font-bold text-foreground">{team ? team.name : 'Team Login'}</h3>
          {onClose && <button onClick={onClose} className="p-1 rounded hover:bg-muted/50 text-muted-foreground"><X size={16} /></button>}
        </div>
        <p className="text-xs text-muted-foreground mb-4">Enter your team password to access the private dashboard.</p>
        {lockout > 0 ? (
          <div className="text-center py-6">
            <div className="text-accent-crimson font-rajdhani font-bold mb-2">🔒 Too Many Attempts</div>
            <div className="font-mono text-4xl text-accent-crimson mb-2">{lockout}s</div>
            <div className="text-xs text-muted-foreground">Please wait before trying again</div>
          </div>
        ) : (
          <>
            <div className="relative mb-4">
              <input type={showPw ? 'text' : 'password'} value={pw}
                onChange={e => { setPw(e.target.value); setError(''); }}
                onKeyDown={e => e.key === 'Enter' && handleSubmit()}
                placeholder="Team password"
                className={`w-full bg-background border rounded-lg px-4 py-2.5 pr-10 text-foreground placeholder:text-muted-foreground focus:outline-none ${error ? 'border-accent-crimson' : 'border-border focus:border-accent-cyan/40'}`}
              />
              <button onClick={() => setShowPw(v => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                {showPw ? <EyeOff size={14} /> : <Eye size={14} />}
              </button>
            </div>
            {error && <p className="text-accent-crimson text-xs mb-3">{error}</p>}
            <button onClick={handleSubmit} className="btn-primary w-full">Authenticate</button>
          </>
        )}
      </div>
    </div>
  );
}

function AnnouncementBanner() {
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    const ch = supabase.channel('team-announcements')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'announcements' }, payload => {
        setMessage((payload.new as any).message);
        setTimeout(() => setMessage(null), 10000);
      })
      .subscribe();
    return () => { supabase.removeChannel(ch); };
  }, []);

  if (!message) return null;

  return (
    <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 bg-accent-orange/90 text-background font-rajdhani font-bold px-6 py-3 rounded-xl shadow-xl max-w-lg text-center animate-bounce-in">
      📢 {message}
    </div>
  );
}

export function TeamDashboard() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { auctionState, players, teams, freezes, rtmState, getTeamBySlug, getPlayer, useRtm, declineRtm } = useAuction();
  const { toast } = useToast();

  const team = slug ? getTeamBySlug(slug) : null;
  const currentPlayer = auctionState?.current_player_id ? getPlayer(auctionState.current_player_id) : null;
  const leadingTeam = auctionState?.leading_team_id ? teams.find(t => t.id === auctionState.leading_team_id) : null;
  const timerSeconds = useLocalTimer(auctionState?.timer_expires_at ?? null, auctionState?.timer_running ?? false);
  const isPaused = auctionState?.status === 'live' && !auctionState?.timer_running && currentPlayer;

  const [authenticated, setAuthenticated] = useState(() =>
    slug ? sessionStorage.getItem(`team_auth_${slug}`) === '1' : false
  );
  const [activeMobileTab, setActiveMobileTab] = useState<'auction' | 'squad'>('auction');

  const squadPlayers = team ? players.filter(p => p.soldToTeamId === team.id) : [];
  const isLeading = team && auctionState?.leading_team_id === team.id;

  const rtmEligible = rtmState?.active && rtmState.eligible_team_id === team?.id;
  const rtmPlayer = rtmState?.player_id ? getPlayer(rtmState.player_id) : null;

  const handleRtmExpire = useCallback(() => {
    if (rtmEligible) declineRtm();
  }, [rtmEligible, declineRtm]);

  const handleUseRtm = async () => {
    if (!team || !authenticated) return;
    if ((team.rtm_remaining ?? 0) <= 0) {
      toast({ title: 'No RTM cards remaining', variant: 'destructive' }); return;
    }
    if (rtmState && team.purse < rtmState.matched_price) {
      toast({ title: 'Insufficient purse for RTM', variant: 'destructive' }); return;
    }
    await useRtm(team.id);
    toast({ title: '✅ RTM Used — Player retained!' });
  };

  const handleDeclineRtm = async () => {
    await declineRtm();
    toast({ title: 'RTM Declined' });
  };

  if (!team) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="font-orbitron text-2xl text-foreground mb-4">Team Not Found</h1>
          <p className="text-muted-foreground mb-6">No team found for slug: <span className="font-mono text-accent-cyan">{slug}</span></p>
          <Link to="/teams" className="btn-primary">View All Teams</Link>
        </div>
      </div>
    );
  }

  if (!authenticated) {
    return <AuthModal slug={slug!} onAuth={() => setAuthenticated(true)} />;
  }

  const pursePct = (team.purse / (team.initial_purse || 12000)) * 100;

  const MobileTabs = () => (
    <div className="flex gap-1 p-1 bg-card border border-border rounded-xl mb-4 md:hidden">
      {(['auction', 'squad'] as const).map(tab => (
        <button key={tab} onClick={() => setActiveMobileTab(tab)}
          className={`flex-1 py-2 rounded-lg text-sm font-rajdhani font-semibold transition-all ${activeMobileTab === tab ? 'bg-accent-cyan/10 text-accent-cyan' : 'text-muted-foreground'}`}
        >
          {tab === 'auction' ? '🔴 Live' : '🏏 Squad'}
        </button>
      ))}
    </div>
  );

  return (
    <div className="min-h-screen bg-background pt-16 pb-12">
      {team && <FreezeBanner teamId={team.id} />}
      <AnnouncementBanner />

      {/* RTM Overlay */}
      {rtmEligible && rtmPlayer && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-md flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-card border-2 border-accent-purple/60 rounded-2xl overflow-hidden shadow-2xl" style={{ boxShadow: '0 0 40px rgba(168,85,247,0.4)' }}>
            <div className="bg-accent-purple/20 border-b border-accent-purple/40 p-4 text-center">
              <div className="font-orbitron font-black text-xl text-accent-purple tracking-wider">RIGHT TO MATCH</div>
              <div className="text-xs text-muted-foreground mt-1">Your RTM card is available to use</div>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <div className="font-exo font-bold text-xl text-foreground">{rtmPlayer.name}</div>
                <span className={`text-xs font-rajdhani font-bold px-2 py-0.5 rounded-full role-${rtmPlayer.role}`}>
                  {roleEmojis[rtmPlayer.role]} {rtmPlayer.role.replace('-', ' ').toUpperCase()}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="bg-muted/30 rounded-lg p-3 text-center">
                  <div className="text-xs text-muted-foreground font-rajdhani">FINAL BID</div>
                  <div className="font-mono text-xl font-bold text-accent-gold">{formatPrice(rtmState!.matched_price)}</div>
                </div>
                <div className="bg-muted/30 rounded-lg p-3 text-center">
                  <div className="text-xs text-muted-foreground font-rajdhani">RTM CARDS</div>
                  <div className="font-mono text-xl font-bold text-accent-purple">{team.rtm_remaining}</div>
                </div>
              </div>

              <CountdownTimer expiresAt={rtmState!.timer_expires_at} onExpire={handleRtmExpire} />

              <div className="flex gap-3">
                <button onClick={handleUseRtm}
                  disabled={!team.rtm_remaining || team.purse < (rtmState?.matched_price ?? 0)}
                  className="flex-1 btn-primary py-3 disabled:opacity-50">
                  USE RTM — Match {formatPrice(rtmState!.matched_price)}
                </button>
                <button onClick={handleDeclineRtm} className="btn-ghost px-4">Decline</button>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="container mx-auto px-4 pt-4">
        {/* Header */}
        <div className="glass-card p-4 mb-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-3 h-12 rounded-sm" style={{ background: team.color }} />
            <div>
              <h1 className="font-exo font-black text-2xl text-foreground">{team.name}</h1>
              <p className="text-xs text-muted-foreground">Private Team Dashboard</p>
            </div>
          </div>
          <div className="text-right flex items-center gap-4">
            <div>
              <div className="text-xs font-rajdhani text-muted-foreground tracking-wider">PURSE</div>
              <div className={`font-mono text-xl font-bold ${pursePct > 60 ? 'text-accent-emerald' : pursePct > 20 ? 'text-accent-gold' : 'text-accent-crimson'}`}>
                {formatPrice(team.purse)}
              </div>
            </div>
            <div>
              <div className="text-xs font-rajdhani text-muted-foreground tracking-wider">RTM</div>
              <div className="font-mono text-xl font-bold text-accent-purple">{team.rtm_remaining}</div>
            </div>
            <ConnectionStatus />
          </div>
        </div>

        <div className="w-full h-2 bg-muted rounded-full overflow-hidden mb-4">
          <div className={`h-full rounded-full transition-all duration-500 ${pursePct > 60 ? 'bg-accent-emerald' : pursePct > 20 ? 'bg-accent-gold' : 'bg-accent-crimson'}`} style={{ width: `${pursePct}%` }} />
        </div>

        <MobileTabs />

        <div className="grid md:grid-cols-2 gap-6">
          {/* Live Auction Panel */}
          <div className={`${activeMobileTab !== 'auction' ? 'hidden md:block' : ''}`}>
            {auctionState?.status === 'live' && currentPlayer ? (
              <div className="glass-card p-6">
                <div className="text-xs font-rajdhani text-accent-emerald tracking-wider mb-4 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-accent-emerald animate-pulse" /> LIVE AUCTION
                </div>

                <div className="mb-6">
                  <h2 className="font-exo font-bold text-2xl text-foreground">{currentPlayer.name}</h2>
                  <span className={`text-xs font-rajdhani font-bold px-2 py-0.5 rounded-full role-${currentPlayer.role}`}>
                    {roleEmojis[currentPlayer.role]} {currentPlayer.role.replace('-', ' ').toUpperCase()}
                  </span>
                  <div className="text-xs text-muted-foreground mt-1">{currentPlayer.subRole} · {currentPlayer.nationality.toUpperCase()}</div>
                  <div className="mt-2 grid grid-cols-3 gap-2">
                    {[
                      { label: 'BAT', value: currentPlayer.batting },
                      { label: 'BOWL', value: currentPlayer.bowling },
                      { label: 'FIELD', value: currentPlayer.fielding },
                    ].map(s => (
                      <div key={s.label} className="bg-card/60 border border-border rounded-lg px-2 py-1.5 text-center">
                        <div className="text-[9px] font-rajdhani text-muted-foreground">{s.label}</div>
                        <div className="font-mono text-sm font-bold text-accent-gold">{s.value}</div>
                      </div>
                    ))}
                  </div>
                </div>

                {isPaused ? (
                  <div className="bg-accent-gold/10 border border-accent-gold/40 rounded-xl p-4 text-center mb-4">
                    <div className="font-orbitron text-lg font-bold text-accent-gold tracking-widest">⏸ PAUSED</div>
                    <div className="text-xs text-muted-foreground mt-1">Auction paused by the auctioneer</div>
                  </div>
                ) : (
                  <div className="text-center mb-6">
                    <div className="text-xs font-rajdhani text-muted-foreground tracking-wider mb-1">CURRENT BID</div>
                    <div className="font-mono text-5xl font-bold text-accent-cyan text-glow-cyan">{formatPrice(auctionState.current_bid_amount)}</div>
                    {leadingTeam && (
                      <div className="mt-2 font-exo text-lg" style={{ color: leadingTeam.color }}>
                        {leadingTeam.id === team.id ? '🏆 YOUR BID IS LEADING' : `Leading: ${leadingTeam.name}`}
                      </div>
                    )}
                    <div className="text-center mb-4 mt-4">
                      <AuctionTimer seconds={timerSeconds} />
                      <TimerBar seconds={timerSeconds} max={auctionState.bid_reset_seconds || 15} />
                    </div>
                  </div>
                )}

                {isLeading && (
                  <div className="bg-accent-emerald/10 border border-accent-emerald/30 rounded-xl p-3 text-center mb-4">
                    <div className="font-rajdhani font-bold text-accent-emerald tracking-wider">🎉 YOU ARE THE HIGHEST BIDDER</div>
                    <div className="text-xs text-muted-foreground mt-1">Wait for the auctioneer to confirm the sale</div>
                  </div>
                )}
              </div>
            ) : (
              <div className="glass-card p-8 text-center">
                {auctionState?.status === 'complete' ? (
                  <><div className="font-orbitron text-2xl text-accent-gold mb-2">🏆 Auction Complete</div><p className="text-muted-foreground">The auction has ended.</p></>
                ) : (
                  <><div className="font-orbitron text-xl text-foreground mb-2">Waiting for Next Player</div><p className="text-muted-foreground text-sm">The auctioneer will introduce the next player shortly.</p></>
                )}
              </div>
            )}

            {/* Role requirements */}
            <div className="glass-card p-4 mt-4">
              <div className="text-xs font-rajdhani text-muted-foreground tracking-wider mb-3">SQUAD REQUIREMENTS</div>
              <div className="space-y-2">
                {Object.entries(MIN_REQ).map(([role, min]) => {
                  const count = squadPlayers.filter(p => p.role === role).length;
                  const ok = count >= min;
                  return (
                    <div key={role} className="flex items-center justify-between">
                      <span className="text-xs text-muted-foreground">{roleEmojis[role]} {role.replace('-', ' ')}</span>
                      <span className={`text-xs font-mono font-bold ${ok ? 'text-accent-emerald' : 'text-accent-crimson'}`}>
                        {count} {min > 0 ? `/ ${min} min` : ''} {ok ? '✓' : '⚠'}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Squad */}
          <div className={`${activeMobileTab !== 'squad' ? 'hidden md:block' : ''}`}>
            <div className="glass-card p-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-exo font-semibold text-foreground">Your Squad ({squadPlayers.length})</h3>
                <span className="font-mono text-xs text-muted-foreground">
                  Spent: {formatPrice(squadPlayers.reduce((s, p) => s + (p.soldPrice || 0), 0))}
                </span>
              </div>
              {squadPlayers.length === 0 ? (
                <p className="text-muted-foreground text-sm text-center py-8">No players acquired yet.</p>
              ) : (
                <div className="space-y-2 max-h-[600px] overflow-auto">
                  {squadPlayers.map(p => (
                    <div key={p.id} className="flex items-center gap-3 p-2 rounded-lg bg-muted/30">
                      <div className="w-10 h-10 rounded-lg border border-border bg-muted/40 flex items-center justify-center flex-shrink-0">
                        <span className="font-mono text-xs font-bold text-accent-cyan">
                          {p.name.split(' ').map((n: string) => n[0]).slice(0, 2).join('')}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium text-foreground truncate">{p.name}</div>
                        <span className={`text-[10px] font-rajdhani role-${p.role}`}>
                          {roleEmojis[p.role]} {p.role.replace('-', ' ').toUpperCase()}
                        </span>
                      </div>
                      <span className="font-mono text-sm text-accent-cyan font-bold">{formatPrice(p.soldPrice || 0)}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
