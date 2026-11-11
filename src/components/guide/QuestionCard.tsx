import React from 'react';
import type { QuestionReformule } from '@/data/boussoleData';
import { HelpCircle } from 'lucide-react';
import { Croix } from './Croix';
import { CertitudeBadge } from './CertitudeBadge';
import { FormattedText } from './FormattedText';
import { CrossLinks } from './CrossLinks';
import { questionAnchor } from '@/lib/guide/anchors';

/**
 * Carte d'une question, extraite telle quelle de `TopQuestionsSection` pour
 * être partagée entre le hub et les pages filles par profil.
 * Même contrat que `CaseCard` : balisage repris à l'identique, non-régression
 * du hub vérifiée par empreinte (MIGRATION.md § 9.ap).
 * DA 2026 (phase 5d, MIGRATION.md § 9.el) : un pli `.qa` de la DA.
 */
export const QuestionCard: React.FC<{ q: QuestionReformule }> = ({ q }) => (
  <details id={questionAnchor(q.id)} className="qa gd-pli gd-question">
    <summary>
      <HelpCircle className="gd-ic" />
      <span className="qa-t">{q.question}</span>
      <Croix />
    </summary>
    <div className="gd-pli-in">
      <FormattedText text={q.reponse} className="gd-reponse" />
      <div className="gd-etiquettes">
        <CertitudeBadge level={q.certitude} />
        {q.tags.map(t => (
          <span
            key={t}
            className="gd-puce off"
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
