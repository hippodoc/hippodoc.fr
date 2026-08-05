import { useState } from 'react';
import { invokeCalculateUrssaf } from '@/lib/supabase-public';
import type { SimulateurFormData } from '@/components/simulateur/simulateurSchema';
import type { SimulationResult, DomTomResultInfo, LieuExercice } from '@/lib/simulation-types';
import { calculateRspmBreakdown } from '@/lib/simulateur/useRspmCalculation';
import { buildRspmChargesArgs } from '@/lib/rspmHelpers';
import { calculateFiscalParts } from '@/lib/fiscalParts';
import { getDomTomInfo } from '@/lib/dom-tom';
import { getMicroBncCeiling } from '@/lib/baremes-ir';
import { normalizeCarmfStatus } from '@/lib/carmfStatus';

// Seuil RSPM 2025-2026 (inchangé) : en dessous de 38 000€, cotisations simplifiées (13,5% puis 21,2%)
const SEUIL_RSPM = 38000;

export interface RegimeComparison {
  reel: SimulationResult | null;
  microBnc: SimulationResult | null;
  recommande: 'reel' | 'micro-bnc' | null;
  economie: number;
  difference: number;
  recettesAnnuelles?: number;
  revenusSalariesAnnuels?: number;
  revenusConjointAnnuels?: number;  // ✅ Revenu du conjoint (pour affichage)
  liberalExonereAnnuel?: number;  // ✅ Revenus PDSA exonérés IR
  domTomInfo?: DomTomResultInfo | null;
  lieuExercice?: LieuExercice;
  isRSPMUsed?: boolean;  // ✅ Indique si RSPM a été utilisé pour les calculs
}

/**
 * Détermine si on doit utiliser le calcul RSPM local
 */
const shouldUseRspm = (formData: SimulateurFormData, recettesAnnuelles: number): boolean => {
  if (formData.regimeSocial === 'rspm') return true;
  if (formData.regimeSocial === 'pamc') return false;
  // Mode 'auto': basé sur le seuil de 38k
  return recettesAnnuelles < SEUIL_RSPM;
};

/**
 * Calcul local RSPM - réutilise exactement calculateRspmBreakdown
 * Taux progressifs : 13,5% (0-19k) + 21,2% (>19k) + RID CARMF
 */
