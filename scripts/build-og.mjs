// build-og.mjs — generate per-page 1200×630 OG cards for social shares.
//
// One typography-driven template, one image per page, all written to
// public/og/<slug>.jpg. The default OG (used as fallback in BaseLayout)
// is also rebuilt as public/img/og-default.jpg.
//
// Re-run any time the metadata table below changes:
//   npm run build:og
//
// No photos, no JSX-to-SVG renderers — just SVG composed with sharp.
// Sharp uses librsvg under the hood; system fonts are fine for OG
// rasters since the output is a static JPG.

import sharp from 'sharp';
import { mkdir } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, '..');

const W = 1200;
const H = 630;

// ── Page metadata ───────────────────────────────────────────────────
// kicker  → mono caps, accent-blue, top-left
// title   → display, the big white headline
// dek     → optional one-line subtitle below title (40ch max recommended)
// meta    → optional small bottom-right line (date / read time / etc.)
//
// Each entry produces public/og/<slug>.jpg. The Astro page references
// it via `ogImage="/og/<slug>.jpg"` in its BaseLayout call.
const PAGES = [
  {
    slug: 'home',
    kicker: 'SECURITY ENGINEER · ENDURANCE ATHLETE',
    title:  'Maximilian Richter',
    dek:    'Production security engineering. Triathlon training. Open-source tools that ship.',
    meta:   'RICHTERMAX.COM',
  },
  // Case studies
  {
    slug: 'aegis',
    kicker: 'CASE 01 / 04 · SECURITY HARNESS · AI AGENTS',
    title:  'AEGIS.',
    dek:    'A deterministic security evaluation harness for tool-using agents.',
    meta:   '≈ 8 MIN · OPEN SOURCE · MIT',
  },
  {
    slug: 'scanner',
    kicker: 'CASE 02 / 04 · CLI TOOL · OPEN SOURCE',
    title:  'Scanner.',
    dek:    'Non-intrusive attack surface and transport security scanning for SaaS.',
    meta:   '≈ 7 MIN · OPEN SOURCE · MIT',
  },
  {
    slug: 'vendorq',
    kicker: 'CASE 03 / 04 · B2B SAAS · CLOSED BETA',
    title:  'VendorQ.',
    dek:    'AI-assisted vendor security questionnaire automation.',
    meta:   'PRIVATE · BETA',
  },
  {
    slug: 'smb',
    kicker: 'CASE 04 / 04 · SECURITY PRODUCT · IN DEVELOPMENT',
    title:  'SMB Security.',
    dek:    'Enterprise-grade security for companies with 10–200 employees.',
    meta:   '2026 · IN DEVELOPMENT',
  },
  // Meta
  {
    slug: 'security',
    kicker: 'META · THREAT MODEL · SELF-AUDIT',
    title:  'Threats.',
    dek:    'The portfolio site, audited by its own author. Assets, adversaries, mitigations.',
    meta:   '≈ 6 MIN · LIVE',
  },
  // Blog
  {
    slug: 'blog-shenzhen',
    kicker: 'BLOG · NOTE · APRIL 2026',
    title:  'Two Weeks in Shenzhen.',
    dek:    'On factories, scale, and what shipping really means.',
    meta:   '≈ 5 MIN · BLOG',
  },
  // Legal
  {
    slug: 'impressum',
    kicker: 'LEGAL · §5 TMG',
    title:  'Impressum.',
    dek:    'Anbieterkennzeichnung nach deutschem Recht.',
    meta:   'RICHTERMAX.COM',
  },
  {
    slug: 'datenschutz',
    kicker: 'LEGAL · DSGVO',
    title:  'Datenschutz.',
    dek:    'Datenschutzerklärung nach Art. 13 DSGVO.',
    meta:   'RICHTERMAX.COM',
  },
];

// ── SVG template ────────────────────────────────────────────────────
function escapeXml(s) {
  return String(s).replace(/[<>&'"]/g, (c) => (
    { '<': '&lt;', '>': '&gt;', '&': '&amp;', "'": '&apos;', '"': '&quot;' }[c]
  ));
}

