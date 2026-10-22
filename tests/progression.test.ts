import { describe, expect, it } from 'vitest';
import { byId } from '../src/config/library';
import { performances, shiftStep, suggest, warmupSuggestion } from '../src/domain/progression';
import { session, two } from './helpers';

const latzug = byId('latzug')!;
const steps = latzug.weightSteps!;
const now = new Date('2026-10-20T10:00:00Z');
const hist = (...s: ReturnType<typeof session>[]) => performances('latzug', s);

describe('Gewichtsvorschlag', () => {
  it('fragt beim ersten Mal nach einem Einstiegsgewicht', () => {
    expect(suggest(latzug, [], steps, now)).toEqual({ reps: 12, note: 'kalibrierung' });
  });

  it('übernimmt nach einer einzigen guten Einheit noch nicht mehr Gewicht', () => {
    const h = hist(session('2026-10-17T10:00:00Z', two('latzug', 40, [12, 12], 'leicht')));
    expect(suggest(latzug, h, steps, now).weight).toBe(40);
  });

  it('erhöht nach zwei Einheiten mit oberem Bereich um genau eine Stufe', () => {
    const h = hist(
      session('2026-10-13T10:00:00Z', two('latzug', 40, [12, 12], 'passend')),
      session('2026-10-17T10:00:00Z', two('latzug', 40, [12, 12], 'leicht')),
    );
    expect(suggest(latzug, h, steps, now)).toMatchObject({ weight: 42.5, note: 'erhoeht' });
  });

  it('erhöht nicht, wenn eine der beiden Einheiten sehr streng war', () => {
    const h = hist(
      session('2026-10-13T10:00:00Z', two('latzug', 40, [12, 12], 'streng')),
      session('2026-10-17T10:00:00Z', two('latzug', 40, [12, 12], 'passend')),
    );
    expect(suggest(latzug, h, steps, now).weight).toBe(40);
  });

  it('hält das Gewicht nach einmal «Sehr streng»', () => {
    const h = hist(
      session('2026-10-13T10:00:00Z', two('latzug', 40, [10, 10], 'passend')),
      session('2026-10-17T10:00:00Z', two('latzug', 40, [9, 8], 'streng')),
    );
    expect(suggest(latzug, h, steps, now).weight).toBe(40);
  });

  it('senkt erst nach zweimal «Sehr streng» und nur um eine Stufe', () => {
    const h = hist(
      session('2026-10-13T10:00:00Z', two('latzug', 40, [9, 8], 'streng')),
      session('2026-10-17T10:00:00Z', two('latzug', 40, [9, 8], 'streng')),
    );
    expect(suggest(latzug, h, steps, now)).toMatchObject({ weight: 37.5, note: 'gesenkt' });
  });

  it('schlägt nach vier Wochen Pause einen vorsichtigeren Einstieg vor', () => {
    const h = hist(session('2026-09-15T10:00:00Z', two('latzug', 40, [10, 10], 'passend')));
    expect(suggest(latzug, h, steps, now)).toMatchObject({ weight: 37.5, note: 'wiedereinstieg' });
  });

  it('geht nach einem guten Wiedereinstieg sofort wieder eine Stufe hoch', () => {
    const h = hist(
      session('2026-09-01T10:00:00Z', two('latzug', 40, [10, 10], 'passend')),
      session('2026-10-17T10:00:00Z', two('latzug', 37.5, [12, 12], 'passend')),
    );
    expect(suggest(latzug, h, steps, now)).toMatchObject({ weight: 40, note: 'erhoeht' });
  });

  it('rundet auf die tatsächlichen Stufen des Geräts', () => {
    expect(shiftStep([5, 10, 15, 20], 12, 0)).toBe(10);
    expect(shiftStep([5, 10, 15, 20], 12, 1)).toBe(15);
    expect(shiftStep([5, 10, 15, 20], 20, 1)).toBe(20);
  });

  it('verlängert die Haltezeit erst nach zwei Einheiten am oberen Ende', () => {
    const plank = byId('unterarmstuetz')!;
    const sets = (s: number[]) => s.map((seconds) => ({ exerciseId: 'unterarmstuetz', seconds, feel: 'passend' as const }));
    const h = performances('unterarmstuetz', [
      session('2026-10-13T10:00:00Z', sets([30, 30])),
      session('2026-10-17T10:00:00Z', sets([30, 30])),
    ]);
    expect(suggest(plank, h, [], now).seconds).toBe(30);
  });

  it('erhöht auch mit nur einem Satz pro Training nach zwei passenden Einheiten', () => {
    const one = (date: string, feel: 'leicht' | 'passend') => session(date, [{ exerciseId: 'latzug', weight: 40, reps: 12, feel }]);
    const h = hist(one('2026-10-13T10:00:00Z', 'passend'), one('2026-10-17T10:00:00Z', 'leicht'));
    expect(suggest(latzug, h, steps, now).weight).toBe(42.5);
  });

  it('lässt Aufwärmsätze bei den Gewichtsvorschlägen aussen vor', () => {
    const h = hist(session('2026-10-17T10:00:00Z', [{ exerciseId: 'latzug', weight: 20, reps: 15, warmup: true }, { exerciseId: 'latzug', weight: 40, reps: 10 }]));
    expect(h[0]).toMatchObject({ weight: 40, reps: [10] });
  });

  it('schlägt zum Aufwärmen etwa das halbe Arbeitsgewicht vor', () => {
    expect(warmupSuggestion(latzug, { weight: 40 }, steps)).toEqual({ weight: 20, reps: 15 });
    expect(warmupSuggestion(latzug, { weight: 42.5 }, steps).weight).toBe(20);
  });
});
