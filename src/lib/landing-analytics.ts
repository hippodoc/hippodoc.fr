/**
 * Analytics de la landing — les événements que l'autocapture ne peut pas produire.
 *
 * CONTEXTE. La migration Lovable → Astro a porté les *attributs* d'instrumentation
 * (`data-ph`, `data-track`) mais pas l'émission d'événements nommés, écartée au nom
 * de l'invariant zéro JS (cf. MIGRATION.md §6, §11 et §9.p). Les clics restent
 * captés via `$autocapture` ; ce module n'ajoute donc AUCUN balisage et se limite
 * à ce qu'aucune capture automatique ne peut déduire :
 *   1. `landing_viewed`         — la vue de page nommée
 *   2. `landing_scroll_depth`   — profondeur atteinte (25/50/75/100)
 *   3. `landing_section_viewed` — sections réellement entrées dans le viewport
 *   4. `landing_video_*`        — lecture, progression, complétion, erreurs
 * `landing_cta_clicked` est déduit des `data-track` DÉJÀ présents.
 *
 * Le contexte commun, l'observation du défilement et celle des sections vivent
 * dans `analytics-commun.ts`, partagés avec les autres pages du site.
 */

import {
  creerEmetteur,
  deviceType,
  observerDefilement,
  observerElements,
  safe,
  type PostHogLike,
  type Props,
} from './analytics-commun';

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

/**
 * Initialise la mesure de la landing. Appelé par PostHog.astro APRÈS `posthog.init()`,
 * ce qui garantit à la fois l'ordre d'exécution et l'unicité de l'instance.
 */
export function initLandingAnalytics(posthog: PostHogLike): void {
  const emettre = creerEmetteur(posthog);

  // Vue de page émise en PREMIER : si l'une des mesures ci-dessous échouait sur un
  // navigateur exotique, celle-ci est déjà partie.
  emettre('landing_viewed');

  /* Profondeur de défilement ------------------------------------------------ */
  observerDefilement(SEUILS_SCROLL, (palier) =>
    emettre('landing_scroll_depth', { depth: palier })
  );

  /* Sections vues ----------------------------------------------------------- */
  const sections = safe<Element[]>(
    () => [
      ...document.querySelectorAll('[data-landing-section]'),
      ...(document.querySelector('footer') ? [document.querySelector('footer') as Element] : []),
    ],
    []
  );
  observerElements(sections, (el) => {
    const id =
      (el as HTMLElement).dataset.landingSection ?? (el.tagName === 'FOOTER' ? 'footer' : '');
    if (!id) return;
    const ordre = SECTIONS.indexOf(id as (typeof SECTIONS)[number]) + 1;
    emettre('landing_section_viewed', { section_id: id, section_order: ordre });

    const dedie = EVENEMENT_DEDIE[id];
    if (dedie) {
      emettre(dedie, id === 'practice-journeys' ? { profile: profilActif() } : undefined);
    }
  });

  /* CTA — aucun balisage ajouté : on lit les `data-track` déjà en place ------- */
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
          // Événement dédié attendu par deux insights : le CTA de la section
          // « Pour qui » compte aussi comme une conversion de ce parcours.
          if (id === 'cta_signup_journey_section') {
            emettre('landing_journey_cta_clicked', { ...props, profile: profilActif() });
          }
        },
        { passive: true }
      ),
    undefined
  );

  /* Choix d'un profil dans « Pour qui » ---------------------------------------
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

  /* Vidéo de présentation --------------------------------------------------- */
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

    /* Erreurs de lecture. Signal réel et non théorique : la vidéo est servie
       depuis Supabase Storage et lue à 97 % dans le navigateur intégré
       d'Instagram. Une vidéo qui ne démarre pas y est invisible côté produit —
       et trois insights l'attendent. */
    video.addEventListener('error', () =>
      emettre('landing_video_error', {
        ...base(),
        error_code: safe(() => video.error?.code ?? 0, 0),
        error_type: safe(() => ERREURS_MEDIA[video.error?.code ?? 0] ?? 'unknown', 'unknown'),
      })
    );
    // Le média cale faute de données : ce n'est pas une erreur fatale, mais côté
    // visiteur le résultat est le même — la vidéo ne joue pas.
    video.addEventListener('stalled', () =>
      emettre('landing_video_error', { ...base(), error_code: 0, error_type: 'stalled' })
    );
  }, undefined);
}

/** Libellés des codes d'erreur média (spec HTML `MediaError`). */
const ERREURS_MEDIA: Record<number, string> = {
  1: 'aborted',
  2: 'network',
  3: 'decode',
  4: 'src_not_supported',
};

/** Profil actuellement sélectionné dans la section « Pour qui » (radios CSS). */
function profilActif(): string {
  return safe(() => {
    const coche = document.querySelector<HTMLInputElement>(
      '[data-landing-section="practice-journeys"] input[type="radio"]:checked'
    );
    return (coche?.id || '').replace(/^parcours-/, '');
  }, '');
}
