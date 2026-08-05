/**
 * Moteur de calcul DS-PAMC (Déclaration Sociale unique des Praticiens et
 * Auxiliaires Médicaux Conventionnés) + cases miroir 2042-C PRO.
 *
 * Référence : Calculette 2042 et DS-PAMC (Excel médecin) + spec produit.
 * 100 % pur, sans dépendance React, testable.
 */

import { capChequesVacances, getDeclarationParams } from '@/lib/taxParams/declarationParams';

// =============================================================================
// Types
// =============================================================================

export interface Declaration2035Inputs {
  /** AA — CA conventionné avant rétrocession */
  AA: number;
  /** AF — Gains divers (recettes non conventionnelles) */
  AF: number;
  /** CE — Total Excédent (recettes − dépenses, si positif) */
  CE: number;
  /** CN — Total Insuffisance (dépenses − recettes, si positif) */
  CN: number;
  /** BK — Charges sociales personnelles (URSSAF + CARMF) */
  BK: number;
  /** BV — CSG déductible */
  BV: number;
  /** Exonérations (cases optionnelles, en général 0 chez les médecins) */
  CS: number;
  AW: number;
  CU: number;
  CI: number;
  CO: number;
  DG: number;
  CJ: number;
  DH: number;
  /** CP — Résultat BNC (ligne L46) */
  CP: number;
}

export interface ExtrasMedecin {
  /**
   * IJ CPAM hors ALD (maladie, maternité, paternité, AFRM).
   * Doctrine 2026 (Brochure DGFiP p. 180 + Guide PAMC URSSAF v1.0 du 09/04/2026) :
   * - Réel : à inclure par l'utilisateur dans la ligne AF (gains divers) → 5QC. JAMAIS en 1AJ.
   *   Anti-double-comptage social : montant à reporter aussi en ligne DB du Cadre 8.
   * - Micro-BNC : EXCLUES de 5HQ (non imposables IR). Conservées uniquement en DSDX/DSDY (social).
   * Conséquence : ce champ alimente UNIQUEMENT DSDX. Il n'alimente plus case_1AJ (= 0).
   */
  ijCpam: number;
  /** IJ Madelin hors ALD (déclarées en gains divers) + AJPA proche aidant CAF */
  ijMadelin: number;
  /**
   * IJ CARMF PENSION/RENTE (médecin retraité ou invalidité permanente).
   * Alimente UNIQUEMENT case 1AS de la 2042 (catégorie pensions/rentes).
   * NE va NI en DSDX, NI en DSCZ. Cf. Phase 9H sealing (mai 2026).
   */
  ijCarmf: number;
  /**
   * IJ CARMF TEMPORAIRE (médecin actif, arrêt maladie/maternité de courte durée).
   * Doctrine Phase 9H : intégrées au BNC (AF/5HQ + bénéfice) puis réintégrées
   * socialement en DSCZ (comme les IJ Madelin). PAS en 1AS.
   */
  ijCarmfTemporaire?: number;
  /**
   * IJ CARMF INVALIDITÉ PERMANENTE (rare).
   * Alimente UNIQUEMENT case 1AZ de la 2042. NE va NI en DSDX, NI en DSCZ.
   * Cf. Phase 9H sealing : 1AZ = invalidité permanente, distinct du 1AS retraite.
   */
  ijCarmfInvalidite?: number;
  /** Chèques-vacances ANCV (capés au plafond annuel) */
  chequesVacances: number;
  /** Dépassements d'honoraires (secteur 2) */
  depassements: number;
  /** Recettes EHPAD tarif non opposable + HAD/SSIAD/CMPP nettes */
  ehpadHadSsiadCmpp: number;
}

export interface ResultatRBS {
  /** Revenu Brut Social */
  rbs: number;
  /** Décomposition pour le visuel waterfall */
  decomposition: {
    excedent: number;
    insuffisance: number;
    chargesSociales: number;
    csgDeductible: number;
    exonerations: number;
    /** Cadre 8 (Cerfa 15945*08, millésime 2026) — réintégrations sociales DE */
    reintegrationsCadre8: number;
    /** Cadre 8 (Cerfa 15945*08, millésime 2026) — déductions sociales DB */
    deductionsCadre8: number;
  };
}

