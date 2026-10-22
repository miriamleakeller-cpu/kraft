import type { Region } from '../domain/types';

// Regelparameter. Bewusst an einer Stelle, damit sie später per Konfiguration
// angepasst werden können, ohne die Logik zu ändern.

export const rules = {
  /** Bereiche, die pro Besuch und Woche berücksichtigt werden sollen. Waden sind optional. */
  coreRegions: [
    'beineVorne',
    'beineHinten',
    'gesaess',
    'rueckenOben',
    'rueckenUnten',
    'brust',
    'schultern',
    'rumpf',
  ] as Region[],
  /** WHO: mindestens zwei Tage pro Woche */
  weeklyExposures: 2,
  windowDays: 7,
  /** Erholung: gleicher Bereich innerhalb dieser Zeit wird nachrangig */
  recoveryHours: 48,
  /** Nach dem Long Run Beingeräte in dieser Zeit etwas nach hinten */
  runLegHours: 24,
  /** Ein Durchgang an allen Geräten, ähnlich wie bei EGYM */
  plannedMinutes: 30,
  /** Zusatzsatz nur, wenn danach noch so viel Zeit bleibt */
  extraSetMinutes: 4,

  // Aufwärmen: ein paar grosse Übungen mit wenig Gewicht
  warmupExercises: ['beinpresse', 'rudern', 'brustpresse'],
  warmupSets: 3,
  warmupFactor: 0.5,
  warmupReps: 15,

  // Gewichtsanpassung
  pauseCautionDays: 28,
  pauseCautionLongDays: 56,

  topCount: 3,
};

export const LEG_REGIONS: Region[] = ['beineVorne', 'beineHinten', 'gesaess', 'waden'];
