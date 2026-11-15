import React from 'react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { CheckCircle, Users, AlertTriangle, HelpCircle, Bug, TrendingDown } from 'lucide-react';
import type { CertitudeLevel } from '@/data/boussoleData';

const config: Record<CertitudeLevel, { label: string; className: string; icon: React.ElementType }> = {
  // DA 2026 (§ 9.el) : les jetons d'état de la DA (guide.css, `.gd-puce`).
  confirmed: { label: 'Confirmé', className: 'ok', icon: CheckCircle },
  consensus: { label: 'Consensus terrain', className: 'plan', icon: Users },
  to_verify: { label: 'À vérifier', className: 'wait', icon: AlertTriangle },
  grey_zone: { label: 'Zone grise', className: 'off', icon: HelpCircle },
  bug: { label: 'Bug fréquent', className: 'stop', icon: Bug },
  trap: { label: 'Piège coûteux', className: 'wait', icon: TrendingDown },
};

interface Props {
  level: CertitudeLevel;
  className?: string;
}

export function CertitudeBadge({ level, className }: Props) {
  const c = config[level];
  const Icon = c.icon;
  return (
    <Badge variant="outline" className={cn('gd-puce', c.className, className)}>
      <Icon className="gd-ic" /> {c.label}
    </Badge>
  );
}
