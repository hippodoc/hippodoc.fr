import React from 'react';
import { ChevronRight } from 'lucide-react';
import type { WizardCase } from '@/data/boussoleData';
import { scrollToCase } from './scrollToCase';

interface Props {
  caseItem: WizardCase;
}

export const ChecklistCase: React.FC<Props> = ({ caseItem }) => {
  const handleClick = () => scrollToCase(caseItem.code);

  return (
    <button
      onClick={handleClick}
      className="group w-full flex items-center gap-3 p-2.5 rounded-md bg-white border border-slate-200/70 hover:border-hippo-300 hover:bg-hippo-50/40 transition-all dark:bg-slate-900/60 dark:border-slate-700 dark:hover:border-hippo-600 dark:hover:bg-hippo-950/30"
    >
      <span className="font-mono font-bold text-hippo-600 dark:text-hippo-400 text-sm tracking-tight w-10 sm:w-12 text-left shrink-0">
        {caseItem.code}
      </span>
      <span className="text-sm text-foreground text-left flex-1">{caseItem.nom}</span>
      <span className="text-[10px] text-muted-foreground font-medium hidden sm:inline">{caseItem.formulaire}</span>
      <ChevronRight className="h-3.5 w-3.5 text-muted-foreground group-hover:text-hippo-500 transition-colors shrink-0" />
    </button>
  );
};
