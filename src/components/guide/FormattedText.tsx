import React, { useMemo } from 'react';
import { AlertTriangle, CheckCircle2, Lightbulb } from 'lucide-react';
import { InlineRef } from './CrossLinks';

interface FormattedTextProps {
  text: string;
  className?: string;
  /** Smaller variant for examples/secondary content */
  variant?: 'default' | 'example' | 'glossary';
}

// Fiscal keywords to bold automatically
// ⚠️ Tous matchés avec lookarounds non-mot dans `combinedPattern` ci-dessous,
//    pour éviter qu'un token court (IR, PAS, IJ…) matche à l'intérieur d'un autre
//    mot (SIRET, dépassement, Fiji…). Ne PAS ajouter `\b` ici.
const FISCAL_KEYWORDS = [
  // Régimes fiscaux
  'micro-BNC', 'Micro-BNC', 'MICRO-BNC',
  'BNC réel', 'régime réel', 'BNC',
  // Organismes
  'URSSAF', 'CARMF', 'CPAM', 'CNOM', 'CDOM', 'Ameli', 'DGFiP',
  // Cadres légaux & doctrine
  'BOFiP', 'CGI', 'NGAP', 'CCAM', 'ARS',
  // Zonages & exonérations
  'ZIP', 'ZFU', 'ZFU-TE', 'ZFRR', 'ZRR',
  // Cases sociales DSFU / DS-PAMC
  'PAMC', 'RSPM', 'DSFU',
  'DSCS', 'DSAV', 'DSAU', 'DSAW', 'DSDE', 'DSCN', 'DSCZ',
  'DSDX', 'DSDC', 'DSEM', 'DSAT', 'DSDI', 'DSEC', 'DSSC', 'DSFA',
  // Identifiants pro
  'SIRET', 'SIREN', 'RPPS', 'ADELI', 'RIB', 'IBAN',
  // Statistiques & dispositifs
  'SNIR', 'ROSP', 'EHPAD', 'AGA', 'OGA', 'PDSA',
  // Plafonds & taxes
  'PASS', 'PAS', 'IR', 'CSG', 'CRDS', 'TVA', 'PFU', 'TMI', 'CFE', 'PRP',
  // Prévoyance & retraite
  'PER', 'Madelin', 'ANCV', 'ALD', 'AJPA', 'IJ', 'CAF', 'RCP',
  // Hors-nomenclature & secteur
  'HN',
  // Sociétés d'exercice
  'SEL', 'SELARL', 'SELAS', 'SELCA', 'SCM', 'SPFPL', 'SCI', 'EI',
  // Plateformes facturation électronique
  'PPF', 'PDP',
  // Lignes 2035 multi-lettres (les codes 2 lettres comme AA/BK seront traités en Phase 2)
  '2035-A', '2035-B', '2035-E', '2042-C',
  // Légal abrégé (Art. matché par regex dédiée plus bas)
  'LF ',
];

// Pattern dédié aux références d'articles : « Art. 102 ter », « Art. 261-4-1 », « Art. 194 »
const ARTICLE_PATTERN = /Art\. ?\d+(?:-\d+(?:-\d+)?)?(?:\s+(?:bis|ter|quater|quinquies))?/g;

// Phase 2 — Codes 2 lettres MAJ de la 2035 (AA, BK, DD, CP, CR, etc.)
// Uniquement quand introduits par un mot déclencheur (case/ligne/en/la),
// pour éviter les faux positifs type "OK", "TV", initiales aléatoires.
// Lookbehind ne consomme pas → match[0] = code 2 lettres seul.
const CASE_2L_PATTERN = /(?<=\b(?:case|cases|ligne|lignes|en|la)\s)[A-Z]{2}(?!\w)/g;

// Phase 3 — Statuts d'exercice & seuils-clés (notions métier, couleur distincte)
// Première lettre tolère MAJ ou min via [Xx] pour gérer les débuts de phrase.
// Lookarounds non-mot pour éviter match interne ("particulier", "transparente"…).
const CONTEXT_KEYWORDS = [
  // Statuts d'exercice
  '[Tt]itulaires?', '[Rr]emplaçant(?:e?s?)', '[Cc]ollaborat(?:eur|rice)s?',
  '[Ss]ecteur\\s[123]', '[Cc]abinet\\spropre', '[Cc]entres?\\smédica(?:l|ux)',
  // Seuils & notions fiscales
  '[Aa]battements?', '[Ee]xonérations?', '[Ee]xonéré(?:e?s?)',
  '[Pp]lafonds?', '[Pp]lafonné(?:e?s?)', '[Ff]ranchise',
  '[Ff]orfaits?', '[Qq]uotient\\sfamilial',
];
const contextPattern = `(?<![\\w-])(?:${CONTEXT_KEYWORDS.join('|')})(?![\\w-])`;




