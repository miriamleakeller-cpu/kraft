import { useState } from 'preact/hooks';
import { REGION_LABEL, library } from '../../config/library';
import { performances, suggest } from '../../domain/progression';
import { recommend, type Ranked } from '../../domain/recommend';
import { rules } from '../../config/rules';
import type { Exercise } from '../../domain/types';
import { Icon, Pic, Round, kg, regionsText, target } from '../parts';
import { stateFor, stepsFor, useStore, type Store } from '../store';

/** Vorschlag für heute in Worten, z. B. «42,5 kg». */
export function todayValue(store: Store, ex: Exercise) {
  const s = suggest(ex, performances(ex.id, store.history), stepsFor(store, ex), new Date());
  if (ex.measure === 'zeit') return `${s.seconds} Sek.`;
  if (ex.measure === 'wiederholungen') return `${s.reps} Wdh.`;
  return s.weight != null ? `${kg(s.weight)} kg` : 'Gewicht wählen';
}

export function SessionDevices({
  warmup,
  onPick,
  onEndWarmup,
  onFinish,
  onBack,
}: {
  warmup: boolean;
  onPick: (id: string) => void;
  onEndWarmup: () => void;
  onFinish: () => void;
  onBack: () => void;
}) {
  const store = useStore();
  const s = store.active!;
  const r = recommend({ library: store.lib, session: s, history: store.history, runs: store.runs, now: new Date() });
  const minutes = Math.round((Date.now() - Date.parse(s.startedAt)) / 60000);

  // Beim Aufwärmen werden die grossen Übungen vorgeschlagen, die noch nicht aufgewärmt sind.
  const warmed = new Set(s.sets.filter((x) => x.warmup).map((x) => x.exerciseId));
  const top = warmup
    ? rules.warmupExercises
        .filter((id) => !warmed.has(id))
        .map((id) => r.all.find((x) => x.exercise.id === id))
        .filter((x): x is Ranked => !!x)
    : r.top;
  const topIds = new Set(top.map((t) => t.exercise.id));
  // Optionale Geräte zählen nicht zum Durchgang.
  const core = r.all.filter((x) => !x.exercise.optional);
  const left = core.filter((x) => !x.done).length;

  return (
    <div class="screen">
      <div class="nav">
        <Round onClick={onBack} label="Zur Startseite">
          <Icon name="back" />
        </Round>
        <span class="meta num">{minutes} Min.</span>
        {warmup ? (
          <button class="link" onClick={onEndWarmup}>
            Überspringen
          </button>
        ) : (
          <button class="link" onClick={onFinish}>
            Beenden
          </button>
        )}
      </div>
      <div class="h1" style={{ marginTop: 10 }}>{warmup ? 'Aufwärmen' : 'Geräte'}</div>
      <div class="sub">
        {warmup
          ? `${Math.min(warmed.size, rules.warmupSets)} von ${rules.warmupSets} · ein paar Geräte mit wenig Gewicht`
          : left
            ? `Noch ${left} von ${core.length} · ein Satz pro Gerät`
            : 'Alle Geräte erledigt'}
      </div>

      <div class="label">{warmup ? 'Zum Aufwärmen' : 'Empfohlen'}</div>
      {top.map((t, i) => (
        <button class="tile item press" onClick={() => onPick(t.exercise.id)}>
          <Pic id={t.exercise.image} size={72} />
          <div class="tx">
            <b>{t.exercise.name}</b>
            <div class="sub">{regionsText(t.exercise, REGION_LABEL)}</div>
            <div class="val num">{warmup ? 'leicht, 15 Wdh.' : `${target(t.exercise)} · ${todayValue(store, t.exercise)}`}</div>
          </div>
          <span class="rec-n">{i + 1}</span>
        </button>
      ))}
      {!warmup && top.length === 0 && <p class="note">Alle Geräte sind erledigt.</p>}

      <div class="label">Alle Geräte</div>
      <div>
        {r.all
          .filter((x) => !topIds.has(x.exercise.id))
          .map((x) => (
            <button class={`mini ${x.done && !warmup ? 'done' : ''}`} onClick={() => onPick(x.exercise.id)}>
              <Pic id={x.exercise.image} size={44} radius={13} />
              <b>{x.exercise.name}</b>
              {!warmup && x.extraSet && <span class="chip">Zusatzsatz möglich</span>}
              {!warmup && x.done && !x.extraSet && <Icon name="check" />}
            </button>
          ))}
      </div>
      <div style={{ height: 24 }} />
      {warmup ? (
        <button class="cta ghost" onClick={onEndWarmup}>
          Aufwärmen beenden
        </button>
      ) : (
        <button class={`cta ${left ? 'ghost' : ''}`} onClick={onFinish}>
          Training abschliessen
        </button>
      )}
    </div>
  );
}

type Tab = 'uebersicht' | 'anleitung' | 'verlauf';

