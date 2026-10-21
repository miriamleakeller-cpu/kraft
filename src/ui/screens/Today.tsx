import { useStore } from '../store';
import { Icon, Sym } from '../parts';

const greeting = (h: number) => (h < 11 ? 'Guten Morgen.' : h < 18 ? 'Guten Tag.' : 'Guten Abend.');
const dateLabel = (d: Date) => d.toLocaleDateString('de-CH', { weekday: 'long', day: 'numeric', month: 'long' });

export function Today({ onOpenSession, onSettings }: { onOpenSession: () => void; onSettings: () => void }) {
  const store = useStore();
  const now = new Date();
  const start = async () => {
    if (!store.active) await store.actions.startSession();
    onOpenSession();
  };
  return (
    <div class="screen with-tabs">
      <i class="glow" style={{ width: 330, height: 280, left: -120, top: -80, background: 'var(--salbei)', opacity: 0.55 }} />
      <i class="glow" style={{ width: 260, height: 230, right: -110, top: 30, background: 'var(--pfirsich)', opacity: 0.6 }} />
      <div class="nav">
        <span />
        <button class="link" onClick={onSettings} aria-label="Einstellungen" style={{ color: 'var(--grau)' }}>
          <Icon name="gear" size={20} />
        </button>
      </div>
      <div class="kicker" style={{ marginTop: 20 }}>{dateLabel(now)}</div>
      <div class="hero" style={{ marginTop: 12 }}>{greeting(now.getHours())}</div>
      <div class="grow" />

      <button class="start-card press" onClick={start}>
        <Sym id="g-hantel" size={28} />
        <div class="row">
          <div>
            <div class="t">{store.active ? 'Training fortsetzen' : 'Krafttraining'}</div>
            <div class="s">{store.active ? `${store.active.sets.length} Sätze gespeichert` : 'Aufwärmen · Geräte · Cool-down'}</div>
          </div>
          <span class="arrow">
            <Icon name="arrow" />
          </span>
        </div>
      </button>

      <div class="tile side-card" style={{ marginTop: 10 }}>
        <span class="ic">
          <Sym id="g-lauf" />
        </span>
        <div style={{ flex: 1 }}>
          <b>Long Run</b>
          <div class="sub">Strava-Anbindung folgt</div>
        </div>
      </div>
    </div>
  );
}
