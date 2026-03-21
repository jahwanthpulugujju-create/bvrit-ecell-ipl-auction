import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useAuction, formatPrice, TeamDB } from '@/context/AuctionContext';
import AuctionTimer, { TimerBar } from '@/components/AuctionTimer';
import ConnectionStatus from '@/components/ConnectionStatus';
import { roleEmojis, Player } from '@/data/players';
import { createTeamSlug, generateTeamPassword, hashTeamPassword, MIN_ROLE_REQUIREMENTS } from '@/data/teams';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';
import { toggleMute, getMuted } from '@/lib/sounds';
import {
  Search, Play, Pause, RotateCcw, Hammer, X, Users, BarChart3, Eye, Plus,
  Download, Trash2, Edit2, Megaphone, DollarSign, EyeOff, Volume2, VolumeX,
  AlertTriangle, RefreshCcw, Trophy,
} from 'lucide-react';
import RankingDashboard from '@/components/RankingDashboard';


export default function Admin() {
  const [authed, setAuthed] = useState(() => sessionStorage.getItem('admin_auth') === '1');
  const [pw, setPw] = useState('');
  const [pwError, setPwError] = useState(false);
  const [activeTab, setActiveTab] = useState('auction');

  const handleAuth = async () => {
    if (pw === 'BVRIT2026') {
      sessionStorage.setItem('admin_auth', '1');
      setAuthed(true);
      await supabase.auth.signInAnonymously().catch(() => {});
    } else {
      setPwError(true);
    }
  };

  useEffect(() => {
    if (authed) supabase.auth.signInAnonymously().catch(() => {});
  }, [authed]);

  if (!authed) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="glass-card p-8 w-full max-w-sm text-center">
          <h1 className="font-orbitron text-2xl text-foreground mb-2">Admin Access</h1>
          <p className="text-muted-foreground text-sm mb-6">Enter the auctioneer password</p>
          <input
            type="password" value={pw}
            onChange={e => { setPw(e.target.value); setPwError(false); }}
            onKeyDown={e => e.key === 'Enter' && handleAuth()}
            placeholder="Password"
            className={`w-full bg-card border rounded-lg px-4 py-3 text-foreground placeholder:text-muted-foreground focus:outline-none mb-4 ${pwError ? 'border-accent-crimson' : 'border-border focus:border-accent-cyan/40'}`}
          />
          {pwError && <p className="text-accent-crimson text-xs mb-4">Incorrect password</p>}
          <button onClick={handleAuth} className="btn-primary w-full">Unlock</button>
        </div>
      </div>
    );
  }

  const tabs = [
    { id: 'auction', label: 'Auction Control', icon: <Hammer size={16} /> },
    { id: 'players', label: 'Players', icon: <Users size={16} /> },
    { id: 'teams', label: 'Teams', icon: <BarChart3 size={16} /> },
    { id: 'monitor', label: 'Monitor', icon: <Eye size={16} /> },
    { id: 'ranking', label: 'Ranking', icon: <Trophy size={16} /> },
  ];

  return (
    <div className="min-h-screen bg-background pt-16">
      <div className="glass-navbar sticky top-16 z-40">
        <div className="container mx-auto px-4 flex gap-1 overflow-x-auto py-2">
          {tabs.map(t => (
            <button key={t.id} onClick={() => setActiveTab(t.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${activeTab === t.id ? 'bg-accent-cyan/10 text-accent-cyan' : 'text-muted-foreground hover:text-foreground'}`}
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

function useLocalTimer(timerExpiresAt: number | null, timerRunning: boolean): number {
  const [seconds, setSeconds] = useState(15);
  useEffect(() => {
    const tick = () => {
      if (timerExpiresAt === null) {
        setSeconds(15);
      } else if (timerExpiresAt < 0) {
        setSeconds(Math.max(0, Math.ceil(-timerExpiresAt / 1000)));
      } else {
        setSeconds(Math.max(0, Math.floor((timerExpiresAt - Date.now()) / 1000)));
      }
    };
    tick();
    if (!timerRunning) return;
    const iv = setInterval(tick, 500);
    return () => clearInterval(iv);
  }, [timerExpiresAt, timerRunning]);
  return seconds;
}

function TeamBidButton({ team }: { team: TeamDB }) {
  const { auctionState, registerBid, players } = useAuction();
  const { toast } = useToast();
  const [showQuickView, setShowQuickView] = useState(false);

  const isLeading = team.id === auctionState?.leading_team_id;
  const isPaused = auctionState?.status === 'live' && !auctionState?.timer_running && !!auctionState?.current_player_id;
  const canAfford = auctionState
    ? team.purse >= (auctionState.leading_team_id ? auctionState.current_bid_amount + auctionState.bid_increment : auctionState.current_bid_amount)
    : false;

  async function handleClick() {
    if (isLeading || !canAfford || isPaused) return;
    const result = await registerBid(team.id);
    if (!result.success) {
      if (result.reason === 'AUCTION_PAUSED') {
        toast({ title: '⏸ Auction is paused — resume before bidding', variant: 'destructive' });
      } else if (result.reason === 'INSUFFICIENT_PURSE') {
        toast({ title: `Insufficient purse — ${formatPrice(result.purseRemaining)} remaining`, variant: 'destructive' });
      } else if (result.reason === 'NO_CURRENT_PLAYER') {
        toast({ title: 'No player selected', variant: 'destructive' });
      }
    }
  }

  const teamSquad = players.filter(p => p.soldToTeamId === team.id);

  return (
    <>
      <button
        onClick={handleClick}
        onContextMenu={e => { e.preventDefault(); setShowQuickView(v => !v); }}
        disabled={!canAfford || isPaused}
        title={isPaused ? 'Auction paused' : isLeading ? 'Leading' : 'Right-click for quick view'}
        className={`relative p-3 rounded-lg text-sm font-semibold transition-all border-2 overflow-hidden ${
          isPaused ? 'border-accent-gold/40 bg-accent-gold/5 text-muted-foreground opacity-60 cursor-not-allowed' :
          isLeading ? 'border-accent-emerald bg-accent-emerald/10 text-accent-emerald' :
          canAfford ? 'border-border bg-card text-foreground hover:border-accent-cyan/50 hover:-translate-y-0.5 cursor-pointer' :
          'border-border bg-card/50 text-muted-foreground opacity-50 cursor-not-allowed'
        }`}
        style={canAfford && !isLeading && !isPaused ? { borderColor: team.color + '60' } : {}}
      >
        <div className="h-1 w-full rounded mb-2 -mx-0 absolute top-0 left-0 right-0" style={{ background: team.color }} />
        <div className="pt-1">
          <div className="truncate font-exo">{team.name}</div>
          <div className="font-mono text-xs mt-0.5 text-muted-foreground">{formatPrice(team.purse)}</div>
          {teamSquad.length > 0 && <div className="text-[10px] text-muted-foreground/70">{teamSquad.length} players</div>}
        </div>
      </button>
      {showQuickView && <TeamQuickView team={team} onClose={() => setShowQuickView(false)} />}
    </>
  );
}

function TeamQuickView({ team, onClose }: { team: TeamDB; onClose: () => void }) {
  const { players } = useAuction();
  const squadPlayers = players.filter(p => p.soldToTeamId === team.id);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="bg-card border-2 border-border rounded-xl w-full max-w-sm shadow-2xl overflow-hidden" style={{ borderTopColor: team.color, borderTopWidth: 3 }}>
        <div className="flex items-center justify-between p-4 border-b border-border">
          <h3 className="font-exo font-bold text-foreground">{team.name}</h3>
          <button onClick={onClose} className="p-1 rounded hover:bg-muted/50 text-muted-foreground"><X size={16} /></button>
        </div>
        <div className="p-4 space-y-3">
          <div className="grid grid-cols-3 gap-2 text-xs">
            <div className="bg-muted/30 rounded p-2 text-center">
              <div className="text-muted-foreground">Purse</div>
              <div className="font-mono text-accent-cyan font-bold">{formatPrice(team.purse)}</div>
            </div>
            <div className="bg-muted/30 rounded p-2 text-center">
              <div className="text-muted-foreground">Squad</div>
              <div className="font-mono font-bold">{squadPlayers.length}</div>
            </div>
            <div className="bg-muted/30 rounded p-2 text-center">
              <div className="text-muted-foreground">RTM</div>
              <div className="font-mono text-accent-purple font-bold">{team.rtm_remaining}</div>
            </div>
          </div>

          <div>
            <div className="text-xs font-rajdhani text-muted-foreground tracking-wider mb-2">ROLE COMPOSITION</div>
            {Object.entries(MIN_ROLE_REQUIREMENTS).map(([role, min]) => {
              const count = squadPlayers.filter(p => p.role === role).length;
              const ok = count >= min;
              return (
                <div key={role} className="flex items-center justify-between text-xs py-1 border-b border-border/30">
                  <span className="text-muted-foreground">{roleEmojis[role]} {role.replace('-', ' ')}</span>
                  <span className={ok ? 'text-accent-emerald' : 'text-accent-crimson'}>
                    {count}{min > 0 ? ` / min ${min}` : ''} {ok ? '✓' : '⚠'}
                  </span>
                </div>
              );
            })}
          </div>

          {squadPlayers.length > 0 && (
            <div className="max-h-40 overflow-auto space-y-1">
              <div className="text-xs font-rajdhani text-muted-foreground tracking-wider mb-1">SQUAD</div>
              {squadPlayers.map(p => (
                <div key={p.id} className="flex items-center justify-between text-xs py-1">
                  <span className="text-foreground truncate">{p.name}</span>
                  <span className="font-mono text-accent-cyan ml-2">{p.soldPrice ? formatPrice(p.soldPrice) : '—'}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function AuctionControl() {
  const {
    auctionState, players, teams,
    setCurrentPlayer, confirmSale, markUnsold,
    startTimer, pauseTimer, resetTimer,
    setStatus, setBidIncrement, resetAuction,
  } = useAuction();
  const { toast } = useToast();
  const [search, setSearch] = useState('');
  const [showSold, setShowSold] = useState(false);
  const [soldInfo, setSoldInfo] = useState({ player: '', team: '' });
  const [muted, setMuted] = useState(getMuted);
  const [showResetModal, setShowResetModal] = useState(false);
  const [resetTyped, setResetTyped] = useState('');
  const [resetting, setResetting] = useState(false);

  const handleResetAuction = async () => {
    if (resetTyped !== 'RESET') return;
    setResetting(true);
    try {
      await resetAuction();
      setShowResetModal(false);
      setResetTyped('');
      toast({ title: 'Auction Reset', description: 'All player statuses and team purses have been restored to their starting values.' });
    } finally {
      setResetting(false);
    }
  };

  const timerSeconds = useLocalTimer(auctionState?.timer_expires_at ?? null, auctionState?.timer_running ?? false);

  const currentPlayer = auctionState?.current_player_id ? players.find(p => p.id === auctionState.current_player_id) : null;
  const leadingTeam = auctionState?.leading_team_id ? teams.find(t => t.id === auctionState.leading_team_id) : null;
  const isPaused = auctionState?.status === 'live' && !auctionState?.timer_running && !!currentPlayer;

  const availablePlayers = useMemo(() =>
    players.filter(p => p.status === 'available' && p.name.toLowerCase().includes(search.toLowerCase())).slice(0, 10),
    [players, search]
  );

  const increments = [
    { label: '₹5L', value: 5 }, { label: '₹10L', value: 10 }, { label: '₹25L', value: 25 },
    { label: '₹50L', value: 50 }, { label: '₹1Cr', value: 100 },
  ];

  const handleSell = async () => {
    if (!auctionState?.leading_team_id || !auctionState.current_player_id) return;
    const player = players.find(p => p.id === auctionState.current_player_id);
    const team = teams.find(t => t.id === auctionState.leading_team_id);
    if (!player || !team) return;
    if (!window.confirm(`Sell ${player.name} to ${team.name} for ${formatPrice(auctionState.current_bid_amount)}?`)) return;
    setSoldInfo({ player: player.name, team: team.name });
    setShowSold(true);
    setTimeout(() => setShowSold(false), 3000);
    await confirmSale();
  };

  const handleUnsold = async () => {
    if (!auctionState?.current_player_id) return;
    const player = players.find(p => p.id === auctionState.current_player_id);
    if (!window.confirm(`Mark ${player?.name} as unsold?`)) return;
    await markUnsold();
  };

  const soldCount = players.filter(p => p.status === 'sold').length;
  const totalValue = players.filter(p => p.status === 'sold').reduce((s, p) => s + (p.soldPrice || 0), 0);

  return (
    <div className="space-y-6">
      <div className="glass-card p-4 flex flex-wrap items-center gap-4">
        <div className="flex items-center gap-2">
          <span className={`w-2.5 h-2.5 rounded-full ${auctionState?.status === 'live' ? 'bg-accent-emerald animate-pulse' : 'bg-muted-foreground'}`} />
          <span className="font-rajdhani font-bold text-sm text-foreground tracking-wider">{(auctionState?.status || 'PRE').toUpperCase()}</span>
        </div>
        <span className="font-mono text-sm text-muted-foreground">Sold: {soldCount}</span>
        <span className="font-mono text-sm text-muted-foreground">Value: {formatPrice(totalValue)}</span>
        <ConnectionStatus className="ml-1" />
        <button onClick={() => { const m = toggleMute(); setMuted(m); }} className="ml-1 p-1.5 rounded hover:bg-muted/50 text-muted-foreground" title={muted ? 'Unmute' : 'Mute'}>
          {muted ? <VolumeX size={14} /> : <Volume2 size={14} />}
        </button>
        <div className="ml-auto flex gap-2">
          {(['live', 'complete'] as const).map(s => (
            <button key={s} onClick={() => setStatus(s)}
              className={`px-3 py-1 rounded text-xs font-rajdhani font-semibold ${auctionState?.status === s ? 'bg-accent-cyan text-background' : 'bg-card text-muted-foreground border border-border'}`}
            >{s.toUpperCase()}</button>
          ))}
          <button
            onClick={() => { setShowResetModal(true); setResetTyped(''); }}
            className="flex items-center gap-1.5 px-3 py-1 rounded text-xs font-rajdhani font-semibold bg-red-900/60 border border-red-600/60 text-red-300 hover:bg-red-800/80 hover:text-red-100 transition-colors"
            title="Reset entire auction"
          >
            <RefreshCcw size={12} />
            RESET
          </button>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          {currentPlayer ? (
            <div className="glass-card p-6">
              <div className="flex items-start gap-4 mb-6">
                <div className="w-20 h-20 rounded-xl border-2 border-accent-cyan/30 bg-muted/40 flex items-center justify-center flex-shrink-0">
                  <span className="font-orbitron font-black text-2xl text-accent-cyan">
                    {currentPlayer.name.split(' ').map((n: string) => n[0]).slice(0, 2).join('')}
                  </span>
                </div>
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
                <div className="font-mono text-5xl font-bold text-accent-cyan text-glow-cyan mb-2">{formatPrice(auctionState?.current_bid_amount || currentPlayer.basePrice)}</div>
                {leadingTeam && <div className="font-exo text-lg" style={{ color: leadingTeam.color }}>{leadingTeam.name}</div>}
              </div>

              {isPaused && (
                <div className="bg-accent-gold/10 border border-accent-gold/40 rounded-xl p-3 text-center mb-4">
                  <div className="font-orbitron text-sm font-bold text-accent-gold tracking-widest">⏸ AUCTION PAUSED</div>
                  <div className="text-xs text-muted-foreground mt-1">Bids are blocked — press Start to resume</div>
                </div>
              )}

              <div className="text-center mb-6">
                <AuctionTimer seconds={timerSeconds} />
                <TimerBar seconds={timerSeconds} max={auctionState?.bid_reset_seconds || 15} />
              </div>

              <div className="flex justify-center gap-2 mb-6">
                <button onClick={startTimer} className="btn-primary flex items-center gap-1.5 text-sm py-2 px-4"><Play size={14} /> Start</button>
                <button onClick={pauseTimer} className="btn-ghost flex items-center gap-1.5 text-sm py-2 px-4"><Pause size={14} /> Pause</button>
                <button onClick={resetTimer} className="btn-ghost flex items-center gap-1.5 text-sm py-2 px-4"><RotateCcw size={14} /> Reset</button>
              </div>

              <div className="mb-4">
                <div className="text-xs font-rajdhani text-muted-foreground tracking-wider mb-2">BID INCREMENT</div>
                <div className="flex gap-2 flex-wrap">
                  {increments.map(inc => (
                    <button key={inc.value} onClick={() => setBidIncrement(inc.value)}
                      className={`px-3 py-1.5 rounded text-xs font-mono font-semibold transition-all ${auctionState?.bid_increment === inc.value ? 'bg-accent-cyan text-background' : 'bg-card text-muted-foreground border border-border hover:border-accent-cyan/40'}`}
                    >{inc.label}</button>
                  ))}
                </div>
              </div>

              <div className="mb-4">
                <div className="text-xs font-rajdhani text-muted-foreground tracking-wider mb-2">WHO RAISED THE PLACARD?</div>
                <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-2">
                  {teams.filter(t => t.is_active).map(t => <TeamBidButton key={t.id} team={t} />)}
                </div>
              </div>

              <div className="flex gap-2">
                <button onClick={handleSell} disabled={!auctionState?.leading_team_id}
                  className="btn-gold flex items-center gap-1.5 flex-1 justify-center disabled:opacity-50">
                  <Hammer size={16} /> SELL
                </button>
                <button onClick={handleUnsold} className="btn-crimson flex items-center gap-1.5 flex-1 justify-center">
                  <X size={16} /> UNSOLD
                </button>
              </div>
            </div>
          ) : (
            <div className="glass-card p-8 text-center">
              <h2 className="font-orbitron text-xl text-foreground mb-4">Select a Player</h2>
              <p className="text-muted-foreground text-sm">Search and select a player to start the auction</p>
            </div>
          )}

          <div className="glass-card p-4">
            <div className="text-xs font-rajdhani text-muted-foreground tracking-wider mb-2">SET CURRENT PLAYER</div>
            <div className="relative mb-3">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="Search available players..."
                className="w-full bg-card border border-border rounded-lg pl-10 pr-4 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-accent-cyan/40"
              />
            </div>
            <div className="space-y-1 max-h-60 overflow-auto">
              {availablePlayers.map(p => (
                <button key={p.id} onClick={() => setCurrentPlayer(p.id)}
                  className="w-full flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50 transition-colors text-left">
                  <div className="w-8 h-8 rounded-lg border border-border bg-muted/40 flex items-center justify-center flex-shrink-0">
                    <span className="font-mono text-xs font-bold text-accent-cyan">
                      {p.name.split(' ').map((n: string) => n[0]).slice(0, 2).join('')}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-foreground truncate">{p.name}</div>
                    <span className={`text-[10px] font-rajdhani role-${p.role} px-1.5 py-0.5 rounded`}>
                      {roleEmojis[p.role]} {p.role.replace('-', ' ').toUpperCase()}
                    </span>
                  </div>
                  <span className="font-mono text-xs text-accent-cyan">{formatPrice(p.basePrice)}</span>
                </button>
              ))}
              {availablePlayers.length === 0 && <p className="text-muted-foreground text-xs text-center py-4">No available players match "{search}"</p>}
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="glass-card p-4">
            <h3 className="font-exo font-semibold text-foreground text-sm mb-3">Auction Log</h3>
            <AuctionLogPanel />
          </div>
        </div>
      </div>

      {showSold && (
        <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-md flex items-center justify-center">
          <div className="text-center animate-sold-stamp">
            <div className="font-orbitron text-6xl font-black text-accent-gold text-glow-gold border-4 border-accent-gold px-8 py-4 -rotate-12">SOLD!</div>
            <div className="font-exo text-2xl text-foreground mt-4">{soldInfo.player} → {soldInfo.team}</div>
          </div>
        </div>
      )}

      {showResetModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-card border border-red-600/50 rounded-2xl p-8 max-w-md w-full shadow-2xl">
            <div className="flex items-center gap-3 mb-5">
              <div className="p-2.5 rounded-full bg-red-900/60 border border-red-600/60">
                <AlertTriangle className="text-red-400" size={22} />
              </div>
              <h2 className="font-exo font-bold text-xl text-foreground">Reset Entire Auction</h2>
            </div>
            <p className="text-muted-foreground text-sm mb-2 leading-relaxed">
              This will permanently erase all auction progress:
            </p>
            <ul className="text-sm text-muted-foreground mb-5 space-y-1.5 list-none">
              {[
                'All sold players returned to the pool',
                'All team purses restored to starting amounts',
                'RTM counts reset to 3 for every team',
                'Entire auction log cleared',
              ].map(item => (
                <li key={item} className="flex items-start gap-2">
                  <span className="text-red-400 mt-0.5">✕</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
            <p className="text-sm font-semibold text-red-400 mb-2">
              Type <span className="font-mono bg-red-900/40 px-1.5 py-0.5 rounded">RESET</span> to confirm:
            </p>
            <input
              type="text"
              value={resetTyped}
              onChange={e => setResetTyped(e.target.value.toUpperCase())}
              onKeyDown={e => { if (e.key === 'Enter') handleResetAuction(); }}
              placeholder="Type RESET here"
              autoFocus
              className="w-full bg-background border border-border rounded-lg px-4 py-2.5 font-mono text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-red-500 mb-5 text-sm"
            />
            <div className="flex gap-3">
              <button
                onClick={handleResetAuction}
                disabled={resetTyped !== 'RESET' || resetting}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg font-rajdhani font-bold text-sm bg-red-700 hover:bg-red-600 text-white disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                <RefreshCcw size={15} />
                {resetting ? 'Resetting…' : 'Reset Auction'}
              </button>
              <button
                onClick={() => { setShowResetModal(false); setResetTyped(''); }}
                disabled={resetting}
                className="px-6 py-2.5 rounded-lg font-rajdhani font-semibold text-sm bg-muted/40 text-muted-foreground hover:bg-muted/60 transition-colors disabled:opacity-40"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function AuctionLogPanel() {
  const [logs, setLogs] = useState<any[]>([]);

  useEffect(() => {
    const load = async () => {
      const { data } = await supabase.from('auction_log').select('*').order('created_at', { ascending: false }).limit(50);
      if (data) setLogs(data);
    };
    load();
    const ch = supabase.channel('admin-log')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'auction_log' }, payload => {
        setLogs(prev => [payload.new, ...prev].slice(0, 50));
      })
      .subscribe();
    return () => { supabase.removeChannel(ch); };
  }, []);

  return (
    <div className="space-y-2 max-h-[600px] overflow-auto">
      {logs.map((log, i) => (
        <div key={i} className={`p-2 rounded-lg text-xs ${log.type === 'sold' ? 'bg-accent-gold/10 border border-accent-gold/20' : log.type === 'unsold' ? 'bg-accent-crimson/10 border border-accent-crimson/20' : 'bg-card border border-border'}`}>
          <div className="text-foreground">{log.message}</div>
          <div className="text-muted-foreground mt-0.5">{new Date(log.created_at).toLocaleTimeString()}</div>
        </div>
      ))}
      {logs.length === 0 && <p className="text-muted-foreground text-xs text-center py-4">No activity yet</p>}
    </div>
  );
}

function PlayerManagement() {
  const { players, reIntroducePlayer } = useAuction();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const filtered = players.filter(p =>
    (statusFilter === 'all' || p.status === statusFilter) &&
    p.name.toLowerCase().includes(search.toLowerCase())
  );
  const counts = {
    available: players.filter(p => p.status === 'available').length,
    sold: players.filter(p => p.status === 'sold').length,
    unsold: players.filter(p => p.status === 'unsold').length,
    live: players.filter(p => p.status === 'live').length,
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="font-exo font-bold text-xl text-foreground">Player Management</h2>
          <p className="text-xs text-muted-foreground">
            {players.length} total · {counts.sold} sold · {counts.unsold} unsold · {counts.available} available
          </p>
        </div>
      </div>
      <div className="flex gap-2 mb-4 flex-wrap">
        {(['all', 'available', 'live', 'sold', 'unsold'] as const).map(s => (
          <button key={s} onClick={() => setStatusFilter(s)}
            className={`px-3 py-1 rounded text-xs font-rajdhani font-semibold ${statusFilter === s ? 'bg-accent-cyan text-background' : 'bg-card text-muted-foreground border border-border'}`}
          >{s.toUpperCase()}{s !== 'all' ? ` (${counts[s as keyof typeof counts] ?? 0})` : ''}</button>
        ))}
        <div className="relative ml-auto">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="Search..."
            className="bg-card border border-border rounded-lg pl-10 pr-4 py-1.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-accent-cyan/40 w-48"
          />
        </div>
      </div>
      <div className="glass-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left p-3 text-xs font-rajdhani text-muted-foreground">#</th>
                <th className="text-left p-3 text-xs font-rajdhani text-muted-foreground">PLAYER</th>
                <th className="text-left p-3 text-xs font-rajdhani text-muted-foreground">ROLE</th>
                <th className="text-right p-3 text-xs font-rajdhani text-muted-foreground">BASE</th>
                <th className="text-right p-3 text-xs font-rajdhani text-muted-foreground">RATING</th>
                <th className="text-center p-3 text-xs font-rajdhani text-muted-foreground">STATUS</th>
                <th className="text-center p-3 text-xs font-rajdhani text-muted-foreground">ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              {filtered.slice(0, 80).map((p, i) => (
                <tr key={p.id} className="border-b border-border/50 hover:bg-muted/30 transition-colors">
                  <td className="p-3 text-xs font-mono text-muted-foreground">{i + 1}</td>
                  <td className="p-3">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-lg border border-border bg-muted/40 flex items-center justify-center flex-shrink-0">
                        <span className="font-mono text-xs font-bold text-accent-cyan">
                          {p.name.split(' ').map((n: string) => n[0]).slice(0, 2).join('')}
                        </span>
                      </div>
                      <span className="text-sm text-foreground font-medium">{p.name}</span>
                    </div>
                  </td>
                  <td className="p-3">
                    <span className={`text-[10px] font-rajdhani font-bold px-2 py-0.5 rounded-full role-${p.role}`}>
                      {roleEmojis[p.role]} {p.role.replace('-', ' ').toUpperCase()}
                    </span>
                  </td>
                  <td className="p-3 text-right font-mono text-xs text-accent-cyan">{formatPrice(p.basePrice)}</td>
                  <td className="p-3 text-right font-mono text-xs text-accent-gold">{p.rating.toFixed(1)}</td>
                  <td className="p-3 text-center">
                    <span className={`text-[10px] font-rajdhani font-bold px-2 py-0.5 rounded-full border status-${p.status}`}>
                      {p.status.toUpperCase()}
                    </span>
                  </td>
                  <td className="p-3 text-center">
                    {p.status === 'unsold' && (
                      <button onClick={() => reIntroducePlayer(p.id)} className="text-xs text-accent-cyan hover:underline">Re-introduce</button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

interface TeamForm {
  name: string; slug: string; city: string; color: string;
  initialPurse: number; rtmCards: number; isActive: boolean;
  password: string; passwordHash: string;
}

const defaultForm: TeamForm = {
  name: '', slug: '', city: '', color: '#00d4ff',
  initialPurse: 120, rtmCards: 2, isActive: true, password: '', passwordHash: '',
};

function TeamManagement() {
  const { teams } = useAuction();
  const { toast } = useToast();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editTeam, setEditTeam] = useState<TeamDB | null>(null);
  const [form, setForm] = useState<TeamForm>(defaultForm);
  const [formErrors, setFormErrors] = useState<Partial<Record<keyof TeamForm, string>>>({});
  const [saving, setSaving] = useState(false);
  const [showPw, setShowPw] = useState(false);
  const [newTeamId, setNewTeamId] = useState<string | null>(null);
  const [expandedRow, setExpandedRow] = useState<string | null>(null);
  const [expandMode, setExpandMode] = useState<'purse' | 'announce' | null>(null);
  const [purseAdj, setPurseAdj] = useState('');
  const [purseSign, setPurseSign] = useState<'+' | '-'>('+');
  const [purseReason, setPurseReason] = useState('');
  const [announceMsg, setAnnounceMsg] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [credentialPasswords, setCredentialPasswords] = useState<Record<string, string>>({});

  const openAdd = () => { setEditTeam(null); setForm(defaultForm); setFormErrors({}); setShowPw(false); setDrawerOpen(true); };
  const openEdit = (team: TeamDB) => {
    setEditTeam(team);
    setForm({ name: team.name, slug: team.slug, city: team.city, color: team.color, initialPurse: team.initial_purse / 100, rtmCards: team.rtm_remaining, isActive: team.is_active, password: '', passwordHash: team.password_hash });
    setFormErrors({}); setShowPw(false); setDrawerOpen(true);
  };

  const genPassword = () => {
    const pw = generateTeamPassword();
    const hash = hashTeamPassword(form.slug || editTeam?.slug || 'team', pw);
    setForm(f => ({ ...f, password: pw, passwordHash: hash }));
    setShowPw(true);
    if (editTeam) setCredentialPasswords(p => ({ ...p, [editTeam.id]: pw }));
  };

  const handleNameChange = (name: string) => {
    const slug = createTeamSlug(name);
    setForm(f => ({ ...f, name, slug }));
  };

  const validate = () => {
    const errors: Partial<Record<keyof TeamForm, string>> = {};
    if (!form.name.trim()) errors.name = 'Team name is required';
    if (!form.slug.trim()) errors.slug = 'Slug is required';
    if (!/^[a-z0-9-]+$/.test(form.slug)) errors.slug = 'Only lowercase letters, numbers, hyphens';
    if (!form.city.trim()) errors.city = 'City is required';
    if (!editTeam && !form.password) errors.password = 'Generate a password first';
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSave = async () => {
    if (!validate()) return;
    setSaving(true);
    try {
      if (editTeam) {
        const updates: any = { name: form.name, slug: form.slug, city: form.city, color: form.color, initial_purse: form.initialPurse * 100, rtm_remaining: form.rtmCards, is_active: form.isActive, updated_at: new Date().toISOString() };
        if (form.password) updates.password_hash = form.passwordHash;
        await supabase.from('teams').update(updates).eq('id', editTeam.id);
        toast({ title: `Team ${form.name} updated` });
      } else {
        const { data, error } = await supabase.from('teams').insert({ name: form.name, slug: form.slug, city: form.city, color: form.color, initial_purse: form.initialPurse * 100, purse: form.initialPurse * 100, rtm_remaining: form.rtmCards, password_hash: form.passwordHash, is_active: form.isActive }).select().single();
        if (error) throw error;
        setNewTeamId(data.id);
        setCredentialPasswords(p => ({ ...p, [data.id]: form.password }));
        setTimeout(() => setNewTeamId(null), 3000);
        toast({ title: `Team ${form.name} created` });
      }
      setDrawerOpen(false);
    } catch (e: any) {
      toast({ title: 'Error saving team', description: e.message, variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteTeam = async (teamId: string) => {
    await supabase.from('teams').delete().eq('id', teamId);
    setDeleteConfirm(null);
    toast({ title: 'Team deleted' });
  };

  const handleAdjustPurse = async (teamId: string) => {
    const team = teams.find(t => t.id === teamId);
    if (!team || !purseAdj || !purseReason) return;
    const adjLakhs = parseFloat(purseAdj) * 100;
    const newPurse = purseSign === '+' ? team.purse + adjLakhs : team.purse - adjLakhs;
    await supabase.from('teams').update({ purse: newPurse, updated_at: new Date().toISOString() }).eq('id', teamId);
    await supabase.from('auction_log').insert({ type: 'admin_purse_adjustment', team_id: teamId, amount: adjLakhs, message: `Admin adjusted purse: ${purseSign}${purseAdj} Cr — ${purseReason}` });
    setExpandedRow(null); setPurseAdj(''); setPurseReason('');
    toast({ title: `Purse adjusted for ${team.name}` });
  };

  const handleAnnounce = async () => {
    if (!announceMsg.trim()) return;
    await supabase.from('announcements').insert({ message: announceMsg });
    setExpandedRow(null); setAnnounceMsg('');
    toast({ title: 'Announcement sent to all dashboards' });
  };

  const downloadCSV = () => {
    const rows = [
      ['Team Name', 'Slug', 'Dashboard URL', 'Password', 'Initial Purse'],
      ...teams.map(t => [t.name, t.slug, `${window.location.origin}/team/${t.slug}`, credentialPasswords[t.id] || '(see admin)', `₹${(t.initial_purse / 100).toFixed(0)} Cr`]),
    ];
    const csv = rows.map(r => r.map(v => `"${v}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `bvrit_credentials_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="font-exo font-bold text-xl text-foreground">Team Management</h2>
          <p className="text-xs text-muted-foreground">{teams.length} teams</p>
        </div>
        <div className="flex gap-2">
          <button onClick={downloadCSV} className="btn-ghost flex items-center gap-1.5 text-sm py-2 px-4"><Download size={14} /> Download Credentials</button>
          <button onClick={openAdd} className="btn-secondary flex items-center gap-1.5 text-sm py-2 px-4"><Plus size={14} /> Add New Team</button>
        </div>
      </div>

      {teams.length === 0 ? (
        <div className="glass-card p-12 text-center"><p className="text-muted-foreground">No teams yet. Click "Add New Team" to get started.</p></div>
      ) : (
        <div className="glass-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left p-3 text-xs font-rajdhani text-muted-foreground">TEAM</th>
                  <th className="text-left p-3 text-xs font-rajdhani text-muted-foreground">CITY</th>
                  <th className="text-right p-3 text-xs font-rajdhani text-muted-foreground">PURSE</th>
                  <th className="text-center p-3 text-xs font-rajdhani text-muted-foreground">RTM</th>
                  <th className="text-center p-3 text-xs font-rajdhani text-muted-foreground">STATUS</th>
                  <th className="text-center p-3 text-xs font-rajdhani text-muted-foreground">ACTIONS</th>
                </tr>
              </thead>
              <tbody>
                {teams.map(team => (
                  <>
                    <tr key={team.id} className={`border-b border-border/50 hover:bg-muted/30 transition-all ${newTeamId === team.id ? 'bg-accent-cyan/10' : ''}`}>
                      <td className="p-3">
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-8 rounded-sm" style={{ background: team.color }} />
                          <div>
                            <div className="text-sm font-medium text-foreground">{team.name}</div>
                            <div className="text-xs text-muted-foreground font-mono">{team.slug}</div>
                          </div>
                        </div>
                      </td>
                      <td className="p-3 text-xs text-muted-foreground">{team.city}</td>
                      <td className="p-3 text-right font-mono text-sm text-accent-cyan">{formatPrice(team.purse)}</td>
                      <td className="p-3 text-center font-mono text-sm">{team.rtm_remaining}</td>
                      <td className="p-3 text-center">
                        <span className={`text-xs font-rajdhani font-semibold ${team.is_active ? 'text-accent-emerald' : 'text-muted-foreground'}`}>
                          {team.is_active ? '● Active' : '○ Inactive'}
                        </span>
                      </td>
                      <td className="p-3">
                        <div className="flex items-center justify-center gap-1">
                          <button onClick={() => openEdit(team)} className="p-1.5 rounded hover:bg-muted/50 text-muted-foreground hover:text-accent-cyan"><Edit2 size={14} /></button>
                          <button onClick={() => { setExpandedRow(expandedRow === team.id && expandMode === 'purse' ? null : team.id); setExpandMode('purse'); }} className="p-1.5 rounded hover:bg-muted/50 text-muted-foreground hover:text-accent-gold"><DollarSign size={14} /></button>
                          <button onClick={() => { setExpandedRow(expandedRow === team.id && expandMode === 'announce' ? null : team.id); setExpandMode('announce'); }} className="p-1.5 rounded hover:bg-muted/50 text-muted-foreground hover:text-accent-orange"><Megaphone size={14} /></button>
                          <button onClick={() => setDeleteConfirm(deleteConfirm === team.id ? null : team.id)} className="p-1.5 rounded hover:bg-muted/50 text-muted-foreground hover:text-accent-crimson"><Trash2 size={14} /></button>
                        </div>
                      </td>
                    </tr>
                    {expandedRow === team.id && expandMode === 'purse' && (
                      <tr key={`${team.id}-purse`} className="border-b border-border/50 bg-accent-gold/5">
                        <td colSpan={6} className="p-4">
                          <div className="text-xs font-rajdhani text-accent-gold tracking-wider mb-3">ADJUST PURSE — {team.name.toUpperCase()}</div>
                          <div className="flex items-center gap-3 flex-wrap">
                            <span className="text-sm text-muted-foreground">Current: {formatPrice(team.purse)}</span>
                            <div className="flex gap-1">
                              <button onClick={() => setPurseSign('+')} className={`px-2 py-1 rounded text-xs ${purseSign === '+' ? 'bg-accent-emerald/20 text-accent-emerald' : 'bg-card text-muted-foreground border border-border'}`}>+</button>
                              <button onClick={() => setPurseSign('-')} className={`px-2 py-1 rounded text-xs ${purseSign === '-' ? 'bg-accent-crimson/20 text-accent-crimson' : 'bg-card text-muted-foreground border border-border'}`}>−</button>
                            </div>
                            <input type="number" min="0" value={purseAdj} onChange={e => setPurseAdj(e.target.value)} placeholder="Amount in Cr" className="bg-card border border-border rounded px-3 py-1.5 text-sm text-foreground focus:outline-none w-36" />
                            <input type="text" value={purseReason} onChange={e => setPurseReason(e.target.value)} placeholder="Reason" className="bg-card border border-border rounded px-3 py-1.5 text-sm text-foreground focus:outline-none flex-1 min-w-48" />
                            <button onClick={() => handleAdjustPurse(team.id)} className="btn-primary text-sm py-1.5 px-4">Apply</button>
                            <button onClick={() => setExpandedRow(null)} className="btn-ghost text-sm py-1.5 px-4">Cancel</button>
                          </div>
                        </td>
                      </tr>
                    )}
                    {expandedRow === team.id && expandMode === 'announce' && (
                      <tr key={`${team.id}-announce`} className="border-b border-border/50 bg-accent-orange/5">
                        <td colSpan={6} className="p-4">
                          <div className="text-xs font-rajdhani text-accent-orange tracking-wider mb-3">ANNOUNCEMENT TO ALL DASHBOARDS</div>
                          <div className="flex items-center gap-3 flex-wrap">
                            <input type="text" value={announceMsg} onChange={e => setAnnounceMsg(e.target.value.slice(0, 120))} placeholder="Message..." className="flex-1 min-w-64 bg-card border border-border rounded px-3 py-1.5 text-sm text-foreground focus:outline-none" />
                            <button onClick={handleAnnounce} className="btn-secondary text-sm py-1.5 px-4"><Megaphone size={14} /> Send</button>
                            <button onClick={() => setExpandedRow(null)} className="btn-ghost text-sm py-1.5 px-4">Cancel</button>
                          </div>
                        </td>
                      </tr>
                    )}
                    {deleteConfirm === team.id && (
                      <tr key={`${team.id}-delete`} className="border-b border-border/50 bg-accent-crimson/5">
                        <td colSpan={6} className="p-4">
                          <div className="flex items-center gap-3">
                            <span className="text-sm text-accent-crimson">Delete {team.name}? This cannot be undone.</span>
                            <button onClick={() => handleDeleteTeam(team.id)} className="btn-crimson text-sm py-1.5 px-4">Confirm Delete</button>
                            <button onClick={() => setDeleteConfirm(null)} className="btn-ghost text-sm py-1.5 px-4">Cancel</button>
                          </div>
                        </td>
                      </tr>
                    )}
                  </>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {drawerOpen && (
        <div className="fixed inset-0 z-50 flex">
          <div className="flex-1 bg-black/50 backdrop-blur-sm" onClick={() => setDrawerOpen(false)} />
          <div className="w-full max-w-md bg-card border-l-2 border-border h-full overflow-y-auto p-8 flex flex-col gap-6">
            <div className="flex items-center justify-between">
              <h2 className="font-exo font-bold text-xl text-foreground">{editTeam ? 'Edit Team' : 'Add New Team'}</h2>
              <button onClick={() => setDrawerOpen(false)} className="p-2 rounded hover:bg-muted/50 text-muted-foreground"><X size={20} /></button>
            </div>

            <div className="space-y-4">
              {[{ label: 'TEAM NAME *', key: 'name', ph: 'Mumbai Mavericks', onChange: (v: string) => handleNameChange(v) },
                { label: 'CITY *', key: 'city', ph: 'Mumbai' }].map(({ label, key, ph, onChange }) => (
                <div key={key}>
                  <label className="text-xs font-rajdhani text-muted-foreground tracking-wider mb-1.5 block">{label}</label>
                  <input value={(form as any)[key]} onChange={e => onChange ? onChange(e.target.value) : setForm(f => ({ ...f, [key]: e.target.value }))} placeholder={ph}
                    className={`w-full bg-background border rounded-lg px-4 py-2.5 text-foreground focus:outline-none ${(formErrors as any)[key] ? 'border-accent-crimson' : 'border-border focus:border-accent-cyan/40'}`}
                  />
                  {(formErrors as any)[key] && <p className="text-accent-crimson text-xs mt-1">{(formErrors as any)[key]}</p>}
                </div>
              ))}

              <div>
                <label className="text-xs font-rajdhani text-muted-foreground tracking-wider mb-1.5 block">SLUG *</label>
                <input value={form.slug} onChange={e => setForm(f => ({ ...f, slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '') }))} placeholder="mumbai-mavericks"
                  className={`w-full bg-background border rounded-lg px-4 py-2.5 text-foreground font-mono text-sm focus:outline-none ${formErrors.slug ? 'border-accent-crimson' : 'border-border focus:border-accent-cyan/40'}`}
                />
                {formErrors.slug && <p className="text-accent-crimson text-xs mt-1">{formErrors.slug}</p>}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-rajdhani text-muted-foreground tracking-wider mb-1.5 block">TEAM COLOR</label>
                  <div className="flex items-center gap-2">
                    <input type="color" value={form.color} onChange={e => setForm(f => ({ ...f, color: e.target.value }))} className="w-10 h-10 rounded cursor-pointer border-0 bg-transparent" />
                    <span className="font-mono text-xs text-muted-foreground">{form.color}</span>
                  </div>
                </div>
                <div>
                  <label className="text-xs font-rajdhani text-muted-foreground tracking-wider mb-1.5 block">INITIAL PURSE (Cr)</label>
                  <input type="number" min="1" value={form.initialPurse} onChange={e => setForm(f => ({ ...f, initialPurse: parseFloat(e.target.value) || 0 }))}
                    className="w-full bg-background border border-border rounded-lg px-4 py-2.5 text-foreground focus:outline-none focus:border-accent-cyan/40" />
                </div>
              </div>

              <div>
                <label className="text-xs font-rajdhani text-muted-foreground tracking-wider mb-1.5 block">RTM CARDS</label>
                <div className="flex gap-2">
                  {[0, 1, 2, 3].map(n => (
                    <button key={n} onClick={() => setForm(f => ({ ...f, rtmCards: n }))}
                      className={`flex-1 py-2 rounded text-sm font-bold ${form.rtmCards === n ? 'bg-accent-purple/20 text-accent-purple border border-accent-purple/40' : 'bg-card text-muted-foreground border border-border'}`}
                    >{n}</button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-xs font-rajdhani text-muted-foreground tracking-wider mb-1.5 block">PASSWORD {editTeam ? '(leave blank to keep current)' : '*'}</label>
                <div className="flex gap-2 mb-2">
                  <button onClick={genPassword} className="btn-secondary text-sm py-2 flex-1">⚡ Generate Password</button>
                </div>
                {form.password && (
                  <>
                    <div className="p-3 bg-accent-gold/10 border border-accent-gold/30 rounded-lg mb-2">
                      <p className="text-xs text-accent-gold font-semibold mb-1">⚠️ Save this password now — it cannot be retrieved after closing</p>
                      <div className="flex items-center gap-2">
                        <input type={showPw ? 'text' : 'password'} value={form.password} readOnly
                          className="flex-1 bg-background border border-border rounded px-3 py-1.5 text-sm font-mono text-foreground" />
                        <button onClick={() => setShowPw(v => !v)} className="p-2 text-muted-foreground hover:text-foreground">
                          {showPw ? <EyeOff size={14} /> : <Eye size={14} />}
                        </button>
                        <button onClick={() => navigator.clipboard.writeText(form.password)} className="p-2 text-muted-foreground hover:text-accent-cyan" title="Copy">📋</button>
                      </div>
                    </div>
                  </>
                )}
                {formErrors.password && <p className="text-accent-crimson text-xs mt-1">{formErrors.password}</p>}
              </div>

              <div className="flex items-center gap-3">
                <label className="text-xs font-rajdhani text-muted-foreground tracking-wider">ACTIVE</label>
                <button onClick={() => setForm(f => ({ ...f, isActive: !f.isActive }))}
                  className={`w-12 h-6 rounded-full transition-colors ${form.isActive ? 'bg-accent-emerald' : 'bg-muted'}`}>
                  <span className={`block w-5 h-5 rounded-full bg-white shadow transition-transform mx-0.5 ${form.isActive ? 'translate-x-6' : 'translate-x-0'}`} />
                </button>
              </div>
            </div>

            <div className="flex gap-3 pt-4 border-t border-border">
              <button onClick={handleSave} disabled={saving} className="btn-primary flex-1 py-3">{saving ? 'Saving…' : editTeam ? 'Save Changes' : 'Create Team'}</button>
              <button onClick={() => setDrawerOpen(false)} className="btn-ghost px-6">Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function LiveMonitor() {
  const { teams, players, auctionState, connected } = useAuction();
  const currentPlayer = auctionState?.current_player_id ? players.find(p => p.id === auctionState.current_player_id) : null;
  const soldCount = players.filter(p => p.status === 'sold').length;
  const unsoldCount = players.filter(p => p.status === 'unsold').length;

  return (
    <div className="space-y-6">
      <div className="glass-card p-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-exo font-bold text-xl text-foreground">Live Monitor</h2>
          <ConnectionStatus />
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'Status', value: (auctionState?.status || 'live').toUpperCase() },
            { label: 'Sold', value: soldCount },
            { label: 'Unsold', value: unsoldCount },
            { label: 'Available', value: players.filter(p => p.status === 'available').length },
          ].map(stat => (
            <div key={stat.label} className="bg-muted/30 rounded-lg p-3 text-center">
              <div className="text-xs font-rajdhani text-muted-foreground tracking-wider">{stat.label}</div>
              <div className="font-mono text-xl font-bold text-foreground mt-1">{stat.value}</div>
            </div>
          ))}
        </div>
      </div>

      {currentPlayer && (
        <div className="glass-card p-4">
          <div className="text-xs font-rajdhani text-accent-emerald tracking-wider mb-3 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-accent-emerald animate-pulse" /> ON THE BLOCK
          </div>
          <div className="flex items-center gap-4">
            <img src={currentPlayer.photo} alt={currentPlayer.name} className="w-16 h-16 rounded-xl border border-border object-cover" />
            <div>
              <div className="font-exo font-bold text-xl text-foreground">{currentPlayer.name}</div>
              <div className="font-mono text-2xl text-accent-cyan">{formatPrice(auctionState!.current_bid_amount)}</div>
              {auctionState?.leading_team_id && (
                <div className="text-sm text-muted-foreground">Leading: {teams.find(t => t.id === auctionState.leading_team_id)?.name}</div>
              )}
            </div>
          </div>
        </div>
      )}

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {teams.map(team => {
          const squad = players.filter(p => p.soldToTeamId === team.id);
          const pursePct = team.initial_purse > 0 ? (team.purse / team.initial_purse) * 100 : 0;
          return (
            <div key={team.id} className="glass-card p-4" style={{ borderTopColor: team.color, borderTopWidth: 2 }}>
              <div className="flex items-center justify-between mb-2">
                <span className="font-exo font-semibold text-foreground">{team.name}</span>
              </div>
              <div className="font-mono text-lg text-accent-cyan mb-2">{formatPrice(team.purse)}</div>
              <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden mb-2">
                <div className="h-full rounded-full bg-accent-cyan transition-all" style={{ width: `${pursePct}%` }} />
              </div>
              <div className="text-xs text-muted-foreground">{squad.length} players · {team.rtm_remaining} RTM</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

