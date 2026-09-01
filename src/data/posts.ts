// posts.ts — manifest of published posts. Three strong ones instead of
// seven mixed ones. The homepage Writing section, /blog, and the RSS
// feed all read from here.

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
    pubDate: '2026-04-20',
    readTime: '7 min',
  },
  {
    slug: 'ausbildung-first',
    title: 'Ausbildung first.',
    description:
      'Why I did the German vocational route before going to university — ' +
      'and why I\u2019m starting the university part now anyway. Practice ' +
      'first, theory second.',
    pubDate: '2026-04-30',
    readTime: '6 min',
  },
];

export function sortedPosts(): Post[] {
  return [...posts].sort(
    (a, b) => new Date(b.pubDate).getTime() - new Date(a.pubDate).getTime(),
  );
}
