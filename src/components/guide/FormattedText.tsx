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
// Le suffixe ne se prend que s'il est un mot entier : « Art. 163 quatervicies » ne donne
// pas « Art. 163 quater » + « vicies ».
const ARTICLE_PATTERN = /Art\. ?\d+(?:-\d+(?:-\d+)?)?(?:\s+(?:bis|ter|quater|quinquies)(?![\p{L}\p{N}_]))?/gu;

// Phase 2 — Codes 2 lettres MAJ de la 2035 (AA, BK, DD, CP, CR, etc.)
// Uniquement quand introduits par un mot déclencheur (case/ligne/en/la),
// pour éviter les faux positifs type "OK", "TV", initiales aléatoires.
// Lookbehind ne consomme pas → match[0] = code 2 lettres seul.
// Bornes en \p{L} et non \w / \b : en JS ces deux-là ignorent les lettres accentuées
// (« la TRÈS » donnait « TR » en gras).
const CASE_2L_PATTERN = /(?<=(?<![\p{L}\p{N}_])(?:case|cases|ligne|lignes|en|la)\s)[A-Z]{2}(?![\p{L}\p{N}_])/gu;

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
const contextPattern = `(?<![\\p{L}\\p{N}_-])(?:${CONTEXT_KEYWORDS.join('|')})(?![\\p{L}\\p{N}_-])`;




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

/**
 * Un gras `**…**` peut enjamber un point de découpe (émoji marqueur, fin de phrase,
 * saut de ligne). Chaque morceau est alors refermé, et le suivant rouvert, pour que les
 * paires restent appariées dans chaque morceau — sinon tout le gras de la suite s'inverse
 * et des astérisques sortent tels quels.
 */
function equilibrerGras(morceaux: string[]): string[] {
  let ouvert = false;
  return morceaux.map((m) => {
    const rouvert = ouvert;
    let out = rouvert ? `**${m}` : m;
    ouvert = (out.match(/\*\*/g) || []).length % 2 === 1;
    if (ouvert) out += '**';
    // Un gras que l'on vient de rouvrir ou de refermer peut être vide (« ** » seul avant
    // un marqueur, par exemple) : il ne rend rien. Ne pas toucher aux autres « ** ** »,
    // qui sont une fermeture suivie d'une ouverture.
    if (rouvert) out = out.replace(/^\*\*\s*\*\*/, '');
    if (ouvert) out = out.replace(/\*\*\s*\*\*$/, '');
    return out.trim();
  });
}

/** Split text on emoji markers into typed segments */
function splitOnMarkers(text: string): Segment[] {
  // Split on ⚠️, ✅, 💡 — keep the marker with the segment after it
  const brut = text.split(/(⚠️|✅|💡)/);
  // Indices pairs = texte, impairs = marqueurs : on n'équilibre que le texte.
  const textes = equilibrerGras(brut.filter((_, k) => k % 2 === 0).map((t) => t.trim()));
  const parts = brut.map((t, k) => (k % 2 === 0 ? textes[k / 2] : t));
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
    return equilibrerGras(normalized.split(/\n{2,}/).map(s => s.trim())).filter(Boolean);
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
  return equilibrerGras(paragraphs).filter(Boolean);
}

/** Within a paragraph, split on single \n into typed lines (bullets / steps / plain). */
type Line = { kind: 'bullet' | 'plain'; content: string };
function splitParagraphLines(para: string): { hasBullets: boolean; lines: Line[] } {
  if (!para.includes('\n')) {
    return { hasBullets: false, lines: [{ kind: 'plain', content: para }] };
  }
  const rawLines = para.split('\n').map(l => l.trim()).filter(Boolean);
  const typed: Line[] = rawLines.map(l => {
    const m = l.match(/^[•\-]\s+(.*)$/);
    if (m) return { kind: 'bullet', content: m[1] };
    return { kind: 'plain', content: l };
  });
  const contenus = equilibrerGras(typed.map(l => l.content));
  const lines: Line[] = typed.map((l, i) => ({ ...l, content: contenus[i] }));
  const bulletCount = lines.filter(l => l.kind === 'bullet').length;
  return { hasBullets: bulletCount >= 2, lines };
}

