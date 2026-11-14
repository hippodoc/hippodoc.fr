/**
 * Aide à l'estimation des charges professionnelles (simulateur, MIGRATION.md § 9.fz).
 *
 * Deux barèmes officiels, le reste est saisi par le médecin (aucun montant « type » : une
 * assurance ou un comptable coûtent du simple au triple selon les cas).
 *
 * - Barème kilométrique des voitures : CGI, annexe IV, art. 6 B, dans sa rédaction issue de
 *   l'arrêté du 27 mars 2023 (BOFiP BOI-BAREME-000001), ouvert aux titulaires de BNC
 *   (BOI-BNC-BASE-40-60-40-20, § 1). Non revalorisé depuis : c'est le dernier publié, celui des
 *   revenus 2025 ; celui des revenus 2026 paraîtra en 2027. Voiture 100 % électrique : + 20 %.
 *   Il couvre carburant, entretien, assurance et usure ; péages et parkings s'ajoutent.
 * - Frais supplémentaires de repas : BOI-BNC-BASE-40-60-60, I-B (§ 40 et suivants). Déductible : le prix
 *   du repas, dans la limite de la limite d'exonération des indemnités de repas, moins la valeur
 *   du repas pris au domicile. 2025 : 21,10 € et 5,45 € ; 2026 : 21,40 € et 5,50 €
 *   (ACTU-2025-00025, ACTU-2026-00008). Seulement quand la distance empêche de rentrer manger.
 */

export type PuissanceFiscale = '3' | '4' | '5' | '6' | '7';

/** Libellés des puissances, dans l'ordre du barème. */
export const PUISSANCES: { valeur: PuissanceFiscale; libelle: string }[] = [
  { valeur: '3', libelle: '3 CV et moins' },
  { valeur: '4', libelle: '4 CV' },
  { valeur: '5', libelle: '5 CV' },
  { valeur: '6', libelle: '6 CV' },
  { valeur: '7', libelle: '7 CV et plus' },
];

/** Barème des automobiles : [jusqu'à 5 000 km, de 5 001 à 20 000 km (a × d + b), au-delà]. */
const BAREME_KILOMETRIQUE: Record<PuissanceFiscale, { t1: number; t2: number; b2: number; t3: number }> = {
  '3': { t1: 0.529, t2: 0.316, b2: 1065, t3: 0.37 },
  '4': { t1: 0.606, t2: 0.34, b2: 1330, t3: 0.407 },
  '5': { t1: 0.636, t2: 0.357, b2: 1395, t3: 0.427 },
  '6': { t1: 0.665, t2: 0.374, b2: 1457, t3: 0.447 },
  '7': { t1: 0.697, t2: 0.394, b2: 1515, t3: 0.47 },
};

/** Frais de voiture au barème kilométrique (€/an, arrondis à l'euro). */
export function fraisKilometriques(km: number, puissance: PuissanceFiscale, electrique: boolean): number {
  if (!(km > 0)) return 0;
  const b = BAREME_KILOMETRIQUE[puissance] ?? BAREME_KILOMETRIQUE['5'];
  const montant = km <= 5000 ? km * b.t1 : km <= 20000 ? km * b.t2 + b.b2 : km * b.t3;
  return Math.round(montant * (electrique ? 1.2 : 1));
}

/** Limites des frais de repas de l'année : valeur du repas au domicile, plafond du repas. */
export function limitesRepas(annee: number): { foyer: number; plafond: number } {
  return annee >= 2026 ? { foyer: 5.5, plafond: 21.4 } : { foyer: 5.45, plafond: 21.1 };
}

/** Frais de repas déductibles : par repas (au centime) et pour l'année (à l'euro). */
export function fraisRepas(nombre: number, prixMoyen: number, annee: number): { parRepas: number; total: number } {
  const { foyer, plafond } = limitesRepas(annee);
  if (!(nombre > 0) || !(prixMoyen > 0)) return { parRepas: 0, total: 0 };
  const parRepas = Math.round(Math.max(0, Math.min(prixMoyen, plafond) - foyer) * 100) / 100;
  return { parRepas, total: Math.round(nombre * parRepas) };
}
