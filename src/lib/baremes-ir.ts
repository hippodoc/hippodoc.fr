/**
 * Barèmes de l'Impôt sur le Revenu — Centralisés par année
 * 
 * Source : Loi de finances 2025 (revenus 2024) et LF 2026 (revenus 2025)
 * Article 197 du Code Général des Impôts
 * 
 * ⚠️ Ce fichier est la SEULE source de vérité pour les tranches IR.
 *    Ne jamais hardcoder les seuils ailleurs.
 */

export interface TrancheIR {
  limite: number;
  taux: number;
  label: string;
}

export interface BaremeIR {
  tranches: TrancheIR[];
  plafondQfParDemiPart: number;     // Plafonnement du quotient familial (Article 197 CGI)
  plafondQfCaseT: number;           // Plafond majoré case T parent isolé (Article 197 CGI)
  plafondAbattement10Salaire: number; // Plafond abattement 10% salariés
  plancherAbattement10Salaire: number; // Plancher abattement 10% salariés
}

// ═══════════════════════════════════════════════════════════
// BARÈME 2025 (revenus 2024 — Loi de finances 2025)
// ═══════════════════════════════════════════════════════════
const BAREME_2025: BaremeIR = {
  tranches: [
    { limite: 11497, taux: 0, label: '0%' },
    { limite: 29315, taux: 0.11, label: '11%' },
    { limite: 83823, taux: 0.30, label: '30%' },
    { limite: 180294, taux: 0.41, label: '41%' },
    { limite: Infinity, taux: 0.45, label: '45%' },
  ],
  plafondQfParDemiPart: 1791,
  plafondQfCaseT: 4149,              // Plafond majoré case T parent isolé
  plafondAbattement10Salaire: 14426,
  plancherAbattement10Salaire: 504,
};

// ═══════════════════════════════════════════════════════════
// BARÈME 2026 (revenus 2025 — Loi de finances 2026)
// ═══════════════════════════════════════════════════════════
const BAREME_2026: BaremeIR = {
  tranches: [
    { limite: 11600, taux: 0, label: '0%' },
    { limite: 29579, taux: 0.11, label: '11%' },
    { limite: 84577, taux: 0.30, label: '30%' },
    { limite: 181917, taux: 0.41, label: '41%' },
    { limite: Infinity, taux: 0.45, label: '45%' },
  ],
  /* Ces quatre seuils suivent l'indexation du barème (+0,9 % au titre des revenus
     2025, LF 2026 art. 4). Ils avaient été recopiés du barème 2025 avec la mention
     « inchangé », ce qui était faux : le BOFiP les revalorise comme les tranches.
     Sources : BOI-IR-LIQ-20-20-20 (quotient familial) et brochure IR 2026. */
  plafondQfParDemiPart: 1807,        // BOI-IR-LIQ-20-20-20 : « 1 807 € par demi-part supplémentaire »
  plafondQfCaseT: 4262,              // BOI-IR-LIQ-20-20-20 : « 4 262 € » — part supplémentaire du parent isolé
  plafondAbattement10Salaire: 14555, // Déduction forfaitaire de 10 % plafonnée à 14 555 € pour les revenus 2025
  plancherAbattement10Salaire: 509,  // Minimum de 509 € par salarié
};

// ═══════════════════════════════════════════════════════════
// INDEX PAR ANNÉE
// ═══════════════════════════════════════════════════════════
const BAREMES: Record<number, BaremeIR> = {
  2024: BAREME_2025, // Année fiscale 2024 → barème LF 2025
  2025: BAREME_2026, // Année fiscale 2025 → barème LF 2026 (brochure IR 2026)
  2026: BAREME_2026, // Année fiscale 2026 → barème LF 2026 (fallback)
  2027: BAREME_2026, // Fallback
  2028: BAREME_2026,
  2029: BAREME_2026,
  2030: BAREME_2026,
};

/**
 * Retourne le barème IR pour une année donnée.
 * Fallback sur le barème le plus récent si l'année n'est pas trouvée.
 */
export function getBaremeIR(annee: number = 2026): BaremeIR {
  return BAREMES[annee] || BAREME_2025;
}

