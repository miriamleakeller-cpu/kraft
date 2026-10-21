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
  plannedMinutes: 50,
  cooldownMinutes: 6,
  /** grobe Dauer eines Satzes inklusive Pause, für die Zeitplanung */
  minutesPerSet: 2.2,

  // Gewichtsanpassung
  pauseCautionDays: 28,
  pauseCautionLongDays: 56,

  topCount: 3,
};

export const LEG_REGIONS: Region[] = ['beineVorne', 'beineHinten', 'gesaess', 'waden'];
