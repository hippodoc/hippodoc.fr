/**
 * Configuration des territoires DOM-TOM pour le simulateur fiscal
 * 
 * Références légales :
 * - Abattements IR DOM : CGI art. 197-I-3
 * - Cotisations URSSAF : Taux spécifiques appliqués par l'API URSSAF
 */

export type LieuExercice = 'metropole' | 'guadeloupe' | 'martinique' | 'guyane' | 'reunion' | 'mayotte';

export interface DomTomInfo {
  nom: string;
  tauxAbattement: number; // 0.30 ou 0.40
  plafond: number; // en euros
  emoji: string;
}

export const DOM_TOM_CONFIG: Record<LieuExercice, DomTomInfo> = {
  'metropole': { nom: 'France métropolitaine', tauxAbattement: 0, plafond: 0, emoji: '🇫🇷' },
  'guadeloupe': { nom: 'Guadeloupe', tauxAbattement: 0.30, plafond: 2450, emoji: '🏝️' },
  'martinique': { nom: 'Martinique', tauxAbattement: 0.30, plafond: 2450, emoji: '🏝️' },
  'guyane': { nom: 'Guyane', tauxAbattement: 0.40, plafond: 4050, emoji: '🌴' },
  'reunion': { nom: 'La Réunion', tauxAbattement: 0.30, plafond: 2450, emoji: '🏝️' },
  'mayotte': { nom: 'Mayotte', tauxAbattement: 0.40, plafond: 4050, emoji: '🌴' },
};

/**
 * Récupère les informations d'un territoire DOM-TOM
 * @param lieuExercice - Identifiant du territoire
 * @returns Informations du territoire ou null si métropole
 */
export function getDomTomInfo(lieuExercice?: string): DomTomInfo | null {
  if (!lieuExercice || lieuExercice === 'metropole') return null;
  const info = DOM_TOM_CONFIG[lieuExercice as LieuExercice];
  return info && info.tauxAbattement > 0 ? info : null;
}

/**
 * Vérifie si un lieu d'exercice est un DOM-TOM
 */
export function isDomTom(lieuExercice?: string): boolean {
  return getDomTomInfo(lieuExercice) !== null;
}

/**
 * Formate le taux d'abattement pour l'affichage
 */
export function formatTauxAbattement(info: DomTomInfo): string {
  return `${Math.round(info.tauxAbattement * 100)}%`;
}

/**
 * Formate le plafond pour l'affichage
 */
export function formatPlafond(info: DomTomInfo): string {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'EUR',
    maximumFractionDigits: 0,
  }).format(info.plafond);
}

/**
 * @deprecated Utilisez getDomTomInfo avec lieuExercice à la place
 * Détecte si un code postal correspond à un territoire DOM-TOM
 * Conservé pour rétrocompatibilité
 */
export function detectDomTom(codePostal?: string): DomTomInfo | null {
  if (!codePostal || codePostal.length !== 5) return null;
  
  const prefix = codePostal.substring(0, 3);
  const mapping: Record<string, LieuExercice> = {
    '971': 'guadeloupe',
    '972': 'martinique',
    '973': 'guyane',
    '974': 'reunion',
    '976': 'mayotte',
  };
  
  const lieuExercice = mapping[prefix];
  return lieuExercice ? DOM_TOM_CONFIG[lieuExercice] : null;
}
