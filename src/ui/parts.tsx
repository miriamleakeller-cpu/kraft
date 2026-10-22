import type { ComponentChildren } from 'preact';
import type { Exercise } from '../domain/types';

export const Pic = ({ id, size, radius }: { id: string; size: number; radius?: number }) => (
  <div class="pic" style={{ width: size, height: size, borderRadius: radius }}>
    <svg aria-hidden="true">
      <use href={`#${id}`} />
    </svg>
  </div>
);

const paths: Record<string, string> = {
  back: 'M15 6l-6 6 6 6',
  next: 'M9 6l6 6-6 6',
  arrow: 'M5 12h14M13 6l6 6-6 6',
  minus: 'M6 12h12',
  plus: 'M6 12h12M12 6v12',
  pause: 'M9 6v12M15 6v12',
  play: 'M8 5.5v13l10-6.5z',
  check: 'M5 12.5l4.5 4.5L19 7.5',
  more: 'M5 12h.01M12 12h.01M19 12h.01',
  sound: 'M5 9.5h3l4-3.5v12l-4-3.5H5zM16 9.5a3.5 3.5 0 0 1 0 5',
  mute: 'M5 9.5h3l4-3.5v12l-4-3.5H5zM16 10l4 4M20 10l-4 4',
  gear: 'M12 9a3 3 0 1 0 0 6 3 3 0 0 0 0-6zM19.4 15a1.6 1.6 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.6 1.6 0 0 0-2.7 1.1V21a2 2 0 0 1-4 0v-.1a1.6 1.6 0 0 0-2.7-1.1l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.6 1.6 0 0 0-1.1-2.7H3a2 2 0 0 1 0-4h.1a1.6 1.6 0 0 0 1.1-2.7l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.6 1.6 0 0 0 2.7-1.1V3a2 2 0 0 1 4 0v.1a1.6 1.6 0 0 0 2.7 1.1l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.6 1.6 0 0 0 1.1 2.7h.1a2 2 0 0 1 0 4h-.1a1.6 1.6 0 0 0-1.5 1z',
};

export const Icon = ({ name, size = 18 }: { name: keyof typeof paths; size?: number }) => (
  <svg class="ico" viewBox="0 0 24 24" style={{ width: size, height: size }} aria-hidden="true">
    <path d={paths[name]} />
  </svg>
);

export const Sym = ({ id, size = 22 }: { id: string; size?: number }) => (
  <svg style={{ width: size, height: size }} aria-hidden="true">
    <use href={`#${id}`} />
  </svg>
);

export const Round = ({ onClick, label, children }: { onClick: () => void; label: string; children: ComponentChildren }) => (
  <button class="round press" onClick={onClick} aria-label={label}>
    {children}
  </button>
);

export const Pips = ({ done, total }: { done: number; total: number }) => (
  <div class="pips" aria-label={`${done} von ${total} Sätzen`}>
    {Array.from({ length: total }, (_, i) => (
      <i class={i < done ? 'f' : ''} />
    ))}
  </div>
);

export const regionsText = (ex: Exercise, labels: Record<string, string>) =>
  ex.regions.filter((r) => r.weight === 1).map((r) => labels[r.region]).join(' · ');

export const kg = (n: number) => n.toLocaleString('de-CH', { maximumFractionDigits: 2 });

export const target = (ex: Exercise) =>
  ex.measure === 'zeit' ? `${ex.range[0]}–${ex.range[1]} Sek.` : `${ex.range[0]}–${ex.range[1]} Wdh.${ex.perSide ? ' pro Seite' : ''}`;

export const clock = (sec: number) => {
  const s = Math.max(0, Math.round(sec));
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
};

export function Feel3({ value, onChange }: { value?: string; onChange: (v: 'leicht' | 'passend' | 'streng' | undefined) => void }) {
  const opts = [
    ['leicht', 'Leicht', 'l1'],
    ['passend', 'Passend', 'l2'],
    ['streng', 'Sehr streng', 'l3'],
  ] as const;
  return (
    <div class="feel" role="radiogroup" aria-label="Wie fühlte sich der Satz an?">
      {opts.map(([v, label, l]) => (
        <button role="radio" aria-checked={value === v} class={value === v ? 'on' : ''} onClick={() => onChange(value === v ? undefined : v)}>
          <span class={`lv ${l}`}>
            <i />
            <i />
            <i />
          </span>
          {label}
        </button>
      ))}
    </div>
  );
}
