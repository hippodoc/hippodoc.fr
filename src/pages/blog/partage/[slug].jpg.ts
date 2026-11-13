/**
 * /blog/partage/<slug>.jpg — l'image de partage de chaque article (MIGRATION.md § 9.fl).
 *
 * Fabriquée à la construction par `src/lib/image-partage.mjs` (1 200 × 630 px, JPEG) :
 * un nouvel article a la sienne sans rien faire. Le gabarit d'article la donne en
 * `og:image`, en `twitter:image` et en première image du JSON-LD `Article`. Un point de
 * terminaison n'entre pas dans le sitemap (seules les pages y sont).
 *
 * La pose de la mascotte suit le rang de l'article dans sa série (ordre des épisodes,
 * puis des dates) : deux articles voisins n'ont pas la même.
 */
import type { APIRoute, GetStaticPaths } from 'astro';
import { getCollection } from 'astro:content';
import { blogSeries } from '@/lib/blog-series';
import { imagePartage } from '@/lib/image-partage.mjs';

export const getStaticPaths = (async () => {
  const posts = await getCollection('blog');
  const rangs = new Map<string, number>();
  for (const s of new Set(posts.map((p) => p.data.seriesId))) {
    posts
      .filter((p) => p.data.seriesId === s)
      .sort((a, b) => (a.data.episodeNumber ?? 0) - (b.data.episodeNumber ?? 0) || a.data.pubDate.getTime() - b.data.pubDate.getTime())
      .forEach((p, i) => rangs.set(p.id, i));
  }
  return posts.map((p) => ({
    params: { slug: p.id },
    props: {
      titre: p.data.title,
      serie: p.data.seriesId,
      nomSerie: blogSeries.find((s) => s.id === p.data.seriesId)?.name ?? p.data.category,
      numero: p.data.seriesId === 'divers' ? null : (p.data.categoryNumber ?? null),
      rang: rangs.get(p.id) ?? 0,
    },
  }));
}) satisfies GetStaticPaths;

export const GET: APIRoute = async ({ props }) => {
  const jpeg = await imagePartage(props as Parameters<typeof imagePartage>[0]);
  return new Response(new Uint8Array(jpeg), { headers: { 'Content-Type': 'image/jpeg' } });
};
