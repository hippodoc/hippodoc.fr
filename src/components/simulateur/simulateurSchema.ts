import { z } from 'zod';

export const simulateurSchema = z.object({
  // SECTION BASE
  periode: z.enum(['annuel', 'mensuel']).default('annuel'),
  annee: z.number().int().min(2024).max(2030).default(2026),
  recettesBrutes: z.number()
    .min(0, { message: "Le montant doit être positif" })
    .multipleOf(0.01, { message: "Maximum 2 décimales" }),
  chargesHorsCotisations: z.number()
    .min(0, { message: "Le montant doit être positif" })
    .multipleOf(0.01, { message: "Maximum 2 décimales" })
    .default(0),

  // SECTION REVENUS MIXTES
  revenusSalaries: z.number()
    .min(0, { message: "Le montant doit être positif" })
    .multipleOf(0.01, { message: "Maximum 2 décimales" })
    .default(0),

  // SECTION REVENUS DU CONJOINT (si marié/pacsé)
  revenusConjoint: z.number()
    .min(0, { message: "Le montant doit être positif" })
    .multipleOf(0.01, { message: "Maximum 2 décimales" })
    .default(0),

  // SECTION TYPE DE REVENU DU CONJOINT
  typeRevenuConjoint: z.enum([
    'salarie',       // Abattement 10% plafonné 14 426 €
    'liberal_micro', // Abattement 34%
    'liberal_reel',  // Pas d'abattement (bénéfice fiscal saisi directement)
    'autre',         // Pas d'abattement (montant imposable direct)
  ]).default('salarie'),

  // SECTION REVENUS PDSA EXONÉRÉS
  revenusExoneresPdsa: z.number()
    .min(0, { message: "Le montant doit être positif" })
    .multipleOf(0.01, { message: "Maximum 2 décimales" })
    .default(0),

  // SECTION LOCALISATION (enum au lieu de code postal)
  lieuExercice: z.enum([
    'metropole',
    'guadeloupe',
    'martinique',
    'guyane',
    'reunion',
    'mayotte'
  ]).default('metropole'),

  // SECTION IMPÔT
  situationFamiliale: z.enum(['celibataire', 'marie_pacse', 'veuf', 'parent_isole'])
    .default('celibataire'),
  enfants: z.number()
    .min(0, { message: "Le nombre d'enfants doit être positif" })
    .multipleOf(0.5, { message: "Demi-parts acceptées (ex: 2.5)" })
    .default(0),

  // SECTION CONVENTIONNEMENT
  secteurConventionnel: z.enum(['secteur_1', 'secteur_2'])
    .default('secteur_1'),

  // SECTION RÉGIME SOCIAL (RSPM vs PAMC)
  regimeSocial: z.enum([
    'auto',    // Détection automatique selon CA < 38k
    'rspm',    // Force le calcul RSPM local (cotisations simplifiées)
    'pamc'     // Force l'appel API URSSAF (régime classique)
  ]).default('auto'),

  // SECTION PHASE 3 — RID, Situation CARMF, Ratio non-conventionné
  tauxRid: z.enum(['25%', '100%']).default('25%'),
  situationCarmf: z.enum(['dispense', 'affilie_jeune', 'affilie_3ans_plus']).default('affilie_3ans_plus'),
  ratioNonConventionne: z.number().min(0).max(100).default(0),

  // ═══════════════════════════════════════════════════════════
  // PHASE 1 — Précision fiscale
  // ═══════════════════════════════════════════════════════════

  forfait2pct: z.boolean().default(true),

  cotisationsVolontaires: z.number()
    .min(0, { message: "Le montant doit être positif" })
    .multipleOf(0.01, { message: "Maximum 2 décimales" })
    .default(0),

  // Phase 3 — Distinction PER vs Madelin (CGI Art. 154 bis)
  // PER : déductible en micro-BNC ET réel.
  // Madelin : déductible UNIQUEMENT en BNC réel — ignoré côté micro-BNC.
  typeCotisationsVolontaires: z.enum(['per', 'madelin']).default('per'),

  // ═══════════════════════════════════════════════════════════
  // PHASE 2 — Zones exonérées, Revenus fonciers, Crédits d'impôt
  // ═══════════════════════════════════════════════════════════

  // Zone exonérée (ZFU-TE ou ZFRR)
  zoneExoneree: z.enum(['aucune', 'zfu', 'zfrr']).default('aucune'),
  // Année d'installation dans la zone (pour calcul dégressif)
  anneeInstallationZone: z.number().int().min(2000).max(2030).optional(),

  // Revenus fonciers
  regimeFoncier: z.enum(['aucun', 'micro', 'reel']).default('aucun'),
  // Micro-foncier : revenus bruts (abattement 30%)
  revenusFonciersBruts: z.number()
    .min(0, { message: "Le montant doit être positif" })
    .default(0),
  // Régime réel : résultat foncier net (peut être négatif = déficit).
  // L'imputation sur revenu global est plafonnée à -10 700€ (CGI Art. 156-I-3°) ;
  // l'excédent reste reportable 10 ans sur futurs revenus fonciers.
  // Le clamp est appliqué côté moteur (calculateRevenuFoncierImposable, baremes-ir.ts).
  revenuFoncierNet: z.number()
    .min(-100000, { message: "Montant trop faible" })
    .max(1000000, { message: "Montant trop élevé" })
    .default(0),

  // Crédits d'impôt
  creditFormationDirigeant: z.boolean().default(false),
  heuresFormation: z.number().min(0).max(40).default(0),
  creditImpotAutre: z.number()
    .min(0, { message: "Le montant doit être positif" })
    .default(0),

  // Emploi à domicile (Art. 199 sexdecies CGI) — dépenses annuelles
  fraisEmploiDomicile: z.number()
    .min(0, { message: "Le montant doit être positif" })
    .default(0),

  // Garde d'enfant < 6 ans (Art. 200 quater B CGI) — dépenses annuelles totales
  fraisGardeEnfants: z.number()
    .min(0, { message: "Le montant doit être positif" })
    .default(0),

  // Nombre d'enfants < 6 ans gardés hors domicile
  nombreEnfantsGarde: z.number()
    .min(0, { message: "Le nombre doit être positif" })
    .max(10)
    .default(0),

  // 🎯 Type d'exercice (gate déductions S1/Forfait 2 % aux installés — cf. fiscalEligibility)
  typeExercice: z.string().nullable().optional(),

  // Chèques-vacances ANCV (déductible BNC réel, max 1 SMIC mensuel — varie par année)
  // Le cap effectif est appliqué côté moteur via `capChequesVacances(montant, annee)` :
  // 2024 = 1 766€ · 2025 = 1 802€ · 2026 = 1 823€. On laisse passer la saisie utilisateur
  // (cap silencieux + warning UI) plutôt que de bloquer à un plafond fixe.
  chequesVacances: z.number()
    .min(0, { message: "Le montant doit être positif" })
    .max(2000, { message: "Au-delà du plafond légal — sera capé automatiquement" })
    .default(0),
}).refine((data) => {
  if (data.zoneExoneree !== 'aucune' && !data.anneeInstallationZone) {
    return false;
  }
  return true;
}, {
  message: "L'année d'installation est requise quand une zone exonérée est sélectionnée",
  path: ['anneeInstallationZone'],
}).refine((data) => {
  // Phase 6 Bug #22 — Recettes nulles ne doivent pas passer (résultat = 0 sans erreur).
  return data.recettesBrutes > 0;
}, {
  message: "Saisis tes recettes pour lancer le calcul (montant strictement positif).",
  path: ['recettesBrutes'],
}).refine((data) => {
  // Phase 6 Bug #24 — PDSA exonéré ne peut pas dépasser les recettes brutes.
  return (data.revenusExoneresPdsa || 0) <= data.recettesBrutes;
}, {
  message: "La part PDSA exonérée ne peut pas dépasser tes recettes brutes.",
  path: ['revenusExoneresPdsa'],
}).refine((data) => {
  // Phase 6 Bug #24bis — Cohérence garde d'enfant : nombre de gardés ≤ enfants déclarés.
  return (data.nombreEnfantsGarde || 0) <= Math.ceil(data.enfants || 0);
}, {
  message: "Le nombre d'enfants gardés ne peut pas dépasser tes enfants à charge.",
  path: ['nombreEnfantsGarde'],
}).refine((data) => {
  // Phase 12 — Année d'installation ZFU/ZFRR ne peut pas être postérieure à l'année fiscale.
  if (!data.anneeInstallationZone) return true;
  return data.anneeInstallationZone <= data.annee;
}, {
  message: "L'année d'installation ne peut pas être postérieure à l'année fiscale simulée.",
  path: ['anneeInstallationZone'],
}).refine((data) => {
  // Phase 12 — Revenus du conjoint impossibles si célibataire.
  if (data.situationFamiliale === 'celibataire' && (data.revenusConjoint || 0) > 0) {
    return false;
  }
  return true;
}, {
  message: "Tu ne peux pas saisir de revenus conjoint en étant célibataire — passe en 'marié/pacsé'.",
  path: ['revenusConjoint'],
}).refine((data) => {
  // Phase 12 — Cohérence garde d'enfants : si frais > 0, exiger un nombre > 0 (et inverse).
  const frais = data.fraisGardeEnfants || 0;
  const nb = data.nombreEnfantsGarde || 0;
  if (frais > 0 && nb === 0) return false;
  if (nb > 0 && frais === 0) return false;
  return true;
}, {
  message: "Renseigne à la fois les frais ET le nombre d'enfants gardés (ou laisse les deux à zéro).",
  path: ['fraisGardeEnfants'],
});

