# richtermax.com

Personal site of Maximilian Richter — AI agent security, endurance sport.

Static Astro build, no client framework. IBM Plex Sans + Mono self-hosted.
The only JavaScript on the page is a small countdown script and the lazily
loaded Three.js figure. No cookies, no analytics, no forms, no third-party
requests.

## Stack

| Concern    | Choice                                             |
| ---------- | -------------------------------------------------- |
| Framework  | Astro (static output)                              |
| 3D         | Three.js + Draco-compressed glTF, lazy-loaded      |
| Typography | IBM Plex Sans Variable + IBM Plex Mono (local)     |
| CSS        | Design tokens + scoped Astro styles, no framework  |
| Headers    | HSTS, strict CSP, COOP/CORP etc. via `vercel.json` |

## Getting started

```bash
npm install
npm run dev        # http://localhost:4321
npm run build      # static build → dist/
```

## Live training data

`src/data/live-stats.json` is refreshed daily by
`.github/workflows/refresh-live-stats.yml`, which runs
`scripts/fetch-live-stats.mjs` and commits the snapshot; the commit triggers
the redeploy. Values render server-side into the HTML — no client fetches,
no tokens in the browser, no count-up animation that can strand the page at
zero.

Required repo secrets (unchanged from v1): `STRAVA_CLIENT_ID`,
`STRAVA_CLIENT_SECRET`, `STRAVA_REFRESH_TOKEN`. The Web3Forms key from v1 is
no longer needed — the contact section links email directly.

## Content lives in

| File                 | What                                             |
| -------------------- | ------------------------------------------------ |
| `src/data/site.ts`   | Metadata, contact, legal (Impressum) details     |
| `src/data/races.ts`  | Race results + upcoming starts. The hero's       |
|                      | next-start block picks the first future date and |
|                      | advances/hides itself — it cannot expire.        |
| `src/data/posts.ts`  | Blog manifest (pages in `src/pages/blog/`)       |

After a race: move the entry from `upcoming` to `results` in `races.ts` and
add the finish time. That is the only manual data edit the site needs.

## Standing rule

No number appears on this site that isn't reproducible or pipeline-fed.
Before adding a stat, ask where it updates from; if the answer is "by hand",
don't add it.

## Domain

Canonical host is the apex `richtermax.com` — canonical tags, sitemap, OG
URLs and security.txt all use it. In Vercel → Domains, set
`richtermax.com` as the primary domain so `www` 308-redirects to it.

## Deployment

Fully static. Vercel: build command `npm run build`, output `dist`,
`NODE_VERSION=20+`. `vercel.json` carries the security headers — the
`/security` page's claims depend on them, so keep the two in sync.
