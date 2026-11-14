import { useRef, useState } from 'react';
import { invokeCalculateUrssaf } from '@/lib/supabase-public';
import type { SimulateurFormData } from '@/components/simulateur/simulateurSchema';
import type { SimulationResult, DomTomResultInfo, LieuExercice } from '@/lib/simulation-types';
import { calculateRspmBreakdown } from '@/lib/simulateur/useRspmCalculation';
import { reformeAssiette, assietteMicro, assietteReformee, revenuConventionne, economieAsvProportionnelle, complementaireCarmf, calculerCotisationsUrssaf, type CotisationsUrssaf, type ParametresUrssaf } from '@/lib/simulateur/urssaf';
import { calculateFiscalParts } from '@/lib/fiscalParts';
import { superNetDuMedecin } from '@/lib/simulateur/impotMedecin';
import { getDomTomInfo } from '@/lib/dom-tom';
import { getMicroBncCeiling } from '@/lib/baremes-ir';
import { normalizeCarmfStatus } from '@/lib/carmfStatus';

/**
 * RSPM (régime simplifié des professions médicales, CSS art. L642-4-2 et D642-4-1) : une
 * OPTION, ouverte aux remplaçants (et régulateurs, étudiants remplaçants…) sans autre
 * activité libérale, dont les recettes brutes ne dépassent pas 19 000 €. On le perd après
 * deux années de suite au-dessus de 19 000 € ou une seule au-dessus de 38 000 €. Pour une
 * année type (recettes stables), il ne tient donc que jusqu'à 19 000 € : c'est le seuil du
 * mode Auto. Au-dessus, un remplaçant déjà au RSPM peut le choisir à la main jusqu'à
 * 38 000 €. Avant novembre 2026, le mode Auto le retenait jusqu'à 38 000 €, pour tous,
 * installés compris.
 */
const SEUIL_RSPM_ENTREE = 19000;

/**
 * En dessous de 50 €/mois (600 €/an) d'écart, les deux régimes « se valent » : c'est
 * l'ordre de grandeur de ce que le simulateur ne voit pas (arrondis de l'administration,
 * charges approchées, cotisations régularisées). Le montant est TOUJOURS affiché, même
 * dans ce cas (audit de novembre 2026 : « écart négligeable » s'affichait sans montant,
 * y compris pour 1 000 €/mois d'écart au-delà du plafond du Micro-BNC). Sous ce seuil,
 * aucune fiche ne porte « Recommandé ».
 */
export const SEUIL_EQUIVALENCE_ANNUEL = 600;

/** Dispense d'affiliation CARMF : remplaçant, revenu net d'activité indépendante < 15 000 €. */
const SEUIL_DISPENSE_CARMF = 15000;

/**
 * Début d'activité retenu : le champ `debutActivite`, ou l'ancienne valeur « jeune affilié » de
 * la situation CARMF (les deux premières années), qui vaut 2e année.
 */
export function debutActiviteDe(formData: Pick<SimulateurFormData, 'debutActivite' | 'situationCarmf'>): 'premiere' | 'deuxieme' | undefined {
  if (formData.debutActivite === 'premiere' || formData.debutActivite === 'deuxieme') return formData.debutActivite;
  return normalizeCarmfStatus(formData.situationCarmf) === 'affilie_jeune' ? 'deuxieme' : undefined;
}

/**
 * Barème des dispenses de la complémentaire CARMF, sur demande (CARMF, « Dispenses pour
 * insuffisance de revenus », barème 2026, « revenus imposables de toute nature » du médecin de
 * 2025) : 100 % jusqu'à 6 100 €, 75 % jusqu'à 14 300 €, 50 % jusqu'à 23 100 €, 25 % jusqu'à
 * 32 500 €. La part dispensée ne donne pas de points de retraite.
 */
export function tauxDispenseComplementaire(revenusImposables: number): number {
  if (revenusImposables <= 6100) return 1;
  if (revenusImposables <= 14300) return 0.75;
  if (revenusImposables <= 23100) return 0.5;
  if (revenusImposables <= 32500) return 0.25;
  return 0;
}

/** Part non déductible de la CSG-CRDS des indépendants : (2,4 % + 0,5 %) / 9,7 %. */
const PART_CSG_CRDS_NON_DEDUCTIBLE = 2.9 / 9.7;

