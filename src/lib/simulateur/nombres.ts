/**
 * Nombres du simulateur, en français (MIGRATION.md § 9.gi).
 *
 * `Intl.NumberFormat('fr-FR')` sépare les milliers d'une espace fine insécable (U+202F). Dans
 * Google Sans Flex, elle ne fait que 0,11 em (1,8 px en 16 px) : « 21 504 € » se lisait
 * « 21504 € ». Les nombres affichés passent donc par ces fonctions, qui posent une espace
 * insécable ordinaire (U+00A0, 0,225 em) à sa place. Essayé d'abord : une face de police qui
 * élargit U+202F (`size-adjust`) ; WebKit agrandit alors de 2 à 4 px les lignes serrées qui
 * contiennent un nombre (montant des tuiles, total du mois), quels que soient les réglages de
 * métriques.
 */

/** Remplace l'espace fine insécable (U+202F) par une espace insécable (U+00A0). */
export const espaceMilliers = (texte: string): string => texte.replace(/\u202f/g, '\u00a0');

/** Comme `new Intl.NumberFormat(locale, options)`, avec l'espace des milliers lisible. */
export function formatNombre(locale: string, options?: Intl.NumberFormatOptions): { format: (valeur: number) => string } {
  const f = new Intl.NumberFormat(locale, options);
  return { format: (valeur: number) => espaceMilliers(f.format(valeur)) };
}

/** Comme `valeur.toLocaleString('fr-FR', options)`, avec l'espace des milliers lisible. */
export const nombreFr = (valeur: number, options?: Intl.NumberFormatOptions): string =>
  espaceMilliers(valeur.toLocaleString('fr-FR', options));
