import { defineConfig, minimal2023Preset } from '@vite-pwa/assets-generator/config';

// Erzeugt PNG-Icons (iPhone-Homescreen, Android) aus public/icon.svg:
//   npx pwa-assets-generator
export default defineConfig({
  preset: {
    ...minimal2023Preset,
    maskable: { ...minimal2023Preset.maskable, resizeOptions: { background: '#3b2a1e' } },
    apple: { ...minimal2023Preset.apple, resizeOptions: { background: '#3b2a1e' } },
  },
  images: ['public/icon.svg'],
});
