import { useMemo, useState } from 'react';
import { useAuction, formatPrice } from '@/context/AuctionContext';
import { roleEmojis } from '@/data/players';
import { Trophy, Medal, Award, ChevronDown, ChevronUp, CheckCircle2, XCircle, RefreshCcw, X } from 'lucide-react';

// ─── Scoring config (easy to tune) ───────────────────────────────────────────
const SCORE_WEIGHTS = {
  averageRating: 40,
  roleBalance: 25,
  budgetEfficiency: 20,
  qualification: 15,
} as const;

// ─── Ranking qualification rules ─────────────────────────────────────────────
const RANK_REQUIREMENTS: { key: string; label: string; min: number }[] = [
  { key: 'total',         label: '11 Players',          min: 11 },
  { key: 'batsman',       label: '4 Batsmen',           min: 4  },
  { key: 'fast-bowler',   label: '2 Fast Bowlers',      min: 2  },
  { key: 'spinner',       label: '2 Spinners',          min: 2  },
  { key: 'wicket-keeper', label: '2 Wicket-keepers',    min: 2  },
  { key: 'all-rounder',   label: '1 All-rounder',       min: 1  },
];

// ─── Types ────────────────────────────────────────────────────────────────────
interface TeamRankEntry {
  teamId: string;
  teamName: string;
  teamSlug: string;
  teamColor: string;
  rank: number;
  score: number;
  qualified: boolean;
  missingRules: string[];
  totalPlayers: number;
  batsmenCount: number;
  fastBowlerCount: number;
  spinnerCount: number;
  wicketkeeperCount: number;
  allRounderCount: number;
  totalRating: number;
  averageRating: number;
  totalSpent: number;
  remainingPurse: number;
  initialPurse: number;
  players: {
    id: string;
    name: string;
    role: string;
    rating: number;
    basePrice: number;
    purchasePrice: number;
  }[];
}

// ─── Scoring helpers ──────────────────────────────────────────────────────────
function computeRoleBalanceScore(counts: Record<string, number>, total: number): number {
  if (total === 0) return 0;
  let satisfied = 0;
  let total_rules = RANK_REQUIREMENTS.length;
  for (const req of RANK_REQUIREMENTS) {
    const actual = req.key === 'total' ? total : (counts[req.key] ?? 0);
    if (actual >= req.min) satisfied++;
  }
  return (satisfied / total_rules) * 100;
}

function computeBudgetEfficiencyScore(remaining: number, initial: number, total: number): number {
  if (initial === 0) return 0;
  // Reward having good squad AND keeping some budget — penalise spending everything on few players
  const leftoverPct = remaining / initial; // 0–1
  const squadPct = Math.min(total / 15, 1); // ideal squad ~15
  // If no players, pure leftover. Otherwise balance spending vs squad size.
  return Math.min(100, (leftoverPct * 40 + squadPct * 60));
}

function computeScore(entry: Omit<TeamRankEntry, 'rank' | 'score'>): number {
  const roleCounts = {
    batsman: entry.batsmenCount,
    'fast-bowler': entry.fastBowlerCount,
    spinner: entry.spinnerCount,
    'wicket-keeper': entry.wicketkeeperCount,
    'all-rounder': entry.allRounderCount,
  };

  const avgRatingNorm = entry.averageRating / 10; // 0–1
  const roleBalance = computeRoleBalanceScore(roleCounts, entry.totalPlayers);
  const budgetEff = computeBudgetEfficiencyScore(entry.remainingPurse, entry.initialPurse, entry.totalPlayers);
  const qualBonus = entry.qualified ? 100 : 0;

  return (
    avgRatingNorm * 100 * SCORE_WEIGHTS.averageRating / 100 +
    roleBalance * SCORE_WEIGHTS.roleBalance / 100 +
    budgetEff * SCORE_WEIGHTS.budgetEfficiency / 100 +
    qualBonus * SCORE_WEIGHTS.qualification / 100
  );
}

