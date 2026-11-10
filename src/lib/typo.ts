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
