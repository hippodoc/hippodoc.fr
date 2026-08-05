/**
 * Mapping Déclarant 1 ↔ Déclarant 2
 *
 * Source unique de vérité pour la correspondance des codes fiscaux et sociaux
 * entre le déclarant 1 (titulaire de la déclaration) et le déclarant 2 (conjoint
 * ou partenaire de PACS).
 *
 * Principe : la liasse 2035 (A et B) est rattachée à un SIRET unique et ne porte
 * pas la distinction D1/D2. Seuls le report sur la 2042 / 2042-C PRO et le volet
 * social DSFU PAMC changent.
 *
 * Référence : guides DGFiP 2026 (revenus 2025) + brochure URSSAF DSFU.
 *
 * IMPORTANT : ce module est PUREMENT un mapping de chaînes. Il n'impacte aucun
 * calcul fiscal, social ou de Super-Net. Il sert uniquement à l'affichage.
 */

export type Declarant = 1 | 2;

/**
 * Mapping exhaustif des codes D1 → D2.
 *
 * Sections :
 *  - Volet fiscal 2042-C PRO (Micro-BNC + Régime réel + plus/moins-values)
 *  - Volet fiscal 2042 personnelle (salaires, pensions)
 *  - Volet social DSFU PAMC — Entrepreneur Individuel à l'IR
 *  - Volet social DSFU PAMC — Associé de société à l'IR (2035)
 *  - Volet social DSFU — Gérants/Associés à l'IS (SELARL, etc.)
 *  - Divers (revenus étrangers, PER praticiens IR)
 */
export const DECLARANT_2_MAPPING: Record<string, string> = {
  // === Volet fiscal 2042-C PRO ===
  // Micro-BNC
  '5HQ': '5IQ', // Recettes brutes
  '5HP': '5IP', // Revenus nets exonérés (régimes zonés)
  '5HV': '5IV', // Plus-values à court terme
  '5KZ': '5LZ', // Moins-values à court terme
  // Régime réel (déclaration contrôlée 2035)
  '5QC': '5RC', // Bénéfice imposable
  '5QE': '5RE', // Déficit
  '5XP': '5YP', // Plus-values à court terme
  '5XH': '5YH', // Moins-values à court terme
  // Prélèvements sociaux DGFiP
  '5HY': '5IY', // Revenus nets (Micro-BNC/BIC/BA) à imposer aux PS

  // === Volet fiscal 2042 principale ===
  '1AJ': '1BJ', // Salaires et traitements
  '1AS': '1BS', // Pensions et retraites
  '1AZ': '1BZ', // Pensions d'invalidité

  // === Volet social DSFU PAMC — EI à l'IR ===
  // Recettes et assurance maladie
  DSCS: 'DSDS', // Recettes brutes totales (assiette CSG/CRDS)
  DSAV: 'DSBV', // Recettes tirées d'actes conventionnés (SNIR)
  DSAW: 'DSBW', // Dépassements d'honoraires
  DSAU: 'DSBU', // Ratio conventionné
  DSAT: 'DSBT', // Recettes en structures (EHPAD/HAD)
  DSAZ: 'DSBZ', // Taux spécifique dentistes
  // Revenu Brut Social (RBS) — EI
  DSDE: 'DSDF', // RBS positif
  DSDG: 'DSDH', // RBS négatif (déficit)

  // === Volet social DSFU PAMC — Associé de société à l'IR (2035) ===
  DSDI: 'DSDJ', // RBS positif associé
  DSDK: 'DSDL', // RBS négatif associé

  // === Revenus de remplacement et compléments ===
  DSDX: 'DSDY', // Indemnités journalières CPAM
  DSCZ: 'DSDZ', // Autres revenus de remplacement (Madelin/AJPA)
  DSCN: 'DSDN', // Chèques-vacances ANCV
  DSFA: 'DSFB', // Neutralisation PDSA (Micro-BNC uniquement)

  // === Gérants et associés à l'IS (SELARL, etc.) ===
  DSEC: 'DSED', // Rémunérations brutes
  DSSC: 'DSSD', // Frais réels associés
  DSAA: 'DSAB', // Dividendes (> 10 % capital)
  DSEM: 'DSEN', // Intéressement / Participation / Abondement PER (sociétés IS)

  // === Divers ===
  DSGC: 'DSGD', // Bénéfice activité hors France
  DSGE: 'DSGF', // Déficit activité hors France
  DSQA: 'DSQB', // Intéressement / Participation / Abondement PER (praticiens à l'IR)
};

/**
 * Renvoie le code adapté au déclarant demandé.
 *
 * - `getCode('DSCS', 1)` → `'DSCS'`
 * - `getCode('DSCS', 2)` → `'DSDS'`
 * - `getCode('CODE_INCONNU', 2)` → `'CODE_INCONNU'` (passthrough + warning dev)
 *
 * Le passthrough garantit qu'aucun affichage ne casse si un code n'est pas
 * encore mappé (ex. nouveau code introduit par la DGFiP).
 */
export function getCode(code: string, declarant: Declarant): string {
  if (declarant === 1) return code;
  const mapped = DECLARANT_2_MAPPING[code];
  if (mapped === undefined) {
    if (import.meta.env?.DEV) {
      // eslint-disable-next-line no-console
      console.warn(
        `[declarantMapping] Code inconnu pour déclarant 2 : "${code}". Passthrough appliqué.`,
      );
    }
    return code;
  }
  return mapped;
}