export interface ResultatDSPAMC {
  DSCS: number; // CA total avant rétro (AA + AF)
  DSAV: number; // Montant conventionné total avant rétro (AA)
  DSAW: number; // Dépassements d'honoraires
  DSAU: number; // Ratio conventionné DSAV/DSCS (0 si DSCS=0) — entre 0 et 1
  DSAT: number; // EHPAD/HAD/SSIAD/CMPP
  DSDE: number; // Revenu Brut Social — montant POSITIF (0 si RBS < 0)
  DSDG: number; // Revenu Brut Social — montant NÉGATIF (valeur absolue ; 0 si RBS ≥ 0)
  DSDX: number; // IJ CPAM (réintégration sociale)
  DSCZ: number; // IJ Madelin + AJPA + IJ CARMF temporaire (réintégration sociale — sec. 6.5 notice 52348#06, Phase 9H)
  DSCN: number; // Chèques-vacances (capés au plafond annuel)
  /**
   * DSFA — PDSA exonérée Art. 151 ter CGI (déclarant 1).
   * Doctrine Phase G (mai 2026, bible RO-006/RO-015, Brochure DGFiP 2026 p. 180, Notice URSSAF 52348#06) :
   * - Micro-BNC PAMC : DSFA = pdsaExonere × 0,66 (NET après abattement 34 %).
   * - Réel PAMC : DSFA = 0 — la PDSA est déjà réintégrée via la ligne CI (Cadre 8) → DSDE.
   *   Forcer DSFA en réel = double cotisation.
   * - RSPM : pas de DSFU, donc engine pas appelé.
   * Garde-fou : DSFA ≠ 5HP (réservé aux régimes zonés ZFU/ZRR/JEI).
   */
  DSFA: number;
  /** DSFB — Idem DSFA mais pour le déclarant 2. Routage via DSPAMCContext.declarant. */
  DSFB: number;
  /** Décomposition RBS pour visuel */
  rbs: ResultatRBS;
  /** Avertissements doux (UI) */
  warnings: string[];
  /** Erreurs bloquantes (UI) */
  errors: string[];
}

export interface Resultat2042CPRO {
  /** 5QC (régime réel) ou 5HQ (micro-BNC) — saisi par l'appelant */
  case_5QC_5RC: number;
  /** 1AS — IJ CARMF pension/retraite (Phase 9H — distinct de 1AZ invalidité) */
  case_1AS: number;
  /** 1AZ — IJ CARMF invalidité permanente (Phase 9H sealing mai 2026) */
  case_1AZ: number;
  /**
   * 1AJ — Traitements/salaires (rubrique TS du déclarant).
   * Doctrine 2026 scellée (Brochure DGFiP p. 180, IJ CPAM doctrine sealing mai 2026) :
   * les IJ CPAM ne sont JAMAIS en 1AJ. Ce champ reste à 0 pour la page Aide-PAMC.
   */
  case_1AJ: number;
  /**
   * Phase 14 — 5HP/5IP : recettes nettes exonérées en Micro-BNC (régimes zonés ZFU-TE / ZFRR).
   * Distinct de 5HQ (recettes imposables). Sources : CGI Art. 44 octies A / 44 quindecies.
   * Pré-calculé par l'appelant : recettes correspondant au bénéfice exonéré (= bénéfice exonéré ÷ 0,66).
   * 0 en régime réel (l'exonération zonée passe par les cases CS/CJ de la 2035-B).
   */
  case_5HP_5IP?: number;
}


// =============================================================================
// Helpers
// =============================================================================

const safe = (n: number): number => (Number.isFinite(n) ? n : 0);
const round2 = (n: number): number => Math.round(n * 100) / 100;

// =============================================================================
// RBS — Revenu Brut Social
// =============================================================================

/**
 * Options pour le cadre 8 « Travailleurs Indépendants » de la 2035-B
 * (NOUVEAU millésime 2026, Cerfa 15945*08).
 *
 * - DE : sommes à réintégrer au RBS (intéressement, PEE/PERCO, brevets…)
 * - DB : sommes à déduire du RBS (IJ CPAM/CARMF/Madelin déjà comptées en gains divers)
 *
 * Backward-compatible : par défaut DE = DB = 0 → comportement identique au pré-L2.11.
 */
