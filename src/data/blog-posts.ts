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
  /** Track for visual styling on the homepage drift + post-meta. */
  kind: 'SEC' | 'FLD' | 'NTE';
}

export const posts: BlogPost[] = [
  {
    slug: 'crewing-greenloop',
    title: 'The trade.',
    description:
      "He's crewing me at Kraichgau. I'm crewing him at Greenloop. One week between — a fair exchange between two people on parallel arcs. Notes before the start line.",
    pubDate: '2026-05-15',
    category: 'FIELD',
    readTime: '5 min',
    kind: 'FLD',
  },
  {
    slug: 'ausbildung-first',
    title: 'Ausbildung first.',
    description:
      "Why I did the German vocational route before going to university — and why I'm starting the university part now anyway. Practice first, theory second.",
    pubDate: '2026-04-30',
    category: 'NOTE',
    readTime: '6 min',
    kind: 'NTE',
  },
  {
    slug: 'building-aegis',
    title: 'Six lessons from AEGIS.',
    description:
      'What a year of building a deterministic security evaluation harness for tool-using AI agents actually taught me — about decisions, scope, and the discipline of staying boring.',
    pubDate: '2026-04-25',
    category: 'SECURITY',
    readTime: '8 min',
    kind: 'SEC',
  },
  {
    slug: 'public-by-accident',
    title: 'Public, by accident.',
    description:
      'What strangers can pull from your social media. The gap between sharing one thing and revealing another — and what to actually do about it.',
    pubDate: '2026-04-20',
    category: 'SECURITY',
    readTime: '7 min',
    kind: 'SEC',
  },
  {
    slug: 'why-not-notion',
    title: "Why I didn't use Notion.",
    description:
      'What you give up when you let a hosted platform ship your portfolio for you. The case for owning the build, and the case for not.',
    pubDate: '2026-04-15',
    category: 'SECURITY',
    readTime: '5 min',
    kind: 'SEC',
  },
  {
    slug: 'tt-season-2025-26',
    title: 'Eighty-seven points.',
    description:
      "From 1670 to 1757. DJK Seifriedsberg's third Landesliga season — and the first one we finished mid-table. Notes on a year of giving up trying to be unorthodox.",
    pubDate: '2026-04-08',
    category: 'FIELD',
    readTime: '5 min',
    kind: 'FLD',
  },
  {
    slug: 'two-weeks-in-shenzhen',
    title: 'Two weeks in Shenzhen.',
    description:
      'An exchange program through Berufsschule 1 Kempten and Shenzhen University of Information Technology. The drone license was the least interesting thing I brought home.',
    pubDate: '2026-03-15',
    category: 'NOTE',
    readTime: '4 min',
    kind: 'NTE',
  },
];

/** Sorted newest-first. Source-of-truth ordering used by RSS + index. */
export function sortedPosts(): BlogPost[] {
  return [...posts].sort(
    (a, b) => new Date(b.pubDate).getTime() - new Date(a.pubDate).getTime(),
  );
}
