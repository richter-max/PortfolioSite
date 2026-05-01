#!/usr/bin/env node
// fetch-live-stats.mjs
// Build-time data fetcher. Pulls a curated handful of numbers from
// Strava and GitHub and snapshots them to src/data/live-stats.json.
// The site reads that JSON statically at SSG time — no client-side
// API calls, no tokens in the browser.
//
// Failure mode is intentionally soft: if any env var is missing or
// any HTTP call fails, we DO NOT overwrite the existing JSON. The
// previous successful snapshot keeps shipping. The build never fails
// because the API was rate-limited at 04:00.

import { promises as fs } from 'node:fs';
import path from 'node:path';

const OUT = path.resolve(process.cwd(), 'src/data/live-stats.json');

// ── Strava ────────────────────────────────────────────────────────────
const STRAVA_CLIENT_ID     = process.env.STRAVA_CLIENT_ID;
const STRAVA_CLIENT_SECRET = process.env.STRAVA_CLIENT_SECRET;
const STRAVA_REFRESH_TOKEN = process.env.STRAVA_REFRESH_TOKEN;

// ── GitHub ────────────────────────────────────────────────────────────
const GITHUB_USER  = process.env.GITHUB_USER  || 'richter-max';
const GITHUB_TOKEN = process.env.GITHUB_TOKEN; // optional — boosts rate limit

async function refreshStravaAccessToken() {
  const r = await fetch('https://www.strava.com/api/v3/oauth/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      client_id:     STRAVA_CLIENT_ID,
      client_secret: STRAVA_CLIENT_SECRET,
      refresh_token: STRAVA_REFRESH_TOKEN,
      grant_type:    'refresh_token',
    }),
  });
  if (!r.ok) throw new Error(`Strava token refresh failed: ${r.status} ${await r.text()}`);
  const j = await r.json();
  return j.access_token;
}

async function fetchAllStravaActivities(token, afterEpoch) {
  // Strava paginates at 200 per page. Walk until we get a short page.
  const out = [];
  for (let page = 1; page < 20; page++) {
    const url = `https://www.strava.com/api/v3/athlete/activities?after=${afterEpoch}&per_page=200&page=${page}`;
    const r = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
    if (!r.ok) throw new Error(`Strava activities page ${page}: ${r.status}`);
    const arr = await r.json();
    out.push(...arr);
    if (arr.length < 200) break;
  }
  return out;
}

// Returns the count of consecutive ISO weeks ending this week that
// contain at least one activity. "Streak" in the gym-discipline sense.
function computeWeekStreak(activities) {
  const weeks = new Set();
  for (const a of activities) {
    const d = new Date(a.start_date);
    weeks.add(isoYearWeek(d));
  }
  let streak = 0;
  let cursor = new Date();
  for (let i = 0; i < 520; i++) {
    const wk = isoYearWeek(cursor);
    if (weeks.has(wk)) streak++;
    else if (streak > 0) break;
    cursor.setDate(cursor.getDate() - 7);
  }
  return streak;
}

function isoYearWeek(d) {
  // Returns "YYYY-Www" — ISO 8601 week.
  const t = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
  const day = t.getUTCDay() || 7;
  t.setUTCDate(t.getUTCDate() + 4 - day);
  const yearStart = new Date(Date.UTC(t.getUTCFullYear(), 0, 1));
  const week = Math.ceil(((t - yearStart) / 86400000 + 1) / 7);
  return `${t.getUTCFullYear()}-W${String(week).padStart(2, '0')}`;
}

function pickLastRun(activities) {
  const runs = activities
    .filter((a) => a.type === 'Run' || a.sport_type === 'Run' || a.sport_type === 'TrailRun')
    .sort((a, b) => new Date(b.start_date) - new Date(a.start_date));
  if (!runs.length) return null;
  const r = runs[0];
  const d = new Date(r.start_date_local || r.start_date);
  return {
    weekday: d.toLocaleDateString('en-US', { weekday: 'long' }),
    km:      Math.round((r.distance / 1000) * 10) / 10,
    isoDate: d.toISOString().slice(0, 10),
  };
}

