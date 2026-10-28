#!/usr/bin/env node
// fetch-tabletennis.mjs — the table tennis season from myTischtennis
// (click-TT), once a week (Monday, refresh-tabletennis.yml), two requests:
//  1. the team's public "Spielerbilanzen" page → own singles record, table
//     position, next match. Other players never leave the page.
//  2. Max's public player portrait → Q-TTR (the official quarterly value).
//     The day-to-day TTR is only shown after login, so it stays by hand
//     (`ttr`, optional; if set, the site shows it instead of the Q-TTR).
//
// myTT shows a "are you human?" page to busy clients. One run = two
// requests, 15 s apart; if either is blocked or can't be parsed, that part
// of the previous snapshot stays.

import { promises as fs } from 'node:fs';
import path from 'node:path';

const OUT = path.resolve(process.cwd(), 'src/data/tabletennis.json');
const SEASON = '2026/27';
const URL =
  'https://www.mytischtennis.de/click-tt/ByTTV/26--27/ligen/gruppe/523733/mannschaft/3115844/DJK_Seifriedsberg/spielerbilanzen/gesamt';
const PORTRAIT = 'https://www.mytischtennis.de/click-tt/spieler/PD9D9D021/spielerportrait';
const ME = /Richter/i;
const UA = { 'User-Agent': 'richtermax.com season stats (2 requests/week)' };
const BLOCKED = /Gleich gehts weiter|dass du ein Mensch bist/;
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
      const col = (...names) => names.map((n) => bil.head.indexOf(n)).find((i) => i >= 0) ?? -1;
      const get = (...names) => (col(...names) >= 0 ? (row[col(...names) + shift] ?? null) : null);
      me = {
        position: get('Rang'),
        matches: Number(get('E', 'Einsätze')) || 0,
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

/** Portrait text: "… Q-TTR-Wert 1757 TTR-Wert 1234 …" — the second number is a
 *  placeholder for logged-out visitors, so only the Q-TTR is read. */
function parseQttr(html) {
  const text = decode(html.replace(/<script[\s\S]*?<\/script>/g, ''));
  const m = text.match(/Q-TTR-Wert\s+(\d{3,4})\b/);
  if (!m) throw new Error('no Q-TTR on the portrait');
  return Number(m[1]);
}

async function page(url) {
  const r = await fetch(url, { headers: UA });
  if (!r.ok) throw new Error(`HTTP ${r.status}`);
  const html = await r.text();
  if (BLOCKED.test(html)) throw new Error('myTT bot check, try next week');
  return html;
}

async function main() {
  let snap = {};
  try {
    snap = JSON.parse(await fs.readFile(OUT, 'utf8'));
  } catch {}
  const base = {
    season: SEASON,
    league: 'Landesliga Westsüdwest',
    team: TEAM,
    source: URL,
    // hand-kept (myTT shows the live TTR only after login); never overwritten
    ttr: snap.ttr ?? null,
    ttrAsOf: snap.ttrAsOf ?? null,
  };
  let changed = false;
  try {
    const data = parse(await page(URL));
    Object.assign(snap, base, data);
    changed = true;
    console.log('✓ Table tennis, team page:', JSON.stringify(data));
  } catch (e) {
    console.warn('⚠ Table tennis, team page: keeping previous —', e.message);
  }
  await new Promise((r) => setTimeout(r, 15_000));
  try {
    const qttr = parseQttr(await page(PORTRAIT));
    if (qttr !== snap.qttr) snap.qttrAsOf = new Date().toISOString().slice(0, 10);
    Object.assign(snap, base, { qttr });
    changed = true;
    console.log('✓ Table tennis, Q-TTR:', qttr);
  } catch (e) {
    console.warn('⚠ Table tennis, portrait: keeping previous —', e.message);
  }
  if (!changed) return;
  snap.updatedAt = new Date().toISOString();
  await fs.writeFile(OUT, JSON.stringify(snap, null, 2) + '\n');
}

// Allow `node fetch-tabletennis.mjs --test file.html` for local checks.
if (process.argv[2] === '--test') {
  const html = await fs.readFile(process.argv[3], 'utf8');
  console.log(JSON.stringify(/Q-TTR-Wert/.test(html) ? { qttr: parseQttr(html) } : parse(html), null, 2));
} else {
  await main();
}
