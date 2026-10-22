import { useEffect } from 'preact/hooks';

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