/**
 * Retourne les tranches IR pour une année donnée.
 * Raccourci pour getBaremeIR(annee).tranches
 */
export function getTranchesIR(annee: number = 2026): TrancheIR[] {
  return getBaremeIR(annee).tranches;
}

/**
 * Calcule l'impôt brut par part selon le barème progressif.
 * Utilisable dans tous les hooks et Edge Functions.
 */
export function calculateRawTaxPerPart(quotientFamilial: number, annee: number = 2026): number {
  const tranches = getTranchesIR(annee);
  let impot = 0;
  let bornePrec = 0;
  
  for (const tranche of tranches) {
    if (quotientFamilial > bornePrec) {
      const base = Math.min(quotientFamilial, tranche.limite) - bornePrec;
      impot += base * tranche.taux;
      bornePrec = tranche.limite;
    } else {
      break;
    }
  }
  
  return impot;
}

/**
 * Retourne le TMI (Taux Marginal d'Imposition) pour un quotient familial donné.
 */
export function getTMI(quotientFamilial: number, annee: number = 2026): number {
  const tranches = getTranchesIR(annee);
  let tmi = 0;
  let bornePrec = 0;
  for (const tranche of tranches) {
    if (quotientFamilial > bornePrec) {
      if (tranche.taux > 0) tmi = tranche.taux * 100;
      bornePrec = tranche.limite;
    } else {
      break;
    }
  }
  
  return tmi;
}

/**
 * Calcule l'impôt avec barème progressif + plafonnement QF (Article 197 CGI).
 * Fonction complète utilisable partout.
 */
export function calculateTaxWithPlafonnement(
  revenuImposable: number,
  partsTotales: number,
  partsBase: number,
  annee: number = 2026,
  situationFamiliale?: string
): { impot: number; plafonnementApplique: boolean; avantageInitial?: number; plafondUtilise?: number; decoteAppliquee?: number } {
  if (revenuImposable <= 0 || partsTotales <= 0) {
    return { impot: 0, plafonnementApplique: false };
  }

  const bareme = getBaremeIR(annee);
  const partsEnfants = Math.max(0, partsTotales - partsBase);

  // Impôt brut avec toutes les parts
  const qf = revenuImposable / partsTotales;
  const impotParPart = calculateRawTaxPerPart(qf, annee);
  const impotBrut = impotParPart * partsTotales;

  // Pas d'enfants → pas de plafonnement
  if (partsEnfants <= 0) {
    return {
      impot: Math.round(impotBrut),
      plafonnementApplique: false,
    };
  }

  // Impôt sans enfants
  const qfBase = revenuImposable / partsBase;
  const impotSansEnfants = calculateRawTaxPerPart(qfBase, annee) * partsBase;

  // Plafonnement — CGI Art. 197
  // Parent isolé (case T) : la 1ère demi-part bénéficie d'un plafond majoré (4 149€)
  const avantage = impotSansEnfants - impotBrut;
  const nbDemiParts = partsEnfants * 2;
  
  let plafond: number;
  if (situationFamiliale === 'parent_isole' && nbDemiParts >= 1) {
    // 1ère demi-part case T → plafond majoré, les suivantes → plafond standard
    plafond = bareme.plafondQfCaseT + Math.max(0, nbDemiParts - 1) * bareme.plafondQfParDemiPart;
  } else {
    plafond = nbDemiParts * bareme.plafondQfParDemiPart;
  }

  if (avantage > plafond) {
    const impotPlafonne = impotSansEnfants - plafond;
    return {
      impot: Math.round(impotPlafonne),
      plafonnementApplique: true,
      avantageInitial: Math.round(avantage),
      plafondUtilise: Math.round(plafond),
    };
  }

  return {
    impot: Math.round(impotBrut),
    plafonnementApplique: false,
  };
}

// ═══════════════════════════════════════════════════════════
// DÉCOTE IR — CGI Art. 197-I-4
// ═══════════════════════════════════════════════════════════
// Formule : decote = max(0, plafond − 0.4525 × IR_brut)
// Plafond célibataire/divorcé/veuf : 1 part de base
// Plafond couple marié/pacsé : 2 parts de base
//
// Sources : BOI-IR-LIQ-20-20-30 (décote, CGI art. 197-I-4) pour les revenus 2025,
// et LF 2025 pour les revenus 2024. Les valeurs 2026 ne sont plus une estimation :
// le BOFiP fixe la somme forfaitaire à 897 € (imposition individuelle) et 1 483 €
// (imposition commune), le taux restant à 45,25 % de l'impôt brut.

