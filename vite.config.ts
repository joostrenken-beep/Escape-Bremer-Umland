/// <reference types="vitest/config" />
import { defineConfig, type Plugin } from 'vite';
import preact from '@preact/preset-vite';
import { VitePWA } from 'vite-plugin-pwa';
import { buildContent, report } from './scripts/build-content.ts';

/** Baut content/ → public/tours/ vor jedem Build und bei Änderungen im Dev-Server. */
function tourContent(): Plugin {
  const run = async () => {
    const ok = report(await buildContent());
    if (!ok) throw new Error('Content-Prüfung fehlgeschlagen (siehe oben)');
  };
  return {
    name: 'tour-content',
    async buildStart() {
      await run();
    },
    configureServer(server) {
      server.watcher.add(['content', 'schema']);
      server.watcher.on('all', async (_event, file) => {
        if (!/[\\/](content|schema)[\\/]/.test(file)) return;
        try {
          await run();
          server.ws.send({ type: 'full-reload' });
        } catch (e) {
          server.config.logger.error((e as Error).message);
        }
      });
    },
  };
}

// Auf GitHub Pages liegt die App unter /<repo-name>/ – das setzt der Workflow.
const base = process.env.BASE_PATH ?? '/';

export default defineConfig({
  base,
  plugins: [
    tourContent(),
    preact(),
    VitePWA({
      registerType: 'prompt',
      includeAssets: ['favicon.ico', 'icon.svg', 'apple-touch-icon-180x180.png'],
      manifest: {
        name: 'Ermittlerakte – Escape-Touren im Bremer Umland',
        short_name: 'Ermittlerakte',
        description: 'Krimi-Escape-Spiel und Stadtführung zu Fuß',
        lang: 'de',
        theme_color: '#3b2a1e',
        background_color: '#f3ead7',
        display: 'standalone',
        orientation: 'portrait',
        icons: [
          { src: 'pwa-64x64.png', sizes: '64x64', type: 'image/png' },
          { src: 'pwa-192x192.png', sizes: '192x192', type: 'image/png' },
          { src: 'pwa-512x512.png', sizes: '512x512', type: 'image/png' },
          { src: 'maskable-icon-512x512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
      },
      workbox: {
        // App-Hülle wird immer vorab gespeichert. Stadtpakete (tours/) NICHT –
        // die lädt man gezielt über „Für offline speichern“ (siehe StaticContentAdapter).
        globPatterns: ['**/*.{js,css,html,svg,png,ico,woff2}'],
        globIgnores: ['tours/**'],
        navigateFallback: 'index.html',
        runtimeCaching: [
          {
            // Tour-Daten: sofort aus dem Speicher, im Hintergrund aktualisieren
            urlPattern: ({ url }) => url.pathname.includes('/tours/') && url.pathname.endsWith('.json'),
            handler: 'StaleWhileRevalidate',
            options: { cacheName: 'tour-content' },
          },
          {
            // Bilder/Audio: einmal geladen, dann immer aus dem Speicher
            urlPattern: ({ url }) => url.pathname.includes('/tours/') && url.pathname.includes('/media/'),
            handler: 'CacheFirst',
            options: { cacheName: 'tour-content', rangeRequests: true },
          },
        ],
      },
    }),
  ],
  test: {
    include: ['tests/**/*.test.ts'],
    environment: 'node',
  },
});
