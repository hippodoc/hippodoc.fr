import React from 'react';
import { Zap, Gem, Scale, HelpCircle, FileText, BookA, ArrowUpRight, ShieldCheck, Lightbulb, AlertTriangle } from 'lucide-react';
import { reglesOr, pepitesCachees, zonesGrises, questionsFAQ, caseopedia } from '@/data/boussoleData';
import { GLOSSAIRE_DECLARATIONS } from '@/data/glossaireDeclarationsData';
import {
  useAnchorResolver,
  ficheAnchor,
  questionAnchor,
  caseAnchor,
  termAnchor,
} from '@/lib/guide/anchors';

// =====================================================================
// Portage statique de src/pages/guide-declarations/components/CrossLinks.tsx
// (SPA source). Déviation volontaire : la source pilotait la navigation
// croisée via des `onClick` + un contexte React (CrossNavContext) qui
// levait l'état dans GuideDeclarationsBody (ouverture de fiche/case/
// question/terme + scroll). Cette page étant rendue 100 % statique (zéro
// JS hors îlot boussole), on remplace ces handlers par de simples ancres
// `<a href="#id">` — le scroll natif du navigateur + `scroll-behavior:
// smooth` (global.css) reproduit le même geste sans JavaScript. Les ids
// ciblés correspondent à ceux posés par les sections statiques du guide
// (case-CODE, regle-/pepite-/zone-ID, question-ID, glossaire-term-ID).
// =====================================================================

export type FicheRef = { id: string; titre: string; type: 'regle' | 'pepite' | 'zone-grise' };
export type QuestionRef = { id: string; question: string };
export type CaseRef = { code: string; nom: string; formulaire: string };
export type TermRef = { id: string; term: string };

export const FICHES_INDEX: Record<string, FicheRef> = (() => {
  const map: Record<string, FicheRef> = {};
  for (const r of reglesOr) map[`regle-${r.id}`] = { id: `regle-${r.id}`, titre: r.titre, type: 'regle' };
  for (const p of pepitesCachees) map[`pepite-${p.id}`] = { id: `pepite-${p.id}`, titre: p.titre, type: 'pepite' };
  for (const z of zonesGrises) map[`zone-${z.id}`] = { id: `zone-${z.id}`, titre: z.sujet, type: 'zone-grise' };
  return map;
})();

export const QUESTIONS_INDEX: Record<string, QuestionRef> = (() => {
  const map: Record<string, QuestionRef> = {};
  for (const q of questionsFAQ) map[q.id] = { id: q.id, question: q.question };
  return map;
})();

export const CASES_INDEX: Record<string, CaseRef> = (() => {
  const map: Record<string, CaseRef> = {};
  for (const c of caseopedia) map[c.code] = { code: c.code, nom: c.nom, formulaire: c.formulaire };
  return map;
})();

// Index secondaire : résolution par id interne (ex: "CASE-006" → entrée DSAV)
export const CASES_BY_ID: Record<string, CaseRef> = (() => {
  const map: Record<string, CaseRef> = {};
  for (const c of caseopedia) map[c.id] = { code: c.code, nom: c.nom, formulaire: c.formulaire };
  return map;
})();

export const TERMS_INDEX: Record<string, TermRef> = (() => {
  const map: Record<string, TermRef> = {};
  for (const t of GLOSSAIRE_DECLARATIONS) map[t.id] = { id: t.id, term: t.term };
  return map;
})();

// Résout un id/code métier vers l'ancre DOM statique correspondante.
/** @deprecated Conservés pour compatibilité : préférer `useAnchorResolver()`
 *  + les fabriques d'ancres, qui savent viser le hub depuis une page fille. */
export const ficheHref = (ficheId: string) => `#${ficheAnchor(ficheId)}`;
export const questionHref = (questionId: string) => `#${questionAnchor(questionId)}`;
export const caseHref = (code: string) => `#${caseAnchor(code)}`;
export const termHref = (termId: string) => `#${termAnchor(termId)}`;

// =====================================================================
// Styles de badges (cohérents avec GlossaireSection / TopQuestionsSection)
// DA 2026 (phase 5d, MIGRATION.md § 9.el) : toutes les références sont des
// pastilles ciel doux (guide.css, `.gd-ref`) ; l'icône dit le type.
// =====================================================================

