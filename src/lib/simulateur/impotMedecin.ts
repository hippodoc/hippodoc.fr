/**
 * Impôt du médecin, part de son activité libérale et acomptes : un seul calcul pour la
 * conclusion, les fiches des régimes et le pli « Comment l'impôt sera prélevé » (audit de
 * novembre 2026, MIGRATION.md § 9.ft : les trois donnaient trois chiffres différents).
 *
 * - Couple dont le conjoint a des revenus : la part du médecin au taux individualisé, celui
 *   que la DGFiP applique par défaut depuis septembre 2025 (`calculateIndividualizedTax`).
 * - Assiette du prélèvement à la source du médecin : son bénéfice libéral imposable
 *   (après abattement de 34 % en micro-BNC, après charges et cotisations déductibles au
 *   réel) et ses salaires avant abattement de 10 % (CGI art. 204 H).
 * - Acomptes : le taux se calcule sur l'impôt AVANT réductions et crédits d'impôt (emploi à
 *   domicile, garde d'enfants…), qui sont remboursés après la déclaration (CGI art. 204 H
 *   et 1665 bis). Les acomptes sont donc plus élevés que l'impôt final quand il y en a.
 */
import { calculateIndividualizedTax, type IndividualizedTaxResult } from '@/lib/individualizedTax';
import type { SimulationResult } from '@/lib/simulation-types';

export interface FoyerDuMedecin {
  revenusSalariesAnnuels?: number;
  revenusConjointAnnuels?: number;
  situationFamiliale?: string;
}

export interface ImpotDuMedecin extends IndividualizedTaxResult {
  /** Part de l'impôt du médecin qui porte sur son activité libérale (coût annuel). */
  impotLiberal: number;
  /** Acomptes annuels de l'activité libérale, sur l'impôt avant crédits et réductions. */
  acomptesLiberaux: number;
  /** Crédits et réductions d'impôt du foyer (remboursés après la déclaration). */
  creditsImpot: number;
}

const sansConjoint = (impot: number): IndividualizedTaxResult => ({
  impotMedecin: impot,
  impotConjoint: 0,
  tauxMedecin: 0,
  tauxConjoint: 0,
  tauxFoyer: 0,
  medecinEstMoinsDisant: false,
});

export function impotDuMedecin(result: SimulationResult, foyer: FoyerDuMedecin): ImpotDuMedecin {
  const d = result.impotDetails;
  const bnc = Math.max(0, d?.revenuImposableLiberal ?? 0);
  const salaires = Math.max(0, foyer.revenusSalariesAnnuels ?? 0);
  const conjoint = Math.max(0, foyer.revenusConjointAnnuels ?? 0);
  const situation = foyer.situationFamiliale ?? 'celibataire';

  const o = result.optimisationsAppliquees;
  const creditsImpot = (o?.creditFormation ?? 0) + (o?.creditImpotAutre ?? 0)
    + (o?.creditEmploiDomicile ?? 0) + (o?.creditGardeEnfants ?? 0);
  // Impôt avant crédits : `impot` = max(0, avant − crédits), `restitutionCredits` = l'excédent.
  const impotAvantCredits = Math.max(0, result.impot + creditsImpot - (d?.restitutionCredits ?? 0));

  const repartir = (impotFoyer: number): IndividualizedTaxResult => conjoint > 0
    ? calculateIndividualizedTax(
        bnc + (d?.revenuImposableSalarie ?? 0),
        d?.revenuImposableConjoint ?? 0,
        bnc + salaires,
        conjoint,
        impotFoyer,
        d?.parts || 2,
        situation,
      )
    : sansConjoint(impotFoyer);

  const parts = repartir(result.impot);
  // Part libérale de l'assiette du médecin : ses salaires sont prélevés par l'employeur.
  const partLiberale = bnc + salaires > 0 ? bnc / (bnc + salaires) : 0;
  const acomptes = creditsImpot > 0 ? repartir(impotAvantCredits).impotMedecin : parts.impotMedecin;

  return {
    ...parts,
    impotLiberal: Math.round(parts.impotMedecin * partLiberale),
    acomptesLiberaux: Math.round(acomptes * partLiberale),
    creditsImpot: Math.round(creditsImpot),
  };
}
