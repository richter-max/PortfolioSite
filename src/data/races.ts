// races.ts — adapter from the `races` collection (src/content/races) to the
// shapes the components use. One Markdown file per start is the single
// source of truth; this file only sorts and formats.
//
// The next-start block picks the first upcoming race whose date hasn't
// passed, at build time and again on the client, so an expired countdown
// cannot happen. A race moves from upcoming to results by getting a
// `result` in its file.

import { getCollection } from 'astro:content';
import type { ImageMetadata } from 'astro';

export interface UpcomingRace {
  name: string;
  /** ISO date of race day (day precision) or any day in the month (month precision). */
  date: string;
  /** "25 APR 2027" or "AUG 2027" — never more precise than the data. */
  dateLabel: string;
  datePrecision: 'day' | 'month';
  format: string;
  target?: string;
  note?: string;
  weight: 'main' | 'high' | 'side' | 'open';
  image?: ImageMetadata;
  imageAlt?: string;
  caption?: string;
  captionRight?: string;
  cardFigure?: string;
}

export interface RaceResult {
  name: string;
  date: string;
  dateLabel: string;
  format: string;
  result: string;
  /** Planned or goal time, if the goal was a time ("5:30", "Sub-3:00"). */
  goal?: string;
  note?: string;
  href?: string;
  image?: ImageMetadata;
  imageAlt?: string;
  caption?: string;
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
      note: e.data.note,
      weight: e.data.weight,
      image: e.data.image,
      imageAlt: e.data.imageAlt,
      caption: e.data.caption,
      captionRight: e.data.captionRight,
      cardFigure: e.data.cardFigure,
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
      goal: e.data.goal,
      note: e.data.note,
      image: e.data.image,
      imageAlt: e.data.imageAlt,
      caption: e.data.caption,
      href:
        e.data.report && published.has(e.data.report.id) ? `/blog/${e.data.report.id}` : e.data.reportUrl,
    }));

  return { upcoming, results };
}

/** "6:52:07" → hours; "Sub-3:00" or "5:30" → hours; anything else → null. */
export function toHours(t?: string): number | null {
  const m = t?.match(/(\d+):(\d{2})(?::(\d{2}))?/);
  if (!m) return null;
  return Number(m[1]) + Number(m[2]) / 60 + Number(m[3] ?? 0) / 3600;
}

/** Whole days from today (UTC midnight) to an ISO date; never negative. */
export function daysUntil(iso: string): number {
  const now = new Date();
  const today = Date.UTC(now.getFullYear(), now.getMonth(), now.getDate());
  const [y, m, d] = iso.split('-').map(Number);
  return Math.max(0, Math.round((Date.UTC(y, m - 1, d) - today) / 864e5));
}
