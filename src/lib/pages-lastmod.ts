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

/** Chemin de page (sans slash final) → date ISO de dernière revue. */
export const STATIC_LASTMOD: Record<string, string> = {
  '/guide-declarations': GUIDE_DECLARATIONS_LAST_UPDATED_ISO,
  '/comparatif': COMPARATIF_LAST_UPDATED_ISO,
};
