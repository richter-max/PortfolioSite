import rss from '@astrojs/rss';
import { sortedPosts } from '../data/posts';
import { SITE } from '../data/site';

export function GET(context) {
  return rss({
    title: SITE.title,
    description: SITE.description,
    site: context.site,
    items: sortedPosts().map((p) => ({
      title: p.title,
      description: p.description,
      link: `/blog/${p.slug}`,
      pubDate: new Date(p.pubDate),
    })),
  });
}
