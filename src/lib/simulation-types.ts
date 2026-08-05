/**
 * Types pour les résultats de simulation fiscale URSSAF
 * (Migré depuis src/config/urssaf-mapping.ts)
 */

export type LieuExercice = 'metropole' | 'guadeloupe' | 'martinique' | 'guyane' | 'reunion' | 'mayotte';

export interface OptimisationsAppliquees {
  forfait2pct?: number;           // Montant du forfait 2% (représentation)
  deductionsS1?: number;          // Déductions S1 (3% + Groupe III)
  cotisationsVolontaires?: number; // PER/Madelin déductibles
  chequesVacances?: number;       // Chèques-vacances ANCV (BNC réel, plafond annuel = 1 SMIC mensuel : 2024=1766€, 2025=1802€, 2026=1823€ — cf. declarationParams)
  exonerationZone?: number;       // Montant exonéré (ZFU/ZFRR)
  tauxExonerationZone?: number;   // Taux d'exonération appliqué (0-1)
  revenuFoncier?: number;         // Montant ajouté au revenu global
  revenuFoncierType?: 'micro' | 'reel'; // Régime foncier appliqué
  revenuFoncierBrut?: number;     // Revenus bruts (pour tooltip micro-foncier)
  creditFormation?: number;       // Crédit d'impôt formation dirigeant
  creditImpotAutre?: number;      // Autres crédits d'impôt
  creditEmploiDomicile?: number;  // Crédit emploi à domicile (50% dépenses, plafond 15k-18k)
  creditGardeEnfants?: number;    // Crédit garde enfant < 6 ans (50% dépenses, 3 500€/enfant)
  ratioNonConventionne?: number;  // % non-conventionné appliqué
}

export interface ImpotDetails {
  revenuImposableLiberal: number;
  revenuImposableSalarie: number;
  revenuImposableConjoint?: number;  // ✅ Revenu imposable du conjoint (après abattement adapté)
  revenusSalariesBrut: number;
  revenusConjointBrut?: number;      // ✅ Revenu brut du conjoint (avant abattement)
  typeRevenuConjoint?: 'salarie' | 'liberal_micro' | 'liberal_reel' | 'autre';  // ✅ Type de revenu du conjoint
  modeFraisSalaries: 'abattement_10' | 'frais_reels';
  deductionAppliquee: number;
  parts: number;
  regimeFiscal: 'micro-bnc' | 'reel';
  // ✅ Données pédagogiques pour tooltips
  tmi?: number;                      // Taux Marginal d'Imposition (11%, 30%, 41%, 45%)
  quotientFamilial?: number;         // Revenu imposable / parts
  tauxEffectif?: number;             // Taux effectif réel (impôt / revenu × 100)
  // ✅ Plafonnement du quotient familial (Article 197 CGI)
  plafonnementApplique?: boolean;    // true si le plafond QF a été atteint
  avantageEnfantsInitial?: number;   // Avantage théorique sans plafond
  avantageEnfantsFinal?: number;     // Avantage réel après plafond
  plafondUtilise?: number;           // Montant du plafond (ex: 3582€ pour 2 enfants)
}

export interface DomTomResultInfo {
  territoire: string;
  tauxAbattement: number;
  plafond: number;
  abattementApplique?: number;
}

export interface SimulationResult {
  netAvantImpot: number;
  superNet: number;
  impot: number;
  cotisationsTotales: number;
  
  // Revenu imposable total (libéral + salarié)
  revenuImposableTotal?: number;
  
  // Détails pour tooltip pédagogique impôts
  impotDetails?: ImpotDetails;
  
  // Pour affichage pédagogique Micro-BNC (charges non déductibles)
  superNetFiscal?: number;  // Super-Net avant déduction des charges réelles
  chargesReelles?: number;  // Charges professionnelles à payer (pour affichage)
  
  // ✅ Optimisations fiscales appliquées (Phase 1/2/3)
  optimisationsAppliquees?: OptimisationsAppliquees;
  
  // Détails cotisations (pour affichage précis)
  cotisationsDetail: {
    maladie: number;
    allocationsFamiliales: number;
    retraite: number;  // CARMF total (RID + complémentaire)
    retraiteRid?: number;  // RID seul (pour affichage détaillé)
    retraiteComplementaire?: number;  // Régime complémentaire CARMF
    csgCrds: number;
    formation: number;
  };
  
  // ✅ Informations DOM-TOM si applicable
  domTomInfo?: DomTomResultInfo | null;
  
  // Lieu d'exercice sélectionné
  lieuExercice?: LieuExercice;
  
  // ✅ Indique si le calcul a été fait en RSPM (cotisations simplifiées)
  isRSPM?: boolean;
  
  missingVariables: Record<string, any>;
}
