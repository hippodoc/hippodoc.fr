import { useState } from "react";
import { 
  Collapsible, 
  CollapsibleContent, 
  CollapsibleTrigger 
} from "@/components/ui/collapsible";
import { 
  Landmark, 
  Briefcase, 
  Heart, 
  Calendar, 
  Clock,
  ChevronDown,
  Lightbulb,
  ExternalLink,
  CheckCircle2,
  AlertTriangle
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { calculateIndividualizedTax } from "@/lib/individualizedTax";

interface PaymentExplanationProps {
  annee: number;
  hasRevenusSalaries: boolean;
  hasRevenusConjoint: boolean;
  impotEstime: number;
  revenuImposableMedecin?: number;
  revenuImposableConjoint?: number;
  revenuBrutMedecin?: number;
  revenusConjointBrut?: number;
  partsFiscales?: number;
  situationFamiliale?: string;
  embedded?: boolean;
}

function PaymentContent({
  annee,
  hasRevenusSalaries,
  hasRevenusConjoint,
  impotEstime,
  revenuImposableMedecin,
  revenuImposableConjoint,
  revenuBrutMedecin,
  revenusConjointBrut,
  partsFiscales = 2,
  situationFamiliale = 'marie_pacse'
}: Omit<PaymentExplanationProps, 'embedded'>) {
  const taxResult = hasRevenusConjoint 
    ? calculateIndividualizedTax(
        revenuImposableMedecin || 0,
        revenuImposableConjoint || 0,
        revenuBrutMedecin || revenuImposableMedecin || 0,
        revenusConjointBrut || revenuImposableConjoint || 0,
        impotEstime,
        partsFiscales,
        situationFamiliale
      )
    : null;
  
  const impotEstimeMedecin = taxResult?.impotMedecin ?? impotEstime ?? 0;
  const impotEstimeConjoint = taxResult?.impotConjoint ?? 0;
  const tauxMedecin = taxResult?.tauxMedecin ?? 0;
  const tauxConjoint = taxResult?.tauxConjoint ?? 0;
  const tauxFoyer = taxResult?.tauxFoyer ?? 0;
  
  const safeImpotEstime = impotEstime ?? 0;
  const mensuelMedecin = Math.round(impotEstimeMedecin / 12);
  const mensuelConjoint = Math.round(impotEstimeConjoint / 12);
  const mensuelTotal = Math.round(safeImpotEstime / 12);

  return (
    <div className="space-y-5">
      {/* Section 1: Tes acomptes libéraux */}
      <div className="bg-hippo-50/50 dark:bg-hippo-900/20 rounded-xl p-4 border border-hippo-100 dark:border-hippo-800/30">
        <div className="flex items-center gap-2 mb-3">
          <Landmark className="h-4 w-4 text-hippo-600 dark:text-hippo-400" />
          <span className="font-semibold text-slate-700 dark:text-slate-300">
            Tes acomptes libéraux
          </span>
        </div>
        <div className="space-y-2 text-sm text-slate-600 dark:text-slate-400">
          <div className="flex items-center gap-2">
            <span className="text-slate-400">→</span>
            <span>Prélevés le <strong className="text-slate-700 dark:text-slate-300">15 de chaque mois</strong> sur ton compte bancaire</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-slate-400">→</span>
            <span>
              Montant estimé : <strong className="text-hippo-600 dark:text-hippo-400">~{mensuelMedecin.toLocaleString('fr-FR')} €/mois</strong>
              <span className="text-slate-500 ml-1">({impotEstimeMedecin.toLocaleString('fr-FR')} €/an)</span>
            </span>
          </div>
        </div>
      </div>

      {/* Section 2: Répartition couple (conditionnel) */}
      {hasRevenusConjoint && (
        <div className="bg-rose-50/50 dark:bg-rose-900/20 rounded-xl p-4 border border-rose-100 dark:border-rose-800/30 space-y-4">
          <div className="flex items-center gap-2">
            <Heart className="h-4 w-4 text-rose-600 dark:text-rose-400" />
            <span className="font-semibold text-slate-700 dark:text-slate-300">
              Répartition au sein du couple
            </span>
          </div>
          
          <div className="bg-white/80 dark:bg-slate-800/60 rounded-lg overflow-hidden border border-slate-200/50 dark:border-slate-700/50">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-100/80 dark:bg-slate-700/50 border-b border-slate-200/50 dark:border-slate-600/50">
                  <th className="px-3 py-2 text-left font-medium text-slate-500 dark:text-slate-400">Qui</th>
                  <th className="px-3 py-2 text-right font-medium text-slate-500 dark:text-slate-400">Taux</th>
                  <th className="px-3 py-2 text-right font-medium text-slate-500 dark:text-slate-400 hidden sm:table-cell">Annuel</th>
                  <th className="px-3 py-2 text-right font-medium text-slate-500 dark:text-slate-400">Mensuel</th>
                  <th className="px-3 py-2 text-right font-medium text-slate-500 dark:text-slate-400 hidden sm:table-cell">Mode</th>
                </tr>
              </thead>
              <tbody>
                <tr className="bg-hippo-50/30 dark:bg-hippo-900/10 border-b border-slate-200/30 dark:border-slate-700/30">
                  <td className="px-3 py-2.5">
                    <div className="flex items-center gap-2">
                      <Landmark className="h-3.5 w-3.5 text-hippo-600 dark:text-hippo-400" />
                      <span className="font-medium text-slate-700 dark:text-slate-300">Toi</span>
                    </div>
                  </td>
                  <td className="px-3 py-2.5 text-right">
                    <span className="text-hippo-600 dark:text-hippo-400 font-medium">~{tauxMedecin}%</span>
                  </td>
                  <td className="px-3 py-2.5 text-right text-slate-600 dark:text-slate-400 hidden sm:table-cell">
                    ~{impotEstimeMedecin.toLocaleString('fr-FR')} €
                  </td>
                  <td className="px-3 py-2.5 text-right font-medium text-hippo-600 dark:text-hippo-400">
                    ~{mensuelMedecin.toLocaleString('fr-FR')} €
                  </td>
                  <td className="px-3 py-2.5 text-right text-xs text-slate-500 hidden sm:table-cell">
                    acomptes
                  </td>
                </tr>
                <tr className="bg-blue-50/30 dark:bg-blue-900/10 border-b border-slate-200/30 dark:border-slate-700/30">
                  <td className="px-3 py-2.5">
                    <div className="flex items-center gap-2">
                      <Briefcase className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />
                      <span className="font-medium text-slate-700 dark:text-slate-300">Conjoint</span>
                    </div>
                  </td>
                  <td className="px-3 py-2.5 text-right">
                    <span className="text-blue-600 dark:text-blue-400 font-medium">~{tauxConjoint}%</span>
                  </td>
                  <td className="px-3 py-2.5 text-right text-slate-600 dark:text-slate-400 hidden sm:table-cell">
                    ~{impotEstimeConjoint.toLocaleString('fr-FR')} €
                  </td>
                  <td className="px-3 py-2.5 text-right font-medium text-blue-600 dark:text-blue-400">
                    ~{mensuelConjoint.toLocaleString('fr-FR')} €
                  </td>
                  <td className="px-3 py-2.5 text-right text-xs text-slate-500 hidden sm:table-cell">
                    sur salaire
                  </td>
                </tr>
                <tr className="bg-slate-50/80 dark:bg-slate-800/50">
                  <td className="px-3 py-2.5">
                    <span className="font-semibold text-slate-700 dark:text-slate-300">📌 Total foyer</span>
                  </td>
                  <td className="px-3 py-2.5 text-right">
                    <span className="text-slate-500 text-xs">~{tauxFoyer}%</span>
                  </td>
                  <td className="px-3 py-2.5 text-right font-semibold text-slate-700 dark:text-slate-300 hidden sm:table-cell">
                    {safeImpotEstime.toLocaleString('fr-FR')} €
                  </td>
                  <td className="px-3 py-2.5 text-right font-semibold text-slate-700 dark:text-slate-300">
                    {mensuelTotal.toLocaleString('fr-FR')} €
                  </td>
                  <td className="px-3 py-2.5 hidden sm:table-cell"></td>
                </tr>
              </tbody>
            </table>
          </div>
          
          <div className="flex items-start gap-2.5 p-3 bg-blue-50/80 dark:bg-blue-900/20 rounded-lg border border-blue-200/50 dark:border-blue-800/30">
            <Lightbulb className="h-4 w-4 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
            <div className="text-xs text-blue-700 dark:text-blue-300">
              <strong>Pourquoi deux taux différents ?</strong>
              <p className="mt-1 text-blue-600/90 dark:text-blue-400/90">
                Depuis septembre 2025, la DGFiP applique automatiquement un taux individualisé pour chaque conjoint. 
                L'impôt total du foyer reste identique, seule la répartition change.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Section 3: Régularisation annuelle */}
      <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-4 border border-slate-200/50 dark:border-slate-700/50">
        <div className="flex items-center gap-2 mb-3">
          <Calendar className="h-4 w-4 text-slate-600 dark:text-slate-400" />
          <span className="font-semibold text-slate-700 dark:text-slate-300">
            Régularisation annuelle
          </span>
        </div>
        
        <p className="text-sm text-slate-600 dark:text-slate-400 mb-3">
          L'impôt ci-dessus est une <strong>estimation</strong>. Après ta déclaration, la DGFiP régularise :
        </p>
        
        <div className="grid gap-2">
          <div className="flex items-center gap-3 p-2.5 bg-emerald-50/80 dark:bg-emerald-900/20 rounded-lg border border-emerald-200/50 dark:border-emerald-800/30">
            <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400 flex-shrink-0" />
            <span className="text-sm text-emerald-700 dark:text-emerald-300">
              <strong>Trop payé</strong> → Remboursement en juillet/août
            </span>
          </div>
          <div className="flex items-center gap-3 p-2.5 bg-amber-50/80 dark:bg-amber-900/20 rounded-lg border border-amber-200/50 dark:border-amber-800/30">
            <AlertTriangle className="h-4 w-4 text-amber-600 dark:text-amber-400 flex-shrink-0" />
            <span className="text-sm text-amber-700 dark:text-amber-300">
              <strong>Pas assez</strong> → Solde en 4 fois (sept → déc) si &gt; 300€
            </span>
          </div>
        </div>
      </div>

      {/* Section 4: Décalage des acomptes */}
      <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-4 border border-slate-200/50 dark:border-slate-700/50">
        <div className="flex items-center gap-2 mb-3">
          <Clock className="h-4 w-4 text-slate-600 dark:text-slate-400" />
          <span className="font-semibold text-slate-700 dark:text-slate-300">
            Mise à jour de tes acomptes
          </span>
        </div>
        
        <div className="space-y-2 text-sm text-slate-600 dark:text-slate-400 mb-3">
          <div className="flex items-center gap-2">
            <span className="text-slate-400">•</span>
            <span><strong>Janv → Août {annee}</strong> : basés sur tes revenus {annee - 2}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-slate-400">•</span>
            <span><strong>Sept → Déc {annee}</strong> : mis à jour avec {annee - 1}</span>
          </div>
        </div>

        <div className="flex items-start gap-2 p-2.5 bg-amber-50/80 dark:bg-amber-900/20 rounded-lg border border-amber-200/50 dark:border-amber-800/30 mb-2">
          <Lightbulb className="h-4 w-4 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
          <p className="text-xs text-amber-700 dark:text-amber-300">
            <strong>1ère année d'installation ?</strong> Tu n'as ni acomptes URSSAF/CARMF (pas de N-1) ni acomptes IR
            tant que tu n'as pas déclaré — ton Super-Net mensuel est temporairement plus élevé. Mets de côté ~30-45 % pour anticiper la régularisation.
          </p>
        </div>
        
        <div className="flex items-start gap-2 p-2.5 bg-hippo-50/80 dark:bg-hippo-900/20 rounded-lg border border-hippo-200/50 dark:border-hippo-800/30">
          <Lightbulb className="h-4 w-4 text-hippo-600 dark:text-hippo-400 flex-shrink-0 mt-0.5" />
          <p className="text-xs text-hippo-700 dark:text-hippo-300">
            Revenus très différents ? Tu peux demander une{' '}
            <a 
              href="https://www.impots.gouv.fr/particulier/le-prelevement-la-source" 
              target="_blank" rel="noopener noreferrer" 
              className="inline-flex items-center gap-1 font-medium hover:underline"
            >
              modulation
              <ExternalLink className="h-3 w-3" />
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}

export function PaymentExplanation(props: PaymentExplanationProps) {
  const [isOpen, setIsOpen] = useState(false);
  const { embedded = false, ...contentProps } = props;

  // Mode embedded : contenu direct sans Card/Collapsible
  if (embedded) {
    return <PaymentContent {...contentProps} />;
  }

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <Card className="bg-white/60 dark:bg-gray-900/60 backdrop-blur-xl border border-white/30 dark:border-gray-700/30 shadow-lg overflow-hidden">
        <CollapsibleTrigger asChild>
          <CardHeader className="pb-3 cursor-pointer hover:bg-muted/30 transition-colors">
            <CardTitle className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-gradient-to-br from-hippo-400 to-hippo-600 shadow-lg shadow-hippo-500/20">
                <Lightbulb className="h-5 w-5 text-white" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-foreground">
                  Comment cet impôt sera prélevé ?
                </h3>
                <p className="text-xs text-muted-foreground font-normal mt-0.5">
                  Prélèvement à la source et régularisation
                </p>
              </div>
              <ChevronDown className={cn(
                "h-5 w-5 text-muted-foreground transition-transform duration-200",
                isOpen && "rotate-180"
              )} />
            </CardTitle>
          </CardHeader>
        </CollapsibleTrigger>

        <CollapsibleContent>
          <CardContent className="pb-6">
            <PaymentContent {...contentProps} />
          </CardContent>
        </CollapsibleContent>
      </Card>
    </Collapsible>
  );
}
