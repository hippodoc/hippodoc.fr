/**
 * Calcul centralisé des parts fiscales
 * 
 * LOGIQUE OFFICIELLE (CGI Art. 194) :
 * - Célibataire : 1 part
 * - Marié/Pacsé : 2 parts
 * - Veuf : 2 parts si enfants à charge, sinon 1 part
 * - Parent isolé (célibataire avec enfants) : 1 part de base + majoration spéciale 1er enfant
 * 
 * MAJORATION POUR ENFANTS (règle des 3 paliers - CGI Art. 194) :
 * Cas standard (couple, célibataire, veuf) :
 *   - 1er enfant       : +0,5 part
 *   - 2ème enfant      : +0,5 part
 *   - 3ème et suivants : +1 part chacun
 * 
 * Cas parent isolé (CGI Art. 194 II) :
 *   - 1er enfant       : +1 part (majoration spéciale parent isolé)
 *   - 2ème enfant      : +0,5 part
 *   - 3ème et suivants : +1 part chacun
 * 
 * Demi-parts (garde alternée) : la fraction d'enfant compte toujours pour +0,5 part,
 * le bonus du 3ème enfant ne s'applique qu'aux enfants entiers à charge exclusive.
 * 
 * @example
 * calculateFiscalParts('marie_pacse', 2)   // => 3   (2 + 0,5 + 0,5)
 * calculateFiscalParts('marie_pacse', 3)   // => 4   (2 + 0,5 + 0,5 + 1)
 * calculateFiscalParts('marie_pacse', 4)   // => 5   (2 + 0,5 + 0,5 + 1 + 1)
 * calculateFiscalParts('marie_pacse', 1.5) // => 2,75 (garde alternée 2ème enfant)
 * calculateFiscalParts('parent_isole', 1)  // => 2   (1 + 1)
 * calculateFiscalParts('parent_isole', 2)  // => 2,5 (1 + 1 + 0,5)
 * calculateFiscalParts('parent_isole', 3)  // => 3,5 (1 + 1 + 0,5 + 1)
 * calculateFiscalParts('celibataire', 1)   // => 1,5
 */

export type SituationFamiliale = 'celibataire' | 'marie_pacse' | 'veuf' | 'parent_isole';

/**
 * Calcule la majoration de parts liée aux enfants (hors parent isolé).
 * Applique la règle des 3 paliers du CGI Art. 194.
 */
function calculateChildrenPartsStandard(enfants: number): number {
  const nbEntiers = Math.floor(enfants);
  const fraction = enfants - nbEntiers;
  
  let majoration = 0;
  // 1er + 2ème enfant (entiers) : +0,5 part chacun
  majoration += Math.min(nbEntiers, 2) * 0.5;
  // 3ème enfant et suivants (entiers) : +1 part chacun
  majoration += Math.max(0, nbEntiers - 2) * 1;
  // Fraction d'enfant (garde alternée) : toujours +0,5
  majoration += fraction * 0.5;
  
  return majoration;
}

/**
 * Calcule la majoration de parts pour un parent isolé.
 * 1er enfant = +1 part (majoration spéciale), 2ème = +0,5, 3ème+ = +1 chacun.
 */
function calculateChildrenPartsParentIsole(enfants: number): number {
  const nbEntiers = Math.floor(enfants);
  const fraction = enfants - nbEntiers;
  
  let majoration = 0;
  if (nbEntiers >= 1) majoration += 1;            // 1er enfant : +1 (spécifique parent isolé)
  if (nbEntiers >= 2) majoration += 0.5;          // 2ème enfant : +0,5
  if (nbEntiers >= 3) majoration += (nbEntiers - 2) * 1; // 3ème et suivants : +1 chacun
  // Fraction (garde alternée) : +0,5
  majoration += fraction * 0.5;
  
  return majoration;
}

export function calculateFiscalParts(
  situationFamiliale: SituationFamiliale | string,
  enfants: number = 0
): number {
  let parts = 1;
  
  // Parts de base selon la situation familiale
  if (situationFamiliale === 'marie_pacse') {
    parts = 2;
  } else if (situationFamiliale === 'veuf') {
    // CGI Art. 194 : veuf avec enfants à charge conserve 2 parts, sinon 1 part
    parts = enfants > 0 ? 2 : 1;
  } else if (situationFamiliale === 'parent_isole') {
    parts = 1;
  }
  // célibataire : 1 part (défaut)
  
  // Majoration pour enfants (règle CGI Art. 194 - 3 paliers)
  if (enfants > 0) {
    if (situationFamiliale === 'parent_isole') {
      parts += calculateChildrenPartsParentIsole(enfants);
    } else {
      parts += calculateChildrenPartsStandard(enfants);
    }
  }
  
  return parts;
}

