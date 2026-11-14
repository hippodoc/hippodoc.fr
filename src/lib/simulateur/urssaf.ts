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
