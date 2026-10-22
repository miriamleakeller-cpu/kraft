import { useEffect, useState } from 'preact/hooks';
import { rules } from '../../config/rules';
import { useWakeLock } from '../device';
import { useStore } from '../store';
import { DeviceDetail, SessionDevices } from './Devices';
import { SetEntry } from './SetFlow';

type View = { s: 'list' } | { s: 'detail'; id: string } | { s: 'set'; id: string };

export function Session({ onClose, toast }: { onClose: () => void; toast: (t: string) => void }) {
  const store = useStore();
  const [view, setView] = useState<View>({ s: 'list' });
  useWakeLock(true);
  useEffect(() => window.scrollTo(0, 0), [view]);
  if (!store.active) return null;

  const warmup = store.active.phase === 'aufwaermen';
  const toList = () => setView({ s: 'list' });
  const finish = async () => {
    const hadWork = store.active!.sets.some((x) => !x.warmup);
    await store.actions.finishSession();
    toast(hadWork ? 'Training gespeichert.' : 'Training ohne Arbeitssätze verworfen.');
    onClose();
  };

  switch (view.s) {
    case 'list':
      return (
        <SessionDevices
          warmup={warmup}
          onBack={onClose}
          onPick={(id) =>
            // Gerät schon bekannt: direkt zum Satz. Sonst zuerst Einstellungen und Vorschlag zeigen.
            setView(store.active!.sets.some((x) => x.exerciseId === id) ? { s: 'set', id } : { s: 'detail', id })
          }
          onEndWarmup={() => store.actions.setPhase('kraft')}
          onFinish={finish}
        />
      );
    case 'detail':
      return <DeviceDetail id={view.id} onBack={toList} onStart={() => setView({ s: 'set', id: view.id })} />;
    case 'set':
      return (
        <SetEntry
          id={view.id}
          warmup={warmup}
          onBack={toList}
          onSaved={async () => {
            // Nach einigen Aufwärmsätzen beginnt der Durchgang von selbst.
            if (warmup && store.active!.sets.filter((x) => x.warmup).length + 1 >= rules.warmupSets) {
              await store.actions.setPhase('kraft');
              toast('Aufgewärmt. Jetzt ein Satz pro Gerät.');
            }
            toList();
          }}
        />
      );
  }
}
