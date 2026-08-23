/**
 * Résolution des ancres du guide des déclarations.
 *
 * POURQUOI CE FICHIER EXISTE
 * Tout le contenu du guide vit sur une seule page, et les liens croisés entre
 * items (`relatedCases`, `relatedTerms`, `relatedQuestions`, `relatedFiches`)
 * sont donc rendus en ancres nues : `href="#case-DSCS"`. Correct tant qu'il n'y
 * a qu'une page. À partir du moment où des pages filles reprennent un
 * sous-ensemble du contenu (/guide-declarations/dsfu-pamc etc.), une ancre nue
 * pointe dans le vide dès que sa cible n'est pas sur la page courante.
 *
 * COMMENT
 * Un contexte React porte la fonction de résolution. Sa valeur par défaut est
 * le comportement historique (ancre nue) : le hub rend donc exactement le même
 * HTML qu'avant l'introduction de ce fichier — c'est vérifié par empreinte dans
 * MIGRATION.md § 9.ap. Les pages filles, elles, fournissent `hubResolver()` :
 * une ancre présente sur la page reste locale, une ancre absente part vers le
 * hub, qui détient l'intégralité du contenu.
 *
 * ⚠️ `InlineRef` est appelé depuis `FormattedText`, lui-même appelé au fond des
 * cartes. Passer la résolution en prop aurait supposé de la faire descendre à
 * travers toute la chaîne : d'où le contexte plutôt qu'une prop.
 */
import { createContext, useContext } from 'react';

/** Page qui détient l'intégralité du contenu du guide. */
export const HUB_PATH = '/guide-declarations';

/* ---------------------------------------------------------------------------
 * Fabriques d'ancres — un id métier vers l'ancre DOM correspondante.
 * Ces quatre conventions sont celles rendues par les sections du guide
 * (CaseopediaSection, TopQuestionsSection, GlossaireSection,
 * FichesPratiquesSection). Les changer ici casserait les liens entrants
 * existants : 18 liens du blog et des pages pointent déjà dessus.
 * ------------------------------------------------------------------------- */

export const ficheAnchor = (ficheId: string) => ficheId;
export const questionAnchor = (questionId: string) => `question-${questionId}`;
export const caseAnchor = (code: string) => `case-${code}`;
export const termAnchor = (termId: string) => `glossaire-term-${termId}`;

export type AnchorResolver = (anchor: string) => string;

/** Comportement historique : tout est sur la page courante. */
export const localResolver: AnchorResolver = (anchor) => `#${anchor}`;

/**
 * Résolution pour une page fille : local si l'ancre est rendue ici, sinon vers
 * le hub. `localAnchors` contient des ancres DÉJÀ construites (donc passées par
 * `caseAnchor`, `termAnchor`…), pas des ids métier.
 */
export function hubResolver(localAnchors: ReadonlySet<string>): AnchorResolver {
  return (anchor) => (localAnchors.has(anchor) ? `#${anchor}` : `${HUB_PATH}#${anchor}`);
}

export const AnchorResolverContext = createContext<AnchorResolver>(localResolver);

export const useAnchorResolver = (): AnchorResolver => useContext(AnchorResolverContext);