// Patterns for case codes like 5HQ, 2035, 2042, etc.
const CASE_CODE_PATTERN = /\b(5[A-Z]{2}|20[34][25](?:-[A-Z]-?[A-Z]*)?|1[A-Z]{2})\b/g;

// Amounts pattern: numbers followed by €, %, jours, ans, mois
const AMOUNT_PATTERN = /(\d[\d\s,.]{0,15}(?:€|%|jours?|ans?|mois|jour\/an))/g;

// Quoted text pattern « ... »
const QUOTED_PATTERN = /(«\s.*?\s»)/g;

type Segment = {
  type: 'text' | 'warning' | 'tip' | 'check';
  content: string;
};

/** Split text on emoji markers into typed segments */
function splitOnMarkers(text: string): Segment[] {
  // Split on ⚠️, ✅, 💡 — keep the marker with the segment after it
  const parts = text.split(/(⚠️|✅|💡)/);
  const segments: Segment[] = [];
  
  let i = 0;
  while (i < parts.length) {
    const part = parts[i];
    if (part === '⚠️' || part === '✅' || part === '💡') {
      const type = part === '⚠️' ? 'warning' : part === '✅' ? 'check' : 'tip';
      const next = parts[i + 1] || '';
      segments.push({ type, content: next.trim() });
      i += 2;
    } else if (part.trim()) {
      segments.push({ type: 'text', content: part.trim() });
      i += 1;
    } else {
      i += 1;
    }
  }
  return segments;
}

/** Split a long text segment into sentences/paragraphs for readability */
function splitIntoParagraphs(text: string): string[] {
  // 1) Honor explicit \n\n paragraph breaks first (authoring intent wins).
  if (text.includes('\n')) {
    // Normalise CRLF + collapse 3+ newlines into a clean double break.
    const normalized = text.replace(/\r\n/g, '\n').replace(/\n{3,}/g, '\n\n');
    // Split on \n\n (hard breaks). Within each block, keep \n single — they'll be
    // treated as line breaks downstream (bullets, "Étape", etc.).
    return normalized.split(/\n{2,}/).map(s => s.trim()).filter(Boolean);
  }

  // 2) Legacy fallback: no explicit breaks → re-flow long text by sentence.
  if (text.length < 180) return [text];
  const sentences = text.split(/(?<=\.)\s+/);
  const paragraphs: string[] = [];
  let current = '';
  for (const s of sentences) {
    if (current.length + s.length > 250 && current.length > 80) {
      paragraphs.push(current.trim());
      current = s;
    } else {
      current += (current ? ' ' : '') + s;
    }
  }
  if (current.trim()) paragraphs.push(current.trim());
  return paragraphs;
}

/** Within a paragraph, split on single \n into typed lines (bullets / steps / plain). */
type Line = { kind: 'bullet' | 'plain'; content: string };
function splitParagraphLines(para: string): { hasBullets: boolean; lines: Line[] } {
  if (!para.includes('\n')) {
    return { hasBullets: false, lines: [{ kind: 'plain', content: para }] };
  }
  const rawLines = para.split('\n').map(l => l.trim()).filter(Boolean);
  const lines: Line[] = rawLines.map(l => {
    const m = l.match(/^[•\-]\s+(.*)$/);
    if (m) return { kind: 'bullet', content: m[1] };
    return { kind: 'plain', content: l };
  });
  const bulletCount = lines.filter(l => l.kind === 'bullet').length;
  return { hasBullets: bulletCount >= 2, lines };
}