// ─── Main hook ────────────────────────────────────────────────────────────────
function useRankings(): TeamRankEntry[] {
  const { teams, players } = useAuction();

  return useMemo(() => {
    const entries: Omit<TeamRankEntry, 'rank'>[] = teams
      .filter(t => t.is_active)
      .map(team => {
        const squad = players.filter(p => p.soldToTeamId === team.id);

        const counts = {
          'batsman': 0,
          'fast-bowler': 0,
          'spinner': 0,
          'wicket-keeper': 0,
          'all-rounder': 0,
        } as Record<string, number>;
        let totalRating = 0;
        let totalSpent = 0;

        for (const p of squad) {
          counts[p.role] = (counts[p.role] ?? 0) + 1;
          totalRating += p.rating;
          totalSpent += p.soldPrice ?? p.basePrice;
        }

        const totalPlayers = squad.length;
        const averageRating = totalPlayers > 0 ? totalRating / totalPlayers : 0;
        const initialPurse = team.initial_purse ?? 12000;
        const remainingPurse = team.purse;

        // Check qualification
        const missingRules: string[] = [];
        for (const req of RANK_REQUIREMENTS) {
          const actual = req.key === 'total' ? totalPlayers : (counts[req.key] ?? 0);
          if (actual < req.min) missingRules.push(req.label);
        }
        const qualified = missingRules.length === 0;

        const entry: Omit<TeamRankEntry, 'rank' | 'score'> = {
          teamId: team.id,
          teamName: team.name,
          teamSlug: team.slug,
          teamColor: team.color,
          qualified,
          missingRules,
          totalPlayers,
          batsmenCount: counts['batsman'],
          fastBowlerCount: counts['fast-bowler'],
          spinnerCount: counts['spinner'],
          wicketkeeperCount: counts['wicket-keeper'],
          allRounderCount: counts['all-rounder'],
          totalRating,
          averageRating,
          totalSpent,
          remainingPurse,
          initialPurse,
          players: squad.map(p => ({
            id: p.id,
            name: p.name,
            role: p.role,
            rating: p.rating,
            basePrice: p.basePrice,
            purchasePrice: p.soldPrice ?? p.basePrice,
          })),
        };

        return { ...entry, score: computeScore(entry) };
      });

    // Sort: qualified first, then by score desc, with tie-breakers
    const sorted = [...entries].sort((a, b) => {
      if (a.qualified !== b.qualified) return a.qualified ? -1 : 1;
      if (b.score !== a.score) return b.score - a.score;
      if (b.averageRating !== a.averageRating) return b.averageRating - a.averageRating;
      const aCoverage = RANK_REQUIREMENTS.length - a.missingRules.length;
      const bCoverage = RANK_REQUIREMENTS.length - b.missingRules.length;
      if (bCoverage !== aCoverage) return bCoverage - aCoverage;
      if (b.remainingPurse !== a.remainingPurse) return b.remainingPurse - a.remainingPurse;
      return 0;
    });

    return sorted.map((e, i) => ({ ...e, rank: i + 1 } as TeamRankEntry));
  }, [teams, players]);
}

// ─── Rank badge ───────────────────────────────────────────────────────────────
function RankBadge({ rank }: { rank: number }) {
  if (rank === 1) return (
    <div className="flex items-center justify-center w-10 h-10 rounded-full bg-yellow-500/20 border border-yellow-500/50">
      <Trophy size={18} className="text-yellow-400" />
    </div>
  );
  if (rank === 2) return (
    <div className="flex items-center justify-center w-10 h-10 rounded-full bg-slate-400/20 border border-slate-400/50">
      <Medal size={18} className="text-slate-300" />
    </div>
  );
  if (rank === 3) return (
    <div className="flex items-center justify-center w-10 h-10 rounded-full bg-amber-700/20 border border-amber-700/50">
      <Award size={18} className="text-amber-500" />
    </div>
  );
  return (
    <div className="flex items-center justify-center w-10 h-10 rounded-full bg-muted/30 border border-border">
      <span className="text-muted-foreground font-mono text-sm font-bold">#{rank}</span>
    </div>
  );
}

// ─── Qualification checklist ──────────────────────────────────────────────────
function QualChecklist({ entry }: { entry: TeamRankEntry }) {
  const counts = {
    total: entry.totalPlayers,
    batsman: entry.batsmenCount,
    'fast-bowler': entry.fastBowlerCount,
    spinner: entry.spinnerCount,
    'wicket-keeper': entry.wicketkeeperCount,
    'all-rounder': entry.allRounderCount,
  } as Record<string, number>;

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
      {RANK_REQUIREMENTS.map(req => {
        const actual = counts[req.key] ?? 0;
        const ok = actual >= req.min;
        return (
          <div key={req.key} className={`flex items-center gap-1.5 text-xs rounded px-2 py-1 ${ok ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'}`}>
            {ok
              ? <CheckCircle2 size={11} className="shrink-0" />
              : <XCircle size={11} className="shrink-0" />}
            <span>{req.label} <span className="opacity-60">({actual}/{req.min})</span></span>
          </div>
        );
      })}
    </div>
  );
}