export interface RegimeComparison {
  reel: SimulationResult | null;
  microBnc: SimulationResult | null;
  recommande: 'reel' | 'micro-bnc' | null;
  /** Écart annuel de Super-Net entre les deux régimes, en valeur absolue. */
  economie: number;
  /** Super-Net Micro-BNC − Super-Net réel (signé). */
  difference: number;
  /** Plafond de recettes du Micro-BNC pour l'année simulée. */
  plafondMicro?: number;
  recettesAnnuelles?: number;
  revenusSalariesAnnuels?: number;
  revenusConjointAnnuels?: number;
  liberalExonereAnnuel?: number;  // Revenus PDSA exonérés IR
  domTomInfo?: DomTomResultInfo | null;
  lieuExercice?: LieuExercice;
  isRSPMUsed?: boolean;
  /** 1re année d'activité en PAMC : cotisations provisionnelles appelées sur la base forfaitaire
   *  (`calculerProvisionnelPremiereAnnee`) ; `null` si le calcul n'a pas abouti. */
  provisionnelPremiereAnnee?: { urssaf: number; carmf: number } | null;
}

const annualiser = (formData: SimulateurFormData, v: number | undefined): number =>
  formData.periode === 'mensuel' ? (v || 0) * 12 : (v || 0);

/** Détermine si on doit utiliser le calcul RSPM local. */
const shouldUseRspm = (formData: SimulateurFormData, recettesAnnuelles: number): boolean => {
  if (formData.regimeSocial === 'rspm') return true;
  if (formData.regimeSocial === 'pamc') return false;
  return formData.typeExercice !== 'installe' && recettesAnnuelles <= SEUIL_RSPM_ENTREE;
};

const DEPARTEMENTS_OUTRE_MER: Record<string, ParametresUrssaf['departementOutreMer']> = {
  guadeloupe: 'Guadeloupe',
  martinique: 'Martinique',
  guyane: 'Guyane',
  reunion: 'La Réunion',
  mayotte: 'Mayotte',
};

/**
 * Cotisations PAMC : modèle Urssaf interrogé directement ; en cas d'échec, repli sur la
 * fonction Supabase (qui ignore le secteur, l'année et le statut de remplaçant : c'est un
 * secours, pas une alternative).
 */
async function cotisationsPamc(
  formData: SimulateurFormData,
  regimeFiscal: 'reel' | 'micro-bnc',
  recettesAnnuelles: number,
  chargesAnnuelles: number,
  liberalExonere: number,
  secours = true,
): Promise<{ cotisations: CotisationsUrssaf; source: 'urssaf' | 'secours' } | null> {
  try {
    const cotisations = await calculerCotisationsUrssaf({
      annee: formData.annee || 2026,
      recettes: recettesAnnuelles,
      charges: chargesSociales(formData, regimeFiscal, recettesAnnuelles, chargesAnnuelles),
      regime: regimeFiscal,
      secteur: formData.secteurConventionnel || 'secteur_1',
      remplacant: formData.typeExercice === 'remplacant',
      ratioNonConventionne: formData.ratioNonConventionne || 0,
      departementOutreMer: DEPARTEMENTS_OUTRE_MER[formData.lieuExercice || 'metropole'],
      debutActivite: debutActiviteDe(formData),
      asvProportionnelle: Boolean(formData.asvProportionnelle) && economieAsvDe(formData, regimeFiscal) > 0,
    });
    return { cotisations: ajusterCarmf(cotisations, formData, regimeFiscal, recettesAnnuelles, chargesAnnuelles), source: 'urssaf' };
  } catch (err) {
    console.warn('[Simulateur] API Urssaf indisponible', err);
    // Pas de repli à partir des revenus 2025 : la fonction Supabase calcule l'assiette d'avant
    // la réforme (MIGRATION.md § 9.fv). Mieux vaut le message « réessaie » qu'un chiffre faux.
    if (!secours || reformeAssiette(formData.annee || 2026)) return null;
  }

  const { data, error } = await invokeCalculateUrssaf({ formData, regimeFiscal, liberalExonere });
  if (error || !data || (data as { fallbackMode?: boolean }).fallbackMode) return null;
  const r = data as SimulationResult;
  // La fonction Supabase applique elle-même les statuts CARMF (jeune affilié, dispense).
  return { source: 'secours', cotisations: {
    total: r.cotisationsTotales,
    csgCrdsNonDeductible: (r.cotisationsDetail?.csgCrds || 0) * PART_CSG_CRDS_NON_DEDUCTIBLE,
    detail: {
      maladie: r.cotisationsDetail?.maladie || 0,
      allocationsFamiliales: r.cotisationsDetail?.allocationsFamiliales || 0,
      retraite: r.cotisationsDetail?.retraite || 0,
      retraiteComplementaire: r.cotisationsDetail?.retraiteComplementaire || 0,
      retraiteRid: r.cotisationsDetail?.retraiteRid || 0,
      retraiteBase: 0,
      asv: 0,
      csgCrds: r.cotisationsDetail?.csgCrds || 0,
      formation: r.cotisationsDetail?.formation || 0,
    },
  } };
}

