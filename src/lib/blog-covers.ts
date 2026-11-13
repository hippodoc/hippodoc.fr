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
import { bordsAffiche } from '@/lib/affiche-bords.mjs';

const blogImages = import.meta.glob<{ default: ImageMetadata }>(
  '/src/assets/blog/**/*.{png,jpg,jpeg,webp}',
  { eager: true }
);

export interface ResolvedCover {
  src: string;
  width: number;
  height: number;
  /** `srcset` des lignes de liste (§ 9.fo : affiche de 88 à 112 px au téléphone, 144 px au-delà) :
      160, 240, 320 et 400 px, puis le fichier principal ; largeurs réelles, dédoublonnées. */
  srcset?: string;
  /** Couleurs de bord de l'affiche (`--bord-g`, `--bord-d`), à poser en style sur l'image : elles
      remplissent le cadre 4:5 autour d'une affiche montrée entière (§ 9.fo, `affiche-bords.mjs`). */
  bords?: string;
}

/** Variantes des lignes de liste : 104 px × densité 2 et 3 (téléphone), 112 px × 3, 144 px × 1 et 2. */
const CARD_WIDTHS = [160, 240, 320, 400];

/** Variantes d'une affiche, bornées à la source et dédoublonnées, en `srcset` (`… 160w, … 240w`). */
export async function srcsetAffiche(publicPath: string, largeurs: number[]): Promise<string | undefined> {
  const variantes = (await Promise.all(largeurs.map((w) => resolveCover(publicPath, w))))
    .filter((v): v is ResolvedCover => v !== null);
  if (!variantes.length) return undefined;
  return [...new Map(variantes.map((v) => [v.width, v.src])).entries()].map(([w, src]) => `${src} ${w}w`).join(', ');
}

export { bordsAffiche };

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
    map.set(post.id, { ...cover, srcset, bords: await bordsAffiche(post.data.cover) });
  }
  return map;
}
