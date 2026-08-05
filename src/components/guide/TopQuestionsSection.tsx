import React from 'react';
import { questionsFAQ, questionThemeLabels, type QuestionTheme } from '@/data/boussoleData';
import { CertitudeBadge } from './CertitudeBadge';
import { FormattedText } from './FormattedText';
import { CrossLinks } from './CrossLinks';
import { HelpCircle, ChevronDown } from 'lucide-react';

/**
 * Portage statique de TopQuestionsSection.tsx (SPA source). Déviations
 * volontaires (page 100 % statique, zéro JS hors îlot boussole) :
 *  - Recherche texte + filtre thème + filtre "questions hors profil" (JS,
 *    useState) → remplacés par un regroupement statique par thème
 *    (`questionThemeLabels`) ; toutes les questions restent visibles dans
 *    le HTML (couvert par la recherche globale — îlot `BoussoleSearchIsland`).
 *  - Accordéon Radix (`Accordion`) → `<details>/<summary>` natif.
 *  - Tags cliquables (filtrage par mot-clé) → badges statiques (texte
 *    conservé, plus de filtrage au clic puisque le filtre est retiré).
 */

export function TopQuestionsSection() {
  const themes = Object.keys(questionThemeLabels) as QuestionTheme[];
  const grouped = themes
    .map(theme => ({ theme, items: questionsFAQ.filter(q => q.theme === theme) }))
    .filter(g => g.items.length > 0);

  return (
    <section id="questions" className="py-12 md:py-16 scroll-mt-20">
      <div className="max-w-5xl mx-auto px-4">
        <div className="mb-8">
          <h2 className="text-2xl md:text-3xl font-bold text-foreground flex items-center gap-2">
            <HelpCircle className="h-7 w-7 text-hippo-500" /> Questions fréquentes
            <span className="text-base font-normal text-muted-foreground">({questionsFAQ.length})</span>
          </h2>
          <p className="text-muted-foreground mt-1">Les réponses aux questions les plus posées par les médecins libéraux</p>
        </div>

        <div className="space-y-8">
          {grouped.map(({ theme, items }) => (
            <div key={theme}>
              <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-3">
                {questionThemeLabels[theme]} <span className="opacity-60">({items.length})</span>
              </h3>
              <div className="space-y-2">
                {items.map(q => (
                  <details key={q.id} id={`question-${q.id}`} className="group border rounded-xl bg-white/80 backdrop-blur px-4 dark:bg-slate-800/50 dark:border-slate-700/60 scroll-mt-24">
                    <summary className="flex items-start gap-3 text-left text-sm font-medium py-4 cursor-pointer list-none">
                      <HelpCircle className="h-4 w-4 text-hippo-400 mt-0.5 shrink-0" />
                      <span className="text-foreground flex-1">{q.question}</span>
                      <ChevronDown className="h-4 w-4 text-muted-foreground transition-transform shrink-0 mt-0.5 group-open:rotate-180" />
                    </summary>
                    <div className="text-sm text-muted-foreground pb-4">
                      <FormattedText text={q.reponse} className="mb-3" />
                      <div className="flex items-center gap-2 flex-wrap">
                        <CertitudeBadge level={q.certitude} />
                        {q.tags.map(t => (
                          <span
                            key={t}
                            className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-slate-100 text-muted-foreground dark:bg-slate-700 dark:text-slate-400"
                          >
                            #{t}
                          </span>
                        ))}
                      </div>
                      <CrossLinks
                        relatedFiches={q.relatedFiches}
                        relatedQuestions={q.relatedQuestions}
                        relatedCases={q.relatedCases}
                        relatedTerms={q.relatedTerms}
                      />
                    </div>
                  </details>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