async function fetchStrava() {
  if (!STRAVA_CLIENT_ID || !STRAVA_CLIENT_SECRET || !STRAVA_REFRESH_TOKEN) {
    throw new Error('Strava env vars missing — keeping previous snapshot.');
  }
  const token = await refreshStravaAccessToken();
  // 18 months back covers any reasonable streak window.
  const after = Math.floor(Date.now() / 1000) - 60 * 60 * 24 * 550;
  const acts = await fetchAllStravaActivities(token, after);

  const yearStart = new Date(Date.UTC(new Date().getUTCFullYear(), 0, 1)).getTime();
  const sessionsThisYear = acts.filter(
    (a) => new Date(a.start_date).getTime() >= yearStart,
  ).length;

  return {
    streakWeeks: computeWeekStreak(acts),
    sessionsThisYear,
    lastRun: pickLastRun(acts),
  };
}

async function fetchGitHubCommits30d() {
  // Counts commits the user authored across all public repos in the
  // last 30 days. Search API needs auth to be reliable — anonymous
  // queries return 0 for many users (index visibility constraints).
  // We require a PAT and bail out otherwise so the fallback value
  // keeps shipping.
  if (!GITHUB_TOKEN) {
    throw new Error('GITHUB_TOKEN missing — keeping previous commit count.');
  }
  const since = new Date(Date.now() - 30 * 86400000).toISOString().slice(0, 10);
  const url = `https://api.github.com/search/commits?q=author:${GITHUB_USER}+author-date:%3E${since}&per_page=1`;
  const r = await fetch(url, {
    headers: {
      Accept: 'application/vnd.github.cloak-preview+json',
      'User-Agent': 'richtermax-portfolio-build',
      Authorization: `Bearer ${GITHUB_TOKEN}`,
    },
  });
  if (!r.ok) throw new Error(`GitHub search/commits: ${r.status} ${await r.text()}`);
  const j = await r.json();
  // Sanity guard: a return of 0 is nearly always a transient API
  // failure for an active user. Treat it as "don't update" rather
  // than overwriting a real number with a misleading zero.
  if (typeof j.total_count !== 'number' || j.total_count === 0) {
    throw new Error('GitHub search returned 0 — treating as transient and keeping previous value.');
  }
  return j.total_count;
}

async function main() {
  // Read existing snapshot — used as the persistent fallback if anything
  // fetched here fails. Never overwrite with partial data.
  let snapshot;
  try {
    snapshot = JSON.parse(await fs.readFile(OUT, 'utf8'));
  } catch {
    snapshot = {
      strava: { streakWeeks: 0, sessionsThisYear: 0, lastRun: null },
      github: { commits30d: 0 },
    };
  }
  delete snapshot._note;

  const errors = [];

  try {
    snapshot.strava = await fetchStrava();
    console.log(`✓ Strava: streak=${snapshot.strava.streakWeeks}w, sessions=${snapshot.strava.sessionsThisYear}, lastRun=${snapshot.strava.lastRun?.weekday} ${snapshot.strava.lastRun?.km}km`);
  } catch (e) {
    errors.push(`Strava: ${e.message}`);
  }

  try {
    snapshot.github = { commits30d: await fetchGitHubCommits30d() };
    console.log(`✓ GitHub: ${snapshot.github.commits30d} commits / 30d`);
  } catch (e) {
    errors.push(`GitHub: ${e.message}`);
  }

  snapshot.updatedAt = new Date().toISOString();

  await fs.writeFile(
    OUT,
    JSON.stringify(snapshot, null, 2) + '\n',
    'utf8',
  );

  if (errors.length) {
    console.warn('⚠ Some fetches failed — keeping previous values for those:');
    for (const e of errors) console.warn('  ·', e);
  }

  // Exit 0 even on partial failure — the build must never fail because
  // an external API was slow. The site keeps shipping the last good
  // snapshot for any source we couldn't reach.
}

main().catch((e) => {
  console.error('fetch-live-stats: unexpected fatal error —', e);
  // Still exit 0 so build proceeds with prior snapshot.
  process.exit(0);
});