/**
 * Vérifie si une zone d'exonération est encore disponible pour une année / année d'installation données.
 *
 * Source : AGA-PS 2035 millésime 2026 — la ZFU-TE (Zone Franche Urbaine — Territoires Entrepreneurs)
 * a expiré le 31.12.2025 (CGI Art. 44 octies A). Plus aucune nouvelle installation éligible à partir
 * de 2026 ; les installations antérieures conservent leur exonération dégressive jusqu'au terme.
 *
 * @returns false si la zone n'est plus proposable pour cette année / installation
 */
export function isZoneExoneneeAvailable(
  zone: 'aucune' | 'zfu' | 'zfrr',
  annee: number,
  anneeInstallationZone?: number
): boolean {
  if (zone === 'aucune' || zone === 'zfrr') return true;
  if (zone === 'zfu') {
    // ZFU-TE : nouvelle installation impossible à partir de 2026
    if (annee >= 2026 && (anneeInstallationZone === undefined || anneeInstallationZone >= 2026)) {
      return false;
    }
    return true;
  }
  return true;
}

// Type interne pour les calculs (avec regimeFiscal ajouté dynamiquement)
export type SimulateurFormData = z.infer<typeof simulateurSchema> & {
  regimeFiscal?: 'reel' | 'micro-bnc';
};
