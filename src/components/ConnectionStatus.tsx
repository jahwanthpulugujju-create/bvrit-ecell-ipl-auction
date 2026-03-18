import { useState, useEffect } from 'react';
import { useAuction } from '@/context/AuctionContext';

export default function ConnectionStatus({ className = '' }: { className?: string }) {
  const { connected } = useAuction();
  const [wasDisconnected, setWasDisconnected] = useState(false);

  useEffect(() => {
    if (!connected) setWasDisconnected(true);
  }, [connected]);

  const label = connected ? 'Live' : wasDisconnected ? 'Offline' : 'Connecting…';
  const dot = connected
    ? 'bg-accent-emerald shadow-[0_0_8px_hsl(152_100%_50%/0.8)]'
    : wasDisconnected
    ? 'bg-accent-crimson animate-pulse'
    : 'bg-accent-gold animate-pulse';
  const text = connected
    ? 'text-accent-emerald'
    : wasDisconnected
    ? 'text-accent-crimson'
    : 'text-accent-gold';

  return (
    <div className={`flex items-center gap-1.5 ${className}`}>
      <span className={`w-2 h-2 rounded-full ${dot}`} />
      <span className={`font-rajdhani text-xs font-semibold tracking-wider ${text}`}>
        {label.toUpperCase()}
      </span>
    </div>
  );
}