// ─── Score bar ────────────────────────────────────────────────────────────────
function ScoreBar({ score, maxScore }: { score: number; maxScore: number }) {
  const pct = maxScore > 0 ? Math.min(100, (score / maxScore) * 100) : 0;
  return (
    <div className="h-1.5 bg-muted/30 rounded-full overflow-hidden">
      <div
        className="h-full rounded-full transition-all duration-500"
        style={{ width: `${pct}%`, background: 'linear-gradient(90deg, var(--accent-cyan) 0%, var(--accent-magenta) 100%)' }}
      />
    </div>
  );
}

// ─── Team detail modal ────────────────────────────────────────────────────────
function TeamDetailModal({ entry, onClose }: { entry: TeamRankEntry; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="glass-card w-full max-w-2xl max-h-[90vh] overflow-y-auto relative">
        <div className="sticky top-0 bg-card/95 backdrop-blur-sm border-b border-border px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <RankBadge rank={entry.rank} />
            <div>
              <h2 className="font-orbitron text-lg text-foreground">{entry.teamName}</h2>
              <div className="flex items-center gap-2 mt-0.5">
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${entry.qualified ? 'bg-green-500/15 text-green-400 border border-green-500/30' : 'bg-red-500/15 text-red-400 border border-red-500/30'}`}>
                  {entry.qualified ? '✓ Qualified' : '✗ Not Qualified'}
                </span>
                <span className="text-xs text-muted-foreground font-mono">Score: {entry.score.toFixed(2)}</span>
              </div>
            </div>
          </div>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground transition-colors">
            <X size={20} />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Qualification checklist */}
          <div>
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-2">Qualification Rules</h3>
            <QualChecklist entry={entry} />
          </div>

          {/* Stats grid */}
          <div>
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-2">Squad Overview</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {[
                { label: 'Total Players', value: entry.totalPlayers },
                { label: 'Batsmen', value: entry.batsmenCount },
                { label: 'Fast Bowlers', value: entry.fastBowlerCount },
                { label: 'Spinners', value: entry.spinnerCount },
                { label: 'Wicket-keepers', value: entry.wicketkeeperCount },
                { label: 'All-rounders', value: entry.allRounderCount },
              ].map(s => (
                <div key={s.label} className="bg-muted/20 rounded-lg px-3 py-2">
                  <div className="text-xs text-muted-foreground">{s.label}</div>
                  <div className="text-lg font-bold text-foreground font-mono">{s.value}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Financial */}
          <div>
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-2">Financials</h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="bg-muted/20 rounded-lg px-3 py-2">
                <div className="text-xs text-muted-foreground">Total Spent</div>
                <div className="text-sm font-bold text-foreground">{formatPrice(entry.totalSpent)}</div>
              </div>
              <div className="bg-muted/20 rounded-lg px-3 py-2">
                <div className="text-xs text-muted-foreground">Remaining Purse</div>
                <div className="text-sm font-bold text-accent-cyan">{formatPrice(entry.remainingPurse)}</div>
              </div>
              <div className="bg-muted/20 rounded-lg px-3 py-2">
                <div className="text-xs text-muted-foreground">Total Rating</div>
                <div className="text-sm font-bold text-foreground">{entry.totalRating.toFixed(1)}</div>
              </div>
              <div className="bg-muted/20 rounded-lg px-3 py-2">
                <div className="text-xs text-muted-foreground">Avg Rating</div>
                <div className="text-sm font-bold text-foreground">{entry.averageRating.toFixed(2)}</div>
              </div>
            </div>
          </div>

          {/* Player list */}
          <div>
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-2">
              Players ({entry.players.length})
            </h3>
            {entry.players.length === 0 ? (
              <p className="text-muted-foreground text-sm">No players purchased yet.</p>
            ) : (
              <div className="space-y-1">
                {entry.players
                  .slice()
                  .sort((a, b) => b.rating - a.rating)
                  .map(p => (
                    <div key={p.id} className="flex items-center justify-between bg-muted/10 hover:bg-muted/20 rounded-lg px-3 py-2 transition-colors">
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="text-base">{roleEmojis[p.role] ?? '🏏'}</span>
                        <div className="min-w-0">
                          <div className="text-sm text-foreground font-medium truncate">{p.name}</div>
                          <div className="text-xs text-muted-foreground capitalize">{p.role.replace('-', ' ')}</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-4 shrink-0 ml-2">
                        <div className="text-right">
                          <div className="text-xs text-muted-foreground">Rating</div>
                          <div className="text-sm font-mono font-bold text-foreground">{p.rating.toFixed(1)}</div>
                        </div>
                        <div className="text-right">
                          <div className="text-xs text-muted-foreground">Base</div>
                          <div className="text-xs font-mono text-muted-foreground">{formatPrice(p.basePrice)}</div>
                        </div>
                        <div className="text-right">
                          <div className="text-xs text-muted-foreground">Paid</div>
                          <div className="text-sm font-mono font-bold text-accent-cyan">{formatPrice(p.purchasePrice)}</div>
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Team row card ────────────────────────────────────────────────────────────
function TeamRankCard({ entry, maxScore, onClick }: { entry: TeamRankEntry; maxScore: number; onClick: () => void }) {
  const borderStyle = entry.rank === 1
    ? 'border-yellow-500/40 bg-yellow-500/5'
    : entry.rank === 2
    ? 'border-slate-400/40 bg-slate-400/5'
    : entry.rank === 3
    ? 'border-amber-700/40 bg-amber-700/5'
    : 'border-border bg-card/30';

  return (
    <div
      onClick={onClick}
      className={`glass-card border ${borderStyle} rounded-xl p-4 cursor-pointer hover:border-accent-cyan/40 transition-all duration-200 group`}
    >
      <div className="flex items-center gap-4">
        <RankBadge rank={entry.rank} />

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <span className="font-orbitron text-sm font-bold text-foreground group-hover:text-accent-cyan transition-colors truncate">
              {entry.teamName}
            </span>
            <span className={`text-xs px-2 py-0.5 rounded-full font-medium shrink-0 ${entry.qualified ? 'bg-green-500/15 text-green-400 border border-green-500/30' : 'bg-red-500/15 text-red-400 border border-red-500/30'}`}>
              {entry.qualified ? 'Qualified' : 'Not Qualified'}
            </span>
          </div>
          <ScoreBar score={entry.score} maxScore={maxScore} />
          <div className="flex flex-wrap gap-x-4 gap-y-0.5 mt-1.5 text-xs text-muted-foreground">
            <span>{entry.totalPlayers} players</span>
            <span>Avg {entry.averageRating.toFixed(2)}</span>
            <span className="text-accent-cyan">{formatPrice(entry.remainingPurse)} left</span>
          </div>
        </div>

        <div className="text-right shrink-0">
          <div className="font-mono font-bold text-foreground text-lg">{entry.score.toFixed(1)}</div>
          <div className="text-xs text-muted-foreground">score</div>
        </div>
      </div>

      {/* Compact role counts row */}
      <div className="mt-3 flex flex-wrap gap-2">
        {[
          { label: '🏏 Bat', val: entry.batsmenCount, min: 4 },
          { label: '⚡ Fast', val: entry.fastBowlerCount, min: 2 },
          { label: '🌀 Spin', val: entry.spinnerCount, min: 2 },
          { label: '🧤 WK', val: entry.wicketkeeperCount, min: 2 },
          { label: '⚔️ AR', val: entry.allRounderCount, min: 1 },
        ].map(r => (
          <span key={r.label} className={`text-xs px-2 py-0.5 rounded font-mono ${r.val >= r.min ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'}`}>
            {r.label} {r.val}
          </span>
        ))}
      </div>
    </div>
  );
}

