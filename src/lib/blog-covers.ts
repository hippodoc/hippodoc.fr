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
  /** `srcset` des lignes de liste (vignette de 64 à 104 px, § 9.fk) : 160 et 320 px, puis
      le fichier principal ; largeurs réelles, dédoublonnées. */
  srcset?: string;
}

/** Variantes des lignes de liste : 64 px × densité 2,5 (téléphone), 104 px × densité 3. */
const CARD_WIDTHS = [160, 320];

/** Renvoie la cover optimisée, ou null si l'asset est introuvable. */
export async function resolveCover(
  publicPath: string,
  width: number
): Promise<ResolvedCover | null> {
  const mod = blogImages[publicPath.replace(/^\/blog\//, '/src/assets/blog/')];
  if (!mod) return null;
  // Bornée à la largeur source (§ 9.bi) : sharp n'agrandit pas, mais Astro annonçait
  // la largeur demandée — onze covers de 450 px étaient déclarées « 720w ».
  const img = await getImage({ src: mod.default, width: Math.min(width, mod.default.width), format: 'webp' });
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
    if (!cover) continue;
    const variantes = [...(await Promise.all(CARD_WIDTHS.map((w) => resolveCover(post.data.cover, w)))), cover]
      .filter((v): v is ResolvedCover => v !== null);
    const srcset = [...new Map(variantes.map((v) => [v.width, v.src])).entries()].map(([w, src]) => `${src} ${w}w`).join(', ');
    map.set(post.id, { ...cover, srcset });
  }
  return map;
}