export interface Cadre8Options {
  DE?: number;
  DB?: number;
}

/**
 * RBS = Excédent − Insuffisance + Charges sociales + CSG + Σ Exonérations + DE − DB.
 * Reproduction littérale de la formule Excel `=C6-C7+SUM(C8:C17)`, étendue au cadre 8 2026.
 */
export function calculerRBS(d: Declaration2035Inputs, c8: Cadre8Options = {}): ResultatRBS {
  const exonerations =
    safe(d.CS) +
    safe(d.AW) +
    safe(d.CU) +
    safe(d.CI) +
    safe(d.CO) +
    safe(d.DG) +
    safe(d.CJ) +
    safe(d.DH);

  const reintegrationsCadre8 = safe(c8.DE);
  const deductionsCadre8 = safe(c8.DB);

  const rbs =
    safe(d.CE) -
    safe(d.CN) +
    safe(d.BK) +
    safe(d.BV) +
    exonerations +
    reintegrationsCadre8 -
    deductionsCadre8;

  return {
    rbs: round2(rbs),
    decomposition: {
      excedent: round2(safe(d.CE)),
      insuffisance: round2(safe(d.CN)),
      chargesSociales: round2(safe(d.BK)),
      csgDeductible: round2(safe(d.BV)),
      exonerations: round2(exonerations),
      reintegrationsCadre8: round2(reintegrationsCadre8),
      deductionsCadre8: round2(deductionsCadre8),
    },
  };
}

// =============================================================================
// DS-PAMC — 9 cases sociales
// =============================================================================

export interface DSPAMCContext {
  /** Dotations aux amortissements (L41 de la 2035) — passées pour le contrôle de cohérence CP */
  amortissements?: number;
  /** Revenus exonérés art. 151 ter (L43 — PDSA) — passés pour le contrôle de cohérence CP ET pour le calcul DSFA/DSFB */
  pdsaExonere?: number;
  /** Cadre 8 — DE (réintégrations sociales) saisi côté Aide 2035, propagé pour cohérence cross-page */
  cadre8DE?: number;
  /** Cadre 8 — DB (déductions sociales) saisi côté Aide 2035, propagé pour cohérence cross-page */
  cadre8DB?: number;
  /**
   * Régime fiscal — pilote le routage DSFA/DSFB (Phase G, doctrine RO-006).
   * - 'micro-bnc' : DSFA/DSFB = pdsaExonere × 0,66 (NET après abattement 34 %).
   * - 'reel' (défaut) : DSFA/DSFB = 0 (réintégration auto via CI → DSDE).
   */
  regimeFiscal?: 'micro-bnc' | 'reel';
  /**
   * Numéro du déclarant (1 ou 2) — route le NET PDSA vers DSFA (D1) ou DSFB (D2).
   * Défaut : 1.
   */
  declarant?: 1 | 2;
}

