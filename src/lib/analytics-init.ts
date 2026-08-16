/**
 * Point d'entrée unique des analytics de page.
 *
 * Pourquoi un seul module plutôt qu'un import par type de page : le code commun
 * (`analytics-commun.ts`) était sinon extrait dans un chunk séparé, et chaque page
 * mesurée déclenchait DEUX requêtes au lieu d'une. Mesuré sur un article de blog,
 * ce second aller-retour coûtait du LCP — sur une page dont le LCP a déjà été
 * dégradé une fois par le passé.
 *
 * Le contexte de session est construit ICI, une seule fois, puis passé aux modules :
 * l'appeler deux fois incrémenterait `session_pageview_count` en double.
 *
 * ⚠️ Ne pas confondre avec `analytics.ts`, qui est le shim `trackEvent()` des îlots
 * React (simulateur, calculette, boussole) — un autre sujet.
 */

import { initLandingAnalytics } from './landing-analytics';
import { initPageAnalytics } from './page-analytics';
import { creerEmetteur, safe, type Emetteur, type PostHogLike, type Props } from './analytics-commun';

export function initAnalytics(posthog: PostHogLike): void {
  const chemin = safe(() => window.location.pathname.replace(/\/$/, '') || '/', '/');
  const { emettre, contexte } = creerEmetteur(posthog);

  if (chemin === '/') initLandingAnalytics(emettre);
  else initPageAnalytics(emettre, chemin);

  brancherCalendly(emettre, contexte);
}

/**
 * Liens de prise de rendez-vous (`[data-calendly]`).
 *
 * Deux rôles :
 *  1. **Attribution** — Calendly enregistre les `utm_*` reçus en query. On y
 *     reporte ceux de la PREMIÈRE page vue de la session, pour qu'un rendez-vous
 *     pris par un visiteur venu de Meta reste rattaché à cette campagne, même
 *     après plusieurs navigations. `utm_content` porte l'emplacement du lien,
 *     ce qui permet de comparer les placements entre eux.
 *  2. **Mesure du clic** — la RÉSERVATION elle-même n'est pas observable d'ici :
 *     elle se produit sur calendly.com. Elle se réconcilie via l'API Calendly ou
 *     un webhook. On mesure donc l'intention, pas la conversion.
 */
function brancherCalendly(emettre: Emetteur, contexte: Props): void {
  safe(() => {
    const liens = document.querySelectorAll<HTMLAnchorElement>('a[data-calendly]');
    if (!liens.length) return;

    const valeur = (cle: string): string | null => {
      const v = contexte['initial_' + cle] ?? contexte[cle];
      return typeof v === 'string' && v ? v : null;
    };

    for (const lien of liens) {
      const emplacement = lien.dataset.calendly || 'inconnu';

      safe(() => {
        const url = new URL(lien.href);
        url.searchParams.set('utm_source', valeur('utm_source') ?? String(contexte.referrer_source ?? 'hippodoc'));
        url.searchParams.set('utm_medium', valeur('utm_medium') ?? 'site');
        const campagne = valeur('utm_campaign');
        if (campagne) url.searchParams.set('utm_campaign', campagne);
        // `utm_content` identifie l'emplacement du lien, pas la publicité : c'est
        // ce qui permettra de savoir lequel des deux placements convertit.
        url.searchParams.set('utm_content', emplacement);
        lien.href = url.toString();
      }, undefined);

      lien.addEventListener('click', () => emettre('calendly_clicked', { placement: emplacement }), {
        passive: true,
      });
    }
  }, undefined);
}