export interface DecoteParams {
  plafondSeul: number;
  plafondCouple: number;
  taux: number;
}

const DECOTE_BY_YEAR: Record<number, DecoteParams> = {
  2024: { plafondSeul: 889, plafondCouple: 1471, taux: 0.4525 },
  2025: { plafondSeul: 897, plafondCouple: 1483, taux: 0.4525 }, // BOFiP, revenus 2025
  2026: { plafondSeul: 897, plafondCouple: 1483, taux: 0.4525 },
  2027: { plafondSeul: 897, plafondCouple: 1483, taux: 0.4525 },
  2028: { plafondSeul: 897, plafondCouple: 1483, taux: 0.4525 },
  2029: { plafondSeul: 897, plafondCouple: 1483, taux: 0.4525 },
  2030: { plafondSeul: 897, plafondCouple: 1483, taux: 0.4525 },
};

export function getDecoteParams(annee: number = 2026): DecoteParams {
  return DECOTE_BY_YEAR[annee] || DECOTE_BY_YEAR[2026];
}

/**
 * Applique la décote IR (CGI Art. 197-I-4).
 * partsBase = 1 (seul) ou 2 (couple) — détermine quel plafond utiliser.
 */
export function applyDecote(
  impotBrut: number,
  partsBase: number,
  annee: number = 2026
): { impotApresDecote: number; decoteAppliquee: number } {
  if (impotBrut <= 0) return { impotApresDecote: 0, decoteAppliquee: 0 };
  const params = getDecoteParams(annee);
  const plafond = partsBase >= 2 ? params.plafondCouple : params.plafondSeul;
  const decote = Math.max(0, plafond - params.taux * impotBrut);
  const decoteEffective = Math.min(decote, impotBrut);
  return {
    impotApresDecote: Math.max(0, impotBrut - decoteEffective),
    decoteAppliquee: decoteEffective,
  };
}

// ═══════════════════════════════════════════════════════════
// CEHR — Contribution Exceptionnelle sur les Hauts Revenus
// CGI Art. 223 sexies
// ═══════════════════════════════════════════════════════════
// Seuils par foyer (pas par part) :
//   Célibataire/divorcé/veuf (partsBase=1) : 250 000 € → 3 % | 500 000 € → 4 %
//   Couple marié/pacsé      (partsBase=2) : 500 000 € → 3 % | 1 000 000 € → 4 %
//
// Note : le simulateur utilise le revenu fiscal de référence approximé
// par le revenu imposable de l'année (pas de lissage RFR pluri-annuel).

export function calculateCEHR(
  revenuFiscalReference: number,
  partsBase: number
): { cehr: number; tranche3pct: number; tranche4pct: number } {
  if (revenuFiscalReference <= 0) return { cehr: 0, tranche3pct: 0, tranche4pct: 0 };
  const seuil3 = partsBase >= 2 ? 500000 : 250000;
  const seuil4 = partsBase >= 2 ? 1000000 : 500000;

  const tranche3pct = Math.max(0, Math.min(revenuFiscalReference, seuil4) - seuil3) * 0.03;
  const tranche4pct = Math.max(0, revenuFiscalReference - seuil4) * 0.04;
  return {
    cehr: Math.round(tranche3pct + tranche4pct),
    tranche3pct: Math.round(tranche3pct),
    tranche4pct: Math.round(tranche4pct),
  };
}


/**
 * Applique l'abattement 10% sur salaires avec plancher et plafond.
 */
export function abattement10Salaire(salaireBrut: number, annee: number = 2026): number {
  const bareme = getBaremeIR(annee);
  const abattement = salaireBrut * 0.10;
  return Math.min(Math.max(abattement, bareme.plancherAbattement10Salaire), bareme.plafondAbattement10Salaire);
}

