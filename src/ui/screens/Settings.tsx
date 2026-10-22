import { useRef, useState } from 'preact/hooks';
import { BackupError, backupFileName, exportBackup, parseBackup, restoreBackup } from '../../data/backup';
import { useStore } from '../store';

export function Settings({ onClose, toast }: { onClose: () => void; toast: (t: string) => void }) {
  const store = useStore();
  const file = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);

  const doExport = async () => {
    setBusy(true);
    try {
      const json = JSON.stringify(await exportBackup(), null, 2);
      const name = backupFileName();
      const f = new File([json], name, { type: 'application/json' });
      if (navigator.canShare?.({ files: [f] })) {
        await navigator.share({ files: [f] });
      } else {
        const a = document.createElement('a');
        a.href = URL.createObjectURL(f);
        a.download = name;
        a.click();
        setTimeout(() => URL.revokeObjectURL(a.href), 1000);
      }
      await store.actions.patchMeta({ lastBackupAt: new Date().toISOString() });
      toast('Sicherung erstellt.');
    } catch (e) {
      if ((e as Error).name !== 'AbortError') toast('Die Sicherung konnte nicht erstellt werden.');
    } finally {
      setBusy(false);
    }
  };

  const doImport = async (f: File) => {
    try {
      const b = parseBackup(await f.text());
      const n = b.sessions.length;
      if (!confirm(`Sicherung vom ${new Date(b.exportedAt).toLocaleDateString('de-CH')} mit ${n} Trainings einlesen? Die aktuellen Daten werden ersetzt.`)) return;
      await restoreBackup(b);
      await store.actions.reload();
      toast('Sicherung eingelesen.');
      onClose();
    } catch (e) {
      toast(e instanceof BackupError ? e.message : 'Die Datei konnte nicht gelesen werden.');
    }
  };

  const last = store.meta.lastBackupAt;
  return (
    <>
      <div class="sheet-bg" onClick={onClose} />
      <div class="sheet" role="dialog" aria-label="Einstellungen">
        <div class="grip" />
        <div class="h1" style={{ fontSize: 26 }}>Einstellungen</div>

        <div class="label">Daten</div>
        <p class="note" style={{ marginBottom: 12 }}>
          Alle Daten liegen nur auf diesem Gerät. Eine Sicherung schützt sie, falls der Browser sie löscht. Letzte Sicherung:{' '}
          {last ? new Date(last).toLocaleDateString('de-CH') : 'noch keine'}.
        </p>
        <div class="stack">
          <button class="cta" disabled={busy} onClick={doExport}>
            Sicherung erstellen
          </button>
          <button class="cta ghost" onClick={() => file.current?.click()}>
            Sicherung einlesen
          </button>
        </div>
        <input
          ref={file}
          type="file"
          accept="application/json,.json"
          hidden
          onChange={(e) => {
            const f = (e.target as HTMLInputElement).files?.[0];
            if (f) void doImport(f);
            (e.target as HTMLInputElement).value = '';
          }}
        />
      </div>
    </>
  );
}
