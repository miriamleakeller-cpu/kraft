// Grundbegriffe der Trainingslogik. Alles hier ist reine Daten, ohne Speicher oder Oberfläche.

/** Die acht grossen Bereiche, an denen sich die Abdeckung orientiert (WHO: «alle grossen Muskelgruppen»). */
export type Region =
  | 'beineVorne'
  | 'beineHinten'
  | 'gesaess'
  | 'rueckenOben'
  | 'rueckenUnten'
  | 'brust'
  | 'schultern'
  | 'rumpf'
  | 'waden';

export type Pattern =
  | 'knie'
  | 'huefte'
  | 'drueckenHorizontal'
  | 'drueckenVertikal'
  | 'ziehenHorizontal'
  | 'ziehenVertikal'
  | 'rumpf'
  | 'wade';

/** Wie eine Übung gemessen wird: Gewicht und Wiederholungen, nur Wiederholungen oder Haltezeit. */
export type Measure = 'gewicht' | 'wiederholungen' | 'zeit';

export type Feel = 'leicht' | 'passend' | 'streng';

export interface RegionLoad {
  region: Region;
  /** 1 = Hauptbelastung, 0.5 = Mitbeteiligung */
  weight: 1 | 0.5;
}

export interface SettingField {
  key: string;
  label: string;
}

export interface Exercise {
  id: string;
  name: string;
  kind: 'maschine' | 'matte';
  /** Id der Abbildung im Sprite */
  image: string;
  regions: RegionLoad[];
  pattern: Pattern;
  measure: Measure;
  /** Wiederholungsbereich oder, bei Haltezeit, Sekunden */
  range: [number, number];
  perSide?: boolean;
  /** Arbeitssätze pro Training */
  sets: number;
  /** darf einen Zusatzsatz vorgeschlagen bekommen, wenn Zeit bleibt */
  extraSet?: boolean;
  /** Standard-Gewichtsstufen, falls für das Gerät nichts eingetragen ist */
  weightSteps?: number[];
  settings: SettingField[];
  optional?: boolean;
  /** feste Reihenfolge bei Gleichstand */
  order: number;
  summary: string;
  instructions: string[];
  safety: string[];
}

/** Persönliches pro Gerät: bleibt gespeichert, unabhängig vom Training. */
export interface ExerciseState {
  id: string;
  settings: Record<string, string>;
  weightSteps?: number[];
  active: boolean;
}

export interface SetLog {
  exerciseId: string;
  weight?: number;
  reps?: number;
  seconds?: number;
  feel?: Feel;
  /** Aufwärmsatz mit wenig Gewicht: zählt weder für Abdeckung noch für Gewichtsvorschläge */
  warmup?: boolean;
  at: string;
}

export type Phase = 'aufwaermen' | 'kraft' | 'fertig';

export interface GymSession {
  id: string;
  startedAt: string;
  endedAt?: string;
  phase: Phase;
  plannedMinutes: number;
  sets: SetLog[];
}

/** Nur die Arbeitssätze, ohne Aufwärmen. */
export const workSets = (s: GymSession) => s.sets.filter((x) => !x.warmup);

export interface Run {
  id: string;
  date: string;
  name?: string;
  distanceM: number;
  movingTimeS: number;
  elevationM?: number;
  stravaId?: number;
}
