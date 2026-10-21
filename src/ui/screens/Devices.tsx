import { useState } from 'preact/hooks';
import { REGION_LABEL, library } from '../../config/library';
import { performances, suggest } from '../../domain/progression';
import { recommend } from '../../domain/recommend';
import type { Exercise } from '../../domain/types';
import { Icon, Pic, Pips, Round, kg, regionsText, target } from '../parts';
import { stateFor, stepsFor, useStore, type Store } from '../store';

/** Vorschlag für heute in Worten, z. B. «42,5 kg». */
export function todayValue(store: Store, ex: Exercise) {
  const s = suggest(ex, performances(ex.id, store.history), stepsFor(store, ex), new Date());
  if (ex.measure === 'zeit') return `${s.seconds} Sek.`;
  if (ex.measure === 'wiederholungen') return `${s.reps} Wdh.`;
  return s.weight != null ? `${kg(s.weight)} kg` : 'Gewicht wählen';
}

export function SessionDevices({ onPick, onCooldown, onBack }: { onPick: (id: string) => void; onCooldown: () => void; onBack: () => void }) {
  const store = useStore();
  const s = store.active!;
  const r = recommend({ library: store.lib, session: s, history: store.history, runs: store.runs, now: new Date() });
  const top = new Set(r.top.map((t) => t.exercise.id));
  const minutes = Math.round((Date.now() - Date.parse(s.startedAt)) / 60000);
  return (
    <div class="screen">
      <div class="nav">
        <Round onClick={onBack} label="Zur Startseite">
          <Icon name="back" />
        </Round>
        <span class="meta num">Krafttraining · {minutes} Min.</span>
        <button class="link" onClick={onCooldown}>
          Cool-down
        </button>
      </div>
      <div class="h1" style={{ marginTop: 10 }}>Geräte</div>

      <div class="label">Empfohlen</div>
      {r.top.map((t, i) => (
        <button class="tile item press" onClick={() => onPick(t.exercise.id)}>
          <Pic id={t.exercise.image} size={72} />
          <div class="tx">
            <b>{t.exercise.name}</b>
            <div class="sub">{regionsText(t.exercise, REGION_LABEL)}</div>
            <div class="val num">
              {target(t.exercise)} · {todayValue(store, t.exercise)}
            </div>
          </div>
          {t.setsDone > 0 ? <Pips done={t.setsDone} total={t.exercise.sets} /> : <span class="rec-n">{i + 1}</span>}
        </button>
      ))}
      {r.top.length === 0 && <p class="note">Alle Geräte sind erledigt. Weiter zum Cool-down, wann immer du magst.</p>}

      <div class="label">Alle Geräte</div>
      <div>
        {r.all
          .filter((x) => !top.has(x.exercise.id))
          .map((x) => (
            <button class={`mini ${x.done ? 'done' : ''}`} onClick={() => onPick(x.exercise.id)}>
              <Pic id={x.exercise.image} size={44} radius={13} />
              <b>{x.exercise.name}</b>
              {x.thirdSet && <span class="chip">3. Satz möglich</span>}
              <Pips done={Math.min(x.setsDone, x.exercise.sets)} total={x.exercise.sets} />
            </button>
          ))}
      </div>
      <div style={{ height: 24 }} />
      <button class="cta ghost" onClick={onCooldown}>
        Zum Cool-down
      </button>
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
