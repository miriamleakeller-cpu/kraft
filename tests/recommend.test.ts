import { describe, expect, it } from 'vitest';
import { library } from '../src/config/library';
import { rules } from '../src/config/rules';
import { sessionExposure } from '../src/domain/coverage';
import { recommend } from '../src/domain/recommend';
import type { GymSession } from '../src/domain/types';
import { one, session, two } from './helpers';

const now = new Date('2026-10-20T10:20:00Z');
const run = (s: GymSession, history: GymSession[] = [], runs: { id: string; date: string; distanceM: number; movingTimeS: number }[] = []) =>
  recommend({ library, session: s, history, runs, now });
const ids = (r: ReturnType<typeof recommend>) => r.top.map((t) => t.exercise.id);

describe('Empfehlungen', () => {
  it('zeigt immer drei Empfehlungen und alle Geräte', () => {
    const r = run(session('2026-10-20T10:00:00Z'));
    expect(r.top).toHaveLength(3);
    expect(r.all).toHaveLength(library.length);
  });

  it('ist deterministisch', () => {
    const s = session('2026-10-20T10:00:00Z', two('brustpresse', 40, [10, 10]));
    expect(ids(run(s))).toEqual(ids(run(s)));
  });

  it('nimmt eine fertige Übung aus den Empfehlungen und rückt eine andere nach', () => {
    const before = run(session('2026-10-20T10:00:00Z'));
    const first = before.top[0].exercise.id;
    const after = run(session('2026-10-20T10:00:00Z', two(first, 40, [10, 10])));
    expect(ids(after)).not.toContain(first);
    expect(after.all.find((x) => x.exercise.id === first)?.done).toBe(true);
  });

  it('zählt Aufwärmsätze nicht als erledigt', () => {
    const s = session('2026-10-20T10:00:00Z', [{ exerciseId: 'beinpresse', weight: 30, reps: 15, warmup: true }]);
    const r = run(s);
    const bp = r.all.find((x) => x.exercise.id === 'beinpresse')!;
    expect(bp.setsDone).toBe(0);
    expect(bp.done).toBe(false);
  });

  it('gilt mit einem Arbeitssatz als erledigt', () => {
    const r = run(session('2026-10-20T10:00:00Z', one('latzug', 40, 10)));
    expect(r.all.find((x) => x.exercise.id === 'latzug')?.done).toBe(true);
  });

  it('bevorzugt Bereiche, die heute noch fehlen', () => {
    // Ziehen erledigt: als Nächstes soll nicht wieder Rücken oben kommen
    const s = session('2026-10-20T10:00:00Z', [...two('latzug', 40, [10, 10])]);
    const top = run(s).top.map((t) => t.exercise);
    expect(top.some((e) => e.id === 'rudern')).toBe(false);
  });

  it('schlägt keine zwei Übungen für denselben Hauptbereich gleichzeitig vor, wenn es Alternativen gibt', () => {
    for (const done of [[], two('beinpresse', 60, [10, 10]), [...two('beinpresse', 60, [10, 10]), ...two('brustpresse', 40, [10, 10])]]) {
      const top = run(session('2026-10-20T10:00:00Z', done)).top;
      const primaries = top.flatMap((t) => t.exercise.regions.filter((r) => r.weight === 1).map((r) => r.region));
      expect(new Set(primaries).size).toBe(primaries.length);
    }
  });

  it('deckt mit den Empfehlungen in einem Training alle grossen Bereiche ab', () => {
    // Simuliert ein Training, in dem immer die erste Empfehlung gewählt wird
    const s = session('2026-10-20T10:00:00Z');
    // Ein Durchgang mit 7 Geräten, je ein Satz
    for (let i = 0; i < 7; i++) {
      const next = run(s).top[0].exercise;
      s.sets.push(...one(next.id, 20, 10).map((x) => ({ ...x, exerciseId: next.id, at: s.startedAt })));
    }
    const exp = sessionExposure(s, library);
    const covered = rules.coreRegions.filter((r) => (exp[r] ?? 0) >= 1);
    expect(covered).toHaveLength(rules.coreRegions.length);
  });

  it('stellt Beingeräte am Tag nach dem Long Run etwas zurück', () => {
    const s = session('2026-10-20T10:00:00Z');
    const without = run(s).all.find((x) => x.exercise.id === 'beinpresse')!.score;
    const withRun = run(s, [], [{ id: 'r', date: '2026-10-19T16:00:00Z', distanceM: 14000, movingTimeS: 5800 }])
      .all.find((x) => x.exercise.id === 'beinpresse')!.score;
    expect(withRun).toBeLessThan(without);
  });

  it('gleicht beim zweiten Besuch aus, was beim ersten fehlte', () => {
    const first = session('2026-10-16T10:00:00Z', [...two('latzug', 40, [10, 10]), ...two('brustpresse', 40, [10, 10])]);
    const top = ids(run(session('2026-10-20T10:00:00Z'), [first]));
    expect(top).not.toContain('latzug');
    expect(top).not.toContain('brustpresse');
  });
});
