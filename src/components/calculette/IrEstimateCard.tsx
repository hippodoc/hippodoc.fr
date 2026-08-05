import React, { useMemo, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Calculator, ChevronDown, Info } from 'lucide-react';
import { calculateTaxWithPlafonnement, applyDecote, getTMI } from '@/lib/baremes-ir';
import { trackEvent } from '@/lib/analytics';

const fmt = (n: number): string =>
  new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(n);

const PARTS_OPTIONS = [
  { value: '1', label: '1 part — célibataire' },
  { value: '1.5', label: '1,5 part — célibataire + 1 enfant' },
  { value: '2', label: '2 parts — couple marié/pacsé sans enfant' },
  { value: '2.5', label: '2,5 parts — couple + 1 enfant' },
  { value: '3', label: '3 parts — couple + 2 enfants' },
  { value: '4', label: '4 parts — couple + 3 enfants' },
];

interface IrEstimateCardProps {
  beneficeImposable: number;
  annee: number;
}

/**
 * Encart opt-in d'estimation indicative de l'IR à partir du seul bénéfice
 * imposable BNC calculé par la calculette. Pas de salaire, pas de conjoint,
 * pas de crédits — c'est volontairement simple. Pour un calcul complet,
 * l'utilisateur est renvoyé vers /simulateur.
 */
export function IrEstimateCard({ beneficeImposable, annee }: IrEstimateCardProps) {
  const [open, setOpen] = useState(false);
  const [parts, setParts] = useState<string>('1');

  const partsNum = parseFloat(parts);
  const partsBase = partsNum >= 2 ? 2 : 1;

  const result = useMemo(() => {
    if (beneficeImposable <= 0) return null;
    const { impot } = calculateTaxWithPlafonnement(beneficeImposable, partsNum, partsBase, annee);
    const { impotApresDecote, decoteAppliquee } = applyDecote(impot, partsBase, annee);
    const tmi = getTMI(beneficeImposable / partsNum, annee);
    return { impot: impotApresDecote, decote: decoteAppliquee, tmi };
  }, [beneficeImposable, partsNum, partsBase, annee]);

  if (!result) return null;

  const handleToggle = (next: boolean) => {
    setOpen(next);
    if (next) trackEvent('calculette_ir_estimate_opened', { annee });
  };

  return (
    <Card className="bg-white dark:bg-slate-900/40 border border-[#e8ecf1] dark:border-violet-900/40 rounded-xl shadow-sm shadow-slate-100/50 dark:shadow-none overflow-hidden">
      <Collapsible open={open} onOpenChange={handleToggle}>
        <CollapsibleTrigger asChild>
          <button
            type="button"
            className="w-full flex items-center justify-between px-4 py-3 text-left hover:bg-violet-50/50 dark:hover:bg-violet-950/20 transition"
          >
            <div className="flex items-center gap-2">
              <Calculator className="h-4 w-4 text-violet-600 dark:text-violet-400" />
              <span className="text-sm font-semibold text-foreground">
                Estimation indicative de l'impôt sur le revenu
              </span>
              <span className="text-[10px] uppercase tracking-wide text-violet-700 dark:text-violet-300 bg-violet-100 dark:bg-violet-900/40 px-1.5 py-0.5 rounded">
                Optionnel
              </span>
            </div>
            <ChevronDown className={`h-4 w-4 text-muted-foreground transition-transform ${open ? 'rotate-180' : ''}`} />
          </button>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <CardContent className="pt-0 pb-4 px-4 space-y-3">
            <div className="flex items-center gap-3 flex-wrap">
              <Label htmlFor="ir-parts" className="text-xs text-muted-foreground shrink-0">
                Parts fiscales
              </Label>
              <Select value={parts} onValueChange={setParts}>
                <SelectTrigger id="ir-parts" className="h-8 text-xs w-[280px] max-w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {PARTS_OPTIONS.map(o => (
                    <SelectItem key={o.value} value={o.value} className="text-xs">{o.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="rounded-md bg-violet-50/60 dark:bg-violet-950/20 border border-violet-200/60 dark:border-violet-900/40 px-3 py-2.5 space-y-1 font-mono tabular-nums text-xs">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Bénéfice imposable</span>
                <span>{fmt(beneficeImposable)}</span>
              </div>
              {result.decote > 0 && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">− Décote</span>
                  <span>−{fmt(result.decote)}</span>
                </div>
              )}
              <div className="flex justify-between pt-1.5 mt-1.5 border-t border-violet-200/60 dark:border-violet-900/40 font-bold text-sm">
                <span className="text-violet-700 dark:text-violet-300">IR estimé</span>
                <span className="text-violet-700 dark:text-violet-300">{fmt(result.impot)}</span>
              </div>
              <div className="flex justify-between text-[11px] text-muted-foreground pt-0.5">
                <span>Tranche marginale (TMI)</span>
                <span>{(result.tmi * 100).toFixed(0)} %</span>
              </div>
            </div>

            <p className="text-[11px] text-muted-foreground leading-relaxed flex gap-1.5">
              <Info className="h-3.5 w-3.5 shrink-0 mt-0.5" />
              <span>
                Estimation à partir de tes seules cases 2035 / Micro-BNC. <strong>Ne tient pas compte</strong> de
                ton revenu salarié, conjoint, crédits/réductions d'impôt, foncier, PER/Madelin, etc.
                Pour un calcul complet, utilise le{' '}
                <a href="/simulateur" className="text-violet-700 dark:text-violet-300 hover:underline font-medium">
                  simulateur
                </a>.
              </span>
            </p>
          </CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
}
