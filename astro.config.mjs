import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

// richtermax.com v2 — static output. The only client runtime is
// Three.js for the figure, loaded lazily when the section approaches.
export default defineConfig({
  site: 'https://richtermax.com',
  output: 'static',
  integrations: [sitemap()],
  vite: {
    build: {
      // keep every script external so the deployed CSP can stay
      // script-src 'self' with no unsafe-inline and no hashes
      assetsInlineLimit: 0,
    },
  },
});
