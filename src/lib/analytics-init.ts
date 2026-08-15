/**
 * Point d'entrée unique des analytics de page.
 *
 * Pourquoi un seul module plutôt qu'un import par type de page : le code commun
 * (`analytics-commun.ts`) était sinon extrait dans un chunk séparé, et chaque page
 * mesurée déclenchait DEUX requêtes au lieu d'une. Mesuré sur un article de blog,
 * ce second aller-retour coûtait 324 ms de LCP et 3 points Lighthouse — sur une
 * page dont le LCP a déjà été dégradé une fois par le passé.
 *
 * En regroupant tout ici, une page mesurée ne fait qu'UNE requête. La contrepartie
 * est que la landing embarque aussi le code des autres pages, et réciproquement :
 * ~900 octets gzip inutilisés. Un aller-retour réseau en vaut largement la peine,
 * surtout en 4G dans un navigateur intégré.
 *
 * ⚠️ Ne pas confondre avec `analytics.ts`, qui est le shim `trackEvent()` des îlots
 * React (simulateur, calculette, boussole) — un autre sujet.
 */

import { initLandingAnalytics } from './landing-analytics';
import { initPageAnalytics } from './page-analytics';
import { safe, type PostHogLike } from './analytics-commun';

export function initAnalytics(posthog: PostHogLike): void {
  const chemin = safe(() => window.location.pathname.replace(/\/$/, '') || '/', '/');
  if (chemin === '/') initLandingAnalytics(posthog);
  else initPageAnalytics(posthog);
}