/**
 * Charges retenues pour l'assiette sociale. Au réel, le forfait 2 % des médecins installés en
 * secteur 1 reste déduit de l'assiette sociale (il n'est pas réintégré au revenu brut social du
 * cadre 8 de la 2035, à la différence du 3 % et du groupe III) : il s'ajoute aux charges.
 */
function chargesSociales(
  formData: SimulateurFormData,
  regimeFiscal: 'reel' | 'micro-bnc',
  recettesAnnuelles: number,
  chargesAnnuelles: number,
): number {
  const forfait2 = regimeFiscal === 'reel' && formData.typeExercice === 'installe'
    && formData.secteurConventionnel !== 'secteur_2' && formData.forfait2pct;
  return chargesAnnuelles + (forfait2 ? recettesAnnuelles * 0.02 : 0);
}

/** Assiette des cotisations de l'année simulée (réforme : revenus 2025 et suivants). */
function assietteDe(formData: SimulateurFormData, regimeFiscal: 'reel' | 'micro-bnc'): number {
  const recettes = annualiser(formData, formData.recettesBrutes);
  const charges = chargesSociales(formData, regimeFiscal, recettes, annualiser(formData, formData.chargesHorsCotisations));
  return regimeFiscal === 'micro-bnc' ? assietteMicro(recettes) : assietteReformee(recettes - charges, formData.annee || 2026);
}

/**
 * Complémentaire CARMF hors début d'activité, à ces revenus : ce qui s'ajoutera à partir de la
 * 3e année d'affiliation (calculée sur les revenus de l'avant-dernière année ; CARMF, « Vos
 * cotisations en début d'activité », 2026). Même calcul que les cotisations du cas général.
 */
export function complementaireCarmfPleine(formData: SimulateurFormData, regimeFiscal: 'reel' | 'micro-bnc'): number {
  const annee = formData.annee || 2026;
  // Avant la réforme, l'assiette est celle du modèle, que ce calcul local ne connaît pas.
  if (!reformeAssiette(annee)) return 0;
  return complementaireCarmf(assietteDe(formData, regimeFiscal), annee);
}

/**
 * Ce que l'ASV proportionnelle ferait gagner au médecin (€/an), sur l'assiette des cotisations
 * de l'année simulée ; 0 si elle n'est pas ouverte : les deux premières années (l'ASV y est sur
 * la base forfaitaire), ou un revenu conventionné de 63 900 € ou plus en 2026 (la CARMF regarde
 * celui de l'avant-dernière année). Le même calcul sert au moteur et à la suggestion.
 */
export function economieAsvDe(formData: SimulateurFormData, regimeFiscal: 'reel' | 'micro-bnc'): number {
  // Pas d'ASV proportionnelle avant la réforme (`situationMedecin` ne l'applique qu'à la nouvelle
  // assiette), ni les deux premières années.
  if (debutActiviteDe(formData) || !reformeAssiette(formData.annee || 2026)) return 0;
  const conventionne = revenuConventionne(assietteDe(formData, regimeFiscal), formData.ratioNonConventionne);
  return economieAsvProportionnelle(formData.annee || 2026, conventionne, formData.secteurConventionnel);
}

/**
 * Statut CARMF, que le modèle Urssaf ne connaît pas (« La CARMF en 2026 », p. 24 et 27) :
 * - les deux premières années (`debutActivite`) : la complémentaire n'est pas due et l'ASV
 *   d'ajustement porte sur la base forfaitaire, transmis au modèle par `situationMedecin` ;
 * - dispensé : pas d'affiliation à la CARMF du tout (retraite de base, complémentaire, ASV,
 *   invalidité-décès), sur demande, pour un remplaçant dont le revenu net d'activité
 *   indépendante est inférieur à 15 000 €. Hors de ces conditions, la dispense est ignorée ;
 * La dispense partielle de la complémentaire, qui dépend du revenu imposable, est appliquée
 * par `simulerRegime`, après le calcul de l'impôt.
 */
function ajusterCarmf(
  c: CotisationsUrssaf,
  formData: SimulateurFormData,
  regimeFiscal: 'reel' | 'micro-bnc',
  recettesAnnuelles: number,
  chargesAnnuelles: number,
): CotisationsUrssaf {
  const statut = normalizeCarmfStatus(formData.situationCarmf);
  if (statut === 'dispense' && dispenseCarmfPossible(formData, regimeFiscal, recettesAnnuelles, chargesAnnuelles, c.total)) {
    const retire = c.detail.retraite;
    return { ...c, total: c.total - retire, detail: { ...c.detail, retraite: 0, retraiteComplementaire: 0, retraiteRid: 0, retraiteBase: 0, asv: 0 } };
  }
  return c;
}

