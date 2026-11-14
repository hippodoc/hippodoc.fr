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

  // MICRO-BNC : Abattement forfaitaire 34% (SEULE déduction fiscale), minimum 305 €,
  // sur les recettes imposables (la part PDSA exonérée n'entre pas dans le bénéfice).
  const pdsaAnnuel = formData.periode === 'mensuel'
    ? (formData.revenusExoneresPdsa || 0) * 12
    : (formData.revenusExoneresPdsa || 0);
  const recettesImposables = Math.max(0, recettesAnnuelles - pdsaAnnuel);
  const abattementMicro = Math.min(recettesImposables, Math.max(305, recettesImposables * 0.34));
  
  // RÉGIME RÉEL : Utiliser les données du moteur (inclut toutes les optimisations Phase 1/2/3).
  // Cotisations : la part déductible (sans la CSG-CRDS non déductible).
  const cotisationsReel = reelResult.impotDetails?.cotisationsDeduites ?? reelResult.cotisationsTotales;
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
  const pourcentageReel = recettesImposables > 0 
    ? (totalDeductionsReel / recettesImposables) * 100 
    : 0;

  // ✅ Utiliser les revenus imposables du moteur (déjà corrects)
  const beneficeImposableLiberalMicro = recettesImposables - abattementMicro;
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
      <p className="sim-texte">
        En <strong className="sim-encre">Micro-BNC</strong>, l'État te donne automatiquement un abattement de 34%. 
        En <strong className="sim-encre">Régime Réel</strong>, tu déduis tes vraies dépenses (charges + cotisations).
      </p>

      {/* Bloc pédagogique : C'est quoi "déduire" ? */}
      <div className="sim-panneau">
        <div className="flex items-start gap-2">
          <Info className="sim-marque h-4 w-4 mt-0.5 flex-shrink-0" />
          <div className="space-y-1">
            <p className="sim-texte sim-fort">
              Déduire, c'est quoi ?
            </p>
            <p className="sim-petit droit">
              Ton impôt est calculé sur ton <strong>bénéfice imposable</strong> :
            </p>
            <div className="sim-formule flex items-center gap-2">
              <span>CA</span>
              <span className="sim-encre3">−</span>
              <span className="sim-marque">Déductions</span>
              <span className="sim-encre3">=</span>
              <span className="sim-fort">Imposable</span>
            </div>
            <p className="sim-petit droit">
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
          className="sim-colonne space-y-3"
        >
          <div className="flex items-center gap-2 mb-3">
            <div className="sim-rond blanc">
              <FileText className="h-4 w-4" />
            </div>
            <span className="sim-colonne-nom">MICRO-BNC</span>
          </div>
          
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="sim-texte">Abattement 34%</span>
              <span className="sim-montant">{formatMontant(abattementMicro)}</span>
            </div>
            <p className="sim-petit droit">(forfait automatique)</p>
          </div>
          
          <div className="sim-filet pt-3 mt-3">
            <div className="flex justify-between items-center">
              <span className="sim-texte sim-fort">Total déduit</span>
              <div className="text-right">
                <span className="sim-montant grand">{formatMontant(abattementMicro)}</span>
                <p className="sim-petit droit">(34%)</p>
              </div>
            </div>
          </div>
          
          {/* Bénéfice imposable */}
          <div className="sim-filet pt-2 mt-2">
            <div className="flex justify-between items-center">
              <span className="sim-petit droit flex items-center gap-1">
                <ArrowRight className="h-3 w-3" />
                Imposable
              </span>
              <span className="sim-montant">
                {formatMontant(beneficeImposableMicro)}
              </span>
            </div>
          </div>
        </div>

        {/* VS Central */}
        <div 
          className="hidden md:flex items-center justify-center"
        >
          <div className="sim-vs">
            <span>VS</span>
          </div>
        </div>

        {/* Colonne Régime Réel */}
        <div 
          className="sim-colonne space-y-3"
        >
          <div className="flex items-center gap-2 mb-3">
            <div className="sim-rond blanc">
              <Calculator className="h-4 w-4" />
            </div>
            <span className="sim-colonne-nom">RÉGIME RÉEL</span>
          </div>
          
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="sim-texte">Charges pro</span>
              <span className="sim-montant">{formatMontant(chargesProAnnuelles)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="sim-texte">+ Cotisations déductibles</span>
              <span className="sim-montant">{formatMontant(cotisationsReel)}</span>
            </div>
            {optim && optim.forfait2pct && optim.forfait2pct > 0 && (
              <div className="flex justify-between items-center">
                <span className="sim-texte">+ Forfait 2%</span>
                <span className="sim-montant">{formatMontant(optim.forfait2pct)}</span>
              </div>
            )}
            {optim && optim.deductionsS1 && optim.deductionsS1 > 0 && (
              <div className="flex justify-between items-center">
                <span className="sim-texte">+ Déductions S1</span>
                <span className="sim-montant">{formatMontant(optim.deductionsS1)}</span>
              </div>
            )}
            {optim && optim.cotisationsVolontaires && optim.cotisationsVolontaires > 0 && (
              <div className="flex justify-between items-center">
                <span className="sim-texte">+ PER/Madelin</span>
                <span className="sim-montant">{formatMontant(optim.cotisationsVolontaires)}</span>
              </div>
            )}
            {optim && optim.exonerationZone && optim.exonerationZone > 0 && (
              <div className="flex justify-between items-center">
                <span className="sim-texte">+ Zone ({Math.round((optim.tauxExonerationZone || 0) * 100)}%)</span>
                <span className="sim-montant">{formatMontant(optim.exonerationZone)}</span>
              </div>
            )}
          </div>
          
          <div className="sim-filet pt-3 mt-3">
            <div className="flex justify-between items-center">
              <span className="sim-texte sim-fort">Total déduit</span>
              <div className="text-right">
                <span className="sim-montant grand">{formatMontant(totalDeductionsReel)}</span>
                <p className="sim-petit droit">({pourcentageReel.toFixed(1)}%)</p>
              </div>
            </div>
          </div>
          
          {/* Bénéfice imposable */}
          <div className="sim-filet pt-2 mt-2">
            <div className="flex justify-between items-center">
              <span className="sim-petit droit flex items-center gap-1">
                <ArrowRight className="h-3 w-3" />
                Imposable
              </span>
              <span className="sim-montant">
                {formatMontant(beneficeImposableReel)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Message de conclusion */}
      <div>
        {equilibre ? (
          <div className="sim-verdict">
            <p className="sim-texte sim-fort text-center">
              À ce niveau de charges, les deux régimes déduisent presque autant
            </p>
          </div>
        ) : (
          <div className="sim-verdict">
            <p className="sim-texte sim-fort text-center">
              <span>
                Le {microAvantage ? 'Micro-BNC' : 'Régime Réel'} te fait déduire{' '}
                <strong>{formatMontant(Math.abs(difference))}</strong> de plus
              </span>
            </p>
            <p className="sim-petit droit text-center mt-1">
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
          className="sim-note neutre flex items-start gap-2"
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
            <Info className="sim-marque h-4 w-4 flex-shrink-0 mt-0.5 cursor-help" />
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
      <Card className="sim-fiche overflow-hidden">
        <CollapsibleTrigger asChild>
          <CardHeader className="pb-3 cursor-pointer hover:bg-muted/30 transition-colors">
            <CardTitle className="flex items-center gap-3">
              <div className="sim-rond">
                <Scale className="h-5 w-5" />
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
