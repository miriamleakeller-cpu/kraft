import { useEffect, useRef, useState } from 'preact/hooks';
import { library } from '../../config/library';
import { performances, shiftStep, suggest } from '../../domain/progression';
import { recommend } from '../../domain/recommend';
import { chime, unlockAudio, useNow } from '../device';
import { Feel3, Icon, Round, clock, kg } from '../parts';
import { stepsFor, useStore } from '../store';

function Stepper({ value, unit, onMinus, onPlus }: { value: string; unit: string; onMinus: () => void; onPlus: () => void }) {
  return (
    <div class="tile stepper">
      <button class="pm press" onClick={onMinus} aria-label={`${unit} weniger`}>
        <svg viewBox="0 0 24 24">
          <path d="M6 12h12" />
        </svg>
      </button>
      <div class="v">
        <b class="num">{value}</b>
        <small>{unit}</small>
      </div>
      <button class="pm press" onClick={onPlus} aria-label={`${unit} mehr`}>
        <svg viewBox="0 0 24 24">
          <path d="M6 12h12M12 6v12" />
        </svg>
      </button>
    </div>
  );
}

export function SetEntry({ id, onBack, onSaved }: { id: string; onBack: () => void; onSaved: () => void }) {
  const store = useStore();
  const ex = library.find((e) => e.id === id)!;
  const steps = stepsFor(store, ex);
  const today = store.active!.sets.filter((s) => s.exerciseId === id);
  const last = today[today.length - 1];
  const sug = suggest(ex, performances(id, store.history), steps, new Date());

  const [weight, setWeight] = useState(last?.weight ?? sug.weight ?? steps[Math.floor(steps.length / 6)] ?? 0);
  const [reps, setReps] = useState(last?.reps ?? sug.reps ?? ex.range[0]);
  const [seconds, setSeconds] = useState(last?.seconds ?? sug.seconds ?? ex.range[0]);
  const n = today.length + 1;

  const save = async () => {
    unlockAudio();
    await store.actions.addSet(
      {
        exerciseId: id,
        weight: ex.measure === 'gewicht' ? weight : undefined,
        reps: ex.measure === 'zeit' ? undefined : reps,
        seconds: ex.measure === 'zeit' ? seconds : undefined,
      },
      ex.restSec,
    );
    onSaved();
  };

  return (
    <div class="screen">
      <div class="nav">
        <Round onClick={onBack} label="Zurück">
          <Icon name="back" />
        </Round>
        <span class="title">{ex.name}</span>
        <span style={{ width: 40 }} />
      </div>
      <div class="h1" style={{ marginTop: 16, marginBottom: 14 }}>
        {n <= ex.sets ? (
          <>
            Satz {n} <span class="muted">von {ex.sets}</span>
          </>
        ) : (
          `Satz ${n}`
        )}
      </div>

      {ex.measure === 'gewicht' && (
        <Stepper value={kg(weight)} unit="Kilogramm" onMinus={() => setWeight(shiftStep(steps, weight, -1))} onPlus={() => setWeight(shiftStep(steps, weight, 1))} />
      )}
      {ex.measure === 'zeit' ? (
        <Stepper value={String(seconds)} unit="Sekunden" onMinus={() => setSeconds(Math.max(5, seconds - 5))} onPlus={() => setSeconds(seconds + 5)} />
      ) : (
        <Stepper
          value={String(reps)}
          unit={ex.perSide ? 'Wiederholungen pro Seite' : 'Wiederholungen'}
          onMinus={() => setReps(Math.max(1, reps - 1))}
          onPlus={() => setReps(reps + 1)}
        />
      )}

      {today.length > 0 && (
        <>
          <div class="label">Heute</div>
          {today.map((s, i) => (
            <div class="setlog num">
              <span>Satz {i + 1}</span>
              <span>
                {s.weight != null ? `${kg(s.weight)} kg · ` : ''}
                {s.seconds != null ? `${s.seconds} Sek.` : `${s.reps} Wdh.`}
                {s.feel ? ` · ${{ leicht: 'Leicht', passend: 'Passend', streng: 'Sehr streng' }[s.feel]}` : ''}
              </span>
            </div>
          ))}
        </>
      )}
      <div class="grow" style={{ minHeight: 24 }} />
      <button class="cta" onClick={save}>
        Satz speichern
      </button>
    </div>
  );
}

