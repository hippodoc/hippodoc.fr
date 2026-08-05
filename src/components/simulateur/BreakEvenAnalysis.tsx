import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Collapsible, CollapsibleTrigger, CollapsibleContent } from "@/components/ui/collapsible";
import { Scale, FileText, Calculator, Info, ArrowRight, ChevronDown } from "lucide-react";
import { PremiumTooltip } from "@/components/simulateur/PremiumTooltip";
import type { SimulateurFormData } from "./simulateurSchema";
import type { SimulationResult } from "@/lib/simulation-types";
import { abattement10Salaire } from "@/lib/baremes-ir";

interface BreakEvenAnalysisProps {
  formData: SimulateurFormData;
  reelResult: SimulationResult;
  microBncResult: SimulationResult | null;
  revenusSalariesAnnuels?: number;
  embedded?: boolean;
}

function BreakEvenContent({ formData, reelResult, microBncResult, revenusSalariesAnnuels = 0 }: Omit<BreakEvenAnalysisProps, 'embedded'>) {
  // Normalisation en annuel
  const recettesAnnuelles = formData.periode === 'mensuel' 
    ? formData.recettesBrutes * 12 
    : formData.recettesBrutes;

  // MICRO-BNC : Abattement forfaitaire 34% (SEULE déduction fiscale)
  const abattementMicro = recettesAnnuelles * 0.34;
  
  // RÉGIME RÉEL : Utiliser les données du moteur (inclut toutes les optimisations Phase 1/2/3)
  const cotisationsReel = reelResult.cotisationsTotales;
  const chargesProAnnuelles = reelResult.chargesReelles || (formData.periode === 'mensuel' 
    ? formData.chargesHorsCotisations * 12 
    : formData.chargesHorsCotisations);
  
  // Calculer le total déduit en réel : charges + cotisations + optimisations
  const optim = reelResult.optimisationsAppliquees;
  const optimisationsTotal = optim ? (
    (optim.forfait2pct || 0) +
    (optim.deductionsS1 || 0) +
    (optim.cotisationsVolontaires || 0) +
    (optim.exonerationZone || 0)
  ) : 0;
  
  const totalDeductionsReel = chargesProAnnuelles + cotisationsReel + optimisationsTotal;
  const pourcentageReel = recettesAnnuelles > 0 
    ? (totalDeductionsReel / recettesAnnuelles) * 100 
    : 0;

  // ✅ Utiliser les revenus imposables du moteur (déjà corrects)
  const beneficeImposableLiberalMicro = recettesAnnuelles - abattementMicro;
  const beneficeImposableLiberalReel = reelResult.impotDetails?.revenuImposableLiberal ?? (recettesAnnuelles - totalDeductionsReel);
  
  // Revenu salarié imposable — abattement 10 % year-aware (plancher 504 € / plafond 14 426 € en 2025-2026, Art. 83 CGI)
  const revenuSalarieImposable = reelResult.impotDetails?.revenuImposableSalarie ?? Math.max(0, revenusSalariesAnnuels - abattement10Salaire(revenusSalariesAnnuels, formData.annee || 2026));
  
  // Revenu imposable TOTAL (pour affichage pédagogique)
  const beneficeImposableMicro = beneficeImposableLiberalMicro + revenuSalarieImposable;
  const beneficeImposableReel = beneficeImposableLiberalReel + revenuSalarieImposable;

  // Différence
  const difference = abattementMicro - totalDeductionsReel;
  const microAvantage = difference > 0;
  const equilibre = Math.abs(difference) < 500;

  const formatMontant = (montant: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR',
      maximumFractionDigits: 0,
    }).format(montant);
  };

  return (
    <div className="space-y-5">
      {/* Explication pédagogique */}
      <p className="text-sm text-muted-foreground leading-relaxed">
        En <strong className="text-blue-600 dark:text-blue-400">Micro-BNC</strong>, l'État te donne automatiquement un abattement de 34%. 
        En <strong className="text-emerald-600 dark:text-emerald-400">Régime Réel</strong>, tu déduis tes vraies dépenses (charges + cotisations).
      </p>

      {/* Bloc pédagogique : C'est quoi "déduire" ? */}
      <div className="bg-slate-50/80 dark:bg-slate-900/40 border border-slate-200/50 dark:border-slate-700/40 rounded-xl p-3">
        <div className="flex items-start gap-2">
          <Info className="h-4 w-4 text-slate-500 mt-0.5 flex-shrink-0" />
          <div className="space-y-1">
            <p className="text-sm font-medium text-slate-700 dark:text-slate-200">
              Déduire, c'est quoi ?
            </p>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Ton impôt est calculé sur ton <strong>bénéfice imposable</strong> :
            </p>
            <div className="flex items-center gap-2 text-xs font-mono bg-white/60 dark:bg-slate-800/60 rounded-lg px-2 py-1.5 border border-slate-200/40 dark:border-slate-600/40">
              <span className="text-slate-700 dark:text-slate-200">CA</span>
              <span className="text-slate-400">−</span>
              <span className="text-hippo-600 dark:text-hippo-400">Déductions</span>
              <span className="text-slate-400">=</span>
              <span className="font-semibold text-slate-800 dark:text-slate-100">Imposable</span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Plus tu déduis → moins tu paies d'impôts
            </p>
          </div>
        </div>
      </div>

      {/* Comparaison en 2 colonnes */}
      <div 
        className="grid grid-cols-1 md:grid-cols-[1fr_auto_1fr] gap-3 md:gap-4 items-stretch"
      >
        {/* Colonne Micro-BNC */}
        <div 
          className="bg-blue-50/70 dark:bg-blue-950/30 border border-blue-200/50 dark:border-blue-800/40 rounded-xl p-4 space-y-3"
        >
          <div className="flex items-center gap-2 mb-3">
            <div className="p-1.5 rounded-lg bg-blue-100 dark:bg-blue-900/50">
              <FileText className="h-4 w-4 text-blue-600 dark:text-blue-400" />
            </div>
            <span className="font-semibold text-sm text-blue-900 dark:text-blue-100">MICRO-BNC</span>
          </div>
          
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm text-blue-700 dark:text-blue-300">Abattement 34%</span>
              <span className="font-semibold text-blue-900 dark:text-blue-100">{formatMontant(abattementMicro)}</span>
            </div>
            <p className="text-xs text-blue-600/70 dark:text-blue-400/70">(forfait automatique)</p>
          </div>
          
          <div className="border-t border-blue-200/50 dark:border-blue-700/50 pt-3 mt-3">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-blue-800 dark:text-blue-200">Total déduit</span>
              <div className="text-right">
                <span className="font-bold text-lg text-blue-900 dark:text-blue-100">{formatMontant(abattementMicro)}</span>
                <p className="text-xs text-blue-600 dark:text-blue-400">(34%)</p>
              </div>
            </div>
          </div>
          
          {/* Bénéfice imposable */}
          <div className="border-t border-blue-200/50 dark:border-blue-700/50 pt-2 mt-2">
            <div className="flex justify-between items-center">
              <span className="text-xs text-blue-600 dark:text-blue-400 flex items-center gap-1">
                <ArrowRight className="h-3 w-3" />
                Imposable
              </span>
              <span className="text-sm font-semibold text-blue-800 dark:text-blue-200">
                {formatMontant(beneficeImposableMicro)}
              </span>
            </div>
          </div>
        </div>

        {/* VS Central */}
        <div 
          className="hidden md:flex items-center justify-center"
        >
          <div className="w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 flex items-center justify-center">
            <span className="text-xs font-bold text-muted-foreground">VS</span>
          </div>
        </div>

        {/* Colonne Régime Réel */}
        <div 
          className="bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-200/50 dark:border-emerald-800/40 rounded-xl p-4 space-y-3"
        >
          <div className="flex items-center gap-2 mb-3">
            <div className="p-1.5 rounded-lg bg-emerald-100 dark:bg-emerald-900/50">
              <Calculator className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
            </div>
            <span className="font-semibold text-sm text-emerald-900 dark:text-emerald-100">RÉGIME RÉEL</span>
          </div>
          
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm text-emerald-700 dark:text-emerald-300">Charges pro</span>
              <span className="font-semibold text-emerald-900 dark:text-emerald-100">{formatMontant(chargesProAnnuelles)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-emerald-700 dark:text-emerald-300">+ Cotisations</span>
              <span className="font-semibold text-emerald-900 dark:text-emerald-100">{formatMontant(cotisationsReel)}</span>
            </div>
            {optim && optim.forfait2pct && optim.forfait2pct > 0 && (
              <div className="flex justify-between items-center">
                <span className="text-sm text-emerald-700 dark:text-emerald-300">+ Forfait 2%</span>
                <span className="font-semibold text-emerald-900 dark:text-emerald-100">{formatMontant(optim.forfait2pct)}</span>
              </div>
            )}
            {optim && optim.deductionsS1 && optim.deductionsS1 > 0 && (
              <div className="flex justify-between items-center">
                <span className="text-sm text-emerald-700 dark:text-emerald-300">+ Déductions S1</span>
                <span className="font-semibold text-emerald-900 dark:text-emerald-100">{formatMontant(optim.deductionsS1)}</span>
              </div>
            )}
            {optim && optim.cotisationsVolontaires && optim.cotisationsVolontaires > 0 && (
              <div className="flex justify-between items-center">
                <span className="text-sm text-emerald-700 dark:text-emerald-300">+ PER/Madelin</span>
                <span className="font-semibold text-emerald-900 dark:text-emerald-100">{formatMontant(optim.cotisationsVolontaires)}</span>
              </div>
            )}
            {optim && optim.exonerationZone && optim.exonerationZone > 0 && (
              <div className="flex justify-between items-center">
                <span className="text-sm text-emerald-700 dark:text-emerald-300">+ Zone ({Math.round((optim.tauxExonerationZone || 0) * 100)}%)</span>
                <span className="font-semibold text-emerald-900 dark:text-emerald-100">{formatMontant(optim.exonerationZone)}</span>
              </div>
            )}
          </div>
          
          <div className="border-t border-emerald-200/50 dark:border-emerald-700/50 pt-3 mt-3">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-emerald-800 dark:text-emerald-200">Total déduit</span>
              <div className="text-right">
                <span className="font-bold text-lg text-emerald-900 dark:text-emerald-100">{formatMontant(totalDeductionsReel)}</span>
                <p className="text-xs text-emerald-600 dark:text-emerald-400">({pourcentageReel.toFixed(1)}%)</p>
              </div>
            </div>
          </div>
          
          {/* Bénéfice imposable */}
          <div className="border-t border-emerald-200/50 dark:border-emerald-700/50 pt-2 mt-2">
            <div className="flex justify-between items-center">
              <span className="text-xs text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                <ArrowRight className="h-3 w-3" />
                Imposable
              </span>
              <span className="text-sm font-semibold text-emerald-800 dark:text-emerald-200">
                {formatMontant(beneficeImposableReel)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Message de conclusion */}
      <div>
        {equilibre ? (
          <div className="bg-amber-50/80 dark:bg-amber-950/30 border border-amber-200/50 dark:border-amber-800/40 rounded-xl p-4">
            <p className="text-sm font-medium text-amber-800 dark:text-amber-200 text-center">
              Les deux régimes sont quasi équivalents à ce niveau de charges
            </p>
          </div>
        ) : (
          <div className={`${
            microAvantage 
              ? 'bg-blue-50/80 dark:bg-blue-950/30 border-blue-200/50 dark:border-blue-800/40' 
              : 'bg-emerald-50/80 dark:bg-emerald-950/30 border-emerald-200/50 dark:border-emerald-800/40'
          } border rounded-xl p-4`}>
            <p className="text-sm font-medium text-center">
              <span className={microAvantage ? 'text-blue-800 dark:text-blue-200' : 'text-emerald-800 dark:text-emerald-200'}>
                Le {microAvantage ? 'Micro-BNC' : 'Régime Réel'} te fait déduire{' '}
                <strong>{formatMontant(Math.abs(difference))}</strong> de plus
              </span>
            </p>
            <p className="text-xs text-muted-foreground text-center mt-1">
              {microAvantage 
                ? 'Le forfait de 34% est plus avantageux que tes charges réelles'
                : 'Tes charges réelles dépassent le forfait de 34%'}
            </p>
          </div>
        )}
      </div>

      {/* Note pédagogique (uniquement si Micro-BNC avantageux) */}
      {microAvantage && !equilibre && (
        <div
          className="flex items-start gap-2 text-xs text-muted-foreground bg-muted/30 rounded-lg p-3"
        >
          <PremiumTooltip
            title="Note Micro-BNC"
            content={
              <p className="text-sm">
                En Micro-BNC, l'abattement de 34% est purement fiscal. Tu paies quand même tes charges réelles, 
                mais elles ne sont pas prises en compte pour le calcul de ton impôt.
              </p>
            }
          >
            <Info className="h-4 w-4 flex-shrink-0 mt-0.5 cursor-help text-hippo-500" />
          </PremiumTooltip>
          <p>
            <strong>À noter :</strong> En Micro-BNC, tu paies quand même tes charges réelles, 
            mais elles ne sont pas déduites fiscalement.
          </p>
        </div>
      )}
    </div>
  );
}

