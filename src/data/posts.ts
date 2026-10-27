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
  },
  {
    slug: 'building-aegis',
    title: 'Six lessons from AEGIS.',
    description:
      'What building a deterministic security evaluation harness for ' +
      'tool-using AI agents actually taught me — about decisions, scope, ' +
      'and the discipline of staying boring.',
    pubDate: '2026-04-25',
    revised: '2026-09-01',
    readTime: '8 min',
  },
  {
    slug: 'public-by-accident',
    title: 'Public, by accident.',
    description:
      'What strangers can pull from your social media. The gap between ' +
      'sharing one thing and revealing another — and what to actually do ' +
      'about it.',
    pubDate: '2026-03-14',
    readTime: '7 min',
  },
  {
    slug: 'ausbildung-first',
    title: 'Ausbildung first.',
    description:
      'Why I did the German vocational route before going to university — ' +
      'and why I\u2019m starting the university part now anyway. Practice ' +
      'first, theory second.',
    pubDate: '2026-07-22',
    readTime: '6 min',
  },
];

/**
 * All published posts: the hand-written ones above plus every non-draft
 * entry of the `reports` collection. Sorted by the date the post last
 * changed — a revision counts.
 */
export async function sortedPosts(): Promise<Post[]> {
  const reports = await getCollection('reports', ({ data }) => !data.draft);
  const fromReports: Post[] = reports.map((r) => ({
    slug: r.id,
    title: r.data.title,
    description: r.data.summary,
    pubDate: r.data.date.toISOString().slice(0, 10),
    readTime: `${Math.max(1, Math.round((r.body ?? '').split(/\s+/).length / 200))} min`,
  }));
  const eff = (p: Post) => new Date(p.revised ?? p.pubDate).getTime();
  return [...posts, ...fromReports].sort((a, b) => eff(b) - eff(a));
}
