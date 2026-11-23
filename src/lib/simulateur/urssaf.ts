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
 *
 * Début d'activité et ASV proportionnelle (MIGRATION.md § 9.fx) : voir `situationMedecin`.
 *
 * Outre-mer (MIGRATION.md § 9.hl) : exonération des indépendants d'outre-mer, que le modèle ne
 * compte pas ; voir « Exonération des indépendants d'outre-mer », plus bas.
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
    /** Retraite de base (participation de l'Assurance maladie déduite en secteur 1). */
    retraiteBase: number;
    /** Allocations supplémentaires de vieillesse (ASV), part du médecin. */
    asv: number;
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
  /** 1re ou 2e année d'affiliation à la CARMF : complémentaire non due, ASV d'ajustement sur la
   *  base forfaitaire (CARMF, « Vos cotisations en début d'activité », 2026). */
  debutActivite?: 'premiere' | 'deuxieme';
  /** ASV proportionnelle demandée (appliquée si elle coûte moins que le forfait : revenu
   *  conventionné sous 63 900 € en 2026). */
  asvProportionnelle?: boolean;
  /** Dispense d'ASV accordée pour l'année (CARMF, « Dispenses pour insuffisance de revenus » : revenu
   *  médical libéral net de l'avant-dernière année inférieur ou égal à 15 000 €) : plus d'ASV, part
   *  forfaitaire et part d'ajustement, sans points. */
  dispenseAsv?: boolean;
  /** Cotisations provisionnelles d'une 1re année : tout sur la base forfaitaire (19 % du PASS). */
  provisionnel?: boolean;
  /** Outre-mer : activité commencée sur place, jamais exercée ailleurs avant (avec `debutActivite`,
   *  ouvre l'exonération entière des 24 premiers mois ; sinon, abattement de 50 %). */
  debutOutreMer?: boolean;
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

/** Base forfaitaire des deux premières années d'activité : 19 % du PASS, arrondie (9 131 € en
 *  2026 ; CARMF, « Vos cotisations en début d'activité » ; modèle Urssaf, « début activité »). */
export const baseForfaitaireDebut = (annee: number) => Math.round(0.19 * passDe(annee));

/** Taux de l'ASV d'ajustement : 4 % en 2026, 3,8 % avant (CARMF ; modèle Urssaf). */
const tauxAsvAjustement = (annee: number) => (annee >= 2026 ? 0.04 : 0.038);

/** Part forfaitaire de l'ASV, avant la prise en charge du secteur 1 (modèle Urssaf ; CARMF). */
const forfaitAsv = (annee: number) => (annee >= 2026 ? 5751 : 5556);

/** Taux de l'ASV proportionnelle, avant la prise en charge du secteur 1 (3 % au médecin). */
const TAUX_ASV_PROPORTIONNELLE = 0.09;

/** Part de l'ASV payée par le médecin : un tiers en secteur 1 (l'Assurance maladie prend en
 *  charge les deux tiers, forfait et ajustement), tout en secteur 2. */
const partAsvDuMedecin = (secteur?: 'secteur_1' | 'secteur_2') => (secteur === 'secteur_2' ? 1 : 1 / 3);

/** Revenu conventionné : l'assiette, moins la part non conventionnée (comme le modèle Urssaf,
 *  « PAMC . revenus activité conventionnée »). */
export const revenuConventionne = (assiette: number, ratioNonConventionne: number) =>
  assiette * (1 - Math.min(100, Math.max(0, ratioNonConventionne || 0)) / 100);

/**
 * ASV proportionnelle, sur demande (CARMF, « Réductions de cotisations », 2026) : « Les médecins
 * dont le revenu conventionné 2024 est inférieur à 63 900 € peuvent demander que soit substituée
 * à la cotisation forfaitaire ASV 2026, une cotisation proportionnelle à ces revenus, à hauteur de
 * 3 % pour les médecins en secteur 1 et 9 % pour les médecins en secteur 2. » Elle remplace la
 * part forfaitaire seulement ; la part d'ajustement reste due. Le seuil est le revenu où les deux
 * se valent (9 % de 63 900 € = 5 751 €, le forfait de 2026) : l'option est ouverte tant qu'elle
 * coûte moins que le forfait. Renvoie ce qu'elle fait gagner au médecin (€/an), 0 si elle n'est
 * pas ouverte.
 */