export function calculerDSPAMC(
  d: Declaration2035Inputs,
  e: ExtrasMedecin,
  year: number,
  ctx: DSPAMCContext = {}
): ResultatDSPAMC {
  const warnings: string[] = [];
  const errors: string[] = [];

  // Chèques-vacances : DSCN reçoit le montant TOTAL commandé (doctrine officielle —
  // cf. RO-005). L'URSSAF applique automatiquement l'exo dans la limite du plafond
  // social (547 € en 2026). La déduction fiscale 5QC, elle, est plafonnée à 1 SMIC
  // mensuel (1 823 € en 2026) — gérée dans `calculer2042Liberal` via `cv.capped`.
  const cv = capChequesVacances(safe(e.chequesVacances), year);
  if (cv.depasse) {
    const params = getDeclarationParams(year);
    warnings.push(
      `Chèques-vacances saisis : ${cv.capped + cv.excedent} € — l'excédent de ${cv.excedent} € au-delà du plafond fiscal ${params.plafondChequesVacances} € (${year}) n'est PAS déduit du bénéfice (case 5QC/5RC plafonnée). DSCN reçoit le total commandé : l'URSSAF applique l'exo cotisations URSSAF + CARMF dans la limite du plafond social ${params.plafondSocialChequesVacances} € (= 30 % SMIC mensuel). La CSG-CRDS reste due sur cette part exonérée.`
    );
  }

  // DG + DH : cumulables depuis l'imposition des revenus 2023 (suppression de la
  // condition de non-cumul, art. 158, 7 CGI). Source : BOI-BNC-SECT-40, repris dans
  // le Guide fiscal UNASA 2035-2026 §391 p. 92-93. Aucune erreur bloquante.

  // DSCS / DSAV
  const DSCS = round2(safe(d.AA) + safe(d.AF));
  const DSAV = round2(safe(d.AA));
  if (DSCS === 0) {
    warnings.push(
      'CA total (DSCS) = 0 — saisis tes recettes AA + AF avant de reporter le ratio conventionné.'
    );
  }

  // Garde-fou doux : signaler si la somme DG + DH dépasse 30 % de AA (saisie aberrante).
  if (safe(d.AA) > 0) {
    const sommeForfaits = safe(d.DG) + safe(d.DH);
    if (sommeForfaits > safe(d.AA) * 0.30) {
      warnings.push(
        `Somme DG + DH (${round2(sommeForfaits)} €) supérieure à 30 % de AA (${round2(safe(d.AA))} €). Vérifie tes saisies — ces forfaits sont calculés sur les seuls honoraires conventionnels (cumul autorisé depuis revenus 2023, BOI-BNC-SECT-40).`
      );
    }
  }

  // B-U1 — IJ Madelin réintégrées en DSCZ mais absentes de AF (gains divers).
  // Cas piège : l'utilisateur a saisi ses IJ Madelin sans les inclure dans AF.
  // Conséquence : DSCS sous-évalué (les IJ Madelin sont normalement déjà en AF).
  if (safe(e.ijMadelin) > 0 && safe(d.AF) === 0) {
    warnings.push(
      `Tu as saisi des IJ Madelin (${round2(safe(e.ijMadelin))} €) mais ton AF (Gains divers) est à 0. Vérifie : les IJ Madelin doivent normalement déjà être incluses dans AF de ta 2035-A. Si tu les as oubliées, ajoute-les en AF — sinon ton CA total (DSCS) sera sous-évalué.`
    );
  }

  // DSAU — ratio conventionné (0 si DSCS = 0 → garde anti /0)
  // Brochure officielle 2026 p. 203 : « doit être comprise entre 0,00 et 1,00 »
  const rawRatio = DSCS > 0 ? safe(d.AA) / DSCS : 0;
  const DSAU = round2(Math.min(1, Math.max(0, rawRatio)));
  if (rawRatio > 1) {
    warnings.push(
      `Ratio conventionné DSAV/DSCS supérieur à 1 (${round2(rawRatio)}) — incohérence détectée (DSAV ne peut pas dépasser DSCS). Ratio plafonné à 1,00. Vérifie tes saisies AA / AF.`
    );
  }

  // D1 (Phase V11) — Heuristique S2 : si dépassements > 0 mais DSAU ≈ 1, AA inclut probablement
  // les dépassements (faute de saisie). DSAW est ALORS double-compté en AA, sous-évaluant la part
  // hors-convention. Seuil 0.99 pour absorber arrondis (cas type : 100k AA dont 5k dépassements
  // → DSAU=1 au lieu de 0,95).
  if (safe(e.depassements) > 0 && DSAU >= 0.99 && DSCS > 0) {
    warnings.push(
      `Dépassements d'honoraires saisis (${round2(safe(e.depassements))} €) mais ratio conventionné DSAU = 1,00. Vérifie : ton AA (${round2(safe(d.AA))} €) doit être saisi HORS dépassements (les dépassements vont uniquement en case dédiée DSAW). Si AA inclut les dépassements, DSAU est surestimé et tes cotisations PCC seront mal proratisées.`
    );
  }

  // RBS — peut être négatif en cas de fortes insuffisances
  // L2.11 — propagation cadre 8 (DE/DB) depuis l'Aide 2035 pour un RBS unique cross-page.
  const rbs = calculerRBS(d, { DE: ctx.cadre8DE, DB: ctx.cadre8DB });
  // M2 (L2.8) — Routage DSDE / DSDG selon le signe (source AGA-PS millésime 2026)
  const DSDE = rbs.rbs >= 0 ? rbs.rbs : 0;
  const DSDG = rbs.rbs < 0 ? round2(-rbs.rbs) : 0;
  if (rbs.rbs < 0) {
    warnings.push(
      `Revenu Brut Social négatif (${rbs.rbs} €) → à reporter en case DSDG (${DSDG} €), pas en DSDE. Cas rare, possible en cas de fortes insuffisances.`
    );
  }

  // C4 — Cohérence CP vs formule réelle de la 2035 :
  //   CP = CE − CN − amortissements − pdsaExonéré − Σ exonérations
  // (les réintégrations L36 sont déjà incluses en amont par useAide2035Data dans CP).
  // Warning silencieux si CP=0 (utilisateur n'a rien saisi).
  const exos =
    safe(d.CS) + safe(d.AW) + safe(d.CU) + safe(d.CI) + safe(d.CO) + safe(d.DG) + safe(d.CJ) + safe(d.DH);
  const expectedCP =
    safe(d.CE) -
    safe(d.CN) -
    safe(ctx.amortissements ?? 0) -
    safe(ctx.pdsaExonere ?? 0) -
    exos;
  if (safe(d.CP) !== 0 && Math.abs(safe(d.CP) - expectedCP) > 1) {
    warnings.push(
      `Le résultat BNC (CP = ${round2(safe(d.CP))} €) semble incohérent avec Excédent − Insuffisance − amortissements − PDSA exonéré − exonérations (${round2(expectedCP)} €). Vérifie ta 2035.`
    );
  }

  // Phase G — DSFA / DSFB : PDSA exonérée Art. 151 ter (volet social DSFU).
  // Doctrine RO-006 + RO-015 (bible HippoDoc) + Brochure DGFiP 2026 p. 180 + Notice URSSAF 52348#06 :
  // - Micro-BNC PAMC : DSFA = pdsaExonere × 0,66 (NET après abattement 34 %).
  // - Réel PAMC : DSFA = 0 — la PDSA est déjà réintégrée via la ligne CI (Cadre 8) → DSDE.
  //   Forcer une valeur en réel = double cotisation URSSAF.
  // Garde-fou éditorial : DSFA ≠ 5HP (réservée aux régimes zonés ZFU/ZRR/JEI).
  const regimeFiscal = ctx.regimeFiscal ?? 'reel';
  const declarant = ctx.declarant ?? 1;
  const pdsaExo = safe(ctx.pdsaExonere ?? 0);
  let DSFA = 0;
  let DSFB = 0;
  if (regimeFiscal === 'micro-bnc' && pdsaExo > 0) {
    const nett = round2(pdsaExo * 0.66);
    if (declarant === 2) {
      DSFB = nett;
    } else {
      DSFA = nett;
    }
  }

  return {
    DSCS,
    DSAV,
    DSAW: round2(safe(e.depassements)),
    DSAU,
    DSAT: round2(safe(e.ehpadHadSsiadCmpp)),
    DSDE,
    DSDG,
    DSDX: round2(safe(e.ijCpam)),
    DSCZ: round2(safe(e.ijMadelin) + safe(e.ijCarmfTemporaire)),
    DSCN: round2(safe(e.chequesVacances)),
    DSFA,
    DSFB,
    rbs,
    warnings,
    errors,
  };
}

// =============================================================================
// Cases miroir 2042-C PRO (rappel — calculées aussi par useAide2042Data)
// =============================================================================

export interface Calcul2042Options {
  /** Si TRUE : CV déjà déduits dans CP (charges 2035) → ne pas re-soustraire. Évite double-déduction. */
  chequesVacancesDejaInclus?: boolean;
}

export function calculer2042Liberal(
  d: Declaration2035Inputs,
  e: ExtrasMedecin,
  year: number,
  opts: Calcul2042Options = {}
): Resultat2042CPRO {
  const cv = capChequesVacances(safe(e.chequesVacances), year);
  const cvDeduction = opts.chequesVacancesDejaInclus ? 0 : cv.capped;
  return {
    case_5QC_5RC: round2(safe(d.CP) - cvDeduction),
    case_1AS: round2(safe(e.ijCarmf)),
    case_1AZ: round2(safe(e.ijCarmfInvalidite)),
    // Doctrine 2026 : les IJ CPAM ne sont JAMAIS en 1AJ (cf. ExtrasMedecin.ijCpam).
    case_1AJ: 0,
  };
}
