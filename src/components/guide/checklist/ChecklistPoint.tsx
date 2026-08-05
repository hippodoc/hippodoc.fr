import React from 'react';
import { AlertCircle, Info } from 'lucide-react';
import type { WizardPointType } from '@/data/boussoleData';
import { formatInline } from '../FormattedText';

// Taxonomie simplifiée : 2 styles uniquement.
// - alerte (critical+warning) : ce qui peut coûter cher si oublié
// - neutre (tip+info) : explications, contexte, optimisations
const isAlerte = (t: WizardPointType) => t === 'critical' || t === 'warning';

interface Props {
  type: WizardPointType;
  children: string;
}

export const ChecklistPoint: React.FC<Props> = ({ type, children }) => {
  const alerte = isAlerte(type);
  const Icon = alerte ? AlertCircle : Info;
  const cleaned = children.replace(/^[⚠️\s•·-]+/, '');
  const cls = alerte
    ? 'bg-red-50/60 dark:bg-red-950/20 border-red-200/60 dark:border-red-900/40'
    : 'bg-slate-50 dark:bg-slate-900/40 border-slate-200/60 dark:border-slate-700/60';
  const iconCls = alerte
    ? 'text-red-600 dark:text-red-400'
    : 'text-slate-500 dark:text-slate-400';
  const textCls = alerte
    ? 'text-red-900 dark:text-red-200'
    : 'text-slate-700 dark:text-slate-300';

  return (
    <div className={`flex items-start gap-2.5 p-2.5 rounded-md border ${cls}`}>
      <Icon className={`h-3.5 w-3.5 mt-0.5 shrink-0 ${iconCls}`} />
      <p className={`text-xs leading-relaxed ${textCls}`}>
        {formatInline(cleaned)}
      </p>
    </div>
  );
};
