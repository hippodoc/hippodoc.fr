import { useState } from 'react';
import { invokeCalculateUrssaf } from '@/lib/supabase-public';
import type { SimulateurFormData } from '@/components/simulateur/simulateurSchema';
import type { SimulationResult, DomTomResultInfo, LieuExercice } from '@/lib/simulation-types';
import { calculateRspmBreakdown } from '@/lib/simulateur/useRspmCalculation';
import { calculerCotisationsUrssaf, type CotisationsUrssaf, type ParametresUrssaf } from '@/lib/simulateur/urssaf';
import { calculateFiscalParts } from '@/lib/fiscalParts';
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

/** Dispense d'affiliation CARMF : remplaçant, revenu net d'activité indépendante < 15 000 €. */
const SEUIL_DISPENSE_CARMF = 15000;

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
): Promise<{ cotisations: CotisationsUrssaf; source: 'urssaf' | 'secours' } | null> {
  try {
    const cotisations = await calculerCotisationsUrssaf({
      annee: formData.annee || 2026,
      recettes: recettesAnnuelles,
      charges: chargesAnnuelles,
      regime: regimeFiscal,
      secteur: formData.secteurConventionnel || 'secteur_1',
      remplacant: formData.typeExercice === 'remplacant',
      ratioNonConventionne: formData.ratioNonConventionne || 0,
      departementOutreMer: DEPARTEMENTS_OUTRE_MER[formData.lieuExercice || 'metropole'],
    });
    return { cotisations: ajusterCarmf(cotisations, formData, regimeFiscal, recettesAnnuelles, chargesAnnuelles), source: 'urssaf' };
  } catch (err) {
    console.warn('[Simulateur] API Urssaf indisponible, repli sur calculate-urssaf', err);
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
      csgCrds: r.cotisationsDetail?.csgCrds || 0,
      formation: r.cotisationsDetail?.formation || 0,
    },
  } };
}

/**
 * Statut CARMF, que le modèle Urssaf ne connaît pas (« La CARMF en 2026 », p. 24 et 27) :
 * - jeune affilié : la retraite complémentaire des deux premières années n'est pas due
 *   (sauf début d'activité après 40 ans). Les autres cotisations de ces années sont
 *   provisionnelles puis régularisées sur les revenus réels : le montant final est gardé.
 * - dispensé : pas d'affiliation à la CARMF du tout (retraite de base, complémentaire, ASV,
 *   invalidité-décès), sur demande, pour un remplaçant dont le revenu net d'activité
 *   indépendante est inférieur à 15 000 €. Hors de ces conditions, la dispense est ignorée.
 */
function ajusterCarmf(
  c: CotisationsUrssaf,
  formData: SimulateurFormData,
  regimeFiscal: 'reel' | 'micro-bnc',
  recettesAnnuelles: number,
  chargesAnnuelles: number,
): CotisationsUrssaf {
  const statut = normalizeCarmfStatus(formData.situationCarmf);
  if (statut === 'affilie_jeune') {
    const retire = c.detail.retraiteComplementaire;
    return { ...c, total: c.total - retire, detail: { ...c.detail, retraite: c.detail.retraite - retire, retraiteComplementaire: 0 } };
  }
  if (statut === 'dispense' && dispenseCarmfPossible(formData, regimeFiscal, recettesAnnuelles, chargesAnnuelles, c.total)) {
    const retire = c.detail.retraite;
    return { ...c, total: c.total - retire, detail: { ...c.detail, retraite: 0, retraiteComplementaire: 0, retraiteRid: 0 } };
  }
  return c;
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
    const pamc = await cotisationsPamc(formData, regimeFiscal, recettesAnnuelles, chargesAnnuelles, liberalExonere);
    cotisationsPamcRegime = pamc?.cotisations ?? null;
    if (!cotisationsPamcRegime) {
      throw new Error('Le service de calcul URSSAF est temporairement indisponible. Réessaie dans quelques minutes.');
    }
  }

  const partsFiscales = calculateFiscalParts(formData.situationFamiliale, formData.enfants);

  const breakdown = calculateRspmBreakdown({
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
    cotisationsSocialesOverride: cotisationsPamcRegime?.total,
    cotisationsNonDeductibles: cotisationsPamcRegime?.csgCrdsNonDeductible,
  });

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

export function usePublicodesSimulation() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
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

    try {
      const recettesAnnuelles = annualiser(formData, formData.recettesBrutes);
      const useRspm = shouldUseRspm(formData, recettesAnnuelles);

      const [resultReel, resultMicroBnc] = await Promise.all([
        simulerRegime(formData, 'reel', useRspm),
        simulerRegime(formData, 'micro-bnc', useRspm),
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
      });
      // Pas de sauvegarde d'historique : le site public est anonyme. Le funnel analytics
      // anonyme est géré par SimulateurApp.tsx (insertPublicEvent).
    } catch (err) {
      console.error('Erreur simulation:', err);

      let errorMessage = 'Impossible de calculer les estimations pour le moment.';
      if (err instanceof Error) {
        if (err.message.includes('Failed to fetch') || err.message.includes('NetworkError')) {
          errorMessage = 'Problème de connexion. Vérifiez votre connexion internet.';
        } else if (err.message.includes('URSSAF') || err.message.includes('Edge Function')) {
          errorMessage = 'Le service de calcul est temporairement indisponible. Veuillez réessayer dans quelques instants.';
        }
      }
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const reset = () => {
    setResults({
      reel: null,
      microBnc: null,
      recommande: null,
      economie: 0,
      difference: 0,
    });
    setError(null);
  };

  return { loading, error, results, simulate, reset };
}
