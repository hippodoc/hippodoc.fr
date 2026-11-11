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
      <div className="sim-panneau">
        <div className="flex items-center gap-2 mb-3">
          <Landmark className="sim-marque h-4 w-4" />
          <span className="sim-panneau-titre">
            Tes acomptes libéraux
          </span>
        </div>
        <div className="sim-texte space-y-2">
          <div className="flex items-center gap-2">
            <span className="sim-encre3">→</span>
            <span>Prélevés le <strong className="sim-encre">15 de chaque mois</strong> sur ton compte bancaire</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="sim-encre3">→</span>
            <span>
              Montant estimé : <strong className="sim-encre">~{mensuelMedecin.toLocaleString('fr-FR')} €/mois</strong>
              <span className="sim-encre3 ml-1">({impotEstimeMedecin.toLocaleString('fr-FR')} €/an)</span>
            </span>
          </div>
        </div>
      </div>

      {/* Section 2: Répartition couple (conditionnel) */}
      {hasRevenusConjoint && (
        <div className="sim-panneau space-y-4">
          <div className="flex items-center gap-2">
            <Heart className="sim-marque h-4 w-4" />
            <span className="sim-panneau-titre">
              Répartition au sein du couple
            </span>
          </div>
          
          <div className="sim-tableau">
            <table className="w-full">
              <thead>
                <tr>
                  <th className="text-left">Qui</th>
                  <th className="text-right">Taux</th>
                  <th className="text-right hidden sm:table-cell">Annuel</th>
                  <th className="text-right">Mensuel</th>
                  <th className="text-right hidden sm:table-cell">Mode</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>
                    <div className="flex items-center gap-2">
                      <Landmark className="sim-marque h-3.5 w-3.5" />
                      <span className="sim-fort">Toi</span>
                    </div>
                  </td>
                  <td className="text-right">
                    <span>~{tauxMedecin}%</span>
                  </td>
                  <td className="text-right hidden sm:table-cell">
                    ~{impotEstimeMedecin.toLocaleString('fr-FR')} €
                  </td>
                  <td className="sim-fort text-right">
                    ~{mensuelMedecin.toLocaleString('fr-FR')} €
                  </td>
                  <td className="mode text-right hidden sm:table-cell">
                    acomptes
                  </td>
                </tr>
                <tr>
                  <td>
                    <div className="flex items-center gap-2">
                      <Briefcase className="sim-marque h-3.5 w-3.5" />
                      <span className="sim-fort">Conjoint</span>
                    </div>
                  </td>
                  <td className="text-right">
                    <span>~{tauxConjoint}%</span>
                  </td>
                  <td className="text-right hidden sm:table-cell">
                    ~{impotEstimeConjoint.toLocaleString('fr-FR')} €
                  </td>
                  <td className="sim-fort text-right">
                    ~{mensuelConjoint.toLocaleString('fr-FR')} €
                  </td>
                  <td className="mode text-right hidden sm:table-cell">
                    sur salaire
                  </td>
                </tr>
                <tr className="total">
                  <td>
                    <span className="sim-fort">📌 Total foyer</span>
                  </td>
                  <td className="text-right">
                    <span>~{tauxFoyer}%</span>
                  </td>
                  <td className="sim-fort text-right hidden sm:table-cell">
                    {safeImpotEstime.toLocaleString('fr-FR')} €
                  </td>
                  <td className="sim-fort text-right">
                    {mensuelTotal.toLocaleString('fr-FR')} €
                  </td>
                  <td className="hidden sm:table-cell"></td>
                </tr>
              </tbody>
            </table>
          </div>
          
          <div className="sim-note info flex items-start gap-2.5">
            <Lightbulb className="h-4 w-4 flex-shrink-0 mt-0.5" />
            <div className="sim-note-in">
              <strong>Pourquoi deux taux différents ?</strong>
              <p className="mt-1">
                Depuis septembre 2025, la DGFiP applique automatiquement un taux individualisé pour chaque conjoint. 
                L'impôt total du foyer reste identique, seule la répartition change.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Section 3: Régularisation annuelle */}
      <div className="sim-panneau">
        <div className="flex items-center gap-2 mb-3">
          <Calendar className="sim-marque h-4 w-4" />
          <span className="sim-panneau-titre">
            Régularisation annuelle
          </span>
        </div>
        
        <p className="sim-texte mb-3">
          L'impôt ci-dessus est une <strong>estimation</strong>. Après ta déclaration, la DGFiP régularise :
        </p>
        
        <div className="grid gap-2">
          <div className="sim-note ok flex items-center gap-3">
            <CheckCircle2 className="h-4 w-4 flex-shrink-0" />
            <span className="sim-note-in">
              <strong>Trop payé</strong> → Remboursement en juillet/août
            </span>
          </div>
          <div className="sim-note attn flex items-center gap-3">
            <AlertTriangle className="h-4 w-4 flex-shrink-0" />
            <span className="sim-note-in">
              <strong>Pas assez</strong> → Solde en 4 fois (sept → déc) si &gt; 300€
            </span>
          </div>
        </div>
      </div>

      {/* Section 4: Décalage des acomptes */}
      <div className="sim-panneau">
        <div className="flex items-center gap-2 mb-3">
          <Clock className="sim-marque h-4 w-4" />
          <span className="sim-panneau-titre">
            Mise à jour de tes acomptes
          </span>
        </div>
        
        <div className="sim-texte space-y-2 mb-3">
          <div className="flex items-center gap-2">
            <span className="sim-encre3">•</span>
            <span><strong>Janv → Août {annee}</strong> : basés sur tes revenus {annee - 2}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="sim-encre3">•</span>
            <span><strong>Sept → Déc {annee}</strong> : mis à jour avec {annee - 1}</span>
          </div>
        </div>

        <div className="sim-note attn flex items-start gap-2 mb-2">
          <Lightbulb className="h-4 w-4 flex-shrink-0 mt-0.5" />
          <p className="sim-note-in">
            <strong>1ère année d'installation ?</strong> Tu n'as ni acomptes URSSAF/CARMF (pas de N-1) ni acomptes IR
            tant que tu n'as pas déclaré — ton Super-Net mensuel est temporairement plus élevé. Mets de côté ~30-45 % pour anticiper la régularisation.
          </p>
        </div>
        
        <div className="sim-note info flex items-start gap-2">
          <Lightbulb className="h-4 w-4 flex-shrink-0 mt-0.5" />
          <p className="sim-note-in">
            Revenus très différents ? Tu peux demander une{' '}
            <a 
              href="https://www.impots.gouv.fr/particulier/le-prelevement-la-source" 
              target="_blank" rel="noopener noreferrer" 
              className="sim-lien inline-flex items-center gap-1"
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
      <Card className="sim-fiche overflow-hidden">
        <CollapsibleTrigger asChild>
          <CardHeader className="pb-3 cursor-pointer hover:bg-muted/30 transition-colors">
            <CardTitle className="flex items-center gap-3">
              <div className="sim-rond">
                <Lightbulb className="h-5 w-5" />
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
