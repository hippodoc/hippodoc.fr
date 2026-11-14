import { lazy, Suspense } from "react";
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

/**
 * Chargement différé — `RegimeComparisonCards` est le SEUL consommateur de
 * recharts (5,2 Mo installés) dans tout le site, pour un unique camembert de
 * 100x100 px à trois parts. Importé statiquement, il pesait sur le chunk initial
 * de /simulateur (552 Ko) alors que ce bloc n'apparaît qu'APRÈS soumission du
 * formulaire.
 *
 * Sans risque au rendu serveur : à ce moment `results.recommande` est faux, donc
 * SimulateurResults n'est pas rendu et le `lazy` n'est jamais évalué.
 */
const RegimeComparisonCards = lazy(() =>
  import("./RegimeComparisonCards").then((m) => ({ default: m.RegimeComparisonCards }))
);


export interface SimulateurResultsProps {
  comparison: RegimeComparison;
  /** Point de bascule des charges (`calculerPointDeBascule`) : en attente tant qu'il vaut `undefined`. */
  bascule?: number | null | 'attente';
  formData: SimulateurFormData;
  periode: 'annuel' | 'mensuel';
  onNewSimulation?: () => void;
  /**
   * Toujours `true` sur le site public — le variant "connecté"
   * (ConseilsPersonnalises, app authentifiée) n'est pas porté ici.
   */
  isPublic?: boolean;
}

export function SimulateurResults({ comparison, bascule, formData, periode, onNewSimulation }: SimulateurResultsProps) {
  const { reel, microBnc, recommande, economie } = comparison;

  if (!reel || !recommande) {
    return null;
  }

  const scrollToGuide = () => {
    document.getElementById('guide-patrimonial')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <div
      className="sim-resultats space-y-6 md:space-y-8"
    >
      {/* Titre de la section */}
      <div className="sim-resultats-tete">
        <h2 className="sim-titre">Comparaison des régimes fiscaux</h2>
        <p className="sim-chapo">
          Analyse détaillée pour t'aider à choisir le meilleur régime.{' '}
          {comparison.isRSPMUsed
            ? "Cotisations au RSPM, l'offre simplifiée des remplaçants."
            : "Cotisations au régime des praticiens conventionnés (PAMC), selon le modèle de l'Urssaf."}
        </p>
      </div>

      {/* Cartes de comparaison */}
      <Suspense fallback={<div className="min-h-[220px]" aria-hidden="true" />}>
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
        plafondMicro={comparison.plafondMicro}
      />
      </Suspense>


      {/* ✅ CONCLUSION — En premier, toujours visible */}
      <ConclusionCard comparison={comparison} formData={formData} bascule={bascule} />

      {/* ✅ APPROFONDIR — Accordion unifié avec 2 items */}
      <Accordion type="single" collapsible className="space-y-0">
        <div className="sim-fiche sim-fiche-plis">
          <AccordionItem value="comprendre" className="sim-pli-ligne">
            <AccordionTrigger className="sim-pli-titre hover:no-underline">
              <span className="flex items-center gap-3">
                <div className="sim-rond">
                  <Scale className="h-4 w-4" />
                </div>
                <div className="text-left">
                  <span className="sim-pli-nom">Comprendre la différence</span>
                  <p className="sim-pli-sous">Quel régime te fait déduire le plus ?</p>
                </div>
              </span>
            </AccordionTrigger>
            <AccordionContent className="sim-pli-corps">
              <BreakEvenAnalysis 
                formData={formData}
                reelResult={reel}
                microBncResult={microBnc}
                revenusSalariesAnnuels={comparison.revenusSalariesAnnuels || 0}
                embedded
              />
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="prelevement" className="sim-pli-ligne border-0">
            <AccordionTrigger className="sim-pli-titre hover:no-underline">
              <span className="flex items-center gap-3">
                <div className="sim-rond">
                  <Lightbulb className="h-4 w-4" />
                </div>
                <div className="text-left">
                  <span className="sim-pli-nom">Comment l'impôt sera prélevé</span>
                  <p className="sim-pli-sous">Prélèvement à la source et régularisation</p>
                </div>
              </span>
            </AccordionTrigger>
            <AccordionContent className="sim-pli-corps">
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
                  // En micro-BNC, le bénéfice est celui de l'abattement de 34 % : charges et
                  // cotisations n'y sont pas déduites (elles sont pourtant payées).
                  recommande === 'micro-bnc'
                    ? (microBnc?.impotDetails?.revenuImposableLiberal ?? 0) + (comparison.revenusSalariesAnnuels ?? 0)
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
        <p className="sim-surtitre text-center">
          Et maintenant ?
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-2xl mx-auto">
          <button
            onClick={scrollToGuide}
            className="sim-porte group flex items-center gap-3 text-left"
          >
            <div className="sim-rond shrink-0">
              <Compass className="h-4 w-4" />
            </div>
            <div>
              <p className="sim-porte-nom">Guide Patrimonial</p>
              <p className="sim-porte-sous">Optimise ton Super-Net</p>
            </div>
            <ArrowDown className="sim-encre3 h-4 w-4 ml-auto" />
          </button>

          <button
            onClick={() => { window.location.href = `${APP_URL}/analyses/budget`; }}
            className="sim-porte group flex items-center gap-3 text-left"
          >
            <div className="sim-rond shrink-0">
              <PiggyBank className="h-4 w-4" />
            </div>
            <div>
              <p className="sim-porte-nom">Planifier mon budget</p>
              <p className="sim-porte-sous">Organise tes dépenses</p>
            </div>
          </button>
        </div>
      </div>

      {/* Guide Patrimonial Premium - teaser (variant public uniquement) */}
      <div className="pt-4" id="guide-patrimonial">
        <GuidePatrimonialTeaser />
      </div>

      {/* Disclaimer global unifié */}
      <div className={cn('sim-fiche sim-limites')}>
        <div className="sim-limites-filet" />
        
        <div className="space-y-4">
          <div className="flex items-start gap-3">
            <Info className="sim-marque h-5 w-5 flex-shrink-0 mt-0.5" />
            <div className="space-y-3">
              <h4 className="sim-limites-titre">
                Limites de cette simulation
              </h4>
              <p className="sim-texte">
                Cette simulation est fournie à titre indicatif. Elle ne prend pas en compte 
                tes spécificités fiscales individuelles, les évolutions réglementaires, 
                ou les optimisations spécifiques à ta situation.
              </p>
              <p className="sim-texte sim-fort">
                Pour une analyse personnalisée, consulte :
              </p>
              <div className="flex flex-wrap gap-2">
                <span className="sim-puce neutre grande">
                  Expert-comptable
                </span>
                <span className="sim-puce neutre grande">
                  Avocat fiscaliste
                </span>
                <span className="sim-puce neutre grande">
                  CGP indépendant
                </span>
                <a 
                  href="https://mon-entreprise.urssaf.fr" 
                  target="_blank" rel="noopener noreferrer" 
                  className="sim-puce info grande lien"
                >
                  Simulateur URSSAF ↗
                </a>
              </div>
              <p className="sim-petit pt-1">
                Hippodoc t'aide à y voir plus clair, mais seul un professionnel 
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
            className="sim-btn sim-btn-ligne"
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