export const FICHE_TYPE_STYLES: Record<FicheRef['type'], { icon: React.ElementType; label: string; className: string }> = {
  regle: { icon: Zap, label: "Règle d'or", className: 'regle' },
  pepite: { icon: Gem, label: 'Astuce', className: 'astuce' },
  'zone-grise': { icon: Scale, label: 'Débattu', className: 'debat' },
};

export const QUESTION_BADGE_CLASS = 'question';
export const CASE_BADGE_CLASS = 'case';
export const TERM_BADGE_CLASS = 'terme';

// =====================================================================
// Composant unique de rendu des liens croisés (Voir aussi)
// =====================================================================

interface CrossLinksProps {
  relatedFiches?: string[];
  relatedQuestions?: string[];
  relatedCases?: string[];
  relatedTerms?: string[];
  /** Affichage compact (utilisé dans les questions où la place est limitée). */
  compact?: boolean;
}

export const CrossLinks: React.FC<CrossLinksProps> = ({
  relatedFiches,
  relatedQuestions,
  relatedCases,
  relatedTerms,
  compact = false,
}) => {
  // Garde anti-doublon défensive : si un même ID est listé 2× par erreur humaine,
  // évite l'affichage en double + le warning React `key`.
  const fiches = Array.from(new Set(relatedFiches || [])).map(id => FICHES_INDEX[id]).filter(Boolean);
  const questions = Array.from(new Set(relatedQuestions || [])).map(id => QUESTIONS_INDEX[id]).filter(Boolean);
  const cases = Array.from(new Set(relatedCases || [])).map(c => CASES_INDEX[c]).filter(Boolean);
  const terms = Array.from(new Set(relatedTerms || [])).map(id => TERMS_INDEX[id]).filter(Boolean);

  const hasAny = fiches.length > 0 || questions.length > 0 || cases.length > 0 || terms.length > 0;
  const resolve = useAnchorResolver();
  if (!hasAny) return null;

  const Row: React.FC<{ label: string; children: React.ReactNode }> = ({ label, children }) =>
    compact ? (
      <div className="gd-voir">
        <span className="gd-voir-nom">{label}</span>
        {children}
      </div>
    ) : (
      <div>
        <div className="gd-sur petit">{label}</div>
        <div className="gd-refs">{children}</div>
      </div>
    );

  return (
    <div className={compact ? '' : 'gd-croises'}>
      {!compact && (
        <div className="gd-sur petit">Voir aussi</div>
      )}

      {fiches.length > 0 && (
        <Row label={compact ? 'Fiches :' : 'Fiches pratiques'}>
          {fiches.map(f => {
            const style = FICHE_TYPE_STYLES[f.type];
            const Icon = style.icon;
            return (
              <a
                key={f.id}
                href={resolve(ficheAnchor(f.id))}
                title={`${style.label} — ${f.titre}`}
                className={`gd-ref ${style.className}`}
              >
                <Icon className="gd-ic" />
                <span className="gd-ref-nom">{f.titre}</span>
              </a>
            );
          })}
        </Row>
      )}

      {questions.length > 0 && (
        <Row label={compact ? 'Questions :' : 'Questions FAQ'}>
          {questions.map(q => (
            <a
              key={q.id}
              href={resolve(questionAnchor(q.id))}
              title={q.question}
              className={`gd-ref ${QUESTION_BADGE_CLASS}`}
            >
              <HelpCircle className="gd-ic" />
              <span className="gd-ref-nom">{q.question}</span>
            </a>
          ))}
        </Row>
      )}

      {cases.length > 0 && (
        <Row label={compact ? 'Cases :' : 'Cases concernées'}>
          {cases.map(c => (
            <a
              key={c.code}
              href={resolve(caseAnchor(c.code))}
              title={`${c.code} — ${c.nom} (${c.formulaire})`}
              className={`gd-ref ${CASE_BADGE_CLASS}`}
            >
              <FileText className="gd-ic" />
              <span className="gd-code">{c.code}</span>
              <span className="gd-ref-nom court">— {c.nom}</span>
            </a>
          ))}
        </Row>
      )}

      {terms.length > 0 && (
        <Row label={compact ? 'Glossaire :' : 'Termes du glossaire'}>
          {terms.map(t => (
            <a
              key={t.id}
              href={resolve(termAnchor(t.id))}
              title={`Définition : ${t.term}`}
              className={`gd-ref ${TERM_BADGE_CLASS}`}
            >
              <BookA className="gd-ic" />
              <span className="gd-ref-nom">{t.term}</span>
            </a>
          ))}
        </Row>
      )}
    </div>
  );
};