export function Rest({ id, onNextSet, onList }: { id: string; onNextSet: () => void; onList: () => void }) {
  const store = useStore();
  const s = store.active!;
  const ex = library.find((e) => e.id === id)!;
  const now = useNow();
  const paused = s.restPausedRemaining != null;
  const remaining = paused ? s.restPausedRemaining! : s.restEndsAt ? (Date.parse(s.restEndsAt) - now) / 1000 : 0;
  const [total] = useState(() => Math.max(ex.restSec, remaining));
  const setsDone = s.sets.filter((x) => x.exerciseId === id).length;
  const lastSet = s.sets[s.sets.length - 1];

  // Signalton genau einmal pro Pause, und nur wenn die App sichtbar ist
  const rang = useRef<string | undefined>(undefined);
  useEffect(() => {
    if (!paused && s.restEndsAt && remaining <= 0 && rang.current !== s.restEndsAt) {
      rang.current = s.restEndsAt;
      if (store.meta.soundOn !== false && document.visibilityState === 'visible' && now - Date.parse(s.restEndsAt) < 5000) chime();
    }
  }, [remaining, paused, s.restEndsAt]);

  const shift = (d: number) =>
    paused
      ? store.actions.setRest(undefined, Math.max(0, remaining + d))
      : store.actions.setRest(new Date(Math.max(now, s.restEndsAt ? Date.parse(s.restEndsAt) : now) + d * 1000).toISOString());
  const toggle = () =>
    paused ? store.actions.setRest(new Date(now + remaining * 1000).toISOString()) : store.actions.setRest(undefined, Math.max(0, remaining));
  const leave = async (go: () => void) => {
    await store.actions.setRest(undefined);
    go();
  };

  const r = recommend({ library: store.lib, session: s, history: store.history, runs: store.runs, now: new Date(now) });
  const third = r.all.find((x) => x.exercise.id === id)?.thirdSet;
  const C = 2 * Math.PI * 120;
  const frac = Math.min(1, Math.max(0, remaining / total));

  return (
    <div class="screen rest">
      <i class="glow" style={{ width: 300, height: 280, left: -110, top: 110, background: 'var(--salbei)', opacity: 0.45 }} />
      <i class="glow" style={{ width: 280, height: 260, right: -120, top: 320, background: 'var(--pfirsich)', opacity: 0.55 }} />
      <div class="nav">
        <span class="meta">
          {ex.name} · Satz {setsDone} gespeichert
        </span>
        <button
          class="link"
          aria-label={store.meta.soundOn !== false ? 'Ton ausschalten' : 'Ton einschalten'}
          onClick={() => {
            unlockAudio();
            void store.actions.patchMeta({ soundOn: store.meta.soundOn === false });
          }}
        >
          <Icon name={store.meta.soundOn !== false ? 'sound' : 'mute'} size={20} />
        </button>
      </div>

      <div class="timer" role="timer" aria-live="off">
        <svg viewBox="0 0 250 250">
          <circle cx="125" cy="125" r="120" fill="none" stroke="rgba(31,36,33,.1)" stroke-width="3" />
          <circle class="p" cx="125" cy="125" r="120" fill="none" stroke="var(--wald)" stroke-width="3" stroke-linecap="round" stroke-dasharray={C} stroke-dashoffset={C * (1 - frac)} />
        </svg>
        <div style={{ textAlign: 'center' }}>
          <b class="num">{clock(remaining)}</b>
          <div class="note" style={{ marginTop: -4 }}>{remaining <= 0 ? 'Bereit' : paused ? 'Angehalten' : 'Pause'}</div>
        </div>
      </div>
      <div class="ctrl">
        <button class="num" onClick={() => shift(-15)} aria-label="15 Sekunden weniger">
          −15
        </button>
        <button class="big" onClick={toggle} aria-label={paused ? 'Weiter' : 'Anhalten'}>
          <Icon name={paused ? 'play' : 'pause'} size={20} />
        </button>
        <button class="num" onClick={() => shift(15)} aria-label="15 Sekunden mehr">
          +15
        </button>
      </div>

      <div class="grow" />
      <div class="note" style={{ textAlign: 'center', fontSize: 14 }}>Wie fühlte sich der Satz an?</div>
      <Feel3 value={lastSet?.feel} onChange={(f) => store.actions.setLastFeel(f)} />

      {setsDone < ex.sets ? (
        <>
          <button class="cta dark" style={{ marginTop: 14 }} onClick={() => leave(onNextSet)}>
            Weiter zu Satz {setsDone + 1}
          </button>
          <button class="link" style={{ marginTop: 8, color: 'var(--grau)' }} onClick={() => leave(onList)}>
            Anderes Gerät wählen
          </button>
        </>
      ) : (
        <>
          <button class="cta dark" style={{ marginTop: 14 }} onClick={() => leave(onList)}>
            Nächstes Gerät
          </button>
          {third && setsDone === ex.sets && (
            <button class="link" style={{ marginTop: 8, color: 'var(--grau)' }} onClick={() => leave(onNextSet)}>
              Noch ein dritter Satz
            </button>
          )}
        </>
      )}
    </div>
  );
}
