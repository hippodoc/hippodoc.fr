/**
 * Dates de dernière revue éditoriale des pages STATIQUES, pour le `lastmod` du
 * sitemap.
 *
 * Les articles de blog passent par `src/generated/blog-meta.json` ; les pages
 * statiques n'avaient, elles, aucun `lastmod` — alors que /guide-declarations
 * affiche « Mis à jour le … » et porte `dateModified` dans son JSON-LD. La page
 * la plus vivante du site était donc la seule à ne pas déclarer sa fraîcheur
 * (voir MIGRATION.md § 9.ak).
 *
 * ⚠️ Source unique : ces valeurs sont lues à la fois par les pages (affichage +
 * JSON-LD) et par `astro.config.mjs` (sitemap). Ne pas les recopier ailleurs.
 * `verify-site.mjs` échoue si le sitemap diverge de cette table.
 *
 * ⚠️ Ne jamais y mettre une date de build : un `lastmod` faux fait ignorer le
 * signal sur tout le site — c'est exactement le défaut corrigé en § 9.ai.
 */
import { GUIDE_DECLARATIONS_LAST_UPDATED_ISO } from './guide/lastUpdated';

export const COMPARATIF_LAST_UPDATED_ISO = '2026-06-24';

/** /guide (PDF offert, § 9.di) : date « À jour au » imprimée dans l'édition en ligne.
 *  Littéral ici, pas dans `guide-remplacant.ts` : verify-site.mjs lit cette table par
 *  expression régulière et ne résout que les constantes déclarées dans ce fichier. */
export const GUIDE_REMPLACANT_LAST_UPDATED_ISO = '2026-09-26';

/** Chemin de page (sans slash final) → date ISO de dernière revue. */
/** Pages filles du guide, créées le 23 août 2026 (MIGRATION.md § 9.ap). Leur
 *  contenu provient des mêmes données que le hub : elles suivent donc sa date
 *  de revue éditoriale, et non leur date de création. */
export const GUIDE_SOUS_PAGES_LAST_UPDATED_ISO = '2026-08-23';

/** Mise en ligne de la nouvelle accueil (DA 2026, § 9.eb). Depuis l'épure de
 *  l'accueil (§ 9.eu), seule /faq porte encore cette date. */
export const ACCUEIL_DA_LAST_UPDATED_ISO = '2026-11-10';

/** Accueil : épure de novembre 2026 (MIGRATION.md § 9.eu), textes coupés,
 *  huit questions au lieu de dix, sections déplacées. Date du dernier commit
 *  de la branche (corrections après relectures, § 9.ex) ; ⚠️ à remettre au
 *  jour réel de la mise en ligne : le sitemap ne doit pas annoncer pour « / »
 *  une date antérieure au changement. */
export const ACCUEIL_LAST_UPDATED_ISO = '2026-11-13';

/** /tarifs : tarif des internes et essai de 6 mois des syndicats partenaires
 *  ajoutés le 11 novembre 2026 (MIGRATION.md § 9.ed). */
export const TARIFS_LAST_UPDATED_ISO = '2026-11-11';

export const STATIC_LASTMOD: Record<string, string> = {
  '/guide-declarations': GUIDE_DECLARATIONS_LAST_UPDATED_ISO,
  '/guide-declarations/dsfu-pamc': GUIDE_SOUS_PAGES_LAST_UPDATED_ISO,
  '/guide-declarations/2042-c-pro': GUIDE_SOUS_PAGES_LAST_UPDATED_ISO,
  '/guide-declarations/medecin-remplacant': GUIDE_SOUS_PAGES_LAST_UPDATED_ISO,
  '/comparatif': COMPARATIF_LAST_UPDATED_ISO,
  /** Page du PDF offert : suit la date « À jour au » de l'édition (§ 9.di). */
  '/guide': GUIDE_REMPLACANT_LAST_UPDATED_ISO,
  /** Accueil : sa propre date depuis l'épure (MIGRATION.md § 9.eu).
   *  /faq : textes corrigés avec l'accueil de la DA 2026, le 10 novembre 2026
   *  (§ 9.eb), non touchée depuis. */
  '/': ACCUEIL_LAST_UPDATED_ISO,
  '/faq': ACCUEIL_DA_LAST_UPDATED_ISO,
  '/tarifs': TARIFS_LAST_UPDATED_ISO,
};