function ogSvg({ kicker, title, dek, meta }) {
  // Title font scales with length — 50ch+ headlines drop two sizes so
  // they stay on two lines max. The case-study titles are short
  // ("AEGIS.", "Scanner.") so they stay at the largest size.
  const titleLen = title.length;
  let titleSize = 132;
  if (titleLen > 18) titleSize = 108;
  if (titleLen > 28) titleSize = 88;

  // Manual line-wrap helper for the dek so it doesn't overflow on
  // tablet share previews. ~52 chars per line at this width.
  const wrapDek = (text, max = 52) => {
    if (!text) return [];
    const words = text.split(' ');
    const lines = [];
    let line = '';
    for (const w of words) {
      if ((line + ' ' + w).trim().length > max) {
        lines.push(line.trim());
        line = w;
      } else {
        line = (line + ' ' + w).trim();
      }
    }
    if (line) lines.push(line);
    return lines.slice(0, 2); // hard cap two lines
  };
  const dekLines = wrapDek(dek);

  return `
<svg width="${W}" height="${H}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%"  stop-color="#0a0c10"/>
      <stop offset="100%" stop-color="#050506"/>
    </linearGradient>
    <radialGradient id="glow" cx="0.15" cy="0.15" r="0.55">
      <stop offset="0%"  stop-color="rgba(46,107,255,0.18)"/>
      <stop offset="100%" stop-color="rgba(46,107,255,0)"/>
    </radialGradient>
    <radialGradient id="glow2" cx="0.85" cy="0.95" r="0.45">
      <stop offset="0%"  stop-color="rgba(46,107,255,0.10)"/>
      <stop offset="100%" stop-color="rgba(46,107,255,0)"/>
    </radialGradient>
    <style>
      .mark   { font-family: 'Inter Tight','Helvetica Neue','Arial',sans-serif; font-weight: 700; fill: #F3F1EC; }
      .url    { font-family: 'JetBrains Mono','Menlo',monospace; font-weight: 500; fill: #6B6965; letter-spacing: 4px; }
      .kicker { font-family: 'JetBrains Mono','Menlo',monospace; font-weight: 500; fill: #2E6BFF; letter-spacing: 5px; }
      .title  { font-family: 'Inter Tight','Helvetica Neue','Arial',sans-serif; font-weight: 500; fill: #F3F1EC; letter-spacing: -0.04em; }
      .dek    { font-family: 'Inter Tight','Helvetica Neue','Arial',sans-serif; font-weight: 400; fill: #A8A6A0; letter-spacing: -0.005em; }
      .meta   { font-family: 'JetBrains Mono','Menlo',monospace; font-weight: 500; fill: #6B6965; letter-spacing: 4px; }
      .bar    { stroke: rgba(243,241,236,0.16); stroke-width: 1; }
      .accent { stroke: #2E6BFF; stroke-width: 2; }
    </style>
  </defs>

  <!-- background -->
  <rect width="${W}" height="${H}" fill="url(#bg)"/>
  <rect width="${W}" height="${H}" fill="url(#glow)"/>
  <rect width="${W}" height="${H}" fill="url(#glow2)"/>

  <!-- top bar: brand mark + url -->
  <text class="mark" x="64"  y="76" font-size="28">MR.</text>
  <text class="url"  x="${W - 64}" y="76" font-size="14" text-anchor="end">RICHTERMAX.COM</text>

  <!-- thin separator under top bar -->
  <line class="bar" x1="64" y1="100" x2="${W - 64}" y2="100"/>

  <!-- accent rule + kicker (sits well above the title baseline) -->
  <line class="accent" x1="64" y1="248" x2="112" y2="248"/>
  <text class="kicker" x="128" y="254" font-size="14">${escapeXml(kicker)}</text>

  <!-- title (anchor by baseline; title cap rises ~0.72 × font-size) -->
  <text class="title" x="64" y="400" font-size="${titleSize}">${escapeXml(title)}</text>

  <!-- dek (up to two lines, below the title baseline) -->
  ${dekLines.map((line, i) => `<text class="dek" x="64" y="${460 + i * 34}" font-size="22">${escapeXml(line)}</text>`).join('\n  ')}

  <!-- bottom rule + meta -->
  <line class="bar" x1="64" y1="${H - 60}" x2="${W - 64}" y2="${H - 60}"/>
  <text class="meta" x="64" y="${H - 30}" font-size="12">${escapeXml(meta || '')}</text>
</svg>
`;
}

// ── Main ────────────────────────────────────────────────────────────
async function main() {
  const outDir = resolve(root, 'public/og');
  await mkdir(outDir, { recursive: true });

  for (const page of PAGES) {
    const svg = Buffer.from(ogSvg(page));
    const out = resolve(outDir, `${page.slug}.jpg`);
    await sharp(svg)
      .jpeg({ quality: 88, progressive: true, mozjpeg: true })
      .toFile(out);
    console.log(`✓ ${out.replace(root + '/', '')} — ${page.title}`);
  }

  // Default OG (used as global fallback in BaseLayout) is the home one.
  await sharp(Buffer.from(ogSvg(PAGES[0])))
    .jpeg({ quality: 88, progressive: true, mozjpeg: true })
    .toFile(resolve(root, 'public/img/og-default.jpg'));
  console.log('✓ public/img/og-default.jpg — default fallback');
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
