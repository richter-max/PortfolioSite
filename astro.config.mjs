import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

// richtermax.com v3 — static output. Client scripts are small vanilla
// modules (canvas scenes, bib flip, season window), all external.
export default defineConfig({
  site: 'https://richtermax.com',
  output: 'static',
  // Vercel serves /off-track and redirects /off-track/ (cleanUrls,
  // trailingSlash false); canonical, og:url and sitemap must match that.
  trailingSlash: 'never',
  integrations: [
    sitemap({
      // legal pages are noindex, so they stay out of the sitemap
      filter: (page) => !/\/(impressum|datenschutz)\/?$/.test(page),
    }),
  ],
  vite: {
    build: {
      // keep every script external so the deployed CSP can stay
      // script-src 'self' with no unsafe-inline and no hashes
      assetsInlineLimit: 0,
    },
  },
});
