/**
 * Couleurs de bord des affiches du blog (MIGRATION.md § 9.fo), calculées à la construction.
 *
 * Une affiche ne se rogne jamais : dans les listes (/blog, séries, articles connexes) et sur la une,
 * elle est montrée entière dans un cadre 4:5 (`object-fit: contain`, calée en haut). Les 48 affiches
 * ont cinq formats (2:3, 0,75, 0,79, 0,805) : une affiche 2:3 laisse une bande de chaque côté
 * (8 % de la largeur du cadre), une 0,805 moins d'un pixel en bas. Ces bandes prennent la couleur du
 * bord de l'affiche, de haut en bas : elles prolongent l'image au lieu de se voir comme des bandes.
 *
 * Pour chaque bord (gauche, droite) : une bande de 2 % de la largeur de l'affiche (2 px au moins),
 * réduite par sharp à 1 × ARRETS pixels (moyenne de chaque tranche), soit ARRETS couleurs de haut en
 * bas. Rendu : `--bord-g` et `--bord-d`, à poser en style sur l'image ; la feuille de la page en fait
 * deux dégradés verticaux, l'un sur la moitié gauche du cadre, l'autre sur la moitié droite.
 *
 * Le fichier est lu par son chemin depuis la racine du projet (comme `image-partage.mjs`), jamais
 * importé : rien n'est copié dans le build. Un fichier `.mjs`, hors de portée de Tailwind (il lit les
 * `.astro` et `.ts`, commentaires compris), et dont le nom n'entre pas dans l'empreinte du cache des
 * articles (`rehype-*`, `remark-*`, `article-*`) : il ne touche pas au rendu du Markdown.
 * Coût : environ 2 s pour les 48 affiches, une fois par construction (mémoïsé).
 */
import path from 'node:path';
import sharp from 'sharp';

const RACINE = process.cwd();
/** Couleurs par bord, de haut en bas : assez pour suivre le décor, peu pour le HTML (≈ 140 signes). */
const ARRETS = 8;
/** Largeur de la bande moyennée, en part de la largeur de l'affiche. */
const BANDE = 0.02;

const memo = new Map();
const hex = (d, i) => '#' + [0, 1, 2].map((k) => d[i * 3 + k].toString(16).padStart(2, '0')).join('');

async function profil(fichier, largeur, hauteur, gauche) {
  const k = Math.max(2, Math.round(largeur * BANDE));
  const { data } = await sharp(fichier)
    .extract({ left: gauche ? 0 : largeur - k, top: 0, width: k, height: hauteur })
    .resize({ width: 1, height: ARRETS, fit: 'fill' })
    .removeAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });
  return Array.from({ length: ARRETS }, (_, i) => hex(data, i));
}

async function calculer(cheminPublic) {
  // Chemin du frontmatter (`/blog/x.png`, ceux de la SPA source) → `src/assets/blog/x.png`.
  const fichier = path.join(RACINE, 'src/assets', cheminPublic.replace(/^\/+/, ''));
  const { width, height } = await sharp(fichier).metadata();
  const [g, d] = await Promise.all([profil(fichier, width, height, true), profil(fichier, width, height, false)]);
  return `--bord-g:${g.join(',')};--bord-d:${d.join(',')}`;
}

/**
 * Style à poser sur l'image d'une affiche : `--bord-g:#…,…;--bord-d:#…,…`.
 * @param {string} cheminPublic chemin `cover` du frontmatter (`/blog/…`)
 * @returns {Promise<string>}
 */
export function bordsAffiche(cheminPublic) {
  if (!memo.has(cheminPublic)) memo.set(cheminPublic, calculer(cheminPublic));
  return memo.get(cheminPublic);
}
