# Maximilian Richter — Personal Site

Astro + React islands. Static-first, hydrated only where needed (hero countdown, field tape scroll, writing deck).

## Stack
- **Framework:** Astro 4
- **Islands:** React 18 (hero, field tape, contact)
- **Styles:** Inline + `src/styles/tokens.css`
- **Fonts:** Inter Tight + JetBrains Mono (self-hosted via Google Fonts in `<head>`)

## Develop

```bash
pnpm install      # or npm install / yarn
pnpm dev          # http://localhost:4321
```

## Build

```bash
pnpm build        # outputs to ./dist
pnpm preview      # serve ./dist locally
```

## Deploy

The site is **static output** — any host works. Recommended:

### Cloudflare Pages (recommended)
1. Push this repo to GitHub
2. Cloudflare Pages → Create project → Connect to Git → select repo
3. Build command: `pnpm build` (or `npm run build`)
4. Output directory: `dist`
5. Node version (env var): `NODE_VERSION=20`
6. Custom domain → `richtermax.com` → follow DNS steps

### Vercel
1. Push to GitHub
2. Vercel → New Project → Import
3. Framework preset: Astro (auto-detected)
4. Deploy

### Netlify
1. Push to GitHub
2. Netlify → Add new site → Import from Git
3. Build command: `pnpm build`, Publish dir: `dist`

## Structure

```
src/
├── pages/
│   ├── index.astro             — home
│   └── case-studies/
│       └── aegis.astro         — AEGIS case study (static HTML)
├── components/
│   ├── Nav.astro               — static top bar (scroll-reactive via vanilla JS)
│   ├── SectionMarker.astro     — section eyebrow
│   ├── WorkScene.astro         — work row
│   ├── Footer.astro
│   ├── Rail.astro              — side scroll rail
│   ├── Hero.jsx                — React island (loader + countdown + ken-burns)
│   ├── FieldTape.jsx           — React island (pinned horizontal scroll)
│   └── ContactScene.jsx        — React island (form state)
├── styles/
│   └── tokens.css              — colors + type + resets
└── layouts/
    └── BaseLayout.astro        — html/head wrapper

public/
├── img/                        — all photos (blog-*, portrait-*, fjord, etc)
└── favicon.svg
```

## Editing content

**Work entries:** `src/pages/index.astro` → `<WorkScene ... />` blocks.
**Field entries:** same file → `fieldEntries` array passed to `<FieldTape>`.
**AEGIS case study:** `src/pages/case-studies/aegis.astro`.

No CMS. Edit, commit, push — Cloudflare/Vercel auto-redeploys.