/** Apply inline formatting: bold keywords, codes, amounts, quotes */
export function formatInline(text: string): React.ReactNode[] {
  // Build a combined regex for all bold-able patterns
  const keywordPattern = FISCAL_KEYWORDS.map(k => k.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|');
  const combinedPattern = new RegExp(
    `(\\*\\*[^*]+?\\*\\*)|` +           // group 1: **markdown bold**
    `(\\*(?!\\s)[^*\\n]+?(?<!\\s)\\*)|` + // group 2: *markdown italic* (no leading/trailing space)
    `(\`[^\`]+?\`)|` +                  // group 3: `inline code`
    `((?<![\\w-])(?:${keywordPattern})(?![\\w-]))|` +            // group 4: keywords (word-bounded)
    `(\\b(?:RO|PC|ZG|QT|CASE)-\\d{3}\\b)|` + // group 5b: internal cross-refs (rendered as InlineRef)
    `(\\b(?:5[A-Z]{2}|20[34][25](?:-[A-Z]-?[A-Z]*)?|1[A-Z]{2})\\b)|` + // group 6: case codes
    `(\\d[\\d\\s,.]{0,15}(?:€|%|jours?\\/an|jours?|ans?|mois))|` +       // group 7: amounts
    `(«\\s.*?\\s»)|` +                  // group 8: quoted
    `(${ARTICLE_PATTERN.source})|` +    // group 9: legal articles (Art. 102 ter, Art. 261-4-1…)
    `(${CASE_2L_PATTERN.source})|` +    // group 10: 2L 2035 codes (case AA, ligne BK…)
    `(${contextPattern})`,              // group 11: context keywords (statuts, seuils — couleur hippo)
    'g'
  );


  const parts: React.ReactNode[] = [];
  let lastIndex = 0;
  let match: RegExpExecArray | null;
  let key = 0;

  while ((match = combinedPattern.exec(text)) !== null) {
    // Add text before match
    if (match.index > lastIndex) {
      parts.push(text.slice(lastIndex, match.index));
    }
    
    const matched = match[0];
    if (match[1]) {
      // **markdown bold** — strip ** and bold
      const inner = matched.slice(2, -2);
      parts.push(
        <strong key={key++} className="font-semibold text-foreground">{inner}</strong>
      );
    } else if (match[2]) {
      // *markdown italic* — strip * and render italic
      const inner = matched.slice(1, -1);
      parts.push(
        <em key={key++} className="italic text-foreground">{inner}</em>
      );
    } else if (match[3]) {
      // `inline code` — strip backticks, render as discreet semibold (module names)
      const inner = matched.slice(1, -1);
      parts.push(
        <span key={key++} className="font-semibold text-hippo-700 dark:text-hippo-300">{inner}</span>
      );
    } else if (match[5]) {
      // Internal cross-ref (RO/PC/ZG/QT-NNN) — clickable inline chip with human title
      parts.push(<InlineRef key={key++} token={matched} />);
    } else if (match[8]) {
      // Quoted text — italic + slightly different style
      parts.push(
        <span key={key++} className="font-medium text-foreground italic">{matched}</span>
      );
    } else if (match[11]) {
      // Phase 3 — Statuts/seuils-clés : couleur hippo pour les distinguer des acronymes officiels
      parts.push(
        <strong key={key++} className="font-semibold text-hippo-700 dark:text-hippo-300">{matched}</strong>
      );
    } else {
      // Keywords, codes, amounts, articles, 2L 2035 — bold neutre
      parts.push(
        <strong key={key++} className="font-semibold text-foreground">{matched}</strong>
      );
    }
    lastIndex = match.index + matched.length;
  }

  if (lastIndex < text.length) {
    parts.push(text.slice(lastIndex));
  }

  return parts.length > 0 ? parts : [text];
}

/** Detect if a segment contains an enumeration pattern like "X : A, B, C, D" */
function detectEnumeration(text: string): { before: string; items: string[] } | null {
  // Pattern: "Something : item1, item2, item3 + item4" with at least 3 comma-separated items
  const match = text.match(/^(.*?\s*:\s*)([A-ZÀ-Ÿa-zà-ÿ0-9\s/()&''\-]+(?:,\s*[A-ZÀ-Ÿa-zà-ÿ0-9\s/()&''\-]+){2,}(?:\s*\+\s*[A-ZÀ-Ÿa-zà-ÿ0-9\s/()&''\-]+)*)\.?$/);
  if (match) {
    const items = match[2].split(/,\s*|\s*\+\s*/).map(s => s.trim()).filter(Boolean);
    if (items.length >= 3) {
      return { before: match[1], items };
    }
  }
  return null;
}

function WarningBlock({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex gap-2.5 p-2.5 rounded-lg bg-amber-50/80 border border-amber-200/60 dark:bg-amber-950/20 dark:border-amber-800/40">
      <AlertTriangle className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />
      <div className="text-xs text-amber-800 dark:text-amber-300 leading-relaxed">{children}</div>
    </div>
  );
}

function CheckBlock({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex gap-2.5 p-2.5 rounded-lg bg-emerald-50/80 border border-emerald-200/60 dark:bg-emerald-950/20 dark:border-emerald-800/40">
      <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
      <div className="text-xs text-emerald-800 dark:text-emerald-300 leading-relaxed">{children}</div>
    </div>
  );
}

function TipBlock({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex gap-2.5 p-2.5 rounded-lg bg-blue-50/80 border border-blue-200/60 dark:bg-blue-950/20 dark:border-blue-800/40">
      <Lightbulb className="h-4 w-4 text-blue-500 shrink-0 mt-0.5" />
      <div className="text-xs text-blue-800 dark:text-blue-300 leading-relaxed">{children}</div>
    </div>
  );
}

function renderSegment(segment: Segment, idx: number): React.ReactNode {
  const paragraphs = splitIntoParagraphs(segment.content);
  
  const rendered = paragraphs.map((para, pIdx) => {
    // Honor explicit \n inside paragraph: bullets / step lines / plain breaks.
    const { hasBullets, lines } = splitParagraphLines(para);

    if (hasBullets) {
      // Mix: render leading plain lines as <p>, group consecutive bullets in <ul>.
      const blocks: React.ReactNode[] = [];
      let bulletBuffer: string[] = [];
      const flushBullets = (key: string) => {
        if (bulletBuffer.length === 0) return;
        blocks.push(
          <ul key={`ul-${key}`} className="ml-1 space-y-1">
            {bulletBuffer.map((item, i) => (
              <li key={i} className="flex items-start gap-1.5">
                <span className="text-muted-foreground mt-px">•</span>
                <span>{formatInline(item)}</span>
              </li>
            ))}
          </ul>
        );
        bulletBuffer = [];
      };
      lines.forEach((l, i) => {
        if (l.kind === 'bullet') {
          bulletBuffer.push(l.content);
        } else {
          flushBullets(`b${i}`);
          blocks.push(<p key={`p-${i}`}>{formatInline(l.content)}</p>);
        }
      });
      flushBullets('end');
      return <div key={pIdx} className="space-y-1.5">{blocks}</div>;
    }

    if (lines.length > 1) {
      // Multiple lines without bullets → render each on its own paragraph (preserves "Étape 1/2/3").
      return (
        <div key={pIdx} className="space-y-1.5">
          {lines.map((l, i) => <p key={i}>{formatInline(l.content)}</p>)}
        </div>
      );
    }

    // Single-line paragraph: enumeration heuristic, then default.
    const enumResult = detectEnumeration(para);
    if (enumResult) {
      return (
        <div key={pIdx}>
          <span>{formatInline(enumResult.before)}</span>
          <ul className="mt-1 ml-4 space-y-0.5">
            {enumResult.items.map((item, i) => (
              <li key={i} className="flex items-start gap-1.5">
                <span className="text-muted-foreground mt-px">•</span>
                <span>{formatInline(item)}</span>
              </li>
            ))}
          </ul>
        </div>
      );
    }

    return <p key={pIdx}>{formatInline(para)}</p>;
  });

  const content = <div className="space-y-2">{rendered}</div>;

  switch (segment.type) {
    case 'warning':
      return <WarningBlock key={idx}>{content}</WarningBlock>;
    case 'check':
      return <CheckBlock key={idx}>{content}</CheckBlock>;
    case 'tip':
      return <TipBlock key={idx}>{content}</TipBlock>;
    default:
      return <div key={idx}>{content}</div>;
  }
}

export function FormattedText({ text, className, variant = 'default' }: FormattedTextProps) {
  const segments = useMemo(() => splitOnMarkers(text), [text]);

  const sizeClass = variant === 'example' 
    ? 'text-xs text-muted-foreground italic'
    : variant === 'glossary'
    ? 'text-xs text-foreground/80 leading-relaxed'
    : 'text-sm text-muted-foreground leading-relaxed';

  return (
    <div className={`space-y-2.5 ${sizeClass} ${className || ''}`}>
      {segments.map((seg, i) => renderSegment(seg, i))}
    </div>
  );
}