export function BreakEvenAnalysis({ formData, reelResult, microBncResult, revenusSalariesAnnuels = 0, embedded = false }: BreakEvenAnalysisProps) {
  const [isOpen, setIsOpen] = useState(false);

  // Mode embedded : contenu direct sans Card/Collapsible
  if (embedded) {
    return <BreakEvenContent formData={formData} reelResult={reelResult} microBncResult={microBncResult} revenusSalariesAnnuels={revenusSalariesAnnuels} />;
  }

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <Card className="bg-white/60 dark:bg-gray-900/60 backdrop-blur-xl border border-white/30 dark:border-gray-700/30 shadow-lg overflow-hidden">
        <CollapsibleTrigger asChild>
          <CardHeader className="pb-3 cursor-pointer hover:bg-muted/30 transition-colors">
            <CardTitle className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-gradient-to-br from-hippo-400 to-hippo-600 shadow-lg shadow-hippo-500/20">
                <Scale className="h-5 w-5 text-white" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-foreground">Comprendre la différence</h3>
                <p className="text-xs text-muted-foreground font-normal mt-0.5">
                  Quel régime te fait déduire le plus de ton revenu imposable ?
                </p>
              </div>
              <ChevronDown className={`h-5 w-5 text-muted-foreground transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
            </CardTitle>
          </CardHeader>
        </CollapsibleTrigger>
        
        <CollapsibleContent>
          <CardContent className="pb-6">
            <BreakEvenContent formData={formData} reelResult={reelResult} microBncResult={microBncResult} revenusSalariesAnnuels={revenusSalariesAnnuels} />
          </CardContent>
        </CollapsibleContent>
      </Card>
    </Collapsible>
  );
}