/**
 * Revenus du médecin pour le barème des dispenses de la complémentaire : son bénéfice libéral
 * imposable, ses salaires après abattement et les revenus fonciers saisis (la CARMF compte les
 * « revenus imposables de toute nature », pas ceux du conjoint). Par prudence, les bénéfices
 * exonérés d'impôt (zone, permanence des soins) y sont ajoutés : le revenu fiscal de référence les
 * réintègre, et une dispense annoncée à tort coûterait plus cher qu'une dispense sous-estimée.
 * Estimés sur l'année simulée, sans dispense ; la CARMF regarde l'année précédente. Le même calcul
 * sert au moteur et à la suggestion de la conclusion.
 */
export function revenusImposablesDuMedecin(
  r: {
    impotDetails?: { revenuImposableLiberal?: number; revenuImposableSalarie?: number } | null;
    optimisationsAppliquees?: { revenuFoncier?: number | string; exonerationZone?: number | string } | null;
  },
  liberalExonere = 0,
): number {
  const nombre = (v: number | string | undefined) => Number(v ?? 0) || 0;
  return Math.max(0,
    (r.impotDetails?.revenuImposableLiberal ?? 0)
    + (r.impotDetails?.revenuImposableSalarie ?? 0)
    + nombre(r.optimisationsAppliquees?.revenuFoncier)
    + nombre(r.optimisationsAppliquees?.exonerationZone)
    + Math.max(0, liberalExonere));
}

/** Conditions de la dispense d'affiliation CARMF (revenu net estimé avant ou après cotisations CARMF). */
export function dispenseCarmfPossible(
  formData: Pick<SimulateurFormData, 'typeExercice'>,
  regimeFiscal: 'reel' | 'micro-bnc',
  recettesAnnuelles: number,
  chargesAnnuelles: number,
  cotisationsTotales: number,
): boolean {
  if (formData.typeExercice === 'installe') return false;
  const revenuNet = regimeFiscal === 'micro-bnc'
    ? recettesAnnuelles * 0.66
    : recettesAnnuelles - chargesAnnuelles - cotisationsTotales;
  return revenuNet < SEUIL_DISPENSE_CARMF;
}

/**
 * Un régime fiscal, de bout en bout : cotisations (RSPM local ou modèle Urssaf), puis
 * impôt et Super-Net par le moteur local, le même pour les deux régimes sociaux.
 */
