// Options du plugin src/lib/rehype-article.mjs (balisage du corps des articles, MIGRATION.md § 9.fj).
// Lu par astro.config.mjs, qui passe aussi au plugin l'empreinte de ce fichier : un changement d'option
// refait le rendu des articles à la construction suivante (sans cela, Astro resservirait son cache).
export const OPTIONS_ARTICLE = {
  /** La section des sources dans <details class="sources-pli">, son h2 dans le <summary> (47 articles) :
      pli fermé sous 700 px, ouvert au-delà par la feuille. Le texte reste dans le HTML. */
  sourcesPli: true,
  /** L'encadré « L'essentiel » remonté en premier bloc du corps (11 articles où il suivait l'introduction). */
  essentielEnTete: true,
  /** aria-hidden="true" sur les émojis de décor (ni marque d'état, ni touche, ni main, ni note, ni émoji d'une
      légende) : un lecteur d'écran ne les annonce plus. Le texte de la page ne change pas. */
  decorMuet: true,
  /** Les comptes de chaque règle dans file.data.balisage.stats (pour un script de relevé ; jamais dans le cache). */
  stats: false,
};
