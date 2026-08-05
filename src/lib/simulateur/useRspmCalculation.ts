import { useMemo } from 'react';
import { getDomTomInfo } from '@/lib/dom-tom';
import { abattement10Salaire, getBaremeIR } from '@/lib/baremes-ir';
import { inferEnfantsFromParts } from '@/lib/fiscalParts';
import { capChequesVacances } from '@/lib/declarationParams';
import { canApplyForfait2pct, canApplyDeductionsS1 } from '@/lib/fiscalEligibility';

/**
 * Type local minimal — remplace `UserProfile` de `@/lib/supabase/auth` (app
 * authentifiée, absente du site public). Seuls les champs effectivement lus
 * par `useRspmCalculation`/`calculateRspmBreakdown` sont repris ici.
 */
export type UserProfile = {
  regime_fiscal?: 'micro-bnc' | 'reel';
  situation_familiale?: 'celibataire' | 'marie-pacse' | 'marie_pacse' | 'parent_isole' | 'veuf' | 'autre';
  parts_fiscales?: number | null;
  charges_reelles_percent?: number | null;
  taux_rid_rspm?: '25%' | '100%' | null;
  type_exercice?: string | null;
  eligibilite_rspm_manuelle?: boolean | null;
};

// ========== CONSTANTES RSPM 2025-2026 ==========
const SEUIL_RSPM_TRANCHE_1 = 19000;  // Seuil de la 1ère tranche
const TAUX_RSPM_TRANCHE_1 = 0.135;   // 13,5%
const TAUX_RSPM_TRANCHE_2 = 0.212;   // 21,2%

// (Constantes CARMF complémentaire supprimées : en RSPM, la complémentaire est incluse dans les cotisations URSSAF)

// PLAFOND_QF_PAR_DEMI_PART : centralisé dans getBaremeIR(annee).plafondQfParDemiPart

interface RspmCalculationInput {
  yearlyLiberalTotal: number;
  yearlyLiberalExonere?: number;
  /**
   * Total annuel salarié = SOMME(imposable + exonéré).
   * ⚠️ NE JAMAIS passer imposable seul — la fonction soustrait `yearlySalariedExonere`
   * en interne pour obtenir la base IR (`revenuSalarieImposable = yearlySalariedTotal - yearlySalariedExonere`).
   * Cohérence avec `aggregateSalariedYear(...).total` (audit pré-prod 7e passe).
   */
  yearlySalariedTotal?: number;
  /**
   * Sous-ensemble exonéré d'IR (Art. 81 quater CGI : heures sup, gardes hospitalières exonérées).
   * Soustrait de `yearlySalariedTotal` pour obtenir l'imposable IR.
   * Cohérence avec `aggregateSalariedYear(...).exonere`.
   */
  yearlySalariedExonere?: number;
  yearlyConjointTotal?: number;
  typeRevenuConjoint?: 'salarie' | 'liberal_micro' | 'liberal_reel' | 'autre';
  profile: UserProfile | null;
  modeFraisSalaries?: 'abattement_10' | 'frais_reels' | null;
  fraisReelsAnnuel?: number;
  chargesLiberalesReelles?: number;
  /**
   * 🎯 CONVENTION A — Audit pré-prod 2026 (CGI Art. 102 ter)
   * Rétrocessions versées au remplaçant (charge déductible BNC L21/BG du Cerfa 2035-A).
   * Si fourni : déduit AVANT abattement 34 % en micro-BNC ET avant base sociale URSSAF.
   * Si non fourni : fallback rétrocompatible (en micro-BNC, on suppose que
   * `chargesLiberalesReelles` ne contient QUE le versé — convention historique).
   * En réel : ce paramètre n'est PAS utilisé (le versé est déjà dans `chargesLiberalesReelles`).
   */
  retrocessionsVerseesMicroBnc?: number;
  // Phase 1 — Optimisation fiscale
  secteurConventionnel?: 'secteur_1' | 'secteur_2';
  forfait2pct?: boolean;
  cotisationsVolontaires?: number;
  // Phase 2 — Zones exonérées, Revenus fonciers, Crédits d'impôt
  zoneExoneree?: 'aucune' | 'zfu' | 'zfrr';
  anneeInstallationZone?: number;
  anneeFiscale?: number;
  regimeFoncier?: 'aucun' | 'micro' | 'reel';
  revenusFonciersBruts?: number;
  revenuFoncierNet?: number;
  creditFormationDirigeant?: boolean;
  heuresFormation?: number;
  creditImpotAutre?: number;
  chequesVacances?: number;
  // Phase 3 — RID toggle, Situation CARMF, Ratio non-conventionné
  tauxRid?: '25%' | '100%';
  situationCarmf?: 'dispense' | 'affilie_jeune' | 'affilie_3ans_plus';
  ratioNonConventionne?: number;
  // Crédits d'impôt personnels
  fraisEmploiDomicile?: number;
  fraisGardeEnfants?: number;
  nombreEnfantsGarde?: number;
  // DOM-TOM — Abattement IR (CGI art. 197-I-3)
  lieuExercice?: string;
  /**
   * 🎯 Override cotisations sociales — utilisé en mode PAMC (régime réel).
   * Si fourni, remplace `cotisationsTotales` (RSPM 13,5/21,2 %) par ce montant
   * lors du calcul du bénéfice fiscal en régime réel. Permet d'utiliser le moteur
   * RSPM pour le calcul d'IR + impotDetails (tranches, TMI, QF) tout en respectant
   * les vraies cotisations PAMC issues de l'API URSSAF.
   * En micro-BNC, ce paramètre est IGNORÉ (cotisations non déduites du bénéfice).
   * En RSPM, ce paramètre est IGNORÉ (les cotisations RSPM internes sont correctes).
   */
  cotisationsSocialesOverride?: number;
}

// Détail d'une tranche d'imposition
export interface TrancheDetail {
  borneInf: number;
  borneSup: number;
  taux: number;
  montantImpose: number; // montant dans cette tranche
  impotTranche: number;  // impôt généré par cette tranche
}

// Détail des cotisations RSPM par tranche
export interface CotisationsRspmDetail {
  tranche1: { montant: number; taux: number; cotisation: number };
  tranche2: { montant: number; taux: number; cotisation: number };
  total: number;
}

/**
 * Calcul progressif des cotisations URSSAF en mode RSPM
 * - Tranche 1 : 13,5% de 0 à 19 000€
 * - Tranche 2 : 21,2% au-delà de 19 000€
 */
const calculateCotisationsRspm = (revenuLiberal: number): CotisationsRspmDetail => {
  if (revenuLiberal <= SEUIL_RSPM_TRANCHE_1) {
    // 100% dans la tranche 1
    const cotisation = revenuLiberal * TAUX_RSPM_TRANCHE_1;
    return {
      tranche1: { montant: revenuLiberal, taux: TAUX_RSPM_TRANCHE_1 * 100, cotisation },
      tranche2: { montant: 0, taux: TAUX_RSPM_TRANCHE_2 * 100, cotisation: 0 },
      total: cotisation
    };
  }
  
  // Calcul progressif : tranche 1 + tranche 2
  const montantTranche1 = SEUIL_RSPM_TRANCHE_1;
  const cotisationTranche1 = montantTranche1 * TAUX_RSPM_TRANCHE_1;
  
  const montantTranche2 = revenuLiberal - SEUIL_RSPM_TRANCHE_1;
  const cotisationTranche2 = montantTranche2 * TAUX_RSPM_TRANCHE_2;
  
  return {
    tranche1: { montant: montantTranche1, taux: TAUX_RSPM_TRANCHE_1 * 100, cotisation: cotisationTranche1 },
    tranche2: { montant: montantTranche2, taux: TAUX_RSPM_TRANCHE_2 * 100, cotisation: cotisationTranche2 },
    total: cotisationTranche1 + cotisationTranche2
  };
};