export async function simulerRegime(
  formData: SimulateurFormData,
  regimeFiscal: 'reel' | 'micro-bnc',
  useRspm: boolean,
  /** Faux : pas de repli sur la fonction Supabase (calculs annexes, qui doivent rester cohérents). */
  secours = true,
): Promise<SimulationResult | null> {
  const recettesAnnuelles = annualiser(formData, formData.recettesBrutes);
  const chargesAnnuelles = annualiser(formData, formData.chargesHorsCotisations);
  const liberalExonere = annualiser(formData, formData.revenusExoneresPdsa);
  const revenusSalariesAnnuels = annualiser(formData, formData.revenusSalaries);
  const revenusConjointAnnuels = annualiser(formData, formData.revenusConjoint);

  // Madelin n'est pas déductible en micro-BNC (CGI art. 154 bis) ; le PER l'est (163 quatervicies).
  const cotisationsVolontaires =
    regimeFiscal === 'micro-bnc' && formData.typeCotisationsVolontaires === 'madelin'
      ? 0
      : (formData.cotisationsVolontaires || 0);

  let cotisationsPamcRegime: CotisationsUrssaf | null = null;
  if (!useRspm) {
    const pamc = await cotisationsPamc(formData, regimeFiscal, recettesAnnuelles, chargesAnnuelles, liberalExonere, secours);
    cotisationsPamcRegime = pamc?.cotisations ?? null;
    if (!cotisationsPamcRegime) {
      throw new Error('Le service de calcul URSSAF est temporairement indisponible. Réessaie dans quelques minutes.');
    }
  }

  const partsFiscales = calculateFiscalParts(formData.situationFamiliale, formData.enfants);

  const impotAvec = (cotisations: CotisationsUrssaf | null) => calculateRspmBreakdown({
    // Portion IMPOSABLE des recettes : la part PDSA exonérée (art. 151 ter) est passée à part.
    yearlyLiberalTotal: Math.max(0, recettesAnnuelles - liberalExonere),
    yearlyLiberalExonere: liberalExonere,
    yearlySalariedTotal: revenusSalariesAnnuels,
    yearlyConjointTotal: revenusConjointAnnuels,
    typeRevenuConjoint: formData.typeRevenuConjoint || 'salarie',
    profile: {
      regime_fiscal: regimeFiscal,
      situation_familiale: formData.situationFamiliale,
      taux_rid_rspm: formData.tauxRid || '25%',
      parts_fiscales: partsFiscales,
      charges_reelles_percent: 30,
      type_exercice: formData.typeExercice === 'remplacant' ? 'remplacant_exclusif' : 'installe',
    },
    // Au réel, les charges saisies sont déduites (0 saisi = 0 charge, pas le repli de 30 %).
    // En micro-BNC, l'abattement de 34 % les remplace pour l'impôt ; elles restent payées.
    chargesLiberalesReelles: regimeFiscal === 'reel' ? chargesAnnuelles : undefined,
    chargesDecaissees: chargesAnnuelles,
    secteurConventionnel: formData.secteurConventionnel,
    forfait2pct: formData.forfait2pct || false,
    cotisationsVolontaires,
    typeCotisationsVolontaires: formData.typeCotisationsVolontaires || 'per',
    zoneExoneree: formData.zoneExoneree || 'aucune',
    anneeInstallationZone: formData.anneeInstallationZone,
    anneeFiscale: formData.annee || 2026,
    regimeFoncier: formData.regimeFoncier || 'aucun',
    revenusFonciersBruts: formData.revenusFonciersBruts || 0,
    revenuFoncierNet: formData.revenuFoncierNet || 0,
    creditFormationDirigeant: formData.creditFormationDirigeant || false,
    heuresFormation: formData.heuresFormation || 0,
    creditImpotAutre: formData.creditImpotAutre || 0,
    chequesVacances: formData.chequesVacances || 0,
    tauxRid: formData.tauxRid || '25%',
    situationCarmf: normalizeCarmfStatus(formData.situationCarmf),
    ratioNonConventionne: formData.ratioNonConventionne || 0,
    fraisEmploiDomicile: formData.fraisEmploiDomicile || 0,
    fraisGardeEnfants: formData.fraisGardeEnfants || 0,
    nombreEnfantsGarde: formData.nombreEnfantsGarde || 0,
    lieuExercice: formData.lieuExercice,
    cotisationsSocialesOverride: cotisations?.total,
    cotisationsNonDeductibles: cotisations?.csgCrdsNonDeductible,
  });
  let breakdown = impotAvec(cotisationsPamcRegime);

  // Dispense partielle de la complémentaire CARMF, sur demande (§ 9.fx) : le taux du barème se
  // lit sur les revenus imposables calculés sans elle (ceux que la conclusion lit pour la
  // suggérer), puis l'impôt est recalculé avec la complémentaire réduite.
  const complementaire = cotisationsPamcRegime?.detail.retraiteComplementaire ?? 0;
  if (cotisationsPamcRegime && breakdown && formData.dispenseComplementaire && complementaire > 0) {
    const retire = Math.round(complementaire * tauxDispenseComplementaire(revenusImposablesDuMedecin(breakdown, liberalExonere)));
    if (retire > 0) {
      const d = cotisationsPamcRegime.detail;
      cotisationsPamcRegime = {
        ...cotisationsPamcRegime,
        total: cotisationsPamcRegime.total - retire,
        detail: { ...d, retraite: d.retraite - retire, retraiteComplementaire: d.retraiteComplementaire - retire },
      };
      breakdown = impotAvec(cotisationsPamcRegime);
    }
  }

  if (!breakdown) return null;

  const domInfo = getDomTomInfo(formData.lieuExercice);
  const cotisationsTotales = cotisationsPamcRegime ? cotisationsPamcRegime.total : breakdown.cotisationsTotales;

  return {
    netAvantImpot: recettesAnnuelles - cotisationsTotales,
    superNet: breakdown.superNet,
    impot: breakdown.impot,
    cotisationsTotales,
    revenuImposableTotal: breakdown.revenuImposableTotal,
    impotDetails: {
      ...breakdown.impotDetails,
      revenuImposableLiberal: breakdown.impotDetails?.revenuImposableLiberal || 0,
      revenuImposableSalarie: breakdown.impotDetails?.revenuImposableSalarie || 0,
      revenuImposableConjoint: breakdown.impotDetails?.revenuImposableConjoint || 0,
      revenusSalariesBrut: revenusSalariesAnnuels,
      revenusConjointBrut: revenusConjointAnnuels,
      modeFraisSalaries: 'abattement_10',
      deductionAppliquee: breakdown.impotDetails?.deductionSalarie || 0,
      parts: partsFiscales,
      regimeFiscal,
    },
    superNetFiscal: breakdown.superNet + chargesAnnuelles,
    // Charges payées, dans les deux régimes : déduites de l'impôt au réel seulement.
    chargesReelles: chargesAnnuelles,
    optimisationsAppliquees: breakdown.optimisationsAppliquees as SimulationResult['optimisationsAppliquees'],
    cotisationsDetail: cotisationsPamcRegime ? cotisationsPamcRegime.detail : breakdown.cotisationsDetail,
    missingVariables: {},
    isRSPM: useRspm,
    domTomInfo: domInfo ? { territoire: domInfo.nom, tauxAbattement: domInfo.tauxAbattement, plafond: domInfo.plafond } : null,
  };
}

