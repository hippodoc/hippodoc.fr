/**
 * Typographie française à l'affichage, pour les textes de l'accueil repris mot
 * pour mot de fichiers de données (DA 2026, phase 3, MIGRATION.md § 9).
 *
 * Une seule retouche, invisible à la lecture : l'espace qui précède « ? », « ! »,
 * « : », « ; » et « » », et celle qui suit « « », deviennent insécables. Plus de
 * ponctuation seule en début de ligne. Les mots, les apostrophes et les fichiers
 * de données ne changent pas ; le JSON-LD FAQPage garde les espaces d'origine.
 *
 * Accepte du HTML (réponses de la FAQ) : une valeur d'attribut n'y contient
 * jamais d'espace suivie d'une de ces ponctuations (liens internes sans espace).
 */
export function insecables(texte: string): string {
  return texte.replace(/ ([?!:;»])/g, ' $1').replace(/« /g, '« ');
}

/**
 * Pages de liste du blog (phase 5c, MIGRATION.md § 9.ej) : même effet, sans
 * changer un seul caractère du texte (période d'observation SEO). Un mot et la
 * ponctuation qui le suit après une espace (? ! : ; / »), ou le guillemet ouvrant
 * et le mot qui le suit, tiennent ensemble dans un <span class="num"> ; l'espace
 * reste une espace, les balises sont laissées telles quelles.
 *
 * Même fonction que dans `pages/faq.astro` et `pages/blog/[slug].astro`, qui
 * gardent leur copie (leur HTML ne bouge pas pendant la période d'observation).
 */
export const nouer = (html: string) =>
  html
    .split(/(<[^>]+>)/)
    .map((morceau) =>
      morceau.startsWith('<')
        ? morceau
        : morceau.replace(/(?:« )?[^\s«]+(?: [?!:;/»](?=[\s"')\].,]|$))+|« [^\s«]+/g, '<span class="num">$&</span>')
    )
    .join('');

/**
 * Extraits des pages de liste du blog (§ 9.fk) : un nombre ne se coupe pas.
 * « 3 900 € », « 11 379 € », « 547 € », « 20 % » tiennent dans un
 * <span class="nb"> (blanc insécable par la feuille), sans changer un caractère.
 * À appliquer à du texte échappé, avant `nouer` (qui laisse les balises telles
 * quelles).
 */
export const nouerNombres = (html: string) =>
  html.replace(/\d{1,3}(?:[ \u00a0\u202f]\d{3})+(?:,\d+)?(?:[ \u00a0\u202f]?(?:€|%))?|\d+(?:,\d+)?[ \u00a0\u202f](?:€|%)/g, '<span class="nb">$&</span>');

/** Un titre est du texte, pas du HTML : il est échappé avant d'être noué. */
export const echapper = (texte: string) =>
  texte.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
