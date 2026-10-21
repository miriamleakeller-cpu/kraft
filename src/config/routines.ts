import type { Region } from '../domain/types';

// Aufwärmen und Cool-down. Zeiten sind Vorschläge, keine Vorgaben.

export interface RoutineItem {
  id: string;
  name: string;
  hint: string;
  /** Sekunden, falls ein Timer sinnvoll ist */
  seconds?: number;
  /** Wiederholungen, falls gezählt wird */
  reps?: string;
  /** für das Cool-down: passt zu diesen Bereichen */
  regions?: Region[];
}

export const warmup: RoutineItem[] = [
  {
    id: 'locker',
    name: 'Locker in Bewegung',
    hint: 'Crosstrainer, Rudergerät oder zügiges Gehen. So, dass du noch gut sprechen kannst.',
    seconds: 240,
  },
  { id: 'arme', name: 'Armkreisen', hint: 'Grosse, ruhige Kreise, vorwärts und rückwärts.', seconds: 30 },
  { id: 'beinpendel', name: 'Beinpendel', hint: 'An der Sprossenwand festhalten, Bein locker vor und zurück schwingen.', reps: '10 pro Seite' },
  { id: 'katzekuh', name: 'Katze und Kuh', hint: 'Im Vierfüssler den Rücken langsam runden und strecken.', reps: '8' },
  { id: 'aufwaermsatz', name: 'Leichter Satz am ersten Gerät', hint: 'Etwa halbes Gewicht, 10 ruhige Wiederholungen. Danach geht es los.' },
];

export const WARMUP_NOTE =
  'Aufwärmen bereitet Kreislauf und Gelenke auf die Belastung vor. Dass es Verletzungen verhindert, ist für Krafttraining nicht klar belegt.';

export const cooldown: RoutineItem[] = [
  { id: 'auslaufen', name: 'Locker ausklingen', hint: 'Zwei bis drei Minuten ruhig gehen oder radeln.', seconds: 150 },
  { id: 'quadrizeps', name: 'Oberschenkel vorne', hint: 'Stehend die Ferse zum Gesäss ziehen, Knie zeigt nach unten.', seconds: 30, regions: ['beineVorne'] },
  { id: 'hamstrings', name: 'Oberschenkel hinten', hint: 'Ferse auf eine Sprosse legen, mit geradem Rücken leicht nach vorne neigen.', seconds: 30, regions: ['beineHinten'] },
  { id: 'gesaess', name: 'Gesäss', hint: 'Rückenlage, Knöchel auf das andere Knie legen und das Bein zur Brust ziehen.', seconds: 30, regions: ['gesaess'] },
  { id: 'brust', name: 'Brust und Schulter', hint: 'Unterarm seitlich an die Sprossenwand legen und den Oberkörper sanft wegdrehen.', seconds: 30, regions: ['brust', 'schultern'] },
  { id: 'latissimus', name: 'Seitlicher Rücken', hint: 'An einer hohen Sprosse festhalten und das Becken zur Seite schieben.', seconds: 30, regions: ['rueckenOben'] },
  { id: 'kind', name: 'Kindhaltung', hint: 'Auf der Matte auf die Fersen setzen, Arme lang nach vorne.', seconds: 45, regions: ['rueckenUnten', 'rumpf'] },
  { id: 'wade', name: 'Wade', hint: 'Fussballen an die unterste Sprosse, Ferse am Boden, Körper nach vorne.', seconds: 30, regions: ['waden'] },
];

export const COOLDOWN_NOTE =
  'Regelmässiges Dehnen kann die Beweglichkeit verbessern. Muskelkater verhindert es nach heutigem Wissen nicht.';