/**
 * Point de bascule : les charges annuelles pour lesquelles Micro-BNC et réel laissent le même
 * Super-Net, les autres données restant celles de la simulation.
 *
 * En Micro-BNC, ni l'impôt ni les cotisations ne dépendent des charges : son Super-Net baisse
 * d'un euro par euro de charge. Au réel, il baisse moins (charges déduites de l'impôt et, hors
 * RSPM, des cotisations). L'écart f(C) = réel − micro croît donc avec les charges ; sa racine
 * se cherche par fausse position (méthode d'Illinois), chaque point au réel étant recalculé de
 * bout en bout (cotisations Urssaf comprises), sans repli sur la fonction Supabase.
 *
 * Renvoie le montant arrondi à 100 €, `null` si le réel l'emporte même sans aucune charge, ou
 * `undefined` si le calcul n'aboutit pas (API indisponible, cas hors bornes).
 */
export async function calculerPointDeBascule(
  formData: SimulateurFormData,
  useRspm: boolean,
  reel: SimulationResult,
  micro: SimulationResult,
): Promise<number | null | undefined> {
  const recettes = annualiser(formData, formData.recettesBrutes);
  const chargesSaisies = annualiser(formData, formData.chargesHorsCotisations);
  const parPeriode = (c: number) => (formData.periode === 'mensuel' ? c / 12 : c);
  const microA = (c: number) => micro.superNet + chargesSaisies - c;
  const f = async (c: number): Promise<number> => {
    const r = await simulerRegime({ ...formData, chargesHorsCotisations: parPeriode(c) }, 'reel', useRspm, false);
    if (!r) throw new Error('bascule : calcul au réel impossible');
    return r.superNet - microA(c);
  };

  try {
    const f0 = reel.superNet - micro.superNet;
    // Régimes identiques (impôt nul des deux côtés au RSPM, par exemple) : pas de bascule à dire.
    if (Math.abs(f0) < 1) return undefined;
    let a: number, fa: number, b: number, fb: number;
    if (f0 > 0) {
      // Réel devant : la bascule est en dessous des charges saisies.
      const fZero = chargesSaisies === 0 ? f0 : await f(0);
      if (fZero >= 0) return null;
      a = 0; fa = fZero; b = chargesSaisies; fb = f0;
    } else {
      // Micro devant : la bascule est au-dessus. On élargit jusqu'à changer de signe.
      a = chargesSaisies; fa = f0; b = chargesSaisies; fb = f0;
      let pas = Math.max(5000, recettes * 0.1);
      while (fb < 0) {
        a = b; fa = fb;
        b = Math.min(recettes, b + pas);
        fb = await f(b);
        pas *= 2;
        if (b >= recettes && fb < 0) return undefined;
      }
    }
    // Fausse position (Illinois) : 4 évaluations au plus, précision de l'ordre de 50 €.
    let cote = 0;
    for (let i = 0; i < 4 && b - a > 100; i++) {
      const c = b - fb * (b - a) / (fb - fa);
      const fc = await f(c);
      if (Math.abs(fc) < 25) return Math.round(c / 100) * 100;
      if (fc > 0) { b = c; fb = fc; if (cote === 1) fa /= 2; cote = 1; }
      else { a = c; fa = fc; if (cote === -1) fb /= 2; cote = -1; }
    }
    return Math.round((b - fb * (b - a) / (fb - fa)) / 100) * 100;
  } catch (err) {
    console.warn('[Simulateur] point de bascule non calculé', err);
    return undefined;
  }
}

/**
 * Cotisations provisionnelles d'une 1re année d'activité en PAMC : l'Urssaf et la CARMF les
 * appellent sur une base forfaitaire de 19 % du PASS (9 131 € en 2026), puis les régularisent sur
 * le revenu réel l'année suivante (CARMF, « Vos cotisations en début d'activité » : 3 437 € en
 * secteur 1, 7 710 € en secteur 2, en 2026 ; service-public.fr, F39739). Calculées par le modèle
 * de l'Urssaf, entreprise créée dans l'année (pas de CURPS), complémentaire non due. `null` si le
 * calcul n'aboutit pas.
 */