interface RspmBreakdown {
  cotisationsTotales: number;
  cotisationsUrssaf: number;
  cotisationsCarmf: number;
  netAvantImpot: number;
  revenuImposableTotal: number;
  impot: number;
  superNet: number;
  superNetPercentage: number;
  cotisationsDetail: {
    maladie: number;
    allocationsFamiliales: number;
    retraite: number;
    retraiteRid?: number;
    retraiteComplementaire?: number;
    csgCrds: number;
    formation: number;
  };
  revenuLiberal: number;
  // Détail RSPM pour tooltip pédagogique
  cotisationsRspmDetail?: CotisationsRspmDetail;
  // ✅ Optimisations fiscales appliquées
  optimisationsAppliquees?: Record<string, number | string | undefined>;
  // Nouveaux champs pour tooltip pédagogique
  impotDetails?: {
    quotientFamilial: number;
    partsFiscales: number;
    tmi: number;
    tauxEffectif: number;
    impotParPart: number;
    tranches: TrancheDetail[];
    revenuImposableLiberal: number;
    revenuImposableSalarie: number;
    revenuImposableConjoint: number;
    typeRevenuConjoint?: 'salarie' | 'liberal_micro' | 'liberal_reel' | 'autre';
    revenuBrutConjoint?: number;
    revenuBrutSalarie: number;
    deductionSalarie: number;
    hasAnyFraisReels: boolean;
    regimeFiscal: string;
    modeFraisSalaries: string;
    plafonnementApplique?: boolean;
    avantageEnfantsInitial?: number;
    avantageEnfantsFinal?: number;
    plafondUtilise?: number;
    situationFamiliale?: string;
    // Champs bruts pour breakdown pédagogique dans le tooltip Impôts
    revenuBrutLiberal?: number;
    retrocessionsVersees?: number;
    chargesLiberales?: number;
    forfait2Montant?: number;
    cotisationsDeduites?: number;
    deductionsS1?: number;
    chequesVacancesDeduction?: number;
    cotisationsVolontairesDeduites?: number;
    abattementDomMontant?: number;
    lieuExercice?: string;
    chargesReellesPercent?: number;
  };
}

// ✅ Import centralisé des barèmes IR (source unique de vérité)
import { BAREME_IMPOT_2025, PLAFOND_ABATTEMENT_10, PLANCHER_ABATTEMENT_10, getTranchesIR, calculateRawTaxPerPart as centralCalculateRawTax, getTMI as centralGetTMI, calculateDeductionsS1, getTauxExonerationZone, calculateRevenuFoncierImposable, calculateCreditFormation, getPerCap, applyDecote, calculateCEHR } from '@/lib/baremes-ir';
export { BAREME_IMPOT_2025 } from '@/lib/baremes-ir';

/**
 * Détermine si un utilisateur est éligible au RSPM
 */
export const isEligibleRSPM = (profile: UserProfile | null): boolean => {
  if (!profile) return false;

  // Override manuel prioritaire
  if (profile.eligibilite_rspm_manuelle !== undefined && profile.eligibilite_rspm_manuelle !== null) {
    return profile.eligibilite_rspm_manuelle;
  }

  // Si pas de choix manuel, on ne suppose RIEN (pas de RSPM par défaut)
  return false;
};

/**
 * Calcule l'impôt brut (sans plafonnement) pour un quotient familial donné
 */
const calculateRawTaxFromBareme = (quotientFamilial: number, annee: number = 2026): number => {
  const tranches = getTranchesIR(annee);
  let impotParPart = 0;
  let tranchePrecedente = 0;
  
  for (const tranche of tranches) {
    if (quotientFamilial > tranchePrecedente) {
      const montantImpose = Math.min(quotientFamilial, tranche.limite) - tranchePrecedente;
      impotParPart += montantImpose * tranche.taux;
      tranchePrecedente = tranche.limite;
    } else {
      break;
    }
  }
  
  return impotParPart;
};

/**
 * Calcule l'impôt selon le barème progressif 2025 avec détail par tranche
 * ET plafonnement du quotient familial (Article 197 CGI)
 */
const calculateImpotWithDetails = (
  revenuImposable: number, 
  partsFiscales: number,
  situationFamiliale?: 'celibataire' | 'marie_pacse' | 'marie-pacse' | 'veuf' | 'parent_isole',
  annee: number = 2026
): {
  impot: number; 
  details: { 
    quotientFamilial: number; 
    impotParPart: number; 
    tmi: number; 
    tranches: TrancheDetail[];
    plafonnementApplique?: boolean;
    avantageEnfantsInitial?: number;
    avantageEnfantsFinal?: number;
    plafondUtilise?: number;
  } 
} => {
  // 1. Déterminer les parts de base (sans enfants)
  const partsBase = (situationFamiliale === 'marie_pacse' || situationFamiliale === 'marie-pacse')
    ? 2
    : (situationFamiliale === 'veuf' && partsFiscales >= 2) ? 2 : 1;
  const partsEnfants = Math.max(0, partsFiscales - partsBase);
  
  // 2. Calcul du quotient familial avec toutes les parts
  const quotientFamilial = revenuImposable / partsFiscales;
  
  // 3. Calcul de l'impôt brut avec toutes les parts
  const impotParPartAvecEnfants = calculateRawTaxFromBareme(quotientFamilial, annee);
  const impotBrutAvecEnfants = impotParPartAvecEnfants * partsFiscales;
  
  // 4. Construire le détail des tranches pour l'affichage
  let tranchePrecedente = 0;
  let tmi = 0;
  const tranches: TrancheDetail[] = [];
  
  for (const tranche of getTranchesIR(annee)) {
    if (quotientFamilial > tranchePrecedente) {
      const montantImpose = Math.min(quotientFamilial, tranche.limite) - tranchePrecedente;
      const impotTranche = montantImpose * tranche.taux;
      
      tranches.push({
        borneInf: tranchePrecedente,
        borneSup: Math.min(quotientFamilial, tranche.limite),
        taux: tranche.taux * 100,
        montantImpose: Math.round(montantImpose),
        impotTranche: Math.round(impotTranche),
      });
      
      if (tranche.taux > 0) {
        tmi = tranche.taux * 100;
      }
      
      tranchePrecedente = tranche.limite;
    } else {
      break;
    }
  }
  
  // 5. Si pas d'enfants (pas de demi-parts supplémentaires), pas de plafonnement
  if (partsEnfants <= 0) {
    return {
      impot: Math.round(impotBrutAvecEnfants),
      details: {
        quotientFamilial: Math.round(quotientFamilial),
        impotParPart: Math.round(impotParPartAvecEnfants),
        tmi,
        tranches,
        plafonnementApplique: false,
      }
    };
  }
  
  // 6. Calcul de l'impôt sans enfants (pour vérifier le plafonnement)
  const qfBase = revenuImposable / partsBase;
  const impotSansEnfants = calculateRawTaxFromBareme(qfBase, annee) * partsBase;
  
  // 7. Calcul de l'avantage procuré par les enfants
  const avantageEnfants = impotSansEnfants - impotBrutAvecEnfants;
  
  // 8. Calcul du plafond (centralisé depuis baremes-ir.ts)
  const nbDemiPartsEnfants = partsEnfants * 2;
  const bareme = getBaremeIR(annee);
  
  let plafond: number;
  if (situationFamiliale === 'parent_isole' && nbDemiPartsEnfants >= 1) {
    plafond = bareme.plafondQfCaseT + Math.max(0, nbDemiPartsEnfants - 1) * bareme.plafondQfParDemiPart;
  } else {
    plafond = nbDemiPartsEnfants * bareme.plafondQfParDemiPart;
  }
  
  // 9. Application du plafonnement si nécessaire (CGI Art. 197)
  let impotFinal: number;
  let plafonnementApplique = false;
  
  if (avantageEnfants > plafond) {
    impotFinal = impotSansEnfants - plafond;
    plafonnementApplique = true;
  } else {
    impotFinal = impotBrutAvecEnfants;
  }
  
  return {
    impot: Math.round(impotFinal),
    details: {
      quotientFamilial: Math.round(quotientFamilial),
      impotParPart: Math.round(impotParPartAvecEnfants),
      tmi,
      tranches,
      plafonnementApplique,
      avantageEnfantsInitial: plafonnementApplique ? Math.round(avantageEnfants) : undefined,
      avantageEnfantsFinal: plafonnementApplique ? Math.round(plafond) : undefined,
      plafondUtilise: plafonnementApplique ? Math.round(plafond) : undefined,
    }
  };
};