// ═══════════════════════════════════════════════════════════
// DÉDUCTIONS SECTEUR 1 — BNC RÉEL UNIQUEMENT
// ═══════════════════════════════════════════════════════════

/**
 * Barème Groupe III (déduction forfaitaire Secteur 1)
 * Applicable uniquement aux médecins conventionnés Secteur 1 en BNC réel
 * Source : Documentation DGFIP — Professions libérales BNC
 */
const BAREME_GROUPE_III: { plafond: number; montant: number }[] = [
  { plafond: 9100, montant: 770 },
  { plafond: 12150, montant: 920 },
  { plafond: 15200, montant: 1220 },
  { plafond: 18250, montant: 1530 },
  { plafond: 21300, montant: 1830 },
  { plafond: 24350, montant: 2140 },
  { plafond: 27400, montant: 2440 },
  { plafond: 30450, montant: 2750 },
  { plafond: Infinity, montant: 3050 },
];

/**
 * Calcule la déduction Groupe III selon les honoraires conventionnés
 */
export function getDeductionGroupeIII(honorairesConventionnes: number): number {
  for (const tranche of BAREME_GROUPE_III) {
    if (honorairesConventionnes <= tranche.plafond) {
      return tranche.montant;
    }
  }
  return 3050; // fallback max
}

/**
 * Calcule les déductions Secteur 1 pour le revenu imposable (BNC réel uniquement)
 * - Déduction 3% des honoraires conventionnés
 * - Déduction Groupe III (770€ à 3 050€ selon barème)
 * 
 * @param honorairesConventionnes - Honoraires conventionnés annuels (= CA si 100% conventionné)
 * @returns { deduction3pct, deductionGroupeIII, totalDeductionS1 }
 */
export function calculateDeductionsS1(honorairesConventionnes: number): {
  deduction3pct: number;
  deductionGroupeIII: number;
  totalDeductionS1: number;
} {
  if (honorairesConventionnes <= 0) {
    return { deduction3pct: 0, deductionGroupeIII: 0, totalDeductionS1: 0 };
  }
  
  const deduction3pct = honorairesConventionnes * 0.03;
  const deductionGroupeIII = getDeductionGroupeIII(honorairesConventionnes);
  
  return {
    deduction3pct,
    deductionGroupeIII,
    totalDeductionS1: deduction3pct + deductionGroupeIII,
  };
}

// ═══════════════════════════════════════════════════════════
// PER / MADELIN — PLAFOND DE DÉDUCTION (CGI Art. 163 quatervicies / 154 bis)
// ═══════════════════════════════════════════════════════════

/**
 * Plafond Annuel de Sécurité Sociale (PASS) par année civile.
 * Source : arrêtés ministériels DSS.
 */
export const PASS_BY_YEAR: Record<number, number> = {
  2024: 46368,
  2025: 47100,
  2026: 48060, // valeur officielle confirmée — PDF CARMF 2026 p. 28 + communiqué assiette sociale 11/03/2026
};


export function getPass(annee: number = 2026): number {
  return PASS_BY_YEAR[annee] ?? PASS_BY_YEAR[2026];
}

/**
 * Calcule le plafond de déduction PER/Madelin (CGI Art. 163 quatervicies).
 * Plafond = max( 10 % du bénéfice fiscal (plafonné à 8 PASS), 10 % PASS ).
 *
 * @param beneficeFiscal - Bénéfice imposable annuel servant d'assiette
 * @param annee - Année fiscale
 * @returns { plancher, plafond, applicable } — `applicable` = montant déductible
 *          pour une saisie donnée (à utiliser via `Math.min(saisie, plafond)`)
 */
export function getPerCap(beneficeFiscal: number, annee: number = 2026): {
  plancher: number;
  plafond: number;
} {
  const pass = getPass(annee);
  const plancher = Math.round(0.10 * pass);
  const beneficePlafonne = Math.min(Math.max(0, beneficeFiscal), 8 * pass);
  const dixPctBenefice = Math.round(0.10 * beneficePlafonne);
  const plafond = Math.max(plancher, dixPctBenefice);
  return { plancher, plafond };
}