// ─── Main dashboard ───────────────────────────────────────────────────────────
export default function RankingDashboard() {
  const [selectedTeam, setSelectedTeam] = useState<TeamRankEntry | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const [showLegend, setShowLegend] = useState(false);

  const { teams } = useAuction();
  const rankings = useRankings();

  // Force re-render for manual refresh
  void refreshKey;

  const maxScore = rankings.length > 0 ? rankings[0].score : 100;
  const qualified = rankings.filter(r => r.qualified);
  const notQualified = rankings.filter(r => !r.qualified);

  if (teams.length === 0) {
    return (
      <div className="text-center py-16 text-muted-foreground">
        <Trophy size={40} className="mx-auto mb-3 opacity-30" />
        <p>No teams found. Create teams in the Teams tab first.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h2 className="font-orbitron text-2xl text-foreground flex items-center gap-2">
            <Trophy size={22} className="text-yellow-400" /> Team Rankings
          </h2>
          <p className="text-muted-foreground text-sm mt-1">
            Teams ranked by squad strength, qualification status, and budget efficiency.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowLegend(v => !v)}
            className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground px-3 py-2 rounded-lg border border-border hover:border-accent-cyan/40 transition-colors"
          >
            {showLegend ? <ChevronUp size={14} /> : <ChevronDown size={14} />} Legend
          </button>
          <button
            onClick={() => setRefreshKey(k => k + 1)}
            className="flex items-center gap-1.5 text-xs text-accent-cyan hover:text-foreground px-3 py-2 rounded-lg border border-accent-cyan/30 hover:border-accent-cyan/60 transition-colors"
          >
            <RefreshCcw size={14} /> Refresh
          </button>
        </div>
      </div>

      {/* Legend */}
      {showLegend && (
        <div className="glass-card rounded-xl p-4 border border-border text-sm space-y-3">
          <h3 className="font-semibold text-foreground">Scoring Formula</h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            {Object.entries(SCORE_WEIGHTS).map(([k, w]) => (
              <div key={k} className="bg-muted/20 rounded-lg px-3 py-2">
                <div className="text-muted-foreground capitalize">{k.replace(/([A-Z])/g, ' $1').trim()}</div>
                <div className="font-mono font-bold text-accent-cyan">{w}%</div>
              </div>
            ))}
          </div>
          <h3 className="font-semibold text-foreground pt-1">Qualification Rules</h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5 text-xs">
            {RANK_REQUIREMENTS.map(r => (
              <div key={r.key} className="flex items-center gap-1.5 text-muted-foreground">
                <CheckCircle2 size={11} className="text-green-400 shrink-0" />
                {r.label} minimum
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Top 3 podium */}
      {qualified.length >= 1 && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {[0, 1, 2].map(i => {
            const t = qualified[i];
            if (!t) return <div key={i} className="hidden sm:block" />;
            const icons = [
              <Trophy key="t" size={20} className="text-yellow-400" />,
              <Medal key="m" size={20} className="text-slate-300" />,
              <Award key="a" size={20} className="text-amber-500" />,
            ];
            const bgs = [
              'from-yellow-500/10 border-yellow-500/40',
              'from-slate-400/10 border-slate-400/40',
              'from-amber-700/10 border-amber-700/40',
            ];
            return (
              <div
                key={t.teamId}
                onClick={() => setSelectedTeam(t)}
                className={`glass-card rounded-xl p-4 border bg-gradient-to-br ${bgs[i]} to-transparent cursor-pointer hover:scale-[1.02] transition-transform text-center`}
              >
                <div className="flex justify-center mb-2">{icons[i]}</div>
                <div className="text-xs text-muted-foreground mb-0.5">{i === 0 ? '1st Prize' : i === 1 ? '2nd Prize' : '3rd Prize'}</div>
                <div className="font-orbitron font-bold text-foreground text-sm">{t.teamName}</div>
                <div className="text-xs text-muted-foreground mt-1">Score: <span className="text-foreground font-mono">{t.score.toFixed(1)}</span></div>
              </div>
            );
          })}
        </div>
      )}

      {/* Qualified teams */}
      {qualified.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold text-green-400 uppercase tracking-wide mb-3 flex items-center gap-1.5">
            <CheckCircle2 size={14} /> Qualified Teams ({qualified.length})
          </h3>
          <div className="space-y-3">
            {qualified.map(entry => (
              <TeamRankCard
                key={entry.teamId}
                entry={entry}
                maxScore={maxScore}
                onClick={() => setSelectedTeam(entry)}
              />
            ))}
          </div>
        </div>
      )}

      {/* Not qualified teams */}
      {notQualified.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold text-red-400 uppercase tracking-wide mb-3 flex items-center gap-1.5">
            <XCircle size={14} /> Not Qualified ({notQualified.length})
          </h3>
          <div className="space-y-3">
            {notQualified.map(entry => (
              <TeamRankCard
                key={entry.teamId}
                entry={entry}
                maxScore={maxScore}
                onClick={() => setSelectedTeam(entry)}
              />
            ))}
          </div>
        </div>
      )}

      {/* Detail modal */}
      {selectedTeam && (
        <TeamDetailModal entry={selectedTeam} onClose={() => setSelectedTeam(null)} />
      )}
    </div>
  );
}