/**
 * Legacy: Calcule l'impôt sans détails (compatibilité)
 */
const calculateImpot = (revenuImposable: number, partsFiscales: number, annee: number = 2026): number => {
  return calculateImpotWithDetails(revenuImposable, partsFiscales, undefined, annee).impot;
};

/**
 * Hook centralisé pour le calcul RSPM
 * Utilisé par YearlyDashboardCard, historique.tsx, et EventDetailsModal
 */
export const useRspmCalculation = ({
  yearlyLiberalTotal,
  yearlyLiberalExonere = 0,
  yearlySalariedTotal = 0,
  yearlySalariedExonere = 0,
  yearlyConjointTotal = 0,
  typeRevenuConjoint = 'salarie',
  profile,
  modeFraisSalaries,
  fraisReelsAnnuel = 0,
  chargesLiberalesReelles,
  retrocessionsVerseesMicroBnc = 0,
  secteurConventionnel,
  forfait2pct = false,
  cotisationsVolontaires = 0,
  zoneExoneree = 'aucune',
  anneeInstallationZone,
  anneeFiscale = 2026,
  regimeFoncier = 'aucun',
  revenusFonciersBruts = 0,
  revenuFoncierNet = 0,
  creditFormationDirigeant = false,
  heuresFormation = 0,
  creditImpotAutre = 0,
  chequesVacances = 0,
  tauxRid,
  situationCarmf = 'affilie_3ans_plus',
  ratioNonConventionne = 0,
  fraisEmploiDomicile = 0,
  fraisGardeEnfants = 0,
  nombreEnfantsGarde = 0,
  lieuExercice,
}: RspmCalculationInput): RspmBreakdown | null => {
  
  return useMemo(() => {
    if (!profile || yearlyLiberalTotal === 0) return null;

    const secteur = secteurConventionnel || 'secteur_1';
    // Phase 3: ratio conventionné (pour prorata S1 et forfait 2%)
    const ratioConventionne = 1 - (ratioNonConventionne || 0) / 100;

    // 🎯 CONVENTION A — Audit pré-prod final 2026
    // Sémantique stricte : en micro-BNC, lecture prioritaire de `retrocessionsVerseesMicroBnc` ;
    // fallback sur `chargesLiberalesReelles` (legacy) avec warn DEV. En réel, ignoré.
    let retroDeduiteMicroBnc = 0;
    if (profile.regime_fiscal === 'micro-bnc') {
      if (retrocessionsVerseesMicroBnc > 0) {
        retroDeduiteMicroBnc = retrocessionsVerseesMicroBnc;
      } else if (chargesLiberalesReelles && chargesLiberalesReelles > 0) {
        retroDeduiteMicroBnc = chargesLiberalesReelles;
        if (typeof process !== 'undefined' && process?.env?.NODE_ENV !== 'production') {
          console.warn(
            '[useRspmCalculation hook] micro-BNC: chargesLiberalesReelles utilisé comme retro (fallback). ' +
            'Préférer le param dédié `retrocessionsVerseesMicroBnc` (Convention A 2026).'
          );
        }
      }
    }
    const baseImposableMicroBnc = Math.max(0, yearlyLiberalTotal - retroDeduiteMicroBnc);

    // 1. Cotisations URSSAF - Calcul PROGRESSIF RSPM
    // Assiette sociale = recettes (− rétrocessions en micro-BNC) + PDSA exonéré (Art. 151 ter, soumis aux cotisations).
    const revenuLiberalPourCotisations = baseImposableMicroBnc + yearlyLiberalExonere;
    const rspmDetail = calculateCotisationsRspm(revenuLiberalPourCotisations);
    const cotisationsUrssaf = rspmDetail.total;

    // 2. RID selon le choix — Phase 3: toggle explicite ou profil
    // Note : la RID est OBLIGATOIRE pour tout médecin actif inscrit à l'Ordre.
    // En RSPM, le statut "dispense CARMF" ne s'applique PAS à la RID
    // (la dispense ne concerne que la complémentaire vieillesse en PAMC).
    // CARMF 2026 — PDF officiel « La CARMF en 2026 » p. 29-30 : RID = 626 € (100 %) / 157 € (25 %)
    let cotisationsCarmfRid = 626; // Par défaut 100% (taux plein)
    const ridChoice = tauxRid || profile.taux_rid_rspm;
    if (ridChoice === '25%') {
      cotisationsCarmfRid = 157;
    }


    // En RSPM, la complémentaire CARMF est déjà incluse dans les cotisations URSSAF (13,5%/21,2%)
    // Seul le RID est payé directement à la CARMF
    const cotisationsCarmf = cotisationsCarmfRid;

    // 3. Total cotisations
    const cotisationsTotales = cotisationsUrssaf + cotisationsCarmf;

    // 4. CA libéral imposable = yearlyLiberalTotal tel quel
    // Convention : yearlyLiberalTotal est déjà la portion imposable (les appelants excluent le PDSA exonéré avant de passer la valeur)
    const yearlyLiberalImposable = yearlyLiberalTotal;

    // 5. Bénéfice fiscal (selon régime) - basé sur le CA IMPOSABLE
    let beneficeFiscal = 0;
    const eligibilityInput = {
      type_exercice: profile.type_exercice,
      secteur_conventionnel: secteur,
      regime_fiscal: profile.regime_fiscal,
      forfait_2pct: forfait2pct,
    };
    const forfait2Montant = canApplyForfait2pct(eligibilityInput)
      ? yearlyLiberalImposable * 0.02 * ratioConventionne
      : 0;
    
    if (profile.regime_fiscal === 'micro-bnc') {
      // 🎯 Conv. A micro-BNC : versé déduit AVANT abattement 34 % (CGI Art. 102 ter).
      // `baseImposableMicroBnc` = yearlyLiberalImposable − rétrocessions versées.
      beneficeFiscal = baseImposableMicroBnc * 0.66;
    } else {
      // Phase 1 Bug #2 : `undefined` = info absente (fallback 30 %), `0` = info explicite (charges nulles).
      if (chargesLiberalesReelles !== undefined) {
        const ratioImposable = yearlyLiberalTotal > 0 ? yearlyLiberalImposable / yearlyLiberalTotal : 1;
        const chargesImposables = chargesLiberalesReelles * ratioImposable;
        beneficeFiscal = Math.max(0, yearlyLiberalImposable - chargesImposables - forfait2Montant - cotisationsTotales);
      } else {
        const chargesPercent = profile.charges_reelles_percent || 30;
        beneficeFiscal = Math.max(0, yearlyLiberalImposable * (1 - chargesPercent / 100) - forfait2Montant - cotisationsTotales);
      }
    }

    let deductionsS1Total = 0;
    if (canApplyDeductionsS1(eligibilityInput)) {
      const { totalDeductionS1 } = calculateDeductionsS1(yearlyLiberalImposable * ratioConventionne);
      deductionsS1Total = totalDeductionS1;
    }
    
    // ✅ Phase 2 : Exonération zone (ZFU-TE / ZFRR)
    // Chèques-vacances ANCV : déductibles en réel uniquement, plafond annuel 1 SMIC mensuel
    // (2024 = 1 766€, 2025 = 1 802€, 2026 = 1 823€) — cap dynamique via declarationParams
    const chequesVacancesDeduction = (profile.regime_fiscal === 'reel')
      ? capChequesVacances(chequesVacances || 0, anneeFiscale).capped
      : 0;
    // Phase 2 Bug #4 : cap PER/Madelin (CGI Art. 163 quatervicies / 154 bis).
    const perCap = getPerCap(beneficeFiscal, anneeFiscale).plafond;
    const cotisationsVolontairesAppliquees = Math.min(Math.max(0, cotisationsVolontaires), perCap);
    let revenuImposableLiberal = Math.max(0, beneficeFiscal - deductionsS1Total - cotisationsVolontairesAppliquees - chequesVacancesDeduction);
    const tauxExoneration = getTauxExonerationZone(zoneExoneree, anneeInstallationZone || 0, anneeFiscale);
    let exonerationMontantCalc = 0;
    if (tauxExoneration > 0) {
      exonerationMontantCalc = revenuImposableLiberal * tauxExoneration;
      // Plafond ZFU-TE : 50 000€ de bénéfice exonéré par an (Art. 44 octies A CGI)
      if (zoneExoneree === 'zfu') exonerationMontantCalc = Math.min(exonerationMontantCalc, 50000);
      revenuImposableLiberal = Math.max(0, revenuImposableLiberal - exonerationMontantCalc);
    }

    // 5.5. Calcul du revenu imposable SALARIÉ (abattement 10% OU frais réels)
    const revenuSalarieImposable = yearlySalariedTotal - yearlySalariedExonere;
    let deductionSalarie = 0;
    if (modeFraisSalaries === 'frais_reels' && fraisReelsAnnuel > 0) {
      // Frais réels déclarés
      deductionSalarie = fraisReelsAnnuel;
    } else {
      // Abattement 10% avec plancher 504€ et plafond 14 426€
      deductionSalarie = revenuSalarieImposable > 0 ? abattement10Salaire(revenuSalarieImposable, anneeFiscale) : 0;
    }
    const revenuImposableSalarie = Math.max(0, revenuSalarieImposable - deductionSalarie);

    // 5.6. Calcul du revenu imposable CONJOINT selon le type de revenu
    const revenusConjointImposable = yearlyConjointTotal || 0;
    let revenuImposableConjoint: number;
    
    switch (typeRevenuConjoint) {
      case 'salarie':
      default:
        // Abattement 10% avec plancher 504€ et plafond 14 426€
        const abattementConjoint = revenusConjointImposable > 0 ? abattement10Salaire(revenusConjointImposable, anneeFiscale) : 0;
        revenuImposableConjoint = Math.max(0, revenusConjointImposable - abattementConjoint);
        break;
        
      case 'liberal_micro':
        // Abattement 34% (Micro-BNC)
        revenuImposableConjoint = revenusConjointImposable * 0.66;
        break;
        
      case 'liberal_reel':
      case 'autre':
        // Pas d'abattement : montant = bénéfice fiscal déjà calculé
        revenuImposableConjoint = revenusConjointImposable;
        break;
    }

    // 6. ✅ Phase 2 : Revenus fonciers
    const revenuFoncierImposable = calculateRevenuFoncierImposable(regimeFoncier, revenusFonciersBruts, revenuFoncierNet);

    // 7. Impôt selon barème progressif avec détails (FOYER COMPLET) + plafonnement QF
    const revenuGlobalImposable = Math.max(0, revenuImposableLiberal + revenuImposableSalarie + revenuImposableConjoint + revenuFoncierImposable);
    const partsFiscales = profile.parts_fiscales || 1;
    const situationFamiliale = profile.situation_familiale as 'celibataire' | 'marie_pacse' | 'veuf' | 'parent_isole' || 'celibataire';
    const { impot: impotBrut, details: impotCalcDetails } = calculateImpotWithDetails(revenuGlobalImposable, partsFiscales, situationFamiliale, anneeFiscale);

    // 8. ✅ Phase 2 : Crédits d'impôt (soustraits de l'impôt, jamais négatif)
    const creditFormation = creditFormationDirigeant ? calculateCreditFormation(heuresFormation) : 0;
    // ✅ Emploi à domicile : 50% des dépenses, plafond 12k + 1500/enfant (max 15k standard)
    // Source de vérité : inférence depuis parts_fiscales (CGI Art. 194), pas le champ orphelin nombre_enfants_charge
    const nbEnfantsForCredit = inferEnfantsFromParts(profile.parts_fiscales ?? 1, profile.situation_familiale ?? 'celibataire');
    const plafondEmploiDomicile = Math.min(12000 + nbEnfantsForCredit * 1500, 15000);
    const creditEmploiDomicile = Math.min(fraisEmploiDomicile || 0, plafondEmploiDomicile) * 0.5;
    // ✅ Garde enfant < 6 ans : 50% des dépenses, plafond 3500€/enfant
    const plafondGardeEnfants = 3500 * (nombreEnfantsGarde || 0);
    const creditGardeEnfants = Math.min(fraisGardeEnfants || 0, plafondGardeEnfants) * 0.5;
    const totalCredits = creditFormation + (creditImpotAutre || 0) + creditEmploiDomicile + creditGardeEnfants;
    let impotAvantDom = Math.max(0, impotBrut - totalCredits);

    // ✅ DOM-TOM : Abattement IR (CGI art. 197-I-3)
    // Guadeloupe/Martinique/Réunion : -30%, plafond 2 450 €
    // Guyane/Mayotte : -40%, plafond 4 050 €
    const domInfo = getDomTomInfo(lieuExercice);
    if (domInfo) {
      const abattementDom = Math.min(impotAvantDom * domInfo.tauxAbattement, domInfo.plafond);
      impotAvantDom = Math.max(0, impotAvantDom - abattementDom);
    }
    const impot = impotAvantDom;

    // 9. Super-Net = Total revenus (incluant PDSA exonéré) - cotisations - impôt - charges déductibles
    // 🎯 Convention A — En micro-BNC, charges classiques absorbées par l'abattement 34 %
    // (déjà comptées dans `beneficeFiscal`). Ne PAS les soustraire à nouveau.
    // Les rétrocessions micro-BNC sont déjà déduites en amont (`baseImposableMicroBnc`).
    const totalRevenus = revenuLiberalPourCotisations + yearlySalariedTotal;
    // 🎯 Audit juillet 2026 (parité PAMC) — Symétrie fiscal ↔ cash du repli `charges_reelles_percent` :
    // quand aucune charge n'est connue (`undefined`), le bénéfice fiscal est réduit du pourcentage
    // du profil ; ce même montant doit sortir du cash, sinon le ratio Super-Net est artificiellement
    // gonflé (cas « 64 % »). Un `0` explicite reste un 0 (aucune charge, aucune sortie).
    const chargesEffectives = profile.regime_fiscal === 'micro-bnc'
      ? 0
      : (chargesLiberalesReelles !== undefined
          ? chargesLiberalesReelles
          : Math.max(0, yearlyLiberalImposable * ((profile.charges_reelles_percent || 30) / 100)));
    const superNet = totalRevenus - cotisationsUrssaf - cotisationsCarmf - impot - chargesEffectives;

    const superNetPercentage = totalRevenus > 0 ? (superNet / totalRevenus) * 100 : 0;

    // 9. Taux effectif
    const tauxEffectif = revenuGlobalImposable > 0 ? (impot / revenuGlobalImposable) * 100 : 0;

    // ✅ Construire les optimisations appliquées pour affichage
    const exonerationMontant = Math.round(exonerationMontantCalc);
    
    const optimisationsAppliquees: Record<string, number | string | undefined> = {};
    if (forfait2Montant > 0) optimisationsAppliquees.forfait2pct = Math.round(forfait2Montant);
    if (deductionsS1Total > 0) optimisationsAppliquees.deductionsS1 = Math.round(deductionsS1Total);
    if (cotisationsVolontaires > 0) optimisationsAppliquees.cotisationsVolontaires = cotisationsVolontaires;
    if (chequesVacancesDeduction > 0) optimisationsAppliquees.chequesVacances = chequesVacancesDeduction;
    if (exonerationMontant > 0) {
      optimisationsAppliquees.exonerationZone = exonerationMontant;
      optimisationsAppliquees.tauxExonerationZone = tauxExoneration;
    }
    if (revenuFoncierImposable !== 0) {
      optimisationsAppliquees.revenuFoncier = Math.round(revenuFoncierImposable);
      optimisationsAppliquees.revenuFoncierType = regimeFoncier as 'micro' | 'reel';
      if (regimeFoncier === 'micro') optimisationsAppliquees.revenuFoncierBrut = revenusFonciersBruts;
    }
    if (creditFormation > 0) optimisationsAppliquees.creditFormation = Math.round(creditFormation);
    if ((creditImpotAutre || 0) > 0) optimisationsAppliquees.creditImpotAutre = creditImpotAutre;
    if (creditEmploiDomicile > 0) optimisationsAppliquees.creditEmploiDomicile = Math.round(creditEmploiDomicile);
    if (creditGardeEnfants > 0) optimisationsAppliquees.creditGardeEnfants = Math.round(creditGardeEnfants);
    if ((ratioNonConventionne || 0) > 0) optimisationsAppliquees.ratioNonConventionne = ratioNonConventionne;

    return {
      cotisationsTotales,
      cotisationsUrssaf,
      cotisationsCarmf,
      netAvantImpot: yearlyLiberalTotal + yearlyLiberalExonere - cotisationsTotales,
      revenuImposableTotal: revenuGlobalImposable,
      impot,
      superNet,
      superNetPercentage,
      cotisationsDetail: {
        maladie: 0,
        allocationsFamiliales: 0,
        retraite: cotisationsCarmf,
        retraiteRid: cotisationsCarmfRid,
        retraiteComplementaire: 0,
        csgCrds: 0,
        formation: 0,
      },
      revenuLiberal: revenuLiberalPourCotisations,
      cotisationsRspmDetail: rspmDetail,
      optimisationsAppliquees: Object.keys(optimisationsAppliquees).length > 0 ? optimisationsAppliquees : undefined,
      impotDetails: {
        quotientFamilial: impotCalcDetails.quotientFamilial,
        partsFiscales,
        tmi: impotCalcDetails.tmi,
        tauxEffectif,
        impotParPart: impotCalcDetails.impotParPart,
        tranches: impotCalcDetails.tranches,
        revenuImposableLiberal,
        revenuImposableSalarie,
        revenuImposableConjoint,
        typeRevenuConjoint,
        revenuBrutConjoint: revenusConjointImposable,
        revenuBrutSalarie: revenuSalarieImposable,
        deductionSalarie,
        hasAnyFraisReels: modeFraisSalaries === 'frais_reels' && fraisReelsAnnuel > 0,
        regimeFiscal: profile.regime_fiscal || 'micro-bnc',
        modeFraisSalaries: modeFraisSalaries || 'abattement_10',
        plafonnementApplique: impotCalcDetails.plafonnementApplique,
        avantageEnfantsInitial: impotCalcDetails.avantageEnfantsInitial,
        avantageEnfantsFinal: impotCalcDetails.avantageEnfantsFinal,
        plafondUtilise: impotCalcDetails.plafondUtilise,
        situationFamiliale,
        // Champs bruts pour breakdown pédagogique
        revenuBrutLiberal: yearlyLiberalImposable,
        retrocessionsVersees: retroDeduiteMicroBnc > 0 ? retroDeduiteMicroBnc : undefined,
        chargesLiberales: profile.regime_fiscal !== 'micro-bnc' ? (chargesLiberalesReelles || 0) : undefined,
        chargesReellesPercent: profile.regime_fiscal !== 'micro-bnc' && chargesLiberalesReelles === undefined ? (profile.charges_reelles_percent || 30) : undefined,
        forfait2Montant: forfait2Montant > 0 ? forfait2Montant : undefined,
        cotisationsDeduites: profile.regime_fiscal !== 'micro-bnc' ? cotisationsTotales : undefined,
        deductionsS1: deductionsS1Total > 0 ? deductionsS1Total : undefined,
        chequesVacancesDeduction: chequesVacancesDeduction > 0 ? chequesVacancesDeduction : undefined,
        cotisationsVolontairesDeduites: cotisationsVolontairesAppliquees > 0 ? cotisationsVolontairesAppliquees : undefined,
        abattementDomMontant: domInfo ? Math.min(Math.max(0, impotBrut - totalCredits) * domInfo.tauxAbattement, domInfo.plafond) : 0,
        lieuExercice,
      },
    };
  }, [
    profile,
    yearlyLiberalTotal,
    yearlyLiberalExonere,
    yearlySalariedTotal,
    yearlySalariedExonere,
    yearlyConjointTotal,
    typeRevenuConjoint,
    profile?.situation_familiale,
    profile?.parts_fiscales,
    profile?.regime_fiscal,
    profile?.charges_reelles_percent,
    profile?.taux_rid_rspm,
    modeFraisSalaries,
    fraisReelsAnnuel,
    chargesLiberalesReelles,
    retrocessionsVerseesMicroBnc,
    chequesVacances,
    secteurConventionnel,
    forfait2pct,
    cotisationsVolontaires,
    zoneExoneree,
    anneeInstallationZone,
    anneeFiscale,
    regimeFoncier,
    revenusFonciersBruts,
    revenuFoncierNet,
    creditFormationDirigeant,
    heuresFormation,
    creditImpotAutre,
    tauxRid,
    situationCarmf,
    ratioNonConventionne,
    fraisEmploiDomicile,
    fraisGardeEnfants,
    nombreEnfantsGarde,
    lieuExercice,
  ]);
};