/**
 * Calcul des parts fiscales depuis un objet formData (compatible avec SimulateurFormData)
 */
export function calculateFiscalPartsFromFormData(formData: {
  situationFamiliale: string;
  enfants: number;
}): number {
  return calculateFiscalParts(formData.situationFamiliale, formData.enfants);
}

/**
 * Inverse exact de calculateFiscalParts : reconstruit le nombre d'enfants
 * à partir des parts fiscales totales saisies par l'utilisateur.
 *
 * Règle CGI Art. 194 (3 paliers) :
 * Standard (célibataire / marié / veuf) :
 *   - 1er enfant       : +0,5 part
 *   - 2ème enfant      : +0,5 part  (cumul 1ers 2 enfants = +1 part)
 *   - 3ème et suivants : +1 part chacun
 *
 * Parent isolé :
 *   - 1er enfant       : +1 part   (majoration spéciale)
 *   - 2ème enfant      : +0,5 part (cumul 2 premiers = +1,5 part)
 *   - 3ème et suivants : +1 part chacun
 *
 * Le format normalisé accepté pour `situationFamiliale` est :
 * 'celibataire' | 'marie-pacse' | 'marie_pacse' | 'parent_isole' | 'veuf'.
 *
 * @example
 * inferEnfantsFromParts(2, 'marie-pacse')   // => 0
 * inferEnfantsFromParts(2.5, 'marie-pacse') // => 1
 * inferEnfantsFromParts(3, 'marie-pacse')   // => 2
 * inferEnfantsFromParts(4, 'marie-pacse')   // => 3
 * inferEnfantsFromParts(5, 'marie-pacse')   // => 4
 * inferEnfantsFromParts(2, 'parent_isole')  // => 1
 * inferEnfantsFromParts(2.5, 'parent_isole')// => 2
 * inferEnfantsFromParts(3.5, 'parent_isole')// => 3
 * inferEnfantsFromParts(1.5, 'celibataire') // => 1
 */
export function inferEnfantsFromParts(
  parts: number,
  situationFamiliale: SituationFamiliale | string
): number {
  if (!parts || parts <= 0) return 0;

  // Parts adultes de base (avant majoration enfants)
  // Note : un veuf avec enfants a 2 parts adultes, sinon 1 — on déduit du total saisi.
  const isMarried = situationFamiliale === 'marie-pacse' || situationFamiliale === 'marie_pacse';
  const isParentIsole = situationFamiliale === 'parent_isole';
  const isVeuf = situationFamiliale === 'veuf';

  // Pour le veuf : si parts >= 2 → on suppose qu'il a des enfants (2 parts adultes), sinon 1.
  let basePartsAdulte: number;
  if (isMarried) basePartsAdulte = 2;
  else if (isVeuf && parts >= 2) basePartsAdulte = 2;
  else basePartsAdulte = 1;

  const restantes = Math.max(0, parts - basePartsAdulte);
  if (restantes === 0) return 0;

  if (isParentIsole) {
    // 1er enfant = +1 part, 2ème = +0,5, 3ème+ = +1 chacun
    if (restantes <= 1) {
      // Seulement 1er enfant (entier ou fraction)
      return Math.round(restantes * 10) / 10; // gère 0,5 (garde alternée) et 1
    }
    if (restantes <= 1.5) {
      // 1er entier (+1) + fraction du 2ème (+0,5 max)
      return 1 + (restantes - 1) / 0.5;
    }
    // 1er (+1) + 2ème (+0,5) = 1,5 part puis +1 par enfant supplémentaire
    return Math.round(2 + (restantes - 1.5));
  }

  // Standard (célibataire / marié / veuf)
  // 1er = +0,5, 2ème = +0,5, 3ème+ = +1 chacun
  if (restantes <= 1) {
    // 1 ou 2 enfants en demi-parts (gère garde alternée)
    return Math.round((restantes / 0.5) * 10) / 10;
  }
  // Au-delà de 2 enfants : 2 enfants = 1 part, puis +1 par enfant supplémentaire
  return Math.round(2 + (restantes - 1));
}
