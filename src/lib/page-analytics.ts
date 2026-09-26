/**
 * Analytics des pages marketing hors accueil — tarifs, FAQ, comparatif, guide, blog.
 *
 * Ces événements existaient sur l'ancienne SPA et ont disparu à la migration du
 * 07/08/2026, en même temps que ceux de la landing : 133 `pricing_viewed`,
 * 58 `blog_scroll_depth`, 53 `guide_declarations_section_viewed`, 36
 * `faq_question_opened`… tous à zéro depuis. Ils sont ici rétablis à l'identique
 * — mêmes noms, mêmes propriétés, mêmes valeurs — pour que les insights portent
 * sur une série continue de part et d'autre de la bascule.
 *
 * Le contexte commun et les observateurs viennent de `analytics-commun.ts` : une
 * page mesurée ici porte exactement le même contexte que la landing.
 */

import {
  observerDefilement,
  observerElements,
  safe,
  type Emetteur,
  type PostHogLike,
  type Props,
} from './analytics-commun';

/** Sections du guide des déclarations (valeurs historiques de `section`). */
const SECTIONS_GUIDE = [
  'profils', 'flux', 'cases', 'fiches', 'questions', 'glossaire', 'calendrier', 'problemes',
] as const;

/** Rubriques de la FAQ (valeurs historiques de `section_id`). */
const SECTIONS_FAQ = [
  'tarifs', 'paiements', 'revenus', 'cotisations', 'documents',
  'contact', 'planification', 'securite', 'mobile', 'activite',
] as const;

const SEUILS_BLOG = [25, 50, 75, 100] as const;

/**
 * Aiguille la page courante vers sa mesure. Ne fait rien — sans lever — sur une
 * page non instrumentée : l'appelant peut donc rester simple.
 */
export function initPageAnalytics(emettre: Emetteur, chemin: string, posthog?: PostHogLike): void {

  if (chemin === '/tarifs') return mesurerTarifs(emettre);
  if (chemin === '/faq') return mesurerFaq(emettre);
  if (chemin === '/comparatif') return void emettre('comparatif_viewed');
  if (chemin === '/guide-declarations') return mesurerGuide(emettre);
  if (chemin === '/blog') return mesurerBlogIndex(emettre);
  // Pages de série : postérieures à la migration, sans équivalent historique —
  // l'événement est donc nouveau (§ 9.bf).
  if (chemin.startsWith('/blog/serie/')) return mesurerSerie(emettre);
  // Un article : /blog/<slug>.
  if (chemin.startsWith('/blog/')) return mesurerArticle(emettre, posthog);
}

function mesurerTarifs(emettre: Emetteur): void {
  // `instagram_10k_active` : la promo Instagram 10K était déjà dormante dans la
  // SPA source (isInstagram10kActive() === false) et n'a pas été reprise — la
  // propriété vaut donc toujours false, comme dans les 133 événements historiques.
  emettre('pricing_viewed', { instagram_10k_active: false });
}

function mesurerFaq(emettre: Emetteur): void {
  emettre('faq_viewed');

  // `question_key` suit le format historique `<section_id>-<index 0-based>`,
  // l'index étant le rang de la question DANS sa rubrique.
  for (const id of SECTIONS_FAQ) {
    safe(() => {
      const section = document.getElementById(id);
      if (!section) return;
      const questions = [...section.querySelectorAll('details')];
      questions.forEach((q, i) => {
        q.addEventListener('toggle', () => {
          // `toggle` se déclenche aussi à la fermeture : seule l'ouverture compte.
          if (!q.open) return;
          emettre('faq_question_opened', { section_id: id, question_key: `${id}-${i}` });
        });
      });
    }, undefined);
  }
}

function mesurerGuide(emettre: Emetteur): void {
  // `context` vaut « public » ici par construction : la version « connected » du
  // guide vit dans l'application, pas sur le site public.
  emettre('guide_declarations_viewed', { context: 'public' });

  const sections = safe<Element[]>(
    () => SECTIONS_GUIDE.map((id) => document.getElementById(id)).filter((e): e is HTMLElement => !!e),
    []
  );
  observerElements(sections, (el) =>
    emettre('guide_declarations_section_viewed', { section: el.id })
  );
}

function mesurerBlogIndex(emettre: Emetteur): void {
  const total = safe(
    () => Number(document.querySelector<HTMLElement>('[data-blog-total]')?.dataset.blogTotal) || 0,
    0
  );
  emettre('blog_index_viewed', { total_articles: total });

  // Recherche (§ 9.db) : le champ émet `hippodoc:blog-search` une fois la frappe
  // terminée. Le terme cherché dit ce que les lecteurs attendent du blog, et
  // `results_count: 0` ce qui y manque.
  window.addEventListener('hippodoc:blog-search', (e) => {
    const d = (e as CustomEvent<{ query: string; results: number; approchant: boolean }>).detail;
    emettre('blog_search', { query: d.query, results_count: d.results, approximate: d.approchant });
  });
}

