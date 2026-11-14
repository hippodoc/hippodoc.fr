/**
 * Cotisations sociales PAMC d'un médecin libéral, par le modèle officiel de l'Urssaf
 * (API publique de mon-entreprise.urssaf.fr, la même que celle qu'appelait la fonction
 * Supabase `calculate-urssaf`).
 *
 * Pourquoi l'appeler directement (audit du simulateur, novembre 2026) : la fonction
 * Supabase ne transmettait au modèle ni le secteur conventionnel (un secteur 2 était
 * calculé comme un secteur 1 : 18 369 € au lieu de 25 062 € de cotisations pour 70 000 €
 * de recettes et 5 000 € de charges), ni l'année (2025 calculée avec les règles 2026), ni
 * le statut de remplaçant (CURPS comptée à tort), ni la part de CSG-CRDS non déductible
 * (réintégrée au revenu imposable par l'administration, ignorée par la fonction).
 *
 * L'API répond aux requêtes de hippodoc.fr (en-tête CORS vérifié) ; aucune clé n'est
 * nécessaire. Ce module ne calcule PAS l'impôt : seulement les cotisations, que le moteur
 * local (`calculateRspmBreakdown`) reçoit ensuite pour l'impôt et le Super-Net.
 *
 * Réforme de l'assiette sociale, revenus 2025 et suivants (MIGRATION.md § 9.fv). Le modèle de
 * l'API (`modele-social`) ne l'applique pas encore : il calcule l'assiette comme avant (revenu
 * net, CSG-CRDS sur revenu + cotisations). L'Urssaf l'a écrite dans un autre modèle,
 * `modele-ti` (variation « après réforme », date ≥ 2025) ; ce module en reprend les règles
 * pour un médecin, en donnant à l'API ce qui change, rien de plus :
 * - l'assiette unique (« revenu brut social » abattu de 26 %, borné entre 1,76 % et 130 % du
 *   PASS ; en micro, les recettes après l'abattement de 34 %), pour les cotisations ET la
 *   CSG-CRDS, sans réintégration des cotisations ;
 * - le taux de la tranche 1 de la retraite de base (8,73 % au lieu de 8,23 %) ;
 * - le barème maladie (taux progressif jusqu'à 8,5 % à 3 PASS, 6,5 % au-delà ; 8,5 % dans les
 *   DOM), remis en un taux moyen sur l'assiette (en secteur 1, l'Assurance maladie en prend en
 *   charge tout sauf 0,1 %, calculé par le modèle à partir de ce même taux) ;
 * - la contribution additionnelle sur la part non conventionnée : 3,25 %.
 * Et, ce que ni l'un ni l'autre modèle n'a encore : la complémentaire CARMF à 11,8 % en 2026
 * (« La CARMF en 2026 », p. 22 ; 10,2 % en 2024 et 2025). Les participations de l'Assurance
 * maladie, l'ASV, l'invalidité-décès, les indemnités journalières, les allocations familiales,
 * la CURPS et la formation professionnelle restent calculées par le modèle, sur la nouvelle
 * assiette.
 */

const API_URL = 'https://mon-entreprise.urssaf.fr/api/v1/evaluate';
const C = 'dirigeant . indépendant . cotisations et contributions';

/** Expressions demandées au modèle, dans cet ordre. */
const EXPRESSIONS = [
  C,
  `${C} . maladie`,
  `${C} . indemnités journalières maladie`,
  `${C} . allocations familiales`,
  `${C} . retraite de base`,
  `${C} . retraite complémentaire`,
  `${C} . invalidité et décès`,
  `${C} . PCV`,
  `${C} . exonérations`,
  `${C} . CSG-CRDS`,
  `${C} . CSG-CRDS . non déductible`,
  `${C} . contributions spéciales`,
  `${C} . formation professionnelle`,
] as const;

export interface CotisationsUrssaf {
  /** Total des cotisations et contributions obligatoires (€/an). */
  total: number;
  /** Part de CSG-CRDS non déductible du revenu imposable (2,4 % + 0,5 % de l'assiette). */
  csgCrdsNonDeductible: number;
  detail: {
    maladie: number;
    allocationsFamiliales: number;
    /** CARMF : retraite de base, complémentaire, invalidité-décès et ASV. */
    retraite: number;
    retraiteComplementaire: number;
    retraiteRid: number;
    csgCrds: number;
    /** Formation professionnelle et CURPS. */
    formation: number;
  };
}

