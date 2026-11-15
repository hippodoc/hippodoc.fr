/**
 * Typographie française du guide, dans les nœuds de texte seulement (jamais dans les balises ni les
 * attributs : une espace insécable dans une classe ou un style casse la page sans message).
 * Portage de hippodoc-fiche/scripts/typo_fr.py, plus le signe moins des montants.
 */
const NB = ' ';
const FINE = ' ';

export function typo(t) {
  return t
    // milliers : « 12 000 € » (pas « 2026 123 »)
    .replace(/(?<!\d{4})(?<=\d) (?=\d{3}(?!\d))/g, NB)
    // avant ; ? ! % € » et :
    .replace(/ ([;?!%€»])/g, `${NB}$1`)
    .replace(/ :(?![-:/])/g, `${NB}:`)
    // après «
    .replace(/« /g, `«${NB}`)
    // apostrophe typographique
    .replace(/(\p{L})'(\p{L})/gu, '$1’$2')
    // un nombre et son unité ne se séparent pas
    .replace(/(\d) (jours?|mois|ans?|années?|semaines?|heures?|pages?|nuits?|semestres?|minutes?|min|h|ETP|fois|PASS|€)\b/g, `$1${NB}$2`)
    // « art. L113-9 », « n° 12 », « p. 7 » ne se coupent pas
    .replace(/(?<!\p{L})(art\.|n°|§|p\.) (?=\S)/gu, `$1${NB}`)
    // un montant négatif prend le vrai signe moins
    .replace(/(^|[\s(>])-(?=\d)/g, '$1−');
}

export function typoHtml(h) {
  return h.split(/(<[^>]*>)/).map((p) => (p.startsWith('<') ? p : typo(p))).join('');
}

export { NB, FINE };
