// blog-posts.ts — manifest of published blog posts.
// The RSS feed and any future blog index read from here. Add a new
// entry when you publish a new post under src/pages/blog/<slug>.astro.

export interface BlogPost {
  slug: string;          // matches src/pages/blog/<slug>.astro
  title: string;
  description: string;
  /** ISO date — used for RSS pubDate and sorting (newest first). */
  pubDate: string;
  /** Display label, e.g. "MARCH 2026" or "FIELD". */
  category?: string;
  /** "≈ 4 min" — used in RSS extras. */
  readTime?: string;
}

export const posts: BlogPost[] = [
  {
    slug: 'two-weeks-in-shenzhen',
    title: 'Two weeks in Shenzhen.',
    description:
      'An exchange program through Berufsschule 1 Kempten and Shenzhen University of Information Technology. The drone license was the least interesting thing I brought home.',
    pubDate: '2026-03-15',
    category: 'NOTE',
    readTime: '4 min',
  },
];

/** Sorted newest-first. Source-of-truth ordering used by RSS + index. */
export function sortedPosts(): BlogPost[] {
  return [...posts].sort(
    (a, b) => new Date(b.pubDate).getTime() - new Date(a.pubDate).getTime(),
  );
}