function mesurerSerie(emettre: Emetteur): void {
  const main = safe(() => document.querySelector<HTMLElement>('[data-blog-serie]'), null);
  if (!main) return;
  emettre('blog_series_viewed', {
    series_id: main.dataset.blogSerie ?? '',
    total_articles: safe(() => Number(main.dataset.blogTotal) || 0, 0),
  });
}

/** Destinations qui valent conversion depuis un article : outils, offre, app. */
const DESTINATIONS_CTA = /^\/(simulateur|tarifs|essai|guide-declarations|comparatif)(\/|$)|^https:\/\/app\.hippodoc\.fr\//;

function mesurerArticle(emettre: Emetteur, posthog?: PostHogLike): void {
  // Métadonnées injectées au build sur <article> : aucun calcul côté client, et
  // les valeurs sont exactement celles du frontmatter (donc de l'historique).
  const article = safe(() => document.querySelector<HTMLElement>('[data-blog-slug]'), null);
  if (!article) return;

  const meta: Props = {
    slug: article.dataset.blogSlug ?? '',
    category: article.dataset.blogCategory ?? '',
    series_id: article.dataset.blogSeries ?? '',
    episode_number: safe(() => Number(article.dataset.blogEpisode) || 0, 0),
  };

  emettre('blog_article_viewed', meta);
  observerDefilement(SEUILS_BLOG, (palier) => emettre('blog_scroll_depth', { ...meta, depth: palier }));

  // Lecture terminée : c'est la FIN DU TEXTE qui compte, pas le bas de la page.
  // Le pied de page et les blocs de partage viennent après le contenu ; les
  // confondre sous-estimerait la lecture (l'historique montre d'ailleurs plus de
  // `blog_read_completed` que de `depth: 100`).
  const fin = safe(() => document.querySelector('[data-blog-fin]'), null);
  if (fin) observerElements([fin], () => emettre('blog_read_completed', meta));

  // Dernier article lu, en propriété SUPER : elle accompagne les événements
  // suivants, y compris l'inscription sur app.hippodoc.fr (le cookie la porte,
  // cf. `cookie_persisted_properties` dans PostHog.astro). Pas d'UTM sur le lien
  // d'inscription : ils écraseraient la vraie source (google/organic…).
  safe(() => posthog?.register?.({ hd_dernier_article: meta.slug, hd_derniere_serie: meta.series_id }), undefined);

  // Clics : UN écouteur délégué. La zone vient de `data-blog-zone`, posé au
  // build dans [slug].astro (corps, cta, faq, partage, plus-loin, connexes).
  // Avant ce lot, le clic sur le bouton d'inscription n'existait qu'en
  // autocapture, sans slug ni série : aucun entonnoir par article possible.
  safe(() => {
    article.addEventListener('click', (ev) => {
      safe(() => {
        const lien = (ev.target as Element | null)?.closest<HTMLAnchorElement>('a[href]');
        if (!lien || lien.hasAttribute('data-calendly')) return; // Calendly : déjà `calendly_clicked`
        const zone = lien.closest<HTMLElement>('[data-blog-zone]')?.dataset.blogZone ?? 'autre';
        const href = lien.getAttribute('href') ?? '';

        if (zone === 'partage') {
          emettre('blog_shared', { ...meta, network: (lien.dataset.ph ?? '').replace('blog_share_', '') });
        } else if (zone === 'connexes') {
          emettre('blog_related_clicked', {
            ...meta,
            to_slug: href.replace(/^\/blog\//, ''),
            rank: Number(lien.dataset.phRank) || 0,
          });
        } else if (lien.dataset.track || DESTINATIONS_CTA.test(href)) {
          emettre('blog_cta_clicked', {
            ...meta,
            cta_id: lien.dataset.track ?? href.split('#')[0],
            destination: href.split('?')[0],
            zone,
          });
        }
      }, undefined);
    }, { passive: true });
  }, undefined);

  // FAQ : même principe que `faq_question_opened` sur /faq — seule l'ouverture compte.
  safe(() => {
    article.querySelectorAll('[data-blog-zone="faq"] details').forEach((d, i) => {
      d.addEventListener('toggle', () => {
        if ((d as HTMLDetailsElement).open) emettre('blog_faq_opened', { ...meta, question_index: i });
      });
    });
  }, undefined);
}