export function economieAsvProportionnelle(annee: number, conventionne: number, secteur?: 'secteur_1' | 'secteur_2'): number {
  return Math.max(0, forfaitAsv(annee) - TAUX_ASV_PROPORTIONNELLE * conventionne) * partAsvDuMedecin(secteur);
}

/** Complémentaire CARMF : 11,8 % en 2026 (« La CARMF en 2026 », p. 22), 10,2 % avant. */
const tauxComplementaireCarmf = (annee: number) => (annee >= 2026 ? 0.118 : 0.102);

/** Complémentaire CARMF sur une assiette (plafonnée à 3,5 PASS). */
export const complementaireCarmf = (assiette: number, annee: number) =>
  Math.round(Math.min(assiette, 3.5 * passDe(annee)) * tauxComplementaireCarmf(annee));
const pourcent = (taux: number) => `${(taux * 100).toFixed(4)} %`;

// ─────────────────────────────────────────────────────────────────────────────────────────────────
// Exonération des indépendants d'outre-mer (MIGRATION.md § 9.hl, novembre 2026). Même règle que
// l'application (`supabase/functions/_shared/urssaf-mapping.ts` du dépôt de l'application) ; le
// modèle de l'Urssaf ne la compte pas (« Ce simulateur ne prend pas en compte les exonérations DROM »).
//
// Textes (Légifrance, lus le 22/11/2026) :
//  - CSS L756-2 : maladie, indemnités journalières, allocations familiales et CSG-CRDS « ne sont pas
//    dues pour une période de vingt-quatre mois à compter de la date de création de l'activité »
//    quand le revenu, rapporté à l'année, est inférieur à 110 % du PASS ; entre 110 % et 150 %,
//    l'exonération est celle d'un revenu de 110 % du PASS ; elle décroît ensuite et s'annule à 250 %.
//    Les cotisations de la CARMF restent dues.
//  - CSS L756-4 : sous 250 % du PASS, ces cotisations sont calculées, « pour la partie des revenus
//    inférieure au montant annuel du plafond », sur une assiette abattue de 50 % (75 % « au titre de
//    la troisième année civile d'activité ») ; l'abattement décroît de 150 % à 250 % du PASS.
//  - CSS D756-4 : entre 150 % et 250 % du PASS, exonération = E / PASS × (2,5 PASS − R), E étant
//    l'exonération due pour un revenu de 150 % du PASS.
//  - CSS R131-3 et Cass. 2e civ., 9 janvier 2025, n° 22-22.832 : le changement de lieu d'exercice n'est
//    pas un début d'activité. Les 24 mois ne valent que pour une activité commencée outre-mer.
//
// Taux pleins outre-mer (urssaf.fr, « Taux de cotisations - Profession libérale réglementée »,
// 27/02/2026 ; modèle `modele-ti` de l'Urssaf) : maladie 8,50 %, allocations familiales 3,10 % sans
// taux réduit, indemnités journalières 0,30 %, CSG-CRDS 9,70 %.
//
// Choix prudents, à faire confirmer par la caisse d'outre-mer (CGSS) :
//  - les seuils (110 %, 150 %, 250 % du PASS) sont comparés au revenu AVANT l'abattement de 26 % de
//    la réforme (D756-4 renvoie à L131-6, donc à l'assiette abattue : lecture plus favorable, non
//    retenue tant qu'elle n'est pas confirmée) ;
//  - la contribution additionnelle de 3,25 % sur les revenus non conventionnés reste due ;
//  - l'exonération de maladie sous 13 % du PASS (L756-5, D756-6) n'est pas comptée ;
//  - au RSPM, aucune réduction (aucun texte ne l'adapte à l'outre-mer).
// Ordre avec la prise en charge de l'Assurance maladie : celui du modèle de l'Urssaf (« La
// participation de la CPAM […] s'applique après déduction des exonérations »). En secteur 1, la
// maladie du médecin reste donc 0,1 % de son revenu conventionné tant que l'exonération est partielle.
// Le simulateur ne connaît pas la date de début : il compte l'année entière, l'exonération entière
// en 1re et 2e années d'une activité commencée outre-mer, 50 % sinon (la 3e année, la loi donne
// 75 % : le simulateur garde 50 %). Avant les revenus 2025 (assiette calculée par le modèle), rien
// n'est compté.
// ─────────────────────────────────────────────────────────────────────────────────────────────────

