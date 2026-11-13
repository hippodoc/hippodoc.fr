// Options du plugin src/lib/rehype-article.mjs (balisage du corps des articles, MIGRATION.md § 9.fj).
// Lu par astro.config.mjs, qui passe aussi au plugin l'empreinte de ce fichier : un changement d'option
// refait le rendu des articles à la construction suivante (sans cela, Astro resservirait son cache).
export const OPTIONS_ARTICLE = {
  /** Chaque h2 et son contenu dans <section class="sec" data-sec="normal|encadre|hippo|sources"> ;
      l'introduction (avant le premier h2) dans <div class="sec-intro">. Non employé par le gabarit. */
  sections: false,
  /** La section des sources dans <details class="sources-pli">, son h2 dans le <summary> (47 articles) :
      pli fermé sous 700 px, ouvert au-delà par la feuille. Le texte reste dans le HTML. */
  sourcesPli: true,
  /** L'encadré « L'essentiel » remonté en premier bloc du corps (11 articles où il suivait l'introduction). */
  essentielEnTete: true,
  /** aria-hidden="true" sur les émojis de décor (data-em-role="decor") : un lecteur d'écran ne les annonce plus.
      Le texte de la page ne change pas. */
  decorMuet: true,
};
