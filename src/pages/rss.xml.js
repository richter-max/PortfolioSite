import rss from '@astrojs/rss';
import { sortedPosts } from '../data/posts';
import { SITE } from '../data/site';

export async function GET(context) {
  const posts = await sortedPosts();
  return rss({
    title: SITE.title,
    description: SITE.description,
    site: context.site,
    trailingSlash: false, // the site serves /blog/x, /blog/x/ redirects
    items: posts.map((p) => ({
      title: p.title,
      description: p.description,
      link: `/blog/${p.slug}`,
      pubDate: new Date(p.pubDate),
    })),
  });
}
