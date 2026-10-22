import { useState } from 'preact/hooks';
import { library } from '../../config/library';
import { performances, shiftStep, suggest, warmupSuggestion } from '../../domain/progression';
import { workSets, type Feel } from '../../domain/types';
import { Feel3, Icon, Round, kg } from '../parts';
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

const FEEL_LABEL: Record<Feel, string> = { leicht: 'Leicht', passend: 'Passend', streng: 'Sehr streng' };

export function SetEntry({ id, warmup, onBack, onSaved }: { id: string; warmup: boolean; onBack: () => void; onSaved: () => void }) {
  const store = useStore();
  const ex = library.find((e) => e.id === id)!;
  const steps = stepsFor(store, ex);
  const today = workSets(store.active!).filter((s) => s.exerciseId === id);
  const last = today[today.length - 1];
  const work = suggest(ex, performances(id, store.history), steps, new Date());
  const sug = warmup ? warmupSuggestion(ex, work, steps) : work;
  const start = warmup ? undefined : last;

  const [weight, setWeight] = useState(start?.weight ?? sug.weight ?? steps[Math.floor(steps.length / 6)] ?? 0);
  const [reps, setReps] = useState(start?.reps ?? sug.reps ?? ex.range[0]);
  const [seconds, setSeconds] = useState(start?.seconds ?? sug.seconds ?? ex.range[0]);
  const [feel, setFeel] = useState<Feel | undefined>(undefined);

  const save = async () => {
    await store.actions.addSet({
      exerciseId: id,
      weight: ex.measure === 'gewicht' ? weight : undefined,
      reps: ex.measure === 'zeit' ? undefined : reps,
      seconds: ex.measure === 'zeit' ? seconds : undefined,
      feel: warmup ? undefined : feel,
      warmup: warmup || undefined,
    });
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
      <div class="h1" style={{ marginTop: 16 }}>{warmup ? 'Aufwärmsatz' : today.length ? 'Zusatzsatz' : 'Arbeitssatz'}</div>
      <div class="sub" style={{ marginBottom: 14 }}>
        {warmup
          ? 'Wenig Gewicht, ruhig und locker.'
          : ex.measure === 'zeit'
            ? `Halten, ${ex.range[0]}–${ex.range[1]} Sekunden.`
            : `${ex.range[0]}–${ex.range[1]} Wiederholungen${ex.perSide ? ' pro Seite' : ''}, bis kurz vor der Ermüdung.`}
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

      {!warmup && today.length > 0 && (
        <>
          <div class="label">Heute</div>
          {today.map((s, i) => (
            <div class="setlog num">
              <span>Satz {i + 1}</span>
              <span>
                {s.weight != null ? `${kg(s.weight)} kg · ` : ''}
                {s.seconds != null ? `${s.seconds} Sek.` : `${s.reps} Wdh.`}
                {s.feel ? ` · ${FEEL_LABEL[s.feel]}` : ''}
              </span>
            </div>
          ))}
        </>
      )}

      <div class="grow" style={{ minHeight: 24 }} />
      {!warmup && (
        <>
          <div class="note" style={{ textAlign: 'center', fontSize: 14 }}>Wie fühlte sich der Satz an?</div>
          <Feel3 value={feel} onChange={setFeel} />
        </>
      )}
      <button class="cta" style={{ marginTop: 14 }} onClick={save}>
        Satz speichern
      </button>
    </div>
  );
}
