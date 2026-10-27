import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

// richtermax.com v3 — static output. Client scripts are small vanilla
// modules (canvas scenes, bib flip, season window), all external.
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
