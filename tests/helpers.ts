import type { GymSession, SetLog } from '../src/domain/types';

let n = 0;
export function session(startedAt: string, sets: Partial<SetLog>[] = [], extra: Partial<GymSession> = {}): GymSession {
  return {
    id: `s${++n}`,
    startedAt,
    phase: 'kraft',
    plannedMinutes: 50,
    sets: sets.map((s) => ({ exerciseId: 'x', at: startedAt, ...s })),
    ...extra,
  };
}

/** zwei Sätze einer Übung */
export const two = (exerciseId: string, weight: number, reps: [number, number], feel?: SetLog['feel']): Partial<SetLog>[] => [
  { exerciseId, weight, reps: reps[0] },
  { exerciseId, weight, reps: reps[1], feel },
];