// ═══════════════════════════════════════════════════════════
// PHASE 2 — ZONES EXONÉRÉES (ZFU-TE / ZFRR)
// ═══════════════════════════════════════════════════════════

/**
 * Calcule le taux d'exonération IR selon la zone et l'ancienneté d'installation.
 * 
 * ZFU-TE (Zone Franche Urbaine - Territoire Entrepreneur) :
 *   Années 1-5 : 100% | Année 6 : 60% | Année 7 : 40% | Année 8 : 20%
 * 
 * ZFRR (Zone France Ruralités Revitalisation) :
 *   Années 1-5 : 100% | Année 6 : 75% | Année 7 : 50% | Année 8 : 25%
 * 
 * Source : CGI art. 44 octies A (ZFU) / art. 44 quindecies (ZFRR)
 */
export function getTauxExonerationZone(
  zone: 'aucune' | 'zfu' | 'zfrr',
  anneeInstallation: number,
  anneeFiscale: number = 2025
): number {
  if (zone === 'aucune' || !anneeInstallation) return 0;
  
  const anciennete = anneeFiscale - anneeInstallation + 1; // année 1 = année d'installation
  
  if (zone === 'zfu') {
    if (anciennete <= 5) return 1.0;
    if (anciennete === 6) return 0.60;
    if (anciennete === 7) return 0.40;
    if (anciennete === 8) return 0.20;
    return 0; // > 8 ans : plus d'exonération
  }
  
  if (zone === 'zfrr') {
    if (anciennete <= 5) return 1.0;
    if (anciennete === 6) return 0.75;
    if (anciennete === 7) return 0.50;
    if (anciennete === 8) return 0.25;
    return 0;
  }
  
  return 0;
}

/**
 * Plafond annuel de bénéfice exonéré pour ZFU-TE (CGI Art. 44 octies A).
 */
export const PLAFOND_ZFU_ANNUEL = 50_000;

/**
 * Plafond ZFRR (ex-ZRR) : 300 000 € de bénéfice exonéré sur 3 ans glissants
 * (CGI Art. 44 quindecies / 44 quindecies A). La calculette ne tracant qu'une
 * année à la fois, on l'applique comme un plafond annuel défensif et on signale
 * la règle glissante via un warning pédagogique.
 */
export const PLAFOND_ZFRR_GLISSANT_3ANS = 300_000;

/**
 * Helper : plafond de bénéfice exonéré applicable selon la zone.
 */
export function getPlafondExonerationZone(zone: 'aucune' | 'zfu' | 'zfrr'): number {
  if (zone === 'zfu') return PLAFOND_ZFU_ANNUEL;
  if (zone === 'zfrr') return PLAFOND_ZFRR_GLISSANT_3ANS;
  return Infinity;
}

/**
 * Phase 14.12 — Prorata MENSUEL du **plafond annuel** ZFU année 1.
 *
 * Doctrine corrigée (remplace Phase 14.11 — jours civils sur le bénéfice) :
 *   • Le bénéfice exonéré = bénéfice réellement réalisé pendant la période
 *     d'activité en zone (CGI Art. 44 octies A). Il n'y a PAS de prorata
 *     sur les recettes/le bénéfice lui-même.
 *   • Le PLAFOND annuel (50 000 € ZFU) est ajusté au prorata du temps
 *     d'activité dans l'année **en mois entiers**, toute fraction de mois
 *     comptant pour un mois entier (BOFiP BOI-BIC-CHAMP-80-10-20-20 §80).
 *
 * `getProrataPlafondZfuAnnee1(moisInstallation)` retourne `(13 − mois) / 12`
 * clampé à `[1/12, 1]`. Fallback `undefined` ⇒ ratio 1.0 (assimile à janvier).
 *
 * NB : ne s'applique QU'à ZFU-TE l'année 1 du dispositif. ZFRR a un plafond
 * glissant 3 ans (300 000 €) : pas de prorata annuel.
 */
export function getProrataPlafondZfuAnnee1(moisInstallation: number | undefined): number {
  if (moisInstallation === undefined || !Number.isFinite(moisInstallation)) return 1;
  const mois = Math.max(1, Math.min(12, Math.trunc(moisInstallation)));
  const moisActifs = 13 - mois; // déc=1, jan=12
  return moisActifs / 12;
}

