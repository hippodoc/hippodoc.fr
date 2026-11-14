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
  /** `srcset` des lignes de liste (§ 9.fo) : `CARD_WIDTHS`, puis le fichier principal ; largeurs
      réelles, dédoublonnées. */
  srcset?: string;
}

/** Variantes des lignes de liste (§ 9.fo, corrections). L'affiche est dessinée à son format dans une
    case 4:5 de 88 à 112 px au téléphone, 144 px au-delà : une affiche 2:3 n'y prend que 83 % de la
    largeur. 160 : 144 px × 1 ; 200 : Lighthouse et les écrans de densité 1,75 à 2 (104 à 112 px) ;
    240 : 112 px × 2 ; 320 : 104 px × 3, 144 px × 2 ; 400 : 112 px × 3. */
const CARD_WIDTHS = [160, 200, 240, 320, 400];

/** Variantes d'une affiche, bornées à la source et dédoublonnées, en `srcset` (`… 160w, … 200w`). */
export async function srcsetAffiche(publicPath: string, largeurs: number[]): Promise<string | undefined> {
  const variantes = (await Promise.all(largeurs.map((w) => resolveCover(publicPath, w))))
    .filter((v): v is ResolvedCover => v !== null);
  if (!variantes.length) return undefined;
  return [...new Map(variantes.map((v) => [v.width, v.src])).entries()].map(([w, src]) => `${src} ${w}w`).join(', ');
}

/**
 * Largeur dessinée d'une affiche dans une case 4:5 de largeur `cadre` (§ 9.fo) : l'affiche y est
 * montrée entière, à son format, à la hauteur de la case (`cadre` × 1,25). Une 2:3 y prend 83 % de
 * la largeur, une 0,805 un peu plus que la case (0,6 %). Sert aux `sizes`.
 */
export function largeurDansCadre(cadre: number, largeur: number, hauteur: number): number {
  return Math.round(cadre * 1.25 * (largeur / hauteur));
}

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
    map.set(post.id, { ...cover, srcset: await srcsetAffiche(post.data.cover, [...CARD_WIDTHS, width]) });
  }
  return map;
}
