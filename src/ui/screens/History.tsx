import { useState } from 'preact/hooks';
import { useStore } from '../store';
import { Sym } from '../parts';

const day = (iso: string) => iso.slice(0, 10);

function Calendar({ month, gym, run }: { month: Date; gym: Set<string>; run: Set<string> }) {
  const y = month.getFullYear();
  const m = month.getMonth();
  const offset = (new Date(y, m, 1).getDay() + 6) % 7;
  const days = new Date(y, m + 1, 0).getDate();
  const key = (d: number) => `${y}-${String(m + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
  return (
    <div class="cal" aria-label="Trainingstage">
      {['M', 'D', 'M', 'D', 'F', 'S', 'S'].map((d) => (
        <small>{d}</small>
      ))}
      {Array.from({ length: offset }, () => (
        <i class="x" />
      ))}
      {Array.from({ length: days }, (_, i) => {
        const k = key(i + 1);
        return <i class={gym.has(k) ? 'g' : run.has(k) ? 'r' : ''} title={k} />;
      })}
    </div>
  );
}

export function History() {
  const store = useStore();
  const [tab, setTab] = useState<'gym' | 'run'>('gym');
  const [month, setMonth] = useState(() => new Date(new Date().getFullYear(), new Date().getMonth(), 1));
  const gym = [...store.history].sort((a, b) => b.startedAt.localeCompare(a.startedAt));
  const runs = [...store.runs].sort((a, b) => b.date.localeCompare(a.date));
  const inMonth = gym.filter((s) => {
    const d = new Date(s.startedAt);
    return d.getFullYear() === month.getFullYear() && d.getMonth() === month.getMonth();
  }).length;
  const shift = (d: number) => setMonth(new Date(month.getFullYear(), month.getMonth() + d, 1));

  return (
    <div class="screen with-tabs">
      <div class="h1" style={{ marginTop: 30 }}>Verlauf</div>
      <div class="seg" role="tablist">
        <button class={tab === 'gym' ? 'on' : ''} onClick={() => setTab('gym')}>
          Gym
        </button>
        <button class={tab === 'run' ? 'on' : ''} onClick={() => setTab('run')}>
          Long Run
        </button>
      </div>

      <div class="tile" style={{ padding: '16px 16px 14px', marginTop: 14 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <button onClick={() => shift(-1)} aria-label="Vorheriger Monat" style={{ color: 'var(--grau)', padding: 4 }}>
            ‹
          </button>
          <span style={{ fontSize: 15, fontWeight: 600 }}>{month.toLocaleDateString('de-CH', { month: 'long', year: 'numeric' })}</span>
          <button onClick={() => shift(1)} aria-label="Nächster Monat" style={{ color: 'var(--grau)', padding: 4 }}>
            ›
          </button>
        </div>
        <Calendar month={month} gym={new Set(gym.map((s) => day(s.startedAt)))} run={new Set(runs.map((r) => day(r.date)))} />
      </div>

      {tab === 'gym' ? (
        <>
          <div class="facts">
            <div>
              <b class="num">{gym.length}</b>
              <small>Gym-Besuche insgesamt</small>
            </div>
            <div>
              <b class="num">{inMonth}</b>
              <small>im {month.toLocaleDateString('de-CH', { month: 'long' })}</small>
            </div>
          </div>
          <div style={{ marginTop: 12 }}>
            {gym.length === 0 && <p class="note">Noch keine Trainings.</p>}
            {gym.map((s) => {
              const n = new Set(s.sets.map((x) => x.exerciseId)).size;
              const min = s.endedAt ? Math.round((Date.parse(s.endedAt) - Date.parse(s.startedAt)) / 60000) : null;
              return (
                <div class="log">
                  <span class="g">
                    <Sym id="g-hantel" size={19} />
                  </span>
                  <div class="tx">
                    <b>Krafttraining</b>
                    <span>
                      {n} Übungen · {s.sets.length} Sätze{min != null ? ` · ${min} Min.` : ''}
                    </span>
                  </div>
                  <em>{new Date(s.startedAt).toLocaleDateString('de-CH', { weekday: 'short', day: 'numeric', month: 'short' })}</em>
                </div>
              );
            })}
          </div>
        </>
      ) : (
        <div style={{ marginTop: 12 }}>
          {runs.length === 0 && <p class="note">Noch keine Long Runs. Der Import aus Strava folgt im nächsten Schritt.</p>}
        </div>
      )}
    </div>
  );
}
