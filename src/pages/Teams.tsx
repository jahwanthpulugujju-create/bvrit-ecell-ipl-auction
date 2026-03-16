import { useParams, Link } from 'react-router-dom';
import { useAuction } from '@/context/AuctionContext';
import PlayerCard from '@/components/PlayerCard';
import AuctionTimer, { TimerBar } from '@/components/AuctionTimer';
import { roleEmojis } from '@/data/players';

const MIN_REQ: Record<string, number> = {
  batsman: 4, 'fast-bowler': 2, spinner: 1, 'wicket-keeper': 1, 'all-rounder': 0,
};

export default function Teams() {
  const { state, formatPrice } = useAuction();

  return (
    <div className="min-h-screen bg-background pt-20 pb-12">
      <div className="container mx-auto px-4">
        <h1 className="section-title mb-8">All <span className="text-accent-cyan">Teams</span></h1>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
          {state.teams.map(team => {
            const pursePct = (team.purse / 12000) * 100;
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
                  <span className={`font-mono font-bold text-lg ${
                    pursePct > 60 ? 'text-accent-emerald' : pursePct > 20 ? 'text-accent-gold' : 'text-accent-crimson'
                  }`}>
                    {formatPrice(team.purse)}
                  </span>
                </div>
                <div className="w-full h-2 bg-muted rounded-full overflow-hidden mb-4">
                  <div
                    className={`h-full rounded-full transition-all ${
                      pursePct > 60 ? 'bg-accent-emerald' : pursePct > 20 ? 'bg-accent-gold' : 'bg-accent-crimson'
                    }`}
                    style={{ width: `${pursePct}%` }}
                  />
                </div>

                <div className="text-xs text-muted-foreground">
                  <span className="font-mono">{team.players.length}</span> players • <span className="font-mono">{team.rtmRemaining}</span> RTM cards
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export function TeamDashboard() {
  const { slug } = useParams<{ slug: string }>();
  const { state, getTeamBySlug, getPlayer, formatPrice } = useAuction();
  const team = getTeamBySlug(slug || '');

  if (!team) return (
    <div className="min-h-screen bg-background pt-20 flex items-center justify-center">
      <div className="text-center">
        <h1 className="font-orbitron text-3xl text-foreground mb-4">Team Not Found</h1>
        <Link to="/teams" className="btn-ghost">← Back to Teams</Link>
      </div>
    </div>
  );

  const currentPlayer = state.currentPlayerId ? getPlayer(state.currentPlayerId) : null;
  const leadingTeam = state.leadingTeamId ? state.teams.find(t => t.id === state.leadingTeamId) : null;
  const teamPlayers = team.players.map(id => getPlayer(id)).filter(Boolean);
  const pursePct = (team.purse / 12000) * 100;

  // Upcoming players (next 5 available)
  const upcoming = state.players.filter(p => p.status === 'available').slice(0, 5);

  return (
    <div className="min-h-screen bg-background pt-20 pb-12">
      <div className="container mx-auto px-4">
        <div className="flex items-center gap-4 mb-8">
          <div className="w-4 h-12 rounded" style={{ background: team.color }} />
          <div>
            <h1 className="font-exo font-bold text-3xl text-foreground">{team.name}</h1>
            <p className="text-muted-foreground text-sm">{team.city}</p>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Live auction */}
          <div className="lg:col-span-2 space-y-4">
            {state.status === 'live' && currentPlayer ? (
              <div className="glass-card p-6">
                <div className="text-xs font-rajdhani text-accent-emerald tracking-wider mb-4 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-accent-emerald animate-pulse" />
                  LIVE AUCTION
                </div>
                <div className="flex items-start gap-4 mb-6">
                  <img src={currentPlayer.photo} alt={currentPlayer.name} className="w-20 h-20 rounded-xl border-2 border-border" />
                  <div>
                    <h2 className="font-exo font-bold text-2xl text-foreground">{currentPlayer.name}</h2>
                    <span className={`text-xs font-rajdhani font-semibold px-2 py-0.5 rounded-full role-${currentPlayer.role.replace('-', '-')}`}>
                      {roleEmojis[currentPlayer.role]} {currentPlayer.role.replace('-', ' ').toUpperCase()}
                    </span>
                  </div>
                </div>

                <div className="text-center mb-6">
                  <div className="text-xs font-rajdhani text-muted-foreground tracking-wider mb-1">CURRENT BID</div>
                  <div className="font-mono text-5xl font-bold text-accent-cyan text-glow-cyan">
                    {formatPrice(state.currentBid)}
                  </div>
                  {leadingTeam && (
                    <div className="font-exo text-lg mt-2" style={{ color: leadingTeam.color }}>
                      {leadingTeam.name}
                    </div>
                  )}
                </div>

                <div className="text-center mb-4">
                  <AuctionTimer seconds={state.timerSeconds} />
                  <TimerBar seconds={state.timerSeconds} max={15} />
                </div>

                <div className="bg-accent-orange/10 border border-accent-orange/20 rounded-lg p-3 text-center text-xs text-accent-orange">
                  🎙️ Raise your placard to bid. The auctioneer registers all bids.
                </div>
              </div>
            ) : (
              <div className="glass-card p-12 text-center">
                <div className="font-orbitron text-2xl text-muted-foreground mb-2">
                  {state.status === 'pre' ? 'Auction Starting Soon' : state.status === 'complete' ? 'Auction Complete' : 'Waiting for Next Player'}
                </div>
                <p className="text-muted-foreground text-sm">Stay tuned for live updates</p>
              </div>
            )}

            {/* Upcoming */}
            <div className="glass-card p-6">
              <h3 className="font-exo font-semibold text-foreground mb-4">Coming Up Next</h3>
              <div className="space-y-2">
                {upcoming.map((p, i) => (
                  <PlayerCard key={p!.id} player={p!} compact />
                ))}
              </div>
            </div>
          </div>

          {/* Team info */}
          <div className="space-y-4">
            <div className="glass-card p-6" style={{ borderTopColor: team.color, borderTopWidth: 3 }}>
              <h3 className="font-exo font-semibold text-foreground mb-4">Team Summary</h3>
              <div className="flex items-baseline justify-between mb-2">
                <span className="text-xs font-rajdhani text-muted-foreground">PURSE REMAINING</span>
                <span className={`font-mono font-bold text-2xl ${
                  pursePct > 60 ? 'text-accent-emerald' : pursePct > 20 ? 'text-accent-gold' : 'text-accent-crimson'
                }`}>
                  {formatPrice(team.purse)}
                </span>
              </div>
              <div className="w-full h-3 bg-muted rounded-full overflow-hidden mb-6">
                <div
                  className={`h-full rounded-full ${pursePct > 60 ? 'bg-accent-emerald' : pursePct > 20 ? 'bg-accent-gold' : 'bg-accent-crimson'}`}
                  style={{ width: `${pursePct}%` }}
                />
              </div>

              {/* Role composition */}
              <div className="space-y-3 mb-6">
                {Object.entries(MIN_REQ).map(([role, min]) => {
                  const count = team.roleCounts[role] || 0;
                  const met = count >= min;
                  return (
                    <div key={role} className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">
                        {roleEmojis[role as keyof typeof roleEmojis]} {role.replace('-', ' ')}
                      </span>
                      <span className={`font-mono ${met ? 'text-accent-emerald' : 'text-accent-crimson'}`}>
                        {count} / {min} {met ? '✓' : '⚠️'}
                      </span>
                    </div>
                  );
                })}
              </div>

              <div className="flex items-center gap-2 text-sm">
                <span className="bg-accent-purple/15 text-accent-purple px-2 py-1 rounded-full text-xs font-rajdhani font-semibold border border-accent-purple/30">
                  RTM Cards: {team.rtmRemaining}
                </span>
              </div>
            </div>

            {/* Squad */}
            <div className="glass-card p-6">
              <h3 className="font-exo font-semibold text-foreground mb-4">
                Squad <span className="font-mono text-xs text-muted-foreground">({teamPlayers.length})</span>
              </h3>
              {teamPlayers.length === 0 ? (
                <p className="text-muted-foreground text-sm text-center py-4">No players yet</p>
              ) : (
                <div className="space-y-2">
                  {teamPlayers.map(p => p && (
                    <div key={p.id} className="flex items-center justify-between py-2 border-b border-border/50 last:border-0">
                      <div className="flex items-center gap-2">
                        <img src={p.photo} alt={p.name} className="w-8 h-8 rounded-full" loading="lazy" />
                        <span className="text-sm text-foreground">{p.name}</span>
                      </div>
                      <span className="font-mono text-xs text-accent-gold">{formatPrice(p.soldPrice || 0)}</span>
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
