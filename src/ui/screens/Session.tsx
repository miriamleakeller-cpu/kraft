import { useEffect, useState } from 'preact/hooks';
import { library } from '../../config/library';
import { COOLDOWN_NOTE, WARMUP_NOTE, cooldown, warmup, type RoutineItem } from '../../config/routines';
import { sessionExposure } from '../../domain/coverage';
import { useNow, useWakeLock } from '../device';
import { Icon, Round, clock } from '../parts';
import { useStore } from '../store';
import { DeviceDetail, SessionDevices } from './Devices';
import { Rest, SetEntry } from './SetFlow';

type View =
  | { s: 'warmup' }
  | { s: 'list' }
  | { s: 'detail'; id: string }
  | { s: 'set'; id: string }
  | { s: 'rest'; id: string }
  | { s: 'cooldown' };

function initial(store: ReturnType<typeof useStore>): View {
  const a = store.active!;
  if (a.phase === 'aufwaermen') return { s: 'warmup' };
  if (a.phase === 'cooldown') return { s: 'cooldown' };
  const last = a.sets[a.sets.length - 1];
  // Nach einem App-Wechsel zurück in die laufende Pause
  if (last && (a.restPausedRemaining != null || (a.restEndsAt && Date.parse(a.restEndsAt) > Date.now()))) return { s: 'rest', id: last.exerciseId };
  return { s: 'list' };
}

export function Session({ onClose, toast }: { onClose: () => void; toast: (t: string) => void }) {
  const store = useStore();
  const [view, setView] = useState<View>(() => initial(store));
  useWakeLock(true);
  useEffect(() => window.scrollTo(0, 0), [view]);
  if (!store.active) return null;

  const toList = () => setView({ s: 'list' });
  switch (view.s) {
    case 'warmup':
      return (
        <Routine
          title="Aufwärmen"
          items={warmup}
          note={WARMUP_NOTE}
          action="Zu den Geräten"
          onBack={onClose}
          onDone={async () => {
            await store.actions.setPhase('kraft');
            toList();
          }}
        />
      );
    case 'list':
      return (
        <SessionDevices
          onBack={onClose}
          onPick={(id) => setView(store.active!.sets.some((x) => x.exerciseId === id) ? { s: 'set', id } : { s: 'detail', id })}
          onCooldown={async () => {
            await store.actions.setPhase('cooldown');
            setView({ s: 'cooldown' });
          }}
        />
      );
    case 'detail':
      return <DeviceDetail id={view.id} onBack={toList} onStart={() => setView({ s: 'set', id: view.id })} />;
    case 'set':
      return <SetEntry id={view.id} onBack={toList} onSaved={() => setView({ s: 'rest', id: view.id })} />;
    case 'rest':
      return <Rest id={view.id} onNextSet={() => setView({ s: 'set', id: view.id })} onList={toList} />;
    case 'cooldown': {
      const exp = sessionExposure(store.active, library);
      const items = cooldown.filter((c) => !c.regions || c.regions.some((r) => (exp[r] ?? 0) > 0));
      return (
        <Routine
          title="Cool-down"
          items={items}
          note={COOLDOWN_NOTE}
          action="Training abschliessen"
          onBack={async () => {
            await store.actions.setPhase('kraft');
            toList();
          }}
          onDone={async () => {
            const n = store.active!.sets.length;
            await store.actions.finishSession();
            toast(n ? 'Training gespeichert.' : 'Training ohne Sätze verworfen.');
            onClose();
          }}
        />
      );
    }
  }
}

function Routine({ title, items, note, action, onBack, onDone }: { title: string; items: RoutineItem[]; note: string; action: string; onBack: () => void; onDone: () => void }) {
  const [done, setDone] = useState<Set<string>>(new Set());
  const [timer, setTimer] = useState<{ id: string; end: number } | null>(null);
  const now = useNow(500);
  const toggle = (id: string) => setDone((d) => new Set(d.has(id) ? [...d].filter((x) => x !== id) : [...d, id]));
  const minutes = Math.round(items.reduce((s, i) => s + (i.seconds ?? 40), 0) / 60);

  return (
    <div class="screen">
      <div class="nav">
        <Round onClick={onBack} label="Zurück">
          <Icon name="back" />
        </Round>
        <span />
      </div>
      <div class="h1" style={{ marginTop: 10 }}>{title}</div>
      <div class="sub">Etwa {minutes} Minuten, ganz nach Bedarf.</div>
      <div style={{ marginTop: 18 }}>
        {items.map((i) => {
          const running = timer?.id === i.id && timer.end > now;
          return (
            <div class={`tile step ${done.has(i.id) ? 'done' : ''}`}>
              <button class={`check ${done.has(i.id) ? 'on' : ''}`} onClick={() => toggle(i.id)} aria-label={`${i.name} erledigt`}>
                {done.has(i.id) && <Icon name="check" size={14} />}
              </button>
              <div class="tx">
                <b>{i.name}</b>
                <div class="h">{i.hint}</div>
              </div>
              {i.seconds ? (
                <button class="time num" onClick={() => setTimer(running ? null : { id: i.id, end: Date.now() + i.seconds! * 1000 })}>
                  {running ? <span class="mini-timer">{clock((timer!.end - now) / 1000)}</span> : clock(i.seconds)}
                </button>
              ) : (
                i.reps && <span class="time">{i.reps}</span>
              )}
            </div>
          );
        })}
      </div>
      <p class="note" style={{ marginTop: 16 }}>{note}</p>
      <div class="grow" style={{ minHeight: 24 }} />
      <button class="cta" onClick={onDone}>
        {action}
      </button>
    </div>
  );
}
