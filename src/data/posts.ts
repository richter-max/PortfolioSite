// posts.ts — manifest of published posts. A short list of strong ones
// instead of a long mixed one. The homepage Writing section, /blog, and
// the RSS feed all read from here.

import { getCollection } from 'astro:content';

export interface Post {
  slug: string;
  title: string;
  description: string;
  pubDate: string; // ISO
  readTime: string;
  /** Short label for lists: "Race report", "Short report", … */
  kind: string;
  /** Set when the post was substantively revised after publication. */
  revised?: string; // ISO
}

export const posts: Post[] = [
  {
    slug: 'ironman-kraichgau',
    title: 'Ironman 70.3 Kraichgau.',
    description:
      '6:52:07 against a 5:30 plan. Both legs cramped 400 m into the ' +
      'swim and never released. Four times I nearly stopped \u2014 and ' +
      'none of the four were about the pain.',
    pubDate: '2026-06-18',
    readTime: '7 min',
    kind: 'Race report',
  },
];

/**
 * All published posts: the hand-written ones above plus every non-draft
 * entry of the `reports` collection. Sorted by the date the post last
 * changed — a revision counts.
 */
const KIND = {
  'race-report': 'Race report',
  'short-report': 'Short report',
  'monthly-update': 'Monthly update',
  preview: 'Preview',
} as const;

export async function sortedPosts(): Promise<Post[]> {
  const reports = await getCollection('reports', ({ data }) => !data.draft);
  const fromReports: Post[] = reports.map((r) => ({
    slug: r.id,
    title: r.data.title,
    description: r.data.summary,
    pubDate: r.data.date.toISOString().slice(0, 10),
    readTime: `${Math.max(1, Math.round((r.body ?? '').split(/\s+/).length / 200))} min`,
    kind: KIND[r.data.type],
  }));
  const eff = (p: Post) => new Date(p.revised ?? p.pubDate).getTime();
  return [...posts, ...fromReports].sort((a, b) => eff(b) - eff(a));
}