// ═══════════════════════════════════════════════════════════
// PHASE 2 — REVENUS FONCIERS
// ═══════════════════════════════════════════════════════════

/** Plafond de déficit foncier imputable sur le revenu global (CGI art. 156-I-3°) */
export const PLAFOND_DEFICIT_FONCIER = 10700;
/** Plafond de revenus fonciers bruts pour le micro-foncier (CGI art. 32) */
export const PLAFOND_MICRO_FONCIER = 15000;

/**
 * Calcule le revenu foncier net imposable.
 * - Micro-foncier : abattement 30% sur revenus bruts (si ≤ 15 000€)
 * - Réel : résultat net direct (déficit plafonné à -10 700€ sur revenu global)
 */
export function calculateRevenuFoncierImposable(
  regime: 'aucun' | 'micro' | 'reel',
  revenusBruts: number = 0,
  revenuNet: number = 0
): number {
  if (regime === 'aucun') return 0;
  
  if (regime === 'micro') {
    return Math.max(0, revenusBruts * 0.70); // abattement 30%
  }
  
  // Régime réel : le résultat peut être négatif (déficit foncier)
  // Déficit imputable plafonné à -10 700€ sur le revenu global
  return Math.max(-PLAFOND_DEFICIT_FONCIER, revenuNet);
}

// ═══════════════════════════════════════════════════════════
// PHASE 2 — CRÉDITS D'IMPÔT
// ═══════════════════════════════════════════════════════════

/** SMIC horaire brut 2025 pour calcul crédit formation dirigeant (CGI art. 244 quater M) */
export const SMIC_HORAIRE_2025 = 11.88;

/**
 * Calcule le crédit d'impôt formation dirigeant.
 * = heures × SMIC horaire (plafond 40h/an)
 * Source : CGI art. 244 quater M
 */
export function calculateCreditFormation(heures: number): number {
  const heuresPlafonnees = Math.min(Math.max(0, heures), 40);
  return Math.round(heuresPlafonnees * SMIC_HORAIRE_2025);
}

// ═══════════════════════════════════════════════════════════
// EXPORTS LEGACY pour compatibilité avec les imports existants
// ═══════════════════════════════════════════════════════════
export const BAREME_IMPOT_2025 = BAREME_2025.tranches;
export const BAREME_IMPOT_2026 = BAREME_2026.tranches;
export const PLAFOND_QF_PAR_DEMI_PART = BAREME_2026.plafondQfParDemiPart;
export const PLAFOND_ABATTEMENT_10 = BAREME_2026.plafondAbattement10Salaire;
export const PLANCHER_ABATTEMENT_10 = BAREME_2026.plancherAbattement10Salaire;

// ═══════════════════════════════════════════════════════════
// PHASE 5 — PLAFOND MICRO-BNC (CGI Art. 102 ter)
// ═══════════════════════════════════════════════════════════
// 2024 et 2025 (revenus 2024) : 77 700 €
// 2026 (revenus 2025 — LF 2026) : 83 600 €
// Source : Loi de finances 2026, BOI-BNC-DECLA-20-30
// ═══════════════════════════════════════════════════════════
export const MICRO_BNC_CEILING_BY_YEAR: Record<number, number> = {
  2024: 77700,
  2025: 77700,
  2026: 83600,
  2027: 83600,
  2028: 83600,
  2029: 83600,
  2030: 83600,
};

/**
 * Plafond Micro-BNC pour l'année donnée.
 * Au-delà, le régime Micro-BNC est juridiquement inaccessible : passage automatique
 * au régime réel après 2 années consécutives de dépassement (CGI Art. 102 ter).
 */
export function getMicroBncCeiling(annee: number = 2026): number {
  return MICRO_BNC_CEILING_BY_YEAR[annee] ?? 83600;
}

/**
 * Marge de sécurité conservatrice 20 % appliquée aux estimations Micro-BNC
 * (mem://calculations/fiscal-conservative-margin-policy). Le simulateur public
 * affiche cette marge en avertissement plutôt que de la déduire (Phase 5 décision A).
 */
export const MICRO_BNC_SAFETY_MARGIN = 0.20;
