// races.ts — adapter from the `races` collection (src/content/races) to the
// shapes the components use. One Markdown file per start is the single
// source of truth; this file only sorts and formats.
//
// The next-start block picks the first upcoming race whose date hasn't
// passed, at build time and again on the client, so an expired countdown
// cannot happen. A race moves from upcoming to results by getting a
// `result` in its file.

import { getCollection } from 'astro:content';

export interface UpcomingRace {
  name: string;
  /** ISO date of race day (day precision) or any day in the month (month precision). */
  date: string;
  /** "25 APR 2027" or "AUG 2027" — never more precise than the data. */
  dateLabel: string;
  datePrecision: 'day' | 'month';
  format: string;
  target?: string;
  weight: 'main' | 'high' | 'side' | 'open';
}

export interface RaceResult {
  name: string;
  date: string;
  dateLabel: string;
  format: string;
  result: string;
  note?: string;
  href?: string;
}

const MONTHS = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];

const iso = (d: Date) => d.toISOString().slice(0, 10);
const label = (d: Date, precision: 'day' | 'month') =>
  precision === 'month'
    ? `${MONTHS[d.getUTCMonth()]} ${d.getUTCFullYear()}`
    : `${d.getUTCDate()} ${MONTHS[d.getUTCMonth()]} ${d.getUTCFullYear()}`;

export async function getRaces(): Promise<{ upcoming: UpcomingRace[]; results: RaceResult[] }> {
  // Link a result to its report only if that report is actually built
  // (drafts exist in dev only), so production never gets a dead link.
  const published = new Set(
    (await getCollection('reports', ({ data }) => import.meta.env.DEV || !data.draft)).map((r) => r.id),
  );
  const entries = (await getCollection('races')).sort(
    (a, b) => a.data.date.getTime() - b.data.date.getTime(),
  );

  const upcoming: UpcomingRace[] = entries
    .filter((e) => !e.data.result)
    .map((e) => ({
      name: e.data.name,
      date: iso(e.data.date),
      dateLabel: label(e.data.date, e.data.datePrecision),
      datePrecision: e.data.datePrecision,
      format: e.data.format,
      target: e.data.goal,
      weight: e.data.weight,
    }));

  const results: RaceResult[] = entries
    .filter((e) => e.data.result)
    .reverse()
    .map((e) => ({
      name: e.data.name,
      date: iso(e.data.date),
      dateLabel: label(e.data.date, 'day'),
      format: e.data.format,
      result: e.data.result!,
      note: e.data.note,
      href:
        e.data.report && published.has(e.data.report.id) ? `/blog/${e.data.report.id}` : e.data.reportUrl,
    }));

  return { upcoming, results };
}
