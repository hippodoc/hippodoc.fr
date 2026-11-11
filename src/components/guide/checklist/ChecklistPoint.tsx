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
  // DA 2026 (§ 9.el) : un encart d'alerte, ou un encart ciel doux (guide.css).
  const cls = alerte ? 'stop' : '';

  return (
    <div className={`gd-encart gd-cl-point ${cls}`}>
      <Icon className="gd-ic" />
      <p>
        {formatInline(cleaned)}
      </p>
    </div>
  );
};
