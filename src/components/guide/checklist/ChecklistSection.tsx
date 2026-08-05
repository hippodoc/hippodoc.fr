import React, { useState } from 'react';
import { ChevronDown, FileText, Shield, BadgePercent, Bell } from 'lucide-react';
import type { WizardSection } from '@/data/boussoleData';
import { ChecklistCase } from './ChecklistCase';
import { ChecklistPoint } from './ChecklistPoint';

const SECTION_ICONS = {
  fiscal: FileText,
  exonerations: BadgePercent,
  social: Shield,
  situations: Bell,
} as const;

const SECTION_ACCENT = {
  fiscal: 'text-hippo-600 dark:text-hippo-400',
  exonerations: 'text-amber-600 dark:text-amber-400',
  social: 'text-emerald-600 dark:text-emerald-400',
  situations: 'text-violet-600 dark:text-violet-400',
} as const;

interface Props {
  section: WizardSection;
  index: number;
  defaultOpen?: boolean;
}

// Portage : `motion.div` (fade/slide d'entrée) → `div` simple, `AnimatePresence`
// (hauteur animée à l'ouverture) → rendu conditionnel direct. Framer-motion est
// proscrit dans le code porté ; le confort visuel perdu est mineur (pas de
// transition de hauteur), le comportement (ouvrir/fermer) est intact.
export const ChecklistSection: React.FC<Props> = ({ section, index, defaultOpen = true }) => {
  const [open, setOpen] = useState(defaultOpen);
  const Icon = SECTION_ICONS[section.id];
  const accent = SECTION_ACCENT[section.id];
  const important = section.points.filter(p => p.type === 'critical' || p.type === 'warning');
  const secondary = section.points.filter(p => p.type === 'tip' || p.type === 'info');
  // Badge : nombre de cases CERFA à remplir uniquement (pas les alertes)
  const casesCount = section.cases.length;
  const SECONDARY_INLINE_THRESHOLD = 2;
  const inlineSecondary = secondary.length > 0 && secondary.length <= SECONDARY_INLINE_THRESHOLD;

  return (
    <div className="rounded-lg border border-slate-200/70 bg-white/60 dark:bg-slate-900/40 dark:border-slate-700/70 overflow-hidden backdrop-blur-sm">
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center gap-3 p-3.5 hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors"
      >
        <div className={`h-8 w-8 rounded-lg bg-slate-50 dark:bg-slate-800 flex items-center justify-center shrink-0 ${accent}`}>
          <Icon className="h-4 w-4" />
        </div>
        <div className="flex-1 text-left min-w-0">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-sm text-foreground">{section.titre}</span>
            {casesCount > 0 && (
              <span
                title={`${casesCount} case${casesCount > 1 ? 's' : ''} à remplir`}
                className="text-[10px] px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-muted-foreground font-medium"
              >
                {casesCount}
              </span>
            )}
          </div>
          <p className="text-xs text-muted-foreground mt-0.5">{section.sousTitre}</p>
        </div>
        {section.formulairePrincipal && (
          <span className="text-[10px] font-medium text-muted-foreground bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded hidden sm:inline">
            {section.formulairePrincipal}
          </span>
        )}
        <ChevronDown
          className={`h-4 w-4 text-muted-foreground transition-transform shrink-0 ${open ? 'rotate-180' : ''}`}
        />
      </button>

      {open && (
        <div className="p-3 pt-1 space-y-2 border-t border-slate-100 dark:border-slate-800">
          {section.cases.length > 0 && (
            <div className="space-y-1.5">
              {section.cases.map(c => (
                <ChecklistCase key={c.code} caseItem={c} />
              ))}
            </div>
          )}
          {important.length > 0 && (
            <div className="space-y-1.5 pt-1">
              {important.map((p, i) => (
                <ChecklistPoint key={`imp-${i}`} type={p.type}>{p.texte}</ChecklistPoint>
              ))}
            </div>
          )}
          {inlineSecondary && (
            <div className="space-y-1.5 pt-1">
              {secondary.map((p, i) => (
                <ChecklistPoint key={`sec-${i}`} type={p.type}>{p.texte}</ChecklistPoint>
              ))}
            </div>
          )}
          {!inlineSecondary && secondary.length > 0 && (
            <details className="group pt-1">
              <summary className="cursor-pointer list-none flex items-center gap-1.5 text-[11px] font-medium text-muted-foreground hover:text-foreground transition-colors px-1 py-1">
                <ChevronDown className="h-3 w-3 transition-transform group-open:rotate-0 -rotate-90" />
                <span>Bon à savoir ({secondary.length})</span>
              </summary>
              <div className="space-y-1.5 mt-1.5">
                {secondary.map((p, i) => (
                  <ChecklistPoint key={`sec-${i}`} type={p.type}>{p.texte}</ChecklistPoint>
                ))}
              </div>
            </details>
          )}
        </div>
      )}
    </div>
  );
};
