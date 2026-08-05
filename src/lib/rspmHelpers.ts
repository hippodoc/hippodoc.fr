/**
 * 🎯 CONVENTION A — Audit pré-prod final 2026
 * ────────────────────────────────────────────
 * Helper centralisé pour router correctement les charges déductibles vers
 * `calculateRspmBreakdown` selon le régime fiscal du médecin.
 *
 * RÈGLE FISCALE (CGI Art. 102 ter / Art. 93, CSS Art. R613-7) :
 *  - Réel BNC : toutes charges (loyer + amortissements + RÉTROCESSIONS VERSÉES via L21/BG)
 *               sont déduites en aval pour calculer le bénéfice fiscal.
 *  - Micro-BNC : SEULES les rétrocessions versées sont déductibles AVANT l'abattement 34 %
 *                (et avant l'assiette URSSAF). Les autres charges (loyer, amortissements)
 *                sont absorbées forfaitairement par l'abattement.
 *
 * Sans ce helper, les call-sites historiques passaient `chargesLiberalesTotal`
 * (qui mêle loyer + retro) et provoquaient une double-déduction silencieuse en micro-BNC
 * (loyer/amortissements retranchés à tort de la base avant abattement).
 *
 * Voir : mem://calculations/convention-a-retrocessions-final-sealing.md
 */

export type RegimeFiscal = 'reel' | 'micro-bnc' | null | undefined;

export interface RspmChargesArgs {
  /** Param à passer en `chargesLiberalesReelles` au moteur RSPM. */
  chargesLiberalesReelles: number | undefined;
  /** Param à passer en `retrocessionsVerseesMicroBnc` au moteur RSPM. */
  retrocessionsVerseesMicroBnc: number;
}

/**
 * Construit les arguments « charges » pour `calculateRspmBreakdown` selon le régime.
 *
 * @param regime         Régime fiscal effectif de l'utilisateur ('reel' | 'micro-bnc').
 * @param chargesClassiques Charges hors rétrocessions (loyer + fournitures + amortissements).
 *                          Note : NE PAS inclure les rétrocessions versées ici.
 * @param retrocessionsVersees Total annuel des rétrocessions versées au remplaçant
 *                              (`montant_verse` agrégé — charge L21/BG du Cerfa 2035-A).
 */
export const buildRspmChargesArgs = (
  regime: RegimeFiscal,
  chargesClassiques: number,
  retrocessionsVersees: number,
): RspmChargesArgs => {
  const safeCharges = Math.max(0, chargesClassiques || 0);
  const safeRetro = Math.max(0, retrocessionsVersees || 0);

  if (regime === 'reel') {
    // En réel : tout passe en chargesLiberalesReelles (incl. retros via L21/BG).
    const total = safeCharges + safeRetro;
    return {
      chargesLiberalesReelles: total > 0 ? total : undefined,
      retrocessionsVerseesMicroBnc: 0, // ignoré en réel par le moteur
    };
  }

  // Micro-BNC (ou regime null/undefined → fallback prudent micro-BNC) :
  //  - chargesLiberalesReelles n'est PAS transmis (loyer/amortissements absorbés par
  //    l'abattement 34 % CGI Art. 102 ter).
  //  - retrocessionsVerseesMicroBnc = total versé pour pré-déduction avant abattement.
  return {
    chargesLiberalesReelles: undefined,
    retrocessionsVerseesMicroBnc: safeRetro,
  };
};
