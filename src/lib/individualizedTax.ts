/**
 * Calcul du taux individualisé selon la méthode DGFiP (BOFiP)
 * 
 * Depuis le 1er septembre 2025, le taux individualisé est appliqué par défaut
 * aux couples en imposition commune.
 * 
 * Méthode officielle :
 * 1. Identifier le conjoint aux revenus les plus faibles
 * 2. Calculer l'impôt fictif (IR1) sur ses revenus avec la moitié des parts
 * 3. Déduire le taux individualisé du moins-disant
 * 4. Attribuer le solde d'impôt au plus-disant
 */

// ✅ Import centralisé des barèmes IR
import { getTranchesIR, getBaremeIR, calculateRawTaxPerPart } from '@/lib/baremes-ir';

// Utilise le barème 2025 par défaut (le hook appelant passera l'année si nécessaire)
const PLAFOND_QF_PAR_DEMI_PART = getBaremeIR().plafondQfParDemiPart;

export interface IndividualizedTaxResult {
  impotMedecin: number;
  impotConjoint: number;
  tauxMedecin: number;      // en % (ex: 26.0)
  tauxConjoint: number;     // en % (ex: 17.4)
  tauxFoyer: number;        // taux unique pour comparaison
  medecinEstMoinsDisant: boolean;
}

/**
 * Calcule l'impôt brut selon le barème progressif
 */
function calculateBaremeImpot(quotientFamilial: number): number {
  return calculateRawTaxPerPart(quotientFamilial);
}

/**
 * Calcule l'impôt avec barème progressif + plafonnement QF
 * 
 * @param revenuImposable - Revenu net imposable du contribuable
 * @param parts - Nombre de parts fiscales à utiliser
 * @param partsBase - Nombre de parts de base (1 pour célibataire, 2 pour couple)
 */
function calculateTaxWithBareme(
  revenuImposable: number, 
  parts: number,
  partsBase: number
): number {
  if (revenuImposable <= 0 || parts <= 0) return 0;
  
  // 1. Calcul brut avec quotient familial
  const qf = revenuImposable / parts;
  const impotParPart = calculateBaremeImpot(qf);
  const impotBrut = impotParPart * parts;
  
  // 2. Plafonnement QF si parts enfants
  const partsEnfants = parts - partsBase;
  if (partsEnfants <= 0) return Math.round(impotBrut);
  
  // 3. Calcul de l'impôt sans les parts enfants (base)
  const qfBase = revenuImposable / partsBase;
  const impotParPartBase = calculateBaremeImpot(qfBase);
  const impotSansEnfants = impotParPartBase * partsBase;
  
  // 4. Application du plafond
  // Note: partsEnfants est en demi-parts, donc on multiplie par 2 pour avoir le nombre de demi-parts
  const plafond = partsEnfants * 2 * PLAFOND_QF_PAR_DEMI_PART;
  const avantage = impotSansEnfants - impotBrut;
  
  if (avantage > plafond) {
    return Math.round(impotSansEnfants - plafond);
  }
  
  return Math.round(impotBrut);
}

/**
 * Calcul du taux individualisé selon la méthode DGFiP (BOFiP)
 * 
 * @param revenuImposableMedecin - Revenu imposable du médecin (libéral + salarié après abattements)
 * @param revenuImposableConjoint - Revenu imposable du conjoint (après abattement selon type)
 * @param revenuBrutMedecin - Assiette PAS du médecin (BNC net = CA - charges - cotisations pour libéral)
 * @param revenuBrutConjoint - Assiette PAS du conjoint (salaire brut AVANT abattement 10%)
 * @param impotFoyerTotal - Impôt total du foyer (déjà calculé par le simulateur)
 * @param partsTotales - Nombre total de parts fiscales du foyer
 * @param situationFamiliale - 'marie_pacse', 'veuf', 'celibataire', 'parent_isole'
 */
export function calculateIndividualizedTax(
  revenuImposableMedecin: number,
  revenuImposableConjoint: number,
  revenuBrutMedecin: number,
  revenuBrutConjoint: number,
  impotFoyerTotal: number,
  partsTotales: number,
  situationFamiliale: string
): IndividualizedTaxResult {
  // 1. Déterminer les parts de base selon la situation familiale
  // ⚠️ Normalisation tiret↔underscore : le profil Supabase stocke `'marie-pacse'`
  // (tiret) alors que la doctrine interne et le Simulateur utilisent `'marie_pacse'`
  // (underscore). Sans normalisation, partsBase tomberait à 1 pour un couple marié,
  // déclenchant à tort le plafonnement QF (bug juin 2026 — cf. audit expert).
  const sit = (situationFamiliale || '').replace(/-/g, '_');
  const partsBase = (sit === 'marie_pacse' || sit === 'veuf') ? 2 : 1;
  
  // 2. Moitié des parts pour chaque conjoint (règle DGFiP)
  const partsParConjoint = partsTotales / 2;
  const partsBaseParConjoint = partsBase / 2;
  
  // 3. Identifier le moins-disant (revenus imposables)
  const medecinEstMoinsDisant = revenuImposableMedecin < revenuImposableConjoint;
  
  const revenuMoinsDisant = medecinEstMoinsDisant 
    ? revenuImposableMedecin 
    : revenuImposableConjoint;
  const brutMoinsDisant = medecinEstMoinsDisant 
    ? revenuBrutMedecin 
    : revenuBrutConjoint;
  
  // 4. Calcul IR1 pour le moins-disant (avec moitié des parts)
  // C'est l'impôt fictif calculé sur ses revenus seuls
  const ir1 = calculateTaxWithBareme(
    revenuMoinsDisant, 
    partsParConjoint, 
    partsBaseParConjoint
  );
  
  // 5. Taux individualisé du moins-disant (arrondi à 0.1%)
  const tauxMoinsDisant = brutMoinsDisant > 0 
    ? Math.round((ir1 / brutMoinsDisant) * 1000) / 10
    : 0;
  
  // 6. Impôt du moins-disant (taux appliqué à son assiette PAS)
  const impotMoinsDisant = Math.round(brutMoinsDisant * tauxMoinsDisant / 100);
  
  // 7. Impôt du plus-disant = solde (impôt foyer - impôt moins-disant)
  const impotPlusDisant = Math.max(0, impotFoyerTotal - impotMoinsDisant);
  
  // 8. Taux du plus-disant (arrondi à 0.1%)
  const brutPlusDisant = medecinEstMoinsDisant 
    ? revenuBrutConjoint 
    : revenuBrutMedecin;
  const tauxPlusDisant = brutPlusDisant > 0 
    ? Math.round((impotPlusDisant / brutPlusDisant) * 1000) / 10
    : 0;
  
  // 9. Taux foyer unique (pour comparaison - ce qu'on aurait avec taux commun)
  const assietteTotalePAS = revenuBrutMedecin + revenuBrutConjoint;
  const tauxFoyer = assietteTotalePAS > 0 
    ? Math.round((impotFoyerTotal / assietteTotalePAS) * 1000) / 10
    : 0;
  
  return {
    impotMedecin: medecinEstMoinsDisant ? impotMoinsDisant : impotPlusDisant,
    impotConjoint: medecinEstMoinsDisant ? impotPlusDisant : impotMoinsDisant,
    tauxMedecin: medecinEstMoinsDisant ? tauxMoinsDisant : tauxPlusDisant,
    tauxConjoint: medecinEstMoinsDisant ? tauxPlusDisant : tauxMoinsDisant,
    tauxFoyer,
    medecinEstMoinsDisant,
  };
}
