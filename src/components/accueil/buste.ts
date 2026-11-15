/**
 * Buste de la mascotte du premier écran de l'accueil (DA 2026, phase 2).
 *
 * Une seule fabrique pour deux usages : le <picture> de Hero.astro et le
 * préchargement posé dans <head> par index.astro. Les deux appels donnent les
 * mêmes URL à empreinte : si l'un changeait de largeurs sans l'autre, le
 * navigateur préchargerait un fichier puis en afficherait un autre.
 *
 * Source : src/assets/accueil/mascotte-buste.webp (1171 × 1229 px, WebP sans
 * perte), le fichier fourni par le propriétaire rogné au ras du personnage.
 * Affichage : 262 px de large sous 900 px, 440 px au-delà. Les quatre largeurs
 * couvrent les densités 1 et 2 de ces deux tailles ; un téléphone en densité 3
 * (786 px demandés) prend le fichier de 880 px.
 */
import { getImage } from 'astro:assets';
import source from '@/assets/accueil/mascotte-buste.webp';

const LARGEURS = [262, 440, 524, 880];
/** Même seuil que la feuille de Hero.astro (`min-width: 900px`). */
export const BUSTE_SIZES = '(min-width: 900px) 440px, 262px';

export async function imagesBuste() {
  const [avif, webp] = await Promise.all(
    (['avif', 'webp'] as const).map((format) =>
      // `width` fixe le fichier de repli (`src`) ; sans lui, Astro fabriquerait
      // en plus la taille d'origine, que rien ne demande.
      getImage({ src: source, format, width: 524, widths: LARGEURS })
    )
  );
  return { avif, webp, sizes: BUSTE_SIZES };
}
