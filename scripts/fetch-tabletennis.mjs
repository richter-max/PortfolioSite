#!/usr/bin/env node
// fetch-tabletennis.mjs — the table tennis season, from the team's public
// "Spielerbilanzen" page on myTischtennis (click-TT). One request a day,
// run by refresh-live-stats.yml. Only Max's own row, the team's table
// position and the next match are kept; other players never leave the page.
//
// Soft failure like fetch-live-stats.mjs: if the page can't be read or
// parsed, the previous snapshot stays. Hand-kept fields (TTR) are never
// touched by this script.

import { promises as fs } from 'node:fs';
import path from 'node:path';

const OUT = path.resolve(process.cwd(), 'src/data/tabletennis.json');
const SEASON = '2026/27';
const URL =
  'https://www.mytischtennis.de/click-tt/ByTTV/26--27/ligen/gruppe/523733/mannschaft/3115844/DJK_Seifriedsberg/spielerbilanzen/gesamt';
const ME = /Richter/i;
const TEAM = 'DJK Seifriedsberg';

const decode = (s) =>
  s
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&#x27;|&#39;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/\s+/g, ' ')
    .trim();

/** All tables as { head: string[], rows: string[][] }. */
function tables(html) {
  return [...html.matchAll(/<table[\s\S]*?<\/table>/g)].map(([t]) => ({
    head: [...t.matchAll(/<th[^>]*>([\s\S]*?)<\/th>/g)].map((m) => decode(m[1])),
    rows: [...t.matchAll(/<tr[^>]*>([\s\S]*?)<\/tr>/g)]
      .map((m) => [...m[1].matchAll(/<td[^>]*>([\s\S]*?)<\/td>/g)].map((c) => decode(c[1])))
      .filter((r) => r.length),
  }));
}

/** Summary cards: role="group" aria-label="Tabellenplatz 10" → { Tabellenplatz: 10 } */
function cards(html) {
  const out = {};
  for (const m of html.matchAll(/role="group" aria-label="([^"]*?)\s(\d+)"/g)) out[m[1]] = Number(m[2]);
  return out;
}

function parse(html) {
  const t = tables(html);
  const c = cards(html);

  // Player records: the table with a "Name" column.
  const bil = t.find((x) => x.head.includes('Name'));
  let me = null;
  if (bil) {
    const row = bil.rows.find((r) => r.some((cell) => ME.test(cell)));
    if (row) {
      // align header and cells from the right (rows may lack a leading cell)
      const shift = row.length - bil.head.length;
      const get = (name) => row[bil.head.indexOf(name) + shift] ?? null;
      me = {
        position: get('Rang'),
        matches: Number(get('E')) || 0, // Einsätze
        singles: get('Gesamt'), // e.g. "6:2"
      };
    }
  }

  // Next match: first schedule row without a result, today or later.
  const plan = t.find((x) => x.head.includes('Heimmannschaft'));
  let next = null;
  if (plan) {
    const h = plan.head;
    const today = new Date().toISOString().slice(0, 10);
    for (const r of plan.rows) {
      const date = (r[h.indexOf('Datum')] ?? '').match(/(\d{2})\.(\d{2})\.(\d{4})/);
      if (!date) continue;
      const iso = `${date[3]}-${date[2]}-${date[1]}`;
      const result = r[h.indexOf('Spiele')] ?? '';
      if (iso < today || /\d/.test(result)) continue;
      const home = r[h.indexOf('Heimmannschaft')] ?? '';
      const away = r[h.indexOf('Gastmannschaft')] ?? '';
      const isHome = home.includes(TEAM);
      // "20:00 v" → "20:00" (click-TT appends flags like "v" for a moved date)
      const time = (r[h.indexOf('Zeit')] ?? '').match(/\d{1,2}:\d{2}/)?.[0] ?? null;
      next = { date: iso, time, home: isHome, opponent: isHome ? away : home };
      break;
    }
  }

  if (!bil && !plan) throw new Error('No tables found — page layout changed?');
  return {
    tablePlace: c['Tabellenplatz'] ?? null,
    teamWins: c['Siege gesamt'] ?? null,
    me,
    next,
  };
}

async function main() {
  let snap = {};
  try {
    snap = JSON.parse(await fs.readFile(OUT, 'utf8'));
  } catch {}
  try {
    const r = await fetch(URL, { headers: { 'User-Agent': 'richtermax.com season stats (1 request/day)' } });
    if (!r.ok) throw new Error(`HTTP ${r.status}`);
    const data = parse(await r.text());
    snap = {
      season: SEASON,
      league: 'Landesliga Westsüdwest',
      team: TEAM,
      source: URL,
      // hand-kept, from myTischtennis behind login; never overwritten here
      ttr: snap.ttr ?? null,
      ttrAsOf: snap.ttrAsOf ?? null,
      ...data,
      updatedAt: new Date().toISOString(),
    };
    await fs.writeFile(OUT, JSON.stringify(snap, null, 2) + '\n');
    console.log('✓ Table tennis:', JSON.stringify(data));
  } catch (e) {
    console.warn('⚠ Table tennis: keeping previous snapshot —', e.message);
  }
}

// Allow `node fetch-tabletennis.mjs --test file.html` for local checks.
if (process.argv[2] === '--test') {
  const html = await fs.readFile(process.argv[3], 'utf8');
  console.log(JSON.stringify(parse(html), null, 2));
} else {
  await main();
}