/** Taux pleins outre-mer des quatre cotisations visées, en part de l'assiette. */
export const TAUX_OUTRE_MER = { maladie: 0.085, allocationsFamiliales: 0.031, indemnitesJournalieres: 0.003, csgCrds: 0.097 } as const;

/** Une partie de l'année : sa part (0 à 1), la part exonérée, et le plafond de revenu concerné (en PASS). */
export interface SegmentOutreMer { poids: number; taux: number; plafond: number }
export interface PeriodeOutreMer {
  segments: SegmentOutreMer[];
  /** Part de l'année couverte par l'affiliation (CSS D756-7) ; 1 dans le simulateur. */
  prorataPass: number;
}

/** Période du simulateur : exonération entière en début d'activité commencée outre-mer, 50 % sinon. */
export function periodeOutreMer(debutActivite?: 'premiere' | 'deuxieme', debutOutreMer?: boolean): PeriodeOutreMer {
  return debutActivite && debutOutreMer
    ? { segments: [{ poids: 1, taux: 1, plafond: 1.1 }], prorataPass: 1 }
    : { segments: [{ poids: 1, taux: 0.5, plafond: 1 }], prorataPass: 1 };
}

/**
 * Part des quatre cotisations que l'exonération retire (0 à 1), pour une assiette et une période.
 * Par partie de l'année : taux × dégressivité × part de l'assiette sous le plafond.
 * `revenuSeuils` : le revenu comparé à 150 % et 250 % du PASS (voir « choix prudents » ci-dessus).
 */
export function reductionOutreMer(annee: number, assiette: number, revenuSeuils: number, periode: PeriodeOutreMer): number {
  const pass = passDe(annee) * periode.prorataPass;
  if (!(pass > 0)) return 0;
  const degressif = revenuSeuils < 1.5 * pass ? 1 : revenuSeuils < 2.5 * pass ? (2.5 * pass - revenuSeuils) / pass : 0;
  const reduction = periode.segments.reduce(
    (somme, s) => somme + s.poids * s.taux * (assiette > 0 ? Math.min(1, (s.plafond * pass) / assiette) : 1),
    0,
  );
  return Math.min(1, Math.max(0, reduction * degressif));
}

