import { LEG_REGIONS, rules } from '../config/rules';
import { exposureSince, sessionExposure } from './coverage';
import type { Exercise, GymSession, Region, Run } from './types';

// Empfehlung während des Trainings. Deterministisch und nachvollziehbar:
// jede Übung bekommt Punkte aus wenigen, festen Gründen. Gleiche Eingabe, gleiches Ergebnis.

export interface RecommendInput {
  library: Exercise[];
  session: GymSession;
  /** frühere Trainings, ohne das laufende */
  history: GymSession[];
  runs: Run[];
  now: Date;
}

export interface Ranked {
  exercise: Exercise;
  score: number;
  setsDone: number;
  /** alle vorgesehenen Sätze erledigt */
  done: boolean;
  /** ein dritter Satz wäre sinnvoll und die Zeit reicht */
  thirdSet: boolean;
}

export interface Recommendation {
  top: Ranked[];
  all: Ranked[];
  minutesLeft: number;
}

const HOUR = 3_600_000;

export function recommend({ library, session, history, runs, now }: RecommendInput): Recommendation {
  const weekStart = new Date(now.getTime() - rules.windowDays * 24 * HOUR);
  const week = exposureSince(history, library, weekStart);
  const today = sessionExposure(session, library);
  const recent = exposureSince(history, library, new Date(now.getTime() - rules.recoveryHours * HOUR));
  const lastRun = runs.map((r) => Date.parse(r.date)).filter((t) => t <= now.getTime()).sort((a, b) => b - a)[0];
  const afterRun = lastRun != null && now.getTime() - lastRun < rules.runLegHours * HOUR;
  const lastGym = [...history].sort((a, b) => b.startedAt.localeCompare(a.startedAt))[0];
  const lastSet = session.sets[session.sets.length - 1];
  const lastPattern = lastSet ? library.find((e) => e.id === lastSet.exerciseId)?.pattern : undefined;

  const elapsed = (now.getTime() - Date.parse(session.startedAt)) / 60_000;
  const minutesLeft = Math.max(0, session.plannedMinutes - rules.cooldownMinutes - elapsed);
  const coreCovered = rules.coreRegions.every((r) => (today[r] ?? 0) >= 1);

  const all = library.map((exercise): Ranked => {
    const setsDone = session.sets.filter((s) => s.exerciseId === exercise.id).length;
    const done = setsDone >= exercise.sets;
    let score = 0;

    for (const { region, weight } of exercise.regions) {
      const core = rules.coreRegions.includes(region);
      // Bereich kommt in diesem Training noch nicht vor
      if ((today[region] ?? 0) < 1) score += (core ? 3 : 1) * weight;
      // WHO: zweimal pro Woche; was diese Woche noch fehlt, zählt zusätzlich
      const missing = rules.weeklyExposures - (week[region] ?? 0) - Math.min(1, today[region] ?? 0);
      if (core && missing > 0) score += missing * weight;
      // kürzlich belastet: Erholung abwarten
      if ((recent[region] ?? 0) > 0) score -= 2 * weight;
      if (afterRun && LEG_REGIONS.includes(region as Region)) score -= 1 * weight;
    }
    // Abwechslung: nicht zweimal hintereinander dasselbe Bewegungsmuster
    if (lastPattern && exercise.pattern === lastPattern && !setsDone) score -= 1;
    if (exercise.optional) {
      score -= 0.5;
      // optionale Übungen wechseln sich zwischen den Besuchen ab
      if (lastGym?.sets.some((s) => s.exerciseId === exercise.id)) score -= 1;
    }

    const thirdSet = !!exercise.thirdSet && setsDone === exercise.sets && coreCovered && minutesLeft >= 8;
    return { exercise, score, setsDone, done, thirdSet };
  });

  const order = (a: Ranked, b: Ranked) => b.score - a.score || a.exercise.order - b.exercise.order;

  // Die drei Vorschläge sollen sich ergänzen: Nach jeder Wahl zählen Bereiche,
  // die schon ein Vorschlag abdeckt, für die übrigen weniger.
  const top: Ranked[] = [];
  const planned = new Set<Region>();
  let open = all.filter((r) => !r.done);
  while (top.length < rules.topCount && open.length) {
    const adjusted = open
      .map((r) => ({
        r,
        s: r.score - r.exercise.regions.reduce((p, x) => p + (planned.has(x.region) && x.weight === 1 ? 3 * x.weight : 0), 0),
      }))
      .sort((a, b) => b.s - a.s || a.r.exercise.order - b.r.exercise.order);
    const pick = adjusted[0].r;
    top.push(pick);
    pick.exercise.regions.filter((x) => x.weight === 1).forEach((x) => planned.add(x.region));
    open = open.filter((r) => r !== pick);
  }
  // Angefangene zuerst, damit man leicht zurückfindet; Erledigte zuletzt.
  const rank = (r: Ranked) => (r.done ? 2 : r.setsDone > 0 ? 0 : 1);
  const rest = [...all].sort((a, b) => rank(a) - rank(b) || order(a, b));
  return { top, all: rest, minutesLeft };
}
