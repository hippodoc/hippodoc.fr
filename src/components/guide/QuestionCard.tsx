import React from 'react';
import type { QuestionReformule } from '@/data/boussoleData';
import { HelpCircle, ChevronDown } from 'lucide-react';
import { CertitudeBadge } from './CertitudeBadge';
import { FormattedText } from './FormattedText';
import { CrossLinks } from './CrossLinks';
import { questionAnchor } from '@/lib/guide/anchors';

/**
 * Carte d'une question, extraite telle quelle de `TopQuestionsSection` pour
 * être partagée entre le hub et les pages filles par profil.
 * Même contrat que `CaseCard` : balisage repris à l'identique, non-régression
 * du hub vérifiée par empreinte (MIGRATION.md § 9.ap).
 */
export const QuestionCard: React.FC<{ q: QuestionReformule }> = ({ q }) => (
  <details id={questionAnchor(q.id)} className="group border rounded-xl bg-white/80 backdrop-blur px-4 dark:bg-slate-800/50 dark:border-slate-700/60 scroll-mt-24">
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
);
