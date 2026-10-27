// content.config.ts — the two collections the site is built from.
//
// races:   one Markdown file per start, past or upcoming. The season list,
//          the results table and the next-start countdown all read from here.
//          After a race: add `result` (and `report` once it is written).
// reports: race reports, short reports, monthly updates, previews.
//          `draft: true` keeps an entry out of production builds.

import { defineCollection, reference } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

const races = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/races' }),
  schema: z.object({
    name: z.string(),
    /** ISO date. For month precision use any day in the month and set datePrecision. */
    date: z.coerce.date(),
    datePrecision: z.enum(['day', 'month']).default('day'),
    /** e.g. "42.195 km" or "3.8 / 180 / 42.2 km" */
    format: z.string(),
    /** Honest target, the way you'd say it. */
    goal: z.string().optional(),
    /** Official finish time once the race is done. */
    result: z.string().optional(),
    /** One plain line of context. */
    note: z.string().optional(),
    /** How much the race matters this season. */
    weight: z.enum(['main', 'high', 'side', 'open']).default('high'),
    report: reference('reports').optional(),
    /** Link to a report that is not in the collection yet (older .astro posts). */
    reportUrl: z.string().optional(),
  }),
});

const reports = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/reports' }),
  schema: ({ image }) =>
    z.object({
      title: z.string(),
      date: z.coerce.date(),
      type: z.enum(['race-report', 'short-report', 'monthly-update', 'preview']),
      summary: z.string(),
      race: z.string().optional(),
      distance: z.string().optional(),
      goal: z.string().optional(),
      result: z.string().optional(),
      image: image().optional(),
      imageAlt: z.string().optional(),
      imageCredit: z.string().optional(),
      draft: z.boolean().default(false),
    }),
});

export const collections = { races, reports };
