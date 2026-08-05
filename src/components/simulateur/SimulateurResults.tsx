import { RegimeComparisonCards } from "./RegimeComparisonCards";

import { BreakEvenAnalysis } from "./BreakEvenAnalysis";
import { ConclusionCard } from "./ConclusionCard";
import { PaymentExplanation } from "./PaymentExplanation";
import { GuidePatrimonialTeaser } from "./GuidePatrimonialTeaser";
import { Button } from "@/components/ui/button";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Info, RotateCcw, Scale, Lightbulb, Compass, PiggyBank, ArrowDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { APP_URL } from "@/lib/site";
import type { RegimeComparison } from "@/lib/simulateur/usePublicodesSimulation";
import type { SimulateurFormData } from "./simulateurSchema";

export interface SimulateurResultsProps {
  comparison: RegimeComparison;
  formData: SimulateurFormData;
  periode: 'annuel' | 'mensuel';
  onNewSimulation?: () => void;
  /**
   * Toujours `true` sur le site public — le variant "connecté"
   * (ConseilsPersonnalises, app authentifiée) n'est pas porté ici.
   */
  isPublic?: boolean;
}

export function SimulateurResults({ comparison, formData, periode, onNewSimulation }: SimulateurResultsProps) {
  const { reel, microBnc, recommande, economie } = comparison;

  if (!reel || !recommande) {
    return null;
  }

  const scrollToGuide = () => {
    document.getElementById('guide-patrimonial')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <div
      className="space-y-6 md:space-y-8"
    >
      {/* Titre de la section */}
      <div className="text-center space-y-2">
        <h2 className="text-xl sm:text-2xl md:text-3xl font-bold">Comparaison des régimes fiscaux</h2>
        <p className="text-muted-foreground">
          Analyse détaillée pour t'aider à choisir le meilleur régime
        </p>
      </div>

      {/* Cartes de comparaison */}
      <RegimeComparisonCards
        reel={reel}
        microBnc={microBnc}
        recommande={recommande}
        economie={economie}
        periode={periode}
        recettesAnnuelles={comparison.recettesAnnuelles}
        revenusSalariesAnnuels={comparison.revenusSalariesAnnuels}
        revenusConjointAnnuels={comparison.revenusConjointAnnuels}
        liberalExonereAnnuel={comparison.liberalExonereAnnuel}
        domTomInfo={comparison.domTomInfo}
        lieuExercice={comparison.lieuExercice}
        isRSPMUsed={comparison.isRSPMUsed}
        situationFamiliale={formData.situationFamiliale}
        annee={formData.annee}
      />


      {/* ✅ CONCLUSION — En premier, toujours visible */}
      <ConclusionCard comparison={comparison} formData={formData} />

      {/* ✅ APPROFONDIR — Accordion unifié avec 2 items */}
      <Accordion type="single" collapsible className="space-y-0">
        <div className="rounded-2xl overflow-hidden bg-white/60 dark:bg-gray-900/60 backdrop-blur-xl border border-white/30 dark:border-gray-700/30 shadow-lg">
          <AccordionItem value="comprendre" className="border-b border-slate-200/30 dark:border-slate-700/30">
            <AccordionTrigger className="px-4 sm:px-6 py-4 hover:no-underline hover:bg-muted/30 transition-colors">
              <span className="flex items-center gap-3">
                <div className="p-1.5 rounded-lg bg-gradient-to-br from-hippo-100 to-hippo-200 dark:from-hippo-800/50 dark:to-hippo-700/50">
                  <Scale className="h-4 w-4 text-hippo-600 dark:text-hippo-400" />
                </div>
                <div className="text-left">
                  <span className="text-sm font-semibold text-foreground">Comprendre la différence</span>
                  <p className="text-xs text-muted-foreground font-normal mt-0.5">Quel régime te fait déduire le plus ?</p>
                </div>
              </span>
            </AccordionTrigger>
            <AccordionContent className="px-4 sm:px-6 pb-6">
              <BreakEvenAnalysis 
                formData={formData}
                reelResult={reel}
                microBncResult={microBnc}
                revenusSalariesAnnuels={comparison.revenusSalariesAnnuels || 0}
                embedded
              />
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="prelevement" className="border-0">
            <AccordionTrigger className="px-4 sm:px-6 py-4 hover:no-underline hover:bg-muted/30 transition-colors">
              <span className="flex items-center gap-3">
                <div className="p-1.5 rounded-lg bg-gradient-to-br from-hippo-100 to-hippo-200 dark:from-hippo-800/50 dark:to-hippo-700/50">
                  <Lightbulb className="h-4 w-4 text-hippo-600 dark:text-hippo-400" />
                </div>
                <div className="text-left">
                  <span className="text-sm font-semibold text-foreground">Comment l'impôt sera prélevé</span>
                  <p className="text-xs text-muted-foreground font-normal mt-0.5">Prélèvement à la source et régularisation</p>
                </div>
              </span>
            </AccordionTrigger>
            <AccordionContent className="px-4 sm:px-6 pb-6">
              <PaymentExplanation 
                annee={formData.annee}
                hasRevenusSalaries={(comparison.revenusSalariesAnnuels ?? 0) > 0}
                hasRevenusConjoint={(comparison.revenusConjointAnnuels ?? 0) > 0}
                impotEstime={recommande === 'micro-bnc' ? (microBnc?.impot ?? 0) : (reel.impot ?? 0)}
                revenuImposableMedecin={
                  recommande === 'micro-bnc' 
                    ? (microBnc?.impotDetails?.revenuImposableLiberal ?? 0) + (microBnc?.impotDetails?.revenuImposableSalarie ?? 0)
                    : (reel.impotDetails?.revenuImposableLiberal ?? 0) + (reel.impotDetails?.revenuImposableSalarie ?? 0)
                }
                revenuImposableConjoint={
                  recommande === 'micro-bnc' 
                    ? (microBnc?.impotDetails?.revenuImposableConjoint ?? 0)
                    : (reel.impotDetails?.revenuImposableConjoint ?? 0)
                }
                revenuBrutMedecin={
                  recommande === 'micro-bnc'
                    ? (comparison.recettesAnnuelles ?? 0) - (comparison.liberalExonereAnnuel ?? 0) - (microBnc?.chargesReelles ?? 0) - (microBnc?.cotisationsTotales ?? 0) + (comparison.revenusSalariesAnnuels ?? 0)
                    : (comparison.recettesAnnuelles ?? 0) - (comparison.liberalExonereAnnuel ?? 0) - (reel.chargesReelles ?? 0) - reel.cotisationsTotales + (comparison.revenusSalariesAnnuels ?? 0)
                }
                revenusConjointBrut={comparison.revenusConjointAnnuels}
                partsFiscales={recommande === 'micro-bnc' ? (microBnc?.impotDetails?.parts ?? 2) : (reel.impotDetails?.parts ?? 2)}
                situationFamiliale={formData.situationFamiliale}
                embedded
              />
            </AccordionContent>
          </AccordionItem>
        </div>
      </Accordion>

      {/* ✅ CTA "Et maintenant ?" — Standalone léger */}
      <div className="space-y-3">
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider text-center">
          Et maintenant ?
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-2xl mx-auto">
          <button
            onClick={scrollToGuide}
            className="group flex items-center gap-3 p-3 rounded-xl bg-white/60 dark:bg-gray-900/60 backdrop-blur-sm border border-white/40 dark:border-gray-700/40 hover:bg-white/80 dark:hover:bg-gray-800/60 hover:shadow-md hover:scale-[1.02] transition-all duration-200 text-left"
          >
            <div className="shrink-0 p-2 rounded-lg bg-gradient-to-br from-hippo-400 to-hippo-600 shadow-sm">
              <Compass className="h-4 w-4 text-white" />
            </div>
            <div>
              <p className="text-sm font-semibold text-foreground">Guide Patrimonial</p>
              <p className="text-xs text-muted-foreground">Optimise ton Super-Net</p>
            </div>
            <ArrowDown className="h-4 w-4 text-muted-foreground ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
          </button>

          <button
            onClick={() => { window.location.href = `${APP_URL}/analyses/budget`; }}
            className="group flex items-center gap-3 p-3 rounded-xl bg-white/60 dark:bg-gray-900/60 backdrop-blur-sm border border-white/40 dark:border-gray-700/40 hover:bg-white/80 dark:hover:bg-gray-800/60 hover:shadow-md hover:scale-[1.02] transition-all duration-200 text-left"
          >
            <div className="shrink-0 p-2 rounded-lg bg-gradient-to-br from-emerald-400 to-emerald-600 shadow-sm">
              <PiggyBank className="h-4 w-4 text-white" />
            </div>
            <div>
              <p className="text-sm font-semibold text-foreground">Planifier mon budget</p>
              <p className="text-xs text-muted-foreground">Organise tes dépenses</p>
            </div>
          </button>
        </div>
      </div>

      {/* Guide Patrimonial Premium - teaser (variant public uniquement) */}
      <div className="pt-4" id="guide-patrimonial">
        <GuidePatrimonialTeaser />
      </div>

      {/* Disclaimer global unifié */}
      <div className={cn(
        'rounded-2xl overflow-hidden',
        'bg-white/80 dark:bg-slate-900/80',
        'backdrop-blur-xl',
        'border border-slate-200/50 dark:border-slate-700/50',
        'shadow-lg'
      )}>
        <div className="h-1.5 w-full bg-gradient-to-r from-slate-400 to-slate-500" />
        
        <div className="p-4 sm:p-6 space-y-4">
          <div className="flex items-start gap-3">
            <Info className="h-5 w-5 text-slate-500 flex-shrink-0 mt-0.5" />
            <div className="space-y-3">
              <h4 className="font-semibold text-slate-700 dark:text-slate-300">
                Limites de cette simulation
              </h4>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Cette simulation est fournie à titre indicatif. Elle ne prend pas en compte 
                tes spécificités fiscales individuelles, les évolutions réglementaires, 
                ou les optimisations spécifiques à ta situation.
              </p>
              <p className="text-sm font-medium text-slate-700 dark:text-slate-300">
                Pour une analyse personnalisée, consulte :
              </p>
              <div className="flex flex-wrap gap-2 text-xs">
                <span className="px-3 py-1.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                  Expert-comptable
                </span>
                <span className="px-3 py-1.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                  Avocat fiscaliste
                </span>
                <span className="px-3 py-1.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                  CGP indépendant
                </span>
                <a 
                  href="https://mon-entreprise.urssaf.fr" 
                  target="_blank" rel="noopener noreferrer" 
                  className="px-3 py-1.5 rounded-full bg-blue-100 dark:bg-blue-950 text-blue-600 dark:text-blue-400 hover:bg-blue-200 dark:hover:bg-blue-900 transition-colors"
                >
                  Simulateur URSSAF ↗
                </a>
              </div>
              <p className="text-xs text-muted-foreground italic pt-1">
                💡 Hippodoc t'aide à y voir plus clair, mais seul un professionnel 
                pourra te conseiller de manière définitive.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Action principale */}
      {onNewSimulation && (
        <div className="flex justify-center pt-6">
          <Button 
            variant="outline" 
            size="lg"
            onClick={onNewSimulation}
          >
            <RotateCcw className="mr-2 h-5 w-5" />
            Nouvelle simulation
          </Button>
        </div>
      )}
    </div>
  );
}