export async function calculerProvisionnelPremiereAnnee(
  formData: SimulateurFormData,
): Promise<{ urssaf: number; carmf: number } | null> {
  try {
    const c = await calculerCotisationsUrssaf({
      annee: formData.annee || 2026,
      recettes: annualiser(formData, formData.recettesBrutes),
      charges: 0,
      regime: 'reel',
      secteur: formData.secteurConventionnel || 'secteur_1',
      remplacant: formData.typeExercice === 'remplacant',
      ratioNonConventionne: formData.ratioNonConventionne || 0,
      departementOutreMer: DEPARTEMENTS_OUTRE_MER[formData.lieuExercice || 'metropole'],
      debutActivite: 'premiere',
      provisionnel: true,
    });
    return { urssaf: Math.round(c.total - c.detail.retraite), carmf: Math.round(c.detail.retraite) };
  } catch (err) {
    console.warn('[Simulateur] cotisations provisionnelles non calculées', err);
    return null;
  }
}

/**
 * Alternative PAMC d'une simulation au RSPM (§ 9.gh) : le meilleur Super-Net du médecin en PAMC
 * (Micro-BNC ou réel), même saisie, pour répondre à « RSPM ou PAMC ? ». Calculée après
 * l'affichage, sans repli sur la fonction Supabase ; `null` si le calcul n'aboutit pas.
 */
export async function calculerAlternativePamc(
  formData: SimulateurFormData,
): Promise<{ superNet: number; recommande: 'micro-bnc' | 'reel' } | null> {
  try {
    const fd = { ...formData, regimeSocial: 'pamc' as const };
    const reel = await simulerRegime(fd, 'reel', false, false);
    const micro = await simulerRegime(fd, 'micro-bnc', false, false);
    if (!reel) return null;
    const foyer = {
      revenusSalariesAnnuels: annualiser(formData, formData.revenusSalaries),
      revenusConjointAnnuels: annualiser(formData, formData.revenusConjoint),
      situationFamiliale: formData.situationFamiliale,
    };
    const sReel = superNetDuMedecin(reel, foyer);
    const sMicro = micro ? superNetDuMedecin(micro, foyer) : -Infinity;
    return sMicro > sReel ? { superNet: sMicro, recommande: 'micro-bnc' } : { superNet: sReel, recommande: 'reel' };
  } catch (err) {
    console.warn('[Simulateur] alternative PAMC non calculée', err);
    return null;
  }
}

/** Recettes ajoutées pour la marge (« 1 000 € de plus dans l'année »). */
export const MARGE_RECETTES = 1000;

/**
 * Ce qu'il resterait de `MARGE_RECETTES` € de recettes en plus dans l'année, charges
 * inchangées, dans le régime fiscal retenu et le même régime social (§ 9.ft) : la différence
 * de Super-Net, cotisations Urssaf comprises (un appel au modèle en PAMC, aucun au RSPM).
 * `undefined` si le calcul n'aboutit pas ou sort de [0, 1 000 €] (un seuil franchi, comme la
 * dispense CARMF : une phrase moyenne n'aurait plus de sens).
 */
export async function calculerMarge(
  formData: SimulateurFormData,
  useRspm: boolean,
  regime: 'reel' | 'micro-bnc',
  base: SimulationResult,
): Promise<number | undefined> {
  try {
    const plus = formData.periode === 'mensuel' ? MARGE_RECETTES / 12 : MARGE_RECETTES;
    const r = await simulerRegime({ ...formData, recettesBrutes: (formData.recettesBrutes || 0) + plus }, regime, useRspm, false);
    if (!r) return undefined;
    const reste = r.superNet - base.superNet;
    return reste >= 0 && reste <= MARGE_RECETTES ? reste : undefined;
  } catch (err) {
    console.warn('[Simulateur] marge non calculée', err);
    return undefined;
  }
}

