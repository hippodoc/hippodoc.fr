/**
 * /partage/<page>-<empreinte>.jpg — l'image de partage de chaque page qui en a une (MIGRATION.md § 9.ha).
 *
 * Fabriquée à la construction par le générateur des articles (`src/lib/image-partage.mjs`), d'après
 * `PARTAGE_PAGES` (`src/lib/partage-pages.ts`), à l'adresse que BaseLayout donne en `og:image`
 * (`nomPartagePage`, même calcul des deux côtés). L'image de l'accueil n'en vient pas : c'est un
 * fichier de `public/partage/`. Un point de terminaison n'entre pas dans le sitemap.
 */
import type { APIRoute, GetStaticPaths } from 'astro';
import { imagePartage } from '@/lib/image-partage.mjs';
import { PARTAGE_PAGES, nomPartagePage, type PartagePage } from '@/lib/partage-pages';

export const getStaticPaths = (() =>
  Object.entries(PARTAGE_PAGES).map(([chemin, p]) => ({ params: { nom: nomPartagePage(chemin, p) }, props: p }))) satisfies GetStaticPaths;

export const GET: APIRoute = async ({ props }) => {
  const jpeg = await imagePartage(props as PartagePage);
  return new Response(new Uint8Array(jpeg), { headers: { 'Content-Type': 'image/jpeg' } });
};
