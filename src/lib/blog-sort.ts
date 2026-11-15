/**
 * Ordre d'affichage des articles, partagé par /blog, les pages de thème, llms.txt, le flux
 * RSS, l'index de recherche et les images de partage. (L'ordre de lecture des séries,
 * `byEpisode`, est parti avec leurs pages, § 9.fq.)
 *
 * Trier sur la seule `pubDate` ne suffisait pas : 38 articles sur 46 partagent leur
 * date avec au moins un autre, et le départage retombait sur l'ordre alphabétique
 * des fichiers (la « une » de /blog dépendait de la première lettre du slug, les
 * fiches numérotées s'affichaient #3, #4, #8, #6…). Voir MIGRATION.md § 9.bc.
 */
type Sortable = { id: string; data: { pubDate: Date; episodeNumber?: number } };

/** Plus récent d'abord ; à date égale, épisode le plus élevé ; puis slug. */
export function byNewest(a: Sortable, b: Sortable): number {
  return (
    b.data.pubDate.getTime() - a.data.pubDate.getTime() ||
    (b.data.episodeNumber ?? 0) - (a.data.episodeNumber ?? 0) ||
    a.id.localeCompare(b.id)
  );
}

