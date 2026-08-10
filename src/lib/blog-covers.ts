/**
 * Résolution des covers d'articles — factorisée depuis blog/index.astro et
 * blog/[slug].astro (phase 3 de la refonte blog), désormais partagée avec les
 * pages de série.
 *
 * Les chemins du frontmatter sont ceux de la SPA source (`/blog/...`) ; ils sont
 * remappés vers `src/assets/blog/` pour passer par le pipeline d'optimisation
 * d'`astro:assets` (WebP + dimensions).
 */
import { getImage } from 'astro:assets';

const blogImages = import.meta.glob<{ default: ImageMetadata }>(
  '/src/assets/blog/**/*.{png,jpg,jpeg,webp}',
  { eager: true }
);

export interface ResolvedCover {
  src: string;
  width: number;
  height: number;
}

/** Renvoie la cover optimisée, ou null si l'asset est introuvable. */
export async function resolveCover(
  publicPath: string,
  width: number
): Promise<ResolvedCover | null> {
  const mod = blogImages[publicPath.replace(/^\/blog\//, '/src/assets/blog/')];
  if (!mod) return null;
  const img = await getImage({ src: mod.default, width, format: 'webp' });
  return {
    src: img.src,
    width: Number(img.attributes.width),
    height: Number(img.attributes.height),
  };
}

/** Covers d'une liste d'articles, indexées par slug. */
export async function resolveCovers(
  posts: { id: string; data: { cover: string } }[],
  width = 640
): Promise<Map<string, ResolvedCover>> {
  const map = new Map<string, ResolvedCover>();
  for (const post of posts) {
    const cover = await resolveCover(post.data.cover, width);
    if (cover) map.set(post.id, cover);
  }
  return map;
}
