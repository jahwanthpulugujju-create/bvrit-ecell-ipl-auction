let ctx: AudioContext | null = null;

function getCtx(): AudioContext {
  if (!ctx) ctx = new AudioContext();
  if (ctx.state === 'suspended') ctx.resume();
  return ctx;
}

function isMuted(): boolean {
  return localStorage.getItem('auction_muted') === 'true';
}

export function toggleMute(): boolean {
  const next = !isMuted();
  localStorage.setItem('auction_muted', String(next));
  return next;
}

export function getMuted(): boolean {
  return isMuted();
}

export function playBidBeep() {
  if (isMuted()) return;
  try {
    const c = getCtx();
    const osc = c.createOscillator();
    const gain = c.createGain();
    osc.connect(gain); gain.connect(c.destination);
    osc.frequency.value = 880;
    osc.type = 'sine';
    gain.gain.setValueAtTime(0.3, c.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, c.currentTime + 0.08);
    osc.start(); osc.stop(c.currentTime + 0.08);
  } catch {}
}

export function playFreezeRejected() {
  if (isMuted()) return;
  try {
    const c = getCtx();
    const osc = c.createOscillator();
    const gain = c.createGain();
    osc.connect(gain); gain.connect(c.destination);
    osc.frequency.value = 440;
    osc.type = 'sawtooth';
    gain.gain.setValueAtTime(0.2, c.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, c.currentTime + 0.06);
    osc.start(); osc.stop(c.currentTime + 0.06);
  } catch {}
}

export function playSoldFanfare() {
  if (isMuted()) return;
  try {
    const c = getCtx();
    const notes = [523.25, 659.25, 783.99, 1046.50];
    notes.forEach((freq, i) => {
      const osc = c.createOscillator();
      const gain = c.createGain();
      osc.connect(gain); gain.connect(c.destination);
      osc.frequency.value = freq;
      osc.type = 'sine';
      const start = c.currentTime + i * 0.17;
      gain.gain.setValueAtTime(0.4, start);
      gain.gain.exponentialRampToValueAtTime(0.001, start + 0.12);
      osc.start(start); osc.stop(start + 0.12);
    });
  } catch {}
}

export function playUrgentBeep() {
  if (isMuted()) return;
  try {
    const c = getCtx();
    const osc = c.createOscillator();
    const gain = c.createGain();
    osc.connect(gain); gain.connect(c.destination);
    osc.frequency.value = 1200;
    osc.type = 'sine';
    gain.gain.setValueAtTime(0.25, c.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, c.currentTime + 0.15);
    osc.start(); osc.stop(c.currentTime + 0.15);
  } catch {}
}

export function playUnsoldSound() {
  if (isMuted()) return;
  try {
    const c = getCtx();
    [392, 329.63].forEach((freq, i) => {
      const osc = c.createOscillator();
      const gain = c.createGain();
      osc.connect(gain); gain.connect(c.destination);
      osc.frequency.value = freq;
      osc.type = 'sine';
      const start = c.currentTime + i * 0.18;
      gain.gain.setValueAtTime(0.2, start);
      gain.gain.exponentialRampToValueAtTime(0.001, start + 0.15);
      osc.start(start); osc.stop(start + 0.15);
    });
  } catch {}
}
