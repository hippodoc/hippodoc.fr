/**
 * Paramètres de déclaration fiscale et sociale par année.
 *
 * ⚠️ Ne JAMAIS hardcoder un plafond ou un taux dans le code de calcul.
 * Toujours passer par `getDeclarationParams(year)`.
 *
 * Sources :
 * - Plafond fiscal ANCV chèques-vacances = 1 SMIC mensuel brut au 1er janvier de l'année.
 *   2024 : 1 766 € · 2025 : 1 802 € · 2026 : 1 823 € (confirmés).
 * - Plafond social ANCV = 30 % du SMIC mensuel brut au 1er janvier (limite d'exo
 *   cotisations URSSAF + CARMF, la CSG-CRDS reste due).
 *   2024 : 530 € · 2025 : 541 € · 2026 : 547 € (arrondis à l'euro).
 * - Forfait Groupe III (frais blanchissage/entretien cabinet) : 3 050 € (stable)
 * - Forfait 2 % (frais représentation) : 2 % du CA conventionné avant rétro
 * - Forfait 3 % (frais groupe III alternatif) : 3 % de l'assiette conventionnée
 */

export interface DeclarationParams {
  /** Plafond annuel FISCAL des chèques-vacances ANCV (= 1 SMIC mensuel brut, €).
   *  Au-delà, l'excédent n'est plus déductible du bénéfice (5QC/5RC) ni minoration 5HQ. */
  plafondChequesVacances: number;
  /** Plafond annuel SOCIAL des chèques-vacances ANCV (= 30 % SMIC mensuel brut, €).
   *  Limite d'exo cotisations URSSAF + CARMF. CSG-CRDS reste due sur cette part. */
  plafondSocialChequesVacances: number;
  /** Forfait alternatif au 3 % pour les frais du groupe III (€) */
  forfaitGroupeIII: number;
  /** Taux du forfait 2 % (frais de représentation, secteur 1) */
  tauxForfait2: number;
  /** Taux du forfait 3 % (frais groupe III, secteur 1) */
  tauxForfait3: number;
}

const PARAMS_BY_YEAR: Record<number, DeclarationParams> = {
  2024: {
    plafondChequesVacances: 1766,
    plafondSocialChequesVacances: 530,
    forfaitGroupeIII: 3050,
    tauxForfait2: 0.02,
    tauxForfait3: 0.03,
  },
  2025: {
    plafondChequesVacances: 1802,
    plafondSocialChequesVacances: 541,
    forfaitGroupeIII: 3050,
    tauxForfait2: 0.02,
    tauxForfait3: 0.03,
  },
  2026: {
    plafondChequesVacances: 1823,
    plafondSocialChequesVacances: 547,
    forfaitGroupeIII: 3050,
    tauxForfait2: 0.02,
    tauxForfait3: 0.03,
  },
};

/**
 * Retourne les paramètres de déclaration pour une année donnée.
 * Fallback : année la plus récente connue.
 */
export function getDeclarationParams(year: number): DeclarationParams {
  if (PARAMS_BY_YEAR[year]) return PARAMS_BY_YEAR[year];
  const knownYears = Object.keys(PARAMS_BY_YEAR).map(Number).sort((a, b) => b - a);
  return PARAMS_BY_YEAR[knownYears[0]];
}

/**
 * Cap silencieux d'un montant de chèques-vacances au plafond annuel.
 * Retourne aussi un flag indiquant si un dépassement a eu lieu (pour warning UI).
 */
export function capChequesVacances(montant: number, year: number): {
  capped: number;
  excedent: number;
  depasse: boolean;
} {
  const plafond = getDeclarationParams(year).plafondChequesVacances;
  const safe = Math.max(0, montant);
  const capped = Math.min(safe, plafond);
  const excedent = Math.max(0, safe - plafond);
  return { capped, excedent, depasse: excedent > 0 };
}