// Bornes de mot en \p{L} (drapeau `u`) : `\w` et `\b` ne connaissent pas les lettres
// accentuées, d'où un terme reconnu au milieu d'un mot (« 6 an » dans « 6 années »).
const MOT = '[\\p{L}\\p{N}_]';
const keywordPattern = FISCAL_KEYWORDS.map(k => k.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|');

// Passe 1 — balisage écrit par l'auteur : **gras**, *italique*, `code`.
const MARKDOWN_PATTERN = /\*\*([^*]+?)\*\*|\*(?!\s)([^*\n]+?)(?<!\s)\*|`([^`]+?)`/g;

// Passe 2 — termes mis en avant d'office, cherchés sur le texte SANS son balisage.
const AUTO_PATTERN = new RegExp(
  `((?<![\\p{L}\\p{N}_-])(?:${keywordPattern})(?![\\p{L}\\p{N}_-]))|` + // 1: keywords (word-bounded)
  `((?<!${MOT})(?:RO|PC|ZG|QT|CASE)-\\d{3}(?!${MOT}))|` +                // 2: internal cross-refs (InlineRef)
  `((?<!${MOT})(?:5[A-Z]{2}|20[34][25](?:-[A-Z]-?[A-Z]*)?|1[A-Z]{2})(?!${MOT}))|` + // 3: case codes
  `(\\d[\\d\\s,.]{0,15}(?:€|%|(?:jours?\\/an|jours?|ans?|mois)(?!${MOT})))|` +     // 4: amounts
  `(«\\s.*?\\s»)|` +                  // 5: quoted
  `(${ARTICLE_PATTERN.source})|` +    // 6: legal articles (Art. 102 ter, Art. 261-4-1…)
  `(${CASE_2L_PATTERN.source})|` +    // 7: 2L 2035 codes (case AA, ligne BK…)
  `(${contextPattern})`,              // 8: context keywords (statuts, seuils — couleur hippo)
  'gu'
);

type Marque = { start: number; end: number; type: 'bold' | 'italic' | 'code' };
type Auto = { start: number; end: number; group: number };

/**
 * Apply inline formatting: bold keywords, codes, amounts, quotes.
 *
 * Deux passes, pour que le balisage de l'auteur et les termes mis en avant d'office ne
 * se marchent pas dessus (avant : une seule expression, où une citation « … » contenant
 * un `**gras**` l'avalait et laissait ses astérisques dans la page) :
 *  1. on retire le balisage en notant où il s'appliquait ;
 *  2. on cherche les termes sur le texte nu. Un terme situé dans un gras, un italique ou
 *     un code de l'auteur y reste fondu (comme avant) ; un terme qui contient du balisage
 *     (une citation) le rend à l'intérieur ; un terme à cheval sur une borne est ignoré.
 */
export function formatInline(text: string, options: { auto?: boolean } = {}): React.ReactNode[] {
  // `auto: false` : seul le balisage de l'auteur est rendu, sans termes mis en gras d'office.
  const { auto = true } = options;
  // Passe 1
  let plain = '';
  const marques: Marque[] = [];
  let last = 0;
  for (const m of text.matchAll(MARKDOWN_PATTERN)) {
    plain += text.slice(last, m.index);
    const inner = m[1] ?? m[2] ?? m[3];
    marques.push({
      start: plain.length,
      end: plain.length + inner.length,
      type: m[1] !== undefined ? 'bold' : m[2] !== undefined ? 'italic' : 'code',
    });
    plain += inner;
    last = m.index! + m[0].length;
  }
  plain += text.slice(last);

  // Passe 2
  const autos: Auto[] = [];
  for (const m of auto ? plain.matchAll(AUTO_PATTERN) : []) {
    const start = m.index!;
    const end = start + m[0].length;
    const gene = marques.some(k => {
      if (k.end <= start || k.start >= end) return false; // disjoints
      if (k.start === start && k.end === end) return true; // même étendue : l'auteur l'emporte
      return !(k.start >= start && k.end <= end);        // la marque n'est pas dans le terme
    });
    if (!gene) autos.push({ start, end, group: m.findIndex((g, i) => i > 0 && g !== undefined) });
  }

  let key = 0;
  const rendreMarque = (k: Marque): React.ReactNode => {
    const inner = plain.slice(k.start, k.end);
    if (k.type === 'bold') return <strong key={key++} className="font-semibold text-foreground">{inner}</strong>;
    if (k.type === 'italic') return <em key={key++} className="italic text-foreground">{inner}</em>;
    // `inline code` — discreet semibold (module names)
    return <span key={key++} className="font-semibold text-hippo-700 dark:text-hippo-300">{inner}</span>;
  };

  const rendreAuto = (a: Auto): React.ReactNode => {
    const matched = plain.slice(a.start, a.end);
    // Internal cross-ref (RO/PC/ZG/QT-NNN) — clickable inline chip with human title
    if (a.group === 2) return <InlineRef key={key++} token={matched} />;
    if (a.group === 5) {
      // Quoted text — italic + slightly different style ; le balisage de l'auteur y reste rendu
      const enfants: React.ReactNode[] = [];
      let pos = a.start;
      for (const k of marques) {
        if (k.start < a.start || k.end > a.end) continue;
        if (k.start > pos) enfants.push(plain.slice(pos, k.start));
        enfants.push(rendreMarque(k));
        pos = k.end;
      }
      if (pos < a.end) enfants.push(plain.slice(pos, a.end));
      return <span key={key++} className="font-medium text-foreground italic">{enfants}</span>;
    }
    if (a.group === 8) {
      // Phase 3 — Statuts/seuils-clés : couleur hippo pour les distinguer des acronymes officiels
      return <strong key={key++} className="font-semibold text-hippo-700 dark:text-hippo-300">{matched}</strong>;
    }
    // Keywords, codes, amounts, articles, 2L 2035 — bold neutre
    return <strong key={key++} className="font-semibold text-foreground">{matched}</strong>;
  };

  // Les marques contenues dans un terme sont rendues par lui.
  const dehors = marques.filter(k => !autos.some(a => k.start >= a.start && k.end <= a.end));
  const items = [
    ...dehors.map(k => ({ start: k.start, end: k.end, node: () => rendreMarque(k) })),
    ...autos.map(a => ({ start: a.start, end: a.end, node: () => rendreAuto(a) })),
  ].sort((x, y) => x.start - y.start);

  const parts: React.ReactNode[] = [];
  let lastIndex = 0;
  for (const it of items) {
    if (it.start > lastIndex) parts.push(plain.slice(lastIndex, it.start));
    parts.push(it.node());
    lastIndex = it.end;
  }
  if (lastIndex < plain.length) parts.push(plain.slice(lastIndex));

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
