import { Player, roleEmojis } from '@/data/players';
import { useAuction } from '@/context/AuctionContext';

const roleColors: Record<string, string> = {
  'batsman': 'role-batsman',
  'fast-bowler': 'role-fast-bowler',
  'spinner': 'role-spinner',
  'wicket-keeper': 'role-wicket-keeper',
  'all-rounder': 'role-all-rounder',
};

const statusColors: Record<string, string> = {
  'available': 'status-available',
  'retained': 'status-retained',
  'sold': 'status-sold',
  'unsold': 'status-unsold',
  'live': 'status-live',
  'pending_sale': 'status-live',
};

const categoryColors: Record<string, string> = {
  'marquee': 'bg-accent-gold/15 text-accent-gold border border-accent-gold/30',
  'premium': 'bg-accent-cyan/15 text-accent-cyan border border-accent-cyan/30',
  'mid-tier': 'bg-accent-emerald/15 text-accent-emerald border border-accent-emerald/30',
  'budget': 'bg-muted text-muted-foreground border border-muted-foreground/20',
};

interface Props {
  player: Player;
  compact?: boolean;
}

export default function PlayerCard({ player, compact }: Props) {
  const { formatPrice, getTeam } = useAuction();
  const team = player.soldToTeamId ? getTeam(player.soldToTeamId) : null;

  if (compact) {
    return (
      <div className="glass-card p-3 flex items-center gap-3 hover:border-accent-cyan/30 transition-all">
        <img
          src={player.photo}
          alt={player.name}
          className="w-10 h-10 rounded-full border border-border object-cover"
          loading="lazy"
          onError={(e) => { (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${encodeURIComponent(player.name)}&background=0c1420&color=e8f4fd&size=64`; }}
        />
        <div className="flex-1 min-w-0">
          <div className="font-exo font-semibold text-sm text-foreground truncate">{player.name}</div>
          <div className="flex items-center gap-1.5">
            <span className={`inline-block text-[10px] font-rajdhani font-semibold px-1.5 py-0.5 rounded ${roleColors[player.role]}`}>
              {roleEmojis[player.role]} {player.role.replace('-', ' ').toUpperCase()}
            </span>
            <span className="text-[10px] text-muted-foreground">{player.franchise}</span>
          </div>
        </div>
        <span className="font-mono text-sm text-accent-cyan font-semibold">{formatPrice(player.basePrice)}</span>
      </div>
    );
  }

  return (
    <div className="group relative glass-card overflow-hidden hover:border-accent-cyan/30 hover:-translate-y-1 transition-all duration-200">
      {player.status === 'sold' && (
        <div className="absolute inset-0 z-10 flex items-center justify-center bg-background/60 backdrop-blur-sm">
          <div className="animate-sold-stamp font-orbitron text-3xl font-black text-accent-gold border-4 border-accent-gold px-6 py-2 -rotate-12">
            SOLD
          </div>
        </div>
      )}
      {player.status === 'live' && (
        <div className="absolute top-3 right-3 z-10 flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-accent-emerald animate-pulse" />
          <span className="text-[10px] font-rajdhani font-bold text-accent-emerald tracking-wider">LIVE</span>
        </div>
      )}

      <div className="p-5">
        <div className="flex items-start gap-4 mb-4">
          <img
            src={player.photo}
            alt={player.name}
            className="w-16 h-16 rounded-xl border-2 border-border object-cover"
            loading="lazy"
            onError={(e) => { (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${encodeURIComponent(player.name)}&background=0c1420&color=e8f4fd&size=128`; }}
          />
          <div className="flex-1 min-w-0">
            <h3 className="font-exo font-bold text-foreground text-lg leading-tight truncate">{player.name}</h3>
            <p className="text-[10px] text-muted-foreground mb-1">{player.franchise}</p>
            <div className="flex flex-wrap gap-1.5 mt-1">
              <span className={`text-[10px] font-rajdhani font-semibold px-2 py-0.5 rounded-full ${roleColors[player.role]}`}>
                {roleEmojis[player.role]} {player.role.replace('-', ' ').toUpperCase()}
              </span>
              <span className={`text-[10px] font-rajdhani font-semibold px-2 py-0.5 rounded-full ${categoryColors[player.category]}`}>
                {player.category.toUpperCase()}
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-muted text-muted-foreground">
                {player.nationality === 'indian' ? '🇮🇳' : '🌍'} {player.nationality.toUpperCase()}
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between mb-4">
          <div>
            <div className="text-[10px] font-rajdhani text-muted-foreground tracking-wider">BASE PRICE</div>
            <div className="font-mono text-xl font-bold text-accent-cyan text-glow-cyan">{formatPrice(player.basePrice)}</div>
          </div>
          <div className="text-right">
            <div className="text-[10px] font-rajdhani text-muted-foreground tracking-wider">RATING</div>
            <div className="font-mono text-xl font-bold text-accent-gold">{player.rating.toFixed(1)}</div>
          </div>
        </div>

        {/* Stat bars */}
        <div className="space-y-2 mb-4">
          {[
            { label: 'BAT', val: player.batting, color: 'bg-accent-cyan' },
            { label: 'BOWL', val: player.bowling, color: 'bg-accent-purple' },
            { label: 'FIELD', val: player.fielding, color: 'bg-accent-emerald' },
          ].map(s => (
            <div key={s.label} className="flex items-center gap-2">
              <span className="text-[10px] font-rajdhani text-muted-foreground w-10">{s.label}</span>
              <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
                <div className={`h-full ${s.color} rounded-full transition-all duration-500`} style={{ width: `${s.val * 10}%` }} />
              </div>
              <span className="text-[10px] font-mono text-muted-foreground w-4 text-right">{s.val}</span>
            </div>
          ))}
        </div>

        {/* Bowling style info */}
        <div className="bg-muted/50 rounded-lg p-2 mb-4 text-center">
          <div className="text-[10px] font-rajdhani text-muted-foreground">BOWLING STYLE</div>
          <div className="font-mono text-xs font-semibold text-foreground">{player.bowlingStyle}</div>
        </div>

        {/* Status & sold info */}
        <div className="flex items-center justify-between">
          <span className={`text-[10px] font-rajdhani font-bold px-2.5 py-1 rounded-full border ${statusColors[player.status]}`}>
            {player.status.toUpperCase()}
          </span>
          {team && player.soldPrice && (
            <span className="text-xs font-mono text-accent-gold">
              {team.name} • {formatPrice(player.soldPrice)}
            </span>
          )}
          {player.previousTeamId && player.status === 'available' && (
            <span className="text-[10px] font-rajdhani font-bold px-2 py-0.5 rounded-full bg-accent-purple/15 text-accent-purple border border-accent-purple/30">
              RTM
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
