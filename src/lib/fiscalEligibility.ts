/**
 * Helpers d'éligibilité aux déductions fiscales spécifiques médecin.
 *
 * 🎯 Règle d'or :
 *   - Le **Forfait 2 % RSB** (CGI Art. 93-1) et les **Déductions Secteur 1**
 *     (3 % conventionnel + Groupe III) sont réservés aux médecins
 *     **personnellement conventionnés Secteur 1 INSTALLÉS** qui facturent
 *     en leur nom propre auprès de l'Assurance Maladie.
 *   - Un **remplaçant** facture via le titulaire ; il n'est jamais
 *     conventionné en propre et ne peut donc PAS bénéficier de ces
 *     déductions, même si son profil porte par erreur `secteur_1`
 *     ou `forfait_2pct=true` (défauts/saisie).
 *
 * Stratégie pragmatique : on ne désactive les déductions QUE pour les
 * `type_exercice` explicitement remplaçants. Si `type_exercice` est null
 * (cas par défaut historique pour la plupart des installés qui n'ont
 * jamais renseigné le champ), on présume installé pour ne pas casser
 * leur calcul existant.
 */

export type TypeExercice =
  | 'remplacant_exclusif'
  | 'remplacant_etudiant'
  | 'installe'
  | 'mixte'
  | 'collaborateur'
  | 'salarie_exclusif'
  | string
  | null
  | undefined;

/** Statuts considérés comme "remplaçant pur" → pas d'éligibilité S1/2 % en propre. */
const TYPES_REMPLACANT: ReadonlySet<string> = new Set([
  'remplacant_exclusif',
  'remplacant_etudiant',
  'salarie_exclusif',
]);

export interface FiscalEligibilityInput {
  type_exercice?: TypeExercice;
  secteur_conventionnel?: string | null;
  regime_fiscal?: 'micro-bnc' | 'reel' | string | null;
  forfait_2pct?: boolean | null;
}

/**
 * Vrai si le médecin est INSTALLÉ et conventionné Secteur 1 en régime réel.
 * Condition nécessaire (mais pas suffisante) pour appliquer Forfait 2 % et Déductions S1.
 */
export const isInstalledConventionneS1 = (input: FiscalEligibilityInput | null): boolean => {
  if (!input) return false;
  if (input.secteur_conventionnel !== 'secteur_1') return false;
  if (input.regime_fiscal !== 'reel') return false;
  // Si `type_exercice` est explicitement remplaçant → bloqué.
  // Si null/undefined/autre → présumé installé (rétrocompatibilité).
  if (input.type_exercice && TYPES_REMPLACANT.has(input.type_exercice)) return false;
  return true;
};

/** Vrai si le médecin peut appliquer le Forfait 2 % RSB. */
export const canApplyForfait2pct = (input: FiscalEligibilityInput | null): boolean => {
  if (!isInstalledConventionneS1(input)) return false;
  return input?.forfait_2pct === true;
};

/** Vrai si le médecin peut appliquer les Déductions Secteur 1 (3 % + Groupe III). */
export const canApplyDeductionsS1 = (input: FiscalEligibilityInput | null): boolean => {
  return isInstalledConventionneS1(input);
};

/** Vrai si le `type_exercice` est explicitement un remplaçant. */
export const isRemplacant = (typeExercice?: TypeExercice): boolean => {
  return !!typeExercice && TYPES_REMPLACANT.has(typeExercice);
};
