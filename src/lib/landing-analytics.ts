/**
 * Analytics de la landing — les événements que l'autocapture ne peut pas produire.
 *
 * CONTEXTE. La migration Lovable → Astro a porté les *attributs* d'instrumentation
 * (`data-ph`, `data-track`) mais pas l'émission d'événements nommés, écartée au nom
 * de l'invariant zéro JS (cf. MIGRATION.md §6 et §11). Résultat mesuré : depuis la
 * bascule du 07/08/2026, les clics restent captés via `$autocapture` (les `data-track`
 * apparaissent dans `elements_chain`), mais 31 insights sauvegardés qui reposent sur
 * les événements `landing_*` sont vides.
 *
 * Ce module ne réinstrumente donc RIEN de ce qui marche déjà. Il émet uniquement les
 * quatre familles qu'aucune capture automatique ne peut déduire :
 *   1. `landing_viewed`         — la vue de page nommée
 *   2. `landing_scroll_depth`   — profondeur atteinte (25/50/75/100)
 *   3. `landing_section_viewed` — sections réellement entrées dans le viewport
 *   4. `landing_video_*`        — lecture, progression, complétion
 * `landing_cta_clicked` est déduit des `data-track` DÉJÀ présents : aucun balisage
 * n'a été ajouté.
 *
 * FIDÉLITÉ. Noms d'événements, noms de propriétés et valeurs sont repris tels quels
 * de l'historique PostHog (relevé sur 45 jours avant la bascule), pour que les
 * données d'avant et d'après restent comparables dans les mêmes insights.
 *
 * ROBUSTESSE. La cible réelle est le navigateur intégré d'Instagram/Facebook (97 %
 * du trafic payant). Tout accès à une API du navigateur passe par `safe()` et ne peut
 * jamais lever : un contexte non sécurisé, un `sessionStorage` verrouillé ou un
 * `IntersectionObserver` absent dégradent la mesure, ils ne cassent pas la page.
 * Aucun identifiant n'est fabriqué ici — `crypto.randomUUID()` n'est pas utilisé :
 * PostHog fournit déjà `$session_id`, ce qui supprime par construction la classe de
 * panne observée sur l'ancienne landing.
 */

type Props = Record<string, unknown>;

interface PostHogLike {
  capture: (event: string, props?: Props) => void;
}

/** Ordre historique des sections (`section_order` / `section_id` dans PostHog). */
const SECTIONS = [
  'hero',
  'social-proof',
  'presentation-video',
  'features',
  'mid-page-cta',
  'practice-journeys',
  'testimonials',
  'partners',
  'pricing',
  'faq',
  'footer',
] as const;

/** Sections qui émettent EN PLUS un événement dédié, comme sur l'ancienne landing. */
const EVENEMENT_DEDIE: Record<string, string> = {
  'presentation-video': 'landing_video_section_viewed',
  'practice-journeys': 'landing_journey_section_viewed',
  pricing: 'landing_pricing_viewed',
};

const SEUILS_SCROLL = [25, 50, 75, 100] as const;
const JALONS_VIDEO = [25, 50, 75] as const;
const CLE_SESSION = 'hippodoc-landing-session';

/** N'exécute jamais `fn` sans filet : toute exception rend `repli`. */
function safe<T>(fn: () => T, repli: T): T {
  try {
    const v = fn();
    return v === undefined || v === null ? repli : v;
  } catch {
    return repli;
  }
}

function deviceType(): string {
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
  return safe(() => (document.referrer ? new URL(document.referrer).hostname.replace(/^www\./, '') : ''), '');
}

