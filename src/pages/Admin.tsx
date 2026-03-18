import { useState, useMemo, useEffect, useRef, useCallback } from 'react';
import { useAuction, formatPrice } from '@/context/AuctionContext';
import AuctionTimer, { TimerBar } from '@/components/AuctionTimer';
import PlayerCard from '@/components/PlayerCard';
import { roleEmojis, Player } from '@/data/players';
import { createTeamSlug, generateTeamPassword, hashTeamPassword, EMPTY_ROLE_COUNTS, Team } from '@/data/teams';
import { Search, Play, Pause, RotateCcw, Hammer, X, Undo2, Users, Settings, BarChart3, Eye, Plus, Key, Lock, Unlock, Copy, Download, Trash2, Edit2, Megaphone, DollarSign, ChevronDown, ChevronUp, Eye as EyeIcon, EyeOff } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';
import ConnectionStatus from '@/components/ConnectionStatus';
import { RealtimeChannel } from '@supabase/supabase-js';

export default function Admin() {
  const [authed, setAuthed] = useState(() => sessionStorage.getItem('admin_auth') === '1');
  const [pw, setPw] = useState('');
  const [pwError, setPwError] = useState(false);
  const [activeTab, setActiveTab] = useState('auction');

  const handleAuth = async () => {
    if (pw === 'BVRIT2026') {
      sessionStorage.setItem('admin_auth', '1');
      setAuthed(true);
      await supabase.auth.signInAnonymously();
    } else {
      setPwError(true);
    }
  };

  useEffect(() => {
    if (authed) { supabase.auth.signInAnonymously().catch(() => {}); }
  }, [authed]);

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
            onKeyDown={e => e.key === 'Enter' && handleAuth()}
            placeholder="Password"
            className={`w-full bg-card border rounded-lg px-4 py-3 text-foreground placeholder:text-muted-foreground focus:outline-none mb-4 ${
              pwError ? 'border-accent-crimson focus:border-accent-crimson' : 'border-border focus:border-accent-cyan/40'
            }`}
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
  ];

  return (
    <div className="min-h-screen bg-background pt-16">
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

function useSupabaseSync() {
  const { state } = useAuction();

  const syncAuctionState = useCallback(async (updates: Record<string, any>) => {
    await supabase.from('auction_state').update({ ...updates, updated_at: new Date().toISOString() }).eq('id', 1);
  }, []);

  const syncBid = useCallback(async (playerId: string, teamId: string, amount: number, freezeExpiresAt: number, freezeSeconds: number) => {
    await Promise.all([
      supabase.from('bids').insert({ player_id: playerId, team_id: teamId, amount }),
      supabase.from('team_player_freezes').upsert({
        team_id: teamId, player_id: playerId,
        freeze_expires_at: freezeExpiresAt, freeze_seconds: freezeSeconds, bid_amount: amount,
      }, { onConflict: 'team_id,player_id' }),
    ]);
  }, []);

  const syncSell = useCallback(async (playerId: string, teamId: string, price: number) => {
    await Promise.all([
      supabase.from('players').update({ status: 'sold', sold_to_team_id: teamId, sold_price: price, updated_at: new Date().toISOString() }).eq('id', playerId),
      supabase.from('teams').update({ purse: state.teams.find(t => t.id === teamId)!.purse - price, updated_at: new Date().toISOString() }).eq('id', teamId),
      supabase.from('team_squads').upsert({ team_id: teamId, player_id: playerId, purchase_price: price }, { onConflict: 'team_id,player_id' }),
      supabase.from('team_player_freezes').delete().eq('player_id', playerId),
      supabase.from('auction_log').insert({ type: 'sold', player_id: playerId, team_id: teamId, amount: price, message: `Sold for ${formatPrice(price)}` }),
    ]);
  }, [state.teams]);

  const syncUnsold = useCallback(async (playerId: string) => {
    await Promise.all([
      supabase.from('players').update({ status: 'unsold', updated_at: new Date().toISOString() }).eq('id', playerId),
      supabase.from('team_player_freezes').delete().eq('player_id', playerId),
      supabase.from('auction_log').insert({ type: 'unsold', player_id: playerId, message: 'Went unsold' }),
    ]);
  }, []);

  return { syncAuctionState, syncBid, syncSell, syncUnsold };
}

function FreezeRing({ teamId, playerId, freezeExpiresAt, freezeSeconds }: { teamId: string; playerId: string; freezeExpiresAt: number; freezeSeconds: number }) {
  const [remaining, setRemaining] = useState(Math.max(0, freezeExpiresAt - Date.now()));

  useEffect(() => {
    const tick = () => {
      const rem = Math.max(0, freezeExpiresAt - Date.now());
      setRemaining(rem);
    };
    tick();
    const interval = setInterval(tick, 100);
    return () => clearInterval(interval);
  }, [freezeExpiresAt]);

  if (remaining <= 0) return null;

  const total = freezeSeconds * 1000;
  const pct = (remaining / total) * 100;
  const dashOffset = 100 - pct;

  return (
    <div className="absolute inset-0 flex items-center justify-center bg-black/60 z-10 rounded-lg">
      <svg viewBox="0 0 36 36" className="w-12 h-12" style={{ transform: 'rotate(-90deg)' }}>
        <circle cx="18" cy="18" r="15.9" fill="none" stroke="rgba(245,158,11,0.2)" strokeWidth="3" />
        <circle
          cx="18" cy="18" r="15.9" fill="none"
          stroke="hsl(51 100% 50%)"
          strokeWidth="3"
          strokeDasharray="100"
          strokeDashoffset={dashOffset}
          strokeLinecap="round"
          style={{ filter: 'drop-shadow(0 0 4px hsl(51 100% 50%))', transition: 'stroke-dashoffset 100ms linear' }}
        />
      </svg>
      <span className="absolute font-mono text-[11px] text-accent-gold font-bold" style={{ transform: 'none' }}>
        🔒 {Math.ceil(remaining / 1000)}s
      </span>
    </div>
  );
}

function AuctionControl() {
  const { state, dispatch, getPlayer } = useAuction();
  const { syncAuctionState, syncBid, syncSell, syncUnsold } = useSupabaseSync();
  const [channel, setChannel] = useState<RealtimeChannel | null>(null);
  const currentPlayer = state.currentPlayerId ? getPlayer(state.currentPlayerId) : null;
  const leadingTeam = state.leadingTeamId ? state.teams.find(t => t.id === state.leadingTeamId) : null;
  const [search, setSearch] = useState('');
  const [showSold, setShowSold] = useState(false);
  const [soldPlayerName, setSoldPlayerName] = useState('');
  const [soldTeamName, setSoldTeamName] = useState('');

  useEffect(() => {
    const ch = supabase.channel('admin-auction-status');
    setChannel(ch);
    ch.subscribe();
    return () => { supabase.removeChannel(ch); };
  }, []);

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

  const handleSetPlayer = async (playerId: string) => {
    const player = state.players.find(p => p.id === playerId);
    if (!player) return;
    dispatch({ type: 'SET_CURRENT_PLAYER', playerId });
    await syncAuctionState({
      current_player_id: playerId,
      current_bid_amount: player.basePrice,
      leading_team_id: null,
      timer_running: false,
      timer_expires_at: null,
      status: 'live',
    });
    await supabase.from('players').update({ status: 'live' }).eq('id', playerId);
  };

  const handleBid = async (teamId: string) => {
    const team = state.teams.find(t => t.id === teamId);
    if (!team || !state.currentPlayerId) return;
    const newBid = state.leadingTeamId ? state.currentBid + state.bidIncrement : state.currentBid;
    if (team.purse < newBid) return;
    const freeze = state.freezes.find(f => f.teamId === teamId && f.playerId === state.currentPlayerId && f.freezeExpiresAt > Date.now());
    if (freeze) return;
    dispatch({ type: 'PLACE_BID', teamId });
    const bidIncrInState = state.leadingTeamId ? state.bidIncrement : 0;
    const actualNewBid = state.leadingTeamId ? state.currentBid + state.bidIncrement : state.currentBid;
    const freezeSecs = Math.min(Math.max(3, 3 + Math.floor(actualNewBid / 20) * 2), 30);
    const now = Date.now();
    const freezeExpiresAt = now + freezeSecs * 1000;
    const timerExpiresAt = now + 15000;
    await Promise.all([
      syncAuctionState({
        current_bid_amount: actualNewBid,
        leading_team_id: teamId,
        timer_running: true,
        timer_expires_at: timerExpiresAt,
      }),
      syncBid(state.currentPlayerId, teamId, actualNewBid, freezeExpiresAt, freezeSecs),
    ]);
  };

  const handleSell = async () => {
    if (!state.leadingTeamId || !state.currentPlayerId) return;
    const player = getPlayer(state.currentPlayerId);
    const team = state.teams.find(t => t.id === state.leadingTeamId);
    if (!player || !team) return;
    if (!window.confirm(`Sell ${player.name} to ${team.name} for ${formatPrice(state.currentBid)}?`)) return;
    setSoldPlayerName(player.name);
    setSoldTeamName(team.name);
    dispatch({ type: 'SELL_PLAYER' });
    setShowSold(true);
    setTimeout(() => setShowSold(false), 3000);
    await syncSell(player.id, team.id, state.currentBid);
    await syncAuctionState({ current_player_id: null, current_bid_amount: 0, leading_team_id: null, timer_running: false });
  };

  const handleUnsold = async () => {
    if (!state.currentPlayerId) return;
    const player = getPlayer(state.currentPlayerId);
    if (!player) return;
    if (!window.confirm(`Mark ${player.name} as unsold?`)) return;
    dispatch({ type: 'MARK_UNSOLD' });
    await syncUnsold(player.id);
    await syncAuctionState({ current_player_id: null, current_bid_amount: 0, leading_team_id: null, timer_running: false });
  };

  const handleStartTimer = async () => {
    dispatch({ type: 'START_TIMER' });
    await syncAuctionState({ timer_running: true, timer_expires_at: Date.now() + state.timerSeconds * 1000 });
  };

  const handlePauseTimer = async () => {
    dispatch({ type: 'PAUSE_TIMER' });
    await syncAuctionState({ timer_running: false });
  };

  const handleResetTimer = async () => {
    dispatch({ type: 'RESET_TIMER', seconds: 15 });
    await syncAuctionState({ timer_running: false, timer_expires_at: null });
  };

  return (
    <div className="space-y-6">
      <div className="glass-card p-4 flex flex-wrap items-center gap-4">
        <div className="flex items-center gap-2">
          <span className={`w-2.5 h-2.5 rounded-full ${state.status === 'live' ? 'bg-accent-emerald animate-pulse' : 'bg-muted-foreground'}`} />
          <span className="font-rajdhani font-bold text-sm text-foreground tracking-wider">{state.status.toUpperCase()}</span>
        </div>
        <span className="font-mono text-sm text-muted-foreground">Sold: {state.soldCount}</span>
        <span className="font-mono text-sm text-muted-foreground">Value: {formatPrice(state.totalValue)}</span>
        <span className="font-mono text-sm text-muted-foreground">Phase: {state.currentPhase.toUpperCase()}</span>
        <ConnectionStatus channel={channel} className="ml-2" />
        <div className="ml-auto flex gap-2">
          {(['pre', 'live', 'complete'] as const).map(s => (
            <button
              key={s}
              onClick={async () => { dispatch({ type: 'SET_STATUS', status: s }); await syncAuctionState({ status: s }); }}
              className={`px-3 py-1 rounded text-xs font-rajdhani font-semibold ${state.status === s ? 'bg-accent-cyan text-background' : 'bg-card text-muted-foreground border border-border'}`}
            >
              {s.toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          {currentPlayer ? (
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

              <div className="flex justify-center gap-2 mb-6">
                <button onClick={handleStartTimer} className="btn-primary flex items-center gap-1.5 text-sm py-2 px-4">
                  <Play size={14} /> Start
                </button>
                <button onClick={handlePauseTimer} className="btn-ghost flex items-center gap-1.5 text-sm py-2 px-4">
                  <Pause size={14} /> Pause
                </button>
                <button onClick={handleResetTimer} className="btn-ghost flex items-center gap-1.5 text-sm py-2 px-4">
                  <RotateCcw size={14} /> Reset
                </button>
              </div>

              <div className="mb-4">
                <div className="text-xs font-rajdhani text-muted-foreground tracking-wider mb-2">BID INCREMENT</div>
                <div className="flex gap-2">
                  {increments.map(inc => (
                    <button
                      key={inc.value}
                      onClick={async () => { dispatch({ type: 'SET_INCREMENT', increment: inc.value }); await syncAuctionState({ bid_increment: inc.value }); }}
                      className={`px-3 py-1.5 rounded text-xs font-mono font-semibold transition-all ${state.bidIncrement === inc.value ? 'bg-accent-cyan text-background' : 'bg-card text-muted-foreground border border-border'}`}
                    >
                      {inc.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="mb-4">
                <div className="text-xs font-rajdhani text-muted-foreground tracking-wider mb-2">WHO RAISED THE PLACARD?</div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                  {state.teams.map(t => {
                    const canAfford = t.purse >= (state.leadingTeamId ? state.currentBid + state.bidIncrement : state.currentBid);
                    const freeze = state.freezes.find(f => f.teamId === t.id && f.playerId === state.currentPlayerId && f.freezeExpiresAt > Date.now());
                    const isLeading = t.id === state.leadingTeamId;
                    return (
                      <button
                        key={t.id}
                        onClick={() => !isLeading && canAfford && !freeze && handleBid(t.id)}
                        disabled={!canAfford || isLeading}
                        className={`relative p-3 rounded-lg text-sm font-semibold transition-all border-2 overflow-hidden ${
                          isLeading
                            ? 'border-accent-emerald bg-accent-emerald/10 text-accent-emerald'
                            : freeze
                            ? 'border-accent-gold bg-accent-gold/10 cursor-not-allowed'
                            : canAfford
                            ? 'border-border bg-card text-foreground hover:border-accent-cyan/50 hover:-translate-y-0.5'
                            : 'border-border bg-card/50 text-muted-foreground opacity-50 cursor-not-allowed'
                        }`}
                        style={canAfford && !isLeading && !freeze ? { borderColor: t.color + '40' } : {}}
                      >
                        {freeze && (
                          <FreezeRing
                            teamId={t.id}
                            playerId={state.currentPlayerId!}
                            freezeExpiresAt={freeze.freezeExpiresAt}
                            freezeSeconds={freeze.freezeSeconds}
                          />
                        )}
                        <div className="truncate">{t.name}</div>
                        <div className="font-mono text-xs mt-1 text-muted-foreground">{formatPrice(t.purse)}</div>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={handleSell}
                  disabled={!state.leadingTeamId}
                  className="btn-gold flex items-center gap-1.5 flex-1 justify-center disabled:opacity-50"
                >
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
                  onClick={() => handleSetPlayer(p.id)}
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

      {showSold && (
        <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-md flex items-center justify-center">
          <div className="text-center animate-sold-stamp">
            <div className="font-orbitron text-6xl font-black text-accent-gold text-glow-gold border-4 border-accent-gold px-8 py-4 -rotate-12">SOLD!</div>
            {soldTeamName && <div className="font-exo text-2xl text-foreground mt-4">{soldPlayerName} → {soldTeamName}</div>}
          </div>
        </div>
      )}
    </div>
  );
}

function PlayerManagement() {
  const { state } = useAuction();
  const [search, setSearch] = useState('');
  const filtered = state.players.filter(p => p.name.toLowerCase().includes(search.toLowerCase()));
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
        <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="Search players..."
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
                        {p.status.toUpperCase()}{team && ` (${team.name})`}
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

interface TeamForm {
  name: string;
  slug: string;
  city: string;
  color: string;
  initialPurse: number;
  rtmCards: number;
  isActive: boolean;
  password: string;
  passwordHash: string;
}

const defaultForm: TeamForm = {
  name: '', slug: '', city: '', color: '#00d4ff', initialPurse: 100,
  rtmCards: 2, isActive: true, password: '', passwordHash: '',
};

function TeamManagement() {
  const { state } = useAuction();
  const { toast } = useToast();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editTeam, setEditTeam] = useState<any>(null);
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

  const openAdd = () => {
    setEditTeam(null);
    setForm(defaultForm);
    setFormErrors({});
    setShowPw(false);
    setDrawerOpen(true);
  };

  const openEdit = (team: any) => {
    setEditTeam(team);
    setForm({
      name: team.name,
      slug: team.slug,
      city: team.city,
      color: team.color,
      initialPurse: team.initialPurse / 100,
      rtmCards: team.rtmRemaining,
      isActive: team.isActive,
      password: '',
      passwordHash: team.passwordHash,
    });
    setFormErrors({});
    setShowPw(false);
    setDrawerOpen(true);
  };

  const genPassword = () => {
    const pw = generateTeamPassword();
    const hash = hashTeamPassword(form.slug || editTeam?.slug || 'team', pw);
    setForm(f => ({ ...f, password: pw, passwordHash: hash }));
    setShowPw(true);
    if (editTeam) {
      setCredentialPasswords(p => ({ ...p, [editTeam.id]: pw }));
    }
  };

  const handleNameChange = (name: string) => {
    const slug = createTeamSlug(name);
    setForm(f => ({ ...f, name, slug }));
  };

  const validate = (): boolean => {
    const errors: Partial<Record<keyof TeamForm, string>> = {};
    if (!form.name.trim()) errors.name = 'Team name is required';
    if (form.name.length > 40) errors.name = 'Max 40 characters';
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
        const updates: any = {
          name: form.name,
          slug: form.slug,
          city: form.city,
          color: form.color,
          initial_purse: form.initialPurse * 100,
          rtm_remaining: form.rtmCards,
          is_active: form.isActive,
          updated_at: new Date().toISOString(),
        };
        if (form.password) updates.password_hash = form.passwordHash;
        await supabase.from('teams').update(updates).eq('id', editTeam.id);
        toast({ title: `Team ${form.name} updated` });
      } else {
        const { data, error } = await supabase.from('teams').insert({
          name: form.name,
          slug: form.slug,
          city: form.city,
          color: form.color,
          initial_purse: form.initialPurse * 100,
          purse: form.initialPurse * 100,
          rtm_remaining: form.rtmCards,
          password_hash: form.passwordHash,
          is_active: form.isActive,
        }).select().single();
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
    const team = state.teams.find(t => t.id === teamId);
    if (!team) return;
    if (team.players.length > 0) {
      toast({ title: 'Cannot delete team with players in squad', variant: 'destructive' });
      return;
    }
    await supabase.from('teams').delete().eq('id', teamId);
    setDeleteConfirm(null);
    toast({ title: `Team ${team.name} deleted` });
  };

  const handleAdjustPurse = async (teamId: string) => {
    const team = state.teams.find(t => t.id === teamId);
    if (!team || !purseAdj || !purseReason) return;
    const adjLakhs = parseFloat(purseAdj) * 100;
    const newPurse = purseSign === '+' ? team.purse + adjLakhs : team.purse - adjLakhs;
    await supabase.from('teams').update({ purse: newPurse, updated_at: new Date().toISOString() }).eq('id', teamId);
    await supabase.from('auction_log').insert({ type: 'admin_purse_adjustment', team_id: teamId, amount: adjLakhs, message: `Admin adjusted purse: ${purseSign}${purseAdj} Cr — ${purseReason}` });
    setExpandedRow(null);
    setPurseAdj(''); setPurseReason('');
    toast({ title: `Purse adjusted for ${team.name}` });
  };

  const handleAnnounce = async (teamId: string) => {
    if (!announceMsg.trim()) return;
    await supabase.from('announcements').insert({ message: announceMsg });
    setExpandedRow(null);
    setAnnounceMsg('');
    toast({ title: 'Announcement sent to all dashboards' });
  };

  const downloadCSV = () => {
    const domain = window.location.origin;
    const rows = [
      ['Team Name', 'Slug', 'Dashboard URL', 'Password', 'Initial Purse'],
      ...state.teams.map(t => [
        t.name, t.slug,
        `${domain}/team/${t.slug}`,
        credentialPasswords[t.id] || '(use Reset Password)',
        `₹${(t.initialPurse / 100).toFixed(0)} Cr`,
      ]),
    ];
    const csv = rows.map(r => r.map(v => `"${v}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    const date = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    a.href = url; a.download = `bvrit_team_credentials_${date}.csv`;
    a.click(); URL.revokeObjectURL(url);
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast({ title: `${label} copied!` });
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="font-exo font-bold text-xl text-foreground">Team Management</h2>
          <p className="text-xs text-muted-foreground">{state.teams.length} teams configured</p>
        </div>
        <div className="flex gap-2">
          <button onClick={downloadCSV} className="btn-ghost flex items-center gap-1.5 text-sm py-2 px-4">
            <Download size={14} /> Download Credentials
          </button>
          <button onClick={openAdd} className="btn-secondary flex items-center gap-1.5 text-sm py-2 px-4">
            <Plus size={14} /> Add New Team
          </button>
        </div>
      </div>

      {state.teams.length === 0 ? (
        <div className="glass-card p-12 text-center">
          <p className="text-muted-foreground">No teams yet. Click "Add New Team" to get started.</p>
        </div>
      ) : (
        <div className="glass-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left p-3 text-xs font-rajdhani text-muted-foreground">TEAM</th>
                  <th className="text-left p-3 text-xs font-rajdhani text-muted-foreground">CITY</th>
                  <th className="text-right p-3 text-xs font-rajdhani text-muted-foreground">PURSE</th>
                  <th className="text-center p-3 text-xs font-rajdhani text-muted-foreground">SQUAD</th>
                  <th className="text-center p-3 text-xs font-rajdhani text-muted-foreground">RTM</th>
                  <th className="text-center p-3 text-xs font-rajdhani text-muted-foreground">STATUS</th>
                  <th className="text-center p-3 text-xs font-rajdhani text-muted-foreground">ACTIONS</th>
                </tr>
              </thead>
              <tbody>
                {state.teams.map(team => (
                  <>
                    <tr
                      key={team.id}
                      className={`border-b border-border/50 hover:bg-muted/30 transition-all ${
                        newTeamId === team.id ? 'bg-accent-cyan/10' : ''
                      }`}
                    >
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
                      <td className="p-3 text-center font-mono text-sm text-foreground">{team.players.length}</td>
                      <td className="p-3 text-center font-mono text-sm text-foreground">{team.rtmRemaining}</td>
                      <td className="p-3 text-center">
                        <span className={`flex items-center gap-1 text-xs font-rajdhani font-semibold justify-center ${team.isActive ? 'text-accent-emerald' : 'text-muted-foreground'}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${team.isActive ? 'bg-accent-emerald' : 'bg-muted-foreground'}`} />
                          {team.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="p-3">
                        <div className="flex items-center justify-center gap-1">
                          <button onClick={() => openEdit(team)} title="Edit" className="p-1.5 rounded hover:bg-muted/50 text-muted-foreground hover:text-accent-cyan transition-colors"><Edit2 size={14} /></button>
                          <button
                            onClick={() => { setExpandedRow(expandedRow === team.id && expandMode === 'purse' ? null : team.id); setExpandMode('purse'); }}
                            title="Adjust Purse"
                            className="p-1.5 rounded hover:bg-muted/50 text-muted-foreground hover:text-accent-gold transition-colors"
                          ><DollarSign size={14} /></button>
                          <button
                            onClick={() => { setExpandedRow(expandedRow === team.id && expandMode === 'announce' ? null : team.id); setExpandMode('announce'); }}
                            title="Announce"
                            className="p-1.5 rounded hover:bg-muted/50 text-muted-foreground hover:text-accent-orange transition-colors"
                          ><Megaphone size={14} /></button>
                          <button
                            onClick={() => setDeleteConfirm(deleteConfirm === team.id ? null : team.id)}
                            title={team.players.length > 0 ? 'Cannot delete — has players' : 'Delete'}
                            disabled={team.players.length > 0}
                            className="p-1.5 rounded hover:bg-muted/50 text-muted-foreground hover:text-accent-crimson transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                          ><Trash2 size={14} /></button>
                        </div>
                      </td>
                    </tr>
                    {expandedRow === team.id && expandMode === 'purse' && (
                      <tr key={`${team.id}-purse`} className="border-b border-border/50 bg-accent-gold/5">
                        <td colSpan={7} className="p-4">
                          <div className="text-xs font-rajdhani text-accent-gold tracking-wider mb-3">ADJUST PURSE FOR {team.name.toUpperCase()}</div>
                          <div className="flex items-center gap-3 flex-wrap">
                            <span className="text-sm text-muted-foreground">Current: {formatPrice(team.purse)}</span>
                            <div className="flex items-center gap-1">
                              <button onClick={() => setPurseSign('+')} className={`px-2 py-1 rounded text-xs font-mono ${purseSign === '+' ? 'bg-accent-emerald/20 text-accent-emerald' : 'bg-card text-muted-foreground border border-border'}`}>+</button>
                              <button onClick={() => setPurseSign('-')} className={`px-2 py-1 rounded text-xs font-mono ${purseSign === '-' ? 'bg-accent-crimson/20 text-accent-crimson' : 'bg-card text-muted-foreground border border-border'}`}>−</button>
                            </div>
                            <input type="number" min="0" value={purseAdj} onChange={e => setPurseAdj(e.target.value)} placeholder="Amount in Cr"
                              className="bg-card border border-border rounded px-3 py-1.5 text-sm text-foreground focus:outline-none focus:border-accent-gold/40 w-36" />
                            <input type="text" value={purseReason} onChange={e => setPurseReason(e.target.value)} placeholder="Reason (required)"
                              className="bg-card border border-border rounded px-3 py-1.5 text-sm text-foreground focus:outline-none focus:border-accent-gold/40 flex-1 min-w-48" />
                            <button onClick={() => handleAdjustPurse(team.id)} className="btn-primary text-sm py-1.5 px-4">Apply</button>
                            <button onClick={() => setExpandedRow(null)} className="btn-ghost text-sm py-1.5 px-4">Cancel</button>
                          </div>
                        </td>
                      </tr>
                    )}
                    {expandedRow === team.id && expandMode === 'announce' && (
                      <tr key={`${team.id}-announce`} className="border-b border-border/50 bg-accent-orange/5">
                        <td colSpan={7} className="p-4">
                          <div className="text-xs font-rajdhani text-accent-orange tracking-wider mb-3">ANNOUNCEMENT TO ALL DASHBOARDS</div>
                          <div className="flex items-center gap-3 flex-wrap">
                            <div className="flex-1 min-w-64 relative">
                              <input type="text" value={announceMsg} onChange={e => setAnnounceMsg(e.target.value.slice(0, 120))} placeholder="Message..."
                                className="w-full bg-card border border-border rounded px-3 py-1.5 text-sm text-foreground focus:outline-none focus:border-accent-orange/40" />
                              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">{announceMsg.length}/120</span>
                            </div>
                            <button onClick={() => handleAnnounce(team.id)} className="btn-secondary text-sm py-1.5 px-4 flex items-center gap-1.5">
                              <Megaphone size={14} /> Send
                            </button>
                            <button onClick={() => setExpandedRow(null)} className="btn-ghost text-sm py-1.5 px-4">Cancel</button>
                          </div>
                        </td>
                      </tr>
                    )}
                    {deleteConfirm === team.id && (
                      <tr key={`${team.id}-delete`} className="border-b border-border/50 bg-accent-crimson/5">
                        <td colSpan={7} className="p-4">
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
              <div>
                <label className="text-xs font-rajdhani text-muted-foreground tracking-wider mb-1.5 block">TEAM NAME *</label>
                <input value={form.name} onChange={e => handleNameChange(e.target.value)} maxLength={40}
                  className={`w-full bg-background border rounded-lg px-4 py-2.5 text-foreground focus:outline-none ${formErrors.name ? 'border-accent-crimson' : 'border-border focus:border-accent-cyan/40'}`}
                  placeholder="e.g. Mumbai Mavericks"
                />
                {formErrors.name && <p className="text-accent-crimson text-xs mt-1">{formErrors.name}</p>}
              </div>

              <div>
                <label className="text-xs font-rajdhani text-muted-foreground tracking-wider mb-1.5 block">SLUG *</label>
                <input value={form.slug} onChange={e => setForm(f => ({ ...f, slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '') }))}
                  className={`w-full bg-background border rounded-lg px-4 py-2.5 text-foreground font-mono text-sm focus:outline-none ${formErrors.slug ? 'border-accent-crimson' : 'border-border focus:border-accent-cyan/40'}`}
                  placeholder="mumbai-mavericks"
                />
                {formErrors.slug && <p className="text-accent-crimson text-xs mt-1">{formErrors.slug}</p>}
              </div>

              <div>
                <label className="text-xs font-rajdhani text-muted-foreground tracking-wider mb-1.5 block">CITY *</label>
                <input value={form.city} onChange={e => setForm(f => ({ ...f, city: e.target.value }))}
                  className={`w-full bg-background border rounded-lg px-4 py-2.5 text-foreground focus:outline-none ${formErrors.city ? 'border-accent-crimson' : 'border-border focus:border-accent-cyan/40'}`}
                  placeholder="e.g. Mumbai"
                />
                {formErrors.city && <p className="text-accent-crimson text-xs mt-1">{formErrors.city}</p>}
              </div>

              <div>
                <label className="text-xs font-rajdhani text-muted-foreground tracking-wider mb-1.5 block">TEAM COLOR</label>
                <div className="flex items-center gap-3">
                  <input type="color" value={form.color} onChange={e => setForm(f => ({ ...f, color: e.target.value }))}
                    className="w-12 h-10 rounded cursor-pointer border border-border bg-transparent"
                  />
                  <span className="font-mono text-sm text-muted-foreground">{form.color.toUpperCase()}</span>
                  <div className="w-8 h-8 rounded-full" style={{ background: form.color }} />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-rajdhani text-muted-foreground tracking-wider mb-1.5 block">INITIAL PURSE (Cr)</label>
                  <input type="number" min="1" value={form.initialPurse} onChange={e => setForm(f => ({ ...f, initialPurse: +e.target.value }))}
                    className="w-full bg-background border border-border rounded-lg px-4 py-2.5 text-foreground focus:outline-none focus:border-accent-cyan/40"
                  />
                  <p className="text-xs text-muted-foreground mt-1">= {formatPrice(form.initialPurse * 100)}</p>
                </div>
                <div>
                  <label className="text-xs font-rajdhani text-muted-foreground tracking-wider mb-1.5 block">RTM CARDS</label>
                  <input type="number" min="0" max="5" value={form.rtmCards} onChange={e => setForm(f => ({ ...f, rtmCards: +e.target.value }))}
                    className="w-full bg-background border border-border rounded-lg px-4 py-2.5 text-foreground focus:outline-none focus:border-accent-cyan/40"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between p-3 bg-background rounded-lg border border-border">
                <span className="text-sm text-foreground">Active</span>
                <button
                  onClick={() => setForm(f => ({ ...f, isActive: !f.isActive }))}
                  className={`w-12 h-6 rounded-full transition-colors relative ${form.isActive ? 'bg-accent-emerald' : 'bg-muted'}`}
                >
                  <span className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${form.isActive ? 'translate-x-6' : 'translate-x-0.5'}`} />
                </button>
              </div>

              <div>
                <label className="text-xs font-rajdhani text-muted-foreground tracking-wider mb-1.5 block">
                  PASSWORD {editTeam ? '(leave blank to keep current)' : '*'}
                </label>
                <div className="flex items-center gap-2 mb-2">
                  <div className="relative flex-1">
                    <input
                      type={showPw ? 'text' : 'password'}
                      value={form.password}
                      readOnly
                      placeholder={editTeam ? '••••••••' : 'Click generate →'}
                      className={`w-full bg-background border rounded-lg px-4 py-2.5 text-foreground font-mono focus:outline-none ${formErrors.password ? 'border-accent-crimson' : 'border-border'}`}
                    />
                    <button onClick={() => setShowPw(v => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                      {showPw ? <EyeOff size={14} /> : <EyeIcon size={14} />}
                    </button>
                  </div>
                  {form.password && (
                    <button onClick={() => copyToClipboard(form.password, 'Password')} className="p-2 rounded hover:bg-muted/50 text-muted-foreground hover:text-accent-cyan">
                      <Copy size={16} />
                    </button>
                  )}
                </div>
                <button onClick={genPassword} className="w-full py-2 rounded-lg border border-accent-orange/40 bg-accent-orange/10 text-accent-orange text-sm font-semibold hover:bg-accent-orange/20 transition-colors flex items-center gap-2 justify-center">
                  <Key size={14} /> Generate Password
                </button>
                {formErrors.password && <p className="text-accent-crimson text-xs mt-1">{formErrors.password}</p>}
                {form.password && (
                  <div className="mt-2 p-2 bg-accent-gold/10 border border-accent-gold/30 rounded-lg text-xs text-accent-gold">
                    ⚠️ Save this password now — it cannot be retrieved after closing this drawer.
                  </div>
                )}
              </div>
            </div>

            <button onClick={handleSave} disabled={saving}
              className="btn-primary w-full flex items-center justify-center gap-2 disabled:opacity-60"
            >
              {saving ? (
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : null}
              {saving ? 'Saving…' : editTeam ? 'Save Changes' : 'Create Team'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function LiveMonitor() {
  const { state } = useAuction();

  return (
    <div>
      <h2 className="font-exo font-bold text-xl text-foreground mb-6">Live Monitor</h2>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
        {state.teams.map(t => {
          const pct = (t.purse / (t.initialPurse || 12000)) * 100;
          return (
            <div key={t.id} className="glass-card p-4" style={{ borderTopColor: t.color, borderTopWidth: 2 }}>
              <div className="font-exo font-semibold text-sm text-foreground truncate mb-2">{t.name}</div>
              <div className={`font-mono text-lg font-bold ${pct > 60 ? 'text-accent-emerald' : pct > 20 ? 'text-accent-gold' : 'text-accent-crimson'}`}>
                {formatPrice(t.purse)}
              </div>
              <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden mt-2 mb-1">
                <div className={`h-full rounded-full ${pct > 60 ? 'bg-accent-emerald' : pct > 20 ? 'bg-accent-gold' : 'bg-accent-crimson'}`} style={{ width: `${pct}%` }} />
              </div>
              <div className="text-xs text-muted-foreground">{t.players.length} players • {t.rtmRemaining} RTM</div>
            </div>
          );
        })}
      </div>

      <div className="glass-card p-6">
        <h3 className="font-exo font-semibold text-foreground mb-4">Sold Players</h3>
        <div className="space-y-2">
          {state.players.filter(p => p.status === 'sold').map(p => {
            const team = state.teams.find(t => t.id === p.soldToTeamId);
            return (
              <div key={p.id} className="flex items-center justify-between py-2 border-b border-border/50">
                <div className="flex items-center gap-2">
                  <img src={p.photo} alt={p.name} className="w-8 h-8 rounded-lg border border-border" loading="lazy" />
                  <span className="text-sm text-foreground">{p.name}</span>
                </div>
                <div className="flex items-center gap-4">
                  {team && <span className="text-xs" style={{ color: team.color }}>{team.name}</span>}
                  <span className="font-mono text-xs text-accent-gold">{formatPrice(p.soldPrice || 0)}</span>
                </div>
              </div>
            );
          })}
          {state.players.filter(p => p.status === 'sold').length === 0 && (
            <p className="text-muted-foreground text-sm text-center py-4">No players sold yet</p>
          )}
        </div>
      </div>
    </div>
  );
}

function generateTeamPassword(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let pw = '';
  for (let i = 0; i < 8; i++) pw += chars[Math.floor(Math.random() * chars.length)];
  return pw;
}
