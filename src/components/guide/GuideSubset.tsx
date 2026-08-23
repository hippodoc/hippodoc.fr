import React from 'react';
import { caseopedia, questionsFAQ } from '@/data/boussoleData';
import { CaseCard } from './CaseCard';
import { QuestionCard } from './QuestionCard';
import { FormattedText } from './FormattedText';
import {
  AnchorResolverContext,
  hubResolver,
  caseAnchor,
  questionAnchor,
} from '@/lib/guide/anchors';

/**
 * Rend un sous-ensemble du contenu du guide sur une page fille.
 *
 * `subset` décrit TOUT ce que la page affiche, `codes` / `ids` ce que CET appel
 * affiche — ce qui permet de découper une page en plusieurs groupes titrés sans
 * casser la résolution des ancres. Une référence croisée vers un item présent
 * quelque part sur la page reste locale ; toute autre part vers le hub, qui
 * détient l'intégralité du contenu. Sans ça, les liens « Voir aussi »
 * pointeraient dans le vide hors du hub (cf. `src/lib/guide/anchors.ts`).
 *
 * Astro en fait des arbres React distincts : chacun pose donc son Provider.
 * Aucune directive `client:` — rendu au build, zéro JS, comme le hub.
 */

export interface GuideSubset {
  /** Tous les codes de cases affichés sur la page. */
  caseCodes?: string[];
  /** Tous les ids de questions affichés sur la page. */
  questionIds?: string[];
}

function useSubsetResolver({ caseCodes = [], questionIds = [] }: GuideSubset) {
  const key = `${caseCodes.join('|')}//${questionIds.join('|')}`;
  return React.useMemo(() => {
    const local = new Set<string>([
      ...caseCodes.map(caseAnchor),
      ...questionIds.map(questionAnchor),
    ]);
    return hubResolver(local);
  }, [key]);
}

/**
 * Cases dans l'ordre demandé. Un code inconnu est ignoré silencieusement : une
 * coquille dans une liste de codes ne doit jamais casser la page — elle se voit
 * au compte affiché dans le titre de section.
 */
export const GuideCaseGrid: React.FC<{ subset: GuideSubset; codes: string[] }> = ({ subset, codes }) => {
  const resolve = useSubsetResolver(subset);
  const cases = codes
    .map(code => caseopedia.find(c => c.code === code))
    .filter((c): c is NonNullable<typeof c> => Boolean(c));

  if (cases.length === 0) return null;

  return (
    <AnchorResolverContext.Provider value={resolve}>
      <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
        {cases.map(c => <CaseCard key={c.id} c={c} />)}
      </div>
    </AnchorResolverContext.Provider>
  );
};

/**
 * Conseils clés d'un profil. Passe par `FormattedText` parce que ces textes
 * portent du gras et des références inline (RO-011, CASE-006…) que `InlineRef`
 * résout en liens — d'où le Provider, sans lequel ces liens sortiraient nus.
 */
export const GuideConseils: React.FC<{ subset: GuideSubset; conseils: string[] }> = ({ subset, conseils }) => {
  const resolve = useSubsetResolver(subset);
  if (conseils.length === 0) return null;

  return (
    <AnchorResolverContext.Provider value={resolve}>
      <ul className="space-y-3">
        {conseils.map((c, i) => (
          <li key={i} className="flex gap-3 rounded-xl border border-slate-200/60 bg-white/80 p-4 dark:border-slate-700/60 dark:bg-slate-800/50">
            <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-hippo-100 text-[11px] font-bold text-hippo-700 dark:bg-hippo-900/50 dark:text-hippo-300">
              {i + 1}
            </span>
            <div className="min-w-0 flex-1 text-sm text-muted-foreground">
              <FormattedText text={c} />
            </div>
          </li>
        ))}
      </ul>
    </AnchorResolverContext.Provider>
  );
};

/** Questions dans l'ordre demandé, même contrat que ci-dessus. */
export const GuideQuestionList: React.FC<{ subset: GuideSubset; ids: string[] }> = ({ subset, ids }) => {
  const resolve = useSubsetResolver(subset);
  const questions = ids
    .map(id => questionsFAQ.find(q => q.id === id))
    .filter((q): q is NonNullable<typeof q> => Boolean(q));

  if (questions.length === 0) return null;

  return (
    <AnchorResolverContext.Provider value={resolve}>
      <div className="space-y-2">
        {questions.map(q => <QuestionCard key={q.id} q={q} />)}
      </div>
    </AnchorResolverContext.Provider>
  );
};