// =====================================================================
// Référence inline cliquable — résout un code interne (RO-011, PC-014,
// ZG-008, QT-014, CASE-006) vers un chip court typé : « [icône] Type · libellé court ».
// Le titre complet est exposé en `title=` (tooltip natif au survol).
// Si le code est inconnu, on rend le token brut pour ne rien casser.
// =====================================================================

// Raccourcit un libellé long pour l'affichage inline.
// Coupe au premier séparateur structurant (`:`, ` — `, ` (`, `,`),
// sinon tronque à ~32 car. sur frontière de mot avec « … ».
export function shortenRefLabel(raw: string, max = 32): string {
  if (!raw) return '';
  // Coupe aux séparateurs structurants
  const cutMatch = raw.match(/^([^:—(,]+?)(?:\s*[:—(,]|$)/);
  let s = (cutMatch ? cutMatch[1] : raw).trim();
  if (s.length <= max) return s;
  // Tronque sur frontière de mot
  const sliced = s.slice(0, max);
  const lastSpace = sliced.lastIndexOf(' ');
  s = (lastSpace > max * 0.6 ? sliced.slice(0, lastSpace) : sliced).trimEnd();
  return s + '…';
}

const REF_TYPE_META = {
  regle:    { Icon: ShieldCheck,   typeLabel: "Règle d'or",    fullPrefix: "Règle d'or"     },
  pepite:   { Icon: Lightbulb,     typeLabel: 'Astuce',         fullPrefix: 'Astuce'         },
  zone:     { Icon: AlertTriangle, typeLabel: 'Sujet débattu', fullPrefix: 'Sujet débattu' },
  question: { Icon: HelpCircle,    typeLabel: 'Question',       fullPrefix: 'Question'       },
  case:     { Icon: FileText,      typeLabel: 'Case',           fullPrefix: 'Case'           },
} as const;

export const InlineRef: React.FC<{ token: string }> = ({ token }) => {
  const resolve = useAnchorResolver();
  let kind: keyof typeof REF_TYPE_META | null = null;
  let shortLabel = '';
  let fullTitle = '';
  let href = '';

  if (/^RO-\d{3}$/.test(token)) {
    const f = FICHES_INDEX[`regle-${token}`];
    if (f) { kind = 'regle'; shortLabel = shortenRefLabel(f.titre); fullTitle = f.titre; href = resolve(ficheAnchor(f.id)); }
  } else if (/^PC-\d{3}$/.test(token)) {
    const f = FICHES_INDEX[`pepite-${token}`];
    if (f) { kind = 'pepite'; shortLabel = shortenRefLabel(f.titre); fullTitle = f.titre; href = resolve(ficheAnchor(f.id)); }
  } else if (/^ZG-\d{3}$/.test(token)) {
    const f = FICHES_INDEX[`zone-${token}`];
    if (f) { kind = 'zone'; shortLabel = shortenRefLabel(f.titre); fullTitle = f.titre; href = resolve(ficheAnchor(f.id)); }
  } else if (/^QT-\d{3}$/.test(token)) {
    const q = QUESTIONS_INDEX[token];
    if (q) { kind = 'question'; shortLabel = shortenRefLabel(q.question); fullTitle = q.question; href = resolve(questionAnchor(q.id)); }
  } else if (/^CASE-\d{3}$/.test(token)) {
    const c = CASES_BY_ID[token];
    if (c) { kind = 'case'; shortLabel = c.code; fullTitle = `${c.code} — ${c.nom} (${c.formulaire})`; href = resolve(caseAnchor(c.code)); }
  }

  if (!kind) {
    return <>{token}</>;
  }

  const meta = REF_TYPE_META[kind];
  const Icon = meta.Icon;

  return (
    <a
      href={href}
      title={`${meta.fullPrefix} — ${fullTitle}`}
      className="gd-ref enligne"
    >
      <Icon className="gd-ic" aria-hidden="true" />
      <span className="gd-ref-type">{meta.typeLabel}</span>
      <span className="gd-ref-sep">·</span>
      <span>{shortLabel}</span>
      <ArrowUpRight className="gd-ic gd-ref-va" aria-hidden="true" />
    </a>
  );
};
