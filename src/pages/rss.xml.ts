/**
 * /rss.xml — flux RSS 2.0 du blog (§ 9.bi).
 *
 * Aucun flux n'existait : /rss.xml, /feed.xml et /blog/rss.xml répondaient 404.
 * Écrit à la main plutôt qu'avec @astrojs/rss : quarante lignes, aucune
 * dépendance de plus, et les liens restent SANS slash final (politique d'URL du
 * site) sans option à ne pas oublier.
 *
 * Contenu : titre et description du frontmatter, jamais le corps — le flux
 * signale les articles, la lecture se fait sur le site.
 */
import type { APIRoute } from 'astro';
import { getCollection } from 'astro:content';
import { SITE_URL } from '@/lib/site';
import { byNewest } from '@/lib/blog-sort';

const echapper = (t: string) =>
  t.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

export const GET: APIRoute = async () => {
  const posts = (await getCollection('blog')).sort(byNewest);
  const derniere = posts[0]?.data.pubDate ?? new Date(0);

  const items = posts
    .map((p) => {
      const url = `${SITE_URL}/blog/${p.id}`;
      return `    <item>
      <title>${echapper(p.data.title)}</title>
      <link>${url}</link>
      <guid isPermaLink="true">${url}</guid>
      <description>${echapper(p.data.description)}</description>
      <pubDate>${p.data.pubDate.toUTCString()}</pubDate>
      <category>${echapper(p.data.category)}</category>
    </item>`;
    })
    .join('\n');

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>Blog Hippodoc</title>
    <link>${SITE_URL}/blog</link>
    <atom:link href="${SITE_URL}/rss.xml" rel="self" type="application/rss+xml" />
    <description>Fiscalité, cotisations URSSAF et CARMF, contrats et vie du remplaçant.</description>
    <language>fr-FR</language>
    <lastBuildDate>${derniere.toUTCString()}</lastBuildDate>
${items}
  </channel>
</rss>
`;
  return new Response(xml, { headers: { 'Content-Type': 'application/rss+xml; charset=utf-8' } });
};