/**
 * Fonction pure pour calcul ponctuel (sans hook)
 * Utile pour les calculs inline dans validateRemplacement
 */
export const calculateRspmBreakdown = ({
  yearlyLiberalTotal,
  yearlyLiberalExonere = 0,
  yearlySalariedTotal = 0,
  yearlySalariedExonere = 0,
  yearlyConjointTotal = 0,
  typeRevenuConjoint = 'salarie',
  profile,
  modeFraisSalaries,
  fraisReelsAnnuel = 0,
  chargesLiberalesReelles,
  retrocessionsVerseesMicroBnc = 0,
  secteurConventionnel,
  forfait2pct = false,
  cotisationsVolontaires = 0,
  zoneExoneree = 'aucune',
  anneeInstallationZone,
  anneeFiscale = 2026,
  regimeFoncier = 'aucun',
  revenusFonciersBruts = 0,
  revenuFoncierNet = 0,
  creditFormationDirigeant = false,
  heuresFormation = 0,
  creditImpotAutre = 0,
  chequesVacances = 0,
  tauxRid,
  situationCarmf = 'affilie_3ans_plus',
  ratioNonConventionne = 0,
  fraisEmploiDomicile = 0,
  fraisGardeEnfants = 0,
  nombreEnfantsGarde = 0,
  lieuExercice,
  cotisationsSocialesOverride,
}: RspmCalculationInput): RspmBreakdown | null => {
  const secteur = secteurConventionnel || 'secteur_1';
  // Phase 3: ratio conventionné
  const ratioConventionne = 1 - (ratioNonConventionne || 0) / 100;
  
  if (!profile) return null;
  if (yearlyLiberalTotal < 0) return null;

  // 🎯 CONVENTION A — Audit pré-prod final 2026 (cf. mémoire dédiée)
  // SÉMANTIQUE STRICTE :
  //  • micro-BNC : seules les RÉTROCESSIONS VERSÉES sont déductibles (CGI Art. 102 ter,
  //    CSS Art. R613-7). Loyer/amortissements sont absorbés par l'abattement 34 %.
  //    → On lit `retrocessionsVerseesMicroBnc` en priorité.
  //    → Fallback rétrocompat : si l'appelant passe encore via `chargesLiberalesReelles`
  //      en micro-BNC (legacy), on l'utilise comme proxy + warn DEV pour détecter régression.
  //  • réel : toutes les charges (incl. retros via L21/BG) déduites en aval via
  //    `chargesLiberalesReelles`. `retrocessionsVerseesMicroBnc` est IGNORÉ.
  let retroDeduiteMicroBnc = 0;
  if (profile.regime_fiscal === 'micro-bnc') {
    if (retrocessionsVerseesMicroBnc > 0) {
      retroDeduiteMicroBnc = retrocessionsVerseesMicroBnc;
    } else if (chargesLiberalesReelles && chargesLiberalesReelles > 0) {
      retroDeduiteMicroBnc = chargesLiberalesReelles;
      if (typeof process !== 'undefined' && process?.env?.NODE_ENV !== 'production') {
        console.warn(
          '[useRspmCalculation] micro-BNC: chargesLiberalesReelles utilisé comme retro (fallback). ' +
          'Préférer le param dédié `retrocessionsVerseesMicroBnc` (Convention A 2026).'
        );
      }
    }
  }
  const baseImposableMicroBnc = Math.max(0, yearlyLiberalTotal - retroDeduiteMicroBnc);

  // 1. Cotisations URSSAF
  const revenuLiberalPourCotisations = baseImposableMicroBnc + yearlyLiberalExonere;
  const rspmDetail = calculateCotisationsRspm(revenuLiberalPourCotisations);
  const cotisationsUrssaf = rspmDetail.total;

  // 2. RID — Phase 3: toggle explicite
  // Note : la RID est OBLIGATOIRE pour tout médecin actif inscrit à l'Ordre.
  // En RSPM, le statut "dispense CARMF" ne s'applique PAS à la RID
  // (la dispense ne concerne que la complémentaire vieillesse en PAMC).
  // CARMF 2026 — PDF officiel « La CARMF en 2026 » p. 29-30 : RID = 626 € (100 %) / 157 € (25 %)
  let cotisationsCarmfRid = 626; // Par défaut 100% (taux plein)
  const ridChoice = tauxRid || profile.taux_rid_rspm;
  if (ridChoice === '25%') {
    cotisationsCarmfRid = 157;
  }


  // En RSPM, la complémentaire CARMF est déjà incluse dans les cotisations URSSAF (13,5%/21,2%)
  const cotisationsCarmf = cotisationsCarmfRid;

  const cotisationsTotales = cotisationsUrssaf + cotisationsCarmf;

    // ✅ 3. CA libéral IMPOSABLE = yearlyLiberalTotal tel quel
    const yearlyLiberalImposable = yearlyLiberalTotal;

    // 4. Bénéfice fiscal (selon régime) - basé sur le CA IMPOSABLE uniquement
    let beneficeFiscal = 0;
    // ✅ Phase 1 : Forfait 2% Secteur 1 — gated par `isInstalledConventionneS1` (cf. fiscalEligibility)
    const eligibilityInputPure = {
      type_exercice: profile.type_exercice,
      secteur_conventionnel: secteur,
      regime_fiscal: profile.regime_fiscal,
      forfait_2pct: forfait2pct,
    };
    const forfait2Montant = canApplyForfait2pct(eligibilityInputPure)
      ? yearlyLiberalImposable * 0.02 * ratioConventionne
      : 0;
    
    // 🎯 Override : si cotisations PAMC fournies (mode hybride API URSSAF + IR local),
    // utiliser ces cotisations partout où l'on en déduit (bénéfice fiscal, super-net,
    // ligne pédagogique de la tooltip Impôts).
    const cotisationsPourBenefice = cotisationsSocialesOverride !== undefined
      ? cotisationsSocialesOverride
      : cotisationsTotales;
    if (profile.regime_fiscal === 'micro-bnc') {
      // 🎯 Conv. A micro-BNC : versé déduit AVANT abattement 34 % (CGI Art. 102 ter).
      beneficeFiscal = baseImposableMicroBnc * 0.66;
    } else {
      // Phase 1 Bug #2 : `undefined` = info absente (fallback 30 %), `0` = info explicite (charges nulles).
      if (chargesLiberalesReelles !== undefined) {
        const ratioImposable = yearlyLiberalTotal > 0 ? yearlyLiberalImposable / yearlyLiberalTotal : 1;
        const chargesImposables = chargesLiberalesReelles * ratioImposable;
        beneficeFiscal = Math.max(0, yearlyLiberalImposable - chargesImposables - forfait2Montant - cotisationsPourBenefice);
      } else {
        const chargesPercent = profile.charges_reelles_percent || 30;
        beneficeFiscal = Math.max(0, yearlyLiberalImposable * (1 - chargesPercent / 100) - forfait2Montant - cotisationsPourBenefice);
      }
    }

    // ✅ Phase 1 : Déductions Secteur 1 (3% + Groupe III) + Cotisations volontaires
    let deductionsS1Total = 0;
    if (canApplyDeductionsS1(eligibilityInputPure)) {
      const { totalDeductionS1 } = calculateDeductionsS1(yearlyLiberalImposable * ratioConventionne);
      deductionsS1Total = totalDeductionS1;
    }
    
    // ✅ Phase 2 : Exonération zone (ZFU-TE / ZFRR)
    // Chèques-vacances ANCV : déductibles en réel uniquement, plafond annuel 1 SMIC mensuel
    // (2024 = 1 766€, 2025 = 1 802€, 2026 = 1 823€) — cap dynamique via declarationParams
    const chequesVacancesDeductionPure = (profile.regime_fiscal === 'reel')
      ? capChequesVacances(chequesVacances || 0, anneeFiscale).capped
      : 0;
    // Phase 2 Bug #4 : cap PER/Madelin (CGI Art. 163 quatervicies / 154 bis).
    const perCapPure = getPerCap(beneficeFiscal, anneeFiscale).plafond;
    const cotisationsVolontairesAppliqueesPure = Math.min(Math.max(0, cotisationsVolontaires), perCapPure);
    let revenuImposableLiberal = Math.max(0, beneficeFiscal - deductionsS1Total - cotisationsVolontairesAppliqueesPure - chequesVacancesDeductionPure);
    const tauxExonerationPure = getTauxExonerationZone(zoneExoneree, anneeInstallationZone || 0, anneeFiscale);
    let exonerationMontantCalcPure = 0;
    if (tauxExonerationPure > 0) {
      exonerationMontantCalcPure = revenuImposableLiberal * tauxExonerationPure;
      if (zoneExoneree === 'zfu') exonerationMontantCalcPure = Math.min(exonerationMontantCalcPure, 50000);
      revenuImposableLiberal = Math.max(0, revenuImposableLiberal - exonerationMontantCalcPure);
    }

  // 4. Revenus salariés (abattement 10% OU frais réels)
  const revenuSalarieImposable = yearlySalariedTotal - yearlySalariedExonere;
  let deductionSalarie = 0;
  if (modeFraisSalaries === 'frais_reels' && fraisReelsAnnuel > 0) {
    deductionSalarie = fraisReelsAnnuel;
  } else {
    // Abattement 10% avec plancher 504€ et plafond 14 426€
    deductionSalarie = revenuSalarieImposable > 0 ? abattement10Salaire(revenuSalarieImposable, anneeFiscale) : 0;
  }
  const revenuImposableSalarie = Math.max(0, revenuSalarieImposable - deductionSalarie);

  // 4.5 Revenus conjoint avec abattement adapté selon le type
  const revenusConjointImposable = yearlyConjointTotal || 0;
  let revenuImposableConjoint: number;
  
  switch (typeRevenuConjoint) {
    case 'salarie':
    default:
      // Abattement 10% avec plancher 504€ et plafond 14 426€
      const abattementConjoint = revenusConjointImposable > 0 ? abattement10Salaire(revenusConjointImposable, anneeFiscale) : 0;
      revenuImposableConjoint = Math.max(0, revenusConjointImposable - abattementConjoint);
      break;
      
    case 'liberal_micro':
      // Abattement 34% (Micro-BNC)
      revenuImposableConjoint = revenusConjointImposable * 0.66;
      break;
      
    case 'liberal_reel':
    case 'autre':
      // Pas d'abattement : montant = bénéfice fiscal déjà calculé
      revenuImposableConjoint = revenusConjointImposable;
      break;
  }

  // ✅ Phase 2 : Revenus fonciers
  const revenuFoncierImposablePure = calculateRevenuFoncierImposable(regimeFoncier, revenusFonciersBruts, revenuFoncierNet);

  // 5. Impôt avec détails (FOYER COMPLET) + plafonnement QF
  const revenuGlobalImposable = Math.max(0, revenuImposableLiberal + revenuImposableSalarie + revenuImposableConjoint + revenuFoncierImposablePure);
  const partsFiscales = profile.parts_fiscales || 1;
  const situationFamiliale = profile.situation_familiale as 'celibataire' | 'marie_pacse' | 'marie-pacse' | 'veuf' | 'parent_isole' || 'celibataire';
  const { impot: impotBrutPure, details: impotCalcDetails } = calculateImpotWithDetails(revenuGlobalImposable, partsFiscales, situationFamiliale, anneeFiscale);

  // ✅ Phase 2 : Crédits d'impôt
  const creditFormationPure = creditFormationDirigeant ? calculateCreditFormation(heuresFormation) : 0;
  // ✅ Emploi à domicile : 50% des dépenses, plafond 12k + 1500/enfant (max 15k)
  // Source de vérité : inférence depuis parts_fiscales (CGI Art. 194), pas le champ orphelin nombre_enfants_charge
  const nbEnfantsForCreditPure = inferEnfantsFromParts(profile.parts_fiscales ?? 1, profile.situation_familiale ?? 'celibataire');
  const plafondEmploiDomicilePure = Math.min(12000 + nbEnfantsForCreditPure * 1500, 15000);
  const creditEmploiDomicilePure = Math.min(fraisEmploiDomicile || 0, plafondEmploiDomicilePure) * 0.5;
  // ✅ Garde enfant < 6 ans : 50% des dépenses, plafond 3500€/enfant
  const plafondGardeEnfantsPure = 3500 * (nombreEnfantsGarde || 0);
  const creditGardeEnfantsPure = Math.min(fraisGardeEnfants || 0, plafondGardeEnfantsPure) * 0.5;
  const totalCreditsPure = creditFormationPure + (creditImpotAutre || 0) + creditEmploiDomicilePure + creditGardeEnfantsPure;
  let impotAvantDomPure = Math.max(0, impotBrutPure - totalCreditsPure);

  // ✅ DOM-TOM : Abattement IR (CGI art. 197-I-3)
  const domInfoPure = getDomTomInfo(lieuExercice);
  if (domInfoPure) {
    const abattementDomPure = Math.min(impotAvantDomPure * domInfoPure.tauxAbattement, domInfoPure.plafond);
    impotAvantDomPure = Math.max(0, impotAvantDomPure - abattementDomPure);
  }
  const impot = impotAvantDomPure;

  // 6. Super-Net (incluant PDSA exonéré dans les revenus totaux)
  // 🎯 Convention A — En micro-BNC, charges classiques absorbées par l'abattement 34 %
  // (déjà comptées dans `beneficeFiscal`). Ne PAS les soustraire à nouveau.
  // 🎯 Mode hybride : si override cotisations API fourni, l'utiliser pour le Super-Net
  // afin de rester cohérent avec l'IR recalculé localement.
  const totalRevenus = revenuLiberalPourCotisations + yearlySalariedTotal;
  // 🎯 Audit juillet 2026 (parité PAMC) — voir hook ci-dessus : symétrie fiscal ↔ cash du repli
  // `charges_reelles_percent` quand aucune charge n'est connue (`undefined`).
  const chargesEffectives = profile.regime_fiscal === 'micro-bnc'
    ? 0
    : (chargesLiberalesReelles !== undefined
        ? chargesLiberalesReelles
        : Math.max(0, yearlyLiberalImposable * ((profile.charges_reelles_percent || 30) / 100)));
  const cotisationsPourSuperNet = cotisationsSocialesOverride !== undefined
    ? cotisationsSocialesOverride
    : (cotisationsUrssaf + cotisationsCarmf);
  const superNet = totalRevenus - cotisationsPourSuperNet - impot - chargesEffectives;
  const superNetPercentage = totalRevenus > 0 ? (superNet / totalRevenus) * 100 : 0;
  const tauxEffectif = revenuGlobalImposable > 0 ? (impot / revenuGlobalImposable) * 100 : 0;

  // ✅ Construire les optimisations appliquées pour affichage
  const exonerationMontantPure = Math.round(exonerationMontantCalcPure);
  
  const optimisationsAppliqueesPure: Record<string, number | string | undefined> = {};
  if (forfait2Montant > 0) optimisationsAppliqueesPure.forfait2pct = Math.round(forfait2Montant);
  if (deductionsS1Total > 0) optimisationsAppliqueesPure.deductionsS1 = Math.round(deductionsS1Total);
  if (cotisationsVolontaires > 0) optimisationsAppliqueesPure.cotisationsVolontaires = cotisationsVolontaires;
  if (chequesVacancesDeductionPure > 0) optimisationsAppliqueesPure.chequesVacances = chequesVacancesDeductionPure;
  if (exonerationMontantPure > 0) {
    optimisationsAppliqueesPure.exonerationZone = exonerationMontantPure;
    optimisationsAppliqueesPure.tauxExonerationZone = tauxExonerationPure;
  }
  if (revenuFoncierImposablePure !== 0) {
    optimisationsAppliqueesPure.revenuFoncier = Math.round(revenuFoncierImposablePure);
    optimisationsAppliqueesPure.revenuFoncierType = regimeFoncier as 'micro' | 'reel';
    if (regimeFoncier === 'micro') optimisationsAppliqueesPure.revenuFoncierBrut = revenusFonciersBruts;
  }
  if (creditFormationPure > 0) optimisationsAppliqueesPure.creditFormation = Math.round(creditFormationPure);
  if ((creditImpotAutre || 0) > 0) optimisationsAppliqueesPure.creditImpotAutre = creditImpotAutre;
  if (creditEmploiDomicilePure > 0) optimisationsAppliqueesPure.creditEmploiDomicile = Math.round(creditEmploiDomicilePure);
  if (creditGardeEnfantsPure > 0) optimisationsAppliqueesPure.creditGardeEnfants = Math.round(creditGardeEnfantsPure);
  if ((ratioNonConventionne || 0) > 0) optimisationsAppliqueesPure.ratioNonConventionne = ratioNonConventionne;

  return {
    cotisationsTotales,
    cotisationsUrssaf,
    cotisationsCarmf,
    netAvantImpot: yearlyLiberalTotal + yearlyLiberalExonere - cotisationsTotales,
    revenuImposableTotal: revenuGlobalImposable,
    impot,
    superNet,
    superNetPercentage,
    cotisationsDetail: {
      maladie: 0,
      allocationsFamiliales: 0,
      retraite: cotisationsCarmf,
      retraiteRid: cotisationsCarmfRid,
      retraiteComplementaire: 0,
      csgCrds: 0,
      formation: 0,
    },
    revenuLiberal: revenuLiberalPourCotisations,
    cotisationsRspmDetail: rspmDetail,
    optimisationsAppliquees: Object.keys(optimisationsAppliqueesPure).length > 0 ? optimisationsAppliqueesPure : undefined,
    impotDetails: {
      quotientFamilial: impotCalcDetails.quotientFamilial,
      partsFiscales,
      tmi: impotCalcDetails.tmi,
      tauxEffectif,
      impotParPart: impotCalcDetails.impotParPart,
      tranches: impotCalcDetails.tranches,
      revenuImposableLiberal,
      revenuImposableSalarie,
      revenuImposableConjoint,
      typeRevenuConjoint,
      revenuBrutConjoint: revenusConjointImposable,
      revenuBrutSalarie: revenuSalarieImposable,
      deductionSalarie,
      hasAnyFraisReels: modeFraisSalaries === 'frais_reels' && fraisReelsAnnuel > 0,
      regimeFiscal: profile.regime_fiscal || 'micro-bnc',
      modeFraisSalaries: modeFraisSalaries || 'abattement_10',
      plafonnementApplique: impotCalcDetails.plafonnementApplique,
      avantageEnfantsInitial: impotCalcDetails.avantageEnfantsInitial,
      avantageEnfantsFinal: impotCalcDetails.avantageEnfantsFinal,
      plafondUtilise: impotCalcDetails.plafondUtilise,
      situationFamiliale,
      // Champs bruts pour breakdown pédagogique
      revenuBrutLiberal: yearlyLiberalImposable,
      retrocessionsVersees: retroDeduiteMicroBnc > 0 ? retroDeduiteMicroBnc : undefined,
      chargesLiberales: profile.regime_fiscal !== 'micro-bnc' ? (chargesLiberalesReelles || 0) : undefined,
      chargesReellesPercent: profile.regime_fiscal !== 'micro-bnc' && chargesLiberalesReelles === undefined ? (profile.charges_reelles_percent || 30) : undefined,
      forfait2Montant: forfait2Montant > 0 ? forfait2Montant : undefined,
      cotisationsDeduites: profile.regime_fiscal !== 'micro-bnc' ? cotisationsPourBenefice : undefined,
      deductionsS1: deductionsS1Total > 0 ? deductionsS1Total : undefined,
      chequesVacancesDeduction: chequesVacancesDeductionPure > 0 ? chequesVacancesDeductionPure : undefined,
      cotisationsVolontairesDeduites: cotisationsVolontairesAppliqueesPure > 0 ? cotisationsVolontairesAppliqueesPure : undefined,
      abattementDomMontant: domInfoPure ? Math.min(Math.max(0, impotBrutPure - totalCreditsPure) * domInfoPure.tauxAbattement, domInfoPure.plafond) : 0,
      lieuExercice,
    },
  };
};
