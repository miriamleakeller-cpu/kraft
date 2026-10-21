import { openDB, type DBSchema, type IDBPDatabase } from 'idb';
import type { ExerciseState, GymSession, Run } from '../domain/types';

// Lokale Speicherung im Browser (IndexedDB). Eigener, eindeutiger Name, damit sich
// die Daten nie mit anderen Apps auf derselben Adresse (z. B. Trott) vermischen.

export const DB_NAME = 'kraft';
export const DB_VERSION = 1;

export interface Meta {
  activeSessionId?: string;
  lastBackupAt?: string;
  soundOn?: boolean;
}

interface KraftDB extends DBSchema {
  sessions: { key: string; value: GymSession; indexes: { startedAt: string } };
  runs: { key: string; value: Run; indexes: { date: string } };
  exerciseState: { key: string; value: ExerciseState };
  meta: { key: string; value: unknown };
}

let dbp: Promise<IDBPDatabase<KraftDB>> | null = null;

export function db() {
  dbp ??= openDB<KraftDB>(DB_NAME, DB_VERSION, {
    upgrade(d, oldVersion) {
      // Jede Strukturänderung bekommt hier einen eigenen Schritt. Alte Daten bleiben erhalten.
      if (oldVersion < 1) {
        d.createObjectStore('sessions', { keyPath: 'id' }).createIndex('startedAt', 'startedAt');
        d.createObjectStore('runs', { keyPath: 'id' }).createIndex('date', 'date');
        d.createObjectStore('exerciseState', { keyPath: 'id' });
        d.createObjectStore('meta');
      }
    },
    // Eine neuere Version der App will die Datenbank umbauen: Verbindung freigeben.
    blocking() {
      void resetConnection();
    },
  });
  return dbp;
}

export async function resetConnection() {
  const p = dbp;
  dbp = null;
  if (p) (await p).close();
}

export async function persistStorage() {
  // Bittet den Browser, die Daten nicht automatisch zu löschen. Kein Garant, darum die Sicherung.
  try {
    return (await navigator.storage?.persist?.()) ?? false;
  } catch {
    return false;
  }
}

export const sessions = {
  async put(s: GymSession) {
    await (await db()).put('sessions', s);
  },
  async get(id: string) {
    return (await db()).get('sessions', id);
  },
  async all() {
    return (await db()).getAllFromIndex('sessions', 'startedAt');
  },
  async remove(id: string) {
    await (await db()).delete('sessions', id);
  },
};

export const runs = {
  async put(r: Run) {
    await (await db()).put('runs', r);
  },
  async all() {
    return (await db()).getAllFromIndex('runs', 'date');
  },
  async remove(id: string) {
    await (await db()).delete('runs', id);
  },
};

export const exerciseState = {
  async get(id: string) {
    return (await db()).get('exerciseState', id);
  },
  async all() {
    return (await db()).getAll('exerciseState');
  },
  async put(s: ExerciseState) {
    await (await db()).put('exerciseState', s);
  },
};

export const meta = {
  async get(): Promise<Meta> {
    return ((await (await db()).get('meta', 'meta')) as Meta | undefined) ?? {};
  },
  async patch(p: Partial<Meta>) {
    const d = await db();
    const tx = d.transaction('meta', 'readwrite');
    const cur = ((await tx.store.get('meta')) as Meta | undefined) ?? {};
    await tx.store.put({ ...cur, ...p }, 'meta');
    await tx.done;
  },
};