export function usePublicodesSimulation() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  /** Point de bascule de la dernière simulation (voir `calculerPointDeBascule`). État à part : le
   *  mettre dans `results` relancerait le défilement et l'événement de SimulateurApp. */
  const [bascule, setBascule] = useState<number | null | 'attente' | undefined>(undefined);
  /** Ce qui resterait de 1 000 € de recettes en plus (voir `calculerMarge`), même logique d'état. */
  const [marge, setMarge] = useState<number | 'attente' | undefined>(undefined);
  /** Au RSPM, le meilleur Super-Net en PAMC (`calculerAlternativePamc`), même logique d'état. */
  const [alternativePamc, setAlternativePamc] = useState<{ superNet: number; recommande: 'micro-bnc' | 'reel' } | null | 'attente' | undefined>(undefined);
  const simulationEnCours = useRef(0);
  const [results, setResults] = useState<RegimeComparison>({
    reel: null,
    microBnc: null,
    recommande: null,
    economie: 0,
    difference: 0,
  });

  const simulate = async (formData: SimulateurFormData) => {
    setLoading(true);
    setError(null);
    setBascule(undefined);
    setMarge(undefined);
    setAlternativePamc(undefined);
    const numero = ++simulationEnCours.current;

    try {
      const recettesAnnuelles = annualiser(formData, formData.recettesBrutes);
      const useRspm = shouldUseRspm(formData, recettesAnnuelles);

      // 1re année en PAMC : les cotisations provisionnelles, en même temps (un appel de plus).
      const premiereAnneePamc = debutActiviteDe(formData) === 'premiere' && !useRspm;
      const [resultReel, resultMicroBnc, provisionnel] = await Promise.all([
        simulerRegime(formData, 'reel', useRspm),
        simulerRegime(formData, 'micro-bnc', useRspm),
        premiereAnneePamc ? calculerProvisionnelPremiereAnnee(formData) : Promise.resolve(undefined),
      ]);

      if (!resultReel) {
        throw new Error('Échec du calcul pour le régime réel');
      }

      // Le régime le plus favorable, sur le Super-Net (ce qui reste après charges,
      // cotisations et impôt, dans les deux régimes). Au-delà du plafond, le Micro-BNC
      // n'est pas fermé d'office pour l'année simulée (CGI art. 102 ter : l'éligibilité se
      // juge sur les recettes des deux années précédentes) : la comparaison est donc faite
      // et affichée, avec l'avertissement de la conclusion. Avant novembre 2026, l'écart
      // était forcé à 0 au-delà du plafond, et la conclusion affichait « Écart négligeable ».
      let difference = 0;
      let recommande: 'reel' | 'micro-bnc' = 'reel';
      if (resultMicroBnc) {
        difference = resultMicroBnc.superNet - resultReel.superNet;
        recommande = difference > 0 ? 'micro-bnc' : 'reel';
      }

      setResults({
        reel: resultReel,
        microBnc: resultMicroBnc,
        recommande,
        economie: Math.abs(difference),
        difference,
        plafondMicro: getMicroBncCeiling(formData.annee || 2026),
        recettesAnnuelles,
        revenusSalariesAnnuels: annualiser(formData, formData.revenusSalaries),
        revenusConjointAnnuels: annualiser(formData, formData.revenusConjoint),
        liberalExonereAnnuel: annualiser(formData, formData.revenusExoneresPdsa),
        domTomInfo: resultReel.domTomInfo || null,
        lieuExercice: formData.lieuExercice,
        isRSPMUsed: useRspm,
        provisionnelPremiereAnnee: provisionnel,
      });

      // Après l'affichage, l'un après l'autre (le modèle Urssaf limite le débit) : la marge sur
      // 1 000 € de plus, puis le point de bascule, seulement si le Micro-BNC reste ouvert
      // (recettes sous le plafond) : au-delà, la question ne se pose plus d'une année sur l'autre.
      const avecBascule = Boolean(resultMicroBnc) && recettesAnnuelles <= getMicroBncCeiling(formData.annee || 2026);
      const retenu = recommande === 'micro-bnc' && resultMicroBnc ? resultMicroBnc : resultReel;
      setMarge('attente');
      if (avecBascule) setBascule('attente');
      if (useRspm) setAlternativePamc('attente');
      void (async () => {
        const m = await calculerMarge(formData, useRspm, recommande, retenu);
        if (simulationEnCours.current !== numero) return;
        setMarge(m);
        if (avecBascule && resultMicroBnc) {
          const c = await calculerPointDeBascule(formData, useRspm, resultReel, resultMicroBnc);
          if (simulationEnCours.current !== numero) return;
          setBascule(c);
        }
        // Au RSPM : la même saisie en PAMC, en dernier (deux appels au modèle de l'Urssaf).
        if (useRspm) {
          const a = await calculerAlternativePamc(formData);
          if (simulationEnCours.current === numero) setAlternativePamc(a);
        }
      })();
      // Pas de sauvegarde d'historique : le site public est anonyme. Le funnel analytics
      // anonyme est géré par SimulateurApp.tsx (insertPublicEvent).
    } catch (err) {
      console.error('Erreur simulation:', err);

      let errorMessage = 'Impossible de calculer les estimations pour le moment.';
      if (err instanceof Error) {
        if (err.message.includes('Failed to fetch') || err.message.includes('NetworkError')) {
          errorMessage = 'Problème de connexion. Vérifie ta connexion internet.';
        } else if (err.message.includes('URSSAF') || err.message.includes('Edge Function')) {
          errorMessage = 'Le service de calcul est temporairement indisponible. Réessaie dans quelques instants.';
        }
      }
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const reset = () => {
    simulationEnCours.current++;
    setBascule(undefined);
    setMarge(undefined);
    setAlternativePamc(undefined);
    setResults({
      reel: null,
      microBnc: null,
      recommande: null,
      economie: 0,
      difference: 0,
    });
    setError(null);
  };

  return { loading, error, results, bascule, marge, alternativePamc, simulate, reset };
}