export interface ParametresUrssaf {
  annee: number;
  /** Recettes annuelles soumises à cotisations (PDSA comprise). */
  recettes: number;
  /** Charges professionnelles annuelles (régime réel seulement). */
  charges: number;
  regime: 'reel' | 'micro-bnc';
  secteur: 'secteur_1' | 'secteur_2';
  /** Remplaçant exclusif : pas de CURPS (modèle Urssaf). */
  remplacant: boolean;
  /** Part des recettes hors convention, en %. */
  ratioNonConventionne: number;
  /** Département d'outre-mer, ou rien en métropole. */
  departementOutreMer?: 'Guadeloupe' | 'Martinique' | 'Guyane' | 'La Réunion' | 'Mayotte';
}

const texte = (s: string) => `'${s}'`;

/** PASS annuel (CSS art. D242-17) : 2024 à 2026. */
const PASS: Record<number, number> = { 2024: 46368, 2025: 47100, 2026: 48060 };
const passDe = (annee: number) => PASS[annee] ?? PASS[2026];

/** Réforme de l'assiette sociale : revenus 2025 et suivants. */
export const reformeAssiette = (annee: number) => annee >= 2025;

/**
 * Assiette unique d'un médecin au réel (`modele-ti`, `assiette CSG-CRDS`, après réforme) :
 * revenu brut (recettes − charges hors prélèvements sociaux), moins un abattement de 26 % arrondi
 * à l'euro, borné entre 1,76 % et 130 % du PASS. Jamais négative.
 */
export function assietteReformee(revenuBrut: number, annee: number): number {
  const pass = passDe(annee);
  const abattement = Math.round(Math.min(Math.max(0.26 * revenuBrut, 0.0176 * pass), 1.3 * pass));
  return Math.max(0, Math.round(revenuBrut - abattement));
}

/** Assiette en micro-BNC : les recettes après l'abattement de 34 % (305 € au moins). */
export function assietteMicro(recettes: number): number {
  return Math.max(0, Math.round(recettes - Math.min(recettes, Math.max(305, 0.34 * recettes))));
}

/**
 * « taux progressif » de publicodes : sous le premier plafond, le premier taux ; entre deux
 * plafonds, interpolation linéaire ; au-delà du dernier, le dernier taux. Plafonds en part du PASS.
 */
export function tauxProgressif(assiette: number, pass: number, tranches: Array<[number, number]>): number {
  const x = assiette / pass;
  if (x <= tranches[0][0]) return tranches[0][1];
  for (let i = 1; i < tranches.length; i++) {
    const [p0, t0] = tranches[i - 1];
    const [p1, t1] = tranches[i];
    if (x <= p1) return t0 + ((t1 - t0) * (x - p0)) / (p1 - p0);
  }
  return tranches[tranches.length - 1][1];
}

/**
 * Taux maladie-maternité moyen après réforme (`modele-ti`, `maladie-maternité . avant
 * exonérations`) : barème à deux tranches, la première jusqu'à 3 PASS à un taux progressif (0 %
 * jusqu'à 20 % du PASS, 1,5 % à 40 %, 4 % à 60 %, 6,5 % à 110 %, 7,7 % à 200 %, 8,5 % à 300 % ;
 * 8,5 % dans les DOM), la seconde à 6,5 %. Taux arrondi à deux décimales, comme le modèle.
 */
export function tauxMaladieReforme(assiette: number, annee: number, outreMer: boolean): number {
  if (assiette <= 0) return 0;
  const pass = passDe(annee);
  const t1 = outreMer ? 0.085 : Math.round(tauxProgressif(assiette, pass, [
    [0.2, 0], [0.4, 0.015], [0.6, 0.04], [1.1, 0.065], [2, 0.077], [3, 0.085],
  ]) * 10000) / 10000;
  const montant = t1 * Math.min(assiette, 3 * pass) + 0.065 * Math.max(0, assiette - 3 * pass);
  return montant / assiette;
}

/** Complémentaire CARMF : 11,8 % en 2026 (« La CARMF en 2026 », p. 22), 10,2 % avant. */
const tauxComplementaireCarmf = (annee: number) => (annee >= 2026 ? 0.118 : 0.102);
const pourcent = (taux: number) => `${(taux * 100).toFixed(4)} %`;

