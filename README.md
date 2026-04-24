# richtermax.com

Personal site of Maximilian Richter — security engineer, endurance athlete.

Static-first Astro build with a handful of React islands, self-hosted variable
fonts, compressed 3D geometry, and responsive AVIF imagery. Ships under ~2 MB
of critical payload on first paint.

---

## Stack

| Concern        | Choice                                                 |
| -------------- | ------------------------------------------------------ |
| Framework      | [Astro 4](https://astro.build) (static output)         |
| Islands        | React 18 — hero, field tape, contact scene             |
| 3D             | Three.js + Draco-compressed glTF                       |
| Motion         | GSAP + ScrollTrigger, Lenis smooth scroll              |
| Typography     | Inter Tight Variable + JetBrains Mono Variable (local) |
| CSS            | Design tokens + scoped Astro styles, no framework      |
| Image pipeline | sharp → responsive AVIF / WebP / JPG                   |
| Linting        | Prettier + `astro check`                               |

---

## Getting started

```bash
npm install
npm run dev         # http://localhost:4321
```

### Scripts

| Command                    | What it does                              |
| -------------------------- | ----------------------------------------- |
| `npm run dev`              | Dev server with HMR                       |
| `npm run build`            | Static build → `dist/`                    |
| `npm run preview`          | Preview built site locally                |
| `npm run typecheck`        | `astro check` across the project          |
| `npm run format`           | Prettier write                            |
| `npm run format:check`     | Prettier check (CI-friendly)              |
| `npm run optimize:images`  | Rebuild `public/img/opt/` from masters    |
| `npm run optimize:glb`     | Rebuild `public/models/richter.opt.glb`   |
| `npm run optimize:assets`  | Both of the above                         |

---

## Project structure

```
.
├── public/
│   ├── favicon.svg
│   ├── fonts/               # self-hosted woff2 (preloaded)
│   ├── img/
│   │   ├── *.{jpg,png}      # masters, not served
│   │   └── opt/             # responsive AVIF / WebP / JPG (served)
│   └── models/
│       └── richter.opt.glb  # Draco-compressed geometry
├── scripts/                 # build-time node scripts
│   ├── optimize-images.mjs
│   └── optimize-glb.mjs
├── src/
│   ├── components/
│   │   ├── blog/            # BlogDrift
│   │   ├── contact/         # ContactScene + ContactRunner (Three.js)
│   │   ├── field/           # FieldTape (pinned horizontal scroll)
│   │   ├── hero/            # Hero
│   │   ├── layout/          # Nav, Rail, Footer
│   │   ├── stats/           # MassiveNumbers
│   │   └── work/            # WorkSection
│   ├── data/                # typed content (projects, field, blog, site)
│   ├── layouts/
│   │   └── BaseLayout.astro
│   ├── lib/                 # helpers (image url builders)
│   ├── pages/
│   │   ├── index.astro
│   │   └── case-studies/
│   │       └── aegis.astro
│   ├── scripts/             # client-side runtime (motion.js)
│   └── styles/
│       ├── fonts.css
│       ├── tokens.css
│       └── base.css
├── astro.config.mjs
├── tsconfig.json
└── package.json
```

### Path aliases

Configured in `tsconfig.json` and `astro.config.mjs`:

```ts
import BaseLayout from '@layouts/BaseLayout.astro';
import { projects } from '@data/projects';
import Nav from '@components/layout/Nav.astro';
import { optImage } from '@lib/images';
```

### Content

All user-facing content lives in `src/data/`:

| File              | What lives here                          |
| ----------------- | ---------------------------------------- |
| `site.ts`         | Site-wide metadata (title, OG, author)   |
| `projects.ts`     | Work section entries                     |
| `field.ts`        | Endurance / field tape entries           |
| `blog.ts`         | Blog posts shown in the drift carousel   |

Edit → commit → deploy. No CMS.

---

## Performance notes

- **Fonts** — self-hosted variable `woff2` (latin + latin-ext subsets),
  preloaded in the document head. No external round-trip.
- **Images** — masters in `public/img/` are never served. The build script
  emits responsive AVIF/WebP/JPG to `public/img/opt/`. References use the
  optimized paths. `berlin-marathon.jpg` went from 6.3 MB → ~140 KB AVIF.
- **3D model** — `richter.glb` (55 MB) compressed to `richter.opt.glb`
  (~4.7 MB) via Draco geometry compression + WebP textures. Decoder loaded
  from Google's CDN.
- **Hydration** — only the hero is `client:load`. `FieldTape` and
  `ContactScene` are `client:visible`, so Three.js + the GLB only download
  when the contact section enters the viewport.
- **Animations** — the grain overlay and custom cursor pause on hidden tabs
  and are disabled on coarse-pointer devices and under
  `prefers-reduced-motion`.
- **Prefetch** — Astro's viewport prefetch strategy warms the next page
  before the user clicks.

---

## Deployment

The build is fully static. Any host works. Recommended targets:

### Cloudflare Pages

1. Connect repo
2. Build command: `npm run build`
3. Output: `dist`
4. `NODE_VERSION=20`

### Vercel / Netlify

Framework preset auto-detected as Astro. Output directory `dist`.

> **Tip:** set `Cache-Control: public, max-age=31536000, immutable` on
> `/fonts/*`, `/img/opt/*`, and `/models/*` — all are content-hashed or
> stable and can be cached aggressively.

---

## License

All rights reserved. Content and branding belong to Maximilian Richter.