export function DeviceDetail({ id, onBack, onStart }: { id: string; onBack: () => void; onStart?: () => void }) {
  const store = useStore();
  const ex = library.find((e) => e.id === id)!;
  const st = stateFor(store, ex);
  const [tab, setTab] = useState<Tab>('uebersicht');
  const [editing, setEditing] = useState(false);
  const hist = performances(ex.id, store.history);
  const sug = suggest(ex, hist, stepsFor(store, ex), new Date());

  const saveSetting = (key: string, value: string) =>
    store.actions.saveExerciseState({ ...st, settings: { ...st.settings, [key]: value.trim() } });

  return (
    <div class="screen">
      <div class="nav">
        <Round onClick={onBack} label="Zurück">
          <Icon name="back" />
        </Round>
        <span />
      </div>
      <div class="halo">
        <svg aria-hidden="true">
          <use href={`#${ex.image}`} />
        </svg>
      </div>
      <div class="h1">{ex.name}</div>
      <div class="sub">{ex.summary}</div>
      <div class="segl" role="tablist">
        {(
          [
            ['uebersicht', 'Übersicht'],
            ['anleitung', 'Anleitung'],
            ['verlauf', 'Verlauf'],
          ] as const
        ).map(([k, l]) => (
          <button role="tab" aria-selected={tab === k} class={tab === k ? 'on' : ''} onClick={() => setTab(k)}>
            {l}
          </button>
        ))}
      </div>

      {tab === 'uebersicht' && (
        <>
          {ex.settings.length > 0 && (
            <>
              <div class="label">
                Deine Einstellungen
                <button onClick={() => setEditing(!editing)}>{editing ? 'Fertig' : 'Bearbeiten'}</button>
              </div>
              {editing ? (
                <div class="tile">
                  {ex.settings.map((f) => (
                    <div class="field">
                      <label for={`f-${f.key}`}>{f.label}</label>
                      <input id={`f-${f.key}`} value={st.settings[f.key] ?? ''} placeholder="–" onChange={(e) => saveSetting(f.key, (e.target as HTMLInputElement).value)} />
                    </div>
                  ))}
                </div>
              ) : (
                <div class="grid3">
                  {ex.settings.map((f) => (
                    <div>
                      <small>{f.label}</small>
                      <b>{st.settings[f.key] || '–'}</b>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
          <div class="label">Für heute</div>
          <div class="grid3">
            <div>
              <small>Sätze</small>
              <b>{ex.sets}</b>
            </div>
            <div>
              <small>{ex.measure === 'zeit' ? 'Sekunden' : 'Wiederh.'}</small>
              <b class="num">
                {ex.range[0]}–{ex.range[1]}
              </b>
            </div>
            <div>
              <small>{ex.measure === 'gewicht' ? 'Gewicht' : ex.measure === 'zeit' ? 'Ziel' : 'Ziel'}</small>
              <b class="num">{ex.measure === 'gewicht' ? (sug.weight != null ? kg(sug.weight) : '–') : ex.measure === 'zeit' ? sug.seconds : sug.reps}</b>
            </div>
          </div>
          {sug.note === 'kalibrierung' && ex.measure === 'gewicht' && (
            <p class="note" style={{ marginTop: 10 }}>
              Erstes Mal an diesem Gerät: Wähle ein Gewicht, mit dem etwa {ex.range[1]} Wiederholungen gehen und noch zwei bis drei übrig wären.
            </p>
          )}
          {sug.note === 'wiedereinstieg' && <p class="note" style={{ marginTop: 10 }}>Nach der Pause etwas leichter. Deine Rückmeldung entscheidet, wie es weitergeht.</p>}
        </>
      )}

      {tab === 'anleitung' && (
        <>
          <div class="label">So geht es</div>
          <ol class="list-text">
            {ex.instructions.map((t) => (
              <li>{t}</li>
            ))}
          </ol>
          <div class="label">Darauf achten</div>
          <ul class="list-text">
            {ex.safety.map((t) => (
              <li>{t}</li>
            ))}
          </ul>
        </>
      )}

      {tab === 'verlauf' && (
        <>
          <div class="label">Bisher</div>
          {hist.length === 0 && <p class="note">Noch keine Einträge.</p>}
          {hist.slice(0, 12).map((p) => (
            <div class="setlog num">
              <span>{new Date(p.date).toLocaleDateString('de-CH', { day: 'numeric', month: 'short' })}</span>
              <span>
                {ex.measure === 'gewicht' && p.weight != null ? `${kg(p.weight)} kg · ` : ''}
                {(ex.measure === 'zeit' ? p.seconds.map((x) => `${x}s`) : p.reps).join(' / ')}
              </span>
            </div>
          ))}
        </>
      )}

      <div class="grow" style={{ minHeight: 24 }} />
      {onStart && (
        <button class="cta" onClick={onStart}>
          Los geht’s
        </button>
      )}
    </div>
  );
}

export function DeviceLibrary({ onOpen }: { onOpen: (id: string) => void }) {
  return (
    <div class="screen with-tabs">
      <div class="h1" style={{ marginTop: 30 }}>Geräte</div>
      <div style={{ marginTop: 14 }}>
        {library.map((ex) => (
          <button class="tile item press" onClick={() => onOpen(ex.id)}>
            <Pic id={ex.image} size={64} />
            <div class="tx">
              <b>{ex.name}</b>
              <div class="sub">{regionsText(ex, REGION_LABEL)}</div>
            </div>
            <Icon name="next" />
          </button>
        ))}
      </div>
    </div>
  );
}
