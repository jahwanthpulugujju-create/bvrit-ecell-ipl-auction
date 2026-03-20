import { useState, useEffect, useMemo } from 'react';
import { useAuction, formatPrice } from '@/context/AuctionContext';
import { Player, PlayerFormatStats, FormatStatRow, PLAYER_COUNTRY } from '@/data/players';
import ConnectionStatus from '@/components/ConnectionStatus';
import { supabase } from '@/lib/supabase';

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

function formatBasePriceDisplay(basePriceLakhs: number): string {
  if (basePriceLakhs >= 100) {
    const crore = basePriceLakhs / 100;
    return `₹${crore % 1 === 0 ? crore.toFixed(0) : crore.toFixed(2)} CRORE`;
  }
  return `₹${basePriceLakhs} LAKH`;
}

function formatStatValue(val: number | null, type: 'int' | 'decimal'): string {
  if (val === null || val === undefined) return '—';
  if (type === 'decimal') return val.toFixed(2);
  return String(Math.round(val));
}

function getStatLabels(stats: PlayerFormatStats): [string, string, string] {
  switch (stats.template) {
    case 'bowling':  return ['MTS', 'WKTS', 'ECON'];
    case 'allround': return ['MTS', 'RUNS', 'WKTS'];
    case 'batting':  return ['MTS', 'RUNS', 'SR'];
  }
}

function getStatTypes(stats: PlayerFormatStats): ['int', 'int' | 'decimal', 'int' | 'decimal'] {
  switch (stats.template) {
    case 'bowling':  return ['int', 'int', 'decimal'];
    case 'allround': return ['int', 'int', 'int'];
    case 'batting':  return ['int', 'int', 'decimal'];
  }
}

function getRoleDisplayLabel(role: string, subRole: string): string {
  switch (role) {
    case 'fast-bowler':   return subRole.toUpperCase().includes('SPIN') ? 'BOWLER' : 'FAST BOWLER';
    case 'spinner':       return 'SPINNER';
    case 'all-rounder':   return 'ALL ROUNDER';
    case 'wicket-keeper': return 'WICKETKEEPER';
    case 'batsman':       return 'BATTER';
    default:              return role.toUpperCase();
  }
}

function getRoleAccentColor(role: string): string {
  switch (role) {
    case 'fast-bowler':   return '#f97316';
    case 'spinner':       return '#a855f7';
    case 'all-rounder':   return '#8b5cf6';
    case 'wicket-keeper': return '#10b981';
    case 'batsman':       return '#06b6d4';
    default:              return '#f59e0b';
  }
}

