import type { Exercise, GymSession, Region } from './types';

// Abdeckung: An wie vielen Trainingstagen wurde ein Bereich belastet?
// Hauptbelastung zählt voll, Mitbeteiligung halb. Pro Tag zählt ein Bereich höchstens einmal.

export type Exposure = Partial<Record<Region, number>>;

export function sessionExposure(session: GymSession, lib: Exercise[]): Exposure {
  const out: Exposure = {};
  const done = new Set(session.sets.map((s) => s.exerciseId));
  for (const id of done) {
    const ex = lib.find((e) => e.id === id);
    if (!ex) continue;
    for (const { region, weight } of ex.regions) out[region] = Math.max(out[region] ?? 0, weight);
  }
  return out;
}

export function exposureSince(sessions: GymSession[], lib: Exercise[], since: Date): Exposure {
  const byDay = new Map<string, Exposure>();
  for (const s of sessions) {
    if (Date.parse(s.startedAt) < since.getTime()) continue;
    const day = s.startedAt.slice(0, 10);
    const e = sessionExposure(s, lib);
    const d = byDay.get(day) ?? {};
    for (const [r, w] of Object.entries(e) as [Region, number][]) d[r] = Math.max(d[r] ?? 0, w);
    byDay.set(day, d);
  }
  const out: Exposure = {};
  for (const d of byDay.values()) {
    for (const [r, w] of Object.entries(d) as [Region, number][]) out[r] = (out[r] ?? 0) + w;
  }
  return out;
}
