/**
 * Slugs d'URL des pages de série du blog.
 *
 * Séparé de `blog-series.ts`, qui est GÉNÉRÉ depuis la SPA source et porte la
 * mention « ne pas éditer à la main » : y ajouter un champ le ferait écraser au
 * prochain import. Les identifiants internes (`fiche-pratique`…) restent la clé
 * de `seriesId` dans le frontmatter des articles ; seule l'URL publique change.
 *
 * ⚠️ URLs publiques figées : ces slugs ne doivent plus être renommés une fois en
 * ligne (une page de série indexée est une porte d'entrée SEO au même titre
 * qu'un article).
 */
import { blogSeries, type BlogSeries } from './blog-series';

export const SERIES_SLUGS: Record<string, string> = {
  'fiche-pratique': 'fiches-pratiques',
  'fiche-fiscalite': 'fiches-fiscalite',
  divers: 'guides-conseils',
};

/** Chemin public d'une série (sans slash final, cf. `trailingSlash: 'never'`). */
export const seriesPath = (seriesId: string) => `/blog/serie/${SERIES_SLUGS[seriesId]}`;

/** Série correspondant à un slug d'URL, ou undefined si le slug est inconnu. */
export function seriesFromSlug(slug: string): BlogSeries | undefined {
  const id = Object.keys(SERIES_SLUGS).find((k) => SERIES_SLUGS[k] === slug);
  return id ? blogSeries.find((s) => s.id === id) : undefined;
}
