import { FileText, Calculator, Info, ArrowRight } from "lucide-react";
import type { SimulateurFormData } from "./simulateurSchema";
import type { SimulationResult } from "@/lib/simulation-types";
import { deductionsComparees } from "@/lib/simulateur/deductions";

/**
 * Le pli « Comprendre la différence » (rendu seul dans un pli de SimulateurResults ; la
 * variante en carte repliable, inemployée, est retirée en § 9.ft). Les montants viennent de
 * `deductionsComparees`, comme la phrase « pourquoi » de la conclusion : avant novembre 2026,
 * le PER et l'exonération de zone étaient comptés au réel seulement, alors qu'ils jouent aussi
 * en micro, et le bénéfice imposable du micro était recalculé ici à côté du moteur.
 */
interface BreakEvenAnalysisProps {
  formData: SimulateurFormData;
  reelResult: SimulationResult;
  microBncResult: SimulationResult | null;
  /** Recettes imposables (PDSA exonérée retirée). */
  recettesImposables: number;
  /** Cotisations au RSPM : les mêmes dans les deux régimes. */
  isRSPM?: boolean;
}

export function BreakEvenAnalysis({ formData, reelResult, microBncResult, recettesImposables, isRSPM = false }: BreakEvenAnalysisProps) {
  if (!microBncResult) return null;
  const d = deductionsComparees(reelResult, microBncResult, recettesImposables, formData.typeCotisationsVolontaires);
  const abattementMicro = d.micro;
  const totalDeductionsReel = d.reel;
  const pourcentageReel = recettesImposables > 0 ? Math.round((totalDeductionsReel / recettesImposables) * 100) : 0;
  const beneficeMicro = Math.max(0, recettesImposables - abattementMicro);
  const beneficeReel = Math.max(0, recettesImposables - totalDeductionsReel);

  // Le détail du réel, tel que le moteur l'a déduit (cotisations : la part déductible, sans la
  // CSG-CRDS non déductible).
  const optim = reelResult.optimisationsAppliquees;
  const chargesProAnnuelles = reelResult.chargesReelles ?? 0;
  const cotisationsReel = reelResult.impotDetails?.cotisationsDeduites ?? reelResult.cotisationsTotales;
  const madelin = formData.typeCotisationsVolontaires === 'madelin' ? (optim?.cotisationsVolontaires ?? 0) : 0;

  // Différence
  const difference = abattementMicro - totalDeductionsReel;
  const microAvantage = difference > 0;
  const equilibre = Math.abs(difference) < 500;
  const ecartCotisations = Math.round(microBncResult.cotisationsTotales - reelResult.cotisationsTotales);

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
        En <strong className="sim-encre">Micro-BNC</strong>, un abattement de 34{'\u00a0'}% est retiré d'office de tes recettes.
        Au <strong className="sim-encre">régime réel</strong>, tu déduis tes vraies dépenses : charges et cotisations.
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
              Plus tu déduis, moins tu paies d'impôt.
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
              <span className="sim-texte">{d.microMinimum ? 'Abattement minimal' : 'Abattement de 34\u00a0%'}</span>
              <span className="sim-montant">{formatMontant(abattementMicro)}</span>
            </div>
            <p className="sim-petit droit">(forfait automatique)</p>
          </div>
          
          <div className="sim-filet pt-3 mt-3">
            <div className="flex justify-between items-center">
              <span className="sim-texte sim-fort">Total déduit</span>
              <div className="text-right">
                <span className="sim-montant grand">{formatMontant(abattementMicro)}</span>
                <p className="sim-petit droit">({d.microMinimum ? '305\u00a0€' : '34\u00a0%'})</p>
              </div>
            </div>
          </div>
          
          {/* Bénéfice imposable */}
          <div className="sim-filet pt-2 mt-2">
            <div className="flex justify-between items-center">
              <span className="sim-petit droit flex items-center gap-1">
                <ArrowRight className="h-3 w-3" />
                Bénéfice imposable
              </span>
              <span className="sim-montant">
                {formatMontant(beneficeMicro)}
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
                <span className="sim-texte">+ Forfait 2{'\u00a0'}%</span>
                <span className="sim-montant">{formatMontant(optim.forfait2pct)}</span>
              </div>
            )}
            {optim && optim.deductionsS1 && optim.deductionsS1 > 0 && (
              <div className="flex justify-between items-center">
                <span className="sim-texte">+ Forfait 3{'\u00a0'}% et groupe III</span>
                <span className="sim-montant">{formatMontant(optim.deductionsS1)}</span>
              </div>
            )}
            {madelin > 0 && (
              <div className="flex justify-between items-center">
                <span className="sim-texte">+ Madelin</span>
                <span className="sim-montant">{formatMontant(madelin)}</span>
              </div>
            )}
            {optim && optim.chequesVacances && optim.chequesVacances > 0 && (
              <div className="flex justify-between items-center">
                <span className="sim-texte">+ Chèques-vacances</span>
                <span className="sim-montant">{formatMontant(optim.chequesVacances)}</span>
              </div>
            )}
            {d.zoneReelSeul > 0 && (
              <div className="flex justify-between items-center">
                <span className="sim-texte">+ Exonération de zone</span>
                <span className="sim-montant">{formatMontant(d.zoneReelSeul)}</span>
              </div>
            )}
          </div>
          
          <div className="sim-filet pt-3 mt-3">
            <div className="flex justify-between items-center">
              <span className="sim-texte sim-fort">Total déduit</span>
              <div className="text-right">
                <span className="sim-montant grand">{formatMontant(totalDeductionsReel)}</span>
                <p className="sim-petit droit">({pourcentageReel}{'\u00a0'}%)</p>
              </div>
            </div>
          </div>
          
          {/* Bénéfice imposable */}
          <div className="sim-filet pt-2 mt-2">
            <div className="flex justify-between items-center">
              <span className="sim-petit droit flex items-center gap-1">
                <ArrowRight className="h-3 w-3" />
                Bénéfice imposable
              </span>
              <span className="sim-montant">
                {formatMontant(beneficeReel)}
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
                {microAvantage ? 'Le Micro-BNC' : 'Le régime réel'} te fait déduire{' '}
                <strong>{formatMontant(Math.abs(difference))}</strong> de plus
              </span>
            </p>
            <p className="sim-petit droit text-center mt-1">
              {microAvantage
                ? "L'abattement de 34\u00a0% dépasse tes déductions réelles."
                : "Tes déductions réelles dépassent l'abattement de 34\u00a0%."}
            </p>
          </div>
        )}
      </div>

      {(d.perEnsuite || d.zoneEnsuite) && (
        <p className="sim-petit droit">
          {d.perEnsuite && d.zoneEnsuite
            ? "Ton épargne retraite (PER) et ton exonération de zone viennent ensuite, dans les deux régimes."
            : d.perEnsuite
              ? "Ton épargne retraite (PER) se déduit ensuite, dans les deux régimes."
              : "Ton exonération de zone s'applique ensuite, dans les deux régimes."}
        </p>
      )}

      {/* Les cotisations aussi diffèrent en PAMC (au RSPM, elles sont les mêmes) */}
      {!isRSPM && Math.abs(ecartCotisations) >= 100 && (
        <p className="sim-texte">
          Tes cotisations changent aussi : au réel, elles se calculent sur {(formData.annee || 2026) >= 2025
            ? <>tes recettes moins tes charges, abattues de 26{'\u00a0'}%</>
            : 'ton bénéfice'} ; en micro, sur tes recettes après l'abattement de 34{'\u00a0'}%. Ici, elles sont {ecartCotisations > 0 ? 'plus basses' : 'plus élevées'} de{' '}
          <strong className="sim-encre">{formatMontant(Math.abs(ecartCotisations))}</strong> au réel.
        </p>
      )}

      {/* Le Micro-BNC ne joue que sur l'impôt : les charges restent payées */}
      {microAvantage && !equilibre && (
        <div className="sim-note neutre flex items-start gap-2">
          <Info className="sim-marque h-4 w-4 flex-shrink-0 mt-0.5" aria-hidden="true" />
          <p>
            <strong>À noter :</strong> en Micro-BNC, tu paies quand même tes charges réelles,
            mais elles ne sont pas déduites de ton impôt.
          </p>
        </div>
      )}
    </div>
  );
}
