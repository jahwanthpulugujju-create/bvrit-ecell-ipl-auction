import { useAuction } from '@/context/AuctionContext';
import AuctionTimer from '@/components/AuctionTimer';
import { roleEmojis } from '@/data/players';

export default function Display() {
  const { state, getPlayer, formatPrice } = useAuction();
  const currentPlayer = state.currentPlayerId ? getPlayer(state.currentPlayerId) : null;
  const leadingTeam = state.leadingTeamId ? state.teams.find(t => t.id === state.leadingTeamId) : null;
  const soldPlayers = state.players.filter(p => p.status === 'sold');
  const upcoming = state.players.filter(p => p.status === 'available').slice(0, 5);

  return (
    <div className="h-screen w-screen overflow-hidden bg-background relative flex flex-col">
      {/* Background orbs */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute w-[600px] h-[600px] -top-40 -left-40 rounded-full bg-accent-cyan/5 blur-3xl animate-float" />
        <div className="absolute w-[500px] h-[500px] -bottom-40 -right-40 rounded-full bg-accent-orange/5 blur-3xl animate-float" style={{ animationDelay: '4s' }} />
      </div>

      {/* Main grid */}
      <div className="flex-1 grid grid-cols-[1fr_300px] grid-rows-[1fr_auto] gap-0 relative z-10 p-4">
        {/* Center: Current auction */}
        <div className="flex flex-col items-center justify-center p-8">
          {currentPlayer ? (
            <div className="text-center">
              <div className="flex items-center gap-2 justify-center mb-6">
                <span className="w-3 h-3 rounded-full bg-accent-emerald animate-pulse" />
                <span className="font-rajdhani font-bold text-accent-emerald text-sm tracking-[0.3em]">LIVE AUCTION</span>
              </div>

              <div className="mb-6">
                <img src={currentPlayer.photo} alt={currentPlayer.name} className="w-28 h-28 rounded-2xl border-2 border-accent-cyan/30 mx-auto mb-4 glow-cyan" />
                <h1 className="font-orbitron text-5xl md:text-7xl font-black text-foreground text-glow-cyan leading-none mb-3">
                  {currentPlayer.name}
                </h1>
                <span className={`inline-block text-sm font-rajdhani font-bold px-4 py-1.5 rounded-full role-${currentPlayer.role}`}>
                  {roleEmojis[currentPlayer.role]} {currentPlayer.role.replace('-', ' ').toUpperCase()}
                </span>
                <div className="font-mono text-lg text-muted-foreground mt-2">
                  Base: {formatPrice(currentPlayer.basePrice)}
                </div>
              </div>

              <div className="mb-6">
                <div className="text-xs font-rajdhani text-muted-foreground tracking-[0.3em] mb-2">CURRENT BID</div>
                <div className="font-mono text-7xl md:text-9xl font-bold text-accent-cyan text-glow-cyan">
                  {formatPrice(state.currentBid)}
                </div>
              </div>

              {leadingTeam && (
                <div className="font-exo text-3xl font-bold mb-8" style={{ color: leadingTeam.color }}>
                  {leadingTeam.name}
                </div>
              )}

              <AuctionTimer seconds={state.timerSeconds} large />
              <div className="w-96 mx-auto mt-4 h-3 bg-muted rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-1000 ease-linear ${
                    state.timerSeconds <= 5 ? 'bg-accent-crimson glow-crimson' : 'bg-accent-cyan glow-cyan'
                  }`}
                  style={{ width: `${(state.timerSeconds / 15) * 100}%` }}
                />
              </div>
            </div>
          ) : (
            <div className="text-center">
              <h1 className="font-orbitron text-4xl md:text-6xl font-black text-foreground mb-4">
                BVRIT <span className="text-accent-orange">IPL AUCTION</span>
              </h1>
              <p className="font-exo text-2xl text-muted-foreground">
                {state.status === 'complete' ? 'Auction Complete' : 'Waiting for Next Player...'}
              </p>
              <p className="font-rajdhani text-lg text-muted-foreground mt-2 tracking-wider">E-SUMMIT 2026</p>
            </div>
          )}
        </div>

        {/* Right: Upcoming + Team purses */}
        <div className="border-l border-border/50 p-4 flex flex-col gap-4 overflow-hidden">
          <div>
            <h3 className="font-rajdhani font-bold text-xs text-muted-foreground tracking-[0.3em] mb-3">COMING UP NEXT</h3>
            <div className="space-y-2">
              {upcoming.map((p, i) => (
                <div key={p.id} className="glass-card p-3 flex items-center gap-3">
                  <span className="font-mono text-xs text-muted-foreground w-5">{i + 1}</span>
                  <img src={p.photo} alt={p.name} className="w-8 h-8 rounded-lg border border-border" loading="lazy" />
                  <div className="flex-1 min-w-0">
                    <div className="font-exo font-semibold text-xs text-foreground truncate">{p.name}</div>
                    <div className="font-mono text-[10px] text-accent-cyan">{formatPrice(p.basePrice)}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex-1 overflow-auto">
            <h3 className="font-rajdhani font-bold text-xs text-muted-foreground tracking-[0.3em] mb-3">TEAM PURSES</h3>
            <div className="space-y-2">
              {state.teams.map(t => {
                const pct = (t.purse / 12000) * 100;
                return (
                  <div key={t.id} className={`p-2 rounded-lg ${t.id === state.leadingTeamId ? 'border border-accent-cyan/40 bg-accent-cyan/5' : 'bg-card/40'}`}>
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="text-foreground font-medium truncate">{t.name}</span>
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

        {/* Bottom: Sold ticker */}
        <div className="col-span-2 border-t border-border/50 py-2 overflow-hidden">
          <div className="flex items-center gap-2 h-8">
            <span className="font-rajdhani font-bold text-xs text-accent-gold tracking-wider shrink-0 px-3">SOLD</span>
            <div className="overflow-hidden flex-1">
              <div className={`flex gap-6 ${soldPlayers.length > 3 ? 'animate-ticker' : ''}`} style={{ width: 'max-content' }}>
                {(soldPlayers.length > 3 ? [...soldPlayers, ...soldPlayers] : soldPlayers).map((p, i) => {
                  const team = state.teams.find(t => t.id === p.soldToTeamId);
                  return (
                    <span key={`${p.id}-${i}`} className="text-xs text-muted-foreground whitespace-nowrap flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full" style={{ background: team?.color || '#fff' }} />
                      {p.name} → {team?.name} → {formatPrice(p.soldPrice || 0)}
                    </span>
                  );
                })}
                {soldPlayers.length === 0 && <span className="text-xs text-muted-foreground">No players sold yet</span>}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Status bar */}
      <div className="bg-card/80 border-t border-border/50 px-6 py-2 flex items-center justify-between text-xs text-muted-foreground">
        <span className="font-orbitron text-[10px]">E-SUMMIT 2026 | BVRIT E-CELL</span>
        <span className="font-rajdhani tracking-wider">{state.currentPhase.toUpperCase()} PHASE</span>
        <span className="font-mono">Sold: {state.soldCount}/250 • Value: {formatPrice(state.totalValue)}</span>
      </div>
    </div>
  );
}