function SoldTicker({ soldPlayers, teams }: { soldPlayers: Player[]; teams: { id: string; name: string; color: string }[] }) {
  const entries = soldPlayers.filter(p => p.soldToTeamId).map(p => {
    const t = teams.find(tm => tm.id === p.soldToTeamId);
    return { name: p.name, teamName: t?.name || '', teamColor: t?.color || '#fff', price: p.soldPrice || 0 };
  });
  if (entries.length === 0) return null;
  const doubled = [...entries, ...entries];
  return (
    <div className="bg-black/60 border-t border-white/10 h-9 flex items-center overflow-hidden relative flex-shrink-0">
      <div className="flex-shrink-0 px-4 text-[10px] font-rajdhani font-black text-amber-400 tracking-[0.2em] border-r border-white/10 h-full flex items-center bg-amber-400/5">
        SOLD ▸
      </div>
      <div className="flex-1 overflow-hidden">
        <div className="flex whitespace-nowrap animate-marquee">
          {doubled.map((e, i) => (
            <span key={i} className="inline-flex items-center gap-2 px-5 text-[11px] font-rajdhani">
              <span className="inline-block w-2 h-2 rounded-full flex-shrink-0" style={{ background: e.teamColor }} />
              <span className="text-white font-semibold">{e.name}</span>
              <span className="text-white/40">→</span>
              <span className="font-bold" style={{ color: e.teamColor }}>{e.teamName}</span>
              <span className="text-white/20 font-bold">·</span>
              <span className="text-amber-300 font-bold">{formatPrice(e.price)}</span>
              <span className="text-white/10 mx-1">│</span>
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

function SoldOverlay({ player, team }: { player: Player; team: { name: string; color: string } | undefined }) {
  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md">
      <div className="text-center">
        <div className="relative inline-block mb-8">
          <div className="font-orbitron text-8xl font-black text-amber-400 -rotate-6 inline-block"
            style={{ textShadow: '0 0 60px rgba(251,191,36,0.8), 0 0 120px rgba(251,191,36,0.4)', letterSpacing: '0.05em' }}>
            SOLD!
          </div>
          <div className="absolute inset-0 border-4 border-amber-400 -rotate-6 rounded-sm opacity-60" />
        </div>
        <div className="font-orbitron font-black text-3xl text-white mb-3 tracking-wider">{player.name}</div>
        {team && (
          <div className="font-rajdhani text-xl font-bold tracking-widest" style={{ color: team.color }}>
            {team.name}
          </div>
        )}
      </div>
    </div>
  );
}

function StatRow({ label, row, types }: {
  label: string;
  row: FormatStatRow;
  types: ['int', 'int' | 'decimal', 'int' | 'decimal'];
}) {
  const isEmpty = row.mts === null && row.s1 === null && row.s2 === null;
  return (
    <div className="grid grid-cols-4 items-center border-b border-white/8 last:border-b-0">
      <div className="py-3 pl-4 pr-2">
        <span className="font-rajdhani text-sm font-black tracking-widest"
          style={{ color: 'rgba(251,191,36,0.9)' }}>
          {label}
        </span>
      </div>
      {isEmpty ? (
        <div className="col-span-3 text-center py-3 font-rajdhani text-lg text-white/20 tracking-widest">— — —</div>
      ) : (
        <>
          <div className="text-center py-3">
            <span className="font-orbitron font-bold text-xl text-white tracking-wide">
              {formatStatValue(row.mts, types[0])}
            </span>
          </div>
          <div className="text-center py-3">
            <span className="font-orbitron font-bold text-xl text-white tracking-wide">
              {formatStatValue(row.s1, types[1])}
            </span>
          </div>
          <div className="text-center py-3">
            <span className="font-orbitron font-bold text-xl text-white tracking-wide">
              {formatStatValue(row.s2, types[2])}
            </span>
          </div>
        </>
      )}
    </div>
  );
}

function PlayerCard({ player, currentBid, leadingTeam, timerSeconds, maxSeconds, isPaused, status }: {
  player: Player;
  currentBid: number;
  leadingTeam: { name: string; color: string } | null;
  timerSeconds: number;
  maxSeconds: number;
  isPaused: boolean;
  status: string;
}) {
  const roleAccent = getRoleAccentColor(player.role);
  const roleLabel = getRoleDisplayLabel(player.role, player.subRole);
  const countryLabel = player.nationality === 'overseas'
    ? (PLAYER_COUNTRY[player.name] ?? 'OVERSEAS')
    : 'INDIA';

  const fmtStats = player.formatStats;
  const statLabels = fmtStats ? getStatLabels(fmtStats) : ['MTS', '—', '—'];
  const statTypes = fmtStats ? getStatTypes(fmtStats) : (['int', 'int', 'decimal'] as ['int','int','decimal']);

  const timerPct = Math.min(100, (timerSeconds / Math.max(1, maxSeconds)) * 100);
  const timerCritical = timerSeconds <= 5;

  return (
    <div className="flex flex-1 min-h-0 gap-0">
      {/* ── LEFT: Player portrait + name ── */}
      <div className="flex flex-col items-center justify-center w-[38%] flex-shrink-0 px-6 py-4 relative">
        <div className="relative mb-5">
          <div className="absolute inset-0 rounded-2xl opacity-30"
            style={{ boxShadow: `0 0 60px ${roleAccent}`, background: `radial-gradient(circle, ${roleAccent}20 0%, transparent 70%)` }} />
          <div className="relative rounded-2xl overflow-hidden"
            style={{ border: `2px solid ${roleAccent}80`, boxShadow: `0 0 30px ${roleAccent}40, inset 0 0 30px rgba(0,0,0,0.5)` }}>
            <img
              src={player.photo}
              alt={player.name}
              className="w-full object-cover object-top"
              style={{ height: 'clamp(220px, 28vw, 340px)', width: 'clamp(180px, 22vw, 280px)' }}
              onError={e => {
                (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${encodeURIComponent(player.name)}&background=1a1a2e&color=fff&size=256&bold=true`;
              }}
            />
            <div className="absolute bottom-0 left-0 right-0 h-16"
              style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.9) 0%, transparent 100%)' }} />
          </div>
          <div className="absolute -top-px -left-px -right-px h-px rounded-t-2xl"
            style={{ background: `linear-gradient(to right, transparent, ${roleAccent}, transparent)` }} />
        </div>

        <div className="text-center w-full">
          <h1 className="font-orbitron font-black text-white leading-tight tracking-wide mb-1"
            style={{ fontSize: 'clamp(14px, 2.2vw, 26px)', textShadow: '0 2px 20px rgba(0,0,0,0.8)' }}>
            {player.name}
          </h1>
          <div className="font-rajdhani text-xs tracking-widest font-bold"
            style={{ color: `${roleAccent}cc` }}>
            {player.subRole?.toUpperCase()}
          </div>
        </div>

        <div className="mt-5 w-full">
          <div className="border rounded-xl p-3 text-center"
            style={{ borderColor: `${roleAccent}40`, background: `${roleAccent}08` }}>
            <div className="font-rajdhani text-[9px] text-white/40 tracking-[0.2em] mb-1">BASE PRICE</div>
            <div className="font-orbitron font-black tracking-wider"
              style={{ fontSize: 'clamp(14px, 2vw, 22px)', color: roleAccent }}>
              {formatBasePriceDisplay(player.basePrice)}
            </div>
          </div>
        </div>
      </div>

      {/* ── RIGHT: Stats panel ── */}
      <div className="flex flex-col flex-1 py-4 pr-6 pl-2 min-h-0">
        {/* Country + Role badges */}
        <div className="flex items-center gap-3 mb-4">
          <div className="px-4 py-1.5 rounded-md font-orbitron font-black text-sm tracking-widest text-white"
            style={{ background: `${roleAccent}25`, border: `1px solid ${roleAccent}60` }}>
            {countryLabel}
          </div>
          <div className="px-4 py-1.5 rounded-md font-orbitron font-black text-sm tracking-widest"
            style={{ background: `${roleAccent}15`, border: `1px solid ${roleAccent}40`, color: roleAccent }}>
            {roleLabel}
          </div>
        </div>

        {/* Stats table */}
        {fmtStats ? (
          <div className="rounded-xl overflow-hidden flex-1 min-h-0"
            style={{ border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.03)' }}>
            <div className="grid grid-cols-4 border-b"
              style={{ borderColor: 'rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.05)' }}>
              <div className="py-2 pl-4 pr-2" />
              {statLabels.map((lbl) => (
                <div key={lbl} className="text-center py-2">
                  <span className="font-rajdhani text-xs font-black tracking-widest text-white/50 uppercase">{lbl}</span>
                </div>
              ))}
            </div>
            <StatRow label="T20"  row={fmtStats.T20}  types={statTypes} />
            <StatRow label="IPL"  row={fmtStats.IPL}  types={statTypes} />
            <StatRow label="T201" row={fmtStats.T201} types={statTypes} />
          </div>
        ) : (
          <div className="flex-1 rounded-xl flex items-center justify-center"
            style={{ border: '1px solid rgba(255,255,255,0.1)' }}>
            <span className="font-rajdhani text-white/20 tracking-widest text-sm">STATS UNAVAILABLE</span>
          </div>
        )}

        {/* Auction status */}
        <div className="mt-4 flex-shrink-0">
          {isPaused ? (
            <div className="rounded-xl p-4 text-center"
              style={{ background: 'rgba(251,191,36,0.08)', border: '1px solid rgba(251,191,36,0.3)' }}>
              <div className="font-orbitron font-black text-lg tracking-widest text-amber-400">⏸ PAUSED</div>
              <div className="font-rajdhani text-xs text-white/40 mt-1">Auction paused by auctioneer</div>
            </div>
          ) : (
            <div className="rounded-xl overflow-hidden" style={{ border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.03)' }}>
              <div className="grid grid-cols-2 divide-x divide-white/10">
                <div className="p-3 text-center">
                  <div className="font-rajdhani text-[9px] text-white/40 tracking-[0.2em] mb-1">CURRENT BID</div>
                  <div className="font-orbitron font-black tracking-wide"
                    style={{ fontSize: 'clamp(16px, 2.4vw, 28px)', color: '#06b6d4', textShadow: '0 0 20px rgba(6,182,212,0.6)' }}>
                    {formatPrice(currentBid)}
                  </div>
                  {leadingTeam && (
                    <div className="font-rajdhani text-xs font-bold tracking-widest mt-0.5 truncate"
                      style={{ color: leadingTeam.color }}>
                      {leadingTeam.name}
                    </div>
                  )}
                </div>
                <div className="p-3 flex flex-col items-center justify-center">
                  <div className="font-rajdhani text-[9px] text-white/40 tracking-[0.2em] mb-1">TIME LEFT</div>
                  <div className="font-orbitron font-black text-3xl tracking-widest mb-1.5"
                    style={{ color: timerCritical ? '#ef4444' : '#10b981', textShadow: timerCritical ? '0 0 20px rgba(239,68,68,0.6)' : '0 0 20px rgba(16,185,129,0.4)' }}>
                    {String(timerSeconds).padStart(2, '0')}
                  </div>
                  <div className="w-full h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.1)' }}>
                    <div className="h-full rounded-full transition-all duration-500"
                      style={{ width: `${timerPct}%`, background: timerCritical ? '#ef4444' : '#10b981', boxShadow: timerCritical ? '0 0 8px rgba(239,68,68,0.8)' : '0 0 8px rgba(16,185,129,0.6)' }} />
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function Display() {
  const { auctionState, players, teams, getPlayer, connected } = useAuction();
  const timerSeconds = useLocalTimer(auctionState?.timer_expires_at ?? null, auctionState?.timer_running ?? false);

  const currentPlayer = auctionState?.current_player_id ? getPlayer(auctionState.current_player_id) : null;
  const leadingTeam = auctionState?.leading_team_id ? teams.find(t => t.id === auctionState.leading_team_id) : null;
  const isPaused = auctionState?.status === 'live' && !auctionState?.timer_running && !!currentPlayer;

  const [showSoldOverlay, setShowSoldOverlay] = useState(false);
  const [soldPlayer, setSoldPlayer] = useState<Player | null>(null);
  const [soldTeam, setSoldTeam] = useState<{ name: string; color: string } | undefined>();

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
  const stats = useMemo(() => ({
    sold: soldPlayers.length,
    unsold: players.filter(p => p.status === 'unsold').length,
    available: players.filter(p => p.status === 'available').length,
  }), [players, soldPlayers]);

  return (
    <div className="h-screen w-full flex flex-col overflow-hidden relative select-none"
      style={{ background: 'linear-gradient(135deg, #07070f 0%, #0d0d1a 50%, #07070f 100%)' }}>

      {showSoldOverlay && soldPlayer && (
        <SoldOverlay player={soldPlayer} team={soldTeam} />
      )}

      {/* ── Header ── */}
      <div className="flex-shrink-0 flex items-center justify-between px-5 py-2.5"
        style={{ background: 'rgba(0,0,0,0.5)', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
        <div className="flex items-center gap-3">
          <div className="font-orbitron font-black tracking-widest text-white"
            style={{ fontSize: 'clamp(11px,1.5vw,18px)', textShadow: '0 0 20px rgba(6,182,212,0.6)' }}>
            BVRIT E-CELL
          </div>
          <div className="w-px h-4 bg-white/20" />
          <div className="font-rajdhani text-xs tracking-[0.2em] text-white/50">IPL AUCTION 2026</div>
        </div>

        <div className="flex items-center gap-6">
          <div className="font-rajdhani text-xs text-white/40 tracking-widest">
            SOLD <span className="text-amber-400 font-bold ml-1">{stats.sold}</span>
          </div>
          <div className="font-rajdhani text-xs text-white/40 tracking-widest">
            UNSOLD <span className="text-red-400 font-bold ml-1">{stats.unsold}</span>
          </div>
          <div className="font-rajdhani text-xs text-white/40 tracking-widest">
            REMAINING <span className="text-white font-bold ml-1">{stats.available}</span>
          </div>
          <ConnectionStatus />
        </div>
      </div>

      {/* ── Main content ── */}
      <div className="flex-1 min-h-0 relative overflow-hidden">
        {currentPlayer ? (
          <PlayerCard
            player={currentPlayer}
            currentBid={auctionState?.current_bid_amount ?? 0}
            leadingTeam={leadingTeam ? { name: leadingTeam.name, color: leadingTeam.color } : null}
            timerSeconds={timerSeconds}
            maxSeconds={auctionState?.bid_reset_seconds ?? 15}
            isPaused={isPaused}
            status={auctionState?.status ?? 'live'}
          />
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <div className="font-orbitron font-black text-4xl text-white mb-3 tracking-wider">
              {auctionState?.status === 'complete' ? '🏆 AUCTION COMPLETE' : 'AWAITING NEXT PLAYER'}
            </div>
            <div className="font-rajdhani text-white/40 tracking-widest text-sm">
              {auctionState?.status === 'complete'
                ? 'Thank you for participating in BVRIT E-Cell IPL Auction 2026'
                : 'The auctioneer will introduce the next player shortly'}
            </div>
          </div>
        )}

        {/* Subtle grid overlay for broadcast feel */}
        <div className="absolute inset-0 pointer-events-none opacity-[0.015]"
          style={{ backgroundImage: 'repeating-linear-gradient(0deg, white 0px, white 1px, transparent 1px, transparent 40px), repeating-linear-gradient(90deg, white 0px, white 1px, transparent 1px, transparent 40px)' }} />
      </div>

      {/* ── Sold Ticker ── */}
      <SoldTicker soldPlayers={soldPlayers} teams={teams} />
    </div>
  );
}
