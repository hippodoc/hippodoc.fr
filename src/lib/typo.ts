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
 * Pages de liste du blog (phase 5c, MIGRATION.md § 9.ef) : même effet, sans
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

/** Un titre est du texte, pas du HTML : il est échappé avant d'être noué. */
export const echapper = (texte: string) =>
  texte.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
