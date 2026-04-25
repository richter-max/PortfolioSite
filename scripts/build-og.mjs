// build-og.mjs — assemble a 1200×630 social preview image from masters.
// Output: public/img/og-default.jpg
// Re-run any time the source artwork changes:
//   node scripts/build-og.mjs
import sharp from 'sharp';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, '..');

const W = 1200;
const H = 630;

const base = resolve(root, 'public/img/laptophero.png');
const out  = resolve(root, 'public/img/og-default.jpg');

// 1. Cover-fit the master image, darken via flat overlay so headline pops.
const cover = await sharp(base)
  .resize(W, H, { fit: 'cover', position: 'centre' })
  .modulate({ brightness: 0.55, saturation: 0.85 })
  .toBuffer();

// 2. Compose with brand block + text using SVG.
const svg = Buffer.from(`
<svg width="${W}" height="${H}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="vignette" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%"  stop-color="rgba(5,5,6,0.0)"/>
      <stop offset="55%" stop-color="rgba(5,5,6,0.55)"/>
      <stop offset="100%" stop-color="rgba(5,5,6,0.92)"/>
    </linearGradient>
    <style>
      .name { font-family: 'Inter Tight', 'Helvetica Neue', sans-serif; font-weight: 600; fill: #F3F1EC; }
      .role { font-family: 'JetBrains Mono', 'Menlo', monospace; font-weight: 500; fill: #2E6BFF; letter-spacing: 6px; }
      .url  { font-family: 'JetBrains Mono', 'Menlo', monospace; font-weight: 500; fill: #6B6965; letter-spacing: 4px; }
      .bar  { stroke: #2E6BFF; stroke-width: 2; }
    </style>
  </defs>
  <rect width="${W}" height="${H}" fill="url(#vignette)" />
  <line class="bar" x1="64" y1="${H - 220}" x2="128" y2="${H - 220}" />
  <text class="role" x="148" y="${H - 213}" font-size="16">SECURITY ENGINEER · ENDURANCE ATHLETE</text>
  <text class="name" x="64" y="${H - 130}" font-size="84">Maximilian Richter</text>
  <text class="url"  x="64" y="${H - 60}"  font-size="18">RICHTERMAX.COM</text>
</svg>
`);

await sharp(cover)
  .composite([{ input: svg, top: 0, left: 0 }])
  .jpeg({ quality: 86, progressive: true, mozjpeg: true })
  .toFile(out);

console.log(`✓ wrote ${out.replace(root + '/', '')} — 1200×630`);
