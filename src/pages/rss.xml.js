import rss from '@astrojs/rss';
import { SITE } from '@data/site';
import { sortedPosts } from '@data/blog-posts';

// /rss.xml — RSS 2.0 feed of blog posts. Source of truth is the
// manifest in src/data/blog-posts.ts; new posts appear here as soon
// as they're added there. Discovery handled via the
// <link rel="alternate" type="application/rss+xml"> tag in BaseLayout.

export async function GET(context) {
  const items = sortedPosts().map((p) => ({
    title:        p.title,
    description:  p.description,
    pubDate:      new Date(p.pubDate),
    link:         `/blog/${p.slug}/`,
    categories:   p.category ? [p.category] : undefined,
  }));

  return rss({
    title:        `${SITE.name} — Blog`,
    description:  'Field notes from a security engineer. Tools, training, travel.',
    site:         context.site ?? SITE.url,
    items,
    customData:   `<language>en</language><copyright>© ${new Date().getFullYear()} ${SITE.name}</copyright>`,
    stylesheet:   '/rss/styles.xsl',
  });
}
