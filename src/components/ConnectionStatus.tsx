import { useState, useEffect } from 'react';
import { RealtimeChannel } from '@supabase/supabase-js';

interface Props {
  channel: RealtimeChannel | null;
  className?: string;
}

export default function ConnectionStatus({ channel, className = '' }: Props) {
  const [status, setStatus] = useState<'connecting' | 'connected' | 'disconnected'>('connecting');

  useEffect(() => {
    if (!channel) return;
    const handleStatus = (s: string) => {
      if (s === 'SUBSCRIBED') setStatus('connected');
      else if (s === 'CLOSED' || s === 'CHANNEL_ERROR') setStatus('disconnected');
      else setStatus('connecting');
    };
    channel.on('system' as any, {}, (payload: any) => {
      handleStatus(payload.status || payload);
    });
    const sub = channel.subscribe((s) => handleStatus(s));
    return () => { /* cleanup handled by parent */ };
  }, [channel]);

  const label = status === 'connected' ? 'Live' : status === 'connecting' ? 'Connecting…' : 'Offline';
  const dot =
    status === 'connected'
      ? 'bg-accent-emerald shadow-[0_0_8px_hsl(152_100%_50%/0.8)]'
      : status === 'connecting'
      ? 'bg-accent-gold animate-pulse'
      : 'bg-accent-crimson';
  const text =
    status === 'connected'
      ? 'text-accent-emerald'
      : status === 'connecting'
      ? 'text-accent-gold'
      : 'text-accent-crimson';

  return (
    <div className={`flex items-center gap-1.5 ${className}`}>
      <span className={`w-2 h-2 rounded-full ${dot}`} />
      <span className={`font-rajdhani text-xs font-semibold tracking-wider ${text}`}>{label.toUpperCase()}</span>
    </div>
  );
}