/** Situation publicodes d'un médecin en entreprise individuelle à l'IR. Exportée pour les tests. */
export function situationMedecin(p: ParametresUrssaf): Record<string, string> {
  const s: Record<string, string> = {
    // Le modèle applique les taux de l'année de cette date.
    'date': `01/01/${p.annee}`,
    'entreprise . catégorie juridique': texte('EI'),
    'entreprise . catégorie juridique . EI . auto-entrepreneur': 'non',
    'entreprise . activité . nature': texte('libérale'),
    'entreprise . activité . nature . libérale . réglementée': 'oui',
    'dirigeant . indépendant . PL . métier': texte('santé . médecin'),
    'dirigeant . indépendant . PL . métier . santé . médecin . secteur': texte(p.secteur === 'secteur_2' ? 'S2' : 'S1'),
    'dirigeant . indépendant . PL . PAMC . remplaçant': p.remplacant ? 'oui' : 'non',
    'dirigeant . indépendant . PL . PAMC . proportion recette activité non conventionnée': `${Math.min(100, Math.max(0, p.ratioNonConventionne || 0))} %`,
    'entreprise . imposition': texte('IR'),
    "entreprise . chiffre d'affaires": `${Math.round(Math.max(0, p.recettes))} €/an`,
  };
  if (p.regime === 'micro-bnc') {
    s['entreprise . imposition . IR . régime micro-fiscal'] = 'oui';
  } else {
    s['entreprise . imposition . IR . régime micro-fiscal'] = 'non';
    s['entreprise . charges'] = `${Math.round(Math.max(0, p.charges))} €/an`;
  }
  if (p.departementOutreMer) {
    s['établissement . commune . département'] = texte(p.departementOutreMer);
  }

  // Réforme de l'assiette sociale (revenus 2025 et suivants) : voir l'en-tête du module.
  if (reformeAssiette(p.annee)) {
    const I = 'dirigeant . indépendant';
    const assiette = p.regime === 'micro-bnc'
      ? assietteMicro(p.recettes)
      : assietteReformee(p.recettes - p.charges, p.annee);
    const mayotte = p.departementOutreMer === 'Mayotte';
    s[`${I} . assiette des cotisations`] = `${assiette} €/an`;
    // Mayotte : pas de CSG-CRDS, et sa maladie a ses propres règles (laissées au modèle).
    if (!mayotte) {
      s[`${C} . CSG-CRDS . assiette`] = `${assiette} €/an`;
      s[`${I} . PL . maladie . taux`] = pourcent(tauxMaladieReforme(assiette, p.annee, Boolean(p.departementOutreMer)));
      s[`${I} . assiette minimale . maladie`] = '0 €/an';
    }
    s[`${I} . PL . CNAVPL . retraite . tranche T1 . taux`] = '8.73 %';
    s[`${I} . PL . PAMC . maladie . contribution additionnelle . taux`] = '3.25 %';
    if (p.annee >= 2026) {
      const complementaire = Math.round(Math.min(assiette, 3.5 * passDe(p.annee)) * tauxComplementaireCarmf(p.annee));
      s[`${I} . PL . CARMF . retraite complémentaire`] = `${complementaire} €/an`;
    }
  }
  return s;
}

const nombre = (v: unknown): number => (typeof v === 'number' && Number.isFinite(v) ? v : 0);

/**
 * Interroge le modèle Urssaf. Lève une erreur si l'API est injoignable ou si la
 * situation est refusée : l'appelant se replie alors sur la fonction Supabase.
 */
export async function calculerCotisationsUrssaf(p: ParametresUrssaf): Promise<CotisationsUrssaf> {
  const body = JSON.stringify({ situation: situationMedecin(p), expressions: EXPRESSIONS });
  const appeler = () => fetch(API_URL, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body });
  let res = await appeler();
  // L'API limite le débit (429) : une seconde tentative après une courte pause.
  if (res.status === 429) {
    await new Promise((r) => setTimeout(r, 1500));
    res = await appeler();
  }
  if (!res.ok) throw new Error(`URSSAF HTTP ${res.status}`);
  const json = await res.json();
  if (json?.situationError || !Array.isArray(json?.evaluate)) {
    throw new Error(`URSSAF situation refusée : ${json?.situationError?.message ?? 'réponse inattendue'}`);
  }
  const v = (json.evaluate as Array<{ nodeValue: unknown }>).map((e) => nombre(e?.nodeValue));
  const [total, maladie, ijMaladie, af, retraiteBase, complementaire, invalidite, asv, exonerations, csgCrds, csgNonDeductible, contributionsSpeciales, formation] = v;
  if (!(total > 0)) throw new Error('URSSAF : total de cotisations nul ou absent');

  return {
    total,
    csgCrdsNonDeductible: csgNonDeductible,
    detail: {
      maladie: maladie + ijMaladie,
      allocationsFamiliales: af,
      // Les exonérations (ACRE, DROM…) sont retranchées de la retraite pour garder un total juste.
      retraite: retraiteBase + complementaire + invalidite + asv - exonerations,
      retraiteComplementaire: complementaire,
      retraiteRid: invalidite,
      csgCrds,
      formation: formation + contributionsSpeciales,
    },
  };
}
