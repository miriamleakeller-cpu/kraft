import '@fontsource/instrument-sans/400.css';
import '@fontsource/instrument-sans/500.css';
import '@fontsource/instrument-sans/600.css';
import './ui/styles.css';
import { render } from 'preact';
import { registerSW } from 'virtual:pwa-register';
import sprite from './assets/sprite.svg?raw';
import { App } from './ui/App';

document.body.insertAdjacentHTML('afterbegin', sprite);
render(<App />, document.getElementById('app')!);

// Offline-Fähigkeit. Eine neue Version wird beim nächsten Start der App aktiv.
registerSW({ immediate: true });
