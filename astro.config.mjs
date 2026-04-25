import { defineConfig } from 'astro/config';
import { fileURLToPath } from 'node:url';
import react from '@astrojs/react';
import sitemap from '@astrojs/sitemap';

const r = (p) => fileURLToPath(new URL(p, import.meta.url));

// https://astro.build/config
export default defineConfig({
  site: 'https://richtermax.com',
  integrations: [
    react(),
    sitemap({
      // Legal pages aren't useful in search results — also marked noindex.
      filter: (page) =>
        !page.includes('/impressum') &&
        !page.includes('/datenschutz') &&
        !page.includes('/404'),
      changefreq: 'monthly',
      priority: 0.7,
    }),
  ],
  compressHTML: true,
  prefetch: {
    prefetchAll: false,
    defaultStrategy: 'viewport',
  },
  build: {
    inlineStylesheets: 'auto',
  },
  image: {
    service: { entrypoint: 'astro/assets/services/sharp' },
  },
  vite: {
    resolve: {
      alias: {
        '~': r('./src'),
        '@components': r('./src/components'),
        '@data': r('./src/data'),
        '@layouts': r('./src/layouts'),
        '@lib': r('./src/lib'),
        '@styles': r('./src/styles'),
      },
    },
    ssr: {
      noExternal: ['gsap', '@studio-freight/lenis', 'split-type'],
    },
    build: {
      cssMinify: 'lightningcss',
    },
  },
});
