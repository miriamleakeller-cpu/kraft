import { useEffect, useState } from 'preact/hooks';

// iOS-spezifisches an einer Stelle. Was iOS im Hintergrund nicht erlaubt, versprechen wir nicht:
// Der Ton kommt nur, solange die App sichtbar ist. Die Restzeit stimmt trotzdem immer,
// weil sie aus der gespeicherten Endzeit berechnet wird.

let ctx: AudioContext | null = null;

/** Muss bei einem Tipp aufgerufen werden, sonst blockiert iOS den Ton. */
export function unlockAudio() {
  try {
    // Ton mischt sich mit dem Podcast, statt ihn zu unterbrechen (Safari 16.4+).
    const session = (navigator as Navigator & { audioSession?: { type: string } }).audioSession;
    if (session) session.type = 'ambient';
    ctx ??= new AudioContext();
    if (ctx.state === 'suspended') void ctx.resume();
  } catch {
    /* ohne Ton weiter */
  }
}

/** Kurzer, leiser Doppelton. */
export function chime() {
  if (!ctx) return;
  const t = ctx.currentTime;
  for (const [i, f] of [660, 880].entries()) {
    const o = ctx.createOscillator();
    const g = ctx.createGain();
    o.type = 'sine';
    o.frequency.value = f;
    const start = t + i * 0.16;
    g.gain.setValueAtTime(0.0001, start);
    g.gain.exponentialRampToValueAtTime(0.12, start + 0.02);
    g.gain.exponentialRampToValueAtTime(0.0001, start + 0.35);
    o.connect(g).connect(ctx.destination);
    o.start(start);
    o.stop(start + 0.4);
  }
}

/** Hält den Bildschirm während des Trainings wach, falls das Gerät es erlaubt. */
export function useWakeLock(on: boolean) {
  useEffect(() => {
    if (!on || !('wakeLock' in navigator)) return;
    let lock: WakeLockSentinel | null = null;
    const get = async () => {
      try {
        if (document.visibilityState === 'visible') lock = await navigator.wakeLock.request('screen');
      } catch {
        /* nicht erlaubt, egal */
      }
    };
    void get();
    const vis = () => void get();
    document.addEventListener('visibilitychange', vis);
    return () => {
      document.removeEventListener('visibilitychange', vis);
      void lock?.release();
    };
  }, [on]);
}

export function useNow(ms = 250) {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), ms);
    const vis = () => setNow(Date.now());
    document.addEventListener('visibilitychange', vis);
    return () => {
      clearInterval(id);
      document.removeEventListener('visibilitychange', vis);
    };
  }, [ms]);
  return now;
}
