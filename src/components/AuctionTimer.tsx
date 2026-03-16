interface Props {
  seconds: number;
  large?: boolean;
}

export default function AuctionTimer({ seconds, large }: Props) {
  const isUrgent = seconds <= 5;
  const size = large ? 'text-7xl' : 'text-4xl';

  return (
    <div className={`font-mono font-bold ${size} tabular-nums transition-colors duration-200 ${
      isUrgent ? 'text-accent-crimson animate-pulse text-glow-crimson' : 'text-accent-cyan text-glow-cyan'
    }`}>
      {String(Math.floor(seconds / 60)).padStart(2, '0')}:{String(seconds % 60).padStart(2, '0')}
    </div>
  );
}

export function TimerBar({ seconds, max }: { seconds: number; max: number }) {
  const pct = (seconds / max) * 100;
  const isUrgent = seconds <= 5;
  return (
    <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
      <div
        className={`h-full rounded-full transition-all duration-1000 ease-linear ${
          isUrgent ? 'bg-accent-crimson glow-crimson' : 'bg-accent-cyan glow-cyan'
        }`}
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}
