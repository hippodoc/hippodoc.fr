/**
 * /blog/partage/<slug>-<empreinte>.jpg — l'image de partage de chaque article (MIGRATION.md § 9.fl).
 *
 * Fabriquée à la construction par `src/lib/image-partage.mjs` (1 200 × 630 px, JPEG) :
 * un nouvel article a la sienne sans rien faire. Le gabarit d'article la donne en
 * `og:image`, en `twitter:image` et en première image du JSON-LD `Article`, à la même
 * adresse (`nomImagePartage`, même calcul des deux côtés). Un point de terminaison
 * n'entre pas dans le sitemap (seules les pages y sont).
 *
 * L'empreinte change avec le titre, la pastille, la pose ou le dessin de l'image : un
 * aperçu de lien déjà vu (LinkedIn, Facebook, WhatsApp) ne garde pas l'ancienne.
 */
import type { APIRoute, GetStaticPaths } from 'astro';
import { getCollection } from 'astro:content';
import { donneesPartage, imagePartage, nomImagePartage } from '@/lib/image-partage.mjs';

export const getStaticPaths = (async () => {
  const posts = await getCollection('blog');
  const donnees = donneesPartage(posts);
  return posts.map((p) => {
    const d = donnees.get(p.id)!;
    return { params: { slug: nomImagePartage(p.id, d) }, props: d };
  });
}) satisfies GetStaticPaths;

export const GET: APIRoute = async ({ props }) => {
  const jpeg = await imagePartage(props as Parameters<typeof imagePartage>[0]);
  return new Response(new Uint8Array(jpeg), { headers: { 'Content-Type': 'image/jpeg' } });
};
