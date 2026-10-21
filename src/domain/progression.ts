import { rules } from '../config/rules';
import type { Exercise, Feel, GymSession, SetLog } from './types';

// Gewichtsvorschlag nach doppelter Progression, bewusst vorsichtig:
// - Erhöhen erst nach zwei Einheiten in Folge mit oberem Wiederholungsbereich und ohne «Sehr streng».
// - Senken erst nach zwei Einheiten in Folge mit «Sehr streng» oder zu wenigen Wiederholungen.
// - Nie mehr als eine Stufe pro Einheit.
// - Nach längerer Pause ein vorsichtigerer Einstieg; danach entscheidet die Rückmeldung.

export interface Performance {
  date: string;
  weight?: number;
  reps: number[];
  seconds: number[];
  feel?: Feel;
}

export type SuggestionNote = 'kalibrierung' | 'wiedereinstieg' | 'erhoeht' | 'gesenkt';

export interface Suggestion {
  weight?: number;
  reps?: number;
  seconds?: number;
  note?: SuggestionNote;
}

const FEEL_RANK: Record<Feel, number> = { leicht: 0, passend: 1, streng: 2 };
const DAY = 86_400_000;

/** Fasst die Sätze einer Übung pro Training zusammen, neueste zuerst. */
export function performances(exerciseId: string, sessions: GymSession[]): Performance[] {
  const out: Performance[] = [];
  for (const s of sessions) {
    const sets = s.sets.filter((x) => x.exerciseId === exerciseId);
    if (!sets.length) continue;
    out.push(summarise(s.startedAt, sets));
  }
  return out.sort((a, b) => b.date.localeCompare(a.date));
}

function summarise(date: string, sets: SetLog[]): Performance {
  const weights = sets.map((s) => s.weight).filter((w): w is number => w != null);
  // Die strengste Rückmeldung zählt, damit die Logik vorsichtig bleibt.
  const feels = sets.map((s) => s.feel).filter((f): f is Feel => f != null);
  return {
    date,
    weight: weights.length ? Math.max(...weights) : undefined,
    reps: sets.map((s) => s.reps).filter((r): r is number => r != null),
    seconds: sets.map((s) => s.seconds).filter((r): r is number => r != null),
    feel: feels.length ? feels.reduce((a, b) => (FEEL_RANK[b] > FEEL_RANK[a] ? b : a)) : undefined,
  };
}

/** Rundet auf die nächste vorhandene Stufe und verschiebt um `by` Stufen. */
export function shiftStep(steps: number[], value: number, by: number): number {
  if (!steps.length) return value;
  let i = 0;
  for (let k = 1; k < steps.length; k++) {
    if (Math.abs(steps[k] - value) < Math.abs(steps[i] - value)) i = k;
  }
  return steps[Math.min(steps.length - 1, Math.max(0, i + by))];
}

export function suggest(ex: Exercise, history: Performance[], steps: number[], now: Date): Suggestion {
  const [lo, hi] = ex.range;
  const last = history[0];
  if (!last) {
    if (ex.measure === 'zeit') return { seconds: lo, note: 'kalibrierung' };
    if (ex.measure === 'wiederholungen') return { reps: lo, note: 'kalibrierung' };
    return { reps: hi, note: 'kalibrierung' };
  }
  const prev = history[1];
  const daysSince = (now.getTime() - Date.parse(last.date)) / DAY;
  const lastWasReentry = prev != null && (Date.parse(last.date) - Date.parse(prev.date)) / DAY >= rules.pauseCautionDays;

  const values = ex.measure === 'zeit' ? (p: Performance) => p.seconds : (p: Performance) => p.reps;
  const atTop = (p?: Performance) => !!p && values(p).length > 0 && values(p).every((v) => v >= hi);
  const below = (p?: Performance) => !!p && values(p).length > 0 && values(p).every((v) => v < lo);
  const fine = (p?: Performance) => !!p && p.feel !== 'streng';
  const streng = (p?: Performance) => !!p && p.feel === 'streng';
  const sameLoad = ex.measure !== 'gewicht' || (prev != null && prev.weight === last.weight);

  if (ex.measure === 'zeit') {
    const base = Math.max(...last.seconds, lo);
    if (atTop(last) && fine(last) && atTop(prev) && fine(prev)) return { seconds: Math.min(base + 5, hi), note: 'erhoeht' };
    if (atTop(last) && fine(last)) return { seconds: Math.min(base + 5, hi) };
    return { seconds: Math.min(base, hi) };
  }

  if (ex.measure === 'wiederholungen') {
    return { reps: Math.min(Math.max(Math.max(...last.reps), lo), hi) };
  }

  const base = last.weight ?? steps[0];
  if (daysSince >= rules.pauseCautionLongDays) return { weight: shiftStep(steps, base, -2), reps: lo, note: 'wiedereinstieg' };
  if (daysSince >= rules.pauseCautionDays) return { weight: shiftStep(steps, base, -1), reps: lo, note: 'wiedereinstieg' };

  if (lastWasReentry && atTop(last) && fine(last)) return { weight: shiftStep(steps, base, 1), reps: lo, note: 'erhoeht' };
  if (sameLoad && atTop(last) && fine(last) && atTop(prev) && fine(prev)) {
    return { weight: shiftStep(steps, base, 1), reps: lo, note: 'erhoeht' };
  }
  if (sameLoad && ((streng(last) && streng(prev)) || (below(last) && below(prev)))) {
    return { weight: shiftStep(steps, base, -1), reps: lo, note: 'gesenkt' };
  }
  return { weight: shiftStep(steps, base, 0), reps: Math.min(Math.max(Math.max(...last.reps), lo), hi) };
}
