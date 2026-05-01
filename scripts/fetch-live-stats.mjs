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

// Returns an array of 12 numbers — total km per ISO week, oldest
// first, ending in the current week. Used to draw a sparkline bar
// chart in the STATS section so the "27 weeks streak" headline has
// something to back it up visually.
function weeklyKmLast12(activities) {
  const buckets = new Map(); // "YYYY-Www" → km
  for (const a of activities) {
    if (!a.distance) continue;
    const wk = isoYearWeek(new Date(a.start_date));
    buckets.set(wk, (buckets.get(wk) || 0) + a.distance / 1000);
  }
  const cursor = new Date();
  const out = [];
  for (let i = 11; i >= 0; i--) {
    const d = new Date(cursor);
    d.setDate(d.getDate() - 7 * i);
    const wk = isoYearWeek(d);
    out.push(Math.round((buckets.get(wk) || 0) * 10) / 10);
  }
  return out;
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
    streakWeeks:     computeWeekStreak(acts),
    sessionsThisYear,
    lastRun:         pickLastRun(acts),
    weeklyKmLast12:  weeklyKmLast12(acts),
  };
}

async function fetchLatestPushedRepo() {
  // Returns the public repo with the most recent push, plus the
  // first line of its newest commit message. Powers the
  // "currently shipping" indicator in the redesigned STATS section.
  if (!GITHUB_TOKEN) return null;
  const query = `
    query($login: String!) {
      user(login: $login) {
        repositories(
          first: 1,
          ownerAffiliations: OWNER,
          isFork: false,
          privacy: PUBLIC,
          orderBy: { field: PUSHED_AT, direction: DESC }
        ) {
          nodes {
            name
            pushedAt
            url
            defaultBranchRef {
              target {
                ... on Commit {
                  history(first: 1) {
                    nodes { messageHeadline committedDate }
                  }
                }
              }
            }
          }
        }
      }
    }
  `;
  const r = await fetch('https://api.github.com/graphql', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${GITHUB_TOKEN}`,
      'User-Agent': 'richtermax-portfolio-build',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ query, variables: { login: GITHUB_USER } }),
  });
  if (!r.ok) return null;
  const j = await r.json();
  const node = j.data?.user?.repositories?.nodes?.[0];
  if (!node) return null;
  const commit = node.defaultBranchRef?.target?.history?.nodes?.[0];
  return {
    name:        node.name,
    url:         node.url,
    pushedAt:    node.pushedAt,
    headline:    commit?.messageHeadline ?? null,
    commitDate:  commit?.committedDate   ?? node.pushedAt,
  };
}

async function fetchGitHubCommits30d() {
  // GraphQL contributionsCollection — same number that drives the
  // green heatmap on github.com/<user>. Includes private repos when
  // the user has "Include private contributions on my profile"
  // enabled in their GitHub settings. Far more representative than
  // search/commits, which is public-only and index-lagged.
  if (!GITHUB_TOKEN) {
    throw new Error('GITHUB_TOKEN missing — keeping previous commit count.');
  }
  const to   = new Date();
  const from = new Date(Date.now() - 30 * 86400000);

  const query = `
    query($login: String!, $from: DateTime!, $to: DateTime!) {
      user(login: $login) {
        contributionsCollection(from: $from, to: $to) {
          totalCommitContributions
          contributionCalendar { totalContributions }
        }
      }
    }
  `;

  const r = await fetch('https://api.github.com/graphql', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${GITHUB_TOKEN}`,
      'User-Agent': 'richtermax-portfolio-build',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      query,
      variables: {
        login: GITHUB_USER,
        from: from.toISOString(),
        to:   to.toISOString(),
      },
    }),
  });
  if (!r.ok) throw new Error(`GitHub GraphQL: ${r.status} ${await r.text()}`);
  const j = await r.json();
  if (j.errors?.length) throw new Error(`GitHub GraphQL: ${JSON.stringify(j.errors)}`);

  const cc = j.data?.user?.contributionsCollection;
  if (!cc) throw new Error('GitHub GraphQL: no contributionsCollection in response.');

  // Prefer the calendar total (commits + PRs + issues + reviews) over
  // commits-only — same number visitors see on the green heatmap and
  // less prone to under-counting when commit author-email doesn't match
  // the GitHub user (a common gotcha after a username rename: old
  // commits stay tied to the previous noreply email and don't roll up
  // to the renamed profile).
  const total = cc.contributionCalendar?.totalContributions
             ?? cc.totalCommitContributions
             ?? 0;

  // Sanity floor: anything under 5 is almost certainly the underrun
  // we're trying to avoid (auth/email-attribution issue), not a real
  // sub-5 month. Keep the previous value rather than ship a misleading
  // small number.
  if (typeof total !== 'number' || total < 5) {
    throw new Error(`GitHub returned ${total} contributions — treating as under-counting, keeping previous value.`);
  }
  return total;
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
    const commits30d   = await fetchGitHubCommits30d();
    const latestRepo   = await fetchLatestPushedRepo();
    snapshot.github = {
      commits30d,
      latestRepo: latestRepo ?? snapshot.github?.latestRepo ?? null,
    };
    console.log(`✓ GitHub: ${commits30d} commits / 30d${latestRepo ? `, latest push → ${latestRepo.name}` : ''}`);
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
