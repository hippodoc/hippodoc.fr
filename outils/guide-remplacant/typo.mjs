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
    .replace(/(^|[\s(>])-(?=\d)/g, '$1−')
    // le jour et le mois ne se séparent pas : « 31 décembre », « 1er janvier »
    .replace(/(\d{1,2}(?:er)?) (janvier|février|mars|avril|mai|juin|juillet|août|septembre|octobre|novembre|décembre)\b/g, `$1${NB}$2`);
}

/** Balisage typographique, après typo() : ordinaux en exposant, numéros d'article insécables. */
export function balises(t) {
  return t
    // « 1re », « 2e », « 91e », « 1er » en exposant (pas « 2035 », pas « 5HQ »)
    .replace(/(^|[^\p{L}\d])(\d{1,3})(er|re|e)(?=[\s\u00a0.,;:)»]|$)/gu, '$1$2<sup>$3</sup>')
    // numéros d'article, de formulaire, de décret : jamais coupés au trait d'union
    .replace(/(?<![\p{L}\d-])((?:[LRD]\d{3,4}|\d{3,4})(?:-\d+)+(?:°|-[A-Z]+(?:-[A-Z]+)*)?|\d{4}-C-(?:PRO|SD)|1447-C-SD)(?![\p{L}\d])/gu, '<span class="art">$1</span>')
}

export function typoHtml(h) {
  return h.split(/(<[^>]*>)/).map((p) => (p.startsWith('<') ? p : balises(typo(p)))).join('');
}

export { NB, FINE };
