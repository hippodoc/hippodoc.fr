import React, { useState, useMemo, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { ChevronRight, CheckCircle2, FileStack, UserCircle2 } from 'lucide-react';
import type { WizardResultGrouped, WizardCase } from '@/data/boussoleData';
import { reglesOr } from '@/data/boussoleData';
import { ChecklistSection } from './ChecklistSection';
import { scrollToCase } from './scrollToCase';
import { formatInline } from '../FormattedText';

interface Props {
  result: WizardResultGrouped;
}

const CHIPS_INITIAL = 8;

// Portage : framer-motion retiré (motion.div → div simple). Le reste de la
// logique (auto-scroll au montage, sections repliables, chips de cases…)
// est identique à la source.
export const ChecklistResult: React.FC<Props> = ({ result }) => {
  const { resume, sections, reglesPertinentes, conseilsProfil } = result;
  const sectionsCount = sections.length;
  // P4 : ne pas auto-ouvrir une section sans contenu visible immédiat (cases ou alertes)
  const hasVisibleContent = (i: number) => {
    const s = sections[i];
    if (!s) return false;
    const important = s.points.filter(p => p.type === 'critical' || p.type === 'warning').length;
    return s.cases.length > 0 || important > 0;
  };
  const isDefaultOpen = (i: number) => (sectionsCount <= 3 || i < 2) && hasVisibleContent(i);

  // Flatten all cases in display order (section order × case.ordre)
  const allCases: WizardCase[] = useMemo(
    () => sections.flatMap(s => [...s.cases].sort((a, b) => a.ordre - b.ordre)),
    [sections]
  );
  const [showAllChips, setShowAllChips] = useState(false);
  const visibleChips = showAllChips ? allCases : allCases.slice(0, CHIPS_INITIAL);
  const hiddenCount = allCases.length - visibleChips.length;

  // Auto-scroll au top de la checklist au montage (vers le bloc "En bref")
  const rootRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const t = setTimeout(() => {
      rootRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 50);
    return () => clearTimeout(t);
  }, []);

  return (
    <div
      ref={rootRef}
      className="space-y-4 scroll-mt-32"
      role="region"
      aria-live="polite"
      aria-label="Ta checklist personnalisée"
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-foreground flex items-center gap-2">
          <CheckCircle2 className="h-5 w-5 text-emerald-500" />
          Ta checklist personnalisée
        </h3>
      </div>

      {/* HERO — En bref (+ conseils profil repliés) */}
      <div className="rounded-xl bg-gradient-to-br from-hippo-50 via-white to-hippo-50/40 dark:from-hippo-950/30 dark:via-slate-900/40 dark:to-hippo-950/20 border border-hippo-200/60 dark:border-hippo-800/40 p-4 space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1.5 sm:gap-3">
          <p className="text-xs font-medium text-hippo-700 dark:text-hippo-300 uppercase tracking-wide">En bref</p>
          <div className="flex items-center gap-1.5 text-sm">
            <FileStack className="h-4 w-4 text-hippo-600 dark:text-hippo-400" />
            <span className="text-foreground">
              <strong className="font-semibold">{resume.cases}</strong> {resume.cases > 1 ? 'cases' : 'case'}
              {' '}sur <strong className="font-semibold">{resume.formulaires}</strong> {resume.formulaires > 1 ? 'formulaires' : 'formulaire'}
            </span>
          </div>
        </div>

        {allCases.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {visibleChips.map(c => (
              <button
                key={c.code}
                onClick={() => scrollToCase(c.code)}
                title={`${c.nom} — ${c.formulaire}`}
                className="font-mono font-semibold text-[11px] tracking-tight px-2 py-0.5 rounded-md bg-white/80 dark:bg-slate-900/60 border border-hippo-200/70 dark:border-hippo-800/50 text-hippo-700 dark:text-hippo-300 hover:bg-hippo-100 dark:hover:bg-hippo-900/40 hover:border-hippo-400 transition-colors"
              >
                {c.code}
              </button>
            ))}
            {hiddenCount > 0 && !showAllChips && (
              <button
                onClick={() => setShowAllChips(true)}
                className="text-[11px] px-2 py-0.5 rounded-md text-hippo-700 dark:text-hippo-300 hover:bg-hippo-100/60 dark:hover:bg-hippo-900/40 transition-colors"
              >
                +{hiddenCount}
              </button>
            )}
          </div>
        )}

        {conseilsProfil && (
          <details className="group border-t border-hippo-200/50 dark:border-hippo-800/40 pt-2.5">
            <summary className="cursor-pointer list-none flex items-start sm:items-center justify-between gap-2 text-sm">
              <span className="flex items-start sm:items-center gap-2 min-w-0 flex-1">
                <UserCircle2 className="h-4 w-4 text-hippo-600 dark:text-hippo-400 shrink-0 mt-0.5 sm:mt-0" />
                <span className="min-w-0 flex-1">
                  <span className="font-medium text-foreground">Conseils pour ton profil</span>
                  <span className="text-muted-foreground block sm:inline sm:ml-1 truncate">
                    <span className="hidden sm:inline">· </span>{conseilsProfil.nom}
                  </span>
                </span>
              </span>
              <ChevronRight className="h-3.5 w-3.5 text-muted-foreground transition-transform group-open:rotate-90 shrink-0 mt-1 sm:mt-0" />
            </summary>
            <ul className="mt-2.5 space-y-1.5">
              {conseilsProfil.conseils.map((c, i) => (
                <li key={i} className="text-sm text-foreground/90 flex items-start gap-2 leading-relaxed">
                  <span className="text-hippo-500 dark:text-hippo-400 mt-1.5 shrink-0">•</span>
                  <span>{formatInline(c)}</span>
                </li>
              ))}
            </ul>
          </details>
        )}
      </div>

      {/* Sections */}
      <div className="space-y-2.5">
        {sections.map((s, i) => (
          <ChecklistSection key={s.id} section={s} index={i} defaultOpen={isDefaultOpen(i)} />
        ))}
      </div>

      {/* Règles d'or condensées */}
      {reglesPertinentes.length > 0 && (
        <details className="group rounded-lg border border-slate-200/70 dark:border-slate-700/70 bg-slate-50/60 dark:bg-slate-900/40 px-3.5 py-2.5">
          <summary className="cursor-pointer text-xs font-medium text-muted-foreground uppercase tracking-wide flex items-center justify-between list-none">
            <span>Règles d'or à retenir ({reglesPertinentes.length})</span>
            <ChevronRight className="h-3.5 w-3.5 transition-transform group-open:rotate-90" />
          </summary>
          <ul className="mt-2.5 space-y-1.5">
            {reglesPertinentes.map(rId => {
              const r = reglesOr.find(x => x.id === rId);
              if (!r) return null;
              return (
                <li key={rId} className="text-xs text-muted-foreground flex items-start gap-2">
                  <CheckCircle2 className="h-3 w-3 text-emerald-500 mt-0.5 shrink-0" />
                  <span>{r.titre}</span>
                </li>
              );
            })}
          </ul>
        </details>
      )}

      {/* CTA */}
      <div className="flex flex-wrap gap-2 pt-1">
        <Button
          size="sm"
          onClick={() => document.getElementById('cases')?.scrollIntoView({ behavior: 'smooth' })}
          className="gap-1.5"
        >
          <span className="sm:hidden">Voir mes cases</span>
          <span className="hidden sm:inline">Voir mes cases en détail dans la page</span>
          <ChevronRight className="h-3.5 w-3.5" />
        </Button>
      </div>

      {/* Disclaimer */}
      <p className="text-[11px] text-muted-foreground italic leading-relaxed border-t border-slate-100 dark:border-slate-800 pt-3">
        Cette checklist est indicative et fondée sur les règles fiscales en vigueur. Elle ne remplace pas l'avis de ton AGA, expert-comptable ou des services fiscaux. En cas de doute, fais-toi accompagner.
      </p>
    </div>
  );
};
