/**
 * Helper partagé entre `useAide2035Data` et `useAidePamcData` pour calculer
 * automatiquement les addons RBS (Cadre 8 / DD) à partir du profil médecin.
 *
 * Doctrine (bible) :
 * - CASE-009 (DSDE) : `DD = CE − CN + BK + BV + CS + AW + CU + CI + CO + DG + CJ + DH + DE − DB`
 * - CASE-012 (DSFA) : « En BNC réel, déduction PDSA en ligne CI (cadre 7 2035-B),
 *   réintégrée automatiquement par la formule RBS en DSDE. »
 * - CASE-026/027/028 (DF/DG/DH) : forfaits S1 cumulables depuis revenus 2023
 *   (mémoire `cumul-df-dg-dh-2023`). DH bloqué la 1ère année (RO-008).
 *
 * Source canonique des formules : `forfaitsSecteur1.ts` (utilisée par calculette publique).
 */

import { calculerForfaitsSecteur1, type SousPostesAF } from '@/components/calculette/forfaitsSecteur1';

export interface AutoRbsAddons {
  /** CI — PDSA Art. 151 ter (déduit cadre 7, réintégré RBS). */
  CI: number;
  /** DF — Forfait 2 % S1 (informational, non additionné au RBS car neutre social). */
  DF: number;
  /** DG — Forfait 3 % conventionnel S1. */
  DG: number;
  /** DH — Groupe III S1 (3 050 €, hors 1ère année). */
  DH: number;
  /** Vrai si médecin S1 (active forfaits). */
  isS1: boolean;
  /** Vrai si 1ère année d'installation (bloque DH — RO-008). */
  isFirstYearInstall: boolean;
  /** Total forfaits S1 (DF + DG + DH) à déduire du bénéfice fiscal L46 et à afficher en L43. */
  totalForfaitsS1: number;
}

export interface AutoRbsAddonsInput {
  /** Profil utilisateur (lit `secteur_conventionnel`, `date_debut_activite`, `regime_fiscal`). */
  profile: {
    secteur_conventionnel?: string | null;
    date_debut_activite?: string | null;
    regime_fiscal?: string | null;
  } | null | undefined;
  /** Année fiscale considérée. */
  year: number;
  /** AA — CA conventionné. */
  AA: number;
  /** AF — Gains divers. */
  AF: number;
  /** PDSA exonéré Art. 151 ter (encaissé sur l'année). */
  pdsaExonere: number;
  /** Régime fiscal effectif (override versionné > profil > défaut). Forfaits S1 = réel uniquement. */
  effectiveRegimeFiscal: 'micro-bnc' | 'reel';
  /** Sous-postes de AF (optionnel, pour la base 3 %). Par défaut tout à 0. */
  sousPostesAF?: SousPostesAF;
}

const round2 = (n: number) => Math.round(n * 100) / 100;

/**
 * Détermine si l'année fiscale correspond à la 1ère année d'installation
 * (Groupe III DH bloqué — RO-008).
 */
export function isFirstYearOfInstallation(
  dateDebutActivite: string | null | undefined,
  year: number,
): boolean {
  if (!dateDebutActivite) return false;
  const startYear = new Date(dateDebutActivite).getFullYear();
  return Number.isFinite(startYear) && startYear === year;
}

/**
 * Calcule les addons automatiques pour le Cadre 8 (RBS) et la section L43.
 *
 * - Forfaits S1 (DF/DG/DH) : uniquement si BNC réel + secteur 1.
 * - CI : PDSA exonéré uniquement si BNC réel (en micro-BNC, géré via DSFA/DSFB).
 */
export function computeAutoRbsAddons(input: AutoRbsAddonsInput): AutoRbsAddons {
  const isReel = input.effectiveRegimeFiscal === 'reel';
  const isS1 = isReel && input.profile?.secteur_conventionnel === 'secteur_1';
  const isFirstYearInstall = isFirstYearOfInstallation(
    input.profile?.date_debut_activite ?? null,
    input.year,
  );

  // CI — PDSA exonéré réintégré au RBS uniquement en réel.
  // En micro-BNC, c'est DSFA/DSFB (Phase G) qui prend le relais.
  const CI = isReel ? round2(Math.max(0, input.pdsaExonere)) : 0;

  if (!isS1) {
    return {
      CI,
      DF: 0,
      DG: 0,
      DH: 0,
      isS1: false,
      isFirstYearInstall,
      totalForfaitsS1: 0,
    };
  }

  // Forfaits S1 — formule canonique partagée avec la calculette publique.
  const sp: SousPostesAF = {
    ...(input.sousPostesAF ?? {}),
    pdsaExonere: input.pdsaExonere,
  };
  const f = calculerForfaitsSecteur1(input.AA, input.AF, sp);

  const DF = f.forfait2pct;
  const DG = f.forfait3pct;
  const DH = isFirstYearInstall ? 0 : f.groupeIII;

  return {
    CI,
    DF: round2(DF),
    DG: round2(DG),
    DH: round2(DH),
    isS1: true,
    isFirstYearInstall,
    totalForfaitsS1: round2(DF + DG + DH),
  };
}