function parametresUtm(): Props {
  return safe(() => {
    const p = new URLSearchParams(window.location.search);
    const out: Props = {};
    for (const cle of ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term', 'fbclid', 'gclid']) {
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
  if (hote.includes('facebook') || hote === 'l.facebook.com' || hote === 'lm.facebook.com') return 'facebook';
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
 * Initialise la mesure de la landing. Appelé par PostHog.astro APRÈS `posthog.init()`,
 * ce qui garantit à la fois l'ordre d'exécution et l'unicité de l'instance.
 */
export function initLandingAnalytics(posthog: PostHogLike): void {
  const utm = parametresUtm();

  // Contexte commun, calculé une seule fois et joint à chaque événement — même
  // forme que sur l'ancienne landing, pour que les insights existants fonctionnent.
  const commun: Props = {
    device_type: deviceType(),
    deployment_env: deploymentEnv(),
    app_version: __APP_VERSION__,
    referrer_source: referrerSource(utm),
    ...utm,
    ...contexteSession(utm),
  };

  const emettre = (nom: string, props?: Props) =>
    safe(() => posthog.capture(nom, { ...commun, ...props }), undefined);

  // 1. Vue de page — émise en PREMIER, avant toute observation : si l'une des
  //    mesures ci-dessous échouait sur un navigateur exotique, celle-ci est déjà partie.
  emettre('landing_viewed');

  /* 2. Profondeur de scroll ------------------------------------------------- */
  const atteints = new Set<number>();
  let planifie = false;
  const mesurerScroll = () => {
    planifie = false;
    const h = safe(
      () => document.documentElement.scrollHeight - window.innerHeight,
      0
    );
    // Page plus courte que le viewport : 100 % est atteint d'emblée, inutile de
    // diviser par zéro.
    const pct = h <= 0 ? 100 : safe(() => (window.scrollY / h) * 100, 0);
    for (const seuil of SEUILS_SCROLL) {
      if (pct >= seuil && !atteints.has(seuil)) {
        atteints.add(seuil);
        emettre('landing_scroll_depth', { depth: seuil });
      }
    }
    if (atteints.size === SEUILS_SCROLL.length) {
      safe(() => window.removeEventListener('scroll', surScroll), undefined);
    }
  };
  const surScroll = () => {
    // `passive: true` + une seule mesure par trame : aucun blocage du défilement.
    if (planifie) return;
    planifie = true;
    safe(() => window.requestAnimationFrame(mesurerScroll), undefined);
  };
  safe(() => window.addEventListener('scroll', surScroll, { passive: true }), undefined);
  mesurerScroll();

  /* 3. Sections vues -------------------------------------------------------- */
  safe(() => {
    if (typeof IntersectionObserver === 'undefined') return;
    const vues = new Set<string>();
    const observateur = new IntersectionObserver(
      (entrees) => {
        for (const e of entrees) {
          if (!e.isIntersecting) continue;
          const id =
            (e.target as HTMLElement).dataset.landingSection ??
            (e.target.tagName === 'FOOTER' ? 'footer' : '');
          if (!id || vues.has(id)) continue;
          vues.add(id);
          observateur.unobserve(e.target);

          const ordre = SECTIONS.indexOf(id as (typeof SECTIONS)[number]) + 1;
          emettre('landing_section_viewed', { section_id: id, section_order: ordre });

          const dedie = EVENEMENT_DEDIE[id];
          if (dedie) {
            emettre(dedie, id === 'practice-journeys' ? { profile: profilActif() } : undefined);
          }
        }
      },
      // 30 % visible : une section effleurée en défilant vite ne compte pas.
      { threshold: 0.3 }
    );
    for (const el of document.querySelectorAll('[data-landing-section]')) observateur.observe(el);
    const pied = document.querySelector('footer');
    if (pied) observateur.observe(pied);
  }, undefined);

  /* 4. CTA — aucun balisage ajouté : on lit les `data-track` déjà en place ---- */
  safe(
    () =>
      document.addEventListener(
        'click',
        (ev) => {
          const cible = (ev.target as HTMLElement | null)?.closest<HTMLElement>('[data-track]');
          const id = cible?.dataset.track;
          if (!id) return;
          const props: Props = { cta_id: id };
          // Les tarifs portent en plus le plan choisi (attributs déjà présents).
          for (const cle of ['plan', 'period', 'promo'] as const) {
            const v = cible?.dataset['track' + cle[0].toUpperCase() + cle.slice(1)];
            if (v !== undefined) props[cle] = v;
          }
          emettre('landing_cta_clicked', props);
        },
        { passive: true }
      ),
    undefined
  );

  /* 5. Choix d'un profil dans « Pour qui » ------------------------------------
     On écoute le CLIC sur les libellés (qui portent déjà `data-profile`) et non
     l'événement `change` des radios : « remplacant » est coché par défaut, donc
     le sélectionner ne change rien et n'émettrait jamais `change`. Or c'est le
     profil le plus fréquent de l'historique (62 sélections sur 108). */
  safe(() => {
    const section = document.querySelector('[data-landing-section="practice-journeys"]');
    section?.addEventListener(
      'click',
      (ev) => {
        const libelle = (ev.target as HTMLElement | null)?.closest<HTMLElement>('[data-profile]');
        const profil = libelle?.dataset.profile;
        if (profil) emettre('landing_journey_profile_selected', { profile: profil });
      },
      { passive: true }
    );
  }, undefined);

  /* 6. Vidéo de présentation ------------------------------------------------ */
  safe(() => {
    const video = document.querySelector<HTMLVideoElement>(
      '[data-landing-section="presentation-video"] video'
    );
    if (!video) return;
    const videoId = 'hippodoc-presentation-st';
    const jalons = new Set<number>();
    let dejaLue = false;

    const base = (): Props => ({
      video_id: videoId,
      position_seconds: Math.round(video.currentTime),
      duration_seconds: Math.round(video.duration) || 0,
      percent_watched: video.duration ? Math.round((video.currentTime / video.duration) * 100) : 0,
      viewport: deviceType(),
      is_replay: dejaLue,
    });

    video.addEventListener('play', () => {
      emettre('landing_video_play', base());
      dejaLue = true;
    });
    video.addEventListener('pause', () => {
      // `pause` est aussi émis à la fin de la lecture : on ne compte que les
      // interruptions réelles, sinon chaque visionnage complet en génère un faux.
      if (!video.ended) emettre('landing_video_pause', base());
    });
    video.addEventListener('timeupdate', () => {
      if (!video.duration) return;
      const pct = (video.currentTime / video.duration) * 100;
      for (const jalon of JALONS_VIDEO) {
        if (pct >= jalon && !jalons.has(jalon)) {
          jalons.add(jalon);
          emettre('landing_video_progress', { ...base(), milestone: jalon });
        }
      }
    });
    video.addEventListener('ended', () => emettre('landing_video_completed', base()));
  }, undefined);
}

/**
 * Identifiant de profil à partir d'une radio du sélecteur « Pour qui ».
 *
 * On lit l'`id` (`parcours-remplacant` → `remplacant`) et NON `value` : ces radios
 * n'ont pas d'attribut `value`, si bien que le navigateur renvoie `"on"` pour toutes.
 * Les identifiants ainsi obtenus — remplacant, interne, mixte, collaborateur,
 * installe — sont exactement ceux de l'historique PostHog.
 */
function profilDepuisRadio(radio: HTMLInputElement | null): string {
  return safe(() => (radio?.id || '').replace(/^parcours-/, ''), '');
}

/** Profil actuellement sélectionné dans la section « Pour qui » (radios CSS). */
function profilActif(): string {
  return profilDepuisRadio(
    safe(
      () =>
        document.querySelector<HTMLInputElement>(
          '[data-landing-section="practice-journeys"] input[type="radio"]:checked'
        ),
      null
    )
  );
}
