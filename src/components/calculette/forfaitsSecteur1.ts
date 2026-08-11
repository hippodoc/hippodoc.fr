/**
 * Moteur pur — Forfaits déductibles secteur 1 conventionné (médecin libéral).
 *
 * Sources : ANAFAGC, ARAPL Provence, glossaire 2035 interne (réforme 2026).
 *
 * - Forfait 2 % (case DF de la 2035-B) : 2 % d'une assiette LARGE =
 *   AA (CA conventionné) + AF (honoraires hors champ : DE, HN, MSU, expertises,
 *   études, IJ Madelin, dépassements ponctuels, redevances). Forfaitaire au lieu
 *   de certains frais (réception, représentation, prospection, cadeaux, travaux
 *   de recherche, blanchissage, petits déplacements).
 * - Forfait 3 % (case DG) : 3 % d'une assiette ÉTROITE =
 *   AA − (PDSA exonéré + DE Médecin Traitant/ROSP/AN-DPC + HN + MSU + expertises
 *   + études + IJ Madelin). N'inclut PAS AF.
 * - Groupe III (case DH) : forfait fixe 3 050 €.
 *
 * DF + DG + DH sont **cumulables** entre eux. Depuis l'imposition des revenus 2023
 * (suppression de la majoration de l'art. 158, 7 CGI), la condition de non-cumul
 * entre DG et DH est devenue sans objet (BOI-BNC-SECT-40 ; UNASA Guide fiscal
 * 2035-2026 §391 p. 92-93). Le 2 % (DF) reste seulement incompatible avec la
 * déduction des frais réels de même nature (poste 30 « représentation »).
 */

export const GROUPE_III_MONTANT = 3050;
export const TAUX_FORFAIT_2 = 0.02;
export const TAUX_FORFAIT_3 = 0.03;

export interface SousPostesAF {
  DE?: number;
  HN?: number;
  MSU?: number;
  expertises?: number;
  etudes?: number;
  ijMadelinDansAF?: number;
  pdsaExonere?: number;
}

export interface ForfaitsSecteur1Result {
  forfait2pct: number;
  base3pct: number;
  forfait3pct: number;
  groupeIII: number;
}

// La garde renvoie déjà 0 pour une valeur absente : la signature doit donc
// accepter `undefined`, sinon chaque appelant produit une erreur de typage
// (17 au total) qui masque de vrais problèmes dans le bruit.
const safe = (n: number | undefined): number => (Number.isFinite(n) && (n as number) > 0 ? (n as number) : 0);
const round2 = (n: number): number => Math.round(n * 100) / 100;

export function calculerForfaitsSecteur1(
  AA: number,
  AF: number,
  sp: SousPostesAF
): ForfaitsSecteur1Result {
  const a = safe(AA);
  const f = safe(AF);
  // Base 2 % : assiette large (AA + AF). Dépassements/redevances/IJ doctrinalement
  // inclus ; ils sont déjà capturés via AA (dépassements/redevances S1) ou AF (IJ).
  const base2 = a + f;
  // Base 3 % : assiette étroite (AA − exclusions). N'inclut PAS AF (réforme 2026).
  const exclusions3 =
    safe(sp.DE) +
    safe(sp.HN) +
    safe(sp.MSU) +
    safe(sp.expertises) +
    safe(sp.etudes) +
    safe(sp.ijMadelinDansAF) +
    safe(sp.pdsaExonere);
  const base3 = Math.max(0, a - exclusions3);
  return {
    forfait2pct: round2(base2 * TAUX_FORFAIT_2),
    base3pct: round2(base3),
    forfait3pct: round2(base3 * TAUX_FORFAIT_3),
    groupeIII: GROUPE_III_MONTANT,
  };
}

/** Somme des sous-postes contenus dans AF (PDSA exclu car hors AF). */
export function sommeSousPostesDansAF(sp: SousPostesAF): number {
  return (
    safe(sp.DE) +
    safe(sp.HN) +
    safe(sp.MSU) +
    safe(sp.expertises) +
    safe(sp.etudes) +
    safe(sp.ijMadelinDansAF)
  );
}