const simulateRspmLocally = (
  formData: SimulateurFormData,
  regimeFiscal: 'reel' | 'micro-bnc'
): SimulationResult | null => {
  // Phase 3 Obs D — Madelin n'est PAS déductible en micro-BNC (CGI Art. 154 bis).
  // En réel, les deux (PER & Madelin) restent déductibles → cap PER géré dans useRspmCalculation.
  const cotisationsVolontairesEffectives =
    regimeFiscal === 'micro-bnc' && formData.typeCotisationsVolontaires === 'madelin'
      ? 0
      : (formData.cotisationsVolontaires || 0);
  // Annualiser les montants
  const recettesAnnuelles = formData.periode === 'mensuel'
    ? formData.recettesBrutes * 12
    : formData.recettesBrutes;
  const chargesAnnuelles = formData.periode === 'mensuel'
    ? (formData.chargesHorsCotisations || 0) * 12
    : (formData.chargesHorsCotisations || 0);
  const liberalExonere = formData.periode === 'mensuel'
    ? (formData.revenusExoneresPdsa || 0) * 12
    : (formData.revenusExoneresPdsa || 0);
  const revenusSalariesAnnuels = formData.periode === 'mensuel'
    ? (formData.revenusSalaries || 0) * 12
    : (formData.revenusSalaries || 0);
  // ✅ Annualiser les revenus du conjoint (si marié/pacsé)
  const revenusConjointAnnuels = formData.periode === 'mensuel'
    ? (formData.revenusConjoint || 0) * 12
    : (formData.revenusConjoint || 0);

  // Calculer parts fiscales selon situation familiale (logique centralisée)
  const partsFiscales = calculateFiscalParts(formData.situationFamiliale, formData.enfants);

  // Construire profil minimal pour calculateRspmBreakdown
  const profileMinimal = {
    regime_fiscal: regimeFiscal,
    situation_familiale: formData.situationFamiliale,
    taux_rid_rspm: formData.tauxRid || '25%',  // Phase 3: use form toggle
    parts_fiscales: partsFiscales,
    charges_reelles_percent: 30,  // Fallback si pas de charges réelles
    nombre_enfants_charge: formData.enfants,  // Pour plafond emploi domicile
  };

  // 🎯 Convention A — En micro-BNC, le simulateur public n'a PAS de champ dédié pour
  // les rétrocessions versées : `chargesAnnuelles` représente uniquement loyer + matériel
  // + RCP (cf. tooltip formulaire L289 "abattement 34 % remplace ces charges"). On les
  // ignore donc en micro-BNC pour ne pas pré-déduire à tort avant l'abattement.
  // En réel : on les transmet normalement comme charges déductibles.
  const simArgs = buildRspmChargesArgs(regimeFiscal, chargesAnnuelles, 0);

  // 🎯 Phase 1 Bug #2 — En réel, le simulateur a TOUJOURS la valeur (champ obligatoire).
  // On force l'override pour que `0 €` saisi explicitement signifie "0 charge réelle"
  // et non "info absente → fallback 30 %". buildRspmChargesArgs renvoie `undefined`
  // quand total = 0 (préservé pour les autres callers historiques).
  if (regimeFiscal === 'reel') {
    simArgs.chargesLiberalesReelles = chargesAnnuelles;
  }

  // 🎯 Phase 1 Bug #1 — Convention `calculateRspmBreakdown` (useRspmCalculation L440) :
  // `yearlyLiberalTotal` doit être la portion IMPOSABLE seule (PDSA exonéré exclu).
  // Le formulaire demande à l'utilisateur le total honoraires (PDSA inclus) puis la
  // part PDSA — on retranche donc ici pour respecter la convention.
  const yearlyLiberalImposable = Math.max(0, recettesAnnuelles - liberalExonere);

  // Appeler le calcul RSPM existant (taux progressifs 13,5%/21,2%)
  const rspmResult = calculateRspmBreakdown({
    yearlyLiberalTotal: yearlyLiberalImposable,
    yearlyLiberalExonere: liberalExonere,
    yearlySalariedTotal: revenusSalariesAnnuels,
    yearlyConjointTotal: revenusConjointAnnuels,
    typeRevenuConjoint: formData.typeRevenuConjoint || 'salarie',
    profile: profileMinimal as any,
    chargesLiberalesReelles: simArgs.chargesLiberalesReelles,
    retrocessionsVerseesMicroBnc: simArgs.retrocessionsVerseesMicroBnc,
    // Phase 1
    secteurConventionnel: formData.secteurConventionnel,
    forfait2pct: formData.forfait2pct || false,
    cotisationsVolontaires: cotisationsVolontairesEffectives,
    // Phase 2
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
    // Phase 3
    tauxRid: formData.tauxRid || '25%',
    situationCarmf: normalizeCarmfStatus(formData.situationCarmf), // 🎯 V11 garde-fou
    ratioNonConventionne: formData.ratioNonConventionne || 0,
    // Crédits personnels
    fraisEmploiDomicile: formData.fraisEmploiDomicile || 0,
    fraisGardeEnfants: formData.fraisGardeEnfants || 0,
    nombreEnfantsGarde: formData.nombreEnfantsGarde || 0,
    // DOM-TOM — Abattement IR (CGI art. 197-I-3)
    lieuExercice: formData.lieuExercice,
  });

  if (!rspmResult) return null;

  // Construire domTomInfo pour l'affichage du badge pédagogique
  const domInfo = getDomTomInfo(formData.lieuExercice);
  const domTomInfoResult = domInfo ? {
    territoire: domInfo.nom,
    tauxAbattement: domInfo.tauxAbattement,
    plafond: domInfo.plafond,
  } : null;

  // Adapter au format SimulationResult attendu
  return {
    netAvantImpot: rspmResult.netAvantImpot,
    superNet: rspmResult.superNet,
    impot: rspmResult.impot,
    cotisationsTotales: rspmResult.cotisationsTotales,
    revenuImposableTotal: rspmResult.revenuImposableTotal,
    impotDetails: {
      ...rspmResult.impotDetails,
      revenuImposableLiberal: rspmResult.impotDetails?.revenuImposableLiberal || 0,
      revenuImposableSalarie: rspmResult.impotDetails?.revenuImposableSalarie || 0,
      revenuImposableConjoint: rspmResult.impotDetails?.revenuImposableConjoint || 0,
      revenusSalariesBrut: revenusSalariesAnnuels,
      revenusConjointBrut: revenusConjointAnnuels,
      modeFraisSalaries: 'abattement_10',
      deductionAppliquee: rspmResult.impotDetails?.deductionSalarie || 0,
      parts: partsFiscales,
      regimeFiscal,
    },
    // 🎯 Phase 4C — Bug #12 (Option A) : en Micro-BNC, l'abattement 34 % (CGI Art. 102 ter)
    // remplace forfaitairement les charges réelles. On ne les soustrait PAS du Super-Net
    // fiscal et on ne les ré-additionne pas non plus (rspmResult.superNet ne les a déjà
    // jamais déduites — voir buildRspmChargesArgs). Parité stricte avec urssaf-mapping.ts.
    superNetFiscal: rspmResult.superNet,
    // En Micro-BNC, on n'expose pas les charges réelles côté résultats : elles sont
    // fiscalement absorbées par l'abattement et ne doivent pas être ré-soustraites en aval.
    chargesReelles: regimeFiscal === 'micro-bnc' ? 0 : chargesAnnuelles,
    optimisationsAppliquees: rspmResult.optimisationsAppliquees as any,
    cotisationsDetail: rspmResult.cotisationsDetail,
    missingVariables: {},
    isRSPM: true,
    domTomInfo: domTomInfoResult,
  };
};

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

  const simulateRegime = async (
    formData: SimulateurFormData,
    regimeFiscal: 'reel' | 'micro-bnc',
    useRspm: boolean
  ): Promise<SimulationResult | null> => {
    try {
      // Phase 3 Obs D — Madelin n'est pas déductible en micro-BNC. On nettoie le formData
      // envoyé à l'edge URSSAF pour éviter la déduction côté serveur (parité avec le
      // calcul local RSPM ci-dessus).
      const formDataForRegime: SimulateurFormData =
        regimeFiscal === 'micro-bnc' && formData.typeCotisationsVolontaires === 'madelin'
          ? { ...formData, cotisationsVolontaires: 0 }
          : formData;

      // ===== CALCUL LOCAL RSPM (cotisations simplifiées 13,5%/21,2%) =====
      if (useRspm) {
        
        const rspmResult = simulateRspmLocally(formData, regimeFiscal);
        
        // ✅ Si RSPM échoue, fallback vers PAMC avec warning
        if (!rspmResult) {
          console.warn(`[Simulateur] Calcul RSPM échoué pour ${regimeFiscal}, fallback vers PAMC`);
          // Appel API URSSAF comme fallback
          const liberalExonere = formData.periode === 'mensuel'
            ? (formData.revenusExoneresPdsa || 0) * 12
            : (formData.revenusExoneresPdsa || 0);

          const { data, error } = await invokeCalculateUrssaf({ formData: formDataForRegime, regimeFiscal, liberalExonere });

          if (error || !data) {
            console.error(`Erreur fallback PAMC ${regimeFiscal}:`, error);
            return null;
          }
          // ✅ Marquer explicitement que RSPM n'a PAS été utilisé
          return { ...(data as SimulationResult), isRSPM: false };
        }
        
        
        return rspmResult;
      }

      // ===== APPEL API URSSAF (PAMC - régime classique) =====
      const liberalExonere = formData.periode === 'mensuel'
        ? (formData.revenusExoneresPdsa || 0) * 12
        : (formData.revenusExoneresPdsa || 0);

      const { data, error } = await invokeCalculateUrssaf({
        formData: formDataForRegime,
        regimeFiscal,
        liberalExonere,
      });

      if (error) {
        console.error(`Erreur Edge Function ${regimeFiscal}:`, error);
        throw new Error(error.message || 'Erreur lors du calcul URSSAF');
      }

      if (!data) {
        throw new Error('Aucune donnée retournée par l\'Edge Function');
      }

      // ✅ Détecter le mode fallback (API URSSAF down, pas de cache)
      if ((data as { fallbackMode?: boolean }).fallbackMode) {
        console.warn(`[Simulateur] API URSSAF en fallback pour ${regimeFiscal}`);
        throw new Error('Le service de calcul URSSAF est temporairement indisponible. Réessaie dans quelques minutes.');
      }

      return { ...(data as SimulationResult), isRSPM: false };
    } catch (err) {
      console.error(`Erreur simulation ${regimeFiscal}:`, err);
      return null;
    }
  };

  const simulate = async (formData: SimulateurFormData) => {
    setLoading(true);
    setError(null);
    
    try {
      // Calculer les recettes annuelles pour info contextuelle
      const recettesAnnuelles = formData.periode === 'mensuel' 
        ? formData.recettesBrutes * 12 
        : formData.recettesBrutes;
      
      // ✅ Calculer les revenus salariés annuels
      const revenusSalariesAnnuels = formData.periode === 'mensuel'
        ? (formData.revenusSalaries || 0) * 12
        : (formData.revenusSalaries || 0);
      
      // ✅ Calculer les revenus du conjoint annuels
      const revenusConjointAnnuels = formData.periode === 'mensuel'
        ? (formData.revenusConjoint || 0) * 12
        : (formData.revenusConjoint || 0);
      
      // ✅ Déterminer si on utilise RSPM (calcul local) ou PAMC (API URSSAF)
      const useRspm = shouldUseRspm(formData, recettesAnnuelles);
      
      // Toujours calculer les deux régimes pour comparaison complète
      const resultReel = await simulateRegime(formData, 'reel', useRspm);
      const resultMicroBnc = await simulateRegime(formData, 'micro-bnc', useRspm);
      
      if (!resultReel) {
        throw new Error('Échec du calcul pour le régime réel');
      }
      
      // 🎯 Phase 5 Bug #16 — Plafond Micro-BNC (CGI Art. 102 ter).
      // Au-delà du plafond annuel (83 600 € en 2026), le Micro-BNC est juridiquement
      // inaccessible : la recommandation est forcée au Réel, peu importe le calcul brut.
      const microBncCeiling = getMicroBncCeiling(formData.annee || 2026);
      const depassePlafondMicroBnc = recettesAnnuelles > microBncCeiling;

      let difference = 0;
      let recommande: 'reel' | 'micro-bnc' = 'reel';
      let economie = 0;

      if (resultMicroBnc) {
        difference = resultMicroBnc.superNet - resultReel.superNet;
        if (depassePlafondMicroBnc) {
          // Bug #16 : Micro-BNC interdit au-dessus du seuil → forcer Réel et neutraliser
          // l'économie affichée (la « gain » Micro-BNC n'a juridiquement pas lieu d'être).
          recommande = 'reel';
          economie = 0;
        } else {
          recommande = difference > 0 ? 'micro-bnc' : 'reel';
          economie = Math.abs(difference);
        }
      }
      
      // ✅ Calculer le montant PDSA annualisé
      const liberalExonereAnnuel = formData.periode === 'mensuel'
        ? (formData.revenusExoneresPdsa || 0) * 12
        : (formData.revenusExoneresPdsa || 0);

      setResults({
        reel: resultReel,
        microBnc: resultMicroBnc,
        recommande,
        economie,
        difference,
        recettesAnnuelles,
        revenusSalariesAnnuels,
        revenusConjointAnnuels,  // ✅ Exposer le revenu du conjoint
        liberalExonereAnnuel,  // ✅ Exposer les revenus PDSA
        domTomInfo: resultReel.domTomInfo || null,
        lieuExercice: formData.lieuExercice,
        isRSPMUsed: useRspm,  // ✅ Indique si RSPM a été utilisé
      });
      // Note : pas de sauvegarde d'historique ici — le site public est anonyme-only
      // (pas de session Supabase). Le funnel analytics anonyme est géré côté
      // SimulateurApp.tsx via insertPublicEvent('simulateur_public_events', ...).
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
