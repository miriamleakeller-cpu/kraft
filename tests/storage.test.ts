import 'fake-indexeddb/auto';
import { beforeEach, describe, expect, it } from 'vitest';
import { exportBackup, parseBackup, restoreBackup } from '../src/data/backup';
import { meta, resetConnection, sessions } from '../src/data/db';
import { session } from './helpers';

beforeEach(async () => {
  await resetConnection();
  await new Promise<void>((res) => {
    const r = indexedDB.deleteDatabase('kraft');
    r.onsuccess = r.onerror = r.onblocked = () => res();
  });
});

describe('Speicherung', () => {
  it('bewahrt eine angefangene Session Satz für Satz', async () => {
    const s = session('2026-10-20T10:00:00Z');
    await meta.patch({ activeSessionId: s.id });
    s.sets.push({ exerciseId: 'latzug', weight: 40, reps: 10, at: s.startedAt });
    await sessions.put(s);
    // App wird «neu gestartet»
    await resetConnection();
    const { activeSessionId } = await meta.get();
    const restored = await sessions.get(activeSessionId!);
    expect(restored?.sets).toHaveLength(1);
  });

  it('stellt eine Sicherung vollständig wieder her', async () => {
    await sessions.put(session('2026-10-17T10:00:00Z', [{ exerciseId: 'latzug', weight: 40, reps: 10 }]));
    const text = JSON.stringify(await exportBackup());
    await sessions.put(session('2026-10-20T10:00:00Z'));
    await restoreBackup(parseBackup(text));
    expect(await sessions.all()).toHaveLength(1);
  });

  it('lehnt fremde Dateien ab', () => {
    expect(() => parseBackup('{"format":"trott"}')).toThrow();
    expect(() => parseBackup('kein json')).toThrow();
  });
});