/** Guadeloupe, Martinique, Guyane, La Réunion : l'exonération ne vaut pas à Mayotte (régime propre). */
export const estDromHorsMayotte = (departement?: ParametresUrssaf['departementOutreMer']): boolean =>
  Boolean(departement) && departement !== 'Mayotte';

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
  // Cotisations provisionnelles d'une 1re année : toutes sur la base forfaitaire, et l'entreprise
  // créée cette année (pas de CURPS l'année de la création, dans le modèle).
  const I = 'dirigeant . indépendant';
  const debut = Boolean(p.debutActivite) || Boolean(p.provisionnel);
  if (p.provisionnel) s['entreprise . date de création'] = `01/01/${p.annee}`;
  let assiette: number | null = null;
  if (p.provisionnel) assiette = baseForfaitaireDebut(p.annee);
  else if (reformeAssiette(p.annee)) {
    assiette = p.regime === 'micro-bnc'
      ? assietteMicro(p.recettes)
      : assietteReformee(p.recettes - p.charges, p.annee);
  }
  if (assiette !== null) {
    const mayotte = p.departementOutreMer === 'Mayotte';
    s[`${I} . assiette des cotisations`] = `${assiette} €/an`;
    // Mayotte : pas de CSG-CRDS, et sa maladie a ses propres règles (laissées au modèle).
    if (!mayotte) {
      // Outre-mer : l'exonération retire une même part de la maladie (au taux plein), des allocations
      // familiales, des indemnités journalières et de la CSG-CRDS. Le modèle applique ensuite la
      // prise en charge de l'Assurance maladie sur ce qui reste.
      const outreMer = estDromHorsMayotte(p.departementOutreMer);
      // Revenu avant l'abattement de 26 % (au micro-BNC et sur la base forfaitaire : l'assiette).
      const revenuSeuils = p.provisionnel || p.regime === 'micro-bnc' ? assiette : Math.max(0, p.recettes - p.charges);
      const reduction = outreMer ? reductionOutreMer(p.annee, assiette, revenuSeuils, periodeOutreMer(p.debutActivite, p.debutOutreMer)) : 0;
      const tauxMaladie = Math.max(0, tauxMaladieReforme(assiette, p.annee, Boolean(p.departementOutreMer)) - reduction * TAUX_OUTRE_MER.maladie);
      s[`${C} . CSG-CRDS . assiette`] = `${Math.round(assiette * (1 - reduction))} €/an`;
      s[`${I} . PL . maladie . taux`] = pourcent(tauxMaladie);
      s[`${I} . assiette minimale . maladie`] = '0 €/an';
      if (outreMer) {
        // Allocations familiales : 3,10 % outre-mer, sans le taux réduit de la métropole.
        s[`${C} . allocations familiales . taux`] = pourcent(TAUX_OUTRE_MER.allocationsFamiliales * (1 - reduction));
        s[`${I} . PL . CNAVPL . indemnités journalières maladie . taux`] = pourcent(TAUX_OUTRE_MER.indemnitesJournalieres * (1 - reduction));
        // Secteur 1 : la prise en charge laisse 0,1 % au médecin ; sous 0,1 %, il n'y a plus rien à
        // prendre en charge (le modèle rendrait une prise en charge négative).
        if (tauxMaladie < 0.001 && p.secteur === 'secteur_1') {
          s[`${I} . PL . PAMC . maladie . participation CPAM`] = '0 €/an';
        }
      }
    }
    s[`${I} . PL . CNAVPL . retraite . tranche T1 . taux`] = '8.73 %';
    s[`${I} . PL . PAMC . maladie . contribution additionnelle . taux`] = '3.25 %';
  }
  // CURPS : pas due l'année de la création (`modele-ti` : « date de création ≤ début d'année » ;
  // l'ancien modèle la compte, 46 € pour un installé en 2026).
  if (p.debutActivite === 'premiere' || p.provisionnel) {
    s[`${I} . PL . PAMC . CURPS`] = '0 €/an';
  }
  // Complémentaire CARMF : non due les deux premières années ; 11,8 % à partir de 2026.
  if (debut) {
    s[`${I} . PL . CARMF . retraite complémentaire`] = '0 €/an';
  } else if (assiette !== null && p.annee >= 2026) {
    s[`${I} . PL . CARMF . retraite complémentaire`] = `${complementaireCarmf(assiette, p.annee)} €/an`;
  }
  // ASV : les deux premières années, l'ajustement porte sur la base forfaitaire (365 € en 2026) ;
  // sinon, sur demande et si elle coûte moins, la cotisation proportionnelle de 9 % remplace la
  // part forfaitaire (l'ajustement reste calculé par le modèle). Dispense d'ASV (§ 9.hm) : aucune
  // ASV de l'année, quelle que soit l'ancienneté ; elle l'emporte sur la proportionnelle.
  if (p.dispenseAsv) {
    s[`${I} . PL . CARMF . ASV . forfaitaire`] = '0 €/an';
    s[`${I} . PL . CARMF . ASV . ajustement`] = '0 €/an';
  } else if (debut) {
    s[`${I} . PL . CARMF . ASV . ajustement`] = `${Math.round(baseForfaitaireDebut(p.annee) * tauxAsvAjustement(p.annee))} €/an`;
  } else if (p.asvProportionnelle && assiette !== null && p.secteur) {
    const conventionne = revenuConventionne(assiette, p.ratioNonConventionne);
    if (economieAsvProportionnelle(p.annee, conventionne, p.secteur) > 0) {
      s[`${I} . PL . CARMF . ASV . forfaitaire`] = `${Math.round(TAUX_ASV_PROPORTIONNELLE * conventionne)} €/an`;
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
      retraiteBase,
      asv,
      csgCrds,
      formation: formation + contributionsSpeciales,
    },
  };
}
