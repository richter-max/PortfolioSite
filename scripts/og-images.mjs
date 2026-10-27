#!/usr/bin/env node
// og-images.mjs — one link-preview image per report (1200 × 630), in the
// style of the race bib: title on the left, the result on the bib.
// Writes public/og/<slug>.png. Runs in .github/workflows/og-images.yml
// whenever a report changes; locally: `node scripts/og-images.mjs`.
// Needs Playwright with Chromium (the workflow installs it).

import { promises as fs } from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';
import os from 'node:os';

const require = createRequire(import.meta.url);
const { chromium } = require('playwright');

const ROOT = process.cwd();
const REPORTS = path.join(ROOT, 'src/content/reports');
const OUT = path.join(ROOT, 'public/og');
const font = (f) => `file://${path.join(ROOT, 'public/fonts', f)}`;

// Posts that are still hand-written .astro pages, not collection entries.
const LEGACY = [
  { slug: 'ironman-kraichgau', title: 'Ironman 70.3 Kraichgau.', date: '2026-05-31', type: 'race-report', race: 'Ironman 70.3 Kraichgau', result: '6:52:07', goal: '5:30' },
];

const KIND = { 'race-report': 'Race report', 'short-report': 'Short report', 'monthly-update': 'Monthly update', preview: 'Preview' };
const MON = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

/** The few frontmatter fields we need; values are single-line scalars. */
function frontmatter(src) {
  const m = src.match(/^---\n([\s\S]*?)\n---/);
  const out = {};
  if (!m) return out;
  for (const line of m[1].split('\n')) {
    const kv = line.match(/^(\w+):\s*(.*)$/);
    if (!kv) continue;
    out[kv[1]] = kv[2].trim().replace(/^"(.*)"$/, '$1').replace(/^'(.*)'$/, '$1');
  }
  return out;
}

const esc = (s = '') => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

function html(r) {
  const [y, mo, d] = r.date.slice(0, 10).split('-').map(Number);
  const date = `${d} ${MON[mo - 1]} ${y}`;
  const size = r.title.length > 30 ? 92 : r.title.length > 20 ? 112 : 128;
  const goal = r.goal ? (/^sub/i.test(r.goal) ? `Goal ${r.goal}` : /\d:\d\d/.test(r.goal) ? `Plan ${r.goal}` : r.goal) : '';
  return `<!doctype html><html><head><meta charset="utf-8"><style>
@font-face{font-family:A;src:url(${font('archivo-latin-wdth-normal.woff2')});font-weight:100 900;font-stretch:62% 125%}
@font-face{font-family:M;src:url(${font('ibm-plex-mono-latin-400-normal.woff2')})}
html,body{margin:0}
.c{width:1200px;height:630px;box-sizing:border-box;padding:64px 72px;display:flex;justify-content:space-between;align-items:stretch;gap:48px;background:#0c0c0b;color:#edebe6;position:relative;overflow:hidden}
.l{font-family:M;font-size:19px;letter-spacing:.16em;text-transform:uppercase;color:#a29e97}
.left{display:flex;flex-direction:column;justify-content:space-between;min-width:0}
h1{margin:22px 0 0;font-family:A;font-stretch:62%;font-weight:700;font-size:${size}px;line-height:.86;text-transform:uppercase}
.bib{flex:0 0 330px;align-self:center;height:400px;box-sizing:border-box;border-radius:8px;background:#f1efea;color:#111110;padding:22px 22px 18px;display:flex;flex-direction:column;transform:rotate(-3deg);box-shadow:0 40px 80px -30px #000;position:relative}
.bib .top{font-family:M;font-size:12px;letter-spacing:.14em;display:flex;justify-content:space-between;gap:12px;text-transform:uppercase}.bib .top span:last-child{white-space:nowrap}
.bib .bar{height:9px;background:#111110;margin-top:10px}
.bib .res{flex:1;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:12px}
.bib .n{font-family:A;font-stretch:62%;font-weight:800;font-size:${r.result && r.result.length > 5 ? 96 : 130}px;line-height:.85}
.bib .g{font-family:M;font-size:15px;letter-spacing:.14em;text-transform:uppercase}
.bib .s{font-family:M;font-size:12px;letter-spacing:.14em;text-align:center;border-top:2px dashed #111110;padding-top:10px;text-transform:uppercase}
.pin{position:absolute;width:12px;height:12px;border-radius:50%;background:radial-gradient(circle at 35% 35%,#fff,#7d8086 70%)}
</style></head><body><div class="c">
<div class="left"><div><div class="l">${esc(KIND[r.type] ?? 'Writing')} · ${date}</div><h1>${esc(r.title)}</h1></div><div class="l">richtermax.com · Maximilian Richter</div></div>
<div class="bib"><span class="pin" style="top:8px;left:8px"></span><span class="pin" style="top:8px;right:8px"></span><span class="pin" style="bottom:8px;left:8px"></span><span class="pin" style="bottom:8px;right:8px"></span>
<div class="top"><span>${esc(r.race ?? 'On track')}</span><span>No. 204</span></div><div class="bar"></div>
<div class="res"><div class="n">${esc(r.result ?? '204')}</div>${goal ? `<div class="g">${esc(goal)}</div>` : ''}</div>
<div class="s">Richter · ${esc(r.distance ?? 'On track')}</div></div>
</div></body></html>`;
}

async function main() {
  const entries = [...LEGACY];
  for (const f of await fs.readdir(REPORTS)) {
    if (!f.endsWith('.md')) continue;
    const fm = frontmatter(await fs.readFile(path.join(REPORTS, f), 'utf8'));
    if (fm.draft === 'true') continue;
    entries.push({ slug: f.replace(/\.md$/, ''), ...fm });
  }
  await fs.mkdir(OUT, { recursive: true });
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1200, height: 630 } });
  // A file:// page, so the local font files may load.
  const tmp = path.join(await fs.mkdtemp(path.join(os.tmpdir(), 'og-')), 'card.html');
  for (const r of entries) {
    await fs.writeFile(tmp, html(r));
    await page.goto(`file://${tmp}`, { waitUntil: 'load' });
    await page.evaluate(() => document.fonts.ready);
    await page.screenshot({ path: path.join(OUT, `${r.slug}.png`) });
    console.log('✓', r.slug);
  }
  await browser.close();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
