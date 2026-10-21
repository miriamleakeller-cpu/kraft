import { useEffect, useState } from 'preact/hooks';
import { Sym } from './parts';
import { DeviceDetail, DeviceLibrary } from './screens/Devices';
import { History } from './screens/History';
import { Knowledge } from './screens/Knowledge';
import { Session } from './screens/Session';
import { Settings } from './screens/Settings';
import { Today } from './screens/Today';
import { StoreProvider, useStore } from './store';

type Tab = 'heute' | 'verlauf' | 'geraete' | 'wissen';

const TABS: [Tab, string, preact.JSX.Element][] = [
  ['heute', 'Heute', <svg viewBox="0 0 24 24"><path d="M4 11l8-6.5 8 6.5V20h-5v-5h-6v5H4z" /></svg>],
  ['verlauf', 'Verlauf', <svg viewBox="0 0 24 24"><path d="M5 20v-8M12 20V5M19 20v-5" /></svg>],
  ['geraete', 'Geräte', <Sym id="g-hantel" size={23} />],
  ['wissen', 'Wissen', <svg viewBox="0 0 24 24"><path d="M4 5.5C7 4 9.5 4 12 6c2.5-2 5-2 8-.5V19c-3-1.5-5.5-1.5-8 .5-2.5-2-5-2-8-.5zM12 6v13.5" /></svg>],
];

function Shell() {
  const store = useStore();
  const [tab, setTab] = useState<Tab>('heute');
  const [inSession, setInSession] = useState(false);
  const [device, setDevice] = useState<string | null>(null);
  const [settings, setSettings] = useState(false);
  const [toastText, setToast] = useState<string | null>(null);

  // Eine angefangene Session öffnet sich beim Start der App direkt wieder.
  useEffect(() => {
    if (store.loaded && store.active) setInSession(true);
  }, [store.loaded]);
  useEffect(() => {
    if (!toastText) return;
    const t = setTimeout(() => setToast(null), 2600);
    return () => clearTimeout(t);
  }, [toastText]);
  useEffect(() => window.scrollTo(0, 0), [tab, inSession, device]);

  if (!store.loaded) return null;
  const toast = <>{toastText && <div class="toast" role="status">{toastText}</div>}</>;

  if (inSession && store.active) {
    return (
      <>
        <Session onClose={() => setInSession(false)} toast={setToast} />
        {toast}
      </>
    );
  }
  if (device) return <DeviceDetail id={device} onBack={() => setDevice(null)} />;

  return (
    <>
      {tab === 'heute' && <Today onOpenSession={() => setInSession(true)} onSettings={() => setSettings(true)} />}
      {tab === 'verlauf' && <History />}
      {tab === 'geraete' && <DeviceLibrary onOpen={setDevice} />}
      {tab === 'wissen' && <Knowledge />}
      <nav class="tabs">
        {TABS.map(([k, label, icon]) => (
          <button class={`tab ${tab === k ? 'on' : ''}`} onClick={() => setTab(k)} aria-current={tab === k ? 'page' : undefined}>
            {icon}
            {label}
          </button>
        ))}
      </nav>
      {settings && <Settings onClose={() => setSettings(false)} toast={setToast} />}
      {toast}
    </>
  );
}

export function App() {
  return (
    <StoreProvider>
      <Shell />
    </StoreProvider>
  );
}
