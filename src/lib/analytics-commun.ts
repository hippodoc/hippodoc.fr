/**
 * Socle commun des analytics de pages — contexte, émission, observation.
 *
 * Extrait de `landing-analytics.ts` pour être partagé avec `page-analytics.ts`
 * (tarifs, FAQ, comparatif, guide, blog). Le but est qu'un événement émis depuis
 * n'importe quelle page porte EXACTEMENT le même contexte que sur la landing, et
 * que ce contexte reste identique à celui de l'ancienne SPA — sans quoi les
 * données d'avant et d'après la migration ne seraient pas comparables.
 *
 * Contrainte permanente : la cible est le navigateur intégré d'Instagram/Facebook.
 * Tout accès à une API du navigateur passe par `safe()` et ne peut jamais lever.
 * Aucun identifiant n'est fabriqué ici : PostHog fournit déjà `$session_id`.
 */

export type Props = Record<string, unknown>;

export interface PostHogLike {
  capture: (event: string, props?: Props) => void;
}

const CLE_SESSION = 'hippodoc-landing-session';

/** N'exécute jamais `fn` sans filet : toute exception rend `repli`. */
export function safe<T>(fn: () => T, repli: T): T {
  try {
    const v = fn();
    return v === undefined || v === null ? repli : v;
  } catch {
    return repli;
  }
}

export function deviceType(): string {
  // Valeurs observées dans l'historique : « mobile » et « desktop » uniquement.
  return safe(() => (window.innerWidth < 768 ? 'mobile' : 'desktop'), 'desktop');
}

function deploymentEnv(): string {
  // Les previews Vercel et le local comptent comme « development » : c'est ce qui
  // permet de filtrer le bruit sans couper la mesure hors production.
  return safe(
    () => (/^(www\.)?hippodoc\.fr$/.test(window.location.hostname) ? 'production' : 'development'),
    'development'
  );
}

function hoteReferrer(): string {
  return safe(
    () => (document.referrer ? new URL(document.referrer).hostname.replace(/^www\./, '') : ''),
    ''
  );
}

function parametresUtm(): Props {
  return safe(() => {
    const p = new URLSearchParams(window.location.search);
    const out: Props = {};
    for (const cle of [
      'utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term', 'fbclid', 'gclid',
    ]) {
      const v = p.get(cle);
      if (v) out[cle] = v;
    }
    return out;
  }, {});
}

function referrerSource(utm: Props): string {
  const hote = hoteReferrer();
  if (!hote) {
    // Sans référent, la campagne reste identifiable par l'UTM — c'est ainsi que
    // « meta » apparaît dans l'historique.
    const src = utm.utm_source;
    return typeof src === 'string' && src ? src.toLowerCase() : 'direct';
  }
  if (hote.includes('hippodoc')) return 'hippodoc';
  if (hote.includes('google')) return 'google';
  if (hote.includes('instagram')) return 'instagram';
  if (hote.includes('facebook')) return 'facebook';
  if (hote.includes('linkedin')) return 'linkedin';
  return 'other';
}

interface Session {
  initial_landing_path?: string;
  initial_referrer_host?: string;
  pageviews?: number;
  [k: string]: unknown;
}

/**
 * Contexte de session, persisté dans `sessionStorage`. Les champs `initial_*`
 * gardent la valeur de la PREMIÈRE page vue : c'est ce qui permet d'attribuer une
 * conversion à sa campagne d'origine, même après plusieurs navigations.
 */
function contexteSession(utm: Props): Props {
  const brut = safe(() => window.sessionStorage.getItem(CLE_SESSION), null);
  const s: Session = safe(() => (brut ? JSON.parse(brut) : {}), {});

  if (!s.initial_landing_path) {
    s.initial_landing_path = safe(() => window.location.pathname, '/');
    s.initial_referrer_host = hoteReferrer();
    for (const [cle, val] of Object.entries(utm)) s['initial_' + cle] = val;
  }
  s.pageviews = (typeof s.pageviews === 'number' ? s.pageviews : 0) + 1;

  safe(() => window.sessionStorage.setItem(CLE_SESSION, JSON.stringify(s)), undefined);

  const { pageviews, ...reste } = s;
  return { ...reste, session_pageview_count: pageviews };
}

/**
 * Fabrique la fonction d'émission d'une page : le contexte commun est calculé une
 * seule fois puis joint à chaque événement, comme le faisait la SPA d'origine.
 */
export type Emetteur = (nom: string, props?: Props) => void;

export function creerEmetteur(posthog: PostHogLike): { emettre: Emetteur; contexte: Props } {
  const utm = parametresUtm();
  const commun: Props = {
    device_type: deviceType(),
    deployment_env: deploymentEnv(),
    app_version: __APP_VERSION__,
    referrer_source: referrerSource(utm),
    ...utm,
    ...contexteSession(utm),
  };
  const emettre: Emetteur = (nom, props) =>
    safe(() => posthog.capture(nom, { ...commun, ...props }), undefined);
  return { emettre, contexte: commun };
}

/**
 * Paliers de défilement franchis, émis une seule fois chacun.
 * Écouteur `passive` + une mesure par trame : aucun blocage du défilement.
 */
export function observerDefilement(seuils: readonly number[], atteint: (palier: number) => void): void {
  const vus = new Set<number>();
  let planifie = false;

  const mesurer = () => {
    planifie = false;
    const h = safe(() => document.documentElement.scrollHeight - window.innerHeight, 0);
    // Page plus courte que le viewport : 100 % est atteint d'emblée.
    const pct = h <= 0 ? 100 : safe(() => (window.scrollY / h) * 100, 0);
    for (const seuil of seuils) {
      if (pct >= seuil && !vus.has(seuil)) {
        vus.add(seuil);
        atteint(seuil);
      }
    }
    if (vus.size === seuils.length) {
      safe(() => window.removeEventListener('scroll', surScroll), undefined);
    }
  };
  const surScroll = () => {
    if (planifie) return;
    planifie = true;
    safe(() => window.requestAnimationFrame(mesurer), undefined);
  };

  safe(() => window.addEventListener('scroll', surScroll, { passive: true }), undefined);
  mesurer();
}

/**
 * Signale chaque élément entrant dans le viewport, une seule fois.
 *
 * ⚠️ Surtout PAS de seuil proportionnel (`threshold: 0.3`) : il exige qu'une
 * fraction de l'ÉLÉMENT soit visible, ce qui devient impossible dès qu'une
 * section dépasse la hauteur de l'écran. Mesuré sur `/guide-declarations` :
 * la section « glossaire » fait 12 658 px ; en exiger 30 % réclamerait 3 797 px
 * dans une fenêtre de 844 — 5 des 8 sections ne se déclenchaient jamais.
 *
 * On utilise donc une bande de déclenchement : l'élément compte comme vu quand
 * il atteint le quart bas de l'écran. Le comportement est identique quelle que
 * soit sa hauteur, et l'ordre d'apparition est préservé.
 */
export function observerElements(elements: Iterable<Element>, entre: (el: Element) => void): void {
  safe(() => {
    if (typeof IntersectionObserver === 'undefined') return;
    const obs = new IntersectionObserver(
      (entrees) => {
        for (const e of entrees) {
          if (!e.isIntersecting) continue;
          obs.unobserve(e.target);
          safe(() => entre(e.target), undefined);
        }
      },
      { threshold: 0, rootMargin: '0px 0px -25% 0px' }
    );
    for (const el of elements) obs.observe(el);
  }, undefined);
}
