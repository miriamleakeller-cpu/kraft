/// <reference types="vitest/config" />
import { defineConfig } from 'vite';
import preact from '@preact/preset-vite';
import { VitePWA } from 'vite-plugin-pwa';

// Die App läuft auf GitHub Pages unter /kraft/.
export default defineConfig({
  base: '/kraft/',
  plugins: [
    preact(),
    VitePWA({
      // Neue Versionen werden erst beim nächsten Start aktiv, nie mitten im Training.
      registerType: 'prompt',
      injectRegister: false,
      includeAssets: ['apple-touch-icon.png'],
      manifest: {
        name: 'Kraft',
        short_name: 'Kraft',
        lang: 'de-CH',
        start_url: '/kraft/',
        scope: '/kraft/',
        display: 'standalone',
        orientation: 'portrait',
        background_color: '#F5F3EE',
        theme_color: '#F5F3EE',
        icons: [
          { src: 'icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: 'icon-512.png', sizes: '512x512', type: 'image/png' },
          { src: 'icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,svg,png,woff2}'],
        navigateFallback: 'index.html',
      },
    }),
  ],
  test: {
    environment: 'node',
  },
});
