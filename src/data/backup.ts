import { LIBRARY_VERSION } from '../config/library';
import type { ExerciseState, GymSession, Run } from '../domain/types';
import { DB_VERSION, db, type Meta } from './db';

// Sicherung als lesbare JSON-Datei. Dieselbe Datei kann wieder eingelesen
// oder Claude zur Auswertung gegeben werden.

export const BACKUP_FORMAT = 'kraft-backup';

export interface Backup {
  format: typeof BACKUP_FORMAT;
  version: number;
  exportedAt: string;
  libraryVersion: number;
  sessions: GymSession[];
  runs: Run[];
  exerciseState: ExerciseState[];
  meta: Meta;
}

export async function exportBackup(now = new Date()): Promise<Backup> {
  const d = await db();
  const meta = ((await d.get('meta', 'meta')) as Meta | undefined) ?? {};
  return {
    format: BACKUP_FORMAT,
    version: DB_VERSION,
    exportedAt: now.toISOString(),
    libraryVersion: LIBRARY_VERSION,
    sessions: await d.getAllFromIndex('sessions', 'startedAt'),
    runs: await d.getAllFromIndex('runs', 'date'),
    exerciseState: await d.getAll('exerciseState'),
    meta,
  };
}

export class BackupError extends Error {}

export function parseBackup(text: string): Backup {
  let data: unknown;
  try {
    data = JSON.parse(text);
  } catch {
    throw new BackupError('Die Datei ist kein gültiges JSON.');
  }
  const b = data as Partial<Backup>;
  if (b?.format !== BACKUP_FORMAT) throw new BackupError('Das ist keine Kraft-Sicherung.');
  if (typeof b.version !== 'number' || b.version > DB_VERSION) {
    throw new BackupError('Die Sicherung stammt aus einer neueren Version der App.');
  }
  if (!Array.isArray(b.sessions) || !Array.isArray(b.runs) || !Array.isArray(b.exerciseState)) {
    throw new BackupError('Die Sicherung ist unvollständig.');
  }
  return b as Backup;
}

/** Ersetzt alle Daten durch die Sicherung, in einem Schritt: entweder alles oder nichts. */
export async function restoreBackup(b: Backup) {
  const d = await db();
  const tx = d.transaction(['sessions', 'runs', 'exerciseState', 'meta'], 'readwrite');
  await Promise.all([
    tx.objectStore('sessions').clear(),
    tx.objectStore('runs').clear(),
    tx.objectStore('exerciseState').clear(),
  ]);
  for (const s of b.sessions) await tx.objectStore('sessions').put(s);
  for (const r of b.runs) await tx.objectStore('runs').put(r);
  for (const e of b.exerciseState) await tx.objectStore('exerciseState').put(e);
  await tx.objectStore('meta').put(b.meta ?? {}, 'meta');
  await tx.done;
}

export function backupFileName(now = new Date()) {
  return `kraft-sicherung-${now.toISOString().slice(0, 10)}.json`;
}
