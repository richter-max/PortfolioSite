// races.ts — one source of truth for competition data.
// The hero's "next start" block and the sport section both read from
// here. The next-start block picks the first entry in `upcoming` whose
// date hasn't passed — at build time and again on the client — so an
// expired countdown structurally cannot happen: when a date passes,
// the block advances to the next event on its own, and hides itself
// if the list runs out.
//
// After a race: move the entry to `results` with the finish time.
// That is the only manual step, and it is an edit you'd want to make
// anyway.

export interface UpcomingRace {
  name: string;
  /** ISO date of race day. Day precision only — no invented start times. */
  date: string;
  /** e.g. "42.195 KM" or "FULL DISTANCE" */
  format: string;
  /** Honest target, stated the way you'd say it. Omit if none given. */
  target?: string;
}

export interface RaceResult {
  name: string;
  date: string; // ISO
  format: string;
  result: string;
  /** One plain line of context. No excuses, no drama. Optional. */
  note?: string;
  /** Race report, if one was written. Links the row to the post. */
  href?: string;
}

export const upcoming: UpcomingRace[] = [
  {
    name: 'Berlin Marathon',
    date: '2026-09-27',
    format: '42.195 KM',
    target: 'SUB-3:00',
  },
  {
    name: 'Ironman Frankfurt',
    date: '2027-06-27',
    format: 'FULL DISTANCE',
    // target intentionally unset — none given yet
  },
];

export const results: RaceResult[] = [
  {
    name: 'Ironman 70.3 Kraichgau',
    date: '2026-05-31',
    format: '1.9 / 90 / 21.1',
    result: '6:52:07',
    note: 'Both legs cramped 400 m into the swim. Finished.',
    href: '/blog/ironman-kraichgau',
  },
];
