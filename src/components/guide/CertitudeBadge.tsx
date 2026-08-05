import React from 'react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { CheckCircle, Users, AlertTriangle, HelpCircle, Bug, TrendingDown } from 'lucide-react';
import type { CertitudeLevel } from '@/data/boussoleData';

const config: Record<CertitudeLevel, { label: string; className: string; icon: React.ElementType }> = {
  confirmed: { label: 'Confirmé', className: 'bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-300', icon: CheckCircle },
  consensus: { label: 'Consensus terrain', className: 'bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-300', icon: Users },
  to_verify: { label: 'À vérifier', className: 'bg-orange-100 text-orange-700 border-orange-200 dark:bg-orange-900/30 dark:text-orange-300', icon: AlertTriangle },
  grey_zone: { label: 'Zone grise', className: 'bg-slate-100 text-muted-foreground border-slate-200 dark:bg-slate-800 dark:text-slate-300', icon: HelpCircle },
  bug: { label: 'Bug fréquent', className: 'bg-red-100 text-red-700 border-red-200 dark:bg-red-900/30 dark:text-red-300', icon: Bug },
  trap: { label: 'Piège coûteux', className: 'bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-900/30 dark:text-amber-300', icon: TrendingDown },
};

interface Props {
  level: CertitudeLevel;
  className?: string;
}

export function CertitudeBadge({ level, className }: Props) {
  const c = config[level];
  const Icon = c.icon;
  return (
    <Badge variant="outline" className={cn('text-[11px] font-medium gap-1', c.className, className)}>
      <Icon className="h-3 w-3" /> {c.label}
    </Badge>
  );
}
