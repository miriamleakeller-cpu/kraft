import { createContext, type ComponentChildren } from 'preact';
import { useCallback, useContext, useEffect, useMemo, useRef, useState } from 'preact/hooks';
import { library } from '../config/library';
import { rules } from '../config/rules';
import { exerciseState, meta as metaStore, persistStorage, runs as runStore, sessions as sessionStore, type Meta } from '../data/db';
import type { Exercise, ExerciseState, Feel, GymSession, Phase, Run, SetLog } from '../domain/types';

// Zustand der App. Jede Änderung wird zuerst gespeichert und erst dann angezeigt,
// damit beim Wechsel in eine andere App oder einem Absturz nichts verloren geht.

interface State {
  loaded: boolean;
  sessions: GymSession[];
  runs: Run[];
  exState: Record<string, ExerciseState>;
  meta: Meta;
}

const empty: State = { loaded: false, sessions: [], runs: [], exState: {}, meta: {} };

function useStoreValue() {
  const [state, setStateRaw] = useState<State>(empty);
  // Aktueller Stand auch zwischen zwei Renderings, damit schnell aufeinanderfolgende
  // Änderungen nicht auf einem veralteten Stand aufbauen.
  const ref = useRef<State>(empty);
  const setState = useCallback((fn: (s: State) => State) => {
    ref.current = fn(ref.current);
    setStateRaw(ref.current);
  }, []);
  const queue = useRef(Promise.resolve());
  const serial = useCallback((job: () => Promise<void>) => (queue.current = queue.current.then(job, job)), []);

  const load = useCallback(async () => {
    const [sessions, runs, ex, meta] = await Promise.all([
      sessionStore.all(),
      runStore.all(),
      exerciseState.all(),
      metaStore.get(),
    ]);
    setState(() => ({ loaded: true, sessions, runs, exState: Object.fromEntries(ex.map((e) => [e.id, e])), meta }));
  }, [setState]);

  useEffect(() => {
    void persistStorage();
    void load();
  }, [load]);

  const active = state.sessions.find((s) => s.id === state.meta.activeSessionId && !s.endedAt);
  const history = state.sessions.filter((s) => s !== active && s.sets.length > 0);

  const putSession = useCallback(
    async (s: GymSession) => {
      await sessionStore.put(s);
      setState((st) => ({ ...st, sessions: [...st.sessions.filter((x) => x.id !== s.id), s] }));
    },
    [setState],
  );

  const patchMeta = useCallback(
    async (p: Partial<Meta>) => {
      await metaStore.patch(p);
      setState((st) => ({ ...st, meta: { ...st.meta, ...p } }));
    },
    [setState],
  );

  const updateActive = useCallback(
    (fn: (s: GymSession) => GymSession) =>
      serial(async () => {
        const st = ref.current;
        const cur = st.sessions.find((s) => s.id === st.meta.activeSessionId && !s.endedAt);
        if (cur) await putSession(fn(structuredClone(cur)));
      }),
    [serial, putSession],
  );

  const actions = {
    reload: load,
    async startSession(now = new Date()) {
      const s: GymSession = {
        id: `gym-${now.getTime()}`,
        startedAt: now.toISOString(),
        phase: 'aufwaermen',
        plannedMinutes: rules.plannedMinutes,
        sets: [],
      };
      await putSession(s);
      await patchMeta({ activeSessionId: s.id });
    },
    setPhase: (phase: Phase) => updateActive((s) => ({ ...s, phase })),
    addSet: (set: Omit<SetLog, 'at'>, restSec: number) =>
      updateActive((s) => {
        const at = new Date();
        s.sets.push({ ...set, at: at.toISOString() });
        s.restEndsAt = new Date(at.getTime() + restSec * 1000).toISOString();
        s.restPausedRemaining = undefined;
        return s;
      }),
    setLastFeel: (feel: Feel | undefined) =>
      updateActive((s) => {
        const last = s.sets[s.sets.length - 1];
        if (last) last.feel = feel;
        return s;
      }),
    setRest: (restEndsAt: string | undefined, restPausedRemaining?: number) =>
      updateActive((s) => ({ ...s, restEndsAt, restPausedRemaining })),
    async finishSession() {
      if (!active) return;
      if (active.sets.length === 0) {
        await sessionStore.remove(active.id);
        setState((st) => ({ ...st, sessions: st.sessions.filter((x) => x.id !== active.id) }));
      } else {
        await putSession({ ...active, phase: 'fertig', endedAt: new Date().toISOString(), restEndsAt: undefined });
      }
      await patchMeta({ activeSessionId: undefined });
    },
    async saveExerciseState(e: ExerciseState) {
      await exerciseState.put(e);
      setState((st) => ({ ...st, exState: { ...st.exState, [e.id]: e } }));
    },
    patchMeta,
  };

  const lib = useMemo(() => library.filter((e) => state.exState[e.id]?.active !== false), [state.exState]);

  return { ...state, active, history, lib, actions };
}

export type Store = ReturnType<typeof useStoreValue>;
const Ctx = createContext<Store | null>(null);

export function StoreProvider({ children }: { children: ComponentChildren }) {
  return <Ctx.Provider value={useStoreValue()}>{children}</Ctx.Provider>;
}

export function useStore() {
  const s = useContext(Ctx);
  if (!s) throw new Error('StoreProvider fehlt');
  return s;
}

export function stateFor(store: Store, ex: Exercise): ExerciseState {
  return store.exState[ex.id] ?? { id: ex.id, settings: {}, active: true };
}

export function stepsFor(store: Store, ex: Exercise): number[] {
  return stateFor(store, ex).weightSteps ?? ex.weightSteps ?? [];
}
